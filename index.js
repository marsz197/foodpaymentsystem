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
// shoppingcart js
document.addEventListener('DOMContentLoaded', () => {
  let cartIcon = document.getElementById("cart-icon");
  let cartModel = document.querySelector(".navbar-brand.cart-tab");
  let cartClose = document.querySelector(".cart-close-btn");
    
  cartIcon.onclick = () => {
    cartModel.classList.add("open-cart");
  };
  
  cartClose.onclick = () => {
    cartModel.classList.remove("open-cart");
  };
});


let cartItems = JSON.parse(localStorage.getItem("cart-items")) || [];
let total = 0;
let itemCount = 0;

window.onload = function (){updateCartCount();}


function changeQuantity (name, delta){
  const item = cartItems.find((item) => item.name === name);
  
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeItem(name);
    } else {
      updateLocalStorage();
      updateCartCount();
    }
  }
}



function addItem (card) {
  const name = card.querySelector('.menu-title').textContent;
  const priceText =  card.querySelector('.menu-price').textContent
  .replace('.', '')
  .replace('VND', '')
  .trim();
  const price = parseInt(priceText)
  const prodImg = card.querySelector('.menu-image').src;
  
  const existingItem = cartItems.find((item) => item.name === name)
  if (existingItem)  {
    existingItem.quantity += 1
  }else {
    cartItems.push({
      name,
      price,
      quantity: 1,
      img: prodImg
    });
  }

  updateLocalStorage();
  updateCartCount();
}

//Keep food on refresh
function updateLocalStorage () {
  localStorage.setItem("cart-items", JSON.stringify(cartItems));
}

//Cart display
function updateCartCount() {
  const cartList = document.getElementById("cart-items");
  const totalElement = document.getElementById("total-price");
  const countElement = document.getElementById("cart-count")

  cartList.innerHTML  = '';
  total = cartItems.reduce((sum,item) => sum + item.price * item.quantity, 0)
  itemCount = cartItems.reduce((count, item) => count + item.quantity, 0) 

  cartItems.forEach(item => {
    const li = document.createElement("li");
    li.classList = 'cart-items';
    li.innerHTML = `
      <img src="${item.img}" alt="${item.name}" class="cart-item-image" />
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price.toLocaleString('de-DE')} x ${item.quantity}</div>
      </div>

      <div class="quantity-controls">
        <button onclick="changeQuantity('${item.name}', 1)">+</button>
        <button onclick="changeQuantity('${item.name}', -1)">-</button>
      </div>
      <button class="remove-item" onclick="removeItem('${item.name}')">x</button>
      `;
    cartList.appendChild(li);


  });
  totalElement.textContent = total.toLocaleString('de-DE');
  countElement.textContent = itemCount;
} 

function removeItem(name) {
  cartItems = cartItems.filter((item) => item.name !== name);
  updateLocalStorage();
  updateCartCount();
}


// Initialize cart
const cart = new ShoppingCart();

// Menu card functionality
function initializeMenuCards() {
  const menuCards = document.querySelectorAll('.menu-card');
  
  menuCards.forEach(card => {
    // Add hover effect to entire card
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });
}

// Cart button functionality
function toggleCart(button) {
  const menuCard = button.closest('.menu-card');
  const menuTitle = menuCard.querySelector('.menu-title').textContent;
  const menuPrice = menuCard.querySelector('.menu-price').textContent;
  
  button.classList.toggle('active');
  
  const isActive = button.classList.contains('active');
  button.textContent = isActive ? 'Remove from Cart' : 'Add to Cart';
  
  // Add ripple effect
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  button.appendChild(ripple);
  const rect = button.getBoundingClientRect();
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  
  setTimeout(() => ripple.remove(), 1000);

  // Update cart
  if (isActive) {
    cart.addItem({
      id: Date.now(),
      title: menuTitle,
      price: menuPrice
    });
  } else {
    cart.removeItem({
      title: menuTitle,
      price: menuPrice
    });
  }
}




