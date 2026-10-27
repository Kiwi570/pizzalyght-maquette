/* Pizza Lyght — socle commun : heure de Guyane, statut des restaurants, ville choisie, panier simulé,
   fenêtres, transitions, curseur, braises, mode calme, et montage des animations par page. */
(function () {
  var PL = window.PL = window.PL || {};
  var D = PL.data;
  var doc = document, html = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  PL.$ = $; PL.$$ = $$;

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  PL.store = store;

  var NBSP = ' ';
  function euro(c) { return (c / 100).toFixed(2).replace('.', ',') + NBSP + '€'; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  PL.euro = euro; PL.esc = esc;

  /* ---------- Heure de Guyane (UTC−3, sans heure d'été) ---------- */
  function maintenant() {
    var t = new Date(Date.now() - 3 * 3600 * 1000);
    var h = t.getUTCHours(), m = t.getUTCMinutes();
    return { h: h, m: m, min: h * 60 + m, txt: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m };
  }
  function hh(min) { var h = Math.floor(min / 60) % 24, m = min % 60; return h + 'h' + (m ? (m < 10 ? '0' : '') + m : ''); }
  function plages(r) { return r.creneaux.map(function (c) { return hh(c[0]) + '–' + hh(c[1]); }).join(' · '); }
  function statut(r, now) {
    now = now || maintenant();
    var t = now.min, i, c;
    for (i = 0; i < r.creneaux.length; i++) {
      c = r.creneaux[i];
      if (t >= c[0] && t < c[1]) {
        var reste = c[1] - t;
        return reste <= 30
          ? { ouvert: true, cls: 'ouvert bientot', txt: 'Ferme bientôt · ' + hh(c[1]), court: 'Ferme à ' + hh(c[1]) }
          : { ouvert: true, cls: 'ouvert', txt: 'Ouvert · jusqu’à ' + hh(c[1]), court: 'Ouvert' };
      }
    }
    for (i = 0; i < r.creneaux.length; i++) {
      c = r.creneaux[i];
      if (t < c[0]) return { ouvert: false, cls: 'ferme', txt: 'Fermé · ouvre à ' + hh(c[0]), court: 'Ouvre à ' + hh(c[0]) };
    }
    return { ouvert: false, cls: 'ferme', txt: 'Fermé · ouvre demain à ' + hh(r.creneaux[0][0]), court: 'Ouvre demain' };
  }
  function resto(id) { for (var i = 0; i < D.restaurants.length; i++) if (D.restaurants[i].id === id) return D.restaurants[i]; return null; }
  function nomCourt(r) { return r.villeCourte || r.ville; }
  PL.maintenant = maintenant; PL.hh = hh; PL.plages = plages; PL.statut = statut; PL.resto = resto; PL.nomCourt = nomCourt;

  function majStatuts() {
    var now = maintenant();
    $$('[data-statut]').forEach(function (el) {
      var r = resto(el.getAttribute('data-statut')); if (!r) return;
      var s = statut(r, now);
      el.className = el.className.replace(/\b(ouvert|ferme|bientot)\b/g, '').trim() + ' ' + s.cls;
      if (!el.classList.contains('statut')) el.classList.add('statut');
      var court = el.hasAttribute('data-court');
      el.innerHTML = '<span class="pt" aria-hidden="true"></span><span class="statut-txt">' + esc(court ? s.court : s.txt) + '</span>';
    });
    $$('[data-horloge]').forEach(function (el) { el.textContent = now.txt; });
    $$('[data-ville-allumee]').forEach(function (el) {
      var r = resto(el.getAttribute('data-ville-allumee'));
      if (r) el.classList.toggle('ferme', !statut(r, now).ouvert);
    });
    majVillePilule();
    doc.dispatchEvent(new CustomEvent('pl:minute', { detail: now }));
  }

  /* ---------- Ville choisie ---------- */
  PL.ville = null; /* lu avec le panier, plus bas (chargerPanier) */
  function setVille(id, silencieux) {
    if (!resto(id)) return;
    relire();
    PL.ville = id; store.set('pl-ville', id);
    $$('[data-choisir-ville]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-choisir-ville') === id)); });
    panier.ville = id;
    var r = resto(id);
    if (panier.mode === 'sur-place' && r.services.indexOf('sur-place') < 0) panier.mode = 'emporter';
    sauverPanier();
    majVillePilule();
    rendrePanier();
    doc.dispatchEvent(new CustomEvent('pl:ville', { detail: id }));
    if (!silencieux) message('Pizzeria choisie : ' + nomCourt(r));
  }
  PL.setVille = setVille;
  function majVillePilule() {
    $$('.ville-btn').forEach(function (b) {
      var r = PL.ville && resto(PL.ville);
      var suite = '<span class="sr-only"> : nos pizzerias, horaires et téléphones</span>';
      if (!r) { b.innerHTML = '<span class="statut"><span class="pt" aria-hidden="true"></span><span>Nos pizzerias</span></span><span class="sr-only"> : horaires et téléphones</span>'; return; }
      var s = statut(r);
      b.innerHTML = '<span class="statut ' + s.cls + '"><span class="pt" aria-hidden="true"></span><span>' + esc(nomCourt(r)) + '</span><span class="statut-txt muted"> · ' + esc(s.court) + '</span></span>' + suite;
    });
  }

  /* ---------- Messages ---------- */
  var enAttente = null;
  function message(txt) {
    if (ouverte) { enAttente = txt; return; } /* pas de message par-dessus une fenêtre ouverte : affiché à sa fermeture */
    var box = $('.messages'); if (!box) return;
    var m = doc.createElement('div'); m.className = 'message'; m.setAttribute('role', 'status'); m.textContent = txt;
    box.appendChild(m);
    if (window.gsap && !calme()) gsap.from(m, { y: 20, opacity: 0, duration: .4, ease: 'power3.out' });
    setTimeout(function () {
      if (window.gsap && !calme()) gsap.to(m, { y: 10, opacity: 0, duration: .3, onComplete: function () { m.remove(); } }); else m.remove();
    }, 2600);
  }
  PL.message = message;

  /* ---------- Fenêtres (tiroir, feuilles) ---------- */
  var ouverte = null, retourFocus = null;
  function ouvrir(el) {
    if (!el) return;
    if (ouverte && ouverte !== el) fermer(true);
    retourFocus = doc.activeElement;
    ouverte = el;
    $('.voile').classList.add('on');
    el.classList.add('on'); el.removeAttribute('inert'); el.setAttribute('aria-hidden', 'false');
    html.classList.add('fenetre-ouverte');
    if (PL.lenis) PL.lenis.stop();
    html.style.overflow = 'hidden';
    setTimeout(function () { var f = $('[data-focus-premier]', el) || $('button, a, input, select', el); if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function fermer(sansFocus) {
    if (!ouverte) return;
    ouverte.classList.remove('on'); ouverte.setAttribute('aria-hidden', 'true'); ouverte.setAttribute('inert', '');
    $('.voile').classList.remove('on');
    html.classList.remove('fenetre-ouverte');
    ouverte = null;
    html.style.overflow = '';
    if (PL.lenis) PL.lenis.start();
    if (!sansFocus && retourFocus && retourFocus.focus && retourFocus.isConnected) retourFocus.focus({ preventScroll: true });
    if (enAttente) { var m = enAttente; enAttente = null; setTimeout(function () { message(m); }, 200); }
  }
  PL.ouvrir = ouvrir; PL.fermer = fermer;
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ouverte) { fermer(); }
    if (e.key === 'Tab' && ouverte) {
      var f = $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]', ouverte).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Feuille « Nos pizzerias » (appeler, choisir) ---------- */
  function rendreAppel(prefere) {
    var ul = $('#appel .appel-liste'); if (!ul) return;
    var now = maintenant(), tete = prefere || PL.ville;
    var liste = D.restaurants.slice().sort(function (a, b) { return (b.id === tete) - (a.id === tete); });
    ul.innerHTML = liste.map(function (r) {
      var s = statut(r, now);
      return '<li class="' + (tete === r.id ? 'choisie' : '') + '">' +
        '<div class="tete-appel"><a class="v lien" href="' + r.page + '">' + esc(nomCourt(r)) + '</a><span class="statut ' + s.cls + '"><span class="pt" aria-hidden="true"></span>' + esc(s.txt) + '</span></div>' +
        '<div class="small muted">' + esc(r.adresse.join(', ')) + ' · ' + esc(plages(r)) + '</div>' +
        '<div class="nums">' + r.telephones.map(function (t) { return '<a href="tel:+594' + t.replace(/\s/g, '').slice(1) + '" aria-label="Appeler ' + esc(nomCourt(r)) + ' au ' + t + '"><span class="tel">' + t + '</span></a>'; }).join('') + '</div>' +
        '<div class="actions-appel"><button class="btn small ghost" type="button" data-choisir-ville="' + r.id + '" aria-pressed="' + (PL.ville === r.id) + '">' + (PL.ville === r.id ? 'Pizzeria choisie' : 'Choisir') + '</button>' +
        '<a class="btn small ghost" href="' + r.maps + '" target="_blank" rel="noopener">Itinéraire</a>' +
        '<button class="copier" type="button" data-copier="' + r.telephones[0] + '">Copier le numéro</button></div>' +
        '</li>';
    }).join('');
  }
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-appel]');
    if (t) { e.preventDefault(); rendreAppel(t.getAttribute('data-appel')); ouvrir($('#appel')); return; }
    var c = e.target.closest('[data-copier]');
    if (c) {
      var v = c.getAttribute('data-copier');
      var ok = function () { message('Numéro copié : ' + v); };
      try { navigator.clipboard.writeText(v).then(ok, function () { selection(c); }); } catch (err) { selection(c); }
      return;
    }
    var vb = e.target.closest('[data-choisir-ville]');
    if (vb) { setVille(vb.getAttribute('data-choisir-ville')); if (vb.closest('#appel')) { rendreAppel(vb.getAttribute('data-choisir-ville')); var nb = $('#appel [data-choisir-ville="' + vb.getAttribute('data-choisir-ville') + '"]'); if (nb) nb.focus(); } return; }
    var p = e.target.closest('[data-panier]');
    if (p) { e.preventDefault(); etape = 'panier'; rendrePanier(); ouvrir($('#panier')); return; }
    if (e.target.closest('[data-fermer]') || e.target.classList.contains('voile')) { fermer(); }
  });
  function selection(el) {
    var li = el.closest('li'); var t = li && $('.tel', li); if (!t) return;
    var r = doc.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
    message('Numéro sélectionné, copiez-le avec votre clavier');
  }

  /* ---------- Panier simulé ---------- */
  var MODES = { emporter: 'À emporter', livraison: 'Livraison', 'sur-place': 'Sur place' };
  function trouverItem(id) {
    for (var i = 0; i < D.categories.length; i++) for (var j = 0; j < D.categories[i].items.length; j++) if (D.categories[i].items[j].id === id) return D.categories[i].items[j];
    return null;
  }
  PL.trouverItem = trouverItem;
  function cleDe(id, detail) { return id + (detail ? '|' + detail : ''); }
  /* Le panier stocké peut être ancien, modifié dans un autre onglet ou abîmé : on le revalide toujours
     contre la carte (prix et noms repris de data.js, quantités entières entre 1 et 99, mode compatible). */
  function nettoyer(p) {
    var propre = { lignes: [], mode: 'emporter', ville: null }, vu = {};
    if (!p || typeof p !== 'object') return propre;
    if (typeof p.ville === 'string' && resto(p.ville)) propre.ville = p.ville;
    if (typeof p.mode === 'string' && MODES[p.mode]) propre.mode = p.mode;
    (Array.isArray(p.lignes) ? p.lignes : []).forEach(function (l) {
      if (!l || typeof l !== 'object') return;
      var it = trouverItem(l.id); if (!it || it.prix == null) return;
      var q = Math.floor(Number(l.qte)); if (!(q >= 1)) return;
      var detail = typeof l.detail === 'string' ? l.detail.slice(0, 300) : '';
      var cle = cleDe(it.id, detail);
      if (vu[cle]) { vu[cle].qte = Math.min(99, vu[cle].qte + q); return; }
      vu[cle] = { cle: cle, id: it.id, nom: it.nom, prix: it.prix, qte: Math.min(99, q), detail: detail, pizza: !!(it.ing && it.cat === 'pizzas'), alcool: !!it.alcool, cat: it.cat };
      propre.lignes.push(vu[cle]);
    });
    var r = propre.ville && resto(propre.ville);
    if (r && r.services.indexOf(propre.mode) < 0) propre.mode = 'emporter';
    return propre;
  }
  var panier, etape = 'panier', recap = null;
  function chargerPanier() {
    var v = store.get('pl-ville', null); PL.ville = typeof v === 'string' && resto(v) ? v : null;
    panier = nettoyer(store.get('pl-panier', null));
    if (!panier.ville && PL.ville) panier.ville = PL.ville;
  }
  chargerPanier();
  function sauverPanier() { panier = nettoyer(panier); store.set('pl-panier', panier); }
  /* Un autre onglet ou un retour arrière a pu changer le panier : on le relit avant chaque modification
     (seulement si le stockage du navigateur fonctionne, sinon on garde le panier en mémoire). */
  var stockageOk = (function () { try { localStorage.setItem('pl-test', '1'); localStorage.removeItem('pl-test'); return true; } catch (e) { return false; } })();
  function relire() { if (stockageOk) chargerPanier(); }
  function resynchroniser() {
    chargerPanier();
    $$('[data-choisir-ville]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-choisir-ville') === PL.ville)); });
    majVillePilule(); rendrePanier();
  }
  window.addEventListener('storage', function (e) { if (!e.key || e.key === 'pl-panier' || e.key === 'pl-ville') resynchroniser(); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) resynchroniser(); });

  function nbArticles() { return panier.lignes.reduce(function (n, l) { return n + l.qte; }, 0); }
  function sousTotal() { return panier.lignes.reduce(function (n, l) { return n + l.prix * l.qte; }, 0); }
  function visuelPizza(id) { return 'assets/img/pizzas/' + id + '.webp'; }
  PL.visuelPizza = visuelPizza;
  function ajouter(id, opts) {
    opts = opts || {};
    var it = trouverItem(id); if (!it) return;
    if (it.prix == null) { message(it.nom + ' : prix à compléter'); return; }
    relire();
    var detail = opts.detail || '', cle = cleDe(id, detail), l = null;
    for (var i = 0; i < panier.lignes.length; i++) if (panier.lignes[i].cle === cle) l = panier.lignes[i];
    if (l) l.qte = Math.min(99, l.qte + 1);
    else panier.lignes.push({ cle: cle, id: id, nom: it.nom, prix: it.prix, qte: 1, detail: detail });
    sauverPanier();
    if (etape === 'fini') { etape = 'panier'; recap = null; }
    var src = opts.from;
    var fini = function () { majCompteur(true); rendrePanier(); };
    if (src && !calme() && window.gsap) voler(src, opts.visuel, fini); else fini();
    message('Ajouté au panier : ' + it.nom);
  }
  PL.ajouter = ajouter;
  function majCompteur(bump) {
    var n = nbArticles(), tot = n ? euro(sousTotal()) : '';
    $$('.panier-btn .nb, .dock .nb, .panier-flottant .nb').forEach(function (el) { el.textContent = n; el.setAttribute('data-n', n); });
    $$('.panier-btn').forEach(function (b) { b.setAttribute('aria-label', n ? 'Panier : ' + n + ' article' + (n > 1 ? 's' : '') + ', ' + tot : 'Panier vide'); });
    $$('.dock .panier-dock').forEach(function (b) { b.classList.toggle('est-vide', n === 0); var t = $('.tot', b); if (t) t.textContent = tot; b.setAttribute('aria-label', n ? 'Panier : ' + n + ' article' + (n > 1 ? 's' : '') + ', ' + tot : 'Panier vide'); });
    var fl = $('.panier-flottant');
    if (fl) { var avant = fl.hidden; fl.hidden = n === 0; $('.tot', fl).textContent = tot; $('.lib', fl).textContent = n > 1 ? 'articles' : 'article'; if (avant && !fl.hidden && window.gsap && !calme()) gsap.from(fl, { y: 40, opacity: 0, duration: .5, ease: 'back.out(1.6)' }); }
    if (bump && window.gsap && !calme()) $$('.panier-btn, .dock .panier-dock').forEach(function (b) { gsap.fromTo(b, { scale: 1 }, { scale: 1.14, duration: .16, yoyo: true, repeat: 1, ease: 'power2.out' }); });
  }
  function cibleVisible() {
    var c = $$('.panier-btn, .dock .panier-dock').filter(function (b) { return b.offsetParent !== null && b.getBoundingClientRect().width > 0; });
    return c[0];
  }
  function voler(src, visuel, fini) {
    var cible = cibleVisible(); if (!cible) { fini(); return; }
    var nav = $('.nav'), decale = 0;
    if (nav && nav.classList.contains('cache') && nav.contains(cible)) { decale = nav.offsetHeight * 1.1; nav.classList.remove('cache'); html.classList.remove('nav-cachee'); }
    var a = src.getBoundingClientRect(), b = cible.getBoundingClientRect();
    b = { left: b.left, top: b.top + decale, width: b.width, height: b.height };
    var v = doc.createElement('div'); v.className = 'vol';
    v.innerHTML = visuel ? '<img alt="" src="' + visuel + '">' : '<span style="display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#FFB27A,#FF5B1F 45%,transparent 70%)"></span>';
    doc.body.appendChild(v);
    var x0 = a.left + a.width / 2 - 32, y0 = a.top + a.height / 2 - 32, x1 = b.left + b.width / 2 - 32, y1 = b.top + b.height / 2 - 32;
    var hauteur = Math.min(y0, y1) - 140;
    gsap.set(v, { x: x0, y: y0, scale: Math.min(2.2, a.width / 64) });
    var tl = gsap.timeline({ onComplete: function () { v.remove(); fini(); } });
    tl.to(v, { x: x1, duration: .9, ease: 'power1.inOut' }, 0)
      .to(v, { y: hauteur, duration: .4, ease: 'power2.out' }, 0)
      .to(v, { y: y1, duration: .5, ease: 'power2.in' }, .4)
      .to(v, { rotation: 540, scale: .35, duration: .9, ease: 'power1.in' }, 0);
  }

  function lignePanierHTML(l) {
    var vis = l.pizza ? '<img alt="" src="' + visuelPizza(l.id) + '" width="52" height="52">' : '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="none" stroke="#FF8A4C" stroke-width="1.6"/></svg>';
    return '<li class="ligne"><span class="vign">' + vis + '</span><div><div class="nom">' + esc(l.nom) + '</div>' +
      (l.detail ? '<div class="det">' + esc(l.detail) + '</div>' : '') + '</div>' +
      '<div class="droite"><span class="prix">' + euro(l.prix * l.qte) + '</span><span class="qte"><button type="button" data-moins="' + esc(l.cle) + '" aria-label="Retirer un : ' + esc(l.nom) + '">−</button><output aria-label="Quantité">' + l.qte + '</output><button type="button" data-plus="' + esc(l.cle) + '" aria-label="Ajouter un : ' + esc(l.nom) + '"' + (l.qte >= 99 ? ' disabled' : '') + '>+</button></span></div></li>';
  }
  function heure(min) { var h = Math.floor(min / 60), m = min % 60; return h + 'h' + (m < 10 ? '0' : '') + m; }
  /* Tous les créneaux de 15 min encore possibles aujourd'hui (préparation 30 min), sinon ceux de demain. */
  function creneauxPossibles(r) {
    var now = maintenant(), depart = now.min + 30, groupes = [];
    var nomService = function (c) { return r.creneaux.length > 1 ? (c[0] < 15 * 60 ? ' midi' : ' soir') : ''; };
    r.creneaux.forEach(function (c) {
      var o = []; for (var m = Math.ceil(Math.max(c[0], depart) / 15) * 15; m <= c[1] - 15; m += 15) o.push({ v: 'j-' + m, t: heure(m) });
      if (o.length) groupes.push({ label: 'Aujourd’hui' + nomService(c), opts: o });
    });
    var demain = !groupes.length;
    if (demain) r.creneaux.forEach(function (c) { var o = []; for (var m = c[0]; m <= c[1] - 15; m += 15) o.push({ v: 'd-' + m, t: heure(m) }); groupes.push({ label: 'Demain' + nomService(c), opts: o }); });
    return { groupes: groupes, demain: demain, asap: !demain && statut(r, now).ouvert };
  }
  function regleAlcool() {
    var alcool = panier.lignes.some(function (l) { return l.alcool; });
    var plat = panier.lignes.some(function (l) { return l.cat !== 'boissons'; });
    return { alcool: alcool, bloque: alcool && !plat };
  }
  /* Après un nouveau rendu, le focus revient sur le même contrôle (ou sur le titre si l'étape change). */
  function cleFocus() {
    var a = doc.activeElement; if (!a || !a.closest || !a.closest('#panier')) return null;
    var attrs = ['data-plus', 'data-moins', 'data-panier-ville', 'data-mode', 'data-continuer', 'data-retour'];
    for (var i = 0; i < attrs.length; i++) if (a.hasAttribute(attrs[i])) return '[' + attrs[i] + '="' + (a.getAttribute(attrs[i]) || '').replace(/"/g, '\\"') + '"]';
    return null;
  }
  function rendrePanier(opts) {
    opts = opts || {};
    var sel = opts.titre ? null : cleFocus();
    rendrePanierContenu();
    var tir = $('#panier'); if (!tir || !tir.classList.contains('on')) return;
    if (opts.titre) { var h = $('.tiroir-tete h2', tir); if (h) h.focus({ preventScroll: true }); return; }
    if (sel) { var el = $(sel, tir); if (!el || el.disabled) el = $('.tiroir-corps button:not([disabled]), .tiroir-pied button:not([disabled])', tir) || $('.tiroir-tete h2', tir); if (el) el.focus({ preventScroll: true }); }
  }
  function rendrePanierContenu() {
    majCompteur(false);
    var corps = $('#panier .tiroir-corps'), pied = $('#panier .tiroir-pied'); if (!corps) return;
    var r = panier.ville && resto(panier.ville);
    var titre = $('#panier .tiroir-tete h2');
    if (etape === 'fini' && recap) {
      titre.textContent = 'Commande simulée';
      corps.innerHTML = '<div class="avis">Ceci est une maquette : rien n’a été envoyé à la pizzeria et aucun paiement n’a été débité.</div>' +
        '<div><div class="bloc-titre">Récapitulatif</div><ul class="lignes">' + recap.lignes.map(function (l) { return '<li class="ligne" style="grid-template-columns:minmax(0,1fr) auto"><div><div class="nom">' + l.qte + ' × ' + esc(l.nom) + '</div>' + (l.detail ? '<div class="det">' + esc(l.detail) + '</div>' : '') + '</div><span class="prix">' + euro(l.prix * l.qte) + '</span></li>'; }).join('') + '</ul></div>' +
        '<p>' + esc(recap.ville) + ' · ' + esc(recap.mode) + ' · ' + esc(recap.creneau) + ' · ' + euro(recap.total) + '</p>' +
        '<div class="avis">Pour commander vraiment : <a class="lien" href="' + D.commandeReelle + '" target="_blank" rel="noopener">pizzalyght.fr, commande en ligne</a>, ou par téléphone au <span class="tel">' + esc(recap.tel) + '</span>.</div>';
      pied.innerHTML = '<button class="btn" type="button" data-nouvelle>Fermer</button>';
      return;
    }
    var al = regleAlcool();
    if (etape === 'paiement' && (!r || !panier.lignes.length || al.bloque)) etape = 'panier';
    if (etape === 'paiement') {
      titre.textContent = 'Paiement';
      var cr = creneauxPossibles(r), sp = panier.mode === 'sur-place';
      var lib = panier.mode === 'livraison' ? 'Heure de livraison souhaitée' : sp ? 'Heure d’arrivée souhaitée' : 'Heure de retrait souhaitée';
      corps.innerHTML = '<form id="form-paiement" novalidate>' +
        '<div class="avis" style="margin-bottom:16px">Paiement simulé : aucune donnée n’est envoyée.</div>' +
        '<div style="display:grid;gap:14px">' +
        (cr.demain ? '<div class="avis alerte">Plus de créneau aujourd’hui à ' + esc(nomCourt(r)) + ' : votre commande sera préparée demain. <span class="todo-note">jours d’ouverture</span></div>' : '') +
        '<div class="champ"><label for="f-creneau">' + lib + '</label><select id="f-creneau" name="creneau">' + (cr.asap ? '<option value="asap">Dès que possible (environ 30 min)</option>' : '') +
        cr.groupes.map(function (g) { return '<optgroup label="' + esc(g.label) + '">' + g.opts.map(function (o) { return '<option value="' + o.v + '">' + o.t + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></div>' +
        '<div class="champ"><label for="f-nom">Nom et prénom</label><input id="f-nom" name="nom" autocomplete="name" required aria-describedby="err-nom"><span class="err" id="err-nom" data-err="nom"></span></div>' +
        '<div class="champ"><label for="f-tel">Téléphone portable</label><input id="f-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required placeholder="06 94 12 34 56" aria-describedby="err-tel"><span class="err" id="err-tel" data-err="tel"></span></div>' +
        (panier.mode === 'livraison' ? '<div class="champ"><label for="f-adr">Adresse de livraison</label><textarea id="f-adr" name="adr" rows="2" autocomplete="street-address" required placeholder="Numéro, rue, bâtiment, étage" aria-describedby="err-adr note-adr"></textarea><span class="err" id="err-adr" data-err="adr"></span><span class="todo-note" id="note-adr">zone et frais de livraison</span></div>' : '') +
        '<fieldset style="border:0;padding:0;margin:0;display:grid;gap:8px"><legend class="bloc-titre">Moyen de paiement</legend>' +
        '<label class="radio-carte"><input type="radio" name="pay" value="en-ligne" checked><span><b>Carte bancaire en ligne</b><span>Paiement sécurisé par SumUp, comme sur le site actuel</span><span class="logos-pay"><img src="assets/img/paiement-visa-mastercard-cb-300.webp" alt="Visa, Mastercard, CB" width="105" height="22"><img src="assets/img/paiement-amex-96.webp" alt="American Express" width="22" height="22"></span></span></label>' +
        '<label class="radio-carte"><input type="radio" name="pay" value="sur-place"><span><b>' + (panier.mode === 'livraison' ? 'À la livraison' : sp ? 'Au restaurant' : 'Au retrait') + '</b><span>Carte bancaire, espèces ou titres-restaurant</span></span></label>' +
        '</fieldset></div></form>';
      pied.innerHTML = '<div class="totaux"><span>Total</span><span class="total prix">' + euro(sousTotal()) + (panier.mode === 'livraison' ? ' <small class="muted" style="font-size:.8rem">+ livraison</small>' : '') + '</span></div>' +
        '<button class="btn" type="submit" form="form-paiement">Valider la commande (simulation)</button><button class="btn ghost small" type="button" data-retour>Retour au panier</button>';
      return;
    }
    etape = 'panier';
    titre.textContent = 'Votre commande';
    if (!panier.lignes.length) {
      corps.innerHTML = '<div class="vide"><svg viewBox="0 0 120 80" aria-hidden="true"><ellipse cx="60" cy="62" rx="50" ry="10" fill="#2A221C"/><path d="M14,58A46,46 0 0 1 106,58Z" fill="none" stroke="#FF8A4C" stroke-width="2" stroke-dasharray="4 6"/></svg><p>Votre panier est vide.</p><a class="btn small" href="carte.html">Voir la carte</a></div>';
      pied.innerHTML = '';
      return;
    }
    var now = maintenant();
    var villes = '<div><div class="bloc-titre" id="lbl-pizzeria">Pizzeria</div><div class="choix-ligne" role="group" aria-labelledby="lbl-pizzeria">' + D.restaurants.map(function (x) { var s = statut(x, now); return '<button type="button" data-panier-ville="' + x.id + '" aria-pressed="' + (panier.ville === x.id) + '"><span class="statut ' + s.cls + '"><span class="pt" aria-hidden="true"></span></span>' + esc(nomCourt(x)) + '<span class="sr-only"> (' + esc(s.court.toLowerCase()) + ')</span></button>'; }).join('') + '</div>' +
      (r ? '<p class="small muted" style="margin-top:6px">' + esc(statut(r, now).txt) + ' · ' + esc(plages(r)) + '</p>' : '<p class="small" style="margin-top:6px;color:var(--ocre)">Choisissez la pizzeria qui prépare votre commande.</p>') + '</div>';
    var modeHtml = '<div><div class="bloc-titre" id="lbl-mode">Mode</div><div class="choix-ligne" role="group" aria-labelledby="lbl-mode">' + Object.keys(MODES).map(function (m) {
      var dispo = !r || r.services.indexOf(m) >= 0;
      return '<button type="button" data-mode="' + m + '" aria-pressed="' + (dispo && panier.mode === m) + '"' + (dispo ? '' : ' disabled title="Non proposé dans cette pizzeria"') + '>' + MODES[m] + (dispo ? '' : '<span class="sr-only"> (non proposé ici)</span>') + '</button>';
    }).join('') + '</div></div>';
    corps.innerHTML = villes + modeHtml + '<div><div class="bloc-titre">Articles</div><ul class="lignes">' + panier.lignes.map(lignePanierHTML).join('') + '</ul></div>' +
      (al.alcool ? '<div class="avis' + (al.bloque ? ' alerte' : '') + '" role="' + (al.bloque ? 'alert' : 'note') + '">' + (al.bloque ? 'L’alcool n’est vendu qu’avec une pizza ou un autre plat : ajoutez un plat pour continuer. ' : '') + 'Vente d’alcool interdite aux mineurs : une pièce d’identité peut être demandée. L’abus d’alcool est dangereux pour la santé, à consommer avec modération.</div>' : '') +
      '<div class="avis">Prix TTC de la carte de Cayenne ; ils peuvent varier selon la pizzeria. <b>Allergènes et origine des viandes : à compléter</b> (information obligatoire avant la commande).</div>';
    var ok = r && !al.bloque;
    pied.innerHTML = '<div class="totaux"><span>Sous-total</span><span class="prix">' + euro(sousTotal()) + '</span>' +
      (panier.mode === 'livraison' ? '<span>Livraison</span><span class="todo-note" style="font-size:.85rem">frais</span>' : '') +
      '<span>Total</span><span class="total prix">' + euro(sousTotal()) + '</span></div>' +
      '<button class="btn" type="button" data-continuer' + (ok ? '' : ' disabled') + '>Continuer vers le paiement</button>';
  }
  PL.rendrePanier = rendrePanier;
  doc.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-plus]'))) { relire(); var l = panier.lignes.filter(function (x) { return x.cle === t.getAttribute('data-plus'); })[0]; if (l) { l.qte = Math.min(99, l.qte + 1); sauverPanier(); } rendrePanier(); return; }
    if ((t = e.target.closest('[data-moins]'))) { relire(); var cle = t.getAttribute('data-moins'); panier.lignes = panier.lignes.filter(function (x) { if (x.cle === cle) x.qte--; return x.qte > 0; }); sauverPanier(); rendrePanier(); return; }
    if ((t = e.target.closest('[data-panier-ville]'))) { setVille(t.getAttribute('data-panier-ville'), true); return; }
    if ((t = e.target.closest('[data-mode]'))) { relire(); panier.mode = t.getAttribute('data-mode'); sauverPanier(); rendrePanier(); return; }
    if (e.target.closest('[data-continuer]')) { relire(); etape = 'paiement'; rendrePanier({ titre: true }); return; }
    if (e.target.closest('[data-retour]')) { etape = 'panier'; rendrePanier({ titre: true }); return; }
    if (e.target.closest('[data-nouvelle]')) { etape = 'panier'; recap = null; rendrePanier(); fermer(); return; }
    if ((t = e.target.closest('[data-formule]'))) { e.preventDefault(); choisirFormule(t.getAttribute('data-formule'), t); return; }
    if ((t = e.target.closest('[data-commander]'))) { e.preventDefault(); setVille(t.getAttribute('data-commander'), true); aller('carte.html'); return; }
    if ((t = e.target.closest('[data-ajouter]'))) {
      e.preventDefault();
      var art = t.closest('[data-art]') ? t.closest('[data-art]').querySelector('.art img') : null;
      ajouter(t.getAttribute('data-ajouter'), { from: art || t, visuel: art ? art.getAttribute('src') : null, detail: t.getAttribute('data-detail') || '' });
    }
  });
  /* ---------- Choix d'une formule ---------- */
  var formuleSource = null;
  var CROIX = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function choisirFormule(id, from) {
    var it = trouverItem(id); if (!it) return;
    if (!it.choix) { ajouter(id, { from: from }); return; }
    var f = $('#formule-feuille');
    if (!f) { f = doc.createElement('div'); f.className = 'feuille'; f.id = 'formule-feuille'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-modal', 'true'); f.setAttribute('aria-labelledby', 'formule-titre'); f.setAttribute('inert', ''); f.setAttribute('aria-hidden', 'true'); doc.body.appendChild(f); }
    var opt = function (o) { return '<option>' + esc(o) + '</option>'; };
    f.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2 id="formule-titre" style="font-size:clamp(1.9rem,5vw,2.8rem)">' + esc(it.nom) + '</h2><button class="fermer" type="button" data-fermer aria-label="Fermer">' + CROIX + '</button></div>' +
      '<p class="small muted">' + esc(it.desc.charAt(0).toUpperCase() + it.desc.slice(1)) + '.</p>' +
      '<form id="form-formule" data-id="' + id + '" novalidate>' +
      it.choix.map(function (c, i) {
        var opts = c.groupes ? c.groupes.map(function (g) { return '<optgroup label="' + esc(g[0]) + '">' + g[1].map(opt).join('') + '</optgroup>'; }).join('') : c.options.map(opt).join('');
        return '<div class="champ"><label for="ff-' + i + '">' + esc(c.label) + '</label><select id="ff-' + i + '" name="' + c.cle + '" aria-describedby="ffe-' + i + '"' + (i === 0 ? ' data-focus-premier' : '') + '><option value="">Choisir…</option>' + opts + '</select><span class="err" id="ffe-' + i + '" data-err="' + c.cle + '"></span></div>';
      }).join('') +
      '<p class="todo-note">liste exacte des produits proposés en formule</p>' +
      '<div class="formule-bas"><span class="prix">' + euro(it.prix) + '</span><button class="btn" type="submit">Ajouter au panier</button></div></form>';
    formuleSource = from;
    ouvrir(f);
  }
  PL.choisirFormule = choisirFormule;

  function erreurChamp(champ, msg) {
    var er = champ && doc.getElementById(champ.getAttribute('aria-describedby').split(' ')[0]);
    if (er) er.textContent = msg || '';
    if (champ) { if (msg) champ.setAttribute('aria-invalid', 'true'); else champ.removeAttribute('aria-invalid'); }
    return !msg;
  }
  doc.addEventListener('submit', function (e) {
    if (e.target.id === 'form-formule') {
      e.preventDefault();
      var ff = e.target, vals = [], premier = null;
      $$('select', ff).forEach(function (s) { if (!erreurChamp(s, s.value ? '' : 'Faites votre choix.') && !premier) premier = s; else if (s.value) vals.push(s.value); });
      if (premier) { premier.focus(); return; }
      var id = ff.getAttribute('data-id'), src = formuleSource && formuleSource.isConnected ? formuleSource : null;
      fermer();
      ajouter(id, { detail: vals.join(' · '), from: src });
      return;
    }
    if (e.target.id !== 'form-paiement') return;
    e.preventDefault();
    relire();
    var f = e.target, ko = null;
    var tel = f.tel.value.replace(/[\s.\-()]/g, '');
    var verif = function (champ, msg) { if (!erreurChamp(champ, msg) && !ko) ko = champ; };
    verif(f.nom, f.nom.value.trim().length < 2 ? 'Indiquez votre nom.' : '');
    verif(f.tel, /^(0\d{9}|\+\d{11,13}|00\d{11,13})$/.test(tel) ? '' : 'Indiquez un numéro valide, par exemple 06 94 12 34 56.');
    if (f.adr) verif(f.adr, f.adr.value.trim().length < 6 ? 'Indiquez l’adresse de livraison.' : '');
    if (ko) { ko.focus(); return; }
    var r = resto(panier.ville);
    if (!r || !panier.lignes.length || regleAlcool().bloque) { etape = 'panier'; rendrePanier({ titre: true }); return; }
    recap = {
      lignes: panier.lignes.slice(), ville: r.ville, tel: r.telephones[0], total: sousTotal(),
      mode: MODES[panier.mode],
      creneau: f.creneau.options[f.creneau.selectedIndex].text + (f.creneau.value.charAt(0) === 'd' ? ' (demain)' : '')
    };
    panier.lignes = []; sauverPanier();
    etape = 'fini'; rendrePanier({ titre: true });
    var c = $('#panier .tiroir-corps'); if (c) c.scrollTop = 0;
  });

  /* ---------- Mode calme ---------- */
  function calme() { return html.classList.contains('calme'); }
  PL.calme = calme;
  function majCalmeBtn() { $$('.calme-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(calme())); }); }
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.calme-btn')) return;
    var v = !calme();
    html.classList.toggle('calme', v);
    store.set('pl-calme', v);
    majCalmeBtn();
    message(v ? 'Mode calme activé : animations coupées' : 'Animations réactivées');
    monter();
  });

  /* ---------- Braises (canvas 2D) ---------- */
  function braises(canvas, o) {
    o = Object.assign({ n: 64, suivre: false, vitesse: 1, haut: false }, o || {});
    var ctx = canvas.getContext('2d'); if (!ctx) return function () { };
    var dpr = 1, W = 0, H = 0, P = [], raf = 0, vis = false, mx = -1, my = -1, arret = false;
    function taille() { W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function nait(p, init) {
      var pres = o.suivre && mx >= 0 && Math.random() < .45;
      p.x = pres ? mx + (Math.random() - .5) * 70 : Math.random() * W;
      p.y = pres ? my + (Math.random() - .5) * 30 : (init ? Math.random() * H : H + 8);
      p.vy = -(.35 + Math.random() * 1.15) * o.vitesse; p.vx = (Math.random() - .5) * .35;
      p.r = .6 + Math.random() * 1.7; p.vie = 0; p.max = 160 + Math.random() * 280; p.ph = Math.random() * 6.28; p.c = Math.random();
    }
    for (var i = 0; i < o.n; i++) { var p = {}; P.push(p); }
    function image() {
      raf = 0; if (!vis || arret) return;
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < P.length; i++) {
        var p = P[i]; p.vie++; p.ph += .035;
        p.x += p.vx + Math.sin(p.ph) * .38; p.y += p.vy;
        var k = 1 - p.vie / p.max;
        if (k <= 0 || p.y < -12) { nait(p, false); continue; }
        var a = Math.min(1, k * 1.5) * (.55 + .45 * Math.sin(p.ph * 2.7));
        var r = 255, g = Math.round(91 + 90 * p.c), b = Math.round(31 + 30 * p.c);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (a * .16).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4.2, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,' + (200 + Math.round(40 * p.c)) + ',170,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(image);
    }
    taille(); P.forEach(function (p) { nait(p, true); });
    var io = new IntersectionObserver(function (en) { vis = en[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(image); }, { rootMargin: '80px' });
    io.observe(canvas);
    var ro = new ResizeObserver(taille); ro.observe(canvas);
    var move = function (e) { var r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (mx < 0 || my < 0 || mx > W || my > H) { mx = -1; } };
    if (o.suivre) window.addEventListener('pointermove', move, { passive: true });
    return function () { arret = true; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', move); ctx.clearRect(0, 0, W, H); };
  }
  PL.braises = braises;

  /* ---------- Odomètre de prix ---------- */
  function odo(el, cents, anim) {
    var txt = euro(cents);
    if (!el.querySelector('.odo')) el.innerHTML = '';
    var box = el.querySelector('.odo');
    if (box) { var sr = el.querySelector('.sr-only'); if (sr) sr.textContent = txt; }
    if (!box || box.getAttribute('data-n') !== String(txt.length)) {
      el.innerHTML = '<span class="sr-only">' + txt + '</span><span class="odo" aria-hidden="true" data-n="' + txt.length + '">' + txt.split('').map(function (ch) {
        return /\d/.test(ch) ? '<span class="col"><i>' + '0123456789'.split('').map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</i></span>' : '<span class="fixe">' + (ch === ' ' || ch === NBSP ? '&nbsp;' : ch) + '</span>';
      }).join('') + '</span>';
      box = el.querySelector('.odo');
    }
    var cols = box.querySelectorAll('.col i'), k = 0;
    txt.split('').forEach(function (ch) {
      if (!/\d/.test(ch)) return;
      var strip = cols[k++]; var y = -parseInt(ch, 10) * 10;
      strip.setAttribute('data-y', y);
      if (window.gsap) gsap.set(strip, { yPercent: y }); else strip.style.transform = 'translateY(' + y + '%)';
    });
    if (anim) odoRoule(el);
  }
  function odoRoule(el) {
    if (!window.gsap || calme()) return;
    el.querySelectorAll('.col i').forEach(function (s, i) { gsap.fromTo(s, { yPercent: 0 }, { yPercent: +s.getAttribute('data-y'), duration: 1.2 + i * .15, ease: 'expo.out' }); });
  }
  PL.odo = odo; PL.odoRoule = odoRoule;

  /* ---------- Images Grok (arrivent plus tard) ---------- */
  function grok() {
    var has = function (n) { return !!(n && D.grok[n]); };
    var set = function (n) { return D.grok[n].map(function (w) { return 'assets/img/grok/' + n + '-' + w + '.webp ' + w + 'w'; }).join(', '); };
    var src = function (n) { var w = D.grok[n]; return 'assets/img/grok/' + n + '-' + w[w.length - 1] + '.webp'; };
    $$('[data-grok]').forEach(function (el) {
      if (el.querySelector('.grok-img')) return;
      var d = el.getAttribute('data-grok'), m = el.getAttribute('data-grok-m');
      if (!has(d) && !has(m)) return;
      var principal = has(d) ? d : m;
      var pic = doc.createElement('picture'); pic.className = 'grok-img';
      pic.innerHTML = (has(m) && has(d) ? '<source media="(max-width: 760px)" srcset="' + set(m) + '" sizes="100vw">' : '') +
        '<img alt="" decoding="async"' + (el.hasAttribute('data-grok-vite') ? ' fetchpriority="high"' : ' loading="lazy"') + ' src="' + src(principal) + '" srcset="' + set(principal) + '" sizes="' + (el.getAttribute('data-grok-taille') || '100vw') + '">';
      el.appendChild(pic); el.classList.add('a-grok');
    });
  }
  PL.grok = grok;

  /* ---------- Montage des animations ---------- */
  var montages = [], jetables = [], ctx = null;
  PL.auMontage = function (fn) { montages.push(fn); };
  PL.jeter = function (fn) { jetables.push(fn); };

  function lenisMarche(on) {
    if (PL.lenis) { gsap.ticker.remove(PL._lenisTick); PL.lenis.destroy(); PL.lenis = null; html.classList.remove('lenis', 'lenis-smooth'); }
    if (!on || typeof Lenis === 'undefined') return;
    PL.lenis = new Lenis({ lerp: .11, smoothWheel: true, wheelMultiplier: 1, autoRaf: false });
    PL.lenis.on('scroll', ScrollTrigger.update);
    PL._lenisTick = function (t) { PL.lenis && PL.lenis.raf(t * 1000); };
    gsap.ticker.add(PL._lenisTick);
    gsap.ticker.lagSmoothing(0);
  }

  function curseur(on) {
    var dot = $('.curseur'), ring = $('.curseur-anneau'); if (!dot) return;
    if (!on || !matchMedia('(pointer: fine)').matches) { html.classList.remove('a-curseur'); return; }
    html.classList.add('a-curseur');
    var xd = gsap.quickTo(dot, 'x', { duration: .12 }), yd = gsap.quickTo(dot, 'y', { duration: .12 });
    var xr = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), yr = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    var mv = function (e) { xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); };
    var ov = function (e) { ring.classList.toggle('grand', !!e.target.closest('a, button, [data-curseur], .cat, .recette, .carte-pizza')); };
    window.addEventListener('pointermove', mv, { passive: true });
    doc.addEventListener('pointerover', ov);
    PL.jeter(function () { window.removeEventListener('pointermove', mv); doc.removeEventListener('pointerover', ov); html.classList.remove('a-curseur'); });
  }

  function aimants() {
    if (!matchMedia('(pointer: fine)').matches) return;
    $$('[data-aimant]').forEach(function (el) {
      var inner = el.querySelector('.btn-in');
      var mv = function (e) { var r = el.getBoundingClientRect(); var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); gsap.to(el, { x: dx * .28, y: dy * .38, duration: .4, ease: 'power3.out' }); if (inner) gsap.to(inner, { x: dx * .12, y: dy * .14, duration: .4 }); };
      var lv = function () { gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' }); if (inner) gsap.to(inner, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .4)' }); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv);
      PL.jeter(function () { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); gsap.set([el, inner].filter(Boolean), { clearProps: 'transform' }); });
    });
  }

  function inclinaisons() {
    if (!matchMedia('(pointer: fine)').matches) return;
    $$('[data-incline]').forEach(function (el) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 900 });
      var mv = function (e) { var r = el.getBoundingClientRect(); var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; rx(-py * 7); ry(px * 9); };
      var lv = function () { rx(0); ry(0); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv);
      PL.jeter(function () { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); gsap.set(el, { clearProps: 'transform' }); });
    });
  }

  function titres() {
    if (typeof SplitText === 'undefined') return;
    $$('[data-titre]').forEach(function (el) {
      SplitText.create(el, {
        type: 'lines, words', mask: 'lines', autoSplit: true, linesClass: 'ligne-titre',
        onSplit: function (self) {
          return gsap.from(self.words, { yPercent: 115, duration: 1.05, ease: 'expo.out', stagger: .045, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        }
      });
    });
    $$('[data-apparait]').forEach(function (el) {
      gsap.from(el, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
    var lots = $$('[data-lot]');
    if (lots.length) {
      gsap.set(lots, { y: 44, opacity: 0 });
      ScrollTrigger.batch(lots, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .08, overwrite: true }); } });
    }
  }

  function nav() {
    var n = $('.nav'); if (!n) return;
    var dernier = 0;
    var st = ScrollTrigger.create({
      start: 0, end: 'max', onUpdate: function (s) {
        var y = s.scroll();
        n.classList.toggle('scrolled', y > 24);
        if (!ouverte) n.classList.toggle('cache', y > 420 && y > dernier + 4 && !calme());
        if (y < dernier - 4) n.classList.remove('cache');
        html.classList.toggle('nav-cachee', n.classList.contains('cache'));
        dernier = y;
      }
    });
    PL.jeter(function () { st.kill(); n.classList.remove('cache'); html.classList.remove('nav-cachee'); });
  }

  /* Liens internes : défilement doux vers une ancre (même sur un lien « carte.html#pizzas » depuis la carte),
     sans rechargement pour la page en cours, et transition de braise vers les autres pages. */
  function pageDe(chemin) { var p = (chemin || '').split('#')[0].split('?')[0].split('/').pop().replace(/\.html$/, ''); return p === '' || p === '.' ? 'index' : p; }
  function defiler(cible) {
    var barre = $('.barre');
    var off = -(parseInt(getComputedStyle(html).getPropertyValue('--nav-h'), 10) || 70) - (barre ? barre.offsetHeight : 0) - 10;
    if (cible) {
      if (PL.lenis) PL.lenis.scrollTo(cible, { offset: off, duration: 1.2 });
      else window.scrollTo({ top: cible.getBoundingClientRect().top + scrollY + off, behavior: calme() ? 'auto' : 'smooth' });
      if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(cible.tagName) && !cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
      cible.focus({ preventScroll: true });
    } else if (PL.lenis) PL.lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: calme() ? 'auto' : 'smooth' });
  }
  function transition(href, x, y) {
    var ov = $('.passage');
    if (!ov || calme() || !window.gsap) { location.href = href; return; }
    try { sessionStorage.setItem('pl-passage', '1'); } catch (err) { }
    if (x == null) { x = innerWidth / 2; y = innerHeight / 2; }
    gsap.fromTo(ov, { clipPath: 'circle(0% at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(150% at ' + x + 'px ' + y + 'px)', duration: .6, ease: 'power3.in', onComplete: function () { location.href = href; } });
  }
  function aller(href) {
    if (pageDe(href) === pageDe(location.pathname)) { fermer(true); var h = href.split('#')[1]; defiler(h ? doc.getElementById(h) : null); return; }
    transition(href);
  }
  PL.aller = aller;
  doc.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    var interne = /^#./.test(href) || /^([a-z0-9-]+\.html)?(#[\w-]+)?$/i.test(href) || href === './' || href === '/';
    if (!interne || href === '') return;
    var hash = href.indexOf('#') >= 0 ? href.split('#')[1] : '';
    var meme = href.charAt(0) === '#' || pageDe(href) === pageDe(location.pathname);
    if (meme) {
      var cible = hash ? doc.getElementById(hash) : null;
      if (hash && !cible) return;
      e.preventDefault();
      if (ouverte) fermer(true);
      defiler(cible);
      if (hash) { try { history.replaceState(null, '', '#' + hash); } catch (err) { } }
      return;
    }
    e.preventDefault();
    transition(href, e.clientX, e.clientY);
  });
  function sortirPassage() {
    var ov = $('.passage'); if (!ov) return;
    if (!html.classList.contains('entree')) return;
    try { sessionStorage.removeItem('pl-passage'); } catch (err) { }
    if (calme() || !window.gsap) { html.classList.remove('entree'); return; }
    gsap.fromTo(ov, { clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 0%)', duration: .8, ease: 'power3.inOut', delay: .05, onComplete: function () { html.classList.remove('entree'); gsap.set(ov, { clearProps: 'clipPath' }); } });
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { html.classList.remove('entree'); var ov = $('.passage'); if (ov) ov.style.clipPath = ''; } });

  function monter() {
    var anim = !!window.gsap && !!window.ScrollTrigger;
    jetables.splice(0).forEach(function (fn) { try { fn(); } catch (e) { } });
    if (ctx) { ctx.revert(); ctx = null; }
    if (!anim) { montages.forEach(function (fn) { try { fn(true); } catch (e) { console.warn(e); } }); return; }
    var c = calme();
    lenisMarche(!c);
    ctx = gsap.context(function () {
      nav();
      if (!c) { curseur(true); aimants(); inclinaisons(); titres(); }
      montages.forEach(function (fn) { try { fn(c); } catch (e) { console.warn(e); } });
    });
    ScrollTrigger.refresh();
  }
  PL.monter = monter;

  /* RN1 : projection équirectangulaire des vraies coordonnées */
  var BOURGS = [['Saint-Laurent-du-Maroni', -54.0297, 5.4985, 'saint-laurent'], ['Iracoubo', -53.2089, 5.4806], ['Sinnamary', -52.9554, 5.3759], ['Kourou', -52.6503, 5.1599, 'kourou'], ['Macouria', -52.478, 5.0152], ['Cayenne', -52.326, 4.9372, 'cayenne']];
  var BOX = { lon0: -54.15, lon1: -52.2, lat0: 4.8, lat1: 5.62 };
  function proj(lon, lat) { return [(lon - BOX.lon0) / (BOX.lon1 - BOX.lon0) * 1000, (BOX.lat1 - lat) / (BOX.lat1 - BOX.lat0) * (1000 / 3.4)]; }
  function cheminLisse(pts) {
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + c1.map(function (v) { return v.toFixed(1); }).join(',') + ' ' + c2.map(function (v) { return v.toFixed(1); }).join(',') + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }
  PL.rn1 = function (box, opts) {
    opts = opts || {}; if (!box) return;
    var esc = PL.esc;
    var pts = BOURGS.map(function (b) { return proj(b[1], b[2]); });
    var H = 1000 / 3.4, d = cheminLisse(pts);
    box.innerHTML = '<div class="rn1-fond" data-grok="g-route-nuit-16x9" data-grok-taille="90vw"><i class="trainee" style="top:58%"></i><i class="trainee" style="top:66%;animation-delay:-2.5s;animation-duration:8s"></i><i class="trainee" style="top:48%;animation-delay:-4s;animation-duration:7s"></i></div>' +
      '<svg viewBox="0 0 1000 ' + H.toFixed(0) + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + d + '" fill="none" stroke="rgba(245,235,221,.12)" stroke-width="10" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<path class="route" d="' + d + '" fill="none" stroke="#FF5B1F" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 6px rgba(255,91,31,.8))"/>' +
      '<path d="' + d + '" fill="none" stroke="rgba(245,235,221,.35)" stroke-width="1" stroke-dasharray="2 10" vector-effect="non-scaling-stroke"/>' +
      '</svg><span class="ocean">Océan Atlantique</span>' +
      BOURGS.map(function (b, i) {
        var p = pts[i], x = (p[0] / 10).toFixed(2) + '%', y = (p[1] / H * 100).toFixed(2) + '%';
        if (!b[3]) return '<span class="bourg" style="left:' + x + ';top:calc(' + y + ' + 22px)">' + b[0] + '</span>';
        var r = PL.resto(b[3]);
        return '<a class="ville-pt' + (b[3] === 'kourou' ? ' bas' : '') + (b[3] === 'saint-laurent' ? ' gauche' : '') + (b[3] === 'cayenne' ? ' droite' : '') + (opts.focus === b[3] ? ' focus allume' : '') + '" href="' + r.page + '" data-ville-allumee="' + b[3] + '" style="left:' + x + ';top:' + y + '"><span class="rond"></span><span class="nomv">' + esc(PL.nomCourt(r)) + '</span><span data-statut="' + b[3] + '" data-court></span></a>';
      }).join('') +
      '<span class="braise-route" aria-hidden="true" style="position:absolute;left:0;top:0;width:14px;height:14px;margin:-7px;border-radius:50%;background:#FFD0A8;box-shadow:0 0 12px 5px rgba(255,91,31,.9),0 0 40px 12px rgba(255,91,31,.4);opacity:0"></span>';
  };

  /* ---------- Démarrage ---------- */
  function demarrer() {
    html.classList.remove('sans-js');
    if (window.gsap) { gsap.registerPlugin(ScrollTrigger); if (window.SplitText) gsap.registerPlugin(SplitText); }
    majCalmeBtn();
    $$('[data-choisir-ville]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-choisir-ville') === PL.ville)); });
    majStatuts(); setInterval(majStatuts, 30000);
    rendrePanier(); grok();
    $$('.tiroir, .feuille').forEach(function (el) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); });
    var lancer = function () { monter(); sortirPassage(); doc.dispatchEvent(new Event('pl:pret')); };
    if (doc.fonts && doc.fonts.ready) Promise.race([doc.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(lancer); else lancer();
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
