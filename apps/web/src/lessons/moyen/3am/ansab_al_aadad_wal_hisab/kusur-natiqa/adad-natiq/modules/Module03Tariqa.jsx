import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). La méthode du livre (p. 29) : on écrit les nombres avec un MÊME dénominateur POSITIF puis on compare les numérateurs
 * selon les règles des relatifs. Quatre exemples aux nombres de la plateforme, chacun avec SA question avant la solution révélée ligne à ligne : la forme modèle de 14/(−21) et de (−3,6)/(−8), la comparaison
 * de (−4,9)/6 et (−3,5)/4, le rangement et la place par sixièmes, un entier et une fraction. La méthode et la brique viennent APRÈS la réponse. LP : P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أكتب عددًا ناطقًا بمقام موجب؟', 'كيف أقارن عددين ناطقين؟', 'كيف أمثّل أعدادًا بالأسداس؟', 'كيف أكتب عددًا مجموع عدد طبيعي وكسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — مقام موجب مشترك"
      moduleSubtitle="نكتب ثمّ نقارن"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'مقام موجب', subtitle: '14/(−21) و (−3,6)/(−8)', done: !!q.a && !!r.a && !!q.a2 && !!r.a2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'نريد كتابة $\\frac{14}{-21}$ بمقام موجب. أين نضع الإشارة السالبة؟'}</MathText>}
                options={[M('أمام الكسر كلّه: $-\\frac{14}{21}$'), M('نحذفها: $\\frac{14}{21}$'), M('نقلب الكسر: $-\\frac{21}{14}$')]}
                correct={0} cols={1} requires={['maqam-mujab']}
                explain={<MathText>{'نقل الإشارة من المقام لا يغيّر العدد: $\\frac{14}{-21}=-\\frac{14}{21}=-\\frac{2}{3}$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.standard} onAllRevealed={revealed('a')} />}
              {q.a && r.a && (
                <TapQuestion
                  prompt={<MathText>{'في $\\frac{-3{,}6}{-8}$ إشارتان سالبتان: هل العدد موجب أم سالب؟'}</MathText>}
                  options={[M('موجب: $\\frac{3{,}6}{8}$'), M('سالب: $-\\frac{3{,}6}{8}$')]}
                  correct={0} cols={2} requires={['maqam-mujab']}
                  explain={<MathText>{'عددان سالبان: حاصل قسمتهما موجب.'}</MathText>}
                  onAnswered={answered('a2')}
                />
              )}
              {q.a2 && <MethodSteps method={METHOD.decimal} onAllRevealed={revealed('a2')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'مقارنة عددين', subtitle: '(−4,9)/6 و (−3,5)/4', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لمقارنة $\\frac{-4{,}9}{6}$ و $\\frac{-3{,}5}{4}$ نكتبهما بمقام موجب مشترك. أيّ مقام نختار؟'}</MathText>}
                options={[M('$12$ : مضاعف مشترك للمقامين $6$ و $4$'), M('$10$ : مجموع المقامين'), M('$24$ فقط، لأنّه الجداء')]}
                correct={0} cols={1} requires={['tartib-natiqa']}
                explain={<MathText>{'$12$ أصغر مضاعف مشترك للعددين $6$ و $4$ . ($24$ يصلح أيضًا لكنّه أطول، و $10$ ليس مضاعفًا لـ $4$ .)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.compare} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'التمثيل بالأسداس', subtitle: '−5/6 ، −3/2 ، 2/3 ، 7/6', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'على مستقيم مدرّج بالأسداس، أيّ هذه الأعداد أبعد عن الصفر نحو اليسار: $-\\frac{5}{6}$ ، $-\\frac{3}{2}$ ؟'}</MathText>}
                options={[M('$-\\frac{3}{2}=-\\frac{9}{6}$'), M('$-\\frac{5}{6}$'), M('هما على البعد نفسه')]}
                correct={0} cols={3} requires={['tartib-natiqa']}
                explain={<MathText>{'$\\frac{9}{6}>\\frac{5}{6}$ ، فـ $-\\frac{3}{2}$ أبعد عن الصفر، فهو الأصغر.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.place} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
        {
          num: 4, title: 'عدد طبيعي وكسر', subtitle: '17/5 و 41/9', done: !!q.d && !!r.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'أكبر عدد طبيعي أصغر من $\\frac{41}{9}$ هو'}</MathText>}
                options={[M('$4$'), M('$5$'), M('$41$')]}
                correct={0} cols={3} requires={['adad-natiq-shamil']}
                explain={<MathText>{'$4\\times9=36\\le41<45=5\\times9$ ، فـ $4\\le\\frac{41}{9}<5$ .'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <MethodSteps method={METHOD.integer} onAllRevealed={revealed('d')} />}
              {q.d && r.a && r.b && r.c && r.d && <KnowledgeBrick id="tariqa-muqarana" lead="كيف نقارن عددين ناطقين أو نمثّلهما على مستقيم؟" />}
              {q.d && r.a && r.b && r.c && r.d && <TextbookBox kind="method" compact lines={[METHOD.choose.rule]} source={METHOD.choose.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
