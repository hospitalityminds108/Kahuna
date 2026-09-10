/* ============================================================
   KAHUNA — Core Motion & Interaction Layer
   GSAP + ScrollTrigger • Calm, cinematic, coastal
   ============================================================ */
(function () {
  'use strict';

  var docEl = document.documentElement;
  docEl.classList.remove('no-js');

  /* ---------- Environment detection ---------- */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isLowPower = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
                   (navigator.hardwareConcurrency || 4) <= 4;
  var animate = !prefersReduced;
  var parallaxOn = !prefersReduced && !isLowPower;

  /* ---------- GSAP registration ---------- */
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (animate) {
      gsap.defaults({ ease: 'power3.out', duration: 1.1 });
    }
  }

  /* ============================================================
     ANIMATION UTILITIES
     ============================================================ */
  var Motion = {
    /* Fade up — default reveal */
    fadeUp: function (els, opts) {
      if (!hasGSAP || !animate) { Motion._show(els); return; }
      gsap.from(els, Object.assign({
        y: 44, opacity: 0, duration: 1.15, ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: els, start: 'top 88%', once: true }
      }, opts || {}));
    },

    /* Simple fade */
    fadeIn: function (els, opts) {
      if (!hasGSAP || !animate) { Motion._show(els); return; }
      gsap.from(els, Object.assign({
        opacity: 0, duration: 1.3, ease: 'power2.out',
        scrollTrigger: { trigger: els, start: 'top 90%', once: true }
      }, opts || {}));
    },

    /* Image reveal — clip-path wipe + panel sweep */
    imageReveal: function (wrap) {
      if (!hasGSAP || !animate) {
        var img = wrap.querySelector('.reveal-img');
        var panel = wrap.querySelector('.reveal-panel');
        if (img) img.style.clipPath = 'none';
        if (panel) panel.style.display = 'none';
        return;
      }
      var img = wrap.querySelector('.reveal-img');
      var panel = wrap.querySelector('.reveal-panel');
      if (!img) return;
      var tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start: 'top 82%', once: true }
      });
      if (panel) {
        tl.to(panel, { scaleX: 0, transformOrigin: 'right', duration: 0.9, ease: 'power3.inOut' }, 0.35);
        tl.to(img, { clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: 'expo.out' }, 0.45);
        tl.set(panel, { display: 'none' });
      } else {
        tl.fromTo(img, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: 'expo.out' });
      }
    },

    /* Parallax scrub on media */
    parallaxImage: function (media, amount) {
      if (!hasGSAP || !parallaxOn || !media) return;
      var amt = amount || 12;
      gsap.fromTo(media,
        { yPercent: -amt },
        {
          yPercent: amt,
          ease: 'none',
          scrollTrigger: {
            trigger: media.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1
          }
        });
    },

    /* Scale on scroll (cinematic sections) */
    scaleOnScroll: function (media) {
      if (!hasGSAP || !animate || !media) return;
      gsap.fromTo(media,
        { scale: 1.18 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: media.closest('section') || media.parentElement,
            start: 'top bottom',
            end: 'top top',
            scrub: 1.2
          }
        });
    },

    /* Line-mask text reveal */
    textReveal: function (el) {
      if (!hasGSAP || !animate || !el) return;
      var lines = el.querySelectorAll('.line-mask > span');
      if (!lines.length) return;
      gsap.from(lines, {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.14,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    },

    /* Stagger children */
    staggerReveal: function (container, sel) {
      if (!hasGSAP || !animate || !container) return;
      var kids = sel ? container.querySelectorAll(sel) : container.children;
      if (!kids.length) return;
      gsap.from(kids, {
        y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: container, start: 'top 86%', once: true }
      });
    },

    /* Horizontal scroll (pinned) — used for reels on desktop */
    horizontalScroll: function (track, container) {
      if (!hasGSAP || !animate || !track || !container) return;
      var getDist = function () { return track.scrollWidth - container.clientWidth; };
      if (getDist() <= 0) return;
      gsap.to(track, {
        x: function () { return -getDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: function () { return '+=' + (getDist() + window.innerHeight * 0.4); },
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    },

    /* Hero intro timeline */
    heroIntro: function () {
      if (!hasGSAP || !animate) return;
      var heroEls = document.querySelectorAll('[data-hero]');
      if (!heroEls.length) return;
      var tl = gsap.timeline({ delay: 0.25 });
      tl.from('[data-hero="eyebrow"]', { y: 26, opacity: 0, duration: 0.9, ease: 'power2.out' })
        .from('[data-hero="title"] .line-mask > span', { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.15 }, '-=0.45')
        .from('[data-hero="sub"]', { y: 26, opacity: 0, duration: 0.9, ease: 'power2.out' }, '-=0.8')
        .from('[data-hero="cta"] .btn', { y: 22, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }, '-=0.6')
        .from('.scroll-hint', { opacity: 0, duration: 1 }, '-=0.3');
      var vid = document.querySelector('[data-hero-video]');
      if (vid) gsap.from(vid, { scale: 1.12, duration: 2.2, ease: 'power2.out' });
    },

    _show: function (els) {
      if (!els) return;
      (els.length !== undefined ? els : [els]).forEach(function (e) {
        if (e && e.style) e.style.opacity = 1;
      });
    }
  };

  window.KahunaMotion = Motion;

  /* ============================================================
     NAVBAR
     ============================================================ */
  var nav = document.querySelector('[data-nav]');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      /* Hide on scroll-down past hero, show on scroll-up */
      if (y > window.innerHeight * 0.85 && y > lastY + 6) {
        nav.classList.add('nav-hidden');
      } else if (y < lastY - 6 || y <= 120) {
        nav.classList.remove('nav-hidden');
      }
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link highlighting */
  (function markActive() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
    });
  })();

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var mm = document.querySelector('[data-mobile-menu]');
  var mmOpen = document.querySelector('[data-menu-open]');
  var mmClose = document.querySelector('[data-menu-close]');
  function setMenu(open) {
    if (!mm) return;
    mm.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (mmOpen) mmOpen.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (mmOpen) mmOpen.addEventListener('click', function () { setMenu(true); });
  if (mmClose) mmClose.addEventListener('click', function () { setMenu(false); });
  if (mm) mm.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ============================================================
     VIDEO — lazy autoplay via IntersectionObserver
     ============================================================ */
  (function lazyVideo() {
    var vids = document.querySelectorAll('video[data-src]');
    if (!('IntersectionObserver' in window)) {
      vids.forEach(function (v) { v.src = v.dataset.src; v.play().catch(function () {}); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          if (v.src) v.pause();
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.15 });
    vids.forEach(function (v) { io.observe(v); });
  })();

  /* Reels — muted autoplay when visible, sound toggle on tap */
  (function reels() {
    var cards = document.querySelectorAll('.reel-card');
    if (!cards.length) return;
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target.querySelector('video');
        if (!v) return;
        if (en.isIntersecting) {
          if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });
    cards.forEach(function (c) { io.observe(c); });

    /* Tap to toggle sound + play state (mobile-native feel) */
    cards.forEach(function (c) {
      c.addEventListener('click', function () {
        var v = c.querySelector('video');
        if (!v) return;
        if (v.paused) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
          c.classList.add('playing');
        } else {
          v.pause();
          c.classList.remove('playing');
        }
      });
    });
  })();

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ============================================================
     AUTO-INIT REVEALS
     ============================================================ */
  function init() {
    /* fade-ups (data-delay in ms delays the reveal) */
    document.querySelectorAll('[data-fade-up]').forEach(function (el) {
      var d = parseFloat(el.getAttribute('data-delay'));
      Motion.fadeUp(el, isFinite(d) ? { delay: d / 1000 } : undefined);
    });
    /* fade-ins */
    document.querySelectorAll('[data-fade-in]').forEach(function (el) { Motion.fadeIn(el); });
    /* image reveals */
    document.querySelectorAll('.img-reveal').forEach(function (w) { Motion.imageReveal(w); });
    /* parallax media */
    document.querySelectorAll('[data-parallax]').forEach(function (m) {
      Motion.parallaxImage(m, parseFloat(m.dataset.parallax) || 12);
    });
    /* scale media */
    document.querySelectorAll('[data-scale-in]').forEach(function (m) { Motion.scaleOnScroll(m); });
    /* text reveals */
    document.querySelectorAll('[data-text-reveal]').forEach(function (el) { Motion.textReveal(el); });
    /* stagger containers */
    document.querySelectorAll('[data-stagger]').forEach(function (c) { Motion.staggerReveal(c); });
    /* hero */
    Motion.heroIntro();
    /* refresh triggers after images load */
    if (hasGSAP) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
