import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { FaUtensils, FaCheckCircle, FaStar, FaArrowRight, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { FiChevronRight, FiShield, FiClock, FiUsers } from "react-icons/fi";

const Marquee = () => {
  return (
    <div className="w-full bg-green-500 overflow-hidden py-4 rotate-[-1deg] scale-105 my-12 z-20 relative shadow-[0_10px_40px_rgba(34,197,94,0.3)] border-y border-green-400">
      <motion.div
        className="flex whitespace-nowrap text-white font-black text-xl md:text-2xl uppercase tracking-widest gap-8"
        animate={{ x: [0, -1000] }}
        transition={{ ease: "linear", duration: 25, repeat: Infinity }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <span>Home Cooked Love</span>
            <span>✦</span>
            <span>Dayscholar Delivered</span>
            <span>✦</span>
            <span>No More Mess Food</span>
            <span>✦</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const RotatingWord = () => {
  const words = ["Love 💚", "Community 🤝", "Care 🏡"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-flex items-end justify-center w-[320px] sm:w-[480px] lg:w-[650px] h-[1.2em] overflow-hidden translate-y-[10%] mt-2 sm:mt-4">
      <AnimatePresence>
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0, x: "-50%" }}
          animate={{ y: "0%", opacity: 1, x: "-50%" }}
          exit={{ y: "-100%", opacity: 0, x: "-50%" }}
          transition={{ duration: 0.6, ease: "backInOut" }}
          className="absolute left-1/2 bottom-0 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700 whitespace-nowrap pb-2 text-center"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="bg-[#FFFBF7] bg-dot-pattern min-h-screen font-sans text-gray-900 overflow-x-hidden">

      {/* FLOATING PILL NAVBAR */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/70 backdrop-blur-2xl rounded-full px-6 py-4 shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white/50 z-50 flex justify-between items-center"
      >
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-500 transition-colors">
            <FaUtensils className="text-green-600 group-hover:text-white transition-colors text-xl" />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-800">Foodler</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/login" className="hidden sm:block font-bold text-gray-500 hover:text-green-600 transition-colors">
            Log In
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              Start Sharing
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* MASSIVE CENTERPIECE HERO */}
      <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-start pt-32 sm:pt-40 overflow-hidden px-4">

        {/* Abstract Background Highlights */}
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-green-200/40 rounded-full blur-[100px] z-0" />
        <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] bg-yellow-100/40 rounded-full blur-[120px] z-0" />

        <motion.div style={{ opacity: heroOpacity }} className="text-center z-20 max-w-5xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-700 font-bold text-sm tracking-wide">Foodler is now active on campus!</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl lg:text-[6.5rem] font-black tracking-tighter leading-[1] text-gray-900 mb-8 mx-auto flex flex-col justify-center items-center">
            <span>Taste Comfort.</span>
            <span>Share</span>
            <RotatingWord />
          </h1>

          <p className="text-lg sm:text-2xl text-gray-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with dayscholars to get authentic, hot homemade meals delivered right to your hostel.
          </p>

          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-10 py-5 rounded-full text-white text-xl font-black shadow-[0_20px_40px_-10px_rgba(34,197,94,0.5)] transition-all flex items-center gap-4 mx-auto"
            >
              Get Your First Meal
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating 3D Image & Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, type: "spring" }}
          className="relative mt-20 lg:mt-8 w-full max-w-2xl lg:max-w-3xl flex justify-center z-10"
        >
          <motion.img
            animate={{ y: [-15, 10, -15], rotate: [-1, 1, -1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            src="/hero-meal.png"
            alt="Futuristic Floating Meal"
            className="w-full h-auto drop-shadow-[0_45px_45px_rgba(34,197,94,0.15)] relative z-10"
          />

          {/* Floating Badge 1 */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[20%] left-[5%] sm:left-[-5%] bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center gap-3 z-20"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verified</p>
              <p className="text-lg font-black text-gray-800">Dayscholars</p>
            </div>
          </motion.div>

          {/* Floating Badge 2 */}
          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[20%] right-[5%] sm:right-[-10%] bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col items-center gap-1 z-20"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-xl" />)}
            </div>
            <p className="text-sm font-bold text-gray-500 mt-1">4.9/5 Average Rating</p>
          </motion.div>
        </motion.div>
      </section>

      {/* MARQUEE BANNER */}
      <Marquee />

      {/* BENTO BOX GRID FEATURES */}
      <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto relative z-10">
        <div className="mb-16">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 leading-tight">
            Stop eating mess food. <br />
            <span className="text-gray-400">Start eating real food.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">

          {/* Main Large Box */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-2 row-span-2 bg-[#1A1A1A] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-green-900/10"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />

            <div className="z-10">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/5">
                <FiShield className="text-green-400 text-3xl" />
              </div>
              <h3 className="text-4xl text-white font-black leading-tight mb-4">
                Trust & Safety <br /> Built-in.
              </h3>
              <p className="text-gray-400 text-lg max-w-md font-medium leading-relaxed">
                Every meal is rated and reviewed by your peers. Our dayscholar verification ensures you only get food from trusted community members.
              </p>
            </div>
          </motion.div>

          {/* Small Box 1 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 row-span-1 bg-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-green-100/50 border border-green-50 flex flex-col justify-center"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl text-gray-900 font-extrabold leading-tight">Lightning <br /> Fast</h3>
              <div className="bg-green-100 p-3 rounded-xl">
                <FiClock className="text-green-600 text-2xl" />
              </div>
            </div>
            <p className="text-gray-500 font-medium">Coordinate drop-offs during college breaks or lunch hours instantly.</p>
          </motion.div>

          {/* Small Box 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 row-span-1 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl shadow-green-500/20 flex flex-col justify-end text-white"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <FiUsers className="text-white/80 text-5xl mb-4" />
            <h3 className="text-3xl font-black mb-2">Community Driven</h3>
            <p className="text-green-50 text-sm font-medium">Build lasting friendships over shared homemade meals.</p>
          </motion.div>
        </div>
      </section>

      {/* VERTICAL TIMELINE: HOW IT WORKS */}
      <section className="py-24 px-6 md:px-16 relative bg-white border-y border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-4">How Foodler Works</h2>
            <p className="text-xl text-gray-500 font-medium">From craving to eating in three easy steps.</p>
          </div>

          <div className="relative">
            {/* The line */}
            <div className="absolute left-[39px] md:left-1/2 top-4 bottom-4 w-1 bg-green-100 md:-translate-x-1/2 z-0 rounded-full" />

            {[
              {
                step: "01",
                title: "Post a Request",
                desc: "Craving rajma chawal or missing mom's parathas? Post your meal request on the platform.",
                icon: <FaHeart className="text-white text-xl" />,
                align: "right"
              },
              {
                step: "02",
                title: "Dayscholar Connects",
                desc: "A friendly dayscholar accepts your request and brings an extra portion from their home.",
                icon: <FiUsers className="text-white text-xl" />,
                align: "left"
              },
              {
                step: "03",
                title: "Meet & Eat",
                desc: "Meet up safely on campus, pay securely through the app, and enjoy a taste of home.",
                icon: <FaMapMarkerAlt className="text-white text-xl" />,
                align: "right"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`relative flex flex-col md:flex-row items-center mb-16 last:mb-0 z-10 ${item.align === "left" ? "md:flex-row-reverse" : ""}`}
              >
                {/* Visual Step Marker */}
                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-8 h-8 md:w-16 md:h-16 rounded-full bg-green-500 border-4 border-white shadow-lg flex items-center justify-center shrink-0">
                  <span className="hidden md:block">{item.icon}</span>
                </div>

                {/* Content */}
                <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${item.align === "left" ? "md:pr-16 text-left md:text-right" : "md:pl-16 text-left"}`}>
                  <p className="text-green-500 font-black text-6xl opacity-20 absolute -top-4 -left-2 md:opacity-100 md:relative md:top-0 md:left-0 md:mb-2">{item.step}</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-lg font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GIANT CALL TO ACTION FOOTER */}
      <footer className="w-full bg-green-600 rounded-t-[3rem] mt-24 px-6 py-24 sm:py-32 flex flex-col items-center justify-center text-center relative overflow-hidden z-20 shadow-[0_-20px_50px_rgba(34,197,94,0.3)]">
        {/* Background Patterns for Footer */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-green-700/50 rounded-full border border-green-500/30 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <FaUtensils className="text-green-300 text-6xl mb-8" />
          <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
            Ready for a Taste of Home?
          </h2>
          <p className="text-xl sm:text-2xl text-green-100 font-medium mb-12 max-w-2xl">
            Join the Foodler family today and never settle for boring campus food again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-white text-green-700 px-10 py-5 rounded-full font-black text-xl shadow-2xl shadow-green-900/40 hover:bg-gray-50 transition-colors"
              >
                Create Account
              </motion.button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-green-700 hover:bg-green-800 border-2 border-green-500 text-white px-10 py-5 rounded-full font-bold text-xl transition-colors"
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </div>

        <p className="relative z-10 text-green-200 mt-24 text-sm font-medium uppercase tracking-widest">
          © {new Date().getFullYear()} Foodler — Designed to share love.
        </p>
      </footer>
    </div>
  );
};

export default Home;
