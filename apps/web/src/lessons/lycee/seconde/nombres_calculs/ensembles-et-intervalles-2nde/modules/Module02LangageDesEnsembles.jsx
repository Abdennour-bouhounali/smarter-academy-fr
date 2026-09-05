import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SetBoxes from '../components/SetBoxes';
import VennSorter from '../components/VennSorter';
import { divisorsOf, smallestSet, vennRegion } from '../components/intervalUtils';

/**
 * Module 2 — DISCOVERY : « Le langage des ensembles ».
 *
 * Activity: ranger des nombres dans des boîtes emboîtées (ℕ ⊂ ℤ ⊂ ℝ), puis
 *   dans deux cercles qui se croisent (diviseurs de 12 / de 18).
 * Mathematical objective: donner du sens à ∈, ∉, ⊂, ∩, ∪, ∅ par des gestes
 *   de rangement avant d'écrire les symboles.
 * Student action: toucher un nombre, puis une boîte / une région.
 * Controlled variable: l'affectation de chaque nombre.
 * Mathematical state: `boxes` et `venn` (affectations) ; les verdicts sont
 *   dérivés (smallestSet, vennRegion).
 * Visual consequence: le nombre se pose ; mal rangé, il reste visible,
 *   barré, avec la raison.
 * Expected observation: tout ce qui est dans ℕ est aussi dans ℤ et ℝ ; la
 *   zone du milieu du Venn est faite des diviseurs COMMUNS.
 * Misconception targeted: « 0 ∉ ℕ », « −3 ∈ ℕ », « 2,5 ∈ ℤ », « ∩ = tout ».
 * Formalization: les symboles apparaissent après chaque rangement ; l'∅ à
 *   l'étape 3.
 */
const NUMBERS = [7, -3, 0, 2.5, -1.25, 12];
const A = divisorsOf(12);
const B = divisorsOf(18);
const VENN_NUMBERS = [1, 2, 3, 4, 6, 9, 12, 18, 5];

export default function Module02LangageDesEnsembles() {
  const [boxes, setBoxes] = useState({});
  const [venn, setVenn] = useState({});
  const [batchDone, setBatchDone] = useState(false);

  const boxesDone = NUMBERS.every((n) => boxes[n] !== undefined);
  const vennDone = VENN_NUMBERS.every((n) => venn[n] !== undefined);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le langage des ensembles"
      moduleSubtitle="Des boîtes emboîtées, deux cercles qui se croisent : ∈, ⊂, ∩, ∪ et ∅ en rangeant des nombres."
      estimatedTime="7 min"
      brief={{
        tag: '📦 Mission 02',
        title: 'Un ensemble, c’est une collection d’objets bien définie — ici, des nombres.',
        tone: 'indigo',
        body: <p>Avant les intervalles, trois boîtes et deux cercles. Range, et les symboles viendront tout seuls.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Trois boîtes emboîtées',
          subtitle: 'Range chaque nombre dans la PLUS PETITE boîte qui le contient.',
          done: boxesDone,
          content: (kit) => (
            <div className="space-y-3">
              <SetBoxes
                numbers={NUMBERS}
                placed={boxes}
                onPlace={(n, id) => { setBoxes({ ...boxes, [n]: id }); kit.react(smallestSet(n) === id); }}
              />
              {boxesDone && (
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-1.5 text-sm text-indigo-900">
                  <p className="font-semibold">Les symboles, maintenant :</p>
                  <p><span className="font-mono font-bold">7 ∈ ℕ</span> se lit « 7 appartient à ℕ » ; <span className="font-mono font-bold">−3 ∉ ℕ</span> « −3 n’appartient pas à ℕ », mais <span className="font-mono font-bold">−3 ∈ ℤ</span>.</p>
                  <p>La petite boîte est <strong>dans</strong> la grande : <span className="font-mono font-bold">ℕ ⊂ ℤ ⊂ ℝ</span> — « ℕ est inclus dans ℤ ». Tout entier naturel est un entier relatif, et tout entier relatif est un réel.</p>
                  <p>0 est bien dans ℕ : les entiers naturels commencent à 0.</p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux ensembles qui se croisent',
          subtitle: 'A = diviseurs de 12, B = diviseurs de 18. Place chaque nombre.',
          done: vennDone,
          content: (kit) => (
            <div className="space-y-3">
              <VennSorter
                numbers={VENN_NUMBERS}
                A={A} B={B}
                labelA="diviseurs de 12" labelB="diviseurs de 18"
                placed={venn}
                onPlace={(n, id) => { setVenn({ ...venn, [n]: id }); kit.react(vennRegion(n, A, B) === id); }}
              />
              {vennDone && (
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-1.5 text-sm text-indigo-900">
                  <p>La zone du milieu, ce qui est dans A <strong>et</strong> dans B, s’appelle l’<strong>intersection</strong> : <span className="font-mono font-bold">A ∩ B = {'{'}1 ; 2 ; 3 ; 6{'}'}</span>.</p>
                  <p>Tout ce qui est dans A <strong>ou</strong> dans B (ou les deux) s’appelle la <strong>réunion</strong> : <span className="font-mono font-bold">A ∪ B = {'{'}1 ; 2 ; 3 ; 4 ; 6 ; 9 ; 12 ; 18{'}'}</span>.</p>
                  <p>Et 5 ? <span className="font-mono font-bold">5 ∉ A ∪ B</span>.</p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Vrai ou faux ?',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'r1', label: '0 ∈ ℕ', options: ['vrai', 'faux'], correct: 0, correction: '0 est le premier entier naturel.' },
                { id: 'r2', label: 'ℤ ⊂ ℕ', options: ['vrai', 'faux'], correct: 1, correction: 'C’est ℕ ⊂ ℤ : −3 ∈ ℤ mais −3 ∉ ℕ.' },
                { id: 'r3', label: '2,5 ∈ ℤ', options: ['vrai', 'faux'], correct: 1, correction: '2,5 n’est pas un entier.' },
                { id: 'r4', label: 'L’ensemble des entiers strictement compris entre 2 et 3 est vide', options: ['vrai', 'faux'], correct: 0, correction: 'Aucun entier entre 2 et 3 : on note ∅.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} L’ensemble qui ne contient <strong>aucun</strong> élément s’appelle l’<strong>ensemble vide</strong>, noté <span className="font-mono font-bold">∅</span> — on le retrouvera quand deux plages ne se croisent pas.
                </Feedback>
              )}
              solved={batchDone}
              onAnswered={() => setBatchDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          <strong>À retenir :</strong> un ensemble est une collection d’éléments. <span className="font-mono">∈</span> appartient, <span className="font-mono">∉</span> n’appartient pas, <span className="font-mono">⊂</span> est inclus dans, <span className="font-mono">∩</span> intersection (dans les deux), <span className="font-mono">∪</span> réunion (dans l’un ou l’autre), <span className="font-mono">∅</span> ensemble vide. ℕ ⊂ ℤ ⊂ ℝ. La plage du manège est un ensemble de réels : au module suivant, son nom.
        </Feedback>
      }
    />
  );
}
