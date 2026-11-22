import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, X, Check, RotateCcw, Target, BookOpen, CalendarDays, Star, ChevronDown, Compass } from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import { AuthContext } from '../../context/AuthContext';
import { useStudyContext } from '../../context/StudyContextContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import {
  fetchCompass, saveCompassPointer, startCompass, fetchCompassQuestion, answerCompassQuestion, finishCompass,
} from '../../services/compassService';
import {
  yearFor, resolvePointer, pointerChoices, scopeFor, sessionView, reportOf, weekV0, milestone, todayIso, BANDS,
} from '../../features/compass/compassModel';
import ExerciseStatement from '../../features/practice/ExerciseStatement';
import QuestionRenderer from '../../features/practice/QuestionRenderer';
import TemplateInput from '../../features/practice/answerTemplates/TemplateInput';
import { templateFor } from '../../features/practice/answerTemplates/templateFor';
import RichText from '../../features/practice/RichText';
import MathText from '../../lessons/common/components/MathText';
import { canSubmit } from '../../features/dailyChallenge/challengeModel';
import { playSfx } from '../../lessons/common/utils/playEffect';

/**
 * « بوصلتي » — /espace/bawsala (P1). Contrat : docs/architecture/YEAR_COMPASS.md §6.
 *
 * Le SERVEUR sert, corrige et recalcule les bandes ; cette page rejoue le
 * moteur pur (packages/core/compass) sur ses réponses pour savoir quoi
 * demander ensuite. Rien ici ne décide d'une justesse.
 */

const SIGNAL_MS = 900;
const UNDO_MS = 1000;
const STREAK_MS = 1700;
const ROUND = 12;
const SOUND_KEY = 'smarter_compass_sound';

/** Le son est ACTIF par défaut dans بوصلتي (décision 3 du propriétaire) ; un interrupteur le coupe. */
function useCompassSound() {
  const [on, setOn] = useState(() => {
    try { return window.localStorage.getItem(SOUND_KEY) !== '0'; } catch { return true; }
  });
  const toggle = useCallback(() => setOn((v) => {
    try { window.localStorage.setItem(SOUND_KEY, v ? '0' : '1'); } catch { /* stockage indisponible */ }
    return !v;
  }), []);
  return { on, toggle };
}

const BAND_STYLE = {
  [BANDS.SOLID]: 'bg-emerald-100 text-emerald-900',
  [BANDS.CONSOLIDATE]: 'bg-amber-100 text-amber-900',
  [BANDS.START]: 'bg-blue-100 text-blue-900',
  [BANDS.UNSEEN]: 'bg-white text-slate-700 ring-1 ring-slate-300',
};

export default function CompassPage() {
  const { t } = useTranslation('compass');
  useDocumentMeta(t('meta.title'), t('meta.description'));
  const { user, token } = useContext(AuthContext);
  const { studyContext } = useStudyContext();
  const navigate = useNavigate();
  const sound = useCompassSound();

  const today = useMemo(() => todayIso(), []);
  const year = useMemo(() => (user?.grade ? yearFor(user.grade, today) : null), [user?.grade, today]);

  const [state, setState] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setPhase('loading');
    fetchCompass(token).then((s) => {
      setState(s);
      if (!s.enabled || !year) setPhase('disabled');
      else if (s.active) setPhase('play');
      else if (s.last) setPhase('report');
      else setPhase('intro');
    }).catch(() => setPhase('error'));
  }, [token, year]);
  useEffect(() => { if (token) load(); }, [token, load]);

  const begin = useCallback(async (pointer) => {
    setError(null);
    try {
      const saved = await saveCompassPointer(token, pointer);
      const { pointer: ptr, source } = resolvePointer({ profile: saved.profile, year, today });
      const scope = scopeFor(year, ptr);
      const next = await startCompass(token, { targets: scope.targets, pointerLesson: ptr, pointerSource: source, schoolYear: year.schoolYear });
      setState(next);
      setPhase(next.active ? 'play' : 'report');
    } catch (e) {
      setError(e.message);
    }
  }, [token, year, today]);

  if (phase === 'loading') return <div className="sa-page py-16 text-center text-slate-600" aria-busy="true">…</div>;
  if (phase === 'error') {
    return (
      <div className="sa-page py-16 text-center" role="alert">
        <p className="font-bold text-slate-900">{t('error.title')}</p>
        <button type="button" onClick={load} className="mt-4 min-h-[44px] rounded-xl bg-nav-accent px-5 font-bold text-white">{t('error.retry')}</button>
      </div>
    );
  }
  if (phase === 'disabled') {
    return (
      <div className="sa-page py-16 text-center" data-compass-disabled>
        <p className="text-2xl font-black text-slate-900">{t('disabled.title')}</p>
        <p className="mt-2 text-slate-600">{t('disabled.body')}</p>
        <Link to="/espace" className="mt-6 inline-block font-bold text-nav-accent">{t('disabled.back')}</Link>
      </div>
    );
  }
  if (phase === 'intro') return <Intro onStart={() => setPhase('pointer')} year={year} grade={user.grade} today={today} />;
  if (phase === 'pointer') {
    const classroom = studyContext?.mode === 'classroom' ? (studyContext.primary ?? studyContext.classrooms?.[0]) : null;
    return (
      <PointerStep year={year} profile={state?.profile} today={today} classroomName={classroom?.name ?? null}
        error={error} onConfirm={begin} onClose={() => navigate('/espace')} sound={sound} />
    );
  }
  if (phase === 'play') {
    return (
      <Player state={state} setState={setState} token={token} sound={sound}
        onFinished={load} onStop={() => navigate('/espace')} onShowReport={() => setPhase('liveReport')} />
    );
  }
  return (
    <Report state={state} year={year} grade={user.grade} today={today} live={phase === 'liveReport'}
      onContinue={() => setPhase('play')} onRetake={() => setPhase('pointer')} />
  );
}

/* ── 1a · le crochet ─────────────────────────────────────────────── */
function Intro({ onStart, year, grade, today }) {
  const { t } = useTranslation('compass');
  const m = milestone(year, grade, today);
  return (
    <div className="sa-page py-10">
      <section className="mx-auto flex max-w-5xl items-center gap-10 rounded-3xl bg-white p-8 shadow-xl shadow-indigo-100 ring-2 ring-indigo-200 sm:p-10" data-compass-intro>
        <div className="flex-1 space-y-4">
          <span className="inline-block rounded-full bg-nav-accent-soft px-4 py-1 text-sm font-bold text-nav-accent">{t('intro.eyebrow')}</span>
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{t('intro.title')}</h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-700">{t('intro.body')}</p>
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('intro.minutes')}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{t('intro.saved')}</span>
            {m && <MilestoneChip m={m} />}
          </div>
          <button type="button" onClick={onStart} className="min-h-[56px] rounded-2xl bg-nav-accent px-8 text-xl font-black text-white shadow-[0_4px_0_#3730a3] hover:bg-[#3350c4] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300" data-compass-start>
            {t('intro.start')}
          </button>
        </div>
        <Compass aria-hidden="true" className="hidden h-48 w-48 shrink-0 text-indigo-300 md:block" strokeWidth={1.2} />
      </section>
    </div>
  );
}

function MilestoneChip({ m }) {
  const { t } = useTranslation('compass');
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 font-bold text-rose-800" data-compass-milestone>
      <CalendarDays size={16} aria-hidden="true" />
      {m.daysLeft > 0 ? t('week.milestone', { label: m.label, count: m.daysLeft }) : t('week.milestoneNow', { label: m.label })}
    </span>
  );
}

/* ── chrome plein écran (une question par écran, aucun défilement) ── */
function FullWindow({ title, children, onClose, sound, dots }) {
  const { t } = useTranslation('compass');
  return (
    // Dès `lg`, la fenêtre s'arrête au BORD de la barre latérale (propriétaire, 2026-11-09) : <main> pose
    // `--sa-sidebar-w` (StudentLayout) ; en RTL, `inset-inline-start` est le bord droit. Sous `lg`, pas de barre.
    <div className="fixed inset-0 z-50 flex flex-col gap-4 overflow-hidden bg-[#F5F6FF] p-4 sm:p-6 lg:[inset-inline-start:var(--sa-sidebar-w,0px)]" data-compass-player>
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 rounded-2xl bg-indigo-900 px-5 text-white">
        <span className="flex items-center gap-2 font-bold"><Compass size={22} aria-hidden="true" />{title}</span>
        {dots}
        <div className="flex gap-2" dir="ltr">
          {onClose && (
            <button type="button" onClick={onClose} className="flex h-11 items-center gap-1.5 rounded-xl border border-white/30 px-3 text-sm font-bold">
              <X size={18} aria-hidden="true" />{t('play.stop')}
            </button>
          )}
          <button type="button" onClick={sound.toggle} aria-pressed={sound.on} className="flex h-11 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-indigo-900" data-compass-sound>
            {sound.on ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
            {sound.on ? t('play.soundOn') : t('play.soundOff')}
          </button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

/* ── 1b · « أين وصل قسمك؟ » ─────────────────────────────────────── */
function PointerStep({ year, profile, today, classroomName, error, onConfirm, onClose, sound }) {
  const { t } = useTranslation('compass');
  const suggested = useMemo(() => resolvePointer({ profile, year, today }).pointer, [profile, year, today]);
  const choices = useMemo(() => pointerChoices(year, suggested), [year, suggested]);
  const [picked, setPicked] = useState(() => choices.find((c) => c.suggested)?.code ?? choices.at(-1)?.code ?? null);
  const [busy, setBusy] = useState(false);
  const go = async (pointer) => { setBusy(true); await onConfirm(pointer); setBusy(false); };
  const pickedAt = choices.findIndex((c) => c.code === picked);

  return (
    <FullWindow title={t('pointer.eyebrow')} onClose={onClose} sound={sound}>
      <div className="flex w-full max-w-6xl flex-col items-center gap-6" data-compass-pointer>
        <div className="text-center">
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">{t('pointer.title')}</h1>
          <p className="mt-2 text-lg text-slate-700">{t('pointer.body')}</p>
          {classroomName && <p className="mt-2 text-sm font-semibold text-amber-800" data-compass-in-class>{t('pointer.inClass', { name: classroomName })}</p>}
        </div>
        <div className="flex w-full flex-wrap justify-center gap-3 rounded-3xl bg-white p-6 ring-1 ring-slate-200" role="radiogroup" aria-label={t('pointer.title')}>
          {choices.map((c, i) => {
            const on = c.code === picked;
            return (
              <button key={c.code} type="button" role="radio" aria-checked={on} onClick={() => setPicked(c.code)}
                className={`flex w-40 flex-col items-center gap-2 rounded-2xl p-3 text-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${on ? 'bg-nav-accent-soft ring-2 ring-nav-accent' : 'hover:bg-slate-50'}`}>
                <span className={`grid h-12 w-12 place-items-center rounded-full ${i <= pickedAt ? 'bg-indigo-500 text-white' : 'border-2 border-slate-300 bg-white'}`}>
                  {i <= pickedAt && <Check size={22} aria-hidden="true" />}
                </span>
                <span className={`text-base ${on ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{c.titleAr}</span>
                {c.suggested && <span className="rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-900">{t('pointer.suggested')}</span>}
              </button>
            );
          })}
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2 text-rose-800">{error}</p>}
        <button type="button" disabled={!picked || busy} onClick={() => go({ mode: 'lesson', lesson: picked })}
          className="min-h-[56px] rounded-2xl bg-nav-accent px-10 text-xl font-black text-white shadow-[0_4px_0_#3730a3] disabled:opacity-50" data-compass-confirm>
          {t('pointer.confirm')}
        </button>
        <button type="button" disabled={busy} onClick={() => go({ mode: 'not_following' })} className="text-base text-slate-600 underline">
          {t('pointer.notFollowing')}
        </button>
      </div>
    </FullWindow>
  );
}

/* ── 2 · le joueur ──────────────────────────────────────────────── */
function Player({ state, setState, token, sound, onFinished, onStop, onShowReport }) {
  const { t } = useTranslation('compass');
  const active = state.active;
  const view = useMemo(() => sessionView(active, state.availability), [active, state.availability]);
  const [pending, setPending] = useState(active.pending ?? null);
  const [value, setValue] = useState(null);
  const [unsure, setUnsure] = useState(false);
  const [signal, setSignal] = useState(null);
  const [committing, setCommitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(null);
  const [roundAck, setRoundAck] = useState(-1);
  const [failed, setFailed] = useState(null);
  const timer = useRef(null);
  const finishing = useRef(false);

  const atRoundEnd = view.roundEnded && roundAck !== view.roundIndex;

  // la fin : le serveur recalcule les bandes, puis le rapport
  useEffect(() => {
    if (!view.finished || finishing.current || pending) return;
    finishing.current = true;
    finishCompass(token, active.uuid).then(onFinished).catch((e) => { finishing.current = false; setFailed(e.message); });
  }, [view.finished, pending, token, active.uuid, onFinished]);

  // la question suivante, choisie par le moteur, servie par le serveur (après la fête éventuelle)
  useEffect(() => {
    if (pending || view.finished || atRoundEnd || !view.next || celebrate) return undefined;
    let cancelled = false;
    setBusy(true);
    fetchCompassQuestion(token, active.uuid, view.next.itemId, view.next.level)
      .then((q) => { if (!cancelled) setPending(q); })
      .catch((e) => { if (!cancelled) setFailed(e.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [pending, view.finished, view.next, atRoundEnd, celebrate, token, active.uuid]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = useCallback(async () => {
    setCommitting(false);
    setBusy(true);
    try {
      const answer = canSubmit(pending.content?.question, value) ? value : null;
      const res = await answerCompassQuestion(token, active.uuid, pending.id, answer, unsure);
      setSignal(res.correct ? 'right' : 'later');
      playSfx(res.correct ? 'correct' : 'pop', { enabled: sound.on });
      const answered = [...active.answers, { itemId: pending.itemId, level: pending.level, correct: res.correct, unsure }];
      const run = res.correct ? streak + 1 : 0;
      timer.current = setTimeout(() => {
        setSignal(null);
        setValue(null);
        setUnsure(false);
        setPending(null);
        setStreak(run);
        if (run > 0 && run % 3 === 0) {
          setCelebrate(run);
          playSfx('win', { enabled: sound.on });
        }
        setState((s) => ({ ...s, active: { ...s.active, answers: answered, pending: null } }));
      }, SIGNAL_MS);
    } catch (e) {
      setFailed(e.message);
    } finally {
      setBusy(false);
    }
  }, [pending, value, unsure, token, active, streak, sound.on, setState]);

  const commit = () => {
    setCommitting(true);
    timer.current = setTimeout(send, UNDO_MS);
  };
  const undo = () => { clearTimeout(timer.current); setCommitting(false); };

  const inRound = view.asked % ROUND;
  const title = t('play.bar', { n: view.roundIndex + 1 });

  if (atRoundEnd) {
    const r = reportOf(active, state.availability);
    return (
      <FullWindow title={t('play.bar', { n: view.roundIndex })} sound={sound}>
        <div className="w-full max-w-3xl space-y-5 rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200" data-compass-round-end>
          <Star size={64} aria-hidden="true" className="mx-auto fill-amber-400 text-amber-600" />
          <h1 className="text-3xl font-black text-slate-900">{t('round.title', { n: view.roundIndex })}</h1>
          <p className="text-lg text-slate-700">{t('round.found')}</p>
          <BandCounts counts={r.counts} withUnseen={false} />
          <p className="text-slate-700">{t('round.more')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => setRoundAck(view.roundIndex)} className="min-h-[52px] rounded-2xl bg-nav-accent px-8 text-lg font-black text-white" data-compass-continue>
              {t('round.continue', { n: view.roundIndex + 1 })}
            </button>
            <button type="button" onClick={onStop} className="min-h-[52px] rounded-2xl border border-slate-300 bg-white px-6 font-bold text-slate-800">{t('round.stop')}</button>
          </div>
          <button type="button" onClick={onShowReport} className="font-bold text-nav-accent underline">{t('round.seeReport')}</button>
        </div>
      </FullWindow>
    );
  }

  const q = pending?.content?.question;
  const tpl = q ? templateFor(q) : null; // pur et bon marché : pas de hook après le retour anticipé ci-dessus
  const st = pending?.content?.statement;
  const dots = (
    <div className="hidden items-center gap-1.5 md:flex" role="img" aria-label={t('play.progress')}>
      {Array.from({ length: ROUND }, (_, i) => (
        <span key={i} className={`h-5 w-5 rounded-full ${i < inRound ? 'bg-emerald-400' : i === inRound ? 'bg-white' : 'bg-white/20'}`} />
      ))}
    </div>
  );

  return (
    <FullWindow title={title} onClose={onStop} sound={sound} dots={dots}>
      {/* Plus large (max-w-5xl) : avec de la place autour, une formule ne doit jamais passer à la ligne. */}
      <article className="relative flex max-h-full w-full max-w-5xl flex-col gap-5 overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8" data-compass-question>
        {!pending && !failed && <p className="py-16 text-center text-slate-600" aria-live="polite">{t('play.loading')}</p>}
        {failed && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-rose-800">{failed}</p>}
        {pending && (
          <>
            <p className="text-sm font-bold text-slate-600">{t('play.position', { n: inRound + 1 })}</p>
            {(st?.content || st?.formulas || st?.table || st?.figure) && <div className="rounded-2xl bg-slate-50 p-3"><ExerciseStatement content={st.content} visual={st.visual} formulas={st.formulas} table={st.table} figure={st.figure} /></div>}
            {q?.lead && <p className="text-lg text-slate-800"><RichText>{q.lead}</RichText></p>}
            {/* « الإجابة تُكتب في شكلها » (EXERCISE_CONTRACT.md § « قوالب الإجابة ») : une réponse tapée se saisit dans
                son modèle ; un modèle « gap » dessine lui-même la formule de la question, avec la case à la place des « … ». */}
            {tpl?.kind !== 'gap' && <h1 className="text-2xl font-bold leading-relaxed text-slate-900"><RichText>{q?.statement ?? ''}</RichText></h1>}
            {q && (tpl
              ? <TemplateInput key={pending.id} template={tpl} question={q} onChange={setValue} disabled={Boolean(signal) || committing || busy} />
              : <QuestionRenderer question={q} value={value} onChange={setValue} disabled={Boolean(signal) || committing || busy} />)}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" aria-pressed={unsure} disabled={Boolean(signal) || committing} onClick={() => setUnsure((u) => !u)}
                className={`min-h-[48px] rounded-xl border px-5 font-bold ${unsure ? 'border-slate-500 bg-slate-100 text-slate-900' : 'border-dashed border-slate-400 text-slate-700'}`} data-compass-unsure>
                {unsure ? t('play.unsureOn') : t('play.unsure')}
              </button>
              {committing ? (
                <button type="button" onClick={undo} className="min-h-[48px] rounded-xl border border-slate-300 bg-slate-50 px-5 font-bold text-slate-800" data-compass-undo>{t('play.undo')}</button>
              ) : (
                <button type="button" onClick={commit} disabled={Boolean(signal) || busy || !(canSubmit(q, value) || unsure)}
                  className="min-h-[52px] rounded-2xl bg-nav-accent px-8 text-lg font-black text-white disabled:opacity-40" data-compass-check>
                  {busy ? t('play.sending') : t('play.check')}
                </button>
              )}
            </div>
            {signal === 'right' && (
              <div className="absolute end-6 top-6 flex -rotate-6 items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-2xl font-black text-white shadow-lg" role="status" data-compass-signal="right">
                <Check size={26} aria-hidden="true" />{t('play.right')}
              </div>
            )}
            {signal === 'later' && (
              <div className="absolute end-6 top-6 flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2 text-xl font-black text-slate-800" role="status" data-compass-signal="later">
                <RotateCcw size={22} aria-hidden="true" />{t('play.later')}
              </div>
            )}
          </>
        )}
        {celebrate && <StreakToast count={celebrate} onDone={() => setCelebrate(null)} />}
      </article>
    </FullWindow>
  );
}

function StreakToast({ count, onDone }) {
  const { t } = useTranslation('compass');
  useEffect(() => {
    const id = setTimeout(onDone, STREAK_MS);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="absolute inset-0 grid place-items-center bg-indigo-950/50" role="status" data-compass-streak>
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-2xl">
        <div className="flex justify-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => <Star key={i} size={i === 1 ? 64 : 48} className="fill-amber-400 text-amber-600" />)}
        </div>
        <p className="mt-3 text-4xl font-black text-indigo-900">{t('play.streakTitle', { count })}</p>
        <p className="mt-1 text-lg text-slate-700">{t('play.streakBody')}</p>
      </div>
    </div>
  );
}

function BandCounts({ counts, withUnseen = true }) {
  const { t } = useTranslation('compass');
  const bands = [BANDS.SOLID, BANDS.CONSOLIDATE, BANDS.START, ...(withUnseen ? [BANDS.UNSEEN] : [])];
  return (
    <div className={`grid gap-3 ${withUnseen ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-3'}`} data-compass-counts>
      {bands.map((b) => (
        <div key={b} className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-3 ${BAND_STYLE[b]}`} data-band={b}>
          <span className="flex flex-col text-start">
            <span className="text-lg font-black">{t(`bands.${b}`)}</span>
            {b === BANDS.UNSEEN && <span className="text-sm">{t('bands.unseenHint')}</span>}
          </span>
          <span className="text-3xl font-black tabular-nums">{counts[b] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 3 · « خريطة نقاطي » + la semaine v0 ─────────────────────────── */
function Report({ state, year, grade, today, live, onContinue, onRetake }) {
  const { t } = useTranslation('compass');
  const session = live ? state.active : state.last;
  const report = useMemo(() => (session ? reportOf(session, state.availability) : null), [session, state.availability]);
  const [open, setOpen] = useState(false);
  if (!report) return null;
  const tasks = weekV0(report, year, session.pointerLesson);
  const m = milestone(year, grade, today);
  const measured = report.all.filter((l) => l.band !== BANDS.UNSEEN).length;
  const retakeDate = state.nextRetakeAt ? new Date(state.nextRetakeAt).toLocaleDateString('ar-DZ', { day: 'numeric', month: 'long' }) : null;

  return (
    <div className="sa-page py-8" data-compass-report>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-nav-accent">{t('report.eyebrow')}</p>
          <h1 className="text-3xl font-black text-slate-900">{t('report.title')}</h1>
          <p className="text-slate-600">{t('report.subtitle', { count: measured })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {m && <MilestoneChip m={m} />}
          {live
            ? <button type="button" onClick={onContinue} className="min-h-[48px] rounded-2xl bg-nav-accent px-6 font-black text-white">{t('report.backToCheck')}</button>
            : retakeDate
              ? <span className="text-sm text-slate-600">{t('report.nextRetake', { date: retakeDate })}</span>
              : <button type="button" onClick={onRetake} className="min-h-[48px] rounded-2xl border border-indigo-300 bg-white px-5 font-bold text-nav-accent">{t('report.retake')}</button>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          {report.priority ? (
            <div className="space-y-3 rounded-3xl bg-white p-6 shadow-lg shadow-teal-100 ring-2 ring-teal-200" data-compass-priority>
              <span className="inline-block rounded-full bg-teal-100 px-3 py-0.5 text-sm font-black text-teal-900">{t('report.startHere')}</span>
              <h2 className="text-2xl font-black text-slate-900"><MathText>{report.priority.textAr}</MathText></h2>
              <p className="text-slate-600">{t(`report.grade.${report.priority.grade}`)}{report.priority.homeLesson ? ` · ${report.priority.homeLesson.titleAr}` : ''}</p>
              <ReviseLink line={report.priority} big />
            </div>
          ) : (
            <p className="rounded-3xl bg-emerald-50 p-6 text-lg font-bold text-emerald-900">{t('report.none')}</p>
          )}
          {report.also.length > 0 && (
            <div className="space-y-2">
              <p className="font-black text-slate-800">{t('report.also')}</p>
              {report.also.map((l) => <ItemRow key={l.id} line={l} />)}
            </div>
          )}
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 font-bold text-nav-accent" data-compass-fold>
            {open ? t('report.hideAll') : t('report.all', { count: report.all.length })}
            <ChevronDown size={18} aria-hidden="true" className={open ? 'rotate-180' : ''} />
          </button>
          {open && <div className="space-y-2" data-compass-all>{report.all.map((l) => <ItemRow key={l.id} line={l} />)}</div>}
        </section>

        <aside className="space-y-4">
          <BandCounts counts={report.counts} />
          <p className="text-sm leading-relaxed text-slate-600">{t('report.note')}</p>
        </aside>
      </div>

      {!live && (
        <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200" data-compass-week>
          <h2 className="text-2xl font-black text-slate-900">{t('week.title')}</h2>
          <div className="mt-4 space-y-3">
            {tasks.length === 0 && <p className="text-slate-600">{t('week.empty')}</p>}
            {tasks.map((task) => <WeekTask key={task.kind + (task.item?.id ?? task.lesson?.code)} task={task} />)}
          </div>
          <p className="mt-4 text-sm text-slate-600">{t('week.later')}</p>
        </section>
      )}
    </div>
  );
}

function ReviseLink({ line, big = false }) {
  const { t } = useTranslation('compass');
  const path = line.homeLesson?.status === 'available' ? getLessonPath(line.homeLesson.code) : null;
  if (!path) return <p className="text-sm text-slate-600">{t('report.soon')}</p>;
  return (
    <Link to={path} className={`inline-flex items-center gap-2 rounded-xl bg-teal-700 font-black text-white hover:bg-teal-800 ${big ? 'min-h-[48px] px-6 text-lg' : 'min-h-[40px] px-4 text-sm'}`}>
      <BookOpen size={big ? 20 : 16} aria-hidden="true" />{big ? t('report.revise') : t('report.reviseShort')}
    </Link>
  );
}

function ItemRow({ line }) {
  const { t } = useTranslation('compass');
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 ring-1 ring-slate-200">
      <div className="min-w-0">
        <p className="font-bold text-slate-900"><MathText>{line.textAr}</MathText></p>
        <p className="text-sm text-slate-600">{t(`report.grade.${line.grade}`)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${BAND_STYLE[line.band]}`}>{t(`bands.${line.band}`)}</span>
        {line.band !== BANDS.SOLID && line.band !== BANDS.UNSEEN && <ReviseLink line={line} />}
      </div>
    </div>
  );
}

function WeekTask({ task }) {
  const { t } = useTranslation('compass');
  if (task.kind === 'prepare') {
    const path = getLessonPath(task.lesson.code);
    return (
      <div className="flex items-center gap-4 rounded-2xl px-4 py-3 ring-1 ring-slate-200">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-900"><Target size={24} aria-hidden="true" /></span>
        <div className="flex-1">
          <p className="text-lg font-bold text-slate-900">{t('week.prepare', { title: task.lesson.titleAr })}</p>
          <p className="text-sm text-slate-600">{t('week.prepareHint')}</p>
        </div>
        {path && <Link to={path} className="min-h-[44px] rounded-xl bg-nav-accent px-5 py-2.5 font-black text-white">{t('week.open')}</Link>}
      </div>
    );
  }
  const path = task.item.homeLesson?.status === 'available' ? getLessonPath(task.item.homeLesson.code) : null;
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3 ring-1 ring-slate-200">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-900"><RotateCcw size={24} aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-slate-900">{t('week.revise', { title: task.item.homeLesson?.titleAr ?? task.item.textAr })}</p>
        <p className="text-sm text-slate-600">{t(`report.grade.${task.item.grade}`)}</p>
      </div>
      {path ? <Link to={path} className="min-h-[44px] rounded-xl bg-nav-accent px-5 py-2.5 font-black text-white">{t('week.open')}</Link>
        : <span className="text-sm text-slate-600">{t('report.soon')}</span>}
    </div>
  );
}
