import React, { useState } from 'react';
import { Droplet } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MeasureFillMission from '../../../../../common/components/MeasureFillMission';

/**
 * Module 4 V2 — « Construire les relations », version station de mesure.
 *
 * Étapes 1–3 : une seule mesure, répétée — dix petites mesures remplissent la
 * grande (1 L = 10 dL, 1 dL = 10 cL, 1 cL = 10 mL). La règle se VOIT dans le
 * réservoir avant d'être écrite.
 * Étape 4 : mission finale — atteindre une quantité exacte en combinant des
 * mesures, avec le robinet pour retirer quand on a dépassé.
 * Étape 5 : la chaîne écrite (formalisation rapide).
 */

const REPEAT_STEPS = [
  {
    num: 1,
    title: 'Remplis 1 L avec des mesures de 1 dL',
    subtitle: 'Combien de fois faut-il verser ?',
    challenge: { id: 'l', targetMl: 1000, tankMl: 1000, unit: 'L', displayUnit: 'dL', tools: [{ id: 'dl', ml: 100, label: '1 dL' }], rule: '1 L = 10 dL' },
  },
  {
    num: 2,
    title: 'Remplis 1 dL avec des mesures de 1 cL',
    subtitle: 'Même geste, une échelle plus petite.',
    challenge: { id: 'dl', targetMl: 100, tankMl: 100, unit: 'dL', displayUnit: 'cL', tools: [{ id: 'cl', ml: 10, label: '1 cL' }], rule: '1 dL = 10 cL' },
  },
  {
    num: 3,
    title: 'Remplis 1 cL avec des mesures de 1 mL',
    subtitle: 'Et encore une fois, dix fois plus petit.',
    challenge: { id: 'cl', targetMl: 10, tankMl: 10, unit: 'cL', displayUnit: 'mL', tools: [{ id: 'ml', ml: 1, label: '1 mL' }], rule: '1 cL = 10 mL' },
  },
];

const MISSION = [
  {
    id: 'c60',
    targetMl: 600, tankMl: 1000, unit: 'cL',
    tools: [{ id: 't10', ml: 100, label: '10 cL' }, { id: 't20', ml: 200, label: '20 cL' }, { id: 't50', ml: 500, label: '50 cL' }],
    solution: [{ toolId: 't50', type: 'add' }, { toolId: 't10', type: 'add' }],
  },
  {
    id: 'c80',
    targetMl: 800, tankMl: 1000, unit: 'cL',
    tools: [{ id: 't10', ml: 100, label: '10 cL' }, { id: 't20', ml: 200, label: '20 cL' }, { id: 't50', ml: 500, label: '50 cL' }],
    solution: [{ toolId: 't50', type: 'add' }, { toolId: 't20', type: 'add' }, { toolId: 't10', type: 'add' }],
  },
  {
    // Seules mesures : 30 cL et 50 cL → 70 cL n'est atteignable qu'en dépassant puis en vidant.
    id: 'c70',
    targetMl: 700, tankMl: 1000, unit: 'cL', allowRemove: true,
    tools: [{ id: 't30', ml: 300, label: '30 cL' }, { id: 't50', ml: 500, label: '50 cL' }],
    solution: [{ toolId: 't50', type: 'add' }, { toolId: 't50', type: 'add' }, { toolId: 't30', type: 'remove' }],
  },
  {
    id: 'c750',
    targetMl: 750, tankMl: 1000, unit: 'mL', allowRemove: true,
    tools: [{ id: 't5cl', ml: 50, label: '5 cL' }, { id: 't3dl', ml: 300, label: '3 dL' }, { id: 't5dl', ml: 500, label: '5 dL' }],
    solution: [{ toolId: 't5dl', type: 'add' }, { toolId: 't3dl', type: 'add' }, { toolId: 't5cl', type: 'remove' }],
  },
];

const LADDER = [
  { id: 'mL-cL', from: 'mL', to: 'cL', correct: 10, options: [10, 100, 1000] },
  { id: 'cL-dL', from: 'cL', to: 'dL', correct: 10, options: [10, 100, 1000] },
  { id: 'dL-L', from: 'dL', to: 'L', correct: 10, options: [10, 100, 1000] },
];

export default function Module04RelationsUnites() {
  const [repeatDone, setRepeatDone] = useState([]);
  const [missionDone, setMissionDone] = useState(false);
  const [ladderDone, setLadderDone] = useState(false);
  const mark = (id) => setRepeatDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Construire les relations"
      moduleSubtitle="Partager 1 L en 10 dL, en 100 cL, en 1000 mL — en versant, pas en récitant."
      estimatedTime="15 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Construis toi-même les unités, une mesure à la fois.',
        body: (
          <p>
            Une station de mesure : des béchers transparents, un réservoir gradué, un robinet. Remplis, verse,
            regarde le niveau monter — la règle apparaît toute seule.
          </p>
        ),
      }}
      steps={[
        ...REPEAT_STEPS.map((s) => ({
          num: s.num,
          title: s.title,
          subtitle: s.subtitle,
          done: repeatDone.includes(s.challenge.id),
          content: (kit) => (
            <MeasureFillMission
              mode="repeat"
              challenges={[s.challenge]}
              react={kit.react}
              solved={repeatDone.includes(s.challenge.id)} // revisite : on peut rejouer librement
              onChallengeSuccess={() => mark(s.challenge.id)}
            />
          ),
        })),
        {
          num: 4,
          title: '🚰 Mission finale — Remplis exactement le réservoir',
          subtitle: 'Utilise les différentes mesures pour atteindre exactement la quantité demandée.',
          done: missionDone,
          content: (kit) => (
            <MeasureFillMission
              mode="free"
              challenges={MISSION}
              react={kit.react}
              solved={missionDone}
              onAllCompleted={() => setMissionDone(true)}
            />
          ),
        },
        {
          num: 5,
          title: 'Toute la chaîne, en une ligne',
          subtitle: 'Ce que tes mains viennent de faire, écrit en chiffres.',
          done: ladderDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">Combien faut-il de la petite unité pour former la grande ?</p>}
              rows={LADDER.map((s) => ({
                id: s.id,
                label: <span className="font-mono">1 {s.to} = … {s.from}</span>,
                options: s.options,
                correct: s.options.indexOf(s.correct),
                correction: <>1 {s.to} = {s.correct} {s.from}</>,
              }))}
              solved={ladderDone}
              onAnswered={() => setLadderDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && <>{nCorrect} / {total} corrects — les bonnes réponses sont en vert : chaque marche vaut ×10.{' '}</>}
                  1 cL = 10 mL, 1 dL = 10 cL, 1 L = 10 dL : et donc 1 L = 100 cL = 1 000 mL.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Droplet className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            1 L = 10 dL = 100 cL = 1 000 mL : une seule contenance, plusieurs écritures — et plusieurs façons de la
            construire. C’est la clé pour convertir sans se tromper.
          </p>
        </div>
      }
    />
  );
}
