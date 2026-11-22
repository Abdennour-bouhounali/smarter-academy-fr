// QA — 3AM, unité 5 « المساويات – المتباينات – المعادلات » : leçon `hasr-adad-ushri` « حصر عدد عشري موجب » (labo `scoop-scale`, ميزان العطّار)
// — cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit5-hasr-adad-ushri.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » ni clé brute, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : l'étape du coach, le POINTEUR (appui long = on verse, toucher = une pincée, toucher la pile = une pincée de moins), le clavier, le refus avec le
//      voisin fantôme, le bout droit EXCLU (1,35 lit 1,4), l'échelle au kilo, la découverte, « جرّب أعدادك » (7 et 7,0 ; un quotient), le niveau متقدم
//      (la lampe ne dit jamais « égal » pour 2/7) ;
//   4. D'UN SEUL REGARD : `[data-ss-glance]` tient dans l'écran à 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080, aux deux niveaux, dans l'état initial
//      ET après une tâche réussie ;
//   5. captures dans /tmp/qa-3am-unit5-hasr.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-unit5-hasr';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'hasr-adad-ushri';
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
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.scoop-scale.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div|leq|geq)\b|manipulation\.[a-zA-Z]+\./;

async function measure(page) {
  return page.evaluate((re) => {
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
}

async function pageHealth(page, label) {
  let m = await measure(page);
  // un serveur de dev partagé recharge parfois la page (un autre auteur édite l'arbre) : on remesure une fois
  if (m.overflow > 1) { await page.waitForTimeout(1500); m = await measure(page); }
  const { overflow, raw, dir } = m;
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
  check(dir === 'rtl', `${label}: page RTL`);
}

const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const goto = async (page, url) => { await page.goto(url, { waitUntil: 'networkidle' }); await page.waitForTimeout(400); };
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(450);
};
const verdict = (page) => vis(page, '[data-ss-verdict]').getAttribute('data-ss-verdict').catch(() => null);
const verdictText = (page) => vis(page, '[data-ss-verdict]').textContent();
const mass = async (page) => Number(await vis(page, '[data-ss-pan]').getAttribute('data-m'));
const reading = (page) => vis(page, '[data-ss-lcd]').getAttribute('data-reading');
const lamp = (page) => vis(page, '[data-ss-lamp]').getAttribute('data-lamp');
/** Règle la masse au clavier (la louche reste intacte) : des dizaines par PageUp / PageDown, puis des pincées par ↑ / ↓. */
async function setMass(page, target) {
  await vis(page, '[data-ss-pan]').focus();
  let m = await mass(page);
  while (m !== target) {
    const d = target - m;
    await page.keyboard.press(d >= 10 ? 'PageUp' : d <= -10 ? 'PageDown' : d > 0 ? 'ArrowUp' : 'ArrowDown');
    m = await mass(page);
  }
}
const deliver = async (page) => { await vis(page, '[data-ss-deliver]').click(); await page.waitForTimeout(250); };
const glanceOf = (page) => vis(page, '[data-ss-glance]');
const scrollGlance = async (page) => { await glanceOf(page).evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.waitForTimeout(250); };

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 + 2 — sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const [w, h] of SIZES) {
  const ctx = await contextFor(browser, token, { width: w, height: h });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${LESSON} ${w}×${h}`;
  await goto(page, `${BASE}${CH}/${LESSON}`);
  check(await page.getByText('حصر عدد عشري موجب').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await goto(page, `${BASE}${CH}/${LESSON}/${slug}`);
    check(await page.locator('main, [data-module-layout], h1').first().waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-scoop-scale]', { state: 'attached' });
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-scoop-scale]');
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
      check(await page.locator('[data-scoop-scale]').count() === 0, `${tag} maarif : aucun labo (le module s'ouvre sur sa première question)`);
      check(await page.getByText('تذكّر — السنة الأولى').first().isVisible().catch(() => false), `${tag} maarif : la « تذكّر » de la 1re année`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${w}.png`, fullPage: true, timeout: 90000 }).catch(() => {});
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `scoop-scale`, niveau مبتدئ, avec le COACH actif.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 }, false);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-scoop-scale]');
  await vis(page, '[data-ss-glance]').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.screenshot({ path: `${OUT}/lab-initial-1280.png` });
  check(await page.locator('[data-lab-coach]').first().getAttribute('data-step') === 'pour', 'coach : la première étape est « verse » (la louche)');
  await vis(page, '[data-lab-coach-stop]').click().catch(() => {});
  check(await reading(page) === '1,0' && await mass(page) === 100, 'labo : la masse de départ est 1,00 kg et l\'écran lit 1,0');
  check(await vis(page, '[data-ss-context]').textContent().then((t) => t.includes('تطلب زبونة')), 'labo : le contexte d\'abord');
  check((await vis(page, '[data-ss-prompt]').textContent()).includes('أقلّ كمّية'), 'labo : UNE question qui nomme le but');
  // le POINTEUR : un appui long sur la louche verse, un toucher = une pincée
  const sc = await vis(page, '[data-ss-scoop]').boundingBox();
  await page.mouse.move(sc.x + sc.width / 2, sc.y + sc.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1300);
  await page.mouse.up();
  const poured = await mass(page);
  check(poured >= 103 && poured <= 118, `labo (pointeur) : l'appui long sur la louche verse (${poured - 100} pincées en 1,3 s)`);
  const before = await mass(page);
  await page.mouse.move(sc.x + sc.width / 2, sc.y + sc.height / 2);
  await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up();
  check(await mass(page) === before + 1, 'labo (pointeur) : un toucher sur la louche = une pincée');
  const pan = await vis(page, '[data-ss-pan]').boundingBox();
  await page.mouse.click(pan.x + pan.width / 2, pan.y + pan.height / 2);
  check(await mass(page) === before, 'labo (pointeur) : un toucher sur la pile reprend une pincée');
  await vis(page, '[data-ss-more]').click();
  check(await mass(page) === before + 1, 'labo : le bouton + est une pincée');
  await vis(page, '[data-ss-less]').click();
  // le clavier
  await setMass(page, 124);
  check(await reading(page) === '1,2', 'labo (clavier) : 1,24 kg se lit 1,2');
  await deliver(page);
  check(await verdict(page) === 'refused', 'labo : « سلّم » refusé à 1,24 (l\'écran lit 1,2)');
  await setMass(page, 126);
  await deliver(page);
  check(await verdict(page) === 'refused' && (await verdictText(page)).includes('1,25'), 'labo : le refus à 1,26 cite SON voisin 1,25 (« لو أنقصتَ حفنة لصارت … 1,25 »)');
  await page.screenshot({ path: `${OUT}/lab-refused-1280.png` });
  await vis(page, '[data-ss-restart]').click();
  check(await mass(page) === 100, 'labo : « ابدأ من جديد » (et Home) ramène à la masse de départ');
  await setMass(page, 125);
  check(await reading(page) === '1,3', 'labo : 1,25 kg se lit 1,3 (la moitié monte)');
  await deliver(page);
  check(await verdict(page) === 'right' && (await verdictText(page)).includes('1,24'), 'labo : la tâche 1 est réussie, le voisin 1,24 cité');
  const gh = await glanceOf(page).boundingBox();
  check(gh.height <= 800, `labo (tâche réussie) : d'un seul regard à 1280×800 (${Math.round(gh.height)}px)`);
  await page.screenshot({ path: `${OUT}/lab-solved-1280.png` });
  await vis(page, '[data-ss-next]').click();
  // tâche 2 : le plus
  await setMass(page, 135);
  check(await reading(page) === '1,4', 'labo : à 1,35 kg l\'écran lit 1,4 — le bout droit est EXCLU');
  await deliver(page);
  check(await verdict(page) === 'refused' && (await verdictText(page)).includes('1,4'), 'labo : « الشاشة لم تعد تقرأ 1,3 »');
  await page.screenshot({ path: `${OUT}/lab-flip-1280.png` });
  await setMass(page, 134);
  await deliver(page);
  check(await verdict(page) === 'right', 'labo : la tâche 2 est réussie (1,34 kg)');
  await vis(page, '[data-ss-next]').click();
  // tâche 3 : l'échelle au kilo
  check(await vis(page, '[data-ss-context]').textContent().then((t) => t.includes('ميزان الأكياس الكبيرة')), 'labo : T3 — l\'échelle des gros sacs');
  await setMass(page, 149);
  check(await reading(page) === '1', 'labo : 1,49 kg se lit 1 à l\'échelle au kilo');
  await setMass(page, 150);
  check(await reading(page) === '2', 'labo : 1,50 kg se lit 2');
  await deliver(page);
  check(await verdict(page) === 'right', 'labo : le moins qui lit 2 — 1,50');
  await setMass(page, 249);
  await deliver(page);
  check(await verdict(page) === 'right', 'labo : le plus qui lit 2 — 2,49');
  // le contraste : une pincée de plus puis « سلّم » → refus (2,50 lit 3)
  await setMass(page, 250);
  await deliver(page);
  check(await verdict(page) === 'refused', 'labo : 2,50 refusé (l\'écran lit 3)');
  await page.waitForTimeout(500);
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les trois tâches et un refus au bout');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });
  // « جرّب أعدادك » : 7 et 7,0 sont deux lectures
  await vis(page, '[data-ss-free-reading]').fill('7');
  check(await vis(page, '[data-ss-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est ouvert et actif');
  check(await vis(page, '[data-scoop-scale]').getAttribute('data-task') === 'free', 'labo (libre) : la tâche libre');
  check((await vis(page, '[data-ss-context]').textContent()).includes('7 kg'), 'labo (libre « 7 ») : le contexte dit 7 kg');
  await setMass(page, 65);
  check(await reading(page) === '7', 'labo (libre « 7 ») : 6,5 kg se lit 7 (rang = l\'unité)');
  await vis(page, '[data-ss-free-reading]').fill('7,0');
  await setMass(page, 695);
  check(await reading(page) === '7,0', 'labo (libre « 7,0 ») : 6,95 kg se lit 7,0 (rang = 0,1)');
  await deliver(page);
  check(await verdict(page) === 'right', 'labo (libre « 7,0 ») : 6,95 est le moins qui lit 7,0');
  // un quotient
  await vis(page, '[data-ss-free-a]').fill('5');
  await vis(page, '[data-ss-free-b]').fill('8');
  await vis(page, '[data-ss-free-rank="3"]').click();
  await page.waitForTimeout(300);
  check(await page.locator('[data-ss-lamp]:visible').count() === 1, 'labo (libre 5 ÷ 8) : le sachet modèle et sa lampe');
  await setMass(page, 625);
  check(await lamp(page) === '=', 'labo (libre 5 ÷ 8 à 0,001) : 5/8 = 0,625 est décimal à ce rang — la lampe PEUT balancer');
  await vis(page, '[data-ss-free-back]').click();
  check(await vis(page, '[data-ss-free]').getAttribute('data-active') === 'false', 'labo : « عُد إلى المهمة »');
  check(errors.length === 0, `labo مبتدئ : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — le module lit les essais (modules 1) : les preuves citent SES essais.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-scoop-scale]');
  check(await vis(page, '[data-evidence=least]').getAttribute('data-tried') === 'false', 'module 1 : la preuve « أقلّ كمّية » attend l\'essai');
  await setMass(page, 125); await deliver(page);
  await vis(page, '[data-ss-next]').click();
  await setMass(page, 134); await deliver(page);
  await vis(page, '[data-ss-next]').click();
  await setMass(page, 150); await deliver(page);
  await setMass(page, 249); await deliver(page);
  await vis(page, '[data-evidence=least]').scrollIntoViewIfNeeded();
  check(await vis(page, '[data-evidence=least]').getAttribute('data-tried') === 'true', 'module 1 : la preuve cite l\'essai (1,25)');
  check((await vis(page, '[data-evidence=least]').textContent()).includes('1,25'), 'module 1 : « أقلّ كمّية … 1,25 kg »');
  check(await vis(page, '[data-evidence=most]').getAttribute('data-tried') === 'true', 'module 1 : la preuve de l\'extrémité exclue (1,35 → 1,4)');
  check(await vis(page, '[data-evidence=coarse]').getAttribute('data-tried') === 'true', 'module 1 : la preuve de l\'échelle au kilo');
  check(await page.locator('[data-knowledge-brick]').count() === 0, 'module 1 : aucune brique avant la réponse');
  await ctx.close();
}

// 3ter — le niveau متقدم : la lampe ne dit jamais « égal » pour 2/7.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-scoop-scale]');
  await pickLevel(page, 'advanced');
  check(await reading(page) === '5,60' && await mass(page) === 5600, 'متقدم : départ 5,600 kg, l\'écran lit 5,60');
  await page.screenshot({ path: `${OUT}/lab-adv-initial-1280.png` });
  await setMass(page, 5674);
  check(await reading(page) === '5,67', 'متقدم : 5,674 se lit 5,67');
  await setMass(page, 5675);
  check(await reading(page) === '5,68', 'متقدم : 5,675 se lit 5,68');
  await deliver(page);
  check(await verdict(page) === 'right', 'متقدم : le moins qui lit 5,68 — 5,675');
  await vis(page, '[data-ss-next]').click();
  await setMass(page, 5685);
  check(await reading(page) === '5,69', 'متقدم : 5,685 se lit 5,69 (exclu)');
  await setMass(page, 5684);
  await deliver(page);
  check(await verdict(page) === 'right', 'متقدم : le plus qui lit 5,68 — 5,684');
  await vis(page, '[data-ss-next]').click();
  check(await page.locator('[data-ss-ref]:visible').count() === 1, 'متقدم : le sachet 2/7 est repéré sur la bande');
  check(await lamp(page) === '<', 'متقدم : à 0,250 kg la lampe dit « plus léger »');
  let equal = 0;
  for (const m of [0, 100, 250, 284, 285, 286, 287, 300, 500, 999]) { await setMass(page, m); if (await lamp(page) === '=') equal += 1; }
  check(equal === 0, 'متقدم : la lampe ne dit JAMAIS « égal » pour 2/7');
  await setMass(page, 284);
  await deliver(page);
  check(await verdict(page) === 'refused' && (await verdictText(page)).includes('0,285'), 'متقدم : 0,284 refusé : « لو زدتَ حفنة لصارت 0,285 … »');
  await setMass(page, 285);
  await deliver(page);
  check(await verdict(page) === 'right', 'متقدم : le plus lourd qui reste plus léger — 0,285');
  await setMass(page, 286);
  await deliver(page);
  check(await verdict(page) === 'right' && await lamp(page) === '>', 'متقدم : le plus léger qui devient plus lourd — 0,286');
  await page.screenshot({ path: `${OUT}/lab-adv-trap-1280.png` });
  check(errors.length === 0, `labo متقدم : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — D'UN SEUL REGARD aux cinq tailles, aux deux niveaux, état initial, tâche réussie, piège.
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]]) {
  for (const level of ['beginner', 'advanced']) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
    await page.waitForSelector('[data-scoop-scale]');
    if (level === 'advanced') await pickLevel(page, 'advanced');
    await scrollGlance(page);
    let box = await glanceOf(page).boundingBox();
    // un serveur de dev partagé recharge parfois la page : on remesure une fois
    if (box.height > h) { await page.waitForTimeout(1500); await scrollGlance(page); box = await glanceOf(page).boundingBox(); }
    check(box.height <= h, `d'un seul regard ${w}×${h} ${level} : ${Math.round(box.height)}px ≤ ${h}`);
    await page.screenshot({ path: `${OUT}/glance-${level}-${w}x${h}.png` });
    // une tâche réussie (le verdict grandit : le bouton « المهمة التالية »)
    await setMass(page, level === 'beginner' ? 125 : 5675);
    await deliver(page);
    await scrollGlance(page);
    const box2 = await glanceOf(page).boundingBox();
    check(box2.height <= h, `d'un seul regard ${w}×${h} ${level}, tâche réussie : ${Math.round(box2.height)}px ≤ ${h}`);
    if (level === 'advanced') {
      await vis(page, '[data-ss-next]').click();
      await setMass(page, 5684); await deliver(page);
      await vis(page, '[data-ss-next]').click();
      await setMass(page, 284);
      await deliver(page);
      await scrollGlance(page);
      const box3 = await glanceOf(page).boundingBox();
      check(box3.height <= h, `d'un seul regard ${w}×${h} متقدم, piège et refus : ${Math.round(box3.height)}px ≤ ${h}`);
      await page.screenshot({ path: `${OUT}/glance-advanced-trap-${w}x${h}.png` });
    } else {
      await page.screenshot({ path: `${OUT}/glance-beginner-solved-${w}x${h}.png` });
    }
    await ctx.close();
  }
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s) :\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nQA scoop-scale : tout est bon.');
