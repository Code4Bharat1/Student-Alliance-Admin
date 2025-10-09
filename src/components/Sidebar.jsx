"use client";

import {
  AiOutlineDashboard,
  AiOutlineTool,
  AiOutlineRobot,
} from "react-icons/ai";
import { MdOutlineShoppingCart, MdTv } from "react-icons/md";
import { FiPackage, FiLogOut } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");
  const [productsOpen, setProductsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const path = pathname.split("/")[2] || "dashboard";
    setActiveItem(path);
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", icon: <AiOutlineDashboard />, path: "dashboard", gradient: "from-blue-500 to-indigo-500" },
    { name: "IFPD", icon: <MdTv />, path: "ifpd", gradient: "from-purple-500 to-pink-500" },
    { name: "3D Printers", icon: <AiOutlineTool />, path: "3d-printers", gradient: "from-green-500 to-emerald-500" },
    { name: "STEM & Robotics", icon: <AiOutlineRobot />, path: "stem-robotics", gradient: "from-orange-500 to-red-500" },
    { name: "Orders", icon: <MdOutlineShoppingCart />, path: "orders", gradient: "from-cyan-500 to-blue-500" },
  ];

  const productSubItems = [
    { name: "Camera", path: "camera" },
    { name: "Digital Board", path: "digital_board" },
    { name: "Mic", path: "mic" },
    { name: "Cable", path: "cable" },
    { name: "Speaker", path: "speaker" },
    { name: "Light", path: "light" },
    { name: "Stands", path: "stand" },
    { name: "OPS", path: "ops" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Logout Confirmation</h2>
              <p className="text-gray-600 text-center mb-6">Are you sure you want to logout from your account?</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header with Glow Effect */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10" />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-400 mt-1">Management System</p>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center relative z-10"
            >
              <span className="text-white font-bold text-lg">A</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/${item.path}`}
                onClick={() => setActiveItem(item.path)}
              >
                <motion.div
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center" : "space-x-4"
                  } p-3 rounded-xl transition-all duration-200 ease-in-out relative overflow-hidden group ${
                    activeItem === item.path
                      ? "bg-white/10 shadow-lg"
                      : "hover:bg-white/5"
                  }`}
                >
                  {activeItem === item.path && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient} rounded-r`}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <div className={`relative z-10 ${
                    activeItem === item.path
                      ? `text-2xl bg-gradient-to-br ${item.gradient} p-2 rounded-lg`
                      : "text-2xl text-gray-400 group-hover:text-white transition-colors"
                  }`}>
                    {item.icon}
                  </div>
                  
                  {!isCollapsed && (
                    <motion.span
                      className={`text-sm font-medium relative z-10 ${
                        activeItem === item.path
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }`}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isCollapsed ? 0 : 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          ))}

          {/* Products Dropdown with Enhanced Design */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: menuItems.length * 0.05 }}
            className="relative"
          >
            <motion.button
              whileHover={{ x: 5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              } p-3 rounded-xl transition-all duration-200 ease-in-out relative overflow-hidden group ${
                pathname.includes("products") || productsOpen
                  ? "bg-white/10 shadow-lg"
                  : "hover:bg-white/5"
              }`}
            >
              {(pathname.includes("products") || productsOpen) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="flex items-center space-x-4">
                <div className={`relative z-10 ${
                  pathname.includes("products") || productsOpen
                    ? "text-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg"
                    : "text-2xl text-gray-400 group-hover:text-white transition-colors"
                }`}>
                  <FiPackage />
                </div>
                
                {!isCollapsed && (
                  <span className={`text-sm font-medium ${
                    pathname.includes("products") || productsOpen
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}>
                    Products
                  </span>
                )}
              </div>
              
              {!isCollapsed && (
                <motion.span
                  className="ml-2 text-gray-400"
                  animate={{ rotate: productsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowDown size={16} />
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence initial={false}>
              {!isCollapsed && productsOpen && (
                <motion.div
                  className="mt-2 ml-4 space-y-1 overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="pl-8 border-l-2 border-white/10 space-y-1 max-h-56 overflow-y-auto custom-scrollbar">
                    {productSubItems.map((subItem, idx) => (
                      <Link
                        key={idx}
                        href={`/admin/${subItem.path}`}
                        onClick={() => setActiveItem(subItem.path)}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          whileHover={{ x: 3 }}
                          className={`text-sm px-3 py-2 rounded-lg transition-all ${
                            pathname.includes(subItem.path)
                              ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              pathname.includes(subItem.path)
                                ? "bg-indigo-400"
                                : "bg-gray-600"
                            }`} />
                            {subItem.name}
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </nav>

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
          <motion.button
            whileHover={{ scale: 1.03, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center ${
              isCollapsed ? "justify-center" : "space-x-4"
            } p-3 rounded-xl transition-all duration-200 relative overflow-hidden group bg-red-500/10 hover:bg-red-500/20 border border-red-500/20`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 text-2xl bg-gradient-to-br from-red-400 to-red-600 p-2 rounded-lg">
              <FiLogOut />
            </div>
            
            {!isCollapsed && (
              <motion.span
                className="text-sm font-medium text-red-400 relative z-10"
                initial={{ opacity: 1 }}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.1 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SA</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white"> Admin</p>
                  <p className="text-xs text-gray-400">Siddiquiraheem527@gmail.com</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Scrollbar Style */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.5));
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
          }
        `}</style>
      </motion.aside>
    </>
  );
}