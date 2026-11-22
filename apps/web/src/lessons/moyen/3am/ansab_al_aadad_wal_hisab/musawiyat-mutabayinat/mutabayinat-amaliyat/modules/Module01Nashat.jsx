import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : les « خيوط النول ». UNE SEULE PISTE (§4quater) : le labo
 * `loom-threads` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient UN nœud de la poutre basse. Les ÉTAPES interrogent ce
 * que l'élève a FAIT, avec SES essais (`onTrial`) : ce que devient l'ordre des fils quand il décale (P1), quand il étire par un positif (P2), par un négatif (P3),
 * et par zéro. Les noms (briques) viennent APRÈS la réponse. Le نشاط 2b du manuel (un tableau ac / bc) est posé en application au module 4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  // les questions posées PENDANT le labo (checkpoint-done) : la TRACE de l'étape ; si l'enseignant les coupe, les questions d'ici reprennent
  const [cp, setCp] = useState({});
  const record = (e) => { if (e.tk) { if (e.tk === 'checkpoint-done') setCp((c) => ({ ...c, [e.id]: true })); return; } setTrials((list) => [...list, e]); };
  const mine = trials.filter((e) => e.kind === 'tie' && !e.free && !e.band && e.stages === 1);
  const comb = mine.findLast((e) => e.tool === 'comb' && e.cNum !== 0);
  const pos = mine.findLast((e) => e.tool === 'nail' && e.cNum > 0 && e.cNum !== 1);
  const neg = mine.findLast((e) => e.tool === 'nail' && e.cNum < 0);
  const zero = mine.findLast((e) => e.tool === 'nail' && e.cNum === 0);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const symbols = ['$<$', '$>$', '$=$'].map(M);

  return (
    <ContentModule
      objectives={['ماذا يحدث لترتيب الخيطين حين أزيح الخيوط كلّها؟', 'وحين أمدّدها بعدد موجب؟', 'وحين أمدّدها بعدد سالب؟', 'وبالعدد 0؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — خيوط النول"
      moduleSubtitle="عملية على عددين مرتّبين"
      estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="loom-threads" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="loom-threads" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا يحدث حين نزيح الخيوط كلّها؟', subtitle: 'المشط', done: !!q.a && !!q.a2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="comb" ok={!!comb}
                done={<span>أزحتَ كل الخيوط بـ <Ltr>{comb?.c}</Ltr> فصار الأحمر عند <Ltr>{comb?.a2}</Ltr> والأزرق عند <Ltr>{comb?.b2}</Ltr> .</span>}
                todo="اختر المشط وأزح الخيوط في العارضة السفلى بعدد موجب ثم بعدد سالب، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="حين أزحتَ كل الخيوط بالعدد نفسه، موجبًا كان أو سالبًا، ماذا حدث لترتيب الخيطين؟"
                options={['بقي الأحمر على يسار الأزرق في كل مرّة', 'تبادلا مكانيهما حين كان العدد سالبًا', 'تبادلا مكانيهما حين كان العدد كبيرًا']}
                correct={0} cols={1} requires={['ikhtibar-musawat']}
                explain={<MathText>{'الإزاحة تحرّك العددين معًا بالمقدار نفسه، فيبقى الأصغر منهما على يسار الأكبر.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && (
                <TapQuestion
                  prompt={M('كان $1<3$ ثم أزحنا الخيطين بـ $-7$ . أكمل: $-6\\ \\square\\ -4$')}
                  options={symbols} correct={0} cols={3} requires={['ikhtibar-musawat']}
                  explain={<MathText>{'$1-7=-6$ و $3-7=-4$ ، و $-6<-4$ : الاتجاه نفسه.'}</MathText>}
                  onAnswered={answered('a2')}
                />
              )}
              {q.a2 && <KnowledgeBrick id="jam-mutabayina" lead="الإزاحة بعدد واحد على عددين مرتّبين: ماذا نكتب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'وبالتمديد بعدد موجب؟', subtitle: 'المسمار', done: !!q.b,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="pos" ok={!!pos}
                done={<span>بالمسمار عند <Ltr>{pos?.c}</Ltr> وصل الأحمر إلى <Ltr>{pos?.a2}</Ltr> والأزرق إلى <Ltr>{pos?.b2}</Ltr> .</span>}
                todo="اختر المسمار واسحب العقدة إلى عدد موجب (مثل 2 أو 3)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="مدّدتَ الخيوط بعدد موجب مختلف عن 1. ماذا تلاحظ على الخيطين؟"
                options={['الترتيب نفسه: بقي الأحمر على يسار الأزرق', 'تبادلا مكانيهما لأنّ العدد أكبر من 1', 'صارا متساويين']}
                correct={0} cols={1} requires={['jam-mutabayina']}
                explain={<MathText>{'التمديد بعدد موجب يبعد العددين عن الصفر أو يقرّبهما منه، ولا يبدّل موضعيهما.'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <KnowledgeBrick id="darb-mujab" lead="التمديد بعدد موجب على عددين مرتّبين: ماذا نكتب؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'وبالتمديد بعدد سالب؟', subtitle: 'الاتجاه', done: (!!q.c && !!q.c2) || !!cp.b0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="neg" ok={!!neg}
                done={<span>بالمسمار عند <Ltr>{neg?.c}</Ltr> وصل الأحمر إلى <Ltr>{neg?.a2}</Ltr> والأزرق إلى <Ltr>{neg?.b2}</Ltr> .</span>}
                todo="اختر المسمار واسحب العقدة إلى عدد سالب، ثم عُد إلى هذا السؤال." />
              {neg && !cp.b0 ? (
                <TapQuestion
                  prompt={<span>أكمل بما رأيتَ على العارضة السفلى: <Ltr>{neg.a2}</Ltr> <span aria-hidden="true">□</span> <Ltr>{neg.b2}</Ltr></span>}
                  options={symbols} correct={1} cols={3} requires={['darb-mujab']}
                  explain={<MathText>{GUIDE.flip}</MathText>}
                  onAnswered={answered('c')}
                />
              ) : null}
              {q.c && !cp.b0 && (
                <TapQuestion
                  prompt="في أيّ محاولاتك فقط تبادل الخيطان مكانيهما؟"
                  options={['حين مدّدنا بعدد سالب تمامًا', 'حين استعملنا عددًا سالبًا بالمشط أو بالمسمار', 'حين مدّدنا بعدد أكبر من 1']}
                  correct={0} cols={1} requires={['darb-mujab']}
                  explain={<MathText>{'الإزاحة بعدد سالب (المشط) لم تبدّل الخيطين، والتمديد بـ $2$ أو $3$ لم يبدّلهما أيضًا.'}</MathText>}
                  onAnswered={answered('c2')}
                />
              )}
              {(q.c2 || cp.b0) && <KnowledgeBrick id="darb-salib" lead="التمديد بعدد سالب على عددين مرتّبين: ماذا نكتب؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وبالعدد 0 ؟', subtitle: 'صفر', done: !!q.d || !!cp.b2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="zero" ok={!!zero}
                done={<span>بالمسمار عند <Ltr>0</Ltr> التقت العقدتان عند <Ltr>0</Ltr> .</span>}
                todo="اختر المسمار واسحب العقدة إلى 0، ثم عُد إلى هذا السؤال." />
              {!cp.b2 && <TapQuestion
                prompt="عند المسمار في 0 التقت العقدتان. ماذا صارت المتباينة بين العددين؟"
                options={[M('$0=0$ : لم تعد متباينة تامّة'), M('$0<0$'), M('بقيت المتباينة الأولى')]}
                correct={0} cols={1} requires={['jam-mutabayina']}
                explain={<MathText>{'كل عدد مضروب في $0$ يصير $0$ ، فيتساوى العددان. لذلك نشترط $c\\neq 0$ في الخاصيتين.'}</MathText>}
                onAnswered={answered('d')}
              />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
