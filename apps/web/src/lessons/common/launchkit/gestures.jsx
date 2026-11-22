/**
 * « عُدّة الانطلاق » — the three GESTURES of an answer. The answer is an action, never a quiz button:
 *   Write  the value in its own shape, typed on the game's keypad (no system keyboard on a tablet);
 *   Sort   each card DRAGGED into one of two boxes (owner, 2026-11-17; a tap on a box does the same, for a keyboard), and taken
 *          back by a tap as long as the answer is not handed in;
 *   Place  a flag dragged on a number line.
 * Nothing moves by itself and nothing is timed: the question waits. A gesture never says right or wrong.
 */
import { useEffect, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import MathText from '../components/MathText';
import { svgPoint } from '../lessonlab/kit';
import { slotsOf } from './families';

export function Write({ q, value, onChange, locked, play }) {
  const slots = slotsOf(q.tokens);
  const [focus, setFocus] = useState(slots[0].slot);
  const v = value ?? {};
  const ref = useRef(null);
  ref.current = { v, focus, locked };
  const press = (key) => {
    const { v: cur, focus: f, locked: off } = ref.current;
    if (off) return;
    const text = cur[f] ?? '';
    if (key === 'back') {
      if (text === '') {
        const i = slots.findIndex((s) => s.slot === f);
        if (i > 0) setFocus(slots[i - 1].slot);
        return;
      }
      onChange({ ...cur, [f]: text.slice(0, -1) });
      play('erase');
      return;
    }
    if (text.length >= 3) return;
    onChange({ ...cur, [f]: text + key });
    play('key', Number(key));
  };
  const move = (step) => {
    const i = slots.findIndex((s) => s.slot === ref.current.focus);
    const n = slots[(i + step + slots.length) % slots.length];
    setFocus(n.slot);
    play('slot');
  };
  useEffect(() => {
    const onKey = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        press('back');
      } else if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        move(e.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const box = (t, key) => (
    <button
      key={key}
      type="button"
      className={`lk-slot ${focus === t.slot && !locked ? 'is-on' : ''} ${v[t.slot] ? 'is-filled' : ''}`}
      onClick={() => {
        setFocus(t.slot);
        play('slot');
      }}
      disabled={locked}
      data-lk-slot={t.slot}
      aria-label={t.label}
    >
      <span>{v[t.slot] ?? ''}</span>
      <small>{t.label}</small>
    </button>
  );
  // a fraction token: its two terms one above the other with a real bar (a term is a number or a box)
  const term = (x, key) => (typeof x === 'string' ? <b key={key}>{x}</b> : box(x, key));
  const frac = (t, key) => (
    <span key={key} className="lk-frac" data-lk-frac={t.frac.map((x) => (typeof x === 'string' ? x : '▢')).join('/')}>
      {term(t.frac[0], 'top')}
      <i aria-hidden="true" />
      {term(t.frac[1], 'bottom')}
    </span>
  );
  // a power: its base (a number, « (−8) », or a fraction in tall brackets) and its exponent as a REAL superscript
  const pow = ([base, exp], key) => (
    <span key={key} className="lk-pow" data-lk-pow={`${typeof base === 'string' ? base : base.frac.join('/')}^${exp}`}>
      {typeof base === 'string' ? (
        <b>{base}</b>
      ) : (
        <>
          <span className="lk-pow__paren" aria-hidden="true">
            (
          </span>
          {frac(base, 'base')}
          <span className="lk-pow__paren" aria-hidden="true">
            )
          </span>
        </>
      )}
      <sup>{exp}</sup>
    </span>
  );
  return (
    <div className="lk-write" data-lk-gesture="write">
      <div className="lk-equation" dir="ltr">
        {q.tokens.map((t, i) =>
          typeof t === 'string' ? <b key={i}>{t}</b> : t.pow ? pow(t.pow, i) : t.frac ? frac(t, i) : box(t, i),
        )}
      </div>
      <div className="lk-keys" dir="ltr">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
          <button key={d} type="button" onClick={() => press(d)} disabled={locked} data-lk-key={d}>
            {d}
          </button>
        ))}
        <button
          type="button"
          className="lk-keys__back"
          onClick={() => press('back')}
          disabled={locked}
          aria-label="امسح"
          data-lk-key="back"
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  );
}

/**
 * A card shows a number or an equality (left-to-right), or a sentence in Arabic (`say`: right-to-left, smaller). A
 * sentence that carries a LIST (`card.list`, « قواسم 54: 1 ، 2 ، … ») is smaller again (`data-lk-list`): two lines at most,
 * broken after a comma, for the longest list a family draws (LAUNCH_KIT.md).
 */
const CardText = ({ card }) =>
  card.say ? (
    <span dir="rtl" className="lk-say" data-lk-list={Array.isArray(card.list) ? '' : undefined}>
      {card.text}
    </span>
  ) : card.text.startsWith('$') ? (
    <span dir="ltr">
      <MathText>{card.text}</MathText>
    </span>
  ) : (
    <span dir="ltr">{card.text}</span>
  );

export function Sort({ q, value, onChange, locked, play }) {
  const v = value ?? {};
  const next = q.cards.find((c) => !v[c.id]);
  const left = q.cards.filter((c) => !v[c.id]).length;
  const [drag, setDrag] = useState(null);
  const from = useRef(null);
  const boxes = useRef({});
  const send = (bin) => {
    if (locked || !next) return;
    onChange({ ...v, [next.id]: bin });
    play('drop', bin === 'yes' ? 1 : 0);
  };
  const back = (id) => {
    if (locked) return;
    const n = { ...v };
    delete n[id];
    onChange(n);
    play('back');
  };
  // the card follows the hand; the box under it lights up; letting go over a box sends the card, anywhere else it comes back
  const overOf = (e) =>
    q.bins
      .map((b) => b.id)
      .find((id) => {
        const r = boxes.current[id]?.getBoundingClientRect();
        return r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      }) ?? null;
  const down = (e) => {
    if (locked || !next) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    from.current = { x: e.clientX, y: e.clientY, z: parseFloat(e.currentTarget.closest('.lk-fit')?.style.zoom) || 1 };
    setDrag({ dx: 0, dy: 0, over: null });
    play('lift');
  };
  const move = (e) => {
    const f = from.current;
    if (!f) return;
    setDrag({ dx: (e.clientX - f.x) / f.z, dy: (e.clientY - f.y) / f.z, over: overOf(e) });
  };
  const up = (e) => {
    if (!from.current) return;
    const over = overOf(e);
    from.current = null;
    setDrag(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (over) send(over);
  };
  const box = (bin) => (
    <div
      ref={(el) => {
        boxes.current[bin.id] = el;
      }}
      className={`lk-box lk-box--${bin.id} ${next && !locked ? 'is-open' : ''} ${drag?.over === bin.id ? 'is-over' : ''}`}
      data-lk-bin={bin.id}
    >
      <button
        type="button"
        className="lk-box__door"
        onClick={() => send(bin.id)}
        disabled={locked || !next}
        data-lk-send={bin.id}
      >
        <strong>{bin.label}</strong>
      </button>
      <div className="lk-box__in">
        {q.cards
          .filter((c) => v[c.id] === bin.id)
          .map((c) => (
            <button
              key={c.id}
              type="button"
              className="lk-chip"
              onClick={() => back(c.id)}
              disabled={locked}
              title="أعد البطاقة"
              data-lk-placed={c.id}
            >
              <CardText card={c} />
            </button>
          ))}
      </div>
    </div>
  );
  return (
    <div className="lk-sort" data-lk-gesture="sort">
      {box(q.bins[0])}
      <div className="lk-hand">
        {next ? (
          <div
            className={`lk-card ${drag ? 'is-drag' : ''}`}
            key={next.id}
            style={
              drag
                ? {
                    transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${Math.max(-8, Math.min(8, drag.dx * 0.03))}deg)`,
                  }
                : undefined
            }
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              from.current = null;
              setDrag(null);
            }}
            data-lk-card={next.id}
          >
            <CardText card={next} />
          </div>
        ) : (
          <div className="lk-card lk-card--none">{locked ? '' : 'كلّ البطاقات في صناديقها. اضغط بطاقة لتعيدها.'}</div>
        )}
        <div className="lk-pile" aria-hidden="true">
          {Array.from({ length: Math.max(0, left - 1) }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        {next && !locked && <p className="lk-hand__tip">اسحب البطاقة إلى صندوقها ⇄</p>}
      </div>
      {box(q.bins[1])}
    </div>
  );
}

const W = 940;
const H = 250;
const X0 = 46;
const X1 = 894;
const Y = 168;

export function Place({ q, value, onChange, locked, play }) {
  const svg = useRef(null);
  const x = value?.x ?? 0;
  const down = useRef(false);
  const last = useRef(x);
  last.current = x;
  const px = (n) => X0 + (n / q.max) * (X1 - X0);
  const set = (e) => {
    if (locked) return;
    const p = svgPoint(svg.current, e, W, H);
    const n = Math.max(0, Math.min(q.max, Math.round(((p.x - X0) / (X1 - X0)) * q.max)));
    if (n !== last.current || !value?.moved) {
      onChange({ x: n, moved: true });
      play('flag', n);
    }
  };
  const key = (e) => {
    if (locked) return;
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = Math.max(0, Math.min(q.max, x + d));
    onChange({ x: n, moved: true });
    play('flag', n);
  };
  return (
    <div className="lk-place" data-lk-gesture="place">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={locked ? 'is-locked' : ''}
        data-lk-line
        data-lk-x={x}
        onPointerDown={(e) => {
          e.preventDefault();
          down.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          set(e);
        }}
        onPointerMove={(e) => {
          if (down.current) set(e);
        }}
        onPointerUp={(e) => {
          down.current = false;
          e.currentTarget.releasePointerCapture?.(e.pointerId);
        }}
        onPointerCancel={() => {
          down.current = false;
        }}
      >
        <line x1={X0 - 16} y1={Y} x2={X1 + 22} y2={Y} stroke="#e8ecff" strokeWidth="3.5" strokeLinecap="round" />
        <path d={`M ${X1 + 22} ${Y} l -11 -7 v 14 z`} fill="#e8ecff" />
        {Array.from({ length: q.max + 1 }, (_, n) => (
          <line
            key={n}
            x1={px(n)}
            y1={Y - (n % 5 === 0 ? 10 : 5)}
            x2={px(n)}
            y2={Y + (n % 5 === 0 ? 10 : 5)}
            stroke="rgba(232,236,255,.6)"
            strokeWidth={n % 5 === 0 ? 2.2 : 1.2}
          />
        ))}
        {Array.from({ length: Math.floor(q.max / 5) + 1 }, (_, i) => i * 5).map((n) => (
          <text key={n} x={px(n)} y={Y + 38} textAnchor="middle" fontSize="20" fill="#c7d2fe">
            {n}
          </text>
        ))}
        <g>
          <line x1={px(q.a)} y1={Y} x2={px(q.a)} y2={Y - 58} stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 5" />
          <circle cx={px(q.a)} cy={Y} r="7" fill="#fbbf24" stroke="#1b1f4b" strokeWidth="2.5" />
          <rect x={px(q.a) - 26} y={Y - 92} width="52" height="34" rx="11" fill="#fbbf24" />
          <text x={px(q.a)} y={Y - 68} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1b1f4b">
            {q.a}
          </text>
        </g>
        <g
          className="lk-flag"
          style={{ transform: `translateX(${px(x)}px)` }}
          tabIndex={0}
          role="slider"
          aria-label="موضع الراية"
          aria-valuenow={x}
          aria-valuemin={0}
          aria-valuemax={q.max}
          onKeyDown={key}
          data-lk-flag
        >
          {!value?.moved && <circle className="lk-pulse" cx="0" cy={Y} r="26" fill="#5eead4" />}
          <line x1="0" y1={Y} x2="0" y2={Y - 132} stroke="#5eead4" strokeWidth="5" strokeLinecap="round" />
          <path d={`M 0 ${Y - 132} l 46 15 l -46 15 z`} fill="#5eead4" />
          <circle cx="0" cy={Y} r="12" fill="#5eead4" stroke="#1b1f4b" strokeWidth="3" />
          <text x="0" y={Y - 142} textAnchor="middle" fontSize="26" fontWeight="900" fill="#99f6e4">
            {x}
          </text>
        </g>
      </svg>
    </div>
  );
}
