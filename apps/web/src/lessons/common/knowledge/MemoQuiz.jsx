import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Timer, X, CheckCircle2, XCircle, RotateCcw, Trophy, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import MathLabel from '../components/MathLabel';
import { useScrollLock } from '../classroom/useScrollLock';
import * as Q from './memoQuiz';
import { storage } from '../../../utils/storage';
import { playSfx } from '../utils/playEffect';
import { useEffectsPreference } from '../hooks/useEffectsPreference';

/**
 * MemoQuiz — le DÉFI CHRONOMÉTRÉ « اختبر ذاكرتك » de la fiche de mémoire (PROTOTYPE 2026-10-28 ; logique : `memoQuiz.js`).
 * Facultatif, lancé depuis l'en-tête de MemoCard. Au CENTRE de l'écran sur fond assombri (portail sur `body`, défilement verrouillé par
 * `classroom/useScrollLock`). Au plus 5 questions à 3 choix, `SECONDS` secondes chacune (barre qui se vide). Juste : « صحيح » puis la suivante
 * toute seule ; faux ou temps écoulé : la bonne réponse reste affichée jusqu'à « التالي ». Bilan : score, temps, étoiles, règles à revoir
 * (« راجع القاعدة 02 »), meilleur score mémorisé (localStorage, sous try/catch). Clavier : 1 2 3, Entrée, Échap.
 * Ce n'est PAS une preuve d'apprentissage : rien n'est envoyé au serveur.
 *
 * Contrat DOM : [data-memo-quiz][data-phase=intro|play|end], [data-memo-quiz-start], [data-memo-quiz-option=<i>][data-state],
 * [data-memo-quiz-timer], [data-memo-quiz-next], [data-memo-quiz-score], [data-memo-quiz-again], [data-memo-quiz-close].
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
// un nombre ou une liste de nombres dans une phrase arabe : isolé de gauche à droite (sinon « 2 / 5 » se lit « 5 / 2 »)
const iso = (x) => `\u2066${x}\u2069`;
const readBest = (key) => { try { return JSON.parse(storage.getItem(key) ?? 'null'); } catch { return null; } };
const writeBest = (key, v) => storage.setItem(key, JSON.stringify(v));

export default function MemoQuiz({ open, onClose, build, storageKey }) {
  const { t } = useTranslation('lesson');
  const k = (s, o) => t(`map.memo.quiz.${s}`, o);
  const [s, setS] = useState(null);
  const [phase, setPhase] = useState('intro');
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(null);
  const [record, setRecord] = useState(false);
  const t0 = useRef(0);
  const boxRef = useRef(null);
  useScrollLock(open);
  // le son : la MÊME préférence d'appareil que « الصوت » de la page (`smarter_effects_enabled`), relue à l'ouverture
  const { enabled: sound, toggle: toggleSound } = useEffectsPreference();
  const lastTick = useRef(0);

  useEffect(() => { if (open) { setPhase('intro'); setS(null); setBest(readBest(storageKey)); } }, [open, storageKey]);

  const begin = () => { setS(Q.start(build())); setPhase('play'); setRecord(false); t0.current = performance.now(); setElapsed(0); playSfx('start'); };
  const q = s && !s.done ? s.questions[s.qi] : null;
  const shown = s ? Q.revealed(s) : false;

  // le chronomètre de la question courante
  useEffect(() => {
    if (phase !== 'play' || !q || shown) return undefined;
    t0.current = performance.now();
    lastTick.current = 0;
    const id = setInterval(() => {
      const ms = performance.now() - t0.current;
      setElapsed(ms);
      const sec = Math.ceil(Q.SECONDS - ms / 1000);
      if (sec <= 3 && sec >= 1 && sec !== lastTick.current) { lastTick.current = sec; playSfx('tick'); }
      if (ms >= Q.SECONDS * 1000) { clearInterval(id); setS((cur) => Q.timeout(cur)); playSfx('wrong'); }
    }, 100);
    return () => clearInterval(id);
  }, [phase, s?.qi, shown]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback(() => setS((cur) => Q.next(cur)), []);
  // juste : la suivante vient seule ; faux : l'élève lit la bonne réponse et passe lui-même
  const lastOk = s?.results.length ? s.results[s.results.length - 1].ok : false;
  useEffect(() => {
    if (!shown || !lastOk) return undefined;
    const id = setTimeout(go, 900);
    return () => clearTimeout(id);
  }, [shown, lastOk, go]);

  // la fin : le bilan et le meilleur score
  useEffect(() => {
    if (!s?.done) return;
    const sum = Q.summary(s);
    const prev = readBest(storageKey);
    const better = !prev || sum.score > prev.score || (sum.score === prev.score && sum.seconds < prev.seconds);
    if (better) { writeBest(storageKey, { score: sum.score, total: sum.total, seconds: sum.seconds }); setBest({ score: sum.score, total: sum.total, seconds: sum.seconds }); }
    setRecord(better && !!prev);
    setPhase('end');
    playSfx(sum.stars === 3 ? 'win' : 'step');
  }, [s?.done]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (i) => {
    if (shown) return;
    playSfx(i === q.correct ? 'correct' : 'wrong');
    setS((cur) => Q.answer(cur, i, Math.round(performance.now() - t0.current)));
  };
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (phase === 'play' && q && !shown) {
        const n = '123'.indexOf(e.key) >= 0 ? '123'.indexOf(e.key) : '١٢٣'.indexOf(e.key);
        if (n >= 0 && n < q.options.length) { e.preventDefault(); pick(n); }
      } else if (e.key === 'Enter') {
        if (phase === 'intro') { e.preventDefault(); begin(); } else if (phase === 'play' && shown) { e.preventDefault(); go(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => { if (open) boxRef.current?.focus({ preventScroll: true }); }, [open, phase]);

  if (!open || typeof document === 'undefined') return null;
  const left = Math.max(0, Q.SECONDS - elapsed / 1000);
  const frac = shown ? 0 : left / Q.SECONDS;
  const sum = phase === 'end' && s ? Q.summary(s) : null;

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" data-memo-quiz data-phase={phase}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={boxRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="memo-quiz-title" dir="rtl"
        className="relative flex max-h-[94vh] w-[min(94vw,1040px)] min-h-[min(84vh,660px)] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl outline-none">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-l from-violet-700 via-indigo-700 to-indigo-900 px-6 py-4 text-white">
          <h3 id="memo-quiz-title" className="flex items-center gap-2 text-xl font-black text-white">
            <Timer className="h-6 w-6" aria-hidden="true" /> {k('title')}
          </h3>
          {s && phase === 'play' && (
            <ol className="flex flex-1 items-center justify-center gap-1.5" aria-label={k('qOf', { i: s.qi + 1, n: s.questions.length })}>
              {s.questions.map((qq, i) => {
                const r = s.results[i];
                const tone = r ? (r.ok ? 'bg-emerald-400' : 'bg-rose-400') : i === s.qi ? 'animate-pulse bg-white' : 'bg-white/25';
                return <li key={qq.id} className={`h-2.5 w-10 rounded-full ${tone}`} />;
              })}
            </ol>
          )}
          <button type="button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? k('soundOff') : k('soundOn')} data-memo-quiz-sound
            className={`rounded-full p-2 text-white/80 hover:bg-white/15 ${ring}`}>
            {sound ? <Volume2 className="h-6 w-6" aria-hidden="true" /> : <VolumeX className="h-6 w-6" aria-hidden="true" />}
          </button>
          <button type="button" onClick={onClose} aria-label={k('close')} data-memo-quiz-close className={`rounded-full p-2 text-white/80 hover:bg-white/15 ${ring}`}>
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 overflow-y-auto px-6 py-6 md:px-10">
          {phase === 'intro' && (
            <div className="space-y-6 text-center">
              <p className="text-7xl" aria-hidden="true">⏱️</p>
              <p className="text-2xl font-black text-slate-900">{k('intro', { count: build().length, s: Q.SECONDS })}</p>
              {best && <p className="text-base font-black text-violet-700">{k('best', { result: iso(`${best.score}\u00A0/\u00A0${best.total}`) })}</p>}
              <button type="button" onClick={begin} data-memo-quiz-start
                className={`inline-flex min-h-[64px] items-center gap-3 rounded-full bg-gradient-to-l from-violet-600 to-indigo-600 px-12 text-2xl font-black text-white shadow-[0_5px_0_0_#3730A3] active:translate-y-1 active:shadow-none ${ring}`}>
                {k('start')} <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <p className="text-sm font-bold text-slate-400">{k('keys')}</p>
            </div>
          )}

          {phase === 'play' && q && (
            <>
              <div className="flex items-center gap-4">
                <span className={`inline-flex h-14 min-w-[4.5rem] items-center justify-center rounded-2xl text-2xl font-black tabular-nums ${!shown && left <= 3 ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-800'}`}>
                  {shown ? '—' : k('left', { s: Math.ceil(left) })}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100" data-memo-quiz-timer aria-hidden="true">
                  <div className={`h-full rounded-full transition-[width] duration-100 ease-linear ${frac < 0.25 ? 'bg-rose-500' : 'bg-gradient-to-l from-violet-500 to-indigo-500'}`} style={{ width: `${frac * 100}%` }} />
                </div>
                <span className="text-sm font-black text-slate-500">{k('qOf', { i: s.qi + 1, n: s.questions.length })}</span>
              </div>
              <p className="flex min-h-[7rem] items-center justify-center text-center text-3xl font-black leading-relaxed text-slate-900 md:text-4xl"><MathLabel>{q.q}</MathLabel></p>
              <div className="grid gap-4 md:grid-cols-3">
                {q.options.map((o, i) => {
                  const st = !shown ? 'idle' : i === q.correct ? 'right' : i === s.picked ? 'wrong' : 'dim';
                  const cls = {
                    idle: 'border-slate-200 bg-white shadow-[0_4px_0_0_#E2E8F0] hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50',
                    right: 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-[0_4px_0_0_#10B981]',
                    wrong: 'border-rose-400 bg-rose-50 text-rose-900 shadow-[0_4px_0_0_#FB7185]',
                    dim: 'border-slate-100 bg-white opacity-40',
                  }[st];
                  return (
                    <button key={i} type="button" onClick={() => pick(i)} disabled={shown} data-memo-quiz-option={i} data-state={st}
                      className={`relative flex min-h-[9.5rem] items-center justify-center rounded-3xl border-2 px-4 pb-4 pt-9 text-2xl font-black transition-all duration-150 md:text-3xl ${cls} ${ring}`}>
                      <span className="absolute start-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-500">{i + 1}</span>
                      {st === 'right' && <CheckCircle2 className="absolute end-3 top-3 h-7 w-7 text-emerald-600" aria-hidden="true" />}
                      {st === 'wrong' && <XCircle className="absolute end-3 top-3 h-7 w-7 text-rose-600" aria-hidden="true" />}
                      <span className="min-w-0 text-center leading-snug"><MathLabel>{o}</MathLabel></span>
                    </button>
                  );
                })}
              </div>
              <div className="flex min-h-[56px] items-center justify-between gap-3" aria-live="polite">
                {shown && (lastOk
                  ? <p className="text-2xl font-black text-emerald-600">{k('right')} 🎉</p>
                  : <p className="text-lg font-black text-rose-700">{s.timedOut ? k('timeUp') : k('wrong')} {q.n != null && k('reviewOne', { n: iso(String(q.n).padStart(2, '0')) })}</p>)}
                {shown && !lastOk && (
                  <button type="button" onClick={go} data-memo-quiz-next autoFocus
                    className={`inline-flex min-h-[52px] items-center gap-2 rounded-full bg-slate-900 px-8 text-lg font-black text-white ${ring}`}>
                    {k('next')} <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          )}

          {phase === 'end' && sum && (
            <div className="space-y-5 text-center" data-memo-quiz-score={`${sum.score}/${sum.total}`}>
              <p className="text-6xl" aria-label={k('starsAria', { n: sum.stars })}>{'⭐'.repeat(sum.stars)}<span className="opacity-20">{'⭐'.repeat(3 - sum.stars)}</span></p>
              <p className="text-7xl font-black text-slate-900"><bdi dir="ltr" data-memo-quiz-result>{`${sum.score}\u00A0/\u00A0${sum.total}`}</bdi></p>
              <p className="text-lg font-bold text-slate-500">{k('seconds', { s: iso(sum.seconds) })}</p>
              {record && <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-lg font-black text-amber-900"><Trophy className="h-5 w-5" aria-hidden="true" /> {k('newBest')}</p>}
              {!record && best && <p className="text-base font-black text-violet-700">{k('best', { result: iso(`${best.score}\u00A0/\u00A0${best.total}`) })}</p>}
              <p className="mx-auto max-w-xl rounded-2xl bg-slate-50 px-4 py-3 text-lg font-bold text-slate-700">
                {sum.review.length === 0 ? k('allGood') : k('review', { list: iso(sum.review.map((n) => String(n).padStart(2, '0')).join(' · ')) })}
              </p>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={begin} data-memo-quiz-again
                  className={`inline-flex min-h-[56px] items-center gap-2 rounded-full bg-gradient-to-l from-violet-600 to-indigo-600 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#3730A3] ${ring}`}>
                  <RotateCcw className="h-5 w-5" aria-hidden="true" /> {k('again')}
                </button>
                <button type="button" onClick={onClose} className={`inline-flex min-h-[56px] items-center rounded-full border-2 border-slate-200 px-8 text-xl font-black text-slate-700 hover:bg-slate-50 ${ring}`}>
                  {k('done')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
