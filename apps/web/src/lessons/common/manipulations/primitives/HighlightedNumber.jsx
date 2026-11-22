
const TONES = {
  neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  dividend: 'bg-blue-100 text-blue-900 border-blue-300',
  divisor: 'bg-violet-100 text-violet-900 border-violet-300',
  quotient: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  remainder: 'bg-amber-100 text-amber-900 border-amber-300',
  result: 'bg-rose-100 text-rose-900 border-rose-300',
  common: 'bg-emerald-600 text-white border-emerald-700',
  dim: 'bg-white text-slate-400 border-slate-200',
};

/** Un nombre mis en couleur selon son RÔLE mathématique (المقسوم، المقسوم عليه، الحاصل، الباقي…). */
export default function HighlightedNumber({ value, tone = 'neutral', label, size = 'md', as: Tag = 'span' }) {
  const text = size === 'lg' ? 'text-2xl px-3 py-1' : size === 'sm' ? 'text-sm px-1.5 py-0.5' : 'text-lg px-2.5 py-0.5';
  return (
    <Tag className="inline-flex flex-col items-center gap-0.5">
      <span dir="ltr" className={`inline-block rounded-lg border-2 font-mono font-bold tabular-nums ${text} ${TONES[tone] ?? TONES.neutral}`}>
        {value}
      </span>
      {label && <span className="text-[11px] text-slate-500">{label}</span>}
    </Tag>
  );
}
