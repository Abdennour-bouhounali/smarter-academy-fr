/**
 * « حصّة القسم » — the TOOLS of the board, shared by every screen the class looks at (CLASS_SESSION.md §5ter):
 *   ClassWindow  the classroom in a window opened on demand: a tap on a desk names a student;
 *   Speaker      the name of the student who answers or reads, across the top;
 *   Whiteboard   ink over anything on the board (or on a blank page): three pens, undo, clear;
 *   Curtain      the board goes dark so that the class looks at the teacher;
 *   BoardTimer   a calm countdown for a task (1, 2 or 5 minutes);
 *   the red pointer (`ClassroomPointer`), so that the back of a big room sees the mouse;
 *   « مختبري »   the lesson's own lab opened over the board.
 * They sit in ONE dock (`BoardTools`), the same on every board screen. An adult's tools: each does one thing, none has to be learnt.
 */
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  Minimize2,
  Eraser,
  EyeOff,
  FlaskConical,
  MousePointer2,
  PenLine,
  Timer,
  Undo2,
  UserX,
  Users,
  X,
  StickyNote,
} from 'lucide-react';
import ClassroomPointer from '../../lessons/common/classroom/ClassroomPointer';
import '../../lessons/common/classroom/classroom.css';
import { playSfx } from '../../lessons/common/utils/playEffect';
import { callName } from './session';

const LessonLab = lazy(() => import('../../lessons/common/lessonlab/LessonLab'));

export const BL = {
  dock: 'أدوات الأستاذ',
  lab: 'مختبري',
  pickOne: 'اختر تلميذًا من القسم',
  absentHint: 'اضغط طاولة كلّ غائب.',
  absent: 'غياب',
  close: 'إغلاق',
  board: 'السبّورة',
  klass: 'القسم',
  pointer: 'المؤشّر',
  ink: 'قلم',
  curtain: 'ستار',
  timer: 'مؤقّت',
  curtainText: 'انظروا إليّ',
  curtainHint: 'اضغط في أيّ مكان لترفع الستار',
  undo: 'تراجع',
  clear: 'امسح',
  page: 'صفحة بيضاء',
  closeInk: 'أغلق القلم',
  turn: 'دور',
  reads: 'يقرأ',
  teacher: 'الأستاذ',
  timeUp: 'انتهى الوقت',
};

/** The classroom in a window: whose turn it is, who has spoken, who is away. A tap on a desk gives him the turn. */
export function ClassWindow({
  students,
  seating,
  current = null,
  spoken = [],
  absent = [],
  onTap,
  marking = false,
  setMarking = null,
  onClose,
  title = null,
}) {
  const byId = Object.fromEntries(students.map((s) => [s.id, s]));
  const seats = seating.seats.filter((s) => byId[s.student]);
  const rows = Math.max(1, ...seats.map((s) => s.r + 1));
  return (
    <div className="cs-veil" role="dialog" aria-modal="true" data-cs-class-window>
      <div className="cs-classwin">
        <header>
          <h3>{marking ? BL.absentHint : (title ?? BL.pickOne)}</h3>
          <span>
            {setMarking && (
              <button
                type="button"
                className={`cs-btn ${marking ? 'is-on' : ''}`}
                onClick={() => setMarking(!marking)}
                aria-pressed={marking}
                data-cs-absent-toggle
              >
                <UserX size={18} /> {BL.absent}
              </button>
            )}
            <button type="button" className="cs-icon" onClick={onClose} aria-label={BL.close} data-cs-class-close>
              <X size={22} />
            </button>
          </span>
        </header>
        <div className="cs-board">{BL.board}</div>
        <div
          className={`cs-mini ${marking ? 'is-marking' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${seating.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
          data-cs-minimap
        >
          {seats.map((s) => (
            <button
              key={s.student}
              type="button"
              className={`${s.student === current ? 'is-current' : ''} ${spoken.includes(s.student) ? 'is-spoken' : ''} ${absent.includes(s.student) ? 'is-absent' : ''}`}
              style={{ gridRow: s.r + 1, gridColumn: s.c + 1 }}
              onClick={() => onTap(s.student)}
              data-cs-seat={s.student}
            >
              {callName(byId[s.student])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The name across the top of the board. `label`: « دور » for an answer, « يقرأ » for a reading. */
export function Speaker({ name, team = null, label = BL.turn, wait = null, onClear = null, slim = false }) {
  return (
    <div
      className={`cs-turn ${slim ? 'cs-turn--slim' : ''} ${name ? '' : 'is-empty'}`}
      style={team ? { '--team': team.color } : undefined}
      data-cs-speaker={name ?? ''}
    >
      <small>{label}</small>
      {name ? <strong>{name}</strong> : <strong className="is-wait">{wait}</strong>}
      {team && <em>{team.name}</em>}
      {onClear && name && (
        <button
          type="button"
          className="cs-icon cs-turn__x"
          onClick={onClear}
          aria-label={BL.close}
          data-cs-speaker-clear
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}

const PENS = ['#dc2626', '#1d4ed8', '#0f172a'];
/** Ink over the board. While it is open the pen takes every touch; « أغلق القلم » gives the board back. */
function Whiteboard({ onClose }) {
  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState(PENS[0]);
  const [page, setPage] = useState(false);
  const live = useRef(null);
  const svg = useRef(null);
  const at = (e) => {
    const r = svg.current.getBoundingClientRect();
    return [Math.round(e.clientX - r.left), Math.round(e.clientY - r.top)];
  };
  const down = (e) => {
    e.preventDefault();
    svg.current.setPointerCapture?.(e.pointerId);
    live.current = true;
    setStrokes((s) => [...s, { color, pts: [at(e)] }]);
  };
  const move = (e) => {
    if (!live.current) return;
    const p = at(e);
    setStrokes((s) => {
      const last = s[s.length - 1];
      const q = last.pts[last.pts.length - 1];
      if (Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 3) return s;
      return [...s.slice(0, -1), { ...last, pts: [...last.pts, p] }];
    });
  };
  const up = () => {
    live.current = false;
  };
  return createPortal(
    <div className={`cs-inklayer ${page ? 'is-page' : ''}`} data-cs-ink={strokes.length}>
      <svg ref={svg} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {strokes.map((s, i) =>
          s.pts.length === 1 ? (
            <circle key={i} cx={s.pts[0][0]} cy={s.pts[0][1]} r="3.5" fill={s.color} />
          ) : (
            <polyline
              key={i}
              points={s.pts.map((p) => p.join(',')).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        )}
      </svg>
      <div className="cs-inkbar" dir="rtl">
        {PENS.map((c) => (
          <button
            key={c}
            type="button"
            className={`cs-pen ${color === c ? 'is-on' : ''}`}
            style={{ '--pen': c }}
            onClick={() => setColor(c)}
            aria-label={BL.ink}
            data-cs-pen={c}
          />
        ))}
        <button
          type="button"
          className="cs-btn"
          onClick={() => setStrokes((s) => s.slice(0, -1))}
          disabled={strokes.length === 0}
          data-cs-ink-undo
        >
          <Undo2 size={18} /> {BL.undo}
        </button>
        <button
          type="button"
          className="cs-btn"
          onClick={() => setStrokes([])}
          disabled={strokes.length === 0}
          data-cs-ink-clear
        >
          <Eraser size={18} /> {BL.clear}
        </button>
        <button
          type="button"
          className={`cs-btn ${page ? 'is-on' : ''}`}
          onClick={() => setPage(!page)}
          aria-pressed={page}
          data-cs-ink-page
        >
          <StickyNote size={18} /> {BL.page}
        </button>
        <button type="button" className="cs-btn cs-btn--main" onClick={onClose} data-cs-ink-close>
          <X size={18} /> {BL.closeInk}
        </button>
      </div>
    </div>,
    document.body,
  );
}

/** A calm countdown: a tap goes off → 1 → 2 → 5 minutes → off. A soft bell at the end, never an alarm. */
function BoardTimer() {
  const [left, setLeft] = useState(null);
  const [step, setStep] = useState(0);
  const PRESETS = [null, 60, 120, 300];
  useEffect(() => {
    if (left === null || left <= 0) return undefined;
    const t = setTimeout(
      () =>
        setLeft((n) => {
          if (n === 1) playSfx('bell', { enabled: true });
          return n - 1;
        }),
      1000,
    );
    return () => clearTimeout(t);
  }, [left]);
  const next = () => {
    const k = (step + 1) % PRESETS.length;
    setStep(k);
    setLeft(PRESETS[k]);
  };
  const text =
    left === null ? BL.timer : left <= 0 ? BL.timeUp : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <button
      type="button"
      className={`cs-tool cs-timer ${left !== null ? 'is-on' : ''} ${left === 0 ? 'is-up' : ''}`}
      onClick={next}
      data-cs-timer={left ?? ''}
    >
      <Timer size={20} />
      <span dir={left === null || left <= 0 ? 'rtl' : 'ltr'}>{text}</span>
    </button>
  );
}

/** The lesson the board is about: `{ code, title }`, given once by the page — it is what lets the dock open the lesson's lab. */
export const BoardLessonContext = createContext(null);

/**
 * « أدوات الأستاذ » — THE DOCK: every tool of the teacher in ONE place, the same place and the same order on every board
 * screen (the test, the rules, the lesson). Three groups, read from the right:
 *   who speaks   « القسم »;
 *   the board    « قلم », « المؤشّر », « ستار »;
 *   the hour     « مؤقّت », and « مختبري » — the instruments of this lesson and of the lessons before it, to explain with.
 * A tool is an icon over one word. `tools` comes from useBoardTools.
 */
/** `fullscreen` ({ on, toggle }): a screen shown inside the teacher's space offers the computer's REAL full screen, in the dock beside the other tools. */
export function BoardTools({ tools, onClass = null, classDisabled = false, fullscreen = null }) {
  return (
    <div className="cs-dock" role="toolbar" aria-label={BL.dock} data-cs-dock>
      {onClass && (
        <span className="cs-dock__group">
          <button type="button" className="cs-tool" onClick={onClass} disabled={classDisabled} data-cs-class-open>
            <Users size={20} />
            <span>{BL.klass}</span>
          </button>
        </span>
      )}
      <span className="cs-dock__group">
        <button
          type="button"
          className={`cs-tool ${tools.ink ? 'is-on' : ''}`}
          onClick={() => tools.setInk(!tools.ink)}
          aria-pressed={tools.ink}
          data-cs-ink-toggle
        >
          <PenLine size={20} />
          <span>{BL.ink}</span>
        </button>
        <button
          type="button"
          className={`cs-tool ${tools.pointer ? 'is-on' : ''}`}
          onClick={() => tools.setPointer(!tools.pointer)}
          aria-pressed={tools.pointer}
          data-cs-pointer-toggle
        >
          <MousePointer2 size={20} />
          <span>{BL.pointer}</span>
        </button>
        <button type="button" className="cs-tool" onClick={() => tools.setCurtain(true)} data-cs-curtain-toggle>
          <EyeOff size={20} />
          <span>{BL.curtain}</span>
        </button>
      </span>
      <span className="cs-dock__group">
        <BoardTimer />
        {tools.lesson && (
          <button
            type="button"
            className={`cs-tool ${tools.lab ? 'is-on' : ''}`}
            onClick={() => tools.setLab(true)}
            data-cs-lab-toggle
          >
            <FlaskConical size={20} />
            <span>{BL.lab}</span>
          </button>
        )}
        {fullscreen && (
          <button
            type="button"
            className={`cs-tool ${fullscreen.on ? 'is-on' : ''}`}
            onClick={fullscreen.toggle}
            aria-pressed={fullscreen.on}
            {...(fullscreen.on ? { 'data-card-full-exit': '' } : { 'data-card-full': '' })}
          >
            {fullscreen.on ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            <span>{fullscreen.on ? 'خروج' : 'ملء الشاشة'}</span>
          </button>
        )}
      </span>
    </div>
  );
}

export function useBoardTools() {
  const lesson = useContext(BoardLessonContext);
  const [pointer, setPointer] = useState(true);
  const [ink, setInk] = useState(false);
  const [curtain, setCurtain] = useState(false);
  const [lab, setLab] = useState(false);
  // `busy`: a tool holds the screen — the keys of the board (next, previous) are not for it
  return { pointer, setPointer, ink, setInk, curtain, setCurtain, lab, setLab, lesson, busy: ink || curtain || lab };
}

/** What the tools draw over the board: the ink, the curtain, the pointer. Mounted once per board screen. */
export function BoardLayers({ tools }) {
  return (
    <>
      {tools.ink && <Whiteboard onClose={() => tools.setInk(false)} />}
      {/* « مختبري » over the board: the lesson's own lab, the one the students open — nothing of it is recorded */}
      {tools.lab && tools.lesson && (
        <Suspense fallback={null}>
          <LessonLab
            lessonCode={tools.lesson.code}
            lessonTitle={tools.lesson.title}
            onClose={() => tools.setLab(false)}
          />
        </Suspense>
      )}
      {tools.curtain &&
        createPortal(
          <button type="button" className="cs-curtain" onClick={() => tools.setCurtain(false)} data-cs-curtain>
            <strong>{BL.curtainText}</strong>
            <small>{BL.curtainHint}</small>
          </button>,
          document.body,
        )}
      {tools.pointer && !tools.curtain && createPortal(<ClassroomPointer size="l" />, document.body)}
    </>
  );
}
