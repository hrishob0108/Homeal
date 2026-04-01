import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaArrowLeft, FaHeart } from "react-icons/fa";
import { FiUser, FiMail, FiLock, FiShield } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("currentUser", JSON.stringify(data));
          navigate("/dashboard");
        } else {
          setErrors({ api: data.message || "Registration failed" });
        }
      } catch (error) {
        console.error("Registration Error:", error);
        setErrors({ api: "Something went wrong. Please try again." });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="min-h-screen relative w-full flex bg-[#FFFBF7] font-sans text-gray-800">
      {/* Back to Home Button - Floating */}
      <Link to="/" className="absolute top-6 right-6 lg:left-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full font-bold text-gray-700 shadow-md border border-gray-100 hover:text-green-600 transition-colors"
        >
          <FaArrowLeft /> Home
        </motion.button>
      </Link>

      {/* LEFT PANEL - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative xl:px-32 order-2 lg:order-1">
        {/* Mobile background blob */}
        <div className="lg:hidden absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-orange-200/40 rounded-full blur-[80px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10 bg-white/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none p-8 sm:p-10 lg:p-0 rounded-3xl lg:rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-none border border-white/40 lg:border-none"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
              Create Account ✨
            </h2>
            <p className="text-gray-500 font-medium text-lg">Join Foodler to share and discover homemade meals.</p>
          </motion.div>

          {/* Global API Error */}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Full Name</label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white text-gray-800 rounded-2xl border ${errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <AnimatePresence>
                {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.name}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@college.edu"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white text-gray-800 rounded-2xl border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <AnimatePresence>
                {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.email}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white text-gray-800 rounded-2xl border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <AnimatePresence>
                {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.password}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">Confirm Password</label>
              <div className="relative flex items-center">
                <FiShield className="absolute left-4 text-gray-400 group-focus-within:text-green-500 transition-colors text-xl" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white text-gray-800 rounded-2xl border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.confirmPassword}</motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Role */}
            <motion.div variants={itemVariants} className="relative group pt-1">
              <label className="block text-gray-700 mb-2 text-sm font-bold ml-1">You are signing up as a:</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-5 py-4 bg-white text-gray-800 rounded-2xl border ${errors.role ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-400 focus:ring-green-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-bold shadow-sm appearance-none cursor-pointer text-lg group-hover:border-gray-300`}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="hosteler">🏡 Hosteler</option>
                  <option value="dayscholar">🎒 Dayscholar</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400 group-hover:text-green-500 transition-colors">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
              <AnimatePresence>
                {errors.role && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-2 ml-1 font-bold">{errors.role}</motion.p>}
              </AnimatePresence>
            </motion.div>

            {/* Register Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gray-900 hover:bg-green-600 py-4 rounded-2xl text-white font-black text-xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all duration-300"
              >
                Sign Up ✨
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="mt-10 text-center text-gray-500 font-medium text-lg">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-black ml-1 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-green-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
              Login here
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* RIGHT PANEL - VISUAL (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#1A1A1A] to-gray-900 relative overflow-hidden p-12 lg:p-20 order-1 lg:order-2">
        {/* Background Decorative Blobs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"
        />

        <div className="relative z-10 flex justify-end">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/5">
            <FaUtensils className="text-white text-3xl" />
          </div>
        </div>

        <div className="relative z-10 w-full max-w-lg mt-auto mb-10 ml-auto">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <FaHeart className="text-green-400 text-3xl" />
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-[1.1]">
              Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 font-extrabold pb-2 inline-block">Students, by Students.</span>
            </h2>
            <p className="text-gray-300 text-lg font-medium leading-relaxed opacity-90">
              Stop eating mess food. Start eating real, authentic home-cooked meals delivered right to your hostel door.
            </p>

            <div className="mt-8 flex gap-3">
              <div className="w-10 h-1 rounded-full bg-green-500"></div>
              <div className="w-4 h-1 rounded-full bg-white/20"></div>
              <div className="w-4 h-1 rounded-full bg-white/20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
