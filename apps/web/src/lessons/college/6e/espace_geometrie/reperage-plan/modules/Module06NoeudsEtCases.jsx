import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
 *
 * ── LE GESTE QUI ENSEIGNE ─────────────────────────────────────────────
 * Les deux quadrillages sont LIÉS : glisser sur l'un déplace aussi l'autre,
 * au même endroit du plan. L'élève promène donc UN SEUL doigt et lit deux
 * écritures simultanées — B3 d'un côté, (2 ; 1) de l'autre. La distinction
 * cesse d'être une définition à retenir : elle devient un décalage qu'on
 * voit, puisque la case suit le doigt en surface pendant que le nœud saute
 * de croisement en croisement.
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

  /* Un seul geste, deux lectures : poser un point sur un nœud désigne aussi
     la case dont ce nœud est le coin bas-gauche, et inversement. Les deux
     quadrillages restent manipulables séparément — c'est le même lieu du
     plan, lu de deux façons. */
  const poserNoeud = (n) => {
    setNode(n);
    setCell({
      colonne: Math.min(n.col, GRID.cols - 1),
      ligne: Math.min(n.row, GRID.rows - 1),
    });
  };
  const choisirCase = (c) => {
    setCell(c);
    setNode({ col: c.colonne, row: c.ligne });
  };

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
                  <p className="text-[11px] text-center text-slate-500" role="status">
                    {cell ? formatCell(cell.colonne, cell.ligne) : '— choisis une case'}
                  </p>
                  <CoordGrid
                    grid={GRID}
                    mode="cells"
                    selectedCell={cell}
                    onCellSelect={choisirCase}
                    ariaLabel="Quadrillage en mode cases : choisis une case ; le nœud correspondant suit à droite"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wide text-emerald-600 text-center">
                    Repérage par NŒUDS
                  </p>
                  <p className="text-[11px] text-center text-slate-500" role="status">
                    {node ? formatCoords(node) : '— pose un point'}
                  </p>
                  <CoordGrid
                    grid={GRID}
                    mode="place"
                    point={node}
                    onPointChange={poserNoeud}
                    ariaLabel="Quadrillage en mode nœuds : pose un point sur un croisement ; la case correspondante suit à gauche"
                  />
                </div>
              </div>

              {bothTried && (
                <Feedback tone="info">
                  Même endroit du plan, deux écritures :{' '}
                  <strong className="font-mono">{formatCell(cell.colonne, cell.ligne)}</strong>{' '}
                  désigne une <strong>surface</strong>, tandis que{' '}
                  <strong className="font-mono">{formatCoords(node)}</strong> désigne un{' '}
                  <strong>point</strong>. Promène-les : les deux écritures changent ensemble.
                </Feedback>
              )}

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
                <>
                  <Feedback tone="ok">
                    La case <strong className="font-mono">{formatCell(cell.colonne, cell.ligne)}</strong> est une{' '}
                    <strong>surface</strong> ; le nœud{' '}
                    <strong className="font-mono">{formatCoords(node)}</strong> est un <strong>point</strong>,
                    sans épaisseur, à l’intersection de deux traits.
                  </Feedback>
                  {/* Les deux repérages viennent d'être essayés côte à côte :
                      la distinction se pose maintenant, avant les deux
                      questions qui la mettent à l'épreuve. */}
                  <KnowledgeBrick
                    id="noeud-vs-case"
                    variant="new"
                    lead="Tu as cliqué une surface d’un côté, un croisement de l’autre : ce ne sont pas les mêmes objets."
                  />
                  <KnowledgeBrick id="mem-noeud-case" variant="new" />
                </>
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
              requires={['noeud-vs-case', 'lecture-quadrillage']}
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
              requires={['noeud-vs-case', 'coordonnees']}
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
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Plus rien de nouveau à apprendre : au module suivant, les
          coordonnées deviennent un outil pour résoudre de vrais problèmes de plan.
        </KnowledgeSnapshot>
      }
    />
  );
}
