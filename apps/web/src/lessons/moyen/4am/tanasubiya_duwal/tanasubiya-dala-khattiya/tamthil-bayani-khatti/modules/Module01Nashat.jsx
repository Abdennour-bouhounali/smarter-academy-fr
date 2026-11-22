import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, ICT, ICT_PLATFORM } from '../content/textbook';

/**
 * Module 1 — نشاط 3 (p. 66) « تمثيل دالة خطية بيانيا », ouvert sur LA DROITE ÉPINGLÉE À O (origin-line).
 *
 * REAL      la carte d'activité : le téléphérique de قسنطينة — un câble droit tendu depuis la station
 *           (O) — puis le نشاط 3, au mot près.
 * DISCOVER / MANIPULATE   le lab à deux niveaux, UN instrument, même objectif :
 *   مبتدئ (ouvert par défaut : c'est le نشاط 3) : f(x) = 0,5x — l'élève POSE A, B… (un point hors de la
 *          droite est refusé avec son écart), O résiste, la droite (OA) se trace au premier point
 *          accepté, puis la sonde lit l'ordonnée de C (abscisse −2) ;
 *   متقدم : le زالق de جيوجيبرا (p. 76) dans sa version plateforme — aucune fonction donnée, l'élève
 *          fait pivoter la droite et la découverte demande une droite qui monte ET une qui descend.
 * UNDERSTAND  س 1 أ) et ب) se décident sur les propres points de l'élève (`onTrial` →
 *           `[data-activity-evidence]`), س 2 أ) sur sa lecture de C, س 2 ب) nomme y = 0,5x.
 * TOUCH / FORMALIZE  la brique tamthil-nashat (« نقول أنّ … ») nomme ce que le lab a montré.
 * TRANSFER  le زالق : la question de la p. 76 se décide sur les droites que l'élève a fixées.
 * Rétrofit 2026-10-15 (§4quater) : le labo OUVRE le module (plus de carte du livre ni de vignette, plus de titre / lead de workspace ;
 * l'accroche du téléphérique est le `lead` du labo). L'étape 1 ne redemande plus le tableau f(0), f(1), f(4) que le labo vient de faire
 * calculer : elle demande POURQUOI un point est refusé et l'autre accepté ; l'étape 2, POURQUOI B tombe sur (OA).
 * AUCUNE étape n'attend `onFinished`. LP : P1, P2 (lecture de C), P3 (le زالق).
 * La dernière étape se termine sur « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire), résolue au module 4.
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;

/** La TRACE d'une suite de questions posée par-dessus le labo (LabCheckpoint) : l'étape est faite quand la suite l'est. */
function Trace({ id, done, children, idle }) {
  return (
    <p data-checkpoint-trace={id} data-tried={done ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${done ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {done ? children : idle}
    </p>
  );
}

export default function Module01Nashat() {
  const [points, setPoints] = useState([]);
  const [reads, setReads] = useState([]);
  const [lines, setLines] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : « لماذا O و A و B على استقامة ؟ » et « ما الذي يحدّد الصعود ؟ » y sont posées ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('origin-line').enabled;
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const aligned = cpOn ? answered('draw2') : q2;
  const slopeDone = cpOn ? answered('pivot2') : q5;

  const onDraw = (tr) => {
    if (tr.kind === 'point') setPoints((p) => [...p.filter((x) => x.pointTex !== tr.pointTex), tr]);
    if (tr.kind === 'read-x') setReads((r) => [...r.filter((x) => x.x !== tr.x), tr]);
  };
  const onPivot = (tr) => { if (tr.kind === 'line') setLines((l) => [...l.filter((x) => x.a !== tr.a), tr]); };

  const pointsEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={points.length ? 'true' : 'false'}>
      {points.length === 0 ? (
        <p className="text-slate-500">لم تضع أي نقطة بعد على المعلم (المستوى المبتدئ).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">النقط التي وضعتها:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="points">
            {points.slice(-10).map((tr) => (
              <li key={tr.pointTex} data-evidence-point={tr.label ?? 'refused'} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${tr.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                <MathText>{`$${tr.label ?? ''}${tr.pointTex}$`}</MathText> {tr.ok ? '✓' : '✗'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const readEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={reads.length ? 'true' : 'false'}>
      {reads.length === 0 ? (
        <p className="text-slate-500"><MathText>{'بعد رسم المستقيم، حرّك المسبار تحت محور الفواصل إلى $-2$ واقرأ.'}</MathText></p>
      ) : (
        <ul className="flex flex-wrap gap-1.5" data-evidence="reads">
          {reads.slice(-6).map((tr) => (
            <li key={tr.x} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-900"><MathText>{`$${tr.tex}$`}</MathText></li>
          ))}
        </ul>
      )}
    </div>
  );

  const linesEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={lines.length ? 'true' : 'false'}>
      {lines.length === 0 ? (
        <p className="text-slate-500">لم تثبّت أي مستقيم بعد على الزالق (المستوى المتقدّم).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">المستقيمات التي ثبّتّها:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="lines">
            {lines.slice(-8).map((tr) => (
              <li key={tr.a} data-evidence-line={tr.dir} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                <MathText>{`$${tr.tex}$`}</MathText> {tr.dir === 'rising' ? '↗ يصعد' : tr.dir === 'falling' ? '↘ ينزل' : '→ أفقي'}
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
      objectives={["كم نقطة نحتاج لنشدّ حبل التلفريك المستقيم؟", "ماذا تقول عن النقط O و A و B؟", "كيف يتحرّك المستقيم عندما يتغيّر المعامل؟"]}
      moduleNumber={1}
      moduleTitle="نشاط 3 — حبل يشدّه المبدأ"
      moduleSubtitle="تمثيل دالة خطية بيانيا"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation
                type="origin-line"
                level="beginner"
                a={ACTIVITY.a}
                mode="draw"
                theme="cablecar"
                lead={<MathText>{'حبل تلفريك قسنطينة مستقيم، مشدود من محطة الانطلاق O. نمثّل الدالة الخطية $f : x \\longmapsto 0{,}5x$ : احسب صورة $1$ وصورة $4$ وضع النقطتين A و B على المعلم. جرّب أيضًا نقطة لا تحقّق الحساب، وحاول أن تحرّك O.'}</MathText>}
                onTrial={onDraw}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="origin-line"
                level="advanced"
                mode="pivot"
                theme="cablecar"
                lead="في هذا المستوى لا دالة معطاة: أمسك المستقيم أو حرّك الزالق على يمين المعلم، وثبّت عدّة مستقيمات: بعضها يصعد وبعضها ينزل."
                onTrial={onPivot}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا رفض المعلم نقطة وقبل أخرى؟', subtitle: 'السؤال 1 أ', done: q1,
          content: (
            <div className="space-y-3">
              {pointsEvidence}
              <p className="text-xs text-slate-500"><MathText>{`نشاط 3: ${ACTIVITY.title}`}</MathText> <SourceTag source={ACTIVITY.source} /></p>
              <TapQuestion
                prompt={<MathText>{'عندما تضع النقطة $(4 ; 3)$ يرفضها المعلم ويقبل $B(4 ; 2)$. لماذا؟'}</MathText>}
                options={[
                  'لأنّ ترتيب نقطة فاصلتها $4$ على التمثيل هو $f(4) = 0{,}5 \\times 4 = 2$ ، لا $3$.',
                  'لأنّ الفاصلة $4$ أكبر من أن يقبلها المعلم.',
                  'لأنّ المعلم لا يقبل إلا نقطتين فقط.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['notation-fx']}
                explain={<MathText>{`${ACTIVITY_LINES.table} فكل نقطة من التمثيل ترتيبها صورة فاصلتها.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا وقعت B على المستقيم (OA)؟', subtitle: 'السؤال 1 ب', done: aligned,
          content: (
            <div className="space-y-3">
              {pointsEvidence}
              {cpOn ? (
                <Trace id="draw2" done={aligned} idle="ضع نقطتين على المعلم (المستوى المبتدئ) وأجب عن الأسئلة التي تظهر فوق المخبر.">
                  <MathText>{'أجبتَ في المخبر: O و A و B على استقامة واحدة لأنّ ترتيب كل نقطة ÷ فاصلتها هو العدد نفسه $0{,}5$ ، فهي كلها من تمثيل الدالة نفسها.'}</MathText>
                </Trace>
              ) : (
<TapQuestion
                prompt={<MathText>{'المستقيم (OA) مرّ بالنقطة $B(4 ; 2)$ دون أن توجّهه إليها. لماذا O و A و B على استقامة واحدة؟'}</MathText>}
                options={[
                  'لأنّ ترتيب B هو $2 = 0{,}5 \\times 4$ ، فهي من نقط تمثيل الدالة نفسها.',
                  'لأنّ كل ثلاث نقط في معلم تكون على استقامة واحدة.',
                  'لأنّ B أبعد عن O من A.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['notation-fx']}
                explain={<MathText>{ACTIVITY_LINES.aligned}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا تقرأ عند الفاصلة −2؟', subtitle: 'السؤال 2 أ', done: q3,
          content: (
            <div className="space-y-3">
              {readEvidence}
              <NumericQuestion
                prompt={<MathText>{'ترتيب النقطة C من المستقيم (OA) ذات الفاصلة $-2$ هو:'}</MathText>}
                expected={-1}
                parse={parseDec}
                display="-1"
                requires={['notation-fx', 'talim-nuqta']}
                explain={<MathText>{ACTIVITY_LINES.c}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'كيف نصف كل نقطة من المستقيم؟', subtitle: 'السؤال 2 ب', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'إذا كانت $M(x ; y)$ نقطة من (OA) فإنّ:'}</MathText>}
                options={['$y = 0{,}5x$', '$y = x + 0{,}5$', '$x = 0{,}5y$', '$y = 0{,}5$'].map(Opt)}
                correct={0}
                cols={2}
                requires={['notation-fx']}
                explain={<MathText>{`${ACTIVITY_LINES.m} أمّا $y = x + 0{,}5$ فلا تشمل O، و $x = 0{,}5y$ تعطي لـ A الترتيب 2.`}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="tamthil-nashat" lead="ما رسمته، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 5, title: 'متى يصعد المستقيم ومتى ينزل؟', subtitle: 'أوظّف تكنولوجيات الإعلام والاتصال — ص 76', done: slopeDone,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" title="الزالق (جيوجيبرا)" text={ICT.question} source={ICT.source} compact />
              <p className="text-xs text-slate-600"><MathText>{ICT_PLATFORM.text}</MathText> <SourceTag source={ICT_PLATFORM.source} /></p>
              {linesEvidence}
              {cpOn ? (
                <Trace id="pivot2" done={slopeDone} idle="ثبّت في المستوى المتقدّم مستقيمًا يصعد ومستقيمًا ينزل، وأجب عن الأسئلة التي تظهر فوق المخبر.">
                  <MathText>{'أجبتَ في المخبر: إشارة المعامل $a$ هي التي تحدّد الاتجاه: يصعد المستقيم إذا كان $a > 0$ وينزل إذا كان $a < 0$ ، والمبدأ O لا يتحرّك.'}</MathText>
                </Trace>
              ) : (
<TapQuestion
                prompt={<MathText>{'المستقيم الذي يمثّل دالة خطية معاملها $a$ يشمل دائمًا O، و:'}</MathText>}
                options={[
                  'إذا كان $a > 0$ يصعد من اليسار إلى اليمين، وإذا كان $a < 0$ ينزل.',
                  'إذا كان $a > 0$ ينزل من اليسار إلى اليمين، وإذا كان $a < 0$ يصعد.',
                  'منحاه لا يتعلّق بإشارة $a$ ، بل بقيمته فقط.',
                ].map(Opt)}
                correct={0}
                cols={1}
                requires={['tamthil-nashat']}
                explain={<MathText>{`${ICT.answer} المبدأ O لا يتحرّك أبدًا.`}</MathText>}
                onAnswered={() => setQ5(true)}
              />
              )}
              {slopeDone && (
                <p className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-violet-900" data-next-module>
                  <MathText>{'رسمت مستقيمًا يشمل O بنقطة واحدة أخرى، وقرأت عليه ترتيب نقطة، ورأيته يصعد أو ينزل. المحور التالي يعطي هذا كلّه اسمه في الكتاب: التمثيل البياني لدالة خطية ومعامل توجيهه.'}</MathText>
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
