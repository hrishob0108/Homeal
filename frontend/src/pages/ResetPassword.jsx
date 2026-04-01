import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiShield, FiCheckCircle, FiArrowRight } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("All fields are required");
    } else if (password.length < 6) {
      setError("Password must be at least 6 characters");
    } else if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      setError("");
      setSuccess(true);
      console.log("Reset password API call will go here");
      // TODO: backend integration later
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-pink-200/40 rounded-full blur-[90px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg bg-white/70 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-white/60 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner ring-1 ring-purple-200">
               <FiShield className="text-purple-500 text-3xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Create New Password
            </h2>
            <p className="text-gray-500 font-medium mt-3">
              Your new password must be different from previous used passwords.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center"
            >
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6">
                 <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                 <h3 className="text-2xl font-black text-gray-900 mb-2">All set!</h3>
                 <p className="text-gray-600 font-medium">Your password has been successfully reset.</p>
              </div>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gray-900 hover:bg-emerald-500 py-3.5 rounded-xl text-white font-black text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Return to Login <FiArrowRight />
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-5" variants={itemVariants}>
              <div className="relative group">
                <label className="block text-gray-700 mb-1.5 text-sm font-bold ml-1">New Password</label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-purple-500 transition-colors text-lg" />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-gray-800 rounded-xl border ${error && error.includes('Password') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-purple-400 focus:ring-purple-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                    value={password}
                    onChange={(e) => {
                       setPassword(e.target.value);
                       if(error) setError("");
                    }}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-gray-700 mb-1.5 text-sm font-bold ml-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-purple-500 transition-colors text-lg" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-gray-800 rounded-xl border ${error && error.includes('Match') ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-purple-400 focus:ring-purple-400/20'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-gray-300`}
                    value={confirmPassword}
                    onChange={(e) => {
                       setConfirmPassword(e.target.value);
                       if(error) setError("");
                    }}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-1 ml-1 font-bold">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gray-900 hover:bg-purple-600 mt-2 py-3.5 rounded-xl text-white font-black text-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                Save New Password
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
