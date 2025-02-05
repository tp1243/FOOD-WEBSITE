// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase Config
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
const db = getFirestore(app);

// DOM Elements
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const firstName = document.getElementById("first-name");
const email = document.getElementById("email");
const mobile = document.getElementById("mobile");
const address = document.getElementById("address");
const editBtn = document.getElementById("edit-btn");
const saveBtn = document.getElementById("save-btn");

// Get logged-in user info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userName.textContent = user.displayName || "No name provided";
    userEmail.textContent = user.email;
    email.value = user.email;

    // Fetch user data from Firebase
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      firstName.value = userSnap.data().firstName || "";
      mobile.value = userSnap.data().mobile || "";
      address.value = userSnap.data().address || "";
    }
  } else {
    window.location.href = "login.html";
  }
});

// Initially disable the fields
firstName.disabled = true;
mobile.disabled = true;
address.disabled = true;
saveBtn.disabled = true;

// Enable editing
editBtn.addEventListener("click", () => {
  firstName.disabled = false;
  mobile.disabled = false;
  address.disabled = false;
  saveBtn.disabled = false;
});

// Save to Firebase
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.value,
      mobile: mobile.value,
      address: address.value,
    }, { merge: true });

    alert("Profile updated!");
    saveBtn.disabled = true;
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
