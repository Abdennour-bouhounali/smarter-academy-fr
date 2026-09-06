import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LiquidContainer from '../components/LiquidContainer';
import MeasureFillMission from '../../../../../common/components/MeasureFillMission';
import { parseDec, formatDec } from '../components/capacityUtils';

/**
 * Module 6 — atelier de mise en pratique (stage `practice_lab`).
 *
 * Il enseigne le learning point 6e_contenances_P6, « Relier 1 L à 1 dm³ et
 * résoudre des problèmes concrets », qui n'était couvert par AUCUN module :
 * la leçon passait de la formalisation des conversions (M5) directement au
 * boss final. Le lien 1 L = 1 dm³ n'y était qu'un titre de module, jamais
 * enseigné, et les problèmes concrets n'étaient que des épreuves notées.
 *
 * Trois gestes, dans l'ordre du contrat « connaissances avant la demande »
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   étape 1  VERSER une bouteille de 1 L dans un cube de 1 dm d'arête,
 *            décilitre par décilitre → le cube se remplit exactement, et
 *            SEULEMENT ALORS la brique « 1 L = 1 dm³ » est posée ;
 *   étape 2  ATTEINDRE une commande exacte en combinant des pichets, avec
 *            le droit de dépasser puis de retirer → la brique nomme la
 *            stratégie ;
 *   étape 3  un énoncé qui mélange DEUX unités : la brique du réflexe
 *            « même unité avant de calculer » est posée AVANT la question,
 *            sinon elle se répondrait au hasard.
 */

/* ══ Étape 1 — le litre entre exactement dans le cube de 1 dm ══════ */

/** Dix versées de 1 dL : le cube se remplit, la bouteille se vide. */
const VERSEES = 10;

function CubeEtLitre({ react, solved, onSolved }) {
  const reduced = useReducedMotion();
  const [poured, setPoured] = useState(solved ? VERSEES : 0);
  const [pouring, setPouring] = useState(false);
  const done = solved || poured === VERSEES;

  const verser = () => {
    if (done || pouring) return;
    setPouring(true);
    // Le geste d'abord, le nombre ensuite : le filet coule, puis le niveau
    // monte, puis le compteur change (règle d'animation de la leçon).
    window.setTimeout(
      () => {
        setPouring(false);
        setPoured((n) => {
          const next = n + 1;
          if (next === VERSEES) {
            react?.(true);
            onSolved?.();
          }
          return next;
        });
      },
      reduced ? 80 : 420
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700">
        Voici un cube dont chaque arête mesure <strong>1 dm</strong> (c’est-à-dire 10 cm), et une
        bouteille de <strong>1 L</strong> partagée en 10 mesures de 1 dL. Verse-les toutes : jusqu’où
        l’eau va-t-elle monter dans le cube ?
      </p>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/80 via-white to-slate-50 px-3 py-5 sm:px-6">
        <div className="flex items-end justify-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center gap-1.5">
            <LiquidContainer
              shape="bottle"
              fillPct={(VERSEES - poured) / VERSEES}
              height={150}
              color="#0ea5e9"
              ariaLabel={`Bouteille de 1 litre, ${VERSEES - poured} mesures de 1 dL restantes`}
            />
            <span className="font-mono text-xs font-bold text-slate-500">
              bouteille · 1 L
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <LiquidContainer
              shape="cube"
              fillPct={poured / VERSEES}
              height={150}
              color="#0ea5e9"
              streamIn={pouring}
              ripple={pouring}
              graduations={[{ pct: 1, label: 'plein' }]}
              ariaLabel="Cube de 1 dm d’arête"
            />
            <span className="font-mono text-xs font-bold text-slate-500">
              cube · arête 1 dm
            </span>
          </div>
        </div>

        <div className="mt-4 text-center font-mono text-lg font-extrabold tabular-nums text-slate-800">
          {poured} / {VERSEES} mesures de 1 dL versées
        </div>
      </div>

      {!done && (
        <div className="text-center">
          <ValidateButton onClick={verser}>Verser une mesure de 1 dL</ValidateButton>
        </div>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            key="cube-plein"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Feedback tone="ok">
              La bouteille est vide et le cube est plein — <strong>exactement</strong> plein, sans
              une goutte qui déborde ni un creux qui reste.
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ Étape 2 — les commandes du bar, à la mesure près ══════════════ */

const COMMANDES = [
  {
    // 70 cL n'est atteignable qu'en dépassant puis en retirant : la stratégie
    // « verser trop, puis reprendre » se découvre, elle ne se raconte pas.
    id: 'cmd70',
    targetMl: 700,
    tankMl: 1000,
    unit: 'cL',
    allowRemove: true,
    tools: [
      { id: 'p30', ml: 300, label: '30 cL' },
      { id: 'p50', ml: 500, label: '50 cL' },
    ],
    solution: [
      { toolId: 'p50', type: 'add' },
      { toolId: 'p50', type: 'add' },
      { toolId: 'p30', type: 'remove' },
    ],
  },
  {
    id: 'cmd85',
    targetMl: 850,
    tankMl: 1000,
    unit: 'cL',
    allowRemove: true,
    tools: [
      { id: 'p5', ml: 50, label: '5 cL' },
      { id: 'p25', ml: 250, label: '25 cL' },
      { id: 'p60', ml: 600, label: '60 cL' },
    ],
    solution: [
      { toolId: 'p60', type: 'add' },
      { toolId: 'p25', type: 'add' },
      { toolId: 'p5', type: 'add' },
    ],
  },
];

/* ══ Étape 3 — la commande qui mélange deux unités ═════════════════ */

const UNITE_Q = {
  q: 'La carafe contient 1 L de jus. Tu en sers 30 cL. Avant de calculer ce qu’il reste, que fais-tu en premier ?',
  options: [
    'Je soustrais tout de suite : 1 − 30',
    'Je mets les deux quantités dans la même unité, puis je soustrais',
    'Je convertis le résultat à la fin, une fois la soustraction faite',
  ],
  correct: 1,
  explain:
    '1 L et 30 cL ne se soustraient pas tels quels : ce ne sont pas les mêmes unités. On écrit d’abord 1 L = 100 cL, et seulement ensuite 100 − 30.',
};

export default function Module06AtelierDuBar() {
  const [cubeDone, setCubeDone] = useState(false);
  const [cubeQDone, setCubeQDone] = useState(false);
  const s1 = cubeDone && cubeQDone;

  const [commandesDone, setCommandesDone] = useState(false);

  const [uniteDone, setUniteDone] = useState(false);
  const [resteDone, setResteDone] = useState(false);
  const s3 = uniteDone && resteDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier du bar à jus"
      moduleSubtitle="Le litre a une forme, et les commandes se préparent à la mesure près."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Demain, le bar à jus ouvre. Aujourd’hui, on s’entraîne.',
        body: (
          <p>
            Tu vas d’abord découvrir quelle place occupe vraiment un litre, puis préparer des
            commandes au centilitre près — et enfin servir un client sans te tromper d’unité.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Quelle place occupe un litre ?',
          subtitle: 'Verse la bouteille dans le cube, mesure par mesure.',
          done: s1,
          content: (kit) => (
            <div className="space-y-5">
              <CubeEtLitre react={kit.react} solved={cubeDone} onSolved={() => setCubeDone(true)} />
              {/* Le cube vient d'être rempli exactement : c'est l'instant, et
                  le seul, où « 1 L = 1 dm³ » veut dire quelque chose. */}
              {cubeDone && (
                <KnowledgeBrick
                  id="litre-dm3"
                  variant="new"
                  lead="Tu viens de voir un litre remplir exactement ce cube. C’est de là que vient le litre."
                />
              )}
              {cubeDone && (
                <TapQuestion
                  requires={['litre-dm3', 'contenance']}
                  prompt="Un deuxième cube a exactement la même arête de 1 dm. Combien de litres peut-il contenir ?"
                  options={['0,1 L', '1 L', '10 L']}
                  cols={3}
                  explain="Tous les cubes de 1 dm d’arête ont la même contenance : 1 L. C’est ce qui fait du décimètre cube une unité fiable."
                  solved={cubeQDone}
                  onAnswered={() => setCubeQDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les commandes du bar',
          subtitle: 'Atteins exactement la quantité demandée avec les pichets disponibles.',
          done: commandesDone,
          content: (kit) => (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                Aucun pichet ne vaut la commande à lui seul. À toi de les combiner — et n’hésite pas
                à trop verser puis à reprendre avec le robinet.
              </p>
              <MeasureFillMission
                mode="free"
                challenges={COMMANDES}
                react={kit.react}
                solved={commandesDone}
                onAllCompleted={() => setCommandesDone(true)}
              />
              {/* Deux commandes viennent d'être servies, dont une en dépassant
                  puis en retirant : la stratégie se nomme après le geste. */}
              {commandesDone && (
                <KnowledgeBrick
                  id="combiner-mesures"
                  variant="new"
                  lead="Tu viens de fabriquer 70 cL alors qu’aucun pichet ne valait 70 cL."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Servir un client',
          subtitle: 'Une carafe, un verre servi, et deux écritures différentes.',
          done: s3,
          content: (
            <div className="space-y-5">
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                🫗 La carafe contient <strong>1 L</strong> de jus d’orange. Un client s’en fait
                servir <strong>30 cL</strong>.
              </div>
              {/* L'énoncé mélange deux unités : le réflexe est posé AVANT la
                  moindre question, sinon elle se répondrait au hasard. */}
              <KnowledgeBrick
                id="mem-meme-unite-contenance"
                variant="new"
                lead="Regarde bien l’énoncé : il y a des L ET des cL. C’est le piège classique."
              />
              <TapQuestion
                requires={['mem-meme-unite-contenance', 'convertir-contenance-methode', 'escalier-contenances']}
                prompt={UNITE_Q.q}
                options={UNITE_Q.options}
                correct={UNITE_Q.correct}
                cols={1}
                explain={UNITE_Q.explain}
                solved={uniteDone}
                onAnswered={() => setUniteDone(true)}
              />
              {uniteDone && (
                <div className="border-t border-slate-100 pt-4">
                  <NumericQuestion
                    requires={[
                      'mem-meme-unite-contenance',
                      'convertir-contenance-methode',
                      'escalier-contenances',
                    ]}
                    prompt="Combien reste-t-il de jus dans la carafe, en centilitres ?"
                    suffix="cL"
                    expected={70}
                    parse={parseDec}
                    display={formatDec(70)}
                    explain={
                      <>
                        1 L = 100 cL, donc 100 cL − 30 cL = <strong>70 cL</strong> — la quantité que
                        tu as fabriquée à l’étape 2.
                      </>
                    }
                    explainFor={() => 'Écris d’abord la carafe en centilitres, puis soustrais les 30 cL servis.'}
                    solved={resteDone}
                    onAnswered={() => setResteDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Ta carte est complète. Le bar à jus de la fête ouvre dans une
          heure : dix épreuves où personne ne te dira quelle connaissance sortir.
        </KnowledgeSnapshot>
      }
    />
  );
}
