const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { protect } = require("../middleware/auth");

// Create a review
router.post("/", protect, async (req, res) => {
    try {
        const { reviewedUser, meal, rating, comment } = req.body;

        // Check if already reviewed this meal? (Optional logic)

        const newReview = new Review({
            reviewer: req.user._id,
            reviewedUser,
            meal,
            rating,
            comment,
        });

        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (err) {
        res.status(500).json({ error: "Error creating review", details: err.message });
    }
});

// Get reviews for a user
router.get("/user/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ reviewedUser: req.params.id })
            .populate("reviewer", "username")
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: "Error fetching reviews", details: err.message });
    }
});

module.exports = router;
