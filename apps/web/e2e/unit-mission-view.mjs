// QA — la page d'UNITÉ, regard élève (UnitMissionView, propriétaire 2026-11-09 ; conseil : la fenêtre ne défile pas).
//
// Lancement (Vite sur 5173 ; l'API n'est PAS nécessaire — la session est simulée dans la page) :
//   node apps/web/e2e/unit-mission-view.mjs
// Pour CHAQUE unité de UNIT_MISSIONS (2026-11-10 : unités 1 et 2), à 1366×768, 1024×768 et 1920×1080 : la page ne défile pas et s'agrandit à 1920 ; CHAQUE station et chaque pastille ouvre
// une fenêtre qui ne défile pas — repliée ET avec « المزيد » ouvert ; « واصل الدرس » mène à la leçon en cours ; l'enseignant garde l'ancienne
// page (aucun `[data-unit-mission-view]`). Échec = code de sortie 1. Captures dans /tmp/unit-mission-view-qa.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { UNIT_MISSIONS } from '../src/pages/unit/unitMissions.js';

// le ميدان (chapitre d'affichage) de CHAQUE unité vient du catalogue : l'unité 9 est sous `handasa`, pas sous `ansab_al_aadad_wal_hisab`
const CATALOGUE = JSON.parse(readFileSync(new URL('../../../packages/core/curriculum/dz/units_4am_2026_2027.json', import.meta.url), 'utf8'));
const CHAPTER_OF = Object.fromEntries(CATALOGUE.units.map((u) => [u.code, u.chapterId]));

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/unit-mission-view-qa';
const UNIT_URL = (unitId) => {
  const chapter = CHAPTER_OF[unitId];
  if (!chapter) throw new Error(`unit « ${unitId} » is not in units_4am_2026_2027.json`);
  return `${BASE}/courses/moyen/4am/${chapter}/units/${unitId}`;
};
mkdirSync(OUT, { recursive: true });

/** la barre latérale de l'application (WorkspaceLayoutContext › SIDEBAR_KEY) */
const SIDEBAR_KEY = 'sidebarCollapsed';
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };
const USER = { id: 9001, name: 'تلميذ تجريبي', email: 'eleve@example.com', grade: '4am', level: 'moyen', email_verified_at: '2026-01-01T00:00:00Z', nameComplete: true, firstName: 'تلميذ', lastName: 'تجريبي' };
// trois leçons terminées : la 4e est « درسك الآن » (l'ordre des leçons = l'ordre des clés de `icons` : leçons puis synthèse)
const ALL = ['00', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const seedFor = (lessons) => ({
  ...Object.fromEntries(lessons.slice(0, 3).map((id) => [`u_9001_smarter_lesson_${id}`, { completedModules: ALL, completedExercises: [] }])),
  // la visite guidée de la page (PageTourProvider) est déjà vue : sa carte ne couvre pas les stations
  'u_9001_tours.pending': { 'student.unit': { status: 'completed' }, 'teacher.unit': { status: 'completed' } },
});

async function open(unitId, lessons, viewport, role = 'student', collapsed = false) {
  const ctx = await browser.newContext({ viewport, locale: 'ar', reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.addInitScript(({ user, seed }) => {
    try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* storage blocked */ }
    for (const [k, v] of Object.entries(seed)) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } }
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/')) {
        const ok = (b) => new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } });
        if (url.includes('/auth/me')) return ok({ success: true, user });
        return ok({ success: true, data: [] });
      }
      return real(input, init);
    };
  }, { user: { ...USER, role, roles: [role] }, seed: { ...seedFor(lessons), [SIDEBAR_KEY]: collapsed } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(UNIT_URL(unitId), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
const dialogFits = (page) => page.evaluate(() => {
  const d = document.querySelector('[data-mission-dialog] [role="dialog"]');
  return d ? d.scrollHeight <= d.clientHeight + 1 : false;
});
const closeDialog = async (page) => { await page.keyboard.press('Escape'); await page.waitForTimeout(150); };

const browser = await chromium.launch();
// the app sidebar OPEN (the default) and collapsed: both must fit
for (const [unitId, mission] of Object.entries(UNIT_MISSIONS)) {
const lessons = Object.keys(mission.icons);
const tag = unitId;
console.log(`\n— unit ${unitId} (${lessons.length} stations)`);
for (const [w, h, collapsed] of [[1366, 768, false], [1024, 768, false], [1024, 768, true], [1920, 1080, false], [1856, 959, true]]) {
  const { ctx, page, errors } = await open(unitId, lessons, { width: w, height: h }, 'student', collapsed);
  const m = await page.evaluate(() => ({
    view: !!document.querySelector('[data-unit-mission-view]'),
    scroll: document.scrollingElement.scrollHeight - document.scrollingElement.clientHeight,
    cut: (() => { const v = document.querySelector('[data-unit-mission-view]').getBoundingClientRect(); const r = document.querySelector('[data-unit-fit]').getBoundingClientRect(); return Math.round(Math.max(0, v.left - r.left, r.right - v.right)); })(),
    zoom: Number(document.querySelector('[data-unit-fit]')?.style.zoom || 1),
    now: document.querySelector('[data-unit-now]')?.getAttribute('data-unit-now'),
    done: document.querySelector('[data-unit-done]')?.getAttribute('data-unit-done'),
  }));
  check(m.view, `${tag} ${w}: the student sees the unit mission view`);
  check(m.scroll <= 1, `${tag} ${w}: the page does not scroll (${m.scroll}px)`);
  check(m.cut <= 1, `${tag} ${w}: nothing is cut on the sides (${m.cut}px)`);
  check(m.now === lessons[3] && m.done === '3', `${tag} ${w}: 3 lessons done, « درسك الآن » is lesson 4 (${m.now}, ${m.done})`);
  if (w === 1920) check(m.zoom > 1.2, `${tag} 1920: the page grows to fill the screen (×${m.zoom})`);
  await page.screenshot({ path: `${OUT}/${tag}-${w}${collapsed ? '-collapsed' : ''}.png` });
  const stations = await page.$$eval('[data-unit-station]', (els) => els.map((e) => e.getAttribute('data-unit-station')).filter((x) => x !== 'challenge'));
  check(stations.length === lessons.length, `${tag} ${w}: ${lessons.length} stations on the path (${stations.length})`);
  for (const id of stations) {
    await page.click(`[data-unit-station="${id}"]`); await page.waitForTimeout(250);
    const folded = await dialogFits(page);
    await page.click('[data-unit-more]'); await page.waitForTimeout(200);
    const more = await dialogFits(page);
    check(folded && more, `${tag} ${w}: window « ${id} » does not scroll (folded ${folded}, « المزيد » ${more})`);
    if (w === 1366 && id === lessons[4]) { await page.click('[data-unit-more]'); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${tag}-window-${id}.png` }); }
    await closeDialog(page);
  }
  for (const chip of ['goals', 'challenge', 'history', 'review']) {
    await page.click(`[data-unit-chip="${chip}"]`); await page.waitForTimeout(250);
    check(await dialogFits(page), `${tag} ${w}: window « ${chip} » does not scroll`);
    await closeDialog(page);
  }
  check(errors.length === 0, `${tag} ${w}: no page error ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
{
  const { ctx, page } = await open(unitId, lessons, { width: 1366, height: 768 }, 'teacher');
  const m = await page.evaluate(() => ({ view: !!document.querySelector('[data-unit-mission-view]'), blocks: document.querySelectorAll('[data-unit-lesson]').length }));
  check(!m.view && m.blocks > 0, `${tag} teacher: keeps the detailed unit page (${m.blocks} lesson blocks)`);
  await ctx.close();
}
}
await browser.close();
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
