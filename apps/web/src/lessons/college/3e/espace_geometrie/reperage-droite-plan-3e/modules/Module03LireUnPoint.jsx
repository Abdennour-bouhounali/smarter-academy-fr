import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordPlane from '../../../../../common/components/CoordPlane';
import GuideReader from '../components/GuideReader';
import { PARC, formatCoords, lieuById, readCoords } from '../components/reperageUtils';

/**
 * Module 3 — DÉCOUVERTE : lire un point, en construisant la lecture.
 *
 * Activity              amener deux guides sur un lieu du parc.
 * Mathematical objective lire les coordonnées, c'est projeter le point sur les
 *                       deux axes — pas reconnaître une image.
 * Student action        régler le guide vertical puis le guide horizontal.
 * Controlled variable   la position de chaque guide.
 * Mathematical state    le couple porté par l'intersection des guides.
 * Visual consequence    quand les deux guides se croisent SUR le point, la
 *                       cible devient verte.
 * Expected observation  le guide vertical se lit sur l'axe horizontal, et
 *                       inversement — la source classique de confusion.
 * Misconception         lire (ordonnée ; abscisse), et oublier le signe pour
 *                       un point à gauche ou en dessous.
 * Feedback              la position atteinte est décrite en toutes lettres.
 * Formalization         l'étape 3 rassemble six lectures d'un coup, dont deux
 *                       points situés SUR un axe (coordonnée nulle).
 * Transfer              module 5 : lire deux points pour en tirer une longueur.
 */
const RANGE = PARC.range;

export default function Module03LireUnPoint() {
  const kiosque = lieuById('kiosque');
  const etang = lieuById('etang');

  const [g1, setG1] = useState({ x: 0, y: 0 });
  const done1 = g1.x === kiosque.x && g1.y === kiosque.y;

  const [g2, setG2] = useState({ x: 0, y: 0 });
  const done2 = g2.x === etang.x && g2.y === etang.y;

  const [batch, setBatch] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Viser le kiosque',
      subtitle: 'Amène les deux guides jusqu’à ce qu’ils se croisent sur 🎪.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <GuideReader
            point={{ ...kiosque, name: 'K' }}
            guide={g1}
            onGuideChange={(g) => {
              setG1(g);
              if (g.x === kiosque.x && g.y === kiosque.y) kit.react(true);
            }}
            range={RANGE}
            locked={done1}
            ariaLabel="Repère du parc : amène les guides sur le kiosque"
          />
          {done1 ? (
            <KnowledgeBrick
              id="lire-par-projection"
              variant="new"
              lead={`Le kiosque est en ${formatCoords(kiosque)} : il ${readCoords(kiosque)}. Voilà le geste que tu viens de faire, mis en mots.`}
            />
          ) : (
            <Feedback tone="info">
              Guides en {formatCoords(g1)}. Le guide vertical se règle sur l’axe horizontal, et le
              guide horizontal sur l’axe vertical.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux coordonnées négatives',
      subtitle: 'À toi de viser l’étang 🦆.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <GuideReader
            point={{ ...etang, name: 'E' }}
            guide={g2}
            onGuideChange={(g) => {
              setG2(g);
              if (g.x === etang.x && g.y === etang.y) kit.react(true);
            }}
            range={RANGE}
            locked={done2}
            ariaLabel="Repère du parc : amène les guides sur l’étang"
          />
          {done2 ? (
            <Feedback tone="ok">
              {formatCoords(etang)} : les deux coordonnées sont négatives. L’étang est à la fois à
              gauche et en dessous de la fontaine.
            </Feedback>
          ) : (
            <Feedback tone="info">Guides en {formatCoords(g2)}. Continue.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Toute la carte d’un coup',
      subtitle: 'Six lieux, six couples. Attention à ceux qui sont sur un axe.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Voici le parc complet. Deux lieux sont posés <em>sur</em> un axe, et la fontaine est
                pile au croisement : avant de lire, un mot sur ces cas-là.
              </p>
              <KnowledgeBrick
                id="origine-et-axes"
                variant="new"
                compact
                lead="Tes deux guides viennent de se croiser au centre à chaque départ : ce point-là a un nom."
              />
              <CarteDuParc />
            </div>
          }
          rows={[
            {
              id: 'manege', label: '🎠 Le manège',
              options: ['(4 ; 3)', '(3 ; 4)', '(−4 ; 3)'],
              correct: 0,
              correction: 'Le manège est à 4 vers la droite et 3 vers le haut : (4 ; 3). (3 ; 4) serait plus proche de l’axe vertical et plus haut.',
            },
            {
              id: 'entree', label: '🚪 L’entrée',
              options: ['(−3 ; 4)', '(3 ; −4)', '(4 ; −3)'],
              correct: 1,
              correction: 'À droite (abscisse +3) et en bas (ordonnée −4) : (3 ; −4).',
            },
            {
              id: 'arbre', label: '🌳 Le grand chêne',
              options: ['(0 ; −3)', '(−3 ; 0)', '(0 ; 3)'],
              correct: 0,
              correction: 'Le chêne est SUR l’axe vertical : son abscisse est 0. Il est 3 plus bas que la fontaine, d’où (0 ; −3).',
            },
            {
              id: 'fontaine', label: '⛲ La fontaine',
              options: ['(1 ; 1)', '(0 ; 0)', 'elle n’a pas de coordonnées'],
              correct: 1,
              correction: 'La fontaine est l’origine du repère : (0 ; 0). Elle a bien des coordonnées, toutes deux nulles.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Les quatre lectures sont justes, y compris les points situés sur un axe — c’est là qu’une coordonnée vaut 0.'
                : `${nCorrect} lecture(s) juste(s) sur ${total}. Relis chaque correction : commence toujours par l’axe horizontal.`}
            </Feedback>
          )}
          requires={['lire-par-projection', 'abscisse-ordonnee', 'origine-et-axes']}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire un point"
      moduleSubtitle="La lecture se construit avec deux guides"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Où est le kiosque ?',
        tone: 'emerald',
        body: (
          <p>
            Lire des coordonnées, ce n’est pas deviner : c’est <strong>projeter</strong> le point sur
            les deux axes. Deux guides vont te servir de règle.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 flex gap-3 items-start">
          <Crosshair className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Deux guides à faire coulisser : l’un est vertical, l’autre horizontal. Amène-les jusqu’à
            ce qu’ils se croisent <strong>exactement</strong> sur le lieu demandé.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais lire un point. Au module suivant, tu feras l’inverse :
          partir du couple pour retrouver l’endroit.
        </KnowledgeSnapshot>
      )}
    />
  );
}

/** La carte complète, purement visuelle. */
function CarteDuParc() {
  return (
    <div className="flex justify-center">
      <CoordPlane
        range={RANGE}
        points={PARC.lieux.map((l) => ({ id: l.id, name: l.emoji, x: l.x, y: l.y, color: '#0f172a' }))}
        caption={false}
        ariaLabel="Carte du parc avec les six lieux placés dans le repère"
      />
    </div>
  );
}
