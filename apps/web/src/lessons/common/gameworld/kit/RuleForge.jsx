/**
 * « Forge ta règle » — the SCREEN of a rule forge (frame: forge.js; contract GAME_WORLD.md §2sexies). It names no lesson and
 * no world: the lesson gives the `forge` (its tiles, what a rule says of a case, the evidence, the attacks, the wording)
 * and the world gives the `parts` — how one of ITS cases is drawn:
 *   Mirror({ c, stage, fast, tight })   the case in the mirror; `stage`: ask | build | done; `tight`: the mirror shares
 *                                the screen with the tiles (the robot's experiment while he builds) — draw it in less height
 *   Line({ c })                  the case as one line of the evidence
 *   beats(c)                     how many strokes the mirror needs to build it (the sound and the wait follow)
 * The student does not receive the rule on a tablet: he predicts, writes HIS rule with tiles, and the MIRROR tests it —
 * first on his own evidence, then on a new case chosen to break it. A rule that survives becomes his key. The verdict is
 * always what the world does in front of him, never « wrong ».
 * One screen, nothing scrolls (designed 1280 × 720, zoomed to the window).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, Hammer, Sparkles, Bot } from 'lucide-react';
import MathText from '../../components/MathText';
import { isShortScreen } from '../engine/phoneScreen';
import { ExitLink, SoundToggle } from './parts';
import {
  PREDICT_NEED,
  EVIDENCE_MAX,
  complete,
  emptyRule,
  optionOf,
  ruleKey,
  runOn,
  testsOf,
  streak,
  sealRecord,
} from './forge';
import { boxesOf } from './authoring/forgeBlocks';
import './ruleForge.css';
import { FORGE as L } from './text';

const FAST = () => import.meta.env.DEV && typeof window !== 'undefined' && window.__forgeFast;
const PHASES = ['predict', 'build', 'test', 'seal'];
const stepOf = (phase) => (phase === 'attack' ? 'test' : phase === 'use' ? 'seal' : phase);
const digits = (v, w) => v.replace(/[^0-9]/g, '').slice(0, w);

export default function RuleForge({ forge, parts, game, log, onSeal }) {
  const { Mirror, Line } = parts;
  const T = forge.text;
  const idOf = forge.caseId;
  const [rows, setRows] = useState(() => forge.evidence(log));
  const cases = useMemo(() => forge.predictCases(forge.evidence(log)), []); // eslint-disable-line react-hooks/exhaustive-deps
  // a forge that declares an investigation opens on it: the student acts BEFORE any prediction is asked or tile offered
  const inquiry = forge.inquiry && parts.Inquiry ? forge.inquiry : null;
  // …and the investigation takes the place of the predictions; when it also WRITES the rule (`inquiry.writes`: what the
  // student claimed and the world accepted is his rule), no tile is offered either: the mirror attacks that rule at once
  // …and a forge with no investigation and no case to predict (its evidence is what he did in the WORLD, which held the
  // predictions) opens directly on its tiles: no « Prédis » step is shown, since none is played
  const phases = inquiry
    ? ['inquiry', ...(inquiry.writes ? [] : ['build']), 'test', 'seal']
    : cases.length
      ? PHASES
      : PHASES.filter((p) => p !== 'predict');
  const [phase, setPhase] = useState(inquiry ? 'inquiry' : cases.length ? 'predict' : 'build');
  const [pi, setPi] = useState(0);
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(() => ({ c: cases[0], stage: 'ask', guess: null }));
  const [rule, setRule] = useState(() => emptyRule(forge));
  const [tries, setTries] = useState(0);
  const [run, setRun] = useState(null); // test: { marks, bad, upto }
  const [atk, setAtk] = useState(null); // attack: { list, i, said }
  const [nudges, setNudges] = useState(0);
  const [help, setHelp] = useState(null);
  const [words, setWords] = useState('');
  const [use, setUse] = useState(null); // the last step: { c, vals, verdict, fb }
  const [z, setZ] = useState(1);
  const [win, setWin] = useState('');
  // the evidence log never runs out of its column (GAME_WORLD.md « The evidence fits its column »): how many rows fit, for
  // the layout it was measured on (`sig`) — a new layout starts from all the rows again
  const [logRoom, setLogRoom] = useState({ sig: '', n: 0 });
  const listRef = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, FAST() ? Math.min(ms, 30) : ms));
  };
  const play = (name, p) => game.audio.play(name, p);

  useEffect(() => {
    // a phone held sideways has ONE scale, its root font (GAME_WORLD.md « On a phone »): the forge does not zoom there —
    // it has its own compact layout, and its list and its panel slide inside themselves
    const fit = () => {
      setWin(`${window.innerWidth}x${window.innerHeight}`);
      setZ(
        isShortScreen()
          ? 1
          : Math.max(0.62, Math.min(1.9, Math.min(window.innerWidth / 1280, window.innerHeight / 720))),
      );
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (import.meta.env.DEV)
      window.__forge = { key: forge.key, phase, show, rule, rows, atk, run, use, cases, nudges, help };
  });

  const remember = (c) => {
    if (forge.logs) game.logMirror?.(c);
    setRows((old) => forge.evidence([...old, { ...c, mirror: true }]));
  };
  /** The mirror builds the case stroke by stroke, then the world gives its verdict; `then` runs when it is over. */
  const buildIt = (c, extra, then) => {
    const beats = parts.beats?.(c) ?? 0;
    setShow({ c, stage: 'build', ...extra });
    for (let k = 0; k < beats; k += 1) later(() => play('plank', k), k * 110);
    later(
      () => {
        setShow({ c, stage: 'done', ...extra });
        play(c.held ? 'success' : 'crumble');
        remember(c);
        then?.();
      },
      beats * 110 + 520,
    );
  };

  // ── 1. predict ──
  const predict = (guess) => {
    const c = show.c;
    buildIt(c, { guess }, () => setResults((r) => [...r, guess === c.held]));
  };
  const inHead = streak(results) >= PREDICT_NEED;
  const lastCase = pi >= cases.length - 1;
  const nextPredict = () => {
    play('ui');
    if (inHead || lastCase) {
      setPhase('build');
      return;
    }
    setPi(pi + 1);
    setShow({ c: cases[pi + 1], stage: 'ask', guess: null });
  };

  // ── 2. build, 3. test ──
  const pickTile = (slotId, id) => {
    play('pick');
    setHelp((h) => (h?.kind === 'choice' ? h : null));
    setRule((r) => ({ ...r, [slotId]: id }));
  };
  const startTest = () => {
    const res = runOn(forge, rule, testsOf(forge, rule, rows));
    setTries((n) => n + 1);
    setHelp(null);
    setRun({ ...res, upto: 0 });
    setPhase('test');
    const last = res.bad >= 0 ? res.bad : res.marks.length - 1;
    for (let i = 0; i <= last; i += 1)
      later(
        () => {
          setRun({ ...res, upto: i + 1 });
          play(res.marks[i].agrees ? 'plank' : 'crumble', i);
        },
        420 * (i + 1),
      );
  };
  const backToBuild = () => {
    play('ui');
    setRun(null);
    setAtk(null);
    setPhase('build');
  };

  // ── 4. attack ──
  const startAttack = () => attackWith(rule, rows);
  const attackWith = (r, rs) => {
    const list = forge.attacks(r, rs);
    if (!list.length) {
      if (forge.isTheRule(r)) setPhase('seal');
      else backToBuild();
      return;
    }
    play('wind');
    setAtk({ list, i: 0, said: null });
    setShow({ c: list[0], stage: 'ask' });
    setPhase('attack');
  };
  const sayRule = (v) => {
    play('ui');
    setAtk((s) => ({ ...s, said: v }));
  };
  const fireAttack = () => buildIt(atk.list[atk.i], {});
  const nextAttack = () => {
    play('ui');
    if (atk.i + 1 < atk.list.length) {
      setAtk({ ...atk, i: atk.i + 1, said: null });
      setShow({ c: atk.list[atk.i + 1], stage: 'ask' });
    } else {
      play('key');
      setPhase('seal');
    }
  };

  // ── 0. the investigation is over: what he did becomes his evidence — and, when it wrote the rule, his rule ──
  const afterInquiry = (result) => {
    const out = forge.fromInquiry?.(result) ?? {};
    if (out.rows) setRows(out.rows);
    if (out.rule) {
      setRule(out.rule);
      attackWith(out.rule, out.rows ?? rows);
      return;
    }
    play('ui');
    setPhase('build');
  };

  // ── 5. seal, 6. use ──
  const toUse = () => {
    play('ui');
    setUse({ c: forge.use.make(), vals: {}, verdict: null, fb: null });
    setPhase('use');
  };
  const useLines = use ? forge.use.lines(use.c) : [];
  const useSlots = useLines.flatMap((line) => boxesOf(line.tokens));
  const useFilled =
    use && useSlots.every((t) => (use.vals[t.slot] ?? '') !== '') && (!forge.use.verdict || use.verdict !== null);
  const checkUse = () => {
    const fb = forge.use.check(use.c, use.vals, use.verdict);
    if (fb === 'ok') {
      play('success');
      setUse({ ...use, fb });
      later(() => onSeal(sealRecord(forge, { rule, words, tries, nudges, results })), 1100);
      return;
    }
    play('ui');
    setUse({ ...use, fb });
  };

  // ── the robot: never the rule ──
  const askHelp = () => {
    const n = Math.min(3, nudges + 1);
    const h = forge.nudge(n, rows);
    setNudges(n);
    play('crystal');
    if (h.kind !== 'experiment') {
      setHelp(h);
      return;
    }
    setHelp({ ...h, running: true });
    buildIt(h.cases[0], {}, () => later(() => buildIt(h.cases[1], {}, () => setHelp({ ...h, running: false })), 900));
  };

  const c = show?.c;
  const building = show?.stage === 'build';
  const done = show?.stage === 'done';
  const bad = run && run.bad >= 0 && run.upto > run.bad ? run.marks[run.bad] : null;
  const allAgree = run && run.bad < 0 && run.upto >= run.marks.length;
  const a = atk ? atk.list[atk.i] : null;
  const says = a ? forge.says(rule, a) : null;
  const brokeIt = a && done && says !== a.held;
  const testing = phase === 'test' && run;
  // the lines on the left: his evidence — or, while a rule that builds its own cases is tested, those cases. While the
  // mirror tests his rule it runs on EVERY line he made (`startTest`), so every line is offered to the window below: the
  // line it is marking, or the one that refuted his rule, stays on screen even when it is older than the last
  // EVIDENCE_MAX (2026-11-19: a summit search of 15 planks was refuted by its first plank, which had left the column)
  const all = testing && forge.tests ? run.marks : testing ? rows : rows.slice(-EVIDENCE_MAX);
  // …as many as fit its column: the oldest leave first, and the row that matters stays — the newest, or, while the mirror
  // marks them, the row it is marking (or the one that refuted his rule)
  const focus = testing ? (bad ?? run.marks[Math.max(0, Math.min(run.upto, run.marks.length) - 1)]) : null;
  const fi = focus ? all.findIndex((r) => idOf(r) === idOf(focus)) : -1;
  const logSig = `${phase}|${all.length}|${win}|${z}`;
  const room = logRoom.sig === logSig ? logRoom.n : all.length;
  const from = Math.max(0, (fi >= 0 ? fi : all.length - 1) - room + 1);
  const lines = all.slice(from, from + room);
  const markOf = (row) => (testing ? run.marks.slice(0, run.upto).find((m) => idOf(m) === idOf(row)) : null);
  const inMirror = phase === 'predict' || phase === 'attack' || (phase === 'build' && help?.kind === 'experiment');
  const eq = done && c ? T.eq?.(c) : null;
  // measured after every render, before it is painted: a list taller than its column loses its oldest row, until it fits
  // (a phone held sideways keeps them all: its list slides inside itself)
  useLayoutEffect(() => {
    const ul = listRef.current;
    if (!ul || lines.length <= 1 || isShortScreen()) return;
    if (ul.scrollHeight > ul.clientHeight + 1) setLogRoom({ sig: logSig, n: lines.length - 1 });
  });

  return (
    <div className="rf-root" data-rf={phase} data-rf-key={forge.key} data-rf-tries={tries} data-rf-nudges={nudges}>
      {/* --di-min-font: the 12 px floor in the units of this zoom (GAME_WORLD.md « 12 px floor »): 15 px drawn at 0.8 */}
      <div className="rf-fit" style={{ zoom: z, '--di-min-font': `${Math.ceil(1200 / z) / 100}px` }}>
        <header className="rf-head">
          <div className="rf-brand">
            <i>🪞</i>
            <div>
              <h2>{T.title}</h2>
              <p>{T.sub}</p>
            </div>
          </div>
          <ol className="rf-steps">
            {phases.map((p, i) => {
              const at = phases.indexOf(stepOf(phase));
              return (
                <li key={p} className={i === at ? 'is-now' : i < at ? 'is-done' : ''}>
                  <b>{i < at ? '✓' : i + 1}</b>
                  <span>{L.steps[p]}</span>
                </li>
              );
            })}
          </ol>
          {/* the forge covers the top bar: its sound button and its ✕ are drawn again here — he can always leave */}
          <div className="rf-head__end">
            {phase === 'build' && (
              <button
                type="button"
                className="rf-btn rf-btn--bot"
                onClick={askHelp}
                disabled={nudges >= 3 || help?.running}
                data-rf-help
              >
                <Bot size={19} /> {L.help}
              </button>
            )}
            <SoundToggle game={game} />
            <ExitLink />
          </div>
        </header>

        {phase === 'inquiry' && <parts.Inquiry spec={inquiry} game={game} onDone={afterInquiry} />}

        <aside className="rf-log" data-rf-log hidden={phase === 'inquiry'}>
          <h3>📖 {T.log}</h3>
          <ul ref={listRef}>
            {lines.map((row) => {
              const m = markOf(row);
              const cmp = help?.kind === 'compare' && help.cases.some((x) => idOf(x) === idOf(row));
              return (
                <li
                  key={idOf(row)}
                  className={`${row.held ? 'is-held' : 'is-fell'} ${m ? (m.agrees ? 'is-agree' : 'is-refute') : ''} ${cmp ? 'is-compare' : ''}`}
                  data-rf-row={idOf(row)}
                  data-rf-own={row.mirror ? '0' : '1'}
                  data-rf-mark={m ? (m.agrees ? 'agree' : 'refute') : ''}
                  title={typeof row.text === 'string' ? row.text : undefined}
                >
                  <Line c={row}>
                    {m && (
                      <small className="rf-says">
                        {m.agrees ? '✓' : '✗'} {T.says(m.says)}
                      </small>
                    )}
                  </Line>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="rf-main" hidden={phase === 'inquiry'}>
          <section className={`rf-mirror ${inMirror ? '' : 'is-rule'}`} data-rf-mirror>
            {inMirror && c && (
              <>
                <Mirror c={c} stage={show.stage} fast={FAST()} tight={phase === 'build'} />
                {eq && (
                  <p className="rf-eq" dir="ltr" data-rf-eq>
                    <MathText>{eq}</MathText>
                  </p>
                )}
              </>
            )}
            {!inMirror && (
              <div className="rf-rule" data-rf-rule={ruleKey(forge, rule)} data-rf-slots={forge.slots.length}>
                <span>{T.frame}</span>
                {forge.slots.map((s) => {
                  const o = optionOf(forge, s.id, rule[s.id]);
                  return (
                    <b key={s.id} className={o ? '' : 'is-empty'} data-rf-slot={s.id}>
                      {o ? (forge.chip?.(s, o) ?? o.label) : '……'}
                    </b>
                  );
                })}
                {(phase === 'seal' || phase === 'use') && <i className="rf-keymark">🔑</i>}
              </div>
            )}
          </section>

          <section className="rf-panel" data-rf-panel={phase}>
            {phase === 'predict' && c && (
              <>
                <p className="rf-q">
                  <MathText>{T.ask(c)}</MathText>
                </p>
                {show.stage === 'ask' && (
                  <div className="rf-row">
                    <button
                      type="button"
                      className="rf-btn rf-btn--hold"
                      onClick={() => predict(true)}
                      data-rf-guess="yes"
                    >
                      {T.yes}
                    </button>
                    <button
                      type="button"
                      className="rf-btn rf-btn--fall"
                      onClick={() => predict(false)}
                      data-rf-guess="no"
                    >
                      {T.no}
                    </button>
                  </div>
                )}
                {done && (
                  <>
                    <p
                      className={`rf-fb ${show.guess === c.held ? 'is-right' : ''}`}
                      data-rf-predicted={show.guess === c.held ? 'right' : 'miss'}
                    >
                      {show.guess === c.held ? `✓ ${L.right}` : L.miss}{' '}
                      <span>
                        <MathText>{T.fact(c)}</MathText>
                      </span>
                    </p>
                    {(inHead || lastCase) && <p className="rf-note">{inHead ? L.inHead : L.timeToWrite}</p>}
                    <button type="button" className="rf-btn rf-btn--main" onClick={nextPredict} autoFocus data-rf-next>
                      {inHead || lastCase ? (
                        <>
                          <Hammer size={18} /> {L.toBuild}
                        </>
                      ) : (
                        T.next
                      )}
                    </button>
                  </>
                )}
                <div className="rf-streak" aria-hidden="true" data-rf-streak={streak(results)}>
                  {Array.from({ length: PREDICT_NEED }, (_, i) => (
                    <i key={i} className={i < streak(results) ? 'is-on' : ''} />
                  ))}
                </div>
              </>
            )}

            {phase === 'build' && (
              <>
                {help ? (
                  <p className="rf-bubble" data-rf-nudge={help.kind}>
                    <Bot size={18} />{' '}
                    {help.kind === 'compare'
                      ? T.compare(help.cases)
                      : help.kind === 'experiment'
                        ? T.experiment
                        : L.choice}
                    {help.kind === 'choice' && (
                      <span className="rf-row">
                        {help.rules.map((r, i) => (
                          <button
                            key={ruleKey(forge, r)}
                            type="button"
                            className="rf-btn"
                            onClick={() => {
                              play('pick');
                              setRule(r);
                            }}
                            data-rf-choice={ruleKey(forge, r)}
                          >
                            {i === 0 ? L.ruleA : L.ruleB}
                          </button>
                        ))}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="rf-note">{T.buildLead}</p>
                )}
                <div className="rf-tiles" data-rf-slots={forge.slots.length}>
                  {forge.slots.map((s) => (
                    <div key={s.id} data-rf-slot-tiles={s.id}>
                      <h4>{s.label}</h4>
                      {s.options.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className={`rf-tile ${rule[s.id] === o.id ? 'is-on' : ''}`}
                          onClick={() => pickTile(s.id, o.id)}
                          aria-pressed={rule[s.id] === o.id}
                          data-rf-tile={`${s.id}:${o.id}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="rf-btn rf-btn--main"
                  onClick={startTest}
                  disabled={!complete(forge, rule) || help?.running}
                  data-rf-test
                >
                  <Sparkles size={18} /> {L.test}
                </button>
              </>
            )}

            {phase === 'test' && (
              <>
                {!bad && !allAgree && <p className="rf-note">{T.testing}</p>}
                {bad && (
                  <>
                    <p className="rf-fb is-broken" data-rf-refuted={idOf(bad)}>
                      {T.refuted(bad)}
                    </p>
                    <p className="rf-note">
                      <MathText>{forge.explain(rule, bad)}</MathText>
                    </p>
                    <button type="button" className="rf-btn rf-btn--main" onClick={backToBuild} autoFocus data-rf-fix>
                      <Hammer size={18} /> {L.fix}
                    </button>
                  </>
                )}
                {allAgree && (
                  <>
                    <p className="rf-fb is-right" data-rf-agreed>
                      {T.agreed}
                    </p>
                    <button type="button" className="rf-btn rf-btn--main" onClick={startAttack} autoFocus data-rf-dare>
                      {L.dare}
                    </button>
                  </>
                )}
              </>
            )}

            {phase === 'attack' && a && (
              <>
                <p className="rf-q">
                  <MathText>{T.attack(a)}</MathText>
                </p>
                {show.stage === 'ask' && atk.said === null && (
                  <div className="rf-row">
                    <button
                      type="button"
                      className="rf-btn rf-btn--hold"
                      onClick={() => sayRule(true)}
                      data-rf-say="yes"
                    >
                      {T.yes}
                    </button>
                    <button
                      type="button"
                      className="rf-btn rf-btn--fall"
                      onClick={() => sayRule(false)}
                      data-rf-say="no"
                    >
                      {T.no}
                    </button>
                  </div>
                )}
                {show.stage === 'ask' && atk.said !== null && (
                  <>
                    <p className="rf-note" data-rf-rule-says={says ? 'yes' : 'no'}>
                      {atk.said !== says && <b>{L.notThat} </b>}
                      <MathText>{forge.explain(rule, a)}</MathText>
                    </p>
                    <button type="button" className="rf-btn rf-btn--main" onClick={fireAttack} autoFocus data-rf-fire>
                      <Hammer size={18} /> {T.fire}
                    </button>
                  </>
                )}
                {building && <p className="rf-note">{T.says(says)}</p>}
                {done && !brokeIt && (
                  <>
                    <p className="rf-fb is-right" data-rf-survived>
                      {T.survived}
                    </p>
                    <button
                      type="button"
                      className="rf-btn rf-btn--main"
                      onClick={nextAttack}
                      autoFocus
                      data-rf-attack-next
                    >
                      {atk.i + 1 < atk.list.length ? L.another : <>🔑 {L.toSeal}</>}
                    </button>
                  </>
                )}
                {done && brokeIt && (
                  <>
                    <p className="rf-fb is-broken" data-rf-broken={idOf(a)}>
                      {T.broken(says)}
                    </p>
                    <button type="button" className="rf-btn rf-btn--main" onClick={backToBuild} autoFocus data-rf-fix>
                      <Hammer size={18} /> {L.fix}
                    </button>
                  </>
                )}
              </>
            )}

            {phase === 'seal' && (
              <>
                <p className="rf-fb is-right" data-rf-sealed>
                  🔑 {L.sealed}
                </p>
                <label className="rf-words">
                  <span>{L.words}</span>
                  <input
                    value={words}
                    onChange={(e) => setWords(e.target.value.slice(0, 140))}
                    placeholder={T.wordsHint}
                    data-rf-words
                  />
                </label>
                <button type="button" className="rf-btn rf-btn--main" onClick={toUse} data-rf-seal>
                  <Check size={18} strokeWidth={3} /> {L.sealIt}
                </button>
              </>
            )}

            {phase === 'use' && use && (
              <>
                <p className="rf-q">
                  <MathText>{T.tryKey(use.c)}</MathText>
                </p>
                <UseLines
                  lines={useLines}
                  vals={use.vals}
                  onType={(name, value) => setUse({ ...use, vals: { ...use.vals, [name]: value }, fb: null })}
                />
                <div className="rf-row">
                  {forge.use.verdict && (
                    <>
                      <button
                        type="button"
                        className={`rf-btn rf-btn--hold ${use.verdict === true ? 'is-on' : ''}`}
                        onClick={() => setUse({ ...use, verdict: true, fb: null })}
                        aria-pressed={use.verdict === true}
                        data-rf-use-verdict="yes"
                      >
                        {T.yes}
                      </button>
                      <button
                        type="button"
                        className={`rf-btn rf-btn--fall ${use.verdict === false ? 'is-on' : ''}`}
                        onClick={() => setUse({ ...use, verdict: false, fb: null })}
                        aria-pressed={use.verdict === false}
                        data-rf-use-verdict="no"
                      >
                        {T.no}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="rf-btn rf-btn--main"
                    onClick={checkUse}
                    disabled={!useFilled || use.fb === 'ok'}
                    data-rf-use-check
                  >
                    {L.check}
                  </button>
                </div>
                {use.fb && (
                  <p className={`rf-fb ${use.fb === 'ok' ? 'is-right' : ''}`} data-rf-use-fb={use.fb}>
                    {use.fb === 'ok' ? `✓ ${T.useOk}` : T.use[use.fb]}
                  </p>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/**
 * The lines of the last step: tokens read left to right — a printed string, a box `slot(name, label, w)` (its label under
 * it when the step is one line), or a FRACTION `{ frac: { n, d } }` drawn in its own shape: numerator, a real bar,
 * denominator, each printed or typed (forgeBlocks.js › fractionBox / givenFraction; the look `di-frac`,
 * styles/trainer.css). `onType(name, digits)` receives what a box now holds.
 */
export function UseLines({ lines, vals, onType }) {
  const named = lines.length === 1;
  const token = (t, key, label) =>
    typeof t === 'object' ? (
      <label key={key}>
        <input
          inputMode="numeric"
          style={{ width: `${(t.w ?? 3) * 0.7 + 0.9}em` }}
          value={vals[t.slot] ?? ''}
          onChange={(e) => onType(t.slot, digits(e.target.value, t.w ?? 3))}
          aria-label={t.label}
          data-rf-use={t.slot}
        />
        {label && <small>{t.label}</small>}
      </label>
    ) : (
      <b key={key}>{t}</b>
    );
  return (
    <div className="rf-uselines" data-rf-lines={lines.length}>
      {lines.map((line, i) => (
        <div key={i} className="rf-use" dir={line.dir ?? 'ltr'}>
          {line.tokens.map((t, k) =>
            t?.frac ? (
              <span
                key={k}
                className={`di-frac rf-frac${boxesOf([t]).length ? ' di-frac--typed' : ''}`}
                dir="ltr"
                data-rf-frac={[t.frac.n, t.frac.d].map((x) => x.slot ?? x).join('/')}
              >
                {token(t.frac.n, 'n', false)}
                <span className="di-frac__bar" aria-hidden="true" />
                {token(t.frac.d, 'd', false)}
              </span>
            ) : (
              token(t, k, named)
            ),
          )}
        </div>
      ))}
    </div>
  );
}
