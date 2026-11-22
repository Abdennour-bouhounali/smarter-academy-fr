/**
 * The sign-up page while registrations are closed (dev server on :5173): `node e2e/waitlist.mjs <out>`.
 * The API is answered by the walk (nothing is written anywhere): closed → the page shows the message and the phone
 * form, a wrong number is refused on the page, a right one is sent once and the confirmation shows; a student who comes
 * from a class link still gets the sign-up form; open → the form as before.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] ?? '/tmp/waitlist';
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const bad = [];
const open = async ({ status, seed = null }) => {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  const sent = [];
  await ctx.route('**/api/v1/**', (route) => {
    const url = route.request().url();
    if (url.endsWith('/registration')) return route.fulfill({ json: { success: true, ...status } });
    if (url.endsWith('/waitlist')) {
      sent.push(route.request().postDataJSON());
      return route.fulfill({ status: 201, json: { success: true } });
    }
    return route.fulfill({ status: 401, json: { success: false } });
  });
  if (seed) await ctx.addInitScript((s) => Object.entries(s).forEach(([k, v]) => sessionStorage.setItem(k, v)), seed);
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/register', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !document.querySelector('#root .root-spinner'), null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  return { ctx, page, sent };
};

{
  const { ctx, page, sent } = await open({ status: { open: false, classLinks: true } });
  await page
    .waitForSelector('[data-waitlist="form"]', { timeout: 20000 })
    .catch(() => bad.push('closed: the waiting list is not shown'));
  await page.screenshot({ path: `${out}/01-closed.png` });
  if (await page.locator('input[type="password"]').count()) bad.push('closed: the sign-up form is still there');
  await page.fill('[data-waitlist-phone]', 'abc');
  await page.click('button[type="submit"]');
  if (!(await page.locator('[data-waitlist-error]').count())) bad.push('a wrong number is not refused');
  if (sent.length) bad.push('a wrong number was sent');
  await page.fill('[data-waitlist-phone]', '0550 12 34 56');
  await page.click('button[type="submit"]');
  await page
    .waitForSelector('[data-waitlist="done"]', { timeout: 10000 })
    .catch(() => bad.push('no confirmation after a right number'));
  await page.screenshot({ path: `${out}/02-done.png` });
  console.log('sent:', JSON.stringify(sent));
  if (sent.length !== 1 || sent[0].phone !== '0550 12 34 56') bad.push('the number was not sent once');
  await ctx.close();
}
{
  const { ctx, page } = await open({ status: { open: true, classLinks: true } });
  if (!(await page.locator('input[type="password"]').count())) bad.push('open: the sign-up form is not shown');
  if (await page.locator('[data-waitlist]').count()) bad.push('open: the waiting list is shown');
  await ctx.close();
}
console.log(bad.length ? `DEFECTS: ${bad.join(' | ')}` : 'NO DEFECT');
await b.close();
process.exit(bad.length ? 1 : 0);
