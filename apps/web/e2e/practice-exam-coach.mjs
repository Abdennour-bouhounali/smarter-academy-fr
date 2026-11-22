// « مدرّب الامتحان » — the exam coach of the exercise bank, on lesson `qasim-adad-tabii` (pilot), against the REAL API.
// The practice space gets its sessions from the server, so this walk needs a local API and the token of a student:
//   node apps/web/e2e/practice-exam-coach.mjs <outDir> <file containing "TOKEN=<sanctum token>">
// It checks: the exam hall before the sheet, GUIDE mode (the notebook, three nudges, never the solution, a retry),
// EXPLAIN mode (the notebook, the solution told step by step, no retry once it is shown).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const OUT = process.argv[2]; const TOKEN = readFileSync(process.argv[3], 'utf8').replace(/.*TOKEN=/, '').trim();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
await ctx.addInitScript((t) => { localStorage.setItem('token', t); }, TOKEN);
const page = await ctx.newPage();
const expect = (cond, msg) => { if (!cond) { console.log('FAIL', msg); process.exitCode = 1; throw new Error(msg); } console.log('ok  ', msg); };
const coachState = () => page.evaluate(() => ({ after: document.querySelector('[data-coach-after]')?.dataset.coachAfter ?? null, notebook: Boolean(document.querySelector('[data-coach-notebook]')), steps: [...document.querySelectorAll('[data-coach-step]')].map((e) => e.dataset.coachStep), retry: Boolean(document.querySelector('[data-retry]')), solutionPanel: Boolean(document.querySelector('[data-solution-body]')) })); page.on('pageerror', (e) => console.log('pageerror', e.message));
// The server chooses (and resumes) the sheet: the walk answers whatever comes — a written answer or a choice.
let hallSeen = false;
for (let attempt = 0; attempt < 8; attempt += 1) {
  await page.goto('http://localhost:5173/espace/pratique/qasim-adad-tabii', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.click('[data-practice-level]'); await page.waitForSelector('[data-exam-hall], [data-step-start]', { timeout: 20000 }); await page.waitForTimeout(600);
  if (await page.locator('[data-exam-hall]').count()) {
    if (!hallSeen) {
      expect(await page.locator('[data-hall-start][disabled]').count() === 1, 'the exam hall stands before the sheet; « أبدأ الامتحان » waits for a mode and for « ورقتي وقلمي أمامي »');
      await page.screenshot({ path: `${OUT}/bank-hall.png` }); hallSeen = true;
    }
    await page.click('[data-coach-mode="guide"]'); await page.check('[data-hall-ready]'); await page.click('[data-hall-start]'); await page.waitForTimeout(600);
  }
  await page.click('[data-step-start]'); await page.waitForTimeout(900);
  break;
}
expect(hallSeen && await page.locator('[data-exam-hall]').count() === 0, 'the hall is passed, the sheet is open');
expect(await page.locator('[data-coach-strip]').count() === 1 && (await page.textContent('[data-coach-strip]')).includes('بلا موسيقى'), 'above the answer: exam mode, no music, « solve on paper first »');
if (!(await page.textContent('[data-coach-switch]')).includes('أرشدني')) { await page.click('[data-coach-switch]'); await page.click('[data-coach-mode="guide"]'); }
const zone = '[data-answer-form]';
console.log('fields', JSON.stringify(await page.evaluate((z) => [...document.querySelectorAll(`${z} math-field, ${z} input:not([type=file]), ${z} textarea, ${z} [role=radio], ${z} [data-choice], ${z} label`)].map((e) => [e.tagName, e.type ?? '', Object.keys(e.dataset).join(','), (e.textContent || '').trim().slice(0, 20)]), zone)).slice(0, 600));
const state = async (label) => console.log(label, JSON.stringify(await page.evaluate(() => ({ after: document.querySelector('[data-coach-after]')?.dataset.coachAfter ?? null, notebook: Boolean(document.querySelector('[data-coach-notebook]')), guide: document.querySelector('[data-coach-guide]')?.dataset.coachGuide ?? null, explain: document.querySelector('[data-coach-explain]')?.dataset.coachExplain ?? null, steps: [...document.querySelectorAll('[data-coach-step]')].map((e) => e.dataset.coachStep), retry: Boolean(document.querySelector('[data-retry]')), solutionPanel: Boolean(document.querySelector('[data-solution-body]')), feedback: (document.querySelector('[data-feedback], [data-feedback-panel]')?.textContent ?? '').slice(0, 80) }))));
/** Answers the current question once: a wrong value in the maths fields, and/or the k-th choice. */
const answerOnce = async (k) => {
  if (await page.locator(`${zone} math-field`).count()) await page.evaluate((z) => { const all = [...document.querySelectorAll(`${z} math-field`)]; for (const el of all) { el.value = el === all.at(-1) ? '1' : '48=6\\times8+0\\quad 48=5\\times9+3'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } }, zone);
  const choices = page.locator(`${zone} button[aria-pressed]`); const n = await choices.count();
  if (n) await choices.nth(k % n).click();
  await page.waitForTimeout(300); await page.click('[data-validate]'); await page.waitForTimeout(2500);
};
/** Answers until an answer is WRONG (a choice may happen to be right: then the walk moves to the next question). */
const wrong = async () => {
  for (let k = 0; k < 10; k += 1) {
    await answerOnce(k);
    if (await page.locator('[data-coach-after]').count()) return;
    await page.click('[data-next]'); await page.waitForTimeout(900);
    if (await page.locator('[data-step-start]').count()) { await page.click('[data-step-start]'); await page.waitForTimeout(900); }
  }
  throw new Error('no wrong answer could be produced');
};
await wrong(); await state('GUIDE after a wrong answer');
{ const c = await coachState(); expect(c.after === 'guide' && c.notebook && c.steps.join() === 'reread' && c.retry && !c.solutionPanel, 'GUIDE: a wrong answer brings the notebook and a first nudge — no solution — and the sheet lets the student try again'); }

if (await page.locator('[data-coach-next]').count()) { await page.click('[data-coach-next]'); await page.click('[data-coach-next]'); }
await state('GUIDE all nudges');
{ const c = await coachState(); expect(c.steps.join() === 'reread,rule,trap' && !c.solutionPanel && (await page.locator('[data-coach-step="line"], [data-coach-step="result"]').count()) === 0, 'GUIDE: three nudges — re-read, the rule, the trap — and never a line of the solution'); } await page.locator('[data-coach-after]').screenshot({ path: `${OUT}/bank-guide.png` });
console.log('guide text has no solution:', await page.evaluate(() => { const g = document.querySelector('[data-coach-after]')?.textContent ?? ''; return g.length; }));
await page.click('[data-coach-wrote]'); 
await page.click('[data-retry]'); await page.waitForTimeout(700); await state('after retry');
expect((await coachState()).after === null && await page.locator('[data-validate]').count() === 1, 'the retry reopens the question');
await page.click('[data-coach-switch]'); await page.click('[data-coach-mode="explain"]'); await page.waitForTimeout(300);
await wrong(); await state('EXPLAIN after a wrong answer');
{ const c = await coachState(); expect(c.after === 'explain' && c.notebook && c.steps.join() === 'asked' && !c.retry, 'EXPLAIN: a wrong answer brings the notebook and the first step « ما المطلوب؟ »; no retry once the solution is being shown'); }
for (let i = 0; i < 12 && await page.locator('[data-coach-next]').count(); i += 1) await page.click('[data-coach-next]');
await state('EXPLAIN all steps');
{ const c = await coachState(); expect(c.steps[0] === 'asked' && c.steps[1] === 'rule' && c.steps.includes('line') && c.steps.includes('trap') && c.steps.includes('exam') && c.steps.at(-1) === 'write', 'EXPLAIN: what is asked, the rule, each written line, the trap, the exam tip, then « now write it yourself »'); }
await page.evaluate(() => document.querySelector('[data-coach-after]').scrollIntoView({ block: 'start' })); await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/bank-explain.png` });
await browser.close();
