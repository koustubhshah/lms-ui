import React, { useState } from "react";
import apiService from "../services/api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await apiService.auth.verifyEmail(email);
      setMessage("Email verified. You can now reset your password.");
      setStep(2);
    } catch (err) {
      setError(err?.message || "Could not verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.resetPassword({ email, newPassword });
      setMessage("Password reset successful. You can now sign in.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] bg-white">
        <div className="p-8 md:p-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset your password</h1>
          <p className="text-sm text-slate-600 mb-6">Follow the steps to reset your password.</p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 text-white py-2.5 font-semibold shadow hover:bg-black transition disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-300 px-6 py-2.5 hover:bg-slate-100"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 text-white px-6 py-2.5 font-semibold hover:bg-black disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}