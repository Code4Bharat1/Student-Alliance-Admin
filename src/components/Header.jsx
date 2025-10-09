"use client";

import { UserIcon, MagnifyingGlassIcon, PlusIcon, BellIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Header({ onAddProduct }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3); // Example notification count

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm ml-64 transition-all duration-300">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Section - Title & Breadcrumb */}
        <div className="flex flex-col">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            Product Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-gray-500 mt-0.5"
          >
            Manage your inventory with ease
          </motion.p>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          {/* <motion.div
            initial={false}
            animate={{ width: isSearchOpen ? 280 : 40 }}
            className="relative"
          >
            <AnimatePresence>
              {isSearchOpen && (
                <motion.input
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm bg-white/50 backdrop-blur"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setIsSearchOpen(false);
                  }}
                />
              )}
            </AnimatePresence>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`absolute right-0 top-0 p-2 rounded-lg transition-all ${
                isSearchOpen
                  ? "text-blue-600 hover:bg-blue-50"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </motion.button>
          </motion.div> */}

          {/* Notifications */}
          {/* <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all relative">
              <BellIcon className="h-5 w-5" />
              {notifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg"
                >
                  {notifications}
                </motion.span>
              )}
            </button>
          </motion.div> */}

          {/* Divider */}
          {/* <div className="h-8 w-px bg-gray-300" /> */}

          {/* Add Product Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm font-medium group relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <PlusIcon className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Add Product</span>
          </motion.button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <UserIcon className="h-5 w-5" />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <p className="font-semibold text-gray-800">Admin User</p>
                    <p className="text-xs text-gray-600 mt-0.5">Siddiquiraheem527@gmail.com</p>
                  </div>
                  
                  <div className="py-2">
                    <Link href="/profile">
                      <motion.button
                        whileHover={{ backgroundColor: "rgb(243 244 246)" }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:text-gray-900 flex items-center gap-3 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <UserIcon className="h-4 w-4" />
                        View Profile
                      </motion.button>
                    </Link>
                    
                    <Link href="/settings">
                      <motion.button
                        whileHover={{ backgroundColor: "rgb(243 244 246)" }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:text-gray-900 flex items-center gap-3 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                        Settings
                      </motion.button>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <motion.button
                      whileHover={{ backgroundColor: "rgb(254 242 242)" }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:text-red-700 flex items-center gap-3 transition-colors font-medium"
                      onClick={() => {
                        setIsProfileOpen(false);
                        // Add logout logic here
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      Log Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}