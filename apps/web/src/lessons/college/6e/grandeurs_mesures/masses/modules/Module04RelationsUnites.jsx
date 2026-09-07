import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import UnitLadder from '../components/UnitLadder';

/**
 * Module 4 — manipulation, reconstruit sur le lesson kit.
 *
 * Empiler des blocs jusqu'à former l'unité du dessus : la relation ×1 000
 * se construit, elle ne se récite pas. Le geste n'a pas d'« état faux » —
 * l'élève empile, la somme s'affiche — donc kit.react/onSolved partent
 * dès que la cible est atteinte, sans bouton bloquant.
 */
function BuildRound({ perGroup, target, unit, targetLabel, tone, react, done, onSolved }) {
  // Une étape déjà validée lors d'une visite précédente rouvre sur la pile
  // TERMINÉE (et non sur zéro) : l'élève retrouve ce qu'il avait construit,
  // et peut le défaire pour le refaire.
  const [groups, setGroups] = useState(done ? target / perGroup : 0);
  const reached = groups * perGroup === target;

  React.useEffect(() => {
    if (reached && !done) {
      react?.(true);
      onSolved?.();
    }
  }, [reached, done, react, onSolved]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Empile des blocs de {perGroup}{unit} jusqu’à obtenir exactement {targetLabel}.
      </p>
      {/* La pile reste manipulable après la cible atteinte (règle projet du
          2026-09-06) : défaire et refaire la pile est la façon dont l'élève
          vérifie que c'est bien 10 blocs, et pas « à peu près ». */}
      <GroupBuilder
        perGroup={perGroup}
        groups={groups}
        onChange={setGroups}
        max={target / perGroup}
        tone={tone}
        unit={unit}
      />
      {(reached || done) && (
        <Feedback tone="ok">
          {target / perGroup} × {perGroup}{unit} = <strong>{target}{unit} = {targetLabel}</strong>.
        </Feedback>
      )}
    </div>
  );
}

const LADDER = [
  { id: 'mg-g', from: 'mg', to: 'g', correct: 1000, options: [10, 100, 1000] },
  { id: 'g-kg', from: 'g', to: 'kg', correct: 1000, options: [10, 100, 1000] },
  { id: 'kg-t', from: 'kg', to: 't', correct: 1000, options: [10, 100, 1000] },
];

export default function Module04RelationsUnites() {
  const [gDone, setGDone] = useState(false);
  const [mgDone, setMgDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Construire les relations"
      moduleSubtitle="Empiler des blocs de 100 g jusqu’à former 1 kg."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'D’où vient le « 1 000 » des conversions ?',
        body: <p>Plutôt que de l’apprendre par cœur, construis-le : empile, compte, et regarde l’unité du dessus apparaître.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Fabrique 1 kilogramme',
          done: gDone,
          content: (kit) => (
            <BuildRound
              perGroup={100}
              target={1000}
              unit=" g"
              targetLabel="1 kg"
              tone="violet"
              react={kit.react}
              done={gDone}
              onSolved={() => setGDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Fabrique 1 gramme',
          done: mgDone,
          content: (kit) => (
            <BuildRound
              perGroup={100}
              target={1000}
              unit=" mg"
              targetLabel="1 g"
              tone="sky"
              react={kit.react}
              done={mgDone}
              onSolved={() => setMgDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'L’échelle complète',
          done: ladderDone,
          content: (
            <BatchChoiceQuestion
              requires={['escalier-masses', 'masse-invariante']}
              intro={
                <div className="space-y-4">
                  <UnitLadder />
                  {/* L'escalier est sous les yeux et les deux empilements
                      viennent d'être faits : la brique fixe la relation AVANT
                      les trois lignes à compléter, jamais après. */}
                  <KnowledgeBrick
                    id="escalier-masses"
                    variant="new"
                    lead="Tu viens d'empiler dix blocs pour faire 1 kg, puis dix pour faire 1 g. Voilà la règle entière."
                  />
                  <p className="text-sm text-slate-600">
                    Combien faut-il de la petite unité pour former la grande ? Aide-toi de l’escalier
                    ci-dessus et de ce que tu viens d’empiler.
                  </p>
                </div>
              }
              rows={LADDER.map((s) => ({
                id: s.id,
                label: <span className="font-mono">1 {s.to} = … {s.from}</span>,
                options: s.options,
                correct: s.options.indexOf(s.correct),
                correction: <>1 {s.to} = {s.correct.toLocaleString('fr-FR')} {s.from}</>,
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
                  Pour les masses, chaque marche vaut 1 000 : 1 g = 1 000 mg, 1 kg = 1 000 g, 1 t = 1 000 kg.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu as l'escalier complet. Au module suivant, tu t'en sers pour
          convertir sans jamais te tromper de sens.
        </KnowledgeSnapshot>
      }
    />
  );
}
