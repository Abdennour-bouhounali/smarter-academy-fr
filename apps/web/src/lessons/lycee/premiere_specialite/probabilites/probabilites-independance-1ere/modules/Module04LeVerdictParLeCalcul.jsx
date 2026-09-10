import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CrossJudge from '../components/CrossJudge';
import { independence, pct } from '../components/indepUtils';
import { DES, DES8, desTable, des8Table, CARTES, cartesCoeurRoi, CAS, casTable } from '../data';

/**
 * Module 4 — PRACTICE LAB : vérifier l'indépendance par le calcul (P3).
 *
 * CE QUE LE MODULE 3 A LAISSÉ. Un candidat repéré à l'œil, et la certitude que
 * l'œil ne suffit pas. Il manque un calcul qui réponde par oui ou par non.
 *
 * L'ORDRE, ET POURQUOI CELUI-LÀ :
 *   étape 1  le test du produit sur les cartes, où les trois nombres sont
 *            immédiats : P(cœur) = 1/4, P(roi) = 1/13, P(cœur ∩ roi) = 1/52 →
 *            brique `test-du-produit` ;
 *   étape 2  les DEUX autres écritures, constatées équivalentes sur les cas du
 *            module 3 → brique `trois-ecritures` ;
 *   étape 3  les deux dés, où l'œil ne peut RIEN : 36 issues, deux sommes
 *            presque identiques, deux verdicts opposés → brique
 *            `methode-verifier-independance` ;
 *   étape 4  la question qui exige de choisir la bonne écriture selon ce qu'on
 *            a sous la main.
 *
 * POURQUOI LES DÉS. C'est la situation où l'intuition est le plus violemment
 * prise en défaut : « la somme dépend du premier dé » semble évident, et c'est
 * vrai pour la somme 8, faux pour la somme 7. Le même énoncé à un mot près, deux
 * verdicts opposés — de quoi retirer définitivement l'envie de deviner.
 *
 * AUCUNE MANIPULATION GELÉE : les tableaux restent lisibles et leurs cases
 * cliquables après chaque validation ; aucun `disabled` n'est lié à un `done`.
 */
const CR = cartesCoeurRoi();
const IND_CR = independence(CR, { rowKey: 'coeur', colKey: 'roi' });
const D7 = desTable();
const D8 = des8Table();
const IND7 = independence(D7, { rowKey: 'pair', colKey: 'somme7' });
const IND8 = independence(D8, { rowKey: 'pair', colKey: 'somme8' });
const C1 = CAS[0];
const IND_C1 = independence(casTable(C1), { rowKey: 'A', colKey: 'B' });

export default function Module04LeVerdictParLeCalcul() {
  const [caseCliquee, setCaseCliquee] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le test du produit',
      subtitle:
        'Un jeu de 52 cartes. Clique les cases du tableau pour les explorer : 13 cœurs, 4 rois, et un seul roi de cœur.',
      done: q1,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={CR}
            labels={CARTES.coeurRoi.labels}
            rowKey="coeur"
            colKey="roi"
            title="Les 52 cartes, croisées selon la couleur et le rang"
            reveal={q1 ? 'calcul' : 'aucun'}
            selected={caseCliquee}
            onCellClick={setCaseCliquee}
            totalLabel="total"
          />
          <NumericQuestion
            prompt={
              <>
                P(cœur) vaut 13/52 et P(roi) vaut 4/52. Combien vaut leur{' '}
                <strong>produit</strong>, exprimé en nombre de cartes sur 52 ? Autrement dit :
                52 × P(cœur) × P(roi) = ?
              </>
            }
            expected={1}
            parse={parseDec}
            display="1"
            suffix="carte sur 52"
            requires={['probabilite', 'produit-chemin', 'quotient']}
            explain="13/52 × 4/52 = 1/4 × 1/13 = 1/52 : le produit vaut une carte sur 52. Et il y a exactement une carte qui est à la fois cœur et roi — le roi de cœur. Les deux nombres coïncident."
            explainFor={(n) =>
              n === 17 || n === 17.0
                ? 'Tu as additionné 13 et 4. La propriété porte sur un PRODUIT de probabilités, pas sur une somme d’effectifs.'
                : n === 4
                  ? 'C’est le nombre de rois. Le produit demandé est 1/4 × 1/13, qui vaut 1/52 — une seule carte.'
                  : '1/4 × 1/13 = 1/52 : une carte sur 52. Et le tableau en compte bien une à l’intersection.'
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Le produit tombe exactement sur l’effectif de l’intersection :{' '}
                {IND_CR.exact.left} = {IND_CR.exact.right} en écriture entière. Savoir qu’une
                carte est un cœur ne change pas sa chance d’être un roi : elle reste de 1 sur 13,
                dans les cœurs comme dans le paquet entier.
              </Feedback>
              <KnowledgeBrick
                id="test-du-produit"
                variant="new"
                lead={<>Le calcul qui tranche, et sa version entière qui ne dépend d’aucun arrondi.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois écritures pour une seule propriété',
      subtitle:
        'Reprenons la première population du module précédent. Le test du produit et les deux formes conditionnelles disent-ils la même chose ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={casTable(C1)} labels={C1.labels} rowKey="A" colKey="B"
            title={`${C1.title} — 1 000 élèves`} reveal="tout"
          />
          <div className="rounded-2xl border-2 border-emerald-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
              les trois écritures, sur cette même population
            </p>
            <table className="w-full text-sm tabular-nums">
              <tbody>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P(A ∩ B) contre P(A) × P(B)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">
                    {pct(IND_C1.pInter, 0)} = {pct(IND_C1.pA, 0)} × {pct(IND_C1.pB, 0)}
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P<sub>A</sub>(B) contre P(B)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">
                    {pct(IND_C1.condAB, 0)} = {pct(IND_C1.pB, 0)}
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <th scope="row" className="px-2 py-1.5 text-left text-xs font-semibold text-slate-500">
                    P<sub>B</sub>(A) contre P(A)
                  </th>
                  <td className="px-2 py-1.5 text-right font-mono font-bold">
                    {pct(IND_C1.condBA, 0)} = {pct(IND_C1.pA, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Les trois lignes sont vraies en même temps sur cette population. Que faut-il en conclure ?"
            options={[
              'Les trois écritures sont équivalentes : on utilise celle dont on a les nombres',
              'Il faut vérifier les trois pour être sûr du verdict',
              'La première est la seule valable, les deux autres sont des approximations',
              'Elles se contredisent, puisque 40 % et 50 % ne sont pas le même nombre',
            ]}
            correct={0}
            cols={1}
            requires={['test-du-produit', 'independance', 'intersection-vs-conditionnelle']}
            explain={`Les trois sont vraies exactement dans les mêmes situations, et fausses dans les mêmes. On choisit donc celle dont les nombres sont disponibles : le produit sur un tableau, les formes conditionnelles sur un arbre. Et non, ${pct(IND_C1.condAB, 0)} et ${pct(IND_C1.condBA, 0)} n’ont aucune raison d’être égaux entre eux : chacun se compare à SA probabilité, pas à l’autre.`}
            explainWrong={`Vérifier les trois ne serait pas faux, seulement inutile : elles tombent ensemble. Et la troisième ligne ne compare pas ${pct(IND_C1.condAB, 0)} à ${pct(IND_C1.condBA, 0)} — elle compare P_B(A) à P(A), qui valent tous deux ${pct(IND_C1.pA, 0)}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Point crucial : l’indépendance n’exige PAS que P<sub>A</sub>(B) soit égal à
                P<sub>B</sub>(A). Ici ils valent {pct(IND_C1.condAB, 0)} et{' '}
                {pct(IND_C1.condBA, 0)}, et les deux événements sont pourtant indépendants. Ce que
                le module 1 avait déjà montré sur les deux arbres.
              </Feedback>
              <KnowledgeBrick
                id="trois-ecritures"
                variant="new"
                lead={<>Trois formes, une seule propriété — et un piège à ne pas y ajouter.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux dés, deux sommes, deux verdicts',
      subtitle:
        'On lance deux dés. A = « le premier dé est pair ». Trente-six issues : ici l’œil ne peut rien, il faut compter.',
      done: q3,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={D7} labels={DES.labels} rowKey="pair" colKey="somme7"
            title="Les 36 issues, croisées avec « la somme vaut 7 »"
            reveal={q3 ? 'calcul' : 'poids'}
          />
          <NumericQuestion
            prompt={
              <>
                Le tableau donne n(A ∩ B) = {D7.cells.pair.somme7}, n(A) = {D7.rowTotals.pair} et
                n(B) = {D7.colTotals.somme7}, sur {D7.total} issues. Combien vaut le produit{' '}
                <strong>n(A) × n(B)</strong> ?
              </>
            }
            expected={IND7.exact.right}
            parse={parseDec}
            display={String(IND7.exact.right)}
            requires={['test-du-produit', 'effectif', 'probabilite']}
            explain={`${D7.rowTotals.pair} × ${D7.colTotals.somme7} = ${IND7.exact.right}. Et de l’autre côté, ${D7.cells.pair.somme7} × ${D7.total} = ${IND7.exact.left}. Les deux entiers sont égaux : ces deux événements sont indépendants.`}
            explainFor={(n) =>
              n === 24
                ? `Tu as additionné ${D7.rowTotals.pair} et ${D7.colTotals.somme7}. Le test compare un PRODUIT à un produit.`
                : n === IND7.exact.left
                  ? `C’est l’autre membre de l’égalité, ${D7.cells.pair.somme7} × ${D7.total}. On demandait n(A) × n(B) — et il se trouve qu’ils sont égaux, ce qui est justement le verdict.`
                  : `n(A) × n(B) = ${D7.rowTotals.pair} × ${D7.colTotals.somme7} = ${IND7.exact.right}.`
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                {IND7.exact.left} = {IND7.exact.right} : « le premier dé est pair » et « la somme
                vaut 7 » sont indépendants — ce qui heurte l’intuition, puisque la somme fait
                intervenir le premier dé. L’explication tient en une phrase : quel que soit le
                premier dé, il y a exactement un second dé qui donne 7.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un mot change, le verdict change',
      subtitle:
        'Même expérience, même événement A. On remplace seulement « la somme vaut 7 » par « la somme vaut 8 ».',
      done: q4,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={D8} labels={DES8.labels} rowKey="pair" colKey="somme8"
            title="Les 36 issues, croisées avec « la somme vaut 8 »"
            reveal={q4 ? 'calcul' : 'poids'}
          />
          <TapQuestion
            prompt={`Ici n(A ∩ B) = ${D8.cells.pair.somme8}, n(A) = ${D8.rowTotals.pair}, n(B) = ${D8.colTotals.somme8} sur ${D8.total} issues. Ces deux événements sont-ils indépendants ?`}
            options={[
              `Non : ${D8.cells.pair.somme8} × ${D8.total} = ${IND8.exact.left} mais ${D8.rowTotals.pair} × ${D8.colTotals.somme8} = ${IND8.exact.right}`,
              `Oui, comme pour la somme 7 : c’est la même expérience`,
              `Oui : ${D8.cells.pair.somme8} issues communes, c’est la même chose qu’avant`,
              'On ne peut pas conclure : 5 n’est pas un diviseur de 36',
            ]}
            correct={0}
            cols={1}
            requires={['test-du-produit', 'trois-ecritures', 'independance']}
            explain={`Le test échoue : ${IND8.exact.left} ≠ ${IND8.exact.right}. La différence avec la somme 7 tient à la parité — la somme 8 s’obtient avec deux dés de même parité, ce qui lie les deux dés. Un seul mot a changé dans l’énoncé, et le verdict s’est inversé.`}
            explainWrong={`« Même expérience » ne suffit pas : le verdict porte sur un COUPLE d’événements, pas sur l’expérience. Et ${D8.cells.pair.somme8} issues communes, c’est bien le même nombre qu’avant — mais n(B) est passé de ${D7.colTotals.somme7} à ${D8.colTotals.somme8}, ce qui casse l’égalité.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <Feedback tone="ok">
                Deux énoncés qui ne diffèrent que d’un chiffre, deux verdicts opposés. Après cela,
                deviner n’est plus une option : il faut poser les trois nombres et calculer.
              </Feedback>
              <KnowledgeBrick
                id="methode-verifier-independance"
                variant="new"
                lead={<>La marche à suivre, en quatre temps, valable dans tous les cas.</>}
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le verdict par le calcul"
      moduleSubtitle="Cinquante-deux cartes, trente-six issues, et une égalité d’entiers"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Ce que l’œil ne peut pas trancher',
        tone: 'indigo',
        body: (
          <p>
            Le module précédent a montré qu’un coup d’œil ne suffit pas. Voici le calcul qui
            répond par oui ou par non, dans ses trois écritures équivalentes — puis deux lancers
            de dés presque identiques, où l’intuition se trompe deux fois sur deux.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Ce que tu viens d’établir.</strong> P(A ∩ B) = P(A) × P(B) tranche sans
          arrondi, surtout dans sa forme entière n(A ∩ B) × N = n(A) × n(B). Les deux formes
          conditionnelles disent la même chose, et aucune n’exige que P<sub>A</sub>(B) égale
          P<sub>B</sub>(A). Module suivant : le mot avec lequel on confond le plus souvent
          celui-ci.
        </KnowledgeSnapshot>
      }
    />
  );
}
