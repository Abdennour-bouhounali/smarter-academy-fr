import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY_C } from '../content/textbook';
import SquaresCompare from '../components/SquaresCompare';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — نشاط 4 (p. 21) : مجموع جذرين تربيعيين وفرقهما.
 * Après le produit et le quotient, la tentation : « et pour + et − ? ».
 * L'élève CALCULE d'abord (16 + 9, puis 100 − 36), puis voit son calcul
 * dessiné (SquaresCompare : les carrés quadrillés et leurs côtés bout à bout),
 * puis tranche le cas général (ب). La remarque n'est NOMMÉE qu'ensuite
 * (KnowledgeBrick la-tawzi-jam). LP : P3.
 */
const m = (tex) => <MathText key={tex}>{tex}</MathText>;

export default function Module02Majmu() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  // « ورقة ياسمين » (`PeerSheet`, content/peerSheet.js) — rollout mission 2026-11-10 : la racine « distribuée » sur une somme, à trouver et corriger
  const [q4, setQ4] = useState(false);
  const { sum, difference } = ACTIVITY_C;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="نشاط 4 — مجموع جذرين وفرقهما"
      moduleSubtitle="هل يتوزّع الجذر على الجمع والطرح؟"
      estimatedTime="8 دقائق"
      objectives={['هل يتوزّع الجذر التربيعي على الجمع؟', 'وهل يتوزّع على الطرح؟', 'ماذا يكفي لنفي مساواة: مثال واحد أم أمثلة كثيرة؟']}
      brief={{
        tag: 'نشاط',
        title: ACTIVITY_C.subtitle,
        tone: 'rose',
        body: <p>رأيت أن جذر جداء هو جداء الجذرين، وأن جذر حاصل قسمة هو حاصل قسمة الجذرين. فهل يحدث الشيء نفسه مع المجموع والفرق؟ احسب قبل أن تجيب.</p>,
        footer: <SourceTag source={ACTIVITY_C.source} />,
      }}
      steps={[
        {
          num: 1, title: 'أ) المجموع: 16 و 9', done: q1,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY_C.questions[0]}</MathText></p>}
                rows={[
                  { id: 's1', label: m('$\\sqrt{16 + 9}$'), options: ['$7$', '$5$', '$25$'].map(m), correct: 1, correction: m('$\\sqrt{16 + 9} = \\sqrt{25} = 5$') },
                  { id: 's2', label: m('$\\sqrt{16} + \\sqrt{9}$'), options: ['$5$', '$25$', '$7$'].map(m), correct: 2, correction: m('$4 + 3 = 7$') },
                  { id: 's3', label: 'ماذا تستنتج؟', options: ['$\\sqrt{16 + 9} = \\sqrt{16} + \\sqrt{9}$', '$\\sqrt{16 + 9} \\neq \\sqrt{16} + \\sqrt{9}$'].map(m), correct: 1 },
                ]}
                requires={['jidhr-taarif']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'$5 \\neq 7$'}</MathText>: الجذر التربيعي لمجموع ليس مجموع الجذرين.</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <SquaresCompare a={sum.a} b={sum.b} op="+" />}
            </div>
          ),
        },
        {
          num: 2, title: 'أ) الفرق: 100 و 36', done: q2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY_C.questions[1]}</MathText></p>}
                rows={[
                  { id: 'd1', label: m('$\\sqrt{100 - 36}$'), options: ['$8$', '$4$', '$64$'].map(m), correct: 0, correction: m('$\\sqrt{100 - 36} = \\sqrt{64} = 8$') },
                  { id: 'd2', label: m('$\\sqrt{100} - \\sqrt{36}$'), options: ['$8$', '$4$', '$64$'].map(m), correct: 1, correction: m('$10 - 6 = 4$') },
                  { id: 'd3', label: 'ماذا تستنتج؟', options: ['$\\sqrt{100 - 36} \\neq \\sqrt{100} - \\sqrt{36}$', '$\\sqrt{100 - 36} = \\sqrt{100} - \\sqrt{36}$'].map(m), correct: 0 },
                ]}
                requires={['jidhr-taarif']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{'$8 \\neq 4$'}</MathText>: الجذر التربيعي لفرق ليس فرق الجذرين.</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <SquaresCompare a={difference.a} b={difference.b} op="-" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ب) في الحالة العامة', subtitle: 'عددان موجبان، الأول أكبر من الثاني أو يساويه', done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{ACTIVITY_C.questions[2]}</MathText></p>}
                rows={[
                  {
                    id: 'g1', label: m('$\\sqrt{a + b} = \\sqrt{a} + \\sqrt{b}$'),
                    options: ['دائمًا', 'فقط إذا كان $a = 0$ أو $b = 0$', 'فقط إذا كان $a = b$'].map(m), correct: 1,
                    correction: m('نربّع الطرفين: $a + b = a + b + 2\\sqrt{a}\\sqrt{b}$ ، أي $\\sqrt{a}\\sqrt{b} = 0$.'),
                  },
                  {
                    id: 'g2', label: m('$\\sqrt{a - b} = \\sqrt{a} - \\sqrt{b}$'),
                    options: ['فقط إذا كان $b = 0$ أو $a = b$', 'دائمًا', 'فقط إذا كان $a = 0$'].map(m), correct: 0,
                    correction: m('نربّع الطرفين: $a - b = a + b - 2\\sqrt{a}\\sqrt{b}$ ، أي $\\sqrt{b}(\\sqrt{a} - \\sqrt{b}) = 0$.'),
                  },
                ]}
                requires={['jidhr-taarif', 'murabba-jidhr']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{'مثال مضاد واحد يكفي لنفي «دائمًا»: $16 + 9$ ثم $100 - 36$.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <KnowledgeBrick id="la-tawzi-jam" lead="هذا ما وجدته بالحساب، نكتبه قاعدة:" />
              )}
            </div>
          ),
        },
        { num: 4, title: 'ورقة زميلة: أين الخطأ؟', subtitle: 'جد السطر الخاطئ وصحّحه', done: q4,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setQ4(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
