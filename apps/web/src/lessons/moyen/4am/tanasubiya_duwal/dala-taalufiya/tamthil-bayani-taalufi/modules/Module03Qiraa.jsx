import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_AB, METHOD_READ, COMMON_ERRORS } from '../content/textbook';
import AffineFigure from '../components/AffineFigure';

/**
 * Module 3 — القراءة البيانية (stage `manipulation`) : les deux lectures du point d'apprentissage P2 et P3, chacune
 * d'abord à la main sur le lab, puis en méthode (plateforme, déclarée), puis sur d'autres nombres.
 *   1. lire b puis a sur (D) (méthode révélée ligne à ligne sur la figure (0 ; 2) → (2 ; −1)), brique qiraa-ab ;
 *      le piège « b sur l'axe des abscisses » (COMMON_ERRORS.bFasila) ;
 *   2. le lab en identify, posé seul : une droite cachée (3x − 2) à faire coïncider, puis a lu sur une marche de 2 ;
 *   3. le lab en lecture (la rampe −1/2 x + 3) : صورة 4 et العدد الذي صورته 4 ; brique qiraa-sura-taalufi.
 * LP : P2, P3.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Qiraa() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="القراءة البيانية"
      moduleSubtitle="نقرأ a و b ، ثم صورة عدد والعدد الذي علمت صورته"
      estimatedTime="9 دقائق"
      objectives={[
        'كيف نقرأ الترتيب عند المبدأ ومعامل التوجيه؟',
        'كيف نعرف عبارة الدالة من مستقيمها؟',
        'كيف نقرأ صورة عدد والعدد الذي صورته معلومة؟',
      ]}
      // LE LABO OUVRE LE MODULE (§4quater, rétrofit 2026-10-15) : la droite cachée (3x − 2) à faire coïncider, puis la formule ; la méthode
      // (figure, règle révélée, brique) vient APRÈS cette réponse, puis la transposition sur (L), puis le second labo (image / antécédent).
      intro={
        <Manipulation
          type="affine-line"
          a="3"
          b="-2"
          mode="identify"
          xMin="-2" xMax="3" yMin="-4" yMax="6"
          theme="ramp"
          levels={false}
        />
      }
      steps={[
        {
          num: 1, title: 'عبارة الدالة', subtitle: 'مستقيم عبارته مخفية', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'عبارة الدالة التي تمثيلها $(D)$ في المختبر هي:'}</MathText>}
                options={['$f(x) = 3x - 2$', '$f(x) = -2x + 3$', '$f(x) = 3x + 2$', '$f(x) = \\dfrac{1}{3}x - 2$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['muamil-tawjih']}
                explain={<MathText>{'$(D)$ يقطع محور التراتيب في $(0 ; -2)$ : $b = -2$ ؛ ومن هذه النقطة يصعد $3$ لكل وحدة إلى اليمين: $a = 3$ . أمّا $-2x + 3$ فتقلب المعاملين، و $3x + 2$ تنسى إشارة $b$ ، و $\\dfrac{1}{3}$ مقلوب الدرجة.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <AffineFigure testId="method-ab" win={{ xMin: -1, xMax: 3, yMin: -2, yMax: 3 }} height={200} width={200}
                    lines={[{ a: -1.5, b: 2, label: '(D)' }]} points={[{ x: 0, y: 2 }, { x: 2, y: -1 }]}
                    caption="الشكل: المستقيم $(D)$ يشمل النقطتين $(0 ; 2)$ و $(2 ; -1)$ ."
                    ariaLabel="مستقيم (D) ينزل ويشمل النقطتين (0 ; 2) و (2 ; −1)" />
                  {/* La طريقة révèle sa règle (encadré final) juste avant la brique : prédiction d'abord. */}
                  <PredictRule id="qiraa-ab"><MethodSteps method={METHOD_AB} /></PredictRule>
                  <KnowledgeBrick id="qiraa-ab" lead="ما فعلته على المختبر، طريقةً:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا نقرأ على مستقيم آخر؟', subtitle: 'طريقة', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <AffineFigure testId="q-b" win={{ xMin: -1, xMax: 5, yMin: -3, yMax: 1 }} height={180} width={260}
                lines={[{ a: 0.5, b: -2, label: '(L)' }]} points={[{ x: 0, y: -2 }, { x: 4, y: 0 }]}
                caption="الشكل: المستقيم $(L)$ يشمل النقطتين $(0 ; -2)$ و $(4 ; 0)$ ."
                ariaLabel="مستقيم (L) يصعد ويشمل النقطتين (0 ; −2) و (4 ; 0)" />
              <TapQuestion
                prompt={<MathText>{'الترتيب عند المبدأ للدالة التي تمثيلها $(L)$ هو:'}</MathText>}
                options={[COMMON_ERRORS.bFasila.right, COMMON_ERRORS.bFasila.wrong, '$b = 2$ : المسافة بين O ونقطة محور التراتيب.'].map(Opt)}
                correct={0}
                cols={1}
                requires={['tartib-mabda']}
                explain={<MathText>{`${COMMON_ERRORS.bFasila.why} أمّا $2$ فيُنسي الإشارة: النقطة تحت محور الفواصل.`}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              <TapQuestion
                prompt={<MathText>{'ومعامل توجيه $(L)$ هو:'}</MathText>}
                options={['$\\dfrac{1}{2}$', '$2$', '$-\\dfrac{1}{2}$', '$4$'].map(Opt)}
                correct={0}
                cols={4}
                requires={['muamil-tawjih']}
                explain={<MathText>{'من $(0 ; -2)$ إلى $(4 ; 0)$ : تقدّمنا $4$ وحدات فصعد المستقيم $2$ ، أي $\\dfrac{2}{4} = \\dfrac{1}{2}$ لكل وحدة. أمّا $2$ فهو $\\dfrac{4}{2}$ (قسمنا تغيّر الفاصلة على تغيّر الترتيب)، و $-\\dfrac{1}{2}$ لمستقيم ينزل، و $4$ فاصلة نقطة لا معامل.'}</MathText>}
                onAnswered={() => setQ1b(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'صورة عدد، والعدد الذي صورته معلومة', subtitle: 'طريقة', done: q3a && q3b,
          content: (
            <div className="space-y-3">
              <Manipulation
                type="affine-line"
                a={METHOD_READ.a}
                b={METHOD_READ.b}
                mode="read"
                reads={METHOD_READ.reads}
                xMin="-4" xMax="6" yMin="-1" yMax="5"
                theme="ramp"
                levels={false}
              />
              <NumericQuestion
                prompt={<MathText>{'على المستقيم نفسه، اقرأ صورة $2$ :'}</MathText>}
                expected={2}
                parse={parseDec}
                display="2"
                requires={['notation-fx']}
                explain={<MathText>{'من $2$ على محور الفواصل نصعد إلى المستقيم ثم نقرأ الترتيب: $2$ ، أي $f(2) = 2$ (وبالحساب: $-\\dfrac{1}{2} \\times 2 + 3 = 2$).'}</MathText>}
                onAnswered={() => setQ3a(true)}
              />
              <NumericQuestion
                prompt={<MathText>{'واقرأ العدد الذي صورته $5$ :'}</MathText>}
                expected={-4}
                parse={parseDec}
                display="-4"
                requires={['notation-fx']}
                explain={<MathText>{'من $5$ على محور التراتيب نذهب أفقيًا إلى المستقيم ثم نقرأ الفاصلة: $-4$ ، أي $f(-4) = 5$ — وليس $\\dfrac{1}{2}$ وهي صورة $5$ .'}</MathText>}
                onAnswered={() => setQ3b(true)}
              />
              {q3b && (
                <>
                  <PredictRule id="qiraa-sura-taalufi">
                    <div className="space-y-1 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm" data-method-read>
                      {METHOD_READ.rule.map((r) => <p key={r}><MathText>{r}</MathText></p>)}
                      <SourceTag source={METHOD_READ.source} />
                    </div>
                  </PredictRule>
                  <KnowledgeBrick id="qiraa-sura-taalufi" lead="ما فعلته بالمسبارين، طريقةً:" />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
