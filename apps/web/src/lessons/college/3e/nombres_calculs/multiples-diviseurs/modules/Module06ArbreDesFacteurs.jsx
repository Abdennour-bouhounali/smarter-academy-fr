import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FactorTree from '../components/FactorTree';
import {
  makeTree, splitNode, treeLeaves, treeComplete, autoTree,
  primeFactors, formatFactorization,
} from '../components/divisibilityUtils';

/**
 * Module 6 — FORMALISATION : « L'arbre des facteurs ».
 *
 * Activity: couper 36 en partant de 4 × 9, prédire ce que donnerait 6 × 6,
 *   vérifier, puis décomposer 60 librement et écrire le résultat.
 * Mathematical objective: tout entier > 1 s'écrit comme produit de nombres
 *   premiers, et cette écriture est UNIQUE aux permutations près.
 * Student action: taper une feuille pas encore première, choisir une paire.
 * Controlled variable: le nœud coupé et la paire choisie.
 * Mathematical state: l'arbre `{ value, children }` ; les feuilles triées.
 * Visual consequence: une feuille composite garde un anneau ambre en
 *   pointillés et l'arbre affiche « n feuilles encore à couper » : il refuse
 *   de se déclarer fini.
 * Expected observation: partir de 4 × 9 ou de 6 × 6 donne exactement les
 *   mêmes feuilles, 2 · 2 · 3 · 3.
 * Misconception targeted: #6 (une feuille non première laissée telle quelle)
 *   et #7 (deux arbres = deux décompositions).
 * Feedback: le produit courant des feuilles est affiché en permanence — il
 *   vaut toujours n, ce qui rend l'erreur impossible à cacher.
 * Formalization: l'écriture avec exposants (60 = 2² × 3 × 5) arrive en
 *   dernier, comme résumé de l'arbre — jamais avant le geste.
 * Scaffolding: 36 avec un premier coup imposé (4 × 9), puis 60 en autonomie
 *   avec échappatoire.
 * Transfer: module 7, où les décompositions servent à simplifier et à
 *   carreler.
 */

const N1 = 36;
const N2 = 60;

export default function Module06ArbreDesFacteurs() {
  const [treeA, setTreeA] = useState(() => splitNode(makeTree(N1), '', [4, 9]));
  const [openA, setOpenA] = useState(null);

  const [predicted, setPredicted] = useState(false);
  const [treeB, setTreeB] = useState(() => splitNode(makeTree(N1), '', [6, 6]));
  const [openB, setOpenB] = useState(null);

  const [treeC, setTreeC] = useState(() => makeTree(N2));
  const [openC, setOpenC] = useState(null);
  const [revealedC, setRevealedC] = useState(false);
  const [triesC, setTriesC] = useState(0);

  const [writeDone, setWriteDone] = useState(false);

  const doneA = treeComplete(treeA);
  const doneB = predicted && treeComplete(treeB);
  const doneC = treeComplete(treeC) || revealedC;

  const cut = (tree, setTree, path, pair, setOpen, react) => {
    const next = splitNode(tree, path, pair);
    setTree(next);
    setOpen(null);
    react?.(treeComplete(next));
  };

  const leavesA = treeLeaves(treeA).map((l) => l.value).sort((a, b) => a - b);
  const leavesB = treeLeaves(treeB).map((l) => l.value).sort((a, b) => a - b);
  const sameLeaves = doneA && doneB && leavesA.join('·') === leavesB.join('·');

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’arbre des facteurs"
      moduleSubtitle="Coupe jusqu’à ce qu’il ne reste que des premiers. Toujours les mêmes."
      estimatedTime="10 min"
      brief={{
        tag: '🎁 Mission 06',
        title: 'Les boîtes-cadeaux se coupent en deux, encore et encore.',
        body: (
          <p>
            36 cadeaux se répartissent en 4 lots de 9, puis chaque lot se recoupe. Jusqu’où ?
            Jusqu’aux nombres qui refusent d’être coupés : les <strong>premiers</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Coupe 36 jusqu’au bout',
          done: doneA,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le premier coup est fait : 36 = 4 × 9. Touche chaque feuille{' '}
                <strong className="text-amber-700">à anneau ambre</strong> et choisis comment la
                couper. Les feuilles vertes sont finies.
              </p>
              <FactorTree
                tree={treeA}
                openPath={openA}
                onOpen={setOpenA}
                onSplit={(path, pair) => cut(treeA, setTreeA, path, pair, setOpenA, kit.react)}
                frozen={doneA}
              />
              {doneA && (
                <Feedback tone="ok">
                  Plus une seule feuille à couper : 36 ={' '}
                  <strong className="font-mono">{primeFactors(N1).join(' × ')}</strong>. Un nombre
                  premier ne se coupe pas — c’est exactement ce qui en fait une brique.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et si on avait commencé par 6 × 6 ?',
          done: doneB,
          content: (kit) => (
            <div className="space-y-3">
              <TapQuestion
                prompt="En partant de 36 = 6 × 6 au lieu de 4 × 9, obtiendra-t-on les mêmes feuilles ?"
                options={[
                  'Oui, exactement les mêmes',
                  'Non, on obtiendra 6 et 6',
                  'Non, on obtiendra d’autres nombres premiers',
                ]}
                correct={0}
                cols={1}
                solved={predicted}
                onAnswered={() => setPredicted(true)}
                explain="À toi de le vérifier juste en dessous : coupe ce second arbre jusqu'au bout."
              />
              {predicted && (
                <>
                  <FactorTree
                    tree={treeB}
                    openPath={openB}
                    onOpen={setOpenB}
                    onSplit={(path, pair) => cut(treeB, setTreeB, path, pair, setOpenB, kit.react)}
                    frozen={treeComplete(treeB)}
                    caption="Le même 36, coupé autrement"
                  />
                  {sameLeaves && (
                    <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-2">
                      <p className="text-xs font-mono uppercase tracking-wide text-purple-600">
                        Feuilles triées, côte à côte
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <p className="text-xs text-purple-700">Départ 4 × 9</p>
                          <p className="font-mono font-extrabold text-purple-900">{leavesA.join(' · ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-700">Départ 6 × 6</p>
                          <p className="font-mono font-extrabold text-purple-900">{leavesB.join(' · ')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-purple-900">
                        Identiques. Peu importe par où l’on coupe : la{' '}
                        <strong>décomposition en facteurs premiers</strong> d’un nombre est{' '}
                        <strong>unique</strong>. C’est sa carte d’identité définitive.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'À toi seul : décompose 60',
          done: doneC,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette fois, même le premier coup est à toi. Touche 60 et choisis ta paire de départ.
              </p>
              <FactorTree
                tree={revealedC ? autoTree(N2) : treeC}
                openPath={openC}
                onOpen={(p) => {
                  setOpenC(p);
                  if (p !== null) setTriesC((t) => t + 1);
                }}
                onSplit={(path, pair) => cut(treeC, setTreeC, path, pair, setOpenC, kit.react)}
                frozen={doneC}
              />
              {!doneC && triesC >= 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealedC(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi l’arbre complet
                </button>
              )}
              {doneC && (
                <Feedback tone={revealedC ? 'info' : 'ok'}>
                  {revealedC ? 'Voici un arbre complet : ' : ''}
                  60 = <strong className="font-mono">{primeFactors(N2).join(' × ')}</strong>. Quel que
                  soit ton chemin — 6 × 10, 4 × 15, 2 × 30 — tu retombes sur ces quatre feuilles.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'L’écrire proprement',
          done: writeDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-wide text-purple-600">À retenir</p>
                <p className="text-sm text-purple-900">
                  Quand un facteur revient plusieurs fois, on le note avec un{' '}
                  <strong>exposant</strong> : 2 × 2 s’écrit <MathText>{'$2^{2}$'}</MathText>.
                </p>
                <p className="text-sm text-purple-900">
                  Ainsi 36 = <MathText>{'$2^{2}\\times 3^{2}$'}</MathText> et 180 ={' '}
                  <MathText>{`$${formatFactorization(180, { latex: true })}$`}</MathText>.
                </p>
              </div>
              <TapQuestion
                prompt="Comment s’écrit la décomposition de 60 avec des exposants ?"
                options={[
                  '$2^{2}\\times 3\\times 5$',
                  '$2\\times 3\\times 10$',
                  '$4\\times 15$',
                  '$2^{2}\\times 15$',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                correctionLabel="2² × 3 × 5"
                correct={0}
                cols={2}
                solved={writeDone}
                onAnswered={() => setWriteDone(true)}
                explain={
                  <>
                    Les feuilles de l’arbre sont 2, 2, 3, 5 : le 2 revient deux fois, d’où{' '}
                    <MathText>{'$2^{2}$'}</MathText>. Les autres propositions gardent des nombres qui
                    ne sont <strong>pas premiers</strong> — 10, 15 et 4 pouvaient encore être coupés,
                    ce ne sont pas des feuilles.
                  </>
                }
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Chaque nombre a désormais une carte d’identité : ses facteurs premiers. Au module suivant,
          on s’en sert pour simplifier une fraction, carreler un sol et attraper deux bus.
        </Feedback>
      }
    />
  );
}
