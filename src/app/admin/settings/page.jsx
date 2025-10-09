"use client";
import { useState } from "react";
import { User, Lock, Edit2, Check, AlertCircle, Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // adjust the import path if needed

const SettingsPage = () => {
  const [profileData, setProfileData] = useState({
    name: "siddiqui Raheem",
    email: "siddiquiraheem527@gmail.com",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
  });

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
    if (!passwordData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleProfileUpdate = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setIsEditingProfile(false);
      setShowProfileSuccess(true);
      setTimeout(() => setShowProfileSuccess(false), 3000);
    }, 1000);
  };

  const handlePasswordChange = () => {
    const errors = validatePassword();
    setPasswordErrors(errors);
    if (Object.keys(errors).length === 0) {
      setTimeout(() => {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSuccess(true);
        setTimeout(() => setShowPasswordSuccess(false), 3000);
      }, 500);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fixed on left */}
      <div className="w-64 fixed h-full bg-[#0B1120] text-white">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-64 p-6 overflow-y-auto">
        {/* Success Messages */}
        {showProfileSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" /> Profile updated successfully!
          </div>
        )}
        {showPasswordSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Check className="w-5 h-5" /> Password changed successfully!
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h1>

          {/* Profile Information */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="text-blue-500" size={20} /> Profile Information
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
              )}
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditingProfile}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              {isEditingProfile && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="text-indigo-500" size={20} /> Security
            </h2>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-200">
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                />
                {passwordErrors.currentPassword && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <AlertCircle size={16} /> {passwordErrors.currentPassword}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  />
                  {passwordErrors.newPassword && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} /> {passwordErrors.newPassword}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                  />
                  {passwordErrors.confirmPassword && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} /> {passwordErrors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handlePasswordChange}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Change Password
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="text-yellow-500" size={20} /> Notifications
            </h2>
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-yellow-50 border border-gray-200 flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={() =>
                    setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })
                  }
                  className="w-5 h-5 accent-yellow-500"
                />
                <span className="text-gray-700 font-medium">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={() =>
                    setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })
                  }
                  className="w-5 h-5 accent-yellow-500"
                />
                <span className="text-gray-700 font-medium">Push Notifications</span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
    