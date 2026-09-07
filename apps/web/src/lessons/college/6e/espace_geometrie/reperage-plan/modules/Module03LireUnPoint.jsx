import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordGrid from '../components/CoordGrid';
import { makeGrid, formatCoords, swapNode } from '../components/reperageUtils';

/**
 * Module 3 — DÉCOUVERTE : lire les coordonnées d'un point (P3) et retrouver
 * celles d'un point déjà placé (P5).
 *
 * Objectif : la lecture n'est pas une devinette. On la CONSTRUIT en tirant
 * deux guides — un vertical, un horizontal — jusqu'à ce qu'ils se croisent
 * sur le point. Les nombres se lisent alors sur les axes.
 *
 * Aha : lire un point, c'est redescendre sur l'axe horizontal puis revenir
 * sur l'axe vertical. Le point est l'intersection de deux informations.
 *
 * Misconceptions visées : (a) l'échange des deux nombres ; (b) le décalage
 * d'une unité quand on compte les graduations à partir de 1 au lieu de 0.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 38 });

const T = { col: 4, row: 2 };

/* Étape 3 — trois points à lire d'affilée, sans guides cette fois. */
const READS = [
  { id: 'r1', node: { col: 1, row: 3 } },
  { id: 'r2', node: { col: 6, row: 5 } },
  { id: 'r3', node: { col: 3, row: 0 } },
];

/** Options d'une lecture : la bonne, l'échange, et deux décalages de 1. */
function readOptions(node) {
  return [
    formatCoords(node),
    formatCoords(swapNode(node)),
    formatCoords({ col: node.col + 1, row: node.row }),
  ];
}

export default function Module03LireUnPoint() {
  const [guides, setGuides] = useState({ vertical: null, horizontal: null });
  const [guideDone, setGuideDone] = useState(false);
  const [readDone, setReadDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);

  const aligned = guides.vertical === T.col && guides.horizontal === T.row;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire un point"
      moduleSubtitle="Retrouve les deux nombres qui nomment un point déjà posé."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Le point T est posé. Comment s’appelle-t-il ?',
        body: (
          <p>
            Deux guides coulissants t’aident : amène-les sur le point T, puis lis les nombres au pied de
            chaque guide.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Croise les deux guides sur T',
          subtitle: 'Attrape CHAQUE poignée séparément : chacune ne commande qu’un seul des deux nombres.',
          done: guideDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordGrid
                grid={GRID}
                mode="read"
                guides={guides}
                onGuideChange={(g) => {
                  setGuides(g);
                  if (g.vertical === T.col && g.horizontal === T.row && !guideDone) {
                    // Complétion sur l'objectif RÉEL, hors updater d'état.
                    kit.react(true);
                    setGuideDone(true);
                  }
                }}
                labelledNodes={[{ col: T.col, row: T.row, name: 'T' }]}
                ariaLabel="Quadrillage : amène le guide vertical et le guide horizontal sur le point T"
              />
              {!guideDone && (
                <p className="text-center text-sm text-slate-600">
                  {guides.vertical == null
                    ? 'Touche le quadrillage pour poser les deux guides.'
                    : aligned
                      ? 'Les guides se croisent sur T.'
                      : `Les guides se croisent en (${guides.vertical} ; ${guides.horizontal}). Tire la poignée bleue (en bas) pour le premier nombre, la verte (à gauche) pour le second.`}
                </p>
              )}
              {guideDone && (
                <>
                  {/* Le quadrillage n'est plus figé : le retour décrit donc la
                      position COURANTE des guides, jamais l'instant de la
                      réussite (règle projet du 2026-09-06). */}
                  <Feedback tone={aligned ? 'ok' : 'info'}>
                    {aligned ? (
                      <>
                        Les guides se croisent sur T. Le guide vertical part de{' '}
                        <strong className="font-mono">{T.col}</strong> sur l’axe horizontal — c’est
                        l’abscisse ; le guide horizontal part de{' '}
                        <strong className="font-mono">{T.row}</strong> sur l’axe vertical — c’est
                        l’ordonnée.
                      </>
                    ) : (
                      <>
                        Tu as redéplacé les guides : ils se croisent maintenant en{' '}
                        <strong className="font-mono">
                          ({guides.vertical} ; {guides.horizontal})
                        </strong>
                        , et non sur T <span className="font-mono">({T.col} ; {T.row})</span>. Chaque
                        croisement désigne un point, et un seul.
                      </>
                    )}
                  </Feedback>
                  {/* Les deux nombres sont maintenant lus : on peut nommer et
                      écrire le couple, PUIS fixer le geste en méthode. Les
                      deux briques précèdent toute demande de l'étape 2. */}
                  <KnowledgeBrick
                    id="coordonnees"
                    variant="new"
                    lead="Les deux nombres que tes guides viennent de désigner s’écrivent ensemble, et ce couple a un nom."
                  />
                  <KnowledgeBrick
                    id="lire-un-point"
                    variant="new"
                    lead="Ce que tu as fait avec les guides est une méthode : on peut la refaire sans eux."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Écris le nom du point T',
          done: readDone,
          content: (
            <TapQuestion
              above={
                <CoordGrid
                  grid={GRID}
                  mode="display"
                  guides={{ vertical: T.col, horizontal: T.row }}
                  labelledNodes={[{ col: T.col, row: T.row, name: 'T' }]}
                  showCoordsBadge={false}
                  ariaLabel="Point T avec les deux guides de lecture en place"
                />
              }
              prompt="Quelles sont les coordonnées du point T ?"
              options={readOptions(T)}
              correct={0}
              cols={3}
              requires={['coordonnees', 'lire-un-point', 'abscisse', 'ordonnee']}
              explain="On lit d’abord l’horizontale (4), puis la verticale (2) : T = (4 ; 2)."
              explainWrong="Attention à l’ordre et au comptage : le premier nombre se lit sur l’axe horizontal en partant de 0, le second sur l’axe vertical."
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Trois points, sans les guides',
          subtitle: 'À toi de lire seul, maintenant.',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              requires={['coordonnees', 'lire-un-point', 'ordre-du-couple']}
              intro={
                <div className="space-y-3">
                  <CoordGrid
                    grid={GRID}
                    mode="display"
                    labelledNodes={READS.map((r, i) => ({
                      col: r.node.col,
                      row: r.node.row,
                      name: ['M', 'N', 'P'][i],
                    }))}
                    showCoordsBadge={false}
                    ariaLabel="Quadrillage portant les points M, N et P"
                  />
                  <p className="text-sm text-slate-600">
                    Lis les coordonnées de chaque point. Souviens-toi : l’abscisse d’abord.
                  </p>
                </div>
              }
              rows={READS.map((r, i) => ({
                id: r.id,
                label: <span className="font-space font-bold">Point {['M', 'N', 'P'][i]}</span>,
                options: readOptions(r.node),
                correct: 0,
                correction: <>{formatCoords(r.node)}</>,
              }))}
              solved={batchDone}
              onAnswered={() => setBatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Deux pièges reviennent toujours : échanger les deux nombres, et compter les graduations à
                  partir de 1 alors qu’elles commencent à 0.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais lire un point déjà posé. Au module suivant, on fait le
          geste inverse : on te donne les deux nombres, et c’est toi qui poses le point.
        </KnowledgeSnapshot>
      }
    />
  );
}
