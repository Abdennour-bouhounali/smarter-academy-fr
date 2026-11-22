import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_TEN, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type, monde `couple`, posé seul `levels={false}`) : deux trains de même
 * base attelés. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme
 * (guide §4ter-bis) : la définition de aⁿ, a⁰ et a⁻ⁿ (ce que le نشاط a montré), puis les règles — le produit (les wagons se
 * suivent), le quotient (B retourné, les « × » et « ÷ » s'annulent), la puissance d'une puissance et d'un produit (en écrivant les
 * facteurs). Les règles des puissances de 10 (درس de la même unité) sont RAPPELÉES (« تذكّر »), jamais reconstruites. LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) remplacent celles des étapes ci-dessous ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('power-train').enabled;
  const doneCp = (id, level) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id && (!level || e.level === level));
  const onCheckpoint = (level) => (e) => setCps((l) => [...l, { ...e, level }]);
  const Trace = ({ id, ok, done, todo }) => (
    <p data-checkpoint-trace={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const solved = (task) => trials.find((e) => e.kind === 'release' && e.world === 'couple' && e.task === task && e.ok);
  const s0 = solved(0);
  const s2 = solved(2);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نكتب ما يحمله القطار؟', 'ماذا يحدث للأسس حين نربط قطارين؟', 'وحين نقسم قطارًا على آخر؟', 'كيف نحسب قوة قوة وقوة جداء؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — قواعد الحساب على القوى"
      moduleSubtitle="قطاران موصولان"
      estimatedTime="13 دقيقة"
      intro={<Manipulation type="power-train" world={LAB.couple.world} base={LAB.couple.base} tasks={LAB.couple.tasks} levels={false} onTrial={record} onCheckpoint={onCheckpoint('couple')} />}
      steps={[
        {
          num: 1, title: 'كيف نكتب ما يحمله القطار؟', subtitle: 'الأساس والأس', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>قطار فيه أربع عربات، كل واحدة تضرب الحمولة في <Ltr>-3</Ltr> . أيّ كتابة تعبّر عمّا يحمله؟</span>}
                options={[M('$(-3)^4$'), M('$-3^4$'), M('$4 \\times (-3)$')]}
                correct={0} cols={3} requires={['quwa-salib']}
                explain={<MathText>{'أربعة عوامل كل منها $-3$ : $(-3)^4 = 81$ . أمّا $-3^4 = -81$ فالأس فيه يخصّ 3 وحده، و $4 \\times (-3) = -12$ جمع لا ضرب.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.a && <TextbookBox kind="property" compact text={KNOWLEDGE.sign.text} source={KNOWLEDGE.sign.source} />}
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.zero.text} source={KNOWLEDGE.zero.source} />}
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.inverse.text} source={KNOWLEDGE.inverse.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا صار أس القطار الموصول 7؟', subtitle: 'جداء قوتين', done: (cpOn ? doneCp('c0') : !!q.b),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="couple" ok={!!s0}
                done={<span>ربطتَ القطار أ (<Ltr>3</Ltr> عربات) بالقطار ب (<Ltr>{s0?.n}</Ltr> عربات) فصار أس القطار الموصول <Ltr>{s0?.exponent}</Ltr> .</span>}
                todo="أنجز المهمة الأولى في المختبر أعلاه (القطار الموصول أسّه 7)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="c0" ok={doneCp('c0')}
                  done={<MathText>{'أجبتَ في المختبر: قطار أسّه 3 ربطتَه بقطار أسّه 4 فصار أسّ الموصول 7 ، لأنّ العربات تتتابع فتُجمع الأسّان.'}</MathText>}
                  todo="أنجز المهمة الأولى في المختبر أعلاه (القطار الموصول أسّه 7)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>عربات القطار أ ثم عربات القطار ب تتتابع في القطار الموصول. ماذا يساوي <MathText>{'$2^3 \\times 2^4$'}</MathText> ؟</span>}
                  options={[M('$2^{7}$ : ثلاثة عوامل ثم أربعة عوامل'), M('$2^{12}$ : نضرب الأسين'), M('$4^{7}$ : نضرب الأساسين')]}
                  correct={0} cols={1} requires={['quwa-taarif']}
                  explain={<MathText>{`${GUIDE.product.why} ${GUIDE.product.right}`}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {(cpOn ? doneCp('c0') : !!q.b) && <KnowledgeBrick id="jidaa-quwatayn" lead="قطار أسّه m وقطار أسّه n : ما أس القطار الموصول؟" />}
              {(cpOn ? doneCp('c0') : !!q.b) && <TextbookBox kind="remark" compact title={RECALL_TEN.title} text={RECALL_TEN.text} source={RECALL_TEN.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا بقي الأس 2 بعد القسمة؟', subtitle: 'حاصل قسمة قوتين', done: (cpOn ? doneCp('c2') : !!q.c),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="divide" ok={!!s2}
                done={<span>قسمتَ القطار أ (<Ltr>5</Ltr> عربات) على القطار ب (<Ltr>{s2?.n}</Ltr> عربات) فصار أس الناتج <Ltr>{s2?.exponent}</Ltr> .</span>}
                todo="أنجز المهمة الثالثة في المختبر أعلاه (قسمة القطار أ على القطار ب)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="c2" ok={doneCp('c2')}
                  done={<MathText>{'أجبتَ في المختبر: قسمة قطار أسّه 5 على قطار أسّه 3 تعطي أسّ $5 - 3 = 2$ ، لأنّ كل عربة قسمة تلغي عربة ضرب.'}</MathText>}
                  todo="أنجز المهمة الثالثة في المختبر أعلاه (قسمة القطار أ على القطار ب)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>عند القسمة انقلبت عربات القطار ب الثلاث إلى عربات قسمة. لماذا بقي <MathText>{'$\\frac{2^5}{2^3} = 2^2$'}</MathText> ؟</span>}
                  options={[
                    M('لأنّ كل عربة قسمة ألغت عربة ضرب: بقيت $5 - 3 = 2$ عربتان'),
                    M('لأنّ $5 \\div 3$ يقارب 2'),
                    M('لأنّ القسمة تحذف دائمًا ثلاث عربات'),
                  ]}
                  correct={0} cols={1} requires={['jidaa-quwatayn']}
                  explain={<MathText>{'$\\frac{2^5}{2^3} = \\frac{2 \\times 2 \\times 2 \\times 2 \\times 2}{2 \\times 2 \\times 2} = 2^{5-3} = 2^2$ .'}</MathText>}
                  onAnswered={answered('c')}
                />
              )}
              {(cpOn ? doneCp('c2') : !!q.c) && <KnowledgeBrick id="hasil-quwatayn" lead="قطار أسّه m مقسوم على قطار أسّه n : ما أس الناتج؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'كم عاملًا في قوة قوة؟', subtitle: 'قوة قوة', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span><MathText>{'$(2^3)^2 = 2^3 \\times 2^3$'}</MathText> . على شكل قوة واحدة:</span>}
                options={[M('$2^{6}$'), M('$2^{5}$'), M('$2^{9}$')]}
                correct={0} cols={3} requires={['jidaa-quwatayn']}
                explain={<MathText>{'مرّتان ثلاثة عوامل: $2^{3+3} = 2^{3 \\times 2} = 2^6$ . ($2^5$ جمع الأسين $3 + 2$ ، و $2^9 = 2^{3^2}$ .)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <KnowledgeBrick id="quwat-quwa" lead="n مرّة m عاملًا: كم عاملًا في المجموع؟" />}
            </div>
          ),
        },
        {
          num: 5, title: 'كيف نرتّب عوامل قوة جداء؟', subtitle: 'قوة جداء', done: !!q.e,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span><MathText>{'$(2 \\times 5)^3 = (2 \\times 5) \\times (2 \\times 5) \\times (2 \\times 5)$'}</MathText> . نرتّب العوامل:</span>}
                options={[M('$2^3 \\times 5^3 = 1000$'), M('$2 \\times 5^3 = 250$'), M('$2^3 \\times 5 = 40$')]}
                correct={0} cols={1} requires={['quwat-quwa']}
                explain={<MathText>{'ثلاثة عوامل 2 وثلاثة عوامل 5 : $2^3 \\times 5^3 = 8 \\times 125 = 1000 = 10^3$ .'}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && <KnowledgeBrick id="quwat-jidaa" lead="الأس يوزَّع على كل عامل: ماذا يساوي $(a \\times b)^n$ ؟" />}
              {q.e && <TextbookBox kind="property" compact lines={[KNOWLEDGE.rules.text, ...KNOWLEDGE.rules.lines]} source={KNOWLEDGE.rules.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
