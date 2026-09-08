import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InvariantsLab from '../components/InvariantsLab';

/**
 * Module 4 — MANIPULATION : la chasse au contre-exemple.
 *
 * On ne DIT pas à l'élève que la symétrie centrale conserve les longueurs, les
 * angles et les aires : on lui demande de trouver une figure où l'une des
 * trois cesse d'être conservée. Il déforme le triangle, promène le centre, et
 * regarde une table de comparaison qui reste obstinément verte.
 *
 * C'est un renversement délibéré : la propriété n'est pas une affirmation à
 * croire, c'est une recherche qui échoue. L'élève sait alors POURQUOI il y
 * croit — il a essayé de la casser.
 *
 * Expected observation : « quoi que je fasse, la figure et son image gardent la
 * même longueur, le même angle et la même aire ».
 * Misconception targeted : croire qu'une transformation « déplace donc
 * déforme », ou que la position du centre change la taille de l'image.
 */
export default function Module04CeQuiNeChangePas() {
  const [sommets, setSommets] = useState([
    { x: 150, y: 355 }, { x: 315, y: 390 }, { x: 205, y: 225 },
  ]);
  const [centre, setCentre] = useState({ x: 400, y: 250 });
  const [essais, setEssais] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Chaque déformation compte comme une tentative de contre-exemple.
  const bouger = (setter) => (v) => { setter(v); setEssais((n) => Math.min(n + 1, 999)); };
  const assez = essais >= 25;

  const steps = [
    {
      num: 1,
      title: 'Cherche à mettre la symétrie en défaut',
      subtitle: 'Déforme le triangle, promène la punaise. Trouve une position où une grandeur change.',
      done: assez,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-sm text-slate-700">
            Ta mission n’est pas de vérifier que tout va bien : c’est de{' '}
            <strong>trouver un contre-exemple</strong>. Aplatis le triangle, mets la punaise
            dedans, sur un sommet, très loin — cherche un « <strong>NON</strong> » dans la dernière
            colonne.
          </div>
          <InvariantsLab
            sommets={sommets}
            onSommets={bouger(setSommets)}
            centre={centre}
            onCentre={bouger(setCentre)}
            ariaLabel="Un triangle déformable et son image par symétrie centrale, avec les grandeurs comparées"
          />
          {assez ? (
            <Feedback tone="ok">
              <strong>Aucun contre-exemple.</strong> Ce n’est pas un hasard, et ce n’est pas
              qu’« on n’a pas cherché assez » : le demi-tour fait tourner la figure sans jamais
              l’étirer ni la comprimer. Les trois colonnes resteront vertes quoi que tu fasses.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Continue à déformer : essaie un triangle très plat, ou place la punaise{' '}
              <em>à l’intérieur</em> du triangle. ({essais} essais)
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Alors qu’est-ce qui change ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Puisque les longueurs, les angles et les aires ne changent pas, que change donc la symétrie centrale ?"
            options={[
              'La position de la figure, et rien d’autre',
              'La taille de la figure',
              'La forme de la figure',
              'Rien du tout : la figure est identique',
            ]}
            correct={0}
            cols={1}
            requires={['symetrie-centrale', 'centre-milieu']}
            explain="Même forme et même taille, mais posée ailleurs : la symétrie centrale DÉPLACE. C’est justement ce qui la rend utile — on peut bouger une figure sans la refaire."
            explainWrong="« Rien du tout » irait trop loin : la figure de départ et son image ne sont pas au même endroit, et tu l’as bien vu à l’écran. Ce qui change, c’est uniquement la POSITION."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <KnowledgeBrick
                id="invariants-symetrie"
                variant="new"
                lead={<>Tu as cherché un contre-exemple et tu n’en as pas trouvé. Voilà ce que ta recherche a établi.</>}
              />
              <KnowledgeBrick id="mem-invariants" variant="new" compact />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Se servir des invariants',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Une symétrie de centre O transforme le triangle ABC en A’B’C’. Réponds sans rien
                construire.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'AB = 6 cm. Combien mesure A’B’ ?',
                options: ['6 cm', '12 cm'],
                correct: 0,
                correction: 'Les longueurs sont conservées : A’B’ = AB = 6 cm.',
              },
              {
                id: 'r2',
                label: 'L’angle en B mesure 40°. Combien mesure l’angle en B’ ?',
                options: ['40°', '140°'],
                correct: 0,
                correction: 'Les angles sont conservés : l’angle en B’ mesure aussi 40°.',
              },
              {
                id: 'r3',
                label: 'L’aire de ABC est 15 cm². Quelle est celle de A’B’C’ ?',
                options: ['15 cm²', '30 cm²'],
                correct: 0,
                correction: 'Les aires sont conservées : A’B’C’ a la même aire, 15 cm².',
              },
              {
                id: 'r4',
                label: 'I est le milieu de [AB]. Que devient son image I’ ?',
                options: ['Le milieu de [A’B’]', 'Un point quelconque de [A’B’]'],
                correct: 0,
                correction: 'Le milieu se conserve : l’image du milieu de [AB] est le milieu de [A’B’].',
              },
            ]}
            requires={['invariants-symetrie']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Quatre réponses, un seul réflexe : <strong>tout se conserve</strong>. Cela permet
                  de répondre sans jamais construire la figure image.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Reprends la table du laboratoire : elle affichait « oui »
                  partout. Une grandeur mesurée sur la figure se retrouve <strong>à l’identique</strong>{' '}
                  sur l’image — jamais doublée, jamais réduite.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Ce qui ne change pas"
      moduleSubtitle="Une propriété qu’on a essayé de casser"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Trouve un contre-exemple',
        tone: 'emerald',
        body: (
          <p>
            On pourrait te dire ce que la symétrie centrale conserve. C’est plus solide de{' '}
            <strong>chercher à la prendre en défaut</strong> : déforme la figure autant que tu veux,
            et surveille la dernière colonne du tableau.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
