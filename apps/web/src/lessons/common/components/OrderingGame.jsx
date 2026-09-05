import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { formatFr } from '@smarter-academy/core';
import { Feedback, ValidateButton } from './LessonUI';

/**
 * OrderingGame — ranger des nombres dans l'ordre croissant ou décroissant.
 *
 * Le retour n'est jamais un simple « juste / faux » sur la suite complète :
 * on désigne le PREMIER endroit où l'ordre casse, pour que l'élève sache
 * exactement quelle comparaison revoir.
 *
 * Tactile : on tape une carte pour l'ajouter, on tape une carte placée pour
 * la retirer (pas de glisser-déposer, inutilisable au doigt sur petit écran).
 *
 * `formative` (déf. false) : quand true, `onSolved` est appelé dès la
 * première vérification, MÊME en cas d'ordre faux — l'exercice sert alors à
 * l'apprentissage (jamais à bloquer la progression), pas à une évaluation.
 * En cas d'erreur, le rangement correct est affiché explicitement en plus du
 * message « l'ordre casse à... » déjà présent. Ne change rien pour les
 * appelants existants (boss finals, modules d'évaluation) qui laissent
 * `formative` à false : `onError` continue d'y compter les échecs sans
 * jamais appeler `onSolved` avant un rangement réellement correct.
 */
export default function OrderingGame({
  items,
  direction = 'asc',
  onSolved,
  onError,
  solved = false,
  instruction,
  format = formatFr,
  formative = false,
}) {
  const [placed, setPlaced] = useState([]);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(solved);
  const [revealed, setRevealed] = useState(false);

  const remaining = items.filter((it) => !placed.includes(it.id));
  const byId = (id) => items.find((it) => it.id === id);
  const sorted = [...items].sort((a, b) => (direction === 'asc' ? a.value - b.value : b.value - a.value));

  const place = (id) => {
    if (ok || revealed) return;
    setError(null);
    setPlaced((p) => [...p, id]);
  };

  const remove = (id) => {
    if (ok || revealed) return;
    setError(null);
    setPlaced((p) => p.filter((x) => x !== id));
  };

  const reset = () => {
    setPlaced([]);
    setError(null);
  };

  const check = () => {
    for (let i = 0; i < placed.length - 1; i += 1) {
      const a = byId(placed[i]).value;
      const b = byId(placed[i + 1]).value;
      const broken = direction === 'asc' ? a > b : a < b;
      if (broken) {
        setError({ index: i, a, b });
        onError?.();
        if (formative) {
          setRevealed(true);
          onSolved?.();
        }
        return;
      }
    }
    setOk(true);
    setError(null);
    onSolved?.();
  };

  const arrowLabel = direction === 'asc' ? 'du plus petit au plus grand' : 'du plus grand au plus petit';

  return (
    <div className="space-y-4">
      {instruction && <p className="text-sm text-slate-600 leading-relaxed">{instruction}</p>}

      {/* Réserve de cartes */}
      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          Cartes à ranger
        </div>
        <div className="flex flex-wrap gap-2 min-h-[56px]">
          {remaining.length === 0 && (
            <span className="text-xs text-slate-400 italic self-center">Toutes les cartes sont placées.</span>
          )}
          {remaining.map((it) => (
            <motion.button
              key={it.id}
              layout
              type="button"
              onClick={() => place(it.id)}
              className="px-4 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`Placer ${it.text ?? format(it.value)}`}
            >
              {/* `text` permet d'afficher l'écriture d'origine (2,50) là où la
                  valeur normalisée s'afficherait autrement (2,5). */}
              <span className="font-mono font-extrabold text-slate-800 tabular-nums text-base sm:text-lg">
                {it.text ?? format(it.value)}
              </span>
              {it.label && <span className="block text-[10px] text-slate-400 font-mono">{it.label}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Suite construite */}
      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          Ton rangement <span className="text-slate-500 normal-case font-semibold">({arrowLabel})</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 min-h-[64px] p-3 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
          {placed.length === 0 && (
            <span className="text-xs text-slate-400 italic">Tape une carte ci-dessus pour commencer.</span>
          )}
          {placed.map((id, i) => {
            const it = byId(id);
            const isBreak = error && (i === error.index || i === error.index + 1);
            return (
              <React.Fragment key={id}>
                {i > 0 && (
                  <span className={`font-mono font-bold ${isBreak && error.index === i - 1 ? 'text-rose-500' : 'text-slate-300'}`}>
                    {direction === 'asc' ? '<' : '>'}
                  </span>
                )}
                <motion.button
                  layout
                  type="button"
                  onClick={() => remove(id)}
                  className={`px-3 py-2.5 rounded-xl border-2 font-mono font-extrabold tabular-nums text-sm sm:text-base transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : isBreak
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:border-slate-400'
                  }`}
                  aria-label={ok ? it.text ?? format(it.value) : `Retirer ${it.text ?? format(it.value)}`}
                >
                  {it.text ?? format(it.value)}
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <Feedback tone="ko">
          L'ordre casse à la position <strong>{error.index + 1}</strong> : tu as placé{' '}
          <strong className="font-mono">{format(error.a)}</strong> avant{' '}
          <strong className="font-mono">{format(error.b)}</strong>, or{' '}
          <span className="font-mono">
            {format(error.a)} {error.a > error.b ? '>' : '<'} {format(error.b)}
          </span>
          . Compare ces deux nombres position par position, en commençant par la gauche.
          {revealed && (
            <>
              {' '}
              Le bon rangement était :{' '}
              <span className="font-mono font-bold">
                {sorted
                  .map((cur, i) => {
                    const prev = i > 0 ? sorted[i - 1] : null;
                    const sign = !prev ? '' : prev.value === cur.value ? ' = ' : direction === 'asc' ? ' < ' : ' > ';
                    return `${sign}${cur.text ?? format(cur.value)}`;
                  })
                  .join('')}
              </span>
              .
            </>
          )}
        </Feedback>
      )}

      {ok && (
        <Feedback tone="ok">
          Rangement correct :{' '}
          <span className="font-mono font-bold">
            {placed
              .map((id, i) => {
                const cur = byId(id);
                const prev = i > 0 ? byId(placed[i - 1]) : null;
                const sign = !prev ? '' : prev.value === cur.value ? ' = ' : direction === 'asc' ? ' < ' : ' > ';
                return `${sign}${cur.text ?? format(cur.value)}`;
              })
              .join('')}
          </span>
        </Feedback>
      )}

      {!ok && !revealed && (
        <div className="flex gap-2 flex-wrap">
          <ValidateButton onClick={check} disabled={placed.length !== items.length}>
            Vérifier mon rangement <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
          </ValidateButton>
          {placed.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-500 hover:border-slate-400 font-mono text-xs font-bold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <RotateCcw className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" /> Recommencer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
