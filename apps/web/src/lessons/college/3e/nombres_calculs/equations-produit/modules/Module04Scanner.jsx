import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProductScanner from '../components/ProductScanner';
import {
  lin, evalLin, evalProduct, productZeros, solveLinear,
  formatDec, formatFactor, formatLin, formatProduct, formatSolutionSet, parseDec,
} from '../components/equationUtils';

/**
 * Module 4 — MANIPULATION SIGNATURE : « Le scanner de produit ».
 *
 * Activity: balayer x de −5 à 5 (pas 0,5) sous (x − 3)(2x + 4) et tamponner
 *   les positions où le produit tombe à 0.
 * Mathematical objective: constater que le produit s'annule EXACTEMENT là où
 *   l'un des facteurs s'annule, puis nommer A × B = 0 ⟺ A = 0 ou B = 0.
 * Student action: taper la bande / pousser −/+ / flèches, puis « Marquer ce zéro ».
 * Controlled variable: x.
 * Mathematical state: x seul ; les deux facteurs, le produit et la couleur
 *   de la bande sont dérivés par evalLin / evalProduct.
 * Visual consequence: la carte produit vire au vert sur un zéro ; le zéro
 *   marqué reste tamponné sur la bande.
 * Expected observation: deux zéros seulement, −2 et 3 ; en chacun, un des
 *   facteurs affiche 0 — jamais un produit nul sans facteur nul.
 * Misconception targeted: « pour annuler un produit, il faut annuler LES DEUX
 *   facteurs » et « (x − 3)(2x + 4) = 0 donne x = 3 seulement » (on oublie
 *   la deuxième branche).
 * Feedback: hors zéro, le produit exact est affiché avec les deux valeurs de
 *   facteurs — l'écart à 0 est visible, jamais un « faux » nu.
 * Formalization: la règle du produit nul et la méthode des branches vivent
 *   dans `knowledge.jsx`. La règle est posée par une <KnowledgeBrick> APRÈS
 *   la question de l'étape 2 — c'est cette question qui la fait DÉCOUVRIR,
 *   elle ne peut donc pas l'exiger ; la méthode est posée avant les deux
 *   branches à résoudre (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 balayages sans zéro trouvé, « Je ne trouve pas —
 *   montre-moi » place le curseur sur un zéro et le tamponne.
 * Transfer: étape 4 réinvestit sur x(x − 4) — le facteur nu vaut zéro aussi.
 */
const F1 = lin(1, -3);   // x − 3
const F2 = lin(2, 4);    // 2x + 4
const ZEROS = productZeros(F1, F2); // [−2, 3]

export default function Module04Scanner() {
  const [x, setX] = useState(0);
  const [stamped, setStamped] = useState([]);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [branch1, setBranch1] = useState(false);
  const [branch2, setBranch2] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);
  const [transferDone, setTransferDone] = useState(false);

  const branchesDone = branch1 && branch2;
  const product = evalProduct(F1, F2, x);
  const onZero = product === 0;
  const scanDone = ZEROS.every((z) => stamped.includes(z));

  const handleChange = (next) => {
    setX(next);
    if (evalProduct(F1, F2, next) !== 0) setTries((t) => t + 1);
  };

  const stamp = (kitReact) => {
    if (!onZero || stamped.includes(x)) return;
    const next = [...stamped, x].sort((a, b) => a - b);
    setStamped(next);
    kitReact?.(true);
  };

  const showMe = (kitReact) => {
    const missing = ZEROS.find((z) => !stamped.includes(z));
    if (missing === undefined) return;
    setX(missing);
    setStamped((s) => [...s, missing].sort((a, b) => a - b));
    setRevealed(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le scanner de produit"
      moduleSubtitle="Balaye la bande des x et repère où le produit tombe à 0."
      estimatedTime="11 min"
      brief={{
        tag: '🔎 Mission 04',
        title: 'Un produit ne tombe pas à zéro n’importe où.',
        body: (
          <p>
            Tu vas promener x sous <MathText>{`$${formatProduct(F1, F2)}$`}</MathText> et regarder le produit.
            Deux positions seulement le font tomber à 0 : trouve-les.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Balaye et trouve les deux zéros',
          subtitle: 'Tape la bande, ou utilise − et +.',
          done: scanDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Chaque position de x donne une valeur à chaque facteur, donc un produit. Trouve les
                positions où ce produit vaut exactement 0, puis marque-les.
              </p>
              <ProductScanner
                f1={F1}
                f2={F2}
                x={x}
                onChange={handleChange}
                stamped={stamped}
                onStamp={() => stamp(kit.react)}
                zeros={ZEROS}
              />
              {!scanDone && onZero && (
                <Feedback tone="ok">
                  Le produit vaut <strong className="font-mono">0</strong> ici, et l’un des facteurs vaut 0 :{' '}
                  <MathText>{`$${formatLin(F1)} = ${formatDec(evalLin(F1, x))}$`}</MathText>,{' '}
                  <MathText>{`$${formatLin(F2)} = ${formatDec(evalLin(F2, x))}$`}</MathText>. Marque-le.
                </Feedback>
              )}
              {!scanDone && !onZero && (
                <Feedback tone="info">
                  Pour <strong className="font-mono">x = {formatDec(x)}</strong>, le produit vaut{' '}
                  <strong className="font-mono">{formatDec(product)}</strong>, pas 0 — aucun des deux
                  facteurs n’est nul ({formatDec(evalLin(F1, x))} et {formatDec(evalLin(F2, x))}).
                  {stamped.length === 1 && ' Il reste un zéro à trouver.'}
                </Feedback>
              )}
              {!scanDone && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {scanDone && (
                <Feedback tone="ok">
                  Deux zéros, pas un de plus :{' '}
                  <MathText>{`$x = ${formatDec(ZEROS[0])}$`}</MathText> et{' '}
                  <MathText>{`$x = ${formatDec(ZEROS[1])}$`}</MathText>.
                  {revealed && ' (Un des deux t’a été montré — refais le balayage à côté pour le sentir.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi ces deux-là, et pas d’autres ?',
          done: ruleDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Sur toute la bande, qu’est-ce qui se passait à CHAQUE fois que le produit valait 0 ?"
              options={[
                'Les deux facteurs valaient 0 en même temps',
                'Au moins un des deux facteurs valait 0',
                'Le produit était simplement très petit',
              ]}
              cols={1}
              correct={1}
              explain={
                <>
                  En <MathText>{'$x = 3$'}</MathText> le premier facteur vaut 0 (le second vaut 10) ; en{' '}
                  <MathText>{'$x = −2$'}</MathText> c’est le second (le premier vaut −5). Il suffit d’UN
                  facteur nul — et il en faut au moins un.
                </>
              }
              explainWrong={
                <>
                  Regarde la bande : en <MathText>{'$x = 3$'}</MathText>, le second facteur vaut{' '}
                  <strong className="font-mono">10</strong>, pas 0 — et le produit vaut quand même 0. Il
                  suffit qu’UN facteur soit nul. Et un produit « petit » (par exemple −0,5) n’est pas nul.
                </>
              }
              requires={['produit-nul-constat']}
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
            {ruleDone && (
              <KnowledgeBrick
                id="regle-produit-nul"
                variant="new"
                lead="Le même constat qu’au module 1, mais A et B ne sont plus des nombres : ce sont des expressions en x. La règle, elle, ne bouge pas."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Chaque zéro est une petite équation',
          subtitle: 'On résout les deux branches séparément.',
          done: branchesDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="methode-branches"
                variant="new"
                lead="Puisqu’il suffit d’un facteur nul, la question « où le produit s’annule-t-il ? » se coupe en autant de questions qu’il y a de facteurs."
              />
              <p className="text-sm text-slate-600">
                À toi : <MathText>{`$${formatProduct(F1, F2)} = 0$`}</MathText> se coupe en deux
                équations du premier degré. Résous-les avec la balance du module 3.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-center font-mono font-bold text-slate-700">
                    <MathText>{`$${formatLin(F1)} = 0$`}</MathText>
                  </p>
                  <NumericQuestion
                    prompt="Branche 1 : x = ?"
                    expected={solveLinear({ left: F1, right: lin(0, 0) }).x}
                    parse={parseDec}
                    display={formatDec(solveLinear({ left: F1, right: lin(0, 0) }).x)}
                    explain="On ajoute 3 des deux côtés : x = 3."
                    requires={['methode-branches', 'equation-premier-degre']}
                    solved={branch1}
                    onAnswered={() => setBranch1(true)}
                  />
                </div>
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-center font-mono font-bold text-slate-700">
                    <MathText>{`$${formatLin(F2)} = 0$`}</MathText>
                  </p>
                  <NumericQuestion
                    prompt="Branche 2 : x = ?"
                    expected={solveLinear({ left: F2, right: lin(0, 0) }).x}
                    parse={parseDec}
                    display={formatDec(solveLinear({ left: F2, right: lin(0, 0) }).x)}
                    explain="On retire 4 des deux côtés (2x = −4), puis on partage en 2 : x = −2."
                    explainFor={(n) =>
                      n === 2
                        ? 'Attention au signe : 2x = −4 donne x = −2, pas 2.'
                        : 'On retire 4 des deux côtés (2x = −4), puis on partage en 2 : x = −2.'
                    }
                    requires={['methode-branches', 'equation-premier-degre', 'nombres-relatifs']}
                    solved={branch2}
                    onAnswered={() => setBranch2(true)}
                  />
                </div>
              </div>
              {branchesDone && (
                <Feedback tone="ok">
                  L’ensemble des solutions s’écrit{' '}
                  <MathText>{`$S = ${formatSolutionSet(ZEROS)}$`}</MathText> — exactement les deux zéros
                  que tu avais tamponnés sur la bande.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Un facteur peut être x tout seul',
          done: transferDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Combien de solutions a l’équation <MathText>{'$x(x - 4) = 0$'}</MathText> ?
                </>
              }
              options={['$\\{\\,4\\,\\}$', '$\\{\\,0\\,;\\,4\\,\\}$', "$\\emptyset$"]}
              renderOption={(o) => <MathText>{o}</MathText>}
              correctionLabel="{ 0 ; 4 }"
              optionLabel={(i) => ['{ 4 }', '{ 0 ; 4 }', 'aucune solution'][i]}
              cols={3}
              correct={1}
              explain={
                <>
                  Le premier facteur est <MathText>{'$x$'}</MathText> : il s’annule pour{' '}
                  <MathText>{'$x = 0$'}</MathText>. Le second s’annule pour{' '}
                  <MathText>{'$x = 4$'}</MathText>. Deux facteurs, deux zéros.
                </>
              }
              explainWrong={
                <>
                  Le piège classique : on ne voit que la parenthèse. Mais{' '}
                  <MathText>{'$x$'}</MathText> est lui aussi un facteur, et{' '}
                  <MathText>{'$0 \\times (0 - 4) = 0$'}</MathText>.
                </>
              }
              requires={['methode-branches', 'regle-produit-nul', 'ensemble-solutions']}
              solved={transferDone}
              onAnswered={() => setTransferDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais trouver les solutions. Reste à prouver qu’elles en sont —
          et à décider lesquelles ont un sens quand l’équation vient d’un vrai problème.
        </KnowledgeSnapshot>
      )}
    />
  );
}
