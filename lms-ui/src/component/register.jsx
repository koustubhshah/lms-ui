import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "./ui/Select";

import { useToast } from "../contexts/ToastContext";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("Male");
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityType, setIdentityType] = useState("Aadhar");
  const [identityImage, setIdentityImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineMsg, setInlineMsg] = useState("");
  const toast = useToast();
  const [step, setStep] = useState(1); 

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        FirstName: firstName,
        LastName: lastName,
        PhoneNumber: phoneNumber,
        Email: email,
        Password: password,
        Gender: gender,
        IdentityNumber: identityNumber,
        IdentityTypes: identityType,
        IdentityImage: identityImage,
      };

      const response = await fetch("http://localhost:5210/api/Identity/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Do not store token or auto-login; redirect to login
        try {
          const { useToast } = await import("../contexts/ToastContext");
        } catch {}
        // Fallback to alert removed; show inline message below via state
        setInlineMsg("Registration submitted! Your account is pending admin approval.");
        navigate("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] bg-white">
        <form onSubmit={handleSubmit} className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-6 text-center">
            Create account
          </h1>

          {inlineMsg && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-sm">{inlineMsg}</div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="col-span-2 sm:col-span-1 rounded-xl border border-slate-300 px-4 py-2.5"
                required
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="col-span-2 sm:col-span-1 rounded-xl border border-slate-300 px-4 py-2.5"
                required
              />
              <input
                type="text"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-300 px-4 py-2.5"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-300 px-4 py-2.5"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-300 px-4 py-2.5"
                required
              />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="col-span-2 mt-6 w-full rounded-xl bg-slate-900 text-white py-2.5 font-semibold hover:bg-black"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
              <Select
                value={gender}
                onChange={setGender}
                options={[
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
                className="col-span-2 sm:col-span-1"
              />
              <input
                type="text"
                placeholder="Identity number"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                className="col-span-2 sm:col-span-1 rounded-xl border border-slate-300 px-4 py-2.5"
              />
              <Select
                value={identityType}
                onChange={setIdentityType}
                options={[
                  { value: "Aadhar", label: "Aadhar" },
                  { value: "PAN", label: "PAN" },
                  { value: "Passport", label: "Passport" },
                ]}
                className="col-span-2"
              />
              <input
                type="text"
                placeholder="Identity image URL"
                value={identityImage}
                onChange={(e) => setIdentityImage(e.target.value)}
                className="col-span-2 rounded-xl border border-slate-300 px-4 py-2.5"
              />

              <div className="col-span-2 flex justify-between mt-6">
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
                  {loading ? "Submitting..." : "Create account"}
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-center text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-slate-900 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
