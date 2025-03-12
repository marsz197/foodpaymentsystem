 //import { getFirestore, collection, addDoc, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'
//import { app } from "../index.js"


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




