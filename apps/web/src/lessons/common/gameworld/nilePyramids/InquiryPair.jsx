/**
 * The screen of `pair` (logic: `pair.js`, words: `pairText.js`) — a PURE view (`PairView`) and its player (`Pair`).
 * One round per screen: the template on the left and the stone on the right, drawn APART at one scale (inline SVG,
 * ≈ 300 px each at 1366 × 768), the links as curves between the sides; on the right the prediction, the quotients,
 * the lengths « attendu / mesuré » and the world's verdict. Nothing of an earlier round stays on screen.
 * Hooks: `data-iq="pair"`, `data-iq-stage=<predict|link|laid>`, `data-iq-round`, `data-iq-link=<world-first|given>`,
 * `data-iq-predict=<shape|not>`, `data-iq-side=<t0|t1|t2|s0|s1|s2>` (+ `data-iq-locked`, `data-iq-picked`,
 * `data-iq-linked=<other side>`), `data-iq-quotient=<t>` (+ `data-iq-pending`, `data-iq-first`), `data-iq-mark=<eq|ne>`,
 * `data-iq-equal=<yes|no>`, `data-iq-expected`, `data-iq-measured`, `data-iq-lay`, `data-iq-laid=<covers|apart>`,
 * `data-iq-fact=<hit|miss>`, `data-iq-next`; the state on `window.__inquiry`.
 */
import { Fragment, useReducer } from 'react';
import { compare } from '../kit/exact';
import {
  initPair,
  pairReducer,
  pairResult,
  SAYS,
  sideNames,
  cornersOf,
  cornersFrom,
  placed,
  layImage,
  quotients,
  marks,
  allEqual,
  expectedMeasured,
} from './pair';
import { PAIR_TEXT } from './pairText';
import { expose } from './inquiryParts';

/** The words: the world's, with the lesson's `spec.text` over them (one level deep). */
export function pairTextOf(spec) {
  const out = { ...PAIR_TEXT };
  for (const [k, v] of Object.entries(spec.text ?? {}))
    out[k] =
      v && typeof v === 'object' && !Array.isArray(v) && typeof PAIR_TEXT[k] === 'object'
        ? { ...PAIR_TEXT[k], ...v }
        : v;
  return out;
}

// the drawing, in viewBox units: 640 × 380, drawn ≈ 1 unit per pixel (font 18 → ≥ 18 px); each triangle in a box of
// 250 × 270 — the walk of 2026-11-27 found half the panel empty under triangles drawn in 210 units of height
const W = 640;
const H = 380;
const BOX = { w: 250, h: 270, top: 62 };
const CENTER = [160, 480];
const FONT = 18;
const LINK_TONE = ['#4f46e5', '#059669', '#e11d48'];
const INK = '#1d4ed8';
const AMBER = '#d97706';
const NB_SPACE = '\u00a0';

const bounds = (ps) => {
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

/** Both triangles on the table, at ONE scale; the laid stone in the template's frame. */
export function pairDrawing(spec, r, laid) {
  const T = cornersFrom(spec.template.sides);
  const S = placed(cornersFrom(r.stone.sides), r.stone);
  const bt = bounds(T);
  const bs = bounds(S);
  const scale = Math.min(
    BOX.w / Math.max(bt.x1 - bt.x0, bs.x1 - bs.x0),
    BOX.h / Math.max(bt.y1 - bt.y0, bs.y1 - bs.y0),
  );
  const to = (b, cx) => (p) => [
    cx + (p[0] - (b.x0 + b.x1) / 2) * scale,
    BOX.top + BOX.h / 2 - (p[1] - (b.y0 + b.y1) / 2) * scale,
  ];
  const tT = to(bt, CENTER[0]);
  return {
    t: T.map(tT),
    s: S.map(to(bs, CENTER[1])),
    image: laid ? layImage(spec.template.sides, r.stone.sides).map(tT) : null,
  };
}

const mid = (P, i) => {
  const [a, b] = cornersOf(i);
  return [(P[a][0] + P[b][0]) / 2, (P[a][1] + P[b][1]) / 2];
};
const centroid = (P) => [(P[0][0] + P[1][0] + P[2][0]) / 3, (P[0][1] + P[1][1] + P[2][1]) / 3];
const away = (P, p, d) => {
  const c = centroid(P);
  const n = Math.hypot(p[0] - c[0], p[1] - c[1]) || 1;
  return [p[0] + ((p[0] - c[0]) / n) * d, p[1] + ((p[1] - c[1]) / n) * d];
};
const path = (P) => `M${P.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join('L')}Z`;
/**
 * Where a side's length is written: OUTSIDE the triangle, on the side's outward normal, far enough that the text's box
 * (≈ 0.6 em a character, one em high) clears the side — a label set from the centroid stood ON a thin triangle's side
 * (« 4,5 m » struck by its edge, « 3,8 m » against « 3 m »: the walk of 2026-11-27).
 */
export function sideLabelAt(P, i, text, font = FONT) {
  const [a, b] = cornersOf(i);
  const o = [0, 1, 2].find((k) => k !== a && k !== b);
  const m = mid(P, i);
  const [dx, dy] = [P[b][0] - P[a][0], P[b][1] - P[a][1]];
  const len = Math.hypot(dx, dy) || 1;
  let n = [-dy / len, dx / len];
  // away from the opposite corner
  if ((P[o][0] - m[0]) * n[0] + (P[o][1] - m[1]) * n[1] > 0) n = [-n[0], -n[1]];
  const w = String(text).length * font * 0.6;
  const d = 7 + Math.abs(n[0]) * (w / 2) + Math.abs(n[1]) * (font / 2);
  return [m[0] + n[0] * d, m[1] + n[1] * d];
}

function Triangle({ P, names, sides, who, s, act, T }) {
  const segs = sideNames(names);
  const linkOf = (i) => (who === 't' ? s.links[i] : s.links.indexOf(i));
  const toneOf = (i) => {
    const l = linkOf(i);
    if (l == null || l < 0) return null;
    return LINK_TONE[who === 't' ? i : l];
  };
  const pickable = s.stage !== 'predict';
  return (
    <g>
      <path d={path(P)} fill="rgba(29,78,216,0.08)" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => {
        const [a, b] = cornersOf(i);
        const tone = toneOf(i);
        const locked = (who === 't' && i === s.locked) || (who === 's' && s.locked != null && i === s.links[s.locked]);
        const picked = s.pick?.[who] === i;
        const lab = sideLabelAt(P, i, T.length(sides[i]));
        const l = linkOf(i);
        const hook = pickable
          ? {
              'data-iq-side': `${who}${i}`,
              'data-iq-locked': locked ? '' : undefined,
              'data-iq-picked': picked ? '' : undefined,
              'data-iq-linked': l != null && l >= 0 ? `${who === 't' ? 's' : 't'}${l}` : undefined,
              role: locked ? undefined : 'button',
              tabIndex: locked ? undefined : 0,
              // a mouse pick lets the focus go: the browser's focus frame stood around the side's box (the walk of
              // 2026-11-27: a grey frame across V and U); the keyboard keeps it (`onKeyDown`)
              onClick: locked
                ? undefined
                : (e) => {
                    act.pick(who, i);
                    if (e.detail > 0) e.currentTarget.blur?.();
                  },
              onKeyDown: locked
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      act.pick(who, i);
                    }
                  },
              style: { cursor: locked ? 'default' : 'pointer' },
            }
          : {};
        return (
          <g key={i} {...hook} aria-label={T.sideAria(segs[i], sides[i])} className="np-pair__side">
            <line x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke="transparent" strokeWidth={26} />
            <line
              x1={P[a][0]}
              y1={P[a][1]}
              x2={P[b][0]}
              y2={P[b][1]}
              stroke={picked ? AMBER : (tone ?? INK)}
              strokeWidth={picked ? 6 : tone ? 4 : 2.4}
              strokeLinecap="round"
            />
            <text
              x={lab[0]}
              y={lab[1] + FONT * 0.35}
              fontSize={FONT}
              fontWeight={700}
              fill={picked ? AMBER : (tone ?? '#0f172a')}
              textAnchor="middle"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            >
              {T.length(sides[i])}
            </text>
          </g>
        );
      })}
      {[...names].map((n, i) => {
        const p = away(P, P[i], 16);
        return (
          <text
            key={n}
            x={p[0]}
            y={p[1] + FONT * 0.35}
            fontSize={FONT}
            fontStyle="italic"
            fill="#334155"
            textAnchor="middle"
          >
            {n}
          </text>
        );
      })}
    </g>
  );
}

function Drawing({ spec, r, s, act, T }) {
  const D = pairDrawing(spec, r, s.stage === 'laid');
  const stoneNames = r.stone.names;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="np-pair__svg"
      role="img"
      aria-label={T.figure(spec.template.names, stoneNames)}
      data-iq-drawing
    >
      <text x={CENTER[0]} y={26} fontSize={FONT} fontWeight={800} fill="#7c4a03" textAnchor="middle">
        {T.template(spec.template.names)}
      </text>
      <text x={CENTER[1]} y={26} fontSize={FONT} fontWeight={800} fill="#7c4a03" textAnchor="middle">
        {T.stone(stoneNames)}
      </text>
      <g opacity={s.stage === 'laid' ? 0.45 : 1}>
        <Triangle P={D.s} names={stoneNames} sides={r.stone.sides} who="s" s={s} act={act} T={T} />
      </g>
      <Triangle P={D.t} names={spec.template.names} sides={spec.template.sides} who="t" s={s} act={act} T={T} />
      {s.stage !== 'predict' &&
        s.links.map((sIdx, t) => {
          if (sIdx == null) return null;
          const a = mid(D.t, t);
          const b = mid(D.s, sIdx);
          const top = Math.max(BOX.top - 18, Math.min(a[1], b[1]) - 70);
          return (
            <path
              key={t}
              d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${((a[0] + b[0]) / 2).toFixed(1)} ${top.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`}
              fill="none"
              stroke={LINK_TONE[t]}
              strokeWidth={t === s.locked ? 3.2 : 2.4}
              strokeDasharray={t === s.locked ? undefined : '7 5'}
              data-iq-curve={t}
              pointerEvents="none"
            />
          );
        })}
      {D.image && (
        <path
          d={path(D.image)}
          fill="rgba(217,119,6,0.22)"
          stroke={AMBER}
          strokeWidth={3}
          strokeDasharray={s.laid.shape ? undefined : '8 5'}
          strokeLinejoin="round"
          pointerEvents="none"
          data-iq-image={s.laid.shape ? 'covers' : 'apart'}
        />
      )}
    </svg>
  );
}

function Quotients({ spec, r, s, T }) {
  const qs = quotients(spec, r, s.links);
  const ms = marks(qs);
  return (
    <p className="np-pair__quotients" dir="ltr" data-iq-equal={allEqual(qs) ? 'yes' : 'no'}>
      {qs.map((q, t) => (
        <Fragment key={t}>
          {t > 0 && (
            <b className="np-pair__mark" data-iq-mark={ms[t - 1] ?? undefined}>
              {ms[t - 1] ? T.mark[ms[t - 1]] : NB_SPACE}
            </b>
          )}
          <span
            className="np-pair__chip"
            style={{ borderColor: LINK_TONE[t] }}
            data-iq-quotient={t}
            data-iq-pending={q.s == null ? '' : undefined}
            data-iq-first={t === s.locked ? '' : undefined}
          >
            <span>{T.quotient(q.s ?? T.pending, q.t)}</span>
            {t === s.locked && <small>{T.first}</small>}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

export function PairView({ spec, state: s, act }) {
  const T = pairTextOf(spec);
  const r = spec.rounds[s.i];
  const em = s.stage === 'predict' ? null : expectedMeasured(spec, r, s.links, s.locked);
  const row = s.stage === 'laid' ? s.rows.at(-1) : null;
  const how = {
    scale: compare(s.laid?.k ?? '1', '1') < 0 ? 'down' : compare(s.laid?.k ?? '1', '1') > 0 ? 'up' : 'same',
    turned: (r.stone.turn ?? 0) % 360 !== 0,
    flipped: !!r.stone.flip,
  };
  const complete = s.links.every((x) => x != null);
  return (
    <section
      className="np-iq np-iq--pair"
      data-iq="pair"
      data-iq-stage={s.stage}
      data-iq-round={s.i}
      data-iq-link={r.link}
    >
      <p className="np-iq__lead">{T.lead}</p>
      <div className="np-iq__row">
        <div className="np-iq__fig np-pair__fig">
          <Drawing spec={spec} r={r} s={s} act={act} T={T} />
        </div>
        <div className="np-iq__side">
          {s.stage === 'predict' ? (
            <>
              <p className="np-iq__ask">{T.ask}</p>
              <div className="np-iq__choices">
                {SAYS.map((v) => (
                  <button key={v} type="button" className="rf-btn" onClick={() => act.say(v)} data-iq-predict={v}>
                    {T.say[v]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="np-pair__said" data-iq-said={s.said}>
                {T.said} <b>{T.say[s.said]}</b>
              </p>
              {s.stage === 'link' && <p className="np-iq__ask">{r.link === 'given' ? T.givenLinks : T.firstLink}</p>}
              <Quotients spec={spec} r={r} s={s} T={T} />
              {em && (
                <p
                  className="np-iq__chain"
                  data-iq-expected={em.expected.join(';')}
                  data-iq-measured={em.measured.join(';')}
                >
                  {T.withLinks(em.expected, em.measured)}
                </p>
              )}
              {s.stage === 'link' && (
                <button
                  type="button"
                  className="rf-btn rf-btn--main"
                  onClick={act.lay}
                  disabled={!complete}
                  data-iq-lay
                >
                  {T.lay}
                </button>
              )}
              {row && (
                <div className="np-iq__out" data-iq-laid={row.shape ? 'covers' : 'apart'}>
                  <p className="np-iq__fact">{T.laidHow(how)}</p>
                  <p className={`np-iq__fact ${row.shape ? 'is-fits' : 'is-gap'}`}>
                    {row.shape ? T.laid.covers : T.laid.apart}
                  </p>
                  <p
                    className={`np-iq__fact ${row.right ? 'is-fits' : 'is-gap'}`}
                    data-iq-fact={row.right ? 'hit' : 'miss'}
                  >
                    {row.right ? T.hit : T.miss}
                  </p>
                  <p className="np-pair__again">{T.again}</p>
                  <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
                    {T.next}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function Pair({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => pairReducer(spec, s, a), spec, initPair);
  expose({ kind: 'pair', ...state });
  const act = {
    say(v) {
      play('pick');
      dispatch({ type: 'say', v });
    },
    pick(side, i) {
      const after = pairReducer(spec, state, { type: 'pick', side, i });
      if (after === state) return;
      play(after.links.join() !== state.links.join() ? 'ui' : 'pick');
      dispatch({ type: 'pick', side, i });
    },
    lay() {
      const after = pairReducer(spec, state, { type: 'lay' });
      if (after.laid) play(after.laid.shape ? 'gate' : 'plank');
      dispatch({ type: 'lay' });
    },
    next() {
      const after = pairReducer(spec, state, { type: 'next' });
      if (after.done) onDone(pairResult(after));
      else {
        play('ui');
        dispatch({ type: 'next' });
      }
    },
  };
  return <PairView spec={spec} state={state} act={act} />;
}
