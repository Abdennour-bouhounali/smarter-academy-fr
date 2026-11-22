import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import AffineFigure from '../components/AffineFigure';

/**
 * Module 4 — أوظّف تعلّماتي. Le manuel fourni n'a pas d'exercices pour cette unité : trois exercices de la
 * plateforme (déclarés `addition('interaction_generation')`), chacun sur une lecture de la leçon :
 *   1. la rampe du skatepark h(x) = 0,4x + 1,2 : b est la hauteur au pied, a ce qu'elle monte par mètre (P2) ;
 *   2. une droite (K) dessinée : sa formule, une image, un antécédent (P2, P3) ;
 *   3. deux points pour tracer x ⟼ −x + 3 (P1).
 * Les étapes se terminent sur la RÉPONSE, jamais sur la justesse.
 */
const PLATFORM = addition('interaction_generation');
const Opt = (s) => <MathText key={s}>{s}</MathText>;

export default function Module04Awazzif() {
  const [e1a, setE1a] = useState(false);
  const [e1b, setE1b] = useState(false);
  const [e2a, setE2a] = useState(false);
  const [e2b, setE2b] = useState(false);
  const [e2c, setE2c] = useState(false);
  const [e3, setE3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="نقرأ، نرسم، ونفسّر"
      estimatedTime="6 دقائق"
      objectives={[
        'أقرأ ارتفاع منحدر وميله',
        'أكتب عبارة دالة من مستقيمها',
        'أختار نقطتين لرسم مستقيم',
      ]}
      brief={{
        tag: 'تمارين من المنصّة', title: 'ثلاثة تمارين', tone: 'amber',
        body: <p>منحدر في حديقة التزلّج، مستقيم نقرأ عليه كل شيء، ودالة نختار نقطتين من تمثيلها.</p>,
      }}
      steps={[
        {
          num: 1, title: 'المنحدر', subtitle: 'تمرين 1', done: e1a && e1b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تمرين 1" source={PLATFORM} compact
                text="في حديقة التزلّج التي بنتها البلدية لسلامة الشباب، ارتفاع منحدر (بالمتر) على بعد $x$ متر من الجدار هو $h(x) = 0{,}4x + 1{,}2$ ، وتمثيله البياني جزء من مستقيم." />
              <NumericQuestion
                prompt={<MathText>{'ارتفاع المنحدر عند الجدار ($x = 0$) بالمتر، وهو الترتيب عند المبدأ:'}</MathText>}
                expected={1.2}
                parse={parseDec}
                display="1,2"
                requires={['tartib-mabda']}
                explain={<MathText>{'$h(0) = 0{,}4 \\times 0 + 1{,}2 = 1{,}2$ : المستقيم يقطع محور التراتيب في $(0 ; 1{,}2)$ .'}</MathText>}
                onAnswered={() => setE1a(true)}
              />
              <NumericQuestion
                prompt={<MathText>{'كم يرتفع المنحدر (بالمتر) كلما ابتعدنا مترًا واحدًا عن الجدار؟'}</MathText>}
                expected={0.4}
                parse={parseDec}
                display="0,4"
                requires={['muamil-tawjih']}
                explain={<MathText>{'معامل التوجيه $a = 0{,}4$ : لكل وحدة إلى اليمين يصعد المستقيم $0{,}4$ ، مثلا $h(1) - h(0) = 1{,}6 - 1{,}2 = 0{,}4$ .'}</MathText>}
                onAnswered={() => setE1b(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'المستقيم (K)', subtitle: 'تمرين 2', done: e2a && e2b && e2c,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تمرين 2" source={PLATFORM} compact
                text="المستقيم $(K)$ أدناه هو التمثيل البياني لدالة تآلفية $f$ ، ويشمل النقطتين $(0 ; 1)$ و $(1 ; 3)$ ." />
              <AffineFigure testId="ex-k" win={{ xMin: -3, xMax: 2, yMin: -5, yMax: 5 }} height={240} width={200}
                lines={[{ a: 2, b: 1, label: '(K)' }]} points={[{ x: 0, y: 1 }, { x: 1, y: 3 }]}
                caption="الشكل: المستقيم $(K)$ يشمل النقطتين $(0 ; 1)$ و $(1 ; 3)$ ."
                ariaLabel="مستقيم (K) يصعد ويشمل النقطتين (0 ; 1) و (1 ; 3)" />
              <TapQuestion
                prompt={<MathText>{'بقراءة بيانية، $f(x)$ يساوي:'}</MathText>}
                options={['$2x + 1$', '$x + 2$', '$2x - 1$', '$\\dfrac{1}{2}x + 1$'].map(Opt)}
                correct={0}
                cols={4}
                requires={['qiraa-ab']}
                explain={<MathText>{'$(K)$ يقطع محور التراتيب في $(0 ; 1)$ : $b = 1$ ؛ ومن $(0 ; 1)$ إلى $(1 ; 3)$ يصعد $2$ لوحدة واحدة: $a = 2$ . أمّا $x + 2$ فتقلب المعاملين، و $2x - 1$ تخطئ إشارة $b$ ، و $\\dfrac{1}{2}$ مقلوب الدرجة.'}</MathText>}
                onAnswered={() => setE2a(true)}
              />
              <NumericQuestion
                prompt={<MathText>{'اقرأ على $(K)$ صورة العدد $-2$ :'}</MathText>}
                expected={-3}
                parse={parseDec}
                display="-3"
                requires={['qiraa-sura-taalufi']}
                explain={<MathText>{'النقطة من $(K)$ التي فاصلتها $-2$ ترتيبها $-3$ : $f(-2) = 2 \\times (-2) + 1 = -3$ .'}</MathText>}
                onAnswered={() => setE2b(true)}
              />
              <NumericQuestion
                prompt={<MathText>{'واقرأ العدد الذي صورته $5$ :'}</MathText>}
                expected={2}
                parse={parseDec}
                display="2"
                requires={['qiraa-sura-taalufi']}
                explain={<MathText>{'النقطة من $(K)$ التي ترتيبها $5$ فاصلتها $2$ : $f(2) = 5$ . أمّا $11$ فهو صورة $5$ ، لا العدد الذي صورته $5$ .'}</MathText>}
                onAnswered={() => setE2c(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نقطتان', subtitle: 'تمرين 3', done: e3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="تمرين 3" source={PLATFORM} compact
                text="نريد رسم التمثيل البياني للدالة $g : x \longmapsto -x + 3$ في معلم متعامد ومتجانس." />
              <TapQuestion
                prompt={<MathText>{'نرسم المستقيم الذي يشمل النقطتين:'}</MathText>}
                options={['$(0 ; 3)$ و $(3 ; 0)$', '$(0 ; -3)$ و $(3 ; 0)$', 'O و $(1 ; -1)$', '$(0 ; 3)$ و $(1 ; 4)$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['rasm-taalufi']}
                explain={<MathText>{'$g(0) = 3$ و $g(3) = -3 + 3 = 0$ . أمّا $(0 ; -3)$ فتخطئ إشارة $b$ ، و O ليست من التمثيل لأنّ $g(0) \\neq 0$ ، و $(1 ; 4)$ تجعل المستقيم يصعد بينما $a = -1 < 0$ .'}</MathText>}
                onAnswered={() => setE3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
