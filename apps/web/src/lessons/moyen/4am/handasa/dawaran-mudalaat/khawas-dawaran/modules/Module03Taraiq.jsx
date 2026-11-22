import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, NOW155, CENTER, LAB } from '../content/textbook';
import { FIG_METHOD, FIG_METHOD_TURN, FIG_NOW155, FIG_NOW155_SOL } from '../content/figures';

/**
 * Module 3 — طرائق p. 155 « استعمال خواص الدّوران في الإنشاءات », دوري الآن, et le centre d'un دوران (ajout DÉCLARÉ).
 * TOUCH THE MATH : le même workspace qu'au module 1, ouvert sur متقدم (la طريقة elle-même) — la copie de [AC] tournée
 * jusqu'à [BD], les deux affirmations prouvées par cartes, puis l'exercice 18 ouvert par l'élève.
 * FORMALIZE : 1) la طريقة, énoncé COMPLÉTÉ (« قائم في O », le sens — la figure seule les donnait), solution révélée ligne à
 * ligne (MethodSteps) → brique istimal-khawas ; 2) دوري الآن : l'image d'un angle de 45° par (K, 60°) — figure REDESSINÉE
 * (avec le K du manuel, B′ tombait sur A) → brique surat-zawiya ; 3) le centre : deux médiatrices → brique markaz-dawaran.
 * LP : P2 (prouver), P3 (construire des images, trouver le centre).
 * RÉTROFIT 2026-10-15 (§4quater) : plus de `brief` (il décrivait le geste du labo), plus de `title`/`lead` sur le workspace ; le labo s'ouvre
 * réellement sur متقدم (`defaultLevel="advanced"`, comme le disait déjà ce commentaire) ; la solution du manuel (MethodSteps/PredictRule)
 * et la brique viennent APRÈS la réponse de l'étape 1, `markaz-dawaran` après celle de l'étape 3 (`requires` → khawas-dawaran, module 2).
 * « أتوقّع القاعدة » : la solution du manuel (MethodSteps) énonce la méthode avant sa brique → enveloppée dans
 * <PredictRule id="istimal-khawas"> ; ni la question ni l'explain de دوري الآن ne décrivent plus la construction (« ننشئ O′ و A′ و
 * B′ », NOW155.answer : la brique surat-zawiya la montre APRÈS la prédiction, la figure-solution la suit), seulement la
 * conservation de l'angle (déjà posée au module 2).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Taraiq() {
  const [q, setQ] = useState({});
  const [trials, setTrials] = useState([]);
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (e) => { if (e) setTrials((list) => [...list, e].slice(-60)); };
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, `ShapeTurn › STEPS`) : p1 [AC] sur [BD], p2 les affirmations et la règle, p3 le centre W
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طرائق — نثبت بدوران"
      moduleSubtitle="قطعة صورة أخرى بدوران: هما متقايستان، وبزاوية $90^\circ$ متعامدتان"
      estimatedTime="10 دقائق"
      objectives={["كيف أثبت بدوران أن قطعتين متقايستان ومتعامدتان؟", "كيف أنشئ صورة زاوية؟", "كيف أجد مركز دوران مجهول؟"]}
      intro={
        <ManipulationWorkspace
          defaultLevel="advanced"
          levels={{
            beginner: () => (
              <Manipulation type="shape-turn" level="beginner" numbers={LAB.beginner.numbers} theme="zellige"
                title="وردة الزليج: ورقة شفافة تدور حول دبوس" onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="shape-turn" level="advanced" numbers={LAB.advanced.numbers} theme="zellige"
                title="طريقة الكتاب (ص 155): [AC] و [BD]" onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'طريقة الكتاب', subtitle: '[BD] صورة [AC]', done: !!q[1],
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_METHOD} />
              <p className="text-xs text-slate-500" data-correction><MathText>{METHOD.stated}</MathText></p>
              <TapQuestion
                prompt={<MathText>{'لماذا B صورة A بالدوران الذي مركزه O وزاويته $90^\\circ$ ؟'}</MathText>}
                options={[
                  'لأن $OA = OB$ و $\\widehat{AOB} = 90^\\circ$ (المثلث OAB قائم في O ومتساوي الساقين)',
                  'لأن $AC = BD$', // c'est la conclusion, pas la raison
                  'لأن القطعتين [AC] و [BD] متقاطعتان', // ne dit rien de OA, OB
                ].map(M)}
                correct={0}
                cols={1}
                requires={['surat-nuqta-dawaran']}
                explain={<MathText>{'صورة A بدوران مركزه O: نفس البعد عن O ($OB = OA$) والزاوية $\\widehat{AOB}$ هي زاوية الدوران؛ ومن A إلى B عكس عقارب الساعة.'}</MathText>}
                onAnswered={mark(1)}
              />
              {q[1] && (
                <>
                  {/* La solution du manuel ÉNONCE la méthode avant sa brique : une seule prédiction (istimal-khawas), puis
                      la solution et la brique — APRÈS la réponse (rétrofit 2026-10-15), guide PREDICT §3.5. */}
                  <PredictRule id="istimal-khawas"><MethodSteps method={METHOD} /></PredictRule>
                  <GeoFigure {...FIG_METHOD_TURN} />
                  <KnowledgeBrick id="istimal-khawas" lead="الطريقة، في سطر واحد:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'دوري الآن', subtitle: 'صورة زاوية', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={NOW155.text} source={NOW155.source} compact />
              <GeoFigure {...FIG_NOW155} />
              <NumericQuestion
                prompt={<MathText>{"ما قيس صورة الزاوية $\\widehat{AOB}$ بهذا الدوران، بالدرجات؟"}</MathText>}
                expected={45}
                requires={['khawas-dawaran']}
                explain={<MathText>{"الدوران يحافظ على الزوايا: قيس صورة $\\widehat{AOB}$ هو أيضا $45^\\circ$ ، مهما كانت زاوية الدوران."}</MathText>}
                explainFor={(n) => <MathText>{n === 105 ? 'لا نضيف زاوية الدوران: الدوران يحافظ على الزوايا.' : n === 60 ? 'هذه زاوية الدوران، لا قيس الصورة.' : 'الدوران يحافظ على الزوايا.'}</MathText>}
                onAnswered={mark(2)}
              />
              {q[2] && (
                <>
                  {/* la brique d'abord : tant que la prédiction est attendue, la figure-solution (qui MONTRE la
                      construction) reste masquée — elle la suit dans le même conteneur */}
                  <KnowledgeBrick id="surat-zawiya" />
                  <GeoFigure {...FIG_NOW155_SOL} />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'مركز دوران', subtitle: 'معارف من المنصّة', done: !!q[3],
          content: (
            <div className="space-y-3">
              <p data-evidence="p3" data-tried={answered('p3') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${answered('p3') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {answered('p3')
                  ? 'أجبتَ في المختبر: مركز الدوران يقع على محور كل قطعة تصل نقطة بصورتها، وهو نقطة واحدة تقاطع محورين.'
                  : 'في المستوى «متقدم» افتح التمرين 18، وضع الدبوس، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
              </p>
              {answered('p3') && <TapQuestion
                prompt={<MathText>{"M′ و N′ صورتا M و N بدوران مركزه W، لكن محوري [MM′] و [NN′] منطبقان. كيف نجد W؟"}</MathText>}
                options={[
                  'نرسم محور قطعة أخرى تصل نقطة بصورتها، مثل [PP′]',
                  'نأخذ W منتصف [MM′]', // OM = OM′ mais pas ON = ON′ en général
                  'لا يوجد مركز لهذا الدوران', // le centre existe : W
                ].map(M)}
                correct={0}
                cols={1}
                requires={['khawas-dawaran']}
                explain={<MathText>{CENTER.warning}</MathText>}
                onAnswered={mark(3)}
              />}
              {q[3] && <KnowledgeBrick id="markaz-dawaran" lead="ما يفعله الدبوس في المستوى «متقدم» (تمرين 18):" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
