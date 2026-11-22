/**
 * « مختبري » — THE LAB OF A LESSON (2026-11-16). One lab for every lesson of the cycle.
 *
 * The student TOUCHES the mathematics of the lesson: each instrument is a drawing whose handle is a mathematical variable
 * (a wall that sets the divisor, a flag that sets the number, a padlock of digits …). The bench shows the instruments of
 * THIS lesson; « خزانتي » holds the instruments of every lesson BEFORE it, of every grade — never one of a later lesson
 * (`registry.js › toolsFor`). The two numbers « أعدادي » are SHARED: the student takes his numbers from one instrument to
 * the next and sees the same fact in another form. Every instrument has « جرّب »: things to MAKE, ticked when made.
 *
 * Nothing scrolls: the page is designed at 1280 × 720 and zoomed to the window. Used by the game world of a lesson
 * (`inline`: it is already inside a full-screen root) and by any lesson page (`?lab=1`, portal to the body).
 */
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isShortScreen } from '../gameworld/engine/phoneScreen';
import { createPortal } from 'react-dom';
import { X, Dices, Minus, Plus, Check, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';
import { scopedStorage } from '../../../utils/storage';
import { LabSound } from './sound';
import { toolsFor, toolById, clampFor } from './registry';
import { QUESTS, observe, luckyPair } from './logic';
import './lessonLab.css';

const KEY = 'smarter_lesson_lab';
const VIEWS = new Map();
const viewOf = (tool) => {
  if (!VIEWS.has(tool.id)) VIEWS.set(tool.id, lazy(tool.load));
  return VIEWS.get(tool.id);
};
const load = () => {
  try {
    return JSON.parse(scopedStorage.getItem(KEY) ?? 'null') ?? {};
  } catch {
    return {};
  }
};
const L = {
  title: 'مختبري',
  mine: 'أدوات هذا الدرس',
  picked: 'من خزانتي',
  cabinet: 'خزانتي',
  cabinetSub: (n) => `أدوات الدروس السابقة (${n})`,
  cabinetTitle: 'خزانتي: أدوات كلّ ما درستُه',
  cabinetHint: 'اختر أداة: توضع على طاولتك بأعدادك نفسها.',
  fromLesson: 'من درس:',
  numbers: 'أعدادي',
  dice: 'أعداد أخرى',
  quests: 'جرّب',
  close: 'إغلاق',
  sound: 'الصوت',
  noMine: 'لهذا الدرس أدوات الدروس السابقة: افتح خزانتك.',
  loading: 'تُجهَّز الأداة…',
  stars: 'مهمّات المختبر',
};

function NumberBox({ label, value, range, onChange, id }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText(String(value));
  }, [value]);
  const commit = (v) => {
    const n = Math.round(Number(v));
    if (Number.isFinite(n)) onChange(Math.max(range[0], Math.min(range[1], n)));
    else setText(String(value));
  };
  return (
    <label className="ll-num" data-ll-num={id}>
      <span>{label}</span>
      <span className="ll-num__box" dir="ltr">
        <button
          type="button"
          onClick={() => onChange(Math.max(range[0], value - 1))}
          aria-label="−1"
          data-ll-minus={id}
        >
          <Minus size={18} />
        </button>
        <input
          inputMode="numeric"
          value={text}
          onChange={(e) => {
            const t = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
            setText(t);
            if (t !== '') commit(t);
          }}
          onBlur={() => setText(String(value))}
          data-ll-input={id}
        />
        <button type="button" onClick={() => onChange(Math.min(range[1], value + 1))} aria-label="+1" data-ll-plus={id}>
          <Plus size={18} />
        </button>
      </span>
    </label>
  );
}

const ToolTile = ({ tool, on, done, onPick }) => (
  <button
    type="button"
    className={`ll-tile ${on ? 'is-on' : ''}`}
    onClick={() => onPick(tool.id)}
    data-ll-tool={tool.id}
    aria-pressed={on}
  >
    <i>{tool.icon}</i>
    <strong>{tool.name}</strong>
    <span className="ll-tile__dots" aria-hidden="true">
      {QUESTS[tool.id].map((q) => (
        <b key={q.id} className={done.includes(q.id) ? 'is-on' : ''} />
      ))}
    </span>
  </button>
);

/**
 * The cabinet: the instruments of the earlier lessons, grade by grade. Never scrolls: four lessons a page — three when
 * the grade needs the pager, which takes the room of a row (2026-11-19: with lesson 5, the 4AM shelf of lesson 6 had five
 * lessons and its fourth row ran under the pager at 1366 × 768).
 */
function Cabinet({ cabinet, onPick, onClose, play }) {
  const [g, setG] = useState(cabinet.length - 1);
  const [page, setPage] = useState(0);
  const grade = cabinet[g];
  const PER = grade.lessons.length > 4 ? 3 : 4;
  const pages = Math.max(1, Math.ceil(grade.lessons.length / PER));
  const shown = grade.lessons.slice(page * PER, page * PER + PER);
  return (
    <div className="ll-cabinet" role="dialog" aria-modal="true" data-ll-cabinet>
      <header>
        <div>
          <h3>🧰 {L.cabinetTitle}</h3>
          <p>{L.cabinetHint}</p>
        </div>
        <button type="button" className="ll-icon" onClick={onClose} aria-label={L.close} data-ll-cabinet-close>
          <X size={20} />
        </button>
      </header>
      <div className="ll-cabinet__tabs" role="tablist">
        {cabinet.map((x, i) => (
          <button
            key={x.grade}
            type="button"
            role="tab"
            aria-selected={i === g}
            className={i === g ? 'is-on' : ''}
            onClick={() => {
              setG(i);
              setPage(0);
              play('ui');
            }}
            data-ll-grade={x.grade}
          >
            {x.name}
          </button>
        ))}
      </div>
      <ul className="ll-cabinet__list">
        {shown.map((l) => (
          <li key={l.code} data-ll-cabinet-lesson={l.code}>
            <p>{l.title}</p>
            <div>
              {l.tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="ll-card"
                  onClick={() => onPick(t.id)}
                  data-ll-cabinet-tool={t.id}
                >
                  <i>{t.icon}</i>
                  <span>
                    <strong>{t.name}</strong>
                    <small>{t.hint}</small>
                  </span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <footer>
          <button
            type="button"
            className="ll-icon"
            disabled={page === 0}
            onClick={() => {
              setPage(page - 1);
              play('ui');
            }}
          >
            <ChevronRight size={20} />
          </button>
          <span dir="ltr">
            {page + 1}
            {'\u00a0/\u00a0'}
            {pages}
          </span>
          <button
            type="button"
            className="ll-icon"
            disabled={page >= pages - 1}
            onClick={() => {
              setPage(page + 1);
              play('ui');
            }}
          >
            <ChevronLeft size={20} />
          </button>
        </footer>
      )}
    </div>
  );
}

/**
 * `earlierOnly`: the lab is opened BEFORE the lesson (« عُدّة الانطلاق »): only the instruments of the lessons before it.
 * The lesson's own instruments (« أدوات هذا الدرس ») are not listed and not reachable — they would name what the student
 * has not discovered yet — and an `initialTool` that is one of them is ignored.
 */
export default function LessonLab({
  lessonCode,
  lessonTitle,
  onClose,
  inline = false,
  initialTool = null,
  earlierOnly = false,
}) {
  const lab = useMemo(() => toolsFor(lessonCode, { earlierOnly }), [lessonCode, earlierOnly]);
  const saved = useRef(load()).current;
  const [nums, setNums] = useState({ a: saved.a ?? 42, b: saved.b ?? 5 });
  // `initialTool`: another page (« عُدّة الانطلاق ») opens the lab ON one instrument the lesson has reached — put on the bench like a pick from the cabinet
  const first = initialTool && lab.all.some((t) => t.id === initialTool) ? initialTool : null;
  const [picked, setPicked] = useState(() => {
    const p = (saved.picked ?? []).filter((id) => lab.all.some((t) => t.id === id && t.lesson !== lessonCode));
    return first && toolById(first).lesson !== lessonCode ? [...p.filter((id) => id !== first), first].slice(-5) : p;
  });
  const [toolId, setToolId] = useState(() => first ?? (lab.mine[0] ?? lab.all[0])?.id ?? null);
  const [done, setDone] = useState(saved.done ?? {});
  const [fresh, setFresh] = useState([]);
  const [extra, setExtra] = useState({});
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [sound, setSound] = useState(saved.sound ?? true);
  const [z, setZ] = useState(1);
  const [narrow, setNarrow] = useState(false);
  const touched = useRef(false);
  const seen = useRef({});
  const own = useRef(null);
  const tool = toolById(toolId);

  // two designs, so the text never gets small: 1280 × 720 for a wide screen (laptop), 1000 × 740 for a 4:3 one (tablet)
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
  useEffect(() => {
    try {
      scopedStorage.setItem(KEY, JSON.stringify({ a: nums.a, b: nums.b, picked, done, sound }));
    } catch {
      /* the lab works without storage */
    }
  }, [nums, picked, done, sound]);
  useEffect(
    () => () => {
      own.current?.dispose();
    },
    [],
  );
  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') {
        if (cabinetOpen) {
          setCabinetOpen(false);
          playRef.current?.('shut');
        } else onClose?.();
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [cabinetOpen, onClose]);

  // the lab has its OWN sounds (sound.js), the same in every lesson — off with the lab's switch
  const play = useCallback(
    (name, p, q) => {
      if (!sound) return;
      own.current ??= new LabSound();
      own.current.play(name, p, q);
    },
    [sound],
  );
  const playRef = useRef(play);
  playRef.current = play;
  useEffect(() => {
    playRef.current('enter');
  }, []);

  const n = tool ? clampFor(tool, nums.a, nums.b) : nums;
  const touch = () => {
    touched.current = true;
  };
  const setA = useCallback(
    (v) => {
      touched.current = true;
      setNums((p) => ({ ...p, a: clampFor(toolById(toolId), v, p.b).a }));
    },
    [toolId],
  );
  const setB = useCallback(
    (v) => {
      touched.current = true;
      setNums((p) => ({ ...p, b: clampFor(toolById(toolId), p.a, v).b }));
    },
    [toolId],
  );
  // what an instrument tells about itself (cuts made, divisors found …), stamped with the numbers it was made WITH: a
  // report about other numbers is never read (the numbers change before the instrument can report again)
  const report = useCallback((x) => {
    touched.current = true;
    setExtra(x);
  }, []);

  // « جرّب »: what the student has MADE with this instrument (never ticked before he touches it)
  useEffect(() => {
    if (!tool || !touched.current) return;
    seen.current[tool.id] ??= new Set(done[tool.id] ?? []);
    const ex = extra.key === `${n.a}:${n.b}` ? extra : {};
    const add = observe(tool.id, { a: n.a, b: n.b, ...ex }, seen.current[tool.id]);
    if (!add.length) return;
    setDone((d) => ({ ...d, [tool.id]: [...new Set([...(d[tool.id] ?? []), ...add])] }));
    setFresh(add);
    setTimeout(() => playRef.current('quest'), 420); // after the instrument's own sound
    const t = setTimeout(() => setFresh([]), 1800);
    return () => clearTimeout(t); // eslint-disable-line consistent-return
  }, [tool, n.a, n.b, extra]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (id) => {
    const t = toolById(id);
    if (!t) return;
    if (t.lesson !== lessonCode) setPicked((p) => [...p.filter((x) => x !== id), id].slice(-5));
    touched.current = false;
    setExtra({});
    setToolId(id);
    setCabinetOpen(false);
    play('open');
  };
  const dice = () => {
    const p = luckyPair(tool);
    touch();
    setNums((old) => ({ a: p.a, b: tool.needs === 'ab' ? p.b : old.b }));
    play('dice');
  };

  if (!tool) return null;
  const View = viewOf(tool);
  const mineDone = done[tool.id] ?? [];
  const total = lab.all.reduce((t, x) => t + QUESTS[x.id].length, 0);
  const got = lab.all.reduce(
    (t, x) => t + (done[x.id] ?? []).filter((id) => QUESTS[x.id].some((q) => q.id === id)).length,
    0,
  );
  const cabinetCount = lab.cabinet.reduce((t, g) => t + g.lessons.reduce((k, l) => k + l.tools.length, 0), 0);
  const pickedTools = picked.map(toolById).filter(Boolean);

  const page = (
    <div
      className={`ll-root ${inline ? 'll-root--inline' : ''} ${narrow ? 'll-root--narrow' : ''}`}
      dir="rtl"
      data-lesson-lab={lessonCode}
      data-ll-tool-on={tool.id}
    >
      <div className="ll-fit" style={{ zoom: z }}>
        <header className="ll-head">
          <div className="ll-brand">
            <i>🧪</i>
            <div>
              <h2>{L.title}</h2>
              <p>{lessonTitle}</p>
            </div>
          </div>
          <div className="ll-nums" data-ll-nums>
            <em>{L.numbers}</em>
            <NumberBox
              id="a"
              label={tool.labels.a}
              value={n.a}
              range={tool.range.a}
              onChange={(v) => {
                play('tick', v);
                setA(v);
              }}
            />
            {tool.needs === 'ab' && (
              <NumberBox
                id="b"
                label={tool.labels.b}
                value={n.b}
                range={tool.range.b}
                onChange={(v) => {
                  play('tick', v);
                  setB(v);
                }}
              />
            )}
            <button type="button" className="ll-dice" onClick={dice} title={L.dice} aria-label={L.dice} data-ll-dice>
              <Dices size={22} />
            </button>
          </div>
          <div className="ll-head__end">
            <span className="ll-stars" title={L.stars} data-ll-stars={got}>
              ⭐{' '}
              <b dir="ltr">
                {got}
                {'\u00a0/\u00a0'}
                {total}
              </b>
            </span>
            <button
              type="button"
              className="ll-icon"
              onClick={() => {
                if (!sound) {
                  own.current ??= new LabSound();
                  own.current.play('on');
                }
                setSound(!sound);
              }}
              aria-label={L.sound}
              aria-pressed={sound}
              data-ll-sound
            >
              {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button type="button" className="ll-icon" onClick={onClose} aria-label={L.close} data-ll-close>
              <X size={20} />
            </button>
          </div>
        </header>

        <aside className="ll-rail">
          {!earlierOnly && (
            <div className="ll-rail__mine" data-ll-mine>
              <h3>{L.mine}</h3>
              {lab.mine.length ? (
                lab.mine.map((t) => (
                  <ToolTile key={t.id} tool={t} on={t.id === tool.id} done={done[t.id] ?? []} onPick={pick} />
                ))
              ) : (
                <p className="ll-rail__none">{L.noMine}</p>
              )}
            </div>
          )}
          {pickedTools.length > 0 && <h3>{L.picked}</h3>}
          {pickedTools.map((t) => (
            <ToolTile key={t.id} tool={t} on={t.id === tool.id} done={done[t.id] ?? []} onPick={pick} />
          ))}
          {cabinetCount > 0 && (
            <button
              type="button"
              className="ll-cabinet-btn"
              onClick={() => {
                setCabinetOpen(true);
                play('drawer');
              }}
              data-ll-cabinet-open
            >
              <i>🧰</i>
              <span>
                <strong>{L.cabinet}</strong>
                <small>{L.cabinetSub(cabinetCount)}</small>
              </span>
            </button>
          )}
        </aside>

        <main className="ll-bench">
          <div className="ll-toolhead">
            <i>{tool.icon}</i>
            <h3>{tool.name}</h3>
            <p>{tool.hint}</p>
            {tool.lesson !== lessonCode && (
              <em data-ll-from>
                {L.fromLesson} {tool.lessonTitle}
              </em>
            )}
          </div>
          <div className="ll-stage" data-ll-stage={tool.id}>
            <Suspense fallback={<p className="ll-loading">{L.loading}</p>}>
              <View
                key={tool.id}
                a={n.a}
                b={n.b}
                setA={setA}
                setB={setB}
                play={play}
                report={report}
                range={tool.range}
              />
            </Suspense>
          </div>
        </main>

        <section className="ll-quests" data-ll-quests>
          <h4>{L.quests}</h4>
          <ul>
            {QUESTS[tool.id].map((q) => {
              const ok = mineDone.includes(q.id);
              return (
                <li
                  key={q.id}
                  className={`${ok ? 'is-done' : ''} ${fresh.includes(q.id) ? 'is-fresh' : ''}`}
                  data-ll-quest={q.id}
                  data-ll-quest-done={ok ? '1' : '0'}
                >
                  <b>{ok ? <Check size={16} strokeWidth={3.5} /> : null}</b>
                  {q.text}
                </li>
              );
            })}
          </ul>
        </section>

        {cabinetOpen && (
          <Cabinet
            cabinet={lab.cabinet}
            onPick={pick}
            play={play}
            onClose={() => {
              setCabinetOpen(false);
              play('shut');
            }}
          />
        )}
      </div>
    </div>
  );
  return inline ? page : createPortal(page, document.body);
}
