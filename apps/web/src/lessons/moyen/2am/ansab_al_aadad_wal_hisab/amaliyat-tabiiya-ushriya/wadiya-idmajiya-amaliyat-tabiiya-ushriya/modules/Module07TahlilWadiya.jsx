import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS, RECALL } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (l'`evaluation` du manuel REDESSINÉE : l'atelier de nichoirs). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture, tri des
 * données (cinq utiles, deux inutiles), les trois étapes d'analyse révélées une à une, puis quatre décisions de l'élève — CE QUE chaque matière demande (une division, la partie entière), QUEL
 * nombre garder (le plus petit), pourquoi on ne somme pas les stocks, et comment écrire le gain (les parenthèses). Rien n'est calculé ici : la résolution est le module 8 (évaluation) ; aucune
 * valeur ni aucune formule de la solution n'est montrée. LP : P1. Les quatre leçons de l'unité sont rappelées avec leur lien vivant (« تذكّر »).
 */
const analysisAsMethod = { exercise: SITUATION.text, source: SITUATION.source, solution: SITUATION.analysis.map((s) => `${s.label} : ${s.text}`) };
const M = (s) => <MathText key={s}>{s}</MathText>;

const RecallLinks = () => (
  <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm" data-recall>
    <p className="mb-1 font-bold text-teal-900">تذكّر</p>
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {RECALL.map((r) => {
        const to = getLessonPath(r.lesson);
        return to ? <li key={r.lesson}><Link to={to} className="inline-flex min-h-[44px] items-center font-bold text-teal-700 underline underline-offset-4" data-recall-link>{r.label}</Link></li> : null;
      })}
    </ul>
  </div>
);

export default function Module07TahlilWadiya() {
  const [sorted, setSorted] = useState(false);
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['ماذا تطلب كلّ مادّة من المخزن؟', 'أيّ حاصل نحتفظ به ولماذا؟', 'كيف نكتب الربح بسلسلة واحدة؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="ورشة بيوت العصافير: ماذا يصنع النادي وبكم يربح؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'ورشة بيوت العصافير', emoji: '🐦', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لتحدّد ما يلزم لصنع البيوت وحساب الربح.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <div className="space-y-3"><MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /><RecallLinks /></div> },
        { num: 3, title: 'قبل الحساب: ماذا نفعل لكلّ مادّة؟', done: q1,
          content: (
            <TapQuestion
              prompt="لمعرفة عدد البيوت التي تكفيها الألواح وحدها، ماذا نفعل بمخزون الألواح وبحاجة البيت الواحد منها؟"
              options={['نقسم المخزون على الحاجة ونأخذ الجزء الصحيح من الحاصل', 'نضرب المخزون في الحاجة', 'نطرح الحاجة من المخزون مرّة واحدة', 'نقسم الحاجة على المخزون'].map(M)}
              correct={0} cols={1} requires={['silsila-bidun-aqwas-2am']}
              explain={<span><MathText>{REMARKS.perMaterial}</MathText></span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'أيّ حاصل نحتفظ به؟', done: q2,
          content: (
            <TapQuestion
              prompt="بعد أن وجدنا ما تكفيه كلّ مادّة على حدة، أيّ الحواصل يحدّد عدد البيوت الكاملة؟"
              options={['الأصغر، لأنّ كلّ بيت يحتاج إلى المواد كلّها معًا', 'الأكبر، لأنّه يعطي بيوتًا أكثر', 'مجموعها كلّها', 'الأوسط دائمًا'].map(M)}
              correct={0} cols={1} requires={['silsila-bidun-aqwas-2am']}
              explain={<span><MathText>{REMARKS.minWhy}</MathText> <MathText>{REMARKS.maxWhy}</MathText></span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'هل نجمع المخزون كلّه؟', done: q3,
          content: (
            <TapQuestion
              prompt="قال زميل: «أجمع الألواح والزوايا والبراغي في المخزن وأقسم المجموع على مجموع ما يحتاجه البيت». ما الصواب؟"
              options={['لا: قطعة من نوع لا تعوّض قطعة من نوع آخر، فنقسم كلّ مادّة وحدها', 'نعم: هذا أسرع وأدقّ', 'نعم، لكن بشرط أن نأخذ الجزء الصحيح', 'لا: لأنّ المجموع عدد كبير'].map(M)}
              correct={0} cols={1} requires={['wasf-silsila-hisab-2am']}
              explain={<span><MathText>{REMARKS.sumWhy}</MathText></span>}
              onAnswered={() => setQ3(true)} />
          ) },
        { num: 6, title: 'كيف نكتب الربح بسلسلة واحدة؟', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="الربح هو المبيعات ناقص التكلفة، والتكلفة طلاء البيوت وعلبة الغراء معًا. أيّ كتابة بالكلمات صحيحة؟"
                options={['المبيعات − (ثمن الطلاء كلّه + ثمن الغراء)', 'المبيعات − ثمن الطلاء كلّه + ثمن الغراء', 'المبيعات × (ثمن الطلاء كلّه + ثمن الغراء)', '(المبيعات − ثمن الطلاء كلّه) + ثمن الغراء'].map(M)}
                correct={0} cols={1} requires={['silsila-bi-aqwas-2am']}
                explain={<span><MathText>{REMARKS.bracketWhy}</MathText></span>}
                onAnswered={() => setQ4(true)} />
              {q4 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
