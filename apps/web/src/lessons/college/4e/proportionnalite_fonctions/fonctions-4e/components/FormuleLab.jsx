import React from 'react';
import MathText from '../../../../../common/components/MathText';
import { formuleTex, testerFormule, tableau, frRat, programmeTexte } from './fonctions4e';
import { expr, texExpr } from '../../../../../common/algebra4e';

/**
 * FormuleLab — assembler l'écriture qui tient toute la chaîne, terme à terme.
 *
 * Activity               choisir le nombre devant l'entrée, puis le nombre
 *                        qu'on ajoute, et confronter l'écriture obtenue à la
 *                        chaîne sur TOUTES les entrées à la fois.
 * Mathematical objective la formule n'est pas une écriture de plus : c'est la
 *                        machine dite en une ligne. Elle doit s'accorder avec
 *                        la chaîne pour TOUTE entrée, pas pour celle qu'on a
 *                        essayée.
 * Student action         régler les deux nombres de l'écriture « a·x + b ».
 * Controlled variable    a et b, et eux seuls — la chaîne est fixe.
 * Mathematical state     (prog, a, b). L'accord, les couples qui démentent et
 *                        l'écriture LaTeX sont DÉRIVÉS par `testerFormule` et
 *                        `formuleTex` : aucun verdict n'est écrit à la main.
 * Visual consequence     la barre d'accord se remplit, et les entrées qui
 *                        démentent sont NOMMÉES, avec ce que chacune donne
 *                        des deux côtés.
 * Expected observation   « ma formule marche pour 2 mais pas pour 5 : ce
 *                        n'est donc pas la bonne ».
 * Misconception targeted valider une écriture sur une seule entrée ; croire
 *                        que « ×2 puis ×3 » s'écrit « 2x + 3 ».
 *
 * CE QUE CE LABO NE FAIT PAS : deviner la formule d'un tableau SANS machine
 * (M4 — ici la chaîne est visible), ni la dessiner (M5).
 *
 * SÉCURITÉ VISUELLE : tout en DOM. L'écriture passe par `texExpr`, seule
 * autorité du dépôt sur le moins typographique et le coefficient 1 qui
 * disparaît ; les couples qui démentent vivent dans une liste, jamais
 * superposés à quoi que ce soit.
 *
 * REJOUABLE : les réglages restent actifs même une fois la bonne écriture
 * trouvée — on doit pouvoir la « casser » pour voir ce qui change.
 */

export default function FormuleLab({
  prog,
  a,
  b,
  onA,
  onB,
  choixA = [1, 2, 3, 4, 5, 6],
  choixB = [-2, 0, 1, 2, 3, 5, 12],
  entreesTest = [0, 1, 2, 5, 10],
  variable = 'x',
}) {
  const candidate = expr(a, b);
  const couples = tableau(prog, entreesTest);
  const rapport = testerFormule(candidate, couples);
  const juste = rapport.valide;

  return (
    <div className="space-y-4" role="group" aria-label="Assembler la formule qui résume la chaîne">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">La chaîne dit : {programmeTexte(prog)}.</p>
      </div>

      {/* ── Les deux nombres de l'écriture ──────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-700">Le nombre DEVANT l’entrée</p>
          <div className="flex flex-wrap gap-2">
            {choixA.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onA(v)}
                aria-pressed={v === a}
                className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-3 py-2 font-mono text-sm font-bold tabular-nums transition-colors ${
                  v === a
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {frRat(v)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-700">Le nombre qu’on AJOUTE ensuite</p>
          <div className="flex flex-wrap gap-2">
            {choixB.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onB(v)}
                aria-pressed={v === b}
                className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-3 py-2 font-mono text-sm font-bold tabular-nums transition-colors ${
                  v === b
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                {frRat(v)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── L'écriture obtenue ──────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">Ton écriture</p>
        <p className="mt-1 text-2xl font-black text-sky-900">
          <MathText>{`$${texExpr(candidate, variable)}$`}</MathText>
        </p>
      </div>

      {/* ── L'épreuve : sur TOUTES les entrées à la fois ─────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-slate-700">Confrontée à la chaîne</p>
          <span className="font-mono text-sm font-black tabular-nums text-slate-700">
            {rapport.accord} / {rapport.total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ${juste ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${(rapport.accord / Math.max(1, rapport.total)) * 100}%` }}
          />
        </div>
        {juste ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">
            Accord sur les {rapport.total} entrées essayées. Cette écriture dit la même chose que la
            chaîne — pour n’importe quel nombre.
          </p>
        ) : (
          <>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              {rapport.accord === 0
                ? 'Aucune entrée ne donne le même résultat des deux côtés.'
                : `Ça marche pour ${rapport.accord} entrée${rapport.accord > 1 ? 's' : ''}, mais pas pour toutes — donc ce n’est pas la bonne écriture.`}
            </p>
            <ul className="space-y-1">
              {rapport.echecs.slice(0, 4).map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-[13px]">
                  <span className="text-slate-500">pour {frRat(e.x)}</span>
                  <span className="font-mono tabular-nums text-slate-700">
                    la chaîne rend <strong>{frRat(e.attendu)}</strong>, ton écriture{' '}
                    <strong>{frRat(e.obtenu)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

/** L'écriture attendue, exposée pour les tests et les corrections. */
export const formuleAttendueTex = (prog, variable = 'x') => formuleTex(prog, variable);
