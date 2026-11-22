/**
 * LES MANCHES D'UN LABO (« الجولات », propriétaire 2026-11-04 : « le système de manches au lieu des niveaux, avec les étoiles »).
 * Logique PURE — LabRounds.jsx l'affiche. Un labo joué en manches : un chemin que l'élève parcourt (manche 1 → 2 → 3 → défi ⭐),
 * plus un terrain libre toujours ouvert, au lieu du sélecteur مبتدئ / متقدم qu'il devait choisir lui-même.
 *
 * Une manche : { id, title, props (pour <Manipulation>), goal: Condition[], stars: { firstTry?: true, maxTrials?: n }, optional?, free? }
 * Condition : { checkpoint: 'first' | 'contrast' }   — la suite de questions du labo terminée
 *             { exact: k }                          — une répartition JUSTE avec k groupes vue
 *             { allExact: [k…] }                    — toutes ces répartitions justes vues (le défi : tous les قواسم)
 *             { inexact: true }                     — une répartition qui laisse quelqu'un dehors vue
 *             { anyExact: true }                    — au moins une répartition / un rectangle JUSTE vu (n'importe lequel)
 *             { allPairs: n }                       — (factor-pairs) TOUS les rectangles de n livres vus : pour chaque couple (s, n÷s), l'un des deux
 *                                                     a été essayé et tombait juste ; `groups` d'un verdict = le nombre de livres par rangée d
 *             { above: g }                          — (common-divisors) un nombre de groupes PLUS GRAND que g essayé : avec { exact: g },
 *                                                     « g est le plus grand » a été VU, jamais deviné (comme greatestGroupFound)
 *             { bracketed: g }                      — (square-root-side, 2026-11-09) le côté ENCADRÉ par deux graduations voisines 1/g, vu
 *                                                     (événement onTrial { tk: 'bracket', card, scale, resisting }) ; un balayage aussi
 *             { resists: true }                     — (square-root-side, mode graduation) une carte a RÉSISTÉ : encadrée à 3 graduations sans tomber
 *             { solvedAll: n }                      — (square-fold, 2026-11-10) les n cartes de la manche RÉSOLUES (toutes leurs solutions épinglées,
 *                                                     ou « لا حل » déclaré) ; `groups` d'un verdict = l'indice de la carte, `exact` = carte résolue
 *             { discovered: true }                  — (square-tiling, 2026-11-10) la DÉCOUVERTE du labo atteinte, selon SON mode : le labo la juge
 *                                                     (logic › discoveryReady : deux pavages justes et un refusé ; le plus grand k et un contraste)
 *                                                     et l'annonce par onTrial { tk: 'discovered' }
 *             { modelOk: true }                     — (growth-race, 2026-11-11) un MODÈLE (la mise en équation de la situation) vérifié JUSTE ;
 *                                                     événement onTrial { tk: 'model', ok, key?, free? } — jamais un essai de x : un modèle refusé
 *                                                     compte comme un RATÉ (missesOf) et le même jeu de cartes vérifié deux fois (`key`) compte une fois
 * Un verdict peut porter `free: true` (square-tiling : le PREMIER refus d'une manche fait partie de la découverte) : il compte pour les buts,
 * jamais comme un essai de l'étoile « peu d'essais ». Une manche peut porter `helpAfterRefusals: n` : n refus (verdicts non justes) suffisent
 * à proposer la manche `easier` (conseil 2026-11-10 : trois pavages refusés de suite = l'élève tourne en rond).
 * Une manche peut porter `easier` : une manche d'ENTRAÎNEMENT plus petite (« لا بأس — جرّب أصغر », pilote 2026-11-08),
 * proposée seulement quand l'élève peine (needsHelp) — jamais à celui qui réussit.
 * Ce que la manche a VU (`log`) : { verdicts: [{ groups, exact }], checkpoints: { [id]: true }, answers: [{ ok, tries, revealed }] }
 */

export const emptyLog = () => ({ verdicts: [], checkpoints: {}, answers: [], predictions: [], brackets: [], discovered: false, models: [] });

/** Le journal d'une manche après un événement du labo (onVerdict → 'verdict', onTrial → les événements LabCheckpoint). */
export function logEvent(log, kind, ev) {
  // « إعادة » (ou d'autres nombres) dans le labo : la manche repart de zéro — ses essais d'avant ne comptent plus (revue 2026-11-09)
  if (ev?.tk === 'reset') return emptyLog();
  // « أعِد التجربة » d'une question du labo : la tâche revient au départ — ce que le labo vient de défaire quitte aussi la manche (revue ECC
  // 2026-11-10 : un but ne doit pas rester atteint par des essais que le labo ne montre plus). `groups` : seulement les verdicts de ce groupe
  // (une carte) ; sinon tous les verdicts, les encadrements et la découverte. Les prédictions et les questions déjà répondues restent.
  if (ev?.tk === 'retry') {
    if (ev.models) return { ...log, verdicts: [], brackets: [], discovered: false, models: [] };
    if (ev.groups != null) return { ...log, verdicts: log.verdicts.filter((v) => v.groups !== Number(ev.groups)) };
    return { ...log, verdicts: [], brackets: [], discovered: false };
  }
  if (kind === 'verdict') return { ...log, verdicts: [...log.verdicts, { groups: Number(ev.groups), exact: Boolean(ev.exact), ...(ev.free ? { free: true } : {}) }] };
  // une vérification de MODÈLE (growth-race) : le même jeu de cartes (`key`) vérifié deux fois ne compte qu'une fois
  if (ev?.tk === 'model') {
    const models = log.models ?? [];
    if (ev.key != null && models.some((m) => m.key === ev.key)) return log;
    return { ...log, models: [...models, { ok: Boolean(ev.ok), ...(ev.key != null ? { key: ev.key } : {}), ...(ev.free ? { free: true } : {}) }] };
  }
  // la découverte du labo atteinte (square-tiling : le labo la juge selon son mode)
  if (ev?.tk === 'discovered') return { ...log, discovered: true };
  if (ev?.tk === 'checkpoint') return { ...log, answers: [...log.answers, { ok: Boolean(ev.ok), tries: ev.tries ?? 1, revealed: Boolean(ev.revealed) }] };
  if (ev?.tk === 'checkpoint-done') return { ...log, checkpoints: { ...log.checkpoints, [ev.id]: true } };
  // une PRÉDICTION faite avant d'agir, jugée par le terrain (pilote 2026-11-07)
  if (ev?.tk === 'predict') return { ...log, predictions: [...(log.predictions ?? []), { ok: Boolean(ev.ok) }] };
  // un ENCADREMENT serré (square-root-side) : la carte, la graduation, et si la carte résiste désormais
  if (ev?.tk === 'bracket') return { ...log, brackets: [...(log.brackets ?? []), { card: Number(ev.card ?? 0), scale: Number(ev.scale), resisting: Boolean(ev.resisting) }] };
  return log;
}

const exactGroups = (log) => new Set(log.verdicts.filter((v) => v.exact).map((v) => v.groups));

/** Tous les couples (s, n ÷ s) de n sont-ils vus ? (un rectangle parfait d × e livre d ET e : il suffit d'avoir essayé l'un des deux) */
export function allPairsSeen(n, seen) {
  for (let s = 1; s * s <= n; s += 1) if (n % s === 0 && !seen.has(s) && !seen.has(n / s)) return false;
  return true;
}

/** Une condition de but est-elle remplie ? */
export function conditionMet(cond, log) {
  if (cond.checkpoint) return Boolean(log.checkpoints[cond.checkpoint]);
  if (cond.exact != null) return exactGroups(log).has(Number(cond.exact));
  if (cond.allExact) { const seen = exactGroups(log); return cond.allExact.every((k) => seen.has(Number(k))); }
  if (cond.inexact) return log.verdicts.some((v) => !v.exact);
  if (cond.anyExact) return exactGroups(log).size > 0;
  if (cond.allPairs) return allPairsSeen(Number(cond.allPairs), exactGroups(log));
  if (cond.above != null) return log.verdicts.some((v) => v.groups > Number(cond.above));
  if (cond.bracketed != null) return (log.brackets ?? []).some((b) => b.scale === Number(cond.bracketed));
  if (cond.resists) return (log.brackets ?? []).some((b) => b.resisting);
  if (cond.discovered) return Boolean(log.discovered);
  if (cond.modelOk) return (log.models ?? []).some((m) => m.ok);
  if (cond.solvedAll != null) { const seen = exactGroups(log); return Array.from({ length: Number(cond.solvedAll) }, (_, i) => i).every((i) => seen.has(i)); }
  return false;
}

/** La manche est-elle gagnée ? (une manche libre n'a pas de but : jamais « gagnée », jamais bloquante) */
export function roundWon(round, log) {
  if (round.free || !round.goal?.length) return false;
  return round.goal.every((c) => conditionMet(c, log));
}

/**
 * Les ÉTOILES d'une manche gagnée (1 à 3) — elles récompensent le JEU, plus la frappe (conseil + propriétaire, 2026-11-07 :
 * « juste du premier coup » apprenait la peur et la devinette rapide) : ★ gagnée ; ★ ses PRÉDICTIONS justes (au moins une
 * faite, toutes justes — sans prédiction possible, l'étoile est acquise) ; ★ peu d'essais (au plus `maxTrials` répartitions).
 * Mesurables, jamais un chronomètre : l'étoile récompense la réflexion, pas la vitesse.
 */
export function predictionsRight(log) {
  const preds = log.predictions ?? [];
  return preds.length > 0 && preds.every((x) => x.ok);
}

/** Les essais qui comptent pour l'étoile « peu d'essais » : les verdicts, sauf ceux marqués `free`. */
export const countedTrials = (log) => log.verdicts.filter((v) => !v.free).length;

/**
 * Les deux critères des étoiles 2 et 3, UNE seule source (la carte de victoire de LabRounds les affiche — revue ECC 2026-11-10 : la carte
 * comptait les essais gratuits et disait « trop d'essais » quand la 3e étoile était donnée).
 */
export function starCriteria(round, log) {
  const max = round?.stars?.maxTrials;
  return {
    clean: round?.stars?.predict === false || predictionsRight(log),
    few: max == null || countedTrials(log) <= max,
  };
}

export function starsFor(round, log) {
  if (!roundWon(round, log)) return 0;
  const { clean, few } = starCriteria(round, log);
  return Math.min(3, 1 + (clean ? 1 : 0) + (few ? 1 : 0));
}

/**
 * L'élève PEINE-t-il dans cette manche ? (conseil 2026-11-08 : une seconde chance PLUS PETITE, déclenchée par des preuves du
 * terrain, pas par une seule réponse ratée — une question à 3 choix se devine une fois sur trois.)
 * Vrai quand la manche a une version `easier`, n'est pas gagnée, et qu'on voit AU MOINS 2 ratés : prédictions fausses, questions
 * ratées au premier essai (ou dont la réponse a été montrée) — ou bien beaucoup d'essais sans gagner (maxTrials + 2, 5 par défaut).
 */
export const HELP_MISSES = 2;
export function missesOf(log) {
  const preds = (log.predictions ?? []).filter((x) => !x.ok).length;
  // une question compte UNE fois, à sa fin : juste après des essais (`tries > 1`) ou montrée (`revealed`). LabCheckpoint émet un événement
  // par essai — l'essai faux PUIS le bon comptaient deux ratés pour une seule question (vu dans la synthèse de l'unité 9, 2026-11-10 : la carte
  // « جرّب أصغر » couvrait le labo après UNE réponse fausse)
  const answers = (log.answers ?? []).filter((a) => (a.ok && a.tries > 1) || a.revealed).length;
  // un modèle REFUSÉ (hors gratuit) est un raté ; l'événement ne vient qu'une fois par jeu de cartes (`key`)
  const models = (log.models ?? []).filter((m) => !m.ok && !m.free).length;
  return preds + answers + models;
}
export function needsHelp(round, log) {
  if (!round?.easier || round.free || roundWon(round, log)) return false;
  const manyTrials = countedTrials(log) >= (round.stars?.maxTrials ?? 3) + 2;
  const refusals = log.verdicts.filter((v) => !v.exact).length;
  return missesOf(log) >= HELP_MISSES || manyTrials || (round.helpAfterRefusals != null && refusals >= round.helpAfterRefusals);
}

/**
 * Les props de la manche d'ENTRAÎNEMENT (`round.easier`) : un objet, ou une fonction du journal de la manche au moment où l'élève la quitte
 * (la synthèse de l'unité 9, 2026-11-10 : « h verrouillé sur un cran PAS ENCORE inscrit » — le choix dépend de ce que l'élève a déjà vu).
 */
export function easierProps(round, log = emptyLog()) {
  const p = round?.easier?.props;
  return typeof p === 'function' ? p(log) : p;
}

/**
 * Une manche d'entraînement GAGNÉE peut LIBÉRER la manche (`easier.releases`, synthèse 2026-11-10 : un élève bloqué ne doit pas l'être aussi
 * des étapes au crayon ni du défi) : la manche compte alors pour gagnée avec 1 ★ (jamais moins que ses meilleures étoiles).
 */
export const releasesOnEasyWin = (round) => Boolean(round?.easier?.releases);

/** Une manche est-elle ouverte ? La première, une manche libre, ou celle dont la manche requise précédente est gagnée. */
export function roundUnlocked(rounds, index, best) {
  const round = rounds[index];
  if (!round) return false;
  if (index === 0 || round.free) return true;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (rounds[i].free) continue;
    return (best[rounds[i].id] ?? 0) > 0;
  }
  return true;
}

/**
 * La manche où mène une PORTE (« العب الجولة … », une étape qui attend une manche) : celle demandée si elle est ouverte ; sinon la première
 * manche REQUISE pas encore gagnée avant elle — la porte ne fait jamais sauter une manche fermée (revue ECC 2026-11-09).
 */
export function jumpTarget(rounds, index, best) {
  if (index < 0 || index >= rounds.length) return -1;
  if (roundUnlocked(rounds, index, best)) return index;
  const first = rounds.findIndex((r, i) => i < index && !r.free && !r.optional && !(best[r.id] > 0));
  return first >= 0 ? first : index;
}

/** La manche où reprendre : la première manche requise non gagnée, sinon la dernière gagnée. */
export function resumeRound(rounds, best) {
  const i = rounds.findIndex((r) => !r.free && !r.optional && !(best[r.id] > 0));
  if (i >= 0) return i;
  const won = rounds.map((r, k) => (best[r.id] > 0 ? k : -1)).filter((k) => k >= 0);
  return won.length ? won[won.length - 1] : 0;
}

// ── Les meilleures étoiles, par élève (scopedStorage) : { [labId]: { [roundId]: 1..3 } } pour toute la leçon ───────────
export const starsKey = (lessonId) => `smarter_stars_${lessonId}`;
export const STARS_EVENT = 'sa-stars-changed';

export function readStars(storage, lessonId) {
  try {
    const raw = JSON.parse(storage?.getItem(starsKey(lessonId)) ?? 'null');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

/** Garde la MEILLEURE note d'une manche (rejouer ne fait jamais perdre d'étoiles) ; renvoie le nouvel état. */
export function recordStars(storage, lessonId, labId, roundId, stars) {
  const all = readStars(storage, lessonId);
  const lab = all[labId] ?? {};
  if ((lab[roundId] ?? 0) >= stars) return all;
  const next = { ...all, [labId]: { ...lab, [roundId]: stars } };
  try { storage?.setItem(starsKey(lessonId), JSON.stringify(next)); } catch { /* stockage indisponible : les étoiles restent à l'écran */ }
  return next;
}

/** Le total d'étoiles de la leçon (la barre de mission l'affiche). */
export function totalStars(all) {
  return Object.values(all ?? {}).reduce((sum, lab) => sum + Object.values(lab ?? {}).reduce((a, b) => a + (Number(b) || 0), 0), 0);
}
