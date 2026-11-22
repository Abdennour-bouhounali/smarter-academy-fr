import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { MethodSteps, SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_POINT, METHOD_SEGMENT, NOW_155 } from '../content/textbook';
import { FIG_METHOD_POINT, FIG_METHOD_SEG, FIG_METHOD_SEG_SOL, FIG_NOW } from '../content/figures';

/**
 * Module 3 — طرائق (p. 155) « إنشاء صور أشكال هندسية ».
 * TOUCH THE MATH : تمرين 1 (l'image d'un point par 50° direct) et تمرين 2 (l'image d'une قطعة par 40° indirect) révélés ligne
 * à ligne (MethodSteps), la question après la méthode ; puis les images de figures du نشاط 3 formalisées (brique suwar-ashkal), et le دوري الآن (doublon
 * déclaré du درس « خواص الدوران ») : l'image d'un angle se construit point par point. LP : P2, P3.
 * RÉTROFIT 2026-10-15 (§4quater) : la question d'abord ; la solution du manuel (MethodSteps sous PredictRule) et la brique APRÈS la réponse
 * (`{qN && …}`) ; `requires` = la brique précédente (surat-nuqta → tariqat-nuqta → tariqat-qitaa), jamais celle qui suit.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — إنشاء صور أشكال هندسية"
      moduleSubtitle="المنقلة للزاوية، والمدور للبعد"
      estimatedTime="8 دقائق"
      objectives={["كيف أنشئ صورة نقطة بدوران معلوم؟", "ما الذي يكفي لإنشاء صورة قطعة؟", "أيّ النقط أدوّر لأنشئ صورة زاوية؟"]}
      brief={{
        tag: 'طرائق — الكتاب ص 155', title: 'إنشاء صور أشكال هندسية', tone: 'emerald',
        body: <p>ثلاثة تمارين من الكتاب: تجيب أولًا عن سؤال كل تمرين، ثم تقرأ الحل سطرا بسطر.</p>,
        footer: <SourceTag source={METHOD_POINT.source} />,
      }}
      steps={[
        {
          num: 1, title: 'تمرين 1: صورة نقطة', subtitle: 'زاوية 50 درجة في الاتجاه المباشر', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD_POINT} />
              <TapQuestion
                prompt={<MathText>{'نصف المستقيم [Ox) حيث $\\widehat{AOx} = 50^\\circ$ في الاتجاه المباشر يُرسم:'}</MathText>}
                options={[
                  'انطلاقا من [OA)، عكس اتجاه عقارب الساعة',
                  // le sens indirect (MISC-DAWARAN-ITTIJAH)
                  'انطلاقا من [OA)، في اتجاه عقارب الساعة',
                  // la منقلة posée en A (MISC-DAWARAN-RAS-ZAWIYA)
                  'انطلاقا من A، والمنقلة على A',
                ]}
                correct={0}
                cols={1}
                requires={['surat-nuqta']}
                explain="مركز المنقلة على O وصفرها على [OA)، ونقرأ 50 درجة في الاتجاه المباشر (عكس عقارب الساعة)؛ ثم المدور يعطي A′ على [Ox) حيث OA′ = OA."
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  {/* La طريقة du livre ÉNONCE la méthode tariqat-nuqta : l'élève l'écrit d'abord (prompt dans knowledge.jsx) — APRÈS sa réponse. */}
                  <PredictRule id="tariqat-nuqta"><MethodSteps method={METHOD_POINT} /></PredictRule>
                  <KnowledgeBrick id="tariqat-nuqta" lead="الطريقة، ثلاث خطوات:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'تمرين 2: صورة قطعة', subtitle: 'زاوية 40 درجة في الاتجاه غير المباشر', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD_SEG} />
              <TapQuestion
                prompt="صورة القطعة [AB] بالدوران الذي مركزه O وزاويته 40 درجة في الاتجاه غير المباشر:"
                options={[
                  'القطعة [A′B′] حيث A′ و B′ صورتا A و B بهذا الدوران',
                  // la parallèle (MISC-DAWARAN-TAWAZI)
                  'القطعة الموازية لـ [AB] التي تبدأ من A′ ولها نفس الطول',
                  // un seul point tourné (MISC-DAWARAN-MARKAZ : B pris comme centre)
                  'القطعة [A′B] حيث A′ صورة A فقط',
                ]}
                correct={0}
                cols={1}
                requires={['tariqat-nuqta']}
                explain={<MathText>{METHOD_SEGMENT.rule}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  {/* Idem pour tariqat-qitaa : la solution et l'encadré « طريقة » la disent — après la réponse. */}
                  <PredictRule id="tariqat-qitaa"><MethodSteps method={METHOD_SEGMENT} /></PredictRule>
                  <KnowledgeBrick id="tariqat-qitaa" lead="يكفي طرفان:" />
                  <GeoFigure {...FIG_METHOD_SEG_SOL} />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'صور المستقيم ونصف المستقيم والدائرة', subtitle: 'ودوري الآن', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW_155.text} source={NOW_155.source} compact />
              <GeoFigure {...FIG_NOW} />
              <TapQuestion
                prompt="لإنشاء صورة الزاوية AOB بالدوران الذي مركزه K، ننشئ صور:"
                options={[
                  "النقط O و A و B، فالصورة هي الزاوية $\\widehat{A'O'B'}$",
                  // O pris pour le centre (MISC-DAWARAN-MARKAZ) : O n'est pas fixe, c'est K le centre
                  "النقطتين A و B فقط، فالصورة هي الزاوية $\\widehat{A'OB'}$",
                  // K tourné : le centre est sa propre image, il ne sert à rien de le « construire »
                  "النقط K و A و B، فالصورة هي الزاوية $\\widehat{A'K'B'}$",
                ].map(M)}
                correct={0}
                cols={1}
                requires={['tariqat-qitaa']}
                explain={<MathText>{`${NOW_155.answer} ${NOW_155.later}`}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="suwar-ashkal" lead="ما بنيته في نشاط 3، قاعدةً لكل شكل:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
