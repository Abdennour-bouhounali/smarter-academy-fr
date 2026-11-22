import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { TextbookBox } from '../../../../../../common/textbook';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { MODULE_CTX, getNavLinks, useStudentPlayer } from '../moduleContext';
import { M2_ROUNDS } from '../content/pairs';
import { KNOWLEDGE, CASES_LINES } from '../content/textbook';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — معارف, écrit par la PLATEFORME (rollout 2026-11-12, verdict L1 ; X5 : pas de labo ; OQ1 : pas de manche « اللوحة العنيدة ») :
 *   1. la définition (brique jumla-tarif) et les coefficients (a, b, c, a', b', c') ;
 *   2. la définition du حل (hall-jumla), une question sur (6 ; −1) DANS la jumla de l'exemple (x + 2y = 4 ∣ 3x − y = 5), puis l'exemple
 *      (2 ; 1) / (0 ; 2) et la brique ikhtibar-thunaiya qui nomment APRÈS la réponse ;
 *   3. l'ordre dans la ثنائية (tartib-thunaiya) — (3 ; 2) et (2 ; 3) ;
 *   4. les deux cas particuliers (2x + y = 3 ∣ 6x + 3y = 9 ; x − y = 1 ∣ 3x − 3y = 5) côte à côte, la brique halat-khassa, puis trois jumal à classer ;
 *   5. « ورقة صهيب » (content/peerSheet.js) : le signe perdu en substituant une valeur négative.
 * Chaque question porte sa jumla DANS son énoncé (aucun aller-retour). LP : P1, P2, P3, P4.
 * LECTEUR — décision du propriétaire OQ1 (2026-11-12, remplace le « non » par défaut du verdict) : le module s'ouvre sur DEUX manches courtes du
 * tableau (`lab-pair-m2`, content/pairs.js › M2_ROUNDS) — un sac de pièces de 50 دج dont la jauge (2) ne s'allume JAMAIS avec la (1), puis un
 * sac où elle s'allume TOUJOURS ; l'étape 4 (les cas particuliers) relit les deux sacs de l'élève, À CÔTÉ de sa prédiction. La page (enseignant)
 * est inchangée (pas de labo).
 */
const Opt = (s) => <MathText key={s}>{s}</MathText>;
const CASES = ['لها حل وحيد', 'ليس لها حلول', 'لها عدد غير منته من الحلول'];

/** Les deux sacs du module, relus par l'étape des cas particuliers (lecteur). */
function Bags({ won }) {
  const bag = (id, tone, title, line, wait) => (
    <div className={`rounded-xl border-2 p-3 text-sm ${won[id] ? tone : 'border-slate-200 bg-white text-slate-500'}`} data-evidence={id} data-tried={won[id] ? 'true' : 'false'}>
      <p className="mb-1 font-bold">{won[id] && <span aria-hidden="true">✓ </span>}{title}</p>
      <p><MathText>{won[id] ? line : wait}</MathText></p>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-2" data-activity-evidence data-paging-keep>
      {bag('m2a', 'border-rose-200 bg-rose-50/60 text-rose-950', 'الكيس الأول: 280 دج', '$\\begin{cases} x + y = 6 \\\\ 50x + 50y = 280 \\end{cases}$ : لم تُضئ اللوحتان معًا ولو مرّة — كل 6 قطع تعطي 300 دج.', 'لم تلعب هذا الكيس بعد.')}
      {bag('m2b', 'border-sky-200 bg-sky-50/60 text-sky-950', 'الكيس الثاني: 300 دج', '$\\begin{cases} x + y = 6 \\\\ 50x + 50y = 300 \\end{cases}$ : أضاءت اللوحتان معًا مع كل ثنائية تعطي 6 قطع.', 'لم تلعب هذا الكيس بعد.')}
    </div>
  );
}

export default function Module02Maarif() {
  const player = useStudentPlayer();
  const [won, setWon] = useState({});
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الجملة وحلّها"
      moduleSubtitle="جملة معادلتين، حلّها، الترتيب، والحالات الخاصة"
      objectives={['ما شكل جملة معادلتين؟ وما معنى حلّها؟', 'هل يهمّ ترتيب العددين في الثنائية؟', 'متى لا يكون للجملة حل وحيد؟']}
      estimatedTime="16 دقيقة"
      intro={
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-pair-m2" rounds={M2_ROUNDS} icon="🪙" freeIcon="🧮"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={null}
        />
      }
      // lecteur : le labo OUVRE le module, rien au-dessus (§4quater) — la carte « معارف » reste sur la page
      brief={player ? undefined : {
        tag: 'معارف', title: KNOWLEDGE.system.title, tone: 'violet',
        body: <p><MathText>{'على لوحة الشرطين كتبنا شرطين على عددين، ووجدنا ثنائية تقبلها اللوحتان معًا. هنا نسمّي هذا الشكل، ونعرّف حلّه، ونرى حالتين خاصتين.'}</MathText></p>,
      }}
      steps={[
        {
          num: 1, title: 'جملة معادلتين', subtitle: 'الشكل والمعاملات', done: q1a && q1b,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="jumla-nashat" variant="rappel" compact />
              <PredictRule id="jumla-tarif">
                <TextbookBox kind="definition" text={KNOWLEDGE.system.definition} source={KNOWLEDGE.system.source} compact />
                <TextbookBox kind="example" text={KNOWLEDGE.system.example} source={KNOWLEDGE.system.source} compact />
              </PredictRule>
              <KnowledgeBrick id="jumla-tarif" lead="جملة حصّالة القسم من هذا الشكل:" />
              <TapQuestion
                prompt={<MathText>{'في الجملة $\\begin{cases} 3x + y = 5 \\\\ x - 4y = -2 \\end{cases}$ ، المعامل $b\'$ يساوي:'}</MathText>}
                options={['$-4$', '$4$', '$1$', '$-2$'].map(Opt)}
                correct={0}
                cols={4}
                requires={['jumla-tarif']}
                explain={<MathText>{'المعادلة الثانية $a\'x + b\'y = c\'$ هي $x - 4y = -2$ : $a\' = 1$ ، $b\' = -4$ (المعامل بإشارته) و $c\' = -2$.'}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">هل هي جملة معادلتين من الدرجة الأولى بمجهولين؟</p>}
                rows={[
                  { id: 'j1', label: <MathText>{'$\\begin{cases} 5x - y = 0 \\\\ x + 3y = 7 \\end{cases}$'}</MathText>, options: ['نعم', 'لا'], correct: 0, correction: <MathText>{'معادلتان من الشكل $ax + by = c$ : $a = 5$ ، $b = -1$ ، $c = 0$ و $a\' = 1$ ، $b\' = 3$ ، $c\' = 7$.'}</MathText> },
                  { id: 'j2', label: <MathText>{'$\\begin{cases} x + y = 3 \\\\ x^2 - y = 1 \\end{cases}$'}</MathText>, options: ['نعم', 'لا'], correct: 1, correction: <MathText>{'في المعادلة الثانية $x^2$ : المجهول $x$ من الدرجة الثانية، فهي ليست من الشكل $a\'x + b\'y = c\'$.'}</MathText> },
                ]}
                requires={['jumla-tarif']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1b(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'حل الجملة', subtitle: 'المعادلتان في آن واحد', done: q2,
          content: (
            <div className="space-y-3">
              <PredictRule id="hall-jumla" prompt={'ما الذي جعل الثنائية التي قبلتها اللوحتان في الجولات حلًّا للجملة؟ متى نقول إنّ ثنائية $(x_0 ; y_0)$ حلّ لجملة معادلتين؟ وماذا يعني «حلّ الجملة»؟'}><TextbookBox kind="definition" title={KNOWLEDGE.solution.title} lines={[KNOWLEDGE.solution.definition, KNOWLEDGE.solution.rule]} source={KNOWLEDGE.solution.source} compact /></PredictRule>
              <KnowledgeBrick id="hall-jumla" lead="ما قبلته لوحتا الشرطين، معرَّفًا:" />
              <TapQuestion
                prompt={<MathText>{'هل الثنائية $(6 ; -1)$ حلّ للجملة $\\begin{cases} x + 2y = 4 \\\\ 3x - y = 5 \\end{cases}$ ؟'}</MathText>}
                options={['نعم: $6 + 2 \\times (-1) = 4$', 'لا: $3 \\times 6 - (-1) = 19 \\neq 5$', 'لا: $6 + 2 \\times (-1) \\neq 4$'].map(Opt)}
                correct={1}
                cols={1}
                requires={['hall-jumla']}
                explain={<MathText>{'المعادلة الأولى محقّقة: $6 + 2 \\times (-1) = 4$ ، لكن الثانية لا: $18 + 1 = 19 \\neq 5$. معادلة واحدة لا تكفي: $(6 ; -1)$ ليست حلًّا للجملة.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="example" lines={KNOWLEDGE.solution.examples} source={KNOWLEDGE.solution.source} compact />}
              {q2 && <KnowledgeBrick id="ikhtibar-thunaiya" lead="ما فعلتَه للتوّ، طريقةً:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'الترتيب في الثنائية', subtitle: 'العدد الأول لـ x', done: q3,
          content: (
            <div className="space-y-3">
              <PredictRule id="tartib-thunaiya"><TextbookBox kind="remark" text={KNOWLEDGE.solution.note} source={KNOWLEDGE.solution.source} compact /></PredictRule>
              <KnowledgeBrick id="tartib-thunaiya" />
              <TapQuestion
                prompt={<MathText>{'الثنائية $(3 ; 2)$ حلّ للجملة $\\begin{cases} x + 2y = 7 \\\\ 3x - y = 7 \\end{cases}$. هل الثنائية $(2 ; 3)$ حلّ لها؟'}</MathText>}
                options={['نعم: فيها العددان نفسهما', 'لا: $2 + 2 \\times 3 = 8 \\neq 7$', 'لا يمكن أن نعرف دون حلّ الجملة'].map(Opt)}
                correct={1}
                cols={1}
                requires={['tartib-thunaiya', 'ikhtibar-thunaiya']}
                explain={<MathText>{'في $(2 ; 3)$ لدينا $x = 2$ و $y = 3$ : $2 + 2 \\times 3 = 8 \\neq 7$. أمّا $(3 ; 2)$ فتعطي $3 + 4 = 7$ و $9 - 2 = 7$. نعرف ذلك بالتعويض، دون حلّ الجملة.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          ...(player ? { needsRound: { id: 'm2b', label: 'الكيس الثاني', icon: '🪙', won: Boolean(won.m2b) } } : {}),
          num: 4, title: 'حالات خاصة', subtitle: 'جملتان تُبسَّطان', done: q4,
          content: (
            <div className="space-y-3">
              {player && <Bags won={won} />}
              {/* L'encadré et les calculs écrits concluent déjà (« لا حلول » / « عدد غير منته ») : enveloppés, l'élève simplifie et prédit d'abord
                  (predictPrompt de halat-khassa). Les deux cas CÔTE À CÔTE, jamais empilés. */}
              <PredictRule id="halat-khassa">
                <TextbookBox kind="remark" title={KNOWLEDGE.cases.title} lines={KNOWLEDGE.cases.items} source={KNOWLEDGE.cases.source} compact />
                <div className="grid grid-cols-2 gap-2" data-cases-lines data-paging-keep>
                  <div className="rounded-xl border-2 border-sky-200 bg-sky-50/60 p-3 text-sm" data-case="infinite">
                    <p className="mb-1 font-bold text-sky-900">1) معادلة واحدة مرّتين</p>
                    <ol className="space-y-1">{CASES_LINES.infinite.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
                  </div>
                  <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-3 text-sm" data-case="none">
                    <p className="mb-1 font-bold text-rose-900">2) معادلتان متناقضتان</p>
                    <ol className="space-y-1">{CASES_LINES.none.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
                  </div>
                </div>
                <p className="text-xs text-slate-500"><MathText>{CASES_LINES.unique}</MathText></p>
              </PredictRule>
              <KnowledgeBrick id="halat-khassa" lead="هاتان الحالتان، مكتوبتين:" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">صنّف كل جملة:</p>}
                rows={[
                  { id: 'c1', label: <MathText>{'$\\begin{cases} x + y = 4 \\\\ 2x + 2y = 8 \\end{cases}$'}</MathText>, options: CASES, correct: 2, correction: <MathText>{'نقسم طرفي $2x + 2y = 8$ على 2: $x + y = 4$ ، المعادلة نفسها. كل ثنائية مجموعها 4 حلّ، مثل $(0 ; 4)$ و $(1 ; 3)$.'}</MathText> },
                  { id: 'c2', label: <MathText>{'$\\begin{cases} x + y = 4 \\\\ x + y = 5 \\end{cases}$'}</MathText>, options: CASES, correct: 1, correction: <MathText>{'لا يمكن أن يساوي $x + y$ العدد 4 والعدد 5 في آن واحد، و $4 \\neq 5$.'}</MathText> },
                  { id: 'c3', label: <MathText>{'$\\begin{cases} x + y = 8 \\\\ x - y = 4 \\end{cases}$'}</MathText>, options: CASES, correct: 0, correction: <MathText>{'عددان مجموعهما 8 وفرقهما 4: 6 و 2 فقط. الثنائية $(6 ; 2)$ : $6 + 2 = 8$ و $6 - 2 = 4$.'}</MathText> },
                ]}
                requires={['halat-khassa', 'ikhtibar-thunaiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ثلاث جمل، ثلاث حالات.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
        {
          num: 5, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
