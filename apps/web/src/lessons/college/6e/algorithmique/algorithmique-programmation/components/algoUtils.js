/**
 * Modèle de l'algorithmique — source de vérité unique de la leçon.
 *
 * ─── ÉTAT CANONIQUE ────────────────────────────────────────────────────
 * Le robot est TOUJOURS décrit par trois entiers :
 *     { col, row, heading }
 *   col, row : indices de nœud du quadrillage, entiers NATURELS (≥ 0).
 *   heading  : 0 | 1 | 2 | 3 — un INDICE dans DIRECTIONS, jamais une chaîne.
 *
 * Tout le reste (position en pixels, cône de direction, liste des pas,
 * verdict, case d'arrivée) en est DÉRIVÉ. Rien d'autre n'est stocké.
 *
 * ─── POURQUOI heading EST UN NOMBRE ────────────────────────────────────
 * Tourner devient de l'arithmétique modulo 4, sans aucun `if` :
 *     TOURNER_DROITE : (heading + 1) % 4
 *     TOURNER_GAUCHE : (heading + 3) % 4      (+3 ≡ −1 mod 4, jamais négatif)
 * C'est le cœur mathématique de la leçon : TOURNER change la direction,
 * AVANCER change la case. Deux effets distincts, jamais mélangés.
 *
 * ─── CONVENTION D'ORIENTATION (à respecter partout) ────────────────────
 * DIRECTIONS est ordonné dans le SENS DES AIGUILLES D'UNE MONTRE :
 *     0 = Nord (haut), 1 = Est (droite), 2 = Sud (bas), 3 = Ouest (gauche)
 * `row` croît vers le HAUT pour l'élève ; en SVG, y croît vers le BAS.
 * Cette inversion n'a lieu QUE dans `gridToSvg` — aucun composant ne la
 * refait à la main (bug classique inter-composants, cf. playbook §4).
 *
 * ─── PÉRIMÈTRE OFFICIEL (JSON du programme, 6e) ────────────────────────
 * include : « Déplacements, séquences d'instructions », « Boucles simples ».
 * exclude : « Variables, conditions complexes ».
 * Le jeu d'instructions est donc CLOS : AVANCER, GAUCHE, DROITE, RAMASSER,
 * et un seul niveau de RÉPÉTER. `makeRepeat` refuse toute imbrication —
 * la limite du programme officiel est STRUCTURELLE, pas une consigne.
 */

/* ══ Directions ═══════════════════════════════════════════════════════ */

/** Ordre horaire — cet ordre EST la convention (voir en-tête). */
export const DIRECTIONS = ['N', 'E', 'S', 'O'];

/** Déplacement d'un AVANCER selon la direction. row croît vers le haut. */
export const DELTA = [
  { col: 0, row: 1 },  // N
  { col: 1, row: 0 },  // E
  { col: 0, row: -1 }, // S
  { col: -1, row: 0 }, // O
];

const HEADING_WORDS = ['le haut', 'la droite', 'le bas', 'la gauche'];
const HEADING_ARROWS = ['↑', '→', '↓', '←'];

/** « vers le haut » — pour les aria-labels et les retours écrits. */
export const describeHeading = (heading) => HEADING_WORDS[mod4(heading)];
/** Flèche affichable de la direction courante. */
export const headingArrow = (heading) => HEADING_ARROWS[mod4(heading)];

/** Modulo 4 toujours positif (JS : -1 % 4 === -1). */
function mod4(n) {
  return ((n % 4) + 4) % 4;
}

export const turnRight = (heading) => mod4(heading + 1);
export const turnLeft = (heading) => mod4(heading + 3);

/* ══ Le monde ═════════════════════════════════════════════════════════ */

/**
 * Décrit un quadrillage et sa projection dans le viewBox SVG.
 * `cols`/`rows` comptent les CASES : un monde 6×5 porte donc des colonnes
 * 0..5 et des lignes 0..4 (le robot occupe une case, pas un nœud).
 */
export function makeWorld({
  cols = 6,
  rows = 5,
  step = 46,
  start = { col: 0, row: 0, heading: 1 },
  target = null,
  obstacles = [],
  items = [],
  padX = 14,
  padY = 14,
} = {}) {
  return {
    cols,
    rows,
    step,
    start,
    target,
    obstacles,
    items,
    padX,
    padY,
    width: padX * 2 + cols * step,
    height: padY * 2 + rows * step,
  };
}

/** Case (col,row) → coin haut-gauche en SVG. SEUL lieu de l'inversion verticale. */
export function gridToSvg(world, col, row) {
  return {
    x: world.padX + col * world.step,
    y: world.padY + (world.rows - 1 - row) * world.step,
  };
}

/** Centre d'une case en SVG — pour le robot, les objets et la trace. */
export function cellCenter(world, col, row) {
  const { x, y } = gridToSvg(world, col, row);
  return { x: x + world.step / 2, y: y + world.step / 2 };
}

export const cellId = (col, row) => `${col},${row}`;
export const sameCell = (a, b) => !!a && !!b && a.col === b.col && a.row === b.row;

/** Dans la grille ? (jamais de coordonnée négative — périmètre 6e.) */
export function inBounds(world, col, row) {
  return col >= 0 && row >= 0 && col < world.cols && row < world.rows;
}

/** Case franchissable : dans la grille et sans obstacle. */
export function isWalkable(world, col, row) {
  if (!inBounds(world, col, row)) return false;
  return !world.obstacles.some((o) => o.col === col && o.row === row);
}

/* ══ Les instructions ═════════════════════════════════════════════════ */

export const KINDS = ['AVANCER', 'GAUCHE', 'DROITE', 'RAMASSER', 'REPETER'];

/** Libellés affichés — une seule source, réutilisée par la bande et les bilans. */
export const INSTRUCTION_LABELS = {
  AVANCER: { label: 'AVANCER', icon: '⬆', aria: 'avancer d’une case' },
  GAUCHE: { label: 'TOURNER ←', icon: '↺', aria: 'tourner à gauche' },
  DROITE: { label: 'TOURNER →', icon: '↻', aria: 'tourner à droite' },
  RAMASSER: { label: 'RAMASSER', icon: '✋', aria: 'ramasser ce qui est sur la case' },
  REPETER: { label: 'RÉPÉTER', icon: '🔁', aria: 'répéter plusieurs fois' },
};

export const instr = (kind) => ({ kind });

/**
 * Construit un bloc RÉPÉTER. Le corps est APLATI d'un éventuel RÉPÉTER :
 * l'imbrication est hors programme en 6e, la structure l'interdit donc.
 */
export function makeRepeat(times, body) {
  const flatBody = (body || []).filter((b) => b && b.kind !== 'REPETER');
  return { kind: 'REPETER', times: Math.max(1, Math.floor(times) || 1), body: flatBody };
}

/** Un programme est-il conforme au périmètre officiel (pas d'imbrication) ? */
export function isFlatProgram(program) {
  return (program || []).every(
    (i) => i.kind !== 'REPETER' || (i.body || []).every((b) => b.kind !== 'REPETER')
  );
}

/**
 * Déroule le programme en la LISTE DES PAS RÉELLEMENT EXÉCUTÉS.
 *
 * C'est la fonction qui porte la pédagogie du module 5 : `RÉPÉTER 5 [AVANCER]`
 * et cinq `AVANCER` écrits à la main produisent EXACTEMENT la même liste —
 * donc exactement la même trace. L'invariant est vérifié par un test unitaire.
 *
 * Chaque pas garde d'où il vient : `srcIndex` (l'instruction du programme
 * affiché) et `iteration` (le tour de boucle), pour surligner la bonne carte
 * pendant l'exécution.
 */
export function flatten(program) {
  const steps = [];
  (program || []).forEach((node, srcIndex) => {
    if (node.kind === 'REPETER') {
      for (let it = 0; it < node.times; it += 1) {
        (node.body || []).forEach((b, bodyIndex) => {
          steps.push({ kind: b.kind, srcIndex, iteration: it, bodyIndex });
        });
      }
    } else {
      steps.push({ kind: node.kind, srcIndex, iteration: 0, bodyIndex: null });
    }
  });

  return steps;
}

/** Nombre d'actions réellement effectuées (≠ nombre de cartes écrites). */
export const countSteps = (program) => flatten(program).length;

/* ══ L'exécution ══════════════════════════════════════════════════════ */

/**
 * Exécute un programme dans un monde. FONCTION PURE : aucun état React,
 * aucun effet. L'interface se contente de rejouer `trace` image par image.
 *
 * Règle de collision : un AVANCER vers un mur ou un obstacle NE DÉPLACE PAS
 * le robot ; il pose `blocked` et arrête l'exécution. Le robot reste visible,
 * bloqué contre l'obstacle — la conséquence se voit (playbook §8).
 *
 * @returns {{
 *   trace: Array<{pos, kind, srcIndex, iteration, event}>, // état APRÈS chaque pas
 *   start, final, collected: string[], blocked: boolean, blockedAt: number|null,
 *   steps: number,
 * }}
 */
export function runProgram(world, program) {
  const start = { ...world.start };
  let pos = { ...start };
  const collected = [];
  const trace = [];
  const steps = flatten(program);

  let blocked = false;
  let blockedAt = null;

  for (let i = 0; i < steps.length; i += 1) {
    const s = steps[i];
    let event = 'ok';

    if (s.kind === 'AVANCER') {
      const d = DELTA[mod4(pos.heading)];
      const next = { col: pos.col + d.col, row: pos.row + d.row };
      if (isWalkable(world, next.col, next.row)) {
        pos = { ...next, heading: pos.heading };
      } else {
        event = 'blocked';
        blocked = true;
        blockedAt = i;
      }
    } else if (s.kind === 'GAUCHE') {
      pos = { ...pos, heading: turnLeft(pos.heading) };
    } else if (s.kind === 'DROITE') {
      pos = { ...pos, heading: turnRight(pos.heading) };
    } else if (s.kind === 'RAMASSER') {
      const here = (world.items || []).find((it) => it.col === pos.col && it.row === pos.row);
      if (here && !collected.includes(cellId(here.col, here.row))) {
        collected.push(cellId(here.col, here.row));
        event = 'picked';
      } else {
        event = 'nothing';
      }
    }

    trace.push({ pos: { ...pos }, kind: s.kind, srcIndex: s.srcIndex, iteration: s.iteration, event });

    if (event === 'blocked') break;
  }

  return { trace, start, final: { ...pos }, collected, blocked, blockedAt, steps: steps.length };
}

/* ══ Évaluer une mission ══════════════════════════════════════════════ */

/**
 * Évalue le RÉSULTAT DE L'EXÉCUTION (jamais la forme du programme) : c'est
 * la règle du brief — plusieurs algorithmes corrects sont acceptés.
 *
 * `mission.requireItems` (déf. true si le monde porte des objets) exige que
 * tout ait été ramassé ; `mission.maxCards` contraint la TAILLE du programme
 * écrit (ce qui rend la boucle nécessaire), jamais sa forme exacte.
 */
export function evaluateRun(world, program, mission = {}) {
  const result = runProgram(world, program);
  const needItems = mission.requireItems ?? (world.items || []).length > 0;

  const onTarget = world.target ? sameCell(result.final, world.target) : true;
  const gotItems = !needItems || result.collected.length === (world.items || []).length;
  const withinCards = mission.maxCards == null || (program || []).length <= mission.maxCards;

  return {
    ...result,
    onTarget,
    gotItems,
    withinCards,
    success: onTarget && gotItems && withinCards && !result.blocked,
  };
}

/**
 * Premier pas où deux traces divergent, ou -1. Sert au module de débogage :
 * l'erreur se REPÈRE à l'endroit où le robot quitte le bon chemin, au lieu
 * d'être coloriée en rouge d'avance.
 */
export function diffTrace(traceA, traceB) {
  const n = Math.max(traceA.length, traceB.length);
  for (let i = 0; i < n; i += 1) {
    const a = traceA[i];
    const b = traceB[i];
    if (!a || !b) return i;
    if (!sameCell(a.pos, b.pos) || mod4(a.pos.heading) !== mod4(b.pos.heading)) return i;
  }

  return -1;
}

/* ══ Affichage ════════════════════════════════════════════════════════ */

/** « AVANCER, TOURNER →, RÉPÉTER 3 × (AVANCER) » — pour les résumés et l'ARIA. */
export function formatProgram(program) {
  if (!program || program.length === 0) return 'programme vide';

  return program
    .map((n) =>
      n.kind === 'REPETER'
        ? `RÉPÉTER ${n.times} × (${(n.body || []).map((b) => INSTRUCTION_LABELS[b.kind].label).join(', ') || 'vide'})`
        : INSTRUCTION_LABELS[n.kind].label
    )
    .join(', ');
}

/** « ROBI est en colonne 2, ligne 1, tourné vers le haut ». */
export function describePosition(pos) {
  return `colonne ${pos.col}, ligne ${pos.row}, tourné vers ${describeHeading(pos.heading)}`;
}
