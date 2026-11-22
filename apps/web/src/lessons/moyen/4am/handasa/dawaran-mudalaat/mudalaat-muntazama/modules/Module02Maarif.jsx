import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW5, AIDS } from '../content/textbook';
import { FIG_KNOW5_TRI, FIG_KNOW5_SQ, FIG_KNOW5_HEX } from '../content/figures';

/**
 * Module 2 — معارف 5 (p. 156) « المضلعات المنتظمة ».
 * FORMALIZE : 1) la définition (brique tarif-muntazam ; le losange et le rectangle, une seule des deux conditions —
 * la mise en garde de la carte), 2) le cercle circonscrit, son centre, et 360°/n (briques daira-muhita, markaziya-360 ;
 * les trois exemples du manuel redessinés : triangle 120°, carré 90°, hexagone 60°), 3) la rotation (O, \widehat{AOB}) qui
 * laisse le polygone (brique surat-mudalla). TOUCH THE MATH : l'octogone (45°, et non 22,5°), l'image d'un sommet de
 * l'hexagone. LP : P1, P2.
 * RÉTROFIT 2026-10-15 : chaque étape pose d'abord sa question (sur la cellule / l'étoile / l'octogone de la fontaine, tous tirés de l'atelier
 * du module 1), les briques, les trois exemples du manuel et la définition viennent APRÈS la réponse ; la carte du haut ne dit plus que ce qu'est le module.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const EXAMPLE_FIG = { tri: FIG_KNOW5_TRI, sq: FIG_KNOW5_SQ, hex: FIG_KNOW5_HEX };

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المضلعات المنتظمة"
      moduleSubtitle="ما صنعته في الورشة، بكلمات الكتاب"
      estimatedTime="9 دقائق"
      objectives={["ما الذي تشترك فيه خلية النحل والنجمة والمثلث؟", "متى نسمّي مضلعًا منتظمًا؟", "ماذا يحدث للمضلع المنتظم حين ندوّره حول مركزه؟"]}
      brief={{
        tag: 'معارف — الكتاب ص 156', title: KNOW5.title, tone: 'violet',
        body: <p>ثلاثة أسئلة قصيرة عمّا صنعته في الورشة، وبعد كل جواب يكتب الكتاب ما وجدتَه.</p>,
        footer: <SourceTag source={KNOW5.source} />,
      }}
      steps={[
        {
          num: 1, title: 'المضلع المنتظم', subtitle: 'التعريف', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="خلية النحل التي أغلقتَها في الورشة سداسي منتظم. ما الذي يلزم ليكون أيّ مضلع «منتظمًا»؟"
                options={['أضلاعها كلها، وزواياها كلها أيضًا', 'أضلاعها كلها فقط', 'زواياها كلها فقط']}
                correct={0}
                cols={1}
                explain="في الخلية المنتظمة تتقايس الأضلاع وتتقايس الزوايا معًا: يكفي أن يختلّ أحد الشرطين لتفقد الخلية انتظامها."
                onAnswered={() => setQ1a(true)}
              />
              {q1a && <KnowledgeBrick id="tarif-muntazam" lead="شرطان معا، لا شرط واحد:" />}
              {q1a && <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">هل المضلع منتظم؟</p>}
                rows={[
                  { id: 'rhombus', label: 'معين ليس مربعا', options: ['ليس منتظما', 'منتظم'], correct: 0, correction: <MathText>{AIDS.adla}</MathText> },
                  { id: 'rect', label: 'مستطيل ليس مربعا', options: ['ليس منتظما', 'منتظم'], correct: 0, correction: <MathText>{AIDS.rect}</MathText> },
                  { id: 'square', label: 'مربع', options: ['منتظم', 'ليس منتظما'], correct: 0, correction: 'أضلاعه الأربعة متقايسة وزواياه الأربع قائمة.' },
                  { id: 'tri', label: 'مثلث متقايس الأضلاع', options: ['منتظم', 'ليس منتظما'], correct: 0, correction: 'أضلاعه الثلاثة متقايسة وزواياه الثلاث قيس كل منها 60 درجة.' },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: المعين والمستطيل يحققان شرطا واحدا فقط.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />}
            </div>
          ),
        },
        {
          num: 2, title: 'الدائرة المحيطة والزاوية المركزية', subtitle: 'الخاصيتان 1 و 2', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نافورة في ساحة بوهران على شكل ثماني منتظم. كما فعلتَ مع الخلية والنجمة، نضع رؤوسها واحدا بعد الآخر بدوران مركزه مركز النافورة. قيس الزاوية المركزية التي تحصر ضلعا في هذا الثماني:'}</MathText>}
                options={['$45^\\circ$', '$22{,}5^\\circ$', '$135^\\circ$'].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{`${AIDS.right180} ${AIDS.why180} ($135^\\circ$ زاوية الثماني، لا زاويته المركزية.)`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                <KnowledgeBrick id="daira-muhita" lead="رؤوس الخلية ورؤوس النجمة كانت على دائرة واحدة:" />
                <KnowledgeBrick id="markaziya-360" variant="rappel" lead="والزاوية التي دوّرت بها كل رأس هي الزاوية المركزية:" />
                <div className="grid gap-3 grid-cols-3" data-know5-examples>
                  {KNOW5.examples.map((e) => (
                    <div key={e.name} className="space-y-1 rounded-xl border border-violet-200 bg-white p-2">
                      <p className="text-center text-sm font-bold text-violet-900">{e.name}</p>
                      <GeoFigure {...EXAMPLE_FIG[e.figure]} />
                      <p className="text-center text-sm"><MathText>{e.formula}</MathText></p>
                    </div>
                  ))}
                </div>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'المضلع صورة نفسه', subtitle: 'الخاصية 3', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW5_HEX} />
              <TapQuestion
                prompt={<MathText>{'ABCDEF سداسي منتظم مركزه O، رؤوسه مرتّبة في الاتجاه المباشر. الدوران الذي مركزه O ويحوّل A إلى B يحوّل C إلى:'}</MathText>}
                options={['D', 'B', 'C']}
                correct={0}
                cols={3}
                explain={<MathText>{'هو الدوران الذي مركزه O وزاويته $\\widehat{AOB} = 60^\\circ$ في الاتجاه المباشر: كل رأس ينتقل إلى الرأس الذي يليه، فصورة C هي D، والسداسي صورة نفسه. (B صورة C في الاتجاه المعاكس، و C لا تبقى في مكانها لأنها ليست المركز.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="surat-mudalla" lead="كما عادت خلية النحل إلى نفسها بعد كل دوران:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
