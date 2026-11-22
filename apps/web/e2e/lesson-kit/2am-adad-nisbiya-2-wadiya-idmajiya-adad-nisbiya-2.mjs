// QA — 2AM, unité 3 « الأعداد النسبية » : la synthèse `wadiya-idmajiya-adad-nisbiya-2` « أدمج تعلّماتي » (aucun labo : les situations
// recombinent les outils des six leçons) — cycle moyen, phase 3, 2AM مقطع 2am.m4, paire 5, 2026-10-30.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-wadiya-idmajiya-adad-nisbiya-2.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » brut, RTL ;
//   2. module 0 : six affirmations ; modules 1 à 6 : l'énoncé, le support dessiné (tableau, repère ou scène) et la première partie ; module 7 : la situation sans solution ;
//   3. module 8 : cinq épreuves (les options du camp d'hiver à Djelfa) ;
//   4. captures dans /tmp/qa-wadiya-adad-nisbiya-2.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-wadiya-adad-nisbiya-2';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = 'wadiya-idmajiya-adad-nisbiya-2';
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
  // la « جولة تعريفية » (une fois par compte) couvre le module : on la passe avant de relire la page
  const skip = page.getByRole('button', { name: /تخطّ|تخط/ });
  await skip.first().waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
  if (await skip.count()) { await skip.first().click().catch(() => {}); await page.waitForTimeout(500); }
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

  // module 0 : six affirmations
  await goto(page, `${BASE}${CH}/${LESSON}/astaidd`);
  const t0 = await page.locator('body').innerText();
  check(/ست عبارات قبل الوضعيات/.test(t0) || /أستعدّ/.test(t0), 'module 0 : la présentation de « أستعدّ » est affichée');

  // modules 1 à 6 : chaque situation montre son énoncé et ses cartes
  const expect = [/ميزانية|مداخيل/, /التوقيت|لندن/, /تاهات|ملغيغ/, /تبليط|المعلم/, /المصعد|سمير/, /سليم/];
  for (let n = 1; n <= 6; n += 1) {
    await goto(page, `${BASE}${CH}/${LESSON}/wadiya-${n}`);
    const t = await page.locator('body').innerText();
    check(expect[n - 1].test(t), `module ${n} : la situation est présentée`);
    check(!/الكتاب(?!ة)/.test(t), `module ${n} : aucun renvoi au manuel`);
    const hasSupport = (await page.locator('[data-problem-table], [data-problem-illustration], [aria-label*="معلم متعامد"]').count()) > 0;
    check(hasSupport, `module ${n} : un support dessiné est affiché (tableau, repère ou scène)`);
  }

  // module 7 : l'entrée présente la situation, sans la résoudre
  await goto(page, `${BASE}${CH}/${LESSON}/tahlil-wadiya`);
  const t7 = await page.locator('body').innerText();
  check(/الجلفة/.test(t7) && /المخيّم/.test(t7), 'module 7 : la situation du camp d\'hiver à Djelfa est présentée');
  check(!/6,5|6\.5|\u202a?\+1\b.*تحت محور/.test(t7), "module 7 : rien n'est résolu (ni +6,5, ni le point du jour 4)");
  await page.screenshot({ path: `${OUT}/m7.png`, fullPage: true });

  // module 7 : on joue les huit étapes (tri des données, trois lignes d'analyse, six décisions), puis la fiche mémo de fin de module doit tenir dans ses cartes
  {
    const usefulZone = page.locator('[role=button][aria-label="معطيات مفيدة"]').first();
    const uselessZone = page.locator('[role=button][aria-label="معطيات غير مفيدة"]').first();
    const items = [['الصغرى في الأيام', true], ['الكبرى في الأيام', true], ['الأيام مرقّمة', true], ['كلّ يوم نقطة', true], ['الدرجات بالدرجة المئوية', true], ['المخيّم في الجلفة في فصل', true], ['شارك في المخيّم', false], ['نُقل التلاميذ', false]];
    for (const [txt, ok] of items) {
      await page.getByRole('button', { name: new RegExp(txt) }).first().click().catch(() => {});
      await (ok ? usefulZone : uselessZone).click().catch(() => {});
    }
    await page.waitForTimeout(600);
    for (let i = 0; i < 3; i += 1) { await page.getByRole('button', { name: /السطر التالي/ }).first().click().catch(() => {}); await page.waitForTimeout(250); }
    const answers = ['ترتيب الدرجات الصغرى الخمس تصاعديًا', 'المسافة بين العددين: الأكبر ناقص الأصغر', 'الجديد ناقص القديم، وإشارته', 'الحساب معكوس: التغيّر بعد ارتفاع', 'الدرجتان على جهتين من الصفر فالفارق', 'جمعًا جبريًا: الموجبة مع الموجبة'];
    for (const a of answers) { await page.getByRole('button', { name: new RegExp(a) }).first().click().catch(() => {}); await page.waitForTimeout(350); }
    await page.waitForTimeout(800);
    const memo = page.locator('[data-memo-card]');
    const n = await memo.count();
    check(n >= 1, `module 7 : la fiche mémo de fin de module s'affiche (${n} carte(s))`);
    if (n) {
      const bad = await page.evaluate(() => {
        const out = [];
        for (const card of document.querySelectorAll('[data-memo-card]')) {
          const cb = card.getBoundingClientRect();
          const ks = [...card.querySelectorAll('.katex')].map((k) => k.getBoundingClientRect());
          ks.forEach((b, i) => {
            if (b.left < cb.left - 1 || b.right > cb.right + 1) out.push(`formule hors de la carte (${Math.round(b.left)}–${Math.round(b.right)} / ${Math.round(cb.left)}–${Math.round(cb.right)})`);
            ks.slice(i + 1).forEach((o) => { if (b.left < o.right - 1 && o.left < b.right - 1 && b.top < o.bottom - 1 && o.top < b.bottom - 1) out.push('deux formules se chevauchent'); });
          });
        }
        return out;
      });
      check(bad.length === 0, `module 7 : aucune formule de la fiche mémo ne sort de sa carte ni n'en chevauche une autre ${bad.slice(0, 2).join(' | ')}`);
    }
    await memo.first().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/m7-memo.png`, fullPage: false });
    check(!/\$[^$\s][^$]*\$/.test(await page.locator('body').innerText()), 'module 7 : aucun « $ » brut après les réponses (explications comprises)');
  }

  // module 8 : l'évaluation — les cinq épreuves
  await goto(page, `${BASE}${CH}/${LESSON}/ahill`);
  const t8 = await page.locator('body').innerText();
  check(/الجلفة/.test(t8), 'module 8 : la وضعية finale est affichée');
  const radios = await page.locator('button:visible, [role=radio]:visible').count();
  check(radios >= 5, `module 8 : des options à cocher (${radios} boutons)`);
  await page.screenshot({ path: `${OUT}/m8.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
check(consoleErrors.length === 0, `aucune erreur console (${consoleErrors.length}) ${consoleErrors.slice(0, 3).join(' | ')}`);
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert');
process.exit(failures.length ? 1 : 0);
