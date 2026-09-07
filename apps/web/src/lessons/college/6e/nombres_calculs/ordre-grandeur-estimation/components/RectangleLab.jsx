import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useDragValue } from '../../../../../common/manip6e';
import { formatFr } from './estimationUtils';

/**
 * RectangleLab — arrondir les DEUX côtés d'un produit, et voir la surface.
 *
 * Activity: tirer les deux côtés d'un rectangle pour remplacer 49 × 21 par un
 *   rectangle aux dimensions rondes, et lire la surface obtenue.
 * Mathematical objective: un produit est une SURFACE. Arrondir les facteurs
 *   déforme un peu le rectangle sans changer sa taille d'ensemble — c'est ce
 *   qui rend l'estimation d'un produit légitime.
 * Student action: on saisit le côté droit (le premier facteur) ou le côté bas
 *   (le second) ; la surface se recalcule sous le doigt.
 * Controlled variable: les deux facteurs arrondis.
 * Mathematical state: {a, b}. Le rectangle, la surface affichée et l'écart au
 *   rectangle exact en dérivent.
 * Visual consequence: le rectangle exact reste dessiné en pointillé DERRIÈRE
 *   celui de l'élève : on voit le peu qu'on a ajouté ou retiré.
 * Expected observation: on peut bouger les deux côtés de plusieurs unités et
 *   rester à la même taille de surface ; en revanche, un zéro d'écart sur un
 *   côté fait exploser le rectangle.
 * Misconception targeted: « arrondir les deux facteurs fausse trop le
 *   résultat ». Le rectangle en pointillé montre exactement ce qu'on perd.
 * Feedback: aucun jugement ici — le module interprète.
 * Formalization: la brique « produit-rectangle » est posée après le geste.
 * Scaffolding: les deux prises restent vivantes en permanence ; le clavier
 *   atteint les mêmes états.
 *
 * §17bis — le cadre a une taille fixe (dimensionné pour les facteurs maximaux),
 * donc aucun rectangle atteignable ne peut en sortir ; les nombres vivent dans
 * le DOM sous la figure.
 */

const W = 460;
const H = 268;   // cadre + couloir : pas de bande morte sous le curseur
const PAD = 34;
const LANE = 74;   // couloir de réglage du second facteur, sous le cadre

export default function RectangleLab({
  a, b, onA, onB,
  exactA, exactB,
  maxA = 80, maxB = 40,
  stepA = 10, stepB = 5,
}) {
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1);
  // Quelle des deux prises a le focus : l'anneau se dessine alors sur la
  // pastille VISIBLE, à la place du contour du navigateur sur la zone de
  // captation transparente (qui, elle, fait 44 px et n'entoure rien de visible).
  const [focused, setFocused] = useState(null);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0) setScale(W / r.width);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  const grip = Math.max(26, 45 * scale);

  const innerW = W - 2 * PAD;
  const innerH = H - 2 * PAD - LANE;

  const wOf = (v) => (v / maxA) * innerW;
  const hOf = (v) => (v / maxB) * innerH;

  const dragA = useDragValue({
    value: a, onChange: onA, min: stepA, max: maxA, step: stepA, axis: 'x',
    ariaLabel: 'Premier facteur arrondi : glisse le côté droit du rectangle',
    valueText: (v) => `${v} sur ${b}, surface ${formatFr(v * b)}`,
  });
  const dragB = useDragValue({
    value: b, onChange: onB, min: stepB, max: maxB, step: stepB, axis: 'x',
    ariaLabel: 'Second facteur arrondi : glisse le curseur du couloir',
    valueText: (v) => `${a} sur ${v}, surface ${formatFr(a * v)}`,
  });

  /* Les deux hooks mesurent leur course sur le même cadre : on fusionne les
     refs, sinon le second écraserait le premier et une prise serait morte. */
  const setRefs = useCallback((node) => {
    svgRef.current = node;
    const ra = dragA.frameProps.ref;
    const rb = dragB.frameProps.ref;
    if (ra) ra.current = node;
    if (rb) rb.current = node;
  }, [dragA.frameProps.ref, dragB.frameProps.ref]);

  const myW = wOf(a);
  const myH = hOf(b);
  const exW = wOf(exactA);
  const exH = hOf(exactB);
  const laneY = PAD + innerH + 8;
  // Le curseur du couloir a un rayon de 10 : la piste est rentrée d'autant.
  const LANE_R = 11;
  const laneX = PAD + LANE_R;
  const laneW = innerW - 2 * LANE_R;

  return (
    <div className="space-y-3" role="group" aria-label="Rectangle d’estimation" data-rl-a={a} data-rl-b={b} data-rl-area={a * b}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden">
        <svg
          ref={setRefs}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block select-none"
          style={{ touchAction: 'none' }}
          role="group"
          aria-label={`Rectangle ${a} sur ${b}, surface ${a * b}`}
        >
          <rect x={PAD} y={PAD} width={innerW} height={innerH} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" rx="8" />

          {/* Le rectangle EXACT, en pointillé : la référence qu'on approche. */}
          <g pointerEvents="none">
            <rect x={PAD} y={PAD} width={exW} height={exH} fill="none" stroke="#0f766e" strokeWidth="2.5" strokeDasharray="6 4" />
          </g>

          {/* Le rectangle de l'élève. */}
          <g pointerEvents="none">
            <rect x={PAD} y={PAD} width={myW} height={myH} fill="#6366f1" opacity="0.18" stroke="#4338ca" strokeWidth="2.5" rx="3" />
          </g>

          {/* Prise 1 : le côté DROIT — le premier facteur. */}
          <rect
            x={PAD + myW - grip / 2} y={PAD} width={grip} height={innerH}
            fill="transparent" cursor="ew-resize"
            {...dragA.handleProps} {...dragA.a11yProps}
            style={{ ...dragA.handleProps.style, outline: 'none' }}
            onFocus={() => setFocused('a')}
            onBlur={() => setFocused(null)}
          />
          <g pointerEvents="none">
            <line x1={PAD + myW} y1={PAD} x2={PAD + myW} y2={PAD + innerH} stroke="#312e81" strokeWidth="3" />
            {/* L'anneau de focus sur la pastille visible. Rayon 14 : la pastille
                est au milieu de la hauteur du cadre, et son abscisse va de
                PAD + wOf(stepA) à PAD + innerW — au maximum elle touche le bord
                droit du cadre intérieur, à 34 px du bord du SVG (§17bis). */}
            {focused === 'a' && <circle cx={PAD + myW} cy={PAD + innerH / 2} r="14" fill="none" stroke="#4338ca" strokeWidth="3" opacity="0.9" />}
            <circle cx={PAD + myW} cy={PAD + innerH / 2} r="9" fill="#312e81" stroke="#fff" strokeWidth="2.5" />
          </g>

          {/* Prise 2 : le couloir sous le cadre — le second facteur. Un couloir
              séparé plutôt que le côté bas : deux poignées de 44 px ne peuvent
              pas être disjointes autour d'un petit rectangle à 375 px. */}
          <text x={PAD} y={laneY + grip / 2 - 12} fontSize="12" fill="#0f766e" fontFamily="ui-monospace, monospace" fontWeight="700">
            second facteur
          </text>
          <rect
            x={PAD} y={laneY} width={innerW} height={grip}
            fill="transparent" cursor="ew-resize"
            {...dragB.handleProps} {...dragB.a11yProps}
            style={{ ...dragB.handleProps.style, outline: 'none' }}
            onFocus={() => setFocused('b')}
            onBlur={() => setFocused(null)}
          />
          <g pointerEvents="none">
            <rect x={laneX} y={laneY + grip / 2 - 5} width={laneW} height={10} rx="5" fill="#ccfbf1" stroke="#5eead4" strokeWidth="1.5" />
            <rect x={laneX} y={laneY + grip / 2 - 5} width={(b / maxB) * laneW} height={10} rx="5" fill="#14b8a6" />
            {/* Anneau de focus : rayon 15 autour d'une pastille de rayon 10, dont
                la piste est déjà rentrée de LANE_R = 11 depuis PAD = 34 — le
                bord de l'anneau reste donc à ≥ 30 px des bords du SVG, aux deux
                extrémités de la course (§17bis). */}
            {focused === 'b' && <circle cx={laneX + (b / maxB) * laneW} cy={laneY + grip / 2} r="15" fill="none" stroke="#0f766e" strokeWidth="3" opacity="0.9" />}
            <circle cx={laneX + (b / maxB) * laneW} cy={laneY + grip / 2} r="10" fill="#0f766e" stroke="#fff" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 py-2">
          <div className="font-mono font-black text-xl text-indigo-800 tabular-nums">{a}</div>
          <div className="text-xs text-indigo-700">1er facteur</div>
        </div>
        <div className="rounded-xl border-2 border-teal-200 bg-teal-50 py-2">
          <div className="font-mono font-black text-xl text-teal-800 tabular-nums">{b}</div>
          <div className="text-xs text-teal-700">2e facteur</div>
        </div>
        <div className="rounded-xl border-2 border-slate-300 bg-slate-900 py-2" role="status" aria-live="polite">
          <div className="font-mono font-black text-xl text-amber-300 tabular-nums">{formatFr(a * b)}</div>
          <div className="text-xs text-slate-300">surface</div>
        </div>
      </div>

      <p className="text-center text-xs font-mono text-slate-500">
        {a} × {b} = {formatFr(a * b)} — rectangle exact en pointillé : {exactA} × {exactB} = {formatFr(exactA * exactB)}
      </p>
    </div>
  );
}
