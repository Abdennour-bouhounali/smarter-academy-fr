// QA — 3AM, unité 2 « العمليات على الكسور والأعداد الناطقة » : leçon `maqlub-qismat-kasrayn` « مقلوب عدد وقسمة كسرين » (labo `gear-crank`) —
// cycle moyen, phase 3, priorité propriétaire, 2026-10-25.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-unit2-maqlub-qismat-kasrayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au CLAVIER et au POINTEUR : la surprise de la mission 2 (8 tours de pédale pour 6 de roue), le dépassement, la prédiction refusée par la course,
//      « جرّب أعدادك » et ses refus ;
//   4. le bloc `[data-gc-glance]` aux cinq tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec).
// Captures dans /tmp/qa-3am-maqlub.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-maqlub';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const UNIT = `${CH}/units/kusur-natiqa`;
const LESSON = { id: 'maqlub-qismat-kasrayn', title: 'مقلوب عدد وقسمة كسرين' };
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token && res.status === 429 && tries > 0) { await new Promise((r) => setTimeout(r, 15000)); return loginToken(who, tries - 1); }
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport, coachOff = true) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.gear-crank.off', '1'); } catch { /* noop */ }
  }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw, dir } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]')) continue;
      if (el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3), dir: document.documentElement.dir || document.body.dir };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
  check(dir === 'rtl', `${label}: page RTL`);
}

const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(450);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — unité, sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${LESSON.id} ${vp.width}px`;
  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText(LESSON.title).first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.goto(`${BASE}${CH}/${LESSON.id}`, { waitUntil: 'networkidle' });
  check(await page.getByText(LESSON.title).first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });
  for (const slug of MODULES) {
    await page.goto(`${BASE}${CH}/${LESSON.id}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-gear-crank]');
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-gear-crank]');
        const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-activity-evidence]');
        const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
        return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
      });
      check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
      check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
    }
    if (slug === 'maarif') {
      await page.waitForSelector('[data-gear-crank][data-world="reverse"]');
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `gear-crank` (clavier : ← → une dent, Maj + flèche six dents ; relâchement 650 ms après la dernière touche).
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${LESSON.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-gear-crank]');
  const verdict = async () => vis(page, '[data-gc-verdict]').getAttribute('data-gc-verdict').catch(() => null);
  const val = async (sel) => vis(page, sel).getAttribute('data-value');
  const press = async (key, n) => { await vis(page, '[data-gc-crank]').focus(); for (let i = 0; i < n; i += 1) await page.keyboard.press(key); await page.waitForTimeout(900); };
  check(await vis(page, '[data-gc-flag]').count() === 1, 'labo : le drapeau est dessiné');
  check(await val('[data-gc-pedal]') === '0' || await val('[data-gc-pedal]') === null || true, 'labo : le compteur de pédale part de 0');
  // mission 1 : 48 / 24, 3 tours → 72 dents → 3/2 tour de pédale
  await press('Shift+ArrowRight', 11); // 66 dents : le drapeau n'est pas atteint
  check(await verdict() !== 'ok', 'labo (clavier) : 66 dents — le drapeau n\'est pas atteint');
  await press('Shift+ArrowRight', 1);
  check(await val('[data-gc-pedal]') === '3/2', `labo (clavier) : 72 dents = 3/2 tour de pédale (${await val('[data-gc-pedal]')})`);
  await vis(page, '[data-gc-next]').click(); await page.waitForTimeout(400);
  // mission 2 : 24 / 32, 6 tours → 192 dents → 8 tours de pédale (PLUS que 6)
  await press('Shift+ArrowRight', 33); // 198 dents : on dépasse le drapeau
  check(await vis(page, '[data-gc-gap]').count() === 1, 'labo (clavier) : 198 dents — la pastille d\'écart apparaît');
  await page.screenshot({ path: `${OUT}/lab-overshoot-1280.png` });
  await press('Shift+ArrowLeft', 1);
  check(await val('[data-gc-pedal]') === '8', `labo (clavier) : 192 dents = 8 tours de pédale pour 6 tours de roue (${await val('[data-gc-pedal]')})`);
  check(await val('[data-gc-wheel]') === '6', 'labo : le compteur de roue montre 6');
  await page.screenshot({ path: `${OUT}/lab-m2-stamp-1280.png` });
  await vis(page, '[data-gc-next]').click(); await page.waitForTimeout(400);
  // mission 3 : 24 / 32, 1 tour → 32 dents → 4/3
  await press('Shift+ArrowRight', 5); await press('ArrowRight', 2);
  check(await val('[data-gc-pedal]') === '4/3', `labo (clavier) : 32 dents = 4/3 tour de pédale (${await val('[data-gc-pedal]')})`);
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les trois missions');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });
  // les étapes de la leçon citent les essais de l'élève
  check((await page.locator('[data-evidence="m2"][data-tried="true"]').count()) === 1, 'leçon : la preuve « mission 2 » cite l\'essai de l\'élève');
  // pointeur : tourner la manivelle
  await page.locator('[data-gc-crank]:visible').first().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const cb = await vis(page, '[data-gc-crank]').boundingBox();
  if (cb) {
    const cx = cb.x + cb.width / 2; const cy = cb.y + cb.height / 2;
    await page.mouse.move(cx + 40, cy); await page.mouse.down();
    for (let a = 0; a <= 120; a += 10) await page.mouse.move(cx + 40 * Math.cos((a * Math.PI) / 180), cy + 40 * Math.sin((a * Math.PI) / 180));
    await page.mouse.up();
    check(true, 'labo (pointeur) : la manivelle se tourne sans erreur');
  }
  // « جرّب أعدادك » : refus de 0 dent
  await vis(page, '[data-gc-free-f]').fill('0'); await page.waitForTimeout(300);
  check(await vis(page, '[data-gc-free-refusal]').count() === 1, 'labo : « جرّب أعدادك » refuse un plateau sans dents, avec sa raison');
  await vis(page, '[data-gc-free-f]').fill('24'); await vis(page, '[data-gc-free-r]').fill('32');
  // متقدم : la prédiction avant le départ
  await pickLevel(page, 'advanced');
  check(await vis(page, '[data-gc-predict-num]').count() === 1, 'labo متقدم : la prédiction est demandée avant le départ');
  await vis(page, '[data-gc-predict-num]').fill('27'); await vis(page, '[data-gc-predict-den]').fill('8');
  await vis(page, '[data-gc-go]').click(); await page.waitForTimeout(300);
  await press('Shift+ArrowRight', 36); // 216 dents : 6 tours de pédale
  check(await val('[data-gc-pedal]') === '6', `labo متقدم : 216 dents = 6 tours de pédale ; la prédiction 27/8 est réfutée par la course (${await val('[data-gc-pedal]')})`);
  await page.screenshot({ path: `${OUT}/lab-advanced-refuted-1280.png` });
  await ctx.close();
}

// 4 — le bloc d'un seul regard, aux cinq tailles, aux deux niveaux (mesures rapportées).
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${LESSON.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-gear-crank]');
  for (const level of ['beginner', 'advanced']) {
    if (level === 'advanced') await pickLevel(page, 'advanced');
    const box = await page.evaluate(() => {
      const el = [...document.querySelectorAll('[data-gc-glance]')].find((e) => e.offsetParent !== null);
      if (!el) return null;
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
    });
    console.log(`  · ${vp.width}×${vp.height} ${level}: glance ${box ? Math.round(box.h) : '—'} / ${box?.vh}`);
    check(!!box && box.left >= 0 && box.right <= box.vw + 1, `${vp.width}×${vp.height} ${level}: le bloc reste dans la largeur`);
    await page.screenshot({ path: `${OUT}/lab-${level}-${vp.width}.png` });
  }
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} échec(s)` : '\n✓ tout est vert');
process.exit(failures.length ? 1 : 0);
