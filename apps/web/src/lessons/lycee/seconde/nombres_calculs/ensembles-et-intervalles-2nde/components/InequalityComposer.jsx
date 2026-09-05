import React from 'react';
import { formatDec } from '@smarter-academy/core';

/**
 * InequalityComposer — assembler « a ? x ? b » avec deux signes à choisir.
 *
 * Activity: traduire un intervalle dessiné en double inégalité.
 * Mathematical objective: crochet fermé ↔ ≤, crochet ouvert ↔ <.
 * Student action: toucher un signe pour chaque borne (deux boutons à deux
 *   états, tap-first).
 * Controlled variable: les deux signes.
 * Mathematical state: { leftStrict, rightStrict } (module).
 * Visual consequence: l'inégalité s'écrit ; après validation, le verdict.
 */
export default function InequalityComposer({ a, b, variable = 'x', value, onChange, disabled = false }) {
  const Sign = ({ side }) => {
    const strict = side === 'left' ? value.leftStrict : value.rightStrict;
    return (
      <button
        type="button"
        disabled={disabled}
        aria-label={`Signe ${side === 'left' ? 'de gauche' : 'de droite'} : ${strict ? 'strictement inférieur' : 'inférieur ou égal'}`}
        aria-pressed={!strict}
        onClick={() => onChange(side === 'left' ? { ...value, leftStrict: !strict } : { ...value, rightStrict: !strict })}
        className="min-h-[48px] min-w-[52px] px-3 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-900 font-mono text-2xl font-extrabold hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
      >
        {strict ? '<' : '≤'}
      </button>
    );
  };
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap font-mono text-2xl font-extrabold text-slate-800" role="group" aria-label="Double inégalité à assembler">
      <span>{formatDec(a)}</span>
      <Sign side="left" />
      <span className="italic">{variable}</span>
      <Sign side="right" />
      <span>{formatDec(b)}</span>
    </div>
  );
}
