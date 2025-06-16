let cart = [];
let orderHistory = [];

// Update cart count display
function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

// Render cart items inside the modal
function renderCartItems() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" width="80">
            <p>${item.name} (Size: ${item.size}) - ₹${item.price}</p>
        `;
        container.appendChild(div);
    });
}

// Render order history
function renderOrderHistory() {
    const container = document.getElementById('order-history-items');
    container.innerHTML = '';
    orderHistory.forEach((order, index) => {
        const div = document.createElement('div');
        div.className = 'order-entry';
        div.innerHTML = `<h3>Order #${index + 1} - ${order.date}</h3>`;
        order.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <img src="${item.image}" width="80">
                <p>${item.name} (Size: ${item.size}) - ₹${item.price}</p>
            `;
            div.appendChild(itemDiv);
        });
        container.appendChild(div);
    });
}

// Buy Now logic
document.getElementById('buy-now').addEventListener('click', () => {
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

    const copiedCart = window.structuredClone ? structuredClone(cart) : JSON.parse(JSON.stringify(cart));
    orderHistory.push({
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        items: copiedCart
    });

    cart = [];
    updateCartCount();
    renderCartItems();
    renderOrderHistory();
    alert('Order placed successfully!');
    document.getElementById('cart-modal').style.display = 'none';
});

// Show and close cart
document.querySelector('a[href="#cart"]').addEventListener('click', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('Please login to view your cart.');
        window.location.href = 'profile.html';
        return;
    }

    renderCartItems();
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'flex';
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-modal').style.display = 'none';
});

// Show and close order history
document.querySelector('a[href="#order-history"]').addEventListener('click', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        alert('Please login to view your order history.');
        window.location.href = 'profile.html';
        return;
    }

    renderOrderHistory();
    const modal = document.getElementById('order-history-modal');
    modal.style.display = 'flex';
});

document.getElementById('close-order-history').addEventListener('click', () => {
    document.getElementById('order-history-modal').style.display = 'none';
});

// Add event listeners to buttons
document.querySelectorAll('.category-item').forEach(item => {
    const addToCartBtn = item.querySelector('.add-to-cart');
    const buyNowBtn = item.querySelector('.buy-now');
    const sizeSelect = item.querySelector('.size-select');

    const getProductDetails = () => {
        const id = item.dataset.id;
        const name = item.dataset.name;
        const image = item.dataset.image;
        const price = parseInt(item.dataset.price);
        const size = sizeSelect.value;

        if (!size) {
            alert("Please select a size.");
            return null;
        }

        return { id, name, image, price, size };
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
                cart.push(product);
                updateCartCount();
                alert(`${product.name} added to cart!`);
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
                cart.push(product);
                updateCartCount();
                renderCartItems();
                document.getElementById('cart-modal').style.display = 'flex';
            }
        });
    }
});