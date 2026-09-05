import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 5 — FORMALIZATION : « À retenir » — les règles, après les gestes. */
export default function Module05ARetenir() {
  const [b1, setB1] = useState(false); const [t2, setT2] = useState(false); const [b3, setB3] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="À retenir"
      moduleSubtitle="Multiples, diviseurs, restes, parité, critères : les règles et ce qu’elles permettent de prouver."
      estimatedTime="7 min"
      brief={{ tag: '📘 Mission 05', title: 'Quatre modules de gestes, une carte de règles.', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p><strong>Division euclidienne :</strong> <span className="font-mono font-bold">n = p × q + r</span>, 0 ≤ r &lt; p. <strong>n est multiple de p</strong> ⇔ r = 0 ⇔ n = pk ⇔ p est un diviseur de n.</p>
                <p><strong>Propriétés</strong> (a = pk, b = pk′) : la somme <span className="font-mono">a + b = p(k + k′)</span>, la différence et le produit par un entier <span className="font-mono">na = p(nk)</span> sont encore des multiples de p. En revanche, un multiple de 4 est toujours multiple de 2 — pas l’inverse.</p>
                <p><strong>Parité :</strong> pair = 2k, impair = 2k + 1. Pair + pair = pair, impair + impair = pair, pair + impair = impair ; le carré d’un impair est impair.</p>
                <p><strong>Critères :</strong> 2, 5, 10 par le dernier chiffre ; 4 par les deux derniers ; 3 et 9 par la somme des chiffres — parce que 10, 100, 9, 99, 999 sont des multiples de ces nombres.</p>
                <p><strong>PGCD</strong> (le plus grand morceau qui tombe juste) et <strong>PPCM</strong> (le prochain rendez-vous).</p>
              </div>
              <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>} rows={[
                { id: 'r1', label: 'La somme de deux multiples de 7 est un multiple de 7', options: ['vrai', 'faux'], correct: 0, correction: '7k + 7k′ = 7(k + k′).' },
                { id: 'r2', label: 'Tout multiple de 6 est un multiple de 3', options: ['vrai', 'faux'], correct: 0, correction: '6k = 3(2k).' },
                { id: 'r3', label: 'Tout multiple de 3 est un multiple de 6', options: ['vrai', 'faux'], correct: 1, correction: '9 est multiple de 3, pas de 6.' },
                { id: 'r4', label: '0 est un multiple de 5', options: ['vrai', 'faux'], correct: 0, correction: '0 = 5 × 0 : reste nul.' },
              ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Un contre-exemple suffit à faire tomber une règle (9 pour « multiple de 3 ⇒ multiple de 6 ») ; et 0 est multiple de tout entier.</Feedback>}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Somme de deux multiples', done: t2,
          content: <TapQuestion prompt="a et b sont deux multiples de 5. Que peut-on dire de a + b ?" options={['C’est un multiple de 5 : a = 5k, b = 5k′, donc a + b = 5(k + k′)', 'C’est un multiple de 10', 'On ne peut rien dire']} cols={1} correct={0}
            explain="La forme littérale conclut : 5k + 5k′ = 5(k + k′), un multiple de 5. Pas forcément de 10 : 5 + 15 = 20 (multiple de 10) mais 5 + 5 = 10 et 5 + 25 = 30… en revanche 15 + 5 = 20 ; contre-exemple : 5 + 15 = 20 est bien multiple de 10, mais 15 + 25 = 40 aussi — prends 5 + 5 = 10… le vrai contre-exemple est 5 + 20 = 25, multiple de 5 seulement."
            explainWrong="Écris-les : a = 5k et b = 5k′. Alors a + b = 5(k + k′) : multiple de 5. Mais pas forcément de 10 — 5 + 20 = 25."
            solved={t2} onAnswered={() => setT2(true)} />,
        },
        {
          num: 3, title: 'Critères en série', done: b3,
          content: (
            <BatchChoiceQuestion rows={[
              { id: 'r1', label: '5 130 est divisible par 9 ?', options: ['oui', 'non'], correct: 0, correction: 'somme 9.' },
              { id: 'r2', label: '3 428 est divisible par 4 ?', options: ['oui', 'non'], correct: 0, correction: '28 = 4 × 7.' },
              { id: 'r3', label: '1 111 est divisible par 3 ?', options: ['oui', 'non'], correct: 1, correction: 'somme 4.' },
              { id: 'r4', label: '2 025 est divisible par 5 et par 9 ?', options: ['oui', 'non'], correct: 0, correction: 'finit par 5 ; somme 9.' },
            ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Somme des chiffres pour 3 et 9, deux derniers chiffres pour 4, dernier chiffre pour 2, 5 et 10.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Les règles sont en place. Reste à s’en servir pour DÉMONTRER — et à repérer une fausse preuve.</Feedback>}
    />
  );
}
