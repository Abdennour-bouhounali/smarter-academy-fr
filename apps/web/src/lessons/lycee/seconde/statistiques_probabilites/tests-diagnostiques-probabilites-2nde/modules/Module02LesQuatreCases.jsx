import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TestPopulationLab from '../components/TestPopulationLab';
import { REFERENCE, scenario } from '../data';

/**
 * Module 2 — DÉCOUVERTE : nommer les quatre cases.
 *
 * L'élève a déjà COMPTÉ ces groupes au module 1 ; ici on leur donne leur nom.
 * Le point délicat est la logique du vocabulaire : l'adjectif (vrai/faux)
 * qualifie la JUSTESSE du test, le nom (positif/négatif) son RÉSULTAT. Un
 * « faux positif » est donc un test positif qui a tort — pas une personne
 * « fausse ». C'est une lecture, pas une définition à mémoriser.
 */
const S = scenario(REFERENCE);

export default function Module02LesQuatreCases() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Comment lire les noms',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 space-y-2 text-sm text-slate-700">
            <p>Chaque nom se lit en deux morceaux :</p>
            <p>· <strong>positif / négatif</strong> = ce que le test <strong>affiche</strong> ;</p>
            <p>· <strong>vrai / faux</strong> = le test <strong>avait-il raison</strong> ?</p>
            <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
              Un <strong>faux positif</strong> est donc un test qui affiche « positif » alors que la personne
              est saine. Il n’y a rien à apprendre par cœur : il suffit de lire les deux mots.
            </div>
          </div>
          <TapQuestion
            prompt="Une personne saine dont le test est positif est…"
            options={['un faux positif', 'un vrai positif', 'un faux négatif', 'un vrai négatif']}
            correct={0} cols={2}
            explain="Le test affiche « positif » (d’où « positif ») mais il se trompe (d’où « faux ») : c’est un faux positif."
            explainWrong="Lis les deux mots séparément : le résultat affiché, puis la justesse de ce résultat."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le cas le plus grave',
      done: q2,
      content: (
        <div className="space-y-3">
          <TestPopulationLab step="test" params={REFERENCE} />
          <TapQuestion
            prompt="Une personne atteinte dont le test est négatif — donc rassurée à tort — s’appelle…"
            options={['un faux négatif', 'un faux positif', 'un vrai négatif', 'un vrai positif']}
            correct={0} cols={2}
            explain={`Le test affiche « négatif » et se trompe : c’est un faux négatif. Ici il n’y en a qu’${S.falseNegative === 1 ? 'un seul' : `${S.falseNegative}`} sur ${S.ill} personnes atteintes — mais c’est souvent le cas le plus lourd de conséquences, puisque personne n’est alerté.`}
            explainWrong="Le test dit « négatif » (nom) et il a tort (adjectif « faux ») : faux négatif."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les totaux du tableau',
      done: q3,
      content: (
        <TapQuestion
          prompt={`Dans ce tableau, que représente le total de la ligne « Test + », soit ${S.positive} personnes ?`}
          options={[
            'Toutes les personnes dont le test est positif, atteintes ou non',
            'Toutes les personnes atteintes',
            'Toutes les personnes saines',
            'Les personnes atteintes détectées par le test',
          ]}
          correct={0} cols={1}
          explain={`La ligne « Test + » réunit les ${S.truePositive} vrais positifs et les ${S.falsePositive} faux positifs : ce sont toutes les personnes à qui le test annonce un résultat positif. C’est CE groupe qui servira de population de référence au module 4.`}
          explainWrong={`Le total d’une ligne additionne ses deux cases : ${S.truePositive} + ${S.falsePositive} = ${S.positive}. Il ne s’agit ni des seuls malades, ni des seuls sains.`}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Les quatre cases du test" moduleSubtitle="Vrai, faux, positif, négatif" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Mettre des noms sur les groupes', tone: 'violet',
        body: <p>Tu as compté quatre groupes. Ils portent des noms précis — et ces noms se lisent, ils ne se récitent pas.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Retenu.</strong> <strong>VP</strong>, <strong>FP</strong>, <strong>VN</strong>,
          <strong> FN</strong> : le nom dit le résultat affiché, l’adjectif dit si le test avait raison.
          Module suivant : mesurer la qualité du test.
        </KnowledgeSnapshot>
      )}
    />
  );
}
