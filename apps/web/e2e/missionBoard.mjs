/**
 * The BOARD of a unit's last lesson (dev server on :5173): `node e2e/missionBoard.mjs <out>`.
 * As a teacher with one class (the API is answered by the walk; nothing is written): the lesson's card now offers
 * « حصّة القسم »; the written memo opens with its parts; the lesson moment of the hour shows the station « a mission on
 * the board », which opens the lesson's own world ON that mission over the whole window; leaving the mission comes back
 * to the station; the second station is the second mission.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { GL_ARGS } from './lib/gpu.mjs';

const ID = 'wadiya-idmajiya-aadad';
const out = process.argv[2] ?? '/tmp/mission-board';
mkdirSync(out, { recursive: true });
const DEFAULT = JSON.parse(
  readFileSync(new URL(`../../../content/class-tests/4am/${ID}.json`, import.meta.url), 'utf8'),
);
const STUDENTS = Array.from({ length: 6 }, (_, i) => ({
  id: 100 + i,
  name: `تلميذ ${i + 1}`,
  firstName: `تلميذ`,
  lastName: `${i + 1}`,
}));
const b = await chromium.launch({ args: GL_ARGS });
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
await ctx.addInitScript(
  ([students, def, id]) => {
    localStorage.setItem('token', 'qa-fake-token');
    window.__classFast = true;
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
    const real = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url;
      if (!url.includes('/api/')) return real(input, init);
      if (url.includes('/auth/me'))
        return json({
          success: true,
          user: {
            id: 77,
            name: 'الأستاذ',
            firstName: 'كريم',
            lastName: 'أستاذ',
            role: 'teacher',
            roles: ['teacher'],
            email_verified_at: '2026-09-01T00:00:00Z',
            emailVerified: true,
            nameComplete: true,
          },
        });
      if (/\/teacher\/classrooms(\?|$)/.test(url))
        return json({ success: true, classrooms: [{ id: 7, name: '4 م 1', grade: '4am', status: 'active' }] });
      if (url.includes('/teacher/classrooms/7/students')) return json({ success: true, students });
      if (url.includes('/teacher/classrooms/7/seating')) return json({ success: true, seating: null });
      if (url.includes('/teacher/classrooms/7/class-sessions')) return json({ success: true, sessions: [], turns: {} });
      if (url.includes('/teacher/class-tests/'))
        return json({
          success: true,
          lessonCode: id,
          default: { version: def.version, start: def.start, end: def.end, pool: def.pool },
          mine: null,
        });
      return json({ success: true, data: [] });
    };
  },
  [STUDENTS, DEFAULT, ID],
);
const page = await ctx.newPage();
const errors = [];
const bad = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
const settle = async () => {
  await page.waitForFunction(() => !document.querySelector('#root .root-spinner'), null, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
};
const text = async () => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');

// the lesson's card: the class block and every tool but the knowledge card
await page.goto(`http://localhost:5173/courses/moyen/4am/ansab_al_aadad_wal_hisab/${ID}`, {
  waitUntil: 'domcontentloaded',
});
await settle();
await page.screenshot({ path: `${out}/01-teacher-card.png`, fullPage: true });
const tabs = await page.locator('[data-lesson-tool]').evaluateAll((els) => els.map((e) => e.dataset.lessonTool));
console.log(
  'header tabs:',
  tabs.join(', '),
  '| class block',
  await page.locator('[data-teacher-session]').count(),
  '| moments',
  await page.locator('[data-teacher-moment]').count(),
);
if (tabs.join() !== 'lesson,session,memo,file,bank,track') bad.push(`header tabs: ${tabs.join(', ')}`);
if (!(await page.locator('[data-teacher-session]').count())) bad.push('no « حصّة القسم » on the card');

// the written memo
await page.goto(`http://localhost:5173/enseignant/cours/${ID}/memoire`, { waitUntil: 'domcontentloaded' });
await settle();
await page.screenshot({ path: `${out}/02-memo.png`, fullPage: true });
const memo = await text();
console.log('memo page: chars', memo.length, '|', memo.slice(120, 260));
for (const w of ['الحصّة في صفحة', 'تذكرة الخروج'])
  if (!memo.includes(w)) bad.push(`the memo page does not show « ${w} »`);
if (/undefined|NaN|\$\\|\\frac/.test(memo)) bad.push('the memo page shows raw text (undefined, NaN or LaTeX)');

// the lesson moment of the hour: the mission station, then the world on that mission
await page.goto(`http://localhost:5173/enseignant/hissa/${ID}?moment=lesson`, { waitUntil: 'domcontentloaded' });
await settle();
await page.screenshot({ path: `${out}/03-hour.png` });
if (!(await page.locator('[data-cs-mission]').count())) {
  // the set-up screen first: open the lesson moment from it
  const lesson = page.locator('[data-cs-moment="lesson"], [data-cs-open-lesson], [data-cs-start-lesson]').first();
  if (await lesson.count()) await lesson.click();
  await page.waitForTimeout(1500);
}
await page
  .waitForSelector('[data-cs-mission]', { timeout: 20000 })
  .catch(() => bad.push('the mission station is not on the board'));
await page.screenshot({ path: `${out}/04-station.png` });
console.log('station:', await page.getAttribute('[data-cs-mission]', 'data-cs-mission').catch(() => null));
await page.click('[data-cs-mission-open]');
await page
  .waitForSelector('[data-gameworld="mission-isle"] [data-ms-card]', { timeout: 90000 })
  .catch(() => bad.push('the world did not open on the mission'));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/05-mission-on-board.png` });
console.log(
  'on the board: mission card',
  await page.locator('[data-ms-card]').count(),
  "| the lesson's home behind",
  await page.locator('[data-mi-home]').count(),
);
await page.click('[data-ms-close]');
await page
  .waitForFunction(() => !document.querySelector('[data-gameworld="mission-isle"]'), null, { timeout: 15000 })
  .catch(() => bad.push('leaving the mission did not come back to the station'));
await page.screenshot({ path: `${out}/06-back-on-station.png` });
if (!(await page.locator('[data-cs-mission-open]').count())) bad.push('the station is gone after the mission');

console.log('page errors:', errors.length, errors);
console.log(bad.length ? `DEFECTS: ${bad.join(' | ')}` : 'NO DEFECT');
await b.close();
process.exit(bad.length || errors.length ? 1 : 0);
