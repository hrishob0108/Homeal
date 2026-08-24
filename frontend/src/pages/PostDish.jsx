import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCamera as Camera, FiTrash2 as Trash, FiClock as Clock, FiMapPin as MapPin, FiUsers as Users } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PostDish = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [tag, setTag] = useState('Breakfast'); // Breakfast or Lunch
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [spicyLevel, setSpicyLevel] = useState(1);
  
  // Dishes state
  const [dishes, setDishes] = useState([{ name: 'Rajma Chawal', price: 150, type: 'VEG' }]);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishType, setNewDishType] = useState('VEG');

  const [servings, setServings] = useState('');
  const [readyBy, setReadyBy] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [image, setImage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading photo...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'qbvu3y5j');
      
      const res = await fetch('https://api.cloudinary.com/v1_1/dfseckyjx/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.secure_url) {
        setImage(data.secure_url);
        toast.success('Photo uploaded successfully!', { id: toastId });
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDish = () => {
    if (!newDishName || !newDishPrice) {
      toast.error('Please enter dish name and price');
      return;
    }
    setDishes([...dishes, { name: newDishName, price: Number(newDishPrice), type: newDishType }]);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishType('VEG');
  };

  const handleRemoveDish = (index) => {
    setDishes(dishes.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!title || dishes.length === 0 || !servings || !readyBy || !pickupPoint) {
      toast.error("Please fill in all required fields and add at least one dish.");
      return;
    }

    const totalPrice = dishes.reduce((sum, d) => sum + d.price, 0);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/meals`,
        {
          title,
          description,
          price: totalPrice,
          tag,
          isVeg,
          spicyLevel,
          servings: Number(servings),
          readyBy,
          pickupPoint,
          dishes,
          image: image || '/default-meal.png'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Meal published successfully!');
      navigate('/dayscholar-dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to publish meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#B0464A] relative flex flex-col items-center font-sans overflow-x-hidden p-6 md:p-10 pt-16">
      
      {/* Main Container with Glassmorphism */}
      <div className="w-full max-w-[700px] relative z-10 flex flex-col items-center">
        
        {/* Header Typography */}
        <h1 className="font-serif text-[38px] md:text-[46px] font-bold text-white mb-2 tracking-tight text-center leading-tight">
          Homemade. Shared. Loved.
        </h1>
        <p className="text-[13px] md:text-[14px] text-[#f2cece] font-medium mb-8 text-center max-w-[450px]">
          Turn today's homemade dish into someone's favorite breakfast or lunch.
        </p>

        {/* Glass Card */}
        <div className="w-full bg-gradient-to-br from-[#c86264]/80 to-[#a34446]/80 backdrop-blur-xl border border-white/20 rounded-[28px] p-7 md:p-10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)]">
          
          {/* Which meal is this for? */}
          <div className="mb-8">
            <label className="block text-white text-[15px] font-serif mb-5">Which meal is this for?</label>
            <div className="flex gap-6 justify-center">
              <button 
                onClick={() => setTag('Breakfast')}
                className={`w-[140px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${tag === 'Breakfast' ? 'bg-[#b6494b] border-[1.5px] border-white/60 shadow-inner' : 'border-[1px] border-white/30 bg-transparent hover:bg-white/5'}`}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3014/3014491.png" alt="Breakfast" className="w-12 h-12 drop-shadow-sm brightness-110" />
                <span className="font-semibold text-[13px] text-white">Breakfast</span>
              </button>
              <button 
                onClick={() => setTag('Lunch')}
                className={`w-[140px] h-[100px] rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${tag === 'Lunch' ? 'bg-[#b6494b] border-[1.5px] border-white/60 shadow-inner' : 'border-[1px] border-white/30 bg-transparent hover:bg-white/5'}`}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/5753/5753905.png" alt="Lunch" className="w-12 h-12 drop-shadow-sm brightness-110" />
                <span className="font-semibold text-[13px] text-white">Lunch</span>
              </button>
            </div>
          </div>

          {/* Meal Title */}
          <div className="mb-6">
            <label className="block text-white text-[15px] font-serif mb-2">Meal Title</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              <input 
                type="text" 
                placeholder="e.g., Mom's special Rajmal Chawal thali"
                className="w-full bg-transparent border border-white/40 rounded-lg py-2.5 pl-10 pr-4 text-[14px] text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-white text-[15px] font-serif mb-2">Description</label>
            <textarea 
              placeholder="Cooked freshly this morning, ghee thadka, served with care"
              className="w-full bg-transparent border border-white/40 rounded-lg py-3 px-4 text-[14px] text-white placeholder-white/60 focus:outline-none focus:border-white/80 transition-colors h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Diet Type & Spicy Level */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-white text-[15px] font-serif mb-2">Diet Type</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsVeg(true)}
                  className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${isVeg ? 'bg-white/10 border-white/70 shadow-inner' : 'border-white/40 bg-transparent text-white/80 hover:bg-white/5'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/></svg>
                  <span className="text-[13px] font-medium">Veg</span>
                </button>
                <button 
                  onClick={() => setIsVeg(false)}
                  className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${!isVeg ? 'bg-white/10 border-white/70 shadow-inner' : 'border-white/40 bg-transparent text-white/80 hover:bg-white/5'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 6c-2-2-5-2-7 0-2 2-2 5 0 7l7 7 2-2-7-7c-1-1-1-3 0-4s3-1 4 0l7 7 2-2-7-7z"/></svg>
                  <span className="text-[13px] font-medium">Non - Veg</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white text-[15px] font-serif mb-2 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 11c0 5-4 9-10 10 0-4 1-8 4-11 2-2 4-3 6-3s1 2 0 4z"/></svg>
                Spicy Level
              </label>
              <div className="flex gap-2 h-10">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpicyLevel(level)}
                    className={`flex-1 rounded-lg border flex items-center justify-center transition-all ${spicyLevel >= level ? 'bg-white/10 border-white/70 shadow-inner' : 'border-white/40 bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={spicyLevel >= level ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M18 11c0 5-4 9-10 10 0-4 1-8 4-11 2-2 4-3 6-3s1 2 0 4z"/></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dishes in this meal */}
          <div className="mb-8 border-b border-white/10 pb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-white text-[15px] font-serif">Dishes in this meal</label>
              <span className="text-[10px] font-medium border border-white/40 px-2.5 py-0.5 rounded-full text-white/90 bg-white/5">{dishes.length} Item{dishes.length !== 1 && 's'}</span>
            </div>
            
            <div className="space-y-3 mb-4">
              {dishes.map((dish, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#b84e50]/40 border border-white/20 rounded-lg px-4 py-2.5">
                  <span className="text-[14px] text-white/90">{dish.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-bold text-white">₹ {dish.price}</span>
                    <button onClick={() => handleRemoveDish(idx)} className="text-white/70 hover:text-white transition-colors">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Dish Inputs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Dish name ( e.g. Aloo Paratha )"
                className="flex-1 bg-transparent border border-white/40 rounded-lg py-2.5 px-3 text-[13px] text-white placeholder-white/60 focus:outline-none focus:border-white/80"
                value={newDishName}
                onChange={(e) => setNewDishName(e.target.value)}
              />
              <div className="flex gap-3">
                <input 
                  type="number" 
                  placeholder="₹ Price"
                  className="w-[85px] bg-transparent border border-white/40 rounded-lg py-2.5 px-3 text-[13px] text-white placeholder-white/60 focus:outline-none focus:border-white/80 text-center"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                />
                <div className="relative">
                  <select 
                    className="w-[85px] bg-transparent border border-white/40 rounded-lg py-2.5 px-3 pl-5 text-[12px] font-medium text-white focus:outline-none focus:border-white/80 appearance-none bg-none"
                    value={newDishType}
                    onChange={(e) => setNewDishType(e.target.value)}
                  >
                    <option value="VEG" className="text-black">VEG</option>
                    <option value="NON-VEG" className="text-black">NON</option>
                  </select>
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${newDishType === 'VEG' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </span>
                </div>
                <button 
                  onClick={handleAddDish}
                  className="bg-[#5c2b2c] text-white px-5 rounded-lg text-[13px] font-medium transition-colors shadow-sm hover:bg-[#4a2223]"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Servings, Ready, Pickup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div>
              <label className="block text-white text-[15px] font-serif mb-2">Servings</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
                <input 
                  type="number" 
                  className="w-full bg-transparent border border-white/40 rounded-lg py-2.5 pl-9 pr-3 text-[14px] text-white placeholder-white/60 focus:outline-none focus:border-white/80"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  placeholder="4"
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-[15px] font-serif mb-2">Ready by</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
                <input 
                  type="time" 
                  className="w-full bg-transparent border border-white/40 rounded-lg py-2.5 pl-9 pr-3 text-[14px] text-white placeholder-white/60 focus:outline-none focus:border-white/80"
                  value={readyBy}
                  onChange={(e) => setReadyBy(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-[15px] font-serif mb-2">Pickup point</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-4 h-4" />
                <input 
                  type="text" 
                  className="w-full bg-transparent border border-white/40 rounded-lg py-2.5 pl-9 pr-3 text-[14px] text-white placeholder-white/60 focus:outline-none focus:border-white/80"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  placeholder="Hostel Block A, Gate 2..."
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-10">
            <label className="block text-white text-[15px] font-serif mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> Add a photo of your meal for menu
            </label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <div 
              onClick={() => !isUploading && fileInputRef.current.click()}
              className={`border ${image ? 'border-transparent p-1' : 'border-dashed border-[#441a1b] py-12'} bg-transparent rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/5 transition-colors relative overflow-hidden`}
              style={{ minHeight: image ? '200px' : 'auto' }}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 border-4 border-[#441a1b]/20 border-t-[#441a1b] rounded-full animate-spin mb-3"></span>
                  <p className="font-bold text-[14px] text-[#441a1b]">Uploading...</p>
                </div>
              ) : image ? (
                <>
                  <img src={image} alt="Meal preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Camera className="w-8 h-8 text-white mb-2" />
                    <p className="font-bold text-white">Click to change photo</p>
                  </div>
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#441a1b" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <div className="text-center mt-2">
                    <p className="font-bold text-[14px] text-[#441a1b]">Click to take a photo</p>
                    <p className="text-[11px] font-medium text-[#441a1b]/80 mt-0.5">JPG or PNG. Helps hostellers trust your meal</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-[11px] text-white/80 mt-2 flex items-center gap-1 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              Meals with photos get up <strong className="font-bold text-white">3x more requests</strong>. Foodler verifies all photos.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-2">
            <button className="flex-1 py-3.5 rounded-lg border border-[#5c2b2c] text-[#5c2b2c] font-bold text-[15px] hover:bg-black/5 transition-colors">
              Save as Draft
            </button>
            <button 
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 py-3.5 rounded-lg bg-[#5c2b2c] text-white font-bold text-[15px] hover:bg-[#4a2223] transition-colors shadow-md flex justify-center items-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  Publish Meal
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDish;
