// lesson:assemble's edits on FIXTURES of each list it touches — never the real tree. Each edit is applied twice: the
// second time changes nothing.
import { afterAll, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  addToScriptLists,
  applyDraftPlan,
  draftPlan,
  jsonEdit,
  parseUnreached,
  parseUnused,
  removeBaselineEntries,
  removeKeptEntries,
  setCatalogueStatus,
  unfinishedFiles,
  undraft,
} from './lib/lessonAssemble.mjs';
import { HELPER, MARKER, scaffoldFiles } from './lib/lessonScaffold.mjs';

const temps = [];
afterAll(() => temps.forEach((t) => fs.rmSync(t, { recursive: true, force: true })));
const twice = (fn, text) => {
  const first = fn(text);
  const second = fn(first.text);
  expect(second.changed).toBe(false);
  expect(second.text).toBe(first.text);
  return first;
};

describe('the catalogue status', () => {
  const catalogue = `${JSON.stringify(
    {
      grade: '3e',
      lessons: [
        { code: 'a', status: 'available' },
        { code: 'b', programmeItems: ['3e.m1.r07'], status: 'coming_soon' },
      ],
    },
    null,
    2,
  )}\n`;

  it('coming_soon → available for that lesson only, written as it was; then nothing', () => {
    const out = twice((t) => setCatalogueStatus(t, 'b'), catalogue);
    expect(out.changed).toBe(true);
    expect(JSON.parse(out.text).lessons.map((l) => l.status)).toEqual(['available', 'available']);
    expect(out.text.split('\n')).toHaveLength(catalogue.split('\n').length);
  });

  it('refuses a lesson it does not hold, and a JSON not written as JSON.stringify writes it', () => {
    expect(() => setCatalogueStatus(catalogue, 'z')).toThrow(/not in this catalogue/);
    expect(() => jsonEdit('{"a":1}\n', () => {})).toThrow(/by hand/);
  });

  it('keeps a file’s own indent (the baseline is written with one space)', () => {
    const text = `${JSON.stringify({ exports: ['x#a', 'y#b'] }, null, 1)}\n`;
    const out = twice((t) => removeBaselineEntries(t, ['x#a']), text);
    expect(out.text).toBe(`${JSON.stringify({ exports: ['y#b'] }, null, 1)}\n`);
  });
});

describe('package.json › format:v2 and check:format', () => {
  const L1 = 'apps/web/src/lessons/college/3e/nc/u/l1';
  const L2 = 'apps/web/src/lessons/college/3e/nc/u/l2';
  const pkg = (format, check) =>
    `${JSON.stringify({ scripts: { 'format:v2': format, 'check:format': check, lint: 'eslint .' } }, null, 2)}\n`;

  it('adds the lesson after the last lesson folder listed; then nothing', () => {
    const text = pkg(`prettier --write --log-level warn ${L1} apps/x scripts/y.mjs`, `prettier --check ${L1} apps/x`);
    const out = twice((t) => addToScriptLists(t, ['format:v2', 'check:format'], L2), text);
    const { scripts } = JSON.parse(out.text);
    expect(scripts['format:v2']).toBe(`prettier --write --log-level warn ${L1} ${L2} apps/x scripts/y.mjs`);
    expect(scripts['check:format']).toBe(`prettier --check ${L1} ${L2} apps/x`);
    expect(scripts.lint).toBe('eslint .');
    expect(out.names).toEqual(['format:v2', 'check:format']);
  });

  it('before the first path when no lesson is listed — never among the options', () => {
    const out = addToScriptLists(
      pkg('prettier --write --log-level warn apps/x', 'prettier --check apps/x'),
      ['format:v2', 'check:format'],
      L1,
    );
    expect(JSON.parse(out.text).scripts['format:v2']).toBe(`prettier --write --log-level warn ${L1} apps/x`);
    expect(JSON.parse(out.text).scripts['check:format']).toBe(`prettier --check ${L1} apps/x`);
  });

  it('refuses a script that is not there', () => {
    expect(() => addToScriptLists(pkg('a', 'b'), ['format:nope'], L1)).toThrow(/no script/);
  });
});

describe('the KEPT lists of check-unreached and check-unused', () => {
  const source = [
    'const KEPT = {',
    "  'features/a.js': 'test helper',",
    '  // the lesson path no lesson mounts yet',
    "  'lessons/common/lessonRoutes.jsx': 'the route builder — no lesson yet',",
    "  'apps/web/src/x.js#rng':",
    "    'the seeded generator: every lesson\\'s tests replay it',",
    "  'apps/web/src/y.js#last': 'the last line'",
    '};',
    '',
  ].join('\n');

  it('removes a one-line entry and a two-line entry, leaves the rest and the comments; then nothing', () => {
    const out = twice(
      (t) => removeKeptEntries(t, ['lessons/common/lessonRoutes.jsx', 'apps/web/src/x.js#rng']),
      source,
    );
    expect(out.removed).toEqual(['lessons/common/lessonRoutes.jsx', 'apps/web/src/x.js#rng']);
    expect(out.text).toBe(
      [
        'const KEPT = {',
        "  'features/a.js': 'test helper',",
        '  // the lesson path no lesson mounts yet',
        "  'apps/web/src/y.js#last': 'the last line'",
        '};',
        '',
      ].join('\n'),
    );
  });

  it('a last entry without its comma goes alone, never the closing brace; an unknown key is said missing', () => {
    const out = removeKeptEntries(source, ['apps/web/src/y.js#last', 'nowhere.js']);
    expect(out.text).toContain('};');
    expect(out.text).not.toContain('y.js#last');
    expect(out.missing).toEqual(['nowhere.js']);
  });

  it('reads what the checks say: the stale lines, the dead files, the baseline (truncated or not), the new unused', () => {
    expect(
      parseUnreached(
        'check-unreached: these files are listed as kept but are reached or gone — remove them from KEPT:\n  lessons/common/lessonRoutes.jsx\n  features/b.js\n',
      ),
    ).toEqual({ stale: ['lessons/common/lessonRoutes.jsx', 'features/b.js'], dead: [] });
    expect(
      parseUnreached(
        'check-unreached: 1 file(s) are reached by nothing. Delete them, or name them in KEPT with a reason:\n  lessons/x/y.js\n',
      ),
    ).toEqual({ stale: [], dead: ['lessons/x/y.js'] });
    const unused = [
      '',
      'check-unused: these lines of KEPT keep nothing any more — remove them:',
      '  apps/web/src/a.js#default',
      '',
      'check-unused: 41 line(s) of the baseline are not unused any more (removed or used again) — delete them from scripts/check-unused.baseline.json:',
      '  packages/core/n.js#texFr',
      '  …',
      '',
      'check-unused: 2 unused. Delete them, or name them in KEPT (scripts/check-unused.mjs) with the reason.',
    ].join('\n');
    expect(parseUnused(unused)).toEqual({
      staleKept: ['apps/web/src/a.js#default'],
      staleBaseline: ['packages/core/n.js#texFr'],
      truncated: true,
      fresh: 2,
    });
    expect(parseUnused('✅ Nothing new is unused')).toEqual({
      staleKept: [],
      staleBaseline: [],
      truncated: false,
      fresh: 0,
    });
  });
});

describe('the lesson’s own folder: unfinished, then its drafts put in place', () => {
  const info = {
    code: 'lecon-neuve',
    grade: '9z',
    level: 'college',
    kind: 'lesson',
    chapterId: 'nc',
    unitId: 'u',
    title: 'Leçon neuve',
    points: 2,
  };
  function folder() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lesson-assemble-'));
    temps.push(dir);
    for (const { file, text } of scaffoldFiles(info, 'divisor-isles')) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), text);
    }
    return dir;
  }
  /** The content « written »: every marker and every import of the helper gone. */
  function write(dir) {
    for (const e of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      const file = path.join(e.parentPath, e.name);
      if (!e.isFile() || e.name === HELPER) continue;
      const text = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, text.replaceAll(MARKER, 'écrit').replace(/^import \{ notWritten \} from .*$/gm, ''));
    }
  }

  it('a scaffold is unfinished: every stub, every test and the pack say so', () => {
    const dir = folder();
    const left = unfinishedFiles(dir);
    expect(left).toContain('world/story.js');
    expect(left).toContain('world/journey.test.js');
    expect(left).toContain('lesson.pack.draft.js');
    expect(left).not.toContain(HELPER);
    write(dir);
    expect(unfinishedFiles(dir)).toEqual([]);
  });

  it('renames the four drafts and rewrites their imports; a second plan is empty', () => {
    const dir = folder();
    write(dir);
    const plan = draftPlan(dir);
    expect(plan.renames).toEqual([
      { from: 'lesson.config.draft.js', to: 'lesson.config.js' },
      { from: 'lesson.pack.draft.js', to: 'lesson.pack.js' },
      { from: 'routes.draft.jsx', to: 'routes.jsx' },
      { from: 'world/sitting.draft.js', to: 'world/sitting.js' },
    ]);
    applyDraftPlan(dir, plan);
    for (const f of ['index.jsx', 'routes.jsx', 'world/index.js', 'world/evidence.test.js', 'world/sitting.test.js']) {
      const text = fs.readFileSync(path.join(dir, f), 'utf8');
      expect(text, f).not.toMatch(/\.draft\b/);
    }
    expect(fs.readFileSync(path.join(dir, 'index.jsx'), 'utf8')).toContain("from './lesson.config';");
    expect(fs.readFileSync(path.join(dir, 'world/index.js'), 'utf8')).toContain("from './sitting';");
    expect(draftPlan(dir)).toEqual({ renames: [], rewrites: [] });
  });

  it('refuses a draft whose final name exists too', () => {
    const dir = folder();
    fs.writeFileSync(path.join(dir, 'routes.jsx'), '');
    expect(() => draftPlan(dir)).toThrow(/both exist/);
  });

  it('undraft touches only the four names', () => {
    expect(undraft("import x from './lesson.config.draft';\nimport y from './story.draft';")).toBe(
      "import x from './lesson.config';\nimport y from './story.draft';",
    );
  });
});
