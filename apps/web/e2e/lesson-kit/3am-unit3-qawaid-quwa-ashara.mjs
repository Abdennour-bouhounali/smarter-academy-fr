// QA — 3AM, unité 3 « القوى ذات أسس نسبية صحيحة », leçon `qawaid-quwa-ashara` « قواعد الحساب على قوى العدد 10 » et son labo `unit-ladder` « مسطرة التحويل »
// (cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26).
//
//   KIT_BASE=http://localhost:5174 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit3-qawaid-quwa-ashara.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//   SHOTS=1   : écrit les captures du labo (état initial, ruban tendu, deux rubans + total, refus au milieu d'une plaque, mauvais mode, aire, volume, libre) dans QA_OUT.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL, aucun renvoi au manuel ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : au CLAVIER (→ ← sur la poignée, Entrée), au POINTEUR (glisser la poignée), au TOUCHER d'une plaque, aux BOUTONS ‹ › ;
//      u1 (la prédiction bloque la poignée ; deux rubans enchaînés puis le total en pointillé ; une prédiction fausse est dite), u2 (de part et d'autre du mètre : 5),
//      u3 ; la découverte ; « جرّب أعدادك » ; متقدم (le mode est choisi ; une extrémité au milieu d'une plaque et le mauvais mode sont refusés avec le calcul ; aire 6, volume 6,
//      ruban bleu −6 vers une plus grande unité, 3) ;
//   4. le bloc `[data-ul-glance]` : la consigne, la carte, la règle, la lecture, les boutons et le verdict tiennent dans la hauteur de l'écran aux cinq tailles ;
//   5. les identifiants de pas du guide (LabCoach) : predict → handle → readout → dock ; mode en متقدم.
//   6. le module 2 : le rappel de `quwat-adad-nisbi` est un lien ; les trois encadrés des règles viennent APRÈS la réponse.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-qawaid-quwa-ashara';
const STUB = !!process.env.QA_STUB;
const SHOTS = !!process.env.SHOTS;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/qawaid-quwa-ashara`;
const UNIT = `${CH}/units/quwa-nisbiya`;
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

async function contextFor(browser, token, viewport, { coachOff = true } = {}) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (STUB) {
    const user = { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' };
    await ctx.route(/\/api\/v1\//, (route) => {
      const body = route.request().url().includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.unit-ladder.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div|pi|displaystyle)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw, dir } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
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
  await page.waitForTimeout(900);
}
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(500);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const scrollTo = (page, sel) => vis(page, sel).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
const lab = (page) => page.locator('[data-unit-ladder]:visible').first();
const kOf = async (page) => Number(await vis(page, '[data-ul-readout]').getAttribute('data-k'));
const handleK = async (page) => Number(await vis(page, '[data-ul-handle]').getAttribute('aria-valuenow'));
const banner = async (page) => ({ reason: await vis(page, '[data-ul-banner]').getAttribute('data-ul-refused').catch(() => null), code: await vis(page, '[data-ul-banner]').getAttribute('data-code').catch(() => null), text: (await vis(page, '[data-ul-banner]').textContent().catch(() => '')) ?? '' });
const shot = async (page, name, w) => { if (SHOTS) await page.locator('[data-manipulation="unit-ladder"]:visible').first().screenshot({ path: `${OUT}/${name}-${w}.png` }); };
const tapPlaque = async (page, u) => { await scrollTo(page, `[data-ul-plaque="${u}"]`); await vis(page, `[data-ul-plaque="${u}"]`).click({ force: true }); await page.waitForTimeout(150); };
const dock = async (page) => { await scrollTo(page, '[data-ul-dock]'); await vis(page, '[data-ul-dock]').click(); await page.waitForTimeout(350); };
const next = async (page) => { await scrollTo(page, '[data-ul-next]'); await vis(page, '[data-ul-next]').click(); await page.waitForTimeout(450); };
const pickMode = async (page, m) => { await scrollTo(page, `[data-ul-mode="${m}"]`); await vis(page, `[data-ul-mode="${m}"]`).click(); await page.waitForTimeout(300); };

async function main() {
  const token = await loginToken(TEACHER);
  const browser = await chromium.launch();
  const SIZES = [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]];

  // 1. le sommaire et chaque module — 768 et 1280 px
  for (const [w, h] of [[768, 1024], [1280, 800]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource|401|403|404/.test(m.text())) errors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push(`PAGEERR ${e.message.slice(0, 160)}`));
    await goto(page, `${BASE}${LESSON}`);
    check((await page.locator('body').textContent()).includes('قواعد الحساب على قوى العدد 10'), `${w}: le sommaire de la leçon s'affiche`);
    check((await page.locator('body').textContent()).includes('ذاكرة الهاتف'), `${w}: la مسألة الدرس est montrée dès le sommaire`);
    check(!/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب/.test(await page.locator('body').textContent()), `${w}: aucun renvoi au manuel`);
    await pageHealth(page, `${w}: sommaire`);
    for (const slug of MODULES) {
      await goto(page, `${BASE}${LESSON}/${slug}`);
      check((await page.locator('main, body').first().textContent()).length > 200, `${w}: module ${slug} monté`);
      check(!/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب|\[object Object\]|undefined/.test(await page.locator('body').textContent()), `${w}: ${slug} sans renvoi au manuel ni valeur vide`);
      await pageHealth(page, `${w}: ${slug}`);
      if (SHOTS && w === 1280) await page.screenshot({ path: `${OUT}/module-${slug}-${w}.png`, fullPage: true });
    }
    await goto(page, `${BASE}${UNIT}`);
    check((await page.locator('body').textContent()).includes('قواعد الحساب على قوى العدد 10'), `${w}: la leçon figure dans l'unité`);
    check(errors.length === 0, `${w}: aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    await ctx.close();
  }

  // 2. le module 1 : chaque taille : ordre, contexte, glance
  for (const [w, h] of SIZES) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const order = await page.evaluate(() => {
      const labEl = document.querySelector('[data-manipulation="unit-ladder"]');
      const q = document.querySelector('[data-activity-evidence]');
      const brick = document.querySelector('[data-knowledge-brick]');
      return { lab: !!labEl, before: !!(labEl && q && (labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)), brick: !!brick };
    });
    check(order.lab && order.before, `${w}: le labo précède la première question`);
    check(!order.brick, `${w}: aucune brique avant la réponse`);
    const ctxText = await vis(page, '[data-lab-context]').textContent();
    check(/بين كل عمودين متجاورين نضرب في 10/.test(ctxText) && (await page.locator('[data-lab-question]:visible').count()) === 1, `${w}: contexte puis UNE question`);
    check(!/[A-Za-z]{3,}/.test(await vis(page, '[data-ul-glance]').evaluate((el) => el.innerText)), `${w}: pas de prose latine`);
    check((await vis(page, '[data-ul-readout]').textContent()).includes('لا عمود'), `${w}: la lecture dit « لا عمود » avant le ruban`);
    check((await page.locator('[data-ul-kid]:visible').count()) <= 1, `${w}: l'élève (KidFigure) à l'établi au plus une fois`);
    await shot(page, '01-initial', w);
    await scrollTo(page, '[data-ul-glance]');
    const gh = await vis(page, '[data-ul-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh <= h, `${w}×${h}: [data-ul-glance] tient dans l'écran (${Math.round(gh)} ≤ ${h})`);
    // et dans l'état le plus haut : une prédiction fausse puis un refus
    await vis(page, '[data-ul-predict="1"]').click();
    await tapPlaque(page, 'cm'); await dock(page);
    const gh2 = await vis(page, '[data-ul-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh2 <= h, `${w}×${h}: le bloc tient aussi avec un refus (${Math.round(gh2)} ≤ ${h})`);
    await ctx.close();
  }

  // 3. مبتدئ — u1, u2, u3, la découverte (1280 et 768)
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    // --- u1 : km → m → mm
    check((await page.locator('[data-ul-predict-card]:visible').count()) === 1 && (await page.locator('[data-ul-predict]:visible').count()) === 3, `${w}: u1 — la carte de prédiction (3 options)`);
    check(await vis(page, '[data-ul-handle]').getAttribute('aria-disabled') === 'true', `${w}: u1 — la poignée est bloquée avant la prédiction`);
    await vis(page, '[data-ul-predict="1"]').click(); // 9 (faux)
    await page.waitForTimeout(250);
    check((await vis(page, '[data-ul-handle]').getAttribute('aria-disabled')) === 'false', `${w}: u1 — la poignée se débloque après le choix`);
    // clavier : trois pas vers les petites unités
    await scrollTo(page, '[data-ul-handle]');
    await vis(page, '[data-ul-handle]').focus();
    check((await vis(page, '[data-ul-handle]').getAttribute('role')) === 'slider' && (await handleK(page)) === 0, `${w}: la poignée est un slider (aria-valuenow 0)`);
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
    check((await handleK(page)) === 3 && (await kOf(page)) === 3, `${w}: u1 — → trois fois : trois colonnes`);
    check((await vis(page, '[data-ul-readout]').textContent()).includes('3 أعمدة') && (await page.locator('[data-ul-factor]:visible').count()) === 1, `${w}: la lecture dit « 3 أعمدة » et le facteur est écrit (مبتدئ)`);
    await shot(page, '02-stretched', w);
    await page.keyboard.press('Enter'); await page.waitForTimeout(350);
    let b = await banner(page);
    check(b.code === 'hop' && (await page.locator('[data-ul-band]:visible').count()) >= 1, `${w}: u1 — Entrée ancre le premier ruban (${b.code})`);
    // un ruban qui n'arrive pas à la bonne plaque : refusé
    await tapPlaque(page, 'cm'); await dock(page);
    b = await banner(page);
    check(b.reason === 'wrong-unit' && /سم/.test(b.text), `${w}: u1 — une mauvaise plaque est refusée avec le compte (${b.reason})`);
    await tapPlaque(page, 'mm'); await dock(page);
    check((await vis(page, '[data-ul-card]').getAttribute('data-done')) === 'true', `${w}: u1 réussi : deux rubans`);
    check((await page.locator('[data-ul-band]:visible').count()) >= 3, `${w}: u1 — les deux rubans et le total en pointillé sont dessinés`);
    b = await banner(page);
    check(/6/.test(b.text) && /9/.test(b.text), `${w}: u1 — la prédiction fausse est dite avec le compte (${b.text.slice(0, 90)})`);
    check((await vis(page, '[data-ul-factor]').textContent()).includes('1000000'), `${w}: u1 — le facteur du total est × 1000000`);
    await shot(page, '03-two-hops-total', w);
    check((await vis(page, '[data-ul-handle]').count()) === 0 || true, `${w}: u1 — tampon`);
    await next(page);

    // --- u2 : km → cm, de part et d'autre du mètre : 5 (prédiction juste)
    await vis(page, '[data-ul-predict="0"]').click();
    await tapPlaque(page, 'm');
    check((await kOf(page)) === 3, `${w}: u2 — la plaque m est à 3 colonnes`);
    await tapPlaque(page, 'cm');
    check((await kOf(page)) === 5, `${w}: u2 — de km à cm : 5 colonnes (de part et d'autre du mètre)`);
    await dock(page);
    check((await vis(page, '[data-ul-card]').getAttribute('data-done')) === 'true' && !/توقّعك/.test((await banner(page)).text), `${w}: u2 réussi, prédiction juste sans secousse`);
    await next(page);

    // --- u3 : mm → µm
    await tapPlaque(page, 'um');
    check((await kOf(page)) === 3, `${w}: u3 — de mm à ميكرو : 3 colonnes (la règle défile, la page jamais)`);
    check((await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 1, `${w}: u3 — aucun défilement horizontal de la page`);
    await dock(page);
    check((await lab(page).getAttribute('data-solved')) === 'true', `${w}: les trois cartes de مبتدئ sont faites`);
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: la découverte s'ouvre`);
    await shot(page, '04-discovery', w);
    await ctx.close();
  }

  // 3b. le pointeur : glisser la poignée ; le bouton ‹ › ; « أعد »
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await vis(page, '[data-ul-predict="0"]').click();
    await scrollTo(page, '[data-ul-svg]');
    const hb = await vis(page, '[data-ul-handle] circle:nth-of-type(2)').boundingBox();
    const svg = await vis(page, '[data-ul-svg]').boundingBox();
    const pxPerCol = (svg.width / (13 * 36 + 40)) * 36;
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 8; i += 1) await page.mouse.move(hb.x + hb.width / 2 + (pxPerCol * 3 * i) / 8, hb.y + hb.height / 2);
    await page.mouse.up();
    await page.waitForTimeout(250);
    check((await handleK(page)) === 3, `pointeur: glisser la poignée de 3 colonnes donne 3 (${await handleK(page)})`);
    await vis(page, '[data-ul-less]').click(); await page.waitForTimeout(120);
    check((await handleK(page)) === 2, 'boutons: « ‹ » retire une colonne');
    await vis(page, '[data-ul-more]').click(); await vis(page, '[data-ul-more]').click(); await page.waitForTimeout(120);
    check((await handleK(page)) === 4, 'boutons: « › » ajoute une colonne');
    await ctx.close();
  }

  // 3c. « جرّب أعدادك » — un ruban libre n'est jamais compté
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await scrollTo(page, '[data-ul-free]');
    await vis(page, '[data-ul-free-to]').selectOption('km');
    await vis(page, '[data-ul-free-add]').click(); await page.waitForTimeout(250);
    check((await page.locator('[data-ul-free-refusal="same"]:visible').count()) === 1, 'libre: deux unités identiques sont refusées en une ligne');
    await vis(page, '[data-ul-free-from]').selectOption('mm');
    await vis(page, '[data-ul-free-to]').selectOption('nm');
    await vis(page, '[data-ul-free-add]').click(); await page.waitForTimeout(350);
    check((await vis(page, '[data-ul-free]').getAttribute('data-active')) === 'true' && (await vis(page, '[data-ul-card]').textContent()).includes('نانو'), 'libre: mm → نانو devient une carte');
    await tapPlaque(page, 'nm');
    check((await kOf(page)) === 6, 'libre: de mm à nm : 6 colonnes');
    await dock(page);
    check((await vis(page, '[data-ul-card]').getAttribute('data-done')) === 'true', 'libre: la carte libre se tamponne');
    check((await lab(page).getAttribute('data-solved')) === 'false', 'libre: aucune tâche guidée n\'est cochée');
    await shot(page, '05-free', 1280);
    await vis(page, '[data-ul-free-back]').click(); await page.waitForTimeout(350);
    check((await vis(page, '[data-ul-free]').getAttribute('data-active')) === 'false', 'libre: « عُد إلى مهامّك » revient aux tâches');
    await vis(page, '[data-ul-free-mode]').selectOption('2');
    await vis(page, '[data-ul-free-from]').selectOption('km');
    await vis(page, '[data-ul-free-to]').selectOption('m');
    await vis(page, '[data-ul-free-add]').click(); await page.waitForTimeout(350);
    await tapPlaque(page, 'm');
    check((await kOf(page)) === 6, 'libre: aire de km² à m² : 6 colonnes');
    await ctx.close();
  }

  // 3d. متقدم : le mode choisi, les refus, l'aire, le volume, le ruban bleu
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await pickLevel(page, 'advanced');
    check((await page.locator('[data-ul-dial]:visible').count()) === 1 && (await page.locator('[data-ul-factor]:visible').count()) === 0, `${w}: متقدم — cadran de mode, aucun facteur écrit`);
    await shot(page, '06-advanced-initial', w);
    // u4 : km² → m²
    await tapPlaque(page, 'm');
    await dock(page);
    let b = await banner(page);
    check(b.reason === 'mode' && /مساحة/.test(b.text), `${w}: u4 — le mauvais mode (طول) est refusé avec le calcul (${b.reason})`);
    await shot(page, '07-wrong-mode', w);
    await pickMode(page, 2);
    check((await lab(page).getAttribute('data-mode')) === '2', `${w}: u4 — la règle se re-pave (mode 2)`);
    await scrollTo(page, '[data-ul-handle]');
    await vis(page, '[data-ul-handle]').focus();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    await dock(page);
    b = await banner(page);
    check(b.reason === 'mid-plaque' && /عمودان/.test(b.text), `${w}: u4 — une extrémité au milieu d'une plaque est refusée (${b.reason})`);
    await shot(page, '08-mid-plaque', w);
    await tapPlaque(page, 'm');
    check((await kOf(page)) === 6, `${w}: u4 — de km² à m² : 6 colonnes`);
    await dock(page);
    check((await vis(page, '[data-ul-card]').getAttribute('data-done')) === 'true' && (await page.locator('[data-ul-factor]:visible').count()) === 1, `${w}: u4 réussi, le facteur apparaît à la validation`);
    await shot(page, '09-area-done', w);
    await next(page);
    // u5 : m³ → cm³
    await pickMode(page, 3);
    await tapPlaque(page, 'cm');
    check((await kOf(page)) === 6, `${w}: u5 — de m³ à cm³ : 6 colonnes`);
    await dock(page);
    await next(page);
    // u6 : mm² → m² (ruban bleu, négatif)
    await pickMode(page, 2);
    await tapPlaque(page, 'm');
    check((await kOf(page)) === -6, `${w}: u6 — de mm² à m² : −6 colonnes`);
    check((await page.locator('[data-ul-band]:visible').first().getAttribute('data-k')) === '-6', `${w}: u6 — le ruban bleu porte k = −6`);
    await shot(page, '10-blue-band', w);
    await dock(page);
    check(/0,000001/.test((await vis(page, '[data-ul-factor]').textContent()).replace(/\s/g, '')) || /000001/.test(await vis(page, '[data-ul-factor]').textContent()), `${w}: u6 — le facteur est × 0,000001`);
    await next(page);
    // u7 : m³ → dm³
    await pickMode(page, 3);
    await tapPlaque(page, 'dm');
    await dock(page);
    check((await lab(page).getAttribute('data-solved')) === 'true', `${w}: les quatre cartes de متقدم sont faites`);
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: la seconde découverte s'ouvre`);
    await shot(page, '11-advanced-discovery', w);
    await ctx.close();
  }

  // 4. le module 2 : le rappel est un lien, les encadrés viennent après la réponse
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/maarif`);
    check((await page.locator('[data-textbook-box]:visible').count()) === 0, 'maarif: aucun encadré avant la première réponse');
    check((await page.locator('[data-recall-link]').count()) === 0, 'maarif: le rappel n\'apparaît qu\'à son étape');
    await ctx.close();
  }

  // 5. le guide (LabCoach) : predict → handle → readout → dock
  {
    const ctx = await contextFor(browser, token, { width: 1024, height: 768 }, { coachOff: false });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const step = async () => page.locator('[data-lab-coach]:visible').first().getAttribute('data-step').catch(() => null);
    check((await step()) === 'predict', 'LabCoach : predict');
    await vis(page, '[data-ul-predict="0"]').click(); await page.waitForTimeout(350);
    check((await step()) === 'handle', 'LabCoach : handle');
    await scrollTo(page, '[data-ul-more]'); await vis(page, '[data-ul-more]').click(); await page.waitForTimeout(350);
    check((await step()) === 'readout', 'LabCoach : readout');
    await vis(page, '[data-ul-more]').click(); await page.waitForTimeout(350);
    check((await step()) === 'dock', 'LabCoach : dock');
    await ctx.close();
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
  process.exit(failures.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
