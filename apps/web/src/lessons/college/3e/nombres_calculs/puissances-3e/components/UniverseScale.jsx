import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec, formatScientific, toScientific } from './powerUtils';

/**
 * UniverseScale — l'échelle de l'univers (reprise du module 5 d'origine,
 * convertie en composant contrôlé, tap-first, avec ensemble visité).
 *
 * Activity: parcourir une bande d'objets réels, de la galaxie à l'atome, en
 *   tapant des puces de zoom (ou le stepper).
 * Mathematical objective: lire des tailles réelles en écriture scientifique
 *   et sentir que l'exposant, seul, situe l'objet dans l'univers.
 * Student action: taper une puce d'objet, ou pousser « zoom − / zoom + ».
 * Controlled variable: l'indice de l'objet courant.
 * Mathematical state: `index` + l'ensemble `visited` des indices déjà vus ;
 *   l'écriture scientifique de chaque taille vient de toScientific, jamais
 *   d'une chaîne recopiée.
 * Visual consequence: l'objet change, la taille en mètres et son écriture
 *   scientifique s'affichent, la puce visitée se marque.
 * Expected observation: entre deux objets voisins, ce sont les exposants qui
 *   changent de plusieurs unités — chaque unité est un facteur 10.
 * Misconception targeted: comparer les tailles en regardant les chiffres du
 *   coefficient plutôt que l'exposant.
 * Feedback: le module chiffre combien d'objets restent à découvrir.
 * Scaffolding: puces tap-first + stepper ; ≤ 8 puces (cap de densité).
 *
 * Composant CONTRÔLÉ : `index` et `visited` appartiennent au module.
 * Nœuds interactifs : ≤ 6 puces + 2 boutons = 8.
 *
 * @param {{id:string,name:string,emoji:string,meters:number,plain:string}[]} items
 *        triés du plus grand au plus petit
 * @param {number} index
 * @param {(i:number)=>void} [onChange]
 * @param {string[]} [visited=[]] ids déjà vus
 * @param {boolean} [frozen=false]
 */
export default function UniverseScale({ items, index, onChange, visited = [], frozen = false }) {
  const item = items[index];
  const sci = toScientific(item.meters);

  return (
    <div className="space-y-3" role="group" aria-label="Échelle de l’univers">
      {/* ── L'objet courant ──────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-5 text-center space-y-2">
        <div className="text-5xl" aria-hidden="true">
          {item.emoji}
        </div>
        <p className="text-lg font-extrabold">{item.name}</p>
        <div className="rounded-xl bg-white/10 px-3 py-2 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-300">Taille en mètres</p>
          <p className="font-mono text-sm font-bold break-all">{item.plain}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Écriture scientifique</p>
          <MathText className="text-xl text-rose-700">{`$${formatScientific(sci)}$`}</MathText>
        </div>
        <p className="text-[11px] text-slate-300">
          Ordre de grandeur : <MathText className="text-slate-100">{`$10^{${sci.n}}$`}</MathText> mètre
          {Math.abs(sci.n) > 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Les puces d'objets ───────────────────────────────────────── */}
      {!frozen && onChange && (
        <>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => onChange(i)}
                aria-pressed={i === index}
                aria-label={`Zoomer sur ${it.name}`}
                className={`min-w-[52px] min-h-[48px] rounded-xl border-2 flex flex-col items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  i === index
                    ? 'bg-rose-600 border-rose-700 text-white'
                    : visited.includes(it.id)
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-rose-400'
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {it.emoji}
                </span>
                <span className="text-[10px] font-mono font-bold" aria-hidden="true">
                  10{toScientific(it.meters).n < 0 ? '⁻' : ''}
                  {supDigits(Math.abs(toScientific(it.meters).n))}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onChange(Math.max(0, index - 1))}
              disabled={index <= 0}
              aria-label="Zoomer vers le plus grand"
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-rose-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ⬅ plus grand
            </button>
            <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
              {formatDec(visited.length)} / {formatDec(items.length)} découverts
            </span>
            <button
              type="button"
              onClick={() => onChange(Math.min(items.length - 1, index + 1))}
              disabled={index >= items.length - 1}
              aria-label="Zoomer vers le plus petit"
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-rose-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              plus petit ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
function supDigits(n) {
  return String(n)
    .split('')
    .map((d) => SUP[Number(d)])
    .join('');
}
