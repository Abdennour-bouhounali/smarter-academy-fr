import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طريقة (sans labo : le module s'ouvre sur sa PREMIÈRE question, §4quater) : réduire une chaîne de produits, de quotients et de puissances de puissances à UNE
 * puissance de 10 (طرائق p. 43, réécrite), puis calculer des produits et quotients de nombres k × 10ᵖ en regroupant les nombres d'un côté et les puissances de 10 de l'autre
 * (دوري الآن p. 43). Le résultat n'est PAS normalisé (30 × 10⁻³ reste tel quel : l'écriture scientifique est la leçon suivante). La méthode et la brique viennent APRÈS la
 * réponse. LP : P4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [q, setQ] = useState({});
  const [read, setRead] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const revealed = (k) => () => setRead((s) => ({ ...s, [k]: true }));
  return (
    <ContentModule
      objectives={['كيف أختصر عبارة إلى قوة واحدة؟', 'كيف أحسب جداء أعداد من الشكل $k \\times 10^p$ ؟', 'ماذا أفعل بحاصل القسمة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — قوة واحدة، وعدد × قوة"
      moduleSubtitle="اختصار العبارة · k × 10ᵖ"
      estimatedTime="11 دقيقة"
      steps={[
        {
          num: 1, title: 'كيف نكتب جداء ثلاث قوى على شكل قوة واحدة؟', subtitle: 'سلسلة جداءات', done: !!q.a && !!read.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$10^{-3} \\times 10^{7} \\times 10^{-2} = 10^{?}$'}</MathText>}
                options={[M('$10^{2}$'), M('$10^{12}$'), M('$10^{-42}$')]}
                correct={0} cols={3} requires={['qawaid-thalatha']}
                explain={<MathText>{'نجمع الأسس الثلاثة: $-3 + 7 + (-2) = 2$ . ($10^{12}$ يتجاهل الإشارتين السالبتين، و $10^{-42}$ يضرب الأسس.)'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <MethodSteps method={METHOD.chain} onAllRevealed={revealed('a')} />}
              {q.a && <KnowledgeBrick id="tabsit-ashara" lead="جداءات وقسمة وقوى قوى في عبارة واحدة: بأيّ ترتيب نختصرها إلى قوة واحدة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وفي قسمة بسطها وقاسمها جداءان؟', subtitle: 'اختصار البسط والمقام', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\frac{10^{6}}{10^{-2} \\times 10^{3}} = 10^{?}$'}</MathText>}
                options={[M('$10^{5}$'), M('$10^{1}$'), M('$10^{7}$')]}
                correct={0} cols={3} requires={['tabsit-ashara']}
                explain={<MathText>{'في المقام $10^{-2} \\times 10^{3} = 10^{1}$ ، ثم $\\frac{10^{6}}{10^{1}} = 10^{5}$ . ($10^{7}$ يجمع الأسّين $6 + 1$ ، و $10^{1}$ يتجاهل البسط.)'}</MathText>}
                onAnswered={answered('b')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'كيف نحسب جداء عددين من الشكل k × 10ᵖ ؟', subtitle: 'الأعداد مع الأعداد', done: !!q.c && !!read.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$3 \\times 10^{2} \\times 4 \\times 10^{5} = 12 \\times 10^{?}$'}</MathText>}
                options={[M('$10^{10}$'), M('$10^{3}$'), M('$10^{7}$')]}
                correct={2} cols={3} requires={['tabsit-ashara']}
                explain={<MathText>{'$3 \\times 4 = 12$ ثم $10^{2} \\times 10^{5} = 10^{7}$ : $12 \\times 10^{7}$ ، ونترك النتيجة هكذا.'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <MethodSteps method={METHOD.times} onAllRevealed={revealed('c')} />}
              {q.c && <KnowledgeBrick id="adad-fi-quwa" lead="الأعداد معًا وقوى العدد 10 معًا: وماذا نفعل بالقسمة؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وحاصل قسمة عددين من الشكل k × 10ᵖ ؟', subtitle: 'قسمة الأعداد وقسمة القوى', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'$\\frac{9 \\times 10^{-4}}{3 \\times 10^{2}} = 3 \\times 10^{?}$'}</MathText>}
                options={[M('$10^{-2}$'), M('$10^{-6}$'), M('$10^{6}$')]}
                correct={1} cols={3} requires={['adad-fi-quwa']}
                explain={<MathText>{'$\\frac{9}{3} = 3$ و $\\frac{10^{-4}}{10^{2}} = 10^{-4-2} = 10^{-6}$ : $3 \\times 10^{-6}$ . ($10^{6}$ ينسى أنّ الأسّ الأول سالب.)'}</MathText>}
                onAnswered={answered('d')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
