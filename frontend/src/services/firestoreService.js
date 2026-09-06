import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  collection,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db, auth, firebaseConfig } from "../firebase";

// ==========================================
// 1. USER PROFILES
// ==========================================

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userDocRef = doc(db, "users", uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return { _id: uid, uid, ...snap.data() };
  }
  return null;
};

export const createUserProfile = async (uid, profileData) => {
  const userDocRef = doc(db, "users", uid);
  const dataToSave = {
    name: profileData.name || "",
    email: profileData.email || "",
    role: profileData.role || "dayscholar",
    phone: profileData.phone || "",
    isPhoneVerified: Boolean(profileData.isPhoneVerified),
    state: profileData.state || "",
    district: profileData.district || "",
    collegeName: profileData.collegeName || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(userDocRef, dataToSave, { merge: true });

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "firebase-token";
  return { _id: uid, uid, ...dataToSave, token };
};

export const updateUserProfile = async (uid, updateData) => {
  const userDocRef = doc(db, "users", uid);
  const payload = {
    ...updateData,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(userDocRef, payload);

  const freshProfile = await getUserProfile(uid);
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "firebase-token";
  return { ...freshProfile, token };
};

export const saveCollegeOnboarding = async (uid, { state, district, collegeName, phone, isPhoneVerified }) => {
  const payload = {
    state: state.trim(),
    district: district.trim(),
    collegeName: collegeName.trim(),
    updatedAt: serverTimestamp(),
  };
  if (phone) payload.phone = phone.trim();
  if (isPhoneVerified !== undefined) payload.isPhoneVerified = isPhoneVerified;

  return await updateUserProfile(uid, payload);
};

// ==========================================
// 2. MEALS & DISHES
// ==========================================

export const createMeal = async (mealData) => {
  const mealsCol = collection(db, "meals");
  const payload = {
    title: mealData.title || "",
    description: mealData.description || "",
    price: Number(mealData.price) || 0,
    image: mealData.image || "",
    tag: mealData.tag || "New",
    isVeg: mealData.isVeg !== undefined ? mealData.isVeg : true,
    spicyLevel: Number(mealData.spicyLevel) || 1,
    servings: Number(mealData.servings) || 1,
    readyBy: mealData.readyBy || "",
    pickupPoint: mealData.pickupPoint || "",
    dishes: mealData.dishes || [],
    cookName: mealData.cookName || "Chef",
    collegeName: (mealData.collegeName || "").trim(),
    createdBy: mealData.createdBy,
    rating: 4.8,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(mealsCol, payload);
  return { _id: docRef.id, id: docRef.id, ...payload };
};

export const getMealsByCollege = async (collegeName) => {
  if (!collegeName) return [];
  const mealsCol = collection(db, "meals");
  const q = query(
    mealsCol, 
    where("collegeName", "==", collegeName.trim())
  );
  const snap = await getDocs(q);
  const meals = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  // Sort client-side by createdAt descending to avoid composite index requirements
  return meals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const deleteMeal = async (mealId) => {
  if (!mealId) return;
  const mealDocRef = doc(db, "meals", mealId);
  await deleteDoc(mealDocRef);
};

export const listenCollegeMeals = (collegeName, callback) => {
  if (!collegeName) return () => {};
  const mealsCol = collection(db, "meals");
  const q = query(mealsCol, where("collegeName", "==", collegeName.trim()));
  return onSnapshot(q, (snap) => {
    const meals = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
    meals.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(meals);
  }, (err) => {
    console.error("listenCollegeMeals Error:", err);
  });
};

// ==========================================
// 3. ORDERS & REALTIME TRACKING
// ==========================================

export const createOrder = async (orderData) => {
  const ordersCol = collection(db, "orders");
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const payload = {
    buyerId: orderData.buyerId,
    buyerName: orderData.buyerName || "Hosteler",
    sellerId: orderData.sellerId || orderData.cookId,
    mealId: orderData.mealId || null,
    dishName: orderData.dishName || "Home-Cooked Meal",
    price: Number(orderData.price) || 0,
    imageUrl: orderData.imageUrl || "",
    deliveryLocation: orderData.deliveryLocation || "Hostel Room Delivery",
    collegeName: (orderData.collegeName || "").trim(),
    state: (orderData.state || orderData.collegeState || "").trim(),
    district: (orderData.district || "").trim(),
    neededBy: orderData.neededBy || "Asap",
    status: "Pending",
    otp: otp,
    isOtpVerified: false,
    proofImageUrl: "",
    cookingProofImageUrl: "",
    handoverProofImageUrl: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersCol, payload);
  return { _id: docRef.id, id: docRef.id, ...payload };
};

export const getHostelerOrders = async (buyerId) => {
  if (!buyerId) return [];
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("buyerId", "==", buyerId));
  const snap = await getDocs(q);
  const orders = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getDayscholarRequests = async (sellerId) => {
  if (!sellerId) return [];
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("sellerId", "==", sellerId));
  const snap = await getDocs(q);
  const orders = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateOrderStatus = async (orderId, { status, proofImageUrl, cookingProofImageUrl, handoverProofImageUrl, otp }) => {
  const orderDocRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderDocRef);
  if (!orderSnap.exists()) {
    throw new Error("Order not found");
  }

  const currentOrder = orderSnap.data();

  // Delivery OTP verification
  if (status === "Delivered") {
    if (currentOrder.otp && otp && String(otp).trim() !== String(currentOrder.otp).trim()) {
      throw new Error("Invalid Delivery OTP. Please enter the correct 4-digit code from the hosteler.");
    }
  }

  const updates = { updatedAt: serverTimestamp() };
  if (status) updates.status = status;
  if (proofImageUrl) updates.proofImageUrl = proofImageUrl;
  if (cookingProofImageUrl) updates.cookingProofImageUrl = cookingProofImageUrl;
  if (handoverProofImageUrl) updates.handoverProofImageUrl = handoverProofImageUrl;
  if (status === "Delivered") updates.isOtpVerified = true;

  await updateDoc(orderDocRef, updates);
  return { _id: orderId, id: orderId, ...currentOrder, ...updates };
};

export const listenHostelerOrders = (buyerId, callback) => {
  if (!buyerId) return () => {};
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("buyerId", "==", buyerId));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
    orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(orders);
  }, (err) => console.error("listenHostelerOrders Error:", err));
};

export const listenDayscholarOrders = (sellerId, callback) => {
  if (!sellerId) return () => {};
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("sellerId", "==", sellerId));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
    orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(orders);
  }, (err) => console.error("listenDayscholarOrders Error:", err));
};

// ==========================================
// 4. CUSTOM FOOD REQUESTS
// ==========================================

export const createFoodRequest = async (requestData) => {
  const foodReqCol = collection(db, "foodRequests");
  const payload = {
    buyerId: requestData.buyerId,
    buyerName: requestData.buyerName || "Hosteler",
    tag: requestData.tag || "Lunch",
    isVeg: requestData.isVeg !== undefined ? requestData.isVeg : true,
    dishName: requestData.dishName || "",
    description: requestData.description || "",
    servings: Number(requestData.servings) || 1,
    price: Number(requestData.price) || 0,
    imageUrl: requestData.imageUrl || "",
    deliveryLocation: requestData.deliveryLocation || "",
    collegeName: (requestData.collegeName || "").trim(),
    neededBy: requestData.neededBy || "Asap",
    status: "Pending",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(foodReqCol, payload);
  return { _id: docRef.id, id: docRef.id, ...payload };
};

export const getPendingFoodRequests = async (collegeName) => {
  if (!collegeName) return [];
  const foodReqCol = collection(db, "foodRequests");
  const q = query(
    foodReqCol, 
    where("collegeName", "==", collegeName.trim()),
    where("status", "==", "Pending")
  );
  const snap = await getDocs(q);
  const reqs = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return reqs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getMyFoodRequests = async (buyerId) => {
  if (!buyerId) return [];
  const foodReqCol = collection(db, "foodRequests");
  const q = query(foodReqCol, where("buyerId", "==", buyerId));
  const snap = await getDocs(q);
  const reqs = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return reqs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const acceptFoodRequest = async (requestId, dayscholar) => {
  const reqDocRef = doc(db, "foodRequests", requestId);
  const snap = await getDoc(reqDocRef);
  if (!snap.exists()) throw new Error("Request not found");
  const reqData = snap.data();

  // 1. Mark request as Accepted
  await updateDoc(reqDocRef, {
    status: "Accepted",
    acceptedBy: dayscholar._id || dayscholar.uid,
    acceptedByName: dayscholar.name,
    acceptedAt: serverTimestamp(),
  });

  // 2. Automatically spawn an active Order for fulfillment
  const newOrder = await createOrder({
    buyerId: reqData.buyerId,
    buyerName: reqData.buyerName,
    sellerId: dayscholar._id || dayscholar.uid,
    dishName: reqData.dishName,
    price: reqData.price,
    imageUrl: reqData.imageUrl,
    deliveryLocation: reqData.deliveryLocation,
    neededBy: reqData.neededBy,
  });

  return newOrder;
};

export const deleteFoodRequest = async (requestId) => {
  if (!requestId) return;
  const reqDocRef = doc(db, "foodRequests", requestId);
  await deleteDoc(reqDocRef);
};

export const listenCollegeFoodRequests = (collegeName, callback) => {
  if (!collegeName) return () => {};
  const foodReqCol = collection(db, "foodRequests");
  const q = query(
    foodReqCol, 
    where("collegeName", "==", collegeName.trim()),
    where("status", "==", "Pending")
  );
  return onSnapshot(q, (snap) => {
    const reqs = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
    reqs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(reqs);
  }, (err) => console.error("listenCollegeFoodRequests Error:", err));
};

// ==========================================
// 5. REVIEWS & RATINGS
// ==========================================

export const createReview = async (reviewData) => {
  const reviewsCol = collection(db, "reviews");
  const payload = {
    reviewer: reviewData.reviewer,
    reviewerName: reviewData.reviewerName || "Student",
    reviewedUser: reviewData.reviewedUser,
    orderId: reviewData.orderId,
    meal: reviewData.meal || null,
    rating: Number(reviewData.rating) || 5,
    comment: reviewData.comment || "",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(reviewsCol, payload);
  return { _id: docRef.id, id: docRef.id, ...payload };
};

export const getSellerReviews = async (sellerId) => {
  if (!sellerId) return [];
  const reviewsCol = collection(db, "reviews");
  const q = query(reviewsCol, where("reviewedUser", "==", sellerId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return reviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getSellerStats = async (sellerId) => {
  const reviews = await getSellerReviews(sellerId);
  const total = reviews.length;
  if (total === 0) {
    return { averageRating: 4.8, totalReviews: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = Number((sum / total).toFixed(1));
  return { averageRating: avg, totalReviews: total };
};

export const getMyReviews = async (reviewerId) => {
  if (!reviewerId) return [];
  const reviewsCol = collection(db, "reviews");
  const q = query(reviewsCol, where("reviewer", "==", reviewerId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));
  return reviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

// ==========================================
// 6. ADMIN & HIERARCHICAL GOVERNANCE
// ==========================================

export const createAdminAccount = async ({ email, password, name, role, assignedState, phone }) => {
  const tempAppName = "AdminCreationApp_" + Date.now();
  const secondaryApp = initializeApp(firebaseConfig, tempAppName);
  try {
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
    const newUid = cred.user.uid;

    const adminProfile = {
      uid: newUid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "state_head", // 'founder' | 'national_head' | 'state_head'
      assignedState: (role === "founder" || role === "national_head") ? "ALL" : (assignedState || "ALL").trim(),
      phone: phone ? phone.trim() : "",
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || "system",
      createdByName: auth.currentUser?.displayName || "Founder & CEO",
    };

    await setDoc(doc(db, "users", newUid), adminProfile);
    return { _id: newUid, id: newUid, ...adminProfile };
  } finally {
    await deleteApp(secondaryApp);
  }
};

export const getAdminTeam = async (filterState = "ALL") => {
  const usersCol = collection(db, "users");
  const snap = await getDocs(usersCol);
  const team = [];
  snap.forEach((d) => {
    const data = d.data();
    if (["founder", "national_head", "state_head"].includes(data.role)) {
      team.push({ _id: d.id, id: d.id, ...data });
    }
  });

  if (filterState && filterState !== "ALL") {
    return team.filter((m) => m.assignedState === filterState || m.assignedState === "ALL");
  }
  return team.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateAdminStatus = async (uid, status) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    status: status,
    updatedAt: serverTimestamp()
  });
};

export const updateAdminState = async (uid, assignedState) => {
  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, {
    assignedState: assignedState.trim(),
    updatedAt: serverTimestamp()
  });
};

export const bootstrapFounderAccount = async (uid, email, name) => {
  const userDocRef = doc(db, "users", uid);
  const payload = {
    role: "founder",
    assignedState: "ALL",
    status: "active",
    name: name || "Founder & CEO",
    email: email.trim().toLowerCase(),
    updatedAt: serverTimestamp()
  };
  await setDoc(userDocRef, payload, { merge: true });
  return { _id: uid, uid, ...payload };
};

export const getAllOrdersForAdmin = async (filterState = "ALL") => {
  const ordersCol = collection(db, "orders");
  const snap = await getDocs(ordersCol);
  let orders = snap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

  if (filterState && filterState !== "ALL") {
    orders = orders.filter(o => (o.state || "").toLowerCase() === filterState.toLowerCase());
  }
  return orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllUsersForAdmin = async (filterState = "ALL") => {
  const usersCol = collection(db, "users");
  const snap = await getDocs(usersCol);
  let users = snap.docs.map(d => ({ _id: d.id, id: d.id, ...d.data() }));

  if (filterState && filterState !== "ALL") {
    users = users.filter(u => (u.state || "").toLowerCase() === filterState.toLowerCase());
  }
  return users.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAdminMetrics = async (filterState = "ALL") => {
  const [ordersSnap, mealsSnap, usersSnap, reviewsSnap] = await Promise.all([
    getDocs(collection(db, "orders")),
    getDocs(collection(db, "meals")),
    getDocs(collection(db, "users")),
    getDocs(collection(db, "reviews"))
  ]);

  let orders = ordersSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  let meals = mealsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  let users = usersSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  let reviews = reviewsSnap.docs.map(d => ({ _id: d.id, ...d.data() }));

  if (filterState && filterState !== "ALL") {
    const norm = filterState.toLowerCase();
    orders = orders.filter(o => (o.state || "").toLowerCase() === norm);
    meals = meals.filter(m => (m.state || "").toLowerCase() === norm);
    users = users.filter(u => (u.state || "").toLowerCase() === norm);
    const validOrderIds = new Set(orders.map(o => o._id));
    reviews = reviews.filter(r => validOrderIds.has(r.orderId));
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "Delivered").length;
  const activeOrders = orders.filter(o => !["Delivered", "Declined"].includes(o.status)).length;
  const totalRevenue = orders
    .filter(o => o.status === "Delivered")
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  const dayscholarsCount = users.filter(u => u.role === "dayscholar").length;
  const hostelersCount = users.filter(u => u.role === "hosteler").length;
  const activeMealsCount = meals.length;

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1))
    : 4.9;

  const verifiedProofsCount = orders.filter(o => o.cookingProofImageUrl || o.handoverProofImageUrl).length;

  // College breakdowns & leaderboard
  const collegeMap = {};
  users.forEach(u => {
    if (u.collegeName) {
      collegeMap[u.collegeName] = (collegeMap[u.collegeName] || 0) + 1;
    }
  });

  return {
    totalOrders,
    completedOrders,
    activeOrders,
    totalRevenue,
    dayscholarsCount,
    hostelersCount,
    activeMealsCount,
    totalUsers: users.length,
    avgRating,
    totalReviews,
    verifiedProofsCount,
    collegesCovered: Object.keys(collegeMap).length,
    collegeMap
  };
};

export const getFlaggedReviews = async (filterState = "ALL") => {
  const reviewsCol = collection(db, "reviews");
  const snap = await getDocs(reviewsCol);
  const lowReviews = snap.docs
    .map(d => ({ _id: d.id, ...d.data() }))
    .filter(r => Number(r.rating) <= 3);

  return lowReviews.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

