import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  ACTIVITY, ACTIVITY_LINES, ACTIVITY_3, ACTIVITY_3_LINES, ACTIVITY_4, ACTIVITY_4_LINES, ACTIVITY_5, ACTIVITY_5_LINES, LAB,
} from '../content/textbook';
import {
  FIG_ACT2, FIG_ACT3_FACE_1, FIG_ACT3_FACE_2, FIG_ACT3_EDGE_1, FIG_ACT3_EDGE_2, FIG_ACT4_AXIS, FIG_ACT4_BASE, FIG_ACT5,
} from '../content/figures';

/**
 * Module 1 — أنشطة 2, 3, 4, 5 (pp. 164–165), ouvert sur L'IMPRIMANTE 3D DU FABLAB (section-slicer).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 2) : la sphère R = 3 et les cinq x du manuel, puis — ouverts par l'élève — la بلاطة
 *          25 × 20 × 6, la أسطوانة r = 1,7 et le هرم du نشاط 5 ; chaque couche PRÉDITE avant d'être imprimée ;
 *   مبتدئ : une sphère de rayon 5 aux couches entières (5, 4, 3 et le contact).
 * UNDERSTAND  les questions de chaque نشاط sous les couches imprimées par l'élève (`onTrial`, `[data-activity-evidence]`), les
 *           figures du manuel analysées (la partie 2 du نشاط 3 redessinée sans le « I » égaré), la complétion F, G, H du نشاط 5.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (sphère), P2 (pavé), P3 (cylindre), P4 (pyramide).
 * Le lab est dans l'`intro` (deux niveaux) : le rappel de la « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) clôt la DERNIÈRE étape.
 * Rétrofit 2026-10-15 (§4quater) : l'imprimante ouvre le module (plus de carte du manuel, ni titre ni `lead` de workspace, ni titre de labo) ;
 * `onTrial` aux DEUX niveaux ; une étape 1 POURQUOI la couche rétrécit quand le plan s'éloigne (sur les couches de l'élève, avant la
 * formule IM² du manuel, qui devient l'étape 2) ; les questions du manuel suivent. La brique `maqta-tajribi` était déjà après sa réponse.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const STAGE_NAME = { sphere: 'الكرة', 'cuboid-face': 'البلاطة', 'cuboid-edge': 'البلاطة', 'cylinder-base': 'الأسطوانة', 'cylinder-axis': 'الأسطوانة', pyramid: 'الهرم' };

export default function Module01Anshita() {
  const [trials, setTrials] = useState([]);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);
  const [q7, setQ7] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.tk) setTrials((s) => [...s, ev].slice(-12)); };
  const evidence = (stages, empty) => {
    const mine = trials.filter((t) => stages.includes(t.stage));
    return (
      <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={mine.length ? 'true' : 'false'}>
        {mine.length === 0 ? (
          <p className="text-slate-500"><MathText>{empty}</MathText></p>
        ) : (
          <>
            <p className="mb-1 font-bold text-slate-700">طبقاتك المطبوعة:</p>
            <ul className="flex flex-wrap gap-1.5" data-evidence="layers">
              {mine.map((t) => (
                <li key={t.n} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} data-evidence-layer={t.stage}>
                  {STAGE_NAME[t.stage]}{' '}
                  <MathText>{`$${t.variable}$`}</MathText>{' ← '}<MathText>{t.actual}</MathText>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  };

  return (
    <ContentModule
      objectives={["ماذا تطبع الطابعة كلما غيّرنا بُعد المستوي عن المركز؟", "أيّ شكل نحصل عليه حين نقطع بلاطة أو أسطوانة أو هرما؟", "ما الذي يتغيّر من طبقة إلى أخرى وما الذي يبقى؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="أنشطة 2 و 3 و 4 و 5 — الطابعة ثلاثية الأبعاد"
      moduleSubtitle="الطابعة تبني المجسم طبقة بعد طبقة: ماذا تطبع في كل طبقة؟"
      estimatedTime="20 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="section-slicer"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="3d-printer"
                lead={<MathText>{'كرة مركزها O ونصف قطرها $5$ : الطبقة على بعد $h$ من O، كل سنتيمتر طبقة.'}</MathText>}
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="section-slicer"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="3d-printer"
                lead={<MathText>{'الكرة (d) مركزها O ونصف قطرها $3$ ، والمستوي (P) عمودي على $[NS]$ في I حيث $OI = x$ . جرّب قيم الكتاب ثم افتح المجسمات الأخرى.'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا تصغر الطبقة كلما ابتعد المستوي؟', subtitle: 'من طبقاتك', done: q0,
          content: (
            <div className="space-y-3">
              {evidence(['sphere'], 'لم تطبع بعد أي طبقة من الكرة: اطبع طبقتين على الأقل أعلاه، فتظهر هنا.')}
              <TapQuestion
                prompt={<MathText>{'في طبقاتك: كلما ابتعد المستوي عن المركز $O$ صغرت الدائرة المطبوعة. لماذا؟'}</MathText>}
                options={[
                  'لأن نقط الدائرة تبقى على الكرة: كلما ابتعد المستوي عن $O$ قصر الضلع $IM$ من المثلث القائم $OIM$ ، وطول $OM$ ثابت',
                  // l'impression « réduite » (MISC-MAQTA-SHAKL)
                  'لأن الطابعة تصغّر كل طبقة عن التي قبلها بنسبة ثابتة',
                  // R − x au carré (MISC-MAQTA-TARH)
                  'لأن نصف قطر الدائرة ينقص بالقدر نفسه الذي يبتعد به المستوي',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{'$M$ على الكرة دائما: $OM = R$ ثابت. المثلث $OIM$ قائم في $I$ ووتره $OM$ ثابت، فإذا زاد $OI$ نقص $IM$ . الطابعة لا تصغّر شيئا: الكرة هي التي تضيق.'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 2: عبارة $IM^2$', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.part1}`} source={ACTIVITY.source} compact />
              <SpaceFigure {...FIG_ACT2} />
              {evidence(['sphere'], 'لم تطبع بعد أي طبقة من الكرة: اطبع طبقة أو أكثر في الطابعة أعلاه.')}
              <TapQuestion
                prompt={<MathText>{'M نقطة من المقطع. عبارة $IM^2$ بدلالة x هي:'}</MathText>}
                options={[
                  '$IM^2 = 9 - x^2$',
                  // la somme des carrés (MISC-MAQTA-JAM)
                  '$IM^2 = 9 + x^2$',
                  // R − x élevé au carré (MISC-MAQTA-TARH)
                  '$IM^2 = (3 - x)^2$',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['fithaghuras']}
                explain={<MathText>{ACTIVITY_LINES.im2}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 2: أربعة مستويات', subtitle: 'طبيعة المقطع وعناصره', done: q2,
          content: (
            <div className="space-y-3">
              {evidence(['sphere'], 'اطبع طبقات الكرة (المستوى «متقدم»: قيم الكتاب) ثم أجب.')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">طبيعة المقطع وعناصره:</p>}
                rows={[
                  { id: 'x0', label: <MathText>{'$x = 0$'}</MathText>, options: ['دائرة كبرى مركزها O ونصف قطرها $3$', 'نقطة واحدة هي O', 'دائرة نصف قطرها $\\sqrt{3}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.x0}</MathText> },
                  // 1,75 = 3 − 1,25 (MISC-MAQTA-TARH) ; 3,25 = √(9 + 1,5625) (MISC-MAQTA-JAM)
                  { id: 'x125', label: <MathText>{'$x = 1{,}25$'}</MathText>, options: ['دائرة مركزها I ونصف قطرها $\\dfrac{\\sqrt{119}}{4} \\approx 2{,}73$', 'دائرة مركزها I ونصف قطرها $1{,}75$', 'دائرة مركزها I ونصف قطرها $3{,}25$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.x125}</MathText> },
                  { id: 'x2', label: <MathText>{'$x = 2$'}</MathText>, options: ['دائرة مركزها I ونصف قطرها $\\sqrt{5}$', 'دائرة مركزها I ونصف قطرها $1$', 'دائرة مركزها I ونصف قطرها $\\sqrt{13}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.x2}</MathText> },
                  { id: 'x28', label: <MathText>{'$x = 2{,}8$'}</MathText>, options: ['دائرة مركزها I ونصف قطرها $\\dfrac{\\sqrt{29}}{5} \\approx 1{,}08$', 'دائرة مركزها I ونصف قطرها $0{,}2$', 'لا يقطع المستوي الكرة'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.x28}</MathText> },
                ]}
                requires={['fithaghuras']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كلما ابتعد المستوي عن O صغر نصف قطر المقطع.' : 'راجع التصحيح تحت كل سطر، وقارنه بطبقاتك.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 2: المستوي عند القطب', subtitle: 'السؤال 2', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2} source={ACTIVITY.source} compact />
              <TapQuestion
                prompt={<MathText>{'عندما $x = 3$ ، النقط المشتركة بين الكرة والمستوي (P):'}</MathText>}
                options={[
                  'نقطة واحدة: M تنطبق على I = N، والمستوي مماس للكرة في N',
                  // un « petit cercle » au pôle (MISC-MAQTA-MUMAS)
                  'دائرة صغيرة جدا مركزها N',
                  'لا توجد أي نقطة مشتركة',
                ]}
                correct={0}
                cols={1}
                requires={['kura-markaz']}
                explain={<MathText>{ACTIVITY_LINES.x3}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="maqta-tajribi" lead="ما طبعته الطابعة، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 5, title: 'نشاط 3: مستو موازٍ لوجه', subtitle: 'الجزء 1', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_3.part1} ${ACTIVITY_3.dims}`} source={ACTIVITY_3.source} compact />
              <SpaceFigure {...FIG_ACT3_FACE_1} />
              <SpaceFigure {...FIG_ACT3_FACE_2} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'fig', label: 'الشكل الذي يبيّن المقطع المناسب', options: ['الشكل (1)', 'الشكل (2)'], correct: 0, correction: <MathText>{ACTIVITY_3_LINES.face}</MathText> },
                  // 150 = 25 × 6 (MISC-MAQTA-BUUD) ; 500 = 25 × 20, la face du haut
                  { id: 'area', label: 'مساحة المقطع', options: ['$120\\,\\mathrm{cm}^2$', '$150\\,\\mathrm{cm}^2$', '$500\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_3_LINES.faceArea}</MathText> },
                ]}
                requires={['balata-qaima']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المقطع نسخة من الوجه الموازي له.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 6, title: 'نشاط 3: مستو موازٍ لحرف', subtitle: 'الجزء 2', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY_3.part2} source={ACTIVITY_3.source} compact />
              <SpaceFigure {...FIG_ACT3_EDGE_1} />
              <SpaceFigure {...FIG_ACT3_EDGE_2} />
              <p className="text-xs text-slate-500" data-correction>{ACTIVITY_3.strayLabel}</p>
              {evidence(['cuboid-face', 'cuboid-edge'], 'افتح «البلاطة» في المستوى «متقدم» واطبع طبقة موازية للحرف [CG].')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'fig', label: 'الشكل الذي يبيّن المقطع المناسب', options: ['الشكل (2)', 'الشكل (1)'], correct: 0, correction: <MathText>{ACTIVITY_3_LINES.edge}</MathText> },
                  { id: 'cm', label: <MathText>{'$CM$ و $CN$'}</MathText>, options: ['$CM = 4$ و $CN = 3$', '$CM = 21$ و $CN = 17$', '$CM = 4$ و $CN = 17$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_3_LINES.edgeLengths}</MathText> },
                  // 7 = 4 + 3 (le côté pris pour la somme) ; √7
                  { id: 'mn', label: <MathText>{'$MN$'}</MathText>, options: ['$5\\,\\mathrm{cm}$', '$7\\,\\mathrm{cm}$', '$\\sqrt{7}\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_3_LINES.edgeLengths}</MathText> },
                  { id: 'area', label: 'مساحة المقطع', options: ['$30\\,\\mathrm{cm}^2$', '$42\\,\\mathrm{cm}^2$', '$24\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_3_LINES.edgeArea}</MathText> },
                ]}
                requires={['fithaghuras']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: أحد بعدي المقطع طول الحرف [CG].' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ5(true)}
              />
            </div>
          ),
        },
        {
          num: 7, title: 'نشاط 4: أسطوانة الدوران', subtitle: 'موازٍ للمحور، موازٍ للقاعدة', done: q6,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_4.intro} ${ACTIVITY_4.question}`} source={ACTIVITY_4.source} compact />
              <div className="grid gap-2 lg:grid-cols-2">
                <SpaceFigure {...FIG_ACT4_AXIS} />
                <SpaceFigure {...FIG_ACT4_BASE} />
              </div>
              {evidence(['cylinder-base', 'cylinder-axis'], 'افتح «الأسطوانة» في المستوى «متقدم» واطبع الطبقة عند $OH = 0{,}8$ .')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'n1', label: 'طبيعة المقطع في الشكل (1)', options: ['مستطيل أحد بعديه $6\\,\\mathrm{cm}$', 'دائرة نصف قطرها $1{,}7\\,\\mathrm{cm}$', 'مثلث'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.axis}</MathText> },
                  // 1,8 = 2(1,7 − 0,8) (MISC-MAQTA-TARH) ; 3,4 = le diamètre
                  { id: 'ki', label: <MathText>{'البعد الآخر $KI$'}</MathText>, options: ['$3\\,\\mathrm{cm}$', '$1{,}8\\,\\mathrm{cm}$', '$3{,}4\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.width}</MathText> },
                  { id: 'n2', label: 'طبيعة المقطع في الشكل (2)', options: ['دائرة مركزها B ونصف قطرها $1{,}7\\,\\mathrm{cm}$', 'شكل بيضوي ليس دائرة', 'دائرة نصف قطرها أصغر من $1{,}7\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_4_LINES.base}</MathText> },
                ]}
                requires={['ustuwana-dawaran']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? `أحسنت: ${ACTIVITY_4_LINES.draw}` : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ6(true)}
              />
            </div>
          ),
        },
        {
          num: 8, title: 'نشاط 5: مقطع هرم بمستو', subtitle: 'الأسئلة 1 و 2 و 3', done: q7,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY_5.intro} ${ACTIVITY_5.part1} ${ACTIVITY_5.part2} ${ACTIVITY_5.part3}`} source={ACTIVITY_5.source} compact />
              <p className="text-xs text-slate-500" data-correction><MathText>{ACTIVITY_5.completion}</MathText></p>
              <SpaceFigure {...FIG_ACT5} />
              {evidence(['pyramid'], 'افتح «الهرم» في المستوى «متقدم» واطبع الطبقة عند $\\dfrac{SE}{SA} = \\dfrac{3}{4}$ .')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  // 4 : la base (MISC-MAQTA-HARAM) ; 1 : EA/SA au lieu de SE/SA
                  { id: 'sides', label: 'EF و FG و HG و EH', options: ['كلها $3\\,\\mathrm{cm}$', 'كلها $4\\,\\mathrm{cm}$', 'كلها $1\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_5_LINES.thales}</MathText> },
                  { id: 'ac', label: <MathText>{'$AC$'}</MathText>, options: ['$4\\sqrt{2}\\,\\mathrm{cm}$', '$8\\,\\mathrm{cm}$', '$4\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_5_LINES.diag}</MathText> },
                  { id: 'eg', label: <MathText>{'$EG$'}</MathText>, options: ['$3\\sqrt{2}\\,\\mathrm{cm}$', '$4\\sqrt{2}\\,\\mathrm{cm}$', '$6\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_5_LINES.diag}</MathText> },
                  { id: 'nature', label: 'طبيعة الرباعي EFGH', options: ['مربع ضلعه $3\\,\\mathrm{cm}$', 'معيّن ليس مربعا', 'مستطيل ليس مربعا'].map(M), correct: 0, correction: <MathText>{ACTIVITY_5_LINES.square}</MathText> },
                ]}
                requires={['talis-nisab']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? <MathText>{`أحسنت: ${ACTIVITY_5_LINES.reduction}`}</MathText> : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ7(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
