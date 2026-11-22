import { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (idées de method-4 et method-5) : trois pas. (1) un exemple résolu en quatre lignes (traduire l'achat de Salma et d'Anis — traduction seule, jamais testée ; un diviseur manquant ; un dividende et un facteur manquants ; deux opérations en
 * défaisant la DERNIÈRE d'abord) avec une question de calcul sur le diviseur manquant ; (2) « traduire une situation » ; (3) « vérifier un résultat par l'opération ». LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [read, setRead] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['كيف أترجم مشكلًا بمعادلة؟', 'كيف أتحقّق من الحلّ؟', 'كيف أحلّ معادلة من خطوتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أترجم وأحلّ وأتحقّق"
      moduleSubtitle="من الكلمات إلى المعادلة، وحلّها، والتحقّق منها"
      estimatedTime="12 دقيقة"
      brief={{ tone: 'sky', tag: 'طريقة', title: 'من المشكل إلى الحلّ',
        body: <p>رأينا كيف يجد خطّ العصير عددًا مجهولًا. للطريقة أربع خطوات: نسمّي المجهول بحرف، ونكتب المعادلة، ونجد العدد الناقص بالعملية العكسية، ثمّ نتحقّق.</p> }}
      steps={[
        { num: 1, title: 'أمثلة محلولة', subtitle: 'اكشف سطرًا سطرًا', done: read && q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={{ source: METHOD.source, exercise: METHOD.exercise, solution: METHOD.solution }} onAllRevealed={() => setRead(true)} />
              {read && (
                <NumericQuestion prompt={<MathText>{'حلّ $\\frac{36}{x}=4{,}5$ : $x=36\\div4{,}5=$'}</MathText>} expected={8}
                  explain={<MathText>{'$4{,}5\\times8=36$ ، فالقاسم الناقص $36\\div4{,}5=8$ .'}</MathText>}
                  onAnswered={() => setQ1(true)} />
              )}
              {q1 && <KnowledgeBrick id="tarjama-mushkil" />}
            </div>
          ) },
        { num: 2, title: 'ترجم الوضعية', subtitle: '$6\\times x=45$', done: q2,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'ستّة صناديق متماثلة كتلة كلّ منها $x$ كلغ وكتلتها الكلّية $45$ كلغ : أيّ معادلة تترجمها؟'}</MathText>}
                options={[M('$6\\times x=45$'), M('$6+x=45$'), M('$\\frac{x}{6}=45$')]}
                correct={0} cols={3}
                explain={<MathText>{'ستّة صناديق كتلة كلّ منها $x$ تزن $6\\times x$ ، وهي $45$ . ($6+x$ يجمع عدد الصناديق وكتلة واحد منها؛ و $\\frac x6=45$ يقلب الأدوار.)'}</MathText>}
                onAnswered={() => setQ2(true)} />
              {q2 && <KnowledgeBrick id="tahaqquq-hall" variant="rappel" compact />}
            </div>
          ) },
        { num: 3, title: 'تحقّق من الحلّ', subtitle: '$30\\div2{,}5$', done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'هل $2{,}5$ حلّ للمعادلة $\\frac{30}{x}=12$ ؟ نُنجز: $30\\div2{,}5=$'}</MathText>} expected={12}
                explain={<MathText>{'$30\\div2{,}5=12$ ، وهو العدد في الطرف الآخر: نعم، $2{,}5$ حلّ.'}</MathText>}
                onAnswered={() => setQ3(true)} />
            </div>
          ) },
        { num: 4, title: 'معادلة من خطوتين', subtitle: '$3x+15=60$', done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt={<MathText>{'حلّ $3x+15=60$ بإلغاء آخر عملية أوّلًا: $3x=45$ ثمّ $x=$'}</MathText>} expected={15}
                explain={<MathText>{'آخر عملية $+15$ فنطرحها: $60-15=45$ ، ثمّ نقسم على $3$ : $45\\div3=15$ . نتحقّق: $3\\times15+15=60$ .'}</MathText>}
                onAnswered={() => setQ4(true)} />
              {q4 && <KnowledgeBrick id="khatwatan-tariqa" />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
