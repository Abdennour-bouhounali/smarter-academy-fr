import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CrossJudge from '../components/CrossJudge';
import TwoTreesLab from '../components/TwoTreesLab';
import {
  independence, compatibility, conditional, labReadings, pct,
} from '../components/indepUtils';
import {
  CARTES, cartesCoeurRoi, cartesCoeurPique, ATELIER, atelierTable, LAB_INCOMPATIBLE,
} from '../data';

/**
 * Module 5 — PRACTICE LAB : indépendant n'est pas incompatible (P4), puis un
 * problème concret qui demande tout à la fois (P5).
 *
 * LE CŒUR PÉDAGOGIQUE DE LA LEÇON. Les deux mots se ressemblent et se
 * confondent ; ils désignent pourtant des situations presque opposées. Deux
 * événements incompatibles sont le cas le plus LIÉ qui soit : savoir que l'un
 * s'est produit donne la CERTITUDE que l'autre ne s'est pas produit.
 *
 * ON LE FAIT CONSTATER, ON NE LE FAIT PAS RÉCITER — et dans cet ordre :
 *   étape 1  RAMENER LE LABORATOIRE DU MODULE 1 et faire glisser jusqu'à zéro
 *            élève commun. L'élève VOIT alors P(A ∩ B) = 0 tandis que
 *            P(A) × P(B) reste strictement positif, sur une population qu'il a
 *            réglée lui-même → brique `incompatibles` ;
 *   étape 2  les deux paires de cartes prises dans le MÊME jeu, l'une
 *            indépendante et l'autre incompatible : le contraste sans contexte
 *            neuf → brique `incompatible-nest-pas-independant` ;
 *   étape 3  la question qui exige d'articuler les deux mots →
 *            brique `mem-deux-mots` ;
 *   étape 4  LE PROBLÈME CONCRET (P5) : 2 000 pièces, deux machines, les deux
 *            sens du conditionnement ET un verdict d'indépendance →
 *            brique `methode-probleme-deux-sens`.
 *
 * LE GLISSER, ENCORE, ET JAMAIS GELÉ. L'étape 1 rouvre `TwoTreesLab` : l'élève
 * qui a compris doit pouvoir refaire le geste, et c'est ici qu'il sert à
 * produire un état EXTRÊME plutôt qu'un état remarquable. Aucun `disabled` lié à
 * un `done` ; le seul verrou est l'antériorité sur l'étape suivante.
 */
const CR = cartesCoeurRoi();
const CP = cartesCoeurPique();
const IND_CR = independence(CR, { rowKey: 'coeur', colKey: 'roi' });
const COMP_CP = compatibility(CP, { rowKey: 'coeur', colKey: 'pique' });
const IND_CP = independence(CP, { rowKey: 'coeur', colKey: 'pique' });
const AT = atelierTable();
const IND_AT = independence(AT, { rowKey: 'm1', colKey: 'defectueuse' });

export default function Module05IndependantNEstPasIncompatible() {
  // On PART d'un réglage ordinaire (80 élèves communs) : l'élève doit
  // effectuer le geste qui l'amène à zéro, l'état extrême n'est pas donné.
  const [etat, setEtat] = useState({ nA: LAB_INCOMPATIBLE.nA, nAB: 80 });
  const lecture = labReadings(etat);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const zero = etat.nAB === 0 && etat.nA > 0;

  const steps = [
    {
      num: 1,
      title: 'Fais glisser jusqu’à zéro',
      subtitle:
        'Reprends le laboratoire du premier module et amène la seconde séparation tout à gauche : plus aucun élève ne cumule les deux critères. Regarde alors les deux nombres du bas.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TwoTreesLab state={etat} onChange={setEtat} showVerdict={false} />
          <div className="rounded-2xl border-2 border-rose-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
              les deux membres du test, sur ton réglage
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-600">P(A ∩ B) — les deux à la fois</p>
                <p className="font-mono text-lg font-black tabular-nums text-slate-800">
                  {pct(lecture.pInter, 1)}
                </p>
              </div>
              <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2">
                <p className="text-xs text-rose-700">P(A) × P(B) — le produit</p>
                <p className="font-mono text-lg font-black tabular-nums text-rose-800">
                  {pct(lecture.pAtimesPB, 1)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {zero
                ? 'Aucun élève ne cumule les deux critères : le premier nombre est tombé à zéro. Le second, lui, ne peut pas tomber à zéro tant que les deux groupes ne sont pas vides.'
                : 'Continue de tirer la seconde séparation vers la gauche jusqu’à ce que le premier nombre atteigne zéro.'}
            </p>
          </div>
          <TapQuestion
            prompt="Quand aucun élève ne cumule les deux critères, que valent les deux membres du test ?"
            options={[
              'P(A ∩ B) vaut 0, alors que P(A) × P(B) reste strictement positif : le test échoue',
              'Les deux valent 0 : le test réussit, ces événements sont indépendants',
              'Les deux valent 1, puisque chaque élève est dans exactement un des deux groupes',
              'Le test n’a pas de sens dans ce cas',
            ]}
            correct={0}
            cols={1}
            requires={['test-du-produit', 'independance', 'probabilite']}
            explain={`Aucun élève commun, donc P(A ∩ B) = 0. Mais chacun des deux groupes est non vide, donc P(A) et P(B) sont tous deux strictement positifs, et leur produit aussi. Zéro d’un côté, un nombre positif de l’autre : l’égalité ne peut pas tenir.`}
            explainWrong="P(A) × P(B) ne peut valoir 0 que si l’un des deux événements est impossible. Ici les deux groupes contiennent des élèves — ils sont possibles tous les deux — donc leur produit est positif, et le test échoue nécessairement."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Deux événements qui ne se produisent jamais ensemble ne sont donc JAMAIS
                indépendants, dès lors qu’ils sont tous deux possibles. C’est même le contraire :
                savoir que l’un s’est produit donne la certitude que l’autre ne s’est pas produit
                — l’information maximale.
              </Feedback>
              <KnowledgeBrick
                id="incompatibles"
                variant="new"
                lead={<>Le mot qui décrit ce réglage extrême.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux paires dans le même jeu',
      subtitle:
        'Cinquante-deux cartes. À gauche « cœur » et « roi », à droite « cœur » et « pique ». Compare les deux verdicts.',
      done: q2,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={CR} labels={CARTES.coeurRoi.labels} rowKey="coeur" colKey="roi"
            title="« cœur » et « roi »" reveal="tout"
          />
          <CrossJudge
            table={CP} labels={CARTES.coeurPique.labels} rowKey="coeur" colKey="pique"
            title="« cœur » et « pique »" reveal="tout"
          />
          <NumericQuestion
            prompt={
              <>
                Pour « cœur » et « pique » : P(cœur) = 25 % et P(pique) = 25 %. Combien vaut{' '}
                <strong>P(cœur) × P(pique)</strong>, en pourcentage ? (sans le signe %)
              </>
            }
            expected={6.25}
            parse={parseDec}
            display="6,25"
            suffix="%"
            requires={['test-du-produit', 'probabilite', 'pourcentage']}
            explain={`0,25 × 0,25 = 0,0625, soit 6,25 %. Or il n’y a AUCUNE carte à la fois cœur et pique : P(cœur ∩ pique) = 0. Zéro n’est pas 6,25 % — ces deux événements ne sont pas indépendants.`}
            explainFor={(n) =>
              n === 50
                ? 'Tu as additionné les deux probabilités. Le test compare l’intersection à un PRODUIT.'
                : n === 0
                  ? 'Zéro est bien la valeur de P(cœur ∩ pique), l’AUTRE membre du test. On demandait le produit des deux probabilités : 0,25 × 0,25 = 0,0625.'
                  : '0,25 × 0,25 = 0,0625, soit 6,25 %.'
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Même jeu, deux paires, deux situations opposées. « Cœur » et « roi » se
                rencontrent (le roi de cœur) et sont indépendants :{' '}
                {IND_CR.exact.left} = {IND_CR.exact.right}. « Cœur » et « pique » ne se
                rencontrent jamais et ne sont donc pas indépendants : {IND_CP.exact.left} ≠{' '}
                {IND_CP.exact.right}.
                {COMP_CP.provesNotIndependent && (
                  <> Ce n’est pas propre à ce jeu : dès que deux événements possibles s’excluent,
                  {' '}P(A ∩ B) vaut {pct(COMP_CP.pInter, 0)} et P(A) × P(B) vaut{' '}
                  {pct(COMP_CP.pAtimesPB, 2)} — deux nombres qui ne peuvent pas être égaux.</>
                )}{' '}
                Les deux mots ne décrivent pas la même chose — ils ne peuvent même pas être vrais
                ensemble.
              </Feedback>
              <KnowledgeBrick
                id="incompatible-nest-pas-independant"
                variant="new"
                lead={<>La démonstration tient en deux nombres : 0 d’un côté, un nombre positif de l’autre.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ranger les deux mots',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un élève écrit : « A et B sont incompatibles, donc savoir que A s’est produit n’apprend rien sur B. » Que répondre ?"
            options={[
              'C’est le contraire : savoir que A s’est produit donne la certitude que B ne s’est pas produit',
              'C’est juste : incompatibles et indépendants veulent dire la même chose',
              'C’est juste, à condition que A et B aient la même probabilité',
              'On ne peut pas répondre sans connaître les effectifs',
            ]}
            correct={0}
            cols={1}
            requires={['incompatibles', 'incompatible-nest-pas-independant', 'independance']}
            explain="Si A et B ne peuvent pas se produire ensemble, alors dès que A est réalisé, B est exclu : P_A(B) = 0. C’est l’information la plus forte possible, à l’opposé de « cela n’apprend rien ». Les deux mots désignent des situations qui ne peuvent pas coexister quand les deux événements sont possibles."
            explainWrong="Aucun effectif n’est nécessaire : le raisonnement vaut pour toute paire d’événements possibles qui s’excluent. Et l’égalité des probabilités ne change rien — deux événements incompatibles de même probabilité 0,3 ne sont pas plus indépendants pour autant."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Une formule pour ne plus les confondre : incompatibles, ils ne se rencontrent
                jamais ; indépendants, se rencontrer ne leur apprend rien.
              </Feedback>
              <KnowledgeBrick
                id="mem-deux-mots"
                variant="new"
                lead={<>Les deux définitions côte à côte, pour ne plus les échanger.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le problème : deux mille pièces, deux machines',
      subtitle:
        'Un atelier produit 2 000 pièces. La machine 1 en fait 1 200, dont 60 défectueuses ; la machine 2 en fait 800, dont 40 défectueuses. Trois questions, trois groupes de référence.',
      done: q4,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={AT} labels={ATELIER.labels} rowKey="m1" colKey="defectueuse"
            title="Les 2 000 pièces de l’atelier" reveal={q4 ? 'poids' : 'aucun'}
          />
          <NumericQuestion
            prompt={
              <>
                Une pièce défectueuse est prélevée du bac de rebut. Quelle est la probabilité
                qu’elle vienne de la <strong>machine 1</strong> ? (en %, sans le signe)
              </>
            }
            expected={60}
            parse={parseDec}
            display="60"
            suffix="%"
            requires={['inverser-le-conditionnement', 'conditionnelle-sur-effectifs', 'mem-numerateur-commun']}
            explain={`On se place parmi les ${AT.colTotals.defectueuse} pièces défectueuses : ${AT.cells.m1.defectueuse} viennent de la machine 1, soit ${AT.cells.m1.defectueuse} ÷ ${AT.colTotals.defectueuse} = 0,6.`}
            explainFor={(n) =>
              n === 5
                ? `C’est l’autre sens : la part de défectueuses PARMI les pièces de la machine 1 (${AT.cells.m1.defectueuse} sur ${AT.rowTotals.m1}). Ici le groupe de référence est le bac de rebut, qui contient ${AT.colTotals.defectueuse} pièces.`
                : n === 3
                  ? `C’est ${AT.cells.m1.defectueuse} rapporté aux ${AT.total} pièces de l’atelier. La pièce est déjà connue défectueuse : on ne compte que parmi les ${AT.colTotals.defectueuse} du bac.`
                  : `Numérateur ${AT.cells.m1.defectueuse}, dénominateur ${AT.colTotals.defectueuse} : ${AT.cells.m1.defectueuse} ÷ ${AT.colTotals.defectueuse} = 0,6.`
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              {pct(IND_AT.condBA, 0)} des pièces du bac viennent de la machine 1 — simplement
              parce qu’elle produit {pct(IND_AT.pA, 0)} des pièces. Dans l’autre sens, la machine 1
              ne rate que {pct(IND_AT.condAB, 0)} de sa production. Deux nombres très différents,
              même case de {AT.cells.m1.defectueuse} pièces.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'La question qui décide de l’atelier',
      subtitle:
        'Le chef d’atelier veut savoir si l’une des deux machines rate plus que l’autre. Tranche.',
      done: q5,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={AT} labels={ATELIER.labels} rowKey="m1" colKey="defectueuse"
            title="Les 2 000 pièces de l’atelier" reveal={q5 ? 'tout' : 'poids'}
          />
          <TapQuestion
            prompt="« Vient de la machine 1 » et « est défectueuse » : ces deux événements sont-ils indépendants, et qu’est-ce que cela dit au chef d’atelier ?"
            options={[
              `Oui : ${IND_AT.exact.left} = ${IND_AT.exact.right}. Les deux machines ratent la même proportion, aucune n’est en cause`,
              `Non : la machine 1 produit ${AT.cells.m1.defectueuse} défectueuses contre ${AT.cells.m2.defectueuse} pour la machine 2, elle est donc moins fiable`,
              `Non : ${pct(IND_AT.condBA, 0)} des défectueuses viennent de la machine 1, c’est plus de la moitié`,
              'On ne peut pas conclure : il faudrait connaître le temps de fonctionnement de chaque machine',
            ]}
            correct={0}
            cols={1}
            requires={['test-du-produit', 'methode-verifier-independance', 'independance', 'trois-ecritures']}
            explain={`${AT.cells.m1.defectueuse} × ${AT.total} = ${IND_AT.exact.left} et ${AT.rowTotals.m1} × ${AT.colTotals.defectueuse} = ${IND_AT.exact.right} : l’égalité tient. Autrement dit, chaque machine rate ${pct(IND_AT.condAB, 0)} de sa production — la machine 1 en rate davantage en NOMBRE simplement parce qu’elle produit davantage.`}
            explainWrong={`Comparer ${AT.cells.m1.defectueuse} à ${AT.cells.m2.defectueuse} revient à comparer deux effectifs bruts sur des productions inégales (${AT.rowTotals.m1} contre ${AT.rowTotals.m2} pièces). Rapportés à leur production, les deux taux valent ${pct(conditional(AT, { axis: 'row', key: 'm1' }, 'defectueuse'), 0)} et ${pct(conditional(AT, { axis: 'row', key: 'm2' }, 'defectueuse'), 0)} : identiques.`}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <>
              <Feedback tone="ok">
                Le verdict retourne l’intuition du chef d’atelier : {pct(IND_AT.condBA, 0)} du bac
                vient bien de la machine 1, mais cela ne l’accuse en rien. Les deux taux de rebut
                sont égaux à {pct(IND_AT.condAB, 0)} — c’est le volume qui diffère, pas la
                qualité.
              </Feedback>
              <KnowledgeBrick
                id="methode-probleme-deux-sens"
                variant="new"
                lead={<>La marche à suivre quand un problème demande les deux sens ET un verdict.</>}
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Indépendant n’est pas incompatible"
      moduleSubtitle="Deux mots qu’on échange, et un atelier de deux mille pièces"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Deux mots presque opposés',
        tone: 'indigo',
        body: (
          <p>
            Deux événements qui ne peuvent pas se produire ensemble ne sont pas indépendants —
            ils en sont même le contraire. Tu vas le constater au glisser, puis sur deux paires de
            cartes du même jeu. Ensuite, un atelier réel : deux machines, un bac de rebut, et une
            accusation à confirmer ou à lever.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Ce que tu viens d’établir.</strong> Incompatibles, ils ne se rencontrent jamais
          — et ne sont donc jamais indépendants dès qu’ils sont possibles. Indépendants, se
          rencontrer ne leur apprend rien. Un problème concret demande souvent les deux sens du
          conditionnement avant de trancher. Module suivant : dix épreuves pour le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
