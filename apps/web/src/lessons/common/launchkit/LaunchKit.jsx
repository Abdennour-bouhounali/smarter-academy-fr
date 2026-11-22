/**
 * « عُدّة الانطلاق » — the launch of a lesson (phase 1, 2026-11-17; NOT validated; contract `docs/architecture/LAUNCH_KIT.md`).
 *
 * Before a lesson, the robot charges the TOOLS it needs: each tool is one earlier الكفاءة the lesson stands on (the learning
 * net). A short game — five minutes at most, often two — measures them: a station per tool, a quick workshop that repairs
 * the weakest one on the spot, then the kit laid out with ONE lesson to revise first, and the take-off.
 *   - the answer is a gesture (write / sort / place, `gestures.jsx`); nothing is timed; no life, no losing, no ranking;
 *   - ✓ or « سنعود إليه » after an answer, NEVER the right answer (it would spoil the next question of the same tool);
 *   - logic `engine.js` + `families.js` (pure, tested); the toolbox `store.js` (browser only in phase 1: not evidence).
 * One component for every lesson: it needs only the lesson's code. Nothing scrolls (designed 1280 × 720 / 1000 × 740, zoomed).
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isShortScreen } from '../gameworld/engine/phoneScreen';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Volume2,
  VolumeX,
  Rocket,
  Wrench,
  RotateCcw,
  BookOpen,
  FlaskConical,
  StickyNote,
  Check,
  HelpCircle,
  BatteryCharging,
} from 'lucide-react';
import { getLessonPath } from '@smarter-academy/core';
import { toolsForLesson } from '@smarter-academy/core/curriculum/fr/net/learningNet.js';
import MathText from '../components/MathText';
import { GRADE_NAMES } from '../lessonlab/order';
import { setReturnTo } from '../components/returnToLesson';
import { useIsPhoneScreen } from '../../../components/auth/RequireLargeScreen';
import { PHONE_LESSONS } from '../../../components/auth/phoneLessons';
import { FAMILIES, MISTAKES, familyFor, makeQuestion, pickForm, nextForm, complete, grade } from './families';
import {
  planTools,
  nextStep,
  kitOf,
  scoreOf,
  honesty,
  priorities,
  flowOf,
  mergeKit,
  gateOf,
  CAPSULE_STEPS,
  CAP,
  BANDS,
} from './engine';
import { loadKit, saveKit } from './store';
import { LaunchSound } from './sound';
import { Write, Sort, Place } from './gestures';
import './launchKit.css';

const LessonLab = lazy(() => import('../lessonlab/LessonLab'));

const L = {
  title: 'عُدّة الانطلاق',
  bag: 'عُدّتي',
  from: (g) => `من السنة ${GRADE_NAMES[g]}`,
  close: 'إغلاق',
  sound: 'الصوت',
  fuel: 'الوقت المتبقّي',
  introTitle: (t) => `قبل أن تنطلق إلى «${t}»: اشحن عُدّتك.`,
  introOne: 'أداة واحدة من دروسك السابقة.',
  introTwo: 'أداتان من دروسك السابقة.',
  introMany: (n) => `${n} أدوات من دروسك السابقة.`,
  introRule: 'كلّ إجابة صحيحة تشحن الأداة. لا خسارة هنا: إن لم تكن متأكّدًا، قل ذلك.',
  start: 'هيّا نشحن!',
  ready: 'عُدّتك مشحونة من قبل: لا شيء تعيده اليوم.',
  show: 'أرِني عُدّتي',
  unsure: 'غير متأكّد',
  done: 'تمّ',
  good: 'أحسنت!',
  goodUnsure: 'صحيح!',
  later: 'سنعود إليه',
  station: 'محطّة',
  workshop: 'ورشة سريعة',
  exampleLead: 'هذه الأداة تحتاج إصلاحًا سريعًا. اتبع المثال خطوة خطوة.',
  nextStep: 'الخطوة التالية',
  tryNow: 'فهمت: أجرّب بسؤالين',
  band: { solid: 'ثابتة', consolidate: 'تحتاج تثبيتًا', start: 'نبدأ منها', unseen: 'لم نفحصها بعد' },
  known: 'مشحونة من قبل',
  repaired: 'أُصلحت الآن',
  charging: 'تُشحن الآن…',
  full: 'عُدّتك كاملة!',
  partial: 'عُدّتك جاهزة — وأداة تنتظر عنايتك.',
  weak: 'عُدّتك تحتاج شحنًا قبل الانطلاق.',
  score: 'الشحن',
  star: 'نجمة الصدق: عرفتَ ما تعرفه وما لا تعرفه.',
  reviseFirst: 'راجع أوّلًا',
  also: 'وأيضًا',
  memo: 'بطاقة المراجعة',
  lab: 'جرّب الأداة في مختبري',
  recheck: 'أعد فحص الأداة',
  lesson: 'الدرس كاملًا',
  soon: 'الدرس قريبًا',
  // a phone opens only the lessons designed for it: the earlier lesson is named, and where to read it whole
  onComputer: 'الدرس كاملًا: على الحاسوب',
  go: 'انطلق إلى الدرس',
  capsule: 'كبسولة',
  gateTitle: 'قبل الانطلاق: كبسولة قصيرة.',
  gateLead: (name) => `«${name}» أداة أساسية لهذا الدرس، وما زالت فارغة. اشحنها بكبسولة من 3 دقائق، ثمّ تنطلق.`,
  capsuleStart: 'ابدأ الكبسولة · 3 دقائق',
  capStep: { card: 'البطاقة', example: 'المثال', lab: 'جرّب بيدك', questions: 'سؤالان' },
  capCardLead: 'اقرأ البطاقة: هذا ما تحتاجه من هذه الأداة في الدرس.',
  capLabLead: 'جرّب الأداة بأعدادك أنت في مختبرك، ثمّ عُد إلى هنا.',
  capLabOpen: 'افتح الأداة في مختبري',
  next: 'التالي',
  toQuestions: 'إلى السؤالين',
  capRepaired: 'أحسنت: شحنتَ الأداة بالكبسولة. الباب مفتوح!',
  capDone: 'بطاقة هذه الأداة تبقى في عُدّتك: عُد إليها متى احتجت.',
  capDoneTitle: 'أنهيتَ الكبسولة: الباب مفتوح.',
  capsuleMark: 'كبسولة منجزة',
  quitTitle: 'تخرج من الشحن؟',
  quitText: 'ما شحنتَه الآن لن يُحفظ: تبدأ من جديد في المرّة القادمة.',
  quitYes: 'نعم، أخرج',
  stay: 'أواصل',
  gotIt: 'فهمت',
};
const FAST = () => import.meta.env.DEV && typeof window !== 'undefined' && window.__launchFast;
const GESTURE = { write: Write, sort: Sort, place: Place };

/** The robot of the launch (drawn in code; no person is drawn). `mood`: idle | glad | think | fly. */
function Robot({ mood = 'idle' }) {
  return (
    <svg viewBox="0 0 160 190" className={`lk-robot is-${mood}`} aria-hidden="true">
      <ellipse cx="80" cy="182" rx="44" ry="6" fill="rgba(0,0,0,.35)" className="lk-robot__shadow" />
      <g className="lk-robot__body">
        <rect x="44" y="96" width="72" height="62" rx="18" fill="#c7d2fe" stroke="#1b1f4b" strokeWidth="4" />
        <rect x="30" y="92" width="26" height="54" rx="10" fill="#f59e0b" stroke="#1b1f4b" strokeWidth="4" />
        <rect x="62" y="112" width="36" height="24" rx="8" fill="#1b1f4b" />
        <rect
          x="68"
          y="118"
          width={mood === 'glad' || mood === 'fly' ? 24 : 12}
          height="12"
          rx="4"
          fill="#5eead4"
          className="lk-robot__gauge"
        />
        <rect x="56" y="156" width="16" height="20" rx="6" fill="#818cf8" stroke="#1b1f4b" strokeWidth="4" />
        <rect x="88" y="156" width="16" height="20" rx="6" fill="#818cf8" stroke="#1b1f4b" strokeWidth="4" />
        <line x1="80" y1="34" x2="80" y2="16" stroke="#1b1f4b" strokeWidth="4" />
        <circle cx="80" cy="12" r="7" fill="#fbbf24" stroke="#1b1f4b" strokeWidth="3" className="lk-robot__bulb" />
        <rect x="36" y="32" width="88" height="62" rx="22" fill="#eef2ff" stroke="#1b1f4b" strokeWidth="4" />
        <rect x="48" y="46" width="64" height="34" rx="14" fill="#1b1f4b" />
        {mood === 'glad' || mood === 'fly' ? (
          <path
            d="M 60 66 q 7 -10 14 0 M 86 66 q 7 -10 14 0"
            fill="none"
            stroke="#5eead4"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        ) : (
          <>
            <circle cx="67" cy="63" r={mood === 'think' ? 4 : 5.5} fill="#5eead4" />
            <circle cx="93" cy="63" r={mood === 'think' ? 4 : 5.5} fill="#5eead4" />
          </>
        )}
        {mood === 'fly' && (
          <path d="M 34 146 q 9 26 0 40 q -9 -14 0 -40 z" fill="#fb923c" className="lk-robot__flame" />
        )}
      </g>
    </svg>
  );
}

function ToolSlot({ t, active }) {
  const f = FAMILIES[t.item];
  const seg = t.known || t.measured ? t.segments : Math.min(t.lit ?? 0, t.slipped ? 1 : 2);
  const label = t.known ? L.known : t.measured ? (t.repaired ? L.repaired : L.band[t.band]) : active ? L.charging : '';
  return (
    <div
      className={`lk-tool is-${t.known || t.measured ? t.band : 'waiting'} ${active ? 'is-active' : ''}`}
      data-lk-tool={t.item}
      data-lk-band={t.known || t.measured ? t.band : 'waiting'}
      data-lk-segments={seg}
    >
      <i>{f.icon}</i>
      <div>
        <strong>{f.name}</strong>
        <small>{L.from(t.grade)}</small>
      </div>
      <span className="lk-cells" aria-hidden="true">
        <b className={seg >= 1 ? 'is-on' : ''} />
        <b className={seg >= 2 ? 'is-on' : ''} />
      </span>
      <em>{label}</em>
    </div>
  );
}

export default function LaunchKit({ lessonCode, lessonTitle, onDone, onClose, inline = false }) {
  const navigate = useNavigate();
  const phone = useIsPhoneScreen();
  const store0 = useRef(loadKit()).current;
  const tools = useMemo(
    () => planTools(toolsForLesson(lessonCode), (id) => Boolean(familyFor(id)), store0.items ?? {}),
    [lessonCode],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState('bag'); // bag → play → result → liftoff
  const [answers, setAnswers] = useState([]);
  const [cur, setCur] = useState(null); // { kind: 'question', q, phase } | { kind: 'example', item, level, ex, mistake, shown }
  const [value, setValue] = useState(null);
  const [unsure, setUnsure] = useState(false);
  const [signal, setSignal] = useState(null);
  const [sound, setSound] = useState(store0.sound ?? true);
  const [now, setNow] = useState(0);
  const [cap, setCap] = useState(null);
  const [capEnd, setCapEnd] = useState(null); // the capsule of the gate: { item, step, ex, mistake, shown }
  const [focus, setFocus] = useState(null);
  const [memo, setMemo] = useState(false);
  const [lab, setLab] = useState(false);
  const [quit, setQuit] = useState(false);
  const [count, setCount] = useState(null);
  const [z, setZ] = useState(1);
  const [narrow, setNarrow] = useState(false);
  const run = useRef({ started: 0, used: {}, exampleSeen: false, recheck: false, shownAt: 0 });
  const audio = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    const fit = () => {
      if (isShortScreen()) {
        setNarrow(false);
        setZ(1);
        return;
      }
      /* a phone sideways: the game's own scale is enough, a second zoom made the text unreadable */ const w =
        window.innerWidth;
      const h = window.innerHeight;
      const tight = w / h < 1.55;
      setNarrow(tight);
      setZ(Math.max(0.55, Math.min(1.9, tight ? Math.min(w / 1000, h / 740) : Math.min(w / 1280, h / 720))));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      audio.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const t = setInterval(() => setNow((Date.now() - run.current.started) / 1000), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (sound && phase === 'play') a.startBed();
    else a.stopBed();
  }, [sound, phase]);
  useEffect(() => {
    if (import.meta.env.DEV) window.__launch = { phase, cur, cap, tools, answers };
  });

  const play = useCallback(
    (name, p) => {
      if (!sound) return;
      (audio.current ??= new LaunchSound()).play(name, p);
    },
    [sound],
  );
  const playRef = useRef(play);
  playRef.current = play;
  useEffect(() => {
    playRef.current('open');
  }, []);

  const finish = (list) => {
    const kit = kitOf(tools, list);
    saveKit(mergeKit({ ...loadKit(), sound }, lessonCode, kit, Date.now(), { count: !run.current.recheck }));
    setCur(null);
    setPhase('result');
    play('kit', scoreOf(kit).lit);
    if (honesty(list).star) later(() => playRef.current('star'), 900);
  };

  const advance = (list) => {
    const step = nextStep({
      tools,
      answers: list,
      elapsed: (Date.now() - run.current.started) / 1000,
      exampleSeen: run.current.exampleSeen,
      skipWorkshop: run.current.recheck,
    });
    if (step.type === 'result') {
      finish(list);
      return;
    }
    const f = FAMILIES[step.item];
    const missed = [...list]
      .reverse()
      .find((a) => a.item === step.item && a.phase === 'station' && !(a.correct && !a.unsure));
    if (step.type === 'example') {
      setCur({
        kind: 'example',
        item: step.item,
        level: step.level,
        mistake: missed?.mistake ?? null,
        ex: f.example(Math.random, step.level, { k: missed?.k ?? undefined, mistake: missed?.mistake ?? null }),
        shown: 1,
      });
      return;
    }
    const used = (run.current.used[step.item] ??= []);
    const form = nextForm(step, list, used);
    used.push(`${step.level}:${form}`);
    setCur({
      kind: 'question',
      q: makeQuestion(Math.random, step.item, step.level, form, { first: step.first }),
      phase: step.phase,
    });
    setValue(null);
    setUnsure(false);
    run.current.shownAt = Date.now();
  };

  const begin = () => {
    run.current = { started: Date.now(), used: {}, exampleSeen: false, recheck: false, shownAt: 0 };
    if (sound) {
      audio.current ??= new LaunchSound();
      audio.current.setFlow(0);
    }
    play('go');
    setNow(0);
    setPhase('play');
    advance([]);
  };

  const commit = () => {
    if (cur?.kind !== 'question' || signal || !complete(cur.q, value)) return;
    const g = grade(cur.q, value);
    const before = kitOf(tools, answers).find((t) => t.item === cur.q.item);
    const list = [
      ...answers,
      {
        item: cur.q.item,
        level: cur.q.level,
        form: cur.q.form,
        k: cur.q.k ?? null,
        correct: g.correct,
        unsure,
        mistake: g.mistake,
        phase: cur.phase,
        ms: Date.now() - run.current.shownAt,
      },
    ];
    setAnswers(list);
    const flow = flowOf(list);
    audio.current?.setFlow(flow);
    setSignal(g.correct ? (unsure ? 'goodUnsure' : 'good') : 'later');
    play(g.correct ? 'good' : 'later', flow);
    const after = kitOf(tools, list).find((t) => t.item === cur.q.item);
    if (!before.measured && after.measured && after.band === BANDS.SOLID) later(() => playRef.current('charged'), 380);
    if (cur.phase === 'workshop' && after.repaired && !before.repaired) later(() => playRef.current('repaired'), 380);
    const here = cur;
    later(
      () => {
        setSignal(null);
        if (here.phase !== 'capsule') {
          advance(list);
          return;
        }
        if (list.filter((a) => a.item === here.q.item && a.phase === 'capsule').length >= 2) finishCapsule(list);
        else capsuleQuestion(here.q.item);
      },
      FAST() ? 60 : 1150,
    );
  };

  // ── the capsule of the gate: card → worked example → the instrument → two easy questions; then the door is open ──
  const startCapsule = (t) => {
    const missed = [...answers].reverse().find((a) => a.item === t.item && a.mistake);
    setCap({
      item: t.item,
      step: 0,
      mistake: missed?.mistake ?? null,
      ex: FAMILIES[t.item].example(Math.random, 1, { k: missed?.k ?? undefined, mistake: missed?.mistake ?? null }),
      shown: 1,
    });
    setFocus(null);
    setCapEnd(null);
    setPhase('capsule');
    play('go');
  };
  const capsuleQuestion = (item) => {
    const used = (run.current.used[item] ??= []);
    const form = pickForm(item, 1, used);
    used.push(`1:${form}`);
    setCur({ kind: 'question', q: makeQuestion(Math.random, item, 1, form, { first: true }), phase: 'capsule' });
    setValue(null);
    setUnsure(false);
    run.current.shownAt = Date.now();
  };
  const capsuleNext = () => {
    if (cap.step === 1 && cap.shown < cap.ex.steps.length) {
      setCap({ ...cap, shown: cap.shown + 1 });
      play('step');
      return;
    }
    // a family with no instrument (`labTool: null`) has no lab step: from the example straight to the questions
    if (cap.step < 2 && (cap.step < 1 || FAMILIES[cap.item].labTool)) {
      setCap({ ...cap, step: cap.step + 1 });
      play('step');
      return;
    }
    setCap({ ...cap, step: 3 });
    play('go');
    capsuleQuestion(cap.item);
  };
  const finishCapsule = (list) => {
    const kit = kitOf(tools, list);
    const t = kit.find((x) => x.item === cap.item);
    saveKit(mergeKit({ ...loadKit(), sound }, lessonCode, kit, Date.now(), { count: false }));
    setCur(null);
    setCap(null);
    setCapEnd(t.repaired ? 'repaired' : 'done');
    setPhase('result');
    play(t.repaired ? 'repaired' : 'kit', scoreOf(kit).lit);
  };

  const recheck = (item) => {
    const list = answers.filter((a) => a.item !== item || a.phase === 'capsule'); // a capsule done stays done: never a second one
    run.current = { started: Date.now(), used: {}, exampleSeen: true, recheck: true, shownAt: 0 };
    setAnswers(list);
    setFocus(null);
    setNow(0);
    setPhase('play');
    play('go');
    advance(list);
  };

  const liftoff = () => {
    setPhase('liftoff');
    const beat = FAST() ? 40 : 700;
    [3, 2, 1].forEach((n, i) =>
      later(() => {
        setCount(n);
        playRef.current('count', n);
      }, i * beat),
    );
    later(() => {
      setCount(0);
      playRef.current('liftoff');
    }, 3 * beat);
    later(() => onDone?.({ lessonCode, ...scoreOf(kitOf(tools, answers)) }), 3 * beat + (FAST() ? 80 : 1700));
  };

  const openLesson = (t) => {
    const path = t.lesson?.status === 'available' ? getLessonPath(t.lesson.code) : null;
    if (!path) return;
    setReturnTo(typeof window !== 'undefined' ? window.sessionStorage : null, {
      path: window.location.pathname,
      title: lessonTitle,
    });
    navigate(path);
  };

  const toggleSound = () => {
    const on = !sound;
    if (on) (audio.current ??= new LaunchSound()).play('on');
    setSound(on);
    saveKit({ ...loadKit(), sound: on });
  };
  const askClose = () => {
    if (phase === 'play' || phase === 'capsule') setQuit(true);
    else onClose?.();
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && (phase === 'play' || phase === 'capsule') && cur?.kind === 'question') {
        e.preventDefault();
        commit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // the handler reads the latest answer: re-bound at each render

  // the live state of the bag: a segment lights as soon as it is earned
  const kit = kitOf(tools, answers).map((t) => ({
    ...t,
    slipped: answers.some((a) => a.item === t.item && a.phase === 'station' && !(a.correct && !a.unsure)),
  }));
  const score = scoreOf(kit);
  const hon = honesty(answers);
  const pr = priorities(kit);
  const activeItem = cap ? cap.item : cur?.kind === 'question' ? cur.q.item : cur?.kind === 'example' ? cur.item : null;
  const gate = phase === 'result' ? gateOf(kit) : null;
  const labF = cap ? FAMILIES[cap.item] : null;
  const shown = kit.find((t) => t.item === (focus ?? pr.first?.item)) ?? null;
  const shownF = shown ? FAMILIES[shown.item] : null;
  const allKnown = tools.length > 0 && tools.every((t) => t.known);
  const mood =
    phase === 'liftoff'
      ? 'fly'
      : signal === 'good' || signal === 'goodUnsure' || (phase === 'result' && score.percent >= 75)
        ? 'glad'
        : cur?.kind === 'question'
          ? 'think'
          : 'idle';
  const G = cur?.kind === 'question' ? GESTURE[cur.q.gesture] : null;
  const asked =
    cur?.kind === 'question' ? answers.filter((a) => a.item === cur.q.item && a.phase === cur.phase).length : 0;

  const questionView = (bare) => (
    <div
      className="lk-question"
      key={`${cur.q.item}-${answers.length}`}
      data-lk-question={cur.q.gesture}
      data-lk-level={cur.q.level}
      data-lk-qphase={cur.phase}
    >
      {!bare && (
        <div className="lk-qhead">
          <span className={`lk-chipline ${cur.phase === 'workshop' ? 'is-shop' : ''}`}>
            {cur.phase === 'workshop' ? (
              <>
                <Wrench size={16} /> {L.workshop}
              </>
            ) : (
              L.station
            )}
            : {FAMILIES[cur.q.item].icon} {FAMILIES[cur.q.item].name}
          </span>
          <span className="lk-dots" aria-hidden="true">
            {Array.from({ length: asked + 1 }, (_, i) => (
              <i key={i} className={i === asked ? 'is-now' : ''} />
            ))}
          </span>
        </div>
      )}
      <p className="lk-prompt" data-lk-prompt>
        <MathText>{cur.q.prompt}</MathText>
      </p>
      <div className="lk-gesture">
        <G q={cur.q} value={value} onChange={setValue} locked={Boolean(signal)} play={play} />
      </div>
      <footer className="lk-qfoot">
        <button
          type="button"
          className={`lk-btn lk-btn--ghost ${unsure ? 'is-on' : ''}`}
          onClick={() => {
            setUnsure(!unsure);
            play('doubt', unsure ? 0 : 1);
          }}
          aria-pressed={unsure}
          disabled={Boolean(signal)}
          data-lk-unsure
        >
          <HelpCircle size={18} /> {L.unsure}
        </button>
        <button
          type="button"
          className="lk-btn lk-btn--main"
          onClick={commit}
          disabled={Boolean(signal) || !complete(cur.q, value)}
          data-lk-done
        >
          <Check size={18} strokeWidth={3} /> {L.done}
        </button>
      </footer>
      {signal && (
        <div
          className={`lk-signal is-${signal === 'later' ? 'later' : 'good'}`}
          role="status"
          data-lk-signal={signal === 'later' ? 'later' : 'good'}
        >
          {signal === 'later' ? `↻ ${L.later}` : `✓ ${signal === 'good' ? L.good : L.goodUnsure}`}
        </div>
      )}
    </div>
  );

  const page = (
    <div
      className={`lk-root ${inline ? 'lk-root--inline' : ''} ${narrow ? 'lk-root--narrow' : ''}`}
      dir="rtl"
      data-launch-kit={lessonCode}
      data-lk-phase={phase}
    >
      <div className="lk-fit" style={{ zoom: z }}>
        <header className="lk-head">
          <div className="lk-brand">
            <i>🎒</i>
            <div>
              <h2>{L.title}</h2>
              <p>{lessonTitle}</p>
            </div>
          </div>
          {phase === 'play' && (
            <div className="lk-fuel" title={L.fuel} data-lk-fuel>
              <span style={{ width: `${Math.max(0, 100 - (now / CAP.seconds) * 100)}%` }} />
            </div>
          )}
          <div className="lk-head__end">
            <button
              type="button"
              className="lk-icon"
              onClick={toggleSound}
              aria-label={L.sound}
              aria-pressed={sound}
              data-lk-sound
            >
              {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            {phase !== 'liftoff' && (
              <button type="button" className="lk-icon" onClick={askClose} aria-label={L.close} data-lk-close>
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        <aside className="lk-bag" data-lk-bag>
          <h3>🎒 {L.bag}</h3>
          {kit.map((t) => (
            <ToolSlot key={t.item} t={t} active={t.item === activeItem} />
          ))}
          <Robot mood={mood} />
        </aside>

        <main className="lk-stage" data-lk-stage={phase === 'play' ? (cur?.kind ?? 'wait') : phase}>
          {phase === 'bag' && (
            <div className="lk-intro" data-lk-intro>
              <h3>{L.introTitle(lessonTitle)}</h3>
              {allKnown ? (
                <p>{L.ready}</p>
              ) : (
                <>
                  <p>{tools.length === 1 ? L.introOne : tools.length === 2 ? L.introTwo : L.introMany(tools.length)}</p>
                  <p className="lk-intro__rule">{L.introRule}</p>
                </>
              )}
              <button type="button" className="lk-btn lk-btn--main lk-btn--xl" onClick={begin} autoFocus data-lk-start>
                {allKnown ? L.show : L.start}
              </button>
            </div>
          )}

          {phase === 'play' && cur?.kind === 'question' && questionView(false)}

          {phase === 'play' && cur?.kind === 'example' && (
            <div className="lk-example" data-lk-example={cur.item}>
              <div className="lk-qhead">
                <span className="lk-chipline is-shop">
                  <Wrench size={16} /> {L.workshop}: {FAMILIES[cur.item].icon} {FAMILIES[cur.item].name}
                </span>
              </div>
              <p className="lk-example__lead">{cur.mistake ? MISTAKES[cur.mistake] : L.exampleLead}</p>
              <h4>{cur.ex.title}</h4>
              <ol>
                {cur.ex.steps.slice(0, cur.shown).map((s, i) => (
                  <li key={i} data-lk-step={i + 1}>
                    <MathText>{s}</MathText>
                  </li>
                ))}
              </ol>
              <footer className="lk-qfoot lk-qfoot--end">
                {cur.shown < cur.ex.steps.length ? (
                  <button
                    type="button"
                    className="lk-btn lk-btn--main"
                    onClick={() => {
                      setCur({ ...cur, shown: cur.shown + 1 });
                      play('step');
                    }}
                    autoFocus
                    data-lk-step-next
                  >
                    {L.nextStep} ◂
                  </button>
                ) : (
                  <button
                    type="button"
                    className="lk-btn lk-btn--main"
                    onClick={() => {
                      run.current.exampleSeen = true;
                      play('go');
                      advance(answers);
                    }}
                    autoFocus
                    data-lk-try
                  >
                    {L.tryNow}
                  </button>
                )}
              </footer>
            </div>
          )}

          {phase === 'capsule' && cap && (
            <div className="lk-capsule" data-lk-capsule={cap.item} data-lk-capsule-step={CAPSULE_STEPS[cap.step]}>
              <div className="lk-qhead">
                <span className="lk-chipline is-cap">
                  <BatteryCharging size={17} /> {L.capsule}: {FAMILIES[cap.item].icon} {FAMILIES[cap.item].name}
                </span>
                <ol className="lk-capsteps">
                  {CAPSULE_STEPS.filter((st) => st !== 'lab' || FAMILIES[cap.item].labTool).map((st, n) => {
                    const i = CAPSULE_STEPS.indexOf(st);
                    return (
                      <li key={st} className={i === cap.step ? 'is-now' : i < cap.step ? 'is-done' : ''}>
                        <b>{i < cap.step ? '✓' : n + 1}</b>
                        {L.capStep[st]}
                      </li>
                    );
                  })}
                </ol>
              </div>
              {cap.step === 0 && (
                <div className="lk-capbody" data-lk-capsule-card>
                  <p className="lk-example__lead">{L.capCardLead}</p>
                  <ul className="lk-caplist">
                    {FAMILIES[cap.item].memo.map((m) => (
                      <li key={m}>
                        <MathText>{m}</MathText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cap.step === 1 && (
                <div className="lk-capbody lk-example">
                  <p className="lk-example__lead">{cap.mistake ? MISTAKES[cap.mistake] : L.exampleLead}</p>
                  <h4>{cap.ex.title}</h4>
                  <ol>
                    {cap.ex.steps.slice(0, cap.shown).map((x, i) => (
                      <li key={i} data-lk-step={i + 1}>
                        <MathText>{x}</MathText>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {cap.step === 2 && (
                <div className="lk-capbody lk-capbody--lab">
                  <i>{FAMILIES[cap.item].icon}</i>
                  <p>{L.capLabLead}</p>
                  <button
                    type="button"
                    className="lk-btn lk-btn--xl"
                    onClick={() => {
                      setLab(true);
                      play('ui');
                    }}
                    data-lk-capsule-lab
                  >
                    <FlaskConical size={22} /> {L.capLabOpen}
                  </button>
                </div>
              )}
              {cap.step === 3 && cur?.kind === 'question' && questionView(true)}
              {cap.step < 3 && (
                <footer className="lk-qfoot lk-qfoot--end">
                  <button
                    type="button"
                    className="lk-btn lk-btn--main"
                    onClick={capsuleNext}
                    autoFocus
                    data-lk-capsule-next
                  >
                    {cap.step === 1 && cap.shown < cap.ex.steps.length
                      ? `${L.nextStep} ◂`
                      : cap.step === 2 || (cap.step === 1 && !FAMILIES[cap.item].labTool)
                        ? `${L.toQuestions} ◂`
                        : `${L.next} ◂`}
                  </button>
                </footer>
              )}
            </div>
          )}

          {phase === 'result' && (
            <div className="lk-result" data-lk-result data-lk-percent={score.percent ?? ''}>
              <div className="lk-result__top">
                <div>
                  <h3>
                    {gate
                      ? L.gateTitle
                      : capEnd === 'done'
                        ? L.capDoneTitle
                        : score.percent === 100
                          ? L.full
                          : score.percent !== null && score.percent < 50
                            ? L.weak
                            : L.partial}
                  </h3>
                  {hon.star && (
                    <p className="lk-star" data-lk-star>
                      ⭐ {L.star}
                    </p>
                  )}
                </div>
                <div className="lk-score" data-lk-score={`${score.lit}/${score.total}`}>
                  <small>{L.score}</small>
                  <b dir="ltr">
                    {score.lit}
                    {'\u00a0/\u00a0'}
                    {score.total}
                  </b>
                  <span className="lk-cells lk-cells--big" aria-hidden="true">
                    {Array.from({ length: score.total }, (_, i) => (
                      <b key={i} className={i < score.lit ? 'is-on' : ''} />
                    ))}
                  </span>
                </div>
              </div>
              <div className="lk-kit">
                {kit.map((t) => {
                  const weak = t.band === BANDS.START || t.band === BANDS.CONSOLIDATE;
                  return (
                    <button
                      key={t.item}
                      type="button"
                      className={`lk-kcard is-${t.band} ${shown?.item === t.item ? 'is-shown' : ''}`}
                      onClick={() => {
                        if (weak) {
                          setFocus(t.item);
                          play('ui');
                        }
                      }}
                      disabled={!weak}
                      data-lk-kcard={t.item}
                      data-lk-band={t.band}
                    >
                      <i>{FAMILIES[t.item].icon}</i>
                      <strong>{FAMILIES[t.item].name}</strong>
                      <small>{L.from(t.grade)}</small>
                      <em>
                        {t.known ? L.known : L.band[t.band]}
                        {t.repaired ? ` · ${L.repaired}` : t.capsule ? ` · ${L.capsuleMark}` : ''}
                      </em>
                    </button>
                  );
                })}
              </div>
              {shown && (
                <div className="lk-revise" data-lk-revise={shown.item}>
                  <p>
                    <b>{shown.item === pr.first?.item ? L.reviseFirst : L.also}:</b> {shown.lesson?.title ?? shown.text}{' '}
                    <span>({L.from(shown.grade).replace('من ', '')})</span>
                  </p>
                  <div>
                    <button
                      type="button"
                      className="lk-btn"
                      onClick={() => {
                        setMemo(true);
                        play('ui');
                      }}
                      data-lk-memo-open
                    >
                      <StickyNote size={17} /> {L.memo}
                    </button>
                    {shownF?.labTool && (
                      <button
                        type="button"
                        className="lk-btn"
                        onClick={() => {
                          setLab(true);
                          play('ui');
                        }}
                        data-lk-lab-open
                      >
                        <FlaskConical size={17} /> {L.lab}
                      </button>
                    )}
                    <button type="button" className="lk-btn" onClick={() => recheck(shown.item)} data-lk-recheck>
                      <RotateCcw size={17} /> {L.recheck}
                    </button>
                    {phone && shown.lesson && !PHONE_LESSONS.includes(shown.lesson.code) ? (
                      <span className="lk-soon" data-lk-lesson-computer>
                        {L.onComputer}
                      </span>
                    ) : shown.lesson?.status === 'available' && getLessonPath(shown.lesson.code) ? (
                      <button type="button" className="lk-btn" onClick={() => openLesson(shown)} data-lk-lesson>
                        <BookOpen size={17} /> {L.lesson}
                      </button>
                    ) : (
                      <span className="lk-soon">{L.soon}</span>
                    )}
                  </div>
                </div>
              )}
              {capEnd && (
                <p className="lk-capend" data-lk-capsule-end={capEnd}>
                  {capEnd === 'repaired' ? L.capRepaired : L.capDone}
                </p>
              )}
              {gate ? (
                <div className="lk-gate" data-lk-gate={gate.item}>
                  <p>{L.gateLead(FAMILIES[gate.item].name)}</p>
                  <button
                    type="button"
                    className="lk-btn lk-btn--main lk-btn--xl"
                    onClick={() => startCapsule(gate)}
                    data-lk-capsule-start
                  >
                    <BatteryCharging size={22} /> {L.capsuleStart}
                  </button>
                </div>
              ) : (
                <button type="button" className="lk-btn lk-btn--main lk-btn--xl" onClick={liftoff} data-lk-go>
                  <Rocket size={22} /> {L.go}
                </button>
              )}
            </div>
          )}

          {phase === 'liftoff' && (
            <div className={`lk-liftoff ${count === 0 ? 'is-go' : ''}`} data-lk-liftoff={count ?? ''}>
              <b key={count} dir="ltr">
                {count === 0 ? '🚀' : count}
              </b>
            </div>
          )}
        </main>

        {memo && shownF && (
          <div className="lk-veil" data-lk-memo>
            <div className="lk-memo">
              <h3>
                <StickyNote size={20} /> {shownF.icon} {shownF.name}
              </h3>
              <ul>
                {shownF.memo.map((m) => (
                  <li key={m}>
                    <MathText>{m}</MathText>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="lk-btn lk-btn--main"
                onClick={() => setMemo(false)}
                autoFocus
                data-lk-memo-close
              >
                {L.gotIt}
              </button>
            </div>
          </div>
        )}
        {quit && (
          <div className="lk-veil" role="alertdialog" aria-modal="true" data-lk-quit-box>
            <div className="lk-memo">
              <h3>{L.quitTitle}</h3>
              <p>{L.quitText}</p>
              <span>
                <button
                  type="button"
                  className="lk-btn lk-btn--main"
                  onClick={() => setQuit(false)}
                  autoFocus
                  data-lk-quit-no
                >
                  {L.stay}
                </button>{' '}
                <button type="button" className="lk-btn" onClick={() => onClose?.()} data-lk-quit-yes>
                  {L.quitYes}
                </button>
              </span>
            </div>
          </div>
        )}
      </div>
      {lab && (labF ?? shownF)?.labTool && (
        <Suspense fallback={null}>
          <LessonLab
            lessonCode={lessonCode}
            lessonTitle={lessonTitle}
            initialTool={(labF ?? shownF).labTool}
            earlierOnly
            onClose={() => setLab(false)}
          />
        </Suspense>
      )}
    </div>
  );
  return inline ? page : createPortal(page, document.body);
}
