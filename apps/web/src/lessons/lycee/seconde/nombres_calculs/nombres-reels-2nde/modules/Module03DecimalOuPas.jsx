import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FractionExpander from '../components/FractionExpander';
import PredictionChips from '../components/PredictionChips';

/**
 * Module 3 — DISCOVERY : « Décimal ou pas ? ».
 *
 * Activity: poser la division de 3 par 8, puis de 1 par 3, puis de 2 par 7,
 *   chiffre par chiffre, en suivant les restes.
 * Mathematical objective: le reste décide (0 → s'arrête ; reste revu → se
 *   répète) ; comme les restes sont < q, l'un des deux arrive toujours :
 *   toute fraction a une écriture finie ou périodique — et l'écriture
 *   « 1/3 » est la seule EXACTE, 0,33 n'en est qu'une approximation.
 * Student action: choisir, puis « Chiffre suivant » ; prédire pour 2/7.
 * Controlled variable: le nombre de chiffres posés.
 * Expected observation: le reste 0 apparaît pour 3/8 (trois chiffres) ; le
 *   reste 1 revient pour 1/3 ; six restes différents pour 2/7 puis retour.
 * Misconception targeted: « 1/3 = 0,33 », « une division qui ne s'arrête
 *   pas n'a pas de résultat ».
 */
const FRACTIONS = [
  { id: 'trois-huitiemes', p: 3, q: 8, label: '3/8' },
  { id: 'un-tiers', p: 1, q: 3, label: '1/3' },
  { id: 'deux-septiemes', p: 2, q: 7, label: '2/7' },
  { id: 'cinq-sixiemes', p: 5, q: 6, label: '5/6' },
];

export default function Module03DecimalOuPas() {
  const [current, setCurrent] = useState('trois-huitiemes');
  const [shown, setShown] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [whyDone, setWhyDone] = useState(false);
  const [exactDone, setExactDone] = useState(false);

  const n = shown[current] ?? 0;
  const step1Done = (shown['trois-huitiemes'] ?? 0) >= 3 && (shown['un-tiers'] ?? 0) >= 2;
  const step2Done = prediction !== null && (shown['deux-septiemes'] ?? 0) >= 7;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Décimal ou pas ?"
      moduleSubtitle="Pose la division, suis les restes : celui qui revient à 0 arrête l’écriture, celui qui revient tout court la fait tourner en rond."
      estimatedTime="9 min"
      brief={{
        tag: '➗ Mission 03',
        title: 'Une fraction, c’est une division. Posons-la, un chiffre à la fois.',
        tone: 'indigo',
        body: <p>À chaque chiffre, un reste. Surveille les restes : ils annoncent tout ce qui va suivre.</p>,
      }}
      steps={[
        {
          num: 1,
          title: '3/8 puis 1/3',
          subtitle: 'Pose 3 ÷ 8 jusqu’au bout, puis 1 ÷ 3 (au moins deux chiffres).',
          done: step1Done,
          content: (kit) => (
            <div className="space-y-3">
              <FractionExpander
                fractions={FRACTIONS.slice(0, 2)}
                current={current === 'trois-huitiemes' || current === 'un-tiers' ? current : 'trois-huitiemes'}
                shown={n}
                onChoose={setCurrent}
                onNext={(k) => { setShown({ ...shown, [current]: k }); if ((current === 'trois-huitiemes' && k === 3) || (current === 'un-tiers' && k === 2)) kit.react(true); }}
              />
              {step1Done ? (
                <Feedback tone="ok">
                  Pour 3/8, le reste tombe à <strong>0</strong> après trois chiffres : 0,375, l’écriture s’arrête — 3/8 est décimal. Pour 1/3, le reste <strong>1</strong> revient dès le deuxième chiffre : la machine refait exactement le même calcul, pour toujours — 0,333… ne s’arrête jamais.
                </Feedback>
              ) : (
                <Feedback tone="info">{(shown['trois-huitiemes'] ?? 0) < 3 ? 'Pose 3 ÷ 8 : combien de chiffres avant que le reste tombe à 0 ?' : 'Maintenant 1/3 : regarde le reste après chaque chiffre.'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: '2/7 : ça va se répéter ?',
          subtitle: 'Prédis d’abord, puis pose la division au moins jusqu’au retour d’un reste.',
          done: step2Done,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                options={[{ id: 'arrete', label: 'L’écriture s’arrête' }, { id: 'repete', label: 'Elle se répète' }, { id: 'jamais', label: 'Ni l’un ni l’autre' }]}
                value={prediction}
                onChange={setPrediction}
              />
              {prediction !== null && (
                <FractionExpander
                  fractions={[FRACTIONS[2]]}
                  current="deux-septiemes"
                  shown={shown['deux-septiemes'] ?? 0}
                  onChoose={() => {}}
                  onNext={(k) => { setShown({ ...shown, 'deux-septiemes': k }); if (k === 7) kit.react(true); }}
                />
              )}
              {step2Done && (
                <Feedback tone={prediction === 'repete' ? 'ok' : 'info'}>
                  {prediction === 'repete' ? 'Ta prédiction : elle se répète. Exact' : prediction === 'arrete' ? 'Ta prédiction : elle s’arrête. La division te contredit' : 'Ta prédiction : ni l’un ni l’autre. La division te contredit'} : les restes possibles sont 1, 2, 3, 4, 5, 6 — jamais plus de six, puisqu’un reste est plus petit que 7. Au septième chiffre, un reste revient forcément, et tout recommence : période 285714. <strong>Toute fraction a une écriture qui s’arrête ou se répète</strong> — jamais « ni l’un ni l’autre ».
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Pourquoi ça se répète forcément ?',
          done: whyDone,
          content: (
            <TapQuestion
              prompt="Pourquoi la division de 2 par 7 finit-elle FORCÉMENT par se répéter ?"
              options={[
                'Parce qu’il n’y a que 6 restes possibles (de 1 à 6) : l’un d’eux revient, et le calcul se répète',
                'Parce que 7 est un nombre impair',
                'Parce que 2 est plus petit que 7',
              ]}
              cols={1}
              correct={0}
              explain="Un reste est toujours plus petit que le diviseur : pour 7, il vaut 0, 1, 2, 3, 4, 5 ou 6. S’il vaut 0, l’écriture s’arrête ; sinon, après au plus 6 chiffres un reste revient et la suite se répète. C’est vrai pour toute fraction : décimale (reste 0) ou périodique."
              explainWrong="Ni la parité de 7 ni la taille de 2 ne comptent. Ce qui compte : un reste est plus petit que 7, donc il n’y a que six restes non nuls possibles — l’un d’eux revient forcément, et à partir de là tout se répète."
              solved={whyDone}
              onAnswered={() => setWhyDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Exact ou approché ?',
          done: exactDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-600">Chaque écriture est-elle EXACTE (le nombre lui-même) ou APPROCHÉE (un nombre proche) ?</p>}
              rows={[
                { id: 'r1', label: '1/3 = 0,33', options: ['exacte', 'approchée'], correct: 1, correction: '0,33 = 33/100 ≠ 1/3 ; il manque une infinité de 3.' },
                { id: 'r2', label: '3/8 = 0,375', options: ['exacte', 'approchée'], correct: 0, correction: 'La division s’arrête : c’est le nombre lui-même.' },
                { id: 'r3', label: '2/7 ≈ 0,2857', options: ['exacte', 'approchée'], correct: 1, correction: 'Quatre chiffres d’une écriture infinie.' },
                { id: 'r4', label: '5/6', options: ['exacte', 'approchée'], correct: 0, correction: 'La fraction EST l’écriture exacte de ce nombre.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Quand l’écriture décimale ne s’arrête pas, la seule écriture exacte est la fraction : 1/3, 2/7, 5/6. Couper les chiffres donne une valeur approchée, à écrire avec ≈.
                </Feedback>
              )}
              solved={exactDone}
              onAnswered={() => setExactDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Décimal ⇔ la division tombe sur un reste 0. Rationnel non décimal ⇔ un reste revient et l’écriture tourne en rond. Et √2, qui ne fait ni l’un ni l’autre, n’est donc aucune fraction : il est irrationnel. Son écriture exacte, c’est « √2 » — le module suivant montre ce que valent ses approximations.
        </Feedback>
      }
    />
  );
}
