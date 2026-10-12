/* Prototype behaviour.
   Part A emulates what Motion does natively (sticky header, drawer, section
   animations, product grid).
   Part B is prototype-only (review tools, film player, pause control). */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- A1. Render Featured collection tiles (stands in for Liquid) ---------- */
  const grid = $("#productGrid");
  if (grid) LDT.bestsellers.forEach((p) => {
    const item = document.createElement("div");
    item.className = "grid__item grid-product small--one-half medium-up--one-quarter grid-product__has-quick-shop";
    item.innerHTML = `
      <div class="grid-product__content">
        <button type="button" class="quick-product__btn small--hide" aria-label="Quick view: ${p.title}"><span class="quick-product__label">Quick view</span></button>
        <a href="#" class="grid-product__link">
          <div class="grid-product__image-mask">
            <img class="grid-product__image" src="assets/products/${p.img}-1.jpg" alt="${p.title}" loading="lazy" width="800" height="1200">
            <img class="grid-product__secondary-image" src="assets/products/${p.img}-2.jpg" alt="" loading="lazy" width="800" height="1200">
          </div>
          <div class="grid-product__meta">
            <div class="grid-product__title">${p.title}</div>
            <div class="grid-product__price">${p.price}</div>
          </div>
        </a>
      </div>`;
    grid.appendChild(item);
  });

  /* ---------- A2. Render valley Collection list blocks ---------- */
  const vgrid = $("#valleyGrid");
  if (vgrid) LDT.valleys.forEach((v) => {
    const all = v === "All cloth";
    const slug = all ? "all" : v.toLowerCase();
    const item = document.createElement("div");
    item.className = "grid__item small--one-half medium-up--one-quarter collection--square-small skrim__item";
    item.innerHTML = `
      <a href="#" class="skrim__link skrim__item-content" aria-label="${all ? "Shop all tweed cloth" : "Shop " + v + " cloth"}">
        <div class="skrim__overlay grid__image"><img src="assets/img/valley-${slug}-swatch.jpg" alt="${all ? "" : v + " tweed"}" loading="lazy" width="600" height="730"></div>
        <div class="skrim__title"><div class="skrim__underline-me">${all ? "ALL CLOTH" : v.toUpperCase()}</div></div>
      </a>`;
    vgrid.appendChild(item);
  });

  /* ---------- A3. Sticky header (Motion: overlay on home, solid once scrolled) ---------- */
  const header = $("#siteHeader");
  const wrapper = $("#headerWrapper");
  const overlayHome = !!$("#shopify-section-hero");
  const onScroll = () => {
    const past = window.scrollY > 60;
    header.classList.toggle("site-header--stuck", past);
    if (overlayHome) wrapper.classList.toggle("header-wrapper--overlay", !past);   // Overlay header over homepage only
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- A4. Menu drawer ---------- */
  const drawer = $("#menuDrawer");
  const openBtn = $("#menuOpen");
  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    openBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $(".drawer__close", drawer).focus(); else openBtn.focus();
  };
  openBtn.addEventListener("click", () => setDrawer(true));
  $$("[data-close-drawer]", drawer).forEach((el) => el.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false); });

  /* ---------- A5. Section animations (Theme settings › Animations), once only ---------- */
  const animated = $$("[data-animate], [data-animate-image]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    animated.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    animated.forEach((el) => io.observe(el));
    // Elements already on screen at load
    requestAnimationFrame(() => animated.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-visible"); }));
  }

  /* ---------- B1. Hero video: respect reduced motion; pause control ---------- */
  const hv = $("#heroVideo");
  const pauseBtn = $("#heroPause");
  if (hv) {
    const setPaused = (paused) => {
      paused ? hv.pause() : hv.play().catch(() => {});
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute("aria-label", paused ? "Play background film" : "Pause background film");
      pauseBtn.classList.toggle("is-paused", paused);
    };
    if (reduceMotion) { hv.removeAttribute("autoplay"); setPaused(true); }
    // Motion adds .loaded to the hero once its media is ready, which starts the native text cascade
    const hero = $(".hero[data-aos=hero__animation]");
    const markLoaded = () => hero.classList.add("loaded");
    if (hv.readyState >= 2) markLoaded(); else { hv.addEventListener("loadeddata", markLoaded, { once: true }); setTimeout(markLoaded, 1200); }
    pauseBtn.addEventListener("click", () => setPaused(!hv.paused));
  }
  /* The film with sound lives on its own page (film.html = /pages/the-film): Motion only plays Vimeo in a pop-up from the Video hero. */

  /* ---------- B3. Shopify map: a build card on every section (data: js/build-data.js) ---------- */
  const B = window.LDT_BUILD || { steps: [], css: {} };
  const store = (k) => { try { return localStorage.getItem("ldt26:" + k) || ""; } catch (e) { return ""; } };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const filesPrefix = () => { const m = store("u-font").trim().match(/^(https:\/\/cdn\.shopify\.com\/s\/files\/[^?#]+\/)[^/?#]+/); return m ? m[1] : null; };
  const fillLinks = (t) => t.replace("{{HERO_URL}}", store("u-hero").trim() || "the hero video link (guide step 03)")
                            .replace("{{FILM_URL}}", store("u-film").trim() || "the Vimeo link (guide step 08)");
  const copyBtn = (text, label = "Copy") => `<button type="button" class="map-copy" data-copy="${esc(text)}">${label}</button>`;
  const cssText = (key) => (B.css[key] || "").replaceAll("{{FILES}}", filesPrefix() || "FILES_URL/");

  function cardHTML(st) {
    const inBand = st.n === "01" || st.n === "02";
    const open = inBand ? [] : (st.mapOpen || [0]);
    const groups = st.groups.map((g, i) => `<details${open.includes(i) ? " open" : ""}><summary>${esc(g.title)}</summary>` +
      g.rows.map(([label, value, copy]) => { const v = fillLinks(value); const c = copy === true ? v : copy;
        return `<div class="map-row"><span>${esc(label)}</span><span>${esc(v)}</span>${c ? copyBtn(c) : "<i></i>"}</div>`; }).join("") + `</details>`).join("");
    const files = st.files.length ? `<div class="map-files"><b>Files for this step</b>` + st.files.map((f) =>
      `<div class="map-row"><span>${esc(f.what)}</span><span>${f.href ? `<a href="${f.href}" download="${esc(f.download)}">${esc(f.name)} ↓</a>` : esc(f.name)}</span><i></i></div>`).join("") +
      `<small>Also in the handover folder <code>${esc(st.folder)}</code>, in ${[...new Set(st.files.map((f) => f.folder))].map((x) => `<code>${esc(x)}</code>`).join(" and ")}</small></div>` : "";
    const raw = B.css[st.css.key] || "", needsFiles = raw.includes("{{FILES}}");
    const n = (needsFiles && !filesPrefix()) ? raw.replaceAll("{{FILES}}", "https://cdn.shopify.com/s/files/1/0000/0000/0000/files/").length : cssText(st.css.key).length;
    const css = `<div class="map-css"><b>Custom CSS</b><span>Paste into <b>${esc(st.css.where)}</b>. ${n.toLocaleString()} of ${st.css.limit.toLocaleString()} characters${needsFiles && !filesPrefix() ? " (estimated)" : ""}.</span>` +
      (needsFiles && !filesPrefix() ? `<span class="map-css__wait">This CSS needs your Shopify Files link. Add it in <a href="build-guide.html#link-font">step 01 of the guide</a>, then come back.</span>`
        : `<button type="button" class="map-copy map-copy--css" data-css="${st.css.key}">Copy CSS</button>`) + `</div>`;
    return `<div class="map-card__head"><span class="map-card__n">${st.n}</span><span><b>${esc(st.title)}</b><small>Motion: ${esc(st.motion)} · ${esc(st.where)}</small></span>` +
      `<button type="button" class="map-card__min" aria-expanded="true" aria-label="Collapse card">–</button></div>` +
      `<div class="map-card__body"><p class="map-live map-live--${st.live.level}">${st.live.level === "safe" ? "✓ " : ""}${esc(st.live.text)}</p>${groups}${files}${css}<a class="map-guide" href="build-guide.html#step-${st.n}">Step ${st.n} in the build guide →</a></div>`;
  }
  const narrow = window.matchMedia("(max-width: 768px)");
  const band = document.createElement("div");
  band.className = "map-band"; band.setAttribute("aria-label", "Build steps 01 and 02");
  document.body.insertBefore(band, $("#shopify-section-announcement"));
  function renderMap() {
    band.innerHTML = "";
    $$(".map-card").forEach((c) => c.remove());
    B.steps.forEach((st) => {
      const global = st.n === "01" || st.n === "02";            // theme settings and header: shown in the top band
      const sec = $(`.shopify-section[data-step="${st.n}"]`);
      if (!global && !sec) return;                              // that section isn't on this page
      const card = document.createElement("aside");
      card.className = "map-card"; card.dataset.step = st.n; card.innerHTML = cardHTML(st);
      if (global) band.appendChild(card);
      else { sec.classList.add("has-map-card"); sec.appendChild(card); }
      if (narrow.matches) setMin(card, true);                 // phones: every card starts as a one-line chip
    });
    sizeBand();
  }
  function setMin(card, min) {
    card.classList.toggle("is-min", min);
    const b = $(".map-card__min", card); b.textContent = min ? "+" : "–";
    b.setAttribute("aria-expanded", String(!min)); b.setAttribute("aria-label", min ? "Expand card" : "Collapse card");
    sizeBand();
  }
  function sizeBand() { document.documentElement.style.setProperty("--mapBandH", (document.documentElement.classList.contains("show-map") ? band.offsetHeight : 0) + "px"); }
  window.addEventListener("resize", sizeBand);
  document.addEventListener("click", async (e) => {
    const min = e.target.closest(".map-card__min");
    if (min) { const card = min.closest(".map-card"); setMin(card, !card.classList.contains("is-min")); return; }
    const b = e.target.closest(".map-copy"); if (!b) return;
    const text = b.dataset.css ? cssText(b.dataset.css) : b.dataset.copy;
    try { await navigator.clipboard.writeText(text); }
    catch (err) { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    const was = b.textContent; b.classList.add("ok"); b.textContent = "Copied ✓";
    setTimeout(() => { b.classList.remove("ok"); b.textContent = was; }, 1300);
  });
  band.addEventListener("toggle", sizeBand, true);
  const mapBtn = $('.review-bar__btn[data-toggle="map"]');
  const setMap = (on) => {
    mapBtn.setAttribute("aria-pressed", String(on));
    document.documentElement.classList.toggle("show-map", on);
    if (on) renderMap(); else sizeBand();
    try { sessionStorage.setItem("ldt26:map", on ? "1" : "0"); } catch (e) {}
  };
  mapBtn.addEventListener("click", () => setMap(mapBtn.getAttribute("aria-pressed") !== "true"));
  // Links pasted in the guide (another tab) update the cards
  window.addEventListener("storage", (e) => { if (e.key && e.key.startsWith("ldt26:u-") && document.documentElement.classList.contains("show-map")) renderMap(); });

  // ?map opens the map (also remembered for this tab); ?clean hides the bar
  const qs = new URLSearchParams(location.search);
  let mapWas = null; try { mapWas = sessionStorage.getItem("ldt26:map"); } catch (e) {}
  if (qs.has("map") || mapWas === "1") setMap(true);
  if (qs.has("clean")) $("#reviewBar").hidden = true;
  // Screenshot helpers: ?static shows everything immediately; ?y=1200 scrolls to an offset
  if (qs.has("static")) { document.documentElement.classList.add("no-anim"); animated.forEach((el) => el.classList.add("is-visible")); }
  if (qs.has("fullpage")) { document.documentElement.classList.add("fullpage"); $$("img[loading=lazy]").forEach((i) => i.loading = "eager"); }
  // Review helper: ?forcehover clones :hover rules onto .fh, then shows tile hover on card 1 and circle hover on card 2
  if (qs.has("forcehover") && grid) {
    const rules = [];
    for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch (e) { continue; }
      const walk = (list, media) => { for (const r of list) {
        if (r.selectorText && r.selectorText.includes(":hover")) { const t = r.selectorText.replace(/:hover/g, ".fh") + "{" + r.style.cssText + "}"; rules.push(media ? "@media " + media + "{" + t + "}" : t); }
        else if (r.media && r.cssRules) walk(r.cssRules, r.media.mediaText); } };
      walk(rs, null); }
    const st = document.createElement("style"); st.textContent = rules.join("\n"); document.head.appendChild(st);
    const cards = $$(".grid-product__content");
    cards[0].classList.add("fh");
    cards[1].classList.add("fh"); $(".quick-product__btn", cards[1]).classList.add("fh");
  }
  if (qs.has("novideo") && hv) { hv.pause(); $$("source", hv).forEach((s) => s.remove()); hv.removeAttribute("autoplay"); hv.load(); }
  if (qs.has("y")) document.fonts.ready.then(() => { window.scrollTo({ top: +qs.get("y"), behavior: "instant" }); onScroll(); });
})();
