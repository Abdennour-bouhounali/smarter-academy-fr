import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareTiling from '../components/SquareTiling';
import {
  simplifyRoot, largestSquareFactor, formatRoot, formatSqrt, formatDec, approxRoot,
} from '../components/rootUtils';

/**
 * Module 5 — FORMALISATION : « Simplifier une racine ».
 *
 * Activity: paver un carré d'aire 12 avec k × k petits carrés identiques et
 *   trouver le découpage qui donne des cases d'aire ENTIÈRE.
 * Mathematical objective: √(k²m) = k√m ; simplifier, c'est extraire le PLUS
 *   GRAND carré parfait du radicande.
 * Student action: taper une puce de découpage (1×1, 2×2, 3×3, 4×4).
 * Controlled variable: k.
 * Mathematical state: (n, k) ; l'aire d'une case n/k² et sa validité sont
 *   dérivées.
 * Visual consequence: le carré se découpe ; un découpage impossible barre
 *   les cases en rouge et annonce la division qui ne tombe pas juste.
 * Expected observation: pour 12, seul 2×2 marche (cases d'aire 3), donc le
 *   côté vaut 2√3 ; 3×3 échoue car 12 ÷ 9 n'est pas entier.
 * Misconception targeted: « 2√3 = √6 » (le coefficient rentrerait sous la
 *   racine tel quel) et « on extrait n'importe quel diviseur ».
 * Feedback: l'aire exacte d'une case est affichée à chaque essai.
 * Formalization: « À retenir » — chercher le plus grand carré parfait
 *   diviseur, puis sortir sa racine.
 * Scaffolding: quatre découpages, dont deux invalides, tous retapables.
 * Transfer: le boss reprend le pavage de 12 figé en synthèse.
 */
const N = 12;

export default function Module05SimplifierUneRacine() {
  const [k, setK] = useState(1);
  const [tried, setTried] = useState(() => new Set([1]));
  const [checkDone, setCheckDone] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  const simplified = simplifyRoot(N); // { coef: 2, radicand: 3 }
  // Objectif MATHÉMATIQUE : avoir trouvé le découpage optimal (2×2 pour 12),
  // pas simplement avoir cliqué.
  const tilingDone = k === simplified.coef && tried.has(simplified.coef);

  const handleK = (next, kitReact) => {
    setK(next);
    setTried((s) => new Set(s).add(next));
    kitReact?.(Number.isInteger(N / (next * next)) && next === simplified.coef);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Simplifier une racine"
      moduleSubtitle="Découper un carré pour lire son côté autrement."
      estimatedTime="10 min"
      brief={{
        tag: '✂️ Mission 05',
        title: 'Un carré d’aire 12. On ne peut pas le découper n’importe comment.',
        body: (
          <p>
            Découpe ce carré en petits carrés <strong>tous identiques</strong>. Un seul découpage donne des
            cases dont l’aire est un nombre entier — trouve-le, et le côté du grand carré s’écrira
            autrement.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve le bon découpage',
          subtitle: 'Essaie 2×2, 3×3, 4×4 : regarde l’aire d’une case.',
          done: tilingDone,
          content: (kit) => (
            <div className="space-y-3">
              <SquareTiling n={N} k={k} onK={(next) => handleK(next, kit.react)} />

              {!tilingDone && (
                <Feedback tone="info">
                  {Number.isInteger(N / (k * k)) ? (
                    <>
                      Découpage {k}×{k} : chaque case a une aire de{' '}
                      <strong className="font-mono">{formatDec(N / (k * k))}</strong>.{' '}
                      {k === 1
                        ? 'Une seule case, ça ne simplifie rien — découpe plus fin.'
                        : 'Ça marche ! Mais est-ce le plus grand découpage possible ?'}
                    </>
                  ) : (
                    <>
                      Découpage {k}×{k} : il faudrait diviser 12 par {k * k} = {k * k}, et{' '}
                      <strong className="font-mono">{formatDec(N / (k * k))}</strong> n’est pas un nombre
                      entier. Les cases ne tomberaient pas juste.
                    </>
                  )}
                  {tried.size >= 3 && !tilingDone && ' Indice : cherche le plus grand carré parfait qui divise 12.'}
                </Feedback>
              )}

              {tilingDone && (
                <Feedback tone="ok">
                  <p>
                    <strong>2×2</strong> : quatre cases d’aire 3. Le grand côté vaut donc{' '}
                    <strong>2 fois</strong> le côté d’une case, c’est-à-dire{' '}
                    <MathText>{'$2\\sqrt{3}$'}</MathText>.
                  </p>
                  <p className="mt-1">
                    <MathText>{`$${formatSqrt(N)} = \\sqrt{4 \\times 3} = \\sqrt{4} \\times \\sqrt{3} = ${formatRoot(simplified)}$`}</MathText>
                    {' '}(≈ {formatDec(approxRoot(N, 2))} — la même longueur, écrite plus proprement).
                  </p>
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À retenir',
          subtitle: 'La méthode, en trois gestes.',
          done: checkDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-3">
                <p className="text-xs uppercase tracking-wide font-mono font-bold text-purple-700 text-center">
                  À retenir — simplifier √n
                </p>
                <ol className="text-sm text-purple-950 space-y-1.5 list-decimal list-inside">
                  <li>Chercher le <strong>plus grand carré parfait</strong> qui divise n (4, 9, 16, 25, 36…).</li>
                  <li>Écrire n comme ce carré <strong>fois</strong> le reste : 12 = 4 × 3.</li>
                  <li>Sortir sa racine : <MathText>{'$\\sqrt{4 \\times 3} = 2\\sqrt{3}$'}</MathText>.</li>
                </ol>
                <p className="text-center pt-1">
                  <MathText className="text-lg text-slate-800">
                    {'$\\sqrt{k^{2} \\times m} = k\\sqrt{m}$'}
                  </MathText>
                </p>
              </div>

              <TapQuestion
                prompt={
                  <>
                    Quel carré parfait faut-il extraire de <MathText>{'$\\sqrt{72}$'}</MathText> ?
                  </>
                }
                options={['$4$', '$9$', '$36$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['4', '9', '36'][i]}
                correctionLabel="36"
                cols={3}
                correct={2}
                explain={
                  <>
                    72 = 36 × 2, et 36 est le <strong>plus grand</strong> carré parfait qui divise 72. Donc{' '}
                    <MathText>{`$\\sqrt{72} = ${formatRoot(72)}$`}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    4 et 9 divisent bien 72, mais ils ne sont pas les plus grands :{' '}
                    <MathText>{'$\\sqrt{72} = 2\\sqrt{18}$'}</MathText> ou{' '}
                    <MathText>{'$3\\sqrt{8}$'}</MathText> se simplifient encore. Avec{' '}
                    {formatDec(largestSquareFactor(72))}, on va au bout d’un coup :{' '}
                    <MathText>{`$\\sqrt{72} = ${formatRoot(72)}$`}</MathText>.
                  </>
                }
                solved={checkDone}
                onAnswered={() => setCheckDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Quatre racines à simplifier',
          done: applyDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chacune : la forme simplifiée. Souviens-toi du plus grand carré parfait.
                </p>
              }
              rows={[
                {
                  id: 'r8',
                  label: <MathText>{'$\\sqrt{8}$'}</MathText>,
                  options: [<MathText key="a">{'$2\\sqrt{2}$'}</MathText>, <MathText key="b">{'$4\\sqrt{2}$'}</MathText>, <MathText key="c">{'$\\sqrt{4}$'}</MathText>],
                  correct: 0,
                  correction: '8 = 4 × 2 → 2√2',
                },
                {
                  id: 'r18',
                  label: <MathText>{'$\\sqrt{18}$'}</MathText>,
                  options: [<MathText key="a">{'$2\\sqrt{9}$'}</MathText>, <MathText key="b">{'$3\\sqrt{2}$'}</MathText>, <MathText key="c">{'$9\\sqrt{2}$'}</MathText>],
                  correct: 1,
                  correction: '18 = 9 × 2 → 3√2',
                },
                {
                  id: 'r50',
                  label: <MathText>{'$\\sqrt{50}$'}</MathText>,
                  options: [<MathText key="a">{'$5\\sqrt{2}$'}</MathText>, <MathText key="b">{'$2\\sqrt{5}$'}</MathText>, <MathText key="c">{'$25\\sqrt{2}$'}</MathText>],
                  correct: 0,
                  correction: '50 = 25 × 2 → 5√2',
                },
                {
                  id: 'r45',
                  label: <MathText>{'$\\sqrt{45}$'}</MathText>,
                  options: [<MathText key="a">{'$5\\sqrt{3}$'}</MathText>, <MathText key="b">{'$3\\sqrt{5}$'}</MathText>, <MathText key="c">{'$9\\sqrt{5}$'}</MathText>],
                  correct: 1,
                  correction: '45 = 9 × 5 → 3√5',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? (
                    <>
                      {total} / {total}. À chaque fois, le même geste :{' '}
                      <MathText>{'$8 = 4\\times 2$'}</MathText>,{' '}
                      <MathText>{'$18 = 9\\times 2$'}</MathText>,{' '}
                      <MathText>{'$50 = 25\\times 2$'}</MathText>,{' '}
                      <MathText>{'$45 = 9\\times 5$'}</MathText> — on sort la racine du carré parfait.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Deux pièges reviennent : sortir le carré parfait{' '}
                      <em>sans</em> lui prendre sa racine (√18 = 9√2 est faux, c’est 3√2), et laisser un
                      carré parfait sous la racine (2√9 n’est pas simplifié : √9 = 3, donc c’est 6).
                    </>
                  )}
                </Feedback>
              )}
              solved={applyDone}
              onAnswered={() => setApplyDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Le piège du coefficient',
          subtitle: 'Que devient le 2 de 2√3 si on le rentre sous la racine ?',
          done: trapDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  <MathText>{'$2\\sqrt{3}$'}</MathText> est aussi égal à…
                </>
              }
              options={['$\\sqrt{6}$', '$\\sqrt{12}$', '$\\sqrt{5}$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['√6', '√12', '√5'][i]}
              correctionLabel="√12"
              cols={3}
              correct={1}
              explain={
                <>
                  Pour rentrer un coefficient sous la racine, il faut l’<strong>élever au carré</strong> :{' '}
                  <MathText>{'$2\\sqrt{3} = \\sqrt{2^{2}} \\times \\sqrt{3} = \\sqrt{4 \\times 3} = \\sqrt{12}$'}</MathText>.
                  C’est exactement le carré d’aire 12 que tu viens de découper.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$\\sqrt{6}$'}</MathText> reviendrait à écrire 2 × 3 sous la racine — mais le 2
                  est DEHORS, il compte double une fois rentré :{' '}
                  <MathText>{'$2 = \\sqrt{4}$'}</MathText>, donc{' '}
                  <MathText>{'$2\\sqrt{3} = \\sqrt{4}\\sqrt{3} = \\sqrt{12}$'}</MathText>. Vérifie :{' '}
                  <MathText>{'$(2\\sqrt{3})^{2} = 4 \\times 3 = 12$'}</MathText>, pas 6.
                </>
              }
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Simplifier une racine, c’est <strong>découper le carré le plus finement possible en carrés
          identiques</strong> : <MathText>{`$${formatSqrt(N)} = ${formatRoot(simplified)}$`}</MathText>.
          Le coefficient qui sort est la racine du carré parfait extrait — et pour le faire rentrer, on
          l’élève au carré.
        </Feedback>
      }
    />
  );
}
