// QA — « pas d'aller-retour » (propriétaire, 2026-11-11) : dans le lecteur de mission, ce qu'une question demande de regarder est sur SON
// écran. Le balayage parcourt CHAQUE écran de chaque module (bouton « واصل ») et signale :
//   LONE  un écran qui montre une figure et ne demande rien (la question qui en parle est sur un autre écran — sauf un écran de lecture
//         voulu, à justifier dans la section de la leçon de MISSION_ROLLOUT_PROGRESS.md) ;
//   OVER  un écran qui déborde (`data-fit-overflow`) ou fait défiler la page ;
//   PAIR  un écran où la figure et sa question sont côte à côte (ClassroomPaged › pairFigures) — pour regarder les captures.
// Lancement (Vite sur 5173 ; l'API n'est PAS nécessaire — la session est simulée dans la page) :
//   node apps/web/e2e/no-back-and-forth.mjs                       toutes les leçons converties (`studentView: 'mission'`), 1366 et 1024
//   node apps/web/e2e/no-back-and-forth.mjs aksiya-talis jidhr-tarbii   ces leçons seulement
//   QA_WIDTHS=1366 node apps/web/e2e/no-back-and-forth.mjs …
// Code de sortie 1 s'il reste un OVER. Les LONE sont listés (à corriger ou à justifier). Captures dans /tmp/no-back-and-forth-qa.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/no-back-and-forth-qa';
const WIDTHS = (process.env.QA_WIDTHS || '1366,1024').split(',').map(Number);
const SRC = new URL('../src/lessons/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const INDEX = JSON.parse(readFileSync(join(SRC, 'lessonIndex.generated.json'), 'utf8')).lessons;
/** les leçons converties : leur lesson.config.js déclare `studentView: 'mission'` */
function missionLessons(dir = join(SRC, 'moyen')) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    const cfg = join(p, 'lesson.config.js');
    try { if (readFileSync(cfg, 'utf8').includes("studentView: 'mission'")) { out.push(name); continue; } } catch { /* pas une leçon */ }
    out.push(...missionLessons(p));
  }
  return out;
}
const ids = process.argv.slice(2).length ? process.argv.slice(2) : missionLessons();

const USER = { id: 9001, name: 'تلميذ تجريبي', email: 'eleve@example.com', grade: '4am', level: 'moyen', email_verified_at: '2026-01-01T00:00:00Z', nameComplete: true, firstName: 'تلميذ', lastName: 'تجريبي', role: 'student', roles: ['student'] };

async function open(w, seed) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: 768 }, reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.addInitScript(({ user, seed }) => {
    try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* */ }
    for (const [k, v] of Object.entries(seed)) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } }
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/api/')) {
        const ok = (b) => new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } });
        if (url.includes('/auth/me')) return ok({ success: true, user });
        if (/\/lessons\/[^/]+\/answers/.test(url)) return ok({ success: true, answers: {} });
        return ok({ success: true, data: [] });
      }
      return real(input, init);
    };
  }, { user: USER, seed });
  const page = await ctx.newPage();
  return { browser, page };
}

const counts = { LONE: 0, OVER: 0, PAIR: 0 };
for (const w of WIDTHS) {
  for (const id of ids) {
    const L = INDEX.find((l) => l.id === id);
    if (!L) { console.log(`? ${id}: not in lessonIndex.generated.json`); continue; }
    const all = L.modules.map((m) => m[0]);
    // tout est ouvert et déjà « vu » : on lit les écrans, on n'y joue pas
    const seed = { [`u_9001_smarter_lesson_${id}`]: { completedModules: ['00', ...all], completedExercises: [] },
      [`u_9001_smarter_mission_${id}`]: { opened: true, seen: Object.fromEntries(all.map((n) => [n, true])), answered: {} } };
    const { browser, page } = await open(w, seed);
    const vis = (sel) => page.locator(`${sel}:visible`);
    for (const [, slug] of L.modules) {
      try {
        await page.goto(`${BASE}/courses/${L.level}/${L.grade}/${L.chapter}/${id}/${slug}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1200);
        for (let i = 0; i < 60; i += 1) {
          for (let d = 0; d < 3 && await page.locator('[data-mission-dialog]').count(); d += 1) { await page.keyboard.press('Escape'); await page.waitForTimeout(250); }
          // la « محطة المهمة » (MissionCheckpoint) ne se ferme pas par Échap : « لاحقًا » — sans ce clic le module entier n'était pas lu
          const later = page.locator('[data-mission-checkpoint-later]:visible').first();
          if (await later.count()) { await later.click(); await page.waitForTimeout(300); }
          const r = await page.evaluate(() => {
            const shown = (e) => e.offsetParent && e.getBoundingClientRect().width > 40 && e.getBoundingClientRect().height > 40;
            const root = document.querySelector('[data-classroom-paged]');
            if (!root) return null;
            const figs = [...root.querySelectorAll('[data-geo-figure], figure, svg[role="img"]')].filter(shown).filter((f) => !f.closest('[data-manipulation], [data-lab-rounds]'));
            const ans = [...root.querySelectorAll('button, input, [role="radio"]')].filter((e) => e.offsetParent && !e.closest('[data-more-toggle]'));
            return {
              figs: figs.length, ans: ans.length,
              pair: root.querySelectorAll('[data-paging-pair="figure"]:not([data-classroom-page-hidden]), [data-paging-pair="statement"]:not([data-classroom-page-hidden])').length,
              over: document.querySelectorAll('[data-fit-overflow]').length + (document.scrollingElement.scrollHeight > document.scrollingElement.clientHeight ? 1 : 0),
              zoom: [...document.querySelectorAll('[data-fit-zoom]')].map((e) => e.getAttribute('data-fit-zoom')).join(','),
              text: (root.innerText || '').replace(/\s+/g, ' ').slice(0, 70),
            };
          });
          const tag = `${w}-${id}-${slug}-${i}`;
          if (r?.figs && r.ans === 0) { counts.LONE += 1; console.log(`LONE ${tag} « ${r.text} »`); await page.screenshot({ path: `${OUT}/lone-${tag}.png` }); }
          if (r?.pair) { counts.PAIR += 1; console.log(`PAIR ${tag} zoom ${r.zoom}`); await page.screenshot({ path: `${OUT}/pair-${tag}.png` }); }
          if (r?.over) { counts.OVER += 1; console.log(`OVER ${tag} zoom ${r.zoom}`); await page.screenshot({ path: `${OUT}/over-${tag}.png` }); }
          const next = vis('[data-mission-next]').first();
          if (!(await next.count()) || await next.isDisabled()) break;
          const before = page.url();
          try { await next.click({ timeout: 3000 }); } catch { break; }
          await page.waitForTimeout(500);
          if (page.url() !== before && !page.url().includes(`/${slug}`)) break;
        }
      } catch (e) { console.log(`ERR ${w}-${id}-${slug} ${String(e).slice(0, 120)}`); }
    }
    await browser.close();
  }
}
console.log(`\n${ids.length} lessons × ${WIDTHS.join('/')}: LONE ${counts.LONE} · OVER ${counts.OVER} · PAIR ${counts.PAIR} — captures in ${OUT}`);
process.exit(counts.OVER ? 1 : 0);
