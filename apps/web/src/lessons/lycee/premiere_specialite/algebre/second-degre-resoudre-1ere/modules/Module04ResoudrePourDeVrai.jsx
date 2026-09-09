import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrinomePlot from '../components/TrinomePlot';
import {
  TRINOMES, discriminant, roots, parseSigned, fr, trinomeText, solutionsText,
} from '../components/quadUtils';

/**
 * Module 4 — MANIPULATION : dérouler la méthode seul, sur trois équations.
 *
 * Étape 1  a < 0 : −x² + 2x + 3 = 0. Le piège du signe de a, et la courbe
 *          tournée vers le bas — les racines restent pourtant rangées de la
 *          plus petite à la plus grande.
 * Étape 2  Δ < 0 TRAITÉ POUR DE VRAI : x² + x + 1 = 0. L'élève doit conclure
 *          « aucune solution » sans qu'on le lui souffle, et la question porte
 *          sur ce qu'il ÉCRIT.
 * Étape 3  racines IRRATIONNELLES : x² − 2x − 1 = 0, Δ = 8. √8 n'est pas
 *          entier, et il ne faut pas s'arrêter pour autant.
 *
 * CONNAISSANCES : ce module POSE une brique et n'en pose aucune de neuve — il
 * fait TRAVAILLER `methode-resoudre-second-degre`, `formule-racines` et
 * `trois-cas-selon-delta`, toutes établies au module 3. Chaque question les
 * exige par `requires`.
 *
 * AUCUNE MANIPULATION GELÉE : ce module n'a pas de laboratoire à geler ; les
 * figures illustrent la vérification et restent visibles après validation.
 */
export default function Module04ResoudrePourDeVrai() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const TN = TRINOMES.aNegatif;         // −x² + 2x + 3, Δ = 16, racines −1 et 3
  const TI = TRINOMES.irrationnel;      // x² − 2x − 1, Δ = 8, racines 1 ± √2

  const dN = discriminant(TN.a, TN.b, TN.c);
  const rN = roots(TN.a, TN.b, TN.c);
  const dSans = discriminant(1, 1, 1);  // −3
  const dI = discriminant(TI.a, TI.b, TI.c);
  const rI = roots(TI.a, TI.b, TI.c);

  const steps = [
    {
      num: 1,
      title: 'Quand a est négatif',
      subtitle: `Résous ${trinomeText(TN.a, TN.b, TN.c)} = 0. Ici a = ${fr(TN.a)} : le signe fait partie du coefficient, dans Δ comme dans 2a.`,
      done: q1a && q1b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-center font-mono text-lg font-black text-emerald-900">
              {trinomeText(TN.a, TN.b, TN.c)} = 0
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-white border border-emerald-200 px-2 py-2"><span className="text-emerald-600">a =</span> <strong>{fr(TN.a)}</strong></div>
              <div className="rounded-lg bg-white border border-emerald-200 px-2 py-2"><span className="text-emerald-600">b =</span> <strong>{fr(TN.b)}</strong></div>
              <div className="rounded-lg bg-white border border-emerald-200 px-2 py-2"><span className="text-emerald-600">c =</span> <strong>{fr(TN.c)}</strong></div>
            </div>
          </div>
          <NumericQuestion
            prompt={<>Premier geste : calcule Δ.</>}
            expected={dN}
            parse={parseSigned}
            display={fr(dN)}
            requires={['methode-calculer-delta', 'discriminant']}
            explain={`Δ = 2² − 4 × (−1) × 3 = 4 − (−12) = 4 + 12 = ${fr(dN)}. Le produit 4ac vaut −12 ; le retrancher revient à l’ajouter.`}
            explainFor={(n) =>
              n === -8
                ? 'Tu as calculé 4 − 12. Mais 4ac = 4 × (−1) × 3 = −12, et soustraire −12 c’est ajouter 12. Δ = 4 + 12 = 16.'
                : null
            }
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <NumericQuestion
            prompt={<>Δ = {fr(dN)} donc √Δ = {fr(Math.sqrt(dN))}. Quelle est la plus PETITE des deux solutions ?</>}
            expected={rN[0]}
            parse={parseSigned}
            display={fr(rN[0])}
            requires={['formule-racines', 'methode-resoudre-second-degre']}
            explain={`2a = −2. Les deux valeurs sont (−2 − 4) ÷ (−2) = 3 et (−2 + 4) ÷ (−2) = −1. La plus petite est ${fr(rN[0])}. Vérification : −1 − 2 + 3 = 0. ✔`}
            explainFor={(n) =>
              n === 3
                ? 'C’est bien une solution, mais c’est la plus GRANDE. Avec 2a négatif, le signe − au numérateur donne la plus grande valeur : range tes deux résultats avant de conclure.'
                : n === 1
                ? 'On divise par 2a, qui vaut ici −2 et non 2. Diviser par un nombre négatif change le signe du résultat.'
                : null
            }
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {q1a && q1b && (
            <>
              <TrinomePlot trinome={TN} />
              <Feedback tone="ok">
                a négatif retourne la courbe vers le bas — mais cela ne change ni la méthode, ni
                l’ordre des solutions : {solutionsText(TN.a, TN.b, TN.c)}. On les range toujours de
                la plus petite à la plus grande, quel que soit le signe de a.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand il n’y a rien à trouver',
      subtitle: 'Résous x² + x + 1 = 0. Va jusqu’au bout, y compris si le bout arrive vite.',
      done: q2a && q2b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-rose-900">x² + x + 1 = 0</div>
            <div className="mt-1 text-xs text-rose-800">a = 1, b = 1, c = 1</div>
          </div>
          <NumericQuestion
            prompt={<>Calcule Δ.</>}
            expected={dSans}
            parse={parseSigned}
            display={fr(dSans)}
            requires={['methode-calculer-delta']}
            explain={`Δ = 1² − 4 × 1 × 1 = 1 − 4 = ${fr(dSans)}.`}
            explainFor={(n) =>
              n === 5
                ? 'Tu as ajouté au lieu de soustraire : la formule est b² − 4ac, donc 1 − 4 = −3.'
                : n === 3
                ? 'Il manque le signe : 1 − 4 vaut −3, pas 3. Et ce signe est toute l’information.'
                : null
            }
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          <TapQuestion
            prompt={`Δ = ${fr(dSans)}. Quelle est la conclusion à écrire ?`}
            options={[
              'L’équation n’a pas de solution : S = ∅',
              `S = { ${fr(dSans)} }`,
              'S = { 0 } puisqu’on ne trouve rien',
              'On applique quand même la formule en écrivant √(−3)',
            ]}
            correct={0}
            cols={1}
            requires={['trois-cas-selon-delta', 'methode-resoudre-second-degre']}
            explain="Δ < 0 : la formule ne s’applique pas, car aucun nombre n’a −3 pour carré. On écrit que l’ensemble des solutions est vide, et l’exercice est terminé — correctement."
            explainWrong="Δ n’est pas une solution, et « ne rien trouver » n’est pas « trouver 0 » : vérifie, 0² + 0 + 1 = 1, qui n’est pas nul. La bonne réponse est l’ensemble vide."
            solved={q2b}
            onAnswered={() => setQ2b(true)}
          />
          {q2a && q2b && (
            <Feedback tone="ok">
              Une équation sans solution est une équation résolue. Ce qui serait faux, c’est de
              laisser la question en suspens — ou d’inventer une solution pour remplir la ligne.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand Δ n’est pas un carré parfait',
      subtitle: `Résous ${trinomeText(TI.a, TI.b, TI.c)} = 0. Ici Δ = ${fr(dI)}, et √${fr(dI)} n’est pas un nombre entier.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
            <div className="font-mono text-lg font-black text-sky-900">{trinomeText(TI.a, TI.b, TI.c)} = 0</div>
            <div className="mt-1 text-sm text-sky-900">Δ = (−2)² − 4 × 1 × (−1) = 4 + 4 = <strong>{fr(dI)}</strong></div>
          </div>
          <TapQuestion
            prompt={`√${fr(dI)} ne tombe pas sur un entier. Que fait-on ?`}
            options={[
              'On poursuit : la formule s’applique quand même, et les solutions s’écrivent avec une racine carrée',
              'On arrête : sans racine carrée entière, l’équation n’a pas de solution',
              'On arrondit Δ à 9 pour pouvoir continuer',
              'On recommence le calcul de Δ jusqu’à tomber sur un carré parfait',
            ]}
            correct={0}
            cols={1}
            requires={['trois-cas-selon-delta', 'formule-racines']}
            explain={`Δ = ${fr(dI)} est positif : il y a bel et bien deux solutions. Elles valent (2 ± √${fr(dI)}) ÷ 2, c’est-à-dire 1 ± √2 — deux nombres parfaitement définis, simplement pas entiers.`}
            explainWrong={`Ce qui compte est le SIGNE de Δ, pas sa jolie forme. Δ = ${fr(dI)} > 0 : deux solutions. Arrondir Δ changerait l’équation et donnerait des valeurs qui ne l’annulent pas.`}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <NumericQuestion
            prompt={<>Donne une valeur approchée de la plus GRANDE solution, à 0,01 près.</>}
            expected={Math.round(rI[1] * 100) / 100}
            parse={parseSigned}
            display={fr(rI[1], { maxDecimals: 2 })}
            requires={['formule-racines', 'methode-resoudre-second-degre']}
            explain={`x₂ = (2 + √8) ÷ 2 = 1 + √2 ≈ ${fr(rI[1], { maxDecimals: 2 })}. La valeur EXACTE est 1 + √2 ; ${fr(rI[1], { maxDecimals: 2 })} n’en est qu’une approximation, à réserver au dessin.`}
            explainFor={(n) =>
              n === 1.41
                ? 'C’est √2 tout seul. La solution est 1 + √2 : il reste à ajouter le 1 qui vient de −b ÷ 2a.'
                : n === 4.83
                ? 'C’est le numérateur seul : 2 + √8 ≈ 4,83. Il reste à diviser par 2a = 2, ce qui donne ≈ 2,41.'
                : null
            }
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <>
              <TrinomePlot trinome={TI} />
              <Feedback tone="ok">
                Les deux points sur l’axe sont à peu près en {fr(rI[0], { maxDecimals: 2 })} et{' '}
                {fr(rI[1], { maxDecimals: 2 })} — exactement 1 − √2 et 1 + √2. La forme exacte
                s’écrit avec le radical ; l’approximation ne sert qu’à situer les points.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Résoudre pour de vrai"
      moduleSubtitle="Trois équations, trois cas, une seule méthode"
      estimatedTime="12 min"
      brief={{
        tag: 'Entraînement',
        title: 'La méthode, du début à la fin',
        tone: 'indigo',
        body: (
          <p>
            Ranger, relever a, b, c avec leurs signes, calculer Δ, conclure, puis appliquer la
            formule. Trois équations qui piègent chacune à un endroit différent.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Les racines connues, la factorisation est offerte.</strong> Au module suivant,
          les deux nombres que tu viens de calculer deviennent une écriture en produit.
        </KnowledgeSnapshot>
      }
    />
  );
}
