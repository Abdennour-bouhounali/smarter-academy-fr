import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag } from '../../../../../../common/textbook';
import { addition } from '../../_unit/unitMeta';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY2 } from '../content/textbook';

/**
 * Module 2 — نشاط 2 (p. 78) : « التعرّف على دوال تآلفية ». UNDERSTAND / TOUCH THE MATH.
 *   1. les six règles du livre : laquelle est تآلفية, et ses a et b (هـ : 2 + 3x, a et b quel que soit
 *      l'ordre ; د : x/2 = ½·x) — la brique muamilan ;
 *   2. س 2 du livre : « الدالة الخطيّة هي أيضا دالة تآلفية » — la brique khattiya-taalufiya ;
 *   3. le cas a = 0 (plateforme, déclaré) : un tarif fixe — la brique thabita (ce que l'étape 3 du
 *      compteur a fait toucher).
 * LP : P1 (a et b), P4 (les deux cas particuliers).
 * RÉTROFIT 2026-10-15 (une piste) : plus de rappel de brique ni de carte du livre au-dessus de la première question (la
 * question est l'action) ; la brief ne dit plus la forme ax + b. Pas de lab dans ce module (le compteur est au module 1).
 * « أتوقّع القاعدة » : les questions des étapes 2 et 3 ont pour BONNE OPTION la règle elle-même (b = 0 : la
 * linéaire est affine ; a = 0 : la constante est affine) — chacune est donc enveloppée dans
 * <PredictRule id="khattiya-taalufiya"> / <PredictRule id="thabita"> : l'élève écrit d'abord (predictPrompt
 * de knowledge.jsx), puis la question et la brique s'affichent, une seule « توقّعك ».
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interactive_example');

export default function Module02Tamyiz() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="نشاط 2 — التعرّف على دوال تآلفية"
      moduleSubtitle="أيّها تآلفية؟ ما معاملاها؟ والحالتان الخاصتان"
      estimatedTime="8 دقائق"
      objectives={[
        'أيّ العبارات الست تصف دالة تآلفية؟ وما معاملاها؟',
        'هل الدالة الخطية دالة تآلفية؟',
        'ماذا يحدث لو كان المبلغ لا يتغيّر مع $x$؟',
      ]}
      brief={{
        tag: 'أنشطة — الكتاب ص 78', title: ACTIVITY2.title, tone: 'violet',
        body: <p>ست دوال من الكتاب تحكم عليها بنفسك، ثم حالتان خاصتان تختبر فيهما ما رأيته على العدّاد.</p>,
        footer: <SourceTag source={ACTIVITY2.source} />,
      }}
      steps={[
        {
          num: 1, title: 'ست دوال', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'ما هي الدوال التي تعتبر دوال تآلفية؟ عيّن عندئذ المعاملين $a$ و $b$ لكلّ دالة تآلفية.'}</MathText> <SourceTag source={ACTIVITY2.source} /></p>}
                rows={ACTIVITY2.rows.map((r) => ({ id: r.id, label: M(r.label), options: r.options.map(M), correct: r.correct, correction: M(r.correction) }))}
                requires={['dala-ujra']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: أربع دوال تآلفية من ست.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="muamilan" lead="كيف نقرأ a و b مهما كان ترتيب الكتابة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الدالة الخطية', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <PredictRule id="khattiya-taalufiya">
                <TapQuestion
                  prompt={<MathText>{`ما رأيك في التصريح: ${ACTIVITY2.statement}؟`}</MathText>}
                  options={[
                    M('صحيح: الدالة الخطية $x \\longmapsto ax$ هي $x \\longmapsto ax + b$ مع $b = 0$'),
                    M('خاطئ: الدالة الخطية ليس فيها $b$'),
                    M('صحيح فقط إذا كان $a = 1$'),
                  ]}
                  correct={0}
                  cols={1}
                  requires={['muamilan']}
                  explain={<MathText>{`${ACTIVITY2.q2} مثلا ج) $x \\longmapsto 5x$ : $a = 5$ و $b = 0$ .`}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              </PredictRule>
              {q2 && <KnowledgeBrick id="khattiya-taalufiya" lead="في المرحلة 3 من العدّاد، حين جعلت b = 0 بدأ العدّاد من 0:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'اشتراك لا يتغيّر', subtitle: 'حالة خاصة أخرى', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{'في مكتبة الحيّ التي تشجّع على القراءة، رسم اشتراك التلميذ 300DA مهما كان عدد الكتب $x$ التي يستعيرها. نسمّي $g(x)$ المبلغ المدفوع.'}</MathText> <SourceTag source={PLATFORM} /></p>
              <PredictRule id="thabita">
                <TapQuestion
                  prompt={<MathText>{'الدالة $g : x \\longmapsto 300$ هي:'}</MathText>}
                  options={[
                    M('دالة تآلفية: $a = 0$ و $b = 300$'),
                    M('ليست دالة لأنّ $x$ لا يظهر في عبارتها'),
                    M('دالة خطية معاملها $300$'),
                  ]}
                  correct={0}
                  cols={1}
                  requires={['muamilan']}
                  explain={<MathText>{'$300 = 0 \\times x + 300$ : صورة كل عدد هي 300. أما الدالة الخطية التي معاملها 300 فتعطي $g(2) = 600$ ، لا 300.'}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              </PredictRule>
              {q3 && <KnowledgeBrick id="thabita" lead="وحين جعلت a = 0 في العدّاد، لم يعد يتحرّك مع x:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
