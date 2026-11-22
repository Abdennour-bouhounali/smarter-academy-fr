import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 5 du manuel (mesurer quatre segments puis conjecturer) est posé ICI en APPLICATION des idées découvertes avec le compas (guide §4ter : le manuel est la référence, pas
 * l'entrée), avec le تمرين 35 et trois exercices d'approfondissement RÉÉCRITS par la plateforme (autres nombres), et l'activité ict-1 SANS logiciel. Corrigés, jamais comptés. LP : P1, P2.
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
      objectives={['أحسب مسافات بين نقط وأتحقّق', 'أحسب مسافات بأعداد عشرية', 'أجد أزواجًا بمسافة معلومة', 'أعيّن منتصف قطعة ونقطتين على بعد معلوم']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="ثلاث مسافات، ست مسافات، أزواج، منتصف، ونقط على بعد معلوم"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ستة تمارين على المسافة بين نقطتين. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-5', 'ثلاث مسافات وتحقّق', ['qaidat-masafa']),
        step(2, 'ex-35', 'ست مسافات بالعشريات', ['qaidat-masafa']),
        step(3, 'ict-1', 'أزواج بمسافة معلومة', ['masafa-mujaba']),
        step(4, 'deep-40', 'منتصف قطعة', ['tariqa-masafa']),
        step(5, 'deep-41', 'نقطة على بعد معلوم', ['nuqtatan']),
        step(6, 'deep-42', 'وضعان ممكنان', ['nuqtatan']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
