import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : six exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (les chaises de tables jointes — idée de act-1 ; n et ses voisins — ex-1, ex-5 ; une instruction
 * pour une liste de calculs et un programme — ex-2, ex-13 ; le périmètre d'un triangle isocèle — prep, now-59 ; valeurs de 4x + 3 et 3x + 2y — ex-14, ex-17 ; simplifications — ex-19, ex-21, ex-22). Les erreurs sont corrigées, jamais comptées. LP : P1, P2, P3.
 */
const STEPS = [
  { id: 'ex-1', title: 'كراسي المطعم', requires: ['qaida-5n1'] },
  { id: 'ex-2', title: 'عبارات في n', requires: ['harf-yaud'] },
  { id: 'ex-3', title: 'تعليمة واحدة', requires: ['tarjama-harf'] },
  { id: 'ex-4', title: 'المحيط', requires: ['tarjama-harf'] },
  { id: 'ex-5', title: 'قيم عبارتين', requires: ['qima-40'] },
  { id: 'ex-6', title: 'بسّط', requires: ['tajmi'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أنتج عبارة حرفية من وضعية', 'أحسب قيمة عبارة بحرف أو بحرفين', 'أبسّط كتابة عبارة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="العبارة، وقيمتها، وتبسيطها"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'ستة تمارين', tone: 'amber',
        body: <p>ستة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
