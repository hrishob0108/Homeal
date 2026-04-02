import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaArrowLeft, FaCheckCircle, FaStar } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";
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
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("currentUser", JSON.stringify(data));
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="min-h-screen relative w-full flex bg-[#FFFBF7] font-sans">
      {/* Back to Home Button - Floating */}
      <Link to="/" className="absolute top-6 left-6 lg:left-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full font-bold text-gray-700 shadow-md border border-gray-100 hover:text-green-600 transition-colors"
        >
          <FaArrowLeft /> Home
        </motion.button>
      </Link>

      {/* LEFT PANEL - VISUAL (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-green-400 via-emerald-600 to-green-900 relative overflow-hidden p-12 lg:p-20">
        {/* Background Decorative Circles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-white/10 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-yellow-200/10 rounded-full blur-[80px] pointer-events-none"
        />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-lg">
            <FaUtensils className="text-green-600 text-3xl" />
          </div>
          <span className="text-4xl font-black text-white tracking-tight">Foodler</span>
        </div>

        {/* Hero Copy & Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-lg mt-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-2xl" />)}
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-[1.1]">
              Taste Comfort. <br />
              <span className="text-green-200 font-extrabold pb-2 inline-block">Share Community.</span>
            </h2>
            <p className="text-green-50 text-lg font-medium leading-relaxed opacity-90">
              Join thousands of hostellers and dayscholars already connecting over authentic, homemade meals on campus.
            </p>

            <div className="mt-8 flex items-center gap-4 bg-black/20 p-4 rounded-full border border-white/10 w-max shadow-inner">
              <FaCheckCircle className="text-green-300 text-2xl" />
              <p className="text-white font-bold text-sm tracking-wide">Verified Student Network</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative xl:px-32">
        {/* Mobile background blob */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-200/40 rounded-full blur-[80px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10 bg-white/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 sm:p-10 lg:p-0 rounded-3xl lg:rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-none border border-white/40 lg:border-none"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Welcome Back 👋
            </h2>
            <p className="text-gray-500 font-medium text-lg">Sign in to your Foodler account</p>
          </motion.div>

          <AnimatePresence>
            {errors.api && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-bold flex items-center">
                  {errors.api}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="email"
                  placeholder="name@college.edu"
                  className={`w-full pl-12 pr-4 py-4 bg-white text-gray-800 rounded-2xl border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300 text-lg`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.email}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-4 py-4 bg-white text-gray-800 rounded-2xl border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300 text-lg`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.password}</p>}
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-between text-sm items-center font-bold px-1">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="mr-3 w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500 focus:ring-offset-1 transition-colors" />
                <span className="text-gray-500 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-green-600 hover:text-green-700 transition-colors">
                Forgot Password?
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gray-900 hover:bg-green-600 py-4 rounded-2xl text-white font-black text-xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all duration-300"
              >
                Sign In
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-5 text-gray-400 text-sm font-bold uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex justify-center bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all py-1">
              <GOO />
            </motion.div>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-10 text-center text-gray-500 font-medium text-lg">
            Don't have an account?{" "}
            <Link to="/register" className="text-green-600 hover:text-green-700 font-black ml-1 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-green-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Create one now
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
