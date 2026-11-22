import { useTranslation } from 'react-i18next';
import AnswerField from './AnswerField';

/**
 * Un couple de coordonnées — la ثنائية (x ; y) du manuel. La rangée est isolée `dir="ltr"` : sous la
 * page RTL, une rangée flex placerait « ( » à droite et x à droite de y, soit « ) y ; x ( » à l'écran
 * (première utilisation au banc DZ : unité 5 « جمل معادلتين », 2026-10-01).
 */
export default function PointInput({ value, onChange, disabled }) {
  const { t } = useTranslation('student');
  return (
    <div dir="ltr" className="flex items-center gap-2" data-point-input>
      <span className="font-mono text-lg text-slate-500">(</span>
      <AnswerField value={value?.x ?? ''} onChange={(x) => onChange({ ...value, x })} ariaLabel={t('practice.field.abscissa')} width="min-w-[5.5rem]" disabled={disabled} />
      <span className="font-mono text-lg text-slate-500">;</span>
      <AnswerField value={value?.y ?? ''} onChange={(y) => onChange({ ...value, y })} ariaLabel={t('practice.field.ordinate')} width="min-w-[5.5rem]" disabled={disabled} />
      <span className="font-mono text-lg text-slate-500">)</span>
    </div>
  );
}
