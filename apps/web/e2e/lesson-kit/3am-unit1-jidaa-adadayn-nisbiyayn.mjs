// QA — 3AM, unité 1 « الأعداد النسبية » : leçon `jidaa-adadayn-nisbiyayn` « جداء عددين نسبيين » (labos `elevator-reel` et `sign-machine`) —
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-unit1-jidaa-adadayn-nisbiyayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au CLAVIER et au POINTEUR : l'étage −6 (3 minutes), l'arrêt refusé avec son calcul, la surprise du temps négatif
//      (étage 4), « جرّب أعدادك » (vitesse 0), la prédiction de متقدم (carte fausse puis juste) et la mission « بطريقتين » ;
//   4. le bloc `[data-er-glance]` aux cinq tailles, aux deux niveaux (mesure rapportée ; seul le débordement horizontal est un échec) ;
//   5. captures (état initial, refus, réussite, prédiction, phase formelle) dans /tmp/qa-jidaa ;
//   6. module 2 (`sign-machine`, 2026-10-27) : le côté négatif verrouillé avant la prédiction, la carte fausse SANS la réponse, le pointeur
//      sur le rail, le clavier, le produit 12 en −4 puis la découverte ; متقدم : retourner le signe du premier facteur renverse le tableau.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-jidaa';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'jidaa-adadayn-nisbiyayn';
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
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
    try { localStorage.setItem('token', tk); if (off) { localStorage.setItem('sa.labCoach.elevator-reel.off', '1'); localStorage.setItem('sa.labCoach.sign-machine.off', '1'); } } catch { /* noop */ }
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
const center = async (page, sel) => { await vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(150); };
const verdict = async (page) => (await vis(page, '[data-er-verdict]').getAttribute('data-er-verdict')) ?? '';
const readT = async (page) => Number(await vis(page, '[data-er-knob]').getAttribute('data-t'));
const floorNow = async (page) => Number(await vis(page, '[data-er-cabin]').getAttribute('data-floor'));
async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); } catch (e) { if (!/Timeout/.test(String(e))) throw e; await page.waitForLoadState('load'); }
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);
const errors = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|401|404/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`.slice(0, 200)));
};

/* ── 1. le sommaire et chaque module à 768 et 1280 px ────────────────────────────────────────── */
if (!process.env.LABS_ONLY) {
  for (const [w, h] of [[768, 1024], [1280, 800]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    watch(page);
    await goto(page, `${BASE}${CH}/${LESSON}`);
    check(await page.locator('body').innerText().then((t) => t.includes('جداء عددين نسبيين')), `${w}: le sommaire s'ouvre`);
    await pageHealth(page, `${w} sommaire`);
    for (const slug of MODULES) {
      await goto(page, `${BASE}${CH}/${LESSON}/${slug}`);
      const text = await page.locator('body').innerText();
      check(text.length > 200, `${w} ${slug}: monté`);
      await pageHealth(page, `${w} ${slug}`);
    }
    await ctx.close();
  }
}

/* ── 2. guide §4quater : rien au-dessus du labo, les briques cachées avant la réponse ─────────── */
const lab = await contextFor(browser, token, { width: 1280, height: 800 });
const page = await lab.newPage();
watch(page);
await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
await page.waitForSelector('[data-er-glance]:visible');
check(await page.locator('[data-module-brief]').count() === 0, 'module 1: aucune carte [data-module-brief] au-dessus du labo');
const order = await page.evaluate(() => {
  const labEl = document.querySelector('[data-elevator-reel]');
  const q = document.querySelector('[data-activity-evidence]');
  return labEl && q ? !!(labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
});
check(order, 'module 1: le labo vient avant la première question');
check(await page.locator('[data-knowledge-brick]').count() === 0, 'module 1: aucune brique avant la réponse');
check((await page.locator('[data-lab-context]:visible').first().innerText()).includes('طابقين'), 'le labo s\'ouvre sur son contexte (2 طوابق/د)');
check((await page.locator('[data-lab-question]:visible').first().innerText()).includes('−6'), 'puis UNE question qui nomme l\'étage −6');
await page.screenshot({ path: `${OUT}/initial-1280x800.png` });

/* ── 3. le labo au clavier et au pointeur (مبتدئ) ───────────────────────────────────────────── */
// l'écran de jeu (ManipulationShell `immersive`, 2026-10-27) : le labo couvre tout l'écran, « خروج » le rend à la page
check(await page.locator('[data-er-speed-card]:visible').count() === 1, 'la vitesse est une carte à part (−2, flèche, phrase)');
await vis(page, '[data-manipulation-immersive-enter]').click();
await page.waitForSelector('[data-immersive="on"]', { timeout: 3000 }).catch(() => {});
check(await page.locator('[data-immersive="on"]').count() === 1, 'العب بملء الشاشة → le labo couvre l\'écran');
await page.waitForTimeout(400);
const game = await page.evaluate(() => {
  const host = document.querySelector('[data-immersive="on"]');
  const stage = host.querySelector('[data-er-stage]').getBoundingClientRect();
  const record = host.querySelector('[data-er-record]').getBoundingClientRect();
  return { vh: innerHeight, stage: Math.round(stage.bottom), record: Math.round(record.bottom), tower: Math.round(stage.height) };
});
console.log(`   écran de jeu 1280×800 : tour ${game.tower} px, bas de la tour ${game.stage}, bas du سجلّ ${game.record} / ${game.vh}`);
check(game.stage <= game.vh, 'écran de jeu : la tour tient dans la hauteur de l\'écran');
await page.screenshot({ path: `${OUT}/ecran-de-jeu-1280x800.png` });
await vis(page, '[data-manipulation-immersive-exit]').click();
await page.waitForSelector('[data-immersive="off"]', { timeout: 3000 }).catch(() => {});
check(await page.locator('[data-immersive="off"]:visible').count() === 1, 'خروج → le labo revient dans la page');
await center(page, '[data-er-knob]');
await vis(page, '[data-er-knob]').focus();
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
check(await verdict(page) === 'wrong', 'm1: t = 2 est refusé');
check(!(await vis(page, '[data-er-verdict]').innerText()).includes('×'), 'm1: le refus dit le temps et l\'étage, JAMAIS le calcul avant la découverte');
check(await page.locator('[data-er-play]').count() === 0, 'm1: pas de film avant la prédiction p1');
check(await floorNow(page) === -4, 'm1: la cabine est à l\'étage −4');
await page.screenshot({ path: `${OUT}/m1-refus-1280x800.png` });
await page.keyboard.press('ArrowRight');
check(await verdict(page) === 'right' && await floorNow(page) === -6, 'm1: t = 3 → étage −6, réussi');
check(await page.locator('[data-er-arrow]').count() === 3, 'm1: trois flèches empilées (une par minute)');
await page.screenshot({ path: `${OUT}/m1-succes-1280x800.png` });
await vis(page, '[data-er-next]').click();
// p1 : PRÉDIRE où était l'ascenseur une minute AVANT son passage (cartes, sans ligne du temps)
check(await page.locator('[data-er-cards]:visible').count() === 1 && await page.locator('[data-er-knob]').count() === 0, 'p1: les cartes, pas de ligne du temps');
await vis(page, '[data-er-card="-2"]').click();
check(await verdict(page) === 'wrong' && await floorNow(page) === 2, 'p1: la carte −2 est refusée, la cabine montre l\'étage 2');
await vis(page, '[data-er-card="2"]').click();
check(await verdict(page) === 'right', 'p1: la carte 2 est juste');
await vis(page, '[data-er-next]').click();
// m2 : le temps NÉGATIF — la cabine d'un ascenseur qui descend apparaît AU-DESSUS de la rue
await center(page, '[data-er-knob]');
await vis(page, '[data-er-knob]').focus();
await page.keyboard.press('Home');
check(await readT(page) === -3 && await floorNow(page) === 6, 'm2: t = −3 → la cabine est à l\'étage 6 (au-dessus de la rue)');
await page.keyboard.press('ArrowRight');
check(await verdict(page) === 'right' && await floorNow(page) === 4, 'm2: t = −2 → étage 4 (la surprise), réussi');
check((await page.locator('[data-er-arrow][data-dashed="true"]').count()) === 2, 'm2: deux flèches en pointillé (le chemin qui reste)');
await page.screenshot({ path: `${OUT}/m2-succes-1280x800.png` });
// au pointeur : un tap sur la règle pose le curseur
const rect = await vis(page, '[data-er-ruler]').boundingBox();
await page.mouse.click(rect.x + rect.width * 0.5, rect.y + rect.height / 2);
check(await readT(page) === 0, 'tap au milieu de la règle → t = 0');
await page.mouse.click(rect.x + rect.width * 0.95, rect.y + rect.height / 2);
check(await readT(page) === 3, 'tap au bout droit → t = 3');
// le record se remplit
check(await page.locator('[data-er-row]').count() === 3, 'le سجلّ garde les trois missions réussies (m1, p1, m2)');
// le film, maintenant que la prédiction est faite : la cabine se déplace seule, puis rend la main
check(await page.locator('[data-er-play]:visible').count() === 1, 'm2: « شغّل التسجيل » après la prédiction');
await vis(page, '[data-er-play]').click();
await page.waitForTimeout(1200);
check(await page.locator('[data-er-play][data-playing="true"]').count() === 1, 'le film joue');
await page.waitForTimeout(5000);
check(await page.locator('[data-er-play][data-playing="false"]').count() === 1, 'le film s\'arrête et rend la main');
// m3 et m4
await vis(page, '[data-er-next]').click().catch(() => {});
for (const [goalT, key] of [[2, 'm3'], [-3, 'm4']]) {
  await center(page, '[data-er-knob]');
  await vis(page, '[data-er-knob]').focus();
  await page.keyboard.press('Home');
  const steps = goalT + 3;
  for (let i = 0; i < steps; i += 1) await page.keyboard.press('ArrowRight');
  check(await verdict(page) === 'right', `${key}: t = ${goalT} réussi`);
  if (key === 'm3') await vis(page, '[data-er-next]').click();
}
// la découverte puis la phase formelle
await page.waitForSelector('[data-manipulation-discovery]', { timeout: 5000 }).catch(() => {});
check(await page.locator('[data-manipulation-discovery]').count() > 0, 'les cinq missions ouvrent la découverte (la distance de l\'étage)');
await page.locator('[data-manipulation-discovery] button').nth(1).click().catch(() => {});
await page.waitForTimeout(400);
check(await page.locator('[data-er-formal]').count() > 0, 'la bonne conjecture ouvre la phase formelle');
check(await page.locator('[data-er-calc]').count() > 0, 'après la découverte, l\'arrêt écrit enfin son calcul');
await page.screenshot({ path: `${OUT}/formelle-1280x800.png` });
// « جرّب أعدادك » : vitesse 0
await center(page, '[data-er-free-r]');
await page.fill('[data-er-free-r]', '0');
await page.fill('[data-er-free-t]', '2');
await page.waitForTimeout(300);
check(await floorNow(page) === 0, 'جرّب أعدادك : vitesse 0 → la cabine reste à l\'étage 0');
await lab.close();

/* ── 3bis. متقدم : la prédiction puis « بطريقتين » ──────────────────────────────────────────── */
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const p = await ctx.newPage();
  watch(p);
  await goto(p, `${BASE}${CH}/${LESSON}/nashat`);
  await p.waitForSelector('[data-er-glance]:visible');
  await pickLevel(p, 'advanced');
  await center(p, '[data-er-cards]');
  check(await p.locator('[data-er-cards]:visible').count() === 1, 'متقدم: les cartes de prédiction sont à l\'écran avant tout geste');
  check(await p.locator('[data-er-arrow]:visible').count() === 0, 'متقدم: aucune flèche empilée avant la réponse');
  await p.screenshot({ path: `${OUT}/predict-1280x800.png` });
  await vis(p, '[data-er-card="-6"]').click();
  check(await verdict(p) === 'wrong', 'a1: la carte −6 est refusée');
  check(await floorNow(p) === 6, 'a1: la cabine montre l\'étage 6');
  await vis(p, '[data-er-card="6"]').click();
  check(await verdict(p) === 'right', 'a1: la carte 6 est juste');
  await vis(p, '[data-er-next]').click();
  // a2 : l'étage −6 en montant puis en descendant (levier + −/+ de la vitesse)
  await center(p, '[data-er-speed]');
  await vis(p, '[data-er-knob]').focus();
  await p.keyboard.press('Home'); // t = −3, r = 2 : étage −6, en montant
  check(await verdict(p) === 'part' || await verdict(p) === 'right', 'a2: (2 ; −3) monte à −6');
  await vis(p, '[data-er-down]').click();
  await vis(p, '[data-er-r-more]').click();
  await vis(p, '[data-er-knob]').focus();
  for (let i = 0; i < 10; i += 1) await p.keyboard.press('ArrowLeft'); // vers -3 ; puis revenir vers t = 2
  await p.keyboard.press('End');
  for (let i = 0; i < 2; i += 1) await p.keyboard.press('ArrowLeft'); // t = 2
  check(await readT(p) === 2, 'a2: t = 2 après des pas d\'une demi-minute');
  await p.screenshot({ path: `${OUT}/a2-1280x800.png` });
  await ctx.close();
}

/* ── 3ter. LabCoach (MANIPULATION_CONTRACT §8quater) : montre le contrôle, jamais la règle ─────── */
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 }, false);
  const p = await ctx.newPage();
  watch(p);
  await goto(p, `${BASE}${CH}/${LESSON}/nashat`);
  await p.waitForSelector('[data-er-glance]:visible');
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-lab-coach-toggle]').count() === 1, 'مبتدئ : l\'interrupteur du LabCoach est sous la question');
  check(await p.locator('[data-lab-coach][data-step=grab]').count() >= 1, 'مبتدئ : le LabCoach montre le curseur du temps');
  const txt = await p.locator('[data-lab-coach][data-step=grab]').first().innerText();
  check(!/موجب|سالب|إشارة|جداء/.test(txt), 'le LabCoach ne dit pas la règle');
  await center(p, '[data-er-knob]');
  await vis(p, '[data-er-knob]').focus();
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(500);
  check(await p.locator('[data-lab-coach][data-step=try]').count() >= 1, 'après un premier essai : « قدّم التسجيل أو أرجعه » (−/+)');
  await pickLevel(p, 'advanced');
  await p.waitForTimeout(500);
  check(await p.locator('[data-lab-coach][data-step=cards]').count() >= 1, 'متقدم : le LabCoach montre les cartes de prédiction');
  await ctx.close();
}

/* ── 3quater. Module 2 : « آلة الجداءات » (`sign-machine`) ───────────────────────────────────── */
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const p = await ctx.newPage();
  watch(p);
  await goto(p, `${BASE}${CH}/${LESSON}/maarif`);
  await p.waitForSelector('[data-sm-glance]:visible');
  const smVerdict = async () => (await vis(p, '[data-sm-verdict]').getAttribute('data-sm-verdict')) ?? '';
  const readB = async () => Number(await vis(p, '[data-sm-knob]').getAttribute('data-b'));
  const order2 = await p.evaluate(() => {
    const lab = [...document.querySelectorAll('[data-sm-glance]')].find((e) => e.offsetParent !== null);
    const q = document.querySelector('[data-activity-evidence]');
    return { labFirst: !!(lab && q && (lab.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)) };
  });
  check(order2.labFirst, 'module 2 : le labo est avant la première question (§4quater)');
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-sm-col][data-locked="true"]').count() === 4, 'مبتدئ : les quatre colonnes négatives sont verrouillées avant la prédiction');
  // m1 au clavier : 4 → 0, puis la flèche gauche est bloquée au 0
  await center(p, '[data-sm-knob]');
  await vis(p, '[data-sm-knob]').focus();
  for (let i = 0; i < 5; i += 1) await p.keyboard.press('ArrowLeft');
  check(await readB() === 0, 'm1 : le curseur s\'arrête à 0 (côté négatif fermé)');
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-sm-gap][data-diff="3"]').count() === 4, 'm1 : quatre pastilles « +3 » entre les colonnes allumées');
  check(await smVerdict() === 'right', 'm1 : les colonnes 4 … 0 allumées');
  await vis(p, '[data-sm-next]').click();
  // p1 : la carte fausse ne montre pas la réponse
  await vis(p, '[data-sm-card="-3"]').click();
  check(await smVerdict() === 'wrong', 'p1 : la carte −3 est refusée');
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-sm-col="-1"][data-lit="true"]').count() === 0, 'p1 : la colonne −1 reste éteinte après une carte fausse');
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-sm-calc]').count() === 0, 'p1 : aucun calcul affiché après une carte fausse');
  await p.screenshot({ path: `${OUT}/sm-p1-refus-1280x800.png` });
  await vis(p, '[data-sm-card="3"]').click();
  check(await p.locator('[data-manipulation-level-panel=beginner] [data-sm-col="-1"][data-product="3"]').count() === 1, 'p1 : la carte 3 allume (−3) × (−1) = 3');
  await vis(p, '[data-sm-next]').click();
  // m2 au pointeur sur le rail : −2 refusé, puis −4
  await center(p, '[data-sm-rail]');
  const rail = await vis(p, '[data-sm-rail]').boundingBox();
  await p.mouse.click(rail.x + rail.width * 0.28, rail.y + rail.height / 2);
  check(await smVerdict() === 'wrong', 'm2 : une colonne qui n\'est pas 12 est refusée avec son calcul');
  await p.mouse.click(rail.x + rail.width * 0.02, rail.y + rail.height / 2);
  check(await readB() === -4 && await smVerdict() === 'right', 'm2 : le produit 12 en b = −4');
  await p.screenshot({ path: `${OUT}/sm-m2-succes-1280x800.png` });
  await p.waitForSelector('[data-manipulation-discovery]', { timeout: 5000 }).catch(() => {});
  await p.locator('[data-manipulation-discovery] button').nth(1).click().catch(() => {});
  await p.waitForTimeout(400);
  check(await p.locator('[data-sm-formal]').count() > 0, 'module 2 : la bonne conjecture ouvre la phase formelle');
  check(await p.locator('[data-evidence="sign-machine"][data-tried="true"]').count() === 1, 'module 2 : l\'étape 1 rappelle les colonnes de l\'élève');
  // متقدم : prédire, puis retourner le signe de a
  await pickLevel(p, 'advanced');
  await vis(p, '[data-sm-card="8"]').click();
  await vis(p, '[data-sm-next]').click();
  const before = await p.locator('[data-manipulation-level-panel=advanced] [data-sm-col="-2"]').getAttribute('data-product');
  await vis(p, '[data-sm-pos]').click();
  const after = await p.locator('[data-manipulation-level-panel=advanced] [data-sm-col="-2"]').getAttribute('data-product');
  check(Number(before) === 8 && Number(after) === -8, 'a2 : retourner le signe du premier facteur renverse la colonne −2 (8 → −8)');
  await ctx.close();
}

/* ── 4. le bloc [data-er-glance] aux cinq tailles, aux deux niveaux ─────────────────────────── */
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]]) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const p = await ctx.newPage();
  watch(p);
  await goto(p, `${BASE}${CH}/${LESSON}/nashat`);
  await p.waitForSelector('[data-er-glance]:visible');
  for (const level of ['beginner', 'advanced']) {
    if (level === 'advanced') await pickLevel(p, 'advanced');
    await center(p, '[data-er-glance]');
    const m = await p.evaluate(() => {
      const el = [...document.querySelectorAll('[data-er-glance]')].find((e) => e.offsetParent !== null);
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), w: Math.round(r.width), vh: innerHeight, over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    check(m.over <= 1, `${w}×${h} ${level}: pas de débordement horizontal`);
    console.log(`   glance ${w}×${h} ${level}: hauteur ${m.height} / ${m.vh} (largeur ${m.w})`);
    await p.screenshot({ path: `${OUT}/glance-${level}-${w}x${h}.png` });
  }
  await ctx.close();
}

check(errors.length === 0, `aucune erreur console (${errors.length}) ${errors.slice(0, 3).join(' | ')}`);
await browser.close();
console.log(`\n== ${failures.length ? `${failures.length} échec(s)` : 'tout est vert'} ==`);
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
