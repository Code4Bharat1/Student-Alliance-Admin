"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignUpForm({ setIsLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setIsMounted(true);
    const newBubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 50 + 15,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 12 + 12,
    }));
    setBubbles(newBubbles);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = "Name is required";
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters";
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Please enter a valid email";
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = "Password is required";
        } else if (value.length < 6) {
          errors.password = "Password must be at least 6 characters";
        } else {
          delete errors.password;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate all fields
    const isNameValid = validateField('name', name);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess("Account created successfully!");
      setTimeout(() => {
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 overflow-hidden p-4">
      {/* Animated Background Bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            bottom: "-100px",
          }}
          initial={{ bottom: "-100px", opacity: 0 }}
          animate={{ 
            bottom: "110%", 
            opacity: [0, 0.6, 0.6, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 sm:top-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-green-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 max-w-md"
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="font-semibold text-sm sm:text-base">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 sm:top-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-red-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 max-w-md"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-semibold text-sm sm:text-base">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMounted && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", damping: 20 }}
            className="relative w-full max-w-md z-10"
          >
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl sm:rounded-3xl blur-xl opacity-50"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />

            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 border border-white/20">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4 sm:mb-6"
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Create Account</span>
                </h2>
                <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Join our community today</p>
              </motion.div>

              <div>
                {/* Name Input */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="mb-4 sm:mb-5">
                  <label className="block text-gray-800 text-xs sm:text-sm font-semibold mb-2">Full Name</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        validateField('name', e.target.value);
                      }}
                      onBlur={() => validateField('name', name)}
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none transition-all duration-200 pl-11 sm:pl-12 text-gray-800 font-medium bg-gray-50 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-sm sm:text-base`}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.name && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                      {fieldErrors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Input */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mb-4 sm:mb-5">
                  <label className="block text-gray-800 text-xs sm:text-sm font-semibold mb-2">Email Address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateField('email', e.target.value);
                      }}
                      onBlur={() => validateField('email', email)}
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none transition-all duration-200 pl-11 sm:pl-12 text-gray-800 font-medium bg-gray-50 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-sm sm:text-base`}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.email && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                      {fieldErrors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password Input */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="mb-4 sm:mb-5">
                  <label className="block text-gray-800 text-xs sm:text-sm font-semibold mb-2">Password</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateField('password', e.target.value);
                      }}
                      onBlur={() => validateField('password', password)}
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none transition-all duration-200 pl-11 sm:pl-12 pr-11 sm:pr-12 text-gray-800 font-medium bg-gray-50 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-sm sm:text-base`}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <div className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <button type="button" className="absolute right-3 sm:right-4 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600 transition-colors" onClick={togglePasswordVisibility}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={showPassword ? "open" : "closed"} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                          {showPassword ? (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-xs mt-1">
                      {fieldErrors.password}
                    </motion.p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {password && !fieldErrors.password && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? getStrengthColor() : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${passwordStrength <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
                        Password strength: {getStrengthText()}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                  <motion.button
                    type="button"
                    disabled={loading || Object.keys(fieldErrors).length > 0}
                    onClick={handleSubmit}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className={`w-full py-3 sm:py-4 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group text-sm sm:text-base ${
                      loading || Object.keys(fieldErrors).length > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white"
                    }`}
                  >
                    <motion.div className="absolute inset-0 bg-white/20" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                    
                    {loading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </motion.div>
                        <span className="relative">Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative">Create Account</span>
                        <motion.svg className="h-5 w-5 relative" viewBox="0 0 20 20" fill="currentColor" whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </motion.svg>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>

              {/* Login Link */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-5 sm:mt-6 text-center">
                <p className="text-gray-700 text-xs sm:text-sm md:text-base">
                  Already have an account?{" "}
                  <button onClick={() => setIsLogin && setIsLogin(true)} className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold hover:from-blue-700 hover:to-purple-700 transition-all">
                    Sign in
                  </button>
                </p>
              </motion.div>

              {/* Social SignUp */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
                <p className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Or sign up with</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { name: "Google", color: "from-red-500 to-orange-500", icon: "G" },
                    { name: "Facebook", color: "from-blue-600 to-indigo-600", icon: "f" },
                    { name: "Apple", color: "from-gray-700 to-gray-900", icon: "" }
                  ].map((social, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r ${social.color} text-white rounded-lg sm:rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center text-sm sm:text-base`}
                      onClick={() => console.log(`Sign up with ${social.name}`)}
                    >
                      <span className="text-base sm:text-lg">{social.icon}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Terms */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-4 sm:mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By signing up, you agree to our{" "}
                  <button className="text-blue-600 hover:underline">Terms of Service</button>
                  {" "}and{" "}
                  <button className="text-blue-600 hover:underline">Privacy Policy</button>
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}