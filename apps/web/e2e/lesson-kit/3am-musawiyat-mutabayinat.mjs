// QA — 3AM, unité 5 « المساويات – المتباينات – المعادلات » : leçons `musawiyat-amaliyat` « المساويات والعمليات » (labo `equality-lanes`) et
// `muadalat-darajat-ula` « المعادلات من الدرجة الأولى بمجهول واحد » (labo `term-ferry`) — cycle moyen, phase 3, file A entrées 5 et 6, 2026-10-21.
//
//   KIT_BASE=http://localhost:5174 node apps/web/e2e/lesson-kit/3am-musawiyat-mutabayinat.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)  ONLY=a|b limite aux leçons.
//
// Vérifie, dans un vrai navigateur, TABLETTE ET ORDINATEUR seulement (pas de téléphone) :
//   1. la page d'unité, le sommaire et CHAQUE module de chaque leçon à 768 et 1280 px : monté, aucune erreur console, aucun débordement
//      horizontal, aucun « $ » / « \command » / clé brute ;
//   2. guide §4quater : rien au-dessus du labo au module 1, les briques ABSENTES avant la réponse ;
//   3. chaque labo au CLAVIER et au POINTEUR, ses refus et sa découverte ;
//   4. D'UN SEUL REGARD : le bloc `glance` de chaque labo tient dans l'écran à 768×1024, 1024×768, 1280×800, 1366×768, 1920×1080, aux deux niveaux.
// Captures dans /tmp/qa-3am-musawiyat.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5174';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-3am-musawiyat';
const ONLY = process.env.ONLY || '';
const CH = '/courses/moyen/3am/ansab_al_aadad_wal_hisab';
const UNIT = `${CH}/units/musawiyat-mutabayinat`;
const LESSONS = {
  a: { id: 'musawiyat-amaliyat', title: 'المساويات والعمليات', root: '[data-equality-lanes]', glance: '[data-el-glance]', coach: 'equality-lanes' },
  b: { id: 'muadalat-darajat-ula', title: 'المعادلات من الدرجة الأولى بمجهول واحد', root: '[data-term-ferry]', glance: '[data-tf-glance]', coach: 'term-ferry' },
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
    try { localStorage.setItem('token', tk); if (off) for (const t of ['equality-lanes', 'term-ferry']) localStorage.setItem(`sa.labCoach.${t}.off`, '1'); } catch { /* noop */ }
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

// 3 — les gestes de `equality-lanes` (leçon a).
if (!ONLY || ONLY === 'a') {
  const L = LESSONS.a;
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${L.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-equality-lanes]');
  const knob = () => vis(page, '[data-el-knob]');
  const verdict = async () => vis(page, '[data-el-verdict]').getAttribute('data-el-verdict').catch(() => null);
  const setC = async (c) => {
    await knob().focus(); await page.keyboard.press('Home');
    for (let i = 0; i < c + 9; i += 1) await page.keyboard.press('ArrowRight');
  };
  const apply = async () => { await vis(page, '[data-el-apply]').click(); await page.waitForTimeout(550); };
  const op = (o) => vis(page, `[data-el-op="${o}"]`).click();
  const who = (w) => vis(page, `[data-el-who="${w}"]`).click();
  const equalNow = async () => vis(page, '[data-el-readout]').getAttribute('data-equal');

  check(await vis(page, '[data-el-runner="left"]').getAttribute('data-value') === '10', 'labo : départ, salma à 10');
  // clavier : −2 sur les deux
  await setC(-2);
  check(await knob().getAttribute('data-c') === '-2', 'labo (clavier) : Origine puis → règle c à −2');
  await apply();
  check(await verdict() === 'right', 'labo : −2 sur les deux atteint « 8 = 4x − 4 »');
  check(await equalNow() === 'true', 'labo : ils restent à la même graduation');
  check(await vis(page, '[data-el-runner="left"]').getAttribute('data-value') === '8', 'labo : les deux sont à 8');
  await vis(page, '[data-el-next]').click();
  // un seul coureur : ils se séparent
  await setC(4); await who('left'); await apply();
  check(await verdict() === 'broke', 'labo : +4 sur un seul coureur casse l\'égalité');
  check(await equalNow() === 'false' && await vis(page, '[data-el-svg]').locator('[data-el-gap]').count() === 1, 'labo : ils sont séparés, l\'écart est dessiné');
  await vis(page, '[data-el-undo]').click();
  check(await equalNow() === 'true', 'labo : « تراجع » les remet ensemble');
  await who('both');
  // ÷ 0 refusé
  await op('div'); await setC(0); await apply();
  check(await verdict() === 'refused', 'labo : ÷ 0 est refusé');
  // × 0 vide l'égalité
  await op('mul'); await apply();
  check((await vis(page, '[data-el-verdict]').textContent()).includes('0'), 'labo : × 0 donne 0 = 0');
  await vis(page, '[data-el-undo]').click();
  // pointeur : glisser la poignée vers la droite augmente c
  await op('add');
  const c0 = Number(await knob().getAttribute('data-c'));
  const box = await knob().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  const c1 = Number(await knob().getAttribute('data-c'));
  check(c1 > c0, `labo (pointeur) : glisser la poignée change c (${c0} → ${c1})`);
  // les tâches 2, 3, 4 puis la découverte
  await setC(2); await apply();
  check(await verdict() === 'right', 'labo : +2 atteint « 12 = 4x »');
  await vis(page, '[data-el-next]').click();
  await op('mul'); await setC(3); await apply();
  check(await verdict() === 'right', 'labo : × 3 atteint « 30 = 12x − 6 »');
  await vis(page, '[data-el-next]').click();
  await op('div'); await setC(2); await apply();
  check(await verdict() === 'right', 'labo : ÷ 2 atteint « 5 = 2x − 1 »');
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les tâches et un essai d\'un seul côté');
  await page.screenshot({ path: `${OUT}/lab-a-discovery-1280.png`, fullPage: true });
  // « جرّب أعدادك »
  await vis(page, '[data-el-free-n]').fill('7');
  check(await vis(page, '[data-el-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est ouvert et actif');
  check(await vis(page, '[data-el-runner="right"]').getAttribute('data-value') === '7', 'labo : les deux coureurs partent de 7');
  // متقدم : c négatif sur les deux
  await pickLevel(page, 'advanced');
  await op('mul'); await setC(-2); await apply();
  check(await verdict() === 'right', 'labo متقدم : × (−2) atteint « −10 = 6x − 2 »');
  await page.screenshot({ path: `${OUT}/lab-a-advanced-1280.png` });
  await ctx.close();
}

// 3bis — les gestes de `term-ferry` (leçon b).
if (!ONLY || ONLY === 'b') {
  const L = LESSONS.b;
  const ctx = await contextFor(browser, token, { width: 1280, height: 800 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${CH}/${L.id}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-term-ferry]');
  const show = () => page.evaluate(() => document.querySelector('[data-tf-glance]').scrollIntoView({ block: 'start', behavior: 'instant' }));
  const verdict = async () => vis(page, '[data-tf-verdict]').getAttribute('data-tf-verdict').catch(() => null);
  const eqText = async () => (await vis(page, '[data-tf-equation]').textContent()).replace(/\s+/g, '').replace(/−/g, '-');
  const drag = async (from, to) => {
    await show(); await page.waitForTimeout(150);
    const a = await vis(page, from).boundingBox(); const b = await vis(page, to).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(450);
  };
  check(await vis(page, '[data-tf-crate]').count() === 1, 'labo : des caisses sur les rives');
  // pointeur : garder le signe est refusé, avec les valeurs du x caché
  await drag('[data-tf-crate="R:x"]', '[data-tf-dock="keep"][data-bank="L"]');
  check(await verdict() === 'refused', 'labo (pointeur) : une caisse qui garde son signe est refusée');
  check((await eqText()).startsWith('3x+2=x+8'), 'labo : l\'équation n\'a pas changé après le refus');
  // pointeur : changer le signe
  await drag('[data-tf-crate="R:x"]', '[data-tf-dock="flip"][data-bank="L"]');
  check(await verdict() === 'ok', 'labo (pointeur) : « بعكس إشارته » est accepté');
  check((await eqText()).includes('2x+2=8'), 'labo : l\'équation devient 2x + 2 = 8');
  // tap puis tap : le chemin sans glisser
  await show();
  await vis(page, '[data-tf-crate="L:n"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="R"]').click();
  await page.waitForTimeout(450);
  check((await eqText()).includes('2x=6'), 'labo (toucher puis toucher) : 2x = 6');
  // ÷ 0 refusé, puis ÷ 2
  await vis(page, '[data-tf-less]').click();
  await vis(page, '[data-tf-divide-go]').click();
  check(await verdict() === 'refused', 'labo : ÷ 0 est refusé');
  await vis(page, '[data-tf-more]').click(); await vis(page, '[data-tf-more]').click();
  await vis(page, '[data-tf-divide-go]').click();
  check(await verdict() === 'right', 'labo : ÷ 2 isole x');
  check((await eqText()).includes('x=3'), 'labo : x = 3');
  await vis(page, '[data-tf-check]').click();
  check(await verdict() === 'check', 'labo : « عوّض » écrit la vérification');
  await vis(page, '[data-tf-next]').click();
  // deuxième équation : garder le signe d'une caisse refusé, undo, puis résolution par taps
  await vis(page, '[data-tf-crate="R:x"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="L"]').click();
  await vis(page, '[data-tf-crate="L:n"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="R"]').click();
  await page.waitForTimeout(400);
  await vis(page, '[data-tf-undo]').click();
  check((await eqText()).includes('2x-3=7'), 'labo : « تراجع » revient d\'un pas');
  await vis(page, '[data-tf-crate="L:n"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="R"]').click();
  await vis(page, '[data-tf-more]').click();
  await vis(page, '[data-tf-divide-go]').click();
  check(await verdict() === 'right', 'labo : 4x − 3 = 2x + 7 se résout (x = 5)');
  check(await page.locator('[data-manipulation-discovery]:visible').count() === 1, 'labo : la découverte s\'ouvre après les deux équations et un refus');
  await page.screenshot({ path: `${OUT}/lab-b-discovery-1280.png`, fullPage: true });
  // « جرّب أعدادك »
  await vis(page, '[data-tf-free-eq]').fill('5x-3=2x+9');
  check(await vis(page, '[data-tf-free]').getAttribute('data-active') === 'true', 'labo : « جرّب أعدادك » est actif');
  check((await eqText()).includes('5x-3=2x+9'), 'labo : sa propre équation sur la page de calcul');
  // متقدم
  await pickLevel(page, 'advanced');
  check((await eqText()).includes('9x+1=5x-7'), 'labo متقدم : 9x + 1 = 5x − 7');
  await vis(page, '[data-tf-crate="R:x"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="L"]').click();
  await vis(page, '[data-tf-crate="L:n"]').click();
  await vis(page, '[data-tf-dock="flip"][data-bank="R"]').click();
  await page.waitForTimeout(400);
  check((await eqText()).includes('4x=-8') || (await eqText()).includes('4x=−8'), 'labo متقدم : 4x = −8');
  await page.screenshot({ path: `${OUT}/lab-b-advanced-1280.png` });
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
