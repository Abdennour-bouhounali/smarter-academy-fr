import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { HISTORY, KNOW4, KNOW6, CHALLENGE_SOLVED, REMARKS, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW4 } from '../content/figures';
import RiverFigure from '../components/RiverFigure';

/**
 * Module 2 — معارف 4, 5, 6 (p. 132), l'encadré « ميشال شال » (p. 127, doublon déclaré : la note d'histoire au moment où
 * la relation porte son nom), puis le RETOUR AU تحدّ résolu par le calcul (réponse calculée de l'extraction).
 *   1. FORMALIZE : معارف 4 — la somme par deux translations, علاقة شال (brique alaqat-shal) ; RS + ST, puis KL + MN qui
 *      ne se raccorde pas (MISC-SHUAA-SHAL-AKS, -SHAL-RABT)                                             (LP P2)
 *   2. FORMALIZE : معارف 4 (حالة خاصة) et 5 — le vecteur nul et les opposés (briques shuaa-maadum, mutaakisan) ;
 *      EF + FE est le VECTEUR nul (MISC-SHUAA-SIFR-ADAD), −GH = HG                                         (LP P4)
 *   3. FORMALIZE : معارف 6 — la règle du parallélogramme (brique qaidat-mutawazi) sur un parallélogramme NOUVEAU
 *      (EFGH : l'autre diagonale FH, MISC-SHUAA-QAIDA-QUTR), la remarque du symétrique                    (LP P3)
 *   4. TOUCH THE MATH : le تحدّ — θ = 30° par sin θ = 2/4 (pont vers l'unité 10), la vitesse réelle 2√3 et non 6
 *      (MISC-SHUAA-JAM-ATWAL)                                                                           (LP P3)
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const close = (v) => (n) => Number.isFinite(n) && Math.abs(n - v) < 1e-9;

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2} objectives={['كيف نجمع شعاعين يتعاقبان؟', 'ماذا نسمّي مشوار العودة وماذا نسمّي شعاعين متعاكسين؟', 'كيف نجمع شعاعين لهما نفس المبدأ؟', 'بأيّ زاوية يسبح السبّاح ليصل إلى B؟']}
      moduleTitle="معارف — علاقة شال وقاعدة متوازي الأضلاع"
      moduleSubtitle="ما فعلته يداك بالدراجة وبالسبّاح، بكلمات الكتاب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 132', title: 'مجموع شعاعين', tone: 'violet',
        body: <p>المشواران المتتابعان والسبّاح والتيار: الكتاب يسمّي ما رأيته. كيف نجمع شعاعين يتعاقبان؟ وكيف نجمع شعاعين لهما نفس المبدأ؟</p>,
        footer: <SourceTag source={KNOW4.source} />,
      }}
      steps={[
        {
          num: 1, title: 'علاقة شال', subtitle: 'معارف 4', done: !!q[1],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\overrightarrow{RS} + \\overrightarrow{ST} =$'}</MathText>}
                options={['$\\overrightarrow{RT}$', '$\\overrightarrow{TR}$', '$\\overrightarrow{SS}$'].map(M)}
                correct={0} cols={3}
                explain={<MathText>{`${REMARKS.chainEnd} ( $\\overrightarrow{TR}$ هو العكس: ${REMARKS.reverseWhy})`}</MathText>}
                onAnswered={mark('1a')} />
              {q['1a'] && (
                <>
                <TextbookBox kind="property" title={`1) ${KNOW4.title}: صورة نقطة بانسحابين متتابعين`} text={KNOW4.images} source={KNOW4.source} compact>
                  <GeoFigure {...FIG_KNOW4} />
                </TextbookBox>
                <KnowledgeBrick id="alaqat-shal" variant="rappel" lead="2) مجموع شعاعين، كما في الكتاب:" />
                <TextbookBox kind="remark" title={HISTORY.title} text={HISTORY.text} source={HISTORY.source} compact />
                </>
              )}
              {q['1a'] && (
                <TapQuestion
                  prompt={<MathText>{'K، L، M، N أربع نقط مختلفة. هل نستطيع تبسيط $\\overrightarrow{KL} + \\overrightarrow{MN}$ بعلاقة شال مباشرة؟'}</MathText>}
                  options={[
                    'لا: نهاية الشعاع الأول L ليست مبدأ الشعاع الثاني M',
                    'نعم: $\\overrightarrow{KL} + \\overrightarrow{MN} = \\overrightarrow{KN}$',
                    'نعم: $\\overrightarrow{KL} + \\overrightarrow{MN} = \\overrightarrow{LM}$',
                  ].map(M)}
                  correct={0} cols={1} requires={['alaqat-shal']}
                  explain={<MathText>{REMARKS.gapWarning}</MathText>}
                  onAnswered={mark(1)} />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'الشعاع المعدوم والشعاعان المتعاكسان', subtitle: 'معارف 4 (حالة خاصة) و 5', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\overrightarrow{EF} + \\overrightarrow{FE} =$'}</MathText>}
                options={['$\\vec{0}$', 'العدد 0', '$2\\overrightarrow{EF}$'].map(M)}
                correct={0} cols={3} requires={['alaqat-shal']}
                explain={<MathText>{`علاقة شال: $\\overrightarrow{EF} + \\overrightarrow{FE} = \\overrightarrow{EE} = \\vec{0}$ . ${REMARKS.zeroNumber}`}</MathText>}
                onAnswered={mark('2a')} />
              {q['2a'] && (
                <>
                  <KnowledgeBrick id="shuaa-maadum" variant="rappel" lead="حالة خاصة، كما في الكتاب: مشوار العودة." />
                  <KnowledgeBrick id="mutaakisan" variant="rappel" lead="معارف 5:" />
                </>
              )}
              {q['2a'] && (
                <TapQuestion
                  prompt={<MathText>{'$-\\overrightarrow{GH} =$'}</MathText>}
                  options={['$\\overrightarrow{HG}$', '$\\overrightarrow{GH}$', '$\\vec{0}$'].map(M)}
                  correct={0} cols={3} requires={['mutaakisan']}
                  explain={<MathText>{'معاكس $\\overrightarrow{GH}$ له نفس المنحى ونفس الطول واتجاه معاكس: إنه $\\overrightarrow{HG}$ ، و $\\overrightarrow{GH} + \\overrightarrow{HG} = \\vec{0}$ .'}</MathText>}
                  onAnswered={mark(2)} />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'قاعدة متوازي الأضلاع', subtitle: 'معارف 6', done: !!q[3],
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{'متوازي أضلاع آخر: EFGH (الرؤوس بهذا الترتيب).'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <TapQuestion
                prompt={<MathText>{'EFGH متوازي أضلاع. $\\overrightarrow{EF} + \\overrightarrow{EH} =$'}</MathText>}
                options={['$\\overrightarrow{EG}$', '$\\overrightarrow{FH}$', '$\\overrightarrow{HF}$'].map(M)}
                correct={0} cols={3}
                explain={<MathText>{`للشعاعين نفس المبدأ E ، والرأس المقابل لـ E في EFGH هو G: المجموع هو القطر $\\overrightarrow{EG}$ . [FH] هو القطر الآخر: لا يمرّ بالمبدأ المشترك E.`}</MathText>}
                onAnswered={mark('3a')} />
              {q['3a'] && <KnowledgeBrick id="qaidat-mutawazi" lead="معارف 6: شعاعان لهما نفس المبدأ." />}
              {q['3a'] && (
                <TapQuestion
                  prompt={<MathText>{`${KNOW6.property} النقطة D هي نظيرة A بالنسبة إلى:`}</MathText>}
                  options={['منتصف القطر [BC]', 'النقطة B', 'منتصف [AB]'].map(M)}
                  correct={0} cols={1} requires={['qaidat-mutawazi', 'muntasaf-nazira']}
                  explain={<MathText>{`${KNOW6.remark} قطرا متوازي الأضلاع ABDC هما [AD] و [BC] ، ولهما نفس المنتصف.`}</MathText>}
                  onAnswered={mark(3)} />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'عودة إلى التحدّ', subtitle: 'قاعدة متوازي الأضلاع وحساب المثلثات', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تحدّ" text={CHALLENGE_SOLVED.lines[0]} source={CHALLENGE_SOLVED.source} compact>
                <RiverFigure />
              </TextbookBox>
              <p className="text-sm text-slate-800"><MathText>{CHALLENGE_SOLVED.lines[1]}</MathText></p>
              <NumericQuestion
                prompt={<MathText>{'قيس الزاوية θ بين $\\vec{s}$ و (AB) ، بالدرجة:'}</MathText>}
                expected={close(30)} display="30" parse={parseDec}
                requires={['qaidat-mutawazi', 'jayb']}
                explain={<MathText>{CHALLENGE_SOLVED.lines[2]}</MathText>}
                explainFor={(n) => <MathText>{close(60)(n) ? '$60^{\\circ}$ هي الزاوية مع الحافة: المطلوب الزاوية مع (AB) ، أي $90^{\\circ} - 60^{\\circ} = 30^{\\circ}$ .'
                  : close(27)(n) || close(26.57)(n) ? 'هذا $\\tan\\theta = \\dfrac{2}{4}$ : 4 هو طول $\\vec{s}$ ، أي الوتر لا الضلع المجاور. الجيب: $\\sin\\theta = \\dfrac{2}{4}$ .'
                    : CHALLENGE_SOLVED.lines[2]}</MathText>}
                onAnswered={mark('4a')} />
              {q['4a'] && (
                <TapQuestion
                  prompt="السرعة الفعلية للسبّاح حين يسبح بهذه الزاوية:"
                  options={['$2\\sqrt{3} \\approx 3{,}46\\,\\mathrm{km/h}$', '$4 + 2 = 6\\,\\mathrm{km/h}$', '$\\sqrt{4^2 + 2^2} \\approx 4{,}47\\,\\mathrm{km/h}$'].map(M)}
                  correct={0} cols={1} requires={['qaidat-mutawazi', 'fithaghuras']}
                  explain={<MathText>{`${CHALLENGE_SOLVED.lines[3]} ${REMARKS.lengthsWhy}`}</MathText>}
                  onAnswered={mark(4)} />
              )}
              {q[4] && <p className="text-xs text-slate-600" data-bridge="unit10"><MathText>{CHALLENGE_SOLVED.bridge}</MathText></p>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
