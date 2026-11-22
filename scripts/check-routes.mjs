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
// TROISIÈME FORME, 2026-10-14 : App.jsx n'importe plus le routes.jsx de chaque
// leçon (74 imports statiques = tout le contenu des leçons dans le lot
// d'entrée). Il monte UNE frontière paresseuse, `useLessonRoutes()`
// (apps/web/src/lessons/lessonRouteBoundary.jsx), qui donne une route par
// leçon de l'INDEX GÉNÉRÉ (lessonIndex.generated.json) et charge son
// routes.jsx par les globs de lessonLoaders.js. « Branchée » veut donc dire :
// la frontière est montée sous RequireAccount, la leçon est dans l'index, son
// routes.jsx est une fabrique `buildLessonRoutes`, et le glob de sa classe est
// dans lessonLoaders.js. registry.test.js charge ensuite RÉELLEMENT les routes
// de chaque leçon et vérifie qu'elles montent son sommaire et ses modules.
//
//   node scripts/check-routes.mjs
//
// Dormant-grade isolation (docs/ALGERIA_MIGRATION_AUDIT.md §15,
// ALGERIA_PLATFORM_MASTER_SPEC.md §3): Contrôle 1 below only REQUIRES a
// mount for lessons under an active grade (activeGrades.js). A lesson under a
// dormant grade must NOT be in the index nor in a loader glob — mounting one
// would defeat the isolation this same check exists to protect elsewhere. The
// script fails just as loudly on that direction of mistake (an unexpected
// mount) as on the original one (a missing mount).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { dzCourseLevels } from '../packages/core/curriculum/coursesData.js';
import { ACTIVE_GRADE_IDS } from '../packages/core/curriculum/activeGrades.js';

const ROOT = new URL('../', import.meta.url).pathname;
const APP = join(ROOT, 'apps/web/src/App.jsx');
const LESSONS = join(ROOT, 'apps/web/src/lessons');
const INDEX = JSON.parse(readFileSync(join(LESSONS, 'lessonIndex.generated.json'), 'utf8'));
const LOADERS = readFileSync(join(LESSONS, 'lessonLoaders.js'), 'utf8');

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

// Les niveaux ALGÉRIENS (`moyen`, `thanawi`) autant que les français hérités.
// Sans eux, une leçon de 4AM (apps/web/src/lessons/moyen/4am/...) serait vue
// comme SANS CLASSE : `gradeIdFromPath` rendrait null, la leçon passerait pour
// dormante, et son entrée dans l'index ferait échouer ce contrôle en
// annonçant une « fuite de contenu dormant ». Le piège est documenté dans
// docs/ALGERIA_4AM_CURRICULUM.md §8.
const LESSON_PATH_RE = /lessons\/(?:college|lycee|moyen|thanawi)\/([^/]+)\//;

const gradeIdFromPath = (rel) => rel.match(LESSON_PATH_RE)?.[1] ?? null;

// ── Contrôle 0 : la frontière est montée, et c'est la SEULE voie ───────────
// Aucun routes.jsx importé statiquement par App.jsx : un seul suffirait à
// remettre une leçon (et sa config) dans le lot d'entrée de chaque visiteur.
if (/^import\s+\w+\s+from\s+'\.\/lessons\/.+\/routes(?:\.jsx)?';/m.test(app)) {
  problems.push({ rel: 'apps/web/src/App.jsx', why: "un routes.jsx de leçon est importé STATIQUEMENT — passer par la frontière (useLessonRoutes, BUNDLE_BOUNDARIES.md)" });
}
const boundaryImported = /^import\s+\{\s*useLessonRoutes\s*\}\s+from\s+'\.\/lessons\/lessonRouteBoundary';/m.test(app);
const boundaryCalled = /const\s+lessonRoutes\s*=\s*useLessonRoutes\(\)/.test(app);
// Montée là où étaient les leçons : sous <RequireAccount />, dans la coquille CourseLayout.
const requireAccountBlock = app.slice(app.indexOf('<Route element={<RequireAccount />}>'));
const boundaryMounted = app.includes('<Route element={<RequireAccount />}>') && requireAccountBlock.slice(0, requireAccountBlock.indexOf('</Route>\n')).includes('{lessonRoutes}');
if (!boundaryImported || !boundaryCalled || !boundaryMounted) {
  problems.push({ rel: 'apps/web/src/App.jsx', why: `la frontière de routes des leçons n'est pas montée (import ${boundaryImported ? '✓' : '✗'}, appel ${boundaryCalled ? '✓' : '✗'}, {lessonRoutes} sous RequireAccount ${boundaryMounted ? '✓' : '✗'}) — aucune leçon n'est atteignable` });
}

// ── Contrôle 1 : chaque leçon active est dans l'index et dans un glob ─────
const indexed = new Map(INDEX.lessons.map((l) => [l.id, l]));
for (const file of walk(LESSONS)) {
  const src = readFileSync(file, 'utf8');
  const fn = src.match(/export default function (\w+)/)?.[1];
  const rel = relative(ROOT, file);
  if (!fn) { problems.push({ rel, why: 'aucun export default nommé' }); continue; }

  const gradeId = gradeIdFromPath(rel);
  const isActive = ACTIVE_GRADE_IDS.includes(gradeId);
  const id = basename(dirname(file));
  const entry = indexed.get(id);
  const globbed = LOADERS.includes(`'./*/${gradeId}/**/routes.jsx'`);

  if (isActive) {
    if (!/return\s+buildLessonRoutes\(/.test(src)) problems.push({ rel, why: `${fn} n'appelle pas buildLessonRoutes(…) — la frontière ne sait monter que cette fabrique` });
    if (!entry) problems.push({ rel, why: `« ${id} » n'est pas dans lessonIndex.generated.json — la leçon est inatteignable (node scripts/generate-lesson-index.mjs)` });
    else if (entry.grade !== gradeId) problems.push({ rel, why: `l'index range « ${id} » en '${entry.grade}', le dossier en '${gradeId}'` });
    if (!globbed) problems.push({ rel, why: `lessonLoaders.js ne glob pas './*/${gradeId}/**/routes.jsx' — ses routes ne se chargeront jamais` });
  } else if (entry || globbed) {
    problems.push({ rel, why: `« ${id} » est montable (index ${entry ? '✓' : '✗'}, glob ${globbed ? '✓' : '✗'}) mais sa classe ('${gradeId}') n'est pas active — fuite de contenu dormant (activeGrades.js)` });
  }
}
// L'index ne nomme que des leçons qui existent sur le disque.
const onDisk = new Set(walk(LESSONS).map((f) => basename(dirname(f))));
for (const id of indexed.keys()) {
  if (!onDisk.has(id)) problems.push({ rel: 'apps/web/src/lessons/lessonIndex.generated.json', why: `« ${id} » est indexée mais n'a pas de routes.jsx` });
}

// ── Contrôle 2 : le chemin déclaré est-il celui du lien de la carte ? ──────
// Contre le catalogue DZ : les leçons algériennes écrites sous
// lessons/moyen/4am/ (le catalogue français a été supprimé le 2026-09-25).
const catalogue = new Map();
for (const niveau of dzCourseLevels) {
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
  const grade = file.match(LESSON_PATH_RE)?.[1];
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

// ── Contrôle 3 : la page d'UNITÉ (الوحدة) est-elle montée ? ────────────────
// Le catalogue DZ construit un chemin `/courses/<niveau>/<classe>/<chapitre>/units/<unité>`
// pour chaque unité du manuel (coursesData.js, buildDzUnitPath). App.jsx doit
// monter une route qui l'attrape, sinon la carte d'unité mène à l'accueil —
// exactement le silence que ce script existe pour rompre.
const hasUnits = dzCourseLevels.some((l) => l.grades.some((g) => g.chapters.some((c) => (c.units ?? []).length > 0)));
if (hasUnits && !/path=\{?["'`]\/courses\/:levelId\/:gradeId\/:chapterId\/units\/:unitId["'`]\}?/.test(app)) {
  problems.push({ rel: 'apps/web/src/App.jsx', why: "le catalogue déclare des unités du manuel mais aucune route `/courses/:levelId/:gradeId/:chapterId/units/:unitId` n'est montée — la page d'unité retombera sur l'accueil" });
}

const total = walk(LESSONS).length;
const totalActive = walk(LESSONS).filter((f) => ACTIVE_GRADE_IDS.includes(gradeIdFromPath(relative(ROOT, f)))).length;
if (problems.length) {
  console.error(`\n${problems.length} problème(s) de routage sur ${total} leçon(s) (${totalActive} active(s)) :\n`);
  for (const p of problems) console.error(`  ✗ ${p.rel}\n      ${p.why}`);
  console.error('\nUne leçon active non montée ne renvoie pas une 404 :');
  console.error("l'utilisateur atterrit sur la page d'accueil, et aucun autre contrôle ne le voit.");
  console.error("Une leçon dormante branchée par erreur fuit du contenu français désactivé (activeGrades.js).\n");
  process.exit(1);
}
console.log(`✅ Les ${totalActive} leçon(s) active(s) sur ${total} sont montées par la frontière de routes (index + globs, et seulement elles), et leur chemin est celui du catalogue.`);
