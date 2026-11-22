import { useEffect, useMemo, useRef, useState } from 'react';
import * as S from '@smarter-academy/core/arithmetic/surfaces.js';
import KidFigure from '../primitives/KidFigure';
import * as L from '../logic/tileYard';
import { ZelligeTile, FenceRails, Heap, toneOf } from './tileArt';
import useHand from './useHand';

/**
 * Le plateau du monde `yard` : la cour de zellige vue d'en haut, sa clôture, le tas (mode corde), la jardinière qui marche le long des bâtons.
 * Un seul <svg> : carreaux, cellules et tas partagent un repère, `useHand` dit quelle cellule est sous le doigt.
 *
 * Gestes (toujours trois chemins) : glisser un carreau ; toucher le carreau puis toucher la cellule ; clavier (flèches déplacent le curseur,
 * Entrée prend / pose, Échap lâche, Suppr rend le carreau au tas en mode corde). Les cellules où le carreau tenu peut atterrir s'allument ;
 * le fantôme de la cour qu'on aurait (avec sa clôture en pointillés et son nombre de bâtons) suit le doigt ; un refus rend le carreau en
 * secouant, avec la raison écrite dans le bandeau (jamais un rouge muet).
 */
const GARDENER = Object.freeze({ hairStyle: 'hijab', scarf: 'mint', outfit: 'teal', skin: 'wheat' });
const ring = 'outline-none';

/** La géométrie du plateau pour une cellule de `c` px. */
export function geometry(c, rope) {
  const padL = 0.6 * c;
  const padT = 1.0 * c;
  const padB = 0.6 * c;
  const padR = 0.6 * c;
  const gridW = L.COLS * c;
  const gridH = L.ROWS * c;
  const gap = rope ? 0.35 * c : 0;
  const heapW = rope ? 2.4 * c : 0;
  const w = padL + gridW + gap + heapW + padR;
  const h = padT + gridH + padB;
  return { padL, padT, gridW, gridH, heapX: padL + gridW + gap, heapW, w, h, ox: padL, oy: padT };
}

export default function YardBoard({ lab, setLab, k, c, walk, setWobbleKey, wobble, reduce }) {
  const rope = lab.mode === 'rope';
  const g = useMemo(() => geometry(c, rope), [c, rope]);
  const svgRef = useRef(null);
  const [held, setHeld] = useState(null); // { src: 'tile', id } | { src: 'heap' }
  const [hover, setHover] = useState(null); // [r, c]
  const [cursor, setCursor] = useState([3, 4]);
  const [focused, setFocused] = useState(false);
  const cellsKey = lab.tiles.map((t) => `${t.id}:${t.r},${t.c}`).join('|');
  useEffect(() => { setHeld(null); }, [lab.mode, lab.ti]);
  useEffect(() => { if (held?.src === 'tile' && !lab.tiles.some((t) => t.id === held.id)) setHeld(null); }, [cellsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const cellAt = (pt) => {
    const col = Math.floor((pt.x - g.ox) / c);
    const row = Math.floor((pt.y - g.oy) / c);
    return row >= 0 && row < L.ROWS && col >= 0 && col < L.COLS ? [row, col] : null;
  };
  const inHeap = (pt) => rope && pt.x >= g.heapX && pt.x <= g.heapX + g.heapW && pt.y >= g.oy + g.gridH - 4.6 * c && pt.y <= g.oy + g.gridH;

  const apply = (next, id) => {
    setLab(next);
    if (next.last?.event === 'refused') setWobbleKey(id ?? 'heap');
    return next.last?.event !== 'refused';
  };
  const dropAt = (src, cell) => {
    if (src.src === 'heap') return apply(L.addTile(lab, cell), 'heap');
    return apply(L.moveTile(lab, src.id, cell), src.id);
  };

  const { drag, handlers, toPt } = useHand({
    svgRef, viewW: g.w, viewH: g.h,
    onGrab: (source) => {
      if (source.startsWith('tile:')) {
        const id = Number(source.slice(5));
        const chk = L.liftable(lab, id);
        if (!chk.ok) { apply(L.tryLift(lab, id), id); return false; }
      }
      if (source === 'heap' && L.heapOf(lab) <= 0) return false;
      return true;
    },
    onMove: (source, pt) => { const cell = cellAt(pt); setHover(cell); },
    onRelease: (source, pt, how) => {
      if (how === 'cancel' || !pt) return;
      const cell = cellAt(pt);
      if (source === 'cell') {
        if (how === 'tap' && held && cell) { if (dropAt(held, cell)) setHeld(null); }
        return;
      }
      const src = source === 'heap' ? { src: 'heap' } : { src: 'tile', id: Number(source.slice(5)) };
      if (how === 'tap') {
        const same = held && held.src === src.src && (src.src === 'heap' || held.id === src.id);
        setHeld(same ? null : src);
        return;
      }
      // glissé
      if (src.src === 'tile' && inHeap(pt) && rope) { apply(L.removeTile(lab, src.id), src.id); setHeld(null); return; }
      if (cell) dropAt(src, cell);
      setHeld(null);
    },
  });

  /* ── ce qui est tenu : par le doigt (drag.moved) ou sélectionné (held) ── */
  const carrying = drag && drag.moved && (drag.source === 'heap' || drag.source.startsWith('tile:')) ? (drag.source === 'heap' ? { src: 'heap' } : { src: 'tile', id: Number(drag.source.slice(5)) }) : null;
  const hand = carrying ?? held;
  const handId = hand ? (hand.src === 'heap' ? null : hand.id) : undefined;
  const legal = useMemo(() => {
    if (!hand) return null;
    return new Set(L.legalDrops(lab, handId).map(([r, cc]) => S.key(r, cc)));
  }, [hand?.src, hand?.id, cellsKey, lab.mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoverCell = hand ? (carrying ? (drag ? cellAt(drag) : null) : hover) : null;
  const hoverLegal = hoverCell && legal ? legal.has(S.key(hoverCell[0], hoverCell[1])) : false;
  const ghost = hand && hoverCell && hoverLegal ? L.preview(lab, handId, hoverCell) : null;
  const ghostEdges = useMemo(() => (ghost ? S.boundaryLoop(ghost.cells) : null), [ghost?.cells?.map((q) => q.join(',')).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoverBad = hand && hoverCell && !hoverLegal && !L.tileAt(lab, hoverCell[0], hoverCell[1]);
  const hoverReason = hoverBad ? L.dropVerdict(lab, handId, hoverCell) : null;

  /* ── la clôture et la marche ── */
  const cells = useMemo(() => lab.tiles.map((t) => [t.r, t.c]), [cellsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const edges = useMemo(() => S.boundaryLoop(cells), [cells]);
  const lit = walk ? Math.min(edges.length, Math.floor(walk.p)) : (lab.walks > 0 && lab.last?.event === 'walk' ? edges.length : 0);
  const walker = (() => {
    if (!walk || edges.length === 0) return null;
    const i = Math.min(edges.length - 1, Math.floor(walk.p));
    const t = Math.min(1, walk.p - i);
    const e = edges[i];
    const dx = e.x1 - e.x0;
    const dy = e.y1 - e.y0;
    const x = e.x0 + dx * t + dy * 0.42;
    const y = e.y0 + dy * t - dx * 0.42;
    return { x: g.ox + x * c, y: g.oy + y * c, i, dx };
  })();

  /* ── le clavier ── */
  const onKeyDown = (e) => {
    const move = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (move) {
      e.preventDefault();
      const [r, cc] = cursor;
      const nr = Math.max(0, Math.min(L.ROWS - 1, r + move[0]));
      const nc = Math.max(0, Math.min(L.COLS - 1, cc + move[1]));
      setCursor([nr, nc]);
      setHover([nr, nc]);
      return;
    }
    if (e.key === 'Escape') { setHeld(null); return; }
    const t = L.tileAt(lab, cursor[0], cursor[1]);
    if ((e.key === 'Delete' || e.key === 'Backspace') && rope && t) {
      e.preventDefault();
      apply(L.removeTile(lab, t.id), t.id);
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (held) { if (dropAt(held, cursor)) setHeld(null); return; }
    if (t) {
      if (!L.liftable(lab, t.id).ok) { apply(L.tryLift(lab, t.id), t.id); return; }
      setHeld({ src: 'tile', id: t.id });
    } else if (rope && L.heapOf(lab) > 0) {
      apply(L.addTile(lab, cursor), 'heap');
    }
  };

  const px = (r, cc) => [g.ox + cc * c, g.oy + r * c];
  const carriedAt = carrying && drag ? { x: drag.x - c / 2, y: drag.y - c / 2 } : null;
  const carriedTone = carrying ? toneOf(carrying.src === 'heap' ? lab.nextId : carrying.id) : null;
  const tileSize = c;

  return (
    <div dir="ltr" className="select-none" data-ty-board>
      <svg ref={svgRef} viewBox={`0 0 ${g.w} ${g.h}`} width={g.w} height={g.h} style={{ touchAction: 'none', maxWidth: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        role="application" tabIndex={0} aria-label={k(rope ? 'yard.ariaRope' : 'yard.ariaFence')} data-ty-yard data-held={hand ? 'true' : 'false'} data-focused={focused ? 'true' : 'false'}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKeyDown} className={ring}
        onPointerLeave={() => { if (!drag) setHover(null); }}
        {...handlers}
        onPointerMove={(e) => {
          handlers.onPointerMove(e);
          if (!drag && held) setHover(cellAt(toPt(e)));
        }}>
        <defs>
          <pattern id="ty-flag" width={c * 1.6} height={c * 1.3} patternUnits="userSpaceOnUse">
            <rect width={c * 1.6} height={c * 1.3} fill="#EADFC6" />
            <path d={`M0 ${c * 0.65} H${c * 1.6} M${c * 0.8} 0 V${c * 0.65} M${c * 0.4} ${c * 0.65} V${c * 1.3} M${c * 1.2} ${c * 0.65} V${c * 1.3}`} stroke="#D2C29B" strokeWidth={1.4} fill="none" />
          </pattern>
          <filter id="ty-soft"><feGaussianBlur stdDeviation="2.2" /></filter>
        </defs>
        {/* le sol de la maison */}
        <rect x={0} y={0} width={g.w} height={g.h} rx={c * 0.5} fill="url(#ty-flag)" stroke="#C4B183" strokeWidth={2} />
        {/* la cour : le terrain à paver */}
        <rect x={g.ox - 4} y={g.oy - 4} width={g.gridW + 8} height={g.gridH + 8} rx={c * 0.18} fill="#F7EFD9" stroke="#C9B77F" strokeWidth={2} />
        <g stroke="#D8C898" strokeWidth={1.2} strokeDasharray={`${c * 0.12} ${c * 0.1}`} fill="none">
          {Array.from({ length: L.ROWS + 1 }, (_, i) => <line key={`h${i}`} x1={g.ox} x2={g.ox + g.gridW} y1={g.oy + i * c} y2={g.oy + i * c} />)}
          {Array.from({ length: L.COLS + 1 }, (_, i) => <line key={`v${i}`} y1={g.oy} y2={g.oy + g.gridH} x1={g.ox + i * c} x2={g.ox + i * c} />)}
        </g>

        {/* les cellules : cibles des doigts (et du clavier) */}
        {Array.from({ length: L.ROWS }, (_, r) => Array.from({ length: L.COLS }, (_, cc) => {
          const [x, y] = px(r, cc);
          const isLegal = legal?.has(S.key(r, cc));
          return (
            <g key={`${r}-${cc}`}>
              {isLegal && <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} rx={c * 0.12} className={reduce ? undefined : 'ty-glow'} fill="#34D399" fillOpacity={0.3} stroke="#10B981" strokeWidth={2} data-ty-legal={`${r}-${cc}`} pointerEvents="none" />}
              <rect x={x} y={y} width={c} height={c} fill="transparent" data-ty-src="cell" data-ty-cell={`${r}-${cc}`} />
            </g>
          );
        }))}

        {/* la place que le carreau tenu a quittée */}
        {carrying?.src === 'tile' && (() => { const t = lab.tiles.find((q) => q.id === carrying.id); if (!t) return null; const [x, y] = px(t.r, t.c); return <rect x={x + 3} y={y + 3} width={c - 6} height={c - 6} rx={c * 0.1} fill="none" stroke="#6366F1" strokeWidth={2} strokeDasharray={`${c * 0.14} ${c * 0.1}`} pointerEvents="none" />; })()}

        {/* les carreaux */}
        {lab.tiles.map((t) => {
          const x = g.ox + t.c * c;
          const y = g.oy + t.r * c;
          const isHeld = hand?.src === 'tile' && hand.id === t.id;
          const hidden = carrying?.src === 'tile' && carrying.id === t.id;
          const wob = wobble && wobble.id === t.id;
          return (
            <g key={t.id} data-ty-tile={`${t.r}-${t.c}`} data-ty-src={`tile:${t.id}`} data-held={isHeld ? 'true' : 'false'} data-tile-id={t.id}
              style={{ transform: `translate(${x}px, ${y - (isHeld && !hidden ? c * 0.1 : 0)}px)`, transition: reduce || drag ? 'none' : 'transform .22s cubic-bezier(.34,1.3,.64,1)', cursor: hidden ? 'grabbing' : 'grab', visibility: hidden ? 'hidden' : 'visible' }}>
              <g key={wob ? wobble.n : 'ok'} className={wob && !reduce ? 'ty-wobble' : undefined}>
                <ZelligeTile s={tileSize} tone={toneOf(t.id)} shadow={isHeld} />
                {isHeld && <rect x={1} y={1} width={c - 2} height={c - 2} rx={c * 0.1} fill="none" stroke="#6366F1" strokeWidth={3} />}
              </g>
            </g>
          );
        })}

        {hoverBad && hoverCell && (() => { const [x, y] = px(hoverCell[0], hoverCell[1]); return (
          <g pointerEvents="none" data-ty-nope={hoverReason?.reason}>
            <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} rx={c * 0.1} fill="#FB7185" fillOpacity={0.28} stroke="#E11D48" strokeWidth={2} />
            <path d={`M${x + c * 0.3} ${y + c * 0.3} L${x + c * 0.7} ${y + c * 0.7} M${x + c * 0.7} ${y + c * 0.3} L${x + c * 0.3} ${y + c * 0.7}`} stroke="#BE123C" strokeWidth={c * 0.08} strokeLinecap="round" />
          </g>
        ); })()}

        {/* la clôture */}
        <FenceRails edges={edges} c={c} ox={g.ox} oy={g.oy} lit={lit} />

        {/* le fantôme : la cour qu'on aurait, sa clôture en pointillés et son nombre de bâtons */}
        {ghost && ghostEdges && (
          <g pointerEvents="none" data-ty-ghost={ghost.fence}>
            {(() => { const [x, y] = px(hoverCell[0], hoverCell[1]); return <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} rx={c * 0.1} fill="#6366F1" fillOpacity={0.25} stroke="#4F46E5" strokeWidth={2} />; })()}
            <FenceRails edges={ghostEdges} c={c} ox={g.ox} oy={g.oy} dashed />
          </g>
        )}
        {/* le tas (mode corde) */}
        {rope && (() => {
          const hw = wobble && wobble.id === 'heap';
          return (
            <g key={hw ? wobble.n : 'heap'} className={hw && !reduce ? 'ty-wobble' : undefined}>
              <Heap x={g.heapX} y={g.oy + g.gridH - 4.6 * c} w={g.heapW} h={4.6 * c} n={L.heapOf(lab)} c={c} focusable={false} label={k('yard.heapAria', { count: L.heapOf(lab) })} countLabel={k('tile', { count: L.heapOf(lab) })} />
              {held?.src === 'heap' && <rect x={g.heapX - 2} y={g.oy + g.gridH - 4.6 * c - 2} width={g.heapW + 4} height={4.6 * c + 4} rx={c * 0.3} fill="none" stroke="#6366F1" strokeWidth={3} pointerEvents="none" />}
            </g>
          );
        })()}

        {/* la jardinière qui marche le long de la clôture */}
        {walker && (
          <g data-ty-walker={walker.i} pointerEvents="none" style={{ transform: `translate(${walker.x}px, ${walker.y}px)` }}>
            <svg x={-c * 0.5} y={-c * 1.18} width={c} height={c * 1.2} viewBox="0 0 50 60" overflow="visible">
              <KidFigure cx={25} top={4} foot={57} mood="happy" {...GARDENER} />
            </svg>
          </g>
        )}
        {walk && (
          <g pointerEvents="none" transform={`translate(${g.ox + g.gridW - c * 1.4} ${g.oy - c * 0.62})`} data-ty-walkcount={Math.floor(walk.p)}>
            <rect width={c * 1.4} height={c * 0.5} rx={c * 0.25} fill="#fff" stroke="#6366F1" strokeWidth={2} />
            <text x={c * 0.7} y={c * 0.36} textAnchor="middle" fontSize={c * 0.34} fontWeight={900} fill="#312E81">{Math.floor(walk.p)}</text>
          </g>
        )}

        {/* le curseur du clavier */}
        {focused && (() => { const [x, y] = px(cursor[0], cursor[1]); return <rect x={x + 1} y={y + 1} width={c - 2} height={c - 2} rx={c * 0.12} fill="none" stroke="#4338CA" strokeWidth={3.5} pointerEvents="none" data-ty-cursor={`${cursor[0]}-${cursor[1]}`} />; })()}

        {/* le carreau porté, et le nombre de bâtons qu'aurait la cour si on le lâchait ici */}
        {carriedAt && (
          <g pointerEvents="none" style={{ transform: `translate(${carriedAt.x}px, ${carriedAt.y}px) scale(1.08)`, transformOrigin: `${c / 2}px ${c / 2}px` }} data-ty-carried>
            <ZelligeTile s={c} tone={carriedTone} shadow />
          </g>
        )}
        {ghost && (carrying || held) && (() => {
          const [x, y] = px(hoverCell[0], hoverCell[1]);
          return (
            <g pointerEvents="none" transform={`translate(${x + c * 0.5} ${y - c * 0.34})`} data-ty-badge>
              <rect x={-c * 0.62} y={-c * 0.3} width={c * 1.24} height={c * 0.52} rx={c * 0.26} fill="#312E81" />
              <text x={0} y={c * 0.1} textAnchor="middle" fontSize={c * 0.34} fontWeight={900} fill="#fff">{ghost.fence}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
