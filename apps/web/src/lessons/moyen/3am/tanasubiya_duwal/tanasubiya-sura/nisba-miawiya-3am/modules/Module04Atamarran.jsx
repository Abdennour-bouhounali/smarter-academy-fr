import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 2 du manuel est posé ICI en APPLICATION de ce que la صينية a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * avec les exercices 6–16, أتعمّق 30 (أ), 39 et 40 RÉÉCRITS et regroupés par la plateforme (autres nombres ; chacun cite ceux qu'il remplace). Corrigés,
 * jamais comptés. LP : P1–P3.
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
      objectives={['أحسب نسبة من عدد', 'أحسب نسبة جزء من كلّ', 'أحسب زيادة أو تخفيضًا', 'أجد الكلّ من جزئه']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="سكّان مدينة، نسب، زيادة، نسبة مجتمعة، الكلّ من جزئه، وتخفيضان"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ثمانية تمارين على النسبة المئوية. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-2', 'سكّان مدينة', ['hissa-t']),
        step(2, 'ex-6', 'نسبة من جزء وكلّ', ['nisba-jadwal']),
        step(3, 'ex-7', 'لعبة ترتفع', ['ziyada-nuqsan']),
        step(4, 'ex-8', 'نسبة الزيادة', ['nisba-jadwal']),
        step(5, 'ex-9', 'مشروب من عصيرين', ['tariqat-hisab']),
        step(6, 'ex-13', 'مساحة الولاية', ['tariqat-hisab']),
        step(7, 'deep-39', 'ثمن المعطف', ['ziyada-nuqsan']),
        step(8, 'deep-40', 'تخفيضان متتاليان', ['tatabu']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
