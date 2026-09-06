import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LinkedTableChart from '../components/LinkedTableChart';
import BarChart from '../components/BarChart';
import { METEO, METEO_VIDE, JOURS, TEMPERATURES } from '../components/meteoData';
import { withValue, makeSeries } from '../components/chartUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : « Tableau et graphique liés ».
 *
 * Une seule donnée, deux rendus (LinkedTableChart) : l'élève règle une
 * hauteur au doigt ou tape −/+ dans la case, et l'AUTRE représentation
 * bouge. C'est le cœur de la leçon.
 *
 * Étape 1 (TRY, guidée) : une seule barre est réglable, avec une cible en
 * pointillés — le geste ne peut pas être manqué.
 * Étape 2 (CHALLENGE) : tout le graphique à construire depuis le tableau.
 * Étape 3 : le sens inverse — on modifie la donnée, que devient l'image ?
 *
 * Complétion sur le VRAI but : la série doit égaler la série cible, pas
 * « avoir bougé ». Jamais bloquant : l'écart restant est quantifié à chaque
 * instant, et l'élève peut toujours continuer à ajuster.
 */
const TARGET_INDEX = 3; // jeudi, la plus haute

/**
 * Échelle FIGÉE pendant la construction. Sans ce plancher, l'axe se
 * recalculerait à partir des valeurs courantes : une série à zéro donnerait
 * un plafond de 5, et l'élève ne pourrait jamais amener une barre à 24 —
 * la cible serait hors de la grille (playbook §10.6). L'axe reste donc
 * gradué jusqu'à 25 du début à la fin.
 */
const AXIS_FLOOR = 25;

export default function Module03TableauGraphique() {
  // Étape 1 : une seule barre à régler, les autres déjà posées.
  const [guided, setGuided] = useState(
    makeSeries({ categories: JOURS, values: [16, 11, 17, 0, 20], unit: '°C', label: 'Température à midi' }),
  );
  const [guidedDone, setGuidedDone] = useState(false);

  // Étape 2 : tout construire depuis le tableau.
  const [built, setBuilt] = useState(METEO_VIDE);
  const [builtDone, setBuiltDone] = useState(false);

  const [inverseDone, setInverseDone] = useState(false);

  const guidedOk = guided.values[TARGET_INDEX] === TEMPERATURES[TARGET_INDEX];
  const missing = JOURS.map((j, i) => ({ j, gap: TEMPERATURES[i] - built.values[i] })).filter((x) => x.gap !== 0);

  const handleGuided = (i, v) => {
    if (i !== TARGET_INDEX || guidedDone) return;
    const next = withValue(guided, i, v);
    setGuided(next);
    if (next.values[TARGET_INDEX] === TEMPERATURES[TARGET_INDEX]) setGuidedDone(true);
  };

  const handleBuilt = (i, v) => {
    if (builtDone) return;
    const next = withValue(built, i, v);
    setBuilt(next);
    if (next.values.every((x, k) => x === TEMPERATURES[k])) setBuiltDone(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Tableau et graphique liés"
      moduleSubtitle="Tire une barre, la case change. Change la case, la barre bouge."
      estimatedTime="13 min"
      brief={{
        tag: '📊 Mission 03',
        title: 'Ce ne sont pas deux dessins. C’est la même donnée, deux fois.',
        body: (
          <p>
            Le tableau et le diagramme que tu vas manipuler lisent les mêmes nombres. Touche l'un, regarde
            l'autre : ils ne peuvent pas se contredire.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Règle la barre du jeudi',
          done: guidedDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le relevé du jeudi est <strong>24 °C</strong>. Fais monter sa barre jusqu'au trait ambre — au
                doigt sur le graphique, ou avec les boutons − / + du tableau.
              </p>
              <LinkedTableChart
                series={guided}
                onChange={(i, v) => {
                  handleGuided(i, v);
                  if (i === TARGET_INDEX && v === TEMPERATURES[TARGET_INDEX] && !guidedDone) kit.react(true);
                }}
                editableIndex={TARGET_INDEX}
                target={{ index: TARGET_INDEX, value: TEMPERATURES[TARGET_INDEX] }}
                tone="emerald"
                title="Température à midi (°C)"
                axisLabel="°C"
                tableCaption="Le tableau bouge en même temps que la barre"
                disabled={guidedDone}
                step={1}
                axisFloor={AXIS_FLOOR}
              />
              {!guidedDone && (
                <Feedback tone="info">
                  Jeudi vaut actuellement <strong>{guided.values[TARGET_INDEX]} °C</strong> — il en manque{' '}
                  <strong>{TEMPERATURES[TARGET_INDEX] - guided.values[TARGET_INDEX]}</strong> pour atteindre la
                  cible.
                </Feedback>
              )}
              {guidedDone && (
                <>
                  <Feedback tone="ok">
                    La barre est montée ET la case du tableau affiche 24 °C. Tu n'as pourtant touché qu'une seule
                    chose.
                  </Feedback>
                  <KnowledgeBrick
                    id="hauteur-est-nombre"
                    variant="new"
                    lead="Un seul geste, deux choses qui bougent : ce n’est pas une coïncidence."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Construis tout le graphique',
          done: builtDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici les relevés de la semaine :{' '}
                <strong className="font-mono">{TEMPERATURES.map((t, i) => `${JOURS[i]} ${t}`).join(' · ')}</strong>{' '}
                (en °C). Règle chaque barre à sa valeur.
              </p>
              <LinkedTableChart
                series={built}
                onChange={(i, v) => {
                  handleBuilt(i, v);
                  const next = withValue(built, i, v);
                  if (next.values.every((x, k) => x === TEMPERATURES[k]) && !builtDone) kit.react(true);
                }}
                tone="emerald"
                title="Ta semaine météo (°C)"
                axisLabel="°C"
                tableCaption="Tes valeurs"
                disabled={builtDone}
                step={1}
                axisFloor={AXIS_FLOOR}
              />
              {!builtDone && missing.length > 0 && (
                <Feedback tone="info">
                  Encore à ajuster :{' '}
                  <strong>
                    {missing.map((x) => `${x.j} (${x.gap > 0 ? '+' : ''}${x.gap})`).join(', ')}
                  </strong>
                  . Un nombre positif signifie qu'il faut monter la barre.
                </Feedback>
              )}
              {builtDone && (
                <Feedback tone="ok">
                  Graphique construit ! Passer d'un tableau à un diagramme, c'est traduire chaque nombre en une
                  hauteur — rien de plus.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et dans l’autre sens ?',
          done: inverseDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                On corrige le relevé du mardi : il ne faisait pas 11 °C mais <strong>19 °C</strong>. On ne
                touche qu'à la case du tableau.
              </p>
              <BarChart
                series={withValue(METEO, 1, 19)}
                title="Après correction du mardi (°C)"
                axisLabel="°C"
                tone="emerald"
              />
              <TapQuestion
                prompt="Qu’arrive-t-il au graphique ?"
                options={[
                  'Rien : le graphique est un dessin séparé',
                  'La barre du mardi monte, et le mardi n’est plus le jour le plus froid',
                  'Toutes les barres changent',
                ]}
                correct={1}
                cols={1}
                explain="Modifier une donnée modifie sa barre — et seulement la sienne. Ici, mardi passe de 11 à 19 °C : sa barre n’est plus la plus courte, c’est désormais celle du lundi avec 16 °C."
                explainWrong="Le graphique n’est pas un dessin indépendant : il lit le tableau. Une seule case modifiée fait bouger une seule barre — mais cela peut changer quelle barre est la plus haute ou la plus courte."
                requires={['hauteur-est-nombre']}
                solved={inverseDone}
                onAnswered={() => setInverseDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={3}>
            <strong>La suite.</strong> Tu sais traduire un tableau en hauteurs, et l'inverse. Au prochain
            module, on ne construit plus : on compare, et on repère les extrêmes.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Link2 className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Change l'un, l'autre suit — toujours.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
