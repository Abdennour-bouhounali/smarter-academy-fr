import React from 'react';
import { trinomialSign, roots, fr } from './signeProblemesUtils';

/**
 * TableauSignes — le tableau de signes d'un TRINÔME, rendu ET saisi.
 *
 * ADAPTÉ, pas importé, du tableau de 2de (`signe-fonctions-2nde/components/
 * SignTable.jsx`). Une leçon n'importe jamais un composant d'une autre leçon :
 * elle copie et adapte. Les différences sont réelles et voulues —
 *   · l'objet est un TRINÔME (a, b, c), pas une fonction quelconque à zéros
 *     déclarés : les colonnes sont DÉRIVÉES de `trinomialSign`, jamais saisies ;
 *   · pas de valeur interdite, donc pas de double barre : un trinôme est défini
 *     sur ℝ tout entier ;
 *   · pas de ligne de facteurs : ce n'est pas un produit d'affines qu'on
 *     décompose, c'est une règle globale (« du signe de a, sauf entre les
 *     racines ») ;
 *   · le nombre de colonnes change avec Δ — 1, 2 ou 3 — et le composant le lit
 *     du modèle plutôt que de le supposer.
 *
 * Lecture seule : chaque case porte son signe, écrit — jamais une couleur
 * seule. Mode saisie (`editable`) : les cases de signe sont des boutons qui
 * cyclent + / − ; les zéros sont FIXÉS, ils viennent de la mathématique.
 * `reveal` colore d'après le tableau exact, et affiche la bonne réponse dans
 * la case fautive.
 */
const SIGNE_TEXTE = { 1: '+', 0: '0', '-1': '−' };
const LIBELLE = { 1: 'positif', 0: 'nul', '-1': 'négatif' };

/** Les colonnes de SIGNE (celles qui ne sont pas un zéro ponctuel). */
export function colonnesDe(a, b, c) {
  return trinomialSign(a, b, c).filter((cell) => cell.sign !== 0);
}

export default function TableauSignes({
  a, b, c,
  label = null,
  editable = false,
  /** Les choix de l'élève, un par colonne de signe : '+' | '−' | null. */
  values = null,
  onChange = null,
  reveal = false,
  caption = null,
}) {
  const cellules = trinomialSign(a, b, c);
  const colonnes = cellules.filter((cell) => cell.sign !== 0);
  const rs = roots(a, b, c);
  // Les bornes affichées en tête : −∞, chaque racine, +∞.
  const bornes = [null, ...rs, null];

  const bouton = (i) => {
    const vrai = SIGNE_TEXTE[colonnes[i].sign];
    const v = values ? values[i] : null;
    const ok = reveal && v === vrai;
    const ko = reveal && v !== null && v !== vrai;
    return (
      <button
        type="button"
        disabled={!editable || reveal}
        aria-label={`Signe sur l’intervalle ${i + 1}${v ? ` : ${LIBELLE[v === '+' ? 1 : -1]}` : ''}`}
        onClick={() => onChange?.(i, v === '+' ? '−' : '+')}
        className={`min-w-[44px] min-h-[44px] rounded-lg border-2 font-mono font-bold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          ok ? 'bg-emerald-600 border-emerald-700 text-white'
            : ko ? 'bg-rose-600 border-rose-700 text-white'
            : v ? 'bg-slate-800 border-slate-900 text-white'
            : 'bg-white border-dashed border-slate-400 text-slate-400'
        }`}
      >
        {v ?? '?'}{ko ? ` → ${vrai}` : ''}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white" data-testid="tableau-signes">
      <table className="w-full text-sm">
        {caption && <caption className="text-xs text-slate-500 py-1.5">{caption}</caption>}
        <thead>
          <tr className="bg-slate-50 text-slate-600">
            <th scope="row" className="px-2 py-2 text-left font-mono font-bold">x</th>
            {bornes.map((v, j) => (
              <React.Fragment key={j}>
                <td className="px-1 py-2 text-center font-mono font-bold tabular-nums whitespace-nowrap">
                  {v === null ? (j === 0 ? '−∞' : '+∞') : fr(v)}
                </td>
                {j < bornes.length - 1 && <td className="px-1 py-2" />}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200">
            <th scope="row" className="px-2 py-2 text-left font-mono text-sm font-bold text-slate-700 whitespace-nowrap">
              {label ?? 'f(x)'}
            </th>
            {/* Alternance : une case de borne (vide ou « 0 »), puis une case de
                signe, autant de fois qu'il y a de colonnes. */}
            {Array.from({ length: 2 * colonnes.length + 1 }).map((_, k) => {
              if (k % 2 === 1) {
                const i = (k - 1) / 2;
                return (
                  <td key={k} className="px-1 py-1 text-center">
                    {editable || reveal ? bouton(i) : (
                      <span className={`inline-block min-w-[44px] py-1.5 rounded-lg font-mono font-bold text-lg ${
                        colonnes[i].sign === 1 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {SIGNE_TEXTE[colonnes[i].sign]}
                      </span>
                    )}
                  </td>
                );
              }
              const j = k / 2;
              // Un zéro sous une racine — jamais aux extrémités infinies.
              const estRacine = j > 0 && j <= rs.length;
              return (
                <td key={k} className="px-0.5 py-1 text-center w-6">
                  {estRacine ? <span className="font-mono font-bold text-amber-700 text-lg">0</span> : ''}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      {/* La lecture en toutes lettres : une couleur ne porte jamais seule le
          sens, et un lecteur d'écran doit pouvoir dire le tableau. */}
      <p className="sr-only">
        {cellules.map((cell, i) => {
          const de = cell.from === null ? 'moins l’infini' : fr(cell.from);
          const a2 = cell.to === null ? 'plus l’infini' : fr(cell.to);
          return cell.sign === 0
            ? `En ${de}, le trinôme est nul. `
            : `De ${de} à ${a2}, le trinôme est ${LIBELLE[cell.sign]}. `;
        }).join('')}
      </p>
    </div>
  );
}
