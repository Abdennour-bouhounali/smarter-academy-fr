import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  lin, evalLin, solveLinear, formatDec, formatEquation, formatLin,
} from '../components/equationUtils';

/**
 * Module 2 — DÉCOUVERTE : « Une égalité à trou ».
 *
 * Activity: tester des valeurs de x dans les deux membres de 3x − 6 = 0 avec
 *   le tableau de valeurs partagé (ValueTable).
 * Mathematical objective: comprendre qu'une équation est une ÉGALITÉ où une
 *   lettre remplace un nombre inconnu, et qu'une solution est une valeur qui
 *   rend cette égalité vraie.
 * Student action: taper une puce « x = … » ; une ligne apparaît, chaque
 *   membre est calculé, la ligne est verte si les deux coïncident.
 * Controlled variable: la valeur testée de x.
 * Mathematical state: l'ensemble des x testés (un Set) ; les colonnes sont
 *   dérivées par evalLin.
 * Visual consequence: lignes roses (égalité fausse) et vertes (égalité vraie).
 * Expected observation: une seule valeur testée rend l'égalité vraie — c'est
 *   la solution ; les autres ne sont pas « fausses », elles ne conviennent pas.
 * Misconception targeted: « x est toujours un nombre unique caché » alors
 *   qu'une équation peut avoir 0, 1 ou une infinité de solutions ; et « le
 *   membre de gauche est le calcul, celui de droite le résultat ».
 * Feedback: le nombre de lignes vertes est annoncé, avec la valeur qui marche.
 * Formalization: le vocabulaire vit dans `knowledge.jsx`. « Équation » et
 *   « solution » sont posés par des <KnowledgeBrick> dès que la première ligne
 *   verte est apparue (étape 1) — donc avant que le titre de l'étape 2 ne
 *   parle d'« équations » — et « ensemble des solutions » après les deux
 *   tableaux bizarres. L'étape 3 ne recopie plus rien : elle vérifie
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: puces de valeurs proposées, pas de saisie libre.
 * Transfer: étape 2, deux équations bizarres — sans solution et toujours vraie.
 */
const EQ = { left: lin(3, -6), right: lin(0, 0) }; // 3x − 6 = 0
const EQ_SOL = solveLinear(EQ).x; // 2

const XS = [-1, 0, 1, 2, 3, 4];

// x + 1 = x + 2 (aucune solution) et 2(x + 1) = 2x + 2 (toujours vraie)
const EQ_NONE = { left: lin(1, 1), right: lin(1, 2) };
const EQ_ALL = { left: { k: 2, inner: lin(1, 1) }, right: lin(2, 2) };
const XS_STRANGE = [0, 1, 2, 5];

export default function Module02EgaliteInconnue() {
  const [tested, setTested] = useState(() => new Set());
  const [testedNone, setTestedNone] = useState(() => new Set());
  const [testedAll, setTestedAll] = useState(() => new Set());
  const [vocabDone, setVocabDone] = useState(false);

  const hits = [...tested].filter((x) => evalLin(EQ.left, x) === evalLin(EQ.right, x));
  const mainDone = tested.has(EQ_SOL) && tested.size >= 3;

  const strangeDone = testedNone.size >= 3 && testedAll.size >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Une égalité à trou"
      moduleSubtitle="Teste des valeurs de x : certaines rendent l’égalité vraie, les autres non."
      estimatedTime="9 min"
      brief={{
        tag: '🔬 Mission 02',
        title: 'Une lettre à la place d’un nombre. Laquelle marche ?',
        body: (
          <p>
            <MathText>{`$${formatEquation(EQ)}$`}</MathText> n’est vraie que pour certaines valeurs de{' '}
            <MathText>{'$x$'}</MathText>. Teste-en plusieurs et regarde les deux colonnes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Teste des valeurs dans 3x − 6 = 0',
          subtitle: 'Au moins trois valeurs, dont celle qui marche.',
          done: mainDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Les deux colonnes sont les deux côtés de l’égalité. Une ligne devient verte quand elles
                donnent le même nombre.
              </p>
              <ValueTable
                columns={[
                  { id: 'g', label: <MathText>{`$${formatLin(EQ.left)}$`}</MathText>, fn: (x) => evalLin(EQ.left, x) },
                  { id: 'd', label: <MathText>{`$${formatLin(EQ.right)}$`}</MathText>, fn: (x) => evalLin(EQ.right, x) },
                ]}
                xs={XS}
                tested={tested}
                onTest={(x) => {
                  const next = new Set(tested);
                  next.add(x);
                  setTested(next);
                  kit.react(evalLin(EQ.left, x) === evalLin(EQ.right, x));
                }}
                caption="Vert = les deux côtés donnent le même nombre"
                disabled={mainDone}
              />
              {!mainDone && (
                <Feedback tone="info">
                  {tested.size === 0
                    ? 'Touche une valeur de x pour remplir une première ligne.'
                    : hits.length === 0
                    ? `${tested.size} valeur${tested.size > 1 ? 's' : ''} testée${tested.size > 1 ? 's' : ''}, aucune ligne verte pour l’instant — continue.`
                    : `Une ligne est verte : x = ${formatDec(hits[0])}. Teste au moins ${Math.max(0, 3 - tested.size)} valeur(s) de plus pour voir si une autre marche aussi.`}
                </Feedback>
              )}
              {mainDone && (
                <>
                  <Feedback tone="ok">
                    Une seule ligne verte : <MathText>{`$x = ${formatDec(EQ_SOL)}$`}</MathText>. Pour toutes
                    les autres valeurs, la colonne de gauche ne donne pas 0 — l’égalité est fausse.
                  </Feedback>
                  <KnowledgeBrick
                    id="equation"
                    variant="new"
                    compact
                    lead="Cette égalité à trou que tu viens de tester porte un nom, et la lettre qu’elle contient aussi."
                  />
                  <KnowledgeBrick
                    id="solution"
                    variant="new"
                    compact
                    lead="Et la valeur qui a fait verdir la ligne en porte un autre."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux équations qui se comportent bizarrement',
          subtitle: 'Teste chacune sur trois valeurs.',
          done: strangeDone,
          content: (kit) => (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  <MathText>{`$${formatEquation(EQ_NONE)}$`}</MathText>
                </p>
                <ValueTable
                  columns={[
                    { id: 'g', label: <MathText>{'$x + 1$'}</MathText>, fn: (x) => evalLin(EQ_NONE.left, x) },
                    { id: 'd', label: <MathText>{'$x + 2$'}</MathText>, fn: (x) => evalLin(EQ_NONE.right, x) },
                  ]}
                  xs={XS_STRANGE}
                  tested={testedNone}
                  onTest={(x) => {
                    const next = new Set(testedNone);
                    next.add(x);
                    setTestedNone(next);
                    kit.react(false);
                  }}
                  caption="Aucune ligne ne devient verte"
                  disabled={strangeDone}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  <MathText>{`$${formatEquation(EQ_ALL)}$`}</MathText>
                </p>
                <ValueTable
                  columns={[
                    { id: 'g', label: <MathText>{'$2(x + 1)$'}</MathText>, fn: (x) => 2 * (x + 1) },
                    { id: 'd', label: <MathText>{'$2x + 2$'}</MathText>, fn: (x) => evalLin(EQ_ALL.right, x) },
                  ]}
                  xs={XS_STRANGE}
                  tested={testedAll}
                  onTest={(x) => {
                    const next = new Set(testedAll);
                    next.add(x);
                    setTestedAll(next);
                    kit.react(true);
                  }}
                  caption="Toutes les lignes deviennent vertes"
                  disabled={strangeDone}
                />
              </div>

              {!strangeDone && (
                <Feedback tone="info">
                  Teste au moins trois valeurs dans chaque tableau ({testedNone.size}/3 et{' '}
                  {testedAll.size}/3 pour l’instant), puis compare les deux comportements.
                </Feedback>
              )}
              {strangeDone && (
                <>
                  <Feedback tone="ok">
                    La première n’a <strong>aucune</strong> solution : un nombre ne peut pas valoir son
                    successeur. La seconde est vraie pour <strong>toutes</strong> les valeurs : les deux
                    écritures sont la même, développée ou non. Une équation n’a donc pas toujours
                    exactement une solution.
                  </Feedback>
                  <KnowledgeBrick
                    id="ensemble-solutions"
                    variant="new"
                    lead="Un tableau tout rose, un tableau tout vert : voilà comment on écrit ce que tu viens de voir."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Tester une valeur, sans résoudre',
          done: vocabDone,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Une dernière chose, et c’est la plus économique de toute la leçon : pour savoir si une
                valeur est solution, on n’a pas besoin de résoudre. Il suffit de la remettre à la place
                de <MathText>{'$x$'}</MathText> et de calculer les deux côtés.
              </p>
              <TapQuestion
                prompt={
                  <>
                    Est-ce que <MathText>{'$x = 5$'}</MathText> est une solution de{' '}
                    <MathText>{'$2x - 4 = 6$'}</MathText> ?
                  </>
                }
                options={[
                  'Oui : 2 × 5 − 4 = 6',
                  'Non : il faudrait calculer 2 × 5 − 4 = 10',
                  'On ne peut pas le savoir sans résoudre',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    <MathText>{'$2 \\times 5 - 4 = 10 - 4 = 6$'}</MathText> : l’égalité est vraie, donc 5
                    est bien une solution. Pour vérifier, on remplace — pas besoin de résoudre.
                  </>
                }
                explainWrong={
                  <>
                    Attention à l’ordre des opérations : on multiplie d’abord,{' '}
                    <MathText>{'$2 \\times 5 = 10$'}</MathText>, puis on retire 4, ce qui donne 6. Et une
                    solution se teste toujours en remplaçant, même sans savoir résoudre.
                  </>
                }
                requires={['solution', 'equation', 'calcul-litteral']}
                solved={vocabDone}
                onAnswered={() => setVocabDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tester une à une, ça marche… tant que la solution est dans la
          liste. Au module suivant, tu vas la faire apparaître sans deviner.
        </KnowledgeSnapshot>
      )}
    />
  );
}
