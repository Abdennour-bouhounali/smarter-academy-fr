import React from 'react';
import { motion } from 'framer-motion';

/**
 * ObjectGroup — une collection d'objets discrets partagée en groupes égaux.
 *
 * C'est le support de « fraction d'une quantité » : contrairement à
 * PartitionShape (une unité continue découpée), ici on partage une
 * COLLECTION de N objets en G groupes égaux, et on peut en sélectionner
 * quelques-uns. Le calcul reste toujours visible :
 *   total ÷ groupes = objets par groupe
 *   objets par groupe × groupes sélectionnés = quantité prise
 *
 * On ne clique jamais un objet isolé : on sélectionne un GROUPE entier,
 * ce qui colle au sens du partage (chaque groupe = une part égale).
 */

const TONE = {
  emerald: { fill: 'bg-emerald-500', soft: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', ring: 'ring-emerald-400' },
  sky: { fill: 'bg-sky-500', soft: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700', ring: 'ring-sky-400' },
  violet: { fill: 'bg-violet-500', soft: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', ring: 'ring-violet-400' },
  amber: { fill: 'bg-amber-500', soft: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', ring: 'ring-amber-400' },
};

/**
 * @param {number} total          nombre total d'objets (multiple de `groups`)
 * @param {number} groups         nombre de groupes égaux
 * @param {number} [selected]     nombre de groupes sélectionnés (affichage)
 * @param {number[]} [selectedSet] indices des groupes sélectionnés — prioritaire
 * @param {(i:number)=>void} [onToggleGroup] rend les groupes cliquables
 * @param {string} [emoji]        pictogramme d'un objet
 */
export default function ObjectGroup({
  total,
  groups,
  selected = 0,
  selectedSet = null,
  onToggleGroup,
  tone = 'emerald',
  emoji = '⚽',
  showLegend = true,
}) {
  const t = TONE[tone] || TONE.emerald;
  const perGroup = total / groups;
  const interactive = typeof onToggleGroup === 'function';
  const isOn = (g) => (selectedSet ? selectedSet.includes(g) : g < selected);
  const nSelected = selectedSet ? selectedSet.length : selected;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: groups }, (_, g) => {
          const on = isOn(g);
          const Wrapper = interactive ? 'button' : 'div';

          return (
            <Wrapper
              key={g}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => onToggleGroup(g) : undefined}
              aria-pressed={interactive ? on : undefined}
              aria-label={interactive ? `Groupe ${g + 1} sur ${groups} (${perGroup} objets)` : undefined}
              className={`rounded-2xl border-2 p-2.5 grid gap-1 transition-all ${
                on ? `${t.soft} ${t.border} ring-2 ${t.ring}` : 'bg-white border-slate-200'
              } ${interactive ? 'hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer' : ''}`}
              style={{ gridTemplateColumns: `repeat(${Math.min(perGroup, 4)}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: perGroup }, (_, k) => (
                <motion.span
                  key={k}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: k * 0.02 }}
                  className="text-xl sm:text-2xl leading-none"
                  aria-hidden="true"
                >
                  {emoji}
                </motion.span>
              ))}
            </Wrapper>
          );
        })}
      </div>

      {showLegend && (
        <p className="text-xs font-mono text-slate-500 text-center">
          {total} objets ÷ {groups} groupes = <strong className="text-slate-700">{perGroup}</strong> objets par
          groupe
          {nSelected > 0 && (
            <>
              {' '}
              — <strong className={t.text}>{nSelected}</strong> groupe{nSelected > 1 ? 's' : ''} sélectionné
              {nSelected > 1 ? 's' : ''} = <strong className={t.text}>{nSelected * perGroup}</strong> objets
            </>
          )}
        </p>
      )}
    </div>
  );
}
