// Import the functions you need from the SDKs you need
<<<<<<< HEAD
import {app, auth, db} from './index.js'
import { getFirestore, collection, addDoc, getDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'

=======
>>>>>>> refs/remotes/origin/main
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
let totalTime = 0;

window.onload = function () { updateCartCount(); }

window.changeQuantity = changeQuantity
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


window.addItem = addItem
function addItem(card) {
    const name = card.querySelector('.menu-title').textContent;
    const time = card.querySelector('.prep-time').textContent
        .replace('minutes', '')
        .trim();
    const priceText = card.querySelector('.menu-price').textContent
        .replace('.', '')
        .replace('VND', '')
        .trim();

    const price = parseInt(priceText)
    const preptime = parseInt(time)
    const prodImg = card.querySelector('.menu-image').src;

    const existingItem = cartItems.find((item) => item.name === name)
    if (existingItem) {
        existingItem.quantity += 1
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
window.updateLocalStorage = updateLocalStorage
//Keep food on refresh
async function updateLocalStorage() {
    localStorage.setItem("cart-items", JSON.stringify(cartItems));
    const user = auth.currentUser;
    if (!user) {
        console.log("User not authenticated");
        return;
    }
    const userCartRef = doc(db, "users", user.uid);
    await setDoc(userCartRef, {cartItems},{merge:true});
}

//Cart display
window.updateCartCount = updateCartCount
function updateCartCount() {
    const cartList = document.getElementById("cart-items");
    const totalElement = document.getElementById("total-price");
    const countElement = document.getElementById("cart-count");
    const timeElement = document.getElementById("total-time");

    cartList.innerHTML = "";
    total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
    totalTime = cartItems.reduce((sum, item) =>  sum + item.preptime * item.quantity, 0);

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
    timeElement.textContent = totalTime;
}
window.removeItem = removeItem;
function removeItem(name) {
    cartItems = cartItems.filter((item) => item.name !== name);
    updateLocalStorage();
    updateCartCount();
}

//getTimeFunction
getTime = document.getElementById("getTime")
getTime.addEventListener("onclick",getTime())
// still working .....