import React from 'react';
import MathText from '../../../../../common/components/MathText';

/**
 * FactorLadder — les quatre écritures d'un même produit, empilées.
 *
 * LA correction pédagogique de la leçon tient dans ce composant. L'ancienne
 * version passait de 3² × 3³ à 3⁵ d'un coup : le résultat apparaissait, et
 * l'élève devait le croire. Or l'étape sautée EST la démonstration :
 *
 *     3² × 3³            ce qu'on a
 *     (3×3) × (3×3×3)    ce que ça VEUT DIRE      ← jamais montrée avant
 *     3×3×3×3×3          ce qu'on obtient          ← jamais montrée avant
 *     3⁵                 comment on l'écrit court
 *
 * Chaque ligne RESTE affichée quand la suivante arrive : la progression est
 * lisible d'un coup d'œil, et l'élève peut redescendre la chaîne pour se
 * convaincre. Rien n'est remplacé, rien ne disparaît.
 *
 * Les lignes n'apparaissent pas toutes seules : le module les débloque au
 * rythme de l'élève (il compte, il répond), jamais sur minuterie. Voir
 * `Module03EmpilerLesTours` — c'est la réponse de l'élève qui fait avancer.
 *
 * @param {{tex: string, caption: string, tone?: string}[]} rungs
 * @param {number} shown  combien de barreaux sont atteints
 */
const TONE = {
  base: 'border-slate-200 bg-white',
  meaning: 'border-indigo-300 bg-indigo-50',
  flat: 'border-sky-300 bg-sky-50',
  short: 'border-emerald-400 bg-emerald-50',
};

export default function FactorLadder({ rungs, shown }) {
  return (
    <ol className="space-y-2" aria-label="Les écritures successives du même produit">
      {rungs.slice(0, Math.max(0, shown)).map((r, i) => (
        <li
          key={r.tex}
          className={`rounded-xl border-2 p-3 text-center space-y-1 ${TONE[r.tone] || TONE.base}`}
        >
          <MathText className="text-lg sm:text-xl text-slate-900 break-words">
            {`$${r.tex}$`}
          </MathText>
          <p className="text-xs text-slate-600">{r.caption}</p>
          {i === shown - 1 && shown < rungs.length && (
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 pt-0.5">
              à suivre…
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
