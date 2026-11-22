import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, METHOD_DIFF } from '../content/textbook';
import { parseNum } from '../content/exercises';

/**
 * Module 3 — طريقة « أحسب الفرق وأقرأ إشارته » (P2, P3). UNE SEULE PISTE (guide §4quater) : le MÊME labo que le module 1, posé SEUL en haut (`levels={false}`, monde `race`) — deux perles qui suivent
 * A(x) et B(x), la main tient x, l'aiguille lit A − B ; la main simplifie A − B puis remplit une carte d'ordre par région de x (paires `e1`, `e2`, `e3` de `logic/differenceMeter.js › PRESETS.race`).
 * Puis l'élève répond sur ce qu'il a fait, lit la méthode sur des nombres ligne à ligne (la brique est gardée par « أتوقّع القاعدة »), puis un transfert.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`DifferenceMeter › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q4, setQ4] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  const solved = (id) => trials.find((e) => e.kind === 'solved' && e.taskId === id);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['أقارن عددين ناطقين أو عبارتين حرفيتين بحساب الفرق وتعيين إشارته']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحسب الفرق وأقرأ إشارته"
      moduleSubtitle="عبارتان حرفيتان وحبّتان تتحرّكان"
      estimatedTime="14 دقيقة"
      intro={<Manipulation type="difference-meter" levels={false} world="race" onTrial={record} />}
      steps={[
        {
          num: 1, title: 'لماذا كانت B أكبر عند x = 0 ؟', subtitle: 'العبارة الأولى', done: answered('e1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="e1" ok={answered('e1')}
                done={<MathText>{'أجبتَ في المختبر: بسّطتَ $A-B=x-4$ ، فعند $x=0$ الفرق $-4$ سالب و $B$ أكبر، والحبّتان تتقابلان عند $x=4$ .'}</MathText>}
                todo="أنهِ المهمة الأولى (3x + 5 و 2x + 9) وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا لا تلتقي الحبّتان؟', subtitle: 'العبارة الثانية', done: answered('e2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="e2" ok={answered('e2')}
                done={<MathText>{'أجبتَ في المختبر: $A-B=5$ ثابت وموجب، فالإبرة لا تقف عند الصفر أبدًا و $A>B$ لكل $x$ .'}</MathText>}
                todo="أنهِ المهمة الثانية (2(x + 3) و 2x + 1) وأجب عن الأسئلة التي تظهر فوق المختبر." />
            </div>
          ),
        },
        {
          num: 3, title: 'العبارة الثالثة عند x = 10', subtitle: 'الفرق سالب', done: q3 && q3b,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="e3" ok={!!solved('e3')}
                done="في المهمة الثالثة عبرت الإبرة الصفر عند x = 3 ثم مالت إلى الجهة الأخرى."
                todo="أنهِ المهمة الثالثة (x² + 3 و x² + x) ثم عُد إلى هذا السؤال." />
              <NumericQuestion
                prompt={<MathText>{String.raw`في المهمة الثالثة: ما قيمة $A-B$ من أجل $x=10$ ؟`}</MathText>}
                expected={-7} display="-7" parse={parseNum}
                explain={<MathText>{'$A=10^2+3=103$ و $B=10^2+10=110$ ، والفرق $103-110=-7$ ؛ وبعد التبسيط $A-B=3-x=3-10=-7$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <TapQuestion
                  prompt={<MathText>{String.raw`فمن أجل $x=10$ :`}</MathText>}
                  options={[M('$A<B$ لأنّ $A-B=-7<0$'), M('$A>B$ لأنّ $A-B=-7$ ومقداره كبير'), M('$A=B$')]}
                  correct={0} cols={1}
                  explain={<MathText>{'الفرق سالب، إذن $A<B$ ؛ وهذا ما قالته الإبرة بعد أن عبرت الصفر عند $x=3$ .'}</MathText>}
                  onAnswered={() => setQ3b(true)}
                />
              )}
              {q3b && <KnowledgeBrick id="farq-ibaratayn" lead="الإبرة عبرت الصفر عند قيمة لـ x ثم غيّرت جهتها: كيف تقارن عبارتين لكل قيم x؟" />}
              {q3b && <TextbookBox kind="method" compact text={KNOWLEDGE.expr.text} source={KNOWLEDGE.expr.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'الطريقة على الأعداد', subtitle: 'ثم مثال جديد', done: q4,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_DIFF} onAllRevealed={() => setRead(true)} />
              {read && <TextbookBox kind="remark" compact text={KNOWLEDGE.pi.text} source={KNOWLEDGE.pi.source} />}
              <TapQuestion
                prompt={<MathText>{String.raw`قارن $\frac57$ و $\frac8{11}$ :`}</MathText>}
                options={[
                  M('$\\frac57-\\frac8{11}=-\\frac1{77}$ ، إذن $\\frac57<\\frac8{11}$'),
                  M('$\\frac57-\\frac8{11}=\\frac{-3}{-4}$ ، إذن $\\frac57>\\frac8{11}$'),
                  M('$\\frac57-\\frac8{11}=-\\frac1{77}$ ، إذن $\\frac57>\\frac8{11}$'),
                ]}
                correct={0} cols={1} requires={['hisab-farq']}
                explain={<MathText>{'$\\frac{55-56}{77}=-\\frac1{77}<0$ ، إذن $\\frac57<\\frac8{11}$ ؛ أمّا طرح البسطين وطرح المقامين فخطأ، وقراءة الإشارة معكوسة خطأ أيضًا.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
