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
//   node scripts/check-routes.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

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

const total = walk(LESSONS).length;
if (problems.length) {
  console.error(`\n${problems.length} leçon(s) inatteignable(s) sur ${total} :\n`);
  for (const p of problems) console.error(`  ✗ ${p.rel}\n      ${p.why}`);
  console.error('\nUne leçon non branchée dans App.jsx ne renvoie pas une 404 :');
  console.error("l'utilisateur atterrit sur la page d'accueil, et aucun autre contrôle ne le voit.\n");
  process.exit(1);
}
console.log(`✅ Les ${total} leçons sont branchées dans App.jsx.`);
