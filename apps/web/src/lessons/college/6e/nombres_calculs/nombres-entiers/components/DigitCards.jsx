import React from 'react';
import { RotateCcw } from 'lucide-react';
import { formatFr } from './numberUtils';
import { barPct, swap, remainingCards } from './cardUtils';
import useDragDrop from '../../../../../common/manip6e/useDragDrop';

/**
 * DigitCards — les cartes-chiffres et leurs cases de position. Composants SANS
 * état mathématique : l'arrangement (`slots`) est la seule vérité, il
 * appartient au module ; ici on ne garde que la carte en main (état
 * d'interface), et elle vit dans `useDragDrop`.
 *
 * GLISSER-DÉPOSER (demande utilisateur du 2026-09-07 : « make them a drag and
 * drop »). Une carte-chiffre ne se choisit pas dans un formulaire : on
 * l'ATTRAPE et on la POSE dans une case. Le geste dit la mathématique — c'est
 * la POSITION de la carte qui lui donne sa valeur, donc c'est le déplacement
 * lui-même qui est l'objet de la leçon.
 *
 * Gestes :
 *   - glisser une carte de la main sur une case → elle s'y pose ;
 *   - glisser une carte posée sur une autre case → les deux s'échangent
 *     (ou la carte se déplace, si la case est vide) : même geste ;
 *   - « Tout retirer » ramène la main au départ (jamais à un autre état).
 *
 * Le chemin en deux temps reste ENTIER : activer une carte la prend
 * (`aria-pressed`), activer une case l'y pose. C'est le chemin clavier et
 * lecteur d'écran, il ne disparaît jamais. `zoneProps` ne fait que MARQUER la
 * case pour `elementFromPoint` ; les gestionnaires clic/clavier sont posés en
 * plus, explicitement.
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

/**
 * Une carte-chiffre (bouton). `empty` dessine une case vide.
 *
 * `...rest` laisse passer les gestionnaires de `useDragDrop` (sourceProps /
 * zoneProps) sans que ce composant d'affichage ait à les connaître.
 */
export function DigitCard({ digit, onClick, selected = false, disabled = false, ariaLabel, tone = 'indigo', empty = false, size = 'md', hot = false, ...rest }) {
  const t = TONES[tone] || TONES.indigo;
  const dims = size === 'sm' ? 'w-11 h-14 text-2xl' : 'w-12 h-16 sm:w-16 sm:h-20 text-3xl sm:text-4xl';
  const base = `${dims} rounded-xl border-2 font-mono font-extrabold tabular-nums flex items-center justify-center transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`;
  const live = (onClick || rest.onPointerDown) && !disabled;
  if (empty) {
    return (
      <button
        type="button"
        {...rest}
        onClick={onClick}
        disabled={disabled || !live}
        aria-label={ariaLabel}
        className={`${base} border-dashed bg-slate-50 text-slate-300 ${
          hot ? 'border-solid border-indigo-600 ring-4 ring-indigo-200 bg-indigo-50' : t.slot
        } ${live ? 'hover:bg-white hover:border-slate-400' : ''}`}
      >
        ·
      </button>
    );
  }
  return (
    <button
      type="button"
      {...rest}
      onClick={onClick}
      disabled={disabled || !live}
      aria-label={ariaLabel}
      aria-pressed={rest['aria-pressed'] ?? (onClick ? selected : undefined)}
      className={`${base} shadow-sm ${
        hot ? `${t.selected} ring-4` : selected ? `${t.selected} -translate-y-1` : `bg-white ${t.card} ${live ? 'hover:-translate-y-0.5 hover:shadow' : ''}`
      }`}
    >
      {digit}
    </button>
  );
}

/**
 * Une main de cartes et ses cases-positions — au GLISSER.
 *
 * Les identifiants du glisser :
 *   - source `hand:<k>` = la k-ième carte de la réserve ;
 *   - source `slot:<i>` = la carte déjà posée dans la case i ;
 *   - zone   `slot:<i>` = la case i.
 * Une case est donc à la fois source et zone : c'est ce qui permet de faire
 * glisser une carte posée sur une autre case pour ÉCHANGER les deux — le
 * geste qui montre que seule la position change la valeur.
 *
 * @param {number[]} cards   les cartes de la main (deux 5 = deux cartes)
 * @param {(number|null)[]} slots   l'arrangement (gauche = plus grande position)
 * @param {(next:(number|null)[]) => void} onChange
 */
export function CardHand({ name, cards, slots, onChange, disabled = false, tone = 'indigo', showLabels = true, size = 'md' }) {
  const reserve = remainingCards(cards, slots);
  const labels = placeLabels(slots.length);
  const placedCount = slots.filter((d) => d !== null && d !== undefined).length;
  const prefix = name ? `${name} — ` : '';

  // Poser une carte : le hook nous donne la SOURCE et la CASE visée. Deux
  // sources possibles, une seule mathématique — l'arrangement change.
  const dd = useDragDrop({
    // Lâcher une carte SUR SA PROPRE CASE n'est pas un dépôt : c'est un
    // simple appui. Le refuser ici (plutôt que de l'ignorer dans `onDrop`)
    // laisse la carte EN MAIN — sans quoi un tap sur une case pleine la
    // prendrait et la reposerait aussitôt, et le chemin clavier de l'échange
    // serait injouable.
    accepts: (sourceId, zoneId) => sourceId !== zoneId,
    onDrop: (sourceId, zoneId) => {
      if (disabled) return;
      const to = Number(zoneId.slice(5));
      if (sourceId.startsWith('slot:')) {
        const from = Number(sourceId.slice(5));
        // Échange (deux cartes) ou déplacement (vers une case vide) : le
        // même geste, la même fonction pure.
        onChange(swap(slots, from, to));
        return;
      }
      // Une carte de la main : elle prend la case ; ce qui s'y trouvait
      // retourne en main (c'est `remainingCards` qui le recalcule).
      const digit = reserve[Number(sourceId.slice(5))];
      if (digit === undefined) return;
      const next = [...slots];
      next[to] = digit;
      onChange(next);
    },
  });

  const heldDigit = (() => {
    if (dd.held === null) return null;
    if (dd.held.startsWith('slot:')) return slots[Number(dd.held.slice(5))];
    return reserve[Number(dd.held.slice(5))];
  })();

  const reset = () => {
    dd.release();
    onChange(slots.map(() => null));
  };

  return (
    <div className="space-y-3">
      {/* La carte transportée suit le doigt ; `pointer-events-none` pour
          qu'elle ne masque jamais la case visée sous le pointeur. */}
      {dd.ghost && heldDigit !== null && heldDigit !== undefined && (
        <div
          aria-hidden="true"
          className="fixed z-50 pointer-events-none w-12 h-16 rounded-xl border-2 border-indigo-600 bg-indigo-50 text-indigo-900 font-mono font-extrabold text-3xl flex items-center justify-center shadow-lg"
          style={{ left: dd.ghost.x + 12, top: dd.ghost.y + 12 }}
        >
          {heldDigit}
        </div>
      )}

      <div className="flex items-end justify-between gap-2 flex-wrap">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          {name ? `${name} — ` : ''}cases
          {heldDigit !== null && heldDigit !== undefined && (
            <span className="ml-2 normal-case font-semibold text-indigo-600">
              carte {heldDigit} en main : lâche-la sur une case
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
          const zoneId = `slot:${i}`;
          // Une case pleine est AUSSI une source : on peut en ressortir la
          // carte pour la glisser ailleurs. Mais tant qu'une AUTRE carte est
          // en main, la case n'est plus qu'une cible — sinon l'appui sur la
          // case d'arrivée reprendrait sa propre carte et l'échange au
          // clavier serait impossible.
          const asTarget = dd.held !== null && dd.held !== zoneId;
          const src = filled && !disabled && !asTarget ? dd.sourceProps(zoneId) : {};
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <DigitCard
                digit={d}
                empty={!filled}
                tone={tone}
                size={size}
                selected={dd.held === zoneId}
                hot={dd.hoverZone === zoneId}
                disabled={disabled}
                {...src}
                {...dd.zoneProps(zoneId)}
                onClick={() => {
                  if (disabled) return;
                  // La case est d'abord une CIBLE : si une carte est en main,
                  // l'activer la pose. Sinon, et si elle est pleine, elle
                  // prend sa propre carte (chemin clavier de l'échange).
                  if (dd.held !== null && dd.held !== zoneId) { dd.dropHere(zoneId); return; }
                  src.onClick?.();
                }}
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
            {name ? `${name} — ` : ''}cartes en main — fais-les glisser dans une case
          </div>
          <div className="flex gap-1.5 sm:gap-2 min-h-[56px] items-start flex-wrap" role="group" aria-label={`${name ? `${name} : ` : ''}cartes en main`}>
            {reserve.length === 0 && (
              <span className="text-xs text-slate-400 italic self-center">
                Toutes les cartes sont posées{disabled ? '.' : ' — fais glisser une carte posée sur une autre case pour les échanger.'}
              </span>
            )}
            {reserve.map((d, k) => (
              <DigitCard
                key={`${d}-${k}`}
                digit={d}
                tone={tone}
                size={size}
                disabled={disabled}
                selected={dd.held === `hand:${k}`}
                {...(disabled ? {} : dd.sourceProps(`hand:${k}`))}
                ariaLabel={`${prefix}Prendre la carte ${d}`}
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
