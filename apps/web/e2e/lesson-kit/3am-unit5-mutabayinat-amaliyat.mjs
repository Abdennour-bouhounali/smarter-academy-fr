// QA — 3AM, unité 5 « المساويات – المتباينات – المعادلات » : leçon `mutabayinat-amaliyat` « المتباينات والعمليات » (labo `loom-threads`, خيوط النول)
// — cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26.
//
//   KIT_BASE=http://localhost:5173 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit5-mutabayinat-amaliyat.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//
// TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. le sommaire et CHAQUE module (0 à 8) à 768×1024, 1024×768, 1280×800 et 1366×768 : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » ni clé brute, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//      le module 2 pose le labo SEUL (sans niveaux) ;
//   3. le labo : l'étape du coach, le clavier, le POINTEUR (glisser le nœud), le toucher d'une graduation, le croisement, × 0, le peigne négatif,
//      la découverte, « جرّب أعدادك », le niveau متقدم (deux poutres, la bande) ;
//   4. D'UN SEUL REGARD : `[data-lt-glance]` tient dans l'écran à 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080, aux deux niveaux, dans l'état initial
//      ET après un croisement ;
//   5. captures dans /tmp/qa-3am-unit5-mutabayinat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-unit5-mutabayinat';
const STUB = !!process.env.QA_STUB;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = 'mutabayinat-amaliyat';
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
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.loom-threads.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
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
const verdict = (page) => vis(page, '[data-lt-verdict]').getAttribute('data-lt-verdict').catch(() => null);
const tool = (page, t) => vis(page, `[data-lt-tool="${t}"]`).click();
const knobC = (page) => vis(page, '[data-lt-knob]').getAttribute('data-c');
/** Règle le nœud au clavier (Home = bord gauche de la portée, puis → n fois). */
async function setKnob(page, lo, c, step = 1) {
  await vis(page, '[data-lt-knob]').focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < Math.round((c - lo) / step); i += 1) await page.keyboard.press('ArrowRight');
}
const tie = async (page) => { await vis(page, '[data-lt-tie]').click(); await page.waitForTimeout(350); };
const COMB = [-6, 6]; const NAIL = [-3, 3];
const threadAt = (page, name) => vis(page, `[data-lt-thread=${name}]`).getAttribute('data-at');
const orderRel = (page, which) => vis(page, `[data-lt-order=${which}]`).getAttribute('data-rel');

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
  check(await page.getByText('المتباينات والعمليات').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await goto(page, `${BASE}${CH}/${LESSON}/${slug}`);
    check(await page.locator('main, [data-module-layout], h1').first().waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    if (slug === 'nashat') {
      await page.waitForSelector('[data-loom-threads]', { state: 'attached' });
      const order = await page.evaluate(() => {
        const lab = document.querySelector('[data-loom-threads]');
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
      await page.waitForSelector('[data-loom-threads]', { state: 'attached' });
      check(await page.locator('[data-manipulation-levels-selector]').count() === 0, `${tag} maarif : le labo est posé seul, sans niveaux`);
      check(await page.locator('[data-lt-tool]:visible').count() === 2, `${tag} maarif : les deux outils du labo`);
      check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} maarif : aucune brique avant la réponse`);
      check(await page.locator('[data-recall-link]').count() >= 1, `${tag} maarif : un lien « تذكّر » vers une leçon publiée`);
    }
    await page.screenshot({ path: `${OUT}/${slug}-${w}.png`, fullPage: true, timeout: 90000 }).catch(() => {});
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — les gestes de `loom-threads`, niveau مبتدئ, avec le COACH actif.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 }, false);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-loom-threads]');
  await page.screenshot({ path: `${OUT}/lab-initial-1280.png` });
  check(await page.locator('[data-lab-coach]').first().getAttribute('data-step') === 'tool', 'coach : la première étape est « اختر أداة »');
  await vis(page, '[data-lab-coach-stop]').click().catch(() => {});
  check(await vis(page, '[data-lt-tie]').isDisabled(), 'labo : « اربط » inactif tant que le nœud est au repos');
  check(await threadAt(page, 'red') === '1' && await threadAt(page, 'blue') === '3', 'labo : rouge à 1, bleu à 3');
  // le peigne : −4 au clavier, aucun croisement
  await tool(page, 'comb');
  await setKnob(page, COMB[0], -4);
  check(await knobC(page) === '-4', 'labo (clavier) : Origine puis → règle le peigne à −4');
  await tie(page);
  check(await threadAt(page, 'red') === '-3' && await threadAt(page, 'blue') === '-1', 'labo : le peigne −4 amène 1 → −3 et 3 → −1');
  check(await vis(page, '[data-lt-svg]').locator('[data-lt-cross]').count() === 0, 'labo : le peigne ne croise pas les fils');
  check(await orderRel(page, 'bottom') === '<', 'labo : la ligne du bas dit « < »');
  check(await verdict(page) === 'kept', 'labo : le verdict dit que l\'ordre est resté');
  // le clou : × 2, aucun croisement
  await tool(page, 'nail');
  await setKnob(page, NAIL[0], 2);
  await tie(page);
  check(await threadAt(page, 'red') === '2' && await threadAt(page, 'blue') === '6', 'labo : le clou × 2 amène 1 → 2 et 3 → 6');
  check(await vis(page, '[data-lt-svg]').locator('[data-lt-cross]').count() === 0, 'labo : le clou × 2 ne croise pas les fils');
  // le clou négatif au POINTEUR : glisser le nœud vers −2
  await page.locator('[data-lt-knob]:visible').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const hit = await vis(page, '[data-lt-beam-hit]').boundingBox();
  const xOfValue = (v) => hit.x + 8 + ((v + 10) / 20) * (hit.width - 16);
  const kb = await vis(page, '[data-lt-knob]').boundingBox();
  await page.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2);
  await page.mouse.down();
  await page.mouse.move(xOfValue(-1), hit.y + hit.height / 2, { steps: 8 });
  await page.mouse.move(xOfValue(-2), hit.y + hit.height / 2, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  check(await knobC(page) === '-2', `labo (pointeur) : le nœud glisse à −2 (${await knobC(page)})`);
  check(await threadAt(page, 'red') === '-2' && await threadAt(page, 'blue') === '-6', 'labo : le dépôt du nœud lie les fils (1 → −2, 3 → −6)');
  check(await vis(page, '[data-lt-svg]').locator('[data-lt-cross]').count() === 1, 'labo : le point de croisement s\'allume');
  check(await orderRel(page, 'bottom') === '>', 'labo : la ligne du bas dit « > »');
  check(await verdict(page) === 'right', 'labo : la tâche 1 est réussie');
  await page.screenshot({ path: `${OUT}/lab-crossed-1280.png` });
  // D'UN SEUL REGARD dans l'état croisé
  const gh = await vis(page, '[data-lt-glance]').boundingBox();
  check(gh.height <= 800, `labo (état croisé) : d'un seul regard à 1280×800 (${Math.round(gh.height)}px)`);
  await vis(page, '[data-lt-next]').click();
  // tâche 2 : atteindre 6 et 3 — le toucher d'une graduation
  await tool(page, 'nail');
  const hit2 = await vis(page, '[data-lt-beam-hit]').boundingBox();
  const tap = hit2.x + 8 + ((-3 + 10) / 20) * (hit2.width - 16);
  await page.mouse.click(tap, hit2.y + hit2.height / 2);
  await page.waitForTimeout(500);
  check(await knobC(page) === '-3', `labo (toucher) : une graduation de la poutre basse place le nœud (${await knobC(page)})`);
  check(await threadAt(page, 'red') === '6' && await threadAt(page, 'blue') === '3', 'labo : le clou −3 amène −2 → 6 et −1 → 3');
  check(await verdict(page) === 'right', 'labo : la tâche 2 est réussie');
  await vis(page, '[data-lt-next]').click();
  // tâche 3 : × 0 les réunit
  await tool(page, 'nail');
  await setKnob(page, NAIL[0], 0);
  await tie(page);
  check(await orderRel(page, 'bottom') === '=', 'labo : × 0 donne « = » (les deux nœuds sur 0)');
  check(await verdict(page) === 'right', 'labo : la tâche 3 est réussie');
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les trois tâches et l\'essai du peigne négatif');
  await page.screenshot({ path: `${OUT}/lab-zero-1280.png` });
  // « جرّب أعدادك »
  await vis(page, '[data-lt-free-a]').fill('2');
  await vis(page, '[data-lt-free-b]').fill('-1,5');
  check(await vis(page, '[data-lt-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est ouvert et actif');
  check(await threadAt(page, 'red') === '-3/2' && await threadAt(page, 'blue') === '2', 'labo : en libre le rouge part du plus petit (−3/2) et le bleu de 2');
  await tool(page, 'nail'); await setKnob(page, NAIL[0], -1); await tie(page);
  check(await vis(page, '[data-lt-svg]').locator('[data-lt-cross]').count() === 1, 'labo (libre) : × (−1) croise les fils');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });
  // module : les questions lisent les essais
  await vis(page, '[data-evidence=comb]').scrollIntoViewIfNeeded();
  check(await vis(page, '[data-evidence=comb]').getAttribute('data-tried') === 'true', 'module 1 : la preuve du peigne cite l\'essai de l\'élève');
  check(await vis(page, '[data-evidence=neg]').getAttribute('data-tried') === 'true', 'module 1 : la preuve du clou négatif cite l\'essai');
  check(await vis(page, '[data-evidence=zero]').getAttribute('data-tried') === 'true', 'module 1 : la preuve du zéro cite l\'essai');
  check(errors.length === 0, `labo مبتدئ : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3bis — le niveau متقدم : deux poutres, la bande.
{
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
  await page.waitForSelector('[data-loom-threads]');
  await pickLevel(page, 'advanced');
  check(await threadAt(page, 'red') === '-3/2' && await threadAt(page, 'blue') === '1', 'متقدم : rouge à −3/2, bleu à 1');
  check(await vis(page, '[data-lt-stage-btn]').isDisabled(), 'متقدم : « عارضة أخرى » inactif tant que le nœud est au repos');
  await page.screenshot({ path: `${OUT}/lab-adv-initial-1280.png` });
  // T1 : × (−2) puis + 2 → 5 et 0
  await tool(page, 'nail'); await setKnob(page, NAIL[0], -2, 0.5); await tie(page);
  check(await threadAt(page, 'red') === '3' && await threadAt(page, 'blue') === '-2', 'متقدم : × (−2) amène −3/2 → 3 et 1 → −2');
  await vis(page, '[data-lt-stage-btn]').click();
  check(await page.locator('[data-lt-beam]:visible').count() === 3, 'متقدم : une troisième poutre s\'ouvre');
  await page.screenshot({ path: `${OUT}/lab-adv-stage-1280.png` });
  await tool(page, 'comb'); await setKnob(page, COMB[0], 2, 0.5); await tie(page);
  check(await threadAt(page, 'red') === '5' && await threadAt(page, 'blue') === '0', 'متقدم : puis + 2 atteint 5 et 0');
  check(await verdict(page) === 'right', 'متقدم : la tâche 1 est réussie (deux étapes)');
  const gh = await vis(page, '[data-lt-glance]').boundingBox();
  console.log(`  glance متقدم 3 poutres ${Math.round(gh.height)}px`);
  await vis(page, '[data-lt-next]').click();
  // T2 : la bande x < 3 → bord −6, à droite
  check(await vis(page, '[data-lt-band]').count() === 1, 'متقدم : la bande est peinte');
  await tool(page, 'nail'); await setKnob(page, NAIL[0], 2, 0.5); await tie(page);
  check(await vis(page, '[data-lt-verdict]').textContent().then((t) => t.includes('يسارها')), 'متقدم : × 2 : la bande reste à gauche (verdict)');
  await tool(page, 'nail'); await setKnob(page, NAIL[0], -2, 0.5); await tie(page);
  check(await verdict(page) === 'right', 'متقدم : × (−2) porte le bord à −6 avec la bande à droite');
  await page.screenshot({ path: `${OUT}/lab-adv-band-1280.png` });
  await vis(page, '[data-lt-next]').click();
  // T3 : × (−1/2)
  await tool(page, 'nail'); await setKnob(page, NAIL[0], -0.5, 0.5); await tie(page);
  check(await verdict(page) === 'right', 'متقدم : × (−1/2) atteint −1 et −3/2');
  check((await vis(page, '[data-lt-op]').textContent()).includes('÷'), 'متقدم : la lecture écrit aussi la division (÷ (−2))');
  check(errors.length === 0, `labo متقدم : aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 4 — D'UN SEUL REGARD aux cinq tailles, aux deux niveaux, état initial.
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]]) {
  for (const level of ['beginner', 'advanced']) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${CH}/${LESSON}/nashat`);
    await page.waitForSelector('[data-loom-threads]');
    if (level === 'advanced') await pickLevel(page, 'advanced');
    const g = vis(page, '[data-lt-glance]');
    await g.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(250);
    const box = await g.boundingBox();
    check(box.height <= h, `d'un seul regard ${w}×${h} ${level} : ${Math.round(box.height)}px ≤ ${h}`);
    await page.screenshot({ path: `${OUT}/glance-${level}-${w}x${h}.png` });
    if (level === 'advanced') {
      // trois poutres (deux étapes engagées) : le bloc grandit, il doit rester d'un seul regard
      await tool(page, 'nail'); await setKnob(page, NAIL[0], -2, 0.5); await tie(page);
      await vis(page, '[data-lt-stage-btn]').click();
      await tool(page, 'comb'); await setKnob(page, COMB[0], 2, 0.5); await tie(page);
      await g.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.waitForTimeout(250);
      const box3 = await g.boundingBox();
      check(box3.height <= h, `d'un seul regard ${w}×${h} متقدم, trois poutres et verdict : ${Math.round(box3.height)}px ≤ ${h}`);
      await page.screenshot({ path: `${OUT}/glance-advanced-3beams-${w}x${h}.png` });
    }
    await ctx.close();
  }
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s) :\n- ${failures.join('\n- ')}`); process.exit(1); }
console.log('\nQA loom-threads : tout est bon.');
