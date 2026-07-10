import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaStar, FaArrowRight, FaPlay, FaHeart } from "react-icons/fa";
import { FiUserPlus, FiEdit, FiBell, FiAward, FiEye, FiZap, FiCheck, FiChevronRight } from "react-icons/fi";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="bg-cream bg-dot-pattern min-h-screen font-sans text-espresso overflow-x-hidden pb-12 selection:bg-primary/20 selection:text-primary">

      {/* FLOATING PILL NAVBAR */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/80 backdrop-blur-2xl rounded-full px-6 py-3.5 shadow-[0_15px_40px_rgba(60,34,34,0.04)] border border-white/60 z-50 flex justify-between items-center"
      >
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="bg-primary/10 p-2.5 rounded-full group-hover:bg-primary transition-colors duration-300">
            <FaUtensils className="text-primary group-hover:text-white transition-colors text-lg" />
          </div>
          <span className="text-2xl font-serif font-black tracking-tight text-espresso">Cravyo</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/login" className="px-4 py-2 font-black text-espresso-light hover:text-primary transition-colors text-sm sm:text-base cursor-pointer">
            Log In
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-black shadow-lg hover:shadow-primary/25 transition-all cursor-pointer text-sm sm:text-base"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center pt-32 sm:pt-36 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Abstract Theme Blobs */}
        <div className="absolute top-[10%] left-[5%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full z-10">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 relative flex flex-col items-start text-left">
            {/* Flower details matching screenshot */}
            <span className="absolute -top-16 left-12 text-primary/20 text-3xl select-none animate-spin-slow">✿</span>
            <span className="absolute top-1/3 -left-8 text-secondary/30 text-2xl select-none animate-bounce-slow">🍃</span>
            <span className="absolute bottom-12 right-20 text-primary/30 text-2xl select-none">✿</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-5xl sm:text-7xl font-serif font-black text-espresso tracking-tight leading-[1.1] mb-6">
                Craving <br />
                <span className="text-primary">Ghar Ka Khana?</span> <br />
                We've Got You!
              </h1>
              <p className="text-espresso-light text-lg sm:text-xl font-medium max-w-xl leading-relaxed">
                Connecting hostelers with dayscholars who bring fresh, home-cooked meals. Taste the love of home, right at your campus.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-6 mb-12 w-full sm:w-auto"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-primary hover:bg-primary-hover text-white px-9 py-4.5 rounded-2xl font-black text-lg shadow-[0_15px_30px_rgba(168,68,68,0.2)] hover:shadow-[0_15px_30px_rgba(168,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  Get Started
                  <FaArrowRight className="text-sm" />
                </motion.button>
              </Link>
              
              <a 
                href="#how-it-works" 
                className="flex items-center justify-center gap-3 font-black text-espresso hover:text-primary transition-colors group cursor-pointer w-full sm:w-auto py-3.5"
              >
                <span className="w-11 h-11 rounded-full border-2 border-espresso/15 group-hover:border-primary flex items-center justify-center text-sm transition-colors bg-white shadow-sm">
                  <FaPlay className="text-[10px] translate-x-[1px]" />
                </span>
                How It Works
              </a>
            </motion.div>

            {/* Verification Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm sm:text-base font-black text-espresso-light/80 border-t border-primary/10 pt-8 w-full"
            >
              <span className="flex items-center gap-2"><FiUserPlus className="text-primary text-lg" /> 2,000+ Students</span>
              <span className="flex items-center gap-2 text-secondary"><FaStar className="text-secondary text-lg" /> 4.9 Rating</span>
              <span className="flex items-center gap-2"><FaUtensils className="text-primary text-lg" /> 500+ Meals Shared</span>
            </motion.div>
          </div>

          {/* Right Hero Column - Circular Artwork Centerpiece */}
          <div className="lg:col-span-5 flex justify-center items-center relative py-10 lg:py-0">
            <span className="absolute -top-4 right-1/4 text-secondary/30 text-3xl select-none animate-spin-slow">✿</span>
            <span className="absolute bottom-6 left-12 text-secondary/40 text-2xl select-none animate-bounce-slow">🍃</span>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative w-72 sm:w-96 lg:w-[28rem] h-72 sm:h-96 lg:h-[28rem]"
            >
              {/* Outer decorative dashed circle representing thali boundary */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin-slow z-0" />
              
              {/* Floating meal illustration */}
              <motion.img
                animate={{ y: [-15, 12, -15], rotate: [-0.5, 0.5, -0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                src="/hero-meal.png"
                alt="Traditional Cravyo ThaliPlatter"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_25px_35px_rgba(168,68,68,0.2)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW CRAVYO WORKS SECTION */}
      <section id="how-it-works" className="py-28 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="absolute top-10 left-12 text-primary/10 text-4xl select-none">✿</span>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-espresso mb-4">How Cravyo Works</h2>
          <p className="text-lg sm:text-xl font-bold text-secondary tracking-wide uppercase">From craving to eating — it's just four simple steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto">
          
          {/* Timeline Cartoon Graphic (Left Column) */}
          <div className="lg:col-span-6 flex justify-center relative">
            <span className="absolute -top-12 left-4 text-primary/20 text-3xl select-none">✿</span>
            <span className="absolute bottom-4 right-12 text-secondary/30 text-2xl select-none">🍃</span>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-[2.5rem] shadow-xl w-full max-w-md relative overflow-hidden flex flex-col items-center"
            >
              {/* Background gradient disk */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sage/40 rounded-full blur-3xl z-0 pointer-events-none" />

              {/* Handoff Vector Mockup Box */}
              <div className="relative z-10 flex items-center justify-center w-full h-80">
                {/* Boy Avatar */}
                <motion.div 
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full bg-secondary/15 border-2 border-secondary flex items-center justify-center text-4xl overflow-hidden shadow-md">
                    👦
                  </div>
                  <span className="mt-2 text-xs font-black bg-secondary/10 text-espresso px-2 py-0.5 rounded-full uppercase">Hosteler</span>
                </motion.div>

                {/* Handing Over Tiffin Container Animation */}
                <motion.div 
                  animate={{ scale: [0.95, 1.05, 0.95], x: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center justify-center mx-4"
                >
                  <span className="text-4xl filter drop-shadow">🍱</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Fresh delivery</span>
                  <div className="w-16 h-0.5 border-t-2 border-dashed border-primary/40 mt-1" />
                </motion.div>

                {/* Girl Avatar */}
                <motion.div 
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center text-4xl overflow-hidden shadow-md">
                    👧
                  </div>
                  <span className="mt-2 text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Dayscholar</span>
                </motion.div>
              </div>

              {/* Custom micro interaction button */}
              <div className="w-full text-center border-t border-primary/10 pt-4 relative z-10">
                <p className="text-sm font-bold text-espresso-light">Peer-to-peer campus food sharing network</p>
              </div>
            </motion.div>
          </div>

          {/* Timeline Text Steps (Right Column) */}
          <div className="lg:col-span-6 space-y-8 relative">
            {/* Dashed vertical progress indicator line */}
            <div className="absolute left-[28px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-primary/20 z-0" />

            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Create your account as a Hosteler or Dayscholar. Quick and simple.",
                color: "bg-primary",
                icon: <FiUserPlus className="text-white text-lg" />
              },
              {
                step: "2",
                title: "Request or Offer",
                desc: "Hostelers post food requests. Dayscholars browse and accept.",
                color: "bg-secondary",
                icon: <FiEdit className="text-white text-lg" />
              },
              {
                step: "3",
                title: "Get Notified",
                desc: "Real-time notification when someone accepts your request.",
                color: "bg-primary",
                icon: <FiBell className="text-white text-lg" />
              },
              {
                step: "4",
                title: "Share & Enjoy",
                desc: "Meet, share the meal, rate the experience. Simple!",
                color: "bg-secondary",
                icon: <FiCheck className="text-white text-lg" />
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-start gap-6 relative z-10 group"
              >
                {/* Step Circle */}
                <div className={`w-14 h-14 rounded-2xl ${item.color} shadow-lg flex flex-shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  {item.icon}
                </div>

                {/* Text Content */}
                <div className="bg-white/40 group-hover:bg-white/80 transition-colors p-5 rounded-2xl border border-white/50 w-full">
                  <span className="text-[10px] font-black text-espresso/40 uppercase tracking-widest block mb-1">Step {item.step}</span>
                  <h3 className="text-xl font-serif font-black text-espresso mb-1.5">{item.title}</h3>
                  <p className="text-espresso-light/95 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* BUILT FOR STUDENTS FEATURE GRID (FOOTER WRAPPER CONTAINER) */}
      <footer className="w-[92%] max-w-7xl bg-primary rounded-[3rem] mx-auto py-20 px-6 sm:px-12 lg:px-20 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(168,68,68,0.25)]">
        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-[#933838] rounded-full border border-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Badge */}
          <span className="bg-white text-primary px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 shadow-sm border border-white">
            Why Cravyo?
          </span>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight leading-[1.15] mb-4 max-w-3xl">
            Built for Students, By Students
          </h2>
          <p className="text-white/80 text-lg sm:text-xl font-medium mb-16 max-w-2xl leading-relaxed">
            Everything you need for a seamless food-sharing experience
          </p>

          {/* 6 Grid items in light sage green cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
            {[
              {
                title: "Live Menu Feed",
                desc: "Browse freshly prepared campus dishes updated in real-time by dayscholars.",
                icon: <FaUtensils className="text-espresso text-xl" />
              },
              {
                title: "Dual Dashboards",
                desc: "Switch between eating or cooking modes inside Hosteler and Dayscholar profiles.",
                icon: <FiZap className="text-espresso text-xl" />
              },
              {
                title: "Peer Reviews",
                desc: "Check average scores and leave live text ratings for every meal transaction.",
                icon: <FaStar className="text-espresso text-xl" />
              },
              {
                title: "Live Sockets",
                desc: "Experience zero page reloads with real-time socket events pushing notifications.",
                icon: <FiBell className="text-espresso text-xl" />
              },
              {
                title: "Multi-Order Tracking",
                desc: "Follow the live preparation and delivery status of multiple concurrent orders.",
                icon: <FiAward className="text-espresso text-xl" />
              },
              {
                title: "Veg/Non-Veg Indicators",
                desc: "Filter meals instantly with veg (🟢) and non-veg (🔴) indicators and tags.",
                icon: <FiEye className="text-espresso text-xl" />
              }
            ].map((card, cidx) => (
              <motion.div
                key={cidx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: cidx * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-sage p-8 rounded-[2rem] shadow-inner relative overflow-hidden flex flex-col justify-between h-64 border border-white/10 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black text-espresso mb-2">{card.title}</h3>
                  <p className="text-espresso-light text-sm font-medium leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Small copyright signature */}
          <div className="mt-20 border-t border-white/10 pt-8 w-full text-center flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-2xl font-serif font-black text-white tracking-tight">Cravyo</span>
            <p className="text-white/60 text-sm font-medium">
              © {new Date().getFullYear()} Cravyo — Taste Comfort, Share Love.
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
