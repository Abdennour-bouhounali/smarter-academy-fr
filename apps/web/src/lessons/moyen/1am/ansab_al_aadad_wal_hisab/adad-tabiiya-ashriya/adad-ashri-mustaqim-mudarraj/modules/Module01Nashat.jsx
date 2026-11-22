import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la journée sportive. UNE SEULE PISTE
 * (§4quater) : le labo `jump-tape` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient d'abord l'UNITÉ
 * de longueur (elle étire la marque « 1 »), puis le DRAPEAU ; متقدم : le CURSEUR de lecture.
 *   مبتدئ — b1 2,4 · 3,1 · 1,8 (unité libre) ; b2 0,7 · 2,9 · 3 ; b3 0,8 · 2 + 6/10 · 3,3.
 *   متقدم — a1 0,6 · 1,9 · 2,35 (un drapeau entre deux graduations) ; a2 un ruban sans origine (9 … 12) ; a3 un ruban au centième.
 * Les questions sont posées PAR-DESSUS le labo après chaque étape (`JumpTape › CHAINS` : b1u, b1, b2, b3, a1, a2, a3) ; les ÉTAPES du module
 * en gardent la TRACE (`checkpoint-done`) puis posent les noms (briques) APRÈS la réponse. Le نشاط 4 du manuel est posé en application
 * au module 4. Les étapes 4 et 5 restent posables ici pour qui n'a pas fait le niveau متقدم.
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
  const s1 = answered('b1u');
  const s2 = answered('b1');
  const s3 = answered('b3');
  const s4 = answered('a1');
  const s5 = answered('a2');

  return (
    <ContentModule
      objectives={['كم تدريجة صغيرة في الوحدة؟', 'كيف نقرأ فاصلة علم مغروس؟', 'ماذا نكتب لعلم بين تدريجتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — أعلام القفزات"
      moduleSubtitle="شريط لا يظهر منه إلا المبدأ"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="jump-tape" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="jump-tape" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كم تدريجة في الوحدة؟', subtitle: 'وماذا يمثّل التباعد بينها', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="مدَدتَ الوحدة وأجبتَ عن سؤال التدريجات الصغيرة." todo="مدّ الوحدة في المستوى المبتدئ حتى يتّسع الشريط لأبعد قفزة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="tadrij-nisf-mustaqim" lead="لماذا لم يرسم الشريط تدريجاته الصغيرة إلا بعد أن مددتَ الوحدة؟ وكم تساوي كلّ تدريجة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما فاصلة العلم؟', subtitle: 'الوحدات ثم التدريجات', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="غرستَ أعلام القفزات الثلاث وقرأتَ فاصلة أحدها." todo="اغرس أعلام القفزات الثلاث في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s2 && <KnowledgeBrick id="faasila-nuqta" lead="كيف قرأتَ فاصلة العلم الأزرق؟ ماذا عدَدتَ أوّلًا وماذا عدَدتَ بعدها؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'العدد 3 والكتابة 2 + 6/10', subtitle: 'كتابتان للفاصلة', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="غرستَ علمًا على علامة صحيحة وآخر مكتوبًا بصيغة مجموع." todo="أنجز الشريطين الثاني والثالث في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'علم بين تدريجتين', subtitle: 'الحصر', done: s4 || q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="قرأتَ علمًا يقع بين تدريجتين وحصرتَ فاصلته." todo="جرّب المستوى المتقدّم: اقرأ الأعلام الثلاثة وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s4 && (
                <TapQuestion
                  prompt={<span>علم يقع بين التدريجتين <bdi dir="ltr">3,4</bdi> و <bdi dir="ltr">3,5</bdi> . فاصلته <bdi dir="ltr">x</bdi> :</span>}
                  options={[M('$3{,}4<x<3{,}5$'), M('$x=3{,}4$'), M('$x=3{,}5$')]}
                  correct={0} cols={1}
                  explain={<MathText>{'لا تقع النقطة على تدريجة، فنحصر فاصلتها بين فاصلتي التدريجتين المجاورتين: $3{,}4<x<3{,}5$ .'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {(s4 || q4) && <KnowledgeBrick id="hasr-faasila" lead="علم لم يقع على أيّ تدريجة: كيف كتبتَ فاصلته، ولماذا لا نقول إنّها إحدى التدريجتين؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'وحين لا يظهر المبدأ؟', subtitle: 'شريط يبدأ من 9', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="قرأتَ فاصلة علم على شريط لا يظهر مبدؤه." todo="جرّب المستوى المتقدّم: الشريط الثاني لا يظهر مبدؤه. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<span>شريط تبدأ علاماته المكتوبة من <bdi dir="ltr">6</bdi> . علم بعد العلامة <bdi dir="ltr">7</bdi> بأربع تدريجات صغيرة، فاصلته:</span>}
                  options={[M('$7{,}4$'), M('$0{,}4$'), M('$6{,}4$')]}
                  correct={0} cols={3}
                  explain={<MathText>{'نقرأ العدد المكتوب على آخر علامة قبل العلم (7) ثم نضيف أربع تدريجات: $7+\\frac{4}{10}=7{,}4$ .'}</MathText>}
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
