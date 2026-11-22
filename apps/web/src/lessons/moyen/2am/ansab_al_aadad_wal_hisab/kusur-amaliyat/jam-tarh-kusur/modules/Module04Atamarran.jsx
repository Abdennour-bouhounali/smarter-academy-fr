import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : six exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (le rectangle de 20 carreaux — idée de act-4 ① ; le trajet de Samir en bus
 * et en train — act-4 ② ; sommes et différences — ex-7…ex-10 ; 1 − a/b, n ± a/b — ex-14 et deep-47 ; l'eau bue après la course — deep-37 ; ajouter le dénominateur au numérateur — ex-31). Les erreurs sont corrigées,
 * jamais comptées. LP : P1, P2, P3.
 */
const STEPS = [
  { id: 'ex-1', title: 'المربّعات الملوّنة', requires: ['qaida-jam-tarh'] },
  { id: 'ex-2', title: 'رحلة سمير', requires: ['qaida-jam-tarh'] },
  { id: 'ex-3', title: 'احسب: جمع وطرح', requires: ['qaida-jam-tarh'] },
  { id: 'ex-4', title: 'الباقي وعدد طبيعي', requires: ['al-baqi'] },
  { id: 'ex-5', title: 'الماء بعد الركض', requires: ['qaida-jam-tarh'] },
  { id: 'ex-6', title: 'أضف المقام إلى البسط', requires: ['adad-tabii-kasr'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أجمع كسرين لهما نفس المقام', 'أوحّد مقامين أحدهما مضاعف للآخر', 'أحسب الباقي من الكلّ', 'أكتب عددًا طبيعيًا كسرًا وأجمعه مع كسر']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="الجمع والطرح، والباقي، وعدد طبيعي مع كسر"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'ستة تمارين', tone: 'amber',
        body: <p>ستة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            {i === 3 && <KnowledgeBrick id="al-baqi" variant="rappel" compact />}
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
