import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, METHOD_INVERSE } from '../content/textbook';

/**
 * Module 3 — طرائق, ÉCRITES PAR LA PLATEFORME et déclarées (`knowledge_formalization`, « معارف من المنصّة ») : le scan n'a pas
 * de طرائق pour ce درس (il s'arrête p. 169).
 * TOUCH THE MATH : 1) du diamètre (8 cm) à la valeur exacte puis arrondie au dixième — révélée ligne à ligne (MethodSteps),
 * brique tariqa-hisab, une question sur une bille de diamètre 2 cm ; 2) l'inverse, de l'aire (100π) au rayon puis au volume,
 * brique tariqa-aksiya, une question (324π → 9 cm). LP : P1, P2, P3.
 * Rétrofit 2026-10-15 : l'exemple se lit ligne à ligne (l'élève essaie la ligne suivante), puis la question, PUIS la brique qui
 * résume la méthode (elle ne précède plus la question qui l'exerce).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);

  return (
    <ContentModule
      objectives={["كيف ننتقل من القطر إلى المساحة والحجم؟", "كيف نجد نصف القطر إذا عرفنا المساحة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — القيمة المضبوطة ثم المدوّرة"
      moduleSubtitle="من القطر إلى المساحة والحجم، ومن المساحة إلى نصف القطر"
      estimatedTime="9 دقائق"
      brief={{
        tag: 'طرائق — معارف من المنصّة', title: METHOD.title, tone: 'emerald',
        body: <p>صفحات الطرائق لهذا الدرس غير موجودة في نسخة الكتاب المتوفّرة: المنصّة تكتب طريقتين بنفس شكل الكتاب. اقرأ الحل سطرا بسطر، وحاول السطر الموالي قبل أن تكشفه.</p>,
        footer: <SourceTag source={METHOD.source} />,
      }}
      steps={[
        {
          num: 1, title: 'من القطر إلى المساحة والحجم', subtitle: 'القيمة المضبوطة ثم المدوّرة', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD} />
              <TapQuestion
                prompt={<MathText>{'كرية زجاجية قطرها $2\\,\\mathrm{cm}$ . القيمة المضبوطة لحجم الجلة:'}</MathText>}
                options={[
                  '$\\frac{4}{3}\\pi\\,\\mathrm{cm}^3$',
                  // le diamètre 2 au lieu du rayon 1 (MISC-MISAHA-QUTR)
                  '$\\frac{32}{3}\\pi\\,\\mathrm{cm}^3$',
                  // l'aire 4πR² (MISC-WAHDA)
                  '$4\\pi\\,\\mathrm{cm}^3$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$R = 2 \\div 2 = 1\\,\\mathrm{cm}$ ، $\\mathcal{V} = \\frac{4}{3}\\pi \\times 1^3 = \\frac{4}{3}\\pi\\,\\mathrm{cm}^3$ . بالقطر نجد $\\frac{4}{3}\\pi \\times 2^3 = \\frac{32}{3}\\pi$ ، ثمانية أضعاف الحجم.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tariqa-hisab" lead="الطريقة في سطر:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'من المساحة إلى نصف القطر', subtitle: 'الطريق المعاكس', done: q2,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_INVERSE} />
              <TapQuestion
                prompt={<MathText>{'مساحة كرة $324\\pi\\,\\mathrm{cm}^2$ . نصف قطرها هو:'}</MathText>}
                options={[
                  // R² = 81 pris pour R (la racine oubliée)
                  '$81\\,\\mathrm{cm}$',
                  // √324 sans diviser par 4
                  '$18\\,\\mathrm{cm}$',
                  '$9\\,\\mathrm{cm}$',
                ].map(M)}
                correct={2}
                cols={3}
                explain={<MathText>{'$4\\pi R^2 = 324\\pi$ أي $R^2 = 324 \\div 4 = 81$ ، و $R = \\sqrt{81} = 9\\,\\mathrm{cm}$ . العدد $81$ هو $R^2$ ، و $18 = \\sqrt{324}$ نسي القسمة على 4.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tariqa-aksiya" lead="نعكس القانون:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
