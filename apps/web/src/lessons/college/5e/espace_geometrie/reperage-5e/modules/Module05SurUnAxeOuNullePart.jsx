import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointPlacer from '../components/PointPlacer';
import { describeQuadrant, formatCoords, quadrantOf } from '../components/reperageUtils';

/**
 * Module 5 — DÉCOUVERTE (court) : le cas limite des axes.
 *
 * Un point dont une coordonnée vaut 0 n'est dans AUCUN quadrant : il est sur
 * une frontière. Les élèves le rangent spontanément dans le quadrant voisin,
 * et laisser ce cas comme simple distracteur d'une autre question reviendrait
 * à ne jamais l'enseigner.
 *
 * Le module est délibérément court (6 min) : il traite une seule idée, mais
 * il la traite pour de bon — l'élève doit AMENER le point sur un axe et voir
 * l'étiquette de région cesser de nommer un quadrant.
 *
 * Misconception targeted (M6) : « (0 ; 3) est dans le premier quadrant ».
 */
export default function Module05SurUnAxeOuNullePart() {
  const [p, setP] = useState({ x: 2, y: 3 });
  const [surAxe, setSurAxe] = useState(false);
  const [q2, setQ2] = useState(false);

  const q = quadrantOf(p);

  const bouger = (next, react) => {
    setP(next);
    if (typeof quadrantOf(next) === 'string' && !surAxe) {
      setSurAxe(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Amène le point sur un axe',
      subtitle: 'Fais valoir 0 à l’une des deux coordonnées, et lis l’étiquette.',
      done: surAxe,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3.5 text-sm text-slate-700">
            Les quatre régions que tu connais sont séparées par les deux axes. Que se passe-t-il
            quand le point se pose <strong>exactement sur une de ces séparations</strong> ?
          </div>

          <PointPlacer
            point={p}
            onPoint={(next) => bouger(next, kit.react)}
            showQuadrantBadge
            ariaLabel="Repère — amène le point sur un axe"
          />

          {surAxe ? (
            <Feedback tone="ok">
              L’étiquette ne nomme plus une région : elle dit{' '}
              <strong>{describeQuadrant(q)}</strong>. Un point posé sur un axe n’est{' '}
              <strong>dans aucun quadrant</strong> — il est sur la frontière entre deux d’entre eux.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Amène l’une des deux coordonnées à <strong>0</strong> : le point viendra se poser
              sur un axe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lequel des deux axes ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="sur-un-axe"
            variant="new"
            lead={<>C’est le zéro qui décide : il annule le déplacement dans une direction, et le point reste sur l’axe de l’autre.</>}
          />
          <TapQuestion
            prompt={
              <>
                Où se trouve le point <span className="font-mono font-bold">{formatCoords({ x: 0, y: -3 })}</span> ?
              </>
            }
            options={[
              'Sur l’axe des ordonnées (l’axe vertical)',
              'Sur l’axe des abscisses (l’axe horizontal)',
              'Dans la région en bas à gauche',
              'Dans la région en bas à droite',
            ]}
            correct={0}
            cols={1}
            requires={['sur-un-axe', 'axes-origine', 'coordonnees']}
            explain="L’abscisse vaut 0 : il n’y a aucun déplacement horizontal, le point reste donc sur l’axe vertical — l’axe des ordonnées, trois unités plus bas que l’origine."
            explainWrong="Ce point n’est dans aucune région : son abscisse vaut 0, donc il n’a pas quitté l’axe vertical. C’est l’axe des ordonnées, et il est en dessous de l’origine."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && <KnowledgeBrick id="mem-sur-un-axe" variant="new" compact />}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Sur un axe, ou nulle part"
      moduleSubtitle="Le cas limite qu’on range trop vite dans un quadrant"
      estimatedTime="6 min"
      brief={{
        tag: 'Découverte',
        title: 'Quand une coordonnée vaut zéro',
        tone: 'indigo',
        body: (
          <p>
            Les quadrants sont les régions <em>entre</em> les axes. Reste à savoir ce qu’il advient
            d’un point posé <strong>pile sur une frontière</strong> — la réponse est plus nette
            qu’on ne le croit.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
