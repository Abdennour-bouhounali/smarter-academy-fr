import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolutionScanner from '../components/SolutionScanner';
import PredictionChips from '../components/PredictionChips';
import { lin, relationAt } from '../components/eqUtils';

/**
 * Module 1 — TRIGGER : « Le scanner de solutions » (signature).
 *
 * Activity: deux forfaits, A = 5 + 2x € (x Go) et B = 13 € ; balayer x pour
 *   trouver où A = B, puis où A < B ; puis deux forfaits parallèles.
 * Mathematical objective: résoudre = trouver TOUTES les valeurs de x qui
 *   rendent la relation vraie ; une équation du premier degré a (ici) UNE
 *   solution, une inéquation en a une infinité (un intervalle) ; certaines
 *   équations n'en ont aucune. Vérifier = substituer.
 * Student action: prédire sans verdict, balayer, lire, vérifier.
 * Controlled variable: x.
 * Expected observation (aha) : l'égalité n'arrive qu'en x = 4 ; A < B pour
 *   tous les x de [0 ; 4[ — une infinité ; 2x + 3 et 2x + 5 ne sont jamais
 *   égaux.
 * Misconception targeted: « une inéquation a une solution », « résoudre =
 *   deviner ».
 * Formalization: les mots « équation », « solution », « ensemble des
 *   solutions » viennent en conclusion ; les méthodes aux modules 2–3.
 */
const A = lin(2, 5); const B = lin(0, 13);
const A2 = lin(2, 3); const B2 = lin(2, 5);

export default function Module01ScannerDeSolutions() {
  const [prediction, setPrediction] = useState(null);
  const [x, setX] = useState(1);
  const [seen, setSeen] = useState(() => new Set());
  const [regionDone, setRegionDone] = useState(false);
  const [x2, setX2] = useState(0);
  const [seen2, setSeen2] = useState(() => new Set());
  const [noneDone, setNoneDone] = useState(false);
  const [verifDone, setVerifDone] = useState(false);

  const scan = (v) => { setX(v); const s = new Set(seen); s.add(relationAt(A, B, v)); setSeen(s); };
  const scanDone = seen.has('=') && seen.has('<') && seen.has('>');

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le scanner de solutions"
      moduleSubtitle="Deux forfaits, un curseur : balaye x et regarde où les deux prix se croisent — et où l’un est moins cher."
      estimatedTime="9 min"
      brief={{ tag: '📱 Mission 01', title: 'Forfait A : 5 € + 2 € par gigaoctet. Forfait B : 13 € tout compris.', tone: 'indigo', body: <p>Pour combien de gigaoctets x les deux coûtent-ils pareil ? Et quand A est-il moins cher ? Balaye x pour le savoir.</p> }}
      steps={[
        {
          num: 1, title: 'Balaye x', subtitle: 'Trouve un x où A < B, un x où A > B, et celui où A = B.', done: scanDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="combien de valeurs de x rendent A moins cher que B ?" options={[{ id: 'aucune', label: 'Aucune' }, { id: 'une', label: 'Une seule' }, { id: 'quelques', label: 'Quelques-unes' }, { id: 'infinite', label: 'Une infinité' }]} value={prediction} onChange={setPrediction} disabled={scanDone} />
              <SolutionScanner L={A} R={B} x={x} onX={(v) => { scan(v); if (relationAt(A, B, v) === '=' && !seen.has('=')) kit.react(true); }} />
              {scanDone ? <Feedback tone="ok">Une seule valeur rend les deux prix égaux : <strong>x = 4</strong> (13 € = 13 €). Avant, A est moins cher ; après, plus cher. Tu viens de résoudre l’équation 2x + 5 = 13 en balayant.</Feedback>
                : <Feedback tone="info">{!seen.has('=') ? 'Cherche la valeur de x où les deux barres sont exactement égales.' : !seen.has('<') ? 'Maintenant un x où A est moins cher.' : 'Et un x où A est plus cher.'}</Feedback>}
              {scanDone && (
                <KnowledgeBrick
                  id="equation-solution"
                  variant="new"
                  lead="Tu viens de trouver, en balayant, la seule valeur qui rend les deux prix égaux. Cette égalité et cette valeur ont chacune un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Quand A est-il moins cher ?', subtitle: 'La droite s’allume là où A < B.', done: regionDone,
          content: (
            <div className="space-y-3">
              <SolutionScanner L={A} R={B} x={x} onX={scan} showRegion="<" showRoot />
              <TapQuestion prompt="L’ensemble des x (en Go, x ≥ 0) tels que A < B est :" options={['{4}', '[0 ; 4[', ']4 ; 10]', '[0 ; 10]']} cols={4} correct={1}
                explain={<>Toute la zone verte : de 0 (inclus) jusqu’à 4 (exclu, car en 4 les prix sont égaux). {prediction === 'infinite' ? 'Ta prédiction : une infinité. Exact' : prediction ? `Ta prédiction : ${prediction === 'aucune' ? 'aucune' : prediction === 'une' ? 'une seule' : 'quelques-unes'}. Le scanner te contredit` : 'Le scanner tranche'} : 0,5 Go, 1 Go, 3,99 Go… une INFINITÉ de valeurs rendent A moins cher. Résoudre 2x + 5 &lt; 13, c’est décrire toute cette zone : [0 ; 4[.</>}
                explainWrong={<>Regarde la zone verte : elle commence à 0 et s’arrête juste avant 4 (en 4, A = B). {prediction === 'infinite' ? 'Ta prédiction : une infinité. Exacte' : prediction ? `Ta prédiction : ${prediction === 'aucune' ? 'aucune' : prediction === 'une' ? 'une seule' : 'quelques-unes'}. Le scanner te contredit` : 'Le scanner tranche'} : une inéquation a en général une infinité de solutions — tout un intervalle : [0 ; 4[.</>}
                requires={['equation-solution', 'intervalle', 'intervalle-crochets']}
                solved={regionDone} onAnswered={() => setRegionDone(true)} />
              {regionDone && (
                <KnowledgeBrick
                  id="inequation-infinite"
                  variant="new"
                  lead="Une seule valeur pour l’égalité, mais toute une zone pour « moins cher » : ce n’est pas un accident."
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Deux autres forfaits', subtitle: 'A′ = 2x + 3 et B′ = 2x + 5. Balaye au moins quatre valeurs.', done: seen2.size >= 4 && noneDone,
          content: (
            <div className="space-y-3">
              <SolutionScanner L={A2} R={B2} labelL="A′" labelR="B′" x={x2} onX={(v) => { setX2(v); const s = new Set(seen2); s.add(v); setSeen2(s); }} />
              {seen2.size >= 4 && (
                <TapQuestion prompt="Combien de solutions a l’équation 2x + 3 = 2x + 5 ?" options={['Aucune', 'Une seule', 'Une infinité']} cols={3} correct={0}
                  explain="Quel que soit x, B′ coûte toujours 2 € de plus que A′ : les barres ne se rejoignent jamais. Cette équation n’a AUCUNE solution — son ensemble de solutions est ∅."
                  explainWrong="Regarde les barres : l’écart reste 2 € pour tout x. Aucune valeur ne rend l’égalité vraie : l’ensemble des solutions est vide, ∅."
                  requires={['equation-solution']}
                  solved={noneDone} onAnswered={() => setNoneDone(true)} />
              )}
              {noneDone && (
                <KnowledgeBrick
                  id="regle-nombre-de-solutions"
                  variant="new"
                  compact
                  lead="Une solution au premier essai, aucune au second : voilà les cas possibles, et comment on note l’ensemble."
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Vérifier une solution', done: verifDone,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt="On affirme que x = 4 est solution de 2x + 5 = 13. Pour le VÉRIFIER, on calcule le membre de gauche pour x = 4. Combien vaut 2 × 4 + 5 ?" expected={13} suffix="= 13 ?"
                explain="2 × 4 + 5 = 13, et le membre de droite vaut 13 : l’égalité est vraie, x = 4 est bien solution. Vérifier = remplacer x par la valeur et comparer les deux membres."
                explainFor={(v) => (v === 29 ? '« 2x » veut dire 2 × x, pas « 2 collé à x » : 2 × 4 = 8, puis + 5 = 13.' : v === 11 ? 'N’oublie pas de multiplier : 2 × 4 = 8, puis 8 + 5 = 13.' : 'Remplace x par 4 : 2 × 4 + 5 = 13. Comme le membre de droite vaut 13, l’égalité tient.')}
                requires={['equation-solution', 'calcul-litteral']}
                solved={verifDone} onAnswered={() => setVerifDone(true)} />
              {verifDone && (
                <KnowledgeBrick
                  id="methode-verifier-solution"
                  variant="new"
                  compact
                  lead="Tu n’as pas résolu : tu as remplacé x par 4 et comparé. C’est une méthode à part entière."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
