import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView, FractionField } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { q, somme, produit } from '../components/rationnels4e';

/**
 * Module 6 — LABORATOIRE DE PRATIQUE : choisir l'opération avant de calculer.
 *
 * La difficulté d'un problème de 4e n'est presque jamais le calcul — c'est de
 * décider QUELLE opération traduit la situation. Chaque tâche demande donc
 * d'abord de choisir l'opération, ensuite seulement de calculer : la
 * modélisation est évaluée séparément de la technique, comme le veut le
 * point « Résoudre un problème mettant en jeu des rationnels ».
 *
 * TRANSFERT : aucun contexte ni aucune valeur des modules 1 à 5 n'est repris.
 */
export default function Module06LaRecetteEtLeChantier() {
  const [op1, setOp1] = useState(false);
  const [cal1, setCal1] = useState(false);
  const [op2, setOp2] = useState(false);
  const [cal2, setCal2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le pichet',
      subtitle: 'On verse deux fois — mais est-ce que ça s’ajoute, ou est-ce qu’on prend une part d’une part ?',
      done: op1 && cal1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="choisir-l-operation"
            variant="new"
            lead={<>Avant de calculer quoi que ce soit, il faut décider ce que la situation demande. Un mot du problème décide de l’opération.</>}
          />

          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Léa verse <strong>2/5 de litre</strong> de sirop dans un pichet, puis y ajoute{' '}
            <strong>1/3 de litre</strong> d’eau.
          </div>

          <TapQuestion
            prompt="Quelle opération donne le volume total dans le pichet ?"
            options={[
              'Une addition : deux quantités se réunissent',
              'Une multiplication : on prend une part d’une part',
              'Une division : on cherche combien de fois l’une tient dans l’autre',
            ]}
            correct={0}
            cols={1}
            requires={['choisir-l-operation']}
            explain="« Puis y ajoute » : les deux volumes s’additionnent dans le même pichet. Rien n’est prélevé sur rien."
            explainWrong="Une multiplication traduirait « les deux cinquièmes DU tiers », c’est-à-dire une part prise à l’intérieur d’une autre. Ici les deux liquides se réunissent : c’est une addition."
            solved={op1}
            onAnswered={() => setOp1(true)}
          />

          {op1 && (
            <FractionField
              prompt="Quel volume total, en litres ?"
              expected={somme(q(2, 5), q(1, 3))}
              allowNegative={false}
              requires={['denominateur-commun']}
              explain="Sur quinzièmes : 2/5 = 6/15 et 1/3 = 5/15. Total : 11/15 de litre — un peu moins d’un litre, ce qui est cohérent."
              explainFor={() => "5 et 3 n’ont aucun multiple commun évident : on prend leur produit, 15. Puis 6/15 + 5/15 = 11/15."}
              solved={cal1}
              onAnswered={() => setCal1(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le chantier',
      subtitle: 'Ici le mot « des » change tout.',
      done: op2 && cal2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Un terrain a déjà été bâti sur <strong>3/4</strong> de sa surface. Sur cette partie
            bâtie, <strong>2/3</strong> sont des logements.
            <br />
            Quelle fraction du terrain TOTAL les logements occupent-ils ?
          </div>

          <TapQuestion
            prompt="Quelle opération répond à la question ?"
            options={[
              'Une multiplication : les 2/3 DES 3/4 du terrain',
              'Une addition : on réunit 2/3 et 3/4',
              'Une soustraction : on retire 2/3 à 3/4',
            ]}
            correct={0}
            cols={1}
            requires={['choisir-l-operation', 'produit-fractions']}
            explain="« Les deux tiers DE la partie bâtie » : on prend une part À L’INTÉRIEUR d’une autre part. C’est exactement ce que la grille du module 4 montrait — une multiplication."
            explainWrong="Additionner 2/3 et 3/4 donnerait plus que le terrain entier, ce qui est impossible : les logements sont une PARTIE de ce qui est bâti, pas quelque chose qui s’y ajoute."
            solved={op2}
            onAnswered={() => setOp2(true)}
          />

          {op2 && (
            <FractionField
              prompt={
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  Quelle fraction du terrain total ? (calcule
                  <FractionView value={q(2, 3)} size="sm" tone="indigo" />
                  <span className="font-black">×</span>
                  <FractionView value={q(3, 4)} size="sm" tone="violet" />
                  <span>)</span>
                </span>
              }
              expected={produit(q(2, 3), q(3, 4))}
              allowNegative={false}
              requires={['produit-fractions']}
              explain="2 × 3 = 6 en haut, 3 × 4 = 12 en bas : 6/12, c’est-à-dire 1/2. La moitié du terrain est occupée par des logements — moins que les 3/4 bâtis, ce qui est bien cohérent."
              explainFor={() => "On multiplie les numérateurs entre eux et les dénominateurs entre eux : 6/12 = 1/2. Un contrôle utile : le résultat doit être PLUS PETIT que 3/4, puisqu’on n’en prend qu’une partie."}
              solved={cal2}
              onAnswered={() => setCal2(true)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La recette et le chantier"
      moduleSubtitle="Choisir l’opération avant de calculer"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Le calcul n’est pas le plus dur',
        tone: 'amber',
        body: (
          <p>
            Tu sais maintenant additionner, multiplier et diviser des fractions. Dans un problème, la
            vraie question est ailleurs : <strong>laquelle de ces opérations</strong> la situation
            demande-t-elle ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
