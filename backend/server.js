const express = require('express');
const http = require('http'); // Required for socket.io
const { Server } = require('socket.io');
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
const server = http.createServer(app); // Wrap express app
const PORT = process.env.PORT || 5001; // Match frontend default port

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", // Allow all in dev, restrict in prod
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Running');
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use("/api/users", userRoutes);
app.use("/api/meals",mealRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/auth", otpRoutes);
app.use("/api/orders", orderRoutes);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
