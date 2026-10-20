/* Fond WebGL : une matiere se consume en une autre, le front de brulure suit le bruit du grain. */
(function () {
  const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;
  const FS = `precision mediump float;
  varying vec2 v;
  uniform sampler2D A, B;
  uniform vec2 rA, rB, res, souris;
  uniform float t, temps;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for(int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= .5; } return s; }
  vec2 cover(vec2 uv, vec2 r){ float ec = res.x / res.y, ei = r.x / r.y; vec2 s = ec > ei ? vec2(1., ei / ec) : vec2(ec / ei, 1.); return (uv - .5) * s + .5; }
  void main(){
    vec2 uv = v; uv.y = 1. - uv.y;
    vec2 d = vec2(sin(temps * .07), cos(temps * .05)) * .006;
    vec3 a = texture2D(A, cover(uv * .96 + .02 + d, rA)).rgb;
    vec3 b = texture2D(B, cover(uv * .96 + .02 - d, rB)).rgb;
    float g = fbm(uv * vec2(3.2, 2.2) + vec2(0., temps * .01)) * .8 + uv.x * .35;
    float seuil = t * 1.5 - .1;
    float m = smoothstep(seuil - .015, seuil + .015, g);
    vec3 c = mix(b, a, m);
    float bord = smoothstep(.045, 0., abs(g - seuil)) * step(.001, t) * step(t, .999);
    c = mix(c, vec3(.08, .04, .02), smoothstep(.2, .7, bord) * .75);
    c += vec3(1., .45, .12) * pow(bord, 4.) * 1.4;
    float l = 1. - smoothstep(0., .7, distance(uv * vec2(res.x / res.y, 1.), souris * vec2(res.x / res.y, 1.)));
    c *= .92 + .16 * l;
    c += (h(uv * res + temps) - .5) * .035;
    gl_FragColor = vec4(c, 1.);
  }`;

  class Matiere {
    constructor(canvas, urls) {
      this.c = canvas; this.urls = urls; this.tex = []; this.prog = 0; this.souris = [.35, .45]; this.actif = false;
      const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
      if (!gl) throw new Error("webgl");
      this.gl = gl;
      const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link");
      gl.useProgram(p); this.p = p;
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {}; ["A", "B", "rA", "rB", "res", "souris", "t", "temps"].forEach((k) => (this.u[k] = gl.getUniformLocation(p, k)));
      gl.uniform1i(this.u.A, 0); gl.uniform1i(this.u.B, 1);
      this.pret = Promise.all(urls.map((u, i) => this.charger(u, i)));
      this.taille = this.taille.bind(this); this.boucle = this.boucle.bind(this);
      new ResizeObserver(this.taille).observe(canvas);
      canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); this.perdu = true; });
    }
    charger(url, i) {
      return new Promise((res) => {
        const im = new Image(); im.decoding = "async";
        im.onload = () => {
          const gl = this.gl, t = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          this.tex[i] = { t, w: im.naturalWidth, h: im.naturalHeight }; res();
        };
        im.onerror = () => res();
        im.src = url;
      });
    }
    taille() {
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(this.c.clientWidth * d), h = Math.round(this.c.clientHeight * d);
      if (w && h && (w !== this.c.width || h !== this.c.height)) { this.c.width = w; this.c.height = h; this.gl.viewport(0, 0, w, h); }
    }
    set(prog) { this.prog = Math.max(0, Math.min(this.urls.length - 1, prog)); }
    demarrer() { if (this.actif) return; this.actif = true; this.raf = requestAnimationFrame(this.boucle); }
    arreter() { this.actif = false; cancelAnimationFrame(this.raf); }
    boucle(ms) {
      if (!this.actif) return;
      this.raf = requestAnimationFrame(this.boucle);
      const gl = this.gl;
      const i = Math.min(this.urls.length - 2, Math.floor(this.prog));
      const f = this.prog - i;
      const A = this.tex[i], B = this.tex[i + 1];
      if (!A || !B || this.perdu) return;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.t);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, B.t);
      gl.uniform2f(this.u.rA, A.w, A.h); gl.uniform2f(this.u.rB, B.w, B.h);
      gl.uniform2f(this.u.res, this.c.width, this.c.height);
      gl.uniform2f(this.u.souris, this.souris[0], this.souris[1]);
      gl.uniform1f(this.u.t, f);
      gl.uniform1f(this.u.temps, ms / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  window.Matiere = Matiere;
})();
