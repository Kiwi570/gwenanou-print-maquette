/* Fond WebGL : une matiere se consume en une autre, le front de brulure suit le bruit du grain.
   Rendu a la demande uniquement : rien n'est calcule quand l'image ne change pas. */
(function () {
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
  const FS = `precision mediump float;
  varying vec2 v;
  uniform sampler2D A, B;
  uniform vec2 rA, rB, res, souris;
  uniform float t;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for(int i = 0; i < 4; i++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }
  vec2 cover(vec2 uv, vec2 r){ float ec = res.x / res.y, ei = r.x / r.y; vec2 s = ec > ei ? vec2(1., ei / ec) : vec2(ec / ei, 1.); return (uv - .5) * s + .5; }
  void main(){
    vec2 uv = v; uv.y = 1. - uv.y;
    vec3 a = texture2D(A, cover(uv, rA)).rgb;
    vec3 b = texture2D(B, cover(uv, rB)).rgb;
    float g = fbm(uv * vec2(3.2, 2.2)) * .8 + uv.x * .35;
    float seuil = t * 1.5 - .1;
    float m = smoothstep(seuil - .015, seuil + .015, g);
    vec3 c = mix(b, a, m);
    float bord = smoothstep(.045, 0., abs(g - seuil)) * step(.001, t) * step(t, .999);
    c = mix(c, vec3(.08, .04, .02), smoothstep(.2, .7, bord) * .75);
    c += vec3(1., .45, .12) * pow(bord, 4.) * 1.4;
    float l = 1. - smoothstep(0., .7, distance(uv * vec2(res.x / res.y, 1.), souris * vec2(res.x / res.y, 1.)));
    c *= .94 + .1 * l;
    gl_FragColor = vec4(c, 1.);
  }`;

  class Matiere {
    constructor(canvas, urls) {
      this.c = canvas; this.urls = urls; this.tex = []; this.a = null; this.b = null; this.k = 0; this.souris = [.35, .45]; this.sale = true;
      const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false, powerPreference: "low-power" });
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
      this.u = {}; ["A", "B", "rA", "rB", "res", "souris", "t"].forEach((k) => (this.u[k] = gl.getUniformLocation(p, k)));
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
      const d = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.round(this.c.clientWidth * d), h = Math.round(this.c.clientHeight * d);
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
      const gl = this.gl, A = this.tex[this.a], B = this.tex[this.b];
      if (!A || !B) return;
      this.sale = false;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.t);
      gl.uniform2f(this.u.rA, A.w, A.h); gl.uniform2f(this.u.rB, B.w, B.h);
      gl.uniform2f(this.u.res, this.c.width, this.c.height);
      gl.uniform2f(this.u.souris, this.souris[0], this.souris[1]);
      gl.uniform1f(this.u.t, this.k);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  window.Matiere = Matiere;
})();
