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

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    if (token && role && userId) {
      setUser({
        id: userId,
        role,
        token,
      });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await apiService.auth.login({
        Identifier: credentials.identifier,
        Password: credentials.password,
      });

      if (response.token) {
        // Save data
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);
        localStorage.setItem("userId", response.userId);

        setUser({
          id: response.userId,
          role: response.role,
          token: response.token,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
        });
        setIsAuthenticated(true);

        return { success: true, user: response };
      }

      return { success: false, error: "Invalid login response" };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
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

  const isAdmin = () => user?.role === "Admin";
  const isTrainee = () => user?.role === "Trainee";

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
