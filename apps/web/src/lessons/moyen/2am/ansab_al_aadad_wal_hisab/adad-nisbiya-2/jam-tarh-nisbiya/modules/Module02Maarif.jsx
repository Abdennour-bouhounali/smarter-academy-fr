import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `balloon-ballast`, posé seul `levels={false}`, deux cartes : (−8)+(+3) puis (+4)−(−6)). Chaque encadré NOMME ce que l'élève vient de faire
 * (question → encadré → brique), avec les mots de la plateforme (guide §4ter-bis) : la règle du même signe, des signes différents, des opposés, puis « soustraire c'est ajouter l'opposé » et les mots
 * « مجموع / فرق ». LP : P1, P2, P3.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const sum = trials.findLast((e) => e.kind === 'answer' && e.ok && e.task === 0);
  const inLab1 = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm1');
  const inLab2 = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm2');
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف أجمع عددين نسبيين؟', 'ماذا يساوي مجموع عددين متعاكسين؟', 'كيف أطرح عددًا نسبيًا؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الجمع والطرح"
      moduleSubtitle="المنطاد ببطاقتين جديدتين"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="balloon-ballast" tasks={LAB.maarif.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'ما قاعدة الجمع؟', subtitle: 'حالتان', done: inLab1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="sum" ok={inLab1}
                done={<span>جمعتَ <Ltr>−8</Ltr> و <Ltr>+3</Ltr> : تقابلت ثلاثة أزواج وبقيت خمسة أكياس، فبلغ المنطاد <Ltr>{sum?.value ?? '−5'}</Ltr> .</span>}
                todo="أنجز البطاقة الأولى في المختبر أعلاه، وأجب عن السؤال الذي يظهر فوقه." />
              {inLab1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.same.text} source={KNOWLEDGE.same.source} />}
              {inLab1 && <TextbookBox kind="example" compact text={KNOWLEDGE.same.example} source={KNOWLEDGE.same.source} />}
              {inLab1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.different.text} source={KNOWLEDGE.different.source} />}
              {inLab1 && <TextbookBox kind="example" compact text={KNOWLEDGE.different.example} source={KNOWLEDGE.different.source} />}
              {inLab1 && <KnowledgeBrick id="qaidat-jam" lead="كيف نجمع عددين نسبيين حسب إشارتيهما؟" requires={['jam-ishara-mukhtalifa']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا يساوي مجموع متعاكسين؟', subtitle: 'الصفر', done: inLab1,
          content: (
            <div className="space-y-3">
              {inLab1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.opposites.text} source={KNOWLEDGE.opposites.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ما قاعدة الطرح؟', subtitle: 'جمع المعاكس', done: inLab2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="diff" ok={inLab2}
                done={<span>طرحتَ <Ltr>−6</Ltr> من <Ltr>+4</Ltr> : ربطتَ زوجًا محايدًا بعد زوج ثم رميتَ ستة أكياس، فارتفع المنطاد إلى <Ltr>+10</Ltr> .</span>}
                todo="أنجز البطاقة الثانية في المختبر أعلاه (اكتب توقّعك ثم نفّذ)، وأجب عن السؤال الذي يظهر فوقه." />
              {inLab2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.subtract.text} source={KNOWLEDGE.subtract.source} />}
              {inLab2 && <TextbookBox kind="example" compact text={KNOWLEDGE.subtract.example} source={KNOWLEDGE.subtract.source} />}
              {inLab2 && <KnowledgeBrick id="qaidat-tarh" lead="كيف نطرح عددًا نسبيًا؟" requires={['tarh-bi-muakis']} />}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا نسمّي ناتج كلّ عملية؟', subtitle: 'المجموع والفرق', done: inLab2,
          content: (
            <div className="space-y-3">
              {inLab2 && <TextbookBox kind="definition" compact text={KNOWLEDGE.names.text} source={KNOWLEDGE.names.source} />}
              {inLab2 && <KnowledgeBrick id="majmu-wa-farq" lead="ماذا نسمّي ناتج الجمع وناتج الطرح؟" requires={['qaidat-tarh']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
