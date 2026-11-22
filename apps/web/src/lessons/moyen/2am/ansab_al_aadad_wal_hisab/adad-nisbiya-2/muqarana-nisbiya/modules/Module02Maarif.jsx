import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, GUIDE } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `zero-probe`, posé seul `levels={false}`) : insérer le capteur B ENTRE
 * deux nombres, côté libre (−7 < B < −5 puis 3 < B < 6). Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique),
 * avec les mots de la plateforme (guide §4ter-bis) : les trois propriétés de la comparaison (ce que le نشاط a montré), l'ordre
 * تصاعدي / تنازلي avec < et >, puis un nombre entre deux nombres. LP : P1–P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const solved = (task) => trials.findLast((e) => e.kind === 'release' && e.tk === 'between' && e.task === task && e.ok);
  const s0 = solved(0);
  const s1 = solved(1);
  // « pourquoi −8 ne convient pas » est posée PAR-DESSUS le labo (`ZeroProbe › QUESTIONS.outside`, tâche z0) : l'étape 1 en garde la TRACE
  const inLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'z0');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا يصلح عدد ولا يصلح غيره بين عددين؟', 'كيف نكتب الترتيب التصاعدي والتنازلي؟', 'هل يوجد دائمًا عدد بين عددين مختلفين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الترتيب وعدد بين عددين"
      moduleSubtitle="المسبار بين عددين"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="zero-probe" tasks={LAB.insert.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'لماذا لا يصلح −8 بين −7 و −5 ؟', subtitle: 'مقارنة سالبين', done: inLab,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="neg" ok={inLab && !!s0}
                done={<span>أجبتَ في المختبر: وضعتَ B عند <Ltr>{s0?.value}</Ltr> بين <Ltr>-7</Ltr> و <Ltr>-5</Ltr> ، و <Ltr>-8</Ltr> لا يصلح لأنّه أبعد عن الصفر من <Ltr>-7</Ltr> ، فهو أصغر منه.</span>}
                todo="أنجز المهمة الأولى في المختبر أعلاه (B بين −7 و −5)، وأجب عن الأسئلة التي تظهر فوقه." />
              {inLab && <TextbookBox kind="property" compact lines={[KNOWLEDGE.negatives.text, KNOWLEDGE.positives.text, KNOWLEDGE.different.text]} source={KNOWLEDGE.negatives.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نكتب الترتيب بالرمزين < و > ؟', subtitle: 'تصاعدي وتنازلي', done: !!q.b,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="pos" ok={!!s1}
                done={<span>وضعتَ B عند <Ltr>{s1?.value}</Ltr> بين <Ltr>3</Ltr> و <Ltr>6</Ltr> .</span>}
                todo="أنجز المهمة الثانية في المختبر أعلاه (B بين 3 و 6)، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<span>الأعداد <Ltr>-7</Ltr> و <Ltr>-6</Ltr> و <Ltr>-5</Ltr> مرتّبة من الأعلى إلى الأخفض. أيّ كتابة تعبّر عن ذلك؟</span>}
                options={[M('$-5 > -6 > -7$'), M('$-5 < -6 < -7$'), M('$-7 > -6 > -5$')]}
                correct={0} cols={1} requires={['salibayn']}
                explain={<MathText>{'الترتيب التنازلي يكتب الأكبر أوّلًا ويفصل بين الأعداد بالرمز $>$ : $-5 > -6 > -7$ .'}</MathText>}
                onAnswered={answered('b')}
              />
              {q.b && <TextbookBox kind="definition" compact text={KNOWLEDGE.order.text} source={KNOWLEDGE.order.source} />}
              {q.b && <TextbookBox kind="example" compact text={KNOWLEDGE.order.example} source={KNOWLEDGE.order.source} />}
              {q.b && <KnowledgeBrick id="tartib" lead="من الأصغر إلى الأكبر: ماذا نسمّي هذا الترتيب؟ وبأيّ رمز؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'هل يوجد دائمًا عدد بين عددين؟', subtitle: 'عدد بين −4,5 و −4,3', done: !!q.c,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ هذه الأعداد يقع بين <Ltr>-4,5</Ltr> و <Ltr>-4,3</Ltr> ؟</span>}
                options={[M('$-4{,}4$'), M('$-4{,}6$'), M('$-4{,}2$')]}
                correct={0} cols={3} requires={['tartib']}
                explain={<MathText>{'$-4{,}5 < -4{,}4 < -4{,}3$ . ($-4{,}6$ أبعد عن الصفر من $-4{,}5$ ، و $-4{,}2$ أقرب إلى الصفر من $-4{,}3$ .)'}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.between.text} source={KNOWLEDGE.between.source} />}
              {q.c && <KnowledgeBrick id="hasr" lead="بين عددين مختلفين: هل يوجد دائمًا عدد ثالث؟" />}
              {q.c && <p className="text-xs text-slate-500"><MathText>{GUIDE.decimals.right}</MathText></p>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
