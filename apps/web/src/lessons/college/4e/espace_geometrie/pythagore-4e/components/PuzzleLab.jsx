import React, { useMemo, useState } from 'react';
import { puzzlePreuve, fr, arrondi } from './pythagore4e';

/**
 * PuzzleLab — quatre triangles à poser, et c² qui APPARAÎT au milieu.
 *
 * Activity              faire glisser les quatre copies du triangle dans les
 *                       quatre coins du cadre.
 * Mathematical objective (a + b)² = 4 × (ab/2) + c², donc a² + b² = c².
 *                       L'élève ne lit pas cette identité : il la fabrique.
 * Student action        prendre une pièce, la déposer dans un coin.
 * Controlled variable   la position de chaque pièce ; les dimensions a et b
 *                       sont réglables.
 * Mathematical state    la liste des pièces posées ; le trou central et son
 *                       côté sont CALCULÉS par `puzzlePreuve`.
 * Visual consequence    le trou se referme peu à peu ; quand les quatre
 *                       pièces sont en place, il ne reste qu'un carré incliné,
 *                       et sa mesure s'affiche.
 * Expected observation  « le trou du milieu, c'est un carré — et son côté,
 *                       c'est l'hypoténuse ».
 * Misconception targeted croire que le grand carré est « les deux petits mis
 *                       côte à côte » : ici, il est incliné, et son côté n'est
 *                       ni a, ni b, ni a + b.
 *
 * SÉCURITÉ VISUELLE : le cadre est le carré de côté (a + b), et TOUTES les
 * pièces y tiennent par construction (vérifié par test). Les mesures sont
 * affichées hors du SVG.
 *
 * ACCESSIBILITÉ : chaque pièce est un bouton ; on la pose au clavier comme au
 * doigt (cliquer la pièce puis le coin, ou glisser).
 */
const COINS = ['en bas à gauche', 'en bas à droite', 'en haut à droite', 'en haut à gauche'];

export default function PuzzleLab({ a, b, onA, onB, posees, onPoser, onRecommencer }) {
  const z = useMemo(() => puzzlePreuve(a, b), [a, b]);
  const [prise, setPrise] = useState(null);

  const U = 300 / z.cadre; // unités du cadre → unités du SVG
  const pt = (p) => `${p.x * U},${(z.cadre - p.y) * U}`; // y vers le haut pour l'élève
  const toutesPosees = posees.length === 4;

  const deposer = (i) => {
    if (posees.includes(i)) return;
    onPoser(i);
    setPrise(null);
  };

  return (
    <div className="space-y-3" role="group" aria-label="Puzzle : poser quatre triangles dans le cadre">
      {/* Les réglages du triangle. */}
      <div className="flex flex-wrap gap-3">
        {[
          { id: 'a', label: 'côté a', valeur: a, set: onA },
          { id: 'b', label: 'côté b', valeur: b, set: onB },
        ].map((cur) => (
          <div key={cur.id} className="flex-1 min-w-[130px] rounded-xl border-2 border-slate-200 bg-white p-2.5">
            <label htmlFor={`puz-${cur.id}`} className="flex items-baseline justify-between text-xs font-bold text-slate-600">
              {cur.label}
              <span className="font-mono text-base font-black text-slate-900">{cur.valeur}</span>
            </label>
            <input
              id={`puz-${cur.id}`}
              type="range"
              min={2}
              max={8}
              step={1}
              value={cur.valeur}
              onChange={(e) => cur.set(Number(e.target.value))}
              className="sa-slider accent-sky-600 mt-1 w-full"
              aria-valuetext={`${cur.label} : ${cur.valeur}`}
            />
          </div>
        ))}
      </div>

      {/* Le cadre et les pièces posées. */}
      <div className="mx-auto max-w-[330px]">
        <svg viewBox="-8 -8 316 316" className="w-full" role="img"
             aria-label={`Cadre de côté ${a + b}, ${posees.length} triangle(s) posé(s) sur 4`}>
          {/* Le cadre. */}
          <rect x={0} y={0} width={300} height={300} fill="#f8fafc" stroke="#0f172a" strokeWidth={2} />

          {/* Le trou central, révélé quand les quatre pièces sont posées. */}
          {toutesPosees && (
            <polygon
              points={z.carreIncline.sommets.map(pt).join(' ')}
              fill="#fbbf24" fillOpacity={0.35} stroke="#b45309" strokeWidth={2.5}
            />
          )}

          {/* Les pièces posées. */}
          {z.pieces.map((p, i) =>
            posees.includes(i) ? (
              <polygon key={p.id} points={p.sommets.map(pt).join(' ')}
                       fill="#0891b2" fillOpacity={0.32} stroke="#0e7490" strokeWidth={2} />
            ) : null
          )}

          {/* Les emplacements libres, en pointillé — la cible du geste. */}
          {z.pieces.map((p, i) =>
            posees.includes(i) ? null : (
              <g key={`vide-${p.id}`}>
                <polygon points={p.sommets.map(pt).join(' ')}
                         fill="transparent" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 4" />
                {/* Zone tactile généreuse, invisible mais cliquable. */}
                <polygon points={p.sommets.map(pt).join(' ')} fill="transparent"
                         style={{ cursor: 'pointer' }} onClick={() => deposer(i)}
                         role="button" tabIndex={0}
                         aria-label={`Poser un triangle ${COINS[i]}`}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deposer(i); } }} />
              </g>
            )
          )}
        </svg>
      </div>

      {/* Les pièces à prendre, et le bouton pour recommencer. */}
      <div className="flex flex-wrap items-center gap-2">
        {z.pieces.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => (posees.includes(i) ? null : deposer(i))}
            disabled={posees.includes(i)}
            aria-label={`Triangle ${i + 1}, à poser ${COINS[i]}`}
            className={`min-h-[44px] flex-1 rounded-xl border-2 px-2 py-2 text-xs font-bold transition-colors ${
              posees.includes(i)
                ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400'
            }`}
          >
            {posees.includes(i) ? '✓ posé' : `poser ${COINS[i].replace('en ', '')}`}
          </button>
        ))}
      </div>

      {posees.length > 0 && (
        <button type="button" onClick={onRecommencer}
                className="min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
          ↺ Recommencer
        </button>
      )}

      {/* Les mesures, dans le DOM. */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border-2 border-slate-200 bg-white p-2">
          <div className="text-[11px] font-semibold text-slate-500">le cadre</div>
          <div className="font-mono text-base font-black text-slate-900">{a + b} × {a + b}</div>
          <div className="text-[10px] text-slate-400">soit {(a + b) ** 2}</div>
        </div>
        <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-2">
          <div className="text-[11px] font-semibold text-cyan-700">les 4 triangles</div>
          <div className="font-mono text-base font-black text-cyan-900">{posees.length} / 4</div>
          <div className="text-[10px] text-cyan-600">soit {arrondi(posees.length * (a * b) / 2, 1)}</div>
        </div>
        <div className={`rounded-xl border-2 p-2 ${toutesPosees ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-[11px] font-semibold text-slate-500">le trou du milieu</div>
          <div className={`font-mono text-base font-black ${toutesPosees ? 'text-amber-800' : 'text-slate-300'}`}>
            {toutesPosees ? arrondi(z.carreIncline.aire, 1) : '?'}
          </div>
          <div className="text-[10px] text-slate-400">
            {toutesPosees ? `côté ${fr(arrondi(z.cote, 2))}` : 'pose les 4 pièces'}
          </div>
        </div>
      </div>
    </div>
  );
}
