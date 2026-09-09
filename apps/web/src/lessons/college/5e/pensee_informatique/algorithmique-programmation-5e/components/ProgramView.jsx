import React from 'react';
import { INSTRUCTION_LABELS, ecrireValeur, estLecture, evalValeur } from './trace';

/**
 * ProgramView — le programme, tel que l'élève le lit.
 *
 * Une carte par instruction, dans l'ordre. Une carte RÉPÉTER contient ses
 * instructions, visiblement DEDANS (fond et liseré) : la boucle se voit comme
 * un bloc qui enveloppe, pas comme une ligne de plus.
 *
 * LA VARIABLE SE VOIT ÊTRE LUE. Quand une valeur est une lecture (`cote`), la
 * carte affiche le NOM, et sous lui la valeur lue à l'instant. C'est toute la
 * différence entre « AVANCER de 60 » et « AVANCER de cote (= 60) » : dans le
 * second cas, l'élève voit le programme aller CHERCHER la valeur ailleurs.
 * C'est l'objectif officiel « définir et utiliser des variables (lecture) »,
 * rendu visible plutôt qu'énoncé.
 *
 * `actif` surligne l'instruction en cours d'exécution — le lien entre la
 * ligne du programme et le trait qui apparaît (§10, représentations liées).
 */
function Valeur({ valeur, env, unite = '' }) {
  if (!estLecture(valeur)) {
    return <span className="font-mono font-black tabular-nums">{valeur}{unite}</span>;
  }
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono font-black text-violet-700">{ecrireValeur(valeur)}</span>
      <span className="rounded-md bg-violet-100 px-1.5 py-0.5 font-mono text-xs font-bold text-violet-800 tabular-nums">
        = {evalValeur(valeur, env)}{unite}
      </span>
    </span>
  );
}

function Carte({ noeud, env, actif, tonAtone }) {
  const meta = INSTRUCTION_LABELS[noeud.kind];
  const base = 'rounded-xl border-2 px-3 py-2 flex items-center gap-2.5 text-sm transition-colors';
  const ton = actif
    ? 'border-amber-400 bg-amber-50 text-amber-900'
    : tonAtone
      ? 'border-slate-200 bg-slate-50 text-slate-500'
      : 'border-slate-200 bg-white text-slate-700';

  return (
    <div className={`${base} ${ton}`}>
      <span aria-hidden="true" className="text-base leading-none">{meta.icon}</span>
      <span className="font-mono text-xs font-bold uppercase tracking-wide">{meta.label}</span>
      {noeud.kind === 'AVANCER' && (
        <span className="ml-auto"><Valeur valeur={noeud.valeur} env={env} /></span>
      )}
      {noeud.kind === 'TOURNER' && (
        <span className="ml-auto"><Valeur valeur={noeud.valeur} env={env} unite="°" /></span>
      )}
    </div>
  );
}

export default function ProgramView({
  programme,
  env = {},
  actif = null,        // { srcIndex, corpsIndex } — l'instruction en cours
  compact = false,
  titre = 'Le programme',
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      {titre && (
        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">{titre}</p>
      )}
      <ol className="space-y-1.5" aria-label={titre}>
        {programme.map((noeud, i) => {
          if (noeud.kind !== 'REPETER') {
            return (
              <li key={i}>
                <Carte noeud={noeud} env={env} actif={actif?.srcIndex === i && actif?.corpsIndex == null} />
              </li>
            );
          }
          const fois = evalValeur(noeud.fois, env);
          return (
            <li key={i}>
              <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-2 space-y-1.5">
                <div className="flex items-center gap-2 px-1">
                  <span aria-hidden="true">🔁</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wide text-purple-800">
                    Répéter
                  </span>
                  <span className="font-mono text-sm font-black text-purple-900">
                    <Valeur valeur={noeud.fois} env={env} />
                  </span>
                  <span className="text-xs font-semibold text-purple-700">fois</span>
                </div>
                {/* Le corps est visiblement DEDANS : décalé, sur son propre fond. */}
                <ol className="space-y-1.5 border-l-[3px] border-purple-300 pl-2.5">
                  {noeud.corps.map((b, j) => (
                    <li key={j}>
                      <Carte
                        noeud={b}
                        env={env}
                        actif={actif?.srcIndex === i && actif?.corpsIndex === j}
                      />
                    </li>
                  ))}
                </ol>
                {!compact && (
                  <p className="px-1 text-[11px] text-purple-700">
                    soit <strong>{fois * noeud.corps.length}</strong> instructions exécutées,
                    écrites en <strong>{noeud.corps.length}</strong>.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
