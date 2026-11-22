// QA — 3AM, unité 6 « التناسبية » : leçons `tanasub-tamthil-bayani` « التناسبية والتمثيل البياني » (labo `pin-rails`) puis `nisba-miawiya-3am` « النسبة المئوية »
// (labo `hundred-grid`) — cycle moyen, phase 3, file A entrées 9 et 10, 2026-10-21.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-tanasubiya-sura.mjs        (ONLY=a ou ONLY=b pour une leçon)
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. la page d'unité, le sommaire et CHAQUE module à 768 et 1280 px : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » brut ;
//   2. guide §4quater : rien au-dessus du labo au module 1, les briques ABSENTES avant la réponse ;
//   3. le labo au CLAVIER et au POINTEUR, ses refus et sa découverte ;
//   4. D'UN SEUL REGARD : le bloc `[data-hg-glance]` tient dans l'écran à 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080, aux deux niveaux.
// Captures dans /tmp/qa-3am-nisba.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-tanasubiya-sura';
const ONLY = process.env.ONLY || '';
const CH = '/courses/moyen/3am/tanasubiya_duwal';
const UNIT = `${CH}/units/tanasubiya-sura`;
const LESSONS = {
  a: { id: 'tanasub-tamthil-bayani', title: 'التناسبية والتمثيل البياني', root: '[data-pin-rails]', glance: '[data-pr-glance]', coach: 'pin-rails' },
  b: { id: 'nisba-miawiya-3am', title: 'النسبة المئوية', root: '[data-hundred-grid]', glance: '[data-hg-glance]', coach: 'hundred-grid' },
};
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

async function contextFor(browser, token, viewport, coachOff = true) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(([tk, off]) => {
    try { localStorage.setItem('token', tk); if (off) for (const t of ['hundred-grid', 'pin-rails']) localStorage.setItem(`sa.labCoach.${t}.off`, '1'); } catch { /* noop */ }
  }, [token, coachOff]);
  return ctx;
}

const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|sqrt|neq|approx|div)\b|manipulation\.[a-zA-Z]+\./;

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

const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(450);
};
const vis = (page, sel) => page.locator(`${sel}:visible`).first();

const browser = await chromium.launch();
const token = await loginToken(TEACHER);
const wanted = Object.entries(LESSONS).filter(([k]) => !ONLY || ONLY === k);

// 1 + 2 — unité, sommaire, modules ; rien au-dessus du labo ; briques absentes avant la réponse.
for (const [, L] of wanted) {
  for (const vp of [{ width: 1280, height: 800 }, { width: 768, height: 1024 }]) {
    const ctx = await contextFor(browser, token, vp);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const tag = `${L.id} ${vp.width}px`;
    await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
    check(await page.getByText(L.title).first().isVisible().catch(() => false), `${tag} page d'unité : la leçon est listée`);
    await pageHealth(page, `${tag} unité`);
    await page.goto(`${BASE}${CH}/${L.id}`, { waitUntil: 'networkidle' });
    check(await page.getByText(L.title).first().isVisible(), `${tag} sommaire monté`);
    await pageHealth(page, `${tag} sommaire`);
    await page.screenshot({ path: `${OUT}/${L.id}-index-${vp.width}.png`, fullPage: true });
    for (const slug of MODULES) {
      await page.goto(`${BASE}${CH}/${L.id}/${slug}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
      await pageHealth(page, `${tag} ${slug}`);
      if (slug === 'nashat') {
        await page.waitForSelector(L.root);
        const order = await page.evaluate((root) => {
          const lab = document.querySelector(root);
          const brief = document.querySelector('[data-module-brief]');
          const q = document.querySelector('[data-activity-evidence]');
          const before = (a, b) => Boolean(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
          return { briefAbove: brief ? before(brief, lab) : false, labBeforeQuestion: before(lab, q) };
        }, L.root);
        check(!order.briefAbove, `${tag} nashat : aucune carte au-dessus du labo`);
        check(order.labBeforeQuestion, `${tag} nashat : le labo avant la première question`);
        check(await page.locator('[data-knowledge-brick]').count() === 0, `${tag} nashat : aucune brique avant la réponse`);
      }
      await page.screenshot({ path: `${OUT}/${L.id}-${slug}-${vp.width}.png`, fullPage: true });
    }
    check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
    await ctx.close();
  }
}


// 3a — les gestes de `pin-rails`.
if (!ONLY || ONLY === 'a') {
  const L = LESSONS.a;
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${L.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-pin-rails]');
  const verdict = async () => vis(page, '[data-pr-verdict]').getAttribute('data-pr-verdict').catch(() => null);
  const nodeCenter = async (id) => { const b = await vis(page, id === 0 ? '[data-pr-node="0"] circle' : `[data-pr-pin="${id - 1}"] circle`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const centre = () => vis(page, '[data-pr-plane]').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
  const dragEnd = async (end, id) => {
    await centre();
    const b = await vis(page, `[data-pr-end="${end}"]`).boundingBox(); const t = await nodeCenter(id);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(t.x, t.y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(250);
  };
  const raise = async (col, steps, commit = true) => {
    await vis(page, `[data-pr-pin="${col}"]`).focus();
    for (let i = 0; i < steps; i += 1) await page.keyboard.press('ArrowUp');
    if (commit) await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  };
  const placed = async () => page.locator('[data-pr-pin][data-placed=true]:visible').count();
  check(await placed() === 0, 'labo : aucune punaise posée au départ');
  check(await vis(page, '[data-pr-end="0"]').getAttribute('aria-disabled') === 'true', 'labo : la règle est fermée tant que les punaises ne sont pas posées');
  await raise(0, 3); // 15 au lieu de 10
  check(await verdict() === 'high' && await placed() === 0, 'labo (clavier) : une punaise lâchée trop haut retombe, le tableau fait foi');
  await raise(0, 2); // le focus a été perdu : on repart de 0 → 10
  check(await placed() === 1, 'labo (clavier) : la punaise au bon prix reste (1 sur 4)');
  await raise(1, 6); await raise(2, 12);
  check(await placed() === 3, 'labo (clavier) : trois punaises posées');
  // pointeur : lever la quatrième à son prix (70) en glissant
  const pb = await vis(page, '[data-pr-pin="3"] circle').boundingBox();
  await vis(page, '[data-pr-plane]').boundingBox();
  await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await page.mouse.down();
  await page.mouse.move(pb.x + pb.width / 2, pb.y - 200, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(250);
  const v4 = await vis(page, '[data-pr-pin="3"]').getAttribute('data-placed');
  check(['true', 'false'].includes(v4), 'labo (pointeur) : lâcher la quatrième punaise est jugé');
  if (v4 !== 'true') { await raise(3, 14); }
  check(await placed() === 4, 'labo : les quatre punaises posées');
  check(await vis(page, '[data-pr-end="0"]').getAttribute('aria-disabled') === 'false', 'labo : la règle s\'ouvre');
  await dragEnd(0, 0); await dragEnd(1, 2);
  check(await verdict() === 'full', 'labo (pointeur) : la règle par O et une punaise touche tout : « تناسبية »');
  check(await vis(page, '[data-pr-rod]').getAttribute('data-full') === 'true', 'labo : la règle est marquée pleine');
  await vis(page, '[data-pr-next]').click(); await page.waitForTimeout(300);
  await dragEnd(0, 1); await dragEnd(1, 4);
  check(await verdict() === 'offO', 'labo : boutique 2 — les quatre punaises sont touchées, O dehors (« تقطع المحور عند 10 »)');
  check(await vis(page, '[data-pr-node="0"]').getAttribute('data-hit') === 'false', 'labo : O est marquée « dehors »');
  await dragEnd(0, 0);
  check(['miss', 'throughO'].includes(await verdict()), 'labo : la règle par O manque une punaise');
  // clavier : poser une extrémité sur un nœud
  await vis(page, '[data-pr-end="1"]').focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await vis(page, '[data-pr-end="1"]').getAttribute('data-node') !== '', 'labo (clavier) : une extrémité de la règle posée par flèches + Entrée');
  await vis(page, '[data-pr-next]').click().catch(() => {}); await page.waitForTimeout(300);
  // boutique 3 : trois poses sans que rien ne touche tout
  await dragEnd(0, 0); await dragEnd(1, 1); await dragEnd(0, 2); await dragEnd(1, 4); await dragEnd(0, 3);
  check(await vis(page, '[data-pr-readout]').getAttribute('data-count') !== '5', 'labo : boutique 3 — aucune règle ne touche les cinq nœuds');
  await page.screenshot({ path: `${OUT}/${L.id}-lab-shop3-1280.png` });
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les trois boutiques');
  // « جرّب أعدادك »
  await vis(page, '[data-pr-free-a]').fill('3'); await vis(page, '[data-pr-free-b]').fill('4');
  check(await vis(page, '[data-pr-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est ouvert et actif');
  await dragEnd(0, 1); await dragEnd(1, 4);
  check(await verdict() === 'offO', 'labo : sa boutique (3 dinars + 4 de livraison) — alignée, O dehors');
  await vis(page, '[data-pr-free-back]').click();
  // متقدم : lecture
  await pickLevel(page, 'advanced');
  await dragEnd(0, 0); await dragEnd(1, 3);
  check(await verdict() === 'full', 'labo متقدم : les sacs de 1,5 kg — la règle touche tout');
  await vis(page, '[data-pr-next]').click(); await page.waitForTimeout(300);
  await dragEnd(0, 1); await dragEnd(1, 4); await dragEnd(0, 0);
  await vis(page, '[data-pr-next]').click(); await page.waitForTimeout(300);
  const rd = vis(page, '[data-pr-read]'); await rd.focus();
  for (let i = 0; i < 2; i += 1) await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await verdict() === 'below', 'labo متقدم (clavier) : la lecture sous la droite est refusée avec son sens');
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await verdict() === 'ok', 'labo متقدم : (1 ; 1,5) posée sur la droite');
  await vis(page, '[data-pr-next]').click(); await page.waitForTimeout(300);
  await vis(page, '[data-pr-read]').focus(); for (let i = 0; i < 21; i += 1) await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await verdict() === 'ok', 'labo متقدم : (7 ; 10,5) posée sur la droite');
  await vis(page, '[data-pr-next]').click(); await page.waitForTimeout(300);
  await vis(page, '[data-pr-read]').focus(); for (let i = 0; i < 20; i += 1) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  check(await verdict() === 'ok', 'labo متقدم : la masse 15 kg se lit à 10 sacs le long de sa rangée');
  await page.screenshot({ path: `${OUT}/${L.id}-lab-advanced-done-1280.png` });
  await ctx.close();
}

// 3b — les gestes de `hundred-grid`.
if (!ONLY || ONLY === 'b') {
  const L = LESSONS.b;
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${L.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-hundred-grid]');
  const verdict = async () => vis(page, '[data-hg-verdict]').getAttribute('data-hg-verdict').catch(() => null);
  const paint = async (n) => { const g = vis(page, '[data-hg-grid]'); await g.focus(); await page.keyboard.press('Home'); for (let i = 0; i < n; i += 1) await page.keyboard.press('ArrowRight'); };
  const tNow = async () => Number(await vis(page, '[data-hg-grid]').getAttribute('data-t'));
  const go = async () => { await vis(page, '[data-hg-go]').click(); await page.waitForTimeout(450); };
  // tâche 1 (of) : 15 % de 240 = 36 ; la réponse s'écrit AVANT l'ouverture
  check(await vis(page, '[data-hg-basket]').getAttribute('data-revealed') === 'false', 'labo : le panier est fermé avant la réponse écrite');
  await paint(7);
  check(await tNow() === 7, 'labo (clavier) : Début puis 7 × → peint 7 cases');
  await vis(page, '[data-hg-guess]').fill('36');
  await go();
  check(await verdict() === 'paint', 'labo : 7 cases au lieu de 15 : refusé, la ligne dit ce que la grille donnait');
  await vis(page, '[data-hg-more10]').click(); for (let i = 0; i < 2; i += 1) await vis(page, '[data-hg-less1]').click();
  check(await tNow() === 15, 'labo (boutons) : +10 puis −1 −1 → 15 cases');
  await vis(page, '[data-hg-guess]').fill('15');
  await go();
  check(await verdict() === 'guess', 'labo : réponse fausse (15) : refusée');
  await vis(page, '[data-hg-guess]').fill('36');
  await go();
  check(await verdict() === 'ok', 'labo : 15 cases et 36 sacs : réussi');
  check(await vis(page, '[data-hg-basket]').getAttribute('data-value') === '36', 'labo : le panier montre 36');
  await vis(page, '[data-hg-next]').click();
  // pointeur : glisser sur la grille peint des cases (tâche rate : 60 sur 150 = 40 %)
  await page.waitForTimeout(600); await vis(page, '[data-hg-grid]').evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(300); const box = await vis(page, '[data-hg-grid]').boundingBox();
  await page.mouse.move(box.x + 30, box.y + 20); await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 10 }); await page.mouse.up();
  check(await tNow() > 10, `labo (pointeur) : glisser sur la grille peint des cases (${await tNow()})`);
  await paint(40);
  await go();
  check(await verdict() === 'ok', 'labo : 40 cases remplissent le panier de 60 sacs');
  await vis(page, '[data-hg-next]').click();
  // tâche 3 : +15 % de 200 → 230 ; tâche 4 : −20 % de 250 → 200
  await paint(15); await vis(page, '[data-hg-guess]').fill('230'); await go();
  check(await verdict() === 'ok', 'labo : +15 % de 200 = 230');
  await vis(page, '[data-hg-next]').click();
  await paint(20); await vis(page, '[data-hg-guess]').fill('200'); await go();
  check(await verdict() === 'ok', 'labo : −20 % de 250 = 200');
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les quatre tâches');
  await page.screenshot({ path: `${OUT}/lab-discovery-1280.png`, fullPage: true });
  // « جرّب أعدادك »
  await vis(page, '[data-hg-free-x]').fill('360');
  check(await vis(page, '[data-hg-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est ouvert et actif');
  await paint(25);
  check(await vis(page, '[data-hg-basket]').getAttribute('data-value') === '90', 'labo : 25 cases de 360 : 90 dans le panier');
  // متقدم : taux 70 % de 75 → 52,5
  await pickLevel(page, 'advanced');
  await paint(70); await go();
  check(await verdict() === 'ok', 'labo متقدم : 70 cases remplissent 52,5 sur 75');
  await page.screenshot({ path: `${OUT}/lab-advanced-1280.png` });
  await ctx.close();
}

// 4 — D'UN SEUL REGARD aux cinq tailles, aux deux niveaux.
const glanceFits = async (page, sel, label) => {
  const box = await page.evaluate((s) => {
    const el = [...document.querySelectorAll(s)].find((e) => e.offsetParent !== null);
    if (!el) return null;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    const r = el.getBoundingClientRect();
    return { h: r.height, vh: window.innerHeight, left: r.left, right: r.right, vw: window.innerWidth };
  }, sel);
  check(box && box.h <= box.vh, `${label}: ${sel} tient dans l'écran (${box ? `${Math.round(box.h)} / ${box.vh}` : 'absent'})`);
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: ${sel} reste dans la largeur`);
};
for (const [, L] of wanted) {
  for (const vp of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    const ctx = await contextFor(browser, token, vp);
    const page = await ctx.newPage();
    await page.goto(`${BASE}${CH}/${L.id}/nashat`, { waitUntil: 'networkidle' });
    await page.waitForSelector(L.root);
    await glanceFits(page, L.glance, `${L.id} ${vp.width}×${vp.height} مبتدئ`);
    await page.screenshot({ path: `${OUT}/${L.id}-lab-beginner-${vp.width}.png` });
    await pickLevel(page, 'advanced');
    await glanceFits(page, L.glance, `${L.id} ${vp.width}×${vp.height} متقدم`);
    await page.screenshot({ path: `${OUT}/${L.id}-lab-advanced-${vp.width}.png` });
    await ctx.close();
  }
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} échec(s)` : '\n✓ tout est vert');
process.exit(failures.length ? 1 : 0);
