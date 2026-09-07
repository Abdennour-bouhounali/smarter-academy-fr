import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import ProbabilityTree from '../../../../../common/stats/ProbabilityTree';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATIONS } from '../data';

/**
 * Module 5 — LABORATOIRE : trois situations sans billes, pour que la
 * méthode se détache de son contexte d'origine (LP9, LP10).
 *
 * Les trois sont choisies pour que le résultat CONTREDISE une intuition
 * différente à chaque fois :
 *   météo  → 19 %, ni 40 % ni la moyenne de 40 et 10 ;
 *   usine  → 2,6 %, tiré vers 2 % parce que la chaîne 1 domine ;
 *   quiz   → 77,5 %, tiré vers 90 % pour la même raison.
 *
 * L'arbre est fourni ici (l'élève sait déjà le construire) : le travail
 * porte sur la LECTURE et le calcul, pas sur la structure.
 */
export default function Module05AtelierDeLArbreALaPhrase() {
  const [solved, setSolved] = useState(() => new Set());

  const steps = SITUATIONS.map((s, i) => ({
    num: i + 1,
    title: s.title,
    done: solved.has(s.id),
    content: (
      <div className="space-y-3">
        <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {s.context}
        </div>
        <ProbabilityTree branches={s.tree} asPercent />
        {/* Les billes ont disparu, mais pas le geste : sur la PREMIÈRE
            situation, on énonce la marche à suivre juste avant de la
            demander — ensuite l'élève la refait seul sur les deux autres. */}
        {i === 0 && (
          <KnowledgeBrick
            id="methode-situation-arbre"
            variant="new"
            compact
            lead={<>Plus de sacs ni de billes — et pourtant l’arbre est là, avec les mêmes deux étages. Voilà ce qui se transporte d’une situation à l’autre.</>}
          />
        )}
        <NumericQuestion
          prompt={s.question}
          expected={(n) => Math.abs(n - s.answer * 100) < 0.3}
          parse={parseDec}
          display={s.display}
          suffix="%"
          requires={['methode-situation-arbre', 'produit-chemin', 'somme-chemins', 'poids-conditionnels', 'arbre-structure']}
          explain={s.explain}
          solved={solved.has(s.id)}
          onAnswered={() => setSolved((prev) => new Set(prev).add(s.id))}
        />
      </div>
    ),
  }));

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : de l’arbre à la phrase" moduleSubtitle="Trois situations, aucune bille" estimatedTime="10 min"
      brief={{
        tag: 'Entraînement', title: 'La même méthode, ailleurs', tone: 'rose',
        body: <p>Météo, usine, révisions : trois contextes différents, un seul réflexe — repérer les chemins qui réalisent l’événement, multiplier le long de chacun, puis additionner.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La méthode.</strong> Identifier les deux étapes, écrire les poids du second niveau comme des
          conditionnelles, repérer les chemins qui réalisent l’événement, multiplier puis additionner.
          Place à la mission finale.
        </KnowledgeSnapshot>
      )}
    />
  );
}
