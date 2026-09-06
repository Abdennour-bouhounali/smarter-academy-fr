import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import { METEO, JOURS, TEMPERATURES } from '../components/meteoData';
import { maxIndex } from '../components/chartUtils';

/**
 * Module 1 — DÉCLENCHEUR.
 *
 * Même conflit cognitif que la leçon Tableaux, mais un cran plus loin : ici
 * les données sont DÉJÀ bien rangées dans un tableau. Le tableau a résolu le
 * problème du désordre ; il ne résout pas celui de la FORME générale.
 *
 * L'élève cherche « le jour le plus chaud » dans un tableau propre (il faut
 * comparer cinq nombres un par un), puis dans un diagramme (la plus haute
 * barre saute aux yeux, sans lire un seul nombre). Le graphique n'est donc
 * pas présenté comme une définition mais comme la réponse à une seconde
 * gêne — parfaitement distincte de celle du chapitre précédent.
 */
const HOT = maxIndex(METEO); // 3 → jeudi

export default function Module01DouzeNombres() {
  const [tableDone, setTableDone] = useState(false);
  const [chartDone, setChartDone] = useState(false);
  const [verdictDone, setVerdictDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Douze nombres ou une image"
      moduleSubtitle="Quel jour a-t-il fait le plus chaud ? Compte… ou regarde."
      estimatedTime="8 min"
      brief={{
        tag: '📊 Mission 01',
        title: 'Le tableau est impeccable. Et pourtant, il te fait travailler.',
        body: (
          <p>
            La station météo du collège a relevé la température de midi toute la semaine. Les données sont
            bien rangées — mais réponds vite à une question de forme.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Dans le tableau',
          done: tableDone,
          content: (
            <div className="space-y-3">
              <div className="w-full overflow-x-auto">
                <table className="border-collapse mx-auto text-sm">
                  <caption className="caption-top text-xs text-slate-500 mb-2">
                    Températures relevées à midi
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="bg-slate-700 text-white px-3 py-2 border border-slate-300">Jour</th>
                      {JOURS.map((j) => (
                        <th key={j} scope="col" className="bg-slate-700 text-white px-3 py-2 border border-slate-300">{j}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row" className="bg-slate-100 px-3 py-2 border border-slate-300 font-semibold text-left">
                        Température
                      </th>
                      {TEMPERATURES.map((t, i) => (
                        <td key={JOURS[i]} className="px-3 py-2 border border-slate-300 text-center font-mono">
                          {t} °C
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <TapQuestion
                prompt="Quelle est l’allure générale de la semaine ?"
                options={[
                  'Il a fait de plus en plus chaud, sans interruption',
                  'Ça a baissé, puis bien remonté, puis redescendu',
                  'La température n’a pratiquement pas bougé',
                ]}
                correct={1}
                cols={1}
                explain="16 → 11 → 17 → 24 → 20 : ça baisse, ça remonte fort, puis ça retombe un peu. Pour le voir, il a fallu comparer les nombres deux à deux — un vrai effort."
                explainWrong="Il fallait suivre les cinq nombres dans l’ordre : 16, puis 11 (ça baisse), puis 17 et 24 (ça remonte), puis 20 (ça redescend). Un tableau range bien, mais il ne montre pas la FORME."
                requires={['lire-tableau', 'comparer-entiers']}
                solved={tableDone}
                onAnswered={() => setTableDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'La même semaine, en image',
          done: chartDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Exactement les mêmes cinq nombres. On remplace chaque température par une barre de la hauteur
                correspondante.
              </p>
              <BarChart series={METEO} title="Température à midi (°C)" axisLabel="°C" tone="indigo" />
              <TapQuestion
                prompt="Quel jour a-t-il fait le plus chaud ?"
                options={JOURS}
                correct={HOT}
                cols={5}
                explain="Le jeudi — et tu l’as vu sans lire un seul nombre : c’est simplement la barre la plus haute."
                requires={['comparer-entiers']}
                solved={chartDone}
                onAnswered={() => setChartDone(true)}
              />
              {chartDone && (
                <>
                  <Feedback tone="info">
                    Aucun nombre n'a changé. Ce qui a changé, c'est que la <strong>hauteur</strong> se compare
                    d'un regard, alors que des nombres se comparent un par un.
                  </Feedback>
                  <KnowledgeBrick
                    id="graphique-outil"
                    variant="new"
                    lead="Tu as comparé cinq nombres un par un, puis tu as répondu sans en lire aucun."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Alors, à quoi sert un graphique ?',
          done: verdictDone,
          content: (
            <TapQuestion
              prompt="D’après ce que tu viens de vivre, que fait un graphique que le tableau ne fait pas ?"
              options={[
                'Il rend les nombres plus précis',
                'Il rend les comparaisons et l’allure visibles d’un coup d’œil',
                'Il remplace les nombres, qui deviennent inutiles',
              ]}
              correct={1}
              cols={1}
              explain="Le graphique ne remplace pas le tableau et ne rend rien plus précis — au contraire, on lit un nombre moins exactement sur un dessin. Ce qu’il apporte, c’est la comparaison immédiate et la forme générale."
              requires={['graphique-outil']}
              solved={verdictDone}
              onAnswered={() => setVerdictDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={1}>
            <strong>La suite.</strong> Tu sais ce qu'apporte un graphique. Reste à savoir de quoi une barre
            est faite — et pourquoi, sans son axe, elle ne dit rien.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Eye className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              L'un se lit, l'autre se regarde — et ce sont les mêmes nombres.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
