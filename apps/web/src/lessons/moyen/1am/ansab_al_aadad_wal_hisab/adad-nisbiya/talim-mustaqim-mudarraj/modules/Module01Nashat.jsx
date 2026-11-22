import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la route d'un village. UNE SEULE PISTE (§4quater) : le labo `stride-stamp` en haut, sans
 * carte au-dessus — il porte son contexte et SA question ; la main PORTE le bâton-foulée de la station O vers l'est puis vers l'ouest, le jumeau d'une maison, trois maisons à leur abscisse ;
 * en متقدم : le drapeau de l'origine sur une droite dont seules deux graduations sont écrites, puis l'encadrement entre deux ticks.
 *   مبتدئ — b1 3 puis −3 (la foulée longue ne rejoint pas −3) ; b2 le jumeau de −3 puis de 2 ; b3 A(−3) · B(2,7) · C(−1,5).
 *   متقدم — a1 −3 et 3 ; a2 −8 et −2 de deux en deux ; a3 −1,5 · 2,7 · −0,4.
 * Les questions sont posées PAR-DESSUS le labo après chaque tâche (`StrideStamp › CHAINS` : b1, b2, b3, a1, a2, a3) ; les ÉTAPES du module en gardent la TRACE (`checkpoint-done`) puis posent
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
      objectives={['لماذا نحمل الوحدة نفسها في الجهتين؟', 'ما فاصلة بيت غرب المبدإ؟ وما فاصلة نظيره؟', 'كيف نجد المبدأ ونحصر نقطة بين علامتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — طريق القرية"
      moduleSubtitle="طريق لا يُكتب عليها إلا الصفر"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="stride-stamp" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="stride-stamp" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'الوحدة نفسها في الجهتين', subtitle: 'شرقًا وغربًا', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="حملتَ العصا إلى باب المدرسة شرقًا وإلى باب المسجد غربًا، وأجبتَ عن أسئلة الوحدة والإشارة." todo="احمل العصا في المستوى المبتدئ إلى البابين وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="tadrij-jihatayn" lead="لماذا بقيت الخطوة نفسها غرب المحطّة وشرقها؟ وماذا ظهر أمام العلامات التي طبعتها في الغرب؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'بيتان متقابلان', subtitle: 'فاصلتان متعاكستان', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="وضعتَ بيت الجار الثاني في الجهة المقابلة من المحطّة بالبعد نفسه." todo="أنجز مهمّة الجارين في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s2 && <KnowledgeBrick id="nuqtatan-mutanazirtan" lead="أين وضعتَ البيت المقابل لبيت فاصلته $-3$ ؟ وماذا يجمع بين فاصلتيهما؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ثلاثة بيوت بفواصلها', subtitle: 'ما بين علامتين', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="وضعتَ ثلاثة بيوت على الطريق بفواصلها: بينها بيت يقع بين علامتين." todo="أنجز مهمّة البيوت الثلاثة في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s3 && <KnowledgeBrick id="fasila-nuqta" lead="كيف عرفتَ أين تضع بيتًا فاصلته $-3$ ؟ وبيتًا فاصلته $2{,}7$ ؟ وبيتًا فاصلته $-1{,}5$ ؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'مبدأ مفقود', subtitle: 'علامتان مكتوبتان', done: s4 || q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="وجدتَ مكان المبدإ من علامتين مكتوبتين، حتى حين كانت التدريجة تساوي وحدتين." todo="جرّب المستوى المتقدّم: ضع علم المحطّة حيث تصير الأعداد المكتوبة صحيحة وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s4 && (
                <TapQuestion
                  prompt={<MathText>{'علامتان مكتوبتان على طريق: $-4$ و $4$ ، وبينهما ثماني تباعدات متساوية. أين يقع الصفر؟'}</MathText>}
                  options={[M('في منتصف المسافة بينهما'), M('عند العلامة $-4$'), M('عند العلامة $4$')]}
                  correct={0} cols={1}
                  explain={<MathText>{'العددان $-4$ و $4$ متعاكسان، لهما المسافة نفسها إلى الصفر: الصفر في منتصف المسافة بين علامتيهما.'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'بين علامتين', subtitle: 'حصر الفاصلة', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="أحطتَ كلّ بيت بإطار طوله خطوة واحدة بين علامتين متتاليتين." todo="جرّب المستوى المتقدّم: المهمّة الثالثة فيها إطار الخطوة. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<MathText>{'بيت فاصلته $-2{,}3$ . بين أيّ علامتين يقع؟'}</MathText>}
                  options={[M('$-3$ و $-2$'), M('$-2$ و $-1$'), M('$2$ و $3$')]}
                  correct={0} cols={3}
                  explain={<MathText>{'نعدّ من الصفر نحو الغرب: بعد العلامة $-2$ وقبل $-3$ ، أي $-3<-2{,}3<-2$ .'}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
              {(s5 || q5) && <KnowledgeBrick id="hasr-fasila" lead="كيف عرفتَ بين أيّ علامتين يقع البيت الذي فاصلته سالبة؟ وأين تضع الصغرى من العلامتين؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
