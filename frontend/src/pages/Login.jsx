import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaArrowLeft, FaCheckCircle, FaStar, FaQuoteLeft } from "react-icons/fa";
import { FiMail, FiLock, FiChevronRight } from "react-icons/fi";
import GOO from "../firebase";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setErrors({ api: "Something went wrong. Please try again." });
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
    <div className="min-h-screen relative w-full flex bg-cream font-sans overflow-hidden text-espresso select-none">
      
      {/* Floating Decorative Elements */}
      <span className="absolute top-10 left-10 text-primary/10 text-4xl select-none animate-spin-slow z-0">✿</span>
      <span className="absolute bottom-10 right-10 text-secondary/20 text-3xl select-none animate-bounce-slow z-0">🍃</span>
      <span className="absolute top-1/3 right-1/3 text-primary/10 text-2xl select-none z-0">✿</span>

      {/* Floating Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 lg:left-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-espresso shadow-md border border-gray-100/50 hover:text-primary transition-all cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> Home
        </motion.button>
      </Link>

      {/* LEFT PANEL - VISUAL DISPLAY (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-espresso to-[#4E2424] relative overflow-hidden p-16 xl:p-20">
        {/* Background Blobs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-primary/15 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], x: [0, -20, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-secondary/10 rounded-full blur-[90px] pointer-events-none"
        />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/90 p-3 rounded-2xl shadow-lg border border-white/20">
            <FaUtensils className="text-primary text-2xl" />
          </div>
          <span className="text-3xl font-serif font-black text-white tracking-tight">Cravyo</span>
        </div>

        {/* Centerpiece Visuals */}
        <div className="relative z-10 w-full max-w-lg mt-auto mb-10 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            {/* Thali visual shape decoration */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 rounded-full blur-2xl z-0" />
            
            <div className="flex gap-1 mb-6 relative z-10">
              {[...Array(5)].map((_, i) => <FaStar key={i} className="text-secondary text-xl" />)}
            </div>

            <h2 className="text-4xl xl:text-5xl font-serif font-black text-white mb-6 leading-[1.15] relative z-10">
              Taste Comfort. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-extrabold pb-1 inline-block">
                Share Community.
              </span>
            </h2>

            <p className="text-gray-200 text-base xl:text-lg font-medium leading-relaxed opacity-95 relative z-10 mb-8">
              Join thousands of hostelers and dayscholars already connecting over authentic, homemade meals on campus.
            </p>

            {/* Testimonial Quote */}
            <div className="border-t border-white/10 pt-6 flex items-start gap-4">
              <FaQuoteLeft className="text-secondary/50 text-2xl shrink-0 mt-1" />
              <div>
                <p className="text-sm italic font-medium text-white/95 leading-relaxed">
                  "Ghar ka khana on campus is no longer a dream! The interface is so simple and deliveries are always right on time."
                </p>
                <p className="text-xs font-black text-secondary uppercase tracking-widest mt-2">
                  — Ritesh Kumar, Hosteler
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4 bg-black/15 px-6 py-4 rounded-3xl border border-white/5 w-max shadow-inner">
            <FaCheckCircle className="text-primary text-xl animate-pulse" />
            <p className="text-white font-bold text-sm tracking-wide">Verified College Network</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM ENTRY (Centered on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative xl:px-32 z-10">
        
        {/* Mobile background blob */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-white/80 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-8 sm:p-12 lg:p-0 rounded-[2.5rem] shadow-[0_20px_50px_rgba(60,34,34,0.03)] lg:shadow-none border border-white/60 lg:border-none relative"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <span className="inline-block bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-primary/20">
              Welcome back
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-espresso leading-tight">
              Sign In 👋
            </h2>
            <p className="text-espresso-light font-medium text-base mt-2">Access your Cravyo dashboard</p>
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {errors.api && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl border border-red-100 text-sm font-bold flex items-center shadow-sm">
                  {errors.api}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Address */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-2 text-sm font-bold ml-1">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="email"
                  placeholder="name@college.edu"
                  className={`w-full pl-13 pr-4 py-4 bg-white text-espresso rounded-2xl border ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.email}</p>}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-2 text-sm font-bold ml-1">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-13 pr-4 py-4 bg-white text-espresso rounded-2xl border ${
                    errors.password ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.password}</p>}
            </motion.div>

            {/* Options */}
            <motion.div variants={itemVariants} className="flex justify-between text-sm items-center font-bold px-1 pt-1">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="mr-3 w-4.5 h-4.5 rounded-lg border-primary/30 text-primary focus:ring-primary focus:ring-offset-1 transition-colors cursor-pointer" 
                />
                <span className="text-espresso-light group-hover:text-espresso transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:text-primary-hover transition-colors cursor-pointer">
                Forgot Password?
              </Link>
            </motion.div>

            {/* Sign In Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover py-4.5 rounded-2xl text-white font-black text-lg shadow-[0_12px_24px_rgba(168,68,68,0.15)] hover:shadow-[0_12px_24px_rgba(168,68,68,0.3)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Sign In
                <FiChevronRight className="text-xl" />
              </motion.button>
            </motion.div>
          </form>

          {/* Splitter */}
          <motion.div variants={itemVariants} className="flex items-center my-8">
            <div className="flex-1 h-px bg-primary/10"></div>
            <span className="px-5 text-espresso/35 text-xs font-black uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-primary/10"></div>
          </motion.div>

          {/* Google Button */}
          <motion.div variants={itemVariants}>
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="w-full flex justify-center bg-white border border-primary/20 hover:border-primary/40 rounded-2xl shadow-sm hover:shadow-md transition-all py-1 cursor-pointer"
            >
              <GOO />
            </motion.div>
          </motion.div>

          {/* Account redirect */}
          <motion.p variants={itemVariants} className="mt-12 text-center text-espresso-light font-medium text-base">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-primary hover:text-primary-hover font-black ml-1 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left cursor-pointer"
            >
              Create one now
            </Link>
          </motion.p>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
