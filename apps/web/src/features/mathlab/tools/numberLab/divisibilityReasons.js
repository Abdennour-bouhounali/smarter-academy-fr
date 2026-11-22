/**
 * La RAISON d'un verdict de divisibilité, en données — logique pure.
 *
 * `divisibilityBy` (numberTheory.js) rend déjà la trace (`evidence`,
 * `evidenceText`) ; ce module choisit la PHRASE (une clé i18n et ses
 * paramètres) et sépare la FORMULE (`3 + 6 + 0 = 9`) du texte arabe. La
 * formule est affichée à part, isolée en LTR : dans une phrase arabe, bidi
 * la retournerait (« 9 = 0 + 6 + 3 »).
 *
 * @param {{by:number, divisible:boolean, evidence:number|null, evidenceText:string|null}} row
 * @param {number} value
 * @param {{ div2?: boolean, div3?: boolean }} [context]  les verdicts de 2 et 3, pour la raison de 6
 * @returns {{ key: string, params: object, formula: string|null } | null}
 */
export function divisibilityReason(row, value, context = {}) {
  if (!row) return null;
  const abs = String(Math.abs(Math.trunc(value)));
  const verdict = row.divisible ? 'yes' : 'no';
  const base = 'tools.numberLab.divisibility.reasons';
  switch (row.by) {
    case 2:
    case 5:
    case 10:
      return { key: `${base}.${row.by}.${verdict}`, params: { digit: abs.slice(-1) }, formula: null };
    case 3:
    case 9:
      return {
        key: `${base}.${row.by}.${verdict}`,
        params: { sum: row.evidence },
        formula: `${row.evidenceText} = ${row.evidence}`,
      };
    case 4:
    case 25:
      // Les deux DERNIERS chiffres, écrits comme tels : 1005 finit par « 05 ».
      return {
        key: `${base}.${row.by}.${verdict}`,
        params: { lastTwo: abs.length >= 2 ? abs.slice(-2) : abs },
        formula: null,
      };
    case 8:
      return {
        key: `${base}.8.${verdict}`,
        params: { lastThree: abs.length >= 3 ? abs.slice(-3) : abs },
        formula: null,
      };
    case 11:
      return {
        key: `${base}.11.${verdict}`,
        params: { sum: row.evidence },
        formula: `${row.evidenceText} = ${String(row.evidence).replace('-', '−')}`,
      };
    case 6: {
      let variant = 'yes';
      if (!row.divisible) variant = context.div2 === false ? 'no2' : 'no3';

      return { key: `${base}.6.${variant}`, params: {}, formula: null };
    }
    default:
      return null;
  }
}
