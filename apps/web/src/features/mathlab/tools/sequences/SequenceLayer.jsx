import { useMemo } from 'react';
import { useTransformContext, vec } from 'mafs';
import { formatTerm, termName } from './sequenceFormat.js';

/**
 * LA SUITE DESSINÉE : des points aux abscisses ENTIÈRES, et rien d'autre.
 *
 * ── Pourquoi les points ne sont pas reliés (§18) ──────────────────────────
 * §18 : « Do NOT automatically connect the points with a continuous line
 * unless explicitly enabled. » Ce n'est pas une préférence graphique. Relier
 * (0, u₀) à (1, u₁) par un segment dessine des valeurs en u₀,₅ — des termes
 * qui n'existent pas. Un élève qui voit une ligne continue croit à une
 * fonction ; il doit voir une suite. La liaison existe (couche `connect`),
 * elle est éteinte, et quand on l'allume elle est en pointillé : un guide
 * pour l'œil, pas une courbe.
 *
 * Les BÂTONS (couche `stems`) sont, eux, allumés par défaut : le trait qui
 * descend du point vers l'axe dit « ce point a cette hauteur À CET INDICE »,
 * sans suggérer aucune valeur intermédiaire. C'est le diagramme en bâtons des
 * manuels.
 *
 * Ce composant vit DANS le `<Mafs>` : il lit la transformation du repère par
 * `useTransformContext` et pose du SVG. Aucun calcul mathématique ici — les
 * termes arrivent déjà calculés (§46).
 */
export default function SequenceLayer({
  terms, layers, cursor, even = [], odd = [], range = null,
  secondaryTerms = [], fixedPoints = [], trendValue = null, onPickIndex = null,
}) {
  const { viewTransform } = useTransformContext();
  const project = ([x, y]) => vec.transform([x, y], viewTransform);

  const baseline = useMemo(() => project([0, 0])[1], [viewTransform]);

  // Les indices des sous-suites, pour colorer le point selon sa parité (§23).
  const evenSet = useMemo(() => new Set(even.map((term) => term.n)), [even]);
  const oddSet = useMemo(() => new Set(odd.map((term) => term.n)), [odd]);

  const points = terms.map((term) => {
    const [px, py] = project([term.n, term.value]);

    return { ...term, px, py };
  });

  const secondary = secondaryTerms.map((term) => {
    const [px, py] = project([term.n, term.value]);

    return { ...term, px, py };
  });

  return (
    <g className="sa-ml-seq__layer" data-ml-seq-layer>
      {/* L'étendue observée (§22) : deux lignes, et le mot « observé » est
          dans le panneau, pas ici — un dessin ne peut pas nuancer. */}
      {layers.bounds && range && (
        <g className="sa-ml-seq__bounds" data-ml-seq-bounds>
          {[range.min, range.max].map((value, index) => {
            const [, py] = project([0, value]);

            return (
              <line
                key={index} className="sa-ml-seq__boundline"
                x1={0} y1={py} x2="100%" y2={py}
              />
            );
          })}
        </g>
      )}

      {/* Les points fixes (§10) : une ligne horizontale à la valeur visée. */}
      {layers.fixedPoints && fixedPoints.map((value, index) => {
        const [, py] = project([0, value]);

        return (
          <g key={index} className="sa-ml-seq__fixed" data-ml-seq-fixedline={value}>
            <line className="sa-ml-seq__fixedline" x1={0} y1={py} x2="100%" y2={py} />
          </g>
        );
      })}

      {/* La valeur vers laquelle les termes semblent aller, quand ce n'est pas
          déjà un point fixe tracé — §11 : c'est une OBSERVATION, le panneau le dit. */}
      {layers.fixedPoints && trendValue !== null && !fixedPoints.some((value) => Math.abs(value - trendValue) < 1e-9) && (
        <line
          className="sa-ml-seq__trendline"
          x1={0} y1={project([0, trendValue])[1]} x2="100%" y2={project([0, trendValue])[1]}
          data-ml-seq-trendline={trendValue}
        />
      )}

      {/* La suite COMPARÉE (§33), dessinée derrière : creux, pour ne pas
          disputer la vedette à celle qu'on étudie. */}
      {layers.compare && secondary.length > 0 && (
        <g className="sa-ml-seq__secondary" data-ml-seq-secondary>
          {secondary.map((term) => (
            <circle
              key={term.n} className="sa-ml-seq__secondarydot"
              cx={term.px} cy={term.py} r={4}
            />
          ))}
        </g>
      )}

      {/* La liaison, en POINTILLÉ et seulement si on l'a demandée (§18). */}
      {layers.connect && points.length > 1 && (
        <polyline
          className="sa-ml-seq__connect"
          points={points.map((term) => `${term.px},${term.py}`).join(' ')}
          data-ml-seq-connect
        />
      )}

      {/* Les bâtons : du point vers l'axe des abscisses. */}
      {layers.stems && (
        <g className="sa-ml-seq__stems" data-ml-seq-stems>
          {points.map((term) => (
            <line
              key={term.n}
              className={`sa-ml-seq__stem${term.value < 0 ? ' sa-ml-seq__stem--negative' : ''}`}
              x1={term.px} y1={baseline} x2={term.px} y2={term.py}
            />
          ))}
        </g>
      )}

      {/* Les points. Le terme courant est plus gros et porte sa propre classe :
          §6 veut que « the current term should be highlighted ». */}
      {layers.points && (
        <g className="sa-ml-seq__dots">
          {points.map((term) => {
            const current = term.n === cursor;
            const parity = layers.evenOdd
              ? (evenSet.has(term.n) ? ' sa-ml-seq__dot--even' : oddSet.has(term.n) ? ' sa-ml-seq__dot--odd' : '')
              : '';

            return (
              <g key={term.n}>
                {/* Une cible tactile large et invisible : sur un téléphone, on
                    ne touche pas un disque de 5 px (§45). */}
                {onPickIndex && (
                  <circle
                    className="sa-ml-seq__hit"
                    cx={term.px} cy={term.py} r={18}
                    onPointerDown={(event) => { event.stopPropagation(); onPickIndex(term.n); }}
                    data-ml-seq-hit={term.n}
                  />
                )}
                <circle
                  className={`sa-ml-seq__dot${current ? ' sa-ml-seq__dot--current' : ''}${parity}${term.value < 0 ? ' sa-ml-seq__dot--negative' : ''}`}
                  cx={term.px} cy={term.py} r={current ? 7 : 5}
                  data-ml-seq-dot={term.n}
                  data-ml-seq-current={current ? 'true' : 'false'}
                >
                  {/* Le titre SVG rend le point lisible au survol ET par un
                      lecteur d'écran, sans une seule chaîne traduite ici. */}
                  <title>{`${termName(term.n)} = ${formatTerm(term.value)}`}</title>
                </circle>
              </g>
            );
          })}
        </g>
      )}

      {/* Les étiquettes : seulement quand elles TIENNENT.
          Dix valeurs sur dix points se lisent ; cent font un mur d'encre —
          et une suite qui converge les empile toutes à la même hauteur, ce
          que la QA visuelle a montré sur le préréglage du point fixe
          (« 4,375 4,187 4,09… » illisibles les uns sur les autres). On
          n'écrit donc une étiquette que si la précédente est assez loin. */}
      {layers.labels && points.length <= 16 && (
        <g className="sa-ml-seq__labels" data-ml-seq-labels>
          {points.map((term, index) => {
            const previous = index > 0 ? points[index - 1] : null;
            const crowded = previous
              && Math.abs(term.py - previous.py) < 14
              && Math.abs(term.px - previous.px) < 44;
            // Le terme courant garde TOUJOURS son étiquette : c'est celui
            // qu'on regarde (§6).
            if (crowded && term.n !== cursor) return null;

            return (
              <text
                key={term.n}
                className={`sa-ml-seq__label${term.n === cursor ? ' sa-ml-seq__label--current' : ''}`}
                x={term.px}
                y={term.value >= 0 ? term.py - 12 : term.py + 20}
                textAnchor="middle"
              >
                {formatTerm(term.value)}
              </text>
            );
          })}
        </g>
      )}
    </g>
  );
}
