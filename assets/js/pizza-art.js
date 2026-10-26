/* Pizza Lyght — illustrations de pizzas dessinées d'après la composition réelle de la carte.
   Pas des photos : des dessins, signalés comme tels sur le site. */
(function () {
  var PL = window.PL = window.PL || {};

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = typeof seed === 'string' ? hash(seed) : seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var uidN = 0; function uid() { uidN += 1; return 'pz' + uidN.toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function f(n) { return Math.round(n * 10) / 10; }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').trim(); }

  /* Correspondance texte de la carte -> type de garniture */
  var MAP = [
    [/^tomates?$/, 'base-tomate'], [/^creme fraiche$/, 'creme'], [/^(fromage|emmental|mozzarella)$/, 'fromage'],
    [/fromage de chevre|^chevre$/, 'chevre'], [/roquefort/, 'roquefort'], [/^miel$/, 'miel'],
    [/^jambon/, 'jambon'], [/lardons/, 'lardons'], [/chorizo/, 'chorizo'], [/merguez/, 'merguez'],
    [/viande hachee/, 'viande'], [/saucisses? boucanees?/, 'saucisse-boucanee'], [/saucisses? fumees?|saucisse fumee/, 'saucisse'],
    [/poulet boucane/, 'poulet-boucane'], [/poulet/, 'poulet'], [/^thon$/, 'thon'], [/crevettes/, 'crevettes'],
    [/saumon/, 'saumon'], [/anchois/, 'anchois'], [/moules/, 'moules'], [/fruits de mer/, 'fruits-de-mer'],
    [/poissons? boucanes?/, 'poisson-boucane'], [/champignons/, 'champignons'], [/oignons/, 'oignons'],
    [/poivrons/, 'poivrons'], [/olives/, 'olives'], [/ananas/, 'ananas'], [/mais/, 'mais'],
    [/pomme de terre/, 'pomme-de-terre'], [/^(oeuf|œuf)/, 'oeuf'], [/fines herbes/, 'herbes'], [/citron/, 'citron']
  ];

  function parse(ing) {
    var parts = ing.split(',').map(function (x) { return norm(x.replace(/\(.*?\)/g, '')); }).filter(Boolean);
    var r = { base: 'tomate', fromage: false, garnitures: [], oeuf: false, miel: false, herbes: false, creme: false, calzone: /chausson/.test(norm(ing)) };
    parts.forEach(function (p, i) {
      var key = null;
      for (var k = 0; k < MAP.length; k++) { if (MAP[k][0].test(p)) { key = MAP[k][1]; break; } }
      if (!key) return;
      if (key === 'base-tomate') { r.base = 'tomate'; return; }
      if (key === 'creme') { if (i === 0) r.base = 'creme'; else r.creme = true; return; }
      if (key === 'fromage') { r.fromage = true; return; }
      if (key === 'oeuf') { r.oeuf = true; return; }
      if (key === 'miel') { r.miel = true; return; }
      if (key === 'herbes') { r.herbes = true; return; }
      if (r.garnitures.indexOf(key) < 0) r.garnitures.push(key);
    });
    if (r.base === 'creme' || r.garnitures.indexOf('chevre') >= 0 || r.garnitures.indexOf('roquefort') >= 0) r.fromage = r.fromage || /emmental|fromage/.test(norm(ing));
    return r;
  }

  /* --- Dessins des pièces, centrés en 0,0 --- */
  function blob(R, r0, r1, n) {
    var P = [];
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2 + R() * 0.4; var rr = r0 + R() * (r1 - r0); P.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    var mid = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    var m0 = mid(P[n - 1], P[0]), d = 'M' + f(m0[0]) + ',' + f(m0[1]);
    for (var k = 0; k < n; k++) { var m = mid(P[k], P[(k + 1) % n]); d += 'Q' + f(P[k][0]) + ',' + f(P[k][1]) + ' ' + f(m[0]) + ',' + f(m[1]); }
    return d + 'Z';
  }

  var PIECES = {
    jambon: { n: 9, d: 15, draw: function (R) { return '<path d="M-7,-5Q0,-7.5 7,-5Q8.5,0 7,5Q0,7.5 -7,5Q-8.5,0 -7,-5Z" fill="#E7A0A3" stroke="#F6D0C9" stroke-width="1.1"/><path d="M-4,-1.5Q0,-3 4,-1" stroke="#D88489" stroke-width=".8" fill="none"/>'; } },
    lardons: { n: 15, d: 9, draw: function () { return '<rect x="-4.2" y="-2.3" width="8.4" height="4.6" rx="1.3" fill="#C56A55"/><rect x="-4.2" y="-.5" width="8.4" height="1.3" fill="#F3D6C6"/>'; } },
    chorizo: { n: 9, d: 14, draw: function (R) { return '<circle r="6.6" fill="#C0391F" stroke="#8A2210" stroke-width="1"/><circle cx="-2" cy="-1.5" r="1.1" fill="#EFA27C"/><circle cx="2.2" cy=".8" r=".9" fill="#EFA27C"/><circle cx="-.4" cy="2.6" r=".8" fill="#EFA27C"/>'; } },
    merguez: { n: 10, d: 12, draw: function () { return '<ellipse rx="5.2" ry="4.2" fill="#8E2B19" stroke="#5C190D" stroke-width=".9"/><ellipse cx="-1.4" cy="-1.2" rx="1.8" ry="1" fill="#B5503A"/>'; } },
    viande: { n: 24, d: 7, draw: function (R) { return '<path d="' + blob(R, 2.4, 4.2, 7) + '" fill="#6E3B22"/><path d="' + blob(R, 1, 2, 5) + '" fill="#8D5233"/>'; } },
    saucisse: { n: 9, d: 13, draw: function () { return '<circle r="5.8" fill="#8A4325"/><circle r="4" fill="#A9583A"/><circle cx="-1.3" cy="-1" r="1" fill="#C8785A"/>'; } },
    'saucisse-boucanee': { n: 9, d: 13, draw: function () { return '<circle r="5.8" fill="#5C2C17"/><circle r="4.1" fill="#7A3C22"/><path d="M-3.5,-1.5L3.5,-2.5M-3.5,1.8L3.5,.8" stroke="#2B1309" stroke-width="1.1"/>'; } },
    poulet: { n: 10, d: 13, draw: function (R) { return '<path d="' + blob(R, 4, 6.5, 7) + '" fill="#DDAE73"/><path d="' + blob(R, 1.5, 2.8, 5) + '" fill="#EDCB98" transform="translate(-1 -1)"/>'; } },
    'poulet-boucane': { n: 10, d: 13, draw: function (R) { return '<path d="' + blob(R, 4.2, 6.6, 7) + '" fill="#B5793F"/><path d="M-4,-2L4,-3.4M-4.4,1.4L4,0" stroke="#4A2711" stroke-width="1.3" stroke-linecap="round"/>'; } },
    thon: { n: 11, d: 11, draw: function (R) { return '<path d="' + blob(R, 2.5, 4, 6) + '" fill="#CDB7A5" transform="translate(-2 0)"/><path d="' + blob(R, 2, 3.4, 6) + '" fill="#BDA390" transform="translate(2.5 1.5)"/>'; } },
    crevettes: { n: 8, d: 14, draw: function () { return '<path d="M-5,2.5A5.6,5.6 0 1 1 4.6,3.6" fill="none" stroke="#EE8A5B" stroke-width="3.8" stroke-linecap="round"/><path d="M-2,-4.6L-1,-2.4M2.6,-3.6L1.4,-1.8M4.6,.4L2.6,.6" stroke="#FFD9C4" stroke-width=".8"/>'; } },
    saumon: { n: 7, d: 16, draw: function () { return '<path d="M-8.5,-1.5C-5,-6 -1,2 3,-2.5C5.5,-5 8.5,-3 8.5,0C5,4.5 1,-1.5 -3,2.6C-5.5,5 -8.5,3 -8.5,-1.5Z" fill="#F08A68"/><path d="M-6,0C-3,-3 0,2 3,-1M0,1C2,-1 4,-1 6,0" stroke="#FFC6AC" stroke-width=".7" fill="none"/>'; } },
    anchois: { n: 6, d: 15, draw: function () { return '<ellipse rx="9.5" ry="1.7" fill="#6B6157"/><path d="M-8,-.3H8" stroke="#BDB4AA" stroke-width=".5"/>'; } },
    moules: { n: 8, d: 13, draw: function () { return '<ellipse rx="6.2" ry="3.8" fill="#24212C"/><ellipse rx="4.3" ry="2.3" fill="#E8913E"/>'; } },
    'fruits-de-mer': { n: 12, d: 12, draw: function (R, i) { var k = i % 3; if (k === 0) return PIECES.crevettes.draw(R); if (k === 1) return PIECES.moules.draw(R); return '<circle r="4.2" fill="none" stroke="#F4EADB" stroke-width="2.3"/>'; } },
    'poisson-boucane': { n: 12, d: 11, draw: function (R) { return '<path d="' + blob(R, 3, 5, 6) + '" fill="#9C6B3F"/><path d="M-2.5,-1.5L2.5,-2" stroke="#C99A69" stroke-width="1"/>'; } },
    champignons: { n: 10, d: 13, draw: function () { return '<path d="M-6,0C-6,-6.5 6,-6.5 6,0L2.5,0L2.5,5L-2.5,5L-2.5,0Z" fill="#D9C5A6" stroke="#A88E6E" stroke-width=".9"/>'; } },
    oignons: { n: 10, d: 10, draw: function () { return '<path d="M-6.5,0A6.5,6.5 0 0 1 6.5,0" fill="none" stroke="#C59BBE" stroke-width="1.7"/><path d="M-3.8,0A3.8,3.8 0 0 1 3.8,0" fill="none" stroke="#E8D3E3" stroke-width="1.1"/>'; } },
    poivrons: { n: 11, d: 11, draw: function (R, i) { return '<path d="M-7,-.5Q0,-5 7,-.5" fill="none" stroke="' + (i % 3 === 2 ? '#C8321E' : '#3E8F39') + '" stroke-width="2.7" stroke-linecap="round"/>'; } },
    olives: { n: 7, d: 14, draw: function () { return '<circle r="3.8" fill="#1E1A17"/><circle r="1.4" fill="#3F362F"/><circle cx="-1.6" cy="-1.6" r=".7" fill="#5B5048"/>'; } },
    ananas: { n: 9, d: 12, draw: function () { return '<path d="M-4.5,-4L5,-3L4,4.3L-5,3.2Z" fill="#F3C443" stroke="#DCA22A" stroke-width=".7"/>'; } },
    mais: { n: 28, d: 5, draw: function () { return '<circle r="1.9" fill="#F6CC3B"/><circle cx="-.5" cy="-.5" r=".6" fill="#FFF0A8"/>'; } },
    'pomme-de-terre': { n: 8, d: 15, draw: function () { return '<circle r="6.6" fill="#EBD59C" stroke="#C6A462" stroke-width="1.1"/>'; } },
    chevre: { n: 7, d: 15, draw: function () { return '<circle r="6.2" fill="#F8F3E7" stroke="#DAD0BB" stroke-width="1.3"/><circle cx="-1.8" cy="-1.5" r=".7" fill="#E6DECD"/><circle cx="1.6" cy="1.2" r=".6" fill="#E6DECD"/>'; } },
    roquefort: { n: 9, d: 11, draw: function (R) { return '<path d="' + blob(R, 3, 4.6, 6) + '" fill="#ECE8D9"/><circle cx="-1.2" cy="-.6" r=".9" fill="#4F6E7A"/><circle cx="1.4" cy="1.1" r=".7" fill="#4F6E7A"/>'; } },
    citron: { n: 2, d: 22, draw: function () { var s = '<circle r="6.8" fill="#F7E46E" stroke="#EFCB2E" stroke-width="1.4"/>'; for (var k = 0; k < 6; k++) { var a = k / 6 * Math.PI * 2; s += '<path d="M0,0L' + f(Math.cos(a) * 5.4) + ',' + f(Math.sin(a) * 5.4) + '" stroke="#FFF6C4" stroke-width=".6"/>'; } return s; } },
    herbes: { n: 34, d: 4, draw: function () { return '<ellipse rx="1.5" ry=".75" fill="#3E7A2E"/>'; } },
    creme: { n: 7, d: 15, draw: function (R) { return '<path d="' + blob(R, 3.2, 4.8, 8) + '" fill="#FAF4E8" opacity=".92"/>'; } },
    oeuf: { n: 1, d: 36, draw: function () { return '<path d="M-16,-4C-18,-16 -4,-20 4,-16C16,-18 22,-6 16,4C18,16 2,20 -6,14C-18,16 -22,4 -16,-4Z" fill="#FBF7EE"/><circle r="7" fill="#F6B21B"/><circle cx="-2.4" cy="-2.4" r="2.2" fill="#FFD97A"/>'; } },
    miel: { n: 3, d: 26, draw: function () { return '<path d="M-18,0Q-12,-8 -6,0T6,0T18,0" fill="none" stroke="#E7A11A" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>'; } }
  };

  var LABELS = {
    jambon: 'Jambon', lardons: 'Lardons', chorizo: 'Chorizo', merguez: 'Merguez', viande: 'Viande hachée', saucisse: 'Saucisse fumée',
    'saucisse-boucanee': 'Saucisse boucanée', poulet: 'Poulet fumé', 'poulet-boucane': 'Poulet boucané', thon: 'Thon', crevettes: 'Crevettes',
    saumon: 'Saumon', anchois: 'Anchois', moules: 'Moules', 'fruits-de-mer': 'Fruits de mer', 'poisson-boucane': 'Poissons boucanés',
    champignons: 'Champignons', oignons: 'Oignons', poivrons: 'Poivrons', olives: 'Olives', ananas: 'Ananas', mais: 'Maïs',
    'pomme-de-terre': 'Pomme de terre', chevre: 'Chèvre', roquefort: 'Roquefort', citron: 'Citron', herbes: 'Fines herbes', creme: 'Crème fraîche'
  };

  /* Position aléatoire dans le disque, en évitant les chevauchements */
  function place(R, taken, radius, minD) {
    var best = null, bestScore = -1;
    for (var t = 0; t < 22; t++) {
      var a = R() * Math.PI * 2, r = Math.sqrt(R()) * radius;
      var x = 100 + Math.cos(a) * r, y = 100 + Math.sin(a) * r;
      var dmin = 1e9;
      for (var i = 0; i < taken.length; i++) { var dx = taken[i][0] - x, dy = taken[i][1] - y; var dd = Math.sqrt(dx * dx + dy * dy) - taken[i][2]; if (dd < dmin) dmin = dd; }
      if (dmin >= minD * 0.5) { best = [x, y]; break; }
      if (dmin > bestScore) { bestScore = dmin; best = [x, y]; }
    }
    taken.push([best[0], best[1], minD * 0.5]);
    return best;
  }

  /* Un groupe de pièces pour une garniture */
  function group(key, seed, opts) {
    opts = opts || {};
    var def = PIECES[key]; if (!def) return '';
    var R = rng(seed + ':' + key);
    var n = Math.max(1, Math.round(def.n * (opts.scale || 1)));
    var taken = opts.taken || [];
    var s = '<g class="ing" data-ing="' + key + '">';
    for (var i = 0; i < n; i++) {
      var p = place(R, taken, opts.radius || 70, def.d);
      s += '<g class="pc" transform="translate(' + f(p[0]) + ' ' + f(p[1]) + ') rotate(' + Math.round(R() * 360) + ')">' + def.draw(R, i) + '</g>';
    }
    return s + '</g>';
  }

  function defs(id, base) {
    var sauce = base === 'creme'
      ? '<radialGradient id="' + id + 's" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F5EAD3"/><stop offset="1" stop-color="#E4D1AC"/></radialGradient>'
      : '<radialGradient id="' + id + 's" cx="50%" cy="48%" r="52%"><stop offset="0" stop-color="#C9472B"/><stop offset=".8" stop-color="#B0361E"/><stop offset="1" stop-color="#922915"/></radialGradient>';
    return '<defs>' +
      '<radialGradient id="' + id + 'c" cx="50%" cy="50%" r="50%"><stop offset=".82" stop-color="#ECC170"/><stop offset=".93" stop-color="#D08F38"/><stop offset="1" stop-color="#93521A"/></radialGradient>' +
      '<radialGradient id="' + id + 'h" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      sauce + '</defs>';
  }

  function crust(id, R) {
    var s = '<circle cx="100" cy="108" r="100" fill="url(#' + id + 'h)"/>' +
      '<circle cx="100" cy="100" r="96" fill="url(#' + id + 'c)"/>';
    for (var i = 0; i < 16; i++) {
      var a = R() * Math.PI * 2, r = 89 + R() * 5;
      s += '<ellipse cx="' + f(100 + Math.cos(a) * r) + '" cy="' + f(100 + Math.sin(a) * r) + '" rx="' + f(2 + R() * 3) + '" ry="' + f(1.2 + R() * 1.6) + '" transform="rotate(' + Math.round(a * 57.3 + 90) + ' ' + f(100 + Math.cos(a) * r) + ' ' + f(100 + Math.sin(a) * r) + ')" fill="#5E3313" opacity="' + f(.35 + R() * .35) + '"/>';
    }
    return s;
  }

  function cheese(R, base) {
    var s = '<g class="fromage">';
    var col = base === 'creme' ? ['#F7E39E', '#F3D47A', '#FAEBC0'] : ['#F3D27A', '#EDC25A', '#F7DE97'];
    for (var i = 0; i < 38; i++) {
      var a = R() * Math.PI * 2, r = Math.sqrt(R()) * 68;
      s += '<path transform="translate(' + f(100 + Math.cos(a) * r) + ' ' + f(100 + Math.sin(a) * r) + ')" d="' + blob(R, 6, 13, 9) + '" fill="' + col[i % 3] + '" opacity=".78"/>';
    }
    for (var j = 0; j < 16; j++) {
      var b = R() * Math.PI * 2, q = Math.sqrt(R()) * 72;
      s += '<path transform="translate(' + f(100 + Math.cos(b) * q) + ' ' + f(100 + Math.sin(b) * q) + ')" d="' + blob(R, 1.2, 3.4, 6) + '" fill="#B9772A" opacity=".5"/>';
    }
    return s + '</g>';
  }

  function egg() {
    return '<g class="oeuf"><path d="M84,96C82,84 96,80 104,84C116,82 122,94 116,104C118,116 102,120 94,114C82,116 78,104 84,96Z" fill="#FBF7EE"/><circle cx="100" cy="99" r="7.2" fill="#F6B21B"/><circle cx="97.6" cy="96.6" r="2.2" fill="#FFD97A"/></g>';
  }
  function honey(R) {
    var d = 'M' + f(40 + R() * 6) + ',70';
    for (var i = 0; i < 6; i++) { d += 'Q' + f(60 + i * 18) + ',' + f(i % 2 ? 140 : 58) + ' ' + f(70 + i * 18) + ',' + f(i % 2 ? 72 : 128); }
    return '<path d="' + d + '" fill="none" stroke="#E7A11A" stroke-width="1.9" stroke-linecap="round" opacity=".85"/>';
  }

  function svg(item, opts) {
    opts = opts || {};
    var rec = typeof item === 'string' ? parse(item) : (item.ing ? parse(item.ing) : item);
    var seed = (item && item.nom) || (typeof item === 'string' ? item : 'pizza');
    var id = uid(), R = rng(seed);
    var title = opts.title ? '<title>' + opts.title + '</title>' : '';
    var aria = opts.title ? ' role="img" aria-label="' + opts.title + '"' : ' aria-hidden="true"';
    if (rec.calzone) return calzone(id, R, title, aria, opts);
    var s = '<svg class="pz" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"' + aria + '>' + title + defs(id, rec.base) + crust(id, R) +
      '<circle cx="100" cy="100" r="84" fill="url(#' + id + 's)"/>';
    if (rec.fromage || (item && item.allasani)) s += cheese(R, rec.base);
    var taken = [];
    if (rec.oeuf) taken.push([100, 100, 20]);
    var order = rec.garnitures.slice().sort(function (a, b) { return (PIECES[b] ? PIECES[b].d : 0) - (PIECES[a] ? PIECES[a].d : 0); });
    var share = Math.max(0.45, Math.min(1, 3.2 / Math.max(1, order.length)));
    order.forEach(function (k) { s += group(k, seed, { taken: taken, scale: share, radius: 70 }); });
    if (rec.creme) s += group('creme', seed, { taken: taken, scale: .8 });
    if (rec.oeuf) s += egg();
    if (rec.miel) s += honey(R);
    if (rec.herbes) s += group('herbes', seed, { taken: [], scale: 1 });
    return s + '</svg>';
  }

  function calzone(id, R, title, aria) {
    var s = '<svg class="pz pz-calzone" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"' + aria + '>' + title + defs(id, 'tomate') +
      '<ellipse cx="100" cy="132" rx="90" ry="30" fill="url(#' + id + 'h)"/>' +
      '<g transform="rotate(-10 100 110)"><path d="M16,118A84,84 0 0 1 184,118Z" fill="url(#' + id + 'c)"/>' +
      '<path d="M16,118A84,84 0 0 1 184,118" fill="none" stroke="#E7B562" stroke-width="3" opacity=".6"/>';
    for (var i = 0; i < 18; i++) { s += '<circle cx="' + f(20 + i * 9.4) + '" cy="119" r="5.2" fill="#D79A45"/>'; }
    for (var j = 0; j < 12; j++) { var a = Math.PI + R() * Math.PI, r = 30 + R() * 48; s += '<ellipse cx="' + f(100 + Math.cos(a) * r) + '" cy="' + f(118 + Math.sin(a) * r) + '" rx="' + f(2 + R() * 3) + '" ry="' + f(1.2 + R() * 1.5) + '" fill="#6A3A16" opacity=".45"/>'; }
    s += '<path d="M76,74Q100,62 124,74" stroke="#9E2914" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80,74Q100,65 120,74" stroke="#F3CD62" stroke-width="2" fill="none" stroke-linecap="round"/></g>';
    return s + '</svg>';
  }

  function dataUri(item, opts) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(item, opts));
  }

  /* Pâte crue + sauce + fromage pour le composeur, avec un calque vide pour les garnitures */
  function composerBase(opts) {
    opts = opts || {};
    var id = uid(), R = rng('allasani');
    return '<svg class="pz pz-composer" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (opts.label || 'Votre pizza Allasani') + '">' + defs(id, 'tomate') + crust(id, R) +
      '<circle cx="100" cy="100" r="84" fill="url(#' + id + 's)"/>' + cheese(R, 'tomate') + '<g class="garnitures"></g></svg>';
  }

  PL.art = { parse: parse, svg: svg, dataUri: dataUri, group: group, composerBase: composerBase, labels: LABELS, pieces: PIECES, rng: rng, norm: norm };
})();
