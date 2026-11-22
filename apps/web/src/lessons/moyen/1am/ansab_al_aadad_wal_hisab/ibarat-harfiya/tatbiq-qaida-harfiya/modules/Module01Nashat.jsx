import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : une papeterie-photocopie. UNE SEULE PISTE (§4quater) : le labo `letter-dial` en haut, sans carte au-dessus — il porte son contexte
 * et SA question ; la main TOURNE un cadran par lettre, la valeur TOMBE dans chaque fente de la lettre et la carte calcule.
 *   مبتدئ — b1 « الثمن = 5 × n + 20 » avec n = 12 donne 80 ; b2 le client qui a payé 95 (n = 15) ; b3 « 5 × n + 20 − n » avec n = 10 donne 60 (n écrit deux fois).
 *   متقدم — a1 « P = 2 × (a + b) » avec 15 et 8 donne 46 ; a2 les valeurs échangées donnent 46 ; a3 « a + b = a × b » : (2 ; 2) tient, un contre-exemple la réfute.
 * Les questions sont posées PAR-DESSUS le labo après chaque tâche (`LetterDial › CHAINS` : b1 … a3) ; les ÉTAPES du module en gardent la TRACE (`checkpoint-done`) puis posent les noms (briques) APRÈS la réponse.
 * Les étapes 4 et 5 restent posables ici pour qui n'a pas fait le niveau متقدم.
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
  // La demande libre (« جرّب قاعدتك أنت ») n'est jamais une preuve.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const s1 = answered('b1');
  const s2 = answered('b2');
  const s3 = answered('b3');
  const s4 = answered('a1') || answered('a2');
  const s5 = answered('a3');

  return (
    <ContentModule
      objectives={['ماذا يحدث في البطاقة حين أدير القرص؟', 'هل تكفي قيمة واحدة لنقول إنّ قاعدة صحيحة دائمًا؟', 'متى نقول إنّ قاعدة خاطئة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — قرص الحروف"
      moduleSubtitle="أدير القرص فتحسب البطاقة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="letter-dial" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="letter-dial" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'قيمة في الفتحة', subtitle: 'القرص ينزل في البطاقة', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="أدرتَ القرص على 12 ورقة فنزل العدد في موضع الحرف n وحسبت البطاقة الثمن." todo="أنجز المهمّة الأولى في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="qaida-tatbiq" lead="أدرتَ القرص على 12 ورقة: ماذا حلّ محلّ الحرف n على البطاقة؟ وماذا حسبت البطاقة بعد ذلك؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'قيمة تُبحث', subtitle: 'القرص حتى يظهر الوصل', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="أدرتَ القرص حتى عرضت البطاقة 95 دج ووجدتَ عدد الورقات." todo="أنجز المهمّة الثانية في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'حرف في موضعين', subtitle: 'القيمة تنزل في الموضعين', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="في « 5 × n + 20 − n » نزل العدد 10 في الموضعين معًا ثمّ حسبت البطاقة." todo="أنجز المهمّة الثالثة في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s3 && <KnowledgeBrick id="kull-mawdi" lead="في القاعدة الجديدة الحرف n مكتوب مرّتين: أين نزل العدد 10؟ وماذا حدث لو وضعناه في موضع واحد؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'حرفان وقوسان', subtitle: 'سياج الحديقة', done: s4 || q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="طبّقتَ قاعدة السياج بقرصين وحسبت البطاقة ما بين القوسين أوّلًا." todo="جرّب المستوى المتقدّم: المهمّتان الأولى والثانية فيهما قرصان للحرفين a و b. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s4 && (
                <TapQuestion
                  prompt={<span>من أجل a = 15 و b = 8 : قيمة <bdi dir="ltr">2 × (a + b)</bdi> هي:</span>}
                  options={[M('$2\\times(15+8)=46$'), M('$2\\times 15+8=38$'), M('$2\\times 15\\times 8=240$')]}
                  correct={0} cols={1} requires={['qaida-tatbiq']}
                  explain={<MathText>{'نضع $15$ مكان $a$ و $8$ مكان $b$ ثمّ نحسب ما بين القوسين أوّلًا: $15+8=23$ ثمّ $2\\times 23=46$ .'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {(s4 || q4) && <KnowledgeBrick id="awlawiya-qaida" lead="في 2 × (a + b) ماذا حسبت البطاقة أوّلًا؟ وماذا نجد لو حسبنا 2 × 15 + 8؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'قاعدة تدّعي الصحّة دائمًا', subtitle: 'قيمتان تُسقطانها', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="بحثتَ بالقرصين عن قيمتين لا تصحّ فيهما « a + b = a × b » ووجدتَ مثالًا مضادًّا." todo="جرّب المستوى المتقدّم: المهمّة الثالثة تختبر قاعدة صديقة سلمى. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<span>صحّت القاعدة « a + b = a × b » من أجل a = 2 و b = 2 . هل يكفي ذلك لنقول إنّها صحيحة دائمًا؟</span>}
                  options={[M('لا: قد تُسقطها قيمة أخرى'), M('نعم: لأنّها صحّت مرّة'), M('نعم: لأنّ $2+2=4$')]}
                  correct={0} cols={1} requires={['qaida-tatbiq']}
                  explain={<MathText>{'لا: من أجل $3$ و $4$ نجد $3+4=7$ بينما $3\\times 4=12$ : الجهتان مختلفتان، وهذا يكفي لإسقاطها.'}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
              {(s5 || q5) && <KnowledgeBrick id="mithal-mudad" lead="صحّت القاعدة من أجل 2 و 2 ثمّ سقطت من أجل قيمتين أخريين: كم قيمة كانت كافية لإسقاطها؟ وهل نفعتها القيمة 2 و 2؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
