import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiMail, FiLock, FiShield, FiMapPin, FiPhone, FiCheck, FiLoader, FiKey } from "react-icons/fi";
import { createAdminAccount } from "../../services/firestoreService";
import collegesHierarchy from "../../data/collegesHierarchy.json";
import toast from "react-hot-toast";

const AdminCreateHeadModal = ({ isOpen, onClose, onHeadCreated, currentAdminRole }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("state_head");
  const [assignedState, setAssignedState] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract all states from collegesHierarchy.json
  const statesList = useMemo(() => {
    return Object.keys(collegesHierarchy).sort();
  }, []);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter the administrator's name.");
    if (!email.trim()) return toast.error("Please enter a valid email address.");
    if (!password || password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (role === "state_head" && !assignedState) return toast.error("Please select an assigned State.");

    setIsSubmitting(true);
    try {
      const newAdmin = await createAdminAccount({
        name,
        email,
        password,
        role,
        assignedState: role === "national_head" ? "ALL" : assignedState,
        phone,
      });

      toast.success(`Head account provisioned for ${name}! Credentials created.`);
      if (onHeadCreated) onHeadCreated(newAdmin);

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("state_head");
      setAssignedState("");
      setPhone("");
      onClose();
    } catch (err) {
      console.error("Admin Creation Error:", err);
      toast.error(err.message || "Failed to create head account. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-[#1E1113] border border-[#6B3135] rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8C3F3F] to-[#B0464A] flex items-center justify-center text-xl text-white shadow-lg">
              <FiShield />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
                Provision New Leader
              </h3>
              <p className="text-xs text-white/60">
                Create official credentials for National or State leadership
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Leadership Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("state_head")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === "state_head"
                      ? "bg-[#8C3F3F] border-[#E8AE68] text-white shadow-md"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span>🏛️</span> State Head
                </button>

                {currentAdminRole === "founder" && (
                  <button
                    type="button"
                    onClick={() => {
                      setRole("national_head");
                      setAssignedState("ALL");
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      role === "national_head"
                        ? "bg-[#8C3F3F] border-[#E8AE68] text-white shadow-md"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span>🇮🇳</span> Whole India Head
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh K. Narayanan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tamilnadu.head@craavyo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>
            </div>

            {/* Password with Generator */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="text-[11px] font-bold text-[#E8AE68] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiKey className="w-3 h-3" /> Auto-generate
                </button>
              </div>
              <div className="relative flex items-center">
                <FiLock className="absolute left-3.5 text-white/40" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68] font-mono"
                />
              </div>
            </div>

            {/* Assigned State (if State Head) */}
            {role === "state_head" && (
              <div>
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                  Assigned State
                </label>
                <div className="relative flex items-center">
                  <FiMapPin className="absolute left-3.5 text-white/40" />
                  <select
                    value={assignedState}
                    onChange={(e) => setAssignedState(e.target.value)}
                    className="w-full bg-[#2A1617] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#E8AE68] cursor-pointer"
                  >
                    <option value="">Select Indian State</option>
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Phone (optional) */}
            <div>
              <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-white/40 lowercase">(optional)</span>
              </label>
              <div className="relative flex items-center">
                <FiPhone className="absolute left-3.5 text-white/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E8AE68]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#8C3F3F] to-[#E8AE68] hover:opacity-95 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" /> Provisioning...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" /> Create Head Account
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminCreateHeadModal;
