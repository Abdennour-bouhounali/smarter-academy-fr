import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 4 — for et while.
 *
 * Le partage se fait sur UNE question : sait-on combien de tours ? Le for est
 * introduit par le compte des affichages de range(5) (0..4 : l'élève voit que
 * la borne est exclue), le while par un seuil qu'on ne sait pas atteindre à
 * l'avance (capital * 1,1 jusqu'à 150 → 5 ans, vérifié à l'interpréteur).
 */
const FOR_SRC = `for i in range(5):
    print(i)`;

const WHILE_SRC = `capital = 100
annees = 0
while capital < 150:
    capital = capital * 1.1
    annees = annees + 1
print(annees)`;

export default function Module04RepeterSansRecopier() {
  const [ranFor, setRanFor] = useState(false);
  const [q1, setQ1] = useState(false);
  const [ranWhile, setRanWhile] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Cinq tours, mais lesquels ?',
      subtitle: 'Exécute. Puis compte : quel est le premier nombre affiché, quel est le dernier ?',
      done: ranFor && q1,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={FOR_SRC}
            label="La boucle for"
            onRun={({ output }) => { if (output.length && !ranFor) setRanFor(true); }}
          />
          {ranFor && (
            <>
              <Feedback tone="info">
                Cinq lignes affichées : <span className="font-mono">0 1 2 3 4</span>. La boucle a bien
                tourné 5 fois — mais elle a commencé à <strong>0</strong> et s’est arrêtée <strong>avant</strong> 5.
              </Feedback>
              <KnowledgeBrick
                id="boucle-for"
                variant="new"
                lead={<>Voilà la règle exacte de ce que tu viens de compter.</>}
              />
              <NumericQuestion
                prompt={<span>Combien de lignes affiche <span className="font-mono">for i in range(1, 5)</span> ?</span>}
                answer={4}
                requires={['boucle-for']}
                explain="De 1 à 4 : la borne de gauche est incluse, celle de droite est exclue. 5 − 1 = 4 tours."
                explainWrong="Compte les valeurs prises par i : 1, 2, 3, 4. La valeur 5 n’est jamais atteinte."
                solved={q1} onAnswered={() => setQ1(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand on ne sait pas combien',
      subtitle: '100 € placés à 10 % par an. Combien d’années pour dépasser 150 € ? Exécute pour le savoir.',
      done: ranWhile,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={WHILE_SRC}
            label="La boucle while"
            onRun={({ output }) => { if (output.length && !ranWhile) { setRanWhile(true); kit.react?.(true); } }}
          />
          {ranWhile && (
            <>
              <Feedback tone="ok">
                <strong>5 ans.</strong> Personne ne pouvait l’écrire dans un <span className="font-mono">range</span> :
                le nombre de tours n’était pas connu avant de les faire. C’est exactement le cas où
                l’on utilise <span className="font-mono">while</span>.
              </Feedback>
              <KnowledgeBrick id="boucle-while" variant="new" />
              <KnowledgeBrick
                id="regle-condition-arret"
                variant="new"
                lead={<>Et la condition à surveiller pour que ça s’arrête un jour.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La boucle qui ne s’arrête jamais',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Dans <span className="font-mono">n = 1</span> puis <span className="font-mono">while n {'<'} 100:</span> avec pour seul corps <span className="font-mono">print(n)</span>, que se passe-t-il ?</span>}
            options={[
              'La boucle tourne sans fin : rien ne fait grandir n',
              'Elle affiche 1 puis s’arrête',
              'Elle affiche les entiers de 1 à 99',
              'Python refuse le programme',
            ]}
            correct={0} cols={1}
            requires={['boucle-while', 'regle-condition-arret']}
            explain="n vaut 1 au premier test, et rien dans le corps ne le modifie : la condition n < 100 reste vraie pour toujours. Il manque une ligne comme n = n * 2."
            explainWrong="Relis le corps de la boucle : il affiche n, mais ne le change jamais. Une condition qui ne peut pas devenir fausse ne s’arrête pas."
            solved={q3} onAnswered={() => setQ3(true)}
          />
          <KnowledgeBrick
            id="mem-for-ou-while"
            variant="new"
            lead={<>Le partage tient en une seule question.</>}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'for ou while ?',
      done: q4,
      content: () => (
        <TapQuestion
          prompt="Pour afficher les dix premiers multiples de 7, quelle boucle choisis-tu ?"
          options={[
            'for, car on sait qu’il y a 10 tours',
            'while, car le résultat grandit',
            'for, car chaque ligne est un produit',
            'Ni l’une ni l’autre : dix print suffisent',
          ]}
          correct={0} cols={1}
          requires={['mem-for-ou-while', 'boucle-for']}
          explain="Le nombre de tours est connu d’avance — dix — donc for. Le fait qu’une multiplication soit en jeu ne change rien au choix de la boucle."
          explainWrong="La question à se poser n’est pas « qu’est-ce que je calcule ? » mais « est-ce que je connais le nombre de tours avant de commencer ? ». Ici : oui, dix."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Répéter sans recopier"
      moduleSubtitle="for quand on sait combien, while quand on attend"
      estimatedTime="12 min"
      brief={{
        tag: '🔁 Mission 04',
        title: 'Dix lignes identiques, ou trois lignes qui tournent dix fois.',
        tone: 'amber',
        body: <p>Deux boucles, et une seule question pour choisir entre elles : sais-tu combien de tours il faut ?</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          Tu sais écrire les quatre structures. Il reste le geste du programmeur :
          prévoir, compléter, réparer.
        </KnowledgeSnapshot>
      )}
    />
  );
}
