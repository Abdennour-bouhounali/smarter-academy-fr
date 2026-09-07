import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { POINTS4, fromTwoPoints, parseDec, formatDec } from '../components/affineUtils';

/**
 * Module 4 — MANIPULATION : retrouver la fonction à partir de deux données.
 * Step 1  a par le taux entre (1 ; 5) et (4 ; 11).  Step 2  b en remontant à x = 0 (b = f(x₁) − a·x₁).
 * Step 3  la droite tracée confirme.  Step 4  lire a et b sur un graphique (escalier, axe).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La méthode « a par le taux, puis b en remontant à zéro » n'existait que
 *   dans les `explain` et dans l'« À retenir » du pied, c'est-à-dire APRÈS les
 *   quatre questions qui l'exigeaient. Les deux premières étapes ne demandent
 *   désormais que ce que le module 2 a déjà établi (le taux, sa formule), et
 *   la méthode complète est posée à l'instant où le calcul vient d'être fait :
 *     étape 1  a par le taux  (`requires` : formule-taux, taux-accroissement)
 *     étape 2  b en remontant à zéro → brique `methode-determiner-affine`
 *     étape 3  brique `mem-deux-points`, puis la vérification sur la droite
 *     étape 4  la lecture graphique (`requires` : methode-lire-a-b-graphique)
 *   Aucun laboratoire ici : les deux plans sont des figures de lecture
 *   (`CoordPlane`), il n'y avait donc rien à dégeler.
 */
const F = fromTwoPoints(POINTS4[0], POINTS4[1]);   // a = 2, b = 3
const RANGE = { xMin: -1, xMax: 6, yMin: -1, yMax: 13 };
const G = { a: -1.5, b: 6 };
const G_RANGE = { xMin: -1, xMax: 6, yMin: -4, yMax: 8 };

export default function Module04RetrouverLaFonction() {
  const [qa, setQa] = useState(false); const [qb, setQb] = useState(false); const [q3, setQ3] = useState(false); const [q4, setQ4] = useState(false);
  const plane = (withLine) => (
    <CoordPlane range={RANGE} unit={40} unitY={30} xStep={1} yStep={1} labelEvery={2} points={POINTS4.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: i === 0 ? '#0284c7' : '#d97706' }))}
      functions={withLine ? [{ id: 'f', a: F.a, b: F.b, tone: 'sky' }] : []} intercept={withLine ? { y: F.b, label: `b = ${formatDec(F.b)}` } : null} staircase={withLine ? { from: POINTS4[0], a: F.a, run: 1 } : null} caption={false}
      ariaLabel={`Deux points connus : (1 ; 5) et (4 ; 11)${withLine ? ', et la droite qui les relie' : ''}`} />
  );
  const steps = [
    {
      num: 1, title: 'D’abord a', subtitle: 'Une fonction affine f vérifie f(1) = 5 et f(4) = 11. Deux données suffisent.', done: qa,
      content: (
        <NumericQuestion above={plane(false)} prompt="Coefficient directeur a ?" expected={2} parse={parseDec} display={formatDec(2)}
          explain={<span><MathText>{'$a = \\dfrac{11 - 5}{4 - 1} = \\dfrac{6}{3} = 2$'}</MathText> — f gagne 2 par unité de x.</span>}
          explainFor={(n) => (n === 6 ? '6 est la différence des images ; divise par la différence des x (4 − 1 = 3) : a = 2.' : n === 0.5 ? 'Tu as inversé : (différence des images) ÷ (différence des x) = 6 ÷ 3 = 2.' : n === -2 ? 'Prends les différences dans le même ordre : (11 − 5) ÷ (4 − 1) = 2.' : 'a = (11 − 5) ÷ (4 − 1) = 2.')}
          requires={['taux-accroissement', 'formule-taux']}
          solved={qa} onAnswered={() => setQa(true)} />
      ),
    },
    {
      num: 2, title: 'Puis b', subtitle: 'f(x) = 2x + b, et f(1) = 5.', done: qb,
      content: (
        <div className="space-y-3">
          <NumericQuestion prompt="Ordonnée à l’origine b ?" expected={3} parse={parseDec} display={formatDec(3)}
            explain={<span>5 = 2 × 1 + b, donc b = 5 − 2 = <strong>3</strong>. Vérification avec l’autre point : 2 × 4 + 3 = 11 ✓. f(x) = 2x + 3.</span>}
            explainFor={(n) => (n === 5 ? '5 est f(1), pas f(0). Remonte d’un pas : b = 5 − 2 × 1 = 3.' : n === 7 ? 'Signe : b = 5 − 2, pas 5 + 2.' : 'f(1) = 2 × 1 + b = 5 donne b = 3.')}
            requires={['fonction-affine-ab', 'taux-accroissement']}
            solved={qb} onAnswered={() => setQb(true)} />
          {qb && <KnowledgeBrick id="methode-determiner-affine" variant="new" lead={<>Tu viens de faire les deux gestes dans l’ordre : le taux d’abord, la remontée à zéro ensuite. C’est toute la méthode.</>} />}
        </div>
      ),
    },
    {
      num: 3, title: 'La droite confirme', done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="mem-deux-points" variant="new" lead={<>La méthode en une ligne, à garder pour la suite.</>} />
            <TapQuestion above={plane(true)} prompt="Sur la droite de f(x) = 2x + 3, que voit-on ?"
            options={['Elle passe par (0 ; 3) et par les deux points ; d’un point au suivant, +1 en x donne +2 en y', 'Elle passe par (3 ; 0)', 'Elle passe par (2 ; 3)', 'Elle ne passe pas par (4 ; 11)']}
            correct={0} cols={1}
            explain="b = 3 est l’ordonnée du point sur l’axe vertical ; l’escalier +1 → +2 est le coefficient directeur. Les deux données sont sur la droite : la fonction retrouvée est la bonne."
            explainWrong="Regarde le point marqué b = 3 sur l’axe vertical et l’escalier +1 → +2 : c’est bien y = 2x + 3, et les deux points donnés sont dessus."
            requires={['methode-determiner-affine', 'mem-deux-points']}
            solved={q3} onAnswered={() => setQ3(true)} />
        </div>
      ),
    },
    {
      num: 4, title: 'Lire a et b sur un graphique', done: q4,
      content: (
        <BatchChoiceQuestion intro={<CoordPlane range={G_RANGE} unit={40} unitY={30} xStep={1} yStep={1} labelEvery={2} functions={[{ id: 'g', a: G.a, b: G.b, tone: 'rose', label: 'g' }]} intercept={{ y: G.b, label: `b = ${formatDec(G.b)}` }} staircase={{ from: { x: 0, y: G.b }, a: G.a, run: 2 }} caption={false} ariaLabel="La droite de g, avec le point (0 ; 6) et un escalier +2 → −3" />}
          rows={[
            { id: 'r1', label: 'b (ordonnée à l’origine) = ?', options: ['6', '−1,5', '0'], correct: 0, correction: 'le point sur l’axe vertical' },
            { id: 'r2', label: 'De x = 0 à x = 2, g passe de 6 à 3 : a = ?', options: ['−1,5', '−3', '3'], correct: 0, correction: '(3 − 6) ÷ 2' },
            { id: 'r3', label: 'g(x) = ?', options: ['−1,5x + 6', '6x − 1,5', '−3x + 6'], correct: 0, correction: 'a puis b' },
            { id: 'r4', label: 'g est', options: ['décroissante', 'croissante'], correct: 0, correction: 'a < 0' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Sur un graphique : b là où la droite coupe l’axe vertical, a par un escalier (variation de y ÷ variation de x, signe compris).</Feedback>}
          requires={['methode-lire-a-b-graphique', 'regle-signe-a-variations', 'methode-determiner-affine']}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];
  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Retrouver la fonction" moduleSubtitle="Deux données : a par le taux, b en remontant à zéro" estimatedTime="10 min"
      brief={{ tag: 'Manipulation', title: 'Deux points suffisent', tone: 'emerald', body: <p>Une fonction affine est entièrement déterminée par deux valeurs : le taux donne a, puis une des deux valeurs donne b. Sur un graphique, c’est la même chose — avec l’escalier et l’axe.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4}>Module suivant : quand le réservoir est-il vide ? à moitié ? Le zéro, le signe, et des inéquations.</KnowledgeSnapshot>} />
  );
}
