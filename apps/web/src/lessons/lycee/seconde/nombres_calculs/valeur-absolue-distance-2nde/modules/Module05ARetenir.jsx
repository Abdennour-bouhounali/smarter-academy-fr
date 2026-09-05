import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 5 — FORMALIZATION : « À retenir » — les quatre lectures nommées après les gestes. */
export default function Module05ARetenir() {
  const [b1, setB1] = useState(false);
  const [t2, setT2] = useState(false);
  const [b3, setB3] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="À retenir"
      moduleSubtitle="Distance à 0, distance entre deux nombres, faisceau et intervalle : les quatre lectures en une carte."
      estimatedTime="6 min"
      brief={{ tag: '📘 Mission 05', title: 'Quatre gestes, quatre formules. Les voici, côte à côte.', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">distance à 0</div><div className="font-extrabold">|x| = x si x ≥ 0, −x si x &lt; 0</div><div className="text-xs">|x| ≥ 0 ; |−x| = |x| ; |x| = 0 ⇔ x = 0</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">distance entre a et b</div><div className="font-extrabold">|b − a| = |a − b|</div><div className="text-xs">ne change pas si on décale les deux</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">équation</div><div className="font-extrabold">|x − a| = r ⇔ x = a − r ou x = a + r</div><div className="text-xs">r &gt; 0 : deux solutions ; r = 0 : une ; r &lt; 0 : aucune</div></div>
                  <div className="rounded-xl bg-white border border-indigo-200 p-3"><div className="text-[11px] font-bold uppercase text-indigo-500">faisceau</div><div className="font-extrabold">|x − a| ≤ r ⇔ x ∈ [a − r ; a + r]</div><div className="text-xs">&lt; ⇔ ]a − r ; a + r[ ; centre a = milieu, rayon r = demi-longueur</div></div>
                </div>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>}
                rows={[
                  { id: 'r1', label: '|x| est toujours positif ou nul', options: ['vrai', 'faux'], correct: 0 },
                  { id: 'r2', label: '|x − 2| = 3 a une seule solution', options: ['vrai', 'faux'], correct: 1, correction: 'deux : −1 et 5.' },
                  { id: 'r3', label: '|x| = −4 n’a pas de solution', options: ['vrai', 'faux'], correct: 0 },
                  { id: 'r4', label: '|x − a| ≤ r décrit l’intervalle [a ; a + r]', options: ['vrai', 'faux'], correct: 1, correction: '[a − r ; a + r], des deux côtés de a.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Une valeur absolue est une distance : jamais négative, symétrique, et un faisceau s’étend des deux côtés de son centre.</Feedback>}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Centre et rayon', done: t2,
          content: (
            <TapQuestion
              prompt="Quelle inégalité décrit l’intervalle [2 ; 8] ?"
              options={['|x − 5| ≤ 3', '|x − 2| ≤ 8', '|x − 3| ≤ 5', '|x − 5| < 3']} cols={2} correct={0}
              explain="Centre = milieu = (2 + 8) ÷ 2 = 5 ; rayon = demi-longueur = (8 − 2) ÷ 2 = 3 ; bornes incluses → ≤."
              explainWrong="Le centre est le MILIEU de l’intervalle (5), le rayon la moitié de sa longueur (3), et les crochets fermés demandent ≤ : |x − 5| ≤ 3."
              solved={t2} onAnswered={() => setT2(true)} />
          ),
        },
        {
          num: 3, title: 'Résoudre', done: b3,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'r1', label: '|x − 4| = 1', options: ['x = 5', 'x = 3 ou x = 5', 'x = −3 ou x = 5'], correct: 1 },
                { id: 'r2', label: '|x + 2| ≤ 3', options: ['[−5 ; 1]', '[−1 ; 5]', ']−5 ; 1['], correct: 0, correction: '|x + 2| = |x − (−2)| : centre −2, rayon 3.' },
                { id: 'r3', label: '|x| < 2', options: [']−2 ; 2[', '[−2 ; 2]', ']−∞ ; 2['], correct: 0 },
              ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Le piège de |x + 2| : c’est |x − (−2)|, le centre est −2. Et un signe strict ouvre les crochets.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Les quatre lectures sont en place. Il reste à les reconnaître dans des situations réelles : une vis, un vaccin, un randonneur.</Feedback>}
    />
  );
}
