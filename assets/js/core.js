/* Socle commun : animations reduites, defilement fluide, en-tete, curseur laser,
   panier simule, transitions de page, visuels provisoires. */
(function () {
  const html = document.documentElement;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* rien */ } }
  };
  const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const choix = store.get("gw-calme", null);
  const calme = choix === null ? reduit : !!choix;
  html.classList.toggle("calme", calme);
  const finPointeur = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const G = window.GW;

  const GWC = (window.GWC = { calme, store, $, $$, finPointeur, lenis: null });
  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* Typographie francaise : espace insecable avant ? ! : ; et dans les guillemets */
  GWC.fr = (t) => String(t).replace(/ ([?!:;»])/g, "\u00A0$1").replace(/« /g, "«\u00A0");
  GWC.frDOM = (racine) => {
    if (!racine) return;
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest("script, style, textarea") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    let n; while ((n = w.nextNode())) { const v = GWC.fr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
  };
  /* Redimensionnement regroupe, ignore les variations de hauteur de la barre d'adresse mobile */
  GWC.surRedim = (fn, delai = 160) => {
    let t, w = innerWidth;
    addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { if (innerWidth !== w) { w = innerWidth; fn(); } }, delai); });
  };
  /* Appelle cb une fois quand l'element approche de l'ecran */
  GWC.approche = (el, cb, marge = "600px") => {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); cb(); } }), { rootMargin: marge });
    io.observe(el);
  };
  /* Met en pause des animations quand leur zone sort de l'ecran */
  GWC.pauseHorsEcran = (el, anims) => {
    if (!el || !anims.length) return;
    new IntersectionObserver((es) => es.forEach((e) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause()))), { rootMargin: "100px" }).observe(el);
  };

  /* ---------- Defilement fluide ---------- */
  if (!calme && window.Lenis && window.gsap) {
    const lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
    GWC.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    /* Epinglage par transformation : aucun decalage de mise en page (CLS) quand une section se fige */
    if (finPointeur) ScrollTrigger.defaults({ pinType: "transform" });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  GWC.allerA = (cible) => {
    const el = typeof cible === "string" ? $(cible) : cible;
    if (!el) return;
    if (GWC.lenis) GWC.lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    else el.scrollIntoView({ behavior: calme ? "auto" : "smooth", block: "start" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (!el) return;
    e.preventDefault(); fermerMenu(); GWC.allerA(el);
    if (!el.matches("a, button, input, select, textarea, [tabindex]")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    if (a.dataset.filtre) document.dispatchEvent(new CustomEvent("gw:filtre", { detail: a.dataset.filtre }));
  });

  /* ---------- Toast ---------- */
  let tt;
  GWC.toast = (msg) => {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = GWC.fr(msg); t.classList.add("visible"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("visible"), 3200);
  };

  /* ---------- En-tete ---------- */
  const entete = $(".entete");
  let dernierY = 0;
  const surDefilement = () => {
    const y = window.scrollY;
    if (entete) {
      entete.classList.toggle("est-plein", y > 12);
      const cacher = y > 320 && y > dernierY + 4 && !html.classList.contains("menu-ouvert") && !$(".nav-matieres[data-ouvert='true']");
      if (cacher) entete.classList.add("est-cache"); else if (y < dernierY - 4 || y < 320) entete.classList.remove("est-cache");
    }
    dernierY = y;
  };
  addEventListener("scroll", surDefilement, { passive: true }); surDefilement();
  /* Hauteur reelle de l'en-tete, pour les blocs collants et epingles */
  const majEntete = () => entete && html.style.setProperty("--entete-h", entete.offsetHeight + "px");
  majEntete();
  if (entete && window.ResizeObserver) new ResizeObserver(majEntete).observe(entete);

  /* ---------- Barre d'actions du bas (telephone) ---------- */
  const barre = $(".barre-bas");
  if (barre) {
    const majBarresH = () => html.style.setProperty("--barres-h", barre.offsetHeight + "px");
    majBarresH();
    if (window.ResizeObserver) new ResizeObserver(majBarresH).observe(barre);
    const heros = $(".heros, .heros-bois, .fiche__galerie");
    let horsHeros = !heros;
    const dessus = new Set();
    const majBarre = () => barre.classList.toggle("est-visible", horsHeros && !dessus.size);
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.target === heros) horsHeros = !e.isIntersecting;
          else if (e.isIntersecting) dessus.add(e.target); else dessus.delete(e.target);
        });
        majBarre();
      });
      if (heros) io.observe(heros);
      $$("form, .prenoms, .matieres__rail, .pied").forEach((el) => io.observe(el));
    }
  }

  const nm = $(".nav-matieres");
  if (nm) {
    const b = $("button", nm);
    const ouvrir = (v) => { nm.dataset.ouvert = v; b.setAttribute("aria-expanded", v); };
    b.addEventListener("click", () => ouvrir(nm.dataset.ouvert !== "true"));
    if (finPointeur) { nm.addEventListener("mouseenter", () => ouvrir(true)); nm.addEventListener("mouseleave", () => ouvrir(false)); }
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") ouvrir(false); });
    document.addEventListener("click", (e) => { if (!nm.contains(e.target)) ouvrir(false); });
  }
  const burger = $(".burger");
  const menuM = $("#menu-mobile");
  const horsMenu = (on) => $$("body > main, body > footer, body > .passer").forEach((el) => { el.inert = on; });
  function fermerMenu() {
    if (!html.classList.contains("menu-ouvert")) return;
    html.classList.remove("menu-ouvert"); horsMenu(false);
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu"); }
    GWC.lenis && GWC.lenis.start();
  }
  GWC.fermerMenu = fermerMenu;
  if (burger) burger.addEventListener("click", () => {
    const o = !html.classList.contains("menu-ouvert");
    if (!o) { fermerMenu(); return; }
    html.classList.add("menu-ouvert"); horsMenu(true); burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Fermer le menu");
    GWC.lenis && GWC.lenis.stop();
    const l = menuM && $("a", menuM); l && l.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (!html.classList.contains("menu-ouvert") || !menuM) return;
    if (e.key === "Escape") { fermerMenu(); burger.focus(); return; }
    if (e.key !== "Tab") return;
    const f = [burger, ...$$("a[href], button:not([disabled])", menuM)];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  $$(".menu-mobile a").forEach((a) => a.addEventListener("click", fermerMenu));

  /* ---------- Curseur tete laser ---------- */
  if (finPointeur && !calme && window.gsap) {
    html.classList.add("curseur-perso");
    const p = document.createElement("div"), r = document.createElement("div");
    p.className = "curseur"; r.className = "curseur-anneau";
    document.body.append(r, p);
    const px = gsap.quickTo(p, "x", { duration: .08 }), py = gsap.quickTo(p, "y", { duration: .08 });
    const rx = gsap.quickTo(r, "x", { duration: .45, ease: "power3" }), ry = gsap.quickTo(r, "y", { duration: .45, ease: "power3" });
    gsap.set([p, r], { x: -100, y: -100 });
    addEventListener("pointermove", (e) => { px(e.clientX); py(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      html.classList.toggle("curseur-actif", !!t.closest("a, button, [role=button], label, summary, .vignette"));
      html.classList.toggle("curseur-texte", !!t.closest("input, textarea, select"));
      html.classList.toggle("curseur-sombre", !!t.closest(".section--sombre, .pied, .noel, .bandeau, .heros-bois, .matieres.est-sombre, .menu-mobile, .visionneuse"));
    });
    document.addEventListener("pointerleave", () => gsap.set([p, r], { x: -100, y: -100 }));
  }

  /* ---------- Boutons magnetiques ---------- */
  if (finPointeur && !calme && window.gsap) {
    $$(".btn, .mag").forEach((b) => {
      const qx = gsap.quickTo(b, "x", { duration: .5, ease: "elastic.out(1,.5)" }), qy = gsap.quickTo(b, "y", { duration: .5, ease: "elastic.out(1,.5)" });
      b.addEventListener("pointermove", (e) => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .3); b.style.setProperty("--l", r.width + "px"); });
      b.addEventListener("pointerleave", () => { qx(0); qy(0); });
    });
  }

  /* ---------- Visuels provisoires generes en code ---------- */
  const cacheTex = {};
  const chargerImg = (src) => cacheTex[src] || (cacheTex[src] = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  const cacheVisuel = {};
  GWC.visuelCode = (texte, matiere = "bois") => {
    const cle = matiere + "|" + texte;
    if (cacheVisuel[cle]) return cacheVisuel[cle];
    return (cacheVisuel[cle] = (async () => {
      await (document.fonts && document.fonts.ready);
      const tex = await chargerImg(`assets/img/grok/texture-${matiere}-800.webp`);
      const c = document.createElement("canvas"); c.width = c.height = 640;
      const x = c.getContext("2d");
      if (tex) { const k = Math.max(640 / tex.width, 640 / tex.height); x.drawImage(tex, (640 - tex.width * k) / 2, (640 - tex.height * k) / 2, tex.width * k, tex.height * k); }
      else { x.fillStyle = "#C99B61"; x.fillRect(0, 0, 640, 640); }
      const g = x.createRadialGradient(320, 300, 80, 320, 320, 460); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(30,15,6,.35)");
      x.fillStyle = g; x.fillRect(0, 0, 640, 640);
      const clair = matiere === "ardoise" || matiere === "cuir";
      x.strokeStyle = clair ? "rgba(236,232,224,.75)" : "rgba(45,22,10,.7)"; x.lineWidth = 3; x.setLineDash([]);
      x.beginPath(); x.roundRect ? x.roundRect(70, 110, 500, 420, 40) : x.rect(70, 110, 500, 420); x.stroke();
      x.beginPath(); x.arc(320, 160, 14, 0, Math.PI * 2); x.stroke();
      const mots = texte.split(" "); const lignes = []; let l = "";
      x.font = '560 56px "Fraunces", Georgia, serif';
      mots.forEach((m) => { const t = l ? l + " " + m : m; if (x.measureText(t).width > 420 && l) { lignes.push(l); l = m; } else l = t; });
      lignes.push(l);
      x.textAlign = "center"; x.textBaseline = "middle";
      const y0 = 335 - (lignes.length - 1) * 33;
      lignes.forEach((t, i) => {
        if (clair) { x.fillStyle = "rgba(240,238,232,.9)"; x.shadowColor = "rgba(255,255,255,.25)"; x.shadowBlur = 4; }
        else { x.globalCompositeOperation = "multiply"; x.shadowColor = "rgba(80,36,12,.5)"; x.shadowBlur = 8; x.fillStyle = "rgba(48,22,8,.92)"; }
        x.fillText(t, 320, y0 + i * 66);
        x.globalCompositeOperation = "source-over"; x.shadowBlur = 0;
      });
      return c.toDataURL("image/jpeg", .82);
    })());
  };
  GWC.matiereProduit = (p) => (p.id.includes("ardoise") ? "ardoise" : p.id.includes("miroir") ? "miroir" : p.id.includes("medaille") ? "metal" : "bois");
  /* Image d'un produit : vraie photo si elle existe, sinon visuel en code */
  GWC.imageProduit = (p, w = 960, alt) => {
    const img = document.createElement("img");
    img.alt = alt || p.nom + (p.detail ? ", " + p.detail : "");
    img.loading = "lazy"; img.decoding = "async";
    if (p.img) { img.src = G.src(p.img, w); img.srcset = G.srcset(p.img, [480, 960]); img.sizes = "(max-width: 600px) 90vw, 320px"; }
    else {
      img.dataset.provisoire = "1";
      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23DDD3C5'/%3E%3C/svg%3E";
      GWC.approche(img, () => GWC.visuelCode(p.nom, GWC.matiereProduit(p)).then((u) => (img.src = u)), "500px");
    }
    return img;
  };
  /* Carte produit commune a toutes les pages */
  GWC.carteProduit = (p, { mini = false } = {}) => {
    const lien = p.page || p.url, ext = p.page ? "" : ' target="_blank" rel="noopener"';
    const des = p.variantes || p.options ? '<small>dès\u00A0</small>' : "";
    const nomComplet = p.nom + (p.detail && mini ? ", " + p.detail.toLowerCase() : "");
    const el = document.createElement("article");
    el.dataset.carte = ""; el.dataset.id = p.id;
    if (mini) {
      el.className = "mini-produit";
      el.innerHTML = `<div class="mini-produit__img"></div><div><h3>${nomComplet}</h3><div><span class="produit__prix">${des}${G.prix(p.prix)}</span><button class="ajouter" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${p.nom} au panier">Ajouter</button></div></div>`;
      $(".mini-produit__img", el).appendChild(GWC.imageProduit(p, 480));
    } else {
      el.className = "produit";
      const detail = [p.detail, p.options ? "3 options" : p.variantes ? "Plusieurs variantes" : ""].filter(Boolean).join(", ");
      el.innerHTML = `<a class="produit__visuel" href="${lien}"${ext} tabindex="-1" aria-hidden="true"></a>
        <div class="produit__etiquette"><h3><a class="produit__titre" href="${lien}"${ext}>${p.nom}</a></h3>
        ${detail ? `<p class="produit__detail">${detail}</p>` : ""}
        <div class="produit__meta"><span class="produit__prix">${des}${G.prix(p.prix)}</span><button class="ajouter" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${p.nom} au panier">Ajouter</button></div></div>`;
      $(".produit__visuel", el).appendChild(GWC.imageProduit(p, 480));
      if (finPointeur && !calme && window.gsap) {
        const v = $(".produit__visuel", el);
        const rx = gsap.quickTo(v, "rotationY", { duration: .5 }), ry = gsap.quickTo(v, "rotationX", { duration: .5 });
        el.addEventListener("pointermove", (e) => { const r = v.getBoundingClientRect(); rx(((e.clientX - r.left) / r.width - .5) * 14); ry(-((e.clientY - r.top) / r.height - .5) * 14); });
        el.addEventListener("pointerleave", () => { rx(0); ry(0); });
      }
    }
    if (p.img) el.querySelector("img").parentElement.classList.remove("provisoire");
    else el.querySelector(mini ? ".mini-produit__img" : ".produit__visuel").classList.add("provisoire");
    return el;
  };

  /* Une image manquante recoit un visuel provisoire, jamais un cadre vide */
  document.addEventListener("error", (e) => {
    const im = e.target;
    if (im.tagName !== "IMG" || im.dataset.repli) return;
    im.dataset.repli = "1"; im.removeAttribute("srcset");
    GWC.visuelCode(im.alt ? im.alt.split(",")[0].slice(0, 40) : "Gwenanou Print").then((u) => (im.src = u));
    im.parentElement && im.parentElement.classList.add("provisoire");
  }, true);
  const marquerProvisoires = (root = document) => $$("img[data-provisoire]", root).forEach((i) => i.parentElement && i.parentElement.classList.add("provisoire"));
  GWC.marquerProvisoires = marquerProvisoires;

  /* ---------- Panier simule ---------- */
  let panier = store.get("gw-panier", []);
  if (!Array.isArray(panier)) panier = [];
  const sauver = () => store.set("gw-panier", panier);
  const tiroir = $(".tiroir");
  const compte = () => panier.reduce((s, l) => s + l.qte, 0);
  function majCompteur(anime) {
    $$(".panier-btn b").forEach((b) => { b.textContent = compte(); });
    if (anime) $$(".panier-btn").forEach((b) => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
  }
  function ligneHTML(l, i) {
    const p = G.produit(l.id) || {};
    return `<li class="ligne-panier" data-i="${i}">
      <div class="ligne-panier__img" data-produit="${l.id}"></div>
      <div><h3>${p.nom || l.nom}</h3><p>${[p.detail, l.option].filter(Boolean).join(" · ") || "&nbsp;"}</p>
        <div class="quantite" role="group" aria-label="Quantité"><button type="button" data-q="-1" aria-label="Retirer un">−</button><output aria-live="polite">${l.qte}</output><button type="button" data-q="1" aria-label="Ajouter un">+</button></div></div>
      <div class="ligne-panier__prix"><span>${l.prix == null ? '<span class="a-completer">Prix à compléter</span>' : G.prix(l.prix * l.qte)}</span><button type="button" class="retirer">Retirer</button></div>
    </li>`;
  }
  function rendre(etape = "liste") { rendreBrut(etape); GWC.frDOM(tiroir); }
  function rendreBrut(etape) {
    if (!tiroir) return;
    const liste = $(".tiroir__liste", tiroir), bas = $(".tiroir__bas", tiroir);
    if (!panier.length && etape !== "fin") {
      liste.innerHTML = `<li class="tiroir__vide"><p>Votre panier est vide.</p><a class="btn btn--petit" href="${document.getElementById("boutique") ? "#boutique" : "./#boutique"}" data-fermer-panier>Voir les créations</a></li>`;
      bas.hidden = true; return;
    }
    bas.hidden = false;
    const connus = panier.filter((l) => l.prix != null);
    const total = connus.reduce((s, l) => s + l.prix * l.qte, 0);
    const inconnus = panier.length - connus.length;
    if (etape === "liste") {
      liste.innerHTML = panier.map(ligneHTML).join("");
      $$(".ligne-panier__img", liste).forEach((d) => { const p = G.produit(d.dataset.produit); if (p) d.appendChild(GWC.imageProduit(p, 480)); });
      bas.innerHTML = `<div class="total"><span>Sous-total${inconnus ? " provisoire" : ""}</span><strong>${G.prix(total)}</strong></div>
        ${inconnus ? `<p class="petit">${inconnus} article${inconnus > 1 ? "s" : ""} sans prix affiché sur le site : prix à compléter.</p>` : ""}
        <p class="petit">Livraison ou retrait : <span class="a-completer">à compléter</span> · TVA non applicable, art. 293 B du CGI <span class="a-completer">statut à confirmer</span></p>
        <button class="btn" type="button" data-etape="recap">Commander</button>`;
    } else if (etape === "recap") {
      liste.innerHTML = `<li class="recap-commande"><h3 class="titre" style="font-size:1.6rem">Récapitulatif</h3>
        ${panier.map((l) => { const p = G.produit(l.id) || {}; return `<div class="total" style="font-weight:500"><span>${l.qte} × ${p.nom}${l.option ? " (" + l.option + ")" : ""}</span><span>${l.prix == null ? "à compléter" : G.prix(l.prix * l.qte)}</span></div>`; }).join("")}
        <p class="petit">Dans le site final, la commande se règle sur la boutique Gwenanou Print (SumUp). Chaque article y a sa fiche :</p>
        ${panier.map((l) => { const p = G.produit(l.id) || {}; return `<a class="lien" href="${p.url}" target="_blank" rel="noopener">${p.nom} sur la boutique</a>`; }).join("")}
        <p class="petit">Moyens de paiement : ceux de la boutique SumUp du client <span class="a-completer">à confirmer</span></p>
        <p class="petit">Objets personnalisés : le droit de rétractation ne s’applique pas aux biens confectionnés selon vos indications (article L221-28 du Code de la consommation).</p></li>`;
      bas.innerHTML = `<div class="total"><span>Total${inconnus ? " provisoire" : ""}</span><strong>${G.prix(total)}</strong></div>
        <button class="btn" type="button" data-etape="fin">Valider la commande (simulation)</button>
        <button class="btn btn--ligne btn--petit" type="button" data-etape="liste">Modifier le panier</button>`;
    } else {
      liste.innerHTML = `<li class="tiroir__vide"><h3 class="titre" style="font-size:2rem">Commande simulée</h3><p>Ceci est une maquette : rien n’a été envoyé ni payé. Dans le site final, cette étape renverra vers le paiement sécurisé de la boutique.</p></li>`;
      bas.innerHTML = `<button class="btn" type="button" data-vider>Vider le panier et continuer</button>`;
    }
  }
  let dernierFocus = null;
  GWC.ouvrirPanier = () => {
    if (!tiroir) return;
    dernierFocus = document.activeElement;
    rendre(); tiroir.hidden = false; tiroir.inert = false; requestAnimationFrame(() => tiroir.classList.add("est-ouvert"));
    tiroir.setAttribute("aria-hidden", "false"); html.classList.add("verrou"); GWC.lenis && GWC.lenis.stop();
    setTimeout(() => $(".fermer", tiroir).focus(), 60);
  };
  GWC.fermerPanier = () => {
    if (!tiroir) return;
    tiroir.classList.remove("est-ouvert"); tiroir.setAttribute("aria-hidden", "true"); tiroir.inert = true; html.classList.remove("verrou"); GWC.lenis && GWC.lenis.start();
    dernierFocus && dernierFocus.focus && dernierFocus.focus();
  };
  if (tiroir) {
    tiroir.addEventListener("click", (e) => {
      const t = e.target;
      if (t.closest(".tiroir__fond, .fermer, [data-fermer-panier]")) { GWC.fermerPanier(); return; }
      const li = t.closest(".ligne-panier");
      if (t.closest("[data-q]") && li) { const l = panier[+li.dataset.i]; l.qte = Math.max(1, Math.min(99, l.qte + +t.closest("[data-q]").dataset.q)); sauver(); rendre(); majCompteur(); }
      if (t.closest(".retirer") && li) { panier.splice(+li.dataset.i, 1); sauver(); rendre(); majCompteur(); }
      if (t.closest("[data-etape]")) rendre(t.closest("[data-etape]").dataset.etape);
      if (t.closest("[data-vider]")) { panier = []; sauver(); majCompteur(); GWC.fermerPanier(); }
    });
    tiroir.addEventListener("keydown", (e) => {
      if (e.key === "Escape") GWC.fermerPanier();
      if (e.key === "Tab") {
        const f = $$("a, button, input", tiroir).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  $$(".panier-btn").forEach((b) => b.addEventListener("click", GWC.ouvrirPanier));

  function vol(depuis) {
    const cible = $$(".panier-btn").find((b) => b.offsetParent !== null);
    if (!depuis || !cible || calme || !window.gsap) return Promise.resolve();
    const r = depuis.getBoundingClientRect(), c = cible.getBoundingClientRect();
    if (!r.width) return Promise.resolve();
    const v = document.createElement("div"); v.className = "vol";
    const clone = depuis.cloneNode(true); clone.removeAttribute("loading"); v.appendChild(clone);
    Object.assign(v.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    document.body.appendChild(v);
    const dx = c.left + c.width / 2 - (r.left + r.width / 2), dy = c.top + c.height / 2 - (r.top + r.height / 2);
    return new Promise((res) => {
      const tl = gsap.timeline({ onComplete: () => { v.remove(); res(); } });
      tl.to(v, { duration: .85, x: dx, ease: "power2.in" }, 0)
        .to(v, { duration: .85, y: dy, ease: "back.in(1.6)" }, 0)
        .to(v, { duration: .85, scale: .08, rotation: -18, borderRadius: "50%", ease: "power3.in" }, 0)
        .to(v, { duration: .2, opacity: 0 }, .7);
    });
  }
  GWC.ajouter = async (id, { qte = 1, option = null, prix, depuis, nomOption } = {}) => {
    const p = G.produit(id); if (!p) return;
    const px = prix !== undefined ? prix : (p.options ? null : p.prix);
    const ex = panier.find((l) => l.id === id && l.option === option);
    if (ex) ex.qte += qte; else panier.push({ id, nom: p.nom, qte, option, prix: px });
    sauver();
    await vol(depuis);
    majCompteur(true);
    GWC.toast(`${p.nom}${nomOption ? " (" + nomOption + ")" : ""} ajouté au panier.`);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-ajouter]");
    if (!b) return;
    e.preventDefault();
    const carte = b.closest("[data-carte]");
    const img = carte && carte.querySelector("img");
    const p = G.produit(b.dataset.ajouter);
    let option = null, prix;
    if (p && p.options) { option = p.options[0]; prix = p.prix; }
    GWC.ajouter(b.dataset.ajouter, { depuis: img, option, prix });
    b.classList.add("ok"); const t = b.textContent; b.textContent = "Ajouté"; setTimeout(() => { b.classList.remove("ok"); b.textContent = t; }, 1600);
  });
  majCompteur();

  /* ---------- Copier email / telephone ---------- */
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copier]");
    if (!b) return;
    const v = b.dataset.copier;
    try { await navigator.clipboard.writeText(v); GWC.toast(`Copié : ${v}`); }
    catch (err) {
      const s = b.previousElementSibling; if (s) { const r = document.createRange(); r.selectNodeContents(s); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      GWC.toast("Texte sélectionné : copiez-le avec Cmd+C ou Ctrl+C.");
    }
  });

  /* ---------- Mode calme ---------- */
  $$(".mode-calme").forEach((b) => {
    b.setAttribute("aria-pressed", calme);
    b.addEventListener("click", () => { store.set("gw-calme", !calme); location.reload(); });
  });

  /* ---------- Mentions legales ---------- */
  const dlg = $("#mentions");
  $$("[data-mentions]").forEach((b) => b.addEventListener("click", () => { if (!dlg) return; dlg.showModal(); html.classList.add("verrou"); GWC.lenis && GWC.lenis.stop(); }));
  dlg && dlg.addEventListener("close", () => { html.classList.remove("verrou"); GWC.lenis && GWC.lenis.start(); });
  dlg && dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest(".boite__fermer")) dlg.close(); });

  /* ---------- Transitions de page ---------- */
  const voile = $(".transition-page");
  if (voile && window.gsap) {
    if (store.sget("gw-transition") === "1" && !calme) {
      store.sset("gw-transition", "0");
      voile.style.visibility = "visible";
      gsap.fromTo(voile, { yPercent: 0 }, { yPercent: -115, duration: .9, ease: "power3.inOut", delay: .05, onComplete: () => (voile.style.visibility = "hidden") });
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || calme || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /\.[a-z0-9]{2,4}$/i.test(url.pathname) && !/\.html$/.test(url.pathname) || url.pathname.startsWith("/assets/")) return;
      const meme = url.pathname.replace(/(index)?(\.html)?$/, "") === location.pathname.replace(/(index)?(\.html)?$/, "");
      if (meme && url.hash) return;
      if (meme && url.search === location.search) { e.preventDefault(); fermerMenu(); GWC.allerA(document.body); return; }
      e.preventDefault();
      store.sset("gw-transition", "1");
      voile.style.visibility = "visible";
      gsap.fromTo(voile, { yPercent: 115 }, { yPercent: 0, duration: .65, ease: "power3.inOut", onComplete: () => (location.href = url.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set(voile, { yPercent: 115 }); voile.style.visibility = "hidden"; fermerMenu(); } });
  }

  /* ---------- Revelations au defilement (etat visible par defaut sans script) ---------- */
  GWC.reveler = (cibles, opts = {}) => {
    if (calme || !window.gsap) return;
    if (!opts._diffuse) { (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(() => GWC.reveler(cibles, Object.assign({}, opts, { _diffuse: true })), { timeout: 800 }); return; }
    delete opts._diffuse;
    $$(cibles).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) return;
      gsap.from(el, Object.assign({ y: 40, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }, opts));
    });
  };

  if (document.fonts && window.ScrollTrigger) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => window.ScrollTrigger && ScrollTrigger.refresh());
})();
