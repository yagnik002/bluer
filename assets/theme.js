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
  // Header bag: render as bracketed text — "Your Bag (2)" — hidden when empty
  const el = $('#cart-count');
  if (el) {
    el.innerHTML = count > 0 ? ' (' + count + ')' : '';
  }
  // Mobile bottom-nav bag badge
  const badge = $('.mobile-nav-bag-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
  }
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
    if (openBtn) openBtn.addEventListener('click', () => {
      this.drawer && this.drawer.classList.contains('is-open') ? this.close() : this.open();
    });
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

    // Open the "Clothing" panel by default (design), falling back to the first.
    const defaultBtn = $('.nav-sidebar-btn[data-default="true"]') || $('.nav-sidebar-btn');
    if (defaultBtn) {
      this.setPanel(defaultBtn.dataset.panel, defaultBtn);
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
  const variantBtns = $$('.variant-btn, .variant-color-btn');
  let selectedVariantId = form.dataset.defaultVariant;

  function applyVariantChange(btn) {
    // Deactivate same type
    const isSizeBtn = btn.classList.contains('variant-btn');
    const isColorBtn = btn.classList.contains('variant-color-btn');
    if (isSizeBtn) $$('.variant-btn').forEach(b => b.classList.remove('is-active'));
    if (isColorBtn) $$('.variant-color-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    selectedVariantId = btn.dataset.variantId;

    // Update price
    const priceEl = $('#product-price');
    if (priceEl && btn.dataset.price) {
      priceEl.textContent = formatMoney(parseInt(btn.dataset.price, 10));
    }

    // Update availability — sold-out variants switch the button to "Notify me"
    const available = btn.dataset.available === 'true';
    if (addBtn) {
      if (available) {
        addBtn.textContent = 'ADD TO BAG';
        addBtn.disabled = false;
        addBtn.dataset.notify = '';
        addBtn.classList.remove('product-add-btn--notify');
      } else {
        addBtn.textContent = 'NOTIFY ME WHEN AVAILABLE';
        addBtn.disabled = false;
        addBtn.dataset.notify = 'true';
        addBtn.classList.add('product-add-btn--notify');
      }
    }

    // Update low stock
    const lowStockEl = $('#product-low-stock');
    if (lowStockEl) {
      try {
        const dataEl = $('#product-data');
        if (dataEl) {
          const data = JSON.parse(dataEl.textContent);
          const variant = data.variants.find(v => String(v.id) === String(selectedVariantId));
          if (variant && variant.inventory_quantity > 0 && variant.inventory_quantity <= 5) {
            lowStockEl.textContent = `Only ${variant.inventory_quantity} units left`;
            lowStockEl.style.display = 'block';
          } else {
            lowStockEl.style.display = 'none';
          }
        }
      } catch (_) {}
    }
  }

  // Variant selection
  variantBtns.forEach(btn => {
    btn.addEventListener('click', () => applyVariantChange(btn));
  });

  // Add to cart
  if (addBtn) {
    addBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Sold-out / notify mode: open the Get Notified popup instead of adding
      if (addBtn.dataset.notify === 'true') {
        if (window.openNotifyModal) window.openNotifyModal(selectedVariantId);
        return;
      }
      const btn = addBtn;
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';

      try {
        const addedItem = await Cart.add(selectedVariantId, 1);
        const cart = await Cart.get();
        updateCartCount(cart.item_count);
        btn.textContent = originalText;
        btn.disabled = false;
        if (AtbModal.el) {
          AtbModal.open(addedItem);
        } else {
          showToast('Added to bag');
          CartDrawer.refresh();
        }
      } catch (err) {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
}

/* ---- Quick Add (Collection / Homepage grids) ------------ */
async function quickAddVariant(variantId, btn) {
  if (!variantId) return;
  if (btn) btn.disabled = true;
  try {
    const addedItem = await Cart.add(variantId, 1);
    const cart = await Cart.get();
    updateCartCount(cart.item_count);
    if (btn) btn.disabled = false;
    if (AtbModal.el) {
      AtbModal.open(addedItem);
    } else {
      showToast('Added to bag');
    }
  } catch (err) {
    if (btn) btn.disabled = false;
  }
}

function initQuickAdd() {
  // Single-variant: "+" adds directly
  $$('[data-quick-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      quickAddVariant(btn.dataset.quickAdd, btn);
    });
  });

  // Multi-variant: "+" reveals a size picker; a size must be chosen before adding
  $$('[data-quick-add-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sizes = btn.parentElement.querySelector('.product-card__sizes');
      if (!sizes) return;
      const isOpen = !sizes.hidden;
      // Close any other open size pickers first
      $$('.product-card__sizes').forEach(s => { s.hidden = true; });
      sizes.hidden = isOpen;
    });
  });

  // Choosing a size adds that variant
  $$('.product-card__size-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await quickAddVariant(btn.dataset.addVariant, btn);
      const sizes = btn.closest('.product-card__sizes');
      if (sizes) sizes.hidden = true;
    });
  });

  // Click outside closes any open size picker
  document.addEventListener('click', (e) => {
    if (e.target.closest('.product-card__quick-add') || e.target.closest('.product-card__sizes')) return;
    $$('.product-card__sizes').forEach(s => { s.hidden = true; });
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

  // Size dropdown: swap the line to the chosen size's variant (remove old + add new)
  $$('.cart-item__size').forEach(sel => {
    sel.addEventListener('change', async () => {
      const oldVariant = sel.dataset.lineVariant;
      const newVariant = sel.value;
      const qty = parseInt(sel.dataset.qty || '1', 10);
      if (!newVariant || newVariant === oldVariant) return;
      try {
        await Cart.change(oldVariant, 0);
        await Cart.add(newVariant, qty);
      } catch (err) {}
      window.location.reload();
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

/* ---- Grid view toggle (collection page: cycle 4 / 2 / 1 columns) ---- */
function initGridView() {
  const toggle = $('#grid-view-toggle');
  const grid = $('#collection-grid');
  if (!toggle || !grid) return;

  const views = [4, 2, 1];
  let idx = 0;
  try {
    const saved = parseInt(localStorage.getItem('bluer-grid-view') || '4', 10);
    if (views.indexOf(saved) !== -1) idx = views.indexOf(saved);
  } catch (e) {}

  function apply() {
    const v = views[idx];
    grid.classList.remove('gv-4', 'gv-2', 'gv-1');
    grid.classList.add('gv-' + v);
    toggle.dataset.view = String(v);
    $$('.gvi', toggle).forEach(ic => { ic.style.display = 'none'; });
    const ic = toggle.querySelector('.gvi-' + v);
    if (ic) ic.style.display = 'block';
    try { localStorage.setItem('bluer-grid-view', String(v)); } catch (e) {}
  }
  apply();

  toggle.addEventListener('click', () => {
    idx = (idx + 1) % views.length;
    apply();
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

/* ---- Header search → dedicated search page -------------- */
/* Per design: clicking SEARCH opens the full search page (recommendations +
   featured below), rather than searching inline from the header. */
function initHeaderSearch() {
  const input = $('#header-search-input');
  if (!input) return;
  function go(e) {
    if (location.pathname.indexOf('/search') === 0) return; // already on search page
    e.preventDefault();
    window.location.href = '/search';
  }
  input.addEventListener('mousedown', go);
  input.addEventListener('focus', go);
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
/* ============================================================
   PRODUCT IMAGE GALLERY (mobile carousel dots)
   ============================================================ */
function initProductGallery() {
  const track = $('#product-gallery-track');
  const dotsWrap = $('#product-gallery-dots');
  if (!track || !dotsWrap) return;
  const dots = $$('.product-gallery__dot', dotsWrap);
  if (!dots.length) return;

  let ticking = false;
  function update() {
    ticking = false;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  }
  track.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
}

/* Full-screen image zoom (click a product image to open, click to zoom in/out) */
function initProductZoom() {
  const imgs = $$('.product-gallery__img');
  if (!imgs.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'product-zoom';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button class="product-zoom__close btn-reset" aria-label="Close">&times;</button>' +
    '<div class="product-zoom__stage" id="product-zoom-stage"></div>';
  document.body.appendChild(overlay);

  const stage = overlay.querySelector('#product-zoom-stage');
  const closeBtn = overlay.querySelector('.product-zoom__close');

  function openAt(src) {
    stage.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.className = 'product-zoom__img';
    img.addEventListener('click', (e) => {
      const zoomed = img.classList.toggle('is-zoomed');
      if (zoomed) {
        const r = img.getBoundingClientRect();
        const ox = ((e.clientX - r.left) / r.width) * 100;
        const oy = ((e.clientY - r.top) / r.height) * 100;
        img.style.transformOrigin = ox + '% ' + oy + '%';
      } else {
        img.style.transformOrigin = 'center center';
      }
    });
    stage.appendChild(img);
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  imgs.forEach((im) => {
    im.addEventListener('click', () => openAt(im.currentSrc || im.src));
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target === stage) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', () => {
  CartDrawer.init();
  NavDrawer.init();
  initProductPage();
  initProductGallery();
  initProductZoom();
  initQuickAdd();
  initCartPage();
  initCollectionFilter();
  initGridView();
  initNewsletter();
  initHeaderSearch();
  initCartTrigger();
  initFilterDrawer();
  initProductAccordions();
  initSizeGuideModal();
  initNotifyModal();
  initAtbModal();
  initMobileNav();
  initPincodeChecker();

  // Initialise cart count from server
  Cart.get().then(cart => updateCartCount(cart.item_count));
});

/* ============================================================
   FILTER DRAWER
   ============================================================ */
function initFilterDrawer() {
  const drawer = $('#filter-drawer');
  const toggle = $('#filter-toggle');
  const close = $('#filter-close');
  const overlay = $('#filter-overlay');
  const showItems = $('#filter-show-items');
  const clearAll = $('#filter-clear');
  if (!drawer) return;

  function openDrawer() {
    drawer.setAttribute('aria-hidden', 'false');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.setAttribute('aria-hidden', 'true');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle && toggle.addEventListener('click', openDrawer);
  close && close.addEventListener('click', closeDrawer);
  overlay && overlay.addEventListener('click', closeDrawer);

  // Size toggle
  $$('.filter-size-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('is-active'));
  });

  // Color toggle
  $$('.filter-color-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('is-active'));
  });

  // Clear all
  clearAll && clearAll.addEventListener('click', () => {
    $$('.filter-size-btn.is-active').forEach(b => b.classList.remove('is-active'));
    $$('.filter-color-btn.is-active').forEach(b => b.classList.remove('is-active'));
  });

  // Show items — close drawer and apply client-side sort/filter
  showItems && showItems.addEventListener('click', closeDrawer);
}

/* ============================================================
   PRODUCT ACCORDIONS
   ============================================================ */
function initProductAccordions() {
  $$('.product-accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      const body = trigger.nextElementSibling;
      if (body) body.classList.toggle('is-open', !expanded);
    });
  });
}

/* ============================================================
   SIZE GUIDE MODAL
   ============================================================ */
function initSizeGuideModal() {
  const modal = $('#size-chart-modal');
  const btn = $('#size-guide-btn');
  if (!modal) return;

  function open() { modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeFn() { modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  btn && btn.addEventListener('click', open);
  $$('[data-size-chart-close]').forEach((el) => el.addEventListener('click', closeFn));
}

/* ============================================================
   NOTIFY ME MODAL
   ============================================================ */
function initNotifyModal() {
  const modal = $('#notify-modal');
  const btn = $('#notify-me-btn');
  const close = $('#notify-close');
  const bg = $('#notify-bg');
  const submit = $('#notify-submit');
  const sizeSelect = $('#notify-size');
  const productEl = $('#notify-product');
  if (!modal) return;

  function open(preselectVariantId) {
    // Product name (design shows the product title above the size dropdown)
    const form = $('#product-form');
    if (productEl) productEl.textContent = form ? (form.dataset.productTitle || '') : '';

    // Populate size options from product variants (sold-out ones flagged)
    if (sizeSelect) {
      sizeSelect.innerHTML = '';
      $$('.variant-btn').forEach(vBtn => {
        const opt = document.createElement('option');
        opt.value = vBtn.dataset.variantId;
        opt.textContent = vBtn.textContent.trim() + (vBtn.dataset.available === 'true' ? '' : ' — Sold out');
        if (preselectVariantId && String(vBtn.dataset.variantId) === String(preselectVariantId)) opt.selected = true;
        sizeSelect.appendChild(opt);
      });
    }
    if (submit) { submit.textContent = 'GET NOTIFIED'; submit.disabled = false; }
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeFn() { modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  // Expose so the product page (sold-out / variant-change) can open it
  window.openNotifyModal = open;

  btn && btn.addEventListener('click', () => open());
  close && close.addEventListener('click', closeFn);
  bg && bg.addEventListener('click', closeFn);

  submit && submit.addEventListener('click', () => {
    const email = $('#notify-email');
    if (!email || !email.value) {
      if (email) email.focus();
      return;
    }
    submit.textContent = 'Done!';
    submit.disabled = true;
    setTimeout(() => closeFn(), 1500);
  });
}

/* ============================================================
   ADDED TO BAG MODAL
   ============================================================ */
const AtbModal = {
  el: null,
  overlay: null,
  close: null,
  productEl: null,

  init() {
    this.el = $('#added-to-bag-modal');
    this.overlay = $('#atb-overlay');
    this.close = $('#atb-close');
    this.productEl = $('#atb-product');
    if (!this.el) return;
    this.close && this.close.addEventListener('click', () => this.closeModal());
    this.overlay && this.overlay.addEventListener('click', () => this.closeModal());
  },

  open(item) {
    if (!this.el) return;
    if (this.productEl && item) {
      this.productEl.innerHTML = `
        ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width:80px;height:100px;object-fit:cover;flex-shrink:0">` : ''}
        <div class="atb-modal__product-info">
          <p class="atb-modal__product-name">${item.title}</p>
          <p class="atb-modal__product-price">${formatMoney(item.final_price)}</p>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="atb-modal__product-meta">${item.variant_title}</p>` : ''}
        </div>
      `;
    }
    this.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    this.el && this.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

function initAtbModal() {
  AtbModal.init();
}

/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const menuBtn = $('#mobile-menu-btn');
  const searchBtn = $('#mobile-search-btn');

  menuBtn && menuBtn.addEventListener('click', () => {
    const navDrawer = $('#nav-drawer');
    if (!navDrawer) return;
    // Toggle: tapping MENU opens the drawer, tapping again closes it (mobile has no X)
    navDrawer.classList.contains('is-open') ? NavDrawer.close() : NavDrawer.open();
  });

  searchBtn && searchBtn.addEventListener('click', () => {
    // Focus a visible header search field if there is one; otherwise go to the
    // dedicated search page (the mobile design's Search screen).
    const searchInput = $('.header-search-input');
    if (searchInput && searchInput.offsetParent !== null) {
      searchInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/search';
    }
  });
}

/* ============================================================
   PINCODE CHECKER
   ============================================================ */
function initPincodeChecker() {
  const input = $('#pincode-input');
  const btn = $('#pincode-apply');
  const result = $('#pincode-result');
  if (!input || !btn || !result) return;

  btn.addEventListener('click', () => {
    const pincode = input.value.trim();
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      result.textContent = 'Please enter a valid 6-digit pincode.';
      result.style.color = '#c0392b';
      return;
    }
    btn.textContent = '...';
    setTimeout(() => {
      btn.textContent = 'APPLY';
      result.textContent = 'Delivery available in 5–7 business days.';
      result.style.color = '#27ae60';
    }, 800);
  });
}

/* ---- Wishlist (localStorage) ---------------------------- */
(function () {
  var KEY = 'bluer_wishlist';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      el.textContent = list.length;
      el.style.display = list.length ? '' : 'none';
    });
  }
  function has(list, handle) {
    return list.some(function (i) { return i.handle === handle; });
  }

  function syncButtons() {
    var list = read();
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var on = has(list, btn.getAttribute('data-handle'));
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function toggle(btn) {
    var list = read();
    var handle = btn.getAttribute('data-handle');
    if (has(list, handle)) {
      list = list.filter(function (i) { return i.handle !== handle; });
    } else {
      list.push({
        handle: handle,
        title: btn.getAttribute('data-title'),
        url: btn.getAttribute('data-url'),
        price: btn.getAttribute('data-price'),
        image: btn.getAttribute('data-image')
      });
    }
    write(list);
    syncButtons();
    if (window.renderWishlist) window.renderWishlist();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wishlist-toggle]');
    if (!btn) return;
    e.preventDefault();
    toggle(btn);
  });

  // Render the wishlist page grid, if present
  window.renderWishlist = function () {
    var grid = document.getElementById('wishlist-grid');
    var empty = document.getElementById('wishlist-empty');
    if (!grid) return;
    var list = read();
    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = '';
      grid.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    grid.style.display = '';
    grid.innerHTML = list.map(function (i) {
      return '' +
        '<div class="product-card">' +
          '<a href="' + i.url + '" class="product-card__img-wrap" style="display:block">' +
            (i.image ? '<img class="product-card__img" src="' + i.image + '" alt="' + (i.title || '') + '" loading="lazy">' : '<div style="width:100%;aspect-ratio:3/4;background:var(--color-muted)"></div>') +
          '</a>' +
          '<button class="product-card__wishlist is-active btn-reset" data-wishlist-toggle data-handle="' + i.handle + '" data-title="' + (i.title || '') + '" data-url="' + i.url + '" data-price="' + (i.price || '') + '" data-image="' + (i.image || '') + '" aria-pressed="true" aria-label="Remove from wishlist">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6.716-4.297-9.193-7.07C.96 12.06 1.06 9.36 2.81 7.86c1.6-1.37 3.99-1.13 5.46.36L12 11.94l3.73-3.72c1.47-1.49 3.86-1.73 5.46-.36 1.75 1.5 1.85 4.2.003 6.07C18.716 16.703 12 21 12 21z"/></svg>' +
          '</button>' +
          '<div class="product-card__info">' +
            '<p class="product-card__title"><a href="' + i.url + '">' + (i.title || '') + '</a></p>' +
            '<p class="product-card__price">' + (i.price || '') + '</p>' +
          '</div>' +
        '</div>';
    }).join('');
  };

  syncButtons();
  write(read());
  if (window.renderWishlist) window.renderWishlist();
})();
