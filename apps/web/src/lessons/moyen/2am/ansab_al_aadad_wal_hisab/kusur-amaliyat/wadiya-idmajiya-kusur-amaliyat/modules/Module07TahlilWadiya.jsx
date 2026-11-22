import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (le تحدّي de l'unité REDESSINÉ : la terre de la coopérative). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture,
 * tri des données (six nombres utiles, deux détails inutiles), les trois étapes d'analyse révélées une à une, puis quatre décisions de l'élève — de QUOI est chaque fraction
 * (de la terre ou du verger), dans quel ORDRE on calcule, SUR QUELLE aire on divise le rendement, et le piège « deux tiers de la terre » démasqué par une contre-vérification
 * (3/8 + 1/4 + 1/8 + 2/3 > 1). Rien n'est calculé ici : la résolution est le module 8 (évaluation) ; aucune valeur de la solution n'est montrée. LP : P1.
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07TahlilWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['أيّ الكسور من الأرض كلّها، وأيّها من البستان؟', 'ما ترتيب الحسابات؟ وعلى أيّ مساحة نقسم الإنتاج؟', 'كيف نكشف أنّ «ثلثين من الأرض كلّها» تفسير مستحيل؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="أرض التعاونية: ما مساحة التفّاح وكم يُنتَج؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'ما في أرض التعاونية', emoji: '🌾', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة ما يلزم لحساب مساحة التفّاح والمردود.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: كسر من ماذا؟', done: q1,
          content: (
            <TapQuestion
              prompt={<span>في الوضعية ثلاثة كسور من الأرض <MathText>{'($\\frac{3}{8}$ و $\\frac{1}{4}$ و $\\frac{1}{8}$)'}</MathText> وكسر رابع <MathText>{'$\\frac{2}{3}$'}</MathText> . هذا الكسر الرابع هو كسر من:</span>}
              options={['البستان وحده', 'الأرض كلّها', 'حقل القمح', 'لا يمكن تحديد ذلك'].map(M)}
              correct={0} cols={1} requires={['jida-kasrayn-2am', 'jam-tarh-kusur-2am']}
              explain={<span>{REMARKS.baseWhy} {REMARKS.wholeRight}</span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'ما ترتيب الحسابات؟', done: q2,
          content: (
            <TapQuestion
              prompt="أيّ ترتيب للحسابات يوصلنا إلى كسر التفّاح من الأرض؟"
              options={['نجمع الأجزاء المزروعة، ثم نطرح مجموعها من الكلّ لنعرف البستان، ثم نأخذ ثلثيه', 'نأخذ ثلثين من الأرض كلّها أوّلًا ثم نطرح الأجزاء الأخرى', 'نضرب الكسور الثلاثة الأولى ثم نطرح الناتج من الكلّ', 'نقسم $1750$ على كل كسر على حدة'].map(M)}
              correct={0} cols={1} requires={['jam-tarh-kusur-2am', 'jida-kasrayn-2am']}
              explain={<span>{REMARKS.orderWhy}</span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'على أيّ مساحة نقسم الإنتاج؟', done: q3,
          content: (
            <TapQuestion
              prompt={<span>الكتلة <MathText>{'$1750\\,\\text{kg}$'}</MathText> هي إنتاج حقل القمح. لحساب ما يُنتَج في المتر المربّع الواحد من القمح نقسمها على:</span>}
              options={['مساحة حقل القمح، وهي كسر من مساحة الأرض', 'مساحة الأرض كلّها', 'مساحة البستان', 'محيط الأرض'].map(M)}
              correct={0} cols={1} requires={['kasr-hasil-qisma-2am', 'jida-kasrayn-2am']}
              explain={<span>{REMARKS.yieldWhy}</span>}
              onAnswered={() => setQ3(true)} />
          ) },
        { num: 6, title: 'اختبار تفسير خاطئ', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قال زميل: «التفّاح <MathText>{'$\\frac{2}{3}$'}</MathText> من الأرض كلّها». نتحقّق: <MathText>{'$\\frac{3}{8} + \\frac{1}{4} + \\frac{1}{8} + \\frac{2}{3}$'}</MathText> . ماذا نجد؟</span>}
                options={['عددًا أكبر من $1$ ($\\frac{17}{12}$): مستحيل، فالتفّاح ليس $\\frac{2}{3}$ من الأرض كلّها', 'عددًا أصغر من $1$: التفسير صحيح', 'العدد $1$ بالضبط: لا بستان في الأرض', 'لا نستطيع الحكم'].map(M)}
                correct={0} cols={1} requires={['jam-tarh-kusur-2am', 'muqarana-kasrayn-2am']}
                explain={<span>{REMARKS.wholeWhy} {REMARKS.wholeRight}</span>}
                onAnswered={() => setQ4(true)} />
              {q4 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
