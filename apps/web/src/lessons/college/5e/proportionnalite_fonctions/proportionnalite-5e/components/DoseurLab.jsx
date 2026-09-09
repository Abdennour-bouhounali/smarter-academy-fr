import React from 'react';
import { fr, eur, doublingRatio } from './propUtils';

/**
 * DoseurLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               régler une entrée et voir DEUX situations réagir
 *                        côte à côte, dans le même écran.
 * Mathematical objective deux grandeurs peuvent monter ensemble sans que la
 *                        situation soit proportionnelle. Ce qui décide, ce
 *                        n'est pas « ça monte », c'est « ça double quand je
 *                        double ».
 * Student action         glisser le curseur de l'entrée (verres / entrées).
 * Controlled variable    l'entrée, et elle seule. Les deux règles sont fixes.
 * Mathematical state     un entier n ∈ [min, max] ; tout le reste est calculé
 *                        par `rule.apply(n)` — aucune valeur écrite à la main.
 * Visual consequence     les deux barres se redessinent à l'instant, et les
 *                        deux nombres se réécrivent.
 * Expected observation   « les deux montent… mais quand je double, une seule
 *                        double ».
 * Misconception targeted « si ça augmente quand j'augmente, c'est
 *                        proportionnel ».
 *
 * SÉCURITÉ VISUELLE (§6ter.5) : des pistes DOM, jamais du texte SVG. La
 * longueur d'une barre est un pourcentage de sa piste, et les nombres vivent
 * dans leur propre colonne — quel que soit le nombre de chiffres, rien ne peut
 * se chevaucher ni déborder. L'échelle de chaque piste est fixée par la valeur
 * MAXIMALE atteignable de sa règle, calculée ici : la barre ne peut donc
 * jamais sortir de son cadre, à aucune entrée.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. Une étape validée ne fige
 * jamais le labo (mémoire « manipulations gelées après validation »).
 */

/** Une piste : une barre dont la longueur est un % de la piste. */
function Track({ rule, n, highlight }) {
  const value = rule.apply(n);
  // L'échelle contient la plus grande valeur ATTEIGNABLE, pas la valeur
  // courante : la barre ne peut jamais dépasser sa piste.
  const max = rule.apply(rule.maxInput ?? 20) || 1;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const shown = rule.money ? eur(value) : `${fr(value, rule.decimals ?? 2)} ${rule.unit}`;

  return (
    <div
      className={`rounded-2xl border-2 p-3.5 space-y-2.5 transition-colors ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-slate-700">
          <span aria-hidden="true">{rule.emoji}</span> {rule.label}
        </span>
      </div>

      {/* La barre et le nombre occupent deux colonnes distinctes : le nombre
          ne peut pas recouvrir la barre, quelle que soit sa longueur. */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ${
              highlight ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className="font-mono text-base sm:text-lg font-black tabular-nums text-slate-800 shrink-0 text-right"
          style={{ minWidth: '5.5rem' }}
        >
          {shown}
        </span>
      </div>

      <p className="text-xs text-slate-500">{rule.story}</p>
    </div>
  );
}

/**
 * @param {object[]} rules   les règles à faire réagir (1 ou 2)
 * @param {number}   n       l'entrée courante
 * @param {(n:number)=>void} onN
 * @param {string}   inputLabel  ce que règle le curseur (« verres », « entrées »)
 * @param {number}   min, max
 * @param {string[]} highlight   ids des règles à mettre en avant
 */
export default function DoseurLab({
  rules,
  n,
  onN,
  inputLabel,
  min = 1,
  max = 12,
  highlight = [],
  children,
}) {
  const double = () => onN(Math.min(max, n * 2));
  const canDouble = n * 2 <= max;

  return (
    <div className="space-y-3.5">
      {/* LA COMMANDE — une seule, celle de la grandeur d'entrée. */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-3.5 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <label htmlFor="doseur-n" className="text-sm font-bold text-indigo-900">
            Nombre de {inputLabel}
          </label>
          <span className="font-mono text-2xl font-black tabular-nums text-indigo-700">{n}</span>
        </div>
        <input
          id="doseur-n"
          type="range"
          min={min}
          max={max}
          step={1}
          value={n}
          onChange={(e) => onN(Number(e.target.value))}
          className="w-full accent-indigo-600 h-6 cursor-pointer"
          aria-label={`Nombre de ${inputLabel}`}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            {min} … {max}
          </span>
          {/* Le geste QUI DÉCIDE, à portée d'un clic : doubler l'entrée. */}
          <button
            type="button"
            onClick={double}
            disabled={!canDouble}
            className="px-3 py-1.5 rounded-lg bg-white border-2 border-indigo-300 text-indigo-700 text-xs font-bold hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Doubler l’entrée ({n} → {n * 2})
          </button>
        </div>
      </div>

      <div className={rules.length > 1 ? 'grid sm:grid-cols-2 gap-3' : 'space-y-3'}>
        {rules.map((r) => (
          <Track key={r.id} rule={r} n={n} highlight={highlight.includes(r.id)} />
        ))}
      </div>

      {children}
    </div>
  );
}

/**
 * Le comparateur de doublement — la RÉVÉLATION du module 1, calculée.
 * Il montre, pour chaque règle, ce que devient la sortie quand l'entrée
 * double : « ×2 » d'un côté, « ×1,6 » de l'autre. Le verdict n'est jamais
 * écrit à la main ; il vient de `doublingRatio`.
 */
export function DoublingReadout({ rules, n }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">
        Si tu passes de {n} à {n * 2}
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {rules.map((r) => {
          const before = r.apply(n);
          const after = r.apply(2 * n);
          const q = doublingRatio(r, n);
          const doubles = q === 2;
          return (
            <div
              key={r.id}
              className={`rounded-xl border-2 px-3 py-2 space-y-1 ${
                doubles ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
              }`}
            >
              <div className="text-xs font-semibold text-slate-600">
                <span aria-hidden="true">{r.emoji}</span> {r.label}
              </div>
              <div className="font-mono text-sm font-bold tabular-nums text-slate-800">
                {r.money ? eur(before) : fr(before, r.decimals ?? 2)}
                {' → '}
                {r.money ? eur(after) : fr(after, r.decimals ?? 2)}
              </div>
              <div
                className={`text-sm font-black ${doubles ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {q === null ? 'indéfini' : `× ${fr(q)}`}
                {doubles ? ' — ça double' : ' — ça ne double pas'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
