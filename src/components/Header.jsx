"use client";

import {
  UserIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiMenu } from "react-icons/fi";

export default function Header({ onAddProduct, onMenuToggle }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-bg-secondary/90 backdrop-blur-xl border-b border-border-primary transition-all duration-300">
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-bg-tertiary hover:bg-bg-hover border border-border-primary text-text-secondary hover:text-text-primary transition-all"
            aria-label="Open navigation"
          >
            <FiMenu size={20} />
          </button>

          <div>
            <h1 className="text-base md:text-xl font-bold text-text-heading leading-tight">
              Product Dashboard
            </h1>
            <p className="hidden sm:block text-xs text-text-tertiary mt-0.5">
              Manage your inventory
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 md:p-2.5 rounded-xl bg-bg-tertiary hover:bg-bg-hover border border-border-primary text-text-secondary hover:text-text-primary transition-all"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          {/* Add Product */}
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all text-sm font-medium"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <PlusIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Add Product</span>
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center hover:opacity-90 transition-all"
            >
              <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-bg-card rounded-xl border border-border-primary overflow-hidden"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  <div className="p-3 border-b border-border-primary">
                    <p className="font-semibold text-sm text-text-heading">
                      Admin User
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      admin@studentalliance.com
                    </p>
                  </div>

                  <div className="py-1">
                    <Link href="/profile">
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-hover flex items-center gap-2 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        Profile
                      </button>
                    </Link>
                  </div>

                  <div className="border-t border-border-primary py-1">
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-error hover:bg-error-bg flex items-center gap-2 transition-colors font-medium"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
