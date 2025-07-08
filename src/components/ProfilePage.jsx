"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiSettings,
  FiLogOut,
  FiActivity,
  FiCreditCard,
  FiUsers,
  FiCamera,
  FiX,
} from "react-icons/fi";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState("/placeholder-avatar.jpg");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const adminData = {
    name: "Shubham Thakare",
    email: "shubham444@gmail.com",
    role: "Super Admin",
    stats: {
      totalUsers: 1243,
      activeProjects: 28,
      revenue: "$48,290",
      tasksCompleted: 89,
    },
    recentActivity: [
      { id: 1, action: "Updated security settings", time: "2 hours ago" },
      { id: 2, action: "Approved new user registration", time: "5 hours ago" },
      { id: 3, action: "Created new admin account", time: "1 day ago" },
      { id: 4, action: "Processed monthly report", time: "2 days ago" },
    ],
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleAvatarClick = () => {
    setShowImageUpload(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setAvatar(previewUrl);
    setShowImageUpload(false);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-6 rounded-2xl w-full max-w-md bg-white"
            >
              <button
                onClick={() => {
                  setShowImageUpload(false);
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
              >
                <FiX className="text-xl" />
              </button>

              <h2 className="text-xl font-bold mb-4">Update Profile Picture</h2>

              <div className="flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-blue-500">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full mb-4 flex items-center justify-center border-2 border-dashed border-gray-400">
                    <FiCamera className="text-3xl text-gray-400" />
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 rounded-lg mb-4 bg-gray-100 hover:bg-gray-200"
                >
                  {selectedFile ? "Change Image" : "Select Image"}
                </motion.button>

                {selectedFile && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpload}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Upload Picture
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative p-6 rounded-2xl w-full max-w-md bg-white"
            >
              <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
              <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
              
              <div className="flex justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelLogout}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </motion.header>

        {/* Profile Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={slideUp}
          className="rounded-2xl p-6 mb-8 shadow-lg bg-white"
        >
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAvatarClick}
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-4 md:mb-0 md:mr-6 cursor-pointer group"
            >
              <Image
                src={avatar}
                alt="Admin Avatar"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiCamera className="text-white text-2xl" />
              </div>
            </motion.div>

            <div className="text-center md:text-left">
              <motion.h2
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-2xl font-bold mb-1"
              >
                {adminData.name}
              </motion.h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm mb-2 bg-gray-100">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                {adminData.role}
              </div>
              <p className="mb-4 text-gray-600">{adminData.joinDate}</p>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              icon: <FiUsers size={24} />,
              title: "Total Users",
              value: adminData.stats.totalUsers,
              color: "bg-blue-500",
            },
            {
              icon: <FiActivity size={24} />,
              title: "Delivered Products",
              value: adminData.stats.activeProjects,
              color: "bg-green-500",
            },
            {
              icon: <FiCreditCard size={24} />,
              title: "Revenue",
              value: adminData.stats.revenue,
              color: "bg-purple-500",
            },
            {
              icon: <FiUser size={24} />,
              title: "Canceled Products",
              value: adminData.stats.tasksCompleted,
              color: "bg-yellow-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{ y: -5 }}
              className="rounded-xl p-6 shadow-md bg-white"
            >
              <div
                className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-white mb-4`}
              >
                {stat.icon}
              </div>
              <h3 className="text-sm font-medium mb-1 text-gray-600">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Tabs Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="rounded-2xl p-1 mb-8 bg-gray-100"
        >
          <div className="flex space-x-1">
            {["overview", "activity", "settings"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-6 shadow-lg bg-white mb-8"
        >
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Notifications
                  </h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        whileHover={{ x: 5 }}
                        className="p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                              item === 1 ? "bg-blue-500" : "bg-gray-500"
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium">
                              System update available
                            </p>
                            <p className="text-sm text-gray-600">2 hours ago</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { icon: <FiSettings />, label: "Settings" },
                      { icon: <FiCreditCard />, label: "Reports" },
                    ].map((action, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (action.label === "Settings") {
                            setActiveTab("settings");
                          } else if (action.label === "Reports") {
                            router.push("/admin/analytics");
                          }
                        }}
                        className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white">
                          {action.icon}
                        </div>
                        <span className="text-sm">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {adminData.recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 rounded-lg border-l-4 border-blue-500 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{activity.action}</p>
                      <span className="text-sm text-gray-600">
                        {activity.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Profile Information</h3>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm mb-1 text-gray-600">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={adminData.name}
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-gray-600">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={adminData.email}
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      Update Profile
                    </motion.button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Security</h3>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="mb-4">
                      <label className="block text-sm mb-1 text-gray-600">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 rounded-md border bg-white border-gray-300"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm mb-1 text-gray-600">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-gray-600">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300"
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    >
                      Change Password
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-md"
            onClick={handleLogoutClick}
          >
            <FiLogOut className="mr-2" /> Logout
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;