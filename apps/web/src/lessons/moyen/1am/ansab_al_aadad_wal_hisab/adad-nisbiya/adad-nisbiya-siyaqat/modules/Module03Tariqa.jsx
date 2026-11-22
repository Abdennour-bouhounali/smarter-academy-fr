import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_READ } from '../content/textbook';

/**
 * Module 3 — طريقة (ajout de la plateforme : le manuel n'en a pas pour cette leçon ; P2, P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1,
 * posé SEUL en haut (`levels={false}`, trois lectures : −3 · 4 · −1) ; puis l'élève ESSAIE (« 3 درجات تحت الصفر » s'écrit ?), lit la solution ligne à ligne, puis la
 * brique (gardée par « أتوقّع القاعدة »), puis deux transferts : la distance et l'opposé d'un nombre, et laquelle de deux lectures s'écrit sans signe.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const recorded = trials.filter((e) => e.kind === 'record' && e.ok).length >= 3;
  return (
    <ContentModule
      objectives={['بماذا أبدأ لأكتب قراءة بعدد نسبي؟', 'كيف أجد مسافته إلى الصفر ومعاكسه؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أقرأ وأكتب"
      moduleSubtitle="العدد النسبي، مسافته، معاكسه"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="frost-gauge" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: '3 درجات تحت الصفر', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="recorded" data-tried={recorded ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${recorded ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {recorded ? 'سجّلتَ القراءات الثلاث في أماكنها.' : 'سجّل القراءات الثلاث على الجهاز، ثمّ عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<span>قرأ المحرار 3 درجات تحت الصفر. العدد النسبي المناسب:</span>}
                options={[M('$-3$'), M('$3$'), M('$-0{,}3$')]}
                correct={0} cols={3} requires={['ishara-masafa']}
                explain={<MathText>{'تحت الصفر: عدد سالب تسبقه الإشارة − ، ومسافته إلى الصفر 3 درجات: $-3$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثمّ قراءة جديدة', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_READ} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="qiraat-adad-nisbi" lead="كتابة قراءة بعدد نسبي ثمّ مسافتها ومعاكسها: بماذا بدأنا؟ وماذا فعلنا حين نزل السائل تحت الصفر؟" />}
              <TapQuestion
                prompt={<span>قراءة محرار <bdi dir="ltr">−8</bdi> . مسافتها إلى الصفر ومعاكسها على التوالي:</span>}
                options={[M('$8$ ؛ $8$'), M('$-8$ ؛ $8$'), M('$8$ ؛ $-8$')]}
                correct={0} cols={3} requires={['qiraat-adad-nisbi']}
                explain={<MathText>{'المسافة إلى الصفر هي $8$ ، ومعاكس $-8$ له المسافة نفسها على الجهة الأخرى: $8$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'قراءة بلا إشارة', subtitle: 'فوق الصفر', done: q2,
          content: (
            <TapQuestion
              prompt={<span>أيّ القراءتين تُكتب بلا إشارة؟</span>}
              options={[M('6 درجات فوق الصفر'), M('6 درجات تحت الصفر'), M('القراءتان معًا')]}
              correct={0} cols={1} requires={['qiraat-adad-nisbi']}
              explain={<MathText>{'فوق الصفر عدد موجب يُكتب بلا إشارة: $6$ ؛ وتحت الصفر عدد سالب تسبقه الإشارة − : $-6$ .'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
