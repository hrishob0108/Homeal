import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils, FaStar, FaArrowRight, FaPlay, FaHeart, FaHandshake } from "react-icons/fa";
import { FiUserPlus, FiEdit, FiBell, FiAward, FiEye, FiZap, FiCheck, FiChevronRight, FiMapPin, FiShield, FiUser, FiCreditCard, FiStar, FiCamera, FiUsers } from "react-icons/fi";
import { IoRestaurant, IoWalletOutline } from "react-icons/io5";
import heroThaliImage from "../assets/image_transparent.png";
import howItWorksImage from "../assets/image copy.png";

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
    <div className="bg-cream min-h-screen font-sans text-espresso overflow-x-hidden pb-12 selection:bg-primary/20 selection:text-primary">

      {/* FLOATING BENTO ISLAND / NAVBAR */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/85 backdrop-blur-lg px-8 py-3 rounded-full border border-white/50 z-50 flex justify-between items-center shadow-[0_15px_35px_rgba(60,34,34,0.08)]"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <span className="text-2xl font-serif font-black tracking-tight text-espresso">
            Cravyo<span className="text-primary">.</span>
          </span>
        </div>

        {/* Center Links in a sub-capsule dock */}
        <div className="hidden md:flex items-center gap-5 bg-espresso/5 px-6 py-2 rounded-full border border-espresso/5">
          {[
            { label: 'Home', path: '/home', isLink: true },
            { label: 'How It Works', path: '#how-it-works', isLink: false },
            { label: 'About', path: '#about', isLink: false },
            { label: 'Contact', path: '#contact', isLink: false }
          ].map((item) => (
            item.isLink ? (
              <Link
                key={item.label}
                to={item.path}
                className="relative py-0.5 px-2 font-bold text-espresso hover:text-primary transition-colors text-xs uppercase tracking-wider group"
              >
                {item.label}
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.path}
                className="relative py-0.5 px-2 font-bold text-espresso/70 hover:text-primary transition-colors text-xs uppercase tracking-wider group"
              >
                {item.label}
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary transition-all duration-300 w-0 group-hover:w-[calc(100%-16px)] rounded-full" />
              </a>
            )
          ))}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="relative py-1 font-bold text-espresso/85 hover:text-primary transition-colors text-xs uppercase tracking-wider cursor-pointer group"
          >
            Log In
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-bold transition-all cursor-pointer text-xs uppercase tracking-wider shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-12 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto overflow-visible bg-cream">

        {/* Floating Ornaments precisely positioned like the screenshot */}
        <motion.span
          animate={{ y: [-4, 4, -4], rotate: [0, 360, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-[8%] top-[15%] text-primary/80 text-2xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ y: [0, 6, 0], x: [0, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[47%] top-[17%] text-secondary/80 text-2xl select-none"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-[7%] top-[14%] text-primary/80 text-2xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[20%] top-[27%] text-secondary/70 text-xl select-none"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ x: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-[5%] top-[82%] text-secondary/70 text-2xl select-none"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="absolute left-[52%] top-[85%] text-secondary/70 text-2xl select-none"
        >
          🍃
        </motion.span>

        {/* Additional Beautiful Floating Ornaments */}
        <motion.span
          animate={{ y: [-5, 5, -5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-[2%] top-[48%] text-primary/60 text-xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ y: [0, 8, 0], rotate: [-15, 15, -15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="absolute left-[38%] top-[68%] text-secondary/60 text-xl select-none"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute left-[12%] top-[90%] text-primary/50 text-2xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ x: [-3, 3, -3], y: [-3, 3, -3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[32%] top-[10%] text-secondary/60 text-lg select-none"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ y: [-4, 4, -4], rotate: [0, -360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1.5 }}
          className="absolute left-[45%] top-[88%] text-primary/55 text-xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ scale: [0.9, 1.1, 0.9], y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute right-[28%] top-[8%] text-primary/60 text-xl select-none"
        >
          ✿
        </motion.span>
        <motion.span
          animate={{ y: [0, -7, 0], x: [0, 4, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute right-[42%] top-[60%] text-secondary/50 text-xl select-none"
        >
          🍃
        </motion.span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full z-10 relative">

          {/* Left Hero Column */}
          <div className="lg:col-span-6 relative flex flex-col items-start text-left lg:-translate-x-12 lg:translate-y-6">

            <div className="mb-6 relative w-full">
              {/* Add line spacing using letter-spacing */}
              <h1 className="text-6xl sm:text-7xl lg:text-7.5xl font-serif font-black text-espresso tracking-tight leading-[1.2] mb-6 ">
                Craving <br />
                <span className="text-primary">Ghar Ka Khana?</span> <br />
                We've Got You!
              </h1>
              {/* Floating flower to the right of Craving */}
              <motion.span
                animate={{ scale: [0.9, 1.05, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-8 left-[230px] sm:left-[280px] text-primary text-2xl select-none"
              >
                ✿
              </motion.span>
            </div>

            <p className="text-espresso-light text-lg sm:text-xl font-medium max-w-2xl leading-relaxed mb-8">
              Connecting hostelers with dayscholars who bring fresh, home-cooked meals. Taste the love of home, right at your campus.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-6 mb-12 relative w-full">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-lg font-bold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Get Started
                </motion.button>
              </Link>

              <a
                href="#how-it-works"
                className="flex items-center gap-2 font-bold text-primary hover:text-primary-hover transition-colors text-lg cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full border border-primary flex items-center justify-center text-xs">
                  <FaPlay className="translate-x-[0.5px]" />
                </span>
                How It Works
              </a>

              {/* Pink flower next to How It Works */}
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="text-primary text-2xl select-none ml-2"
              >
                ✿
              </motion.span>
            </div>

            {/* Verification Stats - Clean, no border line, exactly matching screenshot */}
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-bold text-[#5C3D3D] pt-2 w-full">
              {/* <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#A84444] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                2,000+ Students
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#D19A3B] fill-current flex-shrink-0" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                4.9 Rating
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5F8575] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                </svg>
                500+ Meals Shared
              </span> */}
            </div>
          </div>

          {/* Right Hero Column - Platter on Solid red/maroon Circle Backdrop */}
          <div className="lg:col-span-6 flex justify-center items-center relative py-10 lg:py-0 overflow-visible">
            {/* Massive solid primary red circle backdrop bleeding off edge */}
            <div className="absolute w-[24rem] h-[24rem] sm:w-[32rem] sm:h-[32rem] lg:w-[36rem] lg:h-[36rem] rounded-full bg-[#A84444] z-0 right-[-45%] top-[-16rem] shadow-xl" />

            {/* Meal illustration (Static & Absolutely Positioned) */}
            <div
              className="absolute z-10 w-96 sm:w-[28rem] lg:w-[46rem] h-96 sm:h-[28rem] lg:h-[46rem] right-[-40%] top-[-21rem] overflow-visible"
            >
              <img
                src={heroThaliImage}
                alt="Traditional Cravyo Thali Platter"
                className="w-full h-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.3)] top-[-10%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW CRAVYO WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto relative bg-cream">
        <div className="text-center mb-16 relative">
          {/* Flower top-left of title */}
          <span className="absolute left-[10%] md:left-[25%] top-[-20px] text-primary text-xl select-none">✿</span>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-[#3C2222] mb-3">How Cravyo Works</h2>
          <div className="inline-flex items-center gap-2 justify-center">
            <p className="text-lg sm:text-xl font-bold text-[#C27C5B] tracking-wide">From craving to eating — it's just four simple steps</p>
            {/* Leaf next to subtitle */}
            <span className="text-secondary text-xl select-none">🍃</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-6xl mx-auto">

          {/* Timeline Cartoon Graphic (Left Column) */}
          <div className="lg:col-span-6 flex justify-center relative py-6">
            {/* Floating ornaments inside left column around illustration */}
            {/* Flower top-left */}
            <span className="absolute left-[5%] top-[10%] text-primary text-xl select-none">✿</span>
            {/* Leaf middle-right near lunchbox */}
            <span className="absolute right-[25%] top-[40%] text-secondary text-xl select-none">🍃</span>
            {/* Flower top-right */}
            <span className="absolute right-[5%] top-[15%] text-primary text-xl select-none">✿</span>
            {/* Flower bottom-left */}
            <span className="absolute left-[15%] bottom-[10%] text-primary text-xl select-none">✿</span>
            {/* Leaf bottom-middle */}
            <span className="absolute left-[45%] -bottom-[5%] text-secondary text-xl select-none">🍃</span>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-[480px] z-10 flex justify-center items-center"
            >
              <img
                src={howItWorksImage}
                alt="Students sharing food illustration"
                className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(60,34,34,0.06)]"
              />
            </motion.div>
          </div>

          {/* Timeline Text Steps (Right Column) */}
          <div className="lg:col-span-6 space-y-12 sm:space-y-16 relative">
            {/* Dashed vertical progress indicator line */}
            <div className="absolute left-[28px] sm:left-[32px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-[#C5AE8E]/80 z-0" />

            {/* Flower above Step 1 badge */}
            <span className="absolute left-[16px] sm:left-[20px] -top-10 text-primary text-xl select-none">✿</span>

            {/* Leaf near Step 4 */}
            <span className="absolute right-0 bottom-4 text-secondary text-xl select-none">🍃</span>

            {[
              {
                step: "1",
                title: "Sign Up",
                desc: "Create your account as a Hosteler or Dayscholar. Quick and simple.",
                icon: <FiUserPlus className="text-2xl" />,
                bgColorClass: "bg-[#A84444]"
              },
              {
                step: "2",
                title: "Request or Offer",
                desc: "Hostelers post food requests. Dayscholars browse and accept.",
                icon: <IoRestaurant className="text-2xl" />,
                bgColorClass: "bg-[#D19A3B]"
              },
              {
                step: "3",
                title: "Get Notified",
                desc: "Real-time notification when someone accepts your request.",
                icon: <FiBell className="text-2xl" />,
                bgColorClass: "bg-[#A84444]"
              },
              {
                step: "4",
                title: "Share & Enjoy",
                desc: "Meet, share the meal, rate the experience. Simple!",
                icon: <FaHandshake className="text-2xl" />,
                bgColorClass: "bg-[#D19A3B]"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-center gap-6 sm:gap-8 relative z-10 group"
              >
                {/* Icon Container with Badge */}
                <div className="relative flex-shrink-0">
                  {/* Badge */}
                  <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-[#E2C799] rounded-md border border-[#C5A87A] text-[#3C2222] text-xs font-bold flex items-center justify-center shadow-sm z-20">
                    {item.step}
                  </div>
                  {/* Icon Box */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bgColorClass} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    {item.icon}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 text-center pr-4 sm:pr-8">
                  <h3 className="text-xl sm:text-2xl font-serif font-black text-espresso mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[#C27C5B] font-bold text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. BUILT FOR STUDENTS FEATURE GRID (DARK RED BACKGROUND & WAVY TRANSITIONS) */}
      <section className="relative w-full overflow-visible z-10 bg-cream">
        {/* Branch illustration on the left - Hugging the top-left corner, overlapping wave */}
        <div className="absolute left-[-150px] top-[-20px] md:top-0 w-[45%] md:w-[48%] max-w-[550px] pointer-events-none select-none z-20 hidden md:block">
          <img
            src="/branch.png"
            alt="Flower branch decoration"
            className="w-full h-auto object-contain origin-left"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Top Wave transition into Dark Red */}
        <div className="w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[120px] md:h-[180px] fill-[#802B2B]">
            <path d="M0,96L80,112C160,128,320,160,480,144C640,128,800,64,960,53.3C1120,43,1280,85,1360,106.7L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Dark Red Core Section */}
        <div className="bg-[#802B2B] pt-8 pb-20 px-6 sm:px-12 lg:px-20 text-center w-full relative overflow-hidden">

          {/* Floating Leaves - Dense Falling Cascade from the branch on the left */}
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[5%] top-[15%] w-10 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[15deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[10%] top-[10%] w-10 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[55deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[18%] top-[20%] w-12 sm:w-16 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[25deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[35%] top-[18%] w-8 sm:w-10 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[35deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[28%] top-[28%] w-12 sm:w-16 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[15deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[8%] top-[30%] w-8 sm:w-10 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[45deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[22%] top-[35%] w-10 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[65deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[15%] top-[38%] w-10 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[10deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[12%] top-[45%] w-12 sm:w-16 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[10deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[2%] top-[48%] w-8 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[75deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[25%] top-[50%] w-10 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[15deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[5%] top-[55%] w-10 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[35deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[35%] top-[58%] w-12 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[5deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[18%] top-[65%] w-12 sm:w-16 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[25deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[10%] top-[68%] w-10 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[25deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[30%] top-[70%] w-9 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[45deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[22%] top-[78%] w-8 sm:w-10 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[45deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[10%] top-[80%] w-8 sm:w-12 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[20deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[25%] top-[85%] w-10 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[15deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-green.png"
            alt="Green leaf"
            className="absolute left-[32%] top-[90%] w-10 sm:w-14 h-auto pointer-events-none select-none z-10 hidden md:block -rotate-[15deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img
            src="/leaf-red.png"
            alt="Red leaf"
            className="absolute left-[12%] top-[95%] w-12 sm:w-16 h-auto pointer-events-none select-none z-10 hidden md:block rotate-[35deg]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="max-w-6xl mx-auto flex flex-col items-center relative z-20">
            {/* Badge */}
            <span className="bg-[#FCF9F6] text-[#802B2B] px-6 py-2 rounded-full text-sm font-semibold shadow-sm border border-[#FCF9F6] mb-6">
              Why Cravyo?
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-white tracking-tight leading-[1.15] mb-4 max-w-5xl">
              Built for Students, By Students
            </h2>
            <p className="text-[#FFEFE6] font-serif text-lg sm:text-xl font-medium mb-16 max-w-2xl leading-relaxed opacity-90">
              Everything you need for a seamleass food-sharing experience
            </p>

            {/* 6 Grid items in light beige/cream cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
              {[
                {
                  title: "Verified Users",
                  desc: "College ID verification ensures trust and safety for all users.",
                  icon: <FiShield className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                },
                {
                  title: "Easy Payments",
                  desc: "Seamless payment integration. Pay securely through the app.",
                  icon: <IoWalletOutline className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                },
                {
                  title: "Ratings & Reviews",
                  desc: "Rate your experience. Build trust through community feedback.",
                  icon: <FiStar className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                },
                {
                  title: "Real-time Updates",
                  desc: "Get instant notifications when your request is accepted.",
                  icon: <FiBell className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                },
                {
                  title: "Food Proof",
                  desc: "Optional photo proof ensures authenticity of home-cooked meals.",
                  icon: <FiCamera className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                },
                {
                  title: "Community Driven",
                  desc: "Built by students, for students. Join a growing community.",
                  icon: <FiUsers className="text-[#802B2B] text-xl" strokeWidth={1.5} />,
                  iconBg: "bg-[#F8E3E3]"
                }
              ].map((card, cidx) => (
                <motion.div
                  key={cidx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: cidx * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-[#FCF9F6] p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-start gap-4 h-48 group cursor-pointer hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 ${card.iconBg} rounded-[12px] flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-serif font-bold text-[#6B3B32] mb-1">{card.title}</h3>
                    <p className="text-[#805047] text-[13px] font-medium leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Wave transition back to Cream */}
        <div className="w-full overflow-hidden leading-[0] bg-[#802B2B]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-cream rotate-180 origin-center">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,42.4V0Z"></path>
          </svg>
        </div>
      </section>

      {/* 4. STORIES FROM THE CRAVYO FAMILY (TESTIMONIALS SECTION) */}
      <section className="py-24 px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto relative z-10 bg-cream">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="bg-[#EBD9D9] text-[#6B3B32] px-6 py-2 rounded-full text-sm font-bold shadow-sm mb-6">
            Real Stories
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#3C2222] mb-4">
            Stories from the Cravyo family
          </h2>
          <p className="text-lg sm:text-xl font-bold text-[#8D6A4E] tracking-wide">
            Real meals. Real friendships. Real comfort.
          </p>
        </div>

        {/* Mobile View - Stacked */}
        <div className="lg:hidden flex flex-col gap-6 max-w-lg mx-auto">
          <div className="bg-[#FCF9F6] border border-[#EBE1D7] rounded-3xl p-6 shadow-sm relative text-center">
            <p className="text-[#6B3B32] font-serif font-bold text-lg mb-4">"Got dal-chawal from a senior's mom last week. I literally teared up. Cravyo is magic."</p>
            <h4 className="text-[#D4807D] font-bold">Ananya R.</h4>
            <span className="text-xs text-[#D4807D]">Hosteler • Year 2</span>
          </div>
          <div className="bg-[#FCF9F6] border border-[#EBE1D7] rounded-3xl p-6 shadow-sm relative text-center">
            <p className="text-[#6B3B32] font-serif font-bold text-lg mb-4">"Better than mess food, cheaper than Swiggy, and made with actual love. 10/10."</p>
            <h4 className="text-[#D4807D] font-bold">Priya M.</h4>
            <span className="text-xs text-[#D4807D]">Hosteler • Year 3</span>
          </div>
        </div>

        {/* Desktop View - Exact Scrapbook Freeform Layout */}
        <div className="hidden lg:block relative w-full h-[900px] max-w-[1200px] mx-auto">
          
          {/* Card 1 - Ananya R. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[3%] top-[5%] w-[250px] flex flex-col rounded-[24px] shadow-sm bg-[#FCF9F6] border border-[#EBE1D7] overflow-visible"
          >
            <div className="p-6 pb-8 text-center flex flex-col items-center">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="text-[#C87474] text-[13px]" />)}
              </div>
              <p className="text-[#6B3B32] font-serif font-bold text-[14px] leading-relaxed">
                Got dal-chawal from a senior's mom last week.<br/>I literally teared up.<br/>Cravyo is magic.
              </p>
            </div>
            <div className="bg-[#C87474] text-white rounded-b-[24px] pt-10 pb-4 text-center relative">
              <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-[#C87474] overflow-hidden flex items-center justify-center shadow-sm">
                 <span className="text-[#C87474] font-black text-2xl">A</span>
              </div>
              <h4 className="font-serif font-bold text-[15px]">Ananya R.</h4>
              <span className="text-[11px] font-medium opacity-90">Hosteler • Year 2</span>
            </div>
          </motion.div>

          {/* Card 2 - Sarah S. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[2%] bottom-[0%] w-[310px] flex flex-col rounded-[24px] shadow-sm bg-[#AEC2D6] overflow-visible"
          >
            <div className="h-[250px] relative w-full flex items-end justify-center pb-2">
               <div className="w-40 h-40 rounded-full bg-white/20 mb-4 border-4 border-white flex items-center justify-center">
                 <span className="text-white font-black text-6xl">S</span>
               </div>
            </div>
            <div className="bg-[#C87474] text-white rounded-b-[24px] p-6 relative">
              <p className="font-serif text-[14px] leading-relaxed mb-4 font-bold">
                During exams, home-cooked parathas from a day scholar's mom kept me going. This app gets student life.
              </p>
              <div className="flex justify-between items-end">
                <div></div>
                <div className="text-right">
                  <h4 className="font-serif font-bold text-[15px]">Sarah S.</h4>
                  <span className="text-[12px] font-medium opacity-90">Hosteler • Year 4</span>
                </div>
                <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-1 shadow-md absolute bottom-[-14px] right-6 border border-[#EBE1D7]">
                  {[...Array(5)].map((_, i) => <FaStar key={i} className="text-[#C87474] text-[12px]" />)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 - Rohan K. (Speech bubble points right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="absolute left-[24%] top-[10%] w-[300px] flex gap-4 items-start"
          >
            <div className="bg-[#FCF9F6] p-5 rounded-[24px] shadow-sm border border-[#EBE1D7] relative w-[240px]">
              {/* Tail pointing right */}
              <div className="absolute right-[-8px] top-[20px] w-4 h-4 bg-[#FCF9F6] border-t border-r border-[#EBE1D7] rotate-45 z-0"></div>
              
              <div className="relative z-10">
                <p className="text-[#6B3B32] font-serif font-bold text-[14px] leading-relaxed mb-4 text-center">
                  Mom cooks extra now just so I can share. I've made 3 close friends through Cravyo.
                </p>
                <div className="flex justify-between items-end">
                  <div className="text-center w-full">
                    <h4 className="font-serif font-bold text-[#C87474] text-[12px] leading-tight">Rohan K.</h4>
                    <span className="text-[#C87474] text-[10px]">Day Scholar</span>
                  </div>
                  <div className="bg-[#C87474] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 absolute bottom-2 right-2 shadow-sm">
                    <FaStar className="text-[8px]" /> 4.3
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[80px] h-[80px] rounded-full bg-[#1C2A3A] flex-shrink-0 flex items-center justify-center shadow-md border-4 border-white">
               <span className="text-white font-black text-3xl">R</span>
            </div>
          </motion.div>

          {/* Card 4 - Homesick */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[29%] top-[38%] w-[380px] bg-[#FCF9F6] border border-[#EBE1D7] rounded-[24px] shadow-md p-8 relative"
          >
            {/* Bookmark ribbon top right */}
            <div className="absolute top-0 right-10 w-8 h-[50px] bg-[#C87474] flex flex-col items-center pt-2 shadow-sm">
              <FaStar className="text-white text-[14px]" />
              <div className="absolute bottom-[-8px] left-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[8px] border-l-[#C87474] border-r-[#C87474] border-b-transparent"></div>
            </div>
            
            <p className="text-[#6B3B32] font-serif font-bold text-[18px] text-center leading-relaxed mb-8 px-4 mt-2">
              First week away from home and I was homesick. A warm plate of biryani here felt like a hug from home.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5 pl-4">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="text-[#C87474] text-sm" />)}
              </div>
              <div className="flex -space-x-2 pr-4">
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-[#C3775B]"></div>
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-[#5B73C3]"></div>
                <div className="w-10 h-10 rounded-full border-[3px] border-white bg-[#C35B8C]"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 5 - Arjun R. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[29%] bottom-[5%] flex gap-4 items-end"
          >
            <div className="w-[140px] h-[160px] bg-[#1C2A3A] rounded-[24px] relative flex items-end justify-center pb-4 shadow-sm border-b-4 border-b-[#FCF9F6]">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-2 border-white mb-2">
                <span className="text-white font-black text-3xl">A</span>
              </div>
              <div className="absolute -bottom-10 w-full text-center">
                <h4 className="font-serif font-bold text-[#C87474] text-[13px]">Arjun R.</h4>
                <span className="text-[#C87474] text-[10px]">Hosteler • Year 3</span>
              </div>
            </div>
            <div className="bg-[#FCF9F6] p-5 rounded-[24px] shadow-sm border border-[#EBE1D7] w-[200px] relative mb-8">
              {/* Tail pointing left */}
              <div className="absolute left-[-8px] bottom-[30px] w-4 h-4 bg-[#FCF9F6] border-b border-l border-[#EBE1D7] rotate-45 z-0"></div>
              <span className="text-[#C87474] font-serif text-5xl absolute top-0 right-2 opacity-40">"</span>
              <p className="text-[#6B3B32] font-serif font-bold text-[13px] leading-relaxed mt-2 pr-2 relative z-10">
                "Cravyo saved me from hostel food! Getting maa ke haath ka khana every week is a blessing."
              </p>
            </div>
          </motion.div>

          {/* Card 6 - Priya M. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[54%] top-[10%] flex flex-col items-start gap-4 w-[280px]"
          >
            <div className="bg-[#FCF9F6] p-6 rounded-[24px] shadow-sm border border-[#EBE1D7] w-full relative">
              {/* Tail pointing down-left */}
              <div className="absolute left-[40px] bottom-[-8px] w-4 h-4 bg-[#FCF9F6] border-b border-r border-[#EBE1D7] rotate-45 z-0"></div>
              <span className="text-[#C87474] font-serif text-5xl absolute top-3 left-4 opacity-40">"</span>
              <p className="text-[#6B3B32] font-serif font-bold text-[15px] leading-relaxed text-center ml-4 relative z-10">
                Better than mess food, cheaper than Swiggy, and made with actual love. 10/10.
              </p>
            </div>
            <div className="bg-[#C87474] text-white rounded-full py-2 px-3 flex items-center gap-3 pr-6 shadow-sm w-[180px] ml-4">
              <div className="w-10 h-10 bg-[#3A5B73] rounded-full flex items-center justify-center border-2 border-white">
                 <span className="text-white text-sm font-black">P</span>
              </div>
              <div className="text-left">
                <h4 className="font-serif font-bold text-[13px] leading-tight text-white">Priya M.</h4>
                <span className="text-[10px] opacity-90 text-white">Hosteler • Year 3</span>
              </div>
            </div>
          </motion.div>

          {/* Card 7 - Rahul K. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-[58%] bottom-[5%] flex flex-col items-center w-[220px]"
          >
            <div className="w-24 h-24 rounded-full bg-[#CC8A56] mb-[20px] relative z-10 flex items-center justify-center shadow-md border-[6px] border-[#FCF9F6]">
               <span className="text-white font-black text-3xl">R</span>
            </div>
            <div className="bg-[#FCF9F6] p-6 pt-10 rounded-[24px] shadow-sm border border-[#EBE1D7] text-center w-full relative">
              {/* Tail pointing up */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[-8px] w-4 h-4 bg-[#FCF9F6] border-t border-l border-[#EBE1D7] rotate-45 z-0"></div>
              <p className="text-[#6B3B32] font-serif font-bold text-[15px] leading-relaxed mb-8 relative z-10">
                "I love sharing my mom's cooking. Plus, earning a little pocket money is a nice bonus!"
              </p>
              <div className="absolute bottom-[-10px] right-4 bg-[#C87474] text-white text-[11px] font-bold px-3 py-1 rounded flex items-center justify-center gap-1 shadow-sm">
                <FaStar className="text-[10px]" /> 4.3
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center relative z-10">
                <div className="bg-[#C87474] px-4 py-0.5 rounded-t-lg">
                   <h4 className="font-serif font-bold text-white text-[11px]">Rahul K.</h4>
                </div>
                <div className="bg-[#C87474] px-6 py-0.5 rounded-b-lg">
                   <span className="text-[10px] text-white">Dayscholar</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 8 - Neha T. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute right-[1%] top-[8%] w-[270px] flex flex-col rounded-[24px] shadow-sm bg-[#B7D9D9] overflow-visible border border-[#EBE1D7]"
          >
            <div className="h-[250px] relative w-full flex items-end justify-center pb-4">
               <div className="w-40 h-40 rounded-full bg-white/20 mb-2 border-[5px] border-white flex items-center justify-center">
                 <span className="text-white font-black text-6xl">N</span>
               </div>
            </div>
            <div className="bg-[#FCF9F6] rounded-b-[24px] p-8 text-center relative pb-12">
              <p className="text-[#6B3B32] font-serif font-bold text-[14px] leading-relaxed mb-4">
                I pack an extra tiffin every day. Seeing a hosteler smile when they taste my mom's rajma is priceless.
              </p>
              <h4 className="font-serif font-bold text-[#C87474] text-[14px]">Neha T.</h4>
              <span className="text-[#C87474] text-[11px]">Day Scholar • Home Cook</span>
              <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 w-14 h-14 bg-[#C87474] text-white rounded-full flex items-center justify-center shadow-md border-4 border-[#FCF9F6]">
                 <span className="text-2xl leading-none pt-1">♥</span>
              </div>
            </div>
          </motion.div>

          {/* Card 9 - Sneha T. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute right-[2%] bottom-[8%] w-[260px]"
          >
            <div className="bg-[#C87474] text-white rounded-t-2xl px-6 py-2 w-[70%] text-[12px] font-bold">
              Sneha T. ,Hosteler
            </div>
            <div className="bg-[#FCF9F6] p-6 rounded-2xl rounded-tl-none shadow-sm border border-[#EBE1D7] relative">
              <p className="text-[#6B3B32] font-serif font-bold text-[14px] leading-relaxed text-center mt-2 mb-6">
                "The verification system makes me feel safe. And the food is always authentic and delicious."
              </p>
              <div className="bg-[#C87474] text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1 absolute bottom-[-10px] right-4 shadow-sm">
                <FaStar className="text-[10px]" /> 4.3
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. "READY TO TASTE HOME?" CTA BANNER SECTION */}
      <section className="py-16 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto relative z-10 bg-[#FADBB0] rounded-[40px] mt-8 mb-12">
        <div className="rounded-[40px] shadow-md relative overflow-hidden flex flex-col lg:flex-row items-center justify-end max-w-[1040px] mx-auto bg-gradient-to-b from-[#964746] from-40% to-[#E5D4C0] min-h-[420px]">
          
          {/* Image on the left */}
          <div className="absolute left-[-130px] bottom-[-10px] w-full lg:w-[50%] h-[110%] flex items-end pointer-events-none z-0">
            <img
              src="/image copy 3.png"
              alt="Hand pouring spices on food bowl"
              className="w-full h-full object-contain object-left-bottom drop-shadow-xl"
            />
          </div>

          {/* Text Content on the Right */}
          <div className="relative z-10 w-full lg:w-[60%] lg:mr-24 text-center py-16 px-6 lg:px-10 flex flex-col items-center">
            
            <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-serif font-black mb-4 tracking-wide w-full whitespace-nowrap">
              <span className="bg-gradient-to-r from-[#E5C9A4] from-0% md:from-[52%] to-[#4A1A1A] to-100% md:to-[52%] bg-clip-text text-transparent">
                Ready to Taste Home?
              </span>
            </h2>
            
            <p className="text-[#4A1A1A] font-serif font-bold text-[17px] mb-8 max-w-[460px] leading-[1.6] text-center">
              Join Cravyo today and never miss the taste of ghar ka khana again.<br/>
              Sign up now and get your first meal request free!
            </p>
            
            <div className="flex items-center justify-center gap-6">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#FCF9F6] text-[#4A1A1A] px-7 py-2.5 rounded-lg font-bold text-[15px] shadow-sm transition-all"
                >
                  Get Started →
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border border-[#E5C9A4] text-[#E5C9A4] px-7 py-2.5 rounded-lg font-bold text-[15px] transition-all hover:bg-white/10"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* 6. FINAL FOOTER SECTION (LIGHT CREAM LAYOUT) */}
      <footer className="bg-[#FCF9F6] text-[#6B3B32] py-16 px-6 sm:px-12 lg:px-20 border-t border-[#EBE1D7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left mb-16">
          {/* Brand info */}
          <div className="flex flex-col items-start gap-4">
            <span className="text-2xl font-serif font-black text-[#C87474] tracking-tight">
              Cravyo<span className="text-[#964746]">.</span>
            </span>
            <p className="text-sm font-medium leading-relaxed max-w-xs">
              Taste the love of home, right at your campus. Connecting hostelers with dayscholars for fresh home-cooked food.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-black text-[#C87474] uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-3 text-sm font-semibold">
              <li><Link to="/home" className="hover:text-[#C87474] transition-colors">Home</Link></li>
              <li><a href="#how-it-works" className="hover:text-[#C87474] transition-colors">How It Works</a></li>
              <li><Link to="/register" className="hover:text-[#C87474] transition-colors">Find Meals</Link></li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h4 className="text-sm font-black text-[#C87474] uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-3 text-sm font-semibold">
              <li><a href="#about" className="hover:text-[#C87474] transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-[#C87474] transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-black text-[#C87474] uppercase tracking-widest mb-6">Contact</h4>
            <p className="text-sm font-medium leading-relaxed mb-2">
              Have questions? Reach out to support:
            </p>
            <span className="text-sm font-bold text-[#C87474] hover:text-[#964746] transition-colors cursor-pointer">
              support@cravyo.com
            </span>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="max-w-6xl mx-auto border-t border-[#EBE1D7] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs font-semibold opacity-70">
            © {new Date().getFullYear()} Cravyo — Taste Comfort, Share Love. All rights reserved.
          </p>
          <p className="text-xs font-semibold opacity-70">
            Designed for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
