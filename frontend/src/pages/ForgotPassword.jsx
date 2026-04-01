import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowRight, FiCheckCircle } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setError("Email is required");
    } else if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
    } else {
      setError("");
      setSubmitted(true);
      console.log("Send reset link API call will go here");
      // TODO: Backend integration later
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-blue-200/40 rounded-full blur-[90px] pointer-events-none" />

      {/* Back to Login Button - Floating */}
      <Link to="/login" className="absolute top-6 left-6 lg:left-8 z-50">
        <motion.button 
          whileHover={{ scale: 1.05, x: -5 }} 
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-gray-700 shadow-sm border border-gray-100 hover:text-emerald-600 transition-colors"
        >
          &larr; Back to Login
        </motion.button>
      </Link>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg bg-white/70 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-white/60 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner ring-1 ring-emerald-200">
               <FiMail className="text-emerald-500 text-3xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Forgot Password?
            </h2>
            <p className="text-gray-500 font-medium mt-3">
              Don't worry! It happens. Please enter the email associated with your account.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center"
            >
              <FiCheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-xl font-black text-gray-900 mb-2">Check your inbox</h3>
              <p className="text-gray-600 font-medium">We've sent a secure password reset link to <span className="font-bold text-gray-800">{email}</span>.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              <div className="relative group">
                <label className="block text-gray-700 mb-1.5 text-sm font-bold ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors text-lg" />
                  <input
                    type="email"
                    placeholder="name@college.edu"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-gray-800 rounded-xl border ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                    value={email}
                    onChange={(e) => {
                       setEmail(e.target.value);
                       if(error) setError("");
                    }}
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-2 ml-1 font-bold">{error}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gray-900 hover:bg-emerald-500 py-3.5 rounded-xl text-white font-black text-lg shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Reset Link <FiArrowRight />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
