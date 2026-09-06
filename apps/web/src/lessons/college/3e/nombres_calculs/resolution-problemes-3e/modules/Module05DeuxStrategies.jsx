import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import StrategyChips from '../components/StrategyChips';
import {
  evalLin, solveLinear, formatEquation, formatDec, parseDec,
} from '../components/problemUtils';
import { RECTANGLE_62, CREPES } from '../components/problemsData';

/**
 * Module 5 — MANIPULATION : « Deux stratégies, un résultat ».
 *
 * Activity: décider, situation par situation, PAR QUOI on attaque
 *   (proportionnalité, calcul direct, essais, équation) — puis vivre le
 *   moment où le tableau d'essais échoue et où l'équation prend le relais.
 * Mathematical objective: établir qu'une stratégie se choisit d'après la
 *   STRUCTURE de la situation (y a-t-il une part fixe ? le résultat est-il
 *   tabulable ?) et non d'après l'habitude — et que les essais ne trouvent
 *   que les solutions entières qu'on a pensé à tester.
 * Student action: taper une puce de stratégie par situation ; puis tester des
 *   valeurs entières de x dans le tableau du rectangle de périmètre 62.
 * Controlled variable: la stratégie choisie ; puis x, la largeur testée.
 * Mathematical state: `choices` (situation → stratégie) ; puis l'ensemble des
 *   x testés, les deux colonnes étant `4x + 8` et la constante `62`.
 * Visual consequence: chaque ligne du tableau affiche le périmètre obtenu à
 *   côté du périmètre voulu ; AUCUNE ligne ne devient verte, quel que soit le
 *   nombre d'essais — 13,5 n'est proposé par aucune puce.
 * Expected observation: entre x = 13 (P = 60) et x = 14 (P = 64), le
 *   périmètre 62 est franchi sans jamais être atteint : la solution n'est pas
 *   un entier, donc le tableau ne peut pas la montrer.
 * Misconception targeted: n° 4 du catalogue — supposer la proportionnalité
 *   alors qu'il y a une part fixe (« 2 fois plus de séances = 2 fois plus
 *   cher », « 2 fois plus de largeur = 2 fois plus de périmètre »).
 * Feedback: le tableau quantifie l'écart restant au périmètre voulu ; la
 *   question qui suit nomme la raison de l'échec.
 * Formalization: étape 3, « quand le résultat n'est pas rond, l'équation
 *   gagne » — nommée APRÈS l'échec vécu.
 * Scaffolding: les quatre stratégies sont toujours visibles ; chaque
 *   situation est corrigée dès qu'elle est choisie ; le tableau reste
 *   utilisable pendant le retour.
 * Transfer: le module 7 pousse le cas jusqu'au bout (6,25 séances) et le
 *   boss e3 rejoue le choix de stratégie sur les crêpes.
 */

/* ── Étape 1 : trois situations, trois stratégies ─────────────────── */
const SITUATIONS = [
  {
    id: 'crepes',
    aria: 'la recette de crêpes',
    text: 'Pour 4 personnes il faut 250 g de farine. Quelle masse pour 7 personnes ?',
    correct: 'proportionnalite',
    explain:
      'Deux fois plus de personnes, deux fois plus de farine : il n’y a aucune part fixe. On passe par la masse pour une personne (62,5 g) — c’est de la proportionnalité, pas besoin d’inconnue.',
  },
  {
    id: 'panier',
    aria: 'le prix de trois articles',
    text: 'Un cahier coûte 3,50 €, un stylo 1,20 €, une gomme 0,80 €. Combien coûte le tout ?',
    correct: 'calcul-direct',
    explain:
      'Tout est connu, rien n’est cherché : on additionne. 3,50 + 1,20 + 0,80 = 5,50 €. Poser une équation ici, c’est se compliquer la vie.',
  },
  {
    id: 'rectangle',
    aria: 'le rectangle de périmètre 62',
    text: 'Un rectangle a une longueur qui dépasse sa largeur de 4 cm. Son périmètre mesure 62 cm. Quelle est sa largeur ?',
    correct: 'equation',
    explain:
      'La quantité cherchée (la largeur) intervient dans le calcul du périmètre : impossible de la calculer directement. On la nomme x, on écrit 4x + 8 = 62, et on résout. Tu vas voir juste après pourquoi les essais ne suffisent pas ici.',
  },
];

/* ── Étape 3 : le tableau qui échoue ──────────────────────────────── */
const XS = [10, 11, 12, 13, 14, 15];
const TARGET = RECTANGLE_62.equation.right.b; // 62, lu dans le modèle
const COLUMNS = [
  { id: 'p', label: 'Périmètre obtenu 4x + 8', fn: (x) => evalLin(RECTANGLE_62.equation.left, x) },
  { id: 'voulu', label: 'Périmètre voulu', fn: () => TARGET },
];

const SOL62 = solveLinear(RECTANGLE_62.equation).x; // 13,5

export default function Module05DeuxStrategies() {
  const [choices, setChoices] = useState({});
  const [crepesDone, setCrepesDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [whyDone, setWhyDone] = useState(false);
  const [largeurDone, setLargeurDone] = useState(false);

  const nChosen = Object.keys(choices).length;
  const allChosen = nChosen === SITUATIONS.length;
  const nearest = tested.size
    ? [...tested].reduce((best, x) =>
        Math.abs(evalLin(RECTANGLE_62.equation.left, x) - TARGET)
        < Math.abs(evalLin(RECTANGLE_62.equation.left, best) - TARGET) ? x : best)
    : null;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Deux stratégies, un résultat"
      moduleSubtitle="Toute situation n’a pas besoin d’une équation. Mais quand le résultat n’est pas rond…"
      estimatedTime="9 min"
      brief={{
        tag: '🧭 Mission 05',
        title: 'Avant de calculer : par quoi on attaque ?',
        body: (
          <p>
            Tu sais maintenant traduire une histoire en équation. Encore faut-il savoir{' '}
            <em>quand</em> ça vaut le coup — et quand une simple règle de trois suffit. Trois situations,
            trois décisions à prendre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Choisis la stratégie',
          subtitle: 'Une par situation. Regarde la structure, pas les nombres.',
          done: allChosen,
          content: (kit) => (
            <div className="space-y-3">
              <StrategyChips
                situations={SITUATIONS}
                choices={choices}
                onChoose={(sid, strat) => {
                  setChoices((c) => ({ ...c, [sid]: strat }));
                  kit.react(strat === SITUATIONS.find((s) => s.id === sid).correct);
                }}
                revealed={allChosen}
              />
              {!allChosen && (
                <Feedback tone="info">
                  {nChosen === 0
                    ? 'Touche une stratégie sous chaque situation. Les corrections apparaissent quand les trois sont choisies.'
                    : `${nChosen} situation${nChosen > 1 ? 's' : ''} sur ${SITUATIONS.length}. Encore ${
                        SITUATIONS.length - nChosen
                      }.`}
                </Feedback>
              )}
              {allChosen && (
                <Feedback tone="ok">
                  Trois structures, trois stratégies. <strong>Proportionnalité</strong> quand tout se
                  multiplie ensemble sans part fixe ; <strong>calcul direct</strong> quand tout est connu ;{' '}
                  <strong>équation</strong> quand la quantité cherchée est prise dans le calcul. Les{' '}
                  <strong>essais</strong> ? Ils dépannent — tu vas voir jusqu’où.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La proportionnalité, jusqu’au bout',
          subtitle: 'Les crêpes : 250 g pour 4 personnes.',
          done: crepesDone,
          content: (
            <div className="space-y-3">
              <ProblemText fragments={CREPES.fragments} title="Énoncé — Les crêpes" />
              <NumericQuestion
                prompt={
                  <>
                    Quelle masse de farine faut-il pour <strong>7 personnes</strong> ?
                  </>
                }
                expected={437.5}
                parse={parseDec}
                display={formatDec(437.5)}
                suffix="g"
                explain={
                  <>
                    Une personne demande <MathText>{'$250 \\div 4 = 62{,}5$'}</MathText> g, donc 7
                    personnes en demandent <MathText>{'$7 \\times 62{,}5 = 437{,}5$'}</MathText> g. Un
                    résultat décimal n’a rien d’anormal : on ne pèse pas des personnes, on pèse de la
                    farine.
                  </>
                }
                explainFor={(n) => {
                  if (n === 1750) {
                    return (
                      <>
                        1 750 g, c’est <MathText>{'$250 \\times 7$'}</MathText> : tu as multiplié la masse
                        par le nombre de personnes, comme si 250 g étaient la masse pour{' '}
                        <em>une</em> personne. Or 250 g nourrissent déjà 4 personnes.
                      </>
                    );
                  }
                  if (n === 62.5) {
                    return (
                      <>
                        62,5 g, c’est la masse pour <strong>une</strong> personne —{' '}
                        <MathText>{'$250 \\div 4$'}</MathText>. Le calcul est juste, il reste à le
                        multiplier par 7 : <MathText>{'$437{,}5$'}</MathText> g.
                      </>
                    );
                  }
                  if (n === 375) {
                    return (
                      <>
                        375 g, c’est le résultat pour 6 personnes (<MathText>{'$250 \\times 1{,}5$'}</MathText>
                        ) — ou une addition de « 3 personnes de plus, donc 125 g de plus » arrêtée trop tôt.
                        Pour 7 personnes : <MathText>{'$7 \\times 62{,}5 = 437{,}5$'}</MathText> g.
                      </>
                    );
                  }
                  return (
                    <>
                      Passe par une personne : <MathText>{'$250 \\div 4 = 62{,}5$'}</MathText> g, puis{' '}
                      <MathText>{'$\\times 7 = 437{,}5$'}</MathText> g.
                    </>
                  );
                }}
                requires={['proportionnalite']}
                solved={crepesDone}
                onAnswered={() => setCrepesDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le tableau qui n’y arrive pas',
          subtitle: 'Le rectangle de périmètre 62 cm. Teste des largeurs entières.',
          done: tested.size >= 3 && whyDone,
          content: (kit) => (
            <div className="space-y-3">
              <ProblemText fragments={RECTANGLE_62.fragments} title="Énoncé — Le rectangle de périmètre 62" />
              <p className="text-sm text-slate-700">
                Avec <MathText>{'$x$'}</MathText> = la largeur, le périmètre s’écrit{' '}
                <MathText>{'$4x + 8$'}</MathText> (deux largeurs et deux longueurs{' '}
                <MathText>{'$x + 4$'}</MathText>). Cherche la largeur qui donne 62 cm.
              </p>
              <ValueTable
                columns={COLUMNS}
                xs={XS}
                tested={tested}
                onTest={(x) => {
                  const next = new Set([...tested, x]);
                  setTested(next);
                  kit.react(evalLin(RECTANGLE_62.equation.left, x) === TARGET);
                }}
                variable="x"
                unit="cm"
                caption="Périmètre obtenu selon la largeur testée"
                ariaLabel="Tableau des périmètres selon la largeur"
              />
              {tested.size < 3 ? (
                <Feedback tone="info">
                  {tested.size === 0 ? (
                    'Touche une puce : le périmètre se calcule pour cette largeur.'
                  ) : (
                    <>
                      {tested.size} essai{tested.size > 1 ? 's' : ''}. Le plus proche est x ={' '}
                      <strong className="font-mono">{formatDec(nearest)}</strong> : périmètre{' '}
                      <strong className="font-mono">
                        {formatDec(evalLin(RECTANGLE_62.equation.left, nearest))}
                      </strong>{' '}
                      cm, soit{' '}
                      <strong className="font-mono">
                        {formatDec(Math.abs(evalLin(RECTANGLE_62.equation.left, nearest) - TARGET))}
                      </strong>{' '}
                      cm d’écart. Continue.
                    </>
                  )}
                </Feedback>
              ) : (
                <>
                  <Feedback tone="ko">
                    Aucune ligne verte, et il n’y en aura pas : pour x = 13 le périmètre vaut 60 cm, pour x
                    = 14 il vaut 64 cm. Le périmètre <strong>saute par-dessus 62</strong> sans s’y arrêter.
                  </Feedback>
                  <TapQuestion
                    prompt="Pourquoi le tableau n’arrive-t-il pas à trouver la largeur ?"
                    options={[
                      'Parce que le problème est impossible',
                      'Parce que la largeur cherchée n’est pas un nombre entier — aucune puce ne la propose',
                      'Parce qu’il faudrait tester des largeurs beaucoup plus grandes',
                    ]}
                    cols={1}
                    correct={1}
                    explain={
                      <>
                        Le périmètre augmente de 4 cm chaque fois que la largeur augmente de 1 cm : il passe
                        de 60 à 64 sans jamais valoir 62. La largeur cherchée est{' '}
                        <strong className="font-mono">{formatDec(SOL62)}</strong> cm — une valeur qu’aucune
                        puce entière ne peut donner. Le problème, lui, a bien une réponse.
                      </>
                    }
                    explainWrong={
                      <>
                        Regarde tes propres lignes : entre x = 13 (60 cm) et x = 14 (64 cm), 62 est
                        <em> franchi</em>. Tester plus loin éloigne encore ; et un rectangle de périmètre 62
                        cm existe parfaitement. Ce qui manque, c’est une largeur non entière.
                      </>
                    }
                    requires={['pourquoi-une-equation', 'traduire-en-equation']}
                    solved={whyDone}
                    onAnswered={() => setWhyDone(true)}
                  />
            {whyDone && (
              <KnowledgeBrick
                id="choisir-la-strategie"
                variant="new"
                compact
                lead="Ce qui fait pencher pour l’une ou pour l’autre."
              />
            )}
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'L’équation, elle, y arrive',
          subtitle: 'Une ligne, et la valeur exacte tombe.',
          done: largeurDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2 text-sm text-slate-700">
                <p>
                  <strong>Toute situation n’a pas besoin d’une équation</strong> — les crêpes s’en passent
                  très bien. Mais quand le résultat n’est pas un nombre rond, le tableau d’essais s’arrête
                  net, et l’équation continue.
                </p>
                <p className="font-mono text-center text-slate-800">
                  <MathText>
                    {`$${formatEquation(RECTANGLE_62.equation)} \\;\\Rightarrow\\; 4x = 54 \\;\\Rightarrow\\; x = 13{,}5$`}
                  </MathText>
                </p>
              </div>
              <NumericQuestion
                prompt={
                  <>
                    Quelle est la largeur du rectangle de périmètre 62 cm ?
                  </>
                }
                expected={13.5}
                parse={parseDec}
                display={formatDec(13.5)}
                suffix="cm"
                explain={
                  <>
                    <MathText>{'$4x + 8 = 62$'}</MathText> : on retire 8 des deux côtés (
                    <MathText>{'$4x = 54$'}</MathText>) puis on partage en 4 (
                    <MathText>{'$x = 13{,}5$'}</MathText>). Vérification dans l’histoire : largeur 13,5 cm,
                    longueur 17,5 cm, périmètre <MathText>{'$2 \\times 13{,}5 + 2 \\times 17{,}5 = 62$'}</MathText>{' '}
                    cm. ✔
                  </>
                }
                explainFor={(n) => {
                  if (n === 13 || n === 14) {
                    return (
                      <>
                        {formatDec(n)} cm est la ligne de ton tableau la plus proche, mais elle donne{' '}
                        <strong className="font-mono">
                          {formatDec(evalLin(RECTANGLE_62.equation.left, n))}
                        </strong>{' '}
                        cm, pas 62. La solution exacte est entre les deux :{' '}
                        <MathText>{'$54 \\div 4 = 13{,}5$'}</MathText>.
                      </>
                    );
                  }
                  if (n === 15.5) {
                    return (
                      <>
                        15,5 cm, c’est <MathText>{'$62 \\div 4$'}</MathText> : tu as partagé le périmètre
                        sans retirer d’abord les 8 cm qui viennent des deux « + 4 » de la longueur. Ordre :{' '}
                        <MathText>{'$-8$'}</MathText> puis <MathText>{'$\\div 4$'}</MathText>.
                      </>
                    );
                  }
                  return (
                    <>
                      Reprends l’équation <MathText>{'$4x + 8 = 62$'}</MathText> : retire 8 des deux côtés,
                      puis partage en 4. Tu obtiens{' '}
                      <MathText>{'$x = 13{,}5$'}</MathText>.
                    </>
                  );
                }}
                requires={['choisir-la-strategie', 'traduire-en-equation']}
                solved={largeurDone}
                onAnswered={() => setLargeurDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> La structure du problème choisit la stratégie. Passons à la
          résolution elle-même.
        </KnowledgeSnapshot>
      )}
    />
  );
}
