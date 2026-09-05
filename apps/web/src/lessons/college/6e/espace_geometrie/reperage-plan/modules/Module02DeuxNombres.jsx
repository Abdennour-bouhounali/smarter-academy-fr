import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SwapLab from '../components/SwapLab';
import CoordGrid from '../components/CoordGrid';
import {
  makeGrid, formatCoords, samePoint, swapNode, isOnDiagonal,
} from '../components/reperageUtils';

/**
 * Module 2 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Objectif : découvrir que les deux nombres n'ont pas le même rôle, en
 * PROVOQUANT l'erreur plutôt qu'en l'interdisant.
 *
 * Aha : échanger les deux nombres, c'est désigner un autre endroit —
 * sauf sur la diagonale, où ils sont égaux.
 *
 * Misconception visée : « (2 ; 5) et (5 ; 2), ce sont les mêmes nombres,
 * donc le même point. » C'est LE piège du repérage, et l'élève le teste
 * lui-même au lieu de se le faire interdire.
 */
const GRID = makeGrid({ cols: 6, rows: 6, step: 40 });

const A = { col: 2, row: 5 };

/* Étape 3 — trois paires à trancher : le même point, ou pas ? */
const PAIRS = [
  { id: 'p1', a: { col: 1, row: 4 }, b: { col: 4, row: 1 } },
  { id: 'p2', a: { col: 3, row: 3 }, b: { col: 3, row: 3 } },
  { id: 'p3', a: { col: 0, row: 6 }, b: { col: 6, row: 0 } },
];

export default function Module02DeuxNombres() {
  const [point, setPoint] = useState(A);
  const [explored, setExplored] = useState([]); // nœuds hors diagonale visités
  const [swapDone, setSwapDone] = useState(false);
  const [roleDone, setRoleDone] = useState(false);
  const [pairsDone, setPairsDone] = useState(false);

  // L'exploration est validée quand l'élève a vu l'échec de l'échange sur
  // 3 points distincts hors diagonale — la règle se constate, elle ne se
  // décrète pas sur un seul exemple.
  const handlePoint = (next, react) => {
    setPoint(next);
    if (isOnDiagonal(next)) return;
    const key = `${next.col}-${next.row}`;
    setExplored((prev) => {
      if (prev.includes(key)) return prev;
      const list = [...prev, key];
      return list;
    });
  };

  // Effet de bord (son/série) et complétion décidés HORS updater (§10.10).
  const exploreEnough = explored.length >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Les deux nombres"
      moduleSubtitle="Échange-les : tu n’arrives plus au même endroit."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Deux nombres… mais dans quel ordre ?',
        body: (
          <p>
            Pose le point A où tu veux. À chaque fois, un fantôme A′ apparaît aux mêmes nombres{' '}
            <strong>échangés</strong>. Observe bien où il tombe.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Déplace A et observe A′',
          subtitle: 'Trouve au moins 3 endroits où A et A′ ne se confondent pas.',
          done: swapDone,
          content: (kit) => (
            <div className="space-y-3">
              <SwapLab
                grid={GRID}
                point={point}
                onPointChange={(n) => handlePoint(n, kit.react)}
                disabled={swapDone}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-500">
                  Endroits explorés : {Math.min(explored.length, 3)} / 3
                </span>
                {!swapDone && (
                  <button
                    type="button"
                    disabled={!exploreEnough}
                    onClick={() => {
                      kit.react(true);
                      setSwapDone(true);
                    }}
                    className="min-h-[44px] px-4 rounded-xl border-2 font-bold text-sm bg-sky-600 border-sky-700 text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    J’ai compris ce qui se passe
                  </button>
                )}
              </div>
              {swapDone && (
                <Feedback tone="ok">
                  À chaque fois, A′ est le reflet de A de l’autre côté de la diagonale. Les deux nombres ne
                  sont pas interchangeables : chacun commande une direction.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Qui commande quoi ?',
          done: roleDone,
          content: (
            <TapQuestion
              above={
                <CoordGrid
                  grid={GRID}
                  mode="display"
                  labelledNodes={[{ col: A.col, row: A.row, name: 'A' }]}
                  ghost={{ ...swapNode(A), label: `A′ ${formatCoords(swapNode(A))}` }}
                  highlightDiagonal
                  showCoordsBadge={false}
                  ariaLabel={`Point A en ${formatCoords(A)} et son échange A prime en ${formatCoords(swapNode(A))}`}
                />
              }
              prompt={
                <>
                  Le point A est en <span className="font-mono font-bold">{formatCoords(A)}</span>. Que
                  commande le <strong>premier</strong> nombre, le 2 ?
                </>
              }
              options={[
                'De combien on se déplace horizontalement',
                'De combien on monte',
                'La taille du point',
              ]}
              correct={0}
              cols={1}
              explain="Le premier nombre se lit sur l’axe horizontal : il dit de combien on avance vers la droite. Le second se lit sur l’axe vertical : il dit de combien on monte."
              explainWrong="C’est le SECOND nombre qui commande la montée. Regarde A′ : en échangeant, le point est monté beaucoup plus haut — parce que le 5 est passé en seconde position."
              solved={roleDone}
              onAnswered={() => setRoleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Même point, ou pas ?',
          subtitle: 'Attention : il y a un cas particulier.',
          done: pairsDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque paire, décide si les deux écritures désignent le <strong>même</strong> point du
                  quadrillage.
                </p>
              }
              rows={PAIRS.map((p) => ({
                id: p.id,
                label: (
                  <span className="font-mono">
                    {formatCoords(p.a)} et {formatCoords(p.b)}
                  </span>
                ),
                options: ['Même point', 'Points différents'],
                correct: samePoint(p.a, p.b) ? 0 : 1,
                correction: (
                  <>
                    {samePoint(p.a, p.b)
                      ? 'les deux nombres sont égaux : l’échange ne change rien'
                      : 'les nombres sont échangés : ce sont deux endroits différents'}
                  </>
                ),
              }))}
              solved={pairsDone}
              onAnswered={() => setPairsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Échanger les deux nombres change le point… sauf quand ils sont déjà égaux : (3 ; 3) reste
                  (3 ; 3). C’est le seul cas, celui des points de la diagonale.
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
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <ArrowLeftRight className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            L’ordre compte : le <strong className="text-white">premier</strong> nombre pour l’horizontale, le{' '}
            <strong className="text-white">second</strong> pour la verticale. On les écrit entre parenthèses,
            séparés par un point-virgule : <span className="font-mono text-white">(2 ; 5)</span>.
          </p>
        </motion.div>
      }
    />
  );
}
