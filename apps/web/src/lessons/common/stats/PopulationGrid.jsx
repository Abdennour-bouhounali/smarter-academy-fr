import React from 'react';

/**
 * PopulationGrid — une population d'individus dessinée comme une grille de
 * pastilles, filtrable par condition.
 *
 * C'est le support de « restreindre la population » : l'élève voit
 * l'ensemble, applique une condition, et la sous-population devient
 * visuellement le nouveau « tout ». Le dénominateur d'une probabilité
 * conditionnelle cesse alors d'être une convention d'écriture : c'est le
 * nombre de pastilles qui restent allumées.
 *
 * Rendu en SVG plutôt qu'en DOM : 10 000 individus doivent tenir sans
 * écrouler la page. Au-delà de `maxDots`, une pastille représente plusieurs
 * individus et le composant le DIT (jamais un mensonge visuel silencieux).
 *
 * @param {{id,count,color,label}[]} groups  les catégories, dans l'ordre de remplissage
 * @param {string[]} [dimmed]  ids des groupes hors de la population de référence
 * @param {number} [columns]
 */
export default function PopulationGrid({
  groups,
  dimmed = [],
  columns = 40,
  maxDots = 2000,
  width = 640,
  legend = true,
  caption,
}) {
  const total = groups.reduce((a, g) => a + g.count, 0);
  if (total === 0) return null;

  const scale = total > maxDots ? Math.ceil(total / maxDots) : 1;
  // Chaque groupe garde au moins une pastille s'il n'est pas vide : un
  // effectif rare (les vrais positifs !) ne doit pas disparaître par arrondi.
  const dots = groups.flatMap((g) => {
    const n = g.count === 0 ? 0 : Math.max(1, Math.round(g.count / scale));
    return Array.from({ length: n }, () => g);
  });

  const cols = columns;
  const rows = Math.ceil(dots.length / cols);
  const cell = width / cols;
  const r = Math.max(1.2, cell / 2 - 0.9);
  const height = rows * cell + 4;

  return (
    <div className="space-y-2">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={caption ?? `Population de ${total} individus répartie en ${groups.length} catégories`}
        className="select-none">
        {dots.map((g, i) => {
          const cx = (i % cols) * cell + cell / 2;
          const cy = Math.floor(i / cols) * cell + cell / 2 + 2;
          const off = dimmed.includes(g.id);
          return <circle key={i} cx={cx} cy={cy} r={r} fill={g.color} opacity={off ? 0.13 : 1} />;
        })}
      </svg>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {groups.map((g) => (
            <span key={g.id} className={`inline-flex items-center gap-1.5 ${dimmed.includes(g.id) ? 'text-slate-400' : 'text-slate-700'}`}>
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: g.color, opacity: dimmed.includes(g.id) ? 0.25 : 1 }} />
              <strong className="font-mono">{g.count}</strong> {g.label}
            </span>
          ))}
        </div>
      )}
      {scale > 1 && (
        <p className="text-xs text-slate-400 italic">
          Échelle : 1 pastille ≈ {scale} individus (les effectifs affichés restent les vrais).
        </p>
      )}
    </div>
  );
}
