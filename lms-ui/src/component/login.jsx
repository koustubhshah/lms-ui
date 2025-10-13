import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log('Login: Attempting to login...');

    try {
      const result = await login({ identifier, password });
      console.log('Login: Login result', { success: result.success, role: result.role });

      if (result.success) {
        // Get the dashboard path based on user role
        let dashboardPath = '/dashboard'; // Default fallback
        
        if (result.role?.toLowerCase() === 'admin') {
          dashboardPath = '/admin/dashboard';
        } else if (result.role?.toLowerCase() === 'trainee') {
          dashboardPath = '/trainee/dashboard';
        }
        
        console.log('Login: Redirecting to', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        const errorMsg = result.error || "Login failed. Please check your credentials and try again.";
        console.error('Login error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Login: Unexpected error during login', err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] bg-white">
        {/* Left: Illustration */}
        <div className="relative hidden md:block bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-white/5 to-transparent"></div>
          <div className="h-full flex items-end p-8 text-white">
            <div>
              <h2 className="text-2xl font-semibold">Learning Management System</h2>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-600">
              Use your credentials to access the LMS
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                placeholder="Enter your email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 text-white py-2.5 font-semibold shadow hover:bg-black transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-slate-900 font-medium hover:underline"
            >
              Forgot password?
            </button>
            <div>
              Don’t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-slate-900 font-medium hover:underline"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
