import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Square } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RotateToRight from '../components/RotateToRight';
import RelationFigure from '../components/RelationFigure';
import { RELATIONS } from '../components/relationsUtils';

/**
 * Module 3 — DÉCOUVERTE : l'angle droit fait la perpendicularité.
 *
 * Objectif : la marque d'angle droit n'apparaît PAS parce qu'on la demande,
 * mais parce que la relation est exactement vérifiée. L'élève tourne, et le
 * carré « clique » en place à 90° pile.
 *
 * Aha : perpendiculaire n'est pas « en croix », ni « vertical et horizontal ».
 * C'est 90°, exactement — et à 85° la marque refuse d'apparaître.
 *
 * Misconception visée : croire que perpendiculaire = une droite verticale et
 * une horizontale. L'étape 3 le casse avec une paire inclinée.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 190 };

const D1 = { p: { x: 160, y: 95 }, angleDeg: 20, name: 'd₁' };
const OBLIQUE = [
  { p: { x: 150, y: 95 }, angleDeg: 35, name: 'f₁' },
  { p: { x: 150, y: 95 }, angleDeg: 125, name: 'f₂' },
];

export default function Module03AngleDroit() {
  const [angle2, setAngle2] = useState(55);
  const [rotDone, setRotDone] = useState(false);
  const [exactDone, setExactDone] = useState(false);
  const [obliqueDone, setObliqueDone] = useState(false);

  const d2 = { p: { x: 160, y: 95 }, angleDeg: angle2, name: 'd₂' };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="L’angle droit"
      moduleSubtitle="Tourne la droite jusqu’au déclic : le coin parfait, ni plus ni moins."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Fais apparaître le carré.',
        body: (
          <p>
            Tourne la droite <strong>d₂</strong> de 5° en 5°. La marque d’angle droit apparaîtra toute seule —
            mais seulement au bon moment.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tourne jusqu’à faire apparaître le carré',
          subtitle: 'Boutons ⟲ ⟳, ou flèches du clavier.',
          done: rotDone,
          content: (kit) => (
            <div className="space-y-3">
              <RotateToRight
                d1={D1}
                d2={d2}
                onAngleChange={setAngle2}
                targetRelation={RELATIONS.perpendiculaires}
                onGoalReached={() => {
                  if (rotDone) return;
                  kit.react(true);
                  setRotDone(true);
                }}
                box={BOX}
                solved={rotDone}
                ariaLabel="Deux droites : fais tourner la seconde"
              />
              {rotDone && (
                <Feedback tone="ok">
                  Le petit carré est apparu à l’intersection : c’est la marque de l’<strong>angle droit</strong>
                  . Les deux droites sont <strong>perpendiculaires</strong>. On note d₁ ⊥ d₂.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À 85°, alors ?',
          done: exactDone,
          content: (
            <TapQuestion
              prompt="Si les deux droites formaient un angle de 85° au lieu de 90°, seraient-elles perpendiculaires ?"
              options={[
                'Non : il faut exactement 90°',
                'Oui : 85°, c’est presque un angle droit',
                'Oui, si on trace avec une règle bien droite',
              ]}
              correct={0}
              cols={1}
              explain="La perpendicularité est exacte : 90°, ni 89 ni 91. C’est pour cela que la marque n’apparaît pas tant que l’angle n’est pas juste — tu l’as constaté en tournant."
              explainWrong="« Presque » n’existe pas ici. Tu as vu le carré refuser d’apparaître à 85° : la marque signale une égalité exacte, pas une approximation."
              solved={exactDone}
              onAnswered={() => setExactDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Faut-il être vertical et horizontal ?',
          done: obliqueDone,
          content: (
            <TapQuestion
              above={
                <RelationFigure
                  droites={OBLIQUE}
                  box={BOX}
                  ariaLabel="Deux droites inclinées formant un angle droit"
                />
              }
              prompt="Ces deux droites sont toutes les deux penchées. Sont-elles perpendiculaires ?"
              options={[
                'Oui : l’angle entre elles est droit, leur inclinaison n’a pas d’importance',
                'Non : il faudrait une droite verticale et une horizontale',
                'Impossible à dire sans mesurer les longueurs',
              ]}
              correct={0}
              cols={1}
              explain="La perpendicularité concerne l’ANGLE ENTRE les droites, pas leur orientation sur la page. Deux droites obliques peuvent parfaitement être perpendiculaires — la marque le confirme."
              explainWrong="Regarde la marque d’angle droit sur la figure : elle n’apparaît que si l’angle vaut 90°. Ces deux droites obliques le vérifient (35° et 125° : leur différence fait 90°)."
              solved={obliqueDone}
              onAnswered={() => setObliqueDone(true)}
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
          <Square className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Deux droites sont <strong className="text-white">perpendiculaires</strong> quand elles forment un
            angle droit — exactement 90°, quelle que soit leur inclinaison sur la page. On note{' '}
            <span className="font-mono text-white">d₁ ⊥ d₂</span>.
          </p>
        </motion.div>
      }
    />
  );
}
