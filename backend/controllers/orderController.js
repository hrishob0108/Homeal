const Order = require("../models/Order");

// @desc    Create a new order (Hosteler -> Dayscholar)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { sellerId, mealId, dishName, price, deliveryLocation, neededBy } = req.body;

  if (req.user.role !== "hosteler") {
    return res.status(403).json({ message: "Only hostelers can create orders." });
  }

  try {
    const order = new Order({
      buyerId: req.user._id,
      buyerName: req.user.name,
      sellerId,
      mealId,
      dishName,
      price,
      deliveryLocation,
      neededBy,
      status: "Pending"
    });

    const savedOrder = await order.save();
    req.io.to(sellerId).emit('new_order_request', savedOrder);
    res.status(201).json(savedOrder);
  } catch (err) {
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
  const { status, proofImageUrl } = req.body;

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

    if(status) order.status = status;
    if(proofImageUrl) order.proofImageUrl = proofImageUrl;

    const updatedOrder = await order.save();
    req.io.to(order.buyerId.toString()).emit('order_status_updated', updatedOrder);
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getDayscholarRequests, updateOrderStatus };
