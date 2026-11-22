import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD } from '../content/textbook';

/**
 * Module 3 — طرائق (stage: formalization). Le manuel n'a pas de طريقة pour ce sujet : la méthode est une
 * formulation de la PLATEFORME, déclarée (`addition('knowledge_formalization')`), dans le vocabulaire du
 * manuel, sur deux forfaits Internet (600 + 50x contre 200x → 4 Go, 800DA) :
 *   1. la solution ligne à ligne (MethodSteps) ;
 *   2. la brique « khutuwat-mufadala » : à quelle étape appartient chaque ligne ;
 *   3. la méthode appliquée à une carte de cinéma (1000 + 300x contre 500x → 5 films), jusqu'à la réponse
 *      en phrase. LP : P1, P2.
 */
/** La solution SANS sa boîte « rule » : la règle de la méthode est posée par la brique « khutuwat-mufadala »
 *  juste après (« أتوقّع القاعدة » : l'élève l'écrit d'abord ; la boîte l'aurait dite avant). */
const METHOD_LINES = { ...METHOD, rule: undefined };

const STEPS = ['نختار المتغير', 'نعبّر عن كل تكلفة', 'نحلّ ونقارن', 'نجيب في سياق الوضعية'];

export default function Module03Tarayiq() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — ترييض والمفاضلة بين صيغتين"
      moduleSubtitle="خمس خطوات على باقتي أنترنت"
      estimatedTime="8 دقائق"
      objectives={[
        'إلى أيّ خطوة ينتمي كل سطر من الحلّ؟',
        'كيف نطبّق الطريقة على بطاقة السينما؟',
        'كيف نكتب الجواب في سياق الوضعية؟',
      ]}
      brief={{
        tag: 'طرائق — من المنصّة', headline: 'باقة الأنترنت المناسبة', emoji: '📱',
        title: METHOD.title, tone: 'emerald',
        body: <p>في المحورين السابقين بنيتَ التكلفة بيدك ووجدت نقطة التقاطع ولوّنت الصيغة الأرخص. هذه الخطوات نفسها مكتوبة كطريقة، تصلح لكل مفاضلة بين صيغتين.</p>,
        footer: <SourceTag source={METHOD.source} />,
      }}
      steps={[
        {
          num: 1, title: 'الحلّ سطرًا سطرًا', subtitle: 'اقرأ السطر، وحاول توقّع التالي قبل أن تكشفه', done: !!done.read,
          content: <MethodSteps method={METHOD_LINES} onAllRevealed={mark('read')} />,
        },
        {
          num: 2, title: 'خطوات الطريقة', done: !!done.order,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">إلى أيّ خطوة ينتمي كل سطر؟</p>}
                rows={[
                  { id: 'fx', label: <MathText>{'$f(x) = 50x + 600$ و $g(x) = 200x$'}</MathText>, options: STEPS, correct: 1, correction: 'نعبّر عن تكلفة كل باقة بدالة تآلفية.' },
                  { id: 'x', label: <MathText>{'$x$ عدد الجيغا المستهلكة في الشهر'}</MathText>, options: STEPS, correct: 0, correction: 'نسمّي المتغير ونقول بالكلمات ماذا يمثّل.' },
                  { id: 'ans', label: 'أقل من 4Go: الباقة B ، أكثر من 4Go: الباقة A', options: STEPS, correct: 3, correction: 'نكتب الاختيار بجملة وبوحدته.' },
                  { id: 'solve', label: <MathText>{'$600 < 150x$ ومنه $x > 4$'}</MathText>, options: STEPS, correct: 2, correction: 'نحلّ المتراجحة التي تقارن التكلفتين.' },
                ]}
                requires={['namdhaja-taalufiya', 'tasawi-taqatu']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'تمامًا: متغير، دالتان، حلّ، ثم جواب في سياق الوضعية.' : 'أعد قراءة الأسطر 1) إلى 5) في الحلّ.'}
                  </Feedback>
                )}
                onAnswered={mark('order')}
              />
              {done.order && <KnowledgeBrick id="khutuwat-mufadala" lead="الأسطر الخمسة هي خطوات كل مفاضلة بين صيغتين:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'طبّق الطريقة', subtitle: 'بطاقة السينما', done: !!done.cine1 && !!done.cine2,
          content: (
            <div className="space-y-3">
              {done.order && <KnowledgeBrick id="khutuwat-mufadala" variant="rappel" compact />}
              <p className="rounded-xl bg-white px-3 py-2 text-sm text-slate-800">
                <MathText>{'في قاعة سينما تعرض أفلامًا وثائقية عن تاريخ الوطن: ببطاقة سنوية ثمنها 1000DA تدفع 300DA للفيلم، ودون بطاقة تدفع 500DA للفيلم. نسمّي $x$ عدد الأفلام في السنة.'}</MathText>
              </p>
              <NumericQuestion
                prompt="من أجل كم فيلم تتساوى الصيغتان؟"
                expected={5}
                requires={['khutuwat-mufadala', 'tasawi-taqatu']}
                explain={<MathText>{'$300x + 1000 = 500x$ أي $1000 = 200x$ ومنه $x = 5$ ، والمبلغ $2500$ DA بالصيغتين.'}</MathText>}
                onAnswered={mark('cine1')}
              />
              <TapQuestion
                prompt="سلمى تشاهد 8 أفلام في السنة. ما الجواب في سياق الوضعية؟"
                options={[
                  'تشتري البطاقة: تدفع 3400DA بدل 4000DA',
                  'لا تشتري البطاقة: تدفع 4000DA بدل 3400DA',
                  'الصيغتان متساويتان دائمًا',
                  'لا يمكن المقارنة دون رسم التمثيل البياني',
                ]}
                correct={0}
                cols={1}
                requires={['khutuwat-mufadala', 'sigha-afdal']}
                explain={<MathText>{'$300 \\times 8 + 1000 = 3400$ و $500 \\times 8 = 4000$ : لأن $8 > 5$ فالبطاقة أرخص. نكتب الجواب بجملة وبالدينار، ويكفي الحساب دون رسم.'}</MathText>}
                onAnswered={mark('cine2')}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
