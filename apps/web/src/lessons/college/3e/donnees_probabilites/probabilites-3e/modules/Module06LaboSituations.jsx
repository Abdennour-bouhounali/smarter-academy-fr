import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SpinnerWheel, { wheelColours } from '../components/SpinnerWheel';
import { makeRng, parseDec, formatDec } from '@smarter-academy/core';
import { drawIndex, formatPct, fracLatex, sessionSeed } from '../components/probaUtils';

/**
 * Module 6 — LABORATOIRE : « Le labo des situations ».
 *
 * Activity: régler une roue pour une probabilité visée et la faire tourner
 *   120 fois ; estimer une probabilité à partir d'une fréquence (contrôle
 *   qualité) et prévoir ; tirage au sort dans une classe ; vrai / faux.
 * Mathematical objective: transférer P = favorables ÷ possibles à des
 *   secteurs, à des personnes ; utiliser une fréquence pour ESTIMER une
 *   probabilité inconnue puis prévoir P × n ; interpréter dans le contexte.
 * Student action: − / + sur les secteurs ; tourner ; répondre.
 * Controlled variable: la composition de la roue.
 * Mathematical state: `sectors` {rouge, bleu} ; probabilités dérivées ; les
 *   tours sont un instantané semé.
 * Visual consequence: la roue se recolorie, tourne, s'arrête ; les effectifs
 *   des 120 tours se comparent à 40.
 * Expected observation: « 4 secteurs sur 12, c'est 1/3 — et la fréquence
 *   sur 120 tours tourne autour de 40 ».
 * Misconception targeted: « deux issues ⇒ 1/2 chacune » ; « 0,9 ⇒ certain » ;
 *   « une fréquence sur 10 essais prouve un truquage ».
 */

const SEED = 20260905 + 6;
const N_SPINS = 120;
const SPIN_MS = 900;

export default function Module06LaboSituations() {
  const reduce = useReducedMotion();
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(sessionSeed(SEED));
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reactRef = useRef(null);

  const [sectors, setSectors] = useState({ rouge: 2, bleu: 5 });
  const [wheelDone, setWheelDone] = useState(false);
  const [changes, setChanges] = useState(0);
  const [spins, setSpins] = useState({ counts: { rouge: 0, bleu: 0, vert: 0 }, n: 0, last: null });
  const [spinning, setSpinning] = useState(false);
  const [qc1, setQc1] = useState(false);
  const [qc2, setQc2] = useState(false);
  const [classDone, setClassDone] = useState(false);
  const [class2Done, setClass2Done] = useState(false);
  const [vfDone, setVfDone] = useState(false);

  const pR = sectors.rouge / 12;
  useEffect(() => {
    if (wheelDone || Math.abs(pR - 1 / 3) > 1e-9) return;
    setWheelDone(true);
    reactRef.current?.(true);
  }, [pR, wheelDone]);

  const spin = (n) => {
    if (spinning) return;
    const cols = wheelColours(sectors);
    const weights = [sectors.rouge, sectors.bleu, 12 - sectors.rouge - sectors.bleu];
    const names = ['rouge', 'bleu', 'vert'];
    const counts = { ...spins.counts };
    let last = null;
    for (let i = 0; i < n; i += 1) { last = names[drawIndex(rngRef.current, weights)]; counts[last] += 1; }
    const next = { counts, n: spins.n + n, last };
    const finish = () => { setSpins(next); setSpinning(false); reactRef.current?.(true); };
    if (reduce) { finish(); return; }
    setSpinning(true);
    timer.current = setTimeout(finish, SPIN_MS);
    void cols;
  };

  const expected120 = N_SPINS / 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le labo des situations"
      moduleSubtitle="Une roue, une usine, un tirage au sort : la probabilité en situation."
      estimatedTime="12 min"
      brief={{
        tag: '🎡 Mission 06',
        title: 'La roue de la kermesse',
        tone: 'rose',
        body: (
          <p>
            La roue a 12 secteurs égaux. On veut qu’un joueur gagne (secteur rouge) avec une probabilité de{' '}
            <strong>1/3</strong>. Règle la roue, puis fais-la tourner.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Règle la roue',
          subtitle: 'Objectif : P(rouge) = 1/3. Puis tourne 120 fois.',
          done: wheelDone && spins.n >= N_SPINS,
          content: (
            <div className="space-y-3">
              <SpinnerWheel sectors={sectors} onChange={(s) => { setSectors(s); setChanges((c) => c + 1); }} disabled={wheelDone}
                showProbability={wheelDone} spins={wheelDone ? spins : null} onSpin={wheelDone ? spin : null} spinning={spinning} caption="La roue" />
              {!wheelDone && (
                <Feedback tone="info">
                  Pour l’instant, P(rouge) = <strong>{sectors.rouge}/12</strong>. Un tiers de 12 secteurs, c’est combien de secteurs ?
                  {changes >= 6 && (
                    <> <button type="button" onClick={() => setSectors({ rouge: 4, bleu: Math.min(sectors.bleu, 8) })} className="underline font-semibold text-rose-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Je ne trouve pas — montre-moi</button></>
                  )}
                </Feedback>
              )}
              {wheelDone && spins.n < N_SPINS && (
                <Feedback tone="ok">
                  4 secteurs rouges sur 12 : P(rouge) = 4/12 = 1/3. La probabilité est la <strong>part de la roue</strong> —
                  proportionnelle à l’angle : 120° sur 360°. Tourne la roue 120 fois : combien de rouges attends-tu ?
                </Feedback>
              )}
              {spins.n >= N_SPINS && (
                <Feedback tone="ok">
                  Sur {formatDec(spins.n)} tours : <strong>{formatDec(spins.counts.rouge)} rouges</strong> ({formatPct(spins.counts.rouge / spins.n, spins.n)}) ; attendu :
                  environ {formatDec(expected120)} (1/3). Encore une fois, la fréquence tourne autour de la probabilité.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le contrôle qualité',
          subtitle: 'Quand on ne connaît pas le modèle, la fréquence sert d’estimation.',
          done: qc1 && qc2,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                prompt="Une usine contrôle 500 pièces : 15 sont défectueuses. Quelle est la fréquence de pièces défectueuses, en pourcentage ?"
                suffix="%"
                expected={3}
                parse={parseDec}
                display="3 %"
                explain="15 ÷ 500 = 0,03 = 3 %. Comme on ne connaît pas la « vraie » probabilité qu’une pièce soit défectueuse, on l’ESTIME par cette fréquence : P ≈ 0,03."
                explainFor={(n) => {
                  if (n === 15) return '15 est l’effectif. La fréquence, c’est 15 sur 500 = 3 %.';
                  if (n === 0.03) return '0,03 est la fréquence en écriture décimale ; en pourcentage, 3 %.';
                  if (n === 30) return '15 ÷ 500 = 0,03, soit 3 %, pas 30 %.';
                  return null;
                }}
                solved={qc1}
                onAnswered={() => setQc1(true)}
              />
              {qc1 && (
                <NumericQuestion
                  prompt="En prenant P ≈ 0,03, combien de pièces défectueuses faut-il prévoir dans une production de 3 000 pièces ?"
                  expected={90}
                  parse={parseDec}
                  display="90"
                  explain="0,03 × 3 000 = 90 pièces défectueuses, environ. La probabilité estimée sert à PRÉVOIR — avec une marge, puisque c’est aléatoire."
                  explainFor={(n) => {
                    if (n === 9) return '3 % de 3 000, c’est 3 000 × 3/100 = 90 (pas 9).';
                    if (n === 900) return '3 % de 3 000, c’est 90 — 900 serait 30 %.';
                    return null;
                  }}
                  solved={qc2}
                  onAnswered={() => setQc2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le tirage au sort',
          subtitle: 'Une classe de 25 élèves, dont 10 filles. On tire un nom au hasard.',
          done: classDone && class2Done,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Quelle est la probabilité que ce soit une fille ?"
                options={['$\\frac{10}{25} = \\frac{2}{5}$', '$\\frac{10}{15}$', '$\\frac{1}{2}$', '$\\frac{1}{10}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                correctionLabel="10/25 = 2/5"
                correct={0}
                cols={2}
                explain="10 filles sur 25 élèves : P = 10/25 = 2/5 = 0,4. Deux catégories (fille / garçon) ne donnent PAS 1/2 chacune : ce sont les élèves qui ont la même chance, pas les catégories."
                solved={classDone}
                onAnswered={() => setClassDone(true)}
              />
              {classDone && (
                <TapQuestion
                  prompt="La première élève tirée est une fille ; elle ne rejoue pas. On tire un second nom. Quelle est maintenant la probabilité de tirer une fille ?"
                  options={['$\\frac{9}{24} = \\frac{3}{8}$', '$\\frac{10}{25}$', '$\\frac{10}{24}$', '$\\frac{9}{25}$']}
                  renderOption={(o) => <MathText>{o}</MathText>}
                  correctionLabel="9/24 = 3/8"
                  correct={0}
                  cols={2}
                  explain="Il reste 9 filles parmi 24 élèves : P = 9/24 = 3/8. Le MODÈLE a changé (une élève de moins), donc la probabilité aussi — contrairement au dé, qui repart à zéro à chaque lancer."
                  solved={class2Done}
                  onAnswered={() => setClass2Done(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Vrai ou faux ?',
          subtitle: 'Les phrases qu’on entend — et ce qu’elles valent.',
          done: vfDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'a', label: '« P(pluie) = 0,9, donc il va pleuvoir, c’est sûr. »', options: ['Vrai', 'Faux'], correct: 1, correction: 'Probable, pas certain : certain, c’est 1.' },
                { id: 'b', label: '« Une pièce tombe sur pile ou face, donc P(pile) = 1/2 même si la pièce est truquée. »', options: ['Vrai', 'Faux'], correct: 1, correction: '1/2 suppose deux faces de même chance.' },
                { id: 'c', label: '« 6 piles sur 10 lancers prouvent que la pièce est truquée. »', options: ['Vrai', 'Faux'], correct: 1, correction: 'Sur 10 lancers, 6 piles sont ordinaires.' },
                { id: 'd', label: '« Avec P(gagner) = 1/50, sur 5 000 tickets on attend environ 100 gagnants. »', options: ['Vrai', 'Faux'], correct: 0, correction: '5 000 ÷ 50 = 100.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Une probabilité décrit un modèle et prévoit une tendance sur
                  beaucoup d’essais ; elle ne dit jamais ce que donnera UN essai, et une petite série ne prouve rien.
                </Feedback>
              )}
              solved={vfDone}
              onAnswered={() => setVfDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Roue, usine, classe : la même idée partout. Compter les issues favorables sur les issues possibles quand
          elles ont la même chance ; estimer par une fréquence quand on ne connaît pas le modèle ; et toujours
          prévoir <em>environ</em> P × n. Place au tournoi final.
        </Feedback>
      }
    />
  );
}
