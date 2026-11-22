import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT6, ACT6_LINES, LAB, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_ACT6, FIG_ACT6_SOL } from '../content/figures';

/**
 * Module 1 — نشاط 6 « التكبير - التصغير » (p. 165), ouvert sur LES BLOCS DE CONSTRUCTION (scale-blocks).
 *
 * REAL / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 6) : le pavé 5 × 4 × 3 bâti en 60 cubes ; k tenu au doigt ; réduction 3/5 (60 cubes
 *          d'arête 0,6 : 12,96 cm³), agrandissement 2 (480 cubes unités), chaque volume PRÉDIT avant le bâti ; le contraste
 *          « + 1 cm partout » (6/5 ≠ 5/4 ≠ 4/3) ;
 *   مبتدئ : un cube d'arête 1 agrandi de 2 puis de 3 (8, 27 cubes).
 * UNDERSTAND  les questions du نشاط 6 (1, 2 أ, 2 ب) sous les bâtis de l'élève (`onTrial`, `[data-activity-evidence]`), la figure
 *           solution (le pavé et sa réduction côte à côte) après la réponse ; la brique « takbir-tajribi » ; puis la même règle
 *           pour k = 2 (ajout de la plateforme). AUCUNE étape n'attend `onFinished`. LP : P1, P2.
 * « أتوقّع القاعدة » : la question 2 ب du نشاط 6 ÉNONCE la règle (« تحقّق أنّ V′ = (3/5)³V و A′ = (3/5)²A ») ; elle est donc
 * enveloppée, avec sa question, dans <PredictRule id="takbir-tajribi"> — l'élève écrit d'abord, sous ses bâtis, par quoi
 * l'aire et le volume sont multipliés (predictPrompt de knowledge.jsx).
 * La « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la dernière étape : le même jeu de construction, un autre pavé (8 × 6 × 4)
 * réduit de 3/4, résolu au module 5.
 * Rétrofit 2026-10-15 (§4quater) : le labo en tête (ni carte ni vignette, ni titre/`lead` de workspace) ; la première étape part de
 * ce que l'élève vient de BÂTIR (pourquoi 8 cubes et non 2) ; les questions du نشاط 6 viennent ensuite, comme application sur les
 * bâtis du pavé ; la brique `takbir-tajribi` reste après la question 2 ب (sous « أتوقّع القاعدة »).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q0, setQ0] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.tk) setTrials((s) => [...s, ev].slice(-8)); };

  // les bâtis du cube (مبتدئ : dims égales) et ceux du pavé du نشاط 6 (متقدم)
  const isCube = (t) => Array.isArray(t.dims) && t.dims.every((d) => d === t.dims[0]);
  const cubeTrials = trials.filter(isCube);
  const boxTrials = trials.filter((t) => !isCube(t));
  const evidenceOf = (list, none, head, kind) => (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={kind} data-tried={list.length ? 'true' : 'false'}>
      {list.length === 0 ? (
        <p className="text-slate-500">{none}</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">{head}</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence="builds">
            {list.map((t) => (
              <li key={t.n} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.kind === 'plus' || !t.ok ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`} data-evidence-build={t.kind === 'plus' ? 'plus' : t.k}>
                {t.kind === 'plus'
                  ? <MathText>{`$+1$ لكل حرف: $${t.dims.join(' \\times ')}$ صار $${t.image.join(' \\times ')}$`}</MathText>
                  : <MathText>{`$k = ${t.k}$ : $${t.dims.map((d) => d.replace(',', '{,}')).join(' \\times ')}$ ، $\\mathcal{V}' = ${t.volume.replace(',', '{,}')}$`}</MathText>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
  const evidence = evidenceOf(boxTrials, 'لم تبنِ بعد أي مجسّم في المستوى «متقدم» (النشاط 6) في المناولة أعلاه.', 'بناءاتك في النشاط 6:', 'builds');
  const cubeEvidence = evidenceOf(cubeTrials, 'لم تبنِ بعد أي مكعّب في المناولة أعلاه.', 'بناءاتك بالمكعبات:', 'cube');

  return (
    <ContentModule
      objectives={["ماذا يحدث لأحرف المجسّم ومساحته وحجمه حين نكبّره أو نصغّره؟", "بأيّ عدد تُضرب المساحة وبأيّ عدد يُضرب الحجم؟", "هل تكفي إضافة $1\\,\\mathrm{cm}$ لكل حرف؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 6 — مكعبات البناء"
      moduleSubtitle="نكبّر مجسّما أو نصغّره بنسبة k: ماذا يحدث لأحرفه ومساحته وحجمه؟"
      estimatedTime="15 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="scale-blocks"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="voxel-blocks"
                title="مكعّب في لعبة البناء: كبّره مرّتين ثم ثلاث مرّات"
                lead={<MathText>{'مكعّب حرفه $1\\,\\mathrm{cm}$ . كبّره بالنسبة $k = 2$ ثم $k = 3$ ، وتوقّع كل مرة كم مكعّبا يحتاج اللاعب.'}</MathText>}
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="scale-blocks"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="voxel-blocks"
                title="نشاط 6: صغّر متوازي المستطيلات بالنسبة ثلاثة أخماس ثم كبّره مرّتين"
                lead={<MathText>{'$AB = 5$ ، $BC = 4$ ، $AE = 3$ (بالسنتيمتر): صغّره بالنسبة $k = \\dfrac{3}{5}$ ثم كبّره بالنسبة $k = 2$ ، ثم جرّب «أضف $1\\,\\mathrm{cm}$ لكل حرف».'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا ثمانية مكعبات وليس اثنين؟', subtitle: 'من بناءاتك', done: q0,
          content: (
            <div className="space-y-3">
              {cubeEvidence}
              <TapQuestion
                prompt={<MathText>{'كبّرت المكعّب بالنسبة $k = 2$ فصار حرفه ضعفين، لكنّ اللعبة طلبت منك ثمانية مكعبات صغيرة لا اثنين. لماذا؟'}</MathText>}
                options={['لأنّ المكعّب يتضاعف في الطول وفي العرض وفي الارتفاع معًا', 'لأنّ المكعّب يتضاعف في اتجاه واحد فقط', 'لأنّ اللعبة تضيف دائما مكعبا لكل وجه من أوجهه']}
                correct={0}
                cols={1}
                explain={<MathText>{'في كل اتجاه صار الحرف مكعبين: $2 \\times 2 \\times 2 = 8$ . وبالنسبة $k = 3$ نجد $3 \\times 3 \\times 3 = 27$ .'}</MathText>}
                onAnswered={() => setQ0(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'نشاط 6: الحجم والمساحة الكلية', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACT6.part1} source={ACT6.source} compact />
              <SpaceFigure {...FIG_ACT6} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                rows={[
                  // 47 : la somme des trois faces (5×4 + 4×3 + 5×3) ; 12 : la somme des trois arêtes
                  { id: 'v', label: <MathText>{'الحجم $\\mathcal{V}$'}</MathText>, options: ['$60\\,\\mathrm{cm}^3$', '$47\\,\\mathrm{cm}^3$', '$12\\,\\mathrm{cm}^3$'].map(M), correct: 0, correction: <MathText>{ACT6_LINES.v}</MathText> },
                  // 47 : les trois faces différentes, sans leurs faces opposées ; 60 : le volume
                  { id: 'a', label: <MathText>{'المساحة الكلية $\\mathcal{A}$'}</MathText>, options: ['$94\\,\\mathrm{cm}^2$', '$47\\,\\mathrm{cm}^2$', '$60\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{ACT6_LINES.a}</MathText> },
                ]}
                requires={['masaha-kulliya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: 60 مكعّبا، و 94 مربّعا على الأوجه الستة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'نشاط 6: أبعاد المجسّم المصغّر', subtitle: 'السؤال 2 أ', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACT6.part2a} source={ACT6.source} compact />
              {evidence}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">أبعاد المجسّم A′B′C′D′E′F′G′H′ (كما رأيتها في المشهد):</p>}
                rows={[
                  // 4,4 : 5 − 3/5 (on retranche au lieu de multiplier) ; 25/3 : 5 ÷ 3/5 (le rapport renversé)
                  { id: 'ab', label: 'A′B′', options: ['$3\\,\\mathrm{cm}$', '$4{,}4\\,\\mathrm{cm}$', '$\\dfrac{25}{3}\\,\\mathrm{cm}$'].map(M), correct: 0, correction: 'الطول يُضرب في النسبة.' },
                  { id: 'bc', label: 'B′C′', options: ['$2{,}4\\,\\mathrm{cm}$', '$3{,}4\\,\\mathrm{cm}$', '$\\dfrac{20}{3}\\,\\mathrm{cm}$'].map(M), correct: 0, correction: 'نفس النسبة لكل الأحرف.' },
                  { id: 'ae', label: 'A′E′', options: ['$1{,}8\\,\\mathrm{cm}$', '$2{,}4\\,\\mathrm{cm}$', '$5\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{ACT6_LINES.dims}</MathText> },
                ]}
                requires={['nisbat-takbir-mustawi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الأحرف الثلاثة ضُربت في نفس العدد.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <SpaceFigure {...FIG_ACT6_SOL} />}
            </div>
          ),
        },
        {
          num: 4, title: 'نشاط 6: حجم المصغّر ومساحته', subtitle: 'السؤال 2 ب', done: q3,
          content: (
            <div className="space-y-3">
              {evidence}
              <PredictRule id="takbir-tajribi">
                <TextbookBox kind="situation" text={ACT6.part2b} source={ACT6.source} compact />
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">اختر لكل سطر:</p>}
                  rows={[
                    // 36 : V × 3/5 ; 21,6 : V × (3/5)² (MISC-TAKBIR-HAJM-K)
                    { id: 'v2', label: <MathText>{"الحجم $\\mathcal{V}'$"}</MathText>, options: ['$12{,}96\\,\\mathrm{cm}^3$', '$36\\,\\mathrm{cm}^3$', '$21{,}6\\,\\mathrm{cm}^3$'].map(M), correct: 0, correction: <MathText>{ACT6_LINES.v2}</MathText> },
                    // 56,4 : A × 3/5 (MISC-TAKBIR-MISAHA-K) ; 20,304 : A × (3/5)³
                    { id: 'a2', label: <MathText>{"المساحة الكلية $\\mathcal{A}'$"}</MathText>, options: ['$33{,}84\\,\\mathrm{cm}^2$', '$56{,}4\\,\\mathrm{cm}^2$', '$20{,}304\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{ACT6_LINES.a2}</MathText> },
                    { id: 'chk', label: <MathText>{"$\\mathcal{V}' = \\left(\\dfrac{3}{5}\\right)^3\\mathcal{V}$ و $\\mathcal{A}' = \\left(\\dfrac{3}{5}\\right)^2\\mathcal{A}$"}</MathText>, options: ['المساواتان صحيحتان', 'الأولى فقط صحيحة', 'الثانية فقط صحيحة'], correct: 0, correction: <MathText>{`${ACT6_LINES.checkV} ؛ ${ACT6_LINES.checkA}`}</MathText> },
                  ]}
                  requires={['nisbat-takbir-mustawi']}
                  feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الأحرف × 3/5، المساحة × (3/5)²، الحجم × (3/5)³.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                  onAnswered={() => setQ3(true)}
                />
              </PredictRule>
              {q3 && <KnowledgeBrick id="takbir-tajribi" lead="ما وجدته بالمكعبات وبالحساب:" />}
            </div>
          ),
        },
        {
          num: 5, title: 'وماذا لو كبّرناه بالنسبة 2؟', subtitle: 'هل تتغيّر النتيجة؟', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text="نكبّر الآن متوازي المستطيلات ABCDEFGH (5 و 4 و 3) بالنسبة $k = 2$ ، كما فعلت في المستوى «متقدم»." source={PLATFORM_SOURCE} compact />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">دون إعادة حساب الأبعاد:</p>}
                rows={[
                  // 120 : × 2 ; 240 : × 2² (MISC-TAKBIR-HAJM-K)
                  { id: 'v', label: <MathText>{'حجم المجسّم الناتج'}</MathText>, options: ['$480\\,\\mathrm{cm}^3$', '$120\\,\\mathrm{cm}^3$', '$240\\,\\mathrm{cm}^3$'].map(M), correct: 0, correction: <MathText>{'$2^3 \\times 60 = 8 \\times 60 = 480\\,\\mathrm{cm}^3$ : كل مكعّب صار ثمانية مكعّبات.'}</MathText> },
                  // 188 : × 2 (MISC-TAKBIR-MISAHA-K) ; 752 : × 2³
                  { id: 'a', label: <MathText>{'مساحته الكلية'}</MathText>, options: ['$376\\,\\mathrm{cm}^2$', '$188\\,\\mathrm{cm}^2$', '$752\\,\\mathrm{cm}^2$'].map(M), correct: 0, correction: <MathText>{'$2^2 \\times 94 = 376\\,\\mathrm{cm}^2$ ، وتحقّق: $2(10 \\times 8 + 8 \\times 6 + 10 \\times 6) = 376$ .'}</MathText> },
                ]}
                requires={['takbir-tajribi']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نفس القاعدة في التكبير والتصغير.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
