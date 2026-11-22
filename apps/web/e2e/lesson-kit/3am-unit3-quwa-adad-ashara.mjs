// QA — 3AM, unité 3 « القوى ذات أسس نسبية صحيحة », leçon `quwa-adad-ashara` « قوى العدد 10 » et son labo `ten-zoom` « عدسة القوى »
// (cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26 — la première leçon générée de l'unité après `quwat-adad-nisbi`).
//
//   KIT_BASE=http://localhost:5174 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit3-quwa-adad-ashara.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//   SHOTS=1   : écrit les captures du labo (état initial, refus, tampon, prédiction, négatif, avancé, préfixes, libre) dans QA_OUT.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ;
//   3. le labo : au CLAVIER (+ / − sur la bague : n et la plaque), au POINTEUR (glisser autour de la bague), à la MOLETTE, au PINCEMENT (pointeurs tactiles simulés), aux BOUTONS ;
//      z1 (1 000 : un cadre trop grand est refusé avec « 10 000 = 1 000 × 10 », trop petit, mauvais sens), z2 (la prédiction bloque la bague avant son choix ; une prédiction fausse est
//      dite ensuite), z3 (0,001 : la plaque garde un nombre POSITIF), z4 (retour : 0 cran), la découverte, « جرّب أعدادك » (accepté / refusé), متقدم (noms, unités, 10 كم),
//      le monde `prefixes` du module 2 ;
//   4. le bloc `[data-tz-glance]` : la consigne, la carte, la lentille, la plaque, les boutons et le verdict tiennent dans la hauteur de l'écran aux cinq tailles ;
//   5. les identifiants de pas du guide (LabCoach) : ring → plate → dock ; predict avant ring quand il y a une prédiction.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-quwa-adad-ashara';
const STUB = !!process.env.QA_STUB;
const SHOTS = !!process.env.SHOTS;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/quwa-adad-ashara`;
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
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.ten-zoom.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
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
const lab = (page) => page.locator('[data-ten-zoom]:visible').first();
const nOf = async (page) => Number(await lab(page).getAttribute('data-n'));
const sideOf = async (page) => vis(page, '[data-tz-side]').getAttribute('data-value');
const banner = async (page) => ({ reason: await vis(page, '[data-tz-banner]').getAttribute('data-tz-refused').catch(() => null), code: await vis(page, '[data-tz-banner]').getAttribute('data-code').catch(() => null), text: (await vis(page, '[data-tz-banner]').textContent().catch(() => '')) ?? '' });
const shot = async (page, name, w) => { if (SHOTS) await page.locator('[data-manipulation="ten-zoom"]:visible').first().screenshot({ path: `${OUT}/${name}-${w}.png` }); };
const more = async (page, k) => { await scrollTo(page, '[data-tz-more]'); for (let i = 0; i < k; i += 1) { await vis(page, '[data-tz-more]').click(); await page.waitForTimeout(60); } };
const less = async (page, k) => { await scrollTo(page, '[data-tz-less]'); for (let i = 0; i < k; i += 1) { await vis(page, '[data-tz-less]').click(); await page.waitForTimeout(60); } };
const dock = async (page) => { await scrollTo(page, '[data-tz-dock]'); await vis(page, '[data-tz-dock]').click(); await page.waitForTimeout(350); };
const next = async (page) => { await scrollTo(page, '[data-tz-next]'); await vis(page, '[data-tz-next]').click(); await page.waitForTimeout(450); };

/** Le centre et le rayon (px écran) de la bague, d'après le cadre du SVG (viewBox 0 14 600 366, centre (300, 198), rayon moyen 142). */
async function ringGeometry(page) {
  const b = await vis(page, '[data-tz-lens-svg]').boundingBox();
  const scale = Math.min(b.width / 600, b.height / 366);
  return { cx: b.x + b.width / 2, cy: b.y + b.height / 2 + 1 * scale, r: 142 * scale };
}
/** Tourner la bague au pointeur de `deg` degrés (sens horaire si > 0), en partant du haut. */
async function dragRing(page, deg) {
  await scrollTo(page, '[data-tz-lens-svg]');
  const { cx, cy, r } = await ringGeometry(page);
  const at = (a) => ({ x: cx + r * Math.sin((a * Math.PI) / 180), y: cy - r * Math.cos((a * Math.PI) / 180) });
  const p0 = at(0);
  await page.mouse.move(p0.x, p0.y);
  await page.mouse.down();
  const steps = Math.max(6, Math.round(Math.abs(deg) / 8));
  for (let i = 1; i <= steps; i += 1) { const p = at((deg * i) / steps); await page.mouse.move(p.x, p.y); }
  await page.mouse.up();
  await page.waitForTimeout(350);
}

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
    check((await page.locator('body').textContent()).includes('قوى العدد 10'), `${w}: le sommaire de la leçon s'affiche`);
    check((await page.locator('body').textContent()).includes('تحت المجهر'), `${w}: la مسألة الدرس est montrée dès le sommaire`);
    check(!/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب/.test(await page.locator('body').textContent()), `${w}: aucun renvoi au manuel`);
    await pageHealth(page, `${w}: sommaire`);
    for (const slug of MODULES) {
      await goto(page, `${BASE}${LESSON}/${slug}`);
      check((await page.locator('main, body').first().textContent()).length > 200, `${w}: module ${slug} monté`);
      check(!/الكتاب ص|اقرأ ما يقوله الكتاب|تمارين من الكتاب|\[object Object\]|undefined/.test(await page.locator('body').textContent()), `${w}: ${slug} sans renvoi au manuel ni valeur vide`);
      await pageHealth(page, `${w}: ${slug}`);
    }
    await goto(page, `${BASE}${UNIT}`);
    check((await page.locator('body').textContent()).includes('قوى العدد 10'), `${w}: la leçon figure dans l'unité`);
    check(errors.length === 0, `${w}: aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    await ctx.close();
  }

  // 2 + 3. le module 1 : le labo à deux niveaux — chaque taille : ordre, contexte, glance ; puis le parcours complet à 1280 et 768
  for (const [w, h] of SIZES) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const order = await page.evaluate(() => {
      const labEl = document.querySelector('[data-manipulation="ten-zoom"]');
      const q = document.querySelector('[data-activity-evidence]');
      const brick = document.querySelector('[data-knowledge-brick]');
      return { lab: !!labEl, before: !!(labEl && q && (labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)), brick: !!brick };
    });
    check(order.lab && order.before, `${w}: le labo précède la première question`);
    check(!order.brick, `${w}: aucune brique avant la réponse`);
    check((await lab(page).getAttribute('data-world')) === 'zoom' && (await nOf(page)) === 0, `${w}: monde zoom, la table (n = 0)`);
    const ctxText = await vis(page, '[data-lab-context]').textContent();
    check(/الإطار الآن ضلعه/.test(ctxText) && (await page.locator('[data-lab-question]:visible').count()) === 1, `${w}: contexte puis UNE question`);
    check(!/[A-Za-z]{3,}/.test(await vis(page, '[data-tz-glance]').evaluate((el) => el.innerText)), `${w}: pas de prose latine`);
    check((await sideOf(page)) === '1', `${w}: la plaque lit 1 sans cran`);
    check((await page.locator('[data-tz-tally]:visible').count()) === 0, `${w}: la tally n'est montrée qu'après un cran`);
    await shot(page, '01-initial', w);
    await scrollTo(page, '[data-tz-glance]');
    const gh = await vis(page, '[data-tz-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh <= h, `${w}×${h}: [data-tz-glance] tient dans l'écran (${Math.round(gh)} ≤ ${h})`);
    // et jusque dans un état de refus (bannière la plus haute)
    await more(page, 4); await dock(page);
    const gh2 = await vis(page, '[data-tz-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh2 <= h, `${w}×${h}: le bloc tient aussi avec un refus (${Math.round(gh2)} ≤ ${h})`);
    await ctx.close();
  }

  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);

    // --- z1 : 1 000 m — le clavier sur la bague
    await scrollTo(page, '[data-tz-ring]');
    await vis(page, '[data-tz-ring]').focus();
    check((await vis(page, '[data-tz-ring]').getAttribute('role')) === 'slider' && (await vis(page, '[data-tz-ring]').getAttribute('aria-valuenow')) === '0', `${w}: la bague est un slider (aria-valuenow 0)`);
    await page.keyboard.press('+'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    check((await nOf(page)) === 3 && (await sideOf(page)) === '1000', `${w}: z1 — « + » et → : trois crans, la plaque lit 1 000`);
    check((await vis(page, '[data-tz-ring]').getAttribute('aria-valuenow')) === '3', `${w}: aria-valuenow = 3`);
    check((await page.locator('[data-tz-tally]:visible').count()) === 1 && /1 × 10 × 10 × 10/.test(await vis(page, '[data-tz-tally]').textContent()), `${w}: la tally « 1 × 10 × 10 × 10 » (مبتدئ)`);
    await shot(page, '02-three-notches', w);
    await page.keyboard.press('+');
    await dock(page);
    let b = await banner(page);
    check(b.reason === 'over' && /أكبر من البطاقة/.test(b.text) && /10 مرّات/.test(b.text), `${w}: z1 — un cadre trop grand est refusé avec le facteur (${b.reason})`);
    check((await page.locator('[data-tz-banner]:visible .katex').count()) >= 2, `${w}: le refus écrit son calcul en KaTeX`);
    await shot(page, '03-overshoot-refused', w);
    await vis(page, '[data-tz-ring]').focus();
    await page.keyboard.press('-'); await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(250);
    await dock(page);
    b = await banner(page);
    check(b.reason === 'under' && /ضرب في 10/.test(b.text), `${w}: z1 — un cadre trop petit est refusé (${b.reason})`);
    await less(page, 3);
    await dock(page);
    b = await banner(page);
    check(b.reason === 'direction' && /صغّر|كبّر/.test(b.text), `${w}: z1 — un cadre dans le mauvais sens est refusé avec le sens à prendre (${b.reason})`);
    await more(page, 4);
    await dock(page);
    check((await vis(page, '[data-tz-card]').getAttribute('data-done')) === 'true' && (await page.locator('[data-tz-next]:visible').count()) === 1, `${w}: z1 réussi (tampon + « البطاقة التالية »)`);
    check((await vis(page, '[data-tz-more]').isDisabled()), `${w}: la bague est verrouillée après le tampon`);
    await shot(page, '04-stamp', w);
    await next(page);

    // --- z2 : 1 000 000 m avec prédiction
    check((await page.locator('[data-tz-predict-card]:visible').count()) === 1 && (await page.locator('[data-tz-predict]:visible').count()) === 3, `${w}: z2 — la carte de prédiction (3 options)`);
    check(await vis(page, '[data-tz-more]').isDisabled(), `${w}: z2 — la bague est bloquée avant la prédiction`);
    await shot(page, '05-predict', w);
    await vis(page, '[data-tz-predict="1"]').click(); // 7 (faux)
    await page.waitForTimeout(250);
    check(!(await vis(page, '[data-tz-more]').isDisabled()), `${w}: z2 — la bague se débloque après le choix`);
    await more(page, 6);
    check((await sideOf(page)) === '1000000', `${w}: z2 — 6 crans : la plaque lit 1 000 000`);
    await dock(page);
    check((await vis(page, '[data-tz-card]').getAttribute('data-done')) === 'true', `${w}: z2 réussi malgré une prédiction fausse`);
    b = await banner(page);
    check(/6/.test(b.text) && /7/.test(b.text), `${w}: z2 — la prédiction fausse est dite avec le compte de la bague (${b.text.slice(0, 80)})`);
    await shot(page, '06-wrong-prediction', w);
    await next(page);

    // --- z3 : 0,001 m — l'échelle ne devient jamais négative
    await less(page, 3);
    check((await sideOf(page)) === '0,001' && (await nOf(page)) === -3, `${w}: z3 — 3 crans de réduction : la plaque lit 0,001, positif`);
    check(!/^−|-/.test(await vis(page, '[data-tz-side]').textContent()), `${w}: z3 — la plaque ne montre aucun signe moins`);
    check((await vis(page, '[data-tz-unit]').textContent()).includes('ميليمتر'), `${w}: z3 — la plaque nomme le ميليمتر`);
    await shot(page, '07-negative', w);
    await dock(page);
    await next(page);

    // --- z4 : retour à 1 m (part de n = −3)
    check((await nOf(page)) === -3, `${w}: z4 — part de la fin de z3 (n = −3)`);
    await more(page, 3);
    check((await nOf(page)) === 0 && (await sideOf(page)) === '1', `${w}: z4 — de retour sur la table : 1 m, aucun cran net`);
    await dock(page);
    check((await lab(page).getAttribute('data-solved')) === 'true', `${w}: les quatre cartes de مبتدئ sont faites`);
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: la découverte s'ouvre`);
    await shot(page, '08-discovery', w);
    await ctx.close();
  }

  // 3b. les autres gestes — pointeur (glisser la bague), molette, pincement — 1280×800
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await dragRing(page, 100); // ≈ 3 crans (30° chacun, reste < 30°)
    check((await nOf(page)) === 3, `pointeur: glisser la bague de 100° donne 3 crans (n = ${await nOf(page)})`);
    await dragRing(page, -65);
    check((await nOf(page)) === 1, `pointeur: glisser dans l'autre sens de 65° retire 2 crans (n = ${await nOf(page)})`);
    // molette : vers le haut = cadre plus petit
    await scrollTo(page, '[data-tz-lens-svg]');
    const bx = await vis(page, '[data-tz-lens-svg]').boundingBox();
    await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2);
    await page.mouse.wheel(0, -120); await page.waitForTimeout(260);
    check((await nOf(page)) === 0, `molette: vers le haut réduit le cadre (n = ${await nOf(page)})`);
    await page.mouse.wheel(0, 120); await page.waitForTimeout(260);
    check((await nOf(page)) === 1, `molette: vers le bas agrandit le cadre (n = ${await nOf(page)})`);
    // pincement : deux pointeurs tactiles sur la lentille — écarter = plus petit
    const n0 = await nOf(page);
    await vis(page, '[data-tz-lens-hit]').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2; const cy = r.y + r.height / 2;
      const ev = (type, id, x) => el.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: cy, bubbles: true, isPrimary: id === 11 }));
      ev('pointerdown', 11, cx - 30); ev('pointerdown', 12, cx + 30);
      for (let i = 1; i <= 8; i += 1) { ev('pointermove', 11, cx - 30 - i * 10); ev('pointermove', 12, cx + 30 + i * 10); }
      ev('pointerup', 11, cx - 110); ev('pointerup', 12, cx + 110);
    });
    await page.waitForTimeout(300);
    check((await nOf(page)) < n0, `pincement: écarter les doigts réduit le cadre (${n0} → ${await nOf(page)})`);
    // les boutons
    const n1 = await nOf(page);
    await vis(page, '[data-tz-more]').click(); await page.waitForTimeout(120);
    check((await nOf(page)) === n1 + 1, 'boutons: « ×10 » ajoute un cran');
    await ctx.close();
  }

  // 3c. « جرّب أعدادك » — un tampon libre n'est jamais compté
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await scrollTo(page, '[data-tz-free-input]');
    const input = vis(page, '[data-tz-free-input]');
    await input.fill('2 000'); await vis(page, '[data-tz-free-add]').click(); await page.waitForTimeout(250);
    check((await page.locator('[data-tz-free-refusal="notpow"]:visible').count()) === 1, 'libre: « 2 000 » est refusé en une ligne (pas une puissance de 10)');
    await input.fill('abc'); await vis(page, '[data-tz-free-add]').click(); await page.waitForTimeout(250);
    check((await page.locator('[data-tz-free-refusal="format"]:visible').count()) === 1, 'libre: « abc » est refusé');
    await input.fill('0,0001'); await vis(page, '[data-tz-free-add]').click(); await page.waitForTimeout(350);
    check((await vis(page, '[data-tz-free]').getAttribute('data-active')) === 'true' && (await vis(page, '[data-tz-card]').getAttribute('data-target')) === '-4', 'libre: « 0,0001 » devient une carte (cible −4)');
    await less(page, 4); await dock(page);
    check((await vis(page, '[data-tz-card]').getAttribute('data-done')) === 'true', 'libre: la carte libre se tamponne');
    check((await lab(page).getAttribute('data-solved')) === 'false', 'libre: aucune tâche guidée n\'est cochée');
    await shot(page, '09-free', 1280);
    await vis(page, '[data-tz-free-back]').click(); await page.waitForTimeout(350);
    check((await vis(page, '[data-tz-free]').getAttribute('data-active')) === 'false' && (await nOf(page)) === 0, 'libre: « عُد إلى مهامّك » ramène à la table');
    await input.fill('جزء من مليار'); await vis(page, '[data-tz-free-add]').click(); await page.waitForTimeout(300);
    check((await vis(page, '[data-tz-card]').getAttribute('data-target')) === '-9', 'libre: un nom (جزء من مليار) devient une carte (−9)');
    await ctx.close();
  }

  // 3d. متقدم : noms, unités, 10 كم, prédiction vers le petit
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await pickLevel(page, 'advanced');
    check((await page.locator('[data-tz-tally]:visible').count()) === 0, 'متقدم: aucune tally');
    check(/مليار متر/.test(await vis(page, '[data-tz-card]').textContent()), 'متقدم: z5 — la carte est un nom (مليار متر)');
    await more(page, 9);
    check((await sideOf(page)) === '1000000000' && (await page.locator('[data-tz-tally]:visible').count()) === 0, 'متقدم: 9 crans — la plaque lit 1 000 000 000 sans tally');
    await shot(page, '10-advanced-giga', 1280);
    await dock(page); await next(page);
    check(/ميكرومتر واحد/.test(await vis(page, '[data-tz-card]').textContent()), 'متقدم: z6 — la carte est une unité définie');
    await less(page, 6);
    check((await vis(page, '[data-tz-unit]').textContent()).includes('ميكرومتر'), 'متقدم: z6 — la plaque nomme le ميكرومتر à −6');
    await dock(page); await next(page);
    check((await page.locator('[data-tz-predict-card]:visible').count()) === 1 && /كم نقرة تصغير/.test(await vis(page, '[data-tz-predict-card]').textContent()), 'متقدم: z7 — prédiction « كم نقرة تصغير؟ »');
    await vis(page, '[data-tz-predict="1"]').click();
    await less(page, 7);
    check((await sideOf(page)) === '0,0000001', 'متقدم: z7 — 7 crans de réduction : 0,0000001');
    await dock(page);
    check((await vis(page, '[data-tz-card]').getAttribute('data-done')) === 'true' && !/توقّعك/.test((await banner(page)).text), 'متقدم: z7 — prédiction juste (7), aucune secousse');
    await next(page);
    check(/10 كم/.test(await vis(page, '[data-tz-card]').textContent()), 'متقدم: z8 — « 10 كم »');
    await more(page, 3); await dock(page);
    check((await vis(page, '[data-tz-banner]').getAttribute('data-code')) !== 'solved', 'متقدم: z8 — 3 crans ne font pas 10 كم (10 000 m)');
    await more(page, 1); await dock(page);
    check((await lab(page).getAttribute('data-solved')) === 'true', 'متقدم: les quatre cartes faites');
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, 'متقدم: la seconde découverte s\'ouvre');
    await ctx.close();
  }

  // le monde `prefixes` du module 2 — posé seul
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/maarif`);
    check((await lab(page).getAttribute('data-world')) === 'prefixes', `${w}: prefixes — monde posé seul`);
    check(await page.evaluate(() => { const l = document.querySelector('[data-manipulation="ten-zoom"]'); return !!l; }), `${w}: prefixes — le labo est monté`);
    check((await page.locator('[data-tz-brick], [data-knowledge-brick]').count()) === 0, `${w}: prefixes — aucune brique avant la réponse`);
    check(/كيلومتر واحد/.test(await vis(page, '[data-tz-card]').textContent()), `${w}: prefixes — la première carte est كيلومتر`);
    await more(page, 3);
    check((await vis(page, '[data-tz-unit]').textContent()).includes('كيلومتر'), `${w}: prefixes — la plaque nomme le كيلومتر`);
    await dock(page); await next(page);
    await less(page, 3);
    check((await vis(page, '[data-tz-unit]').textContent()).includes('ميليمتر'), `${w}: prefixes — ميليمتر à −3`);
    await shot(page, '11-prefixes', w);
    await ctx.close();
  }

  // 5. le guide (LabCoach) : ring → plate → dock ; predict avant ring
  {
    const ctx = await contextFor(browser, token, { width: 1024, height: 768 }, { coachOff: false });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const step = async () => page.locator('[data-lab-coach]:visible').first().getAttribute('data-step').catch(() => null);
    check((await step()) === 'ring', 'LabCoach : ring');
    await scrollTo(page, '[data-tz-more]'); await vis(page, '[data-tz-more]').click(); await page.waitForTimeout(350);
    check((await step()) === 'plate', 'LabCoach : plate');
    await vis(page, '[data-tz-more]').click(); await page.waitForTimeout(350);
    check((await step()) === 'dock', 'LabCoach : dock');
    await vis(page, '[data-tz-more]').click(); await dock(page); await next(page);
    await page.waitForTimeout(300);
    check((await step()) === 'predict' || (await step()) === null, `LabCoach : predict avant la bague en z2 (${await step()})`);
    await ctx.close();
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
  process.exit(failures.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
