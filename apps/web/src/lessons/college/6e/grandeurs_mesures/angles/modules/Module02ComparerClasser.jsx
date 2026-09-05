import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AngleFigure from '../components/AngleFigure';
import { classify } from '../components/angleUtils';

/**
 * Module 2 — découverte : comparer par superposition, classer à l'équerre.
 *
 * La superposition (animée au tap) montre que l'ORIENTATION ne change rien.
 * L'équerre-témoin donne les trois classes. Le tri final remet le piège du
 * Module 1 sur la table : orientations ET longueurs de côtés variées.
 */
const PAIR = { a: 35, b: 65 };

const SUPER_Q = {
  q: 'Une fois les deux angles superposés (sommet sur sommet, un côté commun), lequel est le plus ouvert ?',
  options: ['Le bleu (35°)', 'Le violet (65°)', 'Impossible à dire, ils sont orientés différemment'],
  correct: 1,
  explain:
    'Superposés, le violet dépasse : il est plus ouvert. L’orientation dans laquelle un angle est dessiné ne change JAMAIS sa mesure — seule compte l’ouverture.',
};

const EQUERRE_Q = {
  q: 'On pose l’équerre (angle droit) sur cet angle : il est visiblement plus FERMÉ que l’équerre. Comment l’appelle-t-on ?',
  options: ['Un angle aigu', 'Un angle obtus', 'Un angle plat'],
  correct: 0,
  explain: 'Plus fermé que l’angle droit (90°) → angle AIGU. Plus ouvert → obtus. Et quand les deux côtés sont alignés (180°) → angle plat.',
};

// Vignettes volontairement variées : rotations ET longueurs de côtés.
const TRI_ITEMS = [
  { id: 't1', deg: 30, rotation: 0, rays: [45, 45] },
  { id: 't2', deg: 90, rotation: 25, rays: [95, 95] },
  { id: 't3', deg: 130, rotation: -15, rays: [55, 55] },
  { id: 't4', deg: 180, rotation: 10, rays: [90, 90] },
  { id: 't5', deg: 60, rotation: 140, rays: [100, 50] },
  { id: 't6', deg: 105, rotation: 200, rays: [50, 100] },
];
const CLASSES = ['aigu', 'droit', 'obtus', 'plat'];

export default function Module02ComparerClasser() {
  const [superposed, setSuperposed] = useState(false);
  const [superDone, setSuperDone] = useState(false);
  const [equerreDone, setEquerreDone] = useState(false);
  const [triDone, setTriDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Comparer et classer les angles"
      moduleSubtitle="Superposer pour comparer, l’équerre pour classer : aigu, droit, obtus, plat."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Deux angles dessinés dans tous les sens : lequel est le plus ouvert ?',
        body: <p>Avant de savoir mesurer, on sait déjà comparer — à condition de superposer, et de ne pas se laisser tromper par l'orientation.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Superpose pour comparer',
          done: superDone,
          content: (kit) => (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Ces deux angles sont dessinés dans des orientations différentes. Tape « Superposer » pour les
                ramener sommet sur sommet.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <AngleFigure
                    deg={PAIR.a}
                    rotation={superposed ? 0 : 35}
                    rayLengths={[85, 85]}
                    tone="sky"
                    size={190}
                    ariaLabel="Premier angle, bleu"
                  />
                  <p className="text-center text-xs text-slate-500">Angle bleu</p>
                </div>
                <div className="space-y-1">
                  <AngleFigure
                    deg={PAIR.b}
                    rotation={superposed ? 0 : -40}
                    rayLengths={[85, 85]}
                    tone="violet"
                    size={190}
                    ariaLabel="Second angle, violet"
                  />
                  <p className="text-center text-xs text-slate-500">Angle violet</p>
                </div>
              </div>
              {!superposed && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setSuperposed(true); kit.react(true); }}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Superposer ⇄
                  </button>
                </div>
              )}
              {superposed && (
                <TapQuestion
                  prompt={SUPER_Q.q}
                  options={SUPER_Q.options}
                  correct={SUPER_Q.correct}
                  cols={1}
                  explain={SUPER_Q.explain}
                  solved={superDone}
                  onAnswered={() => setSuperDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'L’équerre-témoin',
          done: equerreDone,
          content: (
            <TapQuestion
              above={
                <div className="grid grid-cols-2 gap-4" aria-hidden="true">
                  <div className="space-y-1">
                    <AngleFigure deg={90} rayLengths={[80, 80]} arcLabel="90°" tone="emerald" size={180} />
                    <p className="text-center text-xs text-slate-500">L’équerre (angle droit)</p>
                  </div>
                  <div className="space-y-1">
                    <AngleFigure deg={42} rayLengths={[80, 80]} arcLabel="?" tone="sky" size={180} />
                    <p className="text-center text-xs text-slate-500">L’angle à classer</p>
                  </div>
                </div>
              }
              prompt={EQUERRE_Q.q}
              options={EQUERRE_Q.options}
              correct={EQUERRE_Q.correct}
              cols={3}
              explain={EQUERRE_Q.explain}
              solved={equerreDone}
              onAnswered={() => setEquerreDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Classe-les tous',
          done: triDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Six angles, dessinés dans tous les sens et avec des côtés de longueurs très différentes. Classe
                  chacun — et rappelle-toi : ni l'orientation ni la longueur des côtés ne comptent.
                </p>
              }
              rows={TRI_ITEMS.map((it) => ({
                id: it.id,
                label: (
                  <AngleFigure
                    deg={it.deg}
                    rotation={it.rotation}
                    rayLengths={it.rays}
                    tone="sky"
                    size={110}
                    ariaLabel={`Angle à classer`}
                  />
                ),
                options: CLASSES,
                correct: CLASSES.indexOf(classify(it.deg)),
                correction: <>→ {classify(it.deg)}</>,
              }))}
              solved={triDone}
              onAnswered={() => setTriDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Le classement se fait à l'OUVERTURE : aigu &lt; 90° &lt; obtus, l'angle droit vaut exactement 90°
                  et l'angle plat 180° (côtés alignés).
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Shapes className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Aigu (&lt; 90°) · Droit (= 90°) · Obtus (&gt; 90°) · Plat (= 180°). L'orientation du dessin et la
            longueur des côtés ne changent jamais la classe.
          </p>
        </motion.div>
      }
    />
  );
}
