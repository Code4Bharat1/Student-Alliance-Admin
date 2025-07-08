"use client";

import { UserIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function Header({ onAddProduct }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm ml-64 transition-all duration-300">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left Section - Title */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Product Dashboard
        </motion.h1>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Add Product Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </motion.button>

          {/* User Profile Icon */}
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link href={'/profile'}>
              <button className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                <UserIcon className="h-6 w-6" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}