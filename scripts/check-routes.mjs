// Vérifie que CHAQUE leçon est réellement atteignable depuis l'application.
//
// Le piège que ce script existe pour attraper : une leçon dont le `routes.jsx`
// n'est pas branché dans `App.jsx` ne provoque AUCUNE erreur. Le routeur
// retombe sur la page d'accueil commerciale, la page « rend » parfaitement, et
// tous les contrôles de source (validate:lessons, audit:knowledge, check:katex)
// restent verts — parce qu'ils lisent les fichiers, jamais l'application.
//
// 17 leçons de 2nde (129 pages) étaient dans cet état le 2026-09-07 : entièrement
// écrites, auditées, validées… et invisibles pour l'élève.
//
// SECONDE MOITIÉ, ajoutée le 2026-09-09 : une leçon peut être parfaitement
// branchée dans App.jsx et rester inatteignable, si son `LESSON_BASE_PATH` ne
// correspond pas au lien que la carte des cours construit. Ce lien vient de
// `buildLesson`, qui utilise l'ID DE LA LEÇON — pas le nom du dossier sur
// disque. `racines-carrees-4e` vivait dans un dossier `racines-carrees` et
// déclarait le chemin du dossier : ses routes existaient, l'import était là,
// ce script était vert, et chaque clic sur la carte renvoyait l'élève à
// l'accueil. Même symptôme, autre cause — d'où ce second contrôle.
//
//   node scripts/check-routes.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { courseLevels } from '../packages/core/curriculum/coursesData.js';

const ROOT = new URL('../', import.meta.url).pathname;
const APP = join(ROOT, 'apps/web/src/App.jsx');
const LESSONS = join(ROOT, 'apps/web/src/lessons');

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (e === 'routes.jsx') out.push(p);
  }
  return out;
};

const app = readFileSync(APP, 'utf8');
const problems = [];

for (const file of walk(LESSONS)) {
  const src = readFileSync(file, 'utf8');
  const fn = src.match(/export default function (\w+)/)?.[1];
  const rel = relative(ROOT, file);
  if (!fn) { problems.push({ rel, why: 'aucun export default nommé' }); continue; }

  // Les deux moitiés sont nécessaires : un import sans appel ne route rien,
  // et un appel sans import ne compile pas.
  const imported = new RegExp(`^import\\s+${fn}\\s+from`, 'm').test(app);
  const called = app.includes(`{${fn}()}`);
  if (!imported && !called) problems.push({ rel, why: `${fn} n'est ni importée ni appelée dans App.jsx` });
  else if (!imported) problems.push({ rel, why: `${fn} est appelée mais pas importée` });
  else if (!called) problems.push({ rel, why: `${fn} est importée mais jamais appelée — la leçon est inatteignable` });
}

// ── Contrôle 2 : le chemin déclaré est-il celui du lien de la carte ? ──────
const catalogue = new Map();
for (const niveau of courseLevels) {
  for (const grade of niveau.grades) {
    for (const chapitre of grade.chapters) {
      for (const lecon of chapitre.lessons) catalogue.set(`${grade.id}:${lecon.id}`, lecon.path);
    }
  }
}

const walkConfigs = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walkConfigs(p, out);
    else if (e === 'lesson.config.js') out.push(p);
  }
  return out;
};

for (const file of walkConfigs(LESSONS)) {
  const src = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file);
  const base = src.match(/LESSON_BASE_PATH\s*=\s*'([^']+)'/)?.[1];
  const id = src.match(/^\s*id:\s*'([^']+)'/m)?.[1];
  const grade = file.match(/lessons\/(?:college|lycee)\/([^/]+)\//)?.[1];
  if (!base || !id || !grade) continue;   // validate-lessons.mjs juge la forme

  const attendu = catalogue.get(`${grade}:${id}`);
  if (!attendu) continue;                  // validate-lessons.mjs juge l'appartenance
  if (attendu !== base) {
    problems.push({
      rel,
      why: `LESSON_BASE_PATH vaut '${base}' alors que la carte des cours pointe sur '${attendu}' — le clic retombera sur l'accueil`,
    });
  }
}

const total = walk(LESSONS).length;
if (problems.length) {
  console.error(`\n${problems.length} leçon(s) inatteignable(s) sur ${total} :\n`);
  for (const p of problems) console.error(`  ✗ ${p.rel}\n      ${p.why}`);
  console.error('\nUne leçon non branchée dans App.jsx ne renvoie pas une 404 :');
  console.error("l'utilisateur atterrit sur la page d'accueil, et aucun autre contrôle ne le voit.\n");
  process.exit(1);
}
console.log(`✅ Les ${total} leçons sont branchées dans App.jsx, et leur chemin est celui du catalogue.`);
