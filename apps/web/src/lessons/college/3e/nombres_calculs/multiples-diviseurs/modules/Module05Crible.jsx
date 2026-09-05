import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberGrid from '../components/NumberGrid';
import PrimeChips from '../components/PrimeChips';
import { sieveStrikes, sievePrimes, primesUpTo, isPrime, divisors, digitSum } from '../components/divisibilityUtils';

/**
 * Module 5 — MANIPULATION : « Le crible ».
 *
 * Activity: barrer, premier par premier, les multiples de 2, 3, 5 et 7 sur
 *   la grille 1 → 50 ; ce qui survit est la liste des nombres premiers.
 * Mathematical objective: donner une MÉTHODE d'identification des premiers
 *   jusqu'à 50, et le raisonnement qui la borne (au-delà de 7, un composite
 *   ≤ 50 aurait déjà été barré, car 11 × 11 = 121 > 50).
 * Student action: taper une puce premier ; ses multiples se barrent.
 * Controlled variable: l'ensemble des premiers déjà tapés.
 * Mathematical state: struck = 1 ∪ (union des sieveStrikes(50, p) pour les p
 *   tapés) ; les survivants sont dérivés, jamais listés à la main.
 * Visual consequence: des vagues de cases barrées, puis une grille creuse où
 *   les 15 survivants sautent aux yeux.
 * Expected observation: après 7, taper un autre premier ne barrerait plus
 *   rien de neuf.
 * Misconception targeted: #3 (1 premier / 2 non premier car pair) et #4
 *   (51, 57, 91 « ont l'air » premiers).
 * Feedback: le compteur de survivants restants est affiché en continu ; la
 *   prédiction de l'étape 1 est confrontée au décompte réel.
 * Formalization: « nombre premier = exactement DEUX diviseurs », énoncé au
 *   module 4 et ré-appliqué ici à 1, à 2 et à 51.
 * Scaffolding: les cases ne sont pas tappables (50 boutons = trop dense) ;
 *   4 puces suffisent, dans n'importe quel ordre.
 * Transfer: l'arbre des facteurs du module 6 s'arrête sur ces premiers-là.
 */

const LIMIT = 50;
const SIEVE_PRIMES = sievePrimes(LIMIT); // [2, 3, 5, 7]
const PRIMES_50 = primesUpTo(LIMIT); // 15 nombres

export default function Module05Crible() {
  const [predicted, setPredicted] = useState(false);
  const [tapped, setTapped] = useState(() => new Set());
  const [whyDone, setWhyDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);

  const done2 = tapped.size === SIEVE_PRIMES.length;

  // 1 est barré d'entrée : il n'a qu'UN diviseur, il n'est pas premier.
  const struck = new Set([1]);
  [...tapped].forEach((p) => sieveStrikes(LIMIT, p).forEach((k) => struck.add(k)));

  const survivors = [];
  for (let k = 1; k <= LIMIT; k += 1) if (!struck.has(k)) survivors.push(k);

  const painted = done2 ? new Set(PRIMES_50) : new Set();

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le crible"
      moduleSubtitle="Barre les multiples de 2, 3, 5, 7 : ce qui survit est premier."
      estimatedTime="9 min"
      brief={{
        tag: '🧹 Mission 05',
        title: 'Les tickets de tombola qui ne se partagent pas.',
        body: (
          <p>
            Un ticket dont le numéro est premier ne peut se répartir dans aucun lot égal — sauf en
            un seul paquet. Barrons tous les autres et voyons ce qu’il reste.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de barrer',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Sur les 50 tickets, combien resteront après avoir barré 1 puis tous les multiples de 2, 3, 5 et 7 (sauf 2, 3, 5, 7 eux-mêmes) ?"
              options={['Environ 5', 'Environ 15', 'Environ 25', 'Presque aucun']}
              correct={1}
              cols={2}
              solved={predicted}
              onAnswered={() => setPredicted(true)}
              explain={
                <>
                  Il en restera exactement <strong>{PRIMES_50.length}</strong>. Tu vas les faire
                  apparaître toi-même à l’étape suivante.
                </>
              }
            />
          ),
        },
        {
          num: 2,
          title: 'Crible la grille',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Tape les quatre puces, dans l’ordre que tu veux. Chacune barre ses multiples —{' '}
                <strong>elle-même reste</strong>, elle ne se barre pas.
              </p>
              <PrimeChips
                primes={SIEVE_PRIMES}
                tapped={tapped}
                onTap={(p) => {
                  const next = new Set([...tapped, p]);
                  setTapped(next);
                  kit.react(true);
                }}
                disabled={done2}
              />
              <NumberGrid
                limit={LIMIT}
                struck={struck}
                painted={painted}
                tone="violet"
                ariaLabel="Grille du crible de 1 à 50"
              />
              {!done2 && (
                <Feedback tone="info">
                  <strong>{survivors.length}</strong> nombres encore debout sur 50.
                  {tapped.size === 0 && ' 1 est déjà barré : il n’a qu’un seul diviseur, lui-même.'}
                  {tapped.size > 0 && ` Il te reste ${SIEVE_PRIMES.length - tapped.size} puce${
                    SIEVE_PRIMES.length - tapped.size > 1 ? 's' : ''
                  } à taper.`}
                </Feedback>
              )}
              {done2 && (
                <Feedback tone="ok">
                  Les <strong>{PRIMES_50.length}</strong> survivants :{' '}
                  <span className="font-mono">{PRIMES_50.join(' · ')}</span>. Ce sont les{' '}
                  <strong>nombres premiers inférieurs à 50</strong>. Remarque : <strong>2</strong> est
                  le seul premier pair — tous les autres nombres pairs se sont barrés dès la première
                  puce.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Pourquoi s’arrêter à 7 ?',
          done: whyDone,
          content: (
            <TapQuestion
              prompt="Pourquoi ne barre-t-on pas aussi les multiples de 11, 13, 17… ?"
              options={[
                'Parce que 11 × 11 = 121 dépasse 50 : tout multiple de 11 plus petit que 50 a déjà un facteur ≤ 7',
                'Parce que 11 est trop grand pour avoir des multiples',
                'Parce que les multiples de 11 sont tous premiers',
                'Par convention : on s’arrête toujours à quatre puces',
              ]}
              correct={0}
              cols={1}
              solved={whyDone}
              onAnswered={() => setWhyDone(true)}
              explain={
                <>
                  Un nombre ≤ 50 qui n’est pas premier s’écrit a × b avec a ≤ b, donc a × a ≤ 50 :
                  son plus petit facteur ne dépasse pas 7. En barrant 2, 3, 5 et 7, on a donc déjà
                  attrapé tous les composites. Le premier multiple de 11 encore debout serait{' '}
                  <strong className="font-mono">121</strong> — hors grille.
                </>
              }
            />
          ),
        },
        {
          num: 4,
          title: 'Le raisonnement, cas par cas',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Quatre affirmations. Rappel du critère : premier ={' '}
                  <strong>exactement deux diviseurs</strong>, 1 et lui-même.
                </p>
              }
              rows={[
                {
                  id: 'un', label: '1 est premier', options: ['Vrai', 'Faux'], correct: 1,
                  correction: '1 n’a qu’UN diviseur : lui-même.',
                },
                {
                  id: 'deux', label: '2 est premier', options: ['Vrai', 'Faux'], correct: 0,
                  correction: 'Diviseurs de 2 : 1 et 2. Deux exactement.',
                },
                {
                  id: 'pair', label: 'Un nombre pair plus grand que 2 peut être premier', options: ['Vrai', 'Faux'], correct: 1,
                  correction: 'Il aurait 1, 2 et lui-même : trois diviseurs au moins.',
                },
                {
                  id: 'n51', label: '51 est premier', options: ['Vrai', 'Faux'], correct: 1,
                  correction: '5 + 1 = 6, donc 51 = 3 × 17.',
                },
              ]}
              solved={batchDone}
              onAnswered={() => setBatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} correctes.{' '}
                    </>
                  )}
                  <strong className="font-mono">1</strong> : diviseurs {divisors(1).join(', ')} — un
                  seul, donc pas premier. <strong className="font-mono">2</strong> : diviseurs{' '}
                  {divisors(2).join(', ')} — exactement deux, donc premier{' '}
                  {isPrime(2) ? '(et c’est le seul pair)' : ''}.{' '}
                  <strong className="font-mono">51</strong> : sa somme des chiffres vaut{' '}
                  {digitSum(51)}, divisible par 3 — donc 51 = 3 × 17. Un nombre impair n’est pas
                  automatiquement premier : c’est le piège de 51, 57 et 91.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Tu as une méthode pour reconnaître un premier, et un argument pour savoir quand t’arrêter
          de chercher. Au module suivant, ces premiers deviennent les briques de tous les autres
          nombres.
        </Feedback>
      }
    />
  );
}
