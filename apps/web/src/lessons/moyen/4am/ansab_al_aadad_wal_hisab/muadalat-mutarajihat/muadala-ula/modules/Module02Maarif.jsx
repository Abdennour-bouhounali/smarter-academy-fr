import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, MethodSteps, FractionQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks, useStudentPlayer } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { M2_ROUNDS } from '../content/balances';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 2 — « معارف — كيس واحد وحده » : « المعادلة من الدرجة الأولى بمجهول واحد ».
 *   1. la balance de 4x + 1 = x + 8 OUVRE le module (des sacs dans LES DEUX plateaux, un sac qui ne contient pas un nombre entier) ;
 *   2. la propriété posée en « أتوقّع القاعدة » (hal-ax-b) : ax = b, a ≠ 0, solution b/a ;
 *   3. un coefficient négatif (le signe dans b/a) ;
 *   4. « ورقة أيوب » (content/peerSheet.js) : ne diviser qu'un seul terme.
 * Plus aucun nombre ni mot du manuel (rollout 2026-11-11, verdict X1/X2). LP : P1, P2.
 *
 * LECTEUR DE MISSION (verdict L1) : le labo se joue en MANCHES (content/balances.js › M2_ROUNDS : 4x + 3 = 6x → 4x + 1 = x + 8 → défi ⭐ → balance libre) ;
 * l'étape 1 attend la manche 2 et pose la ligne des étapes de l'élève avec la question ; la page garde son labo et son exemple lu ligne à ligne.
 */
export default function Module02Maarif() {
  const player = useStudentPlayer();
  const [tried, setTried] = useState(null);
  const [won, setWon] = useState({});
  const [q1, setQ1] = useState(false);
  const [read, setRead] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q5, setQ5] = useState(false);

  const stepQuestion = (
    <TapQuestion
      prompt={<MathText>{'من $3x + 1 = 8$ إلى $3x = 7$ : ما العملية التي أُجريت على الطرفين؟'}</MathText>}
      options={[
        <MathText key="a">{'طرحنا 1 من الطرفين'}</MathText>,
        <MathText key="b">{'أضفنا 1 إلى الطرفين'}</MathText>,
        <MathText key="c">{'نقلنا 1 إلى الطرف الآخر كما هو: $3x = 8 + 1$'}</MathText>,
      ]}
      correct={0}
      cols={1}
      requires={['muadala-tarafayn']}
      explain={<MathText>{'$3x + 1 - 1 = 8 - 1$ أي $3x = 7$ — على الميزان: كرة واحدة تُؤخذ من كل كفّة. ثم $x = \\dfrac{7}{3}$ : كرتان وثلث الكرة في كل كيس.'}</MathText>}
      onAnswered={() => setQ2(true)}
    />
  );

  return (
    <ContentModule
      objectives={["ماذا يحدث في آخر خطوة من كل ميزان؟", "كيف نكتب حلّ المعادلة ax = b؟", "ماذا يتغيّر عندما يكون المعامل سالبًا؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — كيس واحد وحده"
      moduleSubtitle="الشكل الذي تؤول إليه كل معادلة من الدرجة الأولى"
      estimatedTime="8 دقائق"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-balance-m2" rounds={M2_ROUNDS} icon="⚖️" freeIcon="🏟️"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <Manipulation
              type="equation-balance"
              eq="4x+1=x+8"
              levels={false}
              title={'ميزان: ⁦4x + 1 = x + 8⁩'}
              lead="أربعة أكياس وكرة في كفّة، وكيس و 8 كرات في الكفّة الأخرى."
              onTrial={setTried}
            />
          )}
        />
      )}
      steps={[
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '⚖️', won: Boolean(won.r2) },
          num: 1, title: 'اقرأ خطواتك', subtitle: player ? 'من ميزانك في الجولة 2' : 'المثال المحلول — سطرًا سطرًا', done: player ? q2 : read && q2,
          content: player ? (
            <div className="space-y-3">
              <p className={`rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ${won.r2 ? 'font-bold text-emerald-900' : 'text-slate-500'}`} data-activity-evidence data-evidence="r2" data-tried={won.r2 ? 'true' : 'false'}>
                <MathText>{won.r2 ? '✓ الجولة 2: من $4x + 1 = x + 8$ وصلتَ إلى $3x = 7$ ثم إلى $x = \\dfrac{7}{3}$ .' : 'الجولة 2: لم تعرف بعد ما في الكيس الواحد.'}</MathText>
              </p>
              {stepQuestion}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={tried && tried.steps.length ? 'true' : 'false'}>
                {!tried || tried.steps.length === 0 ? (
                  <p className="text-slate-500">لم تكتب أي خطوة على الميزان بعد: حلّ المعادلة في الأعلى ثم قارن بالمثال المحلول.</p>
                ) : (
                  <ol className="space-y-1" data-evidence="steps">
                    <li className="font-bold"><MathText>{`$${tried.equation}$`}</MathText></li>
                    {tried.steps.map((st, i) => (
                      <li key={i} data-evidence-step={i}><MathText>{`أي $${st.result}$`}</MathText></li>
                    ))}
                  </ol>
                )}
              </div>
              <MethodSteps method={{ source: KNOWLEDGE.source, ...KNOWLEDGE.exampleLines }} onAllRevealed={() => setRead(true)} />
              {read && stepQuestion}
            </div>
          ),
        },
        {
          num: 2, title: 'الخاصية', subtitle: 'المعادلة ax = b', done: q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="muadala-tarafayn" variant="rappel" compact />
              {/* La propriété ÉNONCE la règle hal-ax-b : l'élève la prédit d'abord. */}
              <PredictRule id="hal-ax-b"><TextbookBox kind="property" text={KNOWLEDGE.property} source={KNOWLEDGE.source} compact /></PredictRule>
              <TapQuestion
                prompt={<MathText>{'ما الحل الوحيد للمعادلة $8x = 3$؟'}</MathText>}
                options={[
                  <MathText key="a">{'$\\dfrac{3}{8}$'}</MathText>,
                  <MathText key="b">{'$\\dfrac{8}{3}$'}</MathText>,
                  <MathText key="c">{'$-5$'}</MathText>,
                  <MathText key="d">{'$24$'}</MathText>,
                ]}
                correct={0}
                cols={4}
                requires={['muadala-tarafayn']}
                explain={<MathText>{'$a = 8$ و $b = 3$ : الحل $\\dfrac{b}{a} = \\dfrac{3}{8}$ ، وللتحقّق $8 \\times \\dfrac{3}{8} = 3$. أمّا $\\dfrac{8}{3}$ فهو $\\dfrac{a}{b}$ ، و $-5 = 3 - 8$ طرح لا قسمة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="hal-ax-b" lead="آخر خطوة في كل ميزان: كيس واحد وحده، أي القسمة على عدد الأكياس." />}
            </div>
          ),
        },
        {
          num: 3, title: 'معامل سالب', subtitle: 'الإشارة في b/a', done: q3,
          content: (
            <FractionQuestion
              prompt={<MathText>{'حلّ المعادلة $-4x = 10$ : $x = $'}</MathText>}
              expected="-5/2"
              requireIrreducible={false}
              requires={['hal-ax-b']}
              explain={'$a = -4$ و $b = 10$ : $x = \\dfrac{10}{-4} = -\\dfrac{5}{2}$ ، وللتحقّق $-4 \\times \\left(-\\dfrac{5}{2}\\right) = 10$.'}
              onAnswered={() => setQ3(true)}
            />
          ),
        },
        {
          num: 4, title: 'ورقة زميل: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q5,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ5(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
