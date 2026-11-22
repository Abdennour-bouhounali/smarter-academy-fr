/**
 * « قوس القواسم » — every number from 1 to a on a line. The student's hand holds the LENS: each number it passes over is
 * tested; a divisor rises with its partner and an arc joins them. Sweep the whole line and the rainbow of divisors is complete.
 */
import { useEffect, useRef, useState } from 'react';
import { VW, VH, useDrag, useChime, Tool, M } from '../kit';
import { divisorsOf, divisorPairs, divide } from '../logic';

const X0 = 44;
const X1 = 896;
const Y = 268;

export default function Divisors({ a, b, play, report }) {
  const svg = useRef(null);
  const [probe, setProbe] = useState(null);
  const [found, setFound] = useState([]);
  const cur = useRef(null);
  useEffect(() => {
    setProbe(null);
    setFound([]);
    cur.current = null;
  }, [a]);
  useEffect(() => {
    report({ key: `${a}:${b}`, found });
  }, [found]); // eslint-disable-line react-hooks/exhaustive-deps
  const x = (d) => (a === 1 ? (X0 + X1) / 2 : X0 + ((d - 1) / (a - 1)) * (X1 - X0));
  const test = (p) => {
    const d = Math.max(1, Math.min(a, Math.round(1 + ((p.x - X0) / (X1 - X0)) * (a - 1))));
    if (d === cur.current) return;
    cur.current = d;
    setProbe(d);
    if (a % d === 0) {
      setFound((f) => (f.includes(d) ? f : [...new Set([...f, d, a / d])].sort((u, v) => u - v)));
      play('found', d, a / d);
    } else play('miss');
  };
  const drag = useDrag(svg, { onStart: test, onMove: test });
  const all = divisorsOf(a);
  const complete = all.every((d) => found.includes(d));
  const pairs = divisorPairs(a).filter(([d]) => found.includes(d));
  useChime(play, 'complete', complete, [complete, a], { delay: 320 });
  const res = probe ? divide(a, probe) : null;
  const px = probe ? x(probe) : X0;
  return (
    <Tool
      id="divisors"
      tone={complete ? 'good' : res && res.r === 0 ? 'good' : 'plain'}
      reading={
        probe === null ? (
          <span className="ll-chip ll-chip--dim">اسحب العدسة على المستقيم: كلّ عدد تمرّ عليه يُختبَر.</span>
        ) : (
          <>
            <M>{`${a} = ${probe} \\times ${res.q}${res.r ? ` + ${res.r}` : ''}`}</M>
            {res.r === 0 ? (
              <span className="ll-chip ll-chip--good">
                {probe} قاسم{probe * probe === a ? '، وهو رفيق نفسه' : `، ورفيقه ${a / probe}`}
              </span>
            ) : (
              <span className="ll-chip ll-chip--warm">
                الباقي {res.r}: {probe} ليس قاسمًا
              </span>
            )}
            {complete ? (
              <span className="ll-chip ll-chip--good" data-ll-complete>
                اكتملت: {all.length}{' '}
                {all.length > 10 ? 'قاسمًا' : all.length > 2 ? 'قواسم' : all.length === 2 ? 'قاسمان' : 'قاسم'} للعدد {a}
              </span>
            ) : (
              <span className="ll-chip ll-chip--dim">المكتشفة: {found.length}</span>
            )}
          </>
        )
      }
    >
      <svg ref={svg} viewBox={`0 0 ${VW} ${VH}`} data-ll-divisors data-found={found.join(',')}>
        {pairs.map(([d, e], i) =>
          d === e ? (
            <circle key={d} cx={x(d)} cy={Y - 16} r="14" className="ll-arc" stroke={`hsl(${160 + i * 47} 85% 62%)`} />
          ) : (
            <path
              key={d}
              pathLength="1"
              className="ll-arc ll-arc--in"
              stroke={`hsl(${160 + i * 47} 85% 62%)`}
              d={`M ${x(d)} ${Y} A ${(x(e) - x(d)) / 2} ${Math.min(Y - 34, ((x(e) - x(d)) / 2) * 0.6 + 18)} 0 0 1 ${x(e)} ${Y}`}
            />
          ),
        )}
        <line x1={X0 - 16} y1={Y} x2={X1 + 16} y2={Y} stroke="#eafcff" strokeWidth="3" strokeLinecap="round" />
        {Array.from({ length: a }, (_, i) => i + 1).map((d) => (
          <line key={d} x1={x(d)} y1={Y - 5} x2={x(d)} y2={Y + 5} stroke="rgba(234,252,255,.5)" strokeWidth="1.5" />
        ))}
        {found.map((d, i) => (
          <g key={d}>
            <circle cx={x(d)} cy={Y} r="7" fill="#34d399" stroke="#06262c" strokeWidth="2" />
            <text x={x(d)} y={Y + 28 + (i % 3) * 19} textAnchor="middle" fontSize="17" style={{ fill: '#a7f3d0' }}>
              {d}
            </text>
          </g>
        ))}
        <text x={X1} y="24" textAnchor="end" fontSize="22" style={{ fill: '#fde68a' }}>
          {a}
        </text>
        <g className="ll-handle" {...drag} data-ll-lens>
          <rect x={X0 - 30} y={Y - 44} width={X1 - X0 + 60} height="90" fill="transparent" />
          {probe === null && <circle className="ll-pulse" cx={px} cy={Y} r="26" fill="#fbbf24" />}
          <circle cx={px} cy={Y} r="14" fill="rgba(251,191,36,.25)" stroke="#fbbf24" strokeWidth="4" />
          <line
            x1={px + 10}
            y1={Y + 10}
            x2={px + 22}
            y2={Y + 22}
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {probe !== null && (
            <g>
              <rect x={px - 24} y={Y - 62} width="48" height="30" rx="10" fill={res.r === 0 ? '#34d399' : '#fbbf24'} />
              <text x={px} y={Y - 40} textAnchor="middle" fontSize="20" style={{ fill: '#06262c' }}>
                {probe}
              </text>
            </g>
          )}
        </g>
      </svg>
    </Tool>
  );
}
