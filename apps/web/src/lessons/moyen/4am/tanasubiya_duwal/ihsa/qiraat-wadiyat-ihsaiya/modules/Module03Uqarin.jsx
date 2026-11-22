import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, SourceTag, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DataTable from '../components/DataTable';
import { METHOD, MISTAKE_MEAN_ONLY } from '../content/textbook';
import { EX, EX14_TABLE } from '../content/exercises';

/**
 * Rétrofit 2026-10-15 : la brique « hadhf-qiyam » vient après la première réponse d'ex-22 (elle annonçait quoi retirer).
 * Module 3 — أقارن وأقرّر (stage: formalization) — FORMALIZE. LP : P2, P3.
 *   (1) ex-14 (p. 99) : le tableau des deux villes, les indicateurs de « أ » puis la moyenne de « ب » ;
 *   (2) la brique « mawqi-tashattut » et l'interprétation (position ET dispersion) ;
 *   (3) ex-22 (p. 101) : la brique « hadhf-qiyam », retirer 4 et 19, puis 19 seul → N = 31 ;
 *   (4) la méthode de la PLATEFORME « أقرأ · أحسب المؤشرات · أقارن · أقرّر » révélée ligne à ligne
 *       (MethodSteps), sa brique et une décision justifiée. L'exemple résolu énonce la méthode AVANT la brique :
 *       il est enveloppé dans <PredictRule id="tariqat-qarar"> (une seule « أتوقّع القاعدة », predictPrompt de
 *       knowledge.jsx). Le brief ne dit plus « la moyenne seule ne suffit pas » (règle de la brique du (2)).
 */
export default function Module03Uqarin() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      objectives={["هل يكفي المتوسط وحده لنقارن مدينتين؟", "ماذا يقول المتوسط وماذا يقول المدى؟", "ما الخطوات التي أتّبعها في كل وضعية إحصائية قبل أن أقرّر؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أقارن وأقرّر"
      moduleSubtitle="مؤشر موقع، مؤشر تشتت، ثم قرار"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'التمرينان 14 و 22 — الكتاب ص 99 و 101', headline: 'أيّ المدينتين أدفأ؟ وأيّهما أكثر تقلّبا؟', emoji: '🌡️',
        title: 'مقارنة سلسلتين واتخاذ قرار', tone: 'emerald',
        body: <p>في التحدّي قارنّا قسمين بالمتوسط. هنا نقارن مدينتين على مدار سنة: هل يكفي المتوسط وحده؟ ثم نكتب الطريقة التي نتّبعها في كل وضعية إحصائية.</p>,
        footer: <SourceTag source={EX['ex14-a'].source} />,
      }}
      steps={[
        {
          num: 1, title: 'مدينتان على مدار سنة', subtitle: 'التمرين 14', done: all('ex14a', 'ex14b'),
          content: (
            <div className="space-y-3">
              <DataTable head={EX14_TABLE.head} rows={EX14_TABLE.rows} caption="متوسط درجات الحرارة الشهرية (°C)" />
              <TextbookExercise exercise={EX['ex14-a']} requires={['mutawassit-silsila', 'wasit-silsila', 'mada-silsila']} onAnswered={mark('ex14a')} />
              <TextbookExercise exercise={EX['ex14-b']} requires={['mutawassit-silsila']} onAnswered={mark('ex14b')} />
            </div>
          ),
        },
        {
          num: 2, title: 'فسّر النتائج', subtitle: 'موقع وتشتت', done: all('ex14c'),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['ex14-c']} requires={['mawqi-tashattut']} onAnswered={mark('ex14c')} />
              {done.ex14c && <KnowledgeBrick id="mawqi-tashattut" lead="المتوسط والوسيط يقولان أين تتمركز الحرارة، والمدى يقول كم تتباعد." />}
            </div>
          ),
        },
        {
          num: 3, title: 'علامات قسم بعد الحذف', subtitle: 'التمرين 22', done: all('ex22a', 'ex22b'),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['ex22-a']} onAnswered={mark('ex22a')} />
              {done.ex22a && <KnowledgeBrick id="hadhf-qiyam" lead="ما فعلته: ماذا تغيّر عندما حذفنا علامة، مجموع العلامات، عدد التلاميذ، أم الاثنان؟" />}
              {done.ex22a && <TextbookExercise exercise={EX['ex22-b']} requires={['hadhf-qiyam']} onAnswered={mark('ex22b')} />}
            </div>
          ),
        },
        {
          num: 4, title: 'الطريقة سطرًا سطرًا', subtitle: 'أقرأ · أحسب المؤشرات · أقارن · أقرّر', done: all('read', 'choose'),
          content: (
            <div className="space-y-3">
              <PredictRule id="tariqat-qarar"><MethodSteps method={METHOD} onAllRevealed={mark('read')} /></PredictRule>
              <KnowledgeBrick id="tariqat-qarar" lead="الأسطر الأربعة هي خطوات كل قرار إحصائي:" />
              <TapQuestion
                prompt="لو أراد المدرّب فريقًا يبلغ أحيانًا أعلى النتائج ولو كان غير منتظم، أيّ مؤشر يبرّر اختيار الفريق A؟"
                options={[
                  'وسيطه 7 أكبر من وسيط B (6)، وأكبر قيمة له 9',
                  'متوسطه أكبر من متوسط B',
                  'مداه أصغر من مدى B',
                  'لا يمكن تبرير أي اختيار بالمؤشرات',
                ]}
                correct={0}
                cols={1}
                requires={['tariqat-qarar', 'mawqi-tashattut']}
                explain={<MathText>{'للفريقين المتوسط نفسه 6، ومدى A ($7$) أكبر من مدى B ($2$): A غير منتظم، لكن وسيطه 7 وأفضل حصصه 9. القرار يتعلّق بما نريد، ونبرّره بالمؤشرات.'}</MathText>}
                explainWrong={<MathText>{MISTAKE_MEAN_ONLY.why}</MathText>}
                onAnswered={mark('choose')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
