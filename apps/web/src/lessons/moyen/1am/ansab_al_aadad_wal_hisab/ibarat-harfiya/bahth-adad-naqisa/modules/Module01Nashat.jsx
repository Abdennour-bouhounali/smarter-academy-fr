import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : un atelier de conditionnement de fournitures scolaires. UNE SEULE PISTE (§4quater) :
 * le labo `rewind-belt` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main CHOISIT la carte qui fait tourner le tapis à rebours, TIRE la caisse jusqu'au bac d'entrée
 * (le nombre manquant □ apparaît), puis la REPOUSSE à travers la machine d'origine (la contre-épreuve).
 *   مبتدئ — b1 « ⁦+ 9⁩ » donne 54 ; b2 « ⁦− 14⁩ » donne 54 ; b3 « ⁦× 6⁩ » donne 54 ; b4 la carte piège « ⁦80 −⁩ » donne 54.
 *   متقدم — a1 décimaux « ⁦+ 17,5⁩ » donne 46,2 ; a2 « ⁦12,5 −⁩ » donne 4,8 ; a3 « ⁦× 7⁩ » donne 20 (la fraction 20/7).
 * Les questions sont posées PAR-DESSUS le labo après chaque tâche (`RewindBelt › CHAINS` : b1 … a3) ; les ÉTAPES du module en gardent la TRACE (`checkpoint-done`) puis posent les noms
 * (briques) APRÈS la réponse. Les étapes 5 et 6 restent posables ici pour qui n'a pas fait le niveau متقدم.
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
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);
  // La demande libre (« جرّب آلتك أنت ») n'est jamais une preuve.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const s1 = answered('b1');
  const s2 = answered('b2');
  const s3 = answered('b3');
  const s4 = answered('b4');
  const s5 = answered('a1') || answered('a2');
  const s6 = answered('a3');

  return (
    <ContentModule
      objectives={['كيف أُرجع الحزام لأجد العدد الذي دخل الآلة؟', 'هل يُحلّ « 80 − □ » كما يُحلّ « □ − 14 » ؟', 'كيف أتحقّق من العدد الذي وجدته؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — الحزام المعاكس"
      moduleSubtitle="آلة أخرجت عددًا معلومًا: ما الذي دخل؟"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="rewind-belt" level="beginner" tasks={LAB.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="rewind-belt" level="advanced" tasks={LAB.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'آلة تضيف', subtitle: 'الطرح يُرجع الجمع', done: s1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s1} done="أرجعتَ حزام آلة « ⁦+ 9⁩ » ووجدتَ ما دخل ثمّ تحقّقتَ بدفع الصندوق إلى الأمام." todo="أنجز المهمّة الأولى في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s1 && <KnowledgeBrick id="naqis-majmu" lead="آلة « ⁦+ 9⁩ » أخرجت 54: بأيّ بطاقة أرجعتَ الحزام؟ وماذا وجدتَ في صندوق الدخول؟ وماذا خرج حين دفعتَ الصندوق إلى الأمام؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'آلة تُنقص', subtitle: 'الجمع يُرجع الطرح', done: s2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s2} done="أرجعتَ حزام آلة « ⁦− 14⁩ » ووجدتَ ما دخل ثمّ تحقّقتَ." todo="أنجز المهمّة الثانية في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'آلة تضرب', subtitle: 'القسمة تُرجع الضرب', done: s3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s3} done="أرجعتَ حزام آلة « ⁦× 6⁩ » وقسمتَ الناتج على 6." todo="أنجز المهمّة الثالثة في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s3 && <KnowledgeBrick id="naqis-judaa" lead="آلة « ⁦× 6⁩ » أخرجت 54: بأيّ بطاقة أرجعتَ الحزام؟ وماذا فعلتَ بالعدد 54 ليظهر ما دخل؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'البطاقة « ⁦80 −⁩ »', subtitle: 'المطروح هو المجهول', done: s4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s4} done="أرجعتَ حزام آلة « ⁦80 −⁩ » ووجدتَ أنّ « + » لا تُرجعها." todo="أنجز المهمّة الرابعة في المستوى المبتدئ وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {s4 && <KnowledgeBrick id="naqis-farq" lead="آلة « ⁦80 −⁩ » بقي بعدها 54: ماذا خرج حين وضعتَ « + » على الصندوق؟ وبأيّ حساب وجدتَ ما أخذته الآلة؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'أعداد عشرية', subtitle: 'الفاصلة تبقى', done: s5 || q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s5} done="أرجعتَ آلتين بأعداد عشرية: « ⁦+ 17,5⁩ » و « ⁦12,5 −⁩ »." todo="جرّب المستوى المتقدّم: المهمّتان الأولى والثانية فيهما أعداد عشرية. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s5 && (
                <TapQuestion
                  prompt={<span>آلة « ⁦+ 17,5⁩ » أخرجت 46,2. العدد الناقص:</span>}
                  options={[M('$46{,}2-17{,}5=28{,}7$'), M('$46{,}2+17{,}5=63{,}7$'), M('$17{,}5-46{,}2$')]}
                  correct={0} cols={1} requires={['naqis-majmu']}
                  explain={<MathText>{'نطرح المعلوم من الناتج ونحتفظ بالفاصلة: $46{,}2-17{,}5=28{,}7$ ، ونتحقّق: $28{,}7+17{,}5=46{,}2$ .'}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 6, title: 'قسمة لا تتوقّف', subtitle: 'كسر ونتحقّق به', done: s6 || q6,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Trace ok={s6} done="قسمتَ 20 على 7 فظهر كسر، وتحقّقتَ به بالضبط." todo="جرّب المستوى المتقدّم: المهمّة الثالثة فيها آلة « ⁦× 7⁩ » أخرجت 20. أجب عن الأسئلة التي تظهر فوق المختبر." />
              {!s6 && (
                <TapQuestion
                  prompt={<span>العدد الناقص في <bdi dir="ltr">□ × 7 = 20</bdi> :</span>}
                  options={[M('$\\frac{20}{7}$'), M('$2{,}86$'), M('$13$')]}
                  correct={0} cols={3} requires={['naqis-judaa']}
                  explain={<MathText>{'$20\\div 7$ لا تتوقّف فنكتب الناتج كسرًا $\\frac{20}{7}$ ؛ و $2{,}86\\times 7=20{,}02$ لا $20$ .'}</MathText>}
                  onAnswered={() => setQ6(true)}
                />
              )}
              {(s6 || q6) && <KnowledgeBrick id="tahaqquq" lead="بعد أن وجدتَ العدد الناقص دفعتَ الصندوق إلى الأمام: ماذا خرج حين كانت البطاقة صحيحة؟ وكيف تحقّقتَ من الكسر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
