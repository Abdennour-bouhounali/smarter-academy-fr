import { useTranslation } from 'react-i18next';
import { Check, Lock, X } from 'lucide-react';
import SolutionPanel from '../exam/SolutionPanel';
import { LazyMathLinesEditor } from '../exam/math/lazy';
import RedactionText from '../exam/math/RedactionText';
import { mathToPlain } from '../../../utils/mathPlain';

/**
 * L'ÉTAPE « بيّن أن »، « برّر » d'une feuille d'examen (décision du propriétaire,
 * 2026-10-06) — une démonstration ne se corrige pas automatiquement :
 *
 *  1. l'élève ÉCRIT sa démonstration dans la zone de texte, puis valide
 *     (« سجّل إجابتي ») : `{ text }` est enregistré par le serveur et ne se
 *     modifie plus (PracticeEvidenceRecorder refuse un autre texte) ;
 *  2. son texte reste affiché, verrouillé, et le CORRIGÉ TYPE s'ouvre dessous ;
 *  3. il dit s'il est arrivé au même raisonnement — « مطابق / غير مطابق ».
 *     Ce choix (`onSelfMark`) est envoyé une fois, avec le MÊME texte.
 *
 * Jamais compté pour la maîtrise (countsForMastery). Avant la validation,
 * `disabled` est faux ; après, `saved` porte le texte enregistré et `mark` la
 * note éventuelle.
 */
// Une vraie tentative avant le corrigé type : quelques signes ne suffisent pas.
const MIN_PROOF_CHARS = 15;
const proofLength = (s) => (s ?? '').replace(/\s+/g, '').length;

export default function SelfCheckInput({ question, value, onChange, disabled, onSelfMark, mark = null, busy = false, showSolution = true }) {
  const { t } = useTranslation('student');
  const text = value?.text ?? value?.draft ?? '';

  if (!disabled) {
    return (
      <div className="space-y-1">
      {/* La démonstration en lignes : texte arabe (RTL) et formules MathLive (LTR). */}
      <LazyMathLinesEditor
        key={question.id}
        value={text}
        onChange={(v) => onChange(proofLength(v) >= MIN_PROOF_CHARS ? { text: v } : { draft: v })}
        startWith="text"
        ariaLabel={(question.answerFormat && mathToPlain(question.answerFormat)) || t('practice.yourAnswerLabel')}
        placeholder={question.answerFormat ? mathToPlain(question.answerFormat) : undefined}
      />
      {proofLength(text) < MIN_PROOF_CHARS && (
        <p className="text-xs text-slate-600" data-proof-too-short>{t('practice.exam.selfCheck.tooShort', { count: MIN_PROOF_CHARS })}</p>
      )}
      </div>
    );
  }

  return (
    <div className="space-y-3" data-self-check>
      {text && (
        <div className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5" data-self-check-saved>
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t('practice.exam.selfCheck.saved')}
          </p>
          <RedactionText text={text} className="sa-exam-ink text-base leading-relaxed" />
        </div>
      )}
      {/* « تصحيح الأستاذ » (2026-10-06) : la démonstration attend l'enseignant —
          ni corrigé type ni auto-évaluation (`showSolution` faux, pas de
          `onSelfMark`). Une note de l'enseignant arrivée : corrigé, sans boutons. */}
      {showSolution && <SolutionPanel solution={question.solution} open />}
      {onSelfMark && <SelfMarkChoice onSelfMark={onSelfMark} mark={mark} busy={busy} />}
    </div>
  );
}

/**
 * « هل يطابق حلّك الحلّ النموذجي ؟ » — la note que l'élève se donne, corrigé
 * type sous les yeux : une « بيّن أن », ou une étape répondue en PHOTO
 * seulement (élève autonome). Envoyée une fois ; jamais comptée.
 */
export function SelfMarkChoice({ onSelfMark, mark = null, busy = false }) {
  const { t } = useTranslation('student');
  const option = (id, Icon, label) => (
    <button
      type="button"
      onClick={() => onSelfMark?.(id)}
      disabled={busy || mark !== null}
      aria-pressed={mark === id}
      className={`inline-flex min-h-[48px] items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-start text-base font-bold transition-colors ${
        mark === id ? 'border-nav-accent bg-nav-accent-soft text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
      } disabled:cursor-default ${mark !== null && mark !== id ? 'opacity-50' : ''}`}
      data-self-mark={id}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <fieldset className="space-y-2" data-self-mark-choice>
      <legend className="text-sm font-bold text-slate-700">{t('practice.exam.selfCheck.question')}</legend>
      <div className="flex flex-wrap gap-2">
        {option('correct', Check, t('practice.exam.selfCheck.matches'))}
        {option('incorrect', X, t('practice.exam.selfCheck.differs'))}
      </div>
      <p className="text-xs text-slate-600">{t('practice.exam.selfCheck.notCounted')}</p>
    </fieldset>
  );
}
