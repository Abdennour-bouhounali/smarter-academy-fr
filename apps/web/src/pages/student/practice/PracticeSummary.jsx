import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchPracticeSession, fetchPracticeOverview } from '../../../services/practiceService';
import { MASTERY_STATES, resolveMasteryState } from '../../../lessons/common/components/LearningPointMastery';
import MISCONCEPTIONS from '../../../../../../content/practice/misconceptions.json';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
        <p className="text-rose-700 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">{error}</p>
        <Link to={`/espace/pratique/${lessonCode}`} className="text-sm font-bold text-slate-600 hover:text-slate-900">
          ← Retour à la pratique
        </Link>
      </div>
    );
  }

  if (!data || !overview) {
    return <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8"><div className="h-64 rounded-2xl bg-slate-100 animate-pulse" /></div>;
  }

  const s = data.summary ?? {};
  const misconceptions = Object.entries(s.misconceptions ?? {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
          <Target className="w-3.5 h-3.5" aria-hidden="true" /> Séance terminée
        </div>
        <h1 className="text-2xl sm:text-3xl font-space font-extrabold text-slate-900">
          Niveau {data.session.level} — {overview.lesson.title}
        </h1>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Exercices', value: s.exercisesAttempted ?? 0 },
          { label: 'Questions', value: s.questionsAnswered ?? 0 },
          { label: 'Justes', value: s.correctCount ?? 0 },
          { label: 'Indices', value: s.hintsUsed ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
            <div className="text-2xl font-space font-extrabold text-slate-900 tabular-nums">{stat.value}</div>
            <div className="text-[11px] font-mono uppercase text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {misconceptions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-space font-bold text-slate-900">Ce qui a résisté</h2>
          <ul className="space-y-2">
            {misconceptions.map(([id, count]) => (
              <li key={id} className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-bold text-amber-900">
                  {MISCONCEPTIONS[id]?.label ?? id}
                  {count > 1 && <span className="font-mono font-normal"> · {count} fois</span>}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            Revenir sur ces points est plus utile que d’enchaîner un niveau de plus.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-space font-bold text-slate-900">Tes connaissances maintenant</h2>
        <ul className="space-y-2">
          {overview.learningPoints.map((lp) => {
            const state = MASTERY_STATES[resolveMasteryState(lp)];

            return (
              <li key={lp.code} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 ${TONE[state.tone]}`}>
                <span aria-hidden="true">{state.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{lp.title}</p>
                  <p className="text-xs text-slate-600">{state.label}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex gap-3 flex-wrap">
        <Link
          to={`/espace/pratique/${lessonCode}`}
          className="flex-1 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold min-h-[48px] inline-flex items-center justify-center gap-2"
        >
          Continuer à pratiquer <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          to="/espace/cours"
          className="px-5 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold min-h-[48px] inline-flex items-center"
        >
          Mes cours
        </Link>
      </div>
    </div>
  );
}
