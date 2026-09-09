import React from 'react';
import { Undo2, RotateCcw } from 'lucide-react';
import {
  BalanceScale, texEquation, eqAddBoth, eqSubBoth, eqScaleBoth,
  equation, expr, exprSub, rat, solve, isSolvedForm, ratIsInt,
} from '../../../../../common/algebra4e';
import MathText from '../../../../../common/components/MathText';

/**
 * BalanceWorkbench — l'établi de la balance : l'équation, les gestes
 * autorisés, et l'historique.
 *
 * Il assemble le composant partagé `BalanceScale` (la figure) et la barre
 * d'outils propre à cette leçon (les gestes). La séparation est volontaire :
 * la figure sert aussi ailleurs, les gestes appartiennent à la pédagogie des
 * équations.
 *
 * ÉTAT ET HISTORIQUE. L'établi est CONTRÔLÉ : il reçoit l'historique complet
 * et signale un geste, il ne détient rien. C'est ce qui rend « Annuler » et
 * « Recommencer » exacts — on revient à un état PASSÉ, on ne recalcule pas un
 * inverse — et ce qui immunise la manipulation aux remontages de React
 * (brief §6, §7).
 *
 * LES GESTES ILLÉGAUX SONT POSSIBLES, ET C'EST LE POINT. Un module peut
 * ajouter `gestesTricheurs()` à sa liste de gestes : ceux-là n'agissent que
 * sur UN plateau, et la balance bascule aussitôt. Interdire ces boutons
 * priverait la leçon de sa démonstration — on n'apprend pas la règle en étant
 * empêché de la violer, on l'apprend en voyant ce qu'elle empêche.
 *
 * SÉCURITÉ VISUELLE (§17bis) : déléguée à `BalanceScale`, dont la géométrie
 * est balayée par `balanceGeometry.test.js` sur toute la plage d'écarts.
 */

/** Les gestes légaux proposés pour une équation donnée. */
export const gestesLegaux = (eq, { retraits = [], ajouts = [], divisions = [] } = {}) => {
  const out = [];
  for (const n of retraits) out.push({ id: `sub-${n}`, label: `− ${n}`, aria: `Retirer ${n} des deux côtés`, apply: (e) => eqSubBoth(e, expr(0, n)) });
  for (const n of ajouts) out.push({ id: `add-${n}`, label: `+ ${n}`, aria: `Ajouter ${n} des deux côtés`, apply: (e) => eqAddBoth(e, expr(0, n)) });
  for (const n of divisions) out.push({ id: `div-${n}`, label: `÷ ${n}`, aria: `Diviser les deux côtés par ${n}`, apply: (e) => eqScaleBoth(e, rat(1, n)) });
  return out;
};

/**
 * Les gestes ILLÉGAUX — un seul plateau. Ils existent pour être essayés.
 *
 * Ils passent par les mêmes primitives du noyau (`exprSub`, `equation`) que
 * les gestes légaux : la différence n'est pas dans la façon de calculer, elle
 * est dans le fait de n'appliquer l'opération qu'à UN membre. C'est
 * exactement l'erreur qu'on veut rendre visible.
 */
export const gestesTricheurs = ({ retraits = [] } = {}) =>
  retraits.map((n) => ({
    id: `cheat-${n}`,
    label: `− ${n} à gauche`,
    aria: `Retirer ${n} du membre de gauche seulement`,
    tricheur: true,
    apply: (e) => equation(exprSub(e.left, expr(0, n)), e.right),
  }));

export default function BalanceWorkbench({
  historique,          // [equation, …] — l'état, détenu par le module
  onGeste,             // (equationSuivante, geste) => void
  onAnnuler,
  onRecommencer,
  gestes = [],         // [{id, label, aria, apply, tricheur?}]
  probe,               // valeur d'essai servant à peser (souvent la solution)
  caption,
  disabled = false,
}) {
  const eq = historique[historique.length - 1];
  const resolu = isSolvedForm(eq);
  const sol = solve(eq);

  return (
    <div className="space-y-3">
      <BalanceScale
        equation={eq}
        probe={probe}
        leftLabel={<MathText>{`$${texEquation(eq).split(' = ')[0]}$`}</MathText>}
        rightLabel={<MathText>{`$${texEquation(eq).split(' = ')[1]}$`}</MathText>}
        caption={caption}
      />

      {/* L'historique : l'élève voit CE QU'IL A FAIT, pas seulement où il en
          est — « qu'est-ce que je viens de faire ? » (brief §7). */}
      {historique.length > 1 && (
        <ol className="space-y-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-600">
          {historique.map((e, i) => (
            <li key={i} className={i === historique.length - 1 ? 'font-bold text-slate-800' : ''}>
              <MathText>{`$${texEquation(e)}$`}</MathText>
            </li>
          ))}
        </ol>
      )}

      {!resolu && !disabled && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Gestes disponibles">
          {gestes.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-label={g.aria}
              onClick={() => {
                try {
                  onGeste?.(g.apply(eq), g);
                } catch {
                  /* eqScaleBoth refuse le facteur nul — le bouton reste sans effet. */
                }
              }}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 text-sm font-bold tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                g.tricheur
                  ? 'border-dashed border-rose-300 bg-rose-50 text-rose-600 hover:border-rose-500'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onAnnuler}
          disabled={historique.length <= 1}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
          Annuler
        </button>
        <button
          type="button"
          onClick={onRecommencer}
          disabled={historique.length <= 1}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Recommencer
        </button>
      </div>

      {resolu && sol.kind === 'unique' && (
        <p className="text-center text-base font-black text-emerald-700">
          <MathText>
            {`$x = ${ratIsInt(sol.value) ? sol.value.n : `\\dfrac{${sol.value.n}}{${sol.value.d}}`}$`}
          </MathText>
        </p>
      )}
    </div>
  );
}
