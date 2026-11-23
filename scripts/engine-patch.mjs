#!/usr/bin/env node
/**
 * engine-patch — carry the engine FIXES made in France to the Algerian repository, as ONE patch the owner reads and
 * applies himself.
 *
 * Both repositories hold the same lesson engine: the French tree was imported whole from the Algerian one (French
 * commit `049380e`, same relative paths). Only files that hold NO sentence shown to a person cross; after the patch,
 * the Algerian copy of such a file equals the French copy at HEAD.
 *
 * For each path of the list (`scripts/engine-patch.list`):
 *   - in sync    the Algerian file equals French HEAD: nothing to send;
 *   - patchable  the Algerian blob is a version this path had in the French history: the diff from it to HEAD is sent;
 *   - new here   the file does not exist in Algeria: it crosses whole;
 *   - diverged   the Algerian blob is in no French version: the copies differ by more than the fix. NO patch is written,
 *                the exit code is 1. A patch that needs judgment is never sent.
 *
 * Usage: node scripts/engine-patch.mjs [--list <file>] [--dz <dir>] [--out <dir>] [--check]
 * This script NEVER writes inside the Algerian repository: it reads its files, and runs `git apply --check` there.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CLASSES = Object.freeze({
  SYNC: 'in sync',
  PATCHABLE: 'patchable',
  NEW: 'new here',
  DIVERGED: 'diverged',
  MISSING: 'missing in France',
});

function git(cwd, args, { input } = {}) {
  return execFileSync('git', args, {
    cwd,
    input,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

function gitOk(cwd, args) {
  try {
    return git(cwd, args).trim();
  } catch {
    return null;
  }
}

/** The paths of a list file: one per line, `#` starts a comment (whole line or after the path). */
export function parseList(text) {
  const out = [];
  for (const raw of String(text).split('\n')) {
    const line = raw.replace(/#.*$/, '').trim();
    if (line && !out.includes(line)) out.push(line);
  }
  return out;
}

/** A path of the list must stay inside the repository: relative, no `..`. → an error message, or null. */
export function pathProblem(p) {
  if (path.isAbsolute(p)) return `${p}: absolute path (write it relative to the repository root)`;
  if (p.split(/[\\/]/).includes('..')) return `${p}: leaves the repository (..)`;
  return null;
}

/** The real path of `p`, or of its nearest existing ancestor joined with the rest (for a folder not made yet). */
function realish(p) {
  const abs = path.resolve(p);
  let head = abs;
  const tail = [];
  while (!existsSync(head)) {
    tail.unshift(path.basename(head));
    const up = path.dirname(head);
    if (up === head) break;
    head = up;
  }
  return path.join(realpathSync(head), ...tail);
}

/** Is `child` the folder `parent` or inside it (symbolic links resolved)? */
export function isInside(child, parent) {
  const c = realish(child);
  const p = realish(parent);
  const rel = path.relative(p, c);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Classify one path. → { path, cls, base? } where `base` is the French commit whose version the Algerian copy is.
 * Read-only on both sides: `git hash-object` (without -w) only hashes the Algerian file.
 */
export function classifyPath({ frRoot, dzRoot, file }) {
  const head = gitOk(frRoot, ['rev-parse', '--verify', '--quiet', `HEAD:${file}`]);
  if (!head) return { path: file, cls: CLASSES.MISSING };
  const dzFile = path.join(dzRoot, file);
  if (!existsSync(dzFile)) return { path: file, cls: CLASSES.NEW };
  const dzBlob = git(frRoot, ['hash-object', '--no-filters', '--', dzFile]).trim();
  if (dzBlob === head) return { path: file, cls: CLASSES.SYNC };
  const commits = git(frRoot, ['log', '--format=%H', 'HEAD', '--', file]).split('\n').filter(Boolean);
  for (const c of commits) {
    if (gitOk(frRoot, ['rev-parse', '--verify', '--quiet', `${c}:${file}`]) === dzBlob) {
      return { path: file, cls: CLASSES.PATCHABLE, base: c };
    }
  }
  return { path: file, cls: CLASSES.DIVERGED };
}

/** The git diff that carries one classified path to French HEAD ('' when nothing is to send). */
export function diffFor(frRoot, entry) {
  const opts = ['-c', 'core.quotepath=off', 'diff', '--no-color', '--no-ext-diff', '--no-renames', '--binary'];
  if (entry.cls === CLASSES.PATCHABLE)
    return git(frRoot, [...opts, '--full-index', entry.base, 'HEAD', '--', entry.path]);
  if (entry.cls === CLASSES.NEW) {
    const emptyTree = git(frRoot, ['hash-object', '-t', 'tree', '--stdin'], { input: '' }).trim();
    return git(frRoot, [...opts, '--full-index', emptyTree, 'HEAD', '--', entry.path]);
  }
  return '';
}

/** → { added, removed } lines of a diff. */
export function diffStats(diff) {
  let added = 0;
  let removed = 0;
  for (const l of String(diff).split('\n')) {
    if (l.startsWith('+') && !l.startsWith('+++')) added += 1;
    else if (l.startsWith('-') && !l.startsWith('---')) removed += 1;
  }
  return { added, removed };
}

const SENTENCE_CHARS = /[àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ«»؀-ۿݐ-ݿ]/;
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\\n]|\\.)*`/g;
const WARN_SHOWN = 8;
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*|#)/;

/**
 * The added lines that look like a sentence for a person: a string literal holding a French accented letter, « », or
 * an Arabic letter. A warning, not a failure (a developer message may be one). → [{ path, line, text }]
 */
export function sentenceWarnings(patch) {
  const out = [];
  let file = null;
  let lineNo = 0;
  for (const l of String(patch).split('\n')) {
    if (l.startsWith('+++ ')) {
      file = l.replace(/^\+\+\+ (?:b\/)?/, '');
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(l);
    if (hunk) {
      lineNo = Number(hunk[1]);
      continue;
    }
    if (l.startsWith('-') || l.startsWith('\\')) continue;
    if (l.startsWith('+')) {
      const code = l.slice(1);
      if (!COMMENT_LINE.test(code)) {
        const hit = (code.match(STRING_LITERAL) ?? []).find((s) => SENTENCE_CHARS.test(s));
        if (hit) out.push({ path: file, line: lineNo, text: code.trim() });
      }
      lineNo += 1;
    } else if (l.startsWith(' ')) lineNo += 1;
  }
  return out;
}

export function parseArgs(argv) {
  const opts = { check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (['--list', '--dz', '--out'].includes(a)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`);
      opts[a.slice(2)] = v;
      i += 1;
    } else throw new Error(`unknown option ${a}`);
  }
  return opts;
}

/**
 * The whole run. → the exit code: 0 done (or nothing to send), 1 a path diverged / missing or the patch does not apply,
 * 2 a usage error. `frRoot` is the French repository; relative options resolve against `cwd`.
 */
export function main(argv, { frRoot, cwd = process.cwd(), log = console.log, warn = console.error } = {}) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    warn(`engine-patch: ${e.message}`);
    return 2;
  }
  const listFile = opts.list ? path.resolve(cwd, opts.list) : path.join(frRoot, 'scripts/engine-patch.list');
  const dzRoot = opts.dz ? path.resolve(cwd, opts.dz) : path.resolve(frRoot, '../smarter-academy-dz');
  const outDir = opts.out ? path.resolve(cwd, opts.out) : path.join(os.tmpdir(), 'engine-patch');

  if (!existsSync(dzRoot)) {
    warn(`engine-patch: the Algerian repository is not at ${dzRoot} (--dz)`);
    return 2;
  }
  if (isInside(outDir, dzRoot)) {
    warn(
      `engine-patch: refused — --out ${outDir} is inside the Algerian repository ${dzRoot}; nothing is written there`,
    );
    return 2;
  }
  if (!existsSync(listFile)) {
    warn(`engine-patch: no list at ${listFile} (--list)`);
    return 2;
  }
  const files = parseList(readFileSync(listFile, 'utf8'));
  const bad = files.map(pathProblem).filter(Boolean);
  if (bad.length) {
    for (const b of bad) warn(`engine-patch: ${b}`);
    return 2;
  }

  const entries = files.map((file) => classifyPath({ frRoot, dzRoot, file }));
  const blocked = entries.filter((e) => e.cls === CLASSES.DIVERGED || e.cls === CLASSES.MISSING);
  for (const e of entries) e.diff = diffFor(frRoot, e);

  const short = git(frRoot, ['rev-parse', '--short', 'HEAD']).trim();
  log(`engine-patch — France ${short} → ${dzRoot}`);
  for (const e of entries) {
    const { added, removed } = diffStats(e.diff);
    const counts = e.diff ? `  +${added} −${removed}` : '';
    const base = e.base ? `  (Algeria = France ${e.base.slice(0, 8)})` : '';
    log(`  ${e.cls.padEnd(17)} ${e.path}${counts}${base}`);
  }

  if (blocked.length) {
    for (const e of blocked) {
      const why =
        e.cls === CLASSES.MISSING
          ? 'is not in French HEAD'
          : 'differs in Algeria by more than the French fix (its blob is in no French version)';
      warn(`DIVERGED: ${e.path} ${why} — remove it from the list or carry it by hand.`);
    }
    warn('engine-patch: NO patch written.');
    return 1;
  }

  const patch = entries.map((e) => e.diff).join('');
  if (!patch) {
    log('Nothing to send: every path is in sync.');
    return 0;
  }

  try {
    git(dzRoot, ['apply', '--check', '-'], { input: patch });
  } catch (e) {
    warn(`engine-patch: the patch does not apply to ${dzRoot} — NO patch written.\n${e.stderr ?? e.message}`);
    return 1;
  }

  const warnings = sentenceWarnings(patch);
  // every warning of a file up to WARN_SHOWN, then their count (a fixture can hold a hundred)
  const shownPerFile = {};
  for (const w of warnings) {
    shownPerFile[w.path] = (shownPerFile[w.path] ?? 0) + 1;
    if (shownPerFile[w.path] <= WARN_SHOWN) warn(`WARNING (a sentence for a person?): ${w.path}:${w.line}  ${w.text}`);
  }
  for (const [file, count] of Object.entries(shownPerFile))
    if (count > WARN_SHOWN) warn(`WARNING: … and ${count - WARN_SHOWN} more in ${file}`);

  const patchFile = path.join(outDir, `engine-${short}.patch`);
  if (opts.check) {
    log(
      `--check: the patch would apply cleanly (${diffStats(patch).added}+ / ${diffStats(patch).removed}−); nothing written.`,
    );
    return 0;
  }
  mkdirSync(outDir, { recursive: true });
  const header =
    `engine patch from the French repository, HEAD ${git(frRoot, ['rev-parse', 'HEAD']).trim()}\n` +
    `paths: ${entries
      .filter((e) => e.diff)
      .map((e) => e.path)
      .join(', ')}\n\n`;
  writeFileSync(patchFile, header + patch);
  const sent = entries.filter((e) => e.diff).map((e) => e.path);
  log(`\nPatch: ${patchFile}  (checked: \`git apply --check\` passes in ${dzRoot})`);
  if (warnings.length) log(`${warnings.length} sentence warning(s) above — read those lines before applying.`);
  log('\nThe owner runs:');
  log(`  git -C ${dzRoot} apply ${patchFile}`);
  log(`  git -C ${dzRoot} add -- ${sent.join(' ')} && git -C ${dzRoot} commit -m "fix(engine): from France ${short}"`);
  return 0;
}

const isEntry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntry) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const frRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
  process.exitCode = main(process.argv.slice(2), { frRoot });
}
