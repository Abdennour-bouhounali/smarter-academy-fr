import React from 'react';
import {
  LAB_PAS_ADDITIFS, LAB_PAS_MULTIPLICATIFS, LAB_U0,
  rangMaxLab, etatLab, fr,
} from './suitesUtils';

/**
 * MachineLab — l'interaction SIGNATURE : la machine à deux boutons.
 *
 * Activity               deux usines à nombres côte à côte, réglées par deux
 *                        cliquets. L'élève appuie sur « +1 rang » et chaque
 *                        usine produit son terme suivant : l'une AJOUTE son
 *                        montant, l'autre MULTIPLIE par son facteur. Les
 *                        termes tombent dans deux piles, et l'ÉCART entre deux
 *                        termes consécutifs est dessiné en accolade à côté de
 *                        chaque pile.
 * Mathematical objective il y a deux façons de fabriquer une suite ; ce qui
 *                        est constant n'est pas le terme, c'est le PAS — une
 *                        différence pour l'une, un rapport pour l'autre.
 * Student action         régler les deux montants au cliquet, puis appuyer sur
 *                        « +1 rang ». La variable pilotée est le RANG n,
 *                        cliquet discret, jamais un curseur.
 * Controlled variable    n (et, en réglage, les deux pas).
 * Mathematical state     { pasAdd, pasMul, rang } ; piles, écarts et rapports
 *                        en sont TOUS dérivés (`etatLab`).
 * Visual consequence     les deux colonnes s'allongent d'une case ; passé le
 *                        rang 2, la pile multiplicative décroche.
 * Expected observation   « elles donnaient les mêmes nombres et d'un coup
 *                        elles s'écartent — ce n'est pas le terme qui est
 *                        pareil, c'est ce qu'on fait à chaque fois ».
 * Misconception targeted « deux listes qui commencent pareil sont la même
 *                        suite » ; « multiplier, c'est ajouter plusieurs fois,
 *                        donc c'est la même chose en plus rapide ».
 *
 * SÉCURITÉ DE MISE EN PAGE. Les nombres vivent dans le DOM, dans des cases qui
 * s'empilent et défilent horizontalement — jamais en <text> SVG posé près
 * d'une valeur qui explose. Le rang atteignable est PLAFONNÉ par `rangMaxLab`,
 * dérivé de `LAB_PLAFOND` : sans lui, le rang 8 en ×3 vaudrait 13 122. Le
 * balayage complet est un test (`suitesUtils.test.js`).
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 */
export default function MachineLab({
  pasAdd,
  pasMul,
  rang,
  onChangePasAdd,
  onChangePasMul,
  onChangeRang,
  disabled = false,
  reglagesVerrouilles = false,
}) {
  const nMax = rangMaxLab(pasAdd, pasMul);
  const rangSur = Math.min(rang, nMax);
  const e = etatLab(pasAdd, pasMul, rangSur);

  const idxAdd = LAB_PAS_ADDITIFS.indexOf(pasAdd);
  const idxMul = LAB_PAS_MULTIPLICATIFS.indexOf(pasMul);
  const gelReglage = disabled || reglagesVerrouilles;

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnFort =
    'min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 ' +
    'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3">
      {/* ── Les deux usines, côte à côte ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Usine
          titre="Usine A"
          sousTitre="elle AJOUTE toujours le même montant"
          tone="emerald"
          list={e.add}
          pas={pasAdd}
          signe="+"
          libellePas={`+ ${fr(pasAdd)}`}
          ecarts={e.ecartsAdd}
          reglage={
            <Reglage
              label="montant ajouté"
              valeur={`+ ${fr(pasAdd)}`}
              onMoins={() => onChangePasAdd?.(LAB_PAS_ADDITIFS[idxAdd - 1])}
              onPlus={() => onChangePasAdd?.(LAB_PAS_ADDITIFS[idxAdd + 1])}
              peutMoins={!gelReglage && idxAdd > 0}
              peutPlus={!gelReglage && idxAdd >= 0 && idxAdd < LAB_PAS_ADDITIFS.length - 1}
              btn={btn}
            />
          }
        />
        <Usine
          titre="Usine B"
          sousTitre="elle MULTIPLIE toujours par le même facteur"
          tone="rose"
          list={e.mul}
          pas={pasMul}
          signe="×"
          libellePas={`× ${fr(pasMul)}`}
          ecarts={e.ecartsMul}
          reglage={
            <Reglage
              label="facteur multiplié"
              valeur={`× ${fr(pasMul)}`}
              onMoins={() => onChangePasMul?.(LAB_PAS_MULTIPLICATIFS[idxMul - 1])}
              onPlus={() => onChangePasMul?.(LAB_PAS_MULTIPLICATIFS[idxMul + 1])}
              peutMoins={!gelReglage && idxMul > 0}
              peutPlus={!gelReglage && idxMul >= 0 && idxMul < LAB_PAS_MULTIPLICATIFS.length - 1}
              btn={btn}
            />
          }
        />
      </div>

      {/* ── Le cliquet du RANG : la variable pilotée ───────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Faire avancer le rang">
        <button
          type="button"
          className={btn}
          onClick={() => onChangeRang?.(rangSur - 1)}
          disabled={disabled || rangSur <= 0}
          aria-label="Revenir d’un rang"
        >
          ← −1 rang
        </button>
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-white">
          rang n = {fr(rangSur)}
        </span>
        <button
          type="button"
          className={btnFort}
          onClick={() => onChangeRang?.(rangSur + 1)}
          disabled={disabled || rangSur >= nMax}
          aria-label="Faire avancer d’un rang"
        >
          +1 rang →
        </button>
        {rangSur >= nMax && (
          <span className="text-[13px] text-slate-500">
            dernier rang lisible avec ces réglages
          </span>
        )}
      </div>

      {/* ── La lecture comparée, en DOM ────────────────────────────────── */}
      <div
        className="rounded-xl border border-slate-200 bg-white p-3"
        aria-live="polite"
        aria-label={
          `Usine A, qui ajoute ${fr(pasAdd)} : ${e.add.map(fr).join(', ')}. `
          + `Usine B, qui multiplie par ${fr(pasMul)} : ${e.mul.map(fr).join(', ')}. `
          + (e.rangDeDivergence === null
            ? 'Les deux piles sont identiques.'
            : `Les deux piles se séparent au rang ${e.rangDeDivergence}.`)
        }
      >
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2">
            <div className="text-[13px] text-emerald-800">terme de rang {fr(rangSur)} — usine A</div>
            <div className="font-mono text-lg font-black tabular-nums text-emerald-900">{fr(e.add[rangSur])}</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2">
            <div className="text-[13px] text-rose-800">terme de rang {fr(rangSur)} — usine B</div>
            <div className="font-mono text-lg font-black tabular-nums text-rose-900">{fr(e.mul[rangSur])}</div>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-slate-700">
          {e.rangDeDivergence === null ? (
            <>Les deux piles donnent pour l’instant les <strong>mêmes nombres</strong>.</>
          ) : e.rangDeDivergence === 0 ? (
            <>Elles diffèrent <strong>dès le premier nombre</strong>.</>
          ) : (
            <>
              Elles donnent les mêmes nombres jusqu’au rang{' '}
              <strong>{fr(e.rangDeDivergence - 1)}</strong>, puis se séparent au rang{' '}
              <strong>{fr(e.rangDeDivergence)}</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Une usine : son réglage, sa pile, ses accolades ─────────────────── */
function Usine({ titre, sousTitre, tone, list, signe, libellePas, ecarts, reglage }) {
  const t = {
    emerald: {
      cadre: 'border-emerald-200 bg-emerald-50/40',
      titre: 'text-emerald-900',
      case: 'border-emerald-200 bg-white text-emerald-900',
      accolade: 'text-emerald-700',
    },
    rose: {
      cadre: 'border-rose-200 bg-rose-50/40',
      titre: 'text-rose-900',
      case: 'border-rose-200 bg-white text-rose-900',
      accolade: 'text-rose-700',
    },
  }[tone];

  return (
    <div className={`rounded-2xl border-2 p-3 space-y-3 ${t.cadre}`}>
      <div>
        <div className={`text-sm font-black ${t.titre}`}>{titre}</div>
        <div className="text-[13px] text-slate-600">{sousTitre}</div>
      </div>
      {reglage}

      {/* La pile : une case par rang, l'accolade du pas entre deux cases.
          Elle descend, comme des termes qui « tombent » l'un sous l'autre. */}
      <ol className="space-y-1">
        {list.map((v, i) => (
          <li key={i}>
            {i > 0 && (
              <div className={`flex items-center gap-1.5 pl-4 text-[13px] font-mono font-bold ${t.accolade}`}>
                <span aria-hidden="true">⌐</span>
                <span>
                  {signe} {libellePas.slice(2)}
                  <span className="ml-2 font-normal text-slate-500">
                    (écart {fr(ecarts[i - 1])})
                  </span>
                </span>
              </div>
            )}
            <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${t.case}`}>
              <span className="w-14 shrink-0 font-mono text-[13px] opacity-70">rang {fr(i)}</span>
              <span className="font-mono text-base font-black tabular-nums">{fr(v)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Le cliquet d'un réglage ─────────────────────────────────────────── */
function Reglage({ label, valeur, onMoins, onPlus, peutMoins, peutPlus, btn }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="text-[13px] text-slate-600">{label}</span>
      <button type="button" className={btn} onClick={onMoins} disabled={!peutMoins} aria-label={`Diminuer : ${label}`}>
        −
      </button>
      <span className="rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 font-mono text-sm font-black tabular-nums">
        {valeur}
      </span>
      <button type="button" className={btn} onClick={onPlus} disabled={!peutPlus} aria-label={`Augmenter : ${label}`}>
        +
      </button>
    </div>
  );
}

/** Réglages de départ du laboratoire : volontairement MAL réglés. */
export const LAB_DEPART = { pasAdd: LAB_PAS_ADDITIFS[0], pasMul: LAB_PAS_MULTIPLICATIFS[0], rang: 1, u0: LAB_U0 };
