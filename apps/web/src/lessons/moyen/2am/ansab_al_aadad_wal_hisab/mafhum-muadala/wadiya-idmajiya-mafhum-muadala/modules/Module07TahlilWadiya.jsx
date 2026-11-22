import { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import InfoSorter from '../../../../../../common/components/InfoSorter';
import { TextbookBox, MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION, REMARKS } from '../content/textbook';

/**
 * Module 7 — تحليل الوضعية النهائية للاختبار (la sortie scolaire au musée). Placé APRÈS les six وضعيات d'entraînement et juste avant le test : lecture, tri des données (cinq nombres utiles,
 * deux détails inutiles), les trois étapes d'analyse révélées une à une, puis quatre décisions de l'élève — un montant FIXE ou PAR ÉLÈVE, quel calcul répond à « la caisse suffit-elle ? »
 * (tester une inéquation en des valeurs données), quelle équation donne le nombre d'élèves (deux étapes, annuler d'abord l'ajout), et le piège « 20000 ÷ 200 » démasqué par une contre-vérification.
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
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['أيّ المبالغ ثابت وأيّها عن كلّ تلميذ؟', 'أيّ حساب يجيب عن «هل تكفي الصندوق؟» وأيّ معادلة تعطي عدد التلاميذ؟', 'كيف نكشف أنّ «قسمة التكلفة كلّها على سعر التذكرة» تنسى الحافلة؟']}
      ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7} moduleTitle="تحليل الوضعية النهائية للاختبار" moduleSubtitle="الرحلة المدرسية: ما التكلفة؟ وكم تلميذًا يشارك؟" estimatedTime="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي — الوضعية النهائية', headline: 'رحلة إلى المتحف', emoji: '🚌', title: SITUATION.title, tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p>, footer: <SourceTag source={SITUATION.source} /> }}
      steps={[
        { num: 1, title: 'ما المعطيات المفيدة؟', done: sorted,
          content: <div className="space-y-3"><p className="text-sm text-slate-700">اسحب كل معطى إلى «مفيد» أو «غير مفيد» لمعرفة ما يلزم لكتابة التكلفة واختبارها وحلّها.</p><InfoSorter items={SITUATION.data} formative onSolved={() => setSorted(true)} /></div> },
        { num: 2, title: 'تحليل الوضعية في ثلاث مراحل', done: read,
          content: <MethodSteps method={analysisAsMethod} onAllRevealed={() => setRead(true)} /> },
        { num: 3, title: 'قبل الحساب: ثابت أم عن كلّ تلميذ؟', done: q1,
          content: (
            <TapQuestion
              prompt={<span>المبلغ <MathText>{'$12000\\,\\mathrm{DA}$'}</MathText> لكراء الحافلة، والمبلغ <MathText>{'$200\\,\\mathrm{DA}$'}</MathText> للتذكرة. أيّ تفسير صحيح؟</span>}
              options={['الأوّل يُضرب في عدد التلاميذ، والثاني ثابت', 'كلاهما يُضرب في عدد التلاميذ', 'الأوّل ثابت لا يتغيّر مع عدد التلاميذ، والثاني يُضرب في عددهم', 'كلاهما ثابت'].map(M)}
              correct={2} cols={1} requires={['ibara-harfiya-intaj-2am']}
              explain={<span>{REMARKS.fixedPer}</span>}
              onAnswered={() => setQ1(true)} />
          ) },
        { num: 4, title: 'ماذا تعني «هل تكفي الصندوق؟»', done: q2,
          content: (
            <TapQuestion
              prompt="للجواب عن سؤال «هل يكفي مبلغ الصندوق لعدد معيّن من التلاميذ؟» نقوم بـ:"
              options={['حلّ معادلة التكلفة مساويةً لمبلغ الصندوق دائمًا', 'حساب التكلفة من أجل كلّ قيمة معطاة ومقارنتها بمبلغ الصندوق، أي اختبار متباينة', 'جمع مبلغ الصندوق إلى التكلفة', 'قسمة مبلغ الصندوق على سعر التذكرة'].map(M)}
              correct={1} cols={1} requires={['ikhtibar-musawat-mutabayina-2am']}
              explain={<span>{REMARKS.testWhy}</span>}
              onAnswered={() => setQ2(true)} />
          ) },
        { num: 5, title: 'كيف نجد عدد التلاميذ؟', done: q3,
          content: (
            <TapQuestion
              prompt={<span>التكلفة النهائية معلومة، والمجهول هو عدد التلاميذ <MathText>{'$x$'}</MathText> . ما الطريقة؟</span>}
              options={['معادلة من خطوة واحدة: نقسم التكلفة على سعر التذكرة', 'نعوّض قيمة واحدة ونكتفي بها', 'نضرب التكلفة في سعر التذكرة', 'معادلة من خطوتين: نلغي الإضافة أوّلًا ثمّ الضرب'].map(M)}
              correct={3} cols={1} requires={['hall-mushkil-muadala-2am']}
              explain={<span>{REMARKS.twoStepWhy}</span>}
              onAnswered={() => setQ3(true)} />
          ) },
        { num: 6, title: 'اختبار حساب خاطئ', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قال زميل: «عدد التلاميذ هو <MathText>{'$20000\\div200=100$'}</MathText> ». نتحقّق بتطبيق عبارة التكلفة على <MathText>{'$100$'}</MathText> تلميذ. ماذا نجد؟</span>}
                options={['التكلفة تساوي $20000$ ، فالحساب صحيح', 'لا نستطيع التحقّق', 'التكلفة $12000+200\\times100=32000$ وهي تختلف عن $20000$ ، فالحساب خاطئ لأنّه نسي الحافلة', 'التكلفة $200\\times100=20000$ ، فالحافلة مجانية'].map(M)}
                correct={2} cols={1} requires={['ikhtibar-musawat-mutabayina-2am', 'hall-mushkil-muadala-2am']}
                explain={<span>{REMARKS.trapWhy} {REMARKS.trapRight}</span>}
                onAnswered={() => setQ4(true)} />
              {q4 && <TextbookBox kind="remark" text={REMARKS.notSolvedHere} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={7} variant="memo" />} />
  );
}
