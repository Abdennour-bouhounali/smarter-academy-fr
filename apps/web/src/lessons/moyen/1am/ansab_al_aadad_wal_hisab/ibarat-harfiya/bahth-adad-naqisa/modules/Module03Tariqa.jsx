import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_FIND } from '../content/textbook';

/**
 * Module 3 — طريقة (le manuel la donne p. 82 : un schéma de calcul, l'opération inverse, la vérification, la réponse ; P1–P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1,
 * posé SEUL en haut (`levels={false}`, deux tâches : « ⁦+ 18,6⁩ » donne 45,1 ; « ⁦× 13⁩ » donne 41,6) ; puis l'élève ESSAIE (quelle égalité traduit la machine ?), lit la solution ligne à ligne, puis la brique
 * (gardée par « أتوقّع القاعدة »), puis deux transferts : la vérification par substitution et la dernière étape (répondre par une phrase).
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
      objectives={['كيف أترجم الوضعية بمساواة فيها □ ؟', 'ماذا أفعل لأُرجع الحساب ثمّ أتحقّق؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أجد وأتحقّق"
      moduleSubtitle="أترجم ، أُرجع ، أتحقّق ، أجيب"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="rewind-belt" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: 'ما المساواة؟', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="recorded" data-tried={recorded ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${recorded ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {recorded ? 'أرجعتَ الآلتين وتحقّقتَ من العددين.' : 'أرجِع حزام الآلتين على الجهاز وتحقّق، ثمّ عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<span>آلة بطاقتها « ⁦+ 18,6⁩ » أخرجت 45,1. المساواة التي تترجمها:</span>}
                options={[M('$\\square+18{,}6=45{,}1$'), M('$18{,}6-\\square=45{,}1$'), M('$18{,}6\\times\\square=45{,}1$')]}
                correct={0} cols={1} requires={['musawat-naqisa']}
                explain={<MathText>{'الآلة تضيف $18{,}6$ إلى العدد الداخل □ فيخرج $45{,}1$ : $\\square+18{,}6=45{,}1$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثمّ التحقّق', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_FIND} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqa-naqisa" lead="لتجد عددًا ناقصًا: بماذا بدأتَ؟ وبأيّ عملية أرجعتَ الحساب؟ وكيف تأكّدتَ من نتيجتك؟" />}
              <TapQuestion
                prompt={<span>نتحقّق من العدد <bdi dir="ltr">3,2</bdi> في <bdi dir="ltr">13 × □ = 41,6</bdi> بحساب:</span>}
                options={[M('$13\\times 3{,}2$ ونقارنه بـ $41{,}6$'), M('$41{,}6-13$ ونقارنه بـ $3{,}2$'), M('$41{,}6+3{,}2$ ونقارنه بـ $13$')]}
                correct={0} cols={1} requires={['tahaqquq']}
                explain={<MathText>{'نعوّض في الآلة الأصلية: $13\\times 3{,}2=41{,}6$ وهو الناتج المعلوم.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'الجواب بجملة', subtitle: 'آخر خطوة', done: q2,
          content: (
            <TapQuestion
              prompt={<span>بعد أن وجدنا الوزن الأوّل <bdi dir="ltr">26,5</bdi> وتحقّقنا منه، آخر خطوة هي:</span>}
              options={[M('أجيب بجملة: الوزن الأوّل 26,5 كغ'), M('أُعيد الحساب بعملية أخرى'), M('أكتب المساواة من جديد')]}
              correct={0} cols={1} requires={['tariqa-naqisa']}
              explain={<MathText>{'نترجم، نُرجع بالعملية العكسية، نتحقّق ثمّ نجيب بجملة فيها الوحدة: الوزن الأوّل $26{,}5$ كغ.'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
