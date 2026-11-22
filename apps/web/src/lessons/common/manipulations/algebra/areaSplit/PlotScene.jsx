import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Minus, Scissors } from 'lucide-react';
import * as E from '@smarter-academy/core/arithmetic/expansion.js';
import * as L from '../../logic/areaSplit';
import { frameOf, geometry, badgeLayout, BADGE_R, KNOB_R, termLabel } from './plotLayout';
import { dimsOf } from './format';

/**
 * LE JARDIN DE L'ÉCOLE vu d'en haut (thème `schoolgarden`) — le monde `plot` de `area-split`. Une figure SVG LTR, à l'échelle : la pelouse,
 * le massif de fleurs (un nombre positif), l'allée dallée (un nombre négatif, hachurée une fois ôtée), la haie qui borde le terrain.
 * Avant la coupure le côté est UNE pelouse ; la coupure juste fait apparaître le massif ou l'allée. La main glisse la poignée (nombre
 * d'unités écrit dedans), la relâche : c'est l'essai. Vue PURE : tout l'état est `lab` (logic/areaSplit.js).
 */
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const FONT = 'ui-sans-serif, system-ui, sans-serif';
const COL = { lawn: '#86C98B', lawn2: '#7BBF83', bed: '#8E6240', path: '#DAD6CC', slab: '#BCB6A9', hedge: '#2F7D4B', yard: '#F3EEDA', ink: '#1E1B4B', rose: '#E11D48' };

function Defs() {
  return (
    <defs>
      <pattern id="as-lawn" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
        <rect width="26" height="26" fill={COL.lawn} />
        <rect width="13" height="26" fill={COL.lawn2} />
      </pattern>
      <pattern id="as-bed" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill={COL.bed} />
        <g>
          <circle cx="8" cy="8" r="3.4" fill="#F9A8D4" /><circle cx="8" cy="8" r="1.3" fill="#FDE047" />
          <circle cx="22" cy="12" r="3.4" fill="#FDE68A" /><circle cx="22" cy="12" r="1.3" fill="#F97316" />
          <circle cx="12" cy="23" r="3.4" fill="#FFFFFF" /><circle cx="12" cy="23" r="1.3" fill="#F59E0B" />
          <circle cx="26" cy="26" r="2.6" fill="#C4B5FD" />
        </g>
      </pattern>
      <pattern id="as-path" width="24" height="16" patternUnits="userSpaceOnUse">
        <rect width="24" height="16" fill={COL.path} />
        <path d="M0 0.5 H24 M0 8.5 H24 M0.5 0 V8 M12.5 8 V16" stroke={COL.slab} strokeWidth="1.3" fill="none" />
      </pattern>
      <pattern id="as-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="9" height="9" fill="rgba(255,255,255,0.12)" />
        <line x1="0" y1="0" x2="0" y2="9" stroke={COL.rose} strokeWidth="3" opacity="0.62" />
      </pattern>
    </defs>
  );
}

/** Les segments à DESSINER selon les coupures acceptées : un côté pas encore coupé est une seule pelouse. */
function drawSegs(s, x, cut) {
  if (!E.isCuttable(s) || cut?.ok) {
    return E.segments(s).map((g) => ({ i: g.i, span: E.segmentSpan(s, g.i, x), kind: g.term.p === 1 || s.m === 0 ? 'lawn' : g.term.c > 0 ? 'bed' : 'path' }));
  }
  return [{ i: -1, span: { from: 0, to: E.drawnLength(s, x) }, kind: 'lawn' }];
}
const FILL = { lawn: 'url(#as-lawn)', bed: 'url(#as-bed)', path: 'url(#as-path)' };
const RANK = { lawn: 0, bed: 1, path: 2 };

export default function PlotScene({ lab, setLab, k, u, hot = null, ghost = null, showArea = false }) {
  const { h, w, x } = lab;
  const frame = frameOf(h, w, u, lab.scaffold);
  const geo = geometry({ h, w, x, u, scaffold: lab.scaffold, patches: lab.patches });
  const { ox, oy, W, H } = geo;
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [armed, setArmed] = useState(null);
  const dragRef = useRef(null);
  dragRef.current = drag;
  const cutting = L.phaseOf(lab) === 'cut';
  const patchesOn = L.cutDone(lab);

  const unitsAt = useCallback((e, side) => {
    const el = svgRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const sc = frame.vbW / (r.width || frame.vbW);
    return Math.round((side === 'w' ? ((e.clientX - r.left) * sc - ox) : ((e.clientY - r.top) * sc - oy)) / u);
  }, [frame.vbW, ox, oy, u]);

  const onDown = (side) => (e) => {
    if (!L.canCut(lab, side)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ side, sx: e.clientX, sy: e.clientY, moved: false, at: lab.cutAt[side] });
  };
  const onMove = (side) => (e) => {
    const d = dragRef.current;
    if (!d || d.side !== side) return;
    const moved = d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5;
    if (!moved) return;
    const at = unitsAt(e, side);
    setDrag({ ...d, moved: true, at });
    setLab((s) => L.moveCut(s, side, at));
  };
  const onUp = (side) => (e) => {
    const d = dragRef.current;
    if (!d || d.side !== side) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDrag(null);
    if (d.moved) { setArmed(null); setLab((s) => L.cutTo(s, side, unitsAt(e, side))); } else setArmed((a) => (a === side ? null : side));
  };
  const onKey = (side) => (e) => {
    if (!L.canCut(lab, side)) return;
    const fwd = side === 'w' ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
    const back = side === 'w' ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';
    if (fwd || back) { e.preventDefault(); setLab((s) => L.moveCut(s, side, s.cutAt[side] + (fwd ? 1 : -1))); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLab((s) => L.cutTo(s, side, s.cutAt[side])); }
  };
  useEffect(() => { if (!cutting) setArmed(null); }, [cutting]);

  /* les rectangles à dessiner : le produit des segments dessinés, du plus « pelouse » au plus « allée » */
  const sh = drawSegs(h, x, lab.cuts.h); const sw = drawSegs(w, x, lab.cuts.w);
  const tiles = sh.flatMap((a) => sw.map((b) => ({
    key: `${a.i}:${b.i}`, kind: RANK[a.kind] >= RANK[b.kind] ? a.kind : b.kind,
    x0: geo.sx(b.span.from), x1: geo.sx(b.span.to), y0: geo.sy(a.span.from), y1: geo.sy(a.span.to), corner: a.kind === 'path' && b.kind === 'path',
  }))).sort((a, b) => RANK[a.kind] - RANK[b.kind]);
  const badges = patchesOn ? badgeLayout(geo, { showArea, areas: Object.fromEntries(lab.patches.map((p) => [p.id, E.patchArea(p, x)])) }) : [];

  const ticks = (side) => {
    const len = E.drawnLength(side === 'w' ? w : h, x);
    return Array.from({ length: len + 1 }, (_, i) => i);
  };
  const knob = (side) => {
    if (!geo.knob[side] || !L.canCut(lab, side)) return null;
    const at = lab.cutAt[side];
    const g = geo.knob[side](at);
    const sel = drag?.side === side || armed === side;
    return (
      <g key={`knob-${side}`}>
        <line x1={g.line.x0} x2={g.line.x1} y1={g.line.y0} y2={g.line.y1} stroke={COL.ink} strokeWidth="2.4" strokeDasharray="7 5" opacity="0.8" />
        <g data-as-cut={side} data-at={at} role="slider" tabIndex={0} aria-orientation={side === 'w' ? 'horizontal' : 'vertical'}
          aria-valuemin={1} aria-valuemax={E.drawnLength(side === 'w' ? w : h, x) - 1} aria-valuenow={at}
          aria-label={k(side === 'w' ? 'cutAriaW' : 'cutAriaH', { at })}
          onPointerDown={onDown(side)} onPointerMove={onMove(side)} onPointerUp={onUp(side)} onPointerCancel={() => setDrag(null)} onKeyDown={onKey(side)}
          className={`as-knob ${ring}`} style={{ touchAction: 'none', cursor: 'grab', outline: 'none' }}>
          <rect x={g.cx - 22} y={g.cy - 22} width="44" height="44" fill="transparent" />
          <circle cx={g.cx} cy={g.cy} r={KNOB_R + (sel ? 3 : 0)} fill="#FDE68A" stroke="#B45309" strokeWidth="2.6" className="as-knob-disc" />
          <path d={side === 'w' ? `M${g.cx - KNOB_R - 6} ${g.cy} l-5 -4 v8 z M${g.cx + KNOB_R + 6} ${g.cy} l5 -4 v8 z` : `M${g.cx} ${g.cy - KNOB_R - 6} l-4 -5 h8 z M${g.cx} ${g.cy + KNOB_R + 6} l-4 5 h8 z`} fill="#B45309" />
          <text x={g.cx} y={g.cy + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill="#78350F" fontFamily={FONT} style={{ direction: 'ltr' }}>{at}</text>
        </g>
        {armed === side && ticks(side).slice(1, -1).map((i) => (
          <rect key={`t${i}`} x={side === 'w' ? geo.sx(i) - u / 2 : ox - 30} y={side === 'w' ? oy - 30 : geo.sy(i) - u / 2} width={side === 'w' ? u : 60} height={side === 'w' ? 60 : u}
            fill="#FDE68A" opacity="0.35" data-as-tick={`${side}${i}`} style={{ cursor: 'pointer' }}
            onClick={() => { setArmed(null); setLab((s) => L.cutTo(s, side, i)); }} />
        ))}
      </g>
    );
  };

  const hl = hot ? geo.rects.find((r) => r.id === hot) : null;
  const sideLabel = (s) => E.sideTerms(s).map((t, i) => (i === 0 ? termLabel(t) : `${t.c < 0 ? '−' : '+'} ${termLabel({ c: Math.abs(t.c), p: t.p })}`)).join(' ');
  const scaffold = lab.scaffold;
  const showBraces = scaffold;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${frame.vbW} ${frame.vbH}`} width={frame.vbW} height={frame.vbH} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      role="group" aria-label={k("plotAria", { h: E.sideTex(h), w: E.sideTex(w) })} data-as-plot data-u={u} data-vb={`${frame.vbW}x${frame.vbH}`}>
      <Defs />
            {/* le terrain */}
      <rect x={ox - 5} y={oy - 5} width={W + 10} height={H + 10} rx="7" fill="none" stroke={COL.hedge} strokeWidth="5" opacity="0.9" />
      <g>
        {tiles.map((t) => (
          <g key={t.key} className="as-pop">
            <rect x={t.x0} y={t.y0} width={t.x1 - t.x0} height={t.y1 - t.y0} fill={FILL[t.kind]} />
            {t.corner && <rect x={t.x0} y={t.y0} width={t.x1 - t.x0} height={t.y1 - t.y0} fill="url(#as-hatch)" opacity="0.0" />}
          </g>
        ))}
      </g>
      {/* ce que la main a décidé : une parcelle ôtée est hachurée, le coin rendu redevient pelouse */}
      {patchesOn && lab.patches.map((p) => {
        const r = geo.rects.find((q) => q.id === p.id);
        const sg = lab.signs[p.id];
        if (!sg) return null;
        const v = r.seen;
        if (sg < 0) return <rect key={`d${p.id}`} className="as-pop" x={v.x0} y={v.y0} width={v.x1 - v.x0} height={v.y1 - v.y0} fill="url(#as-hatch)" data-as-removed={p.id} />;
        if (p.corner) return <rect key={`d${p.id}`} className="as-pop" x={v.x0} y={v.y0} width={v.x1 - v.x0} height={v.y1 - v.y0} fill="url(#as-lawn)" stroke="#fff" strokeWidth="2.4" strokeDasharray="5 4" data-as-given-back={p.id} />;
        return null;
      })}
      <rect x={ox} y={oy} width={W} height={H} fill="none" stroke="rgba(30,27,75,0.45)" strokeWidth="1.5" />
      {/* les séparations des parcelles */}
      {patchesOn && geo.rects.map((r) => (
        <rect key={`o${r.id}`} x={r.seen.x0} y={r.seen.y0} width={r.seen.x1 - r.seen.x0} height={r.seen.y1 - r.seen.y0} fill="none" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 3" opacity="0.9" />
      ))}
      {hl && <rect x={hl.seen.x0 - 2} y={hl.seen.y0 - 2} width={hl.seen.x1 - hl.seen.x0 + 4} height={hl.seen.y1 - hl.seen.y0 + 4} fill="none" stroke="#4F46E5" strokeWidth="3.4" rx="3" data-as-hot={hot} />}
      {/* la règle : un cran par unité sur les bords coupables */}
      {['w', 'h'].filter((sd) => geo.knob[sd]).map((sd) => ticks(sd).map((i) => (
        <line key={`${sd}${i}`} x1={sd === 'w' ? geo.sx(i) : ox - 5} x2={sd === 'w' ? geo.sx(i) : ox} y1={sd === 'w' ? oy - 5 : geo.sy(i)} y2={sd === 'w' ? oy : geo.sy(i)} stroke={COL.ink} strokeWidth={i % 5 === 0 ? 1.8 : 1} opacity="0.55" />
      )))}
      {/* l'écriture des côtés */}
      <text x={ox + W / 2} y="13" textAnchor="middle" fontSize="15" fontWeight="900" fill={COL.ink} fontFamily={FONT} style={{ direction: 'ltr' }} data-as-side="w">{sideLabel(w)}</text>
      <text transform={`translate(11 ${oy + H / 2}) rotate(-90)`} textAnchor="middle" fontSize="15" fontWeight="900" fill={COL.ink} fontFamily={FONT} style={{ direction: 'ltr' }} data-as-side="h">{sideLabel(h)}</text>
      {/* les accolades : seulement une fois la coupure juste (مبتدئ) */}
      {showBraces && lab.cuts.w?.ok && geo.bracesTop.map((b) => (
        <g key={`bt${b.i}`} data-as-brace={`w${b.i}`}>
          <path d={`M${b.from + 2} ${b.line + 4} v-4 H${b.to - 2} v4`} fill="none" stroke={COL.ink} strokeWidth="1.8" />
          <text x={b.cx} y={b.cy + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={COL.ink} fontFamily={FONT} style={{ direction: 'ltr' }}>{b.label}</text>
        </g>
      ))}
      {showBraces && lab.cuts.h?.ok && geo.bracesLeft.map((b) => (
        <g key={`bl${b.i}`} data-as-brace={`h${b.i}`}>
          <path d={`M${b.line + 4} ${b.from + 2} h-4 V${b.to - 2} h4`} fill="none" stroke={COL.ink} strokeWidth="1.8" />
          <text x={b.cx} y={b.cy + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={COL.ink} fontFamily={FONT} style={{ direction: 'ltr' }}>{b.label}</text>
        </g>
      ))}
      {showBraces && lab.cuts.w?.ok && geo.stripsW.map((b) => (
        <text key={`sw${b.i}`} x={b.cx} y={b.cy + 5} textAnchor="middle" fontSize="13" fontWeight="900" fill={COL.rose} fontFamily={FONT} style={{ direction: 'ltr' }} data-as-strip={`w${b.i}`}>{b.label}</text>
      ))}
      {showBraces && lab.cuts.h?.ok && geo.stripsH.map((b) => (
        <text key={`sh${b.i}`} x={b.cx - b.w / 2} y={b.cy + 5} fontSize="13" fontWeight="900" fill={COL.rose} fontFamily={FONT} style={{ direction: 'ltr' }} data-as-strip={`h${b.i}`}>{b.label}</text>
      ))}
      {/* un essai refusé : la coupure et les deux longueurs NUMÉRIQUES qu'elle fait */}
      {ghost && (() => {
        const side = ghost.side;
        const len = E.drawnLength(side === 'w' ? w : h, x);
        const g = geo.knob[side]?.(ghost.at);
        if (!g) return null;
        const mid1 = (side === 'w' ? geo.sx(ghost.at / 2) : ox + 24); const mid2 = side === 'w' ? geo.sx((ghost.at + len) / 2) : ox + 24;
        const y1 = side === 'w' ? oy + 22 : geo.sy(ghost.at / 2); const y2 = side === 'w' ? oy + 22 : geo.sy((ghost.at + len) / 2);
        return (
          <g data-as-ghost={`${side}${ghost.at}`} className="as-fade">
            <line x1={g.line.x0} x2={g.line.x1} y1={g.line.y0} y2={g.line.y1} stroke={COL.rose} strokeWidth="3" strokeDasharray="7 5" />
            {[[mid1, y1, ghost.a], [mid2, y2, ghost.b]].map(([cx, cy, v], i) => (
              <g key={i}>
                <rect x={cx - 17} y={cy - 12} width="34" height="24" rx="12" fill={COL.rose} />
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff" fontFamily={FONT} style={{ direction: 'ltr' }}>{v}</text>
              </g>
            ))}
          </g>
        );
      })()}
      {knob('w')}{knob('h')}
      {/* les badges : le numéro de la parcelle, puis son signe */}
      {badges.map((b, i) => {
        const p = lab.patches[i];
        const sg = lab.signs[p.id];
        return (
          <g key={b.id} data-as-badge={b.id} data-sign={sg ?? ''} className={sg ? 'as-pop' : ''}>
            <circle cx={b.cx} cy={b.cy} r={BADGE_R} fill={sg ? (sg > 0 ? '#10B981' : COL.rose) : '#fff'} stroke={sg ? '#fff' : '#4F46E5'} strokeWidth="2.4" />
            {sg
              ? <path d={sg > 0 ? `M${b.cx - 5} ${b.cy} h10 M${b.cx} ${b.cy - 5} v10` : `M${b.cx - 5} ${b.cy} h10`} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              : <text x={b.cx} y={b.cy + 4.5} textAnchor="middle" fontSize="13" fontWeight="900" fill="#3730A3" fontFamily={FONT}>{i + 1}</text>}
            {b.pill && (
              <g data-as-area={b.id}>
                <rect x={b.pill.x} y={b.pill.y} width={b.pill.w} height={b.pill.h} rx="10" fill="#fff" stroke="rgba(30,27,75,0.25)" />
                <text x={b.pill.x + b.pill.w / 2} y={b.pill.y + 14.5} textAnchor="middle" fontSize="13" fontWeight="900" fill={COL.ink} fontFamily={FONT} style={{ direction: 'ltr' }}>{E.patchArea(p, x)}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Les cartes de décision : une par parcelle (numéro, dimensions, deux boutons neutres). Absentes tant que les coupures ne sont pas justes. */
export function PatchCards({ lab, setLab, k, setHot, compact = false, tight = false }) {
  if (!L.cutDone(lab)) {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 px-3 text-sm font-bold text-emerald-900/70 ${compact ? 'min-h-[88px]' : 'min-h-[92px]'}`} data-as-cards-wait>
        <Scissors className="h-5 w-5" aria-hidden="true" /> {k('cardsWait.plot')}
      </div>
    );
  }
  const n = lab.patches.length;
  return (
    <div dir="ltr" className={`grid gap-1.5 ${n >= 4 ? "grid-cols-4" : n === 3 ? "grid-cols-3" : n === 2 ? "grid-cols-2" : "grid-cols-1"}`} data-as-cards>
      {lab.patches.map((p, i) => {
        const sg = lab.signs[p.id];
        const can = L.canDecide(lab, p.id);
        const btn = (sign) => {
          const chosen = sg === sign;
          return (
            <button key={sign} type="button" disabled={!can} onClick={() => setLab((s) => L.decide(s, p.id, sign))} data-as-sign={sign > 0 ? 'plus' : 'minus'}
              aria-label={k(sign > 0 ? 'signAddAria' : 'signTakeAria', { n: i + 1 })} aria-pressed={chosen}
              className={`flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-0.5 rounded-xl border-2 px-0.5 text-[12.5px] font-black leading-tight transition-colors ${ring} ${chosen ? (sign > 0 ? 'border-emerald-600 bg-emerald-500 text-white' : 'border-rose-600 bg-rose-500 text-white') : sg ? 'border-slate-200 bg-slate-50 text-slate-300' : 'border-indigo-200 bg-white text-indigo-900 shadow-[0_3px_0_0_#E0E3FF] active:translate-y-0.5 active:shadow-none hover:border-indigo-400'}`}>
              {sign > 0 ? <Plus className={`h-3.5 w-3.5 shrink-0 ${tight ? 'hidden' : ''}`} strokeWidth={3.2} aria-hidden="true" /> : <Minus className={`h-3.5 w-3.5 shrink-0 ${tight ? 'hidden' : ''}`} strokeWidth={3.2} aria-hidden="true" />}
              <span>{k(sign > 0 ? 'signAdd' : 'signTake')}</span>
            </button>
          );
        };
        return (
          <div key={p.id} data-as-patch={p.id} data-sign={sg ?? ''} data-corner={p.corner ? 'true' : 'false'}
            onMouseEnter={() => setHot(p.id)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(p.id)} onBlur={() => setHot(null)}
            className={`min-w-0 space-y-1 rounded-2xl border-2 bg-white p-1.5 ${sg ? (sg > 0 ? 'border-emerald-300' : 'border-rose-300') : 'border-indigo-100'}`}>
            <div dir="ltr" className="flex items-center justify-center gap-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-indigo-500 bg-white text-[12px] font-black text-indigo-800">{i + 1}</span>
              <bdi dir="ltr" className="whitespace-nowrap text-[15px] font-black tabular-nums text-slate-800" data-as-dims>{dimsOf(p)}</bdi>
            </div>
            <div className="flex gap-1">{btn(1)}{btn(-1)}</div>
          </div>
        );
      })}
    </div>
  );
}
