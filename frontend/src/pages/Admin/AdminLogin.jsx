import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiLock, FiArrowRight, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { getUserProfile, bootstrapFounderAccount } from "../../services/firestoreService";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapEmail, setBootstrapEmail] = useState("");
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [bootstrapName, setBootstrapName] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      const profile = await getUserProfile(fbUser.uid);

      if (!profile || !["founder", "national_head", "state_head"].includes(profile.role)) {
        await signOut(auth);
        const err = "Access Denied. Your account is not registered with administrative leadership privileges.";
        setErrorMsg(err);
        toast.error(err, { duration: 6000 });
        setIsLoading(false);
        return;
      }

      if (profile.status === "suspended") {
        await signOut(auth);
        const err = "Your administrative account has been deactivated. Please contact the Founder.";
        setErrorMsg(err);
        toast.error(err);
        setIsLoading(false);
        return;
      }

      const token = await fbUser.getIdToken();
      const adminSession = {
        _id: fbUser.uid,
        uid: fbUser.uid,
        name: profile.name || "Administrator",
        email: profile.email || fbUser.email,
        role: profile.role,
        assignedState: profile.assignedState || "ALL",
        token: token,
      };

      sessionStorage.setItem("adminUser", JSON.stringify(adminSession));
      toast.success(`Welcome to Command Center, ${adminSession.name}!`);
      navigate("/admin");
    } catch (err) {
      console.error("Admin Login Error:", err);
      let msg = "Invalid credentials. Please verify your official email and password.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid admin email or password.";
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrapFounder = async (e) => {
    e.preventDefault();
    if (!bootstrapEmail || !bootstrapPassword) {
      toast.error("Enter email and password to bootstrap.");
      return;
    }

    setIsBootstrapping(true);
    try {
      // First sign in or sign up
      let fbUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, bootstrapEmail.trim(), bootstrapPassword);
        fbUser = cred.user;
      } catch (signErr) {
        toast.error("Could not verify account with these credentials. Ensure the user exists in Firebase Auth.");
        setIsBootstrapping(false);
        return;
      }

      // Upgrade to founder
      const upgraded = await bootstrapFounderAccount(fbUser.uid, bootstrapEmail, bootstrapName || "Founder & CEO");
      const token = await fbUser.getIdToken();
      const adminSession = {
        _id: fbUser.uid,
        uid: fbUser.uid,
        name: upgraded.name,
        email: upgraded.email,
        role: "founder",
        assignedState: "ALL",
        token: token,
      };

      sessionStorage.setItem("adminUser", JSON.stringify(adminSession));
      toast.success("Founder & CEO role initialized successfully!");
      setShowBootstrapModal(false);
      navigate("/admin");
    } catch (err) {
      console.error("Bootstrap Error:", err);
      toast.error(err.message || "Failed to bootstrap founder account.");
    } finally {
      setIsBootstrapping(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#140A0C] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#8C3F3F]/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#E8AE68]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#1C0E11]/90 backdrop-blur-xl border border-[#522125] rounded-[32px] p-8 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] text-white relative z-10"
      >
        {/* Logo / Badge */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8C3F3F] to-[#E8AE68] p-0.5 mx-auto mb-4 shadow-lg shadow-[#8C3F3F]/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#1C0E11] rounded-[14px] flex items-center justify-center text-2xl text-[#E8AE68]">
              <FiShield />
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#E8AE68] px-3 py-1 rounded-full bg-[#E8AE68]/10 border border-[#E8AE68]/20">
            Craavyo Command Center
          </span>
          <h2 className="text-3xl font-serif font-bold text-white mt-3 mb-1">
            Executive Portal
          </h2>
          <p className="text-xs text-white/50 font-medium">
            Restricted to Founder, National & State Leadership
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5"
          >
            <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 text-left">
              Official Email
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-4 text-white/40 text-lg" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@craavyo.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E8AE68] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-2 text-left">
              Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-4 text-white/40 text-lg" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E8AE68] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-[#8C3F3F] via-[#A84545] to-[#E8AE68] hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-[#8C3F3F]/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <span>Access Command Center</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer controls */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <Link
            to="/home"
            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
          >
            ← Back to Student App
          </Link>

          <button
            onClick={() => setShowBootstrapModal(true)}
            className="hover:text-[#E8AE68] transition-colors underline cursor-pointer"
          >
            First time? Initialize Founder
          </button>
        </div>
      </motion.div>

      {/* Founder Bootstrap Modal */}
      {showBootstrapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1E1113] border border-[#6B3135] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">
                  Initialize Founder & CEO
                </h3>
                <p className="text-xs text-white/60">
                  Grant top-level master permissions to your registered account
                </p>
              </div>
            </div>

            <form onSubmit={handleBootstrapFounder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={bootstrapName}
                  onChange={(e) => setBootstrapName(e.target.value)}
                  placeholder="e.g. Hrishob P"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Registered Account Email
                </label>
                <input
                  type="email"
                  value={bootstrapEmail}
                  onChange={(e) => setBootstrapEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Account Password
                </label>
                <input
                  type="password"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBootstrapModal(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBootstrapping}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3F3F] to-[#E8AE68] font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {isBootstrapping ? (
                    <>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-3.5 h-3.5" /> Claim Founder Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
