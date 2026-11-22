import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, ACTIVITY_4, ACTIVITY_4_LINES } from '../content/textbook';
import { FIG_ACT4_MODEL } from '../content/figures';

/**
 * Module 2 — نشاط 3 2)–3) et نشاط 4 ب (p. 141) : DE L'EXEMPLE À LA RÈGLE.
 * TOUCH THE MATH : le milieu par l'égalité AI = IB (la brique du module 1) réécrite en composantes, x_I − x_A = x_B − x_I ;
 * la distance par Pythagore dans ABC rectangle en C(x_B ; y_A) — la figure générale du manuel, la lecture de C dite en une
 * ligne (extraction › discrepancies › act-4). Les distracteurs sont les erreurs que le lab a refusées (demi-différence,
 * somme sans ÷ 2, somme des côtés, carré sans racine). Les propriétés elles-mêmes sont posées au module 3 (معارف).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02HalaAmma() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="نشاط 3 و 4 — الحالة العامة"
      moduleSubtitle="ما فعلته بالدبّوس والدرج، بالحروف"
      objectives={['كيف نكتب إحداثيتي منتصف قطعة لأيّ نقطتين؟', 'كيف نعبّر عن المسافة بين نقطتين بإحداثيتيهما؟']} estimatedTime="8 دقائق"
      brief={{
        tag: 'أنشطة — الكتاب ص 141', title: 'من الأمثلة إلى القانونين', tone: 'violet',
        body: <p>ما فعلته بالدبّوس وبالدرج على الخريطة، نكتبه الآن بالحروف لأي نقطتين A و B.</p>,
        footer: <SourceTag source={ACTIVITY.source} />,
      }}
      steps={[
        {
          num: 1, title: 'نشاط 3: إحداثيتا المنتصف', subtitle: 'السؤالان 2) و 3)', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.part2} ${ACTIVITY.part3}`} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'why', label: <MathText>{'أ) لماذا $\\overrightarrow{AI} = \\overrightarrow{IB}$ ؟'}</MathText>, options: ['لأن I منتصف [AB]: للشعاعين نفس المنحى ونفس الاتجاه ونفس الطول', 'لأن $\\overrightarrow{AI} = \\overrightarrow{AB}$', 'لأن I أقرب إلى A منها إلى B'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.why}</MathText> },
                  { id: 'ai', label: <MathText>{'ب) مركبتا $\\overrightarrow{AI}$'}</MathText>, options: ['$\\begin{pmatrix} x_I - x_A \\\\ y_I - y_A \\end{pmatrix}$', '$\\begin{pmatrix} x_A - x_I \\\\ y_A - y_I \\end{pmatrix}$', '$\\begin{pmatrix} x_I \\\\ y_I \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{`النهاية ناقص المبدأ: ${ACTIVITY_LINES.ai}`}</MathText> },
                  { id: 'ib', label: <MathText>{'جـ) مركبتا $\\overrightarrow{IB}$'}</MathText>, options: ['$\\begin{pmatrix} x_B - x_I \\\\ y_B - y_I \\end{pmatrix}$', '$\\begin{pmatrix} x_I - x_B \\\\ y_I - y_B \\end{pmatrix}$', '$\\begin{pmatrix} x_B - x_A \\\\ y_B - y_A \\end{pmatrix}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.ai}</MathText> },
                  { id: 'xi', label: <MathText>{'عبّر عن $x_I$'}</MathText>, options: ['$x_I = \\dfrac{x_A + x_B}{2}$', '$x_I = \\dfrac{x_B - x_A}{2}$', '$x_I = x_A + x_B$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.solve}</MathText> },
                ]}
                requires={['muntasaf-shuaa', 'murakkibat-hisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس الحركة قبل I وبعدها، فـ I في منتصف الفاصلتين ومنتصف الترتيبين.' : 'راجع التصحيح تحت كل سطر: النهاية ناقص المبدأ، ثم نحلّ المعادلة.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="muntasaf-murakkibat" variant="rappel" compact />}
              {q1 && (
                <div className="space-y-2" data-hala-mid>
                  <TextbookBox kind="example" text={`3) ${ACTIVITY_LINES.complete}`} source={ACTIVITY_LINES.source} compact />
                  <p className="text-sm text-slate-700"><MathText>{ACTIVITY_LINES.check}</MathText></p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 4: عبارة المسافة AB', subtitle: 'الجزء ب)', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY_4.partB} source={ACTIVITY_4.source} compact />
              <p className="text-xs text-slate-500" data-reading-note><MathText>{ACTIVITY_4.reading}</MathText></p>
              <GeoFigure {...FIG_ACT4_MODEL} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في الشكل $x_A$ أكبر من $x_B$ و $y_B$ أكبر من $y_A$ . اختر لكل سطر:'}</MathText></p>}
                rows={[
                  { id: 'ac', label: '1) الطول AC', options: ['$AC = x_A - x_B$', '$AC = x_A + x_B$', '$AC = y_B - y_A$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.ac}</MathText> },
                  { id: 'bc', label: '1) الطول BC', options: ['$BC = y_B - y_A$', '$BC = y_A + y_B$', '$BC = x_A - x_B$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.ac}</MathText> },
                  { id: 'ab2', label: <MathText>{'2) $AB^2$'}</MathText>, options: ['$AB^2 = (x_B - x_A)^2 + (y_B - y_A)^2$', '$AB^2 = (x_B - x_A) + (y_B - y_A)$', '$AB^2 = (x_B + x_A)^2 + (y_B + y_A)^2$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.ab2}</MathText> },
                  { id: 'ab', label: '3) AB', options: ['$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$', '$AB = (x_B - x_A)^2 + (y_B - y_A)^2$', '$AB = |x_B - x_A| + |y_B - y_A|$'].map(M), correct: 0, correction: <MathText>{`المسافة هي الجذر التربيعي لـ $AB^2$ : ${ACTIVITY_4_LINES.ab}`}</MathText> },
                  { id: 'again', label: '4) من جديد: KL', options: ['$KL = \\sqrt{(1 - 5)^2 + (-2 - 1)^2} = \\sqrt{25} = 5$ : نفس النتيجة', '$KL = (1 - 5)^2 + (-2 - 1)^2 = 25$', '$KL = |1 - 5| + |-2 - 1| = 7$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.again}</MathText> },
                ]}
                requires={['fithaghuras', 'murakkibat-hisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ضلعا الدرج هما فرقا الإحداثيات، والمسافة وتر المثلث.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
