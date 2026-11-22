/**
 * THE STUDENT'S PEN over a mission — he writes on the screen as the teacher does on the board (owner, 2026-11-20): he
 * underlines the exam text, circles a number, poses a division. While the pen is open it takes every touch; closed, what
 * he drew STAYS on the screen (his marks on the text) and the mission is played through it. Three colours, undo, « امسح ».
 */
import { useRef, useState } from 'react';
import { Eraser, Undo2, X } from 'lucide-react';

const PENS = ['#dc2626', '#1d4ed8', '#0f172a'];

export default function Ink({ open, onClose }) {
  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState(PENS[0]);
  const live = useRef(false);
  const svg = useRef(null);
  const at = (e) => {
    const r = svg.current.getBoundingClientRect();
    return [Math.round(e.clientX - r.left), Math.round(e.clientY - r.top)];
  };
  const down = (e) => {
    e.preventDefault();
    svg.current.setPointerCapture?.(e.pointerId);
    live.current = true;
    setStrokes((s) => [...s, { color, pts: [at(e)] }]);
  };
  const move = (e) => {
    if (!live.current) return;
    const p = at(e);
    setStrokes((s) => {
      const last = s[s.length - 1];
      const q = last.pts[last.pts.length - 1];
      if (Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 3) return s;
      return [...s.slice(0, -1), { ...last, pts: [...last.pts, p] }];
    });
  };
  const up = () => {
    live.current = false;
  };
  return (
    <div className={`ms-ink ${open ? 'is-open' : ''}`} data-ms-ink={strokes.length}>
      <svg ref={svg} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {strokes.map((s, i) =>
          s.pts.length === 1 ? (
            <circle key={i} cx={s.pts[0][0]} cy={s.pts[0][1]} r="3" fill={s.color} />
          ) : (
            <polyline
              key={i}
              points={s.pts.map((p) => p.join(',')).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ),
        )}
      </svg>
      {open && (
        <div className="ms-inkbar" dir="rtl">
          {PENS.map((c) => (
            <button
              key={c}
              type="button"
              className={`ms-pen ${color === c ? 'is-on' : ''}`}
              style={{ '--pen': c }}
              onClick={() => setColor(c)}
              aria-label="لون القلم"
              data-ms-pen={c}
            />
          ))}
          <button
            type="button"
            className="ms-btn ms-btn--ghost"
            disabled={!strokes.length}
            data-ms-ink-undo
            onClick={() => setStrokes((s) => s.slice(0, -1))}
          >
            <Undo2 size={18} aria-hidden="true" /> تراجع
          </button>
          <button
            type="button"
            className="ms-btn ms-btn--ghost"
            disabled={!strokes.length}
            data-ms-ink-clear
            onClick={() => setStrokes([])}
          >
            <Eraser size={18} aria-hidden="true" /> امسح
          </button>
          <button type="button" className="ms-btn" data-ms-ink-close onClick={onClose}>
            <X size={18} aria-hidden="true" /> أغلق القلم
          </button>
        </div>
      )}
    </div>
  );
}
