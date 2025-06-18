// Initialize cart and order history for the current user
let cart = [];
let orderHistory = [];
let currentUserId = null;

// Helper function to get user-specific storage keys
function getUserStorageKeys() {
    return {
        cartKey: `cart_${currentUserId}`,
        orderHistoryKey: `orderHistory_${currentUserId}`
    };
}

// Load cart and order history for the current user
function loadUserData() {
    if (!currentUserId) {
        console.log('loadUserData: No currentUserId set, resetting cart and orderHistory');
        cart = [];
        orderHistory = [];
        updateCartCount();
        return;
    }
    const { cartKey, orderHistoryKey } = getUserStorageKeys();
    try {
        cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        orderHistory = JSON.parse(localStorage.getItem(orderHistoryKey)) || [];
        console.log(`loadUserData: Loaded cart (${cart.length} items) and orderHistory (${orderHistory.length} orders) for user ${currentUserId}`);
        updateCartCount();
        renderCartItems();
    } catch (error) {
        console.error('loadUserData: Error loading user data from localStorage', error);
        cart = [];
        orderHistory = [];
        updateCartCount();
    }
}

// Save cart and order history for the current user
function saveUserData() {
    if (!currentUserId) {
        console.log('saveUserData: No currentUserId set, skipping save');
        return;
    }
    const { cartKey, orderHistoryKey } = getUserStorageKeys();
    try {
        localStorage.setItem(cartKey, JSON.stringify(cart));
        localStorage.setItem(orderHistoryKey, JSON.stringify(orderHistory));
        console.log(`saveUserData: Saved cart (${cart.length} items) and orderHistory (${orderHistory.length} orders) for user ${currentUserId}`);
    } catch (error) {
        console.error('saveUserData: Error saving user data to localStorage', error);
    }
}

// Update cart count display
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        console.log(`updateCartCount: Updated cart count to ${totalItems}`);
    } else {
        console.warn('updateCartCount: No cart-count element found');
    }
}

// Render cart items inside the modal
function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) {
        console.warn('renderCartItems: No cart-items container found');
        return;
    }
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" width="80">
            <p>${item.name} (Size: ${item.size}, Quantity: ${item.quantity}) - ₹${item.price * item.quantity}</p>
            <button class="remove-item" data-index="${index}">Remove</button>
        `;
        container.appendChild(div);
    });

    // Calculate and display total cart value
    const totalCartValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `<p><strong>Total Cart Value:</strong> ₹${totalCartValue}</p>`;
    container.appendChild(totalDiv);

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            cart.splice(index, 1); // Remove item from cart
            saveUserData();
            updateCartCount();
            renderCartItems();
        });
    });
}

// Render order history
function renderOrderHistory() {
    const container = document.getElementById('order-history-items');
    if (!container) {
        console.warn('renderOrderHistory: No order-history-items container found');
        return;
    }
    container.innerHTML = '';
    if (orderHistory.length === 0) {
        container.innerHTML = '<p>No orders placed yet.</p>';
        console.log('renderOrderHistory: No orders to display');
        return;
    }
    orderHistory.forEach((order, index) => {
        const div = document.createElement('div');
        div.className = 'order-entry';
        div.innerHTML = `<h3>Order #${index + 1} - ${order.date}</h3>`;
        order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'order-item';
            itemDiv.innerHTML = `
                <img src="${item.image}" width="80">
                <p>${item.name} (Size: ${item.size}, Quantity: ${item.quantity}) - ₹${item.price * item.quantity}</p>
            `;
            div.appendChild(itemDiv);
        });

        // Calculate and display total order value
        const totalOrderValue = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalDiv = document.createElement('div');
        totalDiv.className = 'order-total';
        totalDiv.innerHTML = `<p><strong>Total Order Value:</strong> ₹${totalOrderValue}</p>`;
        div.appendChild(totalDiv);

        container.appendChild(div);
    });
    console.log(`renderOrderHistory: Rendered ${orderHistory.length} orders`);
}

// Toggle body scroll
function toggleBodyScroll(disable) {
    document.body.style.overflow = disable ? 'hidden' : 'auto';
}

// Buy Now logic
function setupBuyNow() {
    const buyNowButton = document.getElementById('buy-now');
    if (!buyNowButton) {
        console.warn('setupBuyNow: No buy-now button found');
        return;
    }
    buyNowButton.addEventListener('click', () => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('Please login to place an order.');
            window.location.href = 'profile.html';
            return;
        }

        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        // Validate cart quantities
        const invalidItem = cart.find(item => item.quantity > 10);
        if (invalidItem) {
            alert(`Quantity for ${invalidItem.name} exceeds maximum limit of 10. Please adjust quantity.`);
            return;
        }

        const copiedCart = window.structuredClone ? structuredClone(cart) : JSON.parse(JSON.stringify(cart));
        orderHistory.push({
            date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            items: copiedCart
        });
        cart = [];
        saveUserData();
        updateCartCount();
        renderCartItems();
        renderOrderHistory();
        alert('Order placed successfully!');
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = 'none';
            toggleBodyScroll(false);
        }
    });
}

// Show and close cart
function setupCartModal() {
    const cartLink = document.querySelector('a[href="#cart"]');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (!loggedInUser) {
                alert('Please login to view your cart.');
                window.location.href = 'profile.html';
                return;
            }

            loadUserData();
            renderCartItems();
            const modal = document.getElementById('cart-modal');
            if (modal) {
                modal.style.display = 'flex';
                toggleBodyScroll(true);
            }
        });
    } else {
        console.warn('setupCartModal: No cart link found');
    }

    const closeCartButton = document.getElementById('close-cart');
    if (closeCartButton) {
        closeCartButton.addEventListener('click', () => {
            const modal = document.getElementById('cart-modal');
            if (modal) {
                modal.style.display = 'none';
                toggleBodyScroll(false);
            }
        });
    }
}

// Show and close order history
function setupOrderHistoryModal() {
    const orderHistoryLink = document.querySelector('a[href="#order-history"]');
    if (orderHistoryLink) {
        orderHistoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (!loggedInUser) {
                alert('Please login to view your order history.');
                window.location.href = 'profile.html';
                return;
            }

            console.log('Opening order history modal, reloading user data');
            loadUserData();
            renderOrderHistory();
            const modal = document.getElementById('order-history-modal');
            if (modal) {
                modal.style.display = 'flex';
                toggleBodyScroll(true);
            }
        });
    } else {
        console.warn('setupOrderHistoryModal: No order-history link found');
    }

    const closeOrderHistoryButton = document.getElementById('close-order-history');
    if (closeOrderHistoryButton) {
        closeOrderHistoryButton.addEventListener('click', () => {
            const modal = document.getElementById('order-history-modal');
            if (modal) {
                modal.style.display = 'none';
                toggleBodyScroll(false);
            }
        });
    }
}

// Add event listeners to buttons
function attachButtonListeners() {
    document.querySelectorAll('.category-item').forEach(item => {
        const addToCartBtn = item.querySelector('.add-to-cart');
        const buyNowBtn = item.querySelector('.buy-now');
        const sizeSelect = item.querySelector('.size-select');
        const quantityInput = item.querySelector('.quantity-input');

        const getProductDetails = () => {
            const id = item.dataset.id;
            const name = item.dataset.name;
            const image = item.dataset.image;
            const price = parseInt(item.dataset.price);
            const size = sizeSelect ? sizeSelect.value : 'M';
            const quantity = parseInt(quantityInput ? quantityInput.value : 1);

            if (!size) {
                alert("Please select a size.");
                return null;
            }

            if (quantity < 1) {
                alert("Quantity must be at least 1.");
                quantityInput.value = 1;
                return null;
            }

            if (quantity > 10) {
                alert("Maximum quantity is 10.");
                quantityInput.value = 10;
                return null;
            }

            return { id, name, image, price, size, quantity };
        };

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const loggedInUser = localStorage.getItem('loggedInUser');
                if (!loggedInUser) {
                    alert('Please login to add items to your cart.');
                    window.location.href = 'profile.html';
                    return;
                }

                const product = getProductDetails();
                if (product) {
                    console.log(`Adding to cart: ${product.name}, Quantity: ${product.quantity}`);
                    cart.push(product);
                    saveUserData();
                    updateCartCount();
                    renderCartItems();
                    alert(`${product.name} (x${product.quantity}) added to cart!`);
                }
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                const loggedInUser = localStorage.getItem('loggedInUser');
                if (!loggedInUser) {
                    alert('Please login to buy items.');
                    window.location.href = 'profile.html';
                    return;
                }

                const product = getProductDetails();
                if (product) {
                    console.log(`Buying now: ${product.name}, Quantity: ${product.quantity}`);
                    cart.push(product);
                    saveUserData();
                    updateCartCount();
                    renderCartItems();
                    const modal = document.getElementById('cart-modal');
                    if (modal) {
                        modal.style.display = 'flex';
                        toggleBodyScroll(true);
                    }
                }
            });
        }
    });
}

// Load user profile and image
function loadUserProfile() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userNameSpan = document.getElementById('user-name');
    const profileLink = document.getElementById('profile-link');
    const userDetailsModal = document.getElementById('user-details-modal');
    const userImage = document.getElementById('user-image');
    const modalDetailName = document.getElementById('modal-detail-name');
    const modalDetailEmail = document.getElementById('modal-detail-email');
    const modalDetailAddress = document.getElementById('modal-detail-address');

    if (loggedInUser && profileLink && userImage) {
        try {
            const user = JSON.parse(loggedInUser);
            currentUserId = user.email; // Use email as unique user ID
            console.log(`loadUserProfile: Loaded user with email ${currentUserId}`);
            if (userNameSpan) {
                userNameSpan.textContent = user.name;
                userNameSpan.style.cursor = 'pointer';
            }
            profileLink.textContent = 'Logout';
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Logging out user');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userImage');
                const { cartKey, orderHistoryKey } = getUserStorageKeys();
                localStorage.removeItem(cartKey);
                localStorage.removeItem(orderHistoryKey);
                cart = [];
                orderHistory = [];
                currentUserId = null;
                updateCartCount();
                window.location.href = 'profile.html';
            });

            // Load user image from localStorage if available
            const savedImage = localStorage.getItem('userImage');
            if (savedImage) {
                userImage.src = savedImage;
                userImage.style.display = 'block';
            }

            if (modalDetailName && modalDetailEmail && modalDetailAddress) {
                modalDetailName.textContent = user.name;
                modalDetailEmail.textContent = user.email;
                modalDetailAddress.textContent = user.address || 'Not provided';
            }

            if (userNameSpan && userDetailsModal) {
                userNameSpan.addEventListener('click', () => {
                    userDetailsModal.style.display = 'flex';
                    toggleBodyScroll(true);
                });
            }

            // Load user-specific cart and order history
            loadUserData();
        } catch (error) {
            console.error('loadUserProfile: Error parsing loggedInUser', error);
            localStorage.removeItem('loggedInUser');
            currentUserId = null;
            cart = [];
            orderHistory = [];
            updateCartCount();
        }
    } else {
        console.log('loadUserProfile: No loggedInUser or missing DOM elements');
        if (profileLink && userImage) {
            if (userNameSpan) userNameSpan.textContent = '';
            profileLink.textContent = 'Profile';
            userImage.style.display = 'none';
        }
        currentUserId = null;
        cart = [];
        orderHistory = [];
        updateCartCount();
    }

    const closeUserDetailsButton = document.getElementById('close-user-details');
    if (closeUserDetailsButton && userDetailsModal) {
        closeUserDetailsButton.addEventListener('click', () => {
            userDetailsModal.style.display = 'none';
            toggleBodyScroll(false);
        });

        userDetailsModal.addEventListener('click', (e) => {
            if (e.target === userDetailsModal) {
                userDetailsModal.style.display = 'none';
                toggleBodyScroll(false);
            }
        });
    }
}

// Initialize event listeners and cart count on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('scriptaddtcart.js: DOMContentLoaded');
    loadUserProfile();
    attachButtonListeners();
    setupBuyNow();
    setupCartModal();
    setupOrderHistoryModal();
});