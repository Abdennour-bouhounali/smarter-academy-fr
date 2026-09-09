import React, { useMemo, useState } from 'react';
import SolidTurner from '../../../../../common/components/SolidTurner';
import {
  makePyramide, makePrismeCarre, aireBaseCarree,
  volumePyramide, volumePrisme, versements, vol, fr, arrondi, DIMENSIONS,
} from './espace4e';

/**
 * RemplissageLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * Activity              régler la base et la hauteur de DEUX solides jumeaux
 *                       (un prisme, une pyramide), les tourner à la main,
 *                       puis VERSER la pyramide dans le prisme.
 * Mathematical objective le volume d'une pyramide est le TIERS de celui du
 *                       prisme de même base et même hauteur — et ce nombre ne
 *                       dépend ni de la base, ni de la hauteur.
 * Student action        régler deux curseurs, faire tourner les solides,
 *                       cliquer « verser ».
 * Controlled variable   le côté de la base et la hauteur — communs aux deux
 *                       solides, par construction : ils restent jumeaux.
 * Mathematical state    { cote, hauteur, versés } ; les volumes, la jauge et
 *                       le compte sont TOUS calculés par le noyau.
 * Visual consequence    la jauge du prisme monte d'un tiers à chaque verse,
 *                       et déborde exactement au troisième.
 * Expected observation  « il en faut trois — et ça ne change pas quand je
 *                       change les dimensions ».
 * Misconception targeted croire que le rapport dépend de la forme, ou qu'une
 *                       pyramide « c'est la moitié ».
 *
 * SÉCURITÉ VISUELLE : les deux solides sont rendus par `SolidTurner`, dont le
 * cadre est fixe et les arêtes cachées CALCULÉES. Les volumes et la jauge sont
 * du DOM — aucun texte SVG, donc aucun chevauchement possible.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement ; « vider » remet à zéro et
 * changer une dimension aussi (les deux solides ne seraient plus jumeaux).
 */
export default function RemplissageLab({
  cote, hauteur, onCote, onHauteur,
  verses, onVerser, onVider,
  yaw, pitch, onYaw, onPitch,
}) {
  const pyramide = useMemo(() => makePyramide(cote * 9, hauteur * 9), [cote, hauteur]);
  const prisme = useMemo(() => makePrismeCarre(cote * 9, hauteur * 9), [cote, hauteur]);

  const aireBase = aireBaseCarree(cote);
  const vPyr = volumePyramide(aireBase, hauteur);
  const vPri = volumePrisme(aireBase, hauteur);
  const necessaires = versements(aireBase, hauteur).nombre;

  const rempli = Math.min(1, (verses * vPyr) / vPri);
  const plein = verses * vPyr >= vPri - 1e-9;
  const deborde = verses * vPyr > vPri + 1e-9;

  return (
    <div className="space-y-4" role="group" aria-label="Prisme et pyramide de même base et même hauteur">
      {/* Les deux solides, côte à côte, à la même échelle. */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
          <p className="mb-1 text-center text-xs font-bold text-slate-600">La pyramide</p>
          <SolidTurner
            solid={pyramide}
            yaw={yaw}
            pitch={pitch}
            onYawChange={onYaw}
            onPitchChange={onPitch}
            ariaLabel={`Pyramide à base carrée de ${cote} cm de côté et ${hauteur} cm de hauteur`}
          />
          <p className="mt-1 text-center font-mono text-sm font-black text-slate-900">
            {vol(vPyr)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
          <p className="mb-1 text-center text-xs font-bold text-slate-600">Le prisme</p>
          <SolidTurner
            solid={prisme}
            yaw={yaw}
            pitch={pitch}
            onYawChange={onYaw}
            onPitchChange={onPitch}
            ariaLabel={`Prisme droit à base carrée de ${cote} cm de côté et ${hauteur} cm de hauteur`}
          />
          <p className="mt-1 text-center font-mono text-sm font-black text-slate-900">
            {vol(vPri)}
          </p>
        </div>
      </div>

      {/* Les deux réglages — communs aux deux solides. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { id: 'cote', label: 'Côté de la base', valeur: cote, set: onCote, min: DIMENSIONS.coteMin, max: DIMENSIONS.coteMax, unite: 'cm' },
          { id: 'hauteur', label: 'Hauteur', valeur: hauteur, set: onHauteur, min: DIMENSIONS.hauteurMin, max: DIMENSIONS.hauteurMax, unite: 'cm' },
        ].map((r) => (
          <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
            <label htmlFor={`rl-${r.id}`} className="flex items-baseline justify-between text-xs font-bold text-slate-600">
              {r.label}
              <span className="font-mono text-base font-black text-slate-900">{r.valeur} {r.unite}</span>
            </label>
            <input
              id={`rl-${r.id}`}
              type="range"
              min={r.min}
              max={r.max}
              step={1}
              value={r.valeur}
              onChange={(e) => r.set(Number(e.target.value))}
              className="sa-slider accent-indigo-600 mt-1 w-full"
              aria-valuetext={`${r.label} : ${r.valeur} ${r.unite}`}
            />
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">
        Les deux solides ont TOUJOURS la même base et la même hauteur.
      </p>

      {/* La jauge de remplissage du prisme. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-slate-700">Le prisme, rempli</span>
          <span className="font-mono text-sm tabular-nums text-slate-600">
            {vol(arrondi(Math.min(verses * vPyr, vPri), 1))} / {vol(vPri)}
          </span>
        </div>
        <div className="h-8 w-full overflow-hidden rounded-xl bg-slate-100">
          <div
            className={`h-full transition-[width] duration-300 ${deborde ? 'bg-amber-500' : plein ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${rempli * 100}%` }}
          />
        </div>
        <p className="text-center text-sm font-semibold text-slate-700">
          {verses === 0
            ? 'Le prisme est vide.'
            : `${verses} versement${verses > 1 ? 's' : ''} — ${plein ? 'il est plein !' : 'il en manque encore.'}`}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onVerser}
          className="min-h-[44px] flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Verser une pyramide
        </button>
        <button
          type="button"
          onClick={onVider}
          className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
        >
          ↺ Vider
        </button>
      </div>

      {plein && (
        <p className={`rounded-xl px-3 py-2 text-center text-sm font-semibold ${
          Math.abs(verses - necessaires) < 1e-9 ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
        }`}>
          {Math.abs(verses - necessaires) < 1e-9
            ? `Exactement ${fr(necessaires, 0)} versements, sans une goutte de trop.`
            : `Il a fallu ${verses} versements, et le prisme déborde.`}
        </p>
      )}
    </div>
  );
}
