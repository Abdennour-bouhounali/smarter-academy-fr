import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : une semaine de janvier à Djelfa. UNE SEULE PISTE (§4quater) :
 * le labo `frost-gauge` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient le NIVEAU de la jauge (liquide d'un thermomètre,
 * repère d'altitude, ombre dans un miroir ; en متقدم : deux lectures à la même distance du zéro, les étages, qui est le plus loin de la mer).
 *   مبتدئ — b1 5 · −2 · −3 · 0 · 2 (la semaine) ; b2 −40 · 30 · 0 m ; b3 le niveau −4, l'ombre de 3, le zéro.
 *   متقدم — a1 deux lectures à 6 du zéro ; a2 les étages −2 · 5 · 0 ; a3 −30 · 20 m.
 * Les questions sont posées PAR-DESSUS le labo après chaque tâche (`FrostGauge › CHAINS` : b1, b2, b3, a1, a2, a3) ; les ÉTAPES du module en gardent la TRACE
 * (`checkpoint-done`) puis posent les noms (briques) APRÈS la réponse. Les étapes 4 et 5 restent posables ici pour qui n'a pas fait le niveau متقدم.
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
  const s4 = answered('a1');
  const s5 = answered('a2');

  return (
    <ContentModule
      objectives={['متى تظهر الإشارة أمام قراءة؟', 'ما الفرق بين الإشارة والمسافة إلى الصفر؟', 'ماذا يجمع بين عددين متعاكسين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — أسبوع في الجلفة"
      moduleSubtitle="جهاز قياس لا يُظهر إلا الصفر"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="frost-gauge" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="frost-gauge" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'متى ظهرت الإشارة؟', subtitle: 'والأبرد صباح', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="سجّلتَ قراءات الأسبوع الخمس وأجبتَ عن أسئلة الأبرد والمسافة." todo="سجّل قراءات الأسبوع في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="sayaqat-salib" lead="كيف وضعتَ السائل لقراءة « 3 درجات تحت الصفر »؟ وأيّ صباح كان الأبرد، ولماذا لم يكن صباح أكبر عدد؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما تحت سطح البحر', subtitle: 'ارتفاع وعمق', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="قرأتَ أعماقًا وارتفاعات على جهاز واحد: ما تحت سطح البحر أخفض ممّا فوقه." todo="أنجز مهمّة الارتفاعات في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'المرآة', subtitle: 'ظلّ المستوى', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="وضعتَ مستويات أمام المرآة ورأيتَ أين تقف ظلالها." todo="أنجز مهمّة المرآة في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s3 && <KnowledgeBrick id="adad-mutaakisan" lead="أين وقف ظلّ المستوى $-4$ ؟ وماذا يجمع بين العددين $4$ و $-4$ ؟ وأين وقف ظلّ الصفر؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'قراءتان على بعد واحد', subtitle: 'الإشارة والمسافة', done: s4 || q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="سجّلتَ قراءتين مختلفتين لهما المسافة نفسها إلى الصفر." todo="جرّب المستوى المتقدّم: سجّل قراءتين تبعدان 6 درجات عن الصفر وأجب عن السؤال الذي يظهر فوق المختبر." />
              {!s4 && (
                <TapQuestion
                  prompt={<span>كم عددًا نسبيًّا يبعد <bdi dir="ltr">5</bdi> عن الصفر؟</span>}
                  options={[M('عددان: $5$ و $-5$'), M('عدد واحد: $5$'), M('عدد واحد: $-5$')]}
                  correct={0} cols={1}
                  explain={<MathText>{'على كلّ جهة من الصفر نقطة تبعد 5 عنه: $5$ فوقه و $-5$ تحته.'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {(s4 || q4) && <KnowledgeBrick id="ishara-masafa" lead="القراءتان $6$ و $-6$ بعدهما عن الصفر واحد: ما الذي اختلف بينهما؟ وأيّ جزء من العدد قال لك الجهة؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'طوابق تحت الأرض', subtitle: 'مصعد عمارة', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="أوقفتَ المصعد عند طوابق فوق الأرضي وتحته." todo="جرّب المستوى المتقدّم: المهمّة الثانية فيها مصعد عمارة. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<span>في عمارة طابقان تحت الأرضي. رقم آخر طابق تحت الأرض:</span>}
                  options={[M('$-2$'), M('$2$'), M('$-1$')]}
                  correct={0} cols={3}
                  explain={<MathText>{'ما تحت الأرضي يأخذ عددًا سالبًا: $-1$ ثمّ $-2$ ، فآخر طابق $-2$ .'}</MathText>}
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
