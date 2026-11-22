import * as equalGrouping from '@smarter-academy/core/arithmetic/equalGrouping.js';

const { groupInto, fixLeftOver } = equalGrouping;

/**
 * team-builder — l'état du PARTAGE ÉQUITABLE par le geste.
 *
 * L'élève porte des joueurs dans des équipes. Ce fichier ne dessine rien : il
 * dit ce qui est PERMIS et ce qui est VRAI.
 *
 * LA RÈGLE QUI PORTE TOUTE LA MATHÉMATIQUE : une équipe n'accepte un joueur
 * que si les équipes restent ÉGALES. Concrètement, on ne peut pas mettre un
 * sixième joueur dans l'équipe 1 tant que les équipes 2 et 3 en ont cinq.
 * Ce refus n'est pas une contrainte d'interface : c'est la définition du
 * partage équitable, rendue physique. C'est aussi ce qui fait que le
 * seizième joueur ne peut ALLER NULLE PART — et le reste devient une chose
 * qu'on voit, pas un nombre qu'on lit.
 *
 * Le verdict n'est jamais calculé « à part » : `leftOver` est le nombre de
 * joueurs qui restent sur le banc quand plus aucun placement n'est permis.
 */

/**
 * @param total   combien de joueurs au départ
 * @param groups  combien d'équipes demandées
 * @param bench   les joueurs pas encore placés (ids), par défaut tous
 */
export function init({ total, groups }) {
  const g = Math.max(1, groups | 0);
  return {
    total,
    groups: g,
    // Chaque joueur est un objet identifiable : c'est LUI qu'on déplace, et
    // c'est lui qu'on voit rester dehors.
    bench: Array.from({ length: total }, (_, i) => i),
    teams: Array.from({ length: g }, () => []),
  };
}

/** La cible d'équilibre : ce que chaque équipe doit contenir à la fin. */
function targetPerTeam(state) {
  return groupInto(state.total, state.groups).perGroup;
}

/** Dans quelle équipe se trouve ce joueur ? `-1` s'il est sur le banc. */
export function teamOf(state, playerId) {
  return state.teams.findIndex((team) => team.includes(playerId));
}

/**
 * Un joueur peut-il entrer dans l'équipe `t` ?
 * `true` = accepté ; une CHAÎNE = refus, avec sa raison (clé arabe côté vue).
 */
export function canPlace(state, playerId, t) {
  if (!Number.isInteger(t) || t < 0 || t >= state.groups) return 'noSuchTeam';
  const from = teamOf(state, playerId);
  if (from === -1 && !state.bench.includes(playerId)) return 'notOnBench';
  // DÉPLACER un joueur d'une équipe à une autre est légitime : l'élève change
  // d'avis, et l'interface ne doit pas se battre avec lui. On raisonne donc
  // sur les tailles APRÈS le départ du joueur de son équipe actuelle.
  if (from === t) return 'sameTeam';
  const { here, min } = rejectDetails(state, playerId, t);
  // Les équipes restent égales : on ne remplit pas une équipe avant les autres.
  if (here > min) return 'teamsMustStayEqual';
  // Une équipe ne dépasse jamais la taille que le partage permet.
  if (here >= targetPerTeam(state)) return 'teamIsFull';
  return true;
}

/**
 * Les NOMBRES du refus, calculés comme `canPlace` les voit — APRÈS le départ
 * du joueur de son équipe actuelle. Le message de refus les lit ici et nulle
 * part ailleurs : recalculés à part dans la vue (avant le départ), ils
 * donnaient « فيه 5… وأقلّ فريق فيه 5 » — une raison qui se contredisait
 * (audit du 2026-09-29, M1-F1).
 */
export function rejectDetails(state, playerId, t) {
  const from = teamOf(state, playerId);
  const sizes = state.teams.map((team, i) => team.length - (i === from ? 1 : 0));
  return { here: sizes[t] ?? 0, min: Math.min(...sizes), perGroup: targetPerTeam(state) };
}

export function place(state, playerId, t) {
  if (canPlace(state, playerId, t) !== true) return state;
  const teams = state.teams.map((team, i) => {
    const without = team.filter((p) => p !== playerId);
    return i === t ? [...without, playerId] : without;
  });
  return { ...state, bench: state.bench.filter((p) => p !== playerId), teams };
}

/** Retirer un joueur d'une équipe : il revient sur le banc. Toujours permis. */
export function unplace(state, playerId) {
  const t = state.teams.findIndex((team) => team.includes(playerId));
  if (t === -1) return state;
  return {
    ...state,
    teams: state.teams.map((team, i) => (i === t ? team.filter((p) => p !== playerId) : team)),
    bench: [...state.bench, playerId].sort((x, y) => x - y),
  };
}

/** Le placement est-il terminé — c'est-à-dire plus aucun placement permis ? */
export function isSettled(state) {
  if (state.bench.length === 0) return true;
  // Seuls les joueurs du BANC comptent : un joueur déjà placé peut toujours
  // changer d'équipe, et cela ne rend pas la scène « non stabilisée ».
  return state.bench.every((p) => state.teams.every((_, t) => canPlace(state, p, t) !== true));
}

/**
 * Le VERDICT — ce que la scène montre quand plus rien ne peut bouger.
 * `leftOver` est un nombre de JOUEURS, jamais une décimale.
 */
export function verdict(state) {
  const g = groupInto(state.total, state.groups);
  return {
    ...g,
    settled: isSettled(state),
    /** Les joueurs effectivement restés dehors — ils existent, on les dessine. */
    benched: state.bench,
    /** « combien en ajouter / en retirer pour que tout tombe juste » */
    fix: fixLeftOver(state.total, state.groups),
  };
}

/**
 * La découverte est prête quand l'élève a VU les deux cas : un partage qui
 * tombe juste et un partage qui laisse quelqu'un dehors. Un seul des deux ne
 * fait pas apparaître la règle — c'est le contraste qui l'enseigne.
 *
 * `memory` est la mémoire des configurations STABILISÉES que tient la vue
 * (`{ "15:3": true, "16:3": false }`) : elle vit hors de l'état de la scène,
 * qui repart à zéro à chaque changement de nombres.
 */
export function discoveryReady(memory) {
  const seen = Object.values(memory);
  return seen.includes(true) && seen.includes(false);
}

/** Le prochain geste canonique (mode classe : « الخطوة التالية »). */
export function nextMove(state) {
  for (const p of state.bench) {
    for (let t = 0; t < state.groups; t += 1) {
      if (canPlace(state, p, t) === true) return { playerId: p, team: t };
    }
  }
  return null;
}

/**
 * UN geste canonique, sans effet quand plus rien n'est permis. C'est le pas
 * de « أنشئ الفرق » (complétion automatique, MANIPULATION_CONTRACT §6bis) :
 * il passe par `place`, donc par `canPlace` — la même règle que le geste de
 * l'élève. L'automatique ne peut rien faire que la main n'aurait pu faire.
 */
export function autoStep(state) {
  const mv = nextMove(state);
  return mv ? place(state, mv.playerId, mv.team) : state;
}

/**
 * Placer tout ce qui peut l'être — « إظهار الحل » du mode classe, et la fin
 * de « أنشئ الفرق ». Part de l'état COURANT : les joueurs que l'élève a déjà
 * placés restent où il les a mis, seuls les autres sont complétés.
 */
export function fill(state) {
  let s = state;
  for (;;) {
    const next = autoStep(s);
    if (next === s) return s;
    s = next;
  }
}

/** Combien de gestes `fill` ferait encore — 0 quand la scène est stabilisée. */
export function remainingMoves(state) {
  const placed = (x) => x.teams.reduce((n, team) => n + team.length, 0);
  return placed(fill(state)) - placed(state);
}

/* ── Le guide d'onboarding (LabCoach, MANIPULATION_CONTRACT §8quater) ─────────────────────────────────────────── */

/**
 * La prochaine action attendue. Tant que des joueurs peuvent entrer : porter le premier du banc vers une équipe
 * (`place` la première fois, `more` ensuite) — le guide ne nomme pas l'équipe, c'est la règle d'égalité qui répond.
 * Une fois la scène stabilisée sans contraste vu : changer le nombre d'équipes (`teams`, la première pastille jamais
 * essayée) ou, sans pastilles (niveau avancé), ouvrir le laboratoire libre (`free`). `null` quand la découverte est méritée.
 *
 * @param {object} lab           l'état de la scène (`init`)
 * @param {{memory:Object, teamOptions:number[], squadOptions?:number[], freeLab?:boolean}} ctx
 *   `memory` : les configurations stabilisées (`{ "15:3": true }`), comme `discoveryReady`.
 */
export function coachOf(lab, { memory = {}, teamOptions = [], freeLab = false, button = false } = {}) {
  if (discoveryReady(memory)) return null;
  if (!isSettled(lab)) {
    const p = lab.bench[0];
    if (p === undefined) return null;
    const placed = lab.teams.some((team) => team.length > 0);
    // une manche jouée au BOUTON (« أنشئ الفرق » ouvert d'emblée, `handDone`) : le guide montre le bouton, pas un glisser
    // que la consigne ne demande pas (propriétaire, 2026-11-07 — même contradiction que la mission « اسحب »)
    if (button && !placed) return { id: 'auto', target: '[data-manipulation-autocomplete] button', gesture: 'tap' };
    return { id: placed ? 'more' : 'place', target: `[data-drag-source="player:${p}"]`, rank: p, gesture: 'drag' };
  }
  const k = teamOptions.find((x) => x !== lab.groups && !(`${lab.total}:${x}` in memory));
  if (k !== undefined) return { id: 'teams', target: `[data-tb-teams="${k}"]`, rank: k, gesture: 'tap' };
  if (teamOptions.length === 0 && !freeLab) return { id: 'free', target: '[data-manipulation-free-lab] button', gesture: 'tap' };
  return null;
}
