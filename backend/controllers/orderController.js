const Order = require("../models/Order");

// @desc    Create a new order (Hosteler -> Dayscholar)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  let { sellerId, cookId, mealId, dishName, price, deliveryLocation, neededBy } = req.body;

  if (req.user.role !== "hosteler") {
    return res.status(403).json({ message: "Only hostelers can create orders." });
  }

  try {
    let finalSellerId = sellerId || cookId;
    let finalDishName = dishName;
    let finalPrice = price;

    if (mealId) {
      const Meal = require("../models/Meal");
      const mealObj = await Meal.findById(mealId);
      if (mealObj) {
        if (!finalSellerId) finalSellerId = mealObj.createdBy;
        if (!finalDishName) finalDishName = mealObj.title;
        if (finalPrice === undefined || finalPrice === null) finalPrice = mealObj.price;
      }
    }

    if (finalSellerId && typeof finalSellerId === "object") {
      finalSellerId = finalSellerId._id || finalSellerId.id;
    }

    if (!finalSellerId) {
      return res.status(400).json({ message: "Seller ID could not be identified for this order." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = new Order({
      buyerId: req.user._id,
      buyerName: req.user.name,
      sellerId: finalSellerId,
      mealId: mealId || null,
      dishName: finalDishName || "Home-Cooked Meal",
      price: finalPrice || 0,
      deliveryLocation: deliveryLocation || "Hostel Room Delivery",
      neededBy: neededBy || "Asap",
      status: "Pending",
      otp: otp
    });

    const savedOrder = await order.save();

    if (req.io) {
      const targetRoom = String(finalSellerId).trim();
      console.log(`[OrderController] Emitting new_order_request to seller room: ${targetRoom}`);
      req.io.to(targetRoom).emit("new_order_request", savedOrder);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// @desc    Get active orders for Hosteler
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  if (req.user.role !== "hosteler") {
    return res.status(403).json({ message: "Only hostelers can view their orders." });
  }

  try {
    const orders = await Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// @desc    Get new requests + active deliveries for Dayscholar
// @route   GET /api/orders/requests
// @access  Private
const getDayscholarRequests = async (req, res) => {
  if (req.user.role !== "dayscholar") {
    return res.status(403).json({ message: "Only dayscholars can view order requests." });
  }

  try {
    const orders = await Order.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests", error: err.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  const { status, proofImageUrl, cookingProofImageUrl, handoverProofImageUrl, otp } = req.body;

  if (req.user.role !== "dayscholar") {
    return res.status(403).json({ message: "Only dayscholars can update order status." });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restrict updates only to the assigned seller
    if (order.sellerId.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: "Not authorized to update this order: only the assigned seller can." });
    }

    if (status === 'Delivered') {
      // Verify OTP if the order has one
      if (order.otp && req.body.otp !== order.otp) {
        return res.status(400).json({ message: "Invalid Delivery OTP. Please ask the hosteler for the correct PIN." });
      }
      order.isOtpVerified = true;
    }

    if(status) order.status = status;
    if(proofImageUrl) order.proofImageUrl = proofImageUrl;
    if(cookingProofImageUrl) order.cookingProofImageUrl = cookingProofImageUrl;
    if(handoverProofImageUrl) order.handoverProofImageUrl = handoverProofImageUrl;

    const updatedOrder = await order.save();
    if (req.io) {
      const buyerRoom = String(order.buyerId).trim();
      const sellerRoom = String(order.sellerId).trim();
      console.log(`[OrderController] Emitting order_status_updated to buyer: ${buyerRoom} and seller: ${sellerRoom}`);
      req.io.to(buyerRoom).emit('order_status_updated', updatedOrder);
      req.io.to(sellerRoom).emit('order_status_updated', updatedOrder);
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getDayscholarRequests, updateOrderStatus };
