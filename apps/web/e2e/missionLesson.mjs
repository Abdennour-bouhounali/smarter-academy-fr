/**
 * The REAL address of a unit's last lesson (dev server on :5173): `node e2e/missionLesson.mjs <out>`.
 * A student opens « أدمج تعلّماتي » of 4AM unit 1: the page is its island (world « mission-isle ») with its three
 * missions, and an address of its old module pages brings him to the same home — never an old page, never a 404.
 */
import { createWalk, lessonUrl } from './lib/walk.mjs';

const ID = 'wadiya-idmajiya-aadad';
const url = lessonUrl('ansab_al_aadad_wal_hisab', ID);
const walk = createWalk('mission-lesson', { pilot: true, fontFloor: false });
const bad = [];
for (const [name, address] of [
  ['lesson-address', url],
  ['old-module-address', `${url}/wadiya-1`],
  ['old-test-address', `${url}/ahill`],
]) {
  const { page, ctx } = await walk.student({ uid: 9301, lessonId: ID, url: address });
  await page
    .waitForSelector('[data-gameworld="mission-isle"] [data-mi-home]', { timeout: 60000 })
    .catch(() => bad.push(`${name}: the island's home is not on screen`));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${walk.out}/${name}.png` }).catch(() => {});
  const cards = await page.locator('[data-mi-card]').count();
  const old = await page.locator('[data-module-root], .lesson-module, [data-mission-player]').count();
  console.log(
    `${name} | mission cards ${cards} | old page on screen ${old} | address ${new URL(page.url()).pathname.split('/').pop()}`,
  );
  if (cards !== 3) bad.push(`${name}: ${cards} mission cards`);
  await ctx.close();
}
// THE TEACHER'S PAGE of the lesson: his card, and nothing of the deleted version (no module list, no old situation)
{
  const { chromium } = await import('playwright');
  const { GL_ARGS } = await import('./lib/gpu.mjs');
  const browser = await chromium.launch({ args: GL_ARGS });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.addInitScript(() => {
    localStorage.setItem('token', 'qa-fake-token');
    const user = {
      id: 77,
      name: 'الأستاذ',
      firstName: 'كريم',
      lastName: 'بن علي',
      role: 'teacher',
      roles: ['teacher'],
      email: 'prof@example.test',
      email_verified_at: '2026-09-01T00:00:00Z',
    };
    const real = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const u = typeof input === 'string' ? input : input.url;
      if (!u.includes('/api/')) return real(input, init);
      const res = u.includes('/auth/me') ? { success: true, user } : { success: true, data: [], classrooms: [] };
      return new Response(JSON.stringify(res), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#root .root-spinner'), null, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${walk.out}/teacher-page.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  const old = ['مسار المحاور', 'الوضعية التدريبية', 'مئزر', 'أتحقّق من مكتسباتي'].filter((w) => text.includes(w));
  console.log(
    'teacher page | words of the deleted version:',
    old.length ? old.join(' ، ') : 'none',
    '| « للأستاذ » card:',
    text.includes('للأستاذ'),
  );
  if (old.length) bad.push(`the teacher's page still shows: ${old.join(' ، ')}`);
  // his header shows only the tools that have content (no knowledge card: the lesson has none); no site footer, no floating notebook
  const tabs = await page.locator('[data-lesson-tool]').evaluateAll((els) => els.map((e) => e.dataset.lessonTool));
  console.log(
    'header tabs:',
    tabs.join(', '),
    '| memo door',
    await page.locator('[data-teacher-memo]').count(),
    '| footer',
    text.includes('Abdennour'),
    '| « كرّاسي »',
    text.includes('كرّاسي'),
  );
  if (tabs.join() !== 'lesson,session,memo,file,bank,track') bad.push(`header tabs: ${tabs.join(', ')}`);
  if (text.includes('Abdennour') || text.includes('كرّاسي'))
    bad.push('the footer or the floating notebook is still on the page');
  // « ما يتعلّمه تلاميذك » leads to the tracking of the class on this lesson, and so does the door « متابعة »
  if (!(await page.locator('[data-teacher-track]').count())) bad.push('no tracking door on the card');
  await page.click('[data-teacher-learns-track]');
  await page
    .waitForFunction(() => location.pathname.includes('/enseignant/mutabaa/'), null, { timeout: 20000 })
    .catch(() => bad.push('« ما يتعلّمه تلاميذك » does not open the tracking'));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${walk.out}/teacher-tracking.png` });
  console.log('tracking page:', (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(-120));
  await page.goBack();
  await page.waitForSelector('[data-teacher-bank]', { timeout: 20000 });
  // « بنك التمارين » is the teacher's own bank (read, show on the board, print), as for the other v2 lessons
  await page.click('[data-teacher-bank]');
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page
    .waitForFunction(() => document.body.innerText.includes('بنك تمارين الدرس'), null, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${walk.out}/teacher-bank.png` });
  const bank = await page.evaluate(() => ({
    own: document.querySelectorAll('[data-teacher-exercise-bank], [data-teb], .teb').length,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260),
  }));
  console.log('bank page:', bank.text.slice(90, 200));
  if (!bank.text.includes('بنك تمارين الدرس')) bad.push("the teacher's own bank did not open");
  // an exercise goes to the board of the class even though the lesson has no board script yet
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await page.getByText('على السبّورة').first().click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${walk.out}/teacher-exercise-on-board.png` });
  const board = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  console.log(
    'exercise on the board | chars',
    board.length,
    '| errors',
    errs.length,
    errs[0] ?? '',
    '|',
    board.slice(0, 120),
  );
  if (errs.length || board.length < 80 || board.includes('Cannot read'))
    bad.push('the exercise did not open on the board');
  await browser.close();
}
console.log(bad.length ? `DEFECTS: ${bad.join(' | ')}` : 'NO DEFECT');
process.exit(bad.length ? 1 : 0);
