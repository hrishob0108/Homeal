import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiDollarSign, FiMapPin, FiClock, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const RequestFoodModal = ({ isOpen, onClose, onRequestCreated }) => {
  const [form, setForm] = useState({
    dishName: '',
    description: '',
    price: '',
    neededBy: '',
    deliveryLocation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dishName || !form.price || !form.deliveryLocation || !form.neededBy) {
      return toast.error("Please fill in all required fields.");
    }
    
    if (isNaN(form.price) || Number(form.price) <= 0) {
      return toast.error("Please enter a valid price.");
    }

    try {
      setSubmitting(true);
      const res = await api.post('/food-requests', {
        dishName: form.dishName,
        description: form.description,
        price: Number(form.price),
        deliveryLocation: form.deliveryLocation,
        neededBy: form.neededBy
      });

      if (res.status === 200 || res.status === 201) {
        toast.success(`Requested ${form.dishName} successfully!`);
        onRequestCreated(res.data);
        setForm({
          dishName: '',
          description: '',
          price: '',
          neededBy: '',
          deliveryLocation: ''
        });
        onClose();
      } else {
        toast.error("Failed to post custom request.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[2rem] shadow-[0_24px_60px_rgba(0,0,0,0.15)] border border-white/60 p-8 sm:p-10 relative overflow-hidden font-sans z-10"
          >
            {/* Decorative background blobs */}
            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div>
                <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                  Custom Request
                </span>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
                  Request Custom Food
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {/* Dish Name */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                  What dish do you want? *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paneer Butter Masala & Roti"
                  value={form.dishName}
                  onChange={(e) => setForm({ ...form, dishName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none focus:ring-4 transition-all font-medium text-base shadow-inner"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                  Custom instructions (optional)
                </label>
                <textarea
                  placeholder="e.g. Less spicy, make it enough for 2 people, please add extra butter!"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none focus:ring-4 transition-all font-medium text-base shadow-inner resize-none"
                />
              </div>

              {/* Budget & Time Needed */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                    Your Budget (₹) *
                  </label>
                  <div className="relative flex items-center">
                    <FiDollarSign className="absolute left-4 text-gray-400 font-bold" />
                    <input
                      type="number"
                      placeholder="Price"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none focus:ring-4 transition-all font-bold text-base shadow-inner"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                    Needed By *
                  </label>
                  <div className="relative flex items-center">
                    <FiClock className="absolute left-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. 8:30 PM"
                      value={form.neededBy}
                      onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none focus:ring-4 transition-all font-medium text-base shadow-inner"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                  Delivery Location *
                </label>
                <div className="relative flex items-center">
                  <FiMapPin className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Room 405, Hostel C"
                    value={form.deliveryLocation}
                    onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 focus:outline-none focus:ring-4 transition-all font-medium text-base shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-900 hover:bg-emerald-500 py-4 rounded-xl text-white font-black text-lg shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiActivity className="animate-spin text-white w-5 h-5" />
                      Publishing Request...
                    </>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5 stroke-[3]" />
                      Publish Live Request
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestFoodModal;
