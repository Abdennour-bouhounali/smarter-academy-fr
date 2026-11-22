#!/usr/bin/env node
/**
 * THE BRIEF of a lesson — everything a v2 rebuild needs to know about WHAT the lesson must teach, in one page, from the
 * learning net and the catalogue. Nothing here describes the old lesson's pages, story or code: a lesson is rebuilt FROM
 * SCRATCH (owner), so the old version is never read. Printed in a few seconds instead of reading folders and contracts.
 *
 *   node scripts/lesson-brief.mjs <lesson-code> [<lesson-code> …]
 *   npm run lesson:brief -- qasim-mushtarak-akbar
 *
 * It prints: where the lesson sits (grade, unit, term and week), WHAT IT MUST TEACH (the programme items — the competences —
 * and the learning points whose ids `{grade}_{code}_P{n}` stay), what it stands on (core / support prerequisites, with the
 * lesson that teaches each and whether it is already v2), what it must NOT rebuild, where what it teaches is used later,
 * the unit's lessons around it, what already exists beside it (the exercise bank — used AS IT IS, owner 2026-11-18 —, the
 * class test, the pack), and the order of work. Plan: docs/reports/LESSON_V2_MASTER_PLAN.md §9.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  LESSONS,
  getLesson,
  getItem,
  toolsForLesson,
  noRebuildForLesson,
  forwardLinksForLesson,
} from '../packages/core/curriculum/fr/net/learningNet.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'packages/core/curriculum/fr');
const json = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const index = json(path.join(ROOT, 'apps/web/src/lessons/lessonIndex.generated.json')).lessons;
const isV2 = (code) => Boolean(index.find((l) => l.id === code)?.pack);

const codes = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (!codes.length && LESSONS.length === 0) {
  console.log('lesson-brief: the catalogue holds no lesson yet — no brief to print.');
  process.exit(0);
}
if (!codes.length) {
  console.error('usage: node scripts/lesson-brief.mjs <lesson-code> [<lesson-code> …]');
  process.exit(1);
}

/** The folder of a lesson under apps/web/src/lessons (its config is read as DATA, never its pages). */
function lessonDir(grade, code) {
  const walk = (dir, depth) => {
    if (depth > 3 || !fs.existsSync(dir)) return null;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      if (e.name === code && fs.existsSync(path.join(p, 'lesson.config.js'))) return p;
      const hit = walk(p, depth + 1);
      if (hit) return hit;
    }
    return null;
  };
  return walk(path.join(ROOT, 'apps/web/src/lessons/college', grade), 0);
}

/** Term and week of the lesson in the school year (the calendar is renewed every year: YEAR_COMPASS.md). */
function placeInYear(grade, code) {
  const file = path.join(DATA, `calendar/progression_${grade}_2026_2027.json`);
  if (!fs.existsSync(file)) return null;
  const term = Object.fromEntries(
    json(path.join(DATA, 'calendar/school_2026_2027.json')).weeks.map((w) => [w.id, w.term]),
  );
  const week = json(file).weeks.find((w) => w.lessons.includes(code));
  return week ? { week: week.week, term: term[week.week] } : null;
}

/** Every exercise of a lesson's bank, as data (the bank is used AS IT IS: it is read, never rewritten or regenerated). */
function readBank(grade, code) {
  const dir = path.join(ROOT, 'content/practice', grade, code);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) =>
      fs
        .readdirSync(path.join(dir, e.name))
        .filter((f) => f.endsWith('.json'))
        .map((f) => JSON.parse(fs.readFileSync(path.join(dir, e.name, f), 'utf8'))),
    )
    .sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
}
const tally = (list) =>
  Object.entries(list.reduce((m, k) => ((m[k] = (m[k] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
const clip = (text, n) => {
  const t = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
};

const tag = (lesson) =>
  !lesson
    ? '—'
    : `\`${lesson.code}\` ${lesson.title} (${lesson.grade.toUpperCase()}) — ${
        isV2(lesson.code) ? '**v2 ✅**' : lesson.status === 'available' ? 'old lesson' : 'not built'
      }`;

for (const code of codes) {
  const lesson = getLesson(code);
  if (!lesson) {
    console.error(`unknown lesson: ${code}`);
    process.exitCode = 1;
    continue;
  }
  const out = [];
  const say = (s = '') => out.push(s);
  const where = placeInYear(lesson.grade, code);
  const unit = LESSONS.filter((l) => l.unit === lesson.unit && l.grade === lesson.grade);

  say(`# Brief — \`${code}\` — ${lesson.title}`);
  say();
  say(
    `${lesson.grade.toUpperCase()} · unit \`${lesson.unit}\` · lesson ${unit.findIndex((l) => l.code === code) + 1} of ${unit.length}` +
      (where ? ` · term ${where.term}, week ${where.week}` : '') +
      ` · ${isV2(code) ? 'ALREADY v2' : 'to build: from scratch, the old lesson is never read'}`,
  );
  say();

  say('## What it must teach (the competences — the only content that binds)');
  for (const id of lesson.programmeItems) say(`- \`${id}\` — ${getItem(id)?.text ?? '?'}`);
  let skillCount = 0;
  const dir = lessonDir(lesson.grade, code);
  if (dir) {
    try {
      const { LESSON_CONFIG } = await import(pathToFileURL(path.join(dir, 'lesson.config.js')).href);
      if (LESSON_CONFIG?.skills?.length) {
        say();
        say(
          'Learning points as the platform already counts them (the ids STAY: progress and reports read them; the wording is data):',
        );
        skillCount = LESSON_CONFIG.skills.length;
        LESSON_CONFIG.skills.forEach((s, i) => say(`- \`${lesson.grade}_${code}_P${i + 1}\` — ${s}`));
      }
    } catch {
      say('(the config could not be read as data: derive the learning points from the items above)');
    }
  }
  say();

  say('## What it stands on');
  const tools = toolsForLesson(code, { max: 99 });
  if (!tools.length) say('- nothing earlier in the net.');
  for (const t of tools) say(`- **${t.weight ?? 'unclassified'}** \`${t.id}\` — ${t.text}  ⇐ ${tag(t.lesson)}`);
  say();

  say("## What it must NOT rebuild (the net's anti-duplication rule)");
  const noRebuild = noRebuildForLesson(code);
  if (!noRebuild.length) say('- nothing: no item of the lesson extends or repeats an earlier one.');
  for (const n of noRebuild)
    say(
      `- \`${n.item.id}\` ${n.type} \`${n.base.id}\` (${tag(n.baseLesson)})${n.addedValue ? ` — added value: ${n.addedValue}` : ''}`,
    );
  say();

  say('## Where what it teaches is used later');
  const forward = forwardLinksForLesson(code);
  if (!forward.length) say('- no later lesson depends on it.');
  for (const f of forward.slice(0, 8)) say(`- ${tag(f.lesson)} — via ${f.items.map((i) => i.via).join(', ')}`);
  say();

  say('## Around it in the unit');
  unit.forEach((l, i) =>
    say(
      `${i + 1}. ${l.code === code ? '**' : ''}\`${l.code}\` ${l.title}${l.code === code ? '**' : ''} — ${isV2(l.code) ? 'v2 ✅' : l.status}`,
    ),
  );
  say();

  say('## What the exercises ask (the bank, used AS IT IS — the best statement of what a student must be able to DO)');
  const bank = readBank(lesson.grade, code);
  if (!bank.length) say(`- no bank in \`content/practice/${lesson.grade}/${code}/\`.`);
  else {
    const questions = bank.flatMap((e) => e.questions.map((q) => ({ ...q, level: e.level })));
    const levels = [...new Set(bank.map((e) => e.level))];
    const shapes = (list, key) =>
      tally(list.map((q) => q[key]))
        .map(([k, n]) => `${k} ${n}`)
        .join(' · ');
    say(
      `- ${bank.length} exercises, ${questions.length} questions, ${levels.length} levels (served unchanged by the practice space and the exam sitting; never regenerated).`,
    );
    say(`- answer shapes the student must produce: ${shapes(questions, 'answerType')}`);
    say(`- cognitive demand: ${shapes(questions, 'cognitiveDemand')}`);
    say(
      `- situations (tags): ${tally(bank.flatMap((e) => e.metadata?.tags ?? []))
        .slice(0, 8)
        .map(([k, n]) => `${k} ${n}`)
        .join(' · ')}`,
    );
    say();
    say('Per learning point — how the exercises test it (questions as primary / secondary, then by level):');
    const tested = questions.flatMap((q) => q.learningPoints.map((l) => l.code));
    const declared = Array.from({ length: skillCount }, (_, i) => `${lesson.grade}_${code}_P${i + 1}`);
    for (const lp of [...new Set([...declared, ...tested])].sort()) {
      const hit = questions.filter((q) => q.learningPoints.some((l) => l.code === lp));
      if (!hit.length) {
        say(`- \`${lp}\` — **no exercise tests it** (the sitting cannot prove it: say so at the design stop)`);
        continue;
      }
      const primary = hit.filter((q) => q.learningPoints.find((l) => l.code === lp)?.role === 'primary').length;
      const byLevel = tally(hit.map((q) => `L${q.level}`)).sort((a, b) => a[0].localeCompare(b[0]));
      say(
        `- \`${lp}\` — ${primary} primary / ${hit.length - primary} secondary · ${byLevel.map(([l, n]) => `${l}:${n}`).join(' ')} · ${shapes(hit, 'answerType')}`,
      );
    }
    say();
    say("Typical asks, level by level (statements trimmed; the bank's wording is never copied into the lesson):");
    for (const level of levels) {
      const ex = bank.filter((e) => e.level === level);
      const points = ex.map((e) => Number(e.metadata?.exam?.points ?? 0)).filter(Boolean);
      const picks = [0, Math.floor(ex.length / 3), Math.floor((2 * ex.length) / 3), ex.length - 1].filter(
        (v, i, a) => a.indexOf(v) === i,
      );
      say(
        `- level ${level} (${ex.length} exercises${points.length ? `, ${points.reduce((a, b) => a + b, 0)} points` : ''}):`,
      );
      for (const i of picks) {
        const context = clip(ex[i].statement?.content, 70);
        const ask = clip(ex[i].questions[0]?.statement, 80);
        say(`  - ${context && !ask.includes(context) ? `${context} ⟶ ` : ''}${ask}`);
      }
    }
  }
  say();

  say('## What already exists beside it');
  say(
    `- class test: ${fs.existsSync(path.join(ROOT, 'content/class-tests', lesson.grade, `${code}.json`)) ? 'exists' : 'none'}`,
  );
  say(`- pack: ${isV2(code) ? 'yes' : 'none'}`);
  say();

  say('## Work order (waves in parallel — LESSON_V2_MASTER_PLAN.md §9)');
  say(
    '1. design (the keys; one experiment of its own nature per key — GAME_WORLD.md, the inquiry forge) → 2. world content ∥ kit kinds ∥ board → 3. forges ∥ satellites ∥ walks → 4. pack + generators + checks → 5. walks at 1366×768 → 6. trace + delete the old version → commit.',
  );
  console.log(out.join('\n'));
  if (codes.length > 1) console.log('\n---\n');
}
