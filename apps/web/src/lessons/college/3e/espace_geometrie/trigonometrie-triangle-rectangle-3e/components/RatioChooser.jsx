import React from 'react';
import { chooseRatio, RATIO_DEF, SIDE_NAMES } from './trigoUtils';

/**
 * RatioChooser — LE geste méthodologique de la leçon.
 *
 * ACTION            l'élève désigne le côté CONNU puis le côté CHERCHÉ.
 * CHANGEMENT        le rapport à utiliser s'affiche, déduit des deux choix.
 * OBSERVATION       il y a toujours exactement un rapport qui relie deux côtés.
 * SENS MATHÉMATIQUE choisir sin, cos ou tan n'est pas une devinette : c'est
 *                   une conséquence des deux côtés en jeu.
 * FORMALISATION     l'élève apprend une procédure décidable, pas un acronyme.
 *
 * Le rapport n'est jamais passé en prop : il est CALCULÉ par `chooseRatio`.
 * Le composant ne peut donc pas proposer un rapport qui ne conviendrait pas.
 */
const SIDES = ['opp', 'adj', 'hyp'];

export default function RatioChooser({ known, wanted, onKnown, onWanted, disabled = false }) {
  const ratio = known && wanted ? chooseRatio(known, wanted) : null;

  const Row = ({ label, value, onPick, otherValue }) => (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {SIDES.map((s) => {
          const isSame = otherValue === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              disabled={disabled || isSame}
              aria-pressed={value === s}
              className={`px-3 py-2 rounded-lg border-2 min-h-[44px] text-sm font-semibold transition-colors ${
                value === s
                  ? 'border-violet-400 bg-violet-50 text-violet-800'
                  : isSame
                    ? 'border-slate-100 bg-slate-50 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
              }`}
            >
              {SIDE_NAMES[s]}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <Row label="Le côté que je CONNAIS" value={known} onPick={onKnown} otherValue={wanted} />
      <Row label="Le côté que je CHERCHE" value={wanted} onPick={onWanted} otherValue={known} />

      <div className={`rounded-xl border-2 p-3 text-center ${
        ratio ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
      }`} aria-live="polite">
        {ratio ? (
          <p className="text-sm text-emerald-900">
            Ces deux côtés sont reliés par{' '}
            <strong className="text-lg">{RATIO_DEF[ratio].nom}</strong> —{' '}
            <span className="font-mono">{RATIO_DEF[ratio].formule}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Choisis deux côtés <em>différents</em> : un connu, un cherché.
          </p>
        )}
      </div>
    </div>
  );
}
