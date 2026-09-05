import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ImplicationLab from '../components/ImplicationLab';
import PredictionChips from '../components/PredictionChips';
import { prop } from '../components/logicUtils';

/**
 * Module 4 — MANIPULATION : « Équivalence ».
 * Activity: tester les deux sens de « x = 3 ⇔ x² = 9 » sur un domaine
 *   contenant −3 ; puis la version corrigée ; puis un couple équivalent.
 * Mathematical objective: P ⇔ Q signifie que les DEUX implications tiennent ;
 *   il suffit d'un contre-exemple dans un seul sens pour la briser.
 * Misconception targeted: « x² = 9 donc x = 3 » (l'oubli de −3) ;
 *   « équivalent = ressemblant ».
 */
const T3 = prop('t3', 'x = 3', (x) => x === 3);
const SQ = prop('sq', 'x² = 9', (x) => x * x === 9);
const T3B = prop('t3b', 'x = 3 ou x = −3', (x) => x === 3 || x === -3);
const DOM = [-3, -1, 0, 1.5, 3, 9];

export default function Module04Equivalence() {
  const [prediction, setPrediction] = useState(null);
  const [dir, setDir] = useState('PQ');
  const [seen, setSeen] = useState(() => new Set(['PQ']));
  const [breakDone, setBreakDone] = useState(false);
  const [dir2, setDir2] = useState('PQ');
  const [seen2, setSeen2] = useState(() => new Set(['PQ']));
  const [fixDone, setFixDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const set = (d) => { setDir(d); const s = new Set(seen); s.add(d); setSeen(s); };
  const set2 = (d) => { setDir2(d); const s = new Set(seen2); s.add(d); setSeen2(s); };
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Équivalence"
      moduleSubtitle="Deux implications, deux sens. « x² = 9 ⇔ x = 3 » : cherche l’oublié."
      estimatedTime="10 min"
      brief={{ tag: '↔️ Mission 04', title: 'Une équivalence, c’est deux implications d’un coup. Encore faut-il que les deux tiennent.', tone: 'indigo', body: <p>Teste chaque sens séparément, sur un domaine qui contient les négatifs.</p> }}
      steps={[
        {
          num: 1, title: 'x = 3 et x² = 9', subtitle: 'Teste les deux sens.', done: seen.size >= 2 && breakDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="« x = 3 » et « x² = 9 » disent-elles la même chose ?" options={[{ id: 'oui', label: 'Oui, c’est équivalent' }, { id: 'non', label: 'Non, un sens cloche' }]} value={prediction} onChange={setPrediction} disabled={seen.size >= 2} />
              <ImplicationLab P={T3} Q={SQ} domain={DOM} direction={dir} onDirection={(d) => { set(d); if (d === 'QP') kit.react(true); }} />
              {seen.size >= 2 && (
                <TapQuestion prompt="Pourquoi « x² = 9 ⇔ x = 3 » est-elle fausse ?" options={['Parce que le sens « x² = 9 ⇒ x = 3 » tombe sur −3 : (−3)² = 9 mais −3 ≠ 3', 'Parce que 9 n’est pas un carré', 'Parce que les deux sens sont faux']} cols={1} correct={0}
                  explain={<>{prediction === 'non' ? 'Ta prédiction : un sens cloche. Exact' : prediction === 'oui' ? 'Ta prédiction : équivalent. Le laboratoire te contredit' : 'Le laboratoire tranche'} : « x = 3 ⇒ x² = 9 » tient (aucun cas interdit), mais la réciproque tombe sur −3. Une équivalence exige les DEUX sens.</>}
                  explainWrong="Le sens « x = 3 ⇒ x² = 9 » est parfaitement vrai. C’est l’autre qui casse : −3 a bien 9 pour carré, sans être égal à 3. Une équivalence a besoin des deux sens."
                  solved={breakDone} onAnswered={() => setBreakDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Répare l’équivalence', subtitle: '« x = 3 ou x = −3 » et « x² = 9 » : teste les deux sens.', done: seen2.size >= 2 && fixDone,
          content: (kit) => (
            <div className="space-y-3">
              <ImplicationLab P={T3B} Q={SQ} domain={DOM} direction={dir2} onDirection={(d) => { set2(d); if (d === 'QP') kit.react(true); }} />
              {seen2.size >= 2 && (
                <TapQuestion prompt="Maintenant que peut-on écrire ?" options={['x² = 9 ⇔ (x = 3 ou x = −3) : les deux cases interdites sont vides', 'x² = 9 ⇒ x = 3 seulement', 'Rien de plus qu’avant']} cols={1} correct={0}
                  explain="Les deux sens tiennent : la case interdite est vide dans chaque direction. On écrit alors une ÉQUIVALENCE, avec ⇔, qui se lit « si et seulement si ». C’est exactement ce qui permet de résoudre x² = 9."
                  explainWrong="Regarde les deux tests : aucune case « vraie ⇒ fausse » n’est remplie, dans un sens comme dans l’autre. Les deux implications tiennent, donc l’équivalence est vraie."
                  solved={fixDone} onAnswered={() => setFixDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 3, title: '⇒ ou ⇔ ?', done: batchDone,
          content: (
            <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Pour chaque couple, quel symbole convient ?</p>} rows={[
              { id: 'r1', label: 'n multiple de 6 … n multiple de 3', options: ['⇒ seulement', '⇔'], correct: 0, correction: '9 est multiple de 3, pas de 6.' },
              { id: 'r2', label: 'n pair … n multiple de 2', options: ['⇒ seulement', '⇔'], correct: 1, correction: 'c’est la même définition.' },
              { id: 'r3', label: 'x = 2 … 3x = 6', options: ['⇒ seulement', '⇔'], correct: 1, correction: 'on divise par 3, réversible.' },
              { id: 'r4', label: 'x > 2 … x² > 4', options: ['⇒ seulement', '⇔'], correct: 0, correction: 'x = −3 : x² = 9 > 4 mais x < 2.' },
            ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} On écrit ⇔ seulement quand les deux sens tiennent ; sinon on garde ⇒, et le sens compte. Les négatifs sont le piège classique.</Feedback>}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok"><strong>P ⇔ Q</strong> = « P ⇒ Q » ET « Q ⇒ P ». Un seul contre-exemple, dans un seul sens, suffit à la briser. C’est pour cela que résoudre x² = 9 donne DEUX solutions.</Feedback>}
    />
  );
}
