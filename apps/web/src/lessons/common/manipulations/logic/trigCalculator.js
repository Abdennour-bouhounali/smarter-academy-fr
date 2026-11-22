/**
 * trig-calculator — LA LOGIQUE PURE de la calculatrice du drone (unité 10 « حساب المثلثات في المثلث القائم »,
 * درس « استعمال الحاسبة لحساب النسب المثلثية وتعيين قياس زاوية », نشاط 4 p. 117 et معارف 3 p. 120).
 *
 * Aucune arithmétique trigonométrique ici : chaque valeur vient de packages/core/arithmetic/trigonometry.js
 * (`ratioDeg`, `angleDeg`, `ratioRad`, `angleRad`, `screen`, `roundTo`, `truncateTo`). Ce module dit seulement
 * ce que fait chaque touche, ce que la main a le droit d'enregistrer, et ce que la scène doit montrer.
 *
 * LA CALCULATRICE (comme une Casio du collège, touches de gauche à droite) :
 *   ON       efface l'écran (le mode d'angle reste) ;     DRG   bascule l'unité d'angle D (degré) ↔ R (radian) ;
 *   2nd      la touche suivante sin / cos / tan devient sin⁻¹ / cos⁻¹ / tan⁻¹ ;
 *   sin cos tan, 0…9, « , », DEL, =                         — on tape la fonction PUIS le nombre (معارف 3).
 *   Elle démarre en mode R (une calculatrice prêtée par le grand frère du lycée) : la première ligne de معارف 3
 *   (« قبل استعمال الحاسبة، يجب برمجتها بالوحدة الدرجة ») devient NÉCESSAIRE, pas récitée.
 *
 * LE LABORATOIRE, deux étapes (§7quater : la seconde est ouverte par l'élève, avec un retour) :
 *   table    le tableau de نشاط 4 (1) : pour chaque angle du tableau, cos / sin / tan, arrondis au centième ;
 *   inverse  نشاط 4 (2) : x tel que sin x = 0,52, cos x = 0,25, tan x = 1,33, aux trois précisions.
 * Chaque résultat accepté doit être ARRONDI par l'élève : il place le trait de coupe sur l'écran (la précision),
 * puis décide « أحتفظ بالرقم » ou « أضيف 1 » — la troncature (garder quand le chiffre suivant est ≥ 5) est REFUSÉE.
 *
 * RÉSISTANCES (la mathématique refuse, la scène montre pourquoi) :
 *   rad         en mode R, sin 30 = −0,988… : le côté que ce nombre prétend (−0,988 × l'hypoténuse) passe SOUS le sol ;
 *   radInverse  en mode R, sin⁻¹ 0,52 = 0,5469… : la nacelle à 0,55° ne fait pas 0,52 × l'hypoténuse de hauteur ;
 *   forgot2nd   sin 0,52 = 0,009… est le sinus d'un angle de 0,52° : le drone rase le sol, loin de la cible ;
 *   wrongKind   cos⁻¹ 0,52 donne l'angle dont le COSINUS vaut 0,52 ;
 *   domain      sin⁻¹ 1,33 : « خطأ رياضي » — le sinus d'un angle aigu est plus petit que 1 ;
 *   precision   le trait de coupe ailleurs que la précision demandée ;
 *   truncate    garder le chiffre quand le suivant est ≥ 5 (MISC-MUTH-TADWIR-BATR) ; overRound : l'inverse.
 */
import * as TR from '@smarter-academy/core/arithmetic/trigonometry.js';

export const KINDS = Object.freeze(['cos', 'sin', 'tan']); // l'ordre des lignes du tableau du manuel
export const INV_LABEL = Object.freeze({ sin: 'sin⁻¹', cos: 'cos⁻¹', tan: 'tan⁻¹' });
export const PRECISIONS = Object.freeze([2, 1, 0]); // نشاط 4 (2) : 1/100, 1/10, الوحدة
export const MAX_CUT = 4;
const MAX_ENTRY = 7;
const TOL = 0.005; // une demi-unité du centième : « le dessin dit la même chose que l'écran »

/** Le clavier, rangée par rangée (5 colonnes ; « = » occupe deux rangées). */
export const KEY_ROWS = Object.freeze([
  ['2nd', 'DRG', 'sin', 'cos', 'tan'],
  ['7', '8', '9', 'DEL', 'ON'],
  ['4', '5', '6', ',', '='],
  ['1', '2', '3', '0'],
]);
/** La place de chaque touche dans la grille : { key, row, col, span } (« = » occupe deux rangées). */
export function keyGrid(rows) {
  const out = [];
  rows.forEach((row, r) => row.forEach((key, c) => out.push({ key, row: r + 1, col: c + 1, span: key === '=' ? 2 : 1 })));
  return out;
}
const DIGITS = '0123456789';

const num = (s) => Number(String(s).replace(',', '.'));
export const dec = (x) => String(x).replace('.', ',');

/* ── La calculatrice ─────────────────────────────────────────────────────── */

export function initCalc(mode = 'RAD') {
  return Object.freeze({ mode, shift: false, fn: null, entry: '', result: null });
}

/** Ce que fait UNE touche. `result` non nul = l'écran affiche un résultat (la touche suivante recommence). */
export function press(calc, key) {
  const c = { ...calc };
  const fresh = c.result != null;
  if (key === 'ON') return initCalc(c.mode);
  if (key === 'DRG') return Object.freeze({ ...c, mode: c.mode === 'DEG' ? 'RAD' : 'DEG', result: null, ...(fresh ? { fn: null, entry: '' } : {}) });
  if (key === '2nd') return Object.freeze({ ...c, shift: !c.shift });
  if (key === 'sin' || key === 'cos' || key === 'tan') {
    return Object.freeze({ ...c, fn: { kind: key, inverse: c.shift }, entry: fresh ? '' : c.entry, shift: false, result: null });
  }
  if (DIGITS.includes(key) || key === ',') {
    const base = fresh ? { fn: null, entry: '' } : { fn: c.fn, entry: c.entry };
    let e = base.entry;
    if (key === ',') { if (e.includes(',')) return Object.freeze({ ...c, ...base, result: null }); e = e === '' ? '0,' : `${e},`; } else e = e === '0' ? key : e + key;
    if (e.length > MAX_ENTRY) return calc;
    return Object.freeze({ ...c, ...base, entry: e, result: null, shift: false });
  }
  if (key === 'DEL') {
    if (fresh) return Object.freeze({ ...c, result: null });
    if (c.entry) return Object.freeze({ ...c, entry: c.entry.slice(0, -1) });
    return Object.freeze({ ...c, fn: null, shift: false });
  }
  if (key === '=') return Object.freeze({ ...c, shift: false, result: evaluate(c) });
  return calc;
}

/** Le calcul de « = » : { status: 'ok' | 'error' | 'syntax' | 'empty', value, screen, fn, x, mode }. */
export function evaluate({ fn, entry, mode }) {
  if (!fn && !entry) return { status: 'empty', fn: null, x: null, mode };
  if (fn && (!entry || entry === '0,')) return { status: 'syntax', fn, x: null, mode };
  const x = num(entry.endsWith(',') ? entry.slice(0, -1) : entry);
  if (!fn) return { status: 'ok', fn: null, x, value: x, screen: TR.screen(x), mode };
  let value;
  if (fn.inverse) {
    if (fn.kind !== 'tan' && Math.abs(x) > 1) return { status: 'error', fn, x, mode };
    value = mode === 'DEG' ? TR.angleDeg(fn.kind, x) : TR.angleRad(fn.kind, x);
  } else {
    if (fn.kind === 'tan' && mode === 'DEG' && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-12) return { status: 'error', fn, x, mode };
    value = mode === 'DEG' ? TR.ratioDeg(fn.kind, x) : TR.ratioRad(fn.kind, x);
  }
  return { status: 'ok', fn, x, value, screen: TR.screen(value), mode };
}

/** La ligne d'expression de l'écran : « sin⁻¹ 0,52 », « cos 45 ». */
export function exprText(calc) {
  const f = calc.fn ? (calc.fn.inverse ? INV_LABEL[calc.fn.kind] : calc.fn.kind) : '';
  return [f, calc.entry].filter(Boolean).join(' ');
}

/* ── Les arrondis ────────────────────────────────────────────────────────── */

/** L'écran découpé : la partie gardée jusqu'à `cut` chiffres après la virgule, le reste, le chiffre suivant. */
export function cutScreen(screenStr, cut) {
  const neg = screenStr.startsWith('-');
  const s = neg ? screenStr.slice(1) : screenStr;
  const [i, f = ''] = s.split(',');
  const frac = f.padEnd(cut + 1, '0');
  return {
    neg, int: i, kept: frac.slice(0, cut), next: Number(frac[cut]), rest: f.slice(cut),
    digits: f.length,
  };
}

/** Le verdict de l'arrondi demandé : la valeur arrondie, la troncature, faut-il ajouter 1 ? (core roundTo/truncateTo) */
export function roundingOf(value, cut) {
  const rounded = TR.roundTo(value, cut);
  const truncated = TR.truncateTo(value, cut);
  return { rounded, truncated, up: rounded !== truncated };
}

/* ── Le laboratoire ──────────────────────────────────────────────────────── */

const cellKey = (angle, kind) => `${angle}|${kind}`;

export function initLab({ angles = [30, 45, 60], inverse = null, digits = 2 } = {}) {
  const tasks = inverse ? ['sin', 'cos', 'tan'].filter((k) => inverse[k] != null).map((kind) => Object.freeze({ kind, value: num(inverse[kind]) })) : [];
  return Object.freeze({
    angles: Object.freeze([...angles].map(Number)), digits, tasks: Object.freeze(tasks),
    stage: 'table', active: tasks[0]?.kind ?? null,
    calc: initCalc('RAD'), cells: Object.freeze({}), inv: Object.freeze({}),
    pending: null, cut: null, last: null, modeChanged: false, rad: null,
    trials: Object.freeze([]), n: 0,
  });
}

const freeze = (o) => Object.freeze(o);
const withTrial = (lab, trial) => ({ trials: freeze([...lab.trials, freeze({ n: lab.n + 1, ...trial })]), n: lab.n + 1 });

/** La précision demandée pour le résultat en attente. */
function requiredPrecisions(lab, pending = lab.pending) {
  if (!pending) return [];
  return pending.target.type === 'cell' ? [lab.digits] : [...PRECISIONS];
}

/** Une touche du clavier dans le laboratoire : la calculatrice change, et « = » est JUGÉ. */
export function key(lab, k) {
  const calc = press(lab.calc, k);
  const base = { ...lab, calc, modeChanged: lab.modeChanged || k === 'DRG' };
  if (k !== '=') {
    // Recommencer un calcul abandonne l'arrondi en attente (silencieux : ce n'est pas une erreur).
    const keepPending = k === 'DRG' ? false : !(lab.calc.result != null && calc.result == null);
    return freeze({ ...base, pending: keepPending ? lab.pending : null, last: k === 'DRG' ? freeze({ kind: 'mode', mode: calc.mode }) : (keepPending ? lab.last : null) });
  }
  return judge(freeze(base));
}

function judge(lab) {
  const r = lab.calc.result;
  if (!r || r.status === 'empty') return lab;
  if (r.status === 'syntax') return freeze({ ...lab, pending: null, last: freeze({ kind: 'syntax' }) });
  if (r.status === 'error') {
    const v = freeze({ kind: 'domain', fn: r.fn, x: r.x });
    return freeze({ ...lab, pending: null, last: v, ...withTrial(lab, { type: 'refused', reason: 'domain', fn: r.fn, x: r.x }) });
  }
  if (!r.fn) return freeze({ ...lab, pending: null, last: freeze({ kind: 'number', x: r.x }) });
  const { kind, inverse } = r.fn;
  const base = { fn: r.fn, x: r.x, value: r.value, screen: r.screen };
  if (r.mode === 'RAD') {
    const expected = inverse ? TR.angleDeg(kind, r.x) : TR.ratioDeg(kind, r.x);
    const v = freeze({ kind: inverse ? 'radInverse' : 'rad', ...base, expected, expectedScreen: TR.screen(expected) });
    return freeze({ ...lab, pending: null, last: v, rad: lab.rad ?? v, ...withTrial(lab, { type: 'refused', reason: v.kind, ...base }) });
  }
  if (lab.stage === 'table') {
    if (inverse) return freeze({ ...lab, pending: null, last: freeze({ kind: 'angleInTable', ...base }) });
    if (!lab.angles.includes(r.x)) return freeze({ ...lab, pending: null, last: freeze({ kind: 'offTable', ...base }) });
    const pending = freeze({ target: freeze({ type: 'cell', angle: r.x, kind }), value: r.value, screen: r.screen, fn: r.fn, x: r.x });
    return freeze({ ...lab, pending, last: freeze({ kind: 'toRound', ...base }) });
  }
  // étape inverse
  if (!inverse) {
    const task = lab.tasks.find((t) => t.value === r.x);
    if (task && task.kind === kind) {
      const v = freeze({ kind: 'forgot2nd', ...base, task });
      return freeze({ ...lab, pending: null, active: task.kind, last: v, ...withTrial(lab, { type: 'refused', reason: 'forgot2nd', ...base }) });
    }
    // une lecture directe : la vérification « aller-retour » (sin 31,33 ≈ 0,52) est la bienvenue
    const back = lab.tasks.find((t) => t.kind === kind && Math.abs(r.value - t.value) < TOL);
    return freeze({ ...lab, pending: null, last: freeze({ kind: back ? 'roundTrip' : 'direct', ...base, task: back ?? null }) });
  }
  const task = lab.tasks.find((t) => t.kind === kind && t.value === r.x);
  if (task) {
    const pending = freeze({ target: freeze({ type: 'inverse', kind }), value: r.value, screen: r.screen, fn: r.fn, x: r.x });
    return freeze({ ...lab, active: kind, pending, last: freeze({ kind: 'toRoundAngle', ...base, task }) });
  }
  const other = lab.tasks.find((t) => t.value === r.x);
  if (other) {
    const v = freeze({ kind: 'wrongKind', ...base, task: other });
    return freeze({ ...lab, pending: null, active: other.kind, last: v, ...withTrial(lab, { type: 'refused', reason: 'wrongKind', ...base }) });
  }
  return freeze({ ...lab, pending: null, last: freeze({ kind: 'noTask', ...base }) });
}

/** Le trait de coupe (la précision) : 0 = à la virgule (الوحدة) … MAX_CUT chiffres après. */
export const setCut = (lab, cut) => freeze({ ...lab, cut: Math.max(0, Math.min(MAX_CUT, Math.round(cut))) });

/**
 * La décision de l'élève : `keep` (أحتفظ بالرقم) ou `up` (أضيف 1). Juste → la valeur arrondie est ÉCRITE dans le
 * tableau (ou la ligne de l'angle) ; fausse → refusée avec le chiffre suivant et ce qu'elle aurait donné.
 */
export function decide(lab, choice) {
  const p = lab.pending;
  if (!p) return lab;
  if (lab.cut == null) return freeze({ ...lab, last: freeze({ kind: 'noCut' }) });
  const need = requiredPrecisions(lab);
  const value = num(p.screen); // ce que l'élève LIT
  const { rounded, truncated, up } = roundingOf(value, lab.cut);
  const { next } = cutScreen(p.screen, lab.cut);
  const base = { cut: lab.cut, rounded, truncated, next, screen: p.screen, target: p.target };
  if (!need.includes(lab.cut)) {
    const v = freeze({ kind: 'precision', ...base, need });
    return freeze({ ...lab, last: v, ...withTrial(lab, { type: 'refused', reason: 'precision', ...base }) });
  }
  if (choice === 'keep' && up) {
    const v = freeze({ kind: 'truncate', ...base });
    return freeze({ ...lab, last: v, ...withTrial(lab, { type: 'refused', reason: 'truncate', ...base }) });
  }
  if (choice === 'up' && !up) {
    const v = freeze({ kind: 'overRound', ...base });
    return freeze({ ...lab, last: v, ...withTrial(lab, { type: 'refused', reason: 'overRound', ...base }) });
  }
  if (p.target.type === 'cell') {
    const { angle, kind } = p.target;
    const cells = freeze({ ...lab.cells, [cellKey(angle, kind)]: freeze({ angle, kind, screen: p.screen, rounded }) });
    return freeze({ ...lab, cells, pending: null, last: freeze({ kind: 'cell', ...base, angle, ratio: kind }), ...withTrial(lab, { type: 'cell', angle, ratio: kind, ...base }) });
  }
  const { kind } = p.target;
  const row = freeze({ ...(lab.inv[kind] ?? {}), [lab.cut]: rounded });
  const inv = freeze({ ...lab.inv, [kind]: row });
  const task = lab.tasks.find((t) => t.kind === kind);
  return freeze({ ...lab, inv, last: freeze({ kind: 'angle', ...base, ratio: kind, task }), ...withTrial(lab, { type: 'inverse', ratio: kind, value: task.value, ...base }) });
}

export const cellOf = (lab, angle, kind) => lab.cells[cellKey(angle, kind)] ?? null;
export const cellCount = (lab) => Object.keys(lab.cells).length;

/** Le tableau est « accompli » : un résultat par ligne (cos, sin, tan) au moins, calculé en mode D après avoir changé de mode. */
export function tableReady(lab) {
  const kinds = new Set(Object.values(lab.cells).map((c) => c.kind));
  return lab.modeChanged && cellCount(lab) >= 3 && KINDS.every((k) => kinds.has(k));
}
export const taskDone = (lab, kind) => Object.keys(lab.inv[kind] ?? {}).length;
/** Les angles : chaque angle trouvé à une précision au moins, et un angle aux TROIS précisions (le contraste 31,33 / 31,3 / 31). */
export function inverseReady(lab) {
  if (!lab.tasks.length) return false;
  return lab.tasks.every((t) => taskDone(lab, t.kind) >= 1) && lab.tasks.some((t) => taskDone(lab, t.kind) === PRECISIONS.length);
}
export const hasInverse = (lab) => lab.tasks.length > 0;
export const discoveryReady = (lab) => (hasInverse(lab) ? lab.stage === 'inverse' && inverseReady(lab) : tableReady(lab));

/** Ouvrir l'étape des angles (geste de l'élève, après le tableau) ; revenir au tableau. Les deux états survivent. */
export function openInverse(lab) {
  if (!hasInverse(lab) || !tableReady(lab)) return lab;
  return freeze({ ...lab, stage: 'inverse', pending: null, last: null, calc: { ...lab.calc, result: null, fn: null, entry: '', shift: false } });
}
/**
 * « أعِد التجربة » (LabCheckpoint) : on refait la MÊME étape — le tableau (cellules, mode R de départ, essais d'arrondi) ou les angles
 * (la ligne des trois précisions). Les essais déjà notés restent ; le drapeau « fait » de l'étape s'efface avec ses cellules.
 */
export function restartStage(lab) {
  const clean = { ...lab.calc, result: null, fn: null, entry: '', shift: false };
  if (lab.stage === 'inverse') return freeze({ ...lab, inv: freeze({}), pending: null, cut: null, last: null, calc: freeze(clean) });
  return freeze({ ...lab, cells: freeze({}), pending: null, cut: null, last: null, modeChanged: false, rad: null, calc: initCalc('RAD') });
}
export const backToTable = (lab) => freeze({ ...lab, stage: 'table', pending: null, last: null });
export const setActive = (lab, kind) => (lab.tasks.some((t) => t.kind === kind) ? freeze({ ...lab, active: kind }) : lab);

/**
 * Ce que la SCÈNE montre (le drone, sa nacelle, le triangle) pour le dernier calcul :
 *   angle    l'angle de la nacelle en DEGRÉS (pour une lecture directe : l'angle tapé ; pour une lecture inverse :
 *            le nombre de l'écran pris comme des degrés — en mode R, 0,5469 « degrés »)
 *   kind     le rapport en jeu ; claimed : ce que l'écran (ou la cible) prétend de ce rapport ; drawn : ce que le
 *            dessin mesure vraiment (core ratioDeg) ; agrees : |claimed − drawn| < 0,005
 *   target   la cible de l'étape inverse (la tâche active), dessinée comme une ligne
 */
export function sceneOf(lab) {
  const target = lab.stage === 'inverse' ? lab.tasks.find((t) => t.kind === lab.active) ?? null : null;
  const v = lab.last;
  const r = lab.calc.result;
  const idle = { angle: null, kind: null, claimed: null, drawn: null, agrees: null, target, acute: true, inverse: false };
  if (!r || r.status !== 'ok' || !r.fn || !v || ['mode', 'syntax', 'number', 'domain'].includes(v.kind)) return idle;
  const { kind, inverse } = r.fn;
  const angle = inverse ? r.value : r.x;
  const claimed = inverse ? r.x : r.value;
  const acute = angle > 0 && angle < 90;
  const drawn = acute ? TR.ratioDeg(kind, angle) : null;
  return { angle, kind, claimed, drawn, agrees: drawn != null && Math.abs(claimed - drawn) < TOL, target, acute, inverse };
}

/** La géométrie du drone (SVG, y vers le BAS) : T la cible au sol, D le drone, H son pied ; l'hypoténuse DT = L fixe. */
export function droneGeometry(angle, { width, height, padX = 18, padTop = 22, padBottom = 26 }) {
  const a = Math.max(0.3, Math.min(89.7, angle ?? 25));
  const L = Math.max(40, Math.min(width - 2 * padX - 26, height - padTop - padBottom));
  const T = [padX + 8, height - padBottom];
  const rad = (a * Math.PI) / 180;
  const D = [T[0] + L * Math.cos(rad), T[1] - L * Math.sin(rad)];
  const H = [D[0], T[1]];
  return { T, D, H, L, angle: a, groundY: T[1] };
}

/** Ce que l'onTrial du module reçoit (les essais de l'élève, pour la liste [data-activity-evidence]). */
export function evidenceOf(lab) {
  return {
    cells: Object.values(lab.cells).map((c) => ({ angle: c.angle, kind: c.kind, rounded: c.rounded, screen: c.screen })),
    inverse: lab.tasks.map((t) => ({ kind: t.kind, value: dec(t.value), found: { ...(lab.inv[t.kind] ?? {}) } })),
    last: lab.trials.at(-1) ?? null,
  };
}
