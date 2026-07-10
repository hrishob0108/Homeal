import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaArrowLeft, FaHeart } from "react-icons/fa";
import { FiUser, FiMail, FiLock, FiShield, FiPhone, FiChevronRight } from "react-icons/fi";
import api from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";

    if (!formData.phone) newErrors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be exactly 10 digits";

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
        const response = await api.post("/auth/register", formData);
        const data = response.data;
        if (response.status === 200 || response.status === 201) {
          sessionStorage.setItem("user", JSON.stringify(data));
          sessionStorage.setItem("currentUser", JSON.stringify(data));
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen relative w-full flex bg-cream font-sans text-espresso select-none overflow-x-hidden">
      
      {/* Floating Decorative Elements */}
      <span className="absolute top-10 right-10 text-primary/10 text-4xl select-none animate-spin-slow z-0">✿</span>
      <span className="absolute bottom-10 left-10 text-secondary/20 text-3xl select-none animate-bounce-slow z-0">🍃</span>

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

      {/* LEFT PANEL - VISUAL BENEFITS DISPLAY (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-espresso to-[#4E2424] relative overflow-hidden p-16 xl:p-20">
        {/* Background Decorative Blobs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-secondary/15 rounded-full blur-[80px] pointer-events-none"
        />

        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/90 p-3 rounded-2xl shadow-lg border border-white/20">
            <FaUtensils className="text-primary text-2xl" />
          </div>
          <span className="text-3xl font-serif font-black text-white tracking-tight">Cravyo</span>
        </div>

        {/* Hero Features Card */}
        <div className="relative z-10 w-full max-w-lg mt-auto mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <FaHeart className="text-primary text-3xl animate-pulse" />
            </div>

            <h2 className="text-4xl xl:text-5xl font-serif font-black text-white mb-6 leading-[1.1]">
              Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-extrabold pb-2 inline-block">
                Students, by Students.
              </span>
            </h2>
            <p className="text-gray-300 text-base xl:text-lg font-medium leading-relaxed opacity-90 mb-8">
              Stop eating boring mess food. Get delicious home-cooked meals delivered directly to your hostel room.
            </p>

            {/* Checklist */}
            <div className="space-y-3 font-semibold text-sm text-white/90 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2.5">
                <span className="text-secondary">✔</span> Peer-verified student delivery network
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-secondary">✔</span> Live order status updates via WebSockets
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-secondary">✔</span> Ratings and reviews for meal safety
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - FORM ENTRY (Centered on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative xl:px-32 z-10 my-10 lg:my-0">
        
        {/* Mobile background blob */}
        <div className="lg:hidden absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-white/80 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none p-8 sm:p-12 lg:p-0 rounded-[2.5rem] shadow-[0_20px_50px_rgba(60,34,34,0.03)] lg:shadow-none border border-white/60 lg:border-none relative"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 text-center lg:text-left">
            <span className="inline-block bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-primary/20">
              Get Started
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-espresso leading-tight">
              Create Account ✨
            </h2>
            <p className="text-espresso-light font-medium text-base mt-2">Join Cravyo to share and discover homemade meals</p>
          </motion.div>

          {/* API Error Message */}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`w-full pl-13 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.name ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.name}</p>}
            </motion.div>

            {/* Email Address */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@college.edu"
                  className={`w-full pl-13 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.email}</p>}
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative flex items-center">
                <FiPhone className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                  className={`w-full pl-13 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.phone}</p>}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  className={`w-full pl-13 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.password ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.password}</p>}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants} className="relative group">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative flex items-center">
                <FiShield className="absolute left-4.5 text-gray-400 group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  className={`w-full pl-13 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45 text-base`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.confirmPassword}</p>
              )}
            </motion.div>

            {/* Role select */}
            <motion.div variants={itemVariants} className="relative group pt-1">
              <label className="block text-espresso mb-1 text-xs font-black uppercase tracking-wider ml-1">You are signing up as a:</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-5 py-3.5 bg-white text-espresso rounded-2xl border ${
                    errors.role ? 'border-red-400 focus:ring-red-400' : 'border-primary/25 focus:border-primary focus:ring-primary/10'
                  } focus:outline-none focus:ring-4 transition-all duration-300 font-bold shadow-sm appearance-none cursor-pointer text-base hover:border-primary/45`}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="hosteler">🏡 Hosteler</option>
                  <option value="dayscholar">🎒 Dayscholar</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400 group-hover:text-primary transition-colors">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
              {errors.role && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{errors.role}</p>}
            </motion.div>

            {/* Register Action Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover py-4.5 rounded-2xl text-white font-black text-lg shadow-[0_12px_24px_rgba(168,68,68,0.15)] hover:shadow-[0_12px_24px_rgba(168,68,68,0.3)] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                Sign Up ✨
                <FiChevronRight className="text-xl" />
              </motion.button>
            </motion.div>
          </form>

          {/* Login redirect */}
          <motion.p variants={itemVariants} className="mt-8 text-center text-espresso-light font-medium text-base">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-hover font-black ml-1 relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left cursor-pointer"
            >
              Login here
            </Link>
          </motion.p>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;
