import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW } from '../content/textbook';
import { Dustur } from '../components/Figures';

/**
 * Module 3 — معارف (formalization) : FORMALIZE. Le manuel n'a pas de معارف sur le tableur : ce module pose
 * les معارف ÉCRITES PAR LA PLATEFORME (`knowledge_formalization`, étiquette « معارف من المنصّة ») dans les
 * mots des exercices — cellule, plage, saisie et enregistrement, دستور, les quatre دساتير, les noms
 * français (manuel) et anglais, le graphique de chaque donnée. Puis trois vérifications : associer chaque
 * indicateur à son دستور (P2), chaque donnée à son graphique (P3), lire une plage (P1). LP : P1, P2, P3.
 */
const D = (f) => <Dustur key={f}>{f}</Dustur>;

export default function Module03Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={["كيف أسمّي خلية وأحدّد مجالًا؟", "أيّ دستور يناسب كل مؤشّر؟", "أيّ تمثيل يناسب أيّ معطيات؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف"
      moduleSubtitle="المجدول: خلايا، مجال، دستور، تمثيل"
      estimatedTime="6 دقائق"
      brief={{
        tag: 'معارف من المنصّة', title: KNOW.title, tone: 'violet',
        body: <p>ما فعلته في المجدول، مكتوبًا بكلمات الكتاب: احجز، حدّد الخلايا، الدستور، ENTER.</p>,
        footer: <SourceTag source={KNOW.source} />,
      }}
      steps={[
        {
          num: 1, title: 'الخلية، المجال، الدستور', subtitle: 'ودساتير المؤشّرات الأربعة', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-bold">السلسلة في المجال A1:G1 . الدستور المناسب لكل مؤشّر:</p>}
                rows={[
                  { id: 'r', label: 'المدى', options: [D('=MAX(A1:G1)-MIN(A1:G1)'), D('=MAX(A1:G1)'), D('=MODE(A1:G1)')], correct: 0, correction: <MathText>{'المدى فرق: أكبر قيمة ناقص أصغر قيمة؛ MAX وحده يعطي أكبر قيمة.'}</MathText> },
                  { id: 'm', label: 'الوسيط', options: [D('=MEDIAN(A1:G1)'), D('=MOYENNE(A1:G1)'), D('=MIN(A1:G1)')], correct: 0, correction: <MathText>{'MEDIAN هو اسم MEDIANE في مجدول بالإنجليزية؛ MOYENNE للمتوسط.'}</MathText> },
                  { id: 'a', label: 'المتوسط', options: [D('=AVERAGE(A1:G1)'), D('=MEDIANE(A1:G1)'), D('=MODE(A1:G1)')], correct: 0, correction: <MathText>{'AVERAGE هو اسم MOYENNE في مجدول بالإنجليزية.'}</MathText> },
                  { id: 'o', label: 'المنوال', options: [D('=MODE(A1:G1)'), D('=MAX(A1:G1)'), D('=MEDIANE(A1:G1)')], correct: 0, correction: <MathText>{'المنوال القيمة ذات أكبر تكرار، لا أكبر قيمة.'}</MathText> },
                ]}
                requires={['dasatir-arbaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كل مؤشّر ودستوره.' : 'اقرأ التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <TextbookBox kind="definition" title="المجدول" lines={[KNOW.cells, KNOW.range, KNOW.entry, KNOW.formula]} source={KNOW.source} compact />
                  <TextbookBox kind="property" title="دساتير المؤشّرات" lines={KNOW.four} source={KNOW.source} compact />
                  <KnowledgeBrick id="asmaa-dawal" lead="الكتاب يكتب أسماء الدوال بالفرنسية:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'التمثيل المناسب', subtitle: 'أعمدة، دائري، مدرّج', done: q2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-bold">التمثيل المناسب لكل معطيات:</p>}
                rows={[
                  { id: 'b', label: 'عدد الإخوة لكل تلميذ في القسم: 0 ، 1 ، 2 ، 3 ، 4 وتكراراتها', options: ['مخطط بالأعمدة', 'مخطط دائري', 'مدرّج تكراري'], correct: 0, correction: 'قيم منفصلة: عمود لكل قيمة.' },
                  { id: 'p', label: 'توزيع ميزانية نادي القسم على اللباس والتنقّل والتجهيز', options: ['مخطط بالأعمدة', 'مخطط دائري', 'مدرّج تكراري'], correct: 1, correction: 'أجزاء من كلّ (الميزانية): زاوية كل قطاع تتناسب مع حصته.' },
                  { id: 'h', label: 'أطوال تلاميذ مجمّعة في فئات 150–155 ، 155–160 ، 160–165', options: ['مخطط بالأعمدة', 'مخطط دائري', 'مدرّج تكراري'], correct: 2, correction: 'فئات متلاصقة: مستطيلات متلاصقة.' },
                ]}
                requires={['tamthil-munasib']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت.' : 'اقرأ التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" title="أيّ تمثيل؟" lines={KNOW.charts} source={KNOW.source} compact />}
            </div>
          ),
        },
        {
          num: 3, title: 'مجال آخر', subtitle: 'سلسلة في عمود', done: q3,
          content: (
            <TapQuestion
              prompt="حجزنا نقاط 12 تلميذًا في العمود B من الخلية B2 إلى الخلية B13. دستور متوسطها:"
              options={[D('=MOYENNE(B2:B13)'), D('=MOYENNE(B2:B12)'), D('=MOYENNE(A1:L1)'), D('=MOYENNE(B2;B13)')]}
              correct={0}
              cols={2}
              requires={['khaliya-majal', 'dustur', 'dasatir-arbaa']}
              explain={<MathText>{'المجال من B2 إلى B13 يضمّ الخلايا الاثنتي عشرة. B2:B12 تنقصه B13 ، و A1:L1 سطر لا يحمل النقاط، والفاصلة المنقوطة في B2;B13 تعني الخليتين B2 و B13 وحدهما.'}</MathText>}
              onAnswered={() => setQ3(true)}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
