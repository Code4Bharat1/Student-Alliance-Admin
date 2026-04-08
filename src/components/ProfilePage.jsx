"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Settings,
  LogOut,
  Camera,
  X,
  Check,
  Package,
  Bell,
  Lock,
  Edit2,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "Admin User",
    email: "admin@studentalliance.com",
    role: "Admin",
    joinDate: "Member since Jan 2024",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System update available",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "New user registration pending",
      time: "5 hours ago",
      read: false,
    },
    { id: 3, title: "Monthly report generated", time: "1 day ago", read: true },
  ]);

  const [stats] = useState({
    totalUsers: 1243,
    deliveredProducts: 28,
    revenue: "₹48,290",
    canceledProducts: 89,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Updated security settings", time: "2 hours ago" },
    { id: 2, action: "Approved new user registration", time: "5 hours ago" },
    { id: 3, action: "Created new admin account", time: "1 day ago" },
    { id: 4, action: "Processed monthly report", time: "2 days ago" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    router.push("/form");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setAvatar(previewUrl);
    setShowImageUpload(false);
    setSelectedFile(null);
    setPreviewUrl("");
    toast.success("Profile picture updated!");
  };

  const handleProfileUpdate = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setIsEditingProfile(false);
      toast.success("Profile updated!");
      setRecentActivity([
        {
          id: Date.now(),
          action: "Updated profile information",
          time: "Just now",
        },
        ...recentActivity,
      ]);
    }, 1000);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 8)
      errors.newPassword = "At least 8 characters";
    if (!passwordData.confirmPassword)
      errors.confirmPassword = "Please confirm password";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handlePasswordChange = () => {
    const errors = validatePassword();
    setPasswordErrors(errors);
    if (Object.keys(errors).length === 0) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed!");
      setRecentActivity([
        {
          id: Date.now(),
          action: "Changed account password",
          time: "Just now",
        },
        ...recentActivity,
      ]);
    }
  };

  const markNotificationAsRead = (id) =>
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const clearAllNotifications = () => setNotifications([]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-secondary text-sm font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-text-heading">Admin Profile</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-bg-card border border-border-primary text-text-primary rounded-xl hover:bg-bg-hover transition-all text-sm font-medium"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Home size={16} /> Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="px-6 pb-8 max-w-6xl mx-auto">
        {/* Profile Banner */}
        <section
          className="rounded-2xl p-6 mb-6 relative overflow-hidden text-white"
          style={{ background: "var(--brand-gradient)" }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div
              onClick={() => setShowImageUpload(true)}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 cursor-pointer group"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <User size={36} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                  {profileData.role}
                </span>
                <span className="text-white/80 text-sm">
                  {profileData.joinDate}
                </span>
              </div>
              <p className="text-white/90 mt-2 flex items-center justify-center md:justify-start gap-2 text-sm">
                <Mail size={14} /> {profileData.email}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: <User size={20} />,
            },
            {
              label: "Delivered",
              value: stats.deliveredProducts,
              icon: <Check size={20} />,
            },
            {
              label: "Revenue",
              value: stats.revenue,
              icon: <Package size={20} />,
            },
            {
              label: "Cancelled",
              value: stats.canceledProducts,
              icon: <X size={20} />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-bg-card rounded-xl p-5 border border-border-primary"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-3">
                {stat.icon}
              </div>
              <p className="text-text-tertiary text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-text-heading mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div
          className="bg-bg-card rounded-xl p-1.5 mb-6 border border-border-primary flex gap-1"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {["overview", "activity", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-brand-primary text-white"
                  : "text-text-secondary hover:bg-bg-hover"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className="bg-bg-card rounded-xl p-6 border border-border-primary"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-text-heading flex items-center gap-2">
                    <Bell size={18} className="text-brand-primary" />
                    Notifications ({notifications.filter((n) => !n.read).length}
                    )
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-error hover:underline font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-text-tertiary text-sm text-center py-8">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markNotificationAsRead(item.id)}
                        className="p-3 rounded-lg bg-bg-hover border border-border-primary cursor-pointer hover:border-brand-primary/30 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 ${!item.read ? "bg-brand-primary" : "bg-text-tertiary"}`}
                          />
                          <div>
                            <p
                              className={`text-sm ${!item.read ? "text-text-primary font-medium" : "text-text-secondary"}`}
                            >
                              {item.title}
                            </p>
                            <p className="text-xs text-text-tertiary mt-0.5">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div>
                <h3 className="text-base font-semibold text-text-heading mb-4">
                  Quick Actions
                </h3>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-3 p-4 rounded-lg bg-bg-hover border border-border-primary hover:border-brand-primary/30 transition-all w-full"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center">
                    <Settings size={18} />
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    Account Settings
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h3 className="text-base font-semibold text-text-heading mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-bg-hover border-l-4 border-brand-primary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                        {activity.action.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              {/* Profile Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-text-heading flex items-center gap-2">
                    <User size={18} className="text-brand-primary" /> Profile
                    Information
                  </h3>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-bg-hover text-brand-primary rounded-lg hover:bg-brand-primary/10 transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>
                <div className="p-5 rounded-xl bg-bg-hover border border-border-primary">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  {isEditingProfile && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-bg-card border border-border-primary text-text-secondary rounded-lg text-sm font-medium hover:bg-bg-hover"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProfileUpdate}
                        disabled={isSavingProfile}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-hover disabled:opacity-60"
                      >
                        {isSavingProfile ? "Saving..." : "Update Profile"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-base font-semibold text-text-heading mb-4 flex items-center gap-2">
                  <Lock size={18} className="text-brand-secondary" /> Security
                </h3>
                <div className="p-5 rounded-xl bg-bg-hover border border-border-primary">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-error text-xs mt-1">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-error text-xs mt-1">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-border-focus"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-error text-xs mt-1">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowImageUpload(false)}
        >
          <div
            className="bg-bg-card rounded-2xl p-6 w-full max-w-md border border-border-primary"
            style={{ boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-heading">
                Update Profile Picture
              </h3>
              <button
                onClick={() => setShowImageUpload(false)}
                className="p-1.5 rounded-lg hover:bg-bg-hover text-text-tertiary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-primary mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full mb-4 flex items-center justify-center border-2 border-dashed border-border-secondary bg-bg-hover">
                  <Camera size={32} className="text-text-tertiary" />
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-4 py-2 rounded-lg bg-bg-hover border border-border-primary text-text-primary text-sm font-medium mb-3 hover:bg-bg-tertiary"
              >
                {selectedFile ? "Change Image" : "Select Image"}
              </button>
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-hover"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
