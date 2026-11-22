import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { Calculator, Fuel, Gamepad2, Loader2, Lock, Play, Sparkles, Star, Trophy } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { useMadarScope } from '../../../features/madar/madarScope';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { createAudio } from '../../../features/madar/engine/audio';
import { formatScore, gamesByCategory } from '../../../features/madar/madarModel';
import AdjustmentNotice from '../../../features/madar/components/AdjustmentNotice';
import HeartsRow from '../../../features/madar/components/HeartsRow';
import RefuelStation from '../../../features/madar/components/RefuelStation';
import ShipIcon from '../../../features/madar/components/ShipIcon';
import TurretIcon from '../../../features/madar/components/TurretIcon';

/** Une illustration par jeu — dessinée en code (SVG), comme tout le reste. */
function Art({ game }) {
  if (game === 'orbit') {
    return (
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        <circle cx="80" cy="50" r="18" fill="#a8714a" />
        <circle cx="80" cy="50" r="30" fill="none" stroke="#fde68a55" strokeDasharray="3 5" />
        <circle cx="80" cy="50" r="42" fill="none" stroke="#fde68a33" strokeDasharray="3 5" />
        <polygon points="40,40 46,36 44,46" fill="#fde047" />
        <circle cx="120" cy="66" r="6" fill="#7a6658" />
        <g transform="translate(62 80)"><ShipIcon id="sahm" size={30} /></g>
      </svg>
    );
  }
  if (game === 'sniper') {
    return (
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        <path d="M0 96 Q80 70 160 96 L160 100 L0 100 Z" fill="#6d4c8f" />
        <ellipse cx="44" cy="30" rx="30" ry="15" fill="#6b5d55" />
        <rect x="22" y="21" width="44" height="18" rx="6" fill="#fff" />
        <text x="44" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a" direction="ltr">√50</text>
        <ellipse cx="116" cy="50" rx="30" ry="15" fill="#6b5d55" />
        <rect x="94" y="41" width="44" height="18" rx="6" fill="#fff" />
        <text x="116" y="54" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a" direction="ltr">2√5</text>
        <line x1="80" y1="88" x2="44" y2="38" stroke="#fde68a" strokeWidth="3" />
        <circle cx="44" cy="30" r="20" fill="none" stroke="#fde68a" strokeWidth="2" strokeDasharray="4 3" />
        <path d="M70 92 a10 10 0 0 1 20 0 z" fill="#c4b5fd" />
      </svg>
    );
  }
  if (game === 'mental') {
    return (
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        <rect x="44" y="14" width="72" height="30" rx="10" fill="#fff" />
        <text x="80" y="35" textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a" direction="ltr">11 × 25</text>
        {[0, 1, 2].map((i) => <rect key={i} x={56 + i * 17} y="52" width="14" height="18" rx="4" fill={i < 2 ? '#fde68a' : '#ffffff33'} />)}
        <text x="63" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0f172a">2</text>
        <text x="80" y="66" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0f172a">7</text>
        <rect x="20" y="78" width="4" height="18" rx="2" fill="#ffffff22" />
        <rect x="20" y="86" width="4" height="10" rx="2" fill="#fbbf24" />
        <circle cx="22" cy="72" r="6" fill="#d2532c" />
        <path d="M128 70 l8 -14 l8 14 z" fill="#f472b6" />
        <path d="M132 70 l4 10 l4 -10 z" fill="#fbbf24" />
      </svg>
    );
  }
  if (game === 'odd') {
    const cell = (x, y, label, hot) => (
      <g key={label + x}>
        <rect x={x} y={y} width="42" height="26" rx="7" fill="#fff" stroke={hot ? '#fbbf24' : '#34d39988'} strokeWidth={hot ? 3 : 1.5} />
        <text x={x + 21} y={y + 17} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a" direction="ltr">{label}</text>
      </g>
    );
    return (
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        {cell(30, 18, '3 × 4', false)}
        {cell(88, 18, '7 + 5', false)}
        {cell(30, 56, '2 + 5 × 2', true)}
        {cell(88, 56, '24 ÷ 2', false)}
        <circle cx="51" cy="69" r="27" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    );
  }
  if (game === 'defense') {
    return (
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        <circle cx="80" cy="50" r="16" fill="#2f8fdc" />
        <circle cx="80" cy="50" r="22" fill="none" stroke="#34d399" strokeWidth="3" />
        <circle cx="80" cy="50" r="36" fill="none" stroke="#94a3ff33" />
        <line x1="54" y1="30" x2="30" y2="18" stroke="#f472b6" strokeWidth="2" />
        <polygon points="26,14 34,18 26,22" fill="#4ade80" />
        <polygon points="132,70 140,74 132,78" fill="#4ade80" />
        <g transform="translate(44 20)"><TurretIcon type="laser" size={22} /></g>
        <g transform="translate(96 58)"><TurretIcon type="pulse" size={22} /></g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
      <rect x="0" y="78" width="70" height="22" fill="#8b93a7" />
      <rect x="0" y="78" width="70" height="4" fill="#cbd5e1" />
      <rect x="92" y="78" width="68" height="22" fill="#8b93a7" />
      <rect x="92" y="78" width="68" height="4" fill="#cbd5e1" />
      <rect x="62" y="40" width="14" height="14" fill="#7c3aed" stroke="#fde68a" strokeWidth="2" />
      <polygon points="69,43 73,47 69,51 65,47" fill="#fde68a" />
      <polygon points="104,58 108,62 104,66 100,62" fill="#67e8f9" />
      <polygon points="116,58 120,62 116,66 112,62" fill="#67e8f9" />
      <circle cx="40" cy="62" r="7" fill="#f8fafc" />
      <ellipse cx="38" cy="62" rx="4" ry="3" fill="#f59e0b" />
      <rect x="35" y="68" width="10" height="10" rx="2" fill="#f8fafc" />
      <path d="M140 78 q4 -26 10 0 z" fill="#e2e8f0" />
    </svg>
  );
}

/**
 * « فضاء الألعاب » — la salle des jeux de l'élève (/espace/jeux), plein écran.
 *
 * Ce qui est COMMUN aux jeux vit ici : les cœurs, la « محطة التزوّد » (où une
 * réponse juste rend un cœur), les messages de l'enseignant, la limite de
 * parties du jour. Les jeux sont rangés en DEUX familles (`games[].category`),
 * les MATHÉMATIQUES D'ABORD (choix du propriétaire) : « ألعاب رياضيات » (gratuits,
 * leurs mathématiques sont le jeu, ils s'adaptent au niveau de l'élève), puis
 * « ألعاب ترفيهية » (ils coûtent un cœur). Chaque jeu est une carte (ce qu'il entraîne, le
 * record, le rang de la semaine) qui ouvre /espace/jeux/:game. Un jeu fermé par
 * l'enseignant — pour la classe ou pour CET élève — reste visible, verrouillé.
 */
export default function GamesHub() {
  const { t } = useTranslation('madar');
  useDocumentMeta(t('hub.title'));
  const { token } = useContext(AuthContext);
  // L'élève, ou l'enseignant qui joue dans une de ses classes (« نافس أستاذك »).
  const scope = useMadarScope();
  const reduce = useReducedMotion();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [refuel, setRefuel] = useState(false);
  const [notices, setNotices] = useState([]);
  const audio = useMemo(() => createAudio(), []);
  useEffect(() => () => audio.dispose(), [audio]);

  const load = useCallback(async () => {
    try {
      const data = await scope.api.fetchMadar(token);
      setState(data);
      if (data.adjustments?.length) setNotices((cur) => [...cur, ...data.adjustments]);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [token, scope.api]);
  useEffect(() => { if (token) load(); }, [token, load]);
  const onHearts = useCallback(({ hearts }) => setState((s) => (s ? { ...s, hearts } : s)), []);

  if (!state) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[#060414] text-white">
        {error ? <p role="alert" className="font-inter text-sm text-rose-200">{error}</p>
          : <p className="flex items-center gap-2 font-inter text-white/70" role="status"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> {t('loading')}</p>}
      </div>
    );
  }

  const meta = {
    orbit: { stat: formatScore(state.best), statLabel: t('lobby.best'), rank: state.competition?.me?.rank },
    defense: { stat: state.defense?.bestWave ?? 0, statLabel: t('defense.lobby.bestWave'), rank: state.defense?.competition?.me?.rank },
    explorer: { stat: `${state.explorer?.totalStars ?? 0}/${state.explorer?.maxStars ?? 36}`, statLabel: t('explorer.stars'), rank: state.explorer?.competition?.me?.rank, star: true },
    sniper: { stat: `${state.sniper?.level ?? 1}/50`, statLabel: t('sniper.lobby.levelShort'), rank: state.sniper?.competition?.me?.rank },
    odd: { stat: `${state.odd?.level ?? 1}/50`, statLabel: t('sniper.lobby.levelShort'), rank: state.odd?.competition?.me?.rank },
    mental: { stat: `${state.mental?.level ?? 1}/50`, statLabel: t('sniper.lobby.levelShort'), rank: state.mental?.competition?.me?.rank },
  };
  const groups = gamesByCategory((state.games ?? []).filter((g) => meta[g.id]));
  const closed = !state.available;
  const sections = [
    { id: 'math', icon: Calculator, games: groups.math },
    { id: 'fun', icon: Sparkles, games: groups.fun },
  ].filter((sec) => sec.games.length > 0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_#1e1b4b_0%,_#0b0720_50%,_#05040f_100%)] text-white" data-games-hub>
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-[max(14px,env(safe-area-inset-top))] sm:px-8">
          <Link to={scope.exit} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/10 px-3 font-inter text-sm font-semibold ring-1 ring-white/15 hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50">
            <ArrowBack size={16} aria-hidden="true" /> <span>{scope.teacher ? t('teacherPlay.back') : t('back')}</span>
          </Link>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
            <HeartsRow hearts={state.hearts} max={state.maxHearts} size={20} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-8">
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-300/15 px-3 py-1 font-inter text-xs font-bold text-amber-200"><Gamepad2 size={14} aria-hidden="true" /> {t('hub.eyebrow')}</p>
            <h1 className="mt-3 bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text font-space text-5xl font-black leading-tight text-transparent sm:text-6xl">{t('hub.title')}</h1>
            <p className="mx-auto mt-2 max-w-xl font-inter text-sm leading-relaxed text-white/75 sm:text-base">{scope.teacher ? t('teacherPlay.subtitle', { name: state.classroom?.name ?? '' }) : t('hub.subtitle')}</p>
          </motion.div>

          {!scope.teacher && <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
              <p className="font-inter text-sm text-white/80">{t('hub.heartsRule', { n: state.dailyFreeHearts })}</p>
              <p className="mt-0.5 font-inter text-xs text-white/55">{t('lobby.runsToday')}: <bdi dir="ltr">{t('lobby.runsTodayValue', { n: state.runsToday, cap: state.dailyRunCap })}</bdi></p>
            </div>
            {state.hearts < state.maxHearts && state.available && (
              <button type="button" onClick={() => { audio.unlock(); setRefuel(true); }}
                className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-500 px-5 font-space text-base font-black text-slate-950 shadow-[0_10px_30px_-10px_rgba(251,146,60,0.8)] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200" data-action="refuel">
                <Fuel size={20} aria-hidden="true" /> {t('lobby.refuel')}
              </button>
            )}
          </div>}
          {scope.teacher && (
            <p className="mx-auto mt-6 max-w-3xl rounded-2xl bg-amber-300/15 p-3 text-center font-inter text-sm font-semibold text-amber-100 ring-1 ring-amber-300/30" data-teacher-play>
              {t('teacherPlay.rule')}
            </p>
          )}
          <div className="mx-auto mt-3 max-w-3xl"><AdjustmentNotice adjustments={notices} onDismiss={() => setNotices([])} /></div>
          {closed && <p className="mx-auto mt-4 max-w-3xl rounded-2xl bg-white/[0.06] p-3 text-center font-inter text-sm text-white/80" role="status">{t(`reasons.${state.reason}`, { defaultValue: t('reasons.disabled') })}</p>}

          {sections.map((sec) => (
            <section key={sec.id} className="mt-8" aria-labelledby={`games-${sec.id}`} data-games-category={sec.id}>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 id={`games-${sec.id}`} className="flex items-center gap-2 font-space text-2xl font-black text-white">
                  <sec.icon size={22} className={sec.id === 'math' ? 'text-emerald-300' : 'text-fuchsia-300'} aria-hidden="true" /> {t(`hub.categories.${sec.id}.title`)}
                </h2>
                <p className="font-inter text-sm text-white/60">{t(`hub.categories.${sec.id}.subtitle`)}</p>
              </div>
              <ul className="mt-3 grid gap-4 md:grid-cols-3" data-games>
                {sec.games.map((g, i) => {
                  const card = { id: g.id, ...meta[g.id] };
                  const open = !closed && g.enabled !== false;
                  return (
                    <motion.li key={card.id} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                      <article className={`group flex h-full flex-col overflow-hidden rounded-[28px] bg-slate-950/60 ring-1 backdrop-blur transition ${open ? 'ring-white/15 hover:-translate-y-1 hover:ring-amber-300/50' : 'opacity-70 ring-white/10'}`} data-game-card={card.id}>
                        <div className={`relative h-36 bg-gradient-to-b p-3 ${sec.id === 'math' ? 'from-emerald-500/20' : 'from-indigo-500/20'} to-transparent`}>
                          <Art game={card.id} />
                          {g.free && <span className="absolute start-3 top-3 rounded-full bg-emerald-300 px-2.5 py-1 font-inter text-xs font-black text-emerald-950" data-free>{t('sniper.free')}</span>}
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-4">
                          <h3 className="font-space text-2xl font-black text-white">{t(`games.${card.id}.name`)}</h3>
                          <p className="font-inter text-xs font-semibold text-amber-200/90">{t(`games.${card.id}.skill`)}</p>
                          <p className="font-inter text-sm leading-relaxed text-white/70">{t(`games.${card.id}.tagline`)}</p>
                          <div className="mt-auto flex items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-inter text-xs">
                              {card.star && <Star size={12} className="fill-amber-300 text-amber-300" aria-hidden="true" />}
                              <span className="text-white/60">{card.statLabel}:</span> <b className="font-space" dir="ltr">{card.stat}</b>
                            </span>
                            {card.rank && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/15 px-2.5 py-1 font-inter text-xs text-amber-100">
                                <Trophy size={12} aria-hidden="true" /> <span dir="ltr">#{card.rank}</span>
                              </span>
                            )}
                          </div>
                          {open ? (
                            <Link to={`${scope.hub}/${card.id}`} className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white font-space text-lg font-black text-slate-950 transition group-hover:bg-amber-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60" data-action="open-game">
                              <Play size={18} className="-scale-x-100" aria-hidden="true" /> {t('hub.play')}
                            </Link>
                          ) : (
                            <p className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white/5 px-3 text-center font-inter text-sm text-white/60" data-closed-by={g.closedBy ?? 'all'}>
                              <Lock size={16} aria-hidden="true" /> {g.closedBy === 'student' ? t('games.closedForYou') : t('games.closed')}
                            </p>
                          )}
                        </div>
                      </article>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ))}
        </main>

        {refuel && (
          <RefuelStation
            context="base"
            hearts={state.hearts}
            maxHearts={state.maxHearts}
            audio={audio}
            canPlay={false}
            onHearts={onHearts}
            onClose={() => { setRefuel(false); load(); }}
            onContinue={() => setRefuel(false)}
            onPlay={() => setRefuel(false)}
          />
        )}
      </div>
    </MotionConfig>
  );
}
