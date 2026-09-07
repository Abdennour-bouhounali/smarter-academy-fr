import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ProbabilityTree from '../../../../../common/stats/ProbabilityTree';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { arbreBilles, SACS, sacTotal } from '../data';

/**
 * Module 2 — DÉCOUVERTE : les poids, et le malentendu central de la leçon.
 *
 * Au SECOND niveau, les poids sont des probabilités CONDITIONNELLES. Sur la
 * branche du sac A, le 0,5 ne veut pas dire « la moitié des tirages donnent
 * une rouge » (c'est faux : la réponse sera 0,4 au module 4) mais « la
 * moitié des tirages QUI PASSENT PAR A ». C'est le pont direct avec la leçon
 * précédente, et l'erreur que les élèves commettent le plus souvent.
 *
 * L'élève peut compter les billes : 3 rouges sur 6, le poids ne tombe pas
 * du ciel. Ce module ne calcule AUCUN chemin (M3) et n'additionne rien (M4).
 */
const TREE = arbreBilles();

export default function Module02CeQuePesentLesBranches() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'D’où viennent les nombres sur les branches ?',
      subtitle: 'Compte les billes du sac B : 2 rouges sur 8.',
      done: q1,
      content: (
        <div className="space-y-3">
          <ProbabilityTree branches={TREE} levelLabels={['sac', 'bille']} showProducts={false} />
          <NumericQuestion
            prompt={`Le sac B contient ${SACS.B.rouges} rouges et ${SACS.B.bleues} bleues. Quel poids porte la branche « rouge » partant du sac B ? (en %)`}
            expected={(n) => Math.abs(n - 25) < 0.5}
            parse={parseDec}
            display="25 %"
            suffix="%"
            requires={['arbre-structure', 'frequence', 'quotient', 'probabilite']}
            explain={`${SACS.B.rouges} ÷ ${sacTotal('B')} = 0,25. Le poids d’une branche du second niveau se lit DANS le sac où l’on est déjà.`}
            explainFor={(n) => (Math.abs(n - 20) < 0.5
              ? 'Attention : on ne compte pas les billes des deux sacs réunis. Une fois le sac B choisi, seules ses 8 billes existent.'
              : null)}
            solved={q1} onAnswered={() => setQ1(true)}
          />
          {/* Le comptage vient d'avoir lieu DANS le sac B seul, jamais sur les
              14 billes réunies : c'est exactement ce que dit une conditionnelle.
              On la nomme ici, avant que l'étape 2 ne demande de l'interpréter. */}
          {q1 && (
            <KnowledgeBrick
              id="poids-conditionnels"
              variant="new"
              lead={<>Pour trouver ce poids, tu n’as compté que les 8 billes du sac B — pas les 14 des deux sacs. Ce choix a un nom.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que le poids veut vraiment dire',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
            Sur la branche partant du sac A, le poids vaut <strong>0,5</strong>.
          </div>
          <TapQuestion
            prompt="Que signifie exactement ce 0,5 ?"
            options={[
              'Parmi les tirages qui passent par le sac A, la moitié donnent une rouge',
              'La moitié de tous les tirages donnent une rouge',
              'La moitié des billes rouges sont dans le sac A',
              'On a une chance sur deux de choisir le sac A',
            ]}
            correct={0} cols={1}
            requires={['poids-conditionnels', 'arbre-structure', 'probabilite']}
            explain="C’est une probabilité CONDITIONNELLE : P_A(rouge). Le sac A est déjà choisi — on raisonne dans l’univers restreint à ses 6 billes. La probabilité d’obtenir une rouge sur l’ensemble des tirages est un autre nombre, que tu calculeras au module 4."
            explainWrong="Le poids d’une branche du second niveau se lit toujours « sachant qu’on est arrivé jusqu’ici ». Il ne concerne pas tous les tirages, seulement ceux qui passent par ce nœud."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La somme des branches d’un nœud',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$$P_A(\\text{rouge}) + P_A(\\text{bleue}) = 1$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Depuis un nœud, les branches couvrent <strong>toutes</strong> les suites possibles : une fois le
              sac A choisi, la bille est forcément rouge ou bleue.
            </p>
          </div>
          {/* La règle sort du constat qu'on vient de faire sur le sac A :
              elle est posée AVANT la question qui demande de l'appliquer
              à un arbre étranger. */}
          <KnowledgeBrick
            id="somme-branches"
            variant="new"
            compact
            lead={<>Une fois le sac A choisi, il ne reste que rouge ou bleue : 0,5 + 0,5 = 1. Ce n’est pas un hasard de ces nombres-là.</>}
          />
          <TapQuestion
            prompt="Un arbre montre, partant d’un même nœud, deux branches de poids 0,7 et 0,2. Que peut-on dire ?"
            options={[
              'L’arbre est faux : la somme devrait valoir 1',
              'C’est normal, les poids sont indépendants',
              'Il manque forcément une troisième branche de poids 0,1',
              'Il faut multiplier 0,7 par 0,2',
            ]}
            correct={0} cols={1}
            requires={['somme-branches', 'arbre-structure', 'issue-evenement']}
            explain="0,7 + 0,2 = 0,9 ≠ 1 : ou bien un poids est erroné, ou bien une issue a été oubliée. Un arbre correct répartit toujours la totalité des cas depuis chaque nœud — c’est le premier contrôle à faire."
            explainWrong="Les branches issues d’un même nœud décrivent toutes les suites possibles : leur somme vaut nécessairement 1."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Ce que pèsent les branches" moduleSubtitle="Des conditionnelles, pas des proportions globales" estimatedTime="14 min"
      brief={{
        tag: 'Découverte', title: 'Un poids se lit « sachant qu’on est ici »', tone: 'violet',
        body: <p>Ta structure est prête. Reste à y accrocher des nombres — et à comprendre ce qu’ils disent réellement, car ce n’est pas ce qu’on croit.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Retenu.</strong> Les poids du second niveau sont des <strong>probabilités
          conditionnelles</strong>, et les branches d’un même nœud somment à 1. Module suivant : parcourir un
          chemin entier.
        </KnowledgeSnapshot>
      )}
    />
  );
}
