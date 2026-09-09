import React, { useState } from 'react';
import { Minus } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import { coteAngleDroit, hypotenuse, fr, arrondi } from '../components/pythagore4e';

/**
 * Module 5 — MANIPULATION : le côté manquant, par soustraction.
 *
 * Activity              retrouver un côté de l'angle droit, connaissant
 *                       l'hypoténuse et l'autre côté.
 * Mathematical objective la même égalité se lit dans l'autre sens : le carré
 *                       cherché est la DIFFÉRENCE des deux autres.
 * Student action        identifier l'hypoténuse, écrire, calculer.
 * Misconception targeted additionner au lieu de soustraire ; et prendre pour
 *                       hypoténuse un côté qui n'en est pas un (la figure est
 *                       décrite « de travers » exprès).
 * Formalization         le contrôle « l'hypoténuse est le plus grand côté »
 *                       est posé en brique : c'est le garde-fou du calcul.
 */
export default function Module05LeCoteManquant() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const c = coteAngleDroit(13, 5);

  const steps = [
    {
      num: 1,
      title: 'Repère l’hypoténuse',
      subtitle: 'Un triangle rectangle en B. On connaît AC = 13 cm et AB = 5 cm.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 text-sm text-slate-700">
            <p>
              Le triangle ABC est rectangle <strong>en B</strong>. Les côtés de l’angle droit
              partent donc de B : ce sont [BA] et [BC].
            </p>
          </div>
          <TapQuestion
            prompt="Quel côté est l’hypoténuse de ce triangle ?"
            options={['[AC]', '[AB]', '[BC]', 'Le plus court des trois']}
            correct={0}
            cols={2}
            requires={['hypotenuse']}
            explain="L’hypoténuse est le côté OPPOSÉ à l’angle droit. L’angle droit est en B, donc l’hypoténuse est le côté qui ne touche pas B : c’est [AC], et il mesure 13 cm."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris l’égalité',
      done: q2,
      content: (
        <TapQuestion
          prompt="Quelle égalité le théorème donne-t-il ici ?"
          options={[
            'AB² + BC² = AC²',
            'AB² + AC² = BC²',
            'AB + BC = AC',
            'AC² + BC² = AB²',
          ]}
          correct={0}
          cols={1}
          requires={['theoreme-pythagore', 'hypotenuse']}
          explain="Les deux côtés de l’angle droit sont à gauche, l’hypoténuse à droite. Comme l’angle droit est en B, c’est AB² + BC² = AC²."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Cette fois, on soustrait',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-3.5 text-center font-mono text-sm">
            <div className="text-slate-600">5² + BC² = 13²</div>
            <div className="text-slate-600">25 + BC² = 169</div>
            <div className="mt-1 font-black text-purple-900">BC² = 169 − 25 = {c.carre}</div>
          </div>
          <NumericQuestion
            prompt="Combien mesure BC, en centimètres ?"
            expected={c.valeur}
            parse={parseDec}
            suffix="cm"
            requires={['methode-calculer']}
            explain={`BC² = ${c.carre}, donc BC = ${c.valeur} cm (car ${c.valeur} × ${c.valeur} = ${c.carre}).`}
            explainFor={(n) => {
              if (n === c.carre) return `${c.carre}, c’est BC², pas BC. Il reste à extraire la racine carrée.`;
              if (n === 18) return 'Tu as additionné 13 + 5. Ici l’inconnue est un côté de l’angle droit : on SOUSTRAIT les carrés.';
              if (n === hypotenuse(13, 5).valeur || (typeof n === 'number' && Math.abs(n - Math.sqrt(194)) < 0.1)) {
                return 'Tu as additionné les carrés (169 + 25). Mais 13 est l’hypoténuse : elle est déjà le plus grand côté, on ne peut que soustraire.';
              }
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le contrôle qui sauve',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un élève trouve une hypoténuse de 6 cm dans un triangle dont un côté mesure 8 cm. Que peut-on dire ?"
            options={[
              'Il s’est trompé : l’hypoténuse est toujours le plus grand côté',
              'C’est possible si le triangle est petit',
              'C’est possible si l’angle droit est bien placé',
              'On ne peut pas savoir',
            ]}
            correct={0}
            cols={1}
            requires={['hypotenuse', 'methode-calculer']}
            explain="L’hypoténuse est opposée à l’angle droit, le plus grand angle du triangle : elle est donc forcément le plus grand côté. Annoncer 6 alors qu’un autre côté mesure 8 signale une addition faite à la place d’une soustraction."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="controle-hypotenuse"
              variant="new"
              lead="Un réflexe qui rattrape la plupart des erreurs de calcul."
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
      moduleSubtitle="Même théorème, mais on soustrait"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Cette fois, l’inconnue a changé de place',
        tone: 'indigo',
        body: (
          <>
            On connaît l’hypoténuse et un côté de l’angle droit. L’égalité est la même —
            <strong> le calcul, non</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Minus className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Avant de calculer, repère TOUJOURS l’hypoténuse : c’est elle qui décide si tu vas
            additionner ou soustraire.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
