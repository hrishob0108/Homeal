import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowRight, FiCheckCircle, FiChevronLeft } from "react-icons/fi";

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
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 relative overflow-hidden font-sans text-espresso select-none">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-secondary/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Back to Login Button - Floating */}
      <Link to="/login" className="absolute top-6 left-6 lg:left-8 z-50">
        <motion.button 
          whileHover={{ scale: 1.05, x: -3 }} 
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full font-bold text-espresso shadow-md border border-gray-100/50 hover:text-primary transition-all cursor-pointer"
        >
          <FiChevronLeft className="text-lg" /> Back to Login
        </motion.button>
      </Link>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(60,34,34,0.04)] border border-white/60 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary/20">
               <FiMail className="text-primary text-3xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-espresso tracking-tight leading-tight">
              Forgot Password?
            </h2>
            <p className="text-espresso-light font-medium mt-3">
              Don't worry! It happens. Please enter the email associated with your account.
            </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-sage/40 border border-primary/10 rounded-2xl p-6 text-center"
            >
              <FiCheckCircle className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
              <h3 className="text-xl font-serif font-black text-espresso mb-2">Check your inbox</h3>
              <p className="text-espresso-light font-medium">We've sent a secure password reset link to <span className="font-bold text-espresso">{email}</span>.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-6" variants={itemVariants}>
              <div className="relative group">
                <label className="block text-espresso mb-2 text-sm font-bold ml-1">Email Address</label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-4 text-gray-400 group-focus-within:text-primary transition-colors text-lg" />
                  <input
                    type="email"
                    placeholder="name@college.edu"
                    className={`w-full pl-11 pr-4 py-3.5 bg-white text-espresso rounded-2xl border ${error ? 'border-red-400 focus:ring-red-400' : 'border-primary/20 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all duration-300 font-medium shadow-sm hover:border-primary/45`}
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
                className="w-full bg-primary hover:bg-primary-hover py-4 rounded-2xl text-white font-black text-lg shadow-[0_12px_24px_rgba(168,68,68,0.15)] hover:shadow-[0_12px_24px_rgba(168,68,68,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
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
