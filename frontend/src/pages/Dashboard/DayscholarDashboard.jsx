import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheckCircle, FiStar, FiMapPin, FiClock, FiTruck, FiZap, FiMenu, FiSmile, FiLogOut, FiEdit2, FiTrash2, FiX
} from 'react-icons/fi';
import { FaRupeeSign, FaFire } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

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
  const wid = useRef();
  const [url, setUrl] = useState("");
  const [requests, setRequests] = useState([]);
  const [myMenu, setMyMenu] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  useEffect(() => {
    if(!user || !user.token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();

    // Cloudinary setup
    let myWidget = window.cloudinary.createUploadWidget(
      { cloudName: "dfseckyjx", uploadPreset: "qbvu3y5j" },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setUrl(result.info.secure_url);
          toast.success("Delivery Proof Uploaded!");
        }
      }
    );
    wid.current = myWidget;
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Orders requested from this seller
      const resOrders = await api.get('/orders/requests');
      setRequests(resOrders.data);

      // 2. Fetch all meals and filter by my id locally
      const resMeals = await api.get('/meals');
      setMyMenu(resMeals.data.filter(m => m.createdBy === user._id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const payload = { status: newStatus };
      if(newStatus === 'Delivered' && url) payload.proofImageUrl = url;

      const res = await api.put(`/orders/${orderId}/status`, payload);

      if(res.status === 200) {
        toast.success(`Order marked as ${newStatus}`);
        fetchDashboardData(); // refresh list
        if(newStatus === 'Delivered') setUrl(""); // reset image
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadProof = async (orderId) => {
    try {
      const payload = { proofImageUrl: url };
      const res = await api.put(`/orders/${orderId}/status`, payload);

      if(res.status === 200) {
        toast.success("Proof submitted to Hosteler!");
        setUrl(""); // Clear local state since it's now in DB
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
    { title: 'Rating', value: '4.8', icon: <FiStar className="text-yellow-500" />, color: 'yellow' },
    { title: 'Earnings', value: `₹${earnings}`, icon: <FaRupeeSign className="text-emerald-500" />, color: 'emerald' },
    { title: 'Active Requests', value: newRequests.length, icon: <FaFire className="text-orange-500" />, color: 'orange' },
  ];

  return (
    <div className="bg-[#FFFBF7] min-h-screen font-sans relative overflow-x-hidden text-gray-800 pb-12">
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-green-300/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Header user={user} navigate={navigate} />

      <main className="relative z-10 pt-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <WelcomeBanner user={user} />
          <StatsGrid stats={stats} />
          
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <NewFoodRequests requests={newRequests} onUpdateStatus={handleUpdateStatus} />
              <ActiveDeliveries deliveries={activeDeliveries} wid={wid} url={url} onUpdateStatus={handleUpdateStatus} onUploadProof={handleUploadProof} />
            </div>
            <div className="space-y-8">
              <QuickActions />
              <TodaysMenu menu={myMenu} user={user} fetchDashboardData={fetchDashboardData} />
              <RecentReviews />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// Sub Components
const Header = ({ user, navigate }) => {
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 w-full z-50 px-4 sm:px-6 lg:px-12 py-4"
    >
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-gray-200 shadow-sm rounded-2xl flex justify-between items-center px-6 py-3">
        <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          🍱 Foodler <span className="hidden sm:inline-block text-gray-400 font-medium text-lg ml-2 border-l border-gray-300 pl-4">Provider Hub</span>
        </Link>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-lg shadow-md uppercase">
                {user?.name?.[0] || 'D'}
             </div>
             <div className="hidden sm:block">
                <p className="font-bold text-gray-800 text-sm leading-tight">{user?.name || 'Dayscholar'}</p>
                <p className="text-xs text-orange-600 font-semibold">Verified Provider</p>
             </div>
          </div>
          <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors">
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
      Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">{user?.name?.split(' ')[0]}! 👋</span>
    </h2>
    <p className="text-gray-500 text-lg font-medium mt-2">Check out the latest incoming food requests below.</p>
  </motion.div>
);

const StatsGrid = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} className="bg-white/80 backdrop-blur-md border border-white/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all flex items-center gap-5">
        <div className={`p-4 rounded-2xl bg-${stat.color}-50 shadow-inner`}>
          {React.cloneElement(stat.icon, { className: `w-7 h-7 text-${stat.color}-500` })}
        </div>
        <div>
          <p className="text-gray-500 font-semibold text-sm mb-1">{stat.title}</p>
          <p className="text-3xl font-black text-gray-900">{stat.value}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

const NewFoodRequests = ({ requests, onUpdateStatus }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
        <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-orange-200">NEW</span>
        Live Requests
      </h3>
    </div>
    <div className="space-y-4">
      {requests.length === 0 ? <p className="text-gray-400 font-medium">No new requests right now. Hang tight!</p> :
      requests.map((req) => (
        <motion.div key={req._id} whileHover={{ scale: 1.01 }} className="border border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white hover:border-orange-200 transition-colors shadow-sm group">
          <div className="flex-1">
            <p className="font-black text-xl text-gray-900 mb-2">{req.dishName}</p>
            <div className="space-y-1.5">
              <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                <FiMapPin className="text-gray-400 group-hover:text-orange-500" /> By <span className="font-bold">{req.buyerName}</span> @ {req.deliveryLocation}
              </p>
              <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                <FiClock className="text-gray-400 group-hover:text-orange-500" /> Needed by <span className="font-bold">{req.neededBy}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xl font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl ring-1 ring-emerald-200 mr-2">₹{req.price}</span>
            <motion.button onClick={() => onUpdateStatus(req._id, 'Accepted')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial px-5 py-2.5 font-black text-white bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg">Accept</motion.button>
            <motion.button onClick={() => onUpdateStatus(req._id, 'Declined')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-initial px-5 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-xl">Decline</motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const ActiveDeliveries = ({ deliveries, wid, url, onUpdateStatus, onUploadProof }) => (
  <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FiTruck /></div> Active Deliveries
    </h3>
    <div className="space-y-4">
      {deliveries.length === 0 ? <p className="text-gray-400 font-medium">You have no active deliveries.</p> :
      deliveries.map((delivery) => (
        <div key={delivery._id} className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1 w-full relative">
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>
              <p className="font-black text-xl text-gray-900">{delivery.dishName}</p>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Delivering to <span className="font-bold text-gray-800">{delivery.buyerName}</span> @ {delivery.deliveryLocation}</p>
            <p className="font-black text-emerald-600 text-lg">₹{delivery.price}</p>

            {/* Cloudinary Upload & Delivery Flow */}
            <div className="mt-6 flex flex-col items-start gap-4">
               {['Accepted', 'Preparing'].includes(delivery.status) && (
                   <motion.button onClick={() => onUpdateStatus(delivery._id, 'Out for Delivery')} whileHover={{scale:1.02}} className="bg-orange-500 text-white font-bold px-6 py-2 rounded-xl">Mark Out For Delivery 🚀</motion.button>
               )}

              {delivery.status === 'Out for Delivery' && !delivery.proofImageUrl && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group w-full sm:w-auto overflow-hidden whitespace-nowrap"
                    onClick={() => wid.current.open()}
                  >
                    <FiZap className="text-indigo-400 group-hover:text-amber-400 transition-colors" /> 1. Upload Delivery Proof
                  </motion.button>
                  <AnimatePresence>
                    {url && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden rounded-xl border-2 border-green-200 shadow-lg relative mt-3 w-full sm:w-64 max-w-full">
                        <img src={url} alt="Proof" className="w-full h-40 object-cover" />
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">Uploaded Locally</div>
                        <button onClick={() => onUploadProof(delivery._id)} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 shadow-md">
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
  const [form, setForm] = useState({ title: '', price: '', tag: 'New' });
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', price: '' });

  const handlePublish = async (e) => {
     e.preventDefault();
     if(!form.title || !form.price) return toast.error("Title and Price are required.");
     
     try {
       const res = await api.post('/meals', form);
       if(res.status === 200 || res.status === 201) {
          toast.success("Dish Published seamlessly!");
          setIsAdding(false);
          setForm({ title: '', price: '', tag: 'New' });
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
                  <form onSubmit={e => handleUpdateItem(e, item._id)} className="flex items-center gap-2 p-3 bg-indigo-50/50">
                     <input type="text" className="w-full px-3 py-1.5 text-sm font-bold border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} autoFocus />
                     <input type="number" className="w-20 px-3 py-1.5 text-sm font-black text-emerald-600 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                     <button type="submit" className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 shadow-sm"><FiCheckCircle /></button>
                     <button type="button" onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors"><FiX /></button>
                  </form>
               ) : (
                  <div className="flex justify-between items-center p-4">
                    <span className="font-bold text-gray-800">{item.title}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-24 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                         <button onClick={() => { setEditingId(item._id); setEditForm({ title: item.title, price: item.price }); }} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-md transition-colors"><FiEdit2 className="w-4 h-4" /></button>
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
             <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg shadow-md font-bold text-sm">Publish</button>
             </div>
          </motion.form>
       )}
    </AnimatePresence>

    {!isAdding && (
      <button onClick={() => setIsAdding(true)} className="w-full mt-4 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors flex justify-center items-center gap-2 border border-orange-200 py-3 rounded-xl border-dashed">
        + Publish New Dish
      </button>
    )}
  </motion.div>
  );
};

const RecentReviews = () => (
    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50">
        <h3 className="text-xl font-black flex items-center gap-3 mb-6"><div className="p-2 bg-pink-100 rounded-lg text-pink-500"><FiSmile /></div> Community Love</h3>
        <p className="text-gray-500 mb-2">"Amazing rajma! Tasted just like home 🥰" <br/><span className="text-xs font-bold text-gray-400">- Priya P.</span></p>
    </motion.div>
);

export default DayscholarDashboard;
