import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : six exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (la barquette de مقروط et la nouvelle découpe — idée de act-2 ; sept cahiers
 * à 150 DA et douze boîtes de 3 kg — act-3 ; 63 ÷ 2,1 — now-27 ; = ou ≠ — ex-2 ; 3,6 ÷ 0,9 et 4416 ÷ 23 — now-29 ① et deep-35 ; les écritures entre 2,71 et 2,72 — deep-38). Les erreurs sont corrigées,
 * jamais comptées. LP : P1, P2, P3, P4.
 */
const STEPS = [
  { id: 'ex-1', title: 'النسبة والقطع الأصغر', requires: ['nisba-kasriya'] },
  { id: 'ex-2', title: 'ثمن الكرّاس وكتلة العلبة', requires: ['qiyam-muqarraba-ushr'] },
  { id: 'ex-3', title: 'أكمل: قسمة على عدد عشري', requires: ['qisma-ashari'] },
  { id: 'ex-4', title: '= أم ≠ ؟', requires: ['qima-madbuta'] },
  { id: 'ex-5', title: 'أحسب واستنتج', requires: ['qisma-ashari'] },
  { id: 'ex-6', title: 'كتابات بين 2,71 و 2,72', requires: ['qiyam-muqarraba-ushr'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أكتب النسبة وأغيّر الكتابة الكسرية', 'أقسم على عدد عشري بجعل القاسم طبيعيًا', 'أميّز القيمة المضبوطة من القيمة المقرّبة', 'أحصر حاصل قسمة إلى $0{,}01$']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="النسبة، والقسمة على عدد عشري، والقيم المقرّبة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'ستة تمارين', tone: 'amber',
        body: <p>ستة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            {i === 3 && <KnowledgeBrick id="qima-madbuta" variant="rappel" compact />}
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
