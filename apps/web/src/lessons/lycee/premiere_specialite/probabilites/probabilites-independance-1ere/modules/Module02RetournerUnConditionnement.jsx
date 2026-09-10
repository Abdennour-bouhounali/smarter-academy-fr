import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import InversionPanel from '../components/InversionPanel';
import CrossJudge from '../components/CrossJudge';
import {
  inversionPair, totalProbability, inverseFromTree, pct,
} from '../components/indepUtils';
import { STAGE, stageTable, stageTreeByPrepa } from '../data';

/**
 * Module 2 — DÉCOUVERTE : retourner un conditionnement (P1).
 *
 * CE QUE LE MODULE 1 A LAISSÉ. L'élève a CONSTATÉ que les deux arbres portent
 * des poids différents. Il n'a pas encore de méthode pour passer de l'un à
 * l'autre quand on ne lui donne qu'un seul des deux nombres. C'est ce que ce
 * module construit — et il le construit sur les EFFECTIFS d'abord, parce que
 * c'est là que le mécanisme se voit : le numérateur ne bouge pas.
 *
 * LE CHOIX DU SCÉNARIO. 500 candidats, 100 préparés dont 90 reçus, 200 reçus en
 * tout. P_préparé(reçu) = 90 % et P_reçu(préparé) = 45 % : un rapport du simple
 * au double, impossible à confondre avec un arrondi. Et l'écart s'explique
 * entièrement par la taille des deux groupes — 100 contre 200 — ce que le
 * tableau met sous les yeux.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  lire le sens direct sur le tableau (acquis) puis PRÉDIRE l'autre
 *   étape 2  le calculer → brique `inverser-le-conditionnement`
 *   étape 3  le faire sans tableau, à partir d'un arbre seul →
 *            brique `inverser-sur-un-arbre` (la probabilité totale au
 *            dénominateur : elle est ACQUISE, on l'emploie)
 *   étape 4  la question qui exige de ne pas confondre les deux sens →
 *            brique `mem-numerateur-commun`
 *
 * AUCUNE MANIPULATION GELÉE : ce module n'en porte pas — les panneaux sont des
 * FIGURES DE LECTURE, pas des laboratoires. Le laboratoire glissant est celui
 * du module 1, et il reste accessible.
 */
const T = stageTable();
const INV = inversionPair(T, { fromAxis: 'row', fromKey: 'prepa', toKey: 'recu' });
const TREE = stageTreeByPrepa();
const TOTALE = totalProbability(TREE, 'recu');
const L = STAGE.labels;

export default function Module02RetournerUnConditionnement() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le sens qu’on te donne',
      subtitle:
        'Cinq cents candidats à un concours. Cent ont suivi la préparation, et quatre-vingt-dix d’entre eux sont reçus. Lis d’abord ce qu’on te donne.',
      done: q1,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={T}
            labels={L}
            rowKey="prepa"
            colKey="recu"
            reveal="aucun"
            title="Les 500 candidats, en effectifs"
            totalLabel="total"
          />
          <NumericQuestion
            prompt={
              <>
                Parmi les <strong>{T.rowTotals.prepa}</strong> candidats qui ont suivi la
                préparation, quel pourcentage est reçu ? (sans le signe %)
              </>
            }
            expected={90}
            parse={parseDec}
            display="90"
            suffix="%"
            requires={['conditionnelle-sur-effectifs', 'univers-restreint', 'denominateur']}
            explain={`On se place parmi les ${T.rowTotals.prepa} candidats préparés : ${T.cells.prepa.recu} d’entre eux sont reçus, soit ${T.cells.prepa.recu} ÷ ${T.rowTotals.prepa} = 0,9.`}
            explainFor={(n) =>
              n === 18
                ? `C’est ${T.cells.prepa.recu} rapporté aux ${T.total} candidats du concours entier. Ici le groupe de référence est celui des préparés : ils sont ${T.rowTotals.prepa}.`
                : n === 45
                  ? `C’est l’autre sens du calcul — celui qu’on va justement construire à l’étape suivante. Pour l’instant, le groupe de référence est celui des préparés.`
                  : `Le dénominateur est l’effectif du groupe dans lequel on se place : ${T.rowTotals.prepa} candidats préparés.`
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              Neuf préparés sur dix sont reçus. Une brochure dirait volontiers : « la préparation
              fait réussir 90 % de ses candidats ». Mais un candidat reçu, lui, se demande autre
              chose : combien de reçus étaient passés par cette préparation ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le sens qu’on te demande',
      subtitle:
        'Même tableau, autre question : parmi les reçus, quelle part était préparée ? Cherche le numérateur avant de chercher le dénominateur.',
      done: q2,
      content: (
        <div className="space-y-3">
          <InversionPanel
            table={T}
            fromKey="prepa"
            toKey="recu"
            labels={L}
            revealInverse={q2}
            question={
              <>
                parmi les <strong>{L.recu}s</strong> — ils sont {T.colTotals.recu} — quelle part
                avait suivi la préparation ?
              </>
            }
          />
          <NumericQuestion
            prompt={
              <>
                Parmi les <strong>{T.colTotals.recu}</strong> candidats reçus, quel pourcentage
                avait suivi la préparation ? (sans le signe %)
              </>
            }
            expected={45}
            parse={parseDec}
            display="45"
            suffix="%"
            requires={['conditionnelle-sur-effectifs', 'intersection-vs-conditionnelle', 'denominateur-decide']}
            explain={`Le numérateur ne change pas : ce sont toujours les ${INV.numerator} candidats qui cumulent les deux critères. Seul le dénominateur change de camp : ${INV.denomInverse} reçus au lieu de ${INV.denomDirect} préparés. ${INV.numerator} ÷ ${INV.denomInverse} = 0,45.`}
            explainFor={(n) =>
              n === 90
                ? 'C’est le sens de départ, celui de l’étape précédente. Retourner un conditionnement, ce n’est pas échanger deux lettres : le dénominateur doit devenir l’effectif du nouveau groupe de référence.'
                : n === 18
                  ? `C’est ${INV.numerator} rapporté aux ${T.total} candidats. Le groupe de référence est celui des reçus : ils sont ${INV.denomInverse}.`
                  : n === 20
                    ? `C’est la part des préparés dans l’ensemble du concours (${T.rowTotals.prepa} sur ${T.total}). La question porte sur les reçus.`
                    : `Numérateur ${INV.numerator}, dénominateur ${INV.denomInverse} : ${INV.numerator} ÷ ${INV.denomInverse} = 0,45.`
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                {pct(INV.direct, 0)} d’un côté, <strong>{pct(INV.inverse, 0)}</strong> de l’autre —
                du simple au double. Et pourtant, aucune des deux phrases n’est fausse : elles ne
                parlent tout simplement pas du même groupe. Plus de la moitié des reçus n’étaient
                pas préparés, parce que les non-préparés sont quatre fois plus nombreux.
              </Feedback>
              <KnowledgeBrick
                id="inverser-le-conditionnement"
                variant="new"
                lead={<>Le geste que tu viens de faire s’écrit en quatre temps.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si on n’avait pas le tableau ?',
      subtitle:
        'Un énoncé donne rarement les quatre effectifs. Le plus souvent il donne un arbre : 20 % de préparés, 90 % de reçus chez eux, 27,5 % chez les autres. Retourne quand même.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-100 bg-white p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              ce que l’arbre donne, sans aucun effectif
            </p>
            <table className="w-full text-sm tabular-nums">
              <tbody>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P(préparé)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">{pct(TREE[0].p, 0)}</td>
                  <td className="px-2 py-1.5 text-left text-xs text-slate-400">premier niveau</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P<sub>préparé</sub>(reçu)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">
                    {pct(TREE[0].children.find((c) => c.id === 'recu').p, 0)}
                  </td>
                  <td className="px-2 py-1.5 text-left text-xs text-slate-400">second niveau</td>
                </tr>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P<sub>non préparé</sub>(reçu)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">
                    {pct(TREE[1].children.find((c) => c.id === 'recu').p, 1)}
                  </td>
                  <td className="px-2 py-1.5 text-left text-xs text-slate-400">second niveau</td>
                </tr>
                <tr className="border-t-2 border-violet-200 bg-violet-50">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-bold text-violet-800">
                    P(reçu) — la somme des chemins
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-black text-violet-900">
                    {pct(TOTALE.total, 0)}
                  </td>
                  <td className="px-2 py-1.5 text-left text-xs text-violet-600">
                    {TOTALE.paths.map((p) => pct(p.product, 2)).join(' + ')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Pour obtenir P_reçu(préparé) à partir de ces seuls nombres, que faut-il diviser par quoi ?"
            options={[
              'Le chemin « préparé puis reçu » divisé par la somme de tous les chemins menant à « reçu »',
              'Le chemin « préparé puis reçu » divisé par la probabilité d’être préparé',
              'La probabilité d’être préparé divisée par celle d’être reçu',
              'La somme des deux chemins divisée par le chemin « préparé puis reçu »',
            ]}
            correct={0}
            cols={1}
            requires={['inverser-le-conditionnement', 'produit-chemin', 'somme-chemins', 'probabilites-totales']}
            explain={`Le chemin « préparé puis reçu » vaut ${pct(TOTALE.paths[0].product, 1)} : c’est P(préparé ∩ reçu), autrement dit le numérateur du tableau ramené à des probabilités. La somme des chemins vaut ${pct(TOTALE.total, 0)} : c’est P(reçu), le nouveau dénominateur. ${pct(TOTALE.paths[0].product, 1)} ÷ ${pct(TOTALE.total, 0)} = ${pct(inverseFromTree(TREE, 'recu', 'prepa'), 0)} — exactement le nombre trouvé sur le tableau.`}
            explainWrong="Diviser par la probabilité d’être préparé rendrait le sens de départ, pas l’autre. Le dénominateur doit être la probabilité du NOUVEAU groupe de référence — les reçus — et c’est la somme de tous les chemins qui y mènent."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                {pct(TOTALE.paths[0].product, 1)} ÷ {pct(TOTALE.total, 0)} ={' '}
                <strong>{pct(inverseFromTree(TREE, 'recu', 'prepa'), 0)}</strong> — le même nombre
                que sur le tableau, obtenu sans jamais connaître un seul effectif. C’est la même
                opération : un numérateur qui ne bouge pas, un dénominateur qui devient celui du
                groupe d’arrivée.
              </Feedback>
              <KnowledgeBrick
                id="inverser-sur-un-arbre"
                variant="new"
                lead={<>Quand l’énoncé ne donne qu’un arbre, l’inversion s’écrit avec ce qu’on a.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'La phrase qui trahit l’erreur',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une publicité affirme : « 90 % de nos candidats sont reçus — donc 90 % des reçus viennent de chez nous. » Où est la faute ?"
            options={[
              'Le second nombre se calcule sur les reçus, qui sont deux fois plus nombreux que les préparés : il vaut 45 %',
              'Les deux nombres sont justes, la publicité dit vrai',
              'Le premier nombre est faux : il faudrait diviser par les 500 candidats',
              'Il manque simplement une virgule : c’est 9,0 % dans les deux cas',
            ]}
            correct={0}
            cols={1}
            requires={['inverser-le-conditionnement', 'intersection-vs-conditionnelle', 'phrase-population-reference']}
            explain={`Le numérateur est le même — ${INV.numerator} candidats — mais les dénominateurs sont ${INV.denomDirect} et ${INV.denomInverse}. Le second nombre vaut donc ${pct(INV.inverse, 0)}, pas ${pct(INV.direct, 0)}. La publicité échange deux lettres là où il fallait changer de dénominateur.`}
            explainWrong={`Le premier nombre est correct : ${T.cells.prepa.recu} reçus parmi ${T.rowTotals.prepa} préparés, soit ${pct(INV.direct, 0)}. C’est le second qui est faux : parmi les ${INV.denomInverse} reçus, seuls ${INV.numerator} étaient préparés, soit ${pct(INV.inverse, 0)}.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <Feedback tone="ok">
                Retenir la règle sous sa forme la plus courte : le HAUT du quotient ne bouge pas,
                le BAS change de camp. Tout le reste en découle.
              </Feedback>
              <KnowledgeBrick
                id="mem-numerateur-commun"
                variant="new"
                lead={<>La forme courte, celle qu’on garde.</>}
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
      moduleTitle="Retourner un conditionnement"
      moduleSubtitle="Cinq cents candidats, un même 90, et deux dénominateurs"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: '90 % dans un sens, 45 % dans l’autre',
        tone: 'indigo',
        body: (
          <p>
            Le module précédent a montré que les deux arbres d’une même population ne portent pas
            les mêmes poids. Reste à savoir passer de l’un à l’autre. Sur un concours de 500
            candidats, on va voir pourquoi le numérateur ne bouge jamais — et pourquoi le
            dénominateur, lui, change de camp.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Ce que tu viens d’établir.</strong> Retourner un conditionnement garde le même
          numérateur et remplace le dénominateur par l’effectif du nouveau groupe de référence —
          ou, sur un arbre, par la somme des chemins qui y mènent. Module suivant : le cas
          particulier trouvé au premier module, celui où savoir ne change rien, et son nom.
        </KnowledgeSnapshot>
      }
    />
  );
}
