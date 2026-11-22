import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_PLANE } from '../content/textbook';

/**
 * Module 3 — طريقة (le manuel donne la sienne p. 70 ; la plateforme écrit la sienne avec d'autres nombres : A(−4 ; 3), B(4 ; 0), C(0 ; −2) ; P2, P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le module 1,
 * posé SEUL en haut (`levels={false}`, la carte SANS carreaux : A(−4 ; 3) puis C(0 ; −4)) ; puis l'élève ESSAIE (où se pose A ?), lit la solution ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »),
 * puis deux transferts : un point d'un axe et le sens de l'ordre des nombres.
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
      objectives={['بماذا أبدأ لأعلّم نقطة في المستوي؟', 'ماذا أفعل لنقطة على أحد المحورين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أعلّم نقطًا"
      moduleSubtitle="الفاصلة أوّلًا ثمّ الترتيب"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="courtyard-drone" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: 'النقطتان A و C', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="recorded" data-tried={recorded ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${recorded ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {recorded ? 'صوّرتَ المكانين على الخريطة التي بلا مربّعات.' : 'قد المسيّرة إلى المكانين وسجّل الصورتين، ثمّ عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<MathText>{'نريد تعليم النقطة $A(-4\\,;\\,3)$ . بماذا نبدأ؟'}</MathText>}
                options={[M('بأربع وحدات على يسار المبدإ على الخط الأفقي'), M('بثلاث وحدات نحو الأعلى'), M('بأربع وحدات على يمين المبدإ')]}
                correct={0} cols={1} requires={['ihdathiyyan']}
                explain={<MathText>{'الفاصلة أوّلًا: $-4$ على الخط الأفقي، أي أربع وحدات على يسار المبدإ؛ ثمّ الترتيب $3$ نحو الأعلى.'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثمّ نقطة جديدة', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_PLANE} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-talim" lead="لتعليم نقطة في المستوي: بماذا بدأنا؟ وكيف علّمنا نقطة على الخط الأفقي؟ وماذا فعلنا على ورق بلا مربّعات؟" />}
              <TapQuestion
                prompt={<MathText>{'لتعليم النقطة $N(-2\\,;\\,5)$ على ورق بلا مربّعات نرسم موازيًا لمحور التراتيب يمرّ بالتدريجة:'}</MathText>}
                options={[M('$-2$ على محور الفواصل'), M('$5$ على محور الفواصل'), M('$5$ على محور التراتيب')]}
                correct={0} cols={1} requires={['tariqat-talim']}
                explain={<MathText>{'التدريجة $-2$ هي فاصلة $N$ وتقع على محور الفواصل؛ والموازي لمحور التراتيب المارّ بها يلاقي الموازي لمحور الفواصل المارّ بالتدريجة $5$ من محور التراتيب عند $N$ .'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'نقطة على محور', subtitle: 'الترتيب معدوم', done: q2,
          content: (
            <TapQuestion
              prompt={<MathText>{'لتعليم $B(4\\,;\\,0)$ نضع النقطة:'}</MathText>}
              options={[M('على محور الفواصل عند التدريجة $4$'), M('على محور التراتيب عند التدريجة $4$'), M('على المبدإ')]}
              correct={0} cols={1} requires={['tariqat-talim']}
              explain={<MathText>{'ترتيبها $0$ فلا نصعد ولا ننزل بعد العدّ أربع وحدات على الخط الأفقي: هي على محور الفواصل.'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
