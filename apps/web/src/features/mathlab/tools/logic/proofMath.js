/**
 * Le GRAPHE d'une preuve — pur, sans React (proofMath.test.js).
 *
 * Une preuve n'est pas une liste : c'est un graphe de dépendances. Chaque
 * étape déclare ce dont elle a besoin (`requires`), et elle est posable dès
 * que ses prérequis sont posés. Deux conséquences, toutes deux demandées par
 * le cahier des charges :
 *
 *   §36 — **plusieurs chemins valides.** Les deux cas d'un raisonnement par
 *   disjonction se posent dans l'ordre qu'on veut ; aucun n'est « le bon ».
 *   Une liste ordonnée aurait refusé la moitié des preuves justes.
 *
 *   §27 — **un refus qui EXPLIQUE.** `validateStep` ne rend pas `false` mais
 *   une raison (`missingPrerequisite` + quelles étapes manquent, `notInProof`,
 *   `alreadyPlaced`) : l'interface écrit « هذه النتيجة لا تتبع من المعطيات
 *   الحالية » et nomme ce qui manque, sans jamais donner la suite.
 *
 * §32 — le même graphe donne l'ARBRE : `proofLayers` répartit les étapes en
 * rangs (un rang = tout ce qui devient posable en même temps), et une étape
 * qui dépend de deux autres les réunit — ce que §32 veut montrer.
 */

import { domainStatus } from './presets.js';

/** Toutes les étapes, y compris les alternatives acceptées (§36). */
export function stepIds(proof) {
  return proof?.steps?.map((step) => step.id) ?? [];
}

export function findStep(proof, id) {
  return proof?.steps?.find((step) => step.id === id) ?? null;
}

/**
 * Cette étape peut-elle être posée maintenant ?
 *
 * @returns {{ok: true} | {ok: false, reason: string, missing?: string[]}}
 */
export function validateStep(proof, placed, candidateId) {
  const step = findStep(proof, candidateId);
  if (!step) return { ok: false, reason: 'notInProof' };
  if (placed.includes(candidateId)) return { ok: false, reason: 'alreadyPlaced' };

  const missing = (step.requires ?? []).filter((needed) => !placed.includes(needed));
  if (missing.length > 0) return { ok: false, reason: 'missingPrerequisite', missing };

  return { ok: true };
}

/** Les étapes posables à cet instant — ce que l'aide de §39 peut désigner. */
export function availableSteps(proof, placed) {
  return stepIds(proof).filter((id) => validateStep(proof, placed, id).ok);
}

/** La preuve est-elle complète ? (toutes les étapes, chacune après ses prérequis). */
export function isComplete(proof, placed) {
  const ids = stepIds(proof);

  return ids.length > 0
    && placed.length === ids.length
    && ids.every((id) => placed.includes(id))
    && orderIsValid(proof, placed);
}

/** Chaque étape arrive-t-elle après ses prérequis ? */
export function orderIsValid(proof, placed) {
  return firstOrderError(proof, placed) === null;
}

/**
 * §35 — le premier endroit où la chaîne casse : le RANG et la raison, pour
 * que l'interface puisse pointer une carte précise sans révéler la suite.
 */
export function firstOrderError(proof, placed) {
  const seen = [];
  for (let i = 0; i < placed.length; i += 1) {
    const verdict = validateStep(proof, seen, placed[i]);
    if (!verdict.ok) return { index: i, id: placed[i], ...verdict };
    seen.push(placed[i]);
  }

  return null;
}

/**
 * §34 — « ما الخطوة الناقصة ؟ » : on retire une étape qui n'est ni la
 * première ni la dernière, et on propose des candidats — l'étape retirée,
 * plus les distracteurs de la preuve. Reproductible à graine égale.
 */
export function makeGapChallenge(proof, seed = 1) {
  const ids = stepIds(proof);
  if (ids.length < 3) return null;
  const removable = ids.slice(1, -1);
  const index = 1 + (Math.abs(Math.floor(seed)) % removable.length);
  const missingId = ids[index];

  return {
    proofId: proof.id,
    shown: ids.filter((id) => id !== missingId),
    missingId,
    missingIndex: index,
    candidates: shuffleWithSeed([missingId, ...(proof.distractors ?? [])], seed),
  };
}

export function checkGapAnswer(gap, candidateId) {
  return Boolean(gap) && candidateId === gap.missingId;
}

/**
 * §32 — les RANGS de l'arbre : rang 0 = ce qui ne dépend de rien, rang n =
 * ce dont tous les prérequis sont de rang < n. Une étape qui dépend de deux
 * branches (la conclusion d'une preuve par cas, la contradiction) les REJOINT
 * — c'est précisément ce que l'arbre doit rendre visible.
 */
export function proofLayers(proof) {
  const steps = proof?.steps ?? [];
  const depth = new Map();
  let changed = true;
  let guard = 0;

  while (changed && guard < 50) {
    changed = false;
    guard += 1;
    for (const step of steps) {
      const requires = step.requires ?? [];
      const known = requires.every((id) => depth.has(id));
      if (!known) continue;
      const next = requires.length === 0 ? 0 : Math.max(...requires.map((id) => depth.get(id))) + 1;
      if (depth.get(step.id) !== next) { depth.set(step.id, next); changed = true; }
    }
  }

  const layers = [];
  for (const step of steps) {
    const rank = depth.get(step.id) ?? 0;
    (layers[rank] ??= []).push(step);
  }

  return layers.map((layer) => layer ?? []);
}

/** Un ordre valide parmi d'autres — la « solution » de §39, jamais montrée d'emblée. */
export function anyValidOrder(proof) {
  const placed = [];
  let guard = 0;
  while (placed.length < stepIds(proof).length && guard < 100) {
    guard += 1;
    const next = availableSteps(proof, placed)[0];
    if (!next) break;
    placed.push(next);
  }

  return placed;
}

/**
 * §33 — un sophisme est réfuté par TOUT contre-exemple valide, pas par un
 * seul — mais seulement PRIS DANS L'ENSEMBLE DÉCLARÉ : « n زوجي » sur ℕ
 * n'est pas réfuté par −2, qui n'est pas un n de l'argument.
 */
export function refutesFallacy(fallacy, value) {
  if (!fallacy || !Number.isFinite(value)) return false;
  if (fallacy.domain && domainStatus(value, fallacy.domain) !== 'in') return false;
  try {
    return Boolean(fallacy.refutes(value));
  } catch {
    return false;
  }
}

/** Mélange reproductible (Fisher-Yates piloté par une graine). */
function shuffleWithSeed(list, seed) {
  const out = [...list];
  let state = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  const next = () => {
    state = (state * 16807) % 2147483647;

    return (state - 1) / 2147483646;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }

  return out;
}
