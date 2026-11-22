import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_K, METHOD_ROOTS, METHOD_IMAGE, KNOWLEDGE_SOURCE } from '../content/textbook';

/**
 * Module 3 — طرائق (DÉCLARÉES : la page du manuel manque). TOUCH THE MATH : trois méthodes révélées ligne à ligne
 * (MethodSteps), chacune suivie de sa brique et d'une question sur d'AUTRES nombres :
 *   1) k depuis deux longueurs (le مقام الشهيد imprimé par le club de la ثانوية) — brique tariqat-k ;
 *   2) k depuis un rapport d'aires (√) ou de volumes (le nombre dont le cube est le rapport) — brique tariqat-judhur ;
 *   3) les mesures de l'image sans recalcul (le خزّان مائي agrandi de 3/2) — brique tariqat-maqadir. LP : P1, P2.
 * « أتوقّع القاعدة » : chaque MethodSteps se termine sur l'encadré de SA règle, avant la brique ; elle est donc enveloppée
 * dans un PredictRule (id de sa brique) — l'élève écrit la méthode (predictPrompt, ancré sur les modules 1 et 2) avant de lire le
 * corrigé ; la brique qui suit n'est plus bloquée.
 * Rétrofit 2026-10-15 : la brique vient APRÈS la question qui exerce la méthode (plus avant elle) ; la question n'exige plus la brique.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      objectives={["كيف نجد النسبة $k$ من طولين؟", "كيف نجدها من نسبة مساحتين أو حجمين؟", "كيف نحسب مقادير المجسّم الناتج؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — إيجاد k وحساب المقادير"
      moduleSubtitle="قسمة طولين، جذر نسبة مساحتين، ثم الضرب في k و k² و k³"
      estimatedTime="8 دقائق"
      brief={{
        tag: 'طرائق من المنصّة', title: 'ثلاث طرائق', tone: 'emerald',
        body: <p>اقرأ كل حل سطرا بسطر: حاول السطر الموالي قبل أن تكشفه، ثم طبّق الطريقة على أعداد أخرى.</p>,
        footer: <SourceTag source={KNOWLEDGE_SOURCE} />,
      }}
      steps={[
        {
          num: 1, title: 'إيجاد k من طولين', subtitle: 'مجسّم مقام الشهيد', done: q1,
          content: (
            <div className="space-y-3">
              <PredictRule id="tariqat-k"><MethodSteps method={METHOD_K} /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'مكعّب حرفه $4\\,\\mathrm{cm}$ ، وتكبيره حرفه $10\\,\\mathrm{cm}$ . نسبة التكبير:'}</MathText>}
                options={[
                  '$k = \\dfrac{5}{2}$',
                  // le rapport renversé (MISC-TAKBIR-ITTIJAH)
                  '$k = \\dfrac{2}{5}$',
                  // la différence 10 − 4 (MISC-TAKBIR-JAM)
                  '$k = 6$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$k = \\dfrac{10}{4} = \\dfrac{5}{2} = 2{,}5$ ، و $k > 1$ : تكبير.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="tariqat-k" lead="الطريقة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'من نسبة المساحات أو الحجوم إلى k', subtitle: 'جذر تربيعي، ومكعّب', done: q2,
          content: (
            <div className="space-y-3">
              <PredictRule id="tariqat-judhur"><MethodSteps method={METHOD_ROOTS} /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'مساحة أوجه مجسّم تصغير ضُربت في $\\dfrac{4}{9}$ . نسبة التصغير:'}</MathText>}
                options={[
                  '$k = \\dfrac{2}{3}$',
                  // le rapport des aires pris pour k (MISC-TAKBIR-MISAHA-K)
                  '$k = \\dfrac{4}{9}$',
                  // le rapport divisé par 2
                  '$k = \\dfrac{2}{9}$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'$k^2 = \\dfrac{4}{9}$ ، إذن $k = \\sqrt{\\dfrac{4}{9}} = \\dfrac{2}{3}$ ، وتحقّق: $\\dfrac{2}{3} \\times \\dfrac{2}{3} = \\dfrac{4}{9}$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tariqat-judhur" lead="الطريقة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'مقادير المجسّم الناتج', subtitle: 'الخزّان المائي', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="tariqat-maqadir"><MethodSteps method={METHOD_IMAGE} /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'جرّة زيت زيتون سعتها $40\\,\\mathrm{L}$ ، وجرّة أخرى هي تكبير لها بالنسبة $\\dfrac{3}{2}$ . سعة الجرّة الكبيرة:'}</MathText>}
                options={[
                  '$135\\,\\mathrm{L}$',
                  // × 3/2 (MISC-TAKBIR-HAJM-K)
                  '$60\\,\\mathrm{L}$',
                  // × (3/2)² (MISC-TAKBIR-HAJM-K)
                  '$90\\,\\mathrm{L}$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{'السعة حجم: $\\left(\\dfrac{3}{2}\\right)^3 \\times 40 = \\dfrac{27}{8} \\times 40 = 135\\,\\mathrm{L}$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="tariqat-maqadir" lead="الطريقة:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
