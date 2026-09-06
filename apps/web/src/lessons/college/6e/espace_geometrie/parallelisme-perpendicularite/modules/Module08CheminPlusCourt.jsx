import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShortestPath from '../components/ShortestPath';
import RelationFigure from '../components/RelationFigure';
import { distanceTo, footOf } from '../components/relationsUtils';

/**
 * Module 8 — PRACTICE LAB : le plus court chemin (P10).
 *
 * Objectif : donner une RAISON D'ÊTRE à la perpendiculaire. Elle n'est pas
 * qu'une figure : c'est la réponse à une question concrète — par où rejoindre
 * la route le plus vite ?
 *
 * Aha : en cherchant le trajet le plus court, on tombe sur la perpendiculaire
 * sans l'avoir cherchée. La marque d'angle droit apparaît d'elle-même au
 * minimum.
 *
 * Misconception visée : croire que le plus court chemin est « tout droit vers
 * la route » au sens visuel (souvent l'horizontale ou la verticale), plutôt
 * que perpendiculairement.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 200 };
const ROUTE = { p: { x: 15, y: 155 }, angleDeg: -14, name: 'la route' };
const MAISON = { x: 175, y: 55 };

const MIN = distanceTo(ROUTE, MAISON);

export default function Module08CheminPlusCourt() {
  const [t, setT] = useState(40);
  const [best, setBest] = useState(null);
  const [foundDone, setFoundDone] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="Le chemin le plus court"
      moduleSubtitle="Du point à la route : quel trajet, et pourquoi celui-là ?"
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 08',
        title: 'La maison M doit rejoindre la route. Par où ?',
        body: (
          <p>
            Fais glisser le point d’arrivée <strong>H</strong> le long de la route et cherche le trajet le
            plus court. Garde ton meilleur essai.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve le trajet le plus court',
          subtitle: 'Déplace H, et regarde le nombre descendre.',
          done: foundDone,
          content: (kit) => (
            <div className="space-y-3">
              <ShortestPath
                line={ROUTE}
                from={MAISON}
                t={t}
                onTChange={setT}
                best={best}
                onKeep={(len) => {
                  const b = best == null ? len : Math.min(best, len);
                  setBest(b);
                  if (Math.abs(b - MIN) < 1.5 && !foundDone) {
                    kit.react(true);
                    setFoundDone(true);
                  }
                }}
                box={BOX}
                disabled={foundDone}
                ariaLabel="Route et maison M : choisis le point d’arrivée H"
              />
              {foundDone && (
                <>
                  <Feedback tone="ok">
                    Le trajet le plus court mesure <strong>{Math.round(best ?? MIN)}</strong>, et il arrive{' '}
                    <strong>perpendiculairement</strong> à la route — le carré d’angle droit est apparu tout
                    seul, sans que tu l’aies cherché.
                  </Feedback>
                  <KnowledgeBrick
                    id="distance-point-droite"
                    variant="new"
                    lead="Ce minimum que tu viens d’atteindre porte un nom, et il n’est pas un hasard."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi celui-là ?',
          done: whyDone,
          content: (
            <TapQuestion
              above={
                <RelationFigure
                  droites={[ROUTE]}
                  points={[{ ...MAISON, name: 'M', color: '#e11d48' }]}
                  distanceFrom={MAISON}
                  box={BOX}
                  ariaLabel="Le plus court chemin de M à la route, perpendiculaire"
                />
              }
              prompt="Parmi tous les trajets possibles d’un point à une droite, le plus court est celui qui…"
              options={[
                'Arrive perpendiculairement à la droite',
                'Va tout droit vers la gauche',
                'Rejoint l’extrémité la plus proche de la route',
              ]}
              correct={0}
              cols={1}
              requires={['distance-point-droite', 'droites-perpendiculaires']}
              explain="C’est une propriété générale : la distance d’un point à une droite se mesure toujours perpendiculairement. Tous les autres trajets sont plus longs — tu l’as vérifié en déplaçant H."
              explainWrong="Ce n’est pas une question de direction sur la page : une route penchée se rejoint par un trajet penché lui aussi. Ce qui compte, c’est l’angle droit à l’arrivée."
              solved={whyDone}
              onAnswered={() => setWhyDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et entre deux parallèles ?',
          done: transferDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Deux trottoirs sont parallèles. Comment mesure-t-on la largeur de la rue qui les sépare ?
                </>
              }
              options={[
                'Perpendiculairement, d’un trottoir à l’autre',
                'En diagonale, du coin d’un trottoir à l’autre',
                'N’importe comment : entre parallèles, toutes les mesures sont égales',
              ]}
              correct={0}
              cols={1}
              requires={['distance-point-droite', 'ecart-constant', 'droites-paralleles', 'mesurer-ecart']}
              explain="La largeur, c’est la distance entre les deux droites : elle se mesure perpendiculairement. Une mesure en diagonale donnerait un nombre plus grand que la largeur réelle."
              explainWrong="Attention : c’est la mesure PERPENDICULAIRE qui est la même partout entre deux parallèles (module 2). Une diagonale, elle, sera toujours plus longue."
              solved={transferDone}
              onAnswered={() => setTransferDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={8}>
          <strong>La suite.</strong> Ta carte est complète. Le plan du quartier va la mettre à
          l’épreuve.
        </KnowledgeSnapshot>
      }
    />
  );
}
