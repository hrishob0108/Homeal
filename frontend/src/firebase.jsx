import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function GOO() {
  const navigate = useNavigate();

  const sign = () => {
    signInWithPopup(auth, provider)
      .then(async (res) => {
        const userData = {
          name: res.user.displayName,
          email: res.user.email,
          photo: res.user.photoURL,
        };

        try {
          // Attempt auth with backend without specifying role to see if user exists
          const response = await api.post("/auth/google", { name: userData.name, email: userData.email });
          if (response.status === 200 || response.status === 201) {
            sessionStorage.setItem("currentUser", JSON.stringify(response.data));
            navigate("/dashboard");
          }
        } catch (err) {
          if (err.response && err.response.status === 400 && err.response.data.message === "Role is required for new Google users") {
            sessionStorage.setItem("googleUser", JSON.stringify(userData));
            navigate("/select-role");
          } else {
            console.error("Google Sign-In Auth Error:", err);
            toast.error(err.response?.data?.message || "Failed to authenticate with backend.");
          }
        }
      })
      .catch((err) => console.error("Google Sign-In Error:", err));
  };

  return (
    <motion.button
      onClick={sign}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      className="w-full bg-[#FFF5EA] hover:bg-white text-gray-800 font-bold py-2.5 rounded-[14px] flex items-center justify-center gap-2.5 shadow-sm transition-all duration-300 cursor-pointer text-sm"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      Google
    </motion.button>
  );
}

export default GOO;
