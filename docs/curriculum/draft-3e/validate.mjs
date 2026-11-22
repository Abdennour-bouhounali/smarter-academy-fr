// Validates the 3e draft: node docs/curriculum/draft-3e/validate.mjs
// No dependency. Builds the net with the real resolver and the catalogue with the real builder,
// then checks the invariants of packages/core/curriculum/fr/net/learningNet.test.js on the draft,
// plus the draft's own rules (2–5 points, one synthesis per unit, FR↔DZ table).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLearningNet, WEIGHTS } from '../../../packages/core/curriculum/fr/net/learningNet.js';
import { buildCourseLevels } from '../../../packages/core/curriculum/coursesData.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '../../..');
const DZ = join(ROOT, '../smarter-academy-dz');
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));

const programme = load(join(HERE, 'official_programme_college.json'));
const net = load(join(HERE, 'learning_net_college.json'));
const units3e = load(join(HERE, 'units_3e_2026_2027.json'));
const lessons3e = load(join(HERE, 'lessons_3e_2026_2027.json'));
const table = load(join(HERE, 'fr_dz_table.json'));

const errors = [];
const warnings = [];
const check = (ok, msg) => { if (!ok) errors.push(msg); };
const section = (title) => console.log(`\n— ${title}`);

// The other grades have no lessons yet: empty files in the shape the resolver reads.
const empty = (grade) => ({ grade, lessons: [] });
const emptyUnits = (grade) => ({ grade, units: [] });
const N = createLearningNet({
  programme,
  net,
  lessonFiles: [empty('6e'), empty('5e'), empty('4e'), lessons3e],
  unitFiles: [emptyUnits('6e'), emptyUnits('5e'), emptyUnits('4e'), units3e],
  weightedGrades: ['3e'],
});

const GRADES = programme.grades.map((g) => g.id);
const items = N.ITEMS;
const itemIds = new Set(items.map((i) => i.id));
const taught3e = items.filter((i) => i.grade === '3e' && !i.horizon && !i.stub);
const horizon = items.filter((i) => i.horizon);
const stubs = items.filter((i) => i.stub);
const lessons = lessons3e.lessons;
const lessonByCode = new Map(lessons.map((l) => [l.code, l]));

// ── items ──
section('programme items');
check(new Set(items.map((i) => i.id)).size === items.length, 'item ids are not unique');
for (const i of items) {
  check(new RegExp(`^(${GRADES.join('|')})\\.m\\d+\\.(r\\d{2}|x\\d+)$`).test(i.id), `bad id format ${i.id}`);
  check(i.id.startsWith(`${i.segment}.`), `${i.id}: segment ${i.segment}`);
  check(N.getSegment(i.segment)?.grade === i.grade, `${i.id}: segment grade`);
  check(i.text?.trim().length > 5, `${i.id}: no text`);
  check(['programme-2020', 'reperes-2019', 'attendus-2019', 'reperes-c3-2019', 'programme-2026'].includes(i.origin), `${i.id}: origin ${i.origin}`);
  check(Number.isInteger(i.page), `${i.id}: page`);
  check(i.verified === false, `${i.id}: verified must be false`);
  if (i.grade === '3e' && !i.horizon) check(['kept', 'absent', 'changed'].includes(i.in2026) && i.in2026Note?.length > 10, `${i.id}: in2026 / in2026Note`);
  if (i.horizon) check(i.horizon === '2028' && /\.x\d+$/.test(i.id) && i.origin === 'programme-2026', `${i.id}: horizon item must be .x<n> from programme-2026`);
  if (i.grade !== '3e') check(i.stub === true, `${i.id}: an item of another grade must be a stub`);
}
for (const s of N.SEGMENTS) {
  const nums = items.filter((i) => i.segment === s.id && i.number != null).map((i) => i.number);
  check(JSON.stringify(nums) === JSON.stringify(nums.map((_, k) => k + 1)), `${s.id}: numbering ${nums}`);
}
for (const g of ['3e']) for (let m = 1; m <= 5; m++) check(N.getSegment(`${g}.m${m}`), `missing segment ${g}.m${m}`);
console.log(`${items.length} items: ${taught3e.length} 3e (2026-2027), ${horizon.length} horizon 2028, ${stubs.length} stubs (${['4e', '5e', '6e'].map((g) => `${g} ${stubs.filter((s) => s.grade === g).length}`).join(', ')})`);

// ── links ──
section('links');
const L = N.LINKS;
const types = Object.keys(net.linkTypes);
const segNumber = (id) => N.getSegment(N.getItem(id).segment).number;
for (const k of L) {
  check(itemIds.has(k.from) && itemIds.has(k.to), `link endpoint missing ${k.from} → ${k.to}`);
  if (!itemIds.has(k.from) || !itemIds.has(k.to)) continue;
  check(k.from !== k.to, `self link ${k.from}`);
  check(types.includes(k.type), `bad type ${k.type}`);
  const gf = GRADES.indexOf(N.getItem(k.from).grade);
  const gt = GRADES.indexOf(N.getItem(k.to).grade);
  check(gf <= gt, `backwards in time ${k.from} → ${k.to}`);
  if (gf === gt) check(segNumber(k.from) <= segNumber(k.to), `backwards segment ${k.from} → ${k.to}`);
  if (k.type !== 'requires') check(N.itemRank(k.from) < N.itemRank(k.to), `${k.type} not strictly earlier ${k.from} → ${k.to}`);
  if (k.type === 'extends') check(k.addedValue?.trim().length > 5, `extends without addedValue ${k.to}`);
  if (k.type === 'consolidates') check(k.note?.trim().length > 5, `consolidates without note ${k.to}`);
  if (N.getItem(k.to).grade === '3e') check(WEIGHTS.includes(k.weight), `link into 3e not weighted ${k.from} → ${k.to}`);
  if (k.weight === 'support') check((k.weightNote ?? '').length > 20, `support without weightNote ${k.from} → ${k.to}`);
  if (k.weight === 'core') check(k.weightNote === undefined, `core with weightNote ${k.from} → ${k.to}`);
  if (N.getItem(k.from).horizon) check(N.getItem(k.to).horizon, `a 2026-2027 item depends on a horizon item ${k.from} → ${k.to}`);
}
const keys = L.map((k) => `${k.from}>${k.to}`);
check(new Set(keys).size === keys.length, 'duplicate link');
const based = L.filter((l) => l.type !== 'requires').map((l) => l.to);
check(new Set(based).size === based.length, `an item has two extends/consolidates bases: ${based.filter((x, i) => based.indexOf(x) !== i)}`);
{ // no cycle
  const out = new Map(items.map((i) => [i.id, []]));
  for (const k of L) out.get(k.from)?.push(k.to);
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') { errors.push(`cycle: ${[...path, id].join(' → ')}`); return; }
    state.set(id, 'open');
    for (const n of out.get(id)) visit(n, [...path, id]);
    state.set(id, 'done');
  };
  for (const i of items) visit(i.id, []);
}
for (const i of items.filter((x) => x.grade === '3e')) check(N.corePrerequisitesOf(i.id).length >= 1, `${i.id} has no core prerequisite`);
for (const s of stubs) check(L.some((k) => k.from === s.id && N.getItem(k.to).grade === '3e'), `stub ${s.id} serves no 3e item`);
const into3e = L.filter((k) => N.getItem(k.to)?.grade === '3e');
const count = (f) => L.filter(f).length;
console.log(`${L.length} links: ${count((k) => k.type === 'requires')} requires, ${count((k) => k.type === 'extends')} extends, ${count((k) => k.type === 'consolidates')} consolidates; into 3e ${into3e.length} (core ${into3e.filter((k) => k.weight === 'core').length}, support ${into3e.filter((k) => k.weight === 'support').length})`);

// ── threads ──
section('threads');
const all = N.THREADS.flatMap((t) => t.items);
check(new Set(all).size === all.length, `an item is in two threads: ${all.filter((x, i) => all.indexOf(x) !== i)}`);
check(all.length === items.length && all.every((id) => itemIds.has(id)), `threads do not partition the items (missing: ${items.filter((i) => !all.includes(i.id)).map((i) => i.id)})`);
console.log(`${N.THREADS.length} threads`);

// ── lessons and units ──
section('lessons and units');
check(new Set(lessons.map((l) => l.code)).size === lessons.length, 'lesson codes not unique');
const unitCodes = units3e.units.map((u) => u.code);
check(new Set([...unitCodes, ...lessons.map((l) => l.code)]).size === unitCodes.length + lessons.length, 'a unit code collides with a lesson code');
for (const l of lessons) {
  check(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.code) && l.code !== 'units', `bad code ${l.code}`);
  check(!/-(3e|6e|5e|4e)$/.test(l.code), `grade suffix ${l.code}`);
  check(l.status === 'coming_soon', `${l.code}: status`);
  check(l.titleSource === 'editorial', `${l.code}: titleSource`);
  for (const f of ['durationMinutes', 'difficulty', 'icon', 'textbookRef']) check(!(f in l), `${l.code}: has ${f}`);
  check(unitCodes.includes(l.unitId), `${l.code}: unknown unit ${l.unitId}`);
  const u = units3e.units.find((x) => x.code === l.unitId);
  check(u && u.chapterId === l.chapterId, `${l.code}: chapterId differs from its unit`);
  for (const id of l.programmeItems) {
    check(itemIds.has(id), `${l.code}: unknown item ${id}`);
    if (itemIds.has(id)) check(N.getItem(id).grade === '3e' && !N.getItem(id).horizon, `${l.code}: declares ${id} (not a 3e item taught in 2026-2027)`);
  }
  if (l.kind === 'synthesis') {
    check(l.programmeItems.length === 0, `${l.code}: a synthesis declares items`);
    check(l.pointsToLearn.length === 1, `${l.code}: a synthesis carries exactly one integrating point`);
  } else {
    check(l.kind === 'lesson', `${l.code}: kind`);
    check(l.programmeItems.length >= 1, `${l.code}: no programme item`);
    check(l.pointsToLearn.length >= 2 && l.pointsToLearn.length <= 5, `${l.code}: ${l.pointsToLearn.length} points (2–5 expected)`);
  }
  for (const p of l.pointsToLearn) {
    check(!/savoir que|comprendre/i.test(p), `${l.code}: vague point « ${p} »`);
    check(/^(?:Se [a-zé]|[A-ZÉÈÀÂ])[a-zéèêàâîôûç’]*(er|ir|re)\b/.test(p), `${l.code}: point does not start with an infinitive « ${p} »`);
  }
  for (const c of l.prerequisiteLessonCodes) {
    check(lessonByCode.has(c), `${l.code}: unknown prerequisite lesson ${c}`);
    if (lessonByCode.has(c)) check(lessonByCode.get(c).order < l.order, `${l.code}: prerequisite ${c} comes later`);
  }
  for (const [k, ids] of Object.entries(l.pointPrerequisites)) {
    const n = Number(k.slice(1));
    check(/^P\d+$/.test(k) && n >= 1 && n <= l.pointsToLearn.length, `${l.code}: pointPrerequisites key ${k}`);
    for (const id of ids) {
      const m = /^3e_([a-z0-9-]+)_P(\d+)$/.exec(id);
      const target = m && lessonByCode.get(m[1]);
      check(target && Number(m[2]) >= 1 && Number(m[2]) <= target.pointsToLearn.length, `${l.code}.${k}: unknown point ${id}`);
      if (target) {
        check(target.order < l.order || (target.code === l.code && Number(m[2]) < n), `${l.code}.${k}: ${id} is not earlier`);
        if (target.code !== l.code && l.kind !== 'synthesis') check(l.prerequisiteLessonCodes.includes(target.code), `${l.code}: point prerequisite on ${target.code} not in prerequisiteLessonCodes`);
      }
    }
  }
}
for (const u of units3e.units) {
  const ls = lessons.filter((l) => l.unitId === u.code).sort((a, b) => a.order - b.order);
  const synth = ls.filter((l) => l.kind === 'synthesis');
  check(synth.length === 1 && ls.at(-1).kind === 'synthesis' && ls.at(-1).code === u.synthesisLessonCode, `${u.code}: must end with exactly one synthesis`);
  check(ls.length >= 4 && ls.length <= 7, `${u.code}: ${ls.length} lessons with its synthesis (3–6 lessons + 1 expected)`);
  check(u.objectives.length >= 3 && u.objectives.length <= 5, `${u.code}: ${u.objectives.length} objectives`);
  check(u.title && u.subtitle, `${u.code}: title / subtitle`);
  const orders = ls.map((l) => l.order);
  check(orders.every((o, i) => i === 0 || o === orders[i - 1] + 1), `${u.code}: lessons not contiguous in the year`);
}
const os = lessons.map((l) => l.order).sort((a, b) => a - b);
check(os.every((o, i) => o === i), 'lesson orders are not 0..n-1');

// home lessons
for (const i of taught3e) check(N.homeLessonOf(i.id), `${i.id} has no home lesson`);
for (const i of [...horizon, ...stubs]) if (N.homeLessonOf(i.id)) errors.push(`${i.id} (horizon/stub) has a 2026-2027 lesson`);
for (const i of horizon) check(lessonByCode.has(i.attachesTo), `${i.id}: attachesTo ${i.attachesTo} unknown`);
const pts = lessons.reduce((n, l) => n + l.pointsToLearn.length, 0);
const syn = lessons.filter((l) => l.kind === 'synthesis').length;
console.log(`${units3e.units.length} units, ${lessons.length} lessons (${lessons.length - syn} + ${syn} syntheses), ${pts} learning points (${pts - syn} in lessons + ${syn} integrating)`);

// lesson order along the net (renvois en avant inside 3e)
const pos = new Map(N.LESSONS.map((l, k) => [l.code, k]));
for (const k of L) {
  const a = N.homeLessonOf(k.from);
  const b = N.homeLessonOf(k.to);
  if (a && b && a.grade === b.grade && pos.get(a.code) > pos.get(b.code)) errors.push(`forward reference: ${k.from} (${a.code}) → ${k.to} (${b.code})`);
}

// resolver behaviour on the draft
for (const l of N.LESSONS.filter((x) => x.kind !== 'synthesis')) {
  check(N.toolsForLesson(l.code).length <= 4, `${l.code}: more than 4 tools`);
  for (const t of N.toolsForLesson(l.code, { max: 9 })) if (t.lesson) check(pos.get(t.lesson.code) < pos.get(l.code), `${l.code}: tool ${t.id} from a later lesson`);
  const groups = N.reviewLinksForLesson(l.code);
  for (const g of groups) check(g.lesson?.code !== l.code, `${l.code}: review link to itself`);
  const ranks = groups.flatMap((g) => g.items.map((i) => N.itemRank(i.id)));
  check(JSON.stringify(ranks) === JSON.stringify([...ranks].sort((a, b) => a - b)), `${l.code}: review links not oldest first`);
}

// catalogue does not contradict the net (learningNet.test.js « cohérence »)
{
  const ancestors = (ids) => {
    const seen = new Set(ids);
    const todo = [...ids];
    while (todo.length) for (const k of N.linksInto(todo.pop())) if (!seen.has(k.from)) { seen.add(k.from); todo.push(k.from); }
    return seen;
  };
  const explained = (a, b) => {
    const ia = lessonByCode.get(a).programmeItems;
    const ib = lessonByCode.get(b).programmeItems;
    if (!ia.length || !ib.length) return true;
    const up = ancestors(ia);
    return ib.some((id) => up.has(id));
  };
  const pairs = new Set();
  for (const l of lessons) {
    if (l.kind === 'synthesis') continue;
    for (const b of l.prerequisiteLessonCodes) pairs.add(`${l.code}<${b}`);
    for (const list of Object.values(l.pointPrerequisites)) for (const lp of list) {
      const b = N.lessonCodeOfLearningPoint(lp);
      if (b && b !== l.code) pairs.add(`${l.code}<${b}`);
    }
  }
  const gaps = [...pairs].filter((p) => { const [a, b] = p.split('<'); return !explained(a, b); });
  for (const g of gaps) errors.push(`catalogue pair not explained by the net: ${g}`);
  console.log(`${pairs.size} lesson pairs checked against the net`);
}

// ── the catalogue builder ──
section('catalogue (buildCourseLevels)');
{
  const skeleton = load(join(ROOT, 'packages/core/curriculum/fr/programme_3e_2026_2027.json'));
  const segs = programme.segments.filter((s) => s.grade === '3e');
  const programme3e = { ...skeleton, domains: skeleton.domains.map((d) => ({ ...d, topics: segs.filter((s) => s.domain === d.id).map((s) => ({ id: s.id, title: s.title })) })) };
  const levels = buildCourseLevels([{ programme: programme3e, lessons: lessons3e, units: units3e }]);
  const grade = levels[0].grades[0];
  const built = grade.chapters.flatMap((c) => c.lessons);
  const builtUnits = grade.chapters.flatMap((c) => c.units);
  check(built.length === lessons.length, `catalogue holds ${built.length} lessons of ${lessons.length}`);
  check(builtUnits.length === units3e.units.length, `catalogue holds ${builtUnits.length} units`);
  for (const u of builtUnits) check(u.synthesis && u.lessons.length + 1 === lessons.filter((l) => l.unitId === u.id).length, `${u.id}: catalogue unit`);
  const lpIds = built.flatMap((l) => l.learningPoints.map((p) => p.id));
  check(new Set(lpIds).size === lpIds.length, 'learning point ids not unique');
  for (const l of built) for (const p of l.learningPoints) for (const q of p.prerequisites) check(lpIds.includes(q.id), `${p.id} ← unknown ${q.id}`);
  const shown = built.filter((l) => l.title !== lessonByCode.get(l.id).title);
  if (shown.length) warnings.push(`coursesData.buildLesson shows the TOPIC title for titleSource « editorial » (it keeps the lesson title only for « textbook »): ${shown.length} of ${built.length} lessons would display a thème title, e.g. ${shown[0].id} → « ${shown[0].title} ». Needs a one-line change in coursesData.js (not done: packages/core is frozen for this task).`);
  console.log(`${grade.chapters.length} chapters, ${builtUnits.length} units, ${built.length} lessons, ${lpIds.length} learning points built`);
}

// ── FR ↔ DZ table ──
section('FR ↔ DZ table');
{
  const dzLessons = {};
  for (const g of ['4am', '3am']) {
    const f = join(DZ, `packages/core/curriculum/dz/lessons_${g}_2026_2027.json`);
    if (!existsSync(f)) { warnings.push(`DZ file not found: ${f} — table not checked`); continue; }
    for (const l of load(f).lessons) dzLessons[`${g}:${l.code}`] = l;
  }
  const packs = new Set();
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else if (n === 'lesson.pack.js') packs.add(dirname(p).split('/').pop()); } };
  const lessonsRoot = join(DZ, 'apps/web/src/lessons/moyen');
  if (existsSync(lessonsRoot)) walk(lessonsRoot);
  const seen = new Set();
  for (const r of table.rows) {
    const key = `${r.fr}>${r.dz}`;
    check(!seen.has(key), `duplicate row ${key}`); seen.add(key);
    check(lessonByCode.has(r.fr) && lessonByCode.get(r.fr).kind === 'lesson', `row: unknown FR lesson ${r.fr}`);
    const dz = dzLessons[`${r.dzGrade}:${r.dz}`];
    check(dz, `row: unknown DZ lesson ${r.dzGrade} ${r.dz}`);
    check(['same', 'same-maths-other-method', 'partial'].includes(r.type), `row ${key}: type`);
    check(r.points.length >= 1, `row ${key}: no point pair`);
    for (const p of r.points) {
      const mf = /^3e_(.+)_P(\d+)$/.exec(p.fr);
      check(mf && mf[1] === r.fr && Number(mf[2]) <= (lessonByCode.get(r.fr)?.pointsToLearn.length ?? 0), `row ${key}: bad FR point ${p.fr}`);
      const md = /^(\d)am_(.+)_P(\d+)$/.exec(p.dz);
      check(md && `${md[1]}am` === r.dzGrade && md[2] === r.dz && dz && Number(md[3]) <= dz.pointsToLearn.length, `row ${key}: bad DZ point ${p.dz}`);
    }
    if (r.type === 'same' || r.type === 'same-maths-other-method') {
      const n = lessonByCode.get(r.fr)?.pointsToLearn.length ?? 0;
      const covered = new Set(r.points.map((p) => p.fr));
      check(covered.size === n, `row ${key}: « ${r.type} » but only ${covered.size} of ${n} FR points are matched`);
    }
    if (packs.size) check(r.dzIsV2 === packs.has(r.dz), `row ${key}: dzIsV2 should be ${packs.has(r.dz)}`);
  }
  const frWith = new Set(table.rows.map((r) => r.fr));
  console.log(`${table.rows.length} rows, ${frWith.size} FR lessons with a counterpart, ${table.rows.filter((r) => r.type === 'same').length} same, ${table.rows.filter((r) => r.type === 'same-maths-other-method').length} same-maths-other-method, ${table.rows.filter((r) => r.type === 'partial').length} partial, ${table.rows.filter((r) => r.dzIsV2).length} with a v2 DZ lesson`);
}

// ── what the delivered test would say ──
section('known limits (not errors of the draft)');
console.log(`- ${stubs.length} stub items and ${horizon.length} horizon items have no home lesson: the shipped test « donne à CHAQUE item officiel une leçon d’accueil » fails on them until 4e/5e/6e lessons exist and horizon items get a lesson or leave the file; its « ordre des classes » test reads homeLessonOf(...).grade and would throw on them.`);
for (const w of warnings) console.log(`- WARNING: ${w}`);

section('result');
if (errors.length) {
  for (const e of errors) console.log(`✗ ${e}`);
  console.log(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log('✓ all checks pass');
