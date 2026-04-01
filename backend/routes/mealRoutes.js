const express = require("express");
const router = express.Router();
const { getMeals, createMeal, updateMeal, deleteMeal } = require("../controllers/mealController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getMeals); // Public feed
router.post("/", protect, createMeal);
router.put("/:id", protect, updateMeal);
router.delete("/:id", protect, deleteMeal);

module.exports = router;
