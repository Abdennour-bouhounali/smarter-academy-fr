import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { testerFormule, frRat } from './fonctions4e';
import { expr, texExpr } from '../../../../../common/algebra4e';

/**
 * TesteurDeFormule — des couples, SANS machine pour les expliquer.
 *
 * Activity               essayer une écriture candidate sur un tableau dont
 *                        on ne connaît pas la chaîne, et lire le rapport
 *                        qu'elle produit.
 * Mathematical objective une candidate ne se juge pas sur UN couple mais sur
 *                        TOUS. Un accord partiel est une réfutation, pas un
 *                        demi-succès.
 * Student action         sélectionner une candidate dans la liste ; la
 *                        rejouer autant de fois qu'on veut.
 * Controlled variable    la candidate choisie.
 * Mathematical state     (couples, candidate). Le rapport — accord, total, et
 *                        surtout la LISTE NOMMÉE des couples qui démentent —
 *                        est calculé par `testerFormule`, jamais rédigé.
 * Visual consequence     chaque ligne du tableau reçoit sa marque : ce que la
 *                        candidate rend, et si cela colle.
 * Expected observation   « celle-là tombe juste pour 1 et pour 2, et rate
 *                        pour 5 : elle est éliminée ».
 * Misconception targeted valider une règle sur le premier couple venu — le
 *                        piège que ce module tend délibérément, avec une
 *                        candidate qui marche pour DEUX couples sur quatre.
 *
 * CE QUE CE LABO NE FAIT PAS : révéler la chaîne (il n'y en a pas ici — c'est
 * tout l'intérêt), ni dessiner (M5).
 *
 * SÉCURITÉ VISUELLE : une <table> DOM en `overflow-x-auto`, une colonne par
 * couple, les marques dans leur propre ligne. Aucun SVG.
 *
 * REJOUABLE : on peut réessayer une candidate déjà éliminée — c'est même la
 * façon de vérifier qu'on a compris pourquoi elle l'était.
 */

export default function TesteurDeFormule({
  couples,
  candidates,
  choisie,
  onChoisir,
  variable = 'x',
  entreeNom = 'entrée',
  sortieNom = 'sortie',
}) {
  const cand = choisie != null ? candidates[choisie] : null;
  const f = cand ? expr(cand.a, cand.b) : null;
  const rapport = f ? testerFormule(f, couples) : null;

  // Ce que la candidate rend pour chaque couple : dérivé du même rapport, et
  // non recalculé — un seul chemin de vérité par écran.
  const echecsParX = new Set((rapport?.echecs ?? []).map((e) => frRat(e.x)));

  return (
    <div className="space-y-4" role="group" aria-label="Tester une écriture sur un tableau de couples">
      {/* ── Le tableau, seul indice ─────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-bold text-slate-700">Le tableau, sans sa machine</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <tbody>
              <tr className="border-b border-slate-100">
                <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {entreeNom}
                </th>
                {couples.map((c, i) => (
                  <td key={`x${i}`} className="px-2 py-1.5 text-right font-mono font-bold text-slate-700">
                    {frRat(c.x)}
                  </td>
                ))}
              </tr>
              <tr className={rapport ? 'border-b border-slate-100' : ''}>
                <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {sortieNom}
                </th>
                {couples.map((c, i) => (
                  <td key={`y${i}`} className="px-2 py-1.5 text-right font-mono font-black text-emerald-800">
                    {frRat(c.y)}
                  </td>
                ))}
              </tr>
              {rapport && (
                <tr>
                  <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    ta règle
                  </th>
                  {couples.map((c, i) => (
                    <td
                      key={`v${i}`}
                      className={`px-2 py-1.5 text-right font-mono font-bold ${
                        echecsParX.has(frRat(c.x)) ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {echecsParX.has(frRat(c.x)) ? '✗' : '✓'}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Les candidates ──────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">Quelle écriture proposes-tu ?</p>
        <div className="flex flex-wrap gap-2">
          {candidates.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChoisir(choisie === i ? null : i)}
              aria-pressed={choisie === i}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-base font-bold transition-colors ${
                choisie === i
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <MathText>{`$${texExpr(expr(c.a, c.b), variable)}$`}</MathText>
            </button>
          ))}
        </div>
      </div>

      {/* ── Le rapport, qui NOMME les couples qui démentent ─────────── */}
      {rapport && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-bold text-slate-700">Le verdict</p>
            <span className="font-mono text-sm font-black tabular-nums text-slate-700">
              {rapport.accord} / {rapport.total}
            </span>
          </div>
          {rapport.valide ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
              Elle explique TOUS les couples du tableau. C’est la règle.
            </p>
          ) : (
            <>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                {rapport.accord === 0
                  ? 'Elle ne colle avec aucun couple.'
                  : `Elle colle avec ${rapport.accord} couple${rapport.accord > 1 ? 's' : ''} sur ${rapport.total} — et ça ne suffit pas. Voici ceux qui la démentent :`}
              </p>
              <ul className="space-y-1">
                {rapport.echecs.map((e, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-[13px]">
                    <span className="text-slate-500">pour {frRat(e.x)}</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      le tableau dit <strong>{frRat(e.attendu)}</strong>, ta règle dit{' '}
                      <strong>{frRat(e.obtenu)}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
