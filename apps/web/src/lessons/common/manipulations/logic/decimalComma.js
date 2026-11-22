/**
 * decimal-comma — la logique PURE de « LA VIRGULE SOUS LA MAIN » (1AM, unité 1, درس « الكسور العشرية والكتابة العشرية »).
 * Aucun React ici. Toute la vérité est EXACTE (`@smarter-academy/core/arithmetic/decimals.js`, importé par chemin).
 *
 * L'idée. Les CHIFFRES d'un bon sont imprimés et fixes ; la main tient la VIRGULE, c'est-à-dire sa place dans la suite de chiffres :
 * `pos` = l'indice de l'espace (0 … len) où elle se pose, `point = len − pos` = le nombre de chiffres après elle. La valeur est
 * N / 10^point : chaque cran vers la droite rend la pièce du dernier chiffre dix fois plus petite.
 *
 * Trois sortes de tâches (objets) :
 *   match     { digits, target }  la table du client montre `target` en pièces ; la virgule se glisse jusqu'à ce que le plateau
 *                                 de l'atelier (les pièces de la bande) soit égal à la table ;
 *   fraction  { digits, target }  `target` est une fraction décimale (« 3125/1000 ») : la virgule se glisse jusqu'à l'égalité ;
 *   shift     { start, op }       monde `machine` : une bande d'entrée (start, virgule fixe) traverse une machine (×10 … ÷1000, ×0,1 …) ;
 *                                 la bande de sortie repart des MÊMES chiffres et de la même virgule : on glisse la virgule et on
 *                                 AJOUTE des zéros là où les chiffres manquent (au plus 3 de chaque côté).
 *
 * Les zéros ajoutés ne changent jamais la valeur : la virgule reste accrochée à l'espace où elle était entre les chiffres
 * (zéro à gauche → `pos` + 1 ; zéro à droite → `pos` inchangé). Une libération de la virgule PLUS LOIN que le dernier chiffre est
 * refusée dans le monde `machine` (« لا رقم هنا ») : la virgule reste au bout (verdict `nodigit`) sauf si la valeur y est déjà juste.
 *
 *     let s = init({ world: 'mosaic', tasks: [{ kind: 'match', digits: '235', target: '2,35' }] });
 *     s = release(s, 1);          // 2,35 → exact : le plateau égale la table
 *     taskDone(s);                // true
 *
 * Un défaut n'est pas un essai (CONTRACT §6bis.2) : la virgule s'ouvre au bout de la bande (mosaic) ou là où l'entrée a la sienne
 * (machine), sans verdict ; un essai est un RELÂCHEMENT qui change quelque chose (ou un refus), ou un zéro ajouté / retiré.
 */
import * as D from '@smarter-academy/core/arithmetic/decimals.js';

export const WORLDS = Object.freeze(['mosaic', 'machine']);
export const KINDS = Object.freeze(['match', 'fraction', 'shift']);
export const ZERO_MAX = 3;
export const FREE_MAX_DIGITS = 5;
export const SIDES = Object.freeze(['left', 'right']);

/** Les tâches du monde `machine` quand la leçon n'en passe pas (le module de la طريقة passe les siennes — mêmes valeurs). */
export const MACHINE_PRESETS = Object.freeze({
  beginner: Object.freeze([{ kind: 'shift', start: '3,5', op: '×10' }, { kind: 'shift', start: '3,5', op: '×100' }, { kind: 'shift', start: '3,5', op: '÷10' }, { kind: 'shift', start: '3,5', op: '÷100' }]),
  advanced: Object.freeze([{ kind: 'shift', start: '143,75', op: '×1000' }, { kind: 'shift', start: '43,7', op: '÷1000' }, { kind: 'shift', start: '27,5', op: '×0,1' }, { kind: 'shift', start: '0,6', op: '×0,01' }]),
});

/** Le MODE de monde que décrit une suite de tâches : `machine` dès qu'une tâche est un `shift`. */
export const worldOf = (tasks) => (tasks.some((t) => t.kind === 'shift') ? 'machine' : 'mosaic');

/* ── Tâches ─────────────────────────────────────────────────────────────────────────────── */

/** « 143,75 » → { digits: '14375', point: 2 } : les chiffres imprimés (zéro de tête gardé) et la virgule d'entrée. */
export function splitStart(start) {
  const text = String(start).replace(/[\s ]/g, '').replace('.', ',');
  const [i, f = ''] = text.split(',');
  return { digits: `${i}${f}`, point: f.length };
}

/** Une tâche normalisée : les valeurs exactes de la cible sont calculées une fois. */
export function normalizeTask(t) {
  if (t.kind === 'shift') {
    const { digits, point } = splitStart(t.start);
    const e = D.opExponent(t.op);
    if (e === null) throw new RangeError(`decimal-comma: unknown operator ${t.op}`);
    const targetValue = D.shift(D.fromSlip(digits, point), e);
    return Object.freeze({ kind: 'shift', start: t.start, op: t.op, digits, startPoint: point, e, targetValue, target: D.formatTrim(targetValue), startValue: D.fromSlip(digits, point) });
  }
  const targetValue = D.parse(t.target);
  if (!targetValue || !/^[0-9]{1,6}$/.test(t.digits ?? '')) throw new RangeError(`decimal-comma: bad task ${JSON.stringify(t)}`);
  return Object.freeze({ kind: t.kind, digits: t.digits, target: t.target, targetValue, isFraction: t.kind === 'fraction' });
}

/** La suite de tâches de la leçon (ou, à défaut, celle du monde / niveau) : un objet seul est toléré. */
export function tasksFor({ world, tasks, level = 'beginner' }) {
  const given = tasks == null ? null : Array.isArray(tasks) ? tasks : [tasks];
  if (given && given.length) return given;
  return world === 'machine' ? MACHINE_PRESETS[level === 'advanced' ? 'advanced' : 'beginner'] : null;
}

const board0 = (t) => Object.freeze({ zl: 0, zr: 0, pos: t.kind === 'shift' ? t.digits.length - t.startPoint : t.digits.length });

/** Toutes les (zl, zr, pos) qui rendent la tâche juste, avec au plus `max` zéros de chaque côté (les tests s'en servent). */
export function solutions(task, max = ZERO_MAX) {
  const t = typeof task.targetValue === 'object' ? task : normalizeTask(task);
  const out = [];
  for (let zl = 0; zl <= (t.kind === 'shift' ? max : 0); zl += 1) {
    for (let zr = 0; zr <= (t.kind === 'shift' ? max : 0); zr += 1) {
      const str = '0'.repeat(zl) + t.digits + '0'.repeat(zr);
      for (let pos = 0; pos <= str.length; pos += 1) {
        if (D.eq(D.fromSlip(str, str.length - pos), t.targetValue)) out.push({ zl, zr, pos, str });
      }
    }
  }
  return out;
}
/** Les zéros qu'il faut au minimum : { left, right } (mosaic : 0 / 0). */
export function zerosNeeded(task) {
  const sols = solutions(task);
  const best = sols.reduce((b, x) => (b === null || x.zl + x.zr < b.zl + b.zr ? x : b), null);
  return best ? { left: best.zl, right: best.zr } : null;
}

/* ── État ───────────────────────────────────────────────────────────────────────────────── */

const put = (s, patch) => Object.freeze({ ...s, ...patch });

export function init({ world, tasks, level }) {
  const list = (tasksFor({ world, tasks, level }) ?? []).map(normalizeTask);
  if (list.length === 0) throw new RangeError('decimal-comma: at least one task');
  return Object.freeze({
    world: world ?? worldOf(list),
    tasks: Object.freeze(list),
    ti: 0,
    boards: Object.freeze(list.map(board0)),
    done: Object.freeze({}),
    solved: Object.freeze({}),
    trials: Object.freeze([]),
    last: null,
    free: null,
  });
}

/**
 * La planche ACTIVE : celle de la tâche, ou celle de l'essai libre.
 *   { free, kind, core, zl, zr, pos, len, str, point, task, op, e, startPoint, targetValue }
 */
export function activeOf(s) {
  const f = s.free;
  if (f) {
    const str = '0'.repeat(f.zl) + f.core + '0'.repeat(f.zr);
    const e = s.world === 'machine' ? D.opExponent(f.op) : null;
    const targetValue = s.world === 'machine' ? D.shift(D.fromSlip(f.core, f.startPoint), e) : null;
    return { free: true, kind: s.world === 'machine' ? 'shift' : 'free', core: f.core, zl: f.zl, zr: f.zr, pos: f.pos, len: str.length, str, point: str.length - f.pos, task: null, op: f.op, e, startPoint: f.startPoint, targetValue };
  }
  const t = s.tasks[s.ti];
  const b = s.boards[s.ti];
  const str = '0'.repeat(b.zl) + t.digits + '0'.repeat(b.zr);
  return { free: false, kind: t.kind, core: t.digits, zl: b.zl, zr: b.zr, pos: b.pos, len: str.length, str, point: str.length - b.pos, task: t, op: t.op, e: t.e, startPoint: t.startPoint, targetValue: t.targetValue };
}

export const taskOf = (s) => s.tasks[s.ti];
export const valueOf = (s) => { const a = activeOf(s); return D.fromSlip(a.str, a.point); };
export const shownOf = (s) => { const a = activeOf(s); return D.slipText(a.str, a.point); };
export const taskDone = (s, i = s.ti) => !!s.done[i];
export const discoveryReady = (s) => s.tasks.every((_, i) => !!s.done[i]);
export const canNext = (s) => !s.free && taskDone(s) && s.ti < s.tasks.length - 1;
export const isFree = (s) => !!s.free;

/** Le verdict EXACT de la planche active contre sa cible : 'exact' | 'more' | 'less' | null (essai libre en mosaïque : rien à juger). */
export function verdictOf(s) {
  const a = activeOf(s);
  if (!a.targetValue) return null;
  const c = D.cmp(D.fromSlip(a.str, a.point), a.targetValue);
  return c === 0 ? 'exact' : c > 0 ? 'more' : 'less';
}

/** Le texte de la cible d'un rapport : la chaîne de la tâche (« 2,35 », « 3125/1000 ») ou le résultat de la machine. */
const targetText = (a) => (a.free ? (a.targetValue ? D.formatTrim(a.targetValue) : null) : a.task.target);

function record(s, a, verdict, patch = {}) {
  const trial = Object.freeze({
    task: s.ti, kind: a.kind === 'free' ? 'match' : a.kind, digits: a.str, point: a.point,
    shown: D.slipText(a.str, a.point), value: D.slipValueText(a.str, a.point), target: targetText(a),
    ok: verdict === 'exact', verdict, zeros: Object.freeze({ left: a.zl, right: a.zr }), free: a.free, pos: a.pos, ...patch,
  });
  return trial;
}

function withBoard(s, a, board) {
  if (a.free) return { free: Object.freeze({ ...s.free, ...board }) };
  const boards = s.boards.slice();
  boards[s.ti] = Object.freeze({ ...s.boards[s.ti], ...board });
  return { boards: Object.freeze(boards) };
}

function judged(s, a2board, extra = {}) {
  const base = put(s, a2board);
  const a = activeOf(base);
  const verdict = extra.refused ? 'nodigit' : verdictOf(base);
  const trial = record(base, a, verdict, extra.refused ? { side: extra.refused } : {});
  const isDone = !a.free && trial.ok;
  return put(base, {
    trials: Object.freeze([...base.trials, trial]),
    last: Object.freeze({ ...trial, free: a.free }),
    done: isDone && !base.done[base.ti] ? Object.freeze({ ...base.done, [base.ti]: true }) : base.done,
    solved: isDone && !base.solved[base.ti] ? Object.freeze({ ...base.solved, [base.ti]: Object.freeze({ shown: trial.shown, value: trial.value, digits: trial.digits, point: trial.point, zeros: trial.zeros }) }) : base.solved,
  });
}

/**
 * LE RELÂCHEMENT de la virgule à l'espace `pos` (entier ; hors de 0 … len = « plus loin que le dernier chiffre »).
 * `machine` : hors de la bande → refus `nodigit` (la virgule va au bout, la planche reste telle quelle) ; `mosaic` : on colle au bout.
 * Un relâchement qui ne change rien n'est pas un essai (sauf un refus).
 */
export function release(s, pos) {
  const a = activeOf(s);
  const intent = Math.round(pos);
  const beyond = intent < 0 || intent > a.len;
  const clamped = Math.max(0, Math.min(a.len, intent));
  const world = s.world;
  if (beyond && world === 'machine') {
    const side = intent > a.len ? 'right' : 'left';
    const moved = withBoard(s, a, { pos: clamped });
    // la virgule est maintenant au bout : si la valeur y est déjà juste, c'est un succès ordinaire
    const probe = activeOf(put(s, moved));
    const hit = probe.targetValue && D.eq(D.fromSlip(probe.str, probe.point), probe.targetValue);
    if (hit && clamped === a.pos) return s;
    return judged(s, moved, hit ? {} : { refused: side });
  }
  if (clamped === a.pos) return s;
  return judged(s, withBoard(s, a, { pos: clamped }));
}

/** « + 0 » aux bouts de la planche de sortie (monde `machine`) : la valeur ne change pas, la virgule reste entre les mêmes chiffres. */
export function addZero(s, side) {
  if (s.world !== 'machine') return s;
  const a = activeOf(s);
  if (side === 'left') return a.zl >= ZERO_MAX ? s : judged(s, withBoard(s, a, { zl: a.zl + 1, pos: a.pos + 1 }));
  return a.zr >= ZERO_MAX ? s : judged(s, withBoard(s, a, { zr: a.zr + 1 }));
}
export function removeZero(s, side) {
  if (s.world !== 'machine') return s;
  const a = activeOf(s);
  if (side === 'left') return a.zl <= 0 ? s : judged(s, withBoard(s, a, { zl: a.zl - 1, pos: Math.max(0, a.pos - 1) }));
  return a.zr <= 0 ? s : judged(s, withBoard(s, a, { zr: a.zr - 1, pos: Math.min(a.pos, a.len - 1) }));
}

export function nextTask(s) {
  if (!canNext(s)) return s;
  return put(s, { ti: s.ti + 1, last: null });
}
/** « إعادة » : la tâche en cours (ou la planche libre) repart de sa virgule d'origine ; les essais déjà faits restent. */
export function restartTask(s) {
  if (s.free) return put(s, { free: Object.freeze({ ...s.free, ...freeBoard0(s.free.core, s.free.startPoint, s.free.op) }), last: null });
  const boards = s.boards.slice();
  boards[s.ti] = board0(s.tasks[s.ti]);
  return put(s, { boards: Object.freeze(boards), last: null });
}

/** « أعِد التجربة » (questions du labo) : LA MÊME tâche repart de sa virgule d'origine, NON faite (la carte se rouvrira à la réussite). */
export function retryTask(s) {
  const boards = s.boards.slice();
  boards[s.ti] = board0(s.tasks[s.ti]);
  const done = { ...s.done }; delete done[s.ti];
  const solved = { ...s.solved }; delete solved[s.ti];
  return put(s, { boards: Object.freeze(boards), done: Object.freeze(done), solved: Object.freeze(solved), last: null, free: null });
}

/* ── Ses propres chiffres : la planche LIBRE ────────────────────────────────────────────── */

const freeBoard0 = (core, startPoint, op) => ({ core, startPoint, op, zl: 0, zr: 0, pos: core.length - startPoint });

/**
 * « جرّب أعدادك أنت » : l'élève tape ses chiffres (≤ 5 ; en `machine` il peut aussi taper UNE virgule : « 14,37 »). Chaque
 * changement remet la planche libre à zéro ; ses essais portent `free: true` et ne comptent JAMAIS pour la découverte.
 * @returns le même état si le texte n'a aucun chiffre.
 */
export function setFree(s, text) {
  const raw = String(text ?? '').replace(/[\s ]/g, '').replace('.', ',');
  const comma = s.world === 'machine' ? raw.indexOf(',') : -1;
  const digits = raw.replace(/[^0-9]/g, '').slice(0, FREE_MAX_DIGITS);
  if (!digits) return s;
  const startPoint = comma >= 0 ? Math.max(0, Math.min(digits.length, raw.slice(comma + 1).replace(/[^0-9]/g, '').length)) : 0;
  const op = s.free?.op ?? (s.world === 'machine' ? D.OPERATORS[0] : '×10');
  if (s.free && s.free.core === digits && s.free.startPoint === startPoint) return s;
  return put(s, { free: Object.freeze(freeBoard0(digits, startPoint, op)), last: null });
}
export function setFreeOp(s, op) {
  if (s.world !== 'machine' || D.opExponent(op) === null) return s;
  const f = s.free ?? freeBoard0(s.tasks[s.ti].digits ?? '35', s.tasks[s.ti].startPoint ?? 0, op);
  if (s.free && s.free.op === op) return s;
  return put(s, { free: Object.freeze({ ...freeBoard0(f.core, f.startPoint, op) }), last: null });
}
export function toGuided(s) { return s.free ? put(s, { free: null, last: null }) : s; }

/* ── Ce que la leçon reçoit ─────────────────────────────────────────────────────────────── */

/** Un essai pour `onTrial` (la leçon l'écoute via `state.report`). */
export const trialEvidence = (tr) => ({
  task: tr.task, kind: tr.kind, digits: tr.digits, point: tr.point, shown: tr.shown, value: tr.value, target: tr.target,
  ok: tr.ok, verdict: tr.verdict, zeros: { left: tr.zeros.left, right: tr.zeros.right }, free: Boolean(tr.free),
});
/** Les essais GUIDÉS d'une tâche (hors planche libre). */
export const guidedTrials = (s, i = s.ti) => s.trials.filter((t) => !t.free && t.task === i);

/* ── Les pièces du monde `mosaic` ───────────────────────────────────────────────────────── */

/**
 * Les groupes de pièces à dessiner pour une valeur (exacts) : [{ kind, exp, count, icons, mult }]
 *   kind 'panel' exp 0 : les panneaux des unités (icons = le chiffre, mult 1) ;
 *   kind 'panel' exp 1 : TOUS les panneaux des rangs au-dessus des unités, d'un bloc : UN symbole (pile + « ×N »), icons 1, mult = N exact ;
 *   kind 'strip' / 'tile' / 'shard' : count = icons = chiffre du rang (mult 1).
 *   `finer` : la valeur des rangs plus fins que les éclats (non dessinés), ou null.
 */
export function blocksOf(v) {
  const p = D.piecesOf(v);
  const groups = [];
  const above = p.panels - p.units;
  if (above > 0) groups.push({ kind: 'panel', exp: 1, count: above, icons: 1, mult: above });
  if (p.units > 0) groups.push({ kind: 'panel', exp: 0, count: p.units, icons: p.units, mult: 1 });
  if (p.tenths > 0) groups.push({ kind: 'strip', exp: -1, count: p.tenths, icons: p.tenths, mult: 1 });
  if (p.hundredths > 0) groups.push({ kind: 'tile', exp: -2, count: p.hundredths, icons: p.hundredths, mult: 1 });
  if (p.thousandths > 0) groups.push({ kind: 'shard', exp: -3, count: p.thousandths, icons: p.thousandths, mult: 1 });
  return { groups, finer: p.finer, panels: p.panels, pieces: p };
}

/** Les quantités à nommer en phrase : [{ kind: 'panel'|'strip'|'tile'|'shard', count }] — tous les panneaux ensemble, rangs vides omis. */
export function pieceList(v) {
  const p = D.piecesOf(v);
  const out = [];
  if (p.panels > 0) out.push({ kind: 'panel', count: p.panels });
  if (p.tenths > 0) out.push({ kind: 'strip', count: p.tenths });
  if (p.hundredths > 0) out.push({ kind: 'tile', count: p.hundredths });
  if (p.thousandths > 0) out.push({ kind: 'shard', count: p.thousandths });
  return out;
}

/* ── Les rangs sous les chiffres ────────────────────────────────────────────────────────── */

/** Pour chaque chiffre de la planche : { digit, exp, name, piece } ; `piece` : 'panel' | 'strip' | 'tile' | 'shard' | 'group' | 'fine'. */
export function ranksOf(str, point) {
  return D.exponentsOf(str, point).map((exp, i) => ({
    i, digit: Number(str[i]), exp, name: D.rankName(exp),
    piece: exp === 0 ? 'panel' : exp === -1 ? 'strip' : exp === -2 ? 'tile' : exp === -3 ? 'shard' : exp > 0 ? 'group' : 'fine',
  }));
}

/* ── Géométrie de la bande (px), pure et testée ─────────────────────────────────────────── */

/**
 * La bande : len tuiles de chiffre (largeur `tileW`) séparées par len + 1 espaces (largeur `gapW`).
 *   gapCenter(j)    abscisse du centre de l'espace j ; tileLeft(i) : bord gauche de la tuile i ; width : largeur totale ;
 *   nearestGap(x)   l'espace le plus proche d'une abscisse (peut sortir de 0 … len : l'intention « plus loin que le dernier chiffre »).
 * `tileW` : la plus grande largeur ≤ maxTile telle que la bande entière (zéros ajoutés compris) tient dans `width`.
 */
export function slipLayout({ width, len, maxTile = 64, minTile = 30, gapRatio = 0.5 }) {
  const totalOf = (t) => { const g = Math.round(t * gapRatio); return len * (t + g) + g; };
  let tileW = maxTile;
  while (tileW > minTile && totalOf(tileW) > width) tileW -= 1;
  const gapW = Math.round(tileW * gapRatio);
  const pitch = tileW + gapW;
  const total = len * pitch + gapW;
  return {
    tileW, gapW, pitch, width: total, tileH: Math.round(Math.min(tileW * 1.4, 76)),
    gapCenter: (j) => j * pitch + gapW / 2,
    tileLeft: (i) => i * pitch + gapW,
    nearestGap: (x) => Math.round((x - gapW / 2) / pitch),
  };
}

/* ── Onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ──────────────────────────────── */

/**
 * La prochaine commande à montrer — jamais OÙ la virgule doit finir :
 *   grab   avant tout relâchement de la tâche : la virgule ;
 *   move   ensuite, tant que la tâche n'est pas juste : la virgule encore ;
 *   zero   (machine) la virgule vient d'être refusée au bout (`nodigit`) : le bouton « + 0 » de CE bout-là ;
 *   next   la tâche est juste et il en reste : « المهمة التالية ».
 * `null` : planche libre, ou toutes les tâches faites (la découverte s'ouvre).
 * @returns {{ id: string, target: string, gesture: 'drag' | 'tap' } | null}
 */
export function coachOf(s) {
  if (s.free || discoveryReady(s)) return null;
  if (taskDone(s)) return canNext(s) ? { id: 'next', target: '[data-dc-next]', gesture: 'tap' } : null;
  const mine = guidedTrials(s);
  if (mine.length === 0) return { id: 'grab', target: '[data-dc-comma]', gesture: 'drag' };
  if (s.world === 'machine' && s.last?.verdict === 'nodigit') return { id: 'zero', target: `[data-dc-zero="${s.last.side}"]`, gesture: 'tap' };
  return { id: 'move', target: '[data-dc-comma]', gesture: 'drag' };
}

/* ── La découverte : les réfutations avec SES planches ──────────────────────────────────── */

/**
 * Mosaïque. Les mêmes chiffres, deux virgules : le plus de chiffres après la virgule donne la plus petite valeur. Prend ses
 * essais guidés sur les chiffres de la première tâche (sinon les deux bouts de la bande, qui sont des faits sur ces chiffres).
 *   → { digits, wide: { shown, point, value }, narrow: { shown, point, value } }  (wide : plus de décimales)
 */
export function sameDigitsPair(s, i = 0) {
  const t = s.tasks[i];
  const digits = t.digits;
  const seen = s.trials.filter((x) => !x.free && x.task === i && x.digits === digits);
  const points = [...new Set(seen.map((x) => x.point))];
  const pLow = points.length >= 2 ? Math.min(...points) : 0;
  const pHigh = points.length >= 2 ? Math.max(...points) : digits.length;
  const mk = (p) => ({ point: p, shown: D.slipText(digits, p), value: D.slipValueText(digits, p) });
  return { digits, wide: mk(pHigh), narrow: mk(pLow) };
}

/** Machine : la tâche qui a demandé le moins de zéros (la réfutation « elle ajoute juste des zéros ») et la première (« elle change les chiffres »). */
export function machineWitness(s) {
  const solved = s.tasks.map((t, i) => ({ t, i, sol: s.solved[i] })).filter((x) => x.sol);
  const pool = solved.length ? solved : s.tasks.map((t, i) => ({ t, i, sol: null }));
  const fewest = pool.reduce((b, x) => {
    const z = x.sol ? x.sol.zeros.left + x.sol.zeros.right : (zerosNeeded(x.t)?.left ?? 0) + (zerosNeeded(x.t)?.right ?? 0);
    return b === null || z < b.z ? { ...x, z } : b;
  }, null);
  const first = pool[0];
  const out = (x) => ({ i: x.i, op: x.t.op, start: x.t.start, digits: x.t.digits, result: x.sol ? x.sol.value : x.t.target, zeros: x.sol ? x.sol.zeros : zerosNeeded(x.t) ?? { left: 0, right: 0 } });
  return { first: out(first), fewest: out(fewest) };
}

/** La phase formelle (machine) pour UNE tâche résolue : le déplacement de la virgule dans SES planches. */
export function movedPlaces(task) {
  return { places: Math.abs(task.e), direction: task.e >= 0 ? 'right' : 'left' };
}
