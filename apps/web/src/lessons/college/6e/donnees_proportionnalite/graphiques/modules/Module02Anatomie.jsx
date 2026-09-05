import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import { METEO, JOURS } from '../components/meteoData';
import { makeSeries, parseDec, formatDec } from '../components/chartUtils';

/**
 * Module 2 — DÉCOUVERTE : de quoi une barre est-elle faite ?
 *
 * Le vocabulaire arrive après le geste du module 1. Trois idées, dans cet
 * ordre :
 *  1. sans axe gradué ni titre, une barre ne dit RIEN (on montre le même
 *     dessin dépouillé : impossible d'en tirer une valeur) ;
 *  2. lire une valeur, c'est projeter le sommet d'une barre sur l'axe ;
 *  3. lire ENTRE deux graduations (le sommet à mi-chemin entre 15 et 20)
 *     — c'est le point dur de la lecture graphique en 6e.
 */
const SANS_REPERES = makeSeries({
  categories: ['?', '?', '?', '?'],
  values: [16, 11, 17, 24],
  unit: null,
});

const LECTURE = makeSeries({
  categories: ['A', 'B', 'C'],
  values: [10, 25, 15],
  unit: '€',
  label: 'Prix',
});

export default function Module02Anatomie() {
  const [sansDone, setSansDone] = useState(false);
  const [elementsDone, setElementsDone] = useState(false);
  const [lireDone, setLireDone] = useState(false);
  const [entreDone, setEntreDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Anatomie d'un graphique"
      moduleSubtitle="Axes, graduations, titre, unités : sans eux, une barre ne dit rien."
      estimatedTime="10 min"
      brief={{
        tag: '📊 Mission 02',
        title: 'Une barre haute… haute de combien, au juste ?',
        body: (
          <p>
            Un graphique n'est pas qu'un dessin : c'est un dessin <strong>gradué</strong>. Enlève les
            graduations et il ne reste rien d'utilisable.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Un graphique sans repères',
          done: sansDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici un diagramme dont on a retiré le titre, les graduations et les étiquettes.
              </p>
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3">
                <svg viewBox="0 0 300 150" className="w-full max-w-sm mx-auto block" role="img" aria-label="Quatre barres sans axe gradué ni étiquette : aucune valeur n’est lisible">
                  {SANS_REPERES.values.map((v, i) => {
                    const h = (v / 25) * 110;
                    return <rect key={i} x={30 + i * 65} y={130 - h} width={38} height={h} rx="3" fill="#94a3b8" />;
                  })}
                  <line x1="20" y1="130" x2="285" y2="130" stroke="#334155" strokeWidth="1.5" />
                </svg>
              </div>
              <TapQuestion
                prompt="Quelle est la valeur de la deuxième barre ?"
                options={[
                  '11',
                  'Impossible à dire : il manque les graduations',
                  'La moitié de la plus grande',
                ]}
                correct={1}
                cols={1}
                explain="Sans axe gradué, on peut seulement comparer les hauteurs entre elles — jamais lire une valeur. Un graphique sans graduations n’est qu’un dessin."
                explainWrong="On voit bien que cette barre est la plus courte, mais AUCUN nombre n’est lisible : il n’y a ni axe gradué ni unité. Comparer, oui ; mesurer, non."
                solved={sansDone}
                onAnswered={() => setSansDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les éléments qui donnent le sens',
          done: elementsDone,
          content: (
            <div className="space-y-3">
              <BarChart series={METEO} title="Température à midi (°C)" axisLabel="°C" tone="sky" />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">À quoi sert chaque élément de ce graphique ?</p>}
                rows={[
                  { id: 'e1', label: 'L’axe vertical gradué', options: ['Donner les valeurs', 'Décorer'], correct: 0 },
                  { id: 'e2', label: 'Les étiquettes Lun, Mar…', options: ['Dire ce que chaque barre représente', 'Numéroter les barres'], correct: 0 },
                  { id: 'e3', label: 'Le titre et l’unité (°C)', options: ['Dire de quoi on parle', 'Faire joli'], correct: 0 },
                  { id: 'e4', label: 'La hauteur d’une barre', options: ['La valeur mesurée', 'Le nombre de jours'], correct: 0 },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {nCorrect}/{total}. Un graphique complet dit toujours quatre choses : de quoi on parle
                    (titre), dans quelle unité, ce que vaut chaque hauteur (axe gradué) et ce que représente
                    chaque barre (étiquettes).
                  </Feedback>
                )}
                solved={elementsDone}
                onAnswered={() => setElementsDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lire une valeur',
          done: lireDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche la barre du <strong>mercredi</strong>, puis lis sa hauteur sur l'axe.
              </p>
              <BarChart
                series={METEO}
                mode={lireDone ? 'display' : 'read'}
                selected={lireDone ? 2 : null}
                onSelect={(i) => {
                  const ok = i === 2;
                  kit.react(ok);
                  if (ok) setLireDone(true);
                }}
                title="Température à midi (°C)"
                axisLabel="°C"
                tone="sky"
              />
              {lireDone && (
                <Feedback tone="ok">
                  La barre du mercredi monte jusqu'à <strong>17 °C</strong>. Lire une valeur, c'est suivre le
                  sommet de la barre horizontalement jusqu'à l'axe gradué.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Entre deux graduations',
          done: entreDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Les graduations vont de 5 en 5. La barre B s'arrête exactement sur l'une d'elles — celle du
                milieu entre 20 et 30.
              </p>
              <BarChart series={LECTURE} title="Prix des articles (€)" axisLabel="€" tone="sky" />
              <NumericQuestion
                prompt="Combien coûte l’article B ?"
                suffix="€"
                expected={25}
                parse={parseDec}
                display={formatDec(25)}
                explain={<>La barre B atteint la graduation <strong>25 €</strong>.</>}
                explainFor={(n) =>
                  n === 20 || n === 30
                    ? 'Regarde bien : le sommet ne s’arrête ni sur 20 ni sur 30, mais sur la graduation qui se trouve entre les deux — 25.'
                    : 'Suis le sommet de la barre B horizontalement jusqu’à l’axe : il tombe sur une graduation précise.'
                }
                solved={entreDone}
                onAnswered={() => setEntreDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Ruler className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Titre, unité, axe gradué, étiquettes : quatre repères sans lesquels une barre n'est qu'un
            rectangle. Au prochain module, tu fabriques les barres toi-même.
          </p>
        </motion.div>
      }
    />
  );
}
