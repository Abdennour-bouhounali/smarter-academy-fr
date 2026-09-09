import React, { useState } from 'react';
import { fr } from './statistiques';

/**
 * Diagramme circulaire — la représentation qui montre des PARTS D'UN TOUT.
 *
 * INVARIANT VISUEL : l'angle d'un secteur est exactement fréquence × 360°,
 * calculé par le noyau (`ligne.angle`), jamais approché à l'œil. Un secteur
 * qui « a l'air » du tiers EST le tiers — sans quoi le dessin contredirait
 * la proportionnalité que la leçon vient d'installer.
 *
 * Les angles sont cumulés en un seul balayage, donc le dernier secteur ferme
 * exactement le disque : aucun liseré blanc, aucun recouvrement.
 */
const S = 190;              // côté du viewBox (échelle S partagée)
const C = S / 2;            // centre
const R = 72;               // rayon
const R_ETIQ = 52;          // rayon de placement des étiquettes internes

const PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

/** Point du cercle à l'angle donné (degrés, 0 = midi, sens horaire). */
const point = (angleDeg, rayon) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [C + rayon * Math.cos(a), C + rayon * Math.sin(a)];
};

/** Le chemin SVG d'un secteur, du `debut` au `debut + balayage`. */
function secteur(debut, balayage) {
  // Un secteur qui vaut le tour complet ne peut pas s'écrire en arc :
  // le point de départ et d'arrivée coïncideraient et rien ne serait tracé.
  if (balayage >= 359.999) {
    return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} Z`;
  }
  const [x1, y1] = point(debut, R);
  const [x2, y2] = point(debut + balayage, R);
  const grandArc = balayage > 180 ? 1 : 0;
  return `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${grandArc} 1 ${x2} ${y2} Z`;
}

export default function PieChart({
  lignes,
  total,
  ariaLabel = 'Diagramme circulaire des fréquences',
}) {
  const [survol, setSurvol] = useState(null);

  // Balayage cumulé : chaque secteur commence là où le précédent finit.
  let curseur = 0;
  const secteurs = lignes.map((l, i) => {
    const debut = curseur;
    curseur += l.angle;
    return { ...l, debut, couleur: PALETTE[i % PALETTE.length] };
  });

  return (
    <figure className="rounded-xl border-2 border-slate-200 bg-white p-2">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <svg
          viewBox={`0 0 ${S} ${S}`}
          className="w-40 h-40 shrink-0"
          role="img"
          aria-label={`${ariaLabel} : ${secteurs.map((s) => `${s.valeur} livres pour ${fr(s.pourcentage, 1)} pour cent`).join(', ')}`}
        >
          {secteurs.map((s) => {
            const actif = survol === s.valeur;
            const [ex, ey] = point(s.debut + s.angle / 2, R_ETIQ);
            return (
              <g
                key={s.valeur}
                onMouseEnter={() => setSurvol(s.valeur)}
                onMouseLeave={() => setSurvol(null)}
                onFocus={() => setSurvol(s.valeur)}
                onBlur={() => setSurvol(null)}
                tabIndex={0}
                role="button"
                aria-label={`${s.valeur} livre${s.valeur > 1 ? 's' : ''} : ${s.effectif} sur ${total}, soit ${fr(s.pourcentage, 1)} pour cent`}
                className="cursor-pointer outline-none"
              >
                <path
                  d={secteur(s.debut, s.angle)}
                  fill={s.couleur}
                  stroke="#fff"
                  strokeWidth="2"
                  opacity={survol === null || actif ? 1 : 0.45}
                />
                {/* L'étiquette n'est écrite que si le secteur est assez large
                    pour la contenir — sinon elle déborderait sur le voisin
                    (audit de collisions SVG). La légende la porte toujours. */}
                {s.angle >= 34 && (
                  <text
                    x={ex} y={ey + 3.5}
                    textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff"
                    className="tabular-nums pointer-events-none"
                  >
                    {s.effectif}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Légende — porte la valeur, la fraction ET le pourcentage. */}
        <ul className="w-full space-y-1 sm:max-w-sm">
          {secteurs.map((s) => (
            <li
              key={s.valeur}
              onMouseEnter={() => setSurvol(s.valeur)}
              onMouseLeave={() => setSurvol(null)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
                survol === s.valeur ? 'bg-slate-100' : ''
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-sm border border-white shadow-sm"
                style={{ background: s.couleur }}
              />
              <span className="font-semibold text-slate-700">
                {s.valeur} livre{s.valeur > 1 ? 's' : ''}
              </span>
              <span className="ml-auto font-mono tabular-nums text-slate-500">
                {s.effectif}/{total} · {fr(s.pourcentage, 1)} %
              </span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="pt-1 text-center text-xs text-slate-500">
        {survol !== null
          ? (() => {
              const s = secteurs.find((x) => x.valeur === survol);
              return `Angle du secteur : ${s.effectif}/${total} × 360° = ${fr(s.angle, 1)}°`;
            })()
          : 'Le disque entier représente les ' + total + ' élèves. Survole un secteur.'}
      </figcaption>
    </figure>
  );
}
