import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن (p. 58) : exercices 15 (compléter), 18 (l'intrus), 20 (décimal → fraction la plus simple), 21 et 25
 * (réduire, par les critères), 23 (quotient de deux décimaux), 24 (critères de 3 et 9), 27 (91 = 7 × 13). Corrigés, jamais
 * comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أتمّم كتابات كسرية متساوية', 'أمرّ بين الكتابة العشرية والكسر', 'أختزل حتى أبسط شكل ممكن']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="تمارين الكتاب 15 ، 18 ، 20 ، 21 ، 23 ، 24 ، 25 و 27"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أتمرّن — الكتاب ص 58', title: 'تمارين من الكتاب', tone: 'amber',
        body: <p>نفس التمارين، بنفس الأعداد. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 15 — أتمم', done: !!done['ex-15'],
          content: <div className="space-y-3"><KnowledgeBrick id="kitabat-mutasawiya" variant="rappel" compact /><TextbookExercise exercise={EX['ex-15']} requires={['kitabat-mutasawiya']} onAnswered={mark('ex-15')} /></div> },
        { num: 2, title: 'تمرين 18 — الكسر المختلف', done: !!done['ex-18'],
          content: <TextbookExercise exercise={EX['ex-18']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-18')} /> },
        { num: 3, title: 'تمرين 20 — من العشري إلى الكسر', done: !!done['ex-20'],
          content: <TextbookExercise exercise={EX['ex-20']} requires={['kasr-ashri', 'tariqat-ikhtizal']} onAnswered={mark('ex-20')} /> },
        { num: 4, title: 'تمرين 21 — اختزل', done: !!done['ex-21'],
          content: <TextbookExercise exercise={EX['ex-21']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-21')} /> },
        { num: 5, title: 'تمرين 23 — بسط ومقام عشريان', done: !!done['ex-23'],
          content: <TextbookExercise exercise={EX['ex-23']} requires={['kitabat-mutasawiya']} onAnswered={mark('ex-23')} /> },
        { num: 6, title: 'تمرينا 24 و 25 — بقواعد قابلية القسمة', done: !!done['ex-24'] && !!done['ex-25'],
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['ex-24']} requires={['qawaid-qabiliyat-qisma']} onAnswered={mark('ex-24')} />
              <TextbookExercise exercise={EX['ex-25']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-25')} />
            </div>
          ) },
        { num: 7, title: 'تمرين 27 — سامي أم فاطمة؟', done: !!done['ex-27'],
          content: <TextbookExercise exercise={EX['ex-27']} requires={['tariqat-ikhtizal']} onAnswered={mark('ex-27')} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
