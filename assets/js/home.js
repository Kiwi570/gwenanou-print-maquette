/* Accueil : ouverture gravee, heros, six matieres, simulateur, occasions, boutique, Noel, methode, atelier, devis. */
(function () {
  const { calme, $, $$, store, finPointeur } = window.GWC;
  const G = window.GW, GR = window.Gravure;
  const large = () => innerWidth >= 900;
  const pin = !calme && matchMedia("(min-width: 900px)").matches;
  const PLANCHE = { w: 1168, h: 784, quad: [[228, 127], [1118, 257], [1088, 652], [50, 469]] };
  const PLANCHE_M = { w: 784, h: 1168, quad: [[230, 98], [568, 98], [572, 990], [228, 990]] };
  const visible = (el, cb, opts = { threshold: .25 }) => { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); cb(); } }), opts); io.observe(el); };

  /* ---------- Heros ---------- */
  const lignes = $$(".heros h1 .ligne > span");
  const planche = $("#planche-heros");
  const gHeros = new GR.Engraver(planche, { matiere: "noyer", police: "cursive", remplir: .9, hauteur: .62, duree: 1500 });
  const placerHeros = () => GR.poser(gHeros, planche, PLANCHE, PLANCHE.quad, [.08, .92, .2, .8], "cover");
  placerHeros();
  addEventListener("resize", () => { placerHeros(); });
  let texteHeros = "Votre prénom";
  const graverHeros = (t, opts) => { texteHeros = t || "Votre prénom"; return gHeros.graver(texteHeros, Object.assign({ police: texteHeros.length > 12 ? "serif" : "cursive" }, opts)); };
  const champ = $("#essai-prenom");
  let attente;
  champ.addEventListener("input", () => { clearTimeout(attente); attente = setTimeout(() => champ.value.trim() && graverHeros(champ.value.trim(), { duree: 1100 }), 700); });
  $("#essai").addEventListener("submit", (e) => { e.preventDefault(); clearTimeout(attente); graverHeros(champ.value.trim() || "Votre prénom", { duree: 1300 }); });
  if (finPointeur && !calme) {
    planche.addEventListener("pointermove", (e) => { const r = planche.getBoundingClientRect(); planche.style.setProperty("--lx", ((e.clientX - r.left) / r.width) * 100 + "%"); planche.style.setProperty("--ly", ((e.clientY - r.top) / r.height) * 100 + "%"); });
  }
  const flottants = $$(".flottant");
  if (!calme && window.gsap) {
    flottants.forEach((f, i) => gsap.to(f, { y: "+=14", rotation: i % 2 ? 4 : -4, duration: 2.6 + i * .4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    if (finPointeur) {
      const qs = flottants.map((f) => ({ k: +f.dataset.prof || 1, x: gsap.quickTo(f, "x", { duration: 1.2, ease: "power3" }) }));
      addEventListener("pointermove", (e) => { const dx = e.clientX / innerWidth - .5; qs.forEach((q) => q.x(dx * 36 * q.k)); }, { passive: true });
    }
    flottants.forEach((f) => gsap.to(f, { yPercent: -60 * (+f.dataset.prof || 1), ease: "none", scrollTrigger: { trigger: ".heros", start: "top top", end: "bottom top", scrub: true } }));
  }
  function entreeHeros(rapide) {
    if (calme || !window.gsap) { graverHeros("Votre prénom", { instant: true }); return; }
    const tl = gsap.timeline();
    tl.from(lignes, { yPercent: 110, duration: rapide ? .8 : 1.1, ease: "power4.out", stagger: .09 })
      .from(".heros .chapeau, .heros__actions, .heros__preuves", { y: 24, opacity: 0, duration: .8, ease: "power3.out", stagger: .08 }, "-=.6")
      .from(".planche-photo", { y: 40, opacity: 0, rotation: -1.5, duration: 1, ease: "power3.out" }, rapide ? 0 : "-=1.1")
      .from(flottants, { scale: .4, opacity: 0, duration: .9, ease: "back.out(1.7)", stagger: .08 }, "-=.6")
      .add(() => graverHeros(texteHeros), "-=.7");
  }

  /* ---------- Ouverture (une fois par session) ---------- */
  const ouv = $("#ouverture");
  const dejaVu = store.sget("gw-ouverture") === "1";
  if (ouv && !calme && !dejaVu && window.gsap) {
    store.sset("gw-ouverture", "1");
    ouv.hidden = false;
    const portrait = innerWidth / innerHeight < .85;
    const P = portrait ? PLANCHE_M : PLANCHE;
    const img = $(".ouverture__img", ouv);
    img.src = portrait ? "assets/img/grok/hero-planche-noyer-mobile-1200.webp" : "assets/img/grok/hero-planche-noyer-2400.webp";
    GWC.lenis && GWC.lenis.stop();
    const g = new GR.Engraver(ouv, { matiere: "noyer", police: "serif", remplir: .86, hauteur: .58, duree: 1350 });
    g.cBrule.style.zIndex = 1; g.cFx.style.zIndex = 3;
    const marges = portrait ? [.06, .94, .38, .62] : [.08, .92, .24, .76];
    const fin = () => {
      if (ouv.dataset.fini) return; ouv.dataset.fini = "1";
      gsap.to(ouv, { clipPath: "inset(0 0 100% 0)", duration: .8, ease: "power4.inOut", onComplete: () => { ouv.remove(); GWC.lenis && GWC.lenis.start(); } });
      entreeHeros(true);
    };
    $(".ouverture__passer", ouv).addEventListener("click", fin);
    gsap.set(ouv, { clipPath: "inset(0 0 0% 0)" });
    const go = () => {
      GR.poser(g, ouv, P, P.quad, marges, "cover", 16);
      gsap.from(img, { scale: 1.08, duration: 2.6, ease: "power2.out" });
      setTimeout(() => g.graver("Gwenanou", { fin: () => setTimeout(fin, 260) }), 220);
    };
    if (img.complete) go(); else { img.onload = go; img.onerror = go; }
    setTimeout(fin, 3000);
  } else {
    if (ouv) ouv.remove();
    entreeHeros(false);
  }

  /* ---------- Bandeau ---------- */
  const piste = $(".bandeau__piste");
  if (piste && !calme && window.gsap) {
    const tw = gsap.to(piste, { xPercent: -50, duration: 34, ease: "none", repeat: -1 });
    if (GWC.lenis) GWC.lenis.on("scroll", ({ velocity }) => { gsap.to(tw, { timeScale: 1 + Math.min(6, Math.abs(velocity) * .35) * Math.sign(velocity || 1), duration: .25, overwrite: true }); });
  }

  /* ---------- Six matieres ---------- */
  const secM = $("#matieres");
  const M = G.matieres;
  const txts = $$(".matiere-txt", secM), photos = $$(".plaque-photo", secM), rails = $$(".matieres__rail button", secM), replis = $$(".repli", secM);
  let actif = 0, gl = null;
  const canvasM = $(".matieres__fond canvas", secM);
  if (!calme) {
    try {
      gl = new window.Matiere(canvasM, M.map((m) => `assets/img/grok/texture-${m.id}-1600.webp`));
      canvasM.hidden = false;
      gl.pret.then(() => { replis.forEach((r) => (r.style.opacity = 0)); });
      new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? gl.demarrer() : gl.arreter())), { rootMargin: "100px" }).observe(secM);
      if (finPointeur) secM.addEventListener("pointermove", (e) => { const r = secM.getBoundingClientRect(); gl.souris = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; });
    } catch (e) { gl = null; canvasM.hidden = true; }
  }
  function decouper(fig) {
    const path = $("path", fig), svg = $("svg", fig), etin = $(".etincelle", fig), img = $("img", fig);
    const w = fig.clientWidth, h = fig.clientHeight, r = 14, o = 10;
    svg.setAttribute("viewBox", `0 0 ${w + 2 * o} ${h + 2 * o}`);
    path.setAttribute("d", `M${o + r} ${o} H${o + w - r} Q${o + w} ${o} ${o + w} ${o + r} V${o + h - r} Q${o + w} ${o + h} ${o + w - r} ${o + h} H${o + r} Q${o} ${o + h} ${o} ${o + h - r} V${o + r} Q${o} ${o} ${o + r} ${o} Z`);
    if (calme || !window.gsap) { path.style.opacity = 0; return; }
    const L = path.getTotalLength();
    const st = { v: 0 };
    gsap.killTweensOf([st, img, path, etin]);
    gsap.set(path, { strokeDasharray: L, strokeDashoffset: L, opacity: 1 });
    gsap.set(img, { clipPath: "inset(0 0 100% 0 round 4px)" });
    gsap.timeline()
      .to(st, { v: 1, duration: .75, ease: "power1.inOut", onUpdate: () => { const p = path.getPointAtLength(L * st.v); etin.style.left = p.x - o + "px"; etin.style.top = p.y - o + "px"; path.style.strokeDashoffset = L * (1 - st.v); } }, 0)
      .to(etin, { opacity: 1, duration: .1 }, 0)
      .to(etin, { opacity: 0, duration: .2 }, .7)
      .to(img, { clipPath: "inset(0 0 0% 0 round 4px)", duration: .8, ease: "power3.inOut" }, .55)
      .to(path, { opacity: 0, duration: .5 }, 1);
  }
  function montrer(i, force) {
    if (i === actif && !force) return;
    const avant = actif; actif = i;
    secM.classList.toggle("est-sombre", !!M[i].sombre);
    rails.forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
    txts.forEach((t, k) => { t.classList.toggle("est-active", k === i); t.setAttribute("aria-hidden", k === i ? "false" : "true"); });
    if (!gl) replis.forEach((r, k) => (r.style.opacity = k === i ? 1 : 0));
    if (window.gsap && !calme) {
      const dir = i > avant ? 1 : -1;
      gsap.to(txts[avant], { y: -40 * dir, opacity: 0, duration: .45, ease: "power2.in", overwrite: true });
      gsap.fromTo(txts[i], { y: 50 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: "power3.out", delay: .15, overwrite: true });
      gsap.to(photos[avant], { opacity: 0, scale: .96, rotation: -2 * dir, duration: .45, overwrite: true });
      gsap.fromTo(photos[i], { opacity: 1, scale: 1, rotation: 0 }, { opacity: 1, duration: .01, overwrite: true });
      decouper(photos[i]);
    } else {
      txts.forEach((t, k) => (t.style.opacity = k === i ? 1 : 0));
      photos.forEach((p, k) => (p.style.opacity = k === i ? 1 : 0));
    }
  }
  txts.forEach((t, k) => { if (k) t.style.opacity = 0; });
  let stM = null;
  if (pin && window.ScrollTrigger) {
    stM = ScrollTrigger.create({
      trigger: secM, start: "top top", end: () => "+=" + innerHeight * 4.2, pin: ".matieres__scene", scrub: .6, anticipatePin: 1,
      onUpdate: (s) => { const p = s.progress * (M.length - 1), i = Math.min(M.length - 2, Math.floor(p)), f = p - i, k = Math.max(0, Math.min(1, (f - .28) / .44)); gl && gl.set(i + k * k * (3 - 2 * k)); montrer(Math.min(M.length - 1, Math.round(p))); }
    });
  }
  const allerMatiere = (i) => {
    if (stM) { const y = stM.start + (stM.end - stM.start) * (i / (M.length - 1)) + 2; GWC.lenis ? GWC.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: calme ? "auto" : "smooth" }); }
    else { GWC.allerA(secM); montrer(i); gl && gl.set(i); }
  };
  rails.forEach((b, i) => b.addEventListener("click", () => allerMatiere(i)));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-matiere]");
    if (!a) return;
    const i = M.findIndex((m) => m.id === a.dataset.matiere);
    if (i < 0) return;
    e.preventDefault(); e.stopPropagation(); allerMatiere(i);
  }, true);
  visible(secM, () => decouper(photos[0]), { threshold: .3 });

  /* ---------- Simulateur ---------- */
  const plaque = $("#plaque"), form = $("#simu-form"), zone = $("#simu-texte"), cpt = $("#simu-compteur"), info = $("#simu-info"), pImg = $("#plaque-img");
  const gSimu = new GR.Engraver(plaque, { matiere: "bois", police: "serif", remplir: .8, hauteur: .5, interligne: 1.15, duree: 1700 });
  gSimu.cBrule.style.zIndex = 1; gSimu.cFx.style.zIndex = 2;
  const valeurs = () => ({ matiere: form.matiere.value, police: form.police.value, texte: zone.value.split("\n").slice(0, 2).join("\n").trim() || "Votre texte" });
  const majInfo = () => { const m = M.find((x) => x.id === form.matiere.value); info.textContent = `${m.nom}, ${m.des}`; cpt.textContent = `${zone.value.length} / 40`; };
  const simuler = (opts = {}) => { const v = valeurs(); majInfo(); return gSimu.graver(v.texte, Object.assign({ matiere: v.matiere, police: v.police }, opts)); };
  form.addEventListener("change", (e) => {
    if (e.target.name === "matiere") {
      const src = `assets/img/grok/texture-${e.target.value}-1600.webp`;
      if (window.gsap && !calme) gsap.to(pImg, { opacity: 0, duration: .25, onComplete: () => { pImg.src = src; pImg.onload = () => gsap.to(pImg, { opacity: 1, duration: .4 }); } });
      else pImg.src = src;
      setTimeout(() => simuler({ duree: 1300 }), calme ? 0 : 320);
    } else if (e.target.name === "police") simuler({ duree: 1300 });
  });
  zone.addEventListener("input", () => { if (zone.value.split("\n").length > 2) zone.value = zone.value.split("\n").slice(0, 2).join("\n"); majInfo(); });
  form.addEventListener("submit", (e) => { e.preventDefault(); simuler(); });
  $("#simu-devis").addEventListener("click", () => {
    const v = valeurs(), m = M.find((x) => x.id === v.matiere);
    const r = $(`#form-devis input[name=matiere][value="${m.nom}"]`); if (r) r.checked = true;
    $("#d-texte").value = v.texte;
    GWC.toast(`Votre texte et la matière ${m.nom.toLowerCase()} sont repris dans le devis.`);
  });
  majInfo();
  gSimu.graver(valeurs().texte, { instant: true, matiere: "bois", police: "serif" });
  visible(plaque, () => simuler(), { threshold: .45 });

  /* ---------- Occasions ---------- */
  const secO = $("#occasions"), pisteO = $(".occasions__piste", secO);
  if (pin && finPointeur && window.gsap) {
    secO.classList.add("est-epingle");
    const dist = () => pisteO.scrollWidth - innerWidth + 40;
    gsap.to(pisteO, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: secO, start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
  }
  if (finPointeur && !calme && window.gsap) {
    $$(".occasion", secO).forEach((c) => {
      const rx = gsap.quickTo(c, "rotationY", { duration: .6, ease: "power3" }), ry = gsap.quickTo(c, "rotationX", { duration: .6, ease: "power3" });
      gsap.set(c, { transformPerspective: 900 });
      c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 12); ry(-((e.clientY - r.top) / r.height - .5) * 10); });
      c.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
    if (GWC.lenis) { const imgs = $$(".occasion img", secO); GWC.lenis.on("scroll", ({ velocity }) => gsap.to(imgs, { skewX: Math.max(-6, Math.min(6, velocity * -.3)), duration: .4, overwrite: true })); }
  }

  /* ---------- Boutique ---------- */
  const grille = $("#grille"), filtres = $("#filtres"), toutVoir = $("#tout-voir");
  let filtre = "tout", tout = false;
  const compter = (f) => (f === "tout" ? G.produits.length : G.produits.filter((p) => p.occ.includes(f)).length);
  filtres.innerHTML = G.filtres.map((f) => `<button class="filtre" type="button" data-f="${f.id}" aria-pressed="${f.id === "tout"}">${f.nom}<span>${compter(f.id)}</span></button>`).join("");
  function carte(p) {
    const lien = p.page || p.url, ext = p.page ? "" : ' target="_blank" rel="noopener"';
    const el = document.createElement("article");
    el.className = "produit"; el.dataset.carte = ""; el.dataset.id = p.id;
    el.innerHTML = `<a class="produit__visuel" href="${lien}"${ext} tabindex="-1" aria-hidden="true"></a>
      <div class="produit__etiquette"><h3><a href="${lien}"${ext}>${p.nom}</a></h3>
      <p class="produit__detail">${[p.detail, p.options ? "3 options" : p.variantes ? "Plusieurs variantes" : ""].filter(Boolean).join(", ") || "&nbsp;"}</p>
      <div class="produit__meta"><span class="produit__prix">${p.variantes || p.options ? "<small>dès</small>" : ""}${G.prix(p.prix)}</span><button class="ajouter" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${p.nom} au panier">Ajouter</button></div></div>`;
    $(".produit__visuel", el).appendChild(GWC.imageProduit(p, 480));
    if (finPointeur && !calme && window.gsap) {
      const v = $(".produit__visuel", el);
      const rx = gsap.quickTo(v, "rotationY", { duration: .5 }), ry = gsap.quickTo(v, "rotationX", { duration: .5 });
      el.addEventListener("pointermove", (e) => { const r = v.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 14); ry(-((e.clientY - r.top) / r.height - .5) * 14); });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    }
    return el;
  }
  function rendreBoutique(anime = true) {
    let liste = G.produits.filter((p) => filtre === "tout" || p.occ.includes(filtre));
    if (filtre === "tout" && !tout) liste = G.produits.filter((p) => p.selection).sort((a, b) => a.selection - b.selection);
    grille.innerHTML = "";
    liste.forEach((p) => grille.appendChild(carte(p)));
    GWC.marquerProvisoires(grille);
    toutVoir.hidden = filtre !== "tout";
    toutVoir.textContent = tout ? "Revenir à la sélection" : "Voir les 34 créations";
    toutVoir.setAttribute("aria-expanded", tout);
    if (anime && window.gsap && !calme) gsap.from(grille.children, { y: 30, opacity: 0, duration: .6, ease: "power3.out", stagger: .04 });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }
  const choisir = (f) => { filtre = f; $$(".filtre", filtres).forEach((b) => b.setAttribute("aria-pressed", b.dataset.f === f)); rendreBoutique(); };
  filtres.addEventListener("click", (e) => { const b = e.target.closest(".filtre"); if (b) choisir(b.dataset.f); });
  toutVoir.addEventListener("click", () => { tout = !tout; rendreBoutique(); });
  document.addEventListener("gw:filtre", (e) => choisir(e.detail));
  $$("[data-filtre]").forEach((a) => a.addEventListener("click", () => setTimeout(() => choisir(a.dataset.filtre), 0)));
  rendreBoutique(false);

  /* ---------- Noel ---------- */
  const dec = $("#decompte");
  function decompter() {
    const n = new Date();
    let cible = new Date(n.getFullYear(), 11, 25, 0, 0, 0);
    if (n > new Date(n.getFullYear(), 11, 26)) cible = new Date(n.getFullYear() + 1, 11, 25);
    const ms = Math.max(0, cible - n);
    const j = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    $('[data-u="j"]', dec).textContent = j; $('[data-u="h"]', dec).textContent = h; $('[data-u="m"]', dec).textContent = m;
    if (ms === 0) $("#decompte-txt").textContent = "C’est Noël ! La collection reste disponible toute l’année.";
  }
  decompter(); setInterval(decompter, 30000);
  const np = $("#noel-produits");
  ["boule-de-noel-cerf", "boule-de-noel-joyeu-noel", "couronne-de-noel", "sapin-spiral", "maison-bougie-petit", "maison-bougie-grande"].forEach((id) => {
    const p = G.produit(id), el = document.createElement("article");
    el.className = "mini-produit"; el.dataset.carte = "";
    el.innerHTML = `<div class="mini-produit__img"></div><div><h3>${p.nom}${p.detail ? ", " + p.detail.toLowerCase() : ""}</h3><div><span class="produit__prix">${p.variantes ? "<small style=\"color:inherit;opacity:.7\">dès</small> " : ""}${G.prix(p.prix)}</span><button class="ajouter" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${p.nom} au panier">Ajouter</button></div></div>`;
    $(".mini-produit__img", el).appendChild(GWC.imageProduit(p, 480));
    np.appendChild(el);
  });
  GWC.marquerProvisoires(np);
  const susp = $$(".suspension");
  susp.forEach((s) => ($(".fil", s).style.height = (s.dataset.fil || 30) + "%"));
  susp.forEach((s) => { $(".fil", s).style.height = Math.round($("#suspensions").clientHeight * (+s.dataset.fil || 30) / 100) + "px"; });
  if (!calme && window.gsap) {
    const etats = susp.map(() => ({ a: 0, v: 0 }));
    let vit = 0;
    if (GWC.lenis) GWC.lenis.on("scroll", ({ velocity }) => (vit = velocity));
    susp.forEach((s, i) => s.addEventListener("pointerenter", (e) => { etats[i].v += (e.movementX || 4) * .04; }));
    let actifN = false;
    new IntersectionObserver((es) => es.forEach((e) => (actifN = e.isIntersecting))).observe($("#noel"));
    gsap.ticker.add(() => {
      if (!actifN) return;
      susp.forEach((s, i) => {
        const e = etats[i];
        e.v += -e.a * .012 * (1 + i * .15) + vit * .0006 - e.v * .025;
        e.a += e.v; e.a = Math.max(-.6, Math.min(.6, e.a));
        s.style.transform = `rotate(${(e.a * 57.3).toFixed(2)}deg)`;
      });
      vit *= .9;
    });
    etats.forEach((e, i) => (e.v = (i % 2 ? -1 : 1) * .012));
    // Sciure en suspension
    const c = $(".noel canvas.sciure"), x = c.getContext("2d");
    let W, H, parts = [];
    const taille = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = c.width = c.clientWidth * d; H = c.height = c.clientHeight * d; parts = Array.from({ length: Math.round(W * H / 26000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.8 + .6) * d, v: Math.random() * .5 + .25, o: Math.random() * Math.PI * 2 })); };
    taille(); new ResizeObserver(taille).observe(c);
    gsap.ticker.add(() => {
      if (!actifN) return;
      x.clearRect(0, 0, W, H);
      parts.forEach((p) => { p.y += p.v + Math.max(-2, Math.min(2, vit * .05)); p.o += .02; p.x += Math.sin(p.o) * .4; if (p.y > H) { p.y = -4; p.x = Math.random() * W; } if (p.y < -6) p.y = H; x.fillStyle = `rgba(246,226,196,${.35 + Math.sin(p.o) * .2})`; x.fillRect(p.x, p.y, p.r, p.r * .7); });
    });
  }

  /* ---------- Du dessin a l'objet ---------- */
  const vis = $$(".visuel-etape"), legende = $("#etapes-legende"), etapes = $$(".etape");
  const dessin = $$(".dessin .trace, .dessin .cote");
  dessin.forEach((p) => { const L = p.getTotalLength ? p.getTotalLength() : 1000; p.style.strokeDasharray = L; p.style.strokeDashoffset = calme ? 0 : L; p.dataset.l = L; });
  let etapeActive = -1;
  function etape(i) {
    if (i === etapeActive) return;
    const avant = etapeActive; etapeActive = i;
    legende.textContent = `Étape ${i + 1} sur 4`;
    etapes.forEach((e, k) => (e.style.opacity = calme ? 1 : k === i ? 1 : .35));
    vis.forEach((v, k) => { v.style.zIndex = k === i ? 2 : 1; });
    if (calme || !window.gsap) { vis.forEach((v, k) => (v.style.opacity = k === i ? 1 : 0)); return; }
    gsap.killTweensOf(vis);
    vis.forEach((v, k) => { if (k !== i && k !== avant) v.style.opacity = 0; });
    gsap.fromTo(vis[i], { clipPath: i > avant ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)", opacity: 1 }, { clipPath: "inset(0% 0 0% 0)", duration: .9, ease: "power3.inOut", onComplete: () => vis.forEach((v, k) => { if (k !== etapeActive) v.style.opacity = 0; }) });
    if (i === 1) gsap.to(dessin, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: .12 });
    if (i === 2) gsap.fromTo(".point-laser", { scale: .6, opacity: .4 }, { scale: 1.3, opacity: 1, duration: .5, repeat: 5, yoyo: true, ease: "sine.inOut" });
  }
  vis.forEach((v, k) => (v.style.opacity = k === 0 ? 1 : 0));
  etape(0);
  const proche = () => {
    const ligne = innerHeight * .58;
    let k = 0;
    etapes.forEach((e, i) => { if (e.getBoundingClientRect().top < ligne) k = i; });
    etape(k);
  };
  if (window.ScrollTrigger) ScrollTrigger.create({ trigger: ".etapes", start: "top bottom", end: "bottom top", onUpdate: proche, onRefresh: proche });
  else addEventListener("scroll", proche, { passive: true });

  /* ---------- Atelier ---------- */
  const traits = $("#veines-traits");
  if (traits) {
    let d = "";
    for (let i = 0; i < 18; i++) {
      const y = 12 + i * 22.5;
      let p = `M-20 ${y}`;
      for (let x = 0; x <= 340; x += 34) p += ` Q${x + 17} ${y + Math.sin(i * 1.7 + x / 40) * 9} ${x + 34} ${y + Math.cos(i + x / 50) * 4}`;
      d += `<path d="${p}" stroke-width="${calme ? 30 : 0}"/>`;
    }
    traits.innerHTML = d + (calme ? '<rect width="300" height="400" fill="#fff"/>' : "");
    const ps = $$("path", traits);
    if (!calme && window.gsap) gsap.to(ps, { attr: { "stroke-width": 30 }, duration: 1.4, ease: "power2.inOut", stagger: { each: .06, from: "random" }, scrollTrigger: { trigger: "#portrait", start: "top 75%", once: true }, onComplete: () => traits.insertAdjacentHTML("beforeend", '<rect width="300" height="400" fill="#fff"/>') });
  }
  if (!calme && window.gsap) {
    gsap.to(".atelier__bande img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".atelier__bande", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".noel__fond", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: "#noel", start: "top bottom", end: "bottom top", scrub: true } });
  }
  GWC.reveler(".entete-section, .atelier__texte > *, .boutique__bas");

  /* ---------- Devis ---------- */
  const fd = $("#form-devis"), etF = $$(".etape-form", fd), barre = $(".progression span", fd);
  const bSuiv = $("#devis-suivant"), bRet = $("#devis-retour"), err = $("#devis-erreur");
  let n = 0;
  const champsRequis = (k) => $$("[required]", etF[k]);
  function afficher(k) {
    n = k;
    etF.forEach((f, i) => (f.hidden = i !== k));
    barre.style.width = Math.min(100, ((k + 1) / 6) * 100) + "%";
    bRet.hidden = k === 0;
    bSuiv.textContent = k === 4 ? "Vérifier ma demande" : k === 5 ? "Envoyer la demande" : "Continuer";
    err.hidden = true;
    if (k === 5) {
      const f = new FormData(fd);
      const lignes = [["Profil", f.get("profil")], ["Occasion", f.get("occasion")], ["Matière", f.get("matiere")], ["Objet", f.get("objet")], ["Texte", f.get("texte") || "—"], ["Fichier", $("#d-fichier").files[0] ? $("#d-fichier").files[0].name : "—"], ["Quantité", f.get("quantite")], ["Date souhaitée", f.get("date") ? new Date(f.get("date")).toLocaleDateString("fr-FR") : "—"], ["Budget", f.get("budget")], ["Nom", f.get("nom")], ["E-mail", f.get("email")], ["Téléphone", f.get("tel") || "—"]];
      $("#recap").innerHTML = lignes.map(([a, b]) => `<div><dt>${a}</dt><dd></dd></div>`).join("");
      $$("#recap dd").forEach((dd, i) => (dd.textContent = lignes[i][1]));
    }
    const leg = $("legend, h3", etF[k]);
    if (leg && document.activeElement && fd.contains(document.activeElement)) { leg.setAttribute("tabindex", "-1"); leg.focus({ preventScroll: true }); }
    if (window.gsap && !calme) gsap.from(etF[k], { x: 30, opacity: 0, duration: .45, ease: "power3.out" });
  }
  function valider(k) {
    const manquants = champsRequis(k).filter((c) => (c.type === "checkbox" ? !c.checked : !c.value.trim()) || (c.type === "email" && !/^\S+@\S+\.\S+$/.test(c.value)));
    champsRequis(k).forEach((c) => c.classList.toggle("erreur", manquants.includes(c)));
    if (manquants.length) {
      err.hidden = false;
      const c = manquants[0];
      err.textContent = c.type === "email" && c.value ? "Vérifiez l’adresse e-mail : elle doit ressembler à nom@domaine.fr." : c.type === "checkbox" ? "Cochez la case pour que l’atelier puisse vous recontacter." : `Complétez le champ « ${$(`label[for="${c.id}"]`).textContent} ».`;
      c.focus(); return false;
    }
    return true;
  }
  bSuiv.addEventListener("click", () => {
    if (n < 5) { if (valider(n)) afficher(n + 1); return; }
    etF.forEach((f) => (f.hidden = true)); $("#devis-actions").hidden = true; barre.style.width = "100%";
    const c = $("#confirmation"); c.hidden = false; c.focus();
  });
  bRet.addEventListener("click", () => afficher(Math.max(0, n - 1)));
  $("#devis-nouveau").addEventListener("click", () => { fd.reset(); $("#confirmation").hidden = true; $("#devis-actions").hidden = false; $("#depot-nom").textContent = "Le fichier reste sur votre appareil dans la maquette."; afficher(0); });
  fd.addEventListener("submit", (e) => e.preventDefault());
  const fichier = $("#d-fichier"), depot = $("#depot");
  fichier.addEventListener("change", () => { $("#depot-nom").textContent = fichier.files[0] ? `${fichier.files[0].name} (${Math.max(1, Math.round(fichier.files[0].size / 1024))} Ko), non envoyé dans la maquette` : "Le fichier reste sur votre appareil dans la maquette."; });
  ["dragenter", "dragover"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.add("survol"); }));
  ["dragleave", "drop"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.remove("survol"); }));
  depot.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) { fichier.files = e.dataTransfer.files; fichier.dispatchEvent(new Event("change")); } });
  $("#d-date").min = new Date().toISOString().slice(0, 10);
  $$("[data-devis-matiere]").forEach((a) => a.addEventListener("click", () => { const m = M.find((x) => x.id === a.dataset.devisMatiere); const r = $(`#form-devis input[name=matiere][value="${m.nom}"]`); if (r) r.checked = true; }));
  afficher(0);
  bSuiv.blur && bSuiv.blur();

  /* ---------- Lien profond vers une matiere ---------- */
  const h = location.hash.replace("#", "");
  if (h.startsWith("matiere-")) { const i = M.findIndex((m) => "matiere-" + m.id === h); if (i >= 0) setTimeout(() => allerMatiere(i), 600); }
  else if (h && document.getElementById(h)) setTimeout(() => GWC.allerA("#" + h), 500);
})();
