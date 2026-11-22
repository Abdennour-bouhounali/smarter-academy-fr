import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : « شدّ الحبل ». UNE SEULE PISTE (§4quater) : le labo `tug-rope` en haut, sans carte au-dessus — il porte son
 * contexte et SA question ; la main tient l'ÉQUIPE de chaque terme (retourner celui que précède « − », puis l'envoyer à gauche ou à droite).
 *   مبتدئ — t1 (+7)+(−3)+(+5)+(−6), t2 (−8)−(+3)+(−6)−(−5), t3 (+5)+(−7)+(−5)+(+7)+(−3) : des chaînes d'ENTIERS ;
 *   متقدم — a1 une chaîne décimale, a2 un crochet réglé d'abord, a3 la forme simplifiée −15+4+8+3 : la position est écrite AVANT de siffler.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES essais. Les noms (briques) viennent APRÈS la réponse. Le نشاط 6 du manuel est posé en application au module 4.
 * Prototype (2026-10-28) : les questions sont posées PAR-DESSUS le labo après chaque tâche (`TugRope › CHAINS`) ; les étapes en gardent la TRACE (`checkpoint-done` de t1, t2, t3, a1, a2, a3) puis posent les noms.
 */
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => setTrials((list) => [...list, e]);
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const okValue = (task) => trials.findLast((e) => e.kind === 'answer' && e.ok && e.task === task)?.value;
  const q1 = answered('t1');
  const q2 = answered('t2');
  const q3 = answered('t3');
  const q4 = answered('a1');
  const q5 = answered('a2');
  const q6 = answered('a3');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كيف أحصل على موضع الشريط من الفريقين؟', 'ماذا يفعل الطفل الذي تسبقه إشارة −؟', 'متى يتعادل طفلان؟', 'هل يهمّ ترتيب الأطفال؟', 'كيف أحسب ما بين القوسين؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — شدّ الحبل"
      moduleSubtitle="فريقان وشريط وأطفال بصدريات"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="tug-rope" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="tug-rope" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كيف توقّف الشريط؟', subtitle: 'قوّة كلّ فريق', done: q1,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="teams" ok={q1}
                done={<span>وزّعتَ أطفال <Ltr>(+7)+(−3)+(+5)+(−6)</Ltr> على الفريقين: الأيمن يجرّ <Ltr>12</Ltr> والأيسر <Ltr>9</Ltr> ، فتوقّف الشريط عند <Ltr>{okValue(0) ?? '3'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ السلسلة الأولى، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q1 && <KnowledgeBrick id="tajmi-hudud" lead="كيف حصلتَ على موضع الشريط من قوّتي الفريقين؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا فعل من سبقته إشارة −؟', subtitle: 'يستدير', done: q2,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="turn" ok={q2}
                done={<span>في <Ltr>(−8)−(+3)+(−6)−(−5)</Ltr> استدار طفلان: صارت صدريتاهما <Ltr>−3</Ltr> و <Ltr>+5</Ltr> ، فتوقّف الشريط عند <Ltr>{okValue(1) ?? '−12'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ السلسلة الثانية، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q2 && <KnowledgeBrick id="tarh-ila-jam" lead="ماذا نفعل بكلّ طرح قبل أن نحسب؟" requires={['tajmi-hudud']} />}
            </div>
          ),
        },
        {
          num: 3, title: 'من تعادل على الحبل؟', subtitle: 'أزواج متعاكسة', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cancel" ok={q3}
                done={<span>في <Ltr>(+5)+(−7)+(−5)+(+7)+(−3)</Ltr> تعادل الطفلان <Ltr>+5</Ltr> و <Ltr>−5</Ltr> وكذلك <Ltr>+7</Ltr> و <Ltr>−7</Ltr> ، فبقي <Ltr>{okValue(2) ?? '−3'}</Ltr> .</span>}
                todo="أنجز في المستوى المبتدئ السلسلة الثالثة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q3 && <KnowledgeBrick id="hadhf-mutaakisayn" lead="ماذا يحدث لطفلين بصدريتين متعاكستين؟" requires={['tajmi-hudud']} />}
            </div>
          ),
        },
        {
          num: 4, title: 'هل يهمّ الترتيب؟', subtitle: 'أعداد عشرية', done: q4,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="order" ok={q4}
                done="كتبتَ موضع الشريط قبل أن تبدأ بسلسلة فيها أعداد عشرية، ثم أرسلتَ الأطفال فتطابق الموضع مع ما توقّعتَ."
                todo="أنجز في المستوى المتقدّم السلسلة الأولى، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 5, title: 'ماذا فعل فريق القوسين؟', subtitle: 'الأقواس أوّلًا', done: q5,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="group" ok={q5}
                done={<span>في <Ltr>(+12)−[(−6)−(−2)+(+9)]</Ltr> تجاذب الفريق الصغير أوّلًا وصار طفلًا واحدًا عند <Ltr>+5</Ltr> ، ثم طُرح من <Ltr>+12</Ltr> فكان الناتج <Ltr>+7</Ltr> .</span>}
                todo="أنجز في المستوى المتقدّم السلسلة الثانية، وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 6, title: 'كيف أحسب بلا أطفال؟', subtitle: 'كتابة مبسّطة', done: q6,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="rule" ok={q6}
                done={<span>في <Ltr>−15+4+8+3</Ltr> جمعتَ الموجبة <Ltr>4+8+3=15</Ltr> والسالبة <Ltr>−15</Ltr> فتعادل الفريقان عند <Ltr>0</Ltr> .</span>}
                todo="أنجز في المستوى المتقدّم السلسلة الثالثة، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {q6 && <KnowledgeBrick id="qaidat-majmu-jabri" lead="كيف أحسب مجموعًا جبريًا دون حبل؟" requires={['tarh-ila-jam']} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
