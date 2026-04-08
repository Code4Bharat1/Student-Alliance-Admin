"use client";

import {
  AiOutlineDashboard,
  AiOutlineTool,
  AiOutlineRobot,
} from "react-icons/ai";
import { MdOutlineShoppingCart, MdTv } from "react-icons/md";
import { FiPackage, FiLogOut, FiUsers, FiBarChart2, FiX } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");
  const [productsOpen, setProductsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNavClick = () => {
    if (isMobile && onMobileClose) onMobileClose();
  };

  useEffect(() => {
    const path = pathname.split("/")[2] || "dashboard";
    setActiveItem(path);
  }, [pathname]);

  // Derived state: whether desktop collapse is active
  const collapsed = isCollapsed && !isMobile;

  const menuItems = [
    {
      name: "Dashboard",
      icon: <AiOutlineDashboard size={20} />,
      path: "dashboard",
    },
    { name: "IFPD", icon: <MdTv size={20} />, path: "ifpd" },
    {
      name: "3D Printers",
      icon: <AiOutlineTool size={20} />,
      path: "3d-printers",
    },
    {
      name: "STEM & Robotics",
      icon: <AiOutlineRobot size={20} />,
      path: "stem-robotics",
    },
    {
      name: "Orders",
      icon: <MdOutlineShoppingCart size={20} />,
      path: "orders",
    },
    { name: "Customers", icon: <FiUsers size={20} />, path: "customers" },
    { name: "Analytics", icon: <FiBarChart2 size={20} />, path: "analytics" },
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

  const sidebarVariants = {
    visible: isMobile
      ? { x: 0, width: 260 }
      : { x: 0, width: isCollapsed ? 76 : 260 },
    hidden: { x: -260, width: 260 },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

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
              className="bg-bg-card rounded-2xl p-8 max-w-md w-full mx-4"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="w-16 h-16 bg-error-bg rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLogOut className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-2xl font-bold text-text-heading text-center mb-2">
                Logout
              </h2>
              <p className="text-text-secondary text-center mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-bg-tertiary hover:bg-bg-hover text-text-primary font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-error hover:opacity-90 text-white font-semibold transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 left-0 h-full z-50 text-white flex flex-col border-r border-white/5"
        style={{ background: "var(--bg-sidebar)" }}
        initial={false}
        animate={
          isMobile
            ? { x: mobileOpen ? 0 : -260, width: 260 }
            : { x: 0, width: isCollapsed ? 76 : 260 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/10">
          {!collapsed ? (
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Student Alliance
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Admin Portal</p>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">SA</span>
            </div>
          )}

          {/* Mobile: close button | Desktop: collapse toggle */}
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d={isCollapsed ? "M6 3l5 5-5 5" : "M10 3L5 8l5 5"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p
            className={`text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2 ${collapsed ? "text-center" : "px-3"}`}
          >
            {collapsed ? "•" : "Menu"}
          </p>

          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={`/admin/${item.path}`}
              onClick={() => {
                setActiveItem(item.path);
                handleNavClick();
              }}
            >
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "gap-3"
                } px-3 py-2.5 rounded-lg transition-all duration-150 relative group ${
                  activeItem === item.path
                    ? "bg-brand-primary text-white shadow-md"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={activeItem === item.path ? "text-white" : ""}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* Products Dropdown */}
          <div>
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-between"
              } px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                productsOpen
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                <FiPackage size={20} />
                {!collapsed && (
                  <span className="text-sm font-medium">Products</span>
                )}
              </div>
              {!collapsed && (
                <motion.span
                  animate={{ rotate: productsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IoIosArrowDown size={14} />
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {!collapsed && productsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                    {productSubItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={`/admin/${subItem.path}`}
                        onClick={() => {
                          setActiveItem(subItem.path);
                          handleNavClick();
                        }}
                      >
                        <div
                          className={`text-sm px-3 py-2 rounded-lg transition-all ${
                            activeItem === subItem.path
                              ? "bg-brand-primary/20 text-blue-300 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {subItem.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            } px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all`}
          >
            <FiLogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>
      </motion.aside>
    </>
  );
}
