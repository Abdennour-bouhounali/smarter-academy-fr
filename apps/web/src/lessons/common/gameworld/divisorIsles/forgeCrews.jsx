/**
 * How a case of a rule forge is drawn when it is about CREWS — not a bridge (`forgeParts.jsx` dispatches here):
 *
 *   c.walk = { crews: [A, B], d }      a pillar at d on a walkway of two crews (lesson 4, keys 1 and 2): the two lanes
 *                                      from one start, the pillar, where each crew stops (the shortfall in amber) — the
 *                                      walkway's own drawing (`crewLanes.jsx › PlankLanes`, geometry `CASE`), its scale
 *                                      fitted to the case (`walkway.js › scaleOf`, `fit`).
 *   a STORY claim                      `{ story, a, b, kind: 'meet' | 'turns', v, who? }` (lesson 4, key 3, `crews` /
 *                                      `story`): the two rhythms a and b as lanes on the case's ruler, the pillar at the
 *                                      meeting the claim names (`meet`: v; `turns`: v × who). A case may give `walk`
 *                                      itself (a `clock` claim must: the kit does not know the story's start).
 *   c.days = { cycles, day, teams? }   teams that work one day then rest (lesson 4, key 4, `crews` / `days`): one row per
 *                                      team, the days run up to `day`, that day outlined (`crewLanes.jsx › DayRows`,
 *                                      `compact`); 31 to 62 days from day 1, or 31 days around a later day.
 *
 * Words: none of its own — a crew is named by `FORGE_TEXT.plank(b)` on a walkway and by its number in a story, a length
 * by `FORGE_TEXT.cells(n)`, a team by its number. Nothing is drawn as a gear. The case's sentence (`c.text`) is written
 * above the drawing, as for a bridge; asked alone before he answers (the drawing would tell him how to read it).
 */
import { formatFr } from '@smarter-academy/core';
import { lay, scaleOf } from './walkway';
import { windowOf } from './crews';
import { CASE, DayRows, PlankLanes } from './crewLanes';
import { FORGE_TEXT as L } from './strings';

const fitsOf = (c) => c.fits ?? c.held;

/** The walkway a case draws: its own `walk`, or the one a story claim names (meet / turns); null when none. */
export function walkOf(c) {
  if (c.walk && Array.isArray(c.walk.crews) && Number.isInteger(c.walk.d)) return c.walk;
  if (!c.story || !Number.isInteger(c.a) || !Number.isInteger(c.b) || !Number.isInteger(c.v)) return null;
  if (c.kind === 'meet') return { crews: [c.a, c.b], d: c.v, story: true };
  if (c.kind === 'turns' && Number.isInteger(c.who)) return { crews: [c.a, c.b], d: c.v * c.who, story: true };
  return null;
}
/** Is this case drawn here (and not as a bridge)? */
export const isCrewCase = (c) => Boolean(walkOf(c) || c.days || c.story);

/** The days a case draws: from day 1 (31 … 62 columns), or a window of 31 around a later day. */
export function daysWindow(day) {
  if (day <= 61) return { from: 1, cols: Math.min(62, Math.max(31, day + 1)) };
  return windowOf(day, 31);
}
const DAYS_ROOM = CASE.W - 60;
const colOf = (cols) => Math.max(6, Math.min(17, Math.floor(DAYS_ROOM / cols)));

function Sentence({ c, alone }) {
  if (!c.text) return null;
  return (
    <p className={`rf-sentence ${alone ? 'rf-sentence--alone' : ''}`} data-rf-sentence>
      « {c.text} »
    </p>
  );
}

const walkLabels = (story) => ({
  crew: (i, b) => (story ? formatFr(b) : L.plank(b)),
  pillar: (d) => L.cells(d),
  short: (n) => L.cells(n),
  band: (n, b) => `${formatFr(n)} × ${formatFr(b)}`,
});

/** The mirror's drawing of a crews case. `stage`: ask (the sentence alone) | build | done. */
export function CrewsMirror({ c, stage, tight = false }) {
  const done = stage === 'done';
  const look = done ? (fitsOf(c) ? 'is-held' : 'is-fell') : '';
  if (stage === 'ask' && c.text) return <Sentence c={c} alone />;
  const w = walkOf(c);
  if (w) {
    const t = lay(w.crews, w.d, null);
    const scale = scaleOf({ scale: 'fit', crews: w.crews, d: w.d, width: CASE.W - 60 });
    return (
      <>
        <Sentence c={c} />
        <PlankLanes
          lanes={t.lanes}
          scale={scale}
          d={w.d}
          labels={walkLabels(w.story)}
          g={CASE}
          hook="data-rf-lane"
          className={`cl-lanes rf-bridge rf-walk is-${stage} ${look} ${c.text ? 'has-sentence' : ''} ${tight ? 'is-tight' : ''}`}
        />
      </>
    );
  }
  if (c.days && Array.isArray(c.days.cycles) && Number.isInteger(c.days.day)) {
    const { cycles, day } = c.days;
    const win = daysWindow(day);
    const names = c.days.teams ?? c.teams ?? cycles.map((_, i) => i + 1);
    return (
      <>
        <Sentence c={c} />
        <DayRows
          teams={cycles.map((cycle) => ({ cycle }))}
          from={win.from}
          cols={win.cols}
          colW={colOf(win.cols)}
          upto={day}
          day={day}
          outline={cycles.map((_, i) => i)}
          labels={{ team: (i) => String(names[i]), since: String, before: () => '…' }}
          compact
          className={`cl-days rf-bridge rf-days is-${stage} ${look} ${c.text ? 'has-sentence' : ''}`}
        />
      </>
    );
  }
  // a story claim the kit cannot place (a clock time without `walk`): its sentence alone, never an empty bridge
  return <Sentence c={c} />;
}

/** The small drawing of the case's line: the lanes (planks, the shortfall), or the rows of the days. */
export function CrewsMini({ c }) {
  const W = 150;
  const w = walkOf(c);
  if (w) {
    const t = lay(w.crews, w.d, null);
    const u = W / Math.max(w.d, ...w.crews, 1);
    return (
      <svg viewBox={`0 0 ${W} 14`} className="rf-mini rf-mini--pair" aria-hidden="true">
        {t.lanes.map((l, j) => (
          <g key={j}>
            {l.planks > 0 && (
              <rect
                x="0.25"
                y={j ? 7.5 : 0.5}
                width={Math.max(0.6, l.planks * l.b * u - 0.5)}
                height="6"
                rx="1.5"
                className={l.ends && w.d > 0 ? 'is-held' : ''}
              />
            )}
            {l.short > 0 && (
              <rect
                x={l.planks * l.b * u + 0.25}
                y={j ? 7.5 : 0.5}
                width={Math.max(0.6, l.short * u - 0.5)}
                height="6"
                rx="1.5"
                className="is-left"
              />
            )}
          </g>
        ))}
      </svg>
    );
  }
  if (c.days && Array.isArray(c.days.cycles)) {
    const { cycles, day } = c.days;
    const win = daysWindow(day);
    const u = W / win.cols;
    const h = 14 / cycles.length;
    return (
      <svg viewBox={`0 0 ${W} 14`} className="rf-mini" aria-hidden="true">
        {cycles.map((cy, i) =>
          Array.from({ length: win.cols }, (_, k) => win.from + k)
            .filter((d) => d <= day && (d - 1) % cy === 0)
            .map((d) => (
              <rect
                key={`${i}-${d}`}
                x={(d - win.from) * u}
                y={i * h + 0.3}
                width={Math.max(0.6, u - 0.4)}
                height={Math.max(0.6, h - 0.6)}
                className={d === day && fitsOf(c) ? 'is-held' : ''}
              />
            )),
        )}
      </svg>
    );
  }
  return null;
}

/** The beats of the build (one sound each): the planks laid, at most 40; one for the days. */
export function crewsBeats(c) {
  const w = walkOf(c);
  if (!w) return 1;
  return Math.max(1, Math.min(40, lay(w.crews, w.d, null).cost));
}
