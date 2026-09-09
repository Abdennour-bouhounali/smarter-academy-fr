import React, { useMemo } from 'react';
import { ratToNumber, exprEval, rat, ratSub, ratIsZero } from './exprCore';
import {
  balanceGeometry, W, H, PIVOT_X, PIVOT_Y, PAN_DROP, PAN_HALF_WIDTH, PAN_DEPTH,
} from './balanceGeometry';

/**
 * BalanceScale — LA balance, manipulation signature de « Équations ».
 *
 * Activity              agir sur les DEUX plateaux à la fois : retirer la
 *                       même chose de chaque côté, ou diviser les deux.
 * Mathematical objective une équation est une ÉGALITÉ qu'on a le droit de
 *                       transformer — à condition de faire des deux côtés
 *                       le même geste. Résoudre, c'est isoler l'inconnue
 *                       sans jamais rompre l'équilibre.
 * Student action        choisir un geste dans la barre d'outils du module ;
 *                       la balance rend le résultat.
 * Controlled variable   l'équation, détenue par le MODULE (composant
 *                       contrôlé : aucun état interne — §6 du brief).
 * Mathematical state    `{left, right}`, deux expressions du premier degré.
 * Visual consequence    le fléau PENCHE quand les deux plateaux ne portent
 *                       pas la même valeur pour la valeur d'essai, et revient
 *                       à l'horizontale dès que les deux membres s'égalisent.
 * Expected observation  « quoi que je retire, tant que je le retire des deux
 *                       côtés, la balance reste droite » — et réciproquement,
 *                       un geste d'un seul côté la fait basculer aussitôt.
 * Misconception targeted « je fais passer le 3 de l'autre côté en changeant
 *                       son signe », appris comme un tour de magie : ici le 3
 *                       ne « passe » pas, il est RETIRÉ des deux plateaux, et
 *                       on voit pourquoi il disparaît à gauche.
 *
 * L'INCLINAISON EST MATHÉMATIQUE, pas décorative (§16). L'angle vient de
 * l'écart réel entre les deux membres évalués en `probe` : la balance
 * n'« joue pas une animation », elle AFFICHE une différence.
 *
 * SÉCURITÉ VISUELLE (§17bis). La géométrie vit dans `balanceGeometry.js` et
 * son test la balaie sur toute la plage d'écarts — aucun état atteignable ne
 * sort du viewBox. Les expressions, elles, sont dans le DOM au-dessus des
 * plateaux : une écriture longue défile dans son cadre, elle ne déborde
 * jamais sur le dessin.
 */
export default function BalanceScale({
  equation,             // {left, right} — l'état, détenu par le module
  probe,                // valeur d'inconnue servant à peser
  leftLabel,            // ReactNode — l'écriture du membre gauche
  rightLabel,           // ReactNode — l'écriture du membre droit
  caption,              // légende sous la balance
  forceLevel = false,   // rendre la balance horizontale quoi qu'il arrive
}) {
  const geom = useMemo(() => {
    if (forceLevel) return balanceGeometry(0);
    try {
      const p = probe === undefined ? rat(0) : typeof probe === 'number' ? rat(probe) : probe;
      const diff = ratSub(exprEval(equation.left, p), exprEval(equation.right, p));
      return balanceGeometry(ratIsZero(diff) ? 0 : ratToNumber(diff));
    } catch {
      return balanceGeometry(0);
    }
  }, [equation, probe, forceLevel]);

  const { leftEnd, rightEnd, level } = geom;
  const stroke = level ? '#059669' : '#dc2626';
  const fill = level ? '#d1fae5' : '#fee2e2';
  const ease = 'all 320ms cubic-bezier(0.4, 0, 0.2, 1)';

  const Pan = ({ at }) => (
    <g>
      <line
        x1={at.x} y1={at.y} x2={at.x} y2={at.y + PAN_DROP}
        stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"
      />
      <path
        d={`M ${at.x - PAN_HALF_WIDTH} ${at.y + PAN_DROP} L ${at.x + PAN_HALF_WIDTH} ${at.y + PAN_DROP} L ${at.x + PAN_HALF_WIDTH - 8} ${at.y + PAN_DROP + PAN_DEPTH} L ${at.x - PAN_HALF_WIDTH + 8} ${at.y + PAN_DROP + PAN_DEPTH} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      {/* Les DEUX membres, dans le DOM : ils se replient, ils ne débordent pas. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-2">
        <div className="min-w-0 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-2 text-center overflow-x-auto">
          {leftLabel}
        </div>
        <div className={`text-xl font-black ${level ? 'text-emerald-600' : 'text-rose-500'}`} aria-hidden="true">
          {level ? '=' : '≠'}
        </div>
        <div className="min-w-0 rounded-xl border-2 border-slate-200 bg-slate-50 px-2 py-2 text-center overflow-x-auto">
          {rightLabel}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={
          level
            ? 'Balance à l’équilibre : les deux membres ont la même valeur.'
            : 'Balance déséquilibrée : les deux membres n’ont pas la même valeur.'
        }
      >
        <path d={`M ${PIVOT_X - 30} ${H - 8} L ${PIVOT_X + 30} ${H - 8}`} stroke="#475569" strokeWidth="5" strokeLinecap="round" />
        <line x1={PIVOT_X} y1={PIVOT_Y} x2={PIVOT_X} y2={H - 10} stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

        <line
          x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y}
          stroke={stroke} strokeWidth="5" strokeLinecap="round"
          style={{ transition: ease }}
        />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r="6" fill="#475569" />

        <g style={{ transition: ease }}>
          <Pan at={leftEnd} />
          <Pan at={rightEnd} />
        </g>
      </svg>

      {caption && <p className="mt-1 text-center text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
