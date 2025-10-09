"use client";
import { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Settings, LogOut, Activity, CreditCard, Users, Camera, X, Check, TrendingUp, Package, ShoppingCart, Bell, Lock, Edit2, Save, AlertCircle, Home 
} from "lucide-react";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: "Siddiqui Raheem",
    email: "siddiquiraheem527@gmail.com",
    role: " Admin",
    joinDate: "Member since Jan 2024",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [notifications, setNotifications] = useState([
    { id: 1, title: "System update available", time: "2 hours ago", read: false },
    { id: 2, title: "New user registration pending", time: "5 hours ago", read: false },
    { id: 3, title: "Monthly report generated", time: "1 day ago", read: true },
  ]);

  const [stats, setStats] = useState({
    totalUsers: 1243,
    deliveredProducts: 28,
    revenue: "₹48,290",
    canceledProducts: 89,
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "Updated security settings", time: "2 hours ago", type: "security" },
    { id: 2, action: "Approved new user registration", time: "5 hours ago", type: "user" },
    { id: 3, action: "Created new admin account", time: "1 day ago", type: "admin" },
    { id: 4, action: "Processed monthly report", time: "2 days ago", type: "report" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // --- Functions ---
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoading(true);
    setTimeout(() => {
      alert("Logged out successfully!");
      // In real app: dispatch(logout()); router.push("/");
    }, 500);
  };

  const handleAvatarClick = () => setShowImageUpload(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image file');

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
    setRecentActivity([{ id: recentActivity.length + 1, action: "Updated profile picture", time: "Just now", type: "profile" }, ...recentActivity]);
  };

  const handleProfileUpdate = () => {
    setIsSavingProfile(true);
    setTimeout(() => {
      setIsSavingProfile(false);
      setIsEditingProfile(false);
      setShowProfileSuccess(true);
      setRecentActivity([{ id: recentActivity.length + 1, action: "Updated profile information", time: "Just now", type: "profile" }, ...recentActivity]);
      setTimeout(() => setShowProfileSuccess(false), 3000);
    }, 1000);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
    if (!passwordData.confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handlePasswordChange = () => {
    const errors = validatePassword();
    setPasswordErrors(errors);
    if (Object.keys(errors).length === 0) {
      setTimeout(() => {
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSuccess(true);
        setRecentActivity([{ id: recentActivity.length + 1, action: "Changed account password", time: "Just now", type: "security" }, ...recentActivity]);
        setTimeout(() => setShowPasswordSuccess(false), 3000);
      }, 500);
    }
  };

  const markNotificationAsRead = (id) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAllNotifications = () => setNotifications([]);

  // --- Go Back Home Function ---
  const goBackHome = () => router.push("/admin/dashboard");

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      
      {/* Success Messages */}
      {showProfileSuccess && <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-[slideIn_0.3s_ease]"><Check className="w-5 h-5"/> Profile updated successfully!</div>}
      {showPasswordSuccess && <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-[slideIn_0.3s_ease]"><Check className="w-5 h-5"/> Password changed successfully!</div>}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowImageUpload(false)}>
          <div className="relative p-8 rounded-2xl w-full max-w-md bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowImageUpload(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"><X className="text-xl text-gray-600"/></button>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Update Profile Picture</h2>
            <div className="flex flex-col items-center">
              {previewUrl ? <div className="relative w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-blue-500 shadow-xl"><img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/></div> : <div className="w-40 h-40 rounded-full mb-6 flex items-center justify-center border-4 border-dashed border-gray-300 bg-gray-50"><Camera className="text-5xl text-gray-400"/></div>}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
              <button onClick={() => fileInputRef.current.click()} className="px-6 py-3 rounded-xl mb-4 bg-gray-100 hover:bg-gray-200 font-medium transition-colors">{selectedFile ? "Change Image" : "Select Image"}</button>
              {selectedFile && <button onClick={handleUpload} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">Upload Picture</button>}
            </div>
          </div>
        </div>
      )}

      {/* Go Back Home Button */}
      <div className="flex justify-end px-6 py-4">
        <button onClick={goBackHome} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md">
          <Home size={18}/> Go Back Home
        </button>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Banner */}
        <section className="rounded-2xl p-8 mb-8 shadow-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center relative z-10">
            <div onClick={handleAvatarClick} className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white mb-6 md:mb-0 md:mr-8 cursor-pointer group shadow-2xl">
              <img src={avatar} alt="Admin Avatar" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white text-3xl"/></div>
            </div>
            <div className="text-center md:text-left text-white flex-1">
              <h2 className="text-3xl font-bold mb-2">{profileData.name}</h2>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"/>
                  <span className="font-medium">{profileData.role}</span>
                </div>
                <span className="text-white/80 text-sm">{profileData.joinDate}</span>
              </div>
              <p className="text-white/90 flex items-center justify-center md:justify-start gap-2"><Mail className="w-4 h-4"/>{profileData.email}</p>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[{icon:<Users size={24}/>,title:"Total Users",value:stats.totalUsers,gradient:"from-blue-500 to-indigo-500",trend:"+12%"},
            {icon:<Check size={24}/>,title:"Delivered Products",value:stats.deliveredProducts,gradient:"from-green-500 to-emerald-500",trend:"+8%"},
            {icon:<CreditCard size={24}/>,title:"Revenue",value:stats.revenue,gradient:"from-purple-500 to-pink-500",trend:"+23%"},
            {icon:<X size={24}/>,title:"Canceled Products",value:stats.canceledProducts,gradient:"from-orange-500 to-red-500",trend:"-5%"}].map((stat,index)=>(
            <div key={index} className="rounded-2xl p-6 shadow-lg bg-white/90 backdrop-blur border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>{stat.icon}</div>
              <h3 className="text-sm font-semibold mb-2 text-gray-600 uppercase tracking-wide">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${stat.trend.startsWith('+')?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="rounded-2xl p-1.5 mb-8 bg-white/90 backdrop-blur shadow-lg border border-gray-100">
          <div className="flex gap-2">
            {["overview","activity","settings"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab===tab?"bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg":"text-gray-600 hover:bg-gray-100"}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl p-8 shadow-xl bg-white/90 backdrop-blur mb-8 border border-gray-100">
          {activeTab==="overview" && <OverviewTab notifications={notifications} markNotificationAsRead={markNotificationAsRead} clearAllNotifications={clearAllNotifications} recentActivity={recentActivity} setActiveTab={setActiveTab}/>}
          {activeTab==="activity" && <ActivityTab recentActivity={recentActivity}/>}
          {activeTab==="settings" && <SettingsTab profileData={profileData} setProfileData={setProfileData} isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile} handleProfileUpdate={handleProfileUpdate} isSavingProfile={isSavingProfile} passwordData={passwordData} setPasswordData={setPasswordData} handlePasswordChange={handlePasswordChange} passwordErrors={passwordErrors}/>}
        </div>
      </div>
    </div>
  );
};

// ------------------ Tabs Components ------------------
const OverviewTab = ({ notifications, markNotificationAsRead, clearAllNotifications, recentActivity, setActiveTab }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Bell className="text-blue-500" size={20}/> Recent Notifications ({notifications.filter(n=>!n.read).length})</h3>
        {notifications.length>0 && <button onClick={clearAllNotifications} className="text-sm text-red-500 hover:text-red-600 font-medium">Clear All</button>}
      </div>
      <div className="space-y-3">
        {notifications.length===0 ? <div className="p-8 rounded-xl bg-gray-50 text-center"><Bell className="w-12 h-12 text-gray-300 mx-auto mb-2"/><p className="text-gray-500">No notifications</p></div> : notifications.map(item=>(
          <div key={item.id} onClick={()=>markNotificationAsRead(item.id)} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100 cursor-pointer hover:border-blue-200 transition-all">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${!item.read?"bg-blue-500 animate-pulse":"bg-gray-400"}`}/>
              <div className="flex-1"><p className={`font-semibold ${!item.read?'text-gray-800':'text-gray-600'}`}>{item.title}</p><p className="text-sm text-gray-600 mt-1">{item.time}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><TrendingUp className="text-indigo-500" size={20}/> Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {[{ icon:<Settings/>, label:"Settings", gradient:"from-blue-500 to-indigo-500", action:()=>setActiveTab("settings") }].map((action,idx)=>(
          <button key={idx} onClick={action.action} className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-all group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 text-white shadow-lg group-hover:scale-110 transition-transform`}>{action.icon}</div>
            <span className="text-sm font-semibold text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ActivityTab = ({ recentActivity }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Recent Activity</h2>
    <div className="space-y-4">
      {recentActivity.map((activity) => (
        <div key={activity.id} className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">{activity.action.charAt(0)}</div>
              <p className="font-semibold text-gray-800">{activity.action}</p>
            </div>
            <span className="text-sm text-gray-600 font-medium">{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SettingsTab = ({ profileData, setProfileData, isEditingProfile, setIsEditingProfile, handleProfileUpdate, isSavingProfile, passwordData, setPasswordData, handlePasswordChange, passwordErrors }) => (
  <div className="space-y-8">
    {/* Profile Information */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2"><User className="text-blue-500" size={20}/> Profile Information</h3>
        {!isEditingProfile && <button onClick={()=>setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><Edit2 size={16}/> Edit</button>}
      </div>
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
            <input type="text" value={profileData.name} onChange={(e)=>setProfileData({...profileData,name:e.target.value})} disabled={!isEditingProfile} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"/>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
            <input type="email" value={profileData.email} onChange={(e)=>setProfileData({...profileData,email:e.target.value})} disabled={!isEditingProfile} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"/>
          </div>
        </div>
        {isEditingProfile && <div className="flex gap-3"><button onClick={()=>setIsEditingProfile(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all">Cancel</button><button onClick={handleProfileUpdate} disabled={isSavingProfile} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">{isSavingProfile?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:"Update Profile"}</button></div>}
      </div>
    </div>

    {/* Security */}
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Lock className="text-indigo-500" size={20}/> Security</h3>
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50 border border-gray-200">
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-gray-700">Current Password</label>
          <input type="password" value={passwordData.currentPassword} onChange={(e)=>setPasswordData({...passwordData,currentPassword:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"/>
          {passwordErrors.currentPassword && <div className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle size={16}/>{passwordErrors.currentPassword}</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">New Password</label>
            <input type="password" value={passwordData.newPassword} onChange={(e)=>setPasswordData({...passwordData,newPassword:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"/>
            {passwordErrors.newPassword && <div className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle size={16}/>{passwordErrors.newPassword}</div>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Confirm Password</label>
            <input type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData({...passwordData,confirmPassword:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"/>
            {passwordErrors.confirmPassword && <div className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle size={16}/>{passwordErrors.confirmPassword}</div>}
          </div>
        </div>
        <button onClick={handlePasswordChange} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">Change Password</button>
      </div>
    </div>
  </div>
);

export default ProfilePage;
