import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DotPlot from '../components/DotPlot';
import { median, range, sortSeries, mean } from '../components/statUtils';
import { TRAJETS, AXE } from '../components/trajetData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 3 — DÉCOUVERTE : « La valeur du milieu ».
 *
 * Activity: désigner la valeur qui coupe la série en deux moitiés égales, puis
 *   mesurer l'écart entre les extrêmes.
 * Mathematical objective: la médiane partage l'effectif, pas les valeurs. Sur
 *   un effectif pair, elle tombe ENTRE deux données et n'appartient donc pas
 *   forcément à la série.
 * Student action: désigner la médiane sur l'axe, puis lire l'étendue.
 * Controlled variable: la valeur désignée.
 * Mathematical state: `median` et `range` dérivent de la série ; la correction
 *   ne peut pas diverger du dessin.
 * Visual consequence: le trait vert coupe les piles en deux paquets de six ;
 *   le crochet violet mesure l'écart des extrêmes.
 * Expected observation: « six à gauche, six à droite ».
 * Misconception targeted: prendre la valeur du milieu de la LISTE non triée ;
 *   croire que la médiane est toujours une donnée de la série ; confondre
 *   étendue et effectif.
 * Feedback: le décompte de part et d'autre est annoncé à chaque essai.
 * Formalization: chaque mot est posé par une <KnowledgeBrick> après son geste
 *   et AVANT la demande qui l'exige. C'est ce que ce module corrigeait : « Quelle
 *   est l'ÉTENDUE de la série ? » était la toute première apparition du mot,
 *   dans la demande elle-même — l'élève devait deviner ce qu'on lui demandait.
 *   La brique « étendue » précède désormais la question, juste après que le
 *   crochet violet a été montré sur l'axe.
 * Scaffolding: effectif pair (le cas subtil) traité d'emblée, avec le décompte
 *   visible en permanence.
 * Transfer: le module 4 oppose médiane et moyenne sous la même manipulation.
 */

const SORTED = sortSeries(TRAJETS);
const MED = median(TRAJETS);
const RNG = range(TRAJETS);

export default function Module03ValeurDuMilieu() {
  const [pick, setPick] = useState(5);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pairDone, setPairDone] = useState(false);
  const [rangeDone, setRangeDone] = useState(false);
  const [senseDone, setSenseDone] = useState(false);

  const below = TRAJETS.filter((v) => v < pick).length;
  const above = TRAJETS.filter((v) => v > pick).length;
  const found = pick === MED;
  const done1 = found || revealed;

  const move = (v, kit) => {
    if (v === pick) return;
    setPick(v);
    setTries((t) => t + 1);
    if (v === MED) kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La valeur du milieu"
      moduleSubtitle="Autant au-dessus qu’en dessous : la médiane, et l’écart entre les extrêmes."
      estimatedTime="9 min"
      brief={{
        tag: '✂️ Mission 03',
        title: 'Couper la classe en deux',
        tone: 'indigo',
        body: (
          <p>
            Douze trajets. Trouve le temps qui sépare la classe en deux moitiés : autant
            d’élèves plus rapides que d’élèves plus lents.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Coupe la série en deux',
          subtitle: 'Déplace le repère jusqu’à l’équilibre des effectifs.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <DotPlot
                values={TRAJETS}
                min={AXE.min}
                max={AXE.max}
                step={AXE.step}
                mode={done1 ? 'display' : 'pick'}
                pickValue={done1 ? MED : pick}
                onPick={(v) => move(v, kit)}
                showMedian={done1}
                ariaLabel="Axe : place le repère qui coupe la série en deux"
              />
              {!done1 && (
                <Feedback tone="info">
                  Avec un repère à {formatDec(pick)} min : <strong>{below}</strong> élève
                  {below > 1 ? 's' : ''} en dessous, <strong>{above}</strong> au-dessus.
                  {below !== above && <> Il faut équilibrer les deux.</>}
                </Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="mediane"
                  variant="new"
                  lead={(
                    <>
                      {revealed ? 'On te la montre : ' : 'Trouvée. '}
                      le repère est à <strong>{formatDec(MED)} min</strong> : six élèves en dessous,
                      six au-dessus. Cette valeur de coupure porte un nom.
                    </>
                  )}
                />
              )}
              {!done1 && tries >= 4 && (
                <button
                  type="button"
                  onClick={() => { setPick(MED); setRevealed(true); kit.react(false); }}
                  className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  Je ne trouve pas — montre-moi la médiane
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le cas de l’effectif pair',
          done: pairDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Quatre temps : 4, 6, 9 et 11 minutes. Quelle est la médiane ?"
                options={[
                  '7,5 min — le milieu entre 6 et 9',
                  '6 min — la deuxième valeur',
                  '9 min — la troisième valeur',
                  'Il n’y en a pas, l’effectif est pair',
                ]}
                correct={0}
                cols={1}
                requires={['mediane', 'serie-statistique']}
                explain="Aucune des quatre données ne se trouve exactement au milieu : la coupure tombe entre 6 et 9, et on prend le milieu de ces deux valeurs, (6 + 9) ÷ 2 = 7,5."
                explainWrong="Range les quatre valeurs : les deux du milieu sont 6 et 9. La coupure qui laisse deux élèves de chaque côté se place entre elles."
                solved={pairDone}
                onAnswered={() => setPairDone(true)}
              />
              {pairDone && (
                <KnowledgeBrick
                  id="mediane-effectif-pair"
                  variant="new"
                  lead="Douze trajets, quatre temps : dans les deux cas l’effectif est pair. Voici la méthode, une fois pour toutes."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'De l’un à l’autre extrême',
          done: rangeDone,
          content: (kit) => (
            <div className="space-y-3">
              <DotPlot
                values={TRAJETS}
                min={AXE.min}
                max={AXE.max}
                step={AXE.step}
                mode="display"
                showRange
                rangeUnnamed
                ariaLabel="Axe : le crochet qui va du trajet le plus court au plus long"
              />
              <KnowledgeBrick
                id="etendue"
                variant="new"
                lead={(
                  <>
                    Le crochet violet va du trajet le plus court, {formatDec(Math.min(...TRAJETS))} min,
                    au plus long, {formatDec(Math.max(...TRAJETS))} min. Cet écart-là mesure autre chose
                    que la médiane, et il a son propre nom.
                  </>
                )}
              >
                <NumericQuestion
                  prompt="Calcule l’étendue de la série des trajets."
                  expected={RNG}
                  parse={parseDec}
                  display={formatDec(RNG)}
                  suffix="min"
                  requires={['etendue', 'serie-statistique']}
                  explain={`${formatDec(Math.max(...TRAJETS))} − ${formatDec(Math.min(...TRAJETS))} = ${formatDec(RNG)} min. C'est un ÉCART, pas une valeur typique : il dit à quel point la classe est dispersée.`}
                  explainFor={(n) => {
                    if (n === Math.max(...TRAJETS)) return 'Tu as donné le trajet le plus long. L’étendue est l’ÉCART entre le plus long et le plus court, donc une soustraction.';
                    if (n === 12) return 'Douze est l’effectif de la classe, pas un écart de temps.';
                    return null;
                  }}
                  solved={rangeDone}
                  onAnswered={(ok) => { setRangeDone(true); kit.react(ok); }}
                />
              </KnowledgeBrick>
            </div>
          ),
        },
        {
          num: 4,
          title: 'Que mesure cet écart ?',
          done: senseDone,
          content: (
            <TapQuestion
              prompt="Deux classes ont la même moyenne, mais l’une a une étendue de 4 min et l’autre de 30 min. Que peut-on en dire ?"
              requires={['etendue', 'moyenne']}
              options={[
                'Dans la seconde, les trajets sont beaucoup plus dispersés',
                'La seconde classe a plus d’élèves',
                'La seconde classe met plus de temps en moyenne',
                'Les deux classes sont identiques',
              ]}
              correct={0}
              cols={1}
              explain="L’étendue mesure l’écart entre les cas extrêmes, donc la DISPERSION. Deux séries de même moyenne peuvent être très resserrées ou très étalées : la moyenne seule ne le dit pas."
              explainWrong="L’étendue ne renseigne ni sur l’effectif ni sur la moyenne : elle ne parle que de l’écart entre le plus petit et le plus grand."
              solved={senseDone}
              onAnswered={() => setSenseDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          Trois nombres résument maintenant la même série — et ils ne tombent pas au même
          endroit. Le module suivant tire une seule valeur pour voir lequel bouge.
        </KnowledgeSnapshot>
      }
    />
  );
}
