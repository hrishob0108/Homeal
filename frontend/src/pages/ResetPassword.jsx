import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiShield, FiCheckCircle, FiArrowRight, FiLoader } from "react-icons/fi";

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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccess(true);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 relative overflow-hidden font-sans text-espresso select-none">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-secondary/15 rounded-full blur-[90px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(60,34,34,0.04)] border border-white/60 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
               <FiShield className="text-primary text-3xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-espresso tracking-tight leading-tight">
              Create New Password
            </h2>
            <p className="text-espresso-light font-medium mt-3">
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
              <div className="bg-sage/40 border border-primary/10 rounded-[2rem] p-8 mb-6 shadow-inner">
                 <FiCheckCircle className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
                 <h3 className="text-2xl font-serif font-black text-espresso mb-2">All set!</h3>
                 <p className="text-espresso-light font-medium">Your password has been successfully reset.</p>
              </div>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary hover:bg-primary-hover py-4 rounded-2xl text-white font-black text-lg shadow-[0_12px_24px_rgba(168,68,68,0.15)] hover:shadow-[0_12px_24px_rgba(168,68,68,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Return to Login <FiArrowRight />
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-5" variants={itemVariants}>
              <div className="relative group">
                <label className="block text-espresso mb-1.5 text-sm font-bold ml-1">New Password</label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${error && error.includes('Password') ? 'border-red-400 focus:ring-red-400' : 'border-primary/20 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45`}
                    value={password}
                    onChange={(e) => {
                       setPassword(e.target.value);
                       if(error) setError("");
                    }}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-espresso mb-1.5 text-sm font-bold ml-1">Confirm Password</label>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${error && error.includes('Match') ? 'border-red-400 focus:ring-red-400' : 'border-primary/20 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45`}
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
                whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-75 disabled:cursor-not-allowed mt-2 py-4 rounded-2xl text-white font-black text-lg shadow-[0_12px_24px_rgba(168,68,68,0.15)] hover:shadow-[0_12px_24px_rgba(168,68,68,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin text-white" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
