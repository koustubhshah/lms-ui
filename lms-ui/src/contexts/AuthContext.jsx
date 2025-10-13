import React, { createContext, useState, useContext, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper: decode JWT payload safely
  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (_) {
      return null;
    }
  };

  // Helper: try to extract userId from various possible sources/claim names
  const getUserIdFrom = (obj, token) => {
    // Direct fields from API response
    const direct = obj?.userId || obj?.userID || obj?.id || obj?.Id || obj?.user?.id;
    if (direct) return String(direct);

    // Try JWT claims
    const payload = token ? decodeJwt(token) : null;
    if (payload) {
      const claimCandidates = [
        "sub",
        "nameid",
        "nameId",
        "userId",
        "UserId",
        "uid",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      ];
      for (const key of claimCandidates) {
        if (payload[key]) return String(payload[key]);
      }
    }
    return null;
  };

  // Helper: normalize string values from localStorage (treat 'undefined'/'null' as empty)
  const sanitize = (val) => {
    if (val === undefined || val === null) return null;
    const s = String(val);
    if (s.trim().toLowerCase() === "undefined" || s.trim().toLowerCase() === "null") return null;
    return s;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    const rawToken = localStorage.getItem("token");
    const rawRole = localStorage.getItem("role");
    let storedUserId = localStorage.getItem("userId");

    const token = sanitize(rawToken);
    const role = sanitize(rawRole);
    storedUserId = sanitize(storedUserId);

    // If userId missing or invalid, try derive from token
    let userId = storedUserId;
    if (!userId && token) {
      userId = getUserIdFrom({}, token);
      if (userId) {
        localStorage.setItem("userId", userId);
      }
    }

    console.log('AuthContext: Retrieved from localStorage -', { token: !!token, role, userId });

    if (token && role && userId) {
      const userData = {
        id: userId,
        role,
        token,
      };
      console.log('AuthContext: Setting authenticated user', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      console.log('AuthContext: No valid auth data in localStorage');
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Login attempt with credentials', { identifier: credentials.identifier });
      setLoading(true);
      
      const response = await apiService.auth.login({
        Identifier: credentials.identifier,
        Password: credentials.password,
      });

      console.log('AuthContext: Login API response', response);

      if (response.token) {
        // Gate: block login if role is missing or pending approval
        const roleLower = (response.role || '').toString().toLowerCase();
        if (!response.role || roleLower === 'pending' || roleLower === 'unapproved' || roleLower === 'none') {
          console.warn('AuthContext: Login blocked - user not approved by admin');
          // Ensure no stale auth data is kept
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          setUser(null);
          setIsAuthenticated(false);
          return {
            success: false,
            error: 'Your account is pending admin approval. Please wait until your role is assigned.'
          };
        }
        // Save data to localStorage (use role from login response)
        console.log('AuthContext: Saving auth data to localStorage');
        localStorage.setItem("token", response.token);
        if (response.role) localStorage.setItem("role", response.role);

        // Derive userId from response first, then fallback to token claims
        const derivedUserId = getUserIdFrom(response, response.token);
        if (derivedUserId) {
          localStorage.setItem("userId", derivedUserId);
        } else {
          localStorage.removeItem("userId");
        }

        const userData = {
          id: derivedUserId ?? null,
          role: response.role,
          token: response.token,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        };

        console.log('AuthContext: Setting user state', userData);
        setUser(userData);
        setIsAuthenticated(true);

        return { 
          success: true, 
          user: userData,
          role: response.role
        };
      } else {
        console.error('AuthContext: Invalid login response - missing token');
        return { 
          success: false, 
          error: response.message || "Invalid login response" 
        };
      }
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || "Login failed. Please try again." 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await apiService.auth.register(userData);

      if (response.success) {
        return { success: true, message: response.message };
      }
      return { success: false, error: response.message };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'Admin';
  };

  // Check if user is trainee
  const isTrainee = () => {
    return user?.role === 'trainee' || user?.role === 'Trainee';
  };

  // Get the appropriate dashboard path based on user role
  const getDashboardPath = () => {
    if (isAdmin()) return '/admin/dashboard';
    if (isTrainee()) return '/trainee/dashboard';
    return '/dashboard';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin,
    isTrainee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
