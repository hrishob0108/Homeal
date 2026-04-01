const Meal = require("../models/Meal");

// @desc    Fetch all active meals
// @route   GET /api/meals
// @access  Public
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find().sort({ createdAt: -1 });
    res.status(200).json(meals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching meals", error: err.message });
  }
};

// @desc    Create a new meal
// @route   POST /api/meals
// @access  Private (Dayscholars)
const createMeal = async (req, res) => {
  const { title, description, price, image, tag } = req.body;

  try {
    if(req.user.role !== "dayscholar") {
      return res.status(403).json({ message: "Only dayscholars can post meals." });
    }

    const newMeal = new Meal({
      title,
      description,
      price,
      image,
      tag,
      cookName: req.user.name,
      createdBy: req.user._id,
    });

    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    res.status(500).json({ message: "Error creating meal", error: err.message });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res) => {
  try {
    let meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    // Check auth
    if(meal.createdBy.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: "Not authorized to edit this meal" });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(meal);
  } catch (err) {
    res.status(500).json({ message: "Error updating meal", error: err.message });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });

    if(meal.createdBy.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: "Not authorized to delete this meal" });
    }

    await Meal.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Meal removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting meal", error: err.message });
  }
};

module.exports = { getMeals, createMeal, updateMeal, deleteMeal };
