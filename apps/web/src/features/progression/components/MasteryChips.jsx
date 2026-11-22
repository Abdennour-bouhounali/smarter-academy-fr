import { useTranslation } from 'react-i18next';
import { MASTERY_STATES } from '../../../lessons/common/components/LearningPointMastery';

const ORDER = ['mastered', 'reinforce', 'gap', 'unassessed'];

const TONE = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  rose: 'bg-rose-50 border-rose-200 text-rose-800',
  slate: 'bg-slate-50 border-slate-200 text-slate-600',
};

/**
 * Le résumé de maîtrise d'un nœud (درس, وحدة ou ميدان) : un compteur par
 * état, toujours avec l'emoji ET le nombre ET un libellé accessible — jamais
 * la couleur seule. Les états à zéro ne s'affichent pas, sauf demande
 * (`showZero`), pour ne pas encombrer une ligne de leçon.
 *
 * `⚪ لم تُقيَّم بعد` a la même place que les autres, mais un ton neutre :
 * ne pas avoir été évalué n'est pas une lacune, et rien ici ne doit le
 * laisser croire.
 */
export default function MasteryChips({ counts, total, showZero = false, compact = false, className = '' }) {
  const { t } = useTranslation('student');
  const visible = ORDER.filter((s) => showZero || counts[s] > 0);
  if (total === 0) return null;

  return (
    <ul className={`flex items-center gap-1.5 flex-wrap ${className}`} aria-label={t('progression.chips.legend')}>
      {visible.map((state) => {
        const s = MASTERY_STATES[state];
        // UN seul vocabulaire de maîtrise : `mastery.*` (masteryLabels.js).
        const label = t(s.labelKey);
        return (
          <li
            key={state}
            className={`inline-flex items-center gap-1 rounded-full border font-mono-jetbrains font-bold tabular-nums ${TONE[s.tone]} ${compact ? 'px-1.5 py-0 text-[11px]' : 'px-2 py-0.5 text-xs'}`}
            title={label}
            aria-label={t('progression.chips.aria', { label, count: counts[state] })}
          >
            <span aria-hidden="true">{s.emoji}</span>
            <span aria-hidden="true">{counts[state]}</span>
            {!compact && <span className="sr-only sm:not-sr-only sm:font-inter sm:font-medium sm:text-[11px]">{label}</span>}
          </li>
        );
      })}
      {typeof total === 'number' && (
        <li className="font-mono-jetbrains text-[11px] text-slate-400" aria-hidden="true">
          / {t('progression.chips.total', { count: total })}
        </li>
      )}
    </ul>
  );
}
