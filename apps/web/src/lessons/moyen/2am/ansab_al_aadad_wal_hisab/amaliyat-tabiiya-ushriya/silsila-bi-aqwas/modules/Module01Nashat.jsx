import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la calculatrice de la coopérative. UNE SEULE PISTE (§4quater) : le labo `coop-calculator` en
 * haut, sans carte au-dessus — il porte son contexte et SA question ; la main POSE les parenthèses de la ligne tapée, « = » imprime et la machine + l'histoire jugent. Les questions sur ce que
 * l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `CoopCalculator › CHAINS`) et retiennent la tâche suivante ; les étapes ci-dessous en
 * gardent la TRACE (événements `checkpoint-done`) puis posent les noms (briques). Le نشاط 3 du manuel (vérifier six résultats donnés) est posé en application au module 4.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const first = (id, tk) => trials.find((e) => !e.free && e.tk === tk && e.id === id);
  const k2Refused = first('k2', 'refused');
  const k3Refused = first('k3', 'refused');
  const k4Refused = first('k4', 'refused');
  const a1Refused = first('a1', 'refused');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أكتشف كيف أجعل الآلة (والقارئ) يحسبان جزءًا من السلسلة أوّلًا', 'هل تلزم الأقواس دائمًا؟', 'ماذا أفعل إذا جاءت أقواس داخل أقواس؟', 'كيف أكتب كسرًا على الآلة الحاسبة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — حاسبة التعاونية"
      moduleSubtitle="ضع الأقواس واضغط «=»: الآلة والوضعية تحكمان"
      estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="coop-calculator" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="coop-calculator" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كتاب وغلافه يتقاسمهما أربعة أصدقاء', subtitle: 'لماذا طبعت الآلة ما يزيد على ثمن الكتاب؟', done: answered('k2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k2" ok={answered('k2')}
                done={k2Refused
                  ? <span>دون أقواس طبعت الآلة <Ltr>{k2Refused.value} DA</Ltr> لكلّ صديق، وبعد القوسين طبعت <Ltr>15 DA</Ltr> : ما تقوله الوضعية.</span>
                  : <span>وضعتَ القوسين من المحاولة الأولى فطبعت الآلة <Ltr>15 DA</Ltr> لكلّ صديق.</span>}
                todo="أنجز المهمة 2 في الحاسبة، وأجب عن الأسئلة التي تظهر فوق المختبر بعد «=»." />
              {answered('k2') && <KnowledgeBrick id="aqwas-awwalan" lead="ماذا تفعل الأقواس في حساب على الآلة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'قوسان لا يغيّران شيئًا', subtitle: 'ماذا يحدث حين نحيط بما يُحسب أوّلًا أصلًا؟', done: answered('k3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k3" ok={answered('k3')}
                done={k3Refused
                  ? <span>قوسان حول <Ltr>9 + 2</Ltr> غيّرا النتيجة إلى <Ltr>{k3Refused.value}</Ltr> ، وحول <Ltr>2 × 5</Ltr> لم يغيّرا شيئًا: <Ltr>19</Ltr> في الحالتين.</span>
                  : <span>وضعتَ القوسين حول <Ltr>2 × 5</Ltr> فطبعت الآلة <Ltr>19</Ltr> ، وهو ما تطبعه دونهما.</span>}
                todo="أنجز المهمة 3 في الحاسبة (الكراريس والعلب)، وأجب عن أسئلتها فوق المختبر." />
              {answered('k3') && <KnowledgeBrick id="aqwas-ghayr-daruriya" lead="متى لا نحتاج إلى القوسين؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'أقواس داخل أقواس', subtitle: 'من أين نبدأ؟', done: answered('k4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="k4" ok={answered('k4')}
                done={k4Refused
                  ? <span>قوس واحد فقط أعطى <Ltr>{k4Refused.value}</Ltr> مقعدًا؛ وبقوسين، الداخلي <Ltr>12 + 8</Ltr> أوّلًا، طبعت الآلة <Ltr>60</Ltr> .</span>
                  : <span>وضعتَ القوسين بالترتيب الصحيح فطبعت الآلة <Ltr>60</Ltr> مقعدًا.</span>}
                todo="أنجز المهمة 4 في الحاسبة (الحافلتان)، وأجب عن أسئلتها فوق المختبر." />
              {answered('k4') && <KnowledgeBrick id="aqwas-mutadakhila" lead="كيف نحسب أقواسًا داخل أقواس؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وكسر على بطاقة؟', subtitle: 'الآلة لا تفهم خطّ الكسر', done: answered('a1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="a1" ok={answered('a1')}
                done={a1Refused
                  ? <span>طبعت الآلة <Ltr>{a1Refused.value}</Ltr> لأنّ المقام لم يكن بين قوسين؛ وبقوسين للبسط وقوسين للمقام طبعت <Ltr>8 DA</Ltr> .</span>
                  : <span>كتبتَ البسط بين قوسين والمقام بين قوسين فطبعت الآلة <Ltr>8 DA</Ltr> لكلّ حاضر.</span>}
                todo="أنجز المهمة الأولى في المستوى المتقدّم (الكسر على البطاقة)، وأجب عن أسئلتها فوق المختبر." />
              {answered('a1') && <KnowledgeBrick id="khatt-kasr" lead="ماذا يخفي خطّ الكسر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
