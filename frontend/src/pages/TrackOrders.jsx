import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiClock, FiMapPin, FiActivity } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';

// Animation configs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const TrackOrders = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    if (!user || !user.token) {
      navigate('/login');
      return;
    }
    if (user.role !== 'hosteler') {
      navigate('/login');
      return;
    }
    fetchActiveOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdated = (updatedOrder) => {
      toast.success(`"${updatedOrder.dishName}" status updated to: ${updatedOrder.status}`);
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      fetchActiveOrders();
    };

    socket.on('order_status_updated', handleOrderStatusUpdated);

    return () => {
      socket.off('order_status_updated', handleOrderStatusUpdated);
    };
  }, [socket]);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load active orders.");
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined');

  const steps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

  return (
    <div className="bg-[#FFF0DD] min-h-screen font-sans relative overflow-x-hidden text-espresso pb-16 select-none">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-primary/10 shadow-sm rounded-2xl flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/hosteler-dashboard" className="p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all cursor-pointer">
              <FiArrowLeft className="w-5 h-5 stroke-[3]" />
            </Link>
            <h1 className="text-2xl font-serif font-black text-espresso tracking-tight">
              Track Active Orders
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="hidden sm:block flex-col text-left">
              <p className="font-bold text-espresso text-sm leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-primary font-semibold">Hosteler</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          
          <div className="flex justify-between items-center mb-2">
            <div className="text-left">
              <h2 className="text-3xl font-serif font-black text-espresso tracking-tight">Live Tracking Feed</h2>
              <p className="text-espresso-light font-semibold text-sm">Monitor all your concurrent craavings in real-time.</p>
            </div>
            <div className="bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 shadow-sm border border-primary/20">
              <FiActivity className="w-4 h-4 animate-pulse stroke-[3]" /> LIVE UPDATING
            </div>
          </div>

          {loading && activeOrders.length === 0 ? (
            <div className="flex justify-center items-center py-24">
              <FiActivity className="animate-spin text-primary w-10 h-10 stroke-[2.5]" />
            </div>
          ) : activeOrders.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-20 bg-white/80 border border-primary/10 rounded-[2.5rem] shadow-sm max-w-lg mx-auto">
              <FiPackage className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-black text-espresso mb-2">No Active Orders</h3>
              <p className="text-espresso-light font-medium px-6 mb-6">You don't have any meals in progress right now. Head back to the dashboard to order delicious home-cooked meals!</p>
              <Link to="/hosteler-dashboard" className="inline-block bg-primary hover:bg-primary-hover text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-primary/25 transition-all cursor-pointer">
                Back to Campus Feed
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeOrders.map((order) => {
                const currentStep = steps.indexOf(order.status);
                return (
                  <motion.div key={order._id} variants={itemVariants} className="bg-white border border-primary/15 p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgba(60,34,34,0.02)] hover:shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
                    
                    {/* Card Header info */}
                    <div className="text-left">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3.5">
                          {(order.imageUrl || (order.mealId && (order.mealId.image || order.mealId.imageUrl))) && (
                            <img 
                              src={order.imageUrl || order.mealId?.image || order.mealId?.imageUrl} 
                              alt={order.dishName} 
                              className="w-14 h-14 rounded-2xl object-cover border border-primary/15 shrink-0 shadow-xs"
                              onError={(e) => { e.target.src = '/cravyo_hero_thali.png'; }}
                            />
                          )}
                          <div>
                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                              Order #{order._id.substring(order._id.length - 4)}
                            </span>
                            <h3 className="text-2xl font-serif font-black text-espresso leading-tight group-hover:text-primary transition-colors">
                              {order.dishName}
                            </h3>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-primary">₹{order.price}</p>
                      </div>

                      {/* Steps tracker vertical flow */}
                      <div className="ml-2 border-l-2 border-primary/10 space-y-6 relative pb-2 mb-6">
                        {steps.map((step, idx) => {
                          const isActive = currentStep === idx;
                          const isPast = currentStep > idx;
                          if (step === 'Delivered' && !isPast && !isActive) return null; // hide delivered until arrived structurally
                          
                          return (
                            <div key={idx} className="relative pl-6 text-left">
                              <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${isActive ? 'border-secondary bg-white' : isPast ? 'border-primary bg-primary' : 'border-primary/25 bg-white'}`}>
                                {isActive && <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-secondary animate-pulse"></span>}
                              </div>
                              <span className={`text-sm font-bold ${isActive ? 'text-espresso font-black' : isPast ? 'text-espresso-light/65' : 'text-espresso-light/35'}`}>
                                {step}
                              </span>
                              {isActive && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1.5 pl-4 py-2 border-l-2 border-secondary/50 text-xs text-espresso-light font-medium">
                                  {step === 'Pending' ? "Waiting for the cook to accept your request." : `Your order is currently ${step.toLowerCase()}.`}
                                </motion.div>
                              )}
                              {isActive && order.proofImageUrl && step === 'Out for Delivery' && (
                                <div className="mt-3 pl-4 flex flex-col items-start gap-2">
                                  <img src={order.proofImageUrl} alt="Proof" className="w-24 h-24 object-cover rounded-xl border border-primary/10 shadow-sm" />
                                  <span className="text-[10px] font-black text-white bg-primary px-2.5 py-1 rounded-full uppercase tracking-wider">Proof Uploaded!</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadata footer */}
                    <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-espresso-light/80 font-bold uppercase tracking-wider text-left">
                      <span className="flex items-center gap-1.5">
                        <FiMapPin className="text-primary/40 stroke-[2.5]" /> Location: <span className="text-espresso font-extrabold">{order.deliveryLocation || "Awaiting Input"}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="text-primary/40 stroke-[2.5]" /> Target: <span className="text-espresso font-extrabold">{order.neededBy || "ASAP"}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default TrackOrders;
