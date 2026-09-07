import React from 'react';
import { formatNumber, formatPercent, DraggableSplitBar } from '../../../../../common/stats';

/**
 * PopulationSplitter — LE laboratoire d'ouverture de la leçon.
 *
 * Activité (INTERACTION_PEDAGOGY §24) :
 *  - objectif : rendre visible qu'une part ne se lit QUE par rapport à un
 *    tout, et qu'une part d'une part se rapporte à un tout plus petit ;
 *  - action de l'élève : SAISIR LA SÉPARATION elle-même et la faire glisser
 *    (DraggableSplitBar) — le geste est le découpage, sans intermédiaire ;
 *  - variable contrôlée : l'effectif de chaque sous-groupe (pas la
 *    proportion : c'est la proportion qui doit apparaître comme CONSÉQUENCE) ;
 *  - conséquence visuelle immédiate : la barre se recolore et les trois
 *    écritures de la part se recalculent pendant le glissement, sans clic.
 *
 * Le pas est de 1 élève : l'élève balaie toute la population sans marche
 * d'escalier, et peut viser un effectif précis.
 *
 * Le second niveau (les internes) a sa PROPRE barre, dessinée à l'échelle du
 * lycée entier et bornée à la part qui la contient : le sous-groupe se voit
 * comme un morceau du groupe, jamais comme une barre autonome.
 *
 * RÈGLE GÉNÉRALE DU PROJET : jamais figé après validation (pas de
 * `disabled`) ; `lockPart` sert aux figures d'illustration pilotées.
 */
export default function PopulationSplitter({
  total,
  part,
  onPartChange,
  sub = null,
  onSubChange = null,
  step = 1,
  labels = { whole: 'élèves du lycée', part: 'demi-pensionnaires', sub: 'internes' },
  lockPart = false,
  showReadings = true,
  reading = 'part',
}) {
  const pPart = total ? part / total : 0;
  const pSubInPart = part ? (sub ?? 0) / part : 0;
  const pSubInWhole = total ? (sub ?? 0) / total : 0;

  const setPart = (v) => {
    onPartChange(v);
    // Contrainte mathématique : un sous-groupe ne peut pas déborder du groupe
    // qui le contient.
    if (sub !== null && onSubChange && sub > v) onSubChange(v);
  };

  const current = reading === 'part' ? pPart : reading === 'sub-in-part' ? pSubInPart : pSubInWhole;
  const currentLabel = reading === 'part'
    ? `${labels.part} parmi les ${labels.whole}`
    : reading === 'sub-in-part'
      ? `${labels.sub} parmi les ${labels.part}`
      : `${labels.sub} parmi les ${labels.whole}`;
  const currentNum = reading === 'part' ? part : (sub ?? 0);
  const currentDen = reading === 'sub-in-part' ? part : total;

  return (
    <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-4">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Les {total} {labels.whole}{lockPart ? '' : ' — attrape le trait noir et fais-le glisser'}
        </p>
        <DraggableSplitBar
          total={total}
          value={part}
          onChange={setPart}
          step={step}
          locked={lockPart}
          height={58}
          labels={{ part: labels.part, rest: '' }}
          ariaLabel={`Nombre de ${labels.part}`}
          valueText={`${part} ${labels.part} sur ${total}, soit ${formatPercent(pPart, 1)}`}
        />
      </div>

      {sub !== null && onSubChange && (
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Parmi ces {part} {labels.part} — attrape le second trait
          </p>
          {/* Même échelle que la barre du haut (total = le lycée), mais la
              poignée est bornée à `part` : le sous-groupe reste dedans. */}
          <DraggableSplitBar
            total={total}
            value={sub}
            onChange={(v) => onSubChange(Math.min(part, v))}
            step={step}
            height={34}
            colors={{ part: '#0ea5e9', rest: '#eef2f7' }}
            labels={{ part: labels.sub, rest: '' }}
            ariaLabel={`Nombre de ${labels.sub}`}
            valueText={`${sub} ${labels.sub} sur ${part} ${labels.part}, soit ${formatPercent(pSubInPart, 1)} d’entre eux`}
          >
            {/* Le contour de la part qui contient le sous-groupe : la borne
                se voit, elle n'est pas seulement appliquée. */}
            <rect x={0} y={0} width={(part / total) * 1000} height={34}
              fill="#4f46e5" fillOpacity="0.14" stroke="#4f46e5" strokeOpacity="0.5"
              strokeWidth="2" strokeDasharray="6 4" rx="6" />
          </DraggableSplitBar>
        </div>
      )}

      {showReadings && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">{currentLabel}</p>
          <div className="flex items-baseline gap-2 flex-wrap font-mono text-sm text-indigo-900">
            <span className="tabular-nums">{currentNum} / {currentDen}</span>
            <span className="text-indigo-300">=</span>
            <span className="tabular-nums">{formatNumber(current, 4)}</span>
            <span className="text-indigo-300">=</span>
            <span className="text-lg font-black tabular-nums">{formatPercent(current, 1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
