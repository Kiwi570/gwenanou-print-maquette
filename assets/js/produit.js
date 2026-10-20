/* Fiche Arbre de vie : galerie a loupe, prenoms et apercu grave, panier, voir chez vous. */
(function () {
  const { calme, $, $$, finPointeur } = window.GWC;
  const G = window.GW, GR = window.Gravure, A = G.arbre;
  const P = G.produit(A.id);

  /* Galerie */
  const princ = $("#principale"), img = $("#img-principale"), loupe = $("#loupe");
  $$("#vignettes button").forEach((b) => b.addEventListener("click", () => {
    $$("#vignettes button").forEach((x) => x.setAttribute("aria-current", x === b ? "true" : "false"));
    const go = () => { img.removeAttribute("srcset"); img.src = b.dataset.src; img.style.objectFit = b.dataset.fond ? "contain" : "cover"; princ.style.background = b.dataset.fond || ""; loupe.style.backgroundImage = `url(${b.dataset.src})`; };
    if (window.gsap && !calme) gsap.to(img, { opacity: 0, duration: .2, onComplete: () => { go(); gsap.to(img, { opacity: 1, duration: .35 }); } }); else go();
  }));
  loupe.style.backgroundImage = `url(${img.currentSrc || img.src})`;
  if (finPointeur) {
    princ.addEventListener("pointermove", (e) => {
      const r = princ.getBoundingClientRect(), z = 2.4;
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      Object.assign(loupe.style, { opacity: 1, left: e.clientX - r.left - 85 + "px", top: e.clientY - r.top - 85 + "px", backgroundSize: `${r.width * z}px ${r.height * z}px`, backgroundPosition: `${-(fx * r.width * z - 85)}px ${-(fy * r.height * z - 85)}px` });
    });
    princ.addEventListener("pointerleave", () => (loupe.style.opacity = 0));
  } else {
    princ.addEventListener("click", (e) => {
      const z = img.style.transform ? "" : "scale(2)";
      const r = princ.getBoundingClientRect();
      img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      img.style.transition = "transform .4s"; img.style.transform = z;
    });
  }

  /* Prenoms et apercu */
  const zone = $("#prenoms"), nbO = $("#nb"), prix = $("#prix"), note = $("#prix-note"), apNote = $("#apercu-note");
  const exemple = ["Léa", "Hugo", "Jade", "Louis", "Emma", "Noé", "Rose", "Tom", "Lina", "Paul"];
  let nb = 3, valeurs = [];
  const apercu = $("#apercu");
  const g = new GR.Engraver(apercu, { matiere: "bois", police: "cursive", remplir: .84, hauteur: .7, interligne: 1.05, duree: 1500 });
  g.cBrule.style.zIndex = 1; g.cFx.style.zIndex = 2;
  const texte = () => {
    const noms = Array.from({ length: nb }, (_, i) => (valeurs[i] || "").trim() || exemple[i]);
    const parLigne = nb <= 4 ? 2 : nb <= 6 ? 3 : 4;
    const lignes = [];
    for (let i = 0; i < noms.length; i += parLigne) lignes.push(noms.slice(i, i + parLigne).join("   "));
    return lignes.join("\n");
  };
  const majNote = () => {
    const perso = valeurs.slice(0, nb).filter((v) => v && v.trim()).length;
    apNote.textContent = perso === nb ? "Aperçu indicatif de la gravure des prénoms, pas de l’objet." : `Les champs vides affichent des prénoms d’exemple. Aperçu indicatif de la gravure, pas de l’objet.`;
  };
  let att;
  const graver = (opts) => { majNote(); return g.graver(texte(), opts); };
  function champs(anim) {
    const avant = zone.children.length;
    while (zone.children.length < nb) {
      const i = zone.children.length;
      const inp = document.createElement("input");
      inp.className = "champ"; inp.id = "prenom-" + (i + 1); inp.maxLength = 14; inp.placeholder = `Prénom ${i + 1}`; inp.autocomplete = "off";
      inp.setAttribute("aria-label", `Prénom ${i + 1}`);
      inp.value = valeurs[i] || "";
      inp.addEventListener("input", () => { valeurs[i] = inp.value; clearTimeout(att); att = setTimeout(() => graver({ duree: 1000 }), 650); });
      zone.appendChild(inp);
      if (anim && window.gsap && !calme) gsap.from(inp, { y: 16, opacity: 0, scale: .96, duration: .45, ease: "back.out(2)" });
    }
    while (zone.children.length > nb) zone.lastElementChild.remove();
    return zone.children.length !== avant;
  }
  function majNb(n) {
    nb = Math.max(3, Math.min(10, n));
    nbO.textContent = nb;
    $("#nb-moins").disabled = nb <= 3; $("#nb-plus").disabled = nb >= 10;
    const opt = A.options.find((o) => o.n === nb);
    if (opt.prix == null) { prix.innerHTML = '<span class="a-completer">Prix à compléter</span>'; note.textContent = `version ${nb} prénoms, prix absent du site actuel`; }
    else { prix.textContent = G.prix(opt.prix); note.textContent = `version ${nb} prénoms`; }
    if (window.gsap && !calme) gsap.fromTo(nbO, { scale: 1.3, color: "#7A4134" }, { scale: 1, color: "#24170F", duration: .5, ease: "back.out(3)" });
  }
  $("#nb-moins").addEventListener("click", () => { majNb(nb - 1); champs(true); graver({ duree: 900 }); });
  $("#nb-plus").addEventListener("click", () => { majNb(nb + 1); champs(true); graver({ duree: 900 }); });
  majNb(3); champs(false);
  graver({ instant: true });
  new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); graver(); } }), { threshold: .5 }).observe(apercu);

  /* Quantite et panier */
  let q = 1;
  const qO = $("#q");
  const majQ = (n) => { q = Math.max(1, Math.min(20, n)); qO.textContent = q; $("#q-moins").disabled = q <= 1; };
  $("#q-moins").addEventListener("click", () => majQ(q - 1));
  $("#q-plus").addEventListener("click", () => majQ(q + 1));
  majQ(1);
  $("#ajouter").addEventListener("click", () => {
    const vides = Array.from(zone.children).filter((i) => !i.value.trim());
    if (vides.length) { vides[0].classList.add("erreur"); vides[0].focus(); GWC.toast(`Indiquez les ${nb} prénoms avant d’ajouter l’arbre au panier.`); setTimeout(() => vides.forEach((v) => v.classList.remove("erreur")), 2500); return; }
    const opt = A.options.find((o) => o.n === nb);
    const option = `${nb} prénoms : ${valeurs.slice(0, nb).map((v) => v.trim()).join(", ")}`;
    GWC.ajouter(A.id, { qte: q, option, prix: opt.prix, depuis: img, nomOption: `${nb} prénoms` });
  });

  /* Voir chez vous */
  const scene = $("#scene"), objet = $("#objet"), echelle = $("#echelle");
  let pos = 50;
  const placer = () => { objet.style.left = pos + "%"; objet.style.transform = `scale(${echelle.value / 100})`; };
  placer();
  echelle.addEventListener("input", placer);
  let glisse = false, ox = 0;
  objet.addEventListener("pointerdown", (e) => { glisse = true; ox = e.clientX; objet.setPointerCapture(e.pointerId); });
  objet.addEventListener("pointermove", (e) => {
    if (!glisse) return;
    const r = scene.getBoundingClientRect();
    pos = Math.max(28, Math.min(80, pos + ((e.clientX - ox) / r.width) * 100)); ox = e.clientX; placer();
    if (window.gsap && !calme) gsap.to(objet, { rotation: Math.max(-6, Math.min(6, e.movementX * .6)), duration: .3, overwrite: "auto" });
  });
  objet.addEventListener("pointerup", () => { glisse = false; window.gsap && gsap.to(objet, { rotation: 0, duration: .8, ease: "elastic.out(1,.4)" }); });
  objet.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { pos = Math.max(28, pos - 4); placer(); } if (e.key === "ArrowRight") { pos = Math.min(80, pos + 4); placer(); } });

  /* Articles connexes (meme liste que la boutique) */
  const cx = $("#connexes");
  A.connexes.forEach((id) => {
    const p = G.produit(id), el = document.createElement("article");
    el.className = "produit"; el.dataset.carte = "";
    el.innerHTML = `<a class="produit__visuel" href="${p.url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"></a><div class="produit__etiquette"><h3><a href="${p.url}" target="_blank" rel="noopener">${p.nom}</a></h3><p class="produit__detail">${p.variantes ? "Plusieurs variantes" : "&nbsp;"}</p><div class="produit__meta"><span class="produit__prix">${p.variantes ? "<small>dès</small>" : ""}${G.prix(p.prix)}</span><button class="ajouter" type="button" data-ajouter="${p.id}" aria-label="Ajouter ${p.nom} au panier">Ajouter</button></div></div>`;
    $(".produit__visuel", el).appendChild(GWC.imageProduit(p, 480));
    cx.appendChild(el);
  });
  GWC.marquerProvisoires(cx);

  if (window.gsap && !calme) {
    gsap.from(".fiche__infos > *", { y: 26, opacity: 0, duration: .8, ease: "power3.out", stagger: .06, delay: .2 });
    gsap.from(".fiche__principale", { scale: .96, opacity: 0, duration: 1, ease: "power3.out" });
  }
  GWC.reveler("#connexes .produit", { stagger: .08 });
})();
