import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec, formatDec } from '../components/durationUtils';

/**
 * Module 6 — practice lab : les durées en situation réelle.
 *
 * Trois missions : la durée d'un trajet (sauts), l'heure de début d'un
 * enchaînement (addition de durées + marche arrière), et une comparaison
 * d'itinéraires avec temps d'attente.
 */
const COMPARE_Q = {
  q: 'Pour aller au tournoi : option A = trajet direct de 1 h 55 min ; option B = 110 min de route + 10 min d’attente au péage. Laquelle est la plus rapide ?',
  options: [
    'Option A (1 h 55 min)',
    'Option B (110 min + 10 min)',
    'Les deux durent exactement autant',
  ],
  correct: 0,
  explain:
    'A = 1 h 55 min = 115 min. B = 110 + 10 = 120 min = 2 h. L’option A gagne de 5 minutes — mais seulement une fois TOUT converti en minutes, attente comprise.',
};

export default function Module06MissionsHoraires() {
  const [trainHDone, setTrainHDone] = useState(false);
  const [trainMinDone, setTrainMinDone] = useState(false);
  const [entrainementDone, setEntrainementDone] = useState(false);
  const [compareDone, setCompareDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Missions horaires"
      moduleSubtitle="Trains, entraînements, comparaisons : les durées en situation réelle."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Trois missions du quotidien, chrono en main.',
        body: <p>À chaque fois : convertir dans la même unité, sauter d'heure ronde en heure ronde, et vérifier que la réponse tient debout.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Mission 1 · Le train du tournoi',
          done: trainHDone && trainMinDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Départ <strong>8 h 52</strong>, arrivée <strong>11 h 05</strong>. Durée du trajet ? (méthode des
                sauts : + 8 min → 9 h, + 2 h → 11 h, + 5 min → 11 h 05)
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <NumericQuestion
                  prompt="Heures :"
                  suffix="h"
                  expected={2}
                  parse={parseDec}
                  display={formatDec(2)}
                  explain={<>Le saut central : <strong>2 h</strong>.</>}
                  explainFor={() => 'De 9 h à 11 h : combien d’heures entières ?'}
                  requires={['unites-temps', 'methode-sauts']}
                  solved={trainHDone}
                  onAnswered={() => setTrainHDone(true)}
                />
                <NumericQuestion
                  prompt="Minutes :"
                  suffix="min"
                  expected={13}
                  parse={parseDec}
                  display={formatDec(13)}
                  explain={<>8 + 5 = <strong>13 min</strong> : le trajet dure 2 h 13 min.</>}
                  explainFor={() => 'Additionne le saut de départ (8 min) et celui d’arrivée (5 min).'}
                  requires={['unites-temps', 'methode-sauts']}
                  solved={trainMinDone}
                  onAnswered={() => setTrainMinDone(true)}
                />
              </div>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Mission 2 · L’heure d’arrivée au stade',
          done: entrainementDone,
          content: (
            <NumericQuestion
              prompt="L'entraînement enchaîne 25 min d'échauffement, 40 min de jeu et 15 min d'étirements, et se termine à 18 h 30. À quelle heure faut-il ARRIVER ? (réponds en minutes après 17 h : par ex. 17 h 10 → 10)"
              suffix="min après 17 h"
              expected={10}
              parse={parseDec}
              display={formatDec(10)}
              explain={<>Total : 25 + 40 + 15 = 80 min = 1 h 20 min. En arrière depuis 18 h 30 : − 1 h → 17 h 30, − 20 min → <strong>17 h 10</strong>.</>}
              explainFor={(n) =>
                n === 50
                  ? '17 h 50, c’est reculer de seulement 40 min. Additionne D’ABORD les trois durées (25 + 40 + 15), puis recule d’un bloc.'
                  : 'Étape 1 : additionne les trois durées. Étape 2 : recule de ce total depuis 18 h 30, par sauts.'
              }
              requires={['unites-temps', 'base-60', 'methode-sauts', 'mem-retenue-60']}
              solved={entrainementDone}
              onAnswered={() => setEntrainementDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Mission 3 · Le duel des itinéraires',
          done: compareDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={COMPARE_Q.q}
                options={COMPARE_Q.options}
                correct={COMPARE_Q.correct}
                cols={1}
                explain={COMPARE_Q.explain}
                requires={['unites-temps', 'convertir-durees', 'comparer-durees']}
                solved={compareDone}
                onAnswered={() => setCompareDone(true)}
              />
              {compareDone && (
                <Feedback tone="ok">
                  Trois missions bouclées : sauts, addition de durées, comparaison — les mêmes gestes que les
                  vrais horaires de la vraie vie.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Le grand voyage Paris–Marseille ne te demandera rien qui ne
          figure déjà sur cette carte.
        </KnowledgeSnapshot>
      }
    />
  );
}
