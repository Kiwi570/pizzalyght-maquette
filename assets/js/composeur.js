/* Pizza Lyght — composeur de la pizza Allasani (8 ingrédients au choix, 20 €).
   Les garnitures tombent sur la pâte ; la liste exacte des ingrédients est à confirmer avec la pizzeria. */
(function () {
  var PL = window.PL;
  var CLES = {
    'jambon': 'jambon', 'lardons': 'lardons', 'chorizo': 'chorizo', 'merguez': 'merguez', 'viande hachée': 'viande',
    'poulet fumé': 'poulet', 'poulet boucané': 'poulet-boucane', 'saucisse fumée': 'saucisse', 'thon': 'thon',
    'crevettes': 'crevettes', 'saumon': 'saumon', 'anchois': 'anchois', 'champignons': 'champignons', 'oignons': 'oignons',
    'poivrons': 'poivrons', 'olives': 'olives', 'ananas': 'ananas', 'maïs': 'mais', 'pomme de terre': 'pomme-de-terre',
    'œuf': 'oeuf', 'fromage de chèvre': 'chevre', 'roquefort': 'roquefort', 'miel': 'miel', 'fines herbes': 'herbes'
  };
  var MAX = 8;
  var ID_ALLASANI = 'pizzas--pizza-allasani';

  function pelleSVG() {
    return '<svg class="pelle" viewBox="0 0 200 200" aria-hidden="true"><defs>' +
      '<radialGradient id="bois" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#C79458"/><stop offset=".7" stop-color="#A9743D"/><stop offset="1" stop-color="#7E5226"/></radialGradient>' +
      '<linearGradient id="manche" x1="0" x2="1"><stop offset="0" stop-color="#8E5E2B"/><stop offset=".5" stop-color="#B07B42"/><stop offset="1" stop-color="#8E5E2B"/></linearGradient></defs>' +
      '<rect x="150" y="150" width="70" height="20" rx="10" transform="rotate(45 150 150)" fill="url(#manche)"/>' +
      '<circle cx="100" cy="100" r="98" fill="url(#bois)"/>' +
      '<g fill="none" stroke="#7A4E22" stroke-opacity=".28" stroke-width=".8">' +
      '<path d="M20,70C70,62 130,80 182,68"/><path d="M8,104C60,96 140,112 192,100"/><path d="M18,138C70,130 130,146 180,134"/><path d="M40,40C80,36 120,48 160,40"/><path d="M42,166C80,160 120,172 158,164"/></g>' +
      '<g fill="#F5EBDD" opacity=".35"><circle cx="40" cy="70" r="1"/><circle cx="160" cy="130" r="1.2"/><circle cx="70" cy="160" r=".8"/><circle cx="150" cy="50" r="1"/><circle cx="30" cy="120" r=".9"/></g></svg>';
  }

  function mini(cle) {
    if (cle === 'olives') return '<svg class="mini" viewBox="-10 -10 20 20" aria-hidden="true"><circle r="5.2" fill="#1E1A17" stroke="#B5A797" stroke-width="1.4"/><circle r="1.8" fill="#3F362F"/></svg>';
    var p = PL.art.pieces[cle]; if (!p) return '';
    var R = PL.art.rng('mini' + cle);
    var s = cle === 'oeuf' ? .55 : (cle === 'mais' || cle === 'herbes') ? 3.4 : cle === 'miel' ? .6 : 1.25;
    return '<svg class="mini" viewBox="-10 -10 20 20" aria-hidden="true"><g transform="scale(' + s + ')">' + p.draw(R, 0) + '</g></svg>';
  }

  PL.composeur = function (racine, opts) {
    opts = opts || {};
    var noms = PL.data.allasaniIngredients;
    racine.innerHTML =
      '<div class="allasani-grille">' +
      '<div class="plan-travail" data-grok="g-pelle-bois-1x1">' + pelleSVG() + PL.art.composerBase() +
      '<div class="compteur" aria-live="polite"><svg viewBox="0 0 92 92" aria-hidden="true"><circle cx="46" cy="46" r="40" fill="rgba(21,17,14,.75)" stroke="rgba(245,235,221,.15)" stroke-width="5"/><circle class="jauge" cx="46" cy="46" r="40" fill="none" stroke="#FF5B1F" stroke-width="5" stroke-linecap="round" stroke-dasharray="251.3" stroke-dashoffset="251.3"/></svg><div><b class="nbsel">0</b><small>sur 8</small></div></div>' +
      '</div>' +
      '<div class="composeur">' +
      (opts.tete || '') +
      '<div class="puces" role="group" aria-label="Ingrédients au choix">' + noms.map(function (n) { var c = CLES[n]; return '<button type="button" class="puce" aria-pressed="false" data-ing="' + c + '" data-nom="' + n + '">' + mini(c) + '<span>' + n.charAt(0).toUpperCase() + n.slice(1) + '</span></button>'; }).join('') + '</div>' +
      '<p class="todo-note">base de la pizza et liste exacte des ingrédients proposés</p>' +
      '<div class="composeur-bas"><span class="prix">20,00&nbsp;€</span><button class="btn" type="button" data-allasani disabled data-aimant><span class="btn-in">Ajouter au panier</span></button><button class="btn ghost small" type="button" data-vider>Tout retirer</button></div>' +
      '</div></div>';

    var svg = racine.querySelector('.pz-composer'), calque = svg.querySelector('.garnitures');
    var jauge = racine.querySelector('.jauge'), nb = racine.querySelector('.nbsel'), btn = racine.querySelector('[data-allasani]');
    var sel = [], places = [];
    function anime() { return window.gsap && !PL.calme(); }

    function maj() {
      nb.textContent = sel.length;
      var off = 251.3 * (1 - sel.length / MAX);
      if (anime()) gsap.to(jauge, { attr: { 'stroke-dashoffset': off }, duration: .5, ease: 'power3.out' }); else jauge.setAttribute('stroke-dashoffset', off);
      btn.disabled = sel.length === 0;
      btn.querySelector('.btn-in').textContent = sel.length ? 'Ajouter au panier (' + sel.length + '/8)' : 'Choisissez vos ingrédients';
      racine.querySelectorAll('.puce').forEach(function (p) { if (p.getAttribute('aria-pressed') !== 'true') p.disabled = sel.length >= MAX; });
    }

    function poser(cle) {
      var tmp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tmp.innerHTML = PL.art.group(cle, 'allasani', { taken: places, scale: cle === 'oeuf' || cle === 'miel' ? 1 : .62, radius: 64 });
      var g = tmp.firstChild; calque.appendChild(g);
      if (!anime()) return;
      var pcs = g.querySelectorAll('.pc');
      gsap.from(pcs, { y: '-=150', rotation: '+=120', opacity: 0, duration: .9, ease: 'bounce.out', stagger: { each: .035, from: 'random' } });
      gsap.fromTo(svg, { scale: 1 }, { scale: .985, duration: .12, yoyo: true, repeat: 1, delay: .5, transformOrigin: '50% 50%' });
    }
    function retirer(cle) {
      var g = calque.querySelector('[data-ing="' + cle + '"]'); if (!g) return;
      g.removeAttribute('data-ing');
      if (!anime()) { g.remove(); return; }
      gsap.to(g.querySelectorAll('.pc'), { y: '-=60', opacity: 0, duration: .35, stagger: .01, ease: 'power2.in', onComplete: function () { g.remove(); } });
    }

    racine.addEventListener('click', function (e) {
      var p = e.target.closest('.puce');
      if (p) {
        var cle = p.getAttribute('data-ing'), on = p.getAttribute('aria-pressed') === 'true';
        if (on) { sel = sel.filter(function (x) { return x !== cle; }); p.setAttribute('aria-pressed', 'false'); retirer(cle); }
        else if (sel.length < MAX) { sel.push(cle); p.setAttribute('aria-pressed', 'true'); poser(cle); if (sel.length === MAX) PL.message('8 ingrédients choisis : votre Allasani est complète'); }
        maj(); return;
      }
      if (e.target.closest('[data-vider]')) {
        sel.slice().forEach(retirer); sel = []; places = [];
        racine.querySelectorAll('.puce').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        maj(); return;
      }
      if (e.target.closest('[data-allasani]') && sel.length) {
        var noms = sel.map(function (c) { var b = racine.querySelector('.puce[data-ing="' + c + '"]'); return b.getAttribute('data-nom'); }).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
        var tmp = svg.cloneNode(true);
        var src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(tmp));
        PL.ajouter(ID_ALLASANI, { from: svg, visuel: src, detail: noms.join(', ') });
        if (opts.apresAjout) opts.apresAjout();
      }
    });
    maj();
    if (PL.grok) PL.grok();
    return { svg: svg };
  };
})();
