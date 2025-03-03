// Cart functionality
class ShoppingCart {
  constructor() {
    this.items = [];
    this.count = 0;
    this.cartCountElement = document.querySelector('.cart-count');
    this.init();
  }

  init() {
    // Load cart data from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.items = JSON.parse(savedCart);
      this.updateCartCount();
    }
  }

  addItem(item) {
    this.items.push(item);
    this.updateCartCount();
    this.saveCart();
  }

  removeItem(item) {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.items.splice(index, 1);
      this.updateCartCount();
      this.saveCart();
    }
  }

  updateCartCount() {
    this.count = this.items.length;
    if (this.cartCountElement) {
      this.cartCountElement.textContent = this.count;
      // Add animation
      this.cartCountElement.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        this.cartCountElement.style.animation = '';
      }, 500);
    }
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeMenuCards();
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }

  lastScroll = currentScroll;
});

