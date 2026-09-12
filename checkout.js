// ==========================================
// PASTEL & KNOTS — CHECKOUT SCRIPT
// (Uses functions from auth-state.js, included before this file)
// ==========================================

// ------------------------------------------
// ⚠️ SHOP OWNER: EDIT THESE TWO LINES ⚠️
// This is the Easypaisa account that will receive customer payments.
// Customers will be shown this number/name and asked to send money
// to it manually from their own Easypaisa app, then enter the
// transaction ID (TID) as proof of payment for you to verify.
// ------------------------------------------
const MERCHANT_EASYPAISA_NUMBER = "03XX-XXXXXXX"; // <-- put your real Easypaisa number here
const MERCHANT_EASYPAISA_NAME = "Your Business Name";   // <-- put your registered Easypaisa account name here

const SHIPPING_FEE = 3.50;

let currentUser = null;
let selectedAddressId = null;

window.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(); // redirects to auth.html if not logged in
    if (!currentUser) return;

    document.getElementById('merchant-easypaisa-number').innerText = MERCHANT_EASYPAISA_NUMBER;
    document.getElementById('merchant-easypaisa-name').innerText = MERCHANT_EASYPAISA_NAME;

    renderOrderSummary();
    renderAddressOptions();
});

// ==========================================
// CART / ORDER SUMMARY
// ==========================================
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem('pk_cart')) || [];
    } catch (e) {
        return [];
    }
}

function renderOrderSummary() {
    const cart = loadCart();
    const container = document.getElementById('order-items');
    const payBtn = document.getElementById('confirm-payment-btn');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 space-y-2">
                <p class="font-display font-semibold text-gray-700">Your bag is empty</p>
                <a href="products.html" class="text-xs font-bold text-pink-500 hover:underline">Go shop something cute →</a>
            </div>
        `;
        document.getElementById('order-subtotal').innerText = "$0.00";
        document.getElementById('order-total').innerText = "$0.00";
        document.getElementById('amount-to-send').innerText = "$0.00";
        payBtn.disabled = true;
        return;
    }

    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        return `
            <div class="flex items-center justify-between text-sm">
                <div>
                    <p class="font-semibold text-gray-800">${item.name} <span class="text-gray-400 font-normal">× ${item.quantity}</span></p>
                    <p class="text-[11px] text-gray-400">${item.details}</p>
                </div>
                <span class="font-bold text-gray-700">$${lineTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    const total = subtotal + SHIPPING_FEE;
    document.getElementById('order-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('order-total').innerText = `$${total.toFixed(2)}`;
    document.getElementById('amount-to-send').innerText = `$${total.toFixed(2)}`;
    payBtn.disabled = false;
}

// ==========================================
// ADDRESS SELECTION
// ==========================================
function renderAddressOptions() {
    const container = document.getElementById('address-options');
    const addresses = getAddresses(currentUser.email);

    if (addresses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6 bg-pink-50/40 rounded-2xl border border-pink-100">
                <p class="text-xs text-gray-500 mb-2">You don't have a saved address yet.</p>
                <a href="account.html" class="text-xs font-bold text-pink-500 hover:underline">Add one in My Account →</a>
            </div>
        `;
        return;
    }

    container.innerHTML = addresses.map(addr => `
        <label class="address-option ${addr.isDefault ? 'selected-address' : ''} cursor-pointer block p-4 rounded-2xl border-2 border-pink-100 bg-white/70 transition-all" data-id="${addr.id}">
            <div class="flex items-start gap-3">
                <input type="radio" name="selected-address" value="${addr.id}" ${addr.isDefault ? 'checked' : ''} onchange="handleAddressSelect(${addr.id})" class="mt-1 accent-pink-500">
                <div>
                    <p class="font-display font-bold text-sm text-gray-800">${addr.fullName}</p>
                    <p class="text-xs text-gray-600">${addr.addressLine}, ${addr.city} ${addr.postalCode}</p>
                    <p class="text-xs text-gray-500"><i class="fa-solid fa-phone text-pink-400 mr-1"></i>${addr.phone}</p>
                </div>
            </div>
        </label>
    `).join('');

    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
    selectedAddressId = defaultAddr.id;
}

function handleAddressSelect(id) {
    selectedAddressId = id;
    document.querySelectorAll('.address-option').forEach(el => {
        el.classList.toggle('selected-address', Number(el.dataset.id) === id);
    });
}

// ==========================================
// EASYPAISA PAYMENT CONFIRMATION
// ==========================================
function handlePaymentSubmit(event) {
    event.preventDefault();

    const cart = loadCart();
    if (cart.length === 0) {
        showToast("Your bag is empty!");
        return;
    }

    const addresses = getAddresses(currentUser.email);
    if (addresses.length === 0 || !selectedAddressId) {
        showToast("Please add and select a delivery address first.");
        return;
    }

    const senderNumber = document.getElementById('sender-easypaisa-number').value.trim();
    const transactionId = document.getElementById('easypaisa-tid').value.trim();

    if (!senderNumber || !transactionId) {
        showToast("Please enter your Easypaisa number and the Transaction ID (TID).");
        return;
    }

    const shippingAddress = addresses.find(a => a.id === selectedAddressId);
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal + SHIPPING_FEE;
    const orderRef = `PK-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = {
        orderRef,
        placedAt: new Date().toISOString(),
        customerEmail: currentUser.email,
        items: cart,
        subtotal,
        shipping: SHIPPING_FEE,
        total,
        shippingAddress,
        payment: {
            method: 'Easypaisa (manual transfer)',
            senderNumber,
            transactionId,
            status: 'pending_verification'
        }
    };

    saveOrder(order);

    // Clear the cart now that the order has been placed
    localStorage.setItem('pk_cart', JSON.stringify([]));

    showOrderConfirmation(order);
}

function saveOrder(order) {
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem('pk_orders')) || [];
    } catch (e) {
        orders = [];
    }
    orders.push(order);
    localStorage.setItem('pk_orders', JSON.stringify(orders));
}

function showOrderConfirmation(order) {
    document.getElementById('checkout-form-view').classList.add('hidden');
    document.getElementById('order-confirmation-view').classList.remove('hidden');

    document.getElementById('confirm-order-ref').innerText = `#${order.orderRef}`;
    document.getElementById('confirm-order-total').innerText = `$${order.total.toFixed(2)}`;
    document.getElementById('confirm-order-tid').innerText = order.payment.transactionId;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Toast Helper
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
