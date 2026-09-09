import React, { useMemo, useState } from 'react';
import {
  tableau, effectifTotal, moyenne, TRIS, fr, unite,
} from './statistiques';
import BarChart from './BarChart';
import PieChart from './PieChart';

/**
 * DatasetLab — le jeu de données VIVANT de la leçon.
 *
 * C'est la manipulation centrale : l'élève ajoute un élève, en supprime un,
 * trie la liste, change de représentation — et le tableau, le graphique et la
 * moyenne se recalculent SOUS SES YEUX. Rien n'est précalculé : tout descend
 * du même noyau pur (statistiques.js), donc ce que l'élève voit ne peut pas
 * contredire ce que la leçon affirme.
 *
 * UNE SEULE ACTION À LA FOIS (consigne §manipulation) : chaque contrôle fait
 * exactement une chose, et son effet est annoncé avant d'être fait. Le
 * bandeau « ce qui vient de changer » nomme la conséquence, ce qui transforme
 * un clic en observation.
 *
 * JAMAIS GELÉ. Le laboratoire reste manipulable après validation de l'étape
 * (memory « manipulations gelées après validation ») : aucune prop `disabled`
 * ne dépend d'un `done`. L'élève qui a compris doit pouvoir continuer à
 * jouer — c'est souvent là qu'il essaie le cas extrême.
 *
 * @param {object[]} data        les observations courantes
 * @param {function} onData      (next, changement) => void — le parent décide
 * @param {string[]} [actions]   sous-ensemble de ['ajouter','supprimer','trier','representation']
 * @param {string} [vue]         'barres' | 'secteurs' — vue contrôlée
 * @param {function} [onVue]     changement de vue (si absent : état interne)
 * @param {boolean} [montrerMoyenne=false]  la moyenne n'apparaît qu'à partir du M6
 * @param {boolean} [montrerFrequences=false] les fréquences n'apparaissent qu'à partir du M3
 */
export default function DatasetLab({
  data,
  onData,
  actions = ['ajouter', 'supprimer', 'trier', 'representation'],
  vue: vueProp,
  onVue,
  montrerMoyenne = false,
  montrerFrequences = false,
  ariaLabel = 'Jeu de données de l’enquête',
}) {
  const [tri, setTri] = useState('collecte');
  const [vueInterne, setVueInterne] = useState('barres');
  const [nouveau, setNouveau] = useState(2);
  const [dernier, setDernier] = useState(null);

  const vue = vueProp ?? vueInterne;
  const setVue = onVue ?? setVueInterne;

  const affichees = useMemo(() => TRIS[tri].apply(data), [data, tri]);
  const lignes = useMemo(() => tableau(data), [data]);
  const total = effectifTotal(data);
  const moy = moyenne(data);

  const peut = (a) => actions.includes(a);

  /* Chaque geste annonce sa conséquence : c'est le bandeau qui fait la
     différence entre « cliquer » et « observer ». */
  const ajouter = () => {
    const avant = moyenne(data);
    const next = [...data, { id: `add${Date.now()}`, prenom: `Élève ${total + 1}`, valeur: nouveau }];
    const apres = moyenne(next);
    setDernier({
      geste: `Un élève de plus, qui a lu ${nouveau} ${unite(nouveau)}`,
      total: `${total} → ${total + 1} élèves`,
      moyenne: avant === null ? null : `${fr(avant)} → ${fr(apres)}`,
      sens: apres > avant ? 'monte' : apres < avant ? 'descend' : 'ne bouge pas',
    });
    onData(next);
  };

  const supprimer = (obs) => {
    const avant = moyenne(data);
    const next = data.filter((o) => o.id !== obs.id);
    const apres = moyenne(next);
    setDernier({
      geste: `${obs.prenom} retiré de l’enquête (${obs.valeur} ${unite(obs.valeur)})`,
      total: `${total} → ${total - 1} élève${total - 1 > 1 ? 's' : ''}`,
      moyenne: apres === null || avant === null ? null : `${fr(avant)} → ${fr(apres)}`,
      sens: apres === null ? 'n’existe plus' : apres > avant ? 'monte' : apres < avant ? 'descend' : 'ne bouge pas',
    });
    onData(next);
  };

  const trier = (id) => {
    setTri(id);
    setDernier({
      geste: `Liste réorganisée : ${TRIS[id].label.toLowerCase()}`,
      total: `${total} élèves — inchangé`,
      moyenne: moy === null ? null : `${fr(moy)} → ${fr(moy)}`,
      sens: 'ne bouge pas',
      invariant: true,
    });
  };

  return (
    <div className="space-y-3" aria-label={ariaLabel}>
      {/* ── La liste brute, une pastille par élève ─────────────────── */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Les réponses ({total} élève{total > 1 ? 's' : ''})
          </span>
          {peut('trier') && (
            <div className="flex gap-1 flex-wrap">
              {Object.values(TRIS).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => trier(t.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border-2 transition ${
                    tri === t.id
                      ? 'border-sky-400 bg-sky-50 text-sky-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                  aria-pressed={tri === t.id}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {affichees.map((o) => (
            <div
              key={o.id}
              className="group relative flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-slate-50 pl-2 pr-1 py-1"
            >
              <span className="text-xs text-slate-600">{o.prenom}</span>
              <span className="font-mono text-sm font-black tabular-nums text-slate-800">{o.valeur}</span>
              {peut('supprimer') && (
                <button
                  type="button"
                  onClick={() => supprimer(o)}
                  className="grid h-7 w-7 place-items-center rounded-md text-base leading-none text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                  aria-label={`Retirer ${o.prenom} de l’enquête`}
                  title={`Retirer ${o.prenom}`}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {affichees.length === 0 && (
            <p className="text-sm text-slate-500 italic py-2">
              Plus personne dans l’enquête : sans données, il n’y a rien à calculer.
            </p>
          )}
        </div>

        {peut('ajouter') && (
          <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-500">Ajouter un élève qui a lu</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 5, 12].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setNouveau(v)}
                  className={`h-8 w-8 rounded-lg border-2 font-mono text-sm font-bold tabular-nums transition ${
                    nouveau === v
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                  aria-pressed={nouveau === v}
                  aria-label={`${v} ${unite(v)}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">{unite(nouveau)}</span>
            <button
              type="button"
              onClick={ajouter}
              className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 transition"
            >
              + Ajouter
            </button>
          </div>
        )}
      </div>

      {/* ── Le tableau, recalculé en direct ────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border-b-2 border-r-2 border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Livres lus
              </th>
              {lignes.map((l) => (
                <th key={l.valeur} className="border-b-2 border-r border-slate-200 bg-slate-50 px-2 py-2 font-mono text-base font-black tabular-nums text-slate-800">
                  {l.valeur}
                </th>
              ))}
              <th className="border-b-2 border-slate-200 bg-slate-100 px-2 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="border-r-2 border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold text-slate-600">
                Effectif
              </th>
              {lignes.map((l) => (
                <td key={l.valeur} className="border-r border-slate-100 px-2 py-2 text-center font-mono text-base font-bold tabular-nums text-slate-800">
                  {l.effectif}
                </td>
              ))}
              <td className="bg-slate-50 px-2 py-2 text-center font-mono text-base font-black tabular-nums text-slate-900">
                {total}
              </td>
            </tr>
            {montrerFrequences && (
              <tr>
                <th className="border-t border-r-2 border-slate-200 bg-slate-50 px-2 py-2 text-left text-xs font-semibold text-slate-600">
                  Fréquence
                </th>
                {lignes.map((l) => (
                  <td key={l.valeur} className="border-t border-r border-slate-100 px-2 py-2 text-center text-xs tabular-nums text-amber-800">
                    <div className="font-mono font-bold">{l.effectif}/{total}</div>
                    <div className="text-slate-500">{fr(l.pourcentage, 1)} %</div>
                  </td>
                ))}
                <td className="border-t border-slate-100 bg-slate-50 px-2 py-2 text-center font-mono text-sm font-black text-slate-900">
                  1
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── La représentation ──────────────────────────────────────── */}
      {peut('representation') && (
        <div className="flex justify-center gap-1.5">
          {[
            { id: 'barres', label: '📊 Barres' },
            { id: 'secteurs', label: '🥧 Secteurs' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setVue(v.id);
                setDernier({
                  geste: `Représentation : ${v.id === 'barres' ? 'diagramme en barres' : 'diagramme circulaire'}`,
                  total: `${total} élèves — inchangé`,
                  moyenne: moy === null ? null : `${fr(moy)} → ${fr(moy)}`,
                  sens: 'ne bouge pas',
                  invariant: true,
                });
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold border-2 transition ${
                vue === v.id
                  ? 'border-sky-400 bg-sky-50 text-sky-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
              aria-pressed={vue === v.id}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {lignes.length > 0 && (
        vue === 'barres'
          ? <BarChart lignes={lignes} total={total} moyenne={montrerMoyenne ? moy : null} />
          : <PieChart lignes={lignes} total={total} />
      )}

      {/* ── La moyenne, seulement à partir du module 6 ─────────────── */}
      {montrerMoyenne && (
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-purple-700">Moyenne</div>
          <div className="font-mono text-2xl font-black tabular-nums text-purple-800">
            {moy === null ? '—' : fr(moy)}
          </div>
          <div className="text-xs text-slate-500">
            {moy === null
              ? 'Aucune donnée : il n’y a rien à partager.'
              : `${lignes.reduce((a, l) => a + l.valeur * l.effectif, 0)} livres partagés entre ${total} élèves`}
          </div>
        </div>
      )}

      {/* ── Ce qui vient de changer : le geste devient une observation ─ */}
      {dernier && (
        <div
          className={`rounded-xl border-2 p-3 text-sm ${
            dernier.invariant
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-sky-200 bg-sky-50 text-sky-900'
          }`}
          role="status"
        >
          <div className="font-semibold">{dernier.geste}</div>
          <div className="mt-1 grid gap-0.5 text-xs text-slate-600 sm:grid-cols-2">
            <div>Effectif total : <strong className="font-mono">{dernier.total}</strong></div>
            {montrerMoyenne && dernier.moyenne && (
              <div>
                Moyenne : <strong className="font-mono">{dernier.moyenne}</strong> — elle{' '}
                <strong>{dernier.sens}</strong>.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
