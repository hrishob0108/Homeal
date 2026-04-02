# 🚀 Homeal Deployment Guide (A-Z)

This guide explains how to deploy the **Homeal** application to production using **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

## 1. 📂 Database: MongoDB Atlas
Since your backend uses a local database, you need to move it to the cloud.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (You've already done this! ✅).
2.  Your **Connection String** is: `mongodb+srv://hrishob_db_user:hrishobp@cluster0.2sn3i3m.mongodb.net/homeal`
3.  Ensure you go to **Network Access** and select **Allow Access from Anywhere** (IP `0.0.0.0/0`) so Render can connect.

---

## 2. 🖥️ Backend: Render
1.  Push your code to **GitHub**.
2.  Log in to [Render](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Set the following:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
6.  Go to the **Environment** tab and add these variables:
    *   `MONGO_URI`: (Your MongoDB Atlas string from Step 1)
    *   `JWT_SECRET`: (Any long random string)
    *   `EMAIL_USER`: (Your Gmail address)
    *   `EMAIL_PASS`: (Your Google App Password)
    *   `FRONTEND_URL`: (Your Vercel URL - *Update this later after Step 3*)
7.  Click **Deploy**. Copy your Render URL (e.g., `https://homeal-backend.onrender.com`).

---

## 3. 🌐 Frontend: Vercel
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  Set the following:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Under **Environment Variables**, add:
    *   `VITE_API_URL`: (Your Render URL + `/api`, e.g., `https://homeal-backend.onrender.com/api`)
6.  Click **Deploy**.

---

## 🔗 Final Step: Link them together
1.  Once Vercel gives you your frontend URL (e.g., `https://homeal.vercel.app`), go back to your **Render** dashboard.
2.  Update the `FRONTEND_URL` environment variable to match your Vercel URL exactly.
3.  Restart your Render service.

**Everything is now live! 🎉**

# hello world 
