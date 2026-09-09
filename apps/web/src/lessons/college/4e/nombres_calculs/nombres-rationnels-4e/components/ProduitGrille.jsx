import React from 'react';
import { FractionView } from '../../../../../common/algebra4e';

/**
 * ProduitGrille — le produit de deux fractions, LU sur un quadrillage.
 *
 * Activity              régler les deux fractions et regarder le rectangle
 *                       commun se redécouper.
 * Mathematical objective multiplier deux fractions, c'est prendre une PART
 *                       D'UNE PART. Le rectangle unité est coupé
 *                       verticalement par le premier dénominateur et
 *                       horizontalement par le second : il y a donc b × d
 *                       cases, et la zone commune en couvre a × c. La règle
 *                       « numérateurs entre eux, dénominateurs entre eux »
 *                       n'est alors pas une convention à retenir, c'est ce
 *                       qu'on COMPTE.
 * Student action        −/+ sur les quatre nombres.
 * Controlled variable   un terme à la fois.
 * Mathematical state    les deux fractions, détenues par le MODULE.
 * Visual consequence    trois zones : la bande verticale (première fraction),
 *                       la bande horizontale (seconde), et leur INTERSECTION
 *                       — le produit.
 * Expected observation  « la zone commune est toujours plus petite que
 *                       chacune des deux bandes » : multiplier par un nombre
 *                       inférieur à 1 fait DIMINUER.
 * Misconception targeted « multiplier fait toujours grandir », et
 *                       « il faut un dénominateur commun pour multiplier ».
 *
 * SÉCURITÉ VISUELLE (§17bis) : la grille est un CSS grid de <div>, sans
 * coordonnée calculée ; les libellés vivent hors de la grille. Les cases se
 * partagent la largeur quel qu'en soit le nombre — rien ne peut déborder ni
 * se chevaucher, à aucune taille d'écran.
 */
export default function ProduitGrille({
  a,                 // première fraction {n, d} — positive
  b,                 // seconde fraction {n, d} — positive
  showResult = true,
}) {
  const cols = a.d;
  const rows = b.d;
  const cases = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const dansA = c < a.n;          // bande verticale : les a.n premières colonnes
      const dansB = r < b.n;          // bande horizontale : les b.n premières lignes
      cases.push({ key: `${r}-${c}`, dansA, dansB, commun: dansA && dansB });
    }
  }

  const communes = a.n * b.n;
  const total = a.d * b.d;

  return (
    <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center justify-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-indigo-400" aria-hidden="true" />
          <FractionView value={a} size="sm" tone="indigo" />
        </span>
        <span className="font-black text-slate-500">de</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-violet-400" aria-hidden="true" />
          <FractionView value={b} size="sm" tone="violet" />
        </span>
      </div>

      <div
        className="mx-auto grid max-w-md overflow-hidden rounded-lg border-2 border-slate-400"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, aspectRatio: '3 / 2' }}
        role="img"
        aria-label={`Rectangle coupé en ${cols} colonnes et ${rows} lignes, soit ${total} cases ; la zone commune en couvre ${communes}.`}
      >
        {cases.map(({ key, dansA, dansB, commun }) => (
          <div
            key={key}
            className={[
              'border border-white/60',
              commun
                ? 'bg-emerald-500'
                : dansA
                ? 'bg-indigo-200'
                : dansB
                ? 'bg-violet-200'
                : 'bg-slate-50',
            ].join(' ')}
          />
        ))}
      </div>

      {showResult && (
        <p className="text-center text-sm text-slate-700">
          Le rectangle est coupé en <strong className="tabular-nums">{a.d} × {b.d} = {total}</strong>{' '}
          cases ; la zone commune en couvre{' '}
          <strong className="tabular-nums text-emerald-700">{a.n} × {b.n} = {communes}</strong>.
        </p>
      )}
    </div>
  );
}
