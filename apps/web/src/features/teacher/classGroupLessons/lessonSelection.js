/**
 * Le programme d'une classe, APLATI pour la sélection multiple — logique
 * pure, testable sans React (comme hooks/bulkSelectionCore.js).
 */

/** @returns {Array<{id:number, code:string, title:string, chapterTitle:string, unitCode:?string, classStatus:string, publicationStatus:string, tier:string, effectiveForStudents:boolean}>} */
export function flattenCurriculum(curriculum) {
  const rows = [];
  for (const chapter of curriculum?.chapters ?? []) {
    for (const lesson of chapter.lessons ?? []) {
      rows.push({ ...lesson, chapterTitle: chapter.title, chapterCode: chapter.code });
    }
  }
  return rows;
}

/** Les leçons cochées dont l'état DIFFÈRE de la cible — le lot ne touche que celles-là. */
export function idsNeeding(rows, selectedIds, targetStatus) {
  const selected = new Set(selectedIds);
  return rows.filter((row) => selected.has(row.id) && row.classStatus !== targetStatus).map((row) => row.id);
}

/** Applique le résultat d'un lot aux lignes : seules les `applied` changent. */
export function applyBulkOutcome(rows, outcome, targetStatus) {
  const applied = new Set(outcome?.applied ?? []);
  return rows.map((row) => (applied.has(row.id)
    ? { ...row, classStatus: targetStatus, effectiveForStudents: row.publicationStatus === 'published' && targetStatus === 'visible' }
    : row));
}

/** Compte par état, pour l'en-tête. */
export function countByStatus(rows) {
  return rows.reduce((acc, row) => {
    acc[row.classStatus] = (acc[row.classStatus] ?? 0) + 1;
    if (row.effectiveForStudents) acc.effective = (acc.effective ?? 0) + 1;
    return acc;
  }, { visible: 0, hidden: 0, effective: 0 });
}
