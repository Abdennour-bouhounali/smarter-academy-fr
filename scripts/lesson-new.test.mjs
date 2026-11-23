// lesson:new on a FIXTURE tree (a temp folder: a catalogue of one unit, the worlds' table) — never the real tree.
import { afterAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';
import { DRAFTS, HELPER, MARKER, findLesson, scaffold } from './lib/lessonScaffold.mjs';

const REPO = path.resolve(import.meta.dirname, '..');
const temps = [];
afterAll(() => temps.forEach((t) => fs.rmSync(t, { recursive: true, force: true })));

/** A tree with lessons_9z (two lessons of one unit), its units and programme, the worlds' table, Prettier's config. */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lesson-new-'));
  temps.push(root);
  const fr = path.join(root, 'packages/core/curriculum/fr');
  fs.mkdirSync(fr, { recursive: true });
  const lesson = (code, order, status) => ({
    code,
    chapterId: 'nombres_calculs',
    unitId: 'unite-test',
    order,
    kind: 'lesson',
    title: `Leçon ${code}`,
    pointsToLearn: ['Un', 'Deux', 'Trois'],
    status,
  });
  const json = (file, data) => fs.writeFileSync(path.join(fr, file), `${JSON.stringify(data, null, 2)}\n`);
  json('lessons_9z_2026_2027.json', {
    grade: '9z',
    lessons: [
      lesson('deja-la', 0, 'available'),
      lesson('lecon-neuve', 1, 'coming_soon'),
      { ...lesson('synthese', 2, 'coming_soon'), kind: 'synthesis' },
    ],
  });
  json('units_9z_2026_2027.json', {
    units: [{ code: 'unite-test', chapterId: 'nombres_calculs', title: 'Unité test' }],
  });
  json('programme_9z_2026_2027.json', { domains: [{ id: 'nombres_calculs', title: 'Nombres et calculs' }] });
  const worlds = path.join(root, 'apps/web/src/lessons/common/gameworld');
  fs.mkdirSync(worlds, { recursive: true });
  fs.writeFileSync(
    path.join(worlds, 'worlds.js'),
    "export const WORLDS = {\n  'divisor-isles': () => import('./divisorIsles/DivisorIsles'),\n  'root-courts': () => import('./rootCourts/RootCourts'),\n};\n",
  );
  fs.copyFileSync(path.join(REPO, '.prettierrc.json'), path.join(root, '.prettierrc.json'));
  fs.mkdirSync(path.join(root, 'apps/web/src/lessons/college/9z/nombres_calculs/unite-test/deja-la'), {
    recursive: true,
  });
  return root;
}

const DIR = 'apps/web/src/lessons/college/9z/nombres_calculs/unite-test/lecon-neuve';
const EXPECTED = [
  'board/memo.js',
  'board/script.js',
  'index.jsx',
  'lesson.config.draft.js',
  'lesson.pack.draft.js',
  'routes.draft.jsx',
  HELPER,
  ...['evidence', 'forges', 'inquiries', 'journey'].flatMap((n) => [`world/${n}.js`, `world/${n}.test.js`]),
  'world/index.js',
  'world/knowledge.js',
  'world/limits.test.js',
  'world/math.js',
  'world/practice.js',
  'world/sitting.draft.js',
  'world/sitting.test.js',
  'world/story.js',
  'world/story.test.js',
  'world/text.js',
  'world/trainer.js',
  'world/trainer.test.js',
].map((f) => `${DIR}/${f}`);

describe('lesson:new — the skeleton of a lesson', () => {
  it('finds the lesson in the catalogue: its grade, theme, unit, title and number of points', () => {
    const root = fixture();
    expect(findLesson(root, 'lecon-neuve')).toMatchObject({
      grade: '9z',
      chapterId: 'nombres_calculs',
      chapterTitle: 'Nombres et calculs',
      unitId: 'unite-test',
      unitTitle: 'Unité test',
      title: 'Leçon lecon-neuve',
      status: 'coming_soon',
      points: 3,
      catalogueFile: 'packages/core/curriculum/fr/lessons_9z_2026_2027.json',
    });
    expect(findLesson(root, 'nulle-part')).toBeNull();
  });

  it('--dry-run: the file list, and nothing written', async () => {
    const root = fixture();
    const { dir, files } = await scaffold(root, 'lecon-neuve', { world: 'divisor-isles', dryRun: true });
    expect(dir).toBe(DIR);
    expect([...files].sort()).toEqual([...EXPECTED].sort());
    expect(fs.existsSync(path.join(root, DIR))).toBe(false);
  });

  it('writes the files, and refuses to overwrite a lesson — the new one or one that exists', async () => {
    const root = fixture();
    await scaffold(root, 'lecon-neuve', { world: 'divisor-isles' });
    const written = fs
      .readdirSync(path.join(root, DIR), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile());
    expect(written.map((e) => `${path.relative(root, path.join(e.parentPath, e.name))}`).sort()).toEqual(
      [...EXPECTED].sort(),
    );
    const before = fs.readFileSync(path.join(root, DIR, 'world/story.js'), 'utf8');
    await expect(scaffold(root, 'lecon-neuve', { world: 'divisor-isles' })).rejects.toThrow(/exists already/);
    expect(fs.readFileSync(path.join(root, DIR, 'world/story.js'), 'utf8')).toBe(before);
    await expect(scaffold(root, 'deja-la', { world: 'divisor-isles' })).rejects.toThrow(/exists already/);
  });

  it('refuses an unknown world, a missing world, an unknown code and a synthesis', async () => {
    const root = fixture();
    await expect(scaffold(root, 'lecon-neuve', { world: 'nulle-part' })).rejects.toThrow(/unknown world/);
    await expect(scaffold(root, 'lecon-neuve', {})).rejects.toThrow(/--world/);
    await expect(scaffold(root, 'nulle-part', { world: 'divisor-isles' })).rejects.toThrow(/no catalogue/);
    await expect(scaffold(root, 'synthese', { world: 'divisor-isles' })).rejects.toThrow(/synthesis/);
  });

  it('every file it writes is valid JavaScript (JSX), formatted by the tree’s Prettier', async () => {
    const root = fixture();
    const { files } = await scaffold(root, 'lecon-neuve', { world: 'divisor-isles' });
    const prettier = await import('prettier');
    const options = JSON.parse(fs.readFileSync(path.join(REPO, '.prettierrc.json'), 'utf8'));
    for (const file of files) {
      const text = fs.readFileSync(path.join(root, file), 'utf8');
      expect(() => parse(text, { sourceType: 'module', plugins: ['jsx'] }), file).not.toThrow();
      expect(await prettier.check(text, { ...options, filepath: file }), file).toBe(true);
    }
  });

  it('is invisible to the tree: none of the names the tree discovers, each written with its `.draft` infix', async () => {
    const root = fixture();
    const { files } = await scaffold(root, 'lecon-neuve', { world: 'divisor-isles' });
    for (const name of DRAFTS) {
      expect(files).not.toContain(`${DIR}/${name}`);
      expect(files).toContain(`${DIR}/${name.replace(/\.(jsx?)$/, '.draft.$1')}`);
    }
    const pack = fs.readFileSync(path.join(root, DIR, 'lesson.pack.draft.js'), 'utf8');
    expect(pack).toContain("id: 'lecon-neuve'");
    expect(pack).toContain("world: { id: 'divisor-isles'");
    for (const p of ['P1', 'P2', 'P3']) expect(pack).toMatch(new RegExp(`${p}: '${MARKER}`));
    expect(pack).not.toMatch(/^import /m);
  });

  it('the tests call the shared suite with the lesson’s modules, and keep ONE marked place that fails until written', async () => {
    const root = fixture();
    const { files } = await scaffold(root, 'lecon-neuve', { world: 'divisor-isles' });
    const tests = files.filter((f) => f.endsWith('.test.js'));
    expect(tests).toHaveLength(8);
    const SUITE = {
      story: 'describeStory',
      forges: 'describeForges',
      inquiries: 'describeExperiments',
      evidence: 'describeEvidence',
      trainer: 'describeTrainer',
      journey: 'describeKnowledge',
      limits: 'describeLimits',
      sitting: 'describeSitting',
    };
    for (const file of tests) {
      const text = fs.readFileSync(path.join(root, file), 'utf8');
      const suite = SUITE[path.basename(file, '.test.js')];
      expect(text, file).toContain(
        `import { ${suite} } from '../../../../../../common/gameworld/kit/authoring/test/suites.js'`,
      );
      expect(text.match(new RegExp(`\\b${suite}\\(`, 'g')), file).toHaveLength(1);
      expect(text.match(/THE LESSON'S OWN ASSERTIONS/g), file).toHaveLength(1);
      expect(text, file).toContain(
        `throw new Error('${MARKER} — ${file.slice(DIR.length + 1)}: the lesson’s own assertions')`,
      );
      expect(text, file).toContain("const ID = 'lecon-neuve';");
    }
  });

  it('a stub fails loudly: reading, calling, spreading or iterating it throws « not written yet » — never a value', async () => {
    const root = fixture();
    await scaffold(root, 'lecon-neuve', { world: 'divisor-isles' });
    const { notWritten } = await import(pathToFileURL(path.join(root, DIR, HELPER)).href);
    const x = notWritten('world/story.js › STORY');
    const message = `${MARKER} — world/story.js › STORY`;
    expect(() => x.segments).toThrow(message);
    expect(() => x()).toThrow(message);
    expect(() => ({ ...x })).toThrow(message);
    expect(() => [...x]).toThrow(message);
    expect(() => `${x}`).toThrow(message);
    expect(() => Object.keys(x)).toThrow(message);
    expect(x.then).toBeUndefined();
    // every content stub exports through it, and says where L1's shape is
    const story = fs.readFileSync(path.join(root, DIR, 'world/story.js'), 'utf8');
    for (const name of ['K', 'MODULE_KEYS', 'TABLETS', 'STORY'])
      expect(story).toContain(`export const ${name} = notWritten('world/story.js › ${name}');`);
    expect(story).toContain('decomposer-en-facteurs-premiers/world/story.js');
  });
});
