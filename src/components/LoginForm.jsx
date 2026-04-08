"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginForm({ setIsLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
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
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center">
              <FiLock className="text-white" size={28} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-heading text-center mb-1">
            Welcome Back
          </h2>
          <p className="text-text-tertiary text-center text-sm mb-6">
            Sign in to your admin account
          </p>

          {error && (
            <div className="bg-error-bg text-error text-sm text-center p-3 rounded-xl mb-4 border border-error/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-3 text-text-tertiary"
                  size={16}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-3 text-text-tertiary"
                  size={16}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-bg-input border border-border-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus text-text-primary placeholder-text-tertiary text-sm"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-border-primary text-brand-primary focus:ring-brand-primary"
                />
                Remember me
              </label>
              <a
                href="/forget"
                className="text-sm text-brand-primary hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-medium rounded-xl transition-all text-sm disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="text-brand-primary font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
