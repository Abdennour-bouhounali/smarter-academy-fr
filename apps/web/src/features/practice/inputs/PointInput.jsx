import AnswerField from './AnswerField';

/** Un couple de coordonnées. */
export default function PointInput({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-lg text-slate-500">(</span>
      <AnswerField value={value?.x ?? ''} onChange={(x) => onChange({ ...value, x })} ariaLabel="Abscisse" width="w-28" disabled={disabled} />
      <span className="font-mono text-lg text-slate-500">;</span>
      <AnswerField value={value?.y ?? ''} onChange={(y) => onChange({ ...value, y })} ariaLabel="Ordonnée" width="w-28" disabled={disabled} />
      <span className="font-mono text-lg text-slate-500">)</span>
    </div>
  );
}
