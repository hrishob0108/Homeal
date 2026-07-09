const express = require("express");
const router = express.Router();
const {
  createFoodRequest,
  getPendingFoodRequests,
  getMyFoodRequests,
  cancelFoodRequest,
  acceptFoodRequest
} = require("../controllers/foodRequestController");
const { protect } = require("../middleware/authMiddleware");

// All routes are private
router.post("/", protect, createFoodRequest);
router.get("/pending", protect, getPendingFoodRequests);
router.get("/my-requests", protect, getMyFoodRequests);
router.delete("/:id", protect, cancelFoodRequest);
router.put("/:id/accept", protect, acceptFoodRequest);

module.exports = router;
