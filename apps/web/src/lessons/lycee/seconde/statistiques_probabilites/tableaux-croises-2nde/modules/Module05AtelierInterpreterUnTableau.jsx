import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, crossTable } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ELEVES, CLASSES, ACTIVITES } from '../data';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT.
 *
 * Le piège central : comparer des EFFECTIFS BRUTS entre groupes de tailles
 * différentes. « 8 danseurs en 2de C contre 5 en 2de A » ne dit rien tant
 * qu'on ignore que la 2de C compte 26 élèves et la 2de A seulement 14. La
 * leçon ne calcule pas encore de fréquences (c'est la leçon suivante) : elle
 * fait constater que la comparaison brute est INSUFFISANTE, ce qui motive
 * exactement le chapitre d'après.
 */
const T = crossTable(ELEVES, 'activite', 'classe', ACTIVITES, CLASSES);

/** Un second tableau, tiré d'une enquête, avec des groupes très inégaux. */
const ENQUETE = {
  cells: { vélo: { ville: 180, campagne: 40 }, voiture: { ville: 120, campagne: 260 } },
  rowTotals: { vélo: 220, voiture: 380 },
  colTotals: { ville: 300, campagne: 300 },
  grandTotal: 600,
  rowOrder: ['vélo', 'voiture'],
  colOrder: ['ville', 'campagne'],
};

export default function Module05AtelierInterpreterUnTableau() {
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
      title: 'Le piège des effectifs bruts',
      done: a1 && a2,
      content: (
        <Situation emoji="🩰" title="La danse est-elle plus populaire en 2de C qu’en 2de A ?">
          <CrossTableView table={T} rowsTitle="Activité" colsTitle="Classe" caption="Les 60 élèves du club" />
          <TapQuestion
            prompt="Il y a 8 danseurs en 2de C et 5 en 2de A. Peut-on conclure que la danse est plus populaire en 2de C ?"
            options={[
              'Pas directement : la 2de C compte 26 élèves et la 2de A seulement 14 — il faut rapporter chaque effectif à sa classe',
              'Oui : 8 est plus grand que 5',
              'Non : la danse est plus populaire en 2de A car 5 < 8',
              'On ne peut rien dire du tout avec ce tableau',
            ]}
            correct={0} cols={1}
            explain="Comparer des effectifs bruts entre groupes de tailles différentes n’a pas de sens. 5 sur 14 est une part plus grande que 8 sur 26 : rapportée à sa classe, la danse est en réalité plus fréquente en 2de A. Le tableau contient bien l’information — encore faut-il faire la division, ce qui est l’objet de la leçon suivante."
            explainWrong="Les deux classes n’ont pas le même effectif : 14 contre 26. Un effectif brut plus grand peut correspondre à une part plus petite."
            solved={a1} onAnswered={() => setA1(true)}
          />
          {a1 && (
            <NumericQuestion
              prompt="Combien d’élèves compte la 2de A au total (toutes activités) ?"
              expected={14} suffix="élèves"
              explain="C’est l’effectif marginal de la colonne 2de A : 6 + 5 + 2 + 1 = 14. Il est indispensable pour interpréter les 5 danseurs de cette classe."
              explainFor={() => 'On lit le total de la colonne 2de A : 6 + 5 + 2 + 1 = 14 élèves.'}
              solved={a2} onAnswered={() => setA2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Une enquête sur les déplacements',
      done: b1,
      content: (
        <Situation emoji="🚲" title="600 personnes interrogées, 300 en ville et 300 à la campagne">
          <CrossTableView table={ENQUETE} rowsTitle="Mode" colsTitle="Lieu" caption="Mode de déplacement principal" />
          <TapQuestion
            prompt="Ici les deux groupes ont la MÊME taille (300 chacun). Que peut-on conclure de la comparaison 180 contre 40 ?"
            options={[
              'Le vélo est bien plus fréquent en ville : à effectifs de groupes égaux, la comparaison brute est légitime',
              'Rien : il faut toujours calculer des fréquences',
              'Le vélo est plus fréquent à la campagne',
              'Les deux modes sont équivalents',
            ]}
            correct={0} cols={1}
            explain="Quand les groupes comparés ont le même effectif, comparer les effectifs bruts revient à comparer les proportions : 180/300 contre 40/300. C’est exactement pourquoi les enquêtes cherchent souvent des groupes de tailles égales."
            explainWrong="Comparer des effectifs bruts est légitime ICI, précisément parce que les deux colonnes totalisent 300 chacune. Le problème du premier tableau venait de l’inégalité 14 contre 26."
            solved={b1} onAnswered={() => setB1(true)}
          />
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : interpréter un tableau" moduleSubtitle="Ce qu’un effectif brut ne dit pas" estimatedTime="10 min"
      brief={{
        tag: 'Atelier', title: 'Comparer, mais à quoi ?', tone: 'rose',
        body: <p>Un tableau croisé donne des effectifs. Les comparer directement n’est légitime que si les groupes ont la même taille — sinon il faut rapporter chaque effectif à son groupe. Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite est écrite.</strong> Rapporter chaque effectif à son groupe de référence, c’est
          calculer une <em>fréquence conditionnelle</em> : toute la leçon suivante.
        </KnowledgeSnapshot>
      )}
    />
  );
}
