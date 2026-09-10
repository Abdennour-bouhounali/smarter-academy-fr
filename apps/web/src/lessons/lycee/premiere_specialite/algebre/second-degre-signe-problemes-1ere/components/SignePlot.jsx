import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { cadreDe, roots, evalTrinome, trinomialSign, fr, trinomeText } from './signeProblemesUtils';

/**
 * SignePlot — la parabole d'un trinôme, avec les BANDES de son signe peintes
 * sur le cadre.
 *
 * Ce n'est PAS un laboratoire : c'est l'illustration exacte d'un trinôme que
 * l'élève travaille par le calcul, et qui lui sert de vérification visuelle.
 * L'interaction du module vit dans les questions, pas ici.
 *
 * Le cadre est CALCULÉ par `cadreDe` à partir du sommet et de l'intervalle
 * d'étude, jamais saisi : c'est ce qui garantit que l'axe des abscisses et le
 * sommet sont visibles pour TOUS les trinômes de la leçon (verrouillé par le
 * test « cadreDe contient le sommet et les bornes »).
 *
 * Les bandes sont dérivées de `trinomialSign` : la figure ne peut donc pas
 * contredire le tableau de signes que le module vient de dresser — c'est
 * l'invariant visuel, et il est structurel, pas surveillé.
 */
const COURBE = '#4f46e5';
const RACINE = '#e11d48';

export default function SignePlot({
  a, b, c,
  xMin = null, xMax = null,
  /** Peindre les bandes de signe : vert où le trinôme est positif, rose où il
   *  est négatif. Un module peut les masquer pour faire chercher. */
  montrerBandes = true,
  /** Bandes SUPPLÉMENTAIRES, propres au contexte d'un problème (le domaine
   *  des valeurs qui ont un sens, par exemple). */
  bandesContexte = [],
  montrerRacines = true,
  unit = 34,
  legende = null,
}) {
  const rs = roots(a, b, c);
  const bornes = rs.length ? [Math.min(...rs), Math.max(...rs)] : [-2, 2];
  const xa = xMin ?? bornes[0] - 2;
  const xb = xMax ?? bornes[1] + 2;
  const cadre = cadreDe({ a, b, c }, xa, xb);

  const bandes = [];
  if (montrerBandes) {
    for (const cell of trinomialSign(a, b, c)) {
      if (cell.sign === 0) continue;
      bandes.push({
        from: cell.from ?? cadre.xMin,
        to: cell.to ?? cadre.xMax,
        tone: cell.sign === 1 ? 'emerald' : 'rose',
      });
    }
  }
  bandes.push(...bandesContexte);

  const points = montrerRacines ? rs.map((r, i) => ({ id: `r${i}`, x: r, y: 0, color: RACINE })) : [];

  const largeur = cadre.xMax - cadre.xMin;
  const hauteur = cadre.yMax - cadre.yMin;
  // L'unité verticale se CALCULE pour que la figure garde des proportions
  // lisibles quel que soit le trinôme : sans elle, un cadre de 80 unités de
  // haut produirait une image de 2 700 px. Plancher à 8 px pour rester lisible.
  const unitY = Math.max(8, Math.min(unit, Math.round((largeur * unit) / Math.max(hauteur, 1))));

  return (
    <div className="space-y-2">
      <CoordPlane
        range={cadre}
        unit={unit}
        unitY={unitY}
        xStep={largeur > 14 ? 2 : 1}
        yStep={hauteur > 14 ? Math.ceil(hauteur / 10) : 1}
        highlightIntervals={bandes}
        curves={[{ id: 'tri', points: echantillonne({ a, b, c }, cadre), tone: COURBE, width: 2.5 }]}
        points={points}
        caption={false}
        disabled
        ariaLabel={
          `Courbe de ${trinomeText(a, b, c)}. ` +
          (rs.length === 0
            ? 'Elle ne coupe pas l’axe des abscisses.'
            : `Elle coupe l’axe des abscisses en ${rs.map((r) => fr(arrondi(r))).join(' et ')}.`) +
          (montrerBandes
            ? ` Les zones vertes sont celles où le trinôme est positif, les zones roses celles où il est négatif.`
            : '')
        }
      />
      {/* Toutes les lectures en DOM : deux racines proches ne peuvent donc pas
          produire deux étiquettes SVG qui se chevauchent. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        {montrerRacines && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: RACINE }} aria-hidden="true" />
            {rs.length === 0
              ? 'aucune racine : la courbe ne touche pas l’axe'
              : `racine${rs.length > 1 ? 's' : ''} : ${rs.map((r) => fr(arrondi(r))).join('  et  ')}`}
          </span>
        )}
        {montrerBandes && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-400" aria-hidden="true" /> positif
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-rose-400" aria-hidden="true" /> négatif
            </span>
          </>
        )}
        {legende}
      </div>
    </div>
  );
}

const arrondi = (n) => Math.round(n * 100) / 100;

/** Le trinôme échantillonné, COUPÉ au cadre — jamais tracé puis rogné. */
function echantillonne({ a, b, c }, cadre) {
  const pts = [];
  const n = 200;
  for (let i = 0; i <= n; i += 1) {
    const x = cadre.xMin + ((cadre.xMax - cadre.xMin) * i) / n;
    const y = evalTrinome(a, b, c, x);
    if (y >= cadre.yMin && y <= cadre.yMax) pts.push({ x, y });
  }
  return pts;
}
