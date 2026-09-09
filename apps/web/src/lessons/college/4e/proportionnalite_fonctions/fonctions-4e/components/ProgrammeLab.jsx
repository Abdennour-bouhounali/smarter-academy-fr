import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  trace, inverser, estInversible, raisonNonInversible, frRat, OP_LABEL,
} from './fonctions4e';

/**
 * ProgrammeLab — la manipulation SIGNATURE de la leçon (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity               glisser un nombre d'entrée et le VOIR descendre les
 *                        cases une à une, puis retourner la chaîne et le voir
 *                        remonter jusqu'à son point de départ.
 * Mathematical objective un programme de calcul est une CHAÎNE ORIENTÉE.
 *                        Parce qu'elle est orientée, elle se descend et elle
 *                        se remonte — et remonter ne consiste pas à relire la
 *                        chaîne à l'envers : l'ORDRE se retourne ET chaque
 *                        opération se défait.
 * Student action         glisser l'entrée (cran par cran), basculer le sens
 *                        de la chaîne, changer la case à l'origine du
 *                        contre-exemple.
 * Controlled variable    la valeur d'entrée, et le SENS de parcours. Les
 *                        étapes sont fixées par le module.
 * Mathematical state     (prog, x, sens). TOUT le reste — chaque valeur
 *                        intermédiaire, la chaîne inverse, le verdict de
 *                        l'aller-retour — est DÉRIVÉ par `trace` et
 *                        `inverser`, jamais écrit à la main.
 * Visual consequence     chaque case affiche la valeur qui SORT d'elle ; en
 *                        sens inverse, les cases se renversent et leurs
 *                        opérations changent de signe sous les yeux.
 * Expected observation   « ce n'est pas la même chaîne écrite à l'envers —
 *                        l'ordre aussi s'est retourné » ; et, sur « ×0 »,
 *                        « on ne sait plus d'où on venait ».
 * Misconception targeted remonter sans retourner l'ordre (« ÷3 puis −2 »
 *                        au lieu de « −2 puis ÷3 ») ; croire qu'un programme
 *                        est une recette et non une chaîne réversible.
 *
 * CE QUE CE LABO NE FAIT PAS (laissé aux modules suivants) : le tableau de
 * plusieurs entrées (M2), la FORMULE qui résume la chaîne (M3), le tableau
 * sans machine (M4), le graphique (M5), la modélisation (M6). Ici on descend
 * et on remonte UNE valeur : le reste attend.
 *
 * SÉCURITÉ VISUELLE (§6ter.5 / §17bis) : aucun SVG, aucun <text>. La chaîne
 * est une pile de blocs DOM, chaque nombre dans sa propre colonne à largeur
 * fixe — rien ne peut se chevaucher, quel que soit le nombre de chiffres
 * (« 1/3 » comme « −300 »). Les valeurs exactes passent par `frRat`, qui rend
 * une fraction quand le résultat ne tombe pas juste.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement (mémoire « manipulations
 * gelées après validation »). Le labo reste vivant jusqu'à la fin du module.
 */

/** Une case de la chaîne : son opération, et la valeur qui en sort. */
function Case({ op, val, sortie, actif, ton }) {
  const tons = {
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    slate: 'border-slate-200 bg-white text-slate-700',
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-colors ${
        actif ? tons[ton] : tons.slate
      }`}
    >
      <span className="w-24 shrink-0 font-mono text-base font-black tabular-nums">
        {op} {frRat(val)}
      </span>
      <span className="flex-1 text-[13px] opacity-75">{OP_LABEL[op]} {frRat(val)}</span>
      <span className="w-24 shrink-0 text-right font-mono text-base font-black tabular-nums">
        {sortie}
      </span>
    </div>
  );
}

/** La valeur d'entrée ou de sortie, dans son propre bandeau. */
function Borne({ label, valeur, ton = 'slate' }) {
  const tons = {
    indigo: 'border-indigo-400 bg-indigo-100 text-indigo-900',
    emerald: 'border-emerald-400 bg-emerald-100 text-emerald-900',
    slate: 'border-slate-300 bg-slate-100 text-slate-800',
  };
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-2.5 ${tons[ton]}`}>
      <span className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</span>
      <span className="font-mono text-xl font-black tabular-nums">{valeur}</span>
    </div>
  );
}

export default function ProgrammeLab({
  prog,
  x,
  onX,
  min = -10,
  max = 20,
  sens = 'descente',        // 'descente' | 'remontee'
  onSens,
  entreeNom = 'entrée',
  sortieNom = 'sortie',
  labelSens = true,
}) {
  const inversible = estInversible(prog);
  const raison = raisonNonInversible(prog);

  // ── TOUT est dérivé de (prog, x) : rien n'est écrit à la main. ────────
  const aller = trace(prog, x);
  const sortie = aller.arrivee;

  // La remontée part de la SORTIE calculée, et refait le chemin à l'envers.
  const progInverse = inversible ? inverser(prog) : null;
  const retour = inversible ? trace(progInverse, sortie) : null;
  // L'aller-retour referme-t-il ? En rationnels exacts, il le DOIT.
  const referme = retour ? retour.arrivee.n === aller.depart.n && retour.arrivee.d === aller.depart.d : false;

  const enRemontee = sens === 'remontee' && inversible;
  const chaine = enRemontee ? retour : aller;
  const ton = enRemontee ? 'emerald' : 'indigo';

  return (
    <div className="space-y-4" role="group" aria-label="Chaîne de calcul : la descendre puis la remonter">
      {/* ── Le nombre qu'on fait entrer ─────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <label htmlFor="prog-x" className="block text-sm font-bold text-slate-700">
          Le nombre qui entre dans la chaîne
        </label>
        <input
          id="prog-x"
          type="range"
          min={min}
          max={max}
          step={1}
          value={x}
          onChange={(e) => onX(Number(e.target.value))}
          className="sa-slider accent-indigo-600 w-full"
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={x}
          aria-valuetext={`entrée ${x}, sortie ${frRat(sortie)}`}
        />
        <div className="-mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{frRat(min)}</span>
          <span>0</span>
          <span>{frRat(max)}</span>
        </div>
      </div>

      {/* ── Le sens de parcours ─────────────────────────────────────── */}
      {labelSens && onSens && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSens('descente')}
            aria-pressed={sens === 'descente'}
            className={`min-h-[44px] flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
              sens === 'descente'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <ArrowDown className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Descendre la chaîne
          </button>
          <button
            type="button"
            onClick={() => onSens('remontee')}
            aria-pressed={sens === 'remontee'}
            className={`min-h-[44px] flex-1 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
              sens === 'remontee'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <ArrowUp className="mr-1 inline h-4 w-4" aria-hidden="true" />
            Remonter la chaîne
          </button>
        </div>
      )}

      {/* ── LA CHAÎNE ───────────────────────────────────────────────── */}
      <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-3">
        {!enRemontee ? (
          <>
            <Borne label={entreeNom} valeur={frRat(aller.depart)} ton="indigo" />
            {aller.etapes.map((e, i) => (
              <Case key={i} op={e.op} val={e.val} sortie={frRat(e.apres)} actif ton="indigo" />
            ))}
            <Borne label={sortieNom} valeur={frRat(aller.arrivee)} ton="slate" />
          </>
        ) : (
          <>
            <Borne label={sortieNom} valeur={frRat(retour.depart)} ton="emerald" />
            {retour.etapes.map((e, i) => (
              <Case key={i} op={e.op} val={e.val} sortie={frRat(e.apres)} actif ton="emerald" />
            ))}
            <Borne label={entreeNom} valeur={frRat(retour.arrivee)} ton="indigo" />
          </>
        )}
      </div>

      {/* ── Le verdict de l'aller-retour, ou la raison de son impossibilité ── */}
      {!inversible ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900">
          Impossible de remonter : {raison}.
        </p>
      ) : enRemontee ? (
        <p
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
            referme ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {referme
            ? `On repart de ${frRat(sortie)} et on retombe sur ${frRat(retour.arrivee)} : exactement le nombre du départ.`
            : `On repart de ${frRat(sortie)} et on retombe sur ${frRat(retour.arrivee)}, qui n’est pas le nombre du départ.`}
        </p>
      ) : (
        <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          {frRat(aller.depart)} entre, {frRat(aller.arrivee)} sort. Et si on partait de{' '}
          {frRat(aller.arrivee)} pour retrouver {frRat(aller.depart)} ?
        </p>
      )}
    </div>
  );
}
