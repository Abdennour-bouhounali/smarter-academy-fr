import React, { useState } from 'react';
import { differences, ratios, fr } from './suitesUtils';

/**
 * PileInspector — l'instrument de reconnaissance.
 *
 * Activity               une liste de nombres est posée. L'élève choisit
 *                        l'outil de mesure — « écarts » ou « rapports » — et
 *                        l'instrument les calcule tous, alignés sous la liste.
 * Mathematical objective une suite est arithmétique quand les ÉCARTS sont tous
 *                        égaux, géométrique quand les RAPPORTS le sont ; la
 *                        valeur commune est la raison.
 * Student action         appuyer sur l'un des deux outils, et changer de suite.
 * Controlled variable    l'outil de mesure (et la suite examinée).
 * Mathematical state     { list, outil } ; les mesures en sont dérivées.
 * Visual consequence     une bande de mesures apparaît ; quand elles sont
 *                        toutes identiques, elles s'allument ensemble.
 * Expected observation   « avec le bon outil, tous les nombres deviennent
 *                        pareils — et alors c'est ce nombre-là, la raison ».
 * Misconception targeted chercher l'écart sur une suite géométrique (et
 *                        conclure « ni l'une ni l'autre ») ; prendre le
 *                        dernier moins le premier pour la raison.
 *
 * Nombres dans le DOM. Aucun SVG : une bande de mesures reste lisible même
 * quand les valeurs vont de 5 à 80.
 *
 * JAMAIS GELÉ après réussite : l'instrument reste manipulable, et changer
 * d'outil est justement le geste qu'on veut voir refaire.
 */
export default function PileInspector({ list, label, disabled = false, onMesure }) {
  const [outil, setOutil] = useState(null);

  const mesures = outil === 'ecarts' ? differences(list) : outil === 'rapports' ? ratios(list) : [];
  const toutesEgales =
    mesures.length > 1
    && mesures.every((x) => Number.isFinite(x) && Math.abs(x - mesures[0]) < 1e-9);

  const choisir = (o) => {
    setOutil(o);
    onMesure?.(o);
  };

  const btn = (actif) =>
    'min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-sm font-bold transition-colors '
    + 'disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 '
    + (actif ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50');

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
      {label && <div className="text-sm font-bold text-slate-800">{label}</div>}

      {/* La suite examinée : une case par terme, le rang dessous. */}
      <div className="flex items-start gap-1.5 overflow-x-auto pb-1">
        {list.map((v, i) => (
          <div key={i} className="shrink-0 text-center">
            <div className="rounded-lg border-2 border-slate-300 bg-slate-50 px-2.5 py-1.5 font-mono text-base font-black tabular-nums text-slate-900">
              {fr(v)}
            </div>
            <div className="mt-0.5 font-mono text-[13px] text-slate-500">rang {fr(i)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir l’outil de mesure">
        <span className="text-[13px] text-slate-600">Mesurer entre deux termes consécutifs :</span>
        <button type="button" className={btn(outil === 'ecarts')} onClick={() => choisir('ecarts')} disabled={disabled}>
          les écarts (−)
        </button>
        <button type="button" className={btn(outil === 'rapports')} onClick={() => choisir('rapports')} disabled={disabled}>
          les rapports (÷)
        </button>
      </div>

      {outil && (
        <div
          className={`rounded-xl border-2 p-3 ${
            toutesEgales ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
          }`}
          aria-live="polite"
        >
          <div className="mb-1.5 text-[13px] font-semibold text-slate-700">
            {outil === 'ecarts' ? 'Écarts u(n+1) − u(n)' : 'Rapports u(n+1) ÷ u(n)'}
          </div>
          <ul className="flex flex-wrap gap-2">
            {mesures.map((m, i) => (
              <li
                key={i}
                className={`rounded-lg border px-2.5 py-1 font-mono text-sm font-bold tabular-nums ${
                  toutesEgales ? 'border-emerald-300 bg-white text-emerald-900' : 'border-slate-300 bg-white text-slate-800'
                }`}
              >
                {Number.isFinite(m) ? fr(arrondi(m)) : 'impossible'}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-slate-700">
            {toutesEgales ? (
              <>
                Toutes les mesures valent <strong>{fr(arrondi(mesures[0]))}</strong> : c’est la même
                chose à chaque pas.
              </>
            ) : (
              <>Les mesures ne sont pas toutes égales avec cet outil. Essaie l’autre.</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/** Arrondi d'affichage : quatre décimales suffisent et évitent 2,0999999999. */
const arrondi = (n) => Math.round(n * 10000) / 10000;
