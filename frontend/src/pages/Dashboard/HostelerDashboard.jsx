import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUser, FiShoppingCart, FiSearch, FiClock, FiPackage, FiStar, FiLogOut, FiTrendingUp, FiMapPin, FiArrowRight, FiX, FiBell, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
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
    <div className="bg-cream min-h-screen font-sans relative overflow-x-hidden text-espresso pb-12">

      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-secondary/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

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
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
const Header = ({ user, navigate, notifications, setNotifications, isNotifOpen, setIsNotifOpen, searchQuery, setSearchQuery }) => {
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
          
          {/* Hosteler Badge */}
          <div className="hidden md:flex items-center gap-2.5 px-6 py-2.5 rounded-[999px] border border-[#E8D9CF] bg-white text-[#8C3F3F] hover:bg-[#FFF8F2] transition-colors shadow-sm cursor-pointer">
             <FiHome className="w-4 h-4 stroke-[2]" />
             <span className="text-[14px] font-semibold">Hosteler</span>
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
          <div key={meal._id} className="min-w-[240px] w-[240px] snap-start bg-[#F4DCD0] rounded-xl shadow-md border border-[#E3C2B1] flex flex-col relative text-left group cursor-pointer transition-transform duration-300 hover:-translate-y-1">
            
            {/* Image Section */}
            <div className="relative h-[160px] w-full bg-gray-200 overflow-hidden rounded-t-xl">
              <img src={meal.image || '/src/assets/image.png'} alt={meal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              
              {/* Tags (Bestseller, Spicy) */}
              {meal.tag && (
                <div className={`absolute top-0 right-0 text-white font-bold text-[11px] px-3 py-1 rounded-bl-xl shadow-sm ${meal.tag === 'Spicy' ? 'bg-[#DF3747]' : meal.tag === 'New' ? 'bg-[#964751]' : 'bg-[#C48C5E]'}`}>
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
            <div className="px-4 py-3 flex flex-col flex-1 justify-between">
              <div>
                <h4 className="font-serif font-bold text-[22px] text-[#412121] leading-tight mb-1 truncate">{meal.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] text-[#694A42]">By <span className="font-bold text-[#412121]">{meal.cookName || 'Unknown'}</span></span>
                  <span className="bg-[#E2CEBF] text-[#91674E] text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <FiStar className="w-3 h-3 text-[#DFA460] fill-current" /> {cookStats[meal.createdBy]?.averageRating > 0 ? cookStats[meal.createdBy].averageRating.toFixed(1) : '4.8'}<span className="text-[#91674E]/70 font-medium text-[10px]">({cookStats[meal.createdBy]?.totalReviews || 126})</span>
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-[#E6CDBC]">
                <span className="font-sans font-bold text-[20px] text-[#692E31]">₹{meal.price}</span>
                <button 
                  onClick={() => onOrder(meal)}
                  className="bg-[#5B292D] hover:bg-[#431D1F] text-white font-medium text-[13px] px-3 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer"
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
          className="hidden lg:flex absolute -left-6 top-[40%] -translate-y-1/2 bg-[#FFF8F2] hover:bg-[#F4DCD0] text-[#692E31] w-14 h-14 rounded-full shadow-md border border-[#E3C2B1] items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer z-10"
        >
          <FiChevronLeft className="w-8 h-8 stroke-[2]" />
        </button>
        <button 
          onClick={() => document.getElementById('meals-carousel').scrollBy({ left: 350, behavior: 'smooth' })}
          className="hidden lg:flex absolute -right-6 top-[40%] -translate-y-1/2 bg-[#FFF8F2] hover:bg-[#F4DCD0] text-[#692E31] w-14 h-14 rounded-full shadow-md border border-[#E3C2B1] items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer z-10"
        >
          <FiChevronRight className="w-8 h-8 stroke-[2]" />
        </button>
      </div>
    )}
  </motion.div>
);

const OrderTracking = ({ activeOrder, activeOrdersCount }) => {
  const steps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStep = activeOrder ? steps.indexOf(activeOrder.status) : -1;

  return (
    <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
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
                           
                           {/* Escrow Details: Cooking Proof */}
                           {(isActive || isPast) && activeOrder.cookingProofImageUrl && step === 'Preparing' && (
                               <div className="mt-3 pl-4 flex flex-col items-start gap-2">
                                  <img src={activeOrder.cookingProofImageUrl} alt="Cooking Proof" className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                  <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-1 rounded">Cooking Proof</span>
                                </div>
                           )}

                           {/* Escrow Details: Delivery Proof & OTP */}
                           {isActive && step === 'Out for Delivery' && (
                               <div className="mt-4 pl-4 flex flex-col gap-3">
                                  {activeOrder.otp && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 flex flex-col items-center">
                                      <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Your Delivery OTP</p>
                                      <p className="text-3xl font-black text-green-600 font-mono tracking-widest">{activeOrder.otp}</p>
                                      <p className="text-[10px] text-green-600/70 font-medium text-center mt-1">Give this PIN to the cook when receiving your food</p>
                                    </div>
                                  )}
                                  {(activeOrder.handoverProofImageUrl || activeOrder.proofImageUrl) && (
                                    <div className="flex flex-col items-start gap-2">
                                      <img src={activeOrder.handoverProofImageUrl || activeOrder.proofImageUrl} alt="Handover Proof" className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                      <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded">Handover Proof</span>
                                    </div>
                                  )}
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
  <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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