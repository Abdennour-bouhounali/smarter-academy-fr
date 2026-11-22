// Garde d'INTÉGRATION CONTINUE : le catalogue et l'API doivent s'accorder sur
// ce qui est OUVERT (activation des classes) et sur ce qui EXISTE (leçons).
//
// Le PALIER (gratuit / premium) n'est PAS contrôlé ici, et c'est voulu : il
// appartient à la base (`lessons.tier`, décidé par l'administrateur), pas au
// catalogue. Le catalogue n'en porte aucun ; comparer les deux ferait passer
// chaque décision d'administration pour une « dérive ». La base contrôle ses
// propres paliers (valeur explicite et connue) : `smarter:registry-health`.
//
// ── Pourquoi cette garde existe ─────────────────────────────────────────
// L'activation d'une classe et la liste des leçons vivent dans le code
// JavaScript (activeGrades.js, coursesData.js), mais l'autorité côté serveur
// est la base (`grades.is_active`, `lessons`). Entre les deux, une
// poignée de main en DEUX temps :
//
//   node packages/core/curriculum/exportCurriculum.mjs   (1) écrit l'export
//   php artisan smarter:import-curriculum                (2) le recopie en base
//
// Oublier l'un des deux ne casse rien de visible : les tests passent, le
// build passe, l'application démarre. Et pourtant les deux autorités ne
// disent plus la même chose. Les deux sens de la divergence font mal :
//
//   le frontend cache une leçon que l'API sert    → fuite de contenu dormant
//   le catalogue déclare une leçon que la base ignore → leçon inaccessible
//
// C'est exactement le problème d'« autorités concurrentes » que la reprise
// précédente avait identifié et laissé sans porte (rapport de reprise §18,
// risque 3 : « mitigé par le rapport registry-health — PAS encore une garde
// d'intégration continue »). Cette garde est cette porte.
//
// ── Ce qu'elle vérifie, en deux temps ───────────────────────────────────
//   1. L'EXPORT EST-IL À JOUR ? On reconstruit le catalogue en mémoire et on
//      le compare au fichier .generated/. Un écart = quelqu'un a modifié
//      activeGrades.js ou le catalogue sans relancer l'export.
//   2. LA BASE SUIT-ELLE L'EXPORT ? Délégué à `php artisan
//      smarter:registry-health --gate`, qui est la seule autorité sur ce que
//      la base contient.
//
// L'étape 2 exige une base de données joignable. C'est délibéré : une porte
// qui ne peut pas vérifier ne s'ouvre pas. Elle peut être sautée
// explicitement (SKIP_DB_DRIFT_CHECK=1) pour un environnement sans base —
// mais le saut est alors une décision visible, pas un silence.
//
//   node scripts/check-activation-drift.mjs
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dzCourseLevels } from '../packages/core/curriculum/coursesData.js';
import { isGradeActive } from '../packages/core/curriculum/activeGrades.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportPath = resolve(repoRoot, 'packages/core/curriculum/.generated/curriculum-export.json');

const problems = [];

/**
 * Le même extrait que celui qu'écrit exportCurriculum.mjs, réduit à ce que
 * cette garde surveille : l'activation par classe et la présence des leçons.
 *
 * Volontairement une PROJECTION et non l'export complet : comparer titres et
 * descriptions ferait échouer la garde sur une correction de faute de frappe,
 * ce qui apprendrait surtout à la contourner.
 */
function projectFromSource() {
  const grades = {};
  for (const level of dzCourseLevels) {
    for (const grade of level.grades) {
      const lessons = {};
      for (const chapter of grade.chapters) {
        for (const lesson of chapter.lessons) {
          lessons[lesson.id] = true;
        }
      }
      grades[grade.id] = { active: isGradeActive(grade.id), lessons };
    }
  }
  return grades;
}

function projectFromExport(exported) {
  const grades = {};
  for (const grade of exported.grades ?? []) {
    const lessons = {};
    for (const chapter of grade.chapters ?? []) {
      for (const lesson of chapter.lessons ?? []) {
        lessons[lesson.code] = true;
      }
    }
    grades[grade.code] = { active: Boolean(grade.active), lessons };
  }
  return grades;
}

// ── 1. L'export est-il à jour ? ────────────────────────────────────────
let exported = null;
try {
  exported = JSON.parse(await readFile(exportPath, 'utf8'));
} catch {
  problems.push(
    `L'export du catalogue est absent ou illisible (${exportPath}).\n` +
      '    Lancez : node packages/core/curriculum/exportCurriculum.mjs',
  );
}

if (exported) {
  const source = projectFromSource();
  const onDisk = projectFromExport(exported);

  for (const [gradeId, expected] of Object.entries(source)) {
    const actual = onDisk[gradeId];

    if (!actual) {
      problems.push(`Classe « ${gradeId} » présente dans coursesData.js mais absente de l'export — l'export est périmé.`);
      continue;
    }

    if (actual.active !== expected.active) {
      problems.push(
        `Classe « ${gradeId} » : activeGrades.js dit ${expected.active ? 'ACTIVE' : 'inactive'}, ` +
          `l'export dit ${actual.active ? 'ACTIVE' : 'inactive'} — l'export est périmé.`,
      );
    }

    for (const lessonId of Object.keys(expected.lessons)) {
      if (!actual.lessons[lessonId]) {
        problems.push(`Leçon « ${lessonId} » (${gradeId}) absente de l'export — l'export est périmé.`);
      }
    }
    for (const lessonId of Object.keys(actual.lessons)) {
      if (!expected.lessons[lessonId]) {
        problems.push(`Leçon « ${lessonId} » (${gradeId}) dans l'export mais absente du catalogue — l'export est périmé.`);
      }
    }
  }

  for (const gradeId of Object.keys(onDisk)) {
    if (!source[gradeId]) {
      problems.push(`Classe « ${gradeId} » dans l'export mais absente de coursesData.js — l'export est périmé.`);
    }
  }
}

if (problems.length) {
  report();
}

// ── 2. La base suit-elle l'export ? ────────────────────────────────────
if (process.env.SKIP_DB_DRIFT_CHECK === '1') {
  console.log('⚠️  Contrôle base de données SAUTÉ (SKIP_DB_DRIFT_CHECK=1) — l\'export seul a été vérifié.');
} else {
  const gate = spawnSync('php', ['artisan', 'smarter:registry-health', '--gate'], {
    cwd: resolve(repoRoot, 'apps/api'),
    encoding: 'utf8',
  });

  if (gate.error) {
    problems.push(
      `Impossible de lancer « php artisan smarter:registry-health --gate » : ${gate.error.message}\n` +
        "    Une porte qui ne peut pas vérifier ne s'ouvre pas. Posez SKIP_DB_DRIFT_CHECK=1 pour la sauter explicitement.",
    );
  } else if (gate.status !== 0) {
    problems.push(
      'La base de données a dérivé du catalogue :\n' +
        (gate.stdout || gate.stderr || '')
          .trimEnd()
          .split('\n')
          .map((line) => `    ${line}`)
          .join('\n'),
    );
  }
}

if (problems.length) {
  report();
}

console.log('✅ Aucune dérive : le catalogue, son export et la base s\'accordent sur l\'activation et les leçons.');

function report() {
  console.error(`\n${problems.length} problème(s) de cohérence activation / leçons :\n`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error(
    '\nLe catalogue (packages/core) et l\'API doivent s\'accorder sur ce qui est ouvert et sur ce qui existe.\n' +
      'Réappliquez la poignée de main :\n' +
      '  node packages/core/curriculum/exportCurriculum.mjs && (cd apps/api && php artisan smarter:import-curriculum)\n',
  );
  process.exit(1);
}
