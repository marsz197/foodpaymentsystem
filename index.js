// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js'
import { getFirestore, collection, addDoc, getDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'


// Load environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCV49Xr9GECNH5O9jWt0Nib4AyWNPxXUkA",
  authDomain: "food-payment-sys-firebase-app.firebaseapp.com",
  projectId: "food-payment-sys-firebase-app",
  storageBucket: "food-payment-sys-firebase-app.firebasestorage.app",
  messagingSenderId: "1041294912760",
  appId: "1:1041294912760:web:576bb9348325d840359f0d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db};
// password-toggle
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

// signup and signin
const signupForm = document.getElementById('signup');
if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user);
      document.getElementById('error-message').innerHTML = "User created successfully !!!"
      document.getElementById('error-message').style.color = "green"

      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        user_email: user.email,
        created_at: new Date().toLocaleDateString(),
        user_role: "Customer"
      });
      console.log("User saved to Firestore with ID:", docRef.id);

      setTimeout(() => { window.location.replace("signin.html") }, 4000)
      // Redirect to a success page or handle user creation successfully.
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorCode, errorMessage);
      document.getElementById('error-message').innerHTML = errorCode + errorMessage;
      document.getElementById('error-message').style.color = "red"
    }
  });
}

const signinForm = document.getElementById('signin');
if (signinForm) {
  signinForm.addEventListener('submit', async (event) => {
    console.log("Submited")
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user);
      document.getElementById('error-message').innerHTML = "User login successfully !!!"
      document.getElementById('error-message').style.color = "green"
      localStorage.setItem("user", JSON.stringify(user.uid))
      setTimeout(() => { window.location.replace("index.html") }, 4000)
      // Redirect to the app's main content or a user dashboard.
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
      document.getElementById('error-message').innerHTML = errorCode + errorMessage;
      // Display an error message to the user.  Common errors include wrong password, etc.
    }
  });
}
//get user
auth.onAuthStateChanged((user) => {
  if (user) {
    getUserData(user.uid);
    document.getElementById("loginText").innerHTML = "Sign Out"
    document.getElementById("loginText").addEventListener("click", () => {
      signOut(auth).then(() => {
        console.log("User signed out successfully");
        localStorage.removeItem("user"); // Clear user data
        window.location.href = "signin.html"; // Redirect to login page
      }).catch((error) => {
        console.error("Sign out error:", error);
      });
    })
  }else{
    document.getElementById("loginText").innerHTML = "Sign In"
    document.getElementById("loginText").addEventListener("click", () => {
      window.location.href = "signin.html"; 
    })
    localStorage.clear()
  }
});
//signout 
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
