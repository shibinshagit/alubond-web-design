import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Auto-increment filename
let n = 1;
let filename;
do {
  filename = label
    ? path.join(dir, `screenshot-${n}-${label}.png`)
    : path.join(dir, `screenshot-${n}.png`);
  n++;
} while (fs.existsSync(filename));

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

// Wait briefly for JS to initialise
await new Promise(r => setTimeout(r, 1500));

await page.screenshot({ path: filename, fullPage: false });
console.log('Saved:', filename);
await browser.close();
