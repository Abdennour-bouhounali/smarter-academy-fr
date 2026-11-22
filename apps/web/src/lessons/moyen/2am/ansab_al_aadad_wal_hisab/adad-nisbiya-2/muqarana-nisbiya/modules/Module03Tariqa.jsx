import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : ranger six nombres de signes mêlés (طرائق
 * p. 43, réécrit), comparer deux décimaux négatifs, ranger dans l'ordre décroissant (دوري الآن ①, réécrit), trouver un nombre entre
 * deux nombres. La méthode et la brique viennent APRÈS la réponse. LP : P1, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState(false);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أرتّب أعدادًا بإشارات مختلفة؟', 'كيف أقارن عددين عشريين سالبين؟', 'كيف أجد عددًا بين عددين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقارن وأرتّب"
      moduleSubtitle="الإشارة أوّلًا، ثم المسافة إلى الصفر"
      estimatedTime="10 دقائق"
      steps={[
        {
          num: 1, title: 'كيف نرتّب ستّة أعداد بإشارات مختلفة؟', subtitle: 'ترتيب تصاعدي', done: !!q.a && read,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'رتّب تصاعديًا: $0{,}6$ ؛ $-2{,}3$ ؛ $1{,}5$ ؛ $-0{,}9$ ؛ $-2{,}03$ ؛ $0$ .'}</MathText>}
                options={[
                  M('$-2{,}3 < -2{,}03 < -0{,}9 < 0 < 0{,}6 < 1{,}5$'),
                  M('$-0{,}9 < -2{,}03 < -2{,}3 < 0 < 0{,}6 < 1{,}5$'),
                  M('$0 < 0{,}6 < 1{,}5 < -0{,}9 < -2{,}03 < -2{,}3$'),
                ]}
                correct={0} cols={1} requires={['hasr']}
                explain={<MathText>{'السالبة أوّلًا، مرتّبة من الأبعد عن الصفر إلى الأقرب: $2{,}30 > 2{,}03 > 0{,}90$ ، ثم الصفر، ثم الموجبة من الأقرب إلى الصفر.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.order} onAllRevealed={() => setRead(true)} />}
              {q.a && <KnowledgeBrick id="tariqa" lead="أرتّب أعدادًا بإشارات مختلفة: من أيّ شيء أبدأ؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أيّ العددين أصغر؟', subtitle: 'سالبان بأرقام بعد الفاصلة', done: !!q.b,
          content: (
            <TapQuestion
              prompt={<MathText>{'أيّ العددين أصغر: $-7{,}25$ أم $-7{,}3$ ؟'}</MathText>}
              options={[M('$-7{,}3$'), M('$-7{,}25$'), M('هما متساويان')]}
              correct={0} cols={3} requires={['salibayn']}
              explain={<MathText>{'$7{,}3 = 7{,}30 > 7{,}25$ : $-7{,}3$ أبعد عن الصفر فهو الأصغر، $-7{,}3 < -7{,}25$ .'}</MathText>}
              onAnswered={answered('b')}
            />
          ),
        },
        {
          num: 3, title: 'كيف أرتّب تنازليًا؟', subtitle: 'الأكبر أوّلًا', done: !!q.c,
          content: (
            <TapQuestion
              prompt={<MathText>{'رتّب تنازليًا: $4{,}2$ ؛ $-4{,}25$ ؛ $0$ ؛ $-4{,}2$ ؛ $4{,}02$ .'}</MathText>}
              options={[
                M('$4{,}2 > 4{,}02 > 0 > -4{,}2 > -4{,}25$'),
                M('$4{,}2 > 4{,}02 > 0 > -4{,}25 > -4{,}2$'),
                M('$-4{,}25 > -4{,}2 > 0 > 4{,}02 > 4{,}2$'),
              ]}
              correct={0} cols={1} requires={['tartib']}
              explain={<MathText>{'الموجبان: $4{,}20 > 4{,}02$ ، ثم الصفر، ثم السالبان من الأقرب إلى الصفر: $-4{,}2 > -4{,}25$ .'}</MathText>}
              onAnswered={answered('c')}
            />
          ),
        },
        {
          num: 4, title: 'كيف أجد عددًا بين عددين؟', subtitle: 'عدد بين −2,6 و −2,5', done: !!q.d,
          content: (
            <TapQuestion
              prompt={<MathText>{'أيّ عدد يقع بين $-2{,}6$ و $-2{,}5$ ؟'}</MathText>}
              options={[M('$-2{,}55$'), M('$-2{,}65$'), M('$-2{,}45$')]}
              correct={0} cols={3} requires={['hasr']}
              explain={<MathText>{'نكتب الحدّين بمنزلتين عشريتين: $-2{,}60 < \\ldots < -2{,}50$ ، فيصلح $-2{,}55$ .'}</MathText>}
              onAnswered={answered('d')}
            />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
