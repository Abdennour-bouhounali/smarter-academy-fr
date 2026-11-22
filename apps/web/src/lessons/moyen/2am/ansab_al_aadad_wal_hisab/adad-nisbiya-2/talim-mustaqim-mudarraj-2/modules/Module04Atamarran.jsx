import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 du manuel (la frise des monuments) est posé ICI en APPLICATION des idées découvertes avec la مسطرة (guide §4ter : le manuel est la
 * référence, pas l'entrée), avec les exercices 1–11 RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أقرأ فواصل بتدريجات مختلفة', 'أضع نقطًا بعدّ التدريجات', 'أجد معاكس عدد', 'أختار تدريجة تناسب أعدادًا']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="خطّ زمن، قراءة فواصل، وضع نقط، معاكس عدد، وتدريجة تناسب درجات مهمّة"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على الفاصلة والمسافة إلى الصفر والعددين المتعاكسين. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'خطّ زمن المتوسطة', ['ikhtiyar-tadrij']),
        step(2, 'ex-4', 'قراءة فواصل بتدريجة 5', ['faasila']),
        step(3, 'ex-7', 'تدريجة 10 ثم 0,25', ['faasila']),
        step(4, 'ex-9', 'وضع نقط', ['tariqa-tadrij']),
        step(5, 'ex-10', 'معاكس عدد', ['mafhum-mutaakisan']),
        step(6, 'ex-2', 'درجات حرارة مهمّة', ['ikhtiyar-tadrij']),
        step(7, 'ex-1', 'أكتب العدد النسبي', ['masafa-ila-sifr']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
