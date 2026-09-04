import React from 'react';
import {
  trianglePoints, sidesFor, ratiosFromSides, roleOfSides, SIDE_NAMES, BOX,
} from './trigoUtils';

/**
 * RatioLab — l'interaction signature de la leçon.
 *
 * ACTION            l'élève change la TAILLE du triangle (échelle), puis son
 *                   ANGLE, avec deux réglages séparés.
 * CHANGEMENT        les trois longueurs changent ; les trois rapports, non —
 *                   tant que l'angle ne bouge pas.
 * OBSERVATION       « quand j'agrandis, tout grandit, mais les quotients
 *                   restent identiques ».
 * SENS MATHÉMATIQUE un rapport de longueurs dans un triangle rectangle ne
 *                   dépend que de l'angle. C'est ce qui autorise à lui donner
 *                   un nom (sinus, cosinus, tangente) et à le tabuler.
 * FORMALISATION     les noms arrivent au module 4, après cette constatation.
 *
 * Les triangles précédents restent affichés en fantôme : l'emboîtement rend
 * la similitude visible, ce qui est tout l'intérêt.
 *
 * Purement visuel côté SVG (role="img") — toute l'interaction passe par des
 * boutons DOM, donc tactile et clavier par construction.
 */
export default function RatioLab({
  alpha,
  hyp,
  onAlphaChange,
  onHypChange,
  ghosts = [],           // hypoténuses des tailles déjà visitées
  vertex = 'A',
  highlight = null,      // 'opp' | 'adj' | 'hyp' | null
  showRatios = true,
  showLengths = true,
  disabled = false,
  ariaLabel,
}) {
  const { A, B, C } = trianglePoints(alpha, hyp);
  const s = sidesFor(alpha, hyp);
  const r = ratiosFromSides(s);
  const roles = roleOfSides(vertex);

  const fmt = (v) => (v === null ? '—' : v.toFixed(2).replace('.', ','));
  const len = (v) => Math.round(v);

  /* Couleur par RÔLE, pas par position : quand l'angle étudié change, la
     couleur suit le rôle et l'élève voit l'échange opposé/adjacent. */
  const COLOR = { opp: '#dc2626', adj: '#2563eb', hyp: '#7c3aed' };
  const sideOf = (name) => Object.keys(roles).find((k) => roles[k] === name);

  const segment = (P, Q, name) => {
    const role = sideOf(name);
    const on = highlight === null || highlight === role;
    return (
      <line
        key={name}
        x1={P.x} y1={P.y} x2={Q.x} y2={Q.y}
        stroke={COLOR[role]} strokeWidth={highlight === role ? 5 : 3}
        strokeLinecap="round" opacity={on ? 1 : 0.25}
      />
    );
  };

  const Stepper = ({ label, value, unit, onMinus, onPlus, color }) => (
    <div className="flex-1 min-w-[150px] rounded-xl border-2 border-slate-200 bg-white p-2">
      <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
      <div className="flex items-center gap-1 justify-center">
        <button type="button" onClick={onMinus} disabled={disabled}
          aria-label={`Diminuer ${label}`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
        <span className="w-16 text-center text-lg font-mono font-bold tabular-nums">
          {value}{unit}
        </span>
        <button type="button" onClick={onPlus} disabled={disabled}
          aria-label={`Augmenter ${label}`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Le cadre s'ajuste au contenu (triangle + fantômes) : à viewBox fixe,
          un petit triangle flottait dans un grand vide et paraissait minuscule. */}
      <svg
        viewBox={(() => {
          const all = [A, B, C];
          for (const g of ghosts) {
            const t = trianglePoints(alpha, g);
            all.push(t.A, t.B, t.C);
          }
          // La marge tient compte de l'étiquette d'angle posée à l'extérieur
          // (30 px) et de son texte.
          const pad = 62;
          const x0 = Math.min(...all.map((p) => p.x)) - pad;
          const x1 = Math.max(...all.map((p) => p.x)) + pad;
          const y0 = Math.min(...all.map((p) => p.y)) - pad;
          const y1 = Math.max(...all.map((p) => p.y)) + pad;
          return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
        })()}
        className="w-full max-w-[420px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        role="img"
        aria-label={ariaLabel ?? `Triangle rectangle d’angle ${alpha} degrés, hypoténuse ${len(hyp)}`}
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Les tailles déjà visitées, en fantôme : la similitude se voit. */}
          {ghosts.filter((g) => g !== hyp).map((g) => {
            const t = trianglePoints(alpha, g);
            return (
              <polygon key={g}
                points={`${t.A.x},${t.A.y} ${t.B.x},${t.B.y} ${t.C.x},${t.C.y}`}
                fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 4" />
            );
          })}

          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="#f8fafc" stroke="none" />

          {segment(A, B, 'AB')}
          {segment(B, C, 'BC')}
          {segment(A, C, 'AC')}

          {/* Marque d'angle droit en B */}
          <path d={`M ${B.x - 13} ${B.y} L ${B.x - 13} ${B.y - 13} L ${B.x} ${B.y - 13}`}
            fill="none" stroke="#dc2626" strokeWidth="2" />

          {/* L'arc de l'angle étudié */}
          {(() => {
            const P = vertex === 'A' ? A : C;
            const Q1 = vertex === 'A' ? B : B;
            const Q2 = vertex === 'A' ? C : A;
            const a1 = Math.atan2(Q1.y - P.y, Q1.x - P.x);
            const a2 = Math.atan2(Q2.y - P.y, Q2.x - P.x);
            const rr = 26;
            let d = a2 - a1;
            while (d <= -Math.PI) d += 2 * Math.PI;
            while (d > Math.PI) d -= 2 * Math.PI;
            const st = { x: P.x + rr * Math.cos(a1), y: P.y + rr * Math.sin(a1) };
            const en = { x: P.x + rr * Math.cos(a2), y: P.y + rr * Math.sin(a2) };
            const mid = a1 + d / 2;
            return (
              <g>
                <path d={`M ${st.x} ${st.y} A ${rr} ${rr} 0 0 ${d > 0 ? 1 : 0} ${en.x} ${en.y}`}
                  fill="none" stroke="#0f172a" strokeWidth="2" />
                {/* La mesure de l'angle est posée À L'EXTÉRIEUR du sommet,
                    dans le prolongement de la bissectrice. Placée à
                    l'intérieur, elle venait heurter l'étiquette du côté le
                    plus proche dès que l'angle était petit ou le triangle
                    court (mesuré : 4 px de dégagement au pire). Vers
                    l'extérieur, le dégagement minimal sur toute la plage
                    passe à 36 px. */}
                <text
                  x={P.x + 30 * Math.cos(mid + Math.PI)}
                  y={P.y + 30 * Math.sin(mid + Math.PI) + 4}
                  textAnchor="middle" fontSize="13" className="font-mono font-bold"
                  fill="#0f172a" stroke="#ffffff" strokeWidth="3" paintOrder="stroke"
                >
                  {alpha}°
                </text>
              </g>
            );
          })()}

          {/* Longueurs des côtés.
              PLACEMENT SÛR : l'étiquette est posée au milieu du côté puis
              DÉCALÉE LE LONG de ce côté, en s'éloignant du sommet A. À angle
              faible ou côté court, une étiquette laissée au milieu venait se
              superposer à celle de l'angle (mesuré : 6 px de distance à 35°
              sur une hypoténuse de 70). On garde en plus un halo blanc pour
              rester lisible si un trait passe dessous. */}
          {showLengths && [
            [A, B, s.adj, 'AB'], [B, C, s.opp, 'BC'], [A, C, s.hyp, 'AC'],
          ].map(([P, Q, v, name]) => {
            const role = sideOf(name);
            const dx = Q.x - P.x;
            const dy = Q.y - P.y;
            const n = Math.hypot(dx, dy) || 1;
            // Fraction du côté à laquelle on pose l'étiquette : plus loin de A
            // quand le côté part de A (donc quand l'arc d'angle est proche).
            const t = name === 'BC' ? 0.5 : 0.66;
            const mx = P.x + dx * t;
            const my = P.y + dy * t;
            return (
              <text key={name} x={mx - (dy / n) * 15} y={my + (dx / n) * 15 + 4}
                textAnchor="middle" fontSize="12" className="font-mono font-semibold"
                fill={COLOR[role]} stroke="#ffffff" strokeWidth="3" paintOrder="stroke">
                {len(v)}
              </text>
            );
          })}

          {/* Les noms de sommets sont poussés vers l'extérieur. Le sommet
              étudié reçoit un décalage plus grand : c'est là que se trouve
              aussi l'étiquette de l'angle, posée à l'extérieur elle aussi. */}
          {[[A, 'A'], [B, 'B'], [C, 'C']].map(([p, name]) => {
            const cx = (A.x + B.x + C.x) / 3;
            const cy = (A.y + B.y + C.y) / 3;
            const dx = p.x - cx;
            const dy = p.y - cy;
            const n = Math.hypot(dx, dy) || 1;
            const out = name === vertex ? 52 : 17;
            return (
              <text key={name} x={p.x + (dx / n) * out} y={p.y + (dy / n) * out + 5}
                textAnchor="middle" fontSize="15" fontWeight="700"
                className="font-space" fill="#0f172a"
                stroke="#ffffff" strokeWidth="3" paintOrder="stroke">{name}</text>
            );
          })}
        </g>
      </svg>

      {/* Légende des rôles — elle suit l'angle étudié. */}
      <div className="flex gap-2 flex-wrap justify-center text-xs">
        {['opp', 'adj', 'hyp'].map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 px-2 py-1 rounded
                                   border-2 border-slate-200 bg-white">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLOR[k] }} />
            <span className="font-semibold text-slate-700">{SIDE_NAMES[k]}</span>
            <span className="font-mono text-slate-500">[{roles[k]}]</span>
          </span>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {onHypChange && (
          <Stepper label="Taille (hypoténuse)" value={len(hyp)} unit=""
            color="text-violet-700"
            onMinus={() => onHypChange(Math.max(60, hyp - 30))}
            onPlus={() => onHypChange(Math.min(160, hyp + 30))} />
        )}
        {onAlphaChange && (
          <Stepper label="Angle étudié" value={alpha} unit="°"
            color="text-slate-700"
            onMinus={() => onAlphaChange(Math.max(10, alpha - 5))}
            onPlus={() => onAlphaChange(Math.min(75, alpha + 5))} />
        )}
      </div>

      {showRatios && (
        <div className="grid grid-cols-3 gap-2" aria-live="polite">
          {[
            { l: 'opposé / hyp.', v: r.sin },
            { l: 'adjacent / hyp.', v: r.cos },
            { l: 'opposé / adj.', v: r.tan },
          ].map(({ l, v }) => (
            <div key={l} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-2 text-center">
              <p className="text-xs text-slate-600 font-mono">{l}</p>
              <p className="text-lg font-mono font-bold tabular-nums text-slate-800">{fmt(v)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
