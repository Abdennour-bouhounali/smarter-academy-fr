import { useTranslation } from 'react-i18next';
import { Trophy, Users } from 'lucide-react';
import { formatScore } from '../madarModel';
import Panel from './Panel';
import ShipIcon from './ShipIcon';

const MEDALS = ['from-amber-200 to-amber-500 text-amber-950', 'from-slate-100 to-slate-400 text-slate-900', 'from-orange-200 to-orange-500 text-orange-950'];

/**
 * « ترتيب الأسبوع » : les dix premiers du قسم (prénom + initiale, vaisseau,
 * meilleur score de la semaine), l'élève surligné, sa ligne sous le podium
 * s'il n'y est pas. Un élève sans classe voit une invitation, pas un vide.
 */
export default function Leaderboard({ competition, classroom, game = 'orbit' }) {
  const { t } = useTranslation('madar');

  if (!competition) {
    return (
      <Panel aria-labelledby="madar-board-title">
        <h2 id="madar-board-title" className="flex items-center gap-2 font-space text-lg font-black text-white"><Trophy size={18} className="text-amber-300" aria-hidden="true" /> {t('board.title')}</h2>
        <p className="mt-2 flex items-start gap-2 font-inter text-sm leading-relaxed text-white/70"><Users size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{t('lobby.independent')}</p>
      </Panel>
    );
  }

  const { top, me, participants } = competition;
  const meInTop = top.some((r) => r.isMe);

  return (
    <Panel aria-labelledby="madar-board-title" data-madar-board>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="madar-board-title" className="flex items-center gap-2 font-space text-lg font-black text-white"><Trophy size={18} className="text-amber-300" aria-hidden="true" /> {t('board.title')}</h2>
        <span className="font-inter text-xs text-white/60">{t('board.participants', { count: participants })}</span>
      </div>
      {classroom?.name && <p className="mt-0.5 font-inter text-xs text-white/50">{t('board.subtitle', { name: classroom.name })}</p>}

      {top.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-white/5 p-4 text-center font-inter text-sm text-white/70">{t('board.empty')}</p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {top.map((row) => (
            <li
              key={`${row.rank}-${row.name}`}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${row.isMe ? 'bg-amber-300/15 ring-1 ring-amber-300/50' : 'bg-white/[0.04]'}`}
              data-me={row.isMe || undefined}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-space text-sm font-black ${row.rank <= 3 ? `bg-gradient-to-b ${MEDALS[row.rank - 1]}` : 'bg-white/10 text-white/80'}`} dir="ltr">
                {row.rank}
              </span>
              <ShipIcon id={row.ship} size={30} />
              <span className="min-w-0 flex-1 truncate font-inter text-sm font-semibold">
                <bdi>{row.name}</bdi>
                {row.isTeacher && <span className="ms-1.5 rounded-full bg-fuchsia-400 px-1.5 py-0.5 text-[10px] font-black text-fuchsia-950" data-teacher-row>{t('board.teacher')}</span>}
                {row.isMe && <span className="ms-1.5 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-amber-950">{t('board.me')}</span>}
              </span>
              {game !== 'orbit' && row.wave != null && (
                <span className="rounded-full bg-cyan-400/15 px-1.5 py-0.5 font-inter text-[10px] font-bold text-cyan-100">
                  {game === 'explorer' ? t('explorer.board.level', { n: row.wave }) : ['sniper', 'odd', 'mental'].includes(game) ? t('sniper.board.round', { n: row.wave }) : t('defense.board.wave', { n: row.wave })}
                </span>
              )}
              <span className="font-space text-base font-black tabular-nums" dir="ltr">{formatScore(row.best)}</span>
            </li>
          ))}
        </ol>
      )}

      {!meInTop && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-white/20 px-3 py-2 font-inter text-sm">
          {me ? (
            <>
              <span className="text-white/70">{t('board.yourRank')}</span>
              <span className="font-space font-black" dir="ltr">#{me.rank} · {formatScore(me.best)}</span>
            </>
          ) : (
            <span className="text-white/60">{t('board.notRanked')}</span>
          )}
        </div>
      )}
    </Panel>
  );
}
