/**
 * THE CREWS' LANES — one drawing shared by the walkway's panel (`Chantier.jsx`), the investigation `crews`
 * (`InquiryCrews.jsx`) and the final mission's window (`Mission.jsx`). Pure views of what `walkway.js` and `crews.js`
 * compute; inline SVG drawn at 1 : 1 (its width IS its viewBox's), so a font size here is its size on screen.
 *
 *   PlankLanes   two to five lanes from ONE start (0 at the left): each crew's planks laid one after another, the joints
 *                as ticks, the shortfall in amber with its length, the pillar a brand-blue post with its distance under it;
 *                a lane too dense to draw plank by plank is ONE band with its count printed.
 *   DayRows      one row per team on a day axis (0 days since the start at the left): a day the team works is lit brand
 *                blue with a hammer, a day it rests is grey with a moon, and under each lit cell the days since the start.
 *
 * Every word comes from `labels` (the lesson's or the story's — plain strings: they go into SVG text). Nothing is drawn as
 * a gear.
 */
import { formatFr } from '@smarter-academy/core';
import { laneDrawing, RULER_PX } from './walkway';
import { worksOn } from './crews';
import './crewLanes.css';

export const LANES_W = RULER_PX + 60; // the water and a margin of 30 px each side
const X0 = 30;
/**
 * The geometry of the drawing: `PANEL` for the walkway's panel and the investigation (1 160 px at 1 : 1), `CASE` for a
 * case of a rule forge (`forgeParts.jsx`: 720 units wide, drawn in the mirror's box of 10,6 rem — about 0,9 : 1, so its
 * 18 px text stays above 12 px). `block` = a lane, its crew's name above it, room under it for a shortfall's label;
 * `foot` = the pillar's distance under the lanes.
 */
export const PANEL = { W: LANES_W, ruler: 40, laneH: 44, block: 90, foot: 34, nameY: 17, laneY: 22, below: 24 };
/**
 * The investigation `crews` mode `story` (`InquiryCrews.jsx`): the panel's width with tighter lanes, so the story card,
 * the translation, the box, the facts and the lanes stand in the mirror's frame at 1366 × 768 (text stays 18 px).
 */
export const STORY_LANES = { W: LANES_W, ruler: 34, laneH: 34, block: 80, foot: 30, nameY: 16, laneY: 20, below: 22 };
export const CASE = { W: 720, ruler: 30, laneH: 24, block: 68, foot: 28, nameY: 15, laneY: 19, below: 22 };

/** The height of the lanes' drawing for n lanes. */
export const lanesHeight = (n, g = PANEL) => g.ruler + n * g.block + g.foot;

/** About the width of an 18 px bold label (px): what the shortfall's and the crews' labels need. */
export const labelWidth = (text) => String(text).length * 10.5;
const SIDE_GAP = 10;
/** Where the pillar's distance is written under the lanes: under the post, kept inside the drawing. */
const postLabelX = (postX, g) => Math.min(Math.max(postX, X0 + 40), g.W - 40);
/**
 * Where a lane's shortfall label goes: `'0'` inside its amber (wide enough), else `'side'` — in the empty water just
 * past the pillar, inside the lane — or, when the water past the pillar is too short for it, `'1'`: under the lane,
 * ending LEFT of the pillar. Never under the pillar's line, never on the next lane's name nor on the pillar's distance
 * (walk and gate B 2026-11-26: « 19 cases » on « Équipe B … », « 4 ca|ses » glued over « 64 cases »).
 */
function shortPlace(lanes, i, draw, labels, scale, g = PANEL) {
  if (!draw.labelBelow) return '0';
  const w = labelWidth(labels.short(lanes[i].short));
  const sideEnd = X0 + draw.shortAt + draw.shortPx + SIDE_GAP + w;
  return sideEnd <= Math.min(g.W, X0 + scale.max * scale.px) ? 'side' : '1';
}

/** The ruler of the water: its labels (in cases), its small ticks. */
function Ruler({ scale, g }) {
  const x = (v) => X0 + v * scale.px;
  return (
    <g className="cl-ruler" aria-hidden="true">
      <line x1={X0} x2={X0 + scale.max * scale.px} y1={g.ruler - 6} y2={g.ruler - 6} />
      {scale.minor.map((v) => (
        <line key={`m${v}`} x1={x(v)} x2={x(v)} y1={g.ruler - 10} y2={g.ruler - 6} />
      ))}
      {scale.labels.map((v) => (
        <g key={`l${v}`}>
          <line x1={x(v)} x2={x(v)} y1={g.ruler - 14} y2={g.ruler - 6} />
          <text x={x(v)} y={g.ruler - 18} textAnchor="middle" className="cl-tick" data-cl-tick={v}>
            {formatFr(v)}
          </text>
        </g>
      ))}
    </g>
  );
}

/**
 * The lanes. `lanes`: [{ b, planks, short, ends }] (`walkway.js › laneOf`); `shown[i]`: the planks of lane i drawn so far
 * (all by default); `d`: the pillar (null: not planted); `labels`: { crew(i, b), pillar(d), short(n), band(planks, b) }.
 * The shortfall shows once its lane is laid; a lane of 0 planks shows its whole shortfall from the shore.
 */
export function PlankLanes({
  lanes,
  scale,
  d = null,
  shown = null,
  labels,
  hook = 'data-di-lane',
  g = PANEL,
  className = 'cl-lanes',
}) {
  const H = lanesHeight(lanes.length, g);
  const px = scale.px;
  const postX = d == null ? null : X0 + d * px;
  return (
    <svg
      className={className}
      width={g.W}
      height={H}
      viewBox={`0 0 ${g.W} ${H}`}
      role="img"
      data-cl-px={Math.round(px * 1000) / 1000}
    >
      <Ruler scale={scale} g={g} />
      {lanes.map((lane, i) => {
        const top = g.ruler + i * g.block;
        const y = top + g.laneY;
        const draw = laneDrawing(lane, px);
        const k = shown ? shown[i] : lane.planks;
        const done = k >= lane.planks;
        const name = String.fromCharCode(65 + i);
        const place = shortPlace(lanes, i, draw, labels, scale, g);
        return (
          <g
            key={i}
            className="cl-lane"
            {...{ [hook]: name }}
            data-di-planks={done ? lane.planks : k}
            {...(done && d != null ? { 'data-di-short': lane.short } : {})}
          >
            <rect x={X0} y={y} width={scale.max * px} height={g.laneH} className="cl-water" />
            {draw.band
              ? k > 0 && (
                  <g className="cl-band">
                    <rect x={X0} y={y} width={(draw.laid * k) / lane.planks} height={g.laneH} rx={4} />
                    {done && (
                      <text
                        x={X0 + draw.laid / 2}
                        y={y + g.laneH / 2 + 6}
                        textAnchor="middle"
                        className="cl-band__count"
                      >
                        {labels.band(lane.planks, lane.b)}
                      </text>
                    )}
                  </g>
                )
              : draw.planks
                  .slice(0, k)
                  .map((at) => (
                    <rect
                      key={at}
                      x={X0 + at}
                      y={y}
                      width={draw.plankPx}
                      height={g.laneH}
                      rx={Math.min(4, draw.plankPx / 4)}
                      className="cl-plank"
                    />
                  ))}
            {done && d != null && lane.short > 0 && (
              <g className="cl-short" data-cl-short-below={place}>
                <rect x={X0 + draw.shortAt} y={y} width={draw.shortPx} height={g.laneH} />
                {place === 'side' ? (
                  <text x={X0 + draw.shortAt + draw.shortPx + SIDE_GAP} y={y + g.laneH / 2 + 6} textAnchor="start">
                    {labels.short(lane.short)}
                  </text>
                ) : draw.labelBelow ? (
                  <>
                    <line
                      x1={X0 + draw.shortAt + draw.shortPx / 2}
                      x2={X0 + draw.shortAt + draw.shortPx / 2}
                      y1={y + g.laneH}
                      y2={y + g.laneH + 8}
                    />
                    <text x={X0 + draw.shortAt + draw.shortPx - SIDE_GAP} y={y + g.laneH + g.below} textAnchor="end">
                      {labels.short(lane.short)}
                    </text>
                  </>
                ) : (
                  <text x={X0 + draw.shortAt + draw.shortPx / 2} y={y + g.laneH / 2 + 6} textAnchor="middle">
                    {labels.short(lane.short)}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
      {postX != null && (
        <g className="cl-post" data-di-post={d}>
          <rect x={postX - 3} y={g.ruler - 4} width={6} height={H - g.ruler - g.foot + 6} rx={2} />
          <text x={postLabelX(postX, g)} y={H - 10} textAnchor="middle">
            {labels.pillar(d)}
          </text>
        </g>
      )}
      {/* the crews' names last, on a halo of the panel's colour: the pillar's line passes behind them (gate B 2026-11-26) */}
      <g className="cl-names">
        {lanes.map((lane, i) => (
          <text key={i} x={X0} y={g.ruler + i * g.block + g.nameY} className="cl-crew" data-cl-crew={i}>
            {labels.crew(i, lane.b)}
          </text>
        ))}
      </g>
    </svg>
  );
}

// ───────────────────────────── the days ─────────────────────────────

const TEAM_COL = 110;
const DAY_HEAD = 30;
const ROW_H = 60;
/** The room of the day columns in the mirror's frame (1 180 px less the team column). */
const DAYS_ROOM = 1180 - TEAM_COL;
/** The day columns' width: 17 px while 62 columns fit, narrower when more (never under 12). */
export const dayCol = (days, room = DAYS_ROOM) => Math.max(12, Math.min(17, Math.floor(room / days)));
/** A case of a rule forge (`forgeParts.jsx`): rows of 32, a team column of 60, no « days since » under the cells. */
const COMPACT = { team: 60, row: 32 };
const geomOf = (compact) => (compact ? COMPACT : { team: TEAM_COL, row: ROW_H });
export const rowsWidth = (cols, colW, compact = false) => geomOf(compact).team + cols * colW;
const rowsHeight = (n, compact = false) => DAY_HEAD + n * geomOf(compact).row;

/**
 * The gold outline of the asked day: as wide as the numbers it holds (its head « 1 361 », its « days since » « 2 128 »)
 * — never across one (gate B 2026-11-26) — and, when some rows are asked (`outline`), over THOSE rows only: a team not
 * asked yet is not outlined on that day (forge 4, team 5 before its stage).
 */
export function todayBox({ day, x, colW, H, ROW, teams, outline = [], labels, compact = false }) {
  const texts = [formatFr(day), ...(compact || !labels?.since ? [] : [labels.since(day - 1)])];
  const w = Math.max(colW, ...texts.map((t) => labelWidth(t) + 8));
  const mid = x(day) + colW / 2;
  const some = outline.length > 0 && outline.length < teams.length;
  const lo = some ? Math.min(...outline) : 0;
  const hi = some ? Math.max(...outline) : teams.length - 1;
  const y = some ? DAY_HEAD + lo * ROW + 1 : 2;
  const bottom = some ? DAY_HEAD + (hi + 1) * ROW - 1 : H - 2;
  return { x: mid - w / 2, y, width: w, height: bottom - y };
}

/** The two glyphs, drawn once (`<symbol>`) and used in every cell: a hammer (a day of work), a moon (a day of rest). */
function Glyphs() {
  return (
    <defs>
      <symbol id="cl-hammer" viewBox="0 0 14 14">
        <rect x="2" y="1.5" width="9" height="4" rx="1" />
        <rect x="5.6" y="5" width="2.2" height="8" rx="1" />
      </symbol>
      <symbol id="cl-moon" viewBox="0 0 14 14">
        <path d="M9.5 1.5a5.5 5.5 0 1 0 3 9.6A4.6 4.6 0 0 1 9.5 1.5z" />
      </symbol>
    </defs>
  );
}

/**
 * The rows. `teams`: [{ cycle }] (a team works on day d when d − 1 is a multiple of its cycle — `crews.js › worksOn`);
 * `from` … `from + cols − 1` the days drawn; `upto` the last day run (later columns stay dark); `outline`: the indexes of
 * the rows the question asks about; `day`: the column outlined (the day now, or the day typed); `labels`:
 * { team(i), since(n), before? (the left mark when the window does not start on day 1) }; `rowsLit`: while a day is run
 * team by team, how many rows already show it; `compact`: a forge's case (rows of 32, no « days since », a glyph only
 * when a column is at least 14 px).
 */
export function DayRows({
  teams,
  from = 1,
  cols,
  upto,
  colW = dayCol(cols),
  outline = [],
  day = null,
  labels,
  rowsLit = null,
  compact = false,
  className = 'cl-days',
}) {
  const { team: TEAM, row: ROW } = geomOf(compact);
  const W = rowsWidth(cols, colW, compact);
  const H = rowsHeight(teams.length, compact);
  const x = (d) => TEAM + (d - from) * colW;
  const glyphs = colW >= 14;
  const days = Array.from({ length: cols }, (_, k) => from + k);
  return (
    <svg
      className={className}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      data-cl-from={from}
      data-cl-cols={cols}
      data-cl-col={colW}
    >
      <Glyphs />
      {from > 1 && labels.before && (
        <text x={TEAM - 8} y={DAY_HEAD - 10} textAnchor="end" className="cl-dayhead" data-cl-before>
          {labels.before(from)}
        </text>
      )}
      {days
        .filter((d) => (d - 1) % 5 === 0)
        // a head that would touch the elided days' label at the left (« … 1 345 jours » / « 1 346 ») is left out
        .filter((d) => !(from > 1 && labels.before) || x(d) + colW / 2 - labelWidth(formatFr(d)) / 2 >= TEAM + 4)
        .map((d) => (
          <text key={`h${d}`} x={x(d) + colW / 2} y={DAY_HEAD - 10} textAnchor="middle" className="cl-dayhead">
            {formatFr(d)}
          </text>
        ))}
      {teams.map((t, i) => {
        const top = DAY_HEAD + i * ROW;
        // the day being run lights team after team: the rows past `rowsLit` still show the day before
        const last = rowsLit != null && i >= rowsLit ? upto - 1 : upto;
        return (
          <g
            key={i}
            className={`cl-row ${outline.includes(i) ? 'is-asked' : ''}`}
            data-iq-row={i + 1}
            data-iq-asked={outline.includes(i) ? '1' : '0'}
          >
            <text x={8} y={top + 22} className="cl-team">
              {labels.team(i)}
            </text>
            {days.map((d) => {
              if (d > last)
                return <rect key={d} x={x(d) + 1} y={top + 4} width={colW - 2} height={26} className="cl-dark" />;
              const on = worksOn(t.cycle, d);
              return (
                <g key={d} data-iq-cell={`${i + 1}:${d}`} data-iq-on={on ? '1' : '0'}>
                  <rect
                    x={x(d) + 1}
                    y={top + 4}
                    width={colW - 2}
                    height={26}
                    rx={3}
                    className={on ? 'cl-on' : 'cl-off'}
                  />
                  {glyphs && (
                    <use
                      href={on ? '#cl-hammer' : '#cl-moon'}
                      x={x(d) + (colW - 14) / 2}
                      y={top + 10}
                      width={14}
                      height={14}
                      className={on ? 'cl-glyph-on' : 'cl-glyph-off'}
                    />
                  )}
                  {on && !compact && (
                    <text x={x(d) + colW / 2} y={top + 52} textAnchor="middle" className="cl-since">
                      {labels.since(d - 1)}
                    </text>
                  )}
                </g>
              );
            })}
            {outline.includes(i) && (
              <rect x={TEAM - 2} y={top + 1} width={cols * colW + 4} height={ROW - 2} rx={6} className="cl-ask" />
            )}
          </g>
        );
      })}
      {day != null && day >= from && day < from + cols && (
        <rect
          {...todayBox({ day, x, colW, H, ROW, teams, outline, labels, compact })}
          rx={4}
          className="cl-today"
          data-cl-day={day}
        />
      )}
    </svg>
  );
}
