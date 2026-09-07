import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — FORMALIZATION : « Trois formes, trois usages ».
 * A(x) = x² + 2x − 3 = (x − 1)(x + 3) = (x + 1)² − 4 : la même expression,
 * trois écritures ; à chaque question sa forme.
 */
const FORMS = ['$x^{2} + 2x - 3$', '$(x - 1)(x + 3)$', '$(x + 1)^{2} - 4$'];
const tex = (o) => <MathText>{o}</MathText>;

export default function Module05TroisFormes() {
  const [q1, setQ1] = useState(false); const [q2, setQ2] = useState(false); const [q3, setQ3] = useState(false); const [b4, setB4] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Trois formes, trois usages"
      moduleSubtitle="La même expression, trois écritures : l’une donne A(0), l’autre les zéros, la troisième le minimum. À retenir."
      estimatedTime="9 min"
      brief={{ tag: '🧭 Mission 05', title: 'A(x) = x² + 2x − 3 = (x − 1)(x + 3) = (x + 1)² − 4. Une expression, trois costumes.', tone: 'indigo', body: <p>Pour chaque question, touche la forme qui répond D’UN COUP D’ŒIL, sans calcul.</p> }}
      steps={[
        {
          num: 1, title: 'Que vaut A(0) ?', done: q1,
          content: <TapQuestion prompt="Quelle forme donne A(0) sans aucun calcul ?" options={FORMS} renderOption={tex} correctionLabel="x² + 2x − 3" cols={3} correct={0}
            explain="Dans la forme développée, x = 0 efface tout sauf la constante : A(0) = −3. Les deux autres demandent un petit calcul ((−1)(3) = −3 ; 1 − 4 = −3)."
            explainWrong="Avec la forme développée, x = 0 laisse seulement −3 : c’est la lecture directe. Les autres formes y arrivent aussi, mais après un calcul."
            solved={q1} onAnswered={() => setQ1(true)} />,
        },
        {
          num: 2, title: 'Pour quels x a-t-on A(x) = 0 ?', done: q2,
          content: <TapQuestion prompt="Quelle forme le dit immédiatement ?" options={FORMS} renderOption={tex} correctionLabel="(x − 1)(x + 3)" cols={3} correct={1}
            explain="Un produit est nul quand un facteur est nul : x = 1 ou x = −3. La forme FACTORISÉE répond aux questions « = 0 » — c’est elle qu’il faut pour résoudre."
            explainWrong="Pour annuler, il faut un produit : (x − 1)(x + 3) = 0 ⇔ x = 1 ou x = −3. Une somme (forme développée) ne dit pas ses zéros."
            solved={q2} onAnswered={() => setQ2(true)} />,
        },
        {
          num: 3, title: 'A(x) descend-il sous −4 ?', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Quelle forme montre que A(x) ≥ −4 pour tout x ?" options={FORMS} renderOption={tex} correctionLabel="(x + 1)² − 4" cols={3} correct={2}
                explain="(x + 1)² est un carré : toujours ≥ 0. Donc (x + 1)² − 4 ≥ −4, et l’égalité a lieu pour x = −1 : A(x) descend jusqu’à −4, jamais plus bas. Cette forme « carré + constante » le montre d’un coup."
                explainWrong="Un carré n’est jamais négatif : (x + 1)² ≥ 0, donc A(x) = (x + 1)² − 4 ≥ −4. Les autres formes cachent ce carré."
                solved={q3} onAnswered={() => setQ3(true)} />
              {q3 && (
                <KnowledgeBrick
                  id="regle-carre-positif"
                  variant="new"
                  lead="Tu viens de lire que A(x) ne descend jamais sous −4, et qu’il atteint −4 en x = −1. Cette plus petite valeur atteinte porte un nom : le MINIMUM de A. La plus grande valeur atteinte s’appellerait le MAXIMUM ; l’un ou l’autre, on dit un EXTREMUM."
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'À retenir', done: b4,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-1.5">
                <p><strong>Réduire</strong> : additionner les coefficients des termes de même forme. <strong>Développer</strong> : transformer un produit en somme (distributivité, identités). <strong>Factoriser</strong> : transformer une somme en produit (facteur commun, identités). La valeur ne change jamais — le tableau de valeurs le vérifie.</p>
                <p><strong>Choisir la forme</strong> : développée pour A(0) et pour réduire ; factorisée pour « = 0 » et le signe ; carré + constante pour le minimum ou le maximum.</p>
              </div>
              <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Quelle forme pour…</p>} rows={[
                { id: 'r1', label: 'résoudre B(x) = 0', options: ['développée', 'factorisée', 'carré + constante'], correct: 1 },
                { id: 'r2', label: 'calculer B(0)', options: ['développée', 'factorisée', 'carré + constante'], correct: 0 },
                { id: 'r3', label: 'prouver que B(x) ≥ 2', options: ['développée', 'factorisée', 'carré + constante'], correct: 2 },
                { id: 'r4', label: 'vérifier que deux écritures sont égales', options: ['développer les deux', 'les tester en x = 1', 'comparer les longueurs'], correct: 0, correction: 'une valeur commune ne prouve rien ; deux formes développées identiques, si.' },
              ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>La bonne forme, c’est celle qui répond sans calcul à la question posée.</Feedback>}
                solved={b4} onAnswered={() => setB4(true)} />
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok">Trois formes, trois usages. Reste à s’en servir pour démontrer — et pour résoudre.</Feedback>}
    />
  );
}
