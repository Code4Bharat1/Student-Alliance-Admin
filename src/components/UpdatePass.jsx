"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const UpdatePass = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/api/auth/update-password",
        { email, password },
      );
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/form"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 relative">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-bg-card border border-border-primary text-text-secondary hover:text-text-primary transition-all"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
      </button>

      <div className="w-full max-w-md">
        <div
          className="bg-bg-card rounded-2xl p-8 border border-border-primary"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center">
              <FiLock className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-heading text-center mb-1">
            Update Password
          </h2>
          <p className="text-text-tertiary text-center text-sm mb-6">
            Create a new secure password
          </p>

          {error && (
            <div className="bg-error-bg text-error text-sm text-center p-3 rounded-xl mb-4 border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-3 text-text-tertiary"
                  size={16}
                />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-input border border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
                  placeholder="••••••••"
                  required
                  minLength="6"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Password Strength */}
              {password && password.length >= 6 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? getStrengthColor() : "bg-border-primary"}`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${passwordStrength <= 2 ? "text-warning" : "text-success"}`}
                  >
                    {getStrengthText()}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-5">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-3 text-text-tertiary"
                  size={16}
                />
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-input border focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-text-primary placeholder-text-tertiary text-sm ${
                    confirm && password !== confirm
                      ? "border-error"
                      : "border-border-primary focus:border-border-focus"
                  }`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-secondary"
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-error text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-xl transition-all text-sm disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            <a
              href="/form"
              className="text-brand-primary font-medium hover:underline"
            >
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePass;
