import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATIONS } from '../components/situationsData';
import { formatDec, evaluate } from '../components/modelUtils';

/**
 * Module 2 — DÉCOUVERTE : « Grandeurs, variables, représentations ».
 *
 * Activity: pour trois situations, dire quelle grandeur dépend de quelle
 *   autre, écarter les informations inutiles, puis choisir la représentation
 *   adaptée à la QUESTION posée (formule, tableau, graphique).
 * Mathematical objective: distinguer la variable (ce qu'on choisit) de la
 *   grandeur qui en dépend ; comprendre qu'une représentation se choisit
 *   selon la question — « combien pour 37 » appelle une formule, « pour 0,
 *   1, 2, 3 » un tableau, « comment ça évolue » un graphique.
 * Student action: répondre (tap, batch).
 * Mathematical state: situations (règles) ; les valeurs citées viennent de
 *   `evaluate`.
 * Misconception targeted: prendre l'aire du jardin pour la variable ; croire
 *   qu'une seule représentation est « la bonne » dans l'absolu.
 */

const [PISCINE, STREAMING, JARDIN] = SITUATIONS;

export default function Module02GrandeursRepresentations() {
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);
  const [uselessDone, setUselessDone] = useState(false);
  const [reprDone, setReprDone] = useState(false);
  const [whyDone, setWhyDone] = useState(false);

  const dependQ = (s, done, setDone, requires) => (
    <TapQuestion
      requires={requires}
      prompt={<><strong>{s.title}.</strong> {s.text} Quelle grandeur dépend de quelle autre ?</>}
      options={[
        `${s.quantities[s.depends]} dépend de ${s.quantities[s.on]}`,
        `${s.quantities[s.on]} dépend de ${s.quantities[s.depends]}`,
        `${s.quantities[s.useless[0]]} dépend de ${s.quantities[s.on]}`,
      ]}
      correct={0}
      cols={1}
      explain={`On CHOISIT ${s.quantities[s.on]} (la variable ${s.variable}) ; ${s.quantities[s.depends]} en DÉPEND : pour ${s.variable} = 2, on obtient ${formatDec(evaluate(s.model, 2))} ${s.yLabel} ; pour ${s.variable} = 5, ${formatDec(evaluate(s.model, 5))} ${s.yLabel}. Le reste de l'énoncé ne varie pas.`}
      solved={done}
      onAnswered={() => setDone(true)}
    />
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Grandeurs, variables, représentations"
      moduleSubtitle="Quelle grandeur dépend de laquelle ? Et quelle écriture pour quelle question ?"
      estimatedTime="9 min"
      brief={{
        tag: '🔎 Mission 02',
        title: 'Trois situations, trois questions',
        tone: 'sky',
        body: (
          <p>
            Une piscine qui se remplit, un abonnement, un jardin carré. Avant tout calcul : qui varie, qui
            dépend, et qu’est-ce qui ne sert à rien ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Qui dépend de qui ?',
          subtitle: 'La piscine. Repère ce qu’on choisit et ce qui en découle.',
          done: d1,
          content: (
            <div className="space-y-3">
              {dependQ(PISCINE, d1, setD1, [])}
              {d1 && (
                <KnowledgeBrick
                  id="variable-modele"
                  variant="new"
                  lead="Tu viens de séparer ce qu’on choisit de ce qui en découle. Ces deux rôles ont un nom."
                />
              )}
            </div>
          ),
        },
        { num: 2, title: 'Encore', subtitle: 'L’abonnement, puis le jardin.', done: d2 && d3,
          content: (
            <div className="space-y-4">
              {dependQ(STREAMING, d2, setD2, ['variable-modele'])}
              {d2 && dependQ(JARDIN, d3, setD3, ['variable-modele'])}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Ce qui ne sert à rien',
          subtitle: 'Chaque situation cache une information inutile.',
          done: uselessDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'a', label: 'Piscine : pour savoir quand elle est pleine, la surface du jardin est…', options: ['inutile', 'utile'], correct: 0, correction: 'Seuls le débit et le volume comptent.' },
                { id: 'b', label: 'Abonnement : pour la facture du mois, la taille du catalogue est…', options: ['inutile', 'utile'], correct: 0, correction: 'On paie les films loués, pas le catalogue.' },
                { id: 'c', label: 'Jardin : pour l’aire, la marque de la clôture est…', options: ['inutile', 'utile'], correct: 0, correction: 'L’aire ne dépend que du côté.' },
                { id: 'd', label: 'Jardin : pour le prix de la clôture, le côté du jardin est…', options: ['utile', 'inutile'], correct: 0, correction: 'Le périmètre 4c fixe la longueur à clôturer.' },
              ]}
              requires={['informations-utiles', 'variable-modele']}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Une information est utile ou non <em>selon la question</em> : le côté du
                  jardin sert pour l’aire ET pour la clôture ; la marque ne sert jamais.
                </Feedback>
              )}
              solved={uselessDone}
              onAnswered={() => setUselessDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Quelle écriture pour quelle question ?',
          subtitle: 'Formule, tableau ou graphique : la question décide.',
          done: reprDone && whyDone,
          content: (
            <div className="space-y-4">
              <BatchChoiceQuestion
                rows={[
                  { id: 'a', label: `Piscine — « ${PISCINE.question} »`, options: ['une formule', 'un tableau', 'un graphique'], correct: 0, correction: '30 000 ÷ 12 = 2 500 min : un calcul direct.' },
                  { id: 'b', label: `Abonnement — « ${STREAMING.question} »`, options: ['un tableau', 'un graphique', 'une formule'], correct: 0, correction: 'Cinq valeurs demandées : un tableau les aligne.' },
                  { id: 'c', label: `Jardin — « ${JARDIN.question} »`, options: ['un graphique', 'un tableau', 'une formule'], correct: 0, correction: 'Une évolution se voit : la courbe monte de plus en plus vite.' },
                ]}
                requires={['variable-modele']}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Trois sur trois.' : `${nCorrect} sur ${total}.`} Une valeur précise → la formule ; plusieurs valeurs → le tableau ; une
                    allure, ou le moment où deux courbes se croisent → le graphique. Les trois écritures restent vraies ; la question choisit la plus utile.
                  </Feedback>
                )}
                solved={reprDone}
                onAnswered={() => setReprDone(true)}
              />
              {reprDone && (
                <KnowledgeBrick
                  id="choisir-representation"
                  variant="new"
                  lead="Trois questions, trois écritures différentes — et c’est la question qui a décidé à chaque fois."
                />
              )}
              {reprDone && (
                <TapQuestion
                  requires={['choisir-representation', 'variable-modele']}
                  prompt="Pour l’abonnement (6 € + 3 € par film), quelle est la facture pour 4 films ?"
                  options={[`${formatDec(evaluate(STREAMING.model, 4))} €`, '12 €', '24 €', '9 €']}
                  correct={0}
                  cols={2}
                  explain="6 + 3 × 4 = 18 €. Une fois la relation écrite (facture = 6 + 3n), toute valeur se calcule — c’est le pouvoir d’une formule."
                  solved={whyDone}
                  onAnswered={() => setWhyDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          Le module suivant construit à la main les deux écritures que tu viens d’apprendre à choisir : le tableau, puis le graphique.
        </KnowledgeSnapshot>
      }
    />
  );
}
