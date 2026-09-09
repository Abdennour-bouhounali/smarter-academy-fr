import React from 'react';
import { EXPERIENCES, cumuler, attendue, ecartMax, pct, fr } from './probabilites';

/**
 * SimulationLab — la répétition, et la fréquence qui se stabilise.
 *
 * L'élève lance par SALVES (+10, +100, +1000) qui s'ajoutent aux
 * précédentes : c'est la MÊME série qu'on regarde grandir, pas une suite
 * d'expériences séparées. C'est ce cumul qui rend le constat honnête —
 * repartir de zéro à chaque salve donnerait l'illusion que « plus on lance,
 * plus on a de chance de tomber juste », ce qui est faux.
 *
 * Le tirage est RÉEL et reproductible (mulberry32 du noyau partagé) : deux
 * élèves qui lancent la même salve depuis le même état obtiennent la même
 * chose, ce qui rend l'observation explicable et rejouable.
 *
 * `montrerAttendue` est faux au module 5 : l'élève doit d'abord voir un
 * nombre APPARAÎTRE, sans qu'on lui dise lequel attendre. Le module 6 le
 * repasse à vrai, et la barre de la probabilité vient se superposer là où
 * l'élève l'avait déjà vue.
 *
 * JAMAIS GELÉ : aucun `disabled` lié à la validation de l'étape.
 */
export default function SimulationLab({
  experience,
  sim,
  onSim,
  montrerAttendue = false,
  salves = [10, 100, 1000],
  ariaLabel,
}) {
  const exp = EXPERIENCES[experience];
  const total = sim.total;
  const ecart = ecartMax(exp, sim);

  const lancer = (n) => onSim(cumuler(exp, sim, n));
  const remettre = () => onSim({ ...sim, total: 0, parIssue: Object.fromEntries(exp.issues.map((i) => [i.id, 0])) });

  const maxFreq = Math.max(
    0.35,
    ...exp.issues.map((i) => (total === 0 ? 0 : (sim.parIssue[i.id] ?? 0) / total)),
  );

  return (
    <div className="space-y-3" aria-label={ariaLabel ?? `Simulation : ${exp.nom}`}>
      {/* ── Les commandes : une seule action par bouton ────────────── */}
      <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {exp.emoji} {exp.nom}
          </span>
          <span className="font-mono text-sm font-black tabular-nums text-emerald-900">
            {total.toLocaleString('fr-FR')} lancer{total > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {salves.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => lancer(n)}
              className="rounded-lg border-2 border-emerald-400 bg-white px-3 py-1.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
            >
              + {n.toLocaleString('fr-FR')}
            </button>
          ))}
          <button
            type="button"
            onClick={remettre}
            className="ml-auto rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-500 transition hover:border-slate-300"
          >
            ↺ Repartir de zéro
          </button>
        </div>
      </div>

      {/* ── Les fréquences observées ───────────────────────────────── */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
        {total === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500 italic">
            Rien n’a encore été lancé : il n’y a aucune fréquence à observer.
          </p>
        ) : (
          <ul className="space-y-2">
            {exp.issues.map((issue) => {
              const eff = sim.parIssue[issue.id] ?? 0;
              const freq = eff / total;
              const att = attendue(exp, issue);
              return (
                <li key={issue.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700">
                      {issue.couleur && (
                        <span
                          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
                          style={{ background: issue.couleur }}
                        />
                      )}
                      {issue.label}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {eff.toLocaleString('fr-FR')} / {total.toLocaleString('fr-FR')} ={' '}
                      <strong className="text-slate-800">{pct(freq)}</strong>
                    </span>
                  </div>
                  {/* La barre : longueur = fréquence, échelle commune à
                      toutes les lignes pour que la comparaison soit juste. */}
                  <div className="relative h-5 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className="h-full rounded-md bg-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (freq / maxFreq) * 100)}%` }}
                    />
                    {/* Le repère de la probabilité attendue — seulement une
                        fois que la leçon l'a introduite (module 6). */}
                    {montrerAttendue && (
                      <div
                        className="absolute inset-y-0 w-0.5 bg-purple-600"
                        style={{ left: `${Math.min(100, (att / maxFreq) * 100)}%` }}
                        aria-hidden
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── L'écart : le nombre qui doit diminuer ──────────────────── */}
      {total > 0 && (
        <div
          className={`rounded-xl border-2 p-3 text-center text-sm ${
            ecart < 1
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : ecart < 5
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
          role="status"
        >
          {montrerAttendue ? (
            <>
              Écart maximal entre la fréquence observée et la probabilité :{' '}
              <strong className="font-mono">{fr(ecart, 2)} point{ecart >= 2 ? 's' : ''}</strong>
              {ecart < 1 && ' — les barres et le repère violet se confondent presque.'}
            </>
          ) : (
            <>
              Sur <strong className="font-mono">{total.toLocaleString('fr-FR')}</strong> lancers,
              les barres {total < 100 ? 'sautent encore dans tous les sens' : total < 2000 ? 's’égalisent peu à peu' : 'ne bougent presque plus'}.
              {total >= 2000 && ' Continue : vers quel nombre chaque fréquence se cale-t-elle ?'}
            </>
          )}
        </div>
      )}
    </div>
  );
}
