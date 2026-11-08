(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Mobile menu
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

  // Copy buttons
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var label = b.querySelector('span');
      function ok() {
        b.classList.add('done'); label.textContent = 'Copied';
        setTimeout(function () { b.classList.remove('done'); label.textContent = 'Copy'; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, function () { label.textContent = 'Copy failed'; });
      } else {
        var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t);
        t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(t);
      }
    });
  });

  // Contact form: opens the visitor's email app with the message filled in
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    ['name', 'email', 'message'].forEach(function (id) {
      var el = document.getElementById(id);
      var empty = !el.value.trim();
      el.classList.toggle('invalid', empty);
      if (empty) bad = true;
    });
    if (bad) { status.style.color = '#b00020'; status.textContent = 'Please fill in your name, contact and message.'; return; }
    var subject = 'Website enquiry: ' + document.getElementById('topic').value;
    var body = 'Name: ' + document.getElementById('name').value + '\n' +
               'Contact: ' + document.getElementById('email').value + '\n\n' +
               document.getElementById('message').value;
    window.location.href = 'mailto:skillsconnectnetwork@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    status.style.color = '';
    status.textContent = 'Opening your email app. If nothing opens, write to skillsconnectnetwork@gmail.com.';
  });

  // Scroll reveal with staggering
  var groups = ['.sec-head','.sec-intro','.about-photo','.vm > div','.values li','.step','.pillar','.event','.groups li','.split','.involve-card','.pay-card','.faq details','.note','.contact-list li','.form','.faq-grid > div:first-child p'];
  var targets = [];
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('reveal'); el.style.setProperty('--d', (i % 6) * 90 + 'ms'); targets.push(el);
    });
  });
  var steps = document.querySelector('.steps');
  function countUp(el) {
    var to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = null, dur = 1600;
    if (reduce) { el.textContent = to; return; }
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        if (en.target.classList.contains('step') && steps) steps.style.setProperty('--line', 1);
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, { threshold: .6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
    // active nav link
    var links = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          if (links[en.target.id]) links[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { nio.observe(s); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // Scroll progress, header state, parallax, back to top
  var header = document.querySelector('.site-header');
  var bar = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var gear = document.querySelector('.gear');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 700);
    if (gear && !reduce && y < 900) gear.style.translate = '0 ' + (y * 0.08) + 'px';
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Photo lightbox
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  document.querySelectorAll('.gallery img, .about-photo img').forEach(function (img) {
    img.tabIndex = 0; img.setAttribute('role', 'button');
    function open() { lbImg.src = img.src; lbImg.alt = img.alt; lbCap.textContent = img.alt; lb.showModal(); }
    img.addEventListener('click', open);
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lb-close')) lb.close(); });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
