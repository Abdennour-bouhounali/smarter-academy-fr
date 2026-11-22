import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les trois situations de نشاط 1, les exercices 15, 16 et 17, « دوري الآن » (p. 82), la vérification de la طريقة et le mur de dalles d'أتعمّق 7 sont posés ICI en APPLICATION
 * de ce que l'élève a fait sur le tapis (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes : une boulangerie, un rectangle de 91 cm²,
 * un mur de dalles). Corrigés, jamais comptés. LP : P1–P3.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: <div className="space-y-3"><TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} /></div>,
  });
  return (
    <ContentModule
      objectives={['أترجم وضعية بمساواة فيها □', 'أجد العدد الناقص في مجموع وفرق وجداء', 'أتحقّق من النتيجة بالتعويض']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="وضعيات ومساويات، مجاميع وفروق وجداءات ناقصة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ربط وضعيات بمساويات، أعداد ناقصة في مجاميع وفروق وجداءات (بعضها عشري وبعضها كسر)، عرض مستطيل ناقص، التحقّق بالتعويض، وجدار البلاطات. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-1', 'ثلاث وضعيات في المخبزة', ['musawat-naqisa']),
        step(2, 'ex-2', 'مجاميع وفروق ناقصة', ['naqis-majmu']),
        step(3, 'ex-3', 'جداءات ناقصة', ['naqis-judaa']),
        step(4, 'ex-4', 'فرق عشري وقسمة لا تتوقّف', ['naqis-judaa']),
        step(5, 'ex-5', 'عرض مستطيل', ['naqis-judaa']),
        step(6, 'ex-6', 'أتحقّق بالتعويض', ['tahaqquq']),
        step(7, 'ex-7', 'جدار البلاطات', ['naqis-majmu']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
