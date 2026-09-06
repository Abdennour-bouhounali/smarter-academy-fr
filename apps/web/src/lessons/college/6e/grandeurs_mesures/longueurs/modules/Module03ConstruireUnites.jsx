import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Ruler from '../components/Ruler';
import UnitLadder from '../components/UnitLadder';

/**
 * Module 3 — manipulation, reconstruit sur le lesson kit.
 *
 * Une même longueur physique, deux rangées de graduations (cm et mm) : la
 * mesure ne change pas, seule son écriture change.
 */
const READ_Q = {
  q: 'Sur cette règle, la graduation 3 (en cm) tombe exactement au-dessus de quelle graduation, en mm ?',
  options: ['13 mm', '30 mm', '3 mm'],
  correctLabel: '30 mm',
  explain: "3 cm et 30 mm marquent exactement le même point sur la règle : c'est la même longueur physique, écrite avec deux unités différentes.",
};

const LADDER = [
  { id: 'km-m', from: 'km', to: 'm', correct: 1000, options: [10, 100, 1000] },
  { id: 'm-cm', from: 'm', to: 'cm', correct: 100, options: [10, 100, 1000] },
  { id: 'cm-mm', from: 'cm', to: 'mm', correct: 10, options: [10, 100, 1000] },
];

export default function Module03ConstruireUnites() {
  const [tappedCm, setTappedCm] = useState(null);
  const [readDone, setReadDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Construire les unités"
      moduleSubtitle="Km, m, cm, mm : une même longueur, plusieurs façons de l’écrire."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Une seule longueur, deux règles superposées.',
        body: <p>La rangée du haut est graduée en cm, celle du bas en mm — sur le même segment.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Deux graduations, une seule longueur',
          done: readDone,
          content: (
            <TapQuestion
              above={
                <div className="space-y-2">
                  <Ruler
                    min={0}
                    max={10}
                    labelEvery={1}
                    height={190}
                    secondary={{ scale: 10, step: 10, labelEvery: 1, unit: 'mm' }}
                    mode="read"
                    readStep={1}
                    selectedValue={tappedCm}
                    onTickClick={setTappedCm}
                    ariaLabel="Règle graduée en centimètres avec une deuxième rangée en millimètres"
                  />
                  {tappedCm !== null && (
                    <p className="text-center text-sm text-sky-700 font-mono font-semibold">
                      {tappedCm} cm = {tappedCm * 10} mm — même point sur la règle.
                    </p>
                  )}
                </div>
              }
              requires={['longueur-invariante']}
              prompt={READ_Q.q}
              options={READ_Q.options}
              correct={READ_Q.options.indexOf(READ_Q.correctLabel)}
              cols={3}
              explain={READ_Q.explain}
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Emboîter les unités',
          done: ladderDone,
          content: (
            <BatchChoiceQuestion
              requires={['escalier-longueurs', 'longueur-invariante']}
              intro={
                <div className="space-y-4">
                  <UnitLadder />
                  {/* L'escalier est là, sous les yeux : la brique le nomme et
                      le fixe AVANT la demande qui suit — jamais après
                      (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
                  <KnowledgeBrick
                    id="escalier-longueurs"
                    variant="new"
                    lead="Sur la règle, 3 cm et 30 mm tombaient au même endroit. Voilà toute l'échelle."
                  />
                  <p className="text-sm text-slate-600">
                    Combien faut-il de la petite unité pour former la grande ? Aide-toi de l'escalier
                    ci-dessus.
                  </p>
                </div>
              }
              rows={LADDER.map((s) => ({
                id: s.id,
                label: <span className="font-mono">1 {s.from} = … {s.to}</span>,
                options: s.options,
                correct: s.options.indexOf(s.correct),
                correction: <>1 {s.from} = {s.correct} {s.to}</>,
              }))}
              solved={ladderDone}
              onAnswered={() => setLadderDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  1 km = 1 000 m, 1 m = 100 cm, 1 cm = 10 mm : chaque unité s'emboîte dans la suivante.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu as l'escalier complet. Au module suivant, tu t'en sers pour
          passer d'une unité à l'autre sans jamais te tromper de sens.
        </KnowledgeSnapshot>
      }
    />
  );
}
