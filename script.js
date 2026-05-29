const products = [
  {
    name: "Organic Jaggery",
    category: "Jaggery",
    price: 249,
    weight: "500g",
    rating: "4.9",
    desc: "Made from naturally grown sugarcane using traditional boiling methods without chemicals or bleaching."
  },
  {
    name: "Cold Pressed Mustard Oil",
    category: "Mustard Oil",
    price: 399,
    weight: "1L",
    rating: "4.8",
    desc: "Extracted using wooden ghani techniques to preserve natural aroma and nutrients."
  },
  {
    name: "A2 Desi Ghee",
    category: "Ghee",
    price: 849,
    weight: "500ml",
    rating: "4.9",
    desc: "Prepared using the authentic bilona method from pure cow milk."
  },
  {
    name: "Raw Forest Honey",
    category: "Honey",
    price: 329,
    weight: "500g",
    rating: "4.7",
    desc: "Naturally collected and unprocessed honey rich in taste and nutrients."
  }
];

const cart = new Map();
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const categoryFilter = document.querySelector("#category-filter");
const cartDrawer = document.querySelector(".cart-drawer");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector("#cart-total");
const cartCounts = document.querySelectorAll(".cart-count");
const toast = document.querySelector(".toast");
const quickView = document.querySelector(".quick-view");

function formatPrice(value) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function productTemplate(product) {
  return `
    <article class="product-card" data-name="${product.name}" data-category="${product.category}">
      <span class="product-art" data-art="${product.category}" aria-hidden="true"></span>
      <span class="tag">${product.category} | ${product.weight}</span>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="product-meta">
        <strong class="price">${formatPrice(product.price)}</strong>
        <span class="rating">★★★★★ <span>${product.rating}</span></span>
      </div>
      <div class="product-actions">
        <button class="btn primary" data-add="${product.name}" type="button">Add To Cart</button>
        <button class="quick-btn" data-quick="${product.name}" type="button" aria-label="Quick view ${product.name}">+</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const visible = products.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const matchesQuery = [product.name, product.category, product.desc].join(" ").toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  grid.innerHTML = visible.length
    ? visible.map(productTemplate).join("")
    : '<p class="empty-state">No products matched that search.</p>';
}

function updateCart() {
  const items = [...cart.values()];
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCounts.forEach((count) => {
    count.textContent = totalQty;
  });
  cartTotal.textContent = formatPrice(total);

  cartItems.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="cart-item">
              <div>
                <strong>${item.name}</strong>
                <small>${item.weight} | ${formatPrice(item.price)}</small>
              </div>
              <div class="qty" aria-label="Quantity for ${item.name}">
                <button data-dec="${item.name}" type="button">-</button>
                <span>${item.qty}</span>
                <button data-inc="${item.name}" type="button">+</button>
              </div>
            </div>
          `
        )
        .join("")
    : "<p>Your cart is waiting for something pure.</p>";
}

function addToCart(name) {
  const product = products.find((item) => item.name === name);
  if (!product) return;

  const current = cart.get(name);
  cart.set(name, { ...product, qty: current ? current.qty + 1 : 1 });
  updateCart();
  showToast(`${name} added to cart`);
}

function changeQty(name, delta) {
  const item = cart.get(name);
  if (!item) return;

  const qty = item.qty + delta;
  if (qty <= 0) {
    cart.delete(name);
  } else {
    cart.set(name, { ...item, qty });
  }
  updateCart();
}

function openQuickView(name) {
  const product = products.find((item) => item.name === name);
  if (!product) return;

  quickView.querySelector(".quick-art").dataset.art = product.category;
  quickView.querySelector("#quick-category").textContent = `${product.category} | ${product.weight}`;
  quickView.querySelector("#quick-title").textContent = product.name;
  quickView.querySelector("#quick-desc").textContent = product.desc;
  quickView.querySelector("#quick-rating").textContent = `${product.rating} customer rating`;
  quickView.querySelector("#quick-add").dataset.add = product.name;
  quickView.classList.add("open");
  quickView.setAttribute("aria-hidden", "false");
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const quickButton = event.target.closest("[data-quick]");
  const cartTrigger = event.target.closest(".cart-trigger");
  const closeCart = event.target.closest(".close-cart");
  const closeQuick = event.target.closest(".close-quick");
  const inc = event.target.closest("[data-inc]");
  const dec = event.target.closest("[data-dec]");
  const filterLink = event.target.closest("[data-filter-link]");

  if (addButton) addToCart(addButton.dataset.add);
  if (quickButton) openQuickView(quickButton.dataset.quick);
  if (cartTrigger) {
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
  }
  if (closeCart || event.target === cartDrawer) {
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
  }
  if (closeQuick || event.target === quickView) {
    quickView.classList.remove("open");
    quickView.setAttribute("aria-hidden", "true");
  }
  if (inc) changeQty(inc.dataset.inc, 1);
  if (dec) changeQty(dec.dataset.dec, -1);
  if (filterLink) {
    categoryFilter.value = filterLink.dataset.filterLink;
    renderProducts();
  }
});

document.querySelector("[data-open-search]").addEventListener("click", () => {
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Welcome to the Krishiroots family");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
renderProducts();
updateCart();
