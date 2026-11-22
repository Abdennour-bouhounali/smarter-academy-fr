// « مسائل » — the pilot test (masail-pilot.mjs) generalised to ANY lesson (rollout 2026-10-06).
// Real student account (API :8000), answers deliberately WRONG everywhere: the guided path must
// still advance (non-blocking), every problem module complete, NO evidence request leave, and the
// test stay open. Reset the student's student_lesson_progress row for the lesson first, and
// publish a draft lesson locally only for the run (docs/lessons/MASAIL_GENERATION_GUIDE.md §8.3).
// Run: MASAIL_LESSON=qawasim-adad-tabii KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/masail-lesson.mjs
import { launch, newCtx, check, summary, watchErrors, BASE, SHOT_DIR } from './helpers.mjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CODE = process.env.MASAIL_LESSON;
if (!CODE) { console.error('MASAIL_LESSON=<lesson code> is required'); process.exit(2); }
const ROOT = new URL('../../src/lessons/moyen/4am/', import.meta.url).pathname;
function findDir(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (e.name === CODE && existsSync(join(p, 'lesson.config.js'))) return p;
    const r = findDir(p);
    if (r) return r;
  }
  return null;
}
const DIR = findDir(ROOT);
if (!DIR) { console.error(`lesson ${CODE} not found`); process.exit(2); }
const { LESSON_CONFIG, LESSON_BASE_PATH } = await import(join(DIR, 'lesson.config.js'));
const { PROBLEMS } = await import(join(DIR, 'content/problems.js'));
const problemModules = LESSON_CONFIG.modules.filter((m) => m.track === 'problem');
const evaluation = LESSON_CONFIG.modules.find((m) => m.stage === 'evaluation');
const module1 = LESSON_CONFIG.modules.find((m) => m.number === 1);
const first = problemModules[0].number;

const API = process.env.KIT_API || 'http://localhost:8000/api/v1';
const LESSON = `${BASE}${LESSON_BASE_PATH}`;
const AR = JSON.parse(readFileSync(new URL('../../src/i18n/locales/ar/lesson.json', import.meta.url)));
const SHOT = `masail-${CODE}`;

const login = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: 'qa-eleve@smarter.dz', password: 'QaPass2026!' }),
}).then((r) => r.json());
const TOKEN = login.token ?? login.data?.token;
const UID = login.user?.id ?? login.data?.user?.id;
if (!TOKEN || !UID) { console.error('login failed', login); process.exit(1); }

const { browser } = await launch();
const errors = [];
const evidence = [];
const before = LESSON_CONFIG.modules.filter((m) => m.number < first).map((m) => String(m.number));

async function openCtx({ mobile = false } = {}) {
  const ctx = await newCtx(browser, { mobile });
  await ctx.addInitScript(([token, uid, code, done]) => {
    localStorage.setItem('token', token);
    // Every module before the مسائل done, in the current layout (layoutVersion 2).
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(`u_${uid}_smarter_lesson_${code}`, JSON.stringify({ completedModules: done, completedExercises: [], layoutVersion: 2 }));
      sessionStorage.setItem('seeded', '1');
    }
  }, [TOKEN, UID, CODE, before]);
  ctx.on('request', (req) => { if (req.method() === 'POST' && /\/api\/v1\/.*(evidence|final-test-attempt)/.test(req.url())) evidence.push(req.url()); });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  return { ctx, page };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Answers ONE open sub-step, always wrongly when it can. */
async function answerWrong(page, li, problem, step) {
  const role = await li.getAttribute('data-problem-substep');
  if (role === 'extract') {
    for (const d of problem.data) {
      await li.locator(`[aria-label="${d.text}"]`).first().click();
      await li.locator(`[data-drop-zone="utile"]`).click({ position: { x: 12, y: 12 } });
    }
    await li.getByRole('button', { name: AR.infoSorter.check }).click();
  } else if (role === 'translate' || role === 'conclude') {
    const opts = li.locator('button').filter({ hasNotText: AR.textbook.nextLine });
    const n = await opts.count();
    // A wrong option: the last one, or the first when the last is the right one.
    const wrong = step.correct === (step.options.length - 1) ? 0 : n - 1;
    await opts.nth(wrong).click();
  } else if ((role === 'compute' || role === 'answer') && await li.locator('input').count()) {
    await li.locator('input').fill(String((step.expected ?? 0) + 1));
    await li.getByRole('button', { name: AR.question.ok }).click();
  } else if (role === 'answer') {
    const groups = li.locator('[role="group"]');
    for (let g = 0; g < await groups.count(); g++) {
      const r = step.rows?.[g];
      await groups.nth(g).locator('button').nth(r && r.correct === 0 ? 1 : 0).click();
    }
  } else if (role === 'written') {
    const show = li.getByRole('button', { name: new RegExp(AR.problem.write.show) });
    check('written: « أظهر » disabled while nothing is written', await show.isDisabled());
    await li.locator('textarea').fill('أحسب ثم أستنتج الجواب');
    await show.click();
    const next = li.getByRole('button', { name: new RegExp(AR.problem.write.next) });
    let lines = 1;
    while (await next.count()) { await next.click(); lines++; await sleep(80); }
    check('written: model revealed line by line, own text kept',
      (await li.locator('[data-model-line]').count()) === lines && lines === step.lines.length && (await li.locator('[data-written-own]').innerText()).includes('أستنتج'));
  }
  await sleep(250);
}

async function solveProblemModule(page, mod, problem, prefix) {
  const n = mod.number;
  await page.goto(`${LESSON}/${mod.slug}`, { waitUntil: 'networkidle' });
  check(`M${n}: brief carries the whole statement`, (await page.locator('[data-problem-statement]').innerText()).replace(/\s+/g, ' ').length > 40);
  if (problem.figure || problem.visual || problem.table) {
    check(`M${n}: the brief draws the statement support`, (await page.locator('[data-problem-statement]').locator('[data-geo-figure], [data-space-figure], [data-problem-visual] svg, [data-problem-table]').count()) >= 1);
  }
  for (let p = 0; p < problem.parts.length; p++) {
    const part = page.locator(`[data-problem-part="${p + 1}"]`);
    await part.waitFor({ timeout: 10000 });
    const asks = problem.parts[p].asks.length;
    const slots = await part.locator('[data-problem-ask]').evaluateAll((els) => new Set(els.map((e) => e.getAttribute('data-problem-ask'))).size);
    check(`M${n} part ${p + 1}: ${asks} demand(s) listed, each with its answer slot visible at opening`,
      (await part.locator('[data-problem-ask-item]').count()) === asks && slots === asks);
    if (p === 1) await part.screenshot({ path: `${SHOT_DIR}${prefix}-m${n}-part2-open.png` });
    for (let i = 0; i < problem.parts[p].steps.length; i++) {
      const li = part.locator('[data-problem-substep]').nth(i);
      await part.locator(`[data-problem-substep]:nth-child(${i + 1})[data-substep-locked="false"]`).waitFor({ timeout: 5000 });
      await li.scrollIntoViewIfNeeded();
      if (p === 0 && i === 1) await page.screenshot({ path: `${SHOT_DIR}${prefix}-m${n}-part1.png` });
      await answerWrong(page, li, problem, problem.parts[p].steps[i]);
      check(`M${n} part ${p + 1} sub-step ${i + 1}: done despite a wrong answer`, (await li.getAttribute('data-substep-done')) === 'true');
    }
  }
  const answered = await page.locator('[data-problem-ask-item][data-answered="true"]').count();
  check(`M${n}: every demand ticked at the end`, answered === problem.parts.reduce((a, pt) => a + pt.asks.length, 0));
  await page.screenshot({ path: `${SHOT_DIR}${prefix}-m${n}-done.png`, fullPage: true });
  await sleep(600);
  const stored = await page.evaluate(([uid, code]) => JSON.parse(localStorage.getItem(`u_${uid}_smarter_lesson_${code}`) || '{}'), [UID, CODE]);
  check(`M${n}: module marked completed`, stored.completedModules?.includes(String(n)), JSON.stringify(stored.completedModules));
}

// ── Desktop: index, the three مسائل, the test, module 1 ────────────────
{
  const { ctx, page } = await openCtx();
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  check('real session (no /login redirect)', !page.url().includes('/login'), page.url());
  const card = page.locator('[data-lesson-problem]');
  check('index: « مسألة الدرس » card visible', await card.isVisible());
  check('index: the card links to مسألة 1', (await card.locator('a').getAttribute('href'))?.endsWith(`/${problemModules[0].slug}`));
  const lp = LESSON_CONFIG.lessonProblem;
  if (lp.figure || lp.visual || lp.table) {
    await card.locator('[data-geo-figure], [data-space-figure], [data-problem-visual], [data-problem-table]').first().waitFor({ timeout: 10000 });
    check('index: the card draws the statement support (figure / graph / table)', (await card.locator('[data-geo-figure], [data-space-figure], [data-problem-visual] svg, [data-problem-table]').count()) >= 1);
  }
  await card.screenshot({ path: `${SHOT_DIR}${SHOT}-index-card.png` });

  for (let k = 0; k < 3; k++) await solveProblemModule(page, problemModules[k], PROBLEMS[k], `${SHOT}-desktop`);

  check('no evidence/final-test request during the مسائل', evidence.length === 0, evidence.join(', '));
  await page.goto(`${LESSON}/${evaluation.slug}`, { waitUntil: 'networkidle' });
  check(`the test (module ${evaluation.number}) is open`, !page.url().includes('/login') && (await page.locator('body').innerText()).includes('إختبار'));
  await page.goto(`${LESSON}/${module1.slug}`, { waitUntil: 'networkidle' });
  check('module 1 (revisit): no « مسألة الدرس » card inside a module (sommaire only, 2026-10-09)', (await page.locator('[data-lesson-problem]').count()) === 0);
  await ctx.close();
}

// ── Phone: no horizontal overflow ─────────────────────────────────────
{
  const { ctx, page } = await openCtx({ mobile: true });
  await page.goto(LESSON, { waitUntil: 'networkidle' });
  check('phone: index without horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  for (const mod of problemModules) {
    await page.goto(`${LESSON}/${mod.slug}`, { waitUntil: 'networkidle' });
    await page.locator('[data-problem-part="1"]').waitFor({ timeout: 10000 });
    check(`phone: ${mod.slug} without horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `${SHOT_DIR}${SHOT}-phone-${mod.slug}.png`, fullPage: true });
  }
  await ctx.close();
}

check('no console/page error', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
