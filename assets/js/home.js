/* Pizza Lyght — accueil */
(function () {
  var PL = window.PL, D = PL.data, $ = PL.$, $$ = PL.$$, esc = PL.esc, euro = PL.euro;
  var html = document.documentElement;
  var desktop = function () { return matchMedia('(min-width: 761px)').matches; };

  /* ---------- Rendu des contenus ---------- */
  function trouver(nom) { return D.categories[0].items.filter(function (p) { return p.nom === nom; })[0]; }
  function tags(p) {
    var r = PL.art.parse(p.ing), t = [];
    if (/boucan/i.test(p.ing)) t.push('<span class="tag boucan">Boucané</span>');
    if (r.garnitures.some(function (g) { return /crevettes|saumon|thon|anchois|moules|fruits|poisson/.test(g); })) t.push('<span class="tag">De la mer</span>');
    return t.join('');
  }
  function geant(nom) { return nom.replace('Pizza ', '').replace('Saint Laurentaise', 'St-Laurent'); }

  function rendrePays() {
    var piste = $('.piste'); if (!piste) return;
    piste.innerHTML = D.pays.map(function (n) {
      var p = trouver(n); if (!p) return '';
      var boucan = /boucan/i.test(p.ing);
      return '<article class="recette" data-art data-incline>' +
        '<span class="nom-geant" aria-hidden="true">' + esc(geant(p.nom)) + '</span>' +
        '<div class="art">' + (boucan ? '<svg class="volute" viewBox="0 0 100 80" aria-hidden="true"><path d="M30,80C20,60 44,50 34,30S40,6 32,0"/><path d="M52,80C44,62 64,52 56,34S62,10 56,2"/><path d="M72,80C64,64 82,54 74,38"/></svg>' : '') +
        '<img alt="Illustration de la ' + esc(p.nom) + '" src="' + PL.art.dataUri(p) + '" width="300" height="300"></div>' +
        '<div class="tags">' + tags(p) + '</div>' +
        '<h3>' + esc(p.nom.replace('Pizza ', '')) + '</h3>' +
        '<p class="ing">' + esc(p.ing.charAt(0).toUpperCase() + p.ing.slice(1)) + '</p>' +
        '<div class="bas"><span class="prix">' + euro(p.prix) + '</span><button class="ajout texte" type="button" data-ajouter="' + p.id + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>Ajouter</button></div>' +
        '</article>';
    }).join('');
  }

  function rendreCats() {
    var box = $('.cats'); if (!box) return;
    box.innerHTML = D.categories.filter(function (c) { return c.id !== 'formules'; }).map(function (c, i) {
      var prix = c.items.map(function (x) { return x.prix; }).filter(function (x) { return x != null; });
      var min = Math.min.apply(null, prix);
      var w = c.photo.w, grand = w[w.length - 1];
      return '<a class="cat" href="carte.html#' + c.id + '" data-incline>' +
        '<span class="img"><img alt="' + esc(c.photo.alt) + '" src="assets/img/' + c.photo.base + '-' + w[0] + '.webp" srcset="' + w.map(function (x) { return 'assets/img/' + c.photo.base + '-' + x + '.webp ' + x + 'w'; }).join(', ') + '" sizes="(max-width: 900px) ' + (i === 0 ? '100vw' : '50vw') + ', ' + (i === 0 ? '58vw' : '40vw') + '" loading="lazy" decoding="async" width="' + grand + '" height="' + Math.round(grand * .7) + '"></span>' +
        '<span class="brule-bord" aria-hidden="true"></span>' +
        '<span class="fleche" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '<span class="txt"><h3>' + esc(c.titre) + '</h3><span class="meta"><b>dès ' + euro(min) + '</b>' + c.items.length + ' choix</span></span></a>';
    }).join('');
  }

  var FORM_PHOTOS = { Pizza: 'pizza-planche-part', Salade: 'salade-saumon-bol', 'Pâtes': 'tagliatelles-bolognaise' };
  var groupeFormule = 'Pizza';
  function rendreFormules(anim) {
    var box = $('.paliers'); if (!box) return;
    var f = D.categories.filter(function (c) { return c.id === 'formules'; })[0].items.filter(function (x) { return x.groupe === groupeFormule; });
    var avant = [];
    box.innerHTML = f.map(function (x) {
      var parts = x.desc.split(/,\s*/);
      var html = '<div class="palier" data-art><div><h3>' + esc(x.nom) + '</h3></div>' +
        '<div class="compo">' + parts.map(function (p) { var neuf = avant.length && avant.indexOf(p) < 0; return '<span class="' + (neuf ? 'plus' : '') + '">' + (neuf ? '+ ' : '') + esc(p) + '</span>'; }).join('') + '</div>' +
        '<div class="droite"><span class="prix" data-odo="' + x.prix + '">' + euro(x.prix) + '</span><button class="btn small" type="button" data-ajouter="' + x.id + '" data-detail="Choix de la pizza, du jus ou du dessert à préciser">Ajouter</button></div></div>';
      avant = parts;
      return html;
    }).join('');
    $$('.formule-photo img').forEach(function (img) { img.classList.toggle('on', img.getAttribute('data-groupe') === groupeFormule); });
    $$('.onglets [role="tab"]').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-groupe') === groupeFormule)); t.tabIndex = t.getAttribute('data-groupe') === groupeFormule ? 0 : -1; });
    $$('[data-odo]', box).forEach(function (el) { PL.odo(el, +el.getAttribute('data-odo'), false); });
    if (anim && window.gsap && !PL.calme()) {
      gsap.from($$('.palier', box), { y: 30, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' });
      $$('[data-odo]', box).forEach(PL.odoRoule);
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.onglets [role="tab"]'); if (!t) return;
    groupeFormule = t.getAttribute('data-groupe'); rendreFormules(true);
  });
  document.addEventListener('keydown', function (e) {
    var t = e.target.closest && e.target.closest('.onglets [role="tab"]'); if (!t || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    var tabs = $$('.onglets [role="tab"]'), i = tabs.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1);
    var n = tabs[(i + tabs.length) % tabs.length]; groupeFormule = n.getAttribute('data-groupe'); rendreFormules(true); n.focus();
  });

  function rendreRestos() {
    var box = $('.restos'); if (!box) return;
    box.innerHTML = D.restaurants.map(function (r) {
      var w = r.photo.w;
      return '<article class="resto" id="resto-' + r.id + '">' +
        '<div class="photo"><img alt="' + esc(r.photo.alt) + '" src="assets/img/' + r.photo.base + '-' + w[0] + '.webp" srcset="' + w.map(function (x) { return 'assets/img/' + r.photo.base + '-' + x + '.webp ' + x + 'w'; }).join(', ') + '" sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" decoding="async" width="' + w[w.length - 1] + '" height="' + Math.round(w[w.length - 1] / r.photo.ratio) + '"><span data-statut="' + r.id + '"></span></div>' +
        '<div class="corps"><h3>' + esc(PL.nomCourt(r)) + '</h3>' +
        '<div class="services">' + r.services.map(function (s) { return '<span class="tag">' + esc(D.services[s].label) + (s === 'terrasse' ? ' sans réservation' : '') + '</span>'; }).join('') + '</div>' +
        '<dl><dt>Adresse</dt><dd>' + esc(r.adresse.join(', ')) + '</dd><dt>Horaires</dt><dd>' + esc(PL.plages(r)) + '<br><span class="todo-note">jours d’ouverture</span></dd>' +
        '<dt>Téléphone</dt><dd>' + r.telephones.map(function (t) { return '<a class="lien tel" href="tel:+594' + t.replace(/\s/g, '').slice(1) + '">' + t + '</a>'; }).join('<br>') + '</dd></dl>' +
        '<div class="actions"><button class="btn small" type="button" data-commander="' + r.id + '">Commander ici</button><a class="btn small ghost" href="' + r.page + '">La pizzeria</a><a class="btn small ghost" href="' + r.maps + '" target="_blank" rel="noopener">Itinéraire</a></div>' +
        '</div></article>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest('[data-commander]'); if (!c) return;
    PL.setVille(c.getAttribute('data-commander'), true);
    var a = document.createElement('a'); a.href = 'carte.html'; document.body.appendChild(a); a.click(); a.remove();
  });

  /* Montage de l'atelier « fait maison » */
  function atelier() {
    var box = $('.atelier .montage'); if (!box) return;
    var R = PL.art.rng('atelier');
    var spirale = '', tours = 4.2, n = 220;
    for (var i = 0; i <= n; i++) { var a = i / n * tours * Math.PI * 2, r = 4 + i / n * 72; spirale += (i ? 'L' : 'M') + (100 + Math.cos(a) * r).toFixed(1) + ',' + (100 + Math.sin(a) * r).toFixed(1); }
    var farine = ''; for (var k = 0; k < 46; k++) { var b = R() * Math.PI * 2, q = 88 + R() * 26; farine += '<circle cx="' + (100 + Math.cos(b) * q).toFixed(1) + '" cy="' + (100 + Math.sin(b) * q).toFixed(1) + '" r="' + (.6 + R() * 1.6).toFixed(1) + '" fill="#F5EBDD" opacity="' + (.25 + R() * .45).toFixed(2) + '"/>'; }
    var taken = [];
    box.innerHTML = '<defs><radialGradient id="pate" cx="50%" cy="50%" r="50%"><stop offset=".8" stop-color="#F2E3C4"/><stop offset=".95" stop-color="#E6CB98"/><stop offset="1" stop-color="#D3AF72"/></radialGradient>' +
      '<radialGradient id="dore" cx="50%" cy="50%" r="50%"><stop offset=".82" stop-color="#ECC170" stop-opacity="0"/><stop offset=".93" stop-color="#D08F38"/><stop offset="1" stop-color="#93521A"/></radialGradient>' +
      '<radialGradient id="ombre" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#000" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="disque"><circle cx="100" cy="100" r="84"/></clipPath></defs>' +
      '<g class="farine">' + farine + '</g>' +
      '<g class="pate"><circle cx="100" cy="108" r="100" fill="url(#ombre)"/><circle cx="100" cy="100" r="96" fill="url(#pate)"/><circle class="doree" cx="100" cy="100" r="96" fill="url(#dore)"/></g>' +
      '<g clip-path="url(#disque)"><circle class="nappe" cx="100" cy="100" r="84" fill="#B0361E"/><path class="spirale" d="' + spirale + '" fill="none" stroke="#C2391F" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<g class="garni">' + PL.art.group('olives', 'atelier', { taken: taken, radius: 66, scale: .9 }) + PL.art.group('poivrons', 'atelier', { taken: taken, radius: 66, scale: .8 }) + PL.art.group('champignons', 'atelier', { taken: taken, radius: 66, scale: .8 }) + '</g>';
    var fro = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    fro.innerHTML = PL.art.svg({ base: 'tomate', fromage: true, garnitures: [], nom: 'atelier' }).replace(/^[\s\S]*?(<g class="fromage">[\s\S]*?<\/g>)[\s\S]*$/, '$1');
    box.insertBefore(fro.firstChild, box.querySelector('.garni'));
  }

  /* ---------- Animations ---------- */
  PL.auMontage(function (calme) {
    var gl = !calme && PL.glOk && PL.glOk();
    var intro = html.classList.contains('intro') && !calme;
    var t0 = intro ? 1.6 : .15;

    /* Ouverture */
    if (intro) {
      var ov = $('.ouverture');
      var tl = gsap.timeline({ onComplete: function () { html.classList.remove('intro'); try { sessionStorage.setItem('pl-intro', '1'); } catch (e) { } } });
      tl.fromTo('.ouverture .fente', { scale: 0 }, { scale: 1, duration: .35, ease: 'back.out(3)' })
        .to('.ouverture .fente', { width: '64vw', marginLeft: '-32vw', height: 3, marginTop: -1.5, duration: .55, ease: 'expo.inOut' })
        .to('.ouverture img', { opacity: 1, y: -18, duration: .5, ease: 'power3.out' }, '-=.25')
        .to(ov, { clipPath: 'inset(50% 0 50% 0)', duration: .6, ease: 'expo.inOut' }, '+=.15');
      PL.jeter(function () { html.classList.remove('intro'); });
    } else { html.classList.remove('intro'); }

    /* Pizza qui cuit */
    var can = $('.pizza-tourne canvas'), img = $('.pizza-tourne img.base');
    if (gl && can) {
      try {
        var c = PL.cuisson(can, 'assets/img/pizza-detouree-800.webp');
        c.pret.then(function () { html.classList.add('gl'); gsap.to(c.uniforms.uCuit, { value: 1, duration: 2.4, ease: 'power2.inOut', delay: t0 }); });
        PL.jeter(function () { c.stop(); html.classList.remove('gl'); });
      } catch (e) { gl = false; }
    }
    if (!gl && img) { img.classList.remove('cuisson-css'); void img.offsetWidth; if (!calme) img.classList.add('cuisson-css'); }

    if (!calme) {
      gsap.to('.pizza-tourne', { rotation: 360, duration: 120, repeat: -1, ease: 'none' });
      gsap.to('.anneau-texte', { rotation: -360, duration: 60, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.from('.hero-visuel', { scale: .7, opacity: 0, duration: 1.6, ease: 'expo.out', delay: t0 - .1 });
      gsap.from('.four-halo', { opacity: 0, scale: .5, duration: 2, ease: 'power2.out', delay: t0 });
      gsap.to('.hero-visuel', { yPercent: 18, scale: .88, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      var h1 = $('.hero h1');
      if (h1 && window.SplitText) {
        SplitText.create(h1, { type: 'lines, chars', mask: 'lines', autoSplit: true, onSplit: function (s) { return gsap.from(s.chars, { yPercent: 120, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: .025, delay: t0 }); } });
      }
      gsap.from('.hero .eyebrow, .hero .lead, .hero-actions > *, .hero-heure', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: t0 + .35 });
      gsap.from('.vivant > *', { y: 30, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: t0 + .6 });

      /* Braises */
      var bc = $('.hero-fond canvas'); if (bc) PL.jeter(PL.braises(bc, { n: desktop() ? 80 : 40, suivre: true }));
      var fc = $('.final-fond canvas'); if (fc) PL.jeter(PL.braises(fc, { n: desktop() ? 90 : 44, suivre: true, vitesse: 1.2 }));

      /* Bandeau défilant, accéléré par la vitesse de défilement */
      var piste = $('.defile-piste');
      if (piste) {
        var boucle = gsap.to(piste, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
        var st = ScrollTrigger.create({ trigger: '.defile', start: 'top bottom', end: 'bottom top', onUpdate: function (s) { var v = Math.min(4, 1 + Math.abs(s.getVelocity()) / 400); gsap.to(boucle, { timeScale: s.direction < 0 ? -v : v, duration: .3, overwrite: true }); gsap.to(boucle, { timeScale: s.direction < 0 ? -1 : 1, duration: 1.2, delay: .3, overwrite: false }); } });
      }
    }

    /* Fait maison : scène épinglée */
    var scene = $('.maison-scene');
    if (scene && !calme) {
      var sv = $('.atelier .montage');
      var spi = $('.spirale', sv), L = spi.getTotalLength();
      gsap.set(spi, { strokeDasharray: L, strokeDashoffset: L });
      gsap.set($('.nappe', sv), { opacity: 0 });
      gsap.set($('.pate', sv), { scale: .42, svgOrigin: '100 100' });
      gsap.set($('.doree', sv), { opacity: 0 });
      gsap.set($$('.fromage path', sv), { opacity: 0, scale: .3, transformOrigin: 'center' });
      gsap.set($$('.garni .pc', sv), { opacity: 0, y: '-=60' });
      var lis = $$('.etape-liste li');
      var etape = function (i) { lis.forEach(function (li, k) { li.classList.toggle('on', k <= i); }); };
      etape(0);
      var epingle = matchMedia('(min-width: 901px)').matches;
      var tl2 = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: epingle
          ? { trigger: scene, start: 'top top', end: '+=230%', pin: true, scrub: .8, anticipatePin: 1, onUpdate: function (s) { var p = s.progress; etape(p < .28 ? 0 : p < .52 ? 1 : p < .8 ? 2 : 3); } }
          : { trigger: '.atelier', start: 'top 85%', end: 'bottom 25%', scrub: .6, onUpdate: function (s) { var p = s.progress; etape(p < .28 ? 0 : p < .52 ? 1 : p < .8 ? 2 : 3); } }
      });
      tl2.to($('.pate', sv), { scale: 1, rotation: 25, duration: 1, ease: 'power2.out' })
        .to($$('.farine circle', sv), { opacity: 0, x: function () { return gsap.utils.random(-30, 30); }, y: function () { return gsap.utils.random(-30, 30); }, duration: .8, stagger: .005 }, '<')
        .to(spi, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' })
        .to($('.nappe', sv), { opacity: 1, duration: .3 }, '-=.2')
        .to($$('.fromage path', sv), { opacity: .8, scale: 1, duration: .8, stagger: { each: .012, from: 'random' }, ease: 'back.out(2)' })
        .to($$('.garni .pc', sv), { opacity: 1, y: '+=60', duration: .7, stagger: { each: .02, from: 'random' }, ease: 'bounce.out' }, '-=.2')
        .to($('.doree', sv), { opacity: 1, duration: .6 })
        .to('.atelier .photo-finale', { opacity: 1, duration: .7 }, '+=.1')
        .fromTo('.atelier .video-carte', { opacity: 0, y: 60, rotate: 6 }, { opacity: 1, y: 0, rotate: -3, duration: .6, ease: 'power3.out' }, '-=.3');
    }
    var vid = $('.atelier video');
    if (vid) {
      if (calme) { vid.pause(); vid.removeAttribute('autoplay'); }
      else {
        var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () { }); } else vid.pause(); }, { threshold: .2 });
        io.observe(vid); PL.jeter(function () { io.disconnect(); });
      }
    }

    /* Le goût du pays : galerie horizontale + fumée */
    var fumee = $('.fumee-fond canvas');
    if (fumee && gl) { try { var fm = PL.fumee(fumee); html.classList.add('gl-fumee'); PL.jeter(function () { fm.stop(); html.classList.remove('gl-fumee'); }); } catch (e) { } }
    var pays = $('.pays-scene'), piste2 = $('.piste');
    if (pays && piste2 && !calme) {
      var mm = gsap.matchMedia();
      mm.add('(min-width: 761px)', function () {
        var dist = function () { return Math.max(0, piste2.scrollWidth - $('.piste-wrap').clientWidth); };
        var tw = gsap.to(piste2, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: pays, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$('.recette', piste2).forEach(function (card, i) {
          gsap.fromTo($('.art img', card), { rotation: -40 - i * 8 }, { rotation: 80, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
          gsap.fromTo($('.nom-geant', card), { xPercent: 10 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        });
      });
      mm.add('(max-width: 760px)', function () {
        gsap.from($$('.recette .art img', piste2), { rotation: -90, scale: .8, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: piste2, start: 'top 85%', once: true } });
      });
      PL.jeter(function () { mm.revert(); });
    }

    /* Carte : révélation par le bord qui brûle */
    if (!calme) {
      $$('.cat').forEach(function (cat, i) {
        var im = $('.img', cat), bord = $('.brule-bord', cat);
        var bx = gsap.utils.random(10, 90) + '%', by = gsap.utils.random(60, 100) + '%';
        im.classList.add('brule');
        gsap.set([im, bord], { '--bx': bx, '--by': by, '--b': '0%' });
        gsap.to([im, bord], { '--b': '150%', duration: 1.8, ease: 'power2.inOut', delay: (i % 3) * .12, scrollTrigger: { trigger: cat, start: 'top 88%', once: true } });
        gsap.from($('.txt', cat), { y: 30, opacity: 0, duration: .9, ease: 'power3.out', delay: .5 + (i % 3) * .12, scrollTrigger: { trigger: cat, start: 'top 88%', once: true } });
      });
      PL.jeter(function () { $$('.cat .img').forEach(function (im) { im.classList.remove('brule'); }); });
    }

    /* Formules : odomètres au passage */
    if (!calme) {
      ScrollTrigger.create({ trigger: '.formules', start: 'top 70%', once: true, onEnter: function () { $$('.paliers [data-odo]').forEach(PL.odoRoule); } });
      gsap.from('.formule-photo', { clipPath: 'inset(18% 18% 18% 18% round 26px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.formule-photo', start: 'top 80%', once: true } });
    }

    /* RN1 */
    var route = $('.rn1 .route');
    if (route) {
      var Lr = route.getTotalLength(), sv2 = route.ownerSVGElement, braise = $('.braise-route');
      var points = $$('.ville-pt');
      var frac = { 'saint-laurent': 0, 'kourou': .76, 'cayenne': 1 };
      var allume = function (p) { points.forEach(function (pt) { pt.classList.toggle('allume', p >= frac[pt.getAttribute('data-ville-allumee')] - .01); }); };
      if (calme) { allume(1); }
      else {
        gsap.set(route, { strokeDasharray: Lr, strokeDashoffset: Lr });
        var place = function (p) {
          var pt = route.getPointAtLength(Lr * p), vb = sv2.viewBox.baseVal, r = sv2.getBoundingClientRect(), box = $('.rn1-carte').getBoundingClientRect();
          gsap.set(braise, { x: (pt.x / vb.width) * r.width + (r.left - box.left), y: (pt.y / vb.height) * r.height + (r.top - box.top), opacity: p > 0 && p < 1 ? 1 : 0 });
        };
        gsap.to(route, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.rn1', start: 'top 75%', end: 'bottom 45%', scrub: .6, onUpdate: function (s) { place(s.progress); allume(s.progress); } } });
        gsap.from('.bourg', { opacity: 0, duration: .8, stagger: .15, scrollTrigger: { trigger: '.rn1', start: 'top 70%', once: true } });
      }
      $$('.resto .photo img').forEach(function (im) { if (!calme) gsap.fromTo(im, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: im.closest('.resto'), start: 'top bottom', end: 'bottom top', scrub: true } }); });
    }

    /* Final */
    if (!calme) {
      gsap.fromTo('.final-fond img', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });

  /* ---------- Démarrage ---------- */
  rendrePays(); rendreCats(); rendreFormules(false); PL.rn1($('.rn1-carte')); rendreRestos(); atelier();
  var comp = $('#composeur'); if (comp) PL.composeur(comp);
})();
