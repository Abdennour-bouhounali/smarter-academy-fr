import React from 'react';
import {
  SAUT_U0, SAUT_R, SAUT_CIBLE, SAUT_SEUIL_CLICS, etatSaut, sautTerme, fr,
} from './sommesUtils';

/**
 * SautLab — l'interaction SIGNATURE, temps 1 : « Sauter au rang 30 ».
 *
 * Activity               une seule suite, un seul bouton. « +1 rang » fabrique
 *                        le terme suivant, et un COMPTEUR DE CLICS s'incrémente
 *                        à chaque pression. La cible est le rang 30. Après une
 *                        dizaine de clics, une seconde commande apparaît —
 *                        « aller directement au rang… » — mais elle exige un
 *                        nombre, celui du terme visé.
 * Mathematical objective une définition de proche en proche est une MARCHE ;
 *                        atteindre un rang lointain coûte autant de calculs que
 *                        de rangs. Une écriture directe est un SAUT.
 * Student action         cliquer, encore, encore — puis constater qu'il reste
 *                        vingt pas, et chercher autre chose.
 * Controlled variable    le rang n (cliquet discret, jamais un curseur).
 * Mathematical state     { rang, clics } ; le terme, la trace des marches et
 *                        le nombre de pas restants en sont TOUS dérivés
 *                        (`etatSaut`).
 * Visual consequence     la colonne des marches s'allonge d'une case, le
 *                        compteur monte, et la barre « chemin parcouru » avance
 *                        très peu.
 * Expected observation   « je clique depuis une minute et je suis au rang 12 ;
 *                        il en reste dix-huit — il doit y avoir un moyen. »
 * Misconception targeted « la relation de proche en proche suffit à tout » ;
 *                        « le rang 30, c'est trente fois la raison, donc 90 »
 *                        (on oublie u(0)).
 *
 * SÉCURITÉ DE MISE EN PAGE. Les nombres vivent dans le DOM. La trace des
 * marches ne montre que les SIX derniers rangs plus le premier — sans quoi
 * trente et une cases déborderaient sur mobile ; le balayage est un test.
 * Le rang est borné à [0, 30] par `etatSaut`, et u(30) = 95 tient sur trois
 * chiffres.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire la montée — et c'est même le geste qu'on veut voir refait, une fois
 * la formule connue.
 */
export default function SautLab({
  rang,
  clics,
  onPas,
  onSaut,
  disabled = false,
  saisieSaut = '',
  onChangeSaisieSaut,
}) {
  const e = etatSaut(rang, clics);

  // Les marches montrées : le premier rang, puis les six derniers. Au-delà,
  // trente et une cases ne tiennent pas à 375 px.
  const marches = e.marches.map((v, i) => ({ i, v }));
  const visibles = marches.length <= 7
    ? marches
    : [marches[0], null, ...marches.slice(-6)];

  const btn =
    'min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnLeger =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-black text-indigo-900">
          u(0) = {fr(SAUT_U0)} &nbsp;et&nbsp; u(n+1) = u(n) + {fr(SAUT_R)}
        </div>
        <div className="text-[13px] text-indigo-800">
          objectif : atteindre le <strong>rang {fr(SAUT_CIBLE)}</strong>
        </div>
      </div>

      {/* ── Le compteur de clics : le COÛT, rendu visible ───────────────── */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <Compteur label="rang atteint" valeur={fr(e.rang)} tone="indigo" />
        <Compteur label="terme u(n)" valeur={fr(e.terme)} tone="emerald" />
        <Compteur label="clics dépensés" valeur={fr(e.clics)} tone="rose" />
      </div>

      {/* ── La barre de chemin : elle avance très peu, exprès ───────────── */}
      <div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-white ring-1 ring-indigo-200"
          role="img"
          aria-label={`Chemin parcouru : rang ${e.rang} sur ${SAUT_CIBLE}`}
        >
          <div
            className="h-full rounded-full bg-indigo-400 transition-[width]"
            style={{ width: `${(e.rang / SAUT_CIBLE) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[13px] text-slate-600">
          {e.atteint ? (
            <>
              Rang {fr(SAUT_CIBLE)} atteint. <strong>u({fr(SAUT_CIBLE)}) = {fr(e.terme)}</strong>.
            </>
          ) : (
            <>
              Il reste <strong>{fr(e.restants)}</strong> pas à faire à la main.
            </>
          )}
        </p>
      </div>

      {/* ── La trace des marches, en DOM ────────────────────────────────── */}
      <ol className="flex flex-wrap items-center gap-1.5" aria-live="polite">
        {visibles.map((m, k) =>
          m === null ? (
            <li key={`gap-${k}`} className="font-mono text-sm text-slate-400" aria-hidden="true">
              …
            </li>
          ) : (
            <li
              key={m.i}
              className={`rounded-lg border px-2 py-1 text-center ${
                m.i === e.rang
                  ? 'border-indigo-400 bg-indigo-100 text-indigo-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="block font-mono text-[13px] opacity-70">rang {fr(m.i)}</span>
              <span className="block font-mono text-sm font-black tabular-nums">{fr(m.v)}</span>
            </li>
          ),
        )}
      </ol>

      {/* ── La seule commande du départ : un pas ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Avancer d’un rang">
        <button
          type="button"
          className={btnLeger}
          onClick={() => onPas?.(-1)}
          disabled={disabled || e.rang <= 0}
          aria-label="Revenir d’un rang"
        >
          ← −1 rang
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => onPas?.(1)}
          disabled={disabled || e.atteint}
          aria-label="Avancer d’un rang"
        >
          +1 rang →
        </button>
        {e.atteint && (
          <span className="text-[13px] font-semibold text-emerald-700">objectif atteint</span>
        )}
      </div>

      {/* ── Le raccourci, qui n'apparaît qu'APRÈS l'exaspération ────────── */}
      {e.sautOuvert ? (
        <div className="space-y-2 rounded-xl border-2 border-violet-300 bg-violet-50 p-3">
          <div className="text-[13px] font-bold text-violet-900">
            ⤻ Aller directement au rang {fr(SAUT_CIBLE)}
          </div>
          <p className="text-[13px] text-violet-800">
            Cette commande n’avance pas d’un pas : elle demande <strong>le nombre</strong> qui se
            trouve au rang {fr(SAUT_CIBLE)}. Il faut donc le connaître avant de l’utiliser.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-[13px] text-violet-900" htmlFor="saut-valeur">
              u({fr(SAUT_CIBLE)}) =
            </label>
            <input
              id="saut-valeur"
              type="text"
              inputMode="numeric"
              className="h-11 w-28 rounded-lg border-2 border-violet-300 bg-white px-3 font-mono text-sm font-bold tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={saisieSaut}
              onChange={(ev) => onChangeSaisieSaut?.(ev.target.value)}
              disabled={disabled}
              aria-label={`Valeur du terme de rang ${SAUT_CIBLE}`}
            />
            <button
              type="button"
              className={btn}
              onClick={() => onSaut?.(saisieSaut)}
              disabled={disabled || saisieSaut === ''}
            >
              Sauter
            </button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-2.5 text-[13px] text-slate-600">
          Une seule commande pour l’instant. ({fr(SAUT_SEUIL_CLICS - Math.min(clics, SAUT_SEUIL_CLICS))}{' '}
          clic{SAUT_SEUIL_CLICS - Math.min(clics, SAUT_SEUIL_CLICS) > 1 ? 's' : ''} avant qu’une
          autre ne s’ouvre.)
        </p>
      )}
    </div>
  );
}

function Compteur({ label, valeur, tone }) {
  const t = {
    indigo: 'border-indigo-200 bg-white text-indigo-900',
    emerald: 'border-emerald-200 bg-white text-emerald-900',
    rose: 'border-rose-200 bg-white text-rose-900',
  }[tone];
  return (
    <div className={`rounded-lg border px-2 py-2 ${t}`}>
      <div className="text-[13px] opacity-80">{label}</div>
      <div className="font-mono text-lg font-black tabular-nums">{valeur}</div>
    </div>
  );
}

/** L'état de départ du laboratoire : au rang 0, aucun clic dépensé. */
export const SAUT_DEPART = { rang: 0, clics: 0 };

/** La valeur que le raccourci attend — la leçon ne la code jamais en dur. */
export const SAUT_VALEUR_CIBLE = sautTerme(SAUT_CIBLE);
