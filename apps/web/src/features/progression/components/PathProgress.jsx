import { useTranslation } from 'react-i18next';

/**
 * La barre de PROGRESSION DANS LE PARCOURS (modules complétés) d'un nœud.
 * C'est la seule chose qu'un pourcentage désigne sur cette page : jamais un
 * niveau de maîtrise. Le nombre est en `dir="ltr"` (chiffres et signe %).
 */
export default function PathProgress({ percent, size = 'md', className = '' }) {
  const { t } = useTranslation('student');
  const p = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const h = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex-1 ${h} bg-slate-100 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t('progression.curriculum.pathProgressAria', { percent: p })}
      >
        <div className={`h-full rounded-full ${p >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${p}%` }} />
      </div>
      <span dir="ltr" className={`font-mono-jetbrains font-bold tabular-nums ${size === 'sm' ? 'text-[11px]' : 'text-xs'} ${p >= 100 ? 'text-emerald-700' : 'text-slate-600'}`} aria-hidden="true">
        {p}%
      </span>
    </div>
  );
}
