import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareBalance from '../components/SquareBalance';
import {
  FIGURES, computeHypotenuse, roundTenth,
} from '../components/pythagoreUtils';

/**
 * Module 4 — MANIPULATION : écrire l'égalité, puis calculer.
 *
 * Activity              choisir la bonne écriture, puis calculer une hypoténuse.
 * Mathematical objective passer de l'égalité d'aires à l'écriture symbolique,
 *                       et s'en servir.
 * Student action        sélectionner l'égalité correcte, puis répondre.
 * Misconception ciblée   placer l'hypoténuse du mauvais côté de l'égalité, et
 *                       surtout OUBLIER LA RACINE — l'erreur la plus fréquente,
 *                       interceptée par `explainFor` (le classifieur du repo
 *                       la nomme déjà : isMissingSquareRoot).
 * Feedback              on renvoie à la balance du module 2.
 * Scaffolding           un cas exact (3-4-5), puis un cas non exact à arrondir.
 */
export default function Module04EcrirePuisCalculer() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const hyp2 = computeHypotenuse(5, 7);

  const steps = [
    {
      num: 1,
      title: 'Écrire l’égalité',
      subtitle: 'Le grand carré est celui de l’hypoténuse.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="theoreme-pythagore"
            variant="new"
            lead="L’égalité des aires que tu viens d’établir s’écrit, avec des lettres, en une seule ligne."
          />
          <KnowledgeBrick
            id="methode-ecrire-puis-calculer"
            variant="new"
            compact
            lead="Et voici l’ordre dans lequel on s’en sert."
          />
          <SquareBalance
            points={FIGURES.rect345}
            draggable={false}
            ariaLabel="Triangle rectangle en A et ses trois carrés"
          />
          <TapQuestion
            prompt="Le triangle ABC est rectangle en A. Quelle égalité traduit la balance ?"
            options={['$BC^{2} = AB^{2} + AC^{2}$', '$AB^{2} = BC^{2} + AC^{2}$', '$AB + AC = BC$', '$BC^{2} = AB^{2} - AC^{2}$']}
            renderOption={(o) => <MathText>{o}</MathText>}
            correctionLabel="BC² = AB² + AC²"
            correct={0}
            cols={2}
            explain="L’angle droit est en A, donc l’hypoténuse est [BC] : c’est elle qui porte le GRAND carré, seule de son côté de l’égalité. Les deux côtés de l’angle droit sont ensemble sur l’autre plateau."
            explainWrong="Repère d’abord l’hypoténuse (le côté opposé à l’angle droit) : son carré est le plus grand, il est donc seul d’un côté du signe égal."
            requires={['theoreme-pythagore', 'hypotenuse']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calculer une hypoténuse — cas exact',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              DEF est rectangle en D, avec DE = 9 cm et DF = 12 cm.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’hypoténuse EF ?"
            suffix="cm"
            expected={15}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display="15"
            width="w-24"
            explain="EF² = 9² + 12² = 81 + 144 = 225, donc EF = √225 = 15 cm."
            explainFor={(n) => (n === 225
              ? 'Tu as trouvé EF² = 225, ce qui est juste — mais la question porte sur la LONGUEUR. Il reste à prendre la racine carrée : √225 = 15.'
              : n === 21 ? 'Tu as additionné les longueurs (9 + 12 = 21). Ce sont leurs CARRÉS qui s’additionnent, pas les longueurs.' : null)}
            requires={['methode-ecrire-puis-calculer']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand la racine n’est pas exacte',
      subtitle: 'Arrondi au dixième.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              GHI est rectangle en G, avec GH = 5 cm et GI = 7 cm.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure HI, arrondi au dixième ?"
            suffix="cm"
            expected={(n) => Math.abs(n - roundTenth(hyp2)) < 0.051}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(hyp2)).replace('.', ',')}
            width="w-24"
            explain={`HI² = 5² + 7² = 25 + 49 = 74. Or 74 n’est pas un carré parfait : HI = √74 ≈ ${String(roundTenth(hyp2)).replace('.', ',')} cm. On garde la valeur exacte √74 dans les calculs, et on arrondit seulement pour répondre.`}
            explainFor={(n) => (n === 74
              ? 'C’est HI² que tu as calculé. Prends ensuite la racine carrée : √74 ≈ 8,6.'
              : n === 12 ? 'Tu as additionné 5 + 7. Ce sont les carrés qui s’additionnent.' : null)}
            requires={['methode-ecrire-puis-calculer', 'racine-carree']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Écrire, puis calculer"
      moduleSubtitle="De la balance à l’égalité, et de l’égalité au résultat"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le passage à l’écriture',
        tone: 'violet',
        body: (
          <p>
            La balance devient une égalité, et l’égalité devient un outil de calcul. Attention à la
            toute dernière étape : une longueur, ce n’est pas un carré.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 flex gap-3 items-start">
          <PenLine className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Méthode : repérer l’hypoténuse, écrire l’égalité avec son carré <strong>seul</strong>{' '}
            d’un côté, calculer, puis <strong>prendre la racine carrée</strong>.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu calcules l’hypoténuse. Et si c’est un autre côté qui
          manque ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
