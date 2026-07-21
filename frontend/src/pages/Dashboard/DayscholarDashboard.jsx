import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheckCircle, FiStar, FiMapPin, FiClock, FiTruck, FiZap, FiMenu, FiSmile, FiLogOut, FiEdit2, FiTrash2, FiX
} from 'react-icons/fi';
import { FaRupeeSign, FaFire } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

// Animation configs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const DayscholarDashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const wid = useRef();
  const [localUploads, setLocalUploads] = useState({});
  const activeOrderIdRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [myMenu, setMyMenu] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  
  useEffect(() => {
    if(!user || !user.token) {
      navigate('/login');
      return;
    }
    if (user.role !== 'dayscholar') {
      if (user.role === 'hosteler') {
        navigate('/hosteler-dashboard');
      } else {
        navigate('/login');
      }
      return;
    }
    fetchDashboardData();

    // Cloudinary setup
    let myWidget = window.cloudinary.createUploadWidget(
      { cloudName: "dfseckyjx", uploadPreset: "qbvu3y5j" },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const targetId = activeOrderIdRef.current;
          if (targetId) {
            setLocalUploads(prev => ({
              ...prev,
              [targetId]: result.info.secure_url
            }));
            toast.success("Delivery Proof Uploaded!");
          }
        }
      }
    );
    wid.current = myWidget;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrderRequest = (newOrder) => {
      toast.success(`New order request: ${newOrder.dishName}!`);
      setNotifications(prev => [
        { id: Date.now(), text: `New order request for "${newOrder.dishName}" from ${newOrder.buyerName}!` },
        ...prev
      ]);
      fetchDashboardData();
    };

    const handleOrderStatusUpdated = (updatedOrder) => {
      fetchDashboardData();
    };

    const handleNewFoodRequest = (newRequest) => {
      toast.success(`New custom food request: ${newRequest.dishName}! 📣`);
      setCustomRequests(prev => [newRequest, ...prev]);
    };

    const handleFoodRequestCancelled = ({ id }) => {
      setCustomRequests(prev => prev.filter(r => r._id !== id));
    };

    const handleFoodRequestAccepted = ({ id }) => {
      setCustomRequests(prev => prev.filter(r => r._id !== id));
    };

    const handleNewReviewReceived = (newReview) => {
      toast.success("You received a new review! ⭐");
      setNotifications(prev => [
        { id: Date.now(), text: `New ${newReview.rating}★ review received from ${newReview.buyerName || 'a Hosteler'}!` },
        ...prev
      ]);
      fetchDashboardData();
    };

    socket.on('new_order_request', handleNewOrderRequest);
    socket.on('order_status_updated', handleOrderStatusUpdated);
    socket.on('new_food_request', handleNewFoodRequest);
    socket.on('food_request_cancelled', handleFoodRequestCancelled);
    socket.on('food_request_accepted', handleFoodRequestAccepted);
    socket.on('new_review_received', handleNewReviewReceived);

    return () => {
      socket.off('new_order_request', handleNewOrderRequest);
      socket.off('order_status_updated', handleOrderStatusUpdated);
      socket.off('new_food_request', handleNewFoodRequest);
      socket.off('food_request_cancelled', handleFoodRequestCancelled);
      socket.off('food_request_accepted', handleFoodRequestAccepted);
      socket.off('new_review_received', handleNewReviewReceived);
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders requested from this seller
      const resOrders = await api.get('/orders/requests');
      setRequests(resOrders.data);

      // 2. Fetch all meals and filter by my id locally
      const resMeals = await api.get('/meals');
      setMyMenu(resMeals.data.filter(m => m.createdBy === user._id));

      // 3. Fetch pending custom food requests
      const resPendingRequests = await api.get('/food-requests/pending');
      setCustomRequests(resPendingRequests.data);

      // 4. Fetch rating statistics
      const statsRes = await api.get(`/reviews/seller/${user._id}/stats`);
      setRatingStats(statsRes.data);

      // 5. Fetch reviews
      const reviewsRes = await api.get(`/reviews/user/${user._id}`);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await api.put(`/food-requests/${requestId}/accept`);
      if (res.status === 200) {
        toast.success("Request accepted! Start cooking.");
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      const localUrl = localUploads[orderId];
      if(newStatus === 'Delivered' && localUrl) payload.proofImageUrl = localUrl;

      const res = await api.put(`/orders/${orderId}/status`, payload);

      if(res.status === 200) {
        toast.success(`Order marked as ${newStatus}`);
        fetchDashboardData(); // refresh list
        if(newStatus === 'Delivered') {
          setLocalUploads(prev => {
            const copy = { ...prev };
            delete copy[orderId];
            return copy;
          });
        }
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadProof = async (orderId) => {
    try {
      const localUrl = localUploads[orderId];
      if (!localUrl) {
        toast.error("No proof image uploaded yet.");
        return;
      }
      const payload = { proofImageUrl: localUrl };
      const res = await api.put(`/orders/${orderId}/status`, payload);

      if(res.status === 200) {
        toast.success("Proof submitted to Hosteler!");
        setLocalUploads(prev => {
          const copy = { ...prev };
          delete copy[orderId];
          return copy;
        });
        fetchDashboardData();
      } else {
        toast.error("Failed to submit proof");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // derived data
  const newRequests = requests.filter(r => r.status === 'Pending');
  const activeDeliveries = requests.filter(r => ['Accepted', 'Preparing', 'Out for Delivery'].includes(r.status));
  const completedCount = requests.filter(r => r.status === 'Delivered').length;
  const earnings = requests.filter(r => r.status === 'Delivered').reduce((acc, curr) => acc + curr.price, 0);

  const stats = [
    { title: 'Completed Orders', value: completedCount, icon: <FiCheckCircle className="text-green-500" />, color: 'green' },
    { title: 'Rating', value: ratingStats.totalReviews > 0 ? `${ratingStats.averageRating.toFixed(1)} (${ratingStats.totalReviews})` : 'New Cook', icon: <FiStar className="text-yellow-500" />, color: 'yellow' },
    { title: 'Earnings', value: `₹${earnings}`, icon: <FaRupeeSign className="text-emerald-500" />, color: 'emerald' },
    { title: 'Active Orders', value: activeDeliveries.length, icon: <FaFire className="text-secondary" />, color: 'secondary' },
  ];

  return (
    <div className="bg-cream bg-dot-pattern min-h-screen font-sans relative overflow-x-hidden text-espresso pb-12">
      {/* Dynamic Floating Visuals */}
      <span className="fixed top-24 right-[5%] text-secondary/10 text-5xl animate-float pointer-events-none select-none">✿</span>
      <span className="fixed bottom-24 left-[5%] text-primary/15 text-4xl animate-float pointer-events-none select-none" style={{ animationDelay: '2s' }}>🍃</span>
      <span className="fixed top-1/2 left-[8%] text-secondary/10 text-3xl animate-float pointer-events-none select-none" style={{ animationDelay: '1.5s' }}>✿</span>

      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-secondary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Header user={user} navigate={navigate} notifications={notifications} setNotifications={setNotifications} isNotifOpen={isNotifOpen} setIsNotifOpen={setIsNotifOpen} />

      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <WelcomeBanner user={user} />
          <StatsGrid stats={stats} />
          
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <NewFoodRequests requests={newRequests} onUpdateStatus={handleUpdateStatus} />
              <CustomFoodRequestsFeed requests={customRequests} onAccept={handleAcceptRequest} />
              <ActiveDeliveries deliveries={activeDeliveries} wid={wid} localUploads={localUploads} onUpdateStatus={handleUpdateStatus} onUploadProof={handleUploadProof} />
            </div>
            <div className="space-y-8">
              <QuickActions />
              <TodaysMenu menu={myMenu} user={user} fetchDashboardData={fetchDashboardData} />
              <RecentReviews reviews={reviews} />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Sub Components
const Header = ({ user, navigate, notifications, setNotifications, isNotifOpen, setIsNotifOpen }) => {
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-12 py-4"
    >
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-secondary/15 shadow-sm rounded-2xl flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-serif font-black text-espresso tracking-tight flex items-center gap-2">
          🍱 Cravyo <span className="hidden sm:inline-block text-espresso/45 font-medium text-lg ml-2 border-l border-secondary/35 pl-4">Dayscholar Hub</span>
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-6">
          
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 hover:text-secondary relative flex items-center justify-center border border-gray-100 cursor-pointer"
            >
              <FiBell className="w-5 h-5"/>
              {notifications && notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full border border-white animate-pulse"></span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                  className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-secondary/15 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-secondary/10 mb-2">
                    <span className="font-black text-sm text-espresso">Notifications</span>
                    {notifications && notifications.length > 0 && (
                      <button onClick={() => setNotifications([])} className="text-[10px] font-black text-secondary hover:text-secondary-hover bg-secondary/10 px-2 py-1 rounded cursor-pointer">Clear All</button>
                    )}
                  </div>
                  <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {!notifications || notifications.length === 0 ? (
                      <li className="text-center py-6 text-xs text-espresso-light/60 font-semibold">No new notifications.</li>
                    ) : (
                      notifications.map(n => (
                        <li key={n.id} className="text-xs font-semibold text-espresso-light p-2.5 bg-cream/40 border border-secondary/5 rounded-lg text-left leading-relaxed">
                          {n.text}
                        </li>
                      ))
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
                {user?.name?.[0] || 'D'}
             </div>
             <div className="hidden sm:block flex-col text-left">
                <p className="font-bold text-espresso text-sm leading-tight">{user?.name || 'Dayscholar'}</p>
                <p className="text-xs text-secondary font-semibold">Dayscholar</p>
             </div>
          </div>
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
            <FiLogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

const WelcomeBanner = ({ user }) => (
  <motion.div variants={itemVariants} className="mb-10 text-left">
    <h2 className="text-4xl lg:text-5xl font-serif font-black text-espresso tracking-tight">
      Welcome back, <span className="text-secondary">{user?.name?.split(' ')[0]}! 👋</span>
    </h2>
    <p className="text-espresso-light text-lg font-medium mt-2">Check out the latest incoming food requests below.</p>
  </motion.div>
);

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
    {stats.map((stat, index) => {
      const isBrandColor = stat.color === 'secondary';
      const bgClass = isBrandColor ? 'bg-secondary/10' : `bg-${stat.color}-50`;
      const textClass = isBrandColor ? 'text-secondary' : `text-${stat.color}-500`;

      return (
        <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} className="bg-white/80 backdrop-blur-md border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgba(60,34,34,0.04)] hover:shadow-xl transition-all flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${bgClass} shadow-inner`}>
            {React.cloneElement(stat.icon, { className: `w-7 h-7 ${textClass}` })}
          </div>
          <div>
            <p className="text-espresso-light font-semibold text-sm mb-1">{stat.title}</p>
            <p className="text-3xl font-black text-espresso">{stat.value}</p>
          </div>
        </motion.div>
      );
    })}
  </div>
);

const NewFoodRequests = ({ requests, onUpdateStatus }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(60,34,34,0.04)] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-serif font-black text-espresso flex items-center gap-3">
        <span className="bg-secondary/15 text-secondary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-secondary/20">NEW</span>
        Live Requests
      </h3>
    </div>
    <div className="space-y-4">
      {requests.length === 0 ? <p className="text-espresso-light/60 font-medium text-left">No new requests right now. Hang tight!</p> :
      requests.map((req) => (
        <motion.div key={req._id} whileHover={{ scale: 1.01 }} className="border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white hover:border-secondary transition-colors shadow-sm group text-left">
          <div className="flex-1">
            <p className="font-black text-xl text-espresso mb-2">{req.dishName}</p>
            <div className="space-y-1.5">
              <p className="text-sm text-espresso-light font-medium flex items-center gap-2">
                <FiMapPin className="text-espresso-light/40 group-hover:text-secondary" /> By <span className="font-bold">{req.buyerName}</span> @ {req.deliveryLocation}
              </p>
              <p className="text-sm text-espresso-light font-medium flex items-center gap-2">
                <FiClock className="text-espresso-light/40 group-hover:text-secondary" /> Needed by <span className="font-bold">{req.neededBy}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xl font-black text-primary bg-primary/10 px-4 py-2 rounded-xl ring-1 ring-primary/20 mr-2">₹{req.price}</span>
            <motion.button onClick={() => onUpdateStatus(req._id, 'Accepted')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial px-5 py-2.5 font-black text-white bg-gradient-to-r from-secondary to-secondary-hover rounded-xl shadow-lg shadow-secondary/20 cursor-pointer">Accept</motion.button>
            <motion.button onClick={() => onUpdateStatus(req._id, 'Declined')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial px-5 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl cursor-pointer">Decline</motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const ActiveDeliveries = ({ deliveries, wid, localUploads, onUpdateStatus, onUploadProof }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(60,34,34,0.04)] border border-white/50">
    <h3 className="text-2xl font-serif font-black text-espresso flex items-center gap-3 mb-6">
      <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><FiTruck /></div> Active Deliveries
    </h3>
    <div className="space-y-4 text-left">
      {deliveries.length === 0 ? <p className="text-espresso-light/60 font-medium">You have no active deliveries.</p> :
      deliveries.map((delivery) => (
        <div key={delivery._id} className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 w-full relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span></span>
              <p className="font-black text-xl text-espresso">{delivery.dishName}</p>
            </div>
            <p className="text-sm font-medium text-espresso-light mb-1">Delivering to <span className="font-bold text-espresso">{delivery.buyerName}</span> @ {delivery.deliveryLocation}</p>
            <p className="font-black text-primary text-lg">₹{delivery.price}</p>

            {/* Cloudinary Upload & Delivery Flow */}
            <div className="mt-6 flex flex-col items-start gap-4">
               {['Accepted', 'Preparing'].includes(delivery.status) && (
                   <motion.button onClick={() => onUpdateStatus(delivery._id, 'Out for Delivery')} whileHover={{scale:1.02}} className="bg-secondary hover:bg-secondary-hover text-white font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md shadow-secondary/15 transition-all">Mark Out For Delivery 🚀</motion.button>
               )}

              {delivery.status === 'Out for Delivery' && !delivery.proofImageUrl && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group w-full sm:w-auto overflow-hidden whitespace-nowrap cursor-pointer"
                    onClick={() => {
                      activeOrderIdRef.current = delivery._id;
                      wid.current.open();
                    }}
                  >
                    <FiZap className="text-indigo-400 group-hover:text-amber-400 transition-colors" /> 1. Upload Delivery Proof
                  </motion.button>
                  <AnimatePresence>
                    {localUploads[delivery._id] && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden rounded-xl border-2 border-green-200 shadow-lg relative mt-3 w-full sm:w-64 max-w-full">
                        <img src={localUploads[delivery._id]} alt="Proof" className="w-full h-40 object-cover" />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">Uploaded Locally</div>
                        <button onClick={() => onUploadProof(delivery._id)} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 shadow-md cursor-pointer">
                           2. Submit Photo to Hosteler
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {delivery.status === 'Out for Delivery' && delivery.proofImageUrl && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-gray-200 p-2 shadow-sm bg-white mt-2 w-full sm:w-64 max-w-full">
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide px-2 pt-1 flex justify-between items-center">Proof Delivered <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded">✅</span></p>
                      <img src={delivery.proofImageUrl} alt="Sent Proof" className="w-full h-40 object-cover rounded-lg mb-3" />
                      <button onClick={() => onUpdateStatus(delivery._id, 'Delivered')} className="bg-gradient-to-r from-green-500 to-emerald-600 w-full text-white font-black py-3 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">
                          3. Finish Order & Mark Complete 🏁
                      </button>
                  </motion.div>
              )}
            </div>
          </div>

          <div className="text-left lg:text-right w-full lg:w-auto bg-white p-4 lg:p-0 rounded-xl lg:bg-transparent border lg:border-none border-gray-100 mt-4 lg:mt-0">
            <span className="inline-block px-3 py-1 font-black text-xs uppercase tracking-widest rounded-lg text-amber-600 bg-amber-100 mb-4 ring-1 ring-amber-200">
              {delivery.status}
            </span><br/>
            {delivery.status === 'Out for Delivery' && !delivery.proofImageUrl && <p className="text-xs font-semibold text-gray-400 mt-2 lg:text-right">*Submit proof to finish</p>}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const QuickActions = () => (
    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><FiZap /></div> Quick Actions
      </h3>
      <div className="space-y-3">
        <motion.button whileHover={{ scale: 1.02 }} className="w-full text-left p-4 font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all">
          📈 View Analytics & Earnings
        </motion.button>
      </div>
    </motion.div>
  );

const TodaysMenu = ({ menu, user, fetchDashboardData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', price: '', tag: 'New', isVeg: true });
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', isVeg: true });

  const handlePublish = async (e) => {
     e.preventDefault();
     if(!form.title || !form.price) return toast.error("Title and Price are required.");
     
     try {
       const res = await api.post('/meals', form);
       if(res.status === 200 || res.status === 201) {
          toast.success("Dish Published seamlessly!");
          setIsAdding(false);
          setForm({ title: '', price: '', tag: 'New', isVeg: true });
          fetchDashboardData();
       } else {
          toast.error("Failed to post dish.");
       }
     } catch (err) {
        toast.error("Network error. Is the server running?");
     }
  };

  const handleUpdateItem = async (e, id) => {
      e.preventDefault();
      try {
        const res = await api.put(`/meals/${id}`, editForm);
        if(res.status === 200) {
           toast.success("Meal updated successfully!");
           setEditingId(null);
           fetchDashboardData();
        } else {
           toast.error("Failed to update meal.");
        }
      } catch (err) {
         toast.error("Network error updating meal.");
      }
  };

  const handleDeleteItem = async (id) => {
     if(!window.confirm("Are you sure you want to delete this dish?")) return;
     try {
       const res = await api.delete(`/meals/${id}`);
       if(res.status === 200) {
          toast.success("Meal deleted from menu.");
          fetchDashboardData();
       } else {
          toast.error("Failed to delete meal.");
       }
     } catch (err) {
        toast.error("Network error deleting meal.");
     }
  };

  return (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600"><FiMenu /></div> My Menu
      </h3>
      <span className="text-xs font-bold bg-emerald-100 px-2 py-1 rounded-md text-emerald-600">{menu.length} Items</span>
    </div>
    {menu.length === 0 ? <p className="text-gray-400">You haven't added any meals yet.</p> : (
        <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {menu.map((item) => (
            <motion.li key={item._id} className="relative p-0 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group overflow-hidden">
               {editingId === item._id ? (
                  <form onSubmit={e => handleUpdateItem(e, item._id)} className="flex flex-col gap-2 p-3 bg-indigo-50/50">
                     <div className="flex items-center gap-2">
                        <input type="text" className="w-full px-3 py-1.5 text-sm font-bold border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} autoFocus />
                        <input type="number" className="w-20 px-3 py-1.5 text-sm font-black text-emerald-600 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                        <button type="submit" className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 shadow-sm"><FiCheckCircle /></button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors"><FiX /></button>
                     </div>
                     <div className="flex gap-4 items-center pl-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                           <input type="radio" checked={editForm.isVeg === true} onChange={() => setEditForm({...editForm, isVeg: true})} className="text-emerald-500 focus:ring-emerald-500" /> Veg 🟢
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                           <input type="radio" checked={editForm.isVeg === false} onChange={() => setEditForm({...editForm, isVeg: false})} className="text-red-500 focus:ring-red-500" /> Non-Veg 🔴
                        </label>
                     </div>
                  </form>
               ) : (
                  <div className="flex justify-between items-center p-4">
                     <span className="font-bold text-gray-800 flex items-center gap-1.5">
                       <span>{item.isVeg !== false ? '🟢' : '🔴'}</span>
                       {item.title}
                     </span>
                     <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-24 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                          <button onClick={() => { setEditingId(item._id); setEditForm({ title: item.title, price: item.price, isVeg: item.isVeg !== false }); }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-gray-200 mx-1"></div>
                          <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><FiTrash2 className="w-4 h-4" /></button>
                       </div>
                       <span className="font-black text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1 rounded-lg z-10">₹{item.price}</span>
                     </div>
                  </div>
               )}
            </motion.li>
        ))}
        </ul>
    )}
    
    <AnimatePresence>
       {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handlePublish}
            className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-3 overflow-hidden"
          >
             <input type="text" placeholder="Dish Name (e.g. Rajma Chawal)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} autoFocus />
             <div className="flex gap-2">
                <input type="number" placeholder="Price (₹)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white text-sm" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}>
                   <option value="New">New</option>
                   <option value="Bestseller">Bestseller</option>
                   <option value="Spicy">Spicy</option>
                   <option value="Sweet">Sweet</option>
                </select>
             </div>
             <div className="flex gap-4 items-center px-1">
                <span className="text-xs font-bold text-gray-500">Type:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                   <input type="radio" checked={form.isVeg === true} onChange={() => setForm({...form, isVeg: true})} className="text-emerald-500 focus:ring-emerald-500" /> Veg 🟢
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-600">
                   <input type="radio" checked={form.isVeg === false} onChange={() => setForm({...form, isVeg: false})} className="text-red-500 focus:ring-red-500" /> Non-Veg 🔴
                </label>
             </div>
             <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-secondary hover:bg-secondary-hover text-white py-2 rounded-lg shadow-md font-bold text-sm cursor-pointer shadow-secondary/10">Publish</button>
             </div>
          </motion.form>
       )}
    </AnimatePresence>

    {!isAdding && (
      <button onClick={() => setIsAdding(true)} className="w-full mt-4 text-sm font-bold text-secondary hover:text-secondary-hover transition-colors flex justify-center items-center gap-2 border border-secondary/20 py-3 rounded-xl border-dashed cursor-pointer">
        + Publish New Dish
      </button>
    )}
  </motion.div>
  );
};

const RecentReviews = ({ reviews }) => (
    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 relative overflow-hidden text-left">
        <h3 className="text-xl font-serif font-black flex items-center gap-3 mb-6 text-espresso">
          <div className="p-2 bg-primary/10 rounded-lg text-primary"><FiSmile /></div> Community Love
        </h3>
        {reviews.length === 0 ? (
          <p className="text-espresso-light/60 font-medium text-sm">No reviews yet. Keep cooking up amazing meals!</p>
        ) : (
          <ul className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.slice(0, 5).map(review => (
              <li key={review._id} className="pb-3 border-b border-gray-100 last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-espresso-light/50">{review.reviewer?.name || 'Anonymous'}</span>
                  <span className="flex items-center text-secondary text-xs font-bold bg-secondary/10 px-2 py-0.5 rounded border border-secondary/10">
                    ★ {review.rating}
                  </span>
                </div>
                <p className="text-espresso-light text-sm font-semibold italic">"{review.comment}"</p>
              </li>
            ))}
          </ul>
        )}
    </motion.div>
);

const CustomFoodRequestsFeed = ({ requests, onAccept }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(60,34,34,0.04)] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-serif font-black text-espresso flex items-center gap-3">
        <span className="bg-secondary/15 text-secondary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-secondary/20">FEED</span>
        Custom Requests from Hostelers
      </h3>
    </div>
    <div className="space-y-4">
      {requests.length === 0 ? (
        <p className="text-espresso-light/60 font-medium text-left">No custom food requests from hostelers right now. Check back soon!</p>
      ) : (
        requests.map((req) => (
          <motion.div key={req._id} whileHover={{ scale: 1.01 }} className="border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white hover:border-secondary transition-colors shadow-sm group text-left">
            <div className="flex-1">
              <p className="font-black text-xl text-espresso mb-1">{req.dishName}</p>
              {req.description && <p className="text-sm text-espresso-light font-medium italic mb-2">"{req.description}"</p>}
              <div className="space-y-1">
                <p className="text-sm text-espresso-light font-medium flex items-center gap-2">
                  <FiMapPin className="text-espresso-light/40 group-hover:text-secondary" /> By <span className="font-bold">{req.buyerName}</span> @ {req.deliveryLocation}
                </p>
                <p className="text-sm text-espresso-light font-medium flex items-center gap-2">
                  <FiClock className="text-espresso-light/40 group-hover:text-secondary" /> Needed by <span className="font-bold">{req.neededBy}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xl font-black text-primary bg-primary/10 px-4 py-2 rounded-xl ring-1 ring-primary/20 mr-2">₹{req.price}</span>
              <motion.button 
                onClick={() => onAccept(req._id)} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                className="px-5 py-2.5 font-black text-white bg-gradient-to-r from-secondary to-secondary-hover rounded-xl shadow-lg hover:shadow-secondary/20 cursor-pointer"
              >
                Accept &amp; Cook 🍳
              </motion.button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </motion.div>
);

export default DayscholarDashboard;
