import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, ACTIVITY_LINES, LAB } from '../content/textbook';
import { FIG_ACT1, FIG_ACT1_ARROWS, FIG_ACT1_2D } from '../content/figures';

/**
 * Module 1 — نشاط 1 (p. 128), ouvert sur LE SPECTACLE DE DRONES (translation-glide).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 1) : la figure du manuel, ses quatre translations données par un point et son
 *          image (A ↦ G, C ↦ R, A ↦ M, A ↦ A′) ; l'élève pose les neuf images, sans voyants pendant le geste ;
 *   مبتدئ : trois drones, l'élève CHOISIT la flèche du meneur, pose B′ et C′ (voyants المنحى · الاتجاه · الطول), répare
 *          le drone égaré (−u) — le contraste « même longueur, même منحى, اتجاه معاكس ».
 * UNDERSTAND  les questions 1 أ – 2 هـ du نشاط 1 sous les placements de l'élève (`onTrial`, `[data-activity-evidence]`),
 *           sur la figure du manuel (GeoFigure) ; la brique « الانسحاب يعرّف شعاعا » = le texte du نشاط 1.
 * PROTOTYPE 2026-10-28 : le labo pose lui-même ses questions PAR-DESSUS (`translation-glide › CHAINS` : décalage, comparaison au 1er tableau, règle « une
 * flèche, un shuaa » à la fin) ; l'étape 3 ne repose donc plus « pourquoi c'est la même translation » (la ligne `why`).
 * AUCUNE étape n'attend `onFinished`. LP : P1 (translation ↔ vecteur), P2 (منحى، اتجاه، طول).
 * Le lab vit dans `intro` (deux niveaux) : la DERNIÈRE étape se termine sur « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire),
 * résolue au module 5.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const TAB = { G: 'A ↦ G', R: 'C ↦ R', M: 'A ↦ M', "A'": 'A ↦ A′' };
const prime = (s) => String(s ?? '').replace(/'/g, '′');

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.leader && ev.ok && !ev.rogue) setTrials((s) => [...s, ev].slice(-12)); };

  const evidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={trials.length ? 'true' : 'false'}>
      {trials.length === 0 ? (
        <p className="text-slate-500">لم تضع بعد أي صورة في لوحات النشاط (المستوى «متقدم»).</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">صورك المقبولة:</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="images">
            {trials.map((t) => (
              <li key={t.n} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900" data-evidence-image={t.name}>
                <bdi dir="ltr" className="font-mono">{`${TAB[t.tableau] ?? ''} : ${t.from} ↦ ${prime(t.name)}`}</bdi>
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
      moduleNumber={1} objectives={['ماذا تتشارك أسهم المسيّرات التي تتحرّك بنفس الحركة؟', 'ماذا يكفي لتعيين الانسحاب؟', 'متى نقول عن سهمين إنهما متساويان؟']}
      moduleTitle="نشاط 1 — عرض المسيّرات فوق الخليج"
      moduleSubtitle="التشكيلة كلها تنتقل بحركة واحدة: ما هذه الحركة؟"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="translation-glide"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="drone-show"
                title="عرض المسيّرات: حرّك القائدة وضع صور التشكيلة"
                lead="ثلاث مسيّرات A و B و C. النجمة على الشبكة هي خطة العرض، ولك أن تختار وجهة أخرى لـ A."
              />
            ),
            advanced: () => (
              <Manipulation
                type="translation-glide"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="drone-show"
                title="نشاط 1: أربعة انسحابات للمثلث ABC"
                lead={<MathText>{'شكل الكتاب أعادت المنصّة رسمه بوضوح أكبر: في كل لوحة، الانسحاب معطى بنقطة وصورتها: $A \\mapsto G$ ، $C \\mapsto R$ ، $A \\mapsto M$ ، $A \\mapsto A\'$ .'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'نشاط 1: صور المثلث ABC', subtitle: 'السؤال 1 أ', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.intro} ${ACTIVITY.part1a}`} source={ACTIVITY.source} compact />
              {evidence}
              <GeoFigure {...FIG_ACT1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">صورة المثلث ABC بالانسحاب الذي يحوّل:</p>}
                rows={[
                  { id: 'G', label: 'A إلى G', options: ['GQE', 'SPR', 'MNT'], correct: 0, correction: 'B ↦ Q و C ↦ E: ستة مربعات نحو اليسار.' },
                  { id: 'R', label: 'C إلى R', options: ['SPR', 'GQE', "A′C′D"], correct: 0, correction: 'A ↦ S و B ↦ P: مربعان نحو اليمين وأربعة نحو الأعلى.' },
                  { id: 'M', label: 'A إلى M', options: ['MNT', "A′C′D", 'SPR'], correct: 0, correction: 'B ↦ N و C ↦ T: ثلاثة مربعات نحو اليمين.' },
                ]}
                requires={['insihab-3am']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? `أحسنت: ${ACTIVITY_LINES.images}` : 'راجع التصحيح تحت كل سطر، وقارن بصورك في المستوى «متقدم».'}</MathText></Feedback>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 1: المنحى والاتجاه والطول', subtitle: 'الأسئلة 1 ب، جـ، د', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.part1b} ${ACTIVITY.part1c} ${ACTIVITY.part1d}`} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1_ARROWS} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'manha', label: 'المستقيمات (AG) و (CE) و (KH) و (AM)', options: ['متوازية: لها نفس المنحى', 'ليس لها نفس المنحى'], correct: 0, correction: ACTIVITY_LINES.manha },
                  { id: 'ittijah', label: 'اتجاه [AM) مقارنة باتجاه [AG)', options: ['معاكس', 'نفسه'], correct: 0, correction: ACTIVITY_LINES.ittijah },
                  { id: 'agce', label: 'الطولان AG و CE', options: ['$AG = CE$', '$AG \\neq CE$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.atwal}</MathText> },
                  { id: 'agkh', label: 'الطولان AG و KH', options: ['$AG \\neq KH$', '$AG = KH$'].map(M), correct: 0, correction: <MathText>{ACTIVITY_LINES.atwal}</MathText> },
                ]}
                requires={['tawazi-mustaqimat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس المنحى لا يعني نفس الاتجاه، ولا نفس الطول.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 1: هل هو انسحاب واحد؟', subtitle: 'الأسئلة 2 أ، ب، جـ', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={`${ACTIVITY.part2a} ${ACTIVITY.part2b} ${ACTIVITY.part2c}`} source={ACTIVITY.source} compact />
              <p className="text-sm text-slate-700">في اللوحة الرابعة للمستوى «متقدم» (A ↦ A′) وضعت صورة C وصورة K بنفسك: أين وقعتا؟</p>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'img', label: 'صورة المثلث ABC بالانسحاب الذي يحوّل A إلى A′', options: ["A′C′D", 'GQE', 'MNT'], correct: 0, correction: 'A ↦ A′ و B ↦ C′ و C ↦ D: ثلاثة مربعات نحو اليسار.' },
                  { id: 'other', label: 'هل يوجد انسحاب آخر يعطي الصورة نفسها؟', options: ['لا: الانسحاب يتعيّن بنقطة وصورتها', 'نعم: الانسحاب الذي يحوّل C إلى R'], correct: 0, correction: ACTIVITY_LINES.other },
                ]}
                requires={['insihab-3am']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نقطة واحدة وصورتها تكفيان لتعيين الانسحاب.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="insihab-shuaa" lead="ما وجدته، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 1: هل الشعاعان متساويان؟', subtitle: 'السؤال 2 د', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2d} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1_2D} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  { id: 'gl', label: <MathText>{'$\\overrightarrow{GL} = \\overrightarrow{EF}$ ؟'}</MathText>, options: ['لا: المنحى مختلف', 'لا: الاتجاه معاكس', 'نعم'], correct: 0, correction: <MathText>{ACTIVITY_LINES.gl}</MathText> },
                  { id: 'rp', label: <MathText>{'$\\overrightarrow{RP} = \\overrightarrow{EF}$ ؟'}</MathText>, options: ['لا: الاتجاه معاكس', 'لا: المنحى مختلف', 'نعم'], correct: 0, correction: <MathText>{ACTIVITY_LINES.rp}</MathText> },
                ]}
                requires={['insihab-shuaa']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: كما رفض العرض صور المسيّرات التي اختلف سهمها في عنصر واحد.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'نشاط 1: ممثّلان للشعاع NM', subtitle: 'السؤال 2 هـ', done: q5,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2e} source={ACTIVITY.source} compact />
              <GeoFigure {...FIG_ACT1} />
              <TapQuestion
                prompt={<MathText>{'ممثّلان للشعاع $\\overrightarrow{NM}$ :'}</MathText>}
                options={[
                  '$\\overrightarrow{BA}$ و $\\overrightarrow{PS}$',
                  '$\\overrightarrow{AB}$ و $\\overrightarrow{SP}$', // les sens inversés
                  '$\\overrightarrow{BA}$ و $\\overrightarrow{CD}$', // CD : trois carreaux vers la gauche, autre منحى
                ].map(M)}
                correct={0}
                cols={1}
                requires={['insihab-shuaa']}
                explain={<MathText>{`${ACTIVITY_LINES.nm} ($\\overrightarrow{AB}$ و $\\overrightarrow{SP}$ اتجاههما معاكس، و $\\overrightarrow{CD}$ أفقي.)`}</MathText>}
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
