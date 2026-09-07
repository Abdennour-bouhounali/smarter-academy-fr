import React, { useRef, useState } from 'react';
import Balance from './Balance';
import ItemBank from './ItemBank';
import { formatMass } from './massUtils';

/**
 * BothSidesLab — l'élève GLISSE des poids de 50 g sur une balance qui part
 * déjà à l'équilibre, d'un côté ou des deux.
 *
 * ACTION          on attrape un poids dans la réserve et on le DÉPOSE sur un
 *                 plateau (glisser-déposer réel, Pointer Events : doigt et
 *                 souris). Chemin clavier conservé via les boutons ← → de la
 *                 réserve, comme partout ailleurs dans la leçon.
 * TRANSFORMATION  la balance penche… ou reste horizontale. Immédiatement,
 *                 sans clic de validation.
 * SENS MATH.      l'équilibre est une ÉGALITÉ. Ajouter la même masse des deux
 *                 côtés la conserve ; n'ajouter que d'un côté la casse. Les
 *                 deux totaux affichés le disent en chiffres au même moment.
 * FEEDBACK        les deux sommes, et le verdict de la balance elle-même.
 * GÉNÉRALISATION  ce qui compte n'est pas COMBIEN d'objets il y a de chaque
 *                 côté, mais si les deux sommes restent égales.
 *
 * Surprise contrôlée visée : les plateaux se remplissent — il y a de plus en
 * plus d'objets, et de plus en plus lourd de chaque côté — et pourtant rien
 * ne bouge. L'élève qui croit que « plus lourd = ça penche » est contredit
 * par ses propres mains.
 *
 * Les totaux sont CALCULÉS depuis les poids réellement posés (`reduce`),
 * jamais écrits : la balance ne peut pas mentir sur ce qu'elle montre.
 *
 * Aucune prop `disabled` : la manipulation ne se fige jamais après validation
 * de l'étape (règle projet du 2026-09-06).
 */

/** L'assiette de départ : 200 g de chaque côté, déjà à l'équilibre. */
const BASE_LEFT = [{ id: 'b-l', emoji: '⬛', label: '200 g', mass: 200 }];
const BASE_RIGHT = [{ id: 'b-r', emoji: '⬛', label: '200 g', mass: 200 }];

const ADD_MASS = 50;
/** La réserve : six poids de 50 g, à glisser où l'on veut. */
const POOL = Array.from({ length: 6 }, (_, i) => ({
  id: `p${i}`,
  emoji: '🔘',
  label: `${ADD_MASS} g`,
  mass: ADD_MASS,
}));

/** Zone (gauche/droite/aucune) dont le rectangle contient le point (x, y). */
function zoneAt(x, y, leftZoneRef, rightZoneRef) {
  const l = leftZoneRef.current?.getBoundingClientRect();
  if (l && x >= l.left && x <= l.right && y >= l.top && y <= l.bottom) return 'left';
  const r = rightZoneRef.current?.getBoundingClientRect();
  if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return 'right';
  return null;
}

export default function BothSidesLab({ onAction }) {
  // Où chaque poids de la réserve a été posé : { p0: 'left', p2: 'right', … }
  const [placement, setPlacement] = useState({});
  const [dragging, setDragging] = useState(false);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  const addedLeft = POOL.filter((it) => placement[it.id] === 'left');
  const addedRight = POOL.filter((it) => placement[it.id] === 'right');

  const left = [...BASE_LEFT, ...addedLeft];
  const right = [...BASE_RIGHT, ...addedRight];
  const totalLeft = left.reduce((s, it) => s + it.mass, 0);
  const totalRight = right.reduce((s, it) => s + it.mass, 0);
  const balanced = totalLeft === totalRight;

  const place = (id, zone) => {
    if (!zone) return;
    const next = { ...placement, [id]: zone };
    setPlacement(next);
    // On signale au module l'ÉTAT de la balance APRÈS ce dépôt — équilibre ou
    // déséquilibre — et non le plateau visé : c'est le comportement observé
    // qui fait progresser l'étape, pas le geste employé pour l'obtenir.
    const l = BASE_LEFT.reduce((s, it) => s + it.mass, 0)
      + POOL.filter((it) => next[it.id] === 'left').reduce((s, it) => s + it.mass, 0);
    const r = BASE_RIGHT.reduce((s, it) => s + it.mass, 0)
      + POOL.filter((it) => next[it.id] === 'right').reduce((s, it) => s + it.mass, 0);
    onAction?.(l === r ? 'equilibre' : 'desequilibre');
  };

  const handleRelease = (id, x, y) => place(id, zoneAt(x, y, leftZoneRef, rightZoneRef));

  /** Reprendre un poids posé : on le renvoie dans la réserve. */
  const takeBack = (id) => {
    if (id === 'b-l' || id === 'b-r') return;   // les 200 g de base restent
    setPlacement((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  };

  const reset = () => {
    setPlacement({});
    onAction?.('reset');
  };

  return (
    <div className="space-y-3">
      {/* La réserve : vrai glisser-déposer (framer-motion `drag`), avec les
          deux boutons ← → sous chaque poids comme chemin clavier. */}
      <ItemBank
        items={POOL}
        placement={placement}
        onDragRelease={handleRelease}
        onDraggingChange={setDragging}
        onPlace={place}
      />

      <Balance
        left={left}
        right={right}
        showValues
        unit="g"
        dragging={dragging}
        leftZoneRef={leftZoneRef}
        rightZoneRef={rightZoneRef}
        onItemTap={takeBack}
        ariaLabel="Balance en équilibre : dépose des poids d’un côté ou des deux"
      />

      {/* Le compte rendu chiffré, dans le DOM (§6ter.5) : deux sommes et leur
          comparaison, dérivées des poids réellement posés. */}
      <div
        className={`rounded-xl border-2 p-3 text-center font-mono text-sm font-bold tabular-nums ${
          balanced
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : 'border-amber-300 bg-amber-50 text-amber-900'
        }`}
        role="status"
        aria-live="polite"
        data-testid="bothsides-readout"
      >
        {formatMass(totalLeft, 'g')} {balanced ? '=' : totalLeft > totalRight ? '>' : '<'}{' '}
        {formatMass(totalRight, 'g')}
        <span className="ml-2 font-sans font-semibold">
          {balanced ? '— toujours en équilibre' : '— la balance penche'}
        </span>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold
                     text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Repartir de 200 g / 200 g
        </button>
      </div>
    </div>
  );
}
