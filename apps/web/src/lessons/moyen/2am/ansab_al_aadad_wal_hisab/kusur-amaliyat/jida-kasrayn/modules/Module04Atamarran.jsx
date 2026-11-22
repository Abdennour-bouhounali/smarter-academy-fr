import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : sept exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (la plaquette de pâte cuite coupée en 5 × 3 — idée de act-5 ; produits et
 * réduction — ex-15…ex-18 ; l'intrus parmi des produits à trois facteurs — ex-19 ; le volume d'une boîte — ex-26 ; le champ à largeur fractionnaire — ex-27 ; la moitié, le double et le tiers — self-12 ; les places d'une salle — deep-42, avec 450 places). Les erreurs sont
 * corrigées, jamais comptées. LP : P1, P2, P3.
 */
const STEPS = [
  { id: 'ex-1', title: 'لوح الحلوى', requires: ['qaida-jida'] },
  { id: 'ex-2', title: 'احسب واختزل', requires: ['qaida-jida'] },
  { id: 'ex-3', title: 'العدد الدخيل', requires: ['qaida-jida'] },
  { id: 'ex-4', title: 'حجم العلبة', requires: ['qaida-jida'] },
  { id: 'ex-5', title: 'الحقل', requires: ['kasr-min-adad'] },
  { id: 'ex-6', title: 'نصف وضعف وثلث', requires: ['kasr-min-adad'] },
  { id: 'ex-7', title: 'قاعة العرض', requires: ['kasr-min-adad'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أضرب كسرين وأختزل', 'أحسب مساحة وحجمًا بأبعاد كسرية', 'أترجم «من» و«نصف» و«ضعف» و«ثلث» إلى ضرب']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="الجداء، والمساحة، وكسر من كمية"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'سبعة تمارين', tone: 'amber',
        body: <p>سبعة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            {i === 4 && <KnowledgeBrick id="kasr-min-adad" variant="rappel" compact />}
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
