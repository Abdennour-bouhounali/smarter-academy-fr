// La PROVENANCE d'un exercice présenté en feuille d'examen (`metadata.exam`) —
// la règle, pure et testée (scripts/exam-provenance.test.mjs), qu'applique
// validate-exercises.mjs. Contrat : docs/architecture/EXERCISE_CONTRACT.md
// § « Présentation examen (BEM) » et § « Term-exam provenance (1AM–3AM) ».
//
// Deux examens, selon l'année de la leçon :
//  - 4AM  → la شهادة التعليم المتوسط (BEM) : `source.type: "bem"` (official /
//           excerpt) ou `platform_addition / bem_modelled`, badge « BEM <année> » /
//           « على منوال BEM <année> » ;
//  - 1AM–3AM → l'examen de fin de فصل (corpus docs/sources/moyen/exams/,
//           EXAM_PATTERN.md §6) : JAMAIS official ni excerpt (sujets
//           d'établissement sans statut officiel) ; `modelled` calqué sur un
//           exercice précis → `source.type: "term_exam"` ; généré sur le modèle
//           du فصل → `platform_addition / term_exam_modelled` ; badge
//           « على منوال اختبار الفصل الأول / الثاني / الثالث ».

export const SEMESTER_AR = Object.freeze({ 1: 'الأول', 2: 'الثاني', 3: 'الثالث' });
export const TERM_EXAM_GRADES = Object.freeze(['1am', '2am', '3am']);
export const termExamBadge = (semester) => `على منوال اختبار الفصل ${SEMESTER_AR[semester]}`;

const TERM_BADGE = /^على منوال اختبار الفصل (الأول|الثاني|الثالث)$/;
const BEM_MODELLED_BADGE = /^على منوال BEM (20[0-2]\d)$/;
const MODELLED_ON_TERM = /^([1-3]am)-s([1-3])$/;
// EXAM_PATTERN.md §6.6 : jamais comme modèle (contexte de guerre).
export const EXCLUDED_TERM_EXAM_FILES = Object.freeze(new Set(['2am-s2-61']));

/** L'année d'un exercice, lue dans son id `ex-<grade>-<lesson>-l<n>-<nnn>`. */
export const gradeOfExercise = (data) => /^ex-([1-4]am)-/.exec(data?.id ?? '')?.[1] ?? null;

const semesterOfBadge = (badge) => {
  const m = TERM_BADGE.exec(badge ?? '');
  return m ? Number(Object.keys(SEMESTER_AR).find((k) => SEMESTER_AR[k] === m[1])) : null;
};

/**
 * @param {object} data       l'exercice
 * @param {{ files: Array }} examsIndex docs/sources/moyen/exams/exams-index.json
 * @returns {string[]} les erreurs (vide = conforme)
 */
export function examProvenanceErrors(data, examsIndex) {
  const errors = [];
  const exam = data?.metadata?.exam;
  const source = data?.metadata?.source;
  const grade = gradeOfExercise(data);
  const termGrade = TERM_EXAM_GRADES.includes(grade);

  if (source?.type === 'term_exam') {
    if (!termGrade) errors.push(`metadata.source.type « term_exam » est réservé aux leçons 1AM–3AM (exercice ${grade ?? '?'})`);
    if (source.grade !== grade) errors.push(`metadata.source.grade doit être l'année de l'exercice « ${grade} » (reçu ${JSON.stringify(source.grade)})`);
    if (![1, 2, 3].includes(source.semester)) errors.push('metadata.source.semester vaut 1, 2 ou 3 (الفصل)');
    if (!Number.isInteger(source.exercise) || source.exercise < 1) errors.push('metadata.source.exercise est le numéro (≥ 1) de l\'exercice du sujet');
    const file = (examsIndex?.files ?? []).find((f) => f.id === source.file);
    if (!file) errors.push(`metadata.source.file « ${source.file} » absent de docs/sources/moyen/exams/exams-index.json`);
    else {
      if (EXCLUDED_TERM_EXAM_FILES.has(file.id)) errors.push(`le sujet « ${file.id} » est exclu comme modèle (EXAM_PATTERN.md §6)`);
      // Un sujet mal rangé (`misfiled`) sert au niveau de son EN-TÊTE, pas de son dossier.
      const effectiveGrade = file.misfiled ? file.gradeInFile : file.grade;
      const effectiveSemester = file.misfiled ? (file.semesterInFile ?? file.semester) : file.semester;
      if (effectiveGrade !== source.grade) errors.push(`le sujet « ${file.id} » est de ${effectiveGrade}, pas de ${source.grade}`);
      if (effectiveSemester !== source.semester) errors.push(`le sujet « ${file.id} » est du فصل ${effectiveSemester}, pas du ${source.semester}`);
      if (Number.isInteger(source.exercise) && !(file.exercises ?? []).some((e) => e.n === source.exercise)) {
        errors.push(`le sujet « ${file.id} » n'a pas d'exercice n° ${source.exercise}`);
      }
    }
  }
  if (source?.type === 'platform_addition' && source.reason === 'term_exam_modelled') {
    const m = MODELLED_ON_TERM.exec(source.modelledOn ?? '');
    if (!m) errors.push(`metadata.source.modelledOn s'écrit « <année>-s<فصل> », ex. « 2am-s1 » (reçu ${JSON.stringify(source.modelledOn)})`);
    else if (m[1] !== grade) errors.push(`metadata.source.modelledOn « ${source.modelledOn} » n'est pas de l'année de l'exercice (${grade})`);
  }
  if (source?.type === 'bem' && termGrade) errors.push('une leçon 1AM–3AM ne cite pas le BEM : son examen est celui du فصل (term_exam)');

  if (!exam || typeof exam !== 'object') return errors;
  if (termGrade && (exam.kind === 'official' || exam.kind === 'excerpt')) {
    errors.push(`un exercice 1AM–3AM n'est jamais « ${exam.kind} » : les sujets de فصل n'ont pas de statut officiel (EXAM_PATTERN.md §6)`);
  }
  if (exam.kind === 'modelled') {
    if (termGrade) {
      const semester = semesterOfBadge(exam.badge);
      if (!semester) {
        errors.push(`un exercice « modelled » 1AM–3AM porte le badge « على منوال اختبار الفصل الأول / الثاني / الثالث » (reçu ${JSON.stringify(exam.badge)})`);
      } else {
        const declared = source?.type === 'term_exam' ? source.semester
          : source?.reason === 'term_exam_modelled' ? Number(MODELLED_ON_TERM.exec(source.modelledOn ?? '')?.[2]) : null;
        if (!declared) errors.push('un exercice « modelled » 1AM–3AM déclare sa source : term_exam, ou platform_addition / term_exam_modelled');
        else if (declared !== semester) errors.push(`le badge dit le فصل ${semester}, la source le فصل ${declared}`);
      }
    } else if (typeof exam.badge !== 'string' || !BEM_MODELLED_BADGE.test(exam.badge)) {
      errors.push(`un exercice « modelled » porte le badge « على منوال BEM <année> » (reçu ${JSON.stringify(exam.badge)})`);
    }
  }
  return errors;
}
