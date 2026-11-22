// NO ARABIC CHARACTER anywhere in the web (docs/FRANCE_REBUILD_PLAN.md §4quater, rule 8;
// FRENCH_LANGUAGE_CONTRACT.md §10): every text file of `src/`, `public/`, `e2e/`, `scripts/` and `index.html`,
// comments and tests included. The files are read as TEXT, nothing is imported: the check stays fast.
//
// Paths are relative to apps/web. A glob follows `fs.globSync` (`**` = any depth).
import { describe, it, expect } from 'vitest';
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const GLOBS = ['src/**', 'public/**', 'e2e/**', 'scripts/**', 'index.html', '*.js'];

// THE ONE EXEMPTION — the books store. It is off (`config/features.js › books`) until the French books exist; its
// folder, the admin's books pages and the five `nav.books*` labels of `admin.json` keep their Arabic until then. When
// the books are written in French, this exemption leaves.
const EXEMPT_FILES = [/^src\/features\/books\//, /^src\/pages\/admin\/books\//];
const EXEMPT_KEYS = { 'src/i18n/locales/fr/admin.json': /^nav\.books\w*$/ };

// Only text is read: an image or a font may hold any byte.
const TEXT = /\.(jsx?|mjs|cjs|json|css|html|md|txt|xml|webmanifest|svg|sh|py)$|(^|\/)\.htaccess$/;

// Arabic, Arabic Supplement, Arabic Extended-A, and the two blocks of presentation forms (U+FEFF, the BOM, is not
// Arabic).
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/;

function filesOf(globs) {
  const files = new Set();
  for (const glob of globs) {
    for (const file of globSync(glob, { cwd: WEB })) {
      const relative = file.split(path.sep).join('/');
      if (relative.includes('node_modules/')) continue;
      if (TEXT.test(relative) && !EXEMPT_FILES.some((rule) => rule.test(relative))) files.add(relative);
    }
  }
  return [...files].sort();
}

/** The values of a JSON catalogue, flattened to `a.b.c` keys. */
function flatten(node, prefix = '', out = []) {
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) flatten(value, prefix ? `${prefix}.${key}` : key, out);
  } else out.push([prefix, String(node)]);
  return out;
}

function arabicIn(file) {
  const raw = readFileSync(path.join(WEB, file), 'utf8');
  const exemptKey = EXEMPT_KEYS[file];
  if (exemptKey) {
    return flatten(JSON.parse(raw))
      .filter(([key, value]) => !exemptKey.test(key) && (ARABIC.test(key) || ARABIC.test(value)))
      .map(([key, value]) => `${file} › ${key}: ${value.slice(0, 80)}`);
  }
  const found = [];
  raw.split('\n').forEach((line, index) => {
    if (ARABIC.test(line)) found.push(`${file}:${index + 1}: ${line.trim().slice(0, 80)}`);
  });
  return found;
}

describe('no Arabic in the web', () => {
  const files = filesOf(GLOBS);

  it('reads the whole web: src, public, e2e, scripts, index.html', () => {
    for (const glob of GLOBS) expect(globSync(glob, { cwd: WEB }).length, glob).toBeGreaterThan(0);
    for (const root of ['src/', 'public/', 'e2e/', 'scripts/']) {
      expect(files.some((file) => file.startsWith(root)), root).toBe(true);
    }
    expect(files).toContain('index.html');
    expect(files).toContain('src/i18n/locales/fr/admin.json');
    expect(files.length).toBeGreaterThan(1000);
  });

  it('no line of these files holds an Arabic character', () => {
    expect(files.flatMap(arabicIn)).toEqual([]);
  });

  it('the exemption is the books store and nothing else', () => {
    expect(files.some((file) => file.startsWith('src/features/books/'))).toBe(false);
    expect(files.some((file) => file.startsWith('src/pages/admin/books/'))).toBe(false);
    const admin = flatten(JSON.parse(readFileSync(path.join(WEB, 'src/i18n/locales/fr/admin.json'), 'utf8')));
    const exempted = admin.filter(([key]) => EXEMPT_KEYS['src/i18n/locales/fr/admin.json'].test(key)).map(([k]) => k);
    expect(exempted.sort()).toEqual(['nav.books', 'nav.booksCatalog', 'nav.booksManagers', 'nav.booksMessages', 'nav.booksOrders']);
  });

  it('catches an Arabic character, and lets French through', () => {
    expect(ARABIC.test('Ma progression — « 3 leçons »')).toBe(false);
    expect(ARABIC.test('\u062F\u0631\u0633')).toBe(true);
    expect(ARABIC.test('\uFEFB')).toBe(true);
    expect(ARABIC.test('\uFEFF')).toBe(false);
  });
});
