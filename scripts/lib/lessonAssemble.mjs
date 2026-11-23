// THE ASSEMBLY OF A v2 LESSON — the pure half of `scripts/lesson-assemble.mjs` (its test: `scripts/lesson-assemble.test.mjs`).
//
// Each function takes a file's TEXT (or a folder) and returns what it would become, `changed` saying whether it moves:
// the script runs them on the real tree, the test on fixtures. A second run of any of them changes nothing.
import fs from 'node:fs';
import path from 'node:path';
import { DRAFTS, HELPER, MARKER, draftName } from './lessonScaffold.mjs';

/** Edits a JSON file's text through `mutate(data)`, written back as it was written (its indent, its last newline). */
export function jsonEdit(text, mutate) {
  const indent = /\n( +|\t)"/.exec(text)?.[1] ?? 2;
  const newline = text.endsWith('\n') ? '\n' : '';
  const write = (data) => JSON.stringify(data, null, indent) + newline;
  const data = JSON.parse(text);
  if (write(data) !== text) throw new Error('the JSON is not written as JSON.stringify writes it: edit it by hand');
  mutate(data);
  const next = write(data);
  return { text: next, changed: next !== text };
}

/** The catalogue (`lessons_<grade>_*.json`) with the lesson `code` at `status`. */
export function setCatalogueStatus(text, code, status = 'available') {
  let found = false;
  const out = jsonEdit(text, (data) => {
    const lesson = data.lessons?.find((l) => l.code === code);
    if (!lesson) return;
    found = true;
    lesson.status = status;
  });
  if (!found) throw new Error(`« ${code} » is not in this catalogue`);
  return out;
}

/**
 * package.json with `dir` among the paths of each npm script of `names` (`format:v2`, `check:format`): after the last
 * lesson folder they list, or before their first path. A path already there is left alone.
 */
export function addToScriptLists(text, names, dir) {
  const changedNames = [];
  const out = jsonEdit(text, (pkg) => {
    for (const name of names) {
      const command = pkg.scripts?.[name];
      if (command == null) throw new Error(`package.json has no script « ${name} »`);
      const tokens = command.split(' ');
      if (tokens.includes(dir)) continue;
      const lessons = tokens
        .map((t, i) => (t.startsWith('apps/web/src/lessons/college/') ? i : -1))
        .filter((i) => i >= 0);
      const firstPath = tokens.findIndex((t, i) => i > 0 && !t.startsWith('-') && t.includes('/'));
      const at = lessons.length ? lessons.at(-1) + 1 : firstPath >= 0 ? firstPath : tokens.length;
      tokens.splice(at, 0, dir);
      pkg.scripts[name] = tokens.join(' ');
      changedNames.push(name);
    }
  });
  return { ...out, names: changedNames };
}

/**
 * A script's source without the KEPT entries `keys` (`'<key>': '<why>',` on one line, or the key on its line and the
 * reason on the next ones up to the comma). Returns { text, changed, removed, missing }.
 */
export function removeKeptEntries(text, keys) {
  const lines = text.split('\n');
  const removed = [];
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const head = new RegExp(`^\\s*(['"])${escaped}\\1\\s*:`);
    const at = lines.findIndex((l) => head.test(l));
    if (at < 0) continue;
    let end = at;
    // the reason on the key's own line: that line alone; else the lines after it, up to the one that ends the entry
    if (!lines[at].replace(head, '').trim())
      while (end < lines.length - 1 && !/,\s*(\/\/.*)?$/.test(lines[end]) && !/^\s*}/.test(lines[end + 1])) end += 1;
    lines.splice(at, end - at + 1);
    removed.push(key);
  }
  return {
    text: lines.join('\n'),
    changed: removed.length > 0,
    removed,
    missing: keys.filter((k) => !removed.includes(k)),
  };
}

/** The baseline of check-unused (`{ kind: [id…] }`) without the ids `ids`. */
export function removeBaselineEntries(text, ids) {
  const drop = new Set(ids);
  return jsonEdit(text, (data) => {
    for (const kind of Object.keys(data))
      if (Array.isArray(data[kind])) data[kind] = data[kind].filter((id) => !drop.has(id));
  });
}

/** The indented lines that follow the first line of `output` matching `title`. */
function listAfter(output, title) {
  const lines = output.split('\n');
  const at = lines.findIndex((l) => title.test(l));
  if (at < 0) return [];
  const out = [];
  for (const line of lines.slice(at + 1)) {
    if (!/^ {2}\S/.test(line)) break;
    out.push(line.trim());
  }
  return out;
}

/** What `node scripts/check-unreached.mjs` said: { stale: [KEPT keys reached or gone], dead: [files reached by nothing] }. */
export function parseUnreached(output) {
  return {
    stale: listAfter(output, /listed as kept but are reached or gone/),
    dead: listAfter(output, /are reached by nothing/),
  };
}

/** What `node scripts/check-unused.mjs` said: { staleKept, staleBaseline, truncated, fresh }. */
export function parseUnused(output) {
  const baseline = listAfter(output, /line\(s\) of the baseline are not unused any more/);
  return {
    staleKept: listAfter(output, /these lines of KEPT keep nothing any more/),
    staleBaseline: baseline.filter((l) => l !== '…'),
    truncated: baseline.includes('…'),
    fresh: Number(/check-unused: (\d+) unused\./.exec(output)?.[1] ?? 0),
  };
}

const textFiles = (dir) =>
  fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && /\.(jsx?|mjs|json)$/.test(e.name))
    .map((e) => path.relative(dir, path.join(e.parentPath ?? e.path, e.name)))
    .sort();

/** The draft names of the four files the tree discovers, without their infix. */
export const undraft = (text) =>
  text.replace(/\b(lesson\.config|lesson\.pack|routes|sitting)\.draft\b/g, (_, name) => name);

/**
 * What it takes to put the lesson's drafts in place: { renames: [{ from, to }], rewrites: [{ file, text }] } —
 * relative to the lesson's folder. Refuses a draft whose final name exists already.
 */
export function draftPlan(dir) {
  const renames = [];
  for (const file of DRAFTS) {
    const from = draftName(file);
    if (!fs.existsSync(path.join(dir, from))) continue;
    if (fs.existsSync(path.join(dir, file))) throw new Error(`${from} and ${file} both exist: keep one`);
    renames.push({ from, to: file });
  }
  const rewrites = [];
  for (const file of textFiles(dir)) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const next = undraft(text);
    if (next !== text) rewrites.push({ file: renames.find((r) => r.from === file)?.to ?? file, text: next });
  }
  return { renames, rewrites };
}

export function applyDraftPlan(dir, { renames, rewrites }) {
  for (const { from, to } of renames) fs.renameSync(path.join(dir, from), path.join(dir, to));
  for (const { file, text } of rewrites) fs.writeFileSync(path.join(dir, file), text);
}

/** The files of the lesson that still say « SCAFFOLD: not written yet » or import the stubs' helper. */
export function unfinishedFiles(dir) {
  const helper = HELPER.replace(/\.js$/, '');
  return textFiles(dir).filter((file) => {
    if (file === HELPER) return false;
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    return text.includes(MARKER) || text.includes(helper);
  });
}
