import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE : le partage équitable (le labo en tête SANS carte ni titre). LABORATOIRE À DEUX NIVEAUX, un seul type
 * `fair-share` (la main tient la PART d'un enfant ; le labo juge b × x contre les a pains) :
 *   مبتدئ  — la cantine de l'école (plateforme, monde `bakery`) : 3 pains pour 4 enfants (la règle décimale tombe juste), puis 2 pour 3.
 *   متقدم  — نشاط 1 du manuel : 5 pains pour 6 personnes, puis 7 pains pour 3.
 * Les ÉTAPES interrogent ce que l'élève a FAIT : pourquoi la règle décimale n'a jamais fini (P3), comment s'écrit sa part trouvée avec la
 * règle des morceaux (P1), pourquoi b × a/b = a (P2). Le نشاط 1 du manuel est posé en application dans أتمرّن (module 4).
 * Déploiement du prototype (2026-10-28) : ces trois questions sont posées PAR-DESSUS le labo après chaque demande (`FairShare › chainsOf` :
 * la part, b × la part, décimal ou dixièmes, la règle) ; les étapes en gardent la TRACE (`checkpoint-done` de `order-0` / `order-1`).
 */

/** La trace d'une suite de questions répondue dans le labo (sinon : où la trouver). */
function Trace({ ok, done }) {
  return (
    <p data-evidence="checkpoint" data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : 'أنجز الطلبين في المختبر، وأجب عن الأسئلة التي تظهر فوقه بعد كل طلب.'}
    </p>
  );
}

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const record = (e) => { if (!e.free) setTrials((list) => [...list, e]); }; // la demande libre (جرّب أعدادك) n'est jamais une preuve
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de sa demande l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const q1 = answered('order-1');
  const q2 = answered('order-0');
  const q3 = answered('order-1');
  const refused = trials.filter((e) => !e.ok && e.n === 10).at(-1);
  const solved = trials.filter((e) => e.ok).at(-1);
  const [a, b] = (solved?.order ?? '5/6').split('/').map(Number);
  const [n, m] = solved ? [solved.n, solved.m] : [b, a];

  return (
    <ContentModule
      objectives={['لماذا لا تنتهي الكعكات إذا قسّمناها إلى عشر قطع؟', 'كيف نكتب حصّة الواحد؟', 'ماذا يعطي ضرب الحصّة في عدد الأطفال؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — نقتسم الكعكات"
      moduleSubtitle="الحصّة التي تُنهي الكعك تمامًا"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="fair-share" level="beginner" scene="canteen" orders={[[3, 4], [2, 3]]} onTrial={record} />,
            advanced: () => <Manipulation type="fair-share" level="advanced" scene="family" orders={[[5, 6], [7, 3]]} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا بقي شيء دائمًا؟', subtitle: 'القسمة إلى عشر قطع', done: q1,
          content: (
            <div className="space-y-3">
              <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={refused ? 'true' : 'false'}>
                {refused
                  ? <span className="font-bold text-slate-800">جرّبتَ في طلب <bdi dir="ltr">{refused.order.replace('/', ' ÷ ')}</bdi> أن تقسّم كل كعكة إلى عشر قطع وأن يأخذ كل واحد <bdi dir="ltr">{refused.m}</bdi> قطع فلم تنته الكعكات تمامًا.</span>
                  : <span className="text-slate-500">لم تقسّم بعد كل كعكة إلى عشر قطع في لوحتك: جرّب ذلك في الأعلى.</span>}
              </p>
              <Trace ok={q1} done="أجبتَ في المختبر: القطع العشرية لا تُنهي الكعكات بالضبط في الطلب الثاني — يبقى أو ينقص دائمًا جزء صغير." />
            </div>
          ),
        },
        {
          num: 2, title: 'كيف نكتب حصّة الواحد؟', subtitle: 'تقسيم الكعكة', done: q2,
          content: (
            <div className="space-y-3">
              <p className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={solved ? 'true' : 'false'}>
                {solved
                  ? <span className="font-bold text-slate-800">حين قسّمتَ كل كعكة إلى <bdi dir="ltr">{n}</bdi> قطع وأخذ كل واحد <bdi dir="ltr">{m}</bdi> قطع انتهت الكعكات تمامًا في طلب <bdi dir="ltr">{a} ÷ {b}</bdi>.</span>
                  : <span className="text-slate-500">لم تجد بعد تقسيمًا تنتهي به الكعكات: جرّب في الأعلى. السؤال هنا عن الطلب <bdi dir="ltr">{a} ÷ {b}</bdi>.</span>}
              </p>
              <Trace ok={q2} done={<MathText>{`أجبتَ في المختبر: حصّة الواحد في الطلب الأوّل كسر بسطه عدد الكعكات ومقامه عدد الأطفال.`}</MathText>} />
              {q2 && <KnowledgeBrick id="kasr-hasil-qisma" lead="حصّة الواحد هي حاصل قسمة عدد الكعكات على عدد الأطفال." />}
            </div>
          ),
        },
        {
          num: 3, title: 'لماذا تنتهي الكعكات تمامًا؟', subtitle: 'الحصّة × عدد الأطفال', done: q3,
          content: (
            <div className="space-y-3">
              <Trace ok={q3} done={<MathText>{`أجبتَ في المختبر: $${b}\\times\\frac{${m}}{${n}}=${a}$ — الحصص معًا تملأ الكعكات بالضبط.`}</MathText>} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
