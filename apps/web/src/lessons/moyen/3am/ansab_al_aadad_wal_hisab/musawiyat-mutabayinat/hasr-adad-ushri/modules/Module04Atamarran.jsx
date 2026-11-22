import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 3 du manuel (une longueur dont on connaît le mudawwar, un quotient lu sur la calculatrice) est posé ICI en APPLICATION des idées
 * découvertes à « ميزان العطّار » (guide §4ter : le manuel est la référence, pas l'entrée), avec les exercices 20, 21, 22, 25, 28 et 62 RÉÉCRITS (autres nombres).
 * Corrigés, jamais comptés. LP : P1–P4.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />,
  });
  return (
    <ContentModule
      objectives={['أحصر عددًا علمت مدوّره', 'أحصر حاصل قسمة بالآلة الحاسبة وأدوّره', 'أحصر عبارة بعد حصر عدد', 'أقارن بالحصر']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="سبعة تمارين على الحصر والتدوير"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'سبعة تمارين لتثبيت الحصر والتدوير', tone: 'amber',
        body: <p>أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-3-1', 'قطعة قماش', ['hasr-min-mudawwar']),
        step(2, 'act-3-2', 'حاصل قسمة على الآلة', ['hasr-rutba']),
        step(3, 'now-77-1', 'عدد مدوّره 5,07', ['hasr-min-mudawwar']),
        step(4, 'self-5', 'مدوّر وحصر', ['hasr-rutba']),
        step(5, 'ex-21', 'محيط دائرة و π', ['hasr-rutba']),
        step(6, 'ex-28', 'حجم علبة', ['hasr-min-mudawwar']),
        step(7, 'ex-20', 'أقارن بالحصر', ['hasr-rutba']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
