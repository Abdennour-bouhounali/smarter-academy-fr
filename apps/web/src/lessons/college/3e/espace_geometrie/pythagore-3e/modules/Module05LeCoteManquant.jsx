import React, { useState } from 'react';
import { Minus } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { computePythagoreanLeg, roundTenth, isCoherentLeg } from '../components/pythagoreUtils';

/**
 * Module 5 — MANIPULATION : trouver un côté de l'angle droit.
 *
 * Activity              calculer un côté quand c'est l'hypoténuse qui est
 *                       connue.
 * Mathematical objective la même égalité, lue dans l'autre sens : c'est une
 *                       SOUSTRACTION.
 * Student action        répondre numériquement.
 * Misconception ciblée   additionner par réflexe (« Pythagore, c'est + »).
 *                       `explainFor` intercepte précisément ce résultat.
 * Feedback              la vérification de cohérence — un côté de l'angle
 *                       droit est plus court que l'hypoténuse — sert de
 *                       garde-fou et est enseignée comme telle.
 */
export default function Module05LeCoteManquant() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const leg2 = computePythagoreanLeg(9, 4);

  const steps = [
    {
      num: 1,
      title: 'Additionner ou soustraire ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="calculer-un-cote-de-langle-droit"
            variant="new"
            lead="Cette fois l’hypoténuse est connue et c’est un autre côté qui manque : l’égalité ne change pas, l’inconnue change de place."
          />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              KLM est rectangle en K. L’hypoténuse [LM] mesure 13 cm, et KL mesure 5 cm.
              On cherche KM.
            </p>
          </div>
          <TapQuestion
            prompt="Quelle égalité permet de trouver KM² ?"
            options={['$KM^{2} = LM^{2} - KL^{2}$', '$KM^{2} = LM^{2} + KL^{2}$', '$KM^{2} = KL^{2} - LM^{2}$', '$KM = LM - KL$']}
            renderOption={(o) => <MathText>{o}</MathText>}
            correctionLabel="KM² = LM² − KL²"
            correct={0}
            cols={2}
            explain="L’égalité de Pythagore s’écrit LM² = KL² + KM² : le carré de l’hypoténuse est la SOMME. Pour isoler KM², on retranche KL² des deux côtés. Quand on cherche un côté de l’angle droit, on soustrait."
            explainWrong="Additionner donnerait un résultat plus grand que l’hypoténuse, ce qui est impossible : un côté de l’angle droit est toujours plus court qu’elle."
            requires={['calculer-un-cote-de-langle-droit', 'theoreme-pythagore']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le calcul',
      done: q2,
      content: (
        <NumericQuestion
          prompt="Toujours dans KLM rectangle en K, avec LM = 13 cm et KL = 5 cm : combien mesure KM ?"
          suffix="cm"
          expected={12}
          parse={(s) => Number(String(s).replace(',', '.'))}
          display="12"
          width="w-24"
          explain="KM² = 13² − 5² = 169 − 25 = 144, donc KM = √144 = 12 cm. On vérifie : 12 est bien plus petit que 13, c’est cohérent."
          explainFor={(n) => {
            if (n === 194) return 'Tu as additionné : 169 + 25 = 194. Mais l’hypoténuse est déjà connue — c’est le plus grand carré, on lui retranche l’autre.';
            if (Math.abs(n - Math.sqrt(194)) < 0.2) return 'Tu as additionné les carrés au lieu de les soustraire. KM est un côté de l’angle droit : il doit être plus COURT que 13.';
            if (n === 144) return 'Tu as trouvé KM² = 144. Il reste à prendre la racine carrée : √144 = 12.';
            if (n === 8) return 'Tu as soustrait les longueurs (13 − 5). Ce sont leurs carrés qu’il faut soustraire : 169 − 25 = 144.';
            return null;
          }}
          requires={['calculer-un-cote-de-langle-droit']}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Vérifier que le résultat a du sens',
      subtitle: 'Un réflexe qui évite bien des erreurs.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              Un élève cherche un côté de l’angle droit dans un triangle dont l’hypoténuse mesure
              9 cm. Il trouve <strong>11,4 cm</strong>.
            </p>
          </div>
          <TapQuestion
            prompt="Sans refaire son calcul, que peux-tu dire ?"
            options={[
              'Son résultat est forcément faux : un côté de l’angle droit est plus court que l’hypoténuse',
              'Son résultat est plausible, il faut refaire le calcul pour trancher',
              'C’est correct, un côté peut dépasser l’hypoténuse',
              'On ne peut rien dire sans connaître le troisième côté',
            ]}
            correct={0}
            cols={1}
            explain="L’hypoténuse est toujours le plus grand côté. Un résultat qui la dépasse signale une erreur — le plus souvent une addition à la place d’une soustraction. Ce contrôle prend deux secondes et rattrape l’erreur la plus fréquente."
            requires={['calculer-un-cote-de-langle-droit']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
            {q3 && (
              <KnowledgeBrick
                id="mem-controle-hypotenuse"
                variant="new"
                compact
                lead="Un réflexe de relecture, qui rattrape l’erreur la plus fréquente du chapitre."
              />
            )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le côté manquant"
      moduleSubtitle="La même égalité, mais on soustrait"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Quand l’hypoténuse est connue',
        tone: 'purple',
        body: (
          <p>
            Même théorème, autre inconnue. Le piège est le réflexe : « Pythagore, donc j’additionne ».
            Ici, il faut <strong>retrancher</strong>.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <Minus className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Repère d’abord si l’inconnue est l’hypoténuse (on additionne) ou un côté de l’angle
            droit (on soustrait). Puis vérifie que le résultat est plus petit que l’hypoténuse.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Les deux calculs sont à ta disposition. Reste à choisir
          lequel, et à le rédiger.
        </KnowledgeSnapshot>
      )}
    />
  );
}
