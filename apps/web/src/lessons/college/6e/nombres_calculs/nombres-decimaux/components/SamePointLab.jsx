import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useDragValue from '../../../../../common/manip6e/useDragValue';
import { formatDec, roundTo, parseDec } from './decimalUtils';

/**
 * SamePointLab — trois étiquettes, une seule ligne : où chacune se pose-t-elle ?
 *
 * Activity: attraper chaque étiquette d'écriture et la GLISSER sur la ligne
 *   jusqu'à l'endroit dont on pense qu'elle parle. La ligne dit ensuite,
 *   sans verdict écrit, si deux étiquettes ont atterri au même endroit.
 * Mathematical objective: deux écritures différentes peuvent nommer la MÊME
 *   position — et deux écritures qui se ressemblent peuvent en nommer deux
 *   très éloignées.
 * Student action: un glisser par étiquette (ou les flèches au clavier). Aucun
 *   stepper : la position EST la réponse.
 * Controlled variable: la position posée par l'élève pour chaque écriture.
 * Mathematical state: `placed` = { '4,5': x, '4,50': x, '4,05': x }, une
 *   position par étiquette. Les pastilles, l'écart affiché et la conclusion en
 *   dérivent — rien n'est stocké deux fois.
 * Visual consequence: chaque pastille glisse le long de la ligne sous le
 *   doigt ; quand deux pastilles se superposent, un halo commun apparaît.
 * Expected observation (LA surprise du module) : 4,5 et 4,50 tombent
 *   exactement au MÊME point, alors que 4,5 et 4,05 sont très loin l'un de
 *   l'autre. Un zéro ajouté au bout ne change rien ; un zéro glissé juste
 *   après la virgule change tout.
 * Misconception targeted: « plus il y a de chiffres après la virgule, plus le
 *   nombre est grand » et « le zéro ne compte pas ».
 * Formalization: aucune. Le mot « écritures équivalentes » est posé au module
 *   6, la valeur de position au module 5 : ici, seule la ligne parle.
 * Scaffolding: rien ne se fige ; on redéplace une étiquette autant qu'on veut.
 *
 * Sécurité d'affichage (§17bis) : les étiquettes sont des pastilles DOM
 * positionnées en pourcentage au-dessus d'une piste, réparties sur trois
 * rangées distinctes — deux pastilles ne peuvent donc jamais se recouvrir même
 * quand leurs valeurs coïncident, et le halo commun est ce qui signale la
 * coïncidence. Aucun texte dans le SVG.
 */

const TONE = {
  //          la pastille      son halo au repos       le chiffre du relevé   l'anneau de focus
  '4,5':  { bg: 'bg-sky-500',     ring: 'ring-sky-300',     text: 'text-sky-700',     focus: '#0369a1' },
  '4,50': { bg: 'bg-emerald-500', ring: 'ring-emerald-300', text: 'text-emerald-700', focus: '#047857' },
  '4,05': { bg: 'bg-rose-500',    ring: 'ring-rose-300',    text: 'text-rose-700',    focus: '#be123c' },
};

/** Une étiquette glissable sur la piste. Le hook, pas un <input range>. */
function Ticket({ label, value, onValue, min, max, step, row }) {
  const t = TONE[label] || TONE['4,5'];
  // Le focus se voit sur l'étiquette elle-même, dans SA couleur : c'est bien la
  // pastille qu'on manipule qui s'allume, pas un cadre noir posé autour.
  const [focused, setFocused] = useState(false);
  const drag = useDragValue({
    value,
    onChange: (v) => onValue(roundTo(v, 4)),
    min, max, step,
    ariaLabel: `Étiquette ${label}`,
    valueText: (v) => `posée sur ${formatDec(v)}`,
  });
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative h-11" {...drag.frameProps}>
      {/* §17bis — l'étiquette est centrée sur sa valeur et atteint donc les deux
          bords de la rangée : son anneau de focus est posé en INSET (blanc puis
          la couleur de l'étiquette), si bien qu'il ne peut sortir d'aucun côté,
          ni à 4 ni à 5. */}
      <motion.button
        type="button"
        {...drag.handleProps}
        {...drag.a11yProps}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        animate={{ left: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className={`absolute top-0 -translate-x-1/2 min-h-[44px] min-w-[60px] px-3 rounded-xl text-white font-mono font-black text-sm shadow-md
          ${t.bg} ring-2 ${t.ring}`}
        style={{
          ...drag.handleProps.style,
          touchAction: 'none',
          outline: 'none',
          ...(focused ? { boxShadow: `inset 0 0 0 3px #fff, inset 0 0 0 6px ${t.focus}` } : {}),
        }}
      >
        {label}
      </motion.button>
      <span className="sr-only">Rangée {row}</span>
    </div>
  );
}

/**
 * @param {object}   placed  { '4,5': n, '4,50': n, '4,05': n } — l'état, tenu par le module
 * @param {function} onPlace (label, value) => void
 */
export default function SamePointLab({ placed, onPlace, min = 4, max = 5, step = 0.01 }) {
  const labels = Object.keys(placed);
  const toPct = (v) => ((v - min) / (max - min)) * 100;

  // Les pastilles posées sur la piste : la coïncidence se lit ici, dérivée.
  const groups = labels.reduce((acc, l) => {
    const key = formatDec(placed[l]);
    (acc[key] = acc[key] || []).push(l);
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      {/* Les trois étiquettes, une par rangée : elles ne se cachent jamais. */}
      <div className="space-y-1">
        {labels.map((l, i) => (
          <Ticket
            key={l}
            label={l}
            row={i + 1}
            value={placed[l]}
            onValue={(v) => onPlace(l, v)}
            min={min} max={max} step={step}
          />
        ))}
      </div>

      {/* ── La ligne. Elle ne juge pas : elle montre où les pastilles sont. ── */}
      <div className="relative rounded-xl border-2 border-slate-200 bg-slate-50 px-0 py-4">
        <div className="relative mx-6 h-1.5 rounded-full bg-slate-300">
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <span
              key={f}
              className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-slate-400"
              style={{ left: `${f * 100}%` }}
            />
          ))}
          {labels.map((l) => {
            const shared = groups[formatDec(placed[l])].length > 1;
            return (
              <span
                key={l}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ${TONE[l].bg}
                  ${shared ? 'w-5 h-5 ring-4 ring-amber-300' : 'w-3 h-3'}`}
                style={{ left: `${toPct(placed[l])}%` }}
                aria-hidden="true"
              />
            );
          })}
        </div>
        <div className="flex justify-between mx-4 mt-2 text-[11px] font-mono font-bold text-slate-500">
          <span>{formatDec(min)}</span>
          <span>{formatDec(roundTo((min + max) / 2))}</span>
          <span>{formatDec(max)}</span>
        </div>
      </div>

      {/* Le relevé, en DOM : trois lignes, jamais un chevauchement possible. */}
      <ul className="grid grid-cols-3 gap-2" role="status" aria-live="polite">
        {labels.map((l) => (
          <li key={l} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center">
            <div className={`font-mono font-black text-sm ${TONE[l].text}`}>{l}</div>
            <div className="text-[11px] font-mono text-slate-500 tabular-nums">
              posée sur {formatDec(placed[l])}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** La vérité mathématique des trois étiquettes — pure, donc testable. */
export const TRUE_VALUES = {
  '4,5': parseDec('4,5'),
  '4,50': parseDec('4,50'),
  '4,05': parseDec('4,05'),
};
