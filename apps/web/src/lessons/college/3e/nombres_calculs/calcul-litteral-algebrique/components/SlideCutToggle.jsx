import React from 'react';
import MathText from '../../../../../common/components/MathText';

/**
 * SlideCutToggle — « découpe et glisse » : a² − b² devient (a + b)(a − b).
 *
 * Activity: basculer entre deux images, avant et après le glissement.
 * Mathematical objective: montrer que a² − b² se réarrange EXACTEMENT en un
 *   rectangle de côtés a + b et a − b — sans jamais dessiner une aire
 *   négative.
 * Student action: un seul bouton, deux états.
 * Controlled variable: `state` (0 = découpé, 1 = glissé).
 * Mathematical state: a et b (longueurs de dessin) ; les deux images en
 *   dérivent.
 * Visual consequence: état 0 — le grand carré a² avec le coin b² retiré, et
 *   le trait de découpe ; état 1 — les deux morceaux recollés en un
 *   rectangle dont les côtés portent a + b et a − b.
 * Expected observation: on n'a rien ajouté ni enlevé entre les deux images :
 *   c'est la même aire, autrement écrite.
 * Misconception targeted: « a² − b² se factorise en (a − b)² ».
 * Feedback: le module rend le <Feedback> ; ici, l'image EST l'argument.
 * Formalization: l'identité est écrite sous l'image, une fois basculée.
 * Scaffolding: aucun geste à découvrir, un seul bouton étiqueté.
 * Transfer: sert de preuve visuelle avant les questions du module 5.
 *
 * Composant CONTRÔLÉ : `state` appartient au module. 1 nœud interactif.
 *
 * @param {0|1} state @param {()=>void} [onToggle] @param {boolean} [frozen]
 */
const A = 6;   // unités de dessin pour a
const B = 2.4; // unités de dessin pour b
const U = 26;
const PAD = 30;

export default function SlideCutToggle({ state = 0, onToggle, frozen = false }) {
  const W = PAD + (A + B) * U + PAD;
  const H = PAD + A * U + PAD;

  return (
    <div className="space-y-3" role="group" aria-label="Découpe et glisse : a² − b²">
      <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto max-w-[420px] mx-auto block select-none"
          role="img"
          aria-label={
            state === 0
              ? "Un carré de côté a auquel on a retiré un carré de côté b, avec le trait de découpe"
              : "Les deux morceaux recollés en un rectangle de côtés a plus b et a moins b"
          }
        >
          <g pointerEvents="none">
            {state === 0 ? (
              <>
                {/* Morceau 1 : la bande du haut, a × (a − b) */}
                <rect
                  x={PAD} y={PAD}
                  width={A * U} height={(A - B) * U}
                  fill="#a7f3d0" stroke="#059669" strokeWidth="2"
                />
                {/* Morceau 2 : la bande du bas, (a − b) × b */}
                <rect
                  x={PAD} y={PAD + (A - B) * U}
                  width={(A - B) * U} height={B * U}
                  fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"
                />
                {/* Le carré b² retiré (trame, jamais une aire à compter) */}
                <rect
                  x={PAD + (A - B) * U} y={PAD + (A - B) * U}
                  width={B * U} height={B * U}
                  fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4"
                />
                <text
                  x={PAD + (A - B / 2) * U} y={PAD + (A - B / 2) * U + 5}
                  textAnchor="middle" fontSize="14" fontFamily="monospace" fill="#64748b"
                >
                  −b²
                </text>
                {/* Le trait de découpe */}
                <line
                  x1={PAD} y1={PAD + (A - B) * U}
                  x2={PAD + A * U} y2={PAD + (A - B) * U}
                  stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="7 5"
                />
                {/* Étiquettes de côté — symboles seulement */}
                <text x={PAD + (A / 2) * U} y={PAD - 10} textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155">a</text>
                <text x={PAD - 12} y={PAD + (A / 2) * U + 5} textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155">a</text>
                <text x={PAD + (A / 2) * U} y={PAD + (A - B) * U - 8} textAnchor="middle" fontSize="13" fontFamily="monospace" fill="#059669">a − b</text>
              </>
            ) : (
              <>
                {/* Le rectangle recollé : (a + b) de large, (a − b) de haut */}
                <rect
                  x={PAD} y={PAD}
                  width={A * U} height={(A - B) * U}
                  fill="#a7f3d0" stroke="#059669" strokeWidth="2"
                />
                <rect
                  x={PAD + A * U} y={PAD}
                  width={B * U} height={(A - B) * U}
                  fill="#bfdbfe" stroke="#2563eb" strokeWidth="2"
                />
                <line
                  x1={PAD + A * U} y1={PAD}
                  x2={PAD + A * U} y2={PAD + (A - B) * U}
                  stroke="#b91c1c" strokeWidth="2.5" strokeDasharray="7 5"
                />
                <text x={PAD + ((A + B) / 2) * U} y={PAD - 10} textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155">a + b</text>
                <text x={PAD - 14} y={PAD + ((A - B) / 2) * U + 5} textAnchor="middle" fontSize="15" fontFamily="monospace" fontWeight="bold" fill="#334155">a − b</text>
              </>
            )}
          </g>
        </svg>
      </div>

      <p className="text-center text-lg text-slate-800">
        <MathText>
          {state === 0
            ? '$a^{2} - b^{2}$'
            : '$a^{2} - b^{2} = (a + b)(a - b)$'}
        </MathText>
      </p>

      {!frozen && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onToggle?.()}
            aria-pressed={state === 1}
            aria-label={state === 0 ? 'Faire glisser le morceau découpé' : 'Revenir au carré découpé'}
            className="min-h-[44px] px-4 rounded-xl border-2 border-violet-300 bg-white text-sm font-bold text-violet-800 hover:border-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {state === 0 ? '➡️ Faire glisser le morceau' : '↩️ Revenir au carré découpé'}
          </button>
        </div>
      )}

      <p className="text-center text-xs text-slate-500">
        {state === 0
          ? 'Le carré de côté a, privé d’un carré de côté b. On coupe le long du trait rouge.'
          : 'Rien n’a été ajouté ni enlevé : la même aire, en un rectangle de côtés a + b et a − b.'}
      </p>
    </div>
  );
}
