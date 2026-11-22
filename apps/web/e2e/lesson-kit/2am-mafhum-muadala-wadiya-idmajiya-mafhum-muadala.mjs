// QA — 2AM, unité 4 « مفهوم معادلة » : la synthèse `wadiya-idmajiya-mafhum-muadala` « أدمج تعلّماتي » (aucun labo : les situations
// réutilisent les outils des trois leçons) — cycle moyen, phase 3, 2026-10-30.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/2am-mafhum-muadala-wadiya-idmajiya-mafhum-muadala.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » brut, RTL ;
//   2. module 0 : six affirmations et le cadre « هل تعلم » ; modules 1 à 6 : l'illustration et la première partie ; module 7 : la situation sans solution ;
//   3. module 8 : cinq épreuves (les options de la sortie au musée) ;
//   4. captures dans /tmp/qa-wadiya-mafhum-muadala.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-wadiya-mafhum-muadala';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'wadiya-idmajiya-mafhum-muadala';
const MODULES = ['astaidd', 'wadiya-1', 'wadiya-2', 'wadiya-3', 'wadiya-4', 'wadiya-5', 'wadiya-6', 'tahlil-wadiya', 'ahill'];
const SIZES = [[768, 1024], [1024, 768], [1280, 800], [1366, 768]];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
  if (STUB) return 'qa-fake-token';
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token && res.status === 429 && tries > 0) { await new Promise((r) => setTimeout(r, 15000)); return loginToken(who, tries - 1); }
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (STUB) {
    const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
    await ctx.route(/\/api\/v1\//, (route) => {
      const url = route.request().url();
      const body = url.includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div)\b/;

async function pageHealth(page, label) {
  const { overflow, raw, dir } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"],[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3), dir: document.documentElement.dir || document.body.dir };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
  check(dir === 'rtl', `${label}: page RTL`);
}

async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);
const consoleErrors = [];

for (const [w, h] of SIZES) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|favicon|net::ERR|404|401/.test(m.text())) consoleErrors.push(`${w}×${h} ${m.text().slice(0, 140)}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${w}×${h} pageerror ${String(e).slice(0, 140)}`));

  await goto(page, `${BASE}${CH}/${LESSON}`);
  check((await page.locator('body').innerText()).includes('أدمج تعلّماتي'), `${w}×${h}: le sommaire est monté`);
  await pageHealth(page, `${w}×${h} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${w}x${h}.png` });

  for (const [k, slug] of MODULES.entries()) {
    await goto(page, `${BASE}${CH}/${LESSON}/${slug}`);
    const text = await page.locator('body').innerText();
    check(text.length > 200, `${w}×${h} module ${k} « ${slug} » monté`);
    await pageHealth(page, `${w}×${h} module ${k}`);
    await page.screenshot({ path: `${OUT}/m${k}-${w}x${h}.png`, fullPage: false });
  }
  await ctx.close();
}

// ── Interactions à 1366×768 ──
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => consoleErrors.push(`interactions pageerror ${String(e).slice(0, 140)}`));

  // module 0 : six affirmations et le cadre « هل تعلم »
  await goto(page, `${BASE}${CH}/${LESSON}/astaidd`);
  const t0 = await page.locator('body').innerText();
  check(/هل تعلم/.test(t0) && /ريكورد/.test(t0), 'module 0 : le cadre « هل تعلم » est affiché');

  // modules 1 à 6 : chaque situation montre son énoncé et ses cartes
  const expect = [/الإعلام الآلي/, /الحذاء|الورشة/, /الحديقة/, /سارة/, /الخلايا|الأعواد/, /برنامج|هدى/];
  for (let n = 1; n <= 6; n += 1) {
    await goto(page, `${BASE}${CH}/${LESSON}/wadiya-${n}`);
    const t = await page.locator('body').innerText();
    check(expect[n - 1].test(t), `module ${n} : la situation est présentée`);
    check(!/الكتاب(?!ة)/.test(t), `module ${n} : aucun renvoi au manuel`);
  }

  // module 7 : l'entrée présente la situation, sans la résoudre
  await goto(page, `${BASE}${CH}/${LESSON}/tahlil-wadiya`);
  const t7 = await page.locator('body').innerText();
  check(/الحافلة/.test(t7) && /المتحف/.test(t7), 'module 7 : la situation de la sortie au musée est présentée');
  check(!/19200/.test(t7), "module 7 : rien n'est résolu (pas de 19200)");
  await page.screenshot({ path: `${OUT}/m7.png`, fullPage: true });

  // module 8 : l'évaluation — les cinq épreuves
  await goto(page, `${BASE}${CH}/${LESSON}/ahill`);
  const t8 = await page.locator('body').innerText();
  check(/متحف/.test(t8), 'module 8 : la وضعية finale est affichée');
  const radios = await page.locator('button:visible, [role=radio]:visible').count();
  check(radios >= 5, `module 8 : des options à cocher (${radios} boutons)`);
  await page.screenshot({ path: `${OUT}/m8.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
check(consoleErrors.length === 0, `aucune erreur console (${consoleErrors.length}) ${consoleErrors.slice(0, 3).join(' | ')}`);
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert');
process.exit(failures.length ? 1 : 0);
