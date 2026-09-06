import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleUnroller from '../components/CircleUnroller';
import { circleCircumference, formatDec, parseDec } from '../components/perimUtils';

/**
 * Module 4 — manipulation : découvrir π par le geste.
 *
 * PRÉDICTION d'abord (« combien de diamètres pour faire le tour ? »), puis
 * la roue roule et tamponne ses diamètres sur le sol : 3 rubans entiers et
 * un petit reste. La prédiction n'est jamais notée « juste/faux » de façon
 * sèche : quel que soit le pari, c'est le roulé qui tranche — la réponse
 * vient de l'expérience, pas du corrigé.
 */
const PREDICTION_OPTIONS = ['Exactement 2 diamètres', 'Exactement 3 diamètres', 'Exactement 4 diamètres', 'Un peu plus de 3 diamètres'];

const VOCAB_Q = {
  q: 'Le rayon de la roue mesure 3 m. Que vaut son diamètre D ?',
  options: ['1,5 m', '3 m', '6 m'],
  correct: 2,
  explain: 'Le diamètre traverse le cercle de part en part en passant par le centre : D = 2 × r = 2 × 3 = 6 m. C’est LUI qui entre dans la formule.',
};

function UnrollExperiment({ react, solved, onSolved }) {
  const [prediction, setPrediction] = useState(null);
  const [step, setStep] = useState(solved ? 4 : 0);
  const finished = solved || step >= 4;

  const advance = () => {
    if (finished) return;
    const next = step + 1;
    setStep(next);
    if (next >= 4) {
      // Le geste est terminé : déblocage inconditionnel. `react` porte la
      // qualité de la prédiction (« un peu plus de 3 » était le bon pari).
      react(prediction === 3);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Prédiction — obligatoire avant de rouler */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">
          Avant de rouler : d'après toi, combien de fois faut-il reporter le diamètre (le ruban rouge) pour faire
          le tour complet de la roue ?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Ta prédiction">
          {PREDICTION_OPTIONS.map((opt, i) => (
            <button
              key={opt}
              type="button"
              disabled={finished || step > 0}
              onClick={() => setPrediction(i)}
              aria-pressed={prediction === i}
              className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                prediction === i
                  ? 'bg-emerald-600 border-emerald-700 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
              } ${step > 0 && prediction !== i ? 'opacity-40' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. L'expérience — activée une fois le pari posé */}
      {prediction !== null && (
        <CircleUnroller
          step={step}
          onAdvance={advance}
          showLeftover={finished}
          disabled={finished}
        />
      )}
      {prediction !== null && step > 0 && !finished && (
        <p className="text-center text-xs font-mono text-slate-500">
          {step} diamètre{step > 1 ? 's' : ''} reporté{step > 1 ? 's' : ''}… le tour n'est pas fini.
        </p>
      )}

      {/* 3. Le verdict vient du sol, pas du corrigé */}
      {finished && (
        <Feedback tone={prediction === 3 ? 'ok' : 'info'}>
          {prediction === 3
            ? 'Ta prédiction était la bonne : '
            : 'Le sol a tranché : '}
          le tour de la roue vaut <strong>3 diamètres entiers + un petit reste</strong> (≈ 0,14 diamètre, le ruban
          orange). Ce nombre « un peu plus que 3 » est célèbre : on l'appelle <strong>π</strong> (pi), et
          π ≈ <strong>3,14</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module04TourDuCercle() {
  const [unrollDone, setUnrollDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);
  const [calc1Done, setCalc1Done] = useState(false);
  const [calc2Done, setCalc2Done] = useState(false);

  const P50 = circleCircumference(50); // 157
  const P6 = circleCircumference(6); // 18,84

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le tour du cercle"
      moduleSubtitle="Fais rouler la roue : combien de diamètres pour un tour complet ?"
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Un cercle n’a pas de côtés… comment mesurer son tour ?',
        body: <p>Le vélo du gardien va nous aider : sa roue sait écrire son propre périmètre sur le sol.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis, puis fais rouler',
          done: unrollDone,
          content: (kit) => (
            <div className="space-y-5">
              <UnrollExperiment react={kit.react} solved={unrollDone} onSolved={() => setUnrollDone(true)} />
              {/* Le sol vient d'afficher « 3 diamètres et un petit reste » :
                  le nombre peut être nommé, il est déjà mesuré. */}
              {unrollDone && (
                <KnowledgeBrick
                  id="pi"
                  variant="new"
                  lead="Ce « un peu plus de 3 » que la roue a écrit sur le sol est un nombre célèbre."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Rayon ou diamètre ?',
          done: vocabDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={VOCAB_Q.q}
                options={VOCAB_Q.options}
                correct={VOCAB_Q.correct}
                cols={3}
                explain={VOCAB_Q.explain}
                requires={['perimetre', 'pi']}
                solved={vocabDone}
                onAnswered={() => setVocabDone(true)}
              />
              {/* π mesuré, diamètre distingué du rayon : la formule peut
                  s'écrire — elle n'apporte plus rien de neuf, elle assemble. */}
              {vocabDone && (
                <KnowledgeBrick
                  id="perimetre-cercle"
                  variant="new"
                  lead="Tu as le nombre et tu as la bonne longueur à multiplier : la formule s’écrit toute seule."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La formule au travail',
          done: calc1Done && calc2Done,
          content: (
            <div className="space-y-6">
              <NumericQuestion
                prompt="Une roue de diamètre D = 50 cm. Son périmètre P ≈ π × D ≈ 3,14 × 50 ≈ ? cm"
                suffix="cm"
                expected={P50}
                parse={parseDec}
                display={formatDec(P50)}
                explain={<>P ≈ 3,14 × 50 ≈ <strong>{formatDec(P50)} cm</strong> — un résultat toujours APPROCHÉ (signe ≈), jamais exact.</>}
                explainFor={() => 'Multiplie 3,14 par le diamètre (50 cm).'}
                requires={['perimetre', 'pi', 'perimetre-cercle']}
                solved={calc1Done}
                onAnswered={() => setCalc1Done(true)}
              />
              {calc1Done && (
                <div className="border-t border-slate-100 pt-4">
                  <NumericQuestion
                    prompt="Le bassin rond a un RAYON de 3 m. Quel est son périmètre approché, en mètres ?"
                    suffix="m"
                    expected={P6}
                    parse={parseDec}
                    display={formatDec(P6)}
                    explain={<>D = 2 × r = 6 m, puis P ≈ 3,14 × 6 ≈ <strong>{formatDec(P6)} m</strong>.</>}
                    explainFor={(n) =>
                      n === 9.42
                        ? 'Tu as multiplié π par le RAYON (3 m). La formule utilise le diamètre : D = 2 × 3 = 6 m.'
                        : 'Attention : on te donne le rayon. Calcule d’abord D = 2 × r, puis P ≈ 3,14 × D.'
                    }
                    requires={['perimetre', 'pi', 'perimetre-cercle']}
                    solved={calc2Done}
                    onAnswered={() => setCalc2Done(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu as maintenant tous les tours. Le module suivant ajoute les
          deux réflexes qui précèdent le calcul et évitent presque toutes les erreurs.
        </KnowledgeSnapshot>
      }
    />
  );
}
