import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { formatDec, applyRule, agree } from './propUtils';
import { RECETTE, quantityFor } from './situationsData';

/**
 * RecipeLab — la recette qui grandit : le laboratoire d'entrée de la leçon.
 *
 * Activity            régler le nombre de convives (1 à 12) et regarder les
 *                     quantités de chaque ingrédient s'allonger ; noter des
 *                     couples dans le tableau.
 * Mathematical objective  faire ÉPROUVER l'invariance multiplicative : quand
 *                     le nombre de personnes est multiplié par 2, par 3,5,
 *                     chaque quantité l'est aussi — et « quantité ÷ personnes »
 *                     ne bouge pas. Le temps de cuisson, lui, ne bouge PAS avec
 *                     les convives : ce n'est pas une grandeur proportionnelle.
 * Student action      glisser ou ± sur les personnes ; toucher « Noter ».
 * Controlled variable n, le nombre de personnes (entier).
 * Mathematical state  { n } appartient au module. Chaque quantité vient de
 *                     `quantityFor(ing, n)` = applyRule(rule, n) — jamais
 *                     saisie : les barres, les nombres et le tableau ne
 *                     peuvent pas se contredire.
 * Visual consequence  une barre par ingrédient, dont la longueur est la
 *                     fraction de la quantité pour 12 personnes ; le nombre
 *                     s'écrit dans sa colonne.
 * Expected observation « quand je double les personnes, TOUT double ; pour 7,
 *                     ce n'est pas un multiple de 2 — et pourtant ça marche ».
 * Misconception targeted  additif (+150 g par personne au lieu de ×) ; croire
 *                     que 7 personnes est « impossible » ; croire que le temps
 *                     de cuisson suit.
 * Feedback            la lecture « n personnes → q » par ingrédient ; en mode
 *                     `showRatio`, la colonne « ÷ personnes » qui reste fixe.
 *
 * SÉCURITÉ D'AFFICHAGE — tout est dans le DOM : la barre est un pourcentage
 * de sa piste (≤ 100 % par construction : quantité(n) ≤ quantité(12)) ; les
 * nombres ont leur colonne à largeur réservée ; aucun texte SVG.
 */
export default function RecipeLab({
  people,
  onPeopleChange,
  recorded = new Set(),
  onRecord,
  showFixed = false,      // affiche le temps de cuisson, qui ne bouge pas
  showRatio = false,      // affiche « quantité ÷ personnes » par ingrédient
  highlightId = null,     // ingrédient mis en avant (ex. farine)
  disabled = false,
  caption,
}) {
  const reduce = useReducedMotion();
  const max = RECETTE.maxPeople;
  const already = recorded.has(people);
  const reading = `${people} ${agree(people, 'personnes')} : ${RECETTE.ingredients.map((i) => `${formatDec(quantityFor(i, people))} ${i.unit} de ${i.label}`.replace('  ', ' ')).join(', ')}`;

  const row = (ing, qty, qtyMax, fixed = false) => {
    const pct = fixed ? 100 : (qty / qtyMax) * 100;
    const hi = highlightId === ing.id;
    const ratio = people > 0 ? applyRule(ing.rule, people) / people : null;
    return (
      <div key={ing.id} className={`grid items-center gap-2 rounded-xl px-1.5 py-1 ${hi ? 'bg-indigo-50' : ''}`}
        style={{ gridTemplateColumns: `1.5rem 4.5rem minmax(0,1fr) 5.5rem ${showRatio ? '5.5rem' : '0px'}` }}>
        <span aria-hidden="true" className="text-lg leading-none">{ing.emoji}</span>
        <span className="text-xs font-semibold text-slate-600 truncate">{ing.label}</span>
        <div className="relative h-6 rounded-lg bg-white border border-slate-200 overflow-hidden">
          <motion.div className={`absolute inset-y-0 left-0 rounded-lg ${fixed ? 'bg-slate-400' : hi ? 'bg-indigo-600' : 'bg-emerald-500'}`}
            initial={false} animate={{ width: `${pct}%` }} transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }} />
        </div>
        <span className="font-mono font-bold text-slate-800 tabular-nums text-sm text-right whitespace-nowrap">
          {formatDec(qty)}{ing.unit ? ` ${ing.unit}` : ''}
        </span>
        {showRatio && (
          <span className="font-mono text-xs font-semibold text-indigo-700 tabular-nums text-right whitespace-nowrap">
            {fixed || ratio === null ? '—' : `÷ ${people} = ${formatDec(ratio)}`}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-3 sm:p-4 space-y-3" role="group" aria-label={`Recette pour ${people} ${agree(people, 'personnes')}`}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      <ParamSlider label="Convives" ariaLabel="le nombre de personnes" value={people} onChange={(v) => !disabled && onPeopleChange?.(v)}
        min={1} max={max} step={1} tone="emerald" disabled={disabled} />
      <div className="rounded-2xl bg-white border-2 border-slate-200 p-2 space-y-1" aria-live="polite">
        <p className="sr-only">{reading}</p>
        <div className="grid gap-2 px-1.5 text-[10px] font-mono uppercase tracking-wide text-slate-400"
          style={{ gridTemplateColumns: `1.5rem 4.5rem minmax(0,1fr) 5.5rem ${showRatio ? '5.5rem' : '0px'}` }}>
          <span /><span>ingrédient</span><span>pour {people} {agree(people, 'personnes')}</span><span className="text-right">quantité</span>
          {showRatio && <span className="text-right">÷ personnes</span>}
        </div>
        {RECETTE.ingredients.map((ing) => row(ing, quantityFor(ing, people), quantityFor(ing, max)))}
        {showFixed && row(RECETTE.fixed, applyRule(RECETTE.fixed.rule, people), applyRule(RECETTE.fixed.rule, max), true)}
      </div>
      {onRecord && (
        <button type="button" onClick={() => !disabled && !already && onRecord(people)} disabled={disabled || already}
          className="w-full min-h-[48px] rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ touchAction: 'manipulation' }}>
          {already ? `${people} ${agree(people, 'personnes')} : déjà dans le tableau` : `Noter ${people} ${agree(people, 'personnes')} dans le tableau`}
        </button>
      )}
    </div>
  );
}
