import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, METHOD_SHIFT, KNOWLEDGE } from '../content/textbook';

/**
 * Module 4 — طريقة 2 « الضرب في 10 و 100 و 1000 والقسمة عليها » (P4). UNE SEULE PISTE (guide §4quater) : le MÊME instrument que le
 * module 1, monde `machine` (« آلة العشرة »), posé EN HAUT avec ses deux niveaux — la virgule glisse sous les chiffres, des zéros
 * viennent remplir les rangs qui apparaissent. Puis des questions sur CE QUE L'ÉLÈVE A FAIT (3,5 × 100 = 350, 3,5 × 10 = 35 et non 3,50,
 * 3,5 ÷ 100 = 0,035), la solution d'un exemple ligne à ligne, et le contraste × 0,1 = ÷ 10 (extension du programme `1am.m1.r03`).
 * Déploiement du prototype (2026-10-28) : « ماذا حدث للأرقام » (× 100) et « من أين جاء الصفر » (÷ 100) sont posées PAR-DESSUS le labo
 * (`DecimalComma › chainOf` : le résultat, le glissement, le zéro) ; les étapes 1 et 3 en gardent la TRACE. Le rejet de « × 10 = un zéro
 * en plus » (رأي كريم) reste une question d'étape.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;
const num = (s) => Number(String(s ?? '').replace(/[\s ]/g, '').replace(',', '.'));

export default function Module04TariqaAshara() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const solved = (target) => trials.some((e) => e.kind === 'shift' && e.ok && num(e.target) === num(target));
  // les questions posées PAR-DESSUS le labo : une suite est finie (`checkpoint-done`) juste après la réussite de SA tâche (son résultat)
  const answeredFor = (target) => trials.some((e, j) => e.tk === 'checkpoint-done' && num(trials.slice(0, j).findLast((x) => !x.tk && x.ok)?.target) === num(target));
  const q1 = answeredFor('350');
  const q3 = answeredFor('0,035');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ماذا يحدث للأرقام عند الضرب في 100؟', 'هل نضيف صفرًا عند الضرب في 10؟', 'من أين يأتي الصفر في 0,035؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="طريقة — الضرب في 10 و 100 و 1000 والقسمة عليها"
      moduleSubtitle="آلة العشرة"
      estimatedTime="10 دقائق"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="decimal-comma" level="beginner" world="machine" tasks={LAB.machine.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="decimal-comma" level="advanced" world="machine" tasks={LAB.machine.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا حدث للأرقام؟', subtitle: '3,5 × 100', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="times100" ok={q1}
                done={<span>أجبتَ في المختبر: <Ltr>3,5 × 100 = 350</Ltr> — بقي الرقمان 3 و 5، وانزلقت الفاصلة مرتبتين نحو اليمين، وملأ صفرٌ المرتبة الفارغة.</span>}
                todo="شغّل الآلة على 3,5 × 100 في المستوى المبتدئ، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 2, title: 'هل الضرب في 10 يضيف صفرًا؟', subtitle: 'رأي كريم', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="times10" ok={solved('35')}
                done={<span>ضربتَ <Ltr>3,5</Ltr> في 10 فأعطتك الآلة <Ltr>35</Ltr>.</span>}
                todo="شغّل الآلة على 3,5 × 10 في المستوى المبتدئ، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>قال كريم: «الضرب في 10 معناه أن أكتب صفرًا في آخر العدد». هل يصحّ هذا في <Ltr>3,5 × 10</Ltr>؟</span>}
                options={[M('لا: الناتج 35، أمّا 3,50 فهو 3,5 نفسه'), M('نعم: الناتج 3,50'), M('نعم، بشرط أن توجد فاصلة')]}
                correct={0} cols={1} requires={['fasila-hajm']}
                explain={<MathText>{'الصفر في آخر الجزء العشري لا يغيّر العدد. الذي يحدث أنّ الفاصلة تنتقل مرتبة نحو اليمين: $3{,}5\\times10=35$ .'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="azaha-fasila" lead="الضرب في 10 و 100 والقسمة عليهما: إلى أيّ جهة تتحرّك الفاصلة في كل حالة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'من أين جاء الصفر؟', subtitle: '3,5 ÷ 100', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="div100" ok={q3}
                done={<span>أجبتَ في المختبر: <Ltr>3,5 ÷ 100 = 0,035</Ltr> — انزلقت الفاصلة مرتبتين نحو اليسار، فأضفتَ صفرًا لمرتبة لا رقم فيها.</span>}
                todo="شغّل الآلة على 3,5 ÷ 100 في المستوى المبتدئ، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'مثال محلول', subtitle: '56,8', done: q4,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_SHIFT} onAllRevealed={() => setRead(true)} />
              {read && <TextbookBox kind="method" compact text={KNOWLEDGE.shift.rule} source={KNOWLEDGE.shift.source} />}
              <TapQuestion
                prompt={<span>احسب دون وضع العملية: <Ltr>7,2 × 1000</Ltr>.</span>}
                options={[M('$7200$'), M('$7{,}2000$'), M('$0{,}0072$')]}
                correct={0} cols={3} requires={['azaha-fasila']}
                explain={<MathText>{'ثلاث مراتب نحو اليمين: بعد الرقم 2 نكتب صفرين لنملأ المرتبتين: $7{,}2\\times1000=7200$ .'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'والضرب في 0,1؟', subtitle: '27,5 × 0,1', done: q5,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>الضرب في <Ltr>0,1</Ltr> (أي في عُشر). احسب <Ltr>27,5 × 0,1</Ltr>:</span>}
                options={[M('$2{,}75$'), M('$275$'), M('$27{,}51$')]}
                correct={0} cols={3} requires={['azaha-fasila']}
                explain={<MathText>{'أخذ عُشر العدد يصغّره عشر مرّات: $27{,}5\\times0{,}1=27{,}5\\div10=2{,}75$ .'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && <KnowledgeBrick id="darb-juz-ashar" lead="27,5 × 0,1 و 27,5 ÷ 10 أعطيا العدد نفسه: فما معنى الضرب في 0,1؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
