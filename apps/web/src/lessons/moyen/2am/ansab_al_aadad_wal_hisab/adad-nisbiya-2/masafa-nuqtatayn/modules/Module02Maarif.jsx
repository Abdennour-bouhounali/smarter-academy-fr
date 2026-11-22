import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_JAM, RECALL_CMP } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `gap-caliper`, posé seul `levels={false}`) : le compas est serré sur A(−4) et l'élève l'ouvre jusqu'à B(+3). Chaque encadré NOMME ce que
 * l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : d'abord DEUX rappels AVEC lien (« تذكّر — الطرح » → `jam-tarh-nisbiya`, « تذكّر — المقارنة » →
 * `muqarana-nisbiya`, deux leçons PUBLIÉES de l'unité), puis la règle (la Fasila la plus grande moins la plus petite), la remarque (positive, AB = BA) et l'exemple. LP : P1, P2.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

const RecallLink = ({ lesson, children }) => {
  const to = getLessonPath(lesson);
  return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{children}</Link> : null;
};

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const mark = trials.findLast((e) => e.kind === 'say' && e.ok);
  const inLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm1');
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['من أيّ الفاصلتين نطرح؟', 'لماذا المسافة موجبة دائمًا؟', 'هل تتغيّر المسافة إذا بدّلنا النقطتين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — قاعدة المسافة"
      moduleSubtitle="الفاصلة الكبرى ناقص الصغرى"
      estimatedTime="10 دقائق"
      intro={<Manipulation type="gap-caliper" tasks={LAB.maarif.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'كيف نسمّي ما فعلتَه؟', subtitle: 'قاعدة المسافة', done: inLab,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="open" ok={inLab && !!mark}
                done={<span>المسماك المشدود على <Ltr>A(−4)</Ltr> لمس <Ltr>B(+3)</Ltr> بفتحة <Ltr>{mark?.value}</Ltr> .</span>}
                todo="أنجز المهمة في المختبر أعلاه (افتح المسماك بين A وB)، وأجب عن الأسئلة التي تظهر فوقه." />
              {inLab && (
                <TextbookBox kind="remark" title={RECALL_JAM.title} text={RECALL_JAM.text} source={RECALL_JAM.source} compact>
                  <RecallLink lesson={RECALL_JAM.lesson}>درس « جمع وطرح عددين نسبيين »</RecallLink>
                </TextbookBox>
              )}
              {inLab && (
                <TextbookBox kind="remark" title={RECALL_CMP.title} text={RECALL_CMP.text} source={RECALL_CMP.source} compact>
                  <RecallLink lesson={RECALL_CMP.lesson}>درس « مقارنة وترتيب أعداد نسبية »</RecallLink>
                </TextbookBox>
              )}
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.rule.text} source={KNOWLEDGE.rule.source} />}
              {inLab && <TextbookBox kind="example" compact text={KNOWLEDGE.rule.example} source={KNOWLEDGE.rule.source} />}
              {inLab && <KnowledgeBrick id="taarif-masafa" lead="كيف نسمّي العددين اللذين نطرح أحدهما من الآخر؟" requires={['qaidat-masafa']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'هل يمكن أن تكون المسافة سالبة؟', subtitle: 'موجبة دائمًا', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="remark" compact text={KNOWLEDGE.positive.text} source={KNOWLEDGE.positive.source} />}
              {inLab && <TextbookBox kind="remark" compact text={KNOWLEDGE.atDistance.text} source={KNOWLEDGE.atDistance.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
