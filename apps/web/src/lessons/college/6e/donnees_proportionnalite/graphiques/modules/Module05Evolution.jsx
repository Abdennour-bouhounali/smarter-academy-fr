import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { METEO, JOURS } from '../components/meteoData';
import { allVariations, makeSeries } from '../components/chartUtils';

/**
 * Module 5 — FORMALISATION : lire une ÉVOLUTION.
 *
 * On relie les points : apparaît alors ce que des barres isolées montrent
 * mal — le sens de variation d'un relevé au suivant. Le « À retenir » de la
 * leçon se construit ici, à partir des gestes des modules 1 à 4.
 *
 * DEUX DISTINCTIONS DIFFICILES, traitées explicitement :
 *  1. « la valeur la plus haute » ≠ « la plus forte hausse » (jeudi est le
 *     maximum ; la plus forte montée est mercredi → jeudi, +7) ;
 *  2. une baisse reste une baisse même quand la valeur reste grande
 *     (jeudi → vendredi : 24 → 20, ça descend alors que 20 est élevé).
 *
 * Le module se clôt par une interprétation en contexte : une courbe raconte
 * une histoire, mais elle ne dit pas POURQUOI.
 */
const VARS = allVariations(METEO);
// [baisse -5, hausse +6, hausse +7, baisse -4]
const BIGGEST_RISE = 2; // index dans VARS → Mer → Jeu

const CROISSANTE = makeSeries({
  categories: ['S1', 'S2', 'S3', 'S4'],
  values: [4, 7, 11, 16],
  unit: 'cm',
  label: 'Hauteur du plant',
});

export default function Module05Evolution() {
  const [relierDone, setRelierDone] = useState(false);
  const [sensDone, setSensDone] = useState(false);
  const [hausseDone, setHausseDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Ça monte, ça descend"
      moduleSubtitle="Relier les points fait apparaître une histoire : l’évolution."
      estimatedTime="11 min"
      brief={{
        tag: '📊 Mission 05',
        title: 'La semaine météo raconte quelque chose. Écoute-la.',
        body: (
          <p>
            Quand les catégories se suivent dans le temps, on peut relier les points. La ligne obtenue montre
            d'un trait ce qui monte et ce qui descend.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Des barres à la ligne',
          done: relierDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Les mêmes températures, en barres puis en points reliés.</p>
              <BarChart series={METEO} title="En barres" axisLabel="°C" tone="amber" />
              <LineChart series={METEO} title="En points reliés" axisLabel="°C" colorByVariation />
              <TapQuestion
                prompt="Que montre la ligne que les barres montraient moins bien ?"
                options={[
                  'Les valeurs exactes de chaque jour',
                  'Le mouvement d’un jour au suivant : ce qui monte et ce qui descend',
                  'Le nombre total de jours',
                ]}
                correct={1}
                cols={1}
                explain="Les deux graphiques contiennent exactement les mêmes nombres. Mais relier les points dessine le MOUVEMENT : on voit la chute du lundi au mardi, puis la remontée."
                requires={['hauteur-est-nombre', 'graphique-outil']}
                solved={relierDone}
                onAnswered={() => setRelierDone(true)}
              />
              {relierDone && (
                <KnowledgeBrick
                  id="evolution-hausse-baisse"
                  variant="new"
                  lead="Ce mouvement que la ligne rend visible se décrit avec deux mots."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Monte ou descend ?',
          done: sensDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Pour chaque passage d'un jour au suivant, dis le sens.</p>
                  <LineChart series={METEO} title="Température à midi (°C)" axisLabel="°C" colorByVariation />
                </div>
              }
              rows={[
                { id: 'v1', label: 'Lundi → Mardi', options: ['↗ hausse', '↘ baisse'], correct: 1 },
                { id: 'v2', label: 'Mardi → Mercredi', options: ['↗ hausse', '↘ baisse'], correct: 0 },
                { id: 'v3', label: 'Mercredi → Jeudi', options: ['↗ hausse', '↘ baisse'], correct: 0 },
                { id: 'v4', label: 'Jeudi → Vendredi', options: ['↗ hausse', '↘ baisse'], correct: 1 },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {nCorrect}/{total}.{' '}
                  {VARS.map((v, i) => `${JOURS[i]}→${JOURS[i + 1]} : ${v.delta > 0 ? '+' : ''}${v.delta}`).join(' · ')}.
                  Attention au dernier : 20 °C reste une température élevée, et pourtant c'est bien une{' '}
                  <strong>baisse</strong> — on compare toujours à la valeur PRÉCÉDENTE.
                </Feedback>
              )}
              requires={['evolution-hausse-baisse', 'comparer-entiers']}
              solved={sensDone}
              onAnswered={() => setSensDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'La plus forte montée',
          done: hausseDone,
          content: (
            <div className="space-y-3">
              <LineChart
                series={METEO}
                title="Température à midi (°C)"
                axisLabel="°C"
                colorByVariation
                highlightIndex={hausseDone ? 3 : null}
              />
              {/* La distinction est posée AVANT la question : sans elle, l'élève
                  peut confondre « le jour le plus chaud » et « la plus forte
                  montée », qui coïncident ici et le tromperaient ailleurs. */}
              <KnowledgeBrick
                id="hauteur-vs-pente"
                variant="new"
                lead="Sur cette ligne, deux choses se lisent — et ce ne sont pas les mêmes."
              />
              <TapQuestion
                prompt="Entre quels jours la température a-t-elle le plus augmenté ?"
                options={['Mardi → Mercredi (+6)', 'Mercredi → Jeudi (+7)', 'Jeudi → Vendredi']}
                correct={1}
                cols={1}
                explain={`De mercredi à jeudi : +${VARS[BIGGEST_RISE].delta} °C, c’est le segment le plus raide. Remarque bien : le jeudi est le jour le plus CHAUD, et c’est aussi là qu’arrive la plus forte hausse — mais ce sont deux questions différentes.`}
                explainWrong={`Mardi → mercredi monte de ${VARS[1].delta} °C, mercredi → jeudi de ${VARS[BIGGEST_RISE].delta} °C : c’est ce second saut le plus grand. Jeudi → vendredi descend, ce n’est pas une hausse du tout.`}
                requires={['hauteur-vs-pente', 'evolution-hausse-baisse', 'ecart-chiffre']}
                solved={hausseDone}
                onAnswered={() => setHausseDone(true)}
              />
              {hausseDone && (
                <Feedback tone="info">
                  Une valeur haute et une forte hausse ne sont pas la même chose : la première se lit sur la
                  <strong> hauteur d'un point</strong>, la seconde sur la <strong>pente d'un segment</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Interpréter, sans inventer',
          done: interpDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                On a mesuré chaque semaine la hauteur d'un plant de haricot.
              </p>
              <LineChart series={CROISSANTE} title="Hauteur du plant (cm)" axisLabel="cm" colorByVariation />
              <KnowledgeBrick
                id="interpreter-sans-inventer"
                variant="new"
                lead="Avant de répondre, une limite qu’on oublie souvent."
              />
              <TapQuestion
                prompt="Que peut-on affirmer À COUP SÛR d’après ce graphique ?"
                options={[
                  'Le plant a grandi chaque semaine',
                  'Le plant a été bien arrosé',
                  'Le plant mesurera 20 cm la semaine prochaine',
                ]}
                correct={0}
                cols={1}
                explain="La ligne monte à chaque étape : la croissance est certaine, elle est mesurée. En revanche l’arrosage n’est pas dans les données, et l’avenir n’y est pas non plus — un graphique dit ce qui a été relevé, pas la cause ni la suite."
                explainWrong="Un graphique ne montre que ce qui a été MESURÉ. L’arrosage n’a pas été relevé, et la semaine prochaine n’existe pas encore sur le dessin. Seule la croissance semaine après semaine est lisible."
                requires={['interpreter-sans-inventer', 'evolution-hausse-baisse']}
                solved={interpDone}
                onAnswered={() => setInterpDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={5}>
            <strong>La suite.</strong> Tu sais faire parler une ligne — et t'arrêter là où les données
            s'arrêtent. Au prochain module, trois graphiques essaieront de te mentir.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <TrendingUp className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Un graphique raconte ce qui a été mesuré — jamais pourquoi, jamais la suite. Et parfois, il
              raconte même n'importe quoi : c'est le prochain module.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
