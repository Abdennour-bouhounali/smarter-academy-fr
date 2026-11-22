import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (la وضعية « Fahrenheit » du manuel, p. 20, REDESSINÉE : Sétif −3 °C et Montréal −13 °F). Placé APRÈS les six
 * وضعيات d'entraînement et juste avant le test : lecture, tri des données (la règle et ses deux constantes ne sont pas des températures), les trois étapes d'analyse
 * révélées une à une, puis deux décisions de l'élève — le même سلّم avant de comparer, et la chaîne inverse (« نطرح 32 ثم نقسم على 1,8 »). Rien n'est calculé ici :
 * la résolution est le module 8 (évaluation). LP : P1.
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07AlWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  return (
    <ContentModule
      objectives={['ما المعطيات التي نحتاجها لمقارنة درجتي الحرارة، وما العددان اللذان ليسا درجتين؟', 'لماذا لا نقارن $-3$ و $-13$ مباشرة؟', 'كيف نعكس حساب $1{,}8 \\times T_C + 32$ ؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="سطيف ومونتريال: أيّ المدينتين أشدّ برودة؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'رسالة من سطيف إلى مونتريال', emoji: '🌡️', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمقارنة المدينتين.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: أيّ سلّم نقارن به؟', done: q1,
          content: (
            <TapQuestion
              prompt={<span>سطيف <MathText>{'$-3\\,^\\circ\\mathrm{C}$'}</MathText> ومونتريال <MathText>{'$-13\\,^\\circ\\mathrm{F}$'}</MathText> . ما الذي نفعله قبل أن نقارن؟</span>}
              options={['نحوّل إحدى الدرجتين إلى سلّم الأخرى ثم نقارن', 'نقارن العددين $-3$ و $-13$ مباشرة', 'نجمع العددين ونحكم بالمجموع', 'لا يمكن المقارنة أبدًا'].map(M)}
              correct={0} cols={1} requires={['jidaa-nisbi', 'majmu-jabri']}
              explain={<span>{REMARKS.scaleWhy} {REMARKS.scaleRight}</span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'من الفهرنهايت إلى السيلسيوس: أيّ ترتيب؟', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>القاعدة <MathText>{'$T_F = 1{,}8 \\times T_C + 32$'}</MathText> تنقلنا من السيلسيوس إلى الفهرنهايت. ما العمليتان المعاكستان، بالترتيب، للانتقال من <MathText>{'$T_F$'}</MathText> إلى <MathText>{'$T_C$'}</MathText> ؟</span>}
                options={['نطرح 32 ثم نقسم على 1,8', 'نقسم على 1,8 ثم نطرح 32', 'نضيف 32 ثم نضرب في 1,8', 'نضرب في 1,8 ثم نطرح 32']}
                correct={0} cols={1} requires={['qisma-nisbi', 'awlawiya-amaliyat']}
                explain={<span>{REMARKS.chainWhy} {REMARKS.chainRight}</span>}
                onAnswered={() => setQ2(true)} />
              {q2 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
