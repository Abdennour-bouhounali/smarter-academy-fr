import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (un camp d'hiver à Djelfa : cinq minimales et cinq maximales). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture,
 * tri des données (six données utiles, deux détails inutiles), les trois étapes d'analyse révélées une à une, puis six décisions de l'élève — quel CALCUL répond à chaque question (l'ordre pour
 * la nuit la plus froide, l'écart = une distance, le changement = nouveau − ancien, le total des changements = une somme algébrique) et deux contre-vérifications avec des nombres GÉNÉRIQUES
 * (« ancien − nouveau » donne le mauvais signe ; un écart qui traverse zéro ne se retranche pas). Rien n'est calculé ici : la résolution est le module 8 (évaluation) ; aucune valeur de la solution
 * n'est montrée. LP : P1.
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
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);
  return (
    <ContentModule
      objectives={['أيّ حساب يجيب عن كلّ سؤال: ترتيب أم مسافة أم تغيّر أم مجموع؟', 'كيف أتأكّد من إشارة التغيّر ومن فارق يوم يعبر الصفر؟', 'ما ترتيب الخطوات من القراءة إلى الجواب؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="مخيّم شتوي في الجلفة: ما الحساب الذي يجيب عن كلّ سؤال؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'ما في مخيّم الجلفة', emoji: '🏕️', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة ما يلزم لحلّ الوضعية.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'أيّ حساب لأبرد ليلة؟', done: q1,
          content: (
            <TapQuestion
              prompt="لمعرفة أبرد ليلة في المخيّم نحتاج إلى:"
              options={['ترتيب الدرجات الصغرى الخمس تصاعديًا وأخذ أصغرها', 'جمع الدرجات الصغرى الخمس', 'طرح أكبر كبرى من أصغر صغرى', 'ترتيب الدرجات الكبرى الخمس'].map(M)}
              correct={0} cols={1} requires={['salibayn']}
              explain={<MathText>{REMARKS.orderWhy}</MathText>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'أيّ حساب لفارق يوم واحد؟', done: q2,
          content: (
            <TapQuestion
              prompt="فارق يوم واحد بين درجتيه الكبرى والصغرى هو:"
              options={['المسافة بين العددين: الأكبر ناقص الأصغر', 'مجموع العددين', 'الصغرى ناقص الكبرى', 'الكبرى فقط'].map(M)}
              correct={0} cols={1} requires={['qaidat-masafa']}
              explain={<MathText>{REMARKS.rangeRight}</MathText>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'أيّ حساب لتغيّر الصغرى؟', done: q3,
          content: (
            <TapQuestion
              prompt="لمعرفة كيف تغيّرت الصغرى من يوم إلى الذي بعده نحسب:"
              options={['الجديد ناقص القديم، وإشارته تقول هل ارتفعت أم انخفضت', 'القديم ناقص الجديد', 'مجموع الصغرتين', 'المسافة بينهما دائمًا موجبة فلا نعرف الاتّجاه'].map(M)}
              correct={0} cols={1} requires={['jam-ishara-mukhtalifa']}
              explain={<MathText>{REMARKS.oldNewRight}</MathText>}
              onAnswered={() => setQ3(true)} />
          ) },
        { num: 6, title: 'اختبار حساب معكوس', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قال زميل: <MathText>{REMARKS.oldNewWrong}</MathText> الدرجة ارتفعت فعلًا. ماذا نستنتج؟</span>}
                options={['الحساب معكوس: التغيّر بعد ارتفاع يجب أن يكون موجبًا', 'الحساب سليم: التغيّر سالب لأنّ الأوّل سالب', 'لا يمكن الحكم على الإشارة', 'يجب جمع العددين'].map(M)}
                correct={0} cols={1} requires={['jam-ishara-mukhtalifa']}
                explain={<MathText>{`${REMARKS.oldNewWhy} ${REMARKS.oldNewRight}`}</MathText>}
                onAnswered={() => setQ4(true)} />
            </div>
          ) },
        { num: 7, title: 'اختبار فارق يعبر الصفر', done: q5,
          content: (
            <TapQuestion
              prompt={<span>قال زميل: <MathText>{REMARKS.rangeWrong}</MathText> ماذا نلاحظ؟</span>}
              options={['الدرجتان على جهتين من الصفر فالفارق مجموع المسافتين لا فرقهما', 'الحساب سليم لأنّ الفارق دائمًا فرق المسافتين', 'نجمع $3$ و $2$ فنحصل على الصغرى', 'لا نستطيع حساب الفارق'].map(M)}
              correct={0} cols={1} requires={['qaidat-masafa']}
              explain={<MathText>{`${REMARKS.rangeWhy} ${REMARKS.rangeRight}`}</MathText>}
              onAnswered={() => setQ5(true)} />
          ) },
        { num: 8, title: 'ومجموع التغيّرات؟', done: q6,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="لمعرفة ماذا تغيّرت الصغرى في مجمل الأيام الخمسة نجمع تغيّراتها المتتالية:"
                options={['جمعًا جبريًا: الموجبة مع الموجبة والسالبة مع السالبة ثم المجموعان', 'جمع المسافات إلى الصفر فقط', 'جمع الصغرى والكبرى', 'طرح أصغر تغيّر من أكبر تغيّر'].map(M)}
                correct={0} cols={1} requires={['qaidat-majmu-jabri']}
                explain={<MathText>{REMARKS.sumCheck}</MathText>}
                onAnswered={() => setQ6(true)} />
              {q6 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
