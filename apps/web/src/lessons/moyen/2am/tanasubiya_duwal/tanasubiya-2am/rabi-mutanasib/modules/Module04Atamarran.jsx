import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 2 du manuel (l'éprouvette) est posé ICI en APPLICATION (un réservoir gradué, autres nombres) des règles
 * découvertes avec la « لوحة الأسعار » (guide §4ter : le manuel est la référence, pas l'entrée), avec les exercices 12–18 et l'ouverture
 * p. 70 RÉÉCRITS par la plateforme. Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أحسب الرابع المتناسب بالجداءين', 'أحسب ذهنيًا', 'أجد المجهول في أيّ خانة', 'أصحّح خطأ تلميذ']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="خزّان مدرّج، حساب ذهني، دهان، جداول، تصحيح تلميذ، أنبوب يتسرّب ومحيط الأرض"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على الرابع المتناسب. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-2', 'خزّان مدرّج', ['jidaan']),
        step(2, 'ex-12', 'حساب ذهني', ['turuq']),
        step(3, 'ex-14', 'الدهان', ['turuq']),
        step(4, 'ex-15', 'جداول بخانة ناقصة', ['hisab-jidaan']),
        step(5, 'ex-16', 'تصحيح تلميذ', ['farq']),
        step(6, 'ex-18', 'أنبوب يتسرّب', ['hisab-jidaan']),
        step(7, 'opener', 'محيط الأرض', ['rabi']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
