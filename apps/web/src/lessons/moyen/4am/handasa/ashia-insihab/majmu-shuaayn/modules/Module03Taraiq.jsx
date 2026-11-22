import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, NOW, TICE } from '../content/textbook';
import { FIG_METHOD, FIG_METHOD_SOL, FIG_NOW, FIG_NOW_SOL } from '../content/figures';

/**
 * Module 3 — طرائق (p. 133) « إنشاء ممثل لمجموع شعاعين », دوري الآن 2 (p. 133) et le TP GeoGebra (p. 138, optionnel).
 *   1. TOUCH : l'exercice résolu du manuel révélé LIGNE À LIGNE (MethodSteps) — M symétrique de A / I, puis BE = AD et
 *      Chasles : N = E ; la question « pourquoi BE ? » ; brique insha-mumaththil                       (LP P2, P3)
 *   2. دوري الآن 2 : le rectangle ABCD — AB + BD (Chasles), DA + DB (parallélogramme : E symétrique de C / B), le
 *      représentant d'origine A de AC + BC (F symétrique de B / C)                                       (LP P2, P3)
 *   3. أوظّف تكنولوجيات الإعلام والاتصال (OPTIONNEL, déclaré) : les étapes GeoGebra du manuel (outils en code LTR), la
 *      plateforme AJOUTE « ارسم نقطة D » ; ce qu'on observe : un vecteur, des représentants d'origine quelconque  (LP P3)
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q, setQ] = useState({});
  const [solved, setSolved] = useState(false);
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3} objectives={['كيف نجعل شعاعين متعاقبين لنجمعهما؟', 'كيف ننشئ ممثلًا لمجموع شعاعين لهما نفس المبدأ؟', 'هل يتغيّر الشعاع إذا غيّرنا مبدأ ممثّله؟']}
      moduleTitle="طرائق — إنشاء ممثل لمجموع شعاعين"
      moduleSubtitle="بعلاقة شال أو بقاعدة متوازي الأضلاع"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق — الكتاب ص 133 و 138', title: METHOD.title, tone: 'emerald',
        body: <p>تمرين محلول من الكتاب: اقرأ كل سطر وحاول أن تتوقّع السطر التالي قبل أن تكشفه. ثم دورك على مستطيل، ثم جيوجبرا إن شئت.</p>,
        footer: <SourceTag source={METHOD.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تمرين محلول', subtitle: 'نجعل الشعاعين متعاقبين', done: !!q[1],
          content: (
            <div className="space-y-3">
              <GeoFigure {...(solved ? FIG_METHOD_SOL : FIG_METHOD)} />
              {/* Sans `rule` : la règle de méthode (insha-mumaththil) est prédite puis révélée par sa brique (أتوقّع القاعدة). */}
              <MethodSteps method={{ ...METHOD, rule: null }} onAllRevealed={() => setSolved(true)} />
              <TapQuestion
                prompt={<MathText>{'لماذا عيّنا في السؤال 2) شعاعا مبدؤه B ويساوي $\\overrightarrow{AD}$ ؟'}</MathText>}
                options={[
                  'لنجعل الشعاعين متعاقبين (نهاية الأول مبدأ الثاني) فنطبّق علاقة شال',
                  'لأن B منتصف القطعة [AD]',
                  'لأن $\\overrightarrow{AB} = \\overrightarrow{AD}$',
                ].map(M)}
                correct={0} cols={1} requires={['alaqat-shal', 'tasawi-mutawazi']}
                explain={<MathText>{`$\\overrightarrow{AB}$ و $\\overrightarrow{AD}$ لهما نفس المبدأ A: ننقل $\\overrightarrow{AD}$ إلى نهاية $\\overrightarrow{AB}$ بشعاع يساويه، $\\overrightarrow{BE} = \\overrightarrow{AD}$ ، ثم شال.`}</MathText>}
                onAnswered={mark(1)} />
              {q[1] && <KnowledgeBrick id="insha-mumaththil" lead="الطريقة، كما في الكتاب:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'دوري الآن', subtitle: 'مستطيل ABCD', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW.text} source={NOW.source} compact>
                <GeoFigure {...(q[2] ? FIG_NOW_SOL : FIG_NOW)} />
              </TextbookBox>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر الممثل في كل سطر:</p>}
                rows={[
                  { id: 'a1', label: <MathText>{'أ) $\\overrightarrow{AB} + \\overrightarrow{BD}$'}</MathText>, options: ['$\\overrightarrow{AD}$', '$\\overrightarrow{DA}$', '$\\overrightarrow{AC}$'].map(M), correct: 0,
                    correction: <MathText>{'متعاقبان (نهاية الأول B مبدأ الثاني): علاقة شال، $\\overrightarrow{AB} + \\overrightarrow{BD} = \\overrightarrow{AD}$ .'}</MathText> },
                  { id: 'a2', label: <MathText>{'أ) $\\overrightarrow{DA} + \\overrightarrow{DB}$'}</MathText>, options: ['$\\overrightarrow{DE}$ حيث E نظيرة C بالنسبة إلى B', '$\\overrightarrow{DC}$', '$\\overrightarrow{AB}$'].map(M), correct: 0,
                    correction: <MathText>{'نفس المبدأ D: قاعدة متوازي الأضلاع، الرأس الرابع E لمتوازي الأضلاع DAEB هو $E$ حيث $\\overrightarrow{AE} = \\overrightarrow{DB}$ ، أي E نظيرة C بالنسبة إلى B ( $\\overrightarrow{DC}$ يساوي $\\overrightarrow{AB}$ وحده).'}</MathText> },
                  { id: 'b', label: <MathText>{'ب) الممثل الذي مبدؤه A للشعاع $\\overrightarrow{AC} + \\overrightarrow{BC}$'}</MathText>, options: ['$\\overrightarrow{AF}$ حيث F نظيرة B بالنسبة إلى C', '$\\overrightarrow{AB}$', '$\\overrightarrow{AC}$'].map(M), correct: 0,
                    correction: <MathText>{'ننقل $\\overrightarrow{BC}$ إلى نهاية $\\overrightarrow{AC}$ : $\\overrightarrow{CF} = \\overrightarrow{BC}$ ، أي F نظيرة B بالنسبة إلى C ، ثم شال: $\\overrightarrow{AC} + \\overrightarrow{CF} = \\overrightarrow{AF}$ .'}</MathText> },
                ]}
                requires={['insha-mumaththil', 'qaidat-mutawazi', 'muntasaf-nazira']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'شال حين يتعاقب الشعاعان، ومتوازي الأضلاع حين يشتركان في المبدأ.' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={mark(2)} />
            </div>
          ),
        },
        {
          num: 3, title: 'جيوجبرا (اختياري)', subtitle: 'شعاع واحد، ممثلات عديدة', done: !!q[3],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="method" title={TICE.title} source={TICE.source} compact>
                <ol className="ms-5 list-decimal space-y-1 text-sm text-slate-800">
                  {TICE.steps.map((s, i) => (
                    <li key={s} data-tice-step={i}>
                      <MathText>{s}</MathText>
                      {i === TICE.addedStep && <> <SourceTag source={TICE.addedSource} /></>}
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-slate-500" data-correction="tice"><MathText>{TICE.note}</MathText></p>
              </TextbookBox>
              <TapQuestion
                prompt={<MathText>{'ماذا تلاحظ حين تقارن الشعاعين $\\overrightarrow{ME}$ و $\\overrightarrow{AB} + \\overrightarrow{AC}$ ؟'}</MathText>}
                options={[
                  'متساويان: للمجموع ممثلات عديدة، ومبدأ الممثل كيفي',
                  'مختلفان لأن مبدأيهما مختلفان',
                  'متساويان فقط إذا انطبقت M على A',
                ].map(M)}
                correct={0} cols={1} requires={['insha-mumaththil', 'tasawi-mutawazi']}
                explain={<MathText>{'$\\overrightarrow{ME}$ و $\\overrightarrow{AA\'}$ ممثلان لنفس الشعاع $\\vec{w} = \\overrightarrow{AB} + \\overrightarrow{AC}$ : نفس المنحى ونفس الاتجاه ونفس الطول، أينما كان المبدأ.'}</MathText>}
                onAnswered={mark(3)} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
