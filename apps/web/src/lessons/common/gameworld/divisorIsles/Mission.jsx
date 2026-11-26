/**
 * THE FINAL MISSION of « L’archipel des diviseurs » — `story.mission`, ported from `rootCourts` (its `Mission` card):
 * the lead, the kit's `UseLines` boxes, « check » and « later »; a wrong answer gets the story's FACT (`check(values)`),
 * never the answer. Opened on the mission's island (`mission.at`, default the LAST — `walkwayGame.js › openMission`).
 *
 * Three things more than rootCourts':
 *   write    `mission.write = { calc, p, q }`: the answer is a FRACTION — without `lines`, one fraction box (slots `p`
 *            over `q`, `plaque.js › plaqueLines`); the story's `check(values, writing)` gets what it IS
 *            (`plaque.js › writingOf`) and writes the refusal, with no number. `plaques` = `posters`, and
 *            `text.plaques(left, of)` = `text.posters`.
 *   posters  `mission.posters` (a whole number): each wrong answer spends a poster of the run; the chip shows what is
 *            left (`text.posters(left, of)`); when none is left the run is over (`text.spent`), the boxes close and only
 *            « later » remains — the next opening starts a new run, or with `refill: { at }` the walk back to that
 *            island does (`walkwayGame.js › stepMission`).
 *   window   `mission.window = { cycles, day(values) → the day typed, labels }`: under the answer, the rows of the
 *            teams on a window of 31 days around that day (`crewLanes.jsx › DayRows`, 34 px a day), run from the
 *            window's first day to the typed one; the fact shows when the run reaches it.
 *
 * Words: `mission.text` (the story's): { check, later, posters?, spent? }. Hooks: `data-di-mission`,
 * `data-di-mission-lines` (its boxes: `data-rf-use=<slot>`), `data-di-mission-check`, `data-di-mission-later`,
 * `data-di-mission-fact`, `data-di-posters`, `data-di-mission-over`, `data-di-window`.
 */
import { useEffect, useMemo, useState } from 'react';
import MathText from '../../components/MathText';
import { Card } from '../kit/parts';
import { UseLines } from '../kit/RuleForge';
import { boxesOf } from '../kit/authoring/forgeBlocks';
import { DayRows } from './crewLanes';
import { windowOf } from './crews';
import { plaqueLines } from './plaque';
import { FAST } from './inquiryParts';
import './mission.css';

const WINDOW = 31;
const WINDOW_COL = 34;

/** The window's run: from its first day to the typed one, in about 1,5 s. */
function useRun(target, from) {
  const [upto, setUpto] = useState(target == null ? null : from);
  useEffect(() => {
    if (target == null) return undefined;
    setUpto(from);
    const n = Math.max(1, target - from);
    const beat = FAST() ? 5 : Math.max(30, Math.round(1500 / n));
    let d = from;
    const tm = setInterval(() => {
      d += 1;
      setUpto(d);
      if (d >= target) clearInterval(tm);
    }, beat);
    return () => clearInterval(tm);
  }, [target, from]);
  return upto;
}

/** The pure view: `m` the mission, `vals` the boxes, `out` the last answer ({ fact, posters, over, day }), `upto`. */
export function MissionView({ m, posters, vals, onType, out, upto, onCheck, onLater }) {
  const T = m.text ?? {};
  const lines = useMemo(() => (m.lines ? m.lines() : plaqueLines()), [m]);
  const names = lines.flatMap((l) => boxesOf(l.tokens).map((t) => t.slot));
  const filled = names.every((n) => (vals[n] ?? '') !== '');
  const over = Boolean(out?.over);
  const win = m.window && out?.day != null ? windowOf(out.day, WINDOW) : null;
  const ran = !win || (upto != null && upto >= out.day);
  // the plaque (`write`, no `lines`): a narrower card under the story's mission card, the fraction box centred, the
  // plaques' chip beside the buttons (mission.css › .mi-root--plaque)
  const plaque = !m.lines;
  const chip = posters && (T.posters ?? T.plaques) && (
    <p className="mi-posters" data-di-posters={posters.left}>
      {(T.posters ?? T.plaques)(posters.left, posters.of)}
    </p>
  );
  return (
    <div className={`mi-root ${plaque ? 'mi-root--plaque' : ''}`} data-di-mission={over ? 'over' : 'open'}>
      <p className="di-card__eyebrow">{m.title}</p>
      {m.lead.map((l) => (
        <p key={l} className="mi-lead">
          <MathText>{l}</MathText>
        </p>
      ))}
      <div className="mi-answer">
        <div className="mi-lines" data-di-mission-lines>
          {!over && <UseLines lines={lines} vals={vals} onType={(name, value) => onType({ ...vals, [name]: value })} />}
        </div>
        {!plaque && chip}
      </div>
      {win && (
        <div className="mi-window" data-di-window={`${win.from}:${out.day}`}>
          <DayRows
            teams={m.window.cycles.map((cycle) => ({ cycle }))}
            from={win.from}
            cols={win.cols}
            colW={WINDOW_COL}
            upto={upto ?? win.from - 1}
            day={out.day}
            labels={m.window.labels}
          />
        </div>
      )}
      {out?.fact && ran && (
        <p className="mi-fact" data-di-mission-fact>
          <MathText>{out.fact}</MathText>
        </p>
      )}
      {over && ran && T.spent && (
        <p className="mi-fact mi-fact--over" data-di-mission-over>
          <MathText>{T.spent}</MathText>
        </p>
      )}
      <div className="mi-go">
        {!over && (
          <button
            type="button"
            className="di-btn di-btn--primary"
            disabled={!filled || !ran}
            onClick={onCheck}
            data-di-mission-check
          >
            {T.check}
          </button>
        )}
        <button type="button" className="di-btn" onClick={onLater} data-di-mission-later>
          {T.later}
        </button>
        {plaque && chip}
      </div>
    </div>
  );
}

export default function Mission({ game }) {
  const m = game.story.mission;
  const [vals, setVals] = useState({});
  const [out, setOut] = useState(null);
  const [posters, setPosters] = useState(() => game.missionPosters());
  const win = m.window && out?.day != null ? windowOf(out.day, WINDOW) : null;
  const upto = useRun(win ? out.day : null, win ? win.from : 0);
  const check = () => {
    const day = m.window ? m.window.day(vals) : null;
    const res = game.missionTry(vals);
    if (res.ok) return;
    setOut({ fact: res.fact, over: Boolean(res.over), day: Number.isInteger(day) && day >= 1 ? day : null });
    if (res.posters) setPosters(res.posters);
  };
  if (import.meta.env.DEV && typeof window !== 'undefined')
    window.__mission = { posters, over: Boolean(out?.over), day: out?.day ?? null, upto };
  return (
    <Card wide>
      <MissionView
        m={m}
        posters={posters}
        vals={vals}
        onType={(v) => {
          setVals(v);
          if (!out?.over) setOut(null);
        }}
        out={out}
        upto={upto}
        onCheck={check}
        onLater={() => game.closeMission()}
      />
    </Card>
  );
}
