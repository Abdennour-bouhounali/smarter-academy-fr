import React, { useState } from 'react';
import { Ruler, Lock } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InvariantsLab from '../components/InvariantsLab';
import { QUAD_M4, enCarreaux, invariants, translater, glissement } from '../components/translation4e';
import { polygonArea, sideLengths, interiorAngles } from '../../../../../common/utils/geometry2d';

/**
 * Module 4 — MANIPULATION : ce que le glissement conserve, MESURÉ.
 *
 * Activity              envoyer la copie n'importe où, et regarder un tableau
 *                       de quatre grandeurs refuser de bouger.
 * Mathematical objective une translation conserve les longueurs, les angles,
 *                       le parallélisme et les aires. Seule la POSITION change.
 * Student action        tirer la flèche du glissement — le même geste qu'au
 *                       module 1, avec une autre question.
 * Controlled variable   le glissement.
 * Mathematical state    (figure, glissement) ; les huit nombres du tableau
 *                       sont RECALCULÉS sur les points dessinés à chaque
 *                       rendu, des deux côtés.
 * Visual consequence    les deux colonnes de nombres restent identiques,
 *                       quelle que soit la position de la copie.
 * Expected observation  « je peux l'envoyer où je veux, les nombres ne
 *                       bougent pas ».
 * Misconception targeted croire qu'une figure plus loin est plus petite, ou
 *                       que son aire dépend de l'endroit ; croire que ces
 *                       conservations suffisent à reconnaître une translation
 *                       — c'est faux, et l'étape 4 le dit.
 * Formalization         la règle à l'étape 3, la carte mémo à l'étape 4,
 *                       après que le tableau a été éprouvé plusieurs fois.
 *
 * LA FIGURE EST SCALÈNE À DESSEIN : quatre côtés de longueurs deux à deux
 * différentes, aucun angle droit. Sur un carré, « les longueurs sont
 * conservées » serait vrai par accident à la moindre erreur ; ici, la moindre
 * déformation se lirait dans les nombres.
 */
const ORIGINE = { x: 100, y: 130 };
const COTES = sideLengths(QUAD_M4);
const ANGLES = interiorAngles(QUAD_M4);
const AIRE = polygonArea(QUAD_M4) / 1600;

export default function Module04CeQueLeGlissementGarde() {
  const [pointe, setPointe] = useState({ x: ORIGINE.x + 280, y: ORIGINE.y - 80 });
  const [vus, setVus] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const noter = (p) => {
    setPointe(p);
    setVus((v) => (v.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 120) ? v : [...v, p]));
  };

  // Trois positions bien distinctes : une seule ne prouverait rien d'un
  // invariant. C'est la RÉPÉTITION qui fait la conviction.
  const done1 = vus.length >= 3;

  const lab = (
    <InvariantsLab
      figure={QUAD_M4}
      pointe={pointe}
      onPointe={noter}
      origine={ORIGINE}
      nomsSommets={['A', 'B', 'C', 'D']}
      ariaLabel="Mesurer les deux figures"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Envoie la copie où tu veux',
      subtitle: 'Trois positions bien différentes, et surveille le tableau.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de bouger : quand la copie s’éloigne, que devient son aire, à ton avis ?"
            options={[
              { id: 'plus-petite', label: 'Elle devient plus petite' },
              { id: 'pareille', label: 'Elle reste la même' },
              { id: 'depend', label: 'Ça dépend de la direction' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              Encore {3 - vus.length} position{3 - vus.length > 1 ? 's' : ''} bien différente
              {3 - vus.length > 1 ? 's' : ''} : très loin, tout près, de l’autre côté.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Les quatre lignes du tableau n’ont pas bougé d’un centième. La copie a changé de{' '}
              <strong>place</strong>, et de rien d’autre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lire une longueur sans la mesurer',
      done: q2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={`Sur le quadrilatère de départ, le côté [AB] mesure ${enCarreaux(COTES[0])} carreaux. Combien mesure [A’B’] ?`}
            expected={enCarreaux(COTES[0])}
            suffix="carreaux"
            requires={['construire-image-figure']}
            explain={`${enCarreaux(COTES[0])} carreaux : le tableau l’affiche des deux côtés, et il ne bouge pas quand tu déplaces la copie.`}
            explainFor={(n) => {
              if (n === 0) return 'Le côté existe toujours sur la copie : la figure a été déplacée, pas effacée.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Même chose pour l’aire : elle vaut {AIRE} carreaux sur la figure, donc{' '}
              {AIRE} carreaux sur la copie.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qu’est-ce qui ne change jamais ?',
      done: q3,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="D’après le tableau, qu’est-ce qu’une translation change ?"
            options={[
              'Seulement la position de la figure',
              'La position et la taille de la figure',
              'La position et la forme de la figure',
              'Rien du tout',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'construire-image-figure']}
            explain="Les longueurs, les angles, le parallélisme et l’aire sont tous conservés. Il ne reste que la position : la copie est superposable à la figure de départ."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="invariants-translation"
              variant="new"
              lead="Voilà ce que le tableau refusait de faire bouger."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Attention au piège',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Sur un dessin, une figure et sa copie ont exactement les mêmes longueurs, les mêmes angles et la même aire. Peut-on en conclure que c’est une translation ?"
            options={[
              'Non : le demi-tour de 5e conserve exactement les mêmes choses',
              'Oui : ce sont précisément les propriétés d’une translation',
              'Oui, à condition que la copie soit plus à droite',
              'Non, il faudrait aussi que le périmètre soit conservé',
            ]}
            correct={0}
            cols={1}
            requires={['invariants-translation', 'invariants-symetrie']}
            explain="Ces quatre conservations ne distinguent pas les deux gestes : le demi-tour les a toutes aussi. Ce qui les sépare, ce sont les TRAJETS — parallèles pour la translation, concourants pour le demi-tour."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-invariants-translation"
              variant="new"
              lead="Quatre mots à garder en tête pour les exercices."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Reste une question : quel <strong>quadrilatère</strong> un glissement fabrique-t-il,
              au juste ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Ce que le glissement garde"
      moduleSubtitle="Quatre grandeurs qui refusent de bouger"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Deux figures, un tableau',
        tone: 'indigo',
        body: (
          <>
            Le tableau du bas mesure quatre grandeurs, sur la figure ET sur sa copie.{' '}
            <strong>Y en a-t-il une que tu peux faire changer ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Tire la flèche et envoie la copie loin, très loin.{' '}
            <Lock className="inline h-4 w-4" aria-hidden="true" /> Les nombres du tableau sont
            recalculés à chaque instant sur les deux figures dessinées.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
