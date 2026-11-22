// Shared harness for the lesson-kit deep tests (Playwright, resolved from the repo's node_modules).
// Run e.g.: node apps/web/e2e/lesson-kit/4am-aadad-tabiiya-natiqa.mjs   (dev server on :5183)
import { chromium } from 'playwright';

export const BASE = process.env.KIT_BASE || 'http://localhost:5183';
export const XP_KEY = 'u_anon_smarter_global_xp';
export const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
import { mkdirSync } from 'node:fs';
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
export function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
export function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) { console.log('FAILED:'); fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`)); }
  return fails.length;
}
export async function launch() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  return { browser };
}
export async function newCtx(browser, { mobile = false } = {}) {
  const ctx = await browser.newContext(
    mobile
      ? { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }
      : { viewport: { width: 1280, height: 1400 } }
  );
  // Les polices Google (index.html) ne portent aucune assertion ; quand le réseau
  // ne les atteint pas, elles retiennent l'événement « load » et chaque page.goto
  // expire (2026-10-01). On les coupe : la page retombe sur ses polices locales.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  return ctx;
}
export function watchErrors(page, bucket) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    bucket.push(`console: ${t}`);
  });
  page.on('pageerror', (err) => bucket.push(`pageerror: ${err.message}`));
}
// Seeds lesson progress ONCE per context: addInitScript re-runs on every navigation
// (including reload), so guard it — otherwise a reload would wipe live progress.
export const lessonKey = (lessonId) => `u_anon_smarter_lesson_${lessonId}`;
export async function seed(page, completedModules, key) {
  await page.addInitScript(
    ([k, m]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] })); },
    [key, completedModules]
  );
}
export async function getProgress(page, key) { return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key); }
export async function getXp(page) { return page.evaluate((k) => parseInt(localStorage.getItem(k) || '0', 10), XP_KEY); }
export async function noHorizontalScroll(page) { return page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1); }
