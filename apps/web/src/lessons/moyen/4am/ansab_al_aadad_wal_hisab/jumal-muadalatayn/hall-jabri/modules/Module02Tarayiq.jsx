import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { MethodSteps, TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, METHOD_BOX, CHOICE } from '../content/textbook';
import { NOW_59 } from '../content/exercises';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — « طرائق » (FORMALIZE), sans labo (verdict L2.3) :
 *   1. un exemple résolu par التعويض, LIGNE À LIGNE (MethodSteps) → brique tariqat-tawid, et le contre-exemple « dans la même équation » (8 = 8) ;
 *   2. un exemple résolu par الجمع, ligne à ligne → brique tariqat-jam, puis l'encadré « طريقة » (mots de la plateforme) ;
 *   3. CHOISIR la méthode d'après les coefficients (P3) → brique ikhtiyar-tariqa : chaque distracteur affirme un fait FAUX sur la jumla ;
 *   4. « دوري » : deux jumal, chacune posée avec sa question ;
 *   5. « ورقة أسامة » (verdict X1 / L2.8) : avant d'additionner, un seul membre multiplié.
 * Exemples et « دوري » sur des jumal de la PLATEFORME (rollout 2026-11-12 : indépendance du manuel ; règle P : aucun moins devant une parenthèse).
 * Chaque question partage son écran avec ce qu'elle interroge (MethodSteps puis la question ; chaque ligne de choix redonne sa jumla). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const solutionOf = (m) => ({ source: m.source, exercise: m.exercise, solution: m.solution });

export default function Module02Tarayiq() {
  const [read1, setRead1] = useState(false);
  const [q1, setQ1] = useState(false);
  const [read2, setRead2] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [now, setNow] = useState({});
  const [peer, setPeer] = useState(false);
  const mark = (id) => () => setNow((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="طرائق — التعويض أو الجمع"
      moduleSubtitle="حل جملة معادلتين من الدرجة الأولى بمجهولين"
      objectives={['كيف تُحَلّ جملة بالتعويض سطرًا سطرًا؟', 'متى يكون الجمع أسرع من التعويض؟', 'كيف نختار الطريقة بالنظر إلى المعاملات؟']}
      estimatedTime="12 دقيقة"
      brief={{
        tag: 'طرائق', title: METHOD.title, tone: 'emerald',
        body: (
          <div className="space-y-2">
            <p><MathText>{METHOD.exercise}</MathText></p>
            <p className="text-sm text-slate-600">مثالان محلولان: الجملة (1) بالتعويض، والجملة (2) بالجمع. اقرأ كل سطر، وحاول توقّع السطر التالي قبل أن تكشفه — هي الحركات نفسها التي قمت بها على البطاقتين.</p>
          </div>
        ),
      }}
      steps={[
        {
          num: 1, title: 'الجملة (1) بالتعويض', subtitle: 'الحلّ سطرًا سطرًا', done: read1 && q1,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="takhallus-majhul" variant="rappel" compact />
              <div className="space-y-3" data-paging-keep>
                <MethodSteps method={solutionOf(METHOD.one)} onAllRevealed={() => setRead1(true)} />
                {read1 && (
                  <TapQuestion
                    prompt={<MathText>{'لو عوّضنا $x$ بالعبارة $8 + 2y$ في المعادلة $x - 2y = 8$ نفسها التي أخذناها منها، لوجدنا:'}</MathText>}
                    options={[M('$(8 + 2y) - 2y = 8$ ، أي $8 = 8$ : مساواة صحيحة دائمًا لا تحدّد $y$'), M('$y = 8$'), M('$x = 8$')]}
                    correct={0}
                    cols={1}
                    explain={<MathText>{'يختفي $y$ ويبقى $8 = 8$ . لهذا نعوّض في المعادلة الأخرى $4x + y = 5$ .'}</MathText>}
                    onAnswered={() => setQ1(true)}
                  />
                )}
              </div>
              {q1 && <KnowledgeBrick id="tariqat-tawid" lead="ما فعلناه في الجملة (1):" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الجملة (2) بالجمع', subtitle: 'الحلّ سطرًا سطرًا', done: read2 && q2,
          content: (
            <div className="space-y-3">
              <div className="space-y-3" data-paging-keep>
                <MethodSteps method={solutionOf(METHOD.two)} onAllRevealed={() => setRead2(true)} />
                {read2 && (
                  <TapQuestion
                    prompt={<MathText>{'في الجملة (2) جمعنا المعادلتين مباشرة دون ضرب في عدد، لأنّ:'}</MathText>}
                    options={[M('معاملي $x$ متعاكسان: $3x$ و $-3x$'), M('معاملي $y$ متعاكسان'), M('الطرفين الثانيين موجبان')]}
                    correct={0}
                    cols={1}
                    explain={<MathText>{'$3x + (-3x) = 0$ : يختفي $x$ ويبقى $2y + 5y = 11 + 10$ أي $7y = 21$ . أمّا $2y$ و $5y$ فليسا متعاكسين، وإشارة الطرفين الثانيين لا تُلغي شيئًا.'}</MathText>}
                    onAnswered={() => setQ2(true)}
                  />
                )}
              </div>
              {q2 && <KnowledgeBrick id="tariqat-jam" lead="ما فعلناه في الجملة (2):" />}
              {q2 && <TextbookBox kind="method" title={METHOD_BOX.title} lines={[METHOD_BOX.text, ...METHOD_BOX.items]} source={METHOD_BOX.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'أيّ طريقة نختار؟', subtitle: 'ننظر إلى المعاملات', done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">لكل جملة، اختر الطريقة الأنسب مع سببها الصحيح:</p>}
                rows={CHOICE.rows.map((row) => ({
                  id: row.id, label: M(`$${row.tex}$`), options: row.options.map((o) => M(o)), correct: row.correct, correction: M(row.correction),
                }))}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight ? CHOICE.rule : 'اقرأ المعاملات قبل أن تختار: هل يوجد معامل يساوي $1$ أو $-1$ ؟ هل يوجد معاملان متعاكسان؟'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="ikhtiyar-tariqa" lead="الطريقتان تصلان إلى الحل نفسه؛ الفرق في طول الطريق:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'دوري', done: NOW_59.every((ex) => now[ex.id]),
          content: (
            <div className="space-y-3">
              {NOW_59.map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-tawid', 'tariqat-jam', 'ikhtiyar-tariqa']} onAnswered={mark(ex.id)} />)}
            </div>
          ),
        },
        {
          num: 5, title: 'ورقة زميل', subtitle: 'جد الخطأ وصحّحه', done: peer,
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={() => setPeer(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
