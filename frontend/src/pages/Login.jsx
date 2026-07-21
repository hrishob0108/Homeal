import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import GOO from "../firebase";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await api.post("/auth/login", { email, password });
        const data = response.data;
        if (response.status === 200 || response.status === 201) {
          sessionStorage.setItem("user", JSON.stringify(data));
          sessionStorage.setItem("currentUser", JSON.stringify(data));
          navigate("/dashboard");
        } else {
          setErrors({ api: data.message || "Login failed" });
        }
      } catch (error) {
        console.error("Login Error:", error);
        setErrors({ api: error.response?.data?.message || "Something went wrong. Please try again." });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="h-screen w-full relative flex items-center justify-center lg:justify-end bg-[#9B4549] font-sans text-white p-4 sm:p-6 lg:p-10 overflow-hidden select-none">
      
      {/* Background Graphic - Food Thali on Left */}
      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-start overflow-hidden pointer-events-none">
        <div className="w-full lg:w-[65%] h-full relative p-4 lg:p-8">
          <img
            src="/login.png"
            alt="Indian Thali background"
            className="w-full h-full object-contain object-left lg:scale-[1.6] origin-left translate-y-8 -translate-x-40"
          />
          {/* Gradient to seamlessly blend the image's right edge into the solid background */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-48 bg-gradient-to-r from-transparent to-[#9B4549]"></div>
        </div>
      </div>

      {/* Floating Home Button */}
      <Link to="/" className="absolute top-6 left-6 lg:left-8 z-20">
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-2 rounded-full font-bold text-white shadow-lg border border-white/30 hover:bg-white/25 transition-all cursor-pointer text-xs"
        >
          <FiArrowLeft className="text-xs" /> Home
        </motion.button>
      </Link>

      {/* Glassmorphic Form Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
className="relative z-10 w-full max-w-[480px] min-h-[550px] lg:mr-8 xl:mr-16 bg-white/10 backdrop-blur-xl border border-white/35 rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] my-4 -translate-x-30"
      >
        {/* Card Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white mb-1.5">
            Welcome Back
          </h1>
          <p className="text-[#E7B5B8] font-sans font-medium text-xs sm:text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {/* API Error Alert */}
        <AnimatePresence>
          {errors.api && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-red-500/20 backdrop-blur-md text-red-100 px-4 py-2 rounded-xl border border-red-400/40 text-xs font-bold text-center">
                {errors.api}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Field */}
          <div>
            <label className="block text-white font-serif text-sm font-normal mb-1.5 text-left">
              Email
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-3.5 text-white/70 text-sm pointer-events-none" />
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md text-white placeholder-white/60 rounded-[14px] border ${
                  errors.email ? "border-red-300" : "border-white/35 focus:border-white"
                } focus:outline-none focus:ring-1 focus:ring-white/50 transition-all text-sm font-medium`}
              />
            </div>
            {errors.email && (
              <p className="text-red-200 text-xs font-medium mt-1 ml-1 text-left">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white font-serif text-sm font-normal mb-1.5 text-left">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-3.5 text-white/70 text-sm pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`w-full pl-10 pr-10 py-2.5 bg-white/10 backdrop-blur-md text-white placeholder-white/60 rounded-[14px] border ${
                  errors.password ? "border-red-300" : "border-white/35 focus:border-white"
                } focus:outline-none focus:ring-1 focus:ring-white/50 transition-all text-sm font-medium`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-200 text-xs font-medium mt-1 ml-1 text-left">{errors.password}</p>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex justify-between items-center text-xs font-medium px-1 py-1.5">
            <label className="flex items-center cursor-pointer group">
              <input 
                type="checkbox" 
                className="mr-2 w-3.5 h-3.5 rounded-sm border-white/30 text-[#4F2023] focus:ring-white/50 transition-colors cursor-pointer bg-white/10" 
              />
              <span className="text-white/85 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[#3F1A1C] hover:text-white font-medium transition-colors cursor-pointer">
              Forgot password?
            </Link>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-[#4F2023] hover:bg-[#3F1A1C] text-white font-bold py-3 rounded-[14px] shadow-md transition-all duration-300 cursor-pointer text-sm"
            >
              Log In
            </motion.button>
          </div>
        </form>

        {/* Or Continue With Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-white/30"></div>
          <span className="px-3 text-xs text-white/75 font-medium">Or Continue With</span>
          <div className="flex-1 border-t border-white/30"></div>
        </div>

        {/* Google Sign-In Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="w-full bg-[#FFF5EA] hover:bg-white text-gray-800 font-bold py-2.5 rounded-[14px] flex items-center justify-center gap-2.5 shadow-sm transition-all duration-300 cursor-pointer text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </motion.button>

        {/* Signup Redirect */}
        <p className="text-center text-xs text-white/75 font-medium mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-[#3F1A1C] hover:text-[#2a1112] ml-0.5 transition-colors">
            Sign Up
          </Link>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
