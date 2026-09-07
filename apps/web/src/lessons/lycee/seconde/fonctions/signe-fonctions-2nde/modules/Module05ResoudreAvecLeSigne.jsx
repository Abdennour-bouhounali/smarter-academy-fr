import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignProbe from '../components/SignProbe';
import SignTable from '../components/SignTable';
import { P4, Q4, P4_RANGE, solveSign, setText } from '../components/signeUtils';

/**
 * Module 5 — MANIPULATION : résoudre avec le signe.
 * P(x) = (x − 1)(x + 3) : f(x) = 0, f(x) > 0, f(x) ≤ 0 ; vérification sur la
 * courbe (bandes) ; puis Q(x) ≥ 0 avec la valeur interdite exclue.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Chacune des quatre étapes s'OUVRAIT sur une demande : « les cases + »,
 *   « ≤ ajoute les zéros », l'écriture en réunion d'intervalles n'existaient
 *   que dans les `explain`, lus après la réponse. Aucun geste ne précède ici
 *   une question — c'est un module de résolution — donc les briques sont en
 *   TÊTE d'étape, avant la demande :
 *     étape 1  brique `methode-resoudre-par-le-signe` puis P(x) = 0
 *     étape 2  brique `vocab-solutions-intervalles` puis P(x) > 0
 *     étape 3  la même écriture, bornes incluses cette fois
 *     étape 4  brique `methode-verifier-graphiquement` puis le quotient
 */
export default function Module05ResoudreAvecLeSigne() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false); const [q4, setQ4] = useState(false);
  const table = <SignTable f={P4} showFactors={false} />;
  const bands = (rel, tone) => solveSign(P4, rel).map((I) => ({ from: I.a === null ? P4_RANGE.xMin : I.a, to: I.b === null ? P4_RANGE.xMax : I.b, tone }));

  const steps = [
    {
      num: 1, title: 'P(x) = 0', done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-resoudre-par-le-signe"
            variant="new"
            lead={<>Tu sais construire un tableau ; il ne sert pas à décorer — il répond à trois questions, toujours les mêmes.</>}
          />
          <TapQuestion above={table} prompt={<span>Solutions de <MathText>{'$(x-1)(x+3) = 0$'}</MathText> ?</span>}
            options={['−3 et 1', '1 et 3', '−1 et 3', 'aucune']} correct={0} cols={4}
            requires={['methode-resoudre-par-le-signe', 'zero-fonction', 'tableau-de-signes']}
            explain="Un produit est nul quand l’un des facteurs est nul : x − 1 = 0 ou x + 3 = 0. Les solutions sont les zéros du tableau : {−3 ; 1}."
            explainWrong="Les zéros sont les 0 de la ligne du bas : x = −3 et x = 1 (x + 3 = 0 donne −3, pas 3)."
            solved={q1} onAnswered={() => setQ1(true)} />
        </div>
      ),
    },
    {
      num: 2, title: 'P(x) > 0', done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="vocab-solutions-intervalles"
            variant="new"
            lead={<>Une case + du tableau, ce n’est pas un nombre : c’est tout un morceau de l’axe. Voilà comment on l’écrit.</>}
          />
          <TapQuestion above={(revealed) => (revealed ? <SignProbe f={P4} range={P4_RANGE} unit={40} unitY={26} xStep={1} yStep={1} value={0} paintAll showZeros="all" frozen highlightIntervals={bands('>', 'emerald')} /> : table)}
            prompt={<span>Solutions de <MathText>{'$(x-1)(x+3) > 0$'}</MathText> ?</span>}
            options={[']−∞ ; −3[ ∪ ]1 ; +∞[', ']−3 ; 1[', '[−3 ; 1]', ']1 ; +∞[']} correct={0} cols={2}
            requires={['methode-resoudre-par-le-signe', 'vocab-solutions-intervalles', 'methode-lire-tableau', 'intervalle-crochets']}
            explain="On lit les cases + : avant −3 et après 1. Bornes exclues (> strict). Sur la courbe : les bandes vertes, là où elle est au-dessus de l’axe."
            explainWrong="Les cases + du tableau sont ]−∞ ; −3[ et ]1 ; +∞[ : deux morceaux, réunis par ∪. Entre −3 et 1, la case est − : la courbe est en dessous."
            solved={q2} onAnswered={() => setQ2(true)} />
        </div>
      ),
    },
    {
      num: 3, title: 'P(x) ≤ 0', done: q3,
      content: (
        <TapQuestion above={(revealed) => (revealed ? <SignProbe f={P4} range={P4_RANGE} unit={40} unitY={26} xStep={1} yStep={1} value={0} paintAll showZeros="all" frozen highlightIntervals={bands('<=', 'rose')} /> : table)}
          prompt={<span>Solutions de <MathText>{'$(x-1)(x+3) \\le 0$'}</MathText> ?</span>}
          options={['[−3 ; 1]', ']−3 ; 1[', ']−∞ ; −3] ∪ [1 ; +∞[', '{−3 ; 1}']} correct={0} cols={2}
          requires={['methode-resoudre-par-le-signe', 'vocab-solutions-intervalles', 'zero-fonction', 'intervalle-crochets']}
          explain="≤ 0 : les cases − ET les zéros. La case − est ]−3 ; 1[, les zéros −3 et 1 s’ajoutent : crochets fermés, [−3 ; 1]."
          explainWrong="« Inférieur ou égal » inclut les zéros : la case − donne ]−3 ; 1[, et les deux 0 ferment les crochets : [−3 ; 1]."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Avec une valeur interdite', done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-verifier-graphiquement"
            variant="new"
            lead={<>Les bandes vertes et roses des deux étapes précédentes : c’est la vérification, et elle vaut aussi pour un quotient.</>}
          />
          <BatchChoiceQuestion intro={<div className="space-y-2"><p className="text-sm text-slate-700"><MathText>{'$Q(x) = \\dfrac{x+2}{x-1}$'}</MathText> (module 4) :</p><SignTable f={Q4} showFactors={false} /></div>}
            rows={[
              { id: 'r1', label: 'Q(x) = 0', options: ['x = −2', 'x = 1', 'x = −2 ou x = 1'], correct: 0, correction: '1 est interdit' },
              { id: 'r2', label: 'Q(x) ≥ 0', options: [']−∞ ; −2] ∪ ]1 ; +∞[', ']−∞ ; −2] ∪ [1 ; +∞[', '[−2 ; 1]'], correct: 0, correction: '1 jamais inclus' },
              { id: 'r3', label: 'Q(x) < 0', options: [']−2 ; 1[', '[−2 ; 1]', ']−∞ ; −2['], correct: 0, correction: 'la case −' },
              { id: 'r4', label: 'Sur la courbe, Q(x) < 0 se voit…', options: ['là où la courbe est sous l’axe, entre −2 et 1', 'à gauche de l’axe des ordonnées', 'là où la courbe descend'], correct: 0, correction: 'signe = position' },
            ]}
            requires={['methode-resoudre-par-le-signe', 'methode-verifier-graphiquement', 'vocab-solutions-intervalles', 'regle-signe-quotient']}
            feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Avec ≥ ou ≤ on inclut les zéros, jamais une valeur interdite : {setText(solveSign(Q4, '>='))}.</Feedback>}
            solved={q4} onAnswered={() => setQ4(true)} />
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Résoudre avec le signe" moduleSubtitle="Lire le tableau, écrire les solutions, vérifier sur la courbe" estimatedTime="11 min"
      brief={{ tag: 'Manipulation', title: 'Le tableau répond', tone: 'cyan', body: <p>f(x) = 0 : les zéros. f(x) &gt; 0 : les cases +. f(x) ≤ 0 : les cases − et les zéros. Les solutions s’écrivent en intervalles, et la courbe permet de vérifier.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5}>Module suivant : des situations où le signe répond à une vraie question — gel, bénéfice, un quotient à trancher.</KnowledgeSnapshot>} />
  );
}
