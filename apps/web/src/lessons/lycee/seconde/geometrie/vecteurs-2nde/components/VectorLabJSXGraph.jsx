import React, { useCallback, useRef, useState } from 'react';
import { JSXGraphBoard } from '../../../../../common/math-visualization/jsxgraph';
import VectorLab from './VectorLab';
import { clampOrigin, snapClamp } from '../../../../../common/math-visualization/jsxgraph/pilotMath';
import { RANGE, add, describeMove, formatVec } from './vecteurUtils';

/** Aimantation à la case, par les helpers PURS et testés du pilote. */
const snapToGrid = (p, range) => ({
  x: snapClamp(p.x, range.xMin, range.xMax, 1),
  y: snapClamp(p.y, range.yMin, range.yMax, 1),
});

/**
 * VectorLabJSXGraph — VARIANTE PILOTE de VectorLab, mode 'move' (module 2,
 * étape 1 : « promène la flèche »). Voir docs/experiments/JSXGRAPH_PILOT.md.
 *
 * MÊME MATHÉMATIQUE, MÊME CONTRAT. Le modèle reste `vecteurUtils` : ce
 * composant ne recalcule rien, il ne change QUE la couche de rendu et de
 * geste. C'est la seule façon de comparer honnêtement les deux
 * visualisations — un écart mathématique invaliderait la comparaison.
 *
 * CE QUE LE PILOTE TESTE, et rien d'autre : le glisser CONTINU. Dans
 * VectorLab, l'élève tire A d'une case à l'autre (aimanté au pas 1) ; la
 * flèche saute de case en case. Ici, A suit le doigt en continu et
 * s'aimante au relâchement : la flèche GLISSE, identique à elle-même, ce
 * qui est exactement l'observation que l'étape demande (« c'est toujours la
 * même flèche »).
 *
 * CONTRAT RESPECTÉ :
 *  - jamais gelé : `disabled` n'est PAS branché sur « étape réussie » ; le
 *    composant reste manipulable après validation (contrat leçon).
 *  - React ne voit pas les images intermédiaires : pendant le glisser, seul
 *    le plateau bouge. L'état React est poussé au relâchement, aimanté à la
 *    grille — l'aimantation est donc lisible dans les DEUX implémentations.
 *  - repli : si JSXGraph échoue, on rend le VectorLab d'origine.
 */
export default function VectorLabJSXGraph({
  origin,
  vector,
  onOriginChange,
  ghosts = [],
  range = RANGE,
  names = { origin: 'A', tip: 'B', vector: 'u' },
  disabled = false,
  ariaLabel,
  ...rest
}) {
  const [live, setLive] = useState(null);      // position pendant le glisser
  const commitRef = useRef(onOriginChange);
  commitRef.current = onOriginChange;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const shown = live ?? origin;

  const setup = useCallback((board, JXG, getData) => {
    const objs = {};

    // ── décor : grille et axes, dessinés une fois ──
    for (let k = range.xMin; k <= range.xMax; k += 1) {
      board.create('segment', [[k, range.yMin], [k, range.yMax]],
        { strokeColor: '#eef2f7', strokeWidth: 1, fixed: true, highlight: false, layer: 0 });
      board.create('segment', [[range.xMin, k], [range.xMax, k]],
        { strokeColor: '#eef2f7', strokeWidth: 1, fixed: true, highlight: false, layer: 0 });
    }
    board.create('axis', [[0, 0], [1, 0]], { strokeColor: '#94a3b8', ticks: { visible: false }, fixed: true, highlight: false });
    board.create('axis', [[0, 0], [0, 1]], { strokeColor: '#94a3b8', ticks: { visible: false }, fixed: true, highlight: false });

    // ── les fantômes (flèches déjà posées) : recréés quand leur nombre change ──
    objs.ghosts = [];
    const syncGhosts = (list) => {
      if (objs.ghosts.length === list.length) return;
      for (const g of objs.ghosts) board.removeObject(g);
      objs.ghosts = list.map((g) => {
        const tip = add(g.origin, g.vector);
        return board.create('arrow', [[g.origin.x, g.origin.y], [tip.x, tip.y]], {
          strokeColor: '#94a3b8', strokeWidth: 3, fixed: true, highlight: false,
          lastArrow: { type: 2, size: 6 }, layer: 4,
        });
      });
    };

    // ── la flèche vivante ──
    const A = board.create('point', [origin.x, origin.y], {
      name: names.origin, size: 5, strokeWidth: 2,
      fillColor: '#4f46e5', strokeColor: '#ffffff',
      label: { offset: [-16, -14], fontSize: 15, cssStyle: 'font-weight:700' },
      showInfobox: false, snapToGrid: false, layer: 9,
    });
    const B = board.create('point', [
      () => A.X() + getData().vector.x,
      () => A.Y() + getData().vector.y,
    ], {
      name: names.tip, size: 5, strokeWidth: 2,
      fillColor: '#059669', strokeColor: '#ffffff', fixed: true,
      label: { offset: [10, 10], fontSize: 15, cssStyle: 'font-weight:700' },
      showInfobox: false, layer: 9,
    });
    board.create('arrow', [A, B], {
      strokeColor: '#7c3aed', strokeWidth: 4,
      lastArrow: { type: 2, size: 7 }, fixed: true, highlight: false, layer: 8,
    });

    // ── le geste : A suit le doigt, borné pour que B reste dans le cadre ──
    const clampA = () => {
      const p = clampOrigin({ x: A.X(), y: A.Y() }, getData().vector, range);
      if (p.x !== A.X() || p.y !== A.Y()) A.moveTo([p.x, p.y]);
      return p;
    };

    A.on('drag', () => {
      if (disabledRef.current) return;
      const p = clampA();
      setLive({ x: p.x, y: p.y });          // un rendu React par image : la
                                            // lecture DOM suit le doigt.
    });
    A.on('up', () => {
      if (disabledRef.current) return;
      const p = snapToGrid(clampA(), range);
      A.moveTo([p.x, p.y]);
      setLive(null);
      commitRef.current?.(p);               // l'état de la leçon s'aimante.
      board.update();
    });

    return (d) => {
      syncGhosts(d.ghosts ?? []);
      A.setAttribute({ fixed: !!d.disabled });
      if (!d.dragging && (A.X() !== d.origin.x || A.Y() !== d.origin.y)) {
        A.moveTo([d.origin.x, d.origin.y]);
      }
      board.update();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.xMin, range.xMax, range.yMin, range.yMax, names.origin, names.tip]);

  const tip = add(shown, vector);

  return (
    <div className="space-y-3">
      <JSXGraphBoard
        setup={setup}
        data={{ origin: shown, vector, ghosts, disabled, dragging: live !== null }}
        boundingbox={[range.xMin - 0.6, range.yMax + 0.6, range.xMax + 0.6, range.yMin - 0.6]}
        aspect={1}
        ariaLabel={ariaLabel ?? `Repère — flèche de ${names.origin} à ${names.tip}`}
        fallback={
          <VectorLab
            origin={origin} vector={vector} onOriginChange={onOriginChange}
            mode="move" range={range} names={names} ghosts={ghosts}
            disabled={disabled} ariaLabel={ariaLabel} {...rest}
          />
        }
      />
      {/* Le chemin non-pointeur, obligatoire : le glisser n'est jamais la
          seule façon de bouger A (accessibilité, contrat CoordPlane). */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Déplacer ${names.origin}`}>
        <span className="text-sm font-semibold text-slate-700">Déplacer {names.origin} :</span>
        {[
          { k: 'left', dx: -1, dy: 0, glyph: '←', label: 'vers la gauche' },
          { k: 'down', dx: 0, dy: -1, glyph: '↓', label: 'vers le bas' },
          { k: 'up', dx: 0, dy: 1, glyph: '↑', label: 'vers le haut' },
          { k: 'right', dx: 1, dy: 0, glyph: '→', label: 'vers la droite' },
        ].map((b) => {
          const next = { x: origin.x + b.dx, y: origin.y + b.dy };
          const nextTip = add(next, vector);
          const blocked = disabled
            || next.x < range.xMin || next.x > range.xMax || next.y < range.yMin || next.y > range.yMax
            || nextTip.x < range.xMin || nextTip.x > range.xMax || nextTip.y < range.yMin || nextTip.y > range.yMax;
          return (
            <button key={b.k} type="button" disabled={blocked}
              onClick={() => onOriginChange?.(next)}
              aria-label={`Déplacer ${names.origin} ${b.label}`}
              className="w-11 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold
                         disabled:bg-slate-200 disabled:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500">
              {b.glyph}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-slate-700" aria-live="polite">
        {names.origin} en <strong className="font-mono">{formatVec(shown)}</strong> ·{' '}
        {names.tip} en <strong className="font-mono">{formatVec(tip)}</strong> · déplacement{' '}
        <strong>{describeMove(vector)}</strong>
      </p>
    </div>
  );
}
