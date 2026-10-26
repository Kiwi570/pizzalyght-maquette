/* Pizza Lyght — effets WebGL (OGL).
   1. La cuisson : la vraie photo de pizza passe de crue à dorée, avec l'air chaud qui ondule au-dessus.
   2. La fumée du boucan : fond de fumée ambrée qui monte.
   Sans WebGL, les versions CSS prennent le relais. */
(function () {
  var PL = window.PL = window.PL || {};
  var NOISE = [
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}'
  ].join('\n');
  var VERT = 'attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}';

  function ok() {
    if (!window.OGL) return false;
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; }
  }
  PL.glOk = ok;
  /* Libère le contexte et remet une toile neuve, pour pouvoir relancer l'effet (mode calme coupé puis rétabli). */
  function neuf(canvas, gl) {
    var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    var c = canvas.cloneNode(false); c.removeAttribute('style'); c.removeAttribute('width'); c.removeAttribute('height');
    if (canvas.parentNode) canvas.parentNode.replaceChild(c, canvas);
  }

  /* La cuisson */
  PL.cuisson = function (canvas, src, opts) {
    opts = opts || {};
    var O = window.OGL;
    var renderer = new O.Renderer({ canvas: canvas, alpha: true, premultipliedAlpha: false, dpr: Math.min(1.75, window.devicePixelRatio || 1) });
    var gl = renderer.gl; gl.clearColor(0, 0, 0, 0);
    var tex = new O.Texture(gl, { generateMipmaps: false });
    var prog = new O.Program(gl, {
      vertex: VERT,
      fragment: 'precision highp float;varying vec2 vUv;uniform sampler2D tMap;uniform float uT;uniform float uCuit;uniform float uChaud;uniform vec2 uSouris;' + NOISE +
        'void main(){vec2 uv=vUv;' +
        'float d=length(uv-.5);' +
        'float w=fbm(uv*vec2(5.,9.)+vec2(0.,-uT*.9));' +
        'float prox=smoothstep(.35,0.,length(uv-uSouris));' +
        'uv+=(vec2(w,fbm(uv*7.+uT*.4))-.5)*(.006+.012*prox)*uChaud;' +
        'vec4 c=texture2D(tMap,uv);' +
        'float l=dot(c.rgb,vec3(.299,.587,.114));' +
        'vec3 cru=mix(vec3(l),c.rgb,.28)*1.12+vec3(.07,.06,.04);' +
        'float m=smoothstep(.0,.08,uCuit*.7-(.5-d)+ (fbm(vUv*6.)-.5)*.1);' +
        'vec3 dore=c.rgb*vec3(1.06,1.,.9);' +
        'float bord=smoothstep(.40,.5,d);' +
        'dore=mix(dore,dore*vec3(.86,.72,.6),bord*.35);' +
        'vec3 col=mix(cru,dore,m);' +
        'float ligne=exp(-abs(uCuit*.7-(.5-d))*38.)*(1.-smoothstep(.85,1.,uCuit));' +
        'col+=vec3(1.,.42,.12)*ligne*.55*c.a;' +
        'col+=vec3(.12,.04,0.)*prox*uChaud*.6;' +
        'gl_FragColor=vec4(col,c.a);}',
      uniforms: { tMap: { value: tex }, uT: { value: 0 }, uCuit: { value: opts.cuit == null ? 0 : opts.cuit }, uChaud: { value: 1 }, uSouris: { value: new O.Vec2(-1, -1) } },
      transparent: true
    });
    var mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program: prog });
    var img = new Image(); img.decoding = 'async';
    var pret = new Promise(function (res, rej) { img.onload = function () { tex.image = img; res(); }; img.onerror = rej; });
    img.src = src;
    var raf = 0, vis = true, arret = false, t0 = performance.now();
    function taille() { var w = canvas.parentNode.clientWidth, h = canvas.parentNode.clientHeight; if (w) { renderer.setSize(w, h); canvas.style.width = '100%'; canvas.style.height = '100%'; } }
    function boucle(t) {
      raf = 0; if (arret) return;
      prog.uniforms.uT.value = (t - t0) / 1000;
      renderer.render({ scene: mesh });
      if (vis && !opts.statique) raf = requestAnimationFrame(boucle);
    }
    var ro = new ResizeObserver(function () { taille(); if (!raf) renderer.render({ scene: mesh }); }); ro.observe(canvas.parentNode);
    var io = new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis && !raf && !arret) raf = requestAnimationFrame(boucle); }); io.observe(canvas);
    var mv = function (e) { var r = canvas.getBoundingClientRect(); prog.uniforms.uSouris.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); };
    window.addEventListener('pointermove', mv, { passive: true });
    taille();
    return {
      pret: pret.then(function () { raf = requestAnimationFrame(boucle); }),
      uniforms: prog.uniforms,
      rendre: function () { renderer.render({ scene: mesh }); },
      stop: function () { arret = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', mv); neuf(canvas, gl); }
    };
  };

  /* La fumée du boucan */
  PL.fumee = function (canvas) {
    var O = window.OGL;
    var renderer = new O.Renderer({ canvas: canvas, alpha: true, dpr: Math.min(1, window.devicePixelRatio || 1) });
    var gl = renderer.gl; gl.clearColor(0, 0, 0, 0);
    var prog = new O.Program(gl, {
      vertex: VERT,
      fragment: 'precision highp float;varying vec2 vUv;uniform float uT;uniform vec2 uR;' + NOISE +
        'void main(){vec2 p=vUv*vec2(uR.x/uR.y,1.)*2.2;' +
        'vec2 q=vec2(fbm(p+vec2(0.,-uT*.08)),fbm(p+vec2(5.2,1.3)-uT*.06));' +
        'float f=fbm(p+2.2*q+vec2(0.,-uT*.14));' +
        'float bas=smoothstep(1.1,0.,vUv.y);' +
        'float a=smoothstep(.38,.92,f)*(.25+.75*bas);' +
        'vec3 col=mix(vec3(.42,.18,.07),vec3(1.,.58,.22),smoothstep(.5,1.,f)*bas);' +
        'gl_FragColor=vec4(col*a*.55,a*.55);}',
      uniforms: { uT: { value: 0 }, uR: { value: new O.Vec2(1, 1) } },
      transparent: true
    });
    var mesh = new O.Mesh(gl, { geometry: new O.Triangle(gl), program: prog });
    var raf = 0, vis = false, arret = false, t0 = performance.now();
    function taille() { var w = canvas.parentNode.clientWidth, h = canvas.parentNode.clientHeight; if (w) { renderer.setSize(w, h); canvas.style.width = '100%'; canvas.style.height = '100%'; prog.uniforms.uR.value.set(w, h); } }
    function boucle(t) { raf = 0; if (arret || !vis) return; prog.uniforms.uT.value = (t - t0) / 1000; renderer.render({ scene: mesh }); raf = requestAnimationFrame(boucle); }
    var ro = new ResizeObserver(taille); ro.observe(canvas.parentNode);
    var io = new IntersectionObserver(function (e) { vis = e[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(boucle); }, { rootMargin: '100px' }); io.observe(canvas);
    taille();
    return { stop: function () { arret = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); neuf(canvas, gl); } };
  };
})();
