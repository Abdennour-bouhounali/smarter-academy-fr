import { useCallback, useRef } from 'react';
import MathText from '../../lessons/common/components/MathText';
import { deal, lcm } from './logic';
import { T } from './text';

/**
 * « Vers le brevet » — PROTOTYPE: the pieces every step uses. The pictures are flat and drawn in code; each one
 * carries out a number the student produced, right or wrong (docs/reports/VERS_LE_BREVET_PLAN.md §3, point 1).
 */

/** Text with `$…$` maths. */
export function Rich({ children }) {
  return <MathText>{String(children ?? '')}</MathText>;
}

const MARK = /\[([dcg]):([^\]]+)\]/g;

/** A statement whose key words carry their role: `[d:…]` given, `[c:…]` condition, `[g:…]` asked. */
export function Statement({ text, alert }) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    if (m.index > last) out.push(<Rich key={`t${last}`}>{text.slice(last, m.index)}</Rich>);
    out.push(
      <span key={`k${m.index}`} className={`vb-kw vb-kw--${m[1]}${alert === m[1] ? ' is-alert' : ''}`}>
        {m[2]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<Rich key={`t${last}`}>{text.slice(last)}</Rich>);
  return <div className="vb-statement">{out}</div>;
}

/** The robot: its eyes and mouth follow `mood` — idle, oops, think, win. */
function Robot({ mood = 'idle' }) {
  return (
    <svg className="vb-robot" data-mood={mood} viewBox="0 0 80 80" aria-hidden="true">
      <path className="vb-robot__head" d="M40 12V4" />
      <circle className="vb-robot__eye" cx="40" cy="4" r="3" />
      <rect className="vb-robot__head" x="8" y="12" width="64" height="58" rx="18" />
      <circle className="vb-robot__eye vb-robot__eye--l" cx="28" cy="36" r="6" />
      <circle className="vb-robot__eye vb-robot__eye--r" cx="52" cy="36" r="6" />
      <path className="vb-robot__mouth" data-for="idle" d="M30 54h20" />
      <path className="vb-robot__mouth" data-for="oops" d="M35 55a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
      <path className="vb-robot__mouth" data-for="think" d="M30 55q5 -5 10 0t10 0" />
      <path className="vb-robot__mouth" data-for="win" d="M27 50q13 16 26 0" />
    </svg>
  );
}

/** The bottom bar: the robot says ONE thing; the action of the moment stands at its right. */
export function Bar({ mood, say, children }) {
  return (
    <div className="vb-bar">
      <div className="vb-bot">
        <Robot mood={mood} />
        <div className="vb-bubble" aria-live="polite">
          <Rich>{say}</Rich>
        </div>
      </div>
      <div className="vb-actions">{children}</div>
    </div>
  );
}

const tokens = (m, f, from = 0) =>
  Array.from({ length: m + f }, (_, i) => (
    <i key={i} className={`vb-tk${i >= m ? ' vb-tk--b' : ''}`} style={{ '--i': from + i }} />
  ));

/** Two stocks dealt into `n` lots; what does not fit stays on the red mat. `n` null: the two stocks, undealt. */
export function LotsScene({ a, b, A, B, n }) {
  if (!n) {
    return (
      <div className="vb-trays" style={{ gridTemplateColumns: '1fr' }}>
        <div className="vb-tray vb-tray--stock">{tokens(a, b)}</div>
      </div>
    );
  }
  if (n > Math.min(a, b)) {
    // more lots than things: nothing can be dealt. The caller says why, once.
    return (
      <div className="vb-trays" style={{ gridTemplateColumns: '1fr' }}>
        <div className="vb-tray vb-tray--stock is-stuck">{tokens(a, b)}</div>
      </div>
    );
  }
  const d = deal(a, b, n);
  const cols = n <= 6 ? 3 : n <= 12 ? 4 : n <= 24 ? 6 : 9;
  return (
    <>
      <div className="vb-trays" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} key={n}>
        {Array.from({ length: Math.min(n, 63) }, (_, k) => (
          <div className="vb-tray" key={k}>
            {tokens(d.q1, d.q2, k * 3)}
          </div>
        ))}
      </div>
      {d.r1 + d.r2 > 0 && (
        <div className="vb-rest is-bad" key={`r${n}`}>
          {tokens(d.r1, d.r2, 50)}
          <span>{T.rest(d.r1, A, d.r2, B)}</span>
        </div>
      )}
    </>
  );
}

/** Two rhythms on one line: where each comes back, and a marker at the number the student's card produced. */
export function TimelineScene({ a, b, at, unit }) {
  const end = lcm(a, b);
  const x = (v) => 40 + (v / end) * 560;
  const row = (step, y, cls) =>
    Array.from({ length: end / step + 1 }, (_, k) => k * step).map((v) => (
      <g key={v}>
        <circle
          className={`vb-tl__dot ${cls}${v === end && at === end ? ' is-meet' : ''}`}
          cx={x(v)}
          cy={y}
          r={v === end && at === end ? 13 : 9}
        />
        <text className="vb-tl__num" x={x(v)} y={y + 32} textAnchor="middle">
          {v}
        </text>
      </g>
    ));
  return (
    <svg className="vb-tl" viewBox="0 0 640 210" role="img" aria-label={`${a} et ${b}`}>
      <path className="vb-tl__axis" d="M40 60H600M40 140H600" />
      {row(a, 60, 'vb-tl__dot--a')}
      {row(b, 140, 'vb-tl__dot--b')}
      {at != null && (
        <g className={`vb-tl__at${at === end ? ' is-ok' : ' is-bad'}`} key={at}>
          <path d={`M${x(at)} 22V186`} />
          <text x={x(at)} y="16" textAnchor="middle">
            {at}
            {unit ? ` ${unit}` : ''}
          </text>
        </g>
      )}
    </svg>
  );
}

const CONFETTI = ['#ffd23f', '#ff6fa8', '#3be8d8', '#6f5cff', '#ffffff'];

/** A burst of paper, once per change of `run`. */
export function Confetti({ run }) {
  if (!run) return null;
  return (
    <div className="vb-confetti" key={run} aria-hidden="true">
      {Array.from({ length: 46 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: CONFETTI[i % 5],
            '--dx': `${(i % 7) * 18 - 54}px`,
            '--rot': `${i * 53}deg`,
            animationDelay: `${(i % 9) * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

const NOTES = {
  tap: [[330, 0]],
  good: [
    [523, 0],
    [659, 0.09],
  ],
  bad: [
    [220, 0],
    [170, 0.12],
  ],
  win: [
    [523, 0],
    [659, 0.1],
    [784, 0.2],
    [1046, 0.32],
  ],
};

/** Short notes on the student's own gesture, only while the sound is on. */
export function useSound(on) {
  const ctx = useRef(null);
  return useCallback(
    (kind) => {
      if (!on || typeof window === 'undefined') return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      ctx.current = ctx.current || new Audio();
      const audio = ctx.current;
      if (audio.state === 'suspended') audio.resume(); // a browser keeps it asleep until a touch
      for (const [freq, at] of NOTES[kind] ?? []) {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const t = audio.currentTime + at;
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      }
    },
    [on],
  );
}

/** A chunky key. */
export function Key({ children, kind = 'main', ...rest }) {
  return (
    <button type="button" className={`vb-key vb-key--${kind}`} {...rest}>
      {children}
    </button>
  );
}
