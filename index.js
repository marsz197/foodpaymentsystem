  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
  import { getAuth,createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js'
  import { getFirestore, collection, addDoc, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'

  // password-toggle
  document.addEventListener('DOMContentLoaded', function() {
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

  // signup and signin
  const signupForm = document.getElementById('signup');
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
      
      const docRef = await addDoc(collection(db, "users"), {
        uid: user.uid,
        user_email: user.email,
        created_at: new Date(),
        user_role: "Customer"
      });
      console.log("User saved to Firestore with ID:", docRef.id);

      setTimeout(()=>{window.location.replace("signin.html")},4000)
      // Redirect to a success page or handle user creation successfully.
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error creating user:", errorCode, errorMessage);
      document.getElementById('error-message').innerHTML = errorCode + errorMessage;
    }
  });

  const signinForm = document.getElementById('signin');
  signinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user);
      // Redirect to the app's main content or a user dashboard.
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
      document.getElementById('error-message').innerHTML = errorCode + errorMessage;
      // Display an error message to the user.  Common errors include wrong password, etc.
    }
  });
