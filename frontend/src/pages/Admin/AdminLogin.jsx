import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiLock, FiArrowRight, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
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
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        msg = "Account not found or incorrect password. First time setting up? Click 'First time? Initialize Founder' below to claim your account.";
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;
      const profile = await getUserProfile(fbUser.uid);

      if (!profile || !["founder", "national_head", "state_head"].includes(profile.role)) {
        await signOut(auth);
        const err = `Access Denied. Google account (${fbUser.email}) is not registered as an Admin. If you are the Founder, click 'First time? Initialize Founder' below to grant this account Founder privileges.`;
        setErrorMsg(err);
        toast.error(err, { duration: 7000 });
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
        name: profile.name || fbUser.displayName || "Administrator",
        email: profile.email || fbUser.email,
        role: profile.role,
        assignedState: profile.assignedState || "ALL",
        token: token,
      };

      sessionStorage.setItem("adminUser", JSON.stringify(adminSession));
      toast.success(`Welcome to Command Center, ${adminSession.name}!`);
      navigate("/admin");
    } catch (err) {
      console.error("Admin Google Login Error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Google sign-in failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrapWithGoogle = async () => {
    setIsBootstrapping(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      const upgraded = await bootstrapFounderAccount(
        fbUser.uid,
        fbUser.email,
        fbUser.displayName || bootstrapName || "Founder & CEO"
      );

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
      toast.success(`Founder & CEO role initialized for ${upgraded.email}!`);
      setShowBootstrapModal(false);
      navigate("/admin");
    } catch (err) {
      console.error("Google Bootstrap Error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Google bootstrap failed.");
      }
    } finally {
      setIsBootstrapping(false);
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
      let fbUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, bootstrapEmail.trim(), bootstrapPassword);
        fbUser = cred.user;
      } catch (signErr) {
        // If account doesn't exist yet, automatically create it!
        if (signErr.code === "auth/user-not-found" || signErr.code === "auth/invalid-credential") {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, bootstrapEmail.trim(), bootstrapPassword);
            fbUser = newCred.user;
          } catch (createErr) {
            toast.error(createErr.message || "Failed to create new Founder account.");
            setIsBootstrapping(false);
            return;
          }
        } else if (signErr.code === "auth/wrong-password") {
          toast.error("Incorrect password for this existing account. Please verify password.");
          setIsBootstrapping(false);
          return;
        } else {
          toast.error(signErr.message || "Authentication failed.");
          setIsBootstrapping(false);
          return;
        }
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
        <div className="space-y-4">
          {/* Google Sign-in for Admin */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-white hover:bg-white/95 text-gray-900 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign In with Google (Admin)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-white/40 font-bold">Or with Email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

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
        </div>

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
                  Grant top-level master permissions to your account
                </p>
              </div>
            </div>

            {/* 1-Click Google Bootstrap */}
            <button
              type="button"
              onClick={handleBootstrapWithGoogle}
              disabled={isBootstrapping}
              className="w-full mb-3.5 py-3 rounded-xl bg-white hover:bg-white/95 text-gray-900 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Claim Founder Role with Google (1-Click)</span>
            </button>

            <div className="relative flex py-1 items-center mb-3">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-white/40 font-semibold">Or with Email & Password</span>
              <div className="flex-grow border-t border-white/10"></div>
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
                  Email Address
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
                  Password
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
                  className="w-1/3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBootstrapping}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-[#8C3F3F] to-[#E8AE68] font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isBootstrapping ? (
                    <>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" /> Initializing...
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
