import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW4 } from '../content/textbook';

/**
 * Rétrofit 2026-10-15 : l'encadré du manuel et la brique `alaqatan` viennent APRÈS une question sur ce que l'élève a prouvé au module 1
 * (plus de définition avant la question) ; pas de labo dans ce module.
 * Module 2 — معارف 4 « العلاقات المثلثية » (p. 120), stage `discovery` : FORMALIZE.
 *   1. l'encadré du manuel — la coquille « sin²x + sin²x = 1 » CORRIGÉE en une ligne (extraction › know-4 ›
 *      correction) → briques alaqatan puis, après la question sur la notation, kitabat-murabba ;
 *   2. l'exemple 60° (figure redessinée en GeoFigure) → brique mithal-60 ;
 *   3. appliquer tan = sin / cos à une autre zone (5/13, 12/13 — plateforme, déclaré par l'énoncé).
 * « أتوقّع القاعدة » : alaqatan est `rappel` (les deux relations ont été conjecturées puis PROUVÉES au module 1 —
 * takhmin-alaqat, burhan-alaqat) ; mithal-60 est un exemple calculé juste avant (`predict: false`).
 * LP : P1.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={['كيف يكتب الكتاب العلاقتين بين النسب؟', 'ماذا تعني كتابة مربع الجيب؟', 'هل تتحقّق العلاقتان على الزاوية 60 درجة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف 4 — العلاقات المثلثية"
      moduleSubtitle="ما برهنته في النشاط 5، كما يكتبه الكتاب"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 120', title: 'العلاقتان بين النسب المثلثية لزاوية حادة', tone: 'violet',
        body: <p>سؤال عمّا برهنتَه في النشاط 5، ثم إطار الكتاب الذي يكتبه، ثم مثال الزاوية التي قيسها 60 درجة.</p>,
      }}
      steps={[
        {
          num: 1, title: 'الإطار', subtitle: 'معارف 4', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في مثلث الشاطئ 3 ـ 4 ـ 5 وجدتَ $\\dfrac{9}{25} + \\dfrac{16}{25} = 1$ . فأيّ كتابة تصحّ لكل زاوية حادة x ؟'}</MathText>}
                options={[
                  '$(\\cos x)^2 + (\\sin x)^2 = 1$',
                  '$\\cos x + \\sin x = 1$',
                  '$(\\cos x)^2 + (\\sin x)^2 = \\tan x$',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['taarif-nisab']}
                explain={<MathText>{'جمع مربعي نسبتين، لا جمع النسبتين: $\\dfrac{3}{5} + \\dfrac{4}{5} = \\dfrac{7}{5} \\neq 1$ ، أما المربعان فمجموعهما 1 دائمًا (برهان النشاط 5).'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <>
                  <TextbookBox kind="property" text={KNOW4.property} source={KNOW4.source} />
                  <p className="text-xs text-slate-500" data-misprint-correction><MathText>{KNOW4.correction}</MathText></p>
                  <KnowledgeBrick id="alaqatan" variant="rappel" lead="احفظهما:" />
                  <TextbookBox kind="remark" compact text={KNOW4.remark} />
                  <TapQuestion
                    prompt={<MathText>{'الكتابة $\\cos^2 x$ تعني:'}</MathText>}
                    options={['$(\\cos x)^2$', '$\\cos(x^2)$', '$2\\cos x$'].map(M)}
                    correct={0}
                    cols={3}
                    requires={['alaqatan']}
                    explain={<MathText>{'الأس فوق الدالة يخص العدد $\\cos x$ نفسه: $\\cos^2 x = \\cos x \\times \\cos x$ . (لا نربّع الزاوية، ولا نضرب في 2.)'}</MathText>}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              )}
              {q1 && <KnowledgeBrick id="kitabat-murabba" />}
            </div>
          ),
        },
        {
          num: 2, title: 'مثال: الزاوية 60°', subtitle: 'معارف 4 — مثال', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...KNOW4.figure} />
              <p className="text-sm text-slate-800"><MathText>{KNOW4.example[0]}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أتمم كما في الكتاب:</p>}
                rows={[
                  { id: 'tan', label: <MathText>{'$\\tan 60^{\\circ} = \\dfrac{\\sin 60^{\\circ}}{\\cos 60^{\\circ}} = \\dfrac{\\frac{\\sqrt{3}}{2}}{\\frac{1}{2}} =$'}</MathText>, options: ['$\\sqrt{3}$', '$\\dfrac{\\sqrt{3}}{4}$', '$\\dfrac{1}{\\sqrt{3}}$'].map(M), correct: 0, correction: <MathText>{'القسمة على $\\dfrac{1}{2}$ ضرب في 2: $\\dfrac{\\sqrt{3}}{2} \\times 2 = \\sqrt{3}$ — وهو أيضًا $\\dfrac{\\sqrt{3}}{1}$ على الشكل (المقابل على المجاور). ($\\dfrac{1}{\\sqrt{3}}$ مقلوبة.)'}</MathText> },
                  { id: 'sum', label: <MathText>{'$\\left(\\dfrac{1}{2}\\right)^2 + \\left(\\dfrac{\\sqrt{3}}{2}\\right)^2 =$'}</MathText>, options: ['$\\dfrac{1}{4} + \\dfrac{3}{4} = 1$', '$\\dfrac{1}{4} + \\dfrac{\\sqrt{3}}{4}$', '$\\dfrac{1}{2} + \\dfrac{\\sqrt{3}}{2}$'].map(M), correct: 0, correction: <MathText>{'$(\\sqrt{3})^2 = 3$ و $2^2 = 4$ . (الثانية نسيت تربيع الجذر، والثالثة لم تربّع شيئًا.)'}</MathText> },
                ]}
                requires={['alaqatan', 'murabba-jadhr']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? <MathText>{KNOW4.example[2]}</MathText> : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="mithal-60" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل نحتاج إلى رسم المثلث؟', subtitle: 'مثال من المنصّة', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'x زاوية حادة حيث $\\sin x = \\dfrac{5}{13}$ و $\\cos x = \\dfrac{12}{13}$ . دون رسم أي مثلث: $\\tan x =$'}</MathText>}
                options={['$\\dfrac{5}{12}$', '$\\dfrac{12}{5}$', '$\\dfrac{60}{169}$'].map(M)}
                correct={0}
                cols={3}
                requires={['alaqatan']}
                explain={<MathText>{'$\\tan x = \\dfrac{5}{13} \\div \\dfrac{12}{13} = \\dfrac{5}{13} \\times \\dfrac{13}{12} = \\dfrac{5}{12}$ . ($\\dfrac{12}{5}$ هو $\\dfrac{\\cos x}{\\sin x}$ ، و $\\dfrac{60}{169}$ ضرب بدل القسمة.) وتحقّق: $\\dfrac{25}{169} + \\dfrac{144}{169} = 1$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
