/* Page Bois : titre grave, sommaire suivi, galeries decoupees au laser, visionneuse a loupe, billes. */
(function () {
  const { calme, $, $$, finPointeur } = window.GWC;
  const G = window.GW, GR = window.Gravure;

  /* Heros */
  const mot = $("#bois-mot");
  const g = new GR.Engraver(mot, { matiere: "braise", police: "serif", remplir: .94, hauteur: .92, duree: 1800 });
  if (calme || !window.gsap) g.graver("Bois", { instant: true });
  else {
    gsap.timeline({ delay: .35 })
      .add(() => g.graver("Bois"))
      .from(".heros-bois h1, .heros-bois .chapeau, .heros-bois .heros__actions, .fil-ariane", { y: 30, opacity: 0, duration: .9, ease: "power3.out", stagger: .1 }, .6);
    gsap.to(".heros-bois__fond img", { yPercent: 10, ease: "none", scrollTrigger: { trigger: ".heros-bois", start: "top top", end: "bottom top", scrub: true } });
  }

  /* Sommaire */
  const liens = $$(".sommaire a"), sections = liens.map((a) => document.getElementById(a.getAttribute("href").slice(1)));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    liens.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id ? "true" : "false"));
    const a = liens.find((x) => x.getAttribute("aria-current") === "true");
    a && a.parentElement.scrollTo({ left: a.offsetLeft - 40, behavior: calme ? "auto" : "smooth" });
  }), { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && io.observe(s));

  /* Produits par collection */
  $$("[data-produits]").forEach((r) => {
    r.dataset.produits.split(",").forEach((id) => { const p = G.produit(id); if (p) r.appendChild(GWC.carteProduit(p)); });
  });

  /* Galeries decoupees au laser : un cache se retire derriere le trait du laser */
  function decouper(v) {
    const path = $("path", v), svg = $("svg", v), cache = $(".cache", v);
    const w = v.clientWidth, h = v.clientHeight, o = 8, r = 6;
    svg.setAttribute("viewBox", `0 0 ${w + 2 * o} ${h + 2 * o}`);
    path.setAttribute("d", `M${o + r} ${o} H${o + w - r} Q${o + w} ${o} ${o + w} ${o + r} V${o + h - r} Q${o + w} ${o + h} ${o + w - r} ${o + h} H${o + r} Q${o} ${o + h} ${o} ${o + h - r} V${o + r} Q${o} ${o} ${o + r} ${o} Z`);
    if (calme || !window.gsap || !cache) { path.style.opacity = 0; cache && cache.remove(); return; }
    const L = path.getTotalLength();
    gsap.set(path, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 });
    gsap.timeline()
      .to(path, { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" })
      .to(cache, { scaleX: 0, duration: .9, ease: "power3.inOut", onComplete: () => cache.remove() }, .5)
      .to(path, { opacity: 0, duration: .5 }, 1.1);
  }
  const vignettes = $$(".vignette");
  if (!calme && window.gsap) vignettes.forEach((v) => { const c = document.createElement("span"); c.className = "cache"; v.appendChild(c); });
  const iov = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; iov.unobserve(e.target);
    const im = $("img", e.target), go = () => decouper(e.target);
    if (im.complete && im.naturalWidth) go(); else { im.addEventListener("load", go, { once: true }); im.addEventListener("error", go, { once: true }); setTimeout(go, 2500); }
  }), { threshold: .3 });
  vignettes.forEach((v) => iov.observe(v));

  /* Visionneuse a loupe */
  const dlg = $("#visionneuse"), vImg = $("#vis-img"), loupe = $("#vis-loupe"), scene = $("#vis-scene");
  let liste = [], idx = 0;
  function ouvrir(i) {
    idx = (i + liste.length) % liste.length;
    const v = liste[idx];
    vImg.src = v.dataset.src; vImg.alt = v.dataset.legende;
    $("#vis-legende").textContent = v.dataset.legende;
    $("#vis-num").textContent = `${idx + 1} / ${liste.length}`;
    loupe.style.backgroundImage = `url(${v.dataset.src})`;
    scene.classList.remove("zoom"); vImg.style.transform = "";
    if (!dlg.open) { dlg.showModal(); GWC.lenis && GWC.lenis.stop(); }
  }
  vignettes.forEach((v) => v.addEventListener("click", () => { liste = $$(".vignette", v.closest(".galerie")); ouvrir(liste.indexOf(v)); }));
  $("#vis-prec").addEventListener("click", () => ouvrir(idx - 1));
  $("#vis-suiv").addEventListener("click", () => ouvrir(idx + 1));
  $(".fermer", dlg).addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", () => GWC.lenis && GWC.lenis.start());
  dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") ouvrir(idx - 1); if (e.key === "ArrowRight") ouvrir(idx + 1); });
  if (finPointeur) {
    vImg.addEventListener("pointermove", (e) => {
      const r = vImg.getBoundingClientRect(), s = scene.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height, z = 2.6;
      loupe.style.opacity = 1;
      loupe.style.left = e.clientX - s.left - 95 + "px"; loupe.style.top = e.clientY - s.top - 95 + "px";
      loupe.style.backgroundSize = `${r.width * z}px ${r.height * z}px`;
      loupe.style.backgroundPosition = `${-(fx * r.width * z - 95)}px ${-(fy * r.height * z - 95)}px`;
    });
    vImg.addEventListener("pointerleave", () => (loupe.style.opacity = 0));
  } else {
    vImg.addEventListener("click", (e) => {
      const z = scene.classList.toggle("zoom");
      if (z) { const r = vImg.getBoundingClientRect(); vImg.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; vImg.style.transform = "scale(2.2)"; }
      else vImg.style.transform = "";
    });
  }
  let x0 = null;
  scene.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  scene.addEventListener("touchend", (e) => { if (x0 == null || scene.classList.contains("zoom")) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) ouvrir(idx + (dx < 0 ? 1 : -1)); x0 = null; });

  /* Billes de dames chinoises qui roulent jusqu'a leur trou */
  const cb = $(".billes canvas");
  if (cb) {
    const x = cb.getContext("2d");
    const couleurs = ["#C8332B", "#E8B92E", "#EFEDE6", "#2F62B8", "#3E9B5B", "#1E1E1E"];
    let W, H, d, billes = [], t0 = null;
    const taille = () => {
      d = Math.min(devicePixelRatio || 1, 2); W = cb.width = cb.clientWidth * d; H = cb.height = cb.clientHeight * d;
      const n = Math.max(6, Math.min(18, Math.floor(W / (46 * d)))), pas = W / (n + 1);
      billes = Array.from({ length: n }, (_, i) => ({ cible: pas * (i + 1), x: W + 60 * d + i * 40 * d, c: couleurs[i % couleurs.length], r: Math.min(14 * d, pas * .3), retard: i * 90 }));
    };
    taille(); new ResizeObserver(taille).observe(cb);
    const dessiner = (ms) => {
      x.clearRect(0, 0, W, H);
      const y = H * .55;
      billes.forEach((b) => {
        x.fillStyle = "rgba(60,36,18,.35)"; x.beginPath(); x.ellipse(b.cible, y + b.r * .25, b.r * 1.05, b.r * .55, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = "rgba(40,22,10,.55)"; x.beginPath(); x.ellipse(b.cible, y + b.r * .2, b.r * .9, b.r * .45, 0, 0, Math.PI * 2); x.fill();
      });
      billes.forEach((b) => {
        if (t0 != null) {
          const t = Math.max(0, Math.min(1, (ms - t0 - b.retard) / 1100));
          const e = t < 1 ? 1 - Math.pow(1 - t, 3) * Math.cos(t * 7) * (1 - t) : 1;
          b.cx = b.depart + (b.cible - b.depart) * Math.min(1.04, e);
        } else b.cx = b.x;
        const g = x.createRadialGradient(b.cx - b.r * .35, y - b.r * .4, b.r * .1, b.cx, y, b.r);
        g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(.25, b.c); g.addColorStop(1, "rgba(0,0,0,.55)");
        x.fillStyle = g; x.beginPath(); x.arc(b.cx, y - b.r * .2, b.r, 0, Math.PI * 2); x.fill();
      });
    };
    const lancer = () => {
      if (calme) { billes.forEach((b) => (b.x = b.depart = b.cible)); t0 = -1e9; dessiner(0); return; }
      billes.forEach((b) => (b.depart = b.x)); t0 = performance.now();
      const boucle = (ms) => { dessiner(ms); if (ms - t0 < 1100 + billes.length * 90 + 200) requestAnimationFrame(boucle); };
      requestAnimationFrame(boucle);
    };
    dessiner(0);
    const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io2.disconnect(); lancer(); } }), { threshold: .6 });
    io2.observe(cb);
  }

  /* Appel final */
  const pb = $("#plaque-bois");
  const gp = new GR.Engraver(pb, { matiere: "bois", police: "cursive", remplir: .82, hauteur: .5, duree: 1600 });
  gp.cBrule.style.zIndex = 1; gp.cFx.style.zIndex = 2;
  gp.graver("Votre idée ici", { instant: true });
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); gp.graver("Votre idée ici"); } }), { threshold: .5 }).observe(pb);

  GWC.reveler(".collection__haut");
})();
(function () {
  const { calme, $ } = window.GWC;
  const t = $(".bande-chutes .trait");
  if (!t || calme || !window.gsap) return;
  gsap.fromTo(t, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".bande-chutes", start: "top 85%", end: "bottom 25%", scrub: .6 } });
  gsap.fromTo(".bande-chutes img", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".bande-chutes", start: "top bottom", end: "bottom top", scrub: true } });
})();
