import { vectorComponents } from './vectorFormat.js';

/**
 * LE شعاع EN COLONNE, DESSINÉ — la version SVG de `vectorColumnLatex`.
 *
 *     ⎛  3 ⎞
 *     ⎝ −2 ⎠
 *
 * Pourquoi un composant et pas KaTeX : sur le plan, les composantes sont
 * écrites DANS le SVG, à côté de la flèche. KaTeX produit du HTML — il ne
 * rend rien à l'intérieur d'un <text> SVG, et un <foreignObject> ne suit pas
 * le zoom du plan. On dessine donc la même colonne avec les primitives du
 * SVG : deux <text> l'un au-dessus de l'autre, et deux parenthèses tracées
 * en <path> qui s'étendent sur les DEUX lignes — ce que deux caractères
 * « ( » et « ) » empilés ne feraient pas.
 *
 * Le repère : (x, y) est le coin où la colonne commence, `anchor` dit de quel
 * côté elle se développe. Les nombres sont posés en `dir="ltr"` comme partout
 * ailleurs dans le مختبر (vectorFormat.js, l'en-tête).
 */
export default function VectorColumn({
  vector, x = 0, y = 0, decimals = 2, fontSize = 13, className = undefined, label = null,
}) {
  const c = vectorComponents(vector, decimals);
  if (!c) return null;

  // La colonne : deux lignes centrées sur `y`, séparées d'une interligne.
  const lineHeight = fontSize * 1.15;
  const topY = y - lineHeight / 2 + fontSize * 0.36;
  const bottomY = y + lineHeight / 2 + fontSize * 0.36;

  // La largeur du contenu décide de l'écartement des parenthèses. Une mesure
  // exacte demanderait le DOM ; la plus longue des deux composantes, comptée
  // en demi-cadratins, suffit pour un nombre à quelques chiffres.
  const widest = Math.max(c.x.length, c.y.length);
  const contentWidth = widest * fontSize * 0.55;
  const padding = fontSize * 0.3;
  const half = contentWidth / 2 + padding;

  // Les délimiteurs, tracés sur toute la hauteur des deux lignes.
  const reach = lineHeight + fontSize * 0.34;
  const bend = fontSize * 0.26;
  const left = -half;
  const right = half;

  return (
    <g className={className} transform={`translate(${x} ${y})`} data-ml-vec-column>
      {label && (
        <text
          x={left - fontSize * 0.5}
          y={fontSize * 0.36}
          textAnchor="end"
          fontSize={fontSize}
          direction="ltr"
          className="sa-ml-vec__columnlabel"
        >
          {label}
        </text>
      )}

      <path
        d={`M ${left + bend} ${-reach / 2} Q ${left} ${-reach / 2} ${left} 0 Q ${left} ${reach / 2} ${left + bend} ${reach / 2}`}
        fill="none"
        strokeWidth={Math.max(1, fontSize * 0.08)}
        className="sa-ml-vec__columndelim"
      />
      <path
        d={`M ${right - bend} ${-reach / 2} Q ${right} ${-reach / 2} ${right} 0 Q ${right} ${reach / 2} ${right - bend} ${reach / 2}`}
        fill="none"
        strokeWidth={Math.max(1, fontSize * 0.08)}
        className="sa-ml-vec__columndelim"
      />

      <text x={0} y={topY - y} textAnchor="middle" fontSize={fontSize} direction="ltr" className="sa-ml-vec__columnvalue">
        {c.x}
      </text>
      <text x={0} y={bottomY - y} textAnchor="middle" fontSize={fontSize} direction="ltr" className="sa-ml-vec__columnvalue">
        {c.y}
      </text>
    </g>
  );
}
