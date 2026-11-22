import { useState } from 'react';
import { ContentModule, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX15, EX16, EX1E } from '../content/textbook';
import { byId } from '../content/exercises';
import { HistogramFigure, MiniTable } from '../components/Figures';

/**
 * Module 2 — التمثيلات البيانية (discovery) : TOUCH THE MATH. Trois tableaux, trois graphiques du manuel :
 *   تمرين 15 — les déchets d'une plage (60, 40, 50 kg) → le مخطط دائري et ses angles 144°, 96°, 120° ;
 *   تمرين 16 — trois classes (6, 1, 4) → la الفئة الوسيطية (rang 6 → 7 ≤ t < 8) et la commande GeoGebra
 *              Histogramme({7,8,9,10},{6,1,4}) ;
 *   تمرين 1 هـ — les températures de juin (doublon déclaré de takrar-mujamma) → مخطط بالأعمدة dans le tableur.
 * L'étape « graphique » du lab (module 1, متقدم) fait les mêmes choix par le geste ; ici l'élève CALCULE
 * (les angles) et JUSTIFIE. LP : P3.
 */
export default function Module02Tamthilat() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["أيّ مخطط يُظهر حصة كل نوع من النفايات؟", "كيف نحسب زاوية كل قطاع؟", "ماذا نرسم لسلسلة مجمّعة في فئات؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="التمثيلات البيانية"
      moduleSubtitle="أيّ مخطط يناسب أيّ معطيات؟"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'أوظّف تعلّماتي — الكتاب ص 98، 99',
        headline: 'حملة تنظيف الشاطئ!',
        emoji: '🏖️',
        title: 'التمثيل البياني المناسب للمعطيات',
        tone: 'sky',
        body: <p>بعد حملة تنظيف الشاطئ وُزّنت النفايات المجموعة حسب نوعها. كيف نُظهر حصة كل نوع؟ وماذا نرسم لسلسلة مجمّعة في فئات، أو لدرجات حرارة شهر كامل؟</p>,
        footer: <SourceTag source={EX15.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تمرين 15 — النفايات على الشاطئ', subtitle: 'المخطط الدائري', done: !!done['ex-15-1'] && !!done['ex-15-2'],
          content: (
            <div className="space-y-3">
              <MiniTable rows={[
                { label: 'أنواع النفايات', cells: EX15.table.kinds },
                { label: 'الكتلة (kg)', cells: EX15.table.masses },
              ]} />
              {/* Les options et l'explication de ex-15-1 ÉNONCENT la règle tamthil-munasib : l'élève la prédit d'abord. */}
              <PredictRule id="tamthil-munasib">
                <TextbookExercise exercise={byId['ex-15-1']} requires={['qiraat-tamthil']} onAnswered={mark('ex-15-1')} />
              </PredictRule>
              {done['ex-15-1'] && <KnowledgeBrick id="tamthil-munasib" lead="كل نوع من المعطيات له تمثيله:" />}
              {done['ex-15-1'] && <TextbookExercise exercise={byId['ex-15-2']} requires={['zawiya-qita', 'tamthil-munasib']} onAnswered={mark('ex-15-2')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'تمرين 16 — فئات ومدرّج تكراري', subtitle: 'الفئة الوسيطية، والطلبية في جيوجيبرا', done: !!done['ex-16-1'] && !!done['ex-16-2'],
          content: (
            <div className="space-y-3">
              <MiniTable rows={[
                { label: 'الفئات', cells: EX16.table.classes },
                { label: 'التكرارات', cells: EX16.table.freqs },
              ]} />
              <TextbookExercise exercise={byId['ex-16-1']} requires={['fia-wasitiya']} onAnswered={mark('ex-16-1')} />
              <TextbookExercise exercise={byId['ex-16-2']} requires={['tamthil-munasib']} onAnswered={mark('ex-16-2')} />
              {done['ex-16-2'] && (
                <div className="space-y-1" data-ex16-figure>
                  <p className="text-xs text-slate-600"><MathText>{'ما ترسمه الطلبية: ثلاثة مستطيلات متلاصقة.'}</MathText></p>
                  <HistogramFigure bounds={[7, 8, 9, 10]} heights={EX16.table.freqs} yMax={6} label="مدرّج تكراري: ثلاثة مستطيلات متلاصقة على الفئات من 7 إلى 10 ارتفاعاتها 6 و 1 و 4" />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'تمرين 1 هـ — درجات الحرارة', subtitle: 'مخطط بالأعمدة في المجدول', done: !!done['ex-1-e'],
          content: (
            <div className="space-y-3">
              <MiniTable rows={[
                { label: 'درجة الحرارة (°C)', cells: EX1E.table.values },
                { label: 'عدد الأيام', cells: EX1E.table.freqs },
              ]} />
              <TextbookExercise exercise={byId['ex-1-e']} requires={['tamthil-munasib', 'khaliya-majal']} onAnswered={mark('ex-1-e')} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
