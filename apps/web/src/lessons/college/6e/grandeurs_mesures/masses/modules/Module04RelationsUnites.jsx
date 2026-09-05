import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
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
  const [groups, setGroups] = useState(0);
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
      <GroupBuilder
        perGroup={perGroup}
        groups={done ? target / perGroup : groups}
        onChange={setGroups}
        max={target / perGroup}
        tone={tone}
        unit={unit}
        disabled={done}
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
              intro={
                <div className="space-y-4">
                  <UnitLadder />
                  <p className="text-sm text-slate-600">
                    Combien faut-il de la petite unité pour former la grande ? (Aide-toi de l’échelle que tu viens
                    d’explorer, et de ce que tu viens d’empiler.)
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Boxes className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            mg → g → kg → t : trois marches, toutes de 1 000. C’est cette échelle qui rend les conversions
            prévisibles.
          </p>
        </motion.div>
      }
    />
  );
}
