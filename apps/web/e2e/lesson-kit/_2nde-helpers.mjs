// Shared harness for the 2nde lesson suites (Playwright from the repo's node_modules).
// Each suite runs against its own vite port (KIT_BASE) — start vite from apps/web/ detached.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

export const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
export const check = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ` — ${String(detail).slice(0, 400)}`}`);
};
export const summary = () => {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) { console.log('FAILED:'); fails.forEach((f) => console.log(` - ${f.name}`)); }
  return fails.length;
};

export const errs = [];
export function watchErrors(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    errs.push(`[${tag}] console: ${t}`);
  });
  page.on('pageerror', (err) => errs.push(`[${tag}] pageerror: ${err.message}`));
}

export const launch = () => chromium.launch({ args: ['--no-sandbox'] });

/** Opens a page with optional seeded progress; waits for the app shell to hydrate. */
export async function open(browser, url, { key, completedModules = null, mobile = false, tag = 'p' } = {}) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 375, height: 667 } : { width: 1280, height: 1600 },
    hasTouch: mobile, isMobile: mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, tag);
  if (completedModules) {
    await page.addInitScript(([k, m]) => {
      if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify({ completedModules: m, completedExercises: [] }));
    }, [key, completedModules]);
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !/Chargement de Smarter Academy/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(900);
  return { ctx, page };
}

export const settle = (page, ms = 700) => page.waitForTimeout(ms);
export const body = async (page) => (await page.textContent('body')).replace(/\s+/g, ' ');

/** SVG text labels: none leaves its viewBox, no two overlap (CTM-aware, §17bis). */
export const layoutAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width || vb.width < 200) continue;
    const boxOf = (el) => {
      let bb; try { bb = el.getBBox(); } catch { return null; }
      const m = el.getCTM?.(); const sm = svg.getCTM?.();
      if (!m || !sm) return bb;
      const rel = sm.inverse().multiply(m);
      const pt = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(rel); };
      const c = [pt(bb.x, bb.y), pt(bb.x + bb.width, bb.y), pt(bb.x, bb.y + bb.height), pt(bb.x + bb.width, bb.y + bb.height)];
      const xs = c.map((q) => q.x); const ys = c.map((q) => q.y);
      return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    };
    const texts = [...svg.querySelectorAll('text')].filter((t) => t.textContent.trim());
    const boxes = [];
    for (const t of texts) {
      const bb = boxOf(t); if (!bb || bb.width === 0) continue;
      if (bb.x < vb.x - 0.5 || bb.y < vb.y - 0.5 || bb.x + bb.width > vb.x + vb.width + 0.5 || bb.y + bb.height > vb.y + vb.height + 0.5) out.push(`hors cadre "${t.textContent.trim()}"`);
      boxes.push({ t: t.textContent.trim(), ...bb });
    }
    for (let i = 0; i < boxes.length; i += 1) for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i]; const c = boxes[j];
      const ox = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x);
      const oy = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
      if (ox > 1.5 && oy > 1.5) out.push(`chevauchement "${a.t}" ↔ "${c.t}"`);
    }
  }
  return out;
});

/** viewBox too tall = a forgotten vertical unit. */
export const aspectAudit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (vb && vb.width > 100 && vb.height / vb.width > 3) out.push(`viewBox ${vb.width}×${vb.height}`);
  }
  return out;
});

/** No descendant of a lab (role=group with aria-label) bleeds out of the main column. */
export const domOverflow = (page) => page.evaluate(() => {
  const out = [];
  const main = document.querySelector('main');
  if (!main) return out;
  const r = main.getBoundingClientRect();
  for (const el of main.querySelectorAll('[role="group"] *')) {
    const e = el.getBoundingClientRect();
    if (e.width === 0) continue;
    if (e.right > r.right + 2 || e.left < r.left - 2) out.push(`déborde : ${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)}`);
  }
  return out;
});

export const noHScroll = (page) => page.evaluate(() => document.scrollingElement.scrollWidth <= window.innerWidth + 1);
export const smallTargets = (page) => page.evaluate(() => {
  const bad = [];
  for (const b of document.querySelectorAll('main button')) {
    if (b.disabled) continue;
    const r = b.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.height < 40) bad.push(b.getAttribute('aria-label') || b.textContent.trim().slice(0, 20));
  }
  return bad;
});

export const readCompleted = (page, key) => page.evaluate((k) => {
  try { return JSON.parse(localStorage.getItem(k) || '{}').completedModules || []; } catch { return null; }
}, key);

export const nextEnabled = (page) => page.locator('button:has-text("Module suivant"), a:has-text("Terminer")').first().isEnabled().catch(() => false);

/** Fill the first visible numeric field and press OK. */
export async function fillOk(page, value, scope = '') {
  await page.locator(`${scope} input[type="text"]`).first().fill(value);
  await page.locator(`${scope} button:has-text("OK")`).first().click();
  await settle(page);
}

/** Tap a choice button by its (substring) text within an optional scope. */
export async function tap(page, text, scope = '') {
  const b = page.locator(`${scope} button[aria-pressed]`).filter({ hasText: text }).first();
  await b.click({ force: true });
  await settle(page);
}

/**
 * Tap the nth option of a kit QUESTION grid (`div[role="group"]` holding the
 * ChoiceGrid), skipping any PredictionChips group in the same step — the
 * chips share the `aria-pressed` selector, so a bare nth() hits the wrong one.
 */
export async function tapOption(page, scope, index) {
  const groups = page.locator(`${scope} div[role="group"]`);
  const n = await groups.count();
  for (let i = n - 1; i >= 0; i -= 1) {
    const g = groups.nth(i);
    const label = await g.getAttribute('aria-label');
    if (label && /prédiction/i.test(label)) continue;
    const opts = g.locator('button[aria-pressed]');
    if (await opts.count() > index) { await opts.nth(index).click({ force: true }); await settle(page); return true; }
  }
  return false;
}

/** Drive a slider (role=slider) to both ends by keyboard, auditing layout at each stop. */
export async function sweepSliders(page, issues, steps = [['End'], ['Home'], ['ArrowRight', 3]]) {
  const sliders = page.locator('[role="slider"]');
  const n = await sliders.count();
  for (let i = 0; i < n; i += 1) {
    for (const [key, times = 1] of steps) {
      await sliders.nth(i).focus().catch(() => {});
      for (let k = 0; k < times; k += 1) await page.keyboard.press(key);
      await page.waitForTimeout(250);
      issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)));
    }
  }
  return n;
}

/** Answer a whole boss silently then submit; returns the body text after submit. */
export async function runBoss(page) {
  const groups = page.locator('main div[role="group"]');
  const n = await groups.count();
  for (let i = 0; i < n; i += 1) {
    const opts = groups.nth(i).locator('button[aria-pressed]');
    if (await opts.count()) await opts.first().click({ force: true }).catch(() => {});
  }
  await settle(page);
  return body(page);
}
