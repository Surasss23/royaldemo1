// Cart Management
let cart = [];

function loadCart() {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(menuItem, isFullSize) {
  const existingItem = cart.find(item => 
    item.id === menuItem.id && item.isFullSize === isFullSize
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...menuItem,
      quantity: 1,
      isFullSize
    });
  }

  saveCart();
  showToast(`${menuItem.name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function calculateTotal() {
  return cart.reduce((total, item) => 
    total + (item.isFullSize ? item.fullPrice : item.singlePrice) * item.quantity, 0
  );
}

// ✅ Google Sheet se Menu Fetch Karna
async function fetchMenuItems() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/18KZWW-SmsTMsY836kIUev_hB7Z4GRNkEW8CFTwYwDfA/gviz/tq?tqx=out:csv";

  try {
    const response = await fetch(sheetUrl);
    const data = await response.text();

    // CSV Ko Array Me Convert Karo
    const rows = data.split("\n").map(row => row.split(","));

    // Headers (Column Names) Fetch Karo
    const headers = rows[0].map(h => h.trim());

    // Data Format Karo
    const menuItems = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index].trim();
      });

      // Price values ko number me convert karo
      obj.id = Number(obj.id);
      obj.singlePrice = Number(obj.singlePrice);
      obj.fullPrice = Number(obj.fullPrice);

      return obj;
    });

    renderMenu(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    showToast("Failed to load menu items", "error");
  }
}

function renderMenu(menuItems) {
  const menuGrid = document.getElementById('menu-items');
  menuGrid.innerHTML = menuItems.map(item => `
    <div class="menu-item">
      <img src="${item.imageUrl}" alt="${item.name}">
      <div class="menu-item-content">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price-section">
          <div>
            <p>Single: ₹${item.singlePrice}</p>
            <p>Full: ₹${item.fullPrice}</p>
          </div>
          <div class="buttons">
            <button onclick='addToCart(${JSON.stringify(item)}, false)' class="button primary">
              Add Single
            </button>
            <button onclick='addToCart(${JSON.stringify(item)}, true)' class="button secondary">
              Add Full
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <p>${item.name}</p>
          <p>${item.quantity}x ${item.isFullSize ? 'Full' : 'Single'}</p>
        </div>
        <div>
          <p>₹${(item.isFullSize ? item.fullPrice : item.singlePrice) * item.quantity}</p>
          <button onclick="removeFromCart(${item.id})" class="button outline">Remove</button>
        </div>
      </div>
    `).join('');
  }

  cartTotal.textContent = `₹${calculateTotal()}`;
}

// WhatsApp Integration
function handleOrder() {
  if (cart.length === 0) {
    showToast('Please add items to cart first', 'error');
    return;
  }

  const message = cart.map(item => 
    `${item.quantity}x ${item.name} (${item.isFullSize ? 'Full' : 'Single'}) - ₹${
      (item.isFullSize ? item.fullPrice : item.singlePrice) * item.quantity
    }`
  ).join('\n');

  const phoneNumber = '+917075954214'; // Replace with actual number
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    `New Order:\n${message}\n\nTotal: ₹${calculateTotal()}`
  )}`;

  window.open(whatsappUrl);
  cart = [];
  saveCart();
}

// Utility Functions
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  cart = loadCart();
  fetchMenuItems();  // ✅ Google Sheet se data fetch hoga
  fetchReviews();
  renderCart();
});
