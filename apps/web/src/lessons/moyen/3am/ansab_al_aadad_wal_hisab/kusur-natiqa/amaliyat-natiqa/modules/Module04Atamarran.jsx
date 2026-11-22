import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 6 du manuel (produits, sommes, quotients à imiter) est posé ICI en APPLICATION de ce que la لوحة الدمج a montré (guide §4ter : le manuel est la référence, pas l'entrée),
 * avec les exercices 34–37, 42–44, 48–54, دورك الآن 3 et أتعمّق 60, 63, 64 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P4.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const one = (id, req) => <TextbookExercise key={id} exercise={EX[id]} requires={req} onAnswered={mark(id)} />;
  const group = (num, title, ids, req) => ({
    num, title, done: ids.every((id) => !!done[id]),
    content: <div className="space-y-3">{ids.map((id) => one(id, req))}</div>,
  });
  return (
    <ContentModule
      objectives={['أحسب جداءات ومجاميع وقسمات عددين ناطقين', 'أحسب بتجميع الحدود وبكسور مركّبة', 'أحسب عددين ناطقين ومقلوباتهما', 'أجد حدًّا مجهولًا بعملية عكسية واحدة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="جداءات ومجاميع وقسمات، سلاسل وكسور مركّبة، مقلوبات وحدّ مجهول"
      estimatedTime="16 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تمارين على العمليات الأربع بين عددين ناطقين وعلى سلاسل الحساب. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        group(1, 'جداءات', ['act-6-prod'], ['jida-natiqa']),
        group(2, 'مجاميع', ['act-6-sum', 'ex-34'], ['jam-natiqa']),
        group(3, 'قسمات', ['act-6-quot'], ['qisma-natiqa']),
        group(4, 'تجميع الحدود', ['ex-37'], ['jam-natiqa']),
        group(5, 'ضرب وقسمة بأعداد عشرية', ['ex-42'], ['qisma-natiqa']),
        group(6, 'كسور مركّبة', ['ex-48'], ['awlawiya']),
        group(7, 'عددان ناطقان', ['ex-53'], ['qisma-natiqa']),
        group(8, 'عددان من قائمة', ['deep-60'], ['jida-natiqa']),
        group(9, 'ترتيب ومقلوبات', ['deep-63-orig', 'deep-63-recip'], ['maqlub-natiq']),
        group(10, 'حدّ مجهول', ['ex-54'], ['qisma-natiqa']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
