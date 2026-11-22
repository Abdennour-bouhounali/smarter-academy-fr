import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_COMPARE } from '../content/textbook';

/**
 * Module 3 — طريقة 3 « مقارنة عددين عشريين وترتيب سلسلة » (P1, P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1,
 * posé SEUL en haut (`levels={false}`, une suite de six nombres à ranger sur le podium) ; puis l'élève ESSAIE (23,48 contre 23,5), lit la
 * solution ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »), puis deux transferts : ranger trois nombres de parties entières
 * voisines, et trouver le plus grand parmi quatre nombres qui commencent tous par 0,.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const orderDone = trials.some((e) => e.kind === 'order' && e.ok && e.event === 'check');
  return (
    <ContentModule
      objectives={['بماذا أبدأ عند المقارنة؟', 'كيف أرتّب سلسلة من الأعداد العشرية؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقارن وأرتّب"
      moduleSubtitle="23,48 و 23,5"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="ruler-compare" level="advanced" levels={false} world="jump" tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: '23,48 و 23,5', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="podium" data-tried={orderDone ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${orderDone ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {orderDone ? 'رتّبتَ القفزات الست على المنصّة.' : 'رتّب القفزات الست على المنصّة، ثم عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<span>قارن بين <bdi dir="ltr">23,48</bdi> و <bdi dir="ltr">23,5</bdi> :</span>}
                options={[M('$23{,}48<23{,}5$'), M('$23{,}48>23{,}5$'), M('$23{,}48=23{,}5$')]}
                correct={0} cols={1} requires={['taqarun-rutab']}
                explain={<MathText>{'الجزآن الصحيحان متساويان (23)؛ رقم الأعشار 4 أقل من 5: $23{,}48<23{,}5$ ، ونتأكّد بالإتمام: $23{,}5=23{,}50$ و $48<50$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثم ترتيب ثلاثة أعداد', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_COMPARE} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-muqarana" lead="23,48 و 23,5 ثم الأعداد الأربعة: بماذا بدأنا، وماذا فعلنا حين تساوى الجزآن الصحيحان؟" />}
              <TapQuestion
                prompt={<span>رتّب تصاعديًا: <bdi dir="ltr">31,2</bdi> ، <bdi dir="ltr">30,98</bdi> ، <bdi dir="ltr">31,02</bdi> .</span>}
                options={[M('$30{,}98<31{,}02<31{,}2$'), M('$31{,}02<31{,}2<30{,}98$'), M('$30{,}98<31{,}2<31{,}02$')]}
                correct={0} cols={1} requires={['tariqat-muqarana']}
                explain={<MathText>{'الأصغر جزؤه الصحيح 30. وللباقيين جزء صحيح واحد (31): أعشارهما 2 و 0، فـ $31{,}02<31{,}2$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'الأكبر بين أعداد تبدأ بالصفر', subtitle: '0,58 و 0,6 و 0,059 و 0,508', done: q2,
          content: (
            <TapQuestion
              prompt={<span>أيّ هذه الأعداد هو الأكبر: <bdi dir="ltr">0,58</bdi> ، <bdi dir="ltr">0,6</bdi> ، <bdi dir="ltr">0,059</bdi> ، <bdi dir="ltr">0,508</bdi> ؟</span>}
              options={[M('$0{,}6$'), M('$0{,}58$'), M('$0{,}508$')]}
              correct={0} cols={3} requires={['tariqat-muqarana']}
              explain={<MathText>{'الأجزاء الصحيحة كلها 0؛ الأعشار: 5 و 6 و 0 و 5. فالأكبر هو $0{,}6$ (= $0{,}600$)، ولو كان أقصرها كتابةً.'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
