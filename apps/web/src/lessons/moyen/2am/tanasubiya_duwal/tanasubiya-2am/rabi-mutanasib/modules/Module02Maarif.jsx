import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `fourth-gauges`, posé seul `levels={false}`, balances voilées) : un prix
 * par la propriété additive (5 kg → 650 DA, 7 kg ?) puis une QUANTITÉ par la propriété multiplicative (4 kg → 300 DA, ? kg → 900 DA). Chaque
 * encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : les chemins,
 * le mot « الرابع المتناسب », puis la propriété a × d = b × c et la façon de s'en servir. LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children)}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const solved = (task) => trials.findLast((e) => e.kind === 'release' && !e.free && e.task === task && e.ok);
  const s0 = solved(0);
  const s1 = solved(1);
  // « ما مساواة الجداءين » est posée PAR-DESSUS le labo (`FourthGauges › QUESTIONS.cross`, tâche f1) : l'étape 3 en garde la TRACE
  const crossInLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'f1');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نركّب ثمنًا من ثمنين معلومين؟', 'كيف نجد كمية من نسبة الثمنين؟', 'ما الجداءان المتصالبان وكيف نحسب بهما؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — طرق الرابع المتناسب"
      moduleSubtitle="الجمع والضرب والجداءان"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="fourth-gauges" tasks={LAB.insert.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'كيف نركّب ثمن 7 kg ؟', subtitle: 'الخاصية الجمعية', done: !!q.a,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="add" ok={!!s0}
                done={<span>وضعتَ ثمن <Ltr>7</Ltr> kg على <Ltr>{s0?.value}</Ltr> DA .</span>}
                todo="أنجز المهمة الأولى في المختبر أعلاه (ثمن 7 kg)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>علمنا أنّ ثمن <Ltr>5</Ltr> kg هو <Ltr>650</Ltr> DA وثمن <Ltr>2</Ltr> kg هو <Ltr>260</Ltr> DA . لأنّ <Ltr>7 = 5 + 2</Ltr> ، كيف نحسب ثمن <Ltr>7</Ltr> kg ؟</span>}
                options={[M('$650 + 260 = 910$'), M('$650 \\times 260$'), M('$650 + 2 = 652$')]}
                correct={0} cols={1} requires={['farq']}
                explain={<MathText>{'القماش أو الفاكهة التي كتلتها $7$ kg هي قطعتان: $5$ kg و $2$ kg ، وثمنها مجموع الثمنين: $650 + 260 = 910$ DA .'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.fourth.text} source={KNOWLEDGE.fourth.source} />}
              {q.a && <KnowledgeBrick id="turuq" lead="لدينا ثلاثة أعداد ونريد الرابع: ما الطرق التي رأيناها؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نجد عدد الكيلوغرامات؟', subtitle: 'الخاصية الضربية', done: !!q.b,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="mul" ok={!!s1}
                done={<span>وجدتَ أنّ <Ltr>{s1?.value}</Ltr> kg ثمنها <Ltr>900</Ltr> DA .</span>}
                todo="أنجز المهمة الثانية في المختبر أعلاه (كم كيلوغرامًا بـ 900 DA)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>ثمن <Ltr>4</Ltr> kg هو <Ltr>300</Ltr> DA . لأنّ <Ltr>900 = 300 × 3</Ltr> ، كم كيلوغرامًا ثمنها <Ltr>900</Ltr> DA ؟</span>}
                options={[M('$4 \\times 3 = 12$'), M('$4 + 3 = 7$'), M('$4 \\div 3$')]}
                correct={0} cols={3} requires={['turuq']}
                explain={<MathText>{'الثمن صار ثلاثة أمثال، فالكتلة ثلاثة أمثال: $4 \\times 3 = 12$ kg .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.routes.text} source={KNOWLEDGE.routes.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما مساواة الجداءين المتصالبين؟', subtitle: 'الجدول (4 ، c ؛ 300 ، 900)', done: crossInLab,
          content: (
            <div className="space-y-3">
              <Evidence id="cross" ok={crossInLab && !!s1}
                done={<MathText>{'أجبتَ في المختبر: $4 \\times 900 = 300 \\times 12 = 3600$ ، فالكتلة الناقصة $12$ kg .'}</MathText>}
                todo="أنجز المهمة الثانية في المختبر أعلاه (عدد الكيلوغرامات)، وأجب عن الأسئلة التي تظهر فوقه." />
              {crossInLab && <TextbookBox kind="property" compact text={KNOWLEDGE.cross.text} source={KNOWLEDGE.cross.source} />}
              {crossInLab && <TextbookBox kind="remark" compact text={KNOWLEDGE.remark.text} source={KNOWLEDGE.remark.source} />}
              {crossInLab && <KnowledgeBrick id="hisab-jidaan" lead="من مساواة الجداءين: كيف نحصل على العدد المجهول؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
