import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointPlacer from '../components/PointPlacer';
import { formatAbscissa, formatCoords, parseSigned, samePoint } from '../components/reperageUtils';

/**
 * Module 6 — LABORATOIRE : la graduation ne vaut plus 1.
 *
 * Tout ce qui précède se lisait sur un repère de pas 1, où compter les
 * graduations et lire les coordonnées revenaient au même. C'est précisément ce
 * qui entretient l'erreur M3 : l'élève croit compter des cases alors qu'il
 * doit lire une échelle.
 *
 * Ici le pas vaut 0,5 : le nombre de graduations et la valeur cessent de
 * coïncider, et la méthode « regarder ce que vaut UNE graduation » devient
 * nécessaire, pas décorative.
 *
 * NOTE DE SAISIE — les réponses sont DÉCIMALES et SIGNÉES. `parseFr` du kit
 * est entier seulement, et `parseDec` refuse le moins typographique U+2212
 * que la leçon affiche. Chaque NumericQuestion passe donc `parse={parseSigned}`
 * et `display={formatAbscissa(...)}` : un élève qui recopie ce qu'il voit à
 * l'écran doit être compris.
 */
const PETIT = { xMin: -3, xMax: 3, yMin: -2, yMax: 2 };
const CIBLE = { x: 1.5, y: -1.5 };

export default function Module06LePlanDuDomaine() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [p, setP] = useState({ x: 0, y: 0 });
  const [pose, setPose] = useState(false);

  const bouger = (next, react) => {
    setP(next);
    if (samePoint(next, CIBLE) && !pose) { setPose(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Combien vaut une graduation ?',
      subtitle: 'Regarde les nombres écrits sur l’axe avant de lire quoi que ce soit.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 text-sm text-slate-700">
            Sur ce plan du domaine, les repères ne sont plus espacés d’une unité. Entre{' '}
            <strong>0</strong> et <strong>1</strong>, compte les graduations.
          </div>
          <KnowledgeBrick
            id="echelle-graduation"
            variant="new"
            lead={<>Avant de lire un point, il faut savoir ce que vaut une graduation — voici comment on le trouve.</>}
          />
          <NumericQuestion
            prompt="Que vaut UNE graduation sur ce repère ?"
            above={
              <PointPlacer
                point={{ x: 1, y: 1 }}
                domaine={PETIT}
                step={0.5}
                disabled
                ariaLabel="Repère au pas de 0,5 — observe les graduations"
              />
            }
            expected={0.5}
            parse={parseSigned}
            display={formatAbscissa(0.5)}
            requires={['abscisse', 'calcul-numerique']}
            explainFor={(n) =>
              n === 1
                ? 'Une graduation ne vaut pas toujours 1 : ici, il en faut DEUX pour aller de 0 à 1. Chacune vaut donc 0,5.'
                : n === 2
                ? 'C’est le NOMBRE de graduations entre 0 et 1, pas leur valeur. Chacune vaut 1 ÷ 2 = 0,5.'
                : null
            }
            explain="De 0 à 1, il y a deux graduations : chacune vaut donc 1 ÷ 2 = 0,5."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire avec la bonne échelle',
      done: q2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Quelle est l’abscisse du point violet ?"
            above={
              <PointPlacer
                point={{ x: -2.5, y: 1 }}
                domaine={PETIT}
                step={0.5}
                disabled
                ariaLabel="Repère au pas de 0,5 — lis l’abscisse du point"
              />
            }
            expected={-2.5}
            parse={parseSigned}
            display={formatAbscissa(-2.5)}
            requires={['echelle-graduation', 'lire-un-point']}
            explainFor={(n) =>
              n === -5
                ? 'Tu as compté les graduations (cinq vers la gauche) sans les convertir : cinq graduations de 0,5 font −2,5.'
                : n === 2.5
                ? 'La valeur est bonne, mais le point est à GAUCHE de l’origine : son abscisse est négative.'
                : null
            }
            explain="Cinq graduations vers la gauche, chacune valant 0,5 : l’abscisse est −2,5."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: `Place le point ${formatCoords(CIBLE)}`,
      subtitle: 'Les deux coordonnées tombent entre deux nombres entiers.',
      done: pose,
      content: (kit) => (
        <div className="space-y-3">
          <PointPlacer
            point={p}
            onPoint={(next) => bouger(next, kit.react)}
            target={CIBLE}
            domaine={PETIT}
            step={0.5}
            showQuadrantBadge
            ariaLabel={`Place le point ${formatCoords(CIBLE)} sur un repère au pas de 0,5`}
          />
          {pose ? (
            <Feedback tone="ok">
              Placé. Trois graduations vers la droite pour <strong>1,5</strong>, trois vers le bas
              pour <strong>−1,5</strong> : la méthode n’a pas changé, seule l’échelle a changé.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pars de l’origine : <strong>1,5</strong> vers la droite, puis <strong>1,5</strong>{' '}
              vers le bas. Chaque graduation vaut 0,5.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le plan du domaine"
      moduleSubtitle="Quand une graduation ne vaut plus 1"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Compter des graduations ne suffit pas',
        tone: 'amber',
        body: (
          <p>
            Jusqu’ici, une graduation valait toujours 1 — compter et lire revenaient au même. Sur
            ce plan, elles valent <strong>0,5</strong>. Il faut donc commencer par{' '}
            <strong>lire l’échelle</strong>, avant de lire le moindre point.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
