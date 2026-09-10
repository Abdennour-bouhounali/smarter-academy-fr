import React from 'react';
import { DraggableSplitBar } from '../../../../../common/stats';
import {
  barReadings, pct, quotient, ratValue, BAR_TOTAL, BAR_STEP,
} from './condUtils';
import { BAR_LABELS } from '../data';

/**
 * SplitPopulationLab — L'INTERACTION SIGNATURE : « le monde qui rétrécit ».
 *
 * LE GESTE (règle utilisateur du 2026-09-10, « le glisser d'abord ») : la
 * composition de la population se règle en ATTRAPANT LES SÉPARATIONS
 * elles-mêmes et en les faisant glisser. Aucun bouton ±, aucun curseur posé
 * sous la figure — le trait qui découpe la population EST la poignée, et les
 * effectifs comme les pourcentages suivent le doigt en continu.
 * `common/stats/DraggableSplitBar` fournit déjà tout ce que cela demande :
 * `setPointerCapture` (le glissement survit à la sortie de la barre), zone de
 * préhension large, et un CHEMIN CLAVIER COMPLET sur une poignée
 * `role="slider"` focalisable — flèches (±1 cran), Page↑/↓ (±10 crans),
 * Début/Fin. On ne le réécrit pas, on s'en sert.
 *
 * DEUX SÉPARATIONS, DEUX QUESTIONS :
 *   · la première découpe la population en « proches du centre » (B) et
 *     « plus loin » — elle règle le DÉNOMINATEUR de P_B(A) ;
 *   · la seconde, à l'intérieur de B, découpe les cyclistes — elle règle le
 *     NUMÉRATEUR, commun à P(A ∩ B) et à P_B(A).
 * La seconde barre est dessinée à l'ÉCHELLE DE LA POPULATION ENTIÈRE et bornée
 * à B, avec le contour de B en pointillés : le sous-groupe se voit comme un
 * morceau du groupe, jamais comme une barre autonome. C'est ce qui rend visible
 * que le même bloc magenta occupe une fraction différente selon la largeur de B.
 *
 * OÙ VIVENT LES NOMBRES. Dans le DOM, sous la figure, jamais en `<text>` SVG
 * (§6bis.4) : les trois lectures — P(A ∩ B), P_B(A), P_A(B) — sont des lignes
 * de tableau, avec leur quotient en toutes lettres. Aucune collision n'est donc
 * possible quand une part devient minuscule ; DraggableSplitBar gère seul le
 * rejet des effectifs qui ne tiennent plus dans leur segment.
 *
 * JAMAIS FIGÉ. Pas de prop `disabled` liée à la validation d'une étape : le
 * seul verrou admis est l'ANTÉRIORITÉ (`locked`, passé par le module quand
 * l'étape précédente n'est pas faite), et il ne s'arme jamais APRÈS une
 * réussite. Un élève qui vient de comprendre doit pouvoir refaire le geste.
 */
export default function SplitPopulationLab({
  state,
  onChange,
  locked = false,
  highlight = null,       // 'inter' | 'condBA' | 'condAB' — la ligne mise en avant
  showAll = true,
}) {
  const r = barReadings(state);
  const { nAB, nB, nA } = r;
  const nNotB = BAR_TOTAL - nB;

  const setNB = (v) => {
    // La seconde séparation ne peut pas déborder de la première : quand B
    // rétrécit sous l'intersection, l'intersection le suit. La contrainte est
    // APPLIQUÉE, pas seulement espérée — un état interdit ferait lever
    // `composition` au milieu d'un glissement.
    onChange({ ...state, nB: v, nAB: Math.min(state.nAB, v) });
  };
  const setNAB = (v) => onChange({ ...state, nAB: Math.min(v, state.nB) });

  const rows = [
    {
      id: 'inter',
      label: <>P(A ∩ B) — cyclistes <em>et</em> proches du centre, sur toute la population</>,
      num: nAB, den: BAR_TOTAL, value: r.inter,
      tone: 'slate',
    },
    {
      id: 'condBA',
      label: <>P<sub>B</sub>(A) — parmi les seuls <strong>{BAR_LABELS.bShort}</strong>, la part de cyclistes</>,
      num: nAB, den: nB, value: r.condBA,
      tone: 'indigo',
    },
    {
      id: 'condAB',
      label: <>P<sub>A</sub>(B) — parmi les seuls <strong>{BAR_LABELS.aShort}</strong>, la part de proches du centre</>,
      num: nAB, den: nA, value: r.condAB,
      tone: 'fuchsia',
    },
  ];
  const shown = showAll ? rows : rows.filter((x) => x.id === highlight || x.id === 'inter');

  const TONES = {
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    fuchsia: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900',
  };

  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {BAR_TOTAL} {BAR_LABELS.total}
        {locked ? '' : ' — attrape un trait noir et fais-le glisser'}
      </p>

      {/* SÉPARATION 1 — le dénominateur de P_B(A) */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">
          Où passe la limite du centre ? <span className="text-slate-400">(première séparation)</span>
        </p>
        <DraggableSplitBar
          total={BAR_TOTAL}
          value={nB}
          onChange={setNB}
          step={BAR_STEP}
          locked={locked}
          height={54}
          colors={{ part: '#4f46e5', rest: '#cbd5e1' }}
          labels={{ part: 'proches', rest: 'plus loin' }}
          ariaLabel="Nombre d’habitants proches du centre"
          valueText={`${nB} habitants proches du centre sur ${BAR_TOTAL}, ${nNotB} plus loin`}
        />
      </div>

      {/* SÉPARATION 2 — le numérateur, à l'intérieur de B */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500">
          Parmi ces {nB} habitants, combien font du vélo ?{' '}
          <span className="text-slate-400">(seconde séparation)</span>
        </p>
        <DraggableSplitBar
          total={BAR_TOTAL}
          value={nAB}
          onChange={setNAB}
          step={BAR_STEP}
          locked={locked}
          height={36}
          colors={{ part: '#c026d3', rest: '#eef2f7' }}
          labels={{ part: 'cyclistes', rest: '' }}
          ariaLabel="Nombre de cyclistes proches du centre"
          valueText={`${nAB} cyclistes parmi les ${nB} habitants proches du centre`}
        >
          {/* Le contour de B : la borne se VOIT, elle n'est pas seulement
              appliquée en silence quand la poignée bute. */}
          <rect
            x={0} y={0} width={(nB / BAR_TOTAL) * 1000} height={36}
            fill="#4f46e5" fillOpacity="0.12" stroke="#4f46e5" strokeOpacity="0.55"
            strokeWidth="2" strokeDasharray="6 4" rx="6"
          />
        </DraggableSplitBar>
      </div>

      {/* LES LECTURES — dans le DOM, jamais en texte SVG. */}
      <div className="space-y-2">
        {shown.map((row) => {
          const on = highlight === row.id;
          return (
            <div
              key={row.id}
              className={`rounded-xl border-2 px-3 py-2.5 transition ${TONES[row.tone]} ${on ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <p className="text-xs mb-1">{row.label}</p>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-mono">
                <span className="text-lg font-black tabular-nums">
                  {row.den === 0 ? '— / 0' : quotient(row.num, row.den)}
                </span>
                <span className="opacity-40">=</span>
                <span className="text-lg font-black tabular-nums">
                  {row.value === null ? '—' : pct(row.value, 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Effectifs : <strong className="tabular-nums">{nAB}</strong> cyclistes proches du centre ·{' '}
        <strong className="tabular-nums">{nB}</strong> proches du centre ·{' '}
        <strong className="tabular-nums">{nA}</strong> cyclistes en tout ·{' '}
        <strong className="tabular-nums">{BAR_TOTAL}</strong> habitants.
        {r.condBA !== null && r.condAB !== null && ratValue(r.condBA) !== ratValue(r.condAB) && (
          <> Les deux pourcentages conditionnels diffèrent : ce ne sont pas les mêmes univers.</>
        )}
      </p>
    </div>
  );
}
