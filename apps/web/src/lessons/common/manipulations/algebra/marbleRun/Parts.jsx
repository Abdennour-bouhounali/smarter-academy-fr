import { useCallback, useRef, useState } from 'react';
import { marbleText } from '../../logic/marbleRun';

/**
 * Le décor de « مسار الكريات » : les billes (visage = le nombre ; vert d'eau positif, rouge négatif avec son « − »), le réservoir à
 * entonnoir de chaque lettre, les stations (copieuse, presse, basculeur, jonction), la corbeille de résultat et le mur à chevilles
 * du نادي العلوم. Tout est dessiné en SVG / DOM, paramétré par les props, texte arabe vivant.
 */
const LRI = '⁦';
const PDI = '⁩';
export const iso = (s) => `${LRI}${s}${PDI}`;

const TEAL = ['#5EEAD4', '#0D9488', '#115E59'];
const RED = ['#FDA4AF', '#E11D48', '#9F1239'];

/** Une bille portant son nombre. Une fraction s'écrit en pile ; un décimal avec sa virgule. */
export function MarbleBall({ m, size = 44, selected = false, ghost = false, className = '', ...rest }) {
  const neg = m.v.n < 0n;
  const [hi, mid, lo] = neg ? RED : TEAL;
  const a = neg ? -m.v.n : m.v.n;
  const frac = m.v.d !== 1n && m.fmt !== 'dec';
  const text = marbleText({ v: { n: a, d: m.v.d }, fmt: m.fmt });
  const fs = frac ? Math.round(size * 0.27) : Math.round(size * (text.length > 3 ? 0.34 : 0.44));
  return (
    <span data-mr-ball={m.id} data-sign={neg ? 'neg' : 'pos'}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-black tabular-nums text-white ${selected ? 'ring-4 ring-indigo-400 ring-offset-2' : ''} ${ghost ? 'opacity-90' : ''} ${className}`}
      style={{ width: size, height: size, background: `radial-gradient(circle at 32% 28%, ${hi} 0%, ${mid} 48%, ${lo} 100%)`, boxShadow: '0 3px 6px rgba(15,23,42,.35), inset 0 -3px 5px rgba(0,0,0,.25)', fontSize: fs }} {...rest}>
      <span aria-hidden="true" className="absolute rounded-full bg-white/70" style={{ left: size * 0.2, top: size * 0.14, width: size * 0.26, height: size * 0.14, transform: 'rotate(-28deg)' }} />
      <bdi dir="ltr" className="relative z-[1] flex items-center gap-[1px]" style={{ textShadow: '0 1px 2px rgba(0,0,0,.35)' }}>
        {neg && <span style={{ fontSize: Math.round(size * 0.4) }}>−</span>}
        {frac ? (
          <span className="flex flex-col items-center leading-none" style={{ gap: 1 }}>
            <span>{String(a)}</span><span className="block w-full border-t-2 border-white/90" /><span>{String(m.v.d)}</span>
          </span>
        ) : <span>{text}</span>}
      </bdi>
    </span>
  );
}

/** Le glisser d'une bille du râtelier vers un réservoir : un geste court = on prend la bille ; plus long = on la lâche où le doigt s'arrête. */
export function useMarbleDrag({ onDrop, onPick }) {
  const [drag, setDrag] = useState(null);
  const cb = useRef({ onDrop, onPick });
  cb.current = { onDrop, onPick };
  const start = useCallback((m) => (e) => {
    if (e.button != null && e.button !== 0) return;
    const sx = e.clientX; const sy = e.clientY; let moved = false;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;
      moved = true; setDrag({ m, x: ev.clientX, y: ev.clientY });
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      setDrag(null);
      if (!moved) { cb.current.onPick(m); return; }
      const hit = (document.elementsFromPoint?.(ev.clientX, ev.clientY) ?? []).map((n) => n.closest?.('[data-mr-reservoir]')).find(Boolean);
      if (hit) cb.current.onDrop(hit.getAttribute('data-mr-reservoir'), m);
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  }, []);
  const ghost = drag ? (
    <div className="pointer-events-none fixed z-[70]" style={{ left: drag.x - 24, top: drag.y - 24 }} data-mr-ghost><MarbleBall m={drag.m} size={48} ghost /></div>
  ) : null;
  return { start, ghost, dragging: !!drag };
}

/** Le râtelier : les billes à prendre. Flèches ← → pour passer de l'une à l'autre ; Entrée la prend. */
export function Rack({ marbles, held, onPick, dragStart, label, itemAria, coachRing }) {
  const move = (e) => {
    const k = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!k) return;
    const items = [...e.currentTarget.parentElement.querySelectorAll('[data-mr-marble]')];
    const i = items.indexOf(e.currentTarget);
    items[(i + k + items.length) % items.length]?.focus();
    e.preventDefault();
  };
  return (
    <div role="group" aria-label={label} data-mr-rack data-coach-ring={coachRing ? '' : undefined} dir="ltr"
      className="flex flex-wrap items-center justify-center gap-0 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100 px-1.5 py-1">
      {marbles.map((m) => (
        <button key={m.id} type="button" data-mr-marble={m.id} aria-pressed={held?.id === m.id} aria-label={itemAria(m)}
          onPointerDown={dragStart(m)} onClick={(e) => { if (e.detail === 0) onPick(m); }} onKeyDown={move}
          className="flex min-h-[44px] min-w-[44px] touch-none items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
          <MarbleBall m={m} size={38} selected={held?.id === m.id} />
        </button>
      ))}
    </div>
  );
}

/** Le réservoir d'une lettre : un entonnoir de verre ; la bille lâchée y reste, et part vers CHAQUE mur d'entrée de la lettre. */
export function Reservoir({ letter, marble, held, onDrop, name, full, aria, size = 1 }) {
  const w = 74 * size; const h = 80 * size;
  return (
    <button type="button" data-mr-reservoir={letter} data-filled={marble ? 'true' : 'false'} data-ready={held ? 'true' : 'false'} onClick={() => onDrop?.(letter)}
      aria-label={marble ? full : aria}
      className={`relative flex flex-col items-center rounded-2xl px-2 pb-1 pt-1 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-indigo-300 ${held ? 'bg-indigo-100/80 ring-2 ring-indigo-400' : 'bg-white/50'}`}>
      <svg width={w} height={h} viewBox="0 0 74 80" aria-hidden="true">
        <defs>
          <linearGradient id={`mr-glass-${letter}`} x1="0" x2="1"><stop offset="0" stopColor="#E0F2FE" stopOpacity=".95" /><stop offset=".5" stopColor="#F0F9FF" stopOpacity=".55" /><stop offset="1" stopColor="#BAE6FD" stopOpacity=".95" /></linearGradient>
        </defs>
        <path d="M6 6 H68 L46 46 V70 H28 V46 Z" fill={`url(#mr-glass-${letter})`} stroke="#0369A1" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 12 L30 42" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        <rect x="26" y="68" width="22" height="7" rx="2" fill="#B45309" />
      </svg>
      {marble && <span className="absolute" style={{ top: 11 * size, left: '50%', transform: 'translateX(-50%)' }}><MarbleBall m={marble} size={Math.round(34 * size)} /></span>}
      <span className="mt-0.5 rounded-full bg-sky-700 px-2.5 py-0.5 text-sm font-black text-white" data-mr-reservoir-name>{name}</span>
    </button>
  );
}

const ICON = {
  pow: (n) => (
    <g>
      <circle cx="9" cy="14" r="6.5" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" /><circle cx="25" cy="14" r="6.5" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" />
      <path d="M13 24 L17 29 L21 24" stroke="#115E59" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {n === 3 && <circle cx="17" cy="6" r="4.5" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" />}
    </g>
  ),
  mul: () => (
    <g>
      <rect x="3" y="4" width="28" height="7" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="2" /><rect x="14" y="11" width="6" height="6" fill="#64748B" />
      <circle cx="10" cy="24" r="5.5" fill="#5EEAD4" stroke="#0F766E" strokeWidth="2" /><circle cx="25" cy="24" r="5.5" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
    </g>
  ),
  neg: () => (
    <g>
      <path d="M6 10 H24 L19 5 M28 22 H10 L15 27" stroke="#9F1239" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="16" r="4" fill="#FDA4AF" stroke="#9F1239" strokeWidth="2" />
    </g>
  ),
  add: (sign) => (
    <g>
      <path d="M4 4 L17 18 M30 4 L17 18 M17 18 V28" stroke="#475569" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <text x="17" y="14" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0F766E">{sign}</text>
    </g>
  ),
};

/** Une station : une petite machine étiquetée ; sa puce dit son calcul quand la bille est passée ; allumée = c'est là que la ligne et le mur se séparent. */
export function StationCard({ st, name, chip, lit, reached, size, active = false }) {
  return (
    <div data-mr-station={st.id} data-op={st.op} data-lit={lit ? 'true' : 'false'} data-active={active ? 'true' : 'false'} data-reached={reached ? 'true' : 'false'}
      className={`relative flex min-w-[78px] flex-col items-center gap-0.5 rounded-xl border-2 px-1.5 pb-1 pt-1 text-center ${lit ? 'border-amber-500 bg-amber-100 ring-4 ring-amber-300/80' : 'border-amber-800/40 bg-amber-50/90'} ${size === 'sm' ? 'min-w-[66px]' : ''}`}
      style={{ boxShadow: '0 2px 0 rgba(120,53,15,.35)' }}>
      <svg width="34" height="31" viewBox="0 0 34 31" aria-hidden="true">
        {st.op === 'pow' ? ICON.pow(st.n) : st.op === 'mul' ? ICON.mul() : st.op === 'neg' ? ICON.neg() : ICON.add(st.op === 'add' ? '+' : '−')}
      </svg>
      <span className="text-[12px] font-black leading-tight text-amber-950">{name}</span>
      <bdi dir="ltr" data-mr-chip className={`min-h-[18px] whitespace-nowrap text-[13px] font-extrabold tabular-nums ${reached ? 'text-teal-800' : 'text-transparent'}`}>{chip || '·'}</bdi>
    </div>
  );
}

/** La corbeille de résultat : la valeur du mur, une fois la course finie. */
export function Basket({ value, label, ok }) {
  return (
    <div data-mr-basket data-value={value ?? ''} className={`flex min-w-[88px] flex-col items-center rounded-xl border-2 px-2 pb-1 pt-1 ${ok ? 'border-emerald-500 bg-emerald-50' : 'border-sky-400 bg-sky-50'}`}>
      <svg width="40" height="26" viewBox="0 0 40 26" aria-hidden="true">
        <path d="M3 4 H37 L32 24 H8 Z" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2.5" strokeLinejoin="round" /><path d="M10 8 L13 20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-[12px] font-black text-sky-900">{label}</span>
      <bdi dir="ltr" className="min-h-[28px] text-2xl font-black tabular-nums text-indigo-900" data-mr-basket-value>{value ?? '؟'}</bdi>
    </div>
  );
}

/** Le mur à chevilles du نادي العلوم. */
export function Pegboard({ children, className = '', ...rest }) {
  return (
    <div {...rest} className={`rounded-2xl border-2 border-amber-700/50 p-2 ${className}`}
      style={{ background: 'radial-gradient(circle at 11px 11px, rgba(120,70,20,.28) 2px, transparent 3px) 0 0/22px 22px, linear-gradient(180deg, #F2E2BE, #E8D2A2)' }}>
      {children}
    </div>
  );
}

