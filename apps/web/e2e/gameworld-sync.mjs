// THE STUDENT'S JOURNEY FOLLOWS HIM — walk of `kit/saveSync.js` and of the world's loading screen (`LessonGameWorld.jsx`).
// Two « devices » (two browser contexts with empty storage) of the SAME student talk to one answers store kept by this
// script (the same merge rule as StudentLessonAnswersController: key by key, the newest `at` wins).
// It checks: device 1 plays and its save reaches the store in pieces; device 2, new, opens on the loading screen and then
// on device 1's island; a server that does not answer never blocks the game; a teacher's preview sends nothing.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_TOUCH=1] node apps/web/e2e/gameworld-sync.mjs [outDir]
import { chromium } from 'playwright';
import { GL_ARGS } from './lib/gpu.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

const BASE = process.env.E2E_BASE || 'http://localhost:5173';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const OUT = process.argv[2] || `${tmpdir()}/gameworld-sync`;
const SIZE = (process.env.E2E_SIZE || '1366x768').split('x').map(Number);
mkdirSync(OUT, { recursive: true });
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
const browser = await chromium.launch({ args: GL_ARGS });
const errors = [];

// ── the answers store of the server, as its controller keeps it ──
const store = {};
let puts = 0;
const merge = (incoming) => { puts += 1; for (const [k, e] of Object.entries(incoming)) if (!store[k] || store[k].at <= e.at) store[k] = e; return store; };

/** A device of the student: empty storage, and an API that is this script's store. `server`: 'ok' | 'slow' | 'down'. */
async function device(name, { server = 'ok', role = 'student' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: SIZE[0], height: SIZE[1] }, ...(process.env.E2E_TOUCH === '1' ? { hasTouch: true, isMobile: true } : {}) });
  await ctx.exposeFunction('__storeGet', () => store);
  await ctx.exposeFunction('__storePut', (incoming) => merge(incoming));
  await ctx.addInitScript(([mode, who]) => {
    window.__paperFast = true; window.__forgeFast = true;
    localStorage.setItem('token', 'qa-fake-token');
    try { localStorage.setItem('u_9411_smarter_launch_kit', JSON.stringify({ lessons: { 'qasim-adad-tabii': { tries: 1 } } })); } catch { /* noop */ } // the launch kit already played
    const real = window.fetch.bind(window);
    const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/answers')) {
        if (mode === 'down') throw new TypeError('Failed to fetch');
        if (mode === 'slow') await new Promise((r) => setTimeout(r, 900));
        if ((init?.method ?? 'GET') === 'PUT') return json({ success: true, answers: await window.__storePut(JSON.parse(init.body).answers) });
        return json({ success: true, answers: await window.__storeGet() });
      }
      if (url.includes('/api/')) return json(url.includes('/auth/me') ? { success: true, user: { id: 9411, name: who === 'teacher' ? 'الأستاذ' : 'تلميذ', firstName: 'كريم', lastName: 'أستاذ', role: who, roles: [who], email_verified_at: '2026-09-01T00:00:00Z', emailVerified: true, nameComplete: true, ...(who === 'student' ? { level: '4am', grade: '4am' } : {}) } } : { success: true, data: [] });
      return real(input, init);
    };
  }, [server, role]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror', name, e.message); });
  return { ctx, page };
}
const stage = (page) => page.evaluate(() => window.__world.getState().stage);
/** The save the store holds, put together by the app's own code (served by the dev server). */
const stored = (page) => page.evaluate(async () => (await import('/src/lessons/common/gameworld/kit/saveSync.js')).fromEntries(await window.__storeGet()));
const WORLD_READY = '[data-di-start], [data-di-continue]';

// ══ 1. device 1: he plays, his journey reaches the server ══
const one = await device('one');
await one.page.goto(LESSON, { waitUntil: 'networkidle' });
await one.page.waitForSelector(WORLD_READY, { timeout: 30000 });
expect(Object.keys(store).length === 0 && await stage(one.page) === 0, 'a first device with nothing on the server starts at the first island');
await one.page.evaluate(() => window.__world.arrive(2)); // he reaches the third island (the story's own `arrive` saves)
await one.page.waitForTimeout(5200); // the push waits a few seconds after the last save
{
  const saved = await stored(one.page);
  expect(saved?.stage === 2 && Number.isInteger(store['world:n']?.v) && Object.keys(store).every((k) => k.startsWith('world:')), `his save is on the server, in ${store['world:n']?.v} piece(s) of the private answers store`);
  expect(Object.values(store).every((e) => JSON.stringify(e.v).length < 6000 && e.at === store['world:n'].at), 'every piece is small enough for the store and carries the time of the save');
  expect(puts <= 2, `a burst of saves is ONE push, not one request per save (${puts} request(s))`);
}
await one.page.screenshot({ path: `${OUT}/01-device-one.png` });

// ══ 2. device 2, new, on a slow network: the loading screen, then HIS island ══
const two = await device('two', { server: 'slow' });
await two.page.goto(LESSON, { waitUntil: 'commit' });
await two.page.waitForSelector('[data-gw-loading]', { timeout: 30000 });
{
  const box = await two.page.evaluate(() => { const el = document.querySelector('[data-gw-loading]'); const r = el.getBoundingClientRect(); return { text: el.textContent, w: r.width, h: r.height, vw: window.innerWidth, vh: window.innerHeight, bar: Boolean(el.querySelector('.gw-loading__bar i')) }; });
  expect(box.text.includes('التعرّف على قاسم') && box.text.includes('نجهّز عالمك') && box.bar && box.w === box.vw && box.h === box.vh, 'while the world arrives the student sees his lesson’s name and a bar that fills — never a blank page');
  await two.page.screenshot({ path: `${OUT}/02-loading.png` });
}
await two.page.waitForSelector(WORLD_READY, { timeout: 30000 });
expect(await stage(two.page) === 2 && await two.page.locator('[data-gw-loading]').count() === 0, 'a NEW device opens on the island he reached on the other one');
await two.page.screenshot({ path: `${OUT}/03-device-two.png` });
// he goes on here: this device's save becomes the newest
await two.page.evaluate(() => window.__world.arrive(4));
await two.page.waitForTimeout(6500);
expect((await stored(two.page))?.stage === 4, 'what he plays on the second device goes back to the server');

// ══ 3. back on device 1: the newer save of the server replaces its own ══
await one.page.reload({ waitUntil: 'networkidle' });
await one.page.waitForSelector(WORLD_READY, { timeout: 30000 });
expect(await stage(one.page) === 4, 'back on the first device, he is where the second one left him');

// ══ 4. a server that does not answer never blocks the game ══
const three = await device('three', { server: 'down' });
await three.page.goto(LESSON, { waitUntil: 'networkidle' });
await three.page.waitForSelector(WORLD_READY, { timeout: 30000 });
expect(await stage(three.page) === 0, 'offline on a new device: the world opens from the browser’s own copy (the beginning), it does not wait');

// ══ 5. a teacher looking at the student's world sends nothing ══
const before = puts;
const teacher = await device('teacher', { role: 'teacher' });
await teacher.page.goto(`${LESSON}?apercu=eleve`, { waitUntil: 'networkidle' });
await teacher.page.waitForSelector(WORLD_READY, { timeout: 30000 });
expect(await stage(teacher.page) === 0, 'the preview plays from the beginning: the student’s journey is not the teacher’s');
await teacher.page.evaluate(() => window.__world.arrive(1));
await teacher.page.waitForTimeout(5200);
expect(puts === before && (await stored(one.page))?.stage === 4, 'a teacher’s preview pushes nothing: the student’s save on the server is untouched');

expect(errors.length === 0, 'no page error');
await browser.close();
