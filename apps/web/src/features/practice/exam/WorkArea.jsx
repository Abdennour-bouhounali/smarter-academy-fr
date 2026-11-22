import { useTranslation } from 'react-i18next';
import { LazyMathLinesEditor } from './math/lazy';
import RedactionText from './math/RedactionText';

/**
 * « مراحل الحساب » — la zone où l'élève ÉCRIT son calcul (propriétaire,
 * 2026-10-06 : « احسب PGCD(21957 ; 43351) مع كتابة مراحل الحساب » ne tient pas
 * sur un trait). Des lignes réglées, comme la copie, qui s'agrandissent à la
 * poignée ; le minimum est la hauteur de départ.
 *
 * `question.work` : « required » (l'énoncé exige les étapes — « مع كتابة مراحل
 * الحساب »، « باستعمال خوارزمية … ») ou « optional ». Le texte part avec la réponse
 * (`answer.work`) : il est ENREGISTRÉ en base et verrouillé avec elle.
 */
export const MIN_WORK_CHARS = 10;
export const workLength = (s) => (s ?? '').replace(/\s+/g, '').length;

export default function WorkArea({ question, value, onChange, disabled }) {
  const { t } = useTranslation('student');
  const required = question.work === 'required';
  const text = value ?? '';

  return (
    <div className="space-y-2 rounded-xl border-2 border-amber-300 bg-amber-50/50 p-3" data-work-area={question.work}>
      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
        <ZoneNumber n={1} tone="amber" />
        {t('practice.exam.work.partTitle')}
        <span className="text-xs font-semibold text-slate-600">
          {required ? t('practice.exam.work.required') : t('practice.exam.work.optional')}
        </span>
      </p>
      {!disabled && <p className="text-xs text-slate-600">{t('practice.exam.work.hint')}</p>}
      {/* Lignes de calcul (MathLive, LTR) et lignes de texte (arabe, RTL). */}
      <div className="rounded-lg bg-white p-2 ring-1 ring-amber-200">
        {disabled ? (
          <RedactionText text={text} className="sa-exam-ink" />
        ) : (
          <LazyMathLinesEditor value={text} onChange={onChange} startWith="math" ariaLabel={t('practice.exam.work.label')} placeholder={t('practice.exam.work.placeholder')} />
        )}
      </div>
      {required && !disabled && workLength(text) < MIN_WORK_CHARS && (
        <p className="text-xs text-slate-600" data-work-too-short>{t('practice.exam.work.tooShort')}</p>
      )}
    </div>
  );
}

/**
 * Le numéro de zone (« 1 » mise en calcul, « 2 » résultat final) : même pastille
 * pour « مراحل الحساب » et « النتيجة النهائية », afin que l'élève lise l'ordre.
 */
export function ZoneNumber({ n, tone = 'amber' }) {
  const color = tone === 'green' ? 'bg-[#1f5c4c] text-white' : 'bg-amber-500 text-white';
  return (
    <bdi dir="ltr" className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold ${color}`} data-zone-number={n}>
      {n}
    </bdi>
  );
}
