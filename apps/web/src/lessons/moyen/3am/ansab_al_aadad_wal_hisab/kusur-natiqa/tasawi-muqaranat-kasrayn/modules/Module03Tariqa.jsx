import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater). Le manuel dit « يمكن استعمال عدة طرق » (p. 27) : ce module pose les CINQ méthodes, chacune avec SA question
 * (« quelle méthode ? ») puis son exemple révélé ligne à ligne, et se termine par le CHOIX : trois paires, trois méthodes. La méthode et la brique viennent APRÈS la réponse. LP : P3. Le test
 * des chiffres des unités est un outil de plus (pas une الكفاءة) : il n'est jamais dans le إختبار أولي.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [r, setR] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setR((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['أيّ طريقة تُثبت تساوي كسرين؟', 'متى يكفي رقم الآحاد؟', 'متى أقارن بالعدد 1؟', 'متى أوحّد المقامين؟', 'متى أستعمل نفس البسط؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — اختيار الطريقة"
      moduleSubtitle="لكلّ زوج من الكسور طريقته"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'هل الكسران متساويان؟', subtitle: 'الجداءان المتصالبان', done: !!q.a && !!r.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ما أسرع طريقة تُثبت أنّ $\\frac{156}{84}=\\frac{13}{7}$ ؟'}</MathText>}
                options={[M('الجداءان المتصالبان: $156\\times7$ و $84\\times13$'), M('مقارنة البسطين فقط'), M('المقارنة بالعدد $1$')]}
                correct={0} cols={1} requires={['jidaa-property']}
                explain={<MathText>{'نريد إثبات التساوي، والجداءان المتصالبان يفعلان ذلك مباشرة: $156\\times7=1092=84\\times13$ .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.cross} onAllRevealed={revealed('a')} />}
            </div>
          ),
        },
        {
          num: 2, title: 'أعداد كبيرة', subtitle: 'رقم الآحاد', done: !!q.b && !!r.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'هل $\\frac{3217}{5419}=\\frac{4826}{8133}$ ؟ ما أقصر طريقة لإثبات أنّهما غير متساويين؟'}</MathText>}
                options={[M('رقما آحاد الجداءين المتصالبين: $1$ و $4$ مختلفان'), M('حساب الجداءين كاملين فقط'), M('كتابتهما بمقام مشترك')]}
                correct={0} cols={1} requires={['jidaa-property']}
                explain={<MathText>{'رقم آحاد $3217\\times8133$ هو $1$ ورقم آحاد $5419\\times4826$ هو $4$ : مختلفان، فالجداءان مختلفان.'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <MethodSteps method={METHOD.digits} onAllRevealed={revealed('b')} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كسر أكبر من 1 وكسر أصغر منه', subtitle: 'العدد 1 وسيط', done: !!q.c && !!r.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{125}{97}$ و $\\frac{61}{340}$ دون مقام مشترك:'}</MathText>}
                options={[M('$\\frac{125}{97}>1$ و $\\frac{61}{340}<1$ ، إذن $\\frac{125}{97}>\\frac{61}{340}$'), M('$\\frac{125}{97}<\\frac{61}{340}$ لأنّ $125<340$'), M('متساويان')]}
                correct={0} cols={1} requires={['muqarana-kasrayn-2am']}
                explain={<MathText>{'$125>97$ فالأول أكبر من $1$ ، و $61<340$ فالثاني أصغر من $1$ . (الخيار الثاني قارن البسط بالمقام الآخر.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.one} onAllRevealed={revealed('c')} />}
            </div>
          ),
        },
        {
          num: 4, title: 'مقامان مختلفان', subtitle: 'مضاعف مشترك', done: !!q.d && !!r.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{11}{6}$ و $\\frac{9}{4}$ بالمقام $12$ :'}</MathText>}
                options={[M('$\\frac{22}{12}<\\frac{27}{12}$ ، إذن $\\frac{11}{6}<\\frac{9}{4}$'), M('$\\frac{22}{12}>\\frac{27}{12}$ ، إذن $\\frac{11}{6}>\\frac{9}{4}$'), M('$\\frac{11}{12}<\\frac{9}{12}$ ، إذن $\\frac{11}{6}<\\frac{9}{4}$')]}
                correct={0} cols={1} requires={['qaida-tawhid']}
                explain={<MathText>{'$\\frac{11}{6}=\\frac{22}{12}$ و $\\frac{9}{4}=\\frac{27}{12}$ ، و $22<27$ .'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <MethodSteps method={METHOD.multiple} onAllRevealed={revealed('d')} />}
            </div>
          ),
        },
        {
          num: 5, title: 'نفس البسط', subtitle: 'المقام الأصغر', done: !!q.e && !!r.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{13}{20}$ و $\\frac{13}{21}$ :'}</MathText>}
                options={[M('$\\frac{13}{20}>\\frac{13}{21}$'), M('$\\frac{13}{20}<\\frac{13}{21}$'), M('$\\frac{13}{20}=\\frac{13}{21}$')]}
                correct={0} cols={3} requires={['muqarana-kasrayn-2am']}
                explain={<MathText>{'البسطان متساويان، والمقام الأصغر $20$ يعطي أجزاءً أكبر.'}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && <MethodSteps method={METHOD.numerator} onAllRevealed={revealed('e')} />}
            </div>
          ),
        },
        {
          num: 6, title: 'متى أختار ماذا؟', subtitle: 'ثلاثة أزواج', done: !!q.f,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<MathText>{'لكلّ زوج اختر الطريقة الأسرع:'}</MathText>}
                rows={[
                  { id: 'r1', label: <MathText>{'$\\frac{47}{23}$ و $\\frac{47}{25}$'}</MathText>, options: ['نفس البسط', 'المقارنة بالعدد $1$', 'مقام مشترك'], correct: 0, correction: <MathText>{'البسطان متساويان: يكفي مقارنة المقامين.'}</MathText> },
                  { id: 'r2', label: <MathText>{'$\\frac{210}{199}$ و $\\frac{99}{100}$'}</MathText>, options: ['نفس البسط', 'المقارنة بالعدد $1$', 'مقام مشترك'], correct: 1, correction: <MathText>{'الأول أكبر من $1$ والثاني أصغر منه.'}</MathText> },
                  { id: 'r3', label: <MathText>{'$\\frac{5}{12}$ و $\\frac{7}{18}$'}</MathText>, options: ['نفس البسط', 'المقارنة بالعدد $1$', 'مقام مشترك'], correct: 2, correction: <MathText>{'كلاهما أصغر من $1$ والبسطان مختلفان: نكتبهما بالمقام $36$ .'}</MathText> },
                ]}
                feedback={({ allRight }) => (allRight ? 'أحسنت: ننظر أولًا إلى الكسرين، ثمّ نختار أقصر طريق.' : 'راجع: ابدأ بسؤالين: هل البسطان متساويان؟ وهل يفصل بينهما العدد $1$ ؟')}
                onAnswered={answered('f')}
                requires={['muqarana-kasrayn-2am']}
              />
              {q.f && <KnowledgeBrick id="ikhtiyar-tariqa" lead="لكلّ زوج من الكسور طريقته: بماذا نبدأ؟" />}
              {q.f && <TextbookBox kind="method" compact lines={[METHOD.choose.rule]} source={METHOD.choose.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
