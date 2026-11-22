import { useTranslation } from 'react-i18next';

// Les mêmes couleurs que « التقدّم بالتفصيل » (features/family/ProgressDetail.jsx).
export const STATES = [
  ['mastered', 'bg-emerald-500'],
  ['reinforce', 'bg-amber-400'],
  ['gap', 'bg-rose-500'],
  ['unassessed', 'bg-slate-300'],
];

/**
 * UNE distribution d'élèves (متحكَّم فيها · تعزيز · ثغرة · لم تُقيَّم) : une barre
 * et les quatre nombres dessous — jamais un pourcentage moyen. Partagée par
 * la carte « الكفاءات » et les rapports (écran, impression, projection).
 */
export default function Distribution({ counts, size = 'md' }) {
  const { t } = useTranslation('idara');
  const total = STATES.reduce((sum, [k]) => sum + (counts?.[k] ?? 0), 0);
  // `lg` : le projecteur (« وضع الاجتماع »), lu à plusieurs mètres.
  const bar = size === 'lg' ? 'h-6' : 'h-3';
  const numbers = size === 'lg' ? 'text-lg' : 'text-[11px]';
  if (!total) return <span className={`font-inter ${size === 'lg' ? 'text-lg' : 'text-xs'} text-slate-400`}>{t('common.dash')}</span>;
  return (
    <div title={t('map.cellTitle', counts)} data-map-cell>
      <div className={`flex ${bar} w-full overflow-hidden rounded-full bg-slate-100 print:border print:border-slate-300`} dir="ltr">
        {STATES.map(([k, color]) => (counts[k] ? <div key={k} className={`${color} print:[print-color-adjust:exact]`} style={{ width: `${(counts[k] / total) * 100}%` }} /> : null))}
      </div>
      <p className={`mt-1 font-inter ${numbers} text-slate-500`} dir="ltr">
        {STATES.map(([k]) => counts[k] ?? 0).join(' · ')}
      </p>
    </div>
  );
}
