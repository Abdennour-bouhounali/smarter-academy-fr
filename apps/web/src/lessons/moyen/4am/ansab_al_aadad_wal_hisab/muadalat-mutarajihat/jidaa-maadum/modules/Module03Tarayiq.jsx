import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, CHALLENGE, KHWARIZMI } from '../content/textbook';
import { NOW_47_2 } from '../content/exercises';
import ChallengeSquare from '../components/ChallengeSquare';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';

/**
 * Module 3 — « طرائق — نحلّل ثم نحلّ » : حل معادلة تؤول إلى معادلة جداء معدوم.
 *   1. la solution de la plateforme LIGNE À LIGNE (MethodSteps) → brique tariqat-jidaa-maadum ;
 *   2. تمارين سريعة : 3x(−x + 2), (2x − 5)², 9x² − 4, 5x² = 2x ;
 *   3. le terrain CARRÉ (x + 1)² : ses deux côtés s'annulent ENSEMBLE, un seul zéro, contre (x + 1)(x + 2) qui en a deux. LECTEUR : pas de labo ici (la manche
 *      carrée est la manche 2 du module 2) ; la question de comparaison reste, elle est autonome ;
 *   4. TRANSFERT — le تحدّ de la page d'ouverture (duplicatedIn) posé sur l'équation d'al-Khwārizmī x² + 10x = 39 : le carré 5 × 5 complète le carré,
 *      (x + 5)² = 64, puis (x − 3)(x + 13) = 0 ; x est positif (dit dans l'énoncé) ;
 *   5. CLÔTURE — الخوارزمي : x² + 21 = 10x, ses racines 3 et 7 sont celles de (x − 3)(x − 7) = 0.
 * LP : P2, P3. Rollout 2026-11-11 (verdicts L2.5 et L2.8) : nombres de la plateforme, aucun renvoi au manuel.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const solutionOf = (m) => ({ source: m.source, exercise: m.exercise, solution: m.solution });

export default function Module03Tarayiq() {
  const player = useModulePlayer(MODULE_CTX);
  const [read, setRead] = useState(false);
  const [now, setNow] = useState({});
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const mark = (id) => () => setNow((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["كيف نحلّ معادلة لا يظهر فيها جداء عاملين؟", "كم حلًّا لمعادلة عاملاها متساويان؟", "كيف نستفيد من المربّع الكبير في مسألة الخوارزمي؟", "ما الجذران اللذان استخرجهما الخوارزمي؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — نحلّل ثم نحلّ"
      moduleSubtitle="حل معادلة تؤول إلى معادلة جداء معدوم"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق', title: 'كيف نحلّ معادلة تؤول إلى جداء معدوم؟', tone: 'emerald',
        body: <p>حلّ مفصّل: اقرأ كل سطر، وحاول توقّع السطر التالي قبل أن تكشفه. ثم مربّع الخوارزمي ومعادلته.</p>,
      }}
      steps={[
        {
          num: 1, title: 'الحلّ سطرًا سطرًا', subtitle: 'العبارة G', done: read,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hulul-muadala-jidaa" variant="rappel" compact />
              <MethodSteps method={solutionOf(METHOD)} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-jidaa-maadum" lead="في الحلّ خطوتان، نعيدهما في كل مرّة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'تمارين سريعة', done: NOW_47_2.every((ex) => now[ex.id]),
          content: (
            <div className="space-y-3">
              {NOW_47_2.map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum']} onAnswered={mark(ex.id)} />)}
            </div>
          ),
        },
        {
          num: 3, title: 'ملعب مربّع', subtitle: 'عاملان متساويان', done: q3,
          content: (
            <div className="space-y-3">
              {!player && (
                <Manipulation
                  type="vanishing-pitch"
                  expr="x+1"
                  levels={false}
                  title="ملعب مربّع ضلعه x + 1: كم حلًّا؟"
                  lead="الضلعان متساويان دائمًا. حرّك x: كم مرّة يختفي الملعب؟"
                />
              )}
              <TapQuestion
                prompt={<MathText>{'لماذا للمعادلة $(x + 1)^2 = 0$ حلّ واحد، بينما للمعادلة $(x + 1)(x + 2) = 0$ حلّان؟'}</MathText>}
                options={[
                  M('لأنّ مربّع عدد لا ينعدم أبدًا'),
                  M('لأنّ العاملين في $(x + 1)^2$ متساويان فينعدمان معًا عند $x = -1$ ، أمّا $x + 1$ و $x + 2$ فعاملان مختلفان'),
                  M('لأنّ المعادلة $(x + 1)^2 = 0$ من الدرجة الأولى'),
                ]}
                correct={1}
                cols={1}
                requires={['hulul-muadala-jidaa']}
                explain={<MathText>{'$(x + 1)^2 = (x + 1)(x + 1)$ : المعادلتان $x + 1 = 0$ و $x + 1 = 0$ هما المعادلة نفسها، وحلّها $-1$. أمّا $(x + 1)(x + 2) = 0$ فتعطي $-1$ و $-2$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'مربّع الخوارزمي', subtitle: 'المربّع AEGF', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="مسألة" text={CHALLENGE.text} source={CHALLENGE.source} compact />
              <ChallengeSquare label="مربّع ABCD مقسّم إلى مربّع AEGF ضلعه x، ومستطيلين بعدا كل منهما x و 5، ومربّع GHCK ضلعه 5" />
              <p className="text-xs text-slate-500"><MathText>{CHALLENGE.figure}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">ماذا ينقص الشكل ليصير مربّعًا كبيرًا؟ وأيّ جداء معدوم نصل إليه؟</p>}
                rows={[
                  { id: 'c1', label: 'مساحة المربع ABCD بدلالة x', options: [M('$x^2 + 25$'), M('$(x + 5)^2$'), M('$x^2 + 10x$')], correct: 1,
                    correction: M('ABCD مربّع ضلعه $x + 5$ ، ومساحته مجموع القطع الأربع: $(x + 5)^2 = x^2 + 5x + 5x + 25 = x^2 + 10x + 25$ .') },
                  { id: 'c2', label: <MathText>{'بما أنّ $x^2 + 10x = 39$ :'}</MathText>, options: [M('$(x + 5)^2 = 39$'), M('$(x + 5)^2 = 44$'), M('$(x + 5)^2 = 64$')], correct: 2,
                    correction: M('$(x + 5)^2 = x^2 + 10x + 25 = 39 + 25 = 64$') },
                  { id: 'c3', label: <MathText>{'$(x + 5)^2 - 64 = 0$ تُكتب:'}</MathText>, options: [M('$(x - 3)(x + 13) = 0$'), M('$(x - 59)(x + 69) = 0$'), M('$(x - 3)^2 = 0$')], correct: 0,
                    correction: M('$64 = 8^2$ : $(x + 5)^2 - 8^2 = (x + 5 - 8)(x + 5 + 8) = (x - 3)(x + 13)$') },
                ]}
                requires={['tariqat-jidaa-maadum', 'tahlil-huwiya']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'الركن الناقص $5 \\times 5 = 25$ يكمل المربّع، ثم فرق مربّعين يعطي جداءً معدومًا.'
                      : 'ضلع المربّع الكبير $x + 5$ ، و $64 = 8^2$ : استعمل $a^2 - b^2 = (a - b)(a + b)$ .'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt={<MathText>{'ما قيمة $x$ ، طول ضلع المربّع AEGF؟'}</MathText>}
                  options={[M('$8$'), M('$3$'), M('$-13$'), M('$64$')]}
                  correct={1}
                  cols={2}
                  requires={['tariqat-jidaa-maadum']}
                  explain={<MathText>{'$(x - 3)(x + 13) = 0$ يعني $x = 3$ أو $x = -13$ ؛ والعدد المطلوب موجب كما في المسألة، فهو $x = 3$ . التحقّق: $3^2 + 10 \\times 3 = 9 + 30 = 39$ . أمّا $8$ فهو ضلع المربّع الكبير $x + 5$ .'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'معادلة الخوارزمي', subtitle: 'الجبر والمقابلة', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" title={KHWARIZMI.caption} lines={[KHWARIZMI.kinds, KHWARIZMI.quote]} source={KHWARIZMI.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'كيف نجد بالتحليل جذري المعادلة $x^2 + 21 = 10x$ ؟'}</MathText></p>}
                rows={[
                  { id: 'k1', label: <MathText>{'$(x - 3)(x - 7) = $'}</MathText>, options: [M('$x^2 + 10x + 21$'), M('$x^2 - 10x + 21$'), M('$x^2 - 21$')], correct: 1,
                    correction: M('$(x - 3)(x - 7) = x^2 - 7x - 3x + 21 = x^2 - 10x + 21$') },
                  { id: 'k2', label: <MathText>{'المعادلة $x^2 + 21 = 10x$ تكافئ'}</MathText>, options: [M('$(x - 3)(x - 7) = 0$'), M('$(x + 3)(x + 7) = 0$'), M('$x^2 + 11 = 0$')], correct: 0,
                    correction: M('نطرح $10x$ من الطرفين: $x^2 - 10x + 21 = 0$ ، أي $(x - 3)(x - 7) = 0$ .') },
                  { id: 'k3', label: 'جذراها', options: [M('$-3$ و $-7$'), M('$21$ و $10$'), M('$3$ و $7$')], correct: 2,
                    correction: M('$x - 3 = 0$ أو $x - 7 = 0$ : $x = 3$ أو $x = 7$ — الجذران اللذان استخرجهما الخوارزمي.') },
                ]}
                requires={['tariqat-jidaa-maadum']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'وجدت بالتحليل وخاصية الجداء المعدوم الجذرين $3$ و $7$ اللذين استخرجهما الخوارزمي في «كتاب الجبر والمقابلة».'
                      : 'اجعل الطرف الثاني $0$ أوّلًا، ثم تحقّق بالنشر أنّ $(x - 3)(x - 7)$ يساوي الطرف الأول.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ5(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
