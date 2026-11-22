/**
 * The unused-code check, run on a small tree made for it (`__fixtures__/unused` — its « test » file sits in `__tests__/` under a plain name so that Vitest does not run it): what it must report, and above
 * all what it must NOT report — it may never ask to delete something alive.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = execFileSync('node', [path.join(here, 'check-unused.mjs'), '--list'], {
  env: { ...process.env, CHECK_UNUSED_ROOT: path.join(here, '__fixtures__/unused') },
  encoding: 'utf8',
});
const reported = (text) => output.includes(text);

describe('check-unused — exports', () => {
  it('reports an export that nothing imports', () => {
    expect(reported('things.js:3  deadExport  (imported by nothing)')).toBe(true);
    expect(reported('index.js:2  coreDead')).toBe(true);
  });
  it('tells when only the word `export` is useless', () => {
    expect(reported('onlyInside  (imported by nothing — its file uses it')).toBe(true);
  });
  it('reports an export that only a test imports, unless its own file uses it', () => {
    expect(reported('testedOnly  (imported by a test only')).toBe(true);
    expect(reported('testedAndUsedInside')).toBe(false);
  });
  it('follows an alias, a default import, a barrel, a lazy import and a glob', () => {
    for (const name of ['usedByAlias', '  used  ', 'fromBarrel', 'LazyPage', 'meta', 'Home', 'coreUsed']) expect(reported(name)).toBe(false);
  });
  it('does not let a barrel hide a dead export', () => {
    expect(reported('barrel.js:1  hiddenByBarrel')).toBe(true);
  });
  it('a namespace handed over whole (`...icons`) uses everything; read by name, only that name', () => {
    expect(reported('sun')).toBe(false);
    expect(reported('moon')).toBe(false);
    expect(reported('square')).toBe(false);
    expect(reported('shapes.js:2  circle')).toBe(true);
  });
});

describe('check-unused — i18n keys', () => {
  it('reports a key that nothing writes', () => {
    expect(reported('app.json  home.dead')).toBe(true);
    expect(reported('app.json  orphan')).toBe(true);
  });
  it('accepts a key written whole, built (`status.${kind}`) or plural', () => {
    for (const key of ['home.title', 'status.warm', 'status.cold', 'count_one', 'count_other']) expect(reported(`app.json  ${key}`)).toBe(false);
  });
});

describe('check-unused — string tables', () => {
  it('reports an entry that nothing reads', () => {
    expect(reported('strings.js:3  T.deadLine')).toBe(true);
    expect(reported('T.deadGroup.c')).toBe(true);
  });
  it('accepts an entry read by name, a group spread (`...T.group`) and a group read by a computed key', () => {
    for (const entry of ['T.title', 'T.group.a', 'T.group.b', 'T.byKind.warm', 'T.byKind.cold']) expect(reported(entry)).toBe(false);
  });
});
