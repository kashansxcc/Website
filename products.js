// ==========================================
// PASTEL & KNOTS — PRODUCTS / SHOP PAGE SCRIPT
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
        price: 19.00,
        rating: 5.0,
        reviewsCount: 65,
        colors: ["#DDD5FA", "#FFC0D3", "#FBBF24"],
        tag: "Popular",
        description: "Hand-beaded daisy flower chain choker in soft lilac and butter yellow accents."
    },
    {
        id: 4,
        name: "Butterfly Pearl Phone Charm",
        category: "phone-charms",
        price: 13.50,
        rating: 4.8,
        reviewsCount: 29,
        colors: ["#C7B8F6", "#EFEBFD", "#FFE3EC"],
        tag: "New",
        description: "Features an iridescent butterfly pendant paired with sturdy pastel cord and pearls."
    },
    {
        id: 5,
        name: "Ocean Pastel Pearl Bracelet",
        category: "bracelets",
        price: 17.00,
        rating: 4.9,
        reviewsCount: 19,
        colors: ["#BAE6FD", "#E6E6FA", "#FFFDF9"],
        tag: "Soft Vibe",
        description: "Subtle blend of soft sky blue and lavender pearls evoking serene aesthetic vibes."
    },
    {
        id: 6,
        name: "Sweetheart Beaded Necklace",
        category: "necklaces",
        price: 21.00,
        rating: 5.0,
        reviewsCount: 51,
        colors: ["#FFC0D3", "#FFA0B9", "#FFF"],
        tag: "Bestseller",
        description: "Pastel pink glass beads featuring an anti-tarnish rose quartz heart pendant."
    },
    {
        id: 7,
        name: "Starry Night Friendship Bracelet",
        category: "bracelets",
        price: 15.00,
        rating: 4.7,
        reviewsCount: 15,
        colors: ["#9976ED", "#C7B8F6", "#FBBF24"],
        tag: "Cute Duo",
        description: "Deep soft violet and gold celestial star charm bracelet for everyday wear."
    },
    {
        id: 8,
        name: "Kawaii Strawberry Phone Charm",
        category: "phone-charms",
        price: 11.50,
        rating: 4.9,
        reviewsCount: 33,
        colors: ["#FFE3EC", "#FF809F", "#EFEBFD"],
        tag: "Cute Pick",
        description: "Adorable strawberry bead charm strand compatible with all phone cases."
    }
];

// ------------------------------------------
// Cart State (persisted across pages)
// ------------------------------------------
let cart = loadCart();

let shopState = {
    category: 'all',
    searchQuery: '',
    sortBy: 'featured'
};

let isCategoryOpen = false;

function loadCart() {
    try {
        const stored = localStorage.getItem('pk_cart');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveCart() {
    localStorage.setItem('pk_cart', JSON.stringify(cart));
}

// Initialize page on load
window.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    updateShopCategoryCounts();

    // Read ?category= from URL, if present (e.g. from Home page links)
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get('category');
    if (requestedCategory) {
        setShopCategory(requestedCategory);
    } else {
        renderShopProducts();
    }
});

// ==========================================
// CATEGORIES COLLAPSIBLE ACCORDION LOGIC
// ==========================================
function toggleCategoryAccordion() {
    const content = document.getElementById('cat-accordion-content');
    const icon = document.getElementById('cat-accordion-icon');

    isCategoryOpen = !isCategoryOpen;

    if (isCategoryOpen) {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.style.transform = "rotate(180deg)";
    } else {
        content.style.maxHeight = "0px";
        icon.style.transform = "rotate(0deg)";
    }
}

function collapseCategoryAccordion() {
    const content = document.getElementById('cat-accordion-content');
    const icon = document.getElementById('cat-accordion-icon');

    isCategoryOpen = false;
    content.style.maxHeight = "0px";
    icon.style.transform = "rotate(0deg)";
}

function selectAndCollapseCategory(category) {
    setShopCategory(category);
    collapseCategoryAccordion();
}

function updateCategoryActiveLabel(category) {
    const labelEl = document.getElementById('active-cat-label');
    if (!labelEl) return;

    const categoryNames = {
        'all': 'All Items',
        'bracelets': 'Beaded Bracelets',
        'necklaces': 'Beaded Necklaces',
        'phone-charms': 'Phone Charms'
    };

    labelEl.innerText = categoryNames[category] || 'All Items';
}

// ==========================================
// CARD RENDERING
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
                    <button onclick="quickAddToCart(${p.id})" class="px-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white transition-all text-xs font-bold shadow-sm flex items-center gap-1">
                        <i class="fa-solid fa-plus"></i> Add to Bag
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// SEARCH & FILTERING LOGIC
// ==========================================
function updateShopCategoryCounts() {
    document.getElementById('cnt-all').innerText = PRODUCTS.length;
    document.getElementById('cnt-bracelets').innerText = PRODUCTS.filter(p => p.category === 'bracelets').length;
    document.getElementById('cnt-necklaces').innerText = PRODUCTS.filter(p => p.category === 'necklaces').length;
    document.getElementById('cnt-phone-charms').innerText = PRODUCTS.filter(p => p.category === 'phone-charms').length;
}

function setShopCategory(category) {
    shopState.category = category;
    updateCategoryActiveLabel(category);

    const catButtons = document.querySelectorAll('.shop-cat-btn');
    catButtons.forEach(btn => {
        btn.className = "shop-cat-btn w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-gray-600 hover:bg-pink-100/60";
    });

    const activeBtn = document.getElementById(`shop-cat-${category}`);
    if (activeBtn) {
        activeBtn.className = "shop-cat-btn w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between bg-pink-500 text-white font-bold shadow-xs";
    }

    renderShopProducts();
}

function handleSearchInput() {
    const query = document.getElementById('shop-search-input').value.trim();
    shopState.searchQuery = query.toLowerCase();

    const clearBtn = document.getElementById('search-clear-btn');
    if (query.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    renderShopProducts();
}

function clearSearch() {
    document.getElementById('shop-search-input').value = '';
    shopState.searchQuery = '';
    document.getElementById('search-clear-btn').classList.add('hidden');
    renderShopProducts();
}

function handleSortChange(val) {
    shopState.sortBy = val;
    renderShopProducts();
}

function resetShopFilters() {
    shopState = {
        category: 'all',
        searchQuery: '',
        sortBy: 'featured'
    };

    document.getElementById('shop-search-input').value = '';
    document.getElementById('search-clear-btn').classList.add('hidden');
    document.getElementById('shop-sort-select').value = 'featured';

    setShopCategory('all');
    collapseCategoryAccordion();
}

function renderShopProducts() {
    const grid = document.getElementById('shop-product-grid');
    const emptyState = document.getElementById('shop-empty-state');
    const countLabel = document.getElementById('product-results-count');

    if (!grid) return;

    let items = PRODUCTS.filter(p => {
        if (shopState.category !== 'all' && p.category !== shopState.category) return false;
        if (shopState.searchQuery !== '') {
            const matchName = p.name.toLowerCase().includes(shopState.searchQuery);
            const matchTag = p.tag.toLowerCase().includes(shopState.searchQuery);
            const matchDesc = p.description.toLowerCase().includes(shopState.searchQuery);
            if (!matchName && !matchTag && !matchDesc) return false;
        }
        return true;
    });

    if (shopState.sortBy === 'price-low') {
        items.sort((a, b) => a.price - b.price);
    } else if (shopState.sortBy === 'price-high') {
        items.sort((a, b) => b.price - a.price);
    } else if (shopState.sortBy === 'rating') {
        items.sort((a, b) => b.rating - a.rating);
    }

    countLabel.innerText = items.length;

    if (items.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        grid.innerHTML = items.map(createProductCardHTML).join('');
    }
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
