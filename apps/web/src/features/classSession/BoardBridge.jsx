/**
 * « حصّة القسم » — the BRIDGE of the board (CLASS_SESSION.md §5ter). The same idea as the student's world, drawn for a
 * projector: light, large, read from the last desk. A gap of `a` cells between two banks; planks of length `b` laid one
 * after the other from the right bank (the class reads from the right). Nothing is left: the bridge holds and the child
 * crosses. Cells are left: they blink, the planks drop into the water — the verdict is what the class SEES, never a word.
 * The drawing is the argument: `q` planks are drawn, `r` cells stay open — both computed, never typed.
 *   stage 'ask'    the gap, and one plank shown above it;
 *   stage 'build'  the planks are being laid (`buildMs` says how long);
 *   stage 'done'   it holds, or it crumbles.
 */
import KidFigure from '../../lessons/common/components/KidFigure';
import { kidLook } from '../../lessons/common/components/kidFigure';
import { cellsOf } from './lessonScripts';

const W = 1100;
const H = 300;
const DECK = 150;
const SPAN = 900;
const fast = () => typeof window !== 'undefined' && Boolean(window.__classFast);
/** How long the board takes to lay the planks of a bridge: one plank at a time, never more than two seconds. */
export const buildMs = (c) => {
  const per = fast() ? 1 : Math.max(12, Math.min(130, 1500 / Math.max(1, c.q)));
  return { per, total: fast() ? 30 : Math.round(per * c.q + 560) };
};

export default function BoardBridge({ c, stage = 'ask', kid = 0 }) {
  const cell = Math.min(46, SPAN / c.a);
  const total = cell * c.a;
  const x0 = (W - total) / 2;
  const xR = x0 + total;
  const built = stage !== 'ask';
  const done = stage === 'done';
  const { per } = buildMs(c);
  const wide = cell * c.b >= 30;
  const look = kidLook(kid);
  const crossed = done && c.held;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`bb is-${stage} ${done ? (c.held ? 'is-held' : 'is-fell') : ''}`}
      data-bb={`${c.a}:${c.b}`}
      data-bb-stage={stage}
      data-bb-planks={built ? c.q : 0}
      data-bb-left={built ? c.r : ''}
      role="img"
      aria-label={`${c.a} · ${c.b}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <rect x="0" y="244" width={W} height={H - 244} className="bb-water" />
      <path d={`M0 244 ${Array.from({ length: 22 }, () => 'q 12.5 -9 25 0 t 25 0').join(' ')}`} className="bb-wave" />
      {/* the two banks hug the gap, whatever its length */}
      {[
        [0, x0],
        [xR, W - xR],
      ].map(([x, w]) => (
        <g key={x}>
          <rect x={x} y={DECK} width={w} height={H - DECK} className="bb-bank" />
          <rect x={x} y={DECK - 9} width={w} height="16" rx="8" className="bb-grass" />
        </g>
      ))}
      {/* the gap: one slot per cell; the cells nothing covers stay open */}
      {Array.from({ length: c.a }, (_, i) => (
        <rect
          key={i}
          x={x0 + i * cell + 0.8}
          y={DECK - 2}
          width={Math.max(0.6, cell - 1.6)}
          height="26"
          rx={Math.min(4, cell / 4)}
          className={`bb-slot ${built && i < c.r ? 'is-left' : ''}`}
        />
      ))}
      <line x1={x0} x2={xR} y1={DECK + 44} y2={DECK + 44} className="bb-dim" />
      <line x1={x0} x2={x0} y1={DECK + 36} y2={DECK + 52} className="bb-dim" />
      <line x1={xR} x2={xR} y1={DECK + 36} y2={DECK + 52} className="bb-dim" />
      <text x={W / 2} y={DECK + 78} textAnchor="middle" className="bb-cap" direction="rtl">
        {cellsOf(c.a)}
      </text>
      {!built && (
        <g className="bb-sample">
          <rect
            x={xR - cell * c.b + 1.5}
            y={DECK - 66}
            width={Math.max(2, cell * c.b - 3)}
            height="28"
            rx="7"
            className="bb-plank bb-plank--still"
          />
          <text
            x={xR - (cell * c.b) / 2}
            y={DECK - 76}
            textAnchor="middle"
            className="bb-cap bb-cap--plank"
            direction="rtl"
          >
            لوح {c.b}
          </text>
        </g>
      )}
      {built &&
        Array.from({ length: c.q }, (_, k) => {
          const x = xR - (k + 1) * c.b * cell;
          return (
            <g key={k} className="bb-plankg" style={{ animationDelay: `${Math.round(k * per)}ms` }}>
              <rect
                x={x + 1.5}
                y={DECK - 5}
                width={Math.max(1, cell * c.b - 3)}
                height="32"
                rx={Math.min(7, (cell * c.b) / 3)}
                className={`bb-plank ${k % 2 ? 'is-alt' : ''}`}
              />
              {wide && (
                <text x={x + (cell * c.b) / 2} y={DECK + 18} textAnchor="middle" className="bb-num">
                  {k + 1}
                </text>
              )}
            </g>
          );
        })}
      {done && c.r > 0 && (
        <text
          x={x0 + (c.r * cell) / 2}
          y={DECK - 16}
          textAnchor="middle"
          className="bb-cap bb-cap--left"
          direction="rtl"
          data-bb-left-cap
        >
          بقي {c.r}
        </text>
      )}
      {/* the child waits on the right bank and crosses only a bridge that holds */}
      <g
        className="bb-kid"
        style={{ transform: crossed ? `translateX(${-(total + 100)}px)` : 'none' }}
        data-bb-kid={crossed ? 'crossed' : 'waiting'}
      >
        <KidFigure
          cx={xR + 50}
          top={DECK - 9 - 112}
          foot={DECK - 7}
          {...look}
          mood={done ? (c.held ? 'proud' : 'wonder') : 'neutral'}
        />
      </g>
    </svg>
  );
}

/** A bridge in one line, for a log or a choice: the planks from the right, the cells left open in amber. */
export function BridgeBar({ c }) {
  const BW = 300;
  const cell = BW / c.a;
  return (
    <svg
      viewBox={`0 0 ${BW} 20`}
      className={`bbar ${c.held ? 'is-held' : 'is-fell'}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: c.q }, (_, k) => (
        <rect
          key={k}
          x={BW - (k + 1) * c.b * cell + 0.6}
          y="2"
          width={Math.max(0.6, cell * c.b - 1.2)}
          height="16"
          rx="3"
          className="bbar-plank"
        />
      ))}
      {c.r > 0 && <rect x="0.6" y="2" width={Math.max(1, cell * c.r - 1.2)} height="16" rx="3" className="bbar-left" />}
    </svg>
  );
}
