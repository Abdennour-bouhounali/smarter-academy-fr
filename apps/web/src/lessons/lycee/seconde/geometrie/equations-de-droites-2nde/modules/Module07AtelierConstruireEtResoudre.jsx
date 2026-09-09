import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import LineBuilder from '../components/LineBuilder';
import LineScene from '../components/LineScene';
import {
  lineFromPoints, lineFromCartesian, lineFromSlope, reducedOf, cartesianOf, formatReduced, formatCartesian, formatPoint, formatVec,
  slopeFromPoints, isOnLine,
} from '../components/lineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 7 — PRACTICE LAB : « Atelier : construire et résoudre ».
 *
 * Scaffolding décroissant : deux points sur figure (pente puis p), point +
 * vecteur (cartésien), point + pente (sans figure), lire une équation,
 * tracer une droite cartésienne (LineBuilder), un problème concret.
 */
const P1 = { x: -3, y: -1 };
const Q1 = { x: 2, y: 9 };
const L1 = lineFromPoints(P1, Q1);
const R1 = reducedOf(L1);                          // y = 2x + 5
const A2 = { x: 2, y: -1 };
const U2 = { x: 3, y: -2 };
const C2 = cartesianOf({ A: A2, u: U2 });          // 2x + 3y − 1 = 0
const B3 = { x: -1, y: 4 };
const R3 = reducedOf(lineFromSlope(B3, -3));      // y = −3x + 1
const CAR4 = { a: 3, b: -2, c: 6 };
const L5 = lineFromCartesian(CAR4);
const RAMP = lineFromPoints({ x: 0, y: 1 }, { x: 4, y: 2 });
const RAMP_RED = reducedOf(RAMP);                 // y = 0,25x + 1
const parseSigned = (s) => parseDec(String(s ?? '').replace('−', '-'));

export default function Module07AtelierConstruireEtResoudre() {
  const [n1a, setN1a] = useState(false);
  const [n1b, setN1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [n3, setN3] = useState(false);
  const [b4, setB4] = useState(false);
  const [t5, setT5] = useState(false);
  const [q6, setQ6] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7}
      moduleTitle="Atelier : construire et résoudre"
      moduleSubtitle="Deux points, un point et une flèche, un point et une pente ; lire, tracer, vérifier une rampe."
      estimatedTime="12 min"
      brief={{ tag: '🔧 Mission 07', title: 'Six situations, de moins en moins de figure.', tone: 'indigo', body: <p>À chaque fois : la direction d’abord, puis le point.</p> }}
      steps={[
        {
          num: 1, title: 'Deux points', subtitle: `P ${formatPoint(P1)} et Q ${formatPoint(Q1)}.`, done: n1a && n1b,
          content: (
            <div className="space-y-3">
              <LineScene line={L1} nameA="P" frozen points={[{ id: 'Q', name: 'Q', ...Q1, color: '#e11d48' }]} ariaLabel={`Droite (PQ) ${formatReduced(R1)}`} />
              <NumericQuestion prompt="Pente de (PQ) ?" expected={R1.m} parse={parseSigned} display={formatDec(R1.m)} width="w-24"
                explain="Montée 9 − (−1) = 10, avancée 2 − (−3) = 5 : pente 10 ÷ 5 = 2."
                explainFor={(n) => (n === 0.5 ? 'Tu as divisé l’avancée par la montée : c’est montée ÷ avancée = 10 ÷ 5 = 2.' : n === 10 ? '10 est la montée. Divise par l’avancée 5.' : null)}
                requires={['droite-methode-deux-points', 'droite-calculer-pente']}
                solved={n1a} onAnswered={() => setN1a(true)} />
              {n1a && (
                <NumericQuestion prompt="Équation réduite y = 2x + p. Que vaut p ?" expected={R1.p} parse={parseSigned} display={formatDec(R1.p)} width="w-24"
                  explain="P est sur la droite : −1 = 2 × (−3) + p, donc p = −1 + 6 = 5. Vérifie avec Q : 2 × 2 + 5 = 9 ✓. Équation : y = 2x + 5."
                  explainFor={(n) => (n === -1 ? '−1 est y_P, pas p : remplace x ET y : −1 = 2 × (−3) + p.' : n === -7 ? 'Signe : −1 = −6 + p donne p = −1 + 6 = 5.' : `Avec p = ${String(n).replace('-', '−')}, 2 × (−3) + p ≠ −1 : P ne serait pas dessus. p = 5.`)}
                  requires={['droite-methode-deux-points', 'droite-equation-reduite']}
                  solved={n1b} onAnswered={() => setN1b(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Un point et un vecteur directeur', subtitle: `A ${formatPoint(A2)}, u ${formatVec(U2)}.`, done: q2,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Équation cartésienne de la droite ?"
              options={[formatCartesian(C2), '3x − 2y − 8 = 0', '2x + 3y + 1 = 0', '3x + 2y − 4 = 0']} cols={2} correct={0}
              explain="a = u_y = −2, b = −u_x = −3 : −2x − 3y + c = 0 ; A dessus : −4 + 3 + c = 0, c = 1 ; soit −2x − 3y + 1 = 0, ou 2x + 3y − 1 = 0. Vérifie : le vecteur (−b ; a) = (−3 ; −2) est bien colinéaire à u."
              explainWrong="Les coefficients viennent de u : (a ; b) = (u_y ; −u_x) = (−2 ; −3), puis c avec A : −2 × 2 − 3 × (−1) + c = 0 donne c = 1. Équation 2x + 3y − 1 = 0 (multipliée par −1)."
              requires={['droite-methode-point-vecteur', 'droite-equation-cartesienne']}
              solved={q2} onAnswered={() => setQ2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Un point et une pente', subtitle: `Droite passant par B ${formatPoint(B3)}, de pente −3. Sans figure.`, done: n3,
          content: (
            <div className="space-y-3">
            <NumericQuestion prompt="Équation réduite y = −3x + p. Que vaut p ?" expected={R3.p} parse={parseSigned} display={formatDec(R3.p)} width="w-24"
              explain="4 = −3 × (−1) + p, donc p = 4 − 3 = 1. Équation : y = −3x + 1."
              explainFor={(n) => (n === 4 ? '4 est y_B : p ne vaut y_B que si x_B = 0. Ici 4 = 3 + p.' : n === 7 ? 'Signe : −3 × (−1) = +3, donc 4 = 3 + p et p = 1.' : null)}
              requires={['droite-methode-point-pente', 'droite-equation-reduite']}
              solved={n3} onAnswered={() => setN3(true)} />
            </div>
          ),
        },
        {
          num: 4, title: 'Lire une équation', subtitle: `Droite d’équation ${formatCartesian(CAR4)}.`, done: b4,
          content: (
            <div className="space-y-3">
            <BatchChoiceQuestion
              rows={[
                { id: 'l1', label: 'Un vecteur directeur', options: ['(2 ; 3)', '(3 ; −2)', '(−2 ; −3) seulement'], correct: 0, correction: '(−b ; a) = (2 ; 3) — et (−2 ; −3) aussi, mais pas seulement.' },
                { id: 'l2', label: 'La pente', options: ['1,5', '−1,5', '3'], correct: 0, correction: 'u_y / u_x = 3/2.' },
                { id: 'l3', label: 'Le point de la droite sur l’axe des ordonnées', options: ['(0 ; 3)', '(0 ; 6)', '(0 ; −3)'], correct: 0, correction: 'x = 0 : −2y + 6 = 0, y = 3.' },
              ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>3x − 2y + 6 = 0 ⇔ y = 1,5x + 3 : vecteur directeur (2 ; 3), pente 1,5, ordonnée à l’origine 3.</Feedback>}
              requires={['droite-lire-cartesienne', 'droite-equation-cartesienne']}
              solved={b4} onAnswered={() => setB4(true)} />
            </div>
          ),
        },
        {
          num: 5, title: 'Tracer', subtitle: 'Place P et Q sur la droite 3x − 2y + 6 = 0.', done: t5,
          content: (kit) => (
            <div className="space-y-3">
              <LineBuilder target={L5} showReduced={false} initial={{ P: { x: -5, y: 4 }, Q: { x: 5, y: 4 } }} solved={t5} onSolved={() => setT5(true)} react={kit.react} />
            </div>
          ),
        },
        {
          num: 6, title: 'La rampe', subtitle: 'Une rampe d’accès part de (0 ; 1) et passe par (4 ; 2) — en mètres. Un capteur est fixé en (10 ; 3,5).', done: q6,
          content: (
            <div className="space-y-3">
            <KnowledgeBrick
              id="droite-modeliser"
              variant="new"
              compact
              lead="Une situation réelle devient une droite : voici comment."
            />
            <TapQuestion
              prompt="Le capteur est-il sur la rampe ?"
              options={[`Oui : la rampe est ${formatReduced(RAMP_RED)} et 0,25 × 10 + 1 = 3,5`, 'Non : la rampe est y = 0,5x + 1 et 0,5 × 10 + 1 = 6', 'Oui : 10 est plus grand que 4, donc c’est dans le prolongement', 'Non : le capteur est trop haut']} cols={1} correct={0}
              explain={`Pente (2 − 1)/(4 − 0) = 0,25, p = 1 : ${formatReduced(RAMP_RED)}. En x = 10 : 0,25 × 10 + 1 = 3,5 = y du capteur. Il est sur la rampe — ${isOnLine(RAMP, { x: 10, y: 3.5 }) ? 'exactement' : ''}.`}
              explainWrong="Pente = montée ÷ avancée = (2 − 1) ÷ (4 − 0) = 0,25, donc y = 0,25x + 1. Test : 0,25 × 10 + 1 = 3,5 = ordonnée du capteur. Il est dessus."
              requires={['droite-modeliser', 'droite-appartenance', 'droite-methode-deux-points']}
              solved={q6} onAnswered={() => setQ6(true)} />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          Deux points, un point et une flèche, un point et une pente, une équation à lire, une
          droite à tracer, une rampe à vérifier : tu sais tout faire. À prouver dix fois dans la
          mission finale.
        </KnowledgeSnapshot>
      }
    />
  );
}
