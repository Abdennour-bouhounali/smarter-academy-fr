import DraggableObject from './DraggableObject';

const TONES = {
  neutral: 'border-slate-300 bg-white text-slate-800',
  dividend: 'border-blue-300 bg-blue-50 text-blue-900',
  divisor: 'border-violet-300 bg-violet-50 text-violet-900',
  quotient: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  remainder: 'border-amber-300 bg-amber-50 text-amber-900',
  result: 'border-rose-300 bg-rose-50 text-rose-900',
  common: 'border-emerald-600 bg-emerald-600 text-white',
  ok: 'border-emerald-400 bg-emerald-100 text-emerald-900',
  ko: 'border-rose-300 bg-rose-50 text-rose-800',
  dim: 'border-slate-200 bg-slate-50 text-slate-400',
  pgcd: 'border-amber-500 bg-amber-400 text-amber-950 shadow',
};

/**
 * Un NOMBRE comme objet physique : une tuile qu'on prend, qu'on porte et
 * qu'on pose. Sans `drag`, c'est une tuile statique (même dessin). La valeur
 * est toujours LTR ; `tone` dit son RÔLE mathématique. Cible ≥ 44 px.
 */
export default function NumberTile({ value, drag, id, label, tone = 'neutral', size = 'md', disabled = false, className = '', badge, onClick, ...rest }) {
  const text = size === 'lg' ? 'min-w-[56px] min-h-[52px] text-2xl px-3' : size === 'sm' ? 'min-w-[40px] min-h-[40px] text-sm px-2' : 'min-w-[44px] min-h-[44px] text-lg px-2.5';
  const base = `relative inline-flex items-center justify-center rounded-xl border-2 font-mono font-extrabold tabular-nums ${text} ${TONES[tone] ?? TONES.neutral} ${className}`;
  const inner = (
    <>
      <span dir="ltr">{value}</span>
      {badge && <span className="absolute -top-1.5 -end-1.5 rounded-full bg-slate-800 px-1 text-[10px] font-bold leading-4 text-white" aria-hidden="true">{badge}</span>}
    </>
  );
  if (drag) {
    return (
      <DraggableObject drag={drag} id={id ?? String(value)} label={label ?? String(value)} disabled={disabled} className={base}>
        {inner}
      </DraggableObject>
    );
  }
  if (onClick) {
    return <button type="button" onClick={onClick} disabled={disabled} aria-label={label} {...rest} className={`${base} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50`}>{inner}</button>;
  }
  return <span className={base} aria-label={label}>{inner}</span>;
}
