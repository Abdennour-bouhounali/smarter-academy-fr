import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IntervalBuilder from '../components/IntervalBuilder';
import InequalityComposer from '../components/InequalityComposer';
import BuildCheck from '../components/BuildCheck';
import { interval, notation, inequality, sameInterval } from '../components/intervalUtils';

/**
 * Module 4 — MANIPULATION : « Inégalité ou intervalle ? ».
 *
 * Activity: traduire une double inégalité en intervalle (bande + crochets),
 *   puis un intervalle en double inégalité (deux signes à choisir), puis
 *   déjouer le piège du sens, puis construire avec des décimaux.
 * Mathematical objective: −1 < x ≤ 4 et ]−1 ; 4] décrivent le MÊME ensemble ;
 *   < ↔ crochet ouvert, ≤ ↔ crochet fermé ; x ≤ 3 est du côté de −∞.
 * Student action: régler bornes/crochets ; toucher un signe ; choisir.
 * Controlled variable: l'intervalle construit ; les deux signes.
 * Mathematical state: intervalle (module) ; { leftStrict, rightStrict }.
 * Visual consequence: la bande et, à la validation, l'inégalité miroir.
 * Expected observation: « strictement » = crochet ouvert ; « x ≤ 3 » colorie
 *   vers la gauche, pas vers la droite.
 * Misconception targeted: « x ≤ 3 → [3 ; +∞[ », « ≤ ↔ crochet ouvert ».
 */
const T1 = interval(-1, 4, true, false);      // −1 < x ≤ 4
const T2 = interval(-3, 2, false, true);      // [−3 ; 2[  → −3 ≤ x < 2
const T4 = interval(2.5, 4, false, true);     // 2,5 ≤ L < 4

export default function Module04InegaliteOuIntervalle() {
  const [b1, setB1] = useState(interval(-5, 5));
  const [g1, setG1] = useState(null);
  const [d1, setD1] = useState(false);
  const [signs, setSigns] = useState({ leftStrict: true, rightStrict: true });
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);
  const [b4, setB4] = useState(interval(0, 6));
  const [g4, setG4] = useState(null);
  const [d4, setD4] = useState(false);
  const [d5, setD5] = useState(false);

  const signsRight = () => signs.leftStrict === T2.openFrom && signs.rightStrict === T2.openTo;
  const signsText = () => `−3 ${signs.leftStrict ? '<' : '≤'} x ${signs.rightStrict ? '<' : '≤'} 2`;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Inégalité ou intervalle ?"
      moduleSubtitle="« −1 < x ≤ 4 » et « ]−1 ; 4] » disent la même chose. Passe de l’un à l’autre dans les deux sens."
      estimatedTime="10 min"
      brief={{
        tag: '🔁 Mission 04',
        title: 'Deux langues pour un même ensemble : les inégalités, et les crochets.',
        tone: 'indigo',
        body: <p>Traduis dans un sens, puis dans l’autre. Le piège classique t’attend à l’étape 3.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Les nombres x tels que −1 < x ≤ 4',
          subtitle: 'Construis cet ensemble sur la droite.',
          done: d1,
          content: (
            <div className="space-y-3">
              <IntervalBuilder value={b1} onChange={setB1} min={-5} max={6} step={1} showNotation={false} ghost={g1} />
              <BuildCheck
                isRight={() => sameInterval(b1, T1)}
                current={() => `${notation(b1)}, soit ${inequality(b1)}`}
                answer={`${notation(T1)}, soit ${inequality(T1)}`}
                why="« −1 < x » est strict : −1 exclu, crochet ouvert. « x ≤ 4 » est large : 4 inclus, crochet fermé."
                hint={() => 'Un signe < (strict) donne un crochet ouvert ; un signe ≤ (large) donne un crochet fermé.'}
                onDone={() => setD1(true)}
                onReveal={() => setG1(T1)}
                solved={d1}
              />
              {d1 && (
                <KnowledgeBrick
                  id="regle-signe-crochet"
                  variant="new"
                  lead="Tu as choisi un crochet ouvert là où le signe était strict, et fermé là où il était large. Ce n’est pas une coïncidence : c’est la règle."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Dans l’autre sens',
          subtitle: 'Voici [−3 ; 2[. Choisis les deux signes qui le décrivent.',
          done: d2,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                <RealLine min={-5} max={5} step={1} intervals={[{ id: 'I', from: -3, to: 2, openTo: true, tone: 'indigo', label: '[−3 ; 2[' }]} ariaLabel="Intervalle [−3 ; 2[" />
              </div>
              <InequalityComposer a={-3} b={2} value={signs} onChange={setSigns} />
              <BuildCheck
                isRight={signsRight}
                current={signsText}
                answer="−3 ≤ x < 2"
                why="[−3 : −3 inclus, donc ≤. 2[ : 2 exclu, donc <."
                hint={() => 'Le crochet fermé de gauche inclut −3 ; le crochet ouvert de droite exclut 2.'}
                onDone={() => setD2(true)}
                solved={d2}
                label="Valider mes signes"
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le piège du sens',
          done: d3,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="regle-sens-inegalite"
                variant="new"
                lead="Un dernier réflexe avant de te lancer : le signe ne dit pas seulement quel crochet, il dit aussi de quel côté regarder."
              />
              <TapQuestion
                prompt="Les nombres x tels que x ≤ 3 forment l’intervalle :"
                above={(revealed) => revealed && (
                  <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                    <RealLine min={-4} max={6} step={1} intervals={[{ id: 'I', from: -Infinity, to: 3, tone: 'emerald', label: ']−∞ ; 3]' }]} ariaLabel="Demi-droite des nombres inférieurs ou égaux à 3" />
                  </div>
                )}
                options={['[3 ; +∞[', ']−∞ ; 3]', ']−∞ ; 3[', '[3 ; 3]']}
                cols={2}
                correct={1}
                requires={['intervalle', 'regle-signe-crochet', 'regle-sens-inegalite', 'demi-droite-infini']}
                explain="x ≤ 3 : les nombres plus PETITS que 3 (ou égaux). Ils sont à gauche de 3, jusqu’à −∞ : ]−∞ ; 3], avec 3 inclus."
                explainWrong="Lis le signe : x ≤ 3 signifie x plus petit que 3 — on colorie vers la GAUCHE, vers −∞. Et 3 est inclus (≤) : ]−∞ ; 3]."
                solved={d3}
                onAnswered={() => setD3(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Avec des décimaux',
          subtitle: 'Les longueurs L telles que 2,5 ≤ L < 4. Construis l’intervalle.',
          done: d4,
          content: (
            <div className="space-y-3">
              <IntervalBuilder value={b4} onChange={setB4} min={0} max={6} step={0.5} variable="L" showNotation={false} ghost={g4} />
              <BuildCheck
                isRight={() => sameInterval(b4, T4)}
                current={() => notation(b4)}
                answer={`${notation(T4)}, soit ${inequality(T4, 'L')}`}
                why="Les bornes ne sont pas forcément entières : 2,5 inclus (≤), 4 exclu (<)."
                hint={() => 'Amène la borne de gauche sur 2,5 (incluse) et celle de droite sur 4 (exclue).'}
                onDone={() => setD4(true)}
                onReveal={() => setG4(T4)}
                solved={d4}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'Traduire en série',
          done: d5,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="methode-traduire"
                variant="new"
                compact
                lead="Quatre traductions d’affilée : voici la marche à suivre, dans l’ordre où tu viens de l’appliquer."
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Pour chaque inégalité, l’intervalle qui décrit ses solutions.</p>}
                rows={[
                  { id: 'r1', label: 'x > −2', options: [']−2 ; +∞[', '[−2 ; +∞[', ']−∞ ; −2['], correct: 0, correction: 'strict → −2 exclu ; « plus grand » → vers +∞.' },
                  { id: 'r2', label: 'x ≤ 0', options: ['[0 ; +∞[', ']−∞ ; 0]', ']−∞ ; 0['], correct: 1, correction: '« plus petit ou égal » → vers −∞, 0 inclus.' },
                  { id: 'r3', label: '−1 ≤ x ≤ 1', options: ['[−1 ; 1]', ']−1 ; 1[', '[−1 ; 1['], correct: 0, correction: 'deux signes larges → deux crochets fermés.' },
                  { id: 'r4', label: '0 < x < 1', options: ['[0 ; 1]', ']0 ; 1[', ']0 ; 1]'], correct: 1, correction: 'deux signes stricts → deux crochets ouverts.' },
                ]}
                requires={['intervalle', 'regle-signe-crochet', 'regle-sens-inegalite', 'methode-traduire', 'demi-droite-infini']}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre traductions justes.' : `${nCorrect} / ${total}.`} Signe strict ↔ crochet ouvert, signe large ↔ crochet fermé ; « plus petit que » regarde vers −∞, « plus grand que » vers +∞.
                  </Feedback>
                )}
                solved={d5}
                onAnswered={() => setD5(true)}
              />
              {d5 && (
                <KnowledgeBrick
                  id="mem-signe-crochet"
                  variant="new"
                  compact
                  lead="Quatre lignes, une seule correspondance à retenir."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
