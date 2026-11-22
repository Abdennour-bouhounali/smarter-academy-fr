import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { bidi } from '../../../../../../../utils/bidi';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, PLATFORM_NOTES } from '../content/textbook';
import { M1_ROUNDS } from '../content/pitches';

/**
 * Module 1 — « ملعب يكبر » : nashr (la compétence de نشاط 1, p. 32), ouvert par une accroche RÉELLE de la plateforme (déclarée) : le terrain de
 * l'école qu'on agrandit.
 *
 * LABORATOIRE À DEUX NIVEAUX, UN INSTRUMENT (pitch-expansion, le terrain découpé) — la PAGE (enseignant, mode classe) :
 *   متقدم : le terrain (3x − 1)(3 + x), quatre zones dont deux RETRANCHÉES ; l'élève les porte dans la somme, réunit les termes semblables (le
 *          laboratoire refuse x² + 8x) et vérifie pour deux x au moins.
 *   مبتدئ  : le terrain de l'école 3(x + 5) — deux zones. Pour x = 9 c'est 3 × (9 + 5).
 *
 * LES ÉTAPES : 1) « بطريقتين » (3 × (9 + 5) et un produit décimal de la plateforme), 2) جداء أم مجموع, 3) انشر وبسّط — deux expressions de la
 * plateforme, puis (3x − 1)(3 + x) répondu depuis les ESSAIS DE L'ÉLÈVE, en nommant la propriété chaque fois. Les briques `nashr-taarif` et
 * `nashr-qawsayn` nomment ce que l'élève vient de faire. LP : P1–P4.
 *
 * INDÉPENDANCE DU MANUEL (rollout 2026-11-11, conseil L1.8, SHARED — la page de l'enseignant y gagne aussi) : les textes des questions de
 * l'activité, ses nombres (2) et (3) et son « erreur d'impression » ne sont plus montrés ; les sous-titres ne numérotent plus les questions du
 * livre ; les expressions des étapes 2 et 3 sont celles de la plateforme.
 *
 * LECTEUR DE MISSION (rollout 2026-11-11, unité 3 leçon 1 ; conseil du 2026-11-11, verdict L1) : le labo se joue en MANCHES (content/pitches.js ›
 * M1_ROUNDS : 3(x + 5) en aires → (3x − 1)(3 + x) en aires → (x − 2)(2x − 1) requise → défi ⭐ → la ورشة libre) au lieu de مبتدئ / متقدم ; un essai
 * est un appui sur « تحقّق ». L'étape 1 attend la manche 1, l'étape 4 la manche 2 : ce que leur ligne de trace dit vient des manches GAGNÉES
 * (étoiles gardées, annoncées par LabRounds au montage) — un rechargement ne bloque ni ne vide jamais une étape. Aucune clé de réponse
 * gardée en plus (`lab-pitch` n'est pas nécessaire : les étoiles portent la trace). Hors lecteur : inchangé.
 */
const { q1a } = ACTIVITY.numbers;
// Le produit décimal de l'étape 1 (plateforme) : (5 − 1,5)(2 + 0,4) = 3,5 × 2,4 = 8,4 — en dixièmes (50 − 15)(20 + 4) / 100.
const Q1B = { a: 50, b: 15, c: 20, d: 4, scale: 10 };
const q1bValue = ((Q1B.a - Q1B.b) * (Q1B.c + Q1B.d)) / (Q1B.scale * Q1B.scale);
const fb = (right, wrong) => ({ allRight }) => (
  <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? right : wrong}</MathText></Feedback>
);
const M = (tex) => <MathText key={tex}>{tex}</MathText>;
const SUM = 'مجموع';
const PRODUCT = 'جداء';
const PROPS = ['$k(a + b) = ka + kb$', '$k(a - b) = ka - kb$', '$(a + b)(c + d) = ac + ad + bc + bd$'];

/** Les vérifications de l'élève sur un terrain, une ligne par valeur de x (la dernière fait foi). */
function Evidence({ trials, level, empty }) {
  const list = Object.values(trials).sort((u, v) => u.x - v.x);
  return (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={level}>
      {list.length === 0 && <li className="text-slate-500" data-tried="false">{empty}</li>}
      {list.map((tr) => (
        <li key={tr.x} data-tried="true" data-ok={tr.ok ? 'true' : 'false'} className={tr.ok ? 'font-bold text-emerald-900' : 'text-rose-900'}>
          {tr.ok
            ? <MathText>{`$x = ${tr.x}$ : مساحة الملعب $${tr.product}$ ومجموع المناطق $${tr.sum}$ ✓`}</MathText>
            : <MathText>{`$x = ${tr.x}$ : المجموع $${tr.sum}$ لا يساوي مساحة الملعب $${tr.product}$ (مناطق لم تُحسب: ${tr.missing.length})`}</MathText>}
        </li>
      ))}
    </ul>
  );
}

/** Lecteur : la ligne de trace d'une étape vient de la manche GAGNÉE (étoiles gardées), jamais d'un essai qu'un rechargement aurait effacé. */
function RoundEvidence({ won, round, yes, no }) {
  return (
    <p className={`rounded-xl border-2 px-3 py-2 text-sm ${won ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}
      data-activity-evidence={round} data-tried={won ? 'true' : 'false'}>
      {won ? <><span aria-hidden="true">✓ </span><MathText>{yes}</MathText></> : <MathText>{no}</MathText>}
    </p>
  );
}

export default function Module01Nashat() {
  const [small, setSmall] = useState({});
  const [big, setBig] = useState({});
  const [q1a1, setQ1a1] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q5, setQ5] = useState(false);
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent les étapes et remplissent leur trace
  const [won, setWon] = useState({});

  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : le terrain متقدّم est « fait » quand sa suite de questions l'est
  const [cps, setCps] = useState([]);
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const keep = (set) => (trial) => { if (trial?.x != null) set((t) => ({ ...t, [trial.x]: trial })); };
  const bigVerified = Object.values(big).filter((t) => t.ok).length;
  const bigDone = answered(ACTIVITY.pitch.advanced);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["كيف نحسب مساحة ملعب مقسّم إلى مناطق؟", "هل العبارة جداء أم مجموع؟ وكيف نعرف؟", "ماذا نفعل بحدود لا تتشابه؟"]}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="ملعب يكبر: نشر عبارة جبرية"
      moduleSubtitle="ملعب مقسّم إلى مناطق"
      estimatedTime="14 دقيقة"
      intro={
        // LE LABO OUVRE LE MODULE (§4quater). Lecteur : les MANCHES (content/pitches.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-pitch" rounds={M1_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="pitch-expansion"
                level="beginner"
                expr={ACTIVITY.pitch.beginner}
                span={9}
                title={bidi('ملعب المتوسطة: عرضه 3 وطوله x + 5')}
                lead={<MathText>{'قرّرت إدارة المتوسطة إطالة ملعب كرة القدم: عرضه $3$ وطوله $x + 5$. جرّب $x = 9$ بين قيمك.'}</MathText>}
                onTrial={keep(setSmall)}
                onCheckpoint={onCheckpoint}
              />
            ),
            advanced: () => (
              <Manipulation
                type="pitch-expansion"
                level="advanced"
                expr={ACTIVITY.pitch.advanced}
                title={bidi('ملعب بعداه 3x − 1 و 3 + x')}
                lead={<MathText>{'أربع مناطق، منها اثنتان مقتطعتان (مخطّطتان).'}</MathText>}
                onTrial={keep(setBig)}
                onCheckpoint={onCheckpoint}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚽', won: Boolean(won.r1) },
          num: 1, title: 'احسب بطريقتين مختلفتين', subtitle: 'جداء أم مجموع مناطق؟', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{`احسب كل عبارة بطريقتين: $${q1a.k} \\times (${q1a.a} + ${q1a.b})$ ، ثم $(5 - 1{,}5)(2 + 0{,}4)$ .`}</MathText></p>
              <PlayerSwitch
                player={<RoundEvidence won={won.r1} round="r1" yes={`الجولة 1: مساحة الملعب $3(x + 5)$ تساوي مجموع مساحتي منطقتيه، من أجل قيمتين لـ $x$ .`} no="الجولة 1: لم تتحقّق بعد من الملعب الأول." />}
                page={(
                  <>
                    <p className="text-sm font-semibold text-slate-700">تحقّقاتك على ملعب المتوسطة (المستوى المبتدئ):</p>
                    <Evidence trials={small} level="beginner" empty="لم تتحقّق بعد من ملعب المستوى المبتدئ: افتحه وجرّب." />
                  </>
                )}
              />
              <NumericQuestion
                prompt={<MathText>{`$${q1a.k} \\times (${q1a.a} + ${q1a.b}) = \\ldots$`}</MathText>}
                expected={q1a.k * (q1a.a + q1a.b)}
                requires={['awlawiyat-hisab', 'khassiya-tawziiya']}
                explain={<MathText>{`الطريقة الأولى: $${q1a.k} \\times ${q1a.a + q1a.b} = ${q1a.k * (q1a.a + q1a.b)}$. الطريقة الثانية، منطقةً منطقة كما في الملعب: $${q1a.k} \\times ${q1a.a} + ${q1a.k} \\times ${q1a.b} = ${q1a.k * q1a.a} + ${q1a.k * q1a.b} = ${q1a.k * (q1a.a + q1a.b)}$.`}</MathText>}
                explainFor={(n) => (n === q1a.k * q1a.a + q1a.b
                  ? <MathText>{`ضربت ${q1a.k} في ${q1a.a} وحده: المنطقة الثانية مساحتها $${q1a.k} \\times ${q1a.b} = ${q1a.k * q1a.b}$ أيضًا.`}</MathText>
                  : undefined)}
                onAnswered={() => setQ1a1(true)}
              />
              {q1a1 && (
                <NumericQuestion
                  prompt={<MathText>{'$(5 - 1{,}5)(2 + 0{,}4) = \\ldots$'}</MathText>}
                  expected={(n) => Math.abs(n - q1bValue) < 1e-9}
                  parse={parseDec}
                  display="8,4"
                  requires={['awlawiyat-hisab', 'khassiya-tawziiya']}
                  explain={<MathText>{'الطريقة الأولى: $3{,}5 \\times 2{,}4 = 8{,}4$. الطريقة الثانية، كل حدّ في كل حدّ: $10 + 2 - 3 - 0{,}6 = 8{,}4$.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'جداء أم مجموع؟', subtitle: 'آخر عملية تُنجز', done: q2,
          content: (
            <div className="space-y-3">
            <BatchChoiceQuestion
              intro={<p className="text-sm font-semibold text-slate-700">ميّز العبارات التي تدلّ على جداء من التي تدلّ على مجموع:</p>}
              rows={[
                { id: 'e1', label: M('$x(2x + 5)$'), options: [SUM, PRODUCT], correct: 1, correction: 'آخر عملية: ضرب $x$ في القوس' },
                { id: 'e2', label: M('$x + (4 - 3x)$'), options: [SUM, PRODUCT], correct: 0, correction: 'آخر عملية: جمع $x$ والقوس' },
                { id: 'e3', label: M('$3x(2 - x)$'), options: [SUM, PRODUCT], correct: 1, correction: 'آخر عملية: ضرب $3x$ في القوس' },
                { id: 'e4', label: M('$x(x + 2) - 1 + (x + 2)$'), options: [SUM, PRODUCT], correct: 0, correction: 'ثلاثة حدود يجمعها $-$ و $+$: فيها جداء، لكن آخر عملية جمع' },
                { id: 'e5', label: M('$(3x - 1)(3 + x)$'), options: [SUM, PRODUCT], correct: 1, correction: 'آخر عملية: ضرب القوسين، كمساحة الملعب ذي المنطقتين المقتطعتين' },
              ].map((r) => ({ ...r, correction: <MathText>{r.correction}</MathText> }))}
              requires={['awlawiyat-hisab']}
              feedback={fb(PLATFORM_NOTES.classify, PLATFORM_NOTES.classify)}
              onAnswered={() => setQ2(true)}
            />
            {q2 && <KnowledgeBrick id="nashr-taarif" lead="ما ميّزته الآن له اسم: نكتب الجداء مجموعًا." />}
            </div>
          ),
        },
        {
          num: 3, title: 'انشر وبسّط، واذكر الخاصية', subtitle: 'عدد أو حرف أمام قوس', done: q3,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-800"><MathText>{'انشر كل عبارة وبسّطها، واذكر الخاصية التي اعتمدت عليها: $x(2x + 5)$ و $3x(2 - x)$ .'}</MathText></p>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600"><MathText>{'العبارة $3x(2 - x)$ ليست ملعبًا: $2 - x$ سالب لكل $x$ أكبر من 2. نجيب بالحساب.'}</MathText></p>}
                rows={[
                  { id: 'a', label: M('$x(2x + 5) = \\ldots$'), options: ['$2x^2 + 5x$', '$2x^2 + 5$', '$7x^2$'].map(M), correct: 0, correction: M('$x \\times 2x + x \\times 5 = 2x^2 + 5x$') },
                  { id: 'ap', label: 'الخاصية المعتمدة', options: PROPS.map(M), correct: 0, correction: M('$k(a + b) = ka + kb$ مع $k = x$') },
                  { id: 'b', label: M('$3x(2 - x) = \\ldots$'), options: ['$6x + 3x^2$', '$6x - 3x^2$', '$3x$'].map(M), correct: 1, correction: M('$3x \\times 2 - 3x \\times x = 6x - 3x^2$') },
                  { id: 'bp', label: 'الخاصية المعتمدة', options: PROPS.map(M), correct: 1, correction: M('$k(a - b) = ka - kb$ مع $k = 3x$') },
                ]}
                requires={['nashr-taarif', 'khassiya-tawziiya', 'jidaa-x-fi-x']}
                feedback={fb('نضرب العامل الذي أمام القوس في كل حد بداخله: $x \\times x = x^2$.', 'العامل الذي أمام القوس يُضرب في كل حد بداخله، و $x \\times x = x^2$ لا $2x$.')}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚽', won: Boolean(won.r2) },
          num: 4, title: 'جداء قوسين: الملعب ذو الممرّ', subtitle: 'من تحقّقاتك على الملعب', done: bigDone || Boolean(won.r2),
          content: (
            <div className="space-y-3">
              <PlayerSwitch
                player={<RoundEvidence won={won.r2} round="r2" yes={'الجولة 2: كتبتَ مناطق الملعب الأربع $9x + 3x^2 - 3 - x$ ، وتحقّقت من قيمتين لـ $x$ : هذه خاصية $(a + b)(c + d) = ac + ad + bc + bd$ .'} no="الجولة 2: لم تكتب بعد مناطق الملعب ذي الممرّ المقتطع." />}
                page={(
                  <>
                    <p className="text-sm font-semibold text-slate-700"><MathText>{'تحقّقاتك على الملعب $(3x - 1)(3 + x)$:'}</MathText></p>
                    <Evidence trials={big} level="advanced" empty="لم تتحقّق بعد من ملعب المستوى المتقدّم: احسب كل مناطقه ثم اضغط «تحقّق»." />
                    {bigVerified < 2 && <p className="text-xs text-slate-500"><MathText>{'تحقّق من أجل قيمتين لـ $x$ على الأقل: هل بقيت المساواة صحيحة في كل مرّة؟'}</MathText></p>}
                    <p data-evidence="checkpoint" data-tried={bigDone ? 'true' : 'false'}
                      className={`rounded-xl border-2 px-3 py-2 text-sm ${bigDone ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                      {bigDone
                        ? <MathText>{'أجبتَ في المختبر: مناطق الملعب الأربع $9x + 3x^2 - 3 - x$ ، وبعد جمع الحدّين المتشابهين $3x^2 + 8x - 3$ ، وهذه خاصية $(a + b)(c + d) = ac + ad + bc + bd$.'}</MathText>
                        : 'احمل مناطق الملعب المتقدّم كلّها، وتحقّق من قيمتين، ثم أجب عن الأسئلة التي تظهر فوق المختبر.'}
                    </p>
                  </>
                )}
              />
              {(bigDone || won.r2) && <KnowledgeBrick id="nashr-qawsayn" lead="ما فعلته في الملعب: كل حد من الضلع الأول في كل حد من الضلع الثاني." />}
            </div>
          ),
        },
        {
          num: 5, title: 'عودة إلى الملعب ذي الممرّ', subtitle: 'شكلان لعبارة واحدة', done: q5,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'من أجل $x = 4$ ، احسب مساحة الملعب $3x^2 + 8x - 3$ (الشكل المنشور):'}</MathText>}
                expected={3 * 4 * 4 + 8 * 4 - 3}
                requires={['nashr-qawsayn']}
                explain={<MathText>{'$3 \\times 16 + 32 - 3 = 77$ ، وبالشكل الأول: $(3 \\times 4 - 1)(3 + 4) = 11 \\times 7 = 77$. الشكلان متساويان مهما كان $x$.'}</MathText>}
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
