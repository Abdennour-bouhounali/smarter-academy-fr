import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (le تحدّ de l'unité REDESSINÉ : la tirelire de Meriem). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture,
 * tri des données (les quatre nombres utiles, deux détails inutiles), les trois étapes d'analyse révélées une à une, puis trois décisions de l'élève — de QUOI est chaque fraction
 * (du tout ou du reste), dans quel ORDRE on calcule, et le piège « trois cinquièmes du tout » démasqué par une contre-vérification (1 − 1/3 − 1/4 − 3/5 < 0). Rien n'est calculé ici :
 * la résolution est le module 8 (évaluation) ; aucune valeur de la solution n’est montrée. LP : P1.
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07TahlilWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['أيّ الكسور من المبلغ كلّه، وأيّها من الباقي؟', 'ما ترتيب الحسابات؟ وما الذي نحتاجه قبل أخذ كسر من الباقي؟', 'كيف نكشف أنّ «ثلاثة أخماس المبلغ كلّه» تفسير مستحيل؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="حصّالة مريم: كم ادّخرت؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'ما في حصّالة مريم', emoji: '💰', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة ما ادّخرته مريم.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: كسر من ماذا؟', done: q1,
          content: (
            <TapQuestion
              prompt={<span>في الوضعية ثلاثة كسور: <MathText>{'$\\frac{1}{3}$ و $\\frac{1}{4}$ و $\\frac{3}{5}$'}</MathText> . أيّها كسر من المبلغ المدّخر كلّه؟</span>}
              options={['$\\frac{1}{3}$ و $\\frac{1}{4}$ فقط، أمّا $\\frac{3}{5}$ فكسر من الباقي', 'الثلاثة كلّها كسور من المبلغ كلّه', '$\\frac{3}{5}$ فقط', 'لا يمكن تحديد ذلك'].map(M)}
              correct={0} cols={1} requires={['jam-tarh-kasrayn-3am', 'jida-kasrayn-2am']}
              explain={<span>{REMARKS.baseWhy} {REMARKS.wholeRight}</span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'ما ترتيب الحسابات؟', done: q2,
          content: (
            <TapQuestion
              prompt="أيّ ترتيب للحسابات يوصلنا إلى ما بقي لمريم في النهاية؟"
              options={['نجمع ما أُنفق أوّلًا، ثم نطرحه من الكلّ، ثم نأخذ كسر الهدية من الباقي، ثم نطرح الهدية', 'نأخذ ثلاثة أخماس المبلغ كلّه أوّلًا ثم نطرح الكسرين الآخرين', 'نضرب الكسرين الأوّلين ثم نطرح الناتج من الكلّ', 'نقسم $1500$ على كل كسر على حدة'].map(M)}
              correct={0} cols={1} requires={['jam-tarh-kasrayn-3am', 'maqlub-qismat-kasrayn-3am']}
              explain={<span>{REMARKS.orderWhy}</span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'اختبار تفسير خاطئ', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قال زميل: «الهدية <MathText>{'$\\frac{3}{5}$'}</MathText> من المبلغ كلّه». نتحقّق: <MathText>{'$1 - \\frac{1}{3} - \\frac{1}{4} - \\frac{3}{5}$'}</MathText> . ماذا نجد؟</span>}
                options={['عددًا سالبًا ($-\\frac{11}{60}$): مستحيل، فالهدية ليست $\\frac{3}{5}$ من الكلّ', 'عددًا موجبًا: التفسير صحيح', 'صفرًا: لم يبق لمريم شيء', 'لا نستطيع الحكم'].map(M)}
                correct={0} cols={1} requires={['jam-tarh-kasrayn-3am', 'adad-natiq-3am']}
                explain={<span>{REMARKS.wholeWhy} {REMARKS.wholeRight}</span>}
                onAnswered={() => setQ3(true)} />
              {q3 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
