import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ParabolaLab from '../components/ParabolaLab';
import { LAB, discriminant, parseSigned, fr, trinomeText } from '../components/quadUtils';

/**
 * Module 2 — DÉCOUVERTE : le nombre reçoit son nom.
 *
 * Étape 1  le laboratoire revient, cette fois avec le nombre NOMMÉ Δ. Le geste
 *          est le même, le mot est neuf : c'est ce qui rattache le nom au
 *          souvenir du module 1.
 * Étape 2  relever a, b, c AVEC LEURS SIGNES — l'erreur qui coûte le plus cher
 *          dans tout le chapitre — puis calculer Δ.
 * Étape 3  un Δ sur une équation qu'il faut d'abord ranger en « = 0 ».
 * Étape 4  la conclusion : le SIGNE de Δ, et lui seul, donne le nombre de
 *          solutions. On l'énonce, on ne résout toujours rien.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique `discriminant` ;
 * étape 2 calcul → brique `methode-calculer-delta` ; étape 4 → brique
 * `mem-delta`. Rien sur la FORMULE des solutions : c'est le module 3.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable
 * après validation.
 */
export default function Module02LeDiscriminant() {
  const [c1, setC1] = useState(LAB.cFusion);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Les valeurs CITÉES sont recalculées, jamais saisies.
  const deltaA = discriminant(2, -1, -3);       // 25
  const deltaB = discriminant(3, -6, 3);        // 0
  const deltaC = discriminant(1, 2, 5);         // −16

  const steps = [
    {
      num: 1,
      title: 'Le nombre s’appelle le discriminant',
      subtitle:
        'Même courbe, même geste — mais l’afficheur porte désormais son nom : Δ, la lettre grecque delta. Repasse par les trois situations en le lisant.',
      done: q1,
      content: (
        <div className="space-y-3">
          <ParabolaLab
            c={c1}
            onChangeC={setC1}
            nomDuNombre="Δ = b² − 4ac"
          />
          <KnowledgeBrick
            id="discriminant"
            variant="new"
            lead={<>Le nombre que tu as vu basculer au module précédent.</>}
          />
          <TapQuestion
            prompt="Sur cette courbe, a = 1 et b = −4. Que vaut Δ lorsque c = 0 ?"
            options={['16', '−16', '4', '0']}
            correct={0}
            cols={4}
            requires={['discriminant']}
            explain="Δ = b² − 4ac = (−4)² − 4 × 1 × 0 = 16 − 0 = 16. Il est positif, et la courbe coupe bien l’axe en deux points."
            explainWrong="(−4)² vaut 16, pas −16 : un carré est toujours positif. Et 4ac vaut 4 × 1 × 0 = 0, donc il ne retranche rien."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Relever a, b et c avec leurs signes',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="text-sm text-violet-900 mb-2">On travaille sur l’équation :</div>
            <div className="font-mono text-lg font-black text-violet-900 text-center">
              {trinomeText(2, -1, -3)} = 0
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-white border border-violet-200 px-2 py-2"><span className="text-violet-600">a =</span> <strong>2</strong></div>
              <div className="rounded-lg bg-white border border-violet-200 px-2 py-2"><span className="text-violet-600">b =</span> <strong>−1</strong></div>
              <div className="rounded-lg bg-white border border-violet-200 px-2 py-2"><span className="text-violet-600">c =</span> <strong>−3</strong></div>
            </div>
            <p className="mt-3 text-xs text-violet-800">
              « − x » veut dire « −1 × x » : le coefficient b vaut −1, pas 1. Et « − 3 » donne
              c = −3, pas 3. Les signes font partie des coefficients.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Calcule Δ pour cette équation.</>}
            expected={deltaA}
            parse={parseSigned}
            display={fr(deltaA)}
            requires={['discriminant']}
            explain={`Δ = (−1)² − 4 × 2 × (−3) = 1 − (−24) = 1 + 24 = ${fr(deltaA)}. Le produit 4ac est négatif, donc le soustraire revient à ajouter.`}
            explainFor={(n) =>
              n === -23
                ? 'Tu as calculé 1 − 24. Mais 4ac vaut 4 × 2 × (−3) = −24 : soustraire −24, c’est AJOUTER 24. Δ = 1 + 24 = 25.'
                : n === 23
                ? 'Le signe de b² : (−1)² vaut +1 et non −1. Δ = 1 + 24 = 25.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Δ = {fr(deltaA)} : positif. Cette équation a donc <strong>deux</strong> solutions —
                et l’on ne sait toujours pas lesquelles. C’est exactement l’intérêt du
                discriminant.
              </Feedback>
              <KnowledgeBrick
                id="methode-calculer-delta"
                variant="new"
                lead={<>La suite de gestes que tu viens d’effectuer, écrite une fois pour toutes.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'D’abord ranger, ensuite calculer',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-900 mb-1">Cette équation n’est pas encore prête :</div>
            <div className="font-mono text-lg font-black text-amber-900 text-center">3x² + 3 = 6x</div>
            <p className="mt-2 text-xs text-amber-800">
              Tant que tout n’est pas d’un seul côté, a, b et c ne se lisent pas. Ramène le 6x à
              gauche avant toute chose.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Après avoir tout ramené d’un côté, calcule Δ.</>}
            expected={deltaB}
            parse={parseSigned}
            display={fr(deltaB)}
            requires={['discriminant', 'methode-calculer-delta']}
            explain={`3x² + 3 = 6x devient 3x² − 6x + 3 = 0, donc a = 3, b = −6, c = 3. Δ = (−6)² − 4 × 3 × 3 = 36 − 36 = ${fr(deltaB)}.`}
            explainFor={(n) =>
              n === 72
                ? 'Tu as ajouté au lieu de soustraire : 36 + 36 = 72. La formule retranche 4ac, et ici 4ac vaut +36. Δ = 36 − 36 = 0.'
                : n === -36
                ? 'C’est ce qu’on obtient en oubliant de faire passer le 6x à gauche : b serait nul. Une fois rangée, l’équation est 3x² − 6x + 3 = 0, avec b = −6.'
                : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Δ = {fr(deltaB)} : cette équation a donc exactement <strong>une</strong> solution.
              C’est la situation de la fusion, celle où les deux points se confondaient.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le signe de Δ décide',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Pour l’équation ${trinomeText(1, 2, 5)} = 0, on trouve Δ = ${fr(deltaC)}. Combien cette équation a-t-elle de solutions ?`}
            options={['Aucune', 'Une seule', 'Deux', 'Seize']}
            correct={0}
            cols={4}
            requires={['discriminant', 'un-nombre-predit']}
            explain={`Δ = 2² − 4 × 1 × 5 = 4 − 20 = ${fr(deltaC)}, donc Δ est négatif : aucune solution réelle. La courbe reste entièrement au-dessus de l’axe.`}
            explainWrong={`Δ vaut ${fr(deltaC)}, un nombre NÉGATIF. Ce n’est pas le nombre de solutions : c’est le nombre dont le SIGNE donne le nombre de solutions. Négatif, il n’y en a aucune.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <Feedback tone="ok">
                Trois cas, trois signes. Tu sais maintenant compter les solutions de n’importe
                quelle équation de cette forme. Reste à les <strong>calculer</strong> — module
                suivant.
              </Feedback>
              <KnowledgeBrick
                id="mem-delta"
                variant="new"
                lead={<>Une seule chose à retenir de ce module.</>}
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le discriminant"
      moduleSubtitle="Un nom, une notation, et un calcul qui ne rate jamais"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Δ = b² − 4ac',
        tone: 'indigo',
        body: (
          <p>
            Le nombre qui basculait pile à la fusion s’appelle le <strong>discriminant</strong> et
            se note Δ. Il se calcule à partir de a, b et c seuls — donc pour n’importe quelle
            équation, pas seulement celle du laboratoire.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Compter, puis calculer.</strong> Δ dit COMBIEN. Le module suivant dit LESQUELLES,
          avec une formule unique qui couvre les trois cas.
        </KnowledgeSnapshot>
      }
    />
  );
}
