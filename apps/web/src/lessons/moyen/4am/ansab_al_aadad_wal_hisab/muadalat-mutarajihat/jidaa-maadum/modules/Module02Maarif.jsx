import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY_C, KNOWLEDGE } from '../content/textbook';
import { M2_ROUNDS } from '../content/pitch';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';

/**
 * Module 2 — « معارف — معادلات جداء معدوم » :
 *   1. le terrain (2x − 3)(x + 1), règle en demis, puis la solution ligne à ligne (MethodSteps) ;
 *   2. la définition (brique taarif-muadala-jidaa) et un exemple : reconnaître une معادلة جداء معدوم ;
 *   2bis (LECTEUR seulement) : pourquoi (x + 1)² = 0 n'a qu'une solution (la manche carrée) ;
 *   3. la propriété (brique khassiya-jidaa-maadum, rappel) et les solutions = celles des deux équations (brique hulul-muadala-jidaa) ;
 *   4. l'équation (E) : factoriser fait apparaître un produit nul ;
 *   5. « ورقة كوثر » (`PeerSheet`, content/peerSheet.js) : la propriété appliquée à une SOMME.
 * Nombres de la plateforme (rollout 2026-11-11, verdict L2). LP : P1, P2, P3.
 *
 * LECTEUR DE MISSION : le labo se joue en MANCHES (content/pitch.js › M2_ROUNDS : la règle en demis COUVERTE (2x − 3)(x + 1), le carré (x + 1)², la
 * ورشة libre) ; l'étape 1 attend la manche 1, l'étape 2bis la manche 2. Hors lecteur : le terrain de la page inchangé.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const EXAMPLE3 = { source: KNOWLEDGE.source, exercise: KNOWLEDGE.examples[2], solution: KNOWLEDGE.example3 };

export default function Module02Maarif() {
  const player = useModulePlayer(MODULE_CTX);
  const [won, setWon] = useState({});
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [read3, setRead3] = useState(false);
  const [pins, setPins] = useState([]);
  const onTrial = (tr) => { if (tr?.xTex) setPins((all) => [...all.filter((u) => u.xTex !== tr.xTex), tr]); };
  const [q4a, setQ4a] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  return (
    <ContentModule
      objectives={["ماذا نسمّي معادلة طرفها الأول جداء عاملين وطرفها الثاني 0؟", "ما علاقة حلول هذه المعادلة بحلول معادلتين من الدرجة الأولى؟", "ماذا نفعل إذا لم يظهر الجداء في الطرف الأول؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — معادلات جداء معدوم"
      moduleSubtitle="تعريف، خاصية، ومثال محلول"
      estimatedTime="9 دقائق"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-vanish-m2" rounds={M2_ROUNDS} icon="⚽" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="vanishing-pitch"
              expr={KNOWLEDGE.example3Expr}
              levels={false}
              title={'ملعب ضلعاه ⁦2x − 3⁩ و ⁦x + 1⁩'}
              lead="ملعب جديد في الحيّ، ومسطرته مدرّجة بالأنصاف: مساحته جداء ضلعيه."
              onTrial={onTrial}
            />
          )}
        />
      )}
      steps={[
        {
          needsRound: { id: 'r1', label: 'الجولة 1', icon: '⚽', won: Boolean(won.r1) },
          num: 1, title: 'ما القيمتان اللتان وجدتهما؟', subtitle: 'المثال المحلول سطرًا سطرًا', done: read3,
          content: (
            <div className="space-y-3">
              {player ? (
                <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won.r1 ? 'font-bold text-emerald-900' : 'text-slate-500'}`} data-activity-evidence data-tried={won.r1 ? 'true' : 'false'}>
                  {won.r1
                    ? <><span aria-hidden="true">✓ </span><MathText>{'الجولة 1: اختفى الملعب $(2x - 3)(x + 1)$ عند قيمتين، وثبّتَّهما.'}</MathText></>
                    : 'الجولة 1: لم تثبّت بعد قيمتي الملعب المغطّى.'}
                </p>
              ) : (
                <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={pins.some((t) => t.ok) ? 'true' : 'false'}>
                  {pins.filter((t) => t.ok).length === 0
                    ? <p className="text-slate-500">لم تثبّت أي قيمة على المسطرة بعد: اختفى الملعب عند قيمتين، فابحث عنهما أعلاه.</p>
                    : (
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span>القيم التي ثبّتّها:</span>
                        {pins.filter((t) => t.ok).map((t) => (
                          <span key={t.xTex} dir="ltr" className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900"><MathText>{`$x = ${t.xTex}$`}</MathText></span>
                        ))}
                      </p>
                    )}
                </div>
              )}
              <p className="text-sm text-slate-700"><MathText>{'قارن قيمتيك بالسطور الآتية: أيّ معادلتين من الدرجة الأولى يبدأ بهما حلّ $(2x - 3)(x + 1) = 0$ ؟'}</MathText></p>
              <MethodSteps method={EXAMPLE3} onAllRevealed={() => setRead3(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'هل هي من الشكل نفسه؟', subtitle: 'تعريف معادلة جداء معدوم', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'المعادلة $(2x - 3)(x + 1) = 0$ التي حللتها على الملعب لها شكل معيّن. أيّ المعادلات الآتية من الشكل نفسه؟'}</MathText></p>}
                rows={[
                  { id: 'a', label: M('$(x - 2)(3x + 1) = 0$'), options: ['نعم', 'لا'], correct: 0, correction: M('جداء عاملين من الدرجة الأولى يساوي 0 : $a = 1$ ، $b = -2$ ، $c = 3$ ، $d = 1$ .') },
                  { id: 'b', label: M('$(x - 2)(3x + 1) = 5$'), options: ['نعم', 'لا'], correct: 1, correction: M('الطرف الثاني 5 وليس 0 : خاصية الجداء المعدوم لا تُطبَّق.') },
                  { id: 'c', label: M('$(x - 2) + (3x + 1) = 0$'), options: ['نعم', 'لا'], correct: 1, correction: M('الطرف الأول مجموع لا جداء: هي معادلة من الدرجة الأولى $4x - 1 = 0$ .') },
                  { id: 'd', label: M('$3x(x - 7) = 0$'), options: ['نعم', 'لا'], correct: 0, correction: M('جداء العاملين $3x$ و $(x - 7)$ يساوي 0 : هنا $b = 0$ في العامل $3x + 0$ .') },
                ]}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'شرطان: الطرف الأول جداء عاملين من الدرجة الأولى، والطرف الثاني $0$.'
                      : 'انظر إلى الطرفين: هل الأول جداء (لا مجموع)؟ وهل الثاني $0$ ؟'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="taarif-muadala-jidaa" lead="المعادلة التي حللتها بالملعب لها اسم:" />}
            </div>
          ),
        },
        ...(player ? [{
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚽', won: Boolean(won.r2) },
          num: 3, title: 'لماذا للمربّع حلّ واحد؟', subtitle: 'من ملعبك المربّع في الجولة 2', done: q2b,
          content: (
            <div className="space-y-3">
              <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won.r2 ? 'font-bold text-emerald-900' : 'text-slate-500'}`} data-activity-evidence data-tried={won.r2 ? 'true' : 'false'}>
                {won.r2
                  ? <><span aria-hidden="true">✓ </span><MathText>{'الجولة 2: الملعب المربّع $(x + 1)^2$ اختفى عند قيمة واحدة.'}</MathText></>
                  : 'الجولة 2: لم تثبّت بعد قيمة الملعب المربّع.'}
              </p>
              <TapQuestion
                prompt={<MathText>{'لماذا للمعادلة $(x + 1)^2 = 0$ حلّ واحد، بينما للمعادلة $(x + 1)(x + 2) = 0$ حلّان؟'}</MathText>}
                options={[
                  M('لأنّ مربّع عدد لا ينعدم أبدًا'),
                  M('لأنّ العاملين في $(x + 1)^2$ متساويان فينعدمان معًا عند $x = -1$ ، أمّا $x + 1$ و $x + 2$ فعاملان مختلفان'),
                  M('لأنّ المعادلة $(x + 1)^2 = 0$ من الدرجة الأولى'),
                ]}
                correct={1}
                cols={1}
                requires={['hulul-muadala-jidaa']}
                explain={<MathText>{'$(x + 1)^2 = (x + 1)(x + 1)$ : المعادلتان $x + 1 = 0$ و $x + 1 = 0$ هما المعادلة نفسها، وحلّها $-1$. أمّا $(x + 1)(x + 2) = 0$ فتعطي $-1$ و $-2$.'}</MathText>}
                onAnswered={() => setQ2b(true)}
              />
            </div>
          ),
        }] : []),
        {
          num: player ? 4 : 3, title: 'الخاصية وحلول المعادلة', subtitle: 'مثال', done: q2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khassiya-jidaa-maadum" variant="rappel" compact />
              <TapQuestion
                prompt={<MathText>{'لماذا $5x = 0$ يعني $x = 0$ ؟'}</MathText>}
                options={[
                  M('لأنّ $5x$ جداء العاملين 5 و $x$ ، و $5 \\neq 0$ ، فالعامل $x$ هو المعدوم'),
                  M('لأنّ $x = 5$ يحقّق المساواة'),
                  M('لأنّ العاملين 5 و $x$ معدومان معًا'),
                ]}
                correct={0}
                cols={1}
                requires={['khassiya-jidaa-maadum']}
                explain={<MathText>{`${KNOWLEDGE.examples[1]} — كما كتب بسّام: $x - 3 = 0$ بما أنّ $2 \\neq 0$.`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <TextbookBox kind="property" title={KNOWLEDGE.propertyTitle} lines={[...KNOWLEDGE.property, KNOWLEDGE.note]} source={KNOWLEDGE.source} compact />
                  <KnowledgeBrick id="hulul-muadala-jidaa" lead="الخاصية تحوّل معادلة جداء معدوم إلى معادلتين من الدرجة الأولى:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: player ? 5 : 4, title: 'المعادلة (E)', subtitle: 'معادلة تؤول إلى جداء معدوم', done: q4,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={ACTIVITY_C.text} source={ACTIVITY_C.source} compact />
              <TapQuestion
                prompt={<MathText>{`${ACTIVITY_C.questions[0]} ما العامل المشترك بين الحدّين؟`}</MathText>}
                options={[M('$(1 - 2x)$'), M('$(x - 5)$'), M('$6$')]}
                correct={1}
                cols={3}
                requires={['tahlil-amil']}
                explain={<MathText>{'العامل المشترك $(x - 5)$ : $(x - 5)[(1 - 2x) + 6] = (x - 5)(7 - 2x)$ ، وهو الطرف الثاني المعطى.'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              {q4a && (
                <TapQuestion
                  prompt={<MathText>{'حل المعادلة (E): $(1 - 2x)(x - 5) + 6(x - 5) = 0$ .'}</MathText>}
                  options={[M('$-5$ فقط'), M('$5$ و $\\dfrac{7}{2}$'), M('$-5$ و $-\\dfrac{7}{2}$'), M('$5$ و $-\\dfrac{2}{7}$')]}
                  correct={1}
                  cols={2}
                  requires={['hulul-muadala-jidaa']}
                  explain={<MathText>{'(E) تؤول إلى $(x - 5)(7 - 2x) = 0$ ، أي $x - 5 = 0$ أو $7 - 2x = 0$ : $x = 5$ أو $x = \\dfrac{7}{2}$ .'}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
            </div>
          ),
        },
        { num: player ? 6 : 5, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
