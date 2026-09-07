import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { BoxPlot, DotPlot, fiveNumberSummary, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { BREST } from '../data';

/**
 * Module 1 — DÉCLENCHEUR : la boîte se CONSTRUIT sous les yeux de l'élève.
 *
 * L'interaction signature est la révélation progressive : l'élève dévoile
 * min, max, médiane, Q1 puis Q3 dans cet ordre, et voit la figure se
 * compléter. Le composant partagé BoxPlot accepte `reveal` précisément pour
 * cela — la boîte n'est pas montrée puis expliquée, elle est fabriquée.
 *
 * Le nuage des 30 relevés reste affiché AU-DESSUS : à chaque étape, l'élève
 * voit d'où sort le repère qu'il vient de révéler.
 */
const ORDER = ['min', 'max', 'median', 'q1', 'q3'];
const LABELS = {
  min: 'le minimum', max: 'le maximum', median: 'la médiane',
  q1: 'le premier quartile Q1', q3: 'le troisième quartile Q3',
};
const FIVE = fiveNumberSummary(BREST);

export default function Module01CinqNombresSuffisent() {
  const [step, setStep] = useState(0);      // combien de repères révélés
  const [pred, setPred] = useState(null);
  const [q3q, setQ3q] = useState(false);

  const done1 = step >= 5;
  const done2 = q3q;

  const reveal = (react) => {
    const next = Math.min(5, step + 1);
    setStep(next);
    if (next === 5) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Révèle les cinq nombres',
      subtitle: 'Trente températures de midi à Brest. Dévoile-les un par un et regarde la figure se construire.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="combien de nombres faut-il, à ton avis, pour donner une bonne idée de ces trente relevés ?"
            options={[
              { id: '1', label: 'Un seul (la moyenne)' },
              { id: '5', label: 'Quelques-uns, cinq environ' },
              { id: '30', label: 'Les trente, forcément' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <DotPlot values={BREST} domain={{ min: 12, max: 26 }} unit="°C" label="Brest — 30 relevés" />
          <BoxPlot
            series={[{ id: 'brest', label: 'Brest', values: BREST, color: '#0284c7' }]}
            domain={{ min: 12, max: 26 }} unit="°C"
            reveal={step === 0 ? 'none' : ORDER[step - 1]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => reveal(kit.react)}
              disabled={step >= 5}
              className="min-h-[44px] px-4 rounded-xl border-2 border-indigo-600 bg-indigo-600 text-white text-sm font-bold transition hover:bg-indigo-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {step >= 5 ? 'Les cinq nombres sont révélés' : `Révéler ${LABELS[ORDER[step]]}`}
            </button>
            {step > 0 && (
              <button type="button" onClick={() => setStep(0)}
                className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 text-sm font-bold text-slate-600 hover:border-slate-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                Recommencer
              </button>
            )}
            <span className="text-xs text-slate-500">{step} / 5 révélés</span>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              {pred === '5' ? 'Ta prédiction tenait' : 'Voilà'} : <strong>cinq nombres</strong> — minimum
              {' '}{FIVE.min} °C, Q1 {FIVE.q1} °C, médiane {FIVE.median} °C, Q3 {FIVE.q3} °C, maximum {FIVE.max} °C —
              suffisent à dessiner la silhouette de la série. C’est le <strong>résumé des cinq nombres</strong>,
              et la figure s’appelle une <strong>boîte à moustaches</strong>.
              {' '}<span className="text-slate-500">Tu peux recommencer pour revoir l’ordre de construction.</span>
            </Feedback>
          ) : null}
          {/* Les cinq repères viennent d'être posés un par un et le rectangle
              est apparu : c'est l'instant où ces cinq nombres, et la figure
              qu'ils engendrent, peuvent être nommés — avant l'étape 2 qui les
              exige. La méthode de tracé suit dans la foulée, puisque l'élève
              vient exactement de l'exécuter. */}
          {done1 && (
            <>
              <KnowledgeBrick
                id="resume-cinq-nombres"
                variant="new"
                lead={<>Tu n’as dévoilé que <strong>cinq</strong> des trente relevés, et la série a déjà une silhouette.</>}
              />
              <KnowledgeBrick
                id="construire-boite"
                variant="new"
                compact
                lead={<>L’ordre dans lequel tu viens de les révéler est exactement l’ordre du tracé.</>}
              />
            </>
          )}
          {!done1 && (
            <Feedback tone="info">
              {step === 0 && 'Commence par le minimum : c’est la pastille la plus à gauche du nuage.'}
              {step === 1 && 'Le maximum ferme l’autre bout.'}
              {step === 2 && 'La médiane coupe l’effectif en deux : c’est le trait vert.'}
              {step === 3 && 'Q1 ouvre la boîte à gauche.'}
              {step === 4 && 'Q3 la ferme à droite — et le rectangle apparaît.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Où est le rectangle ?',
      done: done2,
      content: (
        <TapQuestion
          prompt="Sur la boîte de Brest, entre quelles valeurs s’étend le rectangle ?"
          options={[
            `De Q1 = ${FIVE.q1} °C à Q3 = ${FIVE.q3} °C`,
            `Du minimum ${FIVE.min} °C au maximum ${FIVE.max} °C`,
            `De la médiane ${FIVE.median} °C au maximum ${FIVE.max} °C`,
            'De 0 °C à la médiane',
          ]}
          correct={0} cols={1}
          requires={['resume-cinq-nombres', 'construire-boite', 'quartile', 'effectif']}
          explain={`Le rectangle va toujours de Q1 à Q3 : il couvre la moitié centrale de l’effectif. Les moustaches, elles, rejoignent le minimum et le maximum.`}
          explainWrong="Les extrémités du rectangle sont les quartiles, pas les extrêmes : ce sont les moustaches qui vont jusqu’au minimum et au maximum."
          solved={done2} onAnswered={() => setQ3q(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Cinq nombres suffisent" moduleSubtitle="Trente relevés, une silhouette" estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur', title: 'Une série, cinq nombres', tone: 'indigo',
        body: <p>Trente températures de midi à Brest. Plutôt que de les lire toutes, tu vas en dévoiler cinq — et voir apparaître une figure qui les résume.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Ces cinq nombres forment le <strong>résumé des cinq nombres</strong>,
          et la figure est une <strong>boîte à moustaches</strong>. Module suivant : ce que chacune de ses quatre
          zones raconte — et un piège de lecture.
        </KnowledgeSnapshot>
      )}
    />
  );
}
