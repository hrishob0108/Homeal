import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function GOO() {
  const navigate = useNavigate();

  const sign = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        const userData = {
          name: res.user.displayName,
          email: res.user.email,
          photo: res.user.photoURL,
        };

        // Save user in localStorage
        localStorage.setItem("googleUser", JSON.stringify(userData));

        // Check if role already exists for this user
        const existingUser = JSON.parse(localStorage.getItem("userRoles")) || {};
        const userRole = existingUser[userData.email];

        if (userRole) {
          // Redirect to correct dashboard
          navigate(`/${userRole}Dashboard`);

        } else {
          // No role yet → go to role selection page
          navigate("/select-role");
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
