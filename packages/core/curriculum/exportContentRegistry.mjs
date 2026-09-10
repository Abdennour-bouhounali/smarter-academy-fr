// Exporte le REGISTRE DE CONTENU — modules de leçon et exercices de pratique —
// pour l'importateur Laravel (php artisan smarter:import-content-registry).
//
// Même poignée de main, et pour la même raison, que exportCurriculum.mjs :
// PHP ne peut pas importer un module ES, et réécrire en PHP la façon dont un
// lesson.config.js déclare ses modules créerait une seconde définition qui
// dériverait. La frontière est ce fichier généré.
//
// Ce que l'export porte : l'IDENTITÉ des modules et des exercices, jamais leur
// contenu pédagogique. Le contenu reste dans le JSX et dans content/practice/ ;
// la base n'en reçoit que de quoi accrocher un état de publication.
//
// Pourquoi un import() dynamique plutôt qu'une lecture d'AST (la méthode de
// scripts/lib/lessonAst.mjs) : les 132 lesson.config.js sont des modules ES
// purs, sans JSX ni React, et les importer donne des valeurs DÉJÀ RÉSOLUES —
// `path` est bâti par interpolation de LESSON_BASE_PATH, ce qu'une lecture
// littérale de l'AST ne verrait pas. Vérifié sur les 132 fichiers.
//
// Usage: node packages/core/curriculum/exportContentRegistry.mjs [outputPath]

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const lessonsRoot = join(repoRoot, 'apps/web/src/lessons');
const practiceRoot = join(repoRoot, 'content/practice');
const outputPath = resolve(
  process.argv[2] || join(here, '.generated/content-registry-export.json')
);

/** Chaque dossier contenant un lesson.config.js (recherche en profondeur). */
function findLessonDirs(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (existsSync(join(full, 'lesson.config.js'))) acc.push(full);
    else findLessonDirs(full, acc);
  }
  return acc;
}

const lessons = [];
const problems = [];

for (const dir of findLessonDirs(lessonsRoot)) {
  let config;
  try {
    const mod = await import(pathToFileURL(join(dir, 'lesson.config.js')).href);
    config = mod.LESSON_CONFIG;
  } catch (error) {
    problems.push(`${dir}: import impossible — ${error.message}`);
    continue;
  }

  if (!config?.id) {
    problems.push(`${dir}: LESSON_CONFIG.id manquant`);
    continue;
  }
  if (!Array.isArray(config.modules)) {
    problems.push(`${dir}: LESSON_CONFIG.modules absent`);
    continue;
  }

  lessons.push({
    // `id` est la clé de rapprochement avec lessons.code en base — le NOM DU
    // DOSSIER ne l'est pas (racines-carrees-4e vit dans un dossier
    // racines-carrees). Voir docs : LESSON_BASE_PATH = l'id, pas le dossier.
    code: config.id,
    grade: config.grade ?? null,
    modules: config.modules.map((m, index) => ({
      code: String(m.id ?? m.number ?? index),
      number: Number.isFinite(m.number) ? m.number : index,
      slug: m.slug ?? null,
      title: m.title ?? '',
      description: m.desc ?? null,
      stage: m.stage ?? null,
      estimatedMin: Number.isFinite(m.estimatedMin) ? m.estimatedMin : null,
      difficulty: Number.isFinite(m.difficulty) ? m.difficulty : null,
      // null (et non []) quand le module n'en déclare aucun : « ce module
      // n'enseigne aucun point » et « on n'a pas regardé » ne sont pas la
      // même chose. 265 modules sur 1082 sont dans ce cas.
      teachesLearningPointCodes: Array.isArray(m.teachesLearningPointIds)
        ? m.teachesLearningPointIds
        : null,
    })),
  });
}

// --- Exercices de pratique -------------------------------------------------
// Lus depuis l'index généré par validate-exercises.mjs, la même source que
// l'ExerciseRepository de Laravel : deux lectures du même fichier, jamais deux
// façons de recenser.
const exercises = [];
const indexPath = join(practiceRoot, 'index.generated.json');

if (existsSync(indexPath)) {
  const index = JSON.parse(await readFile(indexPath, 'utf8'));

  for (const [lessonCode, levels] of Object.entries(index)) {
    for (const [level, ids] of Object.entries(levels)) {
      for (const exerciseCode of ids) {
        // Le titre et le nombre de questions se lisent dans le fichier de
        // l'exercice : ce sont les deux seules choses dont l'administration a
        // besoin pour afficher une ligne de tableau sans ouvrir le contenu.
        // Le fichier vit sous content/practice/<niveau>/<leçon>/level-N/ ;
        // le segment <niveau> n'est pas connu ici, d'où le balayage.
        let title = null;
        let questionCount = 0;
        for (const dirName of readdirSync(practiceRoot)) {
          const file = join(practiceRoot, dirName, lessonCode, `level-${level}`, `${exerciseCode}.json`);
          if (!existsSync(file)) continue;
          const data = JSON.parse(await readFile(file, 'utf8'));
          title = data?.metadata?.title ?? null;
          questionCount = Array.isArray(data?.questions) ? data.questions.length : 0;
          break;
        }

        exercises.push({
          lessonCode,
          exerciseCode,
          level: Number(level),
          title,
          questionCount,
        });
      }
    }
  }
}

if (problems.length) {
  console.error('Problèmes rencontrés :');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  JSON.stringify({ exportedAt: null, lessons, exercises }, null, 2) + '\n'
);

const moduleCount = lessons.reduce((n, l) => n + l.modules.length, 0);
console.log(`Content registry export written to ${outputPath}`);
console.log(`${lessons.length} lessons, ${moduleCount} modules, ${exercises.length} exercises`);
