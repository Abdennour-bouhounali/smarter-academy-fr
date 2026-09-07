import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Feedback } from '../../../../../common/components/LessonUI';
import DataTable from './DataTable';
import { placeFact, withCell, isComplete, formatCell } from './tableUtils';

/**
 * SortingBoard — LA manipulation signature de la leçon Tableaux.
 *
 * GESTE : l'élève prend une information en vrac (« Léa a marqué 12 points
 * au relais ») puis tape la case du tableau où elle doit aller. Le fait
 * n'atterrit que s'il tombe sur le BON croisement ligne × colonne.
 *
 * CE QUE ÇA REND VISIBLE : ce n'est pas la grille qui organise, c'est le
 * croisement. Une case mal choisie n'est pas « presque juste » — elle
 * raconte autre chose (« ce serait le score de Tom au saut »). Le feedback
 * dit donc toujours ce que la case VISÉE signifiait, pas seulement « faux ».
 *
 * INGÉNIERIE (playbook §10) :
 *  - tap-first, zéro glisser-déposer : sélectionner une étiquette puis taper
 *    une case. Tout se fait au doigt comme au clavier (ce sont de vrais
 *    <button>) ;
 *  - complétion sur le VRAI but (tableau entièrement rempli), jamais sur un
 *    simple placement ;
 *  - jamais bloquant : après 2 erreurs sur le même fait, la case cible est
 *    signalée en ambre, et un bouton « Montre-moi » place le fait restant ;
 *  - état contrôlé possédé par le module (`table` + `placed`), une seule
 *    source de vérité — le tableau affiché EST le modèle.
 */
export default function SortingBoard({
  initialTable,          // TableModel avec des cellules à null
  facts,                 // [{ id, row, col, value, label }]
  react,                 // kit.react — feedback sonore/série
  solved = false,
  onSolved,
  tone = 'emerald',
  caption = 'Tableau à compléter',
}) {
  const reduce = useReducedMotion();
  const [table, setTable] = useState(initialTable);
  const [placedIds, setPlacedIds] = useState([]);
  const [pick, setPick] = useState(null);       // fact courant
  const [wrong, setWrong] = useState(null);     // { r, c, factId } dernière erreur
  const [attempts, setAttempts] = useState({}); // factId -> nb d'erreurs
  const [revealed, setRevealed] = useState(false);

  const done = solved || isComplete(table);
  const remaining = facts.filter((f) => !placedIds.includes(f.id));
  const current = pick ?? remaining[0] ?? null;
  const target = current ? placeFact(table, current) : null;
  const showTarget = !!current && (attempts[current.id] ?? 0) >= 2;

  const commit = (fact, r, c) => {
    const next = withCell(table, r, c, fact.value);
    const nextPlaced = [...placedIds, fact.id];
    setTable(next);
    setPlacedIds(nextPlaced);
    setPick(null);
    setWrong(null);
    react?.(true);
    if (isComplete(next)) onSolved?.();
  };

  const handleCell = (r, c) => {
    if (done || !current) return;
    const want = placeFact(table, current);
    if (want && want.r === r && want.c === c) {
      commit(current, r, c);
      return;
    }
    // Erreur : on nomme ce que la case visée SIGNIFIE, on ne dit jamais « faux ».
    setWrong({ r, c, factId: current.id });
    setAttempts((a) => ({ ...a, [current.id]: (a[current.id] ?? 0) + 1 }));
    react?.(false);
  };

  const revealOne = () => {
    if (done || !current) return;
    const want = placeFact(table, current);
    if (!want) return;
    setRevealed(true);
    commit(current, want.r, want.c);
  };

  return (
    <div className="space-y-4">
      {/* Objectif + action courante, toujours à l'écran (playbook §7). */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 text-sm">
        {done ? (
          <span>Tableau complet : chaque information est à son croisement.</span>
        ) : current ? (
          <span>
            Range <strong className="text-emerald-300">{current.label}</strong> : tape la case qui croise{' '}
            <strong>{current.row}</strong> et <strong>{current.col}</strong>.
          </span>
        ) : (
          <span>Choisis une information à ranger.</span>
        )}
      </div>

      {/* Les informations encore en vrac. */}
      {!done && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Informations à ranger">
          {remaining.map((f) => {
            const active = current?.id === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => { setPick(f); setWrong(null); }}
                aria-pressed={active}
                className={`px-3 py-2.5 min-h-[44px] rounded-xl border-2 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  active
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Pas de gel par l'avancement : quand tout est rangé il n'y a plus
          d'information EN MAIN, donc plus rien à poser — la contrainte est
          mathématique, pas progressive (règle projet du 2026-09-06). */}
      <motion.div
        animate={wrong && !reduce ? { x: [0, -6, 6, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <DataTable
          table={table}
          caption={caption}
          tone={tone}
          onCellClick={current ? handleCell : null}
          highlight={showTarget && target ? [target] : []}
          wrongCells={wrong ? [{ r: wrong.r, c: wrong.c }] : []}
          highlightRow={current && !done ? table.rowLabels.indexOf(current.row) : null}
        />
      </motion.div>

      {wrong && current && (
        <Feedback tone="ko">
          Cette case-là, c'est <strong>{table.rowLabels[wrong.r]}</strong> au croisement de{' '}
          <strong>{table.colHeaders[wrong.c]}</strong> — pas ce que dit ton information.{' '}
          {current.label} doit aller sur la ligne <strong>{current.row}</strong>, colonne{' '}
          <strong>{current.col}</strong>.
        </Feedback>
      )}

      {showTarget && !done && (
        <div className="text-center">
          <button
            type="button"
            onClick={revealOne}
            className="px-4 py-2.5 min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Je ne trouve pas — montre-moi
          </button>
        </div>
      )}

      {done && (
        <Feedback tone="ok">
          {revealed
            ? 'Pas grave, on te l’a montré : '
            : 'Tableau complet ! '}
          chaque nombre est maintenant lisible parce qu'il a une ligne ET une colonne. Sans ce
          croisement, {formatCell(table, table.values[0][0])} ne voudrait rien dire.
        </Feedback>
      )}
    </div>
  );
}
