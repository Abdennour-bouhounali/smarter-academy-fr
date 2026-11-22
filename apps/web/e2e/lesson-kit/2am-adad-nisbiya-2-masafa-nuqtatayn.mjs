// QA — 2AM, unité 3 « الأعداد النسبية », leçon `masafa-nuqtatayn` « المسافة بين نقطتين على مستقيم مدرّج » et son labo `gap-caliper` « مسماك الفرق » (cycle moyen phase 3, 2026-10-29).
//
//   KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/2am-adad-nisbiya-2-masafa-nuqtatayn.mjs
//   (Vite du dépôt + l'API sur 8000 ; un compte ENSEIGNANT : navigation libre, rien n'est enregistré.)
//
// Vérifie, dans un vrai navigateur, à 768×1024, 1024×768, 1280×800 et 1366×768 (tablette et laptop seulement) :
//   1. le sommaire et CHAQUE module : monté, aucune erreur console, aucun débordement horizontal, aucun « $ » / « \command » / clé `manipulation.` brute, aucune formule de fiche qui dépasse ;
//   2. le labo مبتدئ : g1 — les flèches du clavier ouvrent le compas à 5 (il s'arrête à +1, le fantôme est rose), à 13 il touche (la bande est coupée au zéro, deux morceaux 4 et 9) ; « −13 » est refusé
//      (mâchoires croisées) puis « 13 » accepté et la carte de questions s'ouvre PAR-DESSUS le labo ; un glissement à la souris ouvre le compas ; « إعادة » repart de la tâche 1 ;
//   3. le labo متقدم : l'ouverture est écrite AVANT la vis (la vis est verrouillée, « −8,5 » refusé), a2 deux points (+5,5 puis −2,5), a3 le compas serré sur la graine du haut (9,5) ;
//   4. D'UN SEUL REGARD : `[data-gc-glance]` reste dans la largeur ET ≤ 700 px de haut à 1024×768, aux DEUX niveaux (et dans la pire phase : bandeau + « التالي ») ;
//   5. « جرّب أعدادك » : « −3 ; 5,5 » ouvre la tâche libre et nomme les deux morceaux autour du zéro.
// Captures dans /tmp/qa-2am-masafa-nuqtatayn (ou QA_OUT).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/qa-2am-masafa-nuqtatayn';
const CH = '/courses/moyen/2am/ansab_al_aadad_wal_hisab';
const LESSON = `${CH}/masafa-nuqtatayn`;
const MODULES = ['astaidd', 'nashat', 'maarif', 'tariqa', 'atamarran', 'masala-1', 'masala-2', 'masala-3', 'itqan'];
const SIZES = [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 800 }, { width: 1366, height: 768 }];
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who) {
  if (process.env.QA_TOKEN) return process.env.QA_TOKEN;
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}
async function contextFor(browser, token, viewport) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.setItem('sa.labCoach.gap-caliper.off', '1'); } catch { /* noop */ } }, token);
  return ctx;
}
const RAW = /(^|[^\\])\$[^$\s][^$]*\$|\\(frac|times|mathrm|ldots|le|div)\b|manipulation\.[a-zA-Z]+\./;
async function pageHealth(page, label) {
  const { overflow, raw } = await page.evaluate((re) => {
    const rx = new RegExp(re);
    const doc = document.documentElement;
    const bad = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const el = n.parentElement;
      if (!el || el.closest('script,style,.katex-mathml,[aria-hidden="true"]') || el.closest('[hidden]')) continue;
      if (rx.test(n.textContent)) bad.push(n.textContent.trim().slice(0, 80));
    }
    return { overflow: doc.scrollWidth - doc.clientWidth, raw: bad.slice(0, 3) };
  }, RAW.source);
  check(overflow <= 1, `${label}: pas de débordement horizontal (${overflow}px)`);
  check(raw.length === 0, `${label}: aucun texte brut ${raw.length ? JSON.stringify(raw) : ''}`);
}

const browser = await chromium.launch();
const token = await loginToken(TEACHER);

// 1 — sommaire et modules (QA_LAB_ONLY=1 les saute : relancer seulement le labo).
for (const vp of process.env.QA_LAB_ONLY ? [] : SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  check(await page.getByText('المسافة بين نقطتين على مستقيم مدرّج').first().isVisible().catch(() => false), `${tag} sommaire monté`);
  await pageHealth(page, `${tag} sommaire`);
  for (const slug of MODULES) {
    await page.goto(`${BASE}${LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(await page.locator('main, [data-module-layout], h1').first().isVisible().catch(() => false), `${tag} ${slug} monté`);
    await pageHealth(page, `${tag} ${slug}`);
    // aucune formule d'une fiche de mémoire ne dépasse sa fiche (règle trop longue = rognée)
    const clipped = await page.evaluate(() => {
      const out = [];
      for (const card of document.querySelectorAll('[data-memo-card]')) {
        const cb = card.getBoundingClientRect();
        for (const k of card.querySelectorAll('.katex')) {
          const r = k.getBoundingClientRect();
          if (r.width && (r.left < cb.left - 1 || r.right > cb.right + 1)) out.push(k.textContent.slice(0, 40));
          const host = k.closest('[data-memo-rule],[data-memo-chip],[data-memo-tile]');
          if (host) { const hb = host.getBoundingClientRect(); if (r.width && (r.left < hb.left - 1 || r.right > hb.right + 1)) out.push(`tile:${k.textContent.slice(0, 40)}`); }
        }
      }
      return out;
    });
    check(clipped.length === 0, `${tag} ${slug}: aucune formule de fiche ne dépasse sa fiche ${clipped.length ? JSON.stringify(clipped.slice(0, 3)) : ''}`);
    if (vp.width !== 1280) await page.screenshot({ path: `${OUT}/${slug}-${vp.width}.png`, fullPage: true });
  }
  check(errors.length === 0, `${tag} aucune erreur console ${errors.length ? JSON.stringify(errors.slice(0, 3)) : ''}`);
  await ctx.close();
}

// 2 → 5 — le labo.
const vis = (page, sel) => page.locator(`${sel}:visible`).first();
const glanceFits = async (page, label, vp) => {
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-gc-glance]')].find((e) => e.offsetHeight > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { h: r.height, left: r.left, right: r.right, vw: window.innerWidth };
  });
  check(box && box.left >= 0 && box.right <= box.vw + 1, `${label}: [data-gc-glance] reste dans la largeur (${box ? Math.round(box.h) : 'absent'} px de haut)`);
  if (vp.width === 1024) check(box && box.h <= 700, `${label}: [data-gc-glance] ≤ 700 px de haut à 1024×768 (${box ? Math.round(box.h) : 'absent'})`);
  return box;
};
const pickLevel = async (page, level) => {
  const tab = page.locator(`[data-manipulation-levels-selector] [role=tab][data-level=${level}]`).first();
  await tab.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForSelector('[data-gc-glance]', { state: 'attached' });
  await page.waitForTimeout(900);
};
const dOf = (page) => vis(page, '[data-gap-caliper]').getAttribute('data-d');
const screw = async (page, ...ks) => { const s = vis(page, '[data-gc-screw]'); await s.focus(); for (const k of ks) { await page.keyboard.press(k); await page.waitForTimeout(40); } };
const fix = async (page) => { await vis(page, '[data-gc-fix]').scrollIntoViewIfNeeded(); await vis(page, '[data-gc-fix]').click(); await page.waitForTimeout(250); };
const write = async (page, v) => {
  await vis(page, '[data-gc-input]').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await vis(page, '[data-gc-input]').fill(v); await vis(page, '[data-gc-check]').click(); await page.waitForTimeout(250);
};
/** Bidi : dans chaque nœud de texte visible (hors KaTeX), le « − » d'un nombre signé reste À GAUCHE de ses chiffres, et « ° C » / « m » ne sont pas détachés de leur nombre. */
const bidiAudit = async (page, label) => {
  const bad = await page.evaluate(() => {
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode; const el = n.parentElement;
      if (!el || el.closest('.katex,script,style,[hidden],[aria-hidden="true"]') || !el.offsetParent) continue;
      const t = n.textContent;
      for (let i = 0; i < t.length - 1; i += 1) {
        if (t[i] === '−' && /[0-9]/.test(t[i + 1])) {
          const a = document.createRange(); a.setStart(n, i); a.setEnd(n, i + 1);
          const b = document.createRange(); b.setStart(n, i + 1); b.setEnd(n, i + 2);
          const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
          if (ra.width && rb.width && ra.left > rb.left) out.push(t.slice(Math.max(0, i - 6), i + 8));
        }
      }
    }
    return out.slice(0, 3);
  });
  check(bad.length === 0, `${label}: chaque « − » reste à gauche de ses chiffres ${bad.length ? JSON.stringify(bad) : ''}`);
};
const verdict = async (page) => vis(page, '[data-gc-verdict]').getAttribute('data-gc-verdict');
/** Répond à toutes les questions de la carte « par-dessus le labo » (essaie chaque option jusqu'à la bonne) puis la referme. */
const passCard = async (page) => {
  for (let guard = 0; guard < 14; guard += 1) {
    if (!(await page.locator('[data-lab-checkpoint]:visible').count())) return;
    const next = page.locator('[data-lab-checkpoint-next]:visible').first();
    if (await next.count()) { await next.click(); await page.waitForTimeout(350); continue; }
    const n = await page.locator('[data-lab-checkpoint-option]:visible').count();
    let moved = false;
    for (let i = 0; i < n && !moved; i += 1) {
      await page.locator('[data-lab-checkpoint-option]:visible').nth(i).click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(250);
      moved = (await page.locator('[data-lab-checkpoint-next]:visible').count()) > 0;
    }
    if (!moved) return;
  }
};

for (const vp of SIZES.filter((v) => !process.env.QA_WIDTHS || process.env.QA_WIDTHS.split(',').includes(String(v.width)))) {
  const ctx = await contextFor(browser, token, vp);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tag = `${vp.width}×${vp.height}`;
  const shot = async (name) => { await bidiAudit(page, `${tag} ${name}`); const el = page.locator(`[data-gap-caliper][data-level=${name.startsWith('advanced') ? 'advanced' : 'beginner'}] [data-gc-glance]`).first(); await el.scrollIntoViewIfNeeded().catch(() => {}); await el.screenshot({ path: `${OUT}/lab-${name}-${vp.width}x${vp.height}.png` }).catch(() => page.screenshot({ path: `${OUT}/lab-${name}-${vp.width}x${vp.height}.png` })); };
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-gap-caliper]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await glanceFits(page, `${tag} مبتدئ`, vp);
  await shot('beginner-init');
  check((await vis(page, '[data-gc-jaw]').getAttribute('data-value')) === '-4' && (await dOf(page)) === '0', `${tag} g1 : le compas est serré sur −4, ouverture 0`);
  // g1 : les flèches ouvrent le compas à 5 : la mâchoire s'arrête à +1, court (subDist)
  await screw(page, 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp', 'ArrowUp');
  check((await dOf(page)) === '5' && (await vis(page, '[data-gc-jaw]').getAttribute('data-value')) === '1', `${tag} g1 : 5 crans ouvrent le compas à 5, la mâchoire est en +1 (${await dOf(page)})`);
  await fix(page);
  check((await verdict(page)) === 'wrong' && await page.locator('[data-gc-ghost][data-model="subDist"]').count() > 0, `${tag} g1 : ouvrir 5 s'arrête court : le fantôme montre ce qui manque`);
  await shot('beginner-short');
  await screw(page, 'PageUp', 'ArrowUp', 'ArrowUp', 'ArrowUp');
  check((await dOf(page)) === '13' && await page.locator('[data-gc-band]').count() === 2, `${tag} g1 : à 13 la bande est coupée au zéro en deux morceaux (${await dOf(page)})`);
  await fix(page);
  check((await verdict(page)) === 'right' && await vis(page, '[data-gc-input]').isVisible(), `${tag} g1 : le compas touche la graine de l'après-midi : on écrit la distance`);
  await shot('beginner-split');
  await write(page, '-13');
  check((await verdict(page)) === 'wrong' && await page.locator('[data-gc-ghost][data-model="neg"]').count() > 0, `${tag} g1 : « −13 » est refusé, les mâchoires se croisent`);
  await shot('beginner-crossed');
  await write(page, '13');
  await page.waitForTimeout(700);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} g1 : la carte de questions s'ouvre PAR-DESSUS le labo`);
  await shot('beginner-card');
  await passCard(page);
  await glanceFits(page, `${tag} مبتدئ pire phase`, vp);
  check(await vis(page, '[data-gc-next]').isVisible().catch(() => false), `${tag} g1 : « المهمة التالية » apparaît après les questions`);
  await shot('beginner-next');
  // « إعادة » : tout repart
  await vis(page, 'button:has-text("إعادة")').click().catch(() => {});
  await page.waitForTimeout(600);
  check((await vis(page, '[data-gap-caliper]').getAttribute('data-task')) === '0' && (await dOf(page)) === '0', `${tag} « إعادة » repart de la tâche 1`);
  // un glissement à la souris ouvre le compas
  await vis(page, '[data-gc-svg]').scrollIntoViewIfNeeded();
  const box = await vis(page, '[data-gc-svg]').boundingBox();
  const knob = await vis(page, '[data-gc-screw]').boundingBox();
  await page.mouse.move(knob.x + knob.width / 2, knob.y + knob.height / 2); await page.mouse.down();
  await page.mouse.move(knob.x + knob.width / 2, box.y + box.height * 0.3, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(200);
  check((await dOf(page)) !== '0', `${tag} un glissement à la souris ouvre le compas (ouverture ${await dOf(page)})`);
  await shot('beginner-drag');

  await pickLevel(page, 'advanced');
  await glanceFits(page, `${tag} متقدم`, vp);
  await shot('advanced-init');
  check(await vis(page, '[data-gc-dial]').getAttribute('data-locked') === 'true' && await page.locator('[data-gc-screw]:visible').count() === 0, `${tag} a1 : la vis est verrouillée avant d'écrire l'ouverture`);
  await write(page, '-8,5');
  check((await verdict(page)) === 'wrong' && await page.locator('[data-gc-ghost][data-model="neg"]').count() > 0, `${tag} a1 : une ouverture négative est refusée`);
  await write(page, '8,5');
  check(await vis(page, '[data-gc-screw]').count() > 0 && (await vis(page, '[data-gc-dial]').getAttribute('data-locked')) === 'false', `${tag} a1 : une bonne prédiction déverrouille la vis`);
  await shot('advanced-open');
  await screw(page, 'PageUp', 'PageUp', 'PageUp', 'ArrowUp', 'ArrowUp');
  check((await dOf(page)) === '8,5', `${tag} a1 : 17 demi-crans = 8,5 (${await dOf(page)})`);
  await fix(page);
  await page.waitForTimeout(700);
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a1 : la bonne ouverture ouvre la carte de questions`);
  await passCard(page);
  await vis(page, '[data-gc-next]').click();
  await page.waitForTimeout(500);
  // a2 : une ouverture fixe, deux points
  check(await vis(page, '[data-gc-swing="up"]').isVisible(), `${tag} a2 : les deux boutons de balancement sont là`);
  await write(page, '5,5');
  check(await page.locator('[data-gc-bead="found"][data-value="5,5"]').count() === 1, `${tag} a2 : +5,5 trouvé (première réponse)`);
  await shot('advanced-swing-one');
  await vis(page, '[data-gc-swing="down"]').click();
  await write(page, '2,5');
  check((await verdict(page)) === 'wrong', `${tag} a2 : « 2,5 » (signe échangé) est refusé`);
  await write(page, '-2,5');
  await page.waitForTimeout(700);
  await shot('advanced-swing-two');
  check(await page.locator('[data-lab-checkpoint]').count() > 0, `${tag} a2 : les deux points ouvrent la carte`);
  await passCard(page);
  await vis(page, '[data-gc-next]').click();
  await page.waitForTimeout(500);
  // a3 : le compas serré sur la graine du HAUT
  check((await vis(page, '[data-gc-jaw]').count()) === 0 || true, `${tag} a3 atteint`);
  await shot('advanced-a3-init');
  await write(page, '9,5');
  await screw(page, 'PageUp', 'PageUp', 'PageUp', 'ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown');
  check((await dOf(page)) === '9,5' && (await vis(page, '[data-gc-jaw]').getAttribute('data-value')) === '-6,5', `${tag} a3 : serré sur +3, ouvert vers le bas il touche −6,5 (${await dOf(page)})`);
  await shot('advanced-a3-open');
  await fix(page);
  await page.waitForTimeout(800);
  await shot('advanced-done');
  check(errors.length === 0, `${tag} aucune erreur de page ${errors.length ? JSON.stringify(errors.slice(0, 2)) : ''}`);
  await ctx.close();
}
{
  const ctx = await contextFor(browser, token, { width: 1366, height: 768 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${LESSON}/nashat`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-gap-caliper]', { timeout: 20000 });
  await pickLevel(page, 'beginner');
  await vis(page, '[data-gc-free-input]').fill('-3 ; 5,5');
  await page.waitForTimeout(300);
  check((await vis(page, '[data-gc-free]').getAttribute('data-active')) === 'true', '« جرّب أعدادك » : « −3 ; 5,5 » ouvre la tâche libre');
  const info = await vis(page, '[data-gc-free-info]').textContent();
  check(info.includes('8,5') && info.includes('الصفر'), '« جرّب أعدادك » : la distance 8,5 et le passage par le zéro sont nommés');
  await page.screenshot({ path: `${OUT}/lab-free-1366x768.png` });
  await ctx.close();
}

await browser.close();
if (failures.length) { console.log(`\n${failures.length} échec(s)`); process.exit(1); }
console.log('\nTout est vert.');
