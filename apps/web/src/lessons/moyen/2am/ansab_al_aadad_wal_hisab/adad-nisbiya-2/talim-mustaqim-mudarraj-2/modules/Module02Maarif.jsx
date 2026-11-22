import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, KNOWLEDGE, REMINDER } from '../content/textbook';

/**
 * Module 2 — معارف : le module s'ouvre sur un labo (le MÊME type `corniche-ruler`, posé seul `levels={false}`) : le drapeau est sous le banc (−20 m) et l'élève écrit
 * les fonctions du lampadaire, du palmier et de l'arrêt de bus. Chaque encadré NOMME ce que l'élève vient de faire (question → encadré → brique), avec les mots de la plateforme
 * (guide §4ter-bis) : d'abord « تذكّر — السنة الأولى » (SANS lien : la leçon 1AM n'est pas générée), puis l'abscisse et la notation A(−3), la distance à zéro, les opposés. LP : P1, P2.
 * Le labo du niveau fixe la graduation à 10 m (le plan prévoyait 5 : les mêmes nombres −20, +40, −15).
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module02Maarif() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const readOk = (landmark) => trials.findLast((e) => e.kind === 'read' && e.ok && e.landmark === landmark);
  const lamp = readOk('lamp');
  const palm = readOk('palm');
  const bus = readOk('bus');
  const inLab = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'm1');
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف نسمّي العدد الذي يدلّ على موضع نقطة؟', 'ما المسافة إلى الصفر؟', 'ماذا نسمّي عددين لهما المسافة نفسها إلى الصفر وإشارتان مختلفتان؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الفاصلة والعددان المتعاكسان"
      moduleSubtitle="المسطرة بمبدأ جديد"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="corniche-ruler" tasks={LAB.maarif.tasks} levels={false} onTrial={record} />}
      steps={[
        {
          num: 1, title: 'ماذا نسمّي العدد الذي كتبتَه؟', subtitle: 'الفاصلة', done: inLab,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="read" ok={inLab && !!lamp && !!palm && !!bus}
                done={<span>الصفر عند المقعد: فاصلة عمود الإنارة <Ltr>{lamp?.value}</Ltr> ، والنخلة <Ltr>{palm?.value}</Ltr> ، وموقف الحافلة <Ltr>{bus?.value}</Ltr> .</span>}
                todo="أنجز المهمة في المختبر أعلاه (اكتب ثلاث فواصل)، وأجب عن الأسئلة التي تظهر فوقه." />
              {inLab && <TextbookBox kind="remark" title="تذكّر — السنة الأولى" compact text={REMINDER.text} source={REMINDER.source} />}
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.abscissa.text} source={KNOWLEDGE.abscissa.source} />}
              {inLab && <TextbookBox kind="example" compact text={KNOWLEDGE.abscissa.example} source={KNOWLEDGE.abscissa.source} />}
              {inLab && <KnowledgeBrick id="tarif-faasila" lead="ماذا نسمّي هذا العدد؟ وكيف نكتب نقطة مع فاصلتها؟" requires={['faasila']} />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما المسافة بين النخلة والمبدأ؟', subtitle: 'المسافة إلى الصفر', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.distance.text} source={KNOWLEDGE.distance.source} />}
              {inLab && <KnowledgeBrick id="masafa-ila-sifr" lead="كم تبعد النخلة عن دبّوس الصفر؟ وهل المسافة سالبة؟" requires={['tarif-faasila']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا نسمّي عددين لهما المسافة نفسها؟', subtitle: 'المتعاكسان', done: inLab,
          content: (
            <div className="space-y-3">
              {inLab && <TextbookBox kind="definition" compact text={KNOWLEDGE.opposites.text} source={KNOWLEDGE.opposites.source} />}
              {inLab && <KnowledgeBrick id="mafhum-mutaakisan" lead="فاصلتان لهما المسافة نفسها وإشارتان مختلفتان: ماذا نسمّيهما؟" requires={['masafa-ila-sifr']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
