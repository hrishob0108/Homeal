const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getDayscholarRequests, updateOrderStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// /api/orders
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/requests", protect, getDayscholarRequests);
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;
