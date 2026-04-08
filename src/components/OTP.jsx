"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiShield } from "react-icons/fi";

export default function OTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pasteData.length, 5)].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/api/auth/verify-otp",
        { email, otp: otpValue },
      );
      toast.success("OTP verified!");
      router.push(`/UpdatePass?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    try {
      await axios.post(
        "/api/auth/send-otp",
        { email },
      );
      toast.success("OTP resent!");
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP.");
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
              <FiShield className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-heading text-center mb-1">
            Verify OTP
          </h2>
          <p className="text-text-tertiary text-center text-sm mb-6">
            Enter the 6-digit code sent to{" "}
            <span className="text-text-primary font-medium">{email}</span>
          </p>

          {error && (
            <div className="bg-error-bg text-error text-sm text-center p-3 rounded-xl mb-4 border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-bg-input border border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-xl transition-all text-sm disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-text-secondary">
            {countdown > 0 ? (
              <p>
                Resend OTP in{" "}
                <span className="text-brand-primary font-medium">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-brand-primary font-medium hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-text-secondary">
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
}
