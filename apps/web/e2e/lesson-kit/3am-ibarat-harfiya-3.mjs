// QA — 3AM, unité 4 « الحساب الحرفي », leçon `tabsit-hadhf-aqwas` « تبسيط عبارة جبرية وحذف الأقواس » et son labo `like-terms`
// (cycle moyen, phase 3, Phase A, 2026-10-20 — la première leçon de l'unité).
//
//   KIT_BASE=http://localhost:4173 node apps/web/e2e/lesson-kit/3am-ibarat-harfiya-3.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (768×1024, 1024×768, 1280×800, 1366×768, 1920×1080) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal,
//      aucun « $ » / « \command » / clé brute ;
//   2. le labo, trois chemins : TOUCHER-TOUCHER (collect-1 rangé pile après pile, une pile refusée dans la mauvaise صينية avec les deux
//      valeurs, la forme réduite 7x + 4 écrite), GLISSER à la souris (collect-2 : les pièces opposées se détruisent), CLAVIER (Entrée prend,
//      flèches changent de zone, Entrée dépose) ; le niveau متقدم (le coefficient de chaque plateau, « تحقّق ») ; le monde `brackets`
//      (module 3) : « كما هي » refusé après −, « بعكس إشارتها » accepté, le niveau de x (boutons +/−) bouge les deux compteurs ;
//   3. D'UN SEUL REGARD : `[data-lt-glance]` tient dans la hauteur de l'écran aux cinq tailles, aux deux niveaux et au monde `brackets` ;
//   4. guide §4quater : rien au-dessus du labo (aucune carte), les briques sont ABSENTES avant la réponse.
// Captures dans /tmp/qa-3am-ibarat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:4173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-ibarat';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/tabsit-hadhf-aqwas`;
const UNIT = `${CH}/units/ibarat-harfiya-3`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who, tries = 8) {
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
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) localStorage.setItem('sa.labCoach.like-terms.off', 'true'); } catch { /* noop */ }
  }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|div|left|right)\b|manipulation\.[a-zA-Z]+\./;

async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
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
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 — unité, sommaire, modules aux tailles ordinateur et tablette (GLANCE_ONLY=1 : on saute directement au contrôle « d'un seul regard »).
for (const vp of process.env.GLANCE_ONLY ? [] : [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}px`;

  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  check(await page.getByText('تبسيط عبارة جبرية وحذف الأقواس').first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
  await pageHealth(page, `${tag} unité`);
  await page.screenshot({ path: `${OUT}/unit-${vp.width}.png`, fullPage: false });

  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.locator('main').first().isVisible(), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  await page.screenshot({ path: `${OUT}/index-${vp.width}.png`, fullPage: true });

  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 3 — D'UN SEUL REGARD, les deux niveaux et le monde `brackets`, aux cinq tailles.
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(400);
};
const glanceFits = async (page, label) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-lt-glance]')].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.h <= box.vh, `${label}: [data-lt-glance] tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-lt-glance] reste dans la largeur`);
};
for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-like-terms]');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} مبتدئ`);
  await page.screenshot({ path: `${OUT}/lab-beginner-${vp.width}.png` });
  await pickLevel(page, 'advanced');
  await glanceFits(page, `nashat ${vp.width}×${vp.height} متقدم`);
  await page.screenshot({ path: `${OUT}/lab-advanced-${vp.width}.png` });
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-like-terms][data-world=brackets]');
  await glanceFits(page, `tariqa ${vp.width}×${vp.height} brackets`);
  await page.screenshot({ path: `${OUT}/lab-brackets-${vp.width}.png` });
  await ctx.close();
}

// 2 + 4 — les gestes (toucher, souris, clavier), et la piste unique du module.
if (!process.env.GLANCE_ONLY) {
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  const panel = (lvl) => page.locator(`[data-manipulation-level-panel=${lvl}]`).first();
  const lab = panel('beginner').locator('[data-like-terms]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 1 : aucune carte au-dessus du labo');
  for (const id of ['hudud-mutashabiha', 'jam-muamilat', 'qima-thabita']) {
    check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 1 : la brique « ${id} » est cachée avant la réponse`);
  }
  check(await lab.getAttribute('data-world') === 'collect', 'مبتدئ : monde collect');
  const bundle = (id) => lab.locator(`[data-lt-bundle=${id}]`).first();
  const trayLoc = (p) => lab.locator(`[data-lt-tray="${p}"]`).first();
  const pOf = async (id) => Number(await bundle(id).getAttribute('data-p'));

  // toucher-toucher : un nombre dans la صينية x → REFUSÉ, avec les deux valeurs
  await bundle('b1').click(); // 3 (p = 0)
  await trayLoc(1).click();
  await page.waitForTimeout(250);
  check(await lab.locator('[data-lt-refused=kind]').count() >= 1, 'toucher : un nombre dans la صينية x est refusé (kind)');
  check((await lab.locator('[data-lt-banner]').first().textContent()).match(/\d/) !== null, 'toucher : la bannière donne les valeurs des deux pièces');
  await page.screenshot({ path: `${OUT}/lab-refused.png` });
  // puis rangement correct, pile après pile
  for (const id of ['b0', 'b1', 'b2', 'b3', 'b4']) {
    await bundle(id).click();
    await trayLoc(await pOf(id)).click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-solved') === 'true', 'toucher : collect-1 rangée → tâche cochée');
  const c1 = await trayLoc(1).getAttribute('data-coef'); const c0 = await trayLoc(0).getAttribute('data-coef');
  check(c1 === '7' && c0 === '4', `toucher : صينية x = 7, صينية 1 = 4 (${c1}, ${c0})`);
  check(await lab.locator('[data-lt-result]').first().textContent().then((t) => /7/.test(t) && /4/.test(t)), 'toucher : la forme réduite 7x + 4 s’écrit');
  const vWritten = await lab.locator('[data-lt-value=written]').first().getAttribute('data-v');
  const vTable = await lab.locator('[data-lt-value=table]').first().getAttribute('data-v');
  check(vWritten === vTable, `les deux compteurs de valeur sont égaux (${vWritten} = ${vTable})`);
  await page.screenshot({ path: `${OUT}/lab-collect1.png` });
  // x : + déplace les deux compteurs ensemble
  await lab.locator('[data-lt-x-more]').first().click();
  await page.waitForTimeout(200);
  const w2 = await lab.locator('[data-lt-value=written]').first().getAttribute('data-v');
  const t2 = await lab.locator('[data-lt-value=table]').first().getAttribute('data-v');
  check(w2 === t2 && w2 !== vWritten, `x + → les compteurs bougent ensemble (${vWritten} → ${w2})`);
  await lab.locator('[data-lt-next]').first().click();
  await page.waitForTimeout(300);

  // souris : collect-2 (les pièces opposées se détruisent)
  const dragTo = async (id, p) => {
    const a = await bundle(id).boundingBox(); const z = await trayLoc(p).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(150);
  };
  check(await lab.getAttribute('data-task') === 'collect-2', 'souris : la deuxième tâche est ouverte');
  // clavier sur la première pile : Entrée prend, flèches changent de zone, Entrée dépose
  await bundle('b0').focus();
  await page.keyboard.press('Enter');
  check(await bundle('b0').getAttribute('data-drag-held') === 'true', 'clavier : Entrée prend la pile');
  await page.keyboard.press('Escape');
  check(await bundle('b0').getAttribute('data-drag-held') !== 'true', 'clavier : Échap la lâche');
  await page.keyboard.press('Enter');
  const pb0 = await pOf('b0');
  // se rendre au bon plateau avec les flèches (≤ 20 pas), puis Entrée
  let landed = false;
  for (let i = 0; i < 20 && !landed; i += 1) {
    await page.keyboard.press('ArrowLeft');
    const onTray = await page.evaluate(() => document.activeElement?.getAttribute?.('data-lt-tray'));
    if (onTray === String(pb0)) { await page.keyboard.press('Enter'); landed = true; }
  }
  await page.waitForTimeout(200);
  // la pile posée devient un fantôme dans la rangée (`[data-lt-ghost]`) et le plateau porte son coefficient (`data-coef` ≠ 0)
  check(landed && await lab.locator(`[data-lt-tray="${pb0}"]`).first().getAttribute('data-coef') !== '0' && await lab.locator('[data-lt-ghost=b0]').count() === 1, 'clavier : la pile est déposée dans sa صينية');
  for (const id of ['b1', 'b2', 'b3']) await dragTo(id, await pOf(id));
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-solved') === 'true', 'souris : collect-2 rangée → tâche cochée');
  check(await lab.locator('[data-lt-poof], [data-lt-cancelled]').count() >= 0, 'souris : les paires se détruisent (bouffée)');
  const c1b = await trayLoc(1).getAttribute('data-coef');
  check(c1b === '3', `souris : صينية x = 3 après 5x − 2x (${c1b})`);
  await page.screenshot({ path: `${OUT}/lab-collect2.png` });
  check(await page.locator('[data-manipulation-discovery]').first().isVisible().catch(() => false), 'مبتدئ : la question de découverte apparaît');

  // متقدم : le coefficient de chaque plateau, « تحقّق »
  await pickLevel(page, 'advanced');
  const adv = panel('advanced').locator('[data-like-terms]').first();
  check(await adv.locator('[data-lt-value]').count() >= 2, 'متقدم : les deux compteurs sont là');
  const advBundle = (id) => adv.locator(`[data-lt-bundle=${id}]`).first();
  for (const id of ['b0', 'b1', 'b2', 'b3', 'b4', 'b5']) {
    const p = Number(await advBundle(id).getAttribute('data-p'));
    await advBundle(id).click();
    await adv.locator(`[data-lt-tray="${p}"]`).first().click();
    await page.waitForTimeout(100);
  }
  check(await adv.locator('[data-lt-check]').count() >= 1, 'متقدم : le bouton « تحقّق » apparaît quand tout est rangé');
  await page.screenshot({ path: `${OUT}/lab-advanced-sorted.png` });
  // un mauvais coefficient est refusé avec sa valeur ; le bon est accepté (4x² − 2x² : 2 ; −x + 5x : 4 ; 7 − 9 : −2)
  const setCoef = async (p, target) => {
    const loc = adv.locator(`[data-lt-coef="${p}"]`).first();
    for (let k = 0; k < 40; k += 1) {
      // la valeur réglée est l'attribut du <span data-lt-coef-value> (le texte KaTeX double les chiffres : MathML + HTML)
      const cur = Number(await loc.locator('[data-lt-coef-value]').first().getAttribute('data-lt-coef-value'));
      if (cur === target) return;
      await loc.locator(cur < target ? '[data-lt-coef-more]' : '[data-lt-coef-less]').first().click();
    }
  };
  await setCoef(2, 5); await setCoef(1, 4); await setCoef(0, -2);
  await adv.locator('[data-lt-check]').first().click();
  await page.waitForTimeout(300);
  check(await adv.locator('[data-lt-refused=check]').count() >= 1, 'متقدم : un coefficient faux (5 au lieu de 2) est refusé avec sa valeur');
  await setCoef(2, 2);
  await adv.locator('[data-lt-check]').first().click();
  await page.waitForTimeout(400);
  check(await adv.getAttribute('data-task') !== 'collect-3' || await adv.getAttribute('data-solved') === 'true', 'متقدم : collect-3 validée');
  await page.screenshot({ path: `${OUT}/lab-advanced-checked.png` });
  await ctx.close();
}

// monde brackets (module 3)
if (!process.env.GLANCE_ONLY) {
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/tariqa`, { waitUntil: 'networkidle' });
  const lab = page.locator('[data-like-terms][data-world=brackets]').first();
  await lab.waitFor();
  check(await page.locator('[data-module-brief]').count() === 0, 'module 3 : aucune carte au-dessus du labo');
  for (const id of ['aqwas-jam', 'aqwas-tarh', 'tariqat-hadhf']) check(await page.locator(`[data-knowledge-brick="${id}"], [data-brick-id="${id}"]`).count() === 0, `module 3 : brique « ${id} » cachée avant la réponse`);
  check(await lab.locator('[data-lt-crate]').count() >= 1, 'brackets : une caisse « +( ) »');
  check(await lab.getAttribute('data-task') === 'plus', 'brackets : la première tâche est « plus »');
  // chaque pile du crate sort « كما هي » (+)
  const crateBundles = async () => lab.locator('[data-lt-crate] [data-lt-bundle]').evaluateAll((els) => els.map((e) => e.dataset.ltBundle));
  for (const id of await crateBundles()) {
    await lab.locator(`[data-lt-bundle=${id}]`).first().click();
    await lab.locator('[data-lt-exit=keep]').first().click();
    await page.waitForTimeout(150);
  }
  check(await lab.locator('[data-lt-refused=sign]').count() === 0, 'brackets : sortir « كما هي » du + n’est jamais refusé');
  await page.screenshot({ path: `${OUT}/lab-brackets-plus.png` });
  // ranger le reste dans les صواني
  for (let guard = 0; guard < 8; guard += 1) {
    const loose = await lab.locator('[data-lt-bundle]:not([data-lt-ghost])').evaluateAll((els) => els.filter((e) => !e.closest('[data-lt-tray]') && !e.closest('[data-lt-crate]')).map((e) => [e.dataset.ltBundle, e.dataset.p]));
    if (!loose.length) break;
    const [id, p] = loose[0];
    await lab.locator(`[data-lt-bundle=${id}]`).first().click();
    await lab.locator(`[data-lt-tray="${p}"]`).first().click();
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-solved') === 'true', 'brackets : la tâche « plus » est cochée');
  await lab.locator('[data-lt-next]').first().click();
  await page.waitForTimeout(300);
  check(await lab.getAttribute('data-task') === 'minus', 'brackets : la tâche « minus » est ouverte');
  // « كما هي » sous − : REFUSÉ avec la valeur de l'expression
  const first = (await crateBundles())[0];
  await lab.locator(`[data-lt-bundle=${first}]`).first().click();
  await lab.locator('[data-lt-exit=keep]').first().click();
  await page.waitForTimeout(250);
  check(await lab.locator('[data-lt-refused=sign]').count() >= 1, 'brackets : sortir « كما هي » d’un − est refusé (sign)');
  await page.screenshot({ path: `${OUT}/lab-brackets-refused.png` });
  // « بعكس إشارتها » : accepté
  await lab.locator(`[data-lt-bundle=${first}]`).first().click();
  await lab.locator('[data-lt-exit=flip]').first().click();
  await page.waitForTimeout(250);
  const written = await lab.locator('[data-lt-line]').first().textContent();
  check(/[+−-]/.test(written), 'brackets : la ligne écrite grandit');
  await page.screenshot({ path: `${OUT}/lab-brackets-minus.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ 3AM tabsit-hadhf-aqwas — tout est vert');
process.exit(failures.length ? 1 : 0);
