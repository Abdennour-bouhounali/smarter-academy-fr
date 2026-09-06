import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CalcChain from '../../../../../common/components/CalcChain';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExpressionReducer from '../components/ExpressionReducer';
import {
  leaf, node, isLeaf, reducible, reduce, refusalReason, operatorNodes,
} from '../components/expressionUtils';
import { formatFrac, mul, rat, sub, formatDec, toDecimal } from '../components/rationalUtils';

/**
 * Module 6 — FORMALISATION : « Dans quel ordre ? ».
 *
 * Activity: l'expression est VIVANTE. L'élève tape l'opérateur qu'il veut
 *   effectuer ; le sous-calcul se replie sur sa valeur et l'expression
 *   restante se réaffiche, jusqu'à ce qu'il ne reste qu'un nombre.
 * Mathematical objective: les priorités ne sont pas un ordre de LECTURE mais
 *   un ordre d'EXÉCUTION — × et ÷ avant + et −, la parenthèse avant tout — et
 *   changer cet ordre change le nombre obtenu.
 * Student action: taper un opérateur dans l'expression elle-même (le symbole
 *   EST le bouton — la commande est la notion, pas un proxy).
 * Controlled variable: l'arbre d'expression courant.
 * Mathematical state: l'arbre ; la chaîne de calcul en est l'HISTORIQUE, elle
 *   n'est écrite nulle part. Les valeurs viennent de rationalUtils, donc la
 *   correction ne peut pas diverger de ce que l'élève a fait.
 * Visual consequence: le sous-arbre disparaît, remplacé par son résultat ; un
 *   opérateur interdit reste en place et dit POURQUOI.
 * Expected observation: à l'étape 2, l'élève PRODUIT lui-même 7/8 en forçant
 *   l'addition d'abord, alors que l'ordre correct donne 1. L'erreur n'est pas
 *   racontée : elle est fabriquée, puis comparée.
 * Misconception targeted: « on calcule de gauche à droite » et « la parenthèse
 *   se traite en dernier ».
 * Feedback: la raison de chaque refus est calculée par `refusalReason`, donc
 *   dérivée de la règle elle-même.
 * Formalization: étape 4, une fois les deux résultats obtenus côte à côte.
 * Scaffolding: après 3 refus, l'opérateur autorisé est signalé en vert.
 * Transfer: étape 5, une expression neuve à évaluer de tête.
 */

/* ── Les trois expressions du module, construites une seule fois. ───── */
const sansParen = () =>
  node('n-add', '+', leaf('a', rat(1, 2)), node('n-mul', '*', leaf('b', rat(2, 3)), leaf('c', rat(3, 4))));

const avecParen = () =>
  node('n-mul', '*', node('n-add', '+', leaf('a', rat(1, 2)), leaf('b', rat(2, 3)), true), leaf('c', rat(3, 4)));

/**
 * Étape 2 — la MÊME expression lue « de gauche à droite », comme le fait
 * l'élève qui ignore les priorités : (1/2 + 2/3) puis × 3/4. Ce n'est pas une
 * autre expression, c'est l'autre ARBRE que la lecture naïve construit — et
 * c'est exactement ce qu'on veut lui faire produire pour qu'il le compare.
 */
const gaucheDroite = () =>
  node('n-mul', '*', node('n-add', '+', leaf('a', rat(1, 2)), leaf('b', rat(2, 3))), leaf('c', rat(3, 4)));

export default function Module06DansQuelOrdre() {
  const [t1, setT1] = useState(sansParen);
  const [h1, setH1] = useState([]);
  const [r1, setR1] = useState([]);
  const [why1, setWhy1] = useState('');

  const [t2, setT2] = useState(gaucheDroite);
  const [h2, setH2] = useState([]);
  const [why2, setWhy2] = useState('');

  const [t3, setT3] = useState(avecParen);
  const [h3, setH3] = useState([]);
  const [r3, setR3] = useState([]);
  const [why3, setWhy3] = useState('');

  const [compareDone, setCompareDone] = useState(false);

  const done1 = isLeaf(t1);
  const done2 = isLeaf(t2);
  const done3 = isLeaf(t3);

  /** Un pas de réduction, en respectant la règle. */
  const pick = (tree, setTree, setHist, setRefused, setWhy) => (id) => (kit) => {
    if (!reducible(tree).includes(id)) {
      setRefused((r) => (r.includes(id) ? r : [...r, id]));
      setWhy(refusalReason(tree, id));
      kit?.react(false);
      return;
    }
    const { tree: next, step } = reduce(tree, id);
    setTree(next);
    setHist((h) => [...h, step]);
    setWhy('');
    kit?.react(true);
  };

  /**
   * Étape 2 : l'élève a le droit d'ignorer la PRIORITÉ — c'est le but. Mais
   * « ordre libre » ne veut pas dire « n'importe quoi » : on ne peut toujours
   * pas exécuter un opérateur dont un morceau n'est pas encore un nombre, sinon
   * l'expression n'aurait plus de sens. Le garde-fou reste, la règle saute.
   */
  const pickFree = (id, kit) => {
    const target = operatorNodes(t2).find((n) => n.id === id);
    if (!target || !isLeaf(target.left) || !isLeaf(target.right)) {
      setWhy2('Ce morceau-là n’est pas encore un nombre : commence par l’opération qu’il contient.');
      kit?.react(false);
      return;
    }
    setWhy2('');
    const { tree: next, step } = reduce(t2, id);
    setT2(next);
    setH2((h) => [...h, step]);
    kit?.react(true);
  };

  const chain = (hist) => hist.map((s) => ({ label: s.label, expr: s.expr, value: s.value }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Dans quel ordre ?"
      moduleSubtitle="Tape l’opération que tu as le droit de faire — l’expression se replie sous tes doigts."
      estimatedTime="10 min"
      brief={{
        tag: '🧮 Mission 06',
        title: 'Les mêmes nombres, deux résultats.',
        body: (
          <p>
            Tu sais maintenant additionner, soustraire, multiplier et diviser des rationnels. Reste à
            savoir <strong>dans quel ordre</strong> — et tu vas voir que ce n’est pas un détail.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Replie l’expression, opération par opération',
          subtitle: 'Tape l’opérateur que tu as le droit d’effectuer maintenant.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <ExpressionReducer
                tree={t1}
                onPick={(id) => pick(t1, setT1, setH1, setR1, setWhy1)(id)(kit)}
                refused={r1}
                reason={why1}
                done={done1}
              />
              {h1.length > 0 && <CalcChain steps={chain(h1)} />}
              {r1.length >= 3 && !done1 && (
                <Feedback tone="info">
                  Le seul opérateur exécutable est signalé en vert : c’est celui dont les deux
                  morceaux sont déjà des nombres ET qui est le plus prioritaire.
                </Feedback>
              )}
              {done1 && (
                <Feedback tone="ok">
                  Résultat : <MathText>{`$${formatFrac(t1.rat)}$`}</MathText>. Tu as commencé par le
                  produit — non par habitude, mais parce que c’était le seul geste autorisé.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et si on lisait de gauche à droite ?',
          subtitle: 'La lecture naïve, celle qui ignore les priorités.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici comment beaucoup d’élèves LISENT cette expression : de gauche à droite, comme
                une phrase. Replie-la dans cet ordre-là et regarde où tu arrives.
              </p>
              <ExpressionReducer
                tree={t2}
                onPick={(id) => pickFree(id, kit)}
                free
                done={done2}
              />
              {h2.length > 0 && <CalcChain steps={chain(h2)} />}
              {done2 && (
                <Feedback tone="ko">
                  <MathText>{`$${formatFrac(t2.rat)}$`}</MathText> — et l’étape 1 donnait{' '}
                  <MathText>{`$${done1 ? formatFrac(t1.rat) : '1'}$`}</MathText>. Mêmes nombres,
                  mêmes opérations, deux résultats. Ce n’est pas une erreur de calcul : chaque ligne
                  de ta chaîne est juste. C’est l’ORDRE qui était faux.
                </Feedback>
              )}
              {done2 && (
                <KnowledgeBrick
                  id="mem-ordre-change-le-nombre"
                  variant="new"
                  lead="Tu viens de fabriquer l’erreur toi-même : c’est la meilleure façon de ne plus la commettre."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Avec une parenthèse, tout change',
          subtitle: 'La même addition — mais elle est maintenant enfermée.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <ExpressionReducer
                tree={t3}
                onPick={(id) => pick(t3, setT3, setH3, setR3, setWhy3)(id)(kit)}
                refused={r3}
                reason={why3}
                done={done3}
              />
              {h3.length > 0 && <CalcChain steps={chain(h3)} />}
              {done3 && (
                <Feedback tone="ok">
                  <MathText>{`$${formatFrac(t3.rat)}$`}</MathText>. La parenthèse a rendu l’addition
                  prioritaire — le même geste qui était interdit à l’étape 1 devient obligatoire ici.
                </Feedback>
              )}
              {done3 && (
                <KnowledgeBrick
                  id="priorites-calcul"
                  variant="new"
                  lead="Tu as maintenant parcouru les trois cas : la priorité naturelle, l’ordre forcé, et la parenthèse. Voilà la règle complète."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le réflexe, sur une expression neuve',
          done: compareDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Que vaut <MathText>{'$\\frac{3}{4} - \\frac{1}{2} \\times \\frac{1}{3}$'}</MathText>{' '}
                  ?
                </>
              }
              options={['$\\frac{7}{12}$', '$\\frac{1}{12}$', '$\\frac{1}{4}$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['7/12', '1/12', '1/4'][i]}
              correctionLabel="7/12"
              cols={3}
              correct={0}
              explain={
                <>
                  D’abord le produit :{' '}
                  <MathText>{`$\\frac{1}{2} \\times \\frac{1}{3} = ${formatFrac(mul(rat(1, 2), rat(1, 3)))}$`}</MathText>.
                  Puis la soustraction, en douzièmes :{' '}
                  <MathText>{`$\\frac{9}{12} - \\frac{2}{12} = ${formatFrac(sub(rat(3, 4), mul(rat(1, 2), rat(1, 3))))}$`}</MathText>.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$\\frac{1}{12}$'}</MathText> vient d’avoir soustrait d’abord (
                  <MathText>{'$\\frac{3}{4} - \\frac{1}{2} = \\frac{1}{4}$'}</MathText>, puis ×{' '}
                  <MathText>{'$\\frac{1}{3}$'}</MathText>) : c’est exactement le chemin que tu as
                  fabriqué à l’étape 2, et il est faux ici. La multiplication passe d’abord :{' '}
                  <MathText>{'$\\frac{1}{2} \\times \\frac{1}{3} = \\frac{1}{6}$'}</MathText>, puis{' '}
                  <MathText>{'$\\frac{9}{12} - \\frac{2}{12} = \\frac{7}{12}$'}</MathText>.
                </>
              }
              requires={['priorites-calcul', 'mem-ordre-change-le-nombre', 'produit-rationnels', 'somme-difference']}
              solved={compareDone}
              onAnswered={() => setCompareDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Avant de calculer, repère l’opération prioritaire. C’est ce
          réflexe qui te servira dans le budget du club — où il faudra d’abord choisir QUELLE
          opération faire.
        </KnowledgeSnapshot>
      )}
    />
  );
}
