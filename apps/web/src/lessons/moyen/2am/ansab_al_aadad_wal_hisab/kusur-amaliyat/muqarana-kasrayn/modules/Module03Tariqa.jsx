import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idée de method-5) : quatre pas. (1) un exemple résolu en quatre lignes (7/8 | 13/16 ; ranger 5/6, 7/12, 2/3, 3/4 ; 9/7 | 8/9 par 1 ; 4,2/5 | 8,1/10 à numérateur décimal) ;
 * (2) mettre sur même dénominateur : on le fait ; (3) ranger quatre fractions ; (4) passer par 1 et le numérateur décimal. La règle des quatre cas est posée dans l'encadré de la طريقة. LP : P1, P3, P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أختار طريقة المقارنة؟', 'كيف أرتّب عدّة كسور؟', 'متى أمرّ بالعدد $1$ ؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقارن وأرتّب"
      moduleSubtitle="توحيد المقامات، وترتيب كسور، والعدد واحد، وبسط عشري"
      estimatedTime="10 دقائق"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'قبل المقارنة: أيّ حالة هذه؟',
        body: <p>{M(METHOD.rule)}</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <TapQuestion prompt={<MathText>{'نقارن $\\frac{7}{8}$ و $\\frac{13}{16}$ . بأيّ مقام نكتب الكسرين؟'}</MathText>}
                  options={[M('$16$'), M('$8$'), M('$24$')]} correct={0} cols={3} requires={['tawhid-li-muqarana']}
                  explain={<MathText>{'$16$ مضاعف لـ $8$ ، فنكتب $\\frac{7}{8}=\\frac{14}{16}$ ونحتفظ بـ $\\frac{13}{16}$ كما هو. (المقام $8$ لا يصلح للكسر الثاني، و $24$ لا حاجة إليه.)'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="tariqa-tawhid" />}
            </div>
          ) },
        { num: 2, title: 'نرتّب أربعة كسور', subtitle: '$\\frac{5}{6}$ ، $\\frac{7}{12}$ ، $\\frac{2}{3}$ ، $\\frac{3}{4}$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'رتّب تصاعديًا: $\\frac{5}{6}$ ، $\\frac{7}{12}$ ، $\\frac{2}{3}$ ، $\\frac{3}{4}$ .'}</MathText>}
                options={[M('$\\frac{7}{12}<\\frac{2}{3}<\\frac{3}{4}<\\frac{5}{6}$'), M('$\\frac{5}{6}<\\frac{3}{4}<\\frac{2}{3}<\\frac{7}{12}$'), M('$\\frac{2}{3}<\\frac{3}{4}<\\frac{5}{6}<\\frac{7}{12}$')]}
                correct={0} cols={1} requires={['tawhid-li-muqarana']}
                explain={<MathText>{'بالاثني عشريات: $\\frac{10}{12}$ ، $\\frac{7}{12}$ ، $\\frac{8}{12}$ ، $\\frac{9}{12}$ ، فنرتّب البسوط $7<8<9<10$ . (الثاني هو الترتيب التنازلي، والثالث يضع $\\frac{7}{12}$ في آخر القائمة وهو الأصغر.)'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && <KnowledgeBrick id="tartib-kusur" />}
            </div>
          ) },
        { num: 3, title: 'العدد 1 والبسط العشري', subtitle: '$\\frac{9}{7}$ و $\\frac{8}{9}$ ، $\\frac{4{,}2}{5}$ و $\\frac{8{,}1}{10}$', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'قارن $\\frac{4{,}2}{5}$ و $\\frac{8{,}1}{10}$ . كيف نكتب $\\frac{4{,}2}{5}$ بمقام $10$ ؟'}</MathText>}
                options={[M('$\\frac{8{,}4}{10}$'), M('$\\frac{4{,}2}{10}$'), M('$\\frac{42}{10}$')]}
                correct={0} cols={3} requires={['tariqa-tawhid']}
                explain={<MathText>{'نضرب الحدّين في $2$ : $\\frac{4{,}2\\times 2}{5\\times 2}=\\frac{8{,}4}{10}$ ، و $8{,}4>8{,}1$ إذن $\\frac{4{,}2}{5}>\\frac{8{,}1}{10}$ . (حذف الفاصلة أو ترك البسط كما هو يغيّر قيمة الكسر.)'}</MathText>}
                onAnswered={() => setQ3(true)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
