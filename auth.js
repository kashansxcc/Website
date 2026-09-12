// ==========================================
// PASTEL & KNOTS — AUTH PAGE SCRIPT
// (Uses functions from auth-state.js, included before this file)
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
    // If already logged in, bounce straight to account page
    if (getSession()) {
        window.location.href = 'account.html';
        return;
    }
    switchAuthTab('login');
});

function switchAuthTab(tab) {
    const loginTab = document.getElementById('auth-tab-login');
    const signupTab = document.getElementById('auth-tab-signup');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (tab === 'login') {
        loginTab.classList.add('active-auth-tab');
        signupTab.classList.remove('active-auth-tab');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        signupTab.classList.add('active-auth-tab');
        loginTab.classList.remove('active-auth-tab');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = loginUser(email, password);
    if (!result.success) {
        showAuthError('login-error', result.message);
        return;
    }

    showToast(result.message);
    redirectAfterAuth();
}

function handleSignupSubmit(event) {
    event.preventDefault();
    const fullName = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showAuthError('signup-error', 'Passwords do not match.');
        return;
    }

    const result = registerUser({ fullName, email, phone, password });
    if (!result.success) {
        showAuthError('signup-error', result.message);
        return;
    }

    showToast('Account created! Welcome to Pastel & Knots 💕');
    redirectAfterAuth();
}

function redirectAfterAuth() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    setTimeout(() => {
        window.location.href = redirect ? decodeURIComponent(redirect) : 'account.html';
    }, 600);
}

function showAuthError(elementId, message) {
    const el = document.getElementById(elementId);
    el.innerText = message;
    el.classList.remove('hidden');
}

function togglePasswordVisibility(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconEl.classList.remove('fa-eye');
        iconEl.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconEl.classList.remove('fa-eye-slash');
        iconEl.classList.add('fa-eye');
    }
}

// Toast Helper (same style as other pages)
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = "toast-enter bg-white/95 backdrop-blur border border-pink-200 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-bold text-gray-800 pointer-events-auto";
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check text-pink-500 text-sm"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
