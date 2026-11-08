/* v3 UPGRADE: preloader, headline split, hero slideshow + parallax, spotlight, magnetic buttons,
   cursor glow, training filters, lightbox gallery navigation. Runs after main.js. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  // 1. Preloader (always hides, even if load is slow)
  var pre = document.getElementById('preloader');
  function ready() { if (pre) pre.classList.add('done'); document.body.classList.add('ready'); }
  if (document.readyState === 'complete') setTimeout(ready, 400);
  else addEventListener('load', function () { setTimeout(ready, 400); });
  setTimeout(ready, 2500);

  // 2. Headline: split into words so each one slides up
  var h1 = document.querySelector('.hero-copy h1');
  if (h1 && !reduce) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.textContent = '';
    words.forEach(function (w, i) {
      var box = document.createElement('span'); box.className = 'w';
      var s = document.createElement('span'); s.textContent = w; s.style.animationDelay = (0.45 + i * 0.05) + 's';
      box.appendChild(s); h1.appendChild(box); h1.appendChild(document.createTextNode(' '));
    });
  }

  // 3. Hero photo slideshow (caption follows the photo)
  var slides = [].slice.call(document.querySelectorAll('.hero-photo img'));
  var cap = document.querySelector('.hero-caption');
  if (slides.length) {
    var k = 0; slides[0].classList.add('on');
    if (slides.length > 1 && !reduce) setInterval(function () {
      slides[k].classList.remove('on'); k = (k + 1) % slides.length; slides[k].classList.add('on');
      if (cap && slides[k].dataset.cap) cap.textContent = slides[k].dataset.cap;
    }, 4500);
  }

  // 4. Hero mouse parallax (uses the CSS `translate` property so it never fights other animations)
  var art = document.querySelector('.hero-art');
  if (art && fine && !reduce) {
    var layers = [['.hero-photo', 10], ['.chip.c1', 26], ['.chip.c2', -22], ['.chip.c3', 18], ['.hero-caption', -8]]
      .map(function (l) { return { el: art.querySelector(l[0]), d: l[1] }; });
    art.addEventListener('mousemove', function (e) {
      var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(function (l) { if (l.el) l.el.style.translate = (x * l.d) + 'px ' + (y * l.d) + 'px'; });
    });
    art.addEventListener('mouseleave', function () { layers.forEach(function (l) { if (l.el) l.el.style.translate = ''; }); });
  }

  // 5. Spotlight follows the cursor on cards
  document.querySelectorAll('.values li, .involve-card, .pay-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // 6. Magnetic buttons
  if (fine && !reduce) document.querySelectorAll('.btn, .to-top').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .22) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3) + 'px';
    });
    b.addEventListener('mouseleave', function () { b.style.translate = ''; });
  });

  // 7. Soft cursor glow
  if (fine && !reduce) {
    var g = document.createElement('div'); g.className = 'cursor-glow'; document.body.appendChild(g);
    var gx = 0, gy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; g.classList.add('on'); }, { passive: true });
    (function loop() { gx += (tx - gx) * .12; gy += (ty - gy) * .12; g.style.translate = gx + 'px ' + gy + 'px'; requestAnimationFrame(loop); })();
  }

  // 8. Training filters
  var bar = document.querySelector('.filters');
  if (bar) bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    document.querySelectorAll('.event').forEach(function (ev) { ev.hidden = !(b.dataset.f === 'all' || ev.dataset.cat === b.dataset.f); });
  });

  // 9. Lightbox: previous/next arrows, keyboard, swipe, counter
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  var list = [].slice.call(document.querySelectorAll('.gallery img, .about-photo img')), idx = 0;
  function caption() { lbCap.textContent = list[idx].alt + '  (' + (idx + 1) + ' / ' + list.length + ')'; }
  function show(i) {
    idx = (i + list.length) % list.length;
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = list[idx].src; lbImg.alt = list[idx].alt; caption();
  }
  ['prev', 'next'].forEach(function (d) {
    var b = document.createElement('button'); b.className = 'lb-nav ' + d; b.setAttribute('aria-label', d === 'prev' ? 'Previous photo' : 'Next photo');
    b.innerHTML = '<svg class="ic"><use href="#i-arrow"/></svg>';
    b.addEventListener('click', function (e) { e.stopPropagation(); show(idx + (d === 'prev' ? -1 : 1)); });
    lb.appendChild(b);
  });
  list.forEach(function (im, i) { im.addEventListener('click', function () { idx = i; caption(); }); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
})();

/* v3.1: contact form sends straight to the organisation's inbox via Web3Forms (set data-web3forms-key in index.html).
   With no key set, main.js falls back to opening the visitor's email app. */
(function () {
  var form = document.getElementById('contactForm'); if (!form) return;
  var key = form.getAttribute('data-web3forms-key'); if (!key) return;
  var status = document.getElementById('formStatus'), btn = form.querySelector('button[type=submit]');
  form.addEventListener('submit', function (e) {
    e.preventDefault(); e.stopImmediatePropagation();
    var bad = false;
    ['name', 'email', 'message'].forEach(function (id) {
      var el = document.getElementById(id), empty = !el.value.trim(); el.classList.toggle('invalid', empty); if (empty) bad = true;
    });
    if (bad) { status.style.color = '#b00020'; status.textContent = 'Please fill in your name, contact and message.'; return; }
    btn.disabled = true; status.style.color = ''; status.textContent = 'Sending...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key, subject: 'Website enquiry: ' + document.getElementById('topic').value, from_name: 'SCN Website',
        name: document.getElementById('name').value, contact: document.getElementById('email').value,
        message: document.getElementById('message').value, botcheck: form.botcheck.checked ? 'yes' : ''
      })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.success) throw new Error();
      status.textContent = 'Thank you! Your message has been sent. We will reply soon.'; form.reset();
    }).catch(function () {
      status.style.color = '#b00020'; status.textContent = 'Could not send. Please WhatsApp us or email skillsconnectnetwork@gmail.com.';
    }).then(function () { btn.disabled = false; });
  }, true);
})();
