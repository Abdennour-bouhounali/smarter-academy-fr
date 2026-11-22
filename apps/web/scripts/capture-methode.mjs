// Captures RÉELLES de la leçon « التعرّف على قاسم لعدد طبيعي » pour la page
// /methode : chaque station du voyage montre exactement ce que voit l'élève.
// Session simulée (aucune API) : /auth/me renvoie l'enveloppe { success, user }.
// Run : METHODE_BASE=http://localhost:5173 node apps/web/scripts/capture-methode.mjs [probe]
//   puis python3 apps/web/scripts/crop-methode.py — recadre les PNG bruts en
//   WebP dans public/images/methode/lesson/ (les PNG bruts ne sont jamais servis).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.METHODE_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = `${tmpdir()}/methode-capture`;
mkdirSync(OUT, { recursive: true });

const USER = {
  id: 9001, name: 'تلميذ', firstName: 'ياسين', lastName: 'بلقاسم', nameComplete: true, emailVerified: true, email: 'eleve@example.test',
  role: 'student', roles: ['student'], email_verified_at: '2026-09-01T00:00:00Z', level: '4am', grade: '4am',
};

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
await ctx.addInitScript((user) => {
  try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* noop */ }
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/api/')) {
      const body = url.includes('/auth/me') ? { success: true, user } : { success: true, data: [] };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return real(input, init);
  };
}, USER);
// Progression semée pour ouvrir les modules 2 à 4 (sinon « المحور مقفل »).
await ctx.addInitScript(() => {
  const v = JSON.stringify({ completedModules: [0, 1, 2, 3, 4, 5, 6, '00', '01', '02', '03', '04', '05', '06'], completedExercises: [] });
  const id = 'qasim-adad-tabii';
  for (const k of [`smarter_lesson_${id}`, `u_9001_smarter_lesson_${id}`, `u_anon_smarter_lesson_${id}`]) {
    try { if (!localStorage.getItem(k)) localStorage.setItem(k, v); } catch { /* noop */ }
  }
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));

if (process.argv[2] === 'probe') {
  await page.goto(`${LESSON}/al-maktaba`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  console.log('url', page.url(), 'len', (await page.textContent('body')).length);
  await page.screenshot({ path: `${OUT}/_probe.png`, fullPage: true });
}
const shot = async (loc, name) => {
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await loc.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
};

if (process.argv[2] !== 'probe') {
  await page.goto(`${LESSON}/al-maktaba`, { waitUntil: 'networkidle' });
  const m = page.locator('[data-manipulation="team-builder"]').first();
  await m.waitFor();
  const bench = () => m.locator('[data-drop-zone="bench"] [data-drag-source^="player:"]');
  const place = async (count) => {
    for (let i = 0; i < count; i += 1) {
      const p = bench().first();
      if (!(await p.count())) break;
      const sizes = await m.locator('[data-team]').evaluateAll((els) => els.map((e) => Number(e.dataset.teamSize)));
      const k = sizes.indexOf(Math.min(...sizes));
      await p.click();
      await m.locator(`[data-team="${k}"]`).click();
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(500);
  };

  // 1. La situation : la carte « هيا نلعب كرة القدم! ».
  // La carte de contexte : le plus petit ancêtre du titre qui porte aussi le terrain dessiné.
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('body *')].filter((e) => e.textContent.includes('هيا نلعب كرة القدم')).pop();
    let el = h;
    while (el && !(el.offsetWidth > 600 && /rounded/.test(el.className) && el.querySelector('svg'))) el = el.parentElement;
    el?.setAttribute('data-capture', 'situation');
  });
  await shot(page.locator('[data-capture="situation"]'), '1-situation');
  // 2. Le geste : sept joueurs déjà portés sur le terrain.
  await place(7);
  await shot(m, '2-manipulate');
  // 3. 15 joueurs : trois équipes de 5, personne dehors.
  await place(15);
  await shot(m, '3-fifteen');
  // 4. 16 joueurs : le seizième reste sur le banc.
  await m.getByRole('button', { name: /16 لاعب/ }).click();
  await page.waitForTimeout(400);
  await place(16);
  await shot(m, '4-sixteen');
  // 5. La question de découverte, ouverte après les deux cas.
  const disc = m.locator('[data-manipulation-discovery]').first();
  await shot(disc, '5-question');
  // 6. La réponse juste ouvre la règle formelle.
  await disc.getByRole('button').filter({ hasText: /قاسم|قواسم/ }).first().click().catch(() => {});
  await page.waitForTimeout(700);
  await shot(m, '6-discover');

  // 7. معارف : la définition, que l'élève prédit avant de la lire.
  await page.goto(`${LESSON}/maarif`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/7-maarif-full.png`, fullPage: true });
  // 8. أوظّف تعلّماتي et 9. مسألة — pages entières, recadrées ensuite.
  await page.goto(`${LESSON}/awazzif`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/8-awazzif-full.png`, fullPage: true });
  await page.goto(`${LESSON}/masala-1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/9-masala-full.png`, fullPage: true });
}
await browser.close();
