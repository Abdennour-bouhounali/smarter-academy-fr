/**
 * parallel-level — la logique PURE du niveau à bulle (unité 9 « خاصية طالس », درس « الخاصية العكسية لخاصية
 * طالس وإثبات التوازي »). Aucun React ici, aucune arithmétique propre : le verdict « parallèle ou non » et ses
 * raisons viennent de `thales.converse` (packages/core/arithmetic/thales.js), les rapports de `thales.ratio`.
 *
 * LE MODÈLE. Deux barres sécantes en A, graduées d'une encoche par unité : la barre (d) porte B à l'abscisse
 * SIGNÉE b (vers le bas, B est au sol), la barre (d′) porte C à c. L'élève pose B′ sur une encoche de (d) et C′
 * sur une encoche de (d′) ; une planche (B′C′) les joint, un niveau à bulle est posé dessus. Le sol est (BC) :
 * « de niveau » ⇔ (B′C′) // (BC).
 *   • mode `ladder` (مبتدئ) : l'échelle double — les montants s'arrêtent en A, encoches 1 … b − 1 et 1 … c − 1 ;
 *   • mode `crossing` (متقدم, نشاط 2) : le tréteau en X — les barres continuent au-delà de A (abscisses
 *     négatives, jusqu'à ⌈2b/3⌉), le rapport `ratio` (1/3) est IMPOSÉ par le professeur.
 *
 * LES ENCOCHES (« slots »). Pour le clavier et le glisser, une barre est une suite CONTIGUË d'entiers s qui
 * MONTE le long de la barre (vers A, puis au-delà) : s < 0 ⇔ abscisse a = −s (entre A et le pied) ; s ≥ 0 ⇔
 * a = −(s + 1) (de l'autre côté de A). A lui-même (a = 0) n'est jamais une encoche.
 *
 *   const s = init({ AB: 6, AC: 9, mode: 'ladder' });
 *   commit(s, 'B', slotOf(2)) puis commit(…, 'C', slotOf(3))  → la planche est de niveau (2/6 = 3/9)
 *   init({ AB: 9, AC: 12, ratio: '1/3', mode: 'crossing' }) : (3 ; −4) respecte le rapport 1/3 mais pas l'ordre —
 *   la figure 3 des élèves, refusée par la bulle (`reason: 'order'`).
 *
 * UN ESSAI est une position VALIDÉE (relâchement, pause du clavier, toucher d'une encoche) — pas une valeur que
 * le doigt a traversée. La découverte demande un CONTRASTE : مبتدئ, deux planches de niveau de rapports
 * différents (1/3 et 2/3 — « les milieux » est ainsi réfuté) et une planche penchée ; متقدم, les trois figures
 * des élèves (1 : de l'autre côté de A, 2 : entre A et les pieds, 3 : une de chaque côté).
 */
import * as TH from '@smarter-academy/core/arithmetic/thales.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

const MODES = Object.freeze(['ladder', 'crossing']);

/** Le plus petit montant : 2 (l'échelle 2 / 4 de la manche d'entraînement du lecteur, conseil du 2026-11-10, L2.6 — une seule encoche sur AB). */
export const MIN_BAR = 2;
const posInt = (v, name) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n < MIN_BAR || n > 30) throw new Error(`parallel-level: ${name} entier entre ${MIN_BAR} et 30 (« ${v} »)`);
  return n;
};

/** L'abscisse signée d'une encoche (jamais 0) et l'encoche d'une abscisse. */
export const abscissaOf = (slot) => (slot < 0 ? -slot : -(slot + 1));
export const slotOf = (a) => {
  if (!Number.isInteger(a) || a === 0) throw new Error(`parallel-level: abscisse « ${a} »`);
  return a > 0 ? -a : -a - 1;
};
/** Le nombre d'encoches au-delà de A (mode crossing) : ⌈2n/3⌉ — assez pour le tiers et la figure 1. */
const upCount = (n, mode) => (mode === 'crossing' ? Math.ceil((2 * n) / 3) : 0);

/** La plage d'encoches d'une barre de longueur n : du pied (exclu) jusqu'au bout au-delà de A. */
export function slotRange(n, mode) {
  return Object.freeze({ min: -(n - 1), max: upCount(n, mode) - 1 });
}

/**
 * L'encoche la plus proche d'une abscisse CONTINUE (lue sous le doigt) : A n'est jamais choisi, un doigt
 * juste au-dessus de A donne −1, juste en dessous 1 ; le résultat est borné à la plage.
 */
export function slotFromAbscissa(t, range) {
  const idx = t >= 0 ? -(Math.max(t, 1)) : -(Math.min(t, -1)) - 1;
  return Math.min(range.max, Math.max(range.min, Math.round(idx)));
}

export function init({ AB, AC, ratio, mode = 'ladder' } = {}) {
  if (!MODES.includes(mode)) throw new Error(`parallel-level: mode « ${mode} »`);
  const b = posInt(AB, 'AB');
  const c = posInt(AC, 'AC');
  const target = mode === 'crossing' && ratio != null ? LIN.parseNumber(ratio) : null;
  if (target && (LIN.cmp(target, LIN.frac(0)) <= 0 || LIN.cmp(target, LIN.frac(1)) >= 0)) throw new Error(`parallel-level: rapport « ${ratio} »`);
  return Object.freeze({
    mode, b, c, target,
    rangeB: slotRange(b, mode), rangeC: slotRange(c, mode),
    // départ : la dernière encoche avant chaque pied (« même distance aux pieds » : la planche penche,
    // (b − 1)/b ≠ (c − 1)/c) ; les deux poignées sont loin l'une de l'autre — ce n'est pas un essai
    sB: slotOf(b - 1), sC: slotOf(c - 1),
    trials: [], last: null,
  });
}

const clampSlot = (s, r) => Math.min(r.max, Math.max(r.min, Math.round(s)));

/** Les abscisses courantes de B′ et C′. */
export const positions = (lab) => ({ bp: abscissaOf(lab.sB), cp: abscissaOf(lab.sC) });

/**
 * L'état mathématique de la planche — tout vient de `thales.converse` : les deux rapports de longueurs,
 * leur égalité, l'ordre (même signe), le parallélisme et la raison qui manque ('ratios' | 'order' | null).
 */
export function reading(lab, at = positions(lab)) {
  const { bp, cp } = at;
  const v = TH.converse({ b: lab.b, bp, c: lab.c, cp });
  const condition = lab.target ? LIN.eq(v.ratioB, lab.target) && LIN.eq(v.ratioC, lab.target) : null;
  return Object.freeze({ bp, cp, ...v, condition, figure: figureOf(bp, cp) });
}

/** La figure de نشاط 2 d'une position (signes des abscisses). */
function figureOf(bp, cp) {
  if (bp > 0 && cp > 0) return '2';
  if (bp < 0 && cp < 0) return '1';
  return bp > 0 ? '3' : '3m';
}

/** Déplacer une extrémité PENDANT le geste : la planche et la bulle suivent, rien n'est enregistré. */
export function move(lab, end, slot) {
  const key = end === 'B' ? 'sB' : 'sC';
  const s = clampSlot(slot, end === 'B' ? lab.rangeB : lab.rangeC);
  if (lab[key] === s) return lab;
  return Object.freeze({ ...lab, [key]: s, last: { kind: 'move', end } });
}

/**
 * Le type d'un essai validé — ce que l'écran dit, et ce que la découverte compte. Le tréteau SANS rapport imposé (manches du lecteur,
 * 2026-11-10) : deux rapports différents donnent une planche penchée (`tilted`), pas « شرط الأستاذ » — il n'y a pas de professeur
 * (bogue corrigé : `condition` valait null et chaque essai était marqué `condition`).
 */
function kindOf(lab, r) {
  if (lab.mode === 'ladder') return r.parallel ? 'level' : 'tilted';
  if (lab.target) {
    if (!r.condition) return 'condition';
    return r.parallel ? 'figure' : 'order';
  }
  if (r.parallel) return 'figure';
  return r.ratiosEqual ? 'order' : 'tilted';
}

/** Valider une position (relâchement, pause du clavier, toucher) : un ESSAI, enregistré une fois. */
export function commit(lab, end, slot) {
  const moved = slot == null ? lab : move(lab, end, slot);
  const r = reading(moved);
  const kind = kindOf(moved, r);
  const trial = Object.freeze({
    bp: r.bp, cp: r.cp, ratioB: r.ratioB, ratioC: r.ratioC, ratiosEqual: r.ratiosEqual, sameOrder: r.sameOrder,
    parallel: r.parallel, reason: r.reason, condition: r.condition, figure: kind === 'figure' || kind === 'order' ? r.figure : null, kind,
  });
  const prev = moved.trials.at(-1);
  const same = prev && prev.bp === trial.bp && prev.cp === trial.cp;
  return Object.freeze({ ...moved, trials: same ? moved.trials : [...moved.trials, trial], last: { kind: 'commit', trial } });
}

/** Les rapports k (en texte exact) des planches de niveau trouvées (مبتدئ). */
export const levelRatios = (lab) => [...new Set(lab.trials.filter((t) => t.kind === 'level').map((t) => LIN.fracText(t.ratioB)))];
/** Les figures de نشاط 2 produites en respectant le rapport imposé (متقدم). */
export const figuresMade = (lab) => [...new Set(lab.trials.filter((t) => t.figure).map((t) => t.figure))];
/** Le premier essai d'une figure (pour la citer dans la découverte et la règle). */
export const figureTrial = (lab, f) => lab.trials.find((t) => t.figure === f) ?? null;

/**
 * La découverte s'ouvre sur un CONTRASTE vu par l'élève :
 *   ladder   — deux planches de niveau de rapports DIFFÉRENTS et au moins une planche penchée ;
 *   crossing — les figures 1 et 2 (parallèles) ET la figure 3 ou son miroir (mêmes rapports, ordre inversé).
 */
export function discoveryReady(lab) {
  if (lab.mode === 'ladder') return levelRatios(lab).length >= 2 && lab.trials.some((t) => t.kind === 'tilted');
  const f = figuresMade(lab);
  return f.includes('1') && f.includes('2') && (f.includes('3') || f.includes('3m'));
}

/* ── les deux ÉTAPES du labo (questions pendant le labo, lot 4) ─────────────────────────────────────── */

/** Étape 1 atteinte : ladder — une planche de niveau ; crossing — les figures 1 ET 2 (de part et d'autre du rapport imposé). */
export function stageOneReached(lab) {
  if (lab.mode === 'ladder') return levelRatios(lab).length >= 1;
  const f = figuresMade(lab);
  return f.includes('1') && f.includes('2');
}
/** Étape 2 atteinte : le contraste complet de la découverte. */
export const stageTwoReached = discoveryReady;

/** La tâche 'one' | 'two' repart de zéro : toutes les planches effacées (one) ou seulement celles de l'étape 2 (two). */
export function retryStage(lab, stage) {
  const fresh = init({ AB: lab.b, AC: lab.c, ratio: lab.target ? LIN.fracText(lab.target) : undefined, mode: lab.mode });
  if (stage === 'one') return fresh;
  const keep = [];
  const seen = new Set();
  for (const t of lab.trials) {
    const key = lab.mode === 'ladder' ? (t.kind === 'level' ? 'level' : null) : (t.figure === '1' || t.figure === '2' ? t.figure : null);
    if (key && !seen.has(key) && (lab.mode === 'crossing' || seen.size === 0)) { seen.add(key); keep.push(t); }
  }
  return Object.freeze({ ...fresh, trials: keep });
}

/** Ce que la leçon reçoit à chaque essai (`onTrial`) : des nombres, jamais un composant. */
export function evidenceOf(lab) {
  const t = lab.trials.at(-1);
  if (!t) return null;
  return Object.freeze({
    mode: lab.mode, AB: lab.b, AC: lab.c, bp: t.bp, cp: t.cp,
    ratioB: LIN.fracText(t.ratioB), ratioC: LIN.fracText(t.ratioC),
    ratiosEqual: t.ratiosEqual, sameOrder: t.sameOrder, parallel: t.parallel, reason: t.reason,
    condition: t.condition, figure: t.figure, kind: t.kind,
  });
}

/* ── écritures ─────────────────────────────────────────────────────────── */

/** « \dfrac{2}{6} = \dfrac{1}{3} » (la longueur sur le tout, puis réduite si elle se réduit). */
export function ratioTex(part, whole) {
  const p = Math.abs(part);
  const r = TH.ratio(p, whole);
  const raw = `\\dfrac{${p}}{${whole}}`;
  return r.n === p && r.d === whole ? raw : `${raw} = ${LIN.fracLatex(r)}`;
}
/** La ligne des deux rapports d'une position : « \dfrac{AB'}{AB} = … ، \dfrac{AC'}{AC} = … » (deux îlots). */
export function ratiosLine(lab, at = positions(lab)) {
  return [`$\\dfrac{AB'}{AB} = ${ratioTex(at.bp, lab.b)}$`, `$\\dfrac{AC'}{AC} = ${ratioTex(at.cp, lab.c)}$`];
}

/* ── géométrie (flottants : le DESSIN seulement ; le verdict reste celui de converse) ─────────── */

/** La hauteur de A au-dessus du sol (unités du modèle) : une échelle lisible, un X presque carré. */
const apexHeight = (b, c, mode) => (mode === 'crossing' ? 0.8 : 0.9) * Math.min(b, c);

/**
 * Le dessin : A en haut, B et C au sol (y = 0, y vers le HAUT dans le modèle), puis mis à l'échelle dans
 * `width` × `height` (px, y vers le BAS). Rend les points, les encoches de chaque barre, B′, C′, l'angle de la
 * planche (degrés, sens écran) et le décalage de la bulle dans [−1, 1] — 0 SEULEMENT si converse dit
 * parallèle, sinon au moins `MIN_BUBBLE` (une planche presque de niveau ne trompe pas l'œil).
 */
export const MIN_BUBBLE = 0.35;
const FULL_TILT_DEG = 14;

/** Les points du modèle (unités, y vers le haut) et leur boîte. */
function model(lab) {
  const { b, c, mode } = lab;
  const h = apexHeight(b, c, mode);
  const A = [0, h];
  const B = [-Math.sqrt(b * b - h * h), 0];
  const C = [Math.sqrt(c * c - h * h), 0];
  const unitB = [(B[0] - A[0]) / b, (B[1] - A[1]) / b];
  const unitC = [(C[0] - A[0]) / c, (C[1] - A[1]) / c];
  const onB = (a) => [A[0] + a * unitB[0], A[1] + a * unitB[1]];
  const onC = (a) => [A[0] + a * unitC[0], A[1] + a * unitC[1]];
  const topB = onB(-upCount(b, mode));
  const topC = onC(-upCount(c, mode));
  const all = [A, B, C, topB, topC];
  const minX = Math.min(...all.map((p) => p[0])); const maxX = Math.max(...all.map((p) => p[0]));
  const maxY = Math.max(...all.map((p) => p[1]));
  return { A, B, C, onB, onC, topB, topC, minX, maxX, maxY };
}

/** La hauteur (px) qu'il faut au dessin pour remplir `width` — le module la borne ensuite par l'écran. */
export function naturalHeight(lab, width, pad = 26) {
  const m = model(lab);
  return Math.round(((width - 2 * pad) / (m.maxX - m.minX)) * m.maxY + 2 * pad);
}

export function geometry(lab, { width, height, pad = 26, at = positions(lab) } = {}) {
  const { b, c } = lab;
  const { A, B, C, onB, onC, topB, topC, minX, maxX, maxY } = model(lab);
  const s = Math.max(1, Math.min((width - 2 * pad) / (maxX - minX), (height - 2 * pad) / maxY));
  const offX = (width - (maxX - minX) * s) / 2;
  const offY = (height - maxY * s) / 2;
  const to = (p) => [offX + (p[0] - minX) * s, offY + (maxY - p[1]) * s];
  const notches = (n, on, range) => {
    const out = [];
    for (let sl = range.min; sl <= range.max; sl += 1) { const a = abscissaOf(sl); out.push({ slot: sl, a, xy: to(on(a)) }); }
    return out;
  };
  const Bp = to(onB(at.bp));
  const Cp = to(onC(at.cp));
  const r = reading(lab, at);
  // l'angle de la planche à l'écran, ramené dans ]−90°, 90°] (la planche n'a pas de sens)
  let deg = (Math.atan2(Cp[1] - Bp[1], Cp[0] - Bp[0]) * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg <= -90) deg += 180;
  // la bulle monte vers l'extrémité HAUTE : à l'écran, deg > 0 ⇔ l'extrémité droite est plus BASSE ⇒ bulle à gauche
  let bubble = 0;
  if (!r.parallel) {
    const raw = Math.max(-1, Math.min(1, -deg / FULL_TILT_DEG));
    bubble = Math.abs(raw) < MIN_BUBBLE ? (raw < 0 || (raw === 0 && deg > 0) ? -MIN_BUBBLE : MIN_BUBBLE) : raw;
  }
  const px = (p) => p.map((v) => Math.round(v * 10) / 10);
  return {
    width, height, scale: s,
    A: px(to(A)), B: px(to(B)), C: px(to(C)), topB: px(to(topB)), topC: px(to(topC)),
    Bp: px(Bp), Cp: px(Cp), deg, bubble, parallel: r.parallel,
    notchesB: notches(b, onB, lab.rangeB), notchesC: notches(c, onC, lab.rangeC),
    /** L'abscisse CONTINUE (unités) d'un point écran projeté sur une barre — le doigt lu sous la barre. */
    abscissaAt(end, x, y) {
      const P0 = to(A); const P1 = to(end === 'B' ? B : C);
      const n = end === 'B' ? b : c;
      const dx = P1[0] - P0[0]; const dy = P1[1] - P0[1];
      return (((x - P0[0]) * dx + (y - P0[1]) * dy) / (dx * dx + dy * dy)) * n;
    },
    /** Le sens écran de la montée (vers A) sur une barre : +1 si monter va vers la droite. */
    upward(end) { const P1 = to(end === 'B' ? B : C); const P0 = to(A); return P0[0] >= P1[0] ? 1 : -1; },
  };
}

/* ══════════════ LECTEUR DE MISSION (rollout 2026-11-10, unité 9 leçon 2 ; conseil du 2026-11-10, L2.1–L2.7) ══════════════ */

/**
 * L'essai d'une manche est UN appui sur « ضع الميزان » (L2.1) : la bulle est CACHÉE pendant que les extrémités bougent, le bouton valide la
 * position courante (`commit(lab, null)`), la même position deux fois n'est pas un nouvel essai. Ce que la manche reçoit (`onVerdict`) :
 *   ladder   — groups = l'encoche de B′ (AB′), exact = planche de niveau ;
 *   crossing — groups = la figure de la position (1 : au-delà de A, 2 : entre A et les pieds, 3 : une de chaque côté), exact = planche
 *              parallèle ET (rapport imposé) condition du professeur respectée ; un essai refusé par le rapport imposé : groups 0.
 */
export function verdictOf(lab, trial) {
  if (lab.mode === 'ladder') return Object.freeze({ groups: Math.abs(trial.bp), exact: Boolean(trial.parallel) });
  if (trial.kind === 'condition') return Object.freeze({ groups: 0, exact: false });
  const f = figureOf(trial.bp, trial.cp);
  return Object.freeze({ groups: f === '3m' ? 3 : Number(f), exact: Boolean(trial.parallel) });
}

/** La découverte du lecteur : ladder — deux planches de niveau de rapports différents ; crossing — les figures 1, 2 et 3 (comme la page). */
export function playerDiscovery(lab) {
  if (lab.mode === 'ladder') return levelRatios(lab).length >= 2;
  return discoveryReady(lab);
}

/** La « classe » d'une position, pour juger une prédiction : la même configuration, pas forcément les mêmes nombres. */
export function classOf(r) {
  if (r.parallel) return `par${figureOf(r.bp, r.cp) === '1' ? 1 : 2}`;
  if (r.reason === 'order') return 'order';
  return r.sameOrder ? 'ratios-same' : 'ratios-opp';
}

/** La vérité d'une prédiction « هل تتوسّط الفقاعة؟ » sur une position `at = [bp, cp]` : calculée par converse. */
export const predictTruth = (lab, at) => (reading(lab, { bp: at[0], cp: at[1] }).parallel ? 'yes' : 'no');

/**
 * Les prédictions JUGÉES (leurs clés) : une prédiction sur la position `at` est jugée par le premier essai de la MÊME classe (classOf) ;
 * toutes le sont quand `all` (la dernière suite de la manche est atteinte) — son résultat n'est jamais perdu derrière la question.
 */
export function judgedPredictions(lab, preds, all = false) {
  return preds.filter((p) => {
    if (all) return true;
    const cls = classOf(reading(lab, { bp: p.at[0], cp: p.at[1] }));
    return lab.trials.some((t) => classOf(t) === cls);
  }).map((p) => p.key);
}

/** Un rapport de longueurs écrit exactement (réduit) : « 1/3 », « 4 », « −1/4 ». */
const ft = (p) => LIN.fracText(p).replace('-', '−');

/**
 * Les PASTILLES d'un rapport (lecteur, manches 2+ : « les rapports sont calculés AVANT le verdict de la bulle ») : la bonne valeur, l'inverse
 * (la partie en bas), et — échelle — la partie sur le RESTE (AB′/BB′) ; tréteau : la longueur de l'AUTRE barre (AB′/AC) — la pastille AB′/BB′
 * n'a plus de sens quand B′ passe au-delà de A (conseil, L2.1). Toujours trois valeurs distinctes ; l'ordre tourne avec la position.
 */
export function chipOptions(lab, end, at = positions(lab)) {
  const signed = end === 'B' ? at.bp : at.cp;
  const a = Math.abs(signed);
  const n = end === 'B' ? lab.b : lab.c;
  const other = end === 'B' ? lab.c : lab.b;
  const right = LIN.frac(a, n);
  const cands = [{ v: LIN.frac(n, a), why: 'inverse' }];
  if (lab.mode === 'ladder') cands.push({ v: LIN.frac(a, n - a), why: 'rest' });
  else cands.push({ v: LIN.frac(a, other), why: 'other' });
  for (let d = 1; d < 6; d += 1) cands.push({ v: LIN.frac(a + d, n), why: 'near' }, { v: LIN.frac(a, n + d), why: 'near' });
  const out = [{ v: right, right: true }];
  for (const c of cands) {
    if (out.length >= 3) break;
    if (!out.some((o) => LIN.eq(o.v, c.v))) out.push(c);
  }
  const shift = (a * 7 + n + (end === 'B' ? 0 : 1)) % 3;
  const spun = out.map((_, i) => out[(i + shift) % 3]);
  return spun.map((o) => Object.freeze({ text: ft(o.v), right: Boolean(o.right), why: o.why ?? null }));
}

/**
 * Le GUIDE (LabCoach) du lecteur — jamais la réponse : la poignée de B′, puis celle de C′, puis (manches 2+) les pastilles, puis « ضع الميزان » ;
 * après deux essais sans planche de niveau, le journal (ou la ligne des rapports quand elle est montrée). Rien quand la découverte est atteinte.
 * `ctx` : { moved: { B, C }, pressedHere, picksDone, picking, ratiosShown, done }.
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  const moved = ctx.moved ?? {};
  const anyLevel = lab.trials.some((t) => t.parallel && t.kind !== 'condition');
  if (lab.trials.length >= 2 && !anyLevel) {
    return ctx.ratiosShown
      ? { id: 'ratios', target: '[data-pl-ratios]', gesture: 'tap' }
      : { id: 'journal', target: '[data-pl-journal]', gesture: 'tap' };
  }
  if (!moved.B && lab.trials.length === 0) return { id: 'dragB', target: '[data-pl-handle="B"]', gesture: 'drag' };
  if (!moved.C && lab.trials.length === 0) return { id: 'dragC', target: '[data-pl-handle="C"]', gesture: 'drag' };
  if (ctx.pressedHere) return null;
  if (ctx.picking && !ctx.picksDone) return { id: 'pick', target: '[data-pl-picks]', gesture: 'tap', prefer: 'below' };
  return { id: 'press', target: '[data-pl-press]', gesture: 'tap' };
}

/**
 * TOUT ce qu'un écran du lecteur peut montrer pour une manche (règle « valeurs interdites par RÔLE », conseil du 2026-11-10) : les longueurs
 * des barres, les distances de chaque encoche à A et au pied, chaque rapport atteignable par le glisser (brut et réduit), les pastilles et
 * leurs leurres à chaque position, le rapport imposé, les positions des prédictions. `{ role, v }`, v en texte (« 1/3 », « 12 »).
 */
export function shownValues(props) {
  const lab = init({ AB: props.AB, AC: props.AC, ratio: props.ratio, mode: props.mode });
  const out = [];
  const push = (role, v) => out.push(Object.freeze({ role, v: String(v).replace('−', '-') }));
  push('bar', lab.b); push('bar', lab.c);
  if (lab.target) push('ratio', LIN.fracText(lab.target));
  const slots = (r) => Array.from({ length: r.max - r.min + 1 }, (_, i) => abscissaOf(r.min + i));
  for (const [end, n, r] of [['B', lab.b, lab.rangeB], ['C', lab.c, lab.rangeC]]) {
    for (const a of slots(r)) {
      push('distance', Math.abs(a));
      if (lab.mode === 'ladder') push('distance', n - a);   // BB′ : la pastille « partie sur reste » de l'échelle (le tréteau ne la montre jamais)
      push('ratio', `${Math.abs(a)}/${n}`);
      push('ratio', LIN.fracText(LIN.frac(Math.abs(a), n)));
      const at = end === 'B' ? { bp: a, cp: lab.c } : { bp: lab.b, cp: a };
      chipOptions(lab, end, at).forEach((o) => push(o.right ? 'ratio' : 'decoy', o.text));
      push('decoy', `-${LIN.fracText(LIN.frac(Math.abs(a), n))}`);   // la pastille « −r » d'une question au-delà de A
    }
  }
  (props.predict ?? []).forEach((p) => { push('distance', Math.abs(p.at[0])); push('distance', Math.abs(p.at[1])); });
  (props.choices ?? []).forEach(([b, c]) => shownValues({ AB: b, AC: c, mode: props.mode }).forEach((x) => out.push(x)));
  return out;
}
