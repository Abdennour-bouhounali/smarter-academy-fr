import React, { useState } from 'react';
import { Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « translation » n'était nulle part avant d'être exigé, et « image »
 *   n'existait que dans un encadré d'intro puis dans un `footer`. L'ordre est
 *   maintenant : faire glisser la figure → brique `translation` → la question
 *   sur ce qui se conserve → brique `image-point` → le calcul de A′ en essai
 *   immédiat. L'encadré d'intro, qui recopiait la définition de A′, a disparu :
 *   elle vit dans knowledge.jsx et paraît à sa place, dans la brique.
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
            <KnowledgeBrick
              id="translation"
              variant="new"
              lead="Tous les sommets ont reçu le même déplacement d’un seul coup, et la forme verte est restée le calque exact de la bleue. Ce glissement porte un nom."
            />
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
          requires={['translation', 'deplacement']}
          explain="La translation est un glissement : chaque point se déplace du même déplacement, donc les écarts entre les points sont inchangés. La figure obtenue est superposable à la figure de départ, sans rotation ni agrandissement."
          explainWrong="Regarde la figure verte du dessus : elle a exactement la même forme et la même inclinaison que la bleue. Seule sa position a changé."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le sommet qui correspond à A',
      subtitle: 'Où atterrit le sommet A ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="image-point"
            variant="new"
            lead={(
              <>
                Chaque sommet bleu a un correspondant vert. Le sommet A est en{' '}
                {`(${A.x} ; ${A.y})`} et reçoit le déplacement {formatVec(CIBLE)} : son
                correspondant a un nom, et une notation.
              </>
            )}
          >
            <NumericQuestion
              prompt="Quelle est l’abscisse de son image A′ ?"
              expected={imageA.x}
              parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
              display={String(imageA.x)}
              width="w-24"
              requires={['image-point', 'composante']}
              explain={`On ajoute le déplacement horizontal à l’abscisse : ${A.x} + ${CIBLE.dx} = ${imageA.x}. L’ordonnée se calcule pareil, avec le déplacement vertical.`}
              explainFor={(n) => (n === A.x + CIBLE.dy
                ? 'Tu as ajouté le déplacement VERTICAL à l’abscisse. Chaque composante agit sur sa propre coordonnée.'
                : null)}
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          </KnowledgeBrick>
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
            Règle le déplacement, puis surveille la forme verte : compare ses côtés, ses angles et
            son inclinaison à ceux de la bleue.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu déplaces des points et des figures. Reste une question :
          la flèche qui décrit le déplacement est-elle attachée à l’endroit où on la dessine ?
        </KnowledgeSnapshot>
      }
    />
  );
}
