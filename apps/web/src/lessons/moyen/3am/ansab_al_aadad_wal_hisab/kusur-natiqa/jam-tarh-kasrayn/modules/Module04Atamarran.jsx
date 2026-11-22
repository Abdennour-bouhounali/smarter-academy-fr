import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 4 du manuel (des disques déjà découpés : somme et différence de deux fractions) est posé ICI en APPLICATION de ce que le râteau a montré (guide §4ter :
 * le manuel est la référence, pas l'entrée), avec « دورك الآن » 2, les exercices 11, 18–21 et أتعمّق 62 et 65 RÉÉCRITS (autres nombres ; chacun cite ceux qu'il remplace). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أجمع كسرين وأطرحهما', 'أحسب بثلاثة حدود وعدد طبيعي', 'أجد أصغر مضاعف مشترك', 'أحسب ذهنيًا', 'أكتب النتيجة على أبسط شكل', 'أجد حدًّا مجهولًا']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="مجموع وفرق، أصغر مضاعف مشترك، حساب ذهني، اختزال وحدّ مجهول"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تمارين على جمع كسرين وطرحهما بمقامين مختلفين. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-4', 'جمع كسرين وطرحهما', ['qaida-jam-tarh']),
        step(2, 'now-2', 'ثلاثة حدود وعدد طبيعي', ['qaida-jam-tarh']),
        step(3, 'ex-11', 'أصغر مضاعف مشترك', ['asghar-mudaaf']),
        step(4, 'ex-18', 'حساب ذهني', ['qaida-jam-tarh']),
        step(5, 'ex-20', 'اكتب على أبسط شكل', ['qaida-jam-tarh']),
        {
          num: 6, title: 'حدّ مجهول', done: !!done['deep-62'] && !!done['deep-65'],
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['deep-62']} requires={['qaida-jam-tarh']} onAnswered={mark('deep-62')} />
              <TextbookExercise exercise={EX['deep-65']} requires={['qaida-jam-tarh']} onAnswered={mark('deep-65')} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
