import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 5 — FORMALIZATION : « À retenir » — la carte de la logique, après les gestes. */
export default function Module05ARetenir() {
  const [b1, setB1] = useState(false); const [t2, setT2] = useState(false); const [b3, setB3] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="À retenir"
      moduleSubtitle="Proposition, connecteurs, implication, réciproque, contraposée, équivalence, contre-exemple : la carte."
      estimatedTime="8 min"
      brief={{ tag: '📘 Mission 05', title: 'Quatre modules de tests, une carte de vocabulaire.', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p><strong>Proposition :</strong> une phrase vraie ou fausse. Avec une variable, elle devient une proposition une fois la variable quantifiée : <strong>pour tout</strong> n (∀) ou <strong>il existe</strong> un n (∃).</p>
                <p><strong>Connecteurs :</strong> P ET Q (les deux) · P OU Q (au moins une, inclusif) · NON P (le reste exactement). Nier « pour tout n, P(n) » donne « il existe n tel que NON P(n) » — c’est le contre-exemple.</p>
                <p><strong>Implication P ⇒ Q :</strong> fausse seulement si P est vraie et Q fausse. Sa <strong>contraposée</strong> « non Q ⇒ non P » lui est équivalente ; sa <strong>réciproque</strong> « Q ⇒ P » est une autre affirmation.</p>
                <p><strong>Équivalence P ⇔ Q :</strong> les deux implications. Se lit « si et seulement si ».</p>
                <p><strong>Réfuter</strong> une affirmation universelle : un contre-exemple suffit. <strong>Prouver</strong> : il faut un raisonnement général (direct, par contraposée, par disjonction des cas, ou par l’absurde).</p>
              </div>
              <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>} rows={[
                { id: 'r1', label: 'Un contre-exemple suffit à réfuter « pour tout n, P(n) »', options: ['vrai', 'faux'], correct: 0 },
                { id: 'r2', label: 'Un exemple suffit à prouver « pour tout n, P(n) »', options: ['vrai', 'faux'], correct: 1, correction: 'il faut un raisonnement général.' },
                { id: 'r3', label: 'Une implication et sa contraposée ont toujours la même valeur de vérité', options: ['vrai', 'faux'], correct: 0 },
                { id: 'r4', label: 'Une implication et sa réciproque ont toujours la même valeur de vérité', options: ['vrai', 'faux'], correct: 1, correction: 'multiple de 4 ⇒ pair est vraie, sa réciproque non.' },
              ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Contraposée : toujours équivalente. Réciproque : à tester séparément. Réfuter est facile, prouver demande un raisonnement.</Feedback>}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Un exemple ne prouve pas', done: t2,
          content: <TapQuestion prompt="Pour prouver « il existe un entier n tel que n² + n + 41 n’est pas premier », que suffit-il ?" options={['Un seul exemple : n = 40 convient', 'Un raisonnement général', 'Rien : c’est impossible']} cols={1} correct={0}
            explain="Attention à la quantification : « il existe » se prouve par UN exemple, et se réfute par un raisonnement général. C’est exactement l’inverse de « pour tout ». Ici n = 40 donne 41 × 41."
            explainWrong="Cette affirmation dit « IL EXISTE », pas « pour tout » : exhiber un seul n qui convient (40) la prouve. C’est pour « pour tout » qu’un exemple ne suffit jamais."
            solved={t2} onAnswered={() => setT2(true)} />,
        },
        {
          num: 3, title: 'Lire une phrase', done: b3,
          content: (
            <BatchChoiceQuestion rows={[
              { id: 'r1', label: '« n pair est nécessaire pour que n soit multiple de 4 »', options: ['multiple de 4 ⇒ pair', 'pair ⇒ multiple de 4'], correct: 0, correction: '« nécessaire » = la conséquence.' },
              { id: 'r2', label: '« n multiple de 4 est suffisant pour que n soit pair »', options: ['multiple de 4 ⇒ pair', 'pair ⇒ multiple de 4'], correct: 0, correction: '« suffisant » = l’hypothèse.' },
              { id: 'r3', label: '« n est pair si et seulement si n est multiple de 2 »', options: ['une équivalence', 'une implication simple'], correct: 0 },
            ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>« P suffisant pour Q » = P ⇒ Q ; « Q nécessaire pour P » = P ⇒ Q aussi ; « si et seulement si » = ⇔.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Le vocabulaire est en place. Reste un raisonnement de plus, celui qui attaque par le contraire : l’absurde.</Feedback>}
    />
  );
}
