import React from 'react';
import MathText from '../../../../../common/components/MathText';
import {
  isLeaf, operatorNodes, reducible, symbolOf, nameOf, renderPlain,
} from './expressionUtils';
import { formatFrac } from './rationalUtils';

/**
 * ExpressionReducer — EXÉCUTER une expression, opérateur par opérateur.
 *
 * Activity: l'expression est vivante. L'élève tape l'opérateur qu'il veut
 *   effectuer ; le sous-calcul se replie sur sa valeur, et l'expression
 *   restante se réaffiche.
 * Mathematical objective: les priorités ne sont pas un ordre de LECTURE mais
 *   un ordre d'EXÉCUTION — et changer cet ordre change le nombre obtenu.
 * Student action: taper un opérateur (le symbole EST le bouton).
 * Controlled variable: l'arbre courant — il appartient au module.
 * Visual consequence: le sous-arbre disparaît, remplacé par son résultat ; un
 *   opérateur interdit reste en place et dit POURQUOI il ne peut pas partir.
 * Expected observation: « le × devait partir en premier, sinon je n'obtiens
 *   pas le même nombre ».
 * Misconception targeted: calculer de gauche à droite sans regarder les
 *   priorités ; croire qu'une parenthèse est décorative.
 * Feedback: la raison du refus vient de `refusalReason` (expressionUtils),
 *   donc de la règle elle-même — jamais d'un texte écrit à la main.
 * Formalization: la chaîne de calcul n'est pas rédigée quelque part : elle EST
 *   l'historique des réductions de l'élève.
 *
 * Composant CONTRÔLÉ et MUET : il n'énonce aucune règle, il l'applique.
 *
 * @param {object} tree                     l'arbre courant
 * @param {(nodeId:string)=>void} onPick    l'élève tape cet opérateur
 * @param {string[]} [refused]              ids refusés (restent signalés)
 * @param {string} [reason]                 la raison du dernier refus
 * @param {boolean} [free=false]            autorise TOUT ordre (étape « et si… »)
 * @param {boolean} [done=false]
 */
export default function ExpressionReducer({
  tree, onPick, refused = [], reason = '', free = false, done = false,
}) {
  const allowed = free ? operatorNodes(tree).filter((n) => isLeaf(n.left) && isLeaf(n.right)).map((n) => n.id) : reducible(tree);
  const finished = isLeaf(tree);

  return (
    <div className="space-y-2" data-expr={renderPlain(tree)} data-expr-done={finished ? 'true' : 'false'}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex items-center justify-center gap-1 flex-wrap text-lg">
          <Node node={tree} onPick={onPick} allowed={allowed} refused={refused} done={done || finished} />
        </div>
      </div>
      {reason && !finished && (
        <p className="text-sm font-semibold text-rose-800 bg-rose-50 border-2 border-rose-200 rounded-xl px-3 py-2">
          {reason}
        </p>
      )}
      {!finished && !reason && (
        <p className="text-center text-xs text-slate-500">
          Tape l’opération que tu as le droit d’effectuer maintenant.
        </p>
      )}
    </div>
  );
}

/** Rend l'arbre : les nombres en KaTeX, les opérateurs en BOUTONS. */
function Node({ node, onPick, allowed, refused, done, inParen = false }) {
  if (isLeaf(node)) {
    return (
      <span className="px-1.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
        <MathText>{`$${formatFrac(node.rat)}$`}</MathText>
      </span>
    );
  }

  const open = node.paren && !inParen;
  const ready = allowed.includes(node.id);
  const wasRefused = refused.includes(node.id);

  const body = (
    <>
      <Node node={node.left} onPick={onPick} allowed={allowed} refused={refused} done={done} inParen={inParen || node.paren} />
      <button
        type="button"
        data-expr-op={node.id}
        disabled={done}
        aria-label={`${nameOf(node.op)} : ${renderPlain(node.left)} ${symbolOf(node.op)} ${renderPlain(node.right)}`}
        onClick={() => onPick(node.id)}
        className={`mx-1 min-w-[44px] min-h-[44px] px-2 rounded-xl border-2 text-xl font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 ${
          wasRefused
            ? 'border-rose-300 bg-rose-50 text-rose-500'
            : ready
              ? 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
        }`}
      >
        {symbolOf(node.op)}
      </button>
      <Node node={node.right} onPick={onPick} allowed={allowed} refused={refused} done={done} inParen={inParen || node.paren} />
    </>
  );

  if (!open) return body;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border-2 border-violet-300 bg-violet-50/60">
      <span className="text-violet-500 font-bold text-xl">(</span>
      {body}
      <span className="text-violet-500 font-bold text-xl">)</span>
    </span>
  );
}
