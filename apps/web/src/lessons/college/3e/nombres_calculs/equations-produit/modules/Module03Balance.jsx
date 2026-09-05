import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EquationBalance from '../components/EquationBalance';
import {
  lin, asLin, balanceStep, isIsolated, isEquivalentEquation, solveLinear,
  formatDec, formatEquation,
} from '../components/equationUtils';

/**
 * Module 3 — MANIPULATION : « La balance ».
 *
 * Activity: isoler x en agissant sur une balance à deux plateaux, d'abord sur
 *   2x + 3 = x + 7, puis sur 3(x + 2) = 15 qu'il faut développer.
 * Mathematical objective: établir qu'une transformation appliquée aux DEUX
 *   membres conserve les solutions, et savoir résoudre ax + b = c.
 * Student action: taper une action de balance ; certaines actions proposées
 *   ne s'appliquent volontairement qu'à gauche.
 * Controlled variable: la suite d'actions choisies.
 * Mathematical state: l'équation `{ left, right }` (balanceStep).
 * Visual consequence: les jetons des plateaux changent ; une action
 *   asymétrique fait pencher le fléau.
 * Expected observation: la balance ne reste droite que si l'on fait la même
 *   chose des deux côtés ; l'écriture change, la solution non.
 * Misconception targeted: « faire passer de l'autre côté » sans opération
 *   symétrique ; et manipuler 3(x + 2) terme à terme sans développer.
 * Feedback: l'inclinaison + un Feedback qui dit quelle solution a été perdue.
 * Formalization: étape 3, la propriété nommée après le geste.
 * Scaffolding: bouton « ↺ Recommencer » à tout moment ; après 3 actions
 *   inutiles, une action correcte est suggérée.
 * Transfer: chaque branche d'une équation produit se résout ainsi (module 4).
 */
const EQ1_START = { left: lin(2, 3), right: lin(1, 7) };   // 2x + 3 = x + 7 → x = 4
const EQ2_START = { left: { k: 3, inner: lin(1, 2) }, right: lin(0, 15) }; // 3(x + 2) = 15 → x = 3

const ACTIONS_1 = [
  { id: 'a-minus-x', label: '− x des deux côtés', op: { type: 'addx', k: -1 }, scope: 'both' },
  { id: 'a-minus-3', label: '− 3 des deux côtés', op: { type: 'add', n: -3 }, scope: 'both' },
  { id: 'a-minus-3-left', label: '− 3 à gauche seulement', op: { type: 'add', n: -3 }, scope: 'left', aria: 'Retirer 3 à gauche seulement' },
];

const ACTIONS_2 = [
  { id: 'b-expand', label: 'Développer 3(x + 2)', op: { type: 'expand' }, scope: 'both' },
  { id: 'b-minus-6', label: '− 6 des deux côtés', op: { type: 'add', n: -6 }, scope: 'both' },
  { id: 'b-div-3', label: 'Partager en 3 groupes', op: { type: 'div', n: 3 }, scope: 'both' },
];

export default function Module03Balance() {
  const [eq1, setEq1] = useState(EQ1_START);
  const [eq2, setEq2] = useState(EQ2_START);
  const [broke1, setBroke1] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  const done1 = isIsolated(eq1) && isEquivalentEquation(EQ1_START, eq1);
  const done2 = isIsolated(eq2) && isEquivalentEquation(EQ2_START, eq2);
  const sol1 = solveLinear(EQ1_START).x;
  const sol2 = solveLinear(EQ2_START).x;
  const balanced1 = isEquivalentEquation(EQ1_START, eq1);
  const balanced2 = isEquivalentEquation(EQ2_START, eq2);

  const apply = (setEq, current, act, kitReact, onBreak) => {
    const next = balanceStep(current, act.op, act.scope);
    setEq(next);
    if (act.scope !== 'both') onBreak?.();
    if (isIsolated(next) && isEquivalentEquation(current, next)) kitReact?.(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La balance"
      moduleSubtitle="Enlève la même chose des deux côtés — sinon le plateau penche."
      estimatedTime="11 min"
      brief={{
        tag: '⚖️ Mission 03',
        title: 'Les deux plateaux pèsent pareil. À toi de garder cet équilibre.',
        body: (
          <p>
            Une équation, c’est une balance en équilibre. Tu peux tout changer — à condition de le faire
            des deux côtés à la fois. Objectif : ne garder qu’un seul <MathText>{'$x$'}</MathText> à gauche.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Isole x dans 2x + 3 = x + 7',
          subtitle: 'Une action est un piège : elle n’agit que d’un côté.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <EquationBalance
                eq={eq1}
                startEq={EQ1_START}
                actions={done1 ? [] : ACTIONS_1}
                onAction={(act) => apply(setEq1, eq1, act, kit.react, () => setBroke1(true))}
                onReset={done1 ? undefined : () => setEq1(EQ1_START)}
                disabled={done1}
              />
              {!done1 && !balanced1 && (
                <Feedback tone="ko">
                  Tu n’as agi que sur un plateau : l’équation est devenue{' '}
                  <MathText>{`$${formatEquation(eq1)}$`}</MathText>, dont la solution n’est plus{' '}
                  <strong className="font-mono">{formatDec(sol1)}</strong>. C’est exactement ce que « faire
                  passer de l’autre côté » sans rien retrancher produit. Recommence.
                </Feedback>
              )}
              {!done1 && balanced1 && (
                <Feedback tone="info">
                  Équilibre conservé :{' '}
                  <MathText>{`$${formatEquation(eq1)}$`}</MathText>. Il reste{' '}
                  {Math.abs(asLin(eq1.left).a - 1) + Math.abs(asLin(eq1.left).b) > 0
                    ? 'à faire disparaître ce qui accompagne x à gauche.'
                    : 'un dernier geste.'}
                </Feedback>
              )}
              {done1 && (
                <Feedback tone="ok">
                  <MathText>{`$${formatEquation(eq1)}$`}</MathText> : x est isolé, et la solution est la
                  même qu’au départ. Vérifie :{' '}
                  <MathText>{`$2 \\times ${formatDec(sol1)} + 3 = ${formatDec(2 * sol1 + 3)}$`}</MathText>{' '}
                  et <MathText>{`$${formatDec(sol1)} + 7 = ${formatDec(sol1 + 7)}$`}</MathText>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Une boîte fermée : 3(x + 2) = 15',
          subtitle: 'Trois paquets identiques sur le plateau de gauche.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le plateau de gauche porte trois boîtes <MathText>{'$(x + 2)$'}</MathText>. Tant qu’elles
                sont fermées, on ne peut pas retirer une unité toute seule : il faut d’abord les ouvrir.
              </p>
              <EquationBalance
                eq={eq2}
                startEq={EQ2_START}
                actions={done2 ? [] : ACTIONS_2}
                onAction={(act) => apply(setEq2, eq2, act, kit.react)}
                onReset={done2 ? undefined : () => setEq2(EQ2_START)}
                disabled={done2}
              />
              {!done2 && (
                <Feedback tone="info">
                  Équation courante : <MathText>{`$${formatEquation(eq2)}$`}</MathText>.{' '}
                  {eq2.left.inner
                    ? 'Développe d’abord : 3 boîtes de (x + 2) font 3x + 6.'
                    : balanced2
                    ? 'Bien. Maintenant débarrasse le plateau des unités, puis partage.'
                    : 'L’équilibre est rompu — recommence.'}
                </Feedback>
              )}
              {done2 && (
                <Feedback tone="ok">
                  <MathText>{`$${formatEquation(eq2)}$`}</MathText>. Développer, c’est la distributivité :{' '}
                  <MathText>{'$3(x + 2) = 3 \\times x + 3 \\times 2 = 3x + 6$'}</MathText>. Vérifie :{' '}
                  <MathText>{`$3(${formatDec(sol2)} + 2) = 3 \\times ${formatDec(sol2 + 2)} = 15$`}</MathText>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Ce qu’on a le droit de faire',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Transformer sans changer les solutions</strong> : ajouter ou retrancher le même
                  nombre (ou la même expression) aux deux membres ; multiplier ou diviser les deux membres
                  par un même nombre <strong>non nul</strong>.
                </p>
                <p>
                  <strong>Développer</strong> ne change rien non plus :{' '}
                  <MathText>{'$k(a + b) = ka + kb$'}</MathText> est une réécriture, pas une opération sur
                  la balance.
                </p>
              </div>
              <TapQuestion
                prompt={
                  <>
                    On part de <MathText>{'$5x - 2 = 13$'}</MathText>. Quelle transformation garde les
                    mêmes solutions ?
                  </>
                }
                options={[
                  'Ajouter 2 à gauche pour faire disparaître le −2',
                  'Ajouter 2 aux deux membres : 5x = 15',
                  'Diviser les deux membres par 0',
                ]}
                cols={1}
                correct={1}
                explain={
                  <>
                    <MathText>{'$5x - 2 + 2 = 13 + 2$'}</MathText>, soit{' '}
                    <MathText>{'$5x = 15$'}</MathText>, puis <MathText>{'$x = 3$'}</MathText>. Diviser par
                    0 n’a aucun sens — c’est la seule division interdite.
                  </>
                }
                explainWrong={
                  <>
                    N’ajouter 2 qu’à gauche donne <MathText>{'$5x = 13$'}</MathText> : la balance penche,
                    et la solution devient 2,6 au lieu de 3. Ce qu’on fait à un plateau, on le fait à
                    l’autre.
                  </>
                }
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone={broke1 ? 'info' : 'ok'}>
          {broke1
            ? 'Tu as vu la balance pencher : c’est le meilleur souvenir à garder. Une opération d’un seul côté fabrique une autre équation.'
            : 'Deux équations résolues sans jamais casser l’équilibre. Cette technique va servir sur CHAQUE branche d’une équation produit.'}
        </Feedback>
      }
    />
  );
}
