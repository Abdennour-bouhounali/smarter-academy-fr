import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, BatchChoiceQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { CASE_FIGURES } from '../content/figures';

/**
 * Module 2 — معارف (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Chaque encadré NOMME ce que l'élève vient de faire : les coordonnées (abscisse puis
 * ordonnée), les deux propriétés (points alignés avec O ⇔ proportionnelle) et leurs refus (une droite hors de O, des points non alignés), le coefficient lu à l'abscisse 1.
 * LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['ماذا أسمّي إحداثيي النقطة؟', 'متى تمثّل النقط وضعية تناسبية؟', 'ماذا يمثّل ترتيب الفاصلة 1؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — التناسبية والبيان"
      moduleSubtitle="أسمّي ما فعلتُه"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'كيف أسمّي العددين اللذين يحدّدان نقطة؟', subtitle: 'الفاصلة والترتيب', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="في النقطة $(6\ ;\ 30)$ : ما اسم العدد $30$ ؟"
                options={['الترتيب', 'الفاصلة', 'المبدأ'].map(M)}
                correct={0} cols={3} requires={['nuqta-jadwal']}
                explain={<MathText>{'الفاصلة تُقرأ على المحور الأفقي ($6$) والترتيب على المحور العمودي ($30$).'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <KnowledgeBrick id="ihdathiyat" lead="العدد الأول والعدد الثاني في زوج النقطة: ماذا نسمّيهما؟" />}
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'متى يمثّل الرسم وضعية تناسبية؟', subtitle: 'الخاصيتان', done: !!q.b,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'هل يُمثّل كلّ رسم وضعية تناسبية؟'}</MathText>}
                rows={[
                  { id: 'r1', label: 'نقط على مستقيم واحد يمرّ بـ $O$', options: ['وضعية تناسبية', 'ليست وضعية تناسبية'], correct: 0, correction: 'النقط على استقامة واحدة مع $O$ : وضعية تناسبية.' },
                  { id: 'r2', label: 'نقط على مستقيم لا يمرّ بـ $O$', options: ['وضعية تناسبية', 'ليست وضعية تناسبية'], correct: 1, correction: 'المستقيم لا يمرّ بـ $O$ : ليست وضعية تناسبية.' },
                  { id: 'r3', label: 'نقط ليست على استقامة واحدة', options: ['وضعية تناسبية', 'ليست وضعية تناسبية'], correct: 1, correction: 'النقط ليست على استقامة: ليست وضعية تناسبية.' },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: نقط على مستقيم يمرّ بـ O فقط.' : 'راجع: يلزم أن تكون النقط على استقامة وأن يمرّ المستقيم بـ O معًا.')}
                onAnswered={answered('b')}
                requires={['khassiya-tanasub']}
              />
              {q.b && <KnowledgeBrick id="tamthil-tanasub" lead="نقط وضعية تناسبية في معلم: أين تقع، وماذا نقول إن لم تكن كذلك؟" />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.property1.text} source={KNOWLEDGE.property1.source} />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.property2.text} source={KNOWLEDGE.property2.source} />}
              {q.b && <TextbookBox kind="remark" compact text={KNOWLEDGE.refuse.text} source={KNOWLEDGE.refuse.source} />}
              {q.b && (
                <div className="flex flex-wrap items-start justify-center gap-3" data-case-figures>
                  {CASE_FIGURES.map((fig, i) => <GeoFigure key={i} {...fig} />)}
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا يمثّل ترتيب الفاصلة 1؟', subtitle: 'معامل التناسبية', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="على مستقيم تناسبية يمرّ بـ $O$ وبالنقطة $(1\ ;\ 4)$ : ماذا نسمّي العدد $4$ ؟"
                options={['معامل التناسبية', 'فاصلة المبدأ', 'عدد النقط'].map(M)}
                correct={0} cols={3} requires={['muamil-qiraa']}
                explain={<MathText>{'العدد $4$ هو ما يقابل الوحدة الواحدة: كلّ ترتيب هو $4$ أمثال الفاصلة.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="remark" compact text={KNOWLEDGE.coefficient.text} source={KNOWLEDGE.coefficient.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
