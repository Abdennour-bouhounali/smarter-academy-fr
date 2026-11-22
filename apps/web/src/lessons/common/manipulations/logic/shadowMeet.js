/**
 * shadow-meet — LA LOGIQUE PURE du labo « الظلّان يلتقيان » (unité 9 « خاصية طالس », leçon 1 `talis-hisab-atwal` dans le LECTEUR DE MISSION ;
 * conseil du 2026-11-10, verdict L1.1 = C : un labo NEUF à UN couloir, bâti sur les fonctions pures de `shadowWorld.js` — le monde
 * `shadow-world` de la page et de l'enseignant n'est pas touché).
 *
 * UN COULOIR, vu de côté : un objet vertical de hauteur H (INCONNUE de l'élève) au pied A, le soleil à une heure FIXÉE par la manche, et un
 * bâton de 1 m que l'élève fait glisser sur le sol. Toutes les longueurs sont des ENTIERS en centimètres (jamais un flottant ne décide) :
 *   OA = H × k (l'ombre de l'objet, k = K25 ÷ 25 de `shadowWorld.js`),  OB = 100 × k (l'ombre du bâton),
 *   la RENCONTRE : le pied B du bâton à BA = OA − OB — alors les deux ombres finissent au même point O, un seul rayon passe par les deux
 *   sommets, et OB / OA = BE / AM (Thalès).
 * Avant la rencontre le bâton est À L'OMBRE de l'objet (son sommet sous le rayon : pas d'ombre à lui) ; après, il est AU SOLEIL et son ombre
 * dépasse O. La physique est vraie : c'est elle, et non un texte, qui dit où est la rencontre.
 *
 * Une manche est une suite d'ÉTAPES (`steps`), chacune { object, height, hour, task, ask } :
 *   task 'meet'  — glisser le bâton jusqu'à la rencontre (la rencontre EST le verdict), puis la hauteur est demandée (`ask`) ;
 *   task 'ratio' — l'ombre de l'objet est DONNÉE (mesurée) : la hauteur se calcule par le rapport, sans rencontre ;
 *   task 'flag'  — la hauteur est CONNUE (un poteau qu'on va planter) : écrire où finira son ombre, puis planter le drapeau.
 *   ask : null (rien n'est demandé : la rencontre suffit) | { kind: 'tap', decoys: [...] } (trois pastilles) | { kind: 'type', symbol } (un modèle
 *   de réponse « H = [ ] m », `TemplateInput`).
 * Un ESSAI est une RÉPONSE (une hauteur, un drapeau) — jamais un mouvement du bâton ; la même réponse deux fois n'est pas un nouvel essai.
 *
 * RÉEMPLOI (la synthèse de l'unité jouera ce labo avec SA manche — un autre objet, d'autres hauteurs, une autre heure) : rien d'une leçon n'est
 * écrit ici. Une manche nouvelle a besoin de `steps` (ou du raccourci object / height / hour / task / ask) ; `shownValues(props)` liste tout ce
 * que ses écrans peuvent montrer (balayage des valeurs interdites) ; `meetOf`, `heightOptions`, `ratioText` donnent ses nombres.
 */
import { HOURS, shadowAt, m, parseHundredths } from './shadowWorld.js';

export { HOURS, m };
/** Le bâton : 1 m. */
export const STICK = 100;
/** Le pied du bâton ne colle jamais à l'objet, et peut dépasser le bout de son ombre de cette marge (cm). */
const STICK_MIN = 20;
const STICK_PAST = 40;
const TASKS = Object.freeze(['meet', 'ratio', 'flag']);
const fz = Object.freeze;

/** « 14:00 » (ou un indice) → l'indice de la demi-heure dans HOURS ; une heure inconnue est une erreur de contenu. */
export function hourIndex(h) {
  const i = typeof h === 'number' ? h : HOURS.indexOf(String(h));
  if (!Number.isInteger(i) || i < 0 || i >= HOURS.length) throw new Error(`shadowMeet: heure inconnue ${JSON.stringify(h)}`);
  return i;
}

/** Une hauteur écrite (« 2,75 », 2.75) → des centimètres entiers. */
export function heightCm(h) {
  const v = typeof h === 'number' ? Math.round(h * 100) : parseHundredths(h);
  if (v == null) throw new Error(`shadowMeet: hauteur illisible ${JSON.stringify(h)}`);
  return v;
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Ce qui est demandé à une étape, normalisé : null | { kind: 'tap' | 'type', decoys, symbol }. */
function askOf(raw, task) {
  if (task === 'flag') return fz({ kind: 'type', symbol: raw?.symbol ?? 'AO', decoys: fz([]) });
  if (raw == null) {
    if (task === 'ratio') throw new Error('shadowMeet: une étape « ratio » demande une hauteur (ask)');
    return null;
  }
  const o = typeof raw === 'string' ? { kind: raw } : raw;
  if (o.kind !== 'tap' && o.kind !== 'type') throw new Error(`shadowMeet: ask inconnu ${JSON.stringify(raw)}`);
  return fz({ kind: o.kind, symbol: o.symbol ?? 'H', decoys: fz([...(o.decoys ?? ['segment', 'additive'])]) });
}

/** Une étape normalisée : { id, object, name, H, hour, task, ask, OA, OB, meetX, min, max }. Toutes les longueurs en cm entiers. */
export function stepOf(raw, i = 0) {
  const task = raw.task ?? 'meet';
  if (!TASKS.includes(task)) throw new Error(`shadowMeet: tâche inconnue ${task}`);
  const H = heightCm(raw.height);
  // un multiple de 25 cm : toute ombre est alors un nombre entier de cm (k = n ÷ 25) ; plus haut que le bâton : la rencontre existe
  if (H % 25 !== 0 || H <= STICK || H > 1500) throw new Error(`shadowMeet: hauteur = multiple de 0,25 m entre 1,25 m et 15 m (reçu ${raw.height})`);
  const hour = hourIndex(raw.hour ?? '14:00');
  const OA = shadowAt(H, hour);
  const OB = shadowAt(STICK, hour);
  return fz({
    id: raw.id ?? `s${i}`, object: raw.object ?? 'tower', name: raw.objectName ?? null, H, hour, task, ask: askOf(raw.ask, task),
    OA, OB, meetX: OA - OB, min: STICK_MIN, max: OA + STICK_PAST,
  });
}

/** Les étapes d'un jeu de props : `steps`, ou le raccourci { object, objectName, height, hour, task, ask } (une étape). */
export function stepsOf(props = {}) {
  const list = Array.isArray(props.steps) && props.steps.length
    ? props.steps
    : [{ object: props.object, objectName: props.objectName, height: props.height ?? '2,75', hour: props.hour ?? '14:00', task: props.task, ask: props.ask }];
  return fz(list.map(stepOf));
}

/** La rencontre d'une étape, en clair : { OA, OB, BA } (cm). */
export const meetOf = (step) => fz({ OA: step.OA, OB: step.OB, BA: step.meetX });

/** Le rapport OB ÷ OA d'une étape, réduit : « 2/13 » (= 1 ÷ H quand le bâton mesure 1 m — il ne dépend PAS de l'heure). */
export function ratioText(step) {
  const g = gcd(STICK, step.H);
  return `${STICK / g}/${step.H / g}`;
}

/**
 * Le DÉPART du bâton : jamais à la rencontre, et loin d'elle — au SOLEIL, au-delà du bout de l'ombre de l'objet (les deux ombres se voient
 * côte à côte, l'élève rapproche l'une de l'autre).
 */
function startX(step) {
  // drapeau : le bâton reste planté À GAUCHE du poteau (son ombre finit avant A) — sa place ne dit rien de l'endroit où finira l'ombre du poteau
  if (step.task === 'flag') return -(step.OB + 60);
  return Math.min(step.max, step.OA + 30);
}

/** Borner une position du bâton à la piste d'une étape. */
const clampX = (step, x) => Math.max(step.min, Math.min(step.max, Math.round(x)));

/** L'état initial d'une manche. */
export function init(props = {}) {
  const steps = stepsOf(props);
  return fz({
    steps,
    at: 0,
    stickX: startX(steps[0]),
    met: fz(steps.map(() => false)),
    solved: fz(steps.map(() => false)),
    wrong: fz(steps.map(() => fz([]))),
    flag: null,
    last: null,
  });
}

export const cur = (lab) => lab.steps[lab.at];
export const isMet = (lab, i = lab.at) => Boolean(lab.met[i]);
export const isSolved = (lab, i = lab.at) => Boolean(lab.solved[i]);
export const allSolved = (lab) => lab.solved.every(Boolean);
export const hasNext = (lab) => lab.at < lab.steps.length - 1;

/**
 * Où est le bâton par rapport à la lumière : 'shade' (son sommet sous le rayon : à l'ombre de l'objet, pas d'ombre à lui), 'meet' (son sommet
 * SUR le rayon : les deux ombres finissent ensemble) ou 'sun' (au soleil, son ombre dépasse celle de l'objet).
 */
export function sideOf(lab, x = lab.stickX) {
  const s = cur(lab);
  if (s.task !== 'meet') return 'sun';
  if (x === s.meetX) return 'meet';
  return x < s.meetX ? 'shade' : 'sun';
}

/**
 * Déplacer le bâton (cm depuis A, au centimètre). `magnet` (cm, le glisser seulement) : à moins de cette distance de la rencontre, le bâton s'y
 * pose — au centimètre près la rencontre ne se viserait pas du doigt. Sans effet hors d'une étape « meet », ni après la rencontre (figé).
 */
export function moveStick(lab, x0, { magnet = 0 } = {}) {
  const s = cur(lab);
  if (s.task !== 'meet' || isMet(lab)) return lab;
  let x = clampX(s, x0);
  if (magnet > 0 && Math.abs(x - s.meetX) <= magnet) x = s.meetX;
  if (x === lab.stickX) return lab;
  return fz({ ...lab, stickX: x, last: fz({ kind: 'move', x }) });
}

const setAt = (list, i, v) => fz(list.map((old, j) => (j === i ? v : old)));

/**
 * Le bâton est LÂCHÉ (relâchement, pause du clavier) : à la rencontre, l'étape est « rencontrée » — et résolue quand rien n'y est demandé.
 * `last` : { kind: 'meet', first } ou { kind: 'drop', side }.
 */
export function settle(lab) {
  const s = cur(lab);
  if (s.task !== 'meet' || isMet(lab)) return lab;
  if (lab.stickX !== s.meetX) return fz({ ...lab, last: fz({ kind: 'drop', side: sideOf(lab) }) });
  return fz({
    ...lab,
    met: setAt(lab.met, lab.at, true),
    solved: s.ask ? lab.solved : setAt(lab.solved, lab.at, true),
    last: fz({ kind: 'meet', step: lab.at, solved: !s.ask }),
  });
}

/** Une réponse peut-elle être donnée maintenant ? (meet : après la rencontre ; ratio et flag : tout de suite) */
export function canAnswer(lab) {
  const s = cur(lab);
  if (!s.ask || isSolved(lab)) return false;
  return s.task === 'meet' ? isMet(lab) : true;
}

/** Ce que l'étape attend (cm) : la hauteur de l'objet, ou — drapeau — la longueur de son ombre. */
const expectedOf = (step) => (step.task === 'flag' ? step.OA : step.H);

/**
 * Le MODÈLE derrière une réponse (cm) — pour dire ce qui a été fait, jamais la règle :
 *   hauteur  — 'right' ; 'segment' (BA ÷ OB : la قطعة au lieu du côté — = H − 1 m) ; 'additive' (OA − (OB − 1 m) : le même ÉCART pour tous) ;
 *              'shadow' (l'ombre elle-même) ; 'inverse' (OB ÷ OA, ou le produit OA × OB) ; 'other'.
 *   drapeau  — 'right' ; 'inverse' (H ÷ k) ; 'additive' (H + (OB − 1 m)) ; 'height' (la hauteur elle-même) ; 'other'.
 */
export function judge(step, cm) {
  if (cm === expectedOf(step)) return 'right';
  const near = (v) => Math.abs(cm - v) <= 1;
  if (step.task === 'flag') {
    if (near((step.H * STICK) / step.OB)) return 'inverse';
    if (cm === step.H + (step.OB - STICK)) return 'additive';
    if (cm === step.H) return 'height';
    return 'other';
  }
  if (cm === step.H - STICK) return 'segment';
  if (cm === step.OA - (step.OB - STICK)) return 'additive';
  if (cm === step.OA) return 'shadow';
  if (near((STICK * step.OB) / step.OA) || near((step.OA * step.OB) / STICK)) return 'inverse';
  return 'other';
}

/**
 * RÉPONDRE (cm) : la hauteur, ou la longueur de l'ombre du poteau (le drapeau y est planté). `last` : { kind: 'answer', step, value, ok, why,
 * repeat } — `repeat` : la même réponse fausse qu'avant (pas un nouvel essai).
 */
export function answer(lab, cm0) {
  if (!canAnswer(lab)) return lab;
  const cm = Math.round(Number(cm0));
  if (!Number.isFinite(cm) || cm <= 0) return lab;
  const s = cur(lab);
  const why = judge(s, cm);
  const ok = why === 'right';
  const repeat = !ok && lab.wrong[lab.at].includes(cm);
  return fz({
    ...lab,
    flag: s.task === 'flag' ? cm : lab.flag,
    solved: ok ? setAt(lab.solved, lab.at, true) : lab.solved,
    wrong: ok || repeat ? lab.wrong : setAt(lab.wrong, lab.at, fz([...lab.wrong[lab.at], cm])),
    last: fz({ kind: 'answer', step: lab.at, value: cm, ok, why, repeat }),
  });
}

/**
 * Ce que la manche reçoit (`onVerdict`) du dernier geste, ou null : une réponse NOUVELLE → { groups: l'indice de l'étape, exact } ; une
 * rencontre où rien n'est demandé → exact et `free` (elle compte pour le but `solvedAll`, jamais comme un essai de l'étoile « peu d'essais »).
 */
export function verdictOf(lab) {
  const l = lab.last;
  if (!l) return null;
  if (l.kind === 'answer' && !l.repeat) return fz({ groups: l.step, exact: l.ok });
  if (l.kind === 'meet' && l.solved) return fz({ groups: l.step, exact: true, free: true });
  return null;
}

/**
 * L'étape SUIVANTE (l'heure avance, ou un autre objet) — seulement quand l'étape courante est résolue. Le bâton reste où il était quand
 * l'objet est le même (le soleil a bougé, pas lui) ; il repart au soleil sinon, ou s'il tomberait pile sur la nouvelle rencontre.
 */
export function nextStep(lab) {
  if (!isSolved(lab) || !hasNext(lab)) return lab;
  const prev = cur(lab);
  const s = lab.steps[lab.at + 1];
  let x = s.object === prev.object && s.H === prev.H ? clampX(s, lab.stickX) : startX(s);
  if (x === s.meetX) x = startX(s);
  return fz({ ...lab, at: lab.at + 1, stickX: x, flag: null, last: fz({ kind: 'step', to: lab.at + 1, hourChanged: s.hour !== prev.hour, objectChanged: s.object !== prev.object }) });
}

/* ── les pastilles ─────────────────────────────────────────────────────── */

const DECOY = {
  segment: (s) => s.H - STICK,
  additive: (s) => s.OA - (s.OB - STICK),
  shadow: (s) => s.OA,
};

/** Faire tourner une liste d'une graine (jamais la bonne réponse toujours à la même place, jamais au hasard). */
const spin = (xs, seed) => { const k = ((seed % xs.length) + xs.length) % xs.length; return xs.map((_, i) => xs[(i + k) % xs.length]); };

/**
 * Les TROIS pastilles de la hauteur (`ask.kind === 'tap'`) : la bonne et deux leurres, chacun un MODÈLE faux nommé (`why`) — par défaut la
 * قطعة (BA ÷ OB) et l'écart constant ; une manche choisit les siens (`ask.decoys`, parmi segment / additive / shadow). Toujours trois valeurs
 * distinctes ; leur ordre tourne avec les nombres.
 */
export function heightOptions(step) {
  const out = [{ v: step.H, right: true, why: null }];
  const kinds = [...(step.ask?.decoys ?? []), 'segment', 'additive', 'shadow'];
  for (const kind of kinds) {
    if (out.length >= 3) break;
    const v = DECOY[kind]?.(step);
    if (v != null && v > 0 && !out.some((o) => o.v === v)) out.push({ v, right: false, why: kind });
  }
  return fz(spin(out, step.H / 25 + step.hour).map((o) => fz({ ...o, text: m(o.v) })));
}

/** Les trois longueurs lues au sol à la rencontre (la question « OB = ? OA = ? ») : OB, BA, OA — leur ordre tourne. */
export function readOptions(step) {
  return fz(spin([step.OB, step.meetX, step.OA], step.H / 25 + step.hour + 1).map((v) => m(v)));
}

/* ── les prédictions (à la charnière entre deux étapes : l'heure va changer) ── */

/**
 * La vérité d'une prédiction posée APRÈS l'étape `from`, sur l'étape suivante — calculée :
 *   'stickSame' — « à la nouvelle heure, l'ombre du bâton sera-t-elle encore la même ? » → 'yes' | 'no' ;
 *   'double'    — « l'ombre de l'objet sera-t-elle plus / exactement / moins du double ? » → 'more' | 'exact' | 'less'.
 */
export function predictTruth(lab, key, from = lab.at) {
  const a = lab.steps[from];
  const b = lab.steps[from + 1];
  if (!a || !b) return null;
  if (key === 'stickSame') return a.OB === b.OB ? 'yes' : 'no';
  if (key === 'double') return b.OA > 2 * a.OA ? 'more' : b.OA === 2 * a.OA ? 'exact' : 'less';
  return null;
}
/** Les réponses possibles d'une prédiction, dans l'ordre affiché. */
export const predictOptions = (key) => (key === 'stickSame' ? ['yes', 'no'] : key === 'double' ? ['less', 'exact', 'more'] : []);
/** Une prédiction posée après l'étape `from` est JUGÉE quand l'étape suivante est rencontrée (ses longueurs sont à l'écran). */
export const predictionJudged = (lab, from) => Boolean(lab.met[from + 1] || lab.solved[from + 1]);

/* ── le journal ────────────────────────────────────────────────────────── */

/**
 * Les lignes du journal « 📋 جدول تجاربك » : une par étape entamée — l'heure, l'objet, son ombre, celle du bâton, la hauteur (ou null).
 * `hideHeight` (la manche de la synthèse, 2026-11-10) : la hauteur n'est JAMAIS écrite — la rencontre suffit, la hauteur est la réponse de
 * l'étape 2 du module 7 (content/forbidden.js de la synthèse).
 */
export function journalRows(lab, { hideHeight = false } = {}) {
  return lab.steps.map((s, i) => {
    const seen = i <= lab.at && (lab.met[i] || lab.solved[i] || s.task !== 'meet');
    if (!seen) return null;
    const shadowKnown = s.task === 'ratio' || lab.met[i] || (s.task === 'flag' && lab.solved[i]);
    return fz({
      i, hour: HOURS[s.hour], object: s.object, name: s.name, task: s.task,
      shadow: shadowKnown ? s.OA : null, stick: s.OB,
      height: !hideHeight && (s.task === 'flag' || lab.solved[i]) ? s.H : null,
      solved: Boolean(lab.solved[i]), tries: lab.wrong[i].length,
    });
  }).filter(Boolean);
}

/** Ce que le labo a fait, pour `onTrial` (la trace du module) : le dernier geste jugé. */
export function evidenceOf(lab) {
  const s = cur(lab);
  const l = lab.last ?? {};
  return fz({ stage: l.kind ?? 'start', step: lab.at, hour: HOURS[s.hour], object: s.object, ok: l.ok ?? null, met: isMet(lab), solved: isSolved(lab) });
}

/* ── le guide ──────────────────────────────────────────────────────────── */

/**
 * Le GUIDE (LabCoach) — jamais la réponse, jamais l'endroit de la rencontre : la poignée du bâton, puis la question de la hauteur (ou la case
 * du drapeau), puis le bouton de l'étape suivante ; rien quand tout est fait. `ctx` : { asking, canAdvance, done }.
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  const s = cur(lab);
  if (s.task === 'meet' && !isMet(lab)) return fz({ id: 'drag', target: '[data-sm-stick]', gesture: 'drag' });
  // la bulle s'ouvre SOUS les pastilles (ou la case) : jamais sur la question qu'on est en train de lire
  if (ctx.asking) return fz({ id: s.task === 'flag' ? 'flag' : s.ask?.kind === 'tap' ? 'tap' : 'type', target: '[data-sm-ask-zone]', gesture: 'tap', prefer: 'below' });
  if (ctx.canAdvance) return fz({ id: 'next', target: '[data-sm-next]', gesture: 'tap' });
  return null;
}

/* ── tout ce qu'un écran peut montrer ──────────────────────────────────── */

/**
 * TOUT ce que les écrans d'une manche peuvent montrer (règle « valeurs interdites par RÔLE ») : `{ role, v }`, v en texte à virgule.
 *   'hour' l'heure · 'length' une longueur au sol (OA, OB, BA) · 'height' une hauteur · 'decoy-height' une pastille fausse · 'ratio' OB ÷ OA
 *   (seulement quand `chains: 'same'` l'écrit).
 * Le bâton en mouvement ne montre AUCUNE longueur (rien n'est écrit pendant le glisser) ; une réponse TAPÉE est celle de l'élève (non balayée).
 * `choices` : { heights, hours } — la manche libre : chaque couple.
 * `hideHeight` : la hauteur de l'objet n'est jamais montrée (ni dans la scène, ni au journal) — elle n'est pas listée (le bâton de 1 m l'est).
 */
export function shownValues(props = {}) {
  const out = [];
  const push = (role, v) => out.push(fz({ role, v: String(v) }));
  // le rapport OB ÷ OA n'est ÉCRIT que par la suite « same » (la question des deux heures) : ailleurs aucun écran ne le montre
  const showsRatio = props.chains === 'same';
  const one = (s) => {
    push('hour', HOURS[s.hour]);
    push('length', m(s.OB));
    push('height', m(STICK));
    if (s.task !== 'flag') {
      push('length', m(s.OA));
      if (s.task === 'meet') { push('length', m(s.meetX)); if (showsRatio) push('ratio', ratioText(s)); }
      if (!props.hideHeight) push('height', m(s.H));
      if (s.ask?.kind === 'tap') heightOptions(s).filter((o) => !o.right).forEach((o) => push('decoy-height', o.text));
    } else {
      push('height', m(s.H));
      push('length', m(s.OA));
    }
  };
  stepsOf(props).forEach(one);
  const ch = props.choices;
  if (ch) (ch.heights ?? []).forEach((height) => (ch.hours ?? []).forEach((hour) => one(stepOf({ object: props.object, height, hour, task: 'meet', ask: props.ask }))));
  return out;
}

/* ── la géométrie de la scène ──────────────────────────────────────────── */

/**
 * La scène en pixels : UNE échelle pour toute la manche (toutes ses étapes) — quand l'heure avance, l'élève VOIT les ombres s'allonger.
 * `x(cm)` / `y(cm)` : du monde (cm depuis A, cm au-dessus du sol) à l'écran ; `cmAt(px)` : l'inverse, pour le doigt ; `pxPerCm`.
 */
export function layout(lab, { width = 640, height = 320, pad = 14, sky = 30, ground = 84 } = {}) {
  const maxOA = Math.max(...lab.steps.map((s) => (s.task === 'flag' ? Math.round(s.OA * 1.25) : s.OA)));
  const maxOB = Math.max(...lab.steps.map((s) => s.OB));
  const maxH = Math.max(...lab.steps.map((s) => s.H), 2 * STICK);
  // la place de l'objet (sa demi-largeur) à gauche de A — et celle du bâton d'une étape « drapeau », planté à gauche du poteau
  const flagLeft = Math.max(0, ...lab.steps.filter((s) => s.task === 'flag').map((s) => s.OB + 60 + 50));
  const left = Math.max(90, Math.round(maxH * 0.32), flagLeft);
  const right = maxOA + STICK_PAST + maxOB + 30;
  const spanX = left + right;
  const spanY = Math.round(maxH * 1.12);
  const scale = Math.max(0.05, Math.min((width - 2 * pad) / spanX, (height - sky - ground) / spanY));
  const groundY = height - ground;
  const offX = pad + Math.max(0, (width - 2 * pad - spanX * scale) / 2);
  const x = (cm) => offX + (left + cm) * scale;
  const y = (cm) => groundY - cm * scale;
  return fz({ width, height, scale, pxPerCm: scale, groundY, x, y, cmAt: (px) => (px - offX) / scale - left, left, right, spanX, spanY });
}
