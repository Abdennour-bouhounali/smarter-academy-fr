import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BorderPattern from '../components/BorderPattern';
import { evaluateBorder } from '../components/litteralUtils';

/**
 * Module 1 — TRIGGER : « Trois formules pour une bordure ».
 *
 * Activity: régler la taille n du jardin de Maya et compter les dalles de la
 *   bordure, que trois élèves comptent chacun à leur façon.
 * Mathematical objective: faire naître le besoin d'« expression littérale »
 *   et d'« équivalence » — trois écritures différentes donnent la même
 *   quantité pour CHAQUE n.
 * Student action: pousser − / + sur n, répondre au décompte, puis taper des
 *   puces de valeurs dans le tableau.
 * Controlled variable: n, la taille du jardin (1 à 6).
 * Mathematical state: n seul ; le dessin, le décompte et les trois colonnes
 *   du tableau en sont dérivés (evaluateBorder).
 * Visual consequence: la couronne de dalles grandit ; les trois colonnes du
 *   tableau se remplissent — et coïncident, ligne après ligne.
 * Expected observation: 4n + 4, 4(n + 1) et (n + 2)² − n² donnent le même
 *   nombre pour chaque n testé.
 * Misconception targeted: « écritures différentes = quantités différentes ».
 * Feedback: le tableau colore la ligne en vert quand les trois colonnes
 *   coïncident — la conclusion se lit, elle n'est pas affirmée.
 * Formalization: les mots vivent dans `knowledge.jsx` et sont posés par des
 *   <KnowledgeBrick> à leur place exacte — « expression littérale » à la fin
 *   de l'étape 1, une fois les dalles comptées et la lettre n rencontrée ;
 *   « même expression » à la fin de l'étape 3, une fois le tableau vert.
 *   Aucune définition n'est recopiée ici
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: le décompte visible sous le dessin ; les trois lectures
 *   coloriées apparaissent à l'étape 2.
 * Transfer: le tableau de valeurs devient le RITUEL de vérification de toute
 *   la leçon (modules 3, 5, 7).
 */
const COLUMNS = [
  { id: 'maya', label: <MathText>{'$4n+4$'}</MathText>, fn: (n) => 4 * n + 4 },
  { id: 'sacha', label: <MathText>{'$4(n+1)$'}</MathText>, fn: (n) => 4 * (n + 1) },
  { id: 'iris', label: <MathText>{'$(n+2)^{2}-n^{2}$'}</MathText>, fn: (n) => (n + 2) ** 2 - n ** 2 },
];

export default function Module01TroisFormules() {
  const [n, setN] = useState(2);
  const [counted, setCounted] = useState(false);
  const [whoDone, setWhoDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [readDone, setReadDone] = useState(false);

  const testDone = tested.size >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Trois formules pour une bordure"
      moduleSubtitle="Trois élèves comptent les mêmes dalles autrement. Qui a raison ?"
      estimatedTime="8 min"
      brief={{
        tag: '🌻 Mission 01',
        title: 'Maya entoure son jardin carré d’une bordure de dalles.',
        tone: 'indigo',
        body: (
          <p>
            Le jardin est un carré de côté <strong className="font-mono">n</strong>. Autour, une seule
            rangée de dalles. Trois élèves proposent trois formules — et refusent de céder. Compte
            toi-même, puis tranche.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Compte les dalles toi-même',
          subtitle: 'Change n et regarde la bordure suivre.',
          done: counted,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Pousse <strong className="font-mono">−</strong> et <strong className="font-mono">+</strong>{' '}
                pour changer la taille du jardin. Les dalles jaunes forment la bordure, le vert est le
                jardin. Puis règle n = 2 et compte.
              </p>
              <BorderPattern n={n} onChange={setN} />
              <NumericQuestion
                prompt="Combien de dalles jaunes autour d’un jardin de côté n = 2 ?"
                expected={evaluateBorder(2)}
                suffix="dalles"
                explain="12 dalles : 4 côtés de 2 dalles, plus les 4 coins."
                explainFor={(v) =>
                  v === 8
                    ? 'Tu as compté les 4 côtés de 2 dalles (8) mais oublié les 4 coins : 8 + 4 = 12.'
                    : v === 16
                    ? 'Le grand carré compte 16 cases, mais 4 sont le jardin lui-même : 16 − 4 = 12.'
                    : '12 dalles : 4 côtés de 2 dalles, plus les 4 coins.'
                }
                requires={['calcul-numerique']}
                solved={counted}
                onAnswered={() => setCounted(true)}
              />
              {counted && (
                <KnowledgeBrick
                  id="expression-litterale"
                  variant="new"
                  lead="Tu viens de compter 12 dalles pour n = 2. Change n, le nombre change — mais la façon de compter, elle, ne change pas. Cette façon de compter porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trois élèves, trois formules',
          done: whoDone,
          content: (
            <div className="space-y-3">
              <BorderPattern n={n} onChange={setN} showFormulas highlightCorners />
              <TapQuestion
                prompt="Laquelle de ces trois formules donne le bon nombre de dalles ?"
                options={[
                  '$4n + 4$ (Maya)',
                  '$4(n + 1)$ (Sacha)',
                  '$(n + 2)^{2} - n^{2}$ (Iris)',
                  'Les trois',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['4n + 4 (Maya)', '4(n + 1) (Sacha)', '(n + 2)² − n² (Iris)', 'Les trois'][i]}
                correctionLabel="Les trois"
                cols={1}
                correct={3}
                explain={
                  <>
                    Les trois. Maya compte 4 côtés de n dalles puis les 4 coins ; Sacha voit 4 bandes de
                    n + 1 dalles ; Iris prend tout le grand carré et enlève le jardin. Trois manières de
                    compter, un seul nombre de dalles.
                  </>
                }
                explainWrong={
                  <>
                    Le piège est de croire qu’une seule écriture peut être « la bonne ». Change n
                    ci-dessus et refais les trois calculs : ils tombent toujours ensemble. On va le
                    vérifier tout de suite.
                  </>
                }
                requires={['expression-litterale']}
                solved={whoDone}
                onAnswered={() => setWhoDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Vérifier, pas croire',
          subtitle: 'Teste au moins trois valeurs de n.',
          done: testDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche des valeurs de n : chaque ligne calcule les trois formules d’un coup. Une ligne
                verte = les trois s’accordent.
              </p>
              <ValueTable
                columns={COLUMNS}
                xs={[0, 1, 2, 3, 5, 10]}
                tested={tested}
                onTest={(v) => {
                  const next = new Set(tested);
                  next.add(v);
                  setTested(next);
                  if (next.size >= 3 && tested.size < 3) kit.react(true);
                }}
                variable="n"
                caption="Trois écritures, une seule quantité pour chaque n."
              />
              {!testDone && (
                <Feedback tone="info">
                  {tested.size === 0
                    ? 'Aucune valeur testée : touche une puce « n = … ».'
                    : `${tested.size} valeur${tested.size > 1 ? 's' : ''} testée${tested.size > 1 ? 's' : ''} sur 3 — continue.`}
                </Feedback>
              )}
              {testDone && (
                <>
                  <Feedback tone="ok">
                    Toutes les lignes sont vertes : pour chaque n testé, les trois formules donnent le
                    même nombre.
                  </Feedback>
                  <KnowledgeBrick
                    id="meme-expression"
                    variant="new"
                    lead="Trois écritures, trois lignes vertes, et cela pour chaque n que tu as touché. Ce constat a un nom."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Lire une expression',
          done: readDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Comment se lit <MathText>{'$4n + 4$'}</MathText> ?
                </>
              }
              options={[
                'Quatre fois le nombre, puis on ajoute 4',
                'Quarante-quatre',
                'Quatre fois (le nombre plus 4)',
              ]}
              cols={1}
              correct={0}
              explain={
                <>
                  <MathText>{'$4n$'}</MathText> veut dire « 4 multiplié par n » — le signe × est sous-
                  entendu. On multiplie d’abord, on ajoute ensuite : pour n = 5, cela fait{' '}
                  <MathText>{'$4 \\times 5 + 4 = 24$'}</MathText>.
                </>
              }
              explainWrong={
                <>
                  « Quarante-quatre » collerait les chiffres au lieu de multiplier ; « 4 fois (n + 4) »
                  serait <MathText>{'$4(n + 4)$'}</MathText>, avec une parenthèse — ce n’est pas la même
                  machine (pour n = 5 : 36 au lieu de 24).
                </>
              }
              requires={['expression-litterale']}
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Passer d’une écriture à l’autre sans changer la quantité :
          c’est tout le travail de la leçon. Au module suivant, on ouvre une expression pour voir
          de quels morceaux elle est faite.
        </KnowledgeSnapshot>
      )}
    />
  );
}
