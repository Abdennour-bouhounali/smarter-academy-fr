import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordGrid from '../components/CoordGrid';
import { makeGrid, formatCoords, formatCell } from '../components/reperageUtils';

/**
 * Module 6 — FORMALISATION.
 *
 * Objectif : mettre au clair les DEUX repérages du programme de 6e, que les
 * élèves confondent constamment :
 *   - un NŒUD  : un point, à l'intersection de deux traits → (3 ; 5)
 *   - une CASE : une surface, entre quatre traits          → B3
 *
 * Aha : ils ne se comptent même pas pareil. Un quadrillage de 4 × 3 cases
 * porte 5 × 4 nœuds — il y a toujours un trait de plus que d'intervalles.
 *
 * Ce module ne réinvente rien : il NOMME ce que les modules 1 à 5 ont fait
 * manipuler, et il ajoute la seule distinction encore absente.
 */
const GRID = makeGrid({ cols: 4, rows: 3, step: 46 });

const SORT_ROWS = [
  { id: 's1', label: <span className="font-mono">(2 ; 1)</span>, correct: 0 },
  { id: 's2', label: <span className="font-mono">C2</span>, correct: 1 },
  { id: 's3', label: <span className="font-mono">(0 ; 3)</span>, correct: 0 },
  { id: 's4', label: <span className="font-mono">A1</span>, correct: 1 },
];

export default function Module06NoeudsEtCases() {
  const [cell, setCell] = useState(null);
  const [node, setNode] = useState(null);
  const [exploreDone, setExploreDone] = useState(false);
  const [countDone, setCountDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);

  const bothTried = cell !== null && node !== null;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Nœuds et cases"
      moduleSubtitle="A3 ou (3 ; 5) ? Deux façons de repérer, à ne jamais confondre."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Un point, ou une surface ?',
        body: (
          <p>
            Sur une carte au trésor, on repère des <strong>cases</strong>. Sur un plan précis, on repère des{' '}
            <strong>nœuds</strong>. Compare les deux sur le même quadrillage.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Essaie les deux repérages',
          subtitle: 'Choisis une case, puis pose un point sur un nœud.',
          done: exploreDone,
          content: (kit) => (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wide text-indigo-600 text-center">
                    Repérage par CASES
                  </p>
                  <CoordGrid
                    grid={GRID}
                    mode="cells"
                    selectedCell={cell}
                    onCellSelect={setCell}
                    ariaLabel="Quadrillage en mode cases : choisis une case"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wide text-emerald-600 text-center">
                    Repérage par NŒUDS
                  </p>
                  <CoordGrid
                    grid={GRID}
                    mode="place"
                    point={node}
                    onPointChange={setNode}
                    ariaLabel="Quadrillage en mode nœuds : pose un point sur un croisement"
                  />
                </div>
              </div>

              {bothTried && !exploreDone && (
                <button
                  type="button"
                  onClick={() => {
                    kit.react(true);
                    setExploreDone(true);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  J’ai vu la différence
                </button>
              )}

              {exploreDone && (
                <Feedback tone="ok">
                  La case <strong className="font-mono">{formatCell(cell.colonne, cell.ligne)}</strong> est une{' '}
                  <strong>surface</strong> ; le nœud{' '}
                  <strong className="font-mono">{formatCoords(node)}</strong> est un <strong>point</strong>,
                  sans épaisseur, à l’intersection de deux traits.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Combien de chaque ?',
          done: countDone,
          content: (
            <TapQuestion
              above={
                <CoordGrid
                  grid={GRID}
                  mode="display"
                  showCoordsBadge={false}
                  ariaLabel="Quadrillage de 4 colonnes sur 3 lignes"
                />
              }
              prompt="Ce quadrillage a 4 colonnes et 3 lignes de cases. Combien porte-t-il de nœuds ?"
              options={['12 nœuds', '20 nœuds', '7 nœuds']}
              correct={1}
              cols={3}
              explain="5 traits verticaux × 4 traits horizontaux = 20 nœuds. Il y a toujours un trait de plus que d’intervalles : 4 cases de large, mais 5 traits."
              explainWrong="12, ce serait le nombre de CASES (4 × 3). Les nœuds se comptent sur les traits : 5 × 4 = 20."
              solved={countDone}
              onAnswered={() => setCountDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Case ou nœud ?',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Chaque écriture désigne-t-elle un nœud (un point) ou une case (une surface) ?
                </p>
              }
              rows={SORT_ROWS.map((r) => ({
                id: r.id,
                label: r.label,
                options: ['Un nœud', 'Une case'],
                correct: r.correct,
                correction: <>{r.correct === 0 ? 'deux nombres entre parenthèses → un nœud' : 'lettre + numéro → une case'}</>,
              }))}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  L’écriture le dit : <span className="font-mono">(3 ; 5)</span> — deux nombres entre
                  parenthèses — désigne un nœud ; <span className="font-mono">B3</span> — une lettre et un
                  numéro — désigne une case.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <Grid3x3 className="w-6 h-6 mx-auto text-blue-400" aria-hidden="true" />
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-400">À retenir</p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="font-bold text-white mb-1">Un nœud — un point</div>
              <div className="text-slate-300">
                <span className="font-mono">(3 ; 5)</span> : horizontale d’abord, verticale ensuite, séparées
                par un point-virgule.
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="font-bold text-white mb-1">Une case — une surface</div>
              <div className="text-slate-300">
                <span className="font-mono">B3</span> : la colonne par sa lettre, la ligne par son numéro.
              </div>
            </div>
          </div>
        </motion.div>
      }
    />
  );
}
