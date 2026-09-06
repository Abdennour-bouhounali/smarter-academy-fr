import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import TruncatedLine from '../components/TruncatedLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEMPERATURE } from '../components/graphData';
import { relativeSpread } from '../components/graphUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « L'échelle qui change tout ».
 *
 * Activity: afficher la MÊME série à deux échelles et constater que les deux
 *   images ne racontent pas la même histoire.
 * Mathematical objective: l'échelle n'est pas un réglage de présentation ; elle
 *   décide de ce que le lecteur croit voir. Un axe qui part de 0 aplatit une
 *   petite variation ; un axe tronqué la dramatise.
 * Student action: basculer entre les deux échelles, puis lire une valeur.
 * Controlled variable: le choix de l'échelle (deux boutons).
 * Mathematical state: une série fixe ; `relativeSpread` mesure objectivement
 *   que la variation est petite (11 %) — l'argument n'est pas une impression.
 * Visual consequence: la courbe passe de presque plate à très pentue, sans
 *   qu'aucun nombre du tableau n'ait changé.
 * Expected observation: « les nombres sont les mêmes, l'impression est
 *   inverse ».
 * Misconception targeted: croire ce qu'on voit sans regarder les graduations ;
 *   et penser qu'un axe tronqué est forcément un mensonge (il est parfois
 *   utile — ce qui compte est de le signaler).
 * Feedback: la valeur lue est la même dans les deux cas, ce qui tranche.
 * Formalization: la règle « toujours regarder d'où part l'axe » est posée.
 * Scaffolding: bascule guidée → lecture chiffrée → jugement.
 * Transfer: le module 6 fait réparer un graphique tronqué non signalé.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   « échelle », « carreau » et « graduation » sont la CIBLE de la leçon (P2) :
 *   ils étaient exigés sans jamais être posés en position d'enseignement. Ils
 *   le sont maintenant par la brique `echelle-axe`, à l'instant où la bascule
 *   vient d'en montrer l'effet, et avant la première lecture chiffrée.
 *     étape 1  basculer, puis brique `echelle-axe`   → essai « combien vaut un carreau ? »
 *     étape 2  lire la même valeur dans les deux versions
 *     étape 3  la lecture faite, brique `axe-tronque` → le jugement devient légitime
 */

const SPREAD = relativeSpread(TEMPERATURE.rows.map((r) => r.y));

export default function Module02Echelle() {
  const [zoom, setZoom] = useState(false);
  const [seen, setSeen] = useState(() => new Set(['full']));
  const [readDone, setReadDone] = useState(false);
  const [judgeDone, setJudgeDone] = useState(false);
  const [carreauDone, setCarreauDone] = useState(false);

  const bothSeen = seen.has('full') && seen.has('zoom');
  const step1Done = bothSeen && carreauDone;

  const toggle = (z, kit) => {
    setZoom(z);
    setSeen((prev) => new Set(prev).add(z ? 'zoom' : 'full'));
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’échelle qui change tout"
      moduleSubtitle="Mêmes nombres, deux échelles, deux impressions opposées."
      estimatedTime="8 min"
      brief={{
        tag: '🌡️ Mission 02',
        title: 'La salle a-t-elle vraiment chauffé ?',
        tone: 'indigo',
        body: (
          <p>
            Quatre relevés de température, de 17,5 °C à 19,5 °C. Le même tableau va être
            dessiné de deux façons.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Regarde les deux versions',
          subtitle: 'Bascule d’une échelle à l’autre.',
          done: step1Done,
          content: (kit) => (
            <div className="space-y-3">
              <div className="flex gap-2">
                {[
                  { z: false, label: 'Axe partant de 0' },
                  { z: true, label: 'Axe partant de 17' },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => toggle(o.z, kit)}
                    aria-pressed={zoom === o.z}
                    className={`flex-1 min-h-[44px] rounded-xl border-2 font-semibold transition
                      focus-visible:ring-2 focus-visible:ring-blue-500
                      ${zoom === o.z ? 'bg-sky-600 border-sky-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-sky-400'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              {/* Un axe tronqué ne peut pas être un CoordPlane : celui-ci
                  dessine ses axes en 0 par construction. D'où le tracé dédié. */}
              <TruncatedLine
                rows={TEMPERATURE.rows}
                base={zoom ? 17 : 0}
                top={zoom ? 20 : 24}
                step={zoom ? 0.5 : 4}
                xLabel="h"
                yLabel="°C"
                ariaLabel={`Températures, axe vertical partant de ${zoom ? 17 : 0}`}
              />
              {!bothSeen && (
                <Feedback tone="info">Essaie aussi l’autre échelle avant de conclure.</Feedback>
              )}
              {bothSeen && (
                <KnowledgeBrick
                  id="echelle-axe"
                  variant="new"
                  lead={(
                    <>
                      Mêmes quatre nombres, deux images opposées. L’écart réel est de 2 °C, soit{' '}
                      <strong>{formatDec(Math.round(SPREAD * 100))} %</strong> de la température.
                      Ce qui a changé entre les deux boutons porte un nom.
                    </>
                  )}
                >
                  <TapQuestion
                    prompt="Sur la version qui part de 17, combien vaut un carreau vertical ?"
                    options={['0,5 °C', '1 °C', '4 °C', '17 °C']}
                    correct={0}
                    cols={2}
                    requires={['echelle-axe']}
                    explain="Les graduations vont de 0,5 en 0,5 : un carreau vaut 0,5 °C. Sur l’autre version il en vaut 4 — huit fois plus."
                    explainWrong="Compte l’écart entre deux graduations voisines de l’axe vertical."
                    solved={carreauDone}
                    onAnswered={() => setCarreauDone(true)}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Lis la même valeur',
          done: readDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Sur l’une ou l’autre version, quelle était la température à 3 h ?"
              expected={19}
              parse={parseDec}
              display={formatDec(19)}
              suffix="°C"
              explain="19 °C, dans les deux cas. L’échelle change l’allure de la courbe, jamais les nombres : c’est en lisant les graduations qu’on retrouve la vérité."
              explainFor={(n) => {
                if (n === 3) return 'Tu as donné l’heure. On demande la température, lue sur l’axe vertical.';
                if (n === 2) return 'Tu as peut-être lu un écart. On demande la valeur elle-même.';
                return null;
              }}
              requires={['echelle-axe']}
              solved={readDone}
              onAnswered={(ok) => { setReadDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Laquelle est honnête ?',
          done: judgeDone,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="axe-tronque"
                variant="new"
                lead="Tu viens de lire 19 °C dans les deux versions : les nombres n’ont pas bougé. C’est le départ de l’axe qui a tout changé."
              >
                <TapQuestion
                  prompt="Un journal veut titrer « la salle surchauffe ! ». Quelle version choisira-t-il, et est-ce honnête ?"
                  options={[
                    'Celle partant de 17 : ce n’est pas faux, mais c’est trompeur si l’axe n’est pas signalé',
                    'Celle partant de 0 : elle exagère la hausse',
                    'Les deux disent exactement la même chose',
                    'Aucune des deux ne permet de conclure',
                  ]}
                  correct={0}
                  cols={1}
                  requires={['axe-tronque', 'echelle-axe']}
                  explain="Le journal choisira la version tronquée : elle grossit l’écart sans inventer un chiffre. Signalée, elle est honnête ; muette, elle fait croire à une explosion là où il y a 2 °C."
                  explainWrong="La version partant de 0 est celle qui aplatit. C’est l’axe tronqué qui rend la variation spectaculaire."
                  solved={judgeDone}
                  onAnswered={() => setJudgeDone(true)}
                />
              </KnowledgeBrick>
              {judgeDone && <KnowledgeBrick id="mem-lire-les-graduations" variant="new" compact />}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          L’échelle est donnée jusqu’ici. Reste à placer un point quand la valeur ne tombe pas
          sur une graduation — c’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
