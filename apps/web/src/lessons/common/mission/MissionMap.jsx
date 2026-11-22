import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import MathLabel from '../components/MathLabel';
import { stationLabel } from './missionModel';
import { isPracticeActive, practiceHubPath } from '../../../features/practice/practiceCapability';

/**
 * Le PARCOURS de la mission : une station par module, dans l'ordre, avec le verrou RÉEL (useMission → moduleGate).
 * Une station verrouillée se voit mais ne s'ouvre pas ; la mission (`climax`) est plus grande ; après elle, les
 * « مستويات إضافية ». `here` : le module où se trouve l'élève (ou la station de reprise sur l'accueil).
 */
export default function MissionMap({ stations, basePath, here, onNavigate, lessonId = null }) {
  const { t } = useTranslation('lesson');
  // « التمارين » APRÈS « إختبار أولي » (propriétaire, 2026-11-08) : la dernière station du parcours n'est pas un module — c'est
  // l'espace d'exercices de la leçon (/espace/pratique/<leçon>). Ouverte quand la dernière station est faite ; seulement si la
  // pratique est active pour la leçon.
  const last = stations[stations.length - 1];
  const practice = lessonId && isPracticeActive(lessonId) ? { open: last?.status === 'mastered', to: practiceHubPath(lessonId) } : null;
  return (
    <ol className="flex items-start gap-1" data-mission-map>
      {stations.map((s, i) => {
        const done = s.status === 'mastered';
        const locked = s.status === 'locked';
        const isHere = Number(here) === s.number;
        const big = s.kind === 'climax';
        const tone = done ? 'bg-emerald-500 text-white border-emerald-600'
          : locked ? 'bg-slate-100 text-slate-400 border-slate-200'
          : big ? 'bg-amber-400 text-amber-950 border-amber-500'
          : 'bg-indigo-600 text-white border-indigo-700';
        const dot = (
          <span className={`relative flex items-center justify-center rounded-full border-2 font-black shadow-sm ${big ? 'h-16 w-16 text-2xl' : s.kind === 'bonus' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base'} ${tone}`}>
            {isHere && <span className="absolute -inset-1.5 animate-ping rounded-full border-2 border-indigo-400 motion-reduce:animate-none" aria-hidden="true" />}
            {/* la mission garde son 🏆 même fermée : le but se voit avant d'être atteint */}
            {done ? '✓' : big ? <span className={locked ? 'opacity-50 grayscale' : ''}>🏆</span> : locked ? '🔒' : s.kind === 'bonus' ? '⭐' : i + 1}
          </span>
        );
        const label = (
          <span className={`mt-1.5 line-clamp-3 text-center text-xs leading-snug ${locked ? 'text-slate-400' : 'font-bold text-slate-700'}`}>
            <MathLabel>{s.label ?? stationLabel(s.title)}</MathLabel>
          </span>
        );
        const status = done ? t('mission.done') : locked ? t('mission.locked') : isHere ? t('mission.here') : big ? t('mission.climax') : s.kind === 'bonus' ? t('mission.bonus') : '';
        return (
          <li key={s.number} className="flex min-w-0 flex-1 items-start" data-mission-station={s.number} data-station-status={s.status} data-station-kind={s.kind}>
            {i > 0 && <span className={`mt-6 h-1 w-full max-w-6 shrink rounded-full ${done || stations[i - 1].status === 'mastered' ? 'bg-emerald-400' : 'bg-slate-200'}`} aria-hidden="true" />}
            {locked ? (
              <span className="flex min-w-0 flex-1 flex-col items-center" aria-disabled="true" title={status}>
                {dot}{label}
              </span>
            ) : (
              <Link to={`${basePath}/${s.slug}`} onClick={onNavigate} title={`${s.title}${status ? ` — ${status}` : ''}`} aria-current={isHere ? 'step' : undefined}
                className="flex min-w-0 flex-1 flex-col items-center rounded-xl p-1 outline-none hover:bg-indigo-50 focus-visible:ring-4 focus-visible:ring-indigo-300">
                {dot}{label}
              </Link>
            )}
          </li>
        );
      })}
      {practice && (
        <li className="flex min-w-0 flex-1 items-start" data-mission-station="practice" data-station-status={practice.open ? 'open' : 'locked'} data-station-kind="practice">
          <span className={`mt-6 h-1 w-full max-w-6 shrink rounded-full ${practice.open ? 'bg-emerald-400' : 'bg-slate-200'}`} aria-hidden="true" />
          {(() => {
            const dot = (
              <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-black shadow-sm ${practice.open ? 'border-violet-700 bg-violet-600 text-white' : 'border-slate-200 bg-slate-100 text-slate-400'}`}>
                {practice.open ? '📝' : '🔒'}
              </span>
            );
            const label = <span className={`mt-1.5 text-center text-xs leading-snug ${practice.open ? 'font-bold text-slate-700' : 'text-slate-400'}`}>{t('mission.practiceStation')}</span>;
            return practice.open ? (
              <Link to={practice.to} onClick={onNavigate} title={t('mission.practiceStation')}
                className="flex min-w-0 flex-1 flex-col items-center rounded-xl p-1 outline-none hover:bg-violet-50 focus-visible:ring-4 focus-visible:ring-violet-300">
                {dot}{label}
              </Link>
            ) : (
              <span className="flex min-w-0 flex-1 flex-col items-center" aria-disabled="true" title={t('mission.practiceLocked')}>{dot}{label}</span>
            );
          })()}
        </li>
      )}
    </ol>
  );
}
