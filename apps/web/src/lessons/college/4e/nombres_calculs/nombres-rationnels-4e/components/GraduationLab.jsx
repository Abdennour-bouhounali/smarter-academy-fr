import React from 'react';
import { FractionView } from '../../../../../common/algebra4e';

/**
 * GraduationLab — fabriquer un dénominateur commun, en découpant.
 *
 * Activity              choisir le nombre de parts d'une graduation commune,
 *                       et regarder les deux fractions tomber dessus — ou pas.
 * Mathematical objective on ne peut additionner que des parts de MÊME TAILLE.
 *                       Quand aucune des deux graduations ne convient, il faut
 *                       en FABRIQUER une troisième où les deux tombent juste.
 * Student action        −/+ sur le nombre de parts.
 * Controlled variable   le dénominateur candidat, seul (§8).
 * Mathematical state    `candidat` — détenu par le MODULE. Composant contrôlé.
 * Visual consequence    deux barres découpées en `candidat` parts. Une barre
 *                       dont la fraction tombe sur une marque est VERTE et
 *                       montre ses parts remplies ; sinon elle est grise et
 *                       une marque rouge indique que la fraction tombe entre
 *                       deux graduations.
 * Expected observation  « 12 marche pour les deux, 5 ne marche pour aucune » —
 *                       puis « 24 marche aussi, mais 12 donne des nombres plus
 *                       petits ».
 * Misconception targeted « 1/4 + 1/6 = 2/10 » : additionner les dénominateurs.
 *                       Ici la barre à 10 parts ne convient à AUCUNE des deux
 *                       fractions, ce qui se voit immédiatement.
 *
 * SÉCURITÉ VISUELLE (§17bis) : les barres sont des rangées de <div> en flex,
 * sans coordonnée calculée. Les parts se partagent la largeur quel qu'en soit
 * le nombre ; les libellés vivent dans leur propre cellule. Rien ne peut se
 * chevaucher — au pire les parts deviennent fines, ce qui EST l'information à
 * lire (une graduation trop fine est une graduation mal choisie).
 */

/** Une fraction tombe-t-elle juste sur une graduation en `parts` morceaux ? */
export const tombeJuste = (f, parts) => (parts * f.n) % f.d === 0;

/** Combien de parts remplies quand elle tombe juste. */
export const partsRemplies = (f, parts) => (parts * f.n) / f.d;

function Barre({ f, parts, couleur, label }) {
  const ok = tombeJuste(f, parts);
  const remplies = ok ? partsRemplies(f, parts) : 0;
  // La position réelle de la fraction, en fraction de la largeur — sert à
  // poser le repère rouge quand elle tombe entre deux marques.
  const position = (f.n / f.d) * 100;

  const TONS = {
    indigo: 'bg-indigo-500 border-indigo-600',
    violet: 'bg-violet-500 border-violet-600',
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-14 shrink-0 text-right">{label}</div>
      <div className="relative flex-1">
        <div
          className={`flex h-10 overflow-hidden rounded-lg border-2 bg-white ${ok ? 'border-emerald-500' : 'border-slate-300'}`}
          role="img"
          aria-label={
            ok
              ? `Tombe juste : ${remplies} parts sur ${parts}`
              : `Ne tombe pas sur une marque d’une graduation en ${parts} parts`
          }
        >
          {Array.from({ length: parts }, (_, i) => (
            <div
              key={i}
              className={`flex-1 border-r last:border-r-0 border-white/70 ${
                ok && i < remplies ? TONS[couleur] : 'bg-slate-100'
              }`}
            />
          ))}
        </div>
        {!ok && (
          <span
            className="pointer-events-none absolute top-0 h-10 w-[3px] -translate-x-1/2 rounded bg-rose-500"
            style={{ left: `${Math.min(position, 100)}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="w-24 shrink-0 text-xs font-semibold">
        {ok ? (
          <span className="text-emerald-700 tabular-nums">
            = {remplies}/{parts}
          </span>
        ) : (
          <span className="text-rose-600">tombe entre 2 marques</span>
        )}
      </div>
    </div>
  );
}

export default function GraduationLab({
  a, b,                   // les deux fractions à réunir (rationnels {n, d})
  candidat,               // le nombre de parts essayé — l'état, détenu par le module
  onCandidat,             // (n) => void
  min = 2,
  max = 24,
  disabled = false,
}) {
  const okA = tombeJuste(a, candidat);
  const okB = tombeJuste(b, candidat);
  const lesDeux = okA && okB;

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="space-y-2">
        <Barre f={a} parts={candidat} couleur="indigo" label={<FractionView value={a} size="sm" tone="indigo" />} />
        <Barre f={b} parts={candidat} couleur="violet" label={<FractionView value={b} size="sm" tone="violet" />} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-semibold text-slate-600">Couper l’unité en</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Moins de parts"
            disabled={disabled || candidat <= min}
            onClick={() => onCandidat(candidat - 1)}
            className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          <span
            className={`inline-flex min-h-[44px] min-w-[64px] items-center justify-center rounded-lg border-2 text-xl font-black tabular-nums ${
              lesDeux ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-slate-50 text-slate-700'
            }`}
          >
            {candidat}
          </span>
          <button
            type="button"
            aria-label="Plus de parts"
            disabled={disabled || candidat >= max}
            onClick={() => onCandidat(candidat + 1)}
            className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-slate-300 bg-white text-lg font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
        </div>
        <span className="text-sm font-semibold text-slate-600">parts</span>
      </div>

      <p className={`text-center text-sm font-semibold ${lesDeux ? 'text-emerald-700' : 'text-slate-500'}`}>
        {lesDeux
          ? 'Les deux fractions tombent sur une marque : on peut compter les parts.'
          : okA || okB
          ? 'Une seule des deux tombe juste — il en faut deux.'
          : 'Aucune des deux ne tombe sur une marque.'}
      </p>
    </div>
  );
}
