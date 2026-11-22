import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le tramway. UNE SEULE PISTE (§4quater) : le labo `tram-route` en haut, sans carte
 * au-dessus — il porte son contexte et SA question ; la main POSE des tickets numérotés sur les opérations d'une chaîne, « انطلق » rejoue ce plan et le compteur du tram juge.
 * Les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche (`primitives/LabCheckpoint`, chaînes `TramRoute › CHAINS`) et retiennent la tâche
 * suivante ; les étapes ci-dessous en gardent la TRACE (événements `checkpoint-done`) puis posent les noms (briques). L'idée du تحدّ (deux lectures de 30 − 8 + 2) est la tâche
 * t1 du labo, avec d'autres nombres ; le نشاط 1 du manuel est posé en application au module 4.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const first = (id, tk) => trials.find((e) => !e.free && e.tk === tk && e.id === id);
  const t1Refused = first('t1', 'refused');
  const t1Plan = trials.findLast((e) => !e.free && e.tk === 'plan' && e.id === 't1');
  const t4Refused = first('t4', 'refused');
  const t3Refused = first('t3', 'refused');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أكتشف لماذا نتّفق على ترتيب واحد لحساب سلسلة عمليات دون أقواس', 'في أيّ ترتيب نحسب الجمع والطرح؟', 'في أيّ ترتيب نحسب الضرب والقسمة؟', 'ماذا يسبق ماذا إذا اجتمعت العمليات الأربع؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — خطّ الترامواي"
      moduleSubtitle="رقّم العمليات وانطلق: العدّاد يحكم"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="tram-route" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="tram-route" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'اثنان يحسبان 26 − 9 + 4', subtitle: 'ثلاثة عشر أم واحد وعشرون؟', done: answered('t1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t1" ok={answered('t1')}
                done={t1Refused
                  ? <span>في «انطلق» الأول حسبت خطّتك <Ltr>{t1Refused.value}</Ltr> وقرأ العدّاد <Ltr>{t1Refused.truth}</Ltr> : المحطتان وقعتا بترتيب كتابتهما.</span>
                  : <span>وافق حسابُك العدّاد من المحاولة الأولى: <Ltr>{t1Plan?.truth}</Ltr> ، لأنّ المحطتين وقعتا بترتيب كتابتهما.</span>}
                todo="أنجز المهمة 1 في الترامواي، وأجب عن الأسئلة التي تظهر فوق المختبر بعد «انطلق»." />
              {answered('t1') && <KnowledgeBrick id="yasar-yamin-jam" lead="في سلسلة جمع وطرح: من أين نبدأ الحساب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'متى يتغيّر الناتج؟', subtitle: 'الصعود وحده، ثم النزول', done: answered('t2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t2" ok={answered('t2')}
                done={<span>أجبتَ في المختبر: في الجمع وحده لا يتغيّر الناتج إن بدّلت الترتيب، أمّا مع النزول فيتغيّر؛ ولهذا اتّفقنا على قراءة واحدة.</span>}
                todo="أنجز المهمة 2 في الترامواي (نزولان وصعود)، وأجب عن أسئلتها فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'وفي كشك التذاكر؟', subtitle: 'الضرب والقسمة وحدهما', done: answered('t3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t3" ok={answered('t3')}
                done={t3Refused
                  ? <span>أعطى الضرب أوّلًا <Ltr>{t3Refused.value}</Ltr> DA لأربع تذاكر، وهو أقلّ من ثمن تذكرة واحدة؛ والثمن الصحيح <Ltr>{t3Refused.truth}</Ltr> DA .</span>
                  : <span>حسبتَ القسمة أوّلًا فوافق حسابُك الكشك: <Ltr>100</Ltr> DA لأربع تذاكر.</span>}
                todo="أنجز المهمة 3 في الكشك، وأجب عن أسئلتها فوق المختبر." />
              {answered('t3') && <KnowledgeBrick id="yasar-yamin-darb" lead="في سلسلة ضرب وقسمة وحدهما: من أين نبدأ؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وإذا اجتمعت العمليات؟', subtitle: 'الأفواج تصعد دفعة واحدة', done: answered('t4'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="t4" ok={answered('t4')}
                done={t4Refused
                  ? <span>الجمع أوّلًا أعطى <Ltr>{t4Refused.value}</Ltr> ، وهو أكثر ممّا صعد فعلًا؛ والعدّاد قرأ <Ltr>{t4Refused.truth}</Ltr> .</span>
                  : <span>حسبتَ الأفواج أوّلًا فوافق حسابُك العدّاد: <MathText>{'$15 + 12 = 27$'}</MathText> .</span>}
                todo="أنجز المهمة 4 في الترامواي (أفواج تصعد)، وأجب عن أسئلتها فوق المختبر." />
              {answered('t4') && <KnowledgeBrick id="awlawiya" lead="في سلسلة فيها جمع وضرب: ماذا نحسب أوّلًا؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
