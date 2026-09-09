import React, { useState } from 'react';
import { fr } from './statistiques';

/**
 * Diagramme en barres — la représentation qui compare des EFFECTIFS.
 *
 * INVARIANT VISUEL (memory « invariant visuel ») : l'axe des effectifs part
 * TOUJOURS de zéro, et la hauteur d'une barre est exactement proportionnelle
 * à son effectif. Une barre deux fois plus haute représente deux fois plus
 * d'élèves — sinon le dessin contredirait la leçon qui vient de l'expliquer.
 * C'est aussi ce que le module 5 fait constater en montrant l'axe tronqué
 * comme un MENSONGE, jamais comme une option de mise en forme.
 *
 * La graduation est calculée, pas devinée : `pas` est choisi pour donner
 * entre 3 et 6 repères entiers, ce qui évite l'axe illisible sur un grand
 * effectif comme l'axe vide sur un petit.
 */
const W = 320;
const H = 190;
const PAD = { top: 14, right: 10, bottom: 34, left: 30 };

/** Un pas de graduation entier qui donne 3 à 6 repères. */
function choisirPas(max) {
  for (const p of [1, 2, 5, 10, 20, 50, 100]) {
    if (max / p <= 6) return p;
  }
  return Math.ceil(max / 6);
}

export default function BarChart({
  lignes,
  total,
  moyenne = null,
  axeTronque = false,
  ariaLabel = 'Diagramme en barres des effectifs',
}) {
  const [survol, setSurvol] = useState(null);

  const maxEff = Math.max(1, ...lignes.map((l) => l.effectif));
  // L'axe tronqué n'existe QUE pour la démonstration du module 5 : il fait
  // voir ce qu'un graphique malhonnête produit. Par défaut, base = 0.
  const base = axeTronque ? Math.max(0, maxEff - 2) : 0;
  const haut = maxEff;
  const pas = choisirPas(haut - base);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const bandeau = innerW / Math.max(1, lignes.length);
  const largeurBarre = Math.min(38, bandeau * 0.62);

  const y = (v) => PAD.top + innerH - ((v - base) / Math.max(1e-9, haut - base)) * innerH;

  const graduations = [];
  for (let v = base; v <= haut + 1e-9; v += pas) graduations.push(v);

  return (
    <figure className="rounded-xl border-2 border-slate-200 bg-white p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${ariaLabel} : ${lignes.map((l) => `${l.effectif} élève${l.effectif > 1 ? 's' : ''} pour ${l.valeur}`).join(', ')}`}
      >
        {/* Graduations horizontales — repères de lecture, pas décoration. */}
        {graduations.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)}
              stroke="#e2e8f0" strokeWidth="1"
            />
            <text
              x={PAD.left - 5} y={y(v) + 3.5}
              textAnchor="end" fontSize="9" fill="#94a3b8" className="tabular-nums"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#94a3b8" strokeWidth="1.5" />

        {/* La moyenne, tracée seulement quand la leçon l'a introduite. */}
        {moyenne !== null && (
          <g>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={PAD.top + innerH * 0.5} y2={PAD.top + innerH * 0.5}
              stroke="transparent"
            />
          </g>
        )}

        {lignes.map((l, i) => {
          const x = PAD.left + bandeau * i + (bandeau - largeurBarre) / 2;
          const hauteur = Math.max(0, H - PAD.bottom - y(l.effectif));
          const actif = survol === l.valeur;
          return (
            <g
              key={l.valeur}
              onMouseEnter={() => setSurvol(l.valeur)}
              onMouseLeave={() => setSurvol(null)}
              onFocus={() => setSurvol(l.valeur)}
              onBlur={() => setSurvol(null)}
              tabIndex={0}
              role="button"
              aria-label={`${l.valeur} livre${l.valeur > 1 ? 's' : ''} : ${l.effectif} élève${l.effectif > 1 ? 's' : ''}`}
              className="cursor-pointer outline-none"
            >
              <rect
                x={x} y={y(l.effectif)} width={largeurBarre} height={hauteur}
                rx="3"
                fill={actif ? '#0284c7' : '#38bdf8'}
                stroke={actif ? '#0369a1' : '#0ea5e9'}
                strokeWidth="1.5"
              />
              {/* L'effectif écrit sur la barre : le nombre ET la hauteur
                  disent la même chose, ce qui rend la lecture vérifiable. */}
              <text
                x={x + largeurBarre / 2} y={y(l.effectif) - 4}
                textAnchor="middle" fontSize="11" fontWeight="800" fill="#0369a1"
                className="tabular-nums"
              >
                {l.effectif}
              </text>
              <text
                x={x + largeurBarre / 2} y={H - PAD.bottom + 13}
                textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155"
                className="tabular-nums"
              >
                {l.valeur}
              </text>
            </g>
          );
        })}

        <text x={PAD.left + innerW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#64748b">
          Nombre de livres lus
        </text>
      </svg>

      <figcaption className="pt-1 text-center text-xs text-slate-500">
        {survol !== null
          ? (() => {
              const l = lignes.find((x) => x.valeur === survol);
              return `${l.effectif} élève${l.effectif > 1 ? 's' : ''} sur ${total} ont lu ${l.valeur} livre${l.valeur > 1 ? 's' : ''} — ${fr(l.pourcentage, 1)} %`;
            })()
          : 'Hauteur des barres : le nombre d’élèves. Survole une barre.'}
      </figcaption>
      {axeTronque && (
        <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 text-center text-xs font-semibold text-rose-700">
          ⚠︎ Axe qui ne part pas de 0 — les écarts paraissent bien plus grands qu’ils ne sont.
        </p>
      )}
    </figure>
  );
}
