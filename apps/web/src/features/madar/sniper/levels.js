/**
 * « قنّاص القيم » — les 50 niveaux des jeux de mathématiques (pur).
 *
 * Chaque niveau a trois sous-niveaux (أ، ب، ج : des nombres plus grands, des
 * pièges plus fins). Une POSITION est un sous-niveau : 0 … 149.
 *
 *   position = (niveau − 1) × 3 + (sous-niveau − 1)
 *
 * Les niveaux suivent le programme du cycle moyen, de 1AM à 4AM, en onze
 * familles. `ENTRY` est le niveau de départ d'un élève selon son année : tout
 * ce qui le précède est ouvert d'emblée (les années passées). La progression
 * (adapt.js) le fait ensuite monter ou descendre selon ses manches.
 *
 * MIROIR côté serveur : config/madar.php › sniper (levels, sub_levels, entry).
 */
export const SUB_LEVELS = 3;

const DOMAINS = [
  'naturals', 'priorities', 'arith', 'fractions', 'decimals', 'relatives', 'powers', 'roots', 'literal', 'equations', 'trig',
];

const L = (id, domain, build, mode = 'value') => ({ id, domain, build, mode });

export const LEVELS = [
  L('add', 'naturals', 'add'),
  L('sub', 'naturals', 'sub'),
  L('mul', 'naturals', 'mul'),
  L('div', 'naturals', 'div'),
  L('addSub', 'priorities', 'addSub'),
  L('prio', 'priorities', 'prio'),
  L('parens', 'priorities', 'parens'),
  L('prio2', 'priorities', 'prio2'),
  L('factor', 'arith', 'factor'),
  L('pgcd', 'arith', 'pgcd'),
  L('ppcm', 'arith', 'ppcm'),
  L('fracEq', 'fractions', 'fracEq'),
  L('fracSimplify', 'fractions', 'fracSimplify'),
  L('fracSameDen', 'fractions', 'fracSameDen'),
  L('fracAdd', 'fractions', 'fracAdd'),
  L('fracMul', 'fractions', 'fracMul'),
  L('fracDiv', 'fractions', 'fracDiv'),
  L('fracOf', 'fractions', 'fracOf'),
  L('decFrac', 'decimals', 'decFrac'),
  L('decOps', 'decimals', 'decOps'),
  L('percent', 'decimals', 'percent'),
  L('percentOf', 'decimals', 'percentOf'),
  L('relAdd', 'relatives', 'relAdd'),
  L('relSub', 'relatives', 'relSub'),
  L('relMul', 'relatives', 'relMul'),
  L('relMix', 'relatives', 'relMix'),
  L('powNat', 'powers', 'powNat'),
  L('powRules', 'powers', 'powRules'),
  L('pow10', 'powers', 'pow10'),
  L('sci', 'powers', 'sci'),
  L('powProd', 'powers', 'powProd'),
  L('rootSq', 'roots', 'rootSq'),
  L('rootSimplify', 'roots', 'rootSimplify'),
  L('rootMul', 'roots', 'rootMul'),
  L('rootAdd', 'roots', 'rootAdd'),
  L('rootRational', 'roots', 'rootRational'),
  L('reduce', 'literal', 'reduce'),
  L('expand', 'literal', 'expand'),
  L('expand2', 'literal', 'expand2'),
  L('idPlus', 'literal', 'idPlus'),
  L('idMinus', 'literal', 'idMinus'),
  L('idDiff', 'literal', 'idDiff'),
  L('factorize', 'literal', 'factorize'),
  L('eqAdd', 'equations', 'eqAdd', 'solution'),
  L('eqLin', 'equations', 'eqLin', 'solution'),
  L('eqBoth', 'equations', 'eqBoth', 'solution'),
  L('evalAt', 'equations', 'evalAt', 'at'),
  L('trigSinCos', 'trig', 'trigSinCos'),
  L('trigTan', 'trig', 'trigTan'),
  L('trigRel', 'trig', 'trigRel'),
].map((l, i) => ({ ...l, n: i + 1 }));

const LEVEL_COUNT = LEVELS.length;
export const POSITIONS = LEVEL_COUNT * SUB_LEVELS;

export const levelAt = (n) => LEVELS[Math.min(LEVEL_COUNT, Math.max(1, n)) - 1];
export const clampPos = (p) => Math.min(POSITIONS - 1, Math.max(0, Math.round(p)));
export const posOf = (level, sub = 1) => clampPos((level - 1) * SUB_LEVELS + (sub - 1));
export const levelOfPos = (p) => Math.floor(clampPos(p) / SUB_LEVELS) + 1;
export const subOfPos = (p) => (clampPos(p) % SUB_LEVELS) + 1;

/** Les familles, chacune avec ses niveaux (la carte de l'accueil). */
export function levelsByDomain() {
  return DOMAINS.map((domain) => ({ domain, levels: LEVELS.filter((l) => l.domain === domain) }));
}
