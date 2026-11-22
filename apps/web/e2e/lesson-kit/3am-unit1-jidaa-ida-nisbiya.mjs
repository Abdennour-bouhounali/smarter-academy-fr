// QA — 3AM, unité 1 « الأعداد النسبية » : leçon `jidaa-ida-nisbiya` « جداء عدة أعداد نسبية » (labo `robot-track`) —
// cycle moyen, phase 3, priorité propriétaire, 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/3am-unit1-jidaa-ida-nisbiya.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo au POINTEUR (glisser), au TOUCHER (prendre puis poser) et au clavier : m1 (−1 → −5), m2 (2 et −5 refusés avec leur arrêt), m3
//      (un puis trois signes négatifs, jamais deux), m4 (deux négatives donnent +24), l'échange de deux cartes ne déplace pas l'arrêt ;
//      متقدم : la prédiction (fausse puis juste), l'ordre de a2, la répétition de a3 ; le monde `square` (« لا يمكن ») ; « جرّب أعدادك » (facteur 0) ;
//   4. le bloc `[data-rt-glance]` aux quatre tailles et aux trois mondes (seul le débordement horizontal est un échec) ;
//   5. captures (état initial, mi-activité) dans /tmp/qa-ida.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-ida';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'jidaa-ida-nisbiya';
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
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.robot-track.off', '1'); } catch { /* noop */ }
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
const verdict = async (page) => (await vis(page, '[data-rt-verdict]').getAttribute('data-rt-verdict')) ?? '';
const verdictText = async (page) => (await vis(page, '[data-rt-verdict]').innerText()).replace(/[\u2066\u2069\u200E]/g, '');
/** L'arrêt FINAL du programme (la position animée est `data-pos`, qui rejoue pas à pas). */
const robotAt = async (page) => Number((await vis(page, '[data-rt-robot]').getAttribute('data-stop')).replace('−', '-').replace(',', '.'));
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
/** Glisser (pointeur) d'un élément à un autre : la page ne défile pas pendant le geste. */
async function dragTo(page, from, to) {
  await from.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(250);
  const a = await from.boundingBox(); const b = await to.boundingBox();
  const sx = a.x + a.width / 2; const sy = a.y + a.height / 2;
  const ex = b.x + b.width / 2; const ey = b.y + b.height / 2;
  await page.mouse.move(sx, sy); await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) await page.mouse.move(sx + ((ex - sx) * i) / 8, sy + ((ey - sy) * i) / 8);
  await page.mouse.up(); await page.waitForTimeout(900);
}
const card = (page, id) => page.locator(`[data-drag-source="${id}"]`).first();
const slot = (page, i) => page.locator(`[data-rt-slot="${i}"]:visible`).first();
const trayZone = (page) => page.locator('[data-rt-tray] [data-drop-zone="tray"]:visible').first();
/** Toucher puis toucher : prendre la carte, puis poser sur la case. */
async function tapTo(page, id, zone) {
  await card(page, id).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await card(page, id).click();
  await page.waitForTimeout(200);
  await zone.click({ position: { x: 14, y: 14 } });
  await page.waitForTimeout(900);
}
const flip = async (page, id) => { await toCenter(page, `[data-rt-sign="${id}"]`); await vis(page, `[data-rt-sign="${id}"]`).click(); await page.waitForTimeout(900); };

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
    check(await page.locator('body').innerText().then((t) => t.includes('جداء عدة أعداد نسبية')), `${w}×${h}: le sommaire s'ouvre`);
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
await page.waitForSelector('[data-rt-glance]:visible');
check(await page.locator('[data-module-brief]').count() === 0, 'module 1: aucune carte [data-module-brief] au-dessus du labo');
const order = await page.evaluate(() => {
  const labEl = document.querySelector('[data-robot-track]');
  const q = document.querySelector('[data-activity-evidence]');
  return labEl && q ? !!(labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
});
check(order, 'module 1: le labo vient avant la première question');
check(await page.locator('[data-knowledge-brick]').count() === 0, 'module 1: aucune brique avant la réponse');
check((await vis(page, '[data-lab-context]').innerText()).includes('نادي الروبوتيك'), 'le labo s\'ouvre sur son contexte (نادي الروبوتيك)');
check((await vis(page, '[data-lab-question]').innerText()).includes('−5'), 'puis UNE question qui nomme la raie −5');
check(await vis(page, '[data-rt-flag]').getAttribute('data-flag') === '-5', 'la raie est plantée sur le tapis à −5');
check(await vis(page, '[data-rt-tray] [data-rt-card]').count() === 1, 'le plateau porte la carte −1');

/* ── 3. m1 : glisser −1 dans le programme ─────────────────────────────────────────────────────── */
await dragTo(page, card(page, 'm1-t0'), slot(page, 1));
check(await verdict(page) === 'right', 'm1 (pointeur) : la carte −1 mène le robot à la raie');
check((await verdictText(page)).includes('−5'), 'm1 : le verdict écrit le calcul et l\'arrêt −5');
check(await robotAt(page) === -5, 'm1 : le robot est à −5');
check(await page.locator('[data-rt-arc="1"]:visible').count() === 1, 'm1 : un arc numéroté 1 reste tracé (le saut par-dessus le poteau)');
check(await vis(page, '[data-rt-row]').count() === 1, 'm1 : une ligne dans le سجلّ');
await page.screenshot({ path: `${OUT}/m1-1280x800.png` });
await vis(page, '[data-rt-next]').click(); await settle(page);

/* m2 : 2 et −5 sont refusés avec leur arrêt, seule −1 réussit */
check((await vis(page, '[data-lab-question]').innerText()).includes('5'), 'm2 : la question nomme la raie 5');
await tapTo(page, 'm2-t1', slot(page, 2));
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('−10'), 'm2 : la carte 2 est refusée avec l\'arrêt −10');
await tapTo(page, 'm2-t1', trayZone(page));
await tapTo(page, 'm2-t2', slot(page, 2));
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('25'), 'm2 : la carte −5 est refusée avec l\'arrêt 25');
await tapTo(page, 'm2-t2', trayZone(page));
await tapTo(page, 'm2-t0', slot(page, 2));
check(await verdict(page) === 'right' && await robotAt(page) === 5, 'm2 : seule la carte −1 ramène le robot à 5');
// une carte posée au départ est verrouillée : elle n'est pas une source de glisser
check(await page.locator('[data-drag-source="m2-p0"]').count() === 0, 'm2 : la carte posée au départ est verrouillée (non saisissable)');
await vis(page, '[data-rt-next]').click(); await settle(page);

/* m3 : un signe → −24 ; deux → 24 (refusé) ; trois → −24 ; l'échange ne déplace pas l'arrêt */
check(await vis(page, '[data-rt-sign]').count() === 1 || await page.locator('[data-rt-sign]:visible').count() === 3, 'm3 : les trois cartes portent un badge de signe');
await flip(page, 'm3-p1');
check(await verdict(page) === 'right' && await robotAt(page) === -24, 'm3 : un seul signe négatif → −24');
await flip(page, 'm3-p0');
check(await verdict(page) === 'wrong' && await robotAt(page) === 24, 'm3 : deux signes négatifs → +24, refusé (la raie est −24)');
await flip(page, 'm3-p2');
check(await verdict(page) === 'right' && await robotAt(page) === -24, 'm3 : trois signes négatifs → −24');
await dragTo(page, card(page, 'm3-p0'), slot(page, 2));
check(await verdict(page) === 'right' && await robotAt(page) === -24, 'm3 : échanger deux cartes (glisser) ne déplace pas l\'arrêt final');
await page.screenshot({ path: `${OUT}/m3-1280x800.png` });
await vis(page, '[data-rt-next]').click(); await settle(page);

/* m4 : +24 exige deux négatives au moins */
await flip(page, 'm4-p0');
check(await verdict(page) === 'wrong' && await robotAt(page) === -24, 'm4 : une seule négative → −24 (pas la raie)');
await flip(page, 'm4-p1');
check(await verdict(page) === 'right' && await robotAt(page) === 24, 'm4 : deux négatives → +24, la raie');
check(await page.locator('[data-rt-row]:visible').count() >= 4, 'le سجلّ porte une ligne par arrêt validé');
check(await vis(page, '[data-robot-track]').getAttribute('data-solved') === 'true', 'm1–m4 : la découverte est gagnée');

/* le module 1 : les questions lisent le سجلّ de l'élève */
await toCenter(page, '[data-evidence="m1"]');
check(await vis(page, '[data-evidence="m1"]').getAttribute('data-tried') === 'true', 'module 1 : la preuve m1 est lue du labo');
await toCenter(page, '[data-evidence="rows"]');
check(await vis(page, '[data-evidence="rows"]').getAttribute('data-tried') === 'true', 'module 1 : la preuve des deux dernières lignes est lue du labo');

/* le module 1 : répondre aux quatre questions, les briques n'apparaissent qu'APRÈS la réponse */
const clickText = async (pg, text, nth = 0) => { const l = pg.getByText(text, { exact: true }).nth(nth); await l.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await l.click(); await pg.waitForTimeout(500); };
const fillNumber = async (pg, value) => { const i = pg.locator('input[aria-label="إجابة"]:visible').first(); await i.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await i.fill(value); await i.press('Enter'); await pg.waitForTimeout(500); };
await clickText(page, 'معاكسه (نظيره)');
check(await page.locator('[data-knowledge-brick]').count() === 1, 'module 1 q1 : la brique « الضرب في −1 » apparaît APRÈS la réponse');
const pairBtn = page.locator('button', { hasText: /^\s*\d و \d\s*$/ }).first();
await pairBtn.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await pairBtn.click(); await page.waitForTimeout(500);
await clickText(page, 'عدد البطاقات السالبة فيها فردي');
check(await page.locator('[data-knowledge-brick]').count() === 2, 'module 1 q3 : la brique de la parité apparaît APRÈS la réponse');
await fillNumber(page, '-1');
check((await page.locator('body').innerText()).includes('تسع بطاقات سالبة'), 'module 1 q4 : −1 est la bonne réponse (le corrigé est montré)');

/* ── 4. متقدم : prédire, ordonner, répéter ─────────────────────────────────────────────────────── */
await pickLevel(page, 'advanced');
check(await page.locator('[data-rt-sides]:visible').count() === 1, 'متقدم : s\'ouvre sur la prédiction (côté + distance)');
check(await page.locator('[data-rt-arc]:visible').count() === 0, 'متقدم : aucun arc avant « شغّل »');
check(await page.locator('[data-rt-line]:visible').count() === 0, 'متقدم : aucun produit courant avant « شغّل »');
check(await vis(page, '[data-rt-run]').isDisabled(), 'متقدم : « شغّل » est fermé tant que la prédiction n\'est pas écrite');
await vis(page, '[data-rt-right]').click();
for (let i = 0; i < 2; i += 1) await vis(page, '[data-rt-dist-more5]').click();
for (let i = 0; i < 2; i += 1) await vis(page, '[data-rt-dist-more]').click();
check(await vis(page, '[data-rt-dist-value]').getAttribute('data-rt-dist-value') === '12', 'متقدم : la distance saisie est 12');
await vis(page, '[data-rt-run]').click(); await page.waitForTimeout(3200);
check(await verdict(page) === 'wrong' && (await verdictText(page)).includes('−12'), 'متقدم a1 : « يمين » est faux, la course montre l\'arrêt −12');
check(await page.locator('[data-rt-arc]:visible').count() >= 1, 'متقدم a1 : les arcs apparaissent APRÈS « شغّل »');
await page.screenshot({ path: `${OUT}/a1-1280x800.png` });
await vis(page, '[data-rt-retry]').click(); await settle(page);
await vis(page, '[data-rt-left]').click();
for (let i = 0; i < 12; i += 1) await vis(page, '[data-rt-dist-more]').click();
await vis(page, '[data-rt-run]').click(); await page.waitForTimeout(3200);
check(await verdict(page) === 'right', 'متقدم a1 : (يسار، 12) est juste');
await vis(page, '[data-rt-next]').click(); await settle(page);
// a2 : 4 et −0,5 en tête
check((await vis(page, '[data-rt-robot]').getAttribute('data-pos')) === '1', 'a2 : le robot est au départ (1)');
await tapTo(page, 'a2-t0', slot(page, 0)); // −5 en tête : refusé tant que tout n'est pas posé
await tapTo(page, 'a2-t0', trayZone(page));
await tapTo(page, 'a2-t1', slot(page, 0));
await tapTo(page, 'a2-t2', slot(page, 1));
await tapTo(page, 'a2-t0', slot(page, 2));
await tapTo(page, 'a2-t3', slot(page, 3));
check(await verdict(page) === 'right', 'a2 : 4 puis −0,5 en tête → −2 après deux cartes');
check(await robotAt(page) === 20, 'a2 : l\'arrêt final est 20');
await dragTo(page, card(page, 'a2-t1'), slot(page, 1));
check(await verdict(page) === 'right' && await robotAt(page) === 20, 'a2 : échanger les deux premières cartes : −2 reste atteint, l\'arrêt final reste 20');
await dragTo(page, card(page, 'a2-t0'), slot(page, 0));
check(await verdict(page) === 'wrong' && await robotAt(page) === 20, 'a2 : −5 en tête : refusé, mais l\'arrêt final est toujours 20 (l\'ordre ne le déplace pas)');
await dragTo(page, card(page, 'a2-t0'), slot(page, 0));
await vis(page, '[data-rt-next]').count();

/* ── 5. le monde square, posé seul en معارف ────────────────────────────────────────────────── */
const sq = await contextFor(browser, token, { width: 1024, height: 768 });
const sp = await sq.newPage();
watch(sp);
await goto(sp, `${BASE}${CH}/${LESSON}/maarif`);
await sp.waitForSelector('[data-robot-track][data-world="square"]');
check(await sp.locator('[data-rt-arc]').count() === 0, 'square : aucun saut avant d\'essayer');
await vis(sp, '[data-rt-impossible]').click(); await settle(sp, 300);
check((await verdictText(sp)).includes('جرّب عددًا موجبًا'), 'square : « لا يمكن » avant les essais dit d\'essayer un positif et un négatif');
await toCenter(sp, '[data-rt-a]');
const more = sp.locator('[data-rt-a] button').nth(1); const less = sp.locator('[data-rt-a] button').nth(0);
await more.click(); await settle(sp, 250); // 2,5
check((await sp.locator('[data-rt-card]:visible').first().getAttribute('data-v')) === '2,5', 'square : la carte montre a = 2,5');
for (let i = 0; i < 12; i += 1) await less.click(); // −3,5
await settle(sp, 700);
check(await robotAt(sp) === 12.25, 'square : a = −3,5 → le robot est à 12,25 (côté positif)');
for (let i = 0; i < 2; i += 1) await more.click();
await vis(sp, '[data-rt-impossible]').click(); await settle(sp, 300);
check(await verdict(sp) === 'right', 'square : « لا يمكن » est la bonne réponse après un essai de chaque signe');
// le module 2 : les questions lisent les essais de l'élève
await fillNumber(sp, '9');
check(await sp.locator('[data-knowledge-brick]').count() === 1, 'module 2 q1 : la brique du carré apparaît APRÈS la réponse');
await clickText(sp, 'لا، مربّع كل عدد نسبي موجب أو معدوم');
await clickText(sp, 'علامة طرح', 0);
await clickText(sp, 'إشارة عدد سالب', 1);
await clickText(sp, 'معاكس عدد', 2);
check(await sp.locator('[data-knowledge-brick]').count() === 2, 'module 2 q3 : la brique des rôles apparaît après les trois classements');
await fillNumber(sp, '6');
check((await sp.locator('body').innerText()).includes('معاكس'), 'module 2 q4 : −a vaut 6 pour a = −6');
await sp.screenshot({ path: `${OUT}/square-1024x768.png` });
await sq.close();

/* ── 5bis. l'onboarding (LabCoach) : un anneau et une phrase sur le plateau, jamais la règle ──────── */
const cc = await contextFor(browser, token, { width: 1280, height: 800 }, false);
const cp = await cc.newPage();
watch(cp);
await goto(cp, `${BASE}${CH}/${LESSON}/nashat`);
await cp.waitForSelector('[data-lab-coach]:visible', { timeout: 15000 }).catch(() => {});
check(await cp.locator('[data-lab-coach][data-step="tray"]:visible').count() === 1, 'LabCoach : la première bulle montre le plateau (data-step="tray")');
check(!/موجب|سالب|فردي|زوجي/.test(await cp.locator('[data-lab-coach]:visible').first().innerText()), 'LabCoach : la bulle ne dit jamais la règle');
await cc.close();

/* ── 6. « جرّب أعدادك » : un facteur 0 arrête le robot sur le poteau ───────────────────────────── */
const fr = await contextFor(browser, token, { width: 1366, height: 768 });
const fp = await fr.newPage();
watch(fp);
await goto(fp, `${BASE}${CH}/${LESSON}/nashat`);
await fp.waitForSelector('[data-rt-free]');
for (const v of ['3', '0', '-4']) { await toCenter(fp, '[data-rt-free-input]'); await vis(fp, '[data-rt-free-input]').fill(v); await vis(fp, '[data-rt-free-add]').click(); await fp.waitForTimeout(250); }
check(await vis(fp, '[data-rt-free]').getAttribute('data-active') === 'true', 'libre : le programme libre est actif');
const freeIds = await fp.locator('[data-rt-tray] [data-drag-source]').evaluateAll((els) => els.map((e) => e.getAttribute('data-drag-source')));
for (let i = 0; i < freeIds.length; i += 1) await tapTo(fp, freeIds[i], slot(fp, i));
await fp.waitForTimeout(800);
check(await robotAt(fp) === 0, 'libre : 3, 0, −4 : le robot s\'arrête sur le poteau (0)');
await vis(fp, '[data-rt-free-input]').fill('11');
check(await vis(fp, '[data-rt-free-add]').isDisabled(), 'libre : 11 est refusé (de −10 à 10)');
await fr.close();

/* ── 7. le bloc [data-rt-glance] aux quatre tailles, aux deux niveaux et au monde square ──────── */
for (const [w, h] of SIZES) {
  for (const [slug, level] of [['nashat', 'beginner'], ['nashat', 'advanced'], ['maarif', null]]) {
    const c = await contextFor(browser, token, { width: w, height: h });
    const p = await c.newPage();
    watch(p);
    await goto(p, `${BASE}${CH}/${LESSON}/${slug}`);
    await p.waitForSelector('[data-rt-glance]:visible');
    if (level === 'advanced') await pickLevel(p, 'advanced');
    const m = await p.evaluate(() => {
      const g = [...document.querySelectorAll('[data-rt-glance]')].find((e) => e.offsetParent);
      const r = g.getBoundingClientRect();
      const lab = g.closest('[data-robot-track]');
      return { w: Math.round(r.width), h: Math.round(r.height), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, labOverflow: lab.scrollWidth - lab.clientWidth };
    });
    console.log(`  ${w}×${h} ${slug}${level ? `/${level}` : ''}: bloc ${m.w}×${m.h} px`);
    check(m.overflow <= 1 && m.labOverflow <= 1, `${w}×${h} ${slug}${level ? `/${level}` : ''}: le labo ne déborde pas (${m.overflow} / ${m.labOverflow}px)`);
    await p.locator('[data-robot-track]:visible').first().screenshot({ path: `${OUT}/glance-${slug}-${level ?? 'square'}-${w}x${h}.png` });
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
