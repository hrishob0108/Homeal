import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiBriefcase } from "react-icons/fi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const SelectRole = () => {
  const navigate = useNavigate();
  const googleUser = JSON.parse(localStorage.getItem("googleUser")) || { name: "Student" };

  const handleRoleSelection = async (role) => {
    try {
      const response = await fetch("/api/auth/google", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ name: googleUser.name, email: googleUser.email, role: role })
      });
      const data = await response.json();
      
      if(response.ok) {
         localStorage.setItem("currentUser", JSON.stringify(data));
         navigate(`/${role}-dashboard`);
      } else {
         console.error(data.message);
      }
    } catch(err) {
       console.error("Network Error", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-green-200/50 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] bg-orange-200/50 rounded-full blur-[90px] pointer-events-none"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/70 backdrop-blur-2xl p-10 sm:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-white/60 w-full max-w-2xl text-center relative z-10"
      >
         <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 ring-1 ring-orange-200">
              Almost There
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">{googleUser.name}! 👋</span>
            </h2>
         </motion.div>
        
        <motion.p variants={itemVariants} className="text-gray-500 font-medium text-lg mb-10 max-w-md mx-auto">
          Tell us how you plan on using Foodler today so we can set up your personalized dashboard.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => handleRoleSelection("hosteler")}
              className="w-full text-left bg-white hover:bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-400 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <FiHome className="text-emerald-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Hosteler</h3>
              <p className="text-gray-500 font-medium leading-relaxed">I want to order delicious home-cooked meals.</p>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => handleRoleSelection("dayscholar")}
              className="w-full text-left bg-white hover:bg-orange-50 border-2 border-orange-100 hover:border-orange-400 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <FiBriefcase className="text-orange-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Dayscholar</h3>
              <p className="text-gray-500 font-medium leading-relaxed">I want to sell my home-cooked meals on campus.</p>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SelectRole;
