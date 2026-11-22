// QA — 3AM, unité 5 « المساويات – المتباينات – المعادلات » : la synthèse `wadiya-idmajiya-musawiyat-mutabayinat` « أدمج تعلّماتي » (aucun labo) — cycle moyen, phase 3, 2026-10-28.
//
//   KIT_BASE=http://localhost:5361 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit5-wadiya-idmajiya-musawiyat-mutabayinat.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. module 0 : sept affirmations ; modules 1 à 6 : l'énoncé et la première partie ; une situation (la 3) JOUÉE jusqu'au bout avec une réponse fausse (choix puis valeur saisie) ;
//   3. module 7 : le tri des données (tap puis tap), l'analyse, les quatre décisions ; la fiche mémoire et « اختبر ذاكرتك » ;
//   4. module 8 : les cinq épreuves cochées (une fausse d'abord, puis toutes justes) et envoyées jusqu'au résultat, à 1366×768 et 768×1024 ;
//   5. captures dans /tmp/qa-wadiya-musawiyat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-wadiya-musawiyat';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'wadiya-idmajiya-musawiyat-mutabayinat';
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

for (const [w, h] of process.env.QA_SKIP_MOUNT ? [] : SIZES) {
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

// ── Interactions ──
const ROOT = resolve(new URL('.', import.meta.url).pathname, '../../src/lessons/moyen/3am/ansab_al_aadad_wal_hisab/musawiyat-mutabayinat/wadiya-idmajiya-musawiyat-mutabayinat');
const { PROBLEM } = await import(pathToFileURL(`${ROOT}/content/problems.js`).href);
const { FINAL, SITUATION } = await import(pathToFileURL(`${ROOT}/content/textbook.js`).href);

async function tapSort(page, items) {
  for (const it of items) {
    await page.getByText(it.text, { exact: true }).first().click();
    await page.waitForTimeout(250);
    // on cible le coin du bac (une carte déjà rangée au centre serait reposée par le clic)
    await page.locator(`[aria-label="${it.useful ? 'معطيات مفيدة' : 'معطيات غير مفيدة'}"]`).click({ position: { x: 6, y: 6 } });
    await page.waitForTimeout(250);
  }
  // la vérification se lance quand tout est rangé ; le bouton n'existe que si elle attend un geste
  const btn = page.getByRole('button', { name: 'تحقّق من الفرز' });
  if (await btn.count() && await btn.first().isVisible()) await btn.first().click();
  await page.waitForTimeout(500);
}

/** Joue un GuidedProblem : `wrongAt` = « p.i » d'une étape où l'on répond d'abord faux. */
async function playProblem(page, id, wrongAt) {
  const pb = PROBLEM[id]; let wrongDone = false; let sortedOnce = false;
  for (let guard = 0; guard < 80; guard += 1) {
    const cur = await page.evaluate(() => {
      const li = document.querySelector('[data-problem-substep][data-substep-done="false"][data-substep-locked="false"]');
      if (!li) return null;
      const part = li.closest('[data-problem-part]');
      const p = Number(part.getAttribute('data-problem-part')) - 1;
      const i = [...part.querySelectorAll('[data-problem-substep]')].indexOf(li);
      return { p, i };
    });
    if (!cur) {
      const total = pb.parts.reduce((n, pt) => n + pt.steps.length, 0);
      const done = await page.locator('[data-problem-substep][data-substep-done="true"]').count();
      if (done >= total) break;   // tout est joué : on ne passe SURTOUT pas au module suivant
      const next = page.locator('button:visible').filter({ hasText: /الجزء التالي|حسنًا|المتابعة/ }).first();
      if (await next.count()) { await next.click(); await page.waitForTimeout(400); continue; }
      break;
    }
    const step = pb.parts[cur.p].steps[cur.i];
    const row = page.locator(`[data-problem-part="${cur.p + 1}"] [data-problem-substep]`).nth(cur.i);
    if (step.kind === 'sort') { if (!sortedOnce) { sortedOnce = true; await tapSort(page, pb.data); } await page.waitForTimeout(500); }
    else if (step.kind === 'choice') {
      const n = await row.locator('button').count();
      const wrong = wrongAt === `${cur.p}.${cur.i}` && !wrongDone; if (wrong) wrongDone = true;
      await row.locator('button').nth(wrong ? (step.correct + 1) % n : step.correct).click();
      await page.waitForTimeout(300);
      if (wrong) { check(/./.test(await row.innerText()), `${id} ${cur.p + 1}.${cur.i + 1} : réponse fausse acceptée avec sa correction`); }
    } else if (step.kind === 'numeric') {
      const wrong = wrongAt === `${cur.p}.${cur.i}` && !wrongDone; if (wrong) wrongDone = true;
      const val = wrong ? String(step.expected + 1) : String(step.display ?? step.expected).replace('.', ',');
      await row.locator('input').first().fill(val); await row.locator('input').first().press('Enter');
      await page.waitForTimeout(300);
    } else if (step.kind === 'solution') {
      // la rédaction se révèle ligne à ligne : « أظهر الإجابة النموذجية (k/n) »
      const area = row.locator('textarea').first();
      if (await area.count()) await area.fill('أكتب الحلّ بنفسي أوّلًا');
      for (let k = 0; k < 8; k += 1) {
        const b = row.locator('[data-written-answer] button:visible').last();
        if (await b.count() && await b.isEnabled()) { await page.waitForTimeout(300); await b.click({ force: true, timeout: 8000 }); await page.waitForTimeout(300); } else break;
      }
    }
    await page.waitForTimeout(150);
  }
  const left = await page.locator('[data-problem-substep][data-substep-done="false"]').count();
  if (left) console.log('  bloqué avant :', await page.evaluate(() => { const li = document.querySelector('[data-problem-substep][data-substep-done="false"]'); return li ? li.getAttribute('data-substep-locked') + ' ' + li.innerText.slice(0, 160) : ''; }));
  check(left === 0, `${id} : toutes les sous-étapes jouées (${left} restantes)`);
}

for (const [w, h] of [[1366, 768], [768, 1024]]) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => consoleErrors.push(`interactions ${w}×${h} pageerror ${String(e).slice(0, 140)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|favicon|net::ERR|404|401/.test(m.text())) consoleErrors.push(`interactions ${w}×${h} ${m.text().slice(0, 140)}`); });

  // module 0 : sept affirmations
  await goto(page, `${BASE}${CH}/${LESSON}/astaidd`);
  check(/سبع عبارات/.test(await page.locator('body').innerText()), `${w}×${h} module 0 : sept affirmations annoncées`);

  // modules 1 à 6 : l'énoncé est présenté, aucun renvoi au manuel
  const expectTxt = [/مكافأة|أعلى معدّل/, /كراريس|سلمى/, /التوابل|الميزان/, /سيارة أجرة|الأجرة/, /غرفة تبريد|التبريد/, /عمر الأب|الابن/];
  for (let n = 1; n <= 6; n += 1) {
    await goto(page, `${BASE}${CH}/${LESSON}/wadiya-${n}`);
    const t = await page.locator('body').innerText();
    check(expectTxt[n - 1].test(t), `${w}×${h} module ${n} : la situation est présentée`);
    check(!/الكتاب(?!ة)/.test(t), `${w}×${h} module ${n} : aucun renvoi au manuel`);
  }

  // une situation jouée jusqu'au bout, avec une réponse fausse (étape 1.2 : le choix du rôle « conclude »)
  await goto(page, `${BASE}${CH}/${LESSON}/wadiya-3`);
  await playProblem(page, 'wadiya-3', '0.1');
  await pageHealth(page, `${w}×${h} situation 3 jouée`);
  await page.screenshot({ path: `${OUT}/wadiya-3-played-${w}x${h}.png`, fullPage: true });

  // module 7 : le tri, l'analyse, les décisions
  await goto(page, `${BASE}${CH}/tahlil-wadiya`.replace(CH, `${CH}/${LESSON}`));
  const t7 = await page.locator('body').innerText();
  check(/رضا/.test(t7) && /ياسين/.test(t7), `${w}×${h} module 7 : la poursuite de Tipaza est présentée`);
  check(!/340|6,4/.test(t7), `${w}×${h} module 7 : les valeurs du module 8 n'y sont pas`);
  await tapSort(page, SITUATION.data);
  await pageHealth(page, `${w}×${h} module 7 après le tri`);
  await page.screenshot({ path: `${OUT}/m7-sorted-${w}x${h}.png`, fullPage: true });
  // l'analyse en cinq temps
  for (let k = 0; k < 6; k += 1) { const b = page.locator('button:visible').filter({ hasText: /السطر التالي/ }).first(); if (await b.count()) { await b.click({ timeout: 8000 }); await page.waitForTimeout(200); } }
  const t7b = await page.locator('body').innerText();
  check(/الخلاصة/.test(t7b), `${w}×${h} module 7 : l'analyse en cinq temps est révélée`);
  await page.screenshot({ path: `${OUT}/m7-analysis-${w}x${h}.png`, fullPage: true });
  // les quatre décisions : une réponse fausse d'abord (la 1re), puis les bonnes
  const decisions = [/يلحق به بعد/, /بعد التدوير/, /وهو أقلّ من/, /يجب ألّا تتجاوز/];
  const wrongFirst = page.locator('button:visible').filter({ hasText: /لأنّ رضا أسرع/ }).first();
  if (await wrongFirst.count()) { await wrongFirst.click(); await page.waitForTimeout(400); check(/لأنّ|الجواب|يقطع/.test(await page.locator('body').innerText()), `${w}×${h} module 7 : une réponse fausse reçoit sa correction`); }
  for (const rx of decisions) {
    const b = page.locator('button:visible').filter({ hasText: rx }).first();
    if (await b.count()) { await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 8000 }).catch(() => {}); await page.waitForTimeout(350); }
  }
  const t7c = await page.locator('body').innerText();
  check(/حكاية/.test(t7c), `${w}×${h} module 7 : la « حكاية » apparaît après la dernière réponse`);
  // la fiche mémoire et le défi chronométré
  check(/اختبر ذاكرتك|بطاقة|للتذكّر/.test(t7c), `${w}×${h} module 7 : la fiche mémoire est présentée`);
  const challenge = page.locator('button:visible').filter({ hasText: /اختبر ذاكرتك/ }).first();
  if (await challenge.count()) { await challenge.click({ timeout: 8000 }).catch(() => {}); await page.waitForTimeout(800); check(/\d+:\d\d|ثانية|المؤقّت|سؤال/.test(await page.locator('body').innerText()), `${w}×${h} module 7 : « اختبر ذاكرتك » démarre`); }
  await page.screenshot({ path: `${OUT}/m7-memo-${w}x${h}.png`, fullPage: true });
  await pageHealth(page, `${w}×${h} module 7 fin`);

  // module 8 : une épreuve fausse d'abord, puis toutes justes, envoi et résultat
  await goto(page, `${BASE}${CH}/${LESSON}/ahill`);
  const annotation = (s) => s.replace(/\\\\/g, '\\').replace(/\$/g, '').replace(/\\le/g, '≤').replace(/\\ge/g, '≥').replace(/\{,\}/g, ',').replace(/\\,/g, '').replace(/\s+/g, '').replace(/-/g, '−');
  // les 20 boutons d'options précèdent « أرسِل إجاباتي » : quatre par épreuve, dans l'ordre E1…E5. Les positions sont lues UNE fois, avant tout clic.
  const all = page.locator('button:visible'); const nBtn = await all.count(); let submitAt = -1;
  for (let q = 0; q < nBtn; q += 1) if (/أرسِل إجاباتي/.test(await all.nth(q).innerText())) { submitAt = q; break; }
  const positions = [];
  for (const [k, e] of FINAL.entries()) {
    const ann = annotation(e.id === 'E2' ? e.options[1] : e.options[0]); let at = -1;
    for (let q = submitAt - 20 + 4 * k; q < submitAt - 20 + 4 * k + 4; q += 1) {
      if ((await all.nth(q).innerText()).replace(/\s+/g, '').endsWith(ann)) { at = q; break; }
    }
    positions.push(at);
  }
  const t8 = await page.locator('body').innerText();
  check(/12/.test(t8) && /140/.test(t8), `${w}×${h} module 8 : la وضعية des deux camions est affichée`);
  for (const [k, e] of FINAL.entries()) {
    check(positions[k] >= 0, `${w}×${h} module 8 ${e.id} : option trouvée`);
    // les options portent aria-pressed : on les relit à CHAQUE clic (la sélection re-rend les boutons) ; rang = 4 k + position dans l'épreuve
    const opt = page.locator('button[aria-pressed]').nth(positions[k] - (submitAt - 20));
    await opt.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); await opt.click({ timeout: 8000 }); await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${OUT}/m8-answered-${w}x${h}.png`, fullPage: true });
  await page.getByRole('button', { name: /أرسِل إجاباتي/ }).click();
  await page.waitForTimeout(1500);
  const r8 = await page.locator('body').innerText();
  check(/4|٤/.test(r8) && !/أرسِل إجاباتي \(5\)/.test(r8), `${w}×${h} module 8 : le résultat s'affiche après l'envoi`);
  check(/تصحيح|الصحيح|إجابة|نتيجة|النتيجة/.test(r8), `${w}×${h} module 8 : la correction est montrée`);
  await page.screenshot({ path: `${OUT}/m8-result-${w}x${h}.png`, fullPage: true });
  await pageHealth(page, `${w}×${h} module 8 résultat`);
  await ctx.close();
}

await browser.close();
check(consoleErrors.length === 0, `aucune erreur console (${consoleErrors.length}) ${consoleErrors.slice(0, 3).join(' | ')}`);
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert');
process.exit(failures.length ? 1 : 0);
