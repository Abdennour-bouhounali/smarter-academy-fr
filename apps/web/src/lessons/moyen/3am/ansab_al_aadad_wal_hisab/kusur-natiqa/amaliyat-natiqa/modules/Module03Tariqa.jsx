import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Les trois طرائق du livre (p. 29, method-7, 8 et 9), aux nombres de la plateforme : une somme à numérateur
 * décimal (le plus petit multiple commun de 9 et 6), une différence où le plus petit multiple commun de 14 et 21 évite le produit 294, puis une chaîne où la division passe avant la soustraction.
 * Chaque exemple a SA question avant la solution révélée ligne à ligne ; la méthode et la brique viennent APRÈS la réponse. Le livre imprime une erreur pour `method-9` (23/33 au lieu de 15/11) :
 * elle n'est jamais montrée. LP : P1, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أجمع ناطقين بسطهما عشري؟', 'كيف أختار المقام المشترك؟', 'كيف أنظّم سلسلة حسابات؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — بسط عشري وسلسلة حسابات"
      moduleSubtitle="نوحّد المقام ثم ننظّم السلسلة"
      estimatedTime="12 دقيقة"
      steps={[
        {
          num: 1, title: 'بسط عشري', subtitle: '−4/9 + 1,5/6', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لحساب $-\\frac{4}{9}+\\frac{1{,}5}{6}$ نريد مقامًا مشتركًا. ما أصغر مضاعف مشترك غير معدوم للعددين $9$ و $6$ ؟'}</MathText>}
                options={[M('$18$'), M('$54$'), M('$15$')]}
                correct={0} cols={3} requires={['jam-tarh-kasrayn-3am']}
                explain={<MathText>{'مضاعفات $9$ : $9$ ، $18$ ، ... و $18$ يقبل القسمة على $6$ . ($54=9\\times6$ يصلح لكنّه أكبر، و $15$ ليس مضاعفًا لـ $9$ .)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.sumDec} onAllRevealed={revealed('a')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'أصغر مضاعف مشترك', subtitle: '−2,5/14 − 3,1/21', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لطرح $\\frac{3{,}1}{21}$ من $-\\frac{2{,}5}{14}$ ، أيّ مقام مشترك أصغر: $42$ أم $294=14\\times21$ ؟'}</MathText>}
                options={[M('$42$ : لأنّه مضاعف للعددين $14$ و $21$ وأصغر من $294$'), M('$294$ : لأنّه جداء المقامين'), M('$35$ : لأنّه مجموع المقامين')]}
                correct={0} cols={1} requires={['jam-tarh-kasrayn-3am']}
                explain={<MathText>{'$42=14\\times3=21\\times2$ . ($294$ يصلح أيضًا لكنّه أطول، و $35$ ليس مضاعفًا لـ $14$ .)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.diffDec} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'سلسلة حسابات', subtitle: '5/2 − 9/14 ÷ 3/7', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'في $E=\\frac{5}{2}-\\frac{9}{14}\\div\\frac{3}{7}$ ، أيّ عملية ننجزها أوّلًا؟'}</MathText>}
                options={[M('القسمة $\\frac{9}{14}\\div\\frac{3}{7}$'), M('الطرح $\\frac{5}{2}-\\frac{9}{14}$'), M('لا فرق بين الترتيبين')]}
                correct={0} cols={1} requires={['maqlub-qismat-kasrayn-3am']}
                explain={<MathText>{'القسمة تسبق الطرح. ولو بدأنا بالطرح لحصلنا على $\\frac{26}{14}\\div\\frac{3}{7}=\\frac{13}{3}$ وهو غير $E=1$ .'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.chain} onAllRevealed={revealed('c')} />}
              {q.c && r.a && r.b && r.c && <KnowledgeBrick id="tariqa-amaliyat" lead="كيف نحسب سلسلة بأعداد ناطقة؟" />}
              {q.c && r.a && r.b && r.c && <TextbookBox kind="method" compact lines={[METHOD.choose.rule]} source={METHOD.choose.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
