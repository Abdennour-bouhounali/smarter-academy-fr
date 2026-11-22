import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import MasteryPill from '../learningPoints/MasteryPill';
import StatusTrail from '../insights/StatusTrail';
import { DIRECTION_TONE, outcomeLine, studentName } from '../insights/insights';

/**
 * « ما حدث بعده » — la MESURE d'une intervention, élève par élève : l'état
 * figé au moment du geste, l'état d'aujourd'hui, la preuve arrivée depuis.
 *
 * Des faits, et un avertissement qui ne se cache pas : ce qui a suivi n'est
 * pas prouvé comme conséquence. Un élève sans preuve nouvelle est dit
 * « sans nouvelle preuve », jamais « sans progrès ».
 */
export default function InterventionOutcome({ outcome, detailed = false }) {
  const { t } = useTranslation('teacher');
  if (!outcome) return <p className="text-xs text-slate-500">{t('interventions.outcome.noPoint')}</p>;
  const line = outcomeLine(outcome.summary);
  const unnamed = t('common.unnamedStudent');

  return (
    <div className="space-y-3" data-intervention-outcome>
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span className="font-semibold text-slate-800">{t('interventions.outcome.withNewEvidence', { count: line.withNewEvidence, students: line.students })}</span>
        {line.improved > 0 && <span className={DIRECTION_TONE.improved}>{t('interventions.outcome.improved', { count: line.improved })}</span>}
        {line.declined > 0 && <span className={DIRECTION_TONE.declined}>{t('interventions.outcome.declined', { count: line.declined })}</span>}
        {line.unchanged > 0 && <span className={DIRECTION_TONE.unchanged}>{t('interventions.outcome.unchanged', { count: line.unchanged })}</span>}
        {line.firstAssessed > 0 && <span className={DIRECTION_TONE.first_assessed}>{t('interventions.outcome.firstAssessed', { count: line.firstAssessed })}</span>}
        {line.noNewEvidence > 0 && <span className="text-slate-400">{t('interventions.outcome.noNewEvidence', { count: line.noNewEvidence })}</span>}
      </p>

      {detailed && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {outcome.students.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-xs" data-outcome-student={s.id} data-outcome-direction={s.observed ? s.direction : 'no_new_evidence'}>
              <span className="w-32 shrink-0 truncate font-semibold text-slate-800">{studentName(s, unnamed)}</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                {t('interventions.outcome.before')} <MasteryPill status={s.before?.status ?? 'unassessed'} />
              </span>
              <span aria-hidden="true" className="text-slate-300">←</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                {t('interventions.outcome.now')} <MasteryPill status={s.now?.status ?? 'unassessed'} />
              </span>
              <span className="text-slate-600">
                {s.observed
                  ? t('interventions.outcome.answers', { answered: s.since.answered, successes: s.since.successes })
                  : <span className="text-slate-400">{t('interventions.outcome.noEvidence')}</span>}
              </span>
              {s.trail?.length > 0 && <StatusTrail steps={s.trail} className="ms-auto" />}
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-start gap-1.5 text-[11px] text-slate-500"><Info size={12} className="mt-0.5 shrink-0" /> {t('interventions.outcome.disclaimer')}</p>
    </div>
  );
}
