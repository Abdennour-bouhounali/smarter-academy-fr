/**
 * THE CHANTIER — the panel of a walkway segment (`kind: 'walkway'`; `walkwayGame.js › openWalkway` opens it; logic and
 * state machine: `walkway.js`; drawing: `crewLanes.jsx`; contract: GAME_WORLD.md « A segment `walkway` »).
 *
 * He types where the pillar stands (« Le pilier à □ cases du bord » — the story's words), plants it (Enter or the
 * button; ←/→ nudge it by 1, Shift by 10) and sees it stand on the drawn water at once; then « Les équipes posent »: lane
 * A then lane B, plank by plank, in at most 2 s whatever the count. The facts — one per lane, then the verdict — are the
 * story's sentences, written from what the crews did, never « faux ». « Reprendre le pilier » takes it back at any
 * moment; ✕ and Escape close the panel. With `bench` (an inquiry spec): « Le tableur » opens it over the panel, and
 * the bench's kept card stands under the box (`Workshop.jsx › benchKeptLines`).
 *
 * `PillarPanel` is the pure view (the box, the buttons, the lanes, the facts) — the investigation `crews` mode `story`
 * mounts it too, with its own reducer. Words: `W` = the story's `text.walkway` (or the inquiry's `text.pillar`); this
 * file writes no French of its own. Hooks: `data-di-walkway`, `data-di-in="pillar"`, `data-di-plant`, `data-di-lay`,
 * `data-di-take`, `data-di-lane` (+ `data-di-planks`, `data-di-short`), `data-di-walkway-verdict`, `data-di-purse`,
 * `data-di-walkway-fact`, `data-di-walkway-error`, `data-di-bench-open`; `window.__walkway` (dev).
 */
import { useEffect, useReducer, useRef } from 'react';
import { NotebookPen } from 'lucide-react';
import MathText from '../../components/MathText';
import { Card, Num } from '../kit/parts';
import { boxMax, initWalkway, scaleOf, shownPerLane, triesFrom, walkwayReducer } from './walkway';
import { PlankLanes } from './crewLanes';
import { FAST } from './inquiryParts';
import Workshop, { benchKeptLines } from './Workshop';
import './chantier.css';

/** The sentences under the lanes once they are laid: one per lane, then the verdict (`W.shore` alone when d = 0). */
export function factsOf(W, t, purse = null) {
  if (!t) return [];
  if (t.verdict === 'shore') return [W.shore];
  return [...t.lanes.map((l, i) => W.lane(l, i, t)), W.verdict(t, purse)];
}

/** The key gestures of the box: ←/→ nudge by 1 (Shift: 10), Enter plants. */
const onKeys = (act) => (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    act.nudge((e.key === 'ArrowLeft' ? -1 : 1) * (e.shiftKey ? 10 : 1));
  }
};

/**
 * The panel's body: `seg` = { crews, ruler, scale, ticks? }; `state` = the walkway reducer's; `act` = { type, nudge,
 * plant, lay, take }; `purse` = { of, left } or null (shown as the chip `W.purse(left, of)`); `extra` = what stands under
 * the box (the bench's card); `aside` = buttons beside « Les équipes posent » (the bench); `g` = the lanes' geometry
 * (`crewLanes.jsx › PANEL` by default).
 */
export function PillarPanel({ W, seg, state: s, act, purse = null, extra = null, aside = null, g = undefined }) {
  const t = s.now;
  const laid = s.stage === 'laid';
  const scale = scaleOf({ scale: seg.scale, ruler: seg.ruler, crews: seg.crews, d: s.d, ticks: seg.ticks });
  const lanes = t ? t.lanes : seg.crews.map((b) => ({ b, planks: 0, short: s.d ?? 0, ends: false }));
  const shown = t ? shownPerLane(t, s.shown) : seg.crews.map(() => 0);
  const facts = laid ? factsOf(W, t, purse) : [];
  const max = boxMax(seg);
  const submit = (e) => {
    e.preventDefault();
    if (s.stage === 'place') act.plant();
  };
  return (
    <div
      className="ch-panel"
      data-di-stage={s.stage}
      data-iq-stage={s.stage}
      {...(laid ? { 'data-di-walkway-verdict': t.verdict } : {})}
    >
      <div className="ch-top">
        <form className="ch-box" onSubmit={submit}>
          <div className="ch-template">
            <span>{W.before}</span>
            <Num
              value={s.text}
              onChange={act.type}
              w={String(max).length}
              disabled={s.stage !== 'place'}
              onKeyDown={onKeys(act)}
              aria-label={W.boxLabel ?? W.before}
              data-di-in="pillar"
              data-iq-in="pillar"
            />
            <span>{W.after}</span>
          </div>
          {s.error && (
            <p className="ch-error" data-di-walkway-error={s.error}>
              {s.error === 'range' ? W.error.range(max) : W.error[s.error]}
            </p>
          )}
          {extra}
          <div className="ch-buttons">
            {s.stage === 'place' && (
              <button type="submit" className="di-btn di-btn--primary" data-di-plant data-iq-plant>
                {W.plant}
              </button>
            )}
            {s.stage === 'planted' && (
              <button type="button" className="di-btn di-btn--primary" onClick={act.lay} data-di-lay data-iq-lay>
                {W.lay}
              </button>
            )}
            {s.stage !== 'place' && (
              <button
                type="button"
                className="di-btn"
                onClick={act.take}
                disabled={s.stage === 'laying'}
                data-di-take
                data-iq-take
              >
                {W.take}
              </button>
            )}
            {aside}
          </div>
        </form>
        <div className="ch-facts" data-di-walkway-fact={facts.length} data-iq-fact>
          {purse && (
            <p className="ch-purse" data-di-purse={purse.left}>
              {W.purse(purse.left, purse.of)}
            </p>
          )}
          {facts.map((f, i) => (
            <p key={i} className={i === facts.length - 1 && t.paid ? 'is-ok' : ''}>
              <MathText>{f}</MathText>
            </p>
          ))}
        </div>
      </div>
      <PlankLanes
        lanes={lanes}
        scale={scale}
        d={s.stage === 'place' ? null : s.d}
        shown={t ? shown : lanes.map(() => 0)}
        labels={W}
        g={g}
      />
    </div>
  );
}

/** The laying, beat by beat: ≤ 40 beats in ≤ 2 s, a `plank` sound per beat. */
export function useLaying(state, dispatch, play) {
  useEffect(() => {
    if (state.stage !== 'laying') return undefined;
    const tm = setTimeout(
      () => {
        play?.('plank', state.shown);
        dispatch({ type: 'tick' });
      },
      FAST() ? 10 : 50,
    );
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per beat of the laying
  }, [state.stage, state.shown]);
}

/** The overlay of the walkway segment: the instruction, the panel, the bench when open. `o` = the overlay. */
function Panel({ o, game }) {
  const W = game.T.walkway;
  const seg = game.segs[o.seg];
  const purse = game.walkwayPurse(seg);
  const cfg = { crews: seg.crews, max: boxMax(seg), purse: purse ? purse.left : null };
  const [state, dispatch] = useReducer(
    (s, a) => walkwayReducer(cfg, s, a),
    null,
    () => initWalkway({ tries: triesFrom(seg.crews, game.walkwayTries(seg)) }),
  );
  const told = useRef(state.tries.length);
  useLaying(state, dispatch, (n, p) => game.audio?.play(n, p));
  // a try laid is the world's: logged, paid or given back (`walkwayGame.js › walkwayLaid`)
  useEffect(() => {
    if (state.tries.length > told.current) {
      told.current = state.tries.length;
      game.walkwayLaid(seg, state.tries[state.tries.length - 1]);
    }
  }, [state.tries, game, seg]);
  useEffect(() => {
    const esc = (e) => {
      if (e.key === 'Escape') game.closeWalkway();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [game]);
  if (import.meta.env.DEV && typeof window !== 'undefined')
    window.__walkway = { seg: seg.id, stage: state.stage, d: state.d, tries: state.tries.length, last: state.now };
  const act = {
    type: (text) => dispatch({ type: 'type', text }),
    nudge: (by) => dispatch({ type: 'nudge', by }),
    plant: () => {
      game.audio?.play('ui');
      dispatch({ type: 'plant' });
    },
    lay: () => dispatch({ type: 'lay' }),
    take: () => dispatch({ type: 'take' }),
  };
  const kept = o.bench ? benchKeptLines(o, game) : [];
  return (
    <Card wide>
      <div className="ch-root" data-di-walkway={seg.id}>
        <p className="di-card__eyebrow">{W.title}</p>
        {W.instruction && (
          <p className="ch-instruction">
            <MathText>{typeof W.instruction === 'function' ? W.instruction(seg) : W.instruction}</MathText>
          </p>
        )}
        <PillarPanel
          W={W}
          seg={seg}
          state={state}
          act={act}
          purse={purse}
          extra={
            kept.length ? (
              <div className="ch-kept" data-di-bench-kept={kept.length}>
                {kept.map((l, i) => (
                  <p key={i}>
                    <MathText>{l}</MathText>
                  </p>
                ))}
              </div>
            ) : null
          }
          aside={
            o.bench ? (
              <button
                type="button"
                className="di-btn"
                onClick={() => game.openBench()}
                data-di-bench-open={game.benchKept?.(o.seg) ? 'kept' : 'new'}
              >
                <NotebookPen size={18} aria-hidden="true" /> {W.bench}
              </button>
            ) : null
          }
        />
      </div>
    </Card>
  );
}

/** The walkway's overlay: its bench when open (the workshop's bench frame, words `W.bench*`), else the panel. */
export default function Chantier({ o, game }) {
  if (o.benchOpen && o.bench) return <Workshop o={o} game={benchGame(game)} />;
  return <Panel o={o} game={game} />;
}

/**
 * The workshop's bench frame reads its words from `T.workshop` (`bench`, `benchSub`, `benchBack`) and closes through
 * `closeBench`: the walkway lends it its own words (`W.bench`, `W.benchSub`, `W.benchBack`) — the story's.
 */
function benchGame(game) {
  const W = game.T.walkway;
  const T = {
    ...game.T,
    workshop: { ...game.T.workshop, bench: W.bench, benchSub: W.benchSub, benchBack: W.benchBack },
  };
  return new Proxy(game, { get: (g, k) => (k === 'T' ? T : typeof g[k] === 'function' ? g[k].bind(g) : g[k]) });
}
