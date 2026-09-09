import React from 'react';
import { trace, tableau, frRat, tableauDecimal, OP_LABEL } from './fonctions4e';

/**
 * MachineLab — la même chaîne, nourrie de PLUSIEURS entrées à la fois.
 *
 * Activity               choisir les nombres qu'on fait entrer, et voir la
 *                        colonne des sorties se remplir toute seule.
 * Mathematical objective un programme n'est pas attaché à une valeur : la
 *                        MÊME chaîne répond à toutes les entrées, et une même
 *                        entrée redonne toujours la même sortie (acquis de 5e,
 *                        ici rejoué sur une chaîne qu'on a construite).
 * Student action         ajouter ou retirer une entrée ; ouvrir la trace
 *                        détaillée d'une ligne pour revoir la descente.
 * Controlled variable    l'ensemble des entrées essayées.
 * Mathematical state     (prog, entrées). La colonne des sorties est
 *                        entièrement CALCULÉE par `tableau` — aucune valeur
 *                        n'est écrite à la main dans ce fichier.
 * Visual consequence     la ligne apparaît instantanément, avec sa sortie
 *                        exacte ; la ligne dépliée montre les valeurs
 *                        intermédiaires.
 * Expected observation   « je n'ai pas besoin de refaire le calcul à chaque
 *                        fois : c'est toujours la même chaîne ».
 * Misconception targeted croire qu'un programme « ne marche » que sur les
 *                        nombres avec lesquels on l'a vu tourner — d'où les
 *                        entrées NÉGATIVES et le zéro, proposés d'emblée.
 *
 * CE QUE CE LABO NE FAIT PAS : produire la formule (M3), remonter de la
 * table vers une règle inconnue (M4), placer les points (M5).
 *
 * SÉCURITÉ VISUELLE : une vraie <table> dans un conteneur `overflow-x-auto`.
 * Aucun SVG, aucune valeur en position absolue. Les sorties passent par
 * `frRat` : une fraction s'affiche comme fraction, jamais comme 0,333.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */

export default function MachineLab({
  prog,
  entrees,
  onEntrees,
  candidats = [0, 1, 2, 3, 4, 5, 10, -1, -2],
  ouverte = null,
  onOuvrir,
  entreeNom = 'entrée',
  sortieNom = 'sortie',
}) {
  const lignes = tableau(prog, entrees);
  const toutJuste = lignes.length > 0 && tableauDecimal(lignes);

  const basculer = (v) =>
    onEntrees(entrees.includes(v) ? entrees.filter((e) => e !== v) : [...entrees, v].sort((a, b) => a - b));

  const detail = ouverte != null && entrees.includes(ouverte) ? trace(prog, ouverte) : null;

  return (
    <div className="space-y-4" role="group" aria-label="Nourrir la chaîne de plusieurs entrées">
      {/* ── Les nombres qu'on peut faire entrer ─────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="text-sm font-bold text-slate-700">Quels nombres fais-tu entrer ?</p>
        <div className="flex flex-wrap gap-2">
          {candidats.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => basculer(v)}
              aria-pressed={entrees.includes(v)}
              className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-3 py-2 font-mono text-sm font-bold tabular-nums transition-colors ${
                entrees.includes(v)
                  ? 'border-violet-500 bg-violet-50 text-violet-900'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              {frRat(v)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Le tableau, rempli par la chaîne ────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-bold text-slate-700">Ce que la chaîne rend</p>
        {lignes.length === 0 ? (
          <p className="text-xs text-slate-400">Choisis au moins un nombre à faire entrer.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {entreeNom}
                  </th>
                  {lignes.map((c, i) => (
                    <td key={`x${i}`} className="px-2 py-1.5 text-right font-mono font-bold text-slate-700">
                      {frRat(c.x)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {sortieNom}
                  </th>
                  {lignes.map((c, i) => (
                    <td key={`y${i}`} className="px-2 py-1.5 text-right font-mono font-black text-violet-800">
                      {frRat(c.y)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {lignes.length > 0 && !toutJuste && (
          <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
            Certaines sorties ne tombent pas juste : elles s’écrivent en fraction, et c’est la
            valeur EXACTE.
          </p>
        )}
      </div>

      {/* ── La descente détaillée d'une ligne ───────────────────────── */}
      {onOuvrir && lignes.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
          <p className="text-sm font-bold text-slate-700">Revoir la descente, pour un nombre</p>
          <div className="flex flex-wrap gap-2">
            {entrees.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onOuvrir(ouverte === v ? null : v)}
                aria-pressed={ouverte === v}
                className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-3 py-2 font-mono text-sm font-bold tabular-nums transition-colors ${
                  ouverte === v
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {frRat(v)}
              </button>
            ))}
          </div>
          {detail && (
            <ul className="space-y-1">
              <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                <span className="text-slate-500">on part de</span>
                <span className="font-mono font-bold tabular-nums text-slate-800">{frRat(detail.depart)}</span>
              </li>
              {detail.etapes.map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-sm">
                  <span className="text-slate-500">
                    {OP_LABEL[e.op]} {frRat(e.val)}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-slate-800">{frRat(e.apres)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
