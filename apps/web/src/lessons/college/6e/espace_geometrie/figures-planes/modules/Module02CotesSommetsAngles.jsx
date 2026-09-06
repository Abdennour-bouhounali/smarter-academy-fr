import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { countsOf, POLYGON_BY_SIDES, interiorAngles } from '../components/figuresUtils';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire de base (P2, P3).
 *
 * Objectif : nommer ce qu'on mesure. Côtés, sommets, angles — trois objets,
 * et une relation constante entre les deux premiers.
 *
 * Aha : un polygone fermé a TOUJOURS autant de sommets que de côtés. Ce
 * n'est pas une règle à apprendre, c'est une conséquence de la fermeture, et
 * l'élève le constate sur trois figures différentes.
 *
 * Misconception visée : compter un sommet de plus que les côtés (en oubliant
 * que le dernier côté revient au premier sommet).
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 220 };

const FIGURES = [
  { id: 'tri', pts: [{ x: 150, y: 40 }, { x: 250, y: 180 }, { x: 50, y: 180 }] },
  { id: 'quad', pts: [{ x: 60, y: 50 }, { x: 230, y: 60 }, { x: 245, y: 180 }, { x: 55, y: 175 }] },
  { id: 'pent', pts: [{ x: 150, y: 35 }, { x: 245, y: 100 }, { x: 210, y: 190 }, { x: 90, y: 190 }, { x: 55, y: 100 }] },
];

// Quadrilatère choisi pour que l'angle le plus ouvert se DÉTACHE nettement
// (126° contre 90° au suivant) : à 3° d'écart, la question ne se lirait pas.
const ANGLE_FIG = [{ x: 60, y: 50 }, { x: 245, y: 50 }, { x: 150, y: 185 }, { x: 60, y: 120 }];

export default function Module02CotesSommetsAngles() {
  const [countDone, setCountDone] = useState(false);
  const [relDone, setRelDone] = useState(false);
  const [angleDone, setAngleDone] = useState(false);

  const A = interiorAngles(ANGLE_FIG);
  // Le sommet le plus ouvert — calculé, jamais deviné.
  const widest = A.indexOf(Math.max(...A));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Côtés, sommets, angles"
      moduleSubtitle="Les trois choses qu’on mesure sur une figure."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Avant de nommer, il faut savoir quoi regarder.',
        body: (
          <p>
            Sur une figure, il n’y a que trois choses à observer. Tu vas les découvrir une par une,
            en les comptant et en les comparant.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Compte les traits du contour de chaque figure',
          done: countDone,
          content: (
            <div className="space-y-5">
              {/* Le mot est posé AVANT qu'on demande d'en compter : sinon la
                  consigne emploie un terme que l'élève n'a pas encore. */}
              <KnowledgeBrick
                id="cote"
                variant="new"
                lead="Le contour de chaque figure ci-dessous est fait de traits mis bout à bout."
              />
              <BatchChoiceQuestion
                requires={['cote']}
                intro={
                <div className="space-y-3">
                  {FIGURES.map((f, i) => (
                    <div key={f.id} className="rounded-xl border-2 border-slate-200 bg-white p-2">
                      <p className="text-xs font-mono text-slate-500 mb-1">Figure {i + 1}</p>
                      <ShapeLab
                        points={f.pts} box={BOX} draggable={false}
                        showName={false} showProperties={false} size={260}
                        ariaLabel={`Figure ${i + 1}, à ${f.pts.length} côtés`}
                      />
                    </div>
                  ))}
                </div>
              }
              rows={FIGURES.map((f, i) => ({
                id: f.id,
                label: <span className="font-semibold">Figure {i + 1}</span>,
                options: ['3 côtés', '4 côtés', '5 côtés'],
                correct: f.pts.length - 3,
                correction: <>{f.pts.length} côtés — un {POLYGON_BY_SIDES[f.pts.length]}</>,
              }))}
                solved={countDone}
                onAnswered={() => setCountDone(true)}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {!allRight && (
                      <>
                        {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                      </>
                    )}
                    Le nombre de traits du contour n’est pas le même d’une figure à l’autre — et il
                    suffit déjà à leur donner un premier nom.
                  </Feedback>
                )}
              />
              {countDone && (
                <KnowledgeBrick
                  id="polygone"
                  variant="new"
                  lead="3, 4, 5 : ce premier comptage donne déjà un nom à chaque figure."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les coins de la figure',
          done: relDone,
          content: (
            <div className="space-y-5">
              <KnowledgeBrick
                id="sommet"
                variant="new"
                lead="Là où deux côtés se rejoignent, la figure fait un coin. Ce coin a un nom."
              />
              <TapQuestion
                requires={['sommet', 'cote']}
                above={
                <ShapeLab
                  points={FIGURES[1].pts} box={BOX} draggable={false}
                  showName={false} showProperties={false}
                  ariaLabel="Quadrilatère ABCD avec ses sommets nommés"
                />
              }
              prompt={
                <>
                  Cette figure a <strong>{countsOf(FIGURES[1].pts).cotes} côtés</strong>. Combien
                  a-t-elle de sommets ?
                </>
              }
              options={['3 sommets', '4 sommets', '5 sommets']}
              correct={1}
              cols={3}
              explain="Autant de sommets que de côtés : la figure est fermée, donc le dernier côté ramène au premier sommet. C’est vrai pour tout polygone."
                explainWrong="Attention à ne pas compter un sommet de plus : le dernier côté revient au point de départ, il ne crée pas de nouveau sommet."
                solved={relDone}
                onAnswered={() => setRelDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Compare l’ouverture des coins',
          subtitle: 'Les mesures sont affichées : sers-t’en.',
          done: angleDone,
          content: (
            <div className="space-y-5">
              <KnowledgeBrick
                id="angle"
                variant="new"
                lead="À chaque sommet, les deux côtés s’écartent plus ou moins : cet écartement se mesure."
              />
              <TapQuestion
                requires={['angle', 'sommet']}
                above={
                <ShapeLab
                  points={ANGLE_FIG} box={BOX} draggable={false}
                  showName={false} showProperties={false} showAngles
                  ariaLabel="Quadrilatère avec la mesure de chacun de ses angles"
                />
              }
              prompt="À quel sommet l’angle est-il le plus OUVERT ?"
              options={['A', 'B', 'C', 'D']}
              correct={widest}
              cols={4}
              explain={`L’angle le plus ouvert est celui qui mesure le plus de degrés : ${Math.round(Math.max(...A))}° au sommet ${'ABCD'[widest]}. Un angle se compare par sa mesure, pas par la longueur des côtés qui le forment.`}
                explainWrong="Ne te fie pas à la longueur des côtés : un angle ne dépend que de l’écartement, pas de la taille des traits qui le dessinent."
                solved={angleDone}
                onAnswered={() => setAngleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais quoi observer. Au laboratoire, on va casser ces mesures
          une à une et regarder le nom de la figure changer tout seul.
        </KnowledgeSnapshot>
      }
    />
  );
}
