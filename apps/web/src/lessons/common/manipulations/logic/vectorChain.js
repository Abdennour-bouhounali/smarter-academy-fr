/**
 * vector-chain — la logique PURE des « correspondances du métro » (unité 11 « الأشعة والانسحاب », درس « حل مشكلات
 * وإنجاز براهين بتوظيف الأشعة والانسحاب »). Aucun React ici, aucune arithmétique propre : chaque verdict vient de
 * `packages/core/arithmetic/vectors.js` — `simplifyNamed` (علاقة شال, opposés, vecteur nul), `isChain`, `vec`,
 * `translate`, `vecEq` sur des points EXACTS (fractions). Les coordonnées ne servent qu'à juger ; le dessin est ailleurs.
 *
 * MODE `reduce` (le cœur) — une MISSION est une somme de vecteurs nommés (des « tickets » : $\overrightarrow{AB}$ …)
 * qu'on réduit à un seul vecteur (et, en متقدم, au vecteur DEMANDÉ : on PROUVE $\overrightarrow{HK} = \overrightarrow{AC}$).
 * Trois gestes, et rien d'autre :
 *   • ACCROCHER un ticket au « train » (la somme déjà réduite), après sa queue ou devant sa tête : accepté
 *     SEULEMENT si les wagons se suivent (fin = début, `isChain`) ; les deux fusionnent alors en un seul
 *     (`simplifyNamed`) — $\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC}$, et deux opposés donnent $\overrightarrow{0}$.
 *     Le refus nomme les deux stations qui ne se raccordent pas (MISC-SHUAA-SHAL-RABT).
 *   • TRANSPORTER un ticket (ou le train) sur une autre station U : c'est la translation — le représentant de
 *     $\overrightarrow{XY}$ qui part de U arrive en U + XY. S'il arrive sur une station V, le ticket devient
 *     $\overrightarrow{UV}$ … à condition que l'égalité XY = UV soit DONNÉE (hypothèses : متوازي أضلاع, منتصف, تعريف d'un
 *     point, et leurs conséquences par renversement et par transitivité). Une égalité VRAIE sur la figure mais non
 *     donnée est REFUSÉE : « الشكل لا يبرهن » — c'est la leçon (on ne démontre pas ce qu'on lit sur le dessin).
 *     Un représentant qui n'arrive sur aucune station est refusé en le montrant (« لا ينتهي عند محطة »), et si
 *     l'élève visait l'opposé (UW = −XY), le refus le dit avec les mots du manuel (même منحى, même طول, اتجاه معاكس).
 *   • REVENIR (تراجع) d'un geste.
 * Chaque geste accepté écrit une LIGNE de la preuve (« = … لأن … ») : la chaîne d'égalités est la rédaction du
 * برهان, produite par la main de l'élève.
 *
 * MODE `construct` (دوري الآن ص 138) — CONSTRUIRE le centre de l'image d'un cercle par la translation de vecteur
 * $\overrightarrow{AB} + \overrightarrow{AC}$ : le premier représentant part d'une station au choix, chaque suivant
 * part EXACTEMENT de la pointe du précédent (sinon refus : Chasles demande la queue sur la pointe) ; la résultante
 * part de l'origine choisie. Si l'origine est le centre E, la pointe EST E₁ ; sinon la résultante se transporte
 * sur E (translation) — les deux méthodes du manuel (chaîne depuis E, ou parallélogramme puis translation).
 *
 *   const s = init(LEVELS['vector-chain'].advanced.numbers);
 *   translateCard(s, 'm1c0', 'O')     → HB devient OA (« لأن BH = AO »)
 *   couple(…, 'm1c3', 'tail') …       → la preuve HK = … = AC
 */
import * as V from '@smarter-academy/core/arithmetic/vectors.js';

const MODES = Object.freeze(['reduce', 'construct']);

/* ── noms ─────────────────────────────────────────────────────────────────── */

/** Les deux stations d'un vecteur nommé : 'AB' → ['A', 'B']. */
export function ends(name) {
  const pts = String(name).match(/[A-Z][′'0-9]*/g);
  if (!pts || pts.length !== 2) throw new Error(`vector-chain : vecteur illisible « ${name} »`);
  return pts;
}
export const reverse = (name) => { const [a, b] = ends(name); return `${b}${a}`; };
/** L'écriture KaTeX d'un vecteur nommé ('0' = le vecteur nul). */
export const vecTex = (name) => (name === '0' ? '\\overrightarrow{0}' : `\\overrightarrow{${name}}`);
/** Une somme de vecteurs nommés, en KaTeX. */
export const sumTex = (names) => (names.length ? names.map(vecTex).join(' + ') : '\\overrightarrow{0}');

const exactStations = (raw) => Object.fromEntries(Object.entries(raw).map(([k, [x, y]]) => [k, V.point(x, y)]));
const vecOf = (lab, name) => { const [a, b] = ends(name); return V.vec(lab.stations[a], lab.stations[b]); };
/** La station située exactement en P, ou null. */
export function stationAt(lab, P) {
  for (const [k, Q] of Object.entries(lab.stations)) if (V.vecEq(P, Q)) return k;
  return null;
}

/* ── les données (المعطيات) ───────────────────────────────────────────────── */

/**
 * Une donnée de la figure, normalisée : { kind, eqs: [[a, b], …], label } —
 *   { eq: ['BH', 'AO'] }       une égalité donnée (définition d'un point)
 *   { para: 'ABCD' }           ABCD متوازي أضلاع : AB = DC et AD = BC
 *   { mid: ['O', 'A', 'C'] }   O منتصف [AC] : AO = OC
 *   { sym: ['D', 'B', 'O'] }   D نظيرة B بالنسبة إلى O : BO = OD
 *   { def: 'CK', sum: [...] }  une définition par une SOMME : affichée, jamais utilisée pour un échange
 */
function normalizeGiven(g) {
  if (g.eq) return { kind: 'eq', eqs: [g.eq], a: g.eq[0], b: g.eq[1] };
  if (g.para) {
    const [P, Q, R, S] = g.para.match(/[A-Z]/g);
    return { kind: 'para', eqs: [[`${P}${Q}`, `${S}${R}`], [`${P}${S}`, `${Q}${R}`]], name: g.para };
  }
  if (g.mid) {
    const [I, A, B] = g.mid;
    return { kind: 'mid', eqs: [[`${A}${I}`, `${I}${B}`]], point: I, seg: `${A}${B}` };
  }
  if (g.sym) {
    const [Pp, P, I] = g.sym;     // P′ نظيرة P بالنسبة إلى I : I منتصف [PP′]
    return { kind: 'sym', eqs: [[`${P}${I}`, `${I}${Pp}`]], image: Pp, point: P, centre: I };
  }
  if (g.def) return { kind: 'def', eqs: [], a: g.def, sum: g.sum };
  throw new Error('vector-chain : donnée inconnue');
}

/** Le graphe des égalités données (chaque égalité et son renversement), arêtes étiquetées par la donnée. */
function buildGraph(givens) {
  const graph = new Map();
  const add = (a, b, gi) => { if (!graph.has(a)) graph.set(a, []); graph.get(a).push({ to: b, gi }); };
  givens.forEach((g, gi) => g.eqs.forEach(([a, b]) => {
    add(a, b, gi); add(b, a, gi);
    add(reverse(a), reverse(b), gi); add(reverse(b), reverse(a), gi);
  }));
  return graph;
}

/**
 * L'égalité a = b est-elle DONNÉE (directement, renversée, ou par transitivité) ? Rend la liste des indices de
 * données utilisées (chemin le plus court), [] si a = b, null sinon.
 */
export function justify(lab, a, b) {
  if (a === b) return [];
  const prev = new Map([[a, null]]);
  const queue = [a];
  while (queue.length) {
    const cur = queue.shift();
    for (const { to, gi } of lab.graph.get(cur) ?? []) {
      if (prev.has(to)) continue;
      prev.set(to, { from: cur, gi });
      if (to === b) {
        const used = [];
        for (let n = b; prev.get(n); n = prev.get(n).from) used.unshift(prev.get(n).gi);
        return [...new Set(used)];
      }
      queue.push(to);
    }
  }
  return null;
}

/* ── initialisation ───────────────────────────────────────────────────────── */

export function init(numbers) {
  const mode = numbers.mode ?? 'reduce';
  if (!MODES.includes(mode)) throw new Error(`vector-chain : mode inconnu ${mode}`);
  const base = {
    mode,
    stations: exactStations(numbers.stations),
    coords: numbers.stations,
    segments: numbers.segments ?? [],
    trials: [],
    last: null,
  };
  return mode === 'construct' ? initConstruct(base, numbers) : initReduce(base, numbers);
}

function initReduce(base, numbers) {
  const givens = (numbers.givens ?? []).map(normalizeGiven);
  const lab = { ...base, givens, missions: numbers.missions.map((m) => ({ ...m })), m: 0 };
  lab.graph = buildGraph(givens);
  // Une donnée doit être VRAIE sur la figure : sinon le laboratoire accepterait un échange faux.
  givens.forEach((g) => g.eqs.forEach(([a, b]) => {
    if (!V.vecEq(vecOf(lab, a), vecOf(lab, b))) throw new Error(`vector-chain : la donnée ${a} = ${b} est fausse sur la figure`);
  }));
  lab.ms = lab.missions.map((mission, mi) => missionStart(mission, mi));
  lab.done = lab.missions.map(() => false);
  return lab;
}

function missionStart(mission, mi) {
  const lines = [];
  if (mission.lhs && mission.pre) {
    lines.push({ lhs: mission.lhs, names: mission.pre, reason: { kind: 'insert' } });
    lines.push({ names: mission.start, reason: { kind: 'def' } });
  } else if (mission.lhs) {
    lines.push({ lhs: mission.lhs, names: mission.start, reason: { kind: 'insert' } });
  } else {
    lines.push({ names: mission.start, reason: null });
  }
  return {
    tray: mission.start.map((name, i) => ({ id: `m${mi}c${i}`, name })),
    train: null,
    lines,
    undo: [],
  };
}

/* ── lecture de l'état d'une mission ──────────────────────────────────────── */

export const current = (lab) => lab.ms[lab.m];
/** L'expression courante : le train (s'il existe), puis les tickets restants, dans leur ordre. */
export function expression(ms) {
  return [...(ms.train != null ? [ms.train] : []), ...ms.tray.map((c) => c.name)];
}
/** La valeur EXACTE de l'expression (invariant de chaque geste accepté). */
export function value(lab, names) {
  return names.filter((n) => n !== '0').reduce((acc, n) => V.vecAdd(acc, vecOf(lab, n)), V.point(0, 0));
}
/** La mission est-elle atteinte ? tickets épuisés, un seul vecteur, et (متقدم) le vecteur demandé. */
export function status(lab, mi = lab.m) {
  const ms = lab.ms[mi]; const ok = lab.missions[mi];
  if (ms.tray.length > 0 || ms.train == null) return 'open';
  if (ok.target && ms.train !== ok.target) return 'offTarget';
  return 'complete';
}
export const allDone = (lab) => lab.mode === 'reduce' ? lab.done.every(Boolean) : lab.builds.every((b) => b.found);
export const discoveryReady = (lab) => allDone(lab);

/* ── geste 1 : accrocher un ticket au train ───────────────────────────────── */

const cardOf = (ms, id) => ms.tray.find((c) => c.id === id) ?? null;

/** true | 'chainTail' | 'chainHead' | '' (rien à faire). */
export function canCouple(lab, cardId, end) {
  if (lab.mode !== 'reduce') return '';
  const ms = current(lab); const card = cardOf(ms, cardId);
  if (!card) return '';
  if (ms.train == null || ms.train === '0') return true;
  const first = end === 'tail' ? ms.train : card.name;
  const second = end === 'tail' ? card.name : ms.train;
  return V.isChain([first, second]) ? true : (end === 'tail' ? 'chainTail' : 'chainHead');
}

/** Les deux stations qui ne se raccordent pas (pour le refus). */
function chainGap(lab, cardId, end) {
  const ms = current(lab); const card = cardOf(ms, cardId);
  const [ts, te] = ends(ms.train); const [cs, ce] = ends(card.name);
  return end === 'tail' ? { arrive: te, depart: cs } : { arrive: ce, depart: ts };
}

const snapshot = (ms) => ({ tray: ms.tray, train: ms.train, lines: ms.lines });
const withMission = (lab, ms) => {
  const msList = lab.ms.map((x, i) => (i === lab.m ? ms : x));
  const next = { ...lab, ms: msList };
  const done = next.done.map((d, i) => (i === lab.m ? d || status(next, i) === 'complete' : d));
  return { ...next, done };
};
const record = (lab, trial) => ({ ...lab, trials: [...lab.trials, { mission: lab.m, ...trial }] });

export function couple(lab, cardId, end) {
  const verdict = canCouple(lab, cardId, end);
  const ms = current(lab); const card = cardOf(ms, cardId);
  if (verdict === '') return lab;
  if (verdict !== true) {
    const gap = chainGap(lab, cardId, end);
    const t = { mission: lab.m, kind: 'couple', card: card.name, train: ms.train, end, ok: false, reason: verdict, ...gap };
    return { ...record(lab, t), last: t };
  }
  const before = ms.train;
  let after; let kind;
  if (before == null) { after = card.name; kind = 'board'; }
  else if (before === '0') { after = card.name; kind = 'zero'; }
  else {
    const terms = end === 'tail' ? [before, card.name] : [card.name, before];
    after = V.simplifyNamed(terms);
    kind = after === '0' ? 'opposite' : 'shal';
  }
  const terms = before == null ? [card.name] : before === '0' ? ['0', card.name] : (end === 'tail' ? [before, card.name] : [card.name, before]);
  const tray = ms.tray.filter((c) => c.id !== cardId);
  const nextMs = { tray, train: after, undo: [...ms.undo, snapshot(ms)], lines: ms.lines };
  if (kind !== 'board') nextMs.lines = [...ms.lines, { names: expression(nextMs), reason: { kind, terms, result: after } }];
  const t = { mission: lab.m, kind: 'couple', card: card.name, train: before, end, ok: true, reason: kind, result: after, terms };
  const next = withMission(record(lab, t), nextMs);
  return { ...next, last: { ...t, status: status(next) } };
}

/* ── geste 2 : transporter un ticket (translation) ────────────────────────── */

/** La pointe du représentant de `name` qui part de la station U (point exact). */
export const landing = (lab, name, U) => V.translate(lab.stations[U], vecOf(lab, name));

/**
 * Ce que donnerait le transport du ticket `name` sur la station U :
 *   { kind: 'same' }                         U est déjà son origine (geste sans effet)
 *   { kind: 'swap', to, via }                arrive en V, et XY = UV est DONNÉE (via = indices des données)
 *   { kind: 'notGiven', to }                 arrive en V, égalité VRAIE sur la figure mais non donnée
 *   { kind: 'nowhere', opposite }            n'arrive sur aucune station ; `opposite` = W si UW = −XY existe
 */
export function probe(lab, name, U) {
  const [X] = ends(name);
  if (U === X) return { kind: 'same' };
  const P = landing(lab, name, U);
  const Vn = stationAt(lab, P);
  if (Vn && Vn !== U) {
    const to = `${U}${Vn}`;
    const via = justify(lab, name, to);
    return via ? { kind: 'swap', to, via } : { kind: 'notGiven', to };
  }
  const W = stationAt(lab, V.translate(lab.stations[U], V.vecNeg(vecOf(lab, name))));
  return { kind: 'nowhere', opposite: W && W !== U ? `${U}${W}` : null, landing: V.coords(P) };
}

/** `who` = l'id d'un ticket, ou 'train'. */
export function translateCard(lab, who, U) {
  if (lab.mode !== 'reduce') return lab;
  const ms = current(lab);
  const isTrain = who === 'train';
  const card = isTrain ? null : cardOf(ms, who);
  const name = isTrain ? ms.train : card?.name;
  if (!name || name === '0') return lab;
  const p = probe(lab, name, U);
  if (p.kind === 'same') return lab;
  if (p.kind !== 'swap') {
    const t = { mission: lab.m, kind: 'swap', card: name, station: U, ok: false, reason: p.kind, to: p.to ?? null, opposite: p.opposite ?? null, landing: p.landing ?? null };
    return { ...record(lab, t), last: t };
  }
  const tray = isTrain ? ms.tray : ms.tray.map((c) => (c.id === who ? { ...c, name: p.to } : c));
  const train = isTrain ? p.to : ms.train;
  const nextMs = { tray, train, undo: [...ms.undo, snapshot(ms)], lines: ms.lines };
  nextMs.lines = [...ms.lines, { names: expression(nextMs), reason: { kind: 'swap', from: name, to: p.to, via: p.via } }];
  const t = { mission: lab.m, kind: 'swap', card: name, station: U, ok: true, reason: 'swap', to: p.to, via: p.via };
  const next = withMission(record(lab, t), nextMs);
  return { ...next, last: { ...t, status: status(next) } };
}

/* ── geste 3 : revenir, changer de mission ────────────────────────────────── */

export function undo(lab) {
  if (lab.mode === 'construct') return undoConstruct(lab);
  const ms = current(lab);
  if (!ms.undo.length) return lab;
  const prev = ms.undo[ms.undo.length - 1];
  const nextMs = { ...prev, undo: ms.undo.slice(0, -1) };
  return { ...lab, ms: lab.ms.map((x, i) => (i === lab.m ? nextMs : x)), last: { kind: 'undo' } };
}
export const canUndo = (lab) => (lab.mode === 'reduce' ? current(lab).undo.length > 0 : currentBuild(lab).undo.length > 0);

/** Aller à la mission (ou construction) i : chaque mission garde son état (aller-retour sans perte). */
export function goTo(lab, i) {
  const n = lab.mode === 'reduce' ? lab.missions.length : lab.builds.length;
  if (i < 0 || i >= n) return lab;
  return lab.mode === 'reduce' ? { ...lab, m: i, last: null } : { ...lab, b: i, last: null };
}

/** « أعِد التجربة » : remet LA MÊME mission (ou construction) au départ ; les autres gardent leur état. */
export function restartStep(lab) {
  if (lab.mode === 'construct') {
    const bs = currentBuild(lab);
    const fresh = { ...bs, tray: bs.terms.map((name, i) => ({ id: `b${lab.b}c${i}`, name })), chain: [], origin: null, sum: null, found: null, undo: [] };
    return { ...buildOf(lab, fresh), last: null };
  }
  const ms = missionStart(lab.missions[lab.m], lab.m);
  return { ...lab, ms: lab.ms.map((x, i) => (i === lab.m ? ms : x)), done: lab.done.map((d, i) => (i === lab.m ? false : d)), last: null };
}

/* ── les preuves ──────────────────────────────────────────────────────────── */

/** Les lignes de la preuve d'une mission, en KaTeX ('= …' à partir de la deuxième). */
export function proofLines(lab, mi = lab.m) {
  return lab.ms[mi].lines.map((l, i) => ({
    tex: `${l.lhs ? `${vecTex(l.lhs)} = ` : i > 0 ? '= ' : ''}${sumTex(l.names)}`,
    reason: l.reason,
  }));
}
/** La chaîne complète d'une mission terminée : « HK = HB + BC + CK = … = AC » (une seule île KaTeX). */
export function proofChain(lab, mi = lab.m) {
  return proofLines(lab, mi).map((l) => l.tex).join(' ');
}

/** La donnée lisible d'un indice (pour les raisons) — les mots sont dans lesson.json. */
export const givenOf = (lab, gi) => lab.givens[gi];

/* ── MODE construct ───────────────────────────────────────────────────────── */

function initConstruct(base, numbers) {
  const builds = numbers.builds.map((b, bi) => ({
    ...b,
    tray: b.terms.map((name, i) => ({ id: `b${bi}c${i}`, name })),
    chain: [],
    origin: null,
    sum: null,
    found: null,
    undo: [],
  }));
  return { ...base, radius: numbers.radius ?? 2, builds, b: 0 };
}
export const currentBuild = (lab) => lab.builds[lab.b];
const P2 = (P) => V.coords(P);
/** La pointe courante de la chaîne (point exact), ou null. */
export const tip = (bs) => (bs.chain.length ? bs.chain[bs.chain.length - 1].to : null);

const buildOf = (lab, bs) => ({ ...lab, builds: lab.builds.map((x, i) => (i === lab.b ? bs : x)) });
const zonePoint = (lab, zone) => {
  if (zone === 'tip') return tip(currentBuild(lab));
  if (zone.startsWith('st:')) return lab.stations[zone.slice(3)];
  return null;
};
const bsSnap = (bs) => ({ tray: bs.tray, chain: bs.chain, origin: bs.origin, sum: bs.sum, found: bs.found });

/** Poser un ticket : true | 'notTip' | 'ownStart' | 'carryFirst' | ''. */
export function canPlace(lab, cardId, zone) {
  if (lab.mode !== 'construct') return '';
  const bs = currentBuild(lab);
  if (bs.found) return '';
  if (cardId === 'sum') return canCarry(lab, zone);
  const card = bs.tray.find((c) => c.id === cardId);
  if (!card) return '';
  const P = zonePoint(lab, zone);
  if (!P) return '';
  if (!bs.chain.length) return zone.startsWith('st:') ? true : '';
  if (V.vecEq(P, tip(bs))) return true;
  const [X] = ends(card.name);
  return zone === `st:${X}` ? 'ownStart' : 'notTip';
}

function canCarry(lab, zone) {
  const bs = currentBuild(lab);
  if (!bs.sum || !zone.startsWith('st:')) return '';
  const U = zone.slice(3);
  if (U === bs.origin) return '';
  return U === bs.centre ? true : 'notCentre';
}

export function place(lab, cardId, zone) {
  const verdict = canPlace(lab, cardId, zone);
  if (verdict === '') return lab;
  const bs = currentBuild(lab);
  if (cardId === 'sum') return carry(lab, zone, verdict);
  const card = bs.tray.find((c) => c.id === cardId);
  if (verdict !== true) {
    const t = { kind: 'place', build: lab.b, card: card.name, zone, ok: false, reason: verdict };
    return { ...record(lab, t), last: t };
  }
  const from = bs.chain.length ? tip(bs) : zonePoint(lab, zone);
  const to = V.translate(from, vecOf(lab, card.name));
  const origin = bs.chain.length ? bs.origin : zone.slice(3);
  const chain = [...bs.chain, { name: card.name, from, to }];
  const tray = bs.tray.filter((c) => c.id !== cardId);
  let next = { ...bs, tray, chain, origin, undo: [...bs.undo, bsSnap(bs)] };
  if (!tray.length) {
    const o = lab.stations[origin];
    if (origin === bs.centre) next = { ...next, found: to };
    else next = { ...next, sum: { from: o, to } };
  }
  const t = { kind: 'place', build: lab.b, card: card.name, zone, ok: true, from: P2(from), to: P2(to), found: next.found ? P2(next.found) : null };
  return { ...buildOf(record(lab, t), next), last: t };
}

function carry(lab, zone, verdict) {
  const bs = currentBuild(lab);
  if (verdict !== true) {
    const t = { kind: 'carry', build: lab.b, zone, ok: false, reason: verdict };
    return { ...record(lab, t), last: t };
  }
  const C = lab.stations[bs.centre];
  const found = V.translate(C, V.vec(bs.sum.from, bs.sum.to));
  const next = { ...bs, found, undo: [...bs.undo, bsSnap(bs)] };
  const t = { kind: 'carry', build: lab.b, zone, ok: true, found: P2(found) };
  return { ...buildOf(record(lab, t), next), last: t };
}

function undoConstruct(lab) {
  const bs = currentBuild(lab);
  if (!bs.undo.length) return lab;
  const prev = bs.undo[bs.undo.length - 1];
  return { ...buildOf(lab, { ...bs, ...prev, undo: bs.undo.slice(0, -1) }), last: { kind: 'undo' } };
}

/** Le vecteur somme d'une construction, exact (pour la lecture « EE₁ = AB + AC »). */
const buildSum = (lab, bi = lab.b) => value(lab, lab.builds[bi].terms);

/* ── la carte : cadre et échelle (purs, testés) ───────────────────────────── */

/** Le cadre de la carte en unités de la figure : toutes les stations, et en construction toutes les pointes atteignables. */
export function frame(lab) {
  const pts = Object.values(lab.coords).map(([x, y]) => [x, y]);
  if (lab.mode === 'construct') {
    const r = lab.radius;
    for (const bld of lab.builds) {
      const vs = bld.terms.map((n) => P2(vecOf(lab, n)));
      for (const S of Object.values(lab.coords)) {
        for (const order of permutations(vs)) {
          let p = [...S];
          for (const v of order) { p = [p[0] + v[0], p[1] + v[1]]; pts.push(p); }
        }
      }
      const C = lab.coords[bld.centre];
      const s = P2(buildSum(lab, lab.builds.indexOf(bld)));
      for (const c of [C, [C[0] + s[0], C[1] + s[1]]]) pts.push([c[0] - r, c[1] - r], [c[0] + r, c[1] + r]);
    }
  }
  const xs = pts.map((p) => p[0]); const ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
function permutations(a) {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}

/**
 * La mise à l'échelle de la carte : le cadre (± `margin` unités) dans width × height px, y vers le HAUT, sans
 * déformation (une unité = `unit` px sur les deux axes). Rend { unit, to([x, y]) → [px, py], width, height }.
 */
export function mapScale(fr, { width, height, margin = 0.9 }) {
  const w = fr.maxX - fr.minX + 2 * margin; const h = fr.maxY - fr.minY + 2 * margin;
  const unit = Math.max(4, Math.min(width / w, height / h));
  const ox = (width - w * unit) / 2; const oy = (height - h * unit) / 2;
  const to = ([x, y]) => [ox + (x - fr.minX + margin) * unit, oy + (fr.maxY + margin - y) * unit];
  return { unit, to, width, height };
}
/** La hauteur naturelle de la carte pour une largeur donnée (le rapport du cadre), bornée. */
export function naturalHeight(fr, width, margin = 0.9) {
  const w = fr.maxX - fr.minX + 2 * margin; const h = fr.maxY - fr.minY + 2 * margin;
  return Math.round(width * (h / w));
}

/** L'essai lisible par la leçon (`onTrial`) : ce que l'élève a tenté et ce que la mathématique a répondu. */
export function evidenceOf(lab) {
  const t = lab.trials[lab.trials.length - 1];
  return t ? { mode: lab.mode, ...t } : null;
}
