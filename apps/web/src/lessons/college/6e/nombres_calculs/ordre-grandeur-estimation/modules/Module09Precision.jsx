import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 9 — practice lab, reconstruit sur le lesson kit.
 *
 * Quand un ordre de grandeur suffit-il, quand faut-il la valeur exacte ?
 * Les quatre situations passent par BatchChoiceQuestion : la correction se
 * révèle au dernier choix posé, chaque ligne fausse montre sa correction —
 * plus de vérification « tout ou rien » bloquante.
 */

/* ─── Étape 1 : choisir le bon ordre de grandeur ─────────────────── */
const ORDRE_Q = {
  q: 'Combien coûteront environ 98 objets à 2 € chacun ?',
  options: ['≈ 20 €', '≈ 200 €', '≈ 2 000 €'],
  correct: 1,
  explain:
    "98 ≈ 100, donc 100 × 2 = 200 €. Les deux autres réponses se trompent d'un facteur 10 : ce sont des erreurs d'ordre de grandeur, faciles à repérer en comparant les échelles.",
};

/* ─── Étape 2 : quand l'estimation suffit-elle ? ─────────────────── */
const SITUATIONS = [
  {
    id: 'stade',
    text: 'Combien de personnes, à peu près, dans ce stade de 40 000 places ?',
    correct: 0,
    correction: 'Pour une foule, « environ 35 000 » est suffisant et utile.',
  },
  {
    id: 'caisse',
    text: 'Combien dois-tu payer exactement à la caisse du magasin ?',
    correct: 1,
    correction: 'Pour payer, il faut le prix exact au centime près.',
  },
  {
    id: 'trajet',
    text: "Combien de temps dure approximativement le trajet en bus jusqu'à l'école ?",
    correct: 0,
    correction: "Pour s'organiser, « environ 20 minutes » suffit largement.",
  },
  {
    id: 'dose',
    text: 'Quelle dose de médicament donner à un patient ?',
    correct: 1,
    correction: 'Une dose de médicament doit être exacte : une approximation peut être dangereuse.',
  },
];

export default function Module09Precision() {
  const [ordreDone, setOrdreDone] = useState(false);
  const [sitDone, setSitDone] = useState(false);

  const s1 = ordreDone;
  const s2 = sitDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Choisir le bon niveau de précision"
      moduleSubtitle="Un ordre de grandeur suffit-il, ou faut-il une valeur exacte ?"
      estimatedTime="6 min"
      brief={{
        tag: '🎯 Précision',
        title: "Toutes les situations n'exigent pas la même précision.",
        body: <p>Parfois « à peu près » suffit. Parfois, seule la valeur exacte convient. Apprends à faire la différence.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le bon ordre de grandeur',
          done: s1,
          content: (
            <TapQuestion
              prompt={ORDRE_Q.q}
              requires={['ordre-de-grandeur', 'arrondi']}
              options={ORDRE_Q.options}
              correct={ORDRE_Q.correct}
              cols={3}
              explain={ORDRE_Q.explain}
              solved={ordreDone}
              onAnswered={() => setOrdreDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Estimation ou valeur exacte ?',
          done: s2,
          content: (
            <div className="space-y-5">
              {/* La règle est posée AVANT le classement : sans critère,
                  classer « ≈ suffit / exact » n'est qu'une intuition. */}
              <KnowledgeBrick
                id="niveau-de-precision"
                variant="new"
                lead="Avant de trancher quatre situations, le critère qui permet de trancher."
              />
            <BatchChoiceQuestion
              requires={['niveau-de-precision']}
              intro={
                <p className="text-sm font-semibold text-slate-700">
                  Pour chaque situation, choisis : un ordre de grandeur suffit, ou il faut la valeur exacte ?
                </p>
              }
              rows={SITUATIONS.map((s) => ({
                id: s.id,
                label: s.text,
                options: ['≈ suffit', 'Exact'],
                correct: s.correct,
                correction: s.correction,
              }))}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} situations bien classées — regarde les corrections ci-dessus.{' '}
                    </>
                  )}
                  La règle : <strong>demande-toi toujours « quelle précision est nécessaire ici ? »</strong>{' '}
                  avant de décider si une estimation suffit ou si un calcul exact est indispensable.
                </Feedback>
              )}
              solved={sitDone}
              onAnswered={() => setSitDone(true)}
            />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={9}>
          <strong>La suite.</strong> Ta carte est complète. Le défi final ne te demandera rien
          d'autre que ce qui s'y trouve.
        </KnowledgeSnapshot>
      }
    />
  );
}
