import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
 * Formalization: « moyenne » est posée par une <KnowledgeBrick> à l'instant où
 *   le pivot s'équilibre, et la formule somme ÷ effectif par une seconde brique
 *   à l'étape 2, comme moyen de CALCULER ce point déjà trouvé. Ce module ne dit
 *   rien de la médiane ni du mode : ils n'existent pas encore pour l'élève
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
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
              {!done1 && (
              <Feedback tone="info">
                {gap > 0 ? (
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
              )}
              {done1 && (
                <KnowledgeBrick
                  id="moyenne"
                  variant="new"
                  lead={(
                    <>
                      {revealed ? 'On te le montre : ' : 'Équilibre atteint. '}
                      le pivot est en <strong>{formatDec(M)} min</strong>, et là seulement les écarts
                      de gauche compensent exactement ceux de droite. Ce point porte un nom.
                    </>
                  )}
                />
              )}
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
            <KnowledgeBrick
              id="calcul-moyenne"
              variant="new"
              lead="Glisser un pivot marche sur six valeurs. Sur trois cents, il faut pouvoir le calculer."
            >
              <NumericQuestion
                prompt="Applique la formule à tes six trajets. Que trouves-tu ?"
                above={
                  <div className="rounded-xl bg-white border border-slate-200 p-3 text-center font-mono text-sm">
                    {EQUILIBRE.join(' + ')} = {formatDec(sum(EQUILIBRE))} &nbsp;·&nbsp; effectif = {total(EQUILIBRE)}
                  </div>
                }
                expected={M}
                parse={parseDec}
                display={formatDec(M)}
                suffix="min"
                requires={['calcul-moyenne', 'moyenne', 'calcul-numerique']}
                explain={`${formatDec(sum(EQUILIBRE))} ÷ ${total(EQUILIBRE)} = ${formatDec(M)} min — exactement le pivot que tu as trouvé à la main. La division n'invente rien : elle CALCULE le point d'équilibre.`}
                explainFor={(n) => {
                  if (n === sum(EQUILIBRE)) return 'Tu as donné la somme. Il reste à la diviser par l’effectif, ici 6.';
                  if (n === total(EQUILIBRE)) return 'Tu as donné l’effectif. C’est le diviseur, pas le résultat.';
                  return null;
                }}
                solved={calcDone}
                onAnswered={(ok) => { setCalcDone(true); kit.react(ok); }}
              />
            </KnowledgeBrick>
          ),
        },
        {
          num: 3,
          title: 'Ce que la moyenne dit — et ne dit pas',
          done: senseDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="La moyenne des trajets vaut 15 min. Qu’est-ce que cela signifie ?"
                options={[
                  'Si tous les élèves mettaient le même temps, ce serait 15 min',
                  'La moitié des élèves mettent moins de 15 min',
                  'C’est le temps qui revient le plus souvent dans la classe',
                  'Au moins un élève met exactement 15 min',
                ]}
                correct={0}
                cols={1}
                requires={['moyenne', 'calcul-moyenne']}
                explain="La moyenne répartit équitablement : c’est le temps que chacun mettrait si le total était partagé également entre les six élèves."
                explainWrong="Reviens à la planche : le pivot est le point d’équilibre des écarts. Compter les élèves de part et d’autre, ou chercher le temps qui revient le plus souvent, c’est répondre à une autre question — la moyenne, elle, égalise."
                solved={senseDone}
                onAnswered={() => setSenseDone(true)}
              />
              {senseDone && (
                <KnowledgeBrick
                  id="mem-ce-que-la-moyenne-ne-dit-pas"
                  variant="new"
                  lead="Trois des quatre réponses étaient fausses pour la même raison : elles font dire à la moyenne ce qu’elle ne dit pas."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          Un seul nombre pour toute la série — mais il se laisse tirer par les valeurs
          éloignées. Le module suivant en cherche un autre, qui résiste.
        </KnowledgeSnapshot>
      }
    />
  );
}
