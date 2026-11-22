import { Suspense, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassMadarDisplay } from '../../services/teacher/madarService';
import ShipIcon from '../../features/madar/components/ShipIcon';
import { formatScore } from '../../features/madar/madarModel';

const PODIUM = [
  { place: 2, height: 'h-28 sm:h-36', ring: 'ring-slate-300', badge: 'from-slate-100 to-slate-400 text-slate-900' },
  { place: 1, height: 'h-40 sm:h-52', ring: 'ring-amber-300', badge: 'from-amber-200 to-amber-500 text-amber-950' },
  { place: 3, height: 'h-20 sm:h-28', ring: 'ring-orange-300', badge: 'from-orange-200 to-orange-500 text-orange-950' },
];

/**
 * « سباق مدار » au tableau : le podium de la semaine et la suite du
 * classement, lisibles à cinq mètres. Prénom + initiale, vaisseau, score —
 * rien d'autre (le serveur ne sert que cela). Plein écran, hors de la
 * coquille enseignant ; rafraîchi toutes les 15 s ; Échap revient à la classe.
 */
function MadarDisplay() {
  const { t } = useTranslation('madar');
  useDocumentMeta(t('teacher.board.title'));
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    const load = () => fetchClassMadarDisplay(token, id, params.get('week'), params.get('game'))
      .then((d) => { if (!cancelled) { setData(d); setError(null); } })
      .catch((e) => !cancelled && setError(e.message));
    load();
    const timer = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [token, id, params]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !document.fullscreenElement) navigate(`/enseignant/classes/${id}?tab=madar`); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, navigate]);

  const top = data?.top ?? [];
  const byPlace = new Map(top.map((r) => [r.rank, r]));
  const rest = top.filter((r) => r.rank > 3);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#2a1458_0%,_#0b0720_55%,_#05040f_100%)] px-6 py-6 text-white sm:px-12" data-madar-display>
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-b from-white to-amber-300 bg-clip-text font-space text-4xl font-black text-transparent sm:text-6xl">{t('teacher.board.title')}</h1>
            {data && <p className="mt-2 font-inter text-lg text-white/70 sm:text-2xl">{t(`games.${data.game ?? 'orbit'}.name`)} · {t('teacher.board.subtitle', { name: data.classroom.name })}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} aria-label={t('teacher.board.fullscreen')} className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20"><Maximize2 size={20} aria-hidden="true" /></button>
            <button type="button" onClick={() => navigate(`/enseignant/classes/${id}?tab=madar`)} aria-label={t('teacher.board.exit')} className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20"><X size={20} aria-hidden="true" /></button>
          </div>
        </header>

        {error && <p role="alert" className="mt-6 rounded-2xl bg-rose-500/20 p-4 text-center font-inter text-rose-100">{error}</p>}
        {data && !data.competitionEnabled && <p className="mt-4 font-inter text-sm text-amber-200">{t('teacher.board.off')}</p>}

        {data && top.length === 0 && <p className="mt-24 text-center font-space text-3xl font-black text-white/70">{t('teacher.board.empty')}</p>}

        {top.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-3 items-end gap-4 sm:gap-8">
            {PODIUM.map(({ place, height, ring, badge }) => {
              const row = byPlace.get(place);
              return (
                <div key={place} className="flex flex-col items-center">
                  <AnimatePresence mode="wait">
                    {row && (
                      <motion.div key={`${row.name}-${row.best}`} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-3 flex flex-col items-center text-center">
                        <ShipIcon id={row.ship} size={place === 1 ? 110 : 80} />
                        <p className="mt-2 max-w-full truncate font-inter text-xl font-bold sm:text-3xl"><bdi>{row.name}</bdi>{row.isTeacher && <span className="ms-2 rounded-full bg-fuchsia-400 px-2 py-0.5 align-middle text-sm font-black text-fuchsia-950">{t('board.teacher')}</span>}</p>
                        <p className="font-space text-2xl font-black tabular-nums text-amber-200 sm:text-4xl" dir="ltr">{formatScore(row.best)}</p>
                        {row.wave != null && <p className="font-inter text-base text-cyan-200">{t(progressKey(data?.game, true), { n: row.wave })}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className={`flex w-full items-start justify-center rounded-t-3xl bg-white/[0.07] pt-4 ring-2 ${ring} ${height}`}>
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b font-space text-3xl font-black ${badge}`} dir="ltr">{place}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {rest.length > 0 && (
          <ol className="mx-auto mt-8 grid max-w-5xl gap-2 sm:grid-cols-2">
            {rest.map((row) => (
              <li key={`${row.rank}-${row.name}`} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] px-5 py-3 ring-1 ring-white/10">
                <span className="font-space text-2xl font-black text-white/60" dir="ltr">{row.rank}</span>
                <ShipIcon id={row.ship} size={44} />
                <span className="min-w-0 flex-1 truncate font-inter text-xl font-semibold"><bdi>{row.name}</bdi>{row.isTeacher && <span className="ms-2 rounded-full bg-fuchsia-400 px-2 py-0.5 align-middle text-sm font-black text-fuchsia-950">{t('board.teacher')}</span>}</span>
                {row.wave != null && <span className="font-inter text-sm text-cyan-200">{t(progressKey(data?.game), { n: row.wave })}</span>}
                <span className="font-space text-2xl font-black tabular-nums" dir="ltr">{formatScore(row.best)}</span>
              </li>
            ))}
          </ol>
        )}

        {data && (
          <p className="mt-10 text-center font-inter text-lg text-white/60">{t('teacher.board.participation', { n: data.participants, m: data.members })}</p>
        )}
      </div>
    </MotionConfig>
  );
}

/** Ce que porte `wave` selon le jeu : la vague, le niveau, ou la manche. */
const progressKey = (game, long = false) => (game === 'explorer' ? 'explorer.board.level'
  : ['sniper', 'odd', 'mental'].includes(game) ? 'sniper.board.round'
    : long ? 'defense.hud.wave' : 'defense.board.wave');

export default function MadarDisplayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05040f]" />}>
      <MadarDisplay />
    </Suspense>
  );
}
