import React from 'react';
import { X } from 'lucide-react';
import MathText from '../../../../../common/components/MathText';
import { foldCards, evalLin, formatLin, formatDec, plainMath } from './problemUtils';

/**
 * EquationBuilder — « Le Traducteur », LA manipulation signature de la leçon.
 *
 * Activity: assembler une équation carte par carte, en deux membres, à partir
 *   d'un énoncé dont chaque fragment est la source d'une carte.
 * Mathematical objective: faire de « traduire en équation » une CONSTRUCTION
 *   dont chaque morceau pointe vers un morceau du texte — l'équation dit deux
 *   fois la même quantité, à gauche et à droite.
 * Student action: taper une carte quantité (x, x + 4, 24, 5n…) ou une carte
 *   opération (+, ×) pour l'ajouter au membre actif ; ✕ pour retirer ; taper
 *   une puce de sonde « x = 5 » pour évaluer les deux membres.
 * Controlled variable: la suite de jetons de chaque membre.
 * Mathematical state: `{ left: Token[], right: Token[] }`, replié par
 *   `foldCards` en deux Lin. Tout le reste (le rendu MathText, la sonde, la
 *   couleur des fragments) en est DÉRIVÉ.
 * Visual consequence: le fragment d'énoncé d'où vient la carte s'allume ; les
 *   deux membres se réécrivent en LaTeX ; la sonde affiche « pour x = 5 :
 *   gauche 23, droite 25 — pas encore égal ».
 * Expected observation: une équation n'est vraie que pour certaines valeurs ;
 *   quand les deux membres coïncident, on a trouvé la solution — et surtout,
 *   une même histoire admet PLUSIEURS équations correctes.
 * Misconception targeted: le nombre placé du mauvais côté (3x = 25 + 7), et
 *   « x = 8 » écrit comme si c'était la traduction.
 * Feedback: la sonde EST le retour avant validation (deux nombres, coïncident
 *   -ils ?). Le module rend les Feedback ; le composant ne juge pas.
 * Formalization: « une équation est une phrase » — nommée après le geste.
 * Scaffolding: ↩ retire la dernière carte, ✕ retire une carte précise, la
 *   sonde donne des valeurs toutes faites ; le module révèle après 3 essais.
 * Transfer: le même builder sert au module 7 et, figé, à la synthèse du boss.
 *
 * Composant CONTRÔLÉ : `left`, `right`, `active`, `probed` appartiennent au
 * module ; aucune logique de progression ici. `frozen` le rend non
 * interactif (synthèse du boss).
 *
 * Nœuds interactifs : ≤ 10 cartes de palette + 2 boutons de membre + ≤ 8
 * boutons ✕ + ≤ 4 puces de sonde + ↩ ≈ 25 au pire (plafond §10 : 52).
 *
 * @param {{id, label, aria, kind:'term'|'op', value?:Lin, op?:string, fragmentId?:string, tone?:string}[]} cards
 * @param {Token[]} left @param {Token[]} right   (Token = une carte posée)
 * @param {'left'|'right'} active
 * @param {(side)=>void} onSetActive
 * @param {(card)=>void} onTap        ajoute la carte au membre actif
 * @param {(side, i)=>void} onRemove
 * @param {()=>void} [onCommit]
 * @param {number[]} [probeXs] @param {Set<number>} [probed] @param {(x)=>void} [onProbe]
 * @param {number|null} [probeX]      dernière valeur sondée
 * @param {string} [variable='x']
 * @param {boolean} [frozen] @param {boolean} [disabled]
 */
const CARD_TONE = {
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-500',
  indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900 hover:border-indigo-500',
  amber: 'border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-500',
  rose: 'border-rose-300 bg-rose-50 text-rose-900 hover:border-rose-500',
  slate: 'border-slate-300 bg-slate-50 text-slate-800 hover:border-slate-500',
};

const MAX_PER_SIDE = 7;

export default function EquationBuilder({
  cards,
  left = [],
  right = [],
  active = 'left',
  onSetActive,
  onTap,
  onRemove,
  onUndo,
  onCommit,
  commitLabel = 'Valider mon équation',
  probeXs = [],
  probed,
  onProbe,
  probeX = null,
  variable = 'x',
  frozen = false,
  disabled = false,
  committed = false,
}) {
  const locked = frozen || disabled;
  const leftLin = foldCards(left);
  const rightLin = foldCards(right);
  const complete = !!leftLin && !!rightLin;

  const sideLatex = (tokens, folded) => {
    if (tokens.length === 0) return '\\square';
    if (!folded) return tokens.map((t) => (t.kind === 'op' ? t.op : `(${formatLin(t.value, variable)})`)).join(' ');
    return formatLin(folded, variable);
  };

  const probeLeft = probeX !== null && leftLin ? evalLin(leftLin, probeX) : null;
  const probeRight = probeX !== null && rightLin ? evalLin(rightLin, probeX) : null;
  const probeEqual = probeLeft !== null && probeLeft === probeRight;

  return (
    <div className="space-y-3" role="group" aria-label="Le Traducteur : construire l’équation">
      {/* ── Les deux membres ─────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2.5">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          {['left', 'right'].map((side, si) => {
            const tokens = side === 'left' ? left : right;
            const folded = side === 'left' ? leftLin : rightLin;
            const isActive = !locked && active === side;
            return (
              <React.Fragment key={side}>
                {si === 1 && (
                  <div className="text-2xl font-extrabold text-slate-400 font-mono px-1" aria-hidden="true">=</div>
                )}
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onSetActive?.(side)}
                  aria-pressed={isActive}
                  aria-label={`Membre de ${side === 'left' ? 'gauche' : 'droite'} : ${
                    folded ? plainMath(formatLin(folded, variable)) : 'vide ou incomplet'
                  }. Toucher pour y ajouter les cartes.`}
                  className={`min-h-[68px] w-full rounded-xl border-2 border-dashed px-2 py-3 text-center transition-colors disabled:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-200'
                      : 'border-slate-300 bg-slate-50/50 hover:border-slate-400'
                  }`}
                >
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
                    {side === 'left' ? 'Membre de gauche' : 'Membre de droite'}
                  </span>
                  <span className="block text-base sm:text-lg text-slate-900">
                    <MathText>{`$${sideLatex(tokens, folded)}$`}</MathText>
                  </span>
                  {tokens.length > 0 && !folded && (
                    <span className="block text-[10px] text-rose-600 mt-0.5">écriture incomplète</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Les cartes posées, retirables une par une */}
        {!frozen && (left.length > 0 || right.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
            {['left', 'right'].map((side) =>
              (side === 'left' ? left : right).map((t, i) => (
                <button
                  key={`${side}-${i}-${t.id}`}
                  type="button"
                  disabled={locked || committed}
                  onClick={() => onRemove?.(side, i)}
                  aria-label={`Retirer ${t.aria || t.label} du membre de ${side === 'left' ? 'gauche' : 'droite'}`}
                  className="min-h-[44px] inline-flex items-center gap-1 px-2.5 rounded-lg border-2 border-slate-200 bg-white text-xs font-mono font-bold text-slate-600 hover:border-rose-400 hover:text-rose-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <span className="text-[10px] text-slate-400">{side === 'left' ? 'G' : 'D'}</span>
                  {t.label}
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              )),
            )}
            {onUndo && (
              <button
                type="button"
                disabled={locked || committed || (left.length === 0 && right.length === 0)}
                onClick={onUndo}
                aria-label="Retirer la dernière carte posée"
                className="min-h-[44px] px-3 rounded-lg border-2 border-slate-300 bg-white text-xs font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ↩ Annuler
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── La palette ───────────────────────────────────────────── */}
      {!frozen && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
              Cartes disponibles ({cards.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Touche une carte : elle rejoint le membre de {active === 'left' ? 'gauche' : 'droite'}
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Cartes de quantités et d’opérations">
            {cards.map((c) => {
              const full = (active === 'left' ? left : right).length >= MAX_PER_SIDE;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={locked || committed || full}
                  onClick={() => onTap?.(c)}
                  aria-label={`Ajouter ${c.aria || c.label} au membre de ${active === 'left' ? 'gauche' : 'droite'}`}
                  className={`min-h-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    CARD_TONE[c.tone] || CARD_TONE.slate
                  }`}
                >
                  {c.latex ? <MathText>{`$${c.latex}$`}</MathText> : c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── La sonde : tester une valeur SOI-MÊME ────────────────── */}
      {!frozen && probeXs.length > 0 && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-3 space-y-2">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-500">
            Sonde — teste ton équation
          </p>
          <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Valeurs à tester">
            {probeXs.map((x) => (
              <button
                key={x}
                type="button"
                disabled={locked || !complete}
                onClick={() => onProbe?.(x)}
                aria-pressed={probeX === x}
                aria-label={`Tester ${variable} égale ${formatDec(x)}`}
                className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono text-sm font-bold transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  probeX === x
                    ? 'bg-indigo-600 border-indigo-700 text-white'
                    : probed?.has(x)
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                    : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-500'
                }`}
              >
                {variable} = {formatDec(x)}
              </button>
            ))}
          </div>
          <p className="text-sm font-mono text-slate-700" aria-live="polite">
            {!complete
              ? 'Complète les deux membres pour pouvoir tester.'
              : probeX === null
              ? 'Touche une valeur : les deux membres deviennent deux nombres.'
              : (
                <>
                  Pour {variable} = <strong>{formatDec(probeX)}</strong> : gauche{' '}
                  <strong className="text-slate-900">{formatDec(probeLeft)}</strong>, droite{' '}
                  <strong className="text-slate-900">{formatDec(probeRight)}</strong>
                  {' — '}
                  <span className={probeEqual ? 'text-emerald-700 font-bold' : 'text-rose-700'}>
                    {probeEqual ? 'les deux membres coïncident' : 'pas encore égal'}
                  </span>
                </>
              )}
          </p>
        </div>
      )}

      {/* ── Validation ───────────────────────────────────────────── */}
      {!frozen && onCommit && !committed && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={locked || !complete}
            onClick={onCommit}
            className="min-h-[48px] px-5 rounded-xl border-2 border-emerald-700 bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:bg-slate-300 disabled:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {commitLabel}
          </button>
        </div>
      )}

      <p className="sr-only">
        Équation en cours : {leftLin ? plainMath(formatLin(leftLin, variable)) : 'membre gauche incomplet'} égale{' '}
        {rightLin ? plainMath(formatLin(rightLin, variable)) : 'membre droit incomplet'}.
      </p>
    </div>
  );
}
