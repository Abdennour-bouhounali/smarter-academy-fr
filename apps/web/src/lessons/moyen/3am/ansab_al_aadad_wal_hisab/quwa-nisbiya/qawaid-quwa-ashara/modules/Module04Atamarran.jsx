import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : les exercices 14, 17, 20, 50, 56 et دوري الآن du manuel sont posés ICI en APPLICATION de ce que la مسطرة a montré (guide §4ter : le manuel est la
 * référence, pas l'entrée), RÉÉCRITS par la plateforme (autres nombres, regroupés en six lignes de travail). Corrigés, jamais comptés. Seulement des puissances de 10 ;
 * aucun résultat n'est normalisé. LP : P1–P4.
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
      objectives={['أكتب عبارة على شكل قوة واحدة', 'أحكم على مساواة بقوى العدد 10', 'أحسب $k \\times 10^p$', 'أختصر برنامج حساب']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قوة واحدة، أيّها يساوي، صحيح أم خاطئ، عبارة بقوى، k × 10ᵖ، برنامج حساب"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>ستة تمارين على قواعد الحساب على قوى العدد 10. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'ex-14', 'قوة واحدة', ['tabsit-ashara']),
        step(2, 'ex-17', 'أيّها يساوي $10^{-4}$ ؟', ['hasil-quwa-ashara']),
        step(3, 'ex-20', 'صحيح أم خاطئ؟', ['majmu-laysa']),
        step(4, 'ex-50', 'أعداد عشرية وقوى', ['tabsit-ashara']),
        step(5, 'now-43', 'عدد × قوة للعدد 10', ['adad-fi-quwa']),
        step(6, 'ex-56', 'برنامج حساب', ['tabsit-ashara']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
