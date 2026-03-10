import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3500));

async function scrollTo(pct, label) {
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const targetY = Math.round(pct * docHeight);
  const currentY = await page.evaluate(() => window.scrollY);

  // Step scroll to trigger events
  const steps = 40;
  for (let i = 1; i <= steps; i++) {
    const mid = currentY + (targetY - currentY) * (i / steps);
    await page.evaluate((s) => window.scrollTo(0, s), mid);
    await new Promise(r => setTimeout(r, 18));
  }
  await new Promise(r => setTimeout(r, 300));

  // Force ScrollTrigger to update
  await page.evaluate(() => {
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  });

  // Force reveal sections using GSAP's own API (kills pending tweens)
  await page.evaluate((p) => {
    if (!window.gsap) return;
    // Convert docHeight fraction to ScrollTrigger progress
    // ST_progress = (scrollY - heroHeight) / (containerScrollable)
    // scrollY = p * 8100, heroHeight = 900, containerScrollable = 7200
    const stProgress = Math.max(0, Math.min(1, (p * 8100 - 900) / 7200));
    document.querySelectorAll('.scroll-section').forEach(section => {
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      const selectors = [
        '.section-label', '.section-heading', '.section-body', '.section-note',
        '.cta-heading', '.cta-body', '.cta-button', '.stat', '.cert-list',
        '.cert-badge', '.stats-label', '.stat-number', '.stat-suffix', '.stat-label'
      ].join(',');
      const children = [...section.querySelectorAll(selectors)];
      if (children.length === 0) return;
      if (stProgress >= enter && stProgress <= leave) {
        // Kill all tweens on these elements and force to final visible state
        window.gsap.killTweensOf(children);
        window.gsap.set(children, {
          opacity: 1, y: 0, x: 0, rotation: 0, scale: 1,
          clearProps: 'clipPath,visibility'
        });
      } else {
        window.gsap.killTweensOf(children);
        window.gsap.set(children, { opacity: 0 });
      }
    });
  }, pct);

  // Force canvas frame to correct position
  await page.evaluate((p) => {
    const FRAME_SPEED = 2.0;
    const FRAME_COUNT = 241;
    const IMAGE_SCALE = 0.85;
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const accelerated = Math.min(p * FRAME_SPEED, 1);
    const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
    // Draw using the pre-loaded frames array from app.js scope
    // Access via closure isn't possible, so we load the frame directly
    const img = new Image();
    img.onload = () => {
      const cw = window.innerWidth, ch = window.innerHeight;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
      const dw = iw * scale, dh = ih * scale;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.fillStyle = '#131F52';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };
    const n = String(index + 1).padStart(4, '0');
    img.src = `frames/frame_${n}.jpg`;
  }, pct);

  await new Promise(r => setTimeout(r, 800));

  const filename = path.join(dir, `scroll-${label}.png`);
  await page.screenshot({ path: filename });
  console.log(`Saved: scroll-${label}.png (${Math.round(pct * 100)}%)`);
}

// Positions: scrollY = (section_center - viewport_half) / docHeight
// Section 1 top:28% → center=(900+0.28*8100)px → scrollY=(3168-450)/8100=0.336
await scrollTo(0.336, '2-section1');
// Section 2 top:40% → center=4140 → scrollY=3690/8100=0.456
await scrollTo(0.456, '3-section2');
// Section 3 top:52% → center=5112 → scrollY=4662/8100=0.575
await scrollTo(0.575, '4-section3');
// Section 4 top:62% → center=6022 → scrollY=5572/8100=0.688
await scrollTo(0.688, '5-section4');
// Stats top:71% → center=6651 → scrollY=6201/8100=0.765
await scrollTo(0.765, '6-stats');
// Certifications top:82% → center=7542 → scrollY=7092/8100=0.876
await scrollTo(0.876, '7-certs');
// CTA top:89% → center=8109 → scrollY=7659/8100=0.945
await scrollTo(0.945, '8-cta');

await browser.close();
console.log('Done.');
