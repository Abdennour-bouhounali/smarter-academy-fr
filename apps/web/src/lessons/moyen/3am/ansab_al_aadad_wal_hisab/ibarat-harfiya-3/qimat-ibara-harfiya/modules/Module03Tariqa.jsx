import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, METHOD_VALUES } from '../content/textbook';

/**
 * Module 3 — طريقة « مثال مضاد أم نشر ؟ » (P3, P1). UNE SEULE PISTE (guide §4quater) : le MÊME labo que le module 1, posé SEUL en haut (`levels={false}`, monde
 * `twins`) — deux murs sous UN réservoir ; la main lâche des billes, compare les deux corbeilles et déclare « contre-exemple » ou « égales » (le juge refuse un accord
 * de valeurs, et « انشر » montre la forme réduite de chaque mur). Puis l'élève répond sur ce qu'il a fait (paires `tw1`, `tw2`, `tw3` de `logic/marbleRun.js › TWIN_TASKS`),
 * lit la méthode ligne à ligne (la brique est gardée par « أتوقّع القاعدة »), puis un transfert.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`MarbleRun › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q4, setQ4] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['متى تكفي قيمة واحدة؟', 'ماذا يثبت تساوي القيم؟', 'كيف أثبت التساوي؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — مثال مضاد أم نشر؟"
      moduleSubtitle="مساران متوأمان"
      estimatedTime="14 دقيقة"
      intro={<Manipulation type="marble-run" levels={false} world="twins" onTrial={record} />}
      steps={[
        {
          num: 1, title: 'هل تكفي كرية واحدة؟', subtitle: 'الزوج الأول', done: answered('tw1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="tw1" ok={answered('tw1')}
                done={<MathText>{'أجبتَ في المختبر: كرية واحدة فرّقت بين $(x+2)(x+3)$ و $x^2+6$ ، فهي مثال مضاد.'}</MathText>}
                todo="احكم على الزوج الأول (أسقِط كريات وقارن السلّتين)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 2, title: 'تساوتا مرّتين، فماذا نستنتج؟', subtitle: 'الزوج الثاني', done: answered('tw2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="tw2" ok={answered('tw2')}
                done={<MathText>{'أجبتَ في المختبر: تساوت السلّتان عند $x=0$ و $x=1$ ثم اختلفتا: تساوي بعض القيم لا يثبت شيئًا.'}</MathText>}
                todo="احكم على الزوج الثاني، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('tw2') && <KnowledgeBrick id="mithal-mudad" lead="قيم متساوية ثم قيمة تفرّق: ماذا تقول عن العبارتين؟" />}
              {answered('tw2') && <TextbookBox kind="property" compact text={KNOWLEDGE.counter.text} source={KNOWLEDGE.counter.source} />}
              {answered('tw2') && <TextbookBox kind="remark" compact text={KNOWLEDGE.noProof.text} source={KNOWLEDGE.noProof.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا لم نجد مثالًا مضادًا؟', subtitle: 'الزوج الثالث', done: answered('tw3'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="tw3" ok={answered('tw3')}
                done={<MathText>{'أجبتَ في المختبر: النشر أعطى $3x^2-3x-6$ للعبارتين، فهما متساويتان.'}</MathText>}
                todo="احكم على الزوج الثالث (انشر ثم قرّر)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 4, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثم مثال جديد', done: q4,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_VALUES} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="nashr-yuthbit" lead="القيم أبطلت المساواة الأولى والنشر أثبت الثانية: ما الخطوتان؟" />}
              <TapQuestion
                prompt={<MathText>{String.raw`عند $x=2$ تساوت قيمتا $(x+3)(x-1)$ و $x^2+2x-3$ (القيمة $5$ في كليهما). ماذا نفعل لنحكم؟`}</MathText>}
                options={[
                  M('ننشر الجداء: $x^2-x+3x-3=x^2+2x-3$ فالعبارتان متساويتان'),
                  M('نكتفي بالقيمة $2$ فهي كافية'),
                  M('نقول إنّهما مختلفتان لأنّ الشكلين مختلفان'),
                ]}
                correct={0} cols={1} requires={['nashr-yuthbit']}
                explain={<MathText>{'اتفاق القيمتين من أجل قيمة واحدة لا يكفي؛ بعد النشر تظهر صورة واحدة للعبارتين: $x^2+2x-3$.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
