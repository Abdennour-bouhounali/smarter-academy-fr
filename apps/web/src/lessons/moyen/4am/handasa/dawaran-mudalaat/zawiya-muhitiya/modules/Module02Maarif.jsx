import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW4 } from '../content/textbook';
import { FIG_KNOW4_EX1, FIG_KNOW4_EX2, FIG_KNOW4_EX3 } from '../content/figures';

/**
 * Module 2 — معارف 4 (p. 156) « الزاوية المحيطية و الزاوية المركزية في دائرة ».
 * FORMALIZE : 1) les deux définitions (brique tarif) et l'exemple 1 ; 2) خاصية 1 (brique khassiya-nisf) et l'exemple 2 — une
 * mesure à calculer (80° → 40°, l'erreur « le double » expliquée) ; 3) خاصية 2 (brique khassiya-tasawi) et l'exemple 3, avec
 * la coquille du manuel corrigée en une ligne (« AOB و ANB » → AMB). Les figures du manuel, agrandies, mesures de l'extraction
 * (A 240°, B 320°, M 160°, N 100° : AOB = 80°, AMB = ANB = 40°). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الزاوية المحيطية والزاوية المركزية"
      moduleSubtitle="ما وجدته في منطقة الجزاء، بكلمات الكتاب"
      estimatedTime="10 دقائق"
      objectives={["ما الزاوية المركزية وما الزاوية المحيطية؟", "كيف ترتبط الزاويتان اللتان تحصران نفس القوس؟", "ماذا أقول عن محيطيتين تحصران نفس القوس؟"]}
      brief={{
        tag: 'معارف — الكتاب ص 156', title: KNOW4.title, tone: 'violet',
        body: <p>ثلاث أسئلة على أشكال الكتاب، وبعد كل جواب يكتب الكتاب ما وجدتَه في منطقة الجزاء.</p>,
        footer: <SourceTag source={KNOW4.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تعريف الزاويتين', subtitle: 'معارف 4 — تعريف', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW4_EX1} />
              <TextbookBox kind="example" text={KNOW4.example1} source={KNOW4.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">على شكل المثال 1:</p>}
                rows={[
                  { id: 'aob', label: <MathText>{'$\\widehat{AOB}$'}</MathText>, options: ['زاوية مركزية', 'زاوية محيطية', 'ليست مركزية ولا محيطية'], correct: 0, correction: 'رأسها المركز O.' },
                  {
                    id: 'man', label: <MathText>{'$\\widehat{MAN}$'}</MathText>,
                    options: ['زاوية محيطية تحصر القوس $\\overset{\\frown}{MN}$', 'زاوية مركزية', 'زاوية محيطية تحصر القوس $\\overset{\\frown}{AB}$'].map(M),
                    correct: 0, correction: 'رأسها A على الدائرة، وضلعاها يقطعان الدائرة في M و N: تحصر القوس MN.',
                  },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الرأس يحدّد النوع، والضلعان يحدّدان القوس.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tarif" variant="rappel" lead="الزاويتان اللتان قستهما في اللوحة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الخاصية 1: المحيطية نصف المركزية', subtitle: 'معارف 4 — مثال 2', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW4_EX2} />
              <TextbookBox kind="example" text={KNOW4.example2} source={KNOW4.source} compact />
              <NumericQuestion
                prompt={<MathText>{'على هذا الشكل $\\widehat{AOB} = 80^\\circ$ . ما قيس $\\widehat{AMB}$ بالدرجة؟'}</MathText>}
                expected={40}
                parse={parseDec}
                display="40"
                suffix="°"
                explain={<MathText>{'$\\widehat{AMB} = \\dfrac{1}{2}\\widehat{AOB} = \\dfrac{80^\\circ}{2} = 40^\\circ$ .'}</MathText>}
                explainFor={(n) => (n === 160 ? <MathText>{'ضاعفت بدل أن تنصّف: الزاوية المحيطية نصف المركزية، لا ضعفها.'}</MathText> : n === 80 ? <MathText>{'الزاويتان تحصران نفس القوس لكنهما غير متساويتين: المحيطية نصف المركزية.'}</MathText> : null)}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="khassiya-nisf" variant="rappel" lead="ما رأيته في كل مواضع الرامي:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'الخاصية 2: محيطيتان تحصران نفس القوس', subtitle: 'معارف 4 — مثال 3', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW4_EX3} />
              <TextbookBox kind="example" text={KNOW4.example3} source={KNOW4.source} compact />
              <p className="text-xs text-slate-500" data-correction><MathText>{KNOW4.correction3}</MathText></p>
              <TapQuestion
                prompt={<MathText>{'على هذا الشكل $\\widehat{AMB} = 40^\\circ$ . إذن $\\widehat{ANB}$ يساوي:'}</MathText>}
                options={['$40^\\circ$', '$80^\\circ$', '$20^\\circ$'].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$\\widehat{AMB}$ و $\\widehat{ANB}$ محيطيتان تحصران القوس AB نفسه: متقايستان. ($80^\\circ$ هي الزاوية المركزية $\\widehat{AOB}$ ، و $20^\\circ$ نصف المحيطية.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="khassiya-tasawi" lead="ومنه، لزاويتين محيطيتين:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
