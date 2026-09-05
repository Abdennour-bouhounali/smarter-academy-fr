import React from 'react';
import { SOLIDES } from './solidesUtils';

/**
 * SolidView — la représentation en perspective cavalière d'un solide.
 *
 * Purement visuel (role="img"). Les arêtes CACHÉES sont en pointillé : c'est
 * la convention du dessin technique, et c'est aussi ce qui permet à l'élève
 * de comprendre qu'un dessin plat montre un objet en volume — certaines
 * arêtes existent sans être visibles.
 *
 * `highlight` met en évidence ce qu'on compte : 'faces', 'aretes',
 * 'sommets'. Les comptes affichés viennent de SOLIDES, jamais du dessin.
 */
const BOX = { w: 220, h: 180 };

/** Sommets d'un pavé en perspective cavalière (décalage 0,4 à 45°). */
function paveVertices(w, h, d) {
  const ox = 40;
  const oy = 130;
  const k = d * 0.5;
  return {
    // face avant
    A: { x: ox, y: oy },
    B: { x: ox + w, y: oy },
    C: { x: ox + w, y: oy - h },
    D: { x: ox, y: oy - h },
    // face arrière, décalée
    E: { x: ox + k, y: oy - k },
    F: { x: ox + w + k, y: oy - k },
    G: { x: ox + w + k, y: oy - h - k },
    H: { x: ox + k, y: oy - h - k },
  };
}

export default function SolidView({
  solide = 'cube',
  highlight = null,
  size,
  ariaLabel,
}) {
  const s = SOLIDES[solide] ?? SOLIDES.cube;
  const dims = solide === 'pave' ? { w: 120, h: 70, d: 60 } : { w: 90, h: 90, d: 60 };
  const v = paveVertices(dims.w, dims.h, dims.d);

  const arete = (a, b, cachee, key) => (
    <line
      key={key}
      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
      stroke={highlight === 'aretes' ? '#7c3aed' : '#0f172a'}
      strokeWidth={highlight === 'aretes' ? 3 : 2}
      strokeDasharray={cachee ? '5 4' : undefined}
      opacity={cachee ? 0.45 : 1}
      strokeLinecap="round"
    />
  );

  /* Prisme et cylindre ont leur propre tracé. */
  const body = () => {
    if (solide === 'cylindre') {
      return (
        <g>
          <ellipse cx="110" cy="50" rx="55" ry="18" fill="#eef2ff" stroke="#0f172a" strokeWidth="2" />
          <path d="M 55 50 L 55 130" stroke="#0f172a" strokeWidth="2" />
          <path d="M 165 50 L 165 130" stroke="#0f172a" strokeWidth="2" />
          <path d="M 55 130 A 55 18 0 0 0 165 130" fill="none" stroke="#0f172a" strokeWidth="2" />
          <path d="M 55 130 A 55 18 0 0 1 165 130" fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="5 4" opacity="0.45" />
        </g>
      );
    }
    if (solide === 'prisme') {
      const P = { x: 45, y: 135 }, Q = { x: 145, y: 135 }, R = { x: 95, y: 55 };
      const k = 32;
      const P2 = { x: P.x + k, y: P.y - k }, Q2 = { x: Q.x + k, y: Q.y - k }, R2 = { x: R.x + k, y: R.y - k };
      return (
        <g>
          <path d={`M ${P.x} ${P.y} L ${Q.x} ${Q.y} L ${R.x} ${R.y} Z`} fill="#eef2ff" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
          {arete(Q, Q2, false, 'q')}
          {arete(R, R2, false, 'r')}
          {arete(P, P2, true, 'p')}
          {arete(P2, Q2, true, 'pq')}
          {arete(Q2, R2, false, 'qr')}
          {arete(R2, P2, true, 'rp')}
        </g>
      );
    }
    // Cube ou pavé
    return (
      <g>
        <path
          d={`M ${v.A.x} ${v.A.y} L ${v.B.x} ${v.B.y} L ${v.C.x} ${v.C.y} L ${v.D.x} ${v.D.y} Z`}
          fill="#eef2ff" stroke="none"
        />
        {/* Arêtes visibles */}
        {arete(v.A, v.B, false, '1')}{arete(v.B, v.C, false, '2')}
        {arete(v.C, v.D, false, '3')}{arete(v.D, v.A, false, '4')}
        {arete(v.C, v.G, false, '5')}{arete(v.D, v.H, false, '6')}
        {arete(v.G, v.H, false, '7')}{arete(v.B, v.F, false, '8')}
        {arete(v.F, v.G, false, '9')}
        {/* Arêtes cachées — en pointillé, elles existent quand même */}
        {arete(v.A, v.E, true, '10')}{arete(v.E, v.F, true, '11')}
        {arete(v.E, v.H, true, '12')}
      </g>
    );
  };

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        className="w-full max-w-[280px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        style={{ width: size }}
        role="img"
        aria-label={
          ariaLabel ??
          `${s.nom} en perspective : ${s.faces} faces, ${s.aretes} arêtes, ${s.sommets} sommets`
        }
      >
        <g style={{ pointerEvents: 'none' }}>
          {body()}
          {/* Les sommets, mis en évidence quand on les compte */}
          {highlight === 'sommets' && solide !== 'cylindre' &&
            Object.entries(solide === 'prisme'
              ? { P: { x: 45, y: 135 }, Q: { x: 145, y: 135 }, R: { x: 95, y: 55 },
                  P2: { x: 77, y: 103 }, Q2: { x: 177, y: 103 }, R2: { x: 127, y: 23 } }
              : v
            ).map(([k, p]) => (
              <circle key={k} cx={p.x} cy={p.y} r="5" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
            ))}
        </g>
      </svg>
    </div>
  );
}
