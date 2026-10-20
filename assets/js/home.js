/* Accueil : ouverture gravee, heros, six matieres, simulateur, occasions, boutique, Noel, methode, atelier, devis. */
(function () {
  const { calme, $, $$, store, finPointeur } = window.GWC;
  const G = window.GW, GR = window.Gravure;
  const html = document.documentElement;
  const pin = !calme && matchMedia("(min-width: 900px)").matches;
  const PLANCHE = { w: 1168, h: 784, quad: [[228, 127], [1118, 257], [1088, 652], [50, 469]] };
  const PLANCHE_M = { w: 784, h: 1168, quad: [[230, 98], [568, 98], [572, 990], [228, 990]] };
  const visible = (el, cb, opts = { threshold: .25 }) => { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); cb(); } }), opts); io.observe(el); };
  const dateLocale = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  /* ---------- Heros ---------- */
  const lignes = $$(".heros h1 .ligne > span");
  const planche = $("#planche-heros");
  const gHeros = new GR.Engraver(planche, { matiere: "noyer", police: "cursive", remplir: .9, hauteur: .62, duree: 1500 });
  const placerHeros = () => GR.poser(gHeros, planche, PLANCHE, PLANCHE.quad, [.08, .92, .2, .8], "cover");
  placerHeros();
  GWC.surRedim(placerHeros);
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
    const flotte = flottants.map((f, i) => gsap.to(f, { y: "+=14", rotation: i % 2 ? 4 : -4, duration: 2.6 + i * .4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    GWC.pauseHorsEcran($(".heros"), flotte);
    if (finPointeur) {
      const qs = flottants.map((f) => ({ k: +f.dataset.prof || 1, x: gsap.quickTo(f, "x", { duration: 1.2, ease: "power3" }) }));
      addEventListener("pointermove", (e) => { if (scrollY > innerHeight) return; const dx = e.clientX / innerWidth - .5; qs.forEach((q) => q.x(dx * 36 * q.k)); }, { passive: true });
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

  /* ---------- Ouverture : une fois par session, decidee dans <head> avant le premier affichage ---------- */
  const ouv = $("#ouverture");
  if (ouv && html.classList.contains("avec-ouverture") && !calme && window.gsap) {
    store.sset("gw-ouverture", "1");
    const portrait = innerWidth / innerHeight < .85;
    const P = portrait ? PLANCHE_M : PLANCHE;
    const fond = $(".ouverture__img", ouv);
    GWC.lenis && GWC.lenis.stop();
    const g = new GR.Engraver(ouv, { matiere: "noyer", police: "serif", remplir: .86, hauteur: .58, duree: 1350 });
    g.cBrule.style.zIndex = 1; g.cFx.style.zIndex = 3;
    const marges = portrait ? [.06, .94, .38, .62] : [.08, .92, .24, .76];
    const fin = () => {
      if (ouv.dataset.fini) return; ouv.dataset.fini = "1";
      gsap.to(ouv, { clipPath: "inset(0 0 100% 0)", duration: .8, ease: "power4.inOut", onComplete: () => { ouv.remove(); html.classList.remove("avec-ouverture"); GWC.lenis && GWC.lenis.start(); } });
      entreeHeros(true);
    };
    $(".ouverture__passer", ouv).addEventListener("click", fin);
    gsap.set(ouv, { clipPath: "inset(0 0 0% 0)" });
    GR.poser(g, ouv, P, P.quad, marges, "cover", 16);
    gsap.from(fond, { scale: 1.08, duration: 2.6, ease: "power2.out" });
    setTimeout(() => g.graver("Gwenanou", { fin: () => setTimeout(fin, 260) }), 200);
    setTimeout(fin, 3000);
  } else {
    if (ouv) ouv.remove();
    html.classList.remove("avec-ouverture");
    entreeHeros(false);
  }

  /* ---------- Bandeau ---------- */
  const piste = $(".bandeau__piste");
  if (piste && !calme && window.gsap) {
    const tw = gsap.to(piste, { xPercent: -50, duration: 34, ease: "none", repeat: -1 });
    GWC.pauseHorsEcran($(".bandeau"), [tw]);
    if (GWC.lenis) GWC.lenis.on("scroll", ({ velocity }) => { if (!tw.paused()) gsap.to(tw, { timeScale: 1 + Math.min(6, Math.abs(velocity) * .35) * Math.sign(velocity || 1), duration: .25, overwrite: true }); });
  }

  /* ---------- Six matieres : fond, textes, photo, couleurs et selecteur lies au meme defilement ---------- */
  const secM = $("#matieres");
  const M = G.matieres, N = M.length;
  const txts = $$(".matiere-txt", secM), photos = $$(".plaque-photo", secM), rails = $$(".matieres__rail button", secM), replis = $$(".repli", secM);
  const canvasM = $(".matieres__fond canvas", secM), voileC = $(".matieres__voile--clair", secM), voileS = $(".matieres__voile--sombre", secM);
  const rail = $(".matieres__rail", secM), curseur = $(".rail__curseur", secM);
  const anime = !calme && !!window.gsap;
  const FEN = .28, DUR = .44; /* la transition occupe 44 % de l'intervalle entre deux matieres, le reste est au repos */
  const CLAIR = "#24170F", SOMBRE = "#F6F2EB";
  let actif = -1, gl = null, glPret = false, stM = null, tlM = null, vers = null;

  const chargerRepli = (k) => { const r = replis[k]; if (r && !r.dataset.ok) { r.style.backgroundImage = `url(${r.dataset.bg})`; r.dataset.ok = "1"; } };
  /* Fond : brulure WebGL quand elle est prete, sinon fondu entre les images nettes */
  const fond = { k: 0 };
  function majFond() {
    const k = fond.k, i = Math.min(N - 1, Math.floor(k)), f = k - i;
    chargerRepli(i); if (f > 0) chargerRepli(i + 1);
    replis.forEach((r, j) => (r.style.opacity = j === i ? 1 : j === i + 1 ? f : 0));
    if (gl && glPret) gl.set(k);
  }
  /* Etat accessible : uniquement la matiere la plus proche */
  function etat(i) {
    if (i === actif) return;
    actif = i;
    rails.forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
    txts.forEach((t, k) => { t.inert = k !== i; t.setAttribute("aria-hidden", k === i ? "false" : "true"); t.classList.toggle("est-active", k === i); });
    photos.forEach((p, k) => p.setAttribute("aria-hidden", k === i ? "false" : "true"));
    if (!anime) secM.classList.toggle("est-sombre", !!M[i].sombre);
    const b = rails[i];
    if (rail.scrollWidth > rail.clientWidth + 2) rail.scrollTo({ left: b.offsetLeft - (rail.clientWidth - b.offsetWidth) / 2, behavior: anime ? "smooth" : "auto" });
  }
  /* Cadre decoupe au laser autour de chaque photo */
  const cadres = photos.map((fig) => ({ fig, svg: $("svg", fig), path: $("path", fig), etin: $(".etincelle", fig), img: $("img", fig), L: 1, o: 10, v: null }));
  function laser(c, v) {
    c.v = v;
    c.path.style.strokeDashoffset = c.L * (1 - v);
    const p = c.path.getPointAtLength(c.L * v);
    c.etin.style.transform = `translate(${(p.x - c.o).toFixed(1)}px, ${(p.y - c.o).toFixed(1)}px)`;
  }
  function tracerCadres() {
    cadres.forEach((c) => {
      const w = c.fig.clientWidth, h = c.fig.clientHeight, r = 14, o = c.o;
      if (!w) return;
      c.svg.setAttribute("viewBox", `0 0 ${w + 2 * o} ${h + 2 * o}`);
      c.path.setAttribute("d", `M${o + r} ${o} H${o + w - r} Q${o + w} ${o} ${o + w} ${o + r} V${o + h - r} Q${o + w} ${o + h} ${o + w - r} ${o + h} H${o + r} Q${o} ${o + h} ${o} ${o + h - r} V${o + r} Q${o} ${o} ${o + r} ${o} Z`);
      c.L = c.path.getTotalLength(); c.path.style.strokeDasharray = c.L;
      if (c.v != null) laser(c, c.v);
    });
  }
  function montrerCalme(i) {
    etat(i);
    txts.forEach((t, k) => (t.style.opacity = k === i ? 1 : 0));
    photos.forEach((p, k) => (p.style.opacity = k === i ? 1 : 0));
    chargerRepli(i); replis.forEach((r, k) => r.classList.toggle("est-visible", k === i));
  }

  if (anime) {
    secM.classList.add("matieres--anime");
    tracerCadres();
    const MASQUE_PLEIN = "inset(-25% -6% -30% -6%)", MASQUE_HAUT = "inset(-25% -6% 130% -6%)", MASQUE_BAS = "inset(130% -6% -30% -6%)";
    const titres = txts.map((t) => $("h3", t)), paras = txts.map((t) => [...t.querySelectorAll("p")]);
    titres.forEach((h, k) => gsap.set(h, { y: k ? 50 : 0, clipPath: k ? MASQUE_BAS : MASQUE_PLEIN }));
    paras.forEach((e, k) => gsap.set(e, { opacity: k ? 0 : 1, y: k ? 22 : 0 }));
    photos.forEach((p, k) => gsap.set(p, { opacity: k ? 0 : 1 }));
    cadres.forEach((c, k) => { gsap.set(c.img, { clipPath: k ? "inset(0% 0% 100% 0% round 4px)" : "inset(0% 0% 0% 0% round 4px)" }); laser(c, k ? 0 : 1); });
    gsap.set(secM, { "--encre-m": M[0].sombre ? SOMBRE : CLAIR });
    gsap.set(voileS, { opacity: M[0].sombre ? 1 : 0 }); gsap.set(voileC, { opacity: M[0].sombre ? 0 : 1 });
    majFond();
    tlM = gsap.timeline({ paused: true, defaults: { ease: "none", immediateRender: false }, onUpdate: () => etat(Math.round(tlM.time())) });
    for (let i = 0; i < N - 1; i++) {
      const t0 = i + FEN, c = cadres[i + 1], px = { v: 0 };
      tlM.fromTo(fond, { k: i }, { k: i + 1, duration: DUR, onUpdate: majFond }, t0)
        /* le grand titre roule dans un masque ; les paragraphes se relaient sans se croiser */
        .fromTo(titres[i], { y: 0, clipPath: MASQUE_PLEIN }, { y: -40, clipPath: MASQUE_HAUT, duration: .13, ease: "power2.in" }, t0 + .03)
        .fromTo(titres[i + 1], { y: 50, clipPath: MASQUE_BAS }, { y: 0, clipPath: MASQUE_PLEIN, duration: .17, ease: "power3.out" }, t0 + .16)
        .fromTo(paras[i], { y: 0, opacity: 1 }, { y: -16, opacity: 0, duration: .12, stagger: .02, ease: "power1.in" }, t0 + .04)
        .fromTo(paras[i + 1], { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .16, stagger: .03, ease: "power2.out" }, t0 + .2)
        .fromTo(photos[i], { opacity: 1, scale: 1, rotation: 0 }, { opacity: 0, scale: .95, rotation: -2, duration: .22, ease: "power1.in" }, t0 + .08)
        .fromTo(photos[i + 1], { opacity: 0, scale: 1, rotation: 0 }, { opacity: 1, duration: .02 }, t0 + .02)
        .fromTo([c.path, c.etin], { opacity: 0 }, { opacity: 1, duration: .02 }, t0 + .02)
        .fromTo(px, { v: 0 }, { v: 1, duration: .24, ease: "power1.inOut", onUpdate: () => laser(c, px.v) }, t0 + .02)
        .fromTo(c.img, { clipPath: "inset(0% 0% 100% 0% round 4px)" }, { clipPath: "inset(0% 0% 0% 0% round 4px)", duration: .2, ease: "power2.inOut" }, t0 + .12)
        .fromTo([c.path, c.etin], { opacity: 1 }, { opacity: 0, duration: .06 }, t0 + .29)
        .fromTo(curseur, { x: () => rails[i].offsetLeft, width: () => rails[i].offsetWidth }, { x: () => rails[i + 1].offsetLeft, width: () => rails[i + 1].offsetWidth, duration: DUR, ease: "power2.inOut" }, t0);
      if (!!M[i].sombre !== !!M[i + 1].sombre) {
        const s0 = M[i].sombre ? 1 : 0, s1 = 1 - s0;
        tlM.fromTo(voileS, { opacity: s0 }, { opacity: s1, duration: DUR * .7 }, t0 + DUR * .15)
          .fromTo(voileC, { opacity: 1 - s0 }, { opacity: 1 - s1, duration: DUR * .7 }, t0 + DUR * .15)
          .fromTo(secM, { "--encre-m": s0 ? SOMBRE : CLAIR }, { "--encre-m": s1 ? SOMBRE : CLAIR, duration: DUR * .5 }, t0 + DUR * .25);
      }
    }
    tlM.set({}, {}, N - 1);
    const placerCurseur = () => { const t = tlM.time(); tlM.invalidate(); tlM.time(0, true); tlM.time(t, true); if (t === 0) gsap.set(curseur, { x: rails[0].offsetLeft, width: rails[0].offsetWidth }); };
    gsap.set(curseur, { x: rails[0].offsetLeft, width: rails[0].offsetWidth });
    if (document.fonts) document.fonts.ready.then(placerCurseur);
    GWC.surRedim(() => { tracerCadres(); placerCurseur(); });
  } else montrerCalme(0);
  etat(0);

  const preparerGL = () => {
    if (gl || !anime || preparerGL.fait) return;
    preparerGL.fait = true;
    try {
      gl = new window.Matiere(canvasM, M.map((m) => `assets/img/grok/texture-${m.id}-${pin ? 1600 : 800}.webp`));
      gl.pret.then(() => { glPret = true; gl.set(fond.k); canvasM.classList.add("est-visible"); });
    } catch (e) { gl = null; canvasM.hidden = true; }
  };
  if (pin && anime) GWC.approche(secM, () => { M.forEach((_, k) => chargerRepli(k)); preparerGL(); }, "900px");
  else ["pointerdown", "focusin"].forEach((t) => rail.addEventListener(t, preparerGL, { once: true }));

  if (pin && anime && window.ScrollTrigger) {
    stM = ScrollTrigger.create({ trigger: secM, start: "top top", end: () => "+=" + innerHeight * 4.6, pin: ".matieres__scene", animation: tlM, scrub: .45, anticipatePin: 1, invalidateOnRefresh: true });
    ScrollTrigger.addEventListener("refreshInit", tracerCadres);
    $("#matieres-aide").textContent = "Faites défiler pour changer de matière";
    /* Si l'on s'arrete au milieu d'une brulure, elle se termine en douceur vers la matiere la plus proche */
    if (GWC.lenis) {
      let att;
      GWC.lenis.on("scroll", () => {
        clearTimeout(att);
        att = setTimeout(() => {
          if (!stM.isActive || window.__gwSansAimant) return;
          const t = stM.progress * (N - 1), i = Math.floor(t), f = t - i;
          if (f <= FEN + .015 || f >= FEN + DUR - .015) return;
          const cible = i + (f < FEN + DUR / 2 ? FEN - .03 : FEN + DUR + .03);
          GWC.lenis.scrollTo(stM.start + (stM.end - stM.start) * (cible / (N - 1)), { duration: .85, easing: (x) => 1 - Math.pow(1 - x, 3) });
        }, 170);
      });
    }
  }
  const allerMatiere = (i) => {
    if (stM) { const y = stM.start + (stM.end - stM.start) * (i / (N - 1)) + 1; GWC.lenis ? GWC.lenis.scrollTo(y, { duration: 1.2 + .25 * Math.abs(i - actif) }) : scrollTo({ top: y, behavior: calme ? "auto" : "smooth" }); return; }
    if (tlM) {
      const de = tlM.time(), pas = Math.abs(i - de);
      for (let k = Math.min(i, Math.floor(de)); k <= Math.max(i, Math.ceil(de)); k++) chargerRepli(k);
      if (vers) vers.kill();
      vers = tlM.tweenTo(i, { duration: Math.min(2.2, .95 + .3 * Math.max(0, pas - 1)), ease: "power2.inOut" });
      return;
    }
    montrerCalme(i);
  };
  rails.forEach((b, i) => b.addEventListener("click", () => { if (!stM && secM.getBoundingClientRect().top < -60) GWC.allerA(secM); allerMatiere(i); }));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-matiere]");
    if (!a) return;
    const i = M.findIndex((m) => m.id === a.dataset.matiere);
    if (i < 0) return;
    e.preventDefault(); e.stopPropagation();
    if (!stM) GWC.allerA(secM);
    allerMatiere(i);
  }, true);
  /* Premiere apparition : le laser decoupe le cadre de la premiere photo */
  visible(secM, () => {
    if (!anime || (tlM && tlM.time() > .05)) return;
    const c = cadres[0], px = { v: 0 };
    gsap.set([c.path, c.etin], { opacity: 1 }); gsap.set(c.img, { clipPath: "inset(0% 0% 100% 0% round 4px)" }); laser(c, 0);
    gsap.timeline().to(px, { v: 1, duration: .85, ease: "power1.inOut", onUpdate: () => laser(c, px.v) })
      .to(c.img, { clipPath: "inset(0% 0% 0% 0% round 4px)", duration: .8, ease: "power3.inOut" }, .5)
      .to([c.path, c.etin], { opacity: 0, duration: .4 }, 1);
  }, { threshold: .3 });

  /* ---------- Simulateur ---------- */
  const plaque = $("#plaque"), form = $("#simu-form"), zone = $("#simu-texte"), cpt = $("#simu-compteur"), info = $("#simu-info"), pImg = $("#plaque-img");
  const gSimu = new GR.Engraver(plaque, { matiere: "bois", police: "serif", remplir: .8, hauteur: .5, interligne: 1.15, duree: 1700 });
  gSimu.cBrule.style.zIndex = 1; gSimu.cFx.style.zIndex = 2;
  const valeurs = () => ({ matiere: form.matiere.value, police: form.police.value, texte: zone.value.split("\n").slice(0, 2).join("\n").trim() || "Votre texte" });
  const majInfo = () => { const m = M.find((x) => x.id === form.matiere.value); info.textContent = `${m.nom}, ${m.des}`; cpt.textContent = `${zone.value.length} / 40`; };
  const simuler = (opts = {}) => { const v = valeurs(); majInfo(); return gSimu.graver(v.texte, Object.assign({ matiere: v.matiere, police: v.police }, opts)); };
  form.addEventListener("change", (e) => {
    if (e.target.name === "matiere") {
      const src = `assets/img/grok/texture-${e.target.value}-1600.webp`;
      if (window.gsap && !calme) gsap.to(pImg, { opacity: 0, duration: .25, onComplete: () => { pImg.onload = () => gsap.to(pImg, { opacity: 1, duration: .4 }); pImg.src = src; } });
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
  GWC.approche(plaque, () => gSimu.graver(valeurs().texte, { instant: true, matiere: "bois", police: "serif" }), "700px");
  visible(plaque, () => simuler(), { threshold: .45 });

  /* ---------- Occasions ---------- */
  const secO = $("#occasions"), pisteO = $(".occasions__piste", secO);
  if (pin && finPointeur && window.gsap) {
    secO.classList.add("est-epingle");
    const dernier = pisteO.lastElementChild;
    const dist = () => Math.max(0, dernier.offsetLeft + dernier.offsetWidth + parseFloat(getComputedStyle(pisteO).paddingRight) - innerWidth);
    const tw = gsap.to(pisteO, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: secO, start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
    /* Au clavier, la carte qui recoit le focus est amenee a l'ecran */
    pisteO.addEventListener("focusin", (e) => {
      const c = e.target.closest(".occasion, .occasion--fin"), st = tw.scrollTrigger;
      if (!c || !st) return;
      const p = Math.min(1, Math.max(0, (c.offsetLeft - innerWidth * .2) / (dist() || 1)));
      const y = st.start + (st.end - st.start) * p;
      GWC.lenis ? GWC.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    });
  }
  if (finPointeur && !calme && window.gsap) {
    $$(".occasion", secO).forEach((c) => {
      const rx = gsap.quickTo(c, "rotationY", { duration: .6, ease: "power3" }), ry = gsap.quickTo(c, "rotationX", { duration: .6, ease: "power3" });
      gsap.set(c, { transformPerspective: 900 });
      c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 12); ry(-((e.clientY - r.top) / r.height - .5) * 10); });
      c.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
    if (GWC.lenis && pin) {
      const imgs = $$(".occasion img", secO); let dans = false;
      new IntersectionObserver((es) => es.forEach((e) => (dans = e.isIntersecting))).observe(secO);
      GWC.lenis.on("scroll", ({ velocity }) => dans && gsap.to(imgs, { skewX: Math.max(-6, Math.min(6, velocity * -.3)), duration: .4, overwrite: true }));
    }
  }

  /* ---------- Boutique ---------- */
  const grille = $("#grille"), filtres = $("#filtres"), toutVoir = $("#tout-voir");
  let filtre = "tout", tout = false, rafraichir;
  const compter = (f) => (f === "tout" ? G.produits.length : G.produits.filter((p) => p.occ.includes(f)).length);
  filtres.innerHTML = G.filtres.map((f) => `<button class="filtre" type="button" data-f="${f.id}" aria-pressed="${f.id === "tout"}">${f.nom}<span aria-label="${compter(f.id)} créations">${compter(f.id)}</span></button>`).join("");
  function rendreBoutique(anime = true) {
    let liste = G.produits.filter((p) => filtre === "tout" || p.occ.includes(filtre));
    if (filtre === "tout" && !tout) liste = G.produits.filter((p) => p.selection).sort((a, b) => a.selection - b.selection);
    grille.innerHTML = "";
    const frag = document.createDocumentFragment();
    liste.forEach((p) => frag.appendChild(GWC.carteProduit(p)));
    grille.appendChild(frag);
    toutVoir.hidden = filtre !== "tout";
    toutVoir.textContent = tout ? "Revenir à la sélection" : "Voir les 34 créations";
    toutVoir.setAttribute("aria-expanded", tout);
    if (anime && window.gsap && !calme) gsap.from(grille.children, { y: 30, opacity: 0, duration: .6, ease: "power3.out", stagger: .04, clearProps: "opacity,transform" });
    clearTimeout(rafraichir);
    rafraichir = setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 150);
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
    if (n >= new Date(n.getFullYear(), 11, 26)) cible = new Date(n.getFullYear() + 1, 11, 25);
    const ms = Math.max(0, cible - n);
    const j = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
    $('[data-u="j"]', dec).textContent = j; $('[data-u="h"]', dec).textContent = h; $('[data-u="m"]', dec).textContent = m;
    if (ms === 0) $("#decompte-txt").textContent = "C’est Noël ! La collection reste disponible toute l’année.";
  }
  decompter(); setInterval(decompter, 30000);
  const np = $("#noel-produits");
  ["boule-de-noel-cerf", "boule-de-noel-joyeu-noel", "couronne-de-noel", "sapin-spiral", "maison-bougie-petit", "maison-bougie-grande"].forEach((id) => np.appendChild(GWC.carteProduit(G.produit(id), { mini: true })));
  const susp = $$(".suspension"), zoneS = $("#suspensions");
  const fils = () => susp.forEach((s) => { $(".fil", s).style.height = Math.round(zoneS.clientHeight * (+s.dataset.fil || 30) / 100) + "px"; });
  fils(); GWC.surRedim(fils);
  if (!calme && window.gsap) {
    const etats = susp.map(() => ({ a: 0, v: 0 }));
    let vit = 0, actifN = false;
    if (GWC.lenis) GWC.lenis.on("scroll", ({ velocity }) => (vit = velocity));
    susp.forEach((s, i) => s.addEventListener("pointerenter", (e) => { etats[i].v += (e.movementX || 4) * .04; }));
    new IntersectionObserver((es) => es.forEach((e) => (actifN = e.isIntersecting))).observe($("#noel"));
    etats.forEach((e, i) => (e.v = (i % 2 ? -1 : 1) * .012));
    /* Sciure en suspension : particules animees par le compositeur (aucun dessin image par image) */
    const zoneSciure = $(".noel .sciure"), secN = $("#noel");
    const hauteurSciure = () => zoneSciure.style.setProperty("--h", secN.offsetHeight + 40 + "px");
    hauteurSciure(); GWC.surRedim(hauteurSciure);
    const nb = innerWidth < 700 ? 22 : 40;
    let grains = "";
    for (let k = 0; k < nb; k++) {
      const t = (Math.random() * 2.2 + 1.2).toFixed(1), d = (9 + Math.random() * 9).toFixed(1), r = (-Math.random() * 18).toFixed(1);
      grains += `<i style="left:${(Math.random() * 100).toFixed(1)}%;--t:${t}px;--d:${d}s;--r:${r}s;--x:${(Math.random() * 80 - 40).toFixed(0)}px;--o:${(.3 + Math.random() * .45).toFixed(2)}"></i>`;
    }
    zoneSciure.innerHTML = grains;
    new IntersectionObserver((es) => es.forEach((e) => secN.classList.toggle("en-vue", e.isIntersecting))).observe(secN);
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
  }

  /* ---------- Du dessin a l'objet ---------- */
  const vis = $$(".visuel-etape"), legende = $("#etapes-legende"), etapes = $$(".etape");
  const trace = $("#trace-arbre"), cotes = $("#cotes");
  let traceL = 0, traceFait = false;
  GWC.approche($("#methode"), () => {
    fetch("assets/data/trace-arbre.json").then((r) => r.json()).then(({ d, box }) => {
      trace.setAttribute("d", d);
      const [x0, y0, x1, y1] = box, e = 26;
      cotes.innerHTML = `<path class="cote" d="M${x0} ${y1 + e} H${x1} M${x0} ${y1 + e - 7} V${y1 + e + 7} M${x1} ${y1 + e - 7} V${y1 + e + 7} M${x0 + 10} ${y1 + e - 4} L${x0} ${y1 + e} L${x0 + 10} ${y1 + e + 4} M${x1 - 10} ${y1 + e - 4} L${x1} ${y1 + e} L${x1 - 10} ${y1 + e + 4}"/>
        <path class="cote" d="M${x1 + e} ${y0} V${y1} M${x1 + e - 7} ${y0} H${x1 + e + 7} M${x1 + e - 7} ${y1} H${x1 + e + 7} M${x1 + e - 4} ${y0 + 10} L${x1 + e} ${y0} L${x1 + e + 4} ${y0 + 10} M${x1 + e - 4} ${y1 - 10} L${x1 + e} ${y1} L${x1 + e + 4} ${y1 - 10}"/>
        <path class="cote" d="M${(x0 + x1) / 2} ${y0 - 14} V${y1 + 14} M${x0 - 14} ${(y0 + y1) / 2} H${x1 + 14}" stroke-dasharray="6 4 1 4"/>`;
      traceL = trace.getTotalLength();
      if (calme) return;
      trace.style.strokeDasharray = traceL; trace.style.strokeDashoffset = traceFait ? 0 : traceL;
      $$(".cote", cotes).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = traceFait ? 0 : L; });
      if (etapeActive === 1) dessiner();
    }).catch(() => {});
  }, "800px");
  function dessiner() {
    if (traceFait || !traceL || calme || !window.gsap) return;
    traceFait = true;
    gsap.to(trace, { strokeDashoffset: 0, duration: 2.4, ease: "power1.inOut" });
    gsap.to($$(".cote", cotes), { strokeDashoffset: 0, duration: .9, ease: "power2.out", stagger: .2, delay: 1.6 });
  }
  let etapeActive = -1;
  function etape(i) {
    if (i === etapeActive) return;
    const avant = etapeActive; etapeActive = i;
    legende.textContent = `Étape ${i + 1} sur 4`;
    etapes.forEach((e, k) => e.classList.toggle("est-active", calme || k === i));
    vis.forEach((v, k) => { v.style.zIndex = k === i ? 2 : 1; v.setAttribute("aria-hidden", k === i ? "false" : "true"); });
    if (calme || !window.gsap) { vis.forEach((v, k) => (v.style.opacity = k === i ? 1 : 0)); return; }
    gsap.killTweensOf(vis);
    vis.forEach((v, k) => { if (k !== i && k !== avant) v.style.opacity = 0; });
    gsap.fromTo(vis[i], { clipPath: i > avant ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)", opacity: 1 }, { clipPath: "inset(0% 0 0% 0)", duration: .9, ease: "power3.inOut", onComplete: () => vis.forEach((v, k) => { if (k !== etapeActive) v.style.opacity = 0; }) });
    if (i === 1) dessiner();
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
  const dateFr = (v) => { const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); };
  function afficher(k, focus = true) {
    n = k;
    etF.forEach((f, i) => (f.hidden = i !== k));
    barre.style.width = Math.min(100, ((k + 1) / 6) * 100) + "%";
    bRet.hidden = k === 0;
    bSuiv.textContent = k === 4 ? "Vérifier ma demande" : k === 5 ? "Envoyer la demande" : "Continuer";
    err.hidden = true;
    if (k === 5) {
      const f = new FormData(fd);
      const lignes = [["Profil", f.get("profil")], ["Occasion", f.get("occasion")], ["Matière", f.get("matiere")], ["Objet", f.get("objet")], ["Texte", f.get("texte") || "—"], ["Fichier", $("#d-fichier").files[0] ? $("#d-fichier").files[0].name : "—"], ["Quantité", f.get("quantite")], ["Date souhaitée", f.get("date") ? dateFr(f.get("date")) : "—"], ["Budget", f.get("budget")], ["Nom", f.get("nom")], ["E-mail", f.get("email")], ["Téléphone", f.get("tel") || "—"]];
      $("#recap").innerHTML = lignes.map(([a]) => `<div><dt>${a}</dt><dd></dd></div>`).join("");
      $$("#recap dd").forEach((dd, i) => (dd.textContent = lignes[i][1]));
    }
    const leg = $("legend, h3", etF[k]);
    if (focus && leg) { leg.setAttribute("tabindex", "-1"); leg.focus({ preventScroll: true }); }
    if (window.gsap && !calme) gsap.from(etF[k], { x: 30, opacity: 0, duration: .45, ease: "power3.out", clearProps: "opacity,transform" });
  }
  function valider(k) {
    const manquants = champsRequis(k).filter((c) => (c.type === "checkbox" ? !c.checked : !c.value.trim()) || (c.type === "email" && !/^\S+@\S+\.\S+$/.test(c.value)));
    champsRequis(k).forEach((c) => { c.classList.toggle("erreur", manquants.includes(c)); c.setAttribute("aria-invalid", manquants.includes(c)); });
    if (manquants.length) {
      err.hidden = false;
      const c = manquants[0];
      err.textContent = GWC.fr(c.type === "email" && c.value ? "Vérifiez l’adresse e-mail : elle doit ressembler à nom@domaine.fr." : c.type === "checkbox" ? "Cochez la case pour que l’atelier puisse vous recontacter." : `Complétez le champ « ${$(`label[for="${c.id}"]`).textContent} ».`);
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
  fichier.addEventListener("change", () => { $("#depot-nom").textContent = fichier.files[0] ? `${fichier.files[0].name} (${Math.max(1, Math.round(fichier.files[0].size / 1024))} Ko), non envoyé dans la maquette` : "Le fichier reste sur votre appareil dans la maquette."; });
  ["dragenter", "dragover"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.add("survol"); }));
  ["dragleave", "drop"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.remove("survol"); }));
  depot.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) { fichier.files = e.dataTransfer.files; fichier.dispatchEvent(new Event("change")); } });
  $("#d-date").min = dateLocale(new Date());
  $$("[data-devis-matiere]").forEach((a) => a.addEventListener("click", () => { const m = M.find((x) => x.id === a.dataset.devisMatiere); const r = $(`#form-devis input[name=matiere][value="${m.nom}"]`); if (r) r.checked = true; }));
  afficher(0, false);

  /* ---------- Lien profond vers une matiere ou une section ---------- */
  const h = location.hash.replace("#", "");
  if (h.startsWith("matiere-")) { const i = M.findIndex((m) => "matiere-" + m.id === h); if (i >= 0) setTimeout(() => { if (!stM) GWC.allerA(secM); allerMatiere(i); }, 600); }
  else if (/^[a-z-]+$/.test(h) && document.getElementById(h)) setTimeout(() => GWC.allerA("#" + h), 500);
})();
