import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConjectureLab from '../components/ConjectureLab';
import PredictionChips from '../components/PredictionChips';
import { euler, isPrime } from '../components/logicUtils';

/**
 * Module 1 — TRIGGER : « La formule qui tombe » (signature ; le laboratoire
 * est à l'écran dès la première seconde).
 *
 * Activity: tester n² + n + 41 pour n = 0, 1, 2… puis sauter à 40.
 * Mathematical objective: faire vivre l'asymétrie fondamentale — des
 *   exemples, même quarante, ne prouvent pas une affirmation universelle ;
 *   un seul contre-exemple la réfute.
 * Student action: « Tester n = k », sauts, saisie libre ; prédiction
 *   facultative dans le même pas.
 * Controlled variable: n.
 * Mathematical state: `tested` (module) ; primalité et factorisation dérivées.
 * Expected observation (aha) : ça marche, encore, encore… et à n = 40,
 *   1 681 = 41 × 41.
 * Misconception targeted: « beaucoup d'exemples valent une preuve ».
 * Formalization: les mots proposition / vraie / fausse / contre-exemple
 *   arrivent en fin de module ; implication et équivalence sont plus loin.
 */
export default function Module01LaFormuleQuiTombe() {
  const [prediction, setPrediction] = useState(null);
  const [tested, setTested] = useState([]);
  const [convDone, setConvDone] = useState(false);
  const [wordsDone, setWordsDone] = useState(false);
  const [proofDone, setProofDone] = useState(false);
  const fallen = tested.some((n) => !isPrime(euler(n)));
  const enough = tested.length >= 6;

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="La formule qui tombe"
      moduleSubtitle="n² + n + 41 donne un nombre premier. Pour n = 0, 1, 2… jusqu’où ? Teste, et regarde la formule tomber."
      estimatedTime="9 min"
      brief={{ tag: '⚖️ Mission 01', title: 'Euler a proposé une formule qui, dit-on, fabrique des nombres premiers : n² + n + 41.', tone: 'indigo', body: <p>Teste-la. Combien de succès faut-il pour être sûr ?</p> }}
      steps={[
        {
          num: 1, title: 'Teste la formule', subtitle: 'Au moins six valeurs, puis saute à n = 40.', done: enough && fallen && convDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="cette formule donne-t-elle un nombre premier pour TOUS les entiers n ?" options={[{ id: 'oui', label: 'Oui, toujours' }, { id: 'non', label: 'Non, elle finira par tomber' }]} value={prediction} onChange={setPrediction} disabled={fallen} />
              <ConjectureLab tested={tested} jumps={[10, 20, 39, 40, 41]} onTest={(n) => { if (!tested.includes(n)) { setTested([...tested, n]); if (!isPrime(euler(n))) kit.react(true); } }} />
              {enough && !fallen && <Feedback tone="info">Toujours premier. Essaie des valeurs plus grandes — le saut « n = 40 » par exemple.</Feedback>}
              {fallen && (
                <TapQuestion prompt="La formule a tenu pour n = 0 jusqu’à 39, puis a échoué en 40. Que faut-il en conclure ?" options={['L’affirmation « pour tout n, n² + n + 41 est premier » est FAUSSE : un seul contre-exemple suffit', 'Elle est vraie « presque toujours », donc vraie', 'Il faudrait tester plus de valeurs pour savoir']} cols={1} correct={0}
                  explain={<>{prediction === 'non' ? 'Ta prédiction : elle finira par tomber. Exact' : prediction === 'oui' ? 'Ta prédiction : toujours premier. La formule te contredit' : 'Le laboratoire tranche'} : 1 681 = 41 × 41. Quarante succès ne prouvent rien ; un seul échec réfute définitivement. Une affirmation qui porte sur TOUS les n est fausse dès qu’UN n la met en défaut.</>}
                  explainWrong="En mathématiques, « presque toujours » ne suffit pas : l’affirmation dit « pour tout n ». n = 40 donne 41 × 41, elle est donc fausse — et aucune quantité de tests supplémentaires ne changera cela."
                  solved={convDone} onAnswered={() => setConvDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Les mots', done: wordsDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-1.5">
                <p>Une <strong>proposition</strong> est une phrase mathématique qui est soit <strong>vraie</strong>, soit <strong>fausse</strong> — jamais les deux, jamais « ça dépend de l’avis ».</p>
                <p>« <MathText>{'$n^{2} + n + 41$'}</MathText> est premier » dépend de n : ce n’est une proposition qu’une fois n fixé. En ajoutant « <strong>pour tout n</strong> », on obtient une proposition — ici fausse. Le nombre qui la met en défaut s’appelle un <strong>contre-exemple</strong>.</p>
              </div>
              <TapQuestion prompt="Laquelle de ces phrases est une proposition mathématique ?" options={['« 7 est un nombre premier »', '« Les nombres premiers sont beaux »', '« x + 1 »', '« Combien vaut 3 + 4 ? »']} cols={1} correct={0}
                explain="« 7 est premier » est vraie ou fausse (ici vraie) : c’est une proposition. « Beaux » est un avis, « x + 1 » est une expression (pas une phrase), et une question n’affirme rien."
                explainWrong="Une proposition AFFIRME quelque chose qu’on peut déclarer vrai ou faux. Un avis, une expression ou une question n’en sont pas."
                solved={wordsDone} onAnswered={() => setWordsDone(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Réfuter, ou prouver', done: proofDone,
          content: (
            <TapQuestion prompt="Pour montrer que l’affirmation « pour tout entier n, n² + n est pair » est VRAIE, que faut-il ?" options={['Un raisonnement valable pour tout n : n(n + 1) est le produit de deux entiers consécutifs, donc l’un est pair', 'Beaucoup d’exemples qui marchent', 'Un contre-exemple']} cols={1} correct={0}
              explain="Réfuter demande UN contre-exemple ; prouver demande un raisonnement qui couvre tous les cas. Ici : n et n + 1 se suivent, l’un des deux est pair, donc leur produit l’est. Les exemples ne servent qu’à deviner."
              explainWrong="Un contre-exemple sert à réfuter, pas à prouver ; et des exemples, même nombreux, ne couvrent jamais tous les entiers (la formule d’Euler vient de le montrer). Il faut un raisonnement général."
              solved={proofDone} onAnswered={() => setProofDone(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Une proposition est vraie ou fausse. Pour une affirmation universelle : <strong>un contre-exemple suffit à réfuter</strong>, mais aucun nombre d’exemples ne suffit à prouver. Reste à savoir combiner des propositions — et à distinguer « si… alors » de « si et seulement si ».</Feedback>}
    />
  );
}
