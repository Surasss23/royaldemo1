// ✅ Cart Management
let cart = loadCart();

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(menuItem, isFullSize) {
  const existingItem = cart.find(item => item.id === menuItem.id && item.isFullSize === isFullSize);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: menuItem.id,
      name: menuItem.name,
      quantity: 1,
      isFullSize,
      price: isFullSize ? menuItem.fullPrice : menuItem.singlePrice,
    });
  }

  saveCart();
  showToast(`🛒 Added to Cart: ${menuItem.name}`);
}

function removeFromCart(id, isFullSize) {
  cart = cart.filter(item => !(item.id === id && item.isFullSize === isFullSize));
  saveCart();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ✅ Google Sheet se Menu Fetch Karna
async function fetchMenuItems() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTe1TOsmeLBW4qqahFR_HFlYCp-XZyjKJRPyKSc63t3-7rlNmjAdBfhsHkv8hjgOZfuYkMJfFI3iOKb/pub?output=csv";

  try {
    const response = await fetch(sheetUrl);
    const data = await response.text();

    const rows = data.split("\n").map(row => row.split(","));
    const headers = rows[0].map(h => h.trim());

    const menuItems = rows.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index]?.trim();
      });
      obj.id = Number(obj.id);
      obj.singlePrice = Number(obj.singlePrice);
      obj.fullPrice = Number(obj.fullPrice);

      return obj;
    });

    renderMenu(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    showToast("⚠️ Failed to load menu items", "error");
  }
}

function renderMenu(menuItems) {
  const menuGrid = document.getElementById("menu-items");
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
            <button onclick='addToCart(${JSON.stringify(item)}, false)' class="button primary">Add Single</button>
            <button onclick='addToCart(${JSON.stringify(item)}, true)' class="button secondary">Add Full</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// ✅ Rendering Cart Properly
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty</p>";
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <p><strong>${item.name}</strong></p>
          <p>${item.quantity}x ${item.isFullSize ? "Full" : "Single"}</p>
        </div>
        <div>
          <p>₹${item.price * item.quantity}</p>
          <button onclick="removeFromCart(${item.id}, ${item.isFullSize})" class="button outline">Remove</button>
        </div>
      </div>
    `).join("");
  }

  cartTotal.textContent = `₹${calculateTotal()}`;
}

// ✅ Floating Cart Button Fix
function createFloatingCartButton() {
  const floatingButton = document.createElement("button");
  floatingButton.id = "floating-cart-button";
  floatingButton.innerHTML = "🛒 Cart";
  floatingButton.className = "floating-cart";
  floatingButton.onclick = openCart;
  document.body.appendChild(floatingButton);
}

function openCart() {
  const cartSection = document.getElementById("cart-section");
  if (cartSection) {
    cartSection.style.display = cartSection.style.display === "none" ? "block" : "none";
  } else {
    showToast("⚠️ Cart section not found!", "error");
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  createFloatingCartButton();
  cart = loadCart();
  fetchMenuItems();
  renderCart();
});
