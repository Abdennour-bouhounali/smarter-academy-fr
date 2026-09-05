import React from 'react';
import {
  isPrime, treeLeaves, treeComplete, factorPairOptions, formatFactors,
} from './divisibilityUtils';

/**
 * FactorTree — l'arbre des facteurs, tap-first (INTERACTION_PEDAGOGY §24).
 *
 * Activity: couper un nombre en deux facteurs, encore et encore, jusqu'à ce
 *   qu'il ne reste que des nombres premiers.
 * Mathematical objective: la décomposition en produit de facteurs premiers,
 *   et son UNICITÉ (par où qu'on coupe, les feuilles sont les mêmes).
 * Student action: taper une feuille composite (anneau ambre en pointillés)
 *   puis choisir une paire dans la rangée de puces proposée.
 * Controlled variable: le nœud coupé et la paire choisie.
 * Mathematical state: l'arbre `{ value, children }`, possédé par le module ;
 *   les puces viennent de `factorPairOptions(valeur)`, jamais d'une liste
 *   écrite à la main.
 * Visual consequence: la feuille se dédouble ; un premier se verrouille en
 *   émeraude ; une feuille composite garde son anneau ambre — l'arbre REFUSE
 *   de se fermer tant qu'il en reste une.
 * Misconception targeted: #6 (« 2² × 9 × 5 est une décomposition » — 9 n'est
 *   pas premier, donc pas une feuille) et #7 (deux arbres, deux résultats).
 * Feedback: le nombre de feuilles encore à couper est affiché ; la ligne du
 *   bas montre le produit courant des feuilles, qui vaut toujours n.
 * Scaffolding: idiome de puces repris de ProgramStrip (taper une carte →
 *   choisir dans une rangée) ; `revealAll` fige un arbre complet.
 *
 * Composant CONTRÔLÉ : `tree` et `openPath` appartiennent au module.
 * Nœuds interactifs : ≤ 8 feuilles + ≤ 6 puces de paire.
 */

const CELL = 'inline-flex items-center justify-center rounded-xl border-2 font-mono font-extrabold min-w-[52px] min-h-[48px] px-2.5';

function Node({ node, path, openPath, onOpen, onSplit, frozen }) {
  const leaf = !node.children;
  const prime = isPrime(node.value);
  const isOpen = openPath === path;

  if (!leaf) {
    return (
      <div className="flex flex-col items-center">
        <div className={`${CELL} bg-slate-100 border-slate-300 text-slate-700`} aria-label={`Nœud ${node.value}, déjà coupé`}>
          {node.value}
        </div>
        {/* Les deux branches */}
        <svg width="120" height="26" viewBox="0 0 120 26" aria-hidden="true" className="my-0.5">
          <line x1="60" y1="0" x2="16" y2="26" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="60" y1="0" x2="104" y2="26" stroke="#94a3b8" strokeWidth="2.5" />
        </svg>
        <div className="flex gap-3 sm:gap-5 items-start">
          {node.children.map((child, i) => (
            <Node
              key={i}
              node={child}
              path={path + i}
              openPath={openPath}
              onOpen={onOpen}
              onSplit={onSplit}
              frozen={frozen}
            />
          ))}
        </div>
      </div>
    );
  }

  if (prime) {
    return (
      <div
        className={`${CELL} bg-emerald-100 border-emerald-500 text-emerald-800`}
        aria-label={`Feuille ${node.value}, nombre premier, terminée`}
      >
        {node.value}
      </div>
    );
  }

  const options = factorPairOptions(node.value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        disabled={frozen}
        onClick={() => onOpen?.(isOpen ? null : path)}
        aria-expanded={isOpen}
        aria-label={`Feuille ${node.value}, pas encore premier — la couper`}
        className={`${CELL} border-dashed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isOpen
            ? 'bg-amber-200 border-amber-600 text-amber-900'
            : 'bg-amber-50 border-amber-400 text-amber-800 hover:border-amber-600'
        }`}
      >
        {node.value}
      </button>
      {isOpen && !frozen && (
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[220px]" role="group" aria-label={`Couper ${node.value} en…`}>
          {options.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              type="button"
              onClick={() => onSplit?.(path, [a, b])}
              className="min-h-[44px] px-2.5 rounded-lg border-2 border-slate-300 bg-white font-mono text-xs font-bold text-slate-700 hover:border-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {a} × {b}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FactorTree({
  tree,
  openPath = null,
  onOpen,
  onSplit,
  frozen = false,
  caption,
  showProduct = true,
}) {
  const leaves = treeLeaves(tree);
  const remaining = leaves.filter((l) => !isPrime(l.value));
  const complete = treeComplete(tree);
  const sortedLeaves = leaves.map((l) => l.value).sort((a, b) => a - b);

  return (
    <div className="space-y-2" role="group" aria-label={caption ?? `Arbre des facteurs de ${tree.value}`}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 overflow-x-auto">
        <div className="flex justify-center min-w-min py-1">
          <Node node={tree} path="" openPath={openPath} onOpen={onOpen} onSplit={onSplit} frozen={frozen} />
        </div>
      </div>

      {showProduct && (
        <div
          className={`rounded-xl border-2 px-3 py-2 text-center font-mono text-sm ${
            complete ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {tree.value} ={' '}
          <strong>
            {complete
              ? formatFactors(
                  sortedLeaves.reduce((acc, p) => {
                    const last = acc[acc.length - 1];
                    if (last && last.p === p) last.e += 1;
                    else acc.push({ p, e: 1 });
                    return acc;
                  }, []),
                )
              : sortedLeaves.join(' × ')}
          </strong>
          {!complete && (
            <span className="block text-xs text-amber-700 mt-1">
              {remaining.length} feuille{remaining.length > 1 ? 's' : ''} encore à couper (
              {remaining.map((l) => l.value).join(', ')}) — l’arbre n’est pas fini.
            </span>
          )}
        </div>
      )}

      {caption && <p className="text-xs text-slate-500 text-center">{caption}</p>}
    </div>
  );
}
