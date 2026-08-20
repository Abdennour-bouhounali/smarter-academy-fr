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
import { courseLevels } from './coursesData.js';

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(process.argv[2] || resolve(here, '.generated/curriculum-export.json'));

const grades = courseLevels.flatMap((level) =>
  level.grades.map((grade, gradeIndex) => ({
    code: grade.id,
    name: grade.name,
    level: level.id,
    order: gradeIndex,
    chapters: grade.chapters.map((chapter, chapterIndex) => ({
      code: chapter.id,
      title: chapter.title,
      order: chapterIndex,
      lessons: chapter.lessons.map((lesson, lessonIndex) => ({
        code: lesson.id,
        officialObjectCode: lesson.officialObject ?? null,
        title: lesson.title,
        description: lesson.description ?? null,
        status: lesson.status,
        durationMinutes: lesson.durationMinutes ?? null,
        tier: lesson.tier,
        order: lessonIndex,
        learningPoints: lesson.learningPoints.map((lp) => ({
          code: lp.id,
          title: lp.title,
          order: lp.order,
        })),
      })),
    })),
  }))
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify({ exportedAt: null, grades }, null, 2) + '\n');

const lessonCount = grades.reduce((n, g) => n + g.chapters.reduce((m, c) => m + c.lessons.length, 0), 0);
const lpCount = grades.reduce(
  (n, g) => n + g.chapters.reduce((m, c) => m + c.lessons.reduce((k, l) => k + l.learningPoints.length, 0), 0),
  0
);
console.log(`Curriculum export written to ${outputPath}`);
console.log(`${grades.length} grades, ${lessonCount} lessons, ${lpCount} learning points`);
