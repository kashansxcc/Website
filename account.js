// ==========================================
// PASTEL & KNOTS — ACCOUNT / ADDRESS BOOK SCRIPT
// (Uses functions from auth-state.js, included before this file)
// ==========================================

let currentUser = null;

window.addEventListener('DOMContentLoaded', () => {
    currentUser = requireAuth(); // redirects to auth.html if not logged in
    if (!currentUser) return;

    document.getElementById('profile-name').innerText = currentUser.fullName;
    document.getElementById('profile-email').innerText = currentUser.email;
    document.getElementById('profile-phone').innerText = currentUser.phone;
    document.getElementById('profile-initial').innerText = currentUser.fullName.charAt(0).toUpperCase();

    renderAddressList();
});

function handleLogout() {
    logoutUser();
    window.location.href = 'home.html';
}

// ==========================================
// ADDRESS BOOK RENDERING
// ==========================================
function renderAddressList() {
    const list = document.getElementById('address-list');
    const addresses = getAddresses(currentUser.email);

    if (addresses.length === 0) {
        list.innerHTML = `
            <div class="text-center py-10 bg-white/60 rounded-2xl border border-pink-100">
                <div class="w-14 h-14 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center text-xl mx-auto mb-2">
                    <i class="fa-solid fa-location-dot"></i>
                </div>
                <p class="text-sm font-semibold text-gray-700">No saved addresses yet</p>
                <p class="text-xs text-gray-400">Add your delivery address below for faster checkout.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = addresses.map(addr => `
        <div class="p-4 rounded-2xl border ${addr.isDefault ? 'border-pink-300 bg-pink-50/50' : 'border-pink-100 bg-white/70'} flex items-start justify-between gap-4">
            <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                    <span class="font-display font-bold text-sm text-gray-800">${addr.fullName}</span>
                    ${addr.isDefault ? '<span class="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">Default</span>' : ''}
                </div>
                <p class="text-xs text-gray-600">${addr.addressLine}, ${addr.city} ${addr.postalCode}</p>
                <p class="text-xs text-gray-500"><i class="fa-solid fa-phone text-pink-400 mr-1"></i>${addr.phone}</p>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
                ${!addr.isDefault ? `<button onclick="handleSetDefault(${addr.id})" class="text-[11px] font-bold text-purple-600 hover:underline">Set Default</button>` : ''}
                <button onclick="handleDeleteAddress(${addr.id})" class="text-[11px] font-bold text-red-400 hover:underline">Remove</button>
            </div>
        </div>
    `).join('');
}

function handleAddAddressSubmit(event) {
    event.preventDefault();

    const fullName = document.getElementById('addr-fullname').value;
    const phone = document.getElementById('addr-phone').value;
    const addressLine = document.getElementById('addr-line').value;
    const city = document.getElementById('addr-city').value;
    const postalCode = document.getElementById('addr-postal').value;

    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim()) {
        showToast('Please fill in full name, phone, address, and city.');
        return;
    }

    addAddress(currentUser.email, { fullName, phone, addressLine, city, postalCode });
    document.getElementById('add-address-form').reset();
    renderAddressList();
    showToast('Address saved! 💕');
}

function handleSetDefault(id) {
    setDefaultAddress(currentUser.email, id);
    renderAddressList();
}

function handleDeleteAddress(id) {
    deleteAddress(currentUser.email, id);
    renderAddressList();
    showToast('Address removed.');
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
