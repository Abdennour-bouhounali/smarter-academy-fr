import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW1, KNOW2, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW1, FIG_REMARK1, FIG_KNOW2, FIG_M2Q1 } from '../content/figures';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 2 — معارف 1 et 2 (p. 106).
 *   1. UNDERSTAND : la propriété dans ses TROIS positions (les trois figures du manuel, redessinées), la brique
 *      khassiyat-talis, puis une figure nouvelle (la فراشة, d'autres lettres) : quelle égalité ?
 *   2. le tableau de proportionnalité : compléter les côtés d'un triangle à partir de l'autre ;
 *   3. TOUCH THE MATH : ملاحظة 1 (deux rapports inégaux ⇒ non parallèles) sur la figure du manuel, brique
 *      adam-tawazi, puis d'autres nombres ;
 *   4. FORMALIZE : معارف 2 — k, تكبير / تصغير, l'exemple CORRIGÉ (MN/AC → MN/BC), brique muamil-tanasub.
 * « أتوقّع القاعدة » : les encadrés du manuel qui ÉNONCENT une règle juste avant sa brique sont enveloppés
 * (PredictRule : khassiyat-talis, adam-tawazi, muamil-tanasub) — l'élève écrit d'abord ; le rappel de
 * talis-nashat vient APRÈS l'encadré (il dirait les rapports égaux), la figure de ملاحظة 1 AVANT (le prompt la lit).
 * Les questions utilisent d'AUTRES nombres que les encadrés. LP : P1 (1–3), P3 (4).
 *   5. « ورقة رانية » (`PeerSheet`, content/peerSheet.js) — rollout mission 2026-11-10 (conseil du 2026-11-10, L1.8) : OB/BA (la قطعة) au lieu de
 *      OB/OA, d'où une hauteur fausse ; l'élève trouve la ligne et la corrige. Même étape sur la page et dans le lecteur.
 * Aucun texte destiné à l'élève ne renvoie au manuel (rollout 2026-11-10).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // les trois situations de la propriété (étape 1) et la remarque de l'étape 3 — les mêmes sur la page et dans le lecteur
  const knowSituations = FIG_KNOW1.map((f, i) => (
    <div key={f.ariaLabel} className="rounded-xl border border-violet-100 bg-white p-1">
      <GeoFigure {...f} />
      <p className="text-center text-xs text-slate-600">{KNOW1.positions[i]}</p>
    </div>
  ));
  const remark = (
    <>
      <PredictRule id="adam-tawazi"><TextbookBox kind="remark" lines={[KNOW1.remark1]} source={KNOW1.source} compact /></PredictRule>
      <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900"><MathText>{KNOW1.remark1Answer}</MathText></p>
    </>
  );
  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — خاصية طالس ومعامل التناسبية"
      moduleSubtitle="ثلاث وضعيات، جدول تناسبية، ومعامل k"
      objectives={['أين يمكن أن تقع النقطتان M و N؟', 'كيف نكتب أطوال المثلثين في جدول؟', 'ماذا نقول إذا اختلفت نسبتان؟', 'متى يكون المثلث تكبيرًا ومتى يكون تصغيرًا؟']}
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: KNOW1.title, tone: 'violet',
        body: <p>المعارف في أربع خطوات: في كل خطوة سؤال أولًا، وبعد جوابك يأتي اسم ما وجدته وملاحظته.</p>,
      }}
      steps={[
        {
          num: 1, title: 'الخاصية في ثلاث وضعيات', subtitle: 'أين تقع M و N؟', done: q1,
          content: (
            <div className="space-y-3">
              <PredictRule id="khassiyat-talis"><TextbookBox kind="property" title={KNOW1.title} text={KNOW1.property} source={KNOW1.source} compact /></PredictRule>
              <KnowledgeBrick id="talis-nashat" variant="rappel" compact />
              {/* lecteur : les TROIS situations sur UN écran (`data-paging-keep`) — l'élève les compare ; le découpage donnait un écran à
                  chacune (« pas d'aller-retour », 2026-11-11). Écran de lecture : la question qui suit a SA figure à côté d'elle. */}
              <PlayerSwitch
                player={<div className="grid gap-2 grid-cols-3" data-paging-keep>{knowSituations}</div>}
                page={<div className="grid gap-2 grid-cols-3">{knowSituations}</div>}
              />
              <p className="text-sm font-semibold text-slate-800"><MathText>{'في الشكل الآتي، المستقيمان $(EG)$ و $(FH)$ متقاطعان في O، و $(EF) \\parallel (GH)$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <GeoFigure {...FIG_M2Q1} />
              <TapQuestion
                prompt="حسب خاصية طالس:"
                options={[
                  '$\\dfrac{OG}{OE} = \\dfrac{OH}{OF} = \\dfrac{GH}{EF}$',
                  '$\\dfrac{OG}{OF} = \\dfrac{OH}{OE} = \\dfrac{GH}{EF}$',
                  '$\\dfrac{OG}{GE} = \\dfrac{OH}{HF} = \\dfrac{GH}{EF}$',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'G يقابل E و H يقابل F (طرفا المستقيمين المتوازيين): $\\dfrac{OG}{OE} = \\dfrac{OH}{OF} = \\dfrac{GH}{EF}$ ، والخاصية صحيحة من الجهة الأخرى للنقطة O أيضا. ($GE$ و $HF$ قطعتان وليستا ضلعين.)'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="khassiyat-talis" lead="ما رأيته في الساحة وفي الشكل، مكتوبًا:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'جدول التناسبية', subtitle: 'أطوال المثلثين', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="property" lines={[KNOW1.results, KNOW1.resultsTable, KNOW1.resultsRows, KNOW1.resultsEnd]} source={KNOW1.source} compact />
              <p className="text-sm font-semibold text-slate-800"><MathText>{'المثلثان AMN و ABC في وضعية طالس، حيث $AM = 2$ ، $AN = 3$ ، $MN = 2{,}5$ و $AB = 6$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'أتمم سطر المثلث ABC (نضرب في $\\dfrac{AB}{AM} = 3$):'}</MathText></p>}
                rows={[
                  // 7 : on ajoute 4 (= 6 − 2) au lieu de multiplier ; 4,5 : on multiplie par 1,5
                  { id: 'ac', label: <MathText>{'$AC$'}</MathText>, options: ['$9$', '$7$', '$4{,}5$'].map(M), correct: 0, correction: <MathText>{'$AC = 3 \\times 3 = 9$ (و 7 يضيف 4 ولا يضرب).'}</MathText> },
                  { id: 'bc', label: <MathText>{'$BC$'}</MathText>, options: ['$6{,}5$', '$7{,}5$', '$5$'].map(M), correct: 1, correction: <MathText>{'$BC = 3 \\times 2{,}5 = 7{,}5$'}</MathText> },
                ]}
                requires={['khassiyat-talis']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الجدول جدول تناسبية، نضرب كل طول في 3.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'متى لا يتوازيان؟', subtitle: 'ملاحظتان', done: q3,
          content: (
            <div className="space-y-3">
              {/* lecteur : la remarque et sa réponse lisent leurs valeurs (2/3, 1/2) SUR la figure — la figure À CÔTÉ d'elles, un écran
                  (« pas d'aller-retour », 2026-11-11 : la figure était seule sur son écran, la remarque sur le suivant) */}
              <PlayerSwitch
                player={(
                  <div className="flex items-start gap-4" data-paging-keep>
                    <div className="w-[38%] shrink-0"><GeoFigure {...FIG_REMARK1} /></div>
                    <div className="min-w-0 flex-1 space-y-3">{remark}</div>
                  </div>
                )}
                page={<><GeoFigure {...FIG_REMARK1} />{remark}</>}
              />
              <p className="text-sm font-semibold text-slate-800"><MathText>{'النقطة M من $[AB]$ و N من $[AC]$ حيث $AM = 3$ ، $AB = 5$ ، $AN = 4$ و $AC = 7$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <TapQuestion
                prompt="المستقيمان (MN) و (BC):"
                options={['غير متوازيين لأن $\\dfrac{3}{5} \\neq \\dfrac{4}{7}$', 'متوازيان لأن $\\dfrac{3}{5}$ و $\\dfrac{4}{7}$ متقاربتان', 'لا يمكن الحكم دون قياس MN و BC'].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'$3 \\times 7 = 21$ و $5 \\times 4 = 20$ : $\\dfrac{3}{5} \\neq \\dfrac{4}{7}$ . نسبتان غير متساويتين تكفيان: لو كانا متوازيين لتساوت النسب حسب خاصية طالس.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="adam-tawazi" lead="إذا لم يتوازَ المستقيمان اختلفت النسب. والعكس يفيدنا:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'معامل التناسبية k', subtitle: 'تكبير أم تصغير؟', done: q4,
          content: (
            <div className="space-y-3">
              <PredictRule id="muamil-tanasub" prompt={"في الخطوة 2 ضربت كل أطوال المثلث في العدد نفسه. إذا كان $AB' = k \\times AB$ و $AC' = k \\times AC$، فمتى يكون المثلث $AB'C'$ تكبيرًا للمثلث $ABC$، ومتى يكون تصغيرًا له؟"}><TextbookBox kind="property" title={KNOW2.title} lines={KNOW2.lines} source={KNOW2.source} compact /></PredictRule>
              <TextbookBox kind="example" text={KNOW2.example} source={KNOW2.source} compact />
              <GeoFigure {...FIG_KNOW2} />
              <p className="text-xs text-slate-500" data-correction><MathText>{KNOW2.correction}</MathText></p>
              <p className="text-sm font-semibold text-slate-800"><MathText>{'المثلثان ABC و AB′C′ في وضعية طالس، حيث $AB = 8$ ، $AB\' = 6$ و $AC = 10$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <TapQuestion
                prompt="المثلث AB′C′ بالنسبة إلى المثلث ABC هو:"
                options={['تصغير بمعامل $\\dfrac{3}{4}$', 'تكبير بمعامل $\\dfrac{4}{3}$', 'تصغير بمعامل $2$'].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'$k = \\dfrac{AB\'}{AB} = \\dfrac{6}{8} = \\dfrac{3}{4} < 1$ : تصغير. ($\\dfrac{4}{3}$ يكبّر AB′C′ إلى ABC، و 2 هو الفرق $8 - 6$ .)'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && <KnowledgeBrick id="muamil-tanasub" lead="النسبة المشتركة التي رأيتها في الساحة (الظلّ ÷ الطول) لها اسم:" />}
              {q4a && (
                <NumericQuestion
                  prompt={<MathText>{'احسب $AC\'$ :'}</MathText>}
                  expected={(x) => Math.abs(x - 7.5) < 1e-9}
                  parse={parseDec}
                  display="7,5"
                  requires={['muamil-tanasub']}
                  explain={<MathText>{'$AC\' = k \\times AC = \\dfrac{3}{4} \\times 10 = 7{,}5$'}</MathText>}
                  explainFor={(n) => <MathText>{n === 8 ? 'طرح 2 من كل طول لا يحفظ التناسب: $AC\' = \\dfrac{3}{4} \\times 10 = 7{,}5$ .' : '$AC\' = \\dfrac{3}{4} \\times 10 = 7{,}5$'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
        { num: 5, title: 'ورقة زميلة: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
