// QA — la carte de connaissances PROGRESSIVE de chaque leçon (KNOWLEDGE_MAP.md, Part A).
//
// Lancement (Vite sur 5173 et l'API sur 8000 en marche, comptes QA importés) :
//   node apps/web/e2e/knowledge-map.mjs                 toutes les leçons
//   QA_LESSONS=bahth-pgcd,tayin-pgcd node apps/web/e2e/knowledge-map.mjs
//
// Pour chaque leçon, en ENSEIGNANT (la carte complète, freeNavigation) :
// bureau 1440, tablette 820, téléphone 390 — la carte complète (« عرض الخريطة
// كاملة ») puis « المعارف مفصّلة ». Mesures DOM : aucun débordement horizontal
// de la page, aucun nœud qui en chevauche un autre, aucune étiquette de
// relation posée sur un nœud, aucune notation coupée, une seule colonne
// numérotée 1 → n qui commence par « ابدأ من هنا », aucune erreur console.
// En ÉLÈVE (compte QA, progression réelle) : la carte ne montre que la racine
// au départ, et rien d'une connaissance non atteinte (nœuds verrouillés sans titre).
// Deux connexions API seulement (/auth/login est limité à 6/min).
// Captures dans /tmp/knowledge-map-qa.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/knowledge-map-qa';
const UNIT = '/courses/moyen/4am/ansab_al_aadad_wal_hisab';
// A v2 lesson (its pack declares a WORLD, LESSON_V2.md §2) has no 🧠 map on its home: its only knowledge map is the
// world's own « خريطة المعارف » (walked by its gameworld-*-hub walk). Which lessons are v2 is read from the generated index.
const INDEX = JSON.parse(readFileSync(new URL('../src/lessons/lessonIndex.generated.json', import.meta.url), 'utf8'));
const V2 = new Set(INDEX.lessons.filter((l) => l.pack?.world).map((l) => l.id));
const UNIT_LESSONS = [
  'qasim-adad-tabii', 'qawasim-adad-tabii', 'khawass-qawasim', 'qasim-mushtarak-akbar', 'tayin-pgcd',
  'bahth-pgcd', 'awwaliyan-fima-baynahuma', 'ikhtizal-kasr', 'wadiya-idmajiya-aadad',
];
const ALL = UNIT_LESSONS.filter((id) => !V2.has(id));
/** A v2 lesson of this unit: its home must show NO 🧠 map button. */
const V2_HERE = UNIT_LESSONS.find((id) => V2.has(id));
const LESSONS = process.env.QA_LESSONS ? process.env.QA_LESSONS.split(',') : ALL;
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'phone', width: 390, height: 844 },
];
mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
const check = (ok, label) => {
  if (ok) { passed += 1; } else { failed += 1; console.log(`  ✗ ${label}`); }
};

async function loginToken(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  return token;
}

async function contextFor(browser, token, viewport) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ', reducedMotion: 'reduce' });
  await context.addInitScript((tk) => {
    try { localStorage.setItem('token', tk); sessionStorage.clear(); } catch { /* noop */ }
  }, token);
  return context;
}

/**
 * Ferme la « جولة تعريفية » d'une première visite (PAGE_TOURS.md, 2026-10-07) : sa carte intercepte les clics
 * sur la page. L'état « vu » est côté serveur, par compte — un compte de QA neuf la voit sur chaque page.
 */
async function closeTour(page) {
  const card = page.locator('[data-tour-card]');
  for (let i = 0; i < 3 && await card.count(); i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  }
}

/** Ouvre « بطاقتي ». Renvoie 'graph', ou 'empty' (rien encore d'établi : l'état vide habituel). */
async function openMap(page, lesson) {
  await page.goto(`${BASE}${UNIT}/${lesson}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await closeTour(page);
  const trigger = page.locator('[data-km-trigger]').first();
  await trigger.waitFor({ state: 'visible', timeout: 15000 });
  await trigger.click();
  await page.locator('[data-kg-root], [data-km-empty]').first().waitFor({ timeout: 15000 });
  return (await page.locator('[data-kg-root]').count()) ? 'graph' : 'empty';
}

/** Mesures géométriques de la carte telle qu'elle est DESSINÉE. */
function measureMap() {
  const rect = (el) => el.getBoundingClientRect();
  const nodes = [...document.querySelectorAll('[data-kg-node]')].map((el) => ({ id: el.dataset.kgNode, r: rect(el), el }));
  const labels = [...document.querySelectorAll('[data-kg-label]')].map((el) => ({ id: el.dataset.kgLabel, r: rect(el) }));
  const hit = (a, b, pad = 1) => a.left + pad < b.right && b.left + pad < a.right && a.top + pad < b.bottom && b.top + pad < a.bottom;
  const overlaps = [];
  for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) if (hit(nodes[i].r, nodes[j].r)) overlaps.push(`${nodes[i].id}×${nodes[j].id}`);
  const labelOnNode = [];
  for (const l of labels) for (const n of nodes) if (hit(l.r, n.r, 2)) labelOnNode.push(`${l.id}@${n.id}`);
  const labelOnLabel = [];
  for (let i = 0; i < labels.length; i += 1) for (let j = i + 1; j < labels.length; j += 1) if (hit(labels[i].r, labels[j].r)) labelOnLabel.push(`${labels[i].id}×${labels[j].id}`);
  // Une notation ne se coupe jamais : réduite (≥ 0.7) elle doit TENIR.
  const clippedMath = [...document.querySelectorAll('[data-kg-math-scale]')].filter((outer) => {
    const inner = outer.firstElementChild;
    return inner && inner.getBoundingClientRect().width > outer.getBoundingClientRect().width + 1;
  }).map((el) => el.closest('[data-kg-node]')?.dataset.kgNode);
  const truncatedTitles = nodes.filter(({ el }) => {
    const t = el.querySelector('.truncate.leading-6');
    return t && t.scrollWidth > t.clientWidth + 1;
  }).map((n) => n.id);
  const graph = document.querySelector('[data-kg-graph]')?.getBoundingClientRect();
  const outOfGraph = graph ? nodes.filter((n) => n.r.left < graph.left - 1 || n.r.right > graph.right + 1).map((n) => n.id) : [];
  return {
    nodes: nodes.length,
    states: nodes.reduce((acc, n) => ({ ...acc, [n.el.dataset.kgState]: (acc[n.el.dataset.kgState] ?? 0) + 1 }), {}),
    lockedWithTitle: nodes.filter((n) => n.el.dataset.kgState === 'locked' && !n.el.textContent.includes('معرفة مقفلة')).map((n) => n.id),
    overlaps, labelOnNode, labelOnLabel, clippedMath, truncatedTitles, outOfGraph,
    pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
  };
}

function measureLinear() {
  // L'écran seulement : la copie d'impression (.sa-print-view) est aussi dans le DOM.
  const items = [...document.querySelectorAll('[data-kg-linear="screen"] [data-kg-linear-item]')];
  const cards = items.map((li) => li.querySelector('article')?.getBoundingClientRect());
  return {
    count: items.length,
    numbers: items.map((li) => Number(li.dataset.kgLinearIndex)),
    lefts: [...new Set(cards.map((r) => Math.round(r.left)))],
    firstIsStart: Boolean(items[0]?.querySelector('[data-kg-linear-start]')),
    starts: document.querySelectorAll('[data-kg-linear="screen"] [data-kg-linear-start]').length,
    pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
  };
}

const teacherToken = await loginToken(TEACHER);
const studentToken = await loginToken(STUDENT);
const browser = await chromium.launch();
const summary = [];

try {
  // a v2 lesson's home is its world: no « بطاقتي » 🧠 button (the world's « خريطة المعارف » is its only map)
  if (V2_HERE) {
    const ctx = await contextFor(browser, teacherToken, { width: 1440, height: 900 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${UNIT}/${V2_HERE}`, { waitUntil: 'networkidle' });
    await closeTour(page);
    const world = await page.locator('.di-root').first().waitFor({ timeout: 30000 }).then(() => true, () => false);
    await page.waitForTimeout(800);
    check(world && (await page.locator('[data-km-trigger]').count()) === 0, `${V2_HERE} (v2): its home is the world, with no 🧠 map button (world ${world}, ${await page.locator('[data-km-trigger]').count()} button)`);
    await ctx.close();
  } else check(false, 'a v2 lesson of this unit is found in lessonIndex.generated.json');
  for (const lesson of LESSONS) {
    console.log(`\n${lesson}`);
    for (const vp of VIEWPORTS) {
      const ctx = await contextFor(browser, teacherToken, { width: vp.width, height: vp.height });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`${m.text()} ${m.location()?.url ?? ''}`); });
      await openMap(page, lesson);
      // Plein écran là où il existe : c'est là que la carte a toute sa place.
      if (vp.name !== 'phone' && await page.locator('[data-km-expand]').isVisible().catch(() => false)) {
        await page.locator('[data-km-expand]').click();
        await page.waitForTimeout(400);
      }
      // LA DÉCOUVERTE : la racine seule, puis suivre le seul nœud qui clignote
      // (« التالي ») jusqu'au bout — chaque clic révèle, la carte se complète.
      if (vp.name === 'desktop' || vp.name === 'phone') {
        check(await page.locator('[data-kg-node]').count() === 1, `${lesson} ${vp.name}: l'exploration commence sur la racine seule`);
        let clicks = 0;
        for (; clicks < 40; clicks += 1) {
          const next = page.locator('[data-kg-node]:has([data-kg-next-flash])');
          if (await next.count() === 0) break;
          check(await next.count() === 1, `${lesson} ${vp.name}: un seul « التالي » à la fois`);
          await next.first().click();
          await page.waitForTimeout(120);
        }
        const total = await page.locator('[data-kg-node]').count();
        const progress = await page.locator('[data-kg-progress]').getAttribute('data-kg-progress');
        check(progress === `${total}/${total}` && clicks === total, `${lesson} ${vp.name}: suivre le flash découvre toute la carte (${progress}, ${clicks} clics)`);
        check(await page.locator('[data-kg-complete]').isVisible(), `${lesson} ${vp.name}: « اكتملت خريطتك »`);
        await page.screenshot({ path: `${OUT}/${lesson}-${vp.name}-explored.png` });
        await page.locator('[data-kg-replay]').click();
        await page.waitForTimeout(300);
        check(await page.locator('[data-kg-node]').count() === 1, `${lesson} ${vp.name}: « إعادة استكشاف الخريطة » revient à la racine`);
      }
      await page.locator('[data-kg-view-toggle="full"]').click();
      await page.waitForTimeout(900);
      const m = await page.evaluate(measureMap);
      check(m.nodes > 0, `${lesson} ${vp.name}: la carte a des nœuds`);
      check(!m.states.locked, `${lesson} ${vp.name}: l'enseignant voit toute la carte (${JSON.stringify(m.states)})`);
      check(m.overlaps.length === 0, `${lesson} ${vp.name}: nœuds qui se chevauchent ${m.overlaps}`);
      check(m.labelOnNode.length === 0, `${lesson} ${vp.name}: étiquettes sur un nœud ${m.labelOnNode}`);
      check(m.labelOnLabel.length === 0, `${lesson} ${vp.name}: étiquettes superposées ${m.labelOnLabel}`);
      check(m.clippedMath.length === 0, `${lesson} ${vp.name}: notation coupée ${m.clippedMath}`);
      check(m.outOfGraph.length === 0, `${lesson} ${vp.name}: nœuds hors du graphe ${m.outOfGraph}`);
      check(m.pageOverflow <= 0, `${lesson} ${vp.name}: débordement horizontal ${m.pageOverflow}px`);
      await page.screenshot({ path: `${OUT}/${lesson}-${vp.name}-map.png`, fullPage: false });
      // La carte ENTIÈRE pour la relecture : une fenêtre assez haute pour
      // tout le graphe (la zone de défilement de la carte coupe sinon).
      const graphH = await page.evaluate(() => document.querySelector('[data-kg-graph]')?.getBoundingClientRect().height ?? 0);
      await page.setViewportSize({ width: vp.width, height: Math.min(4000, Math.round(graphH) + 360) });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/${lesson}-${vp.name}-graph.png` });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      await page.getByRole('button', { name: 'المعارف مفصّلة' }).click();
      await page.locator('[data-kg-linear]').first().waitFor();
      await page.waitForTimeout(500);
      const l = await page.evaluate(measureLinear);
      check(l.count > 0 && l.numbers.every((n, i) => n === i + 1), `${lesson} ${vp.name}: numérotation 1 → n (${l.numbers})`);
      check(l.lefts.length === 1, `${lesson} ${vp.name}: une seule colonne (${l.lefts})`);
      check(l.firstIsStart && l.starts === 1, `${lesson} ${vp.name}: « ابدأ من هنا » sur ① seulement`);
      check(l.pageOverflow <= 0, `${lesson} ${vp.name}: débordement (linéaire) ${l.pageOverflow}px`);
      await page.screenshot({ path: `${OUT}/${lesson}-${vp.name}-linear.png`, fullPage: false });
      check(errors.length === 0, `${lesson} ${vp.name}: erreurs console ${errors.slice(0, 3).join(' | ')}`);
      summary.push({ lesson, vp: vp.name, nodes: m.nodes, linear: l.count, truncatedTitles: m.truncatedTitles });
      await ctx.close();
    }

    // Élève : la découverte commence par la racine seule ; rien de non atteint n'est lisible.
    const sctx = await contextFor(browser, studentToken, { width: 1440, height: 900 });
    const sp = await sctx.newPage();
    const serrors = [];
    sp.on('pageerror', (e) => serrors.push(e.message));
    const opened = await openMap(sp, lesson);
    let full = { states: 'aucune connaissance établie : état vide' };
    if (opened === 'graph') {
      const start = await sp.evaluate(measureMap);
      check(start.nodes === 1, `${lesson} élève: la carte s'ouvre sur la racine seule (${start.nodes})`);
      await sp.locator('[data-kg-view-toggle="full"]').click();
      await sp.waitForTimeout(700);
      full = await sp.evaluate(measureMap);
      check(full.lockedWithTitle.length === 0, `${lesson} élève: aucun titre sur un nœud verrouillé ${full.lockedWithTitle}`);
    }
    await sp.screenshot({ path: `${OUT}/${lesson}-student-full.png` });
    check(serrors.length === 0, `${lesson} élève: erreurs ${serrors.join(' | ')}`);
    summary.push({ lesson, vp: 'student', states: full.states });
    await sctx.close();

    // Élève qui n'a fini QUE le محور 1 : la progression est posée dans le
    // stockage local (aucune écriture ne part vers l'API : toute requête de
    // progression autre qu'une lecture est bloquée). La carte doit montrer les
    // idées du محور 1 et verrouiller — sans titre — tout le reste.
    const pctx = await contextFor(browser, studentToken, { width: 1440, height: 900 });
    await pctx.route('**/api/v1/**', (route) => (route.request().method() === 'GET' ? route.continue() : route.abort()));
    await pctx.addInitScript((key) => {
      try { localStorage.setItem(key, JSON.stringify({ completedModules: ['01'], completedExercises: [] })); } catch { /* noop */ }
    }, `smarter_lesson_${lesson}`);
    const pp = await pctx.newPage();
    if (await openMap(pp, lesson) === 'graph') {
      await pp.locator('[data-kg-view-toggle="full"]').click();
      await pp.waitForTimeout(700);
      const partial = await pp.evaluate(measureMap);
      check((partial.states.available ?? 0) > 0, `${lesson} élève M1: des idées du محور 1 ouvertes (${JSON.stringify(partial.states)})`);
      check(partial.lockedWithTitle.length === 0, `${lesson} élève M1: aucun titre sur un nœud verrouillé ${partial.lockedWithTitle}`);
      await pp.screenshot({ path: `${OUT}/${lesson}-student-m1.png` });
      summary.push({ lesson, vp: 'student-m1', states: partial.states });
    } else {
      check(false, `${lesson} élève M1: la carte devrait montrer le محور 1`);
    }
    await pctx.close();
  }
} finally {
  await browser.close();
}

for (const s of summary) console.log(JSON.stringify(s));
console.log(`\n${passed} passed, ${failed} failed — captures: ${OUT}`);
process.exit(failed ? 1 : 0);
