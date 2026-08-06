const FoodRequest = require("../models/FoodRequest");
const Order = require("../models/Order");

// @desc    Create a custom food request (Hosteler only)
// @route   POST /api/food-requests
// @access  Private
const createFoodRequest = async (req, res) => {
  const { dishName, description, price, deliveryLocation, neededBy } = req.body;

  if (req.user.role !== "hosteler") {
    return res.status(403).json({ message: "Only hostelers can request food." });
  }

  if (!dishName || !price || !deliveryLocation || !neededBy) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  try {
    const foodRequest = new FoodRequest({
      buyerId: req.user._id,
      buyerName: req.user.name,
      dishName,
      description,
      price,
      deliveryLocation,
      collegeName: (req.user.collegeName || "").trim(),
      neededBy,
      status: "Pending"
    });

    const savedRequest = await foodRequest.save();

    // Broadcast the new request to all connected users (including Dayscholars)
    if (req.io) {
      req.io.emit("new_food_request", savedRequest);
    }

    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).json({ message: "Error creating custom request", error: err.message });
  }
};

// @desc    Get all pending food requests
// @route   GET /api/food-requests/pending
// @access  Private
const getPendingFoodRequests = async (req, res) => {
  try {
    const userCollege = req.user && req.user.collegeName ? req.user.collegeName.trim() : "";
    let filter = { status: "Pending" };
    if (userCollege) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = {
        status: "Pending",
        $or: [
          { collegeName: { $regex: new RegExp("^" + escapeRegex(userCollege) + "$", "i") } },
          { collegeName: "" },
          { collegeName: { $exists: false } }
        ]
      };
    }

    const pendingRequests = await FoodRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(pendingRequests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending requests", error: err.message });
  }
};

// @desc    Get my custom food requests (Hosteler only)
// @route   GET /api/food-requests/my-requests
// @access  Private
const getMyFoodRequests = async (req, res) => {
  if (req.user.role !== "hosteler") {
    return res.status(403).json({ message: "Only hostelers can view their custom requests." });
  }

  try {
    const myRequests = await FoodRequest.find({ buyerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(myRequests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your requests", error: err.message });
  }
};

// @desc    Cancel/Delete a custom food request (Hosteler only)
// @route   DELETE /api/food-requests/:id
// @access  Private
const cancelFoodRequest = async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this request" });
    }

    await FoodRequest.findByIdAndDelete(req.params.id);

    // Broadcast that request was cancelled/removed
    if (req.io) {
      req.io.emit("food_request_cancelled", { id: req.params.id });
    }

    res.status(200).json({ message: "Request cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling request", error: err.message });
  }
};

// @desc    Accept and cook a custom request (Dayscholar only)
// @route   PUT /api/food-requests/:id/accept
// @access  Private
const acceptFoodRequest = async (req, res) => {
  if (req.user.role !== "dayscholar") {
    return res.status(403).json({ message: "Only dayscholars can accept food requests." });
  }

  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "This request has already been accepted or resolved." });
    }

    // Update food request status to Accepted
    request.status = "Accepted";
    await request.save();

    // Create a corresponding Order
    const order = new Order({
      buyerId: request.buyerId,
      buyerName: request.buyerName,
      sellerId: req.user._id,
      dishName: request.dishName,
      price: request.price,
      deliveryLocation: request.deliveryLocation,
      neededBy: request.neededBy,
      status: "Accepted"
    });

    const savedOrder = await order.save();

    if (req.io) {
      // Broadcast to other Dayscholars to remove it from their custom requests feeds
      req.io.emit("food_request_accepted", { id: request._id });
      
      // Notify the Hosteler (buyer) that their request is accepted and they have a new active order
      req.io.to(request.buyerId.toString()).emit("order_status_updated", savedOrder);
    }

    res.status(200).json({ message: "Request accepted successfully", order: savedOrder });
  } catch (err) {
    res.status(500).json({ message: "Error accepting request", error: err.message });
  }
};

module.exports = {
  createFoodRequest,
  getPendingFoodRequests,
  getMyFoodRequests,
  cancelFoodRequest,
  acceptFoodRequest
};
