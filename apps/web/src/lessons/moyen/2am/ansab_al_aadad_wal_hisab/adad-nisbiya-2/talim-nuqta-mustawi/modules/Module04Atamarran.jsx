import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 (c) du manuel (lire des points qui dessinent un chiffre) est posé ICI en APPLICATION des idées découvertes avec la شبكة (guide §4ter : le manuel est la
 * référence, pas l'entrée), avec les exercices 21–24 et deux exercices d'approfondissement RÉÉCRITS par la plateforme (autres nombres). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أضع نقطًا وأقرأ إحداثياتها', 'أعرف منطقة نقطة وأقرأ نقطًا على المحورين', 'أجد نظيرة نقطة بالنسبة إلى محور', 'أكمل مثلثًا وأختار وحدة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="رقم من نقط، قراءة الإحداثيات، المحوران، النظيرة، مثلث قائم، واختيار الوحدة"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>سبعة تمارين على الإحداثيين والمحورين والنظيرة. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'نقط ترسم رقمًا', ['ihdathiyan-nuqta']),
        step(2, 'ex-21', 'قراءة إحداثيات خمس نقط', ['ihdathiyan']),
        step(3, 'ex-22', 'المناطق والمحوران', ['manatiq']),
        step(4, 'ex-23', 'نظيرتان', ['nadhira-mihwar']),
        step(5, 'ex-24', 'نقط على دائرة', ['manatiq']),
        step(6, 'deep-55', 'مثلث قائم متقايس الضلعين', ['tariqa-wad']),
        step(7, 'deep-52', 'اختيار الوحدة', ['maalam-mutajanis']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
