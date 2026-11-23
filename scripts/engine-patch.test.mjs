import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CLASSES, classifyPath, main, parseList, sentenceWarnings, isInside } from './engine-patch.mjs';

const GIT_ENV = [
  '-c',
  'user.name=t',
  '-c',
  'user.email=t@t',
  '-c',
  'commit.gpgsign=false',
  '-c',
  'core.hooksPath=/dev/null',
];
const git = (cwd, ...args) => execFileSync('git', [...GIT_ENV, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });
const write = (root, file, text) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
};

let tmp;
let fr;
let dz;
let dzSnapshot;

/** Every file of the fixture dz (outside .git) with its bytes. */
function snapshot(root) {
  const out = {};
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(root, p)] = readFileSync(p).toString('base64');
    }
  };
  walk(root);
  return out;
}

function run(lines, extra = []) {
  const list = path.join(tmp, `list-${Math.random().toString(36).slice(2)}.txt`);
  writeFileSync(list, lines.join('\n'));
  const out = path.join(tmp, `out-${Math.random().toString(36).slice(2)}`);
  const logs = [];
  const errs = [];
  const code = main(['--list', list, '--dz', dz, '--out', out, ...extra], {
    frRoot: fr,
    log: (s) => logs.push(s),
    warn: (s) => errs.push(s),
  });
  const patches = existsSync(out) ? readdirSync(out) : [];
  return { code, out, patches, log: logs.join('\n'), err: errs.join('\n') };
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(os.tmpdir(), 'engine-patch-test-'));
  fr = path.join(tmp, 'fr');
  dz = path.join(tmp, 'dz');
  mkdirSync(fr);
  git(fr, 'init', '-q');
  write(fr, 'core/same.js', 'export const same = 1;\n');
  write(fr, 'core/fixed.js', 'export function half(n) {\n  return n / 2;\n}\n');
  write(fr, 'core/drift.js', 'export const drift = 1;\n');
  git(fr, 'add', '-A');
  git(fr, 'commit', '-q', '-m', 'import');
  // dz = the first commit, as its own repository
  mkdirSync(dz);
  for (const f of ['core/same.js', 'core/fixed.js', 'core/drift.js'])
    write(dz, f, readFileSync(path.join(fr, f), 'utf8'));
  git(dz, 'init', '-q');
  git(dz, 'add', '-A');
  git(dz, 'commit', '-q', '-m', 'dz');
  // France fixes `fixed.js`, adds a new file, and a sentence line
  write(fr, 'core/fixed.js', 'export function half(n) {\n  return Math.floor(n / 2);\n}\n');
  write(fr, 'core/added.js', "export const added = 2;\nexport const msg = 'la réponse';\n");
  write(fr, 'core/drift.js', 'export const drift = 2;\n');
  git(fr, 'add', '-A');
  git(fr, 'commit', '-q', '-m', 'fix');
  // Algeria changed drift.js on its own: no French version has it
  write(dz, 'core/drift.js', 'export const drift = 3;\n');
  git(dz, 'commit', '-q', '-am', 'dz drift');
  dzSnapshot = snapshot(dz);
});

afterAll(() => {
  // the fixture dz was never touched by a run
  expect(git(dz, 'status', '--porcelain')).toBe('');
  expect(snapshot(dz)).toEqual(dzSnapshot);
  rmSync(tmp, { recursive: true, force: true });
});

const dzUntouched = () => {
  expect(git(dz, 'status', '--porcelain')).toBe('');
  expect(snapshot(dz)).toEqual(dzSnapshot);
};

describe('engine-patch — classification', () => {
  it('reads a list: comments, blank lines, duplicates', () => {
    expect(parseList('# head\na.js  # why\n\n# why b\nb.js\na.js\n')).toEqual(['a.js', 'b.js']);
  });

  it('in sync, patchable (with its base), new here, diverged', () => {
    const c = (file) => classifyPath({ frRoot: fr, dzRoot: dz, file });
    expect(c('core/same.js').cls).toBe(CLASSES.SYNC);
    const p = c('core/fixed.js');
    expect(p.cls).toBe(CLASSES.PATCHABLE);
    expect(p.base).toBe(git(fr, 'rev-parse', 'HEAD~1').trim());
    expect(c('core/added.js').cls).toBe(CLASSES.NEW);
    expect(c('core/drift.js').cls).toBe(CLASSES.DIVERGED);
  });
});

describe('engine-patch — the run', () => {
  it('only paths in sync: nothing to send, no file', () => {
    const r = run(['core/same.js']);
    expect(r.code).toBe(0);
    expect(r.patches).toEqual([]);
    expect(r.log).toMatch(/Nothing to send/);
    dzUntouched();
  });

  it('patchable + new: one patch that applies to a copy of dz and makes it equal France', () => {
    const r = run(['core/same.js', 'core/fixed.js', 'core/added.js']);
    expect(r.code).toBe(0);
    const short = git(fr, 'rev-parse', '--short', 'HEAD').trim();
    expect(r.patches).toEqual([`engine-${short}.patch`]);
    expect(r.log).toMatch(/patchable\s+core\/fixed\.js\s+\+1 −1/);
    expect(r.log).toMatch(/new here\s+core\/added\.js\s+\+2 −0/);
    expect(r.log).toMatch(/git -C .* apply /);
    const patch = readFileSync(path.join(r.out, r.patches[0]), 'utf8');
    expect(patch).toMatch(/new file mode/);
    dzUntouched();
    // the TEST applies it, on a copy
    const copy = path.join(tmp, 'dz-copy');
    cpSync(dz, copy, { recursive: true });
    git(copy, 'apply', path.join(r.out, r.patches[0]));
    for (const f of ['core/same.js', 'core/fixed.js', 'core/added.js'])
      expect(readFileSync(path.join(copy, f), 'utf8')).toBe(readFileSync(path.join(fr, f), 'utf8'));
  });

  it('--check classifies and writes nothing', () => {
    const r = run(['core/fixed.js'], ['--check']);
    expect(r.code).toBe(0);
    expect(r.patches).toEqual([]);
    expect(existsSync(r.out)).toBe(false);
    dzUntouched();
  });

  it('diverged: non-zero, names the path, no patch at all', () => {
    const r = run(['core/fixed.js', 'core/drift.js']);
    expect(r.code).not.toBe(0);
    expect(r.err).toMatch(/core\/drift\.js/);
    expect(r.err).toMatch(/remove it from the list or carry it by hand/);
    expect(existsSync(r.out)).toBe(false);
    dzUntouched();
  });

  it('warns on an added line that looks like a sentence, without failing', () => {
    const r = run(['core/added.js']);
    expect(r.code).toBe(0);
    expect(r.err).toMatch(/WARNING.*core\/added\.js:2/);
    expect(sentenceWarnings("+++ b/x.js\n@@ -0,0 +1,3 @@\n+// l'élève\n+const a = 'ok';\n+const b = « x »;\n")).toEqual(
      [],
    );
    expect(sentenceWarnings('+++ b/x.php\n@@ -1,1 +1,1 @@\n ctx\n+$m = "اكتب";\n')).toEqual([
      { path: 'x.php', line: 2, text: '$m = "اكتب";' },
    ]);
  });

  it('refuses an --out inside the Algerian repository', () => {
    const list = path.join(tmp, 'refuse.txt');
    writeFileSync(list, 'core/fixed.js\n');
    const errs = [];
    for (const out of [dz, path.join(dz, 'patches'), path.join(dz, 'core')]) {
      const code = main(['--list', list, '--dz', dz, '--out', out], {
        frRoot: fr,
        log: () => {},
        warn: (s) => errs.push(s),
      });
      expect(code).toBe(2);
    }
    expect(errs.join('\n')).toMatch(/refused/);
    expect(isInside(path.join(tmp, 'dz-other'), dz)).toBe(false);
    dzUntouched();
  });
});
