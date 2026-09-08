import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EnchainerLab, { ENCHAINEMENTS } from '../components/EnchainerLab';

/**
 * Module 6 — ENTRAÎNEMENT : la figure complète.
 *
 * Ici l'angle cherché n'est JAMAIS le partenaire direct de l'angle connu : il
 * faut passer par un relais. C'est la différence entre réciter une propriété
 * et s'en servir dans une figure qui ne coopère pas — et c'est exactement ce
 * qui est demandé en devoir.
 *
 * Chaque étape doit être NOMMÉE : c'est la nomination qui fait la preuve, pas
 * le nombre trouvé. Les corrections l'écrivent systématiquement en deux temps.
 *
 * Expected observation : « quand les deux angles ne forment pas un couple, on
 * passe par un troisième ».
 * Misconception targeted : appliquer « alternes-internes donc égaux » à deux
 * angles qui ne forment pas ce couple, et s'arrêter à la première relation.
 */
export default function Module06LaFigureComplete() {
  const [faits, setFaits] = useState({});
  const [q3, setQ3] = useState(false);

  const tousFaits = ENCHAINEMENTS.every((c) => faits[c.id]);

  const steps = [
    {
      num: 1,
      title: 'La méthode, quand le couple n’est pas donné',
      done: true,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="enchainer-relations"
            variant="new"
            lead={<>Dans une vraie figure, l’angle connu et l’angle cherché forment rarement un couple direct. Voici comment on s’y prend.</>}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois figures à démêler',
      subtitle: 'À chaque fois, les droites sont parallèles — mais l’angle orange n’est pas le partenaire direct du violet.',
      done: tousFaits,
      content: (
        <div className="space-y-5">
          {ENCHAINEMENTS.map((cas) => (
            <div key={cas.id} className="space-y-2">
              <EnchainerLab cas={cas} resolu={!!faits[cas.id]} />
              <NumericQuestion
                prompt={cas.question}
                expected={cas.reponse}
                suffix="°"
                requires={['enchainer-relations', 'paralleles-angles-egaux', 'calculer-les-angles']}
                explain={cas.explication}
                explainFor={(n) => (n === cas.piege ? cas.explicationPiege : null)}
                solved={!!faits[cas.id]}
                onAnswered={() => setFaits((p) => ({ ...p, [cas.id]: true }))}
              />
            </div>
          ))}
          {tousFaits && (
            <Feedback tone="ok">
              Les trois fois, le chemin passait par un <strong>angle relais</strong>. C’est le
              réflexe qui débloque presque toutes les figures : si l’angle cherché ne forme pas un
              couple avec l’angle connu, cherche celui qui forme un couple avec chacun des deux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’erreur à ne plus faire',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux droites parallèles sont coupées par une sécante. Deux angles sont INTERNES mais du MÊME côté de la sécante. L’un mesure 105°. Combien mesure l’autre ?"
            options={['75°', '105°', '52,5°', 'On ne peut pas savoir']}
            correct={0}
            cols={4}
            requires={['calculer-les-angles', 'angles-alternes-internes']}
            explain="Ces deux-là ne sont PAS alternes-internes : « alternes » exige des côtés opposés de la sécante. Du même côté, ils sont supplémentaires : 180 − 105 = 75°."
            explainWrong="105° serait la réponse s’ils étaient alternes-internes — mais ils sont du MÊME côté de la sécante. Le mot « internes » ne suffit jamais : il faut vérifier le second morceau du nom."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Vérifie <strong>toujours</strong> les deux morceaux du nom : entre les droites{' '}
              <em>et</em> de part et d’autre de la sécante. Un seul des deux ne suffit pas à
              conclure.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La figure complète"
      moduleSubtitle="Deux relations enchaînées, chacune justifiée"
      estimatedTime="10 min"
      brief={{
        tag: 'Entraînement',
        title: 'Des figures qui ne coopèrent pas',
        tone: 'indigo',
        body: (
          <p>
            Jusqu’ici, l’angle connu et l’angle cherché formaient un couple. Dans une vraie figure,
            c’est rarement le cas : il faut <strong>passer par un troisième angle</strong>, et
            nommer chaque étape.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
