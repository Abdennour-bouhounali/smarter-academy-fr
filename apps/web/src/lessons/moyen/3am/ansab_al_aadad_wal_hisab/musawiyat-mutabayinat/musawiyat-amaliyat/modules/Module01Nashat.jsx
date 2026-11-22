import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le مضمار المساواة. UNE SEULE PISTE (§4quater) :
 * le labo `equality-lanes` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient c, le nombre d'une opération.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais : pourquoi la même opération des deux côtés les garde ensemble (P1), ce qui arrive
 * quand un seul la reçoit (P1), ce que deviennent × et ÷ (P2), et ce que vaut « × 0 » (P2). Les noms (briques) viennent APRÈS la réponse. Le نشاط 1
 * du manuel est posé en application au module 4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;
const SIGN = { add: '+', sub: '−', mul: '×', div: '÷' };
const opText = (t) => `${SIGN[t.op]} ${t.c < 0 ? `(${t.c})` : t.c}`;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  // les questions posées PENDANT le labo (checkpoint-done) : la TRACE de l'étape ; si l'enseignant les coupe, les questions d'ici reprennent
  const [cp, setCp] = useState({});
  const record = (e) => { if (e.tk) { if (e.tk === 'checkpoint-done') setCp((c) => ({ ...c, [e.id]: true })); return; } setTrials((list) => [...list, e]); };
  const mine = trials.filter((e) => e.kind === 'apply' && !e.free);
  const both = mine.findLast((e) => e.who === 'both' && (e.op === 'add' || e.op === 'sub') && e.c !== 0);
  const one = mine.findLast((e) => e.who !== 'both' && e.broke);
  const scaled = mine.findLast((e) => e.who === 'both' && (e.op === 'mul' || e.op === 'div') && e.c !== 0 && !e.lost);
  const lost = mine.findLast((e) => e.lost);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا بقي المتسابقان معًا؟', 'ماذا حدث حين تلقّى أحدهما العملية وحده؟', 'ماذا يحدث عند الضرب والقسمة؟', 'وعند الضرب في 0؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مضمار المساواة"
      moduleSubtitle="عملية على طرفي مساواة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="equality-lanes" level="beginner" {...LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="equality-lanes" level="advanced" {...LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا بقي المتسابقان معًا؟', subtitle: 'الجمع والطرح على الطرفين', done: q1 || !!cp.b0 || !!cp.a0,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="both" ok={!!both}
                done={<span>طبّقتَ <Ltr>{opText(both ?? {})}</Ltr> على الطرفين فبقيا معًا عند <Ltr>{both?.after?.left}</Ltr> .</span>}
                todo="نفّذ في المضمار عملية جمع أو طرح على كلا الطرفين، ثم عُد إلى هذا السؤال." />
              {!(cp.b0 || cp.a0) && <TapQuestion
                prompt="كان المتسابقان عند الخانة نفسها، وتلقّى كلٌّ منهما العملية نفسها بالعدد نفسه. لماذا بقيا معًا؟"
                options={[
                  'لأنّ كليهما كان عند العدد نفسه، والعملية نفسها على عددين متساويين تعطي عددين متساويين',
                  'لأنّ المضمار يعيدهما معًا في كل مرّة',
                  'لأنّ العدد صغير',
                ]}
                correct={0} cols={1} requires={['ikhtibar-musawat']}
                explain={<MathText>{GUIDE.together}</MathText>}
                onAnswered={() => setQ1(true)}
              />}
              {(q1 || cp.b0 || cp.a0) && <KnowledgeBrick id="musawat-jam" lead="عملية نفسها على متسابقين متساويين: ماذا نكتب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا حدث حين تلقّى أحدهما العملية وحده؟', subtitle: 'طرف واحد', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="one" ok={!!one}
                done={<span>حين طبّقتَ <Ltr>{opText(one ?? {})}</Ltr> على {one?.who === 'left' ? 'سلمى وحدها' : 'أمين وحده'} صارا عند <Ltr>{one?.after?.left}</Ltr> و <Ltr>{one?.after?.right}</Ltr> .</span>}
                todo="اختر في المضمار «الأيسر وحده» أو «الأيمن وحده» ونفّذ عملية، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="العدد الذي أضفتَه لم يصل إلا إلى متسابق واحد. ماذا حدث، ولماذا؟"
                options={[
                  'افترقا بمقدار العدد نفسه، لأنّ قيمة طرف واحد فقط هي التي تغيّرت',
                  'بقيا معًا، لأنّ x لم يتغيّر',
                  'افترقا لأنّ المضمار ضيّق',
                ]}
                correct={0} cols={1} requires={['musawat-jam']}
                explain={<MathText>{GUIDE.oneSide.why}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="tarafayn" lead="أين تُجرى العملية حتى تبقى المساواة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل يبقى المتسابقان معًا بعد الضرب والقسمة؟', subtitle: 'الضرب والقسمة', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="scaled" ok={!!scaled}
                done={<span>طبّقتَ <Ltr>{opText(scaled ?? {})}</Ltr> على الطرفين فبقيا معًا عند <Ltr>{scaled?.after?.left}</Ltr> .</span>}
                todo="نفّذ في المضمار عملية ضرب أو قسمة على كلا الطرفين، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt="بعد الضرب أو القسمة على الطرفين بقي المتسابقان معًا. متى يحدث ذلك؟"
                options={[
                  'مهما كان العدد (موجبًا أو سالبًا)، ما عدا القسمة على $0$',
                  'فقط إذا كان العدد موجبًا',
                  'فقط إذا كان العدد صحيحًا',
                ].map(M)}
                correct={0} cols={1} requires={['musawat-jam']}
                explain={<MathText>{GUIDE.scale}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا يضيع بالضرب في 0؟', subtitle: 'صفر', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="lost" ok={!!lost}
                done={<span>ضربتَ في <Ltr>0</Ltr> فصار المتسابقان عند <Ltr>0</Ltr> معًا.</span>}
                todo="اختر × واضبط العدد على 0 ثم نفّذ (على كلا الطرفين)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>بعد الضرب في <Ltr>0</Ltr> صار المتسابقان عند <Ltr>0</Ltr> والمساواة <Ltr>0 = 0</Ltr> صحيحة. هل نستطيع الرجوع منها إلى المساواة الأولى؟</span>}
                options={[
                  'لا: كل مساواة تصير $0 = 0$ ، فضاعت المعلومة',
                  'نعم، بالقسمة على $0$',
                  'نعم، بالضرب في $1$',
                ].map(M)}
                correct={0} cols={1} requires={['musawat-jam']}
                explain={<MathText>{GUIDE.divZero.why}</MathText>}
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
