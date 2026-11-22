import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_APPLY } from '../content/textbook';

/**
 * Module 3 — طريقة (plateforme : le manuel n'en donne pas pour cette leçon ; P2–P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1, posé SEUL en haut (`levels={false}`, deux tâches :
 * « 4 × n + 15 » avec n = 9 ; la prétendue règle « 2a = a + 2 » qui tient pour a = 2) ; puis l'élève ESSAIE (la valeur de la règle), lit la solution ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »),
 * puis deux transferts : l'ordre des calculs et le contre-exemple.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const recorded = trials.filter((e) => e.kind === 'check' && e.ok).length >= 2;
  return (
    <ContentModule
      objectives={['ماذا أفعل أوّلًا لأطبّق قاعدة؟', 'بماذا أبدأ في الحساب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أطبّق قاعدة"
      moduleSubtitle="أكتب ، أضع القيم ، أحسب ، أجيب"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="letter-dial" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: 'ما قيمة القاعدة؟', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="recorded" data-tried={recorded ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${recorded ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {recorded ? 'أنجزتَ المهمّتين: القاعدة بقرص واحد ثمّ القاعدة المدَّعاة.' : 'أنجز المهمّتين على الجهاز، ثمّ عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<span>في مكتبة المدرسة ثمن n دفتر هو <bdi dir="ltr">4 × n + 15</bdi> . من أجل n = 9 يكون الثمن:</span>}
                options={[M('$51$'), M('$36$'), M('$64$')]}
                correct={0} cols={3} requires={['kull-mawdi']}
                explain={<MathText>{'$4\\times 9+15=36+15=51$ دج ؛ أمّا $36$ فينسى الجزء الثابت و $64$ يأتي من قراءة $4$ و $9$ عددًا واحدًا $49$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثمّ الأولويات', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_APPLY} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqa-tatbiq" lead="لتطبّق قاعدة: بماذا بدأتَ؟ وما الذي حسبتَه أوّلًا؟ وكيف عرفتَ أنّ الجواب جاء في آخر الحساب؟" />}
              <TapQuestion
                prompt={<span>في <bdi dir="ltr">3 × (x + 2) − y</bdi> من أجل x = 4 و y = 5 نحسب أوّلًا:</span>}
                options={[M('ما بين القوسين'), M('الضرب في 3'), M('الطرح')]}
                correct={0} cols={3} requires={['awlawiya-qaida']}
                explain={<MathText>{'القوسان أوّلًا: $4+2=6$ ثمّ الضرب $3\\times 6=18$ ثمّ الطرح $18-5=13$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'أختبر قولًا', subtitle: 'آخر خطوة : مثال مضادّ', done: q2,
          content: (
            <TapQuestion
              prompt={<span>قال زميل: « <bdi dir="ltr">2a = a + 2</bdi> دائمًا » لأنّها صحّت من أجل a = 2 . من أجل a = 3 :</span>}
              options={[M('$2\\times 3=6$ و $3+2=5$ : القول خاطئ'), M('$6=6$ : القول صحيح'), M('لا يمكن الحكم')]}
              correct={0} cols={1} requires={['mithal-mudad']}
              explain={<MathText>{'$6\\neq 5$ : هذا مثال مضادّ واحد، فالقاعدة ليست صحيحة دائمًا رغم أنّها صحّت من أجل $2$ .'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
