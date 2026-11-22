import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Ce que l'élève voit de la classe — ce que l'enseignant a OUVERT, rien
 * d'autre : le Top 3 (nom d'affichage, rang, score) s'il l'a permis, et la
 * propre position de l'élève. Jamais le bas du classement, jamais un temps,
 * jamais une réponse d'un autre.
 */
export default function Leaderboard({ competition }) {
  const { t } = useTranslation('challenge');
  if (!competition?.enabled) return null;
  const { top3, myRank, classStatus } = competition;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="dc-leaderboard-title" data-leaderboard>
      <h2 id="dc-leaderboard-title" className="flex items-center gap-2 font-space text-base font-bold text-slate-900">
        <Trophy size={18} className="text-amber-500" aria-hidden="true" /> {t('leaderboard.title')}
      </h2>

      {competition.showTop3 && (
        <div className="mt-3" data-top3>
          <p className="font-inter text-[11px] uppercase tracking-wide text-slate-500">{t('leaderboard.top3')}</p>
          {top3?.length ? (
            <ol className="mt-2 space-y-1.5">
              {top3.map((row) => (
                <li key={row.rank} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${row.isMe ? 'bg-amber-50 ring-1 ring-amber-300' : 'bg-slate-50'}`}>
                  <span className="text-xl" aria-label={t('leaderboard.rank', { rank: row.rank })}>{MEDALS[row.rank - 1] ?? row.rank}</span>
                  <span className="min-w-0 flex-1 truncate font-inter font-semibold text-slate-900"><bdi>{row.displayName}</bdi>{row.isMe ? ` · ${t('leaderboard.you')}` : ''}</span>
                  <span dir="ltr" className="font-mono-jetbrains text-sm font-bold tabular-nums text-amber-700">{row.score.toLocaleString('fr-FR')}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 font-inter text-sm text-slate-500">{t('leaderboard.empty')}</p>
          )}
        </div>
      )}

      {myRank && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5" data-my-rank>
          <span className="font-inter text-sm text-slate-600">{t('leaderboard.yourPosition')}</span>
          <span dir="ltr" className="font-space text-2xl font-black text-slate-900">#{myRank.rank}</span>
        </div>
      )}
      {!competition.showTop3 && (
        <p className="mt-2 font-inter text-xs text-slate-500">{t('leaderboard.rankHidden')}</p>
      )}
      {classStatus && (
        <p className="mt-2 font-inter text-xs text-slate-500">{t('leaderboard.classStatus', classStatus)}</p>
      )}
    </section>
  );
}
