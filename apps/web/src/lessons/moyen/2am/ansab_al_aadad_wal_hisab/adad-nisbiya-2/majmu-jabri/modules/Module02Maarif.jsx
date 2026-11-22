import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, RECALL_JAM } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `tug-rope`, posé seul `levels={false}`, une chaîne de quatre termes : (−11)−(+6)−(−9)−(+4)). Chaque encadré NOMME ce que l'élève vient de faire
 * (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : le mot « مجموع جبري », « نقل الحدود وتجميعها », la convention de l'écriture simplifiée, les parenthèses d'abord. Un rappel AVEC lien
 * (« تذكّر — جمع وطرح عددين », `jam-tarh-nisbiya`, PUBLIÉE : les deux règles d'addition et la soustraction). LP : P1, P2, P3.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

const RecallLink = ({ lesson, children }) => {
  const to = getLessonPath(lesson);
  return to ? <Link to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{children}</Link> : null;
};

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const mark = trials.findLast((e) => e.kind === 'answer' && e.ok && e.task === 0);
  const inLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm1');
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ماذا نسمّي هذه السلسلة؟', 'هل يمكن تغيير ترتيب الحدود؟', 'كيف أكتب المجموع الجبري مبسّطًا؟', 'ماذا نفعل بالأقواس؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المجموع الجبري"
      moduleSubtitle="الحبل بسلسلة جديدة"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="tug-rope" tasks={LAB.alone.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'ماذا نسمّي هذه السلسلة؟', subtitle: 'المجموع الجبري', done: inLab,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="chain" ok={inLab}
                done={<span>في <Ltr>(−11)−(+6)−(−9)−(+4)</Ltr> استدار الطفلان المسبوقان بـ − وتوقّف الشريط عند <Ltr>{mark?.value ?? '−12'}</Ltr> .</span>}
                todo="أنجز السلسلة في المختبر أعلاه، وأجب عن السؤال الذي يظهر فوقه." />
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.definition.text} source={KNOWLEDGE.definition.source} />}
              {inLab && (
                <TextbookBox kind="remark" title={RECALL_JAM.title} text={RECALL_JAM.text} source={RECALL_JAM.source} compact>
                  <RecallLink lesson={RECALL_JAM.lesson}>درس « جمع وطرح عددين نسبيين »</RecallLink>
                </TextbookBox>
              )}
              {inLab && <KnowledgeBrick id="taarif-majmu-jabri" lead="ماذا نسمّي سلسلة جمع وطرح لأعداد نسبية؟" requires={['tarh-ila-jam']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'هل يهمّ الترتيب؟', subtitle: 'النقل والتجميع', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.move.text} source={KNOWLEDGE.move.source} />}
              {inLab && <TextbookBox kind="example" compact text={KNOWLEDGE.move.example} source={KNOWLEDGE.move.source} />}
              {inLab && <KnowledgeBrick id="naql-tajmi" lead="هل يتغيّر المجموع الجبري إذا غيّرنا ترتيب حدوده؟" requires={['taarif-majmu-jabri']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'كيف أكتبه أخفّ؟', subtitle: 'الكتابة المبسّطة', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.simplified.text} source={KNOWLEDGE.simplified.source} />}
              {inLab && <TextbookBox kind="example" compact text={KNOWLEDGE.simplified.example} source={KNOWLEDGE.simplified.source} />}
              {inLab && <KnowledgeBrick id="kitaba-mubassata" lead="كيف نكتب مجموعًا جبريًا بلا أقواس العدد ولا إشارة الجمع؟" requires={['naql-tajmi']} />}
            </div>
          ),
        },
        {
          num: 4, title: 'وإذا وُجدت أقواس؟', subtitle: 'ما بينها أوّلًا', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.brackets.text} source={KNOWLEDGE.brackets.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
