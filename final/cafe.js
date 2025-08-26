// Mobile Menu Toggle
const mobileToggle = document.getElementById("mobileToggle");
const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");

mobileToggle.addEventListener("click", () => {
  mobileMenu.style.display = mobileMenu.style.display === "flex" ? "none" : "flex";
});

// Close mobile menu on link click
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.style.display = "none";
  });
});

// Smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Sticky header background change on scroll
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target) && mobileMenu.style.display === "flex") {
    mobileMenu.style.display = "none";
  }
});

// Cart functionality
const cartCountElem = document.getElementById("cartCount");
const cartIcon = document.getElementById("cartIcon");
const cartModal = document.getElementById("cartModal");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const cartTotalElem = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

// Load cart from localStorage or initialize empty
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart;
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart count badge
function updateCartCount() {
  const cart = loadCart();
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCountElem.textContent = totalCount;
}

// Format price to 2 decimals
function formatPrice(price) {
  return price.toFixed(2);
}

// Render cart items in modal
function renderCart() {
  const cart = loadCart();
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    emptyCartMessage.style.display = "block";
    cartTotalElem.textContent = "0.00";
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add("disabled");
    return;
  }
  emptyCartMessage.style.display = "none";
  checkoutBtn.disabled = false;
  checkoutBtn.classList.remove("disabled");

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemDiv = document.createElement("div");
    
    // Product info
    const infoDiv = document.createElement("div");
    infoDiv.className = "product-info";

    const nameP = document.createElement("p");
    nameP.textContent = item.product;
    infoDiv.appendChild(nameP);

    const priceP = document.createElement("p");
    priceP.textContent = `₹${formatPrice(item.price)} each`;
    infoDiv.appendChild(priceP);

    itemDiv.appendChild(infoDiv);

    // Quantity controls
    const qtyDiv = document.createElement("div");
    qtyDiv.className = "quantity-controls";

    const minusBtn = document.createElement("button");
    minusBtn.setAttribute("aria-label", `Decrease quantity of ${item.product}`);
    minusBtn.textContent = "−";
    minusBtn.addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
        cart[index] = item;
        saveCart(cart);
        renderCart();
        updateCartCount();
      }
    });
    qtyDiv.appendChild(minusBtn);

    const qtySpan = document.createElement("span");
    qtySpan.textContent = item.quantity;
    qtyDiv.appendChild(qtySpan);

    const plusBtn = document.createElement("button");
    plusBtn.setAttribute("aria-label", `Increase quantity of ${item.product}`);
    plusBtn.textContent = "+";
    plusBtn.addEventListener("click", () => {
      item.quantity++;
      cart[index] = item;
      saveCart(cart);
      renderCart();
      updateCartCount();
    });
    qtyDiv.appendChild(plusBtn);

    itemDiv.appendChild(qtyDiv);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", `Remove ${item.product} from cart`);
    removeBtn.innerHTML = "&times;";
    removeBtn.addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
      updateCartCount();
    });
    itemDiv.appendChild(removeBtn);

    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotalElem.textContent = formatPrice(total);
}

// Show cart modal with slide-in animation
function showCart() {
  renderCart();
  cartModal.style.display = "flex";
  // Trigger reflow to restart animation
  void cartModal.offsetWidth;
  cartModal.classList.add("show");
  document.body.style.overflow = "hidden";
  closeCartBtn.focus();
}

// Hide cart modal with slide-out animation
function hideCart() {
  cartModal.classList.remove("show");
  // Wait for animation to finish before hiding completely
  cartModal.addEventListener(
    "transitionend",
    () => {
      if (!cartModal.classList.contains("show")) {
        cartModal.style.display = "none";
        document.body.style.overflow = "";
        cartIcon.focus();
      }
    },
    { once: true }
  );
}

// Add product to cart or increase quantity if exists
function addToCart(product, price) {
  let cart = loadCart();
  const existingIndex = cart.findIndex(
    (item) => item.product === product && item.price === price
  );
  if (existingIndex !== -1) {
    cart[existingIndex].quantity++;
  } else {
    cart.push({ product, price, quantity: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

// Event listeners for add to cart buttons
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.getAttribute("data-product");
    const price = parseFloat(button.getAttribute("data-price"));
    addToCart(product, price);
    alert("Product is added successfully");
  });
});

// Event listeners for cart icon and close button
cartIcon.addEventListener("click", showCart);
closeCartBtn.addEventListener("click", hideCart);

// Close modal on outside click
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    hideCart();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartModal.style.display === "flex") {
    hideCart();
  }
});

// Checkout button
checkoutBtn.addEventListener("click",  () => {
  const upiSection = document.getElementById("upi-modal");
upiSection.style.display = "flex"; 
});





   async function paynow(){

  const cart = loadCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Send cart to backend
  const res = await fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  });

  const result = await res.json();
  if (result.success) {
    alert("✅ Order placed successfully!");
    // Clear cart after checkout
    localStorage.removeItem("cart");
    updateCartCount();
    hideCart();
  } else {
    alert("❌ " + result.message);
  }


alert("Payment completed successfully!");
 const upiSection = document.getElementById("upi-modal");
upiSection.style.display = "none";  
window.location.href="/order";
    }
    async  function Cod(){




  const cart = loadCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // Send cart to backend
  const res = await fetch("/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  });

  const result = await res.json();
  if (result.success) {
    alert("✅ Order placed successfully!");
    // Clear cart after checkout
    localStorage.removeItem("cart");
    updateCartCount();
    hideCart();
  } else {
    alert("❌ " + result.message);
  }



alert("Your Payment will be collected!");
 const upiSection = document.getElementById("upi-modal");
upiSection.style.display = "none";  
window.location.href="/order";
    }










// Initialize cart count on page load
updateCartCount();

// Optional: Add click handlers for sign-up and sign-out buttons
/*const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");

signUpBtn.addEventListener("click", () => {
  alert("Sign Up clicked - implement sign-up functionality here.");
});

signOutBtn.addEventListener("click", () => {
  alert("Sign Out clicked - implement sign-out functionality here.");
});*/



   const options = document.querySelectorAll(".upi-option");
    let selectedMethod = null;

    options.forEach(option => {
        option.addEventListener("click", () => {
            // remove active from all
            options.forEach(opt => opt.classList.remove("active"));

            // add active to clicked one
            option.classList.add("active");

            // store selected method
            selectedMethod = option.getAttribute("data-method");
            console.log("Selected:", selectedMethod);
        });
    });

    // Example: handle Pay Now button
  