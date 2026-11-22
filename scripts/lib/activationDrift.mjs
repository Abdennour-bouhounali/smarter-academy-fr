// The export half of check-activation-drift.mjs, pure so its test can feed it a neutral catalogue: does the curriculum
// export (packages/core/curriculum/.generated/curriculum-export.json) say the same as the catalogue about which grade
// is ACTIVE and which lessons EXIST? The tier is not compared on purpose: it belongs to the database.

/**
 * The extract the guard watches, from the catalogue: activation per grade and lesson presence. A PROJECTION, not the
 * full export: comparing titles would fail the guard on a typo fix, which mostly teaches people to bypass it.
 */
export function projectFromCatalogue(courseLevels, isGradeActive) {
  const grades = {};
  for (const level of courseLevels) {
    for (const grade of level.grades) {
      const lessons = {};
      for (const chapter of grade.chapters) {
        for (const lesson of chapter.lessons) lessons[lesson.id] = true;
      }
      grades[grade.id] = { active: isGradeActive(grade.id), lessons };
    }
  }
  return grades;
}

export function projectFromExport(exported) {
  const grades = {};
  for (const grade of exported.grades ?? []) {
    const lessons = {};
    for (const chapter of grade.chapters ?? []) {
      for (const lesson of chapter.lessons ?? []) lessons[lesson.code] = true;
    }
    grades[grade.code] = { active: Boolean(grade.active), lessons };
  }
  return grades;
}

/** @returns {string[]} every difference between the two projections (empty = the export is fresh). */
export function exportDrift(source, onDisk) {
  const problems = [];
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
      if (!actual.lessons[lessonId]) problems.push(`Leçon « ${lessonId} » (${gradeId}) absente de l'export — l'export est périmé.`);
    }
    for (const lessonId of Object.keys(actual.lessons)) {
      if (!expected.lessons[lessonId]) problems.push(`Leçon « ${lessonId} » (${gradeId}) dans l'export mais absente du catalogue — l'export est périmé.`);
    }
  }
  for (const gradeId of Object.keys(onDisk)) {
    if (!source[gradeId]) problems.push(`Classe « ${gradeId} » dans l'export mais absente de coursesData.js — l'export est périmé.`);
  }
  return problems;
}
