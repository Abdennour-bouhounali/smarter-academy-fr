import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import WordFraction from '../../../../../../common/components/WordFraction';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TUSI, ACT3, KNOW1, KNOW2, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_ACT3, FIG_KNOW1_EFG, FIG_KNOW2_EFG, FIG_PQR } from '../content/figures';

/**
 * Module 2 — نشاط 3 (p. 116), معارف 1 et 2 (p. 118), et l'encadré « نصير الدين الطوسي » (p. 115, doublon déclaré :
 * les noms الجيب، جيب التمام، الظل).
 *   1. UNDERSTAND : نشاط 3 1) — compléter sin B̂ et tan B̂ avec les MOTS du manuel (WordFraction), avant les définitions ;
 *   2. FORMALIZE : معارف 1 — la définition du جيب (brique jayb), l'exemple EFG (3/√13 exact, 0,83 approché : brique
 *      qiyam-madbuta après le 30° de l'étape 3), puis un triangle NOUVEAU (PQR 5-12-13) ;
 *   3. FORMALIZE : معارف 2 — la définition du ظل, l'exemple CORRIGÉ (AC/BC → AC/AB), tan 30° = √3/3, brique thill ;
 *   4. TOUCH THE MATH : نشاط 3 2) — pourquoi 0 < sin, cos < 1 (brique hudud), puis quelle valeur est possible.
 * LP : P1 (1–3), P2 (4).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const WF = ({ num, den }) => <WordFraction num={num} den={den} />;

export default function Module02Maarif() {
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      objectives={['كيف نكتب تعريف الجيب بالكلمات؟', 'ومن أين يأتي الظل؟', 'بين أيّ عددين يقع الجيب وجيب التمام؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الجيب والظل"
      moduleSubtitle="تعريفان من الكتاب، قيمة مضبوطة وقيمة مقربة، وحدّان لا يتجاوزهما الجيب"
      estimatedTime="11 دقيقة"
      brief={{
        tag: 'معارف — الكتاب ص 116 و 118', title: 'جيب زاوية حادة وظلها', tone: 'violet',
        body: <p>أربعة أسئلة على مثلثات الكتاب؛ بعد كل جواب يأتي ما يسمّي ما وجدته.</p>,
      }}
      steps={[
        {
          num: 1, title: 'كيف نقرأ الجيب والظل بالكلمات؟', subtitle: 'المقابل، المجاور، الوتر', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACT3.part1} source={ACT3.source} compact />
              <GeoFigure {...FIG_ACT3} />
              <TapQuestion
                prompt={<MathText>{'$\\sin\\widehat{B} =$'}</MathText>}
                options={[
                  <WF key="a" num="الضلع المقابل" den="الوتر" />,
                  <WF key="b" num="الضلع المجاور" den="الوتر" />, // c'est le cosinus
                  <WF key="c" num="الوتر" den="الضلع المقابل" />, // renversé : plus grand que 1
                ]}
                correct={0}
                cols={3}
                requires={['nisab-zawiya']}
                explain={<MathText>{'$\\sin\\widehat{B} = \\dfrac{AC}{BC}$ : [AC] لا يمرّ بالرأس B فهو المقابل، و [BC] الوتر. (المجاور على الوتر هو جيب التمام.)'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt={<MathText>{'$\\tan\\widehat{B} =$'}</MathText>}
                  options={[
                    <WF key="a" num="الضلع المقابل" den="الضلع المجاور" />,
                    <WF key="b" num="الضلع المجاور" den="الضلع المقابل" />, // renversé
                    <WF key="c" num="الضلع المقابل" den="الوتر" />, // c'est le sinus
                  ]}
                  correct={0}
                  cols={3}
                  requires={['nisab-zawiya']}
                  explain={<MathText>{'$\\tan\\widehat{B} = \\dfrac{AC}{AB}$ : المقابل [AC] على المجاور [AB]؛ الظل لا يستعمل الوتر.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {q1 && (
                <>
                  <TextbookBox kind="remark" title={TUSI.title} text={TUSI.text} source={TUSI.source} compact />
                  <KnowledgeBrick id="nisab-zawiya" variant="rappel" compact />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'ما جيب الزاوية P في هذا المثلث؟', subtitle: 'ثم معارف 1', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800"><MathText>{'مثلث PQR قائم في Q حيث $PQ = 5$ ، $QR = 12$ و $PR = 13$ .'}</MathText> <SourceTag source={PLATFORM_SOURCE} /></p>
              <GeoFigure {...FIG_PQR} />
              <TapQuestion
                prompt={<MathText>{'$\\sin\\widehat{P} =$'}</MathText>}
                options={['$\\dfrac{12}{13}$', '$\\dfrac{5}{13}$', '$\\dfrac{12}{5}$'].map(M)}
                correct={0}
                cols={3}
                requires={['nisab-zawiya']}
                explain={<MathText>{'بالنسبة إلى P: [QR] مقابل و [PR] وتر: $\\sin\\widehat{P} = \\dfrac{12}{13}$ . ($\\dfrac{5}{13}$ هو $\\cos\\widehat{P}$ ، و $\\dfrac{12}{5}$ هو $\\tan\\widehat{P}$ .)'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <KnowledgeBrick id="jayb" lead="معارف 1، كما في الكتاب: الجيب، ومعه تذكير بجيب التمام." />
                  <TextbookBox kind="example" text={KNOW1.example2} source={KNOW1.source} compact />
                  <GeoFigure {...FIG_KNOW1_EFG} />
                  <p className="text-sm text-slate-700"><MathText>{KNOW1.exact}</MathText></p>
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'وما ظل الزاوية R؟', subtitle: 'ثم معارف 2', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في المثلث PQR نفسه (الشكل أعلاه): $\\tan\\widehat{R} =$'}</MathText>}
                options={['$\\dfrac{5}{12}$', '$\\dfrac{12}{5}$', '$\\dfrac{5}{13}$'].map(M)}
                correct={0}
                cols={3}
                requires={['nisab-zawiya']}
                explain={<MathText>{'بالنسبة إلى R: [PQ] مقابل و [QR] مجاور: $\\tan\\widehat{R} = \\dfrac{5}{12}$ . ($\\dfrac{12}{5}$ هو ظل الزاوية P، و $\\dfrac{5}{13}$ جيب R.)'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <KnowledgeBrick id="thill" lead="معارف 2، كما في الكتاب:" />
                  <p className="text-xs text-slate-500" data-correction><MathText>{KNOW2.correction}</MathText></p>
                  <TextbookBox kind="example" text={KNOW2.example2} source={KNOW2.source} compact />
                  <GeoFigure {...FIG_KNOW2_EFG} />
                  <TextbookBox kind="remark" lines={KNOW2.remarks} source={KNOW2.source} compact />
                  <KnowledgeBrick id="qiyam-madbuta" lead="قيمتان لعدد واحد:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'الجيب وجيب التمام: أيّ قيم؟', subtitle: 'نشاط 3، السؤال 2', done: q4,
          content: (
            <div className="space-y-3">
              {/* La consigne du manuel ÉNONCE la règle et la bonne option donne sa raison : l'élève écrit d'abord
                  (« أتوقّع القاعدة », item hudud), puis consigne, question et brique — une seule « توقّعك ». */}
              <PredictRule id="hudud">
                <TextbookBox kind="situation" text={ACT3.part2} source={ACT3.source} compact />
                <TapQuestion
                  prompt="لماذا؟"
                  options={[
                    'الأطوال موجبة تماما، والوتر أطول من كل ضلع من ضلعي الزاوية القائمة، فالبسط أصغر من المقام',
                    'لأن قيس الزاوية الحادة أصغر من $90^{\\circ}$', // un angle n'est pas un rapport de longueurs
                    'لأن الضلع المقابل أصغر دائما من الضلع المجاور', // faux : à 60° l'opposé est plus long
                  ].map(M)}
                  correct={0}
                  cols={1}
                  requires={['jayb', 'fithaghuras']}
                  explain={<MathText>{`${ACT3.bounds} (والمقابل قد يكون أطول من المجاور: $\\tan 60^{\\circ} \\approx 1{,}73$ .)`}</MathText>}
                  onAnswered={() => setQ4a(true)}
                />
              </PredictRule>
              {q4a && <KnowledgeBrick id="hudud" lead="ما رأيته حين رفعت المنحدر: اللوح يبقى أطول." />}
              {q4a && (
                <TapQuestion
                  prompt="أيّ عدد يمكن أن يكون جيب تمام زاوية حادة في مثلث قائم؟"
                  options={['$0{,}6$', '$1{,}2$', '$1$'].map(M)}
                  correct={0}
                  cols={3}
                  requires={['hudud']}
                  explain={<MathText>{'جيب التمام محصور تماما بين 0 و 1: $1{,}2 > 1$ مستحيل، و 1 يعني مجاورا بطول الوتر، أي لا مثلث.'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
