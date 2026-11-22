import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES } from '../content/textbook';
import PayrollVignette from '../components/PayrollVignette';

/**
 * Module 1 — l'ENTRÉE : un compteur à partie fixe (affine-meter), UNE PISTE (rétrofit 2026-10-15).
 *
 * Entrée retenue : la course en taxi-application (100DA au moment de monter, 40DA le km) — la partie fixe devient NÉCESSAIRE
 * à la main (le compteur ne peut pas partir de 0 km) ; le niveau متقدم garde la paie du نشاط 1 (35000DA + 185DA l'heure), la
 * cible 37775 lue à l'envers et les boutons a et b. Le lab est EN TÊTE, sans carte, sans titre ni consigne de workspace.
 * Les questions du manuel (10 heures, tableau, S(x), type de fonction, programme) viennent APRÈS la découverte, comme
 * APPLICATION (étapes 3–4) ; le tableau à compléter est déjà fait par les repères (5, 8, 10, 12, 15) du lab.
 *
 * ÉTAPES : 1 POURQUOI le compteur ne part pas de 0 ; 2 POURQUOI la lecture ne double pas quand x double (le « جدول تناسبية »
 * du livre, س 2-ب) ; 3 le نشاط du livre : 10 heures puis S(x) (س 1 et 3) ; 4 le type de fonction et le programme (س 4), puis
 * la brique dala-ujra APRÈS la réponse ; 5 l'antécédent (38330DA), avec les cibles atteintes par l'élève.
 * Les essais de l'élève (`onTrial`, deux niveaux) sont listés (`[data-activity-evidence]`) sans jamais bloquer.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (s2, s4, la brique), P2 (s1, s3), P3 (s5).
 * Les labs vivent dans l'`intro` (deux niveaux) : le rappel de « مسألة الدرس » ne vit qu'au sommaire.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [hits, setHits] = useState([]);
  const [q1b, setQ1b] = useState(false);
  const [cps, setCps] = useState([]);
  const [q3, setQ3] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de son laboratoire l'est
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);

  const onTrial = (tr) => {
    if (tr.tk) return;   // un événement `checkpoint…` n'est pas un essai
    if (tr.kind === 'image') setTrials((t) => [...t.filter((u) => u.x !== tr.x), tr].sort((p, q) => p.x - q.x));
    if (tr.kind === 'hit') setHits((t) => (t.some((u) => u.x === tr.x) ? t : [...t, tr]));
  };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تجرّب العدّاد بعد: حرّك x أعلاه (الكيلومترات أو الساعات)، وجرّب 0.</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">قراءاتك على العدّاد (x ← القراءة):</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trials">
            {trials.slice(-8).map((tr) => (
              <li key={tr.x} data-evidence-trial={tr.x} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                <bdi dir="ltr" className="font-mono">{tr.x} → {tr.fx}</bdi>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const hitEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence="reverse" data-tried={hits.length ? 'true' : 'false'}>
      {hits.length === 0
        ? <p className="text-slate-500">لم تبلغ بعد الأجرة المطلوبة في المرحلة 2 من العدّاد («عدد صورته معلومة»).</p>
        : (
          <ul className="flex flex-wrap gap-1.5" data-evidence="reverse">
            {hits.map((h) => (
              <li key={h.x} className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900">
                <bdi dir="ltr" className="font-mono">{h.x} → {h.fx}</bdi>
              </li>
            ))}
          </ul>
        )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 1 — أجرة العامل"
      moduleSubtitle="عدّاد بجزء ثابت وجزء يتغيّر مع الساعات"
      estimatedTime="12 دقيقة"
      objectives={[
        'ماذا يبقى ثابتًا في أجرة العامل، وماذا يُضاف عن كل ساعة؟',
        'كيف نكتب الأجرة بدلالة عدد الساعات $x$؟',
        'كيف نعرف عدد الساعات من أجرة معلومة؟',
      ]}
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="affine-meter"
                level="beginner"
                rule="40x+100"
                mode="image"
                theme="ride"
                title="عدّاد سيارة الأجرة: 100DA عند الركوب و 40DA للكيلومتر"
                lead="رحلة في شوارع العاصمة بتطبيق سيارات الأجرة: جرّب عدة مسافات، وجرّب 0 كيلومتر."
                onTrial={onTrial}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="affine-meter"
                level="advanced"
                rule={ACTIVITY.lab.rule}
                mode={ACTIVITY.lab.mode}
                target={ACTIVITY.lab.target}
                marks={ACTIVITY.lab.marks}
                theme="payroll"
                title="نشاط 1: أجرة قاعدية 35000DA يضاف إليها 185DA لكل ساعة إضافية"
                lead="المثلثات الحمراء هي أعمدة جدول الكتاب (5، 8، 10، 12، 15): أتمّها على العدّاد، ثم افتح المرحلتين التاليتين."
                onTrial={onTrial}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لا يبدأ العدّاد من 0؟', subtitle: 'ما رأيته عند x = 0', done: answered('image'),
          content: (
            <div className="space-y-3">
              {evidence}
              <p data-checkpoint-trace="image" data-tried={answered('image') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('image') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('image')
                  ? <MathText>{'أجبتَ في المختبر: عند $x = 0$ لا تكون القراءة $0$ ، لأنّ القطعة الثابتة تُدفع مرة واحدة قبل أن يبدأ $x$ في الزيادة.'}</MathText>
                  : 'أنجز مرحلة «الصورة» في العدّاد (جرّب 0، ثم عدّة قيم)، وأجب عن الأسئلة التي تظهر فوقه.'}
              </p>
            </div>
          ),
        },
        {
          num: 2, title: 'هل تتضاعف القراءة حين يتضاعف x؟', subtitle: 'جدول الأجور ليس جدول تناسبية', done: answered('image'),
          content: (
            <div className="space-y-3">
              {evidence}
              <p data-checkpoint-trace="rule" data-tried={answered('image') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('image') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('image')
                  ? <MathText>{`${ACTIVITY_LINES.prop} فجدول الأجور هنا ليس جدول تناسبية: الجزء الثابت لا يتضاعف.`}</MathText>
                  : 'أنجز مرحلة «الصورة» ثم قارن قراءة عدد وقراءة ضعفه في جدول محاولاتك.'}
              </p>
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط الكتاب: أجرة العامل', subtitle: 'السؤالان 1 و 3', done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3 space-y-2" data-book-activity>
                <PayrollVignette />
                <p className="font-semibold text-slate-800"><MathText>{ACTIVITY.text}</MathText></p>
                <p className="text-xs text-slate-500" data-correction-note><MathText>{ACTIVITY.correctionNote}</MathText></p>
                <SourceTag source={ACTIVITY.source} />
              </div>
              <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[0]}</MathText></p>
              <NumericQuestion
                prompt="أجرة عامل أنجز 10 ساعات إضافية (بالدينار):"
                expected={ACTIVITY.answer.q1}
                parse={parseDec}
                display="36850"
                requires={['taawid-qima']}
                explain={<MathText>{ACTIVITY_LINES.q1}</MathText>}
                onAnswered={() => setQ1b(true)}
              />
              {q1b && (
                <>
                  <p className="text-sm text-slate-800"><MathText>{ACTIVITY.questions[2]}</MathText></p>
                  <TapQuestion
                    prompt={<MathText>{'عبارة $S(x)$ بدلالة $x$ هي:'}</MathText>}
                    options={['$S(x) = 185x + 35000$', '$S(x) = 35185x$', '$S(x) = 35000x + 185$', '$S(x) = 185x$'].map(M)}
                    correct={0}
                    cols={2}
                    requires={['taawid-qima']}
                    explain={<MathText>{`${ACTIVITY_LINES.formula} أما $35185x$ فتضيف 35000 عن كل ساعة ($S(10)$ تصبح $351850$)، و $35000x + 185$ تقلب الجزأين، و $185x$ تنسى الأجرة القاعدية ($S(10) = 1850$).`}</MathText>}
                    onAnswered={() => setQ3(true)}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'أيّ نوع من الدوال؟', subtitle: 'السؤال 4', done: q4,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{'نسمّي $a$ و $b$ عددين معلومين. هل تُكتب أجرة العامل بدلالة $x$ على الشكل $x \\longmapsto ax + b$ ؟'}</MathText></p>
              <TapQuestion
                prompt="أ) هل الوضعية المقترحة تعرّف دالة تآلفية؟"
                options={[
                  M('نعم: $a = 185$ و $b = 35000$'),
                  M('نعم: $a = 35000$ و $b = 185$'),
                  M('لا: لأنّ الجدول ليس جدول تناسبية'),
                ]}
                correct={0}
                cols={1}
                requires={['taawid-qima']}
                explain={<MathText>{`${ACTIVITY_LINES.affine} وكون الجدول غير تناسبي لا يمنع ذلك: الدالة التآلفية ليست خطية في الغالب.`}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt="ب) برنامج الحساب الذي يصف الدالة S هو:"
                  options={[
                    M('«اضرب $x$ في 185، أضف 35000»'),
                    M('«أضف 35000 إلى $x$ ، ثم اضرب في 185»'),
                    M('«اضرب $x$ في 35000، أضف 185»'),
                  ]}
                  correct={0}
                  cols={1}
                  requires={['taawid-qima']}
                  explain={<MathText>{`${ACTIVITY_LINES.program} أما «أضف ثم اضرب» فيعطي $(x + 35000) \\times 185$ ، أي $S(10) = 6476850$.`}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {q4 && <KnowledgeBrick id="dala-ujra" lead="ما فعله العدّاد بكل عدد من الساعات، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 5, title: 'من الأجرة إلى الساعات', subtitle: 'العدد الذي صورته معلومة', done: q5,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800">في المرحلة 2 من العدّاد بلغت أجرة معلومة بتحريك عدد الساعات. الآن دون عدّاد:</p>
              {hitEvidence}
              <NumericQuestion
                prompt={<MathText>{'تقاضى عامل في شهر أجرة $38330$DA. عدد الساعات الإضافية التي أنجزها هو:'}</MathText>}
                expected={18}
                parse={parseDec}
                display="18"
                requires={['dala-ujra', 'hal-muadala-ula']}
                explain={<MathText>{ACTIVITY_LINES.antecedent}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              {q5 && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  <MathText>{'جرّب المرحلة 3 من العدّاد: اضبط $a$ و $b$ . المحور التالي يميّز الدوال التآلفية من غيرها، ويقرأ معاملَيها $a$ و $b$ .'}</MathText>
                </p>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
