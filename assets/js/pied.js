/* Pied de page : « Gwenanou » grave a la braise, copeaux souleves par la souris. */
(function () {
  const { calme, $, finPointeur } = window.GWC;
  const mot = $("#pied-mot");
  if (mot && window.Gravure) {
    const g = new Gravure.Engraver(mot, { matiere: "braise", police: "serif", remplir: .98, hauteur: .9, duree: 2200 });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); g.graver("Gwenanou"); } }), { threshold: .4 });
    io.observe(mot);
    if (calme) g.graver("Gwenanou", { instant: true });
  }
  const c = $(".pied canvas.copeaux");
  if (!c || calme || !window.gsap) return;
  const x = c.getContext("2d");
  let W, H, d, parts = [], actif = false, sx = -999, sy = -999, sale = true;
  const taille = () => {
    d = Math.min(devicePixelRatio || 1, 1.5); W = c.width = c.clientWidth * d; H = c.height = c.clientHeight * d;
    parts = Array.from({ length: Math.round((W * H) / 9000 / d) }, () => ({ x: Math.random() * W, y: H * (.55 + Math.random() * .45), bx: 0, by: 0, vx: 0, vy: 0, a: Math.random() * 6.28, va: 0, l: (3 + Math.random() * 7) * d, t: Math.random() }));
    parts.forEach((p) => { p.bx = p.x; p.by = p.y; });
    sale = true;
  };
  taille(); GWC.surRedim(taille);
  new IntersectionObserver((es) => es.forEach((e) => (actif = e.isIntersecting))).observe(c);
  if (finPointeur) c.parentElement.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); sx = (e.clientX - r.left) * d; sy = (e.clientY - r.top) * d; sale = true; });
  c.parentElement.addEventListener("pointerleave", () => { sx = sy = -999; });
  /* Les copeaux ne sont redessines que lorsqu'ils bougent */
  gsap.ticker.add(() => {
    if (!actif || !sale) return;
    let mouvement = 0;
    x.clearRect(0, 0, W, H);
    parts.forEach((p) => {
      const dx = p.x - sx, dy = p.y - sy, dist = Math.hypot(dx, dy), R = 120 * d;
      if (dist < R) { const f = (1 - dist / R) * 2.2; p.vx += (dx / dist) * f; p.vy += (dy / dist) * f - .6 * f; p.va += (Math.random() - .5) * .3; }
      p.vx += (p.bx - p.x) * .004; p.vy += (p.by - p.y) * .004;
      p.vx *= .92; p.vy *= .92; p.va *= .94;
      p.x += p.vx; p.y += p.vy; p.a += p.va;
      mouvement += Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(p.va) + Math.abs(p.bx - p.x) * .01 + Math.abs(p.by - p.y) * .01;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a);
      x.strokeStyle = `rgba(${p.t > .5 ? "222,190,150" : "190,150,110"},.6)`; x.lineWidth = 1.2 * d;
      x.beginPath(); x.arc(0, 0, p.l / 2, 0, Math.PI * (1 + p.t)); x.stroke();
      x.restore();
    });
    if (mouvement < .02 * parts.length) sale = false;
  });
})();
