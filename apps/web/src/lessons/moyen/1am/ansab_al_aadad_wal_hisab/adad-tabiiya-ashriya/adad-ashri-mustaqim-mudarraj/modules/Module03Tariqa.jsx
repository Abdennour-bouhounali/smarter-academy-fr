import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_PLACE } from '../content/textbook';

/**
 * Module 3 — طريقة (ajout de la plateforme : le manuel n'en a pas ; P2, P3). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le
 * module 1, posé SEUL en haut (`levels={false}`, l'unité est donnée, trois drapeaux à planter : 2,7 · 1 + 3/10 · 3,5) ; puis l'élève ESSAIE
 * (la fenêtre lit 2,7), lit la solution ligne à ligne, puis la brique (gardée par « أتوقّع القاعدة »), puis deux transferts : lire une nouvelle
 * abscisse et encadrer un point entre deux graduations.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const planted = trials.some((e) => e.kind === 'plant' && e.ok && e.event === 'check');
  return (
    <ContentModule
      objectives={['بماذا أبدأ لتعليم نقطة؟', 'كيف أقرأ فاصلة نقطة وأحصرها؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أعلّم وأقرأ"
      moduleSubtitle="تعليم نقطة، قراءتها، وحصرها"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="jump-tape" level="beginner" levels={false} tasks={LAB.method} onTrial={record} />}
      steps={[
        { num: 1, title: 'جرّب قبل أن ترى الطريقة', subtitle: 'وحدتان وسبع تدريجات', done: q0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="planted" data-tried={planted ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${planted ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {planted ? 'غرستَ الأعلام الثلاثة في أماكنها.' : 'اغرس الأعلام الثلاثة على الشريط، ثم عُد إلى هذا السؤال.'}
              </p>
              <TapQuestion
                prompt={<span>تبعد نقطة عن <bdi dir="ltr">O</bdi> بوحدتين وسبع تدريجات صغيرة. فاصلتها:</span>}
                options={[M('$2{,}7$'), M('$7{,}2$'), M('$2{,}07$')]}
                correct={0} cols={3} requires={['faasila-nuqta']}
                explain={<MathText>{'وحدتان كاملتان ثم سبع تدريجات صغيرة، كلّ واحدة $0{,}1$ : $2+\\frac{7}{10}=2{,}7$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ) },
        { num: 2, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثم قراءة نقطة جديدة', done: q1,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_PLACE} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-taalim" lead="تعليم M وقراءة K وحصر L: بماذا بدأنا في كلّ مرّة، وماذا فعلنا حين وقعت النقطة بين تدريجتين؟" />}
              <TapQuestion
                prompt={<span>تقع نقطة بعد العلامة <bdi dir="ltr">5</bdi> بتسع تدريجات صغيرة. فاصلتها:</span>}
                options={[M('$5{,}9$'), M('$9{,}5$'), M('$5{,}09$')]}
                correct={0} cols={3} requires={['tariqat-taalim']}
                explain={<MathText>{'خمس وحدات كاملة ثم تسع تدريجات صغيرة: $5+\\frac{9}{10}=5{,}9$ ؛ وهي قبل العلامة 6 بتدريجة واحدة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ) },
        { num: 3, title: 'نقطة بين تدريجتين', subtitle: '8,3 و 8,4', done: q2,
          content: (
            <TapQuestion
              prompt={<span>تقع النقطة <bdi dir="ltr">P</bdi> بين التدريجتين <bdi dir="ltr">8,3</bdi> و <bdi dir="ltr">8,4</bdi> . كيف نصف فاصلتها؟</span>}
              options={[M('$8{,}3<P<8{,}4$'), M('$P=8{,}3$'), M('$P=8{,}4$')]}
              correct={0} cols={1} requires={['tariqat-taalim']}
              explain={<MathText>{'ليست على تدريجة فلا نقرأ فاصلة مضبوطة، بل نحصرها بين فاصلتي التدريجتين المجاورتين: $8{,}3<P<8{,}4$ .'}</MathText>}
              onAnswered={() => setQ2(true)}
            />
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
