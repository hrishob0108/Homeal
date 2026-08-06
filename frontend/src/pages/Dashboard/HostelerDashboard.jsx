import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUser, FiShoppingCart, FiSearch, FiClock, FiPackage, FiStar, FiLogOut, FiTrendingUp, FiMapPin, FiArrowRight, FiX, FiBell, FiChevronRight, FiChevronLeft, FiAlertTriangle, FiRepeat } from 'react-icons/fi';
import { FaUtensils, FaHeart, FaStar, FaGraduationCap } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import RequestFoodModal from '../../components/RequestFoodModal';
import ReviewModal from '../../components/ReviewModal';
import defaultMealImage from '../../assets/image.png';

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
      const targetSellerId = typeof meal.createdBy === 'object' ? (meal.createdBy._id || meal.createdBy.id) : meal.createdBy;
      const payload = {
        sellerId: targetSellerId,
        mealId: meal._id,
        dishName: meal.title,
        price: meal.price,
        deliveryLocation: "Room Delivery",
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
      console.error(err);
      toast.error(err.response?.data?.message || "Network error placing order.");
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
    <div className="bg-[#FFF0DD] min-h-screen font-sans relative overflow-x-hidden text-espresso pb-12">

      <Header 
        user={user} 
        navigate={navigate} 
        notifications={notifications} 
        setNotifications={setNotifications} 
        isNotifOpen={isNotifOpen} 
        setIsNotifOpen={setIsNotifOpen} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="relative z-10 pt-[140px] px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <WelcomeBanner user={user} onRequestCustom={() => setIsRequestModalOpen(true)} />
          
          <div className="mt-[80px]">
            <AvailableToday 
              meals={filteredMeals} 
              cookStats={cookStats} 
              onOrder={handleOrderMeal} 
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
          </div>

          <HostelerStatsSection myOrders={myOrders} myReviews={myReviews} />
          
          {/* Track Order Hero Section */}
          <TrackOrderHero activeOrder={activeOrder} activeOrdersCount={activeOrdersCount} />

          {/* Active Requests & Past Requests 2-Column Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <ActiveRequestsSection 
              requests={pendingRequests} 
              activeOrders={myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Declined')} 
              onCancel={handleCancelRequest}
            />
            <PastRequestsSection 
              orders={pastOrders} 
              myReviews={myReviews} 
              onRateOrder={setSelectedOrderForReview} 
              onReorder={handleOrderMeal}
            />
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
const Header = ({ user, navigate, notifications, setNotifications, isNotifOpen, setIsNotifOpen, searchQuery, setSearchQuery }) => {
  if (!user || !user.token || !user.collegeName || !user.collegeName.trim() || !user.isPhoneVerified) return null;

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    toast.success("Successfully logged out");
    navigate('/login');
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full px-6 md:px-12 pointer-events-none">
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ type: "spring", stiffness: 100, damping: 20 }} 
        className="w-full max-w-full h-[90px] bg-[#FFF8F2]/80 backdrop-blur-md border border-[#E8D9CF] rounded-[25px] shadow-md flex items-center px-12 pointer-events-auto"
      >
        <div className="flex w-full justify-between items-center h-full relative">
          
          {/* Left: Logo */}
          <Link to="/" className="text-[32px] font-serif font-bold text-[#8C3F3F] tracking-tight shrink-0">
            Cravyo
          </Link>

          {/* Middle: Search Bar (Exactly Centered) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px]">
            <div className="relative w-full flex items-center bg-white border border-[#E8D9CF] rounded-[999px] px-6 py-3 shadow-sm hover:border-[#C96D6D] transition-colors focus-within:border-[#8C3F3F] focus-within:ring-2 focus-within:ring-[#C96D6D]/20">
              <FiSearch className="text-[#4D2B2B]/40 mr-3 w-[18px] h-[18px] stroke-[2]" />
              <input 
                type="text" 
                placeholder="Search Meals, Dishes Or Cuisines..." 
                value={searchQuery} 
                onChange={e => setSearchQuery?.(e.target.value)} 
                className="w-full text-[15px] font-medium bg-transparent focus:outline-none text-[#4D2B2B] placeholder:text-[#4D2B2B]/40 font-sans" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[#4D2B2B]/50 hover:text-[#8C3F3F] transition-colors ml-2 cursor-pointer">
                  <FiX className="w-[18px] h-[18px] stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        {/* Right: Actions */}
        <div className="flex items-center space-x-6 shrink-0 z-10">
          
          {/* Hosteler & College Badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-[999px] border border-[#E8D9CF] bg-white text-[#8C3F3F] hover:bg-[#FFF8F2] transition-colors shadow-sm cursor-pointer max-w-[220px]">
             <FaGraduationCap className="w-4 h-4 text-[#8C3F3F] shrink-0" />
             <span className="text-[13px] font-bold truncate">{user?.collegeName || "Hosteler"}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="text-[#4D2B2B]/70 hover:text-[#8C3F3F] relative flex items-center justify-center cursor-pointer transition-colors p-2"
            >
              <FiBell className="w-6 h-6 stroke-[1.5]"/>
              {notifications && notifications.length > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-[#8C3F3F] rounded-full border-[2px] border-white animate-pulse"></span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 15, scale: 0.95 }} 
                  className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-xl border border-primary/10 shadow-2xl rounded-2xl p-4 z-50 overflow-hidden"
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

          {/* User Avatar */}
          <div className="relative group cursor-pointer" onClick={handleLogout} title="Click to Logout">
            <div className="w-[44px] h-[44px] rounded-full bg-[#FFF5EF] flex items-center justify-center text-[#8C3F3F] font-bold text-lg shadow-sm border border-[#E8D9CF] uppercase overflow-hidden hover:scale-105 transition-transform duration-300">
              {user?.name?.[0] || 'H'}
            </div>
            {/* Tooltip for logout */}
            <div className="absolute top-14 right-0 bg-white shadow-lg rounded-xl px-4 py-2 text-[13px] font-semibold text-[#8C3F3F] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#E8D9CF]">
               Logout
            </div>
          </div>
          
        </div>
        </div>
      </motion.header>
    </div>
  );
};

const WelcomeBanner = ({ user, onRequestCustom }) => {
  const firstName = user?.name?.split(' ')[0] || 'Maggie';
  return (
    <motion.div variants={itemVariants} className="mb-10 w-full relative bg-[linear-gradient(90deg,#C45257_0%,#D63447_46%,#FADBB0_91%)] rounded-[30px] overflow-hidden flex flex-col md:flex-row shadow-xl">
      {/* Text content left */}
      <div className="p-8 md:p-12 lg:px-[64px] lg:py-[48px] flex-1 text-left z-10">
         <p className="text-white/95 text-sm md:text-[15px] font-medium tracking-wide mb-4 flex items-center gap-2">
           <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z" fill="white"/>
           </svg>
           Good Afternoon, {firstName}
         </p>
         <h2 className="text-white font-serif text-[36px] sm:text-[42px] lg:text-[48px] leading-[1.1] mb-5 font-bold tracking-tight">
           Every craving deserves a <br/> homemade touch.
         </h2>
         <p className="text-white/90 font-medium text-[15px] md:text-[17px] mb-8">
           Find comforting meals prepared just for you.
         </p>
         <div className="flex flex-wrap items-center gap-4">
           <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestCustom}
              className="bg-white text-black font-semibold px-7 py-3.5 rounded-[999px] text-[16px] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
           >
              <span className="text-xl leading-none font-bold">+</span> Post a Craving
           </motion.button>
           <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('craving-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border border-white text-white font-semibold px-7 py-3.5 rounded-[999px] text-[16px] hover:bg-white hover:text-[#4D2B2B] transition-all flex items-center gap-2 cursor-pointer"
           >
              Browse menu <FiChevronRight />
           </motion.button>
         </div>
      </div>
      
      {/* Illustration right */}
      <div className="hidden md:block absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden pointer-events-none z-0">
        <img 
          src="/lunchbox.png" 
          alt="Homemade lunch boxes" 
          className="w-full h-full object-contain object-right scale-200 origin-right translate-x-6"
        />
      </div>
    </motion.div>
  );
};

const MyCustomRequests = ({ requests, onCancel }) => (
  <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
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

const AvailableToday = ({ meals, cookStats, onOrder, selectedTag, setSelectedTag }) => (
  <motion.div id="craving-section" variants={itemVariants} className="w-full">
    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
      <h3 className="text-[48px] font-serif text-[#4D2B2B] flex items-center gap-4 leading-none">
        <span className="bg-[#D0555D] text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm transform -translate-y-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          Live
        </span>
        What are you craving?
      </h3>
      <Link to="/all-meals" className="text-[#8C3F3F] font-bold text-[18px] hover:underline cursor-pointer font-serif transition-colors">See All</Link>
    </div>

    {/* Sleek Filter Tags row */}
    <div className="flex flex-wrap gap-[16px] mb-10 font-sans">
      {["All", "Veg Only", "Non-Veg Only", "Bestseller", "Spicy"].map((tag) => {
        const isActive = selectedTag === tag;
        return (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-7 py-3 rounded-[999px] text-[16px] font-semibold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
              isActive 
                ? 'bg-[#8C3F3F] text-white' 
                : 'bg-white text-[#4D2B2B] hover:bg-[#8C3F3F] hover:text-white border border-[#E8D9CF]'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>

    {meals.length === 0 ? (
      <div className="text-center py-16 px-4 bg-[#FFF5EF] rounded-[22px] border border-[#E8D9CF] border-dashed">
        <span className="text-5xl mb-4 block animate-bounce-slow">🍳</span>
        <p className="text-[#4D2B2B] font-bold text-xl mb-2">Kitchen is quiet</p>
        <p className="text-[#4D2B2B]/70 text-[16px] font-medium">No meals available right now. Check back later!</p>
      </div>
    ) : (
      <div className="relative group/carousel">
        <div className="flex gap-[20px] overflow-x-auto pb-12 pt-4 px-2 -mx-2 custom-scrollbar snap-x relative" id="meals-carousel">
          {meals.map((meal) => (
          <div key={meal._id} className="min-w-[240px] w-[240px] snap-start bg-[#E7082F]/[0.12] backdrop-blur-md rounded-[15px] shadow-sm border border-[#E7082F]/30 flex flex-col relative text-left group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#E7082F]/50 overflow-hidden">
            
            {/* Image Section */}
            <div className="relative h-[160px] w-full bg-[#E7082F]/5 overflow-hidden rounded-t-[15px]">
              <img src={meal.image || defaultMealImage} alt={meal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              
              {/* Tags (Bestseller, Spicy) */}
              {meal.tag && (
                <div className={`absolute top-0 right-0 text-white font-bold text-[11px] px-3 py-1 rounded-bl-[12px] shadow-sm ${meal.tag === 'Spicy' ? 'bg-[#DF3747]' : meal.tag === 'New' ? 'bg-[#964751]' : 'bg-[#C48C5E]'}`}>
                  {meal.tag}
                </div>
              )}
              
              {/* Veg/NonVeg Badge */}
              <div className={`absolute bottom-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md ${meal.isVeg !== false ? 'bg-[#3DB143]' : 'bg-[#C62828]'}`}>
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                {meal.isVeg !== false ? 'Veg' : 'Non-Veg'}
              </div>
            </div>

            {/* Content Section */}
            <div className="px-4 py-3.5 flex flex-col flex-1 justify-between">
              <div>
                <h4 className="font-serif font-bold text-[22px] text-[#412121] leading-tight mb-1 truncate">{meal.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] text-[#694A42]">By <span className="font-bold text-[#412121]">{meal.cookName || 'Unknown'}</span></span>
                  <span className="bg-white/80 backdrop-blur-sm border border-[#E7082F]/15 text-[#8C3F3F] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    {cookStats[meal.createdBy]?.totalReviews > 0 ? (
                      <>
                        <FiStar className="w-3 h-3 text-[#DFA460] fill-current" /> {cookStats[meal.createdBy].averageRating.toFixed(1)}
                        <span className="text-[#8C3F3F]/70 font-medium text-[10px]">({cookStats[meal.createdBy].totalReviews})</span>
                      </>
                    ) : (
                      <span className="text-[#8C3F3F] font-semibold text-[10px] flex items-center gap-0.5">
                        <span className="text-[#DFA460]">✨</span> New Cook
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2.5 border-t border-[#E7082F]/20">
                <span className="font-sans font-bold text-[20px] text-[#8C3F3F]">₹{meal.price}</span>
                <button 
                  onClick={() => onOrder(meal)}
                  className="bg-[#8C3F3F] hover:bg-[#6E3030] text-white font-medium text-[13px] px-3.5 py-1.5 rounded-[10px] transition-colors shadow-xs hover:shadow-sm cursor-pointer"
                >
                  Order +
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
        
        {/* Carousel Arrows */}
        <button 
          onClick={() => document.getElementById('meals-carousel').scrollBy({ left: -350, behavior: 'smooth' })}
          className="hidden lg:flex absolute -left-6 top-[40%] -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-[#FFF8F2] text-[#8C3F3F] w-14 h-14 rounded-full shadow-md border border-[#E7082F]/25 items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer z-10"
        >
          <FiChevronLeft className="w-8 h-8 stroke-[2]" />
        </button>
        <button 
          onClick={() => document.getElementById('meals-carousel').scrollBy({ left: 350, behavior: 'smooth' })}
          className="hidden lg:flex absolute -right-6 top-[40%] -translate-y-1/2 bg-white/90 backdrop-blur-md hover:bg-[#FFF8F2] text-[#8C3F3F] w-14 h-14 rounded-full shadow-md border border-[#E7082F]/25 items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer z-10"
        >
          <FiChevronRight className="w-8 h-8 stroke-[2]" />
        </button>
      </div>
    )}
  </motion.div>
);

const HostelerStatsSection = ({ myOrders = [], myReviews = [] }) => {
  const deliveredCount = myOrders.filter(o => o.status === 'Delivered').length;
  const mealsOrdered = deliveredCount;
  
  const uniqueCooks = new Set(myOrders.map(o => o.sellerId?._id || o.sellerId).filter(Boolean)).size;
  const favoriteCount = uniqueCooks;
  
  const avgRating = myReviews.length > 0 
    ? (myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1) 
    : '0.0';
    
  const thisMonthCount = myOrders.filter(o => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthVal = thisMonthCount;

  const stats = [
    {
      id: 'meals',
      value: mealsOrdered,
      label: 'Meals ordered',
      icon: (
        <svg className="w-5 h-5 text-[#C44355]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
        </svg>
      ),
      iconBox: 'bg-[#F2BAC1]/60 border border-[#E0909A]',
    },
    {
      id: 'favorites',
      value: favoriteCount,
      label: 'Favorite HomeBites',
      icon: <FaHeart className="w-5 h-5 text-[#DB3B6B]" />,
      iconBox: 'bg-[#F7B6C8]/60 border border-[#E2839E]',
    },
    {
      id: 'rating',
      value: avgRating,
      label: 'Your rating',
      icon: <FaStar className="w-5 h-5 text-[#C69138]" />,
      iconBox: 'bg-[#EED5A5]/60 border border-[#DCBA7E]',
    },
    {
      id: 'month',
      value: thisMonthVal,
      label: 'This month',
      icon: <FiTrendingUp className="w-5 h-5 text-[#3B8F62] stroke-[2.5]" />,
      iconBox: 'bg-[#BEE0CE]/60 border border-[#8DC7A5]',
    },
  ];

  return (
    <motion.section 
      variants={itemVariants} 
      className="my-14 w-full overflow-visible"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center">
        {/* Left Illustration: In the back (z-0) */}
        <div className="md:col-span-6 flex justify-start items-center -ml-4 sm:-ml-8 lg:-ml-16 overflow-visible relative z-0">
          <div className="relative w-full">
            <img 
              src="/girl-food.png" 
              alt="Girl enjoying home meal" 
              className="w-full h-auto object-contain select-none drop-shadow-sm pointer-events-none -translate-x-6 lg:-translate-x-[140px] scale-110 sm:scale-125 lg:scale-135 origin-left"
              onError={(e) => {
                e.target.src = '/hero-meal.png';
              }}
            />
          </div>
        </div>

        {/* Right 2x2 Stats Grid - In front on top (z-10) */}
        <div className="md:col-span-6 grid grid-cols-2 gap-3.5 lg:gap-5 text-left -ml-0 sm:-ml-4 lg:-ml-12 xl:-ml-20 relative z-10">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-b from-[#F6E1C4] to-[#F1D8B5] border border-[#A67E5D]/40 rounded-[24px] p-6 lg:p-7 shadow-[0_6px_16px_rgba(90,50,20,0.08)] hover:shadow-[0_12px_24px_rgba(90,50,20,0.13)] transition-all flex flex-col justify-between min-h-[160px]"
            >
              <div className={`w-12 h-12 rounded-[14px] ${stat.iconBox} flex items-center justify-center mb-4 shadow-xs`}>
                {stat.icon}
              </div>
              <div>
                <h3 className="font-serif font-black text-4xl lg:text-[44px] text-[#3B2520] leading-none mb-1.5 tracking-tight">
                  {stat.value}
                </h3>
                <p className="font-sans font-semibold text-[15px] lg:text-[16px] text-[#5A3B34]">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

const TrackOrderHero = ({ activeOrder, activeOrdersCount }) => {
  if (!activeOrder) return null;

  const steps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery'];
  const rawStatus = activeOrder.status || 'Pending';
  const currentStepIndex = steps.indexOf(rawStatus) !== -1 ? steps.indexOf(rawStatus) : 0;

  return (
    <motion.section variants={itemVariants} className="my-10 w-full text-left">
      <div className="bg-[#D79A98] rounded-[32px] p-6 lg:p-8 shadow-sm border border-[#C68583]">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0DD]/70 flex items-center justify-center text-[#4A2020] shadow-xs">
              <FiPackage className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="font-serif font-black text-2xl lg:text-3xl text-[#341818] tracking-tight">
              Track Order
            </h2>
          </div>
          <Link 
            to="/track-orders" 
            className="w-10 h-10 rounded-xl bg-[#FFF0DD]/80 hover:bg-[#FFF0DD] text-[#341818] flex items-center justify-center transition-all shadow-xs cursor-pointer"
            title="Track all orders"
          >
            <FiArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Alert Banner */}
        <div className="bg-[#F8E2DC]/85 border border-[#E9C3BC] rounded-2xl py-3 px-5 flex items-center justify-center gap-2.5 text-center text-[#5E3633] text-sm font-semibold mt-5 mb-6 shadow-xs">
          <FiAlertTriangle className="w-4 h-4 text-[#C98420] shrink-0" />
          <span>Tracking most recent order. Click the arrow to track all active orders</span>
        </div>

        {/* Main Timeline Card */}
        <div className="bg-[#F6ECE0] rounded-[26px] p-6 lg:p-8 relative border border-[#EBD6C3] shadow-xs">
          {/* Top Dish Info & Cook Proof */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            {/* Left Dish Info */}
            <div className="relative">
              <div className="inline-block bg-[#D2EBD9] text-[#2F7D4E] border border-[#B5DEC0] text-[11px] font-bold px-3 py-0.5 rounded-full mb-2">
                Arriving Today
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-[#EBD8C8] min-w-[220px]">
                <h4 className="font-serif font-bold text-lg text-[#3A201C] leading-tight">
                  {activeOrder.dishName}
                </h4>
                <p className="text-xs text-[#8A6A62] font-semibold mt-1">
                  Provider: {activeOrder.sellerName || 'Dayscholar Cook'}
                </p>
              </div>
            </div>

            {/* Cooking Proof image above Preparing step */}
            {activeOrder.cookingProofImageUrl && (
              <div className="flex flex-col items-center sm:mr-32 md:mr-44 lg:mr-56">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white">
                  <img 
                    src={activeOrder.cookingProofImageUrl} 
                    alt="Cook proof" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/hero-meal.png'; }}
                  />
                </div>
                <span className="bg-[#E99696] text-[#6A1C1C] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#D97C7C] -mt-2.5 shadow-xs z-10">
                  Cooking Proof
                </span>
              </div>
            )}
          </div>

          {/* 4-Step Stepper with Alternating Labels */}
          <div className="relative my-10 px-4 sm:px-8">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-[3px] bg-[#9C6D68]/30 z-0">
              <div 
                className="h-full bg-[#5E2B2B] transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStepIndex / 3) * 100)}%` }}
              />
            </div>

            {/* 4 Step Points */}
            <div className="relative z-10 flex justify-between items-center">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isTopLabel = idx % 2 === 1; // 1: Accepted, 3: Out for Delivery
                
                return (
                  <div key={step} className="flex flex-col items-center relative">
                    {/* Top label */}
                    {isTopLabel && (
                      <span className={`absolute -top-8 font-serif font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${
                        isPassed ? 'text-[#3A201C]' : 'text-[#8A6A62]/60'
                      }`}>
                        {step}
                      </span>
                    )}

                    {/* Step Dot */}
                    <div className={`w-5 h-5 rounded-full ring-4 ring-[#F6ECE0] transition-all ${
                      isPassed ? 'bg-[#5E2B2B] scale-110 shadow-xs' : 'bg-[#D0B8A8]'
                    }`} />

                    {/* Bottom label */}
                    {!isTopLabel && (
                      <span className={`absolute -bottom-8 font-serif font-bold text-base sm:text-lg whitespace-nowrap transition-colors ${
                        isPassed ? 'text-[#3A201C]' : 'text-[#8A6A62]/60'
                      }`}>
                        {step}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Estimated Arrival & OTP Box */}
          <div className="flex flex-wrap justify-between items-end gap-6 pt-6 mt-6">
            {/* Estimated Arrival Box */}
            <div className="bg-[#FAF2EA] border border-[#E8D7C8] rounded-2xl px-6 py-3.5 shadow-xs">
              <p className="text-[10px] font-bold tracking-wider text-[#8A6A62] uppercase mb-1">
                Estimated Arrival
              </p>
              <p className="font-serif font-black text-2xl text-[#3A201C] leading-none">
                ASAP
              </p>
            </div>

            {/* OTP Box & Status text */}
            <div className="flex flex-col items-end">
              <p className="text-xs text-[#7A5B53] font-medium mb-2 text-right">
                Your order is currently {activeOrder.status?.toLowerCase() || 'in progress'}
              </p>
              {activeOrder.otp && (
                <div className="bg-[#D7EBDC] border-2 border-[#A2D3AC] rounded-2xl px-8 py-3 text-center min-w-[190px] shadow-xs">
                  <p className="text-[11px] font-bold text-[#3B7A4E] tracking-wider uppercase mb-0.5">
                    Your Delivery OTP
                  </p>
                  <p className="text-3xl font-black text-[#2A7541] font-mono tracking-widest leading-none">
                    {activeOrder.otp}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const ActiveRequestsSection = ({ requests = [], activeOrders = [], onCancel }) => {
  let activeList = [];

  activeOrders.forEach((o) => {
    activeList.push({
      id: o._id,
      dishName: o.dishName,
      cookName: o.sellerName || 'Dayscholar Cook',
      time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      eta: o.status === 'Accepted' ? '20 min' : null,
      status: o.status || 'Accepted',
      image: o.imageUrl || '/cravyo_hero_thali.png'
    });
  });
  requests.forEach((r) => {
    activeList.push({
      id: r._id,
      dishName: r.dishName,
      cookName: 'Custom Request',
      time: r.neededBy || 'ASAP',
      eta: null,
      status: 'Pending',
      image: '/lunchbox.png'
    });
  });

  return (
    <motion.div variants={itemVariants} className="bg-[#FFF6EF] border border-[#F0D5C5] rounded-[28px] p-6 lg:p-7 shadow-sm text-left">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#F0D5C5]/70 mb-5">
        <div className="flex items-center gap-2.5">
          <FiClock className="w-5 h-5 text-[#D04545]" />
          <h3 className="font-serif font-bold text-2xl text-[#3A201C]">
            Active Requests
          </h3>
        </div>
        <span className="border border-[#E0A8A0] text-[#7A3F3F] text-xs font-semibold px-3 py-0.5 rounded-full bg-white/50">
          {activeList.length} total
        </span>
      </div>

      {/* List / Empty State */}
      {activeList.length === 0 ? (
        <div className="py-12 px-4 text-center bg-[#FBF0E6]/60 border border-dashed border-[#EED7C7] rounded-2xl flex flex-col items-center justify-center gap-2">
          <FiClock className="w-8 h-8 text-[#8A6A62]/40" />
          <p className="text-base font-bold text-[#3A201C]">No active requests</p>
          <p className="text-xs text-[#8A6A62] max-w-xs">Custom meal requests and in-progress orders will appear here once placed.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeList.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="bg-[#FBF0E6] border border-[#EED7C7] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img 
                  src={item.image || '/cravyo_hero_thali.png'} 
                  alt={item.dishName} 
                  className="w-14 h-14 rounded-xl object-cover shadow-xs border border-[#EAD0BE] bg-white shrink-0"
                  onError={(e) => { e.target.src = '/hero-meal.png'; }}
                />
                <div>
                  <h4 className="font-serif font-bold text-base text-[#3A201C] leading-tight">
                    {item.dishName}
                  </h4>
                  <p className="text-xs text-[#8A6A62] font-semibold mt-0.5">
                    {item.cookName} • 🕒 {item.time}
                  </p>
                  {/* Progress bar */}
                  <div className="h-1.5 w-32 sm:w-44 bg-gradient-to-r from-[#D07060] to-[#E8C0B0] rounded-full mt-2" />
                  {item.eta && (
                    <p className="text-[11px] text-[#8A6A62] font-medium mt-1">
                      ETA: {item.eta}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                  item.status === 'Accepted' 
                    ? 'bg-[#FCEAE8] border-[#F3B8B2] text-[#D04545]'
                    : item.status === 'Pending'
                    ? 'bg-[#FEF5E7] border-[#FCDAA8] text-[#C98420]'
                    : 'bg-[#EAF6ED] border-[#BBE3C8] text-[#34965C]'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const PastRequestsSection = ({ orders = [], myReviews = [], onRateOrder, onReorder }) => {
  let pastList = [];

  if (orders.length > 0) {
    pastList = orders.map((o) => {
      const review = myReviews.find(r => r.orderId === o._id);
      return {
        id: o._id,
        dishName: o.dishName,
        cookName: o.sellerName || 'Dayscholar Chef',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
        price: o.price,
        rating: review ? `${review.rating}/5` : null,
        status: o.status === 'Declined' ? 'Canceled' : o.status,
        image: o.imageUrl || '/lunchbox.png'
      };
    });
  }

  return (
    <motion.div variants={itemVariants} className="bg-[#FFF6EF] border border-[#F0D5C5] rounded-[28px] p-6 lg:p-7 shadow-sm text-left">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-[#F0D5C5]/70 mb-5">
        <div className="flex items-center gap-2.5">
          <FiClock className="w-5 h-5 text-[#D04545]" />
          <h3 className="font-serif font-bold text-2xl text-[#3A201C]">
            Past Requests
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="border border-[#E0A8A0] text-[#7A3F3F] text-xs font-semibold px-3 py-0.5 rounded-full bg-white/50">
            {pastList.length} total
          </span>
          <Link to="/track-orders" className="text-[#C94747] font-bold text-xs hover:underline">
            View all
          </Link>
        </div>
      </div>

      {/* List / Empty State */}
      {pastList.length === 0 ? (
        <div className="py-12 px-4 text-center bg-[#FBF0E6]/60 border border-dashed border-[#EED7C7] rounded-2xl flex flex-col items-center justify-center gap-2">
          <FiPackage className="w-8 h-8 text-[#8A6A62]/40" />
          <p className="text-base font-bold text-[#3A201C]">No past requests yet</p>
          <p className="text-xs text-[#8A6A62] max-w-xs">Delivered and completed orders will appear here for easy reordering and rating.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {pastList.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="bg-[#FBF0E6] border border-[#EED7C7] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <img 
                  src={item.image || '/lunchbox.png'} 
                  alt={item.dishName} 
                  className="w-14 h-14 rounded-xl object-cover shadow-xs border border-[#EAD0BE] bg-white shrink-0"
                  onError={(e) => { e.target.src = '/hero-meal.png'; }}
                />
                <div>
                  <h4 className="font-serif font-bold text-base text-[#3A201C] leading-tight">
                    {item.dishName}
                  </h4>
                  <p className="text-xs text-[#8A6A62] font-semibold mt-0.5">
                    {item.cookName} • 📅 {item.date}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-black text-[#A82B2B] text-sm">
                      ₹{item.price}
                    </span>
                    {item.rating && (
                      <span className="text-xs font-bold text-[#8A6A62] flex items-center gap-0.5">
                        <FiStar className="w-3.5 h-3.5 fill-[#E5A83B] text-[#E5A83B]" /> {item.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border ${
                  item.status === 'Delivered'
                    ? 'bg-[#EAF6ED] border-[#BBE3C8] text-[#34965C]'
                    : 'bg-[#FDECEC] border-[#F7BABA] text-[#D84545]'
                }`}>
                  {item.status}
                </span>
                {item.status === 'Delivered' && (
                  <button 
                    onClick={() => onReorder && onReorder(item)}
                    className="bg-white border border-[#E5A8A8] text-[#9E3F3F] font-semibold text-xs px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs hover:bg-[#FFF0F0] cursor-pointer transition-colors"
                  >
                    <FiRepeat className="w-3 h-3" /> Reorder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HostelerDashboard;