// « أتوقّع القاعدة » — predict-rule.mjs generalised to ANY lesson (rollout 2026-10-06).
// Real student account (API :8000). For each content module of the lesson, the modules before it
// are seeded done; an AUTOPILOT then answers the open step (first option of each row / a number) until a
// prediction panel appears (a rejected pick is retried with the row's next option: reload + replay),
// and every panel met is checked: the lesson's OWN prompt is shown (never the generic one), the reveal
// button waits for writing, the palette holds only symbols, the rule
// appears with « توقّعك ». A rule the autopilot cannot reach (a lab must be solved first) is
// reported, not failed. Reset the student's progress row first; publish a draft lesson locally only.
// Run: PREDICT_LESSON=qawasim-adad-tabii KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/predict-lesson.mjs
import { launch, newCtx, check, summary, watchErrors, BASE, SHOT_DIR } from './helpers.mjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CODE = process.env.PREDICT_LESSON;
if (!CODE) { console.error('PREDICT_LESSON=<lesson code> is required'); process.exit(2); }
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
const { LESSON_CONFIG, LESSON_BASE_PATH } = await import(join(DIR, 'lesson.config.js'));
const LESSON = `${BASE}${LESSON_BASE_PATH}`;
const API = process.env.KIT_API || 'http://localhost:8000/api/v1';
const AR = JSON.parse(readFileSync(new URL('../../src/i18n/locales/ar/lesson.json', import.meta.url)));
const GENERIC = AR.predict.prompt;
const only = process.env.PREDICT_MODULES?.split(',').map(Number);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The prompts as written in knowledge.jsx, else on the <PredictRule> of a module (static read: JSX).
const KNOW = readFileSync(join(DIR, 'knowledge.jsx'), 'utf8');
// The authors write the prompt in single OR double quotes (talis-hisab-atwal: "…"), or a template literal.
const PROMPT_RE = /predictPrompt:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/;
const unescapeJs = (s) => s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) => {
  if (e[0] === 'u') return String.fromCodePoint(parseInt(e.replace(/[u{}]/g, ''), 16));
  if (e[0] === 'x' && e.length === 3) return String.fromCharCode(parseInt(e.slice(1), 16));
  return { n: '\n', t: '\t', r: '\r', '\n': '' }[e] ?? e;
});
// A prompt set on the panel itself: <PredictRule id="…" prompt={"…"}> (or prompt="…", JSX: no escapes).
const MODULES = existsSync(join(DIR, 'modules')) ? readdirSync(join(DIR, 'modules')).filter((f) => f.endsWith('.jsx')).map((f) => readFileSync(join(DIR, 'modules', f), 'utf8')) : [];
const ruleProp = (id) => {
  for (const src of MODULES) {
    const at = src.search(new RegExp(`<PredictRule\\b[^>]*?\\bid=(?:"${id}"|'${id}'|\\{['"\`]${id}['"\`]\\})`));
    if (at < 0) continue;
    const tag = src.slice(at, at + 4000);
    const m = tag.match(/\bprompt=(?:\{\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)\s*\}|"([^"]*)"|'([^']*)')/);
    if (m) return m[4] ?? m[5] ?? unescapeJs(m[1] ?? m[2] ?? m[3]);
  }
  return null;
};
const promptOf = (id) => {
  const at = KNOW.search(new RegExp(`id:\\s*['"\`]${id}['"\`]`));
  if (at >= 0) {
    // Only this brick's entry: up to the next brick's `id:` (a brick without a prompt must not borrow its neighbour's).
    const rest = KNOW.slice(at + 3);
    const end = rest.search(/[{,]\s*id:\s*['"`]/);
    const m = rest.slice(0, end < 0 ? undefined : end).match(PROMPT_RE);
    if (m) return unescapeJs(m[1] ?? m[2] ?? m[3]);
  }
  return ruleProp(id);
};
// A fragment of plain Arabic text of the prompt (outside $…$), to recognise it on the page.
const fragment = (p) => (p.split(/\$[^$]*\$/).map((s) => s.trim()).sort((a, b) => b.length - a.length)[0] || '').slice(0, 18);

const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: 'qa-eleve@smarter.dz', password: 'QaPass2026!' }) }).then((x) => x.json());
const TOKEN = login.token ?? login.data?.token;
const UID = login.user?.id ?? login.data?.user?.id;
if (!TOKEN || !UID) { console.error('login failed', login); process.exit(1); }

const { browser } = await launch();
const errors = [];
const seen = new Set();

async function open(done, mobile) {
  const ctx = await newCtx(browser, { mobile });
  await ctx.addInitScript(([token, uid, code, done]) => {
    localStorage.setItem('token', token);
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(`u_${uid}_smarter_lesson_${code}`, JSON.stringify({ completedModules: done, completedExercises: [], layoutVersion: 2 }));
      localStorage.removeItem(`u_${uid}_smarter_predictions_${code}`);
      sessionStorage.setItem('seeded', '1');
    }
  }, [TOKEN, UID, CODE, done]);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  return { ctx, page };
}

// Choice index to try per question row, `${step id}#${row}` → index. A row starts on its first option; a
// rejected pick (pressed option shown ✗ in rose) moves it to the next option and the module is reloaded and
// replayed (a TapQuestion / BatchChoiceQuestion locks after its answer). No answer is read from the source.
const tries = new Map();
const MAX_RELOADS = 6; // per module: a lesson the autopilot passes first time never reloads

/** Answers something in the first open, unfinished step. false = nothing to do. */
async function advance(page) {
  const step = page.locator('section[id^="step-"]:not(.border-emerald-300)').first();
  if (!(await step.count())) return false;
  const sid = await step.getAttribute('id');
  const input = step.locator('input:not([type="range"]):not([type="checkbox"]):visible').first();
  if (await input.count() && await input.isEnabled() && !(await input.inputValue())) {
    await input.fill('1'); // a numeric step answered wrong stays unreachable: its rule is reported, not failed
    const ok = step.getByRole('button', { name: AR.question.ok }).first();
    if (await ok.count() && await ok.isEnabled()) await ok.click(); else await input.press('Enter');
    return true;
  }
  // One pick per row (role="group"): a BatchChoiceQuestion row already answered waits for the other rows —
  // « the first unpressed option » used to toggle the first row forever.
  const groups = step.locator('[role="group"]');
  for (let g = 0, n = await groups.count(); g < n; g++) {
    const grp = groups.nth(g);
    const btns = grp.locator('button[aria-pressed]:visible:enabled');
    const count = await btns.count();
    if (!count || await grp.locator('button[aria-pressed="true"]').count()) continue;
    await btns.nth(Math.min(tries.get(`${sid}#${g}`) ?? 0, count - 1)).click();
    return true;
  }
  const loose = step.locator('xpath=.//button[@aria-pressed="false"][not(@disabled)][not(ancestor::*[@role="group"])]');
  for (let i = 0, n = await loose.count(); i < n; i++) {
    if (await loose.nth(i).isVisible()) { await loose.nth(i).click(); return true; }
  }
  const next = step.getByRole('button', { name: new RegExp(AR.textbook.nextLine) }).first();
  if (await next.count() && await next.isVisible()) { await next.click(); return true; }
  return false;
}

/** The open step is stuck on rejected picks: move each rejected row to its next option. true = retry worth it. */
async function nextTries(page) {
  const step = page.locator('section[id^="step-"]:not(.border-emerald-300)').first();
  if (!(await step.count())) return false;
  const sid = await step.getAttribute('id');
  const picks = await step.locator('[role="group"]').evaluateAll((gs) => gs.map((g) => {
    const bs = [...g.querySelectorAll('button[aria-pressed]')];
    return { n: bs.length, wrong: bs.findIndex((b) => b.getAttribute('aria-pressed') === 'true' && /\brose-/.test(b.className)) };
  }));
  let bumped = false;
  picks.forEach(({ n, wrong }, g) => {
    if (wrong >= 0 && wrong + 1 < n) { tries.set(`${sid}#${g}`, wrong + 1); bumped = true; }
  });
  return bumped;
}

async function checkPanel(page, id, n, mobile) {
  const panel = page.locator(`[data-predict-for="${id}"]`).first();
  const text = (await panel.innerText()).replace(/\s+/g, ' ');
  const own = promptOf(id);
  check(`${CODE} M${n} ${id}: the lesson's own prompt is shown`, own && text.includes(fragment(own)) && !text.includes(GENERIC.slice(0, 20)), own ? fragment(own) : 'no predictPrompt in knowledge.jsx nor prompt on its <PredictRule>');
  const btn = panel.getByRole('button', { name: AR.predict.reveal });
  check(`${CODE} M${n} ${id}: reveal disabled before writing`, await btn.isDisabled());
  const palette = await panel.locator('[data-math-symbols] button').allInnerTexts();
  check(`${CODE} M${n} ${id}: palette is short (rule symbols only)`, palette.length <= 14, JSON.stringify(palette));
  await panel.locator('textarea').fill('أكتب القاعدة بكلماتي هنا');
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}predict-${CODE}-m${n}-${id}${mobile ? '-phone' : ''}.png` });
  check(`${CODE} M${n} ${id}: reveal enabled after writing`, await btn.isEnabled());
  await btn.click();
  await page.locator(`[data-predict-own="${id}"], [data-predict-revealed="${id}"] [data-predict-own]`).first().waitFor({ timeout: 8000 });
  check(`${CODE} M${n} ${id}: the rule appears with « توقّعك »`, true);
  if (mobile) check(`${CODE} M${n} ${id}: phone, no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  seen.add(id);
}

const content = LESSON_CONFIG.modules.filter((m) => !['prerequisite_check', 'evaluation'].includes(m.stage) && m.track !== 'problem' && (!only || only.includes(m.number)));
let k = 0;
for (const mod of content) {
  const mobile = k++ % 2 === 1; // alternate desktop / phone
  const done = LESSON_CONFIG.modules.filter((m) => m.number < mod.number).map((m) => String(m.number));
  const { ctx, page } = await open(done, mobile);
  await page.goto(`${LESSON}/${mod.slug}`, { waitUntil: 'networkidle' });
  check(`${CODE} M${mod.number}: real session`, !page.url().includes('/login'), page.url());
  let idle = 0;
  let reloads = 0;
  for (let it = 0; it < 200 && idle < 3; it++) {
    const pending = page.locator('[data-predict-for]:visible');
    if (await pending.count()) {
      const id = await pending.first().getAttribute('data-predict-for');
      await checkPanel(page, id, mod.number, mobile);
      idle = 0;
      await sleep(400);
      continue;
    }
    const moved = await advance(page).catch(() => false);
    idle = moved ? 0 : idle + 1;
    if (idle === 3 && reloads < MAX_RELOADS && await nextTries(page).catch(() => false)) {
      reloads++;
      await page.reload({ waitUntil: 'networkidle' });
      idle = 0;
      continue;
    }
    await sleep(moved ? 450 : 700);
  }
  await ctx.close();
}

console.log(`\nprompts met in the browser: ${[...seen].join(', ') || '(none)'}`);
check(`${CODE}: at least one predicted rule met`, seen.size > 0);
check('no console/page error', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
