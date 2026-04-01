import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiSearch, FiClock, FiPackage, FiStar, FiLogOut, FiTrendingUp } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const [meals, setMeals] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('currentUser'));

  useEffect(() => {
    if(!user || !user.token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch live feed
      const resMeals = await fetch('/api/meals');
      const dataMeals = await resMeals.json();
      if(resMeals.ok) setMeals(dataMeals);

      // Fetch personal orders
      const resOrders = await fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const dataOrders = await resOrders.json();
      if(resOrders.ok) setMyOrders(dataOrders);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch dashboard data");
    }
  };

  const handleOrderMeal = async (meal) => {
    // Prevent multiple active orders
    const hasActiveOrder = myOrders.some(o => o.status !== 'Delivered' && o.status !== 'Declined');
    if (hasActiveOrder) {
       return toast.error("You already have an active order!");
    }

    try {
      const payload = {
        sellerId: meal.createdBy, // We set this in the Meal schema
        mealId: meal._id,
        dishName: meal.title,
        price: meal.price,
        deliveryLocation: "Awaiting Input...", // In v2, prompt user for room #
        neededBy: "Asap" 
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if(res.ok) {
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
  const activeOrder = myOrders.find(o => o.status !== 'Delivered' && o.status !== 'Declined');
  const pastOrders = myOrders.filter(o => o.status === 'Delivered' || o.status === 'Declined');

  return (
    <div className="bg-[#FFFBF7] min-h-screen font-sans relative overflow-x-hidden text-gray-800 pb-12">
      <div className="fixed top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Header user={user} navigate={navigate} />

      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <WelcomeBanner user={user} />
          
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AvailableToday meals={meals} onOrder={handleOrderMeal} />
              <OrderHistory orders={pastOrders} />
            </div>
            <div className="space-y-8">
              <OrderTracking activeOrder={activeOrder} />
              <PromoCard />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Sub-components
const Header = ({ user, navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success("Successfully logged out");
    navigate('/login');
  };

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-12 py-4">
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          🍱 Foodler <span className="hidden sm:inline-block text-gray-400 font-medium text-lg ml-2 border-l border-gray-300 pl-4">Hosteler Hub</span>
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <motion.div whileHover={{ scale: 1.1 }} className="p-2.5 bg-gray-100 rounded-xl cursor-pointer hover:text-emerald-500"><FiSearch className="w-5 h-5"/></motion.div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-800 text-sm leading-tight">{user?.name || 'Guest'}</p>
              <p className="text-xs text-emerald-600 font-semibold">Hosteler</p>
            </div>
          </div>
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500">
            <FiLogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

const WelcomeBanner = ({ user }) => (
  <motion.div variants={itemVariants} className="mb-10">
    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
      Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-500">{user?.name?.split(' ')[0]}! 👋</span>
    </h2>
    <p className="text-gray-500 text-lg font-medium mt-2">What home-cooked meal are you craving today?</p>
  </motion.div>
);

const AvailableToday = ({ meals, onOrder }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
        <span className="bg-emerald-100 text-emerald-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-emerald-200">LIVE</span>
        Available on Campus
      </h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {meals.length === 0 ? <p className="text-gray-400 col-span-2">No meals posted today yet. The dayscholars are cooking up a storm!</p> :
      meals.map((item, idx) => (
        <motion.div key={item._id} whileHover={{ scale: 1.02, y: -4 }} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden">
          {item.tag && (
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white ${item.tag === 'Bestseller' ? 'bg-orange-500' : 'bg-blue-500'} rounded-bl-xl z-10`}>
              {item.tag}
            </div>
          )}
          <div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl mb-4 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
               {['🍲','🍛','🥘','🍳'][idx % 4]}
            </div>
            <p className="font-black text-xl text-gray-900 mb-1 leading-tight">{item.title}</p>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-3">
              By <span className="font-bold text-gray-700">{item.cookName}</span>
              <span className="flex items-center text-yellow-500 font-bold bg-yellow-50 px-2 py-0.5 rounded-md"><FiStar className="fill-current w-3 h-3 mr-1" />{item.rating || 4.5}</span>
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <p className="font-black text-emerald-600 text-2xl">₹{item.price}</p>
            <motion.button onClick={() => onOrder(item)} whileTap={{ scale: 0.95 }} className="px-5 py-2 text-sm font-black text-white bg-gray-900 hover:bg-emerald-500 rounded-xl shadow-md transition-colors">
              Order +
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const OrderTracking = ({ activeOrder }) => {
  const steps = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
  const currentStep = activeOrder ? steps.indexOf(activeOrder.status) : -1;

  return (
    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><FiPackage /></div> Track Order
        </h3>
        
        {activeOrder ? (
            <div>
                <div className="flex justify-between items-start p-5 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl relative shadow-inner">
                    <div className="relative z-10">
                        <p className="font-black text-lg text-gray-900">{activeOrder.dishName}</p>
                        <p className="text-sm font-semibold text-gray-600 mt-1">Provider ID: <span className="text-gray-900">{activeOrder.sellerId.substring(0,6)}..</span></p>
                    </div>
                </div>

                <div className="mt-8 ml-2 border-l-2 border-gray-100 space-y-6 relative pb-2">
                    {steps.map((step, idx) => {
                       const isActive = currentStep === idx;
                       const isPast = currentStep > idx;
                       if (step === 'Delivered' && !isPast && !isActive) return null; // hide delivered until arrived structurally
                       
                       return (
                        <div key={idx} className="relative pl-6">
                           <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${isActive ? 'border-orange-500 bg-white' : isPast ? 'border-orange-500 bg-orange-500' : 'border-gray-200 bg-white'}`}>
                              {isActive && <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
                           </div>
                           <p className={`font-bold ${isActive ? 'text-orange-600 text-lg' : isPast ? 'text-gray-800' : 'text-gray-300'}`}>{step}</p>
                           {isActive && (
                               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pl-4 py-2 border-l-2 border-orange-200 text-sm text-gray-500 font-medium">
                                  {step === 'Pending' ? "Waiting for the cook to accept your request." : `Your order is currently ${step.toLowerCase()}.`}
                               </motion.div>
                           )}
                           {isActive && activeOrder.proofImageUrl && step === 'Out for Delivery' && (
                               <div className="mt-3 pl-4 flex flex-col items-start gap-2">
                                  <img src={activeOrder.proofImageUrl} alt="Proof" className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Proof Uploaded!</span>
                               </div>
                           )}
                        </div>
                       )
                    })}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                        <p className="text-3xl font-black text-gray-900">ASAP</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center animate-spin-slow">
                        ⏳
                    </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
               <FiPackage className="w-10 h-10 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium">You have no active orders.<br/> Time to treat yourself!</p>
            </div>
        )}
    </motion.div>
  );
};

const OrderHistory = ({ orders }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-black text-gray-900 flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FiClock /></div> Past Orders</h3>
    </div>
    {orders.length === 0 ? <p className="text-gray-400">Your history is empty.</p> :
    <ul className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
      {orders.map((order, idx) => (
        <motion.li key={order._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-gray-300">
              #{order._id.substring(order._id.length - 4)}
            </div>
            <div>
              <p className="font-black text-lg text-gray-800">{order.dishName}</p>
              <p className="text-sm font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
             <span className="font-black text-gray-900 text-xl">₹{order.price}</span>
             <span className={`text-xs font-black py-1.5 px-3 uppercase tracking-widest rounded-lg ${order.status === 'Declined' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {order.status}
             </span>
          </div>
        </motion.li>
      ))}
    </ul>}
  </motion.div>
);

const PromoCard = () => (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
        <FiTrendingUp className="w-8 h-8 text-indigo-200 mb-4" />
        <h3 className="text-2xl font-black mb-2 leading-tight">Earn Free Meals!</h3>
        <p className="text-indigo-100 font-medium leading-relaxed mb-6">Refer a day-scholar to join Foodler, and get ₹150 off your next order.</p>
        <button className="w-full bg-white text-purple-600 font-black py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1">Get Invite Link</button>
    </motion.div>
);

export default HostelerDashboard;