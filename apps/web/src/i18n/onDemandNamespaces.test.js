// `admin` et `teacher` sont des namespaces À LA DEMANDE (i18n/index.js, BUNDLE_BOUNDARIES.md §3) : ils arrivent
// avec leur espace, pas avec l'application. Un composant PARTAGÉ qui en lirait un suspendrait la page d'un élève —
// ou afficherait une clé brute. Ce test tient la liste de ceux qui ont le droit de les lire.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Qui peut lire chaque namespace : des dossiers (leur espace) et, un par un, les composants rendus POUR ce rôle ailleurs. */
const READERS = {
  admin: ['pages/admin/', 'components/admin/'],
  teacher: [
    'pages/teacher/',
    'features/teacher/',
    'components/teacher/', // rendu par UnitPage pour un enseignant seulement
    'features/practice/PracticeEntryCard.jsx', // dans TeacherPracticeEntry, rendu pour un enseignant seulement
    'pages/student/practice/PracticeHub.jsx', // déclaré seulement quand `isTeacher`
  ],
};

/** Les primitives que l'espace professeur, l'établissement et « Ma classe » rendent aussi : elles lisent `common › ui.*`. */
const SHARED_PRIMITIVES = ['Modal.jsx', 'FilterBar.jsx', 'DataTable.jsx', 'states.jsx', 'SelectionCheckbox.jsx'];

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.jsx?$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = sourceFiles(SRC).map((file) => [path.relative(SRC, file), fs.readFileSync(file, 'utf8')]);
const reads = (namespace) =>
  new RegExp(`useTranslation\\(\\s*[^)]*['"]${namespace}['"]|['"\`]${namespace}:|ns:\\s*['"]${namespace}['"]`);

describe('on-demand namespaces', () => {
  it.each(Object.keys(READERS))('« %s » is read only inside its own space', (namespace) => {
    const outside = files
      .filter(([, text]) => reads(namespace).test(text))
      .map(([file]) => file)
      .filter((file) => !READERS[namespace].some((allowed) => file.startsWith(allowed)));
    expect(outside).toEqual([]);
  });

  it('the shared primitives of components/admin/ui read the eager `common` namespace', () => {
    for (const name of SHARED_PRIMITIVES) {
      const text = fs.readFileSync(path.join(SRC, 'components/admin/ui', name), 'utf8');
      expect(reads('admin').test(text), name).toBe(false);
    }
  });

  it('neither namespace is bundled with the application', () => {
    const setup = fs.readFileSync(path.join(SRC, 'i18n/index.js'), 'utf8');
    expect(setup).not.toMatch(/^import \w+ from '\.\/locales\/ar\/(admin|teacher)\.json'/m);
  });
});
