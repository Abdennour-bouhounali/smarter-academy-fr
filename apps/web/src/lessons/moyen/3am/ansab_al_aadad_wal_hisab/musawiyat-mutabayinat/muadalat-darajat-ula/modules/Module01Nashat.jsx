import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la عبّارة الحدود. UNE SEULE PISTE (§4quater) : le labo
 * `term-ferry` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient le SIGNE d'un terme (puis le diviseur). Les ÉTAPES
 * interrogent ce que l'élève a FAIT, avec SES essais : pourquoi le signe change à la traversée (P3), pourquoi « كما هو » casse l'équation (P3), pourquoi on
 * divise par le coefficient (P3), et ce que prouve la substitution (P2). Les noms (briques) viennent APRÈS la réponse. Le نشاط 4 du manuel est posé
 * en application au module 4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  // les questions posées PENDANT le labo (checkpoint-done) : la TRACE de l'étape ; si l'enseignant les coupe, les questions d'ici reprennent
  const [cp, setCp] = useState({});
  const record = (e) => { if (e.tk) { if (e.tk === 'checkpoint-done') setCp((c) => ({ ...c, [e.id]: true })); return; } setTrials((list) => [...list, e]); };
  const mine = trials.filter((e) => !e.free);
  const moved = mine.findLast((e) => e.kind === 'move' && e.ok && e.flip);
  const refused = mine.findLast((e) => e.kind === 'refused' && e.reason === 'sign');
  const divided = mine.findLast((e) => e.kind === 'divide' && e.ok);
  const checked = mine.findLast((e) => e.kind === 'check');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا يغيّر الحدّ إشارته حين يعبر؟', 'لماذا لا يعبر كما هو؟', 'لماذا نقسم على معامل x؟', 'ماذا يثبت التعويض؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — عبّارة الحدود"
      moduleSubtitle="صناديق بين ضفّتين"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="term-ferry" level="beginner" {...LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="term-ferry" level="advanced" {...LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا بقيت المعادلة صحيحة بعد العبور؟', subtitle: 'الإشارة المعاكسة', done: q1 || !!cp.b0 || !!cp.a0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="moved" ok={!!moved}
                done={<span>عبر الصندوق <Ltr>{moved?.value}</Ltr> فصار <Ltr>{moved?.landed}</Ltr> في الضفّة الأخرى وبقيت المعادلة صحيحة.</span>}
                todo="اجعل صندوقًا يعبر «بعكس إشارته» في العبّارة، ثم عُد إلى هذا السؤال." />
              {!(cp.b0 || cp.a0) && <TapQuestion
                prompt="عبر الصندوق إلى الضفّة الأخرى بعكس إشارته ولم تنكسر المعادلة. لماذا؟"
                options={[
                  'لأنّنا أضفنا معاكس الصندوق إلى الطرفين: يختفي من ضفّته ويظهر في الأخرى بإشارة معاكسة',
                  'لأنّ الصندوق خفيف',
                  'لأنّ الإشارة لا تهمّ في المعادلات',
                ]}
                correct={0} cols={1} requires={['khawass-musawiyat']}
                explain={<MathText>{GUIDE.moved}</MathText>}
                onAnswered={() => setQ1(true)}
              />}
              {(q1 || cp.b0 || cp.a0) && <KnowledgeBrick id="naql-hadd" lead="حدّ يعبر إلى الطرف الآخر: ماذا يحدث لإشارته؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا لم يعبر الصندوق كما هو؟', subtitle: 'الإشارة نفسها', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="refused" ok={!!refused}
                done={<span>حين عبر <Ltr>{refused?.value}</Ltr> كما هو صار الطرفان <Ltr>{refused?.values?.left}</Ltr> و <Ltr>{refused?.values?.right}</Ltr> عند الحلّ الخفيّ.</span>}
                todo="جرّب مرّة أن يعبر صندوق «كما هو»، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="عبر الصندوق «كما هو» فرفضته العبّارة. لماذا لم تبقَ المعادلة؟"
                options={[
                  'لأنّ الصندوق خرج من ضفّة (طرحناه منها) ودخل الأخرى (أضفناه إليها): عمليّتان مختلفتان على الطرفين',
                  'لأنّ الصندوق ثقيل',
                  'لأنّ الضفّتين صارتا متساويتين',
                ]}
                correct={0} cols={1} requires={['naql-hadd']}
                explain={<MathText>{GUIDE.signKept.why}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا نقسم على معامل x؟', subtitle: 'x وحده', done: q3 || !!cp.b1 || !!cp.a1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="divided" ok={!!divided}
                done={<span>قسمتَ الطرفين على <Ltr>{divided?.c}</Ltr> فصارت المعادلة <Ltr>x</Ltr> وحده في ضفّة.</span>}
                todo="اجمع الصناديق حتى يبقى x وحده مضروبًا في عدد، ثم اقسم، ثم عُد إلى هذا السؤال." />
              {!(cp.b1 || cp.a1) && <TapQuestion
                prompt="بقي $x$ وحده مضروبًا في عدد $a$ . لماذا نقسم الطرفين على $a$ ؟"
                options={[
                  'لأنّ $\\frac{ax}{a} = x$ : القسمة تترك $x$ وحده، والعملية نفسها على الطرفين',
                  'لأنّ القسمة تُنقص الطرفين',
                  'لأنّ $a$ يجب أن يختفي بالطرح',
                ].map(M)}
                correct={0} cols={1} requires={['naql-hadd']}
                explain={<MathText>{'نقسم الطرفين على $a$ ($a \\neq 0$) : $\\frac{ax}{a} = x$ ، فنجد $x = \\frac{n}{a}$ .'}</MathText>}
                onAnswered={() => setQ3(true)}
              />}
              {(q3 || cp.b1 || cp.a1) && <KnowledgeBrick id="qisma-muamil" lead="x مضروب في عدد: ماذا نفعل بالطرفين؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا يثبت التعويض؟', subtitle: 'التحقق', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="checked" ok={!!checked}
                done={<span>عوّضتَ <Ltr>x = {checked?.x}</Ltr> في المعادلة الأولى فصار الطرفان <Ltr>{checked?.left}</Ltr> و <Ltr>{checked?.right}</Ltr> .</span>}
                todo="اضغط «عوّض» بعد أن يبقى x وحده، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="عوّضنا الحلّ في المعادلة الأولى فتساوى الطرفان. ماذا يثبت ذلك؟"
                options={[
                  'أنّ العدد حلّ للمعادلة الأولى (وليس فقط للمعادلات التي كتبناها أثناء الحلّ)',
                  'أنّ المعادلة بلا حلّ',
                  'أنّ العدد زوجي',
                ]}
                correct={0} cols={1} requires={['naql-hadd']}
                explain={<MathText>{GUIDE.noCheck.why}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
