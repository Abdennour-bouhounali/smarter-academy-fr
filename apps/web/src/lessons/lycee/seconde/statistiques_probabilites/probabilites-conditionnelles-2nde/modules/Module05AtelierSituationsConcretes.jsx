import React, { useState } from 'react';
import { ContentModule, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATIONS } from '../data';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT (les erreurs ne comptent jamais
 * comme preuve de maîtrise, §LESSON_CONTRACT).
 *
 * Les quatre situations sont ordonnées pour faire travailler la MÊME
 * décision — quel est le dénominateur ? — dans des contextes de plus en
 * plus piégeux :
 *   s1 club sportif   : conditionnelle directe
 *   s2 usine, machine A : conditionnelle dans un contexte industriel
 *   s3 usine, défectueuse : l'INVERSE de s2, même numérateur (15), autre univers
 *   s4 ville, vélo    : composition, où le piège est d'appliquer 30 % au total
 *
 * s2 et s3 se suivent délibérément : c'est le même énoncé retourné, et la
 * comparaison des deux réponses (5 % contre 79 %) est le cœur de l'atelier.
 */
export default function Module05AtelierSituationsConcretes() {
  const [solved, setSolved] = useState(() => new Set());

  const mark = (id) => setSolved((prev) => new Set(prev).add(id));

  const steps = SITUATIONS.map((s, i) => ({
    num: i + 1,
    title: `Situation ${i + 1}`,
    done: solved.has(s.id),
    content: (
      <div className="space-y-3">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {s.context}
        </div>
        <NumericQuestion
          prompt={s.question}
          expected={(n) => Math.abs(n - s.answer * 100) < 0.6}
          // La situation 3 vaut ≈ 78,9 % : parseFr, entier seulement, la
          // rendrait impossible à valider.
          parse={parseDec}
          display={s.display}
          suffix="%"
          explain={s.explain}
          solved={solved.has(s.id)}
          onAnswered={(ok) => { if (ok) mark(s.id); }}
        />
        {s.id === 's3' && solved.has('s3') && solved.has('s2') && (
          <Feedback tone="ok">
            Compare les deux dernières réponses : <strong>5 %</strong> et <strong>79 %</strong>, pour le même
            numérateur de 15 pièces. « Défectueuse sachant A » et « de A sachant défectueuse » sont deux
            questions sans rapport — c’est l’inversion du conditionnement, en usine cette fois.
          </Feedback>
        )}
      </div>
    ),
  }));

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : situations concrètes" moduleSubtitle="Repérer la condition, choisir le dénominateur" estimatedTime="12 min"
      brief={{
        tag: 'Entraînement', title: 'Quatre énoncés, une seule question', tone: 'rose',
        body: <p>À chaque fois, demande-toi d’abord : <strong>dans quel univers suis-je en train de calculer ?</strong> Le reste n’est qu’une division.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La méthode.</strong> Lire l’énoncé, repérer la condition (« sachant », « parmi »,
          « on sait que »), écrire son effectif au dénominateur, puis compter l’intersection au numérateur.
          Place à la mission finale.
        </KnowledgeSnapshot>
      )}
    />
  );
}
