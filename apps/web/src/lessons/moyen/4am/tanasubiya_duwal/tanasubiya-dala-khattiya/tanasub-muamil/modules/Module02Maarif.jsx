import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, MISTAKES } from '../content/textbook';
import DataTable, { texTable } from '../components/DataTable';

/**
 * Module 2 — معارف. Le manuel n'a pas d'encadré de proportionnalité dans cette unité : chaque
 * connaissance est un RAPPEL déclaré de la plateforme (« تذكير من المنصّة », `prior_year_reminder`),
 * posé par une brique au moment où il sert, sur un exemple déjà vécu (la trottinette, la remise) :
 *   1. calculer le coefficient (muamil-tanasub) — l'erreur du coefficient renversé (0,4) expliquée ;
 *   2. les propriétés des colonnes (khawass-tanasub) ;
 *   3. الرابع المتناسب, × a ou الجداءان المتصالبان (rabi-mutanasib) — l'erreur « + le FARQ » (17) expliquée ;
 *   4. le CONTRASTE : le tarif 50DA + 10DA la minute, son tableau, ses quotients (mablagh-thabit) ;
 *   5. y = a × x (y-ax).
 * « أتوقّع القاعدة » : chaque encadré qui énonce la règle juste avant sa brique est enveloppé dans
 * PredictRule (avec l’id de la brique ; prompt : knowledge.jsx › predictPrompt) ; les titres d'étape ne disent plus la règle.
 * Les questions utilisent d'AUTRES nombres que les encadrés. LP : P1 (1–3), P2 (4), P3 (5).
 * RÉTROFIT 2026-10-15 (guide §4quater, module sans labo) : chaque étape s'ouvre sur la QUESTION à essayer (la leçon 1 a déjà
 * fait calculer y ÷ x) ; « أتوقّع القاعدة », l'encadré qui NOMME et la brique viennent APRÈS la réponse (`{qN && …}`), puis la
 * question d'application quand il y en a une deuxième. Le rappel de `jadwal-tanasub` (nommée au module 1) n'ouvre plus l'étape 1 ;
 * l'étape 4 pose d'abord « est-ce proportionnel ? » sur le tableau des deux formules. Les `requires` des questions qui précèdent
 * leur brique ne la nomment plus.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const near = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;
const YES_NO = ['جدول تناسبية', 'ليس جدول تناسبية'];

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const mb = KNOWLEDGE.mablagh.table;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      objectives={["كيف نقرّر أنّ جدولًا جدول تناسبية؟", "كيف نكمل عمودًا ناقصًا في الجدول؟", "هل كلّ وضعية يزداد فيها السعر تناسبية؟"]}
      moduleNumber={2}
      moduleTitle="معارف — المعامل، الخواص والرابع المتناسب"
      moduleSubtitle="ما نعرفه عن جدول التناسبية، وما يكسرها"
      estimatedTime="14 دقيقة"
      brief={{
        tag: 'معارف — تذكير من المنصّة', title: 'جدول التناسبية: نحسب، نكمل، نميّز', tone: 'violet',
        body: <p><MathText>{'التناسبية درستها في السنوات السابقة، والكتاب ينطلق منها في هذه الوحدة. نجمع هنا ما نحتاجه منها، على رحلات التروتينة وتخفيض العيد: حساب المعامل، خواص الجدول، الرابع المتناسب، وصيغة كراء يزداد فيها السعر: هل هي تناسبية؟'}</MathText></p>,
        footer: <SourceTag source={KNOWLEDGE.jadwal.source} />,
      }}
      steps={[
        {
          num: 1, title: 'معامل التناسبية', subtitle: 'كيف نقرّر؟ وكيف نحسبه؟', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <DataTable rows={[{ label: '$x$', values: [4, 6, 10] }, { label: '$y$', values: [10, 15, 25] }]} />
              <TapQuestion
                prompt="هذا الجدول جدول تناسبية. معامل التناسبية هو:"
                options={['$2{,}5$', '$0{,}4$', '$6$', '$15$'].map(Opt)}
                correct={0}
                cols={4}
                requires={['jadwal-tanasub']}
                explain={<MathText>{MISTAKES.maqlub.right}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <>
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-900" data-mistake="maqlub">
                    <MathText>{`خطأ شائع: ${MISTAKES.maqlub.wrong} ${MISTAKES.maqlub.why}`}</MathText>
                  </p>
                  <PredictRule id="muamil-tanasub"><TextbookBox kind="method" title={KNOWLEDGE.muamil.title} lines={[KNOWLEDGE.muamil.rule, KNOWLEDGE.muamil.example]} source={KNOWLEDGE.muamil.source} compact /></PredictRule>
                  <KnowledgeBrick id="muamil-tanasub" lead="الطريقة التي طبّقتها للتوّ، باسمها:" />
                  <BatchChoiceQuestion
                    intro={<p className="text-sm font-semibold text-slate-700">احسب حواصل القسمة، ثم احكم:</p>}
                    rows={[
                      { id: 't1', label: <MathText>{texTable([2, 3, 5], ['7', '10,5', '17,5'])}</MathText>, options: YES_NO, correct: 0,
                        correction: <MathText>{'$\\dfrac{7}{2} = \\dfrac{10{,}5}{3} = \\dfrac{17{,}5}{5} = 3{,}5$ : جدول تناسبية معامله $3{,}5$.'}</MathText> },
                      { id: 't2', label: <MathText>{texTable([2, 3, 5], [6, 7, 9])}</MathText>, options: YES_NO, correct: 1,
                        correction: <MathText>{'$\\dfrac{6}{2} = 3$ لكن $\\dfrac{7}{3} \\neq 3$ : ليس جدول تناسبية — الفرق $y - x = 4$ هو الثابت هنا، وليس حاصل القسمة.'}</MathText> },
                    ]}
                    requires={['muamil-tanasub']}
                    feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نحكم بحواصل القسمة، لا بالفروق.' : 'راجع التصحيح تحت كل جدول.'}</Feedback>}
                    onAnswered={() => setQ1b(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'خواص الجدول', subtitle: 'ما تقوله الأعمدة بعضها عن بعض', done: q2,
          content: (
            <div className="space-y-3">
              <DataTable rows={[{ label: '$x$', values: [3, 5, 8, 30] }, { label: '$y$', values: ['7,2', '12', '…', '…'] }]} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">هذا جدول تناسبية. أكمل العمودين الناقصين:</p>}
                rows={[
                  { id: 'k8', label: <MathText>{'$x = 8 = 3 + 5$'}</MathText>, options: ['$19{,}2$', '$17$', '$15{,}2$'].map(Opt), correct: 0,
                    correction: <MathText>{'مجموع العمودين: $7{,}2 + 12 = 19{,}2$.'}</MathText> },
                  { id: 'k30', label: <MathText>{'$x = 30 = 10 \\times 3$'}</MathText>, options: ['$37{,}2$', '$72$', '$34{,}2$'].map(Opt), correct: 1,
                    correction: <MathText>{'نضرب العمود الأول في 10: $10 \\times 7{,}2 = 72$.'}</MathText> },
                ]}
                requires={['muamil-tanasub']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الأعمدة تُجمع وتُضرب.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <PredictRule id="khawass-tanasub" prompt={"في جدول التناسبية لرحلات التروتينة اجمع عمودين: هل العمود الناتج عمود من الجدول؟ وماذا يحدث إذا ضربت عمودًا في عدد $k$؟ اكتب القاعدة."}><TextbookBox kind="property" title={KNOWLEDGE.khawass.title} lines={[...KNOWLEDGE.khawass.lines, KNOWLEDGE.khawass.example]} source={KNOWLEDGE.khawass.source} compact /></PredictRule>
                  <KnowledgeBrick id="khawass-tanasub" lead="ما تقوله أعمدة جدول التناسبية بعضها عن بعض:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'الرابع المتناسب', subtitle: 'نكمل عمودا ناقصا', done: q3,
          content: (
            <div className="space-y-3">
              <DataTable rows={[{ label: '$x$', values: [6, 14] }, { label: '$y$', values: [9, '?'] }]} />
              <NumericQuestion
                prompt="هذا جدول تناسبية. العدد الناقص هو:"
                expected={near(21)}
                display="21"
                parse={parseDec}
                requires={['muamil-tanasub']}
                explain={<MathText>{MISTAKES.jama.right}</MathText>}
                explainFor={(n) => (near(17)(n) ? <MathText>{`${MISTAKES.jama.wrong} ${MISTAKES.jama.why}`}</MathText> : null)}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <PredictRule id="rabi-mutanasib"><TextbookBox kind="method" title={KNOWLEDGE.rabi.title} lines={[KNOWLEDGE.rabi.rule, KNOWLEDGE.rabi.example]} source={KNOWLEDGE.rabi.source} compact /></PredictRule>
                  <KnowledgeBrick id="rabi-mutanasib" lead="العمود الناقص في المخبر (12 دقيقة)، طريقةً:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'مبلغ ثابت', subtitle: 'يزداد السعر… فهل هي تناسبية؟', done: q4a && q4,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{'على الكورنيش صيغتان: (أ) 15DA للدقيقة، (ب) 50DA لفتح القفل ثم 10DA للدقيقة. الجدولان للمدد نفسها:'}</MathText></p>
              <DataTable rows={[
                { label: 'المدة $x$', values: mb.x },
                { label: 'السعر (أ)', values: mb.a },
                { label: '$y \\div x$ (أ)', values: mb.ratiosA },
                { label: 'السعر (ب)', values: mb.b },
                { label: '$y \\div x$ (ب)', values: mb.ratiosB },
              ]} />
              <TapQuestion
                prompt="في الصيغة (ب) يزداد السعر كلما ازدادت المدة. هل جدولها جدول تناسبية؟"
                options={[
                  'لا: سعر 0 دقيقة هو 50DA ، وحواصل القسمة تتغيّر (60 ثم 35 ثم 20)',
                  'نعم: لأنّ السعر يزداد كلما ازدادت المدة',
                  'نعم: لأنّ المبلغ 50DA يُدفع في كل الحالات',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['muamil-tanasub']}
                explain={<MathText>{'الزيادة وحدها لا تكفي: رحلة مدتها 0 دقيقة تكلّف 0DA في الصيغة (أ) و 50DA في الصيغة (ب) ، وحواصل القسمة في الصيغة (ب) ليست متساوية.'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <>
                  <PredictRule id="mablagh-thabit"><TextbookBox kind="remark" title={KNOWLEDGE.mablagh.title} lines={[KNOWLEDGE.mablagh.rule, KNOWLEDGE.mablagh.example]} source={KNOWLEDGE.mablagh.source} compact /></PredictRule>
                  <KnowledgeBrick id="mablagh-thabit" lead="ما يرفضه المخبر في الصيغة ب، قاعدةً:" />
                  <BatchChoiceQuestion
                    intro={<p className="text-sm font-semibold text-slate-700">وضعية تناسبية أم لا؟</p>}
                    rows={[
                      { id: 'v1', label: 'كراء دراجة: 40DA للساعة (المدة بالساعات والسعر)', options: ['تناسبية', 'غير تناسبية'], correct: 0,
                        correction: <MathText>{'السعر $= 40 \\times$ المدة: حاصل القسمة 40 ثابت.'}</MathText> },
                      { id: 'v2', label: 'سيارة أجرة: 100DA عند الركوب + 30DA لكل كيلومتر (المسافة والسعر)', options: ['تناسبية', 'غير تناسبية'], correct: 1,
                        correction: <MathText>{'مبلغ ثابت 100DA : من أجل 1km السعر 130DA ($\\dfrac{130}{1} = 130$) ومن أجل 2km السعر 160DA ($\\dfrac{160}{2} = 80$).'}</MathText> },
                      { id: 'v3', label: <MathText>{texTable([2, 4, 6], [5, 7, 9])}</MathText>, options: ['تناسبية', 'غير تناسبية'], correct: 1,
                        correction: <MathText>{'$\\dfrac{5}{2} = 2{,}5$ لكن $\\dfrac{7}{4} = 1{,}75$ : y يزداد، لكن حاصل القسمة يتغيّر.'}</MathText> },
                    ]}
                    requires={['mablagh-thabit', 'muamil-tanasub']}
                    feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الزيادة وحدها لا تكفي.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                    onAnswered={() => setQ4(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'العلاقة بين السطرين', subtitle: 'نكتب الجدول بعبارة', done: q5,
          content: (
            <div className="space-y-3">
              <DataTable rows={[{ label: '$x$', values: [2, 5, 8] }, { label: '$y$', values: ['7', '17,5', '28'] }]} />
              <TapQuestion
                prompt="العلاقة بين سطري هذا الجدول:"
                options={['$y = 3{,}5 \\times x$', '$y = x + 5$', '$x = 3{,}5 \\times y$', '$y = x \\div 3{,}5$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['muamil-tanasub']}
                explain={<MathText>{'$\\dfrac{7}{2} = \\dfrac{17{,}5}{5} = \\dfrac{28}{8} = 3{,}5$ ، إذن $y = 3{,}5 \\times x$. أمّا $y = x + 5$ فتعطي $10$ من أجل $x = 5$ ، وليس $17{,}5$.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <>
                  <PredictRule id="y-ax"><TextbookBox kind="property" title={KNOWLEDGE.yax.title} lines={[KNOWLEDGE.yax.rule, KNOWLEDGE.yax.example]} source={KNOWLEDGE.yax.source} compact /></PredictRule>
                  <KnowledgeBrick id="y-ax" lead="العلاقة التي يكتبها المخبر في مستواه المتقدّم:" />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
