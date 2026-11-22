import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن (p. 17) : d'abord le نشاط 1 du manuel (p. 9) posé en APPLICATION de ce que l'élève a découvert à
 * l'atelier (LESSON_DEVELOPMENT_GUIDE §4ter : le manuel est la référence, pas l'entrée), puis exercices 1 (رقم / عدد dans 2017), 2 (1345 DA : la méthode du module 3), 3 (classes et
 * lecture), 12 ① (le مفكوك d'un entier — ②–④ sont décimaux, leçon suivante) et أقوّم تعلّماتي 1 (p. 19 : 3005).
 * Corrigés, jamais comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أميّز رقم المرتبة من عدد وحداتها', 'أقرأ وأكتب الأعداد الكبيرة فئةً فئةً', 'أنتقل من المفكوك إلى العدد']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="نشاط الكتاب، تمارين 1 ، 2 ، 3 ، 12 وأقوّم تعلّماتي 1"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن — الكتاب ص 9 و 17 و 19', title: 'ستة تمارين من الكتاب', tone: 'amber',
        body: <p>نفس التمارين، بنفس الأعداد. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'نشاط الكتاب ص 9 — أكوّن أعدادا', done: !!done['act-1'],
          content: <TextbookExercise exercise={EX['act-1']} requires={['tabadul', 'qima-mawdi']} onAnswered={mark('act-1')} /> },
        { num: 2, title: 'تمرين 1 — العدد 2017', done: !!done['ex-1'],
          content: <div className="space-y-3"><KnowledgeBrick id="raqm-adad" variant="rappel" compact /><TextbookExercise exercise={EX['ex-1']} requires={['raqm-adad']} onAnswered={mark('ex-1')} /></div> },
        { num: 3, title: 'تمرين 2 — حصّالة يونس', done: !!done['ex-2'],
          content: <TextbookExercise exercise={EX['ex-2']} requires={['raqm-adad']} onAnswered={mark('ex-2')} /> },
        { num: 4, title: 'تمرين 3 — أعِد تنسيق الكتابة', done: !!done['ex-3'],
          content: <TextbookExercise exercise={EX['ex-3']} requires={['fiaat']} onAnswered={mark('ex-3')} /> },
        { num: 5, title: 'تمرين 12 ① — من المفكوك إلى العدد', done: !!done['ex-12'],
          content: <TextbookExercise exercise={EX['ex-12']} requires={['mafkuk']} onAnswered={mark('ex-12')} /> },
        { num: 6, title: 'أقوّم تعلّماتي 1 — ثلاثة آلاف وخمسة', done: !!done['self-1'],
          content: <TextbookExercise exercise={EX['self-1']} requires={['raqm-adad']} onAnswered={mark('self-1')} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
