import { useCallback, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import useDragInteraction from '../../useDragInteraction';
import * as L from '../../logic/areaSplit';
import { lineLayout, arcOf } from './arrowsLayout';
import { plain, signed } from './format';

/**
 * LES FLÈCHES (monde `arrows`) : l'expression écrite en grosses puces ; la main TRACE la flèche rouge d'une puce du 1er facteur vers une puce de
 * l'autre parenthèse (glisser, toucher-toucher, clavier) ; une carte du produit partiel apparaît avec sa grandeur et deux boutons de signe
 * (jugés par la valeur à x). Vue PURE : tout l'état est `lab`, les gestes passent par `drag` (useDragInteraction) et `setLab`.
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';

function ArrowLine({ lab, k, width, drag }) {
  const lay = lineLayout(lab.expr, { width });
  const boxRef = useRef(null);
  const linked = lab.arrows.filter((a) => lab.linked[a.id]);
  const rankIn = {};
  const arrivals = {};
  for (const a of linked) arrivals[a.tj] = (arrivals[a.tj] ?? 0) + 1;
  const seen = {};
  const arcs = linked.map((a) => {
    rankIn[a.oi] = rankIn[a.oi] ?? 0;
    const slot = seen[a.tj] ?? 0; seen[a.tj] = slot + 1;
    const arc = arcOf(lay, a.oi, a.tj, { rank: rankIn[a.oi], arrivals: arrivals[a.tj], slot });
    rankIn[a.oi] += 1;
    return { a, arc };
  });
  // le fil qui suit le doigt pendant un glisser
  let rubber = null;
  if (drag.held?.startsWith('o:') && drag.ghost && boxRef.current) {
    const r = boxRef.current.getBoundingClientRect();
    const o = lay.origins.find((q) => q.oi === Number(drag.held.slice(2)));
    if (o) rubber = { x1: o.cx, y1: lay.arcH - 2, x2: drag.ghost.x - r.left, y2: drag.ghost.y - r.top };
  }
  const fs = Math.round(22 * Math.max(lay.scale, 0.86));
  return (
    <div ref={boxRef} className="relative mx-auto select-none" dir="ltr" style={{ width, height: lay.height }} data-as-expr>
      <svg className="pointer-events-none absolute inset-0" width={width} height={lay.height} aria-hidden="true">
        <defs><marker id="as-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#DC2626" /></marker></defs>
        {arcs.map(({ a, arc }) => (
          <path key={a.id} d={arc.d} fill="none" stroke="#DC2626" strokeWidth="3.2" strokeLinecap="round" markerEnd="url(#as-arrowhead)" className="as-pop" data-as-arrow={a.id} />
        ))}
        {rubber && <line x1={rubber.x1} y1={rubber.y1} x2={rubber.x2} y2={rubber.y2} stroke="#DC2626" strokeWidth="3" strokeDasharray="6 5" opacity="0.7" />}
      </svg>
      {lay.tokens.map((tk, idx) => {
        const style = { left: tk.x, top: lay.arcH, width: tk.w, height: lay.chipH };
        if (tk.kind === 'op') return <span key={idx} className="absolute flex items-center justify-center font-black text-slate-700" style={{ ...style, fontSize: fs + 4 }} aria-hidden="true">{tk.text}</span>;
        if (tk.kind === 'paren') return <span key={idx} className="absolute flex items-center justify-center font-light text-slate-500" style={{ ...style, fontSize: fs + 14 }} aria-hidden="true">{tk.text}</span>;
        if (tk.side === 'f1') {
          const zp = drag.zoneProps(`o:${tk.oi}`);
          const sp = drag.sourceProps(`o:${tk.oi}`, { disabled: lab.solvedNow });
          const done = L.targetsLeft(lab, tk.oi).length === 0;
          const held = drag.held === `o:${tk.oi}`;
          return (
            <div key={idx} {...zp} className="absolute" style={style} data-as-origin-zone={tk.oi}>
              <button type="button" {...sp} data-as-origin={tk.oi} data-k={tk.k} data-done={done ? 'true' : 'false'} data-as-nav="" aria-label={plainAria(k, 'originAria', tk, lab)}
                className={`flex h-full w-full items-center justify-center rounded-2xl border-[3px] font-black tabular-nums transition-colors ${ring} ${held ? 'border-rose-500 bg-rose-100 text-rose-900 ring-4 ring-rose-300' : done ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-white text-slate-900 shadow-[0_3px_0_0_#FECDD3]'} ${drag.rejected === `o:${tk.oi}` ? 'as-shake' : ''}`}
                style={{ ...sp.style, fontSize: fs }}>
                <bdi dir="ltr">{tk.text}</bdi>
              </button>
            </div>
          );
        }
        const zp = drag.zoneProps(`t:${tk.tj}`, { disabled: lab.solvedNow });
        const targetOfHeld = drag.held && drag.held.startsWith('o:');
        return (
          <div key={idx} {...zp} role="button" tabIndex={0} data-as-target={tk.tj} data-k={tk.k} data-as-nav="" aria-label={plainAria(k, 'targetAria', tk, lab)} className={`absolute flex items-center justify-center rounded-2xl border-[3px] font-black tabular-nums transition-colors ${ring} ${zp['data-drop-active'] ? 'border-rose-500 bg-rose-100' : targetOfHeld ? 'border-rose-300 bg-rose-50 shadow-[0_0_0_4px_rgba(251,113,133,0.25)]' : 'border-indigo-200 bg-white'} text-slate-900`} style={{ ...style, fontSize: fs }}>
            <bdi dir="ltr">{tk.text}</bdi>
          </div>
        );
      })}
    </div>
  );
}
const plainAria = (k, key, tk) => k(key, { term: tk.text.replace(/\s/g, '') });

/** La carte d'un produit partiel : les deux termes, la grandeur, deux boutons de signe (neutres), puis le terme signé. */
export function ProductCards({ lab, setLab, k }) {
  const ids = Object.keys(lab.linked);
  const n = Math.max(lab.arrows.length, 1);
  if (!ids.length) {
    return <div className="flex min-h-[92px] items-center justify-center rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 px-3 text-sm font-bold text-rose-900/70" data-as-cards-wait>{k('cardsWait.arrows')}</div>;
  }
  return (
    <div dir="ltr" className={`grid min-h-[92px] content-start gap-1.5 ${n >= 4 ? "grid-cols-4" : n === 3 ? "grid-cols-3" : n === 2 ? "grid-cols-2" : "grid-cols-1"}`} data-as-cards>
      {ids.map((id) => {
        const a = lab.arrows.find((q) => q.id === id);
        const sg = lab.linked[id].sign;
        const can = L.canSignProduct(lab, id);
        const btn = (sign) => {
          const chosen = sg === sign;
          return (
            <button key={sign} type="button" disabled={!can} onClick={() => setLab((s) => L.setProductSign(s, id, sign))} data-as-sign={sign > 0 ? 'plus' : 'minus'}
              aria-label={k(sign > 0 ? 'prodPlusAria' : 'prodMinusAria')} aria-pressed={chosen}
              className={`flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 ${ring} ${chosen ? (sign > 0 ? 'border-emerald-600 bg-emerald-500 text-white' : 'border-rose-600 bg-rose-500 text-white') : sg != null ? 'border-slate-200 bg-slate-50 text-slate-300' : 'border-indigo-200 bg-white text-indigo-900 shadow-[0_3px_0_0_#E0E3FF] active:translate-y-0.5 active:shadow-none hover:border-indigo-400'}`}>
              {sign > 0 ? <Plus className="h-5 w-5" strokeWidth={3.2} aria-hidden="true" /> : <Minus className="h-5 w-5" strokeWidth={3.2} aria-hidden="true" />}
            </button>
          );
        };
        return (
          <div key={id} data-as-product={id} data-sign={sg ?? ''} className={`as-pop min-w-0 space-y-1 rounded-2xl border-2 bg-white p-1.5 ${sg != null ? (sg > 0 ? 'border-emerald-300' : 'border-rose-300') : 'border-rose-200'}`}>
            <div dir="ltr" className="text-center">
              <bdi dir="ltr" className="whitespace-nowrap text-[14px] font-black tabular-nums text-slate-700">{plain(a.a)} {'\u00D7'} {a.b.c < 0 ? `(${plain(a.b)})` : plain(a.b)}</bdi>
              <div className="text-[19px] font-black leading-tight text-indigo-950"><bdi dir="ltr" data-as-mag>{sg != null ? signed(a.term, true) : plain(a.mag)}</bdi></div>
            </div>
            {sg == null && <div className="flex gap-1">{btn(1)}{btn(-1)}</div>}
          </div>
        );
      })}
    </div>
  );
}

/** Le monde `arrows` entier : la ligne et ses flèches, les cartes, et la ligne écrite (dans `AreaSplit`, sous les cartes). */
export default function ArrowsScene({ lab, setLab, k, width }) {
  const drag = useDragInteraction({
    accepts: (src, zone) => (zone === src ? '' : true),
    onDrop: (src, zone) => {
      const oi = Number(src.slice(2));
      if (zone.startsWith('t:')) setLab((s) => L.link(s, oi, Number(zone.slice(2))));
      else if (zone.startsWith('o:')) setLab((s) => L.linkOnOrigin(s, oi, Number(zone.slice(2))));
    },
  });
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { drag.release(); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const from = e.target.closest?.('[data-as-nav]');
    if (!from) return;
    const all = [...e.currentTarget.querySelectorAll('[data-as-nav]')];
    const i = all.indexOf(from);
    if (i < 0) return;
    e.preventDefault();
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    all[(i + (fwd ? 1 : -1) + all.length) % all.length]?.focus();
  }, [drag]);
  const w = Math.max(280, Math.min(width - 8, 620));
  return (
    <div className="space-y-2" onKeyDown={onKeyDown} data-as-arrows-scene>
      <div className="flex items-end justify-center gap-2 rounded-2xl bg-[#F3EEDA] px-2 pb-2 pt-1">
        <ArrowLine lab={lab} setLab={setLab} k={k} width={w} drag={drag} />
      </div>
    </div>
  );
}
