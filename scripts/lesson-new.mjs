#!/usr/bin/env node
/**
 * THE SKELETON OF A NEW v2 LESSON — everything that holds no design decision (scripts/lib/lessonScaffold.mjs).
 *
 *   npm run lesson:new -- <code> --world <world>             writes apps/web/src/lessons/<level>/<grade>/<theme>/<unit>/<code>/
 *   npm run lesson:new -- <code> --world <world> --dry-run   prints the files, writes nothing
 *
 * It finds the lesson's grade, theme, unit and title in the catalogue (packages/core/curriculum/fr/), refuses an existing
 * folder, and writes: the glue files (index.jsx, routes, the pack, world/index.js, world/sitting.js), the tests that
 * call the shared suites, and a STUB for every content file — whose tests FAIL with « SCAFFOLD: not written yet » until
 * the content is written. The files the tree discovers by name carry a `.draft` infix: the lesson stays out of the
 * index, the routes and the globs until `npm run lesson:assemble -- <code>`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DRAFTS, HELPER, scaffold } from './lib/lessonScaffold.mjs';

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const code = args.find((a, i) => !a.startsWith('--') && !['--world', '--root'].includes(args[i - 1]));
const root = path.resolve(opt('--root') ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const dryRun = args.includes('--dry-run');

if (!code) {
  console.error('usage: npm run lesson:new -- <lesson code> --world <world id> [--dry-run]');
  process.exit(2);
}
try {
  const { info, dir, files } = await scaffold(root, code, { world: opt('--world'), dryRun });
  console.log(
    `${dryRun ? 'Would write' : 'Wrote'} ${files.length} files — « ${info.title} » (${info.grade}, ${info.unitId}):`,
  );
  for (const f of files) console.log(`  ${f}`);
  if (dryRun) process.exit(0);
  console.log(`
Next:
  - write the content in place of every \`notWritten(…)\` and every « SCAFFOLD: not written yet » (\`grep -rn SCAFFOLD ${dir}\`);
    the lesson's tests fail with that message until then: npx vitest run ${dir.replace(/^apps\/web\//, '')} (in apps/web)
  - the lesson is invisible to the tree until it is assembled: ${DRAFTS.join(', ')} are written with a \`.draft\` infix,
    and ${HELPER} holds the stubs. check:unreached and check:unused report its files as dead meanwhile.
  - then: npm run lesson:assemble -- ${code}`);
} catch (error) {
  console.error(`lesson:new — ${error.message}`);
  process.exit(1);
}
