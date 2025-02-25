// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getActiveResourcesInfo } from "process";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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


