import React from 'react';
import DotPlot from '../../../../../common/stats/DotPlot';
import { valeurs, comparer, extremes, avecUnite, ecart } from './stats4e';

/**
 * ComparaisonLab — deux séries l'une sous l'autre, à la MÊME échelle, et les
 * trois résumés confrontés ligne à ligne.
 *
 * Activity               dévoiler un résumé après l'autre et constater
 *                        lesquels distinguent les deux séries.
 * Mathematical objective comparer deux séries, ce n'est pas désigner « la
 *                        meilleure » : c'est constater quel résumé les
 *                        SÉPARE, et lequel est aveugle. Deux paires construites
 *                        en miroir interdisent la conclusion paresseuse.
 * Student action         révéler les résumés un à un, dans l'ordre choisi.
 * Controlled variable    l'ensemble des résumés dévoilés.
 * Mathematical state     les deux séries ; le verdict vient de `comparer`,
 *                        jamais d'une phrase saisie par le module.
 * Visual consequence     la ligne du tableau se remplit, et l'égalité ou
 *                        l'écart s'affiche.
 * Expected observation   « celui qui les séparait la fois d'avant ne voit
 *                        plus rien du tout ».
 *
 * POURQUOI LA MÊME ÉCHELLE POUR LES DEUX NUAGES. Deux axes ajustés chacun à
 * leur série feraient paraître identiques deux dispersions très différentes :
 * la figure contredirait alors la leçon (§28bis). Le domaine est donc calculé
 * sur la RÉUNION des deux séries, et il est passé aux deux DotPlot.
 *
 * PÉRIMÈTRE : `showQuartiles` de DotPlot n'est JAMAIS activé — les quartiles
 * sont un objet de 3e, et le noyau `stats4e` ne les expose même pas.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement ; les résumés se replient
 * et se redéploient à volonté.
 */

/** Les trois lignes du tableau, dans l'ordre de dévoilement. */
export const LIGNES = [
  { cle: 'moyenne', nom: 'Moyenne', aide: 'Si on partageait tout également.' },
  { cle: 'mediane', nom: 'Médiane', aide: 'La valeur qui coupe le groupe en deux moitiés.' },
  { cle: 'etendue', nom: 'Étendue', aide: 'L’écart entre la plus grande et la plus petite valeur.' },
];

/**
 * Les classes sont ÉCRITES EN TOUTES LETTRES, jamais composées à la volée :
 * une classe construite par interpolation (`border-${x}-200`) n'existe pas
 * dans la feuille produite par Tailwind, et la bordure disparaîtrait
 * silencieusement.
 */
const TEINTES = {
  sky: { cadre: 'border-sky-200 bg-sky-50/40', titre: 'text-sky-800' },
  rose: { cadre: 'border-rose-200 bg-rose-50/40', titre: 'text-rose-800' },
  emerald: { cadre: 'border-emerald-200 bg-emerald-50/40', titre: 'text-emerald-800' },
  violet: { cadre: 'border-violet-200 bg-violet-50/40', titre: 'text-violet-800' },
};

export default function ComparaisonLab({
  serieA,
  serieB,
  devoiles = [],
  onDevoiler,
  couleurs = { a: 'sky', b: 'rose' },
}) {
  const cmp = comparer(serieA, serieB);
  const toutes = [...valeurs(serieA), ...valeurs(serieB)];
  // Le domaine COMMUN : une marge d'un cran de chaque côté pour que les
  // pastilles des extrêmes ne soient jamais coupées par le bord du cadre.
  const domaine = { min: Math.min(...toutes) - 1, max: Math.max(...toutes) + 1 };

  const bloc = (s, teinte) => {
    const ex = extremes(s);
    const th = TEINTES[teinte] ?? TEINTES.sky;
    return (
      <div className={`rounded-2xl border-2 p-3 ${th.cadre}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={`text-sm font-black ${th.titre}`}>{s.nom}</p>
          <p className="text-xs tabular-nums text-slate-500">
            {valeurs(s).length} valeurs · de {avecUnite(ex.min, s.unite)} à {avecUnite(ex.max, s.unite)}
          </p>
        </div>
        <DotPlot
          values={valeurs(s)}
          domain={domaine}
          unit={s.unite}
          label={s.nom}
          height={150}
        />
      </div>
    );
  };

  return (
    <div className="space-y-3" role="group" aria-label={`Comparer ${serieA.nom} et ${serieB.nom}`}>
      {bloc(serieA, couleurs.a)}
      {bloc(serieB, couleurs.b)}

      {/* ── LES BOUTONS DE DÉVOILEMENT ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {LIGNES.map((l) => {
          const on = devoiles.includes(l.cle);
          return (
            <button
              key={l.cle}
              type="button"
              onClick={() => onDevoiler(l.cle)}
              aria-pressed={on}
              className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-colors ${
                on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              {on ? '✓ ' : ''}{l.nom}
            </button>
          );
        })}
      </div>

      {/* ── LE TABLEAU DE CONFRONTATION ────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th scope="col" className="px-3 py-2 text-left">Résumé</th>
              <th scope="col" className="px-3 py-2 text-right">{serieA.nom}</th>
              <th scope="col" className="px-3 py-2 text-right">{serieB.nom}</th>
              <th scope="col" className="px-3 py-2 text-right">Écart</th>
            </tr>
          </thead>
          <tbody>
            {LIGNES.map((l) => {
              const d = cmp.details.find((x) => x.indicateur === l.cle);
              const on = devoiles.includes(l.cle);
              return (
                <tr key={l.cle} data-ligne={l.cle} className="border-b border-slate-100 last:border-0">
                  <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600">{l.nom}</th>
                  {on ? (
                    <>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{avecUnite(d.a, serieA.unite)}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{avecUnite(d.b, serieB.unite)}</td>
                      <td className={`px-3 py-2 text-right font-mono font-black ${d.egal ? 'text-slate-400' : 'text-amber-700'}`}>
                        {d.egal ? 'aucun' : ecart(d.ecart)}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="px-3 py-2 text-right text-xs text-slate-300">caché — touche le bouton</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Le verdict n'apparaît qu'une fois les TROIS lignes dévoilées : le
          dire plus tôt reviendrait à conclure avant d'avoir regardé. */}
      {devoiles.length === LIGNES.length && (
        <p data-verdict className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-100">
          Sur ces deux séries, {cmp.verdict}.
        </p>
      )}
    </div>
  );
}
