import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : le plan d'une cour d'école vu d'en haut. UNE SEULE PISTE (§4quater) : le labo `courtyard-drone` en haut, sans
 * carte au-dessus — il porte son contexte et SA question ; la main conduit un drone D'ABORD sur la ligne horizontale puis sur la verticale (il refuse la diagonale), photographie un lieu dit par ses deux nombres ou
 * lit les nombres d'un objet ; en متقدم : des demi-cases, puis une carte SANS carreaux où le drone projette ses deux parallèles.
 *   مبتدئ — b1 la fontaine (3 ; −2) puis la porte (−4 ; 1) ; b2 (4 ; 0) puis (0 ; −3) ; b3 lire le portail et le kiosque.
 *   متقدم — a1 en demi-cases ; a2 sans carreaux ; a3 photographier sans carreaux.
 * Les questions sont posées PAR-DESSUS le labo après chaque tâche (`CourtyardDrone › CHAINS` : b1, b2, b3, a1, a2, a3) ; les ÉTAPES du module en gardent la TRACE (`checkpoint-done`) puis posent
 * les noms (briques) APRÈS la réponse. Les étapes 4 et 5 restent posables ici pour qui n'a pas fait le niveau متقدم.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

/** La trace d'une suite de questions répondue dans le labo (sinon : où la trouver). */
function Trace({ ok, done, todo }) {
  return (
    <p data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
}

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  // La demande libre (« جرّب أعدادك ») n'est jamais une preuve.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const s1 = answered('b1');
  const s2 = answered('b2');
  const s3 = answered('b3');
  const s4 = answered('a2');
  const s5 = answered('a3');

  return (
    <ContentModule
      objectives={['هل تصل المسيّرة إلى المكان نفسه إذا بدّلنا العددين؟', 'ما إحداثيا مكان على أحد الخطّين المطليّين؟', 'كيف نقرأ إحداثيي نقطة على خريطة بلا مربّعات؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسيّرة الساحة"
      moduleSubtitle="مسيّرة لا تسير مائلة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="courtyard-drone" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="courtyard-drone" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'الترتيب مهمّ', subtitle: 'عددان لا عدد واحد', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="قُدتَ المسيّرة إلى النافورة ثمّ إلى باب المكتبة، وأجبتَ عن أسئلة ترتيب العددين." todo="قد المسيّرة في المستوى المبتدئ إلى المكانين وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="tartib-adadayn" lead="هل وصلت المسيّرة إلى المكان نفسه حين بدّلتَ العددين؟ وأيّ عدد استعملتَه أوّلًا على الخط الأفقي؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'على أحد الخطّين', subtitle: 'عدد معدوم', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="صوّرتَ المقعد والصنبور وهما على أحد الخطّين المطليّين، وأجبتَ عن أسئلة العدد المعدوم." todo="أنجز مهمّة المقعد والصنبور في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s2 && <KnowledgeBrick id="nuqta-ala-muhwar" lead="ماذا فعلتَ بالمسيّرة لتصل إلى المقعد؟ ولتصل إلى الصنبور؟ وأيّ عدد كان صفرًا في كلّ منهما؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'قراءة إحداثيي مكان', subtitle: 'البوابة والكشك', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="وضعتَ المسيّرة فوق البوابة ثمّ فوق الكشك وقرأتَ عددَي كلّ منهما بالترتيب." todo="أنجز مهمّة البوابة والكشك في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s3 && <KnowledgeBrick id="ihdathiyyan" lead="كيف عرفتَ أيّ عدد يُكتب أوّلًا؟ وكيف عرفتَ إشارة كلّ عدد من العددين؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'خريطة بلا مربّعات', subtitle: 'الموازيان', done: s4 || q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="قرأتَ إحداثيي شجرة وبئر على خريطة بلا مربّعات بالخطّين المتقطّعين." todo="جرّب المستوى المتقدّم: المهمّة الثانية على خريطة بلا مربّعات. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s4 && (
                <TapQuestion
                  prompt={<MathText>{'على خريطة بلا مربّعات نريد قراءة فاصلة نقطة. من النقطة نرسم موازيًا:'}</MathText>}
                  options={[M('للخط الشاقولي حتى يلاقي الخط الأفقي'), M('للخط الأفقي حتى يلاقي الخط الأفقي'), M('لأيّ خطّ نشاء')]}
                  correct={0} cols={1}
                  explain={<MathText>{'الفاصلة تُقرأ على الخط الأفقي، والموازي للخط الشاقولي المارّ بالنقطة هو الذي يلاقيه عند تدريجة الفاصلة.'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {(s4 || q4) && <KnowledgeBrick id="muwaziyan" lead="من أين بدأ كلّ خطّ متقطّع ورسمته المسيّرة؟ وماذا قرأتَ عند ملتقى كلّ منهما بالمحورين؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'نصف مربّع', subtitle: 'عدد عشري في الإحداثيين', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="صوّرتَ النافورة والمقعد على خريطة بلا مربّعات بإحداثيين فيهما عدد عشري." todo="جرّب المستوى المتقدّم: المهمّة الثالثة. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<MathText>{'مكان إحداثياه $(2{,}5\\,;\\,-1{,}5)$ . أين نضع المسيّرة على الخط الأفقي أوّلًا؟'}</MathText>}
                  options={[M('بين العلامتين $2$ و $3$'), M('بين العلامتين $-2$ و $-1$'), M('بين العلامتين $1$ و $2$')]}
                  correct={0} cols={3}
                  explain={<MathText>{'الفاصلة $2{,}5$ موجبة، فهي على يمين المبدإ بين العلامتين $2$ و $3$ ؛ ثمّ ننزل بالترتيب $-1{,}5$ .'}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
