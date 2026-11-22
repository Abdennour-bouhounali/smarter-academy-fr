import * as E from './eliminationCards.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as LS from '@smarter-academy/core/arithmetic/linearSystem.js';

/**
 * La logique PURE du LECTEUR DE MISSION de `elimination-cards` (rollout 2026-11-12, unité 5 leçon 2 `hall-jabri` ; conseil du 2026-11-11, verdict
 * « L2 » + X7 + X11 « règle P »). `logic/eliminationCards.js` (la page, l'enseignant, le mode classe) n'est PAS touché : tout ce qui suit est AJOUTÉ ici.
 *
 *   UN ESSAI = un geste qui ÉCRIT une ligne NOUVELLE (l'expression portée sur l'autre carte, les cartes posées l'une sur l'autre, la valeur portée
 *   sur une carte de départ) OU un refus COMPTÉ (`REFUSALS` : la même carte, la mauvaise inconnue, rien ne s'annule, tout s'annule) ; isoler,
 *   multiplier (× k), révéler une ligne, × 0 et les gardes d'interface ne sont PAS des essais ; le même refus deux fois dans le même état non plus ;
 *   le PREMIER refus compté de la manche est gratuit (le composant le marque `free`).
 *   Les SUITES (`CHAIN_SPECS`) : BÂTIR « ▢ = ▢ » à l'étape à une inconnue (une fois PAR MÉTHODE : `build-sub`, `build-add` — verdict L2.7), la
 *   ثنائية quand la première méthode finit, puis LA RÈGLE (r2) ou LE CHOIX de la méthode (r3) quand les deux méthodes ont donné la même ثنائية.
 *   Le LEURRE de la construction suit le CHEMIN de l'élève (règle P, X11) : cartes posées sans multiplicateur → le signe perdu (c₁ − c₂) ; après × k →
 *   un seul membre multiplié ; substitution sur un coefficient POSITIF ≥ 2 → le paquet sans parenthèses (seul le PREMIER terme imprimé multiplié) ;
 *   coefficient 1, ou NÉGATIF (le chemin « moins » de l'élève, jamais refusé) → la transposition fausse `a·u = c + own·m`.
 *   `subPaths(src)` : les chemins de substitution d'une jumla ; un chemin « plus » isole une inconnue en ENTIERS et la porte sur un coefficient POSITIF.
 *   `shownValues(props)` liste TOUT ce qu'un écran d'une manche peut montrer, avec son rôle, pour le balayage « valeurs interdites par rôle »
 *   (content/forbidden.js de la leçon).
 */

const { frac, mul, add, sub, neg, cmp, isZero, isInteger, eq } = Lin;
const coefOf = (e, v) => (v === 'x' ? e.a : e.b);

const REFUSALS = Object.freeze(['sameCard', 'wrongUnknown', 'noCancel', 'both']);
/** Un refus qui compte comme un essai (« zero », « notNow », « noUnknownHere », « scaleRange », « noOther » sont des gardes, pas des idées). */
export const isRefusal = (reason) => REFUSALS.includes(reason);

/** Une écriture TeX ramenée à sa forme nue : sans espaces, « − » → « - ». */
const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-');

/** La clé d'un état (pour reconnaître le même refus deux fois dans le même état). */
export const stateKey = (lab) => `${lab.stage}|${lab.scale[1]}|${lab.scale[2]}|${lab.expr ? `${lab.expr.from}${lab.expr.v}` : ''}`;

/**
 * Le geste qui vient d'écrire une ligne (null si aucun) : 'substitute' | 'sum' (cartes → une inconnue) ou 'back' (la valeur portée → la ثنائية).
 * Sa clé (`sig`) distingue la méthode : la même ligne écrite par l'autre méthode est un autre essai.
 */
export function trialOf(prev, next) {
  if (prev.stage === 'cards' && next.stage === 'one') {
    const kind = next.method === 'sub' ? 'substitute' : 'sum';
    return { kind, sig: `${next.method}:${kind}:${bare(next.lines.at(-1)?.tex ?? '')}` };
  }
  if (prev.stage === 'back' && next.stage === 'done') return { kind: 'back', sig: `${next.method}:back:${bare(next.lines.at(-1)?.tex ?? '')}` };
  return null;
}

/** La découverte d'une manche : `methods` méthodes terminées (1 : l'une ou l'autre ; 2 : les deux, même ثنائية). */
export function discoveredFor(lab, methods = 1) {
  if (methods >= 2) return E.discoveryReady(lab);
  return Boolean(lab.methodsDone.sub || lab.methodsDone.add);
}
export const methodsCount = (lab) => Number(Boolean(lab.methodsDone.sub)) + Number(Boolean(lab.methodsDone.add));

// ── les chemins de substitution (règle P, X11 › P2) ─────────────────────────

/**
 * Chaque chemin de substitution d'une jumla : isoler `v` de la carte `from` (v = k·u + m), puis le porter sur la carte `into`, où `v` a le
 * coefficient `own`. `integer` : k et m entiers ; `plus` : entier ET `own` > 0 (le « chemin plus » : aucun moins devant la parenthèse).
 */
export function subPaths(src) {
  const sys = E.parseSystem(src);
  const out = [];
  [1, 2].forEach((from) => ['x', 'y'].forEach((v) => {
    const e = sys[from - 1];
    if (isZero(coefOf(e, v))) return;
    const { k, m } = LS.isolate(e, v);
    const into = from === 1 ? 2 : 1;
    const own = coefOf(sys[into - 1], v);
    if (isZero(own)) return;
    const integer = isInteger(k) && isInteger(m);
    out.push({ from, v, into, k, m, own, integer, plus: integer && cmp(own, 0) > 0 });
  }));
  return out;
}
export const plusPaths = (src) => subPaths(src).filter((p) => p.plus);

/** Joue un chemin de substitution jusqu'à l'étape à une inconnue (le labo réel : isolateFrom puis substituteInto). */
export function playSubstitution(src, path) {
  return E.substituteInto(E.isolateFrom(E.init(src), path.from, path.v), path.into);
}
/** Joue le chemin des cartes posées : `scales` = { 1: k₁, 2: k₂ } puis la carte 1 posée sur la 2. */
export function playStack(src, scales = { 1: 1, 2: 1 }) {
  let lab = E.init(src);
  lab = E.setScale(lab, 1, scales[1]);
  lab = E.setScale(lab, 2, scales[2]);
  return E.canStack(lab, 1, 2) === true ? E.stack(lab, 1, 2) : null;
}
/** Révèle toutes les lignes de l'étape à une inconnue, puis porte la valeur sur la carte `n`. */
export function finish(lab, n = 1) {
  let l = lab;
  while (l.stage === 'one') l = E.solveStep(l);
  return E.canBack(l, n) === true ? E.backSubstitute(l, n) : E.backSubstitute(l, n === 1 ? 2 : 1);
}

// ── BÂTIR « ▢ = ▢ » : l'équation à une inconnue, UN leurre par chemin ───────

const uSide = (u, a) => (u === 'x' ? { a, b: frac(0) } : { a: frac(0), b: a });

/**
 * La construction à l'étape « one » : `expected` = [premier membre, second membre] de l'équation à une inconnue (« 5x », « 15 »), `decoy` = l'erreur
 * classique du CHEMIN pris (`kind` : 'signLost' · 'oneSide' · 'noBracket' · 'transposition'), `tiles` = les deux bonnes et le leurre.
 */
export function buildSpec(lab) {
  if (lab.stage !== 'one' || !lab.one) return null;
  const dec = lab.decimal;
  const { u, a, c } = lab.one;
  const left = E.leftTex(uSide(u, a), dec);
  const right = E.numTex(c, dec);
  let kind;
  let dLeft = left;
  let dRight = right;
  if (lab.method === 'add') {
    const scaled = lab.scale[1] !== 1 || lab.scale[2] !== 1;
    const c1 = E.card(lab, 1).c; const c2 = E.card(lab, 2).c;
    kind = scaled ? 'oneSide' : 'signLost';
    dRight = E.numTex(scaled ? add(lab.sys[0].c, lab.sys[1].c) : sub(c1, c2), dec);
  } else {
    const { expr } = lab;
    const into = lab.lines.find((l) => l.key === 'substitute')?.n ?? (expr.from === 1 ? 2 : 1);
    const e = E.card(lab, into);
    const own = coefOf(e, expr.v);
    const oth = coefOf(e, u);
    const ownAbs = cmp(own, 0) < 0 ? neg(own) : own;
    const transposition = () => { kind = 'transposition'; dLeft = left; dRight = E.numTex(add(e.c, mul(own, expr.m)), dec); };
    if (cmp(own, 0) < 0 || eq(ownAbs, 1) || isZero(expr.m)) transposition();
    else if (cmp(expr.k, 0) > 0) {
      // le paquet s'imprime « k·u + m » : seul k·u est multiplié, m reste tel quel
      kind = 'noBracket'; dRight = E.numTex(sub(e.c, expr.m), dec);
    } else {
      // le paquet s'imprime « m − |k|·u » : seul m est multiplié, le terme en u garde son coefficient k
      const a2 = add(oth, expr.k);
      if (isZero(a2) || eq(a2, a)) transposition();
      else { kind = 'noBracket'; dLeft = E.leftTex(uSide(u, a2), dec); }
    }
  }
  if (bare(dLeft) === bare(left) && bare(dRight) === bare(right)) { kind = 'signFlip'; dRight = E.numTex(neg(c), dec); }
  const decoy = bare(dLeft) !== bare(left) ? dLeft : dRight;
  return { kind, left, right, decoy, decoySide: decoy === dLeft && bare(dLeft) !== bare(left) ? 'left' : 'right', expected: [left, right], tiles: [left, right, decoy], line: `${dLeft} = ${dRight}` };
}

/** Le premier geste « à observer » de la manche 1 (`see`) : les termes annulés, ou ce qui remplace chaque tuile. */
export function seeSpec(lab) {
  const dec = lab.decimal;
  if (lab.method === 'add' && lab.pairs) {
    const c = lab.pairs.coef;
    const twice = mul(c, 2);
    const t = `${eq(twice, 1) ? '' : E.numTex(twice, dec)}${lab.pairs.v}`;
    return { kind: 'add', v: lab.pairs.v, right: '0', options: ['0', t, `-${t}`] };
  }
  if (lab.method === 'sub' && lab.expr) {
    const u = E.other(lab.expr.v);
    return { kind: 'sub', v: lab.expr.v, n: lab.lines.find((l) => l.key === 'substitute')?.n, bundle: `(${E.exprTex(lab.expr, u, dec)})`, m: E.numTex(lab.expr.m, dec), right: 'bundle', options: ['bundle', 'number', 'same'] };
  }
  return null;
}

// ── les suites (CHAIN_SPECS) ─────────────────────────────────────────────────

const atOne = (method) => (lab) => lab.stage === 'one' && (!method || lab.method === method);
const atDone = (lab) => lab.stage === 'done' && Boolean(lab.result);
const atBoth = (lab) => atDone(lab) && E.discoveryReady(lab);

/** Chaque suite du lecteur : { id, reached(lab), qs }. L'id est le point d'étape de la manche (`{ checkpoint: id }`). */
const CHAIN_SPECS = Object.freeze({
  r1: [
    { id: 'build', reached: atOne(null), qs: ['see', 'build'] },
    { id: 'pair', reached: atDone, qs: ['pair'] },
  ],
  r2: [
    { id: 'build-sub', reached: atOne('sub'), qs: ['build'] },
    { id: 'build-add', reached: atOne('add'), qs: ['build'] },
    { id: 'pair', reached: atDone, qs: ['pair'] },
    { id: 'rule', reached: atBoth, qs: ['rule'] },
  ],
  r3: [
    { id: 'build-sub', reached: atOne('sub'), qs: ['build'] },
    { id: 'build-add', reached: atOne('add'), qs: ['build'] },
    { id: 'pair', reached: atDone, qs: ['pair'] },
    { id: 'choose', reached: atBoth, qs: ['choose'] },
  ],
  none: [],
});
export const chainsOf = (name) => CHAIN_SPECS[name] ?? [];
/** Les ids de suite qu'une manche DOIT voir finies (son but) — les ids, dans l'ordre. */
export const chainIds = (name) => chainsOf(name).map((sp) => sp.id);
/** La suite « build » de la méthode en cours a-t-elle déjà été répondue ? (le bouton « السطر التالي » attend la construction) */
export const buildIdFor = (name, method) => chainsOf(name).find((sp) => sp.qs.includes('build') && sp.reached({ stage: 'one', method }))?.id ?? null;

// ── les prédictions ──────────────────────────────────────────────────────────

export const PREDICT_KEYS = Object.freeze(['vanish', 'samePair', 'multiplier']);

/** Le multiplicateur de la carte (2) qui rend les coefficients de y OPPOSÉS à ceux de la carte (1) (null s'il n'est pas entier). */
function yMultiplier(src) {
  const [e1, e2] = E.parseSystem(src);
  if (isZero(e2.b)) return null;
  const k = Lin.div(neg(e1.b), e2.b);
  return isInteger(k) ? k.n : null;
}

/** Les options d'une prédiction, dans l'ordre de l'écran : { says, n? } (`n` un nombre, sinon `says` est une clé i18n). */
export function predictOptions(src, key) {
  if (key === 'vanish') return [{ says: 'x' }, { says: 'y' }, { says: 'none' }];
  if (key === 'samePair') return [{ says: 'yes' }, { says: 'no' }];
  if (key === 'multiplier') {
    const k = yMultiplier(src);
    if (k == null) return [];
    return [k, -k, k - 1].map((n) => ({ says: String(n), n }));
  }
  return [];
}

/** La vérité d'une prédiction, calculée sur les cartes de DÉPART de la manche. */
export function predictTruth(src, key) {
  if (key === 'vanish') {
    const { gone } = E.stackSum(E.init(src));
    return gone === 'x' || gone === 'y' ? gone : 'none';
  }
  // deux chemins justes mènent à LA solution unique de la jumla : toujours la même ثنائية
  if (key === 'samePair') return 'yes';
  if (key === 'multiplier') return String(yMultiplier(src));
  return null;
}

/**
 * Le moment où la prédiction se POSE : avant le premier geste (`vanish`, `multiplier`), ou quand la première méthode est finie et sa ثنائية
 * répondue (`samePair`). `ctx` : { untouched, pairDone }.
 */
export function predictAsked(lab, key, ctx = {}) {
  if (key === 'samePair') return lab.stage === 'done' && methodsCount(lab) === 1 && Boolean(ctx.pairDone);
  return Boolean(ctx.untouched);
}
/** La prédiction est-elle JUGÉE (l'événement dont elle parle a eu lieu) ? `ctx` : { stackTried, stackDone }. */
function predictJudged(lab, key, ctx = {}) {
  if (key === 'vanish') return Boolean(ctx.stackTried);
  if (key === 'multiplier') return Boolean(ctx.stackDone);
  if (key === 'samePair') return E.discoveryReady(lab);
  return false;
}
export const judgedPredictions = (lab, keys, ctx) => keys.filter((key) => predictJudged(lab, key, ctx));

// ── le guide (LabCoach) ──────────────────────────────────────────────────────

/**
 * La prochaine aide du guide — le GESTE, jamais la réponse : il ne nomme ni une inconnue, ni une carte, ni un multiplicateur, et ne montre aucun
 * groupe de tuiles. `ctx` : { done, started, refusedStack, scaleCard, buildDone, otherReady }. Ancres `[data-coach="…"]`.
 */
export function coachOf(lab, ctx = {}) {
  if (ctx.done) return null;
  if (lab.stage === 'cards') {
    if (lab.expr) return { id: 'carry', target: '[data-coach="expr"]', gesture: 'drag', prefer: 'below', noFlip: true };
    if (ctx.refusedStack) return { id: 'scale', target: `[data-coach="scale-${ctx.scaleCard ?? 2}"]`, gesture: 'drag', prefer: 'below' };
    if (!ctx.started) return { id: 'start', target: '[data-coach="tray"]', gesture: 'drag', prefer: 'below', noFlip: true };
    return null;
  }
  if (lab.stage === 'one') return ctx.buildDone ? { id: 'next', target: '[data-coach="next"]', gesture: 'tap', prefer: 'above' } : null;
  // valeur à porter : AUCUNE bulle — au-dessus elle couvrait la pastille de la valeur, au-dessous les deux cibles (walk 2026-11-12, 1024 px) ;
  // la colonne dit le fait et la phrase « احمل القيمة إلى إحدى البطاقتين » est écrite au-dessus de la pastille
  if (lab.stage === 'back') return null;
  if (lab.stage === 'done' && ctx.otherReady) return { id: 'other', target: '[data-coach="other"]', gesture: 'tap', prefer: 'above' };
  return null;
}

// ── le balayage « valeurs interdites par rôle » ──────────────────────────────

const Rl = (role, v) => ({ role, v: String(v) });
const SCALES = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];

/**
 * TOUT ce qu'un écran d'une manche peut montrer, avec son rôle : chaque carte à chaque multiplicateur (`eq`) et sa valeur (`const`), chaque somme
 * de cartes posées (`eq`, une somme refusée comprise), chaque expression isolée (`iso`), chaque ligne écrite d'une substitution ou d'une addition
 * (`eq`), ce que donnerait l'expression sur sa propre carte (`eq`), chaque valeur trouvée (`value`), chaque ثنائية et sa permutée (`pair`), les
 * vérifications (`eq`), les tuiles et le leurre de la construction (`tile`, `decoy`), les options des prédictions (`predict`).
 * `props` : { system, chains, predict, choices }.
 */
export function shownValues(props) {
  const systems = props.choices?.length ? props.choices : [props.system];
  return systems.flatMap((src) => shownOne(src, props));
}

function collectLab(out, lab) {
  lab.lines.forEach((l) => out.push(Rl('eq', bare(l.tex))));
  (lab.one?.pending ?? []).forEach((l) => out.push(Rl('eq', bare(l.tex))));
}

function shownOne(src, props) {
  const out = [];
  const base = E.init(src);
  const dec = base.decimal;
  const chained = chainsOf(props.chains).some((sp) => sp.qs.includes('build'));
  SCALES.forEach((k1) => SCALES.forEach((k2) => {
    let lab = E.setScale(E.setScale(base, 1, k1), 2, k2);
    [1, 2].forEach((n) => { const e = E.card(lab, n); out.push(Rl('eq', bare(E.eqTex(e, dec))), Rl('const', E.numText(e.c, dec))); });
    const { sum } = E.stackSum(lab);
    out.push(Rl('eq', bare(E.eqTex(sum, dec))));
    const roads = [];
    if (E.canStack(lab, 1, 2) === true) roads.push(E.stack(lab, 1, 2));
    [1, 2].forEach((n) => ['x', 'y'].forEach((v) => {
      if (E.canIsolate(lab, n, v) !== true) return;
      const iso = E.isolateFrom(lab, n, v);
      out.push(Rl('iso', bare(E.exprLine(iso))));
      const same = E.sameCardDetails(iso);
      out.push(Rl('eq', bare(same.line)), Rl('eq', bare(same.identity)));
      const into = n === 1 ? 2 : 1;
      if (E.canSubstitute(iso, into, v) === true) roads.push(E.substituteInto(iso, into));
    }));
    roads.forEach((one) => {
      collectLab(out, one);
      if (chained) { const b = buildSpec(one); b.tiles.forEach((t) => out.push(Rl('tile', bare(t)))); out.push(Rl('decoy', bare(b.decoy)), Rl('eq', bare(b.line))); }
      if (props.chains === 'r1') { const s = seeSpec(one); if (s) out.push(...(s.kind === 'add' ? s.options : [s.bundle, s.m]).map((t) => Rl('tile', bare(t)))); }
      [1, 2].forEach((n) => {
        const done = finish(one, n);
        collectLab(out, done);
        out.push(Rl('value', E.numText(done.result.x)), Rl('value', E.numText(done.result.y)));
        out.push(Rl('pair', `(${E.numText(done.result.x)};${E.numText(done.result.y)})`), Rl('pair', `(${E.numText(done.result.y)};${E.numText(done.result.x)})`));
        E.checkLines(done).forEach((c) => out.push(Rl('eq', bare(c.tex))));
      });
    });
  }));
  (props.predict ?? []).forEach((key) => predictOptions(src, key).forEach((o) => { if (o.n != null) out.push(Rl('predict', o.n)); }));
  return out;
}
