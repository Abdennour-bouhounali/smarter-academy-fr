import React, { useState } from 'react';
import { Sigma } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TriangleLab from '../components/TriangleLab';
import { FIGURES, triangleTraits, angleSum, thirdAngle } from '../components/triangleUtils';

/**
 * Module 3 — DÉCOUVERTE : la somme des angles ne bouge pas.
 *
 * Activity              déformer librement le triangle en surveillant la somme.
 * Mathematical objective la somme des angles d'un triangle vaut 180°, quel que
 *                       soit le triangle.
 * Student action        déplacer n'importe quel sommet, autant de fois qu'il veut.
 * Controlled variable   la forme entière du triangle.
 * Mathematical state    les trois angles, recalculés en continu.
 * Visual consequence    les trois nombres changent, leur somme ne change pas.
 * Expected observation  « les angles bougent, le total reste 180 ».
 * Misconception         croire que la somme dépend de la taille ou de la forme
 *                       (« un grand triangle a de plus grands angles »).
 * Feedback              la somme est affichée en permanence : l'invariant est
 *                       constatable à chaque instant.
 * Formalization         l'étape 2 exploite l'invariant pour CALCULER un angle
 *                       inconnu — l'invariant devient un outil.
 * Transfer              module 5 : calculer sans mesurer.
 */
export default function Module03SommeDesAngles() {
  const [pts, setPts] = useState(FIGURES.quelconque);
  const [visited, setVisited] = useState(new Set());
  const t = triangleTraits(pts);
  const somme = Math.round(angleSum(pts));

  /* On demande d'explorer VRAIMENT : trois formes nettement différentes. */
  const registerShape = (p) => {
    const a = triangleTraits(p).angles;
    const bucket = a.some((x) => x > 100) ? 'obtus'
      : a.every((x) => x < 80) ? 'aigu' : 'moyen';
    setVisited((s) => (s.has(bucket) ? s : new Set([...s, bucket])));
  };
  const done1 = visited.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Cherche à faire varier la somme',
      subtitle: 'Déforme le triangle de trois façons différentes. Surveille le total.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Essaie d’obtenir un triangle très <strong>pointu</strong>, un très <strong>aplati</strong>,
            puis un intermédiaire. Note ce qui change… et ce qui ne change jamais.
          </p>
          <TriangleLab
            points={pts}
            onPointsChange={(p) => {
              setPts(p);
              registerShape(p);
              if (visited.size >= 2) kit.react(true);
            }}
            showAngles
            showAngleSum
            disabled={done1}
            ariaLabel="Triangle libre : observe la somme de ses angles"
          />
          {done1 ? (
            <>
            <Feedback tone="ok">
              Trois formes très différentes, et toujours <strong>{somme}°</strong>. Les angles se
              partagent un total fixe : quand l’un augmente, les autres diminuent d’autant.
            </Feedback>
              <KnowledgeBrick
                id="somme-des-angles"
                variant="new"
                lead="Ce total qui ne bouge jamais est la propriété la plus utile du chapitre."
              />
            </>
          ) : (
            <Feedback tone="info">
              Formes explorées : {visited.size} sur 3. Total actuel : {somme}°.
              {visited.size > 0 && ' Continue de déformer : essaie une forme franchement différente.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’invariant devient un outil',
      subtitle: 'Si on connaît deux angles, le troisième se calcule.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              Dans un triangle DEF, l’angle en D mesure <strong>52°</strong> et l’angle en E
              mesure <strong>61°</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure l’angle en F ?"
            suffix="°"
            expected={thirdAngle(52, 61)}
            width="w-24"
            explain="180 − 52 − 61 = 67. On n’a rien mesuré : la somme fixe suffit."
            explainFor={(n) => (n === 113
              ? 'Tu as calculé 52 + 61 = 113, la somme des deux angles connus. Il faut ensuite la retrancher à 180.'
              : null)}
            requires={['somme-des-angles']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="mem-consequences-180"
              variant="new"
              compact
              lead="Trois cas reviennent si souvent qu’il vaut mieux les connaître d’avance."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le cas du triangle rectangle',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans un triangle rectangle, que vaut la somme des deux angles aigus ?"
          options={['90°', '180°', '45°', 'cela dépend du triangle']}
          correct={0}
          explain="L’angle droit occupe déjà 90° du total de 180°. Il reste donc exactement 90° à partager entre les deux autres angles — quel que soit le triangle rectangle."
          explainWrong="La somme des TROIS angles vaut 180°. Si l’un vaut 90°, les deux autres se partagent ce qui reste, c’est-à-dire 90°."
          requires={['somme-des-angles', 'mem-consequences-180']}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="180°, quoi qu’il arrive"
      moduleSubtitle="Ce qui change, et ce qui ne change jamais"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Un total qui résiste',
        tone: 'emerald',
        body: (
          <p>
            Déforme le triangle autant que tu veux. Un nombre refusera de bouger — et il va te
            servir dans toute la suite de la leçon.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 flex gap-3 items-start">
          <Sigma className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Les trois mesures d’angles sont affichées en direct, ainsi que leur somme. Ton travail :
            essayer de la faire changer.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> 180°, toujours. Passons de l’observation à la construction.
        </KnowledgeSnapshot>
      )}
    />
  );
}
