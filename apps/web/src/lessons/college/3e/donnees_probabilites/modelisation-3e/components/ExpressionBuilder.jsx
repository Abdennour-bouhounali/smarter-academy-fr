import React from 'react';
import MathText from '../../../../../common/components/MathText';

/**
 * ExpressionBuilder — assembler une expression littérale avec des cartes.
 *
 * Activity            toucher des cartes (nombres, variable, + − ×) pour
 *                     écrire la relation ; retirer la dernière ; vérifier.
 * Mathematical objective  traduire une phrase (« 1 € puis 0,15 € par
 *                     minute ») en expression littérale ; comprendre que deux
 *                     ordres d'écriture peuvent désigner la même fonction.
 * Student action      toucher les cartes, « ⌫ », « Vérifier ».
 * Controlled variable la suite de cartes.
 * Mathematical state  `tokens` appartient au module ; l'expression est
 *                     PARSÉE (`parseTokens`) et comparée à la cible sur
 *                     plusieurs valeurs (`sameFunction`) — jamais comparée
 *                     comme une chaîne.
 * Visual consequence  l'expression s'écrit en KaTeX au fil des cartes.
 *
 * SÉCURITÉ D'AFFICHAGE : la bande d'expression est un flux DOM qui passe à
 * la ligne ; longueur bornée par `maxTokens`.
 */
const toTex = (tokens) => tokens.map((t) => (t === '×' ? '\\times ' : t === '−' ? '- ' : /^\d/.test(t) ? t.replace(',', '{,}') : t)).join(' ');

export default function ExpressionBuilder({
  cards,                // ['1', '0,15', 't', '+', '×', …]
  tokens,
  onTap,                // (card) => void
  onBackspace,
  lhs = 'prix',
  maxTokens = 9,
  disabled = false,
}) {
  return (
    <div className="space-y-3" role="group" aria-label="Construire l’expression">
      <div className="min-h-[56px] rounded-xl bg-slate-900 text-white px-3 py-2 flex items-center flex-wrap gap-2" aria-live="polite">
        <span className="font-mono text-sm text-slate-300">{lhs} =</span>
        {tokens.length === 0 ? <span className="text-slate-500 text-sm italic">touche des cartes…</span>
          : <MathText>{`$${toTex(tokens)}$`}</MathText>}
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cartes">
        {cards.map((c, i) => (
          <button key={`${c}${i}`} type="button" disabled={disabled || tokens.length >= maxTokens} onClick={() => onTap?.(c)}
            aria-label={`Carte ${c}`}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-bold text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40
              ${/^[+−×]$/.test(c) ? 'bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500' : 'bg-white border-slate-300 text-slate-800 hover:border-violet-500'}`}
            style={{ touchAction: 'manipulation' }}>
            {c}
          </button>
        ))}
        <button type="button" disabled={disabled || tokens.length === 0} onClick={onBackspace} aria-label="Retirer la dernière carte"
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 border-slate-300 bg-white text-slate-600 font-bold hover:border-rose-400 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ touchAction: 'manipulation' }}>⌫</button>
      </div>
    </div>
  );
}
