import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (l'intégration du manuel REDESSINÉE : la feuille d'or de Nour). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture,
 * tri des données (trois données utiles, deux inutiles dont le prix), les trois étapes d'analyse révélées une à une, puis trois décisions de l'élève — par quelle opération on obtient le nombre
 * de couches (un QUOTIENT de deux longueurs), dans quelle unité on calcule (le mètre, avec les puissances de 10) et d'où vient l'ordre de grandeur (de l'écriture scientifique du résultat).
 * Rien n'est calculé ici : la résolution est le module 8 (évaluation) ; aucune valeur de la solution n'est montrée. LP : P1.
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
      objectives={['ما المطلوب في وضعية رقاقة الذهب؟', 'أيّ معطى لا نحتاجه؟', 'بأيّ وحدة نحسب، ومن أين تأتي رتبة القدر؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="رقاقة الذهب: كم طبقة من الذرّات؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'رقاقة الذهب وذرّاتها', emoji: '🧩', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة عدد طبقات الذرّات في الرقيقة.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: بأيّ عملية؟', done: q1,
          content: (
            <TapQuestion
              prompt="لنعرف عدد طبقات الذرّات في سُمك الرقيقة نحسب:"
              options={['السُّمك مقسومًا على قطر الذرّة', 'قطر الذرّة مقسومًا على السُّمك', 'جداء السُّمك في قطر الذرّة', 'مجموع السُّمك وقطر الذرّة'].map(M)}
              correct={0} cols={1} requires={['hasil-quwa-ashara', 'kitaba-ilmiya']}
              explain={<span>{REMARKS.divWhy}</span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'بأيّ وحدة نحسب؟', done: q2,
          content: (
            <TapQuestion
              prompt={<span>السُّمك مُعطى بـ <MathText>{'$\\mu\\mathrm{m}$'}</MathText> وقطر الذرّة بـ <MathText>{'$\\mathrm{pm}$'}</MathText> . قبل أن نقسم نحوّل القياسين إلى:</span>}
              options={['المتر، بقوى العدد $10$', 'نترك $\\mu\\mathrm{m}$ و $\\mathrm{pm}$ كما هما', 'الميلّيمتر دون قوى العدد $10$', 'السنتيمتر بكتابة عشرية طويلة'].map(M)}
              correct={0} cols={1} requires={['ashara-salib', 'hasil-quwa-ashara']}
              explain={<span>{REMARKS.unitWhy} {REMARKS.unitRight}</span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'من أين تأتي رتبة القدر؟', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="رتبة قدر عدد الطبقات نأخذها من:"
                options={['الكتابة العلمية للنتيجة', 'عدد أرقام النتيجة', 'قطر الذرّة وحده', 'ثمن الرقيقة'].map(M)}
                correct={0} cols={1} requires={['rutbat-qadr', 'kitaba-ilmiya']}
                explain={<span>{REMARKS.orderWhy}</span>}
                onAnswered={() => setQ3(true)} />
              {q3 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
