// Ferren · link page, v2: the gate, the layered world (scroll and pointer parallax, lightning, ash and embers),
// the card with its chain and heart locket, reveals as the page scrolls, link panels with their own details,
// strips that glide on their own, our memories, signatures that write themselves, the Discord picture kept up to
// date and the music bar.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // phones and tablets get a light mode: the content and the scenery stay still while scrolling (no reveals, parallax,
  // lightning, ash, tilt or self-moving strips). Those effects made touch screens flash and stutter.
  const lite = !matchMedia('(pointer: fine)').matches || matchMedia('(max-width: 760px)').matches;
  if (lite) document.documentElement.classList.add('lite');
  const still = reduce || lite; // no ambient motion
  const fine = matchMedia('(pointer: fine)').matches;
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  const LOOKS = Array.from({ length: 12 }, (_, i) => `img/looks/look-${String(i + 1).padStart(2, '0')}.webp`);
  const ART = Array.from({ length: 9 }, (_, i) => `img/art/art-${String(i + 1).padStart(2, '0')}.webp`);
  const PORTFOLIO = 'https://imghostxz.github.io/ferren-portfolio/#work';
  const DISCORD_INVITE = 'yUHukMJtHS';
  // a licensed copy of "So proud" (Cece Natalie) placed in audio/ plays the whole song: list its path here
  // (for example 'audio/so-proud.mp3'). Empty while there is no file, so the page never asks for one that is missing.
  const AUDIO_FILES = [];
  const VOLUME = 35; // 0-100
  const ART_SIZES = [[302, 420], [316, 420], [333, 420], [436, 420], [430, 420], [296, 420], [439, 420], [437, 420], [390, 420]];

  $('#year').textContent = String(new Date().getFullYear());
  if (fine) document.body.classList.add('has-pointer');

  // ---------- music ----------
  // No music for now. If a licensed copy of "So proud" is ever placed in audio/, the bar at the bottom appears and
  // plays it in full, on a loop, starting with the tap that opens the gate. Without the file, nothing plays or shows.
  const music = (() => {
    const np = $('#np');
    const btn = $('#np-sound');
    const audio = $('#np-audio');
    const bar = $('#np-progress');
    const timeEl = $('#np-time');
    let mode = '';
    let wanted = false;
    let playing = false;
    let off = false;
    let hiddenPause = false;
    let loops = 0;
    const fmt = (v) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
    function show(t, d) {
      if (d) bar.style.setProperty('--prog', Math.min(1, t / d).toFixed(4));
      timeEl.textContent = fmt(t);
    }
    function play() { if (mode && wanted && !off) audio.play().catch(() => {}); }
    function useFile(src) {
      mode = 'file';
      audio.src = src;
      audio.volume = VOLUME / 100;
      audio.addEventListener('play', () => { playing = true; np.classList.add('is-playing'); });
      audio.addEventListener('pause', () => { playing = false; np.classList.remove('is-playing'); });
      audio.addEventListener('loadedmetadata', () => show(0, audio.duration));
      audio.addEventListener('timeupdate', () => show(audio.currentTime, audio.duration));
      audio.addEventListener('ended', () => { loops += 1; audio.currentTime = 0; audio.play().catch(() => {}); });
      if (wanted) { np.hidden = false; play(); }
    }
    btn.addEventListener('click', () => {
      if (!playing && !off) { play(); return; }
      off = !off;
      btn.setAttribute('aria-pressed', String(!off));
      btn.setAttribute('aria-label', off ? 'Music off' : 'Music on');
      if (off) audio.pause(); else play();
    });
    document.addEventListener('pointerdown', (e) => { if (mode && wanted && !playing && !off && !btn.contains(e.target)) play(); }, true);
    document.addEventListener('visibilitychange', () => {
      if (!mode) return;
      if (document.hidden && playing) { hiddenPause = true; audio.pause(); }
      else if (!document.hidden && hiddenPause) { hiddenPause = false; play(); }
    });
    Promise.all(AUDIO_FILES.map((src) => fetch(src, { method: 'HEAD', cache: 'no-store' })
      .then((r) => (r.ok && /^audio\//.test(r.headers.get('content-type') || '') ? src : null))
      .catch(() => null)))
      .then((found) => { const src = found.find(Boolean); if (src) useFile(src); });
    return {
      start() { wanted = true; if (mode) { np.hidden = false; play(); } },
      state: () => ({ mode: mode || 'none', playing, off, loops, time: audio.currentTime || 0, duration: audio.duration || 0 }),
    };
  })();
  window.__music = music; // for checking playback from the console

  // ---------- gate: waits for the key pictures, then opens on a tap ----------
  const gate = $('#gate');
  document.body.classList.add('is-locked');
  const KEY = ['img/bg/gate.jpg', 'img/bg/cathedral-soft.jpg', 'img/bg/banner.jpg', 'img/avatar.webp', 'img/game-cover.webp', 'img/us/locket.webp'];
  let loaded = 0;
  const ready = () => gate.classList.add('is-ready');
  KEY.forEach((src) => {
    const im = new Image();
    im.onload = im.onerror = () => { loaded += 1; gate.style.setProperty('--load', (loaded / KEY.length).toFixed(2)); if (loaded === KEY.length) setTimeout(ready, 300); };
    im.src = src;
  });
  setTimeout(ready, 4500);
  let entered = false;
  function enter() {
    if (entered) return;
    entered = true;
    gate.classList.add('is-open');
    document.body.classList.add('is-in');
    document.body.classList.remove('is-locked');
    music.start(); // inside the tap itself
    setTimeout(startReveals, reduce ? 0 : 500);
    setTimeout(() => $('#name').classList.add('is-writing'), reduce ? 0 : 1100);
    setTimeout(() => gate.remove(), reduce ? 600 : 2400);
  }
  gate.addEventListener('click', enter);
  gate.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(); } });
  gate.focus({ preventScroll: true });

  // ---------- reveals: in as they reach the screen, softly out as they leave over the top ----------
  function startReveals() {
    if (lite) { $('.rv').forEach((el) => el.classList.add('is-in')); return; } // shown as they are, nothing to watch
    const io = new IntersectionObserver((entries) => {
      let k = 0;
      entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((en) => {
        const el = en.target;
        if (en.isIntersecting) {
          el.style.setProperty('--d', `${(k += 1) * 90 - 90}ms`);
          el.classList.add('is-in');
          el.classList.remove('is-past');
          setTimeout(() => el.style.setProperty('--d', '0ms'), 1400);
        } else if (en.boundingClientRect.top < 0) {
          el.classList.add('is-past');
        } else {
          el.classList.remove('is-in', 'is-past');
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    $$('.rv').forEach((el) => io.observe(el));
  }

  // ---------- the world moves with the scroll and the pointer ----------
  const card = $('#card');
  const memory = $('#memory');
  let pointer = { x: 0, y: 0, cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
  const world = $('.world');
  const moving = [world, $('.banner')];
  let dirty = true;
  window.addEventListener('scroll', () => { dirty = true; }, { passive: true });
  window.addEventListener('resize', () => { dirty = true; drawChain(performance.now()); coverflow(); }, { passive: true });
  if (fine && !reduce) {
    window.addEventListener('pointermove', (e) => {
      pointer = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5, cx: e.clientX, cy: e.clientY };
      dirty = true;
      const r = card.getBoundingClientRect();
      const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      card.style.setProperty('--rx', inside ? `${(((e.clientY - r.top) / r.height - 0.5) * -2.4).toFixed(2)}deg` : '0deg');
      card.style.setProperty('--ry', inside ? `${(((e.clientX - r.left) / r.width - 0.5) * 4).toFixed(2)}deg` : '0deg');
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }
  // phones that report their tilt without asking (Android) tilt the world too
  if (!fine && !still && 'DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null) return;
      pointer.x = clamp(e.gamma / 45, -0.5, 0.5);
      pointer.y = clamp((e.beta - 45) / 60, -0.5, 0.5);
      dirty = true;
    }, { passive: true });
  }
  function frameWorld() {
    if (!dirty || still) return;
    dirty = false;
    const sy = window.scrollY;
    // written only on the two layers that read them: a change on the root made the browser restyle the whole page
    // every frame, which is what made phones stutter and flash while scrolling
    for (const el of moving) {
      el.style.setProperty('--sy', sy.toFixed(1));
      el.style.setProperty('--px', pointer.x.toFixed(3));
      el.style.setProperty('--py', pointer.y.toFixed(3));
    }
    world.style.setProperty('--lx', `${pointer.cx}px`);
    world.style.setProperty('--ly', `${pointer.cy}px`);
    const p = sy / Math.max(1, root.scrollHeight - window.innerHeight);
    world.style.setProperty('--wings', (smooth(0.28, 0.6, p) * 0.5).toFixed(3));
    const m = memory.getBoundingClientRect();
    memory.style.setProperty('--mp', clamp((m.top + m.height / 2 - window.innerHeight / 2) / window.innerHeight, -1, 1).toFixed(3));
  }

  // a soft, distant glow of lightning over the cathedral, rarely (no strobe)
  (function storm() {
    if (still) return;
    const flash = $('.w-flash');
    (function next() {
      setTimeout(() => {
        if (!document.hidden && entered) {
          flash.classList.remove('is-strike');
          void flash.offsetWidth;
          flash.classList.add('is-strike');
        }
        next();
      }, 24000 + Math.random() * 18000);
    }());
  }());

  // ---------- the chain over the banner, and the heart locket hanging from it ----------
  const chain = $('#chain');
  const locket = $('#locket');
  const LINKS = 26;
  for (let i = 0; i < LINKS; i++) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    e.setAttribute('rx', '6.2');
    e.setAttribute('ry', i % 2 ? '1.3' : '3.4');
    if (i % 2) e.setAttribute('class', 'link-side');
    chain.append(e);
  }
  function drawChain(t) {
    const w = chain.clientWidth;
    const x0 = 22;
    const x1 = w - 22;
    const y0 = 10;
    const sway = still ? 0 : Math.sin(t / 1600) * 8 + pointer.x * 26;
    const cx = w / 2 + sway;
    const cy = 128 + (still ? 0 : Math.sin(t / 2100) * 4);
    const at = (u) => ({
      x: (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * x1,
      y: (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * y0,
      a: Math.atan2(2 * (1 - u) * (cy - y0) + 2 * u * (y0 - cy), 2 * (1 - u) * (cx - x0) + 2 * u * (x1 - cx)) * 180 / Math.PI,
    });
    [...chain.children].forEach((e, i) => {
      const q = at((i + 0.5) / LINKS);
      e.setAttribute('cx', q.x.toFixed(1));
      e.setAttribute('cy', q.y.toFixed(1));
      e.setAttribute('transform', `rotate(${q.a.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
    });
    const h = at(0.165);
    locket.style.setProperty('--lk-x', `${h.x.toFixed(1)}px`);
    locket.style.setProperty('--lk-y', `${(h.y + 6).toFixed(1)}px`);
    locket.style.setProperty('--lk-r', `${(still ? 0 : Math.sin(t / 900) * 5 - pointer.x * 10).toFixed(2)}deg`);
  }
  drawChain(0);

  // one animation loop for the world and the chain; it rests when nothing moves on screen
  function loop(t) {
    frameWorld();
    if (!still && window.scrollY < 600) drawChain(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- viewers ----------
  let opener = null;
  function openViewer(d) {
    if (d.open) return;
    opener = document.activeElement;
    d.showModal();
    document.body.classList.add('is-locked');
  }
  $$('dialog').forEach((d) => d.addEventListener('close', () => {
    document.body.classList.remove('is-locked');
    if (opener) opener.focus({ preventScroll: true });
  }));

  // ---------- memories: locket and portrait open full size ----------
  const keep = $('#keep');
  const keepImg = $('#keep-img');
  function openKeep(src, alt) {
    keepImg.src = src;
    keepImg.alt = alt;
    openViewer(keep);
  }
  $('.look-close', keep).addEventListener('click', () => keep.close());
  keep.addEventListener('click', (e) => { if (e.target === keep) keep.close(); });
  keep.addEventListener('close', () => locket.classList.remove('is-open'));
  locket.addEventListener('click', () => {
    locket.classList.add('is-open');
    setTimeout(() => openKeep('img/us/locket.webp', 'Our Roblox skins under a glowing heart'), reduce ? 0 : 650);
  });
  $('.memory-frame').addEventListener('click', () => openKeep('img/us/portrait.webp', 'Our Roblox skins together, horns and a glowing heart above us'));

  // ---------- profile details ----------
  const avatar = $('#avatar');
  avatar.addEventListener('click', () => {
    avatar.classList.remove('is-pop');
    void avatar.offsetWidth;
    avatar.classList.add('is-pop');
    burst(avatar);
  });
  $$('.badge').forEach((b) => b.addEventListener('click', () => {
    b.classList.add('show-tip');
    setTimeout(() => b.classList.remove('show-tip'), 1600);
  }));

  // her Discord picture, kept up to date by .github/workflows/discord-avatar.yml; the bundled one stays as fallback
  fetch(`data/avatar.json?t=${Date.now()}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.url) return;
      const im = new Image();
      im.onload = () => { $('#avatar-img').src = d.url; };
      im.src = d.url;
    })
    .catch(() => {});

  // ---------- panels: light, ripple, a magnetic arrow and a small tilt ----------
  $$('.panel').forEach((p) => {
    const go = $('.panel-go', p);
    const tiltTarget = p.closest('.group') || p;
    p.addEventListener('pointermove', (e) => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', `${e.clientX - r.left}px`);
      p.style.setProperty('--my', `${e.clientY - r.top}px`);
      if (e.pointerType !== 'mouse' || reduce) return;
      const g = go.getBoundingClientRect();
      go.style.setProperty('--ax', `${clamp((e.clientX - (g.left + g.width / 2)) * 0.12, -7, 7).toFixed(1)}px`);
      go.style.setProperty('--ay', `${clamp((e.clientY - (g.top + g.height / 2)) * 0.12, -7, 7).toFixed(1)}px`);
      const t = tiltTarget.getBoundingClientRect();
      tiltTarget.style.setProperty('--tx', `${(((e.clientY - t.top) / t.height - 0.5) * -3).toFixed(2)}deg`);
      tiltTarget.style.setProperty('--ty', `${(((e.clientX - t.left) / t.width - 0.5) * 4).toFixed(2)}deg`);
      if (p.classList.contains('panel-game')) {
        p.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width - 0.5) * -14).toFixed(1)}px`);
        p.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height - 0.5) * -8).toFixed(1)}px`);
      }
    });
    p.addEventListener('pointerleave', () => {
      go.style.setProperty('--ax', '0px');
      go.style.setProperty('--ay', '0px');
      tiltTarget.style.setProperty('--tx', '0deg');
      tiltTarget.style.setProperty('--ty', '0deg');
      p.style.setProperty('--gx', '0px');
      p.style.setProperty('--gy', '0px');
    });
    p.addEventListener('pointerdown', (e) => {
      if (still) return;
      const r = p.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      p.append(dot);
      setTimeout(() => dot.remove(), 750);
    });
  });

  // ---------- strips: they glide sideways on their own; a touch, a drag or the mouse over them takes over ----------
  const looks = $('#looks');
  const art = $('#art');
  for (const clone of [false, true]) {
    LOOKS.forEach((src, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'strip-item';
      b.style.setProperty('--k', k);
      b.innerHTML = `<img src="${src}" alt="${clone ? '' : 'Q-CORE outfit by Ferren'}" width="98" height="156" loading="lazy" decoding="async" draggable="false"><span class="strip-sig" aria-hidden="true">Ferren</span>`;
      if (clone) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); } else b.setAttribute('aria-label', `Open Q-CORE outfit ${k + 1}`);
      b.addEventListener('click', () => openLook(k));
      looks.append(b);
    });
    ART.forEach((src, k) => {
      const a = document.createElement('a');
      const [w, h] = ART_SIZES[k];
      a.className = 'strip-item';
      a.href = PORTFOLIO;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.setProperty('--k', k);
      a.style.setProperty('--tilt', `${[-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5, -1][k % 9]}deg`);
      a.innerHTML = `<img src="${src}" alt="${clone ? '' : 'Artwork by Ferren'}" width="${Math.round(w * 116 / h)}" height="116" loading="lazy" decoding="async" draggable="false">`;
      if (clone) { a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); } else a.setAttribute('aria-label', `Artwork ${k + 1}, open the portfolio`);
      art.append(a);
    });
  }

  // the outfits turn toward the middle like a carousel (positions are measured once, not on every frame)
  const cf = { items: [], centers: [], mid: 0 };
  function measureLooks() {
    cf.items = [...looks.children];
    const base = cf.items[0].offsetLeft;
    cf.centers = cf.items.map((it) => it.offsetLeft - base + 16 + it.offsetWidth / 2);
    cf.mid = looks.clientWidth / 2;
  }
  function coverflow() {
    if (still || !cf.items.length) return;
    const sl = looks.scrollLeft;
    for (let i = 0; i < cf.items.length; i++) {
      const o = clamp((cf.centers[i] - sl - cf.mid) / cf.mid, -1.4, 1.4);
      cf.items[i].style.setProperty('--cf', `${(o * -26).toFixed(1)}deg`);
      cf.items[i].style.setProperty('--cs', (1 - Math.min(Math.abs(o), 1) * 0.12).toFixed(3));
    }
  }
  measureLooks();
  coverflow();
  looks.addEventListener('scroll', coverflow, { passive: true });

  function glide(el, speed) {
    const half = el.children.length / 2;
    let loopW = 0;
    let pos = 0;
    let holdUntil = 0;
    let hover = false;
    let visible = false;
    let last = 0;
    const measure = () => { loopW = el.children[half].offsetLeft - el.children[0].offsetLeft; };
    measure();
    if (speed < 0) { pos = loopW; el.scrollLeft = pos; }
    window.addEventListener('resize', () => { measure(); if (el === looks) { measureLooks(); coverflow(); } });
    const hold = () => { holdUntil = performance.now() + 2600; };
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
    el.addEventListener('pointerleave', () => { hover = false; hold(); });
    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach((t) => el.addEventListener(t, hold, { passive: true }));
    el.addEventListener('scroll', () => {
      if (!loopW) return;
      // the strip is doubled, so jumping back by one length is invisible: it can be swiped forever both ways
      if (el.scrollLeft >= loopW + 1) el.scrollLeft -= loopW;
      else if (el.scrollLeft < 1 && performance.now() < holdUntil) el.scrollLeft += loopW;
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
    }, { passive: true });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(el);
    (function step(t) {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (!still && visible && !hover && t > holdUntil && !document.hidden && loopW) {
        pos += speed * dt;
        if (pos >= loopW) pos -= loopW;
        if (pos < 0) pos += loopW;
        el.scrollLeft = pos;
      }
      requestAnimationFrame(step);
    }(0));
  }
  glide(looks, 22);
  glide(art, -16);

  // mouse drag with a glide; touch screens keep their own swipe
  function dragStrip(el) {
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    let lastX = 0;
    let v = 0;
    let raf = 0;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = 0;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      v = 0;
      cancelAnimationFrame(raf);
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) el.classList.add('is-drag');
      el.scrollLeft = startLeft - dx;
      v = e.clientX - lastX;
      lastX = e.clientX;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      (function coast() {
        v *= 0.94;
        el.scrollLeft -= v;
        if (Math.abs(v) > 0.4 && !still) raf = requestAnimationFrame(coast);
        else el.classList.remove('is-drag');
      }());
    });
    el.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  dragStrip(looks);
  dragStrip(art);

  // ---------- outfit viewer ----------
  const look = $('#look');
  const lookImg = $('#look-img');
  let current = 0;
  function showLook(k) {
    current = (k + LOOKS.length) % LOOKS.length;
    lookImg.src = LOOKS[current];
    lookImg.alt = `Q-CORE outfit by Ferren, ${current + 1} of ${LOOKS.length}`;
  }
  function openLook(k) {
    showLook(k);
    openViewer(look);
  }
  $('.look-close', look).addEventListener('click', () => look.close());
  $('.look-prev').addEventListener('click', () => showLook(current - 1));
  $('.look-next').addEventListener('click', () => showLook(current + 1));
  look.addEventListener('click', (e) => { if (e.target === look) look.close(); });
  document.addEventListener('keydown', (e) => {
    if (!look.open) return;
    if (e.key === 'ArrowLeft') showLook(current - 1);
    if (e.key === 'ArrowRight') showLook(current + 1);
  });
  let sx = null;
  look.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  look.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showLook(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  // ---------- the ending: Ferren's signature writes itself once it is on screen ----------
  const vow = $('#vow');
  const vowIo = new IntersectionObserver(([en]) => {
    if (en.isIntersecting && entered) {
      $('.sig-foot', vow).classList.add('is-writing');
      vowIo.disconnect();
    }
  }, { threshold: 0.4 });
  vowIo.observe(vow);

  // each card's border light starts at a different point
  $$('.links > .panel, .group').forEach((el, i) => el.style.setProperty('--n', i));

  // ---------- live Discord numbers ----------
  fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || typeof d.approximate_member_count !== 'number') return;
      const live = $('#discord-live');
      const all = d.approximate_member_count;
      $('span', live).textContent = `${d.approximate_presence_count} online · ${all} ${all === 1 ? 'member' : 'members'}`;
      live.hidden = false;
    })
    .catch(() => {});

  // ---------- ash falling, embers rising, faint rain, sparks from the picture ----------
  const sparks = [];
  function burst(el) {
    if (still) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 170;
      sparks.push({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 1, r: 1 + Math.random() * 2 });
    }
  }
  (function dust() {
    const canvas = $('#dust');
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let parts = [];
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.min(1, (w * h) / (1280 * 800)) * 0.6 + 0.4;
      parts = [];
      const add = (n, make) => { for (let i = 0; i < Math.round(n * scale); i++) parts.push(make()); };
      add(50, () => ({ kind: 'ash', x: Math.random() * w, y: Math.random() * h, z: 0.3 + Math.random() * 0.7, r: 0.6 + Math.random() * 1.8, seed: Math.random() * 99 }));
      add(32, () => ({ kind: 'ember', x: Math.random() * w, y: Math.random() * h, z: 0.4 + Math.random() * 0.6, r: 0.7 + Math.random() * 1.6, seed: Math.random() * 99 }));
      add(36, () => ({ kind: 'rain', x: Math.random() * w, y: Math.random() * h, z: 0.3 + Math.random() * 0.7, len: 10 + Math.random() * 26, seed: Math.random() * 99 }));
    }
    let last = 0;
    function frame(t) {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.033);
      last = t;
      ctx.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      for (const p of parts) {
        const ox = -pointer.x * 30 * p.z;
        const oy = -pointer.y * 18 * p.z - ((sy * 0.12 * p.z) % h);
        let y = p.y + oy;
        if (y < -40) y += h + 60;
        if (p.kind === 'ash') {
          p.y += (14 + 26 * p.z) * dt;
          p.x += Math.sin(t / 1400 + p.seed) * 10 * dt;
          if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
          ctx.fillStyle = `rgba(226, 220, 214, ${0.18 + 0.4 * p.z})`;
          ctx.beginPath(); ctx.arc(p.x + ox, y, p.r * p.z + 0.3, 0, Math.PI * 2); ctx.fill();
        } else if (p.kind === 'ember') {
          p.y -= (16 + 34 * p.z) * dt;
          p.x += Math.sin(t / 900 + p.seed) * 14 * dt;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          const f = 0.55 + Math.sin(t / 160 + p.seed) * 0.3;
          ctx.fillStyle = `rgba(214, 96, 92, ${0.55 * f * p.z + 0.1})`;
          ctx.beginPath(); ctx.arc(p.x + ox, y, p.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(192, 70, 80, ${0.08 * f})`;
          ctx.beginPath(); ctx.arc(p.x + ox, y, p.r * 5, 0, Math.PI * 2); ctx.fill();
        } else {
          p.y += (380 + 420 * p.z) * dt;
          if (p.y > h + 30) { p.y = -40; p.x = Math.random() * w; }
          ctx.strokeStyle = `rgba(210, 206, 220, ${0.05 + 0.1 * p.z})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x + ox, y); ctx.lineTo(p.x + ox - 2, y + p.len * p.z); ctx.stroke();
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt * 1.4;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 120 * dt;
        ctx.fillStyle = `rgba(238, 200, 196, ${s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    let lastFrame = 0;
    let running = true;
    function tick(t) {
      if (!running) return;
      if (t - lastFrame > 30 || sparks.length) { frame(t); lastFrame = t; }
      requestAnimationFrame(tick);
    }
    size();
    window.addEventListener('resize', () => { size(); if (still) frame(0); });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden && !still;
      if (running) { last = 0; requestAnimationFrame(tick); }
    });
    if (still) frame(0); else requestAnimationFrame(tick);
  }());
})();
