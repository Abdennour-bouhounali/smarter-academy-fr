import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (l'intégration du manuel REDESSINÉE : la piste de l'école, les départs décalés). Placé APRÈS les six وضعيات d'entraînement et juste avant le test :
 * lecture, tri des données (cinq utiles, deux inutiles ; plain text), les trois étapes d'analyse révélées une à une, puis trois décisions de l'élève — CE QUI change d'un couloir à l'autre,
 * pourquoi on écrit en LETTRES (x et y ne sont pas connus : une valeur essayée ne juge pas tous les stades) et dans quel ORDRE (simplifier avant de remplacer). Rien n'est calculé ici :
 * la résolution est le module 8 (évaluation) ; aucune valeur ni aucune formule de la solution n'est montrée. LP : P2 (ici comme au test).
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07AlWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['ما الذي يتغيّر من رواق إلى آخر، وما الذي لا يتغيّر؟', 'لماذا نكتب الأطوال بالحروف بدل تجريب قيم؟', 'ما ترتيب العمل: نبسّط قبل أن نعوّض؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="انطلاقات متفاوتة: لماذا تتقدّم ريم وإيناس؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'مضمار المدرسة', emoji: '🏃', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لتفسير الانطلاقات المتفاوتة.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: ما الذي يتغيّر؟', done: q1,
          content: (
            <TapQuestion
              prompt="نقارن مسار الرواق الأوّل بمسار الرواق الثاني. ما الذي يختلف بينهما؟"
              options={['المستقيمان متساويان، ونصفا الدائرة في الرواق الثاني أوسع', 'المستقيمان في الرواق الثاني أطول، ونصفا الدائرة متساويان', 'كل شيء يختلف: المستقيمان ونصفا الدائرة', 'لا شيء يختلف فالرواقات متشابهة'].map(M)}
              correct={0} cols={1} requires={['tabsit-hadhf-aqwas-3am']}
              explain={<span><MathText>{REMARKS.sameWhy}</MathText></span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'لماذا نكتب بالحروف؟', done: q2,
          content: (
            <TapQuestion
              prompt={<span>لا نعرف <MathText>{'$x$'}</MathText> ولا <MathText>{'$y$'}</MathText> . قال زميل: «أعوّضهما بعددين وأحكم». ما الصواب؟</span>}
              options={['نكتب أطوال المسارات بالحروف ثم نبسّط الفرق: القيمة المجرَّبة وحدها لا تحكم على كل المضامير', 'يكفي عددان نختارهما فنحكم على كل المضامير', 'لا نستطيع الحكم لأنّ $x$ و $y$ مجهولان', 'نأخذ $x = y$ لأنّه أسهل'].map(M)}
              correct={0} cols={1} requires={['qimat-ibara-harfiya-3am']}
              explain={<span><MathText>{REMARKS.letterWhy}</MathText> <MathText>{REMARKS.valueWhy}</MathText></span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'ما ترتيب العمل؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="أيّ ترتيب يوصلنا إلى بكم مترًا تتقدّم المتسابقة؟"
                options={['نكتب الأطوال، ثم نبسّط الفرق، ثم نعوّض ونقرّر', 'نعوّض أوّلًا بأعداد مختارة ثم نكتب الأطوال', 'نبسّط الفرق قبل أن نكتب الأطوال', 'نقارن الأطوال بالعين دون حساب'].map(M)}
                correct={0} cols={1} requires={['muqaranat-natiqayn-3am']}
                explain={<span><MathText>{REMARKS.orderWhy}</MathText></span>}
                onAnswered={() => setQ3(true)} />
              {q3 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
