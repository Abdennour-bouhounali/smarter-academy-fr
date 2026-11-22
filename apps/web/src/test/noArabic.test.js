// NO ARABIC CHARACTER in the folders already translated to French (docs/FRANCE_REBUILD_PLAN.md §4quater, rule 8;
// FRENCH_LANGUAGE_CONTRACT.md §10). The files are read as TEXT, nothing is imported: the check stays fast.
//
// Each line of GLOBS is a folder (or a file) whose agent has finished. NEXT AGENT: when your folders hold no Arabic
// any more — comments and tests included —, add them below, one glob per line, and run this test. When every folder
// is clean, the list becomes the whole of `src/` (minus the exemption) and this check guards the tree.
//
// Paths are relative to apps/web. A glob follows `fs.globSync` (`**` = any depth).
import { describe, it, expect } from 'vitest';
import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const GLOBS = [
  // Foundation
  'src/locale.js',
  'src/i18n/index.js',
  'src/i18n/*.test.js',
  'src/i18n/locales/ar/common.json',
  'src/i18n/locales/ar/nav.json',
  'src/utils/**',
  'src/hooks/**',
  'src/context/**',
  'src/services/*',
  'src/services/teacher/**',
  'src/components/common/**',
  'src/components/layout/**',
  'src/components/navigation/**',
  'src/components/*.*',
  'src/data/**',
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/test/**',
  'index.html',
  'public/*.*',
  'public/.htaccess',
  'public/excalidraw/README.md',
  'tailwind.config.js',
  'postcss.config.js',
  'vite*.js',
];

// The books store is off until the French books exist (config/features.js): its folder keeps its Arabic until then.
const EXEMPT = [/^src\/features\/books\//];

// Only text is read: an image or a font may hold any byte.
const TEXT = /\.(jsx?|mjs|cjs|json|css|html|md|txt|xml|webmanifest|svg)$|(^|\/)\.htaccess$/;

// Arabic, Arabic Supplement, Arabic Extended-A, and the two blocks of presentation forms.
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function filesOf(globs) {
  const files = new Set();
  for (const glob of globs) {
    for (const file of globSync(glob, { cwd: WEB })) {
      const relative = file.split(path.sep).join('/');
      if (TEXT.test(relative) && !EXEMPT.some((rule) => rule.test(relative))) files.add(relative);
    }
  }
  return [...files].sort();
}

describe('no Arabic in the translated folders', () => {
  const files = filesOf(GLOBS);

  it('finds the files it guards (a glob that matches nothing is a typo)', () => {
    for (const glob of GLOBS) expect(globSync(glob, { cwd: WEB }).length, glob).toBeGreaterThan(0);
    expect(files.length).toBeGreaterThan(50);
  });

  it('no line of these files holds an Arabic character', () => {
    const found = [];
    for (const file of files) {
      const lines = readFileSync(path.join(WEB, file), 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (ARABIC.test(line)) found.push(`${file}:${index + 1}: ${line.trim().slice(0, 80)}`);
      });
    }
    expect(found).toEqual([]);
  });

  it('catches an Arabic character, and lets French through', () => {
    expect(ARABIC.test('Ma progression — « 3 leçons »')).toBe(false);
    expect(ARABIC.test('\u062F\u0631\u0633')).toBe(true);
    expect(ARABIC.test('\uFEFB')).toBe(true);
  });
});
