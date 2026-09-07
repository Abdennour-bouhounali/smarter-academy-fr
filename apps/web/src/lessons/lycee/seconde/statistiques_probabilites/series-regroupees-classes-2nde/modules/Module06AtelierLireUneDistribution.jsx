import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Histogram, groupIntoClasses } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SALAIRES } from '../data';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT. Lire des distributions qu'on n'a
 * pas construites : une forme à interpréter, un piège d'amplitudes inégales,
 * une lecture de cumul. Les erreurs n'y comptent jamais comme preuve de
 * maîtrise (stage practice_lab).
 */
const expand = (bornes, effectifs) => groupIntoClasses(
  effectifs.flatMap((n, i) => {
    const c = (bornes[i] + bornes[i + 1]) / 2;
    return Array.from({ length: n }, () => c);
  }),
  bornes,
);
const SAL = expand(SALAIRES.bornes, SALAIRES.effectifs);
const TAILLES = expand([150, 160, 170, 180, 190], [12, 47, 63, 18]);

export default function Module06AtelierLireUneDistribution() {
  const [a1, setA1] = useState(false);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [c1, setC1] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Des tailles d’élèves',
      done: a1,
      content: (
        <Situation emoji="📏" title="140 élèves, taille en cm, classes de 10 cm">
          <Histogram classes={TAILLES} useDensity={false} unit="cm" barLabel="effectif" />
          <TapQuestion
            prompt="Quelle est la classe modale (la plus peuplée), et que vaut la fréquence des élèves mesurant moins de 170 cm ?"
            options={[
              '[170 ; 180[ ; et 59 / 140 ≈ 42 % mesurent moins de 170 cm',
              '[170 ; 180[ ; et 63 / 140 ≈ 45 % mesurent moins de 170 cm',
              '[160 ; 170[ ; et 42 % mesurent moins de 170 cm',
              '[180 ; 190] ; et 13 % mesurent moins de 170 cm',
            ]}
            correct={0} cols={1}
            requires={['lire-histogramme', 'frequences-cumulees', 'effectif']}
            explain="La classe la plus haute est [170 ; 180[ avec 63 élèves. « Moins de 170 cm » cumule les deux premières classes : 12 + 47 = 59, soit 59/140 ≈ 42 %."
            explainWrong="63 est l’effectif de la classe modale elle-même, pas le cumul en dessous de 170. Il faut additionner 12 et 47, soit 59 élèves sur 140 ≈ 42 %."
            solved={a1} onAnswered={() => setA1(true)}
          />
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Le piège des salaires',
      done: b1 && b2,
      content: (
        <Situation emoji="💶" title="90 salariés — attention, la dernière classe est 4 fois plus large">
          <Histogram classes={SAL} useDensity unit="k€" barLabel="effectif" />
          <TapQuestion
            prompt="Un lecteur pressé conclut : « la barre de [4 ; 8] est la plus basse, donc l’écart avec [3 ; 4[ est énorme ». Que lui répondre ?"
            options={[
              'Sa barre est basse parce qu’elle est LARGE : 16 salariés contre 22, l’écart est faible',
              'Il a raison : la hauteur donne directement l’effectif',
              'Il a tort : [4 ; 8] est en réalité la classe la plus nombreuse',
              'On ne peut rien dire sans connaître les fréquences',
            ]}
            correct={0} cols={1}
            requires={['histogramme-aire', 'vocab-classe-amplitude', 'effectif']}
            explain="Sur des amplitudes inégales, la hauteur est une densité (effectif ÷ amplitude) : [4 ; 8] a une hauteur de 4 et pourtant 16 salariés, tandis que [3 ; 4[ a une hauteur de 22 pour 22 salariés. Comparer les hauteurs ne compare pas les effectifs — il faut lire le tableau ou comparer les AIRES."
            explainWrong="La hauteur d’une barre d’histogramme n’est l’effectif que si toutes les classes ont la même amplitude. Ici la dernière est 4 fois plus large : sa hauteur est divisée par 4."
            solved={b1} onAnswered={() => setB1(true)}
          />
          {b1 && (
            <NumericQuestion
              prompt="Effectifs : 18, 34, 22 et 16. Combien de salariés gagnent moins de 3 000 € ?"
              expected={52} suffix="salariés"
              requires={['frequences-cumulees', 'histogramme-aire']}
              explain="18 + 34 = 52 salariés sur 90, soit environ 58 %."
              explainFor={(n) => (n === 34
                ? '34 est l’effectif de la seule classe [2 ; 3[. « Moins de 3 » inclut aussi [1 ; 2[ : 18 + 34 = 52.'
                : 'On cumule les classes situées avant 3 : 18 + 34 = 52 salariés.')}
              solved={b2} onAnswered={() => setB2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’on ne peut pas dire',
      done: c1,
      content: (
        <Situation emoji="⚠️" title="Lire honnêtement une série regroupée">
          {/* Les deux situations précédentes viennent de faire toucher du
              doigt ce qui reste exact (le cumul) et ce qui a été perdu
              (le détail) : la règle générale se pose ici, avant de trancher
              entre quatre affirmations. */}
          <KnowledgeBrick
            id="lire-honnetement"
            variant="new"
            compact
            lead={<>Les tailles et les salaires viennent de te montrer ce qu’un tableau regroupé garde, et ce qu’il a perdu.</>}
          />
          <TapQuestion
            prompt="À partir du seul histogramme des salaires, laquelle de ces affirmations est LÉGITIME ?"
            options={[
              '« Environ 58 % des salariés gagnent moins de 3 000 € »',
              '« Le salaire le plus fréquent est exactement 2 500 € »',
              '« Le salaire médian vaut exactement 2 470 € »',
              '« Aucun salarié ne gagne 3 000 € »',
            ]}
            correct={0} cols={1}
            requires={['lire-honnetement', 'frequences-cumulees', 'mediane-stat']}
            explain="Un cumul de classes est une lecture exacte : 52 salariés sur 90 ≈ 58 %. En revanche le regroupement ne permet ni de désigner une valeur exacte comme la plus fréquente, ni d’annoncer une médiane au dixième près (elle serait estimée), ni de nier l’existence d’une valeur particulière."
            explainWrong="Tout ce qui descend EN DESSOUS de la classe — valeur la plus fréquente, médiane exacte, présence d’une valeur donnée — est perdu par le regroupement. Seuls les effectifs par tranche et leurs cumuls sont exacts."
            solved={c1} onAnswered={() => setC1(true)}
          />
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : lire une distribution" moduleSubtitle="Trois histogrammes, trois lectures" estimatedTime="10 min"
      brief={{
        tag: 'Atelier', title: 'Lire sans se faire piéger', tone: 'rose',
        body: <p>Face à un histogramme qu’on n’a pas construit : vérifier d’abord les amplitudes, puis lire les effectifs, puis se demander ce que le graphique ne dit PAS. Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
