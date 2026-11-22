import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_GRAD } from '../content/textbook';

/**
 * Module 3 — طريقة (le manuel donne la sienne ; la plateforme écrit la sienne avec d'autres nombres : M(−4) et N(1,6) ; P1, P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1,
 * posé SEUL en haut (`levels={false}`, deux maisons : −4 puis 1,6) ; puis l'élève ESSAIE (où se pose M(−4) ?), lit la solution ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »),
 * puis deux transferts : une abscisse entre deux ticks et une abscisse de valeur absolue inférieure à une unité.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const recorded = trials.filter((e) => e.kind === 'record' && e.ok).length >= 2;
  return (
    <ContentModule
      objectives={['بماذا أبدأ لأدرّج مستقيمًا؟', 'كيف أضع نقطة فاصلتها سالبة؟ وكيف أضع نقطة بين علامتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أدرّج وأعلّم"
      moduleSubtitle="المبدأ والاتجاه والوحدة، ثمّ النقطة"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="stride-stamp" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: 'النقطتان M و N', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="recorded" data-tried={recorded ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${recorded ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {recorded ? 'وضعتَ البيتين في موضعيهما.' : 'ضع البيتين في موضعيهما على الطريق، ثمّ عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<MathText>{'نريد تعليم النقطة $M(-4)$ . أين نضعها؟'}</MathText>}
                options={[M('على يسار المبدإ بأربع وحدات'), M('على يمين المبدإ بأربع وحدات'), M('على يسار المبدإ بوحدة واحدة')]}
                correct={0} cols={1} requires={['tadrij-jihatayn']}
                explain={<MathText>{'الإشارة − تعني الجهة المقابلة لاتجاه الأعداد الموجبة، والعدد $4$ يعطي عدد الوحدات من المبدإ.'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثمّ نقطة جديدة', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_GRAD} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tadrij-wa-talim" lead="لتدريج مستقيم وتعليم نقطتين: بماذا بدأنا؟ وماذا فعلنا حين كانت الفاصلة سالبة؟ وماذا فعلنا حين لم تقع النقطة على علامة؟" />}
              <TapQuestion
                prompt={<MathText>{'لتعليم النقطة $K(2{,}5)$ نضعها:'}</MathText>}
                options={[M('بين العلامتين $2$ و $3$'), M('بين العلامتين $-3$ و $-2$'), M('على العلامة $2$')]}
                correct={0} cols={1} requires={['tadrij-wa-talim']}
                explain={<MathText>{'الفاصلة موجبة فهي في جهة الاتجاه، وتقع بعد العلامة $2$ بنصف وحدة: $2<2{,}5<3$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'أقلّ من وحدة', subtitle: 'جهة الإشارة', done: q2,
          content: (
            <TapQuestion
              prompt={<MathText>{'نقطة فاصلتها $-0{,}6$ تقع:'}</MathText>}
              options={[M('على يسار المبدإ، على بعد أقلّ من وحدة'), M('على يمين المبدإ، على بعد أقلّ من وحدة'), M('على يسار العلامة $-1$')]}
              correct={0} cols={1} requires={['tadrij-wa-talim']}
              explain={<MathText>{'الإشارة − تضعها على يسار المبدإ، والبعد $0{,}6$ أقلّ من وحدة: $-1<-0{,}6<0$ ، فهي بين المبدإ والعلامة $-1$ .'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
