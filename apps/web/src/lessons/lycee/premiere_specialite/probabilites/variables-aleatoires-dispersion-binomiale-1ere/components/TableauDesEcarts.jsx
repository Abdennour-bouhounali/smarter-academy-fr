import React from 'react';
import { fr, euros } from './dispersionUtils';

/**
 * TableauDesEcarts — le tableau que l'élève REMPLIT mentalement au module 2,
 * colonne après colonne, et que les modules suivants relisent.
 *
 * Ce n'est pas un tableau décoratif : les colonnes se RÉVÈLENT une par une
 * (`colonnes`), dans l'ordre exact où le module les fait construire. Montrer
 * d'emblée la colonne des contributions donnerait la réponse avant la question,
 * et le module 2 ne construirait plus rien.
 *
 * TOUT EST DÉRIVÉ de `detailVariance` : aucune valeur n'est écrite à la main
 * dans un module. Le total affiché est celui que le modèle calcule, jamais un
 * littéral recopié.
 *
 * TABLEAU HTML, PAS SVG. Cinq colonnes de nombres dans un `<text>` SVG se
 * chevaucheraient dès que les valeurs s'allongent (324 contre 1) ; un tableau
 * HTML se remet en page tout seul, défile horizontalement sous 375 px, et reste
 * lisible par un lecteur d'écran.
 */

const EN_TETES = {
  ecart: <>x<sub>i</sub> − E(X)</>,
  carre: <>(x<sub>i</sub> − E(X))²</>,
  contribution: <>p<sub>i</sub> × (x<sub>i</sub> − E(X))²</>,
};

export default function TableauDesEcarts({
  detail,
  titre = 'Écarts à la moyenne',
  colonnes = ['ecart'],          // sous-ensemble ordonné de EN_TETES
  accent = '#7c3aed',
  total = null,                  // la somme des contributions, quand le module la révèle
  unite = '€',
}) {
  const valeur = (v) => (unite === '€' ? euros(v) : fr(v));

  return (
    <div className="space-y-1">
      <div className="overflow-x-auto rounded-xl border-2 bg-white" style={{ borderColor: accent }}>
        <table className="w-full text-center text-sm">
          <caption className="sr-only">{titre}</caption>
          <thead>
            <tr className="bg-slate-50 text-slate-700">
              <th scope="col" className="px-3 py-2 text-left font-semibold whitespace-nowrap">gain x<sub>i</sub></th>
              <th scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">p<sub>i</sub></th>
              {colonnes.map((c) => (
                <th key={c} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">{EN_TETES[c]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detail.map((l) => (
              <tr key={l.x} className="border-t border-slate-200">
                <th scope="row" className="px-3 py-2 text-left font-mono font-bold tabular-nums whitespace-nowrap text-slate-900">
                  {valeur(l.x)}
                </th>
                <td className="px-3 py-2 font-mono tabular-nums whitespace-nowrap text-slate-700">
                  {Number.isInteger(l.n) ? `${l.n}/${l.total}` : fr(l.p)}
                </td>
                {colonnes.map((c) => (
                  <td
                    key={c}
                    className="px-3 py-2 font-mono tabular-nums whitespace-nowrap"
                    style={c === 'contribution' ? { color: accent, fontWeight: 700 } : undefined}
                  >
                    {fr(l[c], { maxDecimals: 4 })}
                  </td>
                ))}
              </tr>
            ))}
            {total !== null && (
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-700 whitespace-nowrap" colSpan={2 + colonnes.length - 1}>
                  somme des contributions
                </th>
                <td className="px-3 py-2 font-mono font-black tabular-nums" style={{ color: accent }}>
                  {fr(total, { maxDecimals: 4 })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[13px] text-slate-400">{titre}</p>
    </div>
  );
}
