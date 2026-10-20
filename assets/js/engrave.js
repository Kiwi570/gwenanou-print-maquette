/* Gravure laser en direct : balayage ligne a ligne comme une vraie machine,
   brulure qui garde le grain de la matiere, braise, fumee et etincelles. */
(function () {
  const INKS = {
    bois:    { core: "rgba(42,20,8,.93)", halo: "rgba(80,36,12,.45)", blur: 7, hi: "rgba(255,226,186,.30)", blend: "multiply", smoke: [120, 108, 96], ember: [255, 120, 40] },
    noyer:   { core: "rgba(24,11,5,.86)", halo: "rgba(20,8,3,.5)", blur: 8, hi: "rgba(255,214,172,.42)", blend: "normal", smoke: [236, 228, 218], ember: [255, 128, 40] },
    metal:   { core: "rgba(26,27,30,.9)", halo: "rgba(0,0,0,.2)", blur: 2, hi: "rgba(255,255,255,.4)", blend: "multiply", smoke: [210, 210, 214], ember: [255, 170, 110] },
    verre:   { core: "rgba(252,253,252,.9)", halo: "rgba(255,255,255,.4)", blur: 5, hi: "rgba(0,34,24,.28)", blend: "normal", smoke: [255, 255, 255], ember: [255, 200, 150], givre: true },
    ardoise: { core: "rgba(232,230,224,.94)", halo: "rgba(255,255,255,.18)", blur: 3, hi: "rgba(0,0,0,.4)", blend: "normal", smoke: [236, 236, 236], ember: [255, 170, 110], givre: true },
    cuir:    { core: "rgba(46,18,6,.9)", halo: "rgba(64,24,8,.42)", blur: 6, hi: "rgba(255,206,164,.24)", blend: "multiply", smoke: [130, 110, 96], ember: [255, 120, 40] },
    miroir:  { core: "rgba(250,250,250,.92)", halo: "rgba(255,255,255,.3)", blur: 3, hi: "rgba(0,0,0,.32)", blend: "normal", smoke: [255, 255, 255], ember: [255, 200, 150], givre: true },
    braise:  { core: "rgba(255,186,118,.96)", halo: "rgba(255,104,26,.65)", blur: 18, hi: "rgba(255,244,226,.45)", blend: "normal", smoke: [240, 230, 220], ember: [255, 150, 60] }
  };
  const POLICES = {
    serif:   { famille: '"Fraunces", Georgia, serif', graisse: 560, ratio: 1 },
    cursive: { famille: '"Great Vibes", "Snell Roundhand", cursive', graisse: 400, ratio: 1.25 },
    sans:    { famille: '"Instrument Sans", Arial, sans-serif', graisse: 650, ratio: .92 }
  };
  const calme = () => document.documentElement.classList.contains("calme") || matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sprite(rgb) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d").createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},.55)`); g.addColorStop(.5, `rgba(${rgb},.18)`); g.addColorStop(1, `rgba(${rgb},0)`);
    const x = c.getContext("2d"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
  }

  class Engraver {
    constructor(hote, o = {}) {
      this.hote = hote;
      this.o = Object.assign({ matiere: "bois", police: "serif", remplir: .84, hauteur: .44, interligne: 1.1, duree: 1600, sonde: null }, o);
      this.cBrule = document.createElement("canvas");
      this.cFx = document.createElement("canvas");
      this.cBrule.className = "grav-brule"; this.cFx.className = "grav-fx";
      [this.cBrule, this.cFx].forEach((c) => { c.setAttribute("aria-hidden", "true"); c.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none"; hote.appendChild(c); });
      this.cFx.style.display = "none";
      this.x1 = this.cBrule.getContext("2d");
      this.x2 = this.cFx.getContext("2d");
      this.src = document.createElement("canvas");
      this.braise = document.createElement("canvas");
      this.parts = [];
      this.texte = "";
      this.fini = true;
      this.setMatiere(this.o.matiere, true);
      this.taille();
      this.ro = new ResizeObserver(() => { if (this.taille() && this.texte) this.dessinerFinal(); });
      this.ro.observe(hote);
    }
    setTransform(css) { this.cBrule.style.transform = css; this.cFx.style.transform = css; this.cBrule.style.transformOrigin = this.cFx.style.transformOrigin = "0 0"; }
    setTaille(w, h) { [this.cBrule, this.cFx].forEach((c) => { c.style.width = w + "px"; c.style.height = h + "px"; }); this.taille(); }
    setMatiere(m, silencieux) {
      this.o.matiere = m; this.ink = INKS[m] || INKS.bois;
      this.cBrule.style.mixBlendMode = this.ink.blend;
      this.fumee = sprite(this.ink.smoke.join(","));
      if (!silencieux && this.texte) this.dessinerFinal();
    }
    taille() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(this.cBrule.offsetWidth * d)), h = Math.max(2, Math.round(this.cBrule.offsetHeight * d));
      if (w === this.W && h === this.H) return false;
      this.W = w; this.H = h; this.d = d;
      [this.cBrule, this.cFx, this.src, this.braise].forEach((c) => { c.width = w; c.height = h; });
      return true;
    }
    police() { return POLICES[this.o.police] || POLICES.serif; }
    composer() {
      const { W, H } = this, p = this.police();
      const lignes = (this.texte || " ").split("\n");
      const m = this.src.getContext("2d", { willReadFrequently: true });
      let fs = (H * this.o.hauteur) / (lignes.length * (this.o.interligne * .9)) * p.ratio;
      m.font = `${p.graisse} ${fs}px ${p.famille}`;
      const large = Math.max(...lignes.map((l) => m.measureText(l).width), 1);
      fs = Math.min(fs, fs * (W * this.o.remplir) / large);
      this.fs = fs;
      const pas = fs * this.o.interligne;
      const y0 = H / 2 - (pas * lignes.length) / 2 + pas / 2;
      const poser = (ctx, couleur, dy = 0, flou = 0, ombre = null) => {
        ctx.font = `${p.graisse} ${fs}px ${p.famille}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = couleur; ctx.shadowBlur = flou; ctx.shadowColor = ombre || "transparent";
        lignes.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * pas + dy));
        ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
      };
      // Masque pour savoir quand le laser tire et ou commence le texte
      m.clearRect(0, 0, W, H); poser(m, "#fff");
      const data = m.getImageData(0, 0, W, H).data;
      let x0 = W, x1 = 0, ya = H, yb = 0;
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 30) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < ya) ya = y; if (y > yb) yb = y; }
      if (x1 <= x0) { x0 = 0; x1 = W; ya = 0; yb = H; }
      this.zone = { x0: Math.max(0, x0 - 4), x1: Math.min(W, x1 + 4), y0: Math.max(0, ya - 4), y1: Math.min(H, yb + 4) };
      this.masque = data;
      // Brulure : halo, rebord de lumiere, coeur
      m.clearRect(0, 0, W, H);
      poser(m, this.ink.halo, 0, this.ink.blur * this.d * Math.max(.6, fs / (90 * this.d)), this.ink.halo);
      poser(m, this.ink.hi, Math.max(1, fs * .022));
      poser(m, this.ink.core, 0);
      if (this.ink.givre) {
        m.globalCompositeOperation = "destination-out";
        for (let i = 0; i < (W * H) / 260; i++) { m.fillStyle = `rgba(0,0,0,${Math.random() * .35})`; m.fillRect(Math.random() * W, Math.random() * H, this.d, this.d); }
        m.globalCompositeOperation = "source-over";
      }
      // Braise : copie lumineuse du texte
      const b = this.braise.getContext("2d");
      b.clearRect(0, 0, W, H);
      poser(b, `rgba(${this.ink.ember.join(",")},1)`, 0, 14 * this.d, `rgba(${this.ink.ember.join(",")},.9)`);
    }
    tire(x, y) {
      const xi = Math.round(x), yi = Math.round(y);
      if (xi < 0 || yi < 0 || xi >= this.W || yi >= this.H || !this.masque) return false;
      return this.masque[(yi * this.W + xi) * 4 + 3] > 40;
    }
    dessinerFinal() {
      this.taille();
      this.composer();
      this.x1.clearRect(0, 0, this.W, this.H);
      this.x1.drawImage(this.src, 0, 0);
      if (this.ink === INKS.braise) { this.x1.globalAlpha = .35; this.x1.drawImage(this.braise, 0, 0); this.x1.globalAlpha = 1; }
      if (this.fini) this.x2.clearRect(0, 0, this.W, this.H);
    }
    effacer() { cancelAnimationFrame(this.raf); this.texte = ""; this.parts = []; this.fini = true; this.x1.clearRect(0, 0, this.W, this.H); this.x2.clearRect(0, 0, this.W, this.H); }
    graver(texte, opts = {}) {
      cancelAnimationFrame(this.raf);
      this.texte = String(texte || "").slice(0, 120);
      if (opts.police) this.o.police = opts.police;
      if (opts.matiere) this.setMatiere(opts.matiere, true);
      /* La police doit etre chargee avant de dessiner, sinon le canvas grave avec une police de secours */
      const p = this.police(), spec = `${p.graisse} 48px ${p.famille}`;
      if (document.fonts && !opts._police && !document.fonts.check(spec)) {
        const jeton = (this.jeton = (this.jeton || 0) + 1);
        return document.fonts.load(spec).catch(() => {}).then(() => (jeton === this.jeton ? this.graver(this.texte, Object.assign({}, opts, { _police: true })) : undefined));
      }
      this.taille();
      this.composer();
      if (calme() || opts.instant) { this.fini = true; this.dessinerFinal(); opts.fin && opts.fin(); return Promise.resolve(); }
      const z = this.zone, d = this.d;
      const pas = Math.max(2 * d, this.fs / 22);
      const rangs = Math.max(1, Math.ceil((z.y1 - z.y0) / pas));
      const duree = opts.duree || this.o.duree;
      const t0 = performance.now();
      this.fini = false;
      this.cFx.style.display = "";
      let dernier = t0;
      return new Promise((res) => {
        const image = (t) => {
          const dt = Math.min(48, t - dernier) / 16.67; dernier = t;
          const p = Math.min(1, (t - t0) / duree);
          const fait = p * rangs, i = Math.floor(fait), f = fait - i;
          const yR = z.y0 + i * pas;
          const sens = i % 2 === 0;
          const x = sens ? z.x0 + f * (z.x1 - z.x0) : z.x1 - f * (z.x1 - z.x0);
          const { W, H } = this;
          // Brulure revelee
          this.x1.clearRect(0, 0, W, H);
          if (p >= 1) this.x1.drawImage(this.src, 0, 0);
          else {
            if (yR > 0) this.x1.drawImage(this.src, 0, 0, W, yR, 0, 0, W, yR);
            const a = sens ? z.x0 : x, l = Math.max(0, sens ? x - z.x0 : z.x1 - x);
            if (l > 0) this.x1.drawImage(this.src, a, yR, l, pas, a, yR, l, pas);
          }
          // Effets
          const fx = this.x2;
          fx.clearRect(0, 0, W, H);
          const hb = 18 * pas;
          if (p < 1 || this.ember > 0) {
            this.ember = p < 1 ? 1 : Math.max(0, (this.ember || 1) - .035 * dt);
            const yFin = p >= 1 ? z.y1 : yR, haut = Math.max(z.y0, yFin - hb), bande = yFin - haut;
            if (bande > 0) {
              fx.globalCompositeOperation = "lighter";
              const tr = 6;
              for (let s = 0; s < tr; s++) {
                const ya = haut + (bande / tr) * s, h = bande / tr;
                fx.globalAlpha = (.1 + .5 * ((s + 1) / tr)) * this.ember;
                fx.drawImage(this.braise, 0, ya, W, h, 0, ya, W, h);
              }
              fx.globalAlpha = 1;
              fx.globalCompositeOperation = "source-over";
            }
          }
          const feu = p < 1 && this.tire(x, yR + pas / 2);
          if (feu) {
            const r = 9 * d;
            const g = fx.createRadialGradient(x, yR, 0, x, yR, r * 7);
            g.addColorStop(0, "rgba(255,250,240,1)"); g.addColorStop(.12, "rgba(255,190,110,.95)"); g.addColorStop(.35, "rgba(255,110,30,.35)"); g.addColorStop(1, "rgba(255,90,20,0)");
            fx.globalCompositeOperation = "lighter"; fx.fillStyle = g; fx.beginPath(); fx.arc(x, yR, r * 7, 0, Math.PI * 2); fx.fill(); fx.globalCompositeOperation = "source-over";
            if (this.parts.length < 220) {
              this.parts.push({ t: "f", x, y: yR, vx: (Math.random() - .5) * .5 * d, vy: -(.5 + Math.random() * .9) * d, r: (3 + Math.random() * 4) * d, v: 0, max: 50 + Math.random() * 50 });
              if (Math.random() < .35) this.parts.push({ t: "e", x, y: yR, vx: (Math.random() - .5) * 5 * d, vy: -(1 + Math.random() * 3) * d, r: 1, v: 0, max: 14 + Math.random() * 16 });
            }
          }
          // Particules
          for (let k = this.parts.length - 1; k >= 0; k--) {
            const q = this.parts[k];
            q.v += dt; if (q.v > q.max) { this.parts.splice(k, 1); continue; }
            const vie = 1 - q.v / q.max;
            if (q.t === "f") {
              q.x += (q.vx + Math.sin((q.y + q.v * 3) / (24 * d)) * .35 * d) * dt; q.y += q.vy * dt; q.r += .32 * d * dt;
              fx.globalAlpha = .55 * vie; fx.drawImage(this.fumee, q.x - q.r, q.y - q.r, q.r * 2, q.r * 2);
            } else {
              q.vy += .18 * d * dt; q.x += q.vx * dt; q.y += q.vy * dt;
              fx.globalAlpha = vie; fx.strokeStyle = "rgba(255,210,150,1)"; fx.lineWidth = 1.4 * d;
              fx.beginPath(); fx.moveTo(q.x, q.y); fx.lineTo(q.x - q.vx * 1.8, q.y - q.vy * 1.8); fx.stroke();
            }
          }
          fx.globalAlpha = 1;
          if (p < 1 || this.parts.length || this.ember > 0) this.raf = requestAnimationFrame(image);
          else { this.fini = true; fx.clearRect(0, 0, W, H); this.cFx.style.display = "none"; if (this.ink === INKS.braise) this.dessinerFinal(); }
          if (p >= 1 && !this.resolu) { this.resolu = true; opts.fin && opts.fin(); res(); }
        };
        this.resolu = false;
        this.raf = requestAnimationFrame(image);
      });
    }
  }

  /* Homographie : un canvas rectangulaire pose sur un quadrilatere (perspective) */
  function matrice(w, h, q) {
    const s = [[0, 0], [w, 0], [w, h], [0, h]];
    const A = [], B = [];
    for (let i = 0; i < 4; i++) {
      const [x, y] = s[i], [u, v] = q[i];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
    }
    const n = 8;
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]]; [B[c], B[piv]] = [B[piv], B[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; }
    }
    const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i]);
    return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
  }
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  function sousQuad(q, u0, u1, v0, v1) {
    const P = (u, v) => lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v);
    return [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
  }
  /* Place un graveur sur une zone d'une image affichee en object-fit: cover (ou contain) */
  function poser(eng, boite, img, quadImg, marges = [.1, .9, .2, .8], fit = "cover", bord = 0) {
    const CW = boite.clientWidth, CH = boite.clientHeight;
    const s = fit === "cover" ? Math.max(CW / img.w, CH / img.h) : Math.min(CW / img.w, CH / img.h);
    const ox = (CW - img.w * s) / 2, oy = (CH - img.h * s) / 2;
    let q = sousQuad(quadImg, ...marges).map(([x, y]) => [ox + x * s, oy + y * s]);
    if (bord) {
      const bornes = (a, b) => { const lo = (bord - a[0]) / (b[0] - a[0]), hi = (CW - bord - a[0]) / (b[0] - a[0]); return [Math.max(0, Math.min(lo, hi)), Math.min(1, Math.max(lo, hi))]; };
      const [a1, b1] = bornes(q[0], q[1]), [a2, b2] = bornes(q[3], q[2]);
      const u0 = Math.max(a1, a2), u1 = Math.min(b1, b2);
      if (u0 > 0 || u1 < 1) q = sousQuad(q, u0, u1, 0, 1);
    }
    const w = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]);
    const h = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]);
    eng.setTaille(Math.round(w), Math.round(h));
    eng.setTransform(matrice(Math.round(w), Math.round(h), q));
  }

  window.Gravure = { Engraver, poser, matrice, INKS };
})();
