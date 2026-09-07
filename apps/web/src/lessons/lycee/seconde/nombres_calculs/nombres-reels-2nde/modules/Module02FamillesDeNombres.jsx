import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FamilySorter from '../components/FamilySorter';
import { NUMBERS } from '../components/numbers';
import { classify, IRRATIONALS } from '../components/realsUtils';

/**
 * Module 2 — DISCOVERY : « Les familles de nombres ».
 *
 * Activity: ranger huit nombres dans cinq boîtes emboîtées après avoir
 *   regardé leur écriture décimale.
 * Mathematical objective: nommer ce que le zoom a montré — décimal (𝔻),
 *   rationnel (ℚ), réel (ℝ) — et voir l'emboîtement ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ.
 * Student action: toucher un nombre (son développement s'affiche), puis
 *   la plus petite famille.
 * Controlled variable: l'affectation.
 * Mathematical state: `placed` ; classify décide.
 * Expected observation: √9 est entier ; 3/4 est décimal ; 1/3 est rationnel
 *   sans être décimal ; √2 et π ne sont même pas rationnels.
 * Misconception targeted: « une racine est toujours irrationnelle », « une
 *   fraction n'est pas un décimal », « 0,5 n'est pas rationnel ».
 */
const TO_SORT = [
  NUMBERS['trois-quarts'], NUMBERS['un-tiers'], NUMBERS['racine-neuf'], NUMBERS['moins-sept'],
  { ...NUMBERS.sqrt2, approx: IRRATIONALS.sqrt2.digits.slice(0, 7).replace('.', ',') },
  NUMBERS['zero-cinq'], { ...NUMBERS.pi, approx: IRRATIONALS.pi.digits.slice(0, 7).replace('.', ',') }, NUMBERS['douze'],
];

export default function Module02FamillesDeNombres() {
  const [placed, setPlaced] = useState({});
  const [batchDone, setBatchDone] = useState(false);
  const sortDone = TO_SORT.every((n) => placed[n.id] !== undefined);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Les familles de nombres"
      moduleSubtitle="Cinq boîtes emboîtées, ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ : range chaque nombre dans la plus petite."
      estimatedTime="9 min"
      brief={{
        tag: '📦 Mission 02',
        title: 'Trois comportements au zoom, cinq familles de nombres.',
        tone: 'indigo',
        body: <p>Touche un nombre : son écriture décimale apparaît. Elle s’arrête ? Elle se répète ? Ni l’un ni l’autre ? La réponse choisit la boîte.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Range les huit nombres',
          subtitle: 'Chaque nombre a sa famille — dépose-les et regarde où ils tombent.',
          done: sortDone,
          content: (kit) => (
            <div className="space-y-3">
              <FamilySorter
                numbers={TO_SORT}
                placed={placed}
                onPlace={(id, fam) => { setPlaced({ ...placed, [id]: fam }); kit.react(classify(TO_SORT.find((n) => n.id === id)) === fam); }}
              />
              {sortDone && (
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-1.5">
                  <p className="font-semibold">Les mots, maintenant :</p>
                  <p>Un nombre <strong>décimal</strong> a une écriture décimale qui s’arrête : 3/4 = 0,75, 0,5, et tous les entiers. Un nombre <strong>rationnel</strong> peut s’écrire comme une fraction d’entiers : 1/3 en est un, sans être décimal (0,333… ne s’arrête jamais). Un nombre qui n’est pas rationnel est <strong>irrationnel</strong> : √2, π.</p>
                  <p>Chaque boîte est dans la suivante : <span className="font-mono font-bold">ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ</span>. Et √9 = 3 : une racine carrée peut très bien être un entier.</p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Vrai ou faux ?',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'r1', label: 'Tout entier est un nombre décimal', options: ['vrai', 'faux'], correct: 0, correction: '12 = 12,0 : son écriture s’arrête.' },
                { id: 'r2', label: 'Tout décimal est un rationnel', options: ['vrai', 'faux'], correct: 0, correction: '0,75 = 75/100 : une fraction.' },
                { id: 'r3', label: '1/3 est un nombre décimal', options: ['vrai', 'faux'], correct: 1, correction: '0,333… ne s’arrête jamais.' },
                { id: 'r4', label: '√16 est irrationnel', options: ['vrai', 'faux'], correct: 1, correction: '√16 = 4 ∈ ℕ.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Les boîtes sont emboîtées : ce qui est dans ℕ est aussi dans ℤ, 𝔻, ℚ et ℝ. Le contraire est faux : 1/3 ∈ ℚ mais 1/3 ∉ 𝔻.
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
          ℝ, l’ensemble des réels, c’est toute la droite : chaque point est un nombre. Dedans, des familles emboîtées selon l’écriture décimale. Mais pourquoi 1/3 tourne-t-il en rond alors que 3/8 s’arrête ? Le module suivant pose la division.
        </Feedback>
      }
    />
  );
}
