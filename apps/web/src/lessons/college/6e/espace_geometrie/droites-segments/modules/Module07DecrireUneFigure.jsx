import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GeoFigure from '../components/GeoFigure';
import { notationOf, isAligned } from '../components/droitesUtils';

/**
 * Module 7 — PRACTICE LAB : décrire une figure (P9).
 *
 * Objectif : boucler la leçon sur son point de départ — communiquer sans
 * ambiguïté. Au module 1 de la leçon précédente, il fallait deux nombres
 * pour désigner un point ; ici, il faut le bon vocabulaire ET la bonne
 * notation pour qu'un camarade puisse redessiner la figure.
 *
 * Aha : une description est bonne si elle permet de REDESSINER la figure à
 * l'identique. « Un trait qui va de A vers B » ne dit pas si ça s'arrête.
 *
 * Misconception visée : décrire par l'apparence (« un trait penché »)
 * plutôt que par les objets et leurs extrémités.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 190 };

const A = { x: 65, y: 145 };
const B = { x: 165, y: 60 };
const C = { x: 265, y: 145 };
const M = { x: 115, y: 102.5 }; // milieu de [AB]

const FIGURE = [
  { kind: 'segment', a: A, b: B, nameA: 'A', nameB: 'B', color: '#4f46e5' },
  { kind: 'segment', a: B, b: C, nameA: 'B', nameB: 'C', color: '#0891b2' },
  { kind: 'droite', a: A, b: C, nameA: 'A', nameB: 'C', color: '#e11d48' },
];

/* Étape 2 : quatre affirmations sur la figure — vraies ou fausses. */
const CLAIMS = [
  { id: 'c1', text: <>La figure contient <span className="font-mono">[AB]</span> et <span className="font-mono">[BC]</span>.</>, correct: 0 },
  { id: 'c2', text: <>La figure contient la droite <span className="font-mono">(AC)</span>.</>, correct: 0 },
  { id: 'c3', text: <>Le point B appartient à la droite <span className="font-mono">(AC)</span>.</>, correct: 1 },
  { id: 'c4', text: <>M est le milieu de <span className="font-mono">[AB]</span>.</>, correct: 0 },
];

export default function Module07DecrireUneFigure() {
  const [descDone, setDescDone] = useState(false);
  const [claimsDone, setClaimsDone] = useState(false);
  const [precisionDone, setPrecisionDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Décrire une figure"
      moduleSubtitle="Assez précis pour qu’on puisse la redessiner."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 07',
        title: 'Ton camarade ne voit pas la figure. Décris-la.',
        body: (
          <p>
            Une bonne description permet de <strong>redessiner exactement</strong> la même figure — ni plus,
            ni moins.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Quelle description est exacte ?',
          done: descDone,
          content: (
            <div className="space-y-5">
              {/* Le critère de réussite doit exister AVANT qu'on demande de
                  choisir la bonne description. */}
              <KnowledgeBrick
                id="decrire-figure"
                variant="new"
                lead="Ton camarade ne voit pas la figure : ta phrase doit lui suffire pour la retracer."
              />
              <TapQuestion
              above={
                <GeoFigure
                  objects={FIGURE}
                  points={[{ ...M, name: 'M', color: '#7c3aed' }]}
                  box={BOX}
                  showNotation
                  ariaLabel="Figure : segments AB et BC, droite AC, et le point M milieu de AB"
                />
              }
              prompt="Laquelle de ces descriptions permet de redessiner la figure sans hésiter ?"
              options={[
                'Les segments [AB] et [BC], et la droite (AC) qui passe sous B',
                'Trois traits qui forment un triangle penché',
                'Les droites (AB), (BC) et (AC)',
              ]}
              correct={0}
              cols={1}
              explain="Il faut nommer chaque objet AVEC son type : deux segments, une droite. Les notations [AB], [BC] et (AC) disent tout — par où ça passe et jusqu’où ça va."
              explainWrong="« Trois traits penchés » ne dit pas où ils s’arrêtent. Et parler de trois droites serait faux : deux de ces traits s’arrêtent à leurs extrémités, ce sont des segments."
                solved={descDone}
                onAnswered={() => setDescDone(true)}
                requires={['decrire-figure', 'notation-objets', 'lire-la-notation']}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Vrai ou faux ?',
          subtitle: 'Une seule de ces affirmations est fausse.',
          done: claimsDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-2">
                  <GeoFigure
                    objects={FIGURE}
                    points={[{ ...M, name: 'M', color: '#7c3aed' }]}
                    box={BOX}
                    showNotation
                    ariaLabel="La même figure, à examiner"
                  />
                  <p className="text-sm text-slate-600">
                    Vérifie chaque affirmation sur la figure — sans te fier à l’impression générale.
                  </p>
                </div>
              }
              requires={['notation-objets', 'appartenance', 'milieu']}
              rows={CLAIMS.map((c) => ({
                id: c.id,
                label: <span className="text-sm">{c.text}</span>,
                options: ['Vrai', 'Faux'],
                correct: c.correct,
                correction: <>{c.correct === 0 ? 'vrai' : 'faux'}</>,
              }))}
              solved={claimsDone}
              onAnswered={() => setClaimsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  B n’appartient <strong>pas</strong> à la droite (AC) : il est nettement au-dessus. A, B et C
                  ne sont pas alignés — c’est justement pour cela qu’ils forment une figure.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Ce qui manque',
          done: precisionDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Un élève écrit : « <em>il y a un trait entre A et B</em> ». Qu’est-ce qui manque pour
                  pouvoir redessiner la figure ?
                </>
              }
              options={[
                'Dire si ce trait s’arrête ou continue — donc son type',
                'Dire de quelle couleur est le trait',
                'Rien, la phrase suffit',
              ]}
              correct={0}
              cols={1}
              requires={['decrire-figure', 'etendue', 'notation-objets']}
              explain="« Un trait entre A et B » peut désigner le segment [AB], la demi-droite [AB), ou la droite (AB). Sans le type, on ne sait pas jusqu’où le tracer."
              explainWrong="La couleur n’est pas une information géométrique. Ce qui manque, c’est l’étendue : où le trait s’arrête-t-il ?"
              solved={precisionDone}
              onAnswered={() => setPrecisionDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Ta carte est complète. Le skatepark va la mettre à l’épreuve.
        </KnowledgeSnapshot>
      }
    />
  );
}
