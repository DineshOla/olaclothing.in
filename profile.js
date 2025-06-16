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
 */
function hashPassword(password) {
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
    messageElement.textContent = '';
    messageElement.className = '';
    
    void messageElement.offsetHeight; 

    messageElement.textContent = message;
    messageElement.classList.add(type);
    messageElement.style.opacity = 1;
}

function clearMessage(elementId) {
    const messageElement = document.getElementById(elementId);
    messageElement.textContent = '';
    messageElement.className = '';
    messageElement.style.opacity = 0;
}

function updateLabelPosition(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    if (formGroup) {
        if (inputElement.value && inputElement.type !== 'file') {
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
        openTab('register'); // Start on register tab by default
        clearMessage('login-message');
        clearMessage('register-message');
        clearMessage('profile-message');
    }
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(updateLabelPosition);
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        document.getElementById('profile-name').value = user.name;
        document.getElementById('profile-email').value = user.email;
        document.getElementById('profile-address').value = user.address || '';
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';

        document.querySelectorAll('#profile .form-group input, #profile .form-group textarea').forEach(updateLabelPosition);
    }
}

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    
    clearMessage('register-message');

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
    
    const newUser = { name, email, passwordHash: hashPassword(password), address: '' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    displayMessage('register-message', 'Registration successful! Please login.', 'success');
    
    // Redirect to login tab after registration
    setTimeout(() => openTab('login'), 1000);
});

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    clearMessage('login-message');

    if (!isValidEmail(email)) {
        displayMessage('login-message', 'Please enter a valid email address.', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user && checkPassword(password, user.passwordHash)) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        displayMessage('login-message', `Welcome back, ${user.name}!`, 'success');
        // Use window.location.replace to force a full page reload
        setTimeout(() => window.location.replace('index.html'), 1000);
    } else {
        displayMessage('login-message', 'Invalid email or password.', 'error');
    }
});

document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const address = document.getElementById('profile-address').value;
    const newPassword = document.getElementById('profile-password').value;
    const confirmNewPassword = document.getElementById('profile-confirm-password').value;
    
    clearMessage('profile-message');

    let user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    user.name = name;
    user.address = address;

    if (newPassword) {
        if (!isValidPassword(newPassword)) {
            displayMessage('profile-message', 'New password must be at least 6 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            displayMessage('profile-message', 'New passwords do not match.', 'error');
            return;
        }
        user.passwordHash = hashPassword(newPassword);
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        displayMessage('profile-message', 'Profile updated successfully!', 'success');
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
        document.querySelectorAll('#profile .form-group input, #profile .form-group textarea').forEach(updateLabelPosition);
    } else {
        displayMessage('profile-message', 'Error: User not found in database. Please log in again.', 'error');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userImage');
        setTimeout(checkLoginStatus, 500);
    }
});

// Handle image upload in the Profile tab
document.getElementById('upload-user-image').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageDataUrl = event.target.result;
            localStorage.setItem('userImage', imageDataUrl);
            const userImage = document.getElementById('user-image');
            userImage.src = imageDataUrl;
            userImage.style.display = 'block';
            displayMessage('profile-message', 'Profile image updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('logout-button').addEventListener('click', function() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userImage');
    displayMessage('login-message', 'Logged out successfully!', 'success');
    setTimeout(checkLoginStatus, 500);
});

window.onload = checkLoginStatus;

document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    input.addEventListener('input', () => updateLabelPosition(input));
    input.addEventListener('focus', () => updateLabelPosition(input));
    input.addEventListener('blur', () => updateLabelPosition(input));
    updateLabelPosition(input);
});