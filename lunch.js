document.addEventListener("DOMContentLoaded", () => {
  // Initialize cart items and total price
  let cart = [];
  let total = 0;

  // Get the DOM elements for cart display and items
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartDropdownMenu = document.getElementById('cart-dropdown-menu');
  const cartTotal = document.getElementById('cart-total');
  const emptyCartMessage = document.getElementById('empty-cart-message');

  // Toggle dropdown visibility
  cartButton.addEventListener("click", () => {
    cartDropdownMenu.style.display = cartDropdownMenu.style.display === "block" ? "none" : "block";
  });

  // Close the dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".cart-dropdown")) {
      cartDropdownMenu.style.display = "none";
    }
  });

  // Function to update the cart display
  function updateCart() {
    cartItems.innerHTML = '';

    // If the cart is empty, show the empty message
    if (cart.length === 0) {
      cartItems.innerHTML = '<li>Your cart is empty!</li>';
      emptyCartMessage.style.display = "block";
    } else {
      cart.forEach(item => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
          ${item.name} - $${item.price.toFixed(2)}
          <button class="remove-btn">Remove</button>
        `;
        cartItems.appendChild(cartItem);

        // Attach remove button functionality
        cartItem.querySelector(".remove-btn").addEventListener("click", () => {
          // Remove item from the cart
          cart = cart.filter(cartItem => cartItem.name !== item.name);
          total -= item.price;
          updateCart();  // Re-render the cart
        });
      });

      // Hide empty cart message
      emptyCartMessage.style.display = "none";
    }

    // Update the cart count and total price
    cartCount.textContent = cart.length;
    cartTotal.textContent = `$${total.toFixed(2)}`;
  }

  // Add event listeners to "Add to cart" buttons
  const addToCartButtons = document.querySelectorAll(".button-group button:nth-child(2)");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const card = event.target.closest(".card"); // Get the parent card
      const itemName = card.querySelector(".card-content h3").textContent;
      const itemImage = card.querySelector("img").src;
      const itemPrice = parseFloat(card.querySelector(".card-content .price").textContent.replace('$', '').trim());

      // Check if item already exists in the cart
      const existingItem = cart.find(item => item.name === itemName);

      if (!existingItem) {
        // Add item to cart
        cart.push({ name: itemName, price: itemPrice, image: itemImage });
        total += itemPrice;
        updateCart(); // Re-render the cart
        alert(`${itemName} added to cart!`);
      } else {
        alert(`${itemName} is already in your cart!`);
      }
    });
  });
});
  