import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — déclencheur : chaque durée a son unité… et le temps ne
 * compte pas comme les longueurs.
 *
 * Le crochet final (« 1,5 minute = 1 min 50 s ? ») ouvre la porte de toute
 * la leçon : ici, tout marche par 60.
 */
const UNIT_ROWS = [
  { id: 'sprint', emoji: '🏃', label: 'Un sprint de 100 mètres', correct: 's' },
  { id: 'cours', emoji: '📚', label: 'Un cours de mathématiques', correct: 'min' },
  { id: 'nuit', emoji: '🌙', label: 'Une nuit de sommeil', correct: 'h' },
  { id: 'vacances', emoji: '🏖️', label: 'Les vacances d’été', correct: 'j' },
];
const UNIT_OPTIONS = ['s', 'min', 'h', 'j'];

const ESTIM_ROWS = [
  { id: 'dents', emoji: '🪥', label: 'Se brosser les dents', options: ['3 s', '3 min', '3 h'], correct: '3 min' },
  { id: 'clignement', emoji: '👁️', label: 'Un clignement d’yeux', options: ['1 s', '1 min', '1 h'], correct: '1 s' },
  { id: 'film', emoji: '🎬', label: 'Un film au cinéma', options: ['2 min', '2 h', '2 j'], correct: '2 h' },
];

const TRAP_Q = {
  q: 'Léa a couru pendant « 1,5 minute ». Est-ce la même chose que 1 min 50 s ?',
  options: [
    'Oui : 1,5 minute = 1 minute et 50 secondes',
    'Non : 1,5 minute = 1 minute et 30 secondes, car la moitié d’une minute vaut 30 s',
  ],
  correct: 1,
  explain:
    'Une minute vaut 60 secondes : sa MOITIÉ vaut 30 s, pas 50. Le temps ne compte pas en dixièmes comme les longueurs — ici, tout marche par 60. C’est le grand secret de cette leçon.',
};

export default function Module01Mission() {
  const [unitsDone, setUnitsDone] = useState(false);
  const [estimDone, setEstimDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La course contre la montre"
      moduleSubtitle="Un sprint, un cours, des vacances : chaque durée a son unité."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Léa prépare sa journée de compétition d’athlétisme.',
        body: <p>Du sprint de quelques secondes aux vacances qui suivront : les durées de sa journée ne se mesurent pas toutes pareil.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'À chaque durée, son unité',
          done: unitsDone,
          content: (
            <div className="space-y-5">
            <BatchChoiceQuestion
              requires={[]}
              intro={
                <p className="text-sm text-slate-600">
                  Seconde, minute, heure, jour : choisis l'unité la plus naturelle pour chaque durée.
                </p>
              }
              rows={UNIT_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: UNIT_OPTIONS,
                correct: UNIT_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={unitsDone}
              onAnswered={() => setUnitsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Un sprint se compte en secondes, un cours en minutes, une nuit en heures, des vacances en jours :
                  quatre unités pour quatre échelles de temps.
                </Feedback>
              )}
            />
            {/* Le tri vient d'être fait à l'intuition : la brique fixe les
                quatre unités et leurs échelles. */}
            {unitsDone && (
              <KnowledgeBrick
                id="unites-temps"
                variant="new"
                lead="Ces quatre unités sont celles de toute la leçon — voici l’échelle de chacune."
              />
            )}
            </div>
          ),
        },
        {
          // Le titre était « Le bon ordre de grandeur » : StepCard l'affiche
          // AVANT que l'étape ne s'ouvre, si bien que le mot arrivait avant
          // que rien ne l'ait posé. Titre neutre, mot posé par la brique.
          num: 2,
          title: 'Réaliste, ou pas du tout ?',
          done: estimDone,
          content: (
            <div className="space-y-5">
            <BatchChoiceQuestion
              requires={['unites-temps']}
              intro={<p className="text-sm text-slate-600">Estime chaque durée : une seule proposition est réaliste.</p>}
              rows={ESTIM_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: it.options,
                correct: it.options.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={estimDone}
              onAnswered={() => setEstimDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Chacune des propositions écartées était absurde : quelques secondes pour se brosser
                  les dents, une heure pour cligner des yeux.
                </Feedback>
              )}
            />
            {/* Le jugement rapide vient d'être exercé trois fois : la brique
                le nomme et en fait un réflexe réutilisable. */}
            {estimDone && (
              <KnowledgeBrick
                id="ordre-de-grandeur"
                variant="new"
                lead="Ce que tu viens de faire trois fois — juger « à peu près combien » — porte un nom."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le piège de la virgule',
          done: trapDone,
          content: (
            <TapQuestion
              prompt={TRAP_Q.q}
              options={TRAP_Q.options}
              correct={TRAP_Q.correct}
              cols={1}
              explain={TRAP_Q.explain}
              requires={['unites-temps', 'ordre-de-grandeur']}
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Une question reste ouverte : pourquoi une demi-minute
          fait-elle 30 s et non 50 ? La réponse se cache dans le mécanisme d'une horloge.
        </KnowledgeSnapshot>
      }
    />
  );
}
