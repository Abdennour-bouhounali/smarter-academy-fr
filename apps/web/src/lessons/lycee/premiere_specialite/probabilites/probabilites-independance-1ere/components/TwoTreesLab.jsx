import React from 'react';
import { DraggableSplitBar } from '../../../../../common/stats';
import {
  labReadings, pct, quotient, ratEq, nABMin, nABMax,
  LAB_TOTAL, LAB_NB, LAB_STEP,
} from './indepUtils';
import { LAB_LABELS } from '../data';

/**
 * TwoTreesLab — L'INTERACTION SIGNATURE : « l'arbre qu'on retourne ».
 *
 * DEUX ARBRES DÉCRIVANT LA MÊME POPULATION, côte à côte. À gauche, on demande
 * d'abord « A ? » puis « B ? » ; à droite, l'inverse. Les mêmes 1 000 élèves,
 * les mêmes quatre cases — et pourtant les poids des branches DIFFÈRENT. C'est
 * le premier constat, et il tient tout entier dans la comparaison des deux
 * figures à la même seconde.
 *
 * LE GESTE (règle utilisateur du 2026-09-10, « le glisser d'abord »). La
 * composition se règle en ATTRAPANT LES SÉPARATIONS d'un tableau croisé et en
 * les faisant glisser : aucun bouton ±, aucun curseur posé à côté. Le trait qui
 * découpe la population EST la poignée, et LES DEUX ARBRES se recalculent sous
 * le doigt. `common/stats/DraggableSplitBar` fournit déjà `setPointerCapture`
 * (le glissement survit à la sortie de la barre), une zone de préhension large,
 * et un CHEMIN CLAVIER COMPLET sur une poignée `role="slider"` focalisable —
 * flèches (±1 cran), Page↑/↓ (±10 crans), Début/Fin. On ne le réécrit pas.
 *
 * DEUX SÉPARATIONS, DEUX RÔLES :
 *   · la première découpe la population selon A — elle règle le premier niveau
 *     de l'arbre de gauche, et le SECOND niveau de celui de droite ;
 *   · la seconde, à l'intérieur de A, découpe ceux qui vérifient aussi B — elle
 *     règle le second niveau de l'arbre de gauche.
 * `n(B)` est FIXÉ par le scénario : le premier niveau de l'arbre de droite
 * reste donc immobile, si bien que tout ce qui bouge à droite est sa deuxième
 * génération. C'est ce qui rend le constat lisible au lieu de le noyer.
 *
 * LA CONTRAINTE EST APPLIQUÉE, PAS ESPÉRÉE. La seconde séparation est bornée
 * par `nABMin`/`nABMax` : au-delà, la quatrième case du tableau deviendrait
 * négative et `crossFromCounts` lèverait AU MILIEU D'UN GLISSEMENT. Les bornes
 * sont aussi DESSINÉES (contour pointillé) : l'élève voit pourquoi la poignée
 * bute, au lieu de la sentir coincer sans raison.
 *
 * OÙ VIVENT LES NOMBRES. Dans le DOM (§6bis.4) : les poids des arbres sont des
 * cellules de tableau, les trois lectures sont des lignes. Le SVG ne porte que
 * la STRUCTURE — les traits, les nœuds, les noms courts A / Ā / B / B̄ qui ne
 * peuvent pas se toucher parce qu'ils sont posés à des ordonnées fixes. Aucune
 * collision n'est donc possible, quel que soit le réglage.
 *
 * JAMAIS FIGÉ. Aucune prop `disabled` liée à la validation d'une étape : le
 * seul verrou admis est l'ANTÉRIORITÉ (`locked`, passé par le module quand
 * l'étape précédente n'est pas faite), et il ne s'arme jamais APRÈS une
 * réussite. Un élève qui vient de comprendre doit pouvoir refaire le geste.
 */

/** Un arbre à deux niveaux, STRUCTURE seule : les poids sont dans le DOM. */
function TreeShape({ tree, firstNames, secondNames, tint, flat }) {
  const W = 150;
  const H = 116;
  const xRoot = 8;
  const xMid = 52;
  const xLeaf = 104;
  const yRoot = H / 2;
  const ys = [22, 50, 76, 104];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="select-none overflow-visible"
      role="img" aria-label="Structure de l’arbre à deux niveaux">
      <circle cx={xRoot} cy={yRoot} r="3" fill="#475569" />
      {tree.map((b, i) => {
        const yb = i === 0 ? (ys[0] + ys[1]) / 2 : (ys[2] + ys[3]) / 2;
        return (
          <g key={b.id}>
            <line x1={xRoot} y1={yRoot} x2={xMid} y2={yb} stroke={tint} strokeWidth="1.8" />
            <circle cx={xMid} cy={yb} r="2.6" fill={tint} />
            <text x={xMid} y={yb - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill={tint}>
              {firstNames[i]}
            </text>
            {b.children.map((c, j) => {
              const y = ys[i * 2 + j];
              const on = flat && j === 0;
              return (
                <g key={c.id}>
                  <line x1={xMid} y1={yb} x2={xLeaf} y2={y}
                    stroke={on ? '#059669' : '#cbd5e1'} strokeWidth={on ? 2.4 : 1.4} />
                  <text x={xLeaf + 5} y={y + 4} fontSize="11"
                    fontWeight={on ? '800' : '600'} fill={on ? '#047857' : '#475569'}>
                    {secondNames[j]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/** Le tableau DOM des poids d'un arbre — un poids par ligne, jamais en SVG. */
function TreeWeights({ tree, firstLabels, secondLabels, secondId, flat, tint }) {
  return (
    <table className="w-full text-xs tabular-nums">
      <tbody>
        {tree.map((b) => {
          const c = b.children.find((x) => x.id === secondId);
          return (
            <tr key={b.id} className="border-t border-slate-100">
              <th scope="row" className="px-1.5 py-1 text-left font-semibold text-slate-500">
                {firstLabels[b.id]}
              </th>
              <td className="px-1.5 py-1 text-right font-mono text-slate-500">
                {pct(b.p, 0)}
              </td>
              <td className={`px-1.5 py-1 text-right font-mono font-black ${flat ? 'text-emerald-700' : ''}`}
                style={flat ? undefined : { color: tint }}>
                {c.p === null ? '—' : pct(c.p, 1)}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={3} className="px-1.5 pt-1 text-[13px] leading-tight text-slate-400">
            à droite : la part de « {secondLabels[secondId]} » dans chaque branche
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function TwoTreesLab({
  state,
  onChange,
  locked = false,
  showVerdict = true,     // le bandeau « identiques / différents »
  showReadings = true,    // les trois lectures chiffrées
}) {
  const r = labReadings(state);
  const { nA, nAB, N } = { ...r.counts, N: LAB_TOTAL };
  const nNotA = N - nA;
  const bornes = { min: nABMin(nA), max: nABMax(nA) };

  const setNA = (v) => {
    // La seconde séparation SUIT la première : quand A rétrécit sous
    // l'intersection, l'intersection le suit ; quand A grandit au point que la
    // quatrième case deviendrait négative, l'intersection est poussée. La
    // contrainte est APPLIQUÉE — un état interdit ferait lever `labTable` au
    // milieu d'un glissement.
    const nABClamped = Math.min(nABMax(v), Math.max(nABMin(v), state.nAB));
    onChange({ nA: v, nAB: nABClamped });
  };
  const setNAB = (v) => onChange({ ...state, nAB: Math.min(nABMax(nA), Math.max(nABMin(nA), v)) });

  const FIRST_A = { A: LAB_LABELS.aShort, nonA: LAB_LABELS.notA };
  const SECOND_A = { B: LAB_LABELS.bShort, nonB: LAB_LABELS.notB };
  const FIRST_B = { B: LAB_LABELS.bShort, nonB: LAB_LABELS.notB };
  const SECOND_B = { A: LAB_LABELS.aShort, nonA: LAB_LABELS.notA };

  const rows = [
    {
      id: 'condAB',
      label: <>P<sub>A</sub>(B) — parmi les <strong>{LAB_LABELS.aShort}</strong>, la part qui est <strong>{LAB_LABELS.bShort}</strong></>,
      num: nAB, den: nA, value: r.condAB, tone: 'indigo',
    },
    {
      id: 'condBA',
      label: <>P<sub>B</sub>(A) — parmi les <strong>{LAB_LABELS.bShort}</strong>, la part qui est <strong>{LAB_LABELS.aShort}</strong></>,
      num: nAB, den: LAB_NB, value: r.condBA, tone: 'fuchsia',
    },
    {
      id: 'inter',
      label: <>P(A ∩ B) — les deux à la fois, sur toute la population</>,
      num: nAB, den: N, value: r.pInter, tone: 'slate',
    },
  ];

  const TONES = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    fuchsia: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900',
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {N} {LAB_LABELS.total} · {LAB_NB} {LAB_LABELS.bShort}
        {locked ? '' : ' — attrape un trait noir et fais-le glisser'}
      </p>

      {/* SÉPARATION 1 — qui vérifie A */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">
          Combien d’élèves {LAB_LABELS.a} ?{' '}
          <span className="text-slate-400">(première séparation)</span>
        </p>
        <DraggableSplitBar
          total={N}
          value={nA}
          onChange={setNA}
          step={LAB_STEP}
          locked={locked}
          height={50}
          colors={{ part: '#4f46e5', rest: '#cbd5e1' }}
          labels={{ part: LAB_LABELS.aShort, rest: LAB_LABELS.notA }}
          ariaLabel={`Nombre d’élèves qui ${LAB_LABELS.a}`}
          valueText={`${nA} élèves ${LAB_LABELS.aShort} sur ${N}, ${nNotA} ${LAB_LABELS.notA}`}
        />
      </div>

      {/* SÉPARATION 2 — parmi eux, qui vérifie aussi B */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">
          Parmi ces {nA} élèves, combien sont aussi {LAB_LABELS.bShort} ?{' '}
          <span className="text-slate-400">
            (seconde séparation — entre {bornes.min} et {bornes.max})
          </span>
        </p>
        <DraggableSplitBar
          total={N}
          value={nAB}
          onChange={setNAB}
          step={LAB_STEP}
          locked={locked}
          height={34}
          colors={{ part: '#c026d3', rest: '#eef2f7' }}
          labels={{ part: 'les deux', rest: '' }}
          ariaLabel="Nombre d’élèves qui vérifient les deux critères"
          valueText={`${nAB} élèves ${LAB_LABELS.aShort} et ${LAB_LABELS.bShort}, parmi les ${nA} ${LAB_LABELS.aShort}`}
        >
          {/* Les bornes SE VOIENT : le contour montre la place réellement
              disponible, au lieu de laisser la poignée buter sans raison. */}
          <rect
            x={(bornes.min / N) * 1000} y={0}
            width={((bornes.max - bornes.min) / N) * 1000} height={34}
            fill="#4f46e5" fillOpacity="0.1" stroke="#4f46e5" strokeOpacity="0.5"
            strokeWidth="2" strokeDasharray="6 4" rx="6"
          />
        </DraggableSplitBar>
      </div>

      {/* LES DEUX ARBRES, CÔTE À CÔTE, DE LA MÊME POPULATION */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-2.5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
            A d’abord
          </p>
          <TreeShape
            tree={r.byA}
            firstNames={['A', 'Ā']}
            secondNames={['B', 'B̄']}
            tint="#4f46e5"
            flat={r.flatA}
          />
          <TreeWeights
            tree={r.byA} firstLabels={FIRST_A} secondLabels={SECOND_A}
            secondId="B" flat={r.flatA} tint="#4f46e5"
          />
        </div>
        <div className="rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/40 p-2.5 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-fuchsia-500">
            B d’abord
          </p>
          <TreeShape
            tree={r.byB}
            firstNames={['B', 'B̄']}
            secondNames={['A', 'Ā']}
            tint="#c026d3"
            flat={r.flatB}
          />
          <TreeWeights
            tree={r.byB} firstLabels={FIRST_B} secondLabels={SECOND_B}
            secondId="A" flat={r.flatB} tint="#c026d3"
          />
        </div>
      </div>

      {showVerdict && (
        <div
          className={`rounded-xl border-2 px-3 py-2.5 text-sm ${
            r.degenerate
              ? 'border-slate-300 bg-slate-50 text-slate-600'
              : r.flatA
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          {r.degenerate ? (
            <>
              Un des deux groupes est vide ou contient tout le monde : l’arbre ne montre plus
              rien. Fais glisser pour revenir à une population partagée.
            </>
          ) : r.flatA ? (
            <>
              <strong>Les deux poids de deuxième génération sont identiques</strong>, dans
              l’arbre de gauche comme dans celui de droite. Savoir si un élève{' '}
              {LAB_LABELS.a} ne change RIEN à sa chance d’être {LAB_LABELS.bShort}.
              {' '}Vérification exacte : {nAB} × {N} = {r.exact.left} et {nA} × {LAB_NB} ={' '}
              {r.exact.right}.
            </>
          ) : (
            <>
              Les deux poids de deuxième génération <strong>diffèrent</strong> :{' '}
              {pct(r.byA[0].children[0].p, 1)} contre {pct(r.byA[1].children[0].p, 1)} à gauche.
              Savoir si un élève {LAB_LABELS.a} change sa chance d’être {LAB_LABELS.bShort}.
            </>
          )}
        </div>
      )}

      {showReadings && (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className={`rounded-xl border-2 px-3 py-2 ${TONES[row.tone]}`}>
              <p className="text-xs mb-1">{row.label}</p>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono">
                <span className="text-lg font-black tabular-nums">
                  {row.den === 0 ? '— / 0' : quotient(row.num, row.den)}
                </span>
                <span className="opacity-40">=</span>
                <span className="text-lg font-black tabular-nums">{pct(row.value, 1)}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            {r.condAB !== null && r.condBA !== null && !ratEq(r.condAB, r.condBA) ? (
              <>
                Les deux premiers quotients ont le <strong>même numérateur</strong> ({nAB}) et
                deux dénominateurs différents ({nA} et {LAB_NB}) : c’est pour cela qu’ils ne
                donnent pas le même pourcentage.
              </>
            ) : (
              <>
                Ici les deux groupes ont la même taille ({nA} et {LAB_NB}), donc les deux
                quotients coïncident — ce n’est pas la règle générale.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
