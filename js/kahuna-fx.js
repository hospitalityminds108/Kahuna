/* ============================================================
   KAHUNA — Coastal FX layer
   Hero tide, scroll progress, counters, card light, bubbles,
   slideshow, amenities jump-nav. Runs after kahuna.js.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---------- Scroll progress (tide line) ---------- */
  (function progress() {
    var bar = document.createElement('div');
    bar.className = 'k-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- Animated tide at the foot of each hero ---------- */
  (function tide() {
    var wave = 'M0,48 C120,84 240,12 360,48 C480,84 600,12 720,48 C840,84 960,12 1080,48 C1200,84 1320,12 1440,48 C1560,84 1680,12 1800,48 C1920,84 2040,12 2160,48 C2280,84 2400,12 2520,48 C2640,84 2760,12 2880,48 L2880,100 L0,100 Z';
    document.querySelectorAll('[data-tide]').forEach(function (hero) {
      var fill = hero.getAttribute('data-tide') || '#F8FCFD';
      var wrap = document.createElement('div');
      wrap.className = 'k-tide';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = ['t1', 't2', 't3'].map(function (c, i) {
        return '<svg class="' + c + '" viewBox="0 0 2880 100" preserveAspectRatio="none" style="bottom:' + (2 - i) * 7 + 'px"><path fill="' + fill + '" d="' + wave + '"/></svg>';
      }).join('');
      hero.appendChild(wrap);
    });
  })();

  /* ---------- Hero image: slow settle (composes with parallax) ---------- */
  if (hasGSAP && !reduced) {
    document.querySelectorAll('.page-hero > img').forEach(function (img) {
      gsap.from(img, { scale: 1.14, duration: 2.6, ease: 'power2.out' });
    });
  }

  /* ---------- Stat counters ---------- */
  (function counters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced || !isFinite(target)) { el.textContent = target + suffix; return; }
      var start = null, dur = 1600;
      function step(t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Cards: light that follows the cursor ---------- */
  if (finePointer) {
    document.querySelectorAll('.card-exp, .card-room').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Rising bubbles in deep-ocean sections ---------- */
  (function bubbles() {
    if (reduced) return;
    document.querySelectorAll('[data-bubbles]').forEach(function (sec) {
      var wrap = document.createElement('div');
      wrap.className = 'k-bubbles';
      wrap.setAttribute('aria-hidden', 'true');
      var n = window.innerWidth < 768 ? 8 : 16;
      for (var i = 0; i < n; i++) {
        var b = document.createElement('i');
        var size = 6 + Math.random() * 22;
        b.style.width = b.style.height = size + 'px';
        b.style.left = (Math.random() * 100) + '%';
        b.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px');
        b.style.animationDuration = (11 + Math.random() * 14) + 's';
        b.style.animationDelay = (-Math.random() * 20) + 's';
        wrap.appendChild(b);
      }
      sec.appendChild(wrap);
    });
  })();

  /* ---------- Slideshow ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (root) {
    var track = root.querySelector('.k-slides');
    var slides = root.querySelectorAll('.k-slide');
    var dotsWrap = root.querySelector('.k-dots');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (!track || !slides.length) return;

    var dur = parseInt(root.getAttribute('data-slider'), 10) || 6000;
    var index = 0, timer = null, dots = [];
    root.style.setProperty('--k-dur', dur + 'ms');

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'k-dot';
        d.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length);
        d.addEventListener('click', function () { go(i, true); });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    function mark(i) {
      index = i;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      dots.forEach(function (d, n) {
        d.classList.remove('is-active');
        if (n === i) { void d.offsetWidth; d.classList.add('is-active'); }
      });
    }
    function go(i, user) {
      var n = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[n].offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      mark(n);
      if (user) restart();
    }
    function stop() { clearInterval(timer); timer = null; root.classList.remove('is-auto'); }
    function start() {
      if (reduced || timer) return;
      root.classList.add('is-auto');
      mark(index);
      timer = setInterval(function () { go(index + 1); }, dur);
    }
    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', function () { go(index - 1, true); });
    if (next) next.addEventListener('click', function () { go(index + 1, true); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(index - 1, true);
      if (e.key === 'ArrowRight') go(index + 1, true);
    });

    /* Keep state in sync when the visitor swipes */
    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var n = Math.round(track.scrollLeft / track.clientWidth);
        if (n !== index && slides[n]) { mark(n); if (timer) restart(); }
      }, 120);
    }, { passive: true });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    mark(0);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
      }, { threshold: 0.35 }).observe(root);
    } else {
      start();
    }
  });

  /* ---------- Amenities jump-nav: highlight the section in view ---------- */
  (function jump() {
    var links = document.querySelectorAll('.k-jump a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var a = map[en.target.id];
        if (a) {
          a.classList.add('is-active');
          var box = a.parentElement;
          box.scrollTo({ left: a.offsetLeft - box.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  })();
})();

/* ============================================================
   Preloader, home hero intro, availability bar
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';

  /* ---------- Home hero intro (plays once the preloader lifts) ---------- */
  function heroIntro() {
    var hero = document.querySelector('.k-hero2');
    if (!hero || !hasGSAP || reduced) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    var vid = hero.querySelector('video');
    if (vid) tl.from(vid, { scale: 1.16, duration: 2.8, ease: 'power2.out' }, 0);
    tl.from(hero.querySelectorAll('[data-h="title"] .line-mask > span'), { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.14 }, 0.1)
      .from(hero.querySelectorAll('[data-h="fade"]'), { y: 28, opacity: 0, duration: 0.95, stagger: 0.1 }, 0.25)
      .from(hero.querySelector('[data-h="bar"]'), { y: 44, opacity: 0, duration: 1.1 }, 0.7)
      .from(hero.querySelector('.k-hero2-side'), { opacity: 0, duration: 1 }, 1.1);
  }

  /* ---------- Preloader ---------- */
  var fired = false;
  function ready() {
    if (fired) return;
    fired = true;
    heroIntro();
    document.dispatchEvent(new CustomEvent('kahuna:ready'));
  }

  var pre = document.getElementById('k-pre');
  if (!pre) {
    ready();
  } else {
    var MIN = reduced ? 600 : 2400;   /* let the logo finish drawing */
    var MAX = 4800;                   /* never hold a slow connection hostage */
    var closed = false;
    var close = function () {
      if (closed) return;
      closed = true;
      pre.classList.add('is-done');
      try { sessionStorage.setItem('kPre', '1'); } catch (e) {}
      setTimeout(ready, 280);
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 1400);
    };
    var whenLoaded = function () {
      setTimeout(close, Math.max(0, MIN - performance.now()));
    };
    if (document.readyState === 'complete') whenLoaded();
    else window.addEventListener('load', whenLoaded);
    setTimeout(close, Math.max(0, MAX - performance.now()));
  }

  /* ---------- Availability bar: sensible default dates ---------- */
  document.querySelectorAll('[data-book]').forEach(function (form) {
    var cin = form.querySelector('[name="checkin"]');
    var cout = form.querySelector('[name="checkout"]');
    if (!cin || !cout) return;
    var iso = function (d) {
      return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    };
    var plus = function (d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
    var today = new Date();
    cin.min = iso(today);
    cin.value = iso(plus(today, 1));
    cout.min = iso(plus(today, 2));
    cout.value = iso(plus(today, 2));
    cin.addEventListener('change', function () {
      if (!cin.value) return;
      var next = plus(new Date(cin.value + 'T00:00:00'), 1);
      cout.min = iso(next);
      if (!cout.value || cout.value <= cin.value) cout.value = iso(next);
    });
  });
})();

/* ============================================================
   Gallery lightbox (room pages)
   ============================================================ */
(function () {
  'use strict';
  var groups = document.querySelectorAll('[data-lightbox]');
  if (!groups.length) return;

  var svg = function (d) { return '<svg class="k-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var box = document.createElement('div');
  box.className = 'k-lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML =
    '<button type="button" data-lb-close aria-label="Close photo viewer">' + svg('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button type="button" data-lb-prev aria-label="Previous photo">' + svg('M19 12H5M11 6l-6 6 6 6') + '</button>' +
    '<img alt="">' +
    '<button type="button" data-lb-next aria-label="Next photo">' + svg('M5 12h14M13 6l6 6-6 6') + '</button>' +
    '<p class="k-lb-cap"></p>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var cap = box.querySelector('.k-lb-cap');
  var items = [], index = 0, opener = null;

  function show(i) {
    index = (i + items.length) % items.length;
    var thumb = items[index].querySelector('img');
    img.src = items[index].getAttribute('data-full');
    img.alt = thumb ? thumb.alt : '';
    cap.textContent = img.alt;
  }
  function open(list, i, from) {
    items = list; opener = from;
    show(i);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    box.querySelector('[data-lb-close]').focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  groups.forEach(function (group) {
    var list = Array.prototype.slice.call(group.querySelectorAll('[data-full]'));
    list.forEach(function (btn, i) {
      btn.addEventListener('click', function () { open(list, i, btn); });
    });
  });

  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.closest('[data-lb-close]')) close();
    else if (e.target.closest('[data-lb-prev]')) show(index - 1);
    else if (e.target.closest('[data-lb-next]')) show(index + 1);
  });
  window.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();

/* ============================================================
   Stay page: scroll reveal + room filter
   ============================================================ */
(function () {
  'use strict';
  document.documentElement.classList.add('k-js');

  var reveals = document.querySelectorAll('.k-reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  var bar = document.querySelector('[data-room-filter]');
  if (!bar) return;
  var buttons = bar.querySelectorAll('button[data-filter]');
  var rows = document.querySelectorAll('[data-room]');
  var count = document.querySelector('[data-room-count]');

  function apply(key) {
    var shown = 0;
    rows.forEach(function (row) {
      var tags = (row.getAttribute('data-room') || '').split(' ');
      var match = key === 'all' || tags.indexOf(key) !== -1;
      row.classList.toggle('is-hidden', !match);
      if (match) {
        row.classList.toggle('is-flip', shown % 2 === 1);   /* keep the zig-zag after filtering */
        row.classList.add('is-in');
        shown++;
      }
    });
    if (count) count.textContent = 'Showing ' + shown + ' of ' + rows.length + (rows.length === 1 ? ' stay' : ' stays');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      apply(btn.getAttribute('data-filter'));
    });
  });
})();
