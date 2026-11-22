import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX, STEPS_META } from '../content/exercises';

/**
 * Module 4 — أتمرّن : six exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (deux plateaux de بغرير coupés en 6 et 9 — idée de act-6 ; plus petit ou plus grand
 * que 1 — ex-20 ; compléter par < ou > — ex-21 et ex-22 ; une fraction entre deux autres — ex-23 ; ranger — now-29 ; compléter par < > = — ex-24). Les erreurs sont corrigées, jamais comptées. LP : P1, P2, P3, P4.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أقارن كسرين وأرتّب كسورًا', 'أقارن كسرًا بالعدد $1$', 'أجد كسرًا محصورًا بين كسرين']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="المقارنة والترتيب"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'ستة تمارين', tone: 'amber',
        body: <p>ستة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS_META.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            {i === 3 && <KnowledgeBrick id="nafs-al-bast" variant="rappel" compact />}
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
