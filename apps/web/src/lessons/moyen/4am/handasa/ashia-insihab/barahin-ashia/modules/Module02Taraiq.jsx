import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROOF_STEPS, METHOD_PROOF, CONCLUSIONS, NOW133 } from '../content/textbook';
import { FIG_METHOD, FIG_NOW133 } from '../content/figures';

/**
 * Module 2 — طرائق (stage `discovery` : TOUCH → FORMALIZE). La démarche (traduire · transformer · conclure) et le tableau
 * de ce qu'on conclut sont une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`) ; la طريقة p. 133 et
 * دوري الآن 1 sont du manuel, au mot près.
 *   1. les trois étapes ; « I منتصف [AB] » se traduit AI = IB              → brique khatawat-burhan (P2)
 *   2. la طريقة p. 133 révélée ligne à ligne ; pourquoi ABDC (l'ordre)        → brique tariqat-abdc    (P2)
 *   3. de l'égalité à la conclusion (milieu, parallélogramme, parallèles ; Chasles seule ne prouve rien) → istintajat (P2)
 *   4. دوري الآن 1 : l'élève enchaîne la preuve de BC = DE                     (P1/P2, sans nouvelle brique)
 * « أتوقّع القاعدة » : les boîtes des étapes 1 et 3 ÉNONCENT la règle de leur brique ; boîte et question sont enveloppées
 * dans une PredictRule (même id que la brique) — l'élève écrit d'abord (predictPrompt de knowledge.jsx), puis lit. La brique tariqat-abdc
 * est un rappel : « AB = CD ⇔ ABDC متوازي أضلاع » et les diagonales de même milieu sont posées aux leçons 1 et 2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Taraiq() {
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2} objectives={['كيف نكتب برهانًا بالأشعة خطوة خطوة؟', 'لماذا كتب الكتاب ABDC لا ABCD؟', 'ماذا نستنتج من مساواة شعاعية؟', 'هل أستطيع أن أبرهن «دوري الآن» وحدي؟']}
      moduleTitle="طرائق — كيف نبرهن بالأشعة؟"
      moduleSubtitle="ما فعلته في المترو، مكتوبا خطوة خطوة"
      estimatedTime="12 دقيقة"
      brief={{
        tag: 'طرائق — الكتاب ص 133، ومعارف من المنصّة', title: 'كيف نكتب برهانًا بالأشعة؟ وماذا تعطينا المساواة التي نصل إليها؟', tone: 'emerald',
        body: <p>في المترو حوّلت عبارة شعاعية خطوة خطوة حتى وصلت إلى الشعاع المطلوب. هذه هي طريقة البرهان بالأشعة: نكتبها، ثم نقرأ طريقة الكتاب سطرا سطرا، ثم تبرهن «دوري الآن» بنفسك.</p>,
        footer: <SourceTag source={PROOF_STEPS.source} />,
      }}
      steps={[
        {
          num: 1, title: 'خطوات البرهان', subtitle: 'نترجم · نحوّل · نستنتج', done: !!q[1],
          content: (
            <div className="space-y-3">
              <PredictRule id="khatawat-burhan">
                <TapQuestion
                  prompt={<MathText>{'لنبرهن أن النقطة I منتصف القطعة [AB]، نترجم المطلوب إلى:'}</MathText>}
                  options={['$\\overrightarrow{AI} = \\overrightarrow{IB}$', '$\\overrightarrow{AI} = \\overrightarrow{BI}$', 'الطولان AI و IB متساويان فقط'].map(M)}
                  correct={0} cols={1} requires={['muntasaf-shuaa', 'rabt-shal']}
                  explain={<MathText>{'I منتصف [AB] يعني $\\overrightarrow{AI} = \\overrightarrow{IB}$ : نفس المنحى ونفس الاتجاه ونفس الطول. $\\overrightarrow{BI}$ يعاكس $\\overrightarrow{IB}$ ، وتساوي الطولين وحده تحقّقه كل نقطة من محور [AB].'}</MathText>}
                  onAnswered={mark(1)} />
              </PredictRule>
              {q[1] && (
                <>
                  <TextbookBox kind="method" title={PROOF_STEPS.title} lines={PROOF_STEPS.lines} source={PROOF_STEPS.source} compact />
                  <KnowledgeBrick id="khatawat-burhan" lead="ما فعلته في المترو، مكتوبا:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'طريقة الكتاب', subtitle: 'استعمال تساوي شعاعين لإنجاز برهان', done: !!q[2],
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD} />
              <MethodSteps method={{ source: METHOD_PROOF.source, exercise: METHOD_PROOF.exercise, solution: METHOD_PROOF.solution, rule: METHOD_PROOF.rule }} />
              <TapQuestion
                prompt={<MathText>{'لماذا كتب الكتاب «$\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني الرباعي ABDC متوازي أضلاع» لا ABCD؟'}</MathText>}
                options={[
                  'لأن $\\overrightarrow{AB} = \\overrightarrow{CD}$ يعني أن الانتقال من A إلى B هو نفسه من C إلى D ، فالرؤوس بالترتيب A ثم B ثم D ثم C',
                  'لأن ABCD و ABDC اسمان لنفس الرباعي',
                  'لأن I منتصف [AB]',
                ].map(M)}
                correct={0} cols={1} requires={['khatawat-burhan', 'tasawi-shuaayn']}
                explain={<MathText>{`${METHOD_PROOF.rule} ABCD بهذا الترتيب رباعي آخر: متقاطع الضلعين.`}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && <KnowledgeBrick id="tariqat-abdc" variant="rappel" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا نستنتج؟', subtitle: 'من المساواة إلى الخاصية', done: !!q[3],
          content: (
            <div className="space-y-3">
              <PredictRule id="istintajat">
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">ماذا نستنتج من كل مساواة؟</p>}
                  rows={[
                    { id: 'mid', label: <MathText>{'$\\overrightarrow{RS} = \\overrightarrow{ST}$'}</MathText>, options: ['S منتصف [RT]', 'R منتصف [ST]', 'RST مثلث متقايس الأضلاع'].map(M), correct: 0,
                      correction: <MathText>{'$\\overrightarrow{RS} = \\overrightarrow{ST}$ : S منتصف [RT]، فالنقط R و S و T على استقامة واحدة (لا مثلث).'}</MathText> },
                    { id: 'para', label: <MathText>{'$\\overrightarrow{MN} = \\overrightarrow{QP}$ (و M و N و P ليست على استقامة)'}</MathText>, options: ['MNPQ متوازي أضلاع', 'MNQP متوازي أضلاع', 'N منتصف [MP]'].map(M), correct: 0,
                      correction: <MathText>{'$\\overrightarrow{MN} = \\overrightarrow{QP}$ : الرباعي MNPQ متوازي أضلاع (من M إلى N كما من Q إلى P).'}</MathText> },
                    { id: 'par', label: <MathText>{'$\\overrightarrow{EF} = \\overrightarrow{GH}$'}</MathText>, options: ['(EF) و (GH) متوازيان أو منطبقان', '(EF) و (GH) متعامدان', 'EFGH متوازي أضلاع'].map(M), correct: 0,
                      correction: <MathText>{'شعاعان متساويان لهما نفس المنحى: (EF) // (GH) أو منطبقان؛ ومتوازي الأضلاع هو EFHG لا EFGH.'}</MathText> },
                    { id: 'shal', label: <MathText>{'$\\overrightarrow{XY} + \\overrightarrow{YZ} = \\overrightarrow{XZ}$'}</MathText>, options: ['لا نستنتج شيئا عن موضع Y', 'Y تقع على [XZ]', 'Y منتصف [XZ]'].map(M), correct: 0,
                      correction: <MathText>{CONCLUSIONS.warning}</MathText> },
                  ]}
                  requires={['khatawat-burhan', 'muntasaf-shuaa', 'tasawi-shuaayn']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'كل مساواة تبرهن خاصية، ما عدا علاقة شال: صحيحة دائما.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                  onAnswered={mark(3)} />
              </PredictRule>
              {q[3] && (
                <>
                  <TextbookBox kind="definition" title={CONCLUSIONS.title} lines={CONCLUSIONS.lines} source={CONCLUSIONS.source} compact />
                  <KnowledgeBrick id="istintajat" />
                  <p className="text-xs text-slate-600" data-misconception-note="shal-istiqama"><MathText>{`انتبه: ${CONCLUSIONS.warning}`}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن', subtitle: 'برهن أن BC = DE', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW133.text} source={NOW133.source} compact>
                <GeoFigure {...FIG_NOW133} />
              </TextbookBox>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أكمل البرهان سطرا سطرا:</p>}
                rows={[
                  { id: 'p1', label: 'ABDC متوازي أضلاع، إذن', options: ['$\\overrightarrow{AC} = \\overrightarrow{BD}$', '$\\overrightarrow{AC} = \\overrightarrow{DB}$', '$\\overrightarrow{AB} = \\overrightarrow{DC}$'].map(M), correct: 0,
                    correction: <MathText>{'في ABDC: من A إلى C كما من B إلى D، أي $\\overrightarrow{AC} = \\overrightarrow{BD}$ (و $\\overrightarrow{AB} = \\overrightarrow{CD}$ لا $\\overrightarrow{DC}$ ).'}</MathText> },
                  { id: 'p2', label: 'E نظيرة A بالنسبة إلى C، إذن', options: ['$\\overrightarrow{AC} = \\overrightarrow{CE}$', '$\\overrightarrow{AC} = \\overrightarrow{EC}$', '$\\overrightarrow{CA} = \\overrightarrow{CE}$'].map(M), correct: 0,
                    correction: <MathText>{'C منتصف [AE]: $\\overrightarrow{AC} = \\overrightarrow{CE}$ .'}</MathText> },
                  { id: 'p3', label: <MathText>{'إذن $\\overrightarrow{BD} = \\overrightarrow{CE}$ ، فالرباعي … متوازي أضلاع'}</MathText>, options: ['BDEC', 'BDCE', 'BCDE'].map(M), correct: 0,
                    correction: <MathText>{'$\\overrightarrow{BD} = \\overrightarrow{CE}$ يعني BDEC متوازي أضلاع (طريقة الكتاب: AB = CD يعني ABDC).'}</MathText> },
                  { id: 'p4', label: 'ومنه', options: ['$\\overrightarrow{BC} = \\overrightarrow{DE}$', '$\\overrightarrow{BC} = \\overrightarrow{ED}$', '$\\overrightarrow{BE} = \\overrightarrow{CD}$'].map(M), correct: 0,
                    correction: <MathText>{'في متوازي الأضلاع BDEC: $\\overrightarrow{BC} = \\overrightarrow{DE}$ ؛ [BE] و [CD] قطراه، وليسا شعاعين متساويين.'}</MathText> },
                ]}
                requires={['tariqat-abdc', 'istintajat', 'muntasaf-shuaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? NOW133.proof : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={mark(4)} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
