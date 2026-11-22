import { describeMeter } from '../entitlementSummary';

/**
 * Une jauge d'usage « 3 / 5 » : le nombre en LTR (chiffres et barre), le
 * libellé en français, et la couleur qui ne fait que répéter l'état (au-delà
 * de la limite = ambre, texte explicite fourni par l'appelant).
 */
export default function UsageMeter({ label, meter, hint }) {
  const m = describeMeter(meter);
  const tone = m.overLimit ? 'bg-amber-500' : m.atLimit ? 'bg-slate-500' : 'bg-nav-accent';

  return (
    <div className="rounded-2xl border border-nav-line bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-inter text-slate-600 text-xs">{label}</p>
        <p dir="ltr" className="font-mono-jetbrains font-bold text-slate-900 text-sm tabular-nums">{m.text}</p>
      </div>
      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(m.ratio * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.round(m.ratio * 100)}%` }} />
      </div>
      {hint && <p className="mt-1.5 font-inter text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
