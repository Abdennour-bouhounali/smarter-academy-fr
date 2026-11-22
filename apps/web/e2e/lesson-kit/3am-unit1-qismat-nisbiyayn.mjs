// QA — 3AM, unité 1 « الأعداد النسبية » : leçon `qismat-nisbiyayn` « حاصل قسمة عددين نسبيين » (labo `code-lockers`, خزائن الأمانات) —
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-unit1-qismat-nisbiyayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : molettes au clic des ▲/▼, au POINTEUR (glisser une molette), au clavier (↑ ↓ ← →) et poignée tirée au pointeur ; m1 (−6 × ? = 48 → −8),
//      m2 (le signe faux est refusé avec son calcul), m3 (l'inconnue écrite en premier), m4 (−5 refusé avec 60) ; متقدم : molettes de chiffres VERROUILLÉES
//      avant « ثبّت », signe faux refusé avec son calcul puis libéré, a1 … a4 ; le monde `fraction` (deux essais décimaux, « وضع الكسر », deux écritures,
//      −2/−3) ; « جرّب أعدادك » (b = 0) ;
//   4. le bloc `[data-cl-glance]` aux quatre tailles et aux trois mondes (seul le débordement horizontal est un échec) ;
//   5. captures (état initial, mi-activité) dans /tmp/qa-qismat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-qismat';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'qismat-nisbiyayn';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
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

async function contextFor(browser, token, viewport, coachOff = true) {
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
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.code-lockers.off', '1'); } catch { /* noop */ }
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

const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const settle = (page, ms = 450) => page.waitForTimeout(ms);
const toCenter = async (page, sel) => { await vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); };
const verdict = async (page) => (await vis(page, '[data-cl-verdict]').getAttribute('data-cl-verdict')) ?? '';
const verdictText = async (page) => (await vis(page, '[data-cl-verdict]').innerText()).replace(/[⁦⁩‎]/g, '');
const screenText = async (page) => (await vis(page, '[data-cl-screen]').innerText()).replace(/[⁦⁩‎]/g, '');
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(450);
};
async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}

/* ── les molettes ── */
const wheel = (page, key) => page.locator(`[data-cl-wheel="${key}"]:visible`).first();
const wheelValue = async (page, key) => Number(await wheel(page, key).getAttribute('data-value'));
/** Roule une molette (▲ / ▼, ou le toucher de la molette de signe) jusqu'à la valeur visée. */
async function setWheel(page, key, target) {
  const signKey = ['s', 'ns', 'ds'].includes(key);
  for (let i = 0; i < 24; i += 1) {
    const v = await wheelValue(page, key);
    if (v === target) return;
    await toCenter(page, `[data-cl-wheel="${key}"]`);
    if (signKey) await wheel(page, key).locator('[role="spinbutton"]').click();
    else await vis(page, `[data-cl-up="${key}"]`).click();
    await page.waitForTimeout(60);
  }
  throw new Error(`molette ${key} : ${target} introuvable`);
}
const pull = async (page, ms = 600) => { await toCenter(page, '[data-cl-handle]'); await vis(page, '[data-cl-handle]').click(); await page.waitForTimeout(ms); };
const next = async (page) => { await toCenter(page, '[data-cl-next]'); await vis(page, '[data-cl-next]').click(); await settle(page, 500); };

const browser = await chromium.launch();
const token = await loginToken(TEACHER);
const errors = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|401|404/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`.slice(0, 200)));
};

/* ── 1. le sommaire et chaque module aux quatre tailles ──────────────────────────────────────── */
if (!process.env.LABS_ONLY) {
  for (const [w, h] of SIZES) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    watch(page);
    await goto(page, `${BASE}${CH}/${LESSON}`);
    check(await page.locator('body').innerText().then((t) => t.includes('حاصل قسمة عددين نسبيين')), `${w}×${h}: le sommaire s'ouvre`);
    await pageHealth(page, `${w} sommaire`);
    for (const slug of MODULES) {
      await goto(page, `${BASE}${CH}/${LESSON}/${slug}`);
      const text = await page.locator('body').innerText();
      check(text.length > 200, `${w}×${h} ${slug}: monté`);
      await pageHealth(page, `${w}×${h} ${slug}`);
    }
    await ctx.close();
  }
}

/* ── 2. guide §4quater : rien au-dessus du labo, les briques cachées avant la réponse ─────────── */
const lab = await contextFor(browser, token, { width: 1280, height: 800 });
const page = await lab.newPage();
watch(page);
await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
await page.waitForSelector('[data-cl-glance]:visible');
check(await page.locator('[data-module-brief]').count() === 0, 'module 1: aucune carte [data-module-brief] au-dessus du labo');
const order = await page.evaluate(() => {
  const labEl = document.querySelector('[data-code-lockers]');
  const q = document.querySelector('[data-activity-evidence]');
  return labEl && q ? !!(labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
});
check(order, 'module 1: le labo vient avant la première question');
check(await page.locator('[data-knowledge-brick]').count() === 0, 'module 1: aucune brique avant la réponse');
check((await vis(page, '[data-lab-context]').innerText()).includes('المكتبة البلدية'), 'le labo s\'ouvre sur son contexte (المكتبة البلدية)');
check((await vis(page, '[data-lab-question]').innerText()).includes('اسحب المقبض'), 'puis UNE question qui nomme le geste et le but (حتى تُفتح الخزانة)');
check((await vis(page, '[data-cl-rule]').innerText()).replace(/[⁦⁩‎]/g, '').includes('(−6) × ? = 48'), 'la plaque écrit la règle (−6) × ? = 48');
check(await page.locator('[data-cl-small]:visible').count() === 4, 'le mur porte quatre petits casiers');
check(await page.locator('[data-cl-wheel]:visible').count() === 3, 'مبتدئ : trois molettes (signe, dizaines, unités)');
await page.screenshot({ path: `${OUT}/initial-1280x800.png` });

/* ── 3. m1 : les molettes au clic, au clavier, au pointeur ────────────────────────────────────── */
check((await screenText(page)).includes('(−6) × 0 = 0'), 'm1 : l\'écran multiplie en direct (−6 × 0 = 0)');
await setWheel(page, 'u', 3);
check((await screenText(page)).includes('(−6) × 3 = −18'), 'm1 : l\'écran suit la molette (−6 × 3 = −18)');
// clavier : ↑ sur la molette des unités puis ← → entre molettes
await toCenter(page, '[data-cl-wheel="u"]');
await wheel(page, 'u').locator('[role="spinbutton"]').focus();
await page.keyboard.press('ArrowUp');
check(await wheelValue(page, 'u') === 4, 'clavier : ↑ augmente la molette des unités (4)');
await page.keyboard.press('ArrowLeft');
check(await page.evaluate(() => document.activeElement?.closest('[data-cl-wheel]')?.getAttribute('data-cl-wheel')) === 't', 'clavier : ← passe à la molette voisine (dizaines)');
await page.keyboard.press('ArrowRight');
// pointeur : glisser la molette des unités vers le haut de 3 crans
{
  const box = await wheel(page, 'u').locator('[role="spinbutton"]').boundingBox();
  const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 6; i += 1) await page.mouse.move(cx, cy - i * 14);
  await page.mouse.up(); await page.waitForTimeout(150);
  check(await wheelValue(page, 'u') === 7, 'pointeur : glisser vers le haut roule la molette (4 → 7)');
}
// le signe se retourne au toucher ; code −8
await setWheel(page, 's', -1);
await setWheel(page, 'u', 8);
check((await screenText(page)).includes('(−6) × (−8) = 48'), 'm1 : l\'écran montre (−6) × (−8) = 48 avant même le tirage');
{
  // la poignée tirée au pointeur (glisser vers le bas)
  await toCenter(page, '[data-cl-handle]');
  const hb = await vis(page, '[data-cl-handle]').boundingBox();
  const hx = hb.x + hb.width / 2; const hy = hb.y + hb.height / 2;
  await page.mouse.move(hx, hy); await page.mouse.down();
  for (let i = 1; i <= 6; i += 1) await page.mouse.move(hx, hy + i * 8);
  await page.mouse.up(); await page.waitForTimeout(900);
}
check(await verdict(page) === 'right', 'm1 : −8 ouvre la première خزانة (poignée tirée)');
check((await verdictText(page)).includes('48 ÷ (−6) = −8'), 'm1 : le verdict écrit la division « 48 ÷ (−6) = −8 »');
check(await vis(page, '[data-cl-locker]').getAttribute('data-open') === 'true', 'm1 : la porte s\'ouvre');
check(await vis(page, '[data-cl-row]').count() === 1, 'm1 : une ligne dans le سجلّ des خزائن');
await page.screenshot({ path: `${OUT}/m1-open-1280x800.png` });
await next(page);

/* m2 : 9 × ? = −54 — un signe faux est refusé avec son calcul */
check((await vis(page, '[data-cl-rule]').innerText()).replace(/[⁦⁩‎]/g, '').includes('9 × ? = −54'), 'm2 : la plaque écrit 9 × ? = −54');
await setWheel(page, 's', 1); await setWheel(page, 'u', 6);
await pull(page);
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('9 × 6 = 54') && (await verdictText(page)).includes('−54'), 'm2 : le code 6 est refusé avec son calcul « 9 × 6 = 54 ، والقفل يريد −54 »');
check(Number(await vis(page, '[data-cl-shake]').getAttribute('data-cl-shake')) >= 1, 'm2 : la porte se secoue');
await setWheel(page, 's', -1);
await pull(page);
check(await verdict(page) === 'right', 'm2 : −6 ouvre la خزانة');
await next(page);

/* m3 : ? × (−7) = −63, l'inconnue d'abord */
check((await vis(page, '[data-cl-rule]').innerText()).replace(/[⁦⁩‎]/g, '').includes('? × (−7) = −63'), 'm3 : la plaque écrit ? × (−7) = −63 (l\'inconnue d\'abord)');
await setWheel(page, 's', -1); await setWheel(page, 'u', 9);
check((await screenText(page)).includes('(−9) × (−7) = 63'), 'm3 : le code −9 donne (−9) × (−7) = 63 à l\'écran');
await pull(page);
check(await verdict(page) === 'wrong', 'm3 : −9 est refusé (63, pas −63)');
await setWheel(page, 's', 1);
await pull(page);
check(await verdict(page) === 'right', 'm3 : 9 ouvre la خزانة');
await next(page);

/* m4 : (−12) × ? = −60 — −5 est refusé avec 60 */
await setWheel(page, 's', -1); await setWheel(page, 'u', 5);
await pull(page);
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('(−12) × (−5) = 60'), 'm4 : −5 est refusé avec « (−12) × (−5) = 60 »');
await setWheel(page, 's', 1);
await pull(page);
check(await verdict(page) === 'right', 'm4 : 5 ouvre la خزانة');
check(await vis(page, '[data-code-lockers]').getAttribute('data-solved') === 'true', 'm1–m4 : la découverte est gagnée');
check(await page.locator('[data-cl-row]:visible').count() === 4, 'le سجلّ porte une ligne par خزانة ouverte');
await page.screenshot({ path: `${OUT}/m4-open-1280x800.png` });

/* le module 1 : les questions lisent le سجلّ de l'élève ; les briques n'apparaissent qu'APRÈS la réponse */
await toCenter(page, '[data-evidence="m1"]');
check(await vis(page, '[data-evidence="m1"]').getAttribute('data-tried') === 'true', 'module 1 : la preuve m1 est lue du labo');
await toCenter(page, '[data-evidence="rule"]');
check(await vis(page, '[data-evidence="rule"]').getAttribute('data-tried') === 'true', 'module 1 : la preuve des quatre خزائن est lue du labo');
const clickText = async (pg, text, nth = 0) => { const l = pg.getByText(text, { exact: true }).nth(nth); await l.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await l.click(); await pg.waitForTimeout(500); };
const fillNumber = async (pg, value, nth = 0) => { const i = pg.locator('input[aria-label="إجابة"]:not([disabled]):not([readonly]):visible').nth(nth); await i.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await i.fill(value); await i.press('Enter'); await pg.waitForTimeout(500); };
await fillNumber(page, '-8');
check(await page.locator('[data-knowledge-brick]').count() === 1, 'module 1 q1 : la brique « حاصل القسمة عامل مجهول » apparaît APRÈS la réponse');
await clickText(page, 'لهما الإشارة نفسها');
check(await page.locator('[data-knowledge-brick]').count() === 2, 'module 1 q2 : la brique de la règle des signes apparaît APRÈS la réponse');
await fillNumber(page, '8');
await fillNumber(page, '-8', 0);
check((await page.locator('body').innerText()).includes('نتحقّق: $') === false, 'module 1 q3 : les deux quotients sont acceptés');

/* ── 4. متقدم : le signe est une prédiction ─────────────────────────────────────────────────────── */
await pickLevel(page, 'advanced');
check(await page.locator('[data-cl-wheel="u"][data-locked="true"]:visible').count() === 1, 'متقدم : les molettes de chiffres sont VERROUILLÉES avant « ثبّت »');
check(await page.locator('[data-cl-commit]:visible').isDisabled(), 'متقدم : « ثبّت » est fermé tant que le signe n\'a pas bougé');
check((await screenText(page)).includes('? = ?'), 'متقدم : l\'écran ne multiplie pas encore (« (−8) × ? = ? »)');
// a1 : (−8) × ? = −2 → 0,25 (positif). On se trompe d'abord de signe : −
await setWheel(page, 's', -1);
await toCenter(page, '[data-cl-commit]');
await vis(page, '[data-cl-commit]').click(); await settle(page, 300);
check(await page.locator('[data-cl-wheel="u"][data-locked="false"]:visible').count() === 1, 'متقدم : après « ثبّت » les molettes de chiffres se débloquent');
check(await wheel(page, 's').getAttribute('data-locked') === 'true', 'متقدم : la molette de signe est verrouillée après « ثبّت »');
await pull(page);
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('(−8) × (−0,25) = 2') && (await verdictText(page)).includes('−2'), 'متقدم a1 : le signe − est refusé au premier tirage avec « (−8) × (−0,25) = 2 ، والقفل يريد −2 »');
check(await wheel(page, 's').getAttribute('data-locked') === 'false', 'متقدم a1 : la molette de signe est libérée');
await setWheel(page, 's', 1);
await vis(page, '[data-cl-commit]').click(); await settle(page, 300);
await setWheel(page, 'd1', 2); await setWheel(page, 'd2', 5);
await pull(page);
check(await verdict(page) === 'right' && (await verdictText(page)).includes('0,25'), 'متقدم a1 : +0,25 ouvre la خزانة');
await page.screenshot({ path: `${OUT}/a1-open-1280x800.png` });
await next(page);
await setWheel(page, 's', -1); await vis(page, '[data-cl-commit]').click(); await settle(page, 300);
await setWheel(page, 'u', 3); await pull(page);
check(await verdict(page) === 'right', 'متقدم a2 : −3 ouvre 2,5 × ? = −7,5');
await next(page);
await setWheel(page, 's', -1); await vis(page, '[data-cl-commit]').click(); await settle(page, 300);
await setWheel(page, 'u', 3); await pull(page);
check(await verdict(page) === 'right', 'متقدم a3 : −3 ouvre (−0,4) × ? = 1,2');
await next(page);
await setWheel(page, 's', -1); await vis(page, '[data-cl-commit]').click(); await settle(page, 300);
await pull(page);
check(await verdict(page) === 'right' && (await vis(page, '[data-cl-rule]').innerText()).replace(/[⁦⁩‎]/g, '').includes('? × (−5) = 0'), 'متقدم a4 : le code 0 (avec le signe −) ouvre ? × (−5) = 0 : −0 = 0');
check(await vis(page, '[data-code-lockers]').getAttribute('data-solved') === 'true', 'متقدم : la découverte est gagnée');
await lab.close();

/* ── 5. le monde fraction, posé seul en معارف ──────────────────────────────────────────────────── */
const fc = await contextFor(browser, token, { width: 1024, height: 768 });
const fp = await fc.newPage();
watch(fp);
await goto(fp, `${BASE}${CH}/${LESSON}/maarif`);
await fp.waitForSelector('[data-code-lockers][data-world="fraction"]');
check(await fp.locator('[data-recall-link]').count() === 0 || await fp.locator('[data-recall-link]').count() === 2, 'معارف : les deux « تذكّر » de l\'unité (liens seulement si les leçons sont publiées)');
check(await fp.locator('[data-cl-switch]').count() === 0, 'fraction : pas de « وضع الكسر » avant deux essais');
await setWheel(fp, 's', -1); await setWheel(fp, 'd1', 6); await setWheel(fp, 'd2', 6);
await pull(fp);
check(await verdict(fp) === 'wrong' && (await verdictText(fp)).includes('(−6) × (−0,66) = 3,96'), 'fraction : −0,66 est refusé avec « (−6) × (−0,66) = 3,96 »');
await setWheel(fp, 'd2', 7);
await pull(fp);
check((await verdictText(fp)).includes('(−6) × (−0,67) = 4,02'), 'fraction : −0,67 est refusé avec « (−6) × (−0,67) = 4,02 »');
check(await fp.locator('[data-cl-switch]:visible').count() === 1, 'fraction : « وضع الكسر » apparaît après deux essais');
await toCenter(fp, '[data-cl-switch]'); await vis(fp, '[data-cl-switch]').click(); await settle(fp, 400);
check(await fp.locator('[data-cl-wheel="ns"]:visible').count() === 1 && await fp.locator('[data-cl-wheel="ds"]:visible').count() === 1, 'fraction : trois signes et deux nombres de molettes');
await setWheel(fp, 'ns', -1); await setWheel(fp, 'n', 2); await setWheel(fp, 'd', 3);
await pull(fp);
check(await verdict(fp) === 'right' && (await verdictText(fp)).includes('−2/3'), 'fraction : (−2)/3 ouvre la خزانة (première écriture)');
check(await fp.locator('[data-cl-next]').count() === 0, 'fraction : une seule écriture ne finit pas la mission');
await pull(fp);
check((await verdictText(fp)).includes('فتحت الخزانة من قبل'), 'fraction : la même écriture deux fois est signalée');
await setWheel(fp, 'ns', 1); await setWheel(fp, 'ds', -1);
await pull(fp);
check(await verdict(fp) === 'right' && await fp.locator('[data-cl-next]:visible').count() === 1, 'fraction : 2/(−3) ouvre aussi : deux écritures, la mission est finie');
await fp.screenshot({ path: `${OUT}/fraction-1024x768.png` });
await next(fp);
await setWheel(fp, 'ns', -1); await setWheel(fp, 'ds', -1); await setWheel(fp, 'n', 2); await setWheel(fp, 'd', 3);
await pull(fp);
check(await verdict(fp) === 'right', 'fraction F2 : (−2)/(−3) ouvre (−9) × ? = −6');
await setWheel(fp, 'ns', 1); await setWheel(fp, 'ds', 1);
await pull(fp);
check(await vis(fp, '[data-code-lockers]').getAttribute('data-solved') === 'true', 'fraction F2 : 2/3 ouvre aussi : la découverte est gagnée');
// les questions du module lisent le سجلّ
await toCenter(fp, '[data-evidence="fraction"]');
check(await vis(fp, '[data-evidence="fraction"]').getAttribute('data-tried') === 'true', 'module 2 : la preuve des deux écritures est lue du labo');
const scrollClick = async (l) => { await l.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await l.click(); await fp.waitForTimeout(150); };
for (let i = 0; i < 3; i += 1) await scrollClick(fp.getByText('يفتح', { exact: true }).nth(i));
await scrollClick(fp.getByText('لا يفتح', { exact: true }).nth(3));
await fp.waitForTimeout(500);
check(await fp.locator('[data-knowledge-brick]').count() >= 1, 'module 2 q1 : la brique des écritures apparaît APRÈS la réponse');
await fp.close();
await fc.close();

/* ── 5bis. l'onboarding (LabCoach) : un anneau et une phrase sur la molette, jamais la règle ─────── */
const cc = await contextFor(browser, token, { width: 1280, height: 800 }, false);
const cp = await cc.newPage();
watch(cp);
await goto(cp, `${BASE}${CH}/${LESSON}/nashat`);
await cp.waitForSelector('[data-lab-coach]:visible', { timeout: 15000 }).catch(() => {});
check(await cp.locator('[data-lab-coach][data-step="digit"]:visible').count() === 1, 'LabCoach : la première bulle montre une molette de chiffres (data-step="digit")');
check(!/موجب|سالب|فردي|زوجي/.test(await cp.locator('[data-lab-coach]:visible').first().innerText()), 'LabCoach : la bulle ne dit jamais la règle');
await cc.close();

/* ── 6. « جرّب أعدادك » : b = 0 est montré honnêtement ─────────────────────────────────────────── */
const fr = await contextFor(browser, token, { width: 1366, height: 768 });
const zp = await fr.newPage();
watch(zp);
await goto(zp, `${BASE}${CH}/${LESSON}/nashat`);
await zp.waitForSelector('[data-cl-free]');
await toCenter(zp, '[data-cl-free-b]');
await vis(zp, '[data-cl-free-b]').fill('0'); await vis(zp, '[data-cl-free-a]').fill('5');
await vis(zp, '[data-cl-free-set]').click(); await settle(zp, 400);
check(await vis(zp, '[data-cl-free]').getAttribute('data-active') === 'true', 'libre : le قفل libre est monté');
check(await zp.locator('[data-cl-wheel="d2"]:visible').count() === 1, 'libre : cinq molettes (signe, dizaines, unités, dixièmes, centièmes)');
await setWheel(zp, 'u', 3);
await pull(zp);
check((await verdictText(zp)).includes('الناتج لا يتغيّر مهما كان الرمز'), 'libre : 0 × ? = 5 est refusé « مهما كان الرمز »');
await toCenter(zp, '[data-cl-free-b]');
await vis(zp, '[data-cl-free-a]').fill('0'); await vis(zp, '[data-cl-free-set]').click(); await settle(zp, 400);
await pull(zp);
check((await verdictText(zp)).includes('كل الرموز'), 'libre : 0 × ? = 0 est ouvert par tout code');
await toCenter(zp, '[data-cl-free-b]');
await vis(zp, '[data-cl-free-b]').fill('21');
check(await vis(zp, '[data-cl-free-set]').isDisabled(), 'libre : 21 est refusé (de −20 à 20)');
await fr.close();

/* ── 7. le bloc [data-cl-glance] aux quatre tailles, aux deux niveaux et au monde fraction ─────── */
for (const [w, h] of SIZES) {
  for (const [slug, level] of [['nashat', 'beginner'], ['nashat', 'advanced'], ['maarif', null]]) {
    const c = await contextFor(browser, token, { width: w, height: h });
    const p = await c.newPage();
    watch(p);
    await goto(p, `${BASE}${CH}/${LESSON}/${slug}`);
    await p.waitForSelector('[data-cl-glance]:visible');
    if (level === 'advanced') await pickLevel(p, 'advanced');
    const m = await p.evaluate(() => {
      const g = [...document.querySelectorAll('[data-cl-glance]')].find((e) => e.offsetParent);
      const r = g.getBoundingClientRect();
      const labEl = g.closest('[data-code-lockers]');
      return { w: Math.round(r.width), h: Math.round(r.height), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, labOverflow: labEl.scrollWidth - labEl.clientWidth };
    });
    console.log(`  ${w}×${h} ${slug}${level ? `/${level}` : ''}: bloc ${m.w}×${m.h} px`);
    check(m.overflow <= 1 && m.labOverflow <= 1, `${w}×${h} ${slug}${level ? `/${level}` : ''}: le labo ne déborde pas (${m.overflow} / ${m.labOverflow}px)`);
    await p.locator('[data-code-lockers]:visible').first().screenshot({ path: `${OUT}/glance-${slug}-${level ?? 'fraction'}-${w}x${h}.png` });
    await c.close();
  }
}

/* ── 8. aucune erreur console ─────────────────────────────────────────────────────────────────── */
check(errors.length === 0, `aucune erreur console${errors.length ? ` : ${JSON.stringify(errors.slice(0, 3))}` : ''}`);

await browser.close();
if (failures.length) {
  console.log(`\n${failures.length} échec(s) :`);
  for (const f of failures) console.log(` - ${f}`);
  process.exit(1);
}
console.log('\nTout est vert.');
