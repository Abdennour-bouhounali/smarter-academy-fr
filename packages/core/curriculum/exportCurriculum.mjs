// Walks the merged curriculum (coursesData.js — the single source of truth,
// itself built from the official ministry JSON + smaMetadata) and writes a
// plain-JSON snapshot for the Laravel importer (php artisan
// smarter:import-curriculum), which shells out to this script. PHP can't
// import an ES module, and re-implementing buildChaptersForGrade's merge in
// PHP would create a second, drifting definition of the curriculum — so the
// boundary is this one generated file instead.
//
// Usage: node packages/core/curriculum/exportCurriculum.mjs [outputPath]
// Default output: packages/core/curriculum/.generated/curriculum-export.json
// (gitignored — a build artifact, not a source file).

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Le catalogue ALGÉRIEN, et lui seul.
//
// Jusqu'à la phase 6F, ce script exportait l'arbre français complet : la base
// devait refléter toute classe physiquement présente, le français y restant
// « présent mais dormant » (master spec §3). Ce n'est plus l'état voulu. La
// base DZ ne contient que les classes DZ ; l'arbre français
// (`referenceCourseLevels`) ne sort plus jamais du monde JavaScript, où il ne
// sert qu'à valider les dossiers de leçons restés sur le disque.
//
// Conséquence à garder en tête : l'import est un UPSERT qui ne supprime rien
// (CurriculumImporter). Retirer une classe d'ici ne l'efface donc pas de la
// base — c'est `smarter:scope-curriculum` qui s'en charge, et il lit CE
// fichier pour savoir quoi garder. L'export est l'autorité ; la base suit.
import { dzCourseLevels } from './coursesData.js';
import { isGradeActive } from './activeGrades.js';

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(process.argv[2] || resolve(here, '.generated/curriculum-export.json'));

const grades = dzCourseLevels.flatMap((level) =>
  level.grades.map((grade, gradeIndex) => ({
    code: grade.id,
    name: grade.name,
    level: level.id,
    order: gradeIndex,
    // The one place activation leaves the JS world: `smarter:import-curriculum`
    // mirrors it into grades.is_active, which ContentAccess enforces.
    active: isGradeActive(grade.id),
    // Où en est le curriculum de cette classe — distinct de son activation.
    // Une classe peut être ACTIVE (on peut s'y inscrire) sans qu'aucune leçon
    // n'existe. Voir l'invariant I2 de la phase 6F.
    curriculumStatus: grade.curriculumStatus ?? null,
    chapters: grade.chapters.map((chapter, chapterIndex) => ({
      code: chapter.id,
      title: chapter.title,
      order: chapterIndex,
      // Les SUJETS du programme officiel, portés par le chapitre parce
      // qu'aucune leçon ne les porte encore. C'est le bout algérien de la
      // chaîne I1 : ces intitulés viennent de programme_4am_2026_2027.json et
      // n'ont été retapés nulle part.
      topics: chapter.topics ?? [],
      // Les UNITÉS du manuel (phase 8) — absentes (tableau vide) pour un
      // chapitre encore découpé « un sujet = une leçon ».
      units: (chapter.units ?? []).map((unit) => ({
        code: unit.id,
        title: unit.title,
        subtitle: unit.subtitle ?? null,
        number: unit.number ?? null,
        objectives: unit.objectives ?? [],
        sourceTopicCodes: unit.sourceTopicIds ?? [],
        textbook: unit.textbook ?? null,
        order: unit.order,
      })),
      lessons: chapter.lessons.map((lesson, lessonIndex) => ({
        code: lesson.id,
        officialObjectCode: lesson.officialObject ?? null,
        title: lesson.title,
        description: lesson.description ?? null,
        status: lesson.status,
        durationMinutes: lesson.durationMinutes ?? null,
        // No `tier`: the access tier is owned by the database (admin), not
        // by the catalogue. The importer creates a new lesson `free` and
        // never rewrites the tier of an existing one.
        order: lessonIndex,
        // Phase 8 : rattachement à l'unité, nature (leçon / synthèse),
        // référence au manuel et prérequis pédagogiques inter-leçons.
        unitCode: lesson.unitId ?? null,
        kind: lesson.kind ?? 'lesson',
        titleSource: lesson.titleSource ?? 'official_topic',
        textbookRef: lesson.textbookRef ?? null,
        prerequisiteLessonCodes: lesson.prerequisiteLessonCodes ?? [],
        learningPoints: lesson.learningPoints.map((lp) => ({
          code: lp.id,
          title: lp.title,
          order: lp.order,
          prerequisites: (lp.prerequisites ?? []).map((p) => ({ code: p.id, requiredMastery: p.requiredMastery })),
        })),
      })),
    })),
  }))
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify({ exportedAt: null, grades }, null, 2) + '\n');

const chapterCount = grades.reduce((n, g) => n + g.chapters.length, 0);
const topicCount = grades.reduce((n, g) => n + g.chapters.reduce((m, c) => m + c.topics.length, 0), 0);
const lessonCount = grades.reduce((n, g) => n + g.chapters.reduce((m, c) => m + c.lessons.length, 0), 0);
const lpCount = grades.reduce(
  (n, g) => n + g.chapters.reduce((m, c) => m + c.lessons.reduce((k, l) => k + l.learningPoints.length, 0), 0),
  0
);
console.log(`Curriculum export written to ${outputPath}`);
console.log(
  `${grades.length} grades, ${chapterCount} chapters, ${topicCount} topics, ` +
    `${lessonCount} lessons, ${lpCount} learning points`
);
