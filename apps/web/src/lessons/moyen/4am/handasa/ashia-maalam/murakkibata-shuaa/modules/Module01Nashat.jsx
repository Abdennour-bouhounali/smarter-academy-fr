import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, DESCARTES, LAB } from '../content/textbook';
import { FIG_ACT1, FIG_ACT1_D } from '../content/figures';

/**
 * Module 1 — نشاط 1 (p. 140), ouvert sur L'APPLI DE LIVRAISON (component-steps), avec l'accroche de Descartes (la
 * mouche sur les carreaux de sa fenêtre, مدخل الباب p. 139, doublon déclaré).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 1) : A → B conduit SANS compteurs puis le code écrit (« +8 puis −2 »), B → D vers
 *          D(3 ; −2) qu'on ne voit pas, OA et OD depuis le dépôt O, u(3 ; −4) à poser depuis A ;
 *   مبتدئ : le quartier, cinq commandes, compteurs en direct (A → B conduit ; C → D le même code ; E → F vers le bas-gauche ;
 *          O → M : le code = l'adresse ; un pin à poser).
 * UNDERSTAND  les questions 1–5 du نشاط 1 sous les livraisons de l'élève (`onTrial`, `[data-activity-evidence]`), sur la
 *           figure du manuel (GeoFigure) ; la brique « مركبتا شعاع » = le texte du نشاط 1 (3), posée APRÈS que l'élève
 *           a écrit le trajet A → B lui-même.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (lecture des مركبتان), P2 (OM ↔ coordonnées).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const col = (a, b) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;
const ORDER_NAME = { AB: 'AB', BD: 'BD', OA: 'OA', OD: 'OD', u: 'AE' };

export default function Module01Nashat() {
  const [trips, setTrips] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.tk && ev.ok) setTrips((s) => (s.some((x) => x.order === ev.order) ? s : [...s, ev])); };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trips.length ? 'true' : 'false'}>
      {trips.length === 0 ? (
        <p className="text-slate-500">لم توصل بعد أي طلب في المستوى «متقدم» (نشاط 1).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">رحلاتك الموصلة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="trips">
            {trips.map((t) => (
              <li key={t.order} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900" data-evidence-trip={t.order}>
                <MathText>{`$\\overrightarrow{${ORDER_NAME[t.order] ?? t.order}}\\begin{pmatrix} ${t.v[0]} \\\\ ${t.v[1]} \\end{pmatrix}$`}</MathText>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 1 — تطبيق التوصيل في الحيّ"
      moduleSubtitle="كيف نكتب رحلة بعددين؟"
      objectives={['كيف نكتب رحلة بعددين؟', 'ماذا يمثّل كل عدد من العددين؟', 'ما مركبتا شعاع ينطلق من المبدأ O؟']} estimatedTime="13 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="component-steps"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="delivery"
                lead="المستودع في O، والشارعان الكبيران محورا المعلم."
              />
            ),
            advanced: () => (
              <Manipulation
                type="component-steps"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="delivery"
                lead="شكل الكتاب صار حيًّا: النقاط A و B و C، والنقطة D معطاة بإحداثيتيها فقط."
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'نشاط 1: إحداثيات A و B و C', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.part1}`} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">إحداثيتا كل نقطة:</p>}
                rows={[
                  { id: 'A', label: 'A', options: ['$(-2\\,;\\,4)$', '$(2\\,;\\,4)$', '$(4\\,;\\,-2)$'].map(M), correct: 0, correction: 'A على يسار محور التراتيب بوحدتين: فاصلتها $-2$ ، وترتيبها 4.' },
                  { id: 'B', label: 'B', options: ['$(6\\,;\\,2)$', '$(2\\,;\\,6)$', '$(6\\,;\\,-2)$'].map(M), correct: 0, correction: 'الفاصلة أولا: 6، ثم الترتيب 2.' },
                  { id: 'C', label: 'C', options: ['$(6\\,;\\,4)$', '$(4\\,;\\,6)$', '$(8\\,;\\,4)$'].map(M), correct: 0, correction: 'C فوق B مباشرة، على نفس ارتفاع A.' },
                ]}
                requires={['ihdathiyat-nuqta']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? `أحسنت: ${ACTIVITY_LINES.coords}` : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <p className="rounded-lg bg-amber-50 px-2 py-1 text-sm text-amber-900" data-descartes>
                  <MathText>{DESCARTES.text}</MathText> <SourceTag source={DESCARTES.source} />
                </p>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 1: من A إلى C ثم من C إلى B', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'tul', label: 'طول الشعاع $\\overrightarrow{AC}$', options: ['8', '6', '10'], correct: 0, correction: 'من $-2$ إلى 6 على نفس السطر: 8 وحدات.' },
                  { id: 'manha', label: 'منحى $\\overrightarrow{AC}$', options: ['منحى (OI): أفقي', 'منحى (OJ): شاقولي'], correct: 0, correction: ACTIVITY_LINES.ac },
                  { id: 'ittijah', label: 'اتجاه $\\overrightarrow{AC}$', options: ['الاتجاه الموجب: نحو اليمين', 'الاتجاه السالب: نحو اليسار'], correct: 0, correction: ACTIVITY_LINES.ac },
                  // BC : le sens inversé (le point et son image échangés)
                  { id: 'cb', label: 'شعاع الانسحاب الذي يحوّل C إلى B', options: ['$\\overrightarrow{CB}$ : شاقولي نحو الأسفل، طوله 2', '$\\overrightarrow{BC}$ : شاقولي نحو الأعلى، طوله 2'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.cb}</MathText> },
                ].map((r) => ({ ...r, label: <MathText>{r.label}</MathText>, options: r.options.map((o) => (typeof o === 'string' ? <MathText key={o}>{o}</MathText> : o)), correction: typeof r.correction === 'string' ? <MathText>{r.correction}</MathText> : r.correction }))}
                requires={['shuaa-anasir']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الرحلة من A إلى B انتقالان، أفقي ثم شاقولي.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 1: رحلة A إلى B بعددين', subtitle: 'السؤال 3', done: q3,
          content: (
            <div className="space-y-3">
              {evidence}
              <TapQuestion
                prompt={<MathText>{'في رحلتك من A إلى B كتبت عددين. لماذا لا يكونان $6$ و $2$ ، إحداثيتي B؟'}</MathText>}
                options={[
                  'لأن الرحلة تبدأ من A لا من المبدأ O: العددان يقيسان الانتقال لا موضع النقطة',
                  'لأن B بعيدة جدا عن A',
                  'لأن إحداثيتي B تُكتبان بترتيب مختلف',
                ]}
                correct={0}
                cols={1}
                requires={['shuaa-anasir']}
                explain={<MathText>{'8 وحدات بموازاة (OI) نحو اليمين ثم وحدتان بموازاة (OJ) نحو الأسفل: $\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}$ . أما $\\begin{pmatrix} 6 \\\\ 2 \\end{pmatrix}$ فهما إحداثيتا B، والمبدأ A ليس O.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <PredictRule id="murakkibatan" prompt={"وجدت للتوّ $\\begin{pmatrix} 8 \\\\ -2 \\end{pmatrix}$ للانتقال من نقطة إلى أخرى. ماذا يمثّل كل عدد من العددين بالنسبة إلى الشعاع؟ اكتب بكلماتك كيف نقرأ هذين العددين، ولماذا قد يكون أحدهما سالبًا."}><TextbookBox kind="definition" text={ACTIVITY.part3} source={ACTIVITY.source} compact /></PredictRule>
                  <KnowledgeBrick id="murakkibatan" lead="ما كتبته في التطبيق، بكلمات الكتاب:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 1: من B إلى D', subtitle: 'السؤال 4', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part4} source={ACTIVITY.source} compact />
              <TapQuestion
                prompt={<MathText>{'رحلة B إلى D مركبتاها $\\begin{pmatrix} -3 \\\\ -4 \\end{pmatrix}$ . لماذا كلتاهما سالبة؟'}</MathText>}
                options={[
                  'لأن D على يسار B وتحتها: الرحلة نحو اليسار ثم نحو الأسفل',
                  'لأن إحداثيتي D موجبتان',
                  'لأن الإشارة السالبة تعني أن الشعاع أقصر',
                ]}
                correct={0}
                cols={1}
                requires={['murakkibatan']}
                explain={<MathText>{ACTIVITY_LINES.bd}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <GeoFigure {...FIG_ACT1_D} />}
            </div>
          ),
        },
        {
          num: 5, title: 'نشاط 1: من المبدأ O', subtitle: 'السؤال 5', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part5} source={ACTIVITY.source} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">من المستودع O (OA و OD أنجزتهما في التطبيق):</p>}
                rows={[
                  { id: 'OB', label: '$\\overrightarrow{OB}$', options: [col(6, 2), col(8, -2), col(2, 6)], correct: 0, correction: 'من O لا من A: 6 نحو اليمين ثم 2 نحو الأعلى.' },
                  { id: 'OC', label: '$\\overrightarrow{OC}$', options: [col(6, 4), col(8, 0), col(4, 6)], correct: 0, correction: '6 نحو اليمين ثم 4 نحو الأعلى.' },
                  // la règle : l'ordre et les signes
                  { id: 'rule', label: 'أتمم: إذا كانت $M(x\\,;\\,y)$ فإن مركبتي $\\overrightarrow{OM}$ هما…', options: ['x و y', 'y و x', '$-x$ و $-y$'], correct: 0, correction: <MathText>{ACTIVITY_LINES.rule}</MathText> },
                ].map((r) => ({ ...r, label: <MathText>{r.label}</MathText>, options: r.options.map((o) => <MathText key={o}>{o}</MathText>), correction: typeof r.correction === 'string' ? <MathText>{r.correction}</MathText> : r.correction }))}
                requires={['murakkibatan']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? `أحسنت: ${ACTIVITY_LINES.om}` : 'راجع التصحيح تحت كل سطر: من O تبدأ كل رحلة.'}</MathText></Feedback>}
                onAnswered={() => setQ5(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
