import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { VecName } from '../components/VectorScene';

/** Module 7 — FORMALISATION : « À retenir » — la carte, une fois les gestes faits. */
const CARDS = [
  { t: 'vecteur', f: <>direction · sens · longueur</>, s: 'pas de point de départ ; représentants ; AA = 0 ; BA = −AB' },
  { t: 'égalité', f: <>u = v ⟺ mêmes coordonnées</>, s: 'même direction, même sens, même longueur' },
  { t: 'coordonnées', f: <>AB (x<sub>B</sub> − x<sub>A</sub> ; y<sub>B</sub> − y<sub>A</sub>)</>, s: 'u = x·i + y·j dans une base orthonormée (i, j)' },
  { t: 'somme', f: <>(x ; y) + (x′ ; y′) = (x + x′ ; y + y′)</>, s: 'bout à bout ; AB + BC = AC (Chasles) ; u + (−u) = 0' },
  { t: 'produit par k', f: <>k·(x ; y) = (kx ; ky)</>, s: 'même direction ; longueur × |k| ; sens inversé si k < 0' },
  { t: 'colinéaires', f: <>v = k·u</>, s: 'même direction ; l’un est un multiple de l’autre' },
  { t: 'norme, distance', f: <>‖u‖ = √(x² + y²)</>, s: 'AB = ‖AB‖' },
  { t: 'milieu', f: <>I ((x<sub>A</sub> + x<sub>B</sub>)/2 ; (y<sub>A</sub> + y<sub>B</sub>)/2)</>, s: 'AI = IB' },
];

export default function Module07ARetenir() {
  const [b1, setB1] = useState(false);
  const [t2, setT2] = useState(false);
  const [b3, setB3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="À retenir"
      moduleSubtitle="Égalité, coordonnées, somme, produit, norme, milieu : la carte de la leçon"
      estimatedTime="6 min"
      brief={{ tag: '📘 Formalisation', title: 'Huit gestes, huit formules. Les voici, côte à côte.', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CARDS.map((c) => (
                    <div key={c.t} className="rounded-xl bg-white border border-indigo-200 p-3">
                      <div className="text-[11px] font-bold uppercase text-indigo-500">{c.t}</div>
                      <div className="font-extrabold font-mono">{c.f}</div>
                      <div className="text-xs">{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>}
                rows={[
                  { id: 'r1', label: 'Deux flèches de même longueur représentent le même vecteur', options: ['vrai', 'faux'], correct: 1, correction: 'il faut aussi la même direction et le même sens.' },
                  { id: 'r2', label: 'Le vecteur AB a pour coordonnées (xA − xB ; yA − yB)', options: ['vrai', 'faux'], correct: 1, correction: 'arrivée moins départ : (xB − xA ; yB − yA).' },
                  { id: 'r3', label: '−2·u a la même direction que u', options: ['vrai', 'faux'], correct: 0 },
                  { id: 'r4', label: 'La norme de (3 ; 4) est 7', options: ['vrai', 'faux'], correct: 1, correction: '√(9 + 16) = 5.' },
                  { id: 'r5', label: 'AB + BA = 0', options: ['vrai', 'faux'], correct: 0 },
                ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Cinq sur cinq.' : `${nCorrect} / ${total}.`} Un vecteur, ce sont trois attributs à la fois ; ses coordonnées se calculent arrivée moins départ ; sa longueur passe par Pythagore.</Feedback>}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Une écriture, un objet', done: t2,
          content: (
            <TapQuestion
              prompt={<>Dans la base (<VecName>i</VecName>, <VecName>j</VecName>), que vaut le vecteur 2<VecName>i</VecName> − 3<VecName>j</VecName> ?</>}
              options={['(2 ; −3)', '(−3 ; 2)', '(2 ; 3)', '(−1 ; 0)']} cols={2} correct={0}
              explain="2 fois i (1 ; 0) plus −3 fois j (0 ; 1) : (2 ; −3). Le coefficient de i est l’abscisse, celui de j l’ordonnée."
              explainWrong="Le coefficient de i donne l’abscisse (2), celui de j l’ordonnée (−3) : (2 ; −3)."
              solved={t2} onAnswered={() => setT2(true)} />
          ),
        },
        {
          num: 3, title: 'Calculer', done: b3,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'c1', label: 'A (−2 ; 5), B (1 ; 1) : AB', options: ['(3 ; −4)', '(−3 ; 4)', '(−1 ; 6)'], correct: 0 },
                { id: 'c2', label: '‖AB‖ pour AB (3 ; −4)', options: ['5', '−1', '25'], correct: 0, correction: '√(9 + 16) = 5 : une longueur, jamais négative.' },
                { id: 'c3', label: 'milieu de [AB], A (−2 ; 5), B (1 ; 1)', options: ['(−0,5 ; 3)', '(1,5 ; −2)', '(−1 ; 6)'], correct: 0, correction: 'moyennes : (−2 + 1)/2 = −0,5 et (5 + 1)/2 = 3.' },
                { id: 'c4', label: '2·(3 ; −4) + (−1 ; 2)', options: ['(5 ; −6)', '(4 ; −6)', '(5 ; −2)'], correct: 0, correction: '(6 ; −8) + (−1 ; 2) = (5 ; −6).' },
              ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Le piège du milieu : c’est la SOMME divisée par 2, pas la différence. Et une norme est toujours positive.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Les formules sont en place. Reste à s’en servir pour ce qu’elles savent faire : construire un parallélogramme, retrouver un déplacement, prouver un alignement.</Feedback>}
    />
  );
}
