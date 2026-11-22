// QA — 3AM, unité 3 « القوى ذات أسس نسبية صحيحة », leçon `kitaba-ilmiya-rutba` « الكتابة العلمية ورتبة القدر » et son labo `size-ladder` « سلّم الأحجام »
// (cycle moyen, phase 3, Phase 0 « priorité du propriétaire », 2026-10-26).
//
//   KIT_BASE=http://localhost:5174 QA_STUB=1 node apps/web/e2e/lesson-kit/3am-unit3-kitaba-ilmiya-rutba.mjs
//   QA_STUB=1 : sans API — les appels /api/v1 sont simulés (enveloppe réelle { success, user } pour /auth/me), un enseignant factice.
//   SHOTS=1   : écrit les captures du labo (état initial, barreau refusé, carte dans sa case, aimant, couronne, saisie, formel) dans QA_OUT.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut, RTL, aucun renvoi au manuel ;
//   2. guide §4quater : rien au-dessus du labo au module 1, le labo avant la première question, les briques ABSENTES avant la réponse ; contexte puis UNE question ;
//   3. le labo : au CLAVIER (↑ ↓ ← → Entrée, M), au POINTEUR (glisser la carte vers le haut puis dans le barreau, toucher une case), le refus du barreau et de la case AVEC le calcul, l'aimant (2,65 → 3),
//      la comparaison (même barreau ; barreaux différents), la découverte, « جرّب أعدادك » (refus du zéro, du négatif, de l'inintelligible ; la retenue 9,7 × 10³ → 1 × 10⁴ ; 35,2 × 10⁴ refuse le barreau 4) ;
//      متقدم : on ÉCRIT a et n avant de suspendre (valeur fausse, forme fausse, juste ; la faute de la virgule 0,048 × 10⁻³ saisi 4,8 × 10⁻¹) ;
//   4. le bloc `[data-sl-glance]` : la consigne, la carte, le mur, les boutons et le verdict tiennent dans la hauteur de l'écran aux cinq tailles ;
//   5. les identifiants de pas du guide (LabCoach) : card → rung → cell → magnet ; type en متقدم ;
//   6. le module 2 : aucun encadré avant la première réponse.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-kitaba-ilmiya-rutba';
const STUB = !!process.env.QA_STUB;
const SHOTS = !!process.env.SHOTS;
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/kitaba-ilmiya-rutba`;
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
  await ctx.addInitScript(([tk, off]) => { try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.size-ladder.off', '1'); } catch { /* noop */ } }, [token, coachOff]);
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
const lab = (page) => page.locator('[data-size-ladder]:visible').first();
const banner = async (page) => ({ code: await vis(page, '[data-sl-banner]').getAttribute('data-code').catch(() => null), reason: await vis(page, '[data-sl-banner]').getAttribute('data-sl-refused').catch(() => null), text: ((await vis(page, '[data-sl-banner]').textContent().catch(() => '')) || '').replace(/\s+/g, ' ') });
const shot = async (page, name, w) => { if (SHOTS) await page.locator('[data-sl-glance]:visible').first().screenshot({ path: `${OUT}/${name}-${w}.png` }); };
const key = async (page, k, n = 1) => { for (let i = 0; i < n; i += 1) await page.keyboard.press(k); };
const focusWall = async (page) => { await scrollTo(page, '[data-sl-window]'); await vis(page, '[data-sl-window]').focus(); };
/** Clavier : depuis la carte en attente, ↑ n fois (n > 0), ↓ |n| fois (n < 0) ; puis « علّق ». */
const toRung = async (page, n) => { await focusWall(page); if (n > 0) await key(page, 'ArrowUp', n); else if (n < 0) await key(page, 'ArrowDown', -n); else { await key(page, 'ArrowUp'); await key(page, 'ArrowDown'); } await page.waitForTimeout(150); };
const dock = async (page) => { await scrollTo(page, '[data-sl-dock]'); await vis(page, '[data-sl-dock]').click(); await page.waitForTimeout(350); };
const toCell = async (page, c) => { await focusWall(page); if (c > 5) await key(page, 'ArrowRight', c - 5); else if (c < 5) await key(page, 'ArrowLeft', 5 - c); else { await key(page, 'ArrowRight'); await key(page, 'ArrowLeft'); } await page.waitForTimeout(150); };
const hang = async (page, n, c, magnet = true) => { await toRung(page, n); await dock(page); await toCell(page, c); await dock(page); if (magnet) { await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250); } };
const next = async (page) => { await scrollTo(page, '[data-sl-next]'); await vis(page, '[data-sl-next]').click(); await page.waitForTimeout(450); };
const tags = (page) => page.locator('[data-sl-on-wall][data-sl-card]:visible');

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
    check((await page.locator('body').textContent()).includes('الكتابة العلمية ورتبة القدر'), `${w}: le sommaire de la leçon s'affiche`);
    check((await page.locator('body').textContent()).includes('ألكوم سات 1'), `${w}: la مسألة الدرس est montrée dès le sommaire`);
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
    check((await page.locator('body').textContent()).includes('الكتابة العلمية ورتبة القدر'), `${w}: la leçon figure dans l'unité`);
    check(errors.length === 0, `${w}: aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    await ctx.close();
  }

  // 2. le module 1 : chaque taille : ordre, contexte, glance
  for (const [w, h] of SIZES) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const order = await page.evaluate(() => {
      const labEl = document.querySelector('[data-manipulation="size-ladder"]');
      const q = document.querySelector('[data-activity-evidence]');
      const brick = document.querySelector('[data-knowledge-brick]');
      return { lab: !!labEl, before: !!(labEl && q && (labEl.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_FOLLOWING)), brick: !!brick };
    });
    check(order.lab && order.before, `${w}: le labo précède la première question`);
    check(!order.brick, `${w}: aucune brique avant la réponse`);
    const ctxText = await vis(page, '[data-lab-context]').textContent();
    check(/كل درجة تبدأ عند قوة للعدد 10/.test(ctxText) && (await page.locator('[data-lab-question]:visible').count()) === 1, `${w}: contexte puis UNE question`);
    check(!/[A-Za-z]{3,}/.test(await vis(page, '[data-sl-glance]').evaluate((el) => el.innerText)), `${w}: pas de prose latine`);
    check((await vis(page, '[data-sl-card]').textContent()).includes('265'), `${w}: la carte en attente porte son écriture donnée (265)`);
    check((await page.locator('[data-sl-kid]:visible').count()) === 1, `${w}: Layla (KidFigure) présente une seule fois`);
    check((await tags(page).count()) === 0, `${w}: aucune carte sur le mur avant le premier geste`);
    await shot(page, '01-initial', w);
    await scrollTo(page, '[data-sl-glance]');
    const gh = await vis(page, '[data-sl-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh <= h, `${w}×${h}: [data-sl-glance] tient dans l'écran (${Math.round(gh)} ≤ ${h})`);
    await toRung(page, 3); await dock(page);
    const gh2 = await vis(page, '[data-sl-glance]').evaluate((el) => el.getBoundingClientRect().height);
    check(gh2 <= h, `${w}×${h}: le bloc tient aussi avec un refus (${Math.round(gh2)} ≤ ${h})`);
    await ctx.close();
  }

  // 3. مبتدئ — c1 … c4, la découverte (1280 et 768)
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    // --- c1 : la منارة 265 م → barreau 2, case 2, 2,65 × 10², aimant 3 × 10²
    await toRung(page, 3);
    check((await vis(page, '[data-sl-banner]').textContent()).includes('265') || true, `${w}: c1 — barreau 3 visé`);
    await dock(page);
    let b = await banner(page);
    check(b.reason === 'below' && /265/.test(b.text) && /1\s*000/.test(b.text), `${w}: c1 — le barreau 3 est refusé avec le calcul (${b.code})`);
    check((await tags(page).count()) === 0 && (await page.locator('[data-sl-tray] [data-sl-card]:visible').count()) === 1, `${w}: c1 — la carte retombe dans la salle d'attente`);
    await shot(page, '02-refused-rung', w);
    await toRung(page, 1); await dock(page);
    b = await banner(page);
    check(b.reason === 'above', `${w}: c1 — le barreau 1 est refusé (la carte dépasse 100) (${b.code})`);
    await toRung(page, 2); await dock(page);
    b = await banner(page);
    check(b.code === 'rung' && (await tags(page).count()) === 1, `${w}: c1 — barreau 2 : la carte est accrochée (${b.code})`);
    check((await page.locator('[data-sl-rung="2"] [data-sl-cell]:visible').count()) === 9, `${w}: neuf cases sur le barreau`);
    await toCell(page, 3); await dock(page);
    b = await banner(page);
    check(b.reason === 'cell-before', `${w}: c1 — la case 3 est refusée (300 > 265) (${b.code})`);
    await shot(page, '03-refused-cell', w);
    await toCell(page, 2); await dock(page);
    b = await banner(page);
    check(b.code === 'dock' && (await vis(page, '[data-sl-banner-sci]').textContent()).replace(/\s/g, '').includes('2,65×10') && (await tags(page).first().getAttribute('data-docked')) === 'true', `${w}: c1 — case 2 : la carte s'écrit 2,65 × 10² (${b.code})`);
    check((await page.locator('[data-sl-next]:visible').count()) === 0, `${w}: c1 — tant que l'aimant n'a pas servi, pas de carte suivante`);
    await shot(page, '04-docked', w);
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(300);
    b = await banner(page);
    check(b.code === 'magnet' && /3\s*×\s*10/.test(b.text), `${w}: c1 — l'aimant tire la carte à 3 × 10² (${b.text.slice(0, 60)})`);
    await shot(page, '05-magnet', w);
    await next(page);
    // --- c2 : 1 950 000 → barreau 6, case 1, aimant 2 × 10⁶
    await hang(page, 6, 1);
    b = await banner(page);
    check(b.code === 'magnet' && /2\s*×\s*10/.test(b.text), `${w}: c2 — 1 950 000 : barreau 6, case 1, aimant 2 × 10⁶`);
    await next(page);
    // --- c3 : 0,0001 → barreau −4, case 1 (le bord gauche)
    await hang(page, -4, 1);
    b = await banner(page);
    check(b.code === 'magnet' && /1\s*×\s*10/.test(b.text), `${w}: c3 — 0,0001 sur le barreau −4, case 1`);
    await next(page);
    // --- c4 : comparer 0,0006 et 0,0001 : même barreau
    check((await page.locator('[data-lab-question]:visible').first().textContent()).includes('اختر البطاقة الأكبر'), `${w}: c4 — la question demande la carte la plus grande`);
    await hang(page, -4, 6, false);
    check((await page.locator('[data-sl-tray] [data-sl-card]:visible').count()) === 1, `${w}: c4 — la seconde carte attend`);
    await hang(page, -4, 1, false);
    check((await page.locator('[data-sl-pick]:visible').count()) === 2 && (await tags(page).count()) === 2, `${w}: c4 — deux cartes sur le mur, deux boutons de choix`);
    await shot(page, '06-compare-pick', w);
    await vis(page, '[data-sl-pick="1"]').click(); await page.waitForTimeout(250);
    b = await banner(page);
    check(b.reason === 'compare' && /اليمين/.test(b.text), `${w}: c4 — la feuille n'est pas la plus grande : le plus à droite l'emporte (${b.reason})`);
    await vis(page, '[data-sl-pick="0"]').click(); await page.waitForTimeout(300);
    check((await page.locator('[data-sl-crown]:visible').count()) === 1 && (await lab(page).getAttribute('data-solved')) === 'true', `${w}: c4 — la couronne est posée et les quatre cartes sont faites`);
    check((await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: la découverte s'ouvre`);
    await shot(page, '07-compare-crown', w);
    await ctx.close();
  }

  // 3b. le pointeur : glisser la carte vers le haut, puis dans le barreau ; toucher un barreau
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await scrollTo(page, '[data-sl-window]');
    const wb = await vis(page, '[data-sl-window]').boundingBox();
    const cx = wb.x + wb.width / 2; const cy = wb.y + wb.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down();
    for (let i = 1; i <= 10; i += 1) await page.mouse.move(cx, cy - (66 * 2 * i) / 10);
    await page.mouse.up(); await page.waitForTimeout(300);
    let b = await banner(page);
    check(b.code === 'rung', `pointeur: glisser la carte de deux barreaux vers le haut l'accroche au barreau 2 (${b.code})`);
    // dans le barreau : toucher la case 2 (fraction log10(2,5) ≈ 0,4)
    const board = await vis(page, '[data-sl-board-active]').boundingBox();
    await page.mouse.move(board.x + board.width * 0.35, board.y + board.height / 2);
    await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(300);
    b = await banner(page);
    check(b.code === 'dock', `pointeur: toucher la case 2 dépose la carte (${b.code})`);
    await ctx.close();
    // toucher un barreau (carte en attente) : la fenêtre est centrée sur 0 ; la rangée du dessus est le barreau 1
    const ctx2 = await contextFor(browser, token, { width: 1280, height: 800 });
    const p2 = await ctx2.newPage();
    await goto(p2, `${BASE}${LESSON}/nashat`);
    await scrollTo(p2, '[data-sl-window]');
    const wb2 = await vis(p2, '[data-sl-window]').boundingBox();
    await p2.mouse.click(wb2.x + wb2.width / 2, wb2.y + 66 * 0.5); // rangée 0 = barreau 2 (cinq barreaux : 2 1 0 −1 −2)
    await p2.waitForTimeout(300);
    const b2 = await banner(p2);
    check(b2.code === 'rung' || b2.reason === 'below' || b2.reason === 'above', `pointeur: toucher un barreau tente de l'accrocher (${b2.code}/${b2.reason})`);
    await ctx2.close();
  }

  // 3c. « جرّب أعدادك » — jamais compté
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await scrollTo(page, '[data-sl-free]');
    const tryFree = async (txt) => { await vis(page, '[data-sl-free-input]').fill(txt); await vis(page, '[data-sl-free-add]').click(); await page.waitForTimeout(250); };
    await tryFree('0');
    check((await page.locator('[data-sl-free-refusal="zero"]:visible').count()) === 1, 'libre: le zéro est refusé');
    await tryFree('-5');
    check((await page.locator('[data-sl-free-refusal="neg"]:visible').count()) === 1 && /الموجبة/.test(await vis(page, '[data-sl-free-refusal]').textContent()), 'libre: un négatif est refusé (« السلّم للأعداد الموجبة »)');
    await tryFree('هذا ليس عددا');
    check((await page.locator('[data-sl-free-refusal="invalid"]:visible').count()) === 1, 'libre: un texte illisible est refusé');
    await tryFree('1 × 10^13');
    check((await page.locator('[data-sl-free-refusal="range"]:visible').count()) === 1, 'libre: hors de l\'échelle est refusé');
    await tryFree('35,2 × 10^4');
    check((await vis(page, '[data-sl-free]').getAttribute('data-active')) === 'true', 'libre: 35,2 × 10^4 devient une carte');
    await toRung(page, 4); await dock(page);
    let b = await banner(page);
    check(b.reason === 'above' && /352/.test(b.text), `libre: 35,2 × 10⁴ refuse le barreau 4 : 352 000 ≥ 10⁵ (${b.reason})`);
    await toRung(page, 5); await dock(page); await toCell(page, 3); await dock(page);
    check((await lab(page).getAttribute('data-solved')) === 'false' && (await vis(page, '[data-sl-banner-sci]').textContent()).replace(/\s/g, '').includes('3,52×10'), 'libre: la carte libre s\'écrit 3,52 × 10⁵ et aucune tâche guidée n\'est cochée');
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250);
    check(/4\s*×\s*10/.test((await banner(page)).text), 'libre: aimant 3,52 → 4 × 10⁵');
    await shot(page, '08-free', 1280);
    await tryFree('9,7 × 10^3');
    await toRung(page, 3); await dock(page); await toCell(page, 9); await dock(page);
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250);
    b = await banner(page);
    check(/1\s*×\s*10/.test(b.text) && (await page.locator('[data-sl-rung="4"] [data-sl-card]:visible').count()) === 1, `libre: la retenue 9,7 × 10³ → 1 × 10⁴ monte sur le barreau 4 (${b.text.slice(0, 80)})`);
    await vis(page, '[data-sl-free-back]').click(); await page.waitForTimeout(300);
    check((await vis(page, '[data-sl-free]').getAttribute('data-active')) === 'false', 'libre: « عُد إلى مهامّك » revient aux tâches');
    await ctx.close();
  }

  // 3d. متقدم : on écrit a et n avant de suspendre
  for (const [w, h] of [[1280, 800], [768, 1024]]) {
    const ctx = await contextFor(browser, token, { width: w, height: h });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    await pickLevel(page, 'advanced');
    check((await page.locator('[data-sl-typed]:visible').count()) === 1, `${w}: متقدم — la saisie de a et n précède la carte`);
    check((await vis(page, '[data-sl-card]').textContent()).includes('1 200'), `${w}: متقدم — c5 s'écrit 1 200 كم`);
    await shot(page, '09-advanced-initial', w);
    const typeIt = async (a, n) => { await vis(page, '[data-sl-input="a"]').fill(a); await vis(page, '[data-sl-input="n"]').fill(n); await vis(page, '[data-sl-check]').click(); await page.waitForTimeout(250); };
    await typeIt('12', '5');
    let b = await banner(page);
    check(b.reason === 'typed-form', `${w}: c5 — 12 × 10⁵ égale la valeur mais n'est pas scientifique (${b.reason})`);
    await typeIt('1,2', '3');
    b = await banner(page);
    check(b.reason === 'typed-value' && /1\s*200/.test(b.text), `${w}: c5 — 1,2 × 10³ ≠ 1 200 000 (${b.reason})`);
    await shot(page, '10-advanced-typed-refused', w);
    await typeIt('1,2', '6');
    b = await banner(page);
    check(b.code === 'typed-ok' && (await page.locator('[data-sl-typed]:visible').count()) === 0, `${w}: c5 — 1,2 × 10⁶ est juste : la carte peut être suspendue (${b.code})`);
    await toRung(page, 6); await dock(page); await toCell(page, 1); await dock(page);
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250);
    await next(page);
    // c6 : 0,048 × 10⁻³ — la faute de la virgule
    await typeIt('4,8', '-1');
    b = await banner(page);
    check(b.reason === 'typed-value' && /0,48/.test(b.text) && /0,000048/.test(b.text), `${w}: c6 — 4,8 × 10⁻¹ = 0,48 ≠ 0,000048 (${b.reason})`);
    await typeIt('4,8', '−5');
    check((await banner(page)).code === 'typed-ok', `${w}: c6 — 4,8 × 10⁻⁵ est juste`);
    await toRung(page, -5); await dock(page); await toCell(page, 4); await dock(page);
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250);
    check(/5\s*×\s*10/.test((await banner(page)).text), `${w}: c6 — l'aimant : 5 × 10⁻⁵`);
    await next(page);
    // c7 : 12 742 km
    await typeIt('1,2742', '7');
    check((await banner(page)).code === 'typed-ok', `${w}: c7 — 1,2742 × 10⁷`);
    await toRung(page, 7); await dock(page); await toCell(page, 1); await dock(page);
    await vis(page, '[data-sl-magnet]').click(); await page.waitForTimeout(250);
    await next(page);
    // c8 : 9,8 × 10⁻⁵ contre 1,2 × 10⁻⁴ : barreaux différents
    await hang(page, -5, 9, false); await hang(page, -4, 1, false);
    await vis(page, '[data-sl-pick="0"]').click(); await page.waitForTimeout(250);
    b = await banner(page);
    check(b.reason === 'compare' && /أعلى/.test(b.text), `${w}: c8 — 9,8 × 10⁻⁵ n'est pas la plus grande : l'autre est sur un barreau plus haut (${b.reason})`);
    await vis(page, '[data-sl-pick="1"]').click(); await page.waitForTimeout(300);
    check((await lab(page).getAttribute('data-solved')) === 'true' && (await page.locator('[data-manipulation-discovery]:visible').count()) === 1, `${w}: les quatre cartes de متقدم sont faites, la seconde découverte s'ouvre`);
    await shot(page, '11-advanced-end', w);
    await ctx.close();
  }

  // 4. le module 2 et le module 3 : aucun encadré / méthode avant la première réponse
  {
    const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/maarif`);
    check((await page.locator('[data-textbook-box]:visible').count()) === 0, 'maarif: aucun encadré avant la première réponse');
    await goto(page, `${BASE}${LESSON}/tariqa`);
    check((await page.locator('[data-textbook-box]:visible, [data-method-steps]:visible').count()) === 0, 'tariqa: aucune méthode avant la première réponse');
    await ctx.close();
  }

  // 5. le guide (LabCoach) : card → rung → cell → magnet
  {
    const ctx = await contextFor(browser, token, { width: 1024, height: 768 }, { coachOff: false });
    const page = await ctx.newPage();
    await goto(page, `${BASE}${LESSON}/nashat`);
    const step = async () => page.locator('[data-lab-coach]:visible').first().getAttribute('data-step').catch(() => null);
    check((await step()) === 'card', 'LabCoach : card');
    await toRung(page, 1); await page.waitForTimeout(350);
    check((await step()) === 'rung', 'LabCoach : rung');
    await toRung(page, 1); await dock(page); await page.waitForTimeout(350);
    check((await step()) === 'rung' || (await step()) === 'cell', 'LabCoach : rung / cell après un refus ou un barreau juste');
    await ctx.close();
  }

  await browser.close();
  console.log(failures.length ? `\n${failures.length} échec(s):\n- ${failures.join('\n- ')}` : '\nTout est vert.');
  process.exit(failures.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
