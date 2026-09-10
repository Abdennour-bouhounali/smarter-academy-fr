import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView } from '../../../../../common/stats';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { depistageTable, DEPISTAGE } from '../data';
import { conditional, conditionalCounts, pct } from '../components/condUtils';

/**
 * Module 2 — DÉCOUVERTE : calculer une probabilité conditionnelle sur de grands
 * effectifs (P1), et surtout la DIRE juste (P2).
 *
 * La situation est le dépistage, et c'est un choix : c'est la seule où le
 * résultat correct est si contraire à l'intuition qu'aucun élève ne peut le
 * deviner. Tous les nombres sont ENTIERS et vérifiés (condUtils.test.js) — 990
 * vrais positifs, 1 980 faux positifs, 2 970 positifs en tout, et le quotient
 * tombe sur 1/3 exactement.
 *
 * CONNAISSANCES AVANT LA DEMANDE, dans l'ordre du source :
 *   étape 1  compter dans le tableau → brique `conditionnelle-sur-effectifs`
 *   étape 2  le renversement observé → brique `paradoxe-depistage`
 *   étape 3  la phrase à choisir → brique `phrase-population-reference`
 *   étape 4  la question qui exige les trois.
 *
 * Ce que ce module NE fait PAS : construire l'arbre (M3), calculer P(positif)
 * par les chemins (M4, M5). Il compte dans un tableau, parce que compter est
 * ce qui rend le paradoxe incontestable.
 */
const T = depistageTable();
const P_POS_MALADE = conditional(T, { axis: 'row', key: 'malade' }, 'positif');
const P_MALADE_POS = conditional(T, { axis: 'col', key: 'positif' }, 'malade');
const CNT = conditionalCounts(T, { axis: 'col', key: 'positif' }, 'malade');

/** Libellés lisibles des modalités, au format attendu par CrossTableView. */
const TABLE_LABELS = {
  rows: { malade: DEPISTAGE.labels.malade, sain: DEPISTAGE.labels.sain },
  cols: { positif: 'test +', negatif: 'test −' },
};

/** Le tableau au format attendu par CrossTableView, sans le recopier à la main. */
const TABLE_VIEW = {
  cells: T.cells,
  rowTotals: T.rowTotals,
  colTotals: T.colTotals,
  grandTotal: T.total,
  rowOrder: T.rows,
  colOrder: T.cols,
};

export default function Module02CalculerEtDire() {
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Compter dans le tableau',
      subtitle:
        'Cent mille personnes passent le test. Le tableau donne les quatre effectifs. Commence par le calcul le plus simple : parmi les malades, quelle part le test détecte-t-il ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Le test détecte 99 % des malades et se trompe sur 2 % des personnes en bonne santé. Parmi les gens dont le test est POSITIF, quelle part penses-tu être réellement malade ?"
            options={[
              { id: 'presque', label: 'Presque toutes — autour de 99 %' },
              { id: 'moitie', label: 'Environ la moitié' },
              { id: 'tiers', label: 'Moins de la moitié' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={q1}
          />
          <CrossTableView
            table={TABLE_VIEW}
            labels={TABLE_LABELS}
            rowsTitle="état de santé"
            colsTitle="résultat du test"
            highlight={{ axis: 'row', key: 'malade' }}
            caption="Cent mille personnes testées : effectifs observés, la ligne des malades en référence"
          />
          <NumericQuestion
            prompt={
              <>
                Parmi les <strong>{T.rowTotals.malade}</strong> personnes malades, quelle part
                le test détecte-t-il ? (en %, sans le signe)
              </>
            }
            expected={99}
            parse={parseDec}
            display="99"
            suffix="%"
            requires={['univers-restreint', 'notation-sachant', 'effectif']}
            explain={`On se place parmi les ${T.rowTotals.malade} malades : ${T.cells.malade.positif} d’entre eux ont un test positif, soit ${T.cells.malade.positif} ÷ ${T.rowTotals.malade} = 0,99.`}
            explainFor={(n) =>
              n === 0.99
                ? 'La valeur est juste mais la question demandait un pourcentage : 0,99 s’écrit 99 %.'
                : `Le dénominateur est l’effectif du groupe où l’on se place : les ${T.rowTotals.malade} malades, pas les ${T.total} personnes testées. ${T.cells.malade.positif} ÷ ${T.rowTotals.malade} = 0,99.`
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Le geste est celui de la Seconde : on choisit d’abord le groupe où l’on se place —
                ici les {T.rowTotals.malade} malades —, et son effectif devient le dénominateur.
              </Feedback>
              <KnowledgeBrick
                id="conditionnelle-sur-effectifs"
                variant="new"
                lead={<>Quatre gestes, toujours les mêmes, sur des effectifs de n’importe quelle taille.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, l’autre sens',
      subtitle:
        'Une personne apprend que son test est positif. Change de groupe : place-toi parmi tous ceux dont le test est positif, et recompte.',
      done: q2,
      content: (
        <div className="space-y-3">
          <CrossTableView
            table={TABLE_VIEW}
            labels={TABLE_LABELS}
            rowsTitle="état de santé"
            colsTitle="résultat du test"
            highlight={{ axis: 'col', key: 'positif' }}
            caption="La colonne « test + » : le nouveau groupe de référence"
          />
          <NumericQuestion
            prompt={
              <>
                Combien de personnes ont un test positif en tout, malades et bien portantes
                confondues ?
              </>
            }
            expected={CNT.denominator}
            display={String(CNT.denominator)}
            requires={['effectif', 'conditionnelle-sur-effectifs']}
            explain={`${T.cells.malade.positif} malades détectés et ${T.cells.sain.positif} personnes en bonne santé alertées à tort : ${T.cells.malade.positif} + ${T.cells.sain.positif} = ${CNT.denominator}. C’est le total de la colonne « test + ».`}
            explainFor={(n) =>
              n === T.cells.malade.positif
                ? `Ce sont les malades détectés seulement. Il faut y ajouter les ${T.cells.sain.positif} personnes en bonne santé dont le test s’est trompé : ${CNT.denominator} au total.`
                : n === T.rowTotals.malade
                  ? `Ce sont les malades, pas les tests positifs : ${T.cells.malade.negatif} d’entre eux ont un test négatif, et ${T.cells.sain.positif} bien portants un test positif.`
                  : `On additionne les deux cases de la colonne « test + » : ${T.cells.malade.positif} + ${T.cells.sain.positif} = ${CNT.denominator}.`
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                {pred === 'tiers' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà le renversement'} :
                sur ces {CNT.denominator} tests positifs, seulement{' '}
                <strong>{CNT.numerator}</strong> concernent une personne réellement malade, soit{' '}
                <strong>{pct(P_MALADE_POS, 1)}</strong>. Les{' '}
                <strong>{T.cells.sain.positif}</strong> autres sont des alertes injustifiées :
                deux positifs sur trois. Et le test reste bien fiable à{' '}
                {pct(P_POS_MALADE, 0)} — rien n’a été truqué.
              </Feedback>
              <KnowledgeBrick
                id="paradoxe-depistage"
                variant="new"
                lead={<>Ce renversement porte un nom, et il a une cause précise : la rareté de la maladie.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le dire sans mentir',
      subtitle: 'Une seule de ces phrases décrit correctement le nombre que tu viens de calculer.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Tu viens de trouver ${CNT.numerator} / ${CNT.denominator} ≈ ${pct(P_MALADE_POS, 1)}. Quelle phrase dit exactement cela ?`}
            options={[
              'Parmi les personnes dont le test est positif, environ une sur trois est réellement malade',
              'Le test se trompe environ une fois sur trois',
              'Environ un tiers de la population est malade',
              'Parmi les personnes malades, environ une sur trois a un test positif',
            ]}
            correct={0}
            cols={1}
            requires={['conditionnelle-sur-effectifs', 'paradoxe-depistage', 'inversion']}
            explain={`La phrase juste commence par nommer le groupe où l’on s’est placé : les ${CNT.denominator} personnes au test positif. « Le test se trompe une fois sur trois » parlerait de tous les tests — il se trompe en réalité sur ${T.cells.malade.negatif} malades et ${T.cells.sain.positif} bien portants, soit ${T.cells.malade.negatif + T.cells.sain.positif} tests sur ${T.total}. Et « parmi les malades » donnerait ${pct(P_POS_MALADE, 0)}, pas ${pct(P_MALADE_POS, 1)}.`}
            explainWrong={`Chacune des trois autres phrases parle d’un AUTRE groupe : tous les tests, toute la population, ou les seuls malades. Le nombre ${CNT.numerator} / ${CNT.denominator} a été calculé parmi les personnes au test positif — la phrase doit le dire.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="phrase-population-reference"
              variant="new"
              lead={<>Commencer par « parmi les… » force à choisir le groupe avant de parler — et rend l’erreur visible à la relecture.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pourquoi si peu ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Le test est fiable à 99 %. D’où viennent alors les 1 980 alertes injustifiées, deux fois plus nombreuses que les vraies ?"
          options={[
            'Les 2 % d’erreurs portent sur 99 000 personnes en bonne santé, alors que les 99 % de réussite ne portent que sur 1 000 malades',
            'Le test est en réalité mal réglé : 2 % d’erreurs, c’est beaucoup',
            'Parce que les personnes en bonne santé passent le test plus souvent',
            'Parce que 99 % et 98 % ne s’additionnent pas correctement',
          ]}
          correct={0}
          cols={1}
          requires={['paradoxe-depistage', 'conditionnelle-sur-effectifs', 'pourcentage']}
          explain={`Un petit pourcentage d’un très grand groupe dépasse un grand pourcentage d’un petit groupe : 2 % de ${T.rowTotals.sain} font ${T.cells.sain.positif}, quand 99 % de ${T.rowTotals.malade} n’en font que ${T.cells.malade.positif}. C’est la RARETÉ de la maladie qui produit le renversement, pas un défaut du test.`}
          explainWrong={`Compare les deux effectifs de départ : ${T.rowTotals.malade} malades contre ${T.rowTotals.sain} personnes en bonne santé. Un taux d’erreur de 2 % appliqué au second groupe donne ${T.cells.sain.positif} alertes — davantage que les ${T.cells.malade.positif} détections justifiées.`}
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Calculer, puis le dire juste"
      moduleSubtitle="Cent mille personnes, un test fiable, et un résultat que personne ne devine"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Un test fiable à 99 %',
        tone: 'indigo',
        body: (
          <p>
            Une maladie touche une personne sur cent. Un test la détecte chez{' '}
            {pct(P_POS_MALADE, 0)} des malades et ne se trompe que sur 2 % des personnes en bonne
            santé. Ton test est positif : quelles sont tes chances d’être réellement malade ?
            Compte, tu seras surpris.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Ce que tu viens d’établir.</strong> Le même comptage lu dans deux groupes donne{' '}
          {pct(P_POS_MALADE, 0)} et {pct(P_MALADE_POS, 1)} — et seule une phrase qui nomme son
          groupe de référence dit la vérité. Module suivant : construire l’arbre de cette
          situation, en accrochant chaque poids à la branche qui lui revient.
        </KnowledgeSnapshot>
      }
    />
  );
}
