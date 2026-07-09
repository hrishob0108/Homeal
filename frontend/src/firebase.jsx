import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: "AIzaSyACU6qzo6IheSDPQBKzYLzqNo0jF3rPJmI",
  authDomain: "foodler-6e549.firebaseapp.com",
  projectId: "foodler-6e549",
  storageBucket: "foodler-6e549.firebasestorage.app",
  messagingSenderId: "897932079039",
  appId: "1:897932079039:web:9d76b1458a89a893d5fb0a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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
    <button
      onClick={sign}
      className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 text-gray-700 font-medium rounded-lg py-2.5 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google logo"
        className="w-5 h-5"
      />
      Sign in with Google
    </button>
  );
}

export default GOO;
