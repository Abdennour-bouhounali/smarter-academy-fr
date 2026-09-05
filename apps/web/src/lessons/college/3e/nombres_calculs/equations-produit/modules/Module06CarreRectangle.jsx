import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareVsRectangle from '../components/SquareVsRectangle';
import { formatDec, parseDec } from '../components/equationUtils';

/**
 * Module 6 — LABORATOIRE : « Carré contre rectangle ».
 *
 * Activity: régler x jusqu'à ce que le carré de côté x et le rectangle 4 sur
 *   x aient la même aire, puis prouver le résultat par une équation.
 * Mathematical objective: modéliser un problème par x² = 4x, le ramener à un
 *   produit nul par facteur commun, et interpréter les deux solutions.
 * Student action: taper une puce / pousser −/+ jusqu'à l'égalité des aires.
 * Controlled variable: x (0 à 8, pas 0,5).
 * Mathematical state: x ; les aires sont dérivées.
 * Visual consequence: les figures se redimensionnent ; l'écart d'aire est
 *   affiché signé ; les deux figures virent à l'ambre à l'égalité.
 * Expected observation: égalité en x = 4 — et aussi en x = 0, où il n'y a
 *   plus de figure du tout.
 * Misconception targeted: « x² = 4x se simplifie en x = 4 » (on divise par
 *   x sans se demander s'il est nul, ce qui perd la solution 0), et
 *   « x² et 4x, c'est la même chose ».
 * Feedback: l'écart d'aire quantifié à chaque réglage.
 * Formalization: x² − 4x = 0 → x(x − 4) = 0, puis a² − b² comme second
 *   chemin vers un produit.
 * Scaffolding: puces incluant 4 ; après 3 réglages, une indication de sens.
 * Transfer: étape 4, un problème rédigé de bout en bout.
 */
const TARGET = 4;

export default function Module06CarreRectangle() {
  const [x, setX] = useState(6);
  const [tries, setTries] = useState(0);
  const [factorDone, setFactorDone] = useState(false);
  const [identityDone, setIdentityDone] = useState(false);
  const [problemDone, setProblemDone] = useState(false);

  const areaSquare = x * x;
  const areaRect = 4 * x;
  const gap = areaSquare - areaRect;
  const found = x === TARGET;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Carré contre rectangle"
      moduleSubtitle="Un carré et un rectangle de même aire : trouve x, puis prouve-le."
      estimatedTime="10 min"
      brief={{
        tag: '🧪 Mission 06',
        title: 'Deux figures, une seule question : quand ont-elles la même aire ?',
        body: (
          <p>
            Un carré de côté <MathText>{'$x$'}</MathText> cm, un rectangle de 4 cm sur{' '}
            <MathText>{'$x$'}</MathText> cm. Règle <MathText>{'$x$'}</MathText> jusqu’à l’égalité, puis
            démontre-la — le tâtonnement ne prouve rien.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Égalise les deux aires',
          subtitle: 'Regarde l’écart, il te dit de quel côté aller.',
          done: found,
          content: (kit) => (
            <div className="space-y-3">
              <SquareVsRectangle
                x={x}
                onChange={(v) => {
                  setX(v);
                  if (v !== TARGET) setTries((t) => t + 1);
                  else kit.react(true);
                }}
              />
              {!found && (
                <Feedback tone="info">
                  Pour <strong className="font-mono">x = {formatDec(x)}</strong> : carré{' '}
                  <strong className="font-mono">{formatDec(areaSquare)} cm²</strong>, rectangle{' '}
                  <strong className="font-mono">{formatDec(areaRect)} cm²</strong>. Écart{' '}
                  <strong className="font-mono">{gap > 0 ? '+' : ''}{formatDec(gap)} cm²</strong> —
                  {gap > 0 ? ' le carré est trop grand, diminue x.' : gap < 0 ? ' le carré est trop petit, augmente x.' : ' égalité !'}
                  {tries >= 3 && gap !== 0 && ' Indice : cherche entre 3 et 5.'}
                </Feedback>
              )}
              {found && (
                <Feedback tone="ok">
                  Égalité pour <MathText>{'$x = 4$'}</MathText> :{' '}
                  <MathText>{'$4 \\times 4 = 16$'}</MathText> et{' '}
                  <MathText>{'$4 \\times 4 = 16$'}</MathText>. Mais essaie aussi{' '}
                  <MathText>{'$x = 0$'}</MathText> : les deux aires valent 0 — sans figure. Retiens ces
                  deux valeurs.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La preuve : un facteur commun',
          done: factorDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-center space-y-2">
                <MathText className="text-lg text-slate-800">{'$x^{2} = 4x$'}</MathText>
                <p className="text-xs text-slate-500">On ramène tout d’un côté pour viser un produit nul :</p>
                <MathText className="text-lg text-slate-800">{'$x^{2} - 4x = 0$'}</MathText>
                <p className="text-xs text-slate-500">
                  Les deux termes contiennent <MathText>{'$x$'}</MathText> : on le met en facteur.
                </p>
                <MathText className="text-lg text-slate-800">{'$x(x - 4) = 0$'}</MathText>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Un camarade écrit : « <MathText>{'$x^{2} = 4x$'}</MathText>, je divise par{' '}
                    <MathText>{'$x$'}</MathText>, donc <MathText>{'$x = 4$'}</MathText>. » Qu’en penses-tu ?
                  </>
                }
                options={[
                  'C’est juste et plus rapide',
                  'C’est incomplet : diviser par x suppose x ≠ 0, et perd la solution x = 0',
                  'C’est faux : on ne peut jamais diviser une équation',
                ]}
                cols={1}
                correct={1}
                explain={
                  <>
                    On n’a le droit de diviser que par un nombre <strong>non nul</strong>. En divisant par{' '}
                    <MathText>{'$x$'}</MathText>, on écarte sans le dire le cas{' '}
                    <MathText>{'$x = 0$'}</MathText> — qui est pourtant une solution. La factorisation, elle,
                    ne perd rien.
                  </>
                }
                explainWrong={
                  <>
                    Diviser les deux membres par un même nombre est permis… s’il n’est pas nul. Ici{' '}
                    <MathText>{'$x$'}</MathText> peut valoir 0, et c’est justement l’autre solution :{' '}
                    <MathText>{'$0^{2} = 4 \\times 0$'}</MathText>. La méthode sûre est de factoriser :{' '}
                    <MathText>{'$x(x - 4) = 0$'}</MathText>.
                  </>
                }
                solved={factorDone}
                onAnswered={() => setFactorDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’autre chemin vers un produit : a² − b²',
          done: identityDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-center space-y-1.5">
                <p className="text-sm text-slate-700">
                  Quand il n’y a pas de facteur commun, une différence de deux carrés en fournit un :
                </p>
                <MathText className="text-lg text-slate-800">{'$a^{2} - b^{2} = (a - b)(a + b)$'}</MathText>
                <p className="text-xs text-slate-500">
                  Exemple : <MathText>{'$x^{2} - 16 = x^{2} - 4^{2} = (x - 4)(x + 4)$'}</MathText>
                </p>
              </div>
              <TapQuestion
                prompt="Laquelle de ces expressions peut se transformer en produit par cette identité ?"
                options={['$x^{2} + 16$', '$x^{2} - 25$', '$x^{2} + 5x$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['x² + 16', 'x² − 25', 'x² + 5x'][i]}
                correctionLabel="x² − 25"
                cols={3}
                correct={1}
                explain={
                  <>
                    <MathText>{'$x^{2} - 25 = x^{2} - 5^{2} = (x - 5)(x + 5)$'}</MathText>. Une SOMME de
                    carrés ne se factorise pas ainsi. Quant à <MathText>{'$x^{2} + 5x$'}</MathText>, elle a
                    un facteur commun : <MathText>{'$x(x + 5)$'}</MathText> — l’autre chemin.
                  </>
                }
                explainWrong={
                  <>
                    L’identité demande une <strong>différence</strong> : <MathText>{'$x^{2} + 16$'}</MathText>{' '}
                    est une somme, elle ne se factorise pas. <MathText>{'$x^{2} + 5x$'}</MathText> n’est pas
                    une différence de carrés, mais elle a un facteur commun{' '}
                    <MathText>{'$x$'}</MathText>. Seule <MathText>{'$x^{2} - 25$'}</MathText> relève de
                    <MathText>{'$\\;a^{2} - b^{2}$'}</MathText>.
                  </>
                }
                solved={identityDone}
                onAnswered={() => setIdentityDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Un problème, de bout en bout',
          done: problemDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-sm text-slate-700">
                <p>
                  Un jardin carré de côté <MathText>{'$x$'}</MathText> m est agrandi d’une bande de 3 m sur
                  un côté : sa surface passe à <MathText>{'$x(x + 3)$'}</MathText> m². On voudrait que
                  cette surface soit égale à <MathText>{'$4(x + 3)$'}</MathText> m² (la surface d’une
                  parcelle voisine de 4 m de large et de même profondeur).
                </p>
                <p className="mt-2">
                  L’équation <MathText>{'$x(x + 3) = 4(x + 3)$'}</MathText> devient, après tout ramener à
                  gauche et mettre <MathText>{'$(x + 3)$'}</MathText> en facteur :{' '}
                  <MathText>{'$(x + 3)(x - 4) = 0$'}</MathText>.
                </p>
              </div>
              <NumericQuestion
                prompt="Quelle est la seule valeur de x acceptable pour le côté du jardin, en mètres ?"
                expected={4}
                parse={parseDec}
                display="4"
                suffix="m"
                explain="Les solutions de l’équation sont −3 et 4. Un côté de jardin ne peut pas mesurer −3 m : on garde 4 m."
                explainFor={(n) =>
                  n === -3
                    ? '−3 est bien une solution de l’équation, mais une longueur négative n’existe pas : on la rejette. Réponse : 4 m.'
                    : 'L’équation (x + 3)(x − 4) = 0 donne x = −3 ou x = 4 ; seule la valeur positive convient à une longueur : 4 m.'
                }
                solved={problemDone}
                onAnswered={() => setProblemDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Modéliser, factoriser, annuler chaque facteur, puis trier ce qui a un sens : tu viens de faire le
          parcours complet. Il ne reste plus qu’à le prouver dans la mission finale.
        </Feedback>
      }
    />
  );
}
