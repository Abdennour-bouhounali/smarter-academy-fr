import React, { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { RANGE, translatePoint, formatVec } from '../components/vectorUtils';

/**
 * Module 6 — FORMALISATION : la notation, après l'expérience.
 *
 * Chaque règle renvoie au geste qui l'a produite. La notation vectorielle
 * n'apparaît qu'ici, une fois que « le même déplacement posé ailleurs » a été
 * vécu au module 4 et chiffré au module 5.
 *
 * Misconception ciblée : lire la flèche AB comme « le segment AB ». L'étape 1
 * oppose explicitement les deux écritures.
 */
const A = { x: -3, y: -2 };
const V = { dx: 4, dy: 3 };
const B = translatePoint(A, V);

export default function Module06VecteurEtTranslation() {
  const [batch, setBatch] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Relier chaque écriture à son sens',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                points={[
                  { id: 'A', name: 'A', x: A.x, y: A.y, color: '#e11d48' },
                  { id: 'B', name: 'B', x: B.x, y: B.y, color: '#059669' },
                ]}
                arrows={[{ id: 'ab', from: A, to: B, color: '#7c3aed', label: '' }]}
                caption={false}
                ariaLabel="Une flèche allant du point A au point B"
              />
              <p className="text-center text-sm text-slate-700">
                A {`(${A.x} ; ${A.y})`}, B {`(${B.x} ; ${B.y})`}, et le déplacement {formatVec(V)}.
              </p>
            </div>
          }
          rows={[
            {
              id: 'n1',
              label: 'Que désigne AB (sans flèche) ?',
              options: ['La longueur du segment [AB]', 'Le déplacement de A vers B'],
              correct: 0,
              correction: 'Sans flèche, AB est un NOMBRE : la distance entre A et B. Avec une flèche au-dessus, c’est le déplacement.',
            },
            {
              id: 'n2',
              label: 'Que désigne le vecteur noté avec une flèche au-dessus de AB ?',
              options: [
                'Le déplacement qui mène de A à B : direction, sens et longueur',
                'Le segment joignant A et B',
              ],
              correct: 0,
              correction: 'La flèche indique un déplacement orienté. Il peut être dessiné n’importe où : ce sont ses composantes qui le définissent.',
            },
            {
              id: 'n3',
              label: 'Que signifie « B est l’image de A par la translation de vecteur u » ?',
              options: [
                'On est passé de A à B en appliquant le déplacement u',
                'A et B sont à la même distance de l’origine',
              ],
              correct: 0,
              correction: 'La translation applique le vecteur u à chaque point. B est le point où arrive A.',
            },
            {
              id: 'n4',
              label: 'Deux vecteurs sont égaux quand…',
              options: [
                'ils ont les mêmes coordonnées, où qu’ils soient dessinés',
                'ils partent du même point',
              ],
              correct: 0,
              correction: 'C’est ce que tu as manipulé au module 4 : quatre flèches à quatre endroits, un seul et même vecteur.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Les quatre écritures sont reliées à leur sens — notamment la différence entre AB (une longueur) et le vecteur AB (un déplacement).'
                : `${nCorrect} sur ${total}. Retiens surtout : la flèche au-dessus change tout, elle transforme un nombre en déplacement.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Vecteur et translation"
      moduleSubtitle="La notation, une fois le geste acquis"
      estimatedTime="7 min"
      brief={{
        tag: 'Formalisation',
        title: 'Mettre les mots et les symboles',
        tone: 'blue',
        body: (
          <p>
            Tu as déplacé, comparé, calculé. Il ne reste qu’à écrire tout cela comme les
            mathématiciens — et à ne pas confondre une longueur avec un déplacement.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <BookMarked className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">À retenir</p>
          </div>
          <ul className="text-sm text-blue-900 space-y-1.5 list-disc pl-5">
            <li>
              <MathText>{'$\\vec{AB}$'}</MathText> est le <strong>vecteur</strong> qui mène de A à B :
              une direction, un sens, une longueur. <strong>AB</strong> sans flèche est un nombre,
              la longueur du segment.
            </li>
            <li>
              Ses coordonnées sont{' '}
              <MathText>{'$(x_B - x_A\\ ;\\ y_B - y_A)$'}</MathText> — toujours arrivée moins départ.
            </li>
            <li>
              Deux vecteurs sont <strong>égaux</strong> quand leurs coordonnées coïncident, quel que
              soit l’endroit où on les dessine.
            </li>
            <li>
              Si <MathText>{'$\\vec{AB} = \\vec{CD}$'}</MathText>, alors ABDC est un{' '}
              <strong>parallélogramme</strong> : deux côtés opposés, même déplacement.
            </li>
            <li>
              La <strong>translation</strong> de vecteur <MathText>{'$\\vec{u}$'}</MathText> fait
              glisser toute figure sans la déformer ni la tourner.
            </li>
          </ul>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          Ces notations suffisent pour le dernier atelier : construire un parallélogramme et
          dessiner une frise.
        </Feedback>
      }
    />
  );
}
