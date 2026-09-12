// ==========================================
// PASTEL & KNOTS — HOME PAGE SCRIPT
// ==========================================

// ------------------------------------------
// Product Catalog
// ------------------------------------------
const PRODUCTS = [
    {
        id: 1,
        name: "Pastel Dream Bracelet",
        category: "bracelets",
        price: 14.99,
        rating: 5.0,
        reviewsCount: 42,
        colors: ["#FFC0D3", "#E6E6FA", "#FFFDF9", "#C7B8F6"],
        tag: "Bestseller",
        description: "Beaded bracelet mixing soft blush pink, lavender glass, and frosted pearl beads."
    },
    {
        id: 2,
        name: "Lavender Bow Phone Charm",
        category: "phone-charms",
        price: 12.50,
        rating: 4.9,
        reviewsCount: 38,
        colors: ["#B098F2", "#FFC0D3", "#FFFDF9"],
        tag: "Trending",
        description: "Handcrafted phone lanyard with pastel acrylic ribbons, frosted stars, and heart beads."
    },
    {
        id: 3,
        name: "Daisy Bloom Beaded Necklace",
        category: "necklaces",
        price: 19.00,}

// Initialize page on load
window.addEventListener('DOMContentLoaded', () => {
    renderFeaturedHomeProducts();
    updateCartUI();
});

// ==========================================
// PRODUCT CARD RENDERING
// ==========================================
function createProductCardHTML(p) {
    return `
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-pink-100 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
                <div class="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-4 border border-pink-100/50 flex items-center justify-center h-44 overflow-hidden">
                    <span class="absolute top-3 right-3 bg-white/90 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-purple-100">
                        ${p.tag}
                    </span>
                    <div class="flex items-center gap-1 group-hover:scale-105 transition-transform duration-300">
                        ${p.colors.map((c, idx) => `
                            <div class="w-5 h-5 rounded-full shadow-md border-2 border-white transform transition-all" style="background-color: ${c}; transform: translateY(${idx % 2 === 0 ? '-3px' : '3px'});"></div>
                        `).join('')}
                    </div>
                </div>

                <div class="flex items-center gap-1 text-amber-400 text-xs mb-1">
                    <i class="fa-solid fa-star"></i>
                    <span class="font-bold text-gray-700">${p.rating}</span>
                    <span class="text-gray-400">(${p.reviewsCount})</span>
                </div>

                <h3 class="font-display font-semibold text-gray-800 text-base group-hover:text-pink-500 transition-colors">${p.name}</h3>
                <p class="text-xs text-gray-500 line-clamp-2 mt-1">${p.description}</p>
            </div>

            <div class="pt-4 mt-4 border-t border-pink-50 flex items-center justify-between">
                <div>
                    <span class="text-xs text-gray-400 block font-medium">Price</span>
                    <span class="font-display font-bold text-lg text-purple-800">$${p.price.toFixed(2)}</span>
                </div>

                <div class="flex gap-2">
                    <a href="products.html" class="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-xs font-bold" title="View in Shop">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <button onclick="quickAddToCart(${p.id})" class="px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white transition-all text-xs font-bold shadow-sm flex items-center gap-1">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedHomeProducts() {
    const grid = document.getElementById('home-featured-grid');
    if (!grid) return;
    const featured = PRODUCTS.slice(0, 4);
    grid.innerHTML = featured.map(createProductCardHTML).join('');
}

// ==========================================
// SHOPPING CART & DRAWER MANAGEMENT
// ==========================================
function quickAddToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            details: product.tag + " • Standard Size",
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} added to bag! 💕`);
}

function updateCartQuantity(id, change) {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    badge.innerText = totalCount;
    if (totalCount > 0) {
        badge.classList.remove('scale-0');
        badge.classList.add('scale-100');
    } else {
        badge.classList.remove('scale-100');
        badge.classList.add('scale-0');
    }

    const container = document.getElementById('cart-items-container');
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 space-y-3">
                <div class="w-16 h-16 rounded-full bg-pink-50 text-pink-300 flex items-center justify-center text-2xl mx-auto">
                    <i class="fa-solid fa-basket-shopping"></i>
                </div>
                <p class="font-display font-semibold text-gray-700 text-lg">Your bag is empty!</p>
                <p class="text-xs text-gray-400">Explore our shop to add handcrafted items.</p>
            </div>
        `;
        document.getElementById('cart-subtotal').innerText = "$0.00";
        document.getElementById('cart-total').innerText = "$0.00";
        document.getElementById('checkout-btn').disabled = true;
        return;
    }

    document.getElementById('checkout-btn').disabled = false;

    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="flex items-center justify-between p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100/80">
                <div class="space-y-0.5">
                    <h4 class="font-display font-semibold text-xs text-gray-800">${item.name}</h4>
                    <p class="text-[10px] text-gray-500">${item.details}</p>
                    <span class="font-bold text-xs text-purple-700">$${item.price.toFixed(2)}</span>
                </div>

                <div class="flex items-center gap-2">
                    <div class="flex items-center bg-white rounded-xl border border-pink-200 px-2 py-1 gap-2 text-xs font-bold">
                        <button onclick="updateCartQuantity(${item.id}, -1)" class="text-gray-400 hover:text-pink-500">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, 1)" class="text-gray-400 hover:text-pink-500">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const shipping = 3.50;
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `$${(subtotal + shipping).toFixed(2)}`;
}

function toggleCartDrawer(open) {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');

    if (open) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        drawer.classList.remove('translate-x-full');
    } else {
        overlay.classList.add('opacity-0', 'pointer-events-none');
        drawer.classList.add('translate-x-full');
    }
}

// Checkout Modal
function openCheckoutModal() {
    toggleCartDrawer(false);
    document.getElementById('checkout-order-ref').innerText = `#PK-${Math.floor(1000 + Math.random() * 9000)}`;
    const modal = document.getElementById('checkout-modal');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    cart = [];
    saveCart();
    updateCartUI();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
}

// Mobile Nav Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Toast Helper Notification
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
