import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TRAITEUR, totalCommande, fr, mul, parseDecimalFr } from '../components/operations';

/**
 * Module 7 — LABORATOIRE D'ENTRAÎNEMENT : la note du traiteur.
 *
 * Transfert, pas répétition : une commande réelle où l'élève doit d'abord
 * ÉCRIRE la structure du calcul (une somme de produits — exactement ce que le
 * module 4 lui a appris à nommer), puis l'estimer, puis le vérifier. Le
 * contrôle par ordre de grandeur naît d'une erreur plausible : une virgule
 * mal placée sur une ligne de la note.
 *
 * Toutes les données viennent de components/operations.js et sont vérifiées
 * par le test : le total annoncé à l'élève ne peut pas dériver du code.
 */
const TOTAL = totalCommande();

/** La note, en tableau — DOM en flux : aucune collision possible. */
function Note({ surligne = null }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[320px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-2 font-semibold">Article</th>
            <th className="py-2 px-2 font-semibold text-right">Qté</th>
            <th className="py-2 px-2 font-semibold text-right">Prix unitaire</th>
          </tr>
        </thead>
        <tbody>
          {TRAITEUR.map((l) => (
            <tr
              key={l.article}
              className={`border-t border-slate-200 ${surligne === l.article ? 'bg-amber-50' : ''}`}
            >
              <td className="py-2 pr-2 text-slate-700">{l.article}</td>
              <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">{l.quantite}</td>
              <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-800">{fr(l.prixUnitaire)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Module07LaNoteDuTraiteur() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Écris la structure avant de calculer',
      subtitle: 'Ne calcule rien encore. Dis seulement de quel type de calcul il s’agit.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-3">
            <Note />
          </div>
          <TapQuestion
            prompt="Quelle écriture donne le total de cette commande ?"
            options={[
              '12 × 2,5 + 8 × 3,2 + 6 × 1,75',
              '(12 + 8 + 6) × (2,5 + 3,2 + 1,75)',
              '12 + 2,5 + 8 + 3,2 + 6 + 1,75',
              '(12 × 8 × 6) + (2,5 + 3,2 + 1,75)',
            ]}
            correct={0}
            cols={1}
            requires={['enchainement', 'priorites']}
            explain="Chaque ligne coûte quantité × prix unitaire : c’est un produit. Le total réunit ces trois lignes : c’est une somme. La structure est donc une SOMME DE TROIS PRODUITS, et les priorités font les produits d’abord — sans qu’aucune parenthèse soit nécessaire."
            explainWrong="Additionner toutes les quantités entre elles n’a pas de sens : 12 parts de quiche et 8 salades ne sont pas des objets de même prix. Chaque ligne doit d’abord donner SON prix (quantité × prix unitaire), et seulement ensuite on réunit les trois."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Estime avant de calculer',
      subtitle: 'Avec des nombres ronds, en tête, en dix secondes.',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="ordre-de-grandeur"
            variant="new"
            lead={<>Tu sais maintenant quelle est la structure du calcul. Avant de le poser, il existe un réflexe qui protège de presque toutes les grosses erreurs.</>}
          />
          <TapQuestion
            prompt="En arrondissant, dans quelle zone doit se trouver le total de la commande ?"
            options={['Autour de 65 €', 'Autour de 650 €', 'Autour de 6,50 €', 'Autour de 200 €']}
            correct={0}
            cols={2}
            requires={['ordre-de-grandeur']}
            explain="12 × 2,5 ≈ 30 ; 8 × 3,2 ≈ 24 ; 6 × 1,75 ≈ 12. Le total doit tourner autour de 66 € — donc « autour de 65 € »."
            explainWrong="Reprends ligne par ligne avec des nombres ronds : environ 30 €, puis environ 24 €, puis environ 12 €. Trois nombres de cet ordre ne peuvent donner ni 6,50 € ni 650 € : l’écart serait d’un facteur 10 ou 100."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Maintenant, le total exact',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-3">
            <Note />
          </div>
          <NumericQuestion
            prompt="Quel est le total exact de la commande, en euros ?"
            expected={TOTAL}
            parse={parseDecimalFr}
            display={`${fr(TOTAL)} €`}
            suffix="€"
            requires={['enchainement', 'priorites', 'ordre-de-grandeur']}
            explain={`12 × 2,5 = ${fr(mul(12, 2.5))} ; 8 × 3,2 = ${fr(mul(8, 3.2))} ; 6 × 1,75 = ${fr(mul(6, 1.75))}. Total : ${fr(TOTAL)} €, bien dans la zone estimée.`}
            explainFor={(n) => {
              if (n === 26) return 'Tu as sans doute additionné les quantités (12 + 8 + 6) : cela compte des articles, pas des euros. Chaque ligne doit d’abord être multipliée par son prix.';
              if (Number.isFinite(n) && n > 500) return `Ton résultat est dix fois trop grand : c’est la signature d’une virgule oubliée sur un prix. L’estimation annonçait environ 65 €, et le total exact est ${fr(TOTAL)} €.`;
              return `Ligne par ligne : ${fr(mul(12, 2.5))} + ${fr(mul(8, 3.2))} + ${fr(mul(6, 1.75))} = ${fr(TOTAL)} €.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Trois notes à contrôler',
      subtitle: 'Pour chacune, dis si le résultat est plausible — sans poser le calcul.',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="mem-controler" variant="new" compact />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Un logiciel de caisse affiche ces trois totaux. Lesquels sont{' '}
                <strong>vraisemblables</strong> ?
              </p>
            }
            rows={[
              {
                id: 'n1',
                label: '19 articles à 4,90 € → 93,10 €',
                options: ['Plausible', 'Douteux'],
                correct: 0,
                correction: '19 × 4,90 ≈ 20 × 5 = 100. 93,10 € est tout près : plausible.',
              },
              {
                id: 'n2',
                label: '7 articles à 12,50 € → 8,75 €',
                options: ['Plausible', 'Douteux'],
                correct: 1,
                correction: '7 × 12,50 vaut 87,50 € (une estimation à 7 × 12 = 84 le disait déjà). Un total de 8,75 € est dix fois trop petit : la virgule a glissé.',
              },
              {
                id: 'n3',
                label: '30 articles à 0,80 € → 240 €',
                options: ['Plausible', 'Douteux'],
                correct: 1,
                correction: '30 × 0,80 = 24 €, pas 240 €. Multiplier par un nombre plus petit que 1 donne moins que 30, pas plus.',
              },
            ]}
            requires={['ordre-de-grandeur', 'mem-controler']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Trois contrôles sans une seule opération posée. Une estimation en tête suffit à
                  repérer une <strong>virgule mal placée</strong>, qui est de très loin l’erreur la
                  plus fréquente sur les décimaux.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. La méthode est toujours la même : remplace chaque nombre
                  par un nombre rond, fais le calcul de tête, et compare. Si l’écart est un{' '}
                  <strong>facteur 10 ou 100</strong>, c’est une virgule.
                </Feedback>
              )
            }
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
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="La note du traiteur"
      moduleSubtitle="Lire la structure, estimer, puis vérifier"
      estimatedTime="9 min"
      brief={{
        tag: 'Entraînement',
        title: 'Une commande à vérifier',
        tone: 'amber',
        body: (
          <p>
            Un traiteur envoie sa note pour une fête. Avant de payer, il faut la contrôler. La
            bonne méthode n’est pas de tout recalculer au hasard : c’est de{' '}
            <strong>lire la structure</strong>, d’<strong>estimer</strong>, et seulement ensuite de
            calculer.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
