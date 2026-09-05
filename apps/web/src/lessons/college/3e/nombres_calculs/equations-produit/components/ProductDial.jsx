import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatDec } from './equationUtils';

/**
 * ProductDial — les deux molettes A et B et leur produit (module 1).
 *
 * Extrait du module 1 original (« la machine multiplicatrice ») : la
 * manipulation était bonne, mais elle vivait dans un module pré-kit avec des
 * curseurs `<input type="range">` seuls — injouables au doigt sur mobile. Ici
 * les PUCES de valeurs sont la commande principale, le stepper −/+ la
 * seconde, et le curseur ne reste qu'en appoint pour la souris.
 *
 * Activity: régler A et B entre −5 et 5 et lire le produit A × B.
 * Mathematical objective: découvrir qu'un produit vaut 0 uniquement quand un
 *   facteur vaut 0 — et qu'il y a exactement trois façons d'y arriver.
 * Student action: taper une puce de valeur, ou pousser −/+.
 * Controlled variable: A et B (deux entiers).
 * Mathematical state: { a, b } ; le produit et les trois découvertes en
 *   sont dérivés.
 * Visual consequence: la carte d'un facteur nul s'allume ; la carte produit
 *   passe en indigo dès que le produit vaut 0.
 * Expected observation: impossible d'obtenir 0 sans un zéro parmi A et B.
 * Misconception targeted: « deux nombres opposés / très petits donnent 0 ».
 * Feedback: le module quantifie ce qu'il reste à découvrir.
 * Formalization: la règle du produit nul, nommée au module 4.
 * Scaffolding: puces de valeurs, y compris 0, toujours visibles.
 * Transfer: les facteurs deviennent des expressions au module 4.
 *
 * Composant CONTRÔLÉ : `a`, `b` appartiennent au module.
 *
 * @param {number} a @param {number} b
 * @param {(a:number)=>void} onChangeA @param {(b:number)=>void} onChangeB
 * @param {number} [min=-5] @param {number} [max=5]
 * @param {boolean} [disabled=false]
 */
const VALUES = [-5, -3, -1, 0, 1, 3, 5];

export default function ProductDial({
  a,
  b,
  onChangeA,
  onChangeB,
  min = -5,
  max = 5,
  disabled = false,
}) {
  const product = a * b;
  const isZero = product === 0;

  return (
    <div className="space-y-3" role="group" aria-label="Les deux molettes et leur produit">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] items-center">
        <Dial
          name="A"
          tone="blue"
          value={a}
          onChange={onChangeA}
          min={min}
          max={max}
          disabled={disabled}
        />
        <div className="text-center text-2xl font-black text-slate-300 select-none" aria-hidden="true">
          ×
        </div>
        <Dial
          name="B"
          tone="emerald"
          value={b}
          onChange={onChangeB}
          min={min}
          max={max}
          disabled={disabled}
        />
      </div>

      <div
        className={`rounded-2xl border-4 p-4 text-center transition-colors ${
          isZero ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-slate-700 bg-slate-800 text-white'
        }`}
      >
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-300">Produit A × B</div>
        <div className="text-4xl font-mono font-black tabular-nums">{formatDec(product)}</div>
        <div className="text-xs text-slate-300 mt-1">
          <MathText>{`$${formatDec(a)} \\times ${formatDec(b)} = ${formatDec(product)}$`}</MathText>
        </div>
      </div>
    </div>
  );
}

const TONES = {
  blue: { on: 'border-blue-500 bg-blue-50 text-blue-800', chip: 'hover:border-blue-500', sel: 'bg-blue-600 border-blue-700 text-white' },
  emerald: { on: 'border-emerald-500 bg-emerald-50 text-emerald-800', chip: 'hover:border-emerald-500', sel: 'bg-emerald-600 border-emerald-700 text-white' },
};

function Dial({ name, tone, value, onChange, min, max, disabled }) {
  const t = TONES[tone];
  const zero = value === 0;
  const set = (v) => onChange?.(Math.min(max, Math.max(min, v)));

  return (
    <div
      className={`rounded-2xl border-2 p-3 space-y-2.5 ${zero ? t.on : 'border-slate-200 bg-white'}`}
      role="group"
      aria-label={`Facteur ${name}`}
    >
      <div className="text-center">
        <div className="text-[10px] font-mono uppercase tracking-wide text-slate-500">Facteur {name}</div>
        <div className="text-3xl font-mono font-black tabular-nums text-slate-800">{formatDec(value)}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label={`Valeurs pour ${name}`}>
        {VALUES.map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => set(v)}
            aria-pressed={value === v}
            aria-label={`${name} = ${formatDec(v)}`}
            className={`min-w-[44px] min-h-[44px] rounded-xl border-2 font-mono text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 ${
              value === v ? t.sel : `bg-white border-slate-300 text-slate-700 ${t.chip}`
            }`}
          >
            {formatDec(v)}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => set(value - 1)}
          aria-label={`Diminuer ${name}`}
          className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => set(Number(e.target.value))}
          aria-label={`Curseur du facteur ${name}`}
          className="w-24 accent-slate-700 cursor-pointer"
        />
        <button
          type="button"
          disabled={disabled || value >= max}
          onClick={() => set(value + 1)}
          aria-label={`Augmenter ${name}`}
          className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          +
        </button>
      </div>
    </div>
  );
}
