import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : placer R(−2,5 ; 3) par deux parallèles aux axes (method-2 du manuel, d'autres nombres),
 * lire un point d'un axe, trouver les symétriques par rapport aux axes. La méthode et la brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أضع نقطة بإحداثيين عشريين؟', 'كيف أقرأ إحداثيي نقطة على أحد المحورين؟', 'كيف أجد نظيرة نقطة بالنسبة إلى محور؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أضع نقطة وأجد نظيرتها"
      moduleSubtitle="موازيان ثم تقاطع"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'كيف أضع النقطة؟', subtitle: 'بأيّ موازٍ نبدأ؟', done: !!q.a && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نريد وضع النقطة $R(-2{,}5\\,;3)$ . نبدأ بموازٍ لمحور التراتيب يمرّ بالعدد $-2{,}5$ على محور الفواصل. ثم نرسم:'}</MathText>}
                options={[M('موازيًا لمحور الفواصل يمرّ بالعدد $3$ على محور التراتيب'), M('موازيًا لمحور التراتيب يمرّ بالعدد $3$'), M('قطرًا يمرّ بالمبدأ')]}
                correct={0} cols={1} requires={['ihdathiyan-nuqta']}
                explain={<MathText>{'تقاطع الموازيين هو $R$ ؛ ولو بدأنا بالموازي الآخر لوصلنا إلى النقطة نفسها.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.place} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqa-wad" lead="كيف نضع نقطة معلومة الإحداثيين؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف أقرأ نقطة على المحور؟', subtitle: 'النقطة $T$', done: !!q.b,
          content: (
            <TapQuestion
              prompt={<MathText>{'النقطة $T$ على محور التراتيب وتبعد عن المبدأ بوحدتين إلى الأسفل. ما إحداثياها؟'}</MathText>}
              options={[M('$(0\\,;-2)$'), M('$(-2\\,;0)$'), M('$(0\\,;2)$')]}
              correct={0} cols={3} requires={['mihwarayn']}
              explain={<MathText>{'$T$ على محور التراتيب فاصلتها $0$ ؛ وهي تحت المبدأ فترتيبها $-2$ : $T(0\\,;-2)$ .'}</MathText>}
              onAnswered={answered('b')}
            />
          ),
        },
        {
          num: 3, title: 'كيف أجد النظيرة؟', subtitle: 'بالنسبة إلى المحورين', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'نظيرة $R(-2{,}5\\,;3)$ بالنسبة إلى محور الفواصل، ثم بالنسبة إلى محور التراتيب:'}</MathText>}
              options={[M('$(-2{,}5\\,;-3)$ ثم $(2{,}5\\,;3)$'), M('$(2{,}5\\,;3)$ ثم $(-2{,}5\\,;-3)$'), M('$(2{,}5\\,;-3)$ في الحالتين')]}
              correct={0} cols={1} requires={['nadhira-mihwar']}
              explain={<MathText>{'بالنسبة إلى محور الفواصل نحتفظ بالفاصلة ونعاكس الترتيب ؛ وبالنسبة إلى محور التراتيب نحتفظ بالترتيب ونعاكس الفاصلة.'}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
