import React, { useCallback, useRef, useState } from 'react';
import {
  thalesPoint, constructN, freeN, ratiosOf, ratiosAgree, isParallelMNBC,
  isPapillon, BOX, TOL,
} from './thalesUtils';

/**
 * ThalesLab — l'interaction signature de la leçon.
 *
 * ACTION            l'élève fait glisser M le long de (AB) — et, en mode
 *                   'free', N le long de (AC) indépendamment.
 * CHANGEMENT        la figure change de proportions ; les trois rapports sont
 *                   recalculés et affichés en permanence.
 * OBSERVATION       en mode 'parallel', les trois rapports restent égaux quoi
 *                   qu'on fasse. En mode 'free', ils ne coïncident QUE lorsque
 *                   les chevrons de parallélisme apparaissent.
 * SENS MATHÉMATIQUE le parallélisme et l'égalité des rapports sont deux faces
 *                   d'une même chose — d'où le théorème ET sa réciproque.
 * FORMALISATION     l'écriture AM/AB = AN/AC = MN/BC arrive au module 3, une
 *                   fois les rapports vus coïncider.
 *
 * CE QUE LA VERSION PRÉ-KIT NE FAISAIT PAS : afficher les rapports. Sans eux,
 * l'élève regardait une figure bouger sans rien pouvoir constater.
 *
 * Les chevrons ne sont dessinés que si `isParallelMNBC` est vrai : le dessin
 * ne peut pas affirmer un parallélisme qui n'existe pas.
 */
const HANDLE_R = 20;

export default function ThalesLab({
  figure,
  k,
  onKChange,
  kn = null,             // paramètre de N en mode 'free'
  onKnChange,
  mode = 'parallel',     // 'parallel' | 'free'
  allowPapillon = false,
  showRatios = true,
  stamps = [],
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const [settled, setSettled] = useState(true);
  const [focused, setFocused] = useState(null);

  const { A, B, C } = figure;
  const M = thalesPoint(A, B, k);
  const N = mode === 'parallel' ? constructN(A, B, C, M) : freeN(A, C, kn ?? k);
  const r = ratiosOf(A, B, C, M, N);
  const parallel = N ? isParallelMNBC(B, C, M, N) : false;
  const agree = ratiosAgree(r);
  const papillon = isPapillon(A, B, M);

  const kMin = allowPapillon ? -0.75 : 0.12;
  const kMax = 0.92;

  const posFromClient = useCallback((cx, cy) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: BOX.xMin + ((cx - rect.left) / rect.width) * (BOX.xMax - BOX.xMin),
      y: BOX.yMin + ((cy - rect.top) / rect.height) * (BOX.yMax - BOX.yMin),
    };
  }, []);

  /** Projette le pointeur sur (AB) ou (AC) et en tire le paramètre. */
  const paramOn = (P, Q, p) => {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-9) return 0;
    return ((p.x - P.x) * dx + (p.y - P.y) * dy) / len2;
  };

  const clampK = (t) => Math.max(kMin, Math.min(kMax, Math.round(t * 100) / 100));

  const onPointerDown = (e) => {
    if (disabled) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    const dM = Math.hypot(M.x - p.x, M.y - p.y);
    const dN = N ? Math.hypot(N.x - p.x, N.y - p.y) : Infinity;
    const canN = mode === 'free' && typeof onKnChange === 'function';
    let target = null;
    if (dM <= HANDLE_R + 8 && dM <= dN) target = 'M';
    else if (canN && dN <= HANDLE_R + 8) target = 'N';
    if (!target) return;
    dragging.current = target;
    setSettled(false);
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const onPointerMove = (e) => {
    if (disabled || !dragging.current) return;
    const p = posFromClient(e.clientX, e.clientY);
    if (!p) return;
    if (dragging.current === 'M') onKChange?.(clampK(paramOn(A, B, p)));
    else onKnChange?.(clampK(paramOn(A, C, p)));
  };

  const endDrag = (e) => {
    if (!dragging.current) return;
    dragging.current = null;
    setSettled(true);
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const keyFor = (which) => (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const cur = which === 'M' ? k : (kn ?? k);
    const set = which === 'M' ? onKChange : onKnChange;
    if (!set) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(clampK(cur + step)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(clampK(cur - step)); }
    else if (e.key === 'Home') { e.preventDefault(); set(kMin); }
    else if (e.key === 'End') { e.preventDefault(); set(kMax); }
  };

  /** Chevrons de parallélisme — dessinés seulement si le calcul le dit. */
  const chevron = (P, Q, key) => {
    if (!parallel) return null;
    const mx = (P.x + Q.x) / 2;
    const my = (P.y + Q.y) / 2;
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const n = Math.hypot(dx, dy) || 1;
    const ux = dx / n;
    const uy = dy / n;
    const px = -uy;
    const py = ux;
    return (
      <path key={key}
        d={`M ${mx - ux * 6 + px * 6} ${my - uy * 6 + py * 6} L ${mx + ux * 5} ${my + uy * 5}
            L ${mx - ux * 6 - px * 6} ${my - uy * 6 - py * 6}`}
        fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    );
  };

  const fmt = (v) => (v === null ? '—' : v.toFixed(2).replace('.', ','));

  return (
    <div className="space-y-2">
      <svg
        ref={svgRef}
        viewBox={`${BOX.xMin} ${BOX.yMin} ${BOX.xMax - BOX.xMin} ${BOX.yMax - BOX.yMin}`}
        className="w-full max-w-[440px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        style={{ touchAction: dragging.current ? 'none' : 'manipulation' }}
        {...(disabled
          ? { role: 'img', 'aria-label': ariaLabel ?? 'Configuration de Thalès' }
          : { role: 'group', 'aria-label': ariaLabel ?? 'Configuration de Thalès — fais glisser M' })}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Les deux droites support, prolongées au-delà de A pour rendre le
              papillon visible — mais DÉCOUPÉES sur le cadre. Des multiples
              fixes (×0,85 et ×1,08) sortaient du viewBox selon la forme du
              triangle ; on calcule donc le paramètre maximal qui garde le
              trait à l'intérieur. */}
          {[[B, 'ab'], [C, 'ac']].map(([P, key]) => {
            const dx = P.x - A.x;
            const dy = P.y - A.y;
            // Plus grand |t| tel que A + t·(P − A) reste dans la boîte.
            const span = (o, d, lo, hi) => {
              if (Math.abs(d) < 1e-9) return Infinity;
              return Math.max((lo - o) / d, (hi - o) / d);
            };
            const tPos = Math.min(
              span(A.x, dx, BOX.xMin + 2, BOX.xMax - 2),
              span(A.y, dy, BOX.yMin + 2, BOX.yMax - 2),
              1.12,
            );
            const tNeg = Math.min(
              span(A.x, -dx, BOX.xMin + 2, BOX.xMax - 2),
              span(A.y, -dy, BOX.yMin + 2, BOX.yMax - 2),
              0.9,
            );
            return (
              <line key={key}
                x1={A.x - dx * tNeg} y1={A.y - dy * tNeg}
                x2={A.x + dx * tPos} y2={A.y + dy * tPos}
                stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            );
          })}

          {/* Le triangle ABC */}
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="#eef2ff" fillOpacity="0.6" stroke="#4338ca" strokeWidth="2.5"
            strokeLinejoin="round" />

          {/* Le segment [MN] — vert quand il est parallèle, gris sinon */}
          {N && (
            <line x1={M.x} y1={M.y} x2={N.x} y2={N.y}
              stroke={parallel ? '#16a34a' : '#f43f5e'} strokeWidth="3" strokeLinecap="round" />
          )}
          {N && chevron(M, N, 'mn')}
          {chevron(B, C, 'bc')}

          {/* Les étiquettes sont poussées VERS L'EXTÉRIEUR de la figure : quand
              M approche de B (k proche de 1), deux étiquettes posées du même
              côté se chevauchaient (défaut vu en revue visuelle). */}
          {[[A, 'A', '#0f172a'], [B, 'B', '#0f172a'], [C, 'C', '#0f172a'],
            [M, 'M', '#7c3aed'], ...(N ? [[N, 'N', '#7c3aed']] : [])].map(([p, name, col]) => {
            const cx = (A.x + B.x + C.x) / 3;
            const cy = (A.y + B.y + C.y) / 3;
            const dx = p.x - cx;
            const dy = p.y - cy;
            const n = Math.hypot(dx, dy) || 1;
            return (
              <g key={name}>
                <circle cx={p.x} cy={p.y} r={name === 'M' || name === 'N' ? 6 : 5} fill={col}
                  stroke="#fff" strokeWidth="2" />
                <text x={p.x + (dx / n) * 17} y={p.y + (dy / n) * 17 + 5}
                  textAnchor="middle" fontSize="14" fontWeight="700"
                  className="font-space" fill={col}>{name}</text>
              </g>
            );
          })}
        </g>

        {/* Poignées */}
        {!disabled && (
          <circle cx={M.x} cy={M.y} r={HANDLE_R} fill="transparent"
            role="slider" tabIndex={0}
            aria-label="Point M sur la droite AB — flèches pour le déplacer"
            aria-valuemin={kMin} aria-valuemax={kMax} aria-valuenow={k}
            aria-valuetext={`rapport ${fmt(r.am)}`}
            onKeyDown={keyFor('M')}
            onFocus={() => setFocused('M')} onBlur={() => setFocused(null)}
            style={{ outline: 'none', cursor: 'grab' }} />
        )}
        {!disabled && mode === 'free' && N && (
          <circle cx={N.x} cy={N.y} r={HANDLE_R} fill="transparent"
            role="slider" tabIndex={0}
            aria-label="Point N sur la droite AC — flèches pour le déplacer"
            aria-valuemin={kMin} aria-valuemax={kMax} aria-valuenow={kn ?? k}
            aria-valuetext={`rapport ${fmt(r.an)}`}
            onKeyDown={keyFor('N')}
            onFocus={() => setFocused('N')} onBlur={() => setFocused(null)}
            style={{ outline: 'none', cursor: 'grab' }} />
        )}
        {focused && (
          <circle
            cx={focused === 'M' ? M.x : N.x} cy={focused === 'M' ? M.y : N.y}
            r={HANDLE_R - 4} fill="none" stroke="#3b82f6" strokeWidth="2.5"
            style={{ pointerEvents: 'none' }} />
        )}
      </svg>

      {/* LES RAPPORTS — ce que la version pré-kit n'affichait jamais. */}
      {showRatios && (
        <div className="space-y-1.5" aria-live="polite">
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'AM / AB', v: r.am, c: 'text-violet-700' },
              { l: 'AN / AC', v: r.an, c: 'text-violet-700' },
              { l: 'MN / BC', v: r.mn, c: 'text-emerald-700' },
            ].map(({ l, v, c }) => (
              <div key={l} className={`rounded-xl border-2 p-2 text-center ${
                agree ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
              }`}>
                <p className="text-xs text-slate-600 font-mono">{l}</p>
                <p className={`text-lg font-mono font-bold tabular-nums ${c}`}>
                  {settled ? fmt(v) : '…'}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm">
            <span className={`inline-block px-3 py-1 rounded-lg font-semibold ${
              agree ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {agree
                ? 'Les trois rapports coïncident — et (MN) est parallèle à (BC)'
                : 'Les rapports diffèrent — (MN) n’est pas parallèle à (BC)'}
            </span>
            {papillon && (
              <span className="ml-2 text-xs text-slate-600">configuration « papillon »</span>
            )}
          </p>
        </div>
      )}

      {stamps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {stamps.map((s, i) => (
            <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-emerald-50
                                     border border-emerald-200 text-emerald-800 tabular-nums">
              {s.am} = {s.an} = {s.mn}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
