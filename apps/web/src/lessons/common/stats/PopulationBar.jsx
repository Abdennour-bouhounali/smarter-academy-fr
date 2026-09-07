import React, { useId } from 'react';

/**
 * PopulationBar — une population lue comme une SURFACE proportionnelle, et
 * une condition qui rétrécit visiblement le tout.
 *
 * POURQUOI PAS UNE GRILLE DE PASTILLES. Le prédécesseur (PopulationGrid)
 * dessinait un individu par pastille : 800 disques pour un lycée, 10 000 pour
 * un dépistage. L'élève ne pouvait ni les compter, ni voir que 150 internes
 * sur 200 sont en club — les quatre couleurs se lisaient comme des bandes
 * décoratives. Or la mathématique de ces leçons n'est pas « combien
 * d'individus », c'est « quelle PART, et de quel TOUT » : une longueur
 * proportionnelle la porte exactement, et se compare à l'œil.
 *
 * CE QUE LA FIGURE DIT, ET QUI EST VRAI PAR CONSTRUCTION :
 *  - la largeur d'un segment est proportionnelle à son effectif ;
 *  - la barre du haut est la population entière, toujours à la même échelle ;
 *  - la barre du bas est l'UNIVERS RESTREINT, redessiné sur toute la largeur :
 *    c'est le geste « le tout a changé », donc le dénominateur aussi.
 * Rien n'est arrondi en silence : chaque segment porte son effectif dès qu'il
 * a la place, et la légende le donne toujours.
 *
 * ACCESSIBILITÉ. Chaque segment est un `<title>` lisible par lecteur d'écran,
 * la couleur n'est jamais seule porteuse d'information (effectif écrit,
 * légende, motif hachuré pour les segments hors univers).
 *
 * @param {{id,count,color,label}[]} groups     catégories, dans l'ordre de lecture
 * @param {string[]} [dimmed]                   ids hors de l'univers de référence
 * @param {string} [restrictedLabel]            légende de la barre du bas
 * @param {boolean} [showRestricted=true]       dessiner la barre « univers restreint »
 */
export default function PopulationBar({
  groups,
  dimmed = [],
  restrictedLabel,
  showRestricted = true,
  width = 640,
  barHeight = 46,
  legend = true,
  caption,
}) {
  const uid = useId().replace(/:/g, '');
  const total = groups.reduce((a, g) => a + g.count, 0);
  if (total === 0) return null;

  const kept = groups.filter((g) => !dimmed.includes(g.id));
  const keptTotal = kept.reduce((a, g) => a + g.count, 0);
  const restricted = showRestricted && keptTotal > 0 && keptTotal < total;

  const gap = 2;                      // respiration entre segments, en unités svg
  const labelH = 17;                  // place des effectifs sous une barre
  const rowH = barHeight + labelH;
  const height = rowH + (restricted ? rowH + 30 : 0) + 4;

  /** Découpe une largeur en segments proportionnels aux effectifs. */
  const layout = (list, sum, w) => {
    let x = 0;
    return list.map((g) => {
      const segW = sum === 0 ? 0 : (g.count / sum) * w;
      const seg = { g, x, w: segW };
      x += segW;
      return seg;
    });
  };

  const topSegs = layout(groups, total, width);
  const botSegs = restricted ? layout(kept, keptTotal, width) : [];

  /** L'effectif ne s'écrit que s'il tient dans le segment. */
  const fits = (segW, text) => segW > text.length * 7.2 + 8;

  const Row = ({ segs, y, faded }) => (
    <g>
      {segs.map(({ g, x, w }) => {
        const off = faded && dimmed.includes(g.id);
        const label = String(g.count);
        return (
          <g key={g.id}>
            <rect
              x={x + (w > gap ? gap / 2 : 0)} y={y}
              width={Math.max(0, w - (w > gap ? gap : 0))} height={barHeight}
              rx={4}
              fill={off ? '#e2e8f0' : g.color}
            />
            {off && (
              <rect
                x={x + (w > gap ? gap / 2 : 0)} y={y}
                width={Math.max(0, w - (w > gap ? gap : 0))} height={barHeight}
                rx={4} fill={`url(#hatch-${uid})`}
              />
            )}
            <title>{`${g.label} : ${g.count}`}</title>
            {fits(w, label) && (
              <text
                x={x + w / 2} y={y + barHeight / 2 + 5}
                textAnchor="middle" fontSize="14" fontWeight="800"
                fill={off ? '#94a3b8' : '#ffffff'}
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );

  return (
    <div className="space-y-2">
      <svg
        width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={caption ?? `Population de ${total}, répartie en ${groups.length} catégories`}
        className="select-none w-full h-auto"
      >
        <defs>
          {/* Les exclus sont hachurés : la couleur n'est pas seule à le dire. */}
          <pattern id={`hatch-${uid}`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#cbd5e1" strokeWidth="3" />
          </pattern>
        </defs>

        <Row segs={topSegs} y={0} faded />
        <text x={0} y={barHeight + 13} fontSize="11.5" fontWeight="700" fill="#64748b">
          Population entière — {total}
        </text>

        {restricted && (
          <>
            {/* La flèche dit le geste : on redessine le sous-groupe sur toute la largeur. */}
            <path
              d={`M ${width / 2} ${rowH + 4} l 0 12 m -5 -5 l 5 5 l 5 -5`}
              stroke="#94a3b8" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
            <Row segs={botSegs} y={rowH + 26} faded={false} />
            <text x={0} y={rowH + 26 + barHeight + 13} fontSize="11.5" fontWeight="700" fill="#4338ca">
              {restrictedLabel ?? 'Univers restreint'} — {keptTotal}
            </text>
          </>
        )}
      </svg>

      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {groups.map((g) => {
            const off = dimmed.includes(g.id);
            return (
              <span key={g.id} className={`inline-flex items-center gap-1.5 ${off ? 'text-slate-400' : 'text-slate-600'}`}>
                <span
                  aria-hidden="true"
                  className="inline-block w-3 h-3 rounded-sm shrink-0"
                  style={{ background: off ? '#e2e8f0' : g.color, outline: off ? '1px dashed #cbd5e1' : 'none' }}
                />
                <strong className="tabular-nums">{g.count}</strong> {g.label}
                {off && <span className="italic"> (hors univers)</span>}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
