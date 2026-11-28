/**
 * The pyramids world — THE GEOMETER'S PLAN of stage 3: the river seen from above, drawn (`riverPlan.js` holds its law
 * and its places). Two moments on ONE drawing, and nothing he is asked is off the screen:
 *
 *   place   a string from the stake R over the stake S, across the river: he moves R (↑ ↓, the two buttons, or the
 *           stake dragged) until the string arrives ON the post F; « Planter » — a string beside the post is answered
 *           by a fact (left · right) and stays in his hand
 *   rope    the two triangles are filled, the lengths he measured are written on their sides, the ferry rope [AF] is
 *           drawn dotted with its « ? » — he writes its length ON the drawing; the world throws it (`Game.sendOrder`)
 *
 * Hooks for the walks: `data-np-plan=<place|rope>`, `data-np-plan-er=<metres>`, `data-np-plan-nearer`,
 * `data-np-plan-further`, `data-np-plan-set`, `data-np-plan-fact=<left|right>`; the rope's moment carries the order's
 * own (`data-np-order="ferry"`, `data-np-order-in`, `data-np-order-send`, `data-np-order-later`).
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '../../components/MathText';
import { Card, M } from '../kit/parts';
import { RIVER, approx, riverWidth } from './logic';
import { PLAN_BOX, PLAN_ER, erAt, planPoints } from './riverPlan';

const decimal = (v) => {
  const [a, ...rest] = v
    .replace(/[^0-9.,]/g, '')
    .replace(/\./g, ',')
    .split(',');
  return rest.length ? `${a},${rest.join('')}` : a;
};

const pts = (...ps) => ps.map((p) => `${p.x},${p.y}`).join(' ');
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** A point of the plan: its dot and its letter. */
function Stake({ p, name, dx = 0, dy = -14, post = false }) {
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={post ? 9 : 7} className={post ? 'np-plan__post' : 'np-plan__stake'} />
      <text x={p.x + dx} y={p.y + dy} className="np-plan__letter" textAnchor="middle">
        {name}
      </text>
    </g>
  );
}

/** A measured length, written beside its side. */
const Length = ({ at, dx = 0, dy = 0, children }) => (
  <text x={at.x + dx} y={at.y + dy} className="np-plan__len" textAnchor="middle">
    {children}
  </text>
);

export default function RiverPlan({ o, game }) {
  const T = game.T.stage.riverPlan;
  const place = o.mode === 'place';
  const [er, setEr] = useState(place ? PLAN_ER.start : approx(RIVER.ER));
  const [text, setText] = useState('');
  const svg = useRef(null);
  const drag = useRef(false);
  const shown = place ? er : approx(RIVER.ER);
  const P = planPoints(RIVER, shown);
  const { w, h, far } = PLAN_BOX;
  const move = (d) => setEr((x) => Math.min(PLAN_ER.max, Math.max(PLAN_ER.min, x + d)));

  useEffect(() => {
    if (!place) return undefined;
    const key = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') move(1);
      else if (e.key === 'Enter') game.plantR(er);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [place, er, game]);

  const dragTo = (e) => {
    if (!drag.current || !svg.current) return;
    const box = svg.current.getBoundingClientRect();
    setEr(erAt(RIVER, ((e.clientY - box.top) / box.height) * h));
  };
  const send = () => game.sendOrder(text);
  // the rope of his last order, as the world threw it: to the post, short of it, or with a length left over
  const last = !place && o.last ? o.last : null;
  const reach = last ? Math.min(1, approx(last.typed) / approx(riverWidth(RIVER))) : 0;
  const ropeEnd = { x: P.A.x, y: P.A.y - (P.A.y - P.F.y) * reach };

  return (
    <Card tone="np-plancard">
      <div className="np-plan" data-np-plan={o.mode} data-np-plan-er={shown}>
        <p className="di-card__eyebrow">{T.title}</p>
        <h2 className="np-plan__ask">
          <MathText>{place ? T.place : T.rope}</MathText>
        </h2>
        <div className="np-plan__fig">
          <svg
            ref={svg}
            viewBox={`0 0 ${w} ${h}`}
            role="img"
            aria-label={T.aria}
            onPointerMove={dragTo}
            onPointerUp={() => (drag.current = false)}
            onPointerLeave={() => (drag.current = false)}
          >
            <defs>
              <clipPath id="np-plan-box">
                <rect x="0" y="0" width={w} height={h} />
              </clipPath>
            </defs>
            <rect x="0" y="0" width={w} height={h} className="np-plan__land" />
            <rect x="0" y="0" width={w} height={far} className="np-plan__far" />
            <rect x="0" y={far} width={w} height={P.bank - far} className="np-plan__water" />
            <text x={w - 16} y={far - 16} className="np-plan__place" textAnchor="end">
              {T.farBank}
            </text>
            <text x={w - 16} y={(far + P.bank) / 2} className="np-plan__place np-plan__place--water" textAnchor="end">
              {T.river}
            </text>
            <text x={16} y={P.bank + 30} className="np-plan__place">
              {T.nearBank}
            </text>
            <text x={16} y={h - 14} className="np-plan__place np-plan__place--note">
              {T.note}
            </text>
            {!place && (
              <>
                <polygon points={pts(P.F, P.A, P.S)} className="np-plan__tri np-plan__tri--big" />
                <polygon points={pts(P.S, P.E, P.R)} className="np-plan__tri np-plan__tri--small" />
              </>
            )}
            {/* the bank he measured along, and the line drawn inland from E, square to it */}
            <line x1={P.A.x} y1={P.A.y} x2={P.E.x} y2={P.E.y} className="np-plan__bank" />
            <line x1={P.E.x} y1={P.E.y} x2={P.end.x} y2={P.end.y + 14} className="np-plan__inland" />
            <path
              d={`M${P.E.x - 14},${P.E.y} v14 h14 M${P.A.x},${P.A.y - 14} h14 v14`}
              className="np-plan__square"
              fill="none"
            />
            {/* the ferry rope to cut: drawn before it is asked */}
            {!place && <line x1={P.A.x} y1={P.A.y} x2={P.F.x} y2={P.F.y} className="np-plan__ferry" />}
            {last && (
              <g data-np-plan-last={last.fact}>
                <line x1={P.A.x} y1={P.A.y} x2={ropeEnd.x} y2={ropeEnd.y} className="np-plan__thrown" />
                {last.fact === 'short' && <circle cx={ropeEnd.x} cy={ropeEnd.y} r="9" className="np-plan__splash" />}
                {last.fact === 'slack' && (
                  <path d={`M${P.F.x},${P.F.y} q-14,22 -30,4 t-30,6 t-30,-2`} className="np-plan__thrown" fill="none" />
                )}
              </g>
            )}
            {/* the string: from R over S, across the river to where it touches the far bank */}
            <line
              x1={P.R.x}
              y1={P.R.y}
              x2={P.T.x}
              y2={P.T.y}
              className={`np-plan__string${place ? '' : ' is-tied'}`}
              clipPath="url(#np-plan-box)"
            />
            {place && P.T.x > 0 && <circle cx={P.T.x} cy={P.T.y} r="6" className="np-plan__touch" />}
            <Stake p={P.F} name="F" post dy={-16} />
            <Stake p={P.A} name="A" dx={-18} dy={26} />
            <Stake p={P.S} name="S" dx={-16} dy={-14} />
            <Stake p={P.E} name="E" dx={22} dy={-8} />
            <g
              className={`np-plan__r${place ? ' is-held' : ''}`}
              onPointerDown={(e) => {
                if (!place) return;
                drag.current = true;
                e.currentTarget.setPointerCapture?.(e.pointerId);
              }}
            >
              {place && <circle cx={P.R.x} cy={P.R.y} r="20" className="np-plan__halo" />}
              <circle cx={P.R.x} cy={P.R.y} r="9" className="np-plan__stake np-plan__stake--r" />
              <text x={P.R.x + 22} y={P.R.y + 6} className="np-plan__letter">
                R
              </text>
            </g>
            <Length at={mid(P.A, P.S)} dy={28}>{`${o.lens.AS} m`}</Length>
            <Length at={mid(P.S, P.E)} dy={-12}>{`${o.lens.SE} m`}</Length>
            <Length at={P.R} dx={-46} dy={6}>{`${shown} m`}</Length>
            {!place && (
              <text x={P.A.x + 16} y={(P.A.y + P.F.y) / 2} className="np-plan__len np-plan__len--ask">
                ?
              </text>
            )}
          </svg>
          {!place && (
            <div className="np-plan__order" data-np-order="ferry">
              <div className="np-order__line" dir="ltr">
                <M>{'AF ='}</M>
                <input
                  className="di-num np-order__in"
                  dir="ltr"
                  inputMode="decimal"
                  autoFocus
                  value={text}
                  style={{ width: '7ch' }}
                  onChange={(e) => setText(decimal(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && text && send()}
                  aria-label="AF"
                  data-np-order-in
                />
                <span className="np-order__unit">{game.T.unit}</span>
              </div>
              {last && <p className="np-plan__last">{`${T.last(last.typed)} ${game.T.fact[last.fact]}`}</p>}
              {o.refused && (
                <p className="np-order__refused" data-np-refused={o.refused}>
                  {game.T.order.refused[o.refused]}
                </p>
              )}
            </div>
          )}
        </div>
        {place && (
          <p
            className={`np-plan__fact${o.fact ? ' is-miss' : ''}`}
            {...(o.fact ? { 'data-np-plan-fact': o.fact } : {})}
          >
            <MathText>{o.fact && o.at === er ? T.fact[o.fact] : T.hint}</MathText>
          </p>
        )}
        <div className="np-order__go">
          {place ? (
            <>
              <button type="button" className="di-btn" onClick={() => move(-1)} data-np-plan-nearer>
                <kbd>↑</kbd> {T.nearer}
              </button>
              <button type="button" className="di-btn" onClick={() => move(1)} data-np-plan-further>
                <kbd>↓</kbd> {T.further}
              </button>
              <button type="button" className="di-btn di-btn--primary" onClick={() => game.plantR(er)} data-np-plan-set>
                {T.set}
              </button>
            </>
          ) : (
            <button type="button" className="di-btn di-btn--primary" disabled={!text} onClick={send} data-np-order-send>
              {T.send}
            </button>
          )}
          <button type="button" className="di-btn" onClick={() => game.closeOrder()} data-np-order-later>
            {game.T.order.later}
          </button>
        </div>
      </div>
    </Card>
  );
}
