import { Suspense, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { LOCALE } from '../../locale.js';
import { AuthContext } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { fetchClassChallengeDisplay } from '../../services/teacher/dailyChallengeService';
import { percent } from '../../features/dailyChallenge/challengeModel';

const VIEWS = ['results', 'leaderboard', 'questions', 'participation'];
const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Le MODE D'AFFICHAGE du défi : ce que la classe voit au tableau.
 *
 * Hors de la coquille enseignant, plein écran possible, lisible à cinq
 * mètres. N'affiche que ce qui peut l'être devant tous (le serveur ne sert
 * que cela : `…/daily-challenge/display`) — prénom + initiale, scores,
 * participation, réussite par question. Jamais une réponse individuelle,
 * jamais un temps d'élève. Compétition coupée : ni podium ni classement.
 *
 * Clavier : 1–4 changent de vue, Échap revient à la classe.
 */
function ChallengeDisplay() {
  const { t } = useTranslation('challenge');
  useDocumentMeta(t('display.title'));
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('results');

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    const load = () => fetchClassChallengeDisplay(token, id, params.get('date'))
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message));
    load();
    // Les résultats arrivent pendant que la classe joue : rafraîchi toutes les 20 s.
    const timer = window.setInterval(load, 20000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [token, id, params]);

  const exit = () => navigate(`/enseignant/classes/${id}?tab=dailyChallenge`);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) exit();
      const n = Number(e.key);
      if (n >= 1 && n <= VIEWS.length) setView(VIEWS[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const views = data?.competitionEnabled ? VIEWS : VIEWS.filter((v) => v !== 'leaderboard');
  const current = views.includes(view) ? view : views[0];

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen overflow-hidden bg-slate-50 px-5 py-6 text-slate-900 sm:px-10" data-challenge-display data-view={current}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400/15 via-violet-400/15 to-cyan-300/15 blur-3xl" />

        <header className="relative flex flex-wrap items-center gap-3">
          <p className="font-space text-lg font-black tracking-wide sm:text-2xl">🏆 {t('display.title')}</p>
          {data && <p className="font-inter text-sm text-slate-500">{data.classroom.name} · <span dir="ltr">{data.date}</span></p>}
          <div className="ms-auto flex items-center gap-2">
            <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300" aria-label={t('display.fullscreen')}>
              <Maximize2 size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={exit} className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300" aria-label={t('display.exit')}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        <nav className="relative mt-5 flex flex-wrap gap-2" aria-label={t('display.title')}>
          {views.map((v, i) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={current === v}
              className={`min-h-[44px] rounded-full px-4 font-inter text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${current === v ? 'bg-nav-accent text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
              <span className="mx-1.5 font-mono-jetbrains text-xs opacity-60" dir="ltr">{i + 1}</span>{t(`display.views.${v}`)}
            </button>
          ))}
        </nav>

        {error && <p role="alert" className="relative mt-10 text-center text-rose-600">{error}</p>}
        {data && (
          <AnimatePresence mode="wait">
            <motion.section key={current} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
              className="relative mx-auto mt-8 w-full">
              {current === 'results' && <ResultsView data={data} />}
              {current === 'leaderboard' && <LeaderboardView data={data} />}
              {current === 'questions' && <QuestionsView data={data} />}
              {current === 'participation' && <ParticipationView data={data} />}
            </motion.section>
          </AnimatePresence>
        )}
      </main>
    </MotionConfig>
  );
}

function ResultsView({ data }) {
  const { t } = useTranslation('challenge');
  const [first, ...rest] = data.todayTop;
  return (
    <div className="text-center">
      <p className="font-inter text-sm uppercase tracking-[0.3em] text-slate-500">{t('display.todayResults')}</p>
      {!data.competitionEnabled && <p className="mx-auto mt-6 max-w-xl text-slate-600">{t('display.competitionOff')}</p>}
      {data.competitionEnabled && !first && <p className="mt-10 text-2xl text-slate-500">{t('display.empty')}</p>}
      {first && (
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
          className="mx-auto mt-6 max-w-md rounded-[32px] bg-gradient-to-b from-amber-100 to-white p-8 shadow-xl shadow-amber-100 ring-1 ring-amber-300" data-podium-first>
          <p className="text-6xl" aria-label={t('leaderboard.rank', { rank: 1 })}>🥇</p>
          <p className="mt-2 font-space text-4xl font-black sm:text-6xl"><bdi>{first.displayName}</bdi></p>
          <p className="mt-2 font-space text-3xl font-black text-amber-700" dir="ltr">{first.score.toLocaleString(LOCALE)}</p>
        </motion.div>
      )}
      {rest.slice(0, 2).length > 0 && (
        <ol className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
          {rest.slice(0, 2).map((r) => (
            <li key={r.rank} className="flex items-center gap-3 rounded-3xl bg-slate-50 px-5 py-4">
              <span className="text-3xl">{MEDALS[r.rank - 1]}</span>
              <span className="min-w-0 flex-1 truncate text-start font-space text-2xl font-bold"><bdi>{r.displayName}</bdi></span>
              <span className="font-space text-2xl font-black text-slate-700" dir="ltr">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-8 font-inter text-xl text-slate-600">
        {data.participation.completed > 0 ? (
          <>{t('display.participated', { count: data.participation.completed })} <span className="text-slate-500">{t('display.of', { members: data.members })}</span></>
        ) : t('display.participatedNone')}
      </p>
    </div>
  );
}

function LeaderboardView({ data }) {
  const { t } = useTranslation('challenge');
  return (
    <div>
      <p className="text-center font-inter text-sm uppercase tracking-[0.3em] text-slate-500">{t('display.cumulative')}</p>
      {data.leaderboard.length === 0 ? <p className="mt-10 text-center text-2xl text-slate-500">{t('display.empty')}</p> : (
        <ol className="mx-auto mt-6 max-w-3xl space-y-2">
          {data.leaderboard.map((r, i) => (
            <motion.li key={r.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-4 rounded-2xl px-5 py-3 ${r.rank <= 3 ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'bg-white/70 ring-1 ring-slate-100'}`}>
              <span className="w-12 text-center font-space text-2xl font-black" dir="ltr">{MEDALS[r.rank - 1] ?? r.rank}</span>
              <span className="min-w-0 flex-1 truncate font-space text-2xl font-bold"><bdi>{r.displayName}</bdi></span>
              <span className="font-space text-2xl font-black text-amber-700" dir="ltr">{r.score.toLocaleString(LOCALE)}</span>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}

function QuestionsView({ data }) {
  const { t } = useTranslation('challenge');
  return (
    <ol className="mx-auto max-w-4xl space-y-4">
      {data.questions.map((q) => {
        const width = q.correctRate === null ? 0 : Math.round(q.correctRate * 100);
        return (
          <li key={q.position} className="grid grid-cols-[4rem_minmax(0,1fr)_7rem] items-center gap-4">
            <span className="font-space text-2xl font-black">{t('teacher.results.questionN', { n: q.position })}</span>
            <div>
              <div className="h-6 overflow-hidden rounded-full bg-slate-100">
                <motion.div className={`h-full rounded-full ${q.flagged ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-400 to-violet-500'}`} initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8 }} />
              </div>
              <p className="mt-1 truncate font-inter text-sm text-slate-500">{q.learningPoint}</p>
            </div>
            <span className="text-end font-space text-3xl font-black" dir="ltr">{percent(q.correctRate)}{q.flagged ? ' ⚠' : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ParticipationView({ data }) {
  const { t } = useTranslation('challenge');
  const rate = data.participation.rate ?? 0;
  const r = 90;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-16">
      <svg viewBox="0 0 220 220" className="h-64 w-64" role="img" aria-label={`${data.participation.completed} / ${data.members}`}>
        <circle cx="110" cy="110" r={r} fill="none" stroke="#e2e8f0" strokeWidth="18" />
        <motion.circle cx="110" cy="110" r={r} fill="none" stroke="url(#dc-ring)" strokeWidth="18" strokeLinecap="round"
          transform="rotate(-90 110 110)" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - rate) }} transition={{ duration: 1 }} />
        <defs><linearGradient id="dc-ring" x1="0" x2="1"><stop offset="0" stopColor="#fbbf24" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
        <text x="110" y="120" textAnchor="middle" fill="#0f172a" fontSize="44" fontWeight="900" direction="ltr">{data.participation.completed}/{data.members}</text>
      </svg>
      <div className="text-center sm:text-start">
        <p className="font-space text-3xl font-black">{data.participation.completed > 0 ? t('display.participated', { count: data.participation.completed }) : t('display.participatedNone')}</p>
        <p className="mt-4 font-inter text-slate-500">{t('display.accuracy')}</p>
        <p className="font-space text-5xl font-black text-cyan-600" dir="ltr">{percent(data.accuracy)}</p>
      </div>
    </div>
  );
}

export default function ChallengeDisplayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ChallengeDisplay />
    </Suspense>
  );
}
