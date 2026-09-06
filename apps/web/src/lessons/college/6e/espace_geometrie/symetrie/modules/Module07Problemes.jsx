import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MirrorLab from '../components/MirrorLab';
import { lineThrough } from '../components/symetrieUtils';

/**
 * Module 7 — PRACTICE LAB : se SERVIR de la symétrie (P10).
 *
 * Objectif : la symétrie cesse d'être un dessin pour devenir un outil de
 * déduction. Si deux points sont symétriques, on connaît des longueurs et
 * des angles sans les mesurer.
 *
 * Aha : la conservation n'est pas une curiosité — c'est ce qui permet de
 * DÉDUIRE. « Je sais que AB = 7, donc A′B′ = 7 » sans rien mesurer.
 *
 * Misconception visée : croire qu'il faut re-mesurer sur l'image, alors que
 * la conservation donne la réponse immédiatement.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const AXE = lineThrough({ x: 160, y: 0 }, { x: 160, y: 200 });
const TRI = [{ x: 55, y: 40 }, { x: 125, y: 70 }, { x: 80, y: 155 }];

export default function Module07Problemes() {
  const [longDone, setLongDone] = useState(false);
  const [angleDone, setAngleDone] = useState(false);
  const [aireDone, setAireDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Problèmes de symétrie"
      moduleSubtitle="Déduire une longueur, un angle — sans mesurer."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 07',
        title: 'La symétrie fait gagner du travail.',
        body: (
          <p>
            Puisqu’elle <strong>conserve</strong> tout, connaître la figure suffit à connaître son image.
            Plus besoin de mesurer deux fois.
          </p>
        ),
      }}
      intro={
        <MirrorLab
          axis={AXE}
          points={TRI}
          polygon
          showDistances={false}
          showConnector={false}
          disabled
          box={BOX}
          ariaLabel="Un triangle ABC et son image A′B′C′ par symétrie axiale"
        />
      }
      steps={[
        {
          num: 1,
          title: 'Une longueur, sans mesurer',
          done: longDone,
          content: (
            <div className="space-y-5">
              {/* La conservation devient un OUTIL de déduction : on le pose
                  avant la première déduction demandée. */}
              <KnowledgeBrick
                id="mem-deduire"
                variant="new"
                lead="Puisque rien n’est déformé, connaître la figure suffit à connaître son image."
              />
              <NumericQuestion
                requires={['mem-deduire', 'conservation', 'symetrique-figure']}
              prompt={
                <>
                  Dans le triangle ci-dessus, <span className="font-mono">AB = 7 cm</span>. Combien mesure{' '}
                  <span className="font-mono">A′B′</span> ?
                </>
              }
              suffix="cm"
              expected={7}
              explain="La symétrie conserve les longueurs : A′B′ = AB = 7 cm. Aucune mesure n’est nécessaire."
              explainFor={(n) =>
                n === 14
                  ? 'La symétrie ne double rien : elle déplace la figure sans la changer. A′B′ = AB = 7 cm.'
                  : n === 3.5
                    ? 'Elle ne divise rien non plus. L’image est une copie exacte : A′B′ = 7 cm.'
                    : 'La symétrie conserve les longueurs : l’image d’un segment de 7 cm mesure 7 cm.'
              }
                solved={longDone}
                onAnswered={() => setLongDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Un angle, sans le mesurer',
          done: angleDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  L’angle en <span className="font-mono">B</span> mesure{' '}
                  <span className="font-mono">55°</span>. Que vaut l’angle en{' '}
                  <span className="font-mono">B′</span> ?
                </>
              }
              options={['55°', '125°', 'On ne peut pas savoir']}
              correct={0}
              cols={3}
              requires={['mem-deduire', 'conservation']}
              explain="La symétrie conserve les angles : l’angle en B′ mesure exactement 55°, comme celui en B."
              explainWrong="Aucun instrument n’est nécessaire : la symétrie conserve les angles. 125° serait l’angle qui le complète jusqu’à 180° — la symétrie ne fait rien de tel."
              solved={angleDone}
              onAnswered={() => setAngleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Le drapeau du club',
          subtitle: 'Un vrai problème, en une déduction.',
          done: aireDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Un logo est formé d’un motif et de son symétrique par rapport à un axe. Le motif de gauche
                  a une aire de <span className="font-mono">24 cm²</span>. Quelle est l’aire{' '}
                  <strong>totale</strong> du logo ?
                </>
              }
              options={['48 cm²', '24 cm²', '12 cm²']}
              correct={0}
              cols={3}
              requires={['mem-deduire', 'conservation', 'axe-symetrie']}
              explain="L’image a la même aire que le motif (24 cm²), et les deux moitiés ne se chevauchent pas : 24 + 24 = 48 cm²."
              explainWrong="La symétrie conserve l’aire : la moitié droite fait aussi 24 cm². Le logo entier en fait donc le double, soit 48 cm²."
              solved={aireDone}
              onAnswered={() => setAireDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Ta carte est complète. Le papillon va la mettre à l’épreuve.
        </KnowledgeSnapshot>
      }
    />
  );
}
