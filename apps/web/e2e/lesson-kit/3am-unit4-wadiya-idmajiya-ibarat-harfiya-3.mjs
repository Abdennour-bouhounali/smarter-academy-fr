// QA — 3AM, unité 4 « الحساب الحرفي » : la synthèse `wadiya-idmajiya-ibarat-harfiya-3` « أدمج تعلّماتي — الحساب الحرفي » (aucun labo : les situations réutilisent les outils des quatre
// leçons) — cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-unit4-wadiya-idmajiya-ibarat-harfiya-3.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » brut, RTL ;
//   2. module 1 : le tableau du carré magique ; module 5 : la figure du rectangle ABCD ; module 7 : la piste présentée, RIEN n'est résolu (ni 2,4 ni 4,8 ni 7,54 ni 15,08) ;
//   3. module 8 : quatre épreuves + le bonus non compté ;
//   4. captures dans /tmp/qa-wadiya-ibarat-harfiya.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-wadiya-ibarat-harfiya';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'wadiya-idmajiya-ibarat-harfiya-3';
const MODULES = ['astaidd', 'wadiya-1', 'wadiya-2', 'wadiya-3', 'wadiya-4', 'wadiya-5', 'wadiya-6', 'al-wadiya', 'ahill'];
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

  // module 1 : le tableau du carré magique
  await goto(page, `${BASE}${CH}/${LESSON}/wadiya-1`);
  check((await page.locator('[data-problem-table]').count()) >= 1, 'module 1 : le tableau du carré magique est affiché');
  await page.screenshot({ path: `${OUT}/m1-table.png` });

  // module 5 : la figure du rectangle
  await goto(page, `${BASE}${CH}/${LESSON}/wadiya-5`);
  const fig = await page.locator('svg[aria-label*="ABCD"]').count();
  check(fig >= 1, 'module 5 : la figure du مستطيل ABCD est dessinée');
  await page.screenshot({ path: `${OUT}/m5-figure.png` });

  // module 7 : l'entrée présente la situation, sans la résoudre
  await goto(page, `${BASE}${CH}/${LESSON}/al-wadiya`);
  const t7 = await page.locator('body').innerText();
  check(/مضمار/.test(t7) && /ريم/.test(t7), 'module 7 : la situation du مضمار est présentée');
  check(!/2[,.]4|4[,.]8|7[,.]54|15[,.]08|399/.test(t7.replace(/1[,.]2/g, '')), "module 7 : rien n'est résolu (ni 2,4 ni 4,8 ni 7,54 ni 15,08 ni 399)");

  // module 8 : l'évaluation — quatre épreuves, puis le bonus
  await goto(page, `${BASE}${CH}/${LESSON}/ahill`);
  const t8 = await page.locator('body').innerText();
  check(/المرحلة 1/.test(t8) || /مضمار|رواق/.test(t8), 'module 8 : la وضعية finale est affichée');
  const radios = await page.locator('button:visible, [role=radio]:visible').count();
  check(radios >= 4, `module 8 : des options à cocher (${radios} boutons)`);
  await page.screenshot({ path: `${OUT}/m8.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
check(consoleErrors.length === 0, `aucune erreur console (${consoleErrors.length}) ${consoleErrors.slice(0, 3).join(' | ')}`);
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert');
process.exit(failures.length ? 1 : 0);
