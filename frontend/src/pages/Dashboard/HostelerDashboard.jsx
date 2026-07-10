import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiSearch, FiClock, FiPackage, FiStar, FiLogOut, FiTrendingUp, FiMapPin, FiArrowRight, FiX, FiBell } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import RequestFoodModal from '../../components/RequestFoodModal';
import ReviewModal from '../../components/ReviewModal';

// Animation configs
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const HostelerDashboard = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [meals, setMeals] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [cookStats, setCookStats] = useState({});
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('currentUser'));

  useEffect(() => {
    if(!user || !user.token) {
      navigate('/login');
      return;
    }
    if (user.role !== 'hosteler') {
      if (user.role === 'dayscholar') {
        navigate('/dayscholar-dashboard');
      } else {
        navigate('/login');
      }
      return;
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdated = (updatedOrder) => {
      toast.success(`Order status updated to: ${updatedOrder.status}`);
      setNotifications(prev => [
        { id: Date.now(), text: `Order for "${updatedOrder.dishName}" updated to "${updatedOrder.status}"` },
        ...prev
      ]);
      fetchDashboardData();
    };

    const handleNewMealPosted = (newMeal) => {
      setMeals(prev => {
        if (prev.some(m => m._id === newMeal._id)) return prev;
        return [newMeal, ...prev];
      });
      setNotifications(prev => [
        { id: Date.now(), text: `🍳 ${newMeal.cookName} posted a new dish: "${newMeal.title}"!` },
        ...prev
      ]);
    };

    const handleMealUpdated = (updatedMeal) => {
      setMeals(prev => prev.map(m => m._id === updatedMeal._id ? updatedMeal : m));
    };

    const handleMealDeleted = ({ id }) => {
      setMeals(prev => prev.filter(m => m._id !== id));
    };

    socket.on('order_status_updated', handleOrderStatusUpdated);
    socket.on('new_meal_posted', handleNewMealPosted);
    socket.on('meal_updated', handleMealUpdated);
    socket.on('meal_deleted', handleMealDeleted);

    return () => {
      socket.off('order_status_updated', handleOrderStatusUpdated);
      socket.off('new_meal_posted', handleNewMealPosted);
      socket.off('meal_updated', handleMealUpdated);
      socket.off('meal_deleted', handleMealDeleted);
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      // Fetch live feed
      const resMeals = await api.get('/meals');
      setMeals(resMeals.data);

      // Fetch personal orders
      const resOrders = await api.get('/orders/my-orders');
      setMyOrders(resOrders.data);

      // Fetch custom requests
      const resRequests = await api.get('/food-requests/my-requests');
      setMyRequests(resRequests.data);

      // Fetch personal reviews
      const resReviews = await api.get('/reviews/my-reviews');
      setMyReviews(resReviews.data);

      // Fetch unique cooks statistics
      const cookIds = [...new Set(resMeals.data.map(m => m.createdBy))];
      const statsMap = {};
      await Promise.all(
        cookIds.map(async (id) => {
          try {
            const statsRes = await api.get(`/reviews/seller/${id}/stats`);
            statsMap[id] = statsRes.data;
          } catch (err) {
            console.error(err);
          }
        })
      );
      setCookStats(statsMap);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch dashboard data");
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await api.delete(`/food-requests/${requestId}`);
      toast.success("Request cancelled successfully.");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel request.");
    }
  };

  const handleOrderMeal = async (meal) => {
    try {
      const payload = {
        sellerId: meal.createdBy, // We set this in the Meal schema
        mealId: meal._id,
        dishName: meal.title,
        price: meal.price,
        deliveryLocation: "Awaiting Input...", // In v2, prompt user for room #
        neededBy: "Asap" 
      };

      const res = await api.post('/orders', payload);
      if(res.status === 200 || res.status === 201) {
        toast.success(`Successfully requested ${meal.title}!`);
        fetchDashboardData();
      } else {
        toast.error("Failed to place order.");
      }
    } catch (err) {
      toast.error("Network error placing order.");
    }
  };

  // derived data
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          meal.cookName.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedTag === "Veg Only") return matchesSearch && meal.isVeg;
    if (selectedTag === "Non-Veg Only") return matchesSearch && meal.isVeg === false;
    if (selectedTag === "Bestseller") return matchesSearch && meal.tag === "Bestseller";
    if (selectedTag === "Spicy") return matchesSearch && meal.tag === "Spicy";
    return matchesSearch;
  });

  const activeOrder = myOrders.find(o => o.status !== 'Delivered' && o.status !== 'Declined');
  const activeOrdersCount = myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined').length;
  const pastOrders = myOrders.filter(o => o.status === 'Delivered' || o.status === 'Declined');
  const pendingRequests = myRequests.filter(r => r.status === 'Pending');

  return (
    <div className="bg-cream bg-dot-pattern min-h-screen font-sans relative overflow-x-hidden text-espresso pb-12">
      {/* Dynamic Floating Visuals */}
      <span className="fixed top-24 left-[5%] text-primary/10 text-5xl animate-float pointer-events-none select-none">✿</span>
      <span className="fixed bottom-24 right-[5%] text-secondary/15 text-4xl animate-float pointer-events-none select-none" style={{ animationDelay: '2s' }}>🍃</span>
      <span className="fixed top-1/2 right-[8%] text-primary/10 text-3xl animate-float pointer-events-none select-none" style={{ animationDelay: '1.5s' }}>✿</span>

      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Header user={user} navigate={navigate} notifications={notifications} setNotifications={setNotifications} isNotifOpen={isNotifOpen} setIsNotifOpen={setIsNotifOpen} />

      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <WelcomeBanner user={user} onRequestCustom={() => setIsRequestModalOpen(true)} />
          
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AvailableToday 
                meals={filteredMeals} 
                cookStats={cookStats} 
                onOrder={handleOrderMeal} 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
              />
              <OrderHistory orders={pastOrders} myReviews={myReviews} onRateOrder={setSelectedOrderForReview} />
            </div>
            <div className="space-y-8">
              <OrderTracking activeOrder={activeOrder} activeOrdersCount={activeOrdersCount} />
              <MyCustomRequests requests={pendingRequests} onCancel={handleCancelRequest} />
              <PromoCard />
            </div>
          </div>
        </motion.div>
      </main>

      <RequestFoodModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestCreated={(newRequest) => {
          setMyRequests(prev => [newRequest, ...prev]);
        }}
      />

      <ReviewModal
        isOpen={!!selectedOrderForReview}
        onClose={() => setSelectedOrderForReview(null)}
        order={selectedOrderForReview}
        onReviewSubmitted={(newReview) => {
          setMyReviews(prev => [newReview, ...prev]);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

// Sub-components
const Header = ({ user, navigate, notifications, setNotifications, isNotifOpen, setIsNotifOpen }) => {
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    toast.success("Successfully logged out");
    navigate('/login');
  };

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-primary/10 shadow-sm rounded-2xl flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-serif font-black text-espresso tracking-tight flex items-center gap-2">
          🍱 Cravyo <span className="hidden sm:inline-block text-espresso/45 font-medium text-lg ml-2 border-l border-primary/20 pl-4">Hosteler Hub</span>
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-6">
          
          {/* Notification Bell Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 hover:text-primary relative flex items-center justify-center border border-gray-100 cursor-pointer"
            >
              <FiBell className="w-5 h-5"/>
              {notifications && notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-white animate-pulse"></span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                  className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-primary/10 mb-2">
                    <span className="font-black text-sm text-espresso">Notifications</span>
                    {notifications && notifications.length > 0 && (
                      <button onClick={() => setNotifications([])} className="text-[10px] font-black text-primary hover:text-primary-hover bg-primary/10 px-2 py-1 rounded cursor-pointer">Clear All</button>
                    )}
                  </div>
                  <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    {!notifications || notifications.length === 0 ? (
                      <li className="text-center py-6 text-xs text-espresso-light/60 font-semibold">No new notifications.</li>
                    ) : (
                      notifications.map(n => (
                        <li key={n.id} className="text-xs font-semibold text-espresso-light p-2.5 bg-cream/40 border border-primary/5 rounded-lg text-left leading-relaxed">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="hidden sm:block flex-col text-left">
              <p className="font-bold text-espresso text-sm leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-primary font-semibold">Hosteler</p>
            </div>
          </div>
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 cursor-pointer">
            <FiLogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

const WelcomeBanner = ({ user, onRequestCustom }) => (
  <motion.div variants={itemVariants} className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="text-left">
      <h2 className="text-4xl lg:text-5xl font-serif font-black text-espresso tracking-tight">
        Hi, <span className="text-primary">{user?.name?.split(' ')[0]}! 👋</span>
      </h2>
      <p className="text-espresso-light font-medium mt-1">What home food are you craving on campus today?</p>
    </div>
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onRequestCustom}
      className="bg-primary hover:bg-primary-hover text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 text-base transition-all cursor-pointer"
    >
      Request Custom Food
    </motion.button>
  </motion.div>
);

const MyCustomRequests = ({ requests, onCancel }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
    <h3 className="text-xl font-serif font-black text-espresso flex items-center gap-3 mb-6">
      <span className="bg-secondary/15 text-secondary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-secondary/20">LIVE</span>
      My Custom Requests
    </h3>
    {requests.length === 0 ? (
      <div className="text-center py-6 px-4 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
        <p className="text-espresso-light/60 text-sm font-medium">No custom requests active.<br/>Can't find a dish? Request it!</p>
      </div>
    ) : (
      <ul className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {requests.map((req) => (
          <li key={req._id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between gap-3 group hover:border-secondary transition-colors text-left">
            <div>
              <p className="font-black text-base text-espresso leading-tight mb-1">{req.dishName}</p>
              {req.description && <p className="text-xs text-espresso-light font-medium italic mb-2">"{req.description}"</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-espresso-light font-semibold">
                <span className="flex items-center gap-1"><FiMapPin className="text-espresso-light/40" /> {req.deliveryLocation}</span>
                <span className="flex items-center gap-1"><FiClock className="text-espresso-light/40" /> {req.neededBy}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100/50">
              <span className="font-black text-primary text-lg">₹{req.price}</span>
              <button 
                type="button"
                onClick={() => onCancel(req._id)}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </motion.div>
);

const AvailableToday = ({ meals, cookStats, onOrder, searchQuery, setSearchQuery, selectedTag, setSelectedTag }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <h3 className="text-xl font-serif font-black text-espresso flex items-center gap-3">
        <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-primary/20">LIVE</span>
        Available on Campus
      </h3>
      
      {/* Search Input inside Available Today card */}
      <div className="relative flex items-center w-full md:w-72 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-inner">
        <FiSearch className="text-gray-400 mr-2 w-4 h-4 stroke-[3]" />
        <input 
          type="text" 
          placeholder="Search dishes, cooks..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="w-full text-xs font-bold bg-transparent focus:outline-none text-espresso" 
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-red-500">
            <FiX className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        )}
      </div>
    </div>

    {/* Sleek Filter Tags row */}
    <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4 font-sans">
      {["All", "Veg Only", "Non-Veg Only", "Bestseller", "Spicy"].map((tag) => {
        const isActive = selectedTag === tag;
        return (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase border transition-all cursor-pointer ${
              isActive 
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/15' 
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-500'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {meals.length === 0 ? <p className="text-gray-400 col-span-2 text-left">No meals match your criteria.</p> :
      meals.map((item, idx) => (
        <motion.div key={item._id} whileHover={{ scale: 1.02, y: -4 }} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden text-left">
          {item.tag && (
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white ${item.tag === 'Bestseller' ? 'bg-secondary' : 'bg-primary'} rounded-bl-xl z-10`}>
              {item.tag}
            </div>
          )}
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
               {['🍲','🍛','🥘','🍳'][idx % 4]}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.isVeg !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
                {item.isVeg !== false ? 'Veg' : 'Non-Veg'}
              </span>
            </div>
            <p className="font-black text-xl text-espresso mb-1 leading-tight">
               {item.title}
            </p>
            <p className="text-sm font-medium text-espresso-light flex items-center gap-2 mb-3">
              By <span className="font-bold text-espresso">{item.cookName}</span>
              <span className="flex items-center text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
                <FiStar className="fill-current w-3 h-3 mr-1" />
                {cookStats[item.createdBy]?.averageRating > 0 
                  ? `${cookStats[item.createdBy].averageRating.toFixed(1)} (${cookStats[item.createdBy].totalReviews})` 
                  : 'New Cook'}
              </span>
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <p className="font-black text-primary text-2xl">₹{item.price}</p>
            <motion.button onClick={() => onOrder(item)} whileTap={{ scale: 0.95 }} className="px-5 py-2 text-sm font-black text-white bg-espresso hover:bg-primary rounded-xl shadow-md transition-colors cursor-pointer">
              Order +
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const OrderTracking = ({ activeOrder, activeOrdersCount }) => {
  const steps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStep = activeOrder ? steps.indexOf(activeOrder.status) : -1;

  return (
    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif font-black text-espresso flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><FiPackage /></div> Track Order
          </h3>
          <Link to="/track-orders" className="p-2 bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-xl transition-all border border-gray-100 hover:border-primary/20 shadow-sm cursor-pointer" title="View all active orders">
             <FiArrowRight className="w-5 h-5 stroke-[3]" />
          </Link>
        </div>
        
        {activeOrdersCount > 1 && (
          <p className="text-xs text-primary font-bold bg-primary/5 p-2.5 rounded-xl border border-primary/10 text-center mb-4 mt-2">
            ⚠️ Tracking most recent order. Click the arrow to track all {activeOrdersCount} active orders.
          </p>
        )}
        
        {activeOrder ? (
            <div className="text-left">
                <div className="flex justify-between items-start p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-2xl relative shadow-inner">
                    <div className="relative z-10">
                        <p className="font-black text-lg text-espresso">{activeOrder.dishName}</p>
                        <p className="text-sm font-semibold text-espresso-light mt-1">Provider ID: <span className="text-espresso">{activeOrder.sellerId.substring(0,6)}..</span></p>
                    </div>
                </div>

                <div className="mt-8 ml-2 border-l-2 border-primary/10 space-y-6 relative pb-2">
                    {steps.map((step, idx) => {
                       const isActive = currentStep === idx;
                       const isPast = currentStep > idx;
                       if (step === 'Delivered' && !isPast && !isActive) return null; // hide delivered until arrived structurally
                       
                       return (
                        <div key={idx} className="relative pl-6">
                           <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isActive ? 'border-secondary bg-white' : isPast ? 'border-primary bg-primary' : 'border-primary/20 bg-white'}`}>
                              {isActive && <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-secondary animate-pulse"></span>}
                           </div>
                           <p className={`font-bold ${isActive ? 'text-secondary text-lg' : isPast ? 'text-espresso-light/65' : 'text-espresso-light/35'}`}>{step}</p>
                           {isActive && (
                               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pl-4 py-2 border-l-2 border-secondary/50 text-sm text-espresso-light font-medium text-left">
                                  {step === 'Pending' ? "Waiting for the cook to accept your request." : `Your order is currently ${step.toLowerCase()}.`}
                                </motion.div>
                           )}
                           {isActive && activeOrder.proofImageUrl && step === 'Out for Delivery' && (
                               <div className="mt-3 pl-4 flex flex-col items-start gap-2">
                                  <img src={activeOrder.proofImageUrl} alt="Proof" className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                  <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded">Proof Uploaded!</span>
                                </div>
                           )}
                        </div>
                       )
                    })}
                </div>

                <div className="mt-6 p-4 bg-cream/40 rounded-2xl flex justify-between items-center border border-primary/10">
                    <div>
                        <p className="text-xs font-bold text-espresso-light/60 uppercase tracking-widest mb-1">Estimated Arrival</p>
                        <p className="text-3xl font-black text-espresso">ASAP</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full border border-primary/10 shadow-sm flex items-center justify-center animate-spin-slow">
                        ⏳
                    </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-10 px-6 bg-cream/40 rounded-2xl border border-primary/10 border-dashed">
               <FiPackage className="w-10 h-10 text-primary/30 mx-auto mb-3" />
               <p className="text-espresso-light/65 font-medium">You have no active orders.<br/> Time to treat yourself!</p>
            </div>
        )}
    </motion.div>
  );
};

const OrderHistory = ({ orders, myReviews, onRateOrder }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-serif font-black text-espresso flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg text-primary"><FiClock /></div> Past Orders</h3>
    </div>
    {orders.length === 0 ? <p className="text-gray-400">Your history is empty.</p> :
    <ul className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
      {orders.map((order, idx) => {
        const isDelivered = order.status === 'Delivered';
        const review = myReviews.find(r => r.orderId === order._id);
        const alreadyReviewed = !!review;

        return (
          <motion.li key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl gap-4 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-gray-300">
                #{order._id.substring(order._id.length - 4)}
              </div>
              <div>
                <p className="font-black text-lg text-espresso">{order.dishName}</p>
                <p className="text-sm font-bold text-espresso-light/60">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
               <div className="flex items-center gap-3">
                 <span className="font-black text-espresso text-xl">₹{order.price}</span>
                 <span className={`text-xs font-black py-1.5 px-3 uppercase tracking-widest rounded-lg ${order.status === 'Declined' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                    {order.status}
                 </span>
               </div>
               
               {isDelivered && (
                 alreadyReviewed ? (
                   <span className="flex items-center text-secondary font-bold bg-secondary/10 px-3 py-1.5 rounded-lg text-xs border border-secondary/20 gap-1">
                     <FiStar className="fill-current w-3.5 h-3.5" /> Reviewed ({review.rating}★)
                   </span>
                 ) : (
                   <button 
                     onClick={() => onRateOrder(order)}
                     className="text-xs font-black text-white bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                   >
                     Rate Order 🌟
                   </button>
                 )
               )}
            </div>
          </motion.li>
        )
      })}
    </ul>}
  </motion.div>
);

const PromoCard = () => (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-primary to-primary-hover p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
        <FiTrendingUp className="w-8 h-8 text-white/80 mb-4" />
        <h3 className="text-2xl font-serif font-black mb-2 leading-tight">Earn Free Meals!</h3>
        <p className="text-white/90 font-medium leading-relaxed mb-6">Refer a day-scholar to join Cravyo, and get ₹150 off your next order.</p>
        <button className="w-full bg-white text-primary font-black py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">Get Invite Link</button>
    </motion.div>
);

export default HostelerDashboard;