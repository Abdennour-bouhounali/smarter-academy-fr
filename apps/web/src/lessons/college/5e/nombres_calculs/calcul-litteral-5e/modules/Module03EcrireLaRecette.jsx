import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { expr, ecrire, valeur } from '../components/litteral';

/**
 * Module 3 — MANIPULATION : traduire une situation en expression.
 *
 * Mathematical objective repérer dans un énoncé ce qui SE RÉPÈTE (le
 *                       coefficient) et ce qui RESTE FIXE (la constante), puis
 *                       écrire l'expression correspondante.
 * Misconception targeted deux confusions distinctes, traitées séparément :
 *                       — somme et produit (« 3 de plus » vs « 3 fois plus ») ;
 *                       — la place des parenthèses, que l'ordre des mots décide
 *                         (« le double de n plus 3 » vs « le double de n + 3 »).
 *
 * La seconde est traitée NUMÉRIQUEMENT : les deux écritures sont évaluées sur
 * la même valeur, et l'élève constate qu'elles ne donnent pas le même nombre.
 * C'est l'argument que la leçon lui apprend à utiliser seul.
 */
const DOUBLE_PLUS = expr(2, 3);        // 2n + 3
const DOUBLE_DE_SOMME = expr(2, 6);    // 2 × (n + 3) = 2n + 6
const TEST_N = 5;

export default function Module03EcrireLaRecette() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Ce qui se répète et ce qui reste fixe',
      subtitle: 'Toute expression de ce niveau se construit avec ces deux ingrédients.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Un vélo se loue <strong>5 €</strong> de frais de dossier, plus <strong>3 €</strong> par
            heure de location.
          </div>
          <TapQuestion
            prompt={<>Quelle expression donne le prix pour <span className="font-mono font-bold">h</span> heures ?</>}
            options={[
              ecrire(expr(3, 5), 'h'),
              ecrire(expr(5, 3), 'h'),
              '5 + 3 + h',
              '5 × 3 × h',
            ]}
            correct={0}
            cols={2}
            requires={['calcul-litteral']}
            explain={`Les 3 € se répètent à chaque heure : ils sont donc multipliés par h. Les 5 € ne se paient qu’une fois : ils s’ajoutent tels quels. D’où ${ecrire(expr(3, 5), 'h')}. Pour 4 heures : ${valeur(expr(3, 5), 4)} €.`}
            explainWrong={`${ecrire(expr(5, 3), 'h')} ferait payer 5 € PAR HEURE et 3 € de dossier — c’est l’inverse de l’énoncé. Repère toujours quel nombre est accompagné de « par » : c’est lui qui multiplie la lettre.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode, et le piège des parenthèses',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="ecrire-expression"
            variant="new"
            lead={<>Tu viens de trier les deux ingrédients d’une expression. Voici la méthode, et l’erreur qu’elle permet d’éviter.</>}
          />
          {/* Le piège est traité NUMÉRIQUEMENT : on montre les deux écritures
              évaluées sur la même valeur, ce qui rend la différence indiscutable. */}
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center space-y-1">
              <div className="text-xs text-slate-500">« le double de n, plus 3 »</div>
              <div className="font-mono text-lg font-black text-sky-800">{ecrire(DOUBLE_PLUS)}</div>
              <div className="text-xs text-slate-600">
                avec n = {TEST_N} : 2 × {TEST_N} + 3 = <strong>{valeur(DOUBLE_PLUS, TEST_N)}</strong>
              </div>
            </div>
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 text-center space-y-1">
              <div className="text-xs text-slate-500">« le double de (n plus 3) »</div>
              <div className="font-mono text-lg font-black text-orange-800">2 × (n + 3)</div>
              <div className="text-xs text-slate-600">
                avec n = {TEST_N} : 2 × {TEST_N + 3} = <strong>{valeur(DOUBLE_DE_SOMME, TEST_N)}</strong>
              </div>
            </div>
          </div>
          <TapQuestion
            prompt="« J’ajoute 3 à un nombre, puis je multiplie le tout par 2. » Quelle expression correspond ?"
            options={[
              '2 × (n + 3)',
              ecrire(DOUBLE_PLUS),
              '2n × 3',
              'n + 3 × 2',
            ]}
            correct={0}
            cols={2}
            requires={['ecrire-expression', 'calcul-litteral']}
            explain={`« Puis je multiplie LE TOUT » impose les parenthèses : on ajoute d’abord, on multiplie ensuite. Avec n = ${TEST_N}, cela donne ${valeur(DOUBLE_DE_SOMME, TEST_N)}, alors que ${ecrire(DOUBLE_PLUS)} donnerait ${valeur(DOUBLE_PLUS, TEST_N)}.`}
            explainWrong={`Sans parenthèses, ${ecrire(DOUBLE_PLUS)} multiplierait seulement le n par 2, puis ajouterait 3 — donc dans l’ordre inverse de l’énoncé. Les mots « le tout » signalent qu’il faut regrouper avant de multiplier.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quatre situations à traduire',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Quelle expression traduit chaque situation ?</p>}
            rows={[
              {
                id: 't1',
                label: 'Un nombre n, augmenté de 7',
                options: [ecrire(expr(1, 7)), ecrire(expr(7, 0)), '7 − n'],
                correct: 0,
                correction: '« Augmenté de » est une addition : n + 7.',
              },
              {
                id: 't2',
                label: 'Le triple d’un nombre n',
                options: [ecrire(expr(1, 3)), ecrire(expr(3, 0)), 'n ÷ 3'],
                correct: 1,
                correction: '« Le triple » est une multiplication par 3 : 3n.',
              },
              {
                id: 't3',
                label: 'Le périmètre d’un carré de côté c',
                options: [ecrire(expr(4, 0), 'c'), ecrire(expr(1, 4), 'c'), ecrire(expr(2, 0), 'c')],
                correct: 0,
                correction: 'Quatre côtés égaux : 4c.',
              },
              {
                id: 't4',
                label: '10 bonbons partagés, dont on retire 2, pour n enfants',
                options: [ecrire(expr(10, -2), 'n'), '10n − 2', '10 − 2n'],
                correct: 2,
                correction: 'On retire 2 bonbons à chacun des n enfants : cela fait 2n bonbons retirés de 10, soit 10 − 2n.',
              },
            ]}
            requires={['ecrire-expression']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le réflexe est en place : les mots <strong>« de plus », « augmenté »</strong>{' '}
                  annoncent une addition ; <strong>« double », « triple », « par »</strong>{' '}
                  annoncent une multiplication. Le nombre accompagné de « par » est toujours celui
                  qui multiplie la lettre.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Relis chaque énoncé en cherchant{' '}
                  <strong>ce qui se répète</strong> (ce nombre-là multiplie la lettre) et{' '}
                  <strong>ce qui ne se produit qu’une fois</strong> (ce nombre-là s’ajoute ou se
                  retire tel quel).
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Vérifier sa propre traduction',
      subtitle: 'La méthode qui permet de se corriger tout seul.',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Comment savoir si l’expression qu’on vient d’écrire est la bonne ?"
            options={[
              'On lui donne une valeur simple et on compare au calcul fait à la main',
              'On vérifie qu’elle contient bien tous les nombres de l’énoncé',
              'On vérifie qu’elle est la plus courte possible',
              'On ne peut pas vérifier : il faut demander la correction',
            ]}
            correct={0}
            cols={1}
            requires={['ecrire-expression', 'calcul-litteral']}
            explain={`Pour le vélo à 5 € + 3 €/h : avec 2 heures, on paie de tête 5 + 6 = 11 €. On remplace alors h par 2 dans l’expression : ${valeur(expr(3, 5), 2)} €. Les deux coïncident, l’expression est bonne.`}
            explainWrong="Contenir les bons nombres ne suffit pas : 5h + 3 contient exactement les mêmes que 3h + 5, mais ne décrit pas la même situation. Seul un ESSAI NUMÉRIQUE tranche — et tu peux toujours le faire seul."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Écrire la recette"
      moduleSubtitle="Traduire une situation en expression"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Des mots vers les symboles',
        tone: 'indigo',
        body: (
          <p>
            Une expression ne s’invente pas : elle se <strong>traduit</strong>. Il suffit de repérer
            dans l’énoncé ce qui <strong>se répète</strong> et ce qui <strong>reste fixe</strong> —
            à condition de ne pas se tromper sur l’ordre des mots.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
