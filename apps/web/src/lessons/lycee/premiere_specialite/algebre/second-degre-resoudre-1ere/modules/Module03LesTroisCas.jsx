import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrinomePlot from '../components/TrinomePlot';
import {
  TRINOMES, discriminant, roots, parseSigned, fr, trinomeText, solutionsText,
} from '../components/quadUtils';

/**
 * Module 3 — DÉCOUVERTE : la formule, et les trois cas.
 *
 * Étape 1  Δ > 0 : la formule (−b ± √Δ)/(2a) appliquée sur 2x² − x − 3, dont
 *          l'élève a déjà calculé Δ = 25 au module 2. Le mot « racine » est
 *          posé ici, pas avant.
 * Étape 2  Δ = 0 : les deux valeurs se confondent — une seule racine, et la
 *          courbe TOUCHE l'axe sans le traverser.
 * Étape 3  Δ < 0 : rien à calculer, et c'est une réponse complète. La
 *          conception erronée « Δ < 0 = j'ai raté mon calcul » est confrontée.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 calcul → briques `racine-trinome`
 * puis `formule-racines` ; étape 3 → briques `trois-cas-selon-delta` et
 * `methode-resoudre-second-degre`.
 *
 * PÉRIMÈTRE : on ne factorise pas encore (module 5) et l'on ne parle jamais du
 * SIGNE du trinôme sur un intervalle — c'est la leçon voisine.
 */
export default function Module03LesTroisCas() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const T2 = TRINOMES.deuxRacines;      // 2x² − x − 3, Δ = 25, racines −1 et 1,5
  const T1 = TRINOMES.racineDouble;     // x² − 6x + 9, Δ = 0, racine double 3
  const T0 = TRINOMES.sansRacine;       // x² + 2x + 3, Δ = −8, aucune racine

  const d2 = discriminant(T2.a, T2.b, T2.c);
  const r2 = roots(T2.a, T2.b, T2.c);
  const d1 = discriminant(T1.a, T1.b, T1.c);
  const r1 = roots(T1.a, T1.b, T1.c);
  const d0 = discriminant(T0.a, T0.b, T0.c);

  const done1 = q1a && q1b;

  const steps = [
    {
      num: 1,
      title: 'Δ > 0 : deux racines',
      subtitle:
        'Reprends l’équation du module précédent : 2x² − x − 3 = 0, dont tu as trouvé Δ = 25. La formule donne les deux solutions d’un coup.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-center">
            <MathText>{'$$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$'}</MathText>
            <div className="mt-3 text-sm text-sky-900">
              Ici a = {fr(T2.a)}, b = {fr(T2.b)}, Δ = {fr(d2)}, et √{fr(d2)} = {fr(Math.sqrt(d2))}.
            </div>
            <div className="mt-2 font-mono text-sm text-sky-900">
              x = (1 ± {fr(Math.sqrt(d2))}) ÷ 4
            </div>
          </div>
          <NumericQuestion
            prompt={<>La plus PETITE des deux solutions, celle qui prend le signe −.</>}
            expected={r2[0]}
            parse={parseSigned}
            display={fr(r2[0])}
            // La formule est AFFICHÉE juste au-dessus et appliquée pour la
            // première fois ici : la question la DÉCOUVRE, elle ne peut pas
            // l'exiger. Ce qu'elle exige, c'est Δ, posé au module 2.
            requires={['discriminant', 'mem-delta']}
            explain={`x₁ = (1 − 5) ÷ 4 = −4 ÷ 4 = ${fr(r2[0])}. Vérification : 2 × 1 − (−1) − 3 = 2 + 1 − 3 = 0. ✔`}
            explainFor={(n) =>
              n === 1
                ? 'Attention au −b : b vaut −1, donc −b vaut +1. Puis (1 − 5) ÷ 4 = −1.'
                : n === -4
                ? 'Tu as arrêté au calcul du haut : 1 − 5 = −4. Il reste à diviser par 2a = 4, ce qui donne −1.'
                : null
            }
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          <NumericQuestion
            prompt={<>Et la plus GRANDE, celle qui prend le signe +.</>}
            expected={r2[1]}
            parse={parseSigned}
            display={fr(r2[1])}
            requires={['discriminant', 'mem-delta']}
            explain={`x₂ = (1 + 5) ÷ 4 = 6 ÷ 4 = ${fr(r2[1])}. Vérification : 2 × 2,25 − 1,5 − 3 = 4,5 − 4,5 = 0. ✔`}
            explainFor={(n) =>
              n === 6
                ? 'C’est le calcul du haut seul : 1 + 5 = 6. La barre de fraction passe sous tout, il faut encore diviser par 4.'
                : n === 3
                ? 'Tu as divisé par 2 au lieu de 2a. Ici a = 2, donc 2a = 4, et 6 ÷ 4 = 1,5.'
                : null
            }
            solved={q1b}
            onAnswered={() => setQ1b(true)}
          />
          {done1 && (
            <>
              <TrinomePlot trinome={T2} />
              <Feedback tone="ok">
                Les deux nombres trouvés, {fr(r2[0])} et {fr(r2[1])}, sont exactement les abscisses
                des deux points où la courbe traverse l’axe. L’ensemble des solutions s’écrit{' '}
                <strong>{solutionsText(T2.a, T2.b, T2.c)}</strong>.
              </Feedback>
              <KnowledgeBrick
                id="racine-trinome"
                variant="new"
                lead={<>Ces deux nombres portent un nom, et c’est le même que celui des points sur l’axe.</>}
              />
              <KnowledgeBrick
                id="formule-racines"
                variant="new"
                lead={<>La formule que tu viens d’appliquer deux fois.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Δ = 0 : une racine double',
      subtitle: `Nouvelle équation : ${trinomeText(T1.a, T1.b, T1.c)} = 0. Son discriminant est nul.`,
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-center font-mono text-lg font-black text-amber-900">
              {trinomeText(T1.a, T1.b, T1.c)} = 0
            </div>
            <div className="mt-2 text-center text-sm text-amber-900">
              Δ = (−6)² − 4 × 1 × 9 = 36 − 36 = <strong>{fr(d1)}</strong>
            </div>
            <p className="mt-2 text-xs text-amber-800">
              Quand Δ = 0, √Δ = 0 : les deux morceaux ± 0 donnent la même valeur. La formule ne
              change pas, elle rend simplement deux fois le même nombre.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Quelle est cette unique solution ?</>}
            expected={r1[0]}
            parse={parseSigned}
            display={fr(r1[0])}
            requires={['formule-racines', 'discriminant']}
            explain={`x = (6 ± 0) ÷ 2 = ${fr(r1[0])}. Vérification : 9 − 18 + 9 = 0. ✔ On dit que ${fr(r1[0])} est une racine DOUBLE : elle compte deux fois, même si elle ne donne qu’un point.`}
            explainFor={(n) =>
              n === -3
                ? 'Attention au −b : b vaut −6, donc −b vaut +6. La solution est 6 ÷ 2 = 3.'
                : n === 6
                ? 'C’est le calcul du haut : il reste à diviser par 2a = 2, ce qui donne 3.'
                : n === 9
                ? 'C’est le coefficient c, pas la solution. La formule donne (6 ± 0) ÷ 2 = 3.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <TrinomePlot trinome={T1} />
              <Feedback tone="ok">
                Regarde la courbe : elle <strong>touche</strong> l’axe en {fr(r1[0])} sans le
                traverser. C’est exactement l’instant de la fusion du module 1 — les deux points
                sont devenus un seul.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Δ < 0 : aucune solution, et c’est une réponse',
      subtitle: `Dernière équation : ${trinomeText(T0.a, T0.b, T0.c)} = 0, avec Δ = ${fr(d0)}.`,
      done: q3,
      content: (
        <div className="space-y-3">
          <TrinomePlot trinome={T0} />
          <TapQuestion
            prompt={`Δ = ${fr(d0)}. Que doit-on écrire comme conclusion ?`}
            options={[
              `L’équation n’a pas de solution réelle : l’ensemble des solutions est vide, ${solutionsText(T0.a, T0.b, T0.c)}`,
              'Il faut recommencer le calcul de Δ : un discriminant ne peut pas être négatif',
              `La solution est ${fr(d0)}`,
              'Il faut quand même appliquer la formule, en écrivant √(−8)',
            ]}
            correct={0}
            cols={1}
            requires={['discriminant', 'formule-racines', 'un-nombre-predit']}
            explain={`Un discriminant négatif est un résultat parfaitement normal : il signale qu’aucun nombre ne peut annuler l’expression. La courbe le confirme — elle reste entièrement au-dessus de l’axe. « Pas de solution » est une conclusion complète, pas un échec.`}
            explainWrong={`Δ vaut ${fr(d0)}, et c’est juste : Δ = 4 − 20. Aucun nombre élevé au carré ne donne −8, donc √Δ ne s’écrit pas ici. Et Δ n’est pas une solution — c’est le nombre qui compte les solutions. Ici il en compte zéro.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Et pourtant l’expression {trinomeText(T0.a, T0.b, T0.c)} existe pour tout x : elle
                prend simplement toujours des valeurs strictement positives. « Pas de racine » ne
                veut pas dire « pas de courbe ».
              </Feedback>
              <KnowledgeBrick
                id="trois-cas-selon-delta"
                variant="new"
                lead={<>Les trois situations que tu viens de parcourir, rassemblées.</>}
              />
              <KnowledgeBrick
                id="methode-resoudre-second-degre"
                variant="new"
                lead={<>Et l’ordre des gestes, toujours le même.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les trois cas"
      moduleSubtitle="Une seule formule, trois conclusions possibles"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Lesquelles, et combien',
        tone: 'indigo',
        body: (
          <p>
            Δ a dit combien. Une formule unique — (−b ± √Δ) ÷ (2a) — dit maintenant lesquelles, et
            son comportement dans les trois cas est exactement ce que la courbe montrait.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La méthode complète.</strong> Ranger, relever a, b, c, calculer Δ, conclure — et
          seulement ensuite appliquer la formule. Au module suivant, tu la dérouleras seul.
        </KnowledgeSnapshot>
      }
    />
  );
}
