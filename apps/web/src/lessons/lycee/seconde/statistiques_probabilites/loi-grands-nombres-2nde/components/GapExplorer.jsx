import React, { useState, useMemo } from 'react';
import { makeRng, runBernoulliTrials, formatPercent, formatNumber } from '../../../../../common/stats';

/**
 * GapExplorer — l'écart en FRÉQUENCE contre l'écart en NOMBRE.
 *
 * OBSERVATION ATTENDUE, et c'est le contre-sens le plus tenace de la
 * leçon : quand n grandit, |f − p| diminue, mais |succès − n·p| GRANDIT.
 * La loi des grands nombres ne dit pas que le nombre de Pile rattrape le
 * nombre de Face — elle ne parle que du quotient.
 *
 * Les deux colonnes sont calculées sur LA MÊME série, donc l'élève ne peut
 * pas attribuer la divergence à deux expériences différentes.
 *
 * HONNÊTETÉ STATISTIQUE — vérifié par components.test.js : sur quatre
 * tailles seulement, les deux colonnes ne sont PAS monotones à tous les
 * coups (une série de 100 peut être plus mauvaise qu'une série de 10 : c'est
 * la fluctuation du module 2, elle ne s'arrête pas ici). Le composant ne
 * promet donc jamais « ça descend à chaque ligne » : il affiche le rapport
 * entre la première et la dernière ligne, où l'ordre de grandeur est net,
 * et invite à rejouer. Annoncer une monotonie stricte serait un mensonge
 * visuel qu'un seul rejeu démentirait.
 */
const SIZES = [10, 100, 1000, 10000];

export default function GapExplorer({ p = 0.5, seed = 987654321 }) {
  const [runSeed, setRunSeed] = useState(seed);

  const rows = useMemo(() => {
    const rng = makeRng(runSeed);
    return SIZES.map((n) => {
      const successes = runBernoulliTrials(rng, n, p);
      return {
        n,
        successes,
        frequency: successes / n,
        freqGap: Math.abs(successes / n - p),
        countGap: Math.abs(successes - n * p),
      };
    });
  }, [runSeed, p]);

  const first = rows[0];
  const last = rows[rows.length - 1];

  return (
    <div className="rounded-2xl border-2 border-sky-100 bg-white p-4 space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[30rem]">
          <caption className="sr-only">
            Écart en fréquence et écart en nombre de succès selon la taille de la série
          </caption>
          <thead>
            <tr className="text-slate-500 text-left">
              <th scope="col" className="py-2 pr-3 font-semibold">Lancers</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Succès</th>
              <th scope="col" className="py-2 pr-3 font-semibold">Fréquence</th>
              <th scope="col" className="py-2 pr-3 font-semibold text-emerald-700">Écart en fréquence</th>
              <th scope="col" className="py-2 font-semibold text-rose-700">Écart en nombre</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className="border-t border-slate-100">
                <td className="py-2 pr-3 tabular-nums font-semibold">{r.n.toLocaleString('fr-FR')}</td>
                <td className="py-2 pr-3 tabular-nums text-slate-600">{r.successes.toLocaleString('fr-FR')}</td>
                <td className="py-2 pr-3 tabular-nums">{formatPercent(r.frequency, 2)}</td>
                <td className="py-2 pr-3 tabular-nums font-bold text-emerald-700">{formatPercent(r.freqGap, 2)}</td>
                <td className="py-2 tabular-nums font-bold text-rose-700">{formatNumber(r.countGap, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-700">
        De la première à la dernière ligne, l’écart en fréquence est divisé par environ{' '}
        <strong className="text-emerald-700">{formatNumber(first.freqGap / Math.max(last.freqGap, 1e-9), 0)}</strong>,
        tandis que l’écart en nombre est multiplié par environ{' '}
        <strong className="text-rose-700">{formatNumber(last.countGap / Math.max(first.countGap, 1e-9), 0)}</strong>.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setRunSeed((s) => (s * 1664525 + 1013904223) >>> 0)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 active:scale-95 transition">
          ↻ Rejouer les quatre séries
        </button>
        <span className="text-xs text-slate-500">
          Ligne à ligne, le hasard peut faire remonter la colonne verte : c’est la tendance d’ensemble
          qui compte, pas chaque marche. Rejoue pour t’en convaincre.
        </span>
      </div>
    </div>
  );
}
