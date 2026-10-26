/* Pizza Lyght — page de la carte : illustrations, filtres, recherche, rubrique active, composeur Allasani. */
(function () {
  var PL = window.PL, $ = PL.$, $$ = PL.$$;

  $$('img[data-pizza]').forEach(function (img) { var it = PL.trouverItem(img.getAttribute('data-pizza')); if (it) img.src = PL.art.dataUri(it); });

  /* Filtres et recherche */
  var actifs = [], q = '', minuteur = 0;
  function appliquer() {
    var nq = PL.art.norm(q), total = 0;
    $$('[data-rubrique]').forEach(function (sec) {
      var vis = 0;
      $$('.carte-pizza, .plat', sec).forEach(function (el) {
        var estPizza = el.classList.contains('carte-pizza');
        var f = ' ' + (el.getAttribute('data-filtres') || '') + ' ';
        var okF = !actifs.length || (estPizza && actifs.every(function (x) { return f.indexOf(' ' + x + ' ') >= 0; }));
        var okQ = !nq || (el.getAttribute('data-texte') || '').indexOf(nq) >= 0;
        el.hidden = !(okF && okQ);
        if (!el.hidden) { vis++; if (window.gsap) gsap.set(el, { clearProps: 'opacity,transform' }); }
      });
      sec.hidden = vis === 0;
      var l = $('[data-lien="' + sec.id + '"]'); if (l) l.hidden = vis === 0;
      total += vis;
    });
    var a = $('.aucun');
    a.hidden = total > 0;
    if (!total) a.textContent = 'Aucun plat ne correspond' + (q ? ' à « ' + q + ' »' : '') + (actifs.length ? ' avec ces filtres' : '') + '. Essayez un autre mot ou retirez un filtre.';
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-filtre]');
    if (b) {
      var f = b.getAttribute('data-filtre'), on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      actifs = on ? actifs.concat(f) : actifs.filter(function (x) { return x !== f; });
      appliquer();
      return;
    }
    if (e.target.closest('[data-composer]')) {
      var box = $('#composeur-carte');
      if (!box.firstChild) PL.composeur(box, { apresAjout: function () { setTimeout(PL.fermer, 900); } });
      PL.ouvrir($('#composer-feuille'));
    }
  });
  var champ = $('#recherche');
  if (champ) champ.addEventListener('input', function () { clearTimeout(minuteur); minuteur = setTimeout(function () { q = champ.value.trim(); appliquer(); }, 140); });

  /* Rubrique active dans la barre */
  function actif(id) {
    var lien = null;
    $$('.cat-lien').forEach(function (a) { var on = a.getAttribute('data-lien') === id; a.classList.toggle('on', on); if (on) lien = a; });
    if (lien) { var bar = lien.parentNode; bar.scrollTo({ left: Math.max(0, lien.offsetLeft - 16), behavior: PL.calme() ? 'auto' : 'smooth' }); }
  }

  PL.auMontage(function (calme) {
    $$('[data-rubrique]').forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { if (s.isActive) actif(sec.id); } });
    });
    if (calme) return;
    var h1 = $('.carte-hero h1');
    if (h1 && window.SplitText) SplitText.create(h1, { type: 'chars', autoSplit: true, onSplit: function (s) { return gsap.from(s.chars, { yPercent: 100, opacity: 0, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: .04, delay: .1 }); } });
    gsap.from('.carte-hero .infos > *', { y: 24, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', delay: .4 });
    gsap.from('.pizza-cote', { scale: .6, rotation: -120, opacity: 0, duration: 1.8, ease: 'expo.out', delay: .1 });
    gsap.to('.pizza-cote img', { rotation: 360, duration: 110, ease: 'none', repeat: -1 });
    gsap.to('.pizza-cote', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.carte-hero', start: 'top top', end: 'bottom top', scrub: true } });
    var bc = $('.carte-hero .hero-fond canvas'); if (bc) PL.jeter(PL.braises(bc, { n: 46, suivre: true }));
    $$('.banniere img').forEach(function (im) { gsap.fromTo(im, { yPercent: -18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });
    var items = $$('.carte-pizza, .plat');
    gsap.set(items, { y: 30, opacity: 0 });
    ScrollTrigger.batch(items, { start: 'top 94%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, opacity: 1, duration: .7, ease: 'power3.out', stagger: .05, overwrite: true }); } });
    PL.jeter(function () { gsap.set(items, { clearProps: 'opacity,transform' }); });
  });

  /* Lien direct vers une rubrique (#salades…) */
  document.addEventListener('pl:pret', function () {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id); if (!el) return;
    var off = -($('.nav').offsetHeight + ($('.barre') ? $('.barre').offsetHeight : 0)) - 12;
    setTimeout(function () {
      if (PL.lenis) PL.lenis.scrollTo(el, { offset: off, immediate: true });
      else window.scrollTo(0, el.getBoundingClientRect().top + scrollY + off);
      if (window.ScrollTrigger) ScrollTrigger.update();
    }, 60);
  });
})();
