import React, { useState } from 'react';
import { Navigation, Repeat2 } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import {
  RANGE, vecFromPoints, equalVectors, diagnose, DIAGNOSIS_TEXT, describeVec, translatePoint,
} from '../components/vectorUtils';

/**
 * Module 1 — DÉCLENCHEUR : refaire le même trajet, ailleurs.
 *
 * Activity              reproduire un déplacement observé, depuis un autre point.
 * Mathematical objective un déplacement se décrit par trois attributs —
 *                       direction, sens, longueur — et pas par son point de départ.
 * Student action        régler les deux composantes du second drone.
 * Controlled variable   une composante à la fois.
 * Mathematical state    deux vecteurs, comparés par `equalVectors`.
 * Visual consequence    la flèche de l'élève se superpose (ou non) à la cible.
 * Expected observation  « il faut le même écart, pas la même arrivée ».
 * Misconception ciblée   viser la même case d'arrivée que le drone modèle.
 *                       `diagnose` nomme précisément l'attribut fautif.
 * Feedback              direction / sens / longueur, jamais « faux ».
 * Formalization         le mot « vecteur » n'est PAS prononcé dans ce module.
 * Transfer              module 4 : le même vecteur posé en quatre endroits.
 */
const MODELE = { origin: { x: -5, y: -3 }, vector: { dx: 4, dy: 2 } };
const DEPART_2 = { x: -1, y: 1 };

export default function Module01LeMemeTrajet() {
  const [v, setV] = useState({ dx: 1, dy: -2 });
  const done1 = equalVectors(v, MODELE.vector);
  const raison = diagnose(MODELE.vector, v);

  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Refais le même trajet',
      subtitle: 'Le drone bleu a bougé. Fais faire EXACTEMENT le même trajet au drone violet.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le drone modèle part de (−5 ; −3) et suit la flèche en pointillé. Ton drone part
            d’ailleurs — de {`(${DEPART_2.x} ; ${DEPART_2.y})`}. Règle son trajet pour qu’il soit
            <strong> identique</strong>.
          </p>
          <VectorLab
            origin={DEPART_2}
            vector={v}
            onVectorChange={(nv) => {
              setV(nv);
              if (equalVectors(nv, MODELE.vector)) kit.react(true);
            }}
            mode="build"
            range={RANGE}
            target={MODELE}
            ghosts={[{ origin: MODELE.origin, vector: MODELE.vector, label: 'modèle' }]}
            disabled={done1}
            ariaLabel="Règle le déplacement de ton drone pour qu’il soit identique au modèle"
          />
          {done1 ? (
            <Feedback tone="ok">
              Les deux trajets sont identiques : {describeVec(MODELE.vector)}. Et pourtant les deux
              drones ne sont <strong>pas arrivés au même endroit</strong> — c’est le déplacement qui
              est le même, pas la destination.
            </Feedback>
          ) : (
            <Feedback tone="info">{DIAGNOSIS_TEXT[raison] ?? 'Continue de régler le trajet.'}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qui définit un trajet',
      done: q2,
      content: (
        <TapQuestion
          prompt="Pour dire que deux drones ont fait le MÊME trajet, que faut-il vérifier ?"
          options={[
            'Qu’ils se sont déplacés dans la même direction, dans le même sens, et de la même longueur.',
            'Qu’ils sont arrivés au même endroit.',
            'Qu’ils sont partis du même endroit.',
            'Qu’ils ont mis le même temps.',
          ]}
          correct={0}
          cols={1}
          explain="Un trajet se décrit par trois choses : la direction (la droite suivie), le sens (de quel côté on la parcourt) et la longueur. Le point de départ n’en fait pas partie — c’est pour cela que deux drones partis d’endroits différents peuvent faire le même trajet."
          explainWrong="Tes deux drones sont justement partis d’endroits différents et sont arrivés à des endroits différents, alors que leur trajet était identique."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le même trajet"
      moduleSubtitle="Se déplacer pareil, sans arriver au même endroit"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'La chorégraphie des drones',
        tone: 'indigo',
        body: (
          <p>
            Une escadrille doit exécuter <strong>le même mouvement</strong>, chaque drone partant de
            sa propre position. Commence par en faire bouger un seul, exactement comme le modèle.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Navigation, t: 'Le modèle', d: 'Un trajet à reproduire, en pointillé.', c: 'text-amber-600' },
            { icon: Repeat2, t: 'Ton drone', d: 'Il part d’ailleurs, mais doit bouger pareil.', c: 'text-violet-600' },
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
          <strong>Retenons.</strong> Un déplacement se décrit par une <strong>direction</strong>,
          un <strong>sens</strong> et une <strong>longueur</strong>. Deux déplacements ayant ces
          trois attributs en commun sont le même, où qu’ils commencent.
        </Feedback>
      }
    />
  );
}
