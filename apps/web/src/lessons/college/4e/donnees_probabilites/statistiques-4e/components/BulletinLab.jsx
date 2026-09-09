import React from 'react';
import { effectifTotal, moyenne, moyenneSimple, ecritureMoyennePonderee, fr } from './stats4e';

/**
 * BulletinLab — les coefficients d'un bulletin, saisissables un par un.
 *
 * Activity               régler le coefficient de chaque épreuve et voir la
 *                        moyenne se déplacer.
 * Mathematical objective une moyenne PONDÉRÉE est une moyenne où chaque
 *                        valeur compte autant de fois que son coefficient ;
 *                        la moyenne simple de 5e en est le cas particulier
 *                        « tous les coefficients valent 1 ».
 * Student action         glisser le coefficient d'une ligne (0 à 6).
 * Controlled variable    les coefficients. Les notes, elles, ne bougent
 *                        jamais : sans cela on ne saurait pas ce qui déplace
 *                        la moyenne.
 * Mathematical state     la série `BULLETIN`, modifiée par `changerPoids`.
 *                        La moyenne, l'effectif total et la ligne de calcul en
 *                        sont DÉRIVÉS.
 * Visual consequence     la barre de chaque épreuve s'épaissit avec son
 *                        coefficient, et l'aiguille de la moyenne se déplace
 *                        sur l'axe des notes.
 * Expected observation   « quand je mets tous les coefficients à 1, je
 *                        retombe exactement sur la moyenne de 5e ».
 * Misconception targeted oublier les coefficients — ici l'erreur fait passer
 *                        de l'autre côté de 12.
 *
 * SÉCURITÉ VISUELLE : aucun `<text>` dans le SVG. La note, le coefficient et
 * la barre vivent chacun dans leur colonne DOM ; une barre d'épaisseur nulle
 * (coefficient 0) reste une ligne visible, pas un vide qui laisserait croire
 * que l'épreuve a disparu.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
const NOTE_MAX = 20;

export default function BulletinLab({ serie, onPoids, poidsMax = 6, reference = null }) {
  const moy = moyenne(serie);
  const simple = moyenneSimple(serie);
  const total = effectifTotal(serie);
  const tousUn = serie.items.every((it) => it.poids === 1);

  return (
    <div className="space-y-3" role="group" aria-label="Bulletin : régler les coefficients et lire la moyenne">

      {/* ── LA MOYENNE, EN HAUT : c'est elle qu'on surveille ───────────── */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-violet-300 bg-violet-50/70 p-3">
          <p className="text-xs font-semibold text-violet-700">Moyenne avec ces coefficients</p>
          <p className="mt-1 font-mono text-3xl font-black tabular-nums text-violet-800" data-moyenne-ponderee>
            {fr(moy)}
          </p>
          <p className="mt-0.5 text-xs text-violet-600 tabular-nums">
            {total} {total > 1 ? 'parts' : 'part'} en tout
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500">Si les quatre notes comptaient pareil</p>
          <p className="mt-1 font-mono text-3xl font-black tabular-nums text-slate-700" data-moyenne-simple>
            {fr(simple)}
          </p>
          <p className={`mt-0.5 text-xs font-bold tabular-nums ${tousUn ? 'text-emerald-700' : 'text-amber-700'}`}>
            {tousUn ? 'les deux nombres coïncident' : `écart de ${fr(Math.abs(moy - simple))}`}
          </p>
        </div>
      </div>

      {/* ── LES QUATRE ÉPREUVES ─────────────────────────────────────────
          Chaque ligne : son nom, sa note, sa barre (épaisseur = coefficient),
          et son curseur. La barre est le SEUL dessin, et elle ne porte aucun
          texte : elle ne peut donc rien chevaucher. */}
      <div className="space-y-2">
        {serie.items.map((it, i) => (
          <div key={it.cle} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-bold text-slate-700">{it.libelle}</span>
              <span className="font-mono text-lg font-black tabular-nums text-slate-900">
                {fr(it.valeur, 0)}{serie.unite}
              </span>
            </div>

            {/* La barre : sa LONGUEUR dit la note, son ÉPAISSEUR le poids.
                Deux grandeurs, deux dimensions — jamais la même. */}
            <svg viewBox="0 0 400 26" className="mt-1.5 w-full" role="presentation" aria-hidden="true">
              <line x1={2} y1={13} x2={398} y2={13} stroke="#e2e8f0" strokeWidth="2" />
              <line
                x1={2}
                y1={13}
                x2={2 + (it.valeur / NOTE_MAX) * 396}
                y2={13}
                stroke={it.poids === 0 ? '#cbd5e1' : '#7c3aed'}
                strokeWidth={Math.max(2, it.poids * 3.6)}
                strokeLinecap="round"
              />
            </svg>

            <div className="mt-1.5 flex items-center gap-3">
              <label htmlFor={`bul-${it.cle}`} className="shrink-0 text-xs font-semibold text-slate-500">
                Coefficient
              </label>
              <input
                id={`bul-${it.cle}`}
                type="range"
                min={0}
                max={poidsMax}
                step={1}
                value={it.poids}
                onChange={(e) => onPoids(i, Number(e.target.value))}
                className="sa-slider accent-violet-600 min-h-[44px] w-full"
                role="slider"
                aria-valuemin={0}
                aria-valuemax={poidsMax}
                aria-valuenow={it.poids}
                aria-valuetext={`${it.libelle}, coefficient ${it.poids}`}
              />
              <span className="w-7 shrink-0 text-center font-mono text-lg font-black tabular-nums text-violet-700">
                {it.poids}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── LE CALCUL, ÉCRIT COMME AU TABLEAU ───────────────────────────
          Il vient du noyau (`ecritureMoyennePonderee`) : la ligne affichée ne
          peut pas diverger de la moyenne annoncée. */}
      <div className="overflow-x-auto rounded-2xl bg-slate-900 px-3 py-2.5">
        <p className="whitespace-nowrap font-mono text-sm text-slate-100" data-calcul>
          {ecritureMoyennePonderee(serie)}
        </p>
      </div>

      {reference !== null && (
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 tabular-nums">
          Bulletin d’origine du collège : {reference}
        </p>
      )}
    </div>
  );
}
