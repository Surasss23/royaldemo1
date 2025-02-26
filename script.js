// ✅ Cart Management
let cart = [];

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : [];
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(menuItem, isFullSize) {
  const existingItem = cart.find(
    (item) => item.id === menuItem.id && item.isFullSize === isFullSize
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: menuItem.id,
      name: menuItem.name, // ✅ Ensure Name is Stored
      quantity: 1,
      isFullSize,
      price: isFullSize ? menuItem.fullPrice : menuItem.singlePrice,
    });
  }

  saveCart();
  showToast(`🛒 Added to Cart: ${menuItem.name}`);
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ✅ Rendering Cart Items Properly
function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty</p>";
  } else {
    cartItems.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div>
          <p><strong>${item.name}</strong></p>  <!-- ✅ Item Name Now Visible -->
          <p>${item.quantity}x ${item.isFullSize ? "Full" : "Single"}</p>
        </div>
        <div>
          <p>₹${item.price * item.quantity}</p>
          <button onclick="removeFromCart(${item.id})" class="button outline">Remove</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  cartTotal.textContent = `₹${calculateTotal()}`;
}

// ✅ Fixing WhatsApp Order Button (Now Sends Proper Name)
function handleOrder() {
  if (cart.length === 0) {
    showToast("Please add items to cart first", "error");
    return;
  }

  const message = cart
    .map(
      (item) =>
        `${item.quantity}x ${item.name} (${item.isFullSize ? "Full" : "Single"}) - ₹${
          item.price * item.quantity
        }`
    )
    .join("\n");

  const phoneNumber = "+917075954214"; // Replace with actual number
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    `🛍️ *New Order Received:*\n\n${message}\n\n*Total: ₹${calculateTotal()}*`
  )}`;

  window.open(whatsappUrl);
  cart = [];
  saveCart();
}
