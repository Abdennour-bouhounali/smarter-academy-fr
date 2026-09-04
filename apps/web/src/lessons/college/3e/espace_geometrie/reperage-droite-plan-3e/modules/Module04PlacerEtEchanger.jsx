import React, { useState } from 'react';
import { Target, AlertTriangle } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointDriver from '../components/PointDriver';
import {
  PARC, formatCoords, swap, samePoint, describeDisplacement, displace,
} from '../components/reperageUtils';

/**
 * Module 4 — MANIPULATION : placer un point, et provoquer l'erreur d'ordre.
 *
 * Activity              placer M sur des cibles données par leurs coordonnées.
 * Mathematical objective passer du couple au point (le sens inverse du module 3).
 * Student action        régler x et y jusqu'à la cible.
 * Controlled variable   chaque coordonnée séparément.
 * Mathematical state    le point M.
 * Visual consequence    la cible en pointillé se referme sur le point.
 * Expected observation  placer, c'est se déplacer depuis l'origine.
 * Misconception ciblée   l'inversion du couple. L'étape 2 la met en scène :
 *                       l'élève place VOLONTAIREMENT le couple inversé et
 *                       constate l'écart, au lieu de le subir dans un exercice.
 * Feedback              l'écart restant est chiffré sur chaque coordonnée.
 * Scaffolding           cible visible → cible masquée → déplacement relatif.
 * Transfer              le déplacement (dx ; dy) prépare les vecteurs de 3e.
 */
const RANGE = PARC.range;
const CIBLE_1 = { x: -4, y: 3 };
const CIBLE_2 = { x: 2, y: -4 };
const DEPART_3 = { x: -3, y: -1 };
const DEP = { dx: 5, dy: 3 };
const CIBLE_3 = displace(DEPART_3, DEP.dx, DEP.dy);

export default function Module04PlacerEtEchanger() {
  const [p1, setP1] = useState({ x: 0, y: 0 });
  const [m1, setM1] = useState(null);
  const done1 = samePoint(p1, CIBLE_1);

  const [p2, setP2] = useState({ x: 0, y: 0 });
  const [m2, setM2] = useState(null);
  const [visitedSwap, setVisitedSwap] = useState(false);
  const done2 = samePoint(p2, CIBLE_2) && visitedSwap;

  const [p3, setP3] = useState(DEPART_3);
  const [m3, setM3] = useState(null);
  const done3 = samePoint(p3, CIBLE_3);

  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Place le point A (−4 ; 3)',
      subtitle: 'La cible est affichée : vérifie que tu tombes dessus.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PointDriver
            point={p1}
            onPointChange={(next, axis) => {
              setP1(next); setM1(axis);
              if (samePoint(next, CIBLE_1)) kit.react(true);
            }}
            range={RANGE}
            lastMoved={m1}
            target={CIBLE_1}
            disabled={done1}
            ariaLabel="Repère : place le point A en (−4 ; 3)"
          />
          {done1 ? (
            <Feedback tone="ok">
              A {formatCoords(CIBLE_1)} : 4 vers la gauche, puis 3 vers le haut. Placer un point,
              c’est effectuer ce déplacement depuis l’origine.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Écart : {Math.abs(CIBLE_1.x - p1.x)} en abscisse, {Math.abs(CIBLE_1.y - p1.y)} en ordonnée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège, provoqué exprès',
      subtitle: 'Place d’abord (−4 ; 2)… puis (2 ; −4). Compare.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Passe d’abord le point par <strong>{formatCoords(swap(CIBLE_2))}</strong> — le couple
            écrit à l’envers — puis amène-le sur <strong>{formatCoords(CIBLE_2)}</strong>.
          </p>
          <PointDriver
            point={p2}
            onPointChange={(next, axis) => {
              setP2(next); setM2(axis);
              if (samePoint(next, swap(CIBLE_2))) { setVisitedSwap(true); kit.react(true); }
              if (samePoint(next, CIBLE_2) && visitedSwap) kit.react(true);
            }}
            range={RANGE}
            lastMoved={m2}
            target={visitedSwap ? CIBLE_2 : swap(CIBLE_2)}
            disabled={done2}
            ariaLabel="Repère : place successivement les deux couples inversés"
          />
          {!visitedSwap && (
            <Feedback tone="info">
              Première étape : {formatCoords(swap(CIBLE_2))}. Écart restant :{' '}
              {Math.abs(swap(CIBLE_2).x - p2.x)} en x, {Math.abs(swap(CIBLE_2).y - p2.y)} en y.
            </Feedback>
          )}
          {visitedSwap && !done2 && (
            <Feedback tone="info">
              Bien. Maintenant {formatCoords(CIBLE_2)} — les deux mêmes nombres, dans l’autre ordre.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              Les deux points sont séparés par{' '}
              <strong>{describeDisplacement({
                dx: CIBLE_2.x - swap(CIBLE_2).x, dy: CIBLE_2.y - swap(CIBLE_2).y,
              })}</strong>. Écrire (2 ; −4) au lieu de (−4 ; 2) ne fait pas une petite erreur :
              cela désigne un endroit complètement différent du parc.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un déplacement, pas une position',
      subtitle: 'Depuis (−3 ; −1), avance de 5 vers la droite et 3 vers le haut.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette fois, la cible n’est pas affichée : c’est le <strong>déplacement</strong> qui est
            donné. À toi de trouver où tu arrives.
          </p>
          <PointDriver
            point={p3}
            onPointChange={(next, axis) => {
              setP3(next); setM3(axis);
              if (samePoint(next, CIBLE_3)) kit.react(true);
            }}
            range={RANGE}
            lastMoved={m3}
            disabled={done3}
            ariaLabel="Repère : effectue le déplacement demandé"
          />
          {done3 ? (
            <Feedback tone="ok">
              Tu arrives en {formatCoords(CIBLE_3)}. On ajoute {DEP.dx} à l’abscisse et {DEP.dy} à
              l’ordonnée : chaque coordonnée reçoit son propre déplacement.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Départ {formatCoords(DEPART_3)}. Tu es en {formatCoords(p3)} : tu as fait{' '}
              {describeDisplacement({ dx: p3.x - DEPART_3.x, dy: p3.y - DEPART_3.y })}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Reconnaître le déplacement',
      done: q4,
      content: (
        <TapQuestion
          prompt="Un point part de (−2 ; 5) et arrive en (1 ; 1). Quel déplacement a-t-il subi ?"
          options={[
            '3 vers la droite et 4 vers le bas',
            '3 vers la gauche et 4 vers le haut',
            '1 vers la droite et 1 vers le bas',
            '2 vers la droite et 5 vers le bas',
          ]}
          correct={0}
          cols={1}
          explain="On calcule la différence coordonnée par coordonnée : 1 − (−2) = 3 (vers la droite), et 1 − 5 = −4 (vers le bas)."
          explainWrong="Attention au sens de la soustraction : on fait toujours arrivée − départ, sur chaque coordonnée séparément."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Placer, et ne pas échanger"
      moduleSubtitle="Du couple au point, et retour"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Des points à poser',
        tone: 'violet',
        body: (
          <p>
            Tu sais lire un point. Fais l’inverse : à partir d’un couple, retrouve l’endroit. Et une
            fois au moins, trompe-toi <strong>exprès</strong> pour voir ce que ça change.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Target, t: 'Placer', d: 'Le couple donne un déplacement depuis l’origine.', c: 'text-violet-600' },
            { icon: AlertTriangle, t: 'Le piège', d: 'Les mêmes nombres inversés désignent un autre lieu.', c: 'text-amber-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Placer M (x ; y), c’est partir de l’origine, se décaler de x
          horizontalement, puis de y verticalement. Un déplacement s’ajoute coordonnée par coordonnée.
        </Feedback>
      }
    />
  );
}
