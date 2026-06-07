/* ============================================================
   BLUER — Shopify Theme JS
   Cart AJAX, Nav Drawer, Variant Selection, Filters
   ============================================================ */

'use strict';

/* ---- Helpers --------------------------------------------- */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

function formatMoney(cents) {
  const amount = (cents / 100).toFixed(2);
  return window.Shopify && Shopify.currency
    ? Shopify.currency.active + ' ' + amount
    : amount;
}

/* ---- Cart ------------------------------------------------- */
const Cart = {
  async get() {
    const res = await fetch('/cart.js', { headers: { 'Content-Type': 'application/json' } });
    return res.json();
  },

  async add(variantId, quantity = 1) {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    });
    return res.json();
  },

  async update(updates) {
    const res = await fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    return res.json();
  },

  async change(variantId, quantity) {
    const res = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity })
    });
    return res.json();
  }
};

/* ---- Cart Count ------------------------------------------ */
function updateCartCount(count) {
  const el = $('#cart-count');
  if (!el) return;
  el.textContent = count;
  el.style.display = count > 0 ? 'inline-flex' : 'none';
}

/* ---- ATB Toast ------------------------------------------- */
let toastTimer;
function showToast(message) {
  let toast = $('#atb-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'atb-toast';
    toast.className = 'atb-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

/* ---- Cart Drawer ----------------------------------------- */
const CartDrawer = {
  el: null,
  bodyEl: null,
  footerEl: null,

  init() {
    this.el = $('#cart-drawer');
    this.bodyEl = $('#cart-drawer-body');
    this.footerEl = $('#cart-drawer-footer');

    const closeBtn = $('#cart-close');
    const overlay = $('#cart-overlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (overlay) overlay.addEventListener('click', () => this.close());
  },

  open() {
    if (!this.el) return;
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.refresh();
  },

  close() {
    if (!this.el) return;
    this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  async refresh() {
    const cart = await Cart.get();
    updateCartCount(cart.item_count);
    this.render(cart);
  },

  render(cart) {
    if (!this.bodyEl) return;
    if (cart.item_count === 0) {
      this.bodyEl.innerHTML = '<p class="cart-empty-msg text-editorial-sm">Your bag is empty</p>';
      if (this.footerEl) this.footerEl.style.display = 'none';
      return;
    }

    const items = cart.items.map(item => `
      <div class="cart-drawer__item">
        <div class="cart-drawer__item-img">
          ${item.image ? `<img src="${item.image}" alt="${item.product_title}" loading="lazy">` : ''}
        </div>
        <div>
          <p class="cart-drawer__item-title">${item.product_title}</p>
          ${item.variant_title && item.variant_title !== 'Default Title'
            ? `<p class="cart-drawer__item-price">${item.variant_title}</p>` : ''}
          <p class="cart-drawer__item-price">${formatMoney(item.final_line_price)}</p>
          <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
            <div class="quantity-control">
              <button class="qty-btn btn-reset" data-variant="${item.variant_id}" data-action="decrease">−</button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn btn-reset" data-variant="${item.variant_id}" data-action="increase">+</button>
            </div>
            <button class="btn-reset" data-remove="${item.variant_id}" style="color:var(--color-muted-fg);font-size:11px;letter-spacing:0.15em;text-transform:uppercase">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    this.bodyEl.innerHTML = items;
    if (this.footerEl) {
      this.footerEl.style.display = 'flex';
      const subtotalEl = $('#cart-subtotal-amount');
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    }

    // Quantity controls inside drawer
    $$('[data-action="decrease"]', this.bodyEl).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.variant;
        const item = cart.items.find(i => String(i.variant_id) === String(id));
        if (!item) return;
        const newQty = Math.max(0, item.quantity - 1);
        const updated = await Cart.change(id, newQty);
        updateCartCount(updated.item_count);
        this.render(updated);
      });
    });
    $$('[data-action="increase"]', this.bodyEl).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.variant;
        const item = cart.items.find(i => String(i.variant_id) === String(id));
        if (!item) return;
        const updated = await Cart.change(id, item.quantity + 1);
        updateCartCount(updated.item_count);
        this.render(updated);
      });
    });
    $$('[data-remove]', this.bodyEl).forEach(btn => {
      btn.addEventListener('click', async () => {
        const updated = await Cart.change(btn.dataset.remove, 0);
        updateCartCount(updated.item_count);
        this.render(updated);
      });
    });
  }
};

/* ---- Nav Drawer ------------------------------------------ */
const NavDrawer = {
  drawer: null,
  overlay: null,
  activePanel: null,

  init() {
    this.drawer = $('#nav-drawer');
    this.overlay = $('#nav-overlay');

    const openBtn = $('#menu-toggle');
    const closeBtn = $('#menu-close');
    if (openBtn) openBtn.addEventListener('click', () => this.open());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (this.overlay) this.overlay.addEventListener('click', () => this.close());

    // Category toggle buttons
    $$('.nav-sidebar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.panel;
        this.setPanel(target, btn);
      });
      btn.addEventListener('mouseenter', () => {
        const target = btn.dataset.panel;
        this.setPanel(target, btn);
      });
    });

    // Activate first panel by default
    const firstBtn = $('.nav-sidebar-btn');
    if (firstBtn) {
      this.setPanel(firstBtn.dataset.panel, firstBtn);
    }
  },

  setPanel(panelId, btn) {
    $$('.nav-sidebar-btn').forEach(b => b.classList.remove('is-active'));
    $$('.nav-links-panel').forEach(p => p.classList.remove('is-active'));
    if (btn) btn.classList.add('is-active');
    const panel = $(`#${panelId}`);
    if (panel) panel.classList.add('is-active');
  },

  open() {
    if (!this.drawer) return;
    this.drawer.classList.add('is-open');
    if (this.overlay) this.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove('is-open');
    if (this.overlay) this.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
};

/* ---- Add to Cart (Product Page) ------------------------- */
function initProductPage() {
  const form = $('#product-form');
  if (!form) return;

  const addBtn = $('#add-to-cart-btn');
  const variantBtns = $$('.variant-btn');
  let selectedVariantId = form.dataset.defaultVariant;

  // Variant selection
  variantBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      variantBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      selectedVariantId = btn.dataset.variantId;

      // Update price
      const priceEl = $('#product-price');
      if (priceEl && btn.dataset.price) {
        priceEl.textContent = formatMoney(parseInt(btn.dataset.price, 10));
      }

      // Update availability
      const available = btn.dataset.available === 'true';
      if (addBtn) {
        addBtn.textContent = available ? 'Add to Bag' : 'Get Notified';
        addBtn.disabled = false;
      }
    });
  });

  // Add to cart
  if (addBtn) {
    addBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const btn = addBtn;
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        await Cart.add(selectedVariantId, 1);
        const cart = await Cart.get();
        updateCartCount(cart.item_count);
        showToast('Added to bag');
        btn.textContent = originalText;
        btn.disabled = false;
        CartDrawer.refresh();
      } catch (err) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
}

/* ---- Quick Add (Collection / Homepage grids) ------------ */
function initQuickAdd() {
  $$('[data-quick-add]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.dataset.quickAdd;
      if (!variantId) return;
      btn.disabled = true;
      try {
        await Cart.add(variantId, 1);
        const cart = await Cart.get();
        updateCartCount(cart.item_count);
        showToast('Added to bag');
        btn.disabled = false;
      } catch (err) {
        btn.disabled = false;
      }
    });
  });
}

/* ---- Cart Page ------------------------------------------ */
function initCartPage() {
  const cartPage = $('.cart-page');
  if (!cartPage) return;

  // Tab switching
  $$('.cart-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.cart-tab-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const target = btn.dataset.tab;
      $$('[data-tab-panel]').forEach(p => {
        p.style.display = p.dataset.tabPanel === target ? '' : 'none';
      });
    });
  });

  // Quantity controls
  $$('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const variantId = btn.dataset.variant;
      const action = btn.dataset.action;
      const display = btn.parentElement.querySelector('.qty-display');
      let qty = parseInt(display?.textContent || '1', 10);
      qty = action === 'increase' ? qty + 1 : Math.max(0, qty - 1);

      try {
        const cart = await Cart.change(variantId, qty);
        updateCartCount(cart.item_count);
        // Reload page to reflect server-rendered cart state
        window.location.reload();
      } catch (err) {}
    });
  });

  // Remove buttons
  $$('[data-remove]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const cart = await Cart.change(btn.dataset.remove, 0);
        updateCartCount(cart.item_count);
        window.location.reload();
      } catch (err) {}
    });
  });
}

/* ---- Collection Filter ---------------------------------- */
function initCollectionFilter() {
  const filterToggle = $('#filter-toggle');
  const filterBar = $('#filter-bar');
  if (!filterToggle || !filterBar) return;

  filterToggle.addEventListener('click', () => {
    filterBar.classList.toggle('is-open');
  });

  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const sortVal = btn.dataset.sort;
      sortProducts(sortVal);
    });
  });
}

function sortProducts(sort) {
  const grid = $('#collection-grid');
  if (!grid) return;
  const cards = $$('.product-card', grid);
  cards.sort((a, b) => {
    if (sort === 'price-asc') return getPriceCents(a) - getPriceCents(b);
    if (sort === 'price-desc') return getPriceCents(b) - getPriceCents(a);
    return parseInt(a.dataset.index || '0', 10) - parseInt(b.dataset.index || '0', 10);
  });
  cards.forEach(c => grid.appendChild(c));
}

function getPriceCents(card) {
  return parseInt(card.dataset.price || '0', 10);
}

/* ---- Newsletter ----------------------------------------- */
function initNewsletter() {
  $$('.footer-email-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      if (!input || !btn) return;
      const orig = btn.textContent;
      btn.textContent = '...';
      btn.disabled = true;
      // Shopify handles newsletter via form POST to /contact#contact_form
      // For now show success message
      setTimeout(() => {
        input.value = '';
        btn.textContent = 'Done';
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 2000);
      }, 600);
    });
  });
}

/* ---- Cart page open drawer link ------------------------- */
function initCartTrigger() {
  $$('[data-open-cart]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      CartDrawer.open();
    });
  });
}

/* ---- Bootstrap ------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  CartDrawer.init();
  NavDrawer.init();
  initProductPage();
  initQuickAdd();
  initCartPage();
  initCollectionFilter();
  initNewsletter();
  initCartTrigger();

  // Initialise cart count from server
  Cart.get().then(cart => updateCartCount(cart.item_count));
});
