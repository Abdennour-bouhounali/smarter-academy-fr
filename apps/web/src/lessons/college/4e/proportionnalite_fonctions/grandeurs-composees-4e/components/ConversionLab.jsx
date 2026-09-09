import React, { useId } from 'react';
import { fr, kmhVersMs } from './grandeurs4e';

/**
 * ConversionLab — km/h → m/s, PAR LE SENS.
 *
 * Activity               dérouler le raisonnement en trois temps sur une vitesse
 *                        qu'on choisit, et voir le « ÷ 3,6 » APPARAÎTRE à la
 *                        fin comme un résultat.
 * Mathematical objective 1 km/h, c'est 1000 mètres parcourus en 3600 secondes.
 *                        Changer d'unité, c'est dire ce que l'unité SIGNIFIE.
 *                        Le raccourci est la conséquence, jamais le départ.
 * Student action         glisser la vitesse, puis dévoiler l'étape suivante.
 * Controlled variable    la vitesse en km/h, et le niveau de dévoilement.
 * Mathematical state     une vitesse. Les trois étapes sont TOUTES calculées
 *                        par `kmhVersMs(v).etapes` — la leçon ne peut donc pas
 *                        afficher un raisonnement et un résultat qui divergent.
 * Visual consequence     les trois lignes se réécrivent ensemble à chaque cran.
 * Expected observation   « la troisième ligne donne toujours le même nombre que
 *                        la deuxième — donc diviser par 3,6, c'est juste plus
 *                        court ».
 * Misconception targeted appliquer « ÷ 3,6 » dans le mauvais sens. Le sens le
 *                        dit : en m/s, le nombre est forcément PLUS PETIT,
 *                        parce qu'une seconde est bien plus courte qu'une heure.
 *
 * SÉCURITÉ VISUELLE : trois lignes DOM en colonnes, aucun SVG, aucun nombre
 * superposable. Les grands nombres (jusqu'à 130 000 m) ont leur propre colonne
 * `tabular-nums`, donc la mise en page ne bouge pas d'un cran à l'autre.
 *
 * IDENTIFIANTS UNIQUES : ce labo est rendu PLUSIEURS FOIS dans un même module
 * (une fois par étape qui en a besoin). Un `id` écrit en dur y serait dupliqué,
 * et chaque <label for> pointerait alors vers la PREMIÈRE occurrence — le clic
 * sur le libellé de l'étape 3 déplacerait le curseur de l'étape 1. `useId`
 * donne à chaque instance son propre identifiant. Défaut trouvé au navigateur,
 * invisible en test unitaire.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. Les étapes se dévoilent,
 * elles ne se referment jamais, et le curseur reste vivant.
 */

/** Les bornes du curseur : de l'allure d'un piéton à celle d'une autoroute. */
export const BORNES_VITESSE = { min: 4, max: 130, pas: 1 };

/** Les trois temps du raisonnement, dans l'ordre où ils se dévoilent. */
export const ETAPES = [
  { id: 'metres', titre: '1. Combien de mètres ?' },
  { id: 'secondes', titre: '2. En combien de secondes ?' },
  { id: 'quotient', titre: '3. Donc combien par seconde ?' },
  { id: 'raccourci', titre: '4. Le raccourci qu’on vient de fabriquer' },
];

export default function ConversionLab({ v, onV, niveau = 1 }) {
  // Un identifiant par INSTANCE : le labo est rendu à plusieurs étapes.
  const uid = useId();
  const { valeur, etapes } = kmhVersMs(v);

  const Ligne = ({ titre, gauche, droite, accent = false }) => (
    <div className={`flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-3 py-2 ${
      accent ? 'bg-emerald-50' : 'bg-slate-50'
    }`}>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-slate-500">{titre}</p>
        <p className="font-mono text-sm text-slate-700">{gauche}</p>
      </div>
      <p className={`shrink-0 font-mono text-base font-black tabular-nums ${
        accent ? 'text-emerald-800' : 'text-slate-900'
      }`}>
        {droite}
      </p>
    </div>
  );

  return (
    <div className="space-y-4" role="group" aria-label="Convertir une vitesse de kilomètres par heure en mètres par seconde">
      {/* ── La vitesse de départ ─────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <label htmlFor={`${uid}-v`} className="flex items-baseline justify-between gap-2 text-sm font-bold text-slate-700">
          <span>Vitesse affichée</span>
          <span className="font-mono text-lg font-black tabular-nums text-emerald-700">
            {fr(v)} km/h
          </span>
        </label>
        <input
          id={`${uid}-v`}
          type="range"
          min={BORNES_VITESSE.min}
          max={BORNES_VITESSE.max}
          step={BORNES_VITESSE.pas}
          value={v}
          onChange={(e) => onV(Number(e.target.value))}
          className="sa-slider accent-emerald-600 w-full"
          role="slider"
          aria-valuemin={BORNES_VITESSE.min}
          aria-valuemax={BORNES_VITESSE.max}
          aria-valuenow={v}
          aria-valuetext={`${fr(v)} kilomètres par heure, soit ${fr(valeur)} mètres par seconde`}
        />
        <div className="flex justify-between text-[13px] text-slate-400 -mt-1">
          <span>{BORNES_VITESSE.min} km/h</span>
          <span>{BORNES_VITESSE.max} km/h</span>
        </div>
        <p className="text-[13px] text-slate-500">
          « {fr(v)} kilomètres par heure », c’est-à-dire {fr(v)} km parcourus en 1 h.
        </p>
      </div>

      {/* ── Le raisonnement, dévoilé pas à pas ───────────────────────── */}
      <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-4">
        {niveau >= 1 && (
          <Ligne
            titre={ETAPES[0].titre}
            gauche={`${fr(v)} km = ${fr(v)} × 1000 m`}
            droite={`${fr(etapes.metres)} m`}
          />
        )}
        {niveau >= 2 && (
          <Ligne
            titre={ETAPES[1].titre}
            gauche="1 h = 60 × 60 s"
            droite={`${fr(etapes.secondes)} s`}
          />
        )}
        {niveau >= 3 && (
          <Ligne
            titre={ETAPES[2].titre}
            gauche={`${fr(etapes.metres)} ÷ ${fr(etapes.secondes)}`}
            droite={`${fr(etapes.quotient)} m/s`}
            accent
          />
        )}
        {niveau >= 4 && (
          <>
            <Ligne
              titre={ETAPES[3].titre}
              gauche={`${fr(v)} ÷ 3,6`}
              droite={`${fr(etapes.raccourci)} m/s`}
            />
            <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900">
              1000 ÷ 3600 = 0,2777…, et diviser par ce nombre revient à diviser par 3,6.
              Le raccourci n’est pas une règle à croire : c’est ce raisonnement, déjà fait.
            </p>
          </>
        )}
        {niveau < 4 && (
          <p className="text-[13px] text-slate-400">
            {4 - niveau} étape{4 - niveau > 1 ? 's' : ''} encore à dévoiler.
          </p>
        )}
      </div>

      {/* ── Le verdict de sens : plus petit, forcément ───────────────── */}
      {niveau >= 3 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3.5 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">
            La même vitesse, dite deux fois
          </p>
          <p className="font-mono text-base font-black tabular-nums text-slate-900">
            {fr(v)} km/h = {fr(valeur)} m/s
          </p>
          <p className="mt-1 text-[13px] text-slate-600">
            Le nombre en m/s est {valeur < v ? 'plus petit' : 'plus grand'} : une seconde est
            bien plus courte qu’une heure, donc on parcourt bien moins de chemin.
          </p>
        </div>
      )}
    </div>
  );
}
