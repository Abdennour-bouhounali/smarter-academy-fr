import React, { useState } from 'react';
import { Move, Compass, Repeat } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointDriver from '../components/PointDriver';
import {
  formatCoords, swap, samePoint, describeDisplacement, quadrantOf, PARC,
} from '../components/reperageUtils';

/**
 * Module 2 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              deux réglages séparés commandent un même point.
 * Mathematical objective l'abscisse et l'ordonnée sont deux RÔLES distincts,
 *                       chacun lié à une direction.
 * Student action        appuyer sur − / + de x, puis de y.
 * Controlled variable   une seule coordonnée à la fois.
 * Mathematical state    le point M {x, y}, plus la trace de son chemin.
 * Visual consequence    le point ne se déplace que sur une ligne : horizontale
 *                       pour x, verticale pour y. La projection concernée
 *                       s'allume.
 * Expected observation  « ce nombre-là fait bouger de ce côté-là ».
 * Misconception         « (2 ; −3) et (−3 ; 2), c'est pareil, ce sont les
 *                       mêmes nombres. » L'étape 3 la fait vivre : le fantôme
 *                       du couple inversé atterrit dans un autre quadrant.
 * Feedback              le déplacement est nommé en toutes lettres ; l'erreur
 *                       d'inversion est décrite comme un déplacement, pas
 *                       comme un « faux ».
 * Formalization         le mot « abscisse » et le mot « ordonnée » ne sont
 *                       prononcés qu'APRÈS les deux premières étapes.
 * Scaffolding           étape 1 : une seule coordonnée à changer, cible
 *                       affichée. Étape 2 : les deux. Étape 3 : plus de cible,
 *                       on raisonne.
 * Transfer              le même geste sert au module 4 (placer) et au
 *                       module 5 (longueurs).
 */
const RANGE = PARC.range;

/* Les deux missions : chacune isole ce qu'elle veut faire découvrir. */
const MISSION_X = { from: { x: -2, y: 2 }, to: { x: 3, y: 2 } };   // seul x change
const MISSION_XY = { from: { x: 3, y: 2 }, to: { x: -1, y: -3 } }; // les deux changent

export default function Module02UnSeulCurseur() {
  /* Étape 1 — un seul réglage suffit. */
  const [p1, setP1] = useState(MISSION_X.from);
  const [moved1, setMoved1] = useState(null);
  const [usedY, setUsedY] = useState(false);
  const [trail1, setTrail1] = useState([MISSION_X.from]);
  const done1 = samePoint(p1, MISSION_X.to);

  /* Étape 2 — les deux réglages, un déplacement en deux temps. */
  const [p2, setP2] = useState(MISSION_XY.from);
  const [moved2, setMoved2] = useState(null);
  const [trail2, setTrail2] = useState([MISSION_XY.from]);
  const done2 = samePoint(p2, MISSION_XY.to);

  /* Étape 3 — l'échange, provoqué par l'élève. */
  const [p3, setP3] = useState({ x: 4, y: -2 });
  const [moved3, setMoved3] = useState(null);
  const [seenSwap, setSeenSwap] = useState(false);
  const [q3, setQ3] = useState(false);

  const drive = (setPoint, setMoved, setTrail) => (next, axis) => {
    setPoint(next);
    setMoved(axis);
    if (setTrail) setTrail((t) => (t.length > 40 ? t : [...t, next]));
  };

  const steps = [
    {
      num: 1,
      title: 'Un seul réglage suffit',
      subtitle: 'Amène M sur la cible sans jamais toucher au second réglage.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            M est sur {formatCoords(MISSION_X.from)}. La cible en pointillé est sur{' '}
            {formatCoords(MISSION_X.to)}. <strong>Un seul des deux réglages est utile.</strong> Trouve lequel.
          </p>
          <PointDriver
            point={p1}
            onPointChange={(next, axis) => {
              if (axis === 'y') setUsedY(true);
              drive(setP1, setMoved1, setTrail1)(next, axis);
              if (samePoint(next, MISSION_X.to)) kit.react(true);
            }}
            range={RANGE}
            lastMoved={moved1}
            target={MISSION_X.to}
            trail={trail1}
            disabled={done1}
            ariaLabel="Repère : amène le point M sur la cible"
          />
          {done1 ? (
            <Feedback tone="ok">
              Arrivé. Les deux points ont la <strong>même ordonnée (2)</strong> : seul le réglage x
              était concerné, et M a glissé horizontalement, {describeDisplacement({ dx: 5, dy: 0 })}.
              {usedY && ' Tu as essayé le réglage y en chemin : il faisait monter ou descendre, jamais avancer.'}
            </Feedback>
          ) : (
            <Feedback tone="info">
              Écart restant : {Math.abs(MISSION_X.to.x - p1.x)} en x et {Math.abs(MISSION_X.to.y - p1.y)} en y.
              {p1.y !== MISSION_X.to.y && ' Le réglage y t’a écarté de la ligne : ramène-le à 2.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux réglages, deux directions',
      subtitle: 'Cette fois il faut les deux — mais toujours un à la fois.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            De {formatCoords(MISSION_XY.from)} à {formatCoords(MISSION_XY.to)}. Regarde la trace :
            elle ne fait que des traits horizontaux et des traits verticaux.
          </p>
          <PointDriver
            point={p2}
            onPointChange={(next, axis) => {
              drive(setP2, setMoved2, setTrail2)(next, axis);
              if (samePoint(next, MISSION_XY.to)) kit.react(true);
            }}
            range={RANGE}
            lastMoved={moved2}
            target={MISSION_XY.to}
            trail={trail2}
            disabled={done2}
            ariaLabel="Repère : amène le point M sur la seconde cible"
          />
          {done2 ? (
            <Feedback tone="ok">
              Le déplacement complet vaut{' '}
              <strong>{describeDisplacement({
                dx: MISSION_XY.to.x - MISSION_XY.from.x,
                dy: MISSION_XY.to.y - MISSION_XY.from.y,
              })}</strong>. Le premier nombre du couple gouverne l’horizontal, le second le vertical.
              On les appelle l’<strong>abscisse</strong> et l’<strong>ordonnée</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Il te reste {Math.abs(MISSION_XY.to.x - p2.x)} en x et {Math.abs(MISSION_XY.to.y - p2.y)} en y.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si on échangeait les deux nombres ?',
      subtitle: 'Le fantôme montre où tombe le couple inversé.',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Déplace M où tu veux et observe le point gris : c’est {formatCoords(swap(p3))}, le même
            couple <em>dans l’autre ordre</em>. Bouge encore : le gris te suit-il ?
          </p>
          <PointDriver
            point={p3}
            onPointChange={(next, axis) => {
              setP3(next);
              setMoved3(axis);
              setSeenSwap(true);
            }}
            range={RANGE}
            lastMoved={moved3}
            showGhost
            showGuides={false}
            ariaLabel="Repère : compare le point et son couple inversé"
          />
          {seenSwap && (
            <Feedback tone="info">
              M est {quadrantOf(p3) === 0 ? 'sur un axe' : `dans le quadrant ${quadrantOf(p3)}`}, son
              inversé {quadrantOf(swap(p3)) === 0 ? 'sur un axe' : `dans le quadrant ${quadrantOf(swap(p3))}`}.
              {samePoint(p3, swap(p3)) && ' Ici les deux se superposent : tu es sur la diagonale, le seul endroit où l’échange ne se voit pas.'}
            </Feedback>
          )}
          <TapQuestion
            prompt="Pourquoi (2 ; −3) et (−3 ; 2) ne désignent-ils pas le même point ?"
            options={[
              'Parce que le premier nombre commande l’horizontal et le second le vertical : échanger change les deux directions.',
              'Parce que −3 est négatif et 2 est positif.',
              'Parce qu’on écrit toujours le plus grand nombre en premier.',
              'Ils désignent bien le même point, seule l’écriture change.',
            ]}
            correct={0}
            cols={1}
            explain="Chaque coordonnée a un rôle : la première dit de combien on se décale à droite ou à gauche, la seconde de combien on monte ou on descend. En les échangeant, on donne l’ordre inverse aux deux directions."
            explainWrong="Le signe et la taille des nombres ne décident de rien : c’est la PLACE dans le couple qui donne le rôle. (2 ; −3) est en bas à droite, (−3 ; 2) en haut à gauche."
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un seul curseur à la fois"
      moduleSubtitle="Chaque nombre commande une direction — et une seule"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux réglages, deux directions',
        tone: 'sky',
        body: (
          <p>
            Le plan du parc a maintenant <strong>deux</strong> directions. Deux réglages commandent le
            point M. À toi de découvrir ce que chacun fait — et pourquoi on ne peut pas les échanger.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Move, t: 'Bouge x', d: 'Regarde ce qui change… et ce qui ne change pas.' },
            { icon: Compass, t: 'Bouge y', d: 'Même question, dans l’autre direction.' },
            { icon: Repeat, t: 'Échange', d: 'Deux mêmes nombres, deux points différents.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className="w-5 h-5 text-sky-600 mb-1" aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Le mot juste.</strong> Dans le couple (x ; y), x est l’<strong>abscisse</strong>
          {' '}— elle se lit sur l’axe horizontal — et y est l’<strong>ordonnée</strong>, sur l’axe
          vertical. On les sépare par un point-virgule, et jamais on ne les intervertit.
        </Feedback>
      }
    />
  );
}
