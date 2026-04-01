// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const userRoutes = require("./routes/userRoutes")
const mealRoutes = require("./routes/mealRoutes")
const authRoutes = require("./routes/authRoutes")
const otpRoutes = require("./routes/otpRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Running');
});

app.use("/api/users", userRoutes);
app.use("/api/meals",mealRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/auth", otpRoutes);
app.use("/api/orders", orderRoutes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
