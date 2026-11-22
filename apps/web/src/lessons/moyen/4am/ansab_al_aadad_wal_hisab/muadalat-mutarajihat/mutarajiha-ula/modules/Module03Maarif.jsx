import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import RayFigure from '../components/RayFigure';
import GraphChoice from '../components/GraphChoice';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { KNOWLEDGE_3, KNOWLEDGE_4 } from '../content/textbook';

/**
 * Module 3 — معارف 3 et 4 (p. 48).
 *   1. l'متراجحة, ses حلول, « حل متراجحة » et la forme du premier degré (brique
 *      mutarajiha-ula), l'exemple 1 (4x > −3) ;
 *   2. l'exemple 2 — CORRIGÉ : « قد تغيّر » —, la question keep/change, PUIS les trois règles (brique qawaid-ittijah, après la réponse, rétrofit 2026-10-15) ;
 *   3. le dessin du manuel (brique tamthil-bayani) : 5x ≤ 3 et x > 6, puis 2x ≥ 6 à dessiner.
 * LP : P1, P2, P3.
 *
 * « أتوقّع القاعدة » : l'encadré تعريف (1) et les deux ملاحظة du manuel (3) ÉNONCENT la règle
 * juste avant sa brique — ils sont enveloppés dans une PredictRule portant l'id de la brique
 * (mutarajiha-ula, tamthil-bayani) : l'élève écrit d'abord (predictPrompt de knowledge.jsx),
 * puis encadré et brique s'affichent, une seule « توقّعك ». L'exemple 1 de معارف 4 et son
 * dessin restent AVANT la prédiction : la prompt s'appuie sur eux.
 *
 * Lecteur de mission (« NO BACK-AND-FORTH », 2026-11-11) — l'étape 3 a sa version : chaque exemple, SON dessin et une question
 * sur le dessin forment UN écran (`data-paging-keep`) — « 3/2 est-il solution ? », « 8 est-il solution ? » : l'élève vérifie la
 * borne avant d'écrire la règle ; la brique tamthil-bayani porte elle-même « أتوقّع القاعدة » (son corps = la définition, les
 * deux dessins et les deux ملاحظة du manuel : rien n'est perdu) et sa consigne redit ce que les deux dessins montrent. Les
 * briques restent entières sur leur écran (`data-paging-keep`). La page et l'enseignant : inchangés.
 */
const KEEP = ['يبقى', 'يتغيّر'];
const SOLUTION = ['نعم، حلّ لها', 'لا، ليس حلًّا لها'];
const PLAYER_PREDICT = 'في المثال 1 العدد $\\frac{3}{2}$ حلّ، والرمز عنده موجّه نحو الجزء الملوّن. في المثال 2 العدد 8 ليس حلًّا، والرمز عنده غير موجّه نحوه. متى نوجّه الرمز عند الحدّ نحو الجزء الملوّن، ومتى لا نوجّهه؟ اكتب القاعدة.';

/** Lecteur : un exemple du manuel, son dessin et la question sur la borne — un seul écran. */
function ExampleScreen({ text, figure, label, question }) {
  return (
    <div data-paging-keep className="grid grid-cols-[minmax(0,1fr)_minmax(0,17rem)] items-start gap-4">
      <div className="space-y-3">
        <TextbookBox kind="example" text={text} source={KNOWLEDGE_4.source} compact />
        {question}
      </div>
      <RayFigure {...figure} label={label} />
    </div>
  );
}

export default function Module03Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const player = useModulePlayer(MODULE_CTX);

  const graphQuestion = (
    <GraphChoice
      prompt={<MathText>{'مثّل بيانيا حلول المتراجحة $2x \\geq 10$ .'}</MathText>}
      graph={{
        options: [
          { from: 2, to: 8, at: 5, side: 'right', closed: false },
          { from: 2, to: 8, at: 5, side: 'left', closed: true },
          { from: 2, to: 8, at: 5, side: 'right', closed: true },
        ],
        correct: 2,
        explain: '$2x \\geq 10$ تعطي $x \\geq 5$ : الجزء الملوّن على يمين 5، و 5 حلّ ($2 \\times 5 = 10$ و $10 \\geq 10$) فالرمز موجّه نحوه.',
      }}
      requires={['tamthil-bayani']}
      onAnswered={() => setQ4(true)}
    />
  );
  const LABEL1 = 'الجزء الملوّن بالأحمر على يسار واحد ونصف، والرمز موجّه نحوه';
  const LABEL2 = 'الجزء الملوّن بالأحمر على يمين 8، والرمز غير موجّه نحوه';

  const playerStep3 = (
    <div className="space-y-3">
      <div data-paging-keep><KnowledgeBrick id="tamthil-jadwal" variant="rappel" compact /></div>
      <ExampleScreen text={KNOWLEDGE_4.example1} figure={KNOWLEDGE_4.figure1} label={LABEL1}
        question={(
          <TapQuestion
            prompt={<MathText>{'في الرسم، الحدّ هو $\\frac{3}{2}$ . هل العدد $\\frac{3}{2}$ حلّ للمتراجحة $4x \\leq 6$ ؟'}</MathText>}
            options={SOLUTION} correct={0} cols={2} requires={['hal-mutarajiha']}
            explain={<MathText>{'$4 \\times \\frac{3}{2} = 6$ و $6 \\leq 6$ متباينة صحيحة: $\\frac{3}{2}$ حلّ — انظر إلى اتجاه الرمز عنده.'}</MathText>}
          />
        )} />
      <ExampleScreen text={KNOWLEDGE_4.example2} figure={KNOWLEDGE_4.figure2} label={LABEL2}
        question={(
          <TapQuestion
            prompt={<MathText>{'في الرسم، الحدّ هو 8 . هل العدد 8 حلّ للمتراجحة $-\\frac{1}{4}x + 1 < -1$ ؟'}</MathText>}
            options={SOLUTION} correct={1} cols={2} requires={['hal-mutarajiha']}
            explain={<MathText>{'$-\\frac{1}{4} \\times 8 + 1 = -1$ و $-1 < -1$ متباينة خاطئة: 8 ليس حلًّا — انظر إلى اتجاه الرمز عنده.'}</MathText>}
          />
        )} />
      <div data-paging-keep>
        <KnowledgeBrick id="tamthil-bayani" lead="القاعدة التي وجدتها حين وجّهت الرمز:" predictPrompt={PLAYER_PREDICT} />
      </div>
      {graphQuestion}
    </div>
  );

  return (
    <ContentModule
      objectives={["ما المتراجحة؟ وما حلّها؟", "متى يتغيّر اتجاه المتراجحة ومتى يبقى؟", "كيف نمثّل حلول متراجحة على مستقيم مدرّج؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="معارف — المتراجحات وتمثيل حلولها"
      moduleSubtitle="ما فعلته في النشاط، في تعريفات وقواعد"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'معارف', title: KNOWLEDGE_3.title, tone: 'sky',
        body: <p>نقاطك الحمراء، الخطوات التي قبلتها والرمز الذي وجّهته: تُقال في تعريفين وثلاث قواعد ورسم، مع أمثلة.</p>,
        footer: <div className="flex flex-wrap gap-2"><SourceTag source={KNOWLEDGE_3.source} /><SourceTag source={KNOWLEDGE_4.source} /></div>,
      }}
      steps={[
        {
          num: 1, title: 'المتراجحة وحلولها', subtitle: 'المثال 1', done: q1 && q2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hal-mutarajiha" variant="rappel" compact />
              <PredictRule id="mutarajiha-ula">
                <TextbookBox kind="definition" lines={[...KNOWLEDGE_3.definition, KNOWLEDGE_3.firstDegree]} source={KNOWLEDGE_3.source} compact />
              </PredictRule>
              {/* Its body opens on « المتراجحة بمجهول x هي متباينة… »: it also establishes `mutarajiha`, whose own brick sits in
                  module 1, whose dynamic steps the knowledge audit cannot read (W_UNPARSEABLE_STEPS) — test item E1 requires it. */}
              <KnowledgeBrick id="mutarajiha-ula" establishes={['mutarajiha-ula', 'mutarajiha']} lead="التعريف، كما جرّبته بمتراجحتي النشاط:" />
              <TextbookBox kind="example" text={KNOWLEDGE_3.example1} source={KNOWLEDGE_3.source} compact />
              <TapQuestion
                prompt={<MathText>{'هل العدد 0 حلّ للمتراجحة $5x > -4$ ؟'}</MathText>}
                options={['نعم، 0 حلّ لها', 'لا، 0 ليس حلًّا لها']}
                correct={0}
                cols={2}
                requires={['mutarajiha-ula']}
                explain={<MathText>{'$5 \\times 0 = 0$ و $0 > -4$ متباينة صحيحة: 0 حلّ، أمّا $-1$ فليس حلًّا. للمتراجحة حلول كثيرة، لا حلّ واحد.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <TapQuestion
                  prompt="أيّ متراجحة من الدرجة الأولى بمجهول واحد؟"
                  options={[
                    <MathText key="a">{'$2x^2 - 1 < 2$'}</MathText>,
                    <MathText key="b">{'$5x - 2 \\leq x + 9$'}</MathText>,
                    <MathText key="c">{'$x(x + 1) > 0$'}</MathText>,
                  ]}
                  correct={1}
                  cols={3}
                  requires={['mutarajiha-ula']}
                  explain={<MathText>{'$5x - 2 \\leq x + 9$ من الشكل $ax + b \\leq cx + d$ (حيث $a = 5$ ، $b = -2$ ، $c = 1$ ، $d = 9$). في الأخريين يظهر $x^2$ : $x(x + 1) = x^2 + x$.'}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'القواعد الثلاث', subtitle: 'المثال 2', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" lines={[KNOWLEDGE_3.example2a, KNOWLEDGE_3.example2b]} source={KNOWLEDGE_3.source} compact />
                            <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في خطوات المثال 2: هل يبقى اتجاه المتراجحة أم يتغيّر؟</p>}
                rows={[
                  { id: 'k1', label: <MathText>{'نطرح $2x$ من طرفي $7x - 4 \\leq 2x + 6$'}</MathText>, options: KEEP, correct: 0, correction: <MathText>{'طرح نفس العدد من الطرفين: $5x - 4 \\leq 6$ ، الاتجاه يبقى.'}</MathText> },
                  { id: 'k2', label: <MathText>{'نقسم طرفي $5x \\leq 10$ على 5'}</MathText>, options: KEEP, correct: 0, correction: <MathText>{'5 موجب تمامًا: $x \\leq 2$.'}</MathText> },
                  { id: 'k3', label: <MathText>{'نقسم طرفي $-4x > 28$ على $-4$'}</MathText>, options: KEEP, correct: 1, correction: <MathText>{'$-4$ سالب تمامًا: $x < -7$ ، الاتجاه تغيّر.'}</MathText> },
                ]}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'الاتجاه لا يتغيّر إلّا عند الضرب أو القسمة على عدد سالب تمامًا.'
                      : 'انظر إلى العملية: إضافة أو طرح؟ ضرب أو قسمة على موجب أم على سالب؟'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="qawaid-ittijah" lead="خطواتك في المختبر — ما قبلته نقاطك وما رفضته — في ثلاث قواعد:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'التمثيل البياني لحلول متراجحة', subtitle: 'الرسم', done: q4,
          content: player ? playerStep3 : (
            <div className="space-y-3">
              <KnowledgeBrick id="tamthil-jadwal" variant="rappel" compact />
              <TextbookBox kind="example" text={KNOWLEDGE_4.example1} source={KNOWLEDGE_4.source} compact />
              <RayFigure {...KNOWLEDGE_4.figure1} label={LABEL1} />
              <PredictRule id="tamthil-bayani">
                <TextbookBox kind="remark" text={KNOWLEDGE_4.note1} source={KNOWLEDGE_4.source} compact />
                <TextbookBox kind="example" text={KNOWLEDGE_4.example2} source={KNOWLEDGE_4.source} compact />
                <RayFigure {...KNOWLEDGE_4.figure2} label={LABEL2} />
                <TextbookBox kind="remark" text={KNOWLEDGE_4.note2} source={KNOWLEDGE_4.source} compact />
              </PredictRule>
              <KnowledgeBrick id="tamthil-bayani" lead="القاعدة التي وجدتها حين وجّهت الرمز:" />
              {graphQuestion}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
