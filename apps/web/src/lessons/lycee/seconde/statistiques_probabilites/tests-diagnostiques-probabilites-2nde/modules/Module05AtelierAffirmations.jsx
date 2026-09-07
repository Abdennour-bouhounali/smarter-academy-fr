import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { AFFIRMATIONS } from '../data';

/**
 * Module 5 — LABORATOIRE : trancher quatre affirmations.
 *
 * La quatrième est VRAIE, délibérément : un atelier où tout est faux
 * n'apprend qu'à répondre « faux ». Il faut que l'élève ait à distinguer
 * une inversion abusive d'un raisonnement correct sur la prévalence.
 *
 * Les erreurs ne comptent jamais comme preuve de maîtrise (stage
 * practice_lab) : la correction explique, puis on avance.
 */
export default function Module05AtelierAffirmations() {
  const [solved, setSolved] = useState(() => new Set());

  const steps = AFFIRMATIONS.map((a, i) => ({
    num: i + 1,
    title: `Affirmation ${i + 1}`,
    done: solved.has(a.id),
    content: (
      <div className="space-y-3">
        <blockquote className="rounded-xl border-l-4 border-rose-400 bg-rose-50 px-4 py-3 text-sm text-rose-900 italic">
          {a.claim}
        </blockquote>
        <TapQuestion
          prompt="Cette affirmation est-elle correcte ?"
          options={['Vrai', 'Faux']}
          correct={a.correct ? 0 : 1}
          cols={2}
          explain={`${a.verdict}. ${a.explain}`}
          explainWrong={`${a.verdict}. ${a.explain}`}
          solved={solved.has(a.id)}
          onAnswered={() => setSolved((prev) => new Set(prev).add(a.id))}
        />
      </div>
    ),
  }));

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : quatre affirmations" moduleSubtitle="Toutes ne sont pas fausses" estimatedTime="10 min"
      brief={{
        tag: 'Entraînement', title: 'Qui a raison ?', tone: 'rose',
        body: <p>Quatre phrases qu’on entend souvent à propos des tests. À chaque fois, demande-toi : <strong>sur quelle population ce pourcentage est-il calculé ?</strong> Attention, elles ne sont pas toutes fausses.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La méthode.</strong> Devant une affirmation sur un test : repérer la population de
          référence du pourcentage cité, vérifier si la question posée porte sur la même, et se souvenir que
          la <strong>prévalence</strong> change tout. Place à la mission finale.
        </KnowledgeSnapshot>
      )}
    />
  );
}
