import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CalcChain from '../../../../../common/components/CalcChain';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import StepPicker from '../components/StepPicker';
import { add, formatDec, formatFrac, mul, rat, sub, toDecimal } from '../components/rationalUtils';

/**
 * Module 6 — FORMALISATION : « Dans quel ordre ? ».
 *
 * Activity: devant 1/2 + 2/3 × 3/4, taper la carte qui décrit l'opération à
 *   faire MAINTENANT ; la chaîne de calcul se construit étape par étape.
 * Mathematical objective: les priorités ne sont pas un ordre de lecture — ×
 *   et ÷ passent avant + et −, et les parenthèses avant tout.
 * Student action: taper une carte parmi les candidates.
 * Controlled variable: l'étape choisie (index dans le scénario).
 * Mathematical state: l'index de progression + les cartes refusées ; la
 *   CalcChain affichée en dérive (on ne montre que les étapes atteintes).
 * Visual consequence: une carte correcte ajoute un maillon nommé à la
 *   chaîne ; une carte prématurée reste barrée avec sa raison.
 * Expected observation: additionner d'abord donne 7/6 × 3/4 = 7/8, alors que
 *   le bon résultat est 1 — l'ordre change le nombre.
 * Misconception targeted: « on calcule de gauche à droite » et « la
 *   parenthèse se traite en dernier ».
 * Feedback: chaque refus nomme ce qui reste à faire avant.
 * Formalization: « À retenir » à l'étape 3, après les deux scénarios.
 * Scaffolding: après 3 refus, le module révèle la carte correcte.
 * Transfer: étape 2, une expression AVEC parenthèses, où l'ordre s'inverse.
 */

/* ── Scénario 1 : 1/2 + 2/3 × 3/4  (le produit d'abord) ───────────── */
const S1_PRODUCT = mul(rat(2, 3), rat(3, 4)); // 1/2
const S1_RESULT = add(rat(1, 2), S1_PRODUCT); // 1
const S1_TRAP = mul(add(rat(1, 2), rat(2, 3)), rat(3, 4)); // 7/8

const S1_OPTIONS = [
  {
    id: 'mul',
    label: 'Multiplier 2/3 par 3/4',
    latex: '\\frac{2}{3} \\times \\frac{3}{4}',
    why: '',
  },
  {
    id: 'add',
    label: 'Additionner 1/2 et 2/3 (de gauche à droite)',
    latex: '\\frac{1}{2} + \\frac{2}{3}',
    why: 'la multiplication passe AVANT l’addition, même si elle est écrite plus loin. Lire de gauche à droite n’est pas calculer.',
  },
  {
    id: 'inv',
    label: 'Retourner 3/4 pour diviser',
    latex: '\\frac{4}{3}',
    why: 'il n’y a aucune division dans cette expression — rien à retourner.',
  },
];

/* ── Scénario 2 : (1/2 + 2/3) × 3/4  (la parenthèse d'abord) ──────── */
const S2_SUM = add(rat(1, 2), rat(2, 3)); // 7/6
const S2_RESULT = mul(S2_SUM, rat(3, 4)); // 7/8

const S2_OPTIONS = [
  {
    id: 'paren',
    label: 'Calculer ce qui est entre parenthèses',
    latex: '\\frac{1}{2} + \\frac{2}{3}',
    why: '',
  },
  {
    id: 'mul2',
    label: 'Multiplier 2/3 par 3/4 d’abord',
    latex: '\\frac{2}{3} \\times \\frac{3}{4}',
    why: 'le 2/3 est enfermé dans la parenthèse : on ne peut pas l’en sortir pour le multiplier tout seul.',
  },
  {
    id: 'last',
    label: 'Garder la parenthèse pour la fin',
    latex: '',
    why: 'c’est l’inverse : la parenthèse est prioritaire sur tout le reste.',
  },
];

export default function Module06DansQuelOrdre() {
  const [s1Rejected, setS1Rejected] = useState([]);
  const [s1Done, setS1Done] = useState(false);
  const [s2Rejected, setS2Rejected] = useState([]);
  const [s2Done, setS2Done] = useState(false);
  const [compareDone, setCompareDone] = useState(false);

  const pick1 = (id, ok, kitReact) => {
    kitReact(ok);
    if (ok) setS1Done(true);
    else setS1Rejected((r) => (r.includes(id) ? r : [...r, id]));
  };
  const pick2 = (id, ok, kitReact) => {
    kitReact(ok);
    if (ok) setS2Done(true);
    else setS2Rejected((r) => (r.includes(id) ? r : [...r, id]));
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Dans quel ordre ?"
      moduleSubtitle="Choisis la prochaine opération autorisée — la chaîne de calcul se construit."
      estimatedTime="9 min"
      brief={{
        tag: '🧮 Mission 06',
        title: 'Une expression ne se lit pas dans l’ordre où elle se calcule.',
        body: (
          <p>
            Tu vas choisir, à chaque fois, l’opération qu’on a le <strong>droit</strong> de faire
            maintenant. Les cartes refusées te diront pourquoi il faut attendre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Sans parenthèses : qui passe en premier ?',
          done: s1Done,
          content: (kit) => (
            <div className="space-y-3">
              <StepPicker
                expression={'\\frac{1}{2} + \\frac{2}{3} \\times \\frac{3}{4}'}
                options={S1_OPTIONS}
                correctId="mul"
                rejected={s1Rejected}
                onPick={(id, ok) => pick1(id, ok, kit.react)}
                done={s1Done}
              />
              {s1Done && (
                <>
                  <CalcChain
                    steps={[
                      { label: 'Le produit, prioritaire', expr: '2/3 × 3/4', value: `= ${'1/2'}` },
                      { label: 'Puis la somme', expr: '1/2 + 1/2', value: `= ${formatDec(toDecimal(S1_RESULT))}` },
                    ]}
                  />
                  <Feedback tone="ok">
                    <MathText>{`$\\frac{1}{2} + \\frac{2}{3} \\times \\frac{3}{4} = \\frac{1}{2} + ${formatFrac(S1_PRODUCT)} = ${formatFrac(S1_RESULT)}$`}</MathText>.
                    Si on avait additionné d’abord, on aurait trouvé{' '}
                    <MathText>{`$${formatFrac(S1_TRAP)}$`}</MathText> — un autre nombre. L’ordre n’est
                    pas un détail.
                  </Feedback>
                </>
              )}
              {!s1Done && s1Rejected.length >= 3 && (
                <Feedback tone="info">
                  Indice : cherche la multiplication. Dans une expression sans parenthèses,{' '}
                  <strong>× et ÷ se calculent avant + et −</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Avec des parenthèses : tout change',
          done: s2Done,
          content: (kit) => (
            <div className="space-y-3">
              <StepPicker
                expression={'\\left(\\frac{1}{2} + \\frac{2}{3}\\right) \\times \\frac{3}{4}'}
                options={S2_OPTIONS}
                correctId="paren"
                rejected={s2Rejected}
                onPick={(id, ok) => pick2(id, ok, kit.react)}
                done={s2Done}
                title="Même expression, mais avec une parenthèse. Par quoi commence-t-on ?"
              />
              {s2Done && (
                <>
                  <CalcChain
                    steps={[
                      { label: 'La parenthèse d’abord', expr: '1/2 + 2/3', value: '= 7/6' },
                      { label: 'Puis la multiplication', expr: '7/6 × 3/4', value: '= 7/8' },
                    ]}
                  />
                  <Feedback tone="ok">
                    <MathText>{`$\\left(\\frac{1}{2} + \\frac{2}{3}\\right) \\times \\frac{3}{4} = ${formatFrac(S2_SUM)} \\times \\frac{3}{4} = ${formatFrac(S2_RESULT)}$`}</MathText>.
                    Les parenthèses servent exactement à ça : forcer une opération à passer en premier.
                  </Feedback>
                </>
              )}
              {!s2Done && s2Rejected.length >= 3 && (
                <Feedback tone="info">
                  Indice : ce qui est entre parenthèses forme un <strong>bloc</strong>. On le calcule en
                  entier avant de s’en servir.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux résultats différents — c’est normal',
          done: compareDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="priorites-calcul"
                variant="new"
                lead="Deux expressions faites des mêmes nombres, deux résultats différents : c’est la parenthèse qui a tout décidé. Voilà la règle complète."
              />
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
                    <MathText>{'$\\frac{1}{3}$'}</MathText>) : c’est le calcul de gauche à droite, et
                    il est faux ici. La multiplication passe d’abord :{' '}
                    <MathText>{'$\\frac{1}{2} \\times \\frac{1}{3} = \\frac{1}{6}$'}</MathText>, puis{' '}
                    <MathText>{'$\\frac{9}{12} - \\frac{2}{12} = \\frac{7}{12}$'}</MathText>.
                  </>
                }
                requires={['priorites-calcul', 'produit-rationnels', 'somme-difference']}
                solved={compareDone}
                onAnswered={() => setCompareDone(true)}
              />
            </div>
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
