import React, { useMemo, useRef } from 'react';
import { isolateMath, stripIsolates } from './isolateMath';
import { symbolsFor } from './mathSymbols';

/**
 * MathTextArea — LA zone où l'élève écrit des mathématiques en arabe, sans
 * validation automatique : la rédaction d'une مسألة (WrittenAnswer) et la
 * règle qu'il formule AVANT de la lire (PredictRule).
 *
 *  - lignes de cahier, RTL, police de lecture ;
 *  - une palette des SEULS symboles qu'utilise ce qu'on attend de l'élève
 *    (`symbolsFrom` : le texte de la règle, la rédaction modèle — mathSymbols.js),
 *    sur UNE rangée défilante, insérés au curseur avec une espace de part et
 *    d'autre ; rien de mathématique dans la source → pas de palette ;
 *  - chaque calcul est isolé en LTR au fil de la frappe (isolateMath), sinon
 *    « 268 = 54 × 4 + 52 » s'affiche à l'envers dans une phrase arabe.
 *
 * Contrôlée : `value` / `onChange(text)`. `minChars` (sans espaces ni isolants)
 * est exposé par `writtenLength` pour que l'appelant active son bouton.
 */
// Ces symboles se collent à ce qui précède (pas d'espace autour).
const TIGHT = new Set(['²', '³', '(', ')', '°']);

/** Longueur utile d'un texte écrit (sans espaces ni isolants invisibles). */
export const writtenLength = (text) => stripIsolates(text ?? '').replace(/\s/g, '').length;

export default function MathTextArea({ value, onChange, placeholder, ariaLabel, rows = 4, symbolsFrom, groups: given }) {
  const groups = useMemo(() => given ?? (symbolsFrom ? symbolsFor(symbolsFrom) : []), [given, symbolsFrom]);
  const area = useRef(null);

  // Toute écriture passe par isolateMath ; le curseur suit le même caractère.
  const write = (raw, cursor) => {
    const next = isolateMath(raw, cursor);
    onChange(next.text);
    requestAnimationFrame(() => {
      const el = area.current;
      if (el) el.setSelectionRange(next.cursor, next.cursor);
    });
  };

  const insert = (sym) => {
    const el = area.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    el?.focus();
    if (TIGHT.has(sym)) {
      write(`${value.slice(0, start)}${sym}${value.slice(end)}`, start + sym.length);
      return;
    }
    // Une seule espace de chaque côté, même si l'élève en a déjà tapé une.
    const before = value.slice(0, start).replace(/[ \t]+$/, '');
    const after = value.slice(end).replace(/^[ \t]+/, '');
    write(`${before} ${sym} ${after}`, before.length + sym.length + 2);
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white focus-within:border-blue-500" data-math-textarea>
      <textarea
        ref={area}
        value={value}
        onChange={(e) => write(e.target.value, e.target.selectionStart)}
        rows={rows}
        dir="rtl"
        aria-label={ariaLabel}
        placeholder={placeholder}
        className="block w-full resize-y border-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_1.95rem,#e2e8f0_1.95rem,#e2e8f0_2rem)] px-4 py-2 text-base leading-8 text-slate-900 focus:outline-none"
      />
      {/* UNE rangée défilante (au pouce sur téléphone) : la palette ne doit
          jamais pousser la zone d'écriture hors de l'écran. */}
      {groups.length > 0 && <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-200 bg-slate-50 px-3 py-2 [scrollbar-width:thin]" data-math-symbols>
        {groups.map((g, gi) => (
          // Pas d'étiquette de famille : la palette ne porte que quelques symboles, un trait les sépare.
          <React.Fragment key={g.id}>
            {gi > 0 && <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-slate-300" />}
            {g.symbols.map((s) => (
              <button key={s} type="button" onClick={() => insert(s)} aria-label={s}
                className="h-8 min-w-8 shrink-0 rounded-lg border border-slate-300 bg-white px-2 font-mono text-base text-slate-800 hover:border-blue-400 hover:bg-blue-50">
                {s}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>}
    </div>
  );
}
