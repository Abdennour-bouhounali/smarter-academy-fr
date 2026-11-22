#!/usr/bin/env node
/**
 * THE BRIEF of a lesson — everything a v2 rebuild needs to know about WHAT the lesson must teach, in one page, from the
 * learning net and the catalogue. Nothing here describes the old lesson's pages, story or code: a lesson is rebuilt FROM
 * SCRATCH (owner), so the old version is never read. Printed in a few seconds instead of reading folders and contracts.
 *
 *   node scripts/lesson-brief.mjs <lesson-code> [<lesson-code> …]
 *   npm run lesson:brief -- racine-carree-en-probleme
 *
 * It prints: where the lesson sits (grade, unit, term and week once the calendar is written), WHAT IT MUST TEACH (the
 * programme items with their official text, and the learning points of the catalogue with their ids
 * `{grade}_{code}_P{n}`, which stay), what it stands on (core / support prerequisites, with the lesson that teaches each —
 * or « no lesson yet » for a stub of a grade that has none), what it must NOT rebuild, where what it teaches is used
 * later, the unit's lessons around it, what already exists beside it (the exercise bank — used AS IT IS —, the class
 * test, the pack), and the order of work (FRANCE_REBUILD_PLAN.md §8).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LESSONS,
  UNITS,
  getLesson,
  homeLessonOf,
  getItem,
  toolsForLesson,
  noRebuildForLesson,
  forwardLinksForLesson,
} from '../packages/core/curriculum/fr/net/learningNet.js';
import { getLessonById } from '../packages/core/curriculum/coursesData.js';

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

/** The folder of a lesson under apps/web/src/lessons/college/<grade>/<theme>/<unit>/<lesson>/, or null. */
function lessonDir(grade, code) {
  const walk = (dir, depth) => {
    if (depth > 3 || !fs.existsSync(dir)) return null;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      if (e.name === code) return p;
      const hit = walk(p, depth + 1);
      if (hit) return hit;
    }
    return null;
  };
  return walk(path.join(ROOT, 'apps/web/src/lessons/college', grade), 0);
}

/** Term and week of the lesson in the school year, or null while the calendar is not written (YEAR_COMPASS.md). */
function placeInYear(grade, code) {
  const file = path.join(DATA, `calendar/progression_${grade}_2026_2027.json`);
  if (!fs.existsSync(file)) return null;
  const term = Object.fromEntries(
    json(path.join(DATA, 'calendar/school_2026_2027.json')).weeks.map((w) => [w.id, w.term]),
  );
  const week = json(file).weeks.find((w) => w.lessons.includes(code));
  return week ? { week: week.week, term: term[week.week] } : null;
}

/** Where an earlier competence is taught: its lesson, or — for a stub — the plain fact that its grade has no lesson. */
const taughtIn = (lesson, noLessonInGrade) =>
  lesson ? tag(lesson) : noLessonInGrade ? `no lesson yet in ${noLessonInGrade}` : '—';
const official = (id) => {
  const item = getItem(id);
  return item ? `${item.text} _(${item.origin}, p. ${item.page})_` : '?';
};

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

function tag(lesson) {
  if (!lesson) return '—';
  const state = isV2(lesson.code)
    ? '**v2 ✅**'
    : lesson.status === 'available'
      ? 'published'
      : 'coming soon, not built';
  return `\`${lesson.code}\` ${lesson.title} (${lesson.grade}) — ${state}`;
}

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
  const unitInfo = UNITS.find((u) => u.code === lesson.unit && u.grade === lesson.grade);
  const entry = getLessonById(code);
  const dir = lessonDir(lesson.grade, code);

  say(`# Brief — \`${code}\` — ${lesson.title}`);
  say();
  say(
    `${lesson.grade} · unit ${unitInfo?.number ?? '?'} « ${unitInfo?.title ?? lesson.unit} » (\`${lesson.unit}\`) · lesson ${unit.findIndex((l) => l.code === code) + 1} of ${unit.length}` +
      (lesson.kind === 'synthesis' ? ' (the unit’s synthesis)' : '') +
      (where
        ? ` · term ${where.term}, week ${where.week}`
        : ' · not placed in the year yet (the calendar is not written)') +
      ` · ${isV2(code) ? 'ALREADY v2' : dir ? `folder exists: ${path.relative(ROOT, dir)}` : `${entry?.status ?? lesson.status}: to build from scratch`}`,
  );
  say();

  say('## What it must teach (the programme items — the only content that binds)');
  if (!lesson.programmeItems.length) say('- no programme item: a synthesis mobilises the capabilities of its unit.');
  for (const id of lesson.programmeItems) say(`- \`${id}\` — ${official(id)}`);
  say();
  say('Learning points (the ids STAY — append-only, learning_points.lock.json):');
  for (const lp of entry?.learningPoints ?? []) {
    const pre = lp.prerequisites.map((p) => `\`${p.id}\``).join(', ');
    say(`- \`${lp.id}\` — ${lp.title}${pre ? `  ⇐ ${pre}` : ''}`);
  }
  say();

  say('## What it stands on (one step back in the net, in the order a launch measures it)');
  const tools = toolsForLesson(code, { max: 99 });
  if (!tools.length) say('- nothing earlier in the net.');
  for (const t of tools)
    say(
      `- **${t.weight ?? 'unclassified'}** \`${t.id}\` (${t.grade}) — ${official(t.id)}  ⇐ ${taughtIn(t.lesson, t.noLessonInGrade)}`,
    );
  // An item the lesson shares with an EARLIER lesson is taught there first: this lesson takes it further.
  for (const id of lesson.programmeItems) {
    const home = homeLessonOf(id);
    if (home && home.code !== code) say(`- shares \`${id}\` with ${tag(home)}, where it is first taught`);
  }
  const before = entry?.prerequisiteLessonCodes ?? [];
  say(
    `- earlier lessons it declares (catalogue): ${before.length ? before.map((c) => `\`${c}\``).join(', ') : 'none'}`,
  );
  say();

  say("## What it must NOT rebuild (the net's anti-duplication rule)");
  const noRebuild = noRebuildForLesson(code);
  if (!noRebuild.length) say('- nothing: no item of the lesson extends or repeats an earlier one.');
  for (const n of noRebuild)
    say(
      `- \`${n.item.id}\` ${n.type} \`${n.base.id}\` — ${n.base.text} (${taughtIn(n.baseLesson, n.baseNoLessonInGrade)})${n.addedValue ? ` — added value: ${n.addedValue}` : ''}${n.note ? ` — ${n.note}` : ''}`,
    );
  say();

  say('## Where what it teaches is used later');
  const forward = forwardLinksForLesson(code);
  if (!forward.length) say('- no later lesson depends on it.');
  for (const f of forward.slice(0, 8))
    say(`- ${tag(f.lesson)} — via ${f.items.map((i) => `${i.via} \`${i.id}\``).join(', ')}`);
  if (forward.length > 8) say(`- … and ${forward.length - 8} more.`);
  say();

  say('## Around it in the unit');
  unit.forEach((l, i) =>
    say(
      `${i + 1}. ${l.code === code ? '**' : ''}\`${l.code}\` ${l.title}${l.code === code ? '**' : ''} — ${isV2(l.code) ? 'v2 ✅' : l.status === 'planned' ? 'coming soon' : l.status}`,
    ),
  );
  say();

  say('## What the exercises ask (the bank, used AS IT IS — the best statement of what a student must be able to DO)');
  const bank = readBank(lesson.grade, code);
  if (!bank.length) say(`- no exercise bank yet (\`content/practice/${lesson.grade}/${code}/\` does not exist).`);
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
    const declared = (entry?.learningPoints ?? []).map((lp) => lp.id);
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

  say('## Work order (waves in parallel — FRANCE_REBUILD_PLAN.md §8, the lesson-v2 skill)');
  say(
    '1. design (the keys; one experiment of its own nature per key — GAME_WORLD.md, the inquiry forge) → 2. world content ∥ kit kinds ∥ board → 3. forges ∥ satellites ∥ walks → 4. pack + generators + checks → 5. walks at 1366×768 → 6. trace → `npm run generate:lesson-index`, the status `available` → commit.',
  );
  console.log(out.join('\n'));
  if (codes.length > 1) console.log('\n---\n');
}
