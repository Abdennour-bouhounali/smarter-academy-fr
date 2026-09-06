import React, { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Ce module portait un encadré « À retenir » qui RECOPIAIT cinq définitions
 *   — la notation fléchée, les coordonnées, l'égalité, le parallélogramme, la
 *   translation — juste avant de les faire toutes tester d'un coup. Les
 *   définitions vivent désormais dans knowledge.jsx et paraissent une par une,
 *   par une brique, avant la ligne du tableau qui s'en sert :
 *     étape 1  brique `notation-vecteur`         → les deux écritures AB
 *     étape 2  brique `translation-de-vecteur`   → l'image par la translation
 *     étape 3  brique `parallelogramme-vecteurs` → l'égalité et son quadrilatère
 *   Le tableau d'origine n'est pas perdu : ses quatre lignes sont réparties
 *   entre les trois étapes, chacune posée après ce qu'elle exige.
 */
const A = { x: -3, y: -2 };
const V = { dx: 4, dy: 3 };
const B = translatePoint(A, V);

export default function Module06VecteurEtTranslation() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La flèche au-dessus des lettres',
      subtitle: 'Deux écritures très proches, deux objets très différents.',
      done: q1,
      content: (
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
          <KnowledgeBrick
            id="notation-vecteur"
            variant="new"
            lead="Tu as toujours écrit les déplacements avec deux nombres entre parenthèses. Voici comment on les écrit à partir de leurs deux extrémités."
          >
            <BatchChoiceQuestion
              requires={['notation-vecteur', 'vecteur']}
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
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  {allRight
                    ? 'La différence est tenue : AB est une longueur, la flèche au-dessus en fait un déplacement.'
                    : `${nCorrect} sur ${total}. La petite flèche change tout : elle transforme un nombre en déplacement orienté.`}
                </Feedback>
              )}
              solved={q1}
              onAnswered={() => setQ1(true)}
            />
          </KnowledgeBrick>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Dire qu’un point est l’image d’un autre',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="translation-de-vecteur"
            variant="new"
            lead="Le vecteur est le déplacement ; il manquait le nom de la transformation qui l’applique à tout le plan."
          >
            <BatchChoiceQuestion
              requires={['translation-de-vecteur', 'translation', 'image-point', 'notation-vecteur']}
              rows={[
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
              ]}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  {allRight
                    ? 'Deux mots, deux rôles : le vecteur décrit le déplacement, la translation l’applique.'
                    : 'Relis la brique ci-dessus : la translation applique le vecteur à CHAQUE point.'}
                </Feedback>
              )}
              solved={q2}
              onAnswered={() => setQ2(true)}
            />
          </KnowledgeBrick>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que dit une égalité de vecteurs',
      subtitle: 'Deux flèches identiques ferment un quadrilatère.',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="parallelogramme-vecteurs"
            variant="new"
            lead="Tu as posé la même flèche à plusieurs endroits au module 4. Voici ce qu’on peut en déduire quand on relie les quatre extrémités."
          >
            <BatchChoiceQuestion
              requires={['parallelogramme-vecteurs', 'vecteurs-egaux', 'coordonnees-vecteur']}
              rows={[
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
                {
                  id: 'n5',
                  label: 'Si le déplacement de A vers B est le même que celui de C vers D, que peut-on dire de ABDC ?',
                  options: [
                    'C’est un parallélogramme : [AB] et [CD] sont parallèles et de même longueur',
                    'C’est un carré',
                  ],
                  correct: 0,
                  correction: 'Deux déplacements égaux sont parallèles, de même sens et de même longueur : les segments qui les portent le sont aussi. Attention à l’ordre : le contour est A → B → D → C.',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  {allRight
                    ? 'Une égalité de vecteurs est donc une machine à construire des parallélogrammes — c’est l’atelier suivant.'
                    : `${nCorrect} sur ${total}. Le seul critère d’égalité reste les coordonnées, jamais l’endroit.`}
                </Feedback>
              )}
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          </KnowledgeBrick>
        </div>
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
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 flex gap-3 items-start">
          <BookMarked className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-blue-900">
            Trois écritures à distinguer, posées une par une. Prends le temps de comparer celles
            qui se ressemblent : c’est là que se cachent les erreurs.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Ces notations suffisent pour le dernier atelier : construire
          un parallélogramme, dessiner une frise, enchaîner deux trajets.
        </KnowledgeSnapshot>
      }
    />
  );
}
