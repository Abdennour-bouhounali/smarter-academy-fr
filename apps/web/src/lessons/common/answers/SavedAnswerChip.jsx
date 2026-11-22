import { useTranslation } from 'react-i18next';

/** « ↺ إجابتك السابقة · <date> » : une réponse remise à l'écran est SIGNALÉE comme telle (jamais prise pour une nouvelle). */
export default function SavedAnswerChip({ at }) {
  const { t } = useTranslation('lesson');
  if (!at) return null;
  let when = '';
  try { when = new Date(at).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' }); } catch { /* date illisible : sans date */ }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600" data-saved-answer>
      <span aria-hidden="true">↺</span> {t('answers.previous')}{when && <span className="font-normal"> · {when}</span>}
    </span>
  );
}
