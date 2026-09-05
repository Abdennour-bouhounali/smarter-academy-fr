import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MagicTrick from '../components/MagicTrick';
import PredictionChips from '../components/PredictionChips';
import { numericChain } from '../components/litteralUtils';

/**
 * Module 1 — TRIGGER : « Le tour de magie » (signature, le laboratoire est
 * visible dès la première seconde ; la prédiction est facultative, dans le
 * même pas).
 *
 * Activity: faire tourner un programme de calcul (×3, +9, ÷3, − le nombre
 *   de départ) sur n'importe quel nombre ; puis le suivre « avec x » ; puis
 *   un second programme dont le résultat DÉPEND du nombre, à prédire.
 * Mathematical objective: une lettre suit tous les nombres à la fois ;
 *   l'égalité d'expressions (3x + 9)/3 − x = 3 est vraie pour TOUT x — c'est
 *   ce qui explique, là où dix essais ne font que constater.
 * Expected observation (aha) : toujours 3, même pour −7 ou 2,5 ; la chaîne
 *   en x montre pourquoi ; (x + 1)² − x² donne 2x + 1, prévisible pour 10.
 * Misconception targeted: « ça marche dix fois, donc c'est prouvé ».
 * Formalization: les mots « expression littérale », « égalité pour tout x »
 *   en conclusion ; réduire/développer/factoriser nommés plus tard.
 */
const T1 = [{ op: 'mul', k: 3 }, { op: 'add', k: 9 }, { op: 'div', k: 3 }, { op: 'subx' }];
const T2 = [{ op: 'add', k: 1 }, { op: 'square' }, { op: 'subsquarex' }];

export default function Module01LeTourDeMagie() {
  const [prediction, setPrediction] = useState(null);
  const [trials, setTrials] = useState([]);
  const [showX, setShowX] = useState(false);
  const [whyDone, setWhyDone] = useState(false);
  const [trials2, setTrials2] = useState([]);
  const [showX2, setShowX2] = useState(false);
  const [predDone, setPredDone] = useState(false);
  const [wordsDone, setWordsDone] = useState(false);
  const hasNeg = trials.some((t) => t < 0); const hasDec = trials.some((t) => !Number.isInteger(t));
  const step1Done = trials.length >= 3 && (hasNeg || hasDec) && showX && whyDone;

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le tour de magie"
      moduleSubtitle="Pense à un nombre, ×3, +9, ÷3, retire ton nombre : toujours 3. Pourquoi ? Suis le calcul avec une lettre."
      estimatedTime="9 min"
      brief={{ tag: '🎩 Mission 01', title: '« Pense à un nombre. Multiplie-le par 3. Ajoute 9. Divise par 3. Retire ton nombre de départ. » Le magicien annonce le résultat sans le connaître.', tone: 'indigo', body: <p>Essaie avec n’importe quel nombre — un négatif, un décimal. Puis découvre le truc.</p> }}
      steps={[
        {
          num: 1, title: 'Fais tourner le tour', subtitle: 'Au moins trois essais, dont un négatif ou un décimal. Puis « Suivre avec x ».', done: step1Done,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="le résultat dépend-il du nombre de départ ?" options={[{ id: 'oui', label: 'Oui, il change' }, { id: 'non', label: 'Non, toujours le même' }]} value={prediction} onChange={setPrediction} disabled={trials.length >= 3} />
              <MagicTrick steps={T1} trials={trials} chips={[5, 12, -7, 2.5]} onTry={(n) => { if (trials.length < 8) { setTrials([...trials, n]); if (trials.length === 2) kit.react(true); } }} showX={showX} onToggleX={setShowX} />
              {trials.length >= 3 && !showX && <Feedback tone="info">{prediction === 'non' ? 'Ta prédiction : toujours le même. Confirmé' : prediction === 'oui' ? 'Ta prédiction : il change. Les essais te contredisent' : 'Constat'} : toujours 3. Mais trois essais ne prouvent rien pour les milliards d’autres nombres. Touche « Suivre avec x » : la lettre x représente N’IMPORTE QUEL nombre de départ.</Feedback>}
              {showX && (
                <TapQuestion prompt="Pourquoi le résultat est-il toujours 3 ?" options={['Parce que (3x + 9) ÷ 3 = x + 3 : le nombre de départ x réapparaît, puis on le retire, il reste 3', 'Parce que 9 ÷ 3 = 3', 'Parce qu’on a testé assez de nombres']} cols={1} correct={0}
                  explain="La chaîne en x le montre : 3x → 3x + 9 → x + 3 → 3. Le x s’en va à la dernière étape, quel que soit x. Une lettre suit TOUS les nombres à la fois : c’est une preuve, pas une série d’essais."
                  explainWrong="Regarde la chaîne en x : 3x + 9 divisé par 3 donne x + 3 (les DEUX termes sont divisés). Retirer x laisse 3. C’est vrai pour tout x — tester des nombres ne prouve rien, la lettre si."
                  solved={whyDone} onAnswered={() => setWhyDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Un second tour', subtitle: '« Ajoute 1, élève au carré, retire le carré du nombre de départ. » Trois essais, puis suis avec x.', done: trials2.length >= 3 && showX2 && predDone,
          content: (kit) => (
            <div className="space-y-3">
              <MagicTrick steps={T2} trials={trials2} chips={[1, 4, 6, 2.5]} onTry={(n) => { if (trials2.length < 8) { setTrials2([...trials2, n]); if (trials2.length === 2) kit.react(true); } }} showX={showX2} onToggleX={setShowX2} />
              {trials2.length >= 3 && showX2 && (
                <NumericQuestion prompt="Sans calculer la chaîne : quel sera le résultat pour le nombre 10 ?" expected={numericChain(T2, 10).pop()} suffix=""
                  explain="La chaîne en x donne 2x + 1 : pour 10, 2 × 10 + 1 = 21. Le résultat dépend du nombre, mais l’expression le prédit d’un coup."
                  explainFor={(v) => (v === 121 ? '121 = 11², le carré de 10 + 1. Il faut ensuite retirer 10² = 100 : 21. La chaîne en x le dit : 2x + 1.' : v === 20 ? 'Presque : 2x + 1 pour x = 10 fait 20 + 1 = 21.' : 'Lis la dernière carte de la chaîne en x : 2x + 1. Pour x = 10 : 21.')}
                  solved={predDone} onAnswered={() => setPredDone(true)} />
              )}
              {trials2.length >= 3 && !showX2 && <Feedback tone="info">Cette fois le résultat change. Touche « Suivre avec x » pour trouver la règle.</Feedback>}
            </div>
          ),
        },
        {
          num: 3, title: 'Les mots', done: wordsDone,
          content: (
            <TapQuestion prompt="Que signifie « (3x + 9) ÷ 3 − x = 3 » ?" options={['Que les deux écritures donnent le même nombre pour TOUTE valeur de x', 'Que x vaut 3', 'Que c’est vrai pour les nombres qu’on a essayés']} cols={1} correct={0}
              explain="C’est une égalité d’EXPRESSIONS : vraie pour tout x, pas une équation à résoudre. Une expression littérale est un programme de calcul écrit avec une lettre ; deux expressions sont égales quand elles donnent le même nombre pour toutes les valeurs."
              explainWrong="Il ne s’agit pas de trouver x : l’égalité est vraie pour TOUT x — c’est ce que le tour de magie exploite. Deux écritures d’une même expression."
              solved={wordsDone} onAnswered={() => setWordsDone(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Une <strong>expression littérale</strong> calcule un nombre pour chaque valeur de la lettre. Deux écritures sont la <strong>même expression</strong> quand elles s’accordent pour tout x. Toute la leçon consiste à passer d’une écriture à l’autre : réduire, développer, factoriser.</Feedback>}
    />
  );
}
