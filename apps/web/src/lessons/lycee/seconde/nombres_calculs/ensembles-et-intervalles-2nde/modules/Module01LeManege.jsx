import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalFilter from '../components/IntervalFilter';
import PredictionChips from '../components/PredictionChips';
import { contains, notation } from '../components/intervalUtils';

/**
 * Module 1 — TRIGGER : « Le panneau du manège » (manipulation signature).
 *
 * Activity: tester des tailles contre le panneau « à partir de 1,20 m,
 *   moins de 1,90 m », puis retourner les crochets, puis lire l'écriture.
 * Mathematical objective: faire vivre qu'une plage contient TOUS les
 *   nombres entre ses bornes, et que le sort de chaque borne se décide à part.
 * Student action: prédire pour 1,90 (sans verdict) ; taper des tailles ;
 *   retourner un crochet ; reconnaître l'écriture.
 * Controlled variable: le nombre testé, puis l'inclusion des bornes.
 * Mathematical state: { lo: 1,2, hi: 1,9, openLo, openHi } + `tests`.
 * Visual consequence: chaque taille se pose sur la droite, pleine et verte
 *   ou creuse et rouge ; retourner un crochet recolore les bornes testées.
 * Expected observation (l'aha, jamais énoncé avant) : 1,899 passe et 1,90
 *   non ; il y a une infinité de tailles entre 1,20 et 1,90 ; « à partir
 *   de » et « moins de » ne disent pas la même chose pour la borne.
 * Misconception targeted: « la borne est toujours acceptée » ; « les tailles
 *   possibles, c'est une par centimètre ».
 * Feedback: les points et la liste des verdicts, puis la prédiction citée.
 * Formalization: la notation [1,2 ; 1,9[ apparaît en conclusion (étape 4) ;
 *   le mot « intervalle » et les types sont laissés aux modules 2–3.
 * Scaffolding: bornes fixes (1–2), crochets libres (3), lecture (4).
 * Transfer: le filtre revient avec deux attractions au module 6.
 */
const START = { lo: 1.2, hi: 1.9, openLo: false, openHi: true };
const CHIPS = [1.2, 1.5, 1.89, 1.899, 1.9, 2.05];

export default function Module01LeManege() {
  const [prediction, setPrediction] = useState(null);
  const [filter, setFilter] = useState(START);
  const [tests, setTests] = useState([]);
  const [countDone, setCountDone] = useState(false);
  const [readDone, setReadDone] = useState(false);

  const testedBounds = tests.includes(1.9) && tests.includes(1.2);
  const enoughTests = tests.length >= 4 && (testedBounds || tests.length >= 6);
  const flipped = filter.openLo && !filter.openHi;
  const I = { from: filter.lo, to: filter.hi, openFrom: filter.openLo, openTo: filter.openHi };

  const addTest = (n) => {
    if (tests.length >= 12 || tests.includes(n)) return;
    setTests([...tests, n]);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le panneau du manège"
      moduleSubtitle="« À partir de 1,20 m, moins de 1,90 m. » Teste des tailles : qui passe, qui reste dehors ?"
      estimatedTime="8 min"
      brief={{
        tag: '🎡 Mission 01',
        title: 'Le forain a affiché : « Taille : à partir de 1,20 m, et moins de 1,90 m ».',
        tone: 'indigo',
        body: (
          <p>
            Léa mesure exactement 1,90 m. Son petit frère 1,20 m. Sa cousine 1,899 m. Qui monte ? Ne réponds pas
            de tête : teste-les sur le panneau.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Teste des tailles',
          subtitle: 'Touche une taille, ou tape la tienne. Teste au moins 1,20 et 1,90.',
          done: enoughTests && countDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                prompt="Léa mesure exactement 1,90 m : elle passe ?"
                options={[{ id: 'passe', label: 'Elle passe' }, { id: 'refusee', label: 'Elle est refusée' }]}
                value={prediction}
                onChange={setPrediction}
                disabled={enoughTests}
              />
              <IntervalFilter
                value={filter}
                onChange={setFilter}
                tests={tests}
                onTest={(n) => { addTest(n); if (n === 1.9 || n === 1.2) kit.react(true); }}
                chips={CHIPS}
                min={1} max={2.2} step={0.1} snap={0.05}
                unit="m"
                editable={{ brackets: false, bounds: false }}
              />
              {!enoughTests && (
                <Feedback tone="info">
                  {tests.length === 0 ? 'Commence par une taille : 1,90 par exemple.' : `${tests.length} taille${tests.length > 1 ? 's' : ''} testée${tests.length > 1 ? 's' : ''} — continue, et n’oublie pas 1,20 et 1,90.`}
                </Feedback>
              )}
              {enoughTests && (
                <>
                  <Feedback tone={contains(I, 1.9) ? 'ok' : 'info'}>
                    {prediction === 'refusee'
                      ? 'Ta prédiction : Léa est refusée. Le panneau confirme : 1,90 est refusé — « moins de 1,90 » exclut 1,90 lui-même.'
                      : prediction === 'passe'
                      ? 'Ta prédiction : Léa passe. Le panneau te contredit : « moins de 1,90 » exclut 1,90 lui-même. 1,899 passe, pas 1,90.'
                      : 'Le panneau tranche : 1,90 est refusé — « moins de 1,90 » exclut 1,90 lui-même. 1,899 passe, pas 1,90.'}{' '}
                    Et 1,20 passe : « à partir de » inclut la borne.
                  </Feedback>
                  <TapQuestion
                    prompt="Combien de tailles différentes peuvent passer entre 1,20 m et 1,90 m ?"
                    options={['70 : une par centimètre', '700 : une par millimètre', 'Une infinité']}
                    cols={1}
                    correct={2}
                    explain="Entre deux tailles, il y en a toujours une autre : 1,895, puis 1,8999, puis 1,89999… La plage contient TOUS les nombres entre ses bornes, pas seulement ceux qu’on sait mesurer."
                    explainWrong="Une taille n’est pas forcément un nombre « rond » : 1,895 m est une taille, 1,8999 m aussi. Entre deux nombres, il y en a toujours un troisième — la plage en contient une infinité."
                    solved={countDone}
                    onAnswered={() => setCountDone(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Change le panneau',
          subtitle: 'Fais passer 1,90 m et refuser 1,20 m — sans déplacer les bornes.',
          done: flipped,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche une borne pour la rendre <strong>incluse</strong> ou <strong>exclue</strong>. Regarde les points déjà testés changer de couleur.
              </p>
              <IntervalFilter
                value={filter}
                onChange={(next) => { setFilter(next); if (next.openLo && !next.openHi) kit.react(true); }}
                tests={tests}
                chips={CHIPS}
                onTest={addTest}
                min={1} max={2.2} step={0.1} snap={0.05}
                unit="m"
                editable={{ brackets: true, bounds: false }}
              />
              {flipped ? (
                <Feedback tone="ok">
                  Les mêmes bornes, deux panneaux différents : maintenant 1,90 passe et 1,20 est refusé. Ce qui a changé, ce n’est pas la plage, c’est le sort de chaque <strong>borne</strong>.
                </Feedback>
              ) : (
                <Feedback tone="info">
                  Le panneau devient : 1,20 {filter.openLo ? 'exclu' : 'inclus'}, 1,90 {filter.openHi ? 'exclu' : 'inclus'}.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Comment l’écrire d’un coup ?',
          done: readDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Les mathématiciens écrivent la plage avec ses deux bornes et deux crochets : le crochet est{' '}
                <strong>tourné vers le nombre</strong> quand la borne est incluse, <strong>tourné vers l’extérieur</strong> quand elle est exclue.
                Ton panneau modifié s’écrit : <span className="font-mono font-bold text-slate-900">{notation(I)}</span>.
              </p>
              <TapQuestion
                prompt="Et le panneau d’origine du forain (1,20 inclus, 1,90 exclu) ?"
                options={['[1,2 ; 1,9[', ']1,2 ; 1,9]', '[1,2 ; 1,9]', ']1,2 ; 1,9[']}
                cols={2}
                correct={0}
                explain="[1,2 : crochet tourné vers 1,2, la borne est incluse (« à partir de »). 1,9[ : crochet tourné vers l’extérieur, 1,9 est exclu (« moins de »)."
                explainWrong="Regarde le sens de chaque crochet : vers le nombre = inclus, vers l’extérieur = exclu. « À partir de 1,20 » inclut 1,20 ; « moins de 1,90 » exclut 1,90 : [1,2 ; 1,9[."
                solved={readDone}
                onAnswered={() => setReadDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Une plage de nombres, deux bornes, et pour chaque borne une décision : incluse ou exclue. Cet ensemble a un nom et quatre visages — c’est ce que le module 3 va nommer. Mais d’abord : c’est quoi, exactement, « un ensemble » ?
        </Feedback>
      }
    />
  );
}
