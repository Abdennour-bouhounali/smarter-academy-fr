import React, { useState } from 'react';
import { RotateCcw, ListChecks } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { solveAngle, roundTenth, isPlausibleRatio } from '../components/trigoUtils';

/**
 * Module 6 — FORMALISATION : de la longueur à l'angle.
 *
 * Activity              faire le chemin inverse — connaissant deux longueurs,
 *                       retrouver l'angle.
 * Mathematical objective les touches arccos, arcsin et arctan répondent à la
 *                       question réciproque : « quel angle donne ce rapport ? »
 * Student action        calculer le rapport, puis lire l'angle.
 * Misconception ciblée   confondre sin et arcsin (utiliser la touche directe
 *                       pour remonter à l'angle) ; et accepter un sinus > 1.
 * Formalization         la méthode complète est récapitulée ici.
 */
export default function Module06ChoisirPuisResoudre() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const angle = solveAngle({ ratio: 'cos', value: 4 / 9 });

  const steps = [
    {
      num: 1,
      title: 'Le chemin inverse',
      subtitle: 'On connaît deux longueurs, on cherche l’angle.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Une échelle de <strong>9 m</strong> a son pied à <strong>4 m</strong> du mur. On
              cherche l’angle qu’elle forme avec le sol.
            </p>
          </div>
          <TapQuestion
            prompt="Quel rapport relie l’adjacent (4 m) et l’hypoténuse (9 m) ?"
            options={['Le cosinus', 'Le sinus', 'La tangente', 'Aucun des trois']}
            correct={0}
            cols={4}
            explain="Adjacent et hypoténuse : c’est la définition du cosinus. Donc cos α = 4 ÷ 9 ≈ 0,44."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Remonter à l’angle',
      subtitle: 'C’est la touche arccos (ou cos⁻¹) de la calculatrice.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <MathText>{'$\\cos \\alpha = \\dfrac{4}{9} \\approx 0{,}44$'}</MathText>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’angle α, arrondi au degré ?"
            suffix="°"
            expected={(n) => Math.abs(n - Math.round(angle)) < 1.1}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(Math.round(angle))}
            width="w-24"
            explain={`On utilise la touche arccos (souvent notée cos⁻¹) : arccos(4 ÷ 9) ≈ ${Math.round(angle)}°. Contrôle : l’angle est aigu, entre 0° et 90°, ce qui est cohérent.`}
            explainFor={(n) => {
              if (Math.abs(n - 0.44) < 0.05) return 'Tu as donné le RAPPORT (0,44), pas l’angle. Il faut appliquer la touche arccos à ce nombre pour obtenir des degrés.';
              if (Math.abs(n - Math.cos(0.44)) < 0.05) return 'Attention : tu as appliqué cos au lieu d’arccos. Pour remonter du rapport à l’angle, c’est la touche inverse.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un résultat impossible',
      done: q3,
      content: (
        <TapQuestion
          prompt="Un élève calcule un sinus et trouve 1,25. Que s’est-il passé ?"
          options={[
            'Il a inversé la fraction : le sinus ne peut pas dépasser 1',
            'C’est correct pour un angle supérieur à 45°',
            'C’est correct dans un grand triangle',
            'Il a oublié de mettre sa calculatrice en degrés',
          ]}
          correct={0}
          cols={1}
          explain="Le sinus vaut opposé ÷ hypoténuse, et l’hypoténuse est le plus grand côté : le quotient est donc toujours inférieur à 1. Un résultat supérieur signifie qu’on a mis l’hypoténuse au numérateur. Ce contrôle prend une seconde et rattrape l’erreur."
          explainWrong="Quel que soit l’angle ou la taille du triangle, l’opposé reste plus court que l’hypoténuse. Un sinus supérieur à 1 est donc toujours une erreur."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Choisir, puis résoudre"
      moduleSubtitle="Et le chemin inverse : du rapport à l’angle"
      estimatedTime="9 min"
      brief={{
        tag: 'Formalisation',
        title: 'La méthode, dans les deux sens',
        tone: 'blue',
        body: (
          <p>
            Jusqu’ici l’angle était donné et on cherchait une longueur. Voici l’inverse :{' '}
            <strong>deux longueurs connues, un angle à trouver</strong>.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <ListChecks className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">La méthode complète</p>
          </div>
          <ol className="text-sm text-blue-900 space-y-1 list-decimal pl-5">
            <li>Repérer l’angle droit et l’angle étudié.</li>
            <li>Nommer les trois côtés : opposé, adjacent, hypoténuse.</li>
            <li>Repérer ce qu’on connaît et ce qu’on cherche.</li>
            <li>En déduire le rapport : sinus, cosinus ou tangente.</li>
            <li>
              Calculer — et si c’est l’angle qu’on cherche, utiliser la touche{' '}
              <strong>inverse</strong> (arcsin, arccos, arctan).
            </li>
            <li>Vérifier la vraisemblance du résultat.</li>
          </ol>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <div className="flex gap-2 items-start">
            <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Deux sens, deux touches.</strong> Angle connu → sin, cos, tan donnent un
              rapport. Rapport connu → arcsin, arccos, arctan donnent un angle.
            </span>
          </div>
        </Feedback>
      }
    />
  );
}
