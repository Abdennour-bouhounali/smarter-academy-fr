import React from 'react';
import { aireCarre, volumeCube, ecrirePuissance } from './puissances';

/**
 * SquareCubeLab — pourquoi on dit « au carré » et « au cube ».
 *
 * L'élève fait varier UN côté, et voit simultanément le carré de ce côté se
 * remplir de cases (n²) et le cube s'empiler (n³). Les deux mots ne sont pas
 * des conventions arbitraires : ils nomment la figure qu'on obtient.
 *
 * Expected observation : « quand je double le côté, l'aire est multipliée par
 * 4 et le volume par 8 » — la puissance n'est pas une multiplication.
 * Misconception targeted : croire que n² vaut n × 2 (le carré du côté 5
 * contient visiblement 25 cases, pas 10).
 *
 * Sécurité visuelle (§17bis) : le carré est une grille CSS dont la taille de
 * case est BORNÉE, dans un conteneur qui défile lui-même si besoin ; le cube
 * est un empilement de couches, chacune une grille identique. Aucun texte
 * n'est posé sur le dessin — tous les libellés vivent dans leurs propres
 * cellules, au-dessus et au-dessous. Aucune position n'est supposée, donc
 * aucun chevauchement n'est possible quel que soit le côté choisi.
 */
export default function SquareCubeLab({
  cote,                 // longueur du côté (1 … maxCote)
  onCote,
  maxCote = 6,
  montrer = 'les-deux', // 'carre' | 'cube' | 'les-deux'
  ariaLabel,
}) {
  // La taille de case rétrécit quand le côté grandit : le dessin garde le même
  // encombrement quel que soit le nombre de cases. Dérivé, jamais codé en dur.
  const px = Math.max(12, Math.round(120 / cote));

  const Grille = ({ n, couleur, opacite = 1 }) => (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${n}, ${px}px)`, opacity: opacite }}
    >
      {Array.from({ length: n * n }, (_, i) => (
        <div key={i} style={{ width: px, height: px }} className={`rounded-[2px] ${couleur}`} />
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* Le choix du côté — des puces de 44 px : on essaie, on compare. */}
      <div className="space-y-1.5">
        <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
          Longueur du côté
        </div>
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label={ariaLabel || 'Choisir le côté'}>
          {Array.from({ length: maxCote }, (_, i) => i + 1).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCote?.(c)}
              aria-pressed={c === cote}
              data-cote={c}
              className={[
                'min-h-[44px] min-w-[44px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                c === cote
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400',
              ].join(' ')}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* LE CARRÉ — n rangées de n cases. */}
        {(montrer === 'carre' || montrer === 'les-deux') && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-center text-indigo-700">
              Un carré de côté {cote}
            </div>
            <div className="overflow-x-auto flex justify-center">
              <Grille n={cote} couleur="bg-indigo-500" />
            </div>
            <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1.5 text-center">
              <output className="font-mono text-sm font-black text-indigo-800" data-aire={String(aireCarre(cote))}>
                {ecrirePuissance(cote, 2)} = {aireCarre(cote)} cases
              </output>
            </div>
          </div>
        )}

        {/* LE CUBE — n couches, chacune un carré de côté n. */}
        {(montrer === 'cube' || montrer === 'les-deux') && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-center text-emerald-700">
              Un cube d’arête {cote}
            </div>
            <div className="overflow-x-auto flex justify-center">
              {/* Les couches se décalent pour suggérer la profondeur, sans
                  jamais se recouvrir au point de masquer un compte. */}
              <div className="relative" style={{ width: cote * (px + 2) + cote * 4, height: cote * (px + 2) + cote * 4 }}>
                {Array.from({ length: cote }, (_, k) => (
                  <div key={k} className="absolute" style={{ left: k * 4, top: (cote - 1 - k) * 4 }}>
                    <Grille n={cote} couleur="bg-emerald-500" opacite={0.55 + (k / cote) * 0.45} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5 text-center">
              <output className="font-mono text-sm font-black text-emerald-800" data-volume={String(volumeCube(cote))}>
                {ecrirePuissance(cote, 3)} = {volumeCube(cote)} cubes
              </output>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
