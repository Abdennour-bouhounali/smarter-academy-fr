import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * Le JARDIN CLOS de l'espace élève (docs/architecture/PARENT_SPACE.md §7),
 * vérifié sur la SOURCE comme teacherContract.test.js.
 *
 * Un parent qui confie un ordinateur doit pouvoir compter sur ceci : depuis
 * une leçon, un exercice, l’atelier, un jeu ou le profil, AUCUN lien ne mène
 * hors de la plateforme — pas de vidéo intégrée, pas de réseau social, pas de
 * publicité. Une adresse externe dans ces dossiers fait échouer ce test ; une
 * exception (une ressource, jamais un lien cliquable) s'ajoute à ALLOWED avec
 * sa raison.
 */
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..');

const STUDENT_DIRS = [
  'lessons',
  'pages/student',
  'components/student',
  'features/learning',
  'features/practice',
  'features/progression',
  'features/madar',
  'features/dailyChallenge',
  'features/mathlab',
  'features/notifications',
  'features/settings',
  'features/tours',
  'features/studyTime',
  'features/family',
  'components/layout/StudentLayout.jsx',
  'components/layout/CourseLayout.jsx',
];

// Adresses permises : des RESSOURCES, jamais un lien que l'élève suit.
const ALLOWED = [
  /^https?:\/\/www\.w3\.org\//, // espaces de noms SVG / XML
  /^http:\/\/localhost:3000\/api\/v1/, // repli de VITE_API_URL (services)
];

function walk(path) {
  if (!statSync(path).isDirectory()) return [path];
  const out = [];
  for (const name of readdirSync(path)) {
    const full = join(path, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(jsx?|mjs)$/.test(name) && !/\.test\./.test(name)) out.push(full);
  }
  return out;
}

const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

describe('l’espace élève est un jardin clos', () => {
  for (const rel of STUDENT_DIRS) {
    it(`${rel} ne contient aucune adresse externe`, () => {
      for (const file of walk(resolve(src, rel))) {
        const code = stripComments(readFileSync(file, 'utf8'));
        for (const match of code.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
          expect(ALLOWED.some((re) => re.test(match[0])), `${file} : ${match[0]}`).toBe(true);
        }
        expect(code, `${file} ouvre une fenêtre`).not.toMatch(/window\.open\(/);
      }
      // reads every file of the folder: under 1 s alone, over the default 5 s among the whole suite (2026-11-19)
    }, 60_000);
  }

  it('le tableau blanc refuse les intégrations et n’ouvre aucun lien sortant', () => {
    const code = readFileSync(resolve(src, 'features/mathlab/tools/whiteboard/WhiteboardTool.jsx'), 'utf8');
    expect(code).toMatch(/validateEmbeddable=\{BLOCK_ALL_EMBEDS\}/);
    expect(code).toMatch(/const BLOCK_ALL_EMBEDS = \(\) => false;/);
    expect(code).toMatch(/onLinkOpen=\{keepLinksInside\}/);
  });
});
