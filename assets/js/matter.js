/* Fond WebGL : une matiere se consume en une autre, le front de brulure suit le bruit du grain.
   Rendu a la demande uniquement : rien n'est calcule quand l'image ne change pas. */
(function () {
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 v;
  uniform sampler2D A, B;
  uniform vec2 rA, rB, res;
  uniform float t;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for(int i = 0; i < 4; i++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }
  vec2 cover(vec2 uv, vec2 r){ float ec = res.x / res.y, ei = r.x / r.y; vec2 s = ec > ei ? vec2(1., ei / ec) : vec2(ec / ei, 1.); return (uv - .5) * s + .5; }
  void main(){
    vec2 uv = v; uv.y = 1. - uv.y;
    /* front de brulure : bruit du grain + avancee de gauche a droite, adouci aux extremites */
    float g = fbm(uv * vec2(3.2, 2.2)) * .8 + uv.x * .35;
    float e = t * t * (3. - 2. * t);
    float seuil = mix(-.12, 1.42, e);
    float d = g - seuil;
    float actif = smoothstep(0., .04, t) * smoothstep(1., .96, t);
    /* chaleur : la matiere ondule juste devant et derriere le front */
    float chaleur = smoothstep(.16, 0., abs(d)) * actif;
    vec2 onde = (vec2(n(uv * 22. + t * 6.), n(uv * 22. + 9.1 - t * 5.)) - .5) * .018 * chaleur;
    vec3 a = texture2D(A, cover(uv + onde, rA)).rgb;
    vec3 b = texture2D(B, cover(uv - onde, rB)).rgb;
    float m = smoothstep(-.012, .012, d);
    vec3 c = mix(b, a, m);
    /* bord carbonise puis braise incandescente */
    float bord = smoothstep(.042, 0., abs(d)) * actif;
    c = mix(c, vec3(.07, .035, .015), smoothstep(.15, .75, bord) * .8);
    float braise = pow(bord, 3.5) * (.75 + .5 * n(uv * 60. + t * 14.));
    c += vec3(1., .46, .13) * braise * 1.35;
    /* etincelles et halo chaud sur la matiere fraichement revelee */
    float point = step(.992, h(floor(uv * res / 3.) + floor(t * 40.))) * smoothstep(.09, 0., abs(d)) * actif;
    c += vec3(1., .8, .55) * point;
    float halo = smoothstep(.22, 0., -d) * step(d, 0.) * actif;
    c = mix(c, c * vec3(1.08, .96, .86), halo * .55);
    gl_FragColor = vec4(c, 1.);
  }`;

  class Matiere {
    constructor(canvas, urls) {
      this.c = canvas; this.urls = urls; this.tex = []; this.a = null; this.b = null; this.k = 0; this.sale = true;
      /* Qualite adaptative : si la cadence chute pendant une brulure, la resolution baisse */
      this.echelle = 1; this.ema = 16.7; this.nb = 0; this.derniere = 0;
      const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: "high-performance" });
      if (!gl) throw new Error("webgl");
      this.gl = gl;
      const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link");
      gl.useProgram(p);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {}; ["A", "B", "rA", "rB", "res", "t"].forEach((k) => (this.u[k] = gl.getUniformLocation(p, k)));
      gl.uniform1i(this.u.A, 0); gl.uniform1i(this.u.B, 1);
      this.pret = Promise.all(urls.map((u, i) => this.charger(u, i)));
      new ResizeObserver(() => { this.taille(); this.rendre(); }).observe(canvas);
      canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); this.perdu = true; });
    }
    charger(url, i) {
      return new Promise((res) => {
        const im = new Image(); im.decoding = "async";
        im.onload = () => {
          const go = () => {
            const gl = this.gl, t = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, t);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            this.tex[i] = { t, w: im.naturalWidth, h: im.naturalHeight }; res();
          };
          /* Envoi au GPU etale dans le temps pour ne pas bloquer le defilement */
          (window.requestIdleCallback || ((f) => setTimeout(f, 30 * i)))(go, { timeout: 400 });
        };
        im.onerror = () => res();
        im.src = url;
      });
    }
    taille() {
      /* Resolution native jusqu'a 2x, plafonnee a environ 3,5 millions de pixels */
      let d = Math.min(window.devicePixelRatio || 1, 2) * this.echelle;
      const cw = this.c.clientWidth, ch = this.c.clientHeight;
      if (cw * ch * d * d > 3.5e6) d = Math.sqrt(3.5e6 / (cw * ch));
      const w = Math.round(cw * d), h = Math.round(ch * d);
      if (w && h && (w !== this.c.width || h !== this.c.height)) { this.c.width = w; this.c.height = h; this.gl.viewport(0, 0, w, h); this.sale = true; }
    }
    /* Brulure de la matiere a vers la matiere b, avancement k entre 0 et 1, dessinee tout de suite */
    paire(a, b, k) {
      if (a !== this.a || b !== this.b || k !== this.k) { this.a = a; this.b = b; this.k = k; this.sale = true; }
      this.rendre();
    }
    set(prog) {
      const n = this.urls.length - 1, v = Math.max(0, Math.min(n, prog)), i = Math.min(n - 1, Math.floor(v));
      this.paire(i, i + 1, v - i);
    }
    rendre() {
      if (!this.sale || this.perdu || this.a == null) return;
      const now = performance.now(), dt = now - this.derniere;
      this.derniere = now;
      if (dt < 250) {
        this.ema = this.ema * .85 + dt * .15;
        if (++this.nb > 14 && this.ema > 26 && this.echelle > .5) { this.echelle *= .8; this.nb = 0; this.ema = 16.7; this.taille(); }
      }
      const gl = this.gl, A = this.tex[this.a], B = this.tex[this.b];
      if (!A || !B) return;
      this.sale = false;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.t);
      gl.uniform2f(this.u.rA, A.w, A.h); gl.uniform2f(this.u.rB, B.w, B.h);
      gl.uniform2f(this.u.res, this.c.width, this.c.height);
      gl.uniform1f(this.u.t, this.k);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  window.Matiere = Matiere;
})();
