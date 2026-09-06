import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { formatFr } from './numberUtils';
import { barPct, placeNext, swap, remainingCards } from './cardUtils';

/**
 * DigitCards — les cartes-chiffres du Module 1 et le chiffre qui se déplace du
 * Module 4. Composants SANS état mathématique : l'arrangement (`slots`) est la
 * seule vérité, il appartient au module ; ici on ne garde que la carte
 * sélectionnée (état d'interface).
 *
 * Gestes (tactile d'abord, §16 : tap avant glisser) :
 *   - taper une carte de la main → elle se pose dans la première case vide ;
 *   - taper une carte posée → elle est sélectionnée ; taper une autre carte
 *     posée → les deux s'échangent ; taper une case vide → elle s'y déplace ;
 *     taper une carte de la main → elle prend sa place, l'autre revient en main ;
 *   - « Tout retirer » ramène la main au départ (jamais à un autre état).
 * Tout est bouton : le clavier (Tab, Entrée) atteint le même état que le doigt.
 *
 * Sécurité d'affichage (§17bis) : les nombres vivent dans le DOM, jamais dans
 * la barre ; la barre est un pourcentage d'une échelle qui contient toujours
 * la plus grande valeur ; 5 cases de 48 px tiennent dans 299 px (375 px moins
 * les marges de page et d'étape).
 */

const PLACE_LABELS = {
  4: [
    { long: 'milliers', short: 'm' },
    { long: 'centaines', short: 'c' },
    { long: 'dizaines', short: 'd' },
    { long: 'unités', short: 'u' },
  ],
  5: [
    { long: 'dizaines de milliers', short: 'dm' },
    { long: 'milliers', short: 'm' },
    { long: 'centaines', short: 'c' },
    { long: 'dizaines', short: 'd' },
    { long: 'unités', short: 'u' },
  ],
};

export function placeLabels(size) {
  return PLACE_LABELS[size] || PLACE_LABELS[4].slice(-size);
}

const TONES = {
  indigo: { card: 'border-indigo-300 text-indigo-900', selected: 'border-indigo-600 ring-4 ring-indigo-200 bg-indigo-50', slot: 'border-indigo-200' },
  amber: { card: 'border-amber-300 text-amber-900', selected: 'border-amber-600 ring-4 ring-amber-200 bg-amber-50', slot: 'border-amber-200' },
  slate: { card: 'border-slate-300 text-slate-800', selected: 'border-slate-700 ring-4 ring-slate-200 bg-slate-100', slot: 'border-slate-200' },
};

/** Une carte-chiffre (bouton). `empty` dessine une case vide. */
export function DigitCard({ digit, onClick, selected = false, disabled = false, ariaLabel, tone = 'indigo', empty = false, size = 'md' }) {
  const t = TONES[tone] || TONES.indigo;
  const dims = size === 'sm' ? 'w-11 h-14 text-2xl' : 'w-12 h-16 sm:w-16 sm:h-20 text-3xl sm:text-4xl';
  const base = `${dims} rounded-xl border-2 font-mono font-extrabold tabular-nums flex items-center justify-center transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`;
  if (empty) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        aria-label={ariaLabel}
        className={`${base} border-dashed ${t.slot} bg-slate-50 text-slate-300 ${onClick && !disabled ? 'hover:bg-white hover:border-slate-400' : ''}`}
      >
        ·
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-label={ariaLabel}
      aria-pressed={onClick ? selected : undefined}
      className={`${base} shadow-sm ${
        selected ? `${t.selected} -translate-y-1` : `bg-white ${t.card} ${onClick && !disabled ? 'hover:-translate-y-0.5 hover:shadow' : ''}`
      }`}
    >
      {digit}
    </button>
  );
}

/**
 * Une main de cartes et ses cases-positions.
 *
 * @param {number[]} cards   les cartes de la main (deux 5 = deux cartes)
 * @param {(number|null)[]} slots   l'arrangement (gauche = plus grande position)
 * @param {(next:(number|null)[]) => void} onChange
 */
export function CardHand({ name, cards, slots, onChange, disabled = false, tone = 'indigo', showLabels = true, size = 'md' }) {
  const [selected, setSelected] = useState(null);
  const reserve = remainingCards(cards, slots);
  const labels = placeLabels(slots.length);
  const placedCount = slots.filter((d) => d !== null && d !== undefined).length;
  const prefix = name ? `${name} — ` : '';

  const tapReserve = (digit) => {
    if (disabled) return;
    if (selected !== null) {
      const next = [...slots];
      next[selected] = digit;
      setSelected(null);
      onChange(next);
      return;
    }
    onChange(placeNext(slots, digit));
  };

  const tapSlot = (i) => {
    if (disabled) return;
    const here = slots[i];
    if (selected === null) {
      if (here !== null && here !== undefined) setSelected(i);
      return;
    }
    if (selected === i) {
      setSelected(null);
      return;
    }
    // Échange (deux cartes) ou déplacement (vers une case vide) : même geste.
    setSelected(null);
    onChange(swap(slots, selected, i));
  };

  const reset = () => {
    setSelected(null);
    onChange(slots.map(() => null));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          {name ? `${name} — ` : ''}cases
          {selected !== null && (
            <span className="ml-2 normal-case font-semibold text-indigo-600">
              carte {slots[selected]} sélectionnée : tape une autre case pour échanger
            </span>
          )}
        </div>
        {!disabled && placedCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-800 min-h-[44px] px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          >
            <RotateCcw className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" /> Tout retirer
          </button>
        )}
      </div>

      <div className="flex gap-1.5 sm:gap-2" role="group" aria-label={`${name ? `${name} : ` : ''}cases du nombre`}>
        {slots.map((d, i) => {
          const label = labels[i];
          const filled = d !== null && d !== undefined;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <DigitCard
                digit={d}
                empty={!filled}
                tone={tone}
                size={size}
                selected={selected === i}
                disabled={disabled}
                onClick={() => tapSlot(i)}
                ariaLabel={`${prefix}Case des ${label.long} : ${filled ? d : 'vide'}`}
              />
              {showLabels && (
                <span className="text-[10px] font-mono text-slate-400 leading-none">
                  <span className="hidden sm:inline">{label.long}</span>
                  <span className="sm:hidden uppercase">{label.short}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {(reserve.length > 0 || !disabled) && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {name ? `${name} — ` : ''}cartes en main
          </div>
          <div className="flex gap-1.5 sm:gap-2 min-h-[56px] items-start flex-wrap" role="group" aria-label={`${name ? `${name} : ` : ''}cartes en main`}>
            {reserve.length === 0 && (
              <span className="text-xs text-slate-400 italic self-center">
                Toutes les cartes sont posées{disabled ? '.' : ' — tape deux cartes pour les échanger.'}
              </span>
            )}
            {reserve.map((d, k) => (
              <DigitCard
                key={`${d}-${k}`}
                digit={d}
                tone={tone}
                size={size}
                disabled={disabled}
                onClick={() => tapReserve(d)}
                ariaLabel={`${prefix}Poser la carte ${d}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Une barre proportionnelle : longueur = valeur ÷ échelle. Le nombre est dans
 * sa propre colonne du DOM, il ne peut ni chevaucher ni rogner la barre.
 * `marks` pose des repères fins sur la piste (sans texte : la légende est en
 * dessous, dans le DOM).
 */
export function ValueBar({ label, value, scale, tone = 'indigo', marks = [], readout, muted = false }) {
  const pct = barPct(value, scale);
  const fill = tone === 'amber' ? 'bg-amber-500' : tone === 'rose' ? 'bg-rose-400' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500';
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1">
      <div className="min-w-[4.5rem] text-right">
        {label && <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{label}</div>}
        <div className={`font-mono font-extrabold tabular-nums text-base sm:text-lg ${muted ? 'text-slate-400' : 'text-slate-800'}`} aria-live="polite">
          {readout ?? formatFr(value)}
        </div>
      </div>
      <div className="relative h-6 rounded-full bg-slate-200 overflow-hidden" role="img" aria-label={`${label ? `${label} : ` : ''}${formatFr(value)} sur une échelle de ${formatFr(scale)}`}>
        <div className={`h-full ${fill} rounded-full transition-[width] duration-300 ease-out`} style={{ width: `${pct}%` }} />
        {marks.map((m, i) => (
          <div
            key={`${m.value}-${i}`}
            className={`absolute top-0 h-full w-0.5 ${m.tone === 'emerald' ? 'bg-emerald-700' : 'bg-slate-700'}`}
            style={{ left: `calc(${barPct(m.value, scale)}% - 1px)` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
