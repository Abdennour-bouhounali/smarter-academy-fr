import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * EqualShareBoard — manipulation de PARTAGE ÉQUITABLE réutilisable (voir
 * AI_LESSON_CONTRACT.md § Manipulation-first) : des destinataires attendent,
 * une réserve d'objets est disponible, et l'élève distribue réellement.
 *
 * La contrainte mathématique vit DANS la situation, pas dans un énoncé :
 *  - les visages réagissent à l'équité de la distribution en cours ;
 *  - un destinataire lésé est visiblement triste, un avantagé est gêné ;
 *  - la situation n'est résolue que quand la réserve est vide ET le partage
 *    équitable — le résultat numérique ÉMERGE de l'action.
 *
 * Mathématiquement réel : le composant maintient le vrai état (qui possède
 * combien, ce qui reste) — jamais une simple vérification de « la bonne
 * réponse attendue ». Les erreurs sont permises : l'élève peut distribuer
 * inéquitablement jusqu'au bout, constater, reprendre des objets et corriger.
 *
 * Interactions (tactiles ≥ 44px, boutons clavier-accessibles) :
 *  - toucher un destinataire → lui donner 1 objet de la réserve ;
 *  - « Reprendre » sous un destinataire → lui retirer 1 objet.
 *
 * @param {number} totalItems       objets dans la réserve au départ
 * @param {number} recipients       nombre de destinataires
 * @param {string[]} [recipientNames]
 * @param {ReactNode} [itemContent] rendu d'UN objet (emoji par défaut)
 * @param {string} [itemLabel]      nom d'un objet, pour l'accessibilité et les messages
 * @param {string} [itemLabelPlural]
 * @param {boolean} [disabled]      fige le plateau (après validation)
 * @param {(state: {counts:number[], remaining:number, isComplete:boolean, isEqual:boolean, isSolved:boolean}) => void} [onStateChange]
 */
export default function EqualShareBoard({
  totalItems,
  recipients,
  recipientNames,
  itemContent = '🍫',
  itemLabel = 'part',
  itemLabelPlural,
  disabled = false,
  onStateChange,
}) {
  const [counts, setCounts] = useState(() => Array.from({ length: recipients }, () => 0));

  const plural = itemLabelPlural || `${itemLabel}s`;
  const names = recipientNames || Array.from({ length: recipients }, (_, i) => `Enfant ${i + 1}`);
  const given = counts.reduce((a, b) => a + b, 0);
  const remaining = totalItems - given;
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const isEqual = max === min;
  const isComplete = remaining === 0;
  const isSolved = isComplete && isEqual;

  const update = (next) => {
    setCounts(next);
    if (onStateChange) {
      const g = next.reduce((a, b) => a + b, 0);
      const r = totalItems - g;
      const mx = Math.max(...next);
      const mn = Math.min(...next);
      onStateChange({
        counts: next,
        remaining: r,
        isComplete: r === 0,
        isEqual: mx === mn,
        isSolved: r === 0 && mx === mn,
      });
    }
  };

  const give = (i) => {
    if (disabled || remaining <= 0) return;
    update(counts.map((c, j) => (j === i ? c + 1 : c)));
  };

  const takeBack = (i) => {
    if (disabled || counts[i] <= 0) return;
    update(counts.map((c, j) => (j === i ? c - 1 : c)));
  };

  // Le visage raconte l'état mathématique : lésé → triste, avantagé alors que
  // d'autres ont moins → gêné, partage résolu → fête.
  const faceFor = (count) => {
    if (isSolved) return '🥳';
    if (!isEqual && count === min) return '😢';
    if (!isEqual && count === max) return '😬';
    return remaining > 0 ? '🤗' : '🙂';
  };

  const statusLine = isSolved
    ? `🎉 Partage équitable ! Chacun a ${counts[0]} ${counts[0] > 1 ? plural : itemLabel}.`
    : isComplete
    ? 'Regarde les enfants : est-ce que chacun a reçu la même quantité ? Qui en a plus ? Qui en a moins ? Tu peux reprendre des ' + plural + ' et corriger.'
    : `Il reste ${remaining} ${remaining > 1 ? plural : itemLabel} à distribuer — touche un enfant pour donner.`;

  return (
    <div className="space-y-3">
      {/* Réserve */}
      <div
        className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3 min-h-[64px]"
        role="group"
        aria-label={`Réserve : ${remaining} ${plural} sur ${totalItems}`}
      >
        <div className="text-[11px] font-mono font-bold uppercase tracking-wide text-amber-700 mb-1.5">
          Réserve — {remaining} / {totalItems}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: remaining }, (_, i) => (
            <motion.span
              key={i}
              layout
              className="inline-flex items-center justify-center text-xl min-w-[1.75rem]"
              aria-hidden="true"
            >
              {itemContent}
            </motion.span>
          ))}
          {remaining === 0 && <span className="text-xs text-amber-600 italic">réserve vide</span>}
        </div>
      </div>

      {/* Destinataires */}
      <div className={`grid gap-2 ${recipients <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {counts.map((count, i) => (
          <div key={i} className="space-y-1">
            <button
              type="button"
              onClick={() => give(i)}
              disabled={disabled || remaining <= 0}
              aria-label={`Donner 1 ${itemLabel} à ${names[i]} (a ${count})`}
              className={`w-full min-h-[96px] rounded-2xl border-2 p-2.5 text-center transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${isSolved
                  ? 'border-emerald-300 bg-emerald-50'
                  : !isEqual && count === min
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 bg-white'}
                ${disabled || remaining <= 0 ? 'cursor-default' : 'hover:border-blue-400 hover:shadow-sm active:scale-[0.98] cursor-pointer'}`}
            >
              <div className="text-2xl" aria-hidden="true">{faceFor(count)}</div>
              <div className="font-space font-bold text-xs text-slate-700">{names[i]}</div>
              <div className="flex flex-wrap justify-center gap-0.5 min-h-[1.5rem] mt-1" aria-hidden="true">
                {Array.from({ length: count }, (_, k) => (
                  <span key={k} className="text-sm">{itemContent}</span>
                ))}
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-500 tabular-nums">{count}</div>
            </button>
            {count > 0 && !disabled && (
              <button
                type="button"
                onClick={() => takeBack(i)}
                aria-label={`Reprendre 1 ${itemLabel} à ${names[i]}`}
                className="w-full min-h-[36px] rounded-lg border border-slate-200 bg-white text-[11px] font-mono font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ↩️ Reprendre
              </button>
            )}
          </div>
        ))}
      </div>

      {/* L'état de la situation, dit avec des mots (jamais la couleur seule) */}
      <p role="status" className={`text-xs leading-relaxed rounded-xl px-3 py-2 border
        ${isSolved ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : isComplete ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
      >
        {statusLine}
      </p>
    </div>
  );
}
