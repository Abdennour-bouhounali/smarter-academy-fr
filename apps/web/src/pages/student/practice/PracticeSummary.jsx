import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPracticeSession, fetchPracticeOverview } from '../../../services/practiceService';
import { MASTERY_STATES, resolveMasteryState, reasonLabel, freshnessLabel } from '../../../lessons/common/components/LearningPointMastery';
import MISCONCEPTIONS from '../../../../../../content/practice/misconceptions.json';
import MathLabel from '../../../lessons/common/components/MathLabel';

const TONE = {
  slate: 'border-slate-200 bg-slate-50',
  rose: 'border-rose-200 bg-rose-50',
  amber: 'border-amber-200 bg-amber-50',
  emerald: 'border-emerald-200 bg-emerald-50',
};

/**
 * Le bilan d'une séance.
 *
 * Pas un score et une médaille : ce qui a été travaillé, ce qui a résisté, et
 * où en sont les connaissances APRÈS — lues depuis la même évaluation
 * canonique que celle du test final, pas depuis un compteur de pratique.
 */
export default function PracticeSummary() {
  const { t } = useTranslation('student');
  const { lessonCode, sessionId } = useParams();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    Promise.all([
      fetchPracticeSession(token, sessionId),
      fetchPracticeOverview(token, lessonCode),
    ])
      .then(([session, ov]) => {
        if (cancelled) return;
        setData(session);
        setOverview(ov);
      })
      .catch((e) => !cancelled && setError(e.message));

    return () => { cancelled = true; };
  }, [token, sessionId, lessonCode]);

  if (error) {
    return (
      <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-8">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to={`/espace/pratique/${lessonCode}`} className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← {t('practice.backToPractice')}
        </Link>
      </div>
    );
  }

  if (!data || !overview) {
    return <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-8"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const s = data.summary ?? {};
  const misconceptions = Object.entries(s.misconceptions ?? {});

  return (
    <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
          <Target className="w-3.5 h-3.5" aria-hidden="true" /> {t('practice.sessionDone')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-space font-extrabold text-slate-900">
          {t('practice.summaryTitle', { level: data.session.level, lesson: overview.lesson.title })}
        </h1>
      </header>

      {/* Le bilan v2 distingue les issues : correctes, à moitié, fausses — et
          la part de réussite que le serveur en tire (`successRate`, déjà en
          pourcentage, `null` sans réponse jugée). Un nombre est une écriture
          LTR. */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'statExercises', value: s.exercisesAttempted ?? 0 },
          { key: 'statQuestions', value: s.questionsAnswered ?? 0 },
          { key: 'statCorrect', value: s.correctCount ?? 0 },
          { key: 'statPartial', value: s.partialCount ?? 0 },
          { key: 'statIncorrect', value: s.incorrectCount ?? 0 },
          { key: 'statHints', value: s.hintsUsed ?? 0 },
          ...(typeof s.successRate === 'number'
            ? [{ key: 'statSuccessRate', value: `${Math.round(s.successRate)}٪` }]
            : []),
        ].map((stat) => (
          <div key={stat.key} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center" data-practice-stat={stat.key}>
            <div dir="ltr" className="text-2xl font-space font-extrabold text-slate-900 tabular-nums">{stat.value}</div>
            <div className="text-[11px] font-mono uppercase text-slate-500">{t(`practice.${stat.key}`)}</div>
          </div>
        ))}
      </section>

      {misconceptions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-space font-bold text-slate-900">{t('practice.whatResisted')}</h2>
          <ul className="space-y-2">
            {misconceptions.map(([id, count]) => (
              <li key={id} className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-bold text-amber-900">
                  {MISCONCEPTIONS[id]?.label ?? id}
                  {count > 1 && <span className="font-mono font-normal"> · {t('practice.timesCount', { count })}</span>}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            {t('practice.resistedHint')}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-space font-bold text-slate-900">{t('practice.yourKnowledgeNow')}</h2>
        <ul className="space-y-2">
          {overview.learningPoints.map((lp) => {
            // TOUS les points de la leçon (v2), avec la raison d'un
            // `reinforce` et la fraîcheur d'un acquis qui vieillit.
            const stateKey = resolveMasteryState(lp);
            const state = MASTERY_STATES[stateKey];
            const reason = stateKey === 'reinforce' ? reasonLabel(lp, t) : '';
            const freshness = stateKey === 'mastered' && lp.freshness && lp.freshness !== 'fresh' ? freshnessLabel(lp, t) : '';

            return (
              <li key={lp.code} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${TONE[state.tone]}`} data-mastery-state={stateKey}>
                <span aria-hidden="true">{state.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800"><MathLabel>{lp.title}</MathLabel></p>
                  <p className="text-xs text-slate-600">
                    {state.label}
                    {freshness && <span className="text-emerald-800"> · ⏳ {freshness}</span>}
                  </p>
                  {reason && <p className="text-xs text-amber-900 mt-0.5">{reason}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex gap-3 flex-wrap">
        <Link
          to={`/espace/pratique/${lessonCode}`}
          className="flex-1 px-5 py-3 rounded-xl bg-nav-accent text-white font-bold min-h-[48px] inline-flex items-center justify-center gap-2"
        >
          {t('practice.keepPracticing')} <ArrowForward className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          to="/espace/cours"
          className="px-5 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold min-h-[48px] inline-flex items-center"
        >
          {t('practice.myCourses')}
        </Link>
      </div>
    </div>
  );
}
