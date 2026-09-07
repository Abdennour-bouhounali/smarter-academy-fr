import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, conditionalFrequency, formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { sportTable } from '../data';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : confronter des affirmations de
 * presse au tableau qui les fonde.
 *
 * Chaque affirmation est plausible et l'une d'elles est fausse par inversion
 * de la condition. L'élève doit d'abord dire QUEL dénominateur l'affirmation
 * suppose, puis vérifier. Les erreurs n'y comptent jamais comme preuve de
 * maîtrise (stage practice_lab).
 */
const S = sportTable();
const P_CLUB_G = conditionalFrequency(S, { axis: 'col', key: 'garçons' }, 'club sportif');
const P_CLUB_F = conditionalFrequency(S, { axis: 'col', key: 'filles' }, 'club sportif');
const P_G_CLUB = conditionalFrequency(S, { axis: 'row', key: 'club sportif' }, 'garçons');

export default function Module05AtelierDonneesReelles() {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [b1, setB1] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'L’article et le tableau',
      done: a1 && a2,
      content: (
        <Situation emoji="📰" title="« 60 % des garçons sont inscrits en club sportif »">
          <CrossTableView table={S} rowsTitle="Inscription" colsTitle="Sexe"
            caption="Enquête sur 400 lycéens" />
          <NumericQuestion
            prompt="Vérifie : parmi les 160 garçons, 96 sont en club. Quelle fréquence conditionnelle, en pourcentage ?"
            expected={60} suffix="%"
            explain={`96 ÷ 160 = 0,60 = 60 %. L’affirmation de l’article est donc exacte : sa référence est bien « les garçons ».`}
            explainFor={(n) => (n === 24
              ? '24 % serait 96 ÷ 400, la fréquence conjointe (part du total). L’article dit « des garçons » : on divise par 160.'
              : 'On divise par l’effectif de la population de référence, les garçons : 96 ÷ 160 = 60 %.')}
            solved={a1} onAnswered={() => setA1(true)}
          />
          {a1 && (
            <TapQuestion
              prompt="Un lecteur en conclut : « donc 60 % des inscrits en club sont des garçons ». A-t-il raison ?"
              options={[
                `Non : c’est l’inversion. Parmi les 180 inscrits, 96 sont des garçons, soit ${formatPercent(P_G_CLUB, 1)}`,
                'Oui, c’est la même information dite autrement',
                'Non, c’est 40 %',
                'On ne peut pas le savoir avec ce tableau',
              ]}
              correct={0} cols={1}
              explain={`Les deux phrases partagent le numérateur 96 mais pas le dénominateur : 160 garçons d’un côté, 180 inscrits de l’autre. On passe de 60 % à ${formatPercent(P_G_CLUB, 1)}.`}
              explainWrong={`« Parmi les garçons, les inscrits » divise par 160 ; « parmi les inscrits, les garçons » divise par 180. Résultats : 60 % et ${formatPercent(P_G_CLUB, 1)}.`}
              solved={a2} onAnswered={() => setA2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Comparer garçons et filles',
      done: b1,
      content: (
        <Situation emoji="⚖️" title="« Il y a plus de garçons que de filles en club »">
          <TapQuestion
            prompt="Le tableau donne 96 garçons et 84 filles en club. L’affirmation est-elle la bonne façon de comparer ?"
            options={[
              `En effectif elle est vraie, mais la comparaison utile est en PART : ${formatPercent(P_CLUB_G, 0)} des garçons contre ${formatPercent(P_CLUB_F, 0)} des filles`,
              'Oui : 96 > 84, la comparaison suffit',
              'Non : il y a en réalité plus de filles en club',
              'On ne peut rien comparer ici',
            ]}
            correct={0} cols={1}
            explain={`Les deux groupes n’ont pas la même taille : 160 garçons et 240 filles. En effectif brut, 96 > 84 ; en part, ${formatPercent(P_CLUB_G, 0)} contre ${formatPercent(P_CLUB_F, 0)} — l’écart réel est bien plus net que ne le laisse croire « 96 contre 84 ». C’est le lien direct avec l’atelier de la leçon « Tableaux croisés ».`}
            explainWrong="L’effectif brut est bien plus élevé chez les garçons, mais ils sont aussi moins nombreux au total (160 contre 240). Comparer des groupes de tailles différentes exige les fréquences conditionnelles."
            solved={b1} onAnswered={() => setB1(true)}
          />
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : données réelles" moduleSubtitle="Ce que l’article dit, ce que le tableau montre" estimatedTime="9 min"
      brief={{
        tag: 'Atelier', title: 'Quel dénominateur suppose cette phrase ?', tone: 'rose',
        body: <p>Face à une affirmation chiffrée, la première question n’est pas « est-ce vrai ? » mais « par quoi divise-t-elle ? ». Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
