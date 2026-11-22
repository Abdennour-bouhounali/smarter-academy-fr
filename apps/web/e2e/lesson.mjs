// The walks of ONE v2 lesson, played from its descriptor `e2e/lessons/<id>.walk.mjs` by the shared library
// lib/lessonWalk/ (README there). Dev server up on :5173 (or E2E_BASE); one walk at a time.
//   E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs <id> [story|hub|trainer|board|launch|sitting|all] [outDir]
// `all` plays story, hub, trainer, board and launch, one after the other (the sitting is run on its own: every sheet).
import { tmpdir } from 'node:os';
import { ALL, runLessonWalk } from './lib/lessonWalk/index.mjs';

const [id, part = 'all', out = `${tmpdir()}/lesson-${process.argv[2]}`] = process.argv.slice(2);
if (!id) {
  console.log('usage: node apps/web/e2e/lesson.mjs <lesson id> [story|hub|trainer|board|launch|sitting|all] [outDir]');
  process.exit(2);
}
const { default: descriptor } = await import(`./lessons/${id}.walk.mjs`);
if (descriptor.id !== id) throw new Error(`lessons/${id}.walk.mjs names the lesson ${descriptor.id}`);
await runLessonWalk(descriptor, part === 'all' ? ALL : part.split(','), out);
