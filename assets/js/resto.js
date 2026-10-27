/* Pizza Lyght — page d'une pizzeria : cadran 24 h à l'heure de Guyane, plan de la RN1, services, pizza du coin. */
(function () {
  var PL = window.PL, $ = PL.$, $$ = PL.$$;
  var main = $('main[data-ville]'); if (!main) return;
  var id = main.getAttribute('data-ville'), r = PL.resto(id);

  PL.rn1($('.rn1-carte'), { focus: id });

  /* Cadran 24 h : minuit en haut, les créneaux d'ouverture en braise, l'aiguille sur l'heure de Guyane */
  var C = 200, RAY = 170;
  function ang(m) { return m / 1440 * Math.PI * 2 - Math.PI / 2; }
  function pt(m, rad) { return [(C + Math.cos(ang(m)) * rad).toFixed(2), (C + Math.sin(ang(m)) * rad).toFixed(2)]; }
  function cadran() {
    var box = $('.cadran'); if (!box) return;
    var s = '<svg viewBox="-34 -34 468 468" role="img" aria-label="Horaires sur 24 heures : ' + PL.plages(r) + '">';
    s += '<circle cx="200" cy="200" r="' + RAY + '" fill="none" stroke="rgba(245,235,221,.09)" stroke-width="20"/>';
    for (var h = 0; h < 24; h++) {
      var a = pt(h * 60, 188), b = pt(h * 60, h % 6 ? 194 : 202);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="rgba(245,235,221,' + (h % 6 ? .25 : .6) + ')" stroke-width="' + (h % 6 ? 1 : 2) + '"/>';
    }
    [[0, '0h'], [360, '6h'], [720, '12h'], [1080, '18h']].forEach(function (l) { var p = pt(l[0], 222); s += '<text x="' + p[0] + '" y="' + p[1] + '" text-anchor="middle" dominant-baseline="middle">' + l[1] + '</text>'; });
    r.creneaux.forEach(function (c) {
      var p0 = pt(c[0], RAY), p1 = pt(c[1], RAY), large = c[1] - c[0] > 720 ? 1 : 0;
      s += '<path class="arc" d="M' + p0[0] + ',' + p0[1] + ' A' + RAY + ',' + RAY + ' 0 ' + large + ' 1 ' + p1[0] + ',' + p1[1] + '" fill="none" stroke="#FF5B1F" stroke-width="20" stroke-linecap="round" style="filter:drop-shadow(0 0 10px rgba(255,91,31,.55))"/>';
      var m = pt((c[0] + c[1]) / 2, RAY - 34);
      s += '<text x="' + m[0] + '" y="' + m[1] + '" text-anchor="middle" dominant-baseline="middle" style="fill:#FF8A4C">' + PL.hh(c[0]) + '–' + PL.hh(c[1]) + '</text>';
    });
    s += '<g class="aiguille"><line x1="200" y1="200" x2="200" y2="48" stroke="#F5EBDD" stroke-width="2.5" stroke-linecap="round"/><circle cx="200" cy="40" r="7" fill="#FF5B1F" style="filter:drop-shadow(0 0 8px rgba(255,91,31,.9))"/><circle cx="200" cy="200" r="5" fill="#F5EBDD"/></g></svg>';
    box.insertAdjacentHTML('afterbegin', s);
    tourner(PL.maintenant(), false);
  }
  function tourner(now, anim) {
    var g = $('.cadran .aiguille'); if (!g) return;
    var deg = now.min / 1440 * 360;
    if (anim && window.gsap && !PL.calme()) gsap.fromTo(g, { rotation: 0 }, { rotation: deg, svgOrigin: '200 200', duration: 2, ease: 'expo.inOut' });
    else if (window.gsap) gsap.set(g, { rotation: deg, svgOrigin: '200 200' });
    else g.setAttribute('transform', 'rotate(' + deg + ' 200 200)');
  }
  document.addEventListener('pl:minute', function (e) { tourner(e.detail, false); });
  cadran();

  PL.auMontage(function (calme) {
    tourner(PL.maintenant(), false);
    if (calme) return;
    var h1 = $('.r-hero h1');
    if (h1 && window.SplitText) SplitText.create(h1, { type: 'lines, chars', mask: 'lines', autoSplit: true, onSplit: function (s) { return gsap.from(s.chars, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: .035, delay: .15 }); } });
    gsap.from('.r-hero .infos-l > *, .r-hero .actions > *, .r-hero .eyebrow', { y: 24, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out', delay: .5 });
    gsap.fromTo('.r-hero .photo-fond img', { scale: 1.2 }, { scale: 1, duration: 3, ease: 'expo.out' });
    gsap.to('.r-hero .photo-fond img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.r-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.r-photo', { y: 70, rotate: 9, opacity: 0, duration: 1.5, ease: 'expo.out', delay: .35 });
    gsap.fromTo('.r-photo img', { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.r-hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.service .fond').forEach(function (im) { gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: im.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });

    $$('.service svg').forEach(function (svg) {
      var traits = $$('path, line, rect, circle', svg);
      traits.forEach(function (t) { var L = t.getTotalLength ? t.getTotalLength() : 200; gsap.set(t, { strokeDasharray: L, strokeDashoffset: L }); });
      gsap.to(traits, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: .08, scrollTrigger: { trigger: svg, start: 'top 90%', once: true } });
    });

    $$('.cadran .arc').forEach(function (a) { var L = a.getTotalLength(); gsap.fromTo(a, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: '.cadran', start: 'top 80%', once: true } }); });
    ScrollTrigger.create({ trigger: '.cadran', start: 'top 80%', once: true, onEnter: function () { tourner(PL.maintenant(), true); } });

    var route = $('.rn1 .route');
    if (route) { var L = route.getTotalLength(); gsap.fromTo(route, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.rn1', start: 'top 80%', once: true } }); }

    gsap.fromTo('.signature .art img', { rotation: -60 }, { rotation: 60, ease: 'none', scrollTrigger: { trigger: '.signature', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
})();
