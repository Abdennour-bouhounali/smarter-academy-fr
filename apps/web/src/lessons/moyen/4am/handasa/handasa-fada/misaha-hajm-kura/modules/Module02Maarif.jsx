import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW2, KNOW2_LINES, QIMA } from '../content/textbook';

/**
 * Module 2 — معارف 2 (p. 166) « مساحة الكرة و حجم الجلّة ».
 * FORMALIZE : 1) 𝒜 = 4πR² (brique misahat-kura, la figure du manuel) — une sphère de 7 cm ; 2) 𝒱 = 4/3·πR³ (brique
 * hajm-julla) — une boule de 6 cm, les deux erreurs (la puissance 2, le coefficient 3/4) ; 3) l'exemple du manuel R = 1,4 cm,
 * la valeur exacte en π et l'arrondi au mm² / mm³ (brique qima-muqarraba, la règle déclarée `knowledge_formalization`).
 * Les nombres des questions ne sont ni ceux du lab ni ceux du إختبار. LP : P1, P2, P3.
 * Rétrofit 2026-10-15 (§4quater) : chaque étape pose sa QUESTION d'abord (la réponse vient de ce que l'élève a trouvé au module 1) ;
 * les briques et l'exemple du manuel (valeurs 24,63 / 11,494) NOMMENT ensuite ; la carte du haut ne dit plus que ce qu'est le module.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={["كيف نكتب ما وجدناه بالقشرة وبالعصير؟", "كيف نحسب مثال الكتاب بالقيمة المضبوطة ثم المدوّرة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — مساحة الكرة وحجم الجلة"
      moduleSubtitle="ما وجدته بالقشرة والعصير، بكلمات الكتاب"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 166', title: KNOW2.title, tone: 'violet',
        body: <p>ثلاث خطوات: القانونان بكلمات الكتاب، ثم مثاله الذي يحسب فيه مساحة وحجما ويدوّر النتيجتين. جرّب كل سؤال بما عرفته في المطبخ قبل أن ترى القانون.</p>,
        footer: <SourceTag source={KNOW2.source} />,
      }}
      steps={[
        {
          num: 1, title: 'مساحة الكرة', subtitle: 'تعريف', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'مساحة كرة نصف قطرها $7\\,\\mathrm{cm}$ (القيمة المضبوطة) هي:'}</MathText>}
                options={[
                  // πR² : un seul disque (MISC-MISAHA-DAIRA)
                  '$49\\pi\\,\\mathrm{cm}^2$',
                  '$196\\pi\\,\\mathrm{cm}^2$',
                  // 2πR : une longueur (MISC-MISAHA-MUHIT)
                  '$14\\pi\\,\\mathrm{cm}$',
                ].map(M)}
                correct={1}
                cols={3}
                explain={<MathText>{'$\\mathcal{A} = 4\\pi \\times 7^2 = 4\\pi \\times 49 = 196\\pi\\,\\mathrm{cm}^2$ : أربعة أقراص مساحة كل منها $49\\pi\\,\\mathrm{cm}^2$ ؛ و $14\\pi\\,\\mathrm{cm}$ طول (محيط الدائرة الكبرى).'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="misahat-kura" variant="rappel" lead="أربعة أقراص كبرى، في قانون واحد:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'حجم الجلة', subtitle: 'تعريف', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'حجم جلة نصف قطرها $6\\,\\mathrm{cm}$ (القيمة المضبوطة) هو:'}</MathText>}
                options={[
                  '$288\\pi\\,\\mathrm{cm}^3$',
                  // R² au lieu de R³ (MISC-HAJM-QUWA)
                  '$48\\pi\\,\\mathrm{cm}^3$',
                  // 3/4 au lieu de 4/3 (MISC-HAJM-MUAMIL)
                  '$162\\pi\\,\\mathrm{cm}^3$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$\\mathcal{V} = \\frac{4}{3}\\pi \\times 6^3 = \\frac{4}{3}\\pi \\times 216 = 288\\pi\\,\\mathrm{cm}^3$ ؛ و $48\\pi$ يستعمل $6^2$ بدل $6^3$ ، و $162\\pi$ يستعمل $\\frac{3}{4}$ بدل $\\frac{4}{3}$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="hajm-julla" variant="rappel" lead="ثلثا الأسطوانة، في قانون واحد:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'مثال الكتاب: R = 1,4 cm', subtitle: 'القيمة المضبوطة ثم المدوّرة', done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'كرة نصف قطرها $1{,}4\\,\\mathrm{cm}$ ، نحسب مساحتها وحجم جلتها ($\\pi$ تبقى كما هي إلى أن نقرّب):'}</MathText></p>}
                rows={[
                  // 0,1 cm² = 10 mm² ; 100 mm² = 1 cm²
                  { id: 'mm2', label: <MathText>{'$1\\,\\mathrm{mm}^2$ يساوي'}</MathText>, options: ['$0{,}1\\,\\mathrm{cm}^2$', '$0{,}01\\,\\mathrm{cm}^2$', '$100\\,\\mathrm{cm}^2$'].map(M), correct: 1, correction: <MathText>{'$1\\,\\mathrm{cm} = 10\\,\\mathrm{mm}$ فـ $1\\,\\mathrm{cm}^2 = 100\\,\\mathrm{mm}^2$ و $1\\,\\mathrm{mm}^2 = 0{,}01\\,\\mathrm{cm}^2$ : رقمان بعد الفاصلة.'}</MathText> },
                  // 24,63 est arrondi ; 24,630086 aussi (6 chiffres)
                  { id: 'exact', label: 'القيمة المضبوطة لمساحة الكرة', options: ['$7{,}84\\pi\\,\\mathrm{cm}^2$', '$24{,}63\\,\\mathrm{cm}^2$', '$24{,}630086\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{QIMA.exact}</MathText> },
                  // 2 chiffres : le mm² ; 1 chiffre : 0,1 cm³
                  { id: 'mm3', label: <MathText>{'التدوير إلى $1\\,\\mathrm{mm}^3$ يعطي للحجم'}</MathText>, options: ['$11{,}5\\,\\mathrm{cm}^3$', '$11{,}49\\,\\mathrm{cm}^3$', '$11{,}494\\,\\mathrm{cm}^3$'].map(M), correct: 2, correction: <MathText>{QIMA.rounding}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: القيمة المضبوطة بدلالة π، ثم تدوير يوافق الوحدة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="example" text={`${KNOW2.exampleArea} ${KNOW2.exampleVolume}`} source={KNOW2.source} compact />}
              {q3 && (
                <div className="space-y-1 rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-950 [&_.katex]:whitespace-nowrap">
                  <p><MathText>{KNOW2_LINES.areaExact}</MathText></p>
                  <p><MathText>{KNOW2_LINES.volumeExact}</MathText></p>
                  <SourceTag source={KNOW2_LINES.source} />
                </div>
              )}
              {q3 && <KnowledgeBrick id="qima-muqarraba" lead="ما يفعله المثال دون أن يكتبه:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
