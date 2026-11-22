import { useState } from 'react';
import { BossFinal, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, BONUS } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de la piste de l'école en quatre épreuves qui suivent les trois étapes (écrire P₁ P₂ P₃, simplifier les différences,
 * évaluer et décider). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js,
 * qui vérifie que ce fichier contient chaque option. Chaque distracteur est FAUX et porte une erreur de l'unité. Le تحدّ est un BONUS non compté (`synthese`), jamais une preuve de maîtrise.
 * LP : P1 (E1, E2) et P2 (E3, E4).
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

function Bonus() {
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4" data-bonus>
      <h3 className="font-bold text-amber-900">🏅 تحدٍّ إضافي (غير محسوب)</h3>
      <TapQuestion prompt={<MathText>{BONUS.text}</MathText>} options={opts(BONUS.options)} correct={BONUS.correct} cols={4} requires={['nashr-jabri-3am']}
        explain={<MathText>{BONUS.explain}</MathText>} onAnswered={() => setDone(true)} />
      {done && <p className="text-xs text-amber-800">لا يدخل التحدّي في نتيجتك؛ إنّه فرصة لتختبر أدواتك.</p>}
    </div>
  );
}

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="أربع مراحل: الأطوال والفروق والقيم والقرار" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'لماذا تنطلق ريم وإيناس أمام سلمى؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        ecrire: { label: 'كتابة الأطوال بالحروف', module: 2 },
        basit: { label: 'تبسيط الفرق', module: 5 },
        qima: { label: 'حساب القيمة', module: 6 },
        qarar: { label: 'اتخاذ القرار', module: 4 },
      }}
      epreuves={[
        { id: 'E1', skill: 'ecrire', requires: ['qimat-ibara-harfiya-3am'], prompt: <Q>المرحلة 1 — أطوال مسارات الرواقات الثلاثة ($P_1$ و $P_2$ و $P_3$) هي ...</Q>,
          options: opts(['$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi(x + 2{,}4)$ ؛ $P_3 = 2y + \\pi(x + 4{,}8)$', '$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi(x + 1{,}2)$ ؛ $P_3 = 2y + \\pi(x + 2{,}4)$', '$P_1 = 2y + \\pi x$ ؛ $P_2 = 2y + \\pi x + 2{,}4$ ؛ $P_3 = 2y + \\pi x + 4{,}8$', '$P_1 = y + \\pi x$ ؛ $P_2 = y + \\pi(x + 2{,}4)$ ؛ $P_3 = y + \\pi(x + 4{,}8)$']), correct: 0, cols: 1,
          explain: <MathText>{'كل رواق يتّسع بعرضه من الجانبين، فيزيد القطر $2 \\times 1{,}2 = 2{,}4$ عن الرواق السابق، ومحيط الدائرة $\\pi \\times$ القطر، مع المستقيمين $2y$ . الخطأ الثاني زاد القطر بعرض واحد، والثالث نسي ضرب الزيادة في $\\pi$ ، والرابع عدّ مستقيمًا واحدًا.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1'] } },
        { id: 'E2', skill: 'basit', requires: ['tabsit-hadhf-aqwas-3am'], prompt: <Q>المرحلة 2 — بعد التبسيط، $P_2 - P_1$ و $P_3 - P_1$ يساويان ...</Q>,
          options: opts(['$P_2 - P_1 = 2{,}4\\pi$ و $P_3 - P_1 = 4{,}8\\pi$ ، ولا يتعلّقان بـ $x$ ولا بـ $y$', '$P_2 - P_1 = 2y + 2{,}4\\pi$ و $P_3 - P_1 = 2y + 4{,}8\\pi$', '$P_2 - P_1 = 2{,}4$ و $P_3 - P_1 = 4{,}8$', '$P_2 - P_1 = 4y + 2\\pi x + 2{,}4\\pi$ و $P_3 - P_1 = 4y + 2\\pi x + 4{,}8\\pi$']), correct: 0, cols: 1,
          explain: <MathText>{'$2y + \\pi(x + 2{,}4) - (2y + \\pi x) = 2y + \\pi x + 2{,}4\\pi - 2y - \\pi x = 2{,}4\\pi$ : الحدّان $2y$ و $\\pi x$ يختفيان، فالفرق لا يتعلّق بشكل المضمار. الخطأ الثاني لم يطرح المستقيمين، والثالث أضاع $\\pi$ ، والرابع جمع بدل أن يطرح.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P1'] } },
        { id: 'E3', skill: 'qima', requires: ['qimat-ibara-harfiya-3am'], prompt: <Q>{'المرحلة 3 — بمفتاح $\\pi$ في الآلة الحاسبة وتدوير النتيجة إلى $0{,}01$ ، تتقدّم ريم على سلمى بحوالي ... وتتقدّم إيناس عليها بحوالي ...'}</Q>,
          options: opts(['$7{,}54\\,\\text{m}$ و $15{,}08\\,\\text{m}$', '$2{,}4\\,\\text{m}$ و $4{,}8\\,\\text{m}$', '$7{,}54\\,\\text{m}$ و $22{,}62\\,\\text{m}$', '$0{,}76\\,\\text{m}$ و $1{,}53\\,\\text{m}$']), correct: 0, cols: 1,
          explain: <MathText>{'$2{,}4\\pi \\approx 7{,}5398 \\approx 7{,}54$ و $4{,}8\\pi \\approx 15{,}0796 \\approx 15{,}08$ . الثاني ترك $\\pi$ ، والثالث أخذ ثلاثة أضعاف الأوّل لإيناس، والرابع قسم على $\\pi$ بدل أن يضرب.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'] } },
        { id: 'E4', skill: 'qarar', requires: ['muqaranat-natiqayn-3am'], prompt: <Q>المرحلة 4 — طول مسار سلمى من أجل $y = 85$ و $x = 73$ ، وما يفسّر انطلاق إيناس أمامها ...</Q>,
          options: opts(['$P_1 = 170 + 73\\pi \\approx 399{,}34\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها', '$P_1 = 73\\pi \\approx 229{,}34\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها', '$P_1 = (170 + 73)\\pi \\approx 763{,}41\\,\\text{m}$ ؛ رواق إيناس أطول بحوالي $15{,}08\\,\\text{m}$ فتتقدّم بهذا المقدار لتقطع المسافة نفسها', '$P_1 = 170 + 73\\pi \\approx 399{,}34\\,\\text{m}$ ؛ الرواقات متساوية الطول، فلا سبب لانطلاق إيناس أمامها']), correct: 0, cols: 1,
          explain: <MathText>{'$2 \\times 85 = 170$ و $73\\pi \\approx 229{,}34$ ، فالمجموع $\\approx 399{,}34$ . الرواق الثالث أطول من الأوّل بـ $4{,}8\\pi \\approx 15{,}08\\,\\text{m}$ ، فتنطلق إيناس متقدّمة بهذا المقدار فيقطع الجميع المسافة نفسها من الانطلاق إلى خط الوصول. الثاني نسي المستقيمين، والثالث ضرب المجموع كلّه في $\\pi$ ، والرابع ادّعى تساوي الرواقات.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-ibarat-harfiya-3_P2'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🏃', label: 'أدمجت تعلّماتي', test: (m) => (m.ecrire ?? 0) + (m.basit ?? 0) + (m.qima ?? 0) + (m.qarar ?? 0) === 0 }]}
      synthese={<div className="space-y-4"><Bonus /><KnowledgeSnapshot complete variant="complete" /></div>}
      completion={{
        masterTitle: 'أنهيت الوحدة 4', title: 'الحساب الحرفي',
        message: 'كتبت أطوال المسارات بالحروف، وبسّطت الفروق فاختفى $x$ و $y$ ، ووجدت أنّ ريم تتقدّم بـ $2{,}4\\pi$ أي نحو $7{,}54$ m وإيناس بـ $4{,}8\\pi$ أي نحو $15{,}08$ m. وظّفت التبسيط والنشر وحساب القيمة والمقارنة في وضعية واحدة.',
        verbs: ['أكتب', 'أبسّط', 'أحسب', 'أقرّر'], masterBadgeLabel: 'الوحدة 4',
      }}
    />
  );
}
