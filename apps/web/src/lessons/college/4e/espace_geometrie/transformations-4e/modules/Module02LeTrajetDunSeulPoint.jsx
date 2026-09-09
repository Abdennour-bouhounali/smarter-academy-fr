import React, { useState } from 'react';
import { Target, Compass } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PointImageLab from '../components/PointImageLab';
import {
  PAS, M_POINT, GLISSEMENTS, translaterPoint, enCarreaux,
} from '../components/translation4e';

/**
 * Module 2 — DÉCOUVERTE : la règle de placement, sur UN seul point.
 *
 * Le module 1 faisait glisser une figure entière ; la règle de placement y
 * était visible mais jamais exécutée. Ici la scène se réduit à UN point pour
 * que ce soit l'élève qui décide où l'image se pose — et le laboratoire
 * MESURE trois choses sans jamais lui dire la réponse : même direction ?
 * même sens ? même longueur ?
 *
 * Activity              poser l'image d'un point, en reproduisant le trajet
 *                       d'une flèche modèle.
 * Mathematical objective l'image d'un point s'obtient en refaisant le MÊME
 *                       trajet : les trois caractères à la fois.
 * Student action        glisser la pastille violette sur le quadrillage
 *                       (aimantée aux nœuds).
 * Controlled variable   la position de l'image.
 * Mathematical state    (M, image) ; le trajet tracé et ses trois caractères
 *                       en sont DÉRIVÉS et comparés à ceux du modèle.
 * Visual consequence    les trois cases passent au vert une à une.
 * Expected observation  « la bonne longueur ne suffit pas » — c'est ce que
 *                       montre l'étape 2, où le piège du sens opposé est
 *                       exactement à la bonne distance.
 * Misconception targeted retenir la longueur en oubliant le sens ; retenir
 *                       direction et longueur en partant du mauvais côté.
 * Formalization         le mot « image » et la notation M’ à l'étape 3, la
 *                       méthode de construction à l'étape 4 — après que
 *                       l'élève a placé le point à la main.
 *
 * LES DEUX PIÈGES SONT ATTEIGNABLES ET DANS LE CADRE : le glissement mesure
 * exactement 5 carreaux, et `parcours.test.js` vérifie que le point image, le
 * piège du sens opposé et le piège de l'autre direction tiennent tous les
 * trois dans la figure. Sans cela, l'étape serait infaisable.
 */
const G = GLISSEMENTS.m2;
const CIBLE = translaterPoint(M_POINT, G);
/** Le piège du SENS : à la bonne distance, sur la bonne droite, du mauvais côté. */
const PIEGE_SENS = { x: M_POINT.x - G.dx, y: M_POINT.y - G.dy };

export default function Module02LeTrajetDunSeulPoint() {
  // On démarre l'image SUR le point M : rien n'est suggéré, et le trajet
  // tracé est nul tant que l'élève n'a rien fait.
  const [image, setImage] = useState({ x: M_POINT.x, y: M_POINT.y });
  const [pred, setPred] = useState(null);
  const [essais, setEssais] = useState(0);
  const [vuPiege, setVuPiege] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const poser = (p) => {
    setImage(p);
    setEssais((n) => n + 1);
  };

  const ecart = Math.hypot(image.x - CIBLE.x, image.y - CIBLE.y);
  const done1 = ecart <= 8;
  // L'échappatoire du §8 : après six essais, la cible s'affiche. Un élève ne
  // doit jamais rester bloqué dans un état faux.
  const aide = essais >= 6 && !done1;

  const lab = (
    <PointImageLab
      M={M_POINT}
      g={G}
      image={image}
      onImage={poser}
      montrerSolution={aide}
      ariaLabel="Poser l’image du point M"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Pose l’image de M',
      subtitle: 'La flèche grise donne le trajet à refaire. Fais partir M de la même façon.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de poser : que faut-il reproduire, à ton avis, pour trouver l’arrivée ?"
            options={[
              { id: 'longueur', label: 'La longueur seulement' },
              { id: 'trois', label: 'La direction, le sens et la longueur' },
              { id: 'direction', label: 'La direction seulement' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && !aide && (
            <Feedback tone="info">
              Les trois cases sous la figure te disent ce qui coïncide déjà et ce qui manque
              encore.
            </Feedback>
          )}
          {aide && (
            <Feedback tone="info">
              Le cercle vert indique l’arrivée. Compte le trajet de la flèche grise :{' '}
              {enCarreaux(Math.abs(G.dx))} carreaux horizontalement et{' '}
              {enCarreaux(Math.abs(G.dy))} verticalement.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Les trois cases sont vertes en même temps. C’est ce « en même temps » qui définit
              l’arrivée : deux sur trois ne suffisent jamais.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La bonne longueur suffit-elle ?',
      subtitle: 'Emmène la pastille de l’autre côté de M, à la même distance, et lis les cases.',
      /* L'étape a sa PROPRE complétion : la marquer terminée dès l'étape 1
         la rendrait décorative, et l'élève passerait sans jamais éprouver le
         piège — ce que la suite navigateur a effectivement constaté. */
      done: vuPiege,
      content: (
        <div className="space-y-3">
          {lab}
          <button
            type="button"
            onClick={() => { poser(PIEGE_SENS); setVuPiege(true); }}
            className="min-h-[44px] rounded-xl border-2 border-amber-400 bg-amber-50 px-4 text-sm font-bold text-amber-900 hover:bg-amber-100"
          >
            Essayer de l’autre côté de M
          </button>
          {!vuPiege && (
            <Feedback tone="info">
              Appuie sur le bouton, ou emmène toi-même la pastille de l’autre côté de M — à la
              même distance.
            </Feedback>
          )}
          {vuPiege && (
            <Feedback tone="ok">
              De l’autre côté, la <strong>longueur</strong> est la bonne et la{' '}
              <strong>direction</strong> aussi — pourtant l’arrivée n’est pas la même. Il manque
              le <strong>sens</strong>, et lui seul.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Comment appelle-t-on le point d’arrivée ?',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La brique AVANT la question : le mot « image » et la notation M’
              n'ont encore jamais été écrits. Les mettre dans les options d'un
              QCM ferait deviner un nom au lieu de l'apprendre. */}
          <KnowledgeBrick
            id="image"
            variant="new"
            lead="Le point que tu viens de poser a un nom, et une écriture."
          />
          <TapQuestion
            prompt="On écrit M’ à côté du point d’arrivée. Que veut dire cette apostrophe ?"
            options={[
              'Que ce point est l’image de M par le glissement',
              'Que ce point est le milieu du trajet',
              'Que ce point mesure une longueur en mètres',
            ]}
            correct={0}
            cols={1}
            requires={['image', 'translation']}
            explain="M’ se lit « M prime » : c’est l’image de M, c’est-à-dire le point où M arrive après le glissement."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Compter le trajet',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={`Le glissement de ce module avance de ${enCarreaux(Math.abs(G.dx))} carreaux vers la droite et ${enCarreaux(Math.abs(G.dy))} carreaux vers le haut. Combien de carreaux mesure le trajet en ligne droite ?`}
            expected={enCarreaux(G.longueur)}
            suffix="carreaux"
            requires={['trois-caracteres']}
            explain={`Le trajet direct mesure ${enCarreaux(G.longueur)} carreaux : c’est la diagonale du rectangle de ${enCarreaux(Math.abs(G.dx))} sur ${enCarreaux(Math.abs(G.dy))} carreaux, et la figure l’affiche sous « Même longueur ? ».`}
            explainFor={(n) => {
              if (n === enCarreaux(Math.abs(G.dx)) + enCarreaux(Math.abs(G.dy))) {
                return 'Attention : on n’additionne pas les deux déplacements. En allant en diagonale, on parcourt moins que le chemin en escalier.';
              }
              if (n === enCarreaux(Math.abs(G.dx)) || n === enCarreaux(Math.abs(G.dy))) {
                return 'Ce n’est qu’un des deux déplacements. Le trajet, lui, va de M directement à M’ : lis la case « Même longueur ? » de la figure.';
              }
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="construire-image-point"
              variant="new"
              lead="Voilà comment on pose une image, à coup sûr."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Un point, c’est fait. Et une figure qui a trois, quatre ou cinq sommets ? C’est le
              module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le trajet d’un seul point"
      moduleSubtitle="Trois choses doivent coïncider, pas deux"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Un point, une consigne',
        tone: 'indigo',
        body: (
          <>
            Plus de figure : un seul point M, et une flèche grise qui donne le trajet à refaire.{' '}
            <strong>Où faut-il poser son image ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Attrape la pastille violette et pose-la sur un nœud du quadrillage.{' '}
            <Compass className="inline h-4 w-4" aria-hidden="true" /> Les trois cases du bas te
            disent ce qui coïncide — sans jamais te donner l’arrivée.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
