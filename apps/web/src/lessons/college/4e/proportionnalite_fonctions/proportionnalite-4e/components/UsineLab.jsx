import React, { useMemo } from 'react';
import { fr, eur, couples, rapports, ATELIERS, ENTREES_M1 } from './prop4e';

/**
 * UsineLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               commander des affiches dans DEUX ateliers à la fois,
 *                        et faire apparaître une à une les cinq façons de
 *                        lire la même relation.
 * Mathematical objective une situation proportionnelle est UNE relation ;
 *                        objets, table, rapport, coefficient et alignement en
 *                        sont cinq lectures. Elles tiennent ou cassent
 *                        ENSEMBLE — c'est ce simultané qui prouve qu'elles
 *                        décrivent la même chose.
 * Student action         glisser le nombre d'affiches ; dévoiler la lecture
 *                        suivante ; basculer d'un atelier à l'autre.
 * Controlled variable    le nombre d'affiches, et lui seul. Les deux règles
 *                        sont fixes.
 * Mathematical state     un entier n ; TOUT le reste est calculé par
 *                        `atelier.apply(n)` — aucune valeur écrite à la main.
 * Visual consequence     les cinq lectures se réécrivent à l'instant.
 * Expected observation   « chez Bruno, le prix par affiche n'arrête pas de
 *                        changer, et les points ratent le coin ».
 * Misconception targeted « ça monte quand j'augmente, donc c'est
 *                        proportionnel » — les deux ateliers montent.
 *
 * CE QUE CE LABO NE FAIT PAS (laissé aux modules suivants) : le produit en
 * croix (M2), les pourcentages (M3–M4), le graphique comme CRITÈRE qu'on
 * construit soi-même (M5). Ici, les points sont montrés, pas placés.
 *
 * SÉCURITÉ VISUELLE (§6ter.5) : pistes DOM et nombres en colonne propre pour
 * les quatre premières lectures — rien ne peut se chevaucher quel que soit le
 * nombre de chiffres. La cinquième (le nuage) est le seul SVG, sans aucun
 * <text> : ses graduations vivent dans le DOM autour de lui.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement (mémoire « manipulations
 * gelées après validation »). `locked` n'existe pas ici : le labo reste vivant
 * jusqu'à la fin du module.
 */

const MAX = 20;

/** Les cinq lectures, dans l'ordre où elles se dévoilent. */
export const LECTURES = [
  { id: 'objets', titre: 'Les affiches et le prix', aide: 'Ce qu’on commande, ce qu’on paie.' },
  { id: 'table', titre: 'La table', aide: 'Les commandes déjà passées, rangées.' },
  { id: 'rapport', titre: 'Le prix d’UNE affiche', aide: 'Le prix payé, divisé par le nombre d’affiches.' },
  { id: 'coefficient', titre: 'Le coefficient', aide: 'Le nombre par lequel on multiplie… s’il existe.' },
  { id: 'points', titre: 'Le nuage de points', aide: 'Chaque commande devient un point.' },
];

/** Une affiche stylisée — objet concret, dessiné, jamais compté à la main. */
function Affiche({ i }) {
  return (
    <span
      className="inline-block w-3.5 h-5 rounded-[2px] border border-indigo-300 bg-indigo-100"
      style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
      aria-hidden="true"
    />
  );
}

export default function UsineLab({
  atelierId,
  onAtelier,
  n,
  onN,
  niveau = 1,
  releves = [],
  onRelever,
}) {
  const atelier = ATELIERS[atelierId];
  const prix = atelier.apply(n);

  // Les couples RELEVÉS par l'élève, plus le courant : la table est ce qu'il
  // a construit, pas une liste écrite d'avance.
  const table = useMemo(() => {
    const base = releves.map((x) => ({ x, y: atelier.apply(x) }));
    if (!base.some((c) => c.x === n)) base.push({ x: n, y: prix });
    return base.sort((a, b) => a.x - b.x);
  }, [releves, n, atelier, prix]);

  const rs = rapports(table);
  const rapportsDistincts = new Set(rs.map((c) => c.r));
  const coefficientExiste = rapportsDistincts.size === 1 && rs.length > 0;

  // Le nuage : échelle fixée par le MAXIMUM ATTEIGNABLE des deux ateliers, pas
  // par les valeurs courantes — les points ne peuvent jamais sortir du cadre,
  // et les deux ateliers restent comparables à la même échelle.
  const yMax = Math.max(...Object.values(ATELIERS).map((a) => a.apply(MAX)));
  const W = 240;
  const H = 150;
  const px = (x) => 26 + (x / MAX) * (W - 36);
  const py = (y) => H - 22 - (y / yMax) * (H - 34);

  return (
    <div className="space-y-4" role="group" aria-label="Atelier d’affiches : commander et lire la relation">
      {/* ── Le choix de l'atelier ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {Object.values(ATELIERS).map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onAtelier(a.id)}
            aria-pressed={a.id === atelierId}
            className={`rounded-xl border-2 px-3 py-2 text-left transition-colors ${
              a.id === atelierId
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="block text-sm font-bold">{a.nom}</span>
            <span className="block text-xs opacity-80">{a.detail}</span>
          </button>
        ))}
      </div>

      {/* ── LECTURE 1 : les objets ──────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <label htmlFor="usine-n" className="block text-sm font-bold text-slate-700">
          Combien d’affiches ?
        </label>
        <input
          id="usine-n"
          type="range"
          min={0}
          max={MAX}
          step={1}
          value={n}
          onChange={(e) => onN(Number(e.target.value))}
          className="sa-slider accent-indigo-600 w-full"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={MAX}
          aria-valuenow={n}
          aria-valuetext={`${n} affiche${n > 1 ? 's' : ''}, ${eur(prix)}`}
        />
        <div className="flex justify-between text-[11px] text-slate-400 -mt-1">
          <span>0</span><span>10</span><span>{MAX}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 min-h-[1.5rem]">
          {Array.from({ length: n }, (_, i) => <Affiche key={i} i={i} />)}
          {n === 0 && <span className="text-xs text-slate-400">aucune affiche commandée</span>}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">
            {n} affiche{n > 1 ? 's' : ''}
          </span>
          <span className="font-mono text-xl font-black tabular-nums text-slate-900">{eur(prix)}</span>
        </div>

        <button
          type="button"
          onClick={() => onRelever(n)}
          className="min-h-[44px] w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Noter cette commande
        </button>
      </div>

      {/* ── LECTURE 2 : la table ────────────────────────────────────── */}
      {niveau >= 2 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-bold text-slate-700">{LECTURES[1].titre}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th scope="row" className="py-1.5 pr-3 text-left font-semibold text-slate-500">Affiches</th>
                  {table.map((c) => (
                    <td key={c.x} className={`px-2 py-1.5 text-right ${c.x === n ? 'font-black text-indigo-700' : 'text-slate-700'}`}>
                      {c.x}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-1.5 pr-3 text-left font-semibold text-slate-500">Prix</th>
                  {table.map((c) => (
                    <td key={c.x} className={`px-2 py-1.5 text-right ${c.x === n ? 'font-black text-indigo-700' : 'text-slate-700'}`}>
                      {fr(c.y)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── LECTURE 3 : le rapport ──────────────────────────────────── */}
      {niveau >= 3 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-700">{LECTURES[2].titre}</p>
          <p className="mb-2 text-xs text-slate-500">{LECTURES[2].aide}</p>
          {rs.length === 0 ? (
            <p className="text-xs text-slate-400">Note au moins une commande d’une affiche ou plus.</p>
          ) : (
            <ul className="space-y-1">
              {rs.map((c) => (
                <li key={c.x} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-500">
                    {fr(c.y)} ÷ {c.x}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-slate-900">{eur(c.r)}</span>
                </li>
              ))}
            </ul>
          )}
          {rs.length >= 2 && (
            <p className={`mt-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
              rapportsDistincts.size === 1 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
            }`}>
              {rapportsDistincts.size === 1
                ? 'Toujours le même prix par affiche.'
                : `${rapportsDistincts.size} prix par affiche différents pour le même atelier.`}
            </p>
          )}
        </div>
      )}

      {/* ── LECTURE 4 : le coefficient ──────────────────────────────── */}
      {niveau >= 4 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-700">{LECTURES[3].titre}</p>
          <p className={`mt-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${
            coefficientExiste ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
          }`}>
            {coefficientExiste
              ? `Un seul nombre suffit : prix = ${fr(rs[0].r)} × nombre d’affiches.`
              : 'Aucun nombre unique ne marche pour toutes les commandes.'}
          </p>
        </div>
      )}

      {/* ── LECTURE 5 : le nuage ────────────────────────────────────── */}
      {niveau >= 5 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-700">{LECTURES[4].titre}</p>
          <p className="mb-2 text-xs text-slate-500">{LECTURES[4].aide}</p>
          <div className="mx-auto max-w-[280px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
                 aria-label={`Nuage de ${table.length} points pour ${atelier.nom}`}>
              {/* axes */}
              <line x1={26} y1={H - 22} x2={W - 6} y2={H - 22} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={26} y1={10} x2={26} y2={H - 22} stroke="#94a3b8" strokeWidth="1.5" />
              {/* la droite passant par l'origine et le dernier point relevé :
                  elle MONTRE si le nuage la suit ou la rate. */}
              {table.length > 0 && (() => {
                const dernier = table[table.length - 1];
                if (dernier.x === 0) return null;
                const k = dernier.y / dernier.x;
                const xEnd = MAX;
                const yEnd = Math.min(k * xEnd, yMax);
                const xClip = k === 0 ? xEnd : Math.min(xEnd, yMax / k);
                return (
                  <line x1={px(0)} y1={py(0)} x2={px(xClip)} y2={py(k * xClip)}
                        stroke="#c7d2fe" strokeWidth="2" strokeDasharray="4 3" />
                );
              })()}
              {table.map((c) => (
                <circle key={c.x} cx={px(c.x)} cy={py(c.y)} r={c.x === n ? 5 : 3.5}
                        fill={c.x === n ? '#4338ca' : '#6366f1'} />
              ))}
              {/* l'origine, marquée : c'est elle que le critère regarde */}
              <circle cx={px(0)} cy={py(0)} r={2.5} fill="#0f172a" />
            </svg>
          </div>
          {/* Les graduations vivent dans le DOM, jamais en <text> SVG (§6ter.5). */}
          <div className="mx-auto flex max-w-[280px] justify-between px-1 text-[11px] text-slate-400">
            <span>0 affiche</span>
            <span>{MAX} affiches</span>
          </div>
        </div>
      )}
    </div>
  );
}

export { MAX as USINE_MAX, ENTREES_M1 };
