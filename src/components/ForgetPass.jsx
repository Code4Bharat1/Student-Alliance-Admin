"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiMail } from "react-icons/fi";

export default function ForgotPass() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // First check if email exists
      await axios.post(
        "/api/auth/check-email",
        { email },
      );
      // Then send OTP
      await axios.post(
        "/api/auth/send-otp",
        { email },
      );
      toast.success("OTP sent to your email!");
      router.push(`/OTP?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
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
            <div className="w-16 h-16 bg-brand-accent rounded-2xl flex items-center justify-center">
              <FiMail className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-heading text-center mb-1">
            Reset Password
          </h2>
          <p className="text-text-tertiary text-center text-sm mb-6">
            We&apos;ll send an OTP to your email
          </p>

          {error && (
            <div className="bg-error-bg text-error text-sm text-center p-3 rounded-xl mb-4 border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-3 text-text-tertiary"
                  size={16}
                />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-xl transition-all text-sm disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            Remember your password?{" "}
            <a
              href="/form"
              className="text-brand-primary font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
