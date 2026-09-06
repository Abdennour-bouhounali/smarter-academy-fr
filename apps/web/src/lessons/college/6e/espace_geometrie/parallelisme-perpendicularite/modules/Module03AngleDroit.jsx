import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
                <>
                  <Feedback tone="ok">
                    Le petit carré est apparu à l’intersection : c’est la marque de l’
                    <strong>angle droit</strong>, et il n’est apparu qu’à cet angle-là.
                  </Feedback>
                  {/* La relation se définit ICI, après le geste qui l'a fait
                      surgir — et séparément du parallélisme. */}
                  <KnowledgeBrick
                    id="droites-perpendiculaires"
                    variant="new"
                    lead="Ce déclic à 90° pile, c’est la seconde grande relation entre deux droites."
                  />
                </>
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
              requires={['droites-perpendiculaires', 'angle-droit']}
              explain="La perpendicularité est exacte : 90°, ni 89 ni 91. C’est pour cela que la marque n’apparaît pas tant que l’angle n’est pas juste — tu l’as constaté en tournant."
              explainWrong="« Presque » n’existe pas ici. Tu as vu le carré refuser d’apparaître à 85° : la marque signale une égalité exacte, pas une approximation."
              solved={exactDone}
              onAnswered={() => setExactDone(true)}
            />
          ),
        },
        {
          num: 3,
          // Titre neutre : il ne doit pas déjà répondre.
          title: 'Deux droites penchées',
          done: obliqueDone,
          content: (
            <div className="space-y-5">
              <KnowledgeBrick
                id="orientation-sans-importance"
                variant="new"
                lead="Tu as fait tourner d₂ sans jamais bouger d₁ : c’est bien l’angle ENTRE elles qui décidait."
              />
              <TapQuestion
                requires={['orientation-sans-importance', 'droites-perpendiculaires']}
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
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Les deux relations sont posées. On va maintenant les traquer
          partout — dans la ville, sur un plan.
        </KnowledgeSnapshot>
      }
    />
  );
}
