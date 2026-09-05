import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ImplicationLab from '../components/ImplicationLab';
import PredictionChips from '../components/PredictionChips';
import { prop, range, isPrime } from '../components/logicUtils';

/**
 * Module 3 — DISCOVERY : « Implication et réciproque ».
 * Activity: classer un domaine dans les quatre cas d'une implication ;
 *   tester le sens direct puis la réciproque ; puis un second couple.
 * Mathematical objective: P ⇒ Q est fausse SEULEMENT s'il existe un cas
 *   « P vraie, Q fausse » ; la réciproque est une autre affirmation ; la
 *   contraposée dit la même chose que l'implication.
 * Misconception targeted: « si P ⇒ Q alors Q ⇒ P » ; « P ⇒ Q dit quelque
 *   chose quand P est fausse ».
 */
const M4 = prop('m4', 'n est multiple de 4', (n) => n % 4 === 0);
const PAIR = prop('pair', 'n est pair', (n) => n % 2 === 0);
const DOMAIN = range(1, 16);
const PRIME = prop('prime', 'n est premier', isPrime);
const ODD = prop('odd', 'n est impair', (n) => n % 2 !== 0);
const D2 = range(3, 20);

export default function Module03Implication() {
  const [prediction, setPrediction] = useState(null);
  const [dir, setDir] = useState('PQ');
  const [seen, setSeen] = useState(() => new Set(['PQ']));
  const [recDone, setRecDone] = useState(false);
  const [dir2, setDir2] = useState('PQ');
  const [seen2, setSeen2] = useState(() => new Set(['PQ']));
  const [primeDone, setPrimeDone] = useState(false);
  const [contraDone, setContraDone] = useState(false);
  const set = (d) => { setDir(d); const s = new Set(seen); s.add(d); setSeen(s); };
  const set2 = (d) => { setDir2(d); const s = new Set(seen2); s.add(d); setSeen2(s); };
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Implication et réciproque"
      moduleSubtitle="Un seul cas est interdit : P vraie et Q fausse. Cherche-le — dans un sens, puis dans l’autre."
      estimatedTime="11 min"
      brief={{ tag: '➡️ Mission 03', title: '« Si n est multiple de 4, alors n est pair. » Vraie ? Et dans l’autre sens ?', tone: 'indigo', body: <p>Chaque nombre se range dans une des quatre cases. Une seule est interdite.</p> }}
      steps={[
        {
          num: 1, title: 'Les quatre cases', subtitle: 'Teste le sens direct, puis la réciproque.', done: seen.size >= 2 && recDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si « multiple de 4 ⇒ pair » est vraie, sa réciproque l’est-elle aussi ?" options={[{ id: 'oui', label: 'Oui, forcément' }, { id: 'non', label: 'Non, pas forcément' }]} value={prediction} onChange={setPrediction} disabled={seen.size >= 2} />
              <ImplicationLab P={M4} Q={PAIR} domain={DOMAIN} direction={dir} onDirection={(d) => { set(d); if (d === 'QP') kit.react(true); }} />
              {seen.size >= 2 && (
                <TapQuestion prompt="Que montre le test des deux sens ?" options={['« Multiple de 4 ⇒ pair » est vraie, mais sa réciproque est fausse (2, 6, 10… sont pairs sans être multiples de 4)', 'Les deux sens sont vrais', 'Les deux sens sont faux']} cols={1} correct={0}
                  explain={<>{prediction === 'non' ? 'Ta prédiction : pas forcément. Exact' : prediction === 'oui' ? 'Ta prédiction : forcément. Le laboratoire te contredit' : 'Le laboratoire tranche'} : la case interdite est vide dans le sens direct, mais pleine dans l’autre (2, 6, 10, 14). Une implication et sa <strong>réciproque</strong> sont deux affirmations différentes.</>}
                  explainWrong="Regarde les deux tests : dans le sens direct, la case « P vraie, Q fausse » est vide (aucun multiple de 4 impair). Dans l’autre sens, elle contient 2, 6, 10, 14 : la réciproque est fausse."
                  solved={recDone} onAnswered={() => setRecDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Un autre couple', subtitle: '« Si n est premier (et n ≥ 3), alors n est impair. » Et la réciproque ?', done: seen2.size >= 2 && primeDone,
          content: (kit) => (
            <div className="space-y-3">
              <ImplicationLab P={PRIME} Q={ODD} domain={D2} direction={dir2} onDirection={(d) => { set2(d); if (d === 'QP') kit.react(true); }} />
              {seen2.size >= 2 && (
                <TapQuestion prompt="Sur ce domaine (3 à 20), que peut-on dire ?" options={['« Premier ⇒ impair » tient, mais la réciproque tombe sur 9 (impair, pas premier)', 'Les deux sens tiennent', 'Aucun des deux ne tient']} cols={1} correct={0}
                  explain="Aucun premier de 3 à 20 n’est pair, donc le sens direct tient sur ce domaine. Mais 9, 15 et 21 sont impairs sans être premiers : la réciproque est fausse. Un contre-exemple suffit."
                  explainWrong="Regarde la case interdite de chaque sens : vide pour « premier ⇒ impair » ; pleine (9, 15…) pour la réciproque « impair ⇒ premier »."
                  solved={primeDone} onAnswered={() => setPrimeDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Réciproque ou contraposée ?', done: contraDone,
          content: (
            <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">On part de : « Si n est multiple de 4, alors n est pair. »</p>} rows={[
              { id: 'r1', label: '« Si n est pair, alors n est multiple de 4 »', options: ['la réciproque (fausse)', 'la contraposée (vraie)', 'la même chose'], correct: 0 },
              { id: 'r2', label: '« Si n n’est pas pair, alors n n’est pas multiple de 4 »', options: ['la réciproque (fausse)', 'la contraposée (vraie)', 'une phrase sans rapport'], correct: 1, correction: 'la contraposée dit exactement la même chose que l’implication.' },
              { id: 'r3', label: '12 est multiple de 4. Que peut-on conclure ?', options: ['12 est pair', 'rien'], correct: 0 },
              { id: 'r4', label: '10 est pair. Que peut-on conclure avec cette implication ?', options: ['10 est multiple de 4', 'rien : l’implication ne dit rien dans ce sens'], correct: 1 },
            ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} La <strong>contraposée</strong> (« si non Q, alors non P ») est toujours équivalente à l’implication ; la <strong>réciproque</strong> ne l’est pas. Et savoir que Q est vraie ne dit rien sur P.</Feedback>}
              solved={contraDone} onAnswered={() => setContraDone(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">« P ⇒ Q » interdit un seul cas : P vraie et Q fausse. Sa <strong>contraposée</strong> « non Q ⇒ non P » dit la même chose ; sa <strong>réciproque</strong> « Q ⇒ P » est une autre affirmation, à tester séparément. Et quand les DEUX tiennent ?</Feedback>}
    />
  );
}
