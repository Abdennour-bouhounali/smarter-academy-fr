import { useMemo, useRef, useState } from 'react';
import * as S from '@smarter-academy/core/arithmetic/surfaces.js';
import * as L from '../logic/tileYard';
import { ZelligeTile, StarMark, TONES, toneOf } from './tileArt';
import useHand from './useHand';

/**
 * Le plateau du monde `floor` : une terrasse vue d'en haut, des cellules à couvrir, et la boîte de tuiles (une tuile d'unité ①, un demi-carreau
 * triangulaire, la tuile double d'unité ②, la moitié d'une tuile double). Un seul <svg>.
 *
 * Gestes (trois chemins) : glisser une tuile de la boîte vers une cellule ; toucher la tuile (elle reste en main) puis toucher des cellules, ou
 * APPUYER sur le sol et glisser : une tuile à chaque cellule traversée (le geste répété — le nombre de tuiles reste la réponse, rien n'est
 * complété) ; clavier (flèches = curseur, Entrée = poser / reprendre, R = tourner la tuile double, Échap = lâcher). Toucher une tuile posée la reprend.
 */
const TRI = {
  ul: (c) => [[0, 0], [c, 0], [0, c]],
  ur: (c) => [[0, 0], [c, 0], [c, c]],
  dl: (c) => [[0, 0], [0, c], [c, c]],
  dr: (c) => [[c, 0], [c, c], [0, c]],
};
const DIAG = { ul: [[1, 0], [0, 1]], ur: [[0, 0], [1, 1]], dl: [[0, 0], [1, 1]], dr: [[1, 0], [0, 1]] };
const KEPT_SIDES = { ul: ['N', 'W'], ur: ['N', 'E'], dl: ['S', 'W'], dr: ['S', 'E'] };
const ROSE = TONES[3];

export function geometry(sceneName, c) {
  const sc = L.SCENES[sceneName];
  const padL = 0.6 * c;
  const padT = 0.6 * c;
  const floorW = sc.cols * c;
  const floorH = sc.rows * c;
  const hasTwo = sc.units.includes('two');
  const trayH = hasTwo ? 2.5 * c : 1.7 * c;
  const trayY = padT + floorH + 0.55 * c;
  const w = Math.max(padL * 2 + floorW, 6.6 * c);
  const h = trayY + trayH + 0.4 * c;
  return { sc, padL, padT, floorW, floorH, trayY, trayH, w, h, ox: (w - floorW) / 2, oy: padT, hasTwo };
}

const pts = (list, x, y) => list.map(([a, b]) => `${x + a},${y + b}`).join(' ');

/** Une tuile triangulaire (demi-carreau) sur la cellule (x, y). */
function TriTile({ x, y, c, h, tone, ghost = false, shadow = false }) {
  const t = TRI[h](c);
  const inner = TRI[h](c * 0.62).map(([a, b]) => [a + (h === 'ur' || h === 'dr' ? c * 0.38 * 0.7 : c * 0.05), b + (h === 'dl' || h === 'dr' ? c * 0.38 * 0.7 : c * 0.05)]);
  const cx = t.reduce((s, p) => s + p[0], 0) / 3;
  const cy = t.reduce((s, p) => s + p[1], 0) / 3;
  return (
    <g opacity={ghost ? 0.55 : 1}>
      {shadow && <polygon points={pts(t, x + 1.5, y + 3)} fill="#1E1B4B" opacity={0.28} />}
      <polygon points={pts(t, x, y)} fill={tone.base} stroke={tone.rim} strokeWidth={Math.max(1.2, c * 0.045)} strokeLinejoin="round" />
      <polygon points={pts(inner, x, y)} fill="none" stroke={tone.mid} strokeWidth={Math.max(0.8, c * 0.028)} opacity={0.8} />
      <StarMark cx={x + cx} cy={y + cy} r={c * 0.13} fill={tone.star} stroke={tone.starRim} sw={Math.max(0.6, c * 0.02)} />
    </g>
  );
}

/** La tuile double : un seul carreau de 2 × 1 cellules (ou 1 × 2), deux étoiles. */
function DoubleTile({ x, y, c, vertical = false, ghost = false, shadow = false }) {
  const w = vertical ? c : 2 * c;
  const h = vertical ? 2 * c : c;
  const m = Math.max(1, c * 0.035);
  const centers = vertical ? [[c / 2, c / 2], [c / 2, 1.5 * c]] : [[c / 2, c / 2], [1.5 * c, c / 2]];
  return (
    <g transform={`translate(${x} ${y})`} opacity={ghost ? 0.55 : 1} data-ty-double>
      {shadow && <rect x={m + 1.5} y={m + 3} width={w - 2 * m} height={h - 2 * m} rx={c * 0.1} fill="#1E1B4B" opacity={0.28} />}
      <rect x={m} y={m} width={w - 2 * m} height={h - 2 * m} rx={c * 0.1} fill={ROSE.base} stroke={ROSE.rim} strokeWidth={Math.max(1.2, c * 0.045)} />
      <rect x={m + c * 0.07} y={m + c * 0.07} width={w - 2 * m - c * 0.14} height={h - 2 * m - c * 0.14} rx={c * 0.06} fill="none" stroke={ROSE.mid} strokeWidth={Math.max(0.8, c * 0.028)} opacity={0.85} />
      {centers.map(([cx, cy], i) => <StarMark key={i} cx={cx} cy={cy} r={c * 0.285} fill={ROSE.star} stroke={ROSE.starRim} sw={Math.max(0.7, c * 0.02)} />)}
      {centers.map(([cx, cy], i) => <circle key={`c${i}`} cx={cx} cy={cy} r={c * 0.085} fill={ROSE.base} stroke={ROSE.starRim} strokeWidth={Math.max(0.6, c * 0.018)} />)}
    </g>
  );
}

/** La moitié d'une tuile double : une cellule, un bord coupé en pointillés. */
function HalfDoubleTile({ x, y, c, ghost = false, shadow = false }) {
  return (
    <g opacity={ghost ? 0.55 : 1} data-ty-halfdouble>
      <ZelligeTile x={x} y={y} s={c} tone={ROSE} shadow={shadow} />
      <line x1={x + c - 2} y1={y + c * 0.08} x2={x + c - 2} y2={y + c * 0.92} stroke="#fff" strokeWidth={Math.max(2, c * 0.07)} strokeDasharray={`${c * 0.1} ${c * 0.08}`} strokeLinecap="round" />
      <text x={x + c * 0.18} y={y + c * 0.92} fontSize={c * 0.3} fontWeight={900} fill="#fff" stroke="#831843" strokeWidth={c * 0.02} paintOrder="stroke">½</text>
    </g>
  );
}

function Piece({ kind, x, y, c, orient = 'h', tone, ghost = false, shadow = false, h }) {
  if (kind === 'one') return <ZelligeTile x={x} y={y} s={c} tone={tone ?? toneOf(0)} ghost={ghost} shadow={shadow} />;
  if (kind === 'half') return <TriTile x={x} y={y} c={c} h={h ?? 'ul'} tone={tone ?? toneOf(1)} ghost={ghost} shadow={shadow} />;
  if (kind === 'two') return <DoubleTile x={x} y={y} c={c} vertical={orient === 'v'} ghost={ghost} shadow={shadow} />;
  return <HalfDoubleTile x={x} y={y} c={c} ghost={ghost} shadow={shadow} />;
}

/** Les segments du rebord de la terrasse (les côtés extérieurs + la diagonale de chaque cellule coupée). */
function curb(sc) {
  const all = [...sc.whole, ...sc.halves.map(({ r, c }) => [r, c])];
  const halfAt = new Map(sc.halves.map((q) => [S.key(q.r, q.c), q.h]));
  const out = [];
  for (const { r, c, side } of S.boundaryEdges(all)) {
    const h = halfAt.get(S.key(r, c));
    if (h && !KEPT_SIDES[h].includes(side)) continue;
    out.push(side === 'N' ? [c, r, c + 1, r] : side === 'E' ? [c + 1, r, c + 1, r + 1] : side === 'S' ? [c, r + 1, c + 1, r + 1] : [c, r, c, r + 1]);
  }
  for (const q of sc.halves) { const [[a, b], [d, e]] = DIAG[q.h]; out.push([q.c + a, q.r + b, q.c + d, q.r + e]); }
  return out;
}

const BOX_W = { one: 1.5, half: 1.5, two: 2.7, halfTwo: 1.5 };

export default function FloorBoard({ lab, setLab, k, c, wobble, setWobbleKey, reduce, held, setHeld, orient, setOrient }) {
  const scene = lab.tasks[lab.ti];
  const g = useMemo(() => geometry(scene, c), [scene, c]);
  const sc = g.sc;
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [cursor, setCursor] = useState([1, 1]);
  const [focused, setFocused] = useState(false);
  const sweep = useRef(null);
  const box = L.boxOf(lab);
  const occ = useMemo(() => L.occupied(lab), [lab.pieces]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = L.sceneDone(lab);
  const halfAt = useMemo(() => new Map(sc.halves.map((q) => [S.key(q.r, q.c), q.h])), [sc]);

  const cellAt = (pt) => {
    const col = Math.floor((pt.x - g.ox) / c);
    const row = Math.floor((pt.y - g.oy) / c);
    return row >= 0 && row < sc.rows && col >= 0 && col < sc.cols ? [row, col] : null;
  };
  const slotX = useMemo(() => {
    const total = box.reduce((s, kd) => s + BOX_W[kd] * c, 0) + (box.length - 1) * 0.5 * c;
    let x = (g.w - total) / 2;
    const out = {};
    box.forEach((kd) => { out[kd] = x; x += BOX_W[kd] * c + 0.5 * c; });
    return out;
  }, [box.join(','), c, g.w]); // eslint-disable-line react-hooks/exhaustive-deps

  const lay = (kind, cell) => {
    const next = L.layPiece(lab, kind, cell, orient);
    setLab(next);
    if (next.last?.event === 'refused') setWobbleKey(`box:${kind}`);
    return next.last?.event !== 'refused';
  };
  const single = (kind) => kind === 'one' || kind === 'half' || kind === 'halfTwo';

  const { drag, handlers, toPt } = useHand({
    svgRef, viewW: g.w, viewH: g.h,
    onGrab: (source, pt) => {
      if (done) return false;
      if (source === 'cell') {
        if (!held || !single(held)) return true;
        const cell = cellAt(pt);
        sweep.current = { cells: cell ? [cell] : [], kind: held };
        return true;
      }
      return true;
    },
    onMove: (source, pt, moved) => {
      setHover(cellAt(pt));
      if (source !== 'cell' || !moved || !sweep.current) return;
      const cell = cellAt(pt);
      const sw = sweep.current;
      const last = sw.cells[sw.cells.length - 1];
      if (cell && (!last || last[0] !== cell[0] || last[1] !== cell[1])) {
        sw.cells.push(cell);
        const cells = [...sw.cells];
        setLab((s) => L.sweepLay(s, sw.kind, cells, orient));
      }
    },
    onRelease: (source, pt, how) => {
      const sw = sweep.current;
      sweep.current = null;
      if (how === 'cancel' || !pt) return;
      const cell = cellAt(pt);
      if (source === 'cell') {
        if (how === 'tap' && held && cell) lay(held, cell);
        return;
      }
      if (source.startsWith('piece:')) {
        if (how === 'tap') setLab((s) => L.unlay(s, Number(source.slice(6))));
        return;
      }
      if (source.startsWith('box:')) {
        const kind = source.slice(4);
        if (how === 'tap') { setHeld(held === kind ? null : kind); return; }
        setHeld(kind);
        if (cell) lay(kind, cell);
        return;
      }
      void sw;
    },
  });

  const carrying = drag && drag.moved && drag.source.startsWith('box:') ? drag.source.slice(4) : null;
  const hand = carrying ?? held;
  const legal = useMemo(() => (hand ? new Set(L.legalCells(lab, hand, orient).map(([r, cc]) => S.key(r, cc))) : null), [hand, lab.pieces, orient, lab.phase]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoverCell = hand ? (carrying && drag ? cellAt(drag) : hover) : null;
  const verdict = hand && hoverCell ? L.verdictLay(lab, hand, hoverCell, orient) : null;
  const curbs = useMemo(() => curb(sc), [sc]);

  const onKeyDown = (e) => {
    if (done) return;
    const move = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (move) {
      e.preventDefault();
      const nr = Math.max(0, Math.min(sc.rows - 1, cursor[0] + move[0]));
      const nc = Math.max(0, Math.min(sc.cols - 1, cursor[1] + move[1]));
      setCursor([nr, nc]);
      setHover([nr, nc]);
      return;
    }
    if (e.key === 'Escape') { setHeld(null); return; }
    if (e.key === 'r' || e.key === 'R') { e.preventDefault(); setOrient((o) => (o === 'h' ? 'v' : 'h')); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const p = occ.get(S.key(cursor[0], cursor[1]));
    if (p) { setLab((s) => L.unlay(s, p.id)); return; }
    if (held) lay(held, cursor);
  };

  const cellXY = (r, cc) => [g.ox + cc * c, g.oy + r * c];
  const slotKeyDown = (kind) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setHeld(held === kind ? null : kind); }
  };

  return (
    <div dir="ltr" className="select-none" data-ty-board>
      <svg ref={svgRef} viewBox={`0 0 ${g.w} ${g.h}`} width={g.w} height={g.h} style={{ touchAction: 'none', maxWidth: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        role="application" tabIndex={0} aria-label={k('floor.aria')} data-ty-floor-svg onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKeyDown}
        onPointerLeave={() => { if (!drag) setHover(null); }} className="outline-none"
        {...handlers}
        onPointerMove={(e) => { handlers.onPointerMove(e); if (!drag && held) setHover(cellAt(toPt(e))); }}>
        <defs>
          <pattern id="ty-floor-ground" width={c * 1.4} height={c * 1.4} patternUnits="userSpaceOnUse">
            <rect width={c * 1.4} height={c * 1.4} fill="#E6DAB9" />
            <circle cx={c * 0.3} cy={c * 0.4} r={1.4} fill="#CDBB8A" /><circle cx={c * 1} cy={c * 1} r={1.2} fill="#CDBB8A" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={g.w} height={g.h} rx={c * 0.5} fill="url(#ty-floor-ground)" stroke="#C4B183" strokeWidth={2} />

        {/* le sol à couvrir */}
        <g data-ty-floor data-scene={scene}>
          {sc.whole.map(([r, cc]) => { const [x, y] = cellXY(r, cc); return <rect key={`w${r}-${cc}`} x={x} y={y} width={c} height={c} fill="#FFF9E6" stroke="#CDB77A" strokeWidth={1.5} strokeDasharray={`${c * 0.12} ${c * 0.1}`} data-ty-cell={`${r}-${cc}`} />; })}
          {sc.halves.map(({ r, c: cc, h }) => { const [x, y] = cellXY(r, cc); return <polygon key={`h${r}-${cc}`} points={pts(TRI[h](c), x, y)} fill="#FFF9E6" stroke="#CDB77A" strokeWidth={1.5} strokeDasharray={`${c * 0.12} ${c * 0.1}`} data-ty-cell={`${r}-${cc}`} data-half={h} />; })}
          {curbs.map(([x0, y0, x1, y1], i) => <line key={i} x1={g.ox + x0 * c} y1={g.oy + y0 * c} x2={g.ox + x1 * c} y2={g.oy + y1 * c} stroke="#8D7B55" strokeWidth={c * 0.14} strokeLinecap="round" />)}
          {curbs.map(([x0, y0, x1, y1], i) => <line key={`l${i}`} x1={g.ox + x0 * c} y1={g.oy + y0 * c} x2={g.ox + x1 * c} y2={g.oy + y1 * c} stroke="#C9B98B" strokeWidth={c * 0.05} strokeLinecap="round" />)}
        </g>

        {/* les cellules : cibles des doigts */}
        {[...sc.whole, ...sc.halves.map(({ r, c: cc }) => [r, cc])].map(([r, cc]) => {
          const [x, y] = cellXY(r, cc);
          const isLegal = legal?.has(S.key(r, cc));
          return (
            <g key={`t${r}-${cc}`}>
              {isLegal && <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} rx={c * 0.12} className={reduce ? undefined : 'ty-glow'} fill="#34D399" fillOpacity={0.3} stroke="#10B981" strokeWidth={2} pointerEvents="none" data-ty-legal={`${r}-${cc}`} />}
              <rect x={x} y={y} width={c} height={c} fill="transparent" data-ty-src="cell" />
            </g>
          );
        })}

        {/* les pièces posées */}
        {lab.pieces.map((p) => {
          const [r, cc] = p.cells[0];
          const [x, y] = cellXY(r, cc);
          const wob = wobble && wobble.id === `piece:${p.id}`;
          return (
            <g key={p.id} data-ty-piece={p.kind} data-ty-src={`piece:${p.id}`} style={{ cursor: 'pointer' }} className={wob && !reduce ? 'ty-wobble' : 'ty-pop'}>
              <Piece kind={p.kind} x={x} y={y} c={c} orient={p.orient} tone={toneOf(p.id)} h={halfAt.get(S.key(r, cc))} />
            </g>
          );
        })}

        {/* le fantôme de la pièce tenue sur la cellule survolée */}
        {hand && hoverCell && verdict && (() => {
          const [x, y] = cellXY(hoverCell[0], hoverCell[1]);
          if (!verdict.ok && verdict.reason === 'overlap') return null;
          if (verdict.ok) return <g pointerEvents="none" data-ty-ghost><Piece kind={hand} x={x} y={y} c={c} orient={orient} ghost h={halfAt.get(S.key(hoverCell[0], hoverCell[1]))} tone={hand === 'one' ? toneOf(lab.nextId) : toneOf(lab.nextId + 1)} /></g>;
          return (
            <g pointerEvents="none" data-ty-nope={verdict.reason}>
              <rect x={x + 2} y={y + 2} width={c - 4} height={c - 4} rx={c * 0.1} fill="#FB7185" fillOpacity={0.28} stroke="#E11D48" strokeWidth={2} />
              <path d={`M${x + c * 0.3} ${y + c * 0.3} L${x + c * 0.7} ${y + c * 0.7} M${x + c * 0.7} ${y + c * 0.3} L${x + c * 0.3} ${y + c * 0.7}`} stroke="#BE123C" strokeWidth={c * 0.08} strokeLinecap="round" />
            </g>
          );
        })()}

        {/* la boîte de tuiles */}
        <g data-ty-tray>
          <rect x={c * 0.2} y={g.trayY} width={g.w - c * 0.4} height={g.trayH} rx={c * 0.3} fill="#FFFFFFCC" stroke="#C9B77F" strokeWidth={2} />
          {box.map((kind) => {
            const x = slotX[kind];
            const w = BOX_W[kind] * c;
            const sel = hand === kind;
            const wob = wobble && wobble.id === `box:${kind}`;
            const vertical = kind === 'two' && orient === 'v';
            const cx0 = x + w / 2;
            const cy0 = g.trayY + g.trayH / 2;
            return (
              <g key={kind} data-ty-box={kind} data-ty-src={`box:${kind}`} data-held={sel ? 'true' : 'false'} role="button" tabIndex={0} aria-pressed={sel} aria-label={k(`box.${kind}`)} onKeyDown={slotKeyDown(kind)}
                style={{ cursor: 'grab', outline: 'none' }} className={wob && !reduce ? 'ty-wobble' : undefined}>
                <rect x={x} y={g.trayY + c * 0.15} width={w} height={g.trayH - c * 0.3} rx={c * 0.25} fill={sel ? '#EEF2FF' : '#FFFBEB'} stroke={sel ? '#4F46E5' : '#E7D9A8'} strokeWidth={sel ? 3.5 : 2} />
                {kind === 'two'
                  ? <g style={{ transform: `rotate(${vertical ? 90 : 0}deg)`, transformOrigin: `${cx0}px ${cy0}px`, transition: reduce ? 'none' : 'transform .25s' }}><Piece kind="two" x={cx0 - c} y={cy0 - c / 2} c={c} shadow /></g>
                  : <Piece kind={kind} x={cx0 - c / 2} y={cy0 - c / 2} c={c} shadow h="ul" tone={kind === 'half' ? toneOf(1) : undefined} />}
              </g>
            );
          })}
        </g>

        {focused && (() => { const [x, y] = cellXY(cursor[0], cursor[1]); return <rect x={x + 1} y={y + 1} width={c - 2} height={c - 2} rx={c * 0.12} fill="none" stroke="#4338CA" strokeWidth={3.5} pointerEvents="none" data-ty-cursor={`${cursor[0]}-${cursor[1]}`} />; })()}

        {/* la tuile portée */}
        {carrying && drag && (
          <g pointerEvents="none" data-ty-carried>
            <Piece kind={carrying} x={drag.x - (carrying === 'two' ? (orient === 'v' ? c / 2 : c) : c / 2)} y={drag.y - (carrying === 'two' && orient === 'v' ? c : c / 2)} c={c} orient={orient} shadow h="ul" tone={carrying === 'one' ? toneOf(lab.nextId) : undefined} />
          </g>
        )}
      </svg>
    </div>
  );
}
