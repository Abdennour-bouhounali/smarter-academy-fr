import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import ValueTable from '../../../../../common/components/ValueTable';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IdentityGrid from '../components/IdentityGrid';
import PredictionChips from '../components/PredictionChips';

/**
 * Module 3 — DISCOVERY : « Développer : l'aire qui se découpe ».
 * Activity: prédire (x + 3)² = x² + 9 ?, tester au tableau ; découper le
 *   carré de côté a + b avec a et b réglables ; puis (a − b)² et
 *   (a + b)(a − b) ; développer en série.
 * Mathematical objective: (a + b)² = a² + 2ab + b² — il y a DEUX rectangles ab ;
 *   (a − b)² = a² − 2ab + b² ; (a + b)(a − b) = a² − b² ; et la double
 *   distributivité en général.
 */
export default function Module03Developper() {
  const [prediction, setPrediction] = useState(null);
  const [tested, setTested] = useState(() => new Set());
  const [a, setA] = useState(3); const [b, setB] = useState(2);
  const [seen, setSeen] = useState(() => new Set());
  const [plusDone, setPlusDone] = useState(false);
  const [a2, setA2] = useState(5); const [b2, setB2] = useState(2);
  const [minusDone, setMinusDone] = useState(false);
  const [a3, setA3] = useState(5); const [b3, setB3] = useState(2);
  const [diffDone, setDiffDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const bump = (set, s) => (v) => { set(v); const n = new Set(seen); n.add(`${s}${v}`); setSeen(n); };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Développer : l’aire qui se découpe"
      moduleSubtitle="Un carré de côté a + b se coupe en quatre morceaux. Compte-les : (a + b)² n’est pas a² + b²."
      estimatedTime="10 min"
      brief={{ tag: '📐 Mission 03', title: 'Un carré de côté a + b. Son aire, c’est (a + b)². Mais aussi la somme de ses morceaux.', tone: 'indigo', body: <p>Règle a et b, compte les morceaux, et lis l’identité sur les aires.</p> }}
      steps={[
        {
          num: 1, title: 'Le carré de côté a + b', subtitle: 'Change a et b au moins deux fois. Combien de rectangles ab ?', done: seen.size >= 2 && tested.size >= 2 && plusDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="(x + 3)² est-il égal à x² + 9 ?" options={[{ id: 'oui', label: 'Oui' }, { id: 'non', label: 'Non' }]} value={prediction} onChange={setPrediction} disabled={tested.size >= 2} />
              <IdentityGrid a={a} b={b} mode="plus" onA={bump(setA, 'a')} onB={bump(setB, 'b')} />
              <ValueTable columns={[{ id: 'l', label: <MathText>{'$(x+3)^{2}$'}</MathText>, fn: (x) => (x + 3) ** 2 }, { id: 'r', label: <MathText>{'$x^{2}+9$'}</MathText>, fn: (x) => x * x + 9 }, { id: 'd', label: <MathText>{'$x^{2}+6x+9$'}</MathText>, fn: (x) => x * x + 6 * x + 9 }]} xs={[1, 2, 0, -3, 10]} tested={tested} onTest={(v) => { const s = new Set(tested); s.add(v); setTested(s); if (s.size === 2) kit.react(true); }} caption="Teste au moins deux valeurs." />
              {/* Le découpage du carré vient de compter les morceaux : c'est
                  l'instant où « développer » se nomme, avant la question. */}
              {seen.size >= 2 && tested.size >= 2 && (
                <KnowledgeBrick
                  id="developper"
                  variant="new"
                  compact
                  lead={<>Tu viens de découper (a + b)² en morceaux — a², ab, ab, b² — et de retrouver la somme. Transformer un produit en somme, c’est <strong>développer</strong>.</>}
                />
              )}
              {seen.size >= 2 && tested.size >= 2 && (
                <TapQuestion prompt="Que vaut (a + b)² ?" options={['a² + 2ab + b² : le grand carré, les DEUX rectangles ab, le petit carré', 'a² + b²', 'a² + ab + b²']} cols={1} correct={0}
                  requires={['developper', 'calcul-litteral', 'carre-nombre']}
                  explain={<>{prediction === 'non' ? 'Ta prédiction : non. Exact' : prediction === 'oui' ? 'Ta prédiction : oui. Le carré te contredit' : 'Le carré tranche'} : il manque les deux rectangles ab. (x + 3)² = x² + 6x + 9, et le tableau le confirme pour chaque x — x² + 9 ne s’accorde qu’en x = 0.</>}
                  explainWrong="Compte les morceaux du carré : a², ab, encore ab, b². Deux rectangles, pas un, pas zéro : (a + b)² = a² + 2ab + b². Le tableau montre que x² + 9 rate dès x = 1 (16 ≠ 10)."
                  solved={plusDone} onAnswered={() => setPlusDone(true)} />
              )}
              {plusDone && (
                <KnowledgeBrick
                  id="mem-carre-somme"
                  variant="new"
                  compact
                  lead={<>Le piège du module : (a + b)² n’est jamais a² + b², il manque le double produit 2ab.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le carré de côté a − b', subtitle: 'On part du carré a², on retire deux bandes… et on a retiré le coin deux fois.', done: minusDone,
          content: (
            <div className="space-y-3">
              <IdentityGrid a={a2} b={b2} mode="minus" onA={setA2} onB={setB2} aRange={[3, 6]} bRange={[1, 3]} />
              <TapQuestion prompt="Que vaut (a − b)² ?" options={['a² − 2ab + b²', 'a² − b²', 'a² − 2ab − b²']} cols={3} correct={0}
                requires={['developper', 'mem-carre-somme']}
                explain="Retirer les deux bandes ab enlève le coin b² deux fois : il faut le remettre une fois. (a − b)² = a² − 2ab + b². Le double produit est négatif, le b² reste positif."
                explainWrong="Regarde le coin rose : il appartient aux DEUX bandes retirées. Enlevé deux fois, on le rajoute une fois : a² − 2ab + b², avec + b²."
                solved={minusDone} onAnswered={() => setMinusDone(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'L’équerre (a + b)(a − b)', subtitle: 'Un carré a² auquel on retire un coin b².', done: diffDone,
          content: (
            <div className="space-y-3">
              <IdentityGrid a={a3} b={b3} mode="diff" onA={setA3} onB={setB3} aRange={[3, 6]} bRange={[1, 3]} />
              <TapQuestion prompt="L’équerre (a² − b²) se découpe en a(a − b) + b(a − b). Donc :" options={['a² − b² = (a − b)(a + b)', 'a² − b² = (a − b)²', 'a² − b² = a² − 2ab + b²']} cols={1} correct={0}
                requires={['developper', 'mem-carre-somme']}
                explain="a(a − b) + b(a − b) = (a + b)(a − b) : le facteur (a − b) est commun. C’est la troisième identité : (a + b)(a − b) = a² − b² — les termes ab et −ab s’annulent."
                explainWrong="L’équerre vaut a² − b² ; ses deux morceaux ont le facteur (a − b) en commun : a(a − b) + b(a − b) = (a + b)(a − b). Ce n’est pas un carré : (a − b)² a un −2ab."
                solved={diffDone} onAnswered={() => setDiffDone(true)} />
              {/* Les trois cas (a+b)², (a−b)², (a+b)(a−b) viennent d'être
                  découverts un par un : c'est l'instant où elles se nomment
                  ENSEMBLE, avant le drill de l'étape 4 qui les redemande toutes. */}
              {diffDone && (
                <KnowledgeBrick
                  id="identites-remarquables"
                  variant="new"
                  lead={<>Tu viens de retrouver les trois développements sur des aires : ce sont les trois <strong>identités remarquables</strong>.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Développe en série', done: batchDone,
          content: (
            <BatchChoiceQuestion rows={[
              { id: 'r1', label: '(x + 5)²', options: ['x² + 25', 'x² + 10x + 25', 'x² + 5x + 25'], correct: 1 },
              { id: 'r2', label: '(2x − 3)²', options: ['4x² − 9', '4x² − 12x + 9', '4x² − 6x + 9'], correct: 1, correction: '(2x)² − 2 · 2x · 3 + 3².' },
              { id: 'r3', label: '(x + 4)(x − 4)', options: ['x² − 16', 'x² − 8x − 16', 'x² + 16'], correct: 0 },
              { id: 'r4', label: '(x + 2)(3x − 1)', options: ['3x² − 2', '3x² + 5x − 2', '3x² + 6x − 2'], correct: 1, correction: 'x·3x + x·(−1) + 2·3x + 2·(−1).' },
            ]}
              requires={['identites-remarquables', 'developper', 'mem-carre-somme']}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Développer, c’est distribuer chaque terme sur chaque terme — quatre produits pour deux binômes ; les identités remarquables sont des raccourcis à connaître.</Feedback>}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
