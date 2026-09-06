import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RecipeLab from '../components/RecipeLab';
import RatioTable from '../components/RatioTable';
import { RECETTE, quantityFor } from '../components/situationsData';
import { formatDec, parseDec, applyRule, agree } from '../components/propUtils';

/**
 * Module 1 — DÉCLENCHEUR : « La recette pour 7 » (manipulation signature).
 *
 * Activity: faire varier le nombre de convives d'une recette ; noter des
 *   couples ; prédire pour 4 puis pour 7 ; lire la ligne des rapports ; voir
 *   les points s'aligner ; constater que le temps de cuisson ne suit pas.
 * Mathematical objective: faire ÉPROUVER l'invariance multiplicative — pour
 *   passer du nombre de personnes à une quantité, on multiplie TOUJOURS par le
 *   même nombre ; identifier les grandeurs qui interviennent (et celle qui
 *   n'intervient pas).
 * Student action: glisser ou ± les convives ; noter ; répondre ; observer.
 * Controlled variable: n, le nombre de personnes.
 * Mathematical state: { n, recorded } ; chaque quantité vient de
 *   `quantityFor` (la règle), la ligne des rapports et les points en sont
 *   dérivés.
 * Visual consequence: les barres d'ingrédients s'allongent ensemble ; le
 *   tableau se remplit ; « farine ÷ personnes » vaut 150 partout ; les
 *   points s'alignent avec l'origine ; la barre du temps de cuisson ne bouge
 *   pas.
 * Expected observation: « quand je double, tout double ; pour 7 ce n'est pas
 *   un multiple de 2 et pourtant 150 × 7 marche » ; « 150 ne bouge jamais ».
 * Misconception targeted: ajouter (+150) au lieu de multiplier ; « 7 n'est
 *   pas possible » ; croire que le temps de cuisson est proportionnel.
 * Feedback: explainFor cible 2 100 (oubli du ÷ 2), 450 (300 + 150), 1 500 ;
 *   les corrections citent les nombres de l'élève.
 * Formalization: « rapport constant » à l'étape 4 ; « coefficient » est
 *   laissé au module 2.
 * Scaffolding: stepper libre → prédiction du double → prédiction de 7 →
 *   rapports → graphique → contre-exemple.
 */

const FARINE = RECETTE.ingredients[0];
const MAX = RECETTE.maxPeople;
const RANGE = { xMin: 0, xMax: MAX, yMin: 0, yMax: quantityFor(FARINE, MAX) };

export default function Module01Recette() {
  const [people, setPeople] = useState(2);
  const [recorded, setRecorded] = useState(() => new Set([2]));
  const [doubleDone, setDoubleDone] = useState(false);
  const [sevenDone, setSevenDone] = useState(false);
  const [ratioDone, setRatioDone] = useState(false);
  const [graphDone, setGraphDone] = useState(false);
  const [fixedDone, setFixedDone] = useState(false);
  const [gDone, setGDone] = useState(false);

  const rows = [...recorded].sort((a, b) => a - b).map((n) => ({ x: n, y: quantityFor(FARINE, n) }));
  const done1 = recorded.size >= 4;
  const record = (n, kit) => { setRecorded((s) => new Set(s).add(n)); kit.react(true); };
  const q = (n) => quantityFor(FARINE, n);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La recette pour 7"
      moduleSubtitle="Fais varier le nombre de convives : les quantités grandissent, un nombre ne bouge pas."
      estimatedTime="12 min"
      brief={{
        tag: '🥞 Mission 01',
        title: 'Samedi, vous serez 7',
        tone: 'indigo',
        body: (
          <p>
            La recette de crêpes est écrite pour <strong>2 personnes</strong> : 300 g de farine, 4 œufs,
            50 cL de lait. Samedi, vous serez 7. Fais varier les convives et regarde ce qui se passe.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Fais varier les convives',
          subtitle: 'Règle le nombre de personnes, puis note au moins trois autres valeurs dans le tableau.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <RecipeLab people={people} onPeopleChange={setPeople} recorded={recorded} onRecord={(n) => record(n, kit)} highlightId="farine" caption="La recette" />
              <RatioTable xLabel="personnes" yLabel="farine" yUnit="g" columns={rows} caption="Ce que tu as noté (farine)" />
              <Feedback tone={done1 ? 'ok' : 'info'}>
                {done1 ? <>Quatre couples au tableau. Regarde-les : comment passe-t-on des personnes à la farine ?</>
                  : <>Encore <strong>{4 - recorded.size}</strong> valeur{4 - recorded.size > 1 ? 's' : ''} à noter. Essaie 1 personne, et 12.</>}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Prédis : 4 personnes',
          subtitle: 'Réponds avant de régler la recette.',
          done: doubleDone,
          content: (
            <TapQuestion
              prompt="2 personnes → 300 g de farine. Pour 4 personnes — deux fois plus —, il faut…"
              options={['600 g : deux fois plus', '450 g : 150 g de plus', '302 g : 2 de plus', 'On ne peut pas savoir sans la recette pour 4']}
              correct={0}
              cols={1}
              above={(revealed) => revealed && <RecipeLab people={4} onPeopleChange={() => {}} disabled highlightId="farine" caption="Pour 4 personnes" />}
              explain="Deux fois plus de convives, deux fois plus de farine : 600 g. Et deux fois plus d’œufs, de lait, de sucre — tout double en même temps. C’est la marque d’une situation proportionnelle."
              explainWrong="Regarde la recette réglée sur 4 : chaque barre a exactement doublé. On ne rajoute pas une quantité fixe, on MULTIPLIE."
              requires={['quotient']}
              solved={doubleDone}
              onAnswered={() => setDoubleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Et pour 7 ?',
          subtitle: '7 n’est pas un multiple de 2. Combien de farine ?',
          done: sevenDone,
          content: (
            <NumericQuestion
              prompt="Combien de grammes de farine pour 7 personnes ?"
              suffix="g"
              expected={q(7)}
              parse={parseDec}
              display={`${formatDec(q(7))} g`}
              above={(revealed) => revealed && <RecipeLab people={7} onPeopleChange={() => {}} disabled highlightId="farine" showRatio caption="Pour 7 personnes" />}
              explain={`Pour 1 personne : 300 ÷ 2 = 150 g. Pour 7 : 150 × 7 = ${formatDec(q(7))} g. Ou bien : de 2 à 7, on multiplie par 3,5, donc 300 × 3,5 = ${formatDec(q(7))} g. Les deux chemins passent par une MULTIPLICATION.`}
              explainFor={(n) => {
                if (n === 2100) return 'Tu as fait 300 × 7 : mais 300 g, c’est pour 2 personnes. Pour 1 personne : 150 g, et 150 × 7 = 1 050 g.';
                if (n === 300 + 5 * 150) return 'Tu as ajouté 150 g par personne à partir de 300 — le résultat est juste ! Mais pense-le aussi comme 150 × 7 : une multiplication.';
                if (n === 1500) return '1 500 serait pour 10 personnes. Pour 7 : 150 × 7 = 1 050 g.';
                if (n === 450) return '450 g, c’est pour 3 personnes. Pour 7 : 150 × 7 = 1 050 g.';
                return null;
              }}
              requires={['quotient']}
              solved={sevenDone}
              onAnswered={() => setSevenDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Le nombre qui ne bouge pas',
          subtitle: 'Regarde la ligne « farine ÷ personnes ».',
          done: ratioDone,
          content: (
            <div className="space-y-3">
              <RatioTable xLabel="personnes" yLabel="farine" yUnit="g" columns={rows} ratios="all" horizontal={rows.length >= 2 ? { from: 0, to: rows.length - 1, factor: rows[rows.length - 1].x / rows[0].x } : null} caption="Tes couples, avec le rapport farine ÷ personnes" />
              <TapQuestion
                prompt="Que représente ce 150 qui revient dans toutes les colonnes ?"
                options={['La farine pour UNE personne — le nombre par lequel on multiplie', 'Le nombre de convives les plus nombreux', 'La farine pour 2 personnes', 'Le nombre de crêpes']}
                correct={0}
                cols={1}
                explain="150 g, c’est la farine d’une seule personne. Pour n personnes, on multiplie n par 150 — toujours le même nombre, quel que soit n. Ce rapport constant est la SIGNATURE d’une situation de proportionnalité."
                explainWrong="Le total de farine change à chaque réglage ; le rapport farine ÷ personnes, lui, vaut 150 partout : c’est la farine d’UNE personne."
                requires={['quotient']}
                solved={ratioDone}
                onAnswered={() => setRatioDone(true)}
              />
              {ratioDone && (
                <>
                  <KnowledgeBrick
                    id="situation-proportionnelle"
                    variant="new"
                    lead="Ce rapport constant que tu viens de repérer est la signature d’une situation qui a un nom."
                  />
                  <KnowledgeBrick
                    id="droite-par-origine"
                    variant="new"
                    compact
                    lead="Et voici comment la reconnaître d’un coup d’œil sur un graphique."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Tes couples deviennent des points',
          subtitle: 'Prédis, puis regarde.',
          done: graphDone,
          content: (
            <TapQuestion
              prompt="Si l’on place tes couples (personnes ; farine) dans un repère, à quoi ressemblent-ils ?"
              above={(revealed) => (
                <CoordPlane
                  range={RANGE} unit={26} unitY={200 / RANGE.yMax} xStep={1} yStep={300}
                  functions={revealed ? [{ id: 'f', a: FARINE.per, b: 0, tone: 'emerald' }] : []}
                  points={[{ id: 'O', name: 'O', x: 0, y: 0, color: '#e11d48' }, ...rows.map((r) => ({ id: `p${r.x}`, x: r.x, y: r.y, color: '#059669' }))]}
                  axisLabels={{ x: 'personnes', y: 'g' }} ariaLabel="Repère : farine selon le nombre de personnes" caption={false}
                />
              )}
              options={['Ils sont alignés sur une droite qui passe par l’origine', 'Ils forment une courbe qui monte de plus en plus vite', 'Ils sont alignés, mais la droite passe au-dessus de l’origine', 'Ils sont placés au hasard']}
              correct={0}
              cols={1}
              explain="0 personne, 0 g : le point (0 ; 0) est sur la droite, et tous les autres avec lui, puisqu’on multiplie toujours par 150. Points alignés avec l’origine : c’est à quoi ressemble la proportionnalité dans un repère."
              explainWrong="Regarde : la droite qui joint tes points passe exactement par O, parce que 0 personne demande 0 g. C’est la signature graphique de la proportionnalité."
              requires={['droite-par-origine', 'situation-proportionnelle']}
              solved={graphDone}
              onAnswered={() => setGraphDone(true)}
            />
          ),
        },
        {
          num: 6,
          title: 'Et le temps de cuisson ?',
          subtitle: 'Règle les convives et regarde la dernière barre.',
          done: fixedDone && gDone,
          content: (
            <div className="space-y-3">
              <RecipeLab people={people} onPeopleChange={setPeople} showFixed caption="La recette, avec le temps de cuisson" />
              <TapQuestion
                prompt={`Pour ${people} ${agree(people, 'personnes')}, le temps de cuisson d’une crêpe est de ${formatDec(applyRule(RECETTE.fixed.rule, people))} min. Est-il proportionnel au nombre de convives ?`}
                options={['Non : il ne change pas quand les convives changent', 'Oui : plus on est nombreux, plus on cuit longtemps', 'Oui : on multiplie par 25']}
                correct={0}
                cols={1}
                explain="Le temps de cuisson d’UNE crêpe ne dépend pas du nombre de convives : il vaut 25 min pour 1 comme pour 12. Ce n’est pas une grandeur proportionnelle — le rapport temps ÷ personnes change à chaque réglage."
                explainWrong="Fais varier les convives : la barre du temps de cuisson ne bouge pas. 25 ÷ 2 ≠ 25 ÷ 7 — pas de rapport constant, pas de proportionnalité."
                requires={['situation-proportionnelle']}
                solved={fixedDone}
                onAnswered={() => setFixedDone(true)}
              />
              {fixedDone && (
                <TapQuestion
                  prompt="Dans cette situation, quelles sont les deux grandeurs proportionnelles ?"
                  options={['Le nombre de personnes et la quantité de chaque ingrédient', 'Le nombre de personnes et le temps de cuisson', 'La farine et le temps de cuisson', 'Le nombre d’œufs et le nombre de crêpes par personne']}
                  correct={0}
                  cols={1}
                  explain="Avant de calculer, il faut nommer les grandeurs : ici « nombre de personnes » et « quantité d’ingrédient ». Le temps de cuisson n’intervient pas dans la proportionnalité — même s’il figure dans la recette."
                  requires={['situation-proportionnelle', 'droite-par-origine']}
                  solved={gDone}
                  onAnswered={() => setGDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais reconnaître une situation proportionnelle. Reste à
          nommer le nombre qui la commande.
        </KnowledgeSnapshot>
      )}
    />
  );
}
