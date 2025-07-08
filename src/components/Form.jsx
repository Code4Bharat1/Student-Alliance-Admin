// "use client";

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Form() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [bubbles, setBubbles] = useState([]);

//   // Generate floating bubbles
//   useEffect(() => {
//     const newBubbles = Array.from({ length: 15 }, (_, i) => ({
//       id: i,
//       size: Math.random() * 30 + 10,
//       left: Math.random() * 100,
//       delay: Math.random() * 5,
//       duration: Math.random() * 10 + 10,
//     }));
//     setBubbles(newBubbles);
//   }, []);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (isLogin) {
//       console.log("Logging in with:", { email, password });
//     } else {
//       console.log("Signing up with:", { name, email, password });
//     }
//   };

//   return (
//     <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 overflow-hidden">
//       {/* Animated bubbles background */}
//       {bubbles.map((bubble) => (
//         <motion.div
//           key={bubble.id}
//           className="absolute rounded-full bg-white opacity-10"
//           style={{
//             width: `${bubble.size}px`,
//             height: `${bubble.size}px`,
//             left: `${bubble.left}%`,
//             bottom: "-50px",
//           }}
//           initial={{ bottom: "-50px" }}
//           animate={{ bottom: "100%" }}
//           transition={{
//             duration: bubble.duration,
//             delay: bubble.delay,
//             repeat: Infinity,
//             repeatType: "loop",
//           }}
//         />
//       ))}

//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="relative w-full max-w-md mx-4"
//       >
//         <div className=" bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white border-opacity-20">
//           {/* Toggle switch */}
//           <div className="flex relative h-16">
//             <div
//               className={`absolute top-0 h-full w-1/2 bg-opacity-20 transition-all duration-500 ease-in-out rounded-t-lg ${
//                 isLogin ? "left-0" : "left-1/2"
//               }`}
//             />
//             <button
//               onClick={() => setIsLogin(true)}
//               className={`flex-1 flex items-center justify-center font-medium text-lg transition-colors duration-300 ${
//                 isLogin ? "text-white" : "text-white text-opacity-70"
//               }`}
//             >
//               Login
//             </button>
//             <button
//               onClick={() => setIsLogin(false)}
//               className={`flex-1 flex items-center justify-center font-medium text-lg transition-colors duration-300 ${
//                 !isLogin ? "text-white" : "text-white text-opacity-70"
//               }`}
//             >
//               Sign Up
//             </button>
//           </div>

//           <div className="p-8">
//             <motion.div
//               key={isLogin ? "login" : "signup"}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//             >
//               <h2 className="text-3xl font-bold text-white mb-6 text-center">
//                 {isLogin ? "Welcome Back" : "Create Account"}
//               </h2>

//               <form onSubmit={handleSubmit}>
//                 {!isLogin && (
//                   <div className="mb-4">
//                     <label
//                       htmlFor="name"
//                       className="block text-white text-sm font-medium mb-2"
//                     >
//                       Full Name
//                     </label>
//                     <motion.div
//                       whileHover={{ scale: 1.01 }}
//                       whileTap={{ scale: 0.99 }}
//                     >
//                       <input
//                         id="name"
//                         type="text"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         className="w-full px-4 py-3 rounded-lg bg-white text-black bg-opacity-10 border border-white border-opacity-20 placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
//                         placeholder="John Doe"
//                         required
//                       />
//                     </motion.div>
//                   </div>
//                 )}

//                 <div className="mb-4">
//                   <label
//                     htmlFor="email"
//                     className="block text-white text-sm font-medium mb-2"
//                   >
//                     Email
//                   </label>
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.99 }}
//                   >
//                     <input
//                       id="email"
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-black placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
//                       placeholder="your@email.com"
//                       required
//                     />
//                   </motion.div>
//                 </div>

//                 <div className="mb-6">
//                   <label
//                     htmlFor="password"
//                     className="block text-white text-sm font-medium mb-2"
//                   >
//                     Password
//                   </label>
//                   <motion.div
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.99 }}
//                   >
//                     <input
//                       id="password"
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-black placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
//                       placeholder="••••••••"
//                       required
//                       minLength="6"
//                     />
//                   </motion.div>
//                 </div>

//                 {isLogin && (
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center">
//                       <input
//                         id="remember-me"
//                         type="checkbox"
//                         className="h-4 w-4 rounded bg-white bg-opacity-10 border-white border-opacity-20 text-white focus:ring-white focus:ring-opacity-50"
//                       />
//                       <label
//                         htmlFor="remember-me"
//                         className="ml-2 block text-sm text-white text-opacity-80"
//                       >
//                         Remember me
//                       </label>
//                     </div>
//                     <a
//                       href="#"
//                       className="text-sm text-white font-medium hover:underline"
//                     >
//                       Forgot password?
//                     </a>
//                   </div>
//                 )}

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   type="submit"
//                   className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
//                 >
//                   {isLogin ? "Login" : "Sign Up"}
//                 </motion.button>
//               </form>

//               <div className="mt-6 text-center">
//                 <p className="text-white text-opacity-70">
//                   {isLogin
//                     ? "Don't have an account?"
//                     : "Already have an account?"}{" "}
//                   <button
//                     onClick={() => setIsLogin(!isLogin)}
//                     className="text-white font-medium hover:underline"
//                   >
//                     {isLogin ? "Sign up" : "Login"}
//                   </button>
//                 </p>
//               </div>

//               <div className="mt-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-white border-opacity-20"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-2 bg-transparent text-white text-opacity-70">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 <div className="mt-6 grid grid-cols-3 gap-3">
//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <a
//                       href="https://myaccount.google.com/"
//                       className="w-full flex items-center justify-center px-4 py-2 border border-white border-opacity-20 rounded-full  shadow-sm text-sm font-medium text-black bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                         aria-hidden="true"
//                       >
//                         <path d="M21.35 11.1h-9.37v2.81h5.35c-.25 1.12-1.33 3.28-5.35 3.28-3.24 0-5.89-2.68-5.89-5.99s2.65-5.99 5.89-5.99c1.84 0 3.08.79 3.8 1.49l2.57-2.5C16.46 2.91 14.33 2 11.98 2 6.73 2 2.62 6.18 2.62 11.4c0 5.21 4.11 9.4 9.36 9.4 5.42 0 8.99-3.83 8.99-9.26 0-.69-.09-1.43-.27-2.04z"></path>
//                       </svg>
//                     </a>
//                   </motion.div>

//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <a
//                       href="https://www.facebook.com/"
//                       className="w-full flex items-center justify-center px-4 py-2 border border-white border-opacity-20 rounded-full shadow-sm text-sm font-medium text-black bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 24 24"
//                         aria-hidden="true"
//                       >
//                         <path d="M22.675 0H1.325C.594 0 0 .594 0 1.326v21.348C0 23.406.594 24 1.325 24h11.497v-9.294H9.847v-3.622h2.975V8.413c0-2.947 1.796-4.556 4.417-4.556 1.257 0 2.338.093 2.654.135v3.076h-1.822c-1.43 0-1.707.679-1.707 1.674v2.195h3.413l-.445 3.622h-2.968V24h5.818C23.406 24 24 23.406 24 22.674V1.326C24 .594 23.406 0 22.675 0z" />
//                       </svg>
//                     </a>
//                   </motion.div>

//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <a
//                       href="https://github.com/login"
//                       className="w-full flex items-center justify-center px-4 py-2 border border-white border-opacity-20 rounded-full shadow-sm text-sm font-medium text-black bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
//                     >
//                       <svg
//                         className="w-5 h-5"
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                         aria-hidden="true"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.14 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </a>
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
