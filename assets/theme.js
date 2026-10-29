// Frenchie Dad Club: cart drawer, category filters and the product page variant picker.
(() => {
  const FDC = window.FDC || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Shopify money format, e.g. "${{amount}}".
  function money(cents) {
    const fmt = FDC.moneyFormat || "${{amount}}";
    const n = (cents / 100);
    const withDelims = (num, dec, thou, sep) => {
      const [i, d] = num.toFixed(dec).split(".");
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, thou) + (d ? sep + d : "");
    };
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => ({
      amount: withDelims(n, 2, ",", "."),
      amount_no_decimals: withDelims(n, 0, ",", "."),
      amount_with_comma_separator: withDelims(n, 2, ".", ","),
      amount_no_decimals_with_comma_separator: withDelims(n, 0, ".", ","),
      amount_with_apostrophe_separator: withDelims(n, 2, "'", ".")
    }[k] ?? withDelims(n, 2, ",", ".")));
  }

  let toastT;
  function toast(msg) {
    const t = $("#toast"); if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
  }

  // Cart drawer
  const drawer = $("[data-cart-drawer]"), scrim = $("[data-cart-scrim]");
  async function getCart() { return (await fetch(FDC.routes.cart + ".js", { headers: { Accept: "application/json" } })).json(); }
  function renderCart(cart) {
    $$("[data-cart-count]").forEach(el => { el.textContent = cart.item_count; });
    if (!drawer) return;
    $("[data-cart-subtotal]", drawer).textContent = money(cart.total_price);
    const ul = $("[data-cart-lines]", drawer);
    if (!cart.items.length) { ul.innerHTML = `<li class="empty">Your cart is empty. The Classic Dad Hat is a good place to start.</li>`; return; }
    ul.innerHTML = cart.items.map((i, idx) => `
      <li>
        <a class="thumb" href="${esc(i.url)}">${i.image ? `<img src="${esc(i.image + (i.image.includes("?") ? "&" : "?") + "width=160")}" alt="">` : ""}</a>
        <div>
          <a class="nm" href="${esc(i.url)}">${esc(i.product_title)}</a>
          ${i.variant_title && !i.product_has_only_default_variant ? `<div class="dt">${esc(i.variant_title)}</div>` : ""}
          <div class="stepper" aria-label="Quantity">
            <button type="button" data-line="${idx + 1}" data-qty="${i.quantity - 1}" aria-label="Remove one">−</button>
            <span>${i.quantity}</span>
            <button type="button" data-line="${idx + 1}" data-qty="${i.quantity + 1}" aria-label="Add one">+</button>
          </div>
        </div>
        <div class="pr">${money(i.final_line_price)}</div>
      </li>`).join("");
  }
  async function openCart() {
    if (!drawer) { location.href = FDC.routes.cart; return; }
    drawer.hidden = false; scrim.hidden = false; document.body.classList.add("no-scroll");
    $("[data-cart-close]", drawer).focus();
    renderCart(await getCart());
  }
  function closeCart() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true; scrim.hidden = true; document.body.classList.remove("no-scroll");
  }
  $$("[data-cart-open]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); openCart(); }));
  scrim?.addEventListener("click", closeCart);
  $("[data-cart-close]")?.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
  drawer?.addEventListener("click", async e => {
    const b = e.target.closest("[data-line]"); if (!b) return;
    b.disabled = true;
    const res = await fetch(FDC.routes.cartChange + ".js", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ line: Number(b.dataset.line), quantity: Math.max(0, Number(b.dataset.qty)) })
    });
    renderCart(await res.json());
  });

  // Add to cart without leaving the page. Falls back to a normal form post if the request fails.
  document.addEventListener("submit", async e => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || !form.action.includes(FDC.routes.cartAdd)) return;
    e.preventDefault();
    const btn = form.querySelector("[type=submit]");
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(FDC.routes.cartAdd + ".js", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      const data = await res.json();
      if (!res.ok) { toast(data.description || data.message || "Couldn't add that. Try again."); return; }
      toast("Added " + (data.product_title || "to cart"));
      await openCart();
    } catch (err) {
      form.submit();
    } finally {
      if (btn) btn.disabled = form.dataset.soldOut === "true";
    }
  });

  // Category chips: filter cards in the grid next to them by product type
  $$("[data-filters]").forEach(bar => {
    const grid = bar.nextElementSibling;
    bar.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const cat = b.dataset.cat;
      $$("button", bar).forEach(x => x.setAttribute("aria-pressed", x === b));
      $$(".prod", grid).forEach(card => { card.hidden = cat !== "all" && card.dataset.type !== cat; });
    });
  });

  // Product page: pick a variant from the option radios
  const pdp = $("[data-product]");
  if (pdp) {
    const variants = JSON.parse($("[data-variants]", pdp).textContent);
    const form = $("[data-product-form]", pdp);
    const addBtn = $("[data-add]", pdp);
    const mainImg = () => $(".pdp-img", pdp);
    const showImage = src => { const img = mainImg(); if (img && src) { img.removeAttribute("srcset"); img.src = src; } };

    function update() {
      const chosen = $$("[data-option]:checked", pdp).sort((a, b) => a.dataset.option - b.dataset.option).map(r => r.value);
      chosen.forEach((v, i) => { const s = $(`[data-opt-value="${i}"]`, pdp); if (s) s.textContent = v; });
      const v = variants.find(x => x.options.every((o, i) => o === chosen[i]));
      if (!v) { addBtn.disabled = true; addBtn.textContent = "Unavailable"; form.dataset.soldOut = "true"; return; }
      $("[data-variant-id]", pdp).value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? "Add to cart" : "Sold out";
      form.dataset.soldOut = String(!v.available);
      $("[data-price]", pdp).innerHTML = money(v.price) + (v.compare_at_price > v.price ? ` <s>${money(v.compare_at_price)}</s>` : "");
      if (v.featured_media) {
        const thumb = $(`[data-media-id="${v.featured_media.id}"]`, pdp);
        if (thumb) { showImage(thumb.dataset.src); setCurrentThumb(thumb); }
      }
      const url = new URL(location.href); url.searchParams.set("variant", v.id);
      history.replaceState(null, "", url);
    }
    function setCurrentThumb(t) { $$("[data-thumbs] button", pdp).forEach(b => b.toggleAttribute("aria-current", b === t)); }
    pdp.addEventListener("change", e => { if (e.target.matches("[data-option]")) update(); });
    $("[data-thumbs]", pdp)?.addEventListener("click", e => {
      const t = e.target.closest("button"); if (!t) return;
      showImage(t.dataset.src); setCurrentThumb(t);
    });
  }

  // Header: parent links with children. Hover opens on a mouse; click, Enter, and Space toggle.
  const nav = $(".nav");
  const dropdowns = nav ? $$(".nav-item", nav) : [];
  const closeTimers = new WeakMap();
  const openedAt = new WeakMap();
  let touchedAt = 0;

  function recentTouch() { return Date.now() - touchedAt < 700; }
  function isOpen(item) { return item.classList.contains("is-open"); }
  function toggleBtn(item) { return $(".nav-toggle", item); }
  function panelOf(item) { return $(".nav-dropdown", item); }
  function panelLinks(item) { return $$(".nav-dropdown a", item); }

  function setOpen(item, open, focusFirst) {
    clearTimeout(closeTimers.get(item));
    if (!open) openedAt.set(item, 0);
    item.classList.toggle("is-open", open);
    const btn = toggleBtn(item);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) dropdowns.forEach(other => { if (other !== item) setOpen(other, false); });
    if (open && focusFirst) panelLinks(item)[0]?.focus();
  }

  if (dropdowns.length) {
    document.addEventListener("pointerdown", e => {
      if (e.pointerType === "touch") touchedAt = Date.now();
    }, true);

    dropdowns.forEach(item => {
      const btn = toggleBtn(item);
      const panel = panelOf(item);
      if (!btn || !panel) return;
      if (item.matches(":hover")) {
        setOpen(item, true);
        openedAt.set(item, performance.now());
      }

      btn.addEventListener("click", () => {
        const at = openedAt.get(item) || 0;
        if (at && performance.now() - at < 300) {
          openedAt.set(item, 0);
          setOpen(item, true);
          return;
        }
        setOpen(item, !isOpen(item));
      });

      item.addEventListener("pointerenter", e => {
        if (e.pointerType !== "mouse" || recentTouch()) return;
        const wasOpen = isOpen(item);
        setOpen(item, true);
        if (!wasOpen) openedAt.set(item, performance.now());
      });

      item.addEventListener("pointerleave", e => {
        if (e.pointerType !== "mouse" || recentTouch()) return;
        closeTimers.set(item, setTimeout(() => {
          if (panel.contains(document.activeElement) || item.matches(":hover")) return;
          setOpen(item, false);
        }, 150));
      });

      item.addEventListener("focusout", e => {
        if (item.contains(e.relatedTarget)) return;
        setOpen(item, false);
      });

      item.addEventListener("keydown", e => {
        const links = panelLinks(item);
        const index = links.indexOf(document.activeElement);
        if (e.key === "Escape") {
          if (!isOpen(item)) return;
          e.preventDefault();
          setOpen(item, false);
          btn.focus();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!isOpen(item) || document.activeElement === btn) setOpen(item, true, true);
          else if (index >= 0 && index < links.length - 1) links[index + 1].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (index > 0) links[index - 1].focus();
          else btn.focus();
        } else if (e.key === "Home" && index >= 0) {
          e.preventDefault();
          links[0]?.focus();
        } else if (e.key === "End" && index >= 0) {
          e.preventDefault();
          links[links.length - 1]?.focus();
        }
      });

      panel.addEventListener("click", e => {
        if (e.target.closest("a")) setOpen(item, false);
      });
    });

    document.addEventListener("click", e => {
      dropdowns.forEach(item => {
        if (!item.contains(e.target)) setOpen(item, false);
      });
    });

    nav.classList.add("nav-js");
  }

  const menuDrawer = $("details.mnav");
  const headerBar = $(".shopify-section-group-header-group") || $(".header");
  function syncMenuBounds() {
    if (!headerBar) return;
    const bottom = Math.max(0, headerBar.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty("--header-bottom", bottom + "px");
  }
  syncMenuBounds();
  window.addEventListener("resize", syncMenuBounds);
  window.addEventListener("scroll", syncMenuBounds, { passive: true });
  menuDrawer?.addEventListener("toggle", syncMenuBounds);
  menuDrawer?.querySelector("nav")?.addEventListener("click", e => {
    if (e.target.closest("a")) menuDrawer.open = false;
  });
})();
