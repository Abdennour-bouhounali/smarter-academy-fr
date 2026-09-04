import React, { useState } from 'react';
import { Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import {
  RANGE, FIGURES, equalVectors, translatePoint, translatePolygon, formatVec, describeVec,
} from '../components/vectorUtils';

/**
 * Module 3 — DÉCOUVERTE : toute la figure suit le même déplacement.
 *
 * Activity              translater une figure entière.
 * Mathematical objective l'image d'une figure par une translation est
 *                       superposable à la figure de départ.
 * Student action        régler le déplacement à appliquer.
 * Controlled variable   les deux composantes.
 * Mathematical state    la figure et son image, calculée sommet par sommet.
 * Visual consequence    la figure verte garde exactement la même forme.
 * Expected observation  « la figure ne tourne pas, ne grandit pas : elle glisse ».
 * Misconception ciblée   croire qu'une translation peut faire tourner la figure,
 *                       et croire qu'il faut translater chaque sommet
 *                       différemment. L'étape 2 le teste explicitement.
 * Formalization         vocabulaire « image de A par la translation ».
 */
const CIBLE = { dx: 5, dy: 3 };

export default function Module03ToutBouge() {
  const [v, setV] = useState({ dx: 1, dy: 0 });
  const done1 = equalVectors(v, CIBLE);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const A = FIGURES.drone[0];
  const imageA = translatePoint(A, CIBLE);

  const steps = [
    {
      num: 1,
      title: 'Faire glisser le drone entier',
      subtitle: `Applique le déplacement ${formatVec(CIBLE)} à toute la figure.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Chaque sommet reçoit <strong>le même</strong> déplacement. Regarde la forme verte :
            elle ne tourne pas et ne change pas de taille.
          </p>
          <VectorLab
            origin={A}
            vector={v}
            onVectorChange={(nv) => {
              setV(nv);
              if (equalVectors(nv, CIBLE)) kit.react(true);
            }}
            mode="build"
            range={RANGE}
            figure={FIGURES.drone}
            disabled={done1}
            ariaLabel="Translate le triangle en réglant le déplacement"
          />
          {done1 ? (
            <Feedback tone="ok">
              La figure verte est <strong>superposable</strong> à la bleue : mêmes longueurs, mêmes
              angles, même orientation. Une translation fait glisser sans déformer ni tourner.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Déplacement actuel : {describeVec(v)}. Visé : {describeVec(CIBLE)}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qu’une translation conserve',
      done: q2,
      content: (
        <TapQuestion
          prompt="Quand on translate une figure, qu’est-ce qui change ?"
          options={[
            'Uniquement sa position : les longueurs, les angles et l’orientation restent identiques.',
            'Sa position et sa taille.',
            'Sa position et son orientation : elle tourne un peu.',
            'Seulement la longueur de ses côtés.',
          ]}
          correct={0}
          cols={1}
          explain="La translation est un glissement : chaque point se déplace du même vecteur, donc les écarts entre les points sont inchangés. La figure image est superposable à la figure de départ, sans rotation ni agrandissement."
          explainWrong="Regarde la figure verte du dessus : elle a exactement la même forme et la même inclinaison que la bleue. Seule sa position a changé."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'L’image d’un point',
      subtitle: 'On note A′ l’image de A.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              Le sommet A est en {`(${A.x} ; ${A.y})`}. On lui applique le déplacement{' '}
              {formatVec(CIBLE)}.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est l’abscisse de son image A′ ?"
            expected={imageA.x}
            parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
            display={String(imageA.x)}
            width="w-24"
            explain={`On ajoute le déplacement horizontal à l’abscisse : ${A.x} + ${CIBLE.dx} = ${imageA.x}. L’ordonnée se calcule pareil, avec le déplacement vertical.`}
            explainFor={(n) => (n === A.x + CIBLE.dy
              ? 'Tu as ajouté le déplacement VERTICAL à l’abscisse. Chaque composante agit sur sa propre coordonnée.'
              : null)}
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Toute la figure bouge"
      moduleSubtitle="Un glissement, sans rotation ni déformation"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Le drone au complet',
        tone: 'emerald',
        body: (
          <p>
            Jusqu’ici tu déplaçais un point. Applique maintenant le même déplacement à{' '}
            <strong>tous les sommets à la fois</strong> et observe ce qui se conserve.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 flex gap-3 items-start">
          <Shapes className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            L’image d’un point A par une translation se note <strong>A′</strong> (« A prime »).
            L’image d’une figure est l’ensemble des images de ses points.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Une translation fait glisser toute la figure du même
          déplacement. L’image est <strong>superposable</strong> à la figure de départ : longueurs,
          angles et orientation sont conservés.
        </Feedback>
      }
    />
  );
}
