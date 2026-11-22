import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les exercices du manuel (le tableau d'un test sportif, ex. 4, 5 et 6 de « تطبيق قاعدة حرفية », les اصطلاحات, le tableur de la page ICT et le contre-exemple de نشاط 4) sont posés ICI en APPLICATION
 * de ce que l'élève a fait sur le cadran (guide §4ter : le manuel est la référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, autres contextes : les points d'un classement de football, la vitesse
 * d'une voiture, un tableur). Corrigés, jamais comptés. LP : P1–P3.
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
      objectives={['أطبّق قاعدة بحرف أو حرفين', 'أقرأ العبارة الحرفية دون الخلط بين 2x و 23', 'أُسقط قاعدة بمثال مضادّ']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="نقاط، عبارات، سرعة، اصطلاحات، مجدول، مثال مضادّ"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>نقاط فريق كرة قدم، عبارات بحرف أو حرفين وبأقواس، سرعة سيّارة، اصطلاحات الكتابة، صيغة في مجدول، ومثال مضادّ. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-1', 'نقاط الفرق', ['qaida-tatbiq']),
        step(2, 'ex-2', 'عبارة بحرف في موضعين', ['kull-mawdi']),
        step(3, 'ex-3', 'عبارة بحرفين', ['awlawiya-qaida']),
        step(4, 'ex-4', 'سرعة سيّارة', ['qaida-tatbiq']),
        step(5, 'ex-5', 'اصطلاحات الكتابة', ['ibara-harfiya']),
        step(6, 'ex-6', 'صيغة في مجدول', ['qaida-tatbiq']),
        step(7, 'ex-7', 'مثال مضادّ', ['mithal-mudad']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
