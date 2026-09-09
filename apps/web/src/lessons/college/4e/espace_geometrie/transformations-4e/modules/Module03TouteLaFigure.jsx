import React, { useState } from 'react';
import { Shapes, Repeat } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FigureLab from '../components/FigureLab';
import {
  TRIANGLE_M3, GLISSEMENTS, translater, enCarreaux,
} from '../components/translation4e';
import { sideLengths, dist } from '../../../../../common/utils/geometry2d';

/**
 * Module 3 — MANIPULATION : l'image d'une figure entière.
 *
 * Activity              poser les trois sommets images du triangle, un par un.
 * Mathematical objective l'image d'une figure EST l'image de chacun de ses
 *                       sommets — il n'y a rien de neuf à apprendre après le
 *                       module 2, seulement à répéter.
 * Student action        glisser les trois pastilles sur le quadrillage.
 * Controlled variable   la position de chaque sommet image.
 * Mathematical state    (figure, sommets posés) ; les verdicts et le polygone
 *                       image en sont DÉRIVÉS.
 * Visual consequence    le polygone image n'apparaît QU'AU dernier sommet
 *                       juste : tant qu'il en manque un, il n'y a pas de
 *                       figure — on ne peut donc pas croire l'avoir « à peu
 *                       près » construite.
 * Expected observation  « c'est trois fois le même geste ».
 * Misconception targeted croire qu'il faut déplacer tous les points de la
 *                       figure, ou relier les images dans un autre ordre.
 * Formalization         la méthode à l'étape 3, après les trois sommets ;
 *                       l'étape 4 s'en sert pour DÉDUIRE une longueur sans la
 *                       mesurer — le premier usage vraiment économique de la
 *                       leçon.
 *
 * ATTEIGNABILITÉ : le glissement est un multiple entier du pas, donc chaque
 * sommet image tombe sur un nœud du quadrillage, et le laboratoire aimante.
 * `parcours.test.js` le vérifie sommet par sommet.
 */
const G = GLISSEMENTS.m3;
const NOMS = ['A', 'B', 'C'];
const CIBLES = translater(TRIANGLE_M3, G);
const COTES = sideLengths(TRIANGLE_M3);

export default function Module03TouteLaFigure() {
  // On démarre les trois pastilles ALIGNÉES en haut à droite, loin de la
  // figure : aucune n'est déjà « presque » à sa place.
  const [sommets, setSommets] = useState([
    { x: 600, y: 80 }, { x: 680, y: 80 }, { x: 640, y: 160 },
  ]);
  const [pred, setPred] = useState(null);
  const [essais, setEssais] = useState(0);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const poser = (i, p) => {
    setSommets((s) => s.map((q, j) => (j === i ? p : q)));
    setEssais((n) => n + 1);
  };

  const justes = sommets.map((p, i) => dist(p, CIBLES[i]) <= 8);
  const nbJustes = justes.filter(Boolean).length;
  const done1 = nbJustes === 3;
  const aide = essais >= 10 && !done1;

  const lab = (
    <FigureLab
      figure={TRIANGLE_M3}
      g={G}
      sommets={sommets}
      onSommet={poser}
      nomsSommets={NOMS}
      montrerSolution={aide}
      ariaLabel="Construire l’image du triangle"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Pose les trois sommets',
      subtitle: 'Le même trajet que tout à l’heure, mais trois fois — une fois par sommet.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de commencer : combien de points penses-tu devoir déplacer pour obtenir l’image du triangle ?"
            options={[
              { id: 'trois', label: 'Les 3 sommets' },
              { id: 'tous', label: 'Tous les points des côtés' },
              { id: 'un', label: 'Un seul, et le reste suit' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && !aide && (
            <Feedback tone="info">
              {nbJustes === 0 && 'Commence par A’ : repars de A et refais le trajet de la flèche grise.'}
              {nbJustes === 1 && 'Un sommet est en place. Le geste est exactement le même pour les deux autres.'}
              {nbJustes === 2 && 'Plus qu’un. Le triangle image apparaîtra quand il sera posé.'}
            </Feedback>
          )}
          {aide && (
            <Feedback tone="info">
              Les cercles verts indiquent les arrivées. Compte : {enCarreaux(Math.abs(G.dx))} carreaux
              vers la droite et {enCarreaux(Math.abs(G.dy))} vers le haut, depuis chaque sommet.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Le triangle image est tracé. Tu n’as rien appris de neuf : tu as fait{' '}
              <strong>trois fois</strong> le geste du module précédent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et les points du milieu des côtés ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Tu n’as déplacé que les trois sommets. Que sont devenus les points situés au milieu des côtés ?"
            options={[
              'Ils ont glissé eux aussi : ils sont sur les côtés de l’image',
              'Ils sont restés sur place, seuls les sommets ont bougé',
              'Il faudrait les construire un par un, mais on ne le fait pas',
            ]}
            correct={0}
            cols={1}
            requires={['translation', 'construire-image-point']}
            explain="La translation déplace TOUS les points du plan, pas seulement ceux qu’on dessine. Les sommets suffisent parce que les côtés sont des segments : une fois les extrémités placées, le segment entre elles est l’image du segment de départ."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="construire-image-figure"
              variant="new"
              lead="Trois sommets ont suffi — voilà pourquoi."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Déduire sans mesurer',
      done: q4,
      content: (
        <div className="space-y-3">
          {lab}
          <NumericQuestion
            prompt={`Sur le triangle de départ, le côté [AB] mesure ${enCarreaux(COTES[0])} carreaux. Combien mesure [A’B’] sur l’image ?`}
            expected={enCarreaux(COTES[0])}
            suffix="carreaux"
            requires={['construire-image-figure']}
            explain={`${enCarreaux(COTES[0])} carreaux également. La figure a glissé sans se déformer : ses côtés gardent exactement leur longueur, et on n’a pas besoin de mesurer l’image pour le savoir.`}
            explainFor={(n) => {
              if (n === enCarreaux(G.longueur) || n === enCarreaux(Math.abs(G.dx))) {
                return 'Attention : ce nombre-là décrit le GLISSEMENT (de combien la figure s’est déplacée), pas le côté du triangle. Le côté, lui, n’a pas changé.';
              }
              if (n === enCarreaux(COTES[0]) * 2) {
                return 'La figure n’a pas été agrandie, seulement déplacée. Son côté garde la même longueur.';
              }
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu viens de donner une longueur <strong>sans mesurer l’image</strong>. Qu’est-ce qui,
              exactement, se conserve comme ça ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Toute la figure d’un coup"
      moduleSubtitle="Trois sommets, trois fois le même geste"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Un triangle à recopier',
        tone: 'indigo',
        body: (
          <>
            Un triangle, et le même trajet à refaire. <strong>Combien de points faut-il
            vraiment déplacer</strong> pour obtenir toute son image ?
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Shapes className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Trois pastilles à poser. <Repeat className="inline h-4 w-4" aria-hidden="true" /> Le
            triangle image n’apparaîtra qu’une fois les <strong>trois</strong> sommets bien placés.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
