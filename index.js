// ========================== Firebase Initialization ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js';
import { getFirestore, getDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

// Load environment variables (only for local development)
if (typeof process !== "undefined" && process.env) {
  require("dotenv").config();
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCV49Xr9GECNH5O9jWt0Nib4AyWNPxXUkA",
  authDomain: "food-payment-sys-firebase-app.firebaseapp.com",
  databaseURL: "https://food-payment-sys-firebase-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "food-payment-sys-firebase-app",
  storageBucket: "food-payment-sys-firebase-app.firebasestorage.app",
  messagingSenderId: "1041294912760",
  appId: "1:1041294912760:web:576bb9348325d840359f0d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// ========================== Password Toggle ==========================
document.addEventListener('DOMContentLoaded', function () {
  const passwordButtons = document.getElementsByClassName('toggle-password');

  Array.from(passwordButtons).forEach(button => {
    button.addEventListener('click', togglePassword);
  });

  function togglePassword() {
    const passwordField = document.getElementById('password');
    const eyeIcon = document.getElementById('eye_icon');

    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      passwordField.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  }
});

// ========================== Signup Logic ==========================
const signupForm = document.getElementById('signup');
if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate password
    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) {
      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.innerHTML = passwordError;
      errorMessageElement.style.color = "red";
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user);

      // Display success message
      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.innerHTML = "User created successfully !!!";
      errorMessageElement.style.color = "green";

      // Save user data to Firestore
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        user_email: user.email,
        created_at: new Date().toLocaleDateString(),
        user_role: "Customer"
      });
      console.log("User saved to Firestore with ID:", docRef.id);

      // Redirect to signin page after 2 seconds
      setTimeout(() => { window.location.replace("signin.html"); }, 2000);
    } catch (error) {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorCode, errorMessage);

      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.innerHTML = `${errorCode}: ${errorMessage}`;
      errorMessageElement.style.color = "red";
    }
  });
}

// ========================== Password Validation ==========================
function validatePassword(password, confirmPassword) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (!hasUppercase) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasLowercase) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!hasNumber) {
    return "Password must contain at least one number.";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special character.";
  }
  return null; // No errors
}

// ========================== Password Strength Indicator ==========================
const passwordField = document.getElementById('password');
const passwordStrength = document.getElementById('password-strength');

if (passwordField && passwordStrength) {
  passwordField.addEventListener('input', () => {
    const password = passwordField.value;
    const strength = calculatePasswordStrength(password);

    if (strength === "Weak") {
      passwordStrength.style.color = "red";
    } else if (strength === "Moderate") {
      passwordStrength.style.color = "orange";
    } else if (strength === "Strong") {
      passwordStrength.style.color = "green";
    }

    passwordStrength.innerHTML = `Password Strength: ${strength}`;
  });
}

function calculatePasswordStrength(password) {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const conditionsMet = [hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (password.length >= 8 && conditionsMet >= 3) {
    return "Strong";
  } else if (password.length >= 6 && conditionsMet >= 2) {
    return "Moderate";
  } else {
    return "Weak";
  }
}

// ========================== Signin Logic ==========================
const signinForm = document.getElementById('signin');
if (signinForm) {
  signinForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Sign in user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user);

      // Display success message
      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.innerHTML = "User login successfully !!!";
      errorMessageElement.style.color = "green";

      // Save user ID to localStorage
      localStorage.setItem("user", JSON.stringify(user.uid));

      // Redirect to index page after 2 seconds
      setTimeout(() => { window.location.replace("index.html"); }, 2000);
    } catch (error) {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);

      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.innerHTML = `${errorCode}: ${errorMessage}`;
      errorMessageElement.style.color = "red";
    }
  });
}

// ========================== Authentication State Listener ==========================
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
    getUserData(user.uid); // Fetch user data

    const loginTextElement = document.getElementById("loginText");
    loginTextElement.innerHTML = "Sign Out";
    loginTextElement.addEventListener("click", () => {
      signOut(auth).then(() => {
        console.log("User signed out successfully");
        localStorage.clear(); // Clear all local storage
        window.location.href = "signin.html"; // Redirect to login page
      }).catch((error) => {
        console.error("Sign out error:", error);
      });
    });
  } else {
    if (window.location.pathname !== "/signin.html") {
      console.log("No user is signed in");
      alert("Please Sign In to continue");
      window.location.href = "signin.html"; // Redirect to login page
      localStorage.clear();
    }
  }
});

// ========================== Fetch User Data ==========================
async function getUserData(uid) {
  try {
    if (!uid) {
      console.error("No UID found in localStorage");
      return;
    }

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("User Data:", userSnap.data());
      return userSnap.data();
    } else {
      console.log("No such user found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}
