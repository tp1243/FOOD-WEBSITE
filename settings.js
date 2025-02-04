import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBk0CruJ4YLcA1nPMMa2slSKbeojxW2-R8",
  authDomain: "login-example-528be.firebaseapp.com",
  projectId: "login-example-528be",
  storageBucket: "login-example-528be.firebasestorage.app",
  messagingSenderId: "861134293236",
  appId: "1:861134293236:web:c7ede80eeb3cb0d676f6a1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get the user data from localStorage
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  document.getElementById("user-name").textContent = user.displayName || "No name provided";
  document.getElementById("user-email").textContent = user.email;
} else {
  alert("No user logged in");
  window.location.href = "login.html";
}

// Logout functionality
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", function () {
  signOut(auth)
    .then(() => {
      // Clear the user data from localStorage
      localStorage.removeItem("user");
      alert("Logged out successfully.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Logout error:", error.message);
      alert("Error logging out");
    });
});
