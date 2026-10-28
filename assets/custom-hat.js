// Live preview for the custom hat waitlist: logo line art, the dog's name in the wordmark's style, then the short rule.
(() => {
  const root = document.querySelector("[data-custom-hat]");
  if (!root) return;

  const FONT = "Montserrat, Helvetica Neue, Arial, sans-serif";
  const MARK_RATIO = 336 / 360;
  const HAT = {
    black: { crown: "#161616", thread: "#EDEBE4", name: "Black" },
    khaki: { crown: "#CDBF9F", thread: "#1A1A1A", name: "Khaki" },
    olive: { crown: "#4E5237", thread: "#EDEBE4", name: "Olive" },
    white: { crown: "#F4F3EF", thread: "#1A1A1A", name: "White" }
  };
  let uidN = 0;
  const uid = () => "ch" + (++uidN);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = sel => root.querySelector(sel);

  // The logo's line art, tinted any color through an alpha mask.
  function markLines(x, y, w, color) {
    const id = uid(), h = w * MARK_RATIO;
    return `<mask id="${id}"><image href="${window.FDC.markLines}" x="${x}" y="${y}" width="${w}" height="${h}"/></mask>` +
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" mask="url(#${id})"/>`;
  }

  function cap(o) {
    const id = uid();
    const [l1, l2] = o.lines;
    const fs1 = Math.min(17, 112 / (l1.length * 0.72));
    let s = `<svg viewBox="0 0 240 180" role="img" aria-label="${esc(l1 + " " + l2)} cap preview">`;
    s += `<defs><clipPath id="c${id}"><path d="M30 128 C28 62 70 30 120 30 C170 30 212 62 210 128 Z"/></clipPath></defs>`;
    s += `<ellipse cx="120" cy="170" rx="92" ry="7" fill="rgba(0,0,0,.08)"/>`;
    s += `<path d="M30 128 C28 62 70 30 120 30 C170 30 212 62 210 128 Z" fill="${o.crown}"/>`;
    s += `<g clip-path="url(#c${id})" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1.4"><path d="M120 30 C118 70 118 100 120 128"/><path d="M120 30 C92 48 74 86 70 128"/><path d="M120 30 C148 48 166 86 170 128"/></g>`;
    s += `<path d="M38 104 C60 60 100 40 120 38" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10" stroke-linecap="round"/>`;
    s += `<circle cx="120" cy="31" r="5.5" fill="${o.crown}" stroke="rgba(0,0,0,.2)"/>`;
    s += `<path d="M30 128 C70 118 170 118 210 128 C224 146 200 166 120 168 C40 166 16 146 30 128 Z" fill="${o.crown}"/>`;
    s += `<path d="M30 128 C70 118 170 118 210 128" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>`;
    s += `<path d="M36 136 C70 128 170 128 204 136" fill="none" stroke="${o.thread}" stroke-opacity=".3" stroke-width="1" stroke-dasharray="3 2.5"/>`;
    s += markLines(102, 44, 36, o.thread);
    s += `<text text-anchor="middle" font-family="${FONT}" fill="${o.thread}">`;
    s += `<tspan x="120" y="${(90 + fs1 * .78).toFixed(1)}" font-size="${fs1.toFixed(1)}" font-weight="600" letter-spacing="1.4">${esc(l1)}</tspan>`;
    s += `<tspan x="120" y="${(96 + fs1 + 8).toFixed(1)}" font-size="8" font-weight="600" letter-spacing="3">${esc(l2)}</tspan></text>`;
    s += `<rect x="112" y="${(96 + fs1 + 14).toFixed(1)}" width="16" height="1.6" fill="${o.thread}"/>`;
    return s + `</svg>`;
  }

  let hatSel = "black";
  const colors = $("[data-colors]");
  colors.innerHTML = Object.entries(HAT).map(([k, h]) =>
    `<button type="button" data-k="${k}" aria-pressed="false"><i style="background:${h.crown}"></i>${h.name}</button>`).join("");
  colors.addEventListener("click", e => { const b = e.target.closest("button"); if (b) { hatSel = b.dataset.k; render(); } });

  const yearInput = $("[data-year]");
  function state() {
    const raw = $("[data-dog]").value.trim().replace(/[^A-Za-z .'-]/g, "");
    const name = raw || "Your dog";
    const yr = /^\d{4}$/.test(yearInput.value) ? yearInput.value : yearInput.defaultValue;
    const dad = $("[data-dad]").value.trim().replace(/[^A-Za-z .'-]/g, "");
    const capName = (raw || "FRENCHIE").toUpperCase();
    const lines = [capName.endsWith("S") ? capName + "' DAD" : capName + "'S DAD", "SINCE " + yr];
    return { name, yr, dad, lines };
  }

  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
  function render() {
    const st = state();
    $("[data-cap]").innerHTML = cap({ crown: HAT[hatSel].crown, thread: HAT[hatSel].thread, lines: st.lines });
    set("[data-card-name]", st.name);
    set("[data-card-year]", st.yr);
    let h = 0; for (const ch of st.name + st.yr) h = (h * 31 + ch.charCodeAt(0)) % 9973;
    set("[data-card-no]", String(h % 10000).padStart(4, "0"));
    set("[data-card-sig]", st.dad ? st.dad : (st.name === "Your dog" ? "Club member" : `${st.name}'s Dad`));
    colors.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.k === hatSel));
  }
  ["[data-dog]", "[data-year]", "[data-dad]"].forEach(sel => $(sel).addEventListener("input", render));
  render();
})();
