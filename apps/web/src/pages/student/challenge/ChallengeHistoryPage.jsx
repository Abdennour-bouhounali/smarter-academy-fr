import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchChallengeHistory } from '../../../services/dailyChallengeService';
import ArenaPanel from '../../../features/dailyChallenge/components/ArenaPanel';
import StreakDisplay from '../../../features/dailyChallenge/components/StreakDisplay';
import { formatSeconds, reasonKey } from '../../../features/dailyChallenge/challengeModel';

/**
 * « سجلّ التحدّي اليومي » : chaque jour de défi, son score — ou « فاتك ».
 * Un jour joué s'ouvre en REVUE (lecture seule, jamais rejouable).
 */
export default function ChallengeHistoryPage() {
  const { t } = useTranslation('challenge');
  useDocumentMeta(t('history.title'));
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    fetchChallengeHistory(token, 30)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(t(`reasons.${reasonKey(e?.reason)}`)));
    return () => { cancelled = true; };
  }, [token, t]);

  const date = (d) => new Intl.DateTimeFormat('ar-DZ', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${d}T12:00:00`));

  return (
    <div className="sa-surface-plain sa-page sa-page--flush py-6 sm:py-8 space-y-4" data-challenge-history>
      <Link to="/espace/defi" className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 font-inter text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowBack size={16} aria-hidden="true" /> {t('history.back')}
      </Link>
      <header>
        <h1 className="font-space text-2xl font-black text-slate-900 sm:text-3xl">{t('history.title')}</h1>
        <p className="mt-1 font-inter text-sm text-slate-500">{t('history.subtitle')}</p>
      </header>

      {error && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {!data && !error && <p role="status" className="text-sm text-slate-500">{t('loading')}</p>}

      {data && (
        <>
          <ArenaPanel className="p-5">
            <StreakDisplay streak={data.streak} />
            <p className="mt-3 font-inter text-sm text-slate-600">{t('intro.cumulative')}: <span dir="ltr" className="font-space font-black text-slate-900">{data.cumulativeScore.toLocaleString('fr-FR')}</span></p>
          </ArenaPanel>

          {data.days.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">{t('history.empty')}</p>
          ) : (
            <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
              {data.days.map((d) => {
                const played = d.status !== 'missed' && d.id;
                const row = (
                  <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
                    <span className="w-28 shrink-0 font-inter text-sm text-slate-600">{date(d.date)}</span>
                    {played ? (
                      <>
                        <span dir="ltr" className="font-space text-lg font-black text-slate-900">{t('history.points', { n: d.score.total })}</span>
                        <span dir="ltr" className="font-mono-jetbrains text-sm text-emerald-700">✓ {t('history.correct', { correct: d.correctCount, total: d.questionCount })}</span>
                        <span dir="ltr" className="hidden font-mono-jetbrains text-sm text-slate-500 sm:inline">⚡ {formatSeconds(d.averageResponseTimeMs)} ث</span>
                        {d.status !== 'completed' && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t(`history.${d.status}`)}</span>}
                        {d.status !== 'in_progress' && <span className="ms-auto font-inter text-sm font-semibold text-nav-accent">{t('history.open')}</span>}
                      </>
                    ) : (
                      <span className="font-inter text-sm text-slate-500" data-missed>✕ {t('history.missed')}</span>
                    )}
                  </div>
                );
                return (
                  <li key={d.date}>
                    {played && d.status !== 'in_progress'
                      ? <Link to={`/espace/defi/${d.id}`} className="block hover:bg-slate-50 focus:outline-none focus-visible:bg-nav-accent-soft">{row}</Link>
                      : row}
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
