import React from 'react';
import { ProbabilityTree } from '../../../../../common/stats';
import { pathsTo, totalProbability, pct, ratValue, fr } from './condUtils';

/**
 * TreeExplorer — l'arbre COMME INSTRUMENT, sur lequel on clique un chemin pour
 * l'éclairer et voir son produit.
 *
 * On réutilise `common/stats/ProbabilityTree`, qui sait déjà dessiner deux
 * niveaux, éclairer des chemins et signaler un nœud dont les branches ne
 * somment pas à 1. Ce composant lui apporte ce que la Première demande en
 * plus : une partition à TROIS parts (ProbabilityTree l'accepte : il ne
 * suppose nulle part deux branches), la LECTURE EN EFFECTIFS à côté de chaque
 * chemin, et le total en pied de figure.
 *
 * LES NOMBRES DE LA SYNTHÈSE VIVENT DANS LE DOM, sous la figure : quand trois
 * produits proches doivent être comparés, une ligne de tableau les aligne là où
 * un `<text>` SVG les empilerait au risque de se toucher.
 *
 * ProbabilityTree attend des probabilités NUMÉRIQUES ; le noyau les tient en
 * fractions exactes. La conversion se fait ICI, au dernier moment, une seule
 * fois — et jamais en sens inverse : aucun calcul ne repart d'un flottant.
 */
export default function TreeExplorer({
  tree,                    // sortie de treeFromCross : poids en fractions
  labels = {},             // { id: 'libellé court' } pour les feuilles
  firstLabels = {},        // { id: 'libellé' } pour le premier niveau
  event = null,            // l'issue de second niveau dont on suit les chemins
  litPaths = [],           // ids 'first/second' éclairés
  onPathClick = null,
  levelLabels = null,
  showTotal = false,
  population = null,       // si fourni, la lecture en effectifs
}) {
  const branches = tree.map((b) => ({
    id: b.id,
    label: firstLabels[b.id] ?? b.id,
    p: ratValue(b.p),
    children: b.children.map((c) => ({
      id: c.id,
      label: labels[c.id] ?? c.id,
      p: ratValue(c.p),
    })),
  }));

  const paths = event ? pathsTo(tree, event) : [];
  const total = event && showTotal ? totalProbability(tree, event).total : null;

  return (
    <div className="rounded-2xl border-2 border-emerald-100 bg-white p-4 space-y-3">
      <ProbabilityTree
        branches={branches}
        highlightPaths={litPaths}
        onPathClick={onPathClick}
        showProducts
        levelLabels={levelLabels}
        width={620}
      />

      {event && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Les {paths.length} chemins qui mènent à « {labels[event] ?? event} »
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold">chemin</th>
                  <th className="px-2 py-1 text-right font-semibold">poids × poids</th>
                  <th className="px-2 py-1 text-right font-semibold">produit</th>
                  {population && <th className="px-2 py-1 text-right font-semibold">effectif</th>}
                </tr>
              </thead>
              <tbody>
                {paths.map((p) => {
                  const lit = litPaths.includes(`${p.firstId}/${event}`);
                  return (
                    <tr key={p.firstId} className={`border-t border-slate-100 ${lit ? 'bg-fuchsia-50 font-bold text-fuchsia-900' : 'text-slate-700'}`}>
                      <td className="px-2 py-1 text-left">{firstLabels[p.firstId] ?? p.firstId} → {labels[event] ?? event}</td>
                      <td className="px-2 py-1 text-right font-mono">
                        {fr(ratValue(p.p1), 2)} × {fr(ratValue(p.p2), 2)}
                      </td>
                      <td className="px-2 py-1 text-right font-mono">{fr(ratValue(p.product), 4)}</td>
                      {population && (
                        <td className="px-2 py-1 text-right font-mono">
                          {Math.round(ratValue(p.product) * population)}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {total && (
                  <tr className="border-t-2 border-emerald-300 bg-emerald-50 font-black text-emerald-900">
                    <td className="px-2 py-1.5 text-left">somme des chemins</td>
                    <td className="px-2 py-1.5" />
                    <td className="px-2 py-1.5 text-right font-mono">
                      {fr(ratValue(total), 4)} = {pct(total, 1)}
                    </td>
                    {population && (
                      <td className="px-2 py-1.5 text-right font-mono">
                        {Math.round(ratValue(total) * population)}
                      </td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
