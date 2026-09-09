import React from 'react';
import { GRANDEURS } from './grandeurs4e';

/**
 * UnitesLab — le trieur d'unités composées.
 *
 * Activity               ranger cinq étiquettes d'unités dans deux bacs : celles
 *                        qui se lisent « par », celles qui se lisent « fois ».
 * Mathematical objective une unité composée n'est pas un symbole à reconnaître :
 *                        c'est une PHRASE. « km/h » se lit « des kilomètres par
 *                        heure » ; « kWh » se lit « des kilowatts fois des
 *                        heures ». La lecture décide, la barre ne décide pas.
 * Student action         taper une étiquette, puis taper un bac.
 * Controlled variable    l'affectation de chaque étiquette.
 * Mathematical state     un dictionnaire étiquette → bac. Les bonnes réponses
 *                        viennent de `GRANDEURS[…].kind`, jamais d'une liste
 *                        écrite à la main.
 * Visual consequence     l'étiquette rejoint son bac, et sa LECTURE apparaît.
 * Expected observation   « il suffit de la dire à voix haute pour savoir ».
 * Misconception targeted trier sur le symbole (« il y a une barre, donc c'est un
 *                        quotient ») au lieu de trier sur le sens — d'où
 *                        « ouvriers·jours », qui n'a pas de barre et n'est PAS
 *                        un quotient, et « g/cm³ », qui en a une et EN est un.
 *
 * NON BLOQUANT : une étiquette mal rangée n'est jamais refusée. Elle se pose,
 * sa lecture s'affiche, et l'élève voit lui-même que la phrase ne colle pas.
 * Il peut la déplacer autant de fois qu'il veut — aucun `disabled`.
 */

/** Les cinq étiquettes à trier, dans un ordre qui MÉLANGE les deux familles. */
export const ETIQUETTES = ['vitesse', 'energie', 'debit', 'travail', 'masseVolumique'];

const BACS = [
  { id: 'quotient', titre: 'Se lit « par »', aide: 'une grandeur DIVISÉE par une autre', couleur: 'indigo' },
  { id: 'produit', titre: 'Se lit « fois »', aide: 'une grandeur MULTIPLIÉE par une autre', couleur: 'violet' },
];

const CLASSES_BAC = {
  indigo: 'border-indigo-300 bg-indigo-50',
  violet: 'border-violet-300 bg-violet-50',
};

export default function UnitesLab({ tri, onTri, selection, onSelection, montrerLecture = true }) {
  const nonRangees = ETIQUETTES.filter((id) => !tri[id]);

  return (
    <div className="space-y-4" role="group" aria-label="Trier les unités composées selon leur lecture">
      {/* ── Les étiquettes à ranger ──────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
        <p className="mb-2 text-sm font-bold text-slate-700">
          Les étiquettes {nonRangees.length === 0 ? '— toutes rangées' : `(${nonRangees.length} à ranger)`}
        </p>
        <div className="flex flex-wrap gap-2">
          {nonRangees.map((id) => {
            const g = GRANDEURS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelection(selection === id ? null : id)}
                aria-pressed={selection === id}
                className={`min-h-[44px] rounded-xl border-2 px-3.5 py-2 text-left transition-colors ${
                  selection === id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500'
                }`}
              >
                <span className="block font-mono text-sm font-black">{g.symbole}</span>
                <span className="block text-[13px] opacity-80">{g.nom}</span>
              </button>
            );
          })}
          {nonRangees.length === 0 && (
            <p className="text-sm text-slate-400">Plus rien à ranger. Relis les deux bacs.</p>
          )}
        </div>
        {selection && (
          <p className="mt-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[13px] text-slate-600">
            Étiquette choisie : <strong className="font-mono">{GRANDEURS[selection].symbole}</strong>.
            Dis-la à voix haute, puis choisis un bac.
          </p>
        )}
      </div>

      {/* ── Les deux bacs ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BACS.map((bac) => {
          const dedans = ETIQUETTES.filter((id) => tri[id] === bac.id);
          return (
            <div key={bac.id} className={`rounded-2xl border-2 p-3.5 ${CLASSES_BAC[bac.couleur]}`}
                 data-bac={bac.id}>
              <p className="text-sm font-black text-slate-800">{bac.titre}</p>
              <p className="mb-2 text-[13px] text-slate-600">{bac.aide}</p>
              <button
                type="button"
                onClick={() => selection && onTri(selection, bac.id)}
                disabled={!selection}
                className="mb-2 min-h-[44px] w-full rounded-xl border-2 border-dashed border-slate-400 bg-white/70 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                {selection ? `Poser ${GRANDEURS[selection].symbole} ici` : 'Choisis d’abord une étiquette'}
              </button>
              <ul className="space-y-1.5">
                {dedans.map((id) => {
                  const g = GRANDEURS[id];
                  const juste = g.kind === bac.id;
                  return (
                    <li key={id}
                        className={`rounded-xl border-2 bg-white px-2.5 py-2 ${
                          montrerLecture
                            ? juste ? 'border-emerald-300' : 'border-amber-300'
                            : 'border-slate-200'
                        }`}
                        data-etiquette={id}
                        data-juste={montrerLecture ? String(juste) : 'inconnu'}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">{g.symbole}</span>
                        <button
                          type="button"
                          onClick={() => onTri(id, null)}
                          className="min-h-[44px] rounded-lg px-2 text-[13px] font-semibold text-slate-500 underline hover:text-slate-800"
                        >
                          retirer
                        </button>
                      </div>
                      {montrerLecture && (
                        <p className={`text-[13px] ${juste ? 'text-emerald-800' : 'text-amber-800'}`}>
                          « {g.lecture} »
                          {!juste && ' — cette phrase ne va pas avec ce bac.'}
                        </p>
                      )}
                    </li>
                  );
                })}
                {dedans.length === 0 && (
                  <li className="text-[13px] text-slate-400">Bac vide.</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
