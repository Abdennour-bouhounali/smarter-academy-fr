import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
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
            <NumericQuestion
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
          ),
        },
        {
          num: 2,
          title: 'Un angle, sans rapporteur',
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
              explain="La symétrie conserve les angles : l’angle en B′ mesure exactement 55°, comme celui en B."
              explainWrong="Pas besoin de rapporteur : la symétrie conserve les angles. 125° serait le supplémentaire — la symétrie ne fait rien de tel."
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
              explain="L’image a la même aire que le motif (24 cm²), et les deux moitiés ne se chevauchent pas : 24 + 24 = 48 cm²."
              explainWrong="La symétrie conserve l’aire : la moitié droite fait aussi 24 cm². Le logo entier en fait donc le double, soit 48 cm²."
              solved={aireDone}
              onAnswered={() => setAireDone(true)}
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
          <Lightbulb className="w-6 h-6 mx-auto text-cyan-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Reconnaître une symétrie, c’est <strong className="text-white">gagner des informations
            gratuitement</strong> : toutes les longueurs et tous les angles de l’image sont déjà connus.
          </p>
        </motion.div>
      }
    />
  );
}
