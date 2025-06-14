function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');
}

/**
 * Simulates a very basic "hashing" for client-side storage.
 * IMPORTANT: This is NOT cryptographically secure for real applications.
 * Passwords should be hashed and salted on a secure backend.
 */
function hashPassword(password) {
    // For demonstration purposes only. Do NOT use in production.
    return btoa(password); // Base64 encoding - easily reversible!
}

/**
 * Simulates checking a "hashed" password.
 * IMPORTANT: This is NOT cryptographically secure for real applications.
 */
function checkPassword(inputPassword, storedHash) {
    return hashPassword(inputPassword) === storedHash;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return password.length >= 6; // Minimum 6 characters
}

function displayMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    // Clear previous message and class to allow animation to re-trigger
    messageElement.textContent = '';
    messageElement.className = '';
    
    // Force reflow to restart animation (if needed for repeat messages)
    void messageElement.offsetHeight; 

    messageElement.textContent = message;
    messageElement.classList.add(type);
    messageElement.style.opacity = 1; // Ensure it's visible if CSS transition relies on this
}

function clearMessage(elementId) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = '';
    messageElement.className = '';
    messageElement.style.opacity = 0; // Hide it
}

// Function to handle the floating label behavior
function updateLabelPosition(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        if (inputElement.value) {
            formGroup.classList.add('has-content');
        } else {
            formGroup.classList.remove('has-content');
        }
    }
}


function checkLoginStatus() {
    const loggedIn = localStorage.getItem('loggedInUser');
    const profileTab = document.getElementById('profile-tab');
    
    if (loggedIn) {
        profileTab.style.display = 'inline-block';
        openTab('profile');
        loadProfile();
    } else {
        profileTab.style.display = 'none';
        openTab('login');
        // Clear messages when switching to login if not logged in
        clearMessage('login-message');
        clearMessage('register-message');
        clearMessage('profile-message');
    }
    // Also ensure labels are correct on tab switch
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(updateLabelPosition);
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-address').value = user.address || '';
        // Clear password fields on load for security
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';

        // Trigger label animations for pre-filled profile fields
        document.querySelectorAll('#profile .form-group input, #profile .form-group textarea').forEach(updateLabelPosition);
    }
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    clearMessage('login-message'); // Clear previous message

    if (!isValidEmail(email)) {
        displayMessage('login-message', 'Please enter a valid email address.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    // Check if user exists and password matches (using simulated hash)
    if (user && checkPassword(password, user.passwordHash)) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        displayMessage('login-message', `Welcome back, ${user.name}!`, 'success');
        setTimeout(checkLoginStatus, 500); // Small delay to show message then transition
    } else {
        displayMessage('login-message', 'Invalid email or password.', 'error');
    }
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    clearMessage('register-message'); // Clear previous message

    if (!isValidEmail(email)) {
        displayMessage('register-message', 'Please enter a valid email address.', 'error');
        return;
    }

    if (!isValidPassword(password)) {
        displayMessage('register-message', 'Password must be at least 6 characters long.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        displayMessage('register-message', 'Passwords do not match.', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        displayMessage('register-message', 'Email already registered.', 'error');
        return;
    }
    
    const newUser = { name, email, passwordHash: hashPassword(password), address: '' }; // Store hash
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    displayMessage('register-message', 'Registration successful! Welcome, ' + name + '!', 'success');
    setTimeout(checkLoginStatus, 500); // Small delay to show message then transition
});

document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const address = document.getElementById('profile-address').value;
    const newPassword = document.getElementById('profile-password').value;
    const confirmNewPassword = document.getElementById('profile-confirm-password').value;
    
    clearMessage('profile-message'); // Clear previous message

    let user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    // Update name and address directly
    user.name = name;
    user.address = address;

    // Handle password change only if new password fields are filled
    if (newPassword) {
        if (!isValidPassword(newPassword)) {
            displayMessage('profile-message', 'New password must be at least 6 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            displayMessage('profile-message', 'New passwords do not match.', 'error');
            return;
        }
        user.passwordHash = hashPassword(newPassword); // Update with new hash
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    
    // Ensure user exists before updating
    if (userIndex !== -1) {
        users[userIndex] = user; // Update the user object in the array
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(user)); // Update logged in user
        displayMessage('profile-message', 'Profile updated successfully!', 'success');
        // Clear password fields after successful update
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
        // Re-check labels after update, especially if password fields are cleared
        document.querySelectorAll('#profile .form-group input, #profile .form-group textarea').forEach(updateLabelPosition);
    } else {
        displayMessage('profile-message', 'Error: User not found in database. Please log in again.', 'error');
        localStorage.removeItem('loggedInUser'); // Log out if user not found
        setTimeout(checkLoginStatus, 500);
    }
});

document.getElementById('logout-button').addEventListener('click', function() {
    localStorage.removeItem('loggedInUser');
    displayMessage('login-message', 'Logged out successfully!', 'success');
    setTimeout(checkLoginStatus, 500); // Small delay to show message then transition
});

// Initialize on page load
window.onload = checkLoginStatus;

// Add event listeners for input fields to handle label movement on input
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', () => updateLabelPosition(input));
    input.addEventListener('focus', () => updateLabelPosition(input)); // Ensure label moves on focus even if empty
    input.addEventListener('blur', () => updateLabelPosition(input));   // Ensure label returns if empty on blur
    // Initial check for pre-filled values by browser (e.g., autofill)
    updateLabelPosition(input);
});