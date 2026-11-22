/**
 * AN INTEGRATION MISSION PLAYED FROM DATA (`docs/reports/INTEGRATION_LESSON_PLAN.md` §6, §8, §9) — THE engine of every
 * mission: the situation is a file of the lesson (its exam text, its scene, its steps, the guidance of
 * each wrong answer); this file names no lesson and no scene.
 *
 * The contract of every mission (INTEGRATION_LESSON_PLAN.md §8, §9): the paper first, the world checks. A mission card, the message
 * that the clock starts (5 s, nothing closes it), READ THE WHOLE TEXT, then the steps:
 *   { kind: 'data' }   he taps in the text every datum and every condition carried by words (`paper[].mark`); each
 *                      becomes a line of « Les données » (the robot does the first one)
 *   { kind: 'goal' }   he taps the question(s) (`paper[].goal`)
 *   { kind: 'tries' }  FREE TRIES: he types a number, the world carries it out (`try(n, ctx) → { ok, scene, lines,
 *                      fact, owe }`); a condition the world has just shown (`owe`, a datum marked `late`) is added to
 *                      « Les données » on his sheet; `ready(ctx)` opens the way on
 *   { kind: 'connect' } « relie »: he ties to a question (`goal`) the data it needs (`must`); one left out is answered
 *                      by what cannot be done without it (`without`); `ans(ctx)` adds the answer of the question before
 *   { kind: 'plan' }   the question hides steps: he orders them (`items`, `order`); a step taken too early is answered
 *                      by what it needs (`item.needs`)
 *   { kind: 'review' } A CLASSMATE'S COPY: its lines (`lines`), one of them wrong (`wrong`); he taps the faulty one —
 *                      a sound line he suspects is answered by why it holds (`line.holds`), the faulty one by its fact
 *                      (`why`) while the world carries out what that copy wrote (`scene`); then he corrects it (`fix`)
 *   { kind: 'work' }   one operation: what to write on the sheet (`sheet`), then its boxes (`shape`), then `check`:
 *                      `check(values, ctx) → { ok, fact, line, scene }`. The WORLD carries out `scene` whatever he
 *                      typed (a misreading is built, never « faux »); `fact` may be a function of what the world
 *                      built. A wrong answer ALWAYS gets a guidance (`fact`), never the next question.
 * then the model copy and the marker's list. `stage` groups steps under one number of « Étape n sur N ».
 * A mission left half-way is KEPT: `world.keep(snapshot)` at each step forward, `resume` given back next time.
 * Each right answer is celebrated, the end of the mission more; what must be tapped carries « Clique ici ».
 * Every sentence of these screens is in `text.js` (words only).
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Clock, Coins, PenLine, Play, Star, Trophy, X } from 'lucide-react';
import { M } from '../kit/parts';
import Ink from './Ink';
import { Box, Connect, Sheet } from './parts';
import { T } from './text';
import './mission.css';

const WARN = 5;
const READ = 10;
const num = (v) => (/^\d+$/.test(String(v ?? '').trim()) ? Number(v) : null);
const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const val = (x, ctx) => (typeof x === 'function' ? x(ctx) : x);

/** The exam paper: its text whole; what he taps in it — its data and conditions, then its question. */
function Paper({ sit, mode, data, goals, next, late, onMark, onGoal }) {
  return (
    <aside className="ms-paper" data-ms-paper>
      <h3>{sit.session}</h3>
      <p>
        {sit.paper.map((p, i) => {
          let el;
          if (p.mark && mode === 'data' && !data.includes(p.mark) && !late.includes(p.mark))
            el = (
              <button
                key={i}
                type="button"
                className={`ms-num is-ask ${p.mark === next ? 'ms-target' : ''}`}
                data-ms-tap={p.mark}
                onClick={() => onMark(p.mark)}
              >
                {p.t}
              </button>
            );
          else if (p.goal && mode === 'goal' && !goals.includes(p.goal))
            el = (
              <button
                key={i}
                type="button"
                className="ms-num is-goal ms-target"
                data-ms-goal={p.goal}
                onClick={() => onGoal(p.goal)}
              >
                {p.t}
              </button>
            );
          else if (p.mark || p.goal) {
            const on = p.mark ? data.includes(p.mark) : goals.includes(p.goal);
            el = (
              <mark key={i} className={`ms-phrase ${on ? (p.mark ? 'is-on' : 'is-goal') : ''}`}>
                {p.t}
              </mark>
            );
          } else el = <span key={i}>{p.t}</span>;
          return p.br ? [el, <br key={`b${i}`} />] : el;
        })}
      </p>
    </aside>
  );
}

/** « Ma copie »: the typed twin of his sheet. The section he is working on is open; the others fold to their title. */
function Copy({ sit, data, goals, plan, lines, open, onOpen }) {
  const head = (id, title, n) => (
    <h4>
      <button
        type="button"
        className="ms-fold ms-fold--title"
        data-ms-open={id}
        aria-expanded={open === id}
        onClick={() => onOpen(id)}
      >
        {title}
        {n > 0 && open !== id ? ` (${n})` : ''}
      </button>
    </h4>
  );
  return (
    <aside className="ms-book" data-ms-book={lines.length}>
      <h3>
        <PenLine size={18} aria-hidden="true" /> {T.copy}
      </h3>
      {head('data', T.data, data.length)}
      {open === 'data' && (
        <ul data-ms-data={data.join(',')}>
          {sit.data
            .filter((d) => data.includes(d.id))
            .map((d) => (
              <li key={d.id}>{d.text}</li>
            ))}
        </ul>
      )}
      {head('goal', T.goal, goals.length + plan.length)}
      {open === 'goal' && (
        <ul data-ms-goals={goals.join(',')} data-ms-plan={plan.join(',')}>
          {sit.goals
            .filter((g) => goals.includes(g.id))
            .map((g) => (
              <li key={g.id}>
                {g.label} {g.text}
              </li>
            ))}
          {plan.map((id, i) => (
            <li key={id} className="is-key">
              {i + 1}. {sit.plan.find((x) => x.id === id).text}
            </li>
          ))}
        </ul>
      )}
      {head('work', T.work, lines.length)}
      {open === 'work' && (
        <ol>
          {lines.map((l) => (
            <li key={l.id} className={`is-${l.tone ?? 'key'}${l.tex ? '' : ' is-prose'}`} data-ms-line={l.id}>
              {l.tex ? <M>{l.tex}</M> : l.text}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

export default function MissionRunner({ situation: sit, world, onClose, resume = null }) {
  const steps = sit.steps;
  const STAGES = Math.max(...steps.map((s) => s.stage)) + 1; // the last one is the model copy
  const [phase, setPhase] = useState('card'); // 'card' | 'play' | 'model' | 'marker'
  const [warn, setWarn] = useState(null);
  const [left, setLeft] = useState(sit.minutes * 60);
  const [read, setRead] = useState(false);
  const [reading, setReading] = useState(READ);
  const [i, setI] = useState(0);
  const [data, setData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [plan, setPlan] = useState([]);
  const [vals, setVals] = useState({});
  const [fails, setFails] = useState({});
  const [lines, setLines] = useState([]);
  const [written, setWritten] = useState({});
  const [v, setV] = useState({});
  const [fact, setFact] = useState(null);
  const [busy, setBusy] = useState(false);
  const [coins, setCoins] = useState(0);
  const [slips, setSlips] = useState(0);
  const [win, setWin] = useState(null);
  const [finale, setFinale] = useState(false);
  const [ticks, setTicks] = useState([]);
  const [pen, setPen] = useState(false);
  const [idle, setIdle] = useState(false);
  const [open, setOpen] = useState('data');
  const [found, setFound] = useState(null);
  const [picked, setPicked] = useState([]); // « relie »: the data tied to the question
  const [owed, setOwed] = useState(null); // a condition the world has just shown: to add to « Les données »
  const acts = useRef(0);
  const act = () => {
    acts.current += 1;
    setIdle(false);
  };
  const step = phase === 'play' ? steps[i] : null;
  const late = sit.data.filter((d) => d.late).map((d) => d.id);
  const first = sit.data.filter((d) => !d.late);
  const ctx = { vals, fails: fails[step?.id] ?? 0, data, plan };
  const playing = phase === 'play' && read;

  useEffect(() => {
    if (!win) return undefined;
    const t = setTimeout(() => setWin(null), 1500);
    return () => clearTimeout(t);
  }, [win]);
  useEffect(() => {
    if (warn == null) return undefined;
    if (warn <= 0) {
      setWarn(null);
      setPhase('play');
      return undefined;
    }
    const t = setTimeout(() => setWarn((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [warn]);
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'play' || read || reading <= 0) return undefined;
    const t = setTimeout(() => setReading((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, read, reading]);
  useEffect(() => {
    if (!playing) return undefined;
    const seen = acts.current;
    const t = setTimeout(() => acts.current === seen && setIdle(true), 8000);
    return () => clearTimeout(t);
  }, [playing, i, data.length, goals.length, plan.length, written, fact]);
  // the robot does the FIRST gesture itself: it underlines the first datum and writes it in « Les données »
  useEffect(() => {
    if (!playing || step?.kind !== 'data' || data.length) return undefined;
    const t = setTimeout(() => mark(first[0].id, true), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step?.kind]);
  // what the world shows of the data he has named (a quay that counts a stock only once he said what its number counts)
  useEffect(() => {
    const shown = sit.quay?.(data);
    if (shown) world.stock?.(...shown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);
  // « Ma copie » opens on the section he is working on
  useEffect(() => {
    if (step)
      setOpen(
        step.kind === 'data' || step.kind === 'connect'
          ? 'data'
          : ['work', 'review', 'tries'].includes(step.kind)
            ? 'work'
            : 'goal',
      );
  }, [step]);

  const stars = slips <= 2 ? 3 : slips <= 5 ? 2 : 1;
  // A MISSION LEFT HALF-WAY IS KEPT (his world save, private): at each step forward what his copy holds is handed to the
  // world; the card offers « Reprends où tu en étais » next time. The clock goes on from where it was.
  const snapshot = { i, data, goals, plan, vals, lines, written, coins, slips, left, found, owed };
  const keep = useRef(snapshot);
  keep.current = snapshot;
  useEffect(() => {
    if (phase === 'play' && read && (i > 0 || data.length > 0)) world.keep?.(keep.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, read, i, data.length, goals.length, plan.length, lines.length]);
  const takeBack = () => {
    const s = resume;
    setI(Math.min(s.i ?? 0, steps.length - 1));
    setData(s.data ?? []);
    setGoals(s.goals ?? []);
    setPlan(s.plan ?? []);
    setVals(s.vals ?? {});
    setLines(s.lines ?? []);
    setWritten(s.written ?? {});
    setCoins(s.coins ?? 0);
    setSlips(s.slips ?? 0);
    setLeft(s.left ?? sit.minutes * 60);
    setFound(s.found ?? null);
    setOwed(s.owed ?? null);
    setRead(true);
    setPhase('play');
  };
  const bravo = (pay) => {
    setCoins((c) => c + pay);
    setWin({ id: Date.now(), pay, word: T.bravo[Math.floor(Math.random() * T.bravo.length)] });
    world.cheer?.(false);
  };
  const advance = (pay = 10) => {
    act();
    setV({});
    setPicked([]);
    if (i + 1 >= steps.length) {
      setCoins((c) => c + pay);
      world.done?.({ stars, coins: coins + pay });
      setPhase('model');
      setFinale(true);
      world.cheer?.(true);
    } else {
      setI(i + 1);
      bravo(pay);
    }
  };
  const slipped = (id, text) => {
    act();
    setSlips((x) => x + 1);
    setFails((f) => ({ ...f, [id]: (f[id] ?? 0) + 1 }));
    setFact(text);
  };
  const wrote = (id) => {
    act();
    setWritten((w) => ({ ...w, [id]: true }));
  };

  const mark = (id, demo = false) => {
    act();
    setData((d) => (d.includes(id) ? d : [...d, id]));
    const d = sit.data.find((x) => x.id === id);
    setFact(demo ? T.demo(d.text) : d.say);
  };
  const goal = (id) => {
    act();
    setGoals((g) => [...g, id]);
    setFact(null);
  };
  const pick = (id) => {
    const want = step.order[plan.length];
    if (id !== want) return slipped(step.id, sit.plan.find((x) => x.id === id).needs);
    act();
    setFact(null);
    setPlan((p) => [...p, id]);
    return undefined;
  };
  // A CLASSMATE'S COPY (`review`): he taps the line that is wrong. A sound line he suspects is answered by why it holds;
  // the faulty one by its fact, and the world carries out what THAT copy wrote.
  const suspect = async (id) => {
    if (found || busy) return;
    const line = step.lines.find((l) => l.id === id);
    if (id !== step.wrong) return slipped(step.id, line.holds);
    act();
    setFound(id);
    if (step.scene) {
      setBusy(true);
      await world.run(step.scene);
      setBusy(false);
    }
    setFact(step.why);
    return undefined;
  };
  // FREE TRIES: the world carries out his number whatever it is (a free try is never a slip); the lines of a try that
  // left something are replaced by the next one, those of a try that worked stay
  const attempt = async () => {
    const n = num(v.n);
    const r = step.try(n, ctx);
    act();
    setFact(null);
    setBusy(true);
    await world.run(r.scene, r.sceneOpts);
    setBusy(false);
    const id = r.ok ? `ok-${n}` : 'try';
    setLines((ls) => [
      ...ls.filter((l) => !l.id.startsWith('try-') && !l.id.startsWith(`${id}-`)),
      ...r.lines.map((l, k) => ({ id: `${id}-${k}`, ...l })),
    ]);
    const was = vals[step.id] ?? { worked: [], fails: [] };
    setVals((s) => ({
      ...s,
      [step.id]: r.ok
        ? { ...was, worked: [...was.worked.filter((x) => x !== n), n].slice(-2), miss: null }
        : { ...was, fails: [...was.fails.filter((x) => x !== n), n], miss: n },
    }));
    if (r.owe && !data.includes(r.owe)) setOwed(r.owe);
    setFact(r.fact);
  };
  const tie = () => {
    const miss = step.must.find((id) => !picked.includes(id));
    if (miss) return slipped(step.id, step.without[miss]);
    setFact(null);
    return advance(step.pay ?? 10);
  };
  const submit = async (choice = null) => {
    const r = step.check(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, num(x)])), ctx, choice);
    act();
    setFact(null);
    let built = null;
    if (r.scene) {
      setBusy(true);
      built = await world.run(r.scene, r.sceneOpts);
      setBusy(false);
    }
    const said = typeof r.fact === 'function' ? r.fact(built) : r.fact;
    if (!r.ok) return slipped(step.id, said);
    setVals((s) => ({ ...s, [step.id]: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, num(x)])) }));
    const fresh = r.lines ?? (r.line ? [r.line] : []);
    if (fresh.length)
      setLines((ls) => [
        ...ls.filter((l) => l.id !== step.id && !l.id.startsWith(`${step.id}-`)),
        ...fresh.map((l, k) => ({ id: fresh.length > 1 ? `${step.id}-${k}` : step.id, ...l })),
      ]);
    setFact(said ?? null);
    return advance(step.pay ?? 10);
  };

  const stage = phase === 'play' ? step.stage : STAGES;
  const nextMark = first.find((d) => !data.includes(d.id))?.id;
  const ASK = !read
    ? T.readFirst
    : phase === 'model'
      ? T.compare
      : phase === 'marker'
        ? T.marker
        : step.kind === 'data'
          ? data.length < first.length
            ? T.dataAsk(!late.length, data.length, first.length)
            : T.dataDone
          : step.kind === 'goal'
            ? T.goalAsk
            : step.kind === 'plan'
              ? plan.length < step.order.length
                ? T.planAsk(plan.length > 0)
                : T.planDone
              : step.kind === 'connect'
                ? step.ask
                : step.kind === 'review'
                  ? found
                    ? T.reviewFound
                    : step.ask
                  : val(step.ask, ctx);

  if (phase === 'card')
    return (
      <div className="ms-root ms-root--card" data-ms-step={0} data-ms-warn={warn ?? 'off'}>
        {warn == null ? (
          <div className="ms-card" data-ms-card>
            <h2>{sit.title}</h2>
            <p className="ms-card__session">{sit.session}</p>
            <p>{sit.intro}</p>
            <p className="ms-card__need">
              <PenLine size={24} aria-hidden="true" /> {T.need}
              <Clock size={24} aria-hidden="true" /> {T.minutes(sit.minutes)}
            </p>
            {resume && (
              <button type="button" className="ms-btn ms-btn--go ms-target" data-ms-resume onClick={takeBack}>
                {T.resume(steps[Math.min(resume.i ?? 0, steps.length - 1)].stage, STAGES)}
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className={`ms-btn ${resume ? 'ms-btn--ghost' : 'ms-btn--go ms-target'}`}
              data-ms-start
              onClick={() => setWarn(WARN)}
            >
              {resume ? T.again : T.start}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
            <button type="button" className="ms-btn ms-btn--ghost" data-ms-close onClick={onClose}>
              {T.notNow}
            </button>
          </div>
        ) : (
          <div className="ms-card ms-card--warn" data-ms-clock-warn={warn} role="status">
            <Clock size={54} aria-hidden="true" />
            <h2>{T.clockStarts}</h2>
            <p>{T.clockSay(sit.minutes)}</p>
            <b className="ms-card__count">{warn}</b>
          </div>
        )}
      </div>
    );

  const long = sit.paper.reduce((s, x) => s + x.t.length, 0) > 420;
  const shape = step?.kind === 'work' ? val(step.shape, ctx) : null;
  const full = shape ? shape.every((p) => !p.box || num(v[p.box]) != null) : false;
  return (
    <div
      className={`ms-root ${long ? 'ms-root--long' : ''} ${idle ? 'is-idle' : ''} ${!read ? 'is-reading' : ''}`}
      data-ms-step={stage}
      data-ms-at={step?.id ?? phase}
      data-ms-busy={busy}
      data-ms-read={read}
    >
      <header className="ms-head">
        <b className="ms-count" data-ms-progress={`${stage}/${STAGES}`}>
          {T.stage(stage, STAGES)}
        </b>
        <h2 data-ms-ask>{ASK}</h2>
        <span className={`ms-clock ${left === 0 ? 'is-over' : ''}`} dir="ltr" data-ms-clock={left}>
          <Clock size={20} aria-hidden="true" />
          {clock(left)}
        </span>
        <button
          type="button"
          className={`ms-tool ${pen ? 'is-on' : ''}`}
          data-ms-pen-open
          aria-pressed={pen}
          onClick={() => setPen((x) => !x)}
        >
          <PenLine size={20} aria-hidden="true" />
          {T.pen}
        </button>
        <span className="ms-coins" data-ms-coins={coins}>
          <Coins size={20} aria-hidden="true" />
          {coins}
        </span>
        <button type="button" className="ms-x" aria-label={T.quit} data-ms-close onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="ms-body">
        <Paper
          sit={sit}
          mode={playing ? step.kind : null}
          data={data}
          goals={goals}
          next={nextMark}
          late={late}
          onMark={(id) => mark(id)}
          onGoal={goal}
        />
        <div className="ms-stage">
          {playing && step.kind === 'plan' && plan.length < step.order.length && (
            <div className="ms-connect" data-ms-plan-pick>
              <p className="ms-connect__goal">{sit.goals[0].text}</p>
              <div className="ms-connect__items ms-connect__items--plan">
                {sit.plan
                  .filter((x) => !plan.includes(x.id))
                  .map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      className="ms-chip ms-target"
                      data-ms-need={x.id}
                      onClick={() => pick(x.id)}
                    >
                      {x.text}
                    </button>
                  ))}
              </div>
            </div>
          )}
          {playing && step.kind === 'connect' && (
            <Connect
              goal={sit.goals.find((g) => g.id === step.goal)}
              items={[
                ...sit.data.filter((d) => data.includes(d.id)).map((d) => ({ id: d.id, text: d.text })),
                ...(step.ans ? [{ id: 'ans', text: step.ans(ctx) }] : []),
              ]}
              picked={picked}
              onPick={(id) => {
                act();
                setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
              }}
            />
          )}
          {playing && step.kind === 'review' && (
            <div className="ms-model ms-review" data-ms-review={found ?? 'open'}>
              <h3>{step.title}</h3>
              <ol>
                {step.lines.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      className={`ms-review__line ${found && l.id === step.wrong ? 'is-wrong' : ''} ${!found ? 'ms-target' : ''}`}
                      disabled={Boolean(found) || busy}
                      data-ms-suspect={l.id}
                      onClick={() => suspect(l.id)}
                    >
                      {l.tex ? <M>{l.tex}</M> : l.t}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {phase === 'model' && (
            <div className="ms-model" data-ms-copy>
              <h3>{T.model(sit.session)}</h3>
              {sit.model.map((l, k) =>
                l.tex ? (
                  <p key={k} dir="ltr">
                    <M>{l.tex}</M>
                  </p>
                ) : (
                  <p key={k}>{l.t}</p>
                ),
              )}
            </div>
          )}
          {fact && phase === 'play' && (
            <p className="ms-fact" data-ms-fact>
              {fact}
            </p>
          )}
          <div className="ms-act" data-ms-act>
            {!read && (
              <>
                {reading > 0 && <span className="ms-hint">{T.reading}</span>}
                {reading <= 0 && (
                  <button
                    type="button"
                    className="ms-btn ms-btn--go ms-target"
                    data-ms-read-done
                    onClick={() => {
                      act();
                      setRead(true);
                    }}
                  >
                    <Check size={18} aria-hidden="true" />
                    {T.readDone}
                  </button>
                )}
              </>
            )}
            {playing && step.kind === 'data' && data.length < first.length && (
              <span className="ms-hint">{T.dataHint}</span>
            )}
            {playing && step.kind === 'data' && data.length >= first.length && (
              <Sheet id="data" written={false} onWritten={() => advance()} text={T.dataSheet} />
            )}
            {playing && step.kind === 'goal' && goals.length < sit.goals.length && (
              <span className="ms-hint">{T.goalHint}</span>
            )}
            {playing && step.kind === 'goal' && goals.length === sit.goals.length && (
              <Sheet id="goal" written={false} onWritten={() => advance()} text={T.goalSheet} />
            )}
            {playing && step.kind === 'plan' && plan.length < step.order.length && (
              <span className="ms-hint">{T.planHint(plan.length > 0)}</span>
            )}
            {playing && step.kind === 'plan' && plan.length === step.order.length && (
              <Sheet id="plan" written={false} onWritten={() => advance()} text={T.planSheet} />
            )}
            {playing && step.kind === 'tries' && owed && (
              <Sheet
                key={owed}
                id={`owed-${owed}`}
                written={false}
                onWritten={() => {
                  act();
                  setData((d) => [...d, owed]);
                  setOwed(null);
                }}
                text={T.owed(sit.data.find((d) => d.id === owed).text)}
              />
            )}
            {playing && step.kind === 'tries' && !owed && (
              <>
                <span>{step.label}</span>
                <Box
                  value={v.n}
                  onChange={(x) => setV((s) => ({ ...s, n: x }))}
                  label={step.label}
                  name="n"
                  onEnter={() => num(v.n) && !busy && attempt()}
                />
                <button
                  type="button"
                  className="ms-btn"
                  data-ms-try
                  disabled={!num(v.n) || num(v.n) > step.max || busy}
                  onClick={attempt}
                >
                  <Play size={18} aria-hidden="true" />
                  {step.world}
                </button>
                {step.ready(ctx) && (
                  <button
                    type="button"
                    className="ms-btn ms-btn--go ms-target"
                    data-ms-more
                    disabled={busy}
                    onClick={() => advance()}
                  >
                    {step.go}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                )}
              </>
            )}
            {playing && step.kind === 'connect' && (
              <Sheet id={step.id} written={written[step.id]} onWritten={() => wrote(step.id)} text={step.sheet}>
                <span className="ms-hint">{T.connectHint}</span>
                <button type="button" className="ms-btn" data-ms-tie disabled={!picked.length} onClick={tie}>
                  {T.tied}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </Sheet>
            )}
            {playing && step.kind === 'review' && !found && <span className="ms-hint">{T.reviewHint}</span>}
            {playing && step.kind === 'review' && found && (
              <Sheet
                id="review"
                written={false}
                onWritten={() => {
                  setLines((ls) => [...ls.filter((l) => l.id !== step.id), { id: step.id, ...step.line }]);
                  setFound(null);
                  advance(step.pay ?? 10);
                }}
                text={step.fix}
              />
            )}
            {playing && step.kind === 'work' && (
              <Sheet
                key={step.id}
                id={step.id}
                written={written[step.id]}
                onWritten={() => wrote(step.id)}
                text={val(step.sheet, ctx)}
              >
                <span className="ms-shape">
                  {shape.map((p, k) =>
                    p.box ? (
                      <Box
                        key={k}
                        value={v[p.box]}
                        onChange={(x) => setV((s) => ({ ...s, [p.box]: x }))}
                        label={p.label ?? p.box}
                        name={p.box}
                        w={p.w ?? 3}
                        onEnter={() => full && !busy && !step.choices && submit()}
                      />
                    ) : p.tex ? (
                      <M key={k}>{p.tex}</M>
                    ) : (
                      <span key={k}>{p.t}</span>
                    ),
                  )}
                </span>
                {step.choices ? (
                  step.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="ms-btn ms-btn--ghost"
                      data-ms-name={c.id}
                      disabled={!full || busy}
                      onClick={() => submit(c.id)}
                    >
                      {c.text}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    className="ms-btn"
                    data-ms-check
                    disabled={!full || busy}
                    onClick={() => submit()}
                  >
                    {step.world ? <Play size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
                    {step.world ?? T.write}
                  </button>
                )}
              </Sheet>
            )}
            {phase === 'model' && !finale && (
              <button
                type="button"
                className="ms-btn ms-btn--go ms-target"
                data-ms-corrected
                onClick={() => setPhase('marker')}
              >
                <Check size={18} aria-hidden="true" />
                {T.corrected}
              </button>
            )}
            {phase === 'marker' && (
              <div className="ms-marker" data-ms-marker={ticks.length}>
                <b>{T.markerTitle}</b>
                {sit.marker.map((m, k) => (
                  <label key={k}>
                    <input
                      type="checkbox"
                      data-ms-tick={k}
                      checked={ticks.includes(k)}
                      onChange={() => setTicks((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))}
                    />
                    {m}
                  </label>
                ))}
                <button type="button" className="ms-btn ms-btn--go" data-ms-done onClick={onClose}>
                  {T.done}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
        <Copy sit={sit} data={data} goals={goals} plan={plan} lines={lines} open={open} onOpen={setOpen} />
      </div>

      {win && !finale && (
        <div key={win.id} className="ms-win" data-ms-win={win.pay} aria-live="polite">
          <b>{win.word}</b>
          <span dir="ltr">
            +{win.pay}
            <Coins size={26} aria-hidden="true" />
          </span>
        </div>
      )}
      {finale && (
        <div className="ms-finale" data-ms-finale role="status">
          <div className="ms-confetti" aria-hidden="true">
            {Array.from({ length: 36 }, (_, k) => (
              <i
                key={k}
                style={{
                  '--x': `${(k * 37) % 100}%`,
                  '--d': `${(k % 9) * 0.12}s`,
                  '--c': ['#fbbf24', '#34d399', '#a5f3fc', '#f472b6'][k % 4],
                }}
              />
            ))}
          </div>
          <div className="ms-finale__card">
            <Trophy size={76} aria-hidden="true" />
            <h2>{T.finale}</h2>
            <p className="ms-finale__stars" data-ms-stars={stars}>
              {[0, 1, 2].map((k) => (
                <Star key={k} size={46} className={k < stars ? 'is-on' : ''} aria-hidden="true" />
              ))}
            </p>
            <p>{T.finaleSay(sit.session)}</p>
            <p className="ms-finale__coins">
              <Coins size={30} aria-hidden="true" /> {T.coins(coins)}
              <Clock size={30} aria-hidden="true" /> {T.timeLeft(clock(left))}
            </p>
            <button
              type="button"
              className="ms-btn ms-btn--go ms-target"
              data-ms-finale-next
              onClick={() => setFinale(false)}
            >
              {T.toModel}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <Ink open={pen} onClose={() => setPen(false)} />
    </div>
  );
}
