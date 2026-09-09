import React, { useState } from 'react';
import { Search, Target } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DetectiveLab from '../components/DetectiveLab';
import {
  A_DEFAUT, B_DEFAUT, C_DEPART, caracterisationRectangle, arrondi, fr,
} from '../components/triangles4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              faire glisser le sommet C n'importe où dans le plan
 *                       pour rendre l'angle en C droit, en surveillant le
 *                       centre du cercle circonscrit.
 * Mathematical objective un triangle est rectangle en C exactement quand le
 *                       centre de son cercle circonscrit est le milieu de [AB].
 * Student action        chercher la position. Aucune contrainte, aucun aimant.
 * Controlled variable   la position de C, et elle seule.
 * Mathematical state    les trois sommets. Le centre, le rayon, l'angle et
 *                       l'écart |O − M| sont TOUS mesurés.
 * Visual consequence    le cercle change de taille et de place, le trait rouge
 *                       entre O et M raccourcit, deux nombres bougent.
 * Expected observation  « quand l'angle atteint 90°, O tombe pile sur M ».
 * Misconception targeted croire qu'une propriété se lit dans les deux sens sans
 *                       vérification — la question est POSÉE ici et tranchée
 *                       au module 2.
 * Formalization         le vocabulaire (inscrit, diamètre) et le sens direct de
 *                       la propriété sont posés ici ; le mot
 *                       « caractérisation » attend le module 2, parce qu'il
 *                       suppose le chemin inverse, qui n'est pas encore fait.
 *
 * LA MANIPULATION D'ABORD (§6bis, règle du dépôt) : l'étape 1 rend le labo
 * immédiatement. La prédiction vit DANS cette étape, à côté de la figure, comme
 * une invitation — jamais comme une porte à franchir avant de manipuler.
 *
 * CONTINUITÉ : la position trouvée est mémorisée et le module 2 y revient pour
 * la lire à l'envers. Déclarée dans `lesson.config.js`.
 */
export default function Module01LeCercleQuiTrahit() {
  const memo = useLabState(LESSON_CONFIG.id, 'triangle', { C: C_DEPART });
  const [C, setC] = useState(memo.value.C ?? C_DEPART);
  const [pred, setPred] = useState(null);
  const [trouve, setTrouve] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, C);

  const bouger = (p) => {
    setC(p);
    // Écriture sur un GESTE SIGNIFIANT : on ne mémorise qu'au moment où la
    // cible est atteinte, jamais à chaque `pointermove`.
    const atteint = caracterisationRectangle(A_DEFAUT, B_DEFAUT, p);
    if (atteint.droit) {
      setTrouve(true);
      memo.save({ C: p });
    }
  };

  const lab = <DetectiveLab C={C} onC={bouger} />;

  const steps = [
    {
      num: 1,
      title: 'Rends l’angle en C droit',
      subtitle: 'Fais glisser le point C. Les deux nombres sous la figure te disent si tu chauffes.',
      done: trouve,
      content: (
        <div className="space-y-3">
          {lab}
          <PredictionChips
            prompt="Pendant que tu cherches, surveille le point rouge O. Où sera-t-il quand l’angle sera exactement droit ?"
            options={[
              { id: 'milieu', label: 'Sur le milieu de [AB]' },
              { id: 'sur-c', label: 'Sur le point C' },
              { id: 'ailleurs', label: 'Quelque part au hasard' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {!trouve && (
            <Feedback tone="info">
              Angle actuel : <strong>{fr(arrondi(k.angleC, 1), 1)}°</strong> ({k.nature}).
              {k.angleC > 90
                ? ' Il est trop ouvert : éloigne C de [AB].'
                : ' Il est trop fermé : rapproche C de [AB], ou rentre vers le milieu.'}
            </Feedback>
          )}
          {trouve && (
            <Feedback tone="ok">
              Angle droit trouvé — et le point rouge O est venu se poser exactement sur le point
              bleu M, le milieu de [AB]. Le trait rouge qui les reliait a disparu.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que le cercle raconte',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le cercle passe par les trois sommets : c’est le cercle circonscrit, celui que tu
            construisais en 5e avec les médiatrices. Regarde maintenant le côté [AB].
          </p>
          {lab}
          <TapQuestion
            prompt="Quand l’angle en C est droit et que O est confondu avec le milieu de [AB], que peut-on dire du côté [AB] ?"
            options={[
              'C’est un diamètre du cercle',
              'C’est un rayon du cercle',
              'C’est le plus petit côté du triangle',
              'Il est tangent au cercle',
            ]}
            correct={0}
            cols={1}
            requires={['mediatrices-cercle-circonscrit', 'notation-segment']}
            explain="[AB] passe par le centre O et joint deux points du cercle : c’est exactement la définition d’un diamètre. Il vaut donc deux rayons."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="hypotenuse-diametre"
              variant="new"
              lead="Voilà les deux mots qu’il faut pour décrire ce que tu vois."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le premier fait établi',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Tu as amené l’angle en C à 90°, et le centre est tombé sur le milieu. Que peux-tu affirmer maintenant ?"
            options={[
              'Si un triangle est rectangle, le centre de son cercle circonscrit est le milieu du côté opposé à l’angle droit',
              'Le centre du cercle circonscrit est toujours le milieu d’un côté',
              'Un triangle rectangle n’a pas de cercle circonscrit',
              'Le centre du cercle circonscrit est toujours à l’intérieur du triangle',
            ]}
            correct={0}
            cols={1}
            requires={['hypotenuse-diametre', 'angle-droit']}
            explain="C’est bien ce que tu as observé, et seulement cela : on PART de l’angle droit pour arriver au centre. Les deux autres positions que tu as essayées montrent que le centre n’est pas toujours sur un milieu."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="cercle-circonscrit-rectangle"
              variant="new"
              lead="Ton premier fait établi — dans un sens bien précis."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Une question reste entière : si on te DONNE un point sur le cercle de diamètre [AB],
              l’angle sera-t-il forcément droit ? Ce n’est pas la même phrase. C’est le module
              suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le cercle qui trahit"
      moduleSubtitle="Trouver l’angle droit, et voir où tombe le centre"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Le sommet qui cache un angle droit',
        tone: 'indigo',
        body: (
          <>
            A et B sont plantés. C est libre, et son cercle circonscrit le suit partout.{' '}
            <strong>Trouve la position qui rend l’angle en C droit</strong> — et surveille bien le
            point rouge pendant que tu cherches.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <Target className="inline h-4 w-4" aria-hidden="true" /> Deux témoins sous la figure :
            l’angle en C, et la distance entre le centre O et le milieu M. Un détective ne croit
            un fait que lorsque deux témoins indépendants le confirment.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
