const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buyerName: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: "Meal", required: true },
    dishName: { type: String, required: true },
    price: { type: Number, required: true },
    deliveryLocation: { type: String, required: true },
    neededBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Declined", "Preparing", "Out for Delivery", "Delivered"],
      default: "Pending"
    },
    proofImageUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
