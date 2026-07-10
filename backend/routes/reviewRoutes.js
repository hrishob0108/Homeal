const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");

// Create a review
router.post("/", protect, async (req, res) => {
    try {
        const { reviewedUser, orderId, meal, rating, comment } = req.body;

        if (!reviewedUser || !orderId || !rating || !comment) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // Check if already reviewed this order
        const existingReview = await Review.findOne({ orderId, reviewer: req.user._id });
        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this order." });
        }

        const newReview = new Review({
            reviewer: req.user._id,
            reviewedUser,
            orderId,
            meal,
            rating,
            comment,
        });

        const savedReview = await newReview.save();

        if (req.io) {
            req.io.to(reviewedUser.toString()).emit("new_review_received", savedReview);
        }

        res.status(201).json(savedReview);
    } catch (err) {
        res.status(500).json({ error: "Error creating review", details: err.message });
    }
});

// Get reviews written by the logged-in user
router.get("/my-reviews", protect, async (req, res) => {
    try {
        const reviews = await Review.find({ reviewer: req.user._id });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: "Error fetching my reviews", details: err.message });
    }
});

// Get reviews for a specific user (seller)
router.get("/user/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ reviewedUser: req.params.id })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: "Error fetching reviews", details: err.message });
    }
});

// Get rating statistics (average, count) for a specific user (seller)
router.get("/seller/:id/stats", async (req, res) => {
    try {
        const reviews = await Review.find({ reviewedUser: req.params.id });
        if (reviews.length === 0) {
            return res.status(200).json({ averageRating: 0, totalReviews: 0 });
        }
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        res.status(200).json({ averageRating: Number(averageRating), totalReviews: reviews.length });
    } catch (err) {
        res.status(500).json({ error: "Error fetching rating statistics", details: err.message });
    }
});

module.exports = router;
