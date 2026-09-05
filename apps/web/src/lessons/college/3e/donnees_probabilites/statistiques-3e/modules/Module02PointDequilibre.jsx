import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { mean, balanceGap, sum, total } from '../components/statUtils';
import { EQUILIBRE, AXE } from '../components/trajetData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Le point d'équilibre ».
 *
 * Activity: désigner sur l'axe l'endroit où la série « tient en équilibre »,
 *   avant d'apprendre à le calculer.
 * Mathematical objective: donner un SENS à la moyenne avant sa formule. Elle
 *   est le point où les écarts de part et d'autre se compensent exactement —
 *   pas d'abord le résultat d'une division.
 * Student action: glisser le pivot le long de l'axe.
 * Controlled variable: la position du pivot.
 * Mathematical state: { pick } ; `balanceGap` mesure le déséquilibre, s'annule
 *   à la moyenne, et son SIGNE dit de quel côté pencher. La correction est donc
 *   calculée, jamais écrite en dur.
 * Visual consequence: le triangle ambre se déplace ; le texte annonce de quel
 *   côté la série penche encore.
 * Expected observation: « quand j'y suis, les écarts se compensent ».
 * Misconception targeted: confondre la moyenne avec la valeur du milieu, ou
 *   avec la valeur la plus fréquente.
 * Feedback: le déséquilibre est quantifié et orienté à chaque déplacement ;
 *   échappée après 4 essais.
 * Formalization: la formule somme ÷ effectif arrive à l'étape 3, comme moyen de
 *   CALCULER ce point déjà trouvé.
 * Scaffolding: série courte à moyenne ronde (TRY) → calcul → interprétation.
 * Transfer: le module 4 tire une valeur et regarde ce pivot suivre.
 */

const M = mean(EQUILIBRE);      // exactement 15

export default function Module02PointDequilibre() {
  const [pick, setPick] = useState(5);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [calcDone, setCalcDone] = useState(false);
  const [senseDone, setSenseDone] = useState(false);

  const gap = balanceGap(EQUILIBRE, pick);
  const balanced = gap === 0;
  const done1 = balanced || revealed;

  const move = (v, kit) => {
    if (v === pick) return;
    setPick(v);
    setTries((t) => t + 1);
    if (balanceGap(EQUILIBRE, v) === 0) kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le point d’équilibre"
      moduleSubtitle="Place le pivot là où la série tient en équilibre. C’est la moyenne."
      estimatedTime="9 min"
      brief={{
        tag: '⚖️ Mission 02',
        title: 'Où la série tient-elle en équilibre ?',
        tone: 'indigo',
        body: (
          <p>
            Six trajets sur l’axe. Imagine une planche posée sur un pivot : où faut-il le
            placer pour que rien ne penche ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve le pivot',
          subtitle: 'Glisse le triangle jusqu’à l’équilibre.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <DotPlot
                values={EQUILIBRE}
                min={AXE.min}
                max={AXE.max}
                step={AXE.step}
                mode={done1 ? 'display' : 'pick'}
                pickValue={done1 ? M : pick}
                onPick={(v) => move(v, kit)}
                showMean={done1}
                ariaLabel="Axe : place le pivot d’équilibre de la série"
              />
              <Feedback tone={done1 ? (revealed ? 'info' : 'ok') : 'info'}>
                {done1 ? (
                  <>
                    {revealed ? 'On te le montre : ' : 'Équilibre atteint. '}
                    le pivot est en <strong>{formatDec(M)} min</strong>. Les écarts à gauche
                    compensent exactement ceux de droite — c’est ce qu’on appelle la{' '}
                    <strong>moyenne</strong>.
                  </>
                ) : gap > 0 ? (
                  <>
                    La série penche <strong>à droite</strong> : il reste{' '}
                    {formatDec(gap)} d’écart en trop de ce côté. Déplace le pivot vers la droite.
                  </>
                ) : (
                  <>
                    La série penche <strong>à gauche</strong> : il reste{' '}
                    {formatDec(Math.abs(gap))} d’écart en trop de ce côté. Déplace le pivot vers la gauche.
                  </>
                )}
              </Feedback>
              {!done1 && tries >= 4 && (
                <button
                  type="button"
                  onClick={() => { setPick(M); setRevealed(true); kit.react(false); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  Je ne trouve pas — montre-moi le pivot
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Comment le calculer ?',
          done: calcDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Additionne les six trajets, puis divise par leur nombre. Que trouves-tu ?"
              above={
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
                  {EQUILIBRE.join(' + ')} = {formatDec(sum(EQUILIBRE))} &nbsp;·&nbsp; effectif = {total(EQUILIBRE)}
                </div>
              }
              expected={M}
              parse={parseDec}
              display={formatDec(M)}
              suffix="min"
              explain={`${formatDec(sum(EQUILIBRE))} ÷ ${total(EQUILIBRE)} = ${formatDec(M)} min — exactement le pivot que tu as trouvé. La division n'invente rien : elle CALCULE le point d'équilibre.`}
              explainFor={(n) => {
                if (n === sum(EQUILIBRE)) return 'Tu as donné la somme. Il reste à la diviser par l’effectif, ici 6.';
                if (n === total(EQUILIBRE)) return 'Tu as donné l’effectif. C’est le diviseur, pas le résultat.';
                return null;
              }}
              solved={calcDone}
              onAnswered={(ok) => { setCalcDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Ce que la moyenne dit — et ne dit pas',
          done: senseDone,
          content: (
            <TapQuestion
              prompt="La moyenne des trajets vaut 15 min. Qu’est-ce que cela signifie ?"
              options={[
                'Si tous les élèves mettaient le même temps, ce serait 15 min',
                'La moitié des élèves mettent moins de 15 min',
                'C’est le temps le plus fréquent dans la classe',
                'C’est le temps du milieu de la liste',
              ]}
              correct={0}
              cols={1}
              explain="La moyenne répartit équitablement : c’est le temps que chacun mettrait si le total était partagé également. Elle ne dit rien du nombre d’élèves en dessous, ni de la valeur la plus fréquente — ce sont d’autres indicateurs."
              explainWrong="« La moitié en dessous » décrit la médiane ; « le plus fréquent » décrit le mode. La moyenne, elle, égalise."
              solved={senseDone}
              onAnswered={() => setSenseDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> La moyenne est le point d’équilibre de la série, et se
          calcule en divisant la <strong>somme</strong> des valeurs par leur{' '}
          <strong>effectif</strong>.
        </Feedback>
      }
    />
  );
}
