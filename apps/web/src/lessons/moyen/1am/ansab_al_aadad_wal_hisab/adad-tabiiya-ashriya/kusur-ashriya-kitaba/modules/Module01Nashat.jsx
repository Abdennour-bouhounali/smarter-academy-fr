import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : l'atelier de zellige. UNE SEULE PISTE
 * (§4quater) : le labo `decimal-comma` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient la VIRGULE.
 *   مبتدئ — les chiffres 2 3 5, puis 3 7, puis 0 5 : la table du client dit où la virgule doit tomber ;
 *   متقدم — le bon est un كسر عشري (3125/1000, 605/100), puis le zéro final de 2,50 = 2,5.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES chiffres : pourquoi les mêmes chiffres font d'autres quantités (P1/P2), combien
 * de carreaux dans 3 colonnes puis dans 2,35 (P1/P2), à quoi sert le 0 de 0,05 (P2), combien de chiffres après la virgule pour 3125/1000
 * (P2). Les noms (briques) viennent APRÈS la réponse. Les activités du manuel (نشاط 2 et 3) sont posées en application au module 5.
 * Déploiement du prototype (2026-10-28) : ces questions sont posées PAR-DESSUS le labo après chaque tâche (`DecimalComma › chainOf`, la
 * règle « ماذا يغيّر موضع الفاصلة؟ » clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms. La question
 * 3125/1000 (متقدم) reste posable ici pour qui n'a pas fait ce niveau.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q5, setQ5] = useState(false);
  // La demande libre (« جرّب أعدادك ») n'est jamais une preuve.
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); };
  const solved = (digits) => trials.some((e) => e.digits === digits && e.ok);
  const shownFor = (digits) => [...new Set(trials.filter((e) => e.digits === digits).map((e) => e.shown))];
  const tried235 = shownFor('235');
  // les questions posées PAR-DESSUS le labo : une suite est finie (`checkpoint-done`) juste après la réussite de SA tâche (ses chiffres)
  const answeredFor = (digits) => trials.some((e, j) => e.tk === 'checkpoint-done' && trials.slice(0, j).findLast((x) => !x.tk && x.ok)?.digits === digits);
  const a235 = answeredFor('235');
  const a05 = answeredFor('05');
  const a3125 = answeredFor('3125');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا تغيّر الطلبية والأرقام نفسها؟', 'كم بلاطة في كسر عشري؟', 'ما علاقة عدد الأرقام بعد الفاصلة بمقام الكسر؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — ورشة الزليج"
      moduleSubtitle="الأرقام نفسها وفاصلة تتحرّك"
      estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="decimal-comma" level="beginner" world="mosaic" tasks={LAB.mosaic.beginner} onTrial={record} />,
            advanced: () => <Manipulation type="decimal-comma" level="advanced" world="mosaic" tasks={LAB.mosaic.advanced} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'كم قطعة في الطلبية؟', subtitle: 'الأرقام 2 و 3 و 5 في لوحتك', done: a235,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="first-order" ok={a235}
                done={<span>أجبتَ في المختبر: صنع الحرفيّ <Ltr>2,35</Ltr> بعد أن جرّبتَ {tried235.map((s, i) => <span key={s}>{i > 0 && ' ، '}<Ltr>{s}</Ltr></span>)}؛ ومفكّكةً إلى بلاطات هي <Ltr>235</Ltr> جزءًا من مائة، والأعمدة الثلاثة <Ltr>30</Ltr> بلاطة.</span>}
                todo="اجعل الحرفيّ يصنع الطلبية الأولى (الأرقام 2 3 5)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {a235 && <KnowledgeBrick id="kasr-ashri" lead="العمود جزء من عشرة أجزاء متقايسة من اللوحة، والبلاطة جزء من مائة: كيف نكتب كلًّا منهما؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ما عمل الصفر في 0,05؟', subtitle: 'وماذا يغيّر موضع الفاصلة؟', done: a05,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="third-order" ok={a05}
                done={<span>أجبتَ في المختبر: في <Ltr>0,05</Ltr> يحفظ الصفر مكان الأعشار الفارغ — بدونه <Ltr>0,5</Ltr> عشر مرّات أكبر؛ وكل خطوة للفاصلة نحو اليمين تجعل القطعة أصغر بعشر مرّات.</span>}
                todo="أنجز الطلبيات الثلاث (المستوى المبتدئ)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {a05 && <KnowledgeBrick id="fasila-hajm" lead="عند كل خطوة للفاصلة نحو اليمين: ماذا حدث للقطعة التي يعدّها الرقم؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم رقمًا بعد الفاصلة؟', subtitle: 'الطلب 3125/1000', done: q5 || a3125,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="fraction-order" ok={a3125 || solved('3125')}
                done={<span>طابقتَ كسرًا عشريًا مقامه <Ltr>1000</Ltr> بالوصل ذي الأرقام 3 1 2 5، وكتبتَ <Ltr>3,125</Ltr>: ثلاثة أرقام بعد الفاصلة.</span>}
                todo="جرّب المستوى المتقدّم: طابق الوصل الطلب 3125/1000، أو أجب هنا." />
              {!a3125 && (
                <TapQuestion
                  prompt={<span>طلب مقامه <Ltr>1000</Ltr> (ثلاثة أصفار). كم رقمًا نضع بعد الفاصلة حتى يطابق الوصل 3 1 2 5 الطلب؟</span>}
                  options={[M('ثلاثة أرقام'), M('رقمين'), M('أربعة أرقام')]}
                  correct={0} cols={3} requires={['kasr-ashri']}
                  explain={<MathText>{'ثلاثة أرقام بعد الفاصلة (125) وثلاثة أصفار في المقام: $3{,}125=\\frac{3125}{1000}$ .'}</MathText>}
                  onAnswered={() => setQ5(true)}
                />
              )}
              {(q5 || a3125) && <KnowledgeBrick id="kitaba-bifasila" lead="3,125 و 3125/1000 و 605/100: قارن عدد الأرقام بعد الفاصلة بعدد أصفار المقام." />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
