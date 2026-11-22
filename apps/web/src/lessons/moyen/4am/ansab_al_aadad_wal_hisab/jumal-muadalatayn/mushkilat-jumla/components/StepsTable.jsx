import MathText from '../../../../../../common/components/MathText';
import { bidi } from '../../../../../../../utils/bidi';
import { ACTIVITY, STEPS_TABLE } from '../content/textbook';

/**
 * Le tableau des CINQ étapes (« مراحل الحل », plateforme — rollout 2026-11-12, design L3 §4) : chaque étape, ce qu'on y fait, et ce qu'elle a
 * donné dans « نادي الرسم », la manche 1 que l'élève vient de jouer au labo. Aucune référence au manuel. Une formule ne se coupe jamais
 * (`whitespace-nowrap` dans la cellule, la ligne passe sous l'étape quand la colonne est étroite).
 */
export default function StepsTable() {
  const [c0, c1, c2] = ACTIVITY.tableColumns;
  return (
    <div className="space-y-1.5" role="table" aria-label={c0} data-steps-table data-paging-keep>
      <div role="row" className="grid grid-cols-[13rem_8rem_1fr] gap-2 px-2 text-xs font-extrabold text-indigo-900">
        <span role="columnheader">{c0}</span><span role="columnheader">{c1}</span><span role="columnheader">{c2}</span>
      </div>
      {STEPS_TABLE.map((row) => (
        <div key={row.task} role="row" className="grid grid-cols-[13rem_8rem_1fr] items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-sm" data-steps-row>
          <span role="rowheader" className="font-bold text-indigo-900"><MathText>{row.stage}</MathText></span>
          <span role="cell" className="text-slate-700">{bidi(row.task)}</span>
          <span role="cell" className="font-bold text-slate-900"><MathText>{row.done}</MathText></span>
        </div>
      ))}
    </div>
  );
}
