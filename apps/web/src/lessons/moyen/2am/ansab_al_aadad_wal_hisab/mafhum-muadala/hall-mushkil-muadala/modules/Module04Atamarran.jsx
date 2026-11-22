import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : six exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (une situation, plusieurs équations justes — act-4 ; les trois formes — ex-38, ex-39 ; un diviseur
 * manquant — now-61 ; l'élément manquant d'une égalité — ex-37, ex-36 ; la vérification d'une solution — la plateforme ; un rectangle d'aire donnée — deep-56). Les erreurs sont corrigées, jamais comptées. LP : P1, P2, P3.
 */
const STEPS = [
  { id: 'ex-1', title: 'علب التمر', requires: ['muadala-kitabatan'] },
  { id: 'ex-2', title: 'حلّ المعادلات', requires: ['thalath-ashkal'] },
  { id: 'ex-3', title: 'قاسم مجهول', requires: ['qasim-naqis'] },
  { id: 'ex-4', title: 'العدد الناقص', requires: ['maqsum-naqis'] },
  { id: 'ex-5', title: 'هل هو حلّ؟', requires: ['ta3rif-muadala'] },
  { id: 'ex-6', title: 'المستطيل', requires: ['tarjama-mushkil'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أترجم وضعية بمعادلة', 'أحلّ معادلة من الأشكال الثلاثة', 'أتحقّق من أنّ قيمة حلّ']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="المعادلة، وحلّها، والتحقّق منه"
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
