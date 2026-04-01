const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" }, // Cloudinary URL
    tag: { type: String, default: "New" }, // e.g., "Bestseller", "New"
    cookName: { type: String, required: true }, // Denormalized for fast reads
    rating: { type: Number, default: 4.8 }, // Static default for aesthetic
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Meal = mongoose.model("Meal", mealSchema);
module.exports = Meal;
