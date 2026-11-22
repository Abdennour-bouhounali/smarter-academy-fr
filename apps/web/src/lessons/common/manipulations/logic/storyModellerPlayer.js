import * as L from './storyModeller.js';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';

/**
 * story-modeller — LA LOGIQUE PURE DU LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 3 `mushkilat-jumla` ; conseil du 2026-11-11, verdict
 * L3.1–L3.16). Lue par `systems/StoryModellerPlayer.jsx` seulement : la page, l'enseignant, le mode classe et la synthèse
 * (`wadiya-idmajiya-jumal`) ne l'appellent pas — `logic/storyModeller.js` est INCHANGÉ, tout ce qui suit est AJOUTÉ ici. Aucun texte arabe.
 *
 *   UN ESSAI = une histoire REJOUÉE avec une affectation des valeurs NOUVELLE dans la manche (`trialKey`) ; `exact` = les deux informations se
 *   vérifient avec les valeurs posées (`trialExact`) — sur une histoire IMPOSSIBLE c'est le moment où l'histoire refuse. La même affectation
 *   rejouée n'est pas un essai. Une vérification de la traduction est un événement de MODÈLE (`roundsModel › tk: 'model'`, clé `modelKey`).
 *   Les SUITES (`CHAIN_SPECS`) : un point d'étape par moment de la manche, l'id du point est le but de la manche (`{ checkpoint: id }`).
 *   Les PRÉDICTIONS (`dearer`, `which`) : vérité CALCULÉE, jugée par le geste qui la tranche.
 *   `shownValues(props)` : TOUT ce qu'un écran d'une manche peut montrer, avec son rôle (balayage « valeurs interdites par rôle »).
 */

/** Le départ du lecteur : celui de la page, et (`onesPlaced`) les deux « 1 » déjà posés dans le rang qui COMPTE (verdict L3.14). */
export function playerInit(model, { named = false, onesPlaced = false } = {}) {
  const lab = L.init(model, { named });
  return onesPlaced ? placeOnes(lab, model) : lab;
}

/** Le rang de l'information qui compte (1 ou 2), 0 s'il n'y en a pas. */
export const countRow = (model) => model.facts.findIndex((f) => f.kind === 'count') + 1;
/** Le rang de l'information d'argent (1 ou 2), 0 s'il n'y en a pas. */
export const moneyRow = (model) => model.facts.findIndex((f) => f.kind === 'money') + 1;

/** Les deux « 1 » du rang qui compte (les cases a et b), le second membre vide. */
function placeOnes(lab, model) {
  const r = countRow(model);
  if (!r) return lab;
  return { ...lab, slots: { ...lab.slots, [r]: { ...lab.slots[r], a: L.ONE, b: L.ONE } } };
}

/** « أعِد التجربة » d'une étape du lecteur : celle de la page, et les « 1 » reposés quand la traduction repart de vide. */
export function retryPlayerStage(lab, model, { onesPlaced = false } = {}) {
  const next = L.retryStage(lab, model);
  return onesPlaced && lab.stage === 'model' ? placeOnes(next, model) : next;
}

/** L'empreinte d'une traduction (les jetons posés + les lettres) : la même traduction vérifiée deux fois = un seul événement `model`. */
export const modelKey = (lab) => `${Object.entries(lab.naming).map(([k, v]) => `${k}:${v}`).join(',')}|${[1, 2].map((r) => L.SLOTS.map((s) => lab.slots[r][s] ?? '_').join(',')).join('/')}`;

/** Les clés des jetons « muets » (un nombre de l'histoire qu'aucune information ne relie aux inconnues — verdict L3.4). */
export const uselessKeys = (chips) => (chips ?? []).map((c, i) => (c.useless ? `c${i}` : null)).filter(Boolean);

/**
 * La raison d'un rang refusé, vue par le lecteur : celle de la page (`checkRow`), sauf quand le rang porte un jeton muet — la raison
 * `unused` (« «8 أيام» لا تذكره المعلومة ») avant toute autre : c'est le nombre en trop qui rend le rang faux.
 */
function playerRowVerdict(lab, model, row, useless = []) {
  const v = L.checkRow(lab, model, row);
  if (v.ok) return v;
  const s = L.SLOTS.find((sl) => useless.includes(lab.slots[row][sl]));
  return s ? { ok: false, reason: 'unused', slot: s, chip: lab.slots[row][s] } : v;
}

/** « تحقّق » dans le lecteur : la page (`checkModel`), avec la raison `unused` des jetons muets. */
export function checkPlayerModel(lab, model, useless = []) {
  const next = L.checkModel(lab, model);
  if (next === lab || next.verdict.ok) return next;
  return { ...next, verdict: { ...next.verdict, rows: [1, 2].map((r) => playerRowVerdict(lab, model, r, useless)) } };
}

/* ── les essais ─────────────────────────────────────────────────────────────────────────────── */

/**
 * L'empreinte d'une histoire rejouée : quelle VALEUR sur quelle porte (`values` = les valeurs des lettres ; sans elles, les lettres) — une autre
 * traduction (retour à la traduction) donne d'autres valeurs : c'est un autre essai (revue 2026-11-12).
 */
export const trialKey = (lab, values) => Object.entries(lab.gates).map(([k, v]) => `${k}:${v}${values && v != null ? `=${L.fracText(values[v])}` : ''}`).join('|');
/** Les deux informations se vérifient-elles avec les valeurs posées ? (le verdict d'un essai, histoire possible ou non) */
export const trialExact = (replay) => Boolean(replay) && replay.facts.every((f) => f.ok);
/** L'histoire REFUSE : les deux informations se vérifient, mais une valeur ne se compte pas (négative ou fractionnaire). */
export const refused = (lab) => lab.stage === 'verify' && trialExact(lab.replay) && !lab.replay.natural.ok;
/** La découverte du labo : la phrase-réponse choisie juste, ou l'histoire qui refuse (une histoire impossible n'a pas de réponse). */
export const discovered = (lab) => L.discoveryReady(lab) || refused(lab);

/* ── les suites de questions ────────────────────────────────────────────────────────────────── */

/**
 * Les MOMENTS d'une manche (`ui` : { plan }) :
 *   typed      la ligne qui donne la première inconnue est la suivante (l'élève la TAPE avant de la voir — verdict L3.6)
 *   replayOk   l'histoire rejouée se vérifie
 *   answerOpen l'étape « الإجابة » est ouverte
 *   answered   la bonne phrase-réponse choisie
 *   refused    l'histoire refuse le couple
 */
export const MOMENTS = Object.freeze({
  typed: (lab, ui) => lab.stage === 'solve' && lab.method != null && !!ui.plan && lab.revealed === ui.plan.halfAt,
  replayOk: (lab) => lab.stage === 'verify' && !!lab.replay?.ok,
  answerOpen: (lab) => lab.stage === 'answer',
  answered: (lab) => L.discoveryReady(lab),
  refused: (lab) => refused(lab),
});

/**
 * Les suites PAR MODE de manche (verdict L3.12 : un id de point d'étape par moment ; chaque question est dans le but de sa manche) :
 *   first   (r1)     solveTyped · buildCheck (BÂTIR « a × ▢ + b × ▢ = ▢ », leurre : le nombre de la COMPTE) · answerWhy
 *   second  (r2)     solveTyped · verifySwap · buildAnswer (BÂTIR la phrase, leurre : la lettre) · rule
 *   easyFirst        answerWhy           easySecond   rule
 *   impossible (p1)  naturalTap · refuseTap · ruleNatural          impossibleEasy  ruleNatural
 *   none (⭐, libres)
 * `answerBuild` : l'étape « الإجابة » se fait en BÂTISSANT la phrase (pas de choix de phrase).
 */
const CHAIN_SPECS = Object.freeze({
  first: { specs: [{ id: 'solveTyped', at: 'typed', qs: ['solveTyped'] }, { id: 'buildCheck', at: 'replayOk', qs: ['buildCheck'] }, { id: 'answerWhy', at: 'answered', qs: ['answerWhy'] }] },
  second: { answerBuild: true, specs: [{ id: 'solveTyped', at: 'typed', qs: ['solveTyped'] }, { id: 'verifySwap', at: 'replayOk', qs: ['verifySwap'] }, { id: 'buildAnswer', at: 'answerOpen', qs: ['buildAnswer'] }, { id: 'rule', at: 'answerOpen', qs: ['rule'] }] },
  easyFirst: { specs: [{ id: 'answerWhy', at: 'answered', qs: ['answerWhy'] }] },
  easySecond: { specs: [{ id: 'rule', at: 'answered', qs: ['rule'] }] },
  impossible: { specs: [{ id: 'naturalTap', at: 'refused', qs: ['naturalTap'] }, { id: 'refuseTap', at: 'refused', qs: ['refuseTap'] }, { id: 'ruleNatural', at: 'refused', qs: ['ruleNatural'] }] },
  impossibleEasy: { specs: [{ id: 'ruleNatural', at: 'refused', qs: ['ruleNatural'] }] },
  none: { specs: [] },
  // la synthèse de l'unité 5 `wadiya-idmajiya-jumal` (2026-11-12, AJOUTÉ) — deux informations d'ARGENT, la première aux deux quantités ÉGALES :
  //   synthTrip  (« رحلة القسم », à la main)  solveTyped · verifySwap (l'échange PASSE l'information aux quantités égales) · buildAnswer
  //   synthParty (« حفل المدرسة » et son entraînement)  buildSum : BÂTIR « k × (▢ + ▢) = ▢ » une fois la réponse choisie (leurre : S ÷ k)
  synthTrip: { answerBuild: true, specs: [{ id: 'solveTyped', at: 'typed', qs: ['solveTyped'] }, { id: 'verifySwap', at: 'replayOk', qs: ['verifySwap'] }, { id: 'buildAnswer', at: 'answerOpen', qs: ['buildAnswer'] }] },
  synthParty: { specs: [{ id: 'buildSum', at: 'answered', qs: ['buildSum'] }] },
});
export const chainsOf = (mode) => CHAIN_SPECS[mode] ?? CHAIN_SPECS.none;
/** La manche fait-elle TAPER la première inconnue ? */
export const typesFirst = (mode) => chainsOf(mode).specs.some((s) => s.id === 'solveTyped');
/** La suite due maintenant : la première dont le moment est atteint et qui n'est pas finie (dans l'ordre du mode). */
export function pendingSpec(mode, lab, ui, doneIds) {
  return chainsOf(mode).specs.find((s) => MOMENTS[s.at](lab, ui) && !doneIds.includes(s.id)) ?? null;
}
/** Une suite du mode bloque-t-elle encore un moment ATTEINT ? (le bouton qui passe à la suite reste caché) */
export const momentBlocked = (mode, lab, ui, doneIds, at) => chainsOf(mode).specs.some((s) => s.at === at && MOMENTS[at](lab, ui) && !doneIds.includes(s.id));

/* ── les questions, en nombres (le texte est dans la vue) ───────────────────────────────────── */

/**
 * BÂTIR la vérification de l'information d'ARGENT avec les valeurs de l'élève (verdict L3.11) : « a × ▢ + b × ▢ = ▢ » — les nombres de
 * l'histoire, les valeurs dans l'ordre des inconnues de l'histoire ; un SEUL leurre : le total de l'information qui COMPTE (le nombre de
 * crayons pris pour l'argent). `null` si l'histoire n'a pas une information qui compte et une d'argent.
 */
export function checkBuild(model, values) {
  const mr = moneyRow(model); const cr = countRow(model);
  if (!mr || !cr) return null;
  const e = model.target[mr - 1];
  const [u0, u1] = model.ids;
  const t = (v) => L.numberText(v);
  const expected = [t(values[u0]), t(values[u1]), t(e.c)];
  const decoy = t(model.target[cr - 1].c);
  return { a: t(e.a), b: t(e.b), expected, decoy, tiles: [...expected, decoy], distinct: new Set([...expected, decoy]).size === 4 };
}

/**
 * Le rang de l'information d'ARGENT dont les deux quantités sont ÉGALES et plus grandes que 1 (« 120 علبة عصير و 120 قطعة حلوى بـ 8400 دج » —
 * la synthèse de l'unité 5), 0 s'il n'y en a pas. Une information qui COMPTE (x + y = n) n'en est jamais une.
 */
export function equalRow(model) {
  const i = model.facts.findIndex((f, r) => {
    const e = model.target[r];
    return f.kind === 'money' && e && LIN.eq(e.a, e.b) && LIN.cmp(e.a, 1) > 0;
  });
  return i + 1;
}

/**
 * BÂTIR l'information aux quantités égales avec les valeurs de l'élève (synthèse de l'unité 5, 2026-11-12) : « k × (▢ + ▢) = ▢ » — les deux
 * prix dans l'ordre des inconnues de l'histoire, puis le montant ; un SEUL leurre : S ÷ k, la somme des deux prix prise pour le montant (le
 * facteur k oublié). `null` sans information aux quantités égales.
 */
export function sumBuild(model, values) {
  const r = equalRow(model);
  if (!r) return null;
  const e = model.target[r - 1];
  const [u0, u1] = model.ids;
  const t = (v) => L.numberText(v);
  const expected = [t(values[u0]), t(values[u1]), t(e.c)];
  const decoy = t(LIN.div(e.c, e.a));
  return { row: r, k: t(e.a), sum: decoy, expected, decoy, tiles: [...expected, decoy], distinct: new Set([...expected, decoy]).size === 4 };
}

/** Les valeurs des deux inconnues de l'HISTOIRE (dans l'ordre `model.ids`), quelle que soit la façon dont l'élève les a nommées. */
export const storyValues = (lab, plan, model) => Object.fromEntries(model.ids.map((id) => [id, plan.values[lab.naming[id]]]));

/** « أيّ قيمة لا يمكن أن تكون عددًا لـ… ؟ » : les deux valeurs (par lettre) et « لا شيء » ; la bonne est CALCULÉE par le rejeu. */
export function naturalChoice(lab) {
  const r = lab.replay;
  const ids = Object.keys(lab.gates);
  const bad = r.natural.bad[0] ?? null;
  return { options: [...ids.map((id) => ({ id, letter: lab.gates[id], v: r.values[id] })), { id: 'none' }], right: bad ?? 'none' };
}

/* ── les prédictions ────────────────────────────────────────────────────────────────────────── */

export const PREDICT_KEYS = Object.freeze(['dearer', 'which']);
/**
 * Les options d'une prédiction (des clés ; le texte est dans la vue), dans un ordre tournant `pos` (la bonne place varie d'une manche à l'autre) :
 *   dearer  « قبل الحل: أيّهما أغلى؟ » — l'inconnue 0, l'inconnue 1, « الثمن نفسه »
 *   which   « بعد الحلّ، هل يقبل الدفتر العددين؟ » — « يقبلهما معًا », « يرفض » l'inconnue 0, « يرفض » l'inconnue 1
 */
export function predictOptions(model, key, pos = 0) {
  const [u0, u1] = model.ids;
  const set = key === 'dearer' ? [u0, u1, 'same'] : key === 'which' ? ['both', u0, u1] : [];
  return set.map((_, i) => set[(i + pos) % set.length]);
}
/** La vérité d'une prédiction, CALCULÉE sur la jumla de l'histoire. */
export function predictTruth(model, key) {
  const [u0, u1] = model.ids;
  const v = { [u0]: model.sol.x, [u1]: model.sol.y };
  if (key === 'dearer') { const c = L.toNumber(v[u0]) - L.toNumber(v[u1]); return c > 0 ? u0 : c < 0 ? u1 : 'same'; }
  if (key === 'which') {
    const bad = model.ids.find((id) => { const n = L.toNumber(v[id]); return !Number.isInteger(n) || n < 0; });
    return bad ?? 'both';
  }
  return null;
}
/** La prédiction est-elle JUGÉE ? `dearer` : la jumla résolue (les deux valeurs écrites) ; `which` : l'histoire rejouée avec les valeurs justes. */
function predictJudged(lab, key, plan) {
  if (key === 'dearer') return !!plan && L.solved(lab, plan) && lab.stage !== 'model';
  if (key === 'which') return lab.stage !== 'solve' && trialExact(lab.replay);
  return false;
}
export const judgedPredictions = (lab, keys, plan) => keys.filter((key) => predictJudged(lab, key, plan));

/* ── le guide ───────────────────────────────────────────────────────────────────────────────── */

/**
 * La prochaine aide du guide (verdict §3.9) — le GESTE, jamais la réponse ; aucune bulle ne montre un jeton, une case ou une option justes.
 * `ui` : { plan, blocking }. Ancres `[data-coach="…"]` (des enveloppes : DraggableObject ne transmet aucun `data-*`).
 */
export function coachOf(lab, ui = {}) {
  if (ui.blocking) return null;
  if (lab.stage === 'name') return L.namingDone(lab) ? { id: 'toModel', target: '[data-coach="open"]', gesture: 'tap' } : { id: 'letter', target: '[data-coach="letters"]', gesture: 'drag', prefer: 'below' };
  if (lab.stage === 'model') {
    const full = L.rowComplete(lab, 1) && L.rowComplete(lab, 2);
    if (lab.verdict?.ok) return { id: 'toSolve', target: '[data-coach="open"]', gesture: 'tap' };
    return full ? { id: 'check', target: '[data-coach="check"]', gesture: 'tap', prefer: 'above' } : { id: 'chip', target: '[data-coach="chips"]', gesture: 'drag', prefer: 'below' };
  }
  if (lab.stage === 'solve') {
    if (!lab.method) return { id: 'method', target: '[data-coach="method"]', gesture: 'tap', prefer: 'below' };
    if (ui.plan && lab.revealed === ui.plan.halfAt + 1 && lab.half !== 'more') return { id: 'half', target: '[data-coach="half"]', gesture: 'tap', prefer: 'above' };
    if (ui.plan && L.canReveal(lab, ui.plan) && lab.revealed <= 1) return { id: 'next', target: '[data-coach="next"]', gesture: 'tap', prefer: 'above' };
    return null;
  }
  if (lab.stage === 'verify') {
    if (lab.replay) return null;
    return L.gatesDone(lab) ? { id: 'replay', target: '[data-coach="replay"]', gesture: 'tap', prefer: 'below' } : { id: 'gate', target: '[data-coach="values"]', gesture: 'drag', prefer: 'below' };
  }
  return null;
}

/* ── le balayage « valeurs interdites par rôle » ───────────────────────────────────────────── */

const bare = (v) => String(v).replace(/\s+/g, '').replace(/−/g, '-').replace(/\\left|\\right|\\times|\\;|\\Rightarrow/g, '');
const Rl = (role, v) => ({ role, v: String(v) });

/**
 * TOUT ce qu'un écran d'une manche peut montrer, avec son rôle : les nombres de l'histoire (`story`), les jetons (`chip`, le jeton muet
 * compris), la structure (`structure` : 'tickets' quand des PERSONNES entrent à deux prix — jamais avant la مسألة), la différence des prix
 * (`priceDiff`), chaque ligne des DEUX méthodes et pour les DEUX façons de nommer (`eq`, `line`), les valeurs (`solution`), les totaux rejoués
 * avec les valeurs justes ET échangées (`check`), les tuiles de construction (`tile`, `decoy`). `props` : celles d'une manche (ou ses `choices`).
 */
export function shownValues(props) {
  const list = props.choices?.length ? props.choices.map((c) => ({ ...props, ...c.props })) : [props];
  return list.flatMap(shownOne);
}

function shownOne(p) {
  const out = [];
  const model = L.parseModel({ system: p.system, unknowns: p.unknowns, facts: p.facts, chips: p.chips });
  (String(p.story ?? '').match(/\d+(?:[.,]\d+)?/g) ?? []).forEach((n) => out.push(Rl('story', n)));
  model.chips.forEach((c) => out.push(Rl('chip', L.numberText(c.value))));
  if (model.facts.some((f) => f.kind === 'count') && model.facts.some((f) => f.kind === 'money') && p.people) out.push(Rl('structure', 'tickets'));
  const mr = moneyRow(model);
  if (mr && countRow(model)) {
    const e = model.target[mr - 1];
    out.push(Rl('priceDiff', Math.abs(L.toNumber(e.a) - L.toNumber(e.b))));
    out.push(Rl('price', L.numberText(e.a)), Rl('price', L.numberText(e.b)));
  }
  model.target.forEach((e) => out.push(Rl('eq', bare(L.eqLatex(e, model.ids)))));
  const namings = p.named ? [L.defaultNaming(model)] : [L.defaultNaming(model), { [model.ids[0]]: model.ids[1], [model.ids[1]]: model.ids[0] }];
  namings.forEach((naming) => {
    const T = L.targetInLetters(model, naming);
    ['sub', 'add'].forEach((m) => {
      const plan = L.solvePlan(T, model.ids, m);
      plan.lines.forEach((l) => {
        out.push(Rl('line', bare(l.tex)));
        bare(l.tex).split(/=|⇒/).forEach((side) => { if (/^-?\d+(\/\d+)?$/.test(side)) out.push(Rl('lineValue', side)); });
        if (l.key === 'reduce' || l.key === 'addEq') out.push(Rl('eq', bare(l.tex)));
      });
    });
  });
  const v = { [model.ids[0]]: model.sol.x, [model.ids[1]]: model.sol.y };
  model.ids.forEach((id) => out.push(Rl('solution', L.fracText(v[id]))));
  const sw = { [model.ids[0]]: v[model.ids[1]], [model.ids[1]]: v[model.ids[0]] };
  [v, sw].forEach((vals) => {
    L.replayTex(model, vals).forEach((tx) => {
      out.push(Rl('line', bare(tx)));
      out.push(Rl('check', bare(tx).split('=').pop()));
    });
  });
  const cb = checkBuild(model, v);
  if (cb) { cb.tiles.forEach((tl) => out.push(Rl('tile', tl))); out.push(Rl('decoy', cb.decoy)); }
  // la construction « k × (▢ + ▢) = ▢ » (synthèse de l'unité 5) — seulement quand la manche la pose
  const sb = chainsOf(p.chains).specs.some((s) => s.id === 'buildSum') ? sumBuild(model, v) : null;
  if (sb) { sb.tiles.forEach((tl) => out.push(Rl('tile', tl))); out.push(Rl('decoy', sb.decoy), Rl('sum', sb.sum)); }
  return out;
}
