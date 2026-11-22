/**
 * shadow-world — LA LOGIQUE PURE de « ساحة الحيّ » (unité 9 « خاصية طالس », le تحدّ p. 103 de la synthèse).
 *
 * Toutes les longueurs sont des ENTIERS en centimètres : la mathématique est exacte, aucune virgule flottante ne
 * décide d'un verdict. Ce module dit ce que fait le monde (les ombres), ce que la main a le droit de faire (le
 * soleil, le ruban, le bâton, le drapeau du pronostic, la règle de l'élève) et ce que pense le compagnon مقران.
 *
 * LE SOLEIL. Le soleil réel d'Alger (36,75° N) le 13 octobre, l'après-midi, en heure légale (midi solaire ≈ 12 h 34).
 * Pour chaque demi-heure, k = ombre ÷ hauteur d'un objet vertical vaut 1 ÷ tan(hauteur du soleil), arrondi au
 * multiple de 0,04 le plus proche (k = n ÷ 25) pour que toute ombre d'un objet dont la hauteur est un multiple de
 * 25 cm soit un nombre ENTIER de centimètres. Écart avec le calcul astronomique ≤ 0,03, sauf 15 h 00 où l'on prend
 * 1,6 (réel 1,54) : c'est le moment du تحدّ du manuel (ombre du bâton 1,6 m, de la minaret 11,6 m).
 *
 *   heure   12:30 13:00 13:30 14:00 14:30 15:00 15:30 16:00
 *   k       1     1,04  1,08  1,2   1,32  1,6   1,84  2,28
 *
 * LA PLACE (vue de côté, abscisses en cm depuis le pied A de la minaret, l'ombre part vers l'est = la droite) :
 *   couloir 0  la minaret (hauteur INCONNUE de l'élève) et le bâton de 1 m que l'élève plante où il veut
 *   couloir 1  le palmier (hauteur inconnue, décor qui a une ombre comme tout le reste)
 *   couloir 2  la hampe du drapeau (6 m) — installée par la commune après un pronostic
 *   couloir 3  le lampadaire (3 m) — installé par la commune après un pronostic
 *   couloir 4  فريد (1,5 m)
 *
 * PRINCIPE DE DÉCOUVERTE (exigence du propriétaire, 2026-10-13) : AUCUNE règle n'est énoncée avant que l'élève
 * l'ait produite. Le carnet n'écrit que des mesures ; l'élève ÉCRIT sa règle (ombre = hauteur + n, ou × n) et le
 * monde la teste sur tous les objets à la fois ; le soleil qui bouge la réfute. Le compagnon ne fait que
 * QUESTIONNER, par paliers (`help`), et ne dit jamais « multiplie par k ».
 */

export const HOURS = Object.freeze(['12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00']);
/** k = K25[i] ÷ 25 */
export const K25 = Object.freeze([25, 26, 27, 30, 33, 40, 46, 57]);
export const TEXTBOOK_HOUR = 5; // 15:00, k = 1,6

/** Tolérance d'un pronostic (cm) : le drapeau se pose au pas de 5 cm. */
const PREDICT_TOL = 10;
/** Le pas du bâton et du drapeau (cm). */
export const STEP = 5;

export const OBJECTS = Object.freeze([
  { id: 'minaret', lane: 0, x: 0, known: false },
  { id: 'stick', lane: 0, H: 100, known: true, movable: true },
  { id: 'palm', lane: 1, x: 600, H: 450, known: false },
  { id: 'flag', lane: 2, x: 100, H: 600, known: true, install: true },
  { id: 'lamp', lane: 3, x: 700, H: 300, known: true, install: true },
  { id: 'farid', lane: 4, x: 1250, H: 150, known: true },
]);
const INSTALL_ORDER = Object.freeze(['lamp', 'flag']);
export const LANES = 5;
export const STICK_MIN = 150;
export const STICK_MAX = 1500;
export const WORLD = Object.freeze({ xMin: -400, xMax: 1780 });

/* ── nombres ─────────────────────────────────────────────────────────────── */

/** « 11,6 », « 7,25 », « 1 » — des cm (entier ou non) vers des mètres à virgule, sans zéro inutile. */
export function m(cm, digits = 2) {
  const v = Math.round((cm / 100) * 10 ** digits) / 10 ** digits;
  const s = v.toFixed(digits).replace(/\.?0+$/, '');
  return s.replace('.', ',');
}
/** La même écriture en LaTeX (« 11{,}6 »). */
export const tex = (cm, digits = 2) => m(cm, digits).replace(',', '{,}');
/** Un nombre tapé par l'élève (« 1,6 », « 1.6 », chiffres arabes-indiens) → centièmes entiers, ou null. */
export function parseHundredths(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace('٫', ',').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

/* ── le monde ───────────────────────────────────────────────────────────── */

/** La hauteur (cm) de chaque objet dans ce monde. */
export function heightOf(s, id) {
  if (id === 'minaret') return s.minaret;
  return OBJECTS.find((o) => o.id === id).H;
}
/** L'ombre (cm, entière) d'un objet de hauteur H à l'heure i. */
export const shadowAt = (H, i) => (H * K25[i]) / 25;
/** k continu entre deux demi-heures (pendant que le doigt tient le soleil) ; exact aux demi-heures. */
export function kAt(t) {
  const c = Math.max(0, Math.min(HOURS.length - 1, t));
  const i = Math.floor(c);
  const f = c - i;
  const a = K25[i];
  const b = K25[Math.min(HOURS.length - 1, i + 1)];
  return (a + (b - a) * f) / 25;
}
/** Les objets présents (les installations seulement une fois installées). */
export function present(s) {
  return OBJECTS.filter((o) => !o.install || s.installed[o.id]).map((o) => o.id);
}
/** L'extrémité d'ombre de la minaret (O), en cm depuis A. */
export const minaretTip = (s, i = s.hour) => shadowAt(s.minaret, i);
/** L'ombre du bâton finit-elle à l'intérieur de celle de la minaret (sa tête dans l'ombre) ? */
export const stickHidden = (s, i = s.hour, x = s.stickX) => x + shadowAt(100, i) < minaretTip(s, i);
/**
 * Une place où le bâton est ENTIÈREMENT au soleil à l'heure courante : son pied au-delà du bout de l'ombre de la
 * minaret (O), arrondi au pas, borné. Jamais la place du manuel (la lisière) : sortir de l'ombre ne doit pas donner
 * la méthode. Sert l'action « أبعِد العصا » du compagnon, pour qu'une ombre avalée ne soit jamais une impasse.
 */
export function stickOutOfShadow(s, i = s.hour) {
  const x = Math.ceil((minaretTip(s, i) + 50) / STEP) * STEP;
  return Math.max(STICK_MIN, Math.min(STICK_MAX, x));
}

/** Le bâton est-il à la place du manuel (les deux ombres finissent ensemble en O) ? */
export const stickMeets = (s, i = s.hour, x = s.stickX) => x + shadowAt(100, i) === minaretTip(s, i);

/**
 * L'état initial. `minaret` en mètres (« 7,25 ») : la hauteur cachée, multiple de 25 cm. Le soleil à 13 h 00 (ni la
 * demi-heure du manuel, ni midi où ombre = hauteur) ; le bâton AU SOLEIL, loin de la minaret (`STICK_MAX`) : sa
 * première mesure réussit toujours. L'élève découvre l'ombre avalée en l'approchant lui-même (owner 2026-10-13 :
 * un bâton qui démarre dans l'ombre était une impasse — le premier « قِس » échouait sans geste possible).
 */
export function init({ minaret = '7,25' } = {}) {
  const h = parseHundredths(minaret);
  if (h == null || h % 25 !== 0 || h < 300 || h > 1000) throw new Error('shadowWorld: minaret = multiple de 0,25 m entre 3 et 10 m');
  return Object.freeze({
    minaret: h,
    hour: 1,
    hoursSeen: Object.freeze([1]),
    stickX: STICK_MAX,
    installed: Object.freeze({ lamp: false, flag: false }),
    flagP: null,
    notebook: Object.freeze([]),
    predictions: Object.freeze([]),
    rule: null,
    rules: Object.freeze([]),
    meets: Object.freeze([]),
    answers: Object.freeze([]),
    climbed: false,
    seenHidden: false,
    quizzes: Object.freeze({}),
    lastSunMove: null,
    last: null,
  });
}

const fz = Object.freeze;

/* ── les gestes ─────────────────────────────────────────────────────────── */

/** Poser le soleil sur une demi-heure (relâchement, touche, bouton). */
export function setHour(s, i0) {
  const i = Math.max(0, Math.min(HOURS.length - 1, Math.round(i0)));
  if (i === s.hour) return s;
  const hoursSeen = s.hoursSeen.includes(i) ? s.hoursSeen : fz([...s.hoursSeen, i]);
  const ruleStill = s.rule ? ruleCheck(s, s.rule, i).allFit : null;
  const lastSunMove = fz({ from: s.hour, to: i });
  return fz({ ...s, hour: i, hoursSeen, lastSunMove, last: fz({ kind: 'sun', from: s.hour, to: i, ruleStill, first: s.hoursSeen.length === 1 }) });
}

/** Planter le bâton (cm, au pas de 5). La place du manuel est un ÉVÉNEMENT (« طريقة مقران »). */
export function placeStick(s, x0) {
  const x = Math.max(STICK_MIN, Math.min(STICK_MAX, Math.round(x0 / STEP) * STEP));
  const meet = stickMeets(s, s.hour, x);
  const hidden = stickHidden(s, s.hour, x);
  const meets = meet && !s.meets.some((q) => q.hour === s.hour) ? fz([...s.meets, fz({ hour: s.hour, x, O: minaretTip(s) })]) : s.meets;
  return fz({
    ...s, stickX: x, meets,
    seenHidden: s.seenHidden || hidden,
    last: fz({ kind: 'stick', x, meet, hidden, firstHidden: hidden && !s.seenHidden }),
  });
}

/**
 * Mesurer une ombre au ruban (relâché sur l'extrémité, ou le chemin clavier). Le ruban part du pied de l'objet ;
 * une ombre AVALÉE par celle de la minaret n'a pas d'extrémité visible : rien à mesurer.
 */
export function measure(s, id) {
  if (!present(s).includes(id)) return s;
  if (id === 'stick' && stickHidden(s)) return fz({ ...s, last: fz({ kind: 'measureHidden' }) });
  const shadow = shadowAt(heightOf(s, id), s.hour);
  const row = fz({ hour: s.hour, obj: id, shadow });
  const others = s.notebook.filter((r) => !(r.hour === s.hour && r.obj === id));
  const notebook = fz([...others, row].sort((a, b) => a.hour - b.hour || OBJECTS.findIndex((o) => o.id === a.obj) - OBJECTS.findIndex((o) => o.id === b.obj)));
  const sameHour = notebook.filter((r) => r.hour === s.hour).length;
  return fz({ ...s, notebook, last: fz({ kind: 'measure', obj: id, shadow, hour: s.hour, sameHour }) });
}

/** Le ruban qu'on essaie de faire monter le long de la minaret : refusé, et c'est tout le problème. */
export const climb = (s) => fz({ ...s, climbed: true, last: fz({ kind: 'climb', first: !s.climbed }) });

/** L'objet que la commune installera ensuite (pronostic), ou null. */
export const nextInstall = (s) => INSTALL_ORDER.find((id) => !s.installed[id]) ?? null;

/** Poser le drapeau du pronostic : la longueur d'ombre attendue, depuis le pied (cm, pas de 5). */
export function setFlag(s, p) {
  if (!nextInstall(s)) return s;
  return fz({ ...s, flagP: Math.max(0, Math.min(2000, Math.round(p / STEP) * STEP)) });
}

/**
 * Le modèle que trahit un pronostic p (cm) pour un objet de hauteur H à l'heure i, sachant l'ombre du bâton de 1 m.
 *   right     p ≈ k·H                          (la bonne relation)
 *   additive  p ≈ H + (ombre du bâton − 1 m)   (« on ajoute la même différence »)
 *   copy      p ≈ ombre du bâton               (« toutes les ombres sont pareilles »)
 *   equal     p ≈ H                            (« l'ombre égale la hauteur »)
 *   inverse   p ≈ H ÷ k                        (« plus haut = ombre plus courte », le rapport retourné)
 *   short / long  aucun modèle reconnu : on dit seulement de combien
 * `discriminating` : à cette heure, « ajouter » et « multiplier » donnent-ils des ombres vraiment différentes ? Sinon
 * un pronostic juste NE PROUVE RIEN (à 12 h 30, k = 1).
 */
function classify(H, i, p) {
  const truth = shadowAt(H, i);
  const stick = shadowAt(100, i);
  const models = [
    ['right', truth],
    ['additive', H + stick - 100],
    ['copy', stick],
    ['equal', H],
    ['inverse', (H * 25) / K25[i]],
  ];
  const near = (v) => Math.abs(p - v) <= PREDICT_TOL;
  const hit = models.find(([, v]) => near(v));
  const kind = hit ? hit[0] : p < truth ? 'short' : 'long';
  const discriminating = Math.abs(H + stick - 100 - truth) > 2 * PREDICT_TOL;
  return fz({ kind, truth, discriminating, gap: Math.abs(p - truth), additiveValue: H + stick - 100 });
}

/** La commune installe : le pronostic est jugé contre l'ombre qui apparaît. */
export function install(s) {
  const id = nextInstall(s);
  if (!id || s.flagP == null) return s;
  const H = heightOf(s, id);
  const c = classify(H, s.hour, s.flagP);
  const pred = fz({ obj: id, hour: s.hour, H, p: s.flagP, ...c });
  return fz({
    ...s,
    installed: fz({ ...s.installed, [id]: true }),
    flagP: null,
    predictions: fz([...s.predictions, pred]),
    last: fz({ kind: 'install', pred }),
  });
}

/* ── la règle de l'élève ────────────────────────────────────────────────── */

/** Ce que la règle { op: '+' | '×', num (centièmes) } prédit pour une hauteur H (cm). */
export const rulePredict = (rule, H) => (rule.op === '+' ? H + rule.num : (H * rule.num) / 100);

/** La règle confrontée à TOUS les objets de hauteur connue présents, à l'heure i — exactement (pas de tolérance). */
function ruleCheck(s, rule, i = s.hour) {
  const fits = present(s).filter((id) => OBJECTS.find((o) => o.id === id).known).map((id) => {
    const H = heightOf(s, id);
    const truth = shadowAt(H, i);
    const pred = rulePredict(rule, H);
    const ok = rule.op === '+' ? H + rule.num === truth : H * rule.num === 100 * truth;
    return fz({ obj: id, H, truth, pred, ok, gap: Math.abs(pred - truth) });
  });
  return fz({ fits: fz(fits), allFit: fits.length >= 2 && fits.every((f) => f.ok), okCount: fits.filter((f) => f.ok).length });
}

/** L'élève fait tester sa règle par le monde. Elle reste posée (ses repères suivent le soleil) jusqu'à la suivante. */
export function applyRule(s, op, num) {
  if (!['+', '×'].includes(op) || !Number.isInteger(num) || num < 0 || num > 1000) return s;
  const rule = fz({ op, num, hour: s.hour });
  const check = ruleCheck(s, rule);
  const trial = fz({ ...rule, ...check });
  return fz({ ...s, rule, rules: fz([...s.rules, trial]), last: fz({ kind: 'rule', trial }) });
}

/* ── le défi : la hauteur de la minaret ─────────────────────────────────── */

/**
 * Juger une hauteur proposée (cm) et RECONNAÎTRE la démarche fautive à partir du carnet de l'élève : l'ombre prise
 * pour la hauteur, le rapport retourné, la différence ajoutée, deux heures mélangées, la distance AB du manuel.
 */
function judgeHeight(s, hcm) {
  const near = (v) => Math.abs(hcm - v) <= 1;
  if (near(s.minaret)) return fz({ kind: 'right' });
  const mins = s.notebook.filter((r) => r.obj === 'minaret');
  const refs = s.notebook.filter((r) => r.obj !== 'minaret' && OBJECTS.find((o) => o.id === r.obj).known);
  for (const r of mins) {
    if (near(r.shadow)) return fz({ kind: 'shadowItself', hour: r.hour, S: r.shadow });
    for (const q of refs) {
      const H = heightOf(s, q.obj);
      if (q.hour === r.hour && near((r.shadow * q.shadow) / H)) return fz({ kind: 'inverted', hour: r.hour, S: r.shadow, obj: q.obj });
      if (q.hour === r.hour && near(r.shadow - (q.shadow - H))) return fz({ kind: 'additive', hour: r.hour, S: r.shadow, obj: q.obj, d: q.shadow - H });
      if (q.hour !== r.hour && near((r.shadow * H) / q.shadow)) return fz({ kind: 'mixedHours', hour: r.hour, refHour: q.hour, S: r.shadow, obj: q.obj });
    }
  }
  const meet = s.meets.find((q) => near(q.x));
  if (meet) return fz({ kind: 'distance', x: meet.x });
  if (mins.length === 0) return fz({ kind: 'noShadow' });
  return fz({ kind: hcm > s.minaret ? 'tooHigh' : 'tooLow' });
}

export function answer(s, raw) {
  const hund = parseHundredths(raw);
  if (hund == null) return fz({ ...s, last: fz({ kind: 'answerInvalid' }) });
  const verdict = judgeHeight(s, hund);
  const a = fz({ h: hund, ...verdict });
  return fz({ ...s, answers: fz([...s.answers, a]), last: fz({ kind: 'answer', a }) });
}

/* ── les questions TAPÉES de مقران (observation) ────────────────────────── */

/**
 * Deux questions que مقران pose pendant l'observation (§16.5bis) : l'élève TAPE une réponse, jugée EXACTEMENT
 * contre le dernier geste — jamais rhétorique. Chacune a deux options (id de l'option, pas un texte : la vue
 * fournit les libellés arabes). Aucune des deux ne révèle k ; elles préparent la lecture, pas la loi.
 *
 *   trend   « quand la Shams descend (plus tard), les ombres s'allongent ou raccourcissent ? » — jugée sur le
 *           dernier déplacement du soleil (`last.kind === 'sun'`), avec l'ombre de la minaret comme témoin :
 *           PLUS TARD (to > from) allonge toujours (k croît), PLUS TÔT raccourcit toujours (propriété monotone,
 *           testée). Sans geste solaire encore fait, la question n'a pas de réponse à juger : `null`.
 *   fastest « quel ombre change le plus : celle de la عصا (1 m) ou celle de la مئذنة ? » — jugée en CENTIMÈTRES
 *           entre les deux dernières heures DISTINCTES visitées (hoursSeen) : la مئذنة, plus haute, gagne
 *           toujours plus de centimètres — mais LE RAPPORT (Δombre ÷ hauteur) est identique pour les deux,
 *           ce que la réponse écrit pour préparer, sans la nommer, la loi à venir.
 */
export function judgeTrend(s) {
  // `lastSunMove` (posé par `setHour`, jamais effacé par une réponse de quiz) plutôt que `s.last` : sinon
  // répondre faux une fois, ce qui pose `last.kind = 'quiz'`, rendait la question elle-même injugeable et le
  // tuteur sautait silencieusement à la suivante (régression trouvée aux tests, 2026-10-13).
  if (!s.lastSunMove) return null;
  const { from, to } = s.lastSunMove;
  const before = shadowAt(s.minaret, from);
  const after = shadowAt(s.minaret, to);
  const grew = after > before;
  return fz({ ok: grew, correct: grew ? 'longer' : 'shorter', from: HOURS[from], to: HOURS[to], before, after });
}

export function judgeFastest(s) {
  if (s.hoursSeen.length < 2) return null;
  const [h1, h2] = s.hoursSeen.slice(-2);
  if (h1 === h2) return null;
  const dStick = Math.abs(shadowAt(100, h2) - shadowAt(100, h1));
  const dMinaret = Math.abs(shadowAt(s.minaret, h2) - shadowAt(s.minaret, h1));
  // le pourcentage de variation (Δombre ÷ hauteur × 100), IDENTIQUE pour les deux objets : c'est ce que la
  // réponse écrit pour préparer, sans la nommer, la loi à venir — le tiers de donnée que « fastest » laisse voir.
  const pctStick = Math.round((dStick / 100) * 100);
  const pctMinaret = Math.round((dMinaret / s.minaret) * 100);
  return fz({
    ok: true, correct: 'minaret', h1: HOURS[h1], h2: HOURS[h2], dStick, dMinaret,
    pctStick, pctMinaret,
  });
}

/**
 * ratioSeed — une fois DEUX ombres mesurées à la même heure (la عصا et un autre objet connu), مقران demande si
 * « ombre ÷ hauteur » est la même valeur pour les deux ou une valeur différente. Jugé EXACTEMENT sur les deux
 * lignes du carnet que l'élève a lui-même produites (pas sur la minaret, encore inconnue). Les deux rapports sont
 * TOUJOURS égaux (c'est le phénomène) : la bonne réponse est toujours « same », mais elle n'est accessible que si
 * l'élève a deux mesures à comparer — sinon la question n'existe pas encore.
 */
export function judgeRatioSeed(s) {
  const byHour = new Map();
  for (const r of s.notebook) {
    // seulement des objets dont l'élève CONNAÎT la hauteur (pas la minaret ni le palmier) : sinon « احسب ظلّ ÷ طول »
    // portait sur une hauteur qu'il ne peut pas lire — une question sans réponse possible (QA propriétaire 2026-10-13).
    if (!OBJECTS.find((o) => o.id === r.obj).known) continue;
    if (!byHour.has(r.hour)) byHour.set(r.hour, []);
    byHour.get(r.hour).push(r);
  }
  const hour = [...byHour.keys()].find((h) => byHour.get(h).length >= 2);
  if (hour == null) return null;
  const [a, b] = byHour.get(hour);
  const ra = (a.shadow * 100) / heightOf(s, a.obj);
  const rb = (b.shadow * 100) / heightOf(s, b.obj);
  return fz({ ok: true, correct: 'same', hour: HOURS[hour], a: a.obj, b: b.obj, sa: a.shadow, sb: b.shadow, Ha: heightOf(s, a.obj), Hb: heightOf(s, b.obj), ra: m(ra), rb: m(rb) });
}

/**
 * predictReflect — juste après un pari RÉSOLU et FAUX (`install`), مقران demande à l'élève de reconnaître SA
 * PROPRE erreur parmi les modèles de `classify` : jugé contre `s.predictions.at(-1)`, qui porte déjà le
 * diagnostic (`kind`). Un pari juste ou pas encore de pari : pas de question.
 */
// Pour CHAQUE modèle reconnu, le distracteur le plus proche pédagogiquement (deux options, jamais quatre : un
// choix à quatre entre des modèles que l'élève ne connaît pas par leur nom serait une devinette, pas une
// reconnaissance). Fixe, déterministe : deux élèves avec le même pari voient la même paire.
const PREDICT_DISTRACTOR = Object.freeze({ additive: 'equal', copy: 'equal', equal: 'additive', inverse: 'copy' });

export function judgePredictReflect(s) {
  const last = s.predictions.at(-1);
  if (!last || last.kind === 'right') return null;
  const KNOWN = ['additive', 'copy', 'equal', 'inverse'];
  if (!KNOWN.includes(last.kind)) return null; // short / long : pas assez net pour un choix à deux options
  return fz({
    ok: true, correct: last.kind, options: fz([last.kind, PREDICT_DISTRACTOR[last.kind]]),
    obj: last.obj, hour: HOURS[last.hour], H: last.H, p: last.p, truth: last.truth,
  });
}

/**
 * ruleReflect — une fois la règle × juste À UNE heure (`fittingRules(s).length === 1`), avant de bouger le
 * soleil, مقران demande ce qui doit rester VRAI pour qu'elle tienne ailleurs : le NOMBRE (le même, toujours) ou
 * seulement la FORME (× au lieu de +, le nombre pouvant changer). Jugée une fois pour toutes : la forme survit,
 * le nombre non (c'est précisément ce que `rRuleBroken` va montrer au prochain geste solaire).
 */
export function judgeRuleReflect(s) {
  if (fittingRules(s).length !== 1 || !s.rule) return null;
  // `numText` (pré-formaté, « 1,6 ») plutôt que `num` : ce nom est pris ailleurs (`react`'s case 'rule') pour un
  // CENTIÈME brut passé à `tex()` — même clé, deux conventions, aurait cassé l'un ou l'autre template (trouvé en
  // QA navigateur, 2026-10-13).
  return fz({ ok: true, correct: 'form', hour: HOURS[s.rule.hour], numText: m(s.rule.num) });
}

export const QUIZZES = Object.freeze({
  trend: judgeTrend, fastest: judgeFastest, ratioSeed: judgeRatioSeed, predictReflect: judgePredictReflect, ruleReflect: judgeRuleReflect,
});
/** L'ordre pédagogique des checkpoints : مقران les pose dans cet ordre, un à la fois, dès qu'ils ont une réponse à juger. */
const CHECKPOINT_ORDER = Object.freeze(['trend', 'fastest', 'ratioSeed', 'predictReflect', 'ruleReflect']);

/**
 * Le PROCHAIN checkpoint que l'élève doit répondre pour avancer (null si aucun n'est encore posable, ou si tous
 * les posables sont déjà gagnés). C'est le cœur du tuteur : tant qu'une question a une réponse à juger et n'est
 * pas encore gagnée, elle bloque — l'élève ne peut pas « sauter » une question en continuant à manipuler ; il peut
 * seulement continuer à produire la donnée qui la rend posable (et donc y répondre).
 */
export function currentCheckpoint(s) {
  for (const id of CHECKPOINT_ORDER) {
    if (s.quizzes[id] === true) continue;
    if (QUIZZES[id](s)) return id;
  }
  return null;
}

/**
 * La progression des questions de مقران, pour la vue (« سؤال 2 من 5 ») : chaque checkpoint est `done` (gagné),
 * `skipped` (inutile : un pari juste n'a rien à faire reconnaître), `current` (la porte ouverte) ou `pending`.
 */
export function checkpointStatus(s) {
  const cur = currentCheckpoint(s);
  const predictDone = s.predictions.some((p) => p.kind === 'right');
  return CHECKPOINT_ORDER.map((id) => {
    if (s.quizzes[id] === true) return fz({ id, status: 'done' });
    if (id === cur) return fz({ id, status: 'current' });
    if (id === 'predictReflect' && predictDone && s.quizzes.predictReflect !== true) return fz({ id, status: 'skipped' });
    return fz({ id, status: 'pending' });
  });
}

/** L'élève répond (id de l'option tapée) ; jugé contre `QUIZZES[quizId]`, sans ambiguïté possible. */
export function answerQuiz(s, quizId, pickedId) {
  // Seul le checkpoint COURANT (le prochain dans l'ordre pédagogique, pas encore gagné) peut être répondu : un
  // élève ne peut pas répondre "fastest" avant "trend" même en appelant directement la fonction — la porte est
  // dans la logique, pas seulement dans ce que la vue affiche.
  if (currentCheckpoint(s) !== quizId) return s;
  const judge = QUIZZES[quizId];
  const verdict = judge?.(s);
  if (!verdict) return s;
  const correctPick = pickedId === verdict.correct;
  const already = s.quizzes[quizId] === true;
  const quizzes = correctPick ? fz({ ...s.quizzes, [quizId]: true }) : s.quizzes;
  return fz({ ...s, quizzes, last: fz({ kind: 'quiz', quizId, picked: pickedId, correctPick, verdict, alreadyWon: already }) });
}

/* ── les objectifs (le journal de route) ───────────────────────────────── */

export const GOALS = Object.freeze(['observe', 'measure', 'predict', 'rule', 'rule2', 'minaret']);

export function goals(s) {
  const byHour = new Map();
  for (const r of s.notebook) byHour.set(r.hour, (byHour.get(r.hour) ?? 0) + 1);
  const fitHours = new Set(s.rules.filter((r) => r.op === '×' && r.allFit).map((r) => r.hour));
  return fz({
    observe: s.hoursSeen.length >= 3 && s.quizzes.trend === true && s.quizzes.fastest === true,
    measure: [...byHour.values()].some((n) => n >= 2) && s.quizzes.ratioSeed === true,
    predict: s.predictions.length >= 1 && (s.predictions.some((p) => p.kind === 'right') || s.quizzes.predictReflect === true),
    rule: fitHours.size >= 1 && s.quizzes.ruleReflect === true,
    rule2: fitHours.size >= 2,
    minaret: s.answers.some((a) => a.kind === 'right'),
  });
}
/** La découverte s'ouvre quand l'élève a observé, mesuré, parié, écrit une règle juste et l'a RÉPARÉE à une autre heure. */
export function discoveryReady(s) {
  const g = goals(s);
  return g.observe && g.measure && g.predict && g.rule && g.rule2;
}

/**
 * Le TUTEUR (owner, 2026-10-13) : une question مقران BLOQUE l'étape tant qu'elle n'est pas répondue correctement —
 * ce n'est plus une suggestion à côté de la manipulation, c'est la porte. `currentGoal` vérifie D'ABORD s'il y a
 * un checkpoint en attente pour l'étape courante ; s'il y en a un, l'objectif reste CELUI-LÀ (prefixé `quiz:`) et
 * la vue affiche la question plutôt que la suite de l'étape, jusqu'à la bonne réponse.
 */
export function currentGoal(s, { discovered = false, formal = false, skipQuizzes = false } = {}) {
  const g = goals(s);
  const cp = skipQuizzes ? null : currentCheckpoint(s);
  if (cp) return `quiz_${cp}`;
  for (const id of ['observe', 'measure', 'predict', 'rule', 'rule2']) if (!g[id]) return id;
  if (!discovered || !formal) return 'conclude';
  return g.minaret ? 'done' : 'minaret';
}

/** Les deux règles × justes de l'élève à deux heures différentes (pour la synthèse), dans l'ordre des heures. */
export function fittingRules(s) {
  const seen = new Map();
  for (const r of s.rules) if (r.op === '×' && r.allFit && !seen.has(r.hour)) seen.set(r.hour, r);
  return [...seen.values()].sort((a, b) => a.hour - b.hour);
}

/* ── les ARRÊTS du labo (questions pendant le labo, lot 4) ─────────────────────────────────────────
 *
 * Les six objectifs sont les six étapes ; chacun s'ouvre sur une SUITE de questions (primitives/LabCheckpoint) posée quand l'élève a fait ce
 * qu'il demande. Les cinq questions TAPÉES de مقران (QUIZZES) en font partie : quand elles sont répondues dans la suite, `winQuizzes` les
 * marque gagnées pour que `goals` les voie. Sans suite (enseignant), مقران les pose comme avant. */
export const STOPS = GOALS;

/** L'arrêt est atteint quand l'élève a FAIT ce que l'objectif demande (les questions viennent ensuite). */
export function stopReached(s, id) {
  switch (id) {
    case 'observe': return s.hoursSeen.length >= 3;
    case 'measure': return judgeRatioSeed(s) != null;
    case 'predict': return s.predictions.length >= 1;
    case 'rule': return fittingRules(s).length >= 1;
    case 'rule2': return fittingRules(s).length >= 2;
    case 'minaret': return s.answers.some((a) => a.kind === 'right');
    default: return false;
  }
}

/** Les questions de مقران qu'une suite complète (gagnées d'un coup à la fin de la suite). */
export const QUIZZES_OF_STOP = Object.freeze({ observe: ['trend', 'fastest'], measure: ['ratioSeed'], predict: ['predictReflect'], rule: ['ruleReflect'] });

export function winQuizzes(s, ids) {
  const quizzes = { ...s.quizzes };
  for (const id of ids) quizzes[id] = true;
  return fz({ ...s, quizzes: fz(quizzes) });
}

/** « أعِد التجربة » : l'arrêt est refait — les traces de CET objectif s'effacent, celles des précédents restent. */
export function retryStop(s, id) {
  switch (id) {
    case 'observe': return fz({ ...s, hoursSeen: fz([s.hour]), lastSunMove: null, last: null });
    case 'measure': return fz({ ...s, notebook: fz([]), last: null });
    case 'predict': return fz({ ...s, predictions: fz([]), installed: fz({ lamp: false, flag: false }), flagP: null, last: null });
    case 'rule': return fz({ ...s, rule: null, rules: fz([]), last: null });
    case 'rule2': {
      const first = fittingRules(s)[0];
      return fz({ ...s, rule: first ?? null, rules: fz(first ? [first] : []), last: null });
    }
    case 'minaret': return fz({ ...s, answers: fz([]), last: null });
    default: return s;
  }
}

/* ── le compagnon مقران : il RÉAGIT au dernier geste, sinon il QUESTIONNE ── */

/**
 * Le message (clé + paramètres en cm/ids, mis en forme par la vue) qui répond au DERNIER geste. Jamais l'énoncé de
 * la règle : une observation chiffrée sur ce que l'élève vient de faire, puis une question.
 */
export function react(s) {
  const l = s.last;
  if (!l) return null;
  switch (l.kind) {
    case 'sun': {
      if (s.rule && l.ruleStill === false) return { id: 'rRuleBroken', p: { from: HOURS[s.rule.hour], to: HOURS[l.to] } };
      if (s.rule && l.ruleStill === true && s.rule.op === '+') return { id: 'rPlusSurvives', p: { to: HOURS[l.to] } };
      if (l.to === 0) return { id: 'rNoon', p: {} };
      if (l.first) return { id: 'rSunFirst', p: { to: HOURS[l.to] } };
      return { id: l.to > l.from ? 'rSunLater' : 'rSunEarlier', p: { to: HOURS[l.to] } };
    }
    case 'stick':
      if (l.meet) return { id: 'rMeet', p: { x: l.x, O: minaretTip(s) } };
      if (l.firstHidden) return { id: 'rStickHidden', p: {}, action: 'freeStick' };
      return null;
    case 'measureHidden': return { id: 'rMeasureHidden', p: {}, action: 'freeStick' };
    case 'climb': return { id: 'rClimb', p: {} };
    case 'measure': {
      if (l.obj === 'minaret') return { id: 'rMeasureMinaret', p: { shadow: l.shadow, hour: HOURS[l.hour] } };
      if (l.sameHour === 2) return { id: 'rTwoSameHour', p: { obj: l.obj, shadow: l.shadow, hour: HOURS[l.hour] } };
      return { id: 'rMeasured', p: { obj: l.obj, shadow: l.shadow, hour: HOURS[l.hour] } };
    }
    case 'install': {
      const q = l.pred;
      const p = { obj: q.obj, H: q.H, p: q.p, truth: q.truth, gap: q.gap, hour: HOURS[q.hour], add: q.additiveValue - q.H };
      if (q.kind === 'right') return { id: q.discriminating ? 'rPredRight' : 'rPredLucky', p };
      return { id: `rPred_${q.kind}`, p };
    }
    case 'rule': {
      const t = l.trial;
      const bad = t.fits.find((f) => !f.ok);
      const good = t.fits.find((f) => f.ok);
      const p = { op: t.op, num: t.num, hour: HOURS[t.hour], obj: bad?.obj, okObj: good?.obj, pred: bad?.pred, truth: bad?.truth, H: bad?.H };
      if (t.allFit && t.op === '+') return { id: 'rRulePlusFits', p };
      if (t.allFit && fittingRules(s).length >= 2) return { id: 'rRuleFitsAgain', p };
      if (t.allFit) return { id: 'rRuleFits', p };
      if (t.okCount > 0) return { id: 'rRulePartial', p };
      return { id: 'rRuleNone', p };
    }
    case 'answer': {
      const a = l.a;
      return { id: `rAns_${a.kind}`, p: { h: a.h, S: a.S, hour: a.hour ? HOURS[a.hour] : '', refHour: a.refHour != null ? HOURS[a.refHour] : '', obj: a.obj, d: a.d, x: a.x } };
    }
    case 'answerInvalid': return { id: 'rAnsInvalid', p: {} };
    case 'quiz': {
      const v = l.verdict;
      if (l.correctPick) return { id: `qRight_${l.quizId}`, p: v };
      return { id: `qWrong_${l.quizId}`, p: v };
    }
    default: return null;
  }
}

/** La question de fond du compagnon quand rien ne vient de se passer : ce que l'élève pourrait chercher maintenant. */
export function guide(s, phase = {}) {
  const goal = currentGoal(s, phase);
  if (goal.startsWith('quiz_')) {
    const quizId = goal.slice('quiz_'.length);
    return { id: `q_${quizId}`, p: QUIZZES[quizId](s) ?? {} };
  }
  return { id: `g_${goal}`, p: { H: nextInstall(s) ? heightOf(s, nextInstall(s)) : 0, obj: nextInstall(s) ?? '' } };
}

/**
 * « ساعدني يا مقران » : trois paliers par objectif, du plus ouvert au plus guidé — toujours une QUESTION que l'élève
 * tranche lui-même avec ses propres mesures (aucun palier ne donne k ni la hauteur de la minaret).
 */
export function help(s, level, phase = {}) {
  const goal = currentGoal(s, phase);
  const L = Math.max(1, Math.min(3, level));
  if (goal.startsWith('quiz_')) {
    const quizId = goal.slice('quiz_'.length);
    const v = QUIZZES[quizId](s);
    return { id: `hq_${quizId}_${L}`, p: v ?? {} };
  }
  const stickRow = s.notebook.find((r) => r.obj === 'stick' && r.hour === s.hour);
  const faridRow = s.notebook.find((r) => r.obj === 'farid' && r.hour === s.hour);
  const lastRule = s.rules.at(-1);
  let variant = '';
  if (goal === 'rule' && lastRule && lastRule.op === '+' && !lastRule.allFit) variant = 'Plus';
  if (goal === 'rule2' && s.rule && s.rule.hour === s.hour) variant = 'Same';
  return {
    id: `h_${goal}${variant}_${L}`,
    p: {
      hour: HOURS[s.hour],
      stick: stickRow ? stickRow.shadow : null,
      farid: faridRow ? faridRow.shadow : null,
      H: nextInstall(s) ? heightOf(s, nextInstall(s)) : 0,
      obj: nextInstall(s) ?? '',
      ruleHour: s.rule ? HOURS[s.rule.hour] : '',
    },
  };
}

/* ── la preuve envoyée à la leçon (`onTrial`) ──────────────────────────── */

export function evidenceOf(s) {
  const l = s.last;
  if (!l) return null;
  switch (l.kind) {
    case 'measure': return { stage: 'measure', obj: l.obj, hour: HOURS[l.hour], shadow: m(l.shadow) };
    case 'install': return { stage: 'predict', obj: l.pred.obj, hour: HOURS[l.pred.hour], p: m(l.pred.p), truth: m(l.pred.truth), kind: l.pred.kind };
    case 'rule': return { stage: 'rule', hour: HOURS[l.trial.hour], op: l.trial.op, num: m(l.trial.num), allFit: l.trial.allFit };
    case 'stick': return l.meet ? { stage: 'meet', hour: HOURS[s.hour], d: m(l.x), O: m(minaretTip(s)) } : null;
    case 'answer': return { stage: 'answer', h: m(l.a.h), kind: l.a.kind };
    default: return null;
  }
}

/* ── la géométrie de la scène (pure, testée) ───────────────────────────── */

/**
 * Pixels, y vers le bas. Vue de côté « en couloirs » : chaque couloir est une bande de sol un peu plus bas que le
 * précédent (le fond de la place en haut). LE SOLEIL EST SUR LE RAYON QUI PASSE PAR M (le sommet de la minaret),
 * prolongé derrière elle : il pivote autour de M sur un arc de rayon constant — le rayon (O, M) le traverse
 * toujours, et tous les autres rayons lui sont parallèles. Le ciel derrière la minaret (xMin = −4 m) lui fait place.
 */
export function layout({ width, height, minaret }) {
  const pad = 8;
  const spanM = (WORLD.xMax - WORLD.xMin) / 100;
  const laneGapFor = (k) => Math.max(9, Math.min(18, k * 0.75));
  const tallM = Math.max(minaret / 100, 7.25);
  const head = (k) => 22 + tallM * 0.3 * k; // le ciel au-dessus de M, où le soleil se promène
  const fit = (kk) => head(kk) + tallM * kk + (LANES - 1) * laneGapFor(kk) + 32;
  let k = (width - 2 * pad) / spanM;
  if (fit(k) > height) {
    let lo = 4; let hi = k;
    for (let n = 0; n < 30; n += 1) { const mid = (lo + hi) / 2; if (fit(mid) > height) hi = mid; else lo = mid; }
    k = lo;
  }
  const laneGap = laneGapFor(k);
  const sceneW = spanM * k + 2 * pad;
  const x0 = (width - sceneW) / 2 + pad - (WORLD.xMin / 100) * k;
  const yBack = head(k) + tallM * k;
  const yLane = (l) => yBack + l * laneGap;
  const X = (cm) => x0 + (cm / 100) * k;
  const Y = (lane, cm) => yLane(lane) - (cm / 100) * k;
  const totalH = yLane(LANES - 1) + 32;
  const M = { x: X(0), y: Y(0, minaret) };
  const margin = 16;
  const eOf = (kk) => Math.atan(1 / kk);
  const eHi = eOf(K25[0] / 25); const eLo = eOf(K25[K25.length - 1] / 25);
  let R = Infinity;
  for (let n = 0; n <= 20; n += 1) {
    const e = eLo + ((eHi - eLo) * n) / 20;
    R = Math.min(R, (M.x - X(WORLD.xMin) + pad - margin) / Math.cos(e), (M.y - margin) / Math.sin(e));
  }
  R = Math.max(24, R);
  const sunAt = (kk) => { const e = eOf(kk); return { x: M.x - R * Math.cos(e), y: M.y - R * Math.sin(e), e }; };
  return { k, laneGap, X, Y, yLane, yBack, width, height: totalH, sunAt, M, R };
}

/** Du point (pointeur) à l'heure continue t ∈ [0, 7] : l'élévation lue autour de M (le soleil pivote sur M). */
export function hourFromPoint(G, px, py) {
  const e = Math.atan2(Math.max(0.5, G.M.y - py), Math.max(0.5, G.M.x - px));
  const kk = 1 / Math.tan(e);
  if (kk <= K25[0] / 25) return 0;
  for (let i = 0; i < HOURS.length - 1; i += 1) {
    const a = K25[i] / 25; const b = K25[i + 1] / 25;
    if (kk <= b) return i + (kk - a) / (b - a);
  }
  return HOURS.length - 1;
}
