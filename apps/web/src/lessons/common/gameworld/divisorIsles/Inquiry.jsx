/**
 * THE INVESTIGATION of a rule forge, in this world (logic: `inquiry.js`; it is the first phase of `kit/RuleForge.jsx` when
 * the forge declares `inquiry`). The student ACTS on gaps and planks until he has seen what the rule will name; no rule is
 * written here and none is told: what answers him is the strip or the chart.
 *
 *   <Inquiry spec={forge.inquiry} game={game} onDone={() => …} />
 *   spec = { kind: 'pairs', gaps: [36, 40, 30], text } | { kind: 'chart', planks: [{ b, manual, lenses, link? }], divisors, nextManual?, text }
 *        | turn, cut (`InquiryMoves.jsx`) | join, stack (`InquiryCombine.jsx`) | peel, letters (`InquiryProof.jsx`)
 *        | groups, rebuild, estimate, bracket (`InquiryDivision.jsx` — the Euclidean division)
 *        | common, ladder, nest (`InquiryGcd.jsx` — the greatest common divisor) | cycle (`InquiryCycle.jsx`)
 *        | summit (`InquirySummit.jsx`) | deal (`InquiryDeal.jsx`) | lists (`InquiryLists.jsx`)
 *        | sort (`InquirySort.jsx`) | measure (`InquiryMeasure.jsx`) | part (`InquiryPart.jsx`) | sheet (`InquirySheet.jsx`)
 *   — every spec shape is in docs/architecture/GAME_WORLD.md « Explore ».
 * `text` is the LESSON's wording (this file names no lesson and writes none of its numbers).
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '../../components/MathText';
import {
  tryPlank,
  lastNeeded,
  missedBy,
  LENSES,
  chartCells,
  holds,
  lightsIn,
  judgeClaim,
  claimValues,
  pieceOf,
} from './inquiry';
import { Turn, Cut } from './InquiryMoves';
import { Join, Stack } from './InquiryCombine';
import { Peel, Letters } from './InquiryProof';
import { Groups, Rebuild, Estimate, Bracket } from './InquiryDivision';
import { Common, Ladder, Nest } from './InquiryGcd';
import { Cycle } from './InquiryCycle';
import { Summit } from './InquirySummit';
import { Deal } from './InquiryDeal';
import { Lists } from './InquiryLists';
import { Sort } from './InquirySort';
import { Measure } from './InquiryMeasure';
import { Part } from './InquiryPart';
import { Sheet } from './InquirySheet';
import { INQUIRY_TEXT } from './strings';
import { FAST, expose } from './inquiryParts';
import './inquiry.css';

// ───────────────────────── pairs: a plank and its partner walk toward each other ─────────────────────────
const SW = 1000;
const SX0 = 44;
const SX1 = 956;

/**
 * Where a number stands on the strip of a gap of `a` cells whose planks are tried up to `end`. A SHORT gap is drawn at one
 * scale. A LONG gap (a plank would keep less than 22 px of the strip: 221 cases, 16 planks tried — 4 units a
 * plank, the first French lesson drew a lone « 6 » between 1 and 13 and its two labels on one marker) is drawn in two
 * parts: 0 … `zoom` (every plank tried and the place where plank and partner cross) on ZOOM_SHARE of the width, then a
 * visible BREAK (`breakAt`), then `zoom` … a squeezed on the rest — the partners of the first planks still walk in from
 * the far end, and the crossing is read at full size. → { x(n), zoom: null | number, breakAt: null | px }.
 */
const ZOOM_SHARE = 0.7;
const BREAK_PX = 26;
export function stripScale(a, end) {
  const W = SX1 - SX0;
  const zoom = Math.ceil(end * 1.5);
  // one scale while a plank keeps 22 px of the strip (a two-digit number of 16 px and its margin)
  if (W / a >= 22 || zoom >= a) return { x: (n) => SX0 + (n / a) * W, zoom: null, breakAt: null };
  const left = W * ZOOM_SHARE;
  const x = (n) =>
    n <= zoom ? SX0 + (n / zoom) * left : SX0 + left + BREAK_PX + ((n - zoom) / (a - zoom)) * (W - left - BREAK_PX);
  return { x, zoom, breakAt: SX0 + left + BREAK_PX / 2 };
}

/**
 * The numbers written under the strip that can stand there without touching (all on ONE row of the scene): a long gap
 * puts its planks a few units apart (221 cases: 4 units a plank — the first French lesson drew « 1 2 3 … 16 » on one
 * another). They are taken in order of what they say — the planks that hold and their partners first, then the planks
 * that fell — and one is left out when it would touch one already written; the table under the strip lists every plank.
 * `items`: [{ key, x, text, size }] in that order → the keys kept. A label is about 0.62 × its size wide a character.
 */
export function spacedLabels(items, gap = 6) {
  const kept = [];
  for (const it of items) {
    const w = String(it.text).length * 0.62 * it.size;
    if (kept.every((k) => Math.abs(k.x - it.x) >= (k.w + w) / 2 + gap)) kept.push({ ...it, w });
  }
  return new Set(kept.map((k) => k.key));
}

function Pairs({ spec, play, onDone }) {
  const T = spec.text;
  const [gi, setGi] = useState(0);
  const a = spec.gaps[gi];
  const m = lastNeeded(a);
  const end = m + 2; // two planks past the crossing: enough to see the partner fall behind
  const [tries, setTries] = useState([]);
  const [stage, setStage] = useState('try'); // guess | try | ask | swept | pick | found
  const [guess, setGuess] = useState(null);
  const [said, setSaid] = useState(null); // the last tap of the pick: { k, kind }
  const [swept, setSwept] = useState(0);
  const [found, setFound] = useState([]);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  expose({ kind: 'pairs', gi, a, m, stage, tries: tries.length, guess, found });

  const scale = stripScale(a, end);
  const { x } = scale;
  const last = tries.at(-1) ?? null;
  const d = tries.length + 1;
  const squares = gi >= 1; // the squares join the table from the second gap: first the crossing is SEEN, then measured
  const shown = stage === 'guess' && gi >= 2 ? Array.from({ length: end }, (_, i) => tryPlank(a, i + 1)) : tries;

  const tryNext = () => {
    const t = tryPlank(a, d);
    play(t.whole ? (t.crossed ? 'ui' : 'key') : 'fail');
    const list = [...tries, t];
    setTries(list);
    if (list.length >= end) setStage(gi === 0 ? 'ask' : 'pick');
  };
  const sweep = () => {
    setStage('swept');
    let k = end;
    timer.current = setInterval(
      () => {
        k += 1;
        setSwept(k - end);
        if (k >= a) clearInterval(timer.current);
      },
      FAST() ? 4 : 70,
    );
  };
  const pick = (k) => {
    if (stage === 'guess') {
      play('pick');
      setGuess(k);
      setStage('try');
      return;
    }
    if (k === m) {
      play('key');
      setSaid({ k, kind: 'ok' });
      setFound([...found, { a, m, guess }]);
      setStage('found');
      return;
    }
    play('fail');
    setSaid({ k, kind: k > m ? 'late' : 'early' });
  };
  const next = () => {
    if (gi + 1 >= spec.gaps.length) {
      onDone({ gaps: found });
      return;
    }
    setGi(gi + 1);
    setTries([]);
    setGuess(null);
    setSaid(null);
    setSwept(0);
    setStage('guess');
  };

  const picking = stage === 'guess' || stage === 'pick';
  const chips = Array.from({ length: Math.min(a, end + 3) }, (_, i) => i + 1);
  const held = tries.filter((t) => t.whole && !t.crossed);
  const fallen = tries.filter((t) => !t.whole).map((t) => ({ key: `f${t.d}`, x: x(t.d), text: t.d, size: 16 }));
  const spaced = spacedLabels([
    ...held.map((t) => ({ key: `d${t.d}`, x: x(t.d), text: t.d, size: 19 })),
    ...held.filter((t) => t.q !== t.d).map((t) => ({ key: `q${t.d}`, x: x(t.q), text: t.q, size: 19 })),
    ...fallen,
  ]);
  // the planks that fell are named all together or not at all: one lone number among them says nothing
  const shownLabels = fallen.every((f) => spaced.has(f.key))
    ? spaced
    : new Set([...spaced].filter((k) => !k.startsWith('f')));
  const partnerText = (t) => (t.whole ? String(t.q) : T.between(Math.floor(t.partner), Math.floor(t.partner) + 1));

  return (
    <section className="iq iq--pairs" data-iq="pairs" data-iq-stage={stage} data-iq-gap={a}>
      <div className="iq-lead">
        <span className="iq-count">
          {gi + 1} / {spec.gaps.length}
        </span>
        <p>
          <MathText>
            {stage === 'guess'
              ? T.guess(a, gi)
              : stage === 'pick'
                ? T.pick(a)
                : stage === 'ask' || stage === 'swept'
                  ? T.ask(a, end)
                  : stage === 'found'
                    ? T.pickOk(a, m, guess)
                    : T.lead(a, gi)}
          </MathText>
        </p>
      </div>

      <svg className="iq-strip" viewBox={`0 0 ${SW} 204`} role="img" aria-label={T.stripLabel(a)}>
        {/* what was tried so far: every plank up to the last one */}
        {last && <rect className="iq-zone" x={x(0.5)} y="96" width={x(last.d + 0.5) - x(0.5)} height="34" rx="8" />}
        {scale.zoom ? (
          // a long gap: its first part at full size, a break, the rest squeezed (`stripScale`)
          <g data-iq-strip-break={scale.zoom}>
            <line className="iq-axis" x1={x(1)} y1="113" x2={scale.breakAt - 8} y2="113" />
            <line className="iq-axis" x1={scale.breakAt + 8} y1="113" x2={x(a)} y2="113" />
            <path className="iq-break" d={`M ${scale.breakAt - 11} 124 l 8 -22 M ${scale.breakAt + 3} 124 l 8 -22`} />
            {Array.from({ length: scale.zoom }, (_, i) => i + 1).map((n) => (
              <line key={n} className="iq-tick" x1={x(n)} y1="107" x2={x(n)} y2="119" />
            ))}
          </g>
        ) : (
          <>
            <line className="iq-axis" x1={x(1)} y1="113" x2={x(a)} y2="113" />
            {Array.from({ length: a }, (_, i) => i + 1).map((n) => (
              <line key={n} className="iq-tick" x1={x(n)} y1="107" x2={x(n)} y2="119" />
            ))}
          </>
        )}
        {/* a bridge that holds joins the plank and its partner */}
        {tries
          .filter((t) => t.whole && !t.crossed)
          .map((t) => {
            const [xa, xb] = [x(t.d), x(t.q)];
            const h = Math.min(86, 16 + (xb - xa) * 0.16);
            return (
              <g key={t.d} className="iq-pair">
                {t.q !== t.d && <path pathLength="1" d={`M ${xa} 100 Q ${(xa + xb) / 2} ${100 - h * 2} ${xb} 100`} />}
                <circle cx={xa} cy="113" r="9" />
                <circle cx={xb} cy="113" r="9" className="is-partner" />
                {shownLabels.has(`d${t.d}`) && (
                  <text x={xa} y="146">
                    {t.d}
                  </text>
                )}
                {t.q !== t.d && shownLabels.has(`q${t.d}`) && (
                  <text x={xb} y="146" className="is-partner">
                    {t.q}
                  </text>
                )}
              </g>
            );
          })}
        {tries
          .filter((t) => !t.whole && shownLabels.has(`f${t.d}`))
          .map((t) => (
            <text key={t.d} x={x(t.d)} y="146" className="iq-fell">
              {t.d}
            </text>
          ))}
        {/* the plank being tried, and where its partner stands — whole or not */}
        {last && stage !== 'guess' && (
          <g className={`iq-walk ${last.crossed ? 'is-crossed' : ''}`} data-iq-crossed={last.crossed ? '1' : '0'}>
            <path className="iq-walk__plank" d={`M ${x(last.d)} 156 l -11 18 h 22 z`} />
            <path className="iq-walk__partner" d={`M ${x(last.partner)} 102 l -11 -20 h 22 z`} />
            <text x={x(last.d)} y="196">
              {T.plank(last.d)}
            </text>
            <text x={x(last.partner)} y="72" className="is-partner">
              {T.partner}
            </text>
          </g>
        )}
        {guess != null && stage !== 'guess' && (
          <g className="iq-guess">
            <line x1={x(guess)} y1="86" x2={x(guess)} y2="136" />
          </g>
        )}
      </svg>

      <div className="iq-table" dir="ltr" data-iq-table>
        <div className="iq-table__head">
          <span>{T.cols.plank}</span>
          <span>{T.cols.partner}</span>
          {squares && <span>{T.cols.square}</span>}
        </div>
        {shown.map((t) => (
          <div
            key={t.d}
            className={`iq-try ${stage === 'guess' ? 'is-ahead' : t.whole ? (t.crossed ? 'is-known' : 'is-new') : 'is-fell'} ${t.crossed && stage !== 'guess' ? 'is-crossed' : ''}`}
            data-iq-tried={t.d}
          >
            <b>{t.d}</b>
            <span>{stage === 'guess' ? '?' : partnerText(t)}</span>
            {squares && <em>{t.square}</em>}
          </div>
        ))}
      </div>

      <p className="iq-fact" data-iq-fact>
        <MathText>
          {said && stage === 'pick'
            ? said.kind === 'late'
              ? T.pickLate(a, said.k, tryPlank(a, said.k))
              : T.pickEarly(a, said.k, missedBy(a, said.k))
            : stage === 'swept'
              ? T.swept(swept, a, swept >= a - end)
              : last && stage !== 'guess' && stage !== 'found'
                ? last.whole
                  ? last.crossed
                    ? T.known(a, last)
                    : T.held(a, last)
                  : last.crossed
                    ? T.fellBehind(a, last)
                    : T.fell(a, last)
                : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'try' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={tryNext} data-iq-try={d}>
            {T.tryBtn(d)}
          </button>
        )}
        {stage === 'ask' && (
          <>
            <button type="button" className="rf-btn" onClick={sweep} data-iq-ask="yes">
              {T.askYes}
            </button>
            <button type="button" className="rf-btn" onClick={() => setStage('pick')} data-iq-ask="no">
              {T.askNo}
            </button>
          </>
        )}
        {stage === 'swept' && swept >= a - end && (
          <button type="button" className="rf-btn rf-btn--main" onClick={() => setStage('pick')} data-iq-swept>
            {T.afterSweep}
          </button>
        )}
        {picking && (
          <div className="iq-chips" dir="ltr">
            {chips.map((k) => (
              <button
                key={k}
                type="button"
                className={`iq-chip ${said?.k === k && stage === 'pick' ? 'is-said' : ''}`}
                onClick={() => pick(k)}
                data-iq-pick={k}
              >
                {k}
              </button>
            ))}
          </div>
        )}
        {stage === 'found' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {gi + 1 >= spec.gaps.length ? T.done : T.next}
          </button>
        )}
      </div>

      {found.length > 0 && (
        <ul className="iq-found" data-iq-found>
          {found.map((f) => (
            <li key={f.a}>
              <MathText>{T.foundLine(f.a, f.m)}</MathText>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ───────────────────────── chart: test gaps one after the other, then choose what to LOOK AT ─────────────────────────
/** The division of a gap by the plank, as it is written: n = q × b + r — the rest green when it is 0, gold otherwise. */
const divisionTex = (n, b) => {
  const { whole, piece } = pieceOf(n, b);
  return `${n} = ${whole} \\times ${b} + \\textcolor{${piece ? '#fbbf24' : '#8dffb0'}}{${piece}}`;
};
/** How many of the last divisions stay on screen (the newest is the large one). */
const DIVISIONS = 4;
/** How many gaps of the next hundred he tests himself before the world finishes it (`spec.nextManual` overrides). */
const NEXT_MANUAL = 3;

function Chart({ spec, play, onDone }) {
  const T = spec.text;
  const [pi, setPi] = useState(0);
  const p = spec.planks[pi];
  const [from, setFrom] = useState(0);
  const [upto, setUpto] = useState(0); // gaps tested so far on this chart: every gap below `upto`
  const [taps, setTaps] = useState(0);
  const [stage, setStage] = useState('test'); // test | lens | confirm | sealed
  const [lens, setLens] = useState(null);
  const [values, setValues] = useState([]);
  const [failed, setFailed] = useState([]); // lenses that took a dark cell in
  const [found, setFound] = useState([]);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);

  const cells = chartCells(from);
  const first = from === 0 ? p.b : from;
  const full = upto >= from + 100;
  const tested = (n) => n < upto;
  // how this plank's claim is said: « lens · est égal à · values » or « lens · est divisible par · a number »
  const link = p.link ?? 'equals';
  const taken = lens ? claimValues(link, lens, values, from) : [];
  const judge = lens ? judgeClaim(p.b, lens, taken, from) : null;
  expose({ kind: 'chart', pi, b: p.b, from, stage, upto, taps, lens, link, values, judge, full, found });

  // on the next hundred he tests the first gaps HIMSELF, one after the other (as on the first chart), then the world
  // finishes the hundred
  const handNext = spec.nextManual ?? NEXT_MANUAL;
  const testNext = () => {
    const n = Math.max(upto, first);
    play(holds(n, p.b) ? 'key' : 'pick');
    setUpto(n + 1);
    setTaps(taps + 1);
    if (stage === 'confirm' && taps + 1 >= handNext && n + 1 < from + 100) fill(undefined, n + 1);
  };
  const fill = (then, start = Math.max(upto, first)) => {
    let n = start;
    let tick = 0;
    clearInterval(timer.current);
    timer.current = setInterval(
      () => {
        const was = n;
        n = Math.min(from + 100, n + (FAST() ? 100 : 4));
        // the chart is HEARD while it fills: a tick that climbs, a ring each time a cell lights, a chime when it is full
        play('sweep', tick);
        if (lightsIn(p.b, was, n)) play('spark', tick);
        tick += 1;
        setUpto(n);
        if (n >= from + 100) {
          clearInterval(timer.current);
          play('gate');
          then?.();
        }
      },
      FAST() ? 5 : 45,
    );
  };
  const chooseLens = (id) => {
    play('ui');
    setLens(id);
    setValues([]);
  };
  const toggle = (v) => {
    const off = values.filter((x) => x !== v);
    // « divisible by » names ONE number; « equals » gathers values
    const list = values.includes(v) ? off : link === 'divides' ? [v] : [...values, v].sort((x, y) => x - y);
    const j = judgeClaim(p.b, lens, claimValues(link, lens, list, from), from);
    play(j.intruders.length ? 'fail' : 'pick');
    if (j.intruders.length && !failed.includes(lens)) setFailed([...failed, lens]);
    setValues(list);
  };
  const turnTo = (start, then) => {
    setFrom(start);
    setUpto(start);
    setTaps(0);
    then?.();
  };
  const seal = () => {
    play('key');
    setStage('confirm');
    turnTo(100);
  };
  const nextPlank = (entry) => {
    const list = [...found, entry];
    setFound(list);
    if (pi + 1 >= spec.planks.length) {
      setStage('sealed');
      return;
    }
    setPi(pi + 1);
    setLens(null);
    setValues([]);
    setFailed([]);
    setStage('test');
    turnTo(0);
  };
  // the gaps he may still test by hand: on the first chart until it is full, on the next hundred his first `handNext`
  const byHand = (stage === 'test' && !full) || (stage === 'confirm' && taps < handNext && !full);
  const tapCell = (n) => {
    if (byHand && n === Math.max(upto, first)) testNext();
  };

  const confirmed = stage === 'confirm' && full;
  // while he tests by hand, the division of each gap is WRITTEN: the last ones stay, the newest first
  const divisions =
    stage === 'test' || (stage === 'confirm' && !full)
      ? Array.from({ length: Math.max(0, Math.min(DIVISIONS, upto - first)) }, (_, i) => upto - 1 - i)
      : [];
  const lensLabel = lens ? T.lens[lens] : '';
  const claimed = (n) => Boolean(lens) && taken.includes(LENSES[lens].of(n));
  const lit = (n) => tested(n) && holds(n, p.b);
  const dark = (n) => tested(n) && !holds(n, p.b);

  return (
    <section className="iq iq--chart" data-iq="chart" data-iq-stage={stage} data-iq-plank={p.b} data-iq-from={from}>
      <div className="iq-panel">
        <div className="iq-lead">
          <span className="iq-count">
            {Math.min(pi + 1, spec.planks.length)} / {spec.planks.length}
          </span>
          <p>
            <MathText>
              {stage === 'sealed'
                ? T.sealed
                : stage === 'test'
                  ? T.lead(p.b)
                  : stage === 'lens'
                    ? lens
                      ? T.valuesAsk(p.b, lensLabel, link)
                      : T.lensAsk(p.b)
                    : confirmed
                      ? T.confirmed(p.b, from)
                      : byHand
                        ? (T.confirmTest ?? INQUIRY_TEXT.confirmTest)(p.b, from, handNext)
                        : T.confirming(p.b, from)}
            </MathText>
          </p>
        </div>

        {stage === 'test' && (
          <>
            <p className="iq-goal" data-iq-goal>
              <span aria-hidden="true">🎯</span>
              {T.goal(p.b)}
            </p>
            <p className="iq-how" data-iq-how>
              {T.how(p.b, taps >= p.manual)}
            </p>
          </>
        )}
        {divisions.length > 0 && (
          <ol className="iq-divs" data-iq-divs>
            {divisions.map((n) => (
              <li key={n} className={`iq-div ${holds(n, p.b) ? 'is-zero' : ''}`} data-iq-div={n} data-iq-rest={n % p.b}>
                <MathText>{`$${divisionTex(n, p.b)}$`}</MathText>
                <span className="iq-div__rest">{T.rest(n % p.b)}</span>
              </li>
            ))}
          </ol>
        )}

        {stage === 'lens' && (
          <>
            {/* his claim, laid as it is read: the lenses in a column, « est égal à », the values in columns (owner, 2026-11-17) */}
            <div className="iq-claim" data-iq-claim>
              <div className="iq-lenses" data-iq-lenses>
                {p.lenses.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`iq-lens ${lens === id ? 'is-on' : ''} ${failed.includes(id) ? 'is-failed' : ''}`}
                    onClick={() => chooseLens(id)}
                    data-iq-lens={id}
                  >
                    🔍 {T.lens[id]}
                  </button>
                ))}
              </div>
              {lens && (
                <>
                  <span className="iq-equals" data-iq-equals>
                    {T.link[link]}
                  </span>
                  <div className="iq-values" dir="ltr" data-iq-values>
                    {(link === 'divides' ? spec.divisors : LENSES[lens].values(from)).map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`iq-chip ${values.includes(v) ? 'is-on' : ''}`}
                        onClick={() => toggle(v)}
                        data-iq-value={v}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {lens && values.length > 0 && (
              <p className={`iq-fact ${judge.ok ? 'is-ok' : ''}`} data-iq-fact data-iq-ok={judge.ok ? '1' : '0'}>
                {judge.ok ? T.claimOk(p.b) : T.claim(judge.orphans.length, judge.intruders.length)}
              </p>
            )}
          </>
        )}

        <div className="iq-actions">
          {byHand && (
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={testNext}
              data-iq-test={Math.max(upto, first)}
            >
              {T.testBtn(Math.max(upto, first))}
            </button>
          )}
          {stage === 'test' && !full && taps >= p.manual && (
            <button type="button" className="rf-btn" onClick={() => fill()} data-iq-fill>
              {T.fill}
            </button>
          )}
          {stage === 'test' && full && (
            <button type="button" className="rf-btn rf-btn--main" onClick={() => setStage('lens')} data-iq-look>
              {T.look}
            </button>
          )}
          {stage === 'lens' && judge?.ok && (
            <button type="button" className="rf-btn rf-btn--main" onClick={seal} data-iq-seal>
              {T.seal(p.b)}
            </button>
          )}
          {confirmed && (
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={() => nextPlank({ b: p.b, lens, values, link, line: T.foundLine(p.b, lensLabel, values, link) })}
              data-iq-next
            >
              {pi + 1 >= spec.planks.length ? T.last : T.next}
            </button>
          )}
          {stage === 'sealed' && (
            <button
              type="button"
              className="rf-btn rf-btn--main"
              onClick={() => onDone({ readings: found })}
              data-iq-done
            >
              {T.done}
            </button>
          )}
        </div>

        {found.length > 0 && (
          <ul className="iq-found" data-iq-found>
            {found.map((f) => (
              <li key={f.b}>{f.line}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="iq-board">
        <p className="iq-board__title">{T.board(p.b, from)}</p>
        <div className="iq-chart" dir="ltr" data-iq-chart>
          {from === 0 && <span className="iq-cell iq-cell--none" />}
          {cells.map((n) => {
            const c = claimed(n) && stage === 'lens';
            const cls = lit(n) ? 'is-lit' : dark(n) ? 'is-dark' : '';
            const mark = c ? (holds(n, p.b) ? 'is-claimed' : 'is-intruder') : '';
            // on the next hundred his claim is outlined on every gap already tested (by him, then by the world)
            const kept = stage === 'confirm' && tested(n) && claimed(n);
            return (
              <button
                key={n}
                type="button"
                className={`iq-cell ${cls} ${mark} ${kept ? 'is-claimed' : ''} ${n === Math.max(upto, first) && byHand ? 'is-next' : ''}`}
                onClick={() => tapCell(n)}
                data-iq-cell={n}
                data-iq-lit={lit(n) ? '1' : dark(n) ? '0' : ''}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Inquiry({ spec, game, onDone }) {
  const play = (name, p) => game?.audio?.play(name, p);
  const Kind = {
    pairs: Pairs,
    chart: Chart,
    turn: Turn,
    cut: Cut,
    join: Join,
    stack: Stack,
    peel: Peel,
    letters: Letters,
    groups: Groups,
    rebuild: Rebuild,
    estimate: Estimate,
    bracket: Bracket,
    common: Common,
    ladder: Ladder,
    nest: Nest,
    cycle: Cycle,
    summit: Summit,
    deal: Deal,
    lists: Lists,
    sort: Sort,
    measure: Measure,
    part: Part,
    sheet: Sheet,
  }[spec.kind];
  return <Kind spec={spec} play={play} onDone={onDone} />;
}
