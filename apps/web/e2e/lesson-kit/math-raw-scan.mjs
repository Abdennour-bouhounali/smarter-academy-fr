// Raw-math scan (2026-10-02) — no visible text may still carry a `$…$` island or a LaTeX command outside KaTeX.
// Visits the catalogue, every unit page, every lesson index and every module of every 4AM lesson, walks the
// visible text nodes outside `.katex`, and fails on any `$…$`, raw `\command` or `.katex-error`.
// Owner report: « $x \longmapsto ax + b$ » printed raw on the lesson index, unit page and catalogue —
// fixed by MathLabel / mathToPlain (ARABIC_RTL_CONTRACT.md « Content text outside a module »).
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/math-raw-scan.mjs   (INDEX_ONLY=1 skips modules)
import { readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { BASE, launch, newCtx, seed, lessonKey, check, summary } from './helpers.mjs';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/lessons/moyen/4am');
const cfgs = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n === 'lesson.config.js') cfgs.push(p); } })(ROOT);
const configs = [];
for (const p of cfgs) { const m = await import(pathToFileURL(p).href); if (m.LESSON_CONFIG?.modules?.length) configs.push({ c: m.LESSON_CONFIG, base: m.LESSON_BASE_PATH }); }
const units = [...new Set(configs.map(({ c }) => `${c.chapter}/units/${c.unit}`))];
const jobs = [{ url: `${BASE}/courses?level=moyen&grade=4am`, tag: 'catalogue' }];
for (const u of units) jobs.push({ url: `${BASE}/courses/moyen/4am/${u}`, tag: `unit ${u}` });
for (const { c, base } of configs) {
  jobs.push({ url: `${BASE}${base}`, tag: `${c.id} index`, lesson: c });
  if (!process.env.INDEX_ONLY) for (const m of c.modules) jobs.push({ url: `${BASE}${m.path}`, tag: `${c.id} M${m.number}`, lesson: c });
}
const { browser } = await launch();
const findings = [];
async function run(job) {
  const ctx = await newCtx(browser, {}); const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (job.lesson) await seed(page, job.lesson.modules.map((m) => String(m.number)), lessonKey(job.lesson.id));
  try { await page.goto(job.url, { waitUntil: 'networkidle', timeout: 45000 }); } catch { await page.waitForTimeout(1500); }
  await page.waitForTimeout(800);
  const hits = await page.evaluate(() => {
    const out = [];
    const RE = /\$[^$\n]{1,80}\$|\\(longmapsto|mapsto|dfrac|frac|times|sqrt|leq|geq|neq|text|mathrm|cdot|left|right|begin|end|div|pm|approx|in|infty|ldots|quad|circ)\b/;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode; const el = n.parentElement;
      if (!el || el.closest('.katex, script, style, noscript, textarea')) continue;
      const t = n.textContent; if (!RE.test(t)) continue;
      const vis = el.getClientRects().length > 0;
      out.push({ text: t.trim().slice(0, 160), tag: el.tagName, vis, cls: (el.className?.baseVal ?? el.className ?? '').toString().slice(0, 60) });
    }
    document.querySelectorAll('.katex-error').forEach((e) => out.push({ text: 'KATEX-ERROR ' + (e.getAttribute('title') ?? '') + ' :: ' + e.textContent.slice(0, 100), tag: 'ERR', vis: true }));
    return out;
  });
  for (const h of hits) findings.push({ page: job.tag, url: job.url, ...h });
  await ctx.close();
}
const N = 4; let i = 0;
await Promise.all(Array.from({ length: N }, async () => { while (i < jobs.length) { const j = jobs[i++]; try { await run(j); } catch (e) { findings.push({ page: j.tag, text: 'SCAN-FAIL ' + e.message.slice(0, 100) }); } } }));
await browser.close();
for (const f of findings) check(`${f.page} : formule non rendue`, false, f.text);
check(`${jobs.length} pages : aucune formule brute ni erreur KaTeX`, findings.length === 0, `${findings.length} trouvailles`);
summary();
