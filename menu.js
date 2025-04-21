// ========================== Firebase Imports ==========================
import { auth, db } from './index.js';
import { getDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

// ========================== Global Variables ==========================
let cartItems = JSON.parse(localStorage.getItem("cart-items")) || [];
let total = 0;
let itemCount = 0;
let foodTime = 0;

// ========================== DOMContentLoaded ==========================
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById("cart-icon");
    const cartModel = document.querySelector(".navbar-brand.cart-tab");
    const cartClose = document.querySelector(".cart-close-btn");

    cartIcon.onclick = () => {
        cartModel.classList.add("open-cart");
    };

    cartClose.onclick = () => {
        cartModel.classList.remove("open-cart");
    };
});

// ========================== Window Load ==========================
window.onload = async function () {
    updateCartCount(); // Only update the cart count initially
};

// ========================== Firebase Authentication Listener ==========================
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in:", user);
        syncCartWithFirebase(); // Sync cart after user is detected
    } else {
        console.log("No user is signed in");
    }
});

// ========================== Cart Functions ==========================
window.addItem = addItem;
function addItem(card) {
    const name = card.querySelector('.menu-title').textContent;
    const time = card.querySelector('.prep-time').textContent
        .replace('minutes', '')
        .trim();
    const priceText = card.querySelector('.menu-price').textContent
        .replace('.', '')
        .replace('VND', '')
        .trim();

    const price = parseInt(priceText);
    const preptime = parseInt(time);
    const prodImg = card.querySelector('.menu-image').src;

    const existingItem = cartItems.find((item) => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            name,
            price,
            preptime,
            quantity: 1,
            img: prodImg
        });
    }

    updateLocalStorage();
    updateCartCount();
}

window.changeQuantity = changeQuantity;
function changeQuantity(name, delta) {
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

window.removeItem = removeItem;
function removeItem(name) {
    cartItems = cartItems.filter((item) => item.name !== name);
    updateLocalStorage();
    updateCartCount();
}

window.updateLocalStorage = updateLocalStorage;
async function updateLocalStorage() {
    localStorage.setItem("cart-items", JSON.stringify(cartItems));
    const user = auth.currentUser;
    if (!user) {
        console.log("User not authenticated");
        return;
    }
    const userCartRef = doc(db, "users", user.uid);
    await setDoc(userCartRef, { cartItems }, { merge: true });
}

window.updateCartCount = updateCartCount;
function updateCartCount() {
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total-price");
    const countElement = document.getElementById("cart-count");
    const timeElement = document.getElementById("total-time");

    cartList.innerHTML = "";
    total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    foodTime = cartItems.reduce((sum, item) => sum + item.preptime * item.quantity, 0);
    localStorage.setItem("foodTime", JSON.stringify(foodTime));

    cartItems.forEach((item) => {
        const li = document.createElement("li");
        li.classList = "cart-items";
        li.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="cart-item-image" />
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${item.price.toLocaleString("de-DE")} x ${item.quantity}</div>
            </div>
            <div class="quantity-controls">
              <button onclick="changeQuantity('${item.name}', 1)">+</button>
              <button onclick="changeQuantity('${item.name}', -1)">-</button>
            </div>
            <button class="remove-item" onclick="removeItem('${item.name}')">x</button>
        `;
        cartList.appendChild(li);
    });

    totalElement.textContent = total.toLocaleString("de-DE");
    countElement.textContent = itemCount;
    timeElement.textContent = foodTime;
}

// ========================== Checkout Function ==========================
document.getElementById("checkout").onclick = async () => {
    const distanceTimeElement = document.getElementById("distance&time");
    
    if (window.location.pathname !== "/foodpaymentsystem/index.html") {
        alert("Please checkout from the home page.");
        return;
    }
    if (!distanceTimeElement.innerHTML) {
        alert("Please show your location to checkout.");
        return;
    }
    try {
        // Check if the user is authenticated
        const user = auth.currentUser;
        if (!user) {
            alert("Please sign in to complete your order.");
            return;
        }

        // Retrieve distance and travel time from localStorage
        const userData = JSON.parse(localStorage.getItem("userData"));
        const foodTime = JSON.parse(localStorage.getItem("foodTime")) || 0;
        const distance = userData.distance || 0; // Default to 0 if not available
        const travelTime = JSON.parse(localStorage.getItem("travelTime")) || 0;
        const previousFoodTime = JSON.parse(localStorage.getItem("previousFoodTime")) || 0;
        // Save the food time to localStorage
        localStorage.setItem("previousFoodTime", previousFoodTime + foodTime);
        console.log("Order placed successfully!");
        distanceTimeElement.innerHTML = `Distance: ${distance.toFixed(2)} meters<br>Total Time: ${formatDuration(travelTime+ (foodTime + previousFoodTime) * 60)}`;
        // Clear the cart in Firebase
        const userCartRef = await doc(db, "users", user.uid);
        await setDoc(userCartRef, { cartItems: [] }, { merge: true });
        // Clear the cart locally
        localStorage.removeItem("cart-items");
        cartItems = [];
        updateCartCount();
    } catch (error) {
        console.error("Error during checkout:", error);
        alert(`An error occurred during checkout: ${error.message}. Please try again.`);
    }
};

// ========================== Sync Cart with Firebase ==========================
async function syncCartWithFirebase() {
    const user = auth.currentUser; // Use auth.currentUser to get the signed-in user
    if (!user) {
        console.log("User not authenticated");
        return;
    }

    try {
        const userCartRef = doc(db, "users", user.uid);
        const userCartSnapshot = await getDoc(userCartRef);

        if (userCartSnapshot.exists()) {
            const firebaseCartItems = userCartSnapshot.data().cartItems || [];

            // Replace local cart items with Firebase cart items
            cartItems = firebaseCartItems;

            // Update local storage and UI
            updateLocalStorage();
            updateCartCount();
        } else {
            console.log("No cart data found in Firebase");
        }
    } catch (error) {
        console.error("Error syncing cart with Firebase:", error);
    }
}

// ========================== Helper Functions ==========================
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainedSeconds = Math.round(seconds - minutes * 60);
    if (minutes < 60) {
        return `${minutes} mins and ${remainedSeconds} seconds`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} mins`;
    }
}