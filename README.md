# Cravyo — Premium Campus Peer-to-Peer Food Sharing Platform

Cravyo is a web-based, peer-to-peer campus food-sharing platform designed to connect **Hostelers** craving authentic, home-cooked food with **Dayscholars** who bring fresh meals from home. The platform resolves the monotony of daily mess meals by providing a warm, community-driven taste network right at college campuses.

---

## 🍱 Project Overview & Workflow

Cravyo divides campus food-sharing into two streamlined, intuitive dashboards:

1. **Hostelers (Buyers)**:
   - Browse the real-time campus feed of fresh, home-cooked dishes.
   - Submit custom food requests specifying description, target budget, delivery location, and needed-by time.
   - Monitor multiple active orders concurrently via vertical progress trackers.
   - Rate providers and leave community reviews after successful delivery.

2. **Dayscholars (Sellers)**:
   - Publish home-cooked dishes onto the campus feed with Veg/Non-Veg classifications, pricing, and custom tags.
   - View, accept, or decline live custom requests posted by hostelers.
   - Manage order cooking states (Preparing, Out for Delivery, Delivered) and upload delivery photo proofs.
   - Track monthly earnings, overall ratings, and review feedback.

---

## ✨ Key Features

- **Dual Dashboard Layouts**: Toggle roles in a single click with tailored states—brick-red styling for Hostelers and warm-gold styling for Dayscholars.
- **WebSocket Live Sync**: Experience zero page reloads. Sockets dynamically propagate new dish listings, order state progress, custom hosteler requests, and system-wide alerts.
- **Concurrent Order Tracking**: Hostelers can track all of their active cravings simultaneously in real-time.
- **Aesthetic Premium Design**: Features sleek glassmorphic components, warm backgrounds, customized scrollbars, floating organic leaf/flower animations, and glowing Veg/Non-Veg indicators.
- **Secure Phone Validation**: Enforces standard 10-digit phone registration to enable safe, prompt courier contact on delivery.
- **Delivery Proof Uploads**: Integrates Cloudinary to let day-scholars upload photo proofs before finalizing delivery.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js (Vite)
  - Tailwind CSS v4 Theme variables
  - Framer Motion (Transitions and background float particles)
  - React Icons
  - Socket.io-client

- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose schemas
  - Socket.io engine
  - Firebase Admin SDK authentication

---

## 📁 Repository Structure

```
├── backend/                  # Node/Express API Server
│   ├── config/               # Database and Auth configs
│   ├── controllers/          # Business logic handlers (auth, meals, orders)
│   ├── models/               # MongoDB models (User, Meal, Order)
│   ├── routes/               # Express routing end-points
│   └── server.js             # Server initialization & socket server
│
└── frontend/                 # React client application
    ├── src/
    │   ├── components/       # Shared modals and layout items
    │   ├── context/          # Context hooks (Sockets, etc.)
    │   ├── pages/            # Application routes (Home, Login, Register, Dashboards)
    │   ├── services/         # Axios API connection
    │   ├── index.css         # Tailwind directives and utility classes
    │   └── main.jsx          # Entry point
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB instance running
- Firebase project configured

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environmental variables in a `.env` file (e.g., `PORT`, `MONGO_URI`, Cloudinary settings).
4. Start the backend server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🔗 Live Deployment
- **Platform link**: [Render Link](https://homeal.onrender.com)