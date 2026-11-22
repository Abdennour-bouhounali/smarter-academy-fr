import { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_COMMON_FACTOR, METHOD_IDENTITIES, METHOD_EXPAND_FACTOR } from '../content/textbook';
import { NOW_35_2, NOW_36_2 } from '../content/exercises';

/**
 * Module 3 — طرائق pp. 35–36, chaque solution révélée LIGNE À LIGNE
 * (MethodSteps), puis l'encadré « طريقة » posé en brique :
 *   1. تحليل عبارة باستخراج عامل مشترك (A, B, C) → brique tariqat-amil-mushtarak ;
 *   2. دوري الآن 2 (p. 35) ;
 *   3. تحليل عبارة باستعمال المتطابقات الشهيرة (énoncé CORRIGÉ : (x − 4)²) →
 *      brique tariqat-mutatabiqat ;
 *   4. تمرين 2 : نشر ثم تحليل (solution CORRIGÉE : −4x), puis une vérification
 *      par une valeur de x ;
 *   5. دوري الآن 2 (p. 36).
 * LP : P1, P2, P3.
 */
// La solution du manuel, SANS l'encadré « طريقة » : il est posé par les briques.
const solutionOf = (m) => ({ source: m.source, exercise: m.exercise, solution: m.solution });

export default function Module03Tarayiq() {
  const [read1, setRead1] = useState(false);
  const [read2, setRead2] = useState(false);
  const [read3, setRead3] = useState(false);
  const [q3, setQ3] = useState(false);
  const [now, setNow] = useState({});
  const mark = (id) => () => setNow((d) => ({ ...d, [id]: true }));
  const all = (list) => list.every((ex) => now[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["بماذا نبدأ حين نحلّل عبارة؟", "كيف نختار بين عامل مشترك ومتطابقة شهيرة؟", "كيف نتحقّق من صحة تحليلنا؟"]}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — تحليل عبارة"
      moduleSubtitle="عامل مشترك، متطابقة شهيرة، أو نشر ثم تحليل"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'طرائق', title: 'كيف نحلّل عبارة؟', tone: 'emerald',
        body: <p>ثلاثة تمارين محلولة. اقرأ كل سطر، وحاول توقّع السطر التالي قبل أن تكشفه.</p>,
      }}
      steps={[
        {
          num: 1, title: 'باستخراج عامل مشترك', subtitle: 'الحلّ سطرًا سطرًا', done: read1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khassiya-tawziiya" variant="rappel" compact />
              <MethodSteps method={solutionOf(METHOD_COMMON_FACTOR)} onAllRevealed={() => setRead1(true)} />
              {read1 && <KnowledgeBrick id="tariqat-amil-mushtarak" lead="في الأسطر الثلاثة الخطوتان نفسهما:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'دوري الآن: عامل مشترك بين قوسين', done: all(NOW_35_2),
          content: (
            <div className="space-y-3">
              {NOW_35_2.map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ),
        },
        {
          num: 3, title: 'باستعمال المتطابقات الشهيرة', subtitle: 'الحلّ سطرًا سطرًا', done: read2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tahlil-mutatabiqat" variant="rappel" compact />
              <MethodSteps method={solutionOf(METHOD_IDENTITIES)} onAllRevealed={() => setRead2(true)} />
              <p className="text-xs text-slate-500" data-correction-note><MathText>{METHOD_IDENTITIES.correctionNote}</MathText></p>
              {read2 && <KnowledgeBrick id="tariqat-mutatabiqat" lead="نتعرّف على الشكل أولًا، ثم نعيّن الحدّين:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'نشر عبارة ثم تحليلها', subtitle: 'الحلّ سطرًا سطرًا', done: read3 && q3,
          content: (
            <div className="space-y-3">
              <MethodSteps method={solutionOf(METHOD_EXPAND_FACTOR)} onAllRevealed={() => setRead3(true)} />
              <p className="text-xs text-slate-500" data-correction-note><MathText>{METHOD_EXPAND_FACTOR.correctionNote}</MathText></p>
              {read3 && (
                <NumericQuestion
                  prompt={<MathText>{'تحقّق بنفسك: احسب A من أجل $x = 0$ (بالشكل الذي تختاره).'}</MathText>}
                  expected={3}
                  requires={['tariqat-amil-mushtarak']}
                  explain={<MathText>{'بالشكل المنشور: $0^2 - 4 \\times 0 + 3 = 3$ ؛ بالشكل المحلّل: $(0 - 3)(0 - 1) = 3$ ؛ وبالعبارة المعطاة: $(-3)^2 + 2 \\times (-3) = 9 - 6 = 3$. القيم الثلاث متساوية.'}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'دوري الآن: متطابقة ثم عامل مشترك', done: all(NOW_36_2),
          content: (
            <div className="space-y-3">
              {NOW_36_2.map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-mutatabiqat', 'tariqat-amil-mushtarak']} onAnswered={mark(ex.id)} />)}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
