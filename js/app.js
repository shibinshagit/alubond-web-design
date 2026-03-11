/* =====================================================
   ALUBOND — Main JS
   Apple-style scroll site: canvas frame scrub + white sections
   ===================================================== */

/* =================== CONSTANTS =================== */
const FRAME_COUNT = 241;
const FRAME_SPEED = 2.5;   // animation completes at p≈0.40 of 160vh ≈ 64vh scroll
const IMAGE_SCALE = 0.80;
const FRAME_PATH  = (n) => `/assets/frames/frame_${String(n).padStart(4,'0')}.webp`;

/* =================== DOM =================== */
const canvas          = document.getElementById('canvas');
const ctx             = canvas.getContext('2d');
const canvasWrap      = document.getElementById('canvas-wrap');
const loader          = document.getElementById('loader');
const loaderFill      = document.getElementById('loader-fill');
const loaderPct       = document.getElementById('loader-percent');
const heroEl          = document.querySelector('.hero');
const dissectionWrap  = document.getElementById('dissection-wrap');
const siteHeader      = document.getElementById('site-header');

/* =================== STATE =================== */
const frames     = new Array(FRAME_COUNT).fill(null);
let loadedCount  = 0;
let currentFrame = 0;
let bgColor      = '#FFFFFF';
let rafPending   = false;

/* =================== CANVAS =================== */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  drawFrame(currentFrame);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function sampleBg(img) {
  try {
    const off = document.createElement('canvas');
    off.width = 4; off.height = 4;
    const c = off.getContext('2d');
    c.drawImage(img, 0, 0, 4, 4);
    const d = c.getImageData(0,0,1,1).data;
    bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch(_) {}
}

function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = window.innerWidth, ch = window.innerHeight;
  const iw = img.naturalWidth,  ih = img.naturalHeight;
  const scale = Math.max(cw/iw, ch/ih) * IMAGE_SCALE;
  const dw = iw * scale, dh = ih * scale;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw-dw)/2, (ch-dh)/2, dw, dh);
}

function scheduleFrame(index) {
  if (index === currentFrame) return;
  currentFrame = index;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => { drawFrame(currentFrame); rafPending = false; });
  }
}

/* =================== PRELOAD =================== */
function loadFrame(index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      frames[index] = img;
      loadedCount++;
      const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      loaderFill.style.width = pct + '%';
      loaderPct.textContent  = pct + '%';
      resolve(img);
    };
    img.onerror = () => { loadedCount++; resolve(null); };
    img.src = FRAME_PATH(index + 1);
  });
}

async function preloadFrames() {
  await Promise.all(Array.from({length:24}, (_,i) => loadFrame(i)));
  drawFrame(0);
  await Promise.all(Array.from({length:FRAME_COUNT-24}, (_,i) => loadFrame(i+24)));
  hideLoader();
}

function hideLoader() {
  gsap.to(loader, {
    opacity: 0, duration: 0.65, ease: 'power2.out',
    onComplete: () => { loader.style.display = 'none'; initHeroAnimation(); }
  });
}

/* =================== LENIS =================== */
function initLenis() {
  const lenis = new window.Lenis({
    duration: 0.68,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10*t)),
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* =================== HEADER MODE =================== */
function initHeader() {
  // Hero is full-bleed photo → frosted light header with black text
  siteHeader.classList.add('light-mode');

  // Canvas dissection has white bg — keep light-mode (black text) throughout

  // Re-enter dark on footer
  ScrollTrigger.create({
    trigger: '#footer',
    start: 'top 52px',
    onEnter:     () => { siteHeader.classList.replace('light-mode', 'dark-mode'); },
    onLeaveBack: () => { siteHeader.classList.replace('dark-mode', 'light-mode'); },
  });
}

/* =================== HERO ENTRANCE =================== */
function initHeroAnimation() {
  const eyebrow = document.querySelector('.hero-eyebrow');
  const words   = document.querySelectorAll('.hero-heading .word-inner');
  const sub     = document.querySelector('.hero-sub');
  const cta     = document.querySelector('.hero-cta');
  const stats   = document.querySelectorAll('.hero-stat');

  gsap.timeline({ delay: 0.1 })
    .fromTo(eyebrow, {y:12, opacity:0}, {y:0, opacity:1, duration:0.55, ease:'power3.out'})
    .fromTo(words,   {y:'110%', opacity:0}, {y:'0%', opacity:1, stagger:0.09, duration:0.8, ease:'power4.out'}, '-=0.2')
    .fromTo(sub,     {y:14, opacity:0}, {y:0, opacity:1, duration:0.6, ease:'power3.out'}, '-=0.4')
    .fromTo(cta,     {y:10, opacity:0}, {y:0, opacity:1, duration:0.5, ease:'power3.out'}, '-=0.38')
    .fromTo(stats,   {y:8,  opacity:0}, {y:0, opacity:1, stagger:0.07, duration:0.45, ease:'power3.out'}, '-=0.3');
}

/* =================== HERO SLIDER =================== */
function initHeroSlider() {
  const slides    = Array.from(document.querySelectorAll('.hs-slide'));
  const dotsWrap  = document.getElementById('hs-dots');
  const counterEl = document.getElementById('hs-cur');
  const progFill  = document.getElementById('hs-prog');
  const sliderEl  = document.getElementById('hero-slider');

  if (!slides.length) return;

  const DURATION = 3000; // ms per slide
  let current    = 0;
  let timer      = null;
  let paused     = false;
  let progTween  = null;

  // Build dot indicators
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'hs-dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsWrap.querySelectorAll('.hs-dot'));
  }

  function updateCounter(index) {
    if (counterEl) counterEl.textContent = String(index + 1).padStart(2, '0');
  }

  function startProgress() {
    if (progTween) progTween.kill();
    gsap.set(progFill, { scaleX: 0 });
    progTween = gsap.to(progFill, {
      scaleX: 1,
      duration: DURATION / 1000,
      ease: 'none',
      transformOrigin: 'left center'
    });
  }

  function kenBurns(slide) {
    const img = slide.querySelector('img');
    if (!img) return;
    gsap.fromTo(img,
      { scale: 1.08 },
      { scale: 1, duration: DURATION / 1000, ease: 'power1.out' }
    );
  }

  function activateSlide(index) {
    const dots = getDots();
    const prev = slides[current];

    // Mark leaving
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    setTimeout(() => prev.classList.remove('is-leaving'), 800);

    current = index;
    const next = slides[current];
    next.classList.add('is-active');

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));

    updateCounter(current);
    startProgress();
    kenBurns(next);
  }

  function goTo(index) {
    if (index === current) return;
    activateSlide((index + slides.length) % slides.length);
    resetTimer();
  }

  function advance() {
    activateSlide((current + 1) % slides.length);
  }

  function resetTimer() {
    clearInterval(timer);
    if (!paused) timer = setInterval(advance, DURATION);
  }

  // Pause on hover
  sliderEl.addEventListener('mouseenter', () => {
    paused = true;
    clearInterval(timer);
    if (progTween) progTween.pause();
  });
  sliderEl.addEventListener('mouseleave', () => {
    paused = false;
    if (progTween) progTween.play();
    resetTimer();
  });

  // Init first slide
  slides[0].classList.add('is-active');
  updateCounter(0);
  startProgress();
  kenBurns(slides[0]);
  timer = setInterval(advance, DURATION);
}

/* =================== DISSECTION =================== */
function initDissection() {
  canvasWrap.style.clipPath = 'none';
  canvasWrap.style.opacity  = '0';

  const layerLabels     = document.getElementById('layer-labels');
  const layerEls        = layerLabels ? [...layerLabels.querySelectorAll('.layer-label')] : [];
  const philSticky      = document.getElementById('phil-sticky');

  // Info boxes — 4 boxes that appear/disappear during dissection
  const infoBoxEls = [0,1,2,3].map(i => document.getElementById(`dsct-box-${i}`));
  // [enterStart, enterEnd, exitStart, exitEnd]
  const infoRanges = [
    [0.01, 0.06, 0.09, 0.13],
    [0.12, 0.17, 0.20, 0.24],
    [0.23, 0.28, 0.31, 0.35],
    [0.33, 0.38, 0.40, 0.44],
  ];

  // 160vh wrap · FRAME_SPEED=2.5 → animation completes at p≈0.40 (~64vh)
  // Labels spread across animation zone; crossfade + philosophy overlap cleanly after
  const layerThresholds = [0.04, 0.12, 0.20, 0.28, 0.36];

  // Hero → canvas crossfade: snappy half-viewport overlap
  ScrollTrigger.create({
    trigger: dissectionWrap,
    start: 'top bottom',
    end:   'top top',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;
      heroEl.style.opacity     = Math.max(0, 1 - p * 2.5);
      canvasWrap.style.opacity = Math.min(1, p * 2.5);
    }
  });

  // Main scrub — tight, every scroll px does something meaningful
  ScrollTrigger.create({
    trigger: dissectionWrap,
    start: 'top top',
    end:   'bottom bottom',
    scrub: 0.45,   // tighter scrub for more responsive feel
    onUpdate: (self) => {
      const p = self.progress;

      // ── Frame scrub (0 → p≈0.357) ────────────────────────────
      const accelerated = Math.min(p * FRAME_SPEED, 1);
      scheduleFrame(Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1));

      // ── Canvas + labels fade OUT (p 0.42 → 0.54) ─────────────
      const canvasFade = p < 0.42 ? 1 : Math.max(0, 1 - (p - 0.42) / 0.12);
      canvasWrap.style.opacity = canvasFade;
      if (layerLabels) layerLabels.style.opacity = canvasFade;

      // Layer labels: appear during animation, disappear with canvas
      layerEls.forEach((el, i) => {
        el.classList.toggle('ll-visible', p >= layerThresholds[i] && canvasFade > 0);
      });

      // ── Philosophy fades IN (p 0.48 → 0.58) — overlaps canvas fade ──
      if (philSticky) {
        const philFade = p < 0.48 ? 0 : Math.min(1, (p - 0.48) / 0.10);
        philSticky.style.opacity = philFade;
        philSticky.style.pointerEvents = philFade > 0.1 ? 'auto' : 'none';
      }

      // ── Info boxes: rise in, hold, exit upward ─────────────────────
      infoBoxEls.forEach((el, i) => {
        if (!el) return;
        const [e0, e1, x0, x1] = infoRanges[i];
        let opacity, ty;
        if (p <= e0 || p >= x1) {
          opacity = 0;
          ty = p <= e0 ? 70 : -40;
        } else if (p < e1) {
          const t = (p - e0) / (e1 - e0);
          opacity = t;
          ty = (1 - t) * 70;
        } else if (p < x0) {
          opacity = 1;
          ty = 0;
        } else {
          const t = (p - x0) / (x1 - x0);
          opacity = 1 - t;
          ty = -t * 40;
        }
        el.style.opacity = opacity;
        el.style.transform = `translateY(${ty}px)`;
      });
    }
  });
}


/* =================== FIRE RATING SECTION =================== */
function initFireSection() {
  const col1 = document.querySelectorAll('.fire-vid-text > *');
  const badges = document.querySelectorAll('.fire-badge');

  gsap.fromTo(col1,
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08, duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: '.fire-section', start: 'top 90%' }
    }
  );
  gsap.to(badges, {
    y: 0, opacity: 1, stagger: 0.06, duration: 0.55, ease: 'power3.out',
    scrollTrigger: { trigger: '.fire-badge-grid', start: 'top 92%' }
  });
}

/* =================== FINISHES (video + swatches) =================== */
function initFinishes() {
  const vidWood  = document.getElementById('vid-wood');

  const catDescs = {
    solid:     'Timeless solids and premium metallics — perfect for modern facades and corporate interiors.',
    wooden:    'Authentic wood grains — oak, walnut, teak, and more — bringing natural warmth to architectural surfaces.',
    stone:     'Marble, granite, slate, and limestone textures that capture the depth of natural stone.',
    patina:    'Aged copper, verdigris, and antique finishes that evolve with character over time.',
    concrete:  'Industrial-grade concrete looks — from raw and textured to polished and refined.',
    sand:      'Desert-inspired sand and earth tones — terracotta, dune, and organic clay textures.',
    brushed:   'Precision-brushed metals and anodised finishes for a sophisticated industrial aesthetic.',
    prismatic: 'Light-refracting prismatic and iridescent effects for landmark facade statements.'
  };

  const swatchGroups = document.querySelectorAll('.swatch-group');
  const nameEl       = document.getElementById('swatch-name');
  const descEl       = document.getElementById('finishes-cat-desc');

  function revealSwatches(cat) {
    const sw = document.querySelectorAll(`.swatch-group[data-category="${cat}"] .swatch`);
    gsap.fromTo(sw,
      { opacity: 0, scale: 0.82, y: 10 },
      { opacity: 1, scale: 1, y: 0, stagger: 0.045, duration: 0.45, ease: 'power3.out' }
    );
  }

  // Reveal on scroll enter
  ScrollTrigger.create({
    trigger: '.finishes-swatches-zone',
    start: 'top 92%',
    once: true,
    onEnter: () => revealSwatches('wooden')
  });

  // Tab / video switching
  document.querySelectorAll('.fvtab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      const vid = tab.dataset.vid;

      // Tab UI
      document.querySelectorAll('.fvtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Switch video
      vidWood.classList.remove('active');
      if (vid === 'vid-wood') {
        vidWood.classList.add('active');
        if (vidWood.paused) vidWood.play();
      }

      // Switch swatch group
      swatchGroups.forEach(g => { g.classList.remove('active'); g.style.display = 'none'; });
      const tgt = document.querySelector(`.swatch-group[data-category="${cat}"]`);
      if (tgt) { tgt.classList.add('active'); tgt.style.display = 'flex'; }

      // Update desc
      descEl.textContent = catDescs[cat] || '';
      nameEl.textContent = '\u00a0';
      revealSwatches(cat);
    });
  });

  // Swatch hover
  document.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('mouseenter', () => { nameEl.textContent = sw.dataset.name || ''; });
    sw.addEventListener('mouseleave', () => { nameEl.textContent = '\u00a0'; });
  });

  // Animate finishes-vid-text on scroll
  const vidText = document.querySelectorAll('.finishes-vid-eyebrow, .finishes-vid-heading, .finishes-vid-tabs');
  gsap.fromTo(vidText,
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.finishes-video-zone', start: 'top 88%' }
    }
  );
}

/* =================== APPLICATIONS =================== */
function initApplications() {
  const header  = document.querySelectorAll('.applications-header > *');
  const cards   = document.querySelectorAll('.app-card');
  const outer   = document.getElementById('app-track-outer');
  const progBar = document.getElementById('app-progress-bar');

  gsap.fromTo(header,
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.applications-section', start: 'top 90%' }
    }
  );

  gsap.to(cards, {
    y: 0, opacity: 1, stagger: 0.08, duration: 0.65, ease: 'power3.out',
    scrollTrigger: { trigger: '.app-track-outer', start: 'top 92%' }
  });

  // Drag scroll
  let isDragging = false, startX = 0, scrollLeft = 0;

  outer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - outer.offsetLeft;
    scrollLeft = outer.scrollLeft;
    outer.style.userSelect = 'none';
  });
  window.addEventListener('mouseup', () => { isDragging = false; outer.style.userSelect = ''; });
  outer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    outer.scrollLeft = scrollLeft - (e.pageX - outer.offsetLeft - startX) * 1.5;
    updateProg();
  });
  outer.addEventListener('scroll', updateProg);

  function updateProg() {
    const max = outer.scrollWidth - outer.clientWidth;
    if (max > 0) progBar.style.width = (outer.scrollLeft / max * 100) + '%';
  }
}

/* =================== GALLERY =================== */
function initGallery() {
  gsap.fromTo(
    document.querySelectorAll('.gallery-header-text > *, .gallery-cta-link'),
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery-section', start: 'top 90%' }
    }
  );
  document.querySelectorAll('.g-item').forEach((item, i) => {
    gsap.to(item, {
      y: 0, opacity: 1, duration: 0.65, delay: i * 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery-grid', start: 'top 92%' }
    });
  });
  document.querySelectorAll('.gs-item').forEach((item, i) => {
    gsap.to(item, {
      y: 0, opacity: 1, duration: 0.6, delay: i * 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery-strip', start: 'top 94%' }
    });
  });
}

/* =================== FOOTER =================== */
function initFooter() {
  gsap.fromTo(
    document.querySelectorAll('.footer-eyebrow, .footer-heading, .footer-sub, .footer-btn'),
    { y: 24, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.08, duration: 0.75, ease: 'power3.out',
      scrollTrigger: { trigger: '.footer-cta', start: 'top 88%' }
    }
  );
}

/* =================== INIT =================== */
function init() {
  gsap.registerPlugin(ScrollTrigger);
  initLenis();
  initHeader();
  initHeroSlider();
  initDissection();
  initFireSection();
  initFinishes();
  initApplications();
  initGallery();
  initFooter();
  preloadFrames();
}

window.addEventListener('DOMContentLoaded', init);
