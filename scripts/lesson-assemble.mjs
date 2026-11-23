#!/usr/bin/env node
/**
 * THE ASSEMBLY OF A v2 LESSON — everything outside the lesson's folder that makes the tree accept it (what commit
 * be86718d did by hand for the first lesson), from a folder that `npm run lesson:new` scaffolded and the content agents
 * filled. The pure parts: scripts/lib/lessonAssemble.mjs.
 *
 *   npm run lesson:assemble -- <code>            does it; a second run changes nothing
 *   npm run lesson:assemble -- <code> --check    says what would change; exits 1 if something would
 *
 * In order: refuses while a file of the lesson still says « SCAFFOLD: not written yet »; puts the `.draft` files in
 * place and deletes the stubs' helper; the catalogue status (`coming_soon` → `available`); the lesson's folder in
 * `format:v2` and `check:format`; the generators (lesson index, lab order, learning net, compass index — each run only
 * when its own --check says it is stale); the KEPT lines of check-unreached / check-unused and the baseline lines of
 * check-unused that the lesson made stale; check-routes; then the lesson's status line and what still needs a human.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HELPER, findLesson, formatted, lessonDir } from './lib/lessonScaffold.mjs';
import {
  addToScriptLists,
  applyDraftPlan,
  draftPlan,
  parseUnreached,
  parseUnused,
  removeBaselineEntries,
  removeKeptEntries,
  setCatalogueStatus,
  unfinishedFiles,
} from './lib/lessonAssemble.mjs';

const args = process.argv.slice(2);
const code = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--root');
const root = path.resolve(
  args.includes('--root')
    ? args[args.indexOf('--root') + 1]
    : path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
);
const check = args.includes('--check');
if (!code) {
  console.error('usage: npm run lesson:assemble -- <lesson code> [--check]');
  process.exit(2);
}

const abs = (rel) => path.join(root, rel);
const read = (rel) => fs.readFileSync(abs(rel), 'utf8');
const changes = [];
const todo = [];
let failed = false;
const step = (title) => console.log(`\n▸ ${title}`);
const change = (what) => {
  changes.push(what);
  console.log(`  ${check ? 'would change' : 'changed'}: ${what}`);
};
const write = (rel, text) => {
  if (!check) fs.writeFileSync(abs(rel), text);
};
const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};

const info = findLesson(root, code);
if (!info) {
  console.error(`lesson:assemble — « ${code} » is in no catalogue of packages/core/curriculum/fr/`);
  process.exit(1);
}
const dir = lessonDir(info);
if (!fs.existsSync(abs(dir))) {
  console.error(
    `lesson:assemble — ${dir} does not exist: npm run lesson:new -- ${code} --world <world>, then write it`,
  );
  process.exit(1);
}
console.log(`lesson:assemble${check ? ' --check' : ''} — « ${info.title} » (${dir})`);

// 1. nothing of the scaffold is left unwritten
step('the content is written');
const unfinished = unfinishedFiles(abs(dir));
if (unfinished.length) {
  console.error(`  ✗ ${unfinished.length} file(s) still say « SCAFFOLD: not written yet » or import ${HELPER}:`);
  for (const f of unfinished) console.error(`    ${dir}/${f}`);
  console.error('  Write them first; nothing was assembled.');
  process.exit(1);
}
console.log('  ✓ no stub left');

// 2. the drafts in place, the stubs' helper gone
step('the files the tree discovers by name');
const plan = draftPlan(abs(dir));
for (const r of plan.renames) change(`${dir}/${r.from} → ${r.to}`);
for (const r of plan.rewrites) change(`${dir}/${r.file}: its imports of the drafts`);
if (!check) applyDraftPlan(abs(dir), plan);
if (fs.existsSync(abs(`${dir}/${HELPER}`))) {
  change(`${dir}/${HELPER} deleted`);
  if (!check) fs.rmSync(abs(`${dir}/${HELPER}`));
}
for (const f of ['lesson.config.js', 'lesson.pack.js', 'routes.jsx', 'index.jsx', 'world/index.js', 'world/sitting.js'])
  if (!fs.existsSync(abs(`${dir}/${f}`)) && !plan.renames.some((r) => r.to === f)) {
    console.error(`  ✗ ${dir}/${f} is missing`);
    failed = true;
  }

// 3. the catalogue
step(`the catalogue (${info.catalogueFile})`);
const catalogue = setCatalogueStatus(read(info.catalogueFile), code, 'available');
if (catalogue.changed) {
  change(`${info.catalogueFile}: « ${code} » ${info.status} → available`);
  write(info.catalogueFile, catalogue.text);
} else console.log('  ✓ available');

// 4. the lists that name lesson folders
step('package.json › format:v2, check:format');
const pkg = addToScriptLists(read('package.json'), ['format:v2', 'check:format'], dir);
if (pkg.changed) {
  change(`package.json: ${pkg.names.join(', ')} list ${dir}`);
  write('package.json', pkg.text);
} else console.log('  ✓ both list the lesson');

// 5. the generators, each only when its own check says it is stale
step('the generators');
const { buildOrder } = await import(pathToFileURL(abs('apps/web/scripts/generate-lab-order.mjs')).href);
const LAB_ORDER = 'apps/web/src/lessons/common/lessonlab/lessonOrder.generated.json';
const generators = [
  {
    name: 'generate:lesson-index',
    stale: () => !run('node', ['scripts/generate-lesson-index.mjs', '--check']).ok,
    gen: () => run('node', ['scripts/generate-lesson-index.mjs']),
  },
  {
    name: 'generate:lab-order',
    // compared as data: the file is in check:format's areas, so Prettier lays it out after the generator writes it
    stale: () => JSON.stringify(JSON.parse(read(LAB_ORDER))) !== JSON.stringify(buildOrder()),
    gen: async () => {
      const r = run('node', ['apps/web/scripts/generate-lab-order.mjs']);
      if (r.ok) fs.writeFileSync(abs(LAB_ORDER), await formatted(abs(LAB_ORDER), read(LAB_ORDER)));
      return r;
    },
  },
  {
    name: 'generate:learning-net',
    stale: () =>
      !run('node', ['scripts/generate-learning-net-map.mjs', '--check']).ok ||
      !run('node', ['scripts/learning-net-queue.mjs', '--check']).ok,
    gen: () => {
      const map = run('node', ['scripts/generate-learning-net-map.mjs']);
      return map.ok ? run('node', ['scripts/learning-net-queue.mjs']) : map;
    },
  },
  {
    name: 'generate:compass-index',
    stale: () => !run('node', ['scripts/generate-compass-index.mjs', '--check']).ok,
    gen: () => run('node', ['scripts/generate-compass-index.mjs']),
  },
];
const earlier = changes.length > 0;
for (const g of generators) {
  if (!g.stale()) {
    console.log(`  ✓ ${g.name}: up to date`);
    continue;
  }
  change(`npm run ${g.name}`);
  if (check) continue;
  const r = await g.gen();
  if (!r.ok) {
    console.error(`  ✗ ${g.name} failed:\n${r.out.replace(/^/gm, '    ')}`);
    failed = true;
  }
}
if (check && earlier)
  console.log('  (in --check the generators read the tree as it is: they run after the changes above)');

// 6. the KEPT lists and the baseline the lesson made stale
step('check-unreached › KEPT');
const unreached = parseUnreached(run('node', ['scripts/check-unreached.mjs']).out);
if (unreached.stale.length) {
  const kept = removeKeptEntries(read('scripts/check-unreached.mjs'), unreached.stale);
  for (const k of kept.removed) change(`scripts/check-unreached.mjs: KEPT « ${k} » (reached now)`);
  write('scripts/check-unreached.mjs', kept.text);
  todo.push(
    'scripts/check-unreached.mjs: re-read the comment above the KEPT lines that left (it may name what is gone)',
  );
} else console.log('  ✓ no stale line');
if (unreached.dead.length)
  todo.push(
    `check:unreached: ${unreached.dead.length} file(s) reached by nothing — delete or keep with a reason: ${unreached.dead.join(', ')}`,
  );

step('check-unused › KEPT and its baseline');
for (let pass = 0; pass < 20; pass += 1) {
  const unused = parseUnused(run('node', ['scripts/check-unused.mjs']).out);
  if (pass === 0 && unused.fresh)
    todo.push(
      `check:unused: ${unused.fresh} new unused export(s)/key(s) — delete them, or KEPT with a reason (node scripts/check-unused.mjs)`,
    );
  if (!unused.staleKept.length && !unused.staleBaseline.length) {
    if (pass === 0) console.log('  ✓ no stale line');
    break;
  }
  const kept = removeKeptEntries(read('scripts/check-unused.mjs'), unused.staleKept);
  for (const k of kept.removed) change(`scripts/check-unused.mjs: KEPT « ${k} » (used now)`);
  const base = removeBaselineEntries(read('scripts/check-unused.baseline.json'), unused.staleBaseline);
  for (const id of unused.staleBaseline) change(`scripts/check-unused.baseline.json: « ${id} » (used now)`);
  write('scripts/check-unused.mjs', kept.text);
  write('scripts/check-unused.baseline.json', base.text);
  if (kept.removed.length)
    todo.push('scripts/check-unused.mjs: re-read the comment above KEPT (« the first one took its lines out… »)');
  if (check || !unused.truncated) break;
}

// 7. the routes
step('check-routes');
if (check && earlier) console.log('  (not run: it reads the index the changes above would write)');
else {
  const routes = run('node', ['scripts/check-routes.mjs']);
  if (routes.ok) console.log('  ✓ green');
  else {
    console.error(routes.out.replace(/^/gm, '    '));
    failed = true;
  }
}

// 8. the lesson's state, and what no script decides
step(`status — npm run status:lesson-v2 -- --lesson ${code}`);
console.log(run('node', ['apps/web/scripts/lesson-v2-status.mjs', '--lesson', code]).out.replace(/^/gm, '  '));
const bank = `content/practice/${info.grade}/${code}`;
if (!fs.existsSync(abs(bank)))
  todo.push(
    `the exercise bank ${bank} (and its line in content/practice/active.json, exam-style.json): world/sitting.js serves it`,
  );
if (!fs.existsSync(abs(`content/class-tests/${info.grade}/${code}.json`)))
  todo.push(
    `the class test's default content/class-tests/${info.grade}/${code}.json (be86718d also corrected its items' programme ids by hand)`,
  );
if (!fs.existsSync(abs(`apps/web/e2e/lessons/${code}.walk.mjs`)))
  todo.push(
    `the walk: apps/web/e2e/lessons/${code}.walk.mjs, then E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs ${code} all <outDir> (and sitting, alone)`,
  );
todo.push(
  '« Mon labo » and the launch kit: an instrument tagged with the lesson (lessonlab/registry.js) and a family per core tool (launchkit/families.js) — design, not assembly; lab.test.js lists the tagged instruments by hand',
  'the documents: LESSON_V2.md, CLAUDE.md and FRANCE_REBUILD_PLAN.md (« ONE lesson exists », §9 a line), the lesson-v2 skill',
  `the checks no script ran here: npm run check:format, npm run lint, npm run check:lessons, the web suite — one at a time`,
);

console.log('\n▸ still for a human or a walk');
for (const t of todo) console.log(`  - ${t}`);
console.log(
  `\n${failed ? '✗' : check ? (changes.length ? '✗' : '✓') : '✓'} ${changes.length} change(s) ${check ? 'would be made' : 'made'}.`,
);
process.exit(failed || (check && changes.length) ? 1 : 0);
