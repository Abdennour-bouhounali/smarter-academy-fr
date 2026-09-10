import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import WeightDropTree, { treeIsCorrect } from '../components/WeightDropTree';
import TreeExplorer from '../components/TreeExplorer';
import { BRANCH_WEIGHTS, depistageTree, depistageTable } from '../data';

/**
 * Module 3 — MANIPULATION : construire l'arbre pondéré du dépistage (P3).
 *
 * LE GLISSER (règle utilisateur du 2026-09-10). Les quatre poids se SAISISSENT
 * et se DÉPOSENT sur leur branche (components/WeightDropTree.jsx) : l'élève
 * porte le nombre jusqu'à sa place. Le chemin clavier est complet — un poids se
 * « prend en main » à l'activation, un emplacement le repose.
 *
 * POURQUOI CE MODULE EXISTE ALORS QUE LA 2de CONSTRUIT DÉJÀ DES ARBRES. La 2de
 * pose la structure (`arbre-structure`) et dit que les poids du second niveau
 * sont des conditionnelles (`poids-conditionnels`). Ce que ce module ajoute est
 * le cas où cette distinction DEVIENT PIÉGEUSE : dans le dépistage, 0,99
 * apparaît DEUX FOIS — une fois comme P(bien portant) sur toute la population,
 * une fois comme P_malade(+) sur les seuls malades. Reconnaître un poids à sa
 * valeur ne marche plus ; il faut lire sa place. Un élève qui pose 0,99 au
 * mauvais endroit voit aussitôt la somme des branches quitter 1 : la figure
 * conteste le geste sans qu'aucun texte n'intervienne.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  poser les quatre poids → brique `chaque-poids-sa-branche`
 *   étape 2  la question du 0,99 en double, désormais légitime
 *   étape 3  les trois contrôles → brique `arbre-controle`
 *
 * MANIPULATION JAMAIS GELÉE : aucun `disabled` lié à `done`. Une fois l'arbre
 * juste, l'élève peut décrocher un poids pour voir la somme se casser — c'est
 * la meilleure façon de comprendre ce que la règle interdit.
 */
const T = depistageTable();
const TREE = depistageTree();

const FIRST_LABELS = { malade: 'M (malade)', sain: 'M̄ (bien portant)' };
const LEAF_LABELS = { positif: '+', negatif: '−' };

export default function Module03AccrocherLesPoids() {
  const [placed, setPlaced] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = treeIsCorrect(BRANCH_WEIGHTS, placed);
  const place = (slot, weightId) =>
    setPlaced((p) => {
      const next = { ...p };
      if (weightId === null) delete next[slot];
      else next[slot] = weightId;
      return next;
    });

  const steps = [
    {
      num: 1,
      title: 'Accroche les quatre poids',
      subtitle:
        'Prends chaque nombre et pose-le sur la branche qu’il pèse. Attention : deux d’entre eux valent la même chose et ne vont pas au même endroit.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-800 mb-1">Ce que dit l’énoncé, mot pour mot :</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>« la maladie touche <strong>1 %</strong> de la population » ;</li>
              <li>« le test détecte <strong>99 %</strong> des malades » ;</li>
              <li>« le test se trompe sur <strong>2 %</strong> des personnes en bonne santé ».</li>
            </ul>
          </div>
          <WeightDropTree
            weights={BRANCH_WEIGHTS}
            placed={placed}
            onPlace={(slot, w) => {
              place(slot, w);
              if (!done1) {
                const test = { ...placed };
                if (w === null) delete test[slot]; else test[slot] = w;
                if (treeIsCorrect(BRANCH_WEIGHTS, test)) kit.react?.(true);
              }
            }}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                L’arbre tient : chaque nœud a des branches qui somment à 1, et les deux{' '}
                <strong>0,99</strong> sont à leur place. Décroche-en un et repose-le ailleurs pour
                voir la somme se casser — c’est ce contrôle qui repère un arbre faux.
              </Feedback>
              <KnowledgeBrick
                id="chaque-poids-sa-branche"
                variant="new"
                lead={<>Tu viens de poser deux fois le même nombre à deux endroits où il ne veut pas dire la même chose.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Poids posés : {Object.values(placed).filter(Boolean).length} sur {BRANCH_WEIGHTS.length}.
              Le premier niveau parle de toute la population ; le second, de ceux qui sont déjà
              arrivés au nœud.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le même nombre, deux rôles',
      done: q2,
      content: (
        <TapQuestion
          prompt="0,99 pèse deux branches de cet arbre. Qu’est-ce qui distingue ces deux 0,99 ?"
          options={[
            'Le premier porte sur les 100 000 personnes testées, le second seulement sur les 1 000 malades',
            'Rien : ce sont deux écritures du même nombre, donc de la même chose',
            'Le premier est une probabilité, le second un effectif',
            'Le second devrait valoir 0,98, comme la branche du dessous',
          ]}
          correct={0}
          cols={1}
          requires={['chaque-poids-sa-branche', 'poids-conditionnels']}
          explain={`Au premier niveau, 0,99 vaut P(bien portant) : ${T.rowTotals.sain} personnes sur ${T.total}. Au second, sur la branche partant de « malade », il vaut la part des malades détectés : ${T.cells.malade.positif} sur ${T.rowTotals.malade}. Deux populations, deux comptages — et ces deux branches ne mènent d’ailleurs pas au même endroit.`}
          explainWrong="Compare les deux dénominateurs : 100 000 personnes pour l’un, 1 000 malades pour l’autre. Deux quotients peuvent parfaitement valoir tous les deux 0,99 sans parler du même groupe."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Avant de calculer, contrôler',
      done: q3,
      content: (
        <div className="space-y-3">
          <TreeExplorer
            tree={TREE}
            firstLabels={FIRST_LABELS}
            labels={LEAF_LABELS}
            levelLabels={['état de santé', 'résultat du test']}
          />
          <TapQuestion
            prompt="On te donne un arbre déjà rempli. Quel contrôle faire EN PREMIER, avant tout calcul ?"
            options={[
              'Additionner les branches de chaque nœud : chaque somme doit valoir 1 exactement',
              'Multiplier tous les poids entre eux pour voir si le résultat est petit',
              'Vérifier que tous les poids sont différents les uns des autres',
              'Comparer le premier niveau au second',
            ]}
            correct={0}
            cols={1}
            requires={['chaque-poids-sa-branche', 'somme-branches', 'arbre-structure']}
            explain="Les branches issues d’un même nœud couvrent toutes les suites possibles : leur somme vaut 1. Une somme différente signale un poids mal placé ou une branche oubliée — et un arbre faux ne mérite aucun calcul. Ici : 0,01 + 0,99 = 1, puis 0,99 + 0,01 = 1 et 0,02 + 0,98 = 1."
            explainWrong="Deux poids IDENTIQUES sont parfaitement légitimes — tu viens d’en poser deux. Et un produit petit ne prouve rien. Le seul contrôle qui attrape une erreur de placement est la somme des branches de chaque nœud."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="arbre-controle"
              variant="new"
              lead={<>Trois vérifications, dans cet ordre, avant de se servir d’un arbre qu’on n’a pas construit soi-même.</>}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Accrocher les poids aux bonnes branches"
      moduleSubtitle="Deux fois 0,99 dans le même arbre, et ce n’est pas le même 0,99"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un poids, une branche',
        tone: 'indigo',
        body: (
          <p>
            Tu sais lire un arbre depuis la Seconde. Voici celui du dépistage à construire : attrape
            chaque poids et pose-le sur sa branche. Un piège s’y cache — le même nombre y figure
            deux fois, pour deux populations différentes.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Ce que tu viens d’établir.</strong> C’est la PLACE d’un poids, jamais sa valeur,
          qui dit sur quel ensemble il se calcule — et la somme des branches d’un nœud est le
          contrôle qui repère l’erreur. Module suivant : se servir de l’arbre pour calculer, sur une
          situation à trois branches.
        </KnowledgeSnapshot>
      }
    />
  );
}
