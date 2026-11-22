import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { MethodSteps, SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, QCM } from '../content/textbook';
import { FIG_TARIQA, FIG_QUTR } from '../content/figures';

/**
 * Module 3 — طريقة « من القوس إلى الزاوية » (stage formalization), DÉCLARÉE : le manuel n'a pas de page طرائق pour ce درس
 * (`addition('knowledge_formalization')`, étiquette « معارف من المنصّة »). La méthode est celle que les exercices 10, 11, 12
 * et 16 demandent : le sommet → l'arc → l'angle connu qui intercepte le même arc. TOUCH THE MATH : un exemple de la
 * plateforme (la grande roue de Ben Aknoun) révélé ligne par ligne, puis la question avant la brique ; le cas du diamètre (un
 * angle plat compté comme angle au centre — la lecture du QCM 3, extraction › discrepancies). LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [, setShown] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — من القوس إلى الزاوية"
      moduleSubtitle="الرأس، ثم القوس، ثم الزاوية المعلومة"
      estimatedTime="7 دقائق"
      objectives={["بأيّ خطوات أجد قيس زاوية في دائرة؟", "ماذا يحدث حين يكون الوتر قطرًا؟"]}
      brief={{
        tag: 'طريقة — من المنصّة', title: METHOD.title, tone: 'indigo',
        body: <p>مثال محلول سطرًا سطرًا على عجلة الملاهي، ثم سؤالان لك.</p>,
        footer: <SourceTag source={METHOD.source} />,
      }}
      steps={[
        {
          num: 1, title: 'مثال: عجلة الملاهي', subtitle: 'طريقة من المنصّة', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_TARIQA} />
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exampleText, solution: METHOD.exampleSteps }} onAllRevealed={() => setShown(true)} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'على نفس العجلة، مقعدان آخران: الزاوية المركزية $\\widehat{POQ}$ صارت $110^\\circ$ .'}</MathText></p>}
                rows={[
                  // le double ; l'angle au centre recopié
                  { id: 'pcq', label: <MathText>{'$\\widehat{PCQ}$'}</MathText>, options: ['$55^\\circ$', '$220^\\circ$', '$110^\\circ$'].map(M), correct: 0, correction: <MathText>{'محيطية تحصر القوس PQ مع $\\widehat{POQ}$ : $\\dfrac{110^\\circ}{2} = 55^\\circ$ .'}</MathText> },
                  // la moitié de l'inscrit ; l'angle au centre
                  { id: 'pkq', label: <MathText>{'$\\widehat{PKQ}$'}</MathText>, options: ['$55^\\circ$', '$27{,}5^\\circ$', '$110^\\circ$'].map(M), correct: 0, correction: <MathText>{'$\\widehat{PKQ}$ و $\\widehat{PCQ}$ محيطيتان تحصران القوس PQ نفسه: $55^\\circ$ .'}</MathText> },
                ]}
                requires={['khassiya-nisf', 'khassiya-tasawi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس القوس، نفس الزاوية المحيطية، نصف المركزية.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tariqa-qaws" lead="الطريقة التي طبّقتها:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'حالة القطر', subtitle: 'زاوية مستقيمة', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_QUTR} />
              <TextbookBox kind="remark" text={METHOD.notInscribed} source={METHOD.source} compact />
              <TapQuestion
                prompt={<MathText>{`${QCM[3].reading} إذن $\\widehat{BAC}$ يساوي:`}</MathText>}
                options={['$90^\\circ$', '$180^\\circ$', '$360^\\circ$'].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$\\widehat{BAC} = \\dfrac{1}{2}\\widehat{BOC} = \\dfrac{180^\\circ}{2} = 90^\\circ$ : المثلث ABC قائم في A، كما في «أستعدّ».'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="qutr-qaima" lead="عندما يكون الوتر قطرا:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
