import React from 'react';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { cadreDe, roots, vertex, evalTrinome, fr, trinomeText } from './quadUtils';

/**
 * TrinomePlot — la parabole d'un trinôme donné, avec ses points sur l'axe.
 *
 * Ce n'est PAS un laboratoire : c'est l'illustration exacte d'un trinôme que
 * l'élève travaille par le calcul, et qui lui sert de vérification visuelle.
 * L'interaction du module vit dans les questions, pas ici.
 *
 * Le cadre est CALCULÉ par `cadreDe` à partir du sommet et des racines, jamais
 * saisi : c'est ce qui garantit que le sommet, les racines et l'axe des
 * abscisses sont visibles pour TOUS les trinômes de la leçon (verrouillé par
 * le test « les cadres CALCULÉS contiennent le sommet et les racines »).
 *
 * Les nombres vivent dans le DOM sous la figure : deux racines proches ne
 * peuvent donc pas produire deux étiquettes SVG qui se chevauchent.
 */
const COURBE = '#4f46e5';
const RACINE = '#e11d48';
const SOMMET = '#d97706';

export default function TrinomePlot({ trinome, montrerRacines = true, montrerSommet = true, unit = 34 }) {
  const { a, b, c } = trinome;
  const cadre = cadreDe(trinome);
  const rs = roots(a, b, c);
  const v = vertex(a, b, c);

  const points = [];
  if (montrerRacines) rs.forEach((r, i) => points.push({ id: `r${i}`, x: r, y: 0, color: RACINE }));
  if (montrerSommet) points.push({ id: 'S', x: v.x, y: v.y, color: SOMMET });

  const largeur = cadre.xMax - cadre.xMin;
  const hauteur = cadre.yMax - cadre.yMin;
  // L'unité verticale se CALCULE pour que la figure garde des proportions
  // lisibles quel que soit le trinôme : sans elle, un cadre de 20 unités de
  // haut produirait une image de 700 px. Plancher à 14 px pour rester lisible.
  const unitY = Math.max(14, Math.min(unit, Math.round((largeur * unit) / Math.max(hauteur, 1))));

  return (
    <div className="space-y-2">
      <CoordPlane
        range={cadre}
        unit={unit}
        unitY={unitY}
        xStep={1}
        yStep={hauteur > 12 ? 2 : 1}
        curves={[{ id: trinome.id ?? 'tri', points: echantillonne(trinome, cadre), tone: COURBE, width: 2.5 }]}
        points={points}
        caption={false}
        disabled
        ariaLabel={
          `Parabole de ${trinomeText(a, b, c)}. ` +
          (rs.length === 0
            ? 'Elle ne coupe pas l’axe des abscisses.'
            : `Elle coupe l’axe des abscisses en ${rs.map((r) => fr(arrondi(r))).join(' et ')}.`) +
          ` Son sommet est au point (${fr(arrondi(v.x))} ; ${fr(arrondi(v.y))}).`
        }
      />
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        {montrerRacines && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: RACINE }} aria-hidden="true" />
            {rs.length === 0
              ? 'aucun point sur l’axe'
              : rs.map((r) => `x = ${fr(arrondi(r))}`).join('  et  ')}
          </span>
        )}
        {montrerSommet && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: SOMMET }} aria-hidden="true" />
            sommet ({fr(arrondi(v.x))} ; {fr(arrondi(v.y))})
          </span>
        )}
      </div>
    </div>
  );
}

const arrondi = (n) => Math.round(n * 100) / 100;

/** La parabole échantillonnée, COUPÉE au cadre — jamais tracée puis rognée. */
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
