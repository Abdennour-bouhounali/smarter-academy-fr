import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type, monde `prefixes`, posé seul `levels={false}`) : la même lentille, mais la carte est une
 * UNITÉ (كيلومتر, ميليمتر, ميكرومتر, نانومتر, ميغامتر) et la plaque en écrit le nom. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré →
 * brique), avec les mots de la plateforme (guide §4ter-bis) : la définition de 10ⁿ et de 10⁰ (ce que l'نشاط a montré), 10⁻ⁿ, puis les noms et les
 * préfixes. Aucune règle des produits ni des quotients de puissances (leçon suivante). LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const solved = (task) => trials.find((e) => e.kind === 'solved' && e.task === task && !e.free);
  const micro = solved('p3');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نكتب $10^n$ ونقرؤه؟', 'ما $10^{-n}$ ؟', 'ما أسماء القوى وبادئات الوحدات؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الأسماء والبادئات"
      moduleSubtitle="العدسة نفسها: كيلو وميلي وميكرو ونانو"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="ten-zoom" world="prefixes" levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'كيف نكتب القوة ونقرؤها؟', subtitle: 'الأس الموجب', done: !!q.a,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>ما الكتابة العشرية لـ <MathText>{'$10^{7}$'}</MathText> ؟</span>}
                options={[M('$10\\,000\\,000$'), M('$70$'), M('$1\\,000\\,000$')]}
                correct={0} cols={3} requires={['ashara-taarif']}
                explain={<MathText>{'سبعة عوامل كلّها 10 : الرقم 1 متبوعًا بسبعة أصفار. أمّا $70 = 10 \\times 7$ فهو جداء، و $1\\,000\\,000$ فيه ستة أصفار فقط.'}</MathText>}
                onAnswered={answered('a')}
              />
              {q.a && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {q.a && <TextbookBox kind="remark" compact text={`${KNOWLEDGE.definition.example} ${KNOWLEDGE.zero.text}`} source={KNOWLEDGE.zero.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما الأس الذي يوافق جزءًا صغيرًا؟', subtitle: 'الأس السالب', done: !!q.b,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span><MathText>{'$0{,}00001 = 10^{?}$'}</MathText> . الأس هو:</span>}
                options={[M('$-5$'), M('$-4$'), M('$5$')]}
                correct={0} cols={3} requires={['ashara-salib']}
                explain={<MathText>{'الرقم 1 في الرتبة الخامسة بعد الفاصلة، إذن $0{,}00001 = 10^{-5}$ . ($-4$ يعدّ الأصفار بعد الفاصلة، و $5$ موجب فيعني $100\\,000$ .)'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.inverse.text} source={KNOWLEDGE.inverse.source} />}
              {q.b && <TextbookBox kind="remark" compact text={KNOWLEDGE.inverse.example} source={KNOWLEDGE.inverse.source} />}
              {q.b && <TextbookBox kind="property" compact text={KNOWLEDGE.table.text} lines={KNOWLEDGE.table.lines} source={KNOWLEDGE.table.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم ميكرومترًا في المتر؟', subtitle: 'نزول ست درجات', done: !!q.c,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="micro" ok={!!micro}
                done={<span>للوصول إلى الميكرومتر أدرتَ الحلقة <Ltr>{micro ? Math.abs(micro.n) : ''}</Ltr> نقرات تصغير، وقرأتَ على اللوحة <Ltr>0,000001</Ltr> م.</span>}
                todo="أنجز في المختبر أعلاه المهمة الثالثة (ميكرومتر)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>الميكرومتر الواحد <MathText>{'$= 10^{-6}$'}</MathText> م. كم ميكرومترًا في المتر الواحد؟</span>}
                options={[M('$1\\,000\\,000$'), M('$6$'), M('$0{,}000001$')]}
                correct={0} cols={3} requires={['ashara-salib']}
                explain={<MathText>{'المتر مليون ميكرومتر: $1 \\div 0{,}000001 = 1\\,000\\,000$ . ($6$ هو عدد النقرات، و $0{,}000001$ هو طول الميكرومتر نفسه.)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <KnowledgeBrick id="ashara-asma" lead="كيلو وميلي وميكرو ونانو: ما الذي تعدّه هذه البادئات؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ما قوة المليار؟', subtitle: 'أسماء القوى', done: !!q.d,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>المليار هو الرقم 1 متبوعًا بتسعة أصفار. المليار <MathText>{'$= 10^{?}$'}</MathText> :</span>}
                options={[M('$9$'), M('$12$'), M('$6$')]}
                correct={0} cols={3} requires={['ashara-asma']}
                explain={<MathText>{'تسعة أصفار بعد الرقم 1 ، إذن $10^9$ . ($10^{12}$ هو ألف مليار، و $10^6$ هو المليون.)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <TextbookBox kind="property" compact text={KNOWLEDGE.names.text} source={KNOWLEDGE.names.source} />}
              {q.d && <TextbookBox kind="property" compact text={KNOWLEDGE.prefixes.text} lines={KNOWLEDGE.prefixes.lines} source={KNOWLEDGE.prefixes.source} />}
              {q.d && <p className="text-sm text-slate-600"><MathText>{GUIDE.wihda.right}</MathText></p>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
