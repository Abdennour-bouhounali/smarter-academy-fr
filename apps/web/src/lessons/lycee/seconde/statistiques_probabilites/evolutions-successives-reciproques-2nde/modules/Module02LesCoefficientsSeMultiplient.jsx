import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { formatNumber, globalCoefficient } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EvolutionChain from '../components/EvolutionChain';

/**
 * Module 2 — DÉCOUVERTE : le coefficient global est le PRODUIT.
 *
 * L'élève teste la conjecture née au module 1 sur des chaînes qu'il choisit,
 * y compris à trois maillons : le composant affiche à la fois le produit des
 * coefficients et l'arrivée obtenue en cascade, et les deux coïncident
 * toujours. La règle est constatée, pas assénée.
 */
export default function Module02LesCoefficientsSeMultiplient() {
  const [rates, setRates] = useState([0.3, -0.1]);
  const [tested, setTested] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = tested.size >= 3;
  // Une chaîne à trois maillons a été essayée : la règle vaut au-delà de deux.
  const change = (r, react) => {
    setRates(r);
    const next = new Set(tested); next.add(r.map((x) => x.toFixed(2)).join(',')); setTested(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le produit tombe-t-il toujours juste ?',
      subtitle: 'Change les taux, ajoute une troisième évolution. Compare le produit affiché et l’arrivée. Trois essais.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <EvolutionChain initial={200} rates={rates} onRatesChange={(r) => change(r, kit.react)} maxSteps={3} />
          {done1 ? (
            <Feedback tone="ok">
              À chaque fois, l’arrivée vaut le départ multiplié par le <strong>produit des coefficients</strong> —
              deux maillons ou trois, hausses ou baisses mélangées. Et comme la multiplication est commutative,
              <strong> l’ordre ne change rien</strong> : c’est exactement ce que tu avais constaté au module 1.
            </Feedback>
          ) : (
            <Feedback tone="info">Chaînes essayées : {tested.size} sur 3. Essaie aussi trois évolutions.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un seul coefficient pour toute la chaîne',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Un loyer subit trois hausses : +10 %, puis +5 %, puis +2 %. Par quel nombre le loyer initial est-il multiplié au total ? (arrondi au millième)"
          above={(revealed) => (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center">
              <MathText>{'$$k_{\\text{global}} = k_1 \\times k_2 \\times k_3$$'}</MathText>
              {revealed && <p className="text-xs text-violet-700 mt-1">1,10 × 1,05 × 1,02 = 1,1781</p>}
            </div>
          )}
          expected={(n) => Math.abs(n - 1.178) < 0.0015}
          display="1,178"
          explain="1,10 × 1,05 × 1,02 = 1,1781, arrondi à 1,178. Un seul coefficient résume les trois hausses."
          explainFor={(n) => (Math.abs(n - 1.17) < 0.005
            ? 'Tu as additionné les taux : 10 + 5 + 2 = 17 %, soit 1,17. Or les coefficients se MULTIPLIENT : 1,10 × 1,05 × 1,02 = 1,178.'
            : Math.abs(n - 17) < 0.5
              ? '17 est la somme des taux en pourcentage. Le coefficient global est un produit : 1,10 × 1,05 × 1,02 ≈ 1,178.'
              : 'On multiplie les trois coefficients : 1,10 × 1,05 × 1,02 = 1,1781.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Composer une hausse et une baisse',
      done: q3,
      content: (
        <TapQuestion
          prompt="Un article subit une hausse de 50 % puis une baisse de 40 %. Quel est le coefficient global ?"
          options={['1,5 × 0,6 = 0,9', '1,5 + 0,6 = 2,1', '1,5 − 0,4 = 1,1', '0,5 × 0,4 = 0,2']}
          correct={0} cols={2}
          explain="k = 1,50 × 0,60 = 0,90 : au total, l’article a perdu 10 %, malgré une hausse « plus grande » que la baisse. Le produit tranche, pas la comparaison des taux."
          explainWrong="Les coefficients sont 1,50 (hausse de 50 %) et 0,60 (baisse de 40 %, il reste 60 %). On les multiplie : 1,50 × 0,60 = 0,90."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Les coefficients se multiplient" moduleSubtitle="Une chaîne, un seul coefficient" estimatedTime="10 min"
      brief={{
        tag: 'Découverte', title: 'k = k₁ × k₂ × …', tone: 'violet',
        body: <p>Au module 1, 1,20 × 0,80 donnait exactement 0,96. Coïncidence ou règle ? Teste-le sur des chaînes que tu choisis.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Il reste à traduire.</strong> Un coefficient global de 0,96, c’est bien — mais un journal écrira
          « le prix a baissé de … % ». Module suivant : repasser du coefficient au taux.
        </KnowledgeSnapshot>
      )}
    />
  );
}
